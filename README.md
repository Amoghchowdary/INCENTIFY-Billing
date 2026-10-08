# INCENTIFY EMS V14 GitHub Frontend

Pages:
- `index.html` — role login
- `admin.html` — employee, attendance, holiday calendar, concessions, reports, access, settings
- `employee.html` — profile, read-only attendance, shift checkout
- `attendance.html` — secure email-link face + geolocation attendance capture

V14 removes face-recognition UI from both Admin and Employee portals. Face verification occurs only on the short-lived attendance/enrollment link.

Configure a fresh Apps Script `/exec` URL:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\set-api-url.ps1 -Url "YOUR_V14_EXEC_URL"
node .\scripts\verify-v14.mjs
```

## Browser transport reliability revision
This V14 build retries transient Apps Script JSONP network/404 failures automatically with a fresh callback and cache-busting nonce. Server-side errors such as wrong portal, invalid OTP, or access denial are never retried or hidden.
