```
Internet
    │
    ▼
UDM-PRO (10.0.1.1) - Main Gateway & Security Appliance
    │ 
    │ DAC → Port 1 (VLANs: 1,2,3,4,5,6,10,16,18,28,38,48,58)
    ▼
Unifi Enterprise 24 Port (10.0.1.238) - Core Switch
    │
    ├────── Port 8: USW-Flex-Printer (10.0.1.204) → Printer Area
    │
    ├────── Port 9: USW-Flex-Media (10.0.1.208) → Media Center
    │       │
    │       └── Various media devices (VLAN 1, 10)
    │
    ├────── Port 10: USW-Flex-SimRoom (10.0.1.212) → Simulation Room
    │       │
    │       └── Simulation equipment (VLAN 1, 4)
    │
    ├────── Port 12: U6-Enterprise-LivingArea (10.0.1.207) → Living Area
    │       │
    │       └── Wireless clients (VLANs 1, 2, 3)
    │
    ├────── Port 14: U6-Enterprise-IW-Upstairs-Living (10.0.1.227) → Upstairs
    │       │
    │       └── Wireless clients (VLANs 1, 2, 3)
    │
    ├────── Port 16: U6-Lite-Game (10.0.1.242) → Game Room
    │       │
    │       └── Wireless clients (VLANs 1, 3)
    │
    ├────── Port 18: USW-Enterprise-8-PoE-Server (10.0.1.239) → Server Rack
    │       │
    │       └── Various server connections (VLANs 1, 6, 10)
    │
    ├────── Port 20: UNVR-Serenity (10.0.5.250) → Security Rack
    │       │
    │       └── Security cameras (VLAN 5)
    │
    │ SFP+ → Port 24 (VLANs: 1,16,18,28,38,48,58)
    ▼
Ubiquiti Flex 2.5G (10.0.1.80) - K8s Access Switch
    │
    ├───── Port 1: Uplink to Enterprise 24 Port (Trunk: All VLANs, VLAN 1 native)
    │
    ├───── Port 2-3: MS-01 Node 1 (10.8.16.90) 2.5G ports (VLAN 16 native, VLAN 18 tagged)
    │
    ├───── Port 4-5: MS-01 Node 2 (10.8.16.91) 2.5G ports (VLAN 16 native, VLAN 18 tagged)
    │
    ├───── Port 6: Connection to Flex Mini (VLAN 16 native, VLAN 18 tagged)
    │      │
    │      ▼
    │     Ubiquiti Flex Mini (10.0.1.81) - Control Plane Switch
    │       │
    │       ├── Port 1: Uplink to Flex 2.5G (VLAN 16 native, VLAN 18 tagged)
    │       │
    │       ├── Port 2: K8s-CP-01 (10.8.16.86) (VLAN 16 native, VLAN 18 tagged)
    │       │
    │       ├── Port 3: K8s-CP-02 (10.8.16.87) (VLAN 16 native, VLAN 18 tagged)
    │       │
    │       └── Port 4: K8s-CP-03 (10.8.16.88) (VLAN 16 native, VLAN 18 tagged)
    │
    ├───── Port 7: MikroTik CRS309 Management (VLAN 1 only)
    │      │
    │      ▼
    │     MikroTik CRS309-1G-8S+ (10.0.1.82) - Storage Network Switch
    │       │
    │       ├── Port 1: Management to Flex 2.5G (VLAN 1 only)
    │       │
    │       ├── Port 2-3: MS-01 Node 1 SFP+ (VLANs: 28,38,48)
    │       │
    │       └── Port 4-5: MS-01 Node 2 SFP+ (VLANs: 28,38,48)
    │
    └───── Port 8: Admin Box (10.8.16.85) (VLAN 16 native, VLAN 18 tagged)
```

## Legend: Network Traffic Flow and VLAN Distribution

|Segment|Primary VLANs|Traffic Type|
|---|---|---|
|Core Network|1|Management traffic for all network devices|
|IoT Network|2|Smart home devices, IoT appliances|
|Family Network|3|Personal devices, phones, tablets|
|Work Devices|4|Work laptops, workstations|
|Security Network|5|Cameras, security sensors|
|Reverse Proxy|6|External access services|
|Public Services|10|Media servers, shared resources|
|K8s Management|16|Kubernetes management traffic|
|K8s Control Plane|18|API server, etcd, control communications|
|K8s Pod Network|28|Container workload traffic|
|K8s Service Network|38|Service discovery and internal balancing|
|Storage Network|48|Ceph/persistent storage traffic|
|Load Balancer Network|58|External service exposure|

## Network Isolation and Routing Overview

```
                            ┌──────────────────────┐
                            │                      │
                            │   UDM-Pro (10.0.1.1) │
                            │   Central Router     │
                            │                      │
                            └──────────────────────┘
                                       │
                                       │ Centralized Routing
                                       ▼
┌───────────────┐      ┌─────────────────────────┐     ┌───────────────────┐
│ IoT & Family  │◄────►│                         │◄───►│ Work & Security   │
│ Networks      │      │    Enterprise Switch    │     │ Networks          │
│ VLANs 2,3     │      │       (10.0.1.238)      │     │ VLANs 4,5         │
└───────────────┘      │                         │     └───────────────────┘
                       └─────────────────────────┘
                                       │
                                       │
                                       ▼
                      ┌────────────────────────────────┐
                      │                                │
                      │     Kubernetes Infrastructure  │
                      │     VLANs 16,18,28,38,48,58    │
                      │                                │
                      └────────────────────────────────┘
```

## Physical/Logical Network Zones

### Zone 1: Core Infrastructure

- UDM-Pro
- Enterprise 24 Port Switch
- Various access switches
- Primary management network (VLAN 1)

### Zone 2: User/IoT Networks

- Family devices (VLAN 3)
- IoT devices (VLAN 2)
- Work devices (VLAN 4)
- Various access points and switches

### Zone 3: Service Networks

- Public services (VLAN 10)
- Reverse proxy (VLAN 6)
- Security cameras (VLAN 5)

### Zone 4: Kubernetes Infrastructure

- Management network (VLAN 16)
- Control plane network (VLAN 18)
- Data networks (VLANs 28, 38, 48, 58)
- Dedicated switches for K8s services