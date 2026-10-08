import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../js/api-client.js',import.meta.url),'utf8');
const sandbox={
  window:{INCENTIFY_EMS_CONFIG:{API_URL:'https://script.google.com/macros/s/TEST/exec',BACKEND_VERSION:'16.0.0'}},
  document:{createElement:()=>({}),head:{appendChild(){}}},
  globalThis:null,crypto:globalThis.crypto,TextEncoder,btoa:globalThis.btoa,setTimeout,clearTimeout,Promise,Date,Math,Error,Uint8Array,encodeURIComponent
};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);vm.runInContext(source,sandbox);
const Client=sandbox.window.IncentifyEmsApiClient;
const checks=[];const add=(ok,n)=>checks.push({ok:!!ok,n});
{
  const c=new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);let j=0,f=0;
  c._jsonpOnce=async()=>{j++;return {success:true,version:'16.0.0'}};
  c._fetchOnce=async()=>{f++;return {success:true}};
  await c.call('health');add(j===1&&f===0,'safe request uses JSONP primary without unnecessary fetch');
}
{
  const c=new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);let j=0,f=0;
  c._jsonpOnce=async()=>{j++;const e=new Error('net');e.code='NETWORK_ERROR';throw e};
  c._fetchOnce=async()=>{f++;return {success:true,version:'16.0.0'}};
  await c.call('health');add(j===1&&f===1,'safe request falls back to fetch after JSONP network failure');
}
{
  const c=new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);let j=0,f=0;
  c._jsonpOnce=async()=>{j++;return {success:true}};c._fetchOnce=async()=>{f++;return {success:true}};
  await c.call('createEmployee',{employee:{fullName:'Test'}});add(j===1&&f===0,'unsafe mutation is delivered exactly once');
}
{
  const c=new Client(sandbox.window.INCENTIFY_EMS_CONFIG.API_URL);let seen='';
  c._jsonpOnce=async encoded=>{seen=encoded;return {success:true}};
  await c.call('health');add(/^ems16_2_/.test(c._requestId()),'V16.2 request IDs use V16-compatible namespace');add(/^__incentify_ems_v16_cb_[A-Za-z0-9_]+$/.test(c._callbackName(1)),'JSONP callback matches V16 backend validator contract');add(Boolean(seen),'request payload encodes successfully');
}
for(const x of checks)console.log(`${x.ok?'PASS':'FAIL'}: ${x.n}`);
const failed=checks.filter(x=>!x.ok);if(failed.length)process.exit(1);console.log(`\nV16.2 API client unit tests passed: ${checks.length} checks.`);
