# Using Ansible Vault for Secrets Management

This guide explains how to use Ansible Vault in this project for securely storing and retrieving credentials related to Kubernetes deployment.

## Setup and Usage

### 1. Creating the Vault File

We use a single Vault file for Kubernetes credentials:

```bash
# Create an Ansible Vault encrypted file for credentials
ansible-vault create ansible/vault/credentials.yml
```

The structure of the vault file is:

```yaml
---
# Kubernetes credentials
kubernetes_credentials:
  apiserver: "https://10.0.0.1:6443"
  username: "admin"
  password: "your-k8s-password-here"
  token: "your-k8s-token-here"  # Optional

# Add any other credential groups as needed
```

### 2. Encrypting and Decrypting the Vault

```bash
# Encrypt the vault file
ansible-vault encrypt ansible/vault/credentials.yml

# View vault contents
ansible-vault view ansible/vault/credentials.yml

# Edit vault contents
ansible-vault edit ansible/vault/credentials.yml

# Decrypt vault (only if needed, generally not recommended)
ansible-vault decrypt ansible/vault/credentials.yml
```

### 3. Using Vault Credentials in Playbooks

To load credentials from the vault:

```yaml
- name: Load credentials from Ansible Vault
  include_vars:
    file: "{{ playbook_dir }}/../vault/credentials.yml"
  no_log: true
```

For roles that require credentials, we provide a common task:

```yaml
# First, include the vault credentials in your playbook if not already included
- name: Load credentials from Ansible Vault
  include_vars:
    file: "{{ playbook_dir }}/../vault/credentials.yml"
  no_log: true

# Then include the credentials retrieval task
- name: Include Ansible Vault credentials retrieval
  include_tasks: roles/common/tasks/get_vault_credentials.yml
  vars:
    credential_type: "kubernetes"  # Type of credentials (kubernetes)
    credential_var_name: "k8s_auth"  # Name of the variable to store credentials
    device_name: "default"  # Optional, for accessing device-specific credentials

# Use the credentials
- name: Use the retrieved credentials
  debug:
    msg: "Successfully retrieved credentials for {{ credential_type }}"
  no_log: true
```

### 4. Running Playbooks with Vault

```bash
# With password prompt
ansible-playbook ansible/playbooks/your-playbook.yml --ask-vault-pass

# With password file (protect this file)
ansible-playbook ansible/playbooks/your-playbook.yml --vault-password-file=~/.vault_pass.txt

# Using Vault ID for multiple vaults (if needed in the future)
ansible-playbook ansible/playbooks/your-playbook.yml --vault-id=homelab@~/.vault_pass_homelab.txt
```

## Testing Your Vault Setup

Test your Ansible Vault integration:

```bash
ansible-playbook ansible/playbooks/verification/test_ansible_vault.yml --ask-vault-pass
```

## Best Practices

1. **Never commit unencrypted vault files** to version control
2. **Use no_log: true** when working with sensitive data
3. **Use separate vault files** for different environments if needed
4. **Regularly rotate passwords** in the vault
5. **Back up your vault files** securely
6. **Limit access** to vault password files

## Troubleshooting

- **Vault Decryption Failed**: Check your vault password
- **Missing Credentials**: Verify the structure of your vault file
- **Permission Issues**: Ensure the vault file is readable by Ansible