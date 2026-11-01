/** Full-text Choir focus for the existing Holy Name reader.
 * Guided mode continues to use the canonical sequential devotional adapter.
 * Reattach after a rerender, disconnect before replacing the old DOM.
 */
export function installChoirContinuousFocus(mount,{selector=".aoChoirRouteBeat"}={}){
 if(!mount)return ()=>{};
 const rows=[...mount.querySelectorAll(selector)];
 if(rows.length===0)return ()=>{};
 let frame=0,removed=false;
 const win=mount.ownerDocument?.defaultView;
 const usable=()=>rows.filter(x=>x.getClientRects().length);
 function focus(){
  frame=0;if(removed)return;
  const nodes=usable();if(!nodes.length)return;
  const box=mount.getBoundingClientRect();
  const y=box.top+box.height*.40;
  let index=0,best=Infinity;
  nodes.forEach((row,i)=>{
   const rect=row.getBoundingClientRect();
   const center=(rect.top+rect.bottom)/2;
   const dist=Math.abs(center-y);
   if(dist<best){best=dist;index=i}
  });
  nodes.forEach((row,i)=>{
   const value=i===index?"1":i<index?".54":".80";
   row.style.setProperty("--ao-devo-focus",value);
   row.style.setProperty("opacity",value,"important");
   row.dataset.aoDevoActive=i===index?"true":"false";
  });
 }
 const queue=()=>{if(!frame)frame=win?.requestAnimationFrame(focus)||0};
 const select=e=>{
  const el=e.target.closest?.(selector);
  if(!el||!mount.contains(el))return;
  const rect=el.getBoundingClientRect(),box=mount.getBoundingClientRect();
  mount.scrollTop+=rect.top-box.top-box.height*.4;
  queue();
 };
 mount.addEventListener("scroll",queue,true);
 mount.addEventListener("click",select);
 win?.addEventListener("resize",queue,{passive:true});
 queue();
 return ()=>{
  removed=true;mount.removeEventListener("scroll",queue,true);
  mount.removeEventListener("click",select);
  win?.removeEventListener("resize",queue);
  if(frame)win?.cancelAnimationFrame(frame);
 };
}
