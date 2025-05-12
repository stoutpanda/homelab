# Homelab Infrastructure Management

This repository contains configuration and documentation for managing a homelab infrastructure with a focus on Kubernetes setup on Ubuntu using Raspberry Pi 5 hardware.

## Project Structure

- `ansible/`: Contains Ansible playbooks and roles focused on Kubernetes deployment and management
  - `playbooks/`: Organized playbooks for Kubernetes components
    - `k8s/cluster/`: High availability control plane setup and management
    - `k8s/nodes/`: Node preparation and configuration
  - `roles/`: Reusable Ansible roles, primarily for Kubernetes
  - `inventory/`: Host definitions and variables
  - `vault/`: Encrypted credential files for Kubernetes credentials

- `documentation/`: Project documentation including Kubernetes setup and transition plans
  - `kubernetes_control_plane_setup.md`: Complete guide for setting up control plane nodes
  - `standardized_ha_setup.md`: Guide for high availability setup with HAProxy and Keepalived
- `misc_scripts/`: Utility scripts for the homelab
- `notes/`: Planning and implementation notes

## Learning Objectives

This project is designed as a learning environment for:
- Understanding Ansible automation principles and practices
- Learning Kubernetes components and architecture
- Implementing high-availability configurations
- Practicing secure credential management
- Developing skills in infrastructure as code

## Setup

1. Ensure you have Python 3.10+ installed
2. Set up the Python environment:
   ```bash
   cd ansible && uv venv && uv pip install -r requirements.txt
   ```

3. Set up the Ansible Vault credentials file:
   ```bash
   # Create and encrypt the vault file
   ansible-vault create ansible/vault/credentials.yml
   ```
   Add credentials following the structure in documentation/ansible_vault_usage.md

## Usage

Run Ansible playbooks with the vault password:
```bash
ansible-playbook ansible/playbooks/path/to/playbook.yml --ask-vault-pass
```

Or use a vault password file:
```bash
ansible-playbook ansible/playbooks/path/to/playbook.yml --vault-password-file=~/.vault_pass.txt
```

## Current Status

- Basic infrastructure setup is complete
- SSH connectivity established to all nodes
- k8sadmin user created across all nodes with secure authentication
- Ansible Vault integration functioning for secure credential storage
- Kubernetes components installed on all nodes
- High Availability control plane configured with HAProxy and Keepalived
- Certificate management for secure API access through VIP established

Next steps involve adding worker nodes and deploying essential services to the cluster.

## Key Playbooks

### Kubernetes Setup
- `ansible/playbooks/k8s/nodes/install_k8s_prerequisites.yml`: Prepares nodes for Kubernetes
- `ansible/playbooks/k8s/nodes/install_containerd.yaml`: Installs container runtime
- `ansible/playbooks/k8s/nodes/install_k8s_components.yml`: Installs Kubernetes components

### High Availability Control Plane
- `ansible/playbooks/k8s/cluster/initialize_kubernetes_cluster.yml`: Initializes the first control plane node
- `ansible/playbooks/k8s/cluster/join_remaining_control_pane_nodes.yml`: Joins additional control plane nodes
- `ansible/playbooks/k8s/cluster/setup_ha_control_plane_standardized.yml`: Sets up HA with HAProxy and Keepalived
- `ansible/playbooks/k8s/cluster/sync_k8s_ca_certificates.yml`: Fixes certificate validation issues for secure VIP access

## Secrets Management

This project uses Ansible Vault for storing sensitive credentials and configuration:

- SSH keys for automation
- Kubernetes API credentials and tokens

See documentation/ansible_vault_usage.md for detailed instructions on using Ansible Vault.

## Contributing

- Follow the coding guidelines in CLAUDE.md
- Keep all secrets out of version control
- Use uv exclusively for Python package management
- Update documentation after making changes