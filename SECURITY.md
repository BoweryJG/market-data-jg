# 🔒 Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please **DO NOT** create a public GitHub issue. 

Instead, please report it via email to: security@repspheres.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your suggested fix (if any)

We will acknowledge receipt within 48 hours and provide updates on our progress.

## Security Best Practices

### 1. Secret Management

#### Never Commit Secrets
- All API keys, tokens, and credentials must be in environment variables
- Use `.env.example` as a template (contains no real values)
- The `.gitignore` file prevents `.env` files from being committed

#### Secret Rotation Schedule
- **API Keys**: Rotate every 90 days
- **Database credentials**: Rotate every 60 days
- **OAuth secrets**: Rotate every 180 days
- **JWT secrets**: Rotate every 30 days

#### Secret Storage
- **Development**: Use `.env.local` (never commit)
- **Production**: Use platform environment variables (Netlify, Render)
- **CI/CD**: Use GitHub Secrets

### 2. Authentication & Authorization

#### JWT Token Security
- Tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Tokens include user ID and role claims
- All tokens are validated on every request

#### Session Management
- Sessions timeout after 30 minutes of inactivity
- Concurrent session limit: 5 devices per user
- Session invalidation on password change

### 3. Input Validation

#### Client-Side Validation
```javascript
// All user inputs are sanitized
import { sanitizeInput } from '@/middleware/security';

const cleanInput = sanitizeInput(userInput);
```

#### Server-Side Validation
- All API endpoints validate input
- SQL injection prevention via parameterized queries
- XSS prevention via input sanitization

### 4. API Security

#### Rate Limiting
- **General endpoints**: 100 requests/minute
- **Auth endpoints**: 5 requests/15 minutes
- **Search endpoints**: 30 requests/minute
- **AI endpoints**: 10 requests/minute

#### CORS Policy
Allowed origins:
- https://market-data-jg.netlify.app
- https://marketdata.repspheres.com
- https://crm.repspheres.com
- https://canvas.repspheres.com

### 5. Data Protection

#### Encryption
- **In Transit**: All data transmitted over HTTPS (TLS 1.3)
- **At Rest**: Database encrypted with AES-256
- **Backups**: Encrypted and stored in separate region

#### PII Handling
- Minimal PII collection
- PII encrypted in database
- PII excluded from logs
- Right to deletion (GDPR compliance)

### 6. Security Headers

All responses include:
```
Content-Security-Policy: [strict policy]
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 7. Dependency Security

#### Automated Scanning
- GitHub Dependabot enabled
- npm audit on every build
- Snyk integration for vulnerability scanning

#### Update Policy
- **Critical vulnerabilities**: Patch within 24 hours
- **High vulnerabilities**: Patch within 7 days
- **Medium/Low**: Patch within 30 days

### 8. Logging & Monitoring

#### What We Log
- Authentication attempts
- API access patterns
- Error events
- Performance metrics

#### What We DON'T Log
- Passwords or tokens
- Full credit card numbers
- Personal health information
- Detailed user data

### 9. Incident Response

#### Response Team
1. **Security Lead**: First responder
2. **Engineering Lead**: Technical response
3. **Product Manager**: User communication
4. **CEO**: Executive decisions

#### Response Timeline
- **T+0**: Incident detected
- **T+15min**: Initial assessment
- **T+1hr**: Containment measures
- **T+4hr**: User notification (if required)
- **T+24hr**: Full remediation
- **T+48hr**: Post-mortem report

### 10. Compliance

#### Standards We Follow
- **OWASP Top 10**: Security best practices
- **GDPR**: EU data protection
- **CCPA**: California privacy rights
- **HIPAA**: Healthcare data protection (where applicable)

#### Regular Audits
- **Quarterly**: Internal security review
- **Annually**: Third-party penetration testing
- **Ongoing**: Automated vulnerability scanning

## Security Checklist for Developers

Before each deployment:

- [ ] No secrets in code
- [ ] All inputs validated
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] Dependencies updated
- [ ] Tests passing
- [ ] Logs reviewed for sensitive data
- [ ] Error messages don't leak information

## Security Tools

### Recommended Browser Extensions
- **Development**: React DevTools (disable in production)
- **Testing**: OWASP ZAP
- **Monitoring**: Wappalyzer

### Command Line Tools
```bash
# Check for secrets in code
git secrets --scan

# Audit dependencies
npm audit

# Check security headers
curl -I https://your-site.com

# Test rate limiting
for i in {1..100}; do curl https://api.com/endpoint; done
```

## Contact Information

- **Security Team**: security@repspheres.com
- **Emergency Hotline**: [Phone number for critical issues]
- **Bug Bounty Program**: bounty@repspheres.com

---

Last Updated: 2025-01-23
Version: 1.0