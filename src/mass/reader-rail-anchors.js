/**
 * Exact-source placement for the LIVE Mass icon rails.
 *
 * Icons follow their existing, published AO.SM.C#### paragraph; neither
 * paragraph content nor the independent priest / Schola cue clocks are edited.
 * No nearest-paragraph inference is allowed when a cue is absent.
 */
const SOURCE_CUE=/^AO\.SM\.C\d{4}$/;
const GAP=4,EDGE=7;

export function packSourceCueRail({height=0,items=[]}={}){
  if(!(height>0)||!Array.isArray(items))return Object.freeze([]);
  const visible=items.filter(x=>SOURCE_CUE.test(String(x.cueId||""))&&
    Number.isFinite(x.anchorY)&&Number.isFinite(x.height)&&x.height>0&&
    x.anchorY>=0&&x.anchorY<=height);
  const groups=new Map();
  for(const item of visible){
    const key=String(item.side)+"|"+item.cueId;
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(item);
  }
  const positioned=[];
  for(const [key,list] of groups){
    // When multiple exact-source actions occur on the same line, group
    // their approved icons *around* that one line instead of leaving them
    // in a detached stack at the top of the screen.
    const anchor=list[0].anchorY;
    const extent=list.reduce((a,x)=>a+x.height,0)+GAP*(list.length-1);
    if(extent>height-2*EDGE)continue;
    let start=Math.max(EDGE,Math.min(height-EDGE-extent,anchor-extent/2));
    for(const item of list){
      positioned.push({id:item.id,side:item.side,cueId:item.cueId,
        top:start,anchorY:anchor,height:item.height});
      start+=item.height+GAP;
    }
  }
  // Two *different* source cues may occur close together, especially in
  // short responses. Preserve source association and avoid fake double-art.
  // If they cannot fit without moving one icon > 56px from its own source
  // line, omit the colliding lower-priority tile; the top ribbon survives.
  const results=[];
  for(const side of ["left","right"]){
    const sideItems=positioned.filter(x=>x.side===side).sort((a,b)=>a.top-b.top);
    for(const item of sideItems){
      const end=results.filter(x=>x.side===side).at(-1);
      let top=Math.max(item.top,end?end.top+end.height+GAP:EDGE);
      if(top+item.height>height-EDGE||Math.abs(top+item.height/2-item.anchorY)>65)
        continue;
      results.push(Object.freeze({...item,top}));
    }
  }
  return Object.freeze(results);
}

export function anchorRailToSourceParagraphs(root,{cueByChannel={}}={}){
  const shell=root?.querySelector?.("[data-ao-reader-shell]");
  const stage=root?.querySelector?.(".ao-reader-stage");
  const scroll=stage?.querySelector?.(".ao-prayer-card");
  const body=scroll?.querySelector?.('[data-role="paragraphs"]');
  if(!stage||!scroll||!body||shell?.dataset?.mode!=="LIVE")return [];
  const win=root.ownerDocument?.defaultView;
  const sr=stage.getBoundingClientRect();
  if(!sr?.height)return [];
  const rows=[...body.querySelectorAll(".ao-reader-paragraph")];
  const byCue=new Map();
  for(const row of rows){
    if(row.hidden||!row.getClientRects?.().length||
      row.closest?.("[hidden],[aria-hidden=true]"))continue;
    const ids=[row.dataset.cueId,...String(row.dataset.sourceCueIds||"").split(/\s+/)];
    for(const id of ids){
      if(SOURCE_CUE.test(String(id||""))&&!byCue.has(id))byCue.set(id,row);
    }
  }
  const items=[];
  const candidates=[...stage.querySelectorAll(".ao-rail .ao-rail-item")];
  for(const [index,tile] of candidates.entries()){
    tile.style?.removeProperty("--ao-source-rail-top");
    const side=tile.closest?.(".ao-rail-left")?"left":"right";
    const channel=tile.dataset.channel;
    const cueId=cueByChannel[channel]??null;
    tile.dataset.sourceRailCueId=SOURCE_CUE.test(String(cueId||""))?cueId:"";
    let state="inactive";
    if(tile.dataset.active==="true"&&tile.dataset.iconVisible==="true"){
      const row=byCue.get(cueId);
      state=row?"offscreen":"unresolved";
      if(row){
        const primary=row.querySelector?.(".ao-line-primary");
        const reference=primary||row;
        const rect=reference.getBoundingClientRect();
        const line=Number.parseFloat(win?.getComputedStyle?.(reference)?.lineHeight)||28;
        // Attach to the *first textual baseline*, not the centre of a
        // potentially hundred-line Gospel or the top of the entire card.
        const anchorY=rect.top-sr.top+Math.min(23,Math.max(9,line/2));
        if(anchorY>=0&&anchorY<=sr.height)
          items.push({id:index,side,cueId,anchorY,
            height:tile.offsetHeight||Number.parseFloat(win?.getComputedStyle?.(tile)?.height)||48});
      }
    }
    tile.dataset.sourceRailAnchor=state;
  }
  const packed=packSourceCueRail({height:sr.height,items});
  const placed=new Map(packed.map(x=>[x.id,x]));
  for(const [i,tile] of candidates.entries()){
    const placement=placed.get(i);
    if(placement){
      tile.style.setProperty("--ao-source-rail-top",placement.top+"px");
      tile.dataset.sourceRailAnchor="exact";
      tile.dataset.sourceRailOffset=String(Math.round(
        placement.top+placement.height/2-placement.anchorY));
    }else{
      tile.dataset.sourceRailOffset="";
    }
  }
  for(const [side,selector] of [["left",".ao-rail-left"],["right",".ao-rail-right"]]){
    const rail=stage.querySelector(selector);
    if(!rail)continue;
    const shown=candidates.some(t=>t.closest(selector) &&
      t.dataset.sourceRailAnchor==="exact");
    rail.dataset.visible=String(shown);
    rail.dataset.sourceAnchored="true";
    stage.dataset[side==="left"?"leftRail":"rightRail"]=String(shown);
  }
  return packed;
}

export function installSourceCueRailTracker(root,{getCueByChannel}={}){
  const win=root?.ownerDocument?.defaultView;
  const stage=root?.querySelector?.(".ao-reader-stage");
  const scroll=stage?.querySelector?.(".ao-prayer-card");
  const body=scroll?.querySelector?.('[data-role="paragraphs"]');
  if(!stage||!scroll||!win)return Object.freeze({refresh:()=>{},destroy:()=>{}});
  let frame=0,disposed=false;
  const update=()=>{
    frame=0;
    if(!disposed)anchorRailToSourceParagraphs(root,{
      cueByChannel:typeof getCueByChannel==="function"?getCueByChannel():{},
    });
  };
  const refresh=()=>{
    if(disposed||frame)return;
    frame=win.requestAnimationFrame(update);
  };
  scroll.addEventListener("scroll",refresh,{passive:true});
  win.addEventListener("resize",refresh,{passive:true});
  const RO=win.ResizeObserver;
  const resize=typeof RO==="function"?new RO(refresh):null;
  if(resize){resize.observe(scroll);if(body)resize.observe(body);}
  const MO=win.MutationObserver;
  const mutation=typeof MO==="function"?new MO(refresh):null;
  if(mutation&&body)mutation.observe(body,{childList:true,subtree:true,characterData:true});
  refresh();
  return Object.freeze({
    refresh,
    destroy(){
      disposed=true;
      if(frame)win.cancelAnimationFrame(frame);
      frame=0;
      mutation?.disconnect();
      resize?.disconnect();
      scroll.removeEventListener("scroll",refresh);
      win.removeEventListener("resize",refresh);
    },
  });
}
