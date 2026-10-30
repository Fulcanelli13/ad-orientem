// Research-only, browser-local Gregorian score sheet in the existing Music Plan.
// Never reads priest state, moves the Schola cursor, plays music, or infers song.
import {createOfflineChantEngraver} from "./reader-chant-engraver.js";
export function createKyrialeNotationViewer({document:doc}={}){
 if(!doc?.body?.appendChild)throw new TypeError("Browser document required");
 const overlay=doc.createElement("div");
 overlay.className="ao-kyriale-score-overlay";
 overlay.setAttribute("role","dialog");
 overlay.setAttribute("aria-modal","true");
 overlay.setAttribute("aria-label","Gregorian notation · research transcription");
 overlay.hidden=true;
 overlay.innerHTML=`<section class="ao-kyriale-score-sheet">
   <header class="ao-kyriale-score-header"><h2 data-kyriale-score-title>Gregorian notation</h2>
     <button type="button" data-kyriale-score-close aria-label="Close Gregorian notation">Close</button></header>
   <p class="ao-kyriale-score-warning">Research transcription · not yet approved against the printed 1961 facsimile. Not evidence of the Schola's actual melody. No audio.</p>
   <div class="ao-kyriale-score-viewport" data-kyriale-score-viewport aria-label="Gregorian neume notation" tabindex="0"></div>
   <p class="ao-kyriale-score-status" data-kyriale-score-status role="status">Select a setting to study.</p>
   <footer class="ao-kyriale-score-footer"><span data-kyriale-score-witness></span>
     <a data-kyriale-score-source target="_blank" rel="noopener noreferrer">Source transcription</a></footer>
 </section>`;
 doc.body.appendChild(overlay);
 const viewport=overlay.querySelector("[data-kyriale-score-viewport]");
 const status=overlay.querySelector("[data-kyriale-score-status]");
 const title=overlay.querySelector("[data-kyriale-score-title]");
 const witness=overlay.querySelector("[data-kyriale-score-witness]");
 const link=overlay.querySelector("[data-kyriale-score-source]");
 const closeButton=overlay.querySelector("[data-kyriale-score-close]");
 const engraver=createOfflineChantEngraver({viewport,document:doc});
 engraver.observe();
 let activeId=null,request=0,previousFocus=null,destroyed=false;
 function close(){
   if(destroyed)return;
   request++;overlay.hidden=true;activeId=null;
   viewport.replaceChildren();
   const target=previousFocus;previousFocus=null;
   if(target?.isConnected && typeof target.focus==="function")target.focus();
 }
 function onKey(event){if(!overlay.hidden&&event.key==="Escape"){
   event.preventDefault();close();
 }}
 function onClick(event){
   if(event.target===overlay||event.target?.closest?.("[data-kyriale-score-close]"))
     close();
 }
 doc.addEventListener("keydown",onKey);
 overlay.addEventListener("click",onClick);
 async function open(score,{trigger=null}={}){
   if(destroyed||!score?.gabc||!score?.scoreId||!score?.sourceUrl)
     return false;
   const token=++request;
   activeId=score.scoreId;previousFocus=trigger;
   title.textContent=score.title+" · notation";
   witness.textContent=score.printedWitness;
   link.href=score.sourceUrl;
   status.textContent="Engraving locally…";
   viewport.replaceChildren();overlay.hidden=false;
   closeButton.focus();
   // Defer until the sheet has measurable width. Stale asynchronous renders
   // cannot repaint a later selection, and closing never mutates Mass state.
   try{
     const ok=await engraver.engrave(score.gabc);
     if(destroyed||overlay.hidden||request!==token)return false;
     status.textContent=ok?"Offline SVG notation · scroll to read":
       "Notation was superseded by another selection";
     return ok;
   }catch{
     if(!destroyed&&!overlay.hidden&&request===token)
       status.textContent="Local engraving unavailable; consult the linked source";
     return false;
   }
 }
 function destroy(){
   if(destroyed)return;
   close();destroyed=true;
   doc.removeEventListener("keydown",onKey);
   overlay.removeEventListener("click",onClick);
   engraver.destroy();overlay.remove();
 }
 return Object.freeze({open,close,destroy,state:()=>Object.freeze({
   open:!overlay.hidden,scoreId:activeId,offline:true,audio:false,
 })});
}
