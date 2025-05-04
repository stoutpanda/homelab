# Ansible Overview
> **Note:** This project no longer automates UniFi or MikroTik network devices. Network devices are configured manually to enhance learning and control. The focus is now on manually installing and managing Kubernetes clusters on Ubuntu, with Ansible playbooks supporting Kubernetes configuration and deployment.

This document provides a high-level overview of Ansible, including its core concepts, terminology, important commands, and best practices.

---

## **1. Core Concepts**
- **Agentless Architecture**: Ansible does not require any agent to be installed on the target machines. It uses SSH (or WinRM for Windows) to communicate with remote hosts.
- **Declarative Language**: You describe the desired state of your systems, and Ansible ensures they are configured accordingly.

---

## **2. Terminology**

### **Control Node**
The machine where Ansible is installed and from which you run playbooks. This is the orchestrator of your automation tasks.

### **Managed Nodes**
The systems (e.g., servers, virtual machines) you manage with Ansible. These are often referred to as "hosts."

### **Inventory**
- A file or script that lists the managed nodes and their details.
- Default location: `/etc/ansible/hosts`.
- Written in **INI** or **YAML** format.
- Can include static or dynamic inventories.

Example:
```ini
[web]
webserver1 ansible_host=192.168.1.10 ansible_user=ubuntu

[db]
dbserver1 ansible_host=192.168.1.20 ansible_user=ubuntu
```

### **Modules**
Reusable units of code that perform specific tasks (e.g., managing files, installing packages, configuring services). Modules are the building blocks of Ansible.

Example: `yum`, `apt`, `copy`, `service`.

### **Playbooks**
- **YAML** files that define the series of tasks you want to execute on managed nodes.
- Structured and human-readable.

Example:
```yaml
- name: Install and start Apache
  hosts: web
  tasks:
    - name: Install Apache
      apt:
        name: apache2
        state: present

    - name: Start Apache service
      service:
        name: apache2
        state: started
```

### **Tasks**
Individual instructions or actions in a playbook. Tasks use modules to perform operations.

### **Roles**
A way to organize playbooks into reusable components. Roles separate tasks, variables, templates, and files for better project structure.

Directory structure for a role:
```
roles/
  myrole/
    tasks/
    handlers/
    templates/
    files/
    vars/
```

### **Handlers**
Specialized tasks triggered by events. They are often used to restart services after configuration changes.

Example:
```yaml
- name: Restart Apache
  service:
    name: apache2
    state: restarted
```

### **Variables**
Values that can be dynamically substituted into tasks, templates, or configurations. Defined in playbooks, inventories, or external files.

Example:
```yaml
web_port: 8080
```

### **Templates**
- Files with placeholders that are dynamically replaced using the Jinja2 templating engine.
- Example: `nginx.conf.j2`.

Example Jinja2 Template:
```jinja
server {
    listen {{ web_port }};
    server_name {{ domain_name }};
}
```

### **Facts**
System information gathered by Ansible from the managed nodes, such as OS type, IP address, or memory. These are collected automatically and can be used as variables.

Example fact: `ansible_os_family`.

### **Galaxy**
Ansible's repository for sharing and reusing roles. You can download community-contributed roles using `ansible-galaxy`.

---

## **3. Key Files**
- `ansible.cfg`: Configuration file for global or local settings.
- `hosts` (Inventory): File listing managed nodes.

---

## **4. Execution Workflow**
1. Write or obtain an inventory file.
2. Create a playbook that defines tasks.
3. Run playbooks using the `ansible-playbook` command.

Example:
```bash
ansible-playbook -i inventory.ini playbook.yml
```

---

## **5. Important Commands**

### General Commands
- `ansible --version`: Check the installed version of Ansible.
- `ansible-inventory`: View or validate your inventory.
- `ansible -m ping all`: Test connectivity to all hosts.
- `ansible-playbook playbook.yml`: Run a playbook.

### Using Ansible Vault
- **Encrypt a file**: Use Ansible Vault to encrypt sensitive files like variable files.
  ```bash
  ansible-vault encrypt secrets.yml
  ```
- **Decrypt a file**: Decrypt an encrypted file to view or edit it.
  ```bash
  ansible-vault decrypt secrets.yml
  ```
- **Edit an encrypted file**: Open an encrypted file in edit mode.
  ```bash
  ansible-vault edit secrets.yml
  ```
- **Use encrypted files in a playbook**: Run a playbook that uses encrypted files. Ansible will prompt you for the vault password.
  ```bash
  ansible-playbook playbook.yml --ask-vault-pass
  ```
- **Rekey a vault file**: Change the password for an encrypted file.
  ```bash
  ansible-vault rekey secrets.yml
  ```
- **Encrypt strings**: Encrypt sensitive strings directly (useful for inline variables).
  ```bash
  ansible-vault encrypt_string 'my_secret_password' --name 'db_password'
  ```

> **Tip**: You can also use a vault password file for automation, but ensure it is secure and not shared.

---

## **6. Common Use Cases**
- Provisioning servers (cloud or on-prem).
- Managing application configurations.
- Deploying applications or updates.
- Orchestrating complex workflows.
- Automated security compliance.

---

## **7. Best Practices**
- Use roles to organize your playbooks for reusability.
- Avoid hardcoding variables; use variable files or secrets management tools like Ansible Vault.
- Test playbooks in a staging environment before running them in production.
