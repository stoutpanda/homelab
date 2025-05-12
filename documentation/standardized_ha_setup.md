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

## Usage

### Initial Setup

```bash
cd ansible
ansible-playbook playbooks/k8s/cluster/setup_ha_control_plane_standardized.yml
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