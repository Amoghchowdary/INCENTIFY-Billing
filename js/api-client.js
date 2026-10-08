(() => {
  'use strict';

  class IncentifyEmsApiClient {
    constructor(url) {
      this.baseUrl = String(url || '').trim();
      this.seq = 0;
      this.maxNetworkAttempts = 4;
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

    _sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    _networkError(message, code = 'NETWORK_ERROR') {
      const error = new Error(message);
      error.code = code;
      return error;
    }

    _callbackName(attempt) {
      const suffix = `${Date.now()}_${++this.seq}_${attempt}_${Math.random().toString(36).slice(2)}`
        .replace(/[^A-Za-z0-9_]/g, '');
      return `__incentify_ems_v14_cb_${suffix}`;
    }

    _requestUrl(callback, encoded, attempt) {
      const sep = this.baseUrl.includes('?') ? '&' : '?';
      const nonce = `${Date.now()}_${attempt}_${Math.random().toString(36).slice(2)}`;
      return `${this.baseUrl}${sep}api=1&callback=${encodeURIComponent(callback)}&payload=${encodeURIComponent(encoded)}&v=14.0.0&retry=${attempt}&_=${encodeURIComponent(nonce)}`;
    }

    _jsonpOnce(encoded, timeout, attempt) {
      return new Promise((resolve, reject) => {
        let done = false;
        const callback = this._callbackName(attempt);
        const script = document.createElement('script');
        let timer = null;

        const clear = () => {
          if (done) return false;
          done = true;
          if (timer) clearTimeout(timer);
          if (script.parentNode) script.parentNode.removeChild(script);
          try { delete window[callback]; } catch (_) { window[callback] = undefined; }
          return true;
        };

        window[callback] = result => {
          if (!clear()) return;
          const response = result || {};
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
        script.src = this._requestUrl(callback, encoded, attempt);
        script.onerror = () => {
          if (!clear()) return;
          reject(this._networkError(`Temporary Apps Script network error (attempt ${attempt}).`));
        };

        timer = setTimeout(() => {
          if (!clear()) return;
          reject(this._networkError(`Apps Script request timed out (attempt ${attempt}).`, 'TIMEOUT'));
        }, timeout);

        document.head.appendChild(script);
      });
    }

    async call(action, payload = {}, timeout = 45000) {
      if (!this.isConfigured()) {
        throw new Error('V14 backend URL is not configured. Paste the Apps Script /exec URL into js/config.js.');
      }

      const request = { action: String(action || ''), ...(payload || {}) };
      const encoded = this._encode(request);

      if (encoded.length > 11000) {
        throw new Error('Request payload is too large for the V14 browser API transport.');
      }

      const startedAt = Date.now();
      let lastError = null;

      for (let attempt = 1; attempt <= this.maxNetworkAttempts; attempt++) {
        const elapsed = Date.now() - startedAt;
        const remaining = timeout - elapsed;
        if (remaining <= 0) break;

        const perAttemptTimeout = Math.max(5000, Math.min(15000, remaining));

        try {
          return await this._jsonpOnce(encoded, perAttemptTimeout, attempt);
        } catch (error) {
          const code = String(error && error.code || '');

          // Server-side validation/authentication errors are authoritative and
          // must be shown immediately. Only transport failures are retried.
          if (code !== 'NETWORK_ERROR' && code !== 'TIMEOUT') throw error;

          lastError = error;
          if (attempt < this.maxNetworkAttempts) {
            await this._sleep(250 * attempt);
          }
        }
      }

      const finalError = this._networkError(
        'Could not reach the INCENTIFY EMS V14 Apps Script API after automatic retries. Please check the network and try again.'
      );
      finalError.cause = lastError || undefined;
      throw finalError;
    }
  }

  window.IncentifyEmsApiClient = IncentifyEmsApiClient;
  window.incentifyEmsApi = new IncentifyEmsApiClient(window.INCENTIFY_EMS_CONFIG.API_URL);
})();
