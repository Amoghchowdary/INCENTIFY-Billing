# GitHub deployment — frontend v5.1.4

The Apps Script backend is already deployed separately. This package is the complete GitHub Pages frontend.

1. Extract this ZIP.
2. Copy the complete extracted contents into the root of the existing `INCENTIFY-Billing` Git repository, replacing matching files.
3. Do not copy a `.git` folder from anywhere; this package intentionally does not contain one.
4. From the repository root run `node .\scripts\verify-frontend.js`.
5. Proceed only when the final line says `INCENTIFY GitHub frontend v5.1.4 verification passed.`
6. Run `git status` and confirm only intended frontend/release files are changed.
7. Run `git add .` (local `.git/info/exclude` rules still apply).
8. Run `git commit -m "Deploy INCENTIFY ERP frontend v5.1.4"`.
9. Run `git push origin main`.
10. GitHub Pages continues to publish from `main` / `(root)`.
11. Open the existing Pages URL with a hard refresh or Incognito window.

Production backend configured in `js/config.js`:

`https://script.google.com/macros/s/AKfycbxJsQGoSpf3jVVSFZU0ta7Z46_82Fnj_cGHlgYs4YAPgW9pwD-cIWBJbz85T64P1WI/exec`

Access behavior:
- ADMIN: full ERP + admin portal.
- SALES: Create Invoice, Manage Invoices, Payment Tracking only.
