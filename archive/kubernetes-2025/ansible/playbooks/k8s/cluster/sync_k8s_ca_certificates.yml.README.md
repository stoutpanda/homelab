# Kubernetes CA Certificate Synchronization Playbook

This document describes the `sync_k8s_ca_certificates.yml` playbook, which synchronizes CA certificates across all Kubernetes control plane nodes and configures secure access to the API server through the Virtual IP (VIP).

## Purpose

The playbook addresses certificate validation issues that occur when accessing the Kubernetes API through a Virtual IP (VIP) that is not included in the API server certificate's Subject Alternative Names (SANs).

## When to Use This Playbook

Use this playbook when:

1. You encounter certificate validation errors when accessing the Kubernetes API through the VIP
2. You see errors like: "certificate is valid for 10.8.18.86, 10.8.18.87, 10.8.18.88, not 10.8.18.2"
3. You've set up HA with HAProxy and Keepalived but kubectl operations fail with certificate errors
4. You want to transition from using `--insecure-skip-tls-verify=true` to proper, secure certificate validation

## How It Works

The playbook performs the following tasks:

1. On the first control plane node (k8s-cp-01):
   - Creates a temporary directory for certificate synchronization
   - Creates a compressed archive of all CA certificates
   - Fetches this archive to be distributed to other nodes

2. On all other control plane nodes (k8s-cp-02, k8s-cp-03):
   - Creates a temporary directory
   - Copies the CA certificates archive
   - Backs up existing certificates (with date stamp)
   - Extracts the new CA certificates to replace existing ones
   - Restarts the API server to apply the new certificates
   - Verifies the new CA certificate

3. On all control plane nodes:
   - Waits for the API server to become available
   - Updates kubeconfig to use the VIP with proper certificate validation
   - Tests connectivity to confirm the fix
   - Cleans up temporary files

## Prerequisites

- A functioning Kubernetes cluster with multiple control plane nodes
- HAProxy and Keepalived configured with a VIP (10.8.18.2)
- SSH access to all control plane nodes

## Usage

Run the playbook as follows:

```bash
cd ansible
ansible-playbook playbooks/k8s/cluster/sync_k8s_ca_certificates.yml
```

## Verification

After running the playbook, verify the fix by:

1. Checking the API server certificate includes the VIP:
   ```bash
   echo | openssl s_client -showcerts -connect 10.8.18.2:16443 2>/dev/null | openssl x509 -text | grep -A1 'Subject Alternative Name'
   ```

2. Testing kubectl access without certificate errors:
   ```bash
   kubectl get nodes
   ```

3. Verifying kubeconfig is configured to use the VIP with certificate validation:
   ```bash
   kubectl config view | grep server
   kubectl config view | grep insecure
   ```

## Troubleshooting

If issues persist after running the playbook:

1. Check API server status on all nodes:
   ```bash
   sudo systemctl status kubelet
   ```

2. Verify certificate synchronization:
   ```bash
   openssl x509 -in /etc/kubernetes/pki/ca.crt -text -noout | grep Issuer
   ```

3. Check HAProxy and Keepalived status:
   ```bash
   sudo systemctl status haproxy
   sudo systemctl status keepalived
   ```

4. Verify the VIP is assigned to one node:
   ```bash
   ip addr show | grep 10.8.18.2
   ```

## Notes

- This playbook includes backup functionality. Previous certificates are stored in `/etc/kubernetes/pki/backup-YYYY-MM-DD/`
- The API server is restarted during this process, which will cause a brief control plane outage (pods continue running)
- The playbook sets `gather_facts: true` to ensure the `ansible_date_time` variable is available for backup timestamps