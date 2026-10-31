// Transitional Home "Did you know?" projection from the already published
// bilingual Glossary. No second fact bank, generated AI claims or unreviewed
// Weiser/Pitrè research. The canonical Discovery owner replaces this adapter
// after its independent editorial publication gate is satisfied.
const GLOSSARY_URL=new URL("../../data/glossary/concepts-151-300.v1.json",import.meta.url);
export const HOME_DYK_GLOSSARY_IDS=Object.freeze(["G195","G213","G219","G235","G194","G240"]);
let glossaryLoad=null;
const safeText=value=>typeof value==="string"?value.trim():"";
function selectedId(date){
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date??""));
  if(!match)return HOME_DYK_GLOSSARY_IDS[0];
  // Stable for a selected calendar date. No persistence, counters or claims
  // of freshness independent of the referenced Glossary source.
  const ordinal=Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3]))/86400000;
  return HOME_DYK_GLOSSARY_IDS[((ordinal%HOME_DYK_GLOSSARY_IDS.length)+HOME_DYK_GLOSSARY_IDS.length)%HOME_DYK_GLOSSARY_IDS.length];
}
export function homeDidYouKnowMarkup(language="en"){
  const fr=language==="fr";
  return '<button type="button" class="aoHomeDYK" data-home-dyk-open disabled aria-disabled="true">'+
    '<span class="aoHomeDYKLabel">'+(fr?"LE SAVIEZ-VOUS ?":"DID YOU KNOW?")+'</span>'+
    '<span class="aoHomeDYKSubject" data-home-dyk-title>'+(fr?"Une découverte liturgique":"A liturgical discovery")+'</span>'+
    '<strong data-home-dyk-fact role="status">'+(fr?"Chargement d’une notice sourcée…":"Loading a source-backed discovery…")+'</strong>'+
    '<span class="aoHomeDYKSource" data-home-dyk-source></span></button>';
}
export function homeDidYouKnowSelect(entries,date){
  const id=selectedId(date);
  const entry=Array.isArray(entries)?entries.find(x=>x?.id===id):null;
  // Source owner has already marked these glossary definitions source-backed.
  // Reject unfinished or malformed metadata; do not silently fabricate copy.
  if(entry?.status!=="SOURCE_OWNER_LOCKED"||entry?.definition_status!=="SOURCE_BACKED"||
    !Array.isArray(entry.source_ids)||!entry.source_ids.length||
    !safeText(entry.labels?.en)||!safeText(entry.labels?.fr)||
    !safeText(entry.short_definition?.en)||!safeText(entry.short_definition?.fr)||
    !safeText(entry.explanation?.en)||!safeText(entry.explanation?.fr))
    return null;
  return entry;
}
function loadEntries(win){
  if(glossaryLoad)return glossaryLoad;
  glossaryLoad=Promise.resolve().then(async()=>{
    const response=await win.fetch(GLOSSARY_URL);
    if(!response?.ok)throw Error("GLOSSARY_SOURCE_UNAVAILABLE");
    const data=await response.json();
    if(data?.schema!=="GLOSSARY_CONCEPTS_SOT_V1"||!Array.isArray(data.entries))
      throw Error("GLOSSARY_SOURCE_MALFORMED");
    return data.entries;
  }).catch(error=>{glossaryLoad=null;throw error});
  return glossaryLoad;
}
export function hydrateHomeDidYouKnow(root,win=globalThis){
  const button=root?.querySelector?.(".homeScreen [data-home-dyk-open]");
  const state=win?.AO_RUNTIME_V8?.store?.getState?.();
  const date=state?.selectedDate??root?.querySelector?.(".homeScreen [data-home-dyk-date]")?.dataset?.homeDykDate;
  if(!button||!date||typeof win?.fetch!=="function")return false;
  const fr=button.closest(".homeScreen")?.dataset?.homeLanguage==="fr";
  void loadEntries(win).then(entries=>{
    const entry=homeDidYouKnowSelect(entries,date);
    if(!button.isConnected||button.closest(".homeScreen")?.dataset?.homeLanguage!==(fr?"fr":"en"))return;
    if(!entry)throw Error("GLOSSARY_ENTRY_NOT_VERIFIED");
    button.querySelector("[data-home-dyk-title]").textContent=fr?entry.labels.fr:entry.labels.en;
    // The fact is the sourced explanatory observation, never the dictionary definition.
    button.querySelector("[data-home-dyk-fact]").textContent=fr?entry.explanation.fr:entry.explanation.en;
    button.querySelector("[data-home-dyk-source]").textContent=fr?"Glossaire · Voir la notion ›":"Glossary · Read the term ›";
    button.dataset.homeDykEntry=entry.id;
    button.disabled=false;button.removeAttribute("aria-disabled");
  }).catch(()=>{
    if(!button.isConnected)return;
    button.querySelector("[data-home-dyk-fact]").textContent=fr?
      "Notice indisponible pour le moment.":"Discovery temporarily unavailable.";
    button.querySelector("[data-home-dyk-title]").textContent=fr?"Source indisponible":"Source unavailable";
  });
  return true;
}
