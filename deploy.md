# Cloudflare + Ubuntu Server + Nginx + HTTPS Setup Guide

Complete guide to connecting a custom domain to an Ubuntu VPS / AWS EC2 server using Cloudflare DNS, Origin SSL Certificate, and Nginx Reverse Proxy.

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Connect to Ubuntu Server](#2-connect-to-ubuntu-server)
3. [Install Nginx](#3-install-nginx)
4. [Configure Firewall](#4-configure-firewall)
5. [Connect Domain to Cloudflare](#5-connect-domain-to-cloudflare)
6. [Configure Cloudflare DNS](#6-configure-cloudflare-dns)
7. [Generate Cloudflare Origin Certificate](#7-generate-cloudflare-origin-certificate)
8. [Configure SSL Certificates](#8-configure-ssl-certificates)
9. [Configure Nginx](#9-configure-nginx)
10. [Enable Nginx Configuration](#10-enable-nginx-configuration)
11. [Configure Cloudflare SSL/TLS](#11-configure-cloudflare-ssltls)
12. [Deploy Application](#12-deploy-application)
13. [Verify HTTPS](#13-verify-https)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Prerequisites

Before starting, prepare the following:

| Item             | Example           |
| ---------------- | ----------------- |
| Server           | AWS EC2 / VPS     |
| Operating System | Ubuntu 24.04 LTS  |
| Public IP        | `YOUR_SERVER_IP`  |
| Domain           | `example.com`     |
| DNS Provider     | Cloudflare        |
| Web Server       | Nginx             |
| Application      | Next.js / Node.js |
| Application Port | 3000              |

Replace all example values with your actual server IP and domain.

## 2. Connect to Ubuntu Server

Connect to your server using SSH.

```bash
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP
```

For a VPS using root authentication:

```bash
ssh root@YOUR_SERVER_IP
```

Update the system:

```bash
sudo apt update && sudo apt upgrade -y
```

## 3. Install Nginx

Install Nginx:

```bash
sudo apt install nginx -y
```

Enable Nginx on system startup:

```bash
sudo systemctl enable nginx
```

Start Nginx:

```bash
sudo systemctl start nginx
```

Check Nginx status:

```bash
sudo systemctl status nginx
```

Test your server by visiting:

```text
http://YOUR_SERVER_IP
```

You should see the default Nginx welcome page.

## 4. Configure Firewall

Allow SSH, HTTP, and HTTPS connections.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Check firewall rules:

```bash
sudo ufw status
```

### AWS EC2 Security Group

If you use AWS EC2, configure the inbound rules:

| Type  | Port | Source    |
| ----- | ---: | --------- |
| SSH   |   22 | Your IP   |
| HTTP  |   80 | 0.0.0.0/0 |
| HTTPS |  443 | 0.0.0.0/0 |

Also configure IPv6 rules if your server uses IPv6.

## 5. Connect Domain to Cloudflare

1. Visit https://dash.cloudflare.com/
2. Log in to your Cloudflare account.
3. Select **Add a domain**.
4. Enter your domain name.
5. Select the Free plan.
6. Cloudflare will provide two nameservers.

Example:

```text
alice.ns.cloudflare.com
bob.ns.cloudflare.com
```

Go to your domain registrar and replace the existing nameservers with the nameservers provided by Cloudflare.

Wait until Cloudflare confirms that your domain is active.

## 6. Configure Cloudflare DNS

Navigate to:

**Cloudflare Dashboard → Your Domain → DNS → Records**

Add the following records.

### Root Domain

| Field        | Value          |
| ------------ | -------------- |
| Type         | A              |
| Name         | @              |
| IPv4 Address | YOUR_SERVER_IP |
| Proxy Status | Proxied        |
| TTL          | Auto           |

### WWW Subdomain

| Field        | Value       |
| ------------ | ----------- |
| Type         | CNAME       |
| Name         | www         |
| Target       | example.com |
| Proxy Status | Proxied     |
| TTL          | Auto        |

Make sure the proxy status is enabled (Orange Cloud).

Your domain should now point to your server through Cloudflare.

## 7. Generate Cloudflare Origin Certificate

Navigate to:

**Cloudflare Dashboard → Your Domain → SSL/TLS → Origin Server**

1. Click **Create Certificate**.
2. Select RSA as the private key type.
3. Add the following hostnames:

```text
example.com
*.example.com
```

4. Select your preferred certificate validity period.
5. Click **Create**.

Cloudflare will generate two items:

- Origin Certificate
- Private Key

Copy both values and keep them secure.

**Important:** Save the Private Key immediately. Do not publish it or commit it to GitHub.

## 8. Configure SSL Certificates

Create a directory for Cloudflare certificates:

```bash
sudo mkdir -p /etc/ssl/cloudflare
```

### 8.1 Create Origin Certificate

```bash
sudo nano /etc/ssl/cloudflare/origin.pem
```

Paste your Cloudflare Origin Certificate:

```text
-----BEGIN CERTIFICATE-----
YOUR_ORIGIN_CERTIFICATE_CONTENT
-----END CERTIFICATE-----
```

Save with:

- `CTRL + O`
- `ENTER`
- `CTRL + X`

### 8.2 Create Private Key

```bash
sudo nano /etc/ssl/cloudflare/origin.key
```

Paste your Cloudflare Private Key:

```text
-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENT
-----END PRIVATE KEY-----
```

Save the file.

### 8.3 Configure Permissions

```bash
sudo chown root:root /etc/ssl/cloudflare/origin.pem
sudo chown root:root /etc/ssl/cloudflare/origin.key

sudo chmod 644 /etc/ssl/cloudflare/origin.pem
sudo chmod 600 /etc/ssl/cloudflare/origin.key
```

Your SSL directory should look like this:

```text
/etc/ssl/cloudflare/
├── origin.pem
└── origin.key
```

## 9. Configure Nginx

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/example.com
```

Add the following configuration.

### HTTP to HTTPS Redirect + HTTPS Reverse Proxy

This example assumes your Next.js application is running on port 3000.

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;

    server_name example.com www.example.com;

    return 301 https://$host$request_uri;
}


# HTTPS Configuration
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name example.com www.example.com;

    # Cloudflare Origin SSL Certificate
    ssl_certificate /etc/ssl/cloudflare/origin.pem;
    ssl_certificate_key /etc/ssl/cloudflare/origin.key;

    # SSL Protocols
    ssl_protocols TLSv1.2 TLSv1.3;

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Reverse Proxy
    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket Support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Replace:

- `example.com` with your actual domain.
- `3000` with your application port if different.

**Note:** This configuration forwards traffic to your application. Your application must already be running.

## 10. Enable Nginx Configuration

Create a symbolic link from `sites-available` to `sites-enabled`.

```bash
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/example.com
```

The correct directory name is `sites-enabled`, not `sites-enable`.

### Optional: Remove Default Configuration

If you no longer need the default Nginx site:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Test Nginx Configuration

Always test before restarting:

```bash
sudo nginx -t
```

Expected output:

```text
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Restart Nginx

```bash
sudo systemctl restart nginx
```

For future configuration changes, use:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Check Nginx status:

```bash
sudo systemctl status nginx
```

## 11. Configure Cloudflare SSL/TLS

Navigate to:

**Cloudflare Dashboard → Your Domain → SSL/TLS → Overview**

Set the encryption mode to:

```text
Full (strict)
```

This ensures encrypted communication between:

```text
Browser → Cloudflare → Origin Server
```

### Enable Always Use HTTPS

Navigate to:

**SSL/TLS → Edge Certificates**

Enable:

```text
Always Use HTTPS = ON
```

Optional:

```text
Automatic HTTPS Rewrites = ON
```

## 12. Deploy Application

Your Nginx configuration forwards requests to port 3000.

Make sure your application is running on that port.

### Next.js Example

Build your application:

```bash
npm install
npm run build
```

Start Next.js:

```bash
npm run start -- --hostname 127.0.0.1 --port 3000
```

Test the application locally:

```bash
curl http://127.0.0.1:3000
```

### Keep Application Running with PM2

Install PM2:

```bash
sudo npm install -g pm2
```

Start Next.js:

```bash
pm2 start npm --name portfolio -- start -- --hostname 127.0.0.1 --port 3000
```

Save the process list:

```bash
pm2 save
```

Configure startup:

```bash
pm2 startup
```

Run the additional command displayed by PM2.

Check application status:

```bash
pm2 status
```

## 13. Verify HTTPS

### Check DNS

```bash
dig example.com
```

Cloudflare Proxy may return Cloudflare IP addresses instead of your origin server IP.

### Check Nginx

```bash
sudo nginx -t
sudo systemctl status nginx
```

### Check Application

```bash
pm2 status
```

### Check SSL Certificate

```bash
sudo openssl x509 \
-in /etc/ssl/cloudflare/origin.pem \
-noout -dates -subject
```

### Test Website

Open your browser:

```text
https://example.com
https://www.example.com
```

Your website should now be accessible over HTTPS.

## 14. Troubleshooting

| Error | Possible Cause                   | Solution                                               |
| ----- | -------------------------------- | ------------------------------------------------------ |
| 521   | Origin server refuses connection | Check Nginx and firewall                               |
| 522   | Origin connection timeout        | Check network and server                               |
| 525   | SSL handshake failure            | Check certificate and SSL configuration                |
| 526   | Invalid origin certificate       | Check Full (strict), certificate validity and hostname |
| 502   | Application unavailable          | Check PM2 and application port                         |
| 403   | Forbidden                        | Check Nginx permissions and application rules          |

### Useful Debugging Commands

Check Nginx status:

```bash
sudo systemctl status nginx
```

Check Nginx error logs:

```bash
sudo tail -f /var/log/nginx/error.log
```

Check Nginx access logs:

```bash
sudo tail -f /var/log/nginx/access.log
```

Check listening ports:

```bash
sudo ss -tulpn
```

Check PM2 logs:

```bash
pm2 logs
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

---

## Final Directory Structure

```text
/etc/
├── ssl/
│   └── cloudflare/
│       ├── origin.pem
│       └── origin.key
│
└── nginx/
    ├── sites-available/
    │   └── example.com
    │
    └── sites-enabled/
        └── example.com -> ../sites-available/example.com
```

## Quick Reference Commands

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Create SSL directory
sudo mkdir -p /etc/ssl/cloudflare

# Create certificate
sudo nano /etc/ssl/cloudflare/origin.pem

# Create private key
sudo nano /etc/ssl/cloudflare/origin.key

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/YOUR_DOMAIN

# Enable Nginx site
sudo ln -s /etc/nginx/sites-available/YOUR_DOMAIN /etc/nginx/sites-enabled/YOUR_DOMAIN

# Test Nginx
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

## Important Security Notes

1. Never expose your Cloudflare Origin Private Key.
2. Never commit SSL private keys to GitHub.
3. Keep Cloudflare SSL mode set to Full (strict).
4. Restrict SSH access to trusted IP addresses.
5. Keep your Ubuntu server and Nginx updated.
6. Monitor Origin Certificate expiration.
7. Keep application ports private whenever possible. Only expose ports 80 and 443 publicly for normal web traffic.
8. Use Cloudflare Proxy (Orange Cloud) to protect your origin IP from ordinary direct DNS exposure.

## Official Documentation

- [Cloudflare Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
- [Cloudflare Full (Strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
- [Cloudflare DNS](https://developers.cloudflare.com/dns/)
- [Nginx HTTPS Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Ubuntu Server Documentation](https://documentation.ubuntu.com/server/)

---

**Setup Complete!**

Your custom domain is now connected to your Ubuntu server through Cloudflare DNS, Nginx Reverse Proxy, and HTTPS using Cloudflare Origin SSL Certificate.
