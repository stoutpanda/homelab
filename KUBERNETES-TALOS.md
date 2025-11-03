# Kubernetes on Talos OS

## Overview
This document describes the Kubernetes cluster running on Talos Linux VMs within the Proxmox homelab. This setup combines the benefits of Proxmox virtualization with Talos OS's immutable, API-managed Kubernetes platform.

> **Note:** This documentation uses the 10.8.x IP scheme (reused from previous K8s deployment). For complete IP address mappings, Talos configs, and CNI examples updated with correct IPs, see [IP-MIGRATION-GUIDE.md](./IP-MIGRATION-GUIDE.md).
> - **Talos Management:** 10.8.16.20-22 (VLAN 16)
> - **Pod Network:** 10.8.28.0/23 (VLAN 28, per-node /24 subnets)
> - **LoadBalancer Pool:** 10.8.58.10-30 (VLAN 58)
> - **Control Plane VIP (optional):** 10.8.18.2 (VLAN 18)

---

## Architecture

### Cluster Topology
- **3 Talos VMs** (one per Proxmox host)
- Each node runs both **control plane** and **worker** workloads
- **High availability** through 3-node control plane
- **VLAN-backed pod networking** for native routing performance
- **MetalLB** for LoadBalancer service exposure

### Design Benefits
| Benefit | Description |
|---------|-------------|
| **HA Control Plane** | 3 control plane nodes ensure API availability |
| **Resource Efficiency** | Mixed control plane + worker maximizes hardware usage |
| **Simplified Management** | Talos OS eliminates SSH, provides declarative configuration |
| **Network Performance** | VLAN-backed pods avoid overlay overhead |
| **Service Exposure** | MetalLB provides native LoadBalancer functionality |
| **VM Benefits** | Easy snapshotting, migration, backup via Proxmox |

---

## Node Configuration

### Node Summary
| Node | Proxmox Host | eth0 (Mgmt) | eth1 (Pods) | eth2 (LB) | Pod Subnet |
|------|--------------|-------------|-------------|-----------|------------|
| talos-k8s-01 | pve-ms01-01 | 10.40.40.10 | 10.48.1.1 | 10.58.0.10 | 10.48.1.0/24 |
| talos-k8s-02 | pve-ms01-02 | 10.40.40.11 | 10.48.2.1 | 10.58.0.11 | 10.48.2.0/24 |
| talos-k8s-03 | pve-aimax-01 | 10.40.40.12 | 10.48.3.1 | 10.58.0.12 | 10.48.3.0/24 |

### Network Interfaces (Per Node)
```
┌────────────────────────────────────────┐
│      Talos VM (q35, UEFI)              │
│                                        │
│  eth0 (VirtIO) ────► VLAN 40          │  Talos API / kubectl
│  eth1 (VirtIO) ────► VLAN 48          │  Pod network (CNI)
│  eth2 (VirtIO) ────► VLAN 58          │  LoadBalancer IPs
│                                        │
└────────────────────────────────────────┘
         │ Proxmox vmbr0 (VLAN trunk)
         ▼
    UDM-Pro (Router/Gateway)
```

---

## Talos OS Configuration

### Installation
Talos OS is installed from ISO or cloud image with machine configuration applied via `talosctl`.

#### Prerequisites
- Talos ISO downloaded (latest stable from https://talos.dev)
- `talosctl` installed on admin machine
- Network access to all three VMs on VLAN 40

#### Bootstrap Process
```bash
# 1. Generate cluster configuration
talosctl gen config homelab-k8s https://10.40.40.10:6443 \
  --output-dir ./talos-config

# 2. Apply configuration to each node
talosctl apply-config --insecure \
  --nodes 10.40.40.10 \
  --file ./talos-config/controlplane.yaml

talosctl apply-config --insecure \
  --nodes 10.40.40.11 \
  --file ./talos-config/controlplane.yaml

talosctl apply-config --insecure \
  --nodes 10.40.40.12 \
  --file ./talos-config/controlplane.yaml

# 3. Bootstrap etcd on first node
talosctl bootstrap --nodes 10.40.40.10

# 4. Retrieve kubeconfig
talosctl kubeconfig --nodes 10.40.40.10
```

### Talos Machine Configuration

Key sections of the machine configuration:

#### Network Configuration (Per Node)
```yaml
machine:
  network:
    hostname: talos-k8s-01
    interfaces:
      - interface: eth0
        addresses:
          - 10.40.40.10/23
        routes:
          - network: 0.0.0.0/0
            gateway: 10.40.40.1
        vlan:
          vlanId: 40

      - interface: eth1
        addresses:
          - 10.48.1.1/24
        vlan:
          vlanId: 48
        mtu: 1500

      - interface: eth2
        addresses:
          - 10.58.0.10/24
        vlan:
          vlanId: 58
        mtu: 1500

    nameservers:
      - 10.0.1.1
      - 1.1.1.1
```

#### Kubernetes Configuration
```yaml
cluster:
  clusterName: homelab-k8s
  controlPlane:
    endpoint: https://10.40.40.10:6443

  network:
    cni:
      name: none  # Cilium installed separately

    podSubnets:
      - 10.48.0.0/16  # VLAN-backed pod network

    serviceSubnets:
      - 10.244.0.0/16  # Internal service network

  apiServer:
    certSANs:
      - 10.40.40.10
      - 10.40.40.11
      - 10.40.40.12
      - 10.58.0.101  # Optional: MetalLB VIP for API
```

---

## CNI: Cilium with Native Routing

### Why Cilium?
- **VLAN-backed networking:** Direct routing without overlay
- **eBPF datapath:** High-performance packet processing
- **Native Kubernetes support:** Excellent integration
- **Observability:** Built-in Hubble for network visibility

### Cilium Installation

#### Install Cilium CLI
```bash
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
curl -L --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-amd64.tar.gz{,.sha256sum}
tar xzvfC cilium-linux-amd64.tar.gz /usr/local/bin
```

#### Install Cilium in Native Routing Mode
```bash
cilium install \
  --set ipam.mode=kubernetes \
  --set tunnel=disabled \
  --set enableIPv4Masquerade=false \
  --set nativeRoutingCIDR=10.48.0.0/16 \
  --set nodePort.enabled=true \
  --set nodePort.mode=dsr \
  --set kubeProxyReplacement=true
```

#### Verify Installation
```bash
cilium status
cilium connectivity test  # Optional: runs connectivity tests
```

### Cilium Configuration Details

**Key Settings:**
- `ipam.mode=kubernetes`: Use Kubernetes native IPAM (per-node /24 subnets)
- `tunnel=disabled`: No VXLAN/Geneve overlay, direct routing
- `enableIPv4Masquerade=false`: No NAT, pods use routable IPs
- `nativeRoutingCIDR=10.48.0.0/16`: Pod CIDR for direct routing
- `kubeProxyReplacement=true`: eBPF replaces kube-proxy

**Routing:**
- Each Talos node advertises its /24 pod subnet via kernel routing
- UDM-Pro routes traffic between VLANs (40, 48, 58)
- No overlay encapsulation = lower latency, higher throughput

---

## LoadBalancer: MetalLB

### Why MetalLB?
- **Native LoadBalancer:** Provides LoadBalancer service type
- **Layer 2 mode:** Simple ARP-based IP announcement
- **Homelab-friendly:** No BGP router required
- **Dedicated VLAN:** Clean separation via VLAN 58

### MetalLB Installation

#### Install MetalLB
```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.14/config/manifests/metallb-native.yaml
```

#### Configure IP Address Pool
```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: homelab-pool
  namespace: metallb-system
spec:
  addresses:
  - 10.58.0.100-10.58.0.200
```

#### Configure L2 Advertisement
```yaml
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: homelab-l2
  namespace: metallb-system
spec:
  ipAddressPools:
  - homelab-pool
  interfaces:
  - eth2  # Bind to VLAN 58 interface
```

#### Apply Configuration
```bash
kubectl apply -f metallb-ippool.yaml
kubectl apply -f metallb-l2advert.yaml
```

### MetalLB Behavior
- MetalLB speaker pods run on each Talos node
- When a LoadBalancer service is created, MetalLB assigns an IP from the pool
- The speaker on the "winner" node announces the IP via ARP on VLAN 58
- Traffic to that IP is routed directly to the node, then to pods

---

## Service Exposure

### Ingress Controller: Traefik

#### Why Traefik?
- **Kubernetes-native:** CRDs for IngressRoute
- **Automatic TLS:** Integrates with cert-manager
- **Dynamic configuration:** No reloads needed
- **Dashboard:** Built-in UI

#### Install Traefik
```bash
helm repo add traefik https://traefik.github.io/charts
helm repo update

helm install traefik traefik/traefik \
  --namespace traefik \
  --create-namespace \
  --set service.type=LoadBalancer \
  --set service.annotations."metallb\.universe\.tf/address-pool"=homelab-pool \
  --set service.spec.loadBalancerIP=10.58.0.100
```

#### Verify Traefik
```bash
kubectl get svc -n traefik
# Should show LoadBalancer with EXTERNAL-IP: 10.58.0.100

curl -v http://10.58.0.100
# Should return 404 (Traefik is running, no routes yet)
```

#### Example IngressRoute
```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: my-app
  namespace: default
spec:
  entryPoints:
    - web
  routes:
    - match: Host(`myapp.example.com`)
      kind: Rule
      services:
        - name: my-app
          port: 80
```

---

## Cert-Manager for TLS

### Install cert-manager
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
```

### Configure Let's Encrypt Issuer
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: traefik
```

### Example TLS IngressRoute
```yaml
apiVersion: traefik.containo.us/v1alpha1
kind:IngressRoute
metadata:
  name: my-app-tls
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`myapp.example.com`)
      kind: Rule
      services:
        - name: my-app
          port: 80
  tls:
    certResolver: letsencrypt
```

---

## Storage: Ceph RBD

### Ceph CSI Driver

Talos VMs can use Ceph storage from the Proxmox cluster for persistent volumes.

#### Install Ceph CSI
```bash
helm repo add ceph-csi https://ceph.github.io/csi-charts
helm repo update

helm install ceph-csi-rbd ceph-csi/ceph-csi-rbd \
  --namespace ceph-csi-rbd \
  --create-namespace \
  --set csiConfig[0].clusterID=<ceph-cluster-id> \
  --set csiConfig[0].monitors="{10.30.30.10:6789,10.30.30.11:6789,10.30.30.12:6789}"
```

#### Create StorageClass
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ceph-rbd
provisioner: rbd.csi.ceph.com
parameters:
  clusterID: <ceph-cluster-id>
  pool: vm-disks
  imageFeatures: layering
  csi.storage.k8s.io/provisioner-secret-name: ceph-secret
  csi.storage.k8s.io/provisioner-secret-namespace: ceph-csi-rbd
reclaimPolicy: Delete
volumeBindingMode: Immediate
```

---

## Common Operations

### Access Cluster

#### Using talosctl
```bash
export TALOSCONFIG=~/.talos/config
talosctl --nodes 10.40.40.10 dashboard  # Node dashboard
talosctl --nodes 10.40.40.10 logs kubelet  # View kubelet logs
talosctl --nodes 10.40.40.10 dmesg  # Kernel logs
```

#### Using kubectl
```bash
export KUBECONFIG=~/.kube/config
kubectl get nodes  # List nodes
kubectl get pods -A  # List all pods
```

### Upgrade Talos OS

```bash
# Upgrade one node at a time
talosctl upgrade --nodes 10.40.40.10 \
  --image ghcr.io/siderolabs/installer:v1.8.3

# Wait for node to come back
kubectl wait --for=condition=Ready node/talos-k8s-01 --timeout=10m

# Repeat for other nodes
```

### Upgrade Kubernetes

```bash
talosctl upgrade-k8s --nodes 10.40.40.10 --to 1.31.1
```

### Backup etcd

```bash
talosctl --nodes 10.40.40.10 etcd snapshot /tmp/etcd-backup.db
```

### Reset Node (Reinstall)

```bash
talosctl reset --nodes 10.40.40.10 --graceful
# Then reapply machine config
```

---

## Monitoring and Observability

### Prometheus Stack

#### Install kube-prometheus-stack
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install kube-prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.service.type=LoadBalancer \
  --set grafana.service.loadBalancerIP=10.58.0.110
```

#### Access Grafana
```bash
# Get admin password
kubectl get secret -n monitoring kube-prometheus-grafana \
  -o jsonpath="{.data.admin-password}" | base64 -d

# Access at http://10.58.0.110
```

### Hubble (Cilium Observability)

```bash
cilium hubble enable --ui

kubectl port-forward -n kube-system svc/hubble-ui 8080:80
# Access at http://localhost:8080
```

---

## Troubleshooting

### Node Not Ready

```bash
# Check Talos logs
talosctl --nodes 10.40.40.10 logs controller-runtime

# Check kubelet status
talosctl --nodes 10.40.40.10 service kubelet status

# Check pod network
kubectl run test-pod --image=busybox --rm -it -- ping 10.48.2.5
```

### Pod Network Issues

```bash
# Verify Cilium status
cilium status

# Check Cilium agent logs
kubectl logs -n kube-system ds/cilium

# Test connectivity
cilium connectivity test
```

### MetalLB Not Assigning IPs

```bash
# Check MetalLB speaker pods
kubectl get pods -n metallb-system

# Check speaker logs
kubectl logs -n metallb-system -l component=speaker

# Verify IP pool
kubectl get ipaddresspool -n metallb-system
```

### Traefik Not Routing

```bash
# Check Traefik service
kubectl get svc -n traefik

# Check Traefik logs
kubectl logs -n traefik -l app.kubernetes.io/name=traefik

# Access Traefik dashboard
kubectl port-forward -n traefik svc/traefik 9000:9000
# Navigate to http://localhost:9000/dashboard/
```

---

## Best Practices

### Talos OS
- **Always use declarative config:** Never rely on imperative changes
- **Version control:** Store machine configs and talosconfig in Git
- **Backup:** Regular etcd snapshots before upgrades
- **Immutable:** Embrace the immutable nature, don't try to SSH in

### Networking
- **Test VLAN routing:** Ensure UDM-Pro routes between VLANs 40, 48, 58
- **MTU considerations:** Keep MTU at 1500 unless testing jumbo frames
- **Firewall rules:** Allow necessary ports between VLANs

### Storage
- **Use Ceph for stateful apps:** Persistent volumes should use Ceph
- **Backup strategy:** Regular backups of PVs via Velero or similar
- **Resource requests:** Always set resource requests/limits for pods

### Security
- **Network policies:** Use Cilium NetworkPolicies for pod isolation
- **RBAC:** Follow least privilege principle for service accounts
- **Secrets management:** Use external secrets operator or sealed secrets
- **TLS everywhere:** Use cert-manager for automatic TLS certificates

---

## Useful Commands

### Talos
```bash
# Get node info
talosctl --nodes 10.40.40.10 get members

# Restart service
talosctl --nodes 10.40.40.10 service kubelet restart

# Check etcd health
talosctl --nodes 10.40.40.10 etcd members

# Interactive dashboard
talosctl --nodes 10.40.40.10 dashboard
```

### Kubernetes
```bash
# Get all resources
kubectl get all -A

# Describe node
kubectl describe node talos-k8s-01

# Exec into pod
kubectl exec -it <pod-name> -- /bin/sh

# View events
kubectl get events -A --sort-by='.lastTimestamp'
```

### Networking
```bash
# Test pod connectivity
kubectl run test --image=nicolaka/netshoot --rm -it -- bash

# DNS test
kubectl run test --image=busybox --rm -it -- nslookup kubernetes.default

# Curl test from pod
kubectl run curl --image=curlimages/curl --rm -it -- curl http://service-name
```

---

**Last Updated:** 2025-11-03
**Document Version:** 1.0
**Maintained By:** Jason
