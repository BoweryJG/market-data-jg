# Git History .env File Cleanup

## ⚠️ URGENT SECURITY TASK

This directory contains scripts to remove ALL .env files from Git history to prevent exposure of sensitive credentials.

## 🚨 Why This Is Critical

- .env files containing API keys, passwords, and other secrets have been committed to Git history
- Even if deleted in recent commits, they remain accessible in Git history
- Anyone with repository access can view these historical files
- Exposed credentials can lead to security breaches and unauthorized access

## 📁 Scripts Included

1. **`REMOVE_ENV_FILES_MASTER.sh`** - Master script that coordinates the entire process
2. **`check-env-in-history.sh`** - Checks for .env files in Git history
3. **`update-gitignore.sh`** - Updates .gitignore to properly exclude .env files
4. **`remove-env-from-history.sh`** - Removes .env files from Git history using BFG
5. **`verify-cleanup.sh`** - Verifies the cleanup was successful

## 🔧 Prerequisites

- Java (for BFG Repo-Cleaner)
  ```bash
  # Install on macOS:
  brew install openjdk
  ```
- Git
- Bash

## 📋 Quick Start

Run the master script which will guide you through the entire process:

```bash
./REMOVE_ENV_FILES_MASTER.sh
```

## 🔍 Manual Process

If you prefer to run steps individually:

1. **Check current status:**
   ```bash
   ./check-env-in-history.sh
   ```

2. **Update .gitignore:**
   ```bash
   ./update-gitignore.sh
   git add .gitignore
   git commit -m "Update .gitignore to exclude all .env files"
   ```

3. **Remove from history:**
   ```bash
   ./remove-env-from-history.sh
   ```

4. **Verify cleanup:**
   ```bash
   ./verify-cleanup.sh
   ```

## ⚡ Force Push Commands

After cleanup, you MUST force push to update the remote:

```bash
git push --force --all
git push --force --tags
```

## 👥 Team Communication

After force pushing, ALL team members must:

1. **Delete their local repository**
2. **Re-clone from remote**, OR
3. **Force update their local copy:**
   ```bash
   git fetch --all
   git reset --hard origin/main
   ```

## 🔐 Post-Cleanup Security

1. **Rotate ALL credentials** that were in .env files
2. **Update deployment systems** with new credentials
3. **Audit access logs** for any unauthorized use
4. **Enable 2FA** on all affected services
5. **Review and update** security policies

## 📝 Files That Will Be Removed

The cleanup process removes ALL files matching these patterns from history:
- `.env`
- `.env.local`
- `.env.production`
- `.env.development`
- `.env.test`
- `.env.staging`
- `.env.sphere1a`
- `.env.template`
- Any file matching `.env*`

## ⚠️ Important Notes

- **This process rewrites Git history** - it's irreversible
- **Always create a backup** before running (the script does this automatically)
- **Coordinate with your team** before force pushing
- **CI/CD systems** may need to be updated
- **Credentials must be rotated** - assume all historical credentials are compromised

## 🆘 Troubleshooting

- **Java not found**: Install Java with `brew install openjdk`
- **Permission denied**: Run `chmod +x *.sh` to make scripts executable
- **BFG download fails**: Download manually from https://rtyley.github.io/bfg-repo-cleaner/
- **Force push rejected**: Check branch protection rules in your repository settings

## 📊 Verification

After cleanup, verify success:
```bash
# Should return nothing:
git log --all --full-history --name-only --format=format: | grep -E "^\.env"
```

## 🔄 Going Forward

1. **Never commit .env files** - always use .env.example
2. **Use secret management tools** (AWS Secrets Manager, HashiCorp Vault, etc.)
3. **Enable pre-commit hooks** to prevent .env commits
4. **Regular security audits** of your Git history
5. **Use environment variables** in production deployments

---

**Remember**: Security is everyone's responsibility. Keep credentials out of Git!