---
# do_release_upgrade_all_nodes.yml
- name: Perform distribution upgrade on all Kubernetes nodes
  hosts: all
  become: true
  gather_facts: true
  serial: 1  # Process nodes one at a time to maintain cluster stability
  
  vars:
    backup_dir: "/root/upgrade_backup_{{ ansible_date_time.iso8601_basic_short }}"
    
  tasks:
    - name: Display current system information
      debug:
        msg: |
          Upgrading node: {{ inventory_hostname }}
          Current OS: {{ ansible_distribution }} {{ ansible_distribution_version }}
          Architecture: {{ ansible_architecture }}
          Kernel: {{ ansible_kernel }}
    
    - name: Create backup directory
      file:
        path: "{{ backup_dir }}"
        state: directory
        mode: '0750'
        owner: root
        group: root
    
    - name: Backup important configuration files
      copy:
        src: "{{ item }}"
        dest: "{{ backup_dir }}/"
        remote_src: true
      with_items:
        - /etc/netplan/
        - /etc/hosts
        - /etc/hostname
        - /etc/kubernetes/  # Only exists on K8s nodes
        - /home/k8sadmin/.kube/  # Only exists where configured
      failed_when: false  # Don't fail if some paths don't exist
    
    - name: Update apt package cache
      apt:
        update_cache: yes
        cache_valid_time: 3600
      register: apt_update_result
      
    - name: Display update status
      debug:
        msg: "Package cache updated: {{ apt_update_result.changed }}"
    
    - name: Install update-manager-core if not present
      apt:
        name: update-manager-core
        state: present
    
    - name: Upgrade all packages before distribution upgrade
      apt:
        upgrade: dist
        autoremove: yes
        autoclean: yes
      register: apt_upgrade_result
      
    - name: Display upgrade details
      debug:
        msg: |
          System packages updated: {{ apt_upgrade_result.changed }}
          {% if apt_upgrade_result.changed %}
          Package upgrade completed successfully.
          {% else %}
          No packages needed upgrading.
          {% endif %}
    
    - name: Check for available distribution upgrades
      command: /usr/bin/do-release-upgrade -c
      register: release_upgrade_check
      changed_when: false
      failed_when: false
      
    - name: Display release upgrade availability
      debug:
        msg: |
          Release upgrade available: {{ 'Yes' if release_upgrade_check.rc == 0 else 'No' }}
          Output: {{ release_upgrade_check.stdout }}
      
    - name: Perform non-interactive distribution upgrade
      command: /usr/bin/do-release-upgrade -f DistUpgradeViewNonInteractive
      register: release_upgrade_result
      when: release_upgrade_check.rc == 0
      timeout: 3600  # Allow up to 1 hour for upgrade
      
    - name: Display distribution upgrade results
      debug:
        msg: |
          Distribution upgrade completed: {{ release_upgrade_result.changed | default(false) }}
          Return code: {{ release_upgrade_result.rc | default('N/A') }}
      when: release_upgrade_check.rc == 0
      
    - name: Check if reboot is required
      stat:
        path: /var/run/reboot-required
      register: reboot_required
      
    - name: Display reboot requirement
      debug:
        msg: |
          Reboot required: {{ 'Yes' if reboot_required.stat.exists else 'No' }}
          Node: {{ inventory_hostname }}
      
    - name: Pause before reboot for cluster stability
      pause:
        prompt: |
          About to reboot {{ inventory_hostname }}.
          
          For control plane nodes: Ensure other control plane nodes are healthy
          For worker nodes: Workloads will be rescheduled to other nodes
          
          Press ENTER to continue with reboot, or Ctrl+C to abort
        echo: false
      when: reboot_required.stat.exists
      
    - name: Reboot node if required
      reboot:
        reboot_timeout: 600  # Wait up to 10 minutes for reboot
        connect_timeout: 5
        pre_reboot_delay: 10
        post_reboot_delay: 30
        test_command: uptime
      when: reboot_required.stat.exists
      
    - name: Wait for node to be fully operational after reboot
      wait_for_connection:
        delay: 30
        timeout: 300
      when: reboot_required.stat.exists
      
    - name: Gather facts after potential reboot
      setup:
      when: reboot_required.stat.exists
      
    - name: Display post-upgrade system information
      debug:
        msg: |
          Node: {{ inventory_hostname }}
          Final OS: {{ ansible_distribution }} {{ ansible_distribution_version }}
          Kernel: {{ ansible_kernel }}
          Uptime: {{ ansible_uptime_seconds }} seconds