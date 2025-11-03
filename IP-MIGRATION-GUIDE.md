# IP Migration Guide: 10.x → 10.8.x VLAN Scheme

## Overview
This document provides a quick reference for migrating from the originally proposed 10.x VLAN scheme to the proven 10.8.x scheme reused from the previous Kubernetes deployment.

---

## VLAN Mapping

| Component | Old Proposal | New (Reused) | Notes |
|-----------|--------------|--------------|-------|
| Infrastructure | VLAN 1 (10.0.1.0/24) | VLAN 1 (10.0.1.0/24) | **No change** |
| Proxmox Management | VLAN 20 (10.20.20.0/24) | VLAN 16 (10.8.16.0/24) | **Combined with Talos mgmt** |
| Talos VM Management | VLAN 40 (10.40.40.0/23) | VLAN 16 (10.8.16.0/24) | **Combined with Proxmox** |
| K8s Control Plane VIP | N/A | VLAN 18 (10.8.18.0/24) | **Optional VIP at 10.8.18.2** |
| K8s Pod Network | VLAN 48 (10.48.0.0/16) | VLAN 28 (10.8.28.0/23) | **Smaller but sufficient** |
| Ceph Storage | VLAN 30 (10.30.30.0/24) | VLAN 48 (10.8.48.0/24) | **MTU 9000 already configured** |
| Services (generic) | VLAN 50 (10.50.50.0/24) | ~~Removed~~ | **Not needed** |
| K8s LoadBalancer | VLAN 58 (10.58.0.0/24) | VLAN 58 (10.8.58.0/27) | **Smaller subnet, same VLAN ID** |

---

## IP Address Changes

### Proxmox Hosts

| Host | Component | Old Proposal | New (10.8.x) |
|------|-----------|--------------|--------------|
| pve-ms01-01 | Management | 10.20.20.10 | **10.8.16.10** |
| pve-ms01-02 | Management | 10.20.20.11 | **10.8.16.11** |
| pve-aimax-01 | Management | 10.20.20.12 | **10.8.16.12** |
| pve-ms01-01 | Storage | 10.30.30.10 | **10.8.48.10** |
| pve-ms01-02 | Storage | 10.30.30.11 | **10.8.48.11** |
| pve-aimax-01 | Storage | 10.30.30.12 | **10.8.48.12** |
| pve-ms01-01 | vPro | 10.0.1.x (TBD) | **10.8.16.90** |
| pve-ms01-02 | vPro | 10.0.1.x (TBD) | **10.8.16.91** |
| pve-aimax-01 | BMC | 10.0.1.x (TBD) | **10.8.16.92** |

### Talos Kubernetes VMs

| VM | Interface | Old Proposal | New (10.8.x) |
|----|-----------|--------------|--------------|
| **talos-k8s-01** | eth0 (Management) | 10.40.40.10 | **10.8.16.20** |
| talos-k8s-01 | eth1 (Pod Network) | 10.48.1.1 | **10.8.28.1** |
| talos-k8s-01 | eth2 (LoadBalancer) | 10.58.0.10 | **10.8.58.10** (optional) |
| **talos-k8s-02** | eth0 (Management) | 10.40.40.11 | **10.8.16.21** |
| talos-k8s-02 | eth1 (Pod Network) | 10.48.2.1 | **10.8.29.1** |
| talos-k8s-02 | eth2 (LoadBalancer) | 10.58.0.11 | **10.8.58.11** (optional) |
| **talos-k8s-03** | eth0 (Management) | 10.40.40.12 | **10.8.16.22** |
| talos-k8s-03 | eth1 (Pod Network) | 10.48.3.1 | **10.8.28.100** |
| talos-k8s-03 | eth2 (LoadBalancer) | 10.58.0.12 | **10.8.58.12** (optional) |

### Pod Subnets (VLAN 28)

| Node | Old Proposal | New (10.8.x) |
|------|--------------|--------------|
| talos-k8s-01 | 10.48.1.0/24 | **10.8.28.0/24** (10.8.28.1-254) |
| talos-k8s-02 | 10.48.2.0/24 | **10.8.29.0/24** (10.8.29.1-254) |
| talos-k8s-03 | 10.48.3.0/24 | **10.8.28.100-199** (100 IPs) |

**Note:** VLAN 28 is 10.8.28.0/23, which includes both 10.8.28.0/24 and 10.8.29.0/24

### Kubernetes Services

| Service | Old Proposal | New (10.8.x) |
|---------|--------------|--------------|
| K8s API Endpoint | 10.40.40.10:6443 | **10.8.16.20:6443** (direct to node 1) |
| K8s API VIP (optional) | N/A | **10.8.18.2:6443** (MetalLB or Keepalived) |
| Traefik Ingress | 10.58.0.100 | **10.8.58.10** |
| MetalLB IP Pool | 10.58.0.100-200 | **10.8.58.10-30** (21 IPs) |
| Kubernetes Dashboard | 10.58.0.110 | **10.8.58.11** |
| Grafana | 10.58.0.110 | **10.8.58.12** |

---

## Switch Port Configuration Changes

### USW-Enterprise-8-PoE-Server

| Port | Device | Old VLANs | New VLANs |
|------|--------|-----------|-----------|
| 2 | pve-ms01-01 | 1,20,40,48,50,58 | **1,16,18,28,48,58** |
| 3 | pve-ms01-02 | 1,20,40,48,50,58 | **1,16,18,28,48,58** |
| 4 | pve-aimax-01 | 1,20,40,48,50,58 | **1,16,18,28,48,58** |

### MikroTik CRS309 (Storage Switch)

| Port | Device | Old VLANs | New VLANs |
|------|--------|-----------|-----------|
| SFP+ 1-2 | pve-ms01-01 bond | 30 | **48** |
| SFP+ 3-4 | pve-ms01-02 bond | 30 | **48** |
| SFP+ 5-6 | pve-aimax-01 | 30 | **48** |

---

## Talos Machine Configuration Changes

### Network Interface Configuration

**Old:**
```yaml
interfaces:
  - interface: eth0
    addresses:
      - 10.40.40.10/23  # VLAN 40
  - interface: eth1
    addresses:
      - 10.48.1.1/24    # VLAN 48
  - interface: eth2
    addresses:
      - 10.58.0.10/24   # VLAN 58
```

**New:**
```yaml
interfaces:
  - interface: eth0
    addresses:
      - 10.8.16.20/24   # VLAN 16
    routes:
      - network: 0.0.0.0/0
        gateway: 10.8.16.1
  - interface: eth1
    addresses:
      - 10.8.28.1/24    # VLAN 28 (pod subnet)
  - interface: eth2
    addresses:
      - 10.8.58.10/27   # VLAN 58 (optional)
```

### Cluster Configuration

**Old:**
```yaml
cluster:
  controlPlane:
    endpoint: https://10.40.40.10:6443
  network:
    podSubnets:
      - 10.48.0.0/16
```

**New:**
```yaml
cluster:
  controlPlane:
    endpoint: https://10.8.16.20:6443
    # Or use VIP: https://10.8.18.2:6443
  network:
    podSubnets:
      - 10.8.28.0/23
```

---

## Cilium Configuration Changes

**Old:**
```bash
cilium install \
  --set nativeRoutingCIDR=10.48.0.0/16
```

**New:**
```bash
cilium install \
  --set nativeRoutingCIDR=10.8.28.0/23
```

---

## MetalLB Configuration Changes

**Old:**
```yaml
addresses:
  - 10.58.0.100-10.58.0.200
```

**New:**
```yaml
addresses:
  - 10.8.58.10-10.8.58.30
```

---

## UDM-Pro Static Routes (if needed)

If UDM-Pro doesn't automatically route between VLANs, add these static routes:

```
# Pod network routing
10.8.28.0/24 via 10.8.16.20  (talos-k8s-01)
10.8.29.0/24 via 10.8.16.21  (talos-k8s-02)
```

---

## Quick Reference Card

### Access Points
| Service | URL/Command |
|---------|-------------|
| Proxmox Web UI (Node 1) | https://10.8.16.10:8006 |
| Proxmox Web UI (Node 2) | https://10.8.16.11:8006 |
| Proxmox Web UI (Node 3) | https://10.8.16.12:8006 |
| Talos API (Node 1) | talosctl --nodes 10.8.16.20 |
| Kubernetes API | kubectl --server https://10.8.16.20:6443 |
| Traefik Dashboard | http://10.8.58.10:9000/dashboard/ |

### SSH Access
```bash
# Proxmox hosts (via VLAN 16)
ssh root@10.8.16.10  # pve-ms01-01
ssh root@10.8.16.11  # pve-ms01-02
ssh root@10.8.16.12  # pve-aimax-01

# Talos VMs (no SSH, use talosctl)
talosctl --nodes 10.8.16.20 dashboard
talosctl --nodes 10.8.16.21 dashboard
talosctl --nodes 10.8.16.22 dashboard
```

---

**Last Updated:** 2025-11-03
**Document Version:** 1.0
