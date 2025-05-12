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


K8s Homelab Project Progress - May 4, 2025
Completed Tasks

✅ Set up Python environment using uv
✅ Created initial inventory file with Raspberry Pi nodes
✅ Verified network connectivity via ping tests
✅ Generated dedicated SSH key for Kubernetes automation
✅ Created k8sadmin user on all nodes for secure management
✅ Implemented passwordless sudo for k8sadmin user
✅ Updated inventory to use k8sadmin user and dedicated SSH key
✅ Configured .gitignore to properly exclude Ansible Vault files
✅ Stored SSH keys securely in Ansible Vault
✅ Created recovery mechanism for SSH keys
✅ Structured Ansible environment with proper group variables location
✅ Created network configuration playbooks for control plane nodes
✅ Successfully applied network configuration to all control plane nodes
✅ Created hosts file entries for internal resolution
✅ Set up netboot.xyz on Unraid for future MS01 worker node OS installation
✅ Configured Intel vPro management interfaces for remote worker node management
✅ Improved Ansible handling of netplan configuration to avoid hanging issues
✅ Recovered and verified all control plane nodes after network reconfiguration

Current Infrastructure

Admin Node: Raspberry Pi 5 (16GB RAM) running Ubuntu 25.04

IP: 10.8.16.85 (Management), 10.8.18.85 (Control Plane)
Role: Management of Kubernetes cluster


Control Plane Nodes: 3x Raspberry Pi 5 (8GB RAM) running Ubuntu 24.10

k8s-cp-01: 10.8.18.86 (Control Plane)
k8s-cp-02: 10.8.18.87 (Control Plane)
k8s-cp-03: 10.8.18.88 (Control Plane)
All nodes have static IP configuration and proper DNS settings


Planned Worker Nodes: 2x Minisforum MS-01 nodes (not yet installed)

Future IPs:

k8s-ms-01-node-1: Management: 10.8.16.90, Control Plane: 10.8.18.90, vPro: 10.8.16.190
k8s-ms-01-node-2: Management: 10.8.16.91, Control Plane: 10.8.18.91, vPro: 10.8.16.191


OS to be installed via netboot.xyz configured on Unraid
vPro management interfaces configured and tested



# Kubernetes Homelab Progress - May 6, 2025

## Today's Accomplishments

- ✅ Successfully installed Kubernetes prerequisites on all control plane nodes
- ✅ Installed containerd as the container runtime
- ✅ Installed Kubernetes components (kubeadm, kubelet, kubectl v1.33.0)
- ✅ Initialized first control plane node (k8s-cp-01)
- ✅ Installed Cilium CNI v1.17.3
- ✅ Joined additional control plane nodes (k8s-cp-02, k8s-cp-03)
- ✅ Created a functioning 3-node high availability control plane
- ✅ Initial setup of HAProxy and Keepalived for HA (needs troubleshooting)

## Current Status

| Component            | Status    | Notes                                    |
|----------------------|-----------|------------------------------------------|
| Control Plane Nodes  | ✅ Ready   | All 3 nodes running and in Ready status  |
| Container Runtime    | ✅ Ready   | containerd 2.0.0 installed and running   |
| CNI Plugin           | ✅ Ready   | Cilium 1.17.3 installed and operational  |
| API Server           | ✅ Ready   | Accessible via individual node IPs       |
| Control Plane HA     | ⚠️ In Progress | HAProxy/Keepalived installed but VIP not accessible |
| Worker Nodes         | 🔜 Planned | Not yet started                          |

## Next Steps

1. **Troubleshoot and Fix HA Configuration**:
   - Debug "no route to host" error for VIP (10.8.18.2)
   - Check Keepalived logs and interface configuration
   - Verify firewall/network rules for VIP
   - Confirm HAProxy configuration

2. **Join Worker Nodes**:
   - Prepare worker node prerequisite playbook
   - Join MS-01 nodes to the cluster

3. **Set Up Storage**:
   - Configure persistent storage solution
   - Set up StorageClass for Kubernetes

## Playbooks Created

1. `install_k8s_prerequisites.yml` - Installs all prerequisites
2. `install_containerd.yml` - Installs container runtime
3. `install_kubernetes_components.yml` - Installs Kubernetes components
4. `initialize_kubernetes_cluster.yml` - Sets up first control plane node 
5. `join_control_plane_nodes.yml` - Joins additional control plane nodes
6. `setup_ha_control_plane.yml` - Added, but VIP configuration needs troubleshooting

## Commands to Resume Tomorrow

```bash
# Check the status of Keepalived and HAProxy services
ansible control_plane_nodes -m shell -a "systemctl status keepalived" --become
ansible control_plane_nodes -m shell -a "systemctl status haproxy" --become

# Check if virtual IP is assigned to any node
ansible control_plane_nodes -m shell -a "ip addr show" --become | grep '10.8.18.2'

# Check Keepalived logs
ansible control_plane_nodes -m shell -a "grep -i keepalived /var/log/syslog | tail -n 20" --become
```

# Kubernetes Homelab Progress - May 11, 2025

## High Availability Setup Complete

- ✅ Successfully configured HAProxy on all three control plane nodes
- ✅ Resolved HAProxy binding issues by using 0.0.0.0:16443 instead of specific VIP
- ✅ Verified Keepalived properly manages the VIP (10.8.18.2) across nodes
- ✅ Tested failover functionality by stopping HAProxy on primary node
- ✅ Confirmed VIP correctly migrates to secondary nodes when primary fails
- ✅ Validated both internal and external connectivity to the HA endpoint
- ✅ Load balancing confirmed via HAProxy across all three API servers

## Current Infrastructure Status

### Control Plane
- Complete 3-node high availability setup
- Kubernetes v1.33.0 running on all nodes
- HAProxy and Keepalived providing redundancy
- External API access via VIP 10.8.18.2:16443

### Components Configured
| Component       | Status | Version       | Notes                                       |
|-----------------|--------|---------------|---------------------------------------------|
| Kubernetes      | ✅     | v1.33.0       | All control plane components operational    |
| containerd      | ✅     | 2.0.0         | Container runtime functioning on all nodes  |
| Cilium          | ✅     | v1.17.3       | CNI plugin installed and operational        |
| HAProxy         | ✅     | 2.9.10        | Load balancing across API servers           |
| Keepalived      | ✅     | Latest        | VIP management working correctly            |

## Next Steps

1. **Worker Node Integration**:
   - Prepare MS-01 nodes for Kubernetes installation
   - Configure network interfaces for all required VLANs
   - Install container runtime and Kubernetes components
   - Join nodes to the cluster

2. **Storage Solution**:
   - Configure persistent storage for the cluster
   - Set up storage class and provisioner
   - Implement backup strategy for persistent volumes

3. **Monitoring Implementation**:
   - Deploy Prometheus and Grafana
   - Set up alerts for HA component failures
   - Create dashboards for cluster health monitoring

4. **Application Deployment**:
   - Set up Ingress controller
   - Configure external access to services
   - Deploy initial applications