# Security and Build Issues Documentation

**Generated:** 2026-02-04  
**Repository:** anxzik/network-planner

## Overview
This document tracks known security vulnerabilities and build issues in the Network Planner project. This is part of the repository's commitment to transparency and continuous improvement.

## Current Vulnerabilities

### Summary
- **Total Vulnerabilities:** 30 (reduced from 31)
- **Severity Breakdown:**
  - Critical: 0
  - High: 24
  - Moderate: 2
  - Low: 4

### Recent Fixes
- **2026-02-04:** Fixed lodash Prototype Pollution vulnerability via `npm audit fix`

### Dependency Vulnerabilities

#### 1. tar (High Severity - Multiple Vulnerabilities)
- **Affected Versions:** ≤7.5.6
- **Status:** No fix available
- **Impact:** Transitive dependency through Electron Forge ecosystem
- **Issues:**
  - GHSA-8qq5-rm4j-mr97: Arbitrary File Overwrite and Symlink Poisoning via Insufficient Path Sanitization
  - GHSA-r6q2-hw4h-h46w: Race Condition in Path Reservations via Unicode Ligature Collisions on macOS APFS
  - GHSA-34x7-hfp2-rc4v: Arbitrary File Creation/Overwrite via Hardlink Path Traversal
- **Mitigation:** These are in development dependencies (@electron/node-gyp, @electron/rebuild, cacache)
- **Action Required:** Monitor for upstream fixes in Electron Forge ecosystem

#### 2. esbuild (Moderate Severity)
- **Affected Versions:** ≤0.24.2
- **Status:** Fix available via `npm audit fix --force` (breaking change)
- **Issue:** GHSA-67mh-4wv8-2f99 - Enables any website to send requests to development server and read responses
- **Impact:** Development-time security issue only
- **Dependencies:** vite (0.11.0 - 6.1.6) depends on vulnerable esbuild
- **Mitigation:** Only affects development environment, not production builds
- **Action Required:** Consider upgrading vite to v7.3.1+ after testing

#### 3. tmp (High Severity)
- **Affected Versions:** ≤0.2.3
- **Status:** No fix available
- **Issue:** GHSA-52f5-9888-hmc6 - Allows arbitrary temporary file/directory write via symbolic link
- **Impact:** Transitive dependency through @inquirer/prompts (used by Electron Forge CLI)
- **Mitigation:** Development dependency only
- **Action Required:** Monitor for upstream fixes

#### 4. lodash (Moderate Severity)
- **Affected Versions:** 4.0.0 - 4.17.21
- **Status:** ✅ FIXED (2026-02-04)
- **Issue:** GHSA-xxjr-mmjv-4gpg - Prototype Pollution in `_.unset` and `_.omit` functions
- **Solution:** Applied `npm audit fix`

### Build Configuration Issues

#### 1. ESLint Configuration Mismatch
- **Status:** ✅ FIXED
- **Issue:** Package.json used `eslint --ext .ts,.tsx` which is incompatible with flat config format
- **Solution:** Updated lint script to `eslint .`
- **Files Modified:**
  - package.json
  - eslint.config.js (simplified to remove missing plugins)

#### 2. Missing ESLint Plugins
- **Status:** ✅ DOCUMENTED
- **Issue:** eslint.config.js referenced missing plugins:
  - eslint-plugin-react-hooks
  - eslint-plugin-react-refresh
- **Solution:** Simplified config to use only installed plugins
- **Remaining Warnings:** 14 lint warnings from inline eslint-disable comments referencing removed rules

#### 3. Node Version Mismatch
- **Status:** 🟡 WARNING
- **Issue:** @electron/build-tools requires Node ≥22.12.0
- **Current:** Node v20.20.0
- **Impact:** Non-blocking warnings during npm install
- **Action Required:** Consider updating CI/development environment to Node 22.12.0+

## Recommendations

### Immediate Actions (Low Risk)
1. ✅ Run `npm audit fix` to fix lodash vulnerability (COMPLETED)
2. ✅ Update ESLint configuration (COMPLETED)
3. 🔄 Remove or update inline ESLint comments that reference missing rules (OPTIONAL)

### Medium-Term Actions (Moderate Risk)
1. Evaluate upgrading vite to v7.3.1+ to fix esbuild vulnerability
   - **Risk:** Potential breaking changes
   - **Testing Required:** Full application testing
2. Consider updating to Node 22.12.0+ for development
   - **Risk:** Low - mainly eliminates warnings
   - **Testing Required:** Verify build and development server work

### Long-Term Monitoring
1. Monitor Electron Forge ecosystem for tar vulnerability fixes
2. Review dependency updates quarterly for security patches
3. Set up automated security scanning (e.g., GitHub Dependabot)
4. Consider using `npm audit` in CI/CD pipeline

## References
- [GitHub Advisory Database](https://github.com/advisories)
- [ESLint Flat Config Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)

## Changelog
- 2026-02-04: Initial security audit and documentation
- 2026-02-04: Fixed ESLint configuration issues
- 2026-02-04: Created Copilot instructions file
- 2026-02-04: Applied `npm audit fix` - fixed lodash vulnerability (31 → 30 vulnerabilities)
