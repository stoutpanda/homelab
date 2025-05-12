# Kubernetes Control Plane Node Setup on Raspberry Pi 5

This document provides a comprehensive guide for setting up Kubernetes control plane nodes on Raspberry Pi 5 hardware, including both manual steps and Ansible automation.

## Hardware Requirements

- Raspberry Pi 5 (8GB RAM recommended)
- M.2 SSD with Hat Kit (recommended for performance)
- Power supply (official 27W USB-C recommended)
- MicroSD card (16GB+ for initial boot)
- Ethernet connection

## Overview

The setup process consists of the following major steps:

1. Base OS installation
2. System configuration
3. Network setup
4. Kubernetes prerequisites
5. Container runtime installation
6. Kubernetes components installation
7. Cluster initialization
8. Joining additional control plane nodes

## 1. Base OS Installation

### 1.1 Download Ubuntu Server

Download Ubuntu Server 22.04 LTS ARM64 for Raspberry Pi from the official Ubuntu website:
https://ubuntu.com/download/raspberry-pi

### 1.2 Flash OS to MicroSD Card

Use Raspberry Pi Imager or similar tools to flash the OS:

```bash
# Alternative method using dd (Linux/macOS)
sudo dd bs=4M if=ubuntu-22.04-preinstalled-server-arm64+raspi.img of=/dev/sdX status=progress
```

Replace `/dev/sdX` with your SD card device.

### 1.3 First Boot and Initial Setup

1. Insert the microSD card into the Raspberry Pi and power on
2. Connect via HDMI and keyboard or via serial console
3. Complete the initial setup:
   - Set username and password
   - Configure network settings
   - Set timezone

### 1.4 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.5 Move Root Filesystem to M.2 SSD (Recommended)

For better performance, move the root filesystem to an M.2 SSD:

```bash
# Identify the SSD device
lsblk

# Format and partition the SSD
sudo parted /dev/nvme0n1 mklabel gpt
sudo parted -a optimal /dev/nvme0n1 mkpart primary ext4 0% 100%
sudo mkfs.ext4 /dev/nvme0n1p1

# Mount the SSD and copy root filesystem
sudo mkdir /mnt/ssd
sudo mount /dev/nvme0n1p1 /mnt/ssd
sudo rsync -axv / /mnt/ssd

# Configure boot from SSD
sudo sed -i 's|root=PARTUUID=.*|root=/dev/nvme0n1p1|' /boot/firmware/cmdline.txt

# Reboot
sudo reboot

# Verify boot from SSD
df -h /
```

## 2. System Configuration

### 2.1 Set Hostname

Set a unique hostname for each control plane node:

```bash
# For the first control plane node
sudo hostnamectl set-hostname k8s-cp-01

# For the second control plane node
sudo hostnamectl set-hostname k8s-cp-02

# For the third control plane node
sudo hostnamectl set-hostname k8s-cp-03

# Add hostname to /etc/hosts
echo "127.0.1.1 $(hostname)" | sudo tee -a /etc/hosts
```

### 2.2 Configure SSH

Ensure SSH is installed and enabled:

```bash
sudo apt install -y openssh-server
sudo systemctl enable ssh
sudo systemctl start ssh
```

From your admin machine, set up SSH key authentication:

```bash
ssh-copy-id username@raspberry-pi-ip
```

### 2.3 Disable Swap

Kubernetes requires swap to be disabled:

```bash
# Disable swap immediately
sudo swapoff -a

# Disable swap permanently
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```

## 3. Network Configuration for Kubernetes

### 3.1 Install Network Utilities

```bash
sudo apt install -y vlan bridge-utils ifenslave net-tools
```

### 3.2 Enable VLAN Module

```bash
sudo modprobe 8021q
echo "8021q" | sudo tee -a /etc/modules
```

### 3.3 Configure Network Interfaces

Create a netplan configuration for Kubernetes networking:

```bash
# Create netplan configuration
sudo tee /etc/netplan/60-k8s-network.yaml > /dev/null << 'EOF'
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: no
      addresses:
        - 10.8.16.86/27  # Adjust for each node (86, 87, 88)
      routes:
        - to: default
          via: 10.8.16.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
  vlans:
    vlan18:
      id: 18
      link: eth0
      addresses:
        - 10.8.18.86/27  # Adjust for each node (86, 87, 88)
EOF

# Apply configuration
sudo netplan apply

# Verify configuration
ip addr show
```

## 4. Kubernetes Prerequisites

### 4.1 Load Required Kernel Modules

```bash
# Create modules configuration
cat << EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

# Load modules
sudo modprobe overlay
sudo modprobe br_netfilter
```

### 4.2 Configure Kernel Parameters

```bash
# Create sysctl configuration
cat << EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

# Apply sysctl parameters
sudo sysctl --system
```

### 4.3 Install Container Runtime Prerequisites

```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg
```

## 5. Install Container Runtime (containerd)

### 5.1 Install containerd

```bash
sudo apt-get update
sudo apt-get install -y containerd
```

### 5.2 Configure containerd

```bash
# Create default configuration
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml > /dev/null

# Modify for systemd cgroup driver
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml

# Restart containerd
sudo systemctl restart containerd
sudo systemctl enable containerd
```

### 5.3 Verify containerd

```bash
sudo systemctl status containerd
```

## 6. Install Kubernetes Components

### 6.1 Add Kubernetes Repository

```bash
# Add GPG key
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg

# Add repository
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
```

### 6.2 Install Kubernetes Components

```bash
sudo apt-get update
sudo apt-get install -y kubelet=1.28.0-00 kubeadm=1.28.0-00 kubectl=1.28.0-00

# Hold packages at current version
sudo apt-mark hold kubelet kubeadm kubectl
```

### 6.3 Configure kubelet

```bash
# Ensure kubelet uses systemd cgroup driver
cat << EOF | sudo tee /etc/default/kubelet
KUBELET_EXTRA_ARGS=--cgroup-driver=systemd
EOF

sudo systemctl daemon-reload
```

## 7. Initialize Kubernetes Cluster (First Control Plane Node Only)

### 7.1 Create kubeadm Configuration File

```bash
cat << EOF > kubeadm-config.yaml
apiVersion: kubeadm.k8s.io/v1beta3
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 10.8.18.86  # Control plane IP of first node
  bindPort: 6443
nodeRegistration:
  name: k8s-cp-01
  criSocket: unix:///var/run/containerd/containerd.sock
---
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
kubernetesVersion: v1.28.0
controlPlaneEndpoint: "10.8.18.86:6443"  # Initially point to first CP node
networking:
  podSubnet: 10.8.28.0/23
  serviceSubnet: 10.8.38.0/26
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
EOF
```

### 7.2 Initialize the Cluster

```bash
sudo kubeadm init --config=kubeadm-config.yaml --upload-certs
```

**Important**: Save the output of this command, as it contains the join commands for other nodes.

### 7.3 Set Up kubeconfig

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 7.4 Install Cilium CNI

```bash
# Install Cilium CLI
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
CLI_ARCH=arm64  # For Raspberry Pi
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-${CLI_ARCH}.tar.gz
sudo tar xzvfC cilium-linux-${CLI_ARCH}.tar.gz /usr/local/bin
rm cilium-linux-${CLI_ARCH}.tar.gz

# Install Cilium
cilium install --version 1.14.0
```

### 7.5 Verify Cluster Status

```bash
kubectl get nodes
kubectl get pods -A
```

## 8. Join Additional Control Plane Nodes

On each additional control plane node (k8s-cp-02, k8s-cp-03), run the join command provided by the kubeadm init output:

```bash
sudo kubeadm join 10.8.18.86:6443 --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash> \
  --control-plane --certificate-key <certificate-key>
```

### 8.1 Set Up kubeconfig on Additional Control Plane Nodes

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 8.2 Verify All Control Plane Nodes

```bash
kubectl get nodes
```

## 9. Configure High Availability (Optional)

For a production-ready setup, configure high availability for the control plane:

### 9.1 Install HAProxy and Keepalived

On all control plane nodes:

```bash
sudo apt-get update
sudo apt-get install -y haproxy keepalived
```

### 9.2 Configure HAProxy

On all control plane nodes:

```bash
cat << EOF | sudo tee /etc/haproxy/haproxy.cfg
global
    log /dev/log local0
    log /dev/log local1 notice
    daemon

defaults
    log global
    mode tcp
    option tcplog
    option dontlognull
    timeout connect 5000
    timeout client 50000
    timeout server 50000

frontend kubernetes-frontend
    bind 0.0.0.0:16443
    mode tcp
    option tcplog
    default_backend kubernetes-backend

backend kubernetes-backend
    mode tcp
    option tcp-check
    balance roundrobin
    server k8s-cp-01 10.8.18.86:6443 check fall 3 rise 2
    server k8s-cp-02 10.8.18.87:6443 check fall 3 rise 2
    server k8s-cp-03 10.8.18.88:6443 check fall 3 rise 2
EOF

sudo systemctl restart haproxy
sudo systemctl enable haproxy
```

### 9.3 Configure Keepalived

On k8s-cp-01 (MASTER):

```bash
cat << EOF | sudo tee /etc/keepalived/keepalived.conf
vrrp_script check_haproxy {
    script "killall -0 haproxy"
    interval 3
    weight 2
}

vrrp_instance VI_1 {
    state MASTER
    interface vlan18
    virtual_router_id 51
    priority 101
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass kubernetes
    }
    virtual_ipaddress {
        10.8.18.2/27
    }
    track_script {
        check_haproxy
    }
}
EOF
```

On k8s-cp-02 (BACKUP):

```bash
cat << EOF | sudo tee /etc/keepalived/keepalived.conf
vrrp_script check_haproxy {
    script "killall -0 haproxy"
    interval 3
    weight 2
}

vrrp_instance VI_1 {
    state BACKUP
    interface vlan18
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass kubernetes
    }
    virtual_ipaddress {
        10.8.18.2/27
    }
    track_script {
        check_haproxy
    }
}
EOF
```

On k8s-cp-03 (BACKUP):

```bash
cat << EOF | sudo tee /etc/keepalived/keepalived.conf
vrrp_script check_haproxy {
    script "killall -0 haproxy"
    interval 3
    weight 2
}

vrrp_instance VI_1 {
    state BACKUP
    interface vlan18
    virtual_router_id 51
    priority 99
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass kubernetes
    }
    virtual_ipaddress {
        10.8.18.2/27
    }
    track_script {
        check_haproxy
    }
}
EOF
```

Start and enable keepalived on all control plane nodes:

```bash
sudo systemctl restart keepalived
sudo systemctl enable keepalived
```

### 9.4 Update kubeconfig to Use the VIP

```bash
kubectl config set-cluster kubernetes --server=https://10.8.18.2:16443
```

## 10. Automating with Ansible

The above manual steps can be automated using Ansible. Below is the structure and key files needed.

### 10.1 Ansible Directory Structure

```
ansible/
├── inventory/
│   └── hosts.yml
├── playbooks/
│   ├── setup_control_plane.yml
│   ├── init_kubernetes_cluster.yml
│   └── join_control_plane_nodes.yml
└── roles/
    ├── k8s_control_plane/
    │   ├── defaults/
    │   │   └── main.yml
    │   ├── handlers/
    │   │   └── main.yml
    │   ├── tasks/
    │   │   └── main.yml
    │   └── templates/
    │       └── k8s-network.yaml.j2
    ├── k8s_init_cluster/
    │   ├── defaults/
    │   │   └── main.yml
    │   ├── tasks/
    │   │   └── main.yml
    │   └── templates/
    │       └── kubeadm-config.yaml.j2
    └── k8s_join_control_plane/
        └── tasks/
            └── main.yml
```

### 10.2 Inventory File

Create `ansible/inventory/hosts.yml`:

```yaml
---
all:
  children:
    control_plane_nodes:
      hosts:
        k8s-cp-01:
          ansible_host: 10.8.16.86
          control_plane_ip: 10.8.18.86
        k8s-cp-02:
          ansible_host: 10.8.16.87
          control_plane_ip: 10.8.18.87
        k8s-cp-03:
          ansible_host: 10.8.16.88
          control_plane_ip: 10.8.18.88
      vars:
        ansible_user: ubuntu  # Adjust as needed
        ansible_ssh_private_key_file: ~/.ssh/id_ed25519  # Adjust as needed
        k8s_role: control_plane
```

### 10.3 Playbooks

#### Setup Control Plane Nodes

Create `ansible/playbooks/setup_control_plane.yml`:

```yaml
---
- name: Set up Kubernetes Control Plane Nodes
  hosts: control_plane_nodes
  become: yes
  
  roles:
    - role: k8s_control_plane
```

#### Initialize Kubernetes Cluster

Create `ansible/playbooks/init_kubernetes_cluster.yml`:

```yaml
---
- name: Initialize Kubernetes Cluster
  hosts: k8s-cp-01  # Only run on first control plane node
  become: yes
  
  roles:
    - role: k8s_init_cluster
```

#### Join Additional Control Plane Nodes

Create `ansible/playbooks/join_control_plane_nodes.yml`:

```yaml
---
- name: Join Additional Control Plane Nodes
  hosts: control_plane_nodes:!k8s-cp-01  # All control plane nodes except the first one
  become: yes
  
  roles:
    - role: k8s_join_control_plane
```

### 10.4 Running the Playbooks

Execute the playbooks in sequence:

```bash
# 1. Set up all control plane nodes
ansible-playbook -i ansible/inventory/hosts.yml ansible/playbooks/setup_control_plane.yml

# 2. Initialize the first control plane node
ansible-playbook -i ansible/inventory/hosts.yml ansible/playbooks/init_kubernetes_cluster.yml

# 3. Join additional control plane nodes
ansible-playbook -i ansible/inventory/hosts.yml ansible/playbooks/join_control_plane_nodes.yml
```

## 11. Troubleshooting

### 11.1 Common Issues

#### Node Not Joining Cluster

If a node fails to join the cluster:

```bash
# Check kubelet status
sudo systemctl status kubelet

# View kubelet logs
sudo journalctl -xeu kubelet

# Reset kubeadm (if needed)
sudo kubeadm reset
```

#### Network Issues

If pods can't communicate:

```bash
# Check Cilium status
cilium status

# Check pod networking
kubectl get pods -A -o wide
```

#### Certificate Issues

If you encounter certificate problems:

```bash
# Regenerate certificates
sudo kubeadm init phase upload-certs --upload-certs

# Get new certificate key
sudo kubeadm init phase upload-certs --upload-certs | grep -A1 "certificate key"
```

## 12. Verification and Testing

### 12.1 Verify Cluster Status

```bash
# Check node status
kubectl get nodes -o wide

# Check pod status
kubectl get pods -A

# Check control plane components
kubectl get pods -n kube-system
```

### 12.2 Test Cluster Functionality

```bash
# Create a test deployment
kubectl create deployment nginx --image=nginx

# Expose the deployment
kubectl expose deployment nginx --port=80 --type=NodePort

# Get service details
kubectl get svc nginx

# Test access
curl http://<node-ip>:<node-port>
```

## 13. Next Steps

After successfully setting up the control plane nodes:

1. Set up worker nodes
2. Configure persistent storage
3. Deploy essential services (monitoring, logging)
4. Implement backup and disaster recovery
5. Configure load balancing for external access

## 14. References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Ubuntu Raspberry Pi Documentation](https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi)
- [Cilium Documentation](https://docs.cilium.io/)
- [Ansible Documentation](https://docs.ansible.com/)

---

This document provides a comprehensive guide for setting up Kubernetes control plane nodes on Raspberry Pi 5 hardware. Follow the steps sequentially for a successful deployment.
