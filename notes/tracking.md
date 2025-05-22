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


   # Kubernetes Homelab Progress - May 18, 2025

## High Availability Verification

Today we successfully verified the high availability setup of our Kubernetes control plane:

### ✅ HAProxy and Keepalived Verification
- Confirmed HAProxy is running on all three control plane nodes
- Verified Keepalived is properly managing the VIP (10.8.18.2)
- Observed correct failover behavior in Keepalived logs with appropriate priority assignments
- Confirmed the VIP is currently assigned to k8s-cp-01 (highest priority node)

### ✅ etcd Cluster Verification
- Installed etcd-client using apt for verification purposes
- Confirmed all three etcd members are in the "started" state:
  - k8s-cp-01 (ID: 6b8eff73f14c67da)
  - k8s-cp-02 (ID: b13237175a2cf2f6)
  - k8s-cp-03 (ID: 87050630ec4bdf17)
- Verified etcd cluster health with successful proposal commits
- Confirmed k8s-cp-01 is currently the cluster leader
- Observed reasonable database size (8.0 MB) and healthy Raft indices

### ✅ Certificate Distribution Verification
- Verified CA certificates are consistent across all nodes (Issuer: CN=kubernetes)
- Confirmed API server certificates include the VIP (10.8.18.2) in Subject Alternative Names on all nodes
- Verified each API server certificate includes the node's IP and all required DNS names
- Successfully tested secure connections with certificate verification enabled

### ✅ TFTP and Netboot.xyz Configuration
- Identified and resolved Docker container networking issues with TFTP data transfers
- Reconfigured the netboot.xyz container to use host networking mode, eliminating port mapping issues
- Successfully verified TFTP file transfers of boot images
- Confirmed worker node can retrieve boot files via TFTP

### ✅ Network Configuration for PXE Boot
- Added necessary firewall rules to allow traffic between K8sAdmin network (VLAN 16) and Internal network (VLAN 1)
- Configured proper routing between VLANs for PXE boot traffic
- Verified connectivity for both TFTP control port (69) and data transfer ports (30000-30010)

### Current Status
| Component            | Status    | Notes                                    |
|----------------------|-----------|------------------------------------------|
| Control Plane Nodes  | ✅ Ready   | All 3 nodes running and in Ready status  |
| Container Runtime    | ✅ Ready   | containerd 2.0.0 installed and running   |
| CNI Plugin           | ✅ Ready   | Cilium 1.17.3 installed and operational  |
| API Server           | ✅ Ready   | Accessible via VIP with secure TLS       |
| Control Plane HA     | ✅ Ready   | HAProxy/Keepalived properly configured   |
| Worker Nodes         | 🔜 Planned | Next phase: Ubuntu installation          |

## Next Steps

1. **Worker Node Setup**:
   - Install Ubuntu 25.04 on MS-01 nodes
   - Configure networking for all required VLANs
   - Install container runtime (containerd)
   - Install Kubernetes components
   - Join nodes to the cluster

2. **Storage Setup**:
   - Configure Ceph storage on worker nodes
   - Set up persistent volumes and storage classes

# Kubernetes Homelab Project Tracking - Updated May 19, 2025

## Current Status Overview

### Completed Tasks
- ✅ Established basic infrastructure and networking setup
- ✅ Configured UDM-PRO with appropriate VLANs and routing
- ✅ Set up SSH keys and vault for secure management
- ✅ Created k8sadmin user across all nodes
- ✅ Installed Ubuntu on worker nodes using vPro
- ✅ Initial Kubernetes setup on control plane nodes
- ✅ Initial high availability setup with HAProxy and Keepalived

### Current Issues
- ⚠️ Control plane network configuration broke during playbook updates
- ⚠️ k8s-cp-01 was upgraded to Ubuntu 25.04 and is no longer part of the HA cluster
- ⚠️ Network configuration errors: 10.8.16.1 incorrectly defined as control plane gateway
- ⚠️ MS-01 worker node networking not functioning correctly
- ⚠️ Improper netplan configuration causing YAML validation errors

### Next Steps (Prioritized)
1. **Fix Control Plane Networking**:
   - Correct gateway configuration for Raspberry Pi nodes (should use 10.8.18.1 not 10.8.16.1)
   - Fix netplan configurations to ensure proper connectivity
   - Restore HA configuration for control plane nodes

2. **Upgrade Control Plane Nodes**:
   - Complete do-release-upgrade to Ubuntu 25.04 for remaining control plane nodes
   - Ensure consistent OS versions across all control plane nodes

3. **Restore Kubernetes Control Plane**:
   - Repair etcd cluster
   - Reconfigure Cilium CNI if needed
   - Verify HA functionality with all control plane nodes

4. **Fix MS-01 Worker Node Networking**:
   - Properly identify network interfaces
   - Create correct bond configuration with appropriate YAML structure
   - Establish proper connectivity across all required networks

5. **Join Worker Nodes to Cluster**:
   - Continue with worker node setup once control plane is stable
   - Configure container runtime and Kubernetes components on worker nodes
   - Join nodes to the cluster

## Detailed Technical Notes

### Network Gateway Issues
- Control plane nodes (Raspberry Pi) should use 10.8.18.1 as gateway, not 10.8.16.1
- The UDM-PRO provides gateway services for both networks but was misconfigured in playbooks

### MS-01 Interface Configuration
- MS-01 worker nodes have complex interface naming (enp2s0f0np0, enp2s0f1np1, etc.)
- Netplan YAML format requires careful indentation and structure
- Bond configuration was failing due to YAML syntax errors and interface misidentification

### High Availability Status
- Control plane node k8s-cp-01 upgraded to Ubuntu 25.04 and fell out of HA configuration
- VIP (10.8.18.2) no longer functioning across all nodes
- HAProxy and Keepalived configuration may need to be reapplied

### Kubernetes Component Status
- Etcd cluster likely in a degraded state due to network issues
- Cilium CNI may need reconfiguration after network fixes
- Control plane components might need reconfiguration

## Recovery Plan

1. Start with fixing the most critical component: control plane network connectivity
2. Apply OS upgrades systematically to ensure consistency
3. Restore Kubernetes HA control plane functionality
4. Address worker node networking with properly tested configurations
5. Complete worker node integration once foundation is stable

# Kubernetes Homelab Project Tracking - Updated May 19, 2025 (Evening)

## Network Configuration Modernization

### Completed Today
- ✅ Replaced deprecated shell commands with appropriate Ansible modules
- ✅ Improved network interface detection using Ansible facts instead of shell commands
- ✅ Moved inline Jinja2 templates to separate template files for better maintainability
- ✅ Enhanced error handling with proper block/rescue structure
- ✅ Improved network verification with more robust connectivity checks
- ✅ Created template files for netplan configurations:
  - `fallback_netplan.yaml.j2` - DHCP fallback configuration
  - `rpi_netplan.yaml.j2` - Raspberry Pi node configuration
  - `ms01_netplan.yaml.j2` - MS-01 worker node configuration with bonding
  - `verify_connectivity.sh.j2` - Network verification script

### Key Improvements
1. **Better Interface Detection**:
   - Now using `ansible_facts.interfaces` instead of shell commands with grep
   - More reliable detection of physical vs. virtual interfaces
   - Improved categorization of interface types (SFP vs. copper)

2. **Enhanced Network Configuration**:
   - Moved from inline templates to separate template files
   - Improved YAML structure for netplan configurations
   - Better variable handling for network parameters

3. **Improved Error Handling**:
   - Added block/rescue structure for safer network configuration
   - Better fallback mechanism for network configuration failures
   - More comprehensive connectivity verification

4. **Modern Module Usage**:
   - Replaced `warn: false` parameter (deprecated) with proper module structure
   - Using `ansible.builtin.setup` for fact gathering instead of shell commands
   - Using `ansible.builtin.slurp` for file content retrieval instead of cat commands
   - Using `ansible.builtin.uri` for connectivity testing when possible

### Next Steps
1. **Test the updated playbook** on a single node to verify functionality
2. **Apply the corrected gateway configuration** (10.8.18.1 instead of 10.8.16.1)
3. **Verify MS-01 interface detection** works correctly with the new approach
4. **Document the modernization changes** in project documentation

# Kubernetes Homelab Project Tracking - Updated May 21, 2025

- After some frustration with the pis, I explored some options to remount them in the rack so that if I broke the networking with ansible again I woulnd't have to pull the rack apart completly anymore. 

## Major Milestone: Complete Network Configuration Success ✅

### Today's Accomplishments
- ✅ **Successfully configured networking on all MS-01 worker nodes**
  - Fixed complex interface detection and bonding configuration
  - Properly configured dual 2.5G interfaces (enp87s0, enp90s0)
  - Successfully created bond0 with SFP+ interfaces (enp2s0f0np0, enp2s0f1np1)
  - Configured all required VLANs on bond0 (28, 38, 48) with jumbo frames (MTU 9000)
  - Established proper routing between management and control plane networks

- ✅ **Resolved networking playbook issues**
  - Fixed missing network diagnostic tools (`iputils-ping`, `dnsutils`, etc.)
  - Modernized Ansible playbook with proper module usage instead of deprecated shell commands
  - Improved error handling with block/rescue structure
  - Enhanced network verification with comprehensive connectivity tests

- ✅ **Network Infrastructure Now Complete**
  - All control plane nodes (3x Raspberry Pi 5): ✅ Ready
  - All worker nodes (2x MS-01): ✅ Ready
  - Complex VLAN segmentation working across all networks
  - High-availability networking infrastructure operational

### Current Network Status

| Node Type | Count | Network Status | IP Configuration |
|-----------|-------|----------------|------------------|
| Control Plane (RPi5) | 3 | ✅ Operational | Single interface with VLAN 18 access |
| Worker Nodes (MS-01) | 2 | ✅ Operational | Dual management + SFP+ bond with VLANs |
| Admin Node (RPi5) | 1 | ✅ Operational | Dual VLAN access (16/18) |

### Detailed Network Configuration Achieved

#### MS-01 Worker Nodes
- **Management Network**: 10.8.16.90-91/24 (VLAN 16) via enp90s0
- **Control Plane Network**: 10.8.18.90-91/24 (VLAN 18) via enp87s0  
- **Bond Configuration**: 802.3ad LACP with SFP+ interfaces
  - **Pod Network**: 10.8.28.90-91/23 (VLAN 28) via bond0
  - **Service Network**: 10.8.38.90-91/24 (VLAN 38) via bond0
  - **Storage Network**: 10.8.48.90-91/24 (VLAN 48) via bond0
- **MTU**: 9000 bytes on storage network for optimal performance

#### Control Plane Nodes  
- **Management Network**: 10.8.16.86-88/24 (VLAN 16)
- **Control Plane Network**: 10.8.18.86-88/24 (VLAN 18)
- **High Availability VIP**: 10.8.18.2 (HAProxy + Keepalived)

### Important: Control Plane Verification Required ⚠️

Before proceeding with worker nodes, the control plane needs verification and potential restoration:

#### Control Plane Status Check Required
- **k8s-cp-01**: Upgraded to Ubuntu 25.04, may have dropped out of HA cluster
- **k8s-cp-02**: Needs verification of Kubernetes components and HA status  
- **k8s-cp-03**: Needs verification of Kubernetes components and HA status
- **etcd cluster**: Likely needs verification/restoration after network changes
- **HAProxy/Keepalived**: VIP (10.8.18.2) functionality needs confirmation
- **Cilium CNI**: May need reconfiguration after network updates

#### Control Plane Verification Tasks
1. **Check cluster status**: `kubectl get nodes` from k8s-admin
2. **Verify etcd health**: Check all 3 etcd members are healthy
3. **Test HA functionality**: Confirm VIP is working and failing over properly
4. **Validate CNI**: Ensure pod networking is functional
5. **Check certificates**: Verify API server certificates include VIP
6. **Test API access**: Confirm secure access via VIP without certificate warnings

#### Potential Recovery Actions Needed
- Re-join k8s-cp-01 to the cluster if it dropped out
- Restore HAProxy/Keepalived configuration if needed
- Reconfigure Cilium if pod networking is broken
- Update certificates if VIP access has certificate issues

### Next Steps - Kubernetes Cluster Completion

**Phase 1: Control Plane Verification and Recovery**
1. **Verify Control Plane Health**:
   - Check all control plane nodes are in Ready status
   - Verify etcd cluster has 3 healthy members
   - Test HA failover functionality
   - Confirm CNI is operational

**Phase 2: Worker Node Integration**  
1. **Install Kubernetes Prerequisites on Worker Nodes**:
   - Install containerd container runtime
   - Install Kubernetes components (kubelet, kubeadm, kubectl)
   - Configure system prerequisites (swap, kernel modules, etc.)

2. **Join Worker Nodes to Cluster**:
   - Generate join tokens from control plane
   - Execute worker node join process
   - Verify nodes appear in cluster

3. **Storage Configuration**:
   - Configure Ceph storage cluster on worker nodes
   - Set up persistent volume provisioning
   - Test storage performance across 10G network

4. **Application Deployment**:
   - Deploy ingress controller
   - Set up monitoring stack (Prometheus, Grafana)
   - Deploy initial applications

### Technical Notes

#### Key Lessons Learned
- Modern Ubuntu installations don't include `ping` by default - always install network diagnostic tools first
- Complex interface naming in enterprise hardware requires robust detection logic
- LACP bonding with VLANs requires careful netplan configuration structure
- Ansible fact gathering is more reliable than shell commands for interface detection

#### Playbook Improvements Made
- Replaced deprecated shell commands with modern Ansible modules
- Added comprehensive network tool installation
- Improved error handling with block/rescue patterns
- Enhanced connectivity verification with multiple test methods
- Created reusable templates for different node types

### Infrastructure Status Summary

| Component | Status | Notes |
|-----------|---------|-------|
| **Networking** | ✅ Complete | All nodes operational with complex VLAN setup |
| **Control Plane** | ? Needs to be verified | 3-node HA cluster unsure of status|
| **Worker Nodes** | 🔄 Ready for K8s | Hardware ready, need Kubernetes installation |
| **Storage Network** | ✅ Ready | 10G bonded network with jumbo frames |
| **Management** | ✅ Complete | Ansible automation fully operational |

**Ready for Phase 6: Kubernetes Worker Node Integration**

Network Performance Test - k8s-ms01-node-01
Date: May 21, 2025
Test: iperf3 between nodes (.90 → .91)
Results Summary

1G Networks (VLAN 16/18): ~940 Mbps - Normal
10G Networks (VLAN 28/38/48): ~3.12 Gbps - Excellent
Retransmissions: Very low (0-44 over 10sec)
Bond0 + Jumbo Frames: Working properly

Status: ✅ PASS
Single TCP stream hitting expected performance ceiling. Network infrastructure performing optimally for 2-node setup.

✅ Complete Ubuntu 25.10 upgrade across all 6 nodes (3 control plane + 2 worker + 1 admin)


# Kubernetes Homelab Project Tracking - Updated May 22, 2025

## Kubernetes Control Plane Restoration In Progress 🔄

### Today's Progress (May 22, 2025)
- ✅ **Successfully restored control plane node connectivity**
  - All 3 control plane nodes back online and accessible via Ansible
  - Network configurations verified and operational
  - SSH connectivity re-established with k8sadmin user

- ✅ **Kubernetes component installation completed**
  - Updated playbooks to use latest Kubernetes repository structure (v1.33.1) and updated all component versions to latest. 
  - Successfully installed kubeadm, kubelet, and kubectl on all control plane nodes
  - Containerd container runtime verified and operational
  - System prerequisites (swap disabled, kernel modules loaded) confirmed

- ⚠️ **Current Issue: Kubernetes Cluster Initialization**
  - Encountered cgroups memory error during `kubeadm init`
  - Error: `missing required cgroups: memory`
  - Need to enable memory cgroups in Raspberry Pi boot configuration

### Current Status
| Component | Status | Notes |
|-----------|---------|-------|
| **Control Plane Nodes** | ✅ Ready | All 3 nodes accessible, components installed |
| **Container Runtime** | ✅ Ready | containerd operational on all nodes |
| **Network Configuration** | ✅ Ready | VLAN setup working properly |
| **Kubernetes Installation** | ⚠️ In Progress | Components installed, init blocked by cgroups |
| **Worker Nodes** | 🔜 Waiting | Ready for K8s once control plane restored |

### Next Steps
1. **Fix cgroups memory issue**:
   - Enable memory cgroups in `/boot/firmware/cmdline.txt`
   - Add `cgroup_enable=memory cgroup_memory=1` to boot parameters
   - Reboot all control plane nodes

2. **Complete cluster initialization**:
   - Run kubeadm init with updated boot configuration
   - Install Cilium CNI
   - Join remaining control plane nodes

3. **Restore HA configuration**:
   - Configure HAProxy and Keepalived
   - Set up VIP for high availability
   - Verify failover functionality

## Major Milestone: Complete Network Configuration Success ✅ (Previous)