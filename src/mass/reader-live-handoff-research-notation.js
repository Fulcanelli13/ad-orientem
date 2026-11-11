// LIVE handoff, preview-only: an explicitly requested ORIGINAL-REFERENCE
// Kyriale score. This is not a Schola dock approval and never uses or changes
// the canonical Schola controller, its independent clock, or the Mass text.
// The 20 existing offline GABCs are editorial research, not published scores.
import {offlineKyrialeResearchScore} from "./reader-kyriale-research-gabc.js";
import {selectLiveHandoffProperReferences} from "./reader-live-handoff-proper-notation.js";
import {schola1961OriginalFacsimile} from "./reader-schola-original-facsimile.js";
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
 ".ao-reader-shell.ao-live-band-enabled [data-ao-reference-score-trigger]{position:absolute;z-index:22;top:6px;left:clamp(104px,31vw,146px);right:auto;max-width:76px;height:25px;padding:2px 5px;border:1px solid rgba(225,205,145,.52);border-radius:6px;background:#182322;color:#e8dfc7;font:600 9px/1.1 system-ui,sans-serif;cursor:pointer;white-space:nowrap}",
 ".ao-reader-shell.ao-live-band-enabled [data-ao-reference-score-trigger][hidden]{display:none!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel[hidden]{display:none!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel{position:relative;max-height:105px;overflow:hidden;margin:3px 0 0}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-caption{display:flex;justify-content:space-between;align-items:center;gap:6px;height:22px;white-space:nowrap;color:#dbca9b;font:600 9px/1 system-ui,sans-serif}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-caption button{min-width:32px;min-height:21px;border:0;background:transparent;color:#ebe0c4;font-size:13px;cursor:pointer}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-caption button[hidden]{display:none!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-caption span{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-caption [data-ao-reference-full-open]{width:43px;min-width:43px;min-height:25px;font:700 10px/1 system-ui,sans-serif}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-caption select{display:block;min-width:0;max-width:58%;height:23px;padding:2px 5px;border:1px solid rgba(225,205,145,.4);border-radius:5px;background:#152020;color:#e9dabb;font:600 10px/1.1 system-ui,sans-serif}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-caption select[hidden]{display:none!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel .ao-live-chant-scroll{height:63px!important;max-height:63px!important;border-top:1px solid rgba(222,202,143,.14)}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel .ao-schola-approved-staff{width:4096px!important;min-width:4096px!important;max-width:none!important;height:63px!important;overflow:hidden}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel .ao-schola-approved-staff svg{max-width:none!important;height:auto!important;fill:currentColor}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel .ao-schola-approved-staff svg :is(use,rect,polygon,polyline){fill:currentColor}",
 ".ao-reader-shell.ao-live-band-enabled .ao-live-reference-panel .ao-schola-approved-staff svg :is(.staffLine,.ledgerLine,path[stroke],polyline[stroke]){stroke:currentColor}",
 ".ao-reader-shell.ao-live-band-enabled .ao-schola-dock[data-ao-research-reference='true']:not([data-collapsed='true']){height:146px!important;min-height:146px!important;max-height:146px!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-schola-dock[data-ao-research-reference='true'] :is(.ao-schola-main,.ao-schola-meta,.ao-schola-upcoming){display:none!important}",
 ".ao-reader-shell.ao-live-band-enabled .ao-schola-dock[data-ao-research-reference='true'] .ao-schola-title{margin-top:0}",
 "@media(max-width:380px){.ao-reader-shell.ao-live-band-enabled [data-ao-reference-score-trigger]{left:96px;right:auto;max-width:66px;font-size:8px}}"
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
 const fullButton=document.createElement("button");
 fullButton.type="button";fullButton.textContent="FULL";
 fullButton.dataset.aoReferenceFullOpen="";
 fullButton.setAttribute("aria-label","Open complete historical Gregorian score with all staff systems");
 fullButton.hidden=true;
 const picker=document.createElement("select");
 picker.dataset.aoReferenceScoreChoice="";
 picker.hidden=true;
 picker.setAttribute("aria-label","Choose one of the source-matched 1961 Gregorian references");
 caption.append(message,picker,fullButton,closeButton);
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
 let enabled=false,disposed=false,activeKey=null,engraver=null,token=0;
 let candidates=[],selectedScoreId=null,pickerInventory="";
 let fullDialog=null,fullEngraver=null,fullRequest=0;
 const keyOf=selected=>[selected.trackId,
   selected.settingId??selected.sourceSegmentId,selected.scoreId].join("|");
 const getCandidates=()=>{
   const schola=preview.getScholaState?.()?.schola;
   if(!schola)return [];
   const selected=root.querySelector?.('[data-schola-kyriale-choice="'+schola.trackId+'"]');
   const ordinary=selectLiveHandoffResearchNotation({
     schola,form:prepared?.session?.resolvedMass?.form,
     settingId:selected?.value??"",sourceGate:enabled,
     approvedScoreVisible:dock.dataset.approvedScore==="true"
   });
   if(ordinary)return [ordinary];
   // The exact source path, resolved date, Latin paragraph and musical role
   // are checked by the already established canonical Proper registry.
   return selectLiveHandoffProperReferences({
     schola,form:prepared?.session?.resolvedMass?.form,
     resolvedMass:prepared?.session?.resolvedMass,
     itinerary:preview.getScholaPerformance?.(),
     sourceGate:enabled,
     approvedScoreVisible:dock.dataset.approvedScore==="true"
   });
 };
 const closeFull=()=>{
   ++fullRequest;fullEngraver?.destroy?.();fullEngraver=null;
   const dialog=fullDialog;fullDialog=null;
   if(dialog?.open)dialog.close();
   dialog?.remove();
   if(dialog&&fullButton.isConnected&&!panel.hidden)fullButton.focus?.();
 };
 const close=()=>{
   closeFull();++token;engraver?.destroy?.();engraver=null;activeKey=null;
   staff.replaceChildren();panel.hidden=true;fullButton.hidden=true;
   delete dock.dataset.aoResearchReference;
   trigger.setAttribute("aria-expanded","false");
 };
 const syncPicker=()=>{
   const inventory=candidates.map(keyOf).join(";");
   if(inventory!==pickerInventory){
     pickerInventory=inventory;picker.replaceChildren();
     const first=document.createElement("option");
     first.value="";first.textContent="Choose source score";picker.append(first);
     for(const score of candidates){
       const option=document.createElement("option");
       option.value=score.scoreId;
       option.textContent=score.scoreRole ? score.scoreRole+" · "+score.title:score.title;
       picker.append(option);
     }
   }
   picker.hidden=candidates.length<2;
   if(!candidates.some(x=>x.scoreId===selectedScoreId))selectedScoreId=null;
   picker.value=selectedScoreId??"";
 };
 const refresh=on=>{
   if(disposed)return false;
   if(typeof on==="boolean")enabled=on;
   candidates=enabled?getCandidates():[];
   if(!candidates.length){
     close();trigger.hidden=true;selectedScoreId=null;
     pickerInventory="";picker.replaceChildren();return false;
   }
   syncPicker();
   trigger.hidden=false;
   trigger.title=candidates.length>1
     ?"Choose a source-bound historical reference (not approved or heard)"
     :"View historical reference "+candidates[0].title+" (not approved or heard)";
   if(activeKey&&!candidates.some(c=>keyOf(c)===activeKey))close();
   return true;
 };
 const open=async()=>{
   if(!refresh())return false;
   const selected=candidates.length===1?candidates[0]:
     candidates.find(c=>c.scoreId===selectedScoreId);
   if(!selected){
     // A source paragraph may genuinely contain two distinct appointed
     // chants (Gradual and Alleluia). Do not silently choose one.
     close();panel.hidden=false;
     dock.dataset.aoResearchReference="true";
     trigger.setAttribute("aria-expanded","true");
     message.textContent="CHOOSE 1961 REFERENCE · NOT APPROVED";
     picker.hidden=false;return true;
   }
   const key=keyOf(selected);
   if(activeKey===key){close();return true;}
   close();activeKey=key;const request=++token;
   message.textContent="1961 REFERENCE · NOT APPROVED";
   panel.hidden=false;dock.dataset.aoResearchReference="true";
   trigger.setAttribute("aria-expanded","true");fullButton.hidden=false;
   staff.setAttribute("aria-label","Research-only "+selected.title+
     " from "+selected.printedWitness+". No performance observed.");
   try{
     engraver=createOfflineChantEngraver({viewport:staff,document});
     engraver.observe?.();
     const ok=await engraver.engrave(selected.gabc);
     if(request!==token)return false;
     if(!ok||!staff.querySelector("svg")){close();return false;}
     return true;
   }catch{if(request===token)close();return false;}
 };
 const openFull=async()=>{
   // A full reader is a deliberate reference action, not automatic notation.
   // Revalidate against the CURRENT native source before opening the modal.
   if(!refresh()||!activeKey||panel.hidden)return false;
   const selected=candidates.find(x=>keyOf(x)===activeKey);
   if(!selected)return false;
   closeFull();
   const dialog=document.createElement("dialog");
   dialog.className="ao-schola-score-dialog";
   dialog.dataset.aoReferenceFullScore=selected.scoreId;
   dialog.dataset.aoReferenceFullReady="loading";
   dialog.setAttribute("aria-label","Complete 1961 historical Gregorian source reference; musical review pending");
   const header=document.createElement("header");
   const title=document.createElement("b");
   title.textContent=selected.title+" · full Gregorian notation";
   const original=schola1961OriginalFacsimile(selected.trackId,selected.settingId);
   const hasPrintedOriginal=Boolean(original?.originalPageImages?.length&&
     original.originalPageImages.every(url=>
       /^https:\/\/gregobase\.selapa\.net\/sources\/\d+\/\d+\.png$/.test(url))&&
     /^https:\/\/media\.churchmusicassociation\.org\/pdf\/kyriale-solesmes\.pdf#page=\d+$/.test(original.originalEditionPdf));
   const printToggle=document.createElement("button");
   printToggle.type="button";printToggle.dataset.aoReferencePrintToggle="";
   printToggle.textContent="PRINT";printToggle.hidden=!hasPrintedOriginal;
   printToggle.setAttribute("aria-label","Compare with original 1961 Solesmes printed folio");
   printToggle.setAttribute("aria-pressed","false");
   const closeButtonFull=document.createElement("button");
   closeButtonFull.type="button";closeButtonFull.dataset.scholaScoreClose="";
   closeButtonFull.textContent="Close";
   closeButtonFull.setAttribute("aria-label","Close full historical score");
   header.append(title,printToggle,closeButtonFull);dialog.append(header);
   const notice=document.createElement("p");
   notice.textContent="1961 research transcription · NOT musically approved. This reference does not report singing or advance the Schola.";
   dialog.append(notice);
   const fullStaff=document.createElement("div");
   fullStaff.className="ao-schola-score-viewport";
   fullStaff.dataset.aoReferenceFullStaff="";
   fullStaff.setAttribute("role","img");
   fullStaff.setAttribute("aria-label","Complete historical "+selected.title+" printed notation; provisional");
   dialog.append(fullStaff);
   const printed=document.createElement("div");
   printed.className="ao-schola-score-viewport";
   printed.dataset.aoReferencePrintView="";printed.hidden=true;
   printed.setAttribute("aria-label","Original 1961 printed source folio; not a modern transcription approval");
   dialog.append(printed);
   const onPrint=()=>{
     if(!hasPrintedOriginal||fullDialog!==dialog)return;
     const show=printed.hidden;
     if(show&&!printed.hasChildNodes()){
       const explanation=document.createElement("p");
       explanation.textContent="Original 1961 printed "+original.printedPages.join(", ")+
         " · whole folio, including other chants. Source comparison only; no musical approval.";
       printed.append(explanation);
       original.originalPageImages.forEach((url,index)=>{
         const image=document.createElement("img");
         image.alt=original.title+" · original printed folio "+
           (original.printedPages[index]??original.printedPages.at(-1));
         image.loading="lazy";image.decoding="async";image.src=url;
         image.dataset.aoReferencePrintImage=String(index);
         printed.append(image);
       });
       const pdf=document.createElement("a");
       pdf.href=original.originalEditionPdf;
       pdf.target="_blank";pdf.rel="noopener noreferrer";
       pdf.textContent="Open original 1961 printed edition";
       printed.append(pdf);
     }
     printed.hidden=!show;fullStaff.hidden=show;
     printToggle.setAttribute("aria-pressed",String(show));
     printToggle.textContent=show?"GABC":"PRINT";
     dialog.dataset.aoReferencePrintActive=String(show);
   };
   printToggle.addEventListener("click",onPrint);
   const witness=document.createElement("a");
   witness.href=selected.sourceUrl;
   witness.target="_blank";witness.rel="noopener noreferrer";
   witness.textContent="Source transcription and printed witness";
   dialog.append(witness);
   const onClose=()=>closeFull();
   closeButtonFull.addEventListener("click",onClose);
   dialog.addEventListener("cancel",event=>{event.preventDefault();closeFull();});
   dialog.addEventListener("click",event=>{if(event.target===dialog)closeFull();});
   (document.body??document.documentElement)?.append(dialog);
   fullDialog=dialog;
   const request=++fullRequest;
   dialog.showModal?.();closeButtonFull.focus?.();
   try{
     fullEngraver=createOfflineChantEngraver({viewport:fullStaff,document});
     fullEngraver.observe?.();
     const ok=await fullEngraver.engrave(selected.gabc);
     if(request!==fullRequest)return false;
     if(!ok||!fullStaff.querySelector("svg")){
       closeFull();return false;
     }
     dialog.dataset.aoReferenceFullReady="true";
     return true;
   }catch{if(request===fullRequest)closeFull();return false;}
 };
 const onTrigger=()=>{void open();};
 const onFull=()=>{void openFull();};
 const onPickerChange=()=>{
   selectedScoreId=picker.value||null;
   close();void open();
 };
 const onChange=event=>{
   if(event.target?.matches?.("[data-schola-kyriale-choice],[data-schola-ordinary-setting],[data-schola-music-setting],[data-schola-profile-select]"))
     refresh();
 };
 const onClose=()=>close();
 trigger.addEventListener("click",onTrigger);
 fullButton.addEventListener("click",onFull);
 picker.addEventListener("change",onPickerChange);
 closeButton.addEventListener("click",onClose);
 root.addEventListener("change",onChange);
 function dispose(){
   if(disposed)return;
   refresh(false);disposed=true;
   trigger.removeEventListener("click",onTrigger);
   fullButton.removeEventListener("click",onFull);
   picker.removeEventListener("change",onPickerChange);
   closeButton.removeEventListener("click",onClose);
   root.removeEventListener("change",onChange);
   trigger.remove();panel.remove();
 }
 return freeze({mounted:true,refresh,dispose,
   getState:()=>freeze({enabled,available:candidates.length>0,open:Boolean(activeKey),
     scoreId:activeKey?.split("|")[2]??null,fullScoreOpen:Boolean(fullDialog),
     referenceCount:candidates.length,
     requiresManualChoice:candidates.length>1,
     approval:"RESEARCH_ONLY",automaticPublication:false})});
}
