/**
 * Non-ceremonial reading illumination for source-owned distinct rites:
 * Good Friday (R28) and Easter Vigil (R33).
 *
 * This adapter NEVER writes data-active, data-cue-id, source IDs, posture,
 * gestures or ritual stage. It is only a visual reading-location annotation.
 * Source controllers and their word-specific ceremonial transitions remain
 * sole owners of state.
 */
const CSS=String.raw`
#ao-r17-native-reader-preview[data-ao-distinct-reading-focus="1"] .ao-prayer-body .ao-reader-paragraph[data-ao-distinct-reading-active="true"]{
 opacity:1!important;
 color:var(--ao-text,#f3efe4);
}
#ao-r17-native-reader-preview[data-ao-distinct-reading-focus="1"] .ao-prayer-body .ao-reader-paragraph[data-ao-distinct-reading-active="false"]{
 opacity:var(--ao-distinct-reading-opacity,.25)!important;
}
#ao-r17-native-reader-preview[data-ao-distinct-reading-focus="1"] .ao-prayer-body[data-ao-distinct-reading-runway="true"]{
 min-height:calc(100% + var(--ao-distinct-reading-travel,72px));
}
@media(prefers-reduced-motion:reduce){
 #ao-r17-native-reader-preview[data-ao-distinct-reading-focus="1"] .ao-reader-paragraph{
  transition:none!important;
 }
}
`;
const kindExempt=node=>node.dataset.kind==="RUBRIC"||node.hidden||
  !node.getClientRects?.().length||!!node.closest?.("[hidden]");
function visibleRows(body){
 return [...body.querySelectorAll(".ao-reader-paragraph")].filter(x=>!kindExempt(x));
}
export function distinctReadingIndex(scroll,rows){
 if(!scroll||!rows.length)return -1;
 const y=Math.max(0,scroll.scrollTop||0),viewport=Math.max(1,scroll.clientHeight||1);
 const max=Math.max(0,scroll.scrollHeight-viewport);
 if(y<=2)return 0;
 if(y>=Math.max(3,max-2))return rows.length-1;
 const sr=scroll.getBoundingClientRect();
 const items=rows.map(node=>{
  const r=node.getBoundingClientRect();
  return {top:r.top-sr.top+y,bottom:r.bottom-sr.top+y};
 });
 const first=(items[0].top+items[0].bottom)/2;
 const offset=Math.min(viewport*.39,Math.max(24,first+y*.8));
 const focus=y+offset;
 let index=0,best=Infinity;
 items.forEach((p,i)=>{
  const distance=focus<p.top?p.top-focus:focus>p.bottom?focus-p.bottom:0;
  if(distance<best){best=distance;index=i}
 });
 return index;
}

export function installDistinctRiteReadingFocus(root,{mode="LIVE"}={}){
 if(!root?.querySelector||!["LIVE","SIMPLE"].includes(mode))return ()=>{};
 const doc=root.ownerDocument,win=doc?.defaultView;
 if(!doc||!win)return ()=>{};
 if(!doc.getElementById("ao-distinct-reading-focus-style")){
  const style=doc.createElement("style");
  style.id="ao-distinct-reading-focus-style";
  style.textContent=CSS;
  (doc.head||doc.documentElement).append(style);
 }
 root.dataset.aoDistinctReadingFocus="1";
 let scroll=null,frame=0,disposed=false,lastBody=null,lastLength=0;
 const update=()=>{
  frame=0;
  if(disposed||!root.isConnected)return;
  const current=root.querySelector(".ao-prayer-card");
  if(current!==scroll){
   scroll?.removeEventListener("scroll",queue);
   scroll=current;
   scroll?.addEventListener("scroll",queue,{passive:true});
   lastBody=null;lastLength=0;
  }
  const body=scroll?.querySelector('[data-role="paragraphs"]');
  if(!body)return;
  const all=[...body.querySelectorAll(".ao-reader-paragraph")];
  const rows=visibleRows(body);
  if(body!==lastBody||lastLength!==rows.length){
   lastBody=body;lastLength=rows.length;
   if(rows.length>=2){
    body.dataset.aoDistinctReadingRunway="true";
    body.style.setProperty("--ao-distinct-reading-travel",
      Math.min(2400,Math.max(72,(rows.length-1)*54))+"px");
   }else{
    delete body.dataset.aoDistinctReadingRunway;
    body.style.removeProperty("--ao-distinct-reading-travel");
   }
  }
  if(!rows.length)return;
  const at=distinctReadingIndex(scroll,rows);
  for(const [i,node] of rows.entries()){
   const strength=i===at?"1":Math.abs(i-at)===1?".42":".22";
   node.dataset.aoDistinctReadingActive=String(i===at);
   node.style.setProperty("--ao-distinct-reading-opacity",strength);
   // The native Mass reader already assigns opacity inline with !important.
   // Equal-priority inline styling is required: a scoped stylesheet alone
   // does not supersede that existing reading-surface declaration.
   node.style.setProperty("opacity",strength,"important");
  }
  // A previously visible row may have become an exempt rubric or hidden
  // translation face. Never leave stale dimming on it.
  for(const node of all)if(!rows.includes(node))delete node.dataset.aoDistinctReadingActive;
 };
 const queue=()=>{
  if(disposed||frame)return;
  frame=win.requestAnimationFrame(update);
 };
 const observer=new win.MutationObserver(queue);
 observer.observe(root,{childList:true,subtree:true});
 win.addEventListener("resize",queue,{passive:true});
 queue();
 return ()=>{
  disposed=true;
  observer.disconnect();
  win.removeEventListener("resize",queue);
  scroll?.removeEventListener("scroll",queue);
  if(frame)win.cancelAnimationFrame(frame);
  delete root.dataset.aoDistinctReadingFocus;
 };
}
