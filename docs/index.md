---
title: Pixel Server
description: Replacing the cloud, one old phone at a time
og_url: https://pixel-server.itsmichael.info
og_image: https://pixel-server.itsmichael.info/public/pixel-server.png
---

# Pixel Server

<div style="font-size:3rem; font-weight:bold; display: flex;align-items:center; gap:2rem; letter-spacing: 0.2rem;">
<img style="height:25vh" alt="The machine serving you right now!" src="public/the-server.jpg" /> < hi
</div>

The touchscreen died on my old Pixel smartphone. Instead of binning it, I decided to repurpose it as a low-power webserver for my projects.

Here's how:

### Step 1: Set up the linux environment

1. Install Termux from [F-Droid](https://f-droid.org/en/packages/com.termux/)
2. Install Termux:Boot from [F-Droid](https://f-droid.org/en/packages/com.termux.boot/)
3. Install Termux:API from [F-Droid](https://f-droid.org/en/packages/com.termux.api/)
4. In Termux, install proot-distro: `pkg install proot-distro`
5. Install ubuntu into the proot-distro environment: `proot-distro install ubuntu`

### Step 2: Configure SSH for remote access

This is technically optional, but managing the server remotely through SSH is a much better experience than working on a tiny cellphone.

Complete these steps inside proot Ubuntu (`proot-distro login ubuntu` from Termux on the phone):

1. Install dropbear (an ssh client that works in this limited environment): `apt update && apt upgrade && apt install dropbear`
2. Generate SSH keys: `ssh-keygen -A`
3. Create a root password: `passwd`

Complete these steps in Termux (without logging in to proot ubuntu):

1. Create Termux boot script at `~/.termux/boot/start.sh` with the following content
   ```
   #!/data/data/com.termux/files/usr/bin/bash
   termux-wake-lock
   proot-distro login ubuntu -- dropbear -F -E -p 8022
   ```
2. Make it executable: `chmod +x ~/.termux/boot/start.sh`

Now, when the phone boots up, it will start Termux automatically, acquire a wake lock, launch proot ubuntu, and start a dropbear SSH server on port 8022.

You can now manage the server from any local machine via ssh: `ssh root@<phone-ip> -p 8022` using the password you set earlier.

### Step 3: Hardening SSH

Also optional, but recommended. Though we cannot disable root login entirely (limitations of proot), we will not be exposing this server directly to the internet. We can, at least, prevent password logins.

Complete these steps on the client machine that you will be connecting from:
1. If you don't already have an ssh keypair, create one: `ssh-keygen -t ed25519`
2. Copy the keypair to the server: `ssh-copy-id root@<phone-ip> -p 8022`
3. Test with `ssh root@<phone-ip> -p 8022`. You should be logged in without a password prompt

Once that works, complete these steps in Termux (not proot ubuntu) on the server:
1. Edit `~/.termux/boot/start.sh`
2. Change `proot-distro login ubuntu -- dropbear -F -E -p 8022` to `proot-distro login ubuntu -- dropbear -F -E -s -p 8022`

### Step 4: Run a simple expressjs server

SSH into your server, and complete these steps:
1. Install git: `apt install git`
2. Install node via nvm:
   1. `apt install curl -y`
   2. `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`
   3. `source ~/.bashrc`
   4. `nvm install node`
3. Clone my repo as a starting point: `git clone https://github.com/Continuities/pixel-server.git`
4. `cd pixel-server`
5. `npm i`
6. `npm run start`
7. Test your server from your local network by visiting `http://<phone-ip>:3000` on another device

### Step 5: Make it public with a cloudflare tunnel

Cloudflare tunnels allow us to publish content from our server without exposing the server to the internet, or worrying about dynamic ip addresses (which are common for residential internet services).

1. Register a domain, using any registrar you like. This is beyond the scope of this tutorial.
2. Create a [Cloudflare](https://www.cloudflare.com/) account
3. Register your domain with Cloudflare. This is also beyond the scope of this tutorial.

Once you have a domain set up with Cloudflare, we can create the tunnel. SSH to your server, and complete these steps:
1. Install `cloudflared`
   ```
   # Add cloudflare gpg key
   mkdir -p --mode=0755 /usr/share/keyrings
   curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

   # Add this repo to your apt repositories
   # Stable
   echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | tee /etc/apt/sources.list.d/cloudflared.list
   # Nightly
   echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://next.pkg.cloudflare.com/cloudflared any main' | tee /etc/apt/sources.list.d/cloudflared.list

   # install cloudflared
   apt update && apt install cloudflared
   ```
2. Authenticate cloudflared: `cloudflared tunnel login`
3. Create a tunnel: `cloudflared tunnel create <NAME>`. This will report a Tunnel UUID, which you should note down.
4. Create a config file at `/root/.cloudflared/<Tunnel-UUID>.json` with the following content:
   ```
   url: http://localhost:3000
   tunnel: <Tunnel-UUID>
   credentials-file: /root/.cloudflared/<Tunnel-UUID>.json
   ```
5. Configure tunnel DNS routing: `cloudflared tunnel route dns <UUID or NAME> <hostname>`
6. Start the tunnel: `cloudflared tunnel run <UUID or NAME>`

With the both the tunnel and the app from Step 4 running, you should be able to test your page at `https://<hostname>`!

Note: proot does not support background services, so you will need to find another way to run the tunnel and your applications in the background. I use `screen`, which is beyond the scope of this tutorial.