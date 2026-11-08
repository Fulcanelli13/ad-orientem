import {loadDykPrioritySelection,dykPublishedCandidates,loadDykHistoricalRelease,dykHistoricalCandidates,dykHomeRotationSlot,DYK_GLOSSARY_FALLBACK_IDS} from "./dyk-published-feed.js";
// Transitional Home "Did you know?" projection from the already published
// bilingual Glossary. No second fact bank, generated AI claims or unreviewed
// Weiser/Pitrè research. The canonical Discovery owner replaces this adapter
// after its independent editorial publication gate is satisfied.
const GLOSSARY_URL=new URL("../../data/glossary/concepts-151-300.v1.json",import.meta.url);
export const HOME_DYK_GLOSSARY_IDS=DYK_GLOSSARY_FALLBACK_IDS;
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
  },
  "G197": {
    "en": "In the traditional vesting sequence, even the amice has its own prayer as the priest prepares for Mass.",
    "fr": "Dans la tradition liturgique, même l’amict possède sa propre prière lorsque le prêtre revêt les ornements pour la Messe."
  },
  "G200": {
    "en": "The priest’s chasuble has two traditional Latin names, planeta and casula, although its cut has changed over the centuries.",
    "fr": "La chasuble du prêtre porte deux noms latins traditionnels, planeta et casula, même si sa coupe a changé au fil des siècles."
  },
  "G203": {
    "en": "The cope is traditionally used for processions and other ceremonies; strictly speaking, it is not a vestment for celebrating Mass.",
    "fr": "La chape sert traditionnellement dans les processions et d’autres cérémonies ; au sens strict, ce n’est pas un ornement pour célébrer la Messe."
  },
  "G212": {
    "en": "In the traditional arrangement before Mass, the burse is normally placed above the chalice veil.",
    "fr": "Dans l’agencement traditionnel avant la Messe, la bourse se place normalement au-dessus du voile de calice."
  },
  "G215": {
    "en": "During the traditional Roman Mass, the Missal and its stand are moved between the Epistle and Gospel sides at appointed moments.",
    "fr": "Pendant la Messe romaine traditionnelle, le Missel et son pupitre passent d’un côté à l’autre de l’autel, entre l’Épître et l’Évangile, aux moments prescrits."
  },
  "G216": {
    "en": "Where the Offertory includes incensation, the priest washes his hands afterward; at Low Mass the Lavabo follows the offering rites.",
    "fr": "Lorsque l’offertoire comporte un encensement, le prêtre se lave les mains ensuite ; à la Messe basse, le lavabo suit les rites d’offrande."
  },
  "G218": {
    "en": "The sanctuary lamp indicates that the Blessed Sacrament is reserved; it is not merely decorative lighting.",
    "fr": "La lampe du sanctuaire indique la présence du Saint-Sacrement en réserve ; elle n’est pas simplement décorative."
  },
  "G224": {
    "en": "In traditional ceremonial, torchbearers have an especially visible role at the elevations and around Communion.",
    "fr": "Dans le cérémonial traditionnel, les céroféraires ont un rôle particulièrement visible lors des élévations et autour de la Communion."
  },
  "G241": {
    "en": "Saint Pius X assigned Gregorian chant a normative place in sacred music; not every unaccompanied Latin song is Gregorian chant.",
    "fr": "Saint Pie X a donné au chant grégorien une place normative dans la musique sacrée ; tout chant latin sans accompagnement n’est pas pour autant grégorien."
  },
  "G242": {
    "en": "Gregorian chant belongs to the wider family of plainchant, but not every plainchant melody belongs to the Gregorian repertory.",
    "fr": "Le chant grégorien appartient à la famille plus large du plain-chant, mais toutes les mélodies de plain-chant ne font pas partie du répertoire grégorien."
  },
  "G248": {
    "en": "Psalm tones are reusable chant formulas; a completely new melody is not composed for each successive verse.",
    "fr": "Les tons psalmodiques sont des formules de chant réutilisables ; chaque verset ne reçoit pas une mélodie entièrement nouvelle."
  },
  "G255": {
    "en": "The Kyrie retains its Greek words inside the Latin Roman rite.",
    "fr": "Le Kyrie conserve ses paroles grecques au sein du rite romain latin."
  },
  "G259": {
    "en": "In traditional sung practice, the Benedictus may be sung separately from the Sanctus, although the two are one liturgical text.",
    "fr": "Dans la pratique chantée traditionnelle, le Benedictus peut être chanté séparément du Sanctus, bien que les deux forment un seul texte liturgique."
  },
  "G260": {
    "en": "The Agnus Dei has a different form in Requiem Masses, where its petitions reflect the prayer for the departed.",
    "fr": "L’Agnus Dei prend une forme différente dans les Messes de Requiem, où ses demandes reflètent la prière pour les défunts."
  },
  "G274": {
    "en": "A local liturgical calendar can add proper celebrations not found in the universal Roman calendar, changing what is observed on a given date.",
    "fr": "Un calendrier liturgique particulier peut ajouter des célébrations propres absentes du calendrier romain universel et modifier ce qui est célébré à une date donnée."
  },
  "G283": {
    "en": "The letter N. in a liturgical text stands for nomen, a name to be supplied from context, not a letter to be pronounced aloud.",
    "fr": "La lettre N. dans un texte liturgique représente nomen, un nom à préciser selon le contexte, et non une lettre à prononcer."
  },
  "G290": {
    "en": "In traditional Mass rubrics, secreto tells the priest how quietly to recite a prayer; it does not mean the prayer is secret doctrine.",
    "fr": "Dans les rubriques de la Messe traditionnelle, secreto indique la manière discrète de réciter une prière ; cela ne signifie pas qu’elle contient une doctrine secrète."
  },
  "G300": {
    "en": "The rubric osculatur altare directs the celebrant to kiss the altar at a specified moment in the rite.",
    "fr": "La rubrique osculatur altare prescrit au célébrant de baiser l’autel à un moment précis du rite."
  }
});
let glossaryLoad=null;
const safeText=value=>typeof value==="string"?value.trim():"";
function selectedId(date){
 return dykHomeRotationSlot(date,[],HOME_DYK_GLOSSARY_IDS)??HOME_DYK_GLOSSARY_IDS[0];
}

export function homeDidYouKnowMarkup(language="en"){
  const fr=language==="fr";
  return '<button type="button" class="aoHomeDYK" data-home-dyk-open disabled aria-disabled="true">'+
    '<span class="aoHomeDYKLabel">'+(fr?"LE SAVIEZ-VOUS ?":"DID YOU KNOW?")+'</span>'+
    '<span class="aoHomeDYKSubject" data-home-dyk-title>'+(fr?"Une découverte liturgique":"A liturgical discovery")+'</span>'+
    '<strong data-home-dyk-fact role="status">'+(fr?"Chargement d’une notice sourcée…":"Loading a source-backed discovery…")+'</strong>'+
    '<span class="aoHomeDYKSource" data-home-dyk-source></span></button>';
}
export function homeDidYouKnowSelect(entries,date,requestedId=selectedId(date)){
  const id=requestedId;
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
  // The same safe Home card owns both kinds of discovery. Select once after
  // loading the two canonical sources, avoiding a misleading intermediate flash.
  void Promise.all([
    loadEntries(win).catch(()=>[]),
    loadDykPrioritySelection(win).catch(()=>null),
    loadDykHistoricalRelease(win).catch(()=>null)
  ]).then(([entries,data,historical])=>{
    const screen=button.closest(".homeScreen");
    const selectedDate=win?.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate??
      root?.querySelector?.(".homeScreen [data-home-dyk-date]")?.dataset?.homeDykDate;
    if(!button.isConnected||screen?.dataset?.homeLanguage!==(fr?"fr":"en")||selectedDate!==date)return;
    const candidates=[
      ...(data?dykPublishedCandidates(data,date):[]),
      ...(historical?dykHistoricalCandidates(historical,date):[])
    ];
    const slot=dykHomeRotationSlot(date,candidates.map(row=>row.id),HOME_DYK_GLOSSARY_IDS);
    const published=candidates.find(row=>row.id===slot);
    if(published){
      const fact=published.pilot_home_copy||published.editorial_review_copy;
      const historical=published.source_family!=="ROMAN_MASS_1962";
      button.querySelector("[data-home-dyk-title]").textContent=historical?
        (fr?"Coutumes et traditions":"Customs and traditions"):
        (fr?"Le Canon romain":"The Roman Canon");
      button.querySelector("[data-home-dyk-fact]").textContent=fact[fr?"fr":"en"];
      button.querySelector("[data-home-dyk-source]").textContent=fr?
        "Découverte · Lire la source ›":"Discovery · Read the source ›";
      delete button.dataset.homeDykEntry;
      button.dataset.homeDykFactId=published.id;
      button.dataset.homeDykFactDate=date;
    }else{
      const id=slot&&/^G\d{3}$/.test(slot)?slot:selectedId(date);
      const entry=homeDidYouKnowSelect(entries,date,id);
      if(!entry)throw Error("GLOSSARY_ENTRY_NOT_VERIFIED");
      button.querySelector("[data-home-dyk-title]").textContent=fr?entry.labels.fr:entry.labels.en;
      button.querySelector("[data-home-dyk-fact]").textContent=HOME_DYK_GLOSSARY_FACTS[entry.id][fr?"fr":"en"];
      button.querySelector("[data-home-dyk-source]").textContent=fr?
        "Glossaire · Voir la notion ›":"Glossary · Read the term ›";
      delete button.dataset.homeDykFactId;
      delete button.dataset.homeDykFactDate;
      button.dataset.homeDykEntry=entry.id;
    }
    button.disabled=false;
    button.removeAttribute("aria-disabled");
  }).catch(()=>{
    if(!button.isConnected)return;
    button.querySelector("[data-home-dyk-fact]").textContent=fr?
      "Notice indisponible pour le moment.":"Discovery temporarily unavailable.";
    button.querySelector("[data-home-dyk-title]").textContent=fr?"Source indisponible":"Source unavailable";
    button.disabled=true;
    button.setAttribute("aria-disabled","true");
  });
  return true;
}
