# Kubernetes Cluster Configuration

## Network Topology Overview with VLANs and Ports

```
Internet
    │
    ▼
UDM-PRO (10.0.1.1)
    │ 
    │ DAC → Port 1 (VLANs: 1,2,3,4,5,6,10,18,28,38,48,58)
    ▼
Unifi Enterprise 24 Port (10.0.1.238) - Core Switch
    │
    │ SFP+ → Port 24 (VLANs: 1,18,28,38,48,58)
    ▼
Ubiquiti Flex 2.5G (10.0.1.80)
    │
    ├───── Port 1: Uplink to Enterprise 24 Port (Trunk: All VLANs)
    │
    ├───── Port 2-3: MS-01 Node 1 (10.0.1.90) 2.5G ports (VLANs: 1,18)
    │
    ├───── Port 4-5: MS-01 Node 2 (10.0.1.91) 2.5G ports (VLANs: 1,18)
    │
    ├───── Port 6: Connection to Flex Mini (VLANs: 1,18)
    │      │
    │      ▼
    │     Ubiquiti Flex Mini (10.0.1.81)
    │       │
    │       ├── Port 1: Uplink to Flex 2.5G (VLANs: 1,18)
    │       │
    │       ├── Port 2: K8s-CP-01 (10.0.1.86) (VLANs: 1,18)
    │       │
    │       ├── Port 3: K8s-CP-02 (10.0.1.87) (VLANs: 1,18)
    │       │
    │       └── Port 4: K8s-CP-03 (10.0.1.88) (VLANs: 1,18)
    │
    ├───── Port 7: MikroTik CRS309 Management (VLAN: 1 only)
    │      │
    │      ▼
    │     MikroTik CRS309-1G-8S+ (10.0.1.82)
    │       │
    │       ├── Port 1: Management to Flex 2.5G (VLAN: 1 only)
    │       │
    │       ├── Port 2-3: MS-01 Node 1 SFP+ (VLANs: 28,38,48)
    │       │
    │       └── Port 4-5: MS-01 Node 2 SFP+ (VLANs: 28,38,48)
    │
    └───── Port 8: Admin Box (10.0.1.85) (VLANs: 1,18)
```

## VLAN Structure

### Existing VLANs

|VLAN ID|Name|Subnet|Gateway|Primary Switch|
|---|---|---|---|---|
|1|Default|10.0.1.0/24|10.0.1.1|serenity-network|
|2|IoT|10.0.2.0/24|10.0.2.1|Enterprise 24 PoE - Main|
|3|Family|10.0.3.0/24|10.0.3.1|serenity-network|
|4|Work-Devices|10.0.4.0/24|10.0.4.1|Enterprise 24 PoE - Main|
|5|Unifi-Protect|10.0.5.0/24|10.0.5.1|Enterprise 24 PoE - Main|
|6|Pangolin Reverse Proxy|10.6.6.0/24|10.6.6.1|serenity-network|
|10|unraid-public|10.10.10.0/24|10.10.10.1|serenity-network|
|4040|Inter-VLAN routing|10.255.253.0/24|-|serenity-network|

### New Kubernetes VLANs

|VLAN ID|Purpose|Subnet|Gateway|Notes|
|---|---|---|---|---|
|18|Kubernetes Control Plane|10.8.18.0/24|10.8.18.1|For API server, etcd, scheduler|
|28|Kubernetes Pod Network|10.8.28.0/22|10.8.28.1|Larger subnet for pod IPs|
|38|Kubernetes Service Network|10.8.38.0/24|10.8.38.1|For Kubernetes service IPs|
|48|Storage Network|10.8.48.0/24|10.8.48.1|Dedicated for Ceph traffic|
|58|Load Balancer IPs|10.8.58.0/24|10.8.58.1|For external service access|

## Existing Network Devices

|Device|IP Address|Connection|Location|
|---|---|---|---|
|UDM-PRO (serenity-network)|10.0.1.1|GbE|Main Gateway|
|USW-Flex-Printer|10.0.1.204|FE|Printer Area|
|U6-Enterprise-LivingArea|10.0.1.207|2.5 GbE|Living Area|
|USW-Flex-Media|10.0.1.208|GbE|Media Center|
|USW-Flex-SimRoom|10.0.1.212|GbE|Simulation Room|
|U6-Enterprise-IW-Upstairs-Living|10.0.1.227|2.5 GbE|Upstairs Living Area|
|Enterprise 24 PoE - Main|10.0.1.238|SFP+ (10 GbE)|Network Rack|
|USW-Enterprise-8-PoE-Server|10.0.1.239|SFP+ (10 GbE)|Server Rack|
|U6-Lite-Game|10.0.1.242|Mesh|Game Room|
|UNVR-Serenity|10.0.5.250|GbE|Security Rack|

## Planned Kubernetes Hardware Inventory

|Component|Model|Quantity|Specifications|Additional Equipment|
|---|---|---|---|---|
|**Admin Box**|Raspberry Pi 5|1|16GB RAM|- M2 SSD Hat Kit - Official Case - Cooler|
|**K8s Control Plane**|Raspberry Pi 5|3|8GB RAM|- M2 SSD Hat Kit - Official Case - Cooler|
|**Cluster Nodes**|Minisforum MS-01|2|High-Performance Compute Nodes||

## Rack Infrastructure

|Component|Model|Specifications|Ports|Features|
|---|---|---|---|---|
|**Rack**|GeekPi 12U 10″ Mini Rack|Compact Networking Rack|-|12U Height|
|**Router/Gateway**|UDM-PRO|Unified Dream Machine Pro|Multiple|Security Gateway & Network Controller|
|**Core Switch**|Unifi Enterprise 24 Port|Enterprise Network Switch|24 Ports + SFP+|High-Performance Routing|
|**PoE Switch**|Ubiquiti UniFi Flex Mini|Compact 5-Port Switch|5 Ports|PoE Capabilities|
|**Managed Switch**|Ubiquiti Networks Flex 2.5G|Enterprise Managed Switch|8 Ports|2.5G Ethernet|
|**Storage Network**|MikroTik CRS309-1G-8S+|SFP+ Switch|8 × SFP+|High-Performance Storage Network|

## Network Configuration

### New Network Equipment IP Allocation

|Device|Interface|VLAN|IP Address|Purpose|
|---|---|---|---|---|
|Flex 2.5G|Management|1|10.0.1.80/24|Management|
|Flex 2.5G|K8s Control Plane|18|10.8.18.80/24|K8s Management|
|Flex Mini|Management|1|10.0.1.81/24|Management|
|Flex Mini|K8s Control Plane|18|10.8.18.81/24|K8s Management|
|MikroTik CRS309|Management|1|10.0.1.82/24|Management|
|MikroTik CRS309|K8s Pod Network|28|10.8.28.82/22|Pod Traffic|
|MikroTik CRS309|K8s Service Network|38|10.8.38.82/24|Service Traffic|
|MikroTik CRS309|Storage Network|48|10.8.48.82/24|Storage Traffic|

### Node IP Allocation

#### Admin Box (Raspberry Pi 5)

|Interface|VLAN|IP Address|Purpose|
|---|---|---|---|
|eth0|1|10.0.1.85/24|Management|
|eth0.18|18|10.8.18.85/24|K8s Control Plane access|

#### Control Plane Nodes (Raspberry Pi 5, 3 units)

|Node|Interface|VLAN|IP Address|Purpose|
|---|---|---|---|---|
|K8s-CP-01|eth0|1|10.0.1.86/24|Management|
|K8s-CP-01|eth0.18|18|10.8.18.86/24|K8s Control Plane|
|K8s-CP-02|eth0|1|10.0.1.87/24|Management|
|K8s-CP-02|eth0.18|18|10.8.18.87/24|K8s Control Plane|
|K8s-CP-03|eth0|1|10.0.1.88/24|Management|
|K8s-CP-03|eth0.18|18|10.8.18.88/24|K8s Control Plane|

#### MS-01 Cluster Nodes (2 units)

|Node|Interface|VLAN|IP Address|Purpose|
|---|---|---|---|---|
|MS-01-1|eth0|1|10.0.1.90/24|Management|
|MS-01-1|eth0.18|18|10.8.18.90/24|K8s Control Plane access|
|MS-01-1|sfp0|28|10.8.28.90/22|Pod Network|
|MS-01-1|sfp0.38|38|10.8.38.90/24|Service Network|
|MS-01-1|sfp1|48|10.8.48.90/24|Storage Network|
|MS-01-2|eth1|1|10.0.1.91/24|Management|
|MS-01-2|eth1.18|18|10.8.18.91/24|K8s Control Plane access|
|MS-01-2|sfp0|28|10.8.28.91/22|Pod Network|
|MS-01-2|sfp0.38|38|10.8.38.91/24|Service Network|
|MS-01-2|sfp1|48|10.8.48.91/24|Storage Network|

### Virtual IP for HA Control Plane

|Service|VLAN|IP Address|Purpose|
|---|---|---|---|
|K8s API Server VIP|18|10.8.18.1/24|HA endpoint for K8s API|

### Port Configuration

#### UDM-PRO (existing at 10.0.1.1)

- All K8s VLANs (18, 28, 38, 48, 58) trunked to Enterprise 24 Port switch
- Inter-VLAN routing enabled for necessary communication

#### Enterprise 24 Port - Main (existing at 10.0.1.238)

- All K8s VLANs trunked to Ubiquiti Flex 2.5G
- Default VLAN (1) as native VLAN

#### Ubiquiti Flex 2.5G (new)

- Port 1: Uplink to Enterprise 24 Port (trunk all VLANs)
- Ports 2-3: MS-01 Node 1 2.5G ports (tagged VLANs 1, 18)
- Ports 4-5: MS-01 Node 2 2.5G ports (tagged VLANs 1, 18)
- Port 6: Connection to Flex Mini (tagged VLANs 1, 18)
- Port 7: Connection to MikroTik CRS309 (management only - VLAN 1)
- Port 8: Admin Box (tagged VLANs 1, 18)

#### Ubiquiti Flex Mini (new)

- Port 1: Uplink to Flex 2.5G (tagged VLANs 1, 18)
- Ports 2-4: K8s Control Plane Nodes (tagged VLANs 1, 18)
- Port 5: Spare

#### MikroTik CRS309-1G-8S+ (new)

- Port 1: Management port to Flex 2.5G (VLAN 1 only)
- Ports 2-3: MS-01 Node 1 SFP+ (tagged VLANs 28, 38, 48)
- Ports 4-5: MS-01 Node 2 SFP+ (tagged VLANs 28, 38, 48)
- Ports 6-8: Reserved for future expansion

### Initial Network Services

- **DNS:** CoreDNS (running in Kubernetes)
- **DHCP:** Managed by UDM-PRO
- **Network Management:** Ubiquiti UniFi Controller (on UDM-PRO)

## Detailed Node Specifications

### Admin Box

- **Model:** Raspberry Pi 5
- **RAM:** 16GB
- **Accessories:**
    - M2 SSD Hat Kit
    - Official Case
    - Cooler
- **Roles:**
    - Kubernetes administration workstation
    - Monitoring dashboard
    - Backup controller

### Kubernetes Control Plane (K8s-CP)

- **Model:** Raspberry Pi 5
- **Quantity:** 3 Units (K8s-CP-01, K8s-CP-02, K8s-CP-03)
- **RAM:** 8GB per unit
- **Accessories:**
    - M2 SSD Hat Kit
    - Official Case
    - Cooler
- **Network Connection:** Connected to Ubiquiti Flex Mini
- **Roles:**
    - Kubernetes API server (HA configuration)
    - etcd cluster
    - Scheduler and controller manager

### MS-01 Cluster Nodes (Detailed Specifications)

- **Hardware Platform:** Minisforum MS-01 Computer
    
- **Networking:**
    
    - Dual-port Intel X710 10GbE SFP+ (Connected to MikroTik for storage/K8s traffic)
    - 2x 2.5Gbe (Connected to Ubiquiti Flex 2.5G for management)
- **CPU:** Intel Core i9-12900H
    
    - 14 cores
    - 20 threads
    - Up to 5.0 GHz
- **Memory:**
    
    - **Total:** 96GB DDR5 RAM
    - **Configuration:** 2 × CT2K48G56C46S5 (48GB each)
    - **Speed:** 5600MHz
- **Storage Configuration:**
    
    - **OS Storage:**
        
        - 1 × Inland QN450 1TB NVMe SSD
        - QLC, Gen4
        - DRAM-less
        - Single-sided
    - **Ceph Storage:**
        
        - 2 × SK hynix Platinum P41 2TB NVMe SSDs
        - TLC, Gen4
        - High endurance
        - Single-sided
- **I/O Ports:**
    
    - USB4 (Thunderbolt 4)
    - HDMI
    - 2 × USB-A
    - 2 × USB-C

## Rack and Networking Details

- **Rack Model:** GeekPi 12U 10″ Mini Rack
    
    - Compact design
    - 12U height
    - Ideal for small-scale datacenter or home lab
- **Networking Infrastructure:**
    
    1. **UDM-PRO**
        
        - Main gateway and security appliance
        - Unified management interface
        - Connected to Unifi Enterprise 24 Port via DAC
    2. **Unifi Enterprise 24 Port**
        
        - Core switching infrastructure
        - High-performance capabilities
        - Connected to Ubiquiti Flex 2.5G via SFP+
    3. **MikroTik CRS309-1G-8S+**
        
        - 8-port SFP+ switch
        - Dedicated to storage and Kubernetes traffic
        - VLAN configuration for traffic isolation
    4. **Ubiquiti UniFi Flex Mini**
        
        - 5-port switch
        - Power over Ethernet (PoE) support
        - Connects Control Plane nodes
        - Compact form factor
    5. **Ubiquiti Networks Flex 2.5G (USW-Flex-2.5G-8)**
        
        - 8-port managed switch
        - 2.5G Ethernet capabilities
        - Connects MS-01 management interfaces
        - Serves as uplink to main network

## High Availability Configuration

- Control plane nodes configured in HA mode with keepalived
- Virtual IP (10.8.18.1) for API server access
- etcd distributed across all control plane nodes
- Load balancing for API server traffic

## Storage Configuration

- Ceph storage cluster across MS-01 nodes
- 4TB raw storage capacity per node (2x 2TB NVMe)
- Kubernetes CSI driver for dynamic provisioning
- Dedicated storage network on VLAN 48

## Operating System Debates
- Ubuntu vs TalosOS
- running proxmox on ms-01 models vs baremetal

## Security Considerations

- Network segmentation via VLANs
- Firewall rules between segments
- Kubernetes network policies for pod isolation
- TLS for all control plane communication
- Certificate management with cert-manager

## Monitoring & Alerting

- Prometheus for metrics collection
- Grafana for dashboards and visualization
- AlertManager for notifications
- Node exporter for hardware metrics
- Kubernetes metrics server for pod/node resource usage

## Backup Strategy

- etcd snapshot backups
- Velero for Kubernetes resource backups
- Ceph snapshots for persistent volume backups
- Off-cluster backup storage

## Resource Allocation

- Node taints for workload placement control
- Resource quotas for namespaces
- Pod resource requests and limits
- Quality of Service (QoS) classes