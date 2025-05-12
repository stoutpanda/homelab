# Kubernetes Cluster Management Playbooks

This directory contains Ansible playbooks for managing the Kubernetes cluster, with a focus on high availability control plane setup and maintenance.

## Playbook Overview

### Cluster Initialization

- `initialize_kubernetes_cluster.yml` - Initializes the first control plane node
- `join_remaining_control_pane_nodes.yml` - Joins additional control plane nodes to the cluster

### High Availability Setup

- `setup_ha_control_plane.yml` - Original HA setup with HAProxy and Keepalived
- `setup_ha_control_plane_standardized.yml` - Improved standardized HA setup
- `improved_ha_setup.yml` - Further enhancements to the HA setup

### Certificate Management

- `sync_k8s_ca_certificates.yml` - Synchronizes CA certificates across all control plane nodes and configures secure access to the Kubernetes API through the VIP with proper certificate validation

### Troubleshooting and Maintenance

- `troubleshoot_ha_setup.yml` - Diagnoses and fixes issues with the HA configuration
- `debug_kubernetes_cluster.yml` - Collects diagnostic information from the cluster
- `reset_kubernetes_cluster.yml` - Resets the Kubernetes cluster for redeployment

## Template Files

The `templates/` directory contains Jinja2 templates used by the playbooks:

- `haproxy.cfg.j2` - Original HAProxy configuration template
- `improved_haproxy.cfg.j2` - Enhanced HAProxy config with better defaults
- `standard_haproxy.cfg.j2` - Standardized HAProxy configuration
- `keepalived.conf.j2` - Original Keepalived configuration template
- `improved_keepalived.conf.j2` - Enhanced Keepalived config with better health checks
- `standard_keepalived.conf.j2` - Standardized Keepalived configuration
- `kubeadm-config.yaml.j2` - Kubernetes initialization configuration, includes VIP in certificate SANs

## Using the Playbooks

### Setting Up High Availability

For initial HA setup (preferred standardized approach):

```bash
cd ansible
ansible-playbook playbooks/k8s/cluster/setup_ha_control_plane_standardized.yml
```

### Fixing Certificate Validation Issues

If you encounter TLS certificate validation issues when accessing the Kubernetes API through the VIP:

```bash
cd ansible
ansible-playbook playbooks/k8s/cluster/sync_k8s_ca_certificates.yml
```

This playbook performs the following actions:
1. Creates a backup of existing certificates
2. Synchronizes CA certificates from the first control plane node to all others
3. Restarts the API server to use the updated certificates
4. Updates kubeconfig to use the VIP with proper certificate validation
5. Tests connectivity to confirm the fix

### Troubleshooting High Availability

If you're having issues with the HA setup:

```bash
cd ansible
ansible-playbook playbooks/k8s/cluster/troubleshoot_ha_setup.yml
```

For more comprehensive documentation on the HA setup, see `/home/jason/projects/homelab/documentation/standardized_ha_setup.md`.

## Common Issues and Solutions

### Certificate Validation Errors

When accessing the Kubernetes API through the VIP, you might see certificate validation errors if the VIP is not included in the API server certificate's Subject Alternative Names (SANs).

**Solution**: Run the `sync_k8s_ca_certificates.yml` playbook to fix certificate issues.

### HAProxy Binding Issues

If HAProxy fails to bind to the VIP, it could be because:
- The VIP is not assigned to any node (Keepalived issue)
- Another service is using the same port

**Solution**: Check Keepalived status and HAProxy logs, then run the `troubleshoot_ha_setup.yml` playbook.

### API Server Unreachable

If the API server is unreachable through the VIP:
- Check if HAProxy is running
- Verify that the API server is running on all control plane nodes
- Ensure the correct ports are configured

**Solution**: Run `debug_kubernetes_cluster.yml` to collect diagnostic information and identify the issue.