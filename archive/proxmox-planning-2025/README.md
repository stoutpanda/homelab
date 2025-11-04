# Archived Planning Documentation

This directory contains the original planning documentation that was created during the initial Proxmox homelab design phase (November 2025).

## Archived Files

These documents have been **superseded by NETWORK-REFERENCE.md** in the root directory:

- **INFRASTRUCTURE.md** - Hardware inventory, interfaces, and IP allocations
- **NETWORK.md** - VLAN design, topology, switch configurations
- **PROXMOX-CLUSTER.md** - Cluster configuration, Ceph setup, HA operations
- **IP-MIGRATION-GUIDE.md** - IP migration reference from previous setup

## Why Archived?

The documentation was consolidated into a single comprehensive **NETWORK-REFERENCE.md** file for easier maintenance and reference. The original files contained overlapping information across multiple documents, making it difficult to keep everything synchronized.

## Current Documentation

For up-to-date network, VLAN, subnet, and IP information, please refer to:

**[NETWORK-REFERENCE.md](../../NETWORK-REFERENCE.md)** - Complete network reference covering:
- VLANs and subnet allocations
- All interface IPs (Proxmox hosts, VMs, management interfaces)
- Network topology diagrams
- Switch configurations
- Routing and firewall rules
- Quick reference tables

## Historical Context

These files represent the planning phase where:
- The simplified 4-VLAN design was finalized
- Management IPs from the archived K8s project were documented (vPro: .190/.191)
- Hardware specifications were catalogued
- Network architecture was designed

The information in these files remains valid but may not be updated going forward. Always refer to the current documentation in the root directory.

---

**Archived:** 2025-11-04
**Reason:** Consolidated into NETWORK-REFERENCE.md
