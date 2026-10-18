/*
 * Application-level offline/update bridge. Distinct from certified Scripture
 * pack storage and from the Mass reader's state/lifecycle.
 */
const BASE=new URL("../../",import.meta.url);
const WORKER_URL=new URL("sw.js",BASE);
const TEST= new URL(globalThis.location?.href||BASE).searchParams.has("aoOfflineTest");
const VERCEL_WEB_PREVIEW=/\.vercel\.app$/i.test(globalThis.location?.hostname||"");
const eligible=!VERCEL_WEB_PREVIEW&&typeof navigator!=="undefined"&&"serviceWorker" in navigator&&
 (globalThis.location?.protocol==="https:"||
 (["localhost","127.0.0.1"].includes(globalThis.location?.hostname)&&TEST));
let registered=false,version=null,pendingVersion=null,ready=false,error=null,lastChecked=0;
let dismissed=null,promptNode=null,inflight=null,controller=null;
let failureNode=null,failureDismissed=null;
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
function removeCheckFailure(){failureNode?.remove();failureNode=null}
function paintCheckFailure(){
 if(!error||error===failureDismissed||pendingVersion||typeof document==="undefined"||
   !document.body||liveMass()||failureNode?.isConnected)return;
 const fr=String(globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language||
   document.documentElement?.lang||"en").toLowerCase().startsWith("fr");
 const box=document.createElement("aside");
 box.id="ao-offline-check-failed";box.setAttribute("role","status");
 box.setAttribute("aria-live","polite");
 box.style.cssText="position:fixed;z-index:2147483490;bottom:calc(82px + env(safe-area-inset-bottom,0px));right:12px;left:12px;max-width:380px;margin-left:auto;background:#101923;color:#f0e9dc;border:1px solid #746748;border-radius:10px;padding:12px 14px;font:14px/1.45 system-ui,sans-serif;box-shadow:0 12px 28px rgba(0,0,0,.4)";
 const message=document.createElement("span");
 message.textContent=(fr?"Impossible de vérifier la mise à jour.":"Could not check for an app update.")+" "+String(error).slice(0,180);
 const actions=document.createElement("div");
 actions.style.cssText="display:flex;justify-content:flex-end;gap:8px;margin-top:10px";
 const later=document.createElement("button"),retry=document.createElement("button");
 for(const button of [later,retry]){
  button.type="button";
  button.style.cssText="min-height:44px;min-width:74px;padding:8px 13px;border-radius:8px;border:1px solid #746748;color:inherit;background:#192636;font:600 13px system-ui,sans-serif;cursor:pointer";
 }
 later.textContent=fr?"Plus tard":"Later";retry.textContent=fr?"Réessayer":"Retry";
 later.addEventListener("click",()=>{failureDismissed=error;removeCheckFailure()});
 retry.addEventListener("click",async()=>{
  retry.disabled=true;retry.textContent=fr?"Vérification…":"Checking…";
  try{await check({force:true})}catch(e){error=String(e?.message||e)}
  if(!error){removeCheckFailure();return}
  retry.disabled=false;retry.textContent=fr?"Réessayer":"Retry";
 });
 actions.append(later,retry);box.append(message,actions);
 document.body.append(box);failureNode=box;
}
function promptCopy(){
 const language=globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language||
  document.documentElement?.lang||"en";
 const fr=String(language).toLowerCase().startsWith("fr");
 return fr?{
  title:"Une mise à jour est disponible.",
  aria:"Mise à jour de l’application disponible",
  later:"Plus tard",
  update:"Mettre à jour",
  updating:"Mise à jour…",
  failure:"La mise à jour n’a pas pu être appliquée. Réessayez lorsque vous êtes connecté.",
  confirmMass:"La mise à jour rechargera l’application et interrompra la lecture de la messe. Mettre à jour maintenant?"
 }:{
  title:"An updated version is ready.",
  aria:"Application update available",
  later:"Later",
  update:"Update",
  updating:"Updating…",
  failure:"The update could not be applied. Retry while connected.",
  confirmMass:"Updating will reload the app and interrupt the active Mass reader. Update now?"
 };
}
function paintPrompt(){
 if(!pendingVersion||pendingVersion===dismissed||typeof document==="undefined"||!document.body)return;
 if(promptNode?.isConnected)return;
 const copy=promptCopy();
 const div=document.createElement("aside");
 div.setAttribute("role","status");
 div.setAttribute("aria-label",copy.aria);
 div.id="ao-offline-update-ready";
 div.style.cssText="position:fixed;z-index:2147483500;bottom:calc(82px + env(safe-area-inset-bottom,0px));right:12px;left:12px;max-width:380px;margin-left:auto;background:#101923;color:#f0e9dc;border:1px solid #746748;border-radius:10px;padding:12px 14px;font:14px/1.45 system-ui,sans-serif;box-shadow:0 12px 28px rgba(0,0,0,.4)";
 const label=document.createElement("span");
 label.textContent=copy.title;
 const actions=document.createElement("div");
 actions.style.cssText="display:flex;justify-content:flex-end;gap:8px;margin-top:10px";
 const later=document.createElement("button"),apply=document.createElement("button");
 later.type=apply.type="button";
 later.textContent=copy.later;apply.textContent=copy.update;
 for(const b of [later,apply])b.style.cssText="min-height:44px;min-width:74px;padding:8px 13px;border-radius:8px;border:1px solid #746748;color:inherit;background:#192636;font:600 13px system-ui,sans-serif;cursor:pointer";
 apply.style.background="#594e39";
 const warning=document.createElement("p");
 warning.setAttribute("role","alert");
 warning.hidden=true;
 warning.style.cssText="margin:10px 0 0;color:#f0b4ae;font:13px/1.5 system-ui,sans-serif";
 later.addEventListener("click",()=>{dismissed=pendingVersion;removePrompt()});
 apply.addEventListener("click",async()=>{
  const latest=promptCopy();
  if(liveMass()&&!globalThis.confirm?.(latest.confirmMass))return;
  apply.disabled=true;apply.textContent=latest.updating;
  warning.hidden=true;warning.textContent="";
  let result;
  try{result=await send("USE_SNAPSHOT",{version:pendingVersion})}
  catch(e){result={ok:false,error:String(e?.message||e)}}
  if(result?.ok){globalThis.location?.reload?.();return}
  error=result?.error||"UPDATE_FAILED";
  warning.textContent=latest.failure;warning.hidden=false;
  apply.disabled=false;apply.textContent=latest.update;
 });
 actions.append(later,apply);div.append(label,actions,warning);
 document.body.append(div);promptNode=div;
}

function onMessage(e){
 const data=e.data;
 if(data?.source!=="AO_OFFLINE_V1")return;
 if(data.type==="UPDATE_READY"){
  pendingVersion=data.version;paintPrompt();
 }else if(data.type==="OFFLINE_READY"){
  ready=true;version=data.active;error=null;removeCheckFailure();
 }else if(data.type==="SNAPSHOT_FAILED"){
  error=data.message;paintCheckFailure();
 }else if(data.type==="ACTIVE_VERSION"){
  version=data.version;
 }
}
async function check({force=false}={}){
 if(!eligible)return {ok:false,error:"UNSUPPORTED"};
 if(!force&&inflight)return inflight;
 if(!force&&Date.now()-lastChecked<(error?60*1000:30*60*1000))return {ok:true,skipped:"RECENTLY_CHECKED"};
 lastChecked=Date.now();
 inflight=send("CHECK_UPDATE").then(result=>{
  if(result?.ok){
   ready=true;version=result.active;error=null;failureDismissed=null;removeCheckFailure();
   if(result.updateAvailable){pendingVersion=result.version;paintPrompt()}
  }else{error=result?.error||"OFFLINE_SNAPSHOT_FAILED";paintCheckFailure()}
  return result;
 }).finally(()=>{inflight=null});
 return inflight;
}
async function initialise(){
 if(!eligible||registered)return;
 registered=true;
 try{
  navigator.serviceWorker.addEventListener("message",onMessage);
  // Offline reloads must reuse the previously active worker without making
  // a failed online re-registration a prerequisite for reading the snapshot.
  const previous=await navigator.serviceWorker.getRegistration(BASE.href);
  if(!previous||navigator.onLine!==false)
    await navigator.serviceWorker.register(WORKER_URL.href,{scope:BASE.pathname,updateViaCache:"none"});
  const reg=await navigator.serviceWorker.ready;
  controller=reg.active;
  const s=await send("STATUS");
  ready=Boolean(s?.active);version=s?.active||null;
  if(navigator.onLine!==false)await check({force:true});
 }catch(e){error=String(e?.message||e);paintCheckFailure()}
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
