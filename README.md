# INCENTIFY EMS — GitHub Frontend V19.0.0

Production GitHub Pages frontend for **INCENTIFY EMS V19**.

Backend: **INCENTIFY EMS V19 Cloud API 19.0.0**.

## V19 reliability and UX changes
- Critical mutations use persistent request replay. If Apps Script completes a request but the phone/browser loses the response, V19 probes the stored result before resending.
- Employee/Admin creation, deletion, enable/disable, attendance operations, settings, holidays, mail actions and secure face submission are protected from duplicate execution after uncertain network responses.
- Secure enrollment/attendance refresh recovers an already-completed result instead of asking the employee to capture again.
- Safe reads use JSONP first with fetch fallback; duplicate startup reads are coalesced to reduce perceived latency.
- Employee form and access-management flows use controlled application modals with working Cancel, X, Escape and backdrop handling.
- Destructive actions use typed application confirmations; browser `alert`, `prompt` and `confirm` are not used in the portals.
- Toasts and inline errors render above modal backdrops.
- Public Employee/Attendance URLs are read-only in Admin and pinned by the backend to the current `INCENTIFY_EMS` GitHub Pages route.
- Face recognition remains restricted to the secure attendance/enrollment page.
- Mail Health, test email, mail-delivery log and `SYSTEM_RUNS` diagnostics remain available in Admin.

## Verify locally
```powershell
node .\scripts\verify-v19.mjs
node .\scripts\test-api-client-v19.mjs
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\test-v19-deployment.ps1
.\scripts\test-v19-backend.ps1
```

Only after all four checks pass should this folder be mirrored into the permanent Git deployment clone.
