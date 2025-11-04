# Proxmox Homelab Infrastructure

## Overview
This document provides a comprehensive reference for all hardware nodes, network interfaces, IP allocations, and physical specifications for the Proxmox homelab cluster.

## Cluster Nodes

### Node Summary
| Hostname | Role | Hardware | CPU | RAM | Storage | Status |
|----------|------|----------|-----|-----|---------|--------|
| pve-ms01-01 | Proxmox Host | Minisforum MS-01 | Intel i9-13900H (14C/20T) | 96GB DDR5 | 2TB NVMe + 4TB NVMe | Active |
| pve-ms01-02 | Proxmox Host | Minisforum MS-01 | Intel i9-13900H (14C/20T) | 96GB DDR5 | 2TB NVMe + 4TB NVMe | Active |
| pve-aimax-01 | Proxmox Host | Framework Desktop 128GB | AMD Ryzen AI 9 395 (12C) | 128GB DDR5 | 1TB NVMe + 4TB NVMe | Planning |

### Management IP Summary
| Hostname | Proxmox IP | Out-of-Band Management IP | Management Type | VLAN |
|----------|------------|---------------------------|-----------------|------|
| pve-ms01-01 | 10.8.16.10 | 10.8.16.190 | Intel vPro/AMT 16.1 | 16 |
| pve-ms01-02 | 10.8.16.11 | 10.8.16.191 | Intel vPro/AMT 16.1 | 16 |
| pve-aimax-01 | 10.8.16.12 | 10.8.16.92 | JetKVM (KVM-over-IP) | 16 |

**Note:** vPro interfaces on MS-01 nodes were configured via MeshCommander during the archived K8s project and remain functional.

---

## Detailed Hardware Inventory

### pve-ms01-01 (Minisforum MS-01)

#### System Specifications
| Component | Details |
|-----------|---------|
| **CPU** | Intel Core i9-13900H (Raptor Lake)<br>- 14 cores (6P + 8E), 20 threads<br>- Base: 2.6 GHz, Boost: 5.4 GHz<br>- 24MB L3 Cache |
| **RAM** | 96GB DDR5-4800 (2x 48GB SO-DIMM) |
| **Storage** | **Slot 1:** 2TB NVMe Gen4 (System)<br>**Slot 2:** 4TB NVMe Gen4 (VM Storage) |
| **Chipset** | Intel HM770 |
| **BIOS/UEFI** | AMI UEFI (vPro enabled) |

#### Network Interfaces
| Interface | Type | Speed | MAC Address | Description |
|-----------|------|-------|-------------|-------------|
| enp87s0 | RJ45 (Intel i226-V) | 2.5GbE | _TBD_ | Management Interface |
| enp88s0 | RJ45 (Intel i226-V) | 2.5GbE | _TBD_ | Secondary Network |
| enp2s0f0np0 | SFP+ (Intel X710) | 10GbE | _TBD_ | Storage Network (SFP+ Port 1) |
| enp2s0f1np1 | SFP+ (Intel X710) | 10GbE | _TBD_ | Storage Network (SFP+ Port 2) |

#### Management Interface
| Feature | Details |
|---------|---------|
| **vPro/AMT** | Intel vPro with AMT 16.1 |
| **Management IP** | 10.8.16.190 (VLAN 16) |
| **Access** | HTTP/HTTPS, VNC, SOL |
| **Notes** | Configured via MeshCommander in archived K8s project |

#### PCIe Expansion
| Slot | Type | Installed Device |
|------|------|------------------|
| PCIe x16 (Gen4) | Full-height | Intel X710-DA2 Dual SFP+ 10GbE NIC |

---

### pve-ms01-02 (Minisforum MS-01)

#### System Specifications
| Component | Details |
|-----------|---------|
| **CPU** | Intel Core i9-13900H (Raptor Lake)<br>- 14 cores (6P + 8E), 20 threads<br>- Base: 2.6 GHz, Boost: 5.4 GHz<br>- 24MB L3 Cache |
| **RAM** | 96GB DDR5-4800 (2x 48GB SO-DIMM) |
| **Storage** | **Slot 1:** 2TB NVMe Gen4 (System)<br>**Slot 2:** 4TB NVMe Gen4 (VM Storage) |
| **Chipset** | Intel HM770 |
| **BIOS/UEFI** | AMI UEFI (vPro enabled) |

#### Network Interfaces
| Interface | Type | Speed | MAC Address | Description |
|-----------|------|-------|-------------|-------------|
| enp87s0 | RJ45 (Intel i226-V) | 2.5GbE | _TBD_ | Management Interface |
| enp88s0 | RJ45 (Intel i226-V) | 2.5GbE | _TBD_ | Secondary Network |
| enp2s0f0np0 | SFP+ (Intel X710) | 10GbE | _TBD_ | Storage Network (SFP+ Port 1) |
| enp2s0f1np1 | SFP+ (Intel X710) | 10GbE | _TBD_ | Storage Network (SFP+ Port 2) |

#### Management Interface
| Feature | Details |
|---------|---------|
| **vPro/AMT** | Intel vPro with AMT 16.1 |
| **Management IP** | 10.8.16.191 (VLAN 16) |
| **Access** | HTTP/HTTPS, VNC, SOL |
| **Notes** | Configured via MeshCommander in archived K8s project |

#### PCIe Expansion
| Slot | Type | Installed Device |
|------|------|------------------|
| PCIe x16 (Gen4) | Full-height | Intel X710-DA2 Dual SFP+ 10GbE NIC |

---

### pve-aimax-01 (Framework Desktop 128GB)

#### System Specifications
| Component | Details |
|-----------|---------|
| **CPU** | AMD Ryzen AI 9 395 (Strix Point)<br>- 12 cores (Zen 5 architecture)<br>- Base: TBD, Boost: up to 5.1 GHz<br>- Integrated NPU (50 TOPS AI acceleration) |
| **RAM** | 128GB DDR5 |
| **Storage** | **Slot 1:** 1TB NVMe Gen4 (System)<br>**Slot 2:** 4TB NVMe Gen4 (Ceph OSD) |
| **GPU/Accelerator** | AMD Radeon 890M (integrated, RDNA 3.5)<br>- 16 Compute Units<br>- NPU for AI/ML workloads (50 TOPS) |
| **Chipset** | AMD (Framework Desktop platform) |

#### Network Interfaces
| Interface | Type | Speed | MAC Address | Description |
|-----------|------|-------|-------------|-------------|
| eno1 | RJ45 (Realtek 2.5GbE) | 2.5GbE | _TBD_ | Built-in Management Interface |
| enp1s0f0 | RJ45 (Intel X550-T2) | 10GbE | _TBD_ | Storage Network (Port 1) |
| enp1s0f1 | RJ45 (Intel X550-T2) | 10GbE | _TBD_ | Storage Network (Port 2) |

#### Management Interface
| Feature | Details |
|---------|---------|
| **KVM-over-IP** | JetKVM (hardware ordered) |
| **Management IP** | 10.8.16.92 (VLAN 16) |
| **Access** | HTTP/HTTPS, VNC via JetKVM |
| **Notes** | IP pre-allocated; device will be configured upon arrival |

#### PCIe Expansion
| Slot | Type | Installed Device |
|------|------|------------------|
| PCIe x4 (Gen4) | Low-profile | Intel X550-T2 Dual-Port 10GbE NIC |

---

## Virtual Machines (Talos Kubernetes Cluster)

### VM Summary
| VM Name | Host Node | Role | vCPU | vRAM | Disk | Status |
|---------|-----------|------|------|------|------|--------|
| talos-k8s-01 | pve-ms01-01 | K8s Control Plane + Worker | 8 | 16GB | 100GB | Planned |
| talos-k8s-02 | pve-ms01-02 | K8s Control Plane + Worker | 8 | 16GB | 100GB | Planned |
| talos-k8s-03 | pve-aimax-01 | K8s Control Plane + Worker | 8 | 16GB | 100GB | Planned |

---

### talos-k8s-01 (Proxmox VM on pve-ms01-01)

#### VM Specifications
| Component | Details |
|-----------|---------|
| **VM ID** | 101 |
| **OS** | Talos Linux (latest stable) |
| **vCPU** | 8 cores (pinned to physical cores recommended) |
| **vRAM** | 16GB (dedicated, no ballooning) |
| **Disk** | 100GB (Ceph RBD storage) |
| **Boot Mode** | UEFI |
| **Machine Type** | q35 |

#### Virtual Network Interfaces
| Interface | Type | VLAN | MAC Address | Bridge | Description |
|-----------|------|------|-------------|--------|-------------|
| net0 (eth0) | VirtIO | 16 | _TBD_ | vmbr0 | Management / Talos API |
| net1 (eth1) | VirtIO | 28 | _TBD_ | vmbr0 | Workload Network (Pods + LoadBalancer) |

#### IP Configuration
| Interface | VLAN | IP Address | Subnet | Purpose |
|-----------|------|------------|--------|---------|
| eth0 | 16 | 10.8.16.20 | 10.8.16.0/24 | Talos API, kubectl, talosctl |
| eth1 | 28 | 10.8.28.1 | 10.8.28.0/24 | Pod subnet (254 pods) + MetalLB binding |

---

### talos-k8s-02 (Proxmox VM on pve-ms01-02)

#### VM Specifications
| Component | Details |
|-----------|---------|
| **VM ID** | 102 |
| **OS** | Talos Linux (latest stable) |
| **vCPU** | 8 cores (pinned to physical cores recommended) |
| **vRAM** | 16GB (dedicated, no ballooning) |
| **Disk** | 100GB (Ceph RBD storage) |
| **Boot Mode** | UEFI |
| **Machine Type** | q35 |

#### Virtual Network Interfaces
| Interface | Type | VLAN | MAC Address | Bridge | Description |
|-----------|------|------|-------------|--------|-------------|
| net0 (eth0) | VirtIO | 16 | _TBD_ | vmbr0 | Management / Talos API |
| net1 (eth1) | VirtIO | 28 | _TBD_ | vmbr0 | Workload Network (Pods + LoadBalancer) |

#### IP Configuration
| Interface | VLAN | IP Address | Subnet | Purpose |
|-----------|------|------------|--------|---------|
| eth0 | 16 | 10.8.16.21 | 10.8.16.0/24 | Talos API, kubectl, talosctl |
| eth1 | 28 | 10.8.29.1 | 10.8.29.0/24 | Pod subnet (254 pods) + MetalLB binding |

---

### talos-k8s-03 (Proxmox VM on pve-aimax-01)

#### VM Specifications
| Component | Details |
|-----------|---------|
| **VM ID** | 103 |
| **OS** | Talos Linux (latest stable) |
| **vCPU** | 8 cores (pinned to physical cores recommended) |
| **vRAM** | 16GB (dedicated, no ballooning) |
| **Disk** | 100GB (Ceph RBD storage) |
| **Boot Mode** | UEFI |
| **Machine Type** | q35 |

#### Virtual Network Interfaces
| Interface | Type | VLAN | MAC Address | Bridge | Description |
|-----------|------|------|-------------|--------|-------------|
| net0 (eth0) | VirtIO | 16 | _TBD_ | vmbr0 | Management / Talos API |
| net1 (eth1) | VirtIO | 28 | _TBD_ | vmbr0 | Workload Network (Pods + LoadBalancer) |

#### IP Configuration
| Interface | VLAN | IP Address | Subnet | Purpose |
|-----------|------|------------|--------|---------|
| eth0 | 16 | 10.8.16.22 | 10.8.16.0/24 | Talos API, kubectl, talosctl |
| eth1 | 28 | 10.8.30.1 | 10.8.30.0/24 | Pod subnet (254 pods) + MetalLB binding |

---

### Talos Cluster Configuration

#### Cluster Summary
| Parameter | Value |
|-----------|-------|
| **Cluster Name** | homelab-k8s |
| **Kubernetes Version** | Latest stable (1.31+) |
| **Control Plane Endpoint** | 10.8.16.20:6443 (direct to node 1) |
| **CNI** | Cilium (native routing mode) |
| **Pod CIDR** | 10.8.28.0/22 (VLAN-backed, 1024 IPs) |
| **Service CIDR** | 10.96.0.0/12 (internal cluster IPs) |
| **LoadBalancer Pool** | 10.8.31.10-200 (MetalLB, 190 IPs) |
| **Talos Version** | Latest stable (v1.8+) |

#### Access Methods
| Method | Endpoint | Port | Purpose |
|--------|----------|------|---------|
| **talosctl** | 10.8.16.20-22 | 50000 | Talos API access |
| **kubectl** | 10.8.16.20 | 6443 | Kubernetes API (direct connection) |
| **Traefik Ingress** | 10.8.31.10 | 80, 443 | HTTP/HTTPS ingress |
| **Kubernetes Dashboard** | 10.8.31.11 | 443 | Web UI (if deployed) |
| **Grafana** | 10.8.31.12 | 80, 443 | Monitoring dashboard |

---

## Network Configuration

### IP Allocation Table

#### pve-ms01-01
| Interface | VLAN | IP Address | Subnet | Gateway | Purpose |
|-----------|------|------------|--------|---------|---------|
| enp87s0 | 16 | 10.8.16.10 | 10.8.16.0/24 | 10.8.16.1 | Proxmox Management |
| enp88s0 | 1 | 10.0.1.x (DHCP) | 10.0.1.0/24 | 10.0.1.1 | Optional secondary interface |
| bond0 (enp2s0f0np0 + enp2s0f1np1) | 48 | 10.8.48.10 | 10.8.48.0/24 | 10.8.48.1 | Ceph Storage Network (MTU 9000) |
| vPro/AMT | 16 | 10.8.16.190 | 10.8.16.0/24 | 10.8.16.1 | Out-of-band Management (Intel vPro) |

#### pve-ms01-02
| Interface | VLAN | IP Address | Subnet | Gateway | Purpose |
|-----------|------|------------|--------|---------|---------|
| enp87s0 | 16 | 10.8.16.11 | 10.8.16.0/24 | 10.8.16.1 | Proxmox Management |
| enp88s0 | 1 | 10.0.1.x (DHCP) | 10.0.1.0/24 | 10.0.1.1 | Optional secondary interface |
| bond0 (enp2s0f0np0 + enp2s0f1np1) | 48 | 10.8.48.11 | 10.8.48.0/24 | 10.8.48.1 | Ceph Storage Network (MTU 9000) |
| vPro/AMT | 16 | 10.8.16.191 | 10.8.16.0/24 | 10.8.16.1 | Out-of-band Management (Intel vPro) |

#### pve-aimax-01
| Interface | VLAN | IP Address | Subnet | Gateway | Purpose |
|-----------|------|------------|--------|---------|---------|
| eno1 | 16 | 10.8.16.12 | 10.8.16.0/24 | 10.8.16.1 | Proxmox Management |
| eno1 | 1 | 10.0.1.x (DHCP) | 10.0.1.0/24 | 10.0.1.1 | Optional secondary interface |
| bond0 (enp1s0f0 + enp1s0f1) | 48 | 10.8.48.12 | 10.8.48.0/24 | 10.8.48.1 | Ceph Storage Network (MTU 9000) |
| JetKVM | 16 | 10.8.16.92 | 10.8.16.0/24 | 10.8.16.1 | Out-of-band Management (JetKVM) |

---

## Network Infrastructure Devices

### Switches
| Device | Model | IP Address | Location | Notes |
|--------|-------|------------|----------|-------|
| Main Switch | UniFi Enterprise 24 PoE | 10.0.1.239 | Server Rack | Core routing |
| K8s Main Switch | USW-Flex-2.5G | 10.0.1.80 | Server Rack | _May be repurposed_ |
| Server Switch | USW-Enterprise-8-PoE | 10.0.1.238 | Server Rack | Server connectivity |
| Storage Switch | MikroTik CRS309-1G-8S+IN | 10.0.1.82 | Server Rack | 10G storage network |

### Gateway/Router
| Device | Model | IP Address | Function |
|--------|-------|------------|----------|
| UDM-Pro | UniFi Dream Machine Pro | 10.0.1.1 | Core router, VLAN gateway |

---

## Physical Connections

### Storage Network Topology
```
pve-ms01-01 [SFP+ Dual Port X710] ──┐
                                     ├─── MikroTik CRS309 (10G Storage Switch)
pve-ms01-02 [SFP+ Dual Port X710] ──┤
                                     │
pve-aimax-01 [RJ45 Dual Port X550-T2] ─┘
```

### Management Network Topology
```
pve-ms01-01 [enp87s0 2.5G] ──┐
                              ├─── USW-Enterprise-8-PoE ──── UDM-Pro
pve-ms01-02 [enp87s0 2.5G] ──┤
                              │
pve-aimax-01 [eno1 2.5G]    ─┘
```

---

## Performance Specifications

### Network Performance
| Link | Speed | Technology | MTU | Notes |
|------|-------|------------|-----|-------|
| Management | 2.5 Gbps | Copper (Cat6) | 1500 | Standard Ethernet |
| Storage | 20 Gbps | SFP+ DAC/Fiber LACP Bond | 9000 | Jumbo frames enabled |

### Storage Performance
- **NVMe Gen4 Read:** ~7000 MB/s per drive
- **NVMe Gen4 Write:** ~5000 MB/s per drive
- **Total Raw Storage:** 17TB NVMe (6TB per MS-01 + 5TB Framework Desktop)

---

## Power Management

### Power Consumption Estimates
| Node | Idle | Typical | Max | PSU |
|------|------|---------|-----|-----|
| pve-ms01-01 | ~35W | ~75W | ~150W | 19V/120W |
| pve-ms01-02 | ~35W | ~75W | ~150W | 19V/120W |
| pve-aimax-01 | ~45W | ~95W | ~200W | ATX PSU |

**Total Cluster Power:** ~115W idle, ~245W typical, ~500W maximum

---

## Firmware and Software Versions

### Proxmox VE
| Node | Proxmox Version | Kernel | Installation Date |
|------|----------------|--------|-------------------|
| pve-ms01-01 | _TBD_ | _TBD_ | _TBD_ |
| pve-ms01-02 | _TBD_ | _TBD_ | _TBD_ |
| pve-aimax-01 | _TBD_ | _TBD_ | _TBD_ |

### Hardware Firmware
| Node | BIOS/UEFI | BMC/vPro | NIC Firmware |
|------|-----------|----------|--------------|
| pve-ms01-01 | _TBD_ | _TBD_ | _TBD_ |
| pve-ms01-02 | _TBD_ | _TBD_ | _TBD_ |
| pve-aimax-01 | _TBD_ | _TBD_ | _TBD_ |

---

## Notes

### Known Issues
- _Document any hardware quirks, driver issues, or compatibility notes here_

### Future Expansion Plans
- _Document potential hardware additions, upgrades, or changes_

### Maintenance Schedule
- **Firmware Updates:** Quarterly
- **Hardware Inspection:** Bi-annually
- **Network Cable Testing:** Annually

---

**Last Updated:** 2025-11-03
**Document Version:** 1.0
**Maintained By:** Jason
