// Visible, accessible state for asynchronous MapLibre style / tile loading.
// Map status is independent of place-data readiness and cannot suppress search.
// A slow map may recover: an eventual "load" event always clears the notice.
export function attachExploreMapStatus(container,map,{win=globalThis,waitMs=12000}={}){
  if(!container?.ownerDocument?.createElement || !map)return Object.freeze({
    status:()=> "unavailable",dispose(){},
  });
  const language=win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"?"fr":"en";
  const notice=container.ownerDocument.createElement("div");
  notice.className="aoExploreMapLoading";
  notice.setAttribute("role","status");
  notice.setAttribute("aria-live","polite");
  notice.textContent=language==="fr"?"Chargement du fond de carte…":"Loading map background…";
  container.dataset.aoMapState="loading";
  container.append(notice);
  let state="loading",disposed=false,timer=null;
  const setTimeoutSafe=win?.setTimeout?.bind(win)??setTimeout;
  const clearTimeoutSafe=win?.clearTimeout?.bind(win)??clearTimeout;
  function ready(){
    if(disposed)return;
    state="ready";container.dataset.aoMapState="ready";
    if(timer!==null)clearTimeoutSafe(timer);
    timer=null;notice.remove();
  }
  function stalled(){
    if(disposed||state!=="loading")return;
    state="stalled";container.dataset.aoMapState="stalled";
    // Do not claim missing places: only the third-party basemap is delayed.
    // Existing search/results remain in their own source-owned surface.
    notice.className="aoExploreMapLoading aoExploreMapStalled";
    notice.textContent=language==="fr"
      ?"Le fond de carte tarde à répondre. La recherche et les fiches restent disponibles."
      :"The map background is taking longer than expected. Search and place details remain available.";
  }
  // MapLibre's load event indicates a parsed style; remote raster/vector
  // tiles may still be pending. A premature "ready" hides our status over
  // an empty atlas. Keep the existing mock/non-MapLibre compatibility path.
  const tilesPending=()=>typeof map.areTilesLoaded==="function"
    &&map.areTilesLoaded()!==true;
  const settle=()=>{if(!tilesPending())ready();};
  map.on?.("load",settle);
  map.on?.("idle",settle);
  timer=setTimeoutSafe(stalled,waitMs);
  if(map.loaded?.()===true)settle();
  return Object.freeze({
    status:()=>state,
    dispose(){
      disposed=true;if(timer!==null)clearTimeoutSafe(timer);
      timer=null;notice.remove();
    },
  });
}
