# UniFi Client Inventory

This documentation covers how to use the Ansible roles to generate a client inventory from your UniFi controller.

## Overview

The UniFi client inventory functionality connects to your UniFi controller via its API to retrieve information about all connected and recently connected devices. This data is formatted into both JSON and CSV files for easy consumption.

## Prerequisites

- A running UniFi controller
- Proper credentials configured in your Ansible Vault
- Ansible installed on your machine

## Configuration

### Vault Setup

Ensure your Ansible Vault (`ansible/vault/credentials.yml`) contains UniFi credentials:

```yaml
# UniFi Controller credentials
unifi_credentials:
  url: "https://10.0.1.1"  # Your UniFi controller URL
  username: "admin"
  password: "your-unifi-password-here"
  api_token: "your-api-token-here"  # Optional
```

## Running the Inventory Generation

To generate a client inventory:

```bash
# Use the example playbook
ansible-playbook ansible/playbooks/examples/generate_unifi_client_ips.yml --ask-vault-pass

# Or use the dedicated playbook
ansible-playbook ansible/playbooks/unifi/generate_client_inventory.yml --ask-vault-pass
```

## Output Files

The script generates two files in the specified inventory directory:

1. `unifi_client_inventory.json` - JSON format with detailed client data
2. `unifi_client_inventory.csv` - CSV format with essential client information

## Customizing Output

You can customize the output by modifying the templates:

- `ansible/roles/unifi/templates/unifi_client_inventory.j2` - JSON/Markdown template
- `ansible/roles/unifi/templates/unifi_client_inventory.csv.j2` - CSV template

## Troubleshooting

- **Authentication Errors**: Verify your credentials in the vault file
- **Missing API Token**: The role supports both token and username/password authentication
- **Empty Inventory**: Check if clients are actually connected to your network
- **API Access Issues**: Ensure your controller's API access is enabled

## Advanced Usage

### Filtering Clients

To filter clients, you can modify the templates to include only specific types of devices or networks.

### Scheduling Regular Inventory

Use cron to schedule regular inventory updates:

```bash
# Add to crontab
0 * * * * cd /path/to/homelab && ansible-playbook ansible/playbooks/unifi/generate_client_inventory.yml --vault-password-file=~/.vault_pass.txt
```