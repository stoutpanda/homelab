# Proxmox Homelab with Kubernetes

A high-availability Proxmox VE cluster running on enterprise-class mini PCs, featuring Ceph distributed storage, 10GbE networking, and a production-grade Kubernetes cluster on Talos OS.

---

## Quick Overview

### Infrastructure Stack
- **Layer 1 - Hardware:** 3-node Proxmox cluster (2x MS-01 + 1x Framework Desktop)
- **Layer 2 - Storage:** Ceph distributed block storage with 3-way replication
- **Layer 3 - Networking:** Multi-VLAN design with dedicated 10GbE storage network
- **Layer 4 - Kubernetes:** 3-node Talos OS cluster with VLAN-backed pod networking

### Cluster Composition
- **Proxmox:** 3-node HA cluster with quorum-based failover
- **Kubernetes:** 3 Talos VMs (mixed control plane + worker on each host)
- **Storage:** Ceph for VMs + Kubernetes persistent volumes
- **Networking:** 7 VLANs for management, storage, VMs, pods, and services

### Key Features
- **High Availability:** Automatic VM and pod failover on node failure
- **Distributed Storage:** 3-way Ceph replication for data redundancy
- **Native Routing:** VLAN-backed Kubernetes pod network (no overlay overhead)
- **LoadBalancer Services:** MetalLB for native LoadBalancer support
- **Performance:** NVMe Gen4 storage, bonded 10GbE, Cilium eBPF networking
- **Immutable Infrastructure:** Talos OS for declarative, API-managed Kubernetes
- **AI/ML Ready:** Dedicated Framework Desktop node with NPU and iGPU for AI workloads

---

## Documentation

### Core Documentation
| Document | Description |
|----------|-------------|
| **[NETWORK-REFERENCE.md](./NETWORK-REFERENCE.md)** | **Complete network reference: VLANs, subnets, IPs, interfaces, topology** |
| [KUBERNETES-TALOS.md](./KUBERNETES-TALOS.md) | Kubernetes on Talos OS, CNI, MetalLB, service exposure, and operations |
| [CLAUDE.md](./CLAUDE.md) | Guidelines for AI assistant when working on this project |

### Archived Documentation
| Document | Description |
|----------|-------------|
| [archive/proxmox-planning-2025/](./archive/proxmox-planning-2025/) | Original planning docs (INFRASTRUCTURE, NETWORK, PROXMOX-CLUSTER, IP-MIGRATION-GUIDE) |

---

## Cluster Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        UDM-Pro Gateway                          │
│                         (10.0.1.1)                              │
└────────────────────┬──────────────────┬─────────────────────────┘
                     │                  │
         ┌───────────┴────────┐    ┌────┴────────────────┐
         │  Enterprise-24-PoE │    │ MikroTik CRS309     │
         │    Main Switch     │    │  Storage Switch     │
         │   (10.0.1.239)     │    │   (10.0.1.82)       │
         └───────────┬────────┘    └────┬────────────────┘
                     │                  │
         ┌───────────┴────────┐         │ 10GbE SFP+ (LACP Bond)
         │ USW-Enterprise-8   │         │ VLAN 30, MTU 9000
         │   PoE Server       │         │
         │   (10.0.1.238)     │         │
         └───┬──────┬─────┬───┘         │
             │      │     │             │
    ┌────────┴─┐ ┌─┴────────┐ ┌────────┴─────┐
    │ MS-01-01 │ │ MS-01-02 │ │ Framework-01 │
    │ Proxmox  │ │ Proxmox  │ │   Proxmox    │
    │  Node 1  │ │  Node 2  │ │    Node 3    │
    └──────────┘ └──────────┘ └──────────────┘
         │            │              │
         └────────────┴──────────────┘
              Ceph Storage Cluster
              (3-way replication)
```

---

## Network Summary

### Simplified 4-VLAN Structure
| VLAN | Subnet | Purpose | MTU | Notes |
|------|--------|---------|-----|-------|
| 1 | 10.0.1.0/24 | Infrastructure | 1500 | Switches, gateway |
| **16** | **10.8.16.0/24** | **Management** | **1500** | **Proxmox + Talos VMs** |
| **28** | **10.8.28.0/22** | **Workloads** | **1500** | **Pods + LoadBalancer (1024 IPs)** |
| **48** | **10.8.48.0/24** | **Storage** | **9000** | **Ceph cluster traffic** |

**Key Simplifications:**
- ✅ **Removed VLAN 18:** No separate VIP VLAN (use direct endpoint)
- ✅ **Removed VLAN 58:** LoadBalancer IPs merged into VLAN 28
- ✅ **Expanded VLAN 28:** From /23 to /22 (512 → 1024 IPs)
- ✅ **2 interfaces per VM:** Down from 3 (simpler configuration)

See [NETWORK-REFERENCE.md](./NETWORK-REFERENCE.md) for complete network details.

---

## Kubernetes Layer

### Talos OS Cluster
- **3 Talos VMs:** One per Proxmox host (talos-k8s-01, talos-k8s-02, talos-k8s-03)
- **Role:** Each node is both control plane and worker
- **Resources:** 8 vCPU, 16GB RAM, 100GB disk per VM
- **Network:** 2 interfaces per VM (management on VLAN 16, workloads on VLAN 28)

### Networking
- **CNI:** Cilium with native routing (no overlay encapsulation)
- **Pod Network:** VLAN 28 (10.8.28.0/22) with per-node /24 subnets
- **LoadBalancer:** MetalLB L2 mode on VLAN 28 (10.8.31.10-200, 190 IPs)
- **Ingress:** Traefik on MetalLB LoadBalancer (10.8.31.10)
- **Management:** VLAN 16 (10.8.16.20-22 for Talos VMs)

### Storage
- **Persistent Volumes:** Ceph RBD via CSI driver
- **StorageClass:** ceph-rbd (default)
- **Backup:** Velero with Ceph or S3 backend (planned)

### Service Exposure
| Service Type | Method | IP Range | Example |
|--------------|--------|----------|---------|
| LoadBalancer | MetalLB | 10.8.31.10-200 | Traefik: 10.8.31.10 |
| Ingress | Traefik | Via LoadBalancer IP | http://app.example.com |
| NodePort | Direct to node | 10.8.16.20-22 | :30000-32767 |
| K8s API | Direct | 10.8.16.20:6443 | Control plane endpoint |

See [KUBERNETES-TALOS.md](./KUBERNETES-TALOS.md) for complete Kubernetes documentation.

---

## Hardware Summary

### Node Specifications

#### pve-ms01-01 & pve-ms01-02 (Minisforum MS-01)
- **CPU:** Intel Core i9-13900H (14C/20T, up to 5.4 GHz)
- **RAM:** 96GB DDR5-4800
- **Storage:** 2TB + 4TB NVMe Gen4 (6TB total per node)
- **Network:**
  - 2x 2.5GbE RJ45 (Intel i226-V)
  - 2x 10GbE SFP+ (Intel X710) in LACP bond
- **Management:** Intel vPro with AMT 16.1

#### pve-aimax-01 (Framework Desktop 128GB)
- **CPU:** AMD Ryzen AI 9 395 (12C, Zen 5, up to 5.1 GHz)
- **RAM:** 128GB DDR5
- **Storage:** 1TB + 4TB NVMe Gen4 (5TB total)
- **GPU:** AMD Radeon 890M (integrated, RDNA 3.5)
- **NPU:** 50 TOPS AI acceleration
- **Network:**
  - 1x 2.5GbE RJ45 (Realtek, built-in)
  - 2x 10GbE RJ45 (Intel X550-T2 PCIe card) in LACP bond
- **Management:** JetKVM (KVM-over-IP, planned)

See [NETWORK-REFERENCE.md](./NETWORK-REFERENCE.md) for complete hardware interface details and IP allocations.

---

## Storage Architecture

### Ceph Distributed Storage
- **Replication:** 3-way across all nodes
- **Pools:**
  - `vm-disks`: VM root disks (128 PGs)
  - `vm-data`: VM data volumes (256 PGs)
  - `backups`: VM backups with 2-way replication (64 PGs)
- **Network:** Dedicated 10GbE storage network (VLAN 30)
- **Performance:** ~20 Gbps aggregate per node (bonded SFP+)

### Total Capacity
- **MS-01 Nodes:** 12TB raw (6TB × 2 nodes)
- **Framework Desktop:** 5TB raw (1TB + 4TB)
- **Total Raw:** 17TB NVMe across 3 nodes
- **Usable (after 3x replication):** ~5.7TB

See [archive/proxmox-planning-2025/PROXMOX-CLUSTER.md](./archive/proxmox-planning-2025/PROXMOX-CLUSTER.md) for detailed Ceph and cluster configuration.

---

## Getting Started

### Access the Cluster
- **Proxmox Web UI:** `https://10.20.20.10:8006` (pve-ms01-01)
- **Proxmox Web UI:** `https://10.20.20.11:8006` (pve-ms01-02)
- **Proxmox Web UI:** `https://10.20.20.12:8006` (pve-aimax-01)
- **Cluster VIP (if configured):** `https://proxmox.lab.local:8006`

### SSH Access
```bash
ssh root@10.20.20.10  # pve-ms01-01
ssh root@10.20.20.11  # pve-ms01-02
ssh root@10.20.20.12  # pve-aimax-01
```

### Common Operations

#### Check Cluster Status
```bash
pvecm status
pvecm nodes
```

#### Check Ceph Health
```bash
ceph status
ceph health detail
ceph osd tree
```

#### List VMs
```bash
qm list
```

#### Create a VM
```bash
# Example: Create Ubuntu 22.04 VM
qm create 100 --name ubuntu-test --memory 4096 --cores 2 --net0 virtio,bridge=vmbr0 --scsihw virtio-scsi-pci --scsi0 ceph-pool:32
```

#### Backup a VM
```bash
vzdump 100 --mode snapshot --storage local
```

---

## Project Status

### Current State
- [ ] Hardware acquired
  - [x] 2x Minisforum MS-01
  - [x] 1x Framework Desktop 128GB
  - [ ] JetKVM for Framework Desktop
- [ ] Network infrastructure configured
  - [ ] VLANs created on UDM-Pro
  - [ ] Switch port profiles configured
  - [ ] Storage network cabling complete
- [ ] Proxmox cluster deployed
  - [ ] Proxmox VE installed on all nodes
  - [ ] Cluster created and joined
  - [ ] HA configured
- [ ] Ceph storage configured
  - [ ] Ceph packages installed
  - [ ] OSDs created
  - [ ] Pools configured
  - [ ] Replication working
- [ ] VMs deployed
  - [ ] Template VMs created
  - [ ] Production VMs migrated
  - [ ] GPU passthrough configured (AI Max)

### Next Steps
1. **Network Configuration:** Create VLANs on UDM-Pro and configure switch ports
2. **Proxmox Installation:** Install Proxmox VE 8.x on all three nodes
3. **Cluster Creation:** Initialize cluster and join all nodes
4. **Ceph Deployment:** Configure Ceph storage with 3-way replication
5. **VM Migration:** Migrate or deploy initial VMs

---

## Learning Objectives

This homelab serves as a hands-on learning platform for:
- **Virtualization:** Proxmox VE administration and VM management
- **Distributed Storage:** Ceph architecture and operations
- **High Availability:** Cluster quorum, fencing, and automatic failover
- **Networking:** VLAN segmentation, bonding, jumbo frames, and performance optimization
- **AI/ML Infrastructure:** NPU and iGPU passthrough for AI workloads on AMD platform

---

## Monitoring and Maintenance

### Recommended Monitoring Stack
- **Proxmox Built-in:** Web UI dashboards and email alerts
- **Ceph Dashboard:** Built-in Ceph manager dashboard
- **Optional:** Prometheus + Grafana for advanced metrics
- **Optional:** Loki for log aggregation

### Maintenance Schedule
- **Monthly:** Review cluster health, verify backups, check for updates
- **Quarterly:** Apply Proxmox/Ceph updates, firmware updates, capacity planning
- **Annually:** Hardware inspection, cable testing, DR drills

See [archive/proxmox-planning-2025/PROXMOX-CLUSTER.md](./archive/proxmox-planning-2025/PROXMOX-CLUSTER.md) for detailed maintenance procedures.

---

## Previous Projects

### Kubernetes on Raspberry Pi (Archived)
The previous iteration of this homelab focused on building a highly-available Kubernetes cluster using Raspberry Pi 5 hardware and Ansible for automation. This project has been archived but remains available for reference.

**Archived Documentation:** [archive/kubernetes-2025/](./archive/kubernetes-2025/)

**Key Achievements:**
- 3-node HA control plane (Raspberry Pi 5)
- 2-node worker cluster (Minisforum MS-01)
- Cilium CNI with eBPF
- Multi-VLAN network segmentation
- Fully automated with Ansible

**Lessons Learned:**
- VLAN design and network isolation
- High-availability patterns
- Storage network optimization
- Raspberry Pi hardware limitations

These learnings directly informed the design of the current Proxmox cluster.

---

## Resources

### Proxmox Documentation
- [Proxmox VE Documentation](https://pve.proxmox.com/pve-docs/)
- [Proxmox VE Cluster](https://pve.proxmox.com/wiki/Cluster_Manager)
- [Proxmox VE HA](https://pve.proxmox.com/wiki/High_Availability)

### Ceph Documentation
- [Ceph Documentation](https://docs.ceph.com/)
- [Ceph on Proxmox](https://pve.proxmox.com/wiki/Deploy_Hyper-Converged_Ceph_Cluster)
- [Ceph Performance Tuning](https://docs.ceph.com/en/latest/rados/configuration/)

### Community
- [Proxmox Forum](https://forum.proxmox.com/)
- [r/Proxmox](https://www.reddit.com/r/Proxmox/)
- [r/homelab](https://www.reddit.com/r/homelab/)

---

## License

This is a personal homelab project. All documentation is provided as-is for educational and reference purposes.

---

**Project Started:** November 2025
**Last Updated:** 2025-11-03
**Maintained By:** Jason
