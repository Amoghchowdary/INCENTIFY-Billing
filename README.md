# INCENTIFY EMS V20.0.0 — Production Capture & Download Reliability

Frontend-only GitHub Pages application for INCENTIFY PRIVATE LIMITED.

Production improvements in V20:
- Exact office geofence center: 17.4982778, 78.3845000.
- Employee confirmation, precise-location consent and biometric-consent checkboxes before capture.
- Server validates location before camera verification starts.
- Face enrollment: 7 quality-gated frames; normal attendance verification: 5 frames.
- Detection confidence, lighting, descriptor consistency and active movement challenge are checked.
- Browser active movement is a quality/liveness signal, not a claim of depth-sensor anti-spoofing.
- Employee and access management rows have explicit selection checkboxes.
- Attendance XLSX and backup ZIP use authenticated chunked browser downloads instead of opening private Drive URLs.
- SHA-256 integrity verification is performed by the browser when Web Crypto is available.

Backend must be upgraded to V20 before publishing this frontend.
