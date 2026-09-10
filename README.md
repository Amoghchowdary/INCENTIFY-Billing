# INCENTIFY ERP Web — Frontend v5.1.4

Production GitHub Pages frontend for **INCENTIFY Private Limited**.

## Production backend

`https://script.google.com/macros/s/AKfycbxJsQGoSpf3jVVSFZU0ta7Z46_82Fnj_cGHlgYs4YAPgW9pwD-cIWBJbz85T64P1WI/exec`

Backend expected: **Apps Script v5.1.2**, schema 5, status ONLINE.

## Access model

- `ADMIN`: full ERP and admin portal access.
- `SALES`: exactly **Create Invoice**, **Manage Invoices**, and **Payment Tracking**.
- SALES restrictions are enforced in both the frontend and the Apps Script backend.

## Deploy

Copy the complete contents of this package to the root of the GitHub repository and push to `main`. GitHub Pages should publish from `main` / `(root)`.

Before pushing, run:

```powershell
node .\scripts\verify-frontend.js
```

Expected final line:

`INCENTIFY GitHub frontend v5.1.4 verification passed.`

The public entry point remains the repository's GitHub Pages URL; `index.html` is the login-first page.
