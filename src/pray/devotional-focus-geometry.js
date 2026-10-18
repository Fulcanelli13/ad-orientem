/**
 * Presentation geometry only. The host devotional card or sequence remains
 * the sole owner of active paragraph, cues and onFocus callbacks.
 *
 * An unconditional 40% viewport focus line starts beneath the first several
 * short versicles; when scrolling begins it can jump directly from paragraph
 * 1 to paragraph 4. Ramp into the normal focus line as reading advances.
 */
export function devotionalFocusIndex(body,paragraphs,{ratio=.40}={}){
  if(!body?.getBoundingClientRect||!paragraphs?.length)return -1;
  const scrollTop=Math.max(0,Number(body.scrollTop)||0);
  const viewport=Math.max(1,Number(body.clientHeight)||1);
  const maxScroll=Math.max(0,Number(body.scrollHeight)||0)-viewport;
  if(scrollTop<=2)return 0;
  if(scrollTop>=Math.max(3,maxScroll-2))return paragraphs.length-1;
  const root=body.getBoundingClientRect();
  const items=paragraphs.map(node=>{
    const r=node.getBoundingClientRect();
    return {top:r.top-root.top+scrollTop,bottom:r.bottom-root.top+scrollTop};
  });
  const first=items[0];
  const firstCenter=Math.max(24,(first.top+first.bottom)/2);
  const steady=viewport*ratio;
  const openingOffset=Math.min(steady,Math.max(24,firstCenter+scrollTop*.8));
  const focus=scrollTop+openingOffset;
  let selected=0,best=Infinity;
  items.forEach((item,i)=>{
    const distance=focus<item.top?item.top-focus:
      focus>item.bottom?focus-item.bottom:0;
    if(distance<best){best=distance;selected=i}
  });
  return selected;
}
