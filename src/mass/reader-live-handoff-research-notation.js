// LIVE handoff, preview-only: an explicitly requested ORIGINAL-REFERENCE
// Kyriale score. This is not a Schola dock approval and never uses or changes
// the canonical Schola controller, its independent clock, or the Mass text.
// The 20 existing offline GABCs are editorial research, not published scores.
import {offlineKyrialeResearchScore} from "./reader-kyriale-research-gabc.js";
import {createOfflineChantEngraver} from "./reader-chant-engraver.js";

const freeze=Object.freeze;
const FORMS=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const TRACKS=new Set(["KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"]);
const CUE=/^AO\.SM\.C\d{4}$/;

export function selectLiveHandoffResearchNotation({
 schola,form,settingId,sourceGate=false,approvedScoreVisible=false
}={}){
 const track=String(schola?.trackId??"");
 const cues=schola?.trackSourceCueIds;
 if(sourceGate!==true||approvedScoreVisible===true||
    !FORMS.has(String(form??"").toUpperCase())||
    !TRACKS.has(track)||
    schola?.owner!=="R17_NATIVE_SCHOLA"||
    schola?.musicStatus!=="EXPECTED_NOT_OBSERVED"||
    schola?.composedWorkId ||
    !CUE.test(String(schola?.cueId??""))||
    !Array.isArray(cues)||!cues.length||
    !cues.every(x=>CUE.test(String(x)))||
    new Set(cues).size!==cues.length||
    !cues.includes(schola.cueId)||
    typeof schola?.trackSourceLatin!=="string"||
    !schola.trackSourceLatin.trim()||
    typeof settingId!=="string"||!settingId.trim())return null;
 const source=offlineKyrialeResearchScore(track,settingId);
 if(source?.movement!==track||source?.catalogueId!==settingId||
    source?.status!=="RESEARCH_TRANSCRIPTION_NOT_FACSIMILE_APPROVED"||
    source?.scoreApproved!==false||
    source?.observedPerformance!==false||
    !/^https:\/\//.test(String(source?.sourceUrl??""))||
    typeof source?.gabc!=="string"||!source.gabc.includes("%%")||
    !source.gabc.includes("(::)"))return null;
 return freeze({
  status:"REFERENCE_ONLY_NOT_APPROVED",
  trackId:track,settingId,
  scoreId:source.scoreId,
  title:source.title,
  printedWitness:source.printedWitness,
  sourceUrl:source.sourceUrl,
  gabc:source.gabc,
  sourceCueIds:freeze([...cues]),
  musicalPerformance:"NOT_OBSERVED",
  sourceScoreApproved:false
 });
}

export const LIVE_HANDOFF_RESEARCH_NOTATION_CSS=[
 ".ao-reader-shell.ao-live-band-enabled [data-ao-reference-score-trigger]{position:absolute;z-index:6;top:3px;right:47px;max-width:110px;height:25px;padding:2px 5px;border:1px solid rgba(225,205,145,.52);border-radius:6px;background:#182322;color:#e8dfc7;font:600 9px/1.1 system-ui,sans-serif;cursor:pointer;white-space:nowrap}",
 ".ao-reader-shell.ao-live-band-enabled [data-ao-reference-score-trigger][hidden]{display:none!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel[hidden]{display:none!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel{position:relative;max-height:105px;overflow:hidden;margin:3px 0 0}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-caption{display:flex;justify-content:space-between;align-items:center;gap:6px;height:22px;white-space:nowrap;color:#dbca9b;font:600 9px/1 system-ui,sans-serif}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-caption button{min-width:32px;min-height:21px;border:0;background:transparent;color:#ebe0c4;font-size:13px;cursor:pointer}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel .ao-live-chant-scroll{height:63px!important;max-height:63px!important;border-top:1px solid rgba(222,202,143,.14)}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel .ao-schola-approved-staff{width:4096px!important;min-width:4096px!important;max-width:none!important;height:63px!important;overflow:hidden}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel .ao-schola-approved-staff svg{max-width:none!important;height:auto!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel .ao-schola-approved-staff svg :is(path,polygon,polyline,line,text){fill:currentColor}",
 ".ao-reader-shell.ao-live-band-enabled .ao-schola-dock[data-ao-research-reference='true']:not([data-collapsed='true']){height:146px!important;min-height:146px!important;max-height:146px!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-schola-dock[data-ao-research-reference='true'] :is(.ao-schola-main,.ao-schola-meta,.ao-schola-upcoming){display:none!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-schola-dock[data-ao-research-reference='true'] .ao-schola-title{margin-top:0}",
 "@media(max-width:380px){.ao-reader-shell.ao-live-band-enabled [data-ao-reference-score-trigger]{right:37px;max-width:87px;font-size:8px}}"
].join("\n");

export function installLiveHandoffResearchNotation({
 root,document=root?.ownerDocument,preview,prepared
}={}){
 const dock=root?.querySelector?.(".ao-schola-dock");
 if(!dock||!document?.createElement||!preview?.getScholaState)
   return freeze({mounted:false,refresh:()=>false,dispose(){}});
 const trigger=document.createElement("button");
 trigger.type="button";
 trigger.dataset.aoReferenceScoreTrigger="";
 trigger.textContent="REF SCORE";
 trigger.title="Open existing source-indexed Gregorian research notation; not an approved Schola score";
 trigger.setAttribute("aria-label","Open explicit reference-only Gregorian score");
 trigger.hidden=true;
 const panel=document.createElement("section");
 panel.className="ao-live-reference-panel";
 panel.dataset.aoReferenceScorePanel="";
 panel.setAttribute("aria-label","Historical score reference. Research only, not an approved Mass score or a detected performance.");
 panel.hidden=true;
 const caption=document.createElement("div");
 caption.className="ao-live-reference-caption";
 const message=document.createElement("span");
 message.dataset.aoReferenceScoreCaption="";
 message.textContent="1961 REFERENCE · NOT APPROVED";
 const closeButton=document.createElement("button");
 closeButton.type="button";closeButton.textContent="×";
 closeButton.dataset.aoReferenceScoreClose="";
 closeButton.setAttribute("aria-label","Close historical reference score");
 caption.append(message,closeButton);
 const scroller=document.createElement("div");
 scroller.className="ao-live-chant-scroll";
 scroller.setAttribute("aria-label","Scroll the printed historical research transcription horizontally");
 const staff=document.createElement("div");
 staff.className="ao-schola-approved-staff";
 staff.dataset.aoReferenceScoreStaff="";
 staff.setAttribute("role","img");
 staff.setAttribute("aria-label","Provisional offline neume transcription; editorial comparison pending");
 scroller.append(staff);panel.append(caption,scroller);
 dock.insertBefore(trigger,dock.querySelector("[data-schola-toggle]"));
 dock.insertBefore(panel,dock.querySelector(".ao-schola-main"));
 let enabled=false,disposed=false,activeKey=null,engraver=null,token=0,candidate=null;
 const getCandidate=()=>{
   const state=preview.getScholaState?.()?.schola;
   const selected=state&&root.querySelector?.('[data-schola-kyriale-choice="'+state.trackId+'"]');
   return selectLiveHandoffResearchNotation({
     schola:state,
     form:prepared?.session?.resolvedMass?.form,
     settingId:selected?.value??"",
     sourceGate:enabled,
     approvedScoreVisible:dock.dataset.approvedScore==="true"
   });
 };
 const close=()=>{
   ++token;engraver?.destroy?.();engraver=null;activeKey=null;
   staff.replaceChildren();panel.hidden=true;
   delete dock.dataset.aoResearchReference;
   trigger.setAttribute("aria-expanded","false");
 };
 const refresh=on=>{
   if(disposed)return false;
   if(typeof on==="boolean")enabled=on;
   candidate=enabled?getCandidate():null;
   if(!candidate||!enabled){
     close();trigger.hidden=true;return false;
   }
   trigger.hidden=false;
   trigger.title="View historical reference "+candidate.title+
     " (not reviewed or published; not heard)";
   const nextKey=candidate.trackId+"|"+candidate.settingId+"|"+candidate.scoreId;
   if(activeKey&&activeKey!==nextKey)close();
   return true;
 };
 const open=async()=>{
   if(!refresh()||!candidate)return false;
   const selected=candidate,key=selected.trackId+"|"+selected.settingId+"|"+selected.scoreId;
   if(activeKey===key){close();return true;}
   close();
   activeKey=key;const request=++token;
   message.textContent="1961 REFERENCE · NOT APPROVED";
   panel.hidden=false;
   dock.dataset.aoResearchReference="true";
   trigger.setAttribute("aria-expanded","true");
   staff.setAttribute("aria-label","Research-only "+selected.title+
     " from "+selected.printedWitness+". No performance observed.");
   try{
     engraver=createOfflineChantEngraver({viewport:staff,document});
     engraver.observe?.();
     const ok=await engraver.engrave(selected.gabc);
     if(request!==token)return false;
     if(!ok||!staff.querySelector("svg")){close();return false;}
     // This reference has no live playback or source-approved syllable clock.
     return true;
   }catch{if(request===token)close();return false;}
 };
 const onTrigger=()=>{void open();};
 const onChange=event=>{
   if(event.target?.matches?.("[data-schola-kyriale-choice],[data-schola-ordinary-setting],[data-schola-music-setting],[data-schola-profile-select]"))
     refresh();
 };
 const onClose=()=>close();
 trigger.addEventListener("click",onTrigger);
 closeButton.addEventListener("click",onClose);
 root.addEventListener("change",onChange);
 function dispose(){
   if(disposed)return;
   refresh(false);disposed=true;
   trigger.removeEventListener("click",onTrigger);
   closeButton.removeEventListener("click",onClose);
   root.removeEventListener("change",onChange);
   trigger.remove();panel.remove();
 }
 return freeze({mounted:true,refresh,dispose,
   getState:()=>freeze({enabled,available:Boolean(candidate),open:Boolean(activeKey),
     scoreId:activeKey?.split("|")[2]??null,
     approval:"RESEARCH_ONLY",automaticPublication:false})});
}
