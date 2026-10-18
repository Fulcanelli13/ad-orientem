/**
 * Give short devotional cards enough physical scroll travel for EVERY
 * registered reading paragraph to reach the 40% focus zone. This is layout
 * only: no source text, prayer order, cue or paragraph height is altered.
 */
export function ensureDevotionalReadingRunway(body,paragraphs,{ratio=.40}={}){
  if(!body?.getBoundingClientRect||!body?.style)return 0;
  const visible=(paragraphs||[]).filter(p=>p?.getClientRects?.().length&&
    !p.closest?.("[hidden],details:not([open])"));
  if(visible.length<2)return 0;
  const viewport=body.clientHeight;
  if(viewport<1)return 0;
  // Starting from the stylesheet every time prevents cumulative padding
  // on translations, card revisits, orientation and responsive resizing.
  body.style.removeProperty("padding-bottom");
  const css=body.ownerDocument?.defaultView?.getComputedStyle?.(body);
  const basePadding=Math.max(0,Number.parseFloat(css?.paddingBottom)||0);
  const box=body.getBoundingClientRect();
  const last=visible.at(-1).getBoundingClientRect();
  const lastCenter=(last.top+last.bottom)/2-box.top+body.scrollTop;
  const lastBottom=last.bottom-box.top+body.scrollTop;
  const neededForLast=Math.max(0,lastCenter-viewport*ratio+20);
  const neededForPassages=Math.min(680,Math.max(72,(visible.length-1)*54));
  const targetTravel=Math.max(neededForLast,neededForPassages);
  // scrollHeight is clamped to clientHeight for a short card. If text +
  // existing padding has not filled the viewport, subtract that hidden
  // deficit before asking for actual scroll movement. Merely adding
  // targetTravel to padding can leave the second line permanently muted.
  const requiredPadding=Math.max(basePadding,viewport+targetTravel-lastBottom);
  const extra=Math.max(0,Math.ceil(requiredPadding-basePadding));
  if(extra)body.style.setProperty("padding-bottom",(basePadding+extra)+"px","important");
  return extra;
}
