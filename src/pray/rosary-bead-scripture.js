/**
 * Lab-ora style Rosary bead: one or two exact source-witness verses, with
 * Read passage / Church Fathers opening Ad Orientem's existing Bible reader.
 * No donor fragment, machine paraphrase or second commentary pipeline.
 */
import {parseScriptureContext} from "../scripture/context.js";
import {loadScriptureWitness} from "../scripture/witness-loader.js";
import {createScripturePreferences} from "../scripture/preferences.js";
import {sourceReadingLink} from "../scripture/links.js";
import {UNALIGNED_CATHOLIC_BOOKS,scriptureParallelReferenceState} from "../scripture/reference-safety.js";

const bookLoads=new Map();
const CHAPTER_LIMIT=2;
const gospel=new Set(["Matthew","Mark","Luke","John"]);
export const ROSARY_RESTORED_BIBLE_STATUS="UNCOLLATED_SOURCE_WITNESS";

export function rosaryInlineVersePlan(reference,{french=false,englishEdition="dr-challoner"}={}){
 const source=parseScriptureContext(reference);
 if(!source)return null;
 const original=source.passage;
 const editionId=french?"crampon-1923":englishEdition;
 if(!french&&!["dr-challoner","cpdv-2009"].includes(editionId))
   throw new Error("UNSUPPORTED_ENGLISH_BIBLE_EDITION");
 let passage=original;
 // The Rosary's original reference is source-owned by the Douay witness.
 // Do not silently carry its coordinates into a different biblical passage
 // where the two Catholic editions have different versification.
 if(!french&&editionId==="cpdv-2009"&&UNALIGNED_CATHOLIC_BOOKS[original.book]){
   const parallel=scriptureParallelReferenceState(original,"dr-challoner",editionId);
   if(!parallel.canAutoParallel||!parallel.reference)return null;
   passage=parallel.reference;
 }
 // In longer citations, display an explicitly labelled first-two-verse
 // excerpt, never pretend that a fragment reproduces the entire range.
 const end=Math.min(passage.verseEnd,passage.verseStart+CHAPTER_LIMIT-1);
 return Object.freeze({
  reference:source.reference,passage,
  editionId,
  shownStart:passage.verseStart,shownEnd:end,
  partial:passage.verseEnd>end,
  catenaAvailable:gospel.has(passage.book)
 });
}
export async function rosaryInlineSourceVerses(plan,{
  loader=loadScriptureWitness,
  fetcher=globalThis.fetch?.bind(globalThis),
  cacheStorage=globalThis.caches
}={}){
 if(!plan)return Object.freeze([]);
 const key=plan.editionId+":"+plan.passage.book;
 // Cache only the same pinned source-witness file. Failed loads are retriable.
 let pending=bookLoads.get(key);
 if(!pending){
  pending=loader(plan.editionId,plan.passage.book,{fetcher,cacheStorage});
  bookLoads.set(key,pending);
  pending.catch(()=>{if(bookLoads.get(key)===pending)bookLoads.delete(key)});
 }
 const all=await pending;
 if(!Array.isArray(all))throw new Error("SCRIPTURE_WITNESS_INVALID");
 return Object.freeze(all.filter(x=>x.book===plan.passage.book&&
  x.chapter===plan.passage.chapter&&
  x.verseStart>=plan.shownStart&&x.verseStart<=plan.shownEnd&&
  x.sourceStatus==="UNCOLLATED_SOURCE_WITNESS"&&x.reviewed===false)
  .sort((a,b)=>a.verseStart-b.verseStart)
  .map(x=>Object.freeze({verse:x.verseStart,text:x.text,sourceUrl:x.sourceUrl})));
}
/**
 * Asynchronously enrich just the displayed canonical bead. A late network
 * response may not paint a newer bead; this protects prayer progression.
 */
export function restoreRosaryBeadScripture(root,prayer,witness,identity,{french=false}={}){
 if(!prayer||!root?.ownerDocument)return null;
 const doc=root.ownerDocument;
 const prefs=french?null:createScripturePreferences(doc.defaultView?.localStorage);
 let englishEdition=french?null:prefs.englishEdition();
 // Fall back to the Rosary's historical reference when a special Catholic
 // verse crosswalk is not yet source-collated. The user's saved preference
 // remains untouched until they explicitly select another translation.
 if(!french&&!rosaryInlineVersePlan(witness?.reference,{englishEdition}))
   englishEdition="dr-challoner";
 let plan=rosaryInlineVersePlan(witness?.reference,{french,englishEdition});
 if(!plan)return null;
 const container=doc.createElement("section");
 container.className="aoRosaryBeadScripture";
 container.dataset.aoRosaryBeadScripture=identity;
 container.dataset.aoRosaryVerseStatus=ROSARY_RESTORED_BIBLE_STATUS;
 container.lang=french?"fr":"en";
 const title=doc.createElement("small");title.className="aoRosaryBeadScriptureLabel";
 const text=doc.createElement("p");text.className="aoRosaryBeadScriptureText";
 const actions=doc.createElement("div");actions.className="aoRosaryBeadScriptureActions";
 const passage=doc.createElement("a");
 passage.target="_blank";passage.rel="noopener noreferrer";
 passage.dataset.aoScriptureContext=plan.reference;
 passage.dataset.aoRosaryReadPassage=identity;
 passage.textContent=french?"Lire le passage":"Read passage";
 actions.append(passage);
 if(plan.catenaAvailable){
  const fathers=doc.createElement("button");
  fathers.type="button";
  fathers.dataset.aoScriptureContext=plan.reference;
  fathers.dataset.aoScriptureDepth="commentary";
  if(french)fathers.dataset.aoScriptureLanguage="en";
  fathers.dataset.aoRosaryChurchFathers=identity;
  fathers.textContent=french?"Pères de l’Église (anglais)":"Church Fathers";
  actions.append(fathers);
 }
 const disclosure=doc.createElement("details");
 disclosure.className="aoRosaryBeadSourceNotice";
 const provenance=doc.createElement("summary");
 provenance.textContent=french?"Transcription · source":"Source · uncollated";
 const sourceDetail=doc.createElement("p");
 sourceDetail.textContent=french
   ?"Transcription de la source, collation imprimée en attente."
   :"Source transcription; printed-edition collation pending.";
 disclosure.append(provenance,sourceDetail);
 const header=doc.createElement("div");
 header.className="aoRosaryBeadScriptureHead";
 header.append(title);
 let flip=null;
 if(!french){
   flip=doc.createElement("button");
   flip.className="aoRosaryEnglishFlip";
   flip.type="button";
   flip.addEventListener("click",()=>{
     const next=englishEdition==="dr-challoner"?"cpdv-2009":"dr-challoner";
     if(!rosaryInlineVersePlan(witness.reference,{englishEdition:next}))return;
     englishEdition=next;prefs.setEnglishEdition(next);renderEdition();
     flip.focus({preventScroll:true});
   });
   header.append(flip);
 }
 container.append(header,text,actions,disclosure);
 prayer.append(container);
 let requestSeq=0;
 function renderEdition(){
  const current=rosaryInlineVersePlan(witness.reference,{french,englishEdition});
  if(!current)return;
  plan=current;
  const ticket=++requestSeq;
  container.dataset.aoRosaryEnglishEdition=current.editionId;
  title.textContent=french?"SAINTE ÉCRITURE · CRAMPON 1923":
    current.editionId==="dr-challoner"?"SACRED SCRIPTURE · DOUAY–RHEIMS":
    "SACRED SCRIPTURE · CPDV";
  if(flip){
    const next=current.editionId==="dr-challoner"?"cpdv-2009":"dr-challoner";
    flip.dataset.aoRosaryEnglishEdition=next;
    flip.dataset.aoRosaryActiveEdition=current.editionId;
    flip.textContent=current.editionId==="dr-challoner"?"Douay ⇄ CPDV":"CPDV ⇄ Douay";
    flip.disabled=!rosaryInlineVersePlan(witness.reference,{englishEdition:next});
    flip.setAttribute("aria-label",next==="cpdv-2009"?"Switch to CPDV":"Switch to Douay–Rheims");
    flip.title=flip.getAttribute("aria-label");
  }
  passage.href=french?witness.frenchPrimaryUrl:
   current.editionId==="dr-challoner"?witness.primaryUrl:
   sourceReadingLink(current.passage,current.editionId);
  text.textContent=french?"Chargement du verset…":"Loading verse…";
  void rosaryInlineSourceVerses(current).then(rows=>{
   if(ticket!==requestSeq||!container.isConnected||
      root.querySelector(".pbShell")?.dataset?.aoRosaryCurrentBead!==String(identity.split(".b")[1]))return;
   text.replaceChildren();
   if(rows.length!==current.shownEnd-current.shownStart+1){
    text.textContent=french?"Verset indisponible dans cette transcription.":
      "Verse unavailable in this source transcription.";
    return;
   }
   for(const row of rows){
    const span=doc.createElement("span");span.className="aoRosaryBeadVerse";
    const n=doc.createElement("sup");n.textContent=String(row.verse);
    span.append(n,doc.createTextNode(row.text));text.append(span);
   }
   if(current.partial){
    const rest=doc.createElement("span");rest.className="aoRosaryBeadVerseScope";
    rest.textContent=french?"Extrait des deux premiers versets ; ouvrir le passage complet.":
      "First two verses shown; open the full passage.";
    text.append(rest);
   }
  }).catch(()=>{
   if(ticket===requestSeq&&container.isConnected)text.textContent=french
     ?"Texte indisponible hors ligne ; ouvrir le passage à la source."
     :"Source text unavailable offline; open the passage.";
  });
 }
 renderEdition();
 return container;
}
