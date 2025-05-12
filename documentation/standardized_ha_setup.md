# Standardized High Availability Configuration for Kubernetes Control Plane

This document describes the standardized approach for setting up and troubleshooting the High Availability (HA) control plane configuration using HAProxy and Keepalived.

## Overview

The HA setup consists of:
- **HAProxy**: Load balances traffic to multiple Kubernetes API servers
- **Keepalived**: Manages a virtual IP (VIP) that floats between control plane nodes

## Key Components

### 1. Standard Variables

Consistent variables used across all playbooks:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `k8s_api_vip` | Virtual IP for the Kubernetes API | 10.8.18.2 |
| `k8s_api_port` | Port used by the Kubernetes API server | 6443 |
| `k8s_ha_port` | Port HAProxy listens on for frontend connections | 16443 |

### 2. Standard Templates

Two standardized templates are used:

#### HAProxy Configuration (`standard_haproxy.cfg.j2`)
- Binds to all interfaces (0.0.0.0) on port `k8s_ha_port`
- Routes traffic to all control plane nodes on port `k8s_api_port`
- Uses TCP mode with proper health checks

#### Keepalived Configuration (`standard_keepalived.conf.j2`)
- Dynamically detects the correct network interface
- Sets appropriate master/backup states based on node role
- Uses reliable health check via systemctl
- Configures VIP from the `k8s_api_vip` variable

### 3. Standard Playbooks

#### Primary Setup: `setup_ha_control_plane_standardized.yml`
- Installs and configures both HAProxy and Keepalived
- Sets up systemd dependencies to ensure proper startup order
- Validates configurations before applying
- Verifies the setup after completion

#### Troubleshooting: `troubleshoot_ha_setup.yml`
- Diagnoses issues with the HA configuration
- Automatically fixes common problems
- Can force reconfiguration with the `force_reconfigure` variable
- Verifies services after fixes are applied

#### Certificate Management: `sync_k8s_ca_certificates.yml`
- Synchronizes CA certificates across all control plane nodes
- Configures secure API server access through the VIP
- Updates kubeconfig to use the VIP with proper certificate validation
- Restarts API servers to apply certificate changes

## Usage

### Initial Setup

```bash
cd ansible
ansible-playbook playbooks/k8s/cluster/setup_ha_control_plane_standardized.yml
```

### Certificate Synchronization

If you need to fix certificate validation issues:

```bash
cd ansible
ansible-playbook playbooks/k8s/cluster/sync_k8s_ca_certificates.yml
```

### Troubleshooting

For diagnosing and fixing issues:

```bash
cd ansible
ansible-playbook playbooks/k8s/cluster/troubleshoot_ha_setup.yml
```

To force a complete reconfiguration:

```bash
cd ansible
ansible-playbook playbooks/k8s/cluster/troubleshoot_ha_setup.yml -e "force_reconfigure=true"
```

## Technical Details

### Service Dependencies

HAProxy depends on Keepalived being active first. This is configured using a systemd override:

```
[Unit]
After=keepalived.service
Requires=network-online.target
```

### Networking Configuration

- Keepalived monitors the interface with the 10.8.18.x IP address
- HAProxy binds to 0.0.0.0 (all interfaces) to avoid binding issues
- VIP is configured as 10.8.18.2/24

### Health Checks

- Keepalived uses `/usr/bin/systemctl is-active haproxy` to check HAProxy status
- HAProxy checks each control plane node with TCP health checks

### Certificate Configuration

For proper certificate validation with the VIP:

1. The Kubernetes API server certificates must include the VIP in Subject Alternative Names (SANs)
2. The kubeadm-config.yaml template includes the VIP in the certSANs section:
   ```yaml
   apiServer:
     certSANs:
       - {{ hostvars['k8s-cp-01']['ansible_host'] }}
       - {{ hostvars['k8s-cp-02']['ansible_host'] }}
       - {{ hostvars['k8s-cp-03']['ansible_host'] }}
       - {{ k8s_api_vip }}  # Include VIP in certificates
       - localhost
       - 127.0.0.1
   ```
3. Kubeconfig must be updated to use the VIP with proper certificate validation:
   ```bash
   kubectl config set-cluster kubernetes --server=https://10.8.18.2:16443
   kubectl config set-cluster kubernetes --certificate-authority=/etc/kubernetes/pki/ca.crt --embed-certs=true
   kubectl config set-cluster kubernetes --insecure-skip-tls-verify=false
   ```

## Verification

You can verify your HA setup is working by:

1. Checking if the VIP is assigned to one of the nodes:
   ```
   ip addr show | grep 10.8.18.2
   ```

2. Testing API server connectivity through the VIP:
   ```
   curl -k https://10.8.18.2:16443/healthz
   ```

3. Verifying kubectl works with the VIP:
   ```
   kubectl --kubeconfig=/home/k8sadmin/.kube/config get nodes
   ```

4. Verifying secure TLS connection without certificate warnings:
   ```
   curl --cacert /etc/kubernetes/pki/ca.crt https://10.8.18.2:16443/healthz
   ```

5. Checking the certificate includes the VIP:
   ```
   echo | openssl s_client -showcerts -connect 10.8.18.2:16443 2>/dev/null | openssl x509 -text | grep -A1 'Subject Alternative Name'
   ```

## Troubleshooting Common Issues

1. **VIP not assigned to any node**
   - Check Keepalived status: `systemctl status keepalived`
   - Verify network interface detection: `ip -br addr | grep -w '10.8.18'`

2. **HAProxy not binding correctly**
   - Check if port is already in use: `netstat -tulpn | grep 16443`
   - Verify HAProxy config: `haproxy -c -f /etc/haproxy/haproxy.cfg`

3. **API server unreachable through VIP**
   - Verify HAProxy is running: `systemctl status haproxy`
   - Check Kubernetes API server status on all nodes

4. **TLS certificate validation issues**
   - Verify the VIP is included in API server certificate SANs
   - Check if CA certificates are consistent across all nodes
   - If needed, run `sync_k8s_ca_certificates.yml` to fix certificate issues
   - Use `kubectl config view` to verify insecure-skip-tls-verify is set to false