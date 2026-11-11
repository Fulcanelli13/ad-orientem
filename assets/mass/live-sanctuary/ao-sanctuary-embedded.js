/* Ad Orientem source-cue bridge for Claude's ORIGINAL M3 sanctuary.
 * Only active with aoSanctuary=1. No priest or Schola time is inferred.
 * Visual geometry, camera, actors, FX and keyframes remain in index.html.
 */
(() => {
  "use strict";
  if (new URLSearchParams(location.search).get("aoSanctuary")!=="1") return;
  const PROTOCOL="AO_SANCTUARY_CUE_V1",READY="AO_SANCTUARY_READY_V1",
    ACK="AO_SANCTUARY_ACK_V1";
  const clean=value=>String(value??"").normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toLowerCase();
  const alias=Object.freeze({
    "at the foot of the altar · introibo":"C01",
    "gloria · opening":"C07",
    "credo · opening":"C16",
    "requiem · no final blessing":"C63",
    "incensation omitted for this mass":"C24"
  });
  const originals=D.cards.filter(c=>/^C\d{2}$/.test(c.id));
  if(originals.length!==65) return;
  const byId=new Map(D.cards.map(c=>[c.id,c]));
  const byTitle=new Map();
  for(const c of originals){
    for(const title of [c.title,c.title_low].filter(Boolean)){
      const key=clean(title);
      if(byTitle.has(key)&&byTitle.get(key)!==c.id)byTitle.set(key,null);
      else byTitle.set(key,c.id);
    }
  }
  const frame=document.getElementById("pgPlan");
  if(!frame||typeof M3?.show!=="function")return;
  frame.parentNode.removeChild(frame);
  document.body.appendChild(frame);
  document.documentElement.classList.add("ao-sanctuary-iframe");
  const css=document.createElement("style");
  css.textContent=[
    "html.ao-sanctuary-iframe,.ao-sanctuary-iframe body{",
    "margin:0!important;padding:0!important;width:100%!important;",
    "height:100%!important;overflow:hidden!important;background:#0a0c10!important}",
    ".ao-sanctuary-iframe body > :not(#pgPlan){display:none!important}",
    ".ao-sanctuary-iframe #pgPlan{position:fixed!important;inset:0!important;",
    "z-index:1000!important;width:100%!important;height:100%!important;",
    "margin:0!important;padding:0!important;max-width:none!important;",
    "border:0!important;display:block!important;overflow:hidden!important}"
  ].join("");
  document.head.append(css);
  const cues=Object.freeze({
    "AO.SM.C0174":{card:"C36",section:"AO.CARD.015"},
    "AO.SM.C0181":{card:"C38",section:"AO.CARD.016"}
  });
  const forms=Object.freeze({
    LOW:{form:"low",solemn:false,inc:false},
    MISSA_CANTATA_SIMPLE:{form:"sung",solemn:false,inc:false},
    MISSA_CANTATA_INCENSE:{form:"sung",solemn:false,inc:true},
    SOLEMN:{form:"sung",solemn:true,inc:true}
  });
  let last=null;
  // Fortescue, Ceremonies of the Roman Rite Described, ch. XIII §1:
  // at a sung Mass while the celebrant sits, his acolytes STAND at
  // either side of the sedilia. Claude's one-server visual left the
  // server kneeling at the altar. Resolve the demonstrably wrong posture
  // using the existing figure and actor engine, WITHOUT editing the
  // owner's original source HTML or fabricating a new seated pose.
  // Exact two-acolyte/M.C. positions still require O'Connell review.
  const singerSedilia=new Set(["C08","C09","C12","C17","C18","C19"]);
  function stageSungSediliaAcolyte(card){
    if(st.form!=="sung"||st.solemn||!singerSedilia.has(card?.id))return;
    const acolyte=M3.actors?.()?.M;
    if(!acolyte||acolyte.vis!==true)return;
    acolyte.path=null;acolyte.turn=null;
    acolyte.pose="stand";acolyte.prop=null;
    // One acolyte on the sanctuary/altar side of the existing sedile.
    // Final second-acolyte choreography remains on ceremonial hold.
    acolyte.x=3.14;acolyte.z=1.75;acolyte.face=90;
  }
  function quietInactiveElevation(card){
    if(card?.id!=="C36"&&card?.id!=="C38")return;
    // Claude's ORIGINAL static scene leaves its elevation glow lit.
    // In cue-linked LIVE, that visual effect belongs ONLY to the active
    // Consecration rubric, not to the entire card or a Schola timestamp.
    // Clear the original engine's glow billboard without editing its
    // geometry, camera, actors or timed elevation choreography.
    const engine=M3.eng;
    engine?.vp?.classList?.remove?.("elev");
    for(const billboard of engine?.bbs??[])
      if(billboard?.el?.classList?.contains?.("glow"))
        billboard.show=false;
  }
  const ack=(ok,code,extra={})=>({type:ACK,ok,code,...extra});
  function present(message){
    if(message?.type!==PROTOCOL||message.version!==1)
      return ack(false,"INVALID_PROTOCOL");
    if(message.scholaOnly===true)
      return ack(false,"CHOIR_EVENT_NOT_MASS_CUE");
    const form=forms[String(message.form??"").toUpperCase()];
    if(!form)return ack(false,"INVALID_MASS_FORM");
    const title=clean(message.cardTitle);
    const id=alias[title]??byTitle.get(title)??null;
    const card=id?byId.get(id):null;
    if(!card)return ack(false,"UNMATCHED_CANONICAL_CARD",{title:message.cardTitle});
    const sourceSectionId=String(message.sourceSectionId??"");
    // Require a source-owned ordinary/Canon card. A Schola-only event,
    // unidentified prelude or unadjudicated special rite never impersonates
    // one of Claude's numbered Mass scenes.
    if(!/^AO\.(?:CARD|CANON)\.[A-Z0-9.]+$/.test(sourceSectionId))
      return ack(false,"UNVERIFIED_SOURCE_SECTION");
    const cue=String(message.sourceCueId??"");
    const validCue=/^AO\.SM\.C\d{4}$/.test(cue)&&message.certifiedSourceFocus===true;
    const nextKey=id+"|"+form.form+"|"+form.solemn+"|"+form.inc;
    if(st.form!==form.form||Boolean(st.solemn)!==form.solemn||
       Boolean(st.inc)!==form.inc){
      st.form=form.form;st.solemn=form.solemn;st.inc=form.inc;
      rebuild(); // Original engine; its shapes, animations and camera are preserved.
    }
    // A held ceremonial animation must end when its *exact* source cue
    // leaves the reading focus. Otherwise scrolling backwards to an
    // elevation would fail to re-arm it, and stale gesture/lighting FX
    // would survive after the corresponding rubric disappeared.
    const exiting=Boolean(last?.key===nextKey&&last?.playedCue&&
      (cue!==last.playedCue||!validCue||
        sourceSectionId!==last.sourceSectionId));
    if(last?.key!==nextKey||exiting){
      M3.show(card,false); // Original engine cancels pending action keyframes.
      quietInactiveElevation(card);
    }
    const play=Boolean(validCue&&cues[cue]?.card===id&&
      cues[cue]?.section===sourceSectionId&&
      (last?.key!==nextKey||last?.playedCue!==cue));
    if(play)M3.show(card,true);
    stageSungSediliaAcolyte(card);
    last={key:nextKey,card:id,cue,sourceSectionId,
      playedCue:play?cue:exiting?null:last?.key===nextKey?last.playedCue:null};
    return ack(true,"PRESENTED",{card:id,sourceCueId:validCue?cue:null,
      choreography:play?"SOURCE_TRIGGERED":"STATIC_STAGE"});
  }
  window.addEventListener("message",event=>{
    if(event.source!==window.parent||event.origin!==location.origin)return;
    if(event.data?.type!==PROTOCOL)return;
    const result=present(event.data);
    event.source.postMessage(result,event.origin);
  });
  window.AO_SANCTUARY_EMBED_TEST=Object.freeze({
    present,originalCardCount:originals.length,
    getState:()=>Object.freeze({...last,form:st.form,solemn:st.solemn,inc:st.inc}),
    getVisualFx:()=>Object.freeze({
      elevationStage:Boolean(M3.eng?.vp?.classList?.contains?.("elev")),
      elevationGlowVisible:Boolean((M3.eng?.bbs??[]).some(b=>
        b?.el?.classList?.contains?.("glow")&&b.show))
    })
  });
  if(window.parent!==window)
    window.parent.postMessage({type:READY,version:1,originalCards:originals.length},
      location.origin);
})();
