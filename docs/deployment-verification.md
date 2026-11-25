# Deployment isolation verification

This document records the verification procedure for the STUDI adviser-demo branch.

- Preserve the official production project and `main` branch.
- Retire redundant project-level Git connections without deleting application data.
- Use this documentation-only commit to check automatic Preview deployments after connection cleanup.
- Confirm the official project receives the commit and verify no redundant projects receive it.
- Smoke-test the official production URL and the adviser-demo Preview.
- Separate test and production backend resources before implementing file-storage changes.

A successful build alone does not establish backend isolation or prove that every redundant integration has been removed. Verify the corresponding deployment dashboards before closing the audit.
