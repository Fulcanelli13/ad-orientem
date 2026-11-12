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
    clearSediliaGesture();
    hideSharedGospelBook();
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
      clearCommunionPaten();
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

  // Stage the owner-supplied SEDILIA scene without replacing its art.
  // Original pew seat: x=3.86..4.36, z=1.02..2.5, surface h=.62.
  // Earlier actor targets x=3.62 stand IN FRONT of that bench, so even
  // the owner's existing "sit" sprites looked like three standing clergy.
  // This visual alignment is illustrative, NOT a new ceremonial clock.
  const sungSedilia=new Set(["C08","C09","C12","C17","C18","C19"]);
  // The attempted white bent-leg graft was rejected by the owner.
  // No fabricated path, moved shoe, synthetic trousers or animation
  // observer is permitted until a coherent full-character asset passes
  // actual rendered-image review in all source-owned seated scenes.
  function clearSediliaPlacement(){
    // Source M3 owns the geometry and redraws. This clears only our
    // transient staging; no SVG anatomy has been changed.
  }
  function stageSedilia(card,form){
    if(!form||form.form!=="sung"||!sungSedilia.has(card?.id)){
      clearSediliaPlacement();
      return null;
    }
    const actors=M3.actors?.();
    if(!actors)return null;
    const seated=form.solemn?["P","D","S"]:["P"];
    for(const id of seated){
      const a=actors[id];
      if(!a)continue;
      // Do NOT force all sacred ministers to sit: in the Credo the
      // deacon may be at the altar preparing the corporal (original C18).
      // Only actors actually seated in the source scene receive headwear.
      if(a.vis!==true||a.pose!=="sit")continue;
      a.path=null;a.turn=null;
      // Original seated side sprite is an unapproved visual placeholder,
      // not a convincing body with independently modeled legs and cloth.
      // Face remains source-staged while new character art is prepared.
      // C18 deacon continues his separate corporal duty at the altar.
      a.face=0;
      // The solid sedilia spans x=3.86..4.36, with the aisle/front
      // at x<3.86. At x=4.04 the wooden front panel HID THE LEGS;
      // moving the actor upwards by .52 merely made him float and was
      // immediately overwritten by donor actorTick. Instead place
      // the seated, side-view FIGURE at the front lip of the seat.
      // Keep source z for each minister; no floating height, shoe shift,
      // improvised trouser outlines or claim of visual acceptance.
      a.x=3.71;
    }
    // One existing server at the sanctuary side: not kneeling in front
    // of a seated priest, and no longer obscuring the celebrant's sprite.
    // Solemn clergy are already accompanied by the original ministers;
    // additional acolyte/M.C. station assignments are still on hold.
    if(!form.solemn){
      const acolyte=actors.M;
      if(acolyte?.vis===true){
        acolyte.path=null;acolyte.turn=null;
        acolyte.pose="stand";acolyte.prop=null;
        acolyte.x=2.36;acolyte.z=1.8;acolyte.face=90;
      }
    }
    return "DONOR_SEDILIA_REVIEW_HOLD";
  }

  // 1960 Rubrics 518(b)/523; O'Connell (1962) sung Gloria and Solemn Credo.
  // Two observed edges per phrase: uncover/bow, then straighten/replace.
  // Never derive the sung word from the priest's recitation or Schola clock.
  const sediliaEvents=Object.freeze({
    "SED-GLORIA-ADORAMUS":["C08","AO.CARD.003"],
    "SED-GLORIA-GRATIAS":["C08","AO.CARD.003"],
    "SED-GLORIA-IESU-FIRST":["C08","AO.CARD.003"],
    "SED-GLORIA-SUSCIPE":["C08","AO.CARD.003"],
    "SED-GLORIA-IESU-SECOND":["C09","AO.CARD.003"],
    "SED-CREDO-IESUM":["C17","AO.CARD.009"],
    "SED-CREDO-INCARNATUS":["C18","AO.CARD.009"],
    "SED-CREDO-SIMUL":["C19","AO.CARD.009"]
  });
  let sediliaObserved=null,sediliaObservers=[];
  css.textContent += [
    ".ao-sedilia-head{transform-box:fill-box;transform-origin:50% 80%;transition:transform .28s ease}",
    ".ao-sedilia-cap{transition:transform .34s ease}",
    ".ao-sedilia-uncovered .ao-sedilia-head{transform:rotate(14deg);transition-delay:.16s}",
    ".ao-sedilia-uncovered .ao-sedilia-cap{transform:translate(15px,38px) rotate(12deg)}",
    "@media(prefers-reduced-motion:reduce){.ao-sedilia-head,.ao-sedilia-cap{transition:none!important}}"
  ].join("");
  function wrapSediliaCap(a){
    if(a?.pose!=="sit")return;
    for(const layer of a.b?.el?.querySelectorAll?.(".ly")??[]){
      const svg=layer.querySelector("svg");
      if(!svg||svg.querySelector(".ao-sedilia-cap"))continue;
      const cap=[...svg.querySelectorAll('path[fill="#141418"]')].slice(-2);
      if(cap.length!==2||cap[0].parentNode!==cap[1].parentNode)continue;
      const p=cap[0].parentNode, seam=[...p.children].find(el=>
        el.tagName.toLowerCase()==="path"&&el.getAttribute("stroke")==="#2c2c33");
      if(!seam)continue;
      let node=cap[0].previousElementSibling;const head=[];
      for(let i=0,n=p===svg?3:2;i<n&&node;i++){head.unshift(node);node=node.previousElementSibling}
      if(head.length!==(p===svg?3:2))continue;
      const ns="http://www.w3.org/2000/svg",h=document.createElementNS(ns,"g"),
        b=document.createElementNS(ns,"g");
      h.classList.add("ao-sedilia-head");b.classList.add("ao-sedilia-cap");
      p.insertBefore(h,head[0]);head.forEach(x=>h.appendChild(x));
      p.insertBefore(b,cap[0]);cap.forEach(x=>b.appendChild(x));b.appendChild(seam);
    }
  }
  function clearSediliaGesture(){
    sediliaObservers.forEach(x=>x.disconnect());sediliaObservers=[];
    for(const id of ["P","D","S"])
      M3.actors?.()?.[id]?.b?.el?.classList?.remove("ao-sedilia-uncovered");
    sediliaObserved=null;
  }
  function stageSediliaGesture(o,form,card,section,requiem){
    const selected=sediliaEvents[sediliaObserved?.eventId];
    if(sediliaObserved&&(!selected||selected[0]!==card.id||
       selected[1]!==section||form.form!=="sung"||requiem))
      clearSediliaGesture();
    if(o){
      if(o.phase==="BEGIN"&&sediliaObserved?.eventId!==o.eventId)clearSediliaGesture();
      sediliaObserved={eventId:o.eventId,phase:o.phase};
    }
    const spec=sediliaEvents[sediliaObserved?.eventId];
    // The deacon serves at the altar during sung Incarnatus (C18);
    // never dress a standing sacred minister in an imagined seated gesture.
    const candidates=form.solemn?["P","D","S"]:["P"];
    const ids=candidates.filter(id=>{
      const actor=M3.actors?.()?.[id];
      return actor?.vis===true&&actor.pose==="sit"&&
        !(card.id==="C18"&&id==="D");
    });
    const active=sediliaObserved?.phase==="BEGIN";
    if(active&&!sediliaObservers.length){
      for(const id of ids){
        const a=M3.actors?.()?.[id];if(!a)continue;
        const watcher=new MutationObserver(()=>{
          if(sediliaObserved?.phase==="BEGIN")wrapSediliaCap(a)
        });
        watcher.observe(a.b.el,{childList:true,subtree:true});
        sediliaObservers.push(watcher);
      }
    }
    for(const id of ["P","D","S"]){
      const a=M3.actors?.()?.[id];if(!a)continue;
      if(active&&ids.includes(id))wrapSediliaCap(a);
      a.b.el.classList.toggle("ao-sedilia-uncovered",
        Boolean(active&&ids.includes(id)&&a.pose==="sit"));
    }
    if(!active){sediliaObservers.forEach(x=>x.disconnect());sediliaObservers=[]}
    return sediliaObserved?{...sediliaObserved,actors:active?ids:[],
      movement:active?"BIRETTA_TO_KNEE_AND_HEAD_BOW":"HEAD_RISE_AND_BIRETTA_REPLACE"}:null;
  }

  function stageRequiemGospelPreparation(card,requiem,form,sectionId){
    if(card?.id!=="C13"||!form.solemn||!requiem||
       sectionId!=="AO.CARD.007")return false;
    // Ritus servandus XIII.2: no incense or candles at the
    // Solemn Requiem Gospel, including its preparation. The acolytes
    // remain present but carry neither lit candles nor torches.
    const actors=M3.actors?.();
    if(!actors)return false;
    if(actors.T){
      actors.T.path=null;actors.T.turn=null;actors.T.prop=null;
      actors.T.vis=false;
    }
    for(const id of ["A1","A2"]){
      const a=actors[id];
      if(!a)continue;
      a.path=null;a.turn=null;a.vis=true;a.pose="stand";a.prop=null;
    }
    return true;
  }

  // Ritus XIII.2 / MR62.SOL.B02.065: two acolytes jointly support ONE
  // Gospel book in Solemn Requiem. This supplemental source-static
  // billboard leaves the 65-scene original M3 artwork untouched.
  let sharedGospelBook=null;
  function hideSharedGospelBook(){
    if(sharedGospelBook?.bb)sharedGospelBook.bb.show=false;
  }
  function showSharedGospelBook(){
    const eng=M3.eng;
    if(!eng?.w||!Array.isArray(eng.bbs))return false;
    if(sharedGospelBook?.engine!==eng||!sharedGospelBook.bb?.el?.isConnected){
      const el=document.createElement("div");
      el.className="bb ao-sanctuary-shared-gospel-book";
      el.style.width=(.68*46*2.6).toFixed(1)+"px";
      el.style.height=(.46*46*2.6).toFixed(1)+"px";
      el.setAttribute("aria-hidden","true");
      el.innerHTML='<svg viewBox="-36 -24 72 48" width="100%" height="100%" '+
        'overflow="visible" xmlns="http://www.w3.org/2000/svg">'+
        '<path d="M-29,-14 Q-14,-18 0,-10 Q14,-18 29,-14 L30,12 Q15,9 0,17 '+
        'Q-15,9 -30,12Z" fill="#72232e" stroke="#c7a35d" stroke-width="1.7"/>'+
        '<path d="M-27,-12 Q-14,-14 -1,-7 L-1,13 Q-15,6 -27,9Z" fill="#f1e9d8"/>'+
        '<path d="M1,-7 Q14,-14 27,-12 L27,9 Q15,6 1,13Z" fill="#f1e9d8"/>'+
        '<path d="M0,-9 V15" fill="none" stroke="#bba57a" stroke-width="1.4"/>'+
        '<path d="M-24,-7 Q-13,-10 -4,-4 M-24,-2 Q-13,-5 -4,1 '+
        'M5,-4 Q14,-10 24,-7 M5,1 Q14,-5 24,-2" fill="none" '+
        'stroke="#b4a48e" stroke-width=".75"/>'+
        '<ellipse cx="-27" cy="11" rx="4.1" ry="2.9" fill="#ead0ad"/>'+
        '<ellipse cx="27" cy="11" rx="4.1" ry="2.9" fill="#ead0ad"/>'+
        '</svg>';
      eng.w.appendChild(el);
      const bb={el,x:-2.85,z:2.5,h:1.21,w:.68,ht:.46,show:true,op:1};
      eng.bbs.push(bb);
      sharedGospelBook={engine:eng,bb};
    }
    sharedGospelBook.bb.show=true;
    return true;
  }
  function stageSolemnGospel(card,requiem,form,sectionId){
    hideSharedGospelBook();
    if(card?.id!=="C14"||!form.solemn||sectionId!=="AO.CARD.007")return false;
    const actors=M3.actors?.();
    if(!actors)return false;
    // Ritus VI.5, source-checked research MR62.SOL.B02.008:
    // During the ordinary Solemn Gospel the SUBDEACON holds the book
    // between candlebearers; the DEACON proclaims. Claude's original
    // C14 assigns the book to the deacon instead. Transfer only the
    // existing prop; the original actor geometry and camera remain.
    if(actors.D)actors.D.prop=null;
    if(actors.S)actors.S.prop=requiem?null:"book";
    if(!requiem)return false;
    // Ritus XIII.2, source-checked MR62.SOL.B02.064/.065:
    // At a Solemn Requiem NO thurifer/candles, but TWO acolytes remain
    // and support the Gospel book. Preserve both unlit acolytes with
    // a single adapter-owned shared book, NOT a book in A1's hands.
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
      acolyte.prop=null;
    }
    return showSharedGospelBook();
  }
  // Ritus servandus VI.4, registry MR62.SOL.B02.001:
  // The SUBDEACON bears the Epistolarium at the Epistle side and
  // sings the lesson. The 65-card native Epistle source section exists,
  // but its C0075 *paragraph focus* does NOT exist in the curated model.
  // Do not pretend the cue is focusable: this is a STATIC C11 scene,
  // owned by the real AO.CARD.005 source card, not a timed minister event.
  function stageSolemnEpistle({card,form,sourceSectionId}){
    const active=Boolean(card?.id==="C11"&&form.solemn&&
      sourceSectionId==="AO.CARD.005");
    if(!active)return false;
    const subdeacon=M3.actors?.()?.S;
    if(!subdeacon)return false;
    subdeacon.path=null;subdeacon.turn=null;
    subdeacon.vis=true;subdeacon.pose="stand";subdeacon.prop="book";
    // The owner's original C11 already places S at the Epistle side.
    // Preserve its original station, camera, and facing.
    return true;
  }
  // Ritus servandus VI.5, source registry MR62.SOL.B02.004:
  // before the Solemn Gospel the SUBDEACON transfers the Missal to the
  // Gospel side. The old held C13 note concerned the unobserved *earlier*
  // server walk in sung Mass; it must not suppress this distinct Solemn
  // minister action. The actual route/departure is not source-clocked.
  // Only the already certified native C0081 focus shows a static
  // completed-transfer scene. No animation, no server duplication.
  function stageSolemnMissalAfterTransfer({card,form,sourceSectionId,cue,validCue}){
    const active=Boolean(card?.id==="C13"&&form.solemn&&validCue&&
      sourceSectionId==="AO.CARD.007"&&cue==="AO.SM.C0081");
    if(!active)return false;
    const subdeacon=M3.actors?.()?.S;
    if(!subdeacon)return false;
    subdeacon.path=null;subdeacon.turn=null;
    subdeacon.vis=true;subdeacon.pose="stand";subdeacon.prop=null;
    // Original renderer uses x<0 for Gospel side. The Missal furniture
    // already stands there: do not draw a duplicate book in S's hands.
    subdeacon.x=-1.45;subdeacon.z=.95;subdeacon.face=90;
    return true;
  }
  // The original C36/C38 priest-elevation cinematic is retained.
  // The source-checked 1962 minister records distinguish the incense
  // actor by rite: VIII.8 thurifer in ordinary Solemn Mass
  // (MR62.SOL.B02.045/.046), XIII.2 subdeacon in Solemn Requiem
  // (MR62.SOL.B02.047/.048). The research records are PREVIEW evidence,
  // not a source for an observed minister clock or certified coordinates.
  css.textContent += [
    ".ao-sanctuary-iframe .bb.ao-source-elevation-incense .thur{",
    // Claude's original elevSeq reveals the Host/Chalice at +2500 ms.
    // This delay synchronises ONLY the existing prototype visuals; it
    // does not claim observed priest or thurifer timing.
    "animation:swing2 .7s ease-in-out 3!important;",
    "animation-delay:2.5s!important}"
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
      // The original dalmatic back-view sprite omits hand-held props.
      // Oblique facing allows Claude's EXISTING thurible side sprite to
      // remain visible; it is a visual compromise, not a rubrical angle.
      actor.x=1.5;actor.z=1.35;actor.face=60;
    }else{
      // Original altar's kneeling thurifer, without replacing the priest.
      actor.x=.85;actor.z=2.05;actor.face=0;
    }
    if(fresh)actor.b?.el?.classList?.add?.("ao-source-elevation-incense");
    return actorId;
  }
  // C57 is already a scene AT the rail, not an instruction for Claude's
  // original 12-second approach/distribution route to begin. The certified
  // Solemn form-state SMIN-014 says the DEACON assists with the Communion
  // paten. The original D actor has no paten sprite: give its existing
  // billboard a small STATIC adapter-only plate while the real
  // AO.CARD.025 Communion source card is displayed. This represents the
  // distribution station, never an observed minister's hand movement.
  css.textContent += [
    ".ao-sanctuary-communion-paten{position:absolute;left:55%;top:38%;",
    "width:19px;height:7px;border:1px solid #d4b578;",
    "border-radius:50%;background:radial-gradient(ellipse at center,",
    "#f6eccf 0%,#d7b679 42%,#765327 100%);",
    "box-shadow:0 1px 3px #291906a6;pointer-events:none;z-index:5}"
  ].join("");
  function clearCommunionPaten(){
    const deacon=M3.actors?.()?.D;
    deacon?.b?.el?.querySelector?.(".ao-sanctuary-communion-paten")
      ?.remove?.();
  }
  function stageCommunionAtRail({
    card,form,sourceSectionId,returnActive=false,beginReturn=false
  }){
    const active=card?.id==="C57"&&sourceSectionId==="AO.CARD.025";
    if(!active){clearCommunionPaten();return null}
    // The original M3.show(card,false) positions the PRIEST AT the
    // rail; C0246 is a distribution text, not a priest departure clock.
    // Source-only MC-COM-300/310 is also AT the rail, with no route.
    if(beginReturn&&["low","sung"].includes(form.form)){
      // Canonical SILENT-ACTION MC-COM-320, E64, tier A:
      // "Distribution concludes / priest returns." 1962 Ritus X.7
      // agrees he returns to the altar AFTER the faithful communicate.
      // The existing M3 engine advances a path without modifying owner
      // HTML, camera, keyframes, Schola or priest/minister event clock.
      // Foot/CENTER are existing owner prototype stations. The exact
      // lateral path and speed are illustrative, not observed timings.
      const priest=M3.actors?.()?.P;
      if(priest){
        priest.path={pts:[[0,4.36],[0,2.05],[0,.4]],
          i:0,face:0,then:()=>{priest.pose="stand";priest.prop=null}};
        priest.speed=.9;priest.turn=null;
      }
    }
    if(returnActive){
      clearCommunionPaten();
      return "PRIEST_RETURN_SOURCE_EVENT";
    }
    if(form.solemn){
      const deacon=M3.actors?.()?.D;
      const el=deacon?.vis===true?deacon.b?.el:null;
      if(el&&!el.querySelector?.(".ao-sanctuary-communion-paten")){
        const paten=document.createElement("span");
        paten.className="ao-sanctuary-communion-paten";
        paten.setAttribute("aria-hidden","true");
        el.appendChild(paten);
      }
    }else clearCommunionPaten();
    return "AT_RAIL_STATIC";
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
    clearCommunionPaten();
    clearSediliaPlacement();
    clearSediliaGesture();
    hideSharedGospelBook();
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
    const obs=message.seatedReverenceObservation;
    if(obs!=null){
      const spec=sediliaEvents[obs.eventId];
      if(!spec||obs.observed!==true||
         obs.owner!=="EXPLICIT_SEDILIA_GESTURE_OBSERVATION"||
         !["BEGIN","END"].includes(obs.phase)||form.form!=="sung"||
         requiem||spec[0]!==id||spec[1]!==sourceSectionId)
        return ack(false,"UNVERIFIED_SEDILIA_REVERENCE");
      if(obs.phase==="END"&&sediliaObserved?.eventId!==obs.eventId)
        return ack(false,"SEDILIA_END_WITHOUT_BEGIN");
      if(obs.eventId==="SED-CREDO-INCARNATUS"&&
         message.incarnatusKneelException===true)
        return ack(false,"EXCEPTIONAL_INCARNATUS_KNEEL_HELD");
    }
    const nativeCommunionEvent=String(message.canonicalCommunionEventId??"");
    const validCommunionEvent=id==="C57"&&
      sourceSectionId==="AO.CARD.025"&&
      ["LOW","SOLEMN"].includes(String(message.form??"").toUpperCase())&&
      ["MC-COM-300","MC-COM-310","MC-COM-320"].includes(nativeCommunionEvent)
        ?nativeCommunionEvent:null;
    const observedReturnCancelled=message.communionReturnCancelled===true&&
      id==="C57"&&sourceSectionId==="AO.CARD.025";
    const beginReturn=!observedReturnCancelled&&
      validCommunionEvent==="MC-COM-320"&&
      (last?.communionReturnActive!==true||last?.key!==nextKey);
    const returnRewind=last?.communionReturnActive===true&&
      (observedReturnCancelled||
        (!validCommunionEvent?
          id!=="C57"||sourceSectionId!=="AO.CARD.025":
          validCommunionEvent!=="MC-COM-320"));
    const communionReturnActive=Boolean(
      !observedReturnCancelled&&
      (beginReturn||(last?.communionReturnActive===true&&!returnRewind&&
        id==="C57"&&sourceSectionId==="AO.CARD.025"))
    );
    const missalTransferFocus=Boolean(id==="C13"&&form.solemn&&validCue&&
      sourceSectionId==="AO.CARD.007"&&cue==="AO.SM.C0081");
    const missalFocusExit=Boolean(last?.solemnMissalTransfer&&!missalTransferFocus);
    const epistleFocus=Boolean(id==="C11"&&form.solemn&&
      sourceSectionId==="AO.CARD.005");
    const epistleFocusExit=Boolean(last?.solemnEpistle&&!epistleFocus);
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
    // The native reader itself suppresses state-only omitted rite
    // screens in its visible sequence (C23 -> C25). Do not manufacture
    // a C24 display, a false offering or an extra card in the iframe.
    if(last?.key!==nextKey)clearSediliaGesture();
    if(last?.key!==nextKey||exiting||missalFocusExit||
       epistleFocusExit||returnRewind){
      clearElevationMinisterIncense();
      clearCommunionPaten();
      clearSediliaPlacement();
      M3.show(card,false); // Original engine cancels action keyframes.
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
    if(message.sediliaReverenceCancelled===true)clearSediliaGesture();
    const sediliaStage=stageSedilia(card,form);
    const seatedGesture=stageSediliaGesture(obs,form,card,sourceSectionId,requiem);
    const requiemGospelPreparation=stageRequiemGospelPreparation(
      card,requiem,form,sourceSectionId);
    const sharedGospelBookVisible=stageSolemnGospel(card,requiem,form,sourceSectionId);
    const solemnEpistle=stageSolemnEpistle({
      card,form,sourceSectionId
    });
    const solemnMissalTransfer=stageSolemnMissalAfterTransfer({
      card,form,sourceSectionId,cue,validCue
    });
    const elevationActor=stageSolemnElevation({
      card,form,requiem,sourceSectionId,cue,validCue
    });
    const communionStation=stageCommunionAtRail({
      card,form,sourceSectionId,returnActive:communionReturnActive,
      beginReturn
    });
    last={key:nextKey,card:id,cue,sourceSectionId,requiem,
      solemnEpistle,solemnMissalTransfer,communionStation,
      sediliaStage,seatedGesture,requiemGospelPreparation,
      sharedGospelBookVisible,communionReturnActive,canonicalCommunionEventId:validCommunionEvent,
      elevationActor,elevationCue:elevationActor?cue:null,
      playedCue:play?cue:exiting?null:last?.key===nextKey?last.playedCue:null};
    return ack(true,"PRESENTED",{card:id,sourceCueId:validCue?cue:null,
      choreography:play?"SOURCE_TRIGGERED":"STATIC_STAGE",
      solemnEpistle:solemnEpistle?"SUBDEACON_EPISTOLARIUM_STATIC":null,
      solemnMissalTransfer:solemnMissalTransfer?"COMPLETED_TRANSFER_STATIC":null,
      communionStation,sediliaStage,seatedGesture,
      requiemGospelPreparation,sharedGospelBookVisible,
      communionReturnTriggered:beginReturn,
      canonicalCommunionEventId:validCommunionEvent,
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
        b?.el?.classList?.contains?.("glow")&&b.show)),
      sharedBookVisible:Boolean(sharedGospelBook?.engine===M3.eng&&
        sharedGospelBook?.bb?.show),
      sharedBookCount:(M3.eng?.bbs??[]).filter(b=>
        b.el?.classList?.contains("ao-sanctuary-shared-gospel-book")&&b.show).length
    })
  });
  if(window.parent!==window)
    window.parent.postMessage({type:READY,version:1,originalCards:originals.length},
      location.origin);
})();
