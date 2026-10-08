# INCENTIFY EMS — GitHub Frontend V18.0.0

Production GitHub Pages frontend for INCENTIFY EMS V18.

Backend: **INCENTIFY EMS V18 Cloud API 18.0.0**.

## V18 frontend fixes
- Replaces the native employee `<dialog>` with a custom modal so Cancel, X, backdrop, and Escape close reliably.
- Employee validation/API errors stay inside the employee modal instead of appearing behind the blurred overlay.
- Toast notifications render above every modal.
- Reworks Access Control with a dedicated Add Account modal, enable/disable, and true Delete controls for ADMIN/HR/MANAGER accounts.
- Uses a custom destructive-action confirmation modal instead of browser `confirm()` dialogs.
- Adds Mail Health, end-to-end test email, and the latest mail-delivery log directly to Admin.
- Adds Application Run Descriptions backed by `SYSTEM_RUNS` so operational runs have meaningful status text even though the Apps Script execution UI itself cannot be customized.
- Reduces perceived latency by updating employee/access state locally after successful mutations instead of reloading the complete admin bootstrap.
- Keeps face verification only on secure attendance/enrollment links.

## Verify locally
```powershell
node .\scripts\verify-v18.mjs
node .\scripts\test-api-client-v18.mjs
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\test-v18-deployment.ps1
.\scripts\test-v18-backend.ps1
```
