3. Implementation Phases
Phase 0: Automation & Security Infrastructure Setup
Basic Network Connectivity Setup (New Sub-phase)

Configure basic network access to K8s-Admin-Box (10.0.1.223)
Ensure reliable SSH access for subsequent automation tasks
Create backup of current network configurations
Document pre-implementation state for rollback purposes
Ansible Configuration Management Setup

Install Ansible on K8s-Admin-Box (10.0.1.223)
Create Ansible directory structure:
/opt/ansible/
├── inventory/
│   ├── hosts.yml
│   └── group_vars/
├── playbooks/
│   ├── network/
│   ├── kubernetes/
│   └── verification/
├── roles/
│   ├── unifi/
│   ├── mikrotik/
│   └── kubernetes/
└── ansible.cfg
Configure Ansible inventory with network device groups:
unifi_devices
mikrotik_devices
kubernetes_nodes
control_plane_nodes
worker_nodes
Create UniFi API integration roles and playbooks
Create MikroTik API integration roles and playbooks
Create Kubernetes node configuration roles and playbooks
Secrets Management Implementation -- COMPLETED

Primary Vault Installation:

✅ Ansible Vault installed and accessible
✅ Vault initialized and unsealed
✅ AppRole authentication method enabled for Ansible integration (Role ID and Secret ID generated)
✅ Created KV v2 secret engines for required environments:
   - network/unifi - For UniFi Controller credentials
   - network/mikrotik - For MikroTik API credentials
   - kubernetes/certificates - For Kubernetes certificates
   - kubernetes/tokens - For Kubernetes API tokens
✅ Set up appropriate policies for secure access
✅ Store critical credentials:
   - UniFi Controller credentials
   - SSH keys for network devices
   - MikroTik API credentials
✅ Removed sensitive vault_config.yml from Git history
✅ Encrypted vault_config.yml using Ansible Vault
✅ Rotated Ansible Vault AppRole credentials
✅ Set up Ansible integration with Ansible Vault
Configure automated credential rotation policies

Configure automated backups for:
Vault data
Network device configurations
UDM-PRO settings
Ansible playbooks and inventory
Set up off-site backup destination
Implement backup testing and verification
Phase 0 Verification (New)

Verify Ansible connectivity to all targeted devices
Confirm Vault initialization and unsealing processes
Test Vault replication to Unraid backup
Validate backup and restore procedures
Test Git workflow with sample configuration change
Phase 1: DHCP Reconfiguration - READY TO EXECUTE
Current DHCP Range: 10.0.1.200 - 10.0.1.250
New DHCP Range: 10.0.1.200 - 10.0.1.220
Infrastructure Range: 10.0.1.1 - 10.0.1.99 (static)
Static Client Range: 10.0.1.221 - 10.0.1.254 (reserved)

✅ Playbook created: configure_udm_dhcp.yml
✅ Vault integration completed for secure credential storage
✅ Security issue resolved: removed sensitive credentials from Git history
✅ Updated playbooks to handle encrypted vault_config.yml
✅ Backup procedures implemented before configuration changes
✅ Static reservations for infrastructure devices configured

## Status as of April 23, 2025:

### Security Improvements Completed
1. Removed vault_config.yml containing sensitive credentials from Git history
2. Encrypted the vault_config.yml file with Ansible Vault
3. Rotated Ansible Vault AppRole credentials
4. Updated playbooks to properly use encrypted vault files
5. Created comprehensive documentation in the README
6. Pushed all security improvements to GitHub

### Current Blockers
~RESOLVED~ UniFi API authentication issues when running playbooks
  - Created updated authentication module that supports multiple API versions
  - Implemented version detection to automatically use the correct API endpoints
  - Verified working authentication with UDM Pro controller
  - Fixed logout handling for controllers returning 403 Forbidden
  - Updated all playbooks to use the improved authentication module

### Next Steps
1. **✅ Fix UniFi API Authentication**:
   - ✅ Created updated authentication module (authenticate_api_updated.yml)
   - ✅ Reconciled API endpoints between legacy and integration APIs
   - ✅ Added support for API token and username/password authentication
   - ✅ Created documentation for API differences in unifi_api_reconciliation.md
   - ✅ Tested working authentication with UDM Pro (using /api/auth/login endpoint)
   - ✅ Updated API endpoints to handle proxy paths for UDM controllers
   - ✅ Added token expiration handling and automatic fallback to username/password authentication
   - ✅ Created token rotation playbook for refreshing expired API tokens

2. **✅ Test Updated API Integration**:
   - ✅ Created test_updated_auth_module.yml for verifying API authentication
   - ✅ Verified compatibility with UDM Pro controllers
   - ✅ Added endpoint mapping for both legacy and UDM controllers
   - ✅ Implemented token skip capability for force-refreshing credentials
   - ✅ Fixed logout handling for controllers returning 403 Forbidden
   - ✅ Improved endpoint path mapping for different controller types
   - ✅ Enhanced debug logging for authentication troubleshooting-
  - ✅ Enhanced UniFi API token rotation with secure Ansible Vault integration
- ✅ Fixed vault path structure for proper token storage and retrieval
- ✅ Automated token refresh process to improve security posture
- # Change Tracking: Homelab Ansible Network

## 2025-04-25
- Refactored `update_unifi_token.yml` to always store UniFi credentials in Vault under a `data` key for compatibility.
- This fixes failures caused by mismatched secret structures after token rotation.
- No downstream playbook or role changes required.

## 2025-04-28
- Completed migration from Bitwarden Secrets Manager to Ansible Vault
  - Updated authentication files to use Ansible Vault
  - Removed outdated authentication files (authenticate_api_standardized.yml, authenticate_api_updated.yml)
  - Created standardized task for Ansible Vault secret retrieval in common/tasks/get_vault_credentials.yml
  - Updated verify_dhcp.yml to use Ansible Vault for credentials
  - Removed empty directories (ansible/playbooks/network/ and ansible/playbooks/vault/)
- Added UniFi client inventory generation capability
  - Created generate_client_inventory.yml task file
  - Created generate_client_inventory.yml playbook
  - Updated UniFi role's main.yml to include client inventory task
  - Utilizing existing unifi_client_inventory templates

## 2025-04-28
- Updated Ansible Vault credentials in ansible/vault/credentials.yml
- Configured essential parameters including access token, identity server, API server, organization ID, and project ID
- Verified ansible/vault/credentials.yml is properly included in .gitignore to prevent accidental exposure

## 2025-04-29
- Migrated from Bitwarden Secrets Manager to Ansible Vault for all secrets management
- Created a single vault/credentials.yml file containing all credentials
- Updated all roles and playbooks to use Ansible Vault instead of Bitwarden
- Created comprehensive documentation for using Ansible Vault
- Removed all Bitwarden-specific integration code and dependencies
- Created verification playbook for testing Ansible Vault integration
- Converted existing authentication modules to use Ansible Vault
- Cleaned up project by removing:
  - Bitwarden verification and test playbooks
  - Bitwarden SDK library files and examples
  - Bitwarden documentation
  - Obsolete credential files and examples
  - Unused retrieval playbooks
- Completed DHCP range change on Unfi, and assigned all network equipment IPS.
- Created new VLANS and subnets on UDM-PRO.

## 2025-04-30
- **UDM-PRO Configuration:**
  - Created all required VLANs (1, 2, 3, 4, 5, 6, 10, 16, 18, 28, 38, 48, 58)
  - Defined inter-VLAN routing policies
  - Set up DHCP services for each VLAN
  - Configured firewall rules for VLAN isolation:
    - Allowed 10.0.1.0/24 (Default) subnet access to K8s-Admin-Box (10.8.16.85)
    - Allowed 10.0.3.0/24 (Family) subnet access to K8s-Admin-Box (10.8.16.85)
  - Implemented appropriate ACLs for other inter-VLAN communication
  - Enabled routing between VLAN 1 and VLAN 16 for management
- **Enterprise-24-PoE-Main Switch (10.0.1.239) Port Profiles:**
  - Created "All VLANs Trunk" profile (All VLANs tagged, VLAN 1 native, PoE, 1Gbps)
  - Created "K8s Trunk" profile (VLANs 1, 16, 18, 28, 38, 48, 58 tagged, VLAN 1 native, auto-negotiate)
  - Created "AP Profile" (VLANs 1, 2, 3 tagged, VLAN 1 native, PoE, 2.5Gbps)
  - Created "IoT Profile" (VLAN 2 native, no tagging, PoE, 1Gbps)
  - Created "Family Profile" (VLAN 3 native, no tagging, no PoE, 1Gbps)
  - Created "Work Profile" (VLAN 4 native, no tagging, no PoE, 1Gbps)
  - Created "Security Profile" (VLAN 5 native, no tagging, PoE, 1Gbps)
  - Created "Server Profile" (VLANs 1, 6, 10 tagged, VLAN 1 native, no PoE, 10Gbps)
- **K8s Control Plane Switch Setup:**
  - Configured VLANs on switch ports for control plane nodes.
  - Set DHCP reservations for K8s Admin Box (updated IP 10.8.16.85) and k8s-cp-01 - 03 (using VLAN 16 IPs).
  - **Note:** Encountered limitation: Native VLANs with custom tagged VLANs are not supported on the K8s switch (USW-Flex-2.5G-K8s-Main?). K8s-CP nodes and Admin box currently only have access via their primary (VLAN 16 / VLAN 18) interfaces configured on the switch ports.




### Kubernetes Cluster Setup

# Kubernetes Homelab Project Progress - May 4, 2025

## Completed Tasks

- ✅ Created basic Ansible directory structure (`~/projects/homelab/ansible/`)
- ✅ Set up Python environment using `uv`
- ✅ Created initial inventory file with Raspberry Pi nodes
- ✅ Verified network connectivity via ping to control plane IPs
- ✅ Resolved SSH authentication issues using SSH agent
- ✅ Generated dedicated SSH key for Kubernetes automation
- ✅ Created k8sadmin user on all nodes for secure management with vault-stored SSH key
- ✅ Implemented passwordless sudo for k8sadmin user
- ✅ Updated inventory to use k8sadmin user and dedicated SSH key
- ✅ Configured .gitignore to properly exclude Ansible Vault files
- ✅ Stored SSH keys securely in Ansible Vault
- ✅ Created recovery mechanism for SSH keys

## Current Infrastructure

- **Admin Node**: Raspberry Pi 5 (16GB RAM) running Ubuntu 25.04
  - IP: 10.8.16.85 (Management), 10.8.18.85 (Control Plane)
  - Role: Management of Kubernetes cluster

- **Control Plane Nodes**: 3x Raspberry Pi 5 (8GB RAM) running Ubuntu 24.10
  - k8s-cp-01: 10.8.16.86 (Management), 10.8.18.86 (Control Plane)
  - k8s-cp-02: 10.8.16.87 (Management), 10.8.18.87 (Control Plane)
  - k8s-cp-03: 10.8.16.88 (Management), 10.8.18.88 (Control Plane)
  - Will form a highly available control plane

## Next Steps

1. Install Kubernetes prerequisites on all nodes
   - Disable swap
   - Load required kernel modules
   - Configure system settings

2. Install container runtime (containerd)
   - Configure with systemd cgroup driver
   - Optimize for Raspberry Pi hardware

3. Install Kubernetes components
   - kubeadm, kubelet, kubectl (version 1.28.0)
   - Configure for arm64 architecture

4. Set up HA control plane
   - HAProxy and Keepalived for a virtual IP
   - Initialize the first control plane node
   - Join additional control plane nodes

5. Deploy Kubernetes networking (Cilium)
   - Configure optimal settings for Raspberry Pi
   - Set up network policies

## Learning Progress

- Gained understanding of Ansible inventory structure and connection methods
- Learned how to securely store and retrieve SSH keys using Ansible Vault
- Implemented proper user management across multiple nodes
- Configured SSH authentication for automation
- Established foundation for declarative infrastructure management

## Current Blockers

- None - Initial setup phases completed successfully

## Notes

- The project is intentionally proceeding step-by-step for learning purposes
- Network connectivity is established across all VLANs
- User and authentication mechanisms are in place
- Next focus will be Kubernetes component installation
