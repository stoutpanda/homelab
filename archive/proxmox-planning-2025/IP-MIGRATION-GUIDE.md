# IP Migration Guide: Simplified 4-VLAN Design

## Overview
This document provides a quick reference for the **simplified 4-VLAN network design**, which balances security and simplicity by consolidating workload traffic while maintaining critical isolation for management and storage.

**Key Changes:**
- ✅ **Kept 4 VLANs:** Infrastructure (1), Management (16), Workloads (28), Storage (48)
- ❌ **Removed VLAN 18:** K8s Control Plane VIP (use direct endpoint instead)
- ❌ **Removed VLAN 58:** LoadBalancer IPs merged into VLAN 28
- 📈 **Expanded VLAN 28:** From /23 (512 IPs) to /22 (1024 IPs) to accommodate pods + LoadBalancer IPs
- 🔧 **Simplified Talos VMs:** 2 interfaces per VM (down from 3)

---

## VLAN Mapping

| Component | Old Proposal | Final (Simplified) | Notes |
|-----------|--------------|-------------------|-------|
| Infrastructure | VLAN 1 (10.0.1.0/24) | VLAN 1 (10.0.1.0/24) | **No change** |
| Proxmox Management | VLAN 20 (10.20.20.0/24) | VLAN 16 (10.8.16.0/24) | **Combined with Talos mgmt** |
| Talos VM Management | VLAN 40 (10.40.40.0/23) | VLAN 16 (10.8.16.0/24) | **Combined with Proxmox** |
| K8s Control Plane VIP | ~~VLAN 18 (10.8.18.0/24)~~ | **REMOVED** | **Use direct endpoint 10.8.16.20** |
| K8s Pod Network | VLAN 48 (10.48.0.0/16) | VLAN 28 (10.8.28.0/22) | **Expanded to /22 for pods + LB** |
| Ceph Storage | VLAN 30 (10.30.30.0/24) | VLAN 48 (10.8.48.0/24) | **MTU 9000** |
| Services (generic) | ~~VLAN 50 (10.50.50.0/24)~~ | **REMOVED** | **Not needed** |
| K8s LoadBalancer | ~~VLAN 58 (10.8.58.0/27)~~ | **Merged into VLAN 28** | **Now 10.8.31.10-200**

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
| pve-ms01-01 | vPro/AMT | 10.8.16.190 (K8s project) | **10.8.16.190** (no change) |
| pve-ms01-02 | vPro/AMT | 10.8.16.191 (K8s project) | **10.8.16.191** (no change) |
| pve-aimax-01 | JetKVM | Not yet configured | **10.8.16.92** (new) |

### Talos Kubernetes VMs

| VM | Interface | Old Proposal | Final (Simplified) |
|----|-----------|--------------|-------------------|
| **talos-k8s-01** | eth0 (Management) | 10.40.40.10 | **10.8.16.20** |
| talos-k8s-01 | eth1 (Workloads) | 10.48.1.1 | **10.8.28.1** |
| talos-k8s-01 | ~~eth2 (LoadBalancer)~~ | ~~10.58.0.10~~ | **REMOVED** |
| **talos-k8s-02** | eth0 (Management) | 10.40.40.11 | **10.8.16.21** |
| talos-k8s-02 | eth1 (Workloads) | 10.48.2.1 | **10.8.29.1** |
| talos-k8s-02 | ~~eth2 (LoadBalancer)~~ | ~~10.58.0.11~~ | **REMOVED** |
| **talos-k8s-03** | eth0 (Management) | 10.40.40.12 | **10.8.16.22** |
| talos-k8s-03 | eth1 (Workloads) | 10.48.3.1 | **10.8.30.1** |
| talos-k8s-03 | ~~eth2 (LoadBalancer)~~ | ~~10.58.0.12~~ | **REMOVED** |

**Note:** Each VM now has only 2 interfaces instead of 3.

### Pod Subnets (VLAN 28 - Expanded to /22)

| Node | Old Proposal | Final (Simplified) |
|------|--------------|-------------------|
| talos-k8s-01 | 10.48.1.0/24 | **10.8.28.0/24** (254 pods) |
| talos-k8s-02 | 10.48.2.0/24 | **10.8.29.0/24** (254 pods) |
| talos-k8s-03 | 10.48.3.0/24 | **10.8.30.0/24** (254 pods) |
| LoadBalancer Pool | N/A | **10.8.31.10-200** (190 IPs for MetalLB) |

**Note:** VLAN 28 is now 10.8.28.0/22 (1024 IPs total), which includes:
- 10.8.28.0/24 (node 1 pods)
- 10.8.29.0/24 (node 2 pods)
- 10.8.30.0/24 (node 3 pods)
- 10.8.31.0/24 (LoadBalancer IPs + reserved)

### Kubernetes Services

| Service | Old Proposal | Final (Simplified) |
|---------|--------------|-------------------|
| K8s API Endpoint | 10.40.40.10:6443 | **10.8.16.20:6443** (direct to node 1) |
| ~~K8s API VIP~~ | ~~10.8.18.2:6443~~ | **REMOVED** (optional, not needed) |
| Traefik Ingress | 10.58.0.100 | **10.8.31.10** |
| MetalLB IP Pool | 10.58.0.100-200 | **10.8.31.10-200** (190 IPs) |
| Kubernetes Dashboard | 10.58.0.110 | **10.8.31.11** |
| Grafana | 10.58.0.110 | **10.8.31.12** |
| Prometheus | N/A | **10.8.31.13** |

---

## Switch Port Configuration Changes

### USW-Enterprise-8-PoE-Server

| Port | Device | Old VLANs | Final (Simplified) |
|------|--------|-----------|-------------------|
| 2 | pve-ms01-01 | 1,20,40,48,50,58 | **1,16,28** |
| 3 | pve-ms01-02 | 1,20,40,48,50,58 | **1,16,28** |
| 4 | pve-aimax-01 | 1,20,40,48,50,58 | **1,16,28** |

**Removed:** VLANs 18, 50, 58
**Simplified:** Only 3 VLANs needed on management ports

### MikroTik CRS309 (Storage Switch)

| Port | Device | Old VLANs | Final (Simplified) |
|------|--------|-----------|-------------------|
| SFP+ 1-2 | pve-ms01-01 bond | 30 | **48** |
| SFP+ 3-4 | pve-ms01-02 bond | 30 | **48** |
| SFP+ 5-6 | pve-aimax-01 bond | 30 | **48** |

**Note:** Storage VLAN remains dedicated and isolated

---

## Talos Machine Configuration Changes

### Network Interface Configuration

**Old (3 interfaces):**
```yaml
interfaces:
  - interface: eth0
    addresses:
      - 10.40.40.10/23  # VLAN 40 - Management
  - interface: eth1
    addresses:
      - 10.48.1.1/24    # VLAN 48 - Pod Network
  - interface: eth2
    addresses:
      - 10.58.0.10/24   # VLAN 58 - LoadBalancer
```

**New (2 interfaces - Simplified):**
```yaml
machine:
  network:
    interfaces:
      - interface: eth0
        addresses:
          - 10.8.16.20/24   # VLAN 16 - Management
        routes:
          - network: 0.0.0.0/0
            gateway: 10.8.16.1
      - interface: eth1
        addresses:
          - 10.8.28.1/24    # VLAN 28 - Pod subnet + LoadBalancer
```

**Key Changes:**
- ✅ **Removed eth2:** LoadBalancer traffic now uses eth1
- ✅ **Simplified routing:** Single default gateway on eth0
- ✅ **MetalLB binds to eth1:** Same interface for pods and LoadBalancer IPs

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

**New (Simplified):**
```yaml
cluster:
  controlPlane:
    endpoint: https://10.8.16.20:6443  # Direct to node 1
  network:
    podSubnets:
      - 10.8.28.0/22  # Expanded to /22 for pods + LoadBalancer
    serviceSubnets:
      - 10.96.0.0/12  # Internal cluster IPs (unchanged)
```

**Removed:**
- ~~VIP endpoint (https://10.8.18.2:6443)~~ - Direct connection is sufficient

---

## Cilium Configuration Changes

**Old:**
```bash
cilium install \
  --set nativeRoutingCIDR=10.48.0.0/16
```

**New (Simplified):**
```bash
cilium install \
  --set ipam.mode=kubernetes \
  --set nativeRoutingCIDR=10.8.28.0/22 \
  --set autoDirectNodeRoutes=true \
  --set ipv4NativeRoutingCIDR=10.8.28.0/22
```

**Key Changes:**
- Expanded routing CIDR from /16 to /22
- Native routing for both pods and LoadBalancer IPs

---

## MetalLB Configuration Changes

**Old:**
```yaml
addresses:
  - 10.58.0.100-10.58.0.200
```

**New (Simplified):**
```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default
  namespace: metallb-system
spec:
  addresses:
    - 10.8.31.10-10.8.31.200  # 190 IPs available
  autoAssign: true
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: default
  namespace: metallb-system
spec:
  ipAddressPools:
    - default
  interfaces:
    - eth1  # Bind to workload network interface (VLAN 28)
```

**Key Changes:**
- LoadBalancer IPs moved from 10.8.58.x to 10.8.31.x
- MetalLB binds to eth1 (same interface as pods)
- 190 IPs available (increased from 21)

---

## UDM-Pro Static Routes (if needed)

If UDM-Pro doesn't automatically route between VLANs, add these static routes:

```
# Pod network routing (via Talos VM management IPs)
10.8.28.0/24 via 10.8.16.20  (talos-k8s-01 pods)
10.8.29.0/24 via 10.8.16.21  (talos-k8s-02 pods)
10.8.30.0/24 via 10.8.16.22  (talos-k8s-03 pods)

# LoadBalancer pool routing (same next-hops)
10.8.31.0/24 via 10.8.16.20  (MetalLB - announced via L2)
```

**Note:** MetalLB uses L2 advertisement, so static routes may not be needed if UDM-Pro learns ARP automatically.

---

## Quick Reference Card

### Access Points
| Service | URL/Command |
|---------|-------------|
| **Proxmox Web UI (Node 1)** | https://10.8.16.10:8006 |
| **Proxmox Web UI (Node 2)** | https://10.8.16.11:8006 |
| **Proxmox Web UI (Node 3)** | https://10.8.16.12:8006 |
| **Talos API (Node 1)** | talosctl --nodes 10.8.16.20 |
| **Kubernetes API** | kubectl --server https://10.8.16.20:6443 |
| **Traefik Dashboard** | http://10.8.31.10:9000/dashboard/ |
| **Grafana** | http://10.8.31.12 |
| **Prometheus** | http://10.8.31.13:9090 |

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

### Network Summary (4 VLANs)
| VLAN | Subnet | Purpose | Gateway |
|------|--------|---------|---------|
| 1 | 10.0.1.0/24 | Infrastructure | 10.0.1.1 |
| **16** | **10.8.16.0/24** | **Management** | **10.8.16.1** |
| **28** | **10.8.28.0/22** | **Workloads (Pods + LB)** | **10.8.28.1** |
| **48** | **10.8.48.0/24** | **Storage (MTU 9000)** | N/A (isolated) |

---

**Last Updated:** 2025-11-03
**Document Version:** 1.0
