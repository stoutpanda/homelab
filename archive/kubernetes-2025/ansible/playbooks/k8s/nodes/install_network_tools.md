---
# install_basic_network_tools.yml - Install essential network diagnostic tools
- name: Install basic network tools on all nodes
  hosts: all
  become: true
  gather_facts: false
  
  tasks:
    - name: Install essential network diagnostic tools
      apt:
        name:
          - iputils-ping      # ping command
          - iproute2          # ip command (usually already installed)
          - dnsutils          # nslookup, dig commands
          - net-tools         # netstat, ifconfig (legacy but useful)
          - traceroute        # traceroute command
          - tcpdump           # packet capture
          - ethtool           # ethernet tool diagnostics
          - netcat-openbsd    # nc command for testing ports
        state: present
        update_cache: yes
      register: tool_installation
      
    - name: Verify ping is now available
      command: ping -c 1 127.0.0.1
      register: ping_test
      changed_when: false
      
    - name: Display installation results
      debug:
        msg: |
          Network tools installation: {{ 'SUCCESS' if tool_installation.changed else 'Already installed' }}
          Ping test: {{ 'WORKING' if ping_test.rc == 0 else 'FAILED' }}
          