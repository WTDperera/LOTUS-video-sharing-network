# ⚡ Jenkins Quick Start

## Start Jenkins (One Command)

```bash
cd jenkins-setup
docker-compose up -d
```

## Access Jenkins

1. **Open Browser**: http://localhost:8080
2. **Get Password**:
   ```bash
   docker exec lotus-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. **Unlock Jenkins**: Paste the password
4. **Install Plugins**: Click "Install suggested plugins"
5. **Create Admin**: Set username/password
6. **Start Using Jenkins**: You're ready! 🎉

## Verify Docker Access

```bash
docker exec lotus-jenkins docker --version
docker exec lotus-jenkins docker ps
```

If both commands work → Docker-in-Docker is working! ✅

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop Jenkins
docker-compose down

# Restart Jenkins
docker-compose restart

# Access shell
docker exec -it lotus-jenkins bash
```

## Next Steps

1. Create a new Pipeline job
2. Point it to your Git repository
3. Add a Jenkinsfile to your project
4. Build your first Docker image! 🚀

---

**Need help?** See [README.md](./README.md) for detailed documentation.
