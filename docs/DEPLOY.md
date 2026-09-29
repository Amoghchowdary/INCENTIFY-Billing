# Deployment — v6.1.0

1. Update Apps Script first using the package folder 01_APPS_SCRIPT_UPDATE.
2. Confirm VERIFY_LIVE_V6.ps1 passes.
3. Run 02_GITHUB_DEPLOY\DEPLOY_TO_GITHUB.cmd.
4. The deployer verifies the release, live backend, target Git repository, staged paths, commit, and push.
5. GitHub Pages remains on main / root.
