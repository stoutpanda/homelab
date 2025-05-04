Updated README.md
markdown# Homelab Infrastructure Management

This repository contains configuration and documentation for managing a homelab infrastructure with a focus on Kubernetes setup on Ubuntu using Raspberry Pi 5 hardware.

## Project Structure

- `ansible/`: Contains Ansible playbooks and roles focused on Kubernetes deployment and management
  - `playbooks/`: Organized playbooks for Kubernetes components
  - `roles/`: Reusable Ansible roles, primarily for Kubernetes
  - `inventory/`: Host definitions and variables
  - `vault/`: Encrypted credential files for Kubernetes credentials

- `documentation/`: Project documentation including Kubernetes setup and transition plans
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

Set up the Ansible Vault credentials file:
bash# Create and encrypt the vault file
ansible-vault create ansible/vault/credentials.yml
Add credentials following the structure in documentation/ansible_vault_usage.md

Usage
Run Ansible playbooks with the vault password:
bashansible-playbook ansible/playbooks/path/to/playbook.yml --ask-vault-pass
Or use a vault password file:
bashansible-playbook ansible/playbooks/path/to/playbook.yml --vault-password-file=~/.vault_pass.txt
Current Status

Basic infrastructure setup is complete
SSH connectivity established to all nodes
k8sadmin user created across all nodes with secure authentication
Ansible Vault integration functioning for secure credential storage

Next steps involve installing and configuring Kubernetes components across the cluster.
Secrets Management
This project uses Ansible Vault for storing sensitive credentials and configuration:

SSH keys for automation
Kubernetes API credentials and tokens

See documentation/ansible_vault_usage.md for detailed instructions on using Ansible Vault.
Contributing

Follow the coding guidelines in CLAUDE.md
Keep all secrets out of version control
Use uv exclusively for Python package management
Update documentation after making changes