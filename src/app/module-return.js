/**
 * Module Back navigation must follow an observed entry surface, not a
 * section's guessed parent. A suspended modular parent is restorable only
 * when that parent actually opened the child.
 */
export const MODULE_RETURN_VERSION="module-return-v1";
const SURFACES=new Set(["home","pray","learn","calendar","find","apostolate","mass","settings"]);
export function captureModuleOrigin(win=globalThis,domain="learn"){
  const active=win?.AO_APP_SHELL_V1?.getActive?.();
  const surface=SURFACES.has(active)?active:"home";
  const parent=domain==="learn"?win?.AO_LEARN_APP_V1:domain==="pray"?win?.AO_PRAY_APP_V1:null;
  const status=parent?.status?.();
  const visited=surface===domain&&Boolean(status?.open||status?.child||
    (domain==="pray"&&status?.donorState?.open));
  return Object.freeze({
    surface:surface===domain&&!visited?"home":surface,
    parentVisited:visited,
    domain
  });
}
export function returnToObservedOrigin(win=globalThis,receipt,{
  close=()=>{},restoreParent=()=>false
}={}){
  const origin=receipt?.surface;
  const parent=receipt?.parentVisited===true&&origin===receipt?.domain;
  // The canonical Formation owner owns an explicitly registered return to a
  // bedside Prayer module or Apostolate scenario. Its child monitor must see
  // the child close and perform that exact return; reopening Formation here
  // would cancel the monitor and strand the user on an unvisited landing.
  const external=parent&&receipt?.domain==="learn"
    ?win?.AO_LEARN_APP_V1?.status?.()?.externalReturn:null;
  close();
  if(external?.surface==="pray"||external?.surface==="apostolate")return true;
  if(parent){
    // Restores the genuinely visited suspended section, preserving its
    // selected family/search. Never synthesise that parent for a deep link.
    Promise.resolve().then(restoreParent).catch(error=>
      win?.console?.error?.("Module parent restoration failed",error));
    return true;
  }
  const destination=SURFACES.has(origin)?origin:"home";
  // Never call a raw donor openHome/restore() fallback; that may create an
  // unvisited intermediate destination. The app shell owns reconciliation.
  Promise.resolve().then(()=>win?.AO_APP_SHELL_V1?.navigate?.(destination))
    .catch(error=>win?.console?.error?.("Module return navigation failed",error));
  return true;
}
