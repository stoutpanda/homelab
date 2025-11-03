# Proxmox Homelab with Kubernetes

A high-availability Proxmox VE cluster running on enterprise-class mini PCs, featuring Ceph distributed storage, 10GbE networking, and a production-grade Kubernetes cluster on Talos OS.

---

## Quick Overview

### Infrastructure Stack
- **Layer 1 - Hardware:** 3-node Proxmox cluster (2x MS-01 + 1x AMD AI Max)
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
- **AI/ML Ready:** Dedicated AMD AI Max node with GPU passthrough support

---

## Documentation

### Core Documentation
| Document | Description |
|----------|-------------|
| [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) | Hardware inventory, Talos VMs, network interfaces, and IP allocations |
| [NETWORK.md](./NETWORK.md) | VLAN design, network topology, switch configurations, and routing |
| [PROXMOX-CLUSTER.md](./PROXMOX-CLUSTER.md) | Proxmox cluster, Ceph storage, HA configuration, and operations |
| [KUBERNETES-TALOS.md](./KUBERNETES-TALOS.md) | Kubernetes on Talos OS, CNI, MetalLB, service exposure, and operations |

### Quick Reference
| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Guidelines for AI assistant when working on this project |

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
    │ MS-01-01 │ │ MS-01-02 │ │  AI Max-01   │
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

### VLAN Structure (Reusing 10.8.x from Previous K8s Setup)
| VLAN | Subnet | Purpose | MTU |
|------|--------|---------|-----|
| 1 | 10.0.1.0/24 | Network Infrastructure | 1500 |
| 16 | 10.8.16.0/24 | Proxmox + Talos Management | 1500 |
| 18 | 10.8.18.0/24 | K8s Control Plane VIP (optional) | 1500 |
| 28 | 10.8.28.0/23 | K8s Pod Network (512 IPs) | 1500 |
| 48 | 10.8.48.0/24 | Ceph Storage | 9000 |
| 58 | 10.8.58.0/27 | K8s LoadBalancer IPs (32 IPs) | 1500 |

See [NETWORK.md](./NETWORK.md) and [IP-MIGRATION-GUIDE.md](./IP-MIGRATION-GUIDE.md) for complete details.

---

## Kubernetes Layer

### Talos OS Cluster
- **3 Talos VMs:** One per Proxmox host (talos-k8s-01, talos-k8s-02, talos-k8s-03)
- **Role:** Each node is both control plane and worker
- **Resources:** 8 vCPU, 16GB RAM, 100GB disk per VM
- **Network:** 3 interfaces per VM (management, pod network, LoadBalancer)

### Networking
- **CNI:** Cilium with native routing (no overlay encapsulation)
- **Pod Network:** VLAN 28 (10.8.28.0/23) with per-node subnets
- **LoadBalancer:** MetalLB L2 mode on VLAN 58 (10.8.58.10-30)
- **Ingress:** Traefik on MetalLB LoadBalancer (10.8.58.10)
- **Management:** VLAN 16 (10.8.16.20-22 for Talos VMs)

### Storage
- **Persistent Volumes:** Ceph RBD via CSI driver
- **StorageClass:** ceph-rbd (default)
- **Backup:** Velero with Ceph or S3 backend (planned)

### Service Exposure
| Service Type | Method | IP Range | Example |
|--------------|--------|----------|---------|
| LoadBalancer | MetalLB | 10.8.58.10-30 | Traefik: 10.8.58.10 |
| Ingress | Traefik | Via LoadBalancer IP | http://app.example.com |
| NodePort | Direct to node | 10.8.16.20-22 | :30000-32767 |
| K8s API (optional) | VIP | 10.8.18.2:6443 | Control plane HA endpoint |

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

#### pve-aimax-01 (AMD AI Max)
- **Specifications:** TBD
- **Primary Use:** AI/ML workloads with GPU passthrough

See [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) for complete hardware details and IP allocations.

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
- **AMD AI Max:** TBD
- **Usable (after 3x replication):** ~4TB (from MS-01s)

See [PROXMOX-CLUSTER.md](./PROXMOX-CLUSTER.md) for Ceph configuration details.

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
  - [ ] 1x AMD AI Max
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
- **AI/ML Infrastructure:** GPU passthrough and resource allocation for AI workloads

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

See [PROXMOX-CLUSTER.md](./PROXMOX-CLUSTER.md) for detailed maintenance procedures.

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
