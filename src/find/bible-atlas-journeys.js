/**
 * Read-only NAVIGATION projection from draft #1069's original source owner,
 * pinned blobs:
 * - journeys 7d1e3a1d1ed719ac3440d1b0d180fde6a9ee5951;
 * - 151-event exact scene concordance 8ea13c49c0285330bc0bcfe6aa3cbcf79d14c2c8.
 *
 * ONLY bilingual classification headings and exact-citation existing eventKeys.
 * Arc membership comes from the canonical eras. Thematic event membership
 * requires an EXACT citation match; all overlap/typology-only donor cases
 * are deliberately excluded. No research text, scene, claims or novel prose.
 */
export const ATLAS_JOURNEY_ARCS=Object.freeze([
  {
    "id": "arc:salvation-history",
    "title_en": "The History of Salvation",
    "title_fr": "L'histoire du salut",
    "eraKeys": [
      "ORIGINS",
      "PATRIARCHS",
      "EXODUS",
      "ISRAEL",
      "EXILE",
      "INFANCY",
      "PUBLIC",
      "PASSION",
      "RESURRECTION",
      "APOSTLES",
      "REVELATION"
    ]
  },
  {
    "id": "arc:beginnings",
    "title_en": "The Beginnings",
    "title_fr": "Les origines",
    "eraKeys": [
      "ORIGINS"
    ]
  },
  {
    "id": "arc:story-of-israel",
    "title_en": "The Story of Israel",
    "title_fr": "L'histoire d'Israël",
    "eraKeys": [
      "PATRIARCHS",
      "EXODUS",
      "ISRAEL",
      "EXILE"
    ]
  },
  {
    "id": "arc:abraham",
    "title_en": "Abraham and the Patriarchs",
    "title_fr": "Abraham et les patriarches",
    "eraKeys": [
      "PATRIARCHS"
    ]
  },
  {
    "id": "arc:exodus",
    "title_en": "The Exodus and Covenant",
    "title_fr": "L'Exode et l'Alliance",
    "eraKeys": [
      "EXODUS"
    ]
  },
  {
    "id": "arc:israel-prophets",
    "title_en": "The Kingdom and Prophets",
    "title_fr": "Le Royaume et les prophètes",
    "eraKeys": [
      "ISRAEL"
    ]
  },
  {
    "id": "arc:exile-restoration",
    "title_en": "Exile, Return and Fidelity",
    "title_fr": "Exil, retour et fidélité",
    "eraKeys": [
      "EXILE"
    ]
  },
  {
    "id": "arc:life-of-christ",
    "title_en": "The Life of Christ",
    "title_fr": "La vie du Christ",
    "eraKeys": [
      "INFANCY",
      "PUBLIC",
      "PASSION",
      "RESURRECTION"
    ]
  },
  {
    "id": "arc:apostolic-church",
    "title_en": "The Apostolic Church",
    "title_fr": "L'Église apostolique",
    "eraKeys": [
      "APOSTLES"
    ]
  },
  {
    "id": "arc:apocalypse",
    "title_en": "The Apocalypse",
    "title_fr": "L'Apocalypse",
    "eraKeys": [
      "REVELATION"
    ]
  }
].map(x=>Object.freeze({...x,eraKeys:Object.freeze(x.eraKeys)})));
export const ATLAS_JOURNEY_THEMES=Object.freeze([
  {
    "id": "theme:promises-covenants",
    "title_en": "Promises and Covenants",
    "title_fr": "Promesses et Alliances",
    "eventKeys": [
      "biblical:passage:genesis-22-1-19",
      "biblical:passage:exodus-12-1-28",
      "biblical:passage:exodus-20-1-17"
    ],
    "unreviewed": true
  },
  {
    "id": "theme:sacrifice-passover",
    "title_en": "Sacrifice and Passover",
    "title_fr": "Sacrifice et Pâque",
    "eventKeys": [
      "biblical:passage:genesis-22-1-19",
      "biblical:passage:exodus-12-1-28",
      "biblical:passage:exodus-14-15-31",
      "biblical:passage:exodus-16-1-36",
      "biblical:event:tabgha-e1",
      "biblical:event:golgotha-e2"
    ],
    "unreviewed": true
  },
  {
    "id": "theme:divine-calling",
    "title_en": "God Calls His People",
    "title_fr": "Dieu appelle son peuple",
    "eventKeys": [
      "biblical:passage:exodus-3-1-15",
      "biblical:event:nazareth-e1",
      "biblical:event:jordan-east-bank-additional-008",
      "biblical:event:beatitudes-additional-021"
    ],
    "unreviewed": true
  },
  {
    "id": "theme:prayer-intercession",
    "title_en": "Prayer and Intercession",
    "title_fr": "Prière et intercession",
    "eventKeys": [
      "biblical:event:ein-karem-e1",
      "biblical:event:bethany-additional-057",
      "biblical:event:gethsemane-e1",
      "biblical:passage:acts-20-17-38"
    ],
    "unreviewed": true
  },
  {
    "id": "theme:signs-miracles",
    "title_en": "Signs and Miracles",
    "title_fr": "Signes et miracles",
    "eventKeys": [
      "biblical:passage:exodus-7-14-25",
      "biblical:passage:exodus-14-15-31",
      "biblical:passage:exodus-16-1-36",
      "biblical:event:cana-e1",
      "biblical:event:capernaum-miracle-04",
      "biblical:event:capernaum-e2",
      "biblical:event:galilee-sea-e2",
      "biblical:event:galilee-sea-e3",
      "biblical:event:cana-miracle-02",
      "biblical:event:nain-e1",
      "biblical:event:tabgha-e1",
      "biblical:event:bethsaida-miracle-25",
      "biblical:event:siloam-miracle-26",
      "biblical:event:bethany-e1",
      "biblical:event:christ-tomb-e2",
      "biblical:passage:acts-20-7-12"
    ],
    "unreviewed": true
  },
  {
    "id": "theme:women-scripture",
    "title_en": "Women of Sacred Scripture",
    "title_fr": "Les femmes de l'Écriture",
    "eventKeys": [
      "biblical:event:ein-karem-e1",
      "biblical:event:bethlehem-e1",
      "biblical:event:jerusalem-temple-e1",
      "biblical:event:sychar-e1",
      "biblical:event:bethany-additional-057",
      "biblical:event:bethany-e2",
      "biblical:event:christ-tomb-e2",
      "biblical:passage:acts-16-11-15"
    ],
    "unreviewed": true
  },
  {
    "id": "theme:kingdom-and-mercy",
    "title_en": "Kingdom and Mercy",
    "title_fr": "Royaume et miséricorde",
    "eventKeys": [],
    "unreviewed": true
  },
  {
    "id": "theme:prophecy-fulfilment",
    "title_en": "Prophecy and Fulfilment",
    "title_fr": "Prophétie et accomplissement",
    "eventKeys": [
      "biblical:event:nazareth-e1",
      "biblical:event:nazareth-additional-001",
      "biblical:event:bethlehem-e2",
      "biblical:event:caesarea-philippi-additional-044",
      "biblical:event:olives-e3"
    ],
    "unreviewed": true
  },
  {
    "id": "theme:from-exile-to-home",
    "title_en": "Journey, Exile and Homecoming",
    "title_fr": "Voyage, exil et retour",
    "eventKeys": [
      "biblical:passage:exodus-12-31-42",
      "biblical:passage:joshua-3-1-17",
      "biblical:event:egypt-e1",
      "biblical:event:egypt-e2",
      "biblical:passage:acts-28-16-31"
    ],
    "unreviewed": true
  }
].map(x=>Object.freeze({...x,eventKeys:Object.freeze(x.eventKeys)})));
const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const label=(lang,en,fr)=>lang==="fr"?fr:en;

/** Exact source-key identities only; no overlapping/interpretive auto-promotion. */
export function atlasJourneyIndex(stops,chapters){
 if(!Array.isArray(stops)||stops.length!==151||!Array.isArray(chapters)||chapters.length!==37)return null;
 const keys=new Set(stops.map(x=>x.eventKey));
 if(keys.size!==151||chapters.reduce((n,x)=>n+x.count,0)!==151)return null;
 const byKey=new Map(stops.map((x,i)=>[x.eventKey,i]));
 const arcs=ATLAS_JOURNEY_ARCS.map(a=>{
  const set=new Set(a.eraKeys),group=chapters.filter(c=>set.has(c.era));
  if(!group.length||group.some(c=>!c.eventKeys.every(key=>byKey.has(key)&&set.has(stops[byKey.get(key)].era))))return null;
  return {...a,chapters:group};
 });
 if(arcs.includes(null)||arcs.length!==10||arcs[0].chapters.length!==37)return null;
 const themes=ATLAS_JOURNEY_THEMES.map(t=>{
  // Exact key resolves against the current canonical index, not a guessed
  // research display index. Broken source provenance fails closed.
  const indexes=t.eventKeys.map(key=>byKey.get(key));
  if(indexes.some(i=>i===undefined)||new Set(indexes).size!==indexes.length||indexes.some((i,k)=>k&&i<=indexes[k-1]))return null;
  return {...t,indices:indexes};
 });
 if(themes.includes(null)||themes.length!==9)return null;
 return Object.freeze({arcs:Object.freeze(arcs),themes:Object.freeze(themes)});
}

export function renderAtlasJourneyViews(stops,chapters,lang="en",index=0){
 const data=atlasJourneyIndex(stops,chapters);
 if(!data)return "";
 const chapterButton=ch=>'<button type="button" data-bible-reading-start="'+ch.start+
  '" data-bible-reading-end="'+ch.end+'" aria-pressed="'+String(index>=ch.start&&index<=ch.end)+'">'+
  '<span>'+esc(label(lang,ch.title_en,ch.title_fr))+'</span><small>'+ch.count+' '+
  esc(label(lang,ch.count===1?"episode":"episodes",ch.count===1?"épisode":"épisodes"))+'</small></button>';
 const themes=data.themes.map(t=>{
  const n=t.indices.length;
  return '<details class="aoBibleJourneyDisclosure" data-bible-theme="'+esc(t.id)+'"><summary>'+
    '<span>'+esc(label(lang,t.title_en,t.title_fr))+'</span><small>'+
    (n?String(n)+" "+esc(label(lang,"source-matched passages","passages rapprochés par citation")):
     esc(label(lang,"No exact match yet","Aucune correspondance exacte")))+'</small></summary>'+
    (n?'<div class="aoBibleReadingGrid">'+t.indices.map(i=>'<button type="button" data-bible-reading-start="'+i+
     '" data-bible-reading-end="'+i+'" aria-pressed="'+String(index===i)+'"><span>'+
     esc(label(lang,stops[i].title_en,stops[i].title_fr))+'</span><small>'+
     esc(stops[i].reference)+'</small></button>').join("")+'</div>':
     '<p class="aoBibleReadingDisclaimer">'+esc(label(lang,
      "Awaiting exact source matching; no unreviewed connections added.",
      "Rapprochement exact des sources à vérifier ; aucun lien non vérifié n’est ajouté."))+'</p>')+'</details>';
 }).join("");
 return '<div data-bible-reading-view="arcs" hidden class="aoBibleReadingView">'+
  '<p class="aoBibleReadingDisclaimer">'+esc(label(lang,
    "Ten reading arcs from selected Scripture chapters · not ten complete authored histories",
    "Dix parcours des chapitres choisis · pas dix récits historiques complets"))+'</p>'+
  data.arcs.map(a=>'<details class="aoBibleJourneyDisclosure" data-bible-arc="'+esc(a.id)+'"><summary>'+
    '<span>'+esc(label(lang,a.title_en,a.title_fr))+'</span><small>'+a.chapters.length+' '+
    esc(label(lang,a.chapters.length===1?"chapter":"chapters",a.chapters.length===1?"chapitre":"chapitres"))+'</small></summary>'+
    '<div class="aoBibleReadingGrid">'+a.chapters.map(chapterButton).join("")+'</div></details>').join("")+'</div>'+
  '<div data-bible-reading-view="themes" hidden class="aoBibleReadingView">'+
  '<p class="aoBibleReadingDisclaimer">'+esc(label(lang,
    "Provisional thematic selection · only exact Scripture-citation matches are linked, not unreviewed theological correspondences.",
    "Parcours thématiques provisoires · seuls les passages avec citation biblique exacte sont liés, sans correspondances théologiques non vérifiées."))+'</p>'+
  themes+'</div>';
}
