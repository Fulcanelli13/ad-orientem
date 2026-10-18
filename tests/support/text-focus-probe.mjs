/**
 * Real DOM/scroll audit used by the Mass and Prayer browser suites.
 * Reads existing presentation ownership only; does not adjust focus states.
 * All coordinates are computed from the rendered scroll container.
 */
export async function probeTextFocus({
  rootSelector,
  scrollSelector,
  paragraphSelector,
  owner="mass",
  label="",
  maxExamples=35
}){
  const root=document.querySelector(rootSelector);
  const scroll=root?.querySelector(scrollSelector);
  const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const shown=node=>{
    if(!node||!node.isConnected||node.closest("[hidden],[aria-hidden=true]"))return false;
    if(!node.getClientRects().length)return false;
    const s=getComputedStyle(node);
    return s.display!=="none"&&s.visibility!=="hidden"&&(node.textContent||"").trim().length>0;
  };
  const res={label,owner,scrollRegion:!!scroll,allText:0,registered:0,
    reached:0,unreachable:[],unowned:[],exempt:[],duplicates:0,
    maxScroll:0,passages:[],initialActive:0,finalActive:0};
  if(!scroll)return res;
  const nodes=[...scroll.querySelectorAll(paragraphSelector)].filter(shown);
  res.allText=nodes.length;
  const validCue=/^AO\.SM\.C\d{4}$/;
  const active=node=>owner==="mass"?node.dataset.active==="true":
    owner==="mass-uncued"?node.dataset.readingActive==="true":
    owner==="legacy"?node.dataset.aoPrayFocus==="active":
      node.dataset.aoDevoActive==="true";
  const eligible=[];
  for(let i=0;i<nodes.length;i++){
    const node=nodes[i],id=node.dataset.cueId||node.dataset.aoDevoParagraph||String(i);
    const entry={ordinal:i,id,kind:node.dataset.kind||null,
      text:(node.textContent||"").trim().replace(/\s+/g," ").slice(0,105)};
    if(owner==="mass"&&!validCue.test(node.dataset.cueId||"")){
      (node.dataset.kind==="RUBRIC"?res.exempt:res.unowned).push(entry);
    }else eligible.push({node,entry});
  }
  res.registered=eligible.length;
  // Content still visible outside the reading-focus controller must not be
  // mistaken for certified coverage. It may be intentional explanatory prose;
  // review rather than auto-promote it into the prayer engine.
  const candidates=owner==="mass"?[]:[...scroll.querySelectorAll("p,li,.aoP435930PrayerProse,.aoTP381TextParagraph")];
  const outside=candidates.filter(shown).filter(node=>
    !node.closest(paragraphSelector)&&!nodes.some(registered=>registered.contains(node)))
    .filter(node=>(node.textContent||"").trim().length>=18);
  res.outsideFocusCount=outside.length;
  res.outsideFocus=outside.slice(0,maxExamples).map(node=>({
    tag:node.tagName,className:String(node.className||"").slice(0,110),
    text:(node.textContent||"").trim().replace(/\s+/g," ").slice(0,105)
  }));
  res.maxScroll=Math.max(0,Math.round(scroll.scrollHeight-scroll.clientHeight));
  const sc=getComputedStyle(scroll),paraBox=scroll.querySelector('[data-role="paragraphs"]');
  const pr=paraBox?.getBoundingClientRect(),sr=scroll.getBoundingClientRect();
  res.geometry={
    clientHeight:scroll.clientHeight,scrollHeight:scroll.scrollHeight,
    paddingBottom:sc.paddingBottom,boxSizing:sc.boxSizing,
    cssTail:sc.getPropertyValue("--ao-short-cue-tail"),
    bodyBottom:pr&&sr?Math.round(pr.bottom-sr.top+scroll.scrollTop):null,
    firstTop:nodes[0]?Math.round(nodes[0].getBoundingClientRect().top-sr.top+scroll.scrollTop):null,
    lastBottom:nodes.at(-1)?Math.round(nodes.at(-1).getBoundingClientRect().bottom-sr.top+scroll.scrollTop):null,
    scrollOverflow:sc.overflowY
  };
  res.initialActive=eligible.filter(x=>active(x.node)).length;
  const seen=new Set(eligible.filter(x=>active(x.node)).map(x=>x.entry.ordinal));
  const original=scroll.scrollTop;
  const clamp=x=>Math.max(0,Math.min(Math.max(0,scroll.scrollHeight-scroll.clientHeight),x));
  for(const {node,entry} of eligible){
    let successful=active(node);
    const rect=node.getBoundingClientRect(),box=scroll.getBoundingClientRect();
    const middle=(rect.top+rect.bottom)/2-box.top+scroll.scrollTop;
    const desired=middle-scroll.clientHeight*(owner==="legacy"?.43:owner==="mass"?.39:.41);
    const max=scroll.scrollHeight-scroll.clientHeight;
    const candidates=[desired,desired-55,desired+55,middle-scroll.clientHeight*.16,
      middle-scroll.clientHeight*.65,0,max];
    for(const candidate of candidates){
      if(successful)break;
      const next=clamp(candidate);
      scroll.scrollTop=next;
      scroll.dispatchEvent(new Event("scroll",{bubbles:true}));
      await frame();
      if(!shown(node))break;
      successful=active(node);
    }
    if(successful)seen.add(entry.ordinal);
    if(res.passages.length<maxExamples)res.passages.push({...entry,reached:successful});
    const simultaneously=eligible.filter(x=>active(x.node)).length;
    if(simultaneously>1)res.duplicates=Math.max(res.duplicates,simultaneously);
  }
  // Exhaustively sample narrow handoff intervals. A 39% focus line can
  // select a short cue for only a few pixels, which a direct jump may skip.
  // This second pass distinguishes genuinely unreachable rows from a coarse
  // probe. It never mutates cue ownership or liturgical state itself.
  const max=Math.max(0,scroll.scrollHeight-scroll.clientHeight);
  if(seen.size<eligible.length&&max>0){
    const step=Math.max(4,Math.ceil(max/320));
    let sweepSteps=0;
    for(let y=0;y<=max+step;y+=step){
      scroll.scrollTop=Math.min(max,y);
      scroll.dispatchEvent(new Event("scroll",{bubbles:true}));
      await frame();
      for(const item of eligible)if(active(item.node))seen.add(item.entry.ordinal);
      sweepSteps++;
      if(seen.size===eligible.length)break;
    }
    res.scrollSweepSteps=sweepSteps;
  }
  // Async source-owned readers (notably the first Seven Words Gospel
  // and historical witness) can replace the card during the audit. Such
  // detached DOM cannot prove a passage unreachable; flag and re-probe the
  // stable rendered owner instead of recording a false text defect.
  res.invalidated=!scroll.isConnected||eligible.some(x=>!x.node.isConnected);
  res.reached=seen.size;
  res.unreachable=eligible.filter(x=>!seen.has(x.entry.ordinal))
   .slice(0,maxExamples).map(x=>({...x.entry,
    maxScroll:Math.round(max)}));
  res.passages=res.passages.map(x=>({...x,reached:seen.has(x.ordinal)}));
  scroll.scrollTop=clamp(original);
  scroll.dispatchEvent(new Event("scroll",{bubbles:true}));
  await frame();
  res.finalActive=eligible.filter(x=>active(x.node)).length;
  // Keep complete totals even when diagnostic examples are capped.
  res.unownedTotal=res.unowned.length;
  res.exemptTotal=res.exempt.length;
  res.unreachableTotal=res.registered-res.reached;
  res.unowned=res.unowned.slice(0,maxExamples);
  res.exempt=res.exempt.slice(0,maxExamples);
  return res;
}
