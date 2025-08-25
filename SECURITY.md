# Security Guidelines for Random Learner

## 🔐 API Key Security

### CRITICAL: Never Commit API Keys!

This application uses sensitive API keys for OpenAI and Google Gemini services. **These keys must NEVER be committed to version control.**

### Where API Keys Are Stored

API keys are safely stored using `electron-store` in OS-specific locations:

- **macOS**: `~/Library/Application Support/random-learner/`
- **Windows**: `%APPDATA%/random-learner/`
- **Linux**: `~/.config/random-learner/`

### Protected Files

The `.gitignore` file protects the following sensitive data:

```
# API Keys and Sensitive Data
*api-key*
*apikey*
*api_key*
*.key
*.secret
*openai*key*
*gemini*key*
*gpt*key*
secrets.json
credentials.json
.env*
config.json
settings.json
ai-questions-cache.json
```

### Pre-Commit Checklist

Before committing any changes, verify:

- [ ] No API keys in code comments
- [ ] No hardcoded API keys in source files
- [ ] No `.env` files being committed
- [ ] No backup files with sensitive data
- [ ] Check with: `git status` and review all files

### If You Accidentally Commit an API Key

1. **Immediately revoke the API key** in the provider's dashboard
2. **Generate a new API key**
3. **Remove the key from git history**:
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch path/to/file' \
   --prune-empty --tag-name-filter cat -- --all
   ```
4. **Force push** (if already pushed): `git push --force-with-lease`
5. **Update the application** with the new key

### Best Practices

1. **Use Environment Variables**: Never hardcode keys in source
2. **Regular Key Rotation**: Rotate API keys periodically
3. **Monitor Usage**: Check API usage dashboards for suspicious activity
4. **Separate Keys**: Use different keys for development and production
5. **Team Access**: Limit who has access to production API keys

### Sharing the Project

When sharing or open-sourcing:

1. **Clean History**: Ensure no keys in git history
2. **Document Setup**: Provide clear instructions for API key setup
3. **Example Files**: Provide `.env.example` with dummy values
4. **Security Notice**: Include this security documentation

### Emergency Contacts

If you suspect a security breach:

1. Immediately revoke all API keys
2. Check API usage logs for unauthorized access
3. Generate new keys and update the application
4. Review recent commits for any leaked data

## 🛡️ Additional Security Measures

### Application Security

- API keys are encrypted in electron-store
- No network transmission of keys except to authorized APIs
- Local question cache contains no sensitive data
- Settings are stored locally, not transmitted

### Development Security

- Use `npm audit` regularly to check for vulnerabilities
- Keep Electron and dependencies updated
- Test with limited-scope API keys during development
- Use separate API keys for testing vs production

### User Privacy

- Question cache is stored locally only
- No user data transmitted except to chosen AI providers
- Settings remain on user's device
- No analytics or tracking implemented

---

**Remember: Security is everyone's responsibility. When in doubt, don't commit!**
