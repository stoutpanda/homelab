# Claude Homelab Assistant Guide

This document provides guidelines for Claude when working on this homelab project.

## Project Overview

This is a homelab infrastructure management repository focused on deploying and managing a **Proxmox VE high-availability cluster**. The project emphasizes learning virtualization, distributed storage (Ceph), and infrastructure design through hands-on implementation.

### Key Technologies
- **Proxmox VE:** Enterprise virtualization platform
- **Ceph:** Distributed block storage with replication
- **High Availability:** Quorum-based clustering with automatic failover
- **Advanced Networking:** VLAN segmentation, bonding, 10GbE storage networks

### Hardware Platform
- **2x Minisforum MS-01** (Intel i9-13900H, 96GB RAM, dual 10GbE SFP+)
- **1x AMD AI Max** (specifications TBD, GPU/AI acceleration)
- **UniFi Network Infrastructure** (UDM-Pro, Enterprise switches, MikroTik storage switch)

## Educational Approach

- This is explicitly a **learning project** focused on enterprise-grade homelab infrastructure
- Each configuration should be explained in detail before implementation
- Each step should be broken down into manageable pieces
- Focus on understanding the "why" behind each decision
- Prefer thorough explanations over quick solutions
- Discuss trade-offs and alternatives

## Key Conventions

1. **Documentation-First**: All infrastructure changes must be documented in the appropriate markdown files
2. **No Ansible**: This project does NOT use Ansible for management (unlike the archived K8s project)
3. **Manual Configuration**: Proxmox and Ceph are configured via Web UI, CLI, or configuration files
4. **Version Control**: All documentation and configuration files are tracked in Git

## Documentation Structure

### Core Documentation Files
| File | Purpose | Update Frequency |
|------|---------|------------------|
| `NETWORK-REFERENCE.md` | **Complete network reference: VLANs, subnets, IPs, interfaces** | When any network/IP changes occur |
| `KUBERNETES-TALOS.md` | Kubernetes/Talos configuration and operations | When K8s configuration changes |
| `README.md` | Project overview and quick reference | As needed for major milestones |
| `CLAUDE.md` | AI assistant guidelines | When project guidelines change |

### Archive
- `archive/kubernetes-2025/`: Previous K8s project documentation (for reference only)
- `archive/proxmox-planning-2025/`: Original planning docs (INFRASTRUCTURE, NETWORK, PROXMOX-CLUSTER, IP-MIGRATION-GUIDE)

## Project Progression

The project follows a methodical step-by-step approach:

### Phase 1: Planning & Documentation (Current)
- [x] Document network design and VLAN structure
- [x] Document hardware inventory and specifications
- [ ] Finalize IP allocation scheme
- [ ] Complete AMD AI Max hardware documentation

### Phase 2: Network Infrastructure
- [ ] Create VLANs on UDM-Pro (16, 28, 48)
- [ ] Configure switch port profiles
- [ ] Cable storage network (10GbE SFP+)
- [ ] Verify network connectivity and performance

### Phase 3: Proxmox Installation
- [ ] Install Proxmox VE 8.x on all three nodes
- [ ] Configure network interfaces (VLANs, bonds)
- [ ] Configure out-of-band management (vPro/BMC)
- [ ] Apply security hardening

### Phase 4: Cluster Creation
- [ ] Initialize Proxmox cluster on first node
- [ ] Join remaining nodes to cluster
- [ ] Configure HA and fencing
- [ ] Verify quorum and cluster communication

### Phase 5: Ceph Storage
- [ ] Install Ceph packages on all nodes
- [ ] Create Ceph monitors (MON) on all nodes
- [ ] Create Ceph OSDs from NVMe drives
- [ ] Configure Ceph pools (vm-disks, vm-data, backups)
- [ ] Verify replication and performance

### Phase 6: VM Deployment
- [ ] Create VM templates (Ubuntu, etc.)
- [ ] Deploy initial VMs
- [ ] Configure GPU passthrough (AMD AI Max)
- [ ] Implement backup strategy

### Phase 7: Monitoring & Operations
- [ ] Set up monitoring stack (Prometheus/Grafana)
- [ ] Configure email alerts
- [ ] Document operational procedures
- [ ] Perform DR drills

## Documentation Standards

### When to Update Documentation
- **NETWORK-REFERENCE.md:** When any hardware changes, IPs are assigned, VLANs change, subnets modified, or topology updated
- **KUBERNETES-TALOS.md:** When Kubernetes or Talos configuration changes
- **README.md:** For major project milestones or significant changes

### Documentation Best Practices
- Use tables for structured data (IPs, hardware specs, VLAN assignments)
- Include Mermaid diagrams for visual representation of networks and architectures
- Mark sections as "TBD" when information is not yet known
- Include command examples for common operations
- Add troubleshooting sections for known issues

## Command Execution Guidelines

### Proxmox VE Commands
- **Always verify** before executing destructive commands
- **Explain** what each command does and why it's needed
- **Provide context** for Proxmox-specific terminology (e.g., qm, pct, pvecm)
- **Check status** after operations to verify success

### Ceph Commands
- **Monitor health** before and after changes (ceph status)
- **Understand replication** impact of OSD operations
- **Verify performance** after configuration changes
- **Document** any non-default settings

### Network Commands
- **Test connectivity** after network changes
- **Verify VLANs** are properly tagged
- **Check MTU** for jumbo frame support on storage network
- **Monitor performance** with iperf3 or similar tools

## Learning Objectives

When working on this project, Claude should emphasize:
- Explaining Proxmox architecture and how HA works
- Clarifying Ceph concepts (OSDs, monitors, pools, PGs, CRUSH)
- Discussing network design trade-offs (VLANs, MTU, bonding)
- Providing context for virtualization concepts (CPU pinning, NUMA, VirtIO)
- Exploring GPU passthrough and vGPU options for AI workloads
- Recommending best practices for backup, monitoring, and disaster recovery
- **ENSURING THAT ALL SOLUTIONS USE THE LATEST AND CURRENT DOCUMENTED BEST PRACTICES**

## Best Practices

### Proxmox
- Use VirtIO drivers for VMs (best performance)
- Enable HA only for VMs that need it (reduces overhead)
- Regular backups with retention policies
- Keep Proxmox and Ceph versions in sync across cluster
- Use templates for consistent VM deployment

### Ceph
- Minimum 3 nodes for proper replication
- Separate public (client) and cluster (replication) networks for performance
- Use dedicated 10GbE network for storage
- Enable jumbo frames (MTU 9000) on storage network
- Monitor OSD balance and performance regularly

### Networking
- Isolate storage traffic on dedicated VLAN
- Use LACP bonding for redundancy and throughput
- Document all IP allocations and MAC addresses
- Use consistent naming conventions (pve-*, vlan-, etc.)
- Test failover scenarios regularly

### Security
- Enable 2FA for Proxmox web UI
- Use SSH keys, disable password authentication
- Restrict management access to trusted networks
- Keep firmware and software up to date
- Encrypt backups

## Common Pitfalls to Avoid

1. **Quorum Loss:** Ensure at least 2 nodes are online for HA to work
2. **Mixed Versions:** Don't mix Proxmox or Ceph versions across cluster
3. **Network Misconfiguration:** Verify VLANs and MTU before deploying Ceph
4. **Insufficient Resources:** Reserve resources for Proxmox/Ceph overhead
5. **No Backups:** Always have backups before major changes
6. **Skipping Testing:** Test failover and DR procedures regularly

## Reference to Previous Project

The archived Kubernetes project (archive/kubernetes-2025/) provides valuable context:
- VLAN design patterns
- Network performance testing approaches
- High availability concepts
- Lessons learned from multi-node clusters

Refer to it when relevant, but avoid confusion between K8s and Proxmox architectures.