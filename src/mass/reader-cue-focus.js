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
    const next=String(Boolean(cueId && node.dataset.cueId===cueId));
    // Avoid redundant DOM data-active mutations during high-frequency cue refresh.
    if(node.dataset.active!==next)node.dataset.active=next;
  }
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
