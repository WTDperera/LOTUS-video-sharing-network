# 🔒 Security Quick Reference Guide
## Lotus Video Streaming Platform

---

## 🚨 Critical Security Commands

### Generate Secure JWT Secret
```bash
# Generate 32-byte (64 hex characters) secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# 7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b
```

### Run Security Tests
```bash
# Start server first
node index.js

# In another terminal, run security tests
node scripts/security-test.js
```

### Check for Vulnerable Dependencies
```bash
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may cause breaking changes)
npm audit fix --force
```

---

## 🛡️ Security Checklist (Copy & Use)

### Pre-Deployment Security Checklist:
```
[ ] JWT_SECRET is 32+ characters (generate with crypto.randomBytes)
[ ] MONGODB_URI uses strong credentials
[ ] NODE_ENV=production in production
[ ] FORCE_HTTPS=true in production
[ ] ALLOWED_ORIGINS configured (no wildcard *)
[ ] All dependencies updated (npm audit)
[ ] Security tests pass (node scripts/security-test.js)
[ ] .env file NOT committed to git
[ ] SSL/TLS certificates configured
[ ] Firewall rules configured
[ ] Rate limiting tested
[ ] Error messages generic (no stack traces in production)
[ ] Logs don't contain sensitive data
[ ] MongoDB authentication enabled
[ ] File upload limits tested (50MB)
[ ] CORS policy validated
[ ] Security headers verified (securityheaders.com)
```

---

## 🔐 Environment Variables Template

### Development (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lotus_video
JWT_SECRET=dev-secret-min-32-chars-0123456789abcdef0123456789abcdef
JWT_EXPIRE=7d
FORCE_HTTPS=false
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_MAX=100
```

### Production (.env)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://prod-user:STRONG-PASSWORD-HERE@cluster.mongodb.net/lotus_video
JWT_SECRET=<GENERATED-SECRET-FROM-CRYPTO-RANDOMBYTES-64-CHARS>
JWT_EXPIRE=7d
FORCE_HTTPS=true
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_MAX=100
```

---

## 🧪 Quick Security Tests

### 1. NoSQL Injection Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$gt":""},"password":{"$gt":""}}'

# Expected: 401 Unauthorized
# ✅ Pass: Attack blocked
# ❌ Fail: Returns user data
```

### 2. XSS Test
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","email":"test@test.com","password":"Test123"}'

# Expected: Script tags escaped (&lt;script&gt;)
# ✅ Pass: XSS payload sanitized
# ❌ Fail: Script tags in response
```

### 3. Path Traversal Test
```bash
curl http://localhost:5000/uploads/../.env

# Expected: 404 Not Found
# ✅ Pass: Path traversal blocked
# ❌ Fail: .env file content returned
```

### 4. Rate Limiting Test
```bash
# Bash
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# PowerShell
1..6 | ForEach-Object {
  curl -X POST http://localhost:5000/api/auth/login `
    -d '{"email":"test@test.com","password":"wrong"}'
}

# Expected: 429 Too Many Requests after 5 attempts
# ✅ Pass: Rate limit enforced
# ❌ Fail: All 6 requests succeed
```

### 5. Invalid ObjectId Test
```bash
curl http://localhost:5000/api/videos/invalid-id

# Expected: 400 Bad Request "Invalid video ID format"
# ✅ Pass: Invalid ID rejected
# ❌ Fail: Server crash or 500 error
```

---

## 📋 Security Feature Matrix

| Feature | File | Status |
|---------|------|--------|
| **Input Validation** |
| NoSQL Injection Prevention | `middleware/validation.js` | ✅ |
| XSS Prevention | `middleware/validation.js` | ✅ |
| Command Injection Prevention | `middleware/validation.js` | ✅ |
| Path Traversal Prevention | `middleware/validation.js` | ✅ |
| Prototype Pollution Prevention | `middleware/validation.js` | ✅ |
| ObjectId Validation | `middleware/validation.js` | ✅ |
| **Authentication** |
| JWT Token Validation | `middleware/auth.js` | ✅ |
| Token Format Check | `middleware/auth.js` | ✅ |
| Algorithm Restriction (HS256) | `middleware/auth.js` | ✅ |
| User Existence Verification | `middleware/auth.js` | ✅ |
| Constant-Time Comparison | `config/security.js` | ✅ |
| **Rate Limiting** |
| General API (100/15min) | `middleware/security.js` | ✅ |
| Auth Endpoints (5/15min) | `middleware/security.js` | ✅ |
| Upload Endpoints (10/hour) | `middleware/security.js` | ✅ |
| **Security Headers** |
| Helmet Integration | `config/middleware.js` | ✅ |
| CORS Validation | `config/middleware.js` | ✅ |
| HTTPS Enforcement | `middleware/security.js` | ✅ |
| X-Powered-By Removed | `middleware/security.js` | ✅ |
| **File Upload** |
| MIME Type Validation | `middleware/upload.js` | ✅ |
| Extension Validation | `middleware/upload.js` | ✅ |
| Filename Sanitization | `middleware/upload.js` | ✅ |
| File Size Limit (50MB) | `middleware/upload.js` | ✅ |
| **Error Handling** |
| Stack Trace Hiding | `utils/logger.js` | ✅ |
| Generic Error Messages | All controllers | ✅ |
| Sensitive Data Redaction | `config/security.js` | ✅ |

---

## 🚀 Deployment Commands

### Development
```bash
# Install dependencies
npm install

# Start server
npm start

# Start with auto-reload
npm run dev

# Run security tests
node scripts/security-test.js
```

### Production
```bash
# Install production dependencies only
npm install --production

# Set environment
export NODE_ENV=production
export FORCE_HTTPS=true

# Start server with PM2 (recommended)
pm2 start index.js --name lotus-video

# Or use Node directly
node index.js
```

---

## 🔍 Security Monitoring

### Log Analysis
```bash
# Monitor logs in real-time
tail -f logs/app.log | grep "⚠️"

# Check for failed authentication
grep "JWT verification failed" logs/app.log

# Check for suspicious requests
grep "Suspicious request" logs/app.log
```

### Health Checks
```bash
# Check server status
curl http://localhost:5000/api/videos

# Check MongoDB connection
curl http://localhost:5000/health

# Check security headers
curl -I http://localhost:5000/api/videos
```

---

## 📞 Security Incident Response

### If Security Breach Suspected:

1. **Immediate Actions:**
   ```bash
   # Stop server
   pm2 stop lotus-video
   
   # Rotate JWT secret immediately
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Update .env with new secret
   
   # Restart server (invalidates all existing tokens)
   pm2 restart lotus-video
   ```

2. **Investigation:**
   - Review logs for suspicious activity
   - Check MongoDB for unauthorized data access
   - Verify file uploads for malicious content
   - Review rate limiting logs

3. **Remediation:**
   - Patch identified vulnerabilities
   - Run security tests
   - Update dependencies
   - Reset affected user passwords
   - Notify affected users

4. **Prevention:**
   - Enable additional monitoring
   - Review and tighten security policies
   - Conduct security training
   - Schedule regular security audits

---

## 📚 Additional Resources

### Documentation
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) - Detailed vulnerability report
- [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md) - Complete implementation guide
- [.env.example](./.env.example) - Environment configuration template

### Security Tools
- **OWASP ZAP** - Web application security scanner
- **npm audit** - Dependency vulnerability scanner
- **Snyk** - Continuous security monitoring
- **Security Headers** - https://securityheaders.com

### Best Practices
- **OWASP Top 10** - https://owasp.org/www-project-top-ten/
- **Node.js Security** - https://nodejs.org/en/docs/guides/security/
- **Express Security** - https://expressjs.com/en/advanced/best-practice-security.html

---

## 🎯 Quick Tips

✅ **DO:**
- Generate secrets with crypto.randomBytes()
- Use environment variables for all secrets
- Rotate secrets every 90 days
- Run security tests before deployment
- Update dependencies regularly
- Use HTTPS in production
- Implement rate limiting
- Validate all user inputs
- Log security events

❌ **DON'T:**
- Commit .env files to git
- Use weak or short secrets
- Expose stack traces in production
- Trust user input without validation
- Use wildcard (*) in CORS
- Ignore npm audit warnings
- Store passwords in plain text
- Log sensitive data (passwords, tokens)
- Disable security features for convenience

---

**Last Updated:** January 29, 2026  
**Security Level:** Production Ready ✅
