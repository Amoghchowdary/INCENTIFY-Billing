import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../js/api-client.js', import.meta.url), 'utf8');
const sandbox = {
  window: { INCENTIFY_EMS_CONFIG: { API_URL: 'https://script.google.com/macros/s/TEST/exec', BACKEND_VERSION: '19.0.0' } },
  document: { createElement: () => ({}), head: { appendChild() {} } },
  globalThis: null,
  crypto: globalThis.crypto,
  TextEncoder,
  btoa: globalThis.btoa,
  setTimeout,
  clearTimeout,
  Promise,
  Date,
  Math,
  Error,
  Uint8Array,
  encodeURIComponent
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const Client = sandbox.window.IncentifyEmsApiClient;

const checks = [];
const add = (ok, name) => checks.push({ ok: Boolean(ok), name });
const networkError = (code = 'NETWORK_ERROR') => { const e = new Error(code); e.code = code; return e; };

// 1. Safe read prefers JSONP and does not incur fetch latency when JSONP works.
{
  const c = new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);
  let jsonp = 0, fetches = 0;
  c._jsonpOnce = async () => { jsonp++; return { success: true, version: '19.0.0' }; };
  c._fetchOnce = async () => { fetches++; return { success: true }; };
  await c.call('health');
  add(jsonp === 1 && fetches === 0, 'safe read uses JSONP primary without unnecessary fetch');
}

// 2. Safe read falls back to fetch after a transient JSONP failure.
{
  const c = new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);
  let jsonp = 0, fetches = 0;
  c._jsonpOnce = async () => { jsonp++; throw networkError('NETWORK_ERROR'); };
  c._fetchOnce = async () => { fetches++; return { success: true, version: '19.0.0' }; };
  await c.call('health');
  add(jsonp === 1 && fetches === 1, 'safe read falls back to fetch after JSONP network failure');
}

// 3. Replay-safe mutation succeeds on first JSONP delivery without duplicate transport.
{
  const c = new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);
  let jsonp = 0, fetches = 0, probes = 0;
  c._jsonpOnce = async () => { jsonp++; return { success: true, employee: { employeeCode: 'INCENTIFY-EMP-0001' } }; };
  c._fetchOnce = async () => { fetches++; return { success: true }; };
  c._probeMutation = async () => { probes++; return null; };
  await c.call('createEmployee', { employee: { fullName: 'Test' } });
  add(jsonp === 1 && fetches === 0 && probes === 0, 'replay-safe mutation uses one primary delivery when response is received');
}

// 4. If mutation response is lost but backend persisted the result, probe recovers it without resending mutation.
{
  const c = new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);
  let jsonp = 0, fetches = 0, probes = 0;
  let encodedFirst = '';
  c._jsonpOnce = async (encoded) => { jsonp++; encodedFirst = encoded; throw networkError('TIMEOUT'); };
  c._fetchOnce = async () => { fetches++; return { success: true }; };
  c._probeMutation = async (requestId, action) => {
    probes++;
    return { success: true, employee: { employeeCode: 'INCENTIFY-EMP-0002' }, replayed: true, requestId, action };
  };
  const result = await c.call('createEmployee', { employee: { fullName: 'Recovered' } }, 30000);
  add(jsonp === 1 && fetches === 0 && probes === 1 && result.replayed === true && Boolean(encodedFirst), 'lost mutation response is recovered from persistent replay status without duplicate mutation');
}

// 5. If first mutation was not persisted, fetch fallback receives exactly the SAME encoded logical request.
{
  const c = new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);
  let jsonp = 0, fetches = 0, probes = 0;
  let firstEncoded = '';
  c._jsonpOnce = async (encoded) => {
    jsonp++;
    firstEncoded = firstEncoded || encoded;
    throw networkError('TIMEOUT');
  };
  c._probeMutation = async () => { probes++; return null; };
  c._fetchOnce = async (encoded) => {
    fetches++;
    if (encoded !== firstEncoded) throw new Error('logical request changed during recovery');
    return { success: true, employee: { employeeCode: 'INCENTIFY-EMP-0003' } };
  };
  const result = await c.call('createEmployee', { employee: { fullName: 'Fallback' } }, 30000);
  add(jsonp === 1 && fetches === 1 && probes === 1 && result.success === true, 'mutation fallback reuses identical encoded request ID and payload');
}

// 6. Secure face submission uses the same persistent replay recovery path.
{
  const c = new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);
  let jsonp = 0, fetches = 0, probes = 0;
  c._jsonpOnce = async () => { jsonp++; throw networkError('TIMEOUT'); };
  c._fetchOnce = async () => { fetches++; return { success: true }; };
  c._probeMutation = async () => {
    probes++;
    return { success: true, action: 'ENROLLED', replayed: true };
  };
  const result = await c.call('submitAttendanceLinkFace', {
    attendanceToken: 'secure-token',
    descriptor: new Array(128).fill(0.1),
    livenessPassed: true,
    location: { latitude: 17.4983333, longitude: 78.3843889 }
  }, 70000);
  add(jsonp === 1 && fetches === 0 && probes === 1 && result.action === 'ENROLLED', 'secure face mutation recovers persisted completion after JSONP timeout');
}

// 7. Client IDs/callback namespace match V19 backend validation contract.
{
  const c = new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);
  add(/^ems19_[A-Za-z0-9_-]{16,120}$/.test(c._requestId()), 'V19 request IDs match backend validation contract');
  add(/^__incentify_ems_v19_cb_[A-Za-z0-9_]+$/.test(c._callbackName(1)), 'V19 JSONP callback matches backend validation contract');
}

// 8. Payload encoder is functional for real API requests.
{
  const c = new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);
  const encoded = c._encode({ action: 'health', requestId: c._requestId() });
  add(typeof encoded === 'string' && encoded.length > 20 && !/=/.test(encoded), 'request payload encodes as unpadded web-safe base64');
}

// 9. Coalescing identical bootstrap reads prevents duplicate startup round trips.
{
  const c = new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);
  let safeCalls = 0;
  let resolveSafe;
  c._safeTransport = () => {
    safeCalls++;
    return new Promise(resolve => { resolveSafe = resolve; });
  };
  const p1 = c.call('bootstrapAdmin', { token: 'session-token' });
  const p2 = c.call('bootstrapAdmin', { token: 'session-token' });
  add(safeCalls === 1, 'identical bootstrap reads are coalesced into one in-flight request');
  resolveSafe({ success: true });
  await Promise.all([p1, p2]);
}

for (const check of checks) console.log(`${check.ok ? 'PASS' : 'FAIL'}: ${check.name}`);
const failed = checks.filter(x => !x.ok);
if (failed.length) process.exit(1);
console.log(`\nV19 API client unit tests passed: ${checks.length} checks.`);
