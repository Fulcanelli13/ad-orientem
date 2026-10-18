/** Real optional runtime handoff; return only verified success from the owning module. */
const failure = (code,detail='')=>({ok:false,code,detail});
const success = (surface,id)=>({ok:true,surface,id});
export function createAskChurchNativeHandoff(win=globalThis,{survey=null}={}){
 const routes=new Map((survey?.routes||[]).map(x=>[x.id,x]));
 const scenarios=new Set((survey?.apostolateScenarios||[]).filter(x=>x.publicationState==='READY_IN_RUNTIME_SOT').map(x=>x.id));
 let opening=false;
 async function open(targetId){
  const id=String(targetId??'');
  if(id==='learn.apologetics'||id==='learn.church_crisis')return failure('PUBLICATION_HOLD');
  const route=routes.get(id);
  if(!route&&!scenarios.has(id))return failure('UNKNOWN_DESTINATION');
  if(route&&(route.releaseGate==='RESEARCH_ONLY'||/RETIRED|ALIAS|GATED/.test(route.routeStatus)))return failure('INACTIVE_OR_GATED');
  const nav=win?.AO_APP_SHELL_V1?.navigate;
  if(typeof nav!=='function')return failure('NATIVE_SHELL_UNAVAILABLE');
  // Avoid two competing shell transitions when a user double-clicks a destination.
  if(opening)return failure('OPEN_IN_PROGRESS');
  opening=true;
  try{
   if(id.startsWith('apostolate:')){
    const navigated=await nav.call(win.AO_APP_SHELL_V1,'apostolate');
    if(navigated===false||navigated?.ok===false)return failure('NAVIGATION_FAILED');
    const owner=win?.AO_APOSTOLATE_APP_V1;
    if(typeof owner?.open!=='function')return failure('APOSTOLATE_NOT_READY');
    const raw=id.slice('apostolate:'.length);
    const opened=owner.open({scenarioId:raw,practice:false});
    if(opened!==true&&opened?.ok!==true)return failure('APOSTOLATE_OPEN_FAILED');
    if(owner.status?.()?.open===false)return failure('APOSTOLATE_NOT_VISIBLE');
    return success('apostolate',id);
   }
   if(id.startsWith('learn.')){
    const navigated=await nav.call(win.AO_APP_SHELL_V1,'learn');
    if(navigated===false||navigated?.ok===false)return failure('NAVIGATION_FAILED');
    const app=win?.AO_LEARN_APP_V1;
    if(typeof app?.openModule!=='function')return failure('LEARN_NOT_READY');
    // Navigating to Learn must be complete and visible before its native child can open.
    if(app.status?.()?.open===false)return failure('LEARN_HUB_NOT_READY');
    const opened=await app.openModule(id,{returnContext:{surface:'learn',origin:'ask-church'}});
    return opened===true||opened?.ok===true?success('learn',id):failure('LEARN_OPEN_FAILED');
   }
   if(id.startsWith('pray.')||id.startsWith('programme.')){
    const reg=win?.AO_MODULES;
    if(typeof reg?.open!=='function')return failure('PRAY_REGISTRY_NOT_READY');
    const navigated=await nav.call(win.AO_APP_SHELL_V1,'pray');
    if(navigated===false||navigated?.ok===false)return failure('NAVIGATION_FAILED');
    const opened=await win?.AO_MODULES?.open?.(id,{returnContext:{origin:'ask-church'}});
    return opened===true||opened?.ok===true?success('pray',id):failure('PRAY_OPEN_FAILED');
   }
   if(id.startsWith('explore.lens.')){
    const navigated=await nav.call(win.AO_APP_SHELL_V1,'find');
    if(navigated===false||navigated?.ok===false)return failure('NAVIGATION_FAILED');
    // This only opens Explore. It does NOT claim the desired lens is selected.
    return success('find',id);
   }
   if(id==='scripture'){
    const navigated=await nav.call(win.AO_APP_SHELL_V1,'scripture');
    return navigated===false||navigated?.ok===false?failure('NAVIGATION_FAILED'):success('scripture',id);
   }
   return failure('UNSUPPORTED_DESTINATION');
  }catch(err){return failure('RUNTIME_EXCEPTION',String(err?.message||err));}
  finally{opening=false;}
 }
 return Object.freeze({open});
}
