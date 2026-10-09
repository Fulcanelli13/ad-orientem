/*
 * Application-level offline/update bridge. Distinct from certified Scripture
 * pack storage and from the Mass reader's state/lifecycle.
 */
const BASE=new URL("../../",import.meta.url);
const WORKER_URL=new URL("sw.js",BASE);
const TEST= new URL(globalThis.location?.href||BASE).searchParams.has("aoOfflineTest");
const eligible=typeof navigator!=="undefined"&&"serviceWorker" in navigator&&
 (globalThis.location?.protocol==="https:"||
 (["localhost","127.0.0.1"].includes(globalThis.location?.hostname)&&TEST));
let registered=false,version=null,pendingVersion=null,ready=false,error=null,lastChecked=0;
let dismissed=null,promptNode=null,inflight=null,controller=null;
function send(type,extra={}){
 const target=navigator.serviceWorker.controller||controller;
 if(!target)return Promise.resolve({ok:false,error:"SERVICE_WORKER_INACTIVE"});
 return new Promise(resolve=>{
  const channel=new MessageChannel();
  let done=false;
  const timeout=setTimeout(()=>{if(!done){done=true;resolve({ok:false,error:"MESSAGE_TIMEOUT"})}},120000);
  channel.port1.onmessage=e=>{if(!done){done=true;clearTimeout(timeout);resolve(e.data||{})}};
  target.postMessage({source:"AO_OFFLINE_V1",type,...extra},[channel.port2]);
 });
}
function liveMass(){
 try{
  const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
  return s?.route==="live"||Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected);
 }catch{return false}
}
function removePrompt(){
 promptNode?.remove();promptNode=null;
}
function paintPrompt(){
 if(!pendingVersion||pendingVersion===dismissed||typeof document==="undefined"||!document.body)return;
 if(promptNode?.isConnected)return;
 const div=document.createElement("aside");
 div.setAttribute("role","status");
 div.setAttribute("aria-label","Application update available");
 div.id="ao-offline-update-ready";
 div.style.cssText="position:fixed;z-index:2147483500;bottom:calc(82px + env(safe-area-inset-bottom,0px));right:12px;left:12px;max-width:380px;margin-left:auto;background:#101923;color:#f0e9dc;border:1px solid #746748;border-radius:10px;padding:12px 14px;font:14px/1.45 system-ui,sans-serif;box-shadow:0 12px 28px rgba(0,0,0,.4)";
 const label=document.createElement("span");
 label.textContent="An updated version is ready.";
 const actions=document.createElement("div");
 actions.style.cssText="display:flex;justify-content:flex-end;gap:8px;margin-top:10px";
 const later=document.createElement("button"),apply=document.createElement("button");
 later.type=apply.type="button";
 later.textContent="Later";apply.textContent="Update";
 for(const b of [later,apply])b.style.cssText="min-height:44px;min-width:74px;padding:8px 13px;border-radius:8px;border:1px solid #746748;color:inherit;background:#192636;font:600 13px system-ui,sans-serif;cursor:pointer";
 apply.style.background="#594e39";
 later.addEventListener("click",()=>{dismissed=pendingVersion;removePrompt()});
 apply.addEventListener("click",async()=>{
  if(liveMass()&&!globalThis.confirm?.("Updating will reload the app and interrupt the active Mass reader. Update now?"))return;
  apply.disabled=true;
  const result=await send("USE_SNAPSHOT",{version:pendingVersion});
  if(result?.ok)globalThis.location?.reload?.();
  else{error=result?.error||"UPDATE_FAILED";apply.disabled=false}
 });
 actions.append(later,apply);div.append(label,actions);
 document.body.append(div);promptNode=div;
}
function onMessage(e){
 const data=e.data;
 if(data?.source!=="AO_OFFLINE_V1")return;
 if(data.type==="UPDATE_READY"){
  pendingVersion=data.version;paintPrompt();
 }else if(data.type==="OFFLINE_READY"){
  ready=true;version=data.active;
 }else if(data.type==="SNAPSHOT_FAILED"){
  error=data.message;
 }else if(data.type==="ACTIVE_VERSION"){
  version=data.version;
 }
}
async function check({force=false}={}){
 if(!eligible)return {ok:false,error:"UNSUPPORTED"};
 if(!force&&inflight)return inflight;
 if(!force&&Date.now()-lastChecked<30*60*1000)return {ok:true,skipped:"RECENTLY_CHECKED"};
 lastChecked=Date.now();
 inflight=send("CHECK_UPDATE").then(result=>{
  if(result?.ok){
   ready=true;version=result.active;
   if(result.updateAvailable){pendingVersion=result.version;paintPrompt()}
  }else error=result?.error||"OFFLINE_SNAPSHOT_FAILED";
  return result;
 }).finally(()=>{inflight=null});
 return inflight;
}
async function initialise(){
 if(!eligible||registered)return;
 registered=true;
 try{
  navigator.serviceWorker.addEventListener("message",onMessage);
  const reg=await navigator.serviceWorker.register(WORKER_URL.href,{scope:BASE.pathname,updateViaCache:"none"});
  controller=reg.active||reg.waiting;
  const s=await send("STATUS");
  ready=Boolean(s?.active);version=s?.active||null;
  await check({force:true});
 }catch(e){error=String(e?.message||e)}
}
if(eligible){
 if(document.readyState==="complete")setTimeout(()=>void initialise(),1800);
 else globalThis.addEventListener("load",()=>setTimeout(()=>void initialise(),1800),{once:true});
 globalThis.addEventListener("online",()=>{if(registered)void check({force:true})});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden&&registered)void check()});
}
globalThis.AO_OFFLINE_APP_V1=Object.freeze({
 get status(){return Object.freeze({supported:eligible,registered,ready,version,pendingVersion,error,lastChecked})},
 check:()=>check({force:true}),
 apply:async()=>{
  if(!pendingVersion)return false;
  if(liveMass())return false;
  const r=await send("USE_SNAPSHOT",{version:pendingVersion});
  if(r?.ok){globalThis.location?.reload?.();return true}
  return false;
 }
});
