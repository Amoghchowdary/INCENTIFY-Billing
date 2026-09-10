# Architecture — v6.0.0

GitHub Pages hosts login/ERP/admin UI. Google Apps Script remains the private backend bridge/API.

Backend: `https://script.google.com/macros/s/AKfycbzaJhod-iShRt5UFT-Qn81rqsjOLtpH3vCUvXjKPIk-350ey72AkwC4q67DsKkDu0o-/exec`

Release 6.0.0 keeps schema 5 and existing V5_* storage keys so the existing production Drive/Sheets database is reused.

ADMIN receives full ERP access. SALES receives Create Invoice, Manage Invoices, and Payment Tracking only, with backend RBAC enforcement.
