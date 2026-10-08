(() => {
  'use strict';

  class IncentifyEmsApiClient {
    constructor(url) {
      this.baseUrl = String(url || '').trim();
      this.seq = 0;
    }

    isConfigured() {
      return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/i.test(this.baseUrl)
        && !this.baseUrl.includes('PASTE_NEW_V14_APPS_SCRIPT');
    }

    waitReady(timeout = 20000) {
      return this.call('health', {}, timeout).then(() => undefined);
    }

    _encode(value) {
      const json = JSON.stringify(value || {});
      const bytes = new TextEncoder().encode(json);
      let binary = '';
      const CHUNK = 0x8000;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
      }
      return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
    }

    call(action, payload = {}, timeout = 45000) {
      if (!this.isConfigured()) {
        return Promise.reject(new Error('V14 backend URL is not configured. Paste the new Apps Script /exec URL into js/config.js.'));
      }

      const suffix = `${Date.now()}_${++this.seq}_${Math.random().toString(36).slice(2)}`
        .replace(/[^A-Za-z0-9_]/g, '');
      const callback = `__incentify_ems_v14_cb_${suffix}`;
      const request = { action: String(action || ''), ...(payload || {}) };
      const encoded = this._encode(request);

      if (encoded.length > 11000) {
        return Promise.reject(new Error('Request payload is too large for the V14 browser API transport.'));
      }

      return new Promise((resolve, reject) => {
        let done = false;
        const script = document.createElement('script');

        const clear = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          script.remove();
          try { delete window[callback]; } catch (_) { window[callback] = undefined; }
        };

        window[callback] = result => {
          const response = result || {};
          clear();
          if (response.success === false) {
            const error = new Error(response.message || response.error || 'Server request failed.');
            error.code = response.error || 'SERVER_ERROR';
            error.details = response;
            reject(error);
            return;
          }
          resolve(response);
        };

        script.async = true;
        script.referrerPolicy = 'no-referrer';
        const sep = this.baseUrl.includes('?') ? '&' : '?';
        script.src = `${this.baseUrl}${sep}api=1&callback=${encodeURIComponent(callback)}&payload=${encodeURIComponent(encoded)}&v=14.0.0&_=${Date.now()}`;
        script.onerror = () => {
          clear();
          reject(new Error('Could not reach the INCENTIFY EMS V14 Apps Script API. Verify the new deployment URL and web-app access.'));
        };

        const timer = setTimeout(() => {
          clear();
          reject(new Error(`Backend request timed out: ${action}`));
        }, timeout);

        document.head.appendChild(script);
      });
    }
  }

  window.IncentifyEmsApiClient = IncentifyEmsApiClient;
  window.incentifyEmsApi = new IncentifyEmsApiClient(window.INCENTIFY_EMS_CONFIG.API_URL);
})();
