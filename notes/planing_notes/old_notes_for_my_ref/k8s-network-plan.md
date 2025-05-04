# Kubernetes Network Infrastructure Implementation Plan

## 1. Network Device Standardization

### Network Equipment Naming & IP Assignment

| Current Name | Current IP | New Name | New Static IP | Model |
|--------------|------------|----------|--------------|-------|
| Usw-flex-2.5-k8s-main | 10.0.1.215 | USW-Flex-2.5G-K8s-Main | 10.0.1.80 | Ubiquiti Networks Flex 2.5G (USW-Flex-2.5G-8) |
| Use-flex-k8s-control | 10.0.1.226 | USW-Flex-Mini-K8s-Control | 10.0.1.81 | Ubiquiti UniFi Flex Mini |
| *New Device* | N/A | MikroTik-CRS309-K8s-Storage | 10.0.1.82 | MikroTik CRS309-1G-8S+ |
| USW-Flex-Printer | 10.0.1.204 | USW-Flex-Printer | 10.0.1.204 | Ubiquiti USW-Flex |
| U6-Enterprise-LivingArea | 10.0.1.207 | U6-Enterprise-LivingArea | 10.0.1.207 | Ubiquiti U6 Enterprise |
| USW-Flex-Media | 10.0.1.208 | USW-Flex-Media | 10.0.1.208 | Ubiquiti USW-Flex |
| USW-Flex-SimRoom | 10.0.1.212 | USW-Flex-SimRoom | 10.0.1.212 | Ubiquiti USW-Flex |
| U6-Enterprise-IW-Upstairs-Living | 10.0.1.227 | U6-Enterprise-IW-Upstairs-Living | 10.0.1.227 | Ubiquiti U6 Enterprise In-Wall |
| Enterprise 24 PoE - Main | 10.0.1.239 | Enterprise-24-PoE-Main | 10.0.1.239 | Unifi Enterprise 24 Port PoE |
| USW-Enterprise-8-PoE-Server | 10.0.1.238 | USW-Enterprise-8-PoE-Server | 10.0.1.238 | Ubiquiti USW Enterprise 8 PoE |
| U6-Lite-Game | 10.0.1.242 | U6-Lite-Game | 10.0.1.242 | Ubiquiti U6 Lite |
| UDM-PRO | 10.0.1.1 | UDM-PRO | 10.0.1.1 | Ubiquiti Dream Machine Pro |

### K8s Node Integration

| Current Device | Current IP | Role in New Design | New Management IP | New Control Plane IP |
|----------------|------------|-------------------|-------------------|---------------------|
| k8s-admin | 10.0.1.223 | K8s-Admin-Box | 10.8.16.85 | 10.8.18.85 (tagged) |
| k8s-cp-02 | 10.0.1.229 | K8s-CP-02 | 10.8.16.87 | 10.8.18.87 (tagged) |
| k8s-cp-03 | 10.0.1.245 | K8s-CP-03 | 10.8.16.88 | 10.8.18.88 (tagged) |
| *New Node* | N/A | K8s-CP-01 | 10.8.16.86 | 10.8.18.86 (tagged) |
| *New Node* | N/A | K8s-MS-01-Node-1 | 10.8.16.90 | 10.8.18.90 (tagged) |
| *New Node* | N/A | K8s-MS-01-Node-2 | 10.8.16.91 | 10.8.18.91 (tagged) |

## 2. VLAN Structure

### Network Segmentation Plan

| VLAN ID | Name | Subnet | Gateway | Purpose |
|---------|------|--------|---------|---------|
| 1 | Default | 10.0.1.0/24 | 10.0.1.1 | Network Management |
| 2 | IoT | 10.0.2.0/24 | 10.0.2.1 | Smart Home Devices |
| 3 | Family | 10.0.3.0/24 | 10.0.3.1 | Personal Devices |
| 4 | Work-Devices | 10.0.4.0/24 | 10.0.4.1 | Work Equipment |
| 5 | Unifi-Protect | 10.0.5.0/24 | 10.0.5.1 | Security Cameras |
| 6 | Reverse-Proxy | 10.6.6.0/24 | 10.6.6.1 | External Access |
| 10 | Public-Services | 10.10.10.0/24 | 10.10.10.1 | Media & Shared Resources |
| 16 | K8s-Management | 10.8.16.0/27 | 10.8.16.1 | Kubernetes Management |
| 18 | K8s-Control-Plane | 10.8.18.0/27 | 10.8.18.1 | API Server, etcd |
| 28 | K8s-Pod-Network | 10.8.28.0/23 | 10.8.28.1 | Container Traffic |
| 38 | K8s-Service-Network | 10.8.38.0/26 | 10.8.38.1 | Service Discovery |
| 48 | K8s-Storage-Network | 10.8.48.0/27 | 10.8.48.1 | Ceph Storage Traffic |
| 58 | K8s-LoadBalancer | 10.8.58.0/27 | 10.8.58.1 | External Service Access |

## 3. Implementation Phases

### Phase 0: Automation & Security Infrastructure Setup

1. **Ansible Configuration Management Setup**
   - Install Ansible on K8s-Admin-Box (10.0.1.223)
   - Create Ansible directory structure:
     ```
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
     ```
   - Configure Ansible inventory with network device groups:
     - unifi_devices
     - mikrotik_devices
     - kubernetes_nodes
     - control_plane_nodes
     - worker_nodes
   - Create UniFi API integration roles and playbooks
   - Create MikroTik API integration roles and playbooks
   - Create Kubernetes node configuration roles and playbooks

2. **Secrets Management Integration**
   - Configure Vault storage backend
   - Initialize Vault and set up unseal keys
   - Create secret paths for different environments:
     - network/unifi
     - network/mikrotik
     - kubernetes/certificates
     - kubernetes/tokens
   - Store critical credentials:
     - UniFi Controller credentials
     - SSH keys for network devices
     - MikroTik API credentials
     - VPN certificates and keys
     - Kubernetes sensitive configurations
   - Set up Ansible Vault integration
   - Configure automated credential rotation policies

3. **Version Control & CI/CD Setup**
   - Initialize Git repository for network configurations
   - Create branching strategy for changes:
     - master (production)
     - staging (testing)
     - feature branches (development)
   - Set up pre-commit hooks for validation
   - Configure GitLab CI/CD pipeline for automated testing
   - Create deployment workflows for network changes

4. **Backup Infrastructure**
   - Configure automated backups for:
     - Vault data
     - Network device configurations
     - UDM-PRO settings
     - Ansible playbooks and inventory
   - Set up off-site backup destination
   - Implement backup testing and verification

### Phase 1: DHCP Reconfiguration
- **Current DHCP Range**: 10.0.1.200 - 10.0.1.250
- **New DHCP Range**: 10.0.1.200 - 10.0.1.220
- **Infrastructure Range**: 10.0.1.1 - 10.0.1.99 (static)
- **Static Client Range**: 10.0.1.221 - 10.0.1.254 (reserved)

### Phase 2: Core Infrastructure Configuration

1. **UDM-PRO Configuration (10.0.1.1)**
   - Create all VLANs (1, 2, 3, 4, 5, 6, 10, 16, 18, 28, 38, 48, 58)
   - Define inter-VLAN routing policies
   - Set up DHCP services for each VLAN
   - Configure firewall rules for VLAN isolation:
     - Allow 10.0.1.0/24 (Default) subnet access to K8s-Admin-Box (10.8.16.85)
     - Allow 10.0.3.0/24 (Family) subnet access to K8s-Admin-Box (10.8.16.85)
     - Implement appropriate ACLs for other inter-VLAN communication
   - Enable routing between VLAN 1 and VLAN 16 for management

2. **Enterprise-24-PoE-Main Switch (10.0.1.239)**
   - Assign static IP (confirm 10.0.1.239)
   - Configure port 1 as trunk to UDM-PRO with all VLANs
   - Configure port 24 as trunk to USW-Flex-2.5G-K8s-Main with K8s VLANs
   - Configure remaining ports according to network diagram
   
   **Port Profiles Configuration:**
   - Create "All VLANs Trunk" profile: All VLANs tagged, VLAN 1 native, full PoE, 1Gbps 
   - Create "K8s Trunk" profile: VLANs 1, 16, 18, 28, 38, 48, 58 tagged, VLAN 1 native, auto-negotiate speed
   - Create "AP Profile": VLANs 1, 2, 3 tagged, VLAN 1 native, PoE enabled, 2.5Gbps
   - Create "IoT Profile": VLAN 2 native, no tagging, PoE enabled, 1Gbps
   - Create "Family Profile": VLAN 3 native, no tagging, PoE disabled, 1Gbps
   - Create "Work Profile": VLAN 4 native, no tagging, PoE disabled, 1Gbps
   - Create "Security Profile": VLAN 5 native, no tagging, PoE enabled, 1Gbps
   - Create "Server Profile": VLANs 1, 6, 10 tagged, VLAN 1 native, PoE disabled, 10Gbps

### Phase 3: K8s Network Infrastructure Setup

1. **USW-Flex-2.5G-K8s-Main (10.0.1.80)**
   - Change IP from 10.0.1.215 to 10.0.1.80
   - Configure port 1 as trunk to Enterprise-24-PoE-Main (all VLANs, native VLAN 1)
   - Configure ports 2-3: K8s-MS-01-Node-1 (VLAN 16 native, VLAN 18 tagged)
   - Configure ports 4-5: K8s-MS-01-Node-2 (VLAN 16 native, VLAN 18 tagged)
   - Configure port 6: Trunk to USW-Flex-Mini-K8s-Control (VLAN 16 native, VLAN 18 tagged)
   - Configure port 7: MikroTik-CRS309-K8s-Storage management (VLAN 1 only)
   - Configure port 8: K8s-Admin-Box (VLAN 16 native, VLAN 18 tagged)
   
   **Port Profiles Configuration:**
   - Create "K8s-Main-Uplink" profile: All VLANs tagged, VLAN 1 native, 2.5Gbps
   - Create "K8s-Management" profile: VLAN 16 native, VLAN 18 tagged, 2.5Gbps
   - Create "K8s-Control-Mini-Uplink" profile: VLAN 16 native, VLAN 18 tagged, PoE enabled, 1Gbps
   - Create "MikroTik-Management" profile: VLAN 1 only, 1Gbps
   - Create "K8s-Admin" profile: VLAN 16 native, VLAN 18 tagged, 1Gbps

2. **USW-Flex-Mini-K8s-Control (10.0.1.81)**
   - Change IP from 10.0.1.226 to 10.0.1.81
   - Configure port 1: Uplink to USW-Flex-2.5G-K8s-Main (VLAN 16 native, VLAN 18 tagged)
   - Configure port 2: K8s-CP-01 (VLAN 16 native, VLAN 18 tagged)
   - Configure port 3: K8s-CP-02 (VLAN 16 native, VLAN 18 tagged)
   - Configure port 4: K8s-CP-03 (VLAN 16 native, VLAN 18 tagged)
   - Configure port 5: Spare
   
   **Port Profiles Configuration:**
   - Create "K8s-Control-Uplink" profile: VLAN 16 native, VLAN 18 tagged, 1Gbps
   - Create "K8s-CP-Node" profile: VLAN 16 native, VLAN 18 tagged, PoE enabled, 1Gbps

3. **MikroTik-CRS309-K8s-Storage (10.0.1.82)**
   - Set initial IP to 10.0.1.82
   - Configure port 1: Management to USW-Flex-2.5G-K8s-Main (VLAN 1 only)
   - Configure ports 2-3: K8s-MS-01-Node-1 SFP+ (VLANs 28, 38, 48 tagged)
   - Configure ports 4-5: K8s-MS-01-Node-2 SFP+ (VLANs 28, 38, 48 tagged)
   - Configure ports 6-8: Reserved for future expansion
   
   **Port Profiles Configuration:**
   - Create "MikroTik-Management-Port" profile: VLAN 1 only, no VLAN tagging, 1Gbps
   - Create "K8s-Data-SFP" profile: VLANs 28, 38, 48 tagged, 10Gbps
   - Create "Future-Expansion" profile: No configuration, disabled

### Phase 4: Switch Management Standardization

1. **Access Switches & APs**
   - Convert all UniFi devices to static IPs:
     - USW-Flex-Printer: 10.0.1.204
     - U6-Enterprise-LivingArea: 10.0.1.207
     - USW-Flex-Media: 10.0.1.208
     - USW-Flex-SimRoom: 10.0.1.212
     - U6-Enterprise-IW-Upstairs-Living: 10.0.1.227
     - USW-Enterprise-8-PoE-Server: 10.0.1.238
     - U6-Lite-Game: 10.0.1.242
   
   **Port Profiles Assignment:**
   - Assign appropriate profiles to access switches based on connected devices:
     - For AP connections: "AP Profile"
     - For IoT device connections: "IoT Profile"
     - For family device connections: "Family Profile"
     - For work device connections: "Work Profile"
     - For security camera connections: "Security Profile"
     - For server connections: "Server Profile"

### Phase 5: K8s Node Configuration

1. **Admin Box Configuration**
   - Migrate k8s-admin (10.0.1.223) to:
     - Management: 10.8.16.85/27 (VLAN 16)
     - Control Plane access: 10.8.18.85/27 (VLAN 18)

2. **Control Plane Setup**
   - Migrate existing k8s-cp-02 (10.0.1.229) to new IPs:
     - Management: 10.8.16.87
     - Control Plane: 10.8.18.87
   - Migrate existing k8s-cp-03 (10.0.1.245) to new IPs:
     - Management: 10.8.16.88
     - Control Plane: 10.8.18.88
   - Configure new K8s-CP-01:
     - Management: 10.8.16.86
     - Control Plane: 10.8.18.86

3. **Worker Node Setup**
   - Configure K8s-MS-01-Node-1:
     - Management: 10.8.16.90/27 (VLAN 16)
     - Control Plane: 10.8.18.90/27 (VLAN 18)
     - Pod Network: 10.8.28.90/23 (VLAN 28)
     - Service Network: 10.8.38.90/26 (VLAN 38)
     - Storage Network: 10.8.48.90/27 (VLAN 48)
   - Configure K8s-MS-01-Node-2:
     - Management: 10.8.16.91/27 (VLAN 16)
     - Control Plane: 10.8.18.91/27 (VLAN 18)
     - Pod Network: 10.8.28.91/23 (VLAN 28)
     - Service Network: 10.8.38.91/26 (VLAN 38)
     - Storage Network: 10.8.48.91/27 (VLAN 48)

## 4. Verification & Testing

1. **Network Connectivity Tests**
   - Verify trunk configurations with `tcpdump` on each VLAN
   - Test routing between allowed VLANs
   - Validate VLAN isolation for security

2. **Kubernetes Functionality Tests**
   - Test control plane HA configuration
   - Verify pod networking across nodes
   - Validate service discovery
   - Test storage network performance
   - Confirm external connectivity via load balancer network

## 5. Documentation

1. **Network Documentation**
   - Complete IP address inventory
   - VLAN assignments
   - Switch port configurations
   - Physical and logical network diagrams
   - Port profile definitions and assignments

2. **Kubernetes Configuration**
   - Node inventory
   - Network configurations per node
   - Service subnet allocations
   - HA configuration details
