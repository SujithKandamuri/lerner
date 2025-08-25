# Publishing Guide for @codejoy/random-learner

## Prerequisites

1. **NPM Account**: You need access to the `@codejoy` organization on npmjs.org
2. **Node.js**: Version 16.0.0 or higher
3. **Git**: For version control and tagging

## Publishing Steps

### 1. Prepare for Publishing

```bash
# Ensure you're logged into npm with access to @codejoy
npm whoami
npm org ls codejoy

# Install dependencies
npm install

# Test the application
npm start
```

### 2. Version Management

```bash
# Update version (choose one)
npm version patch    # 1.0.0 -> 1.0.1 (bug fixes)
npm version minor    # 1.0.0 -> 1.1.0 (new features)
npm version major    # 1.0.0 -> 2.0.0 (breaking changes)
```

### 3. Pre-publish Checks

```bash
# Check what will be published
npm pack --dry-run

# Verify package contents
npm pack
tar -tzf codejoy-random-learner-*.tgz
rm codejoy-random-learner-*.tgz
```

### 4. Publish to NPM

```bash
# Publish to npm registry
npm publish

# For beta/pre-release versions
npm publish --tag beta
```

### 5. Post-publish Verification

```bash
# Install globally to test
npm install -g @codejoy/random-learner

# Test the CLI
random-learner

# Uninstall test version
npm uninstall -g @codejoy/random-learner
```

## Publishing Checklist

- [ ] Updated version number
- [ ] Updated README.md with latest features
- [ ] All dependencies are up to date
- [ ] .npmignore excludes unnecessary files
- [ ] LICENSE file is present
- [ ] Package runs correctly with `npm start`
- [ ] Binary script works: `node bin/random-learner.js`
- [ ] No sensitive data (API keys, cache files) included
- [ ] Git repository is clean and up to date

## Troubleshooting

### 403 Forbidden Error
```bash
# Make sure you're logged in and have access to @codejoy
npm login
npm org ls codejoy
```

### Package Size Issues
```bash
# Check package size
npm pack --dry-run

# Large files should be in .npmignore
```

### Binary Not Working
```bash
# Test the binary script directly
node bin/random-learner.js

# Check file permissions
ls -la bin/random-learner.js
```

## Registry Information

- **Package Name**: `@codejoy/random-learner`
- **Registry**: https://registry.npmjs.org/
- **Organization**: @codejoy
- **Access**: Public

## Support

If you encounter issues during publishing:
1. Check the NPM documentation
2. Verify organization permissions
3. Contact support@codejoy.dev
