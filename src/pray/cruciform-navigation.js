/**
 * Ad Orientem cruciform navigation — presentation adapter.
 *
 * The Latin crosses do not own Angelus/Regina content, route changes,
 * focus lighting, Incarnation cues, translation or the card gesture system.
 * They only invoke the existing devotional card deck and scroll region.
 * The direction resolver is deliberately independent of the DOM so other
 * page/paragraph readers may use it without importing Angelus records.
 */
import "./cruciform-navigation-styles.js";

export const CRUCIFORM_NAVIGATION_VERSION="angelus-cross-v1";
const ROOT_ID="aoPray435930";

export function crossDirection({dx=0,dy=0,x=34,y=41,width=68,height=82}={}){
  if(Math.max(Math.abs(dx),Math.abs(dy))>=18){
    if(Math.abs(dx)>Math.abs(dy)*1.2)return dx<0?"next":"previous";
    if(Math.abs(dy)>Math.abs(dx)*1.2)return dy<0?"down":"up";
    return null; // ambiguous diagonal drag should not cause a page change
  }
  const armY=height*.39;
  if(Math.abs(y-armY)<height*.16&&Math.abs(x-width/2)>width*.08)
    return x<width/2?"previous":"next";
  return y<armY?"up":"down";
}

function visible(node){
  return !!node&&node.getClientRects().length>0&&!node.closest("[hidden]");
}
function activeContext(doc){
  const root=doc.getElementById(ROOT_ID);
  const mount=root?.querySelector(".aoP435930Mount");
  if(!root?.classList.contains("open")||mount?.dataset.aoPrayView!=="angelus")return null;
  const host=mount.querySelector(".aoP435930AngelusSequence[data-ao-devotional-deck='v1']");
  const deck=host?.__aoDevotionalDeck;
  if(!deck||typeof deck.go!=="function"||typeof deck.current!=="function")return null;
  return {root,mount,host,deck};
}
function paragraphList(body){
  return [...body.querySelectorAll(".aoDevoParagraph")].filter(visible);
}
function moveParagraph(ctx,direction){
  const body=ctx.host.querySelector(".aoDevoCard:not([hidden]) .aoDevoCardScroll");
  if(!body)return false;
  const paragraphs=paragraphList(body);
  if(!paragraphs.length)return false;
  let at=paragraphs.findIndex(node=>node.dataset.aoDevoActive==="true");
  if(at<0){
    const focusY=body.getBoundingClientRect().top+body.clientHeight*.41;
    let distance=Infinity;at=0;
    paragraphs.forEach((node,i)=>{
      const r=node.getBoundingClientRect();
      const d=Math.max(r.top-focusY,0,focusY-r.bottom);
      if(d<distance){distance=d;at=i}
    });
  }
  if(body.scrollTop<2)at=0;
  const targetIndex=at+(direction==="down"?1:-1);
  if(targetIndex<0||targetIndex>=paragraphs.length)return false;
  const target=paragraphs[targetIndex];
  const top=target.getBoundingClientRect().top-body.getBoundingClientRect().top+
    body.scrollTop-body.clientHeight*.41;
  const max=Math.max(0,body.scrollHeight-body.clientHeight);
  const step=Math.max(66,body.clientHeight*.22);
  const proposed=direction==="down"?Math.max(top,body.scrollTop+step):Math.min(top,body.scrollTop-step);
  const next=Math.max(0,Math.min(max,proposed));
  if(Math.abs(next-body.scrollTop)<1)return false;
  const reduced=ctx.root.ownerDocument.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  body.scrollTo({top:next,behavior:reduced?"auto":"smooth"});
  // The devotional reader's scroll listener is the sole source of lit/muted
  // and gesture-cue updates. Never assign a competing focused paragraph here.
  return true;
}
export function moveCruciform(ctx,direction){
  if(!ctx)return false;
  if(direction==="previous"||direction==="next")
    return ctx.deck.go(ctx.deck.current()+(direction==="next"?1:-1));
  if(direction==="up"||direction==="down")return moveParagraph(ctx,direction);
  return false;
}
function crossLabel(doc,side){
  const fr=doc.defaultView?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"||
    String(doc.documentElement.lang||"").toLowerCase().startsWith("fr");
  if(fr)return (side==="left"?"Croix latine gauche":"Croix latine droite")+
    " : activer pour continuer, flèches haut/bas pour le texte, gauche/droite pour les pages";
  return (side==="left"?"Left Latin cross":"Right Latin cross")+
    ": activate to read next, up/down arrows for prayer text, left/right for pages";
}
function makeCross(doc,side){
  const button=doc.createElement("button");
  button.type="button";
  button.className="aoCrossPad";
  button.dataset.aoCrossSide=side;
  button.setAttribute("aria-keyshortcuts","ArrowUp ArrowDown ArrowLeft ArrowRight");
  button.setAttribute("aria-label",crossLabel(doc,side));
  button.innerHTML='<svg class="aoCrossMark" aria-hidden="true" viewBox="0 0 30 46" focusable="false"><path d="M15 4 V43 M5 16 H25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  let start=null;
  button.addEventListener("pointerdown",event=>{
    if(!event.isPrimary||event.button!==0)return;
    const ctx=activeContext(doc);
    const body=ctx?.host.querySelector(".aoDevoCard:not([hidden]) .aoDevoCardScroll");
    start={id:event.pointerId,x:event.clientX,y:event.clientY,
      scrollTop:body?.scrollTop??0,dragging:false};
    button.dataset.aoCrossPressed="true";
    try{button.setPointerCapture(event.pointerId)}catch{}
  });
  button.addEventListener("pointermove",event=>{
    if(!start||event.pointerId!==start.id)return;
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(Math.abs(dy)<12||Math.abs(dy)<Math.abs(dx)*1.15)return;
    const ctx=activeContext(doc);
    const body=ctx?.host.querySelector(".aoDevoCard:not([hidden]) .aoDevoCardScroll");
    if(!body)return;
    start.dragging=true;
    body.scrollTop=start.scrollTop-dy*1.4;
  });
  button.addEventListener("pointercancel",()=>{start=null;delete button.dataset.aoCrossPressed});
  button.addEventListener("pointerup",event=>{
    if(!start||start.id!==event.pointerId)return;
    const x=event.clientX,y=event.clientY;
    const b=button.getBoundingClientRect();
    const direction=crossDirection({dx:x-start.x,dy:y-start.y,
      x:x-b.left,y:y-b.top,width:b.width,height:b.height});
    const dragging=start.dragging;
    start=null;delete button.dataset.aoCrossPressed;
    const ctx=activeContext(doc);
    // A vertical drag already scrolled the same canonical region; don't
    // accidentally advance another paragraph on release.
    if(ctx&&!dragging&&direction)moveCruciform(ctx,direction);
  });
  // Avoid also firing Prayer's delegated horizontal swipe recogniser.
  button.addEventListener("touchstart",e=>e.stopPropagation(),{passive:true});
  button.addEventListener("touchend",e=>e.stopPropagation(),{passive:true});
  button.addEventListener("touchcancel",e=>e.stopPropagation(),{passive:true});
  button.addEventListener("keydown",event=>{
    const actions={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"previous",ArrowRight:"next"};
    const action=actions[event.key];
    if(!action)return;
    event.preventDefault();
    moveCruciform(activeContext(doc),action);
  });
  // Native keyboard and assistive-technology button activation has no
  // pointerup. The zero-detail click avoids duplicate activation on touch.
  button.addEventListener("click",event=>{
    if(event.detail===0)moveCruciform(activeContext(doc),"down");
  });
  return button;
}
function reconcile(doc){
  const ctx=activeContext(doc);
  const old=doc.querySelector("#"+ROOT_ID+" [data-ao-cross-pair]");
  if(!ctx){old?.remove();return}
  if(old&&old.parentElement===ctx.root){
    old.dataset.aoCrossCard=String(ctx.deck.current()+1);
    old.dataset.aoCrossTotal=String(ctx.deck.cards());
    old.querySelectorAll("[data-ao-cross-side]").forEach(b=>{
      b.setAttribute("aria-label",crossLabel(doc,b.dataset.aoCrossSide));
    });
    return;
  }
  old?.remove();
  const pair=doc.createElement("div");
  pair.className="aoCrossPair";
  pair.dataset.aoCrossPair="angelus";
  pair.dataset.aoCrossCard=String(ctx.deck.current()+1);
  pair.dataset.aoCrossTotal=String(ctx.deck.cards());
  pair.append(makeCross(doc,"left"),makeCross(doc,"right"));
  ctx.root.append(pair);
}
/**
 * Installed only after the lazy Prayer owner is mounted. The observer only
 * watches structural changes and card/route state, never text opacity/style:
 * this avoids a feedback loop with the existing 60fps focus renderer.
 */
export function installPrayCruciformNavigation(doc=globalThis.document){
  if(!doc?.documentElement)return false;
  const win=doc.defaultView;
  if(win?.AO_CRUCIFORM_NAV_V1)return win.AO_CRUCIFORM_NAV_V1;
  let frame=0;
  const sync=()=>{
    frame=0;
    reconcile(doc);
  };
  const queue=()=>{
    if(frame)return;
    frame=(win?.requestAnimationFrame||((fn)=>setTimeout(fn,0)))(sync);
  };
  const observer=new MutationObserver(queue);
  observer.observe(doc.documentElement,{
    childList:true,subtree:true,attributes:true,
    attributeFilter:["data-ao-pray-view","aria-hidden","hidden"]
  });
  doc.addEventListener("DOMContentLoaded",queue,{once:true});
  win?.addEventListener("pageshow",queue);
  const api=Object.freeze({version:CRUCIFORM_NAVIGATION_VERSION,bind:queue,
    move:direction=>moveCruciform(activeContext(doc),direction),
    current:()=>activeContext(doc)?.deck.current()??null});
  if(win)win.AO_CRUCIFORM_NAV_V1=api;
  queue();
  return api;
}
if(typeof window!=="undefined"&&typeof document!=="undefined")
  installPrayCruciformNavigation(document);
