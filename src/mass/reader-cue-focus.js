// R17 reader cue focus.
// Geometry-only presentation helper. It never infers cue identity from prayer text.

const CUE_RE=/^AO\.SM\.C\d{4}$/;

export function pickActiveCue({
  scrollTop=0,
  clientHeight=0,
  scrollHeight=0,
  items=[],
  focusRatio=.39,
  edgePx=8,
}={}){
  const usable=(items??[]).filter(item=>CUE_RE.test(String(item?.cueId??"")) && Number.isFinite(item?.top) && Number.isFinite(item?.bottom));
  if(!usable.length)return null;
  const top=Math.max(0,Number(scrollTop)||0);
  const viewport=Math.max(1,Number(clientHeight)||1);
  const extent=Math.max(viewport,Number(scrollHeight)||viewport);

  // Hard ownership at the card edges prevents the old "paragraph 1 has zero territory" defect.
  if(top<=edgePx)return usable[0].cueId;
  if(top>=Math.max(0,extent-viewport-edgePx))return usable[usable.length-1].cueId;

  // Near the opening edge, a fixed 39% focus line would sit below the
  // second/third cue before the card has any room to scroll. Ramp the focus
  // offset into its normal position as scrolling advances; this gives each
  // early source cue real territory without inserting blank lead-in prose.
  const steadyOffset=viewport*Math.min(.7,Math.max(.3,Number(focusRatio)||.46));
  const firstCenter=Math.max(24,(usable[0].top+usable[0].bottom)/2);
  const openingOffset=Math.min(steadyOffset,Math.max(24,firstCenter+top*.8));
  const focus=top+openingOffset;
  let best=usable[0],bestDistance=Infinity;
  for(const item of usable){
    if(focus>=item.top && focus<=item.bottom)return item.cueId;
    const center=(item.top+item.bottom)/2;
    const distance=Math.abs(center-focus);
    if(distance<bestDistance){best=item;bestDistance=distance}
  }
  return best?.cueId??null;
}

export function cueItemsFromScrollContainer(container){
  if(!container?.querySelectorAll)return [];
  const cr=container.getBoundingClientRect?.();
  const scrollTop=Number(container.scrollTop)||0;
  if(!cr)return [];
  const items=[];
  for(const node of container.querySelectorAll(".ao-reader-paragraph[data-cue-id]")){
    const cueId=node.dataset?.cueId;
    if(!CUE_RE.test(String(cueId??"")))continue;
    const nr=node.getBoundingClientRect?.();
    if(!nr)continue;
    items.push(Object.freeze({
      cueId,
      top:nr.top-cr.top+scrollTop,
      bottom:nr.bottom-cr.top+scrollTop,
    }));
  }
  return items;
}

export function activeCueFromScrollContainer(container,options={}){
  return pickActiveCue({
    scrollTop:Number(container?.scrollTop)||0,
    clientHeight:Number(container?.clientHeight)||0,
    scrollHeight:Number(container?.scrollHeight)||0,
    items:cueItemsFromScrollContainer(container),
    ...options,
  });
}

export function markActiveCue(container,cueId){
  if(!container?.querySelectorAll)return;
  for(const node of container.querySelectorAll(".ao-reader-paragraph[data-cue-id]")){
    const active=String(Boolean(cueId && node.dataset.cueId===cueId));
    // The cue tracker may refresh on scroll, resize, and Schola resize.
    // Avoid unnecessary DOM writes / style invalidation at every frame.
    if(node.dataset.active!==active)node.dataset.active=active;
  }
}

/**
 * Visual-only fallback for Proper TEXT lacking a source ceremonial cue.
 * It deliberately never writes data-active, never creates a cue ID, and never
 * calls the priest/faithful/cinematic source-event controller. In a mixed card
 * the existing cue stays authoritative for ritual state; the nearest rendered
 * text owns *only* visual brightness while that uncued passage is being read.
 */
export function markUncuedReadingFocus(container,{focusRatio=.39}={}){
  const body=container?.querySelector?.('[data-role="paragraphs"]');
  if(!body?.querySelectorAll)return null;
  const all=[...body.querySelectorAll(".ao-reader-paragraph")];
  const uncued=all.filter(node=>node.dataset.kind!=="RUBRIC"&&
    !CUE_RE.test(String(node.dataset.cueId||"")));
  if(!uncued.length){
    delete body.dataset.aoVisualFocus;
    return null;
  }
  const rect=container.getBoundingClientRect?.();
  if(!rect)return null;
  const scrollTop=Math.max(0,Number(container.scrollTop)||0);
  const viewport=Math.max(1,Number(container.clientHeight)||1);
  const candidate=all.filter(node=>node.dataset.kind!=="RUBRIC"&&
    node.getBoundingClientRect?.()&&node.getClientRects?.().length>0&&!node.hidden);
  if(!candidate.length)return null;
  const nodes=candidate.map(node=>{
    const r=node.getBoundingClientRect();
    return {node,top:r.top-rect.top+scrollTop,bottom:r.bottom-rect.top+scrollTop};
  });
  const focus=scrollTop+viewport*focusRatio;
  let selected=nodes[0],distance=Infinity;
  if(scrollTop<=2)selected=nodes[0];
  else if(scrollTop>=Math.max(0,Number(container.scrollHeight)-viewport-2))selected=nodes.at(-1);
  else for(const item of nodes){
    const d=focus<item.top?item.top-focus:focus>item.bottom?focus-item.bottom:0;
    if(d<distance){distance=d;selected=item}
  }
  const focused=selected?.node;
  const focusUncued=uncued.includes(focused);
  for(const node of uncued){
    const active=String(focusUncued&&node===focused);
    if(node.dataset.readingActive!==active)node.dataset.readingActive=active;
  }
  if(focusUncued)body.dataset.aoVisualFocus="uncued";
  else delete body.dataset.aoVisualFocus;
  return focusUncued?focused:null;
}

export function installCueFocusTracker({
  container,
  onChange,
  focusRatio=.39,
  win=container?.ownerDocument?.defaultView??globalThis,
}={}){
  if(!container?.addEventListener)throw new TypeError("Scrollable reader card required");
  if(typeof onChange!=="function")throw new TypeError("onChange callback required");
  let current=null,raf=0,destroyed=false,resizeObserver=null;

  function run(){
    raf=0;
    if(destroyed)return current;
    const next=activeCueFromScrollContainer(container,{focusRatio});
    markActiveCue(container,next);
    markUncuedReadingFocus(container,{focusRatio});
    if(next!==current){
      const previous=current;
      current=next;
      onChange(next,previous);
    }
    return current;
  }

  function queue(){
    if(destroyed||raf)return;
    const request=win?.requestAnimationFrame;
    if(typeof request==="function")raf=request.call(win,run);
    else raf=setTimeout(run,0);
  }

  container.addEventListener("scroll",queue,{passive:true});
  const ResizeObserverImpl=win?.ResizeObserver??globalThis.ResizeObserver;
  if(typeof ResizeObserverImpl==="function"){
    resizeObserver=new ResizeObserverImpl(queue);
    resizeObserver.observe(container);
  }
  queue();

  return Object.freeze({
    refresh:queue,
    getCue:()=>current,
    destroy(){
      destroyed=true;
      container.removeEventListener?.("scroll",queue);
      resizeObserver?.disconnect?.();
      if(raf){
        const cancel=win?.cancelAnimationFrame;
        if(typeof cancel==="function")cancel.call(win,raf);
        else clearTimeout(raf);
      }
      raf=0;
    },
  });
}
