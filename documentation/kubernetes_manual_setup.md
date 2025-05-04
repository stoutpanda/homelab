# Manual Kubernetes Setup on Ubuntu

This guide provides a step-by-step process for manually installing and configuring Kubernetes on Ubuntu. This approach is designed to deepen understanding of Kubernetes components and cluster setup without relying on automation tools.

## Prerequisites

- Ubuntu 20.04 LTS or later installed on all nodes
- At least 2 GB RAM per node
- Network connectivity between nodes
- Sudo privileges on all nodes
- Disable swap on all nodes (`sudo swapoff -a`)

## Step 1: Prepare the Nodes

1. Update package index and install dependencies:
   ```bash
   sudo apt update
   sudo apt install -y apt-transport-https ca-certificates curl
   ```

2. Disable swap:
   ```bash
   sudo swapoff -a
   sudo sed -i '/ swap / s/^/#/' /etc/fstab
   ```

3. Load necessary kernel modules:
   ```bash
   sudo modprobe overlay
   sudo modprobe br_netfilter
   ```

4. Configure sysctl parameters for Kubernetes networking:
   ```bash
   cat <<EOF | sudo tee /etc/sysctl.d/kubernetes.conf
   net.bridge.bridge-nf-call-ip6tables = 1
   net.bridge.bridge-nf-call-iptables = 1
   net.ipv4.ip_forward = 1
   EOF
   sudo sysctl --system
   ```

## Step 2: Install Container Runtime (containerd)

1. Install containerd:
   ```bash
   sudo apt install -y containerd
   ```

2. Configure containerd:
   ```bash
   sudo mkdir -p /etc/containerd
   sudo containerd config default | sudo tee /etc/containerd/config.toml
   sudo systemctl restart containerd
   sudo systemctl enable containerd
   ```

## Step 3: Install Kubernetes Components

1. Add Kubernetes apt repository:
   ```bash
   curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
   sudo apt-add-repository "deb http://apt.kubernetes.io/ kubernetes-xenial main"
   sudo apt update
   ```

2. Install kubeadm, kubelet, and kubectl:
   ```bash
   sudo apt install -y kubelet kubeadm kubectl
   sudo apt-mark hold kubelet kubeadm kubectl
   ```

## Step 4: Initialize the Kubernetes Control Plane

1. On the master node, initialize the cluster:
   ```bash
   sudo kubeadm init --pod-network-cidr=10.244.0.0/16
   ```

2. Set up kubeconfig for the regular user:
   ```bash
   mkdir -p $HOME/.kube
   sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
   sudo chown $(id -u):$(id -g) $HOME/.kube/config
   ```

## Step 5: Deploy a Pod Network Add-on

1. Install Flannel network plugin:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
   ```

## Step 6: Join Worker Nodes

1. On each worker node, run the join command provided by `kubeadm init` output, e.g.:
   ```bash
   sudo kubeadm join <master-ip>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
   ```

## Step 7: Verify the Cluster

1. Check node status:
   ```bash
   kubectl get nodes
   ```

2. Deploy a test application:
   ```bash
   kubectl create deployment nginx --image=nginx
   kubectl expose deployment nginx --port=80 --type=NodePort
   ```

3. Verify the deployment:
   ```bash
   kubectl get pods
   kubectl get services
   ```

## Additional Notes

- This manual setup provides foundational knowledge for Kubernetes cluster management.
- Future automation can be built on top of this understanding.