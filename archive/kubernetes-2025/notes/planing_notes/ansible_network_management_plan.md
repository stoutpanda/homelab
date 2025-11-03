# Ansible Network Management Plan (K8s Project)

## 1. Environment & Tooling Setup
- **Python 3.13**: Ensure Python 3.13 is installed and set as default for the project.
- **uv for package/venv management**: Use `uv` to create and manage a virtual environment for Ansible and dependencies.
- **Ansible (latest)**: Install the latest Ansible version within the venv using `uv pip install ansible`.

## 2. Ansible Project Structure
- Use the existing `ansible/` directory.
- Organize playbooks and roles for each network component (Unifi, Mikrotik, etc.).
- Use `ansible.cfg` for configuration, referencing the venv Python interpreter.

## 3. Secrets Management with Ansible Vault
- Utilize Ansible Vault for encrypting sensitive data within the repository (e.g., in `group_vars/` or `host_vars/`).
- Follow project guidelines for Vault usage (password storage, file encryption).
- Document the process for using the vault password file during playbook execution.

## 4. Unifi Network Controller (UDM PRO) Integration
- **Current Approach**: UniFi devices are primarily configured manually via the UI due to UDM PRO API limitations for configuration tasks.
- **Ansible Usage**: Ansible may be used for read-only tasks, such as generating client inventory (`ansible/playbooks/unifi/generate_client_inventory.yml`), potentially using the `uri` module or community collections if suitable for *read* operations.
- Credentials for read-only API access (if used) should be stored using Ansible Vault.

## 5. Mikrotik Switch Configuration
- **Current Approach**: The MikroTik CRS309 switch (`10.0.1.82`) was configured manually via SSH.
- **Ansible Usage**: Currently, Ansible is not used for configuring the MikroTik switch. The `community.routeros` collection is available if future automation is desired, but the current setup is manual.
- If read-only information is needed via Ansible in the future, credentials should be stored in Ansible Vault.

## 6. Documentation & Best Practices
- Document all steps in `documentation/network/ansible_usage.md`.
- Reference your notes for long-term planning, but keep this implementation minimal.
- Provide clear instructions for adding new devices or secrets.

## 7. (Optional) Future Enhancements
- Expand Unifi automation if stable plugins become available.
- Add more robust error handling or reporting as needed.
- Integrate with k8s resources if/when required.

---

## Mermaid Diagram: High-Level Workflow (Updated)

```mermaid
flowchart TD
    subgraph Setup
        A1[Python 3.13 + uv venv]
        A2[Install Ansible (latest)]
    end
    subgraph Secrets
        B1[Store secrets in Ansible Vault]
        B2[Use Vault password during execution]
    end
    subgraph Manual_Config [Manual Configuration]
        direction LR
        C1[UniFi UI Config]
        D1[MikroTik SSH Config]
    end
    subgraph Ansible_ReadOnly [Ansible Read-Only Tasks]
        C2[Ansible uri/module -> Unifi API (Read)]
        C3[Poll devices/clients]
    end
    Setup --> Secrets
    Secrets --> Ansible_ReadOnly
    Ansible_ReadOnly -->|Inventory/Status| E1[Ansible Reports]
    %% Manual config happens separately
```

---

### Implementation Notes
- **No custom modules** unless absolutely necessary; use standard plugins and modules.
- **Minimal edge-case handling**: Focus on the happy path for now.
- **Step-by-step secrets setup**: Guide user through Vault integration and credential entry.
- **Simple, repeatable playbooks**: Designed for one-off or infrequent use, not heavy automation.