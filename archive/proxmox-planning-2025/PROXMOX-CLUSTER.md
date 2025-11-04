# Proxmox Cluster Configuration

## Overview
This document outlines the architecture, configuration, and operational procedures for the Proxmox VE high-availability cluster.

> **Note:** This documentation uses a **simplified 4-VLAN design** for optimal balance of security and simplicity. For complete network details, see [NETWORK.md](./NETWORK.md) and [IP-MIGRATION-GUIDE.md](./IP-MIGRATION-GUIDE.md).
> - **VLAN 1:** Infrastructure (10.0.1.0/24)
> - **VLAN 16:** Management - Proxmox + Talos (10.8.16.0/24)
> - **VLAN 28:** Workloads - Pods + LoadBalancer (10.8.28.0/22)
> - **VLAN 48:** Storage - Ceph (10.8.48.0/24, MTU 9000)

---

## Cluster Architecture

### Cluster Summary
| Parameter | Value |
|-----------|-------|
| **Cluster Name** | homelab-pve-cluster |
| **Node Count** | 3 nodes |
| **Quorum Type** | Corosync with distributed voting |
| **Expected Votes** | 3 |
| **Required Quorum** | 2 (simple majority) |
| **HA Services** | Enabled |
| **Shared Storage** | Ceph RBD |

### Node Roles

| Node | Primary Role | Secondary Role | Priority |
|------|--------------|----------------|----------|
| pve-ms01-01 | Compute + Storage | Ceph OSD/MON | High |
| pve-ms01-02 | Compute + Storage | Ceph OSD/MON | High |
| pve-aimax-01 | Compute + AI Workloads | Ceph OSD/MON | Medium |

---

## High Availability Configuration

### Quorum and Fencing

#### Corosync Configuration
```yaml
Cluster Name: homelab-pve-cluster
Corosync Transport: knet (Kronosnet)
Corosync Ring: VLAN 20 (10.20.20.0/24)
Expected Votes: 3
Quorum Provider: corosync_votequorum
```

#### Fencing Strategy
| Method | Device | Configuration |
|--------|--------|---------------|
| **Primary** | vPro/AMT (MS-01s) | Network-based fencing via AMT |
| **Secondary** | BMC/IPMI (AMD AI Max) | IPMI fencing for power control |
| **Watchdog** | Software watchdog | Kernel-level watchdog timer |

**Note:** Fencing is critical for HA to prevent split-brain scenarios.

---

### HA Groups and Policies

#### HA Groups
| Group Name | Nodes | Restrictions | Priority |
|------------|-------|--------------|----------|
| production | all | None | High |
| ai-workloads | pve-aimax-01 | Restricted to AI Max | High |
| general | pve-ms01-01, pve-ms01-02 | MS-01 nodes only | Medium |

#### HA Policies
```
Default Policy: conditional (migrate on node failure)
Backup Policy: Automatically migrate to available node
State: request_start
Max Relocate: 1 (prevent ping-pong migrations)
```

---

## Storage Architecture

### Storage Strategy

#### Overview
The cluster will use **Ceph** for distributed block storage, providing:
- **Redundancy:** 3-way replication across nodes
- **Performance:** Distributed I/O across NVMe drives
- **High Availability:** VMs can run on any node with shared storage
- **Scalability:** Easy expansion with additional OSDs

### Ceph Cluster Design

#### Ceph Components
| Component | Quantity | Location | Purpose |
|-----------|----------|----------|---------|
| **Monitor (MON)** | 3 | All nodes | Cluster state and quorum |
| **Manager (MGR)** | 3 (1 active, 2 standby) | All nodes | Cluster management and metrics |
| **OSD (Object Storage Daemon)** | 6+ | All nodes | Data storage on NVMe drives |
| **MDS (Metadata Server)** | Optional | All nodes | CephFS metadata (if using CephFS) |

#### OSD Distribution (Planned)

##### pve-ms01-01
| OSD | Device | Size | Type | Pool |
|-----|--------|------|------|------|
| osd.0 | /dev/nvme0n1 | 2TB | NVMe Gen4 | System VMs |
| osd.1 | /dev/nvme1n1 | 4TB | NVMe Gen4 | Data VMs |

##### pve-ms01-02
| OSD | Device | Size | Type | Pool |
|-----|--------|------|------|------|
| osd.2 | /dev/nvme0n1 | 2TB | NVMe Gen4 | System VMs |
| osd.3 | /dev/nvme1n1 | 4TB | NVMe Gen4 | Data VMs |

##### pve-aimax-01
| OSD | Device | Size | Type | Pool |
|-----|--------|------|------|------|
| osd.4 | TBD | TBD | TBD | TBD |
| osd.5 | TBD | TBD | TBD | TBD |

#### Ceph Network Configuration
```
Public Network (Client): VLAN 16 - 10.8.16.0/24 (Management)
Cluster Network (Storage): VLAN 48 - 10.8.48.0/24 (10G bonded, MTU 9000)
```

**Recommendation:** Separate public (client) and cluster (replication) networks for optimal performance. We use VLAN 16 for client access and VLAN 48 for Ceph internal traffic.

---

### Ceph Pools

#### Pool Configuration (Proposed)
| Pool Name | Replication | Min Size | PG Count | Purpose |
|-----------|-------------|----------|----------|---------|
| vm-disks | 3 | 2 | 128 | VM root disks |
| vm-data | 3 | 2 | 256 | VM data disks |
| backups | 2 | 1 | 64 | VM backups (lower redundancy OK) |

#### CRUSH Rules
- **Default Rule:** Distribute replicas across different hosts (failure domain: host)
- **Datacenter Rule (future):** Distribute across physical locations if expanded

---

### Local Storage

Each node will also have local storage for:
- Proxmox VE system installation (ZFS on first NVMe)
- ISO images and templates (local shared directory)
- Temporary files and swap

| Node | Local Storage | Size | Purpose |
|------|---------------|------|---------|
| pve-ms01-01 | local-zfs | ~500GB | Proxmox system + ISOs |
| pve-ms01-02 | local-zfs | ~500GB | Proxmox system + ISOs |
| pve-aimax-01 | local-zfs | TBD | Proxmox system + ISOs |

---

## VM Placement Strategy

### Resource Allocation

#### pve-ms01-01 (Intel i9-13900H, 96GB RAM)
| Resource | Total | Reserved for Proxmox | Available for VMs |
|----------|-------|----------------------|-------------------|
| CPU Cores | 14C/20T | 2 cores | 12C/18T |
| RAM | 96GB | 8GB | 88GB |
| Storage | 6TB NVMe | 500GB (system) | 5.5TB (Ceph) |

#### pve-ms01-02 (Intel i9-13900H, 96GB RAM)
| Resource | Total | Reserved for Proxmox | Available for VMs |
|----------|-------|----------------------|-------------------|
| CPU Cores | 14C/20T | 2 cores | 12C/18T |
| RAM | 96GB | 8GB | 88GB |
| Storage | 6TB NVMe | 500GB (system) | 5.5TB (Ceph) |

#### pve-aimax-01 (AMD AI Max - TBD)
| Resource | Total | Reserved for Proxmox | Available for VMs |
|----------|-------|----------------------|-------------------|
| CPU Cores | TBD | TBD | TBD |
| RAM | TBD | TBD | TBD |
| Storage | TBD | TBD | TBD |
| GPU/AI Accelerator | TBD | N/A | TBD (GPU passthrough) |

---

### VM Workload Distribution

#### Kubernetes Cluster (Talos OS)

**Primary Workload:** 3-node Kubernetes cluster running on Talos Linux

| VM Name | VM ID | Host | vCPUs | RAM | Disk | Network | HA |
|---------|-------|------|-------|-----|------|---------|-----|
| talos-k8s-01 | 101 | pve-ms01-01 | 8 | 16GB | 100GB (Ceph) | 2x VirtIO (VLANs 16,28) | No* |
| talos-k8s-02 | 102 | pve-ms01-02 | 8 | 16GB | 100GB (Ceph) | 2x VirtIO (VLANs 16,28) | No* |
| talos-k8s-03 | 103 | pve-aimax-01 | 8 | 16GB | 100GB (Ceph) | 2x VirtIO (VLANs 16,28) | No* |

**\*Note:** Proxmox HA is typically disabled for Kubernetes nodes since K8s handles its own HA at the application layer. However, you could enable it for automatic VM restart on node failure.

**Kubernetes Layer HA:**
- 3-node control plane provides Kubernetes API high availability
- Workload pods distributed across all 3 nodes
- If one Proxmox host fails, Kubernetes reschedules pods to surviving nodes
- etcd quorum maintained with 3 control plane nodes

**Network Configuration (Simplified):**
- **eth0 (VLAN 16):** Talos API / kubectl access (10.8.16.20-22)
- **eth1 (VLAN 28):** Pod network + MetalLB LoadBalancer (10.8.28.0/22)
  - Node 1 pods: 10.8.28.0/24
  - Node 2 pods: 10.8.29.0/24
  - Node 3 pods: 10.8.30.0/24
  - LoadBalancer pool: 10.8.31.10-200

**Resource Justification:**
- **8 vCPUs:** Sufficient for control plane (2-4 vCPUs) + worker workloads (4-6 vCPUs)
- **16GB RAM:** Control plane (~4GB) + worker pods (~10GB) + overhead (~2GB)
- **100GB Disk:** OS (~2GB), container images (~10GB), local volumes (~88GB)

See [KUBERNETES-TALOS.md](./KUBERNETES-TALOS.md) for complete Kubernetes documentation.

---

#### Additional VMs (Planned)
| VM Name | vCPUs | RAM | Disk | Preferred Node | HA Group |
|---------|-------|-----|------|----------------|----------|
| docker-host-01 | 4 | 8GB | 100GB | pve-ms01-01 | general |
| postgres-01 | 4 | 16GB | 200GB | pve-ms01-02 | production |
| k8s-control-03 | 4 | 8GB | 100GB | pve-aimax-01 | production |
| db-postgres-01 | 8 | 16GB | 500GB | pve-ms01-01 | production |

#### AI/ML Workloads (GPU Passthrough)
| VM Name | vCPUs | RAM | Disk | Preferred Node | GPU |
|---------|-------|-----|------|----------------|-----|
| ai-training-01 | TBD | TBD | TBD | pve-aimax-01 | Full GPU passthrough |
| ai-inference-01 | TBD | TBD | TBD | pve-aimax-01 | vGPU (if supported) |

#### General Workloads
| VM Name | vCPUs | RAM | Disk | Preferred Node | HA |
|---------|-------|-----|------|----------------|-----|
| docker-host-01 | 8 | 32GB | 500GB | pve-ms01-01 | No |
| media-server | 4 | 16GB | 2TB | pve-ms01-02 | No |

---

## Cluster Communication

### Corosync Ring Configuration

```
Ring 0: VLAN 20 (10.20.20.0/24)
  - pve-ms01-01: 10.20.20.10
  - pve-ms01-02: 10.20.20.11
  - pve-aimax-01: 10.20.20.12

Transport: knet (default for Proxmox 7+)
Port: 5405 (default)
Multicast: No (use unicast for reliability)
```

### Required Open Ports

#### Proxmox Cluster
| Port | Protocol | Purpose |
|------|----------|---------|
| 22 | TCP | SSH |
| 8006 | TCP | Proxmox Web UI (HTTPS) |
| 5900-5999 | TCP | VNC console for VMs |
| 3128 | TCP | SPICE proxy |
| 111 | TCP/UDP | RPC |
| 5404-5405 | UDP | Corosync |

#### Ceph Cluster
| Port | Protocol | Purpose |
|------|----------|---------|
| 6789 | TCP | Ceph Monitor |
| 6800-7300 | TCP | Ceph OSDs |
| 8443 | TCP | Ceph Manager dashboard |

---

## Backup Strategy

### Backup Configuration

#### Backup Schedule
| Schedule | VMs | Retention | Mode | Destination |
|----------|-----|-----------|------|-------------|
| Daily 2AM | Production VMs | 7 days | Snapshot | Ceph pool: backups |
| Weekly Sunday 3AM | All VMs | 4 weeks | Stop mode | External NFS/USB |
| Monthly 1st @ 4AM | Critical VMs | 6 months | Snapshot | Off-site storage |

#### Backup Tools
- **Proxmox VE Backup (vzdump):** Built-in backup solution
- **PBS (Proxmox Backup Server):** Optional dedicated backup VM
- **Restic/Borg:** For off-site encrypted backups

---

## Monitoring and Alerting

### Built-in Monitoring
- **Proxmox Web UI:** Real-time graphs for CPU, RAM, network, disk I/O
- **Ceph Dashboard:** Ceph cluster health, OSD status, pool usage
- **Email Alerts:** Configure SMTP for cluster events

### Advanced Monitoring (Optional)
| Tool | Purpose | Installation |
|------|---------|--------------|
| **Prometheus** | Metrics collection | Docker container or VM |
| **Grafana** | Visualization dashboards | Docker container or VM |
| **Loki** | Log aggregation | Docker container or VM |
| **Alertmanager** | Alert routing and grouping | Docker container or VM |

### Key Metrics to Monitor
- Cluster quorum status
- Node CPU/RAM/disk usage
- Ceph cluster health (HEALTH_OK, HEALTH_WARN, HEALTH_ERR)
- OSD status (up/down, in/out)
- VM resource consumption
- Storage pool usage and IOPS
- Network throughput on storage network

---

## Maintenance Procedures

### Routine Maintenance

#### Monthly Tasks
- [ ] Review Ceph cluster health
- [ ] Check for Proxmox updates
- [ ] Verify backup integrity (restore test)
- [ ] Review VM resource allocation
- [ ] Clean up old snapshots and backups

#### Quarterly Tasks
- [ ] Update Proxmox VE and Ceph packages
- [ ] Firmware updates (BIOS, NIC, BMC)
- [ ] Review and optimize VM placement
- [ ] Capacity planning review

---

### Node Maintenance Mode

#### Steps to Put Node in Maintenance
```bash
# 1. Migrate all VMs off the node
pvesh create /nodes/{node}/qemu/{vmid}/migrate --target {target_node}

# 2. Disable HA services on the node
ha-manager set vm:{vmid} --state disabled

# 3. Stop Ceph OSD services (if draining OSDs)
systemctl stop ceph-osd@{osd-id}
ceph osd out {osd-id}

# 4. Verify no VMs running
qm list

# 5. Perform maintenance
```

#### Return from Maintenance
```bash
# 1. Start Ceph OSDs
ceph osd in {osd-id}
systemctl start ceph-osd@{osd-id}

# 2. Re-enable HA services
ha-manager set vm:{vmid} --state started

# 3. Rebalance VMs if needed
```

---

## Disaster Recovery

### Failure Scenarios

#### Single Node Failure
- **Impact:** Cluster remains operational with 2/3 quorum
- **Actions:** VMs automatically migrate to surviving nodes (if HA enabled)
- **Recovery:** Fix failed node, rejoin to cluster, rebalance VMs

#### Two Node Failure
- **Impact:** Cluster loses quorum, no automatic failover
- **Actions:** Manual intervention required
- **Recovery:** Bring at least one node back online to restore quorum

#### Complete Cluster Failure
- **Impact:** All nodes down
- **Actions:** Restore from backups
- **Recovery:**
  1. Rebuild cluster from scratch
  2. Restore Ceph configuration
  3. Restore VMs from backups

### Backup Restoration

#### Restore VM from Backup
```bash
# List available backups
vzdump list

# Restore VM
qmrestore /path/to/backup.vma.zst {vmid} --storage {storage}

# Start restored VM
qm start {vmid}
```

---

## Cluster Expansion

### Adding a Fourth Node

#### Prerequisites
- Compatible hardware
- Network connectivity (VLANs 20, 30)
- Proxmox VE installed
- Corosync/Ceph packages installed

#### Steps
```bash
# 1. On new node, join the cluster
pvecm add {existing-node-ip}

# 2. Add Ceph monitor
pveceph mon create

# 3. Add Ceph OSDs
pveceph osd create /dev/sdX

# 4. Configure networking (VLANs, bonds)

# 5. Add to HA groups
ha-manager groupadd {group-name} --nodes {new-node}

# 6. Rebalance VMs
```

---

## Security Considerations

### Access Control
- **Role-Based Access Control (RBAC):** Define user roles and permissions
- **Two-Factor Authentication (2FA):** Enable for Proxmox web UI
- **SSH Key Authentication:** Disable password auth, use SSH keys only
- **Firewall:** Restrict access to management ports (8006, 22)

### Network Isolation
- **VLAN Segmentation:** Isolate management, storage, and VM networks
- **No Internet on Storage VLAN:** Storage network should be air-gapped
- **Firewall Rules:** Only allow necessary inter-VLAN communication

### Backup Security
- **Encryption:** Encrypt backups at rest and in transit
- **Off-Site Storage:** Store backups in geographically separate location
- **Access Control:** Restrict backup access to admin users only

---

## Troubleshooting

### Common Issues

#### Quorum Lost
**Symptoms:** Cluster shows "no quorum" warning
**Causes:** Node(s) unreachable, network partition, corosync failure
**Resolution:**
```bash
# Check cluster status
pvecm status

# Check corosync
systemctl status corosync

# If needed, force quorum (DANGER: only if you know what you're doing)
pvecm expected 1
```

#### Ceph Health Warning
**Symptoms:** Ceph dashboard shows HEALTH_WARN or HEALTH_ERR
**Causes:** OSD down, PG inconsistent, replication issues
**Resolution:**
```bash
# Check Ceph status
ceph status
ceph health detail

# Check OSD status
ceph osd tree

# Restart failed OSD
systemctl restart ceph-osd@{osd-id}
```

#### VM Won't Migrate
**Symptoms:** Live migration fails
**Causes:** Incompatible CPU, local storage, network issues
**Resolution:**
```bash
# Check migration prerequisites
qm migrate {vmid} {target-node} --online --check

# Use offline migration if needed
qm migrate {vmid} {target-node}
```

---

## Performance Tuning

### Proxmox VE Tuning
```bash
# Disable swap for better performance
swapoff -a

# Enable CPU governor for performance
echo "performance" > /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Increase dirty_ratio for better disk I/O
sysctl -w vm.dirty_ratio=40
sysctl -w vm.dirty_background_ratio=10
```

### Ceph Tuning
```bash
# Increase OSD op threads
ceph config set osd osd_op_threads 8

# Tune PG autoscaler
ceph osd pool set {pool-name} pg_autoscale_mode on

# Enable BlueStore cache
ceph config set osd bluestore_cache_size 4G
```

### VM Tuning
- **CPU Type:** Use "host" for best performance (disables live migration)
- **VirtIO Drivers:** Always use VirtIO for disks and network
- **Ballooning:** Enable for dynamic memory allocation
- **NUMA:** Pin VMs to NUMA nodes for large VMs

---

## Useful Commands

### Cluster Management
```bash
# Cluster status
pvecm status
pvecm nodes

# HA status
ha-manager status

# Resource usage
pvesh get /cluster/resources
```

### Ceph Management
```bash
# Cluster health
ceph status
ceph health detail

# OSD management
ceph osd tree
ceph osd df

# Pool management
ceph osd pool ls detail
ceph df
```

### VM Management
```bash
# List VMs
qm list

# Migrate VM
qm migrate {vmid} {target-node} --online

# Create snapshot
qm snapshot {vmid} {snapshot-name}

# Backup VM
vzdump {vmid} --mode snapshot --storage {storage}
```

---

**Last Updated:** 2025-11-03
**Document Version:** 1.0
**Maintained By:** Jason
