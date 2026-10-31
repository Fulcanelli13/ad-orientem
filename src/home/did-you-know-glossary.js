// Transitional Home "Did you know?" projection from the already published
// bilingual Glossary. No second fact bank, generated AI claims or unreviewed
// Weiser/Pitrè research. The canonical Discovery owner replaces this adapter
// after its independent editorial publication gate is satisfied.
const GLOSSARY_URL=new URL("../../data/glossary/concepts-151-300.v1.json",import.meta.url);
export const HOME_DYK_GLOSSARY_IDS=Object.freeze(["G195","G213","G219","G235","G194","G240"]);
// Reviewed public preview copy. Each bilingual observation is a narrow paraphrase
// of the matching source-backed Glossary explanation; never use the definition
// as the discovery. This is NOT the unpublished 1,001-candidate DYK corpus.
export const HOME_DYK_GLOSSARY_FACTS=Object.freeze({
  "G195": {
    "en": "The incense boat is often shaped like a little boat; a spoon transfers its incense to the thurible’s coals.",
    "fr": "La navette à encens est souvent en forme de petit bateau ; une cuillère sert à déposer l’encens sur les charbons de l’encensoir."
  },
  "G213": {
    "en": "Three altar cards can display fixed Mass texts, including the Lavabo, parts of the Canon and the Last Gospel.",
    "fr": "Les trois canons d’autel peuvent présenter des textes fixes de la messe, notamment le lavabo, des parties du Canon et le Dernier Évangile."
  },
  "G219": {
    "en": "In older Latin practice, consecrated altar stones containing relics were used especially with portable altars—not universally required today.",
    "fr": "Dans l’ancienne discipline latine, les pierres d’autel consacrées contenant des reliques servaient notamment aux autels portatifs ; elles ne sont pas requises partout aujourd’hui."
  },
  "G235": {
    "en": "The Sunday sprinkling chant changes with Eastertide: Asperges me gives way to Vidi aquam in the traditional Roman rite.",
    "fr": "Le chant de l’aspersion dominicale change au temps pascal : Asperges me cède la place à Vidi aquam dans le rite romain traditionnel."
  },
  "G194": {
    "en": "At the traditional Roman Mass, the thurible is entrusted to the thurifer and handled according to specific ceremonial directions—not simply swung at will.",
    "fr": "À la messe romaine traditionnelle, l’encensoir est confié au thuriféraire et manié selon des règles cérémonielles précises, et non librement."
  },
  "G240": {
    "en": "At a Solemn Mass, the liturgical kiss of peace can pass among the ministers in ceremonial order; it is not a general congregational greeting.",
    "fr": "À la messe solennelle, le baiser de paix peut se transmettre entre les ministres selon l’ordre du cérémonial : ce n’est pas une salutation générale de l’assemblée."
  }
});
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
    !safeText(entry.explanation?.en)||!safeText(entry.explanation?.fr)||
    !safeText(HOME_DYK_GLOSSARY_FACTS[id]?.en)||!safeText(HOME_DYK_GLOSSARY_FACTS[id]?.fr))
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
    button.querySelector("[data-home-dyk-fact]").textContent=HOME_DYK_GLOSSARY_FACTS[entry.id][fr?"fr":"en"];
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
