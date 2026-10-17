/**
 * Lab-ora style Rosary bead: one or two exact source-witness verses, with
 * Read passage / Church Fathers opening Ad Orientem's existing Bible reader.
 * No donor fragment, machine paraphrase or second commentary pipeline.
 */
import {parseScriptureContext} from "../scripture/context.js";
import {loadScriptureWitness} from "../scripture/witness-loader.js";

const bookLoads=new Map();
const CHAPTER_LIMIT=2;
const gospel=new Set(["Matthew","Mark","Luke","John"]);
export const ROSARY_RESTORED_BIBLE_STATUS="UNCOLLATED_SOURCE_WITNESS";

export function rosaryInlineVersePlan(reference,{french=false}={}){
 const source=parseScriptureContext(reference);
 if(!source)return null;
 const passage=source.passage;
 // In longer citations, display an explicitly labelled first-two-verse
 // excerpt, never pretend that a fragment reproduces the entire range.
 const end=Math.min(passage.verseEnd,passage.verseStart+CHAPTER_LIMIT-1);
 return Object.freeze({
  reference:source.reference,passage,
  editionId:french?"crampon-1923":"cpdv-2009",
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
 const plan=rosaryInlineVersePlan(witness?.reference,{french});
 if(!plan||!prayer||!root?.ownerDocument)return null;
 const doc=root.ownerDocument,container=doc.createElement("section");
 container.className="aoRosaryBeadScripture";
 container.dataset.aoRosaryBeadScripture=identity;
 container.dataset.aoRosaryVerseStatus=ROSARY_RESTORED_BIBLE_STATUS;
 container.lang=french?"fr":"en";
 const title=doc.createElement("small");title.className="aoRosaryBeadScriptureLabel";
 title.textContent=french?"SAINTE ÉCRITURE · CRAMPON 1923":"SACRED SCRIPTURE · CPDV";
 const text=doc.createElement("p");text.className="aoRosaryBeadScriptureText";
 text.textContent=french?"Chargement du verset…":"Loading verse…";
 const actions=doc.createElement("div");actions.className="aoRosaryBeadScriptureActions";
 const passage=doc.createElement("a");
 passage.href=french?witness.frenchPrimaryUrl:witness.primaryUrl;
 passage.target="_blank";passage.rel="noopener noreferrer";
 passage.dataset.aoScriptureContext=plan.reference;
 passage.dataset.aoRosaryReadPassage=identity;
 passage.textContent=french?"Lire le passage":"Read passage";
 actions.append(passage);
 if(plan.catenaAvailable){
  const fathers=doc.createElement("button");
  fathers.type="button";
  // The original Catena source is resolved by the canonical passage reader.
  fathers.dataset.aoScriptureContext=plan.reference;
  fathers.dataset.aoScriptureDepth="commentary";
  if(french)fathers.dataset.aoScriptureLanguage="en";
  fathers.dataset.aoRosaryChurchFathers=identity;
  fathers.textContent=french?"Pères de l’Église (anglais)":"Church Fathers";
  actions.append(fathers);
 }
 const disclosure=doc.createElement("small");disclosure.className="aoRosaryBeadSourceNotice";
 disclosure.textContent=french
  ?"Transcription de la source, collation imprimée en attente."
  :"Source transcription; printed-edition collation pending.";
 container.append(title,text,actions,disclosure);
 prayer.append(container);
 void rosaryInlineSourceVerses(plan).then(rows=>{
  if(!container.isConnected||
    root.querySelector(".pbShell")?.dataset?.aoRosaryCurrentBead!==String(identity.split(".b")[1]))return;
  text.replaceChildren();
  if(rows.length!==plan.shownEnd-plan.shownStart+1){
   text.textContent=french?"Verset indisponible dans cette transcription.":"Verse unavailable in this source transcription.";
   return;
  }
  for(const row of rows){
   const span=doc.createElement("span");span.className="aoRosaryBeadVerse";
   const n=doc.createElement("sup");n.textContent=String(row.verse);
   span.append(n,doc.createTextNode(row.text));text.append(span);
  }
  if(plan.partial){
   const rest=doc.createElement("span");rest.className="aoRosaryBeadVerseScope";
   rest.textContent=french?"Extrait des deux premiers versets ; ouvrir le passage complet.":"First two verses shown; open the full passage.";
   text.append(rest);
  }
 }).catch(()=>{
  if(container.isConnected)text.textContent=french
   ?"Texte indisponible hors ligne ; ouvrir le passage à la source."
   :"Source text unavailable offline; open the passage.";
 });
 return container;
}
