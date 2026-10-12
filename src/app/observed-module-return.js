/** Non-Mass child Back returns to the observed entry, never an invented parent.
 *
 * Keep this independent of canonical Prayer/Formation reader and 1962 Mass
 * state. Only a genuinely open parent can be restored as a parent; all other
 * exits travel through the application shell's canonical navigation.
 */
const SURFACES=new Set(["home","pray","learn","calendar","find","apostolate","settings"]);
export const OBSERVED_MODULE_RETURN_VERSION="nonmass-observed-return-v1";

export function captureObservedModuleOrigin(win=globalThis,domain="pray"){
 const raw=win?.AO_APP_SHELL_V1?.getActive?.();
 const surface=SURFACES.has(raw)?raw:"home";
 const owner=domain==="pray"?win?.AO_PRAY_APP_V1:
  domain==="learn"?win?.AO_LEARN_APP_V1:null;
 let parentStatus=null;
 try{parentStatus=owner?.status?.()??null}catch{}
 const parentVisited=surface===domain&&Boolean(
  parentStatus?.open||parentStatus?.child||
  (domain==="pray"&&parentStatus?.donorState?.open)
 );
 // A stale shell label without an open host is not evidence of a parent
 // the visitor has navigated through.
 return Object.freeze({surface:surface===domain&&!parentVisited?"home":surface,
  domain,parentVisited});
}

export function returnToObservedModuleOrigin(win=globalThis,receipt,{
 close=()=>{},restoreParent=()=>false
}={}){
 const valid=SURFACES.has(receipt?.surface);
 const destination=valid?receipt.surface:"home";
 const parent=receipt?.parentVisited===true&&receipt.domain===destination;
 if(parent){
  try{
   Promise.resolve(restoreParent()).catch(error=>
    win?.console?.error?.("Observed module parent restoration failed",error));
  }catch(error){win?.console?.error?.("Observed module parent restoration failed",error)}
  return true;
 }
 try{close()}catch(error){win?.console?.error?.("Observed module close failed",error)}
 // The shell owns domain teardown and state reconciliation. Do not
 // resurrect older donor home helpers or create a synthetic Prayer hub.
 Promise.resolve().then(()=>win?.AO_APP_SHELL_V1?.navigate?.(destination))
  .catch(error=>win?.console?.error?.("Observed module navigation failed",error));
 return true;
}
