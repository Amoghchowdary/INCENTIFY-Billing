# INCENTIFY ERP Web — Frontend v6.0.0

Production GitHub Pages frontend for **INCENTIFY Private Limited**.

## Backend

Apps Script URL:
`https://script.google.com/macros/s/AKfycbzaJhod-iShRt5UFT-Qn81rqsjOLtpH3vCUvXjKPIk-350ey72AkwC4q67DsKkDu0o-/exec`

Required backend release: **6.0.0**, schema **5**, status **ONLINE**.

V6 intentionally keeps the existing schema-5 backend storage so current Drive/Sheets production data is preserved.

## Access

- ADMIN: full ERP + admin portal.
- SALES: Create Invoice, Manage Invoices, Payment Tracking only.

## Verify

Run `node .\scripts\verify-frontend.js`.
Expected final line: `INCENTIFY GitHub frontend v6.0.0 verification passed.`

The Git deployer also refuses to push until the live Apps Script backend reports v6.0.0 and the bridge handshake markers are present.
