# 🔧 Jenkins CI/CD Server Setup

## Quick Start

Navigate to the jenkins-setup directory and start Jenkins:

```bash
cd jenkins-setup
docker-compose up -d
```

---

## 📋 Access Jenkins

### Web Interface
- **URL**: http://localhost:8080
- **Wait Time**: 1-2 minutes for initial startup

### Initial Admin Password

Retrieve the auto-generated admin password:

```bash
docker exec lotus-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Or view logs to find the password:

```bash
docker-compose logs -f jenkins
```

Look for output like:
```
*************************************************************
Jenkins initial setup is required. An admin user has been created and a password generated.
Please use the following password to proceed to installation:

a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

This may also be found at: /var/jenkins_home/secrets/initialAdminPassword
*************************************************************
```

---

## 🚀 Initial Setup Steps

### 1. Start Jenkins
```bash
cd jenkins-setup
docker-compose up -d
```

### 2. Access Web UI
Open http://localhost:8080 in your browser

### 3. Unlock Jenkins
- Copy the initial admin password (from command above)
- Paste it in the "Unlock Jenkins" screen

### 4. Install Plugins
Choose **"Install suggested plugins"** - this includes:
- Git plugin
- Pipeline plugin
- Docker plugin
- Credentials plugin
- GitHub integration

### 5. Create Admin User
- Username: `admin` (recommended)
- Password: Choose a strong password
- Full Name: Your name
- Email: Your email

### 6. Configure Jenkins URL
- Keep default: http://localhost:8080
- Click "Save and Finish"

---

## 🐳 Docker-in-Docker Configuration

This setup enables Jenkins to build Docker images using the host's Docker daemon.

### Verification

Test Docker access from Jenkins container:

```bash
# Access Jenkins container
docker exec -it lotus-jenkins bash

# Inside container - verify Docker is accessible
docker --version
docker ps
docker images

# Exit container
exit
```

If Docker commands work, Docker-in-Docker is properly configured! ✅

---

## 🔌 Installed Plugins (Recommended)

After initial setup, install these additional plugins:

### Via Jenkins UI: Manage Jenkins → Manage Plugins

**Essential Plugins:**
- Docker Pipeline
- Docker Commons
- NodeJS Plugin
- Git Parameter
- Blue Ocean (modern UI)
- Config File Provider
- Pipeline Utility Steps

### Installation Command (from Jenkins Script Console)

Navigate to: **Manage Jenkins → Script Console**

```groovy
def plugins = [
    'docker-workflow',
    'docker-commons',
    'nodejs',
    'git-parameter',
    'blueocean',
    'config-file-provider',
    'pipeline-utility-steps'
]

plugins.each { plugin ->
    Jenkins.instance.updateCenter.getPlugin(plugin).deploy()
}
```

Click **Run**, then restart Jenkins.

---

## 📦 Configuration

### Global Tool Configuration

**Manage Jenkins → Global Tool Configuration**

1. **Git**
   - Name: Default
   - Path: `git` (auto-detected)

2. **Docker**
   - Add Docker installation
   - Name: `docker`
   - Install automatically: ✅
   - Version: `latest`

3. **Node.js** (if using NodeJS plugin)
   - Add NodeJS installation
   - Name: `node-20`
   - Version: `20.x`

---

## 🔐 Docker Socket Permissions (Linux/Mac)

On Linux/Mac, you may need to adjust permissions:

```bash
# Option 1: Add jenkins user to docker group (recommended)
docker exec -u root lotus-jenkins usermod -aG docker jenkins

# Option 2: Change socket permissions (not recommended for production)
sudo chmod 666 /var/run/docker.sock

# Restart Jenkins
docker-compose restart jenkins
```

**On Windows**: Docker Desktop handles permissions automatically. ✅

---

## 🛠️ Common Commands

### Start Jenkins
```bash
docker-compose up -d
```

### Stop Jenkins
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f jenkins
```

### Restart Jenkins
```bash
docker-compose restart jenkins
```

### Access Jenkins Shell
```bash
docker exec -it lotus-jenkins bash
```

### Backup Jenkins Data
```bash
# Create backup of jenkins_home volume
docker run --rm -v jenkins-setup_jenkins_home:/data -v $(pwd):/backup alpine tar czf /backup/jenkins-backup.tar.gz -C /data .
```

### Restore Jenkins Data
```bash
# Restore from backup
docker run --rm -v jenkins-setup_jenkins_home:/data -v $(pwd):/backup alpine tar xzf /backup/jenkins-backup.tar.gz -C /data
```

---

## 🔍 Troubleshooting

### Issue: Cannot Connect to Docker Daemon

**Symptom**: Jenkins job fails with "Cannot connect to the Docker daemon"

**Solution**:
```bash
# Check Docker socket is mounted
docker exec lotus-jenkins ls -l /var/run/docker.sock

# Should show: srw-rw---- ... docker.sock

# Test Docker access
docker exec lotus-jenkins docker ps
```

### Issue: Permission Denied (Docker Socket)

**Symptom**: `Got permission denied while trying to connect to the Docker daemon socket`

**Solution** (Linux/Mac):
```bash
# Add jenkins user to docker group
docker exec -u root lotus-jenkins usermod -aG docker jenkins
docker-compose restart jenkins
```

**Solution** (Windows):
- Usually works by default with Docker Desktop
- Ensure Docker Desktop is running with WSL2 backend

### Issue: Port 8080 Already in Use

**Symptom**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution**:
```bash
# Check what's using port 8080
netstat -ano | findstr :8080

# Stop the process or change port in docker-compose.yml:
ports:
  - "8081:8080"  # Change external port to 8081
```

### Issue: Jenkins is Slow

**Solution**: Increase Java heap size in docker-compose.yml:
```yaml
environment:
  - JAVA_OPTS=-Xmx2048m -Xms512m -Djava.awt.headless=true
```

---

## 🎯 Next Steps - Create Your First Pipeline

### 1. Create New Pipeline Job

1. Click **"New Item"**
2. Enter name: `lotus-video-build`
3. Select **"Pipeline"**
4. Click **OK**

### 2. Configure Pipeline

**Pipeline Script from SCM:**
- SCM: Git
- Repository URL: `https://github.com/WTDperera/LOTUS-video-sharing-network.git`
- Branch: `*/main`
- Script Path: `Jenkinsfile`

### 3. Sample Jenkinsfile

Create `Jenkinsfile` in your project root:

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_HUB = credentials('dockerhub-credentials')
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/WTDperera/LOTUS-video-sharing-network.git'
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker-compose build'
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    sh 'docker-compose run server npm test'
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    sh 'docker tag lotus-server:latest ${DOCKER_HUB_USR}/lotus-server:latest'
                    sh 'echo ${DOCKER_HUB_PSW} | docker login -u ${DOCKER_HUB_USR} --password-stdin'
                    sh 'docker push ${DOCKER_HUB_USR}/lotus-server:latest'
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker-compose down'
        }
    }
}
```

---

## 📊 Jenkins Architecture

```
┌─────────────────────────────────────────────────┐
│              Docker Host                        │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │      Jenkins Container (lotus-jenkins)   │  │
│  │                                          │  │
│  │  ┌────────────────────────────────┐    │  │
│  │  │   Jenkins Web UI (8080)        │    │  │
│  │  │   - Create Jobs                │    │  │
│  │  │   - Configure Pipelines        │    │  │
│  │  │   - Monitor Builds             │    │  │
│  │  └────────────────────────────────┘    │  │
│  │                ↓                        │  │
│  │  ┌────────────────────────────────┐    │  │
│  │  │   Jenkins Pipeline Engine      │    │  │
│  │  │   - Execute Jenkinsfile        │    │  │
│  │  │   - Build Docker Images        │    │  │
│  │  │   - Run Tests                  │    │  │
│  │  └────────────────────────────────┘    │  │
│  │                ↓                        │  │
│  │         Docker Socket Mount            │  │
│  │   /var/run/docker.sock ←─────────┐    │  │
│  └──────────────────────────────────│────┘  │
│                                     │        │
│  ┌──────────────────────────────────↓─────┐ │
│  │      Host Docker Daemon               │ │
│  │  - Build Images                       │ │
│  │  - Run Containers                     │ │
│  │  - Push to Registry                   │ │
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔐 Security Notes

**⚠️ Important**: This setup uses `root` user and privileged mode for learning/development.

**For Production:**
1. Remove `user: root`
2. Remove `privileged: true`
3. Use proper user permissions
4. Configure Jenkins security realm
5. Use secrets management (HashiCorp Vault, AWS Secrets Manager)
6. Enable HTTPS with SSL certificates
7. Restrict Docker socket access

---

## 📚 Additional Resources

- [Jenkins Official Documentation](https://www.jenkins.io/doc/)
- [Docker Pipeline Plugin](https://plugins.jenkins.io/docker-workflow/)
- [Jenkins Blue Ocean](https://www.jenkins.io/doc/book/blueocean/)
- [Pipeline Syntax Reference](https://www.jenkins.io/doc/book/pipeline/syntax/)

---

## ✅ Verification Checklist

- [ ] Jenkins accessible at http://localhost:8080
- [ ] Initial admin password retrieved
- [ ] Admin user created
- [ ] Suggested plugins installed
- [ ] Docker commands work inside Jenkins container
- [ ] Can build Docker images from Jenkins job
- [ ] Jenkins data persists across restarts

---

**Jenkins is ready for CI/CD! 🚀**
