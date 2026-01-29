# 🌐 Ngrok Setup for Jenkins GitHub Integration

## What is Ngrok?
Ngrok creates a secure tunnel from the internet to your local Jenkins server, allowing GitHub to send webhook notifications when you push code.

---

## 📥 Installation Steps (Windows)

### Option 1: Direct Download (Recommended)

1. **Download Ngrok**
   - Visit: https://ngrok.com/download
   - Click **"Download for Windows"**
   - Save the ZIP file (e.g., `ngrok-v3-stable-windows-amd64.zip`)

2. **Extract the ZIP**
   - Right-click the downloaded ZIP file
   - Select **"Extract All..."**
   - Extract to: `C:\ngrok\`
   - You should have: `C:\ngrok\ngrok.exe`

3. **Add to System PATH**
   
   **PowerShell (Run as Administrator):**
   ```powershell
   $ngrokPath = "C:\ngrok"
   $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
   if ($currentPath -notlike "*$ngrokPath*") {
       [Environment]::SetEnvironmentVariable("Path", "$currentPath;$ngrokPath", "Machine")
   }
   ```

4. **Verify Installation**
   
   Close and reopen PowerShell, then run:
   ```powershell
   ngrok version
   ```

### Option 2: Using Chocolatey

If you have Chocolatey installed:
```powershell
choco install ngrok
```

---

## 🔑 Configure Authtoken

Once ngrok is installed, configure your authtoken:

```powershell
ngrok config add-authtoken KIY4V3RMYP55HFAMXKK2JWJYPP2HJLXM
```

**Expected Output:**
```
Authtoken saved to configuration file: C:\Users\YourName\.ngrok2\ngrok.yml
```

---

## 🚀 Expose Jenkins to Internet

### Start Jenkins (if not running)
```powershell
cd jenkins-setup
docker-compose up -d
```

### Start Ngrok Tunnel
```powershell
ngrok http 8080
```

**You'll see output like:**
```
ngrok                                                                   (Ctrl+C to quit)

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abcd-1234-5678-9012.ngrok-free.app -> http://localhost:8080

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL**: `https://abcd-1234-5678-9012.ngrok-free.app`

---

## 🔗 Configure GitHub Webhook

### 1. Go to GitHub Repository
Navigate to: https://github.com/WTDperera/LOTUS-video-sharing-network

### 2. Open Settings
- Click **"Settings"** tab
- Click **"Webhooks"** in left sidebar
- Click **"Add webhook"**

### 3. Configure Webhook

**Payload URL:**
```
https://your-ngrok-url.ngrok-free.app/github-webhook/
```
*Replace with your actual ngrok URL*

**Content type:**
```
application/json
```

**Secret:** (Optional, leave blank for now)

**Which events would you like to trigger this webhook?**
- Select: **"Just the push event"**

**Active:**
- ✅ Check this box

Click **"Add webhook"**

### 4. Verify Webhook
- GitHub will send a test ping
- Check for green checkmark ✅ next to webhook
- View **"Recent Deliveries"** to see the ping

---

## 🔧 Configure Jenkins for GitHub

### 1. Install GitHub Plugin (if not installed)

**Jenkins Dashboard → Manage Jenkins → Manage Plugins**
- Go to **"Available"** tab
- Search: `GitHub Integration Plugin`
- Install and restart Jenkins

### 2. Configure GitHub Server

**Manage Jenkins → Configure System → GitHub**

- Click **"Add GitHub Server"**
- Name: `GitHub`
- API URL: `https://api.github.com` (default)
- Credentials: Add GitHub Personal Access Token
  
  **To create token:**
  1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token (classic)
  3. Scopes: Select `repo` and `admin:repo_hook`
  4. Copy token and add to Jenkins credentials

### 3. Configure Pipeline Job

**Your Pipeline Job → Configure**

**Build Triggers:**
- ✅ Check **"GitHub hook trigger for GITScm polling"**

**Pipeline:**
- Definition: **Pipeline script from SCM**
- SCM: **Git**
- Repository URL: `https://github.com/WTDperera/LOTUS-video-sharing-network.git`
- Branch: `*/main`
- Script Path: `Jenkinsfile`

Click **"Save"**

---

## ✅ Testing the Integration

### 1. Keep Ngrok Running
Leave the ngrok terminal window open

### 2. Make a Code Change
```powershell
# In your project directory
echo "# Test webhook" >> README.md
git add README.md
git commit -m "test: Trigger Jenkins webhook"
git push origin main
```

### 3. Watch Jenkins
- GitHub sends webhook to ngrok URL
- Ngrok forwards to Jenkins
- Jenkins automatically starts build
- Check Jenkins dashboard for new build

---

## 📊 Monitoring

### Ngrok Web Interface
- Access: http://localhost:4040
- View all HTTP requests
- Inspect webhook payloads
- Debug connection issues

### Jenkins Console Output
- Click on build number
- Click **"Console Output"**
- See real-time build logs

---

## 🛑 Stopping Ngrok

Press `Ctrl+C` in the ngrok terminal window

---

## 💡 Pro Tips

### 1. Persistent Ngrok URL (Free Tier)
Free ngrok URLs change every time you restart. For persistent URL:
- Upgrade to paid plan
- Or use ngrok reserved domain feature

### 2. Keep Ngrok Running
Run ngrok in background:
```powershell
Start-Process ngrok -ArgumentList "http 8080" -WindowStyle Hidden
```

### 3. Alternative to Ngrok
- **localtunnel**: `npm install -g localtunnel && lt --port 8080`
- **serveo**: `ssh -R 80:localhost:8080 serveo.net`
- **VS Code Port Forwarding**: If using VS Code Remote

---

## 🔐 Security Notes

**⚠️ Important:**
- Ngrok exposes your local Jenkins to the internet
- Anyone with the URL can access Jenkins
- For production:
  - Enable Jenkins authentication
  - Use HTTPS only
  - Configure firewall rules
  - Use GitHub webhook secrets
  - Consider VPN instead of ngrok

---

## 📚 Quick Reference

```powershell
# Install (after downloading)
# Extract to C:\ngrok\
# Add to PATH

# Configure authtoken
ngrok config add-authtoken YOUR_TOKEN

# Start tunnel
ngrok http 8080

# View web interface
# Open: http://localhost:4040

# Stop tunnel
# Press Ctrl+C
```

---

## 🆘 Troubleshooting

### Issue: "ngrok not recognized"
**Solution:** Restart PowerShell after adding to PATH, or use full path:
```powershell
C:\ngrok\ngrok.exe http 8080
```

### Issue: "authentication failed"
**Solution:** Add authtoken:
```powershell
ngrok config add-authtoken KIY4V3RMYP55HFAMXKK2JWJYPP2HJLXM
```

### Issue: Webhook delivery fails
**Solution:**
- Ensure ngrok is running
- Check ngrok web interface (localhost:4040)
- Verify Jenkins is accessible via ngrok URL
- Check Jenkins logs

---

**Ready to connect Jenkins to GitHub! 🚀**
