/* Ad Orientem source-cue bridge for Claude's ORIGINAL M3 sanctuary.
 * Only active with aoSanctuary=1. No priest or Schola time is inferred.
 * Visual geometry, camera, actors, FX and keyframes remain in index.html.
 */
(() => {
  "use strict";
  if (new URLSearchParams(location.search).get("aoSanctuary")!=="1") return;
  const PROTOCOL="AO_SANCTUARY_CUE_V1",READY="AO_SANCTUARY_READY_V1",
    CLEAR="AO_SANCTUARY_CLEAR_V1",ACK="AO_SANCTUARY_ACK_V1";
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
    // Source-owned OFFERTORY ACTION, not the independent Schola Proper:
    // C0120 blesses incense; C0121 begins the actual incensation of
    // the offerings; C0122 continues at cross/altar. The original C24
    // sequence is illustrative and does not report observed priest timing.
    // No incense at Low or simple Missa Cantata.
    "AO.SM.C0121":{card:"C24",section:"AO.CARD.010",
      forms:["MISSA_CANTATA_INCENSE","SOLEMN"],
      continuation:["AO.SM.C0122","AO.SM.C0123","AO.SM.C0124"]},
    "AO.SM.C0174":{card:"C36",section:"AO.CARD.015"},
    "AO.SM.C0181":{card:"C38",section:"AO.CARD.016"}
    // Do NOT attach C13 transfer to C0081: source specifies the priest
    // arriving at the Gospel book, not the server's earlier movement;
    // Solemn C0081 is deacon-led Gospel preparation.
    // Do NOT attach C57 walk to C0246: distribution is already at the rail.
    // Both need independently source-owned non-text movement events.
  });
  const forms=Object.freeze({
    LOW:{form:"low",solemn:false,inc:false},
    MISSA_CANTATA_SIMPLE:{form:"sung",solemn:false,inc:false},
    MISSA_CANTATA_INCENSE:{form:"sung",solemn:false,inc:true},
    SOLEMN:{form:"sung",solemn:true,inc:true}
  });
  let last=null,aspergesSprinklingSeen=false;
  // Exact stage identity from the existing R20 five-card Asperges reader.
  // P1 lies OUTSIDE the Mass's 65 cards; never insert it in the Mass sequence.
  const aspergesRecords=Object.freeze({
    "ASP-R01":["ASP-010"],"ASP-R02":["ASP-020","ASP-030"],
    "ASP-R03":["ASP-040"],"ASP-R04":["ASP-050"],"ASP-R05":["ASP-060"]
  });
  const recordsEqual=(a,b)=>Array.isArray(a)&&a.length===b.length&&
    a.every((x,i)=>x===b[i]);
  // Source-owned decoration of the unmodified original priest figure.
  // A brief water gesture is shown only if the faithful explicitly reports
  // actual sprinkling. It is not inferred from Asperges/Vidi aquam music.
  css.textContent += [
    ".ao-sanctuary-asp-water{position:absolute;left:53%;top:25%;",
    "width:50px;height:48px;pointer-events:none;z-index:6}",
    ".ao-sanctuary-asp-water i{position:absolute;left:2px;top:20px;",
    "width:4px;height:7px;border-radius:60% 60% 65% 65%;",
    "background:rgba(164,220,245,.92);transform:rotate(38deg);",
    "animation:ao-asp-water 1.45s ease-out both}",
    ".ao-sanctuary-asp-water i:nth-child(2){animation-delay:.11s;top:15px}",
    ".ao-sanctuary-asp-water i:nth-child(3){animation-delay:.22s;top:24px}",
    "@keyframes ao-asp-water{0%{opacity:0;transform:translate(0,0) scale(.5)}",
    "18%{opacity:1}100%{opacity:0;transform:translate(43px,24px) scale(.8)}}"
  ].join("");
  function showObservedSprinkle(activate){
    const priest=M3.actors?.()?.P;
    const el=priest?.b?.el;
    const existing=el?.querySelector?.(".ao-sanctuary-asp-water");
    if(!activate){existing?.remove?.();return Boolean(existing)}
    if(!el||existing||!document?.createElement)return false;
    const spray=document.createElement("span");
    spray.className="ao-sanctuary-asp-water";
    spray.setAttribute("aria-hidden","true");
    for(let i=0;i<3;i++)spray.appendChild(document.createElement("i"));
    el.appendChild(spray);
    return true;
  }
  function presentAsperges(message){
    if(message.scholaOnly===true)return ack(false,"CHOIR_EVENT_NOT_MASS_CUE");
    const form=forms[String(message.form??"").toUpperCase()];
    if(!form||form.form!=="sung")return ack(false,"ASPERGES_SUNG_FORM_REQUIRED");
    const stage=String(message.riteStageId??"");
    const required=aspergesRecords[stage];
    if(!required||!recordsEqual(message.sourceRecordIds,required))
      return ack(false,"ASPERGES_NATIVE_STAGE_SOURCE_REQUIRED");
    const observed=message.observedSprinkled===true;
    if(observed&&stage!=="ASP-R03")
      return ack(false,"PERSONAL_SPRINKLING_STAGE_REQUIRED");
    const card=byId.get("P1");
    if(!card)return ack(false,"ORIGINAL_ASPERGES_MISSING");
    const key="P1|"+stage+"|"+form.form+"|"+form.solemn+"|"+form.inc;
    if(st.form!==form.form||Boolean(st.solemn)!==form.solemn||
       Boolean(st.inc)!==form.inc){
      st.form=form.form;st.solemn=form.solemn;st.inc=form.inc;
      rebuild();
    }
    if(last?.key!==key){
      M3.show(card,false); // no timed, unsourced original aisle walk
      showObservedSprinkle(false);
      if(stage==="ASP-R03"||stage==="ASP-R04"){
        const priest=M3.actors?.()?.P;
        if(priest)priest.pose="stand";
      }
    }
    const newObservation=observed&&!aspergesSprinklingSeen;
    if(newObservation){
      aspergesSprinklingSeen=true;
      showObservedSprinkle(true);
    }
    last={key,card:"P1",riteStageId:stage,aspergesObserved:observed,
      cue:null,sourceSectionId:null,playedCue:null};
    return ack(true,"PRESENTED",{card:"P1",riteStageId:stage,
      choreography:"STATIC_STAGE",sprinkling:newObservation?
        "EXPLICIT_PERSONAL_OBSERVATION":"NONE"});
  }

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
  function stageSolemnGospel(card,requiem,form,sectionId){
    if(card?.id!=="C14"||!form.solemn||sectionId!=="AO.CARD.007")return;
    const actors=M3.actors?.();
    if(!actors)return;
    // Ritus VI.5, source-checked research MR62.SOL.B02.008:
    // During the ordinary Solemn Gospel the SUBDEACON holds the book
    // between candlebearers; the DEACON proclaims. Claude's original
    // C14 assigns the book to the deacon instead. Transfer only the
    // existing prop; the original actor geometry and camera remain.
    if(actors.D)actors.D.prop=null;
    if(actors.S)actors.S.prop=requiem?null:"book";
    if(!requiem)return;
    // Ritus XIII.2, source-checked MR62.SOL.B02.064/.065:
    // At a Solemn Requiem NO thurifer/candles, but TWO acolytes remain
    // and support the Gospel book. The previous adapter incorrectly
    // hid those acolytes entirely. Keep both original figures visible,
    // remove their torches, and show ONE book prop as an approximate
    // visual proxy for the jointly supported book. Final shared-book
    // pose/coordinates remain for the O'Connell choreography audit.
    const thurifer=actors.T;
    if(thurifer){
      thurifer.path=null;thurifer.turn=null;thurifer.prop=null;
      thurifer.vis=false;
    }
    for(const id of ["A1","A2"]){
      const acolyte=actors[id];
      if(!acolyte)continue;
      acolyte.path=null;acolyte.turn=null;acolyte.vis=true;
      acolyte.pose="stand";
      acolyte.prop=id==="A1"?"book":null;
    }
  }
  // The original C36/C38 priest-elevation cinematic is retained.
  // The source-checked 1962 minister records distinguish the incense
  // actor by rite: VIII.8 thurifer in ordinary Solemn Mass
  // (MR62.SOL.B02.045/.046), XIII.2 subdeacon in Solemn Requiem
  // (MR62.SOL.B02.047/.048). The research records are PREVIEW evidence,
  // not a source for an observed minister clock or certified coordinates.
  css.textContent += [
    ".ao-sanctuary-iframe .bb.ao-source-elevation-incense .thur{",
    "animation:swing2 .7s ease-in-out 3!important}"
  ].join("");
  function clearElevationMinisterIncense(){
    for(const id of ["T","S"])
      M3.actors?.()?.[id]?.b?.el?.classList?.remove?.("ao-source-elevation-incense");
  }
  function stageSolemnElevation({card,form,requiem,sourceSectionId,cue,validCue}){
    const originalSource=card?.id==="C36"
      ?{cue:"AO.SM.C0174",section:"AO.CARD.015"}
      :card?.id==="C38"
        ?{cue:"AO.SM.C0181",section:"AO.CARD.016"}:null;
    const active=Boolean(form.solemn&&validCue&&originalSource&&
      cue===originalSource.cue&&sourceSectionId===originalSource.section);
    const actorId=active?(requiem?"S":"T"):null;
    if(!actorId){
      clearElevationMinisterIncense();
      return null;
    }
    const actor=M3.actors?.()?.[actorId];
    if(!actor){clearElevationMinisterIncense();return null}
    const fresh=last?.elevationActor!==actorId||last?.elevationCue!==cue||
      last?.key?.endsWith(requiem?"|ORDINARY":"|REQUIEM");
    if(fresh)clearElevationMinisterIncense();
    actor.path=null;actor.turn=null;
    actor.vis=true;actor.pose="kneel";actor.prop="thurible";
    if(requiem){
      // Illustrative Epistle-side position (x positive in original M3).
      // 1962 XIII.2 requires the location, but not these coordinates.
      actor.x=1.5;actor.z=1.35;actor.face=0;
    }else{
      // Original altar's kneeling thurifer, without replacing the priest.
      actor.x=.85;actor.z=2.05;actor.face=0;
    }
    if(fresh)actor.b?.el?.classList?.add?.("ao-source-elevation-incense");
    return actorId;
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
  function clear(){
    // The iframe remains mounted when switching to MISSAL: merely hiding
    // the viewport does not cancel the owner's original timed keyframes.
    // A valid clear restores the last card's still frame, removes elevation
    // lighting and disarms the action for a later LIVE re-entry.
    if(last?.card){
      const current=byId.get(last.card);
      if(current){M3.show(current,false);quietInactiveElevation(current)}
    }
    showObservedSprinkle(false);
    clearElevationMinisterIncense();
    aspergesSprinklingSeen=false;
    last=null;
    return ack(true,"SOURCE_VISUAL_CLEARED");
  }
  function present(message){
    if(message?.type!==PROTOCOL||message.version!==1)
      return ack(false,"INVALID_PROTOCOL");
    if(message.scholaOnly===true)
      return ack(false,"CHOIR_EVENT_NOT_MASS_CUE");
    if(message.sourceRiteId==="ASPERGES")return presentAsperges(message);
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
    const requiem=message.requiem===true;
    const nextKey=id+"|"+form.form+"|"+form.solemn+"|"+form.inc+
      "|"+(requiem?"REQUIEM":"ORDINARY");
    if(last?.card==="P1"){
      showObservedSprinkle(false);
      aspergesSprinklingSeen=false;
    }
    if(st.form!==form.form||Boolean(st.solemn)!==form.solemn||
       Boolean(st.inc)!==form.inc){
      st.form=form.form;st.solemn=form.solemn;st.inc=form.inc;
      rebuild(); // Original engine; its shapes, animations and camera are preserved.
    }
    // A held ceremonial animation must end when its *exact* source cue
    // leaves the reading focus. Otherwise scrolling backwards to an
    // elevation would fail to re-arm it, and stale gesture/lighting FX
    // would survive after the corresponding rubric disappeared.
    const continuing=Boolean(last?.key===nextKey&&last?.playedCue&&
      validCue&&sourceSectionId===last.sourceSectionId&&
      (cue===last.playedCue||cues[last.playedCue]?.continuation?.includes(cue)));
    // The original C24 sequence spans the offering, cross/altar and
    // subsequent minister incensation (C0121-C0124). Do not truncate its
    // 16-second animation as soon as C0122 is focused. Elevations remain
    // single-cue actions: C0174/C0181 exit resets their glow immediately.
    const exiting=Boolean(last?.key===nextKey&&last?.playedCue&&!continuing);
    if(last?.key!==nextKey||exiting){
      clearElevationMinisterIncense();
      M3.show(card,false); // Original engine cancels pending action keyframes.
      quietInactiveElevation(card);
    }
    const binding=validCue?cues[cue]:null;
    const play=Boolean(binding?.card===id&&
      binding.section===sourceSectionId&&
      (!binding.forms||binding.forms.includes(String(message.form).toUpperCase()))&&
      // Ritus XIII.2: Requiem Offertory incenses ONLY celebrant afterward.
      // Claude's 16-second ordinary C24 routine also incenses other
      // ministers. Keep the source state visible, but do not run the
      // formally inaccurate ordinary sequence for a Requiem.
      !(requiem&&id==="C24")&&
      (last?.key!==nextKey||last?.playedCue!==cue));
    if(play)M3.show(card,true);
    stageSungSediliaAcolyte(card);
    stageSolemnGospel(card,requiem,form,sourceSectionId);
    const elevationActor=stageSolemnElevation({
      card,form,requiem,sourceSectionId,cue,validCue
    });
    last={key:nextKey,card:id,cue,sourceSectionId,requiem,
      elevationActor,elevationCue:elevationActor?cue:null,
      playedCue:play?cue:exiting?null:last?.key===nextKey?last.playedCue:null};
    return ack(true,"PRESENTED",{card:id,sourceCueId:validCue?cue:null,
      choreography:play?"SOURCE_TRIGGERED":"STATIC_STAGE",
      elevationIncenseActor:elevationActor});
  }
  window.addEventListener("message",event=>{
    if(event.source!==window.parent||event.origin!==location.origin)return;
    if(event.data?.type!==PROTOCOL&&event.data?.type!==CLEAR)return;
    const result=event.data.type===CLEAR&&event.data.version===1
      ?clear():present(event.data);
    event.source.postMessage(result,event.origin);
  });
  window.AO_SANCTUARY_EMBED_TEST=Object.freeze({
    present,presentAsperges,clear,originalCardCount:originals.length,
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
