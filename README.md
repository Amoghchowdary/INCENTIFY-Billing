# INCENTIFY EMS V16.2 Frontend

Production GitHub Pages frontend for INCENTIFY PRIVATE LIMITED.

Backend change: **NONE**. Keep the already deployed `INCENTIFY EMS V16 Cloud API` backend version `16.0.0`. Do not replace Code.gs for this release.

V16.2 fixes a V16.1 JSONP callback-namespace mismatch discovered by the live backend test. The V16 backend validates callback names beginning with `__incentify_ems_v16_cb_`; V16.1 incorrectly emitted `__incentify_ems_v16_1_cb_`. V16.2 restores the exact backend-compatible callback namespace while keeping the low-latency JSONP-first transport, fetch fallback for safe/idempotent calls, single-delivery mutations, and transient-404 deployment recovery.

Local extraction location:
`C:\Users\MYPC\Desktop\Incentify_EMS\INCENTIFY_EMS_V16_1_GitHub_Frontend`

Permanent Git deployment clone:
`C:\Users\MYPC\Desktop\Incentify_EMS\Deployment_Folder\INCENTIFY-Billing`

Verify:
`node .\scripts\verify-v16_2.mjs`
`node .\scripts\test-api-client-v16_2.mjs`
`.\scripts\test-v16_2-deployment.ps1`
`.\scripts\test-v16_2-backend.ps1`
