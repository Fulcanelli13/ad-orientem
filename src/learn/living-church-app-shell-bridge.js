/**
 * Living Church -> Catechism bridge hosted by the actual Ad Orientem app shell.
 * Only the same-origin review iframe receives this narrow controller.
 * No parent AO_MODULES or Catechism owner is exposed to the iframe.
 */
export const LIVING_CHURCH_SHELL_BRIDGE_VERSION="AO_LC_SHELL_CATECHISM_V1";
const Q322=Object.freeze({routeId:"learn.catechism",sourceRef:"PX1912-Q322",
 sceneId:"BROMPTON_ALTAR_2019_B"});
const fail=reason=>Object.freeze({ok:false,reason});
const success=()=>Object.freeze({ok:true});
const approved=result=>result===true||result?.ok===true;
export function installLivingChurchCatechismShellBridge(win,{frame,reviewRoot,enabled}={}){
 if(!win?.document||!frame||typeof reviewRoot!=="function"||typeof enabled!=="function")
  throw Error("Visible Mass host reference and review gate required");
 let owned=false,busy=false,savedStyle=null,disposed=false,lastOpening=null;
 const parentButton=win.document.createElement("button");
 parentButton.type="button";parentButton.id="ao-living-church-native-return";parentButton.hidden=true;
 parentButton.textContent="Return to the Living Church";
 parentButton.setAttribute("aria-label","Close Catechism and return to St Pius X in the church");
 Object.assign(parentButton.style,{
  position:"fixed",zIndex:"2147483400",
  right:"16px",bottom:"calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px) + 22px)",
  border:"1px solid #c7af82",borderRadius:"8px",padding:"13px 16px",
  background:"#111923",color:"#f0e7d9",boxShadow:"0 5px 25px #000b",
  font:"13px system-ui,sans-serif",cursor:"pointer"
 });
 win.document.body.append(parentButton);
 const currentChild=()=>{
  const child=frame.contentWindow;
  if(!child||child.location.origin!==win.location.origin)return null;
  return child;
 };
 function validate(request){
  if(disposed||!enabled()||!frame.isConnected||!reviewRoot()?.contains(frame))
   return fail("REVIEW_NOT_ACTIVE");
  if(request?.routeId!==Q322.routeId||request?.sourceRef!==Q322.sourceRef||
     request?.sceneId!==Q322.sceneId||request?.photoId!==Q322.sceneId)
   return fail("UNVERIFIED_CATECHISM_SOURCE");
  const child=currentChild();
  const owner=child?.AO_VISIBLE_MASS_LIVING_CHURCH_P1?.status?.();
  const scene=child?.AO_LIVING_CHURCH_P2?.status?.();
  if(owner?.context?.guide!=="pius-x"||owner?.context?.scene?.sceneId!==Q322.sceneId||
     scene?.guide!=="pius-x"||scene?.node!=="real-presence"||
     child?.AO_VISIBLE_MASS_HOTSPOT_PILOT?.status?.()?.photoMode!=="still")
   return fail("ORIGINAL_SCENE_NOT_VERIFIED");
  if(busy||owned)return fail("NATIVE_CATECHISM_ALREADY_OPEN");
  const learn=win.AO_LEARN_APP_V1?.status?.();
  if(!learn?.open||learn?.child!=="learn.visible_mass")
   return fail("FORMATION_SCENE_NOT_OWNED");
  if(typeof win.AO_MODULES?.open!=="function")
   return fail("ORIGINAL_CATECHISM_UNAVAILABLE");
  if(win.document.getElementById("ao-cate-root")?.hidden===false)
   return fail("CATECHISM_ALREADY_VISIBLE");
  return success();
 }
 async function open(request){
  const verdict=validate(request);if(!verdict.ok)return verdict;
  busy=true;
  try{
   const opened=await win.AO_MODULES.open("learn.catechism",{});
   lastOpening={stage:"registry",opened,learn:win.AO_LEARN_APP_V1?.status?.()};
   if(!approved(opened))return fail("NATIVE_REGISTRY_REJECTED");
   // The existing 433-question owner, not Living Church, selects the text.
   const {openNativeCatechismQuestion}=await import("./catechism-guided-reader.js");
   const focused=await openNativeCatechismQuestion(win,322,
     win.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"?"fr":"en");
   const node=win.document.getElementById("ao-cate-root");
   lastOpening={stage:"focused",focused,hasNode:!!node,hidden:node?.hidden,learn:win.AO_LEARN_APP_V1?.status?.()};
   if(!focused||!node||node.hidden||!win.AO_TRADITIONAL_CATECHISM)
    return fail("ORIGINAL_Q322_NOT_FOCUSED");
   const host=reviewRoot();if(!host?.contains(frame))return fail("VIEWER_REMOVED");
   savedStyle={visibility:host.style.visibility,pointerEvents:host.style.pointerEvents};
   host.style.visibility="hidden";host.style.pointerEvents="none";
   owned=true;
   parentButton.hidden=false;
   return Object.freeze({ok:true,owner:"AO_TRADITIONAL_CATECHISM",question:322});
  }catch(error){lastOpening={stage:"exception",message:String(error?.message||error)};return fail("NATIVE_CATECHISM_EXCEPTION");}
  finally{
   if(!owned){
    try{win.AO_TRADITIONAL_CATECHISM?.close?.()}catch{}
   }
   busy=false;
  }
 }
 async function restore({routeId,sourceRef}={}){
  if(!owned||busy||routeId!==Q322.routeId||sourceRef!==Q322.sourceRef)
   return fail("INVALID_RETURN");
  busy=true;
  try{
   win.AO_TRADITIONAL_CATECHISM?.close?.();
   const node=win.document.getElementById("ao-cate-root");
   if(node&&!node.hidden)return fail("CATECHISM_STILL_VISIBLE");
   const host=reviewRoot();
   if(!host?.contains(frame))return fail("VIEWER_REMOVED");
   host.style.visibility=savedStyle?.visibility??"";
   host.style.pointerEvents=savedStyle?.pointerEvents??"";
   owned=false;savedStyle=null;parentButton.hidden=true;
   return success();
  }catch{return fail("NATIVE_RETURN_EXCEPTION")}
  finally{busy=false;}
 }
 parentButton.onclick=async()=>{
  if(!owned||busy)return;
  parentButton.disabled=true;
  try{await currentChild()?.AO_LIVING_CHURCH_P2?.returnFromNative?.();}
  finally{parentButton.disabled=false;}
 };
 return Object.freeze({
  api:Object.freeze({version:LIVING_CHURCH_SHELL_BRIDGE_VERSION,
   open,restore,status:()=>Object.freeze({owned,busy,available:!disposed&&enabled(),lastOpening})}),
  status:()=>Object.freeze({owned,busy,returnVisible:!parentButton.hidden}),
  dispose(){
   if(owned)try{win.AO_TRADITIONAL_CATECHISM?.close?.()}catch{}
   const host=reviewRoot();
   if(host&&savedStyle){host.style.visibility=savedStyle.visibility;host.style.pointerEvents=savedStyle.pointerEvents;}
   owned=false;disposed=true;parentButton.remove();
  }
 });
}
