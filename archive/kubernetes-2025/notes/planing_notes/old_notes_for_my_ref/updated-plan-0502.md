# Updated Kubernetes Network Implementation Plan

## Progress Summary

| Phase | Description | Status | Notes |
|-------|-------------|--------|-------|
| 0 | Automation & Security Infrastructure | ✅ COMPLETED | Using Ansible Vault for secrets |
| 1 | DHCP Reconfiguration | ✅ COMPLETED | K8s node reservations set up |
| 2 | Core Infrastructure Configuration | ✅ COMPLETED | UDM-PRO and main switch configured |
| 3 | K8s Network Infrastructure Setup | ✅ COMPLETED | Control plane switch & MikroTik storage switch completed. |
| 4 | Switch Management Standardization | 🔜 PLANNED | All switch IPs standardized |
| 5 | K8s Node Configuration | 🔜 PLANNED | Not yet started |

## Updated Approach

- **UniFi Configuration**: Manual configuration via UI for all UniFi devices due to API limitations
- **Secrets Management**: Using Ansible Vault exclusively (removed HashiCorp Vault and Bitwarden)
- **Device Management**: Direct SSH for MikroTik and K8s nodes, manual UI for UniFi devices

## Immediate Next Steps

### Phase 2-3: Complete Infrastructure Configuration

1. **USW-Flex-2.5G-K8s-Main (10.0.1.80) Configuration**
   - ✅ IP changed from 10.0.1.215 to 10.0.1.80 (Confirmed in inventory `hosts.yml`, differs from older infrastructure notes)
   - Configure ports as per plan:
     - Port 1: K8s-MS-01-Node-1 primary (VLAN 16 native, VLAN 18 tagged)
     - Port 2: K8s-MS-01-Node-1 secondary (VLAN 16 native, VLAN 18 tagged)
     - Port 3: K8s-MS-01-Node-2 primary (VLAN 16 native, VLAN 18 tagged)
     - Port 4: K8s-MS-01-Node-2 secondary (VLAN 16 native, VLAN 18 tagged)
     - Port 5: Spare (VLAN 16 native, VLAN 18 tagged)
     - Port 6: SFP+ uplink to UDM-PRO (All VLANs tagged, VLAN 1 native)
     - Port 7: MikroTik management (VLAN 1 only)
     - Port 8: Trunk to USW-Flex-Mini-K8s-Control (VLAN 16 native, VLAN 18 tagged)

2. **MikroTik-CRS309-K8s-Storage (10.0.1.82) Configuration**
   - ✅ **Completed Manually (2025-05-02)** - Configured via SSH. vPro interfaces on worker nodes also set up via MeshCommander.
   - **Note:** LACP LAG configuration was not feasible.
   - Manual setup via SSH
   - Configure basic interface:
     ```
     /ip address add address=10.0.1.82/24 interface=ether1 network=10.0.1.0
     ```
   - Configure VLAN interfaces:
     ```
     /interface vlan add interface=sfp-sfpplus2 name=vlan28-pod vlan-id=28
     /interface vlan add interface=sfp-sfpplus2 name=vlan38-service vlan-id=38
     /interface vlan add interface=sfp-sfpplus2 name=vlan48-storage vlan-id=48
     ```
   - Configure jumbo frames:
     ```
     /interface ethernet set sfp-sfpplus2 mtu=9000
     /interface ethernet set sfp-sfpplus3 mtu=9000
     ```

3. **Physical Connection Setup**
   - Connect MikroTik ether1 to USW-Flex-2.5G-K8s-Main port 7
   - Connect K8s worker nodes to appropriate ports on USW-Flex-2.5G-K8s-Main
   - Connect SFP+ interfaces from MikroTik to worker nodes

### Phase 5: K8s Node Network Configuration

1. **K8s Admin Box (10.8.16.85)**
   - Update network configuration to use new VLAN IPs
   - Create playbook to configure network interfaces
   - Example configuration:

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: no
      addresses:
        - 10.8.16.85/24
      routes:
        - to: default
          via: 10.8.16.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
  vlans:
    vlan18:
      id: 18
      link: eth0
      addresses:
        - 10.8.18.85/24
```

2. **Control Plane Nodes**
   - Similar network configuration for all control plane nodes
   - Create playbook to apply configuration
   - Test connectivity across VLANs

## Verification Plan

1. **Network Connectivity Tests**
   - Verify VLAN tagging on all ports
   - Test ping connectivity between devices on same VLANs
   - Validate routing between allowed VLANs

2. **K8s Networking Tests**
   - Verify control plane node connectivity
   - Test communication between worker and control plane nodes