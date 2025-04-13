'''mermaid

graph TD
    Internet[Internet] --> UDMPRO{{UDM-PRO<br>10.0.1.1}}
    
    UDMPRO -- "DAC → Port 1<br>VLANs: 1,2,3,4,5,6,10,18,28,38,48,58" --> CoreSwitch[Unifi Enterprise 24 Port<br>Core Switch<br>10.0.1.238]
    
    CoreSwitch -- "SFP+ → Port 24<br>VLANs: 1,18,28,38,48,58" --> Flex25G[Ubiquiti Flex 2.5G<br>10.0.1.80]
    
    Flex25G -- "Port 1: Uplink<br>Trunk: All VLANs" --- CoreSwitch
    
    Flex25G -- "Port 2-3<br>VLANs: 1,18" --> MS01Node1[MS-01 Node 1<br>10.0.1.90]
    Flex25G -- "Port 4-5<br>VLANs: 1,18" --> MS01Node2[MS-01 Node 2<br>10.0.1.91]
    
    Flex25G -- "Port 6<br>VLANs: 1,18" --> FlexMini[Ubiquiti Flex Mini<br>10.0.1.81]
    
    FlexMini -- "Port 1: Uplink<br>VLANs: 1,18" --- Flex25G
    FlexMini -- "Port 2<br>VLANs: 1,18" --> K8sCP01[K8s-CP-01<br>10.0.1.86]
    FlexMini -- "Port 3<br>VLANs: 1,18" --> K8sCP02[K8s-CP-02<br>10.0.1.87]
    FlexMini -- "Port 4<br>VLANs: 1,18" --> K8sCP03[K8s-CP-03<br>10.0.1.88]
    
    Flex25G -- "Port 7<br>VLAN: 1 only" --> MikroTik[MikroTik CRS309-1G-8S+<br>10.0.1.82]
    
    MikroTik -- "Port 1: Management<br>VLAN: 1 only" --- Flex25G
    MikroTik -- "Port 2-3<br>VLANs: 28,38,48" --> MS01Node1
    MikroTik -- "Port 4-5<br>VLANs: 28,38,48" --> MS01Node2
    
    Flex25G -- "Port 8<br>VLANs: 1,18" --> AdminBox[Admin Box<br>10.0.1.85]
    
    classDef internet fill:#333,stroke:#eee,stroke-width:1px,color:#eee
    classDef router fill:#e63946,stroke:#eee,stroke-width:2px,color:#fff
    classDef switch fill:#4361ee,stroke:#eee,stroke-width:1px,color:#fff
    classDef node fill:#2a9d8f,stroke:#eee,stroke-width:1px,color:#fff
    classDef controlplane fill:#8338ec,stroke:#eee,stroke-width:1px,color:#fff
    
    class Internet internet
    class UDMPRO router
    class CoreSwitch,Flex25G,FlexMini,MikroTik switch
    class MS01Node1,MS01Node2 node
    class K8sCP01,K8sCP02,K8sCP03,AdminBox controlplane```mermaid
'''

