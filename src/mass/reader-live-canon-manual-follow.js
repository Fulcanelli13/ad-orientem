// Discreet, optional LIVE control attached to the existing priest rail.
// This module never advances the Mass, estimates timing, or interprets scroll
// position as observation. Buttons explicitly report a witnessed R17 event.
const STYLE=`
.ao-live-canon-follow-trigger{
  width:44px;min-height:40px;border-radius:10px;border:1px solid
    color-mix(in srgb,var(--ao-mass-accent,#938a73) 28%,transparent);
  background:rgba(11,16,20,.88);color:var(--ao-mass-accent-text,#c7bd9d);
  font:500 23px/1 Georgia,serif;letter-spacing:.12em;
  cursor:pointer;pointer-events:auto;align-self:center;
  touch-action:manipulation;
}
.ao-live-canon-follow-trigger[hidden],.ao-live-canon-follow-sheet[hidden]{display:none!important}
.ao-live-canon-follow-trigger:focus-visible,.ao-live-canon-follow-sheet button:focus-visible{
  outline:2px solid var(--ao-mass-accent-text,#c7bd9d);outline-offset:2px;
}
.ao-live-canon-follow-trigger[aria-expanded="true"]{
  background:color-mix(in srgb,var(--ao-mass-accent,#938a73) 15%,#0b1014);
}
.ao-live-canon-follow-sheet{
  position:absolute;z-index:16;top:7px;right:max(62px,calc((100% - 1080px)/2 + 64px));
  width:min(276px,calc(100% - 122px));max-height:min(65vh,410px);
  overflow-y:auto;overscroll-behavior:contain;
  border-radius:12px;border:1px solid rgba(202,194,169,.27);
  background:color-mix(in srgb,var(--ao-mass-panel,#11191c) 85%,#080c12);
  box-shadow:0 12px 30px rgba(0,0,0,.45);
  padding:12px;pointer-events:auto;color:#d9d9d1;
  font-family:var(--ao-font-ui,system-ui,sans-serif);
}
.ao-live-canon-follow-heading{font:600 11px/1.3 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.055em;color:var(--ao-mass-accent-text,#c7bd9d);}
.ao-live-canon-follow-hint{font:400 10px/1.35 var(--ao-font-ui,system-ui,sans-serif);
  color:#aab1ad;margin:3px 0 9px;}
.ao-live-canon-follow-options{display:flex;flex-direction:column;gap:5px}
.ao-live-canon-follow-sheet button[data-canon-observe]{
  width:100%;min-height:39px;display:flex;align-items:center;justify-content:space-between;
  gap:8px;text-align:left;padding:7px 9px;color:#e0e3de;border-radius:7px;
  border:1px solid rgba(210,220,212,.12);background:rgba(255,255,255,.025);
  font:500 11px/1.25 var(--ao-font-ui,system-ui,sans-serif);
  cursor:pointer;touch-action:manipulation;
}
.ao-live-canon-follow-sheet button[data-canon-observe][data-actor="SERVER"]{
  border-style:dashed;color:#c8d0cf;
}
.ao-live-canon-follow-sheet button[data-canon-observe]:disabled{
  opacity:.42;cursor:default;
}
.ao-live-canon-follow-actor{font-size:8px;letter-spacing:.06em;color:#a2aaa6;
  text-transform:uppercase;white-space:nowrap}
.ao-live-canon-follow-reset{display:inline-block;margin:9px 3px 0 0;padding:4px 6px;border:0;background:transparent;color:#b9bdb8;cursor:pointer;font-size:11px}
.ao-live-canon-follow-close{display:inline-block;margin:9px 0 0 auto;padding:4px 6px;
  border:0;background:transparent;color:#aab1ad;cursor:pointer;font-size:11px}
.ao-reader-shell:not([data-mode="LIVE"]) .ao-live-canon-follow-trigger,
.ao-reader-shell:not([data-mode="LIVE"]) .ao-live-canon-follow-sheet{display:none!important}
@media(prefers-reduced-motion:reduce){
  .ao-live-canon-follow-trigger,.ao-live-canon-follow-sheet *{animation:none!important;transition:none!important}
}
`;

export function canonicalManualFollowContext({mode=null,curated=false,cueId=null,
  sectionId=null,presentationCardId=null,specialRite=false}={}){
 if(String(mode??"").toUpperCase()!=="LIVE"||curated!==true||specialRite===true)return null;
 // CanonicalSourceId is sometimes the underlying AO.CARD.* macro. The
 // 65-curated card ID always retains the actual AO.CANON.06/.07 division.
 const source=String(sectionId??""),card=String(presentationCardId??"");
 const isHost=source==="AO.CANON.06"||
   /^AO\.LIVECURATED\.AO\.CANON\.06\.[0-9]+$/.test(card);
 const isChalice=source==="AO.CANON.07"||
   /^AO\.LIVECURATED\.AO\.CANON\.07\.[0-9]+$/.test(card);
 if(cueId==="AO.SM.C0174"&&isHost)return "HOST";
 if(cueId==="AO.SM.C0181"&&isChalice)return "CHALICE";
 return null;
}

export function mountLiveCanonManualFollow({doc,host,controller,getContext,observe,clear}={}){
 const rail=host?.querySelector?.(".ao-rail-right");
 const stage=host?.querySelector?.(".ao-reader-stage");
 if(!rail||!stage||!doc?.createElement||!controller ||
    typeof getContext!=="function"||typeof observe!=="function")
   return Object.freeze({update:()=>{},destroy:()=>{}});
 const style=doc.createElement("style");
 style.textContent=STYLE;
 stage.append(style);
 const trigger=doc.createElement("button");
 trigger.className="ao-live-canon-follow-trigger";
 trigger.type="button";
 trigger.hidden=true;
 trigger.textContent="···";
 trigger.setAttribute("data-live-canon-follow-trigger","");
 trigger.setAttribute("aria-expanded","false");
 trigger.setAttribute("aria-label","Record an observed Canon action");
 trigger.title="Record only an action actually observed";
 rail.append(trigger);
 const sheet=doc.createElement("div");
 sheet.className="ao-live-canon-follow-sheet";
 sheet.hidden=true;
 sheet.setAttribute("role","group");
 sheet.setAttribute("aria-label","Observed Canon actions");
 stage.append(sheet);
 let opened=false;
 let activeCue=null;
 function close(focus=false){
   opened=false;sheet.hidden=true;
   trigger.setAttribute("aria-expanded","false");
   if(focus && !trigger.hidden)trigger.focus?.();
 }
 function update(){
   const ctx=getContext();
   const subject=canonicalManualFollowContext(ctx??{});
   if(!subject||!controller.getChoices){
     trigger.hidden=true;activeCue=null;close();return;
   }
   if(activeCue!==ctx.cueId){activeCue=ctx.cueId;close();}
   trigger.hidden=false;
   const fr=String(ctx.language??"en").toLowerCase().startsWith("fr");
   trigger.setAttribute("aria-label",fr
     ?"Consigner une action observée au Canon"
     :"Record an observed Canon action");
   if(!opened)return;
   const wasFocused=doc.activeElement?.getAttribute?.("data-canon-observe")??null;
   sheet.replaceChildren();
   const heading=doc.createElement("div");
   heading.className="ao-live-canon-follow-heading";
   heading.textContent=(fr?"Actions observées · ":"Observed actions · ")+
     (subject==="HOST"?(fr?"Hostie":"Host"):(fr?"Calice":"Chalice"));
   const hint=doc.createElement("p");
   hint.className="ao-live-canon-follow-hint";
   hint.textContent=fr?"Touchez uniquement ce que vous voyez. Facultatif."
     :"Tap only what you actually see. Optional.";
   const choices=doc.createElement("div");
   choices.className="ao-live-canon-follow-options";
   for(const row of controller.getChoices({sourceCueId:ctx.cueId,language:ctx.language})){
     const btn=doc.createElement("button");
     btn.type="button";
     btn.setAttribute("data-canon-observe",row.eventId);
     btn.dataset.actor=row.actor;
     btn.disabled=row.disabled;
     const label=doc.createElement("span");
     label.textContent=row.label;
     const actor=doc.createElement("small");
     actor.className="ao-live-canon-follow-actor";
     actor.textContent=row.actor==="SERVER"?(fr?"Servant":"Server"):(fr?"Prêtre":"Priest");
     btn.append(label,actor);
     choices.append(btn);
   }
   const reset=doc.createElement("button");
   reset.type="button";
   reset.className="ao-live-canon-follow-reset";
   reset.setAttribute("data-canon-follow-reset","");
   reset.textContent=fr?"Recommencer":"Reset";
   const done=doc.createElement("button");
   done.type="button";
   done.className="ao-live-canon-follow-close";
   done.setAttribute("data-canon-follow-close","");
   done.textContent=fr?"Fermer":"Close";
   sheet.append(heading,hint,choices,reset,done);
   sheet.hidden=false;
   trigger.setAttribute("aria-expanded","true");
   if(wasFocused){
     for(const option of choices.querySelectorAll?.("[data-canon-observe]")??[]){
       if(option.getAttribute("data-canon-observe")===wasFocused){option.focus?.();break;}
     }
   }
 }
 function click(event){
   if(event.target?.closest?.("[data-live-canon-follow-trigger]")===trigger){
     opened=!opened;
     if(opened)update();else close(true);
     return;
   }
   if(event.target?.closest?.("[data-canon-follow-reset]")){
     if(typeof clear==="function"){clear();update();}
     return;
   }
   if(event.target?.closest?.("[data-canon-follow-close]")){
     close(true);return;
   }
   const option=event.target?.closest?.("[data-canon-observe]");
   if(!option||option.disabled||!opened)return;
   const ctx=getContext(),subject=canonicalManualFollowContext(ctx??{});
   if(!subject || option.dataset.actor!=="PRIEST"&&option.dataset.actor!=="SERVER"){
     close();return;
   }
   const permitted=controller.getChoices({sourceCueId:ctx.cueId,language:ctx.language})
     .find(x=>x.eventId===option.getAttribute("data-canon-observe") &&
       x.actor===option.dataset.actor&&!x.disabled);
   if(!permitted)return;
   const result=observe({
     eventId:permitted.eventId,actor:permitted.actor,
     observed:true,source:"EXPLICIT_OBSERVATION",sourceCueId:ctx.cueId,
   });
   if(result?.accepted===true)update();
 }
 function keydown(event){
   if(event.key==="Escape"&&opened){
     event.preventDefault?.();close(true);
   }
 }
 // Capture before the reader's own delegated click handler.
 host.addEventListener?.("click",click,true);
 host.addEventListener?.("keydown",keydown,true);
 function destroy(){
   host.removeEventListener?.("click",click,true);
   host.removeEventListener?.("keydown",keydown,true);
   close();style.remove?.();trigger.remove?.();sheet.remove?.();
 }
 return Object.freeze({update,destroy});
}
