# Architecture — v5.1.4

GitHub Pages hosts the public login page, authenticated ERP UI, and admin UI. The frontend talks to the Google Apps Script backend through a hidden bridge iframe using a runtime-nonce `MessageChannel`, with a restricted window-message fallback.

Apps Script remains the backend only. It owns authentication, OTP/session validation, RBAC, audit history, Razorpay secret handling, Google Sheets mirrors, and the Google Drive master state/backups.

Current production backend endpoint:

`https://script.google.com/macros/s/AKfycbxJsQGoSpf3jVVSFZU0ta7Z46_82Fnj_cGHlgYs4YAPgW9pwD-cIWBJbz85T64P1WI/exec`

Expected backend: v5.1.2, schema 5, ONLINE.
