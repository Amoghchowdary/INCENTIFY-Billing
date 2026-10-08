# INCENTIFY EMS — GitHub Frontend V17.0.0

Production GitHub Pages frontend for INCENTIFY EMS V17.

Backend: INCENTIFY EMS V17 Cloud API 17.0.0.

## V17 frontend changes
- Admin Portal can create ADMIN, HR, and MANAGER accounts.
- Access creation remains server-authorized; employee accounts cannot be promoted through this form.
- Backend processing latency (`serverMs`) is surfaced as diagnostic tooltip text.
- V17 cache/session/request/callback namespaces prevent stale V16 assets.
- Existing attendance, holiday, concession, geofence, 8-hour shift, and secure-link face verification flows are preserved.

## Verify
`node .\scripts\verify-v17.mjs`
`node .\scripts\test-api-client-v17.mjs`
