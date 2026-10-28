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
 * Reader illumination is independent of source-event focus.
 * Every visible prayer paragraph (including uncued Propers) participates
 * in the SAME visual ordering. Only the ceremonial tracker writes data-active
 * or advances priest/faithful events.
 *
 * At the first scroll position the opening paragraph retains ownership.
 * Thereafter the reading line approaches 39% viewport depth gradually;
 * this avoids jumping past short opening responses on the first finger swipe.
 */
export function pickReadingParagraph({
  scrollTop=0,clientHeight=0,scrollHeight=0,items=[],focusRatio=.39
}={}){
  const usable=(items??[]).filter(item=>
    Number.isFinite(item?.top)&&Number.isFinite(item?.bottom)&&item.bottom>=item.top);
  if(!usable.length)return null;
  const top=Math.max(0,Number(scrollTop)||0);
  const viewport=Math.max(1,Number(clientHeight)||1);
  const extent=Math.max(viewport,Number(scrollHeight)||viewport);
  if(top<=2)return usable[0];
  if(top>=Math.max(0,extent-viewport-2))return usable[usable.length-1];

  const ratio=Math.min(.7,Math.max(.3,Number(focusRatio)||.39));
  const steadyOffset=viewport*ratio;
  const firstCenter=Math.max(24,(usable[0].top+usable[0].bottom)/2);
  const offset=Math.min(steadyOffset,Math.max(24,firstCenter+top*.8));
  const focus=top+offset;
  let selected=usable[0],bestDistance=Infinity;
  for(const item of usable){
    // A long prayer remains lit while the reading line is within it.
    if(focus>=item.top&&focus<=item.bottom)return item;
    // In inter-paragraph whitespace, measure distance to the *nearest edge*
    // rather than the middle of a long prayer. Centre-distance favoured long
    // adjacent paragraphs and could erase a short response's focus interval.
    const distance=focus<item.top?item.top-focus:focus-item.bottom;
    if(distance<bestDistance){selected=item;bestDistance=distance}
  }
  return selected;
}

/**
 * Maintains exactly one visual reading focus across cued AND uncued text.
 * Retains the established return contract for uncued Proper inspection.
 * No invented cue IDs; data-active/source state remains untouched.
 */
export function markUncuedReadingFocus(container,{focusRatio=.39}={}){
  const body=container?.querySelector?.('[data-role="paragraphs"]');
  if(!body?.querySelectorAll)return null;
  const all=[...body.querySelectorAll(".ao-reader-paragraph")];
  const candidate=all.filter(node=>node.dataset.kind!=="RUBRIC"&&
    node.getBoundingClientRect?.()&&node.getClientRects?.().length>0&&!node.hidden&&
    !node.closest?.("[hidden],[aria-hidden=true]")&&
    (typeof node.textContent!=="string"||node.textContent.trim().length>0));
  if(!candidate.length){
    for(const node of all)if(node.dataset.readingActive==="true")node.dataset.readingActive="false";
    delete body.dataset.aoVisualFocus;
    return null;
  }
  const rect=container.getBoundingClientRect?.();
  if(!rect)return null;
  const top=Math.max(0,Number(container.scrollTop)||0);
  const nodes=candidate.map(node=>{
    const r=node.getBoundingClientRect();
    return {node,top:r.top-rect.top+top,bottom:r.bottom-rect.top+top};
  });
  const selected=pickReadingParagraph({
    scrollTop:top,clientHeight:Number(container.clientHeight)||0,
    scrollHeight:Number(container.scrollHeight)||0,items:nodes,focusRatio
  });
  const focused=selected?.node??null;
  const selectedIndex=candidate.indexOf(focused);
  for(const node of all){
    const index=candidate.indexOf(node);
    const position=index<0?"rubric":index===selectedIndex?"current":
      index===selectedIndex+1?"next":index===selectedIndex-1?"previous":"distant";
    const active=String(position==="current");
    if(node.dataset.readingActive!==active)node.dataset.readingActive=active;
    if(node.dataset.readingPosition!==position)node.dataset.readingPosition=position;
  }
  const uncued=Boolean(focused&&!CUE_RE.test(String(focused.dataset.cueId||"")));
  if(uncued)body.dataset.aoVisualFocus="uncued";
  else delete body.dataset.aoVisualFocus;
  return uncued?focused:null;
}

export function installCueFocusTracker({
  container,
  onChange,
  focusRatio=.39,
  win=container?.ownerDocument?.defaultView??globalThis,
}={}){
  if(!container?.addEventListener)throw new TypeError("Scrollable reader card required");
  if(typeof onChange!=="function")throw new TypeError("onChange callback required");
  let current=null,raf=0,destroyed=false,resizeObserver=null,mutationObserver=null;

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
    const body=container.querySelector?.('[data-role="paragraphs"]');
    if(body)resizeObserver.observe(body);
  }
  // A Proper translation, source paragraph, or Schola-sized stage can change
  // geometry without changing the scroller box itself. Watch *content* only;
  // never watch the data-active/data-reading-* attributes this tracker writes.
  const MutationObserverImpl=win?.MutationObserver??globalThis.MutationObserver;
  if(typeof MutationObserverImpl==="function"){
    mutationObserver=new MutationObserverImpl(queue);
    mutationObserver.observe(container,{childList:true,subtree:true,characterData:true});
  }
  queue();

  return Object.freeze({
    refresh:queue,
    getCue:()=>current,
    destroy(){
      destroyed=true;
      container.removeEventListener?.("scroll",queue);
      resizeObserver?.disconnect?.();
      mutationObserver?.disconnect?.();
      if(raf){
        const cancel=win?.cancelAnimationFrame;
        if(typeof cancel==="function")cancel.call(win,raf);
        else clearTimeout(raf);
      }
      raf=0;
    },
  });
}
