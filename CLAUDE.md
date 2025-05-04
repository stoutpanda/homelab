## Updated CLAUDE.md

```markdown
# Claude Homelab Assistant Guide

This document provides guidelines for Claude when working on this homelab project.

## Project Overview

This is a homelab infrastructure management repository focused on deploying a Kubernetes cluster on Raspberry Pi 5 hardware. The project emphasizes learning both Kubernetes and Ansible through hands-on implementation.

## Educational Approach

- This is explicitly a learning project
- Playbooks should be explained in detail before execution
- Each step should be broken down into manageable pieces
- Focus on understanding the "why" behind each configuration
- Prefer thorough explanations over quick solutions

## Key Conventions

1. **Authentication**: All roles use the standardized Ansible Vault approach for credential management
2. **User Management**: Operations run as k8sadmin user with passwordless sudo
3. **Vault Structure**: All sensitive data is stored in Ansible Vault
4. **Working Directory**: Commands should assume operation from within the ansible/ directory

## Project Progression

The project follows a methodical step-by-step approach:
1. Infrastructure setup and authentication (completed)
2. Kubernetes prerequisites installation
3. Container runtime deployment
4. Kubernetes components installation
5. HA control plane configuration
6. Worker node integration

## Documentation Standards

- Update documentation when modifying functionality
- Add examples for new features in `ansible/playbooks/examples/`
- Document each playbook's purpose and usage
- Keep tracking document updated with progress

## Code Patterns

- Prefer conditional task inclusion in main.yml over separate playbooks
- Use `ansible_become: true` and `ansible_become_user: k8sadmin` for privilege escalation
- Include detailed comments in all playbooks
- Verify each step before proceeding to the next

## Learning Objectives

When working on this project, Claude should emphasize:
- Explaining how each playbook works
- Identifying the purpose of each task
- Discussing alternatives and best practices
- Making recommendations that enhance learning
- Providing context for Kubernetes components and their relationships
- ENSURING THAT ALL SOULTIONS USE THE LATEST AND CURRENT DOCUMENTED BEST PRACTICES