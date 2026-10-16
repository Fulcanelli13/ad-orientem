import {renderAtlasJourneyViews} from "./bible-atlas-journeys.js";
// Reading-chapter NAVIGATION ONLY, sourced from the original 151-event Biblical Atlas.
// Source witness: PR #1069, data/explore/biblical-reading-continuity-review.v1.json,
// pinned research blob 8ea13c49c0285330bc0bcfe6aa3cbcf79d14c2c8 (15 October 2026).
// Research status for the chapter *prose* was NOT approved. We import ONLY ordered
// chapter labels, canonical event keys, and era grouping; never source prose,
// imported Bible passages, new chronology, inferred dates or extra map pins.
export const ATLAS_READING_CHAPTERS=Object.freeze([
  {
    "id": "reading-chapter:beginnings-creation",
    "era": "ORIGINS",
    "title_en": "Creation, the Fall and first generations",
    "title_fr": "Création, Chute et premières générations",
    "eventKeys": [
      "biblical:passage:genesis-1-1-31",
      "biblical:passage:genesis-3-1-24",
      "biblical:passage:genesis-4-1-16"
    ]
  },
  {
    "id": "reading-chapter:beginnings-flood",
    "era": "ORIGINS",
    "title_en": "The Flood, covenant and Babel",
    "title_fr": "Déluge, alliance et Babel",
    "eventKeys": [
      "biblical:passage:genesis-7-1-24",
      "biblical:passage:genesis-9-8-17",
      "biblical:passage:genesis-11-1-9"
    ]
  },
  {
    "id": "reading-chapter:patriarchs-abraham",
    "era": "PATRIARCHS",
    "title_en": "Abraham and the promise",
    "title_fr": "Abraham et la promesse",
    "eventKeys": [
      "biblical:passage:genesis-11-31",
      "biblical:passage:genesis-12-1-9",
      "biblical:passage:genesis-14-18-20",
      "biblical:passage:genesis-15-1-21",
      "biblical:passage:genesis-18-1-8",
      "biblical:passage:genesis-21-1-7",
      "biblical:passage:genesis-22-1-19"
    ]
  },
  {
    "id": "reading-chapter:patriarchs-jacob",
    "era": "PATRIARCHS",
    "title_en": "Jacob and Israel",
    "title_fr": "Jacob et Israël",
    "eventKeys": [
      "biblical:passage:genesis-28-10-22",
      "biblical:passage:genesis-32-24-32"
    ]
  },
  {
    "id": "reading-chapter:patriarchs-joseph",
    "era": "PATRIARCHS",
    "title_en": "Joseph and the descent into Egypt",
    "title_fr": "Joseph et la descente en Égypte",
    "eventKeys": [
      "biblical:passage:genesis-37-18-36",
      "biblical:passage:genesis-41-37-45",
      "biblical:passage:genesis-46-1-7"
    ]
  },
  {
    "id": "reading-chapter:exodus-calling",
    "era": "EXODUS",
    "title_en": "The calling of Moses",
    "title_fr": "La vocation de Moïse",
    "eventKeys": [
      "biblical:passage:exodus-2-1-10",
      "biblical:passage:exodus-3-1-15",
      "biblical:passage:exodus-7-14-25"
    ]
  },
  {
    "id": "reading-chapter:exodus-deliverance",
    "era": "EXODUS",
    "title_en": "Passover and deliverance",
    "title_fr": "La Pâque et la délivrance",
    "eventKeys": [
      "biblical:passage:exodus-12-1-28",
      "biblical:passage:exodus-12-31-42",
      "biblical:passage:exodus-14-15-31",
      "biblical:passage:exodus-16-1-36"
    ]
  },
  {
    "id": "reading-chapter:exodus-sinai",
    "era": "EXODUS",
    "title_en": "The covenant at Sinai",
    "title_fr": "L'Alliance au Sinaï",
    "eventKeys": [
      "biblical:passage:exodus-19-16-20",
      "biblical:passage:exodus-20-1-17",
      "biblical:passage:exodus-32-1-35",
      "biblical:passage:exodus-40-1-38"
    ]
  },
  {
    "id": "reading-chapter:exodus-land",
    "era": "EXODUS",
    "title_en": "Toward the Promised Land",
    "title_fr": "Vers la Terre promise",
    "eventKeys": [
      "biblical:passage:deuteronomy-34-1-6",
      "biblical:passage:joshua-3-1-17",
      "biblical:passage:joshua-6-1-27"
    ]
  },
  {
    "id": "reading-chapter:israel-samuel-david",
    "era": "ISRAEL",
    "title_en": "Samuel, Saul and David",
    "title_fr": "Samuel, Saül et David",
    "eventKeys": [
      "biblical:passage:1samuel-1-9-20",
      "biblical:passage:1samuel-10-1-8",
      "biblical:passage:1samuel-17-1-54"
    ]
  },
  {
    "id": "reading-chapter:israel-kingdom",
    "era": "ISRAEL",
    "title_en": "David's kingdom and the Temple",
    "title_fr": "Le royaume de David et le Temple",
    "eventKeys": [
      "biblical:passage:2samuel-2-1-4",
      "biblical:passage:2samuel-5-6-10",
      "biblical:passage:1kings-8-1-66",
      "biblical:passage:1kings-12-1-24"
    ]
  },
  {
    "id": "reading-chapter:israel-prophets",
    "era": "ISRAEL",
    "title_en": "The prophets and divided kingdoms",
    "title_fr": "Les prophètes et les royaumes divisés",
    "eventKeys": [
      "biblical:passage:1kings-18-19-39",
      "biblical:passage:1kings-19-1-18",
      "biblical:passage:isaiah-6-1-13",
      "biblical:passage:2kings-17-1-18",
      "biblical:passage:2kings-23-1-25",
      "biblical:passage:jeremiah-7-1-15"
    ]
  },
  {
    "id": "reading-chapter:exile-experience",
    "era": "EXILE",
    "title_en": "Exile and the trials of fidelity",
    "title_fr": "L'exil et les épreuves de fidélité",
    "eventKeys": [
      "biblical:passage:tobit-1-10",
      "biblical:passage:daniel-1-1-21",
      "biblical:passage:ezekiel-1-1-28",
      "biblical:passage:2kings-25-1-12",
      "biblical:passage:2kings-25-8-12"
    ]
  },
  {
    "id": "reading-chapter:exile-deliverance",
    "era": "EXILE",
    "title_en": "Judith and Esther",
    "title_fr": "Judith et Esther",
    "eventKeys": [
      "biblical:passage:judith-13-1-20",
      "biblical:passage:esther-4-1-17"
    ]
  },
  {
    "id": "reading-chapter:exile-restoration",
    "era": "EXILE",
    "title_en": "Return and rebuilding",
    "title_fr": "Le retour et la reconstruction",
    "eventKeys": [
      "biblical:passage:ezra-1-1-11",
      "biblical:passage:ezra-6-13-22",
      "biblical:passage:nehemiah-8-1-12"
    ]
  },
  {
    "id": "reading-chapter:exile-sacred-texts",
    "era": "EXILE",
    "title_en": "Prayers, visions and Daniel",
    "title_fr": "Prières, visions et Daniel",
    "eventKeys": [
      "biblical:passage:esther-14-1-19",
      "biblical:passage:baruch-5-1-9",
      "biblical:passage:daniel-3-24-90",
      "biblical:passage:daniel-13-1-64",
      "biblical:passage:daniel-14-1-22",
      "biblical:passage:daniel-14-23-42"
    ]
  },
  {
    "id": "reading-chapter:exile-wisdom-a",
    "era": "EXILE",
    "title_en": "Wisdom in Israel",
    "title_fr": "La Sagesse en Israël",
    "eventKeys": [
      "biblical:passage:sirach-24-1-22"
    ]
  },
  {
    "id": "reading-chapter:exile-maccabees",
    "era": "EXILE",
    "title_en": "The Maccabees and fidelity",
    "title_fr": "Les Maccabées et la fidélité",
    "eventKeys": [
      "biblical:passage:2maccabees-7-1-42",
      "biblical:passage:1maccabees-2-1-5",
      "biblical:passage:1maccabees-4-36-59"
    ]
  },
  {
    "id": "reading-chapter:exile-wisdom-b",
    "era": "EXILE",
    "title_en": "The gift of Wisdom",
    "title_fr": "Le don de la Sagesse",
    "eventKeys": [
      "biblical:passage:wisdom-7-7-14"
    ]
  },
  {
    "id": "reading-chapter:infancy-annunciation",
    "era": "INFANCY",
    "title_en": "Annunciation and Nativity",
    "title_fr": "Annonciation et Nativité",
    "eventKeys": [
      "biblical:event:nazareth-e1",
      "biblical:event:nazareth-additional-001",
      "biblical:event:ein-karem-e1",
      "biblical:event:bethlehem-e1"
    ]
  },
  {
    "id": "reading-chapter:infancy-holy-family",
    "era": "INFANCY",
    "title_en": "The Holy Family and early journeys",
    "title_fr": "La Sainte Famille et ses premiers voyages",
    "eventKeys": [
      "biblical:event:bethlehem-additional-002",
      "biblical:event:jerusalem-temple-e1",
      "biblical:event:bethlehem-e2",
      "biblical:event:bethlehem-additional-003",
      "biblical:event:egypt-e1",
      "biblical:event:egypt-e2"
    ]
  },
  {
    "id": "reading-chapter:infancy-hidden",
    "era": "INFANCY",
    "title_en": "The hidden life of Jesus",
    "title_fr": "La vie cachée de Jésus",
    "eventKeys": [
      "biblical:event:jerusalem-temple-e2",
      "biblical:event:nazareth-additional-006"
    ]
  },
  {
    "id": "reading-chapter:public-beginnings",
    "era": "PUBLIC",
    "title_en": "The beginning of Christ's ministry",
    "title_fr": "Le début du ministère du Christ",
    "eventKeys": [
      "biblical:event:jordan-baptism-e1",
      "biblical:event:jordan-east-bank-additional-008",
      "biblical:event:judean-wilderness-e1",
      "biblical:event:cana-e1",
      "biblical:event:jerusalem-temple-e3",
      "biblical:event:galilee-sea-e1"
    ]
  },
  {
    "id": "reading-chapter:public-teaching",
    "era": "PUBLIC",
    "title_en": "Teachings and healings in Galilee",
    "title_fr": "Enseignements et guérisons en Galilée",
    "eventKeys": [
      "biblical:event:capernaum-e1",
      "biblical:event:capernaum-miracle-04",
      "biblical:event:capernaum-e2",
      "biblical:event:beatitudes-e2",
      "biblical:event:galilee-sea-e2",
      "biblical:event:galilee-sea-e3",
      "biblical:event:beatitudes-additional-021"
    ]
  },
  {
    "id": "reading-chapter:public-encounters",
    "era": "PUBLIC",
    "title_en": "Encounters, signs and Bread of Life",
    "title_fr": "Rencontres, signes et Pain de vie",
    "eventKeys": [
      "biblical:event:sychar-e1",
      "biblical:event:sychar-additional-013",
      "biblical:event:cana-miracle-02",
      "biblical:event:bethesda-miracle-18",
      "biblical:event:nain-e1",
      "biblical:event:tabgha-e1",
      "biblical:event:capernaum-e3",
      "biblical:event:bethsaida-miracle-25"
    ]
  },
  {
    "id": "reading-chapter:public-transfiguration",
    "era": "PUBLIC",
    "title_en": "Confession, Passion prophecy and Transfiguration",
    "title_fr": "Confession, prophétie de la Passion et Transfiguration",
    "eventKeys": [
      "biblical:event:caesarea-philippi-e1",
      "biblical:event:caesarea-philippi-additional-044",
      "biblical:event:transfiguration-e1",
      "biblical:event:transfiguration-additional-045",
      "biblical:event:siloam-miracle-26"
    ]
  },
  {
    "id": "reading-chapter:public-toward-jerusalem",
    "era": "PUBLIC",
    "title_en": "Toward Jerusalem",
    "title_fr": "Vers Jérusalem",
    "eventKeys": [
      "biblical:event:bethany-e1",
      "biblical:event:bethany-additional-057",
      "biblical:event:bethany-e2",
      "biblical:event:jericho-e1",
      "biblical:event:jericho-e2"
    ]
  },
  {
    "id": "reading-chapter:passion-entry-supper",
    "era": "PASSION",
    "title_en": "Jerusalem and the Last Supper",
    "title_fr": "Jérusalem et la Cène",
    "eventKeys": [
      "biblical:event:bethphage-e1",
      "biblical:event:olives-e1",
      "biblical:event:cenacle-e1",
      "biblical:event:cenacle-e2"
    ]
  },
  {
    "id": "reading-chapter:passion-arrest-trial",
    "era": "PASSION",
    "title_en": "Agony, arrest and trial",
    "title_fr": "Agonie, arrestation et procès",
    "eventKeys": [
      "biblical:event:gethsemane-e1",
      "biblical:event:gethsemane-e2",
      "biblical:event:jerusalem-trial-e2",
      "biblical:event:jerusalem-trial-e3"
    ]
  },
  {
    "id": "reading-chapter:passion-calvary",
    "era": "PASSION",
    "title_en": "Calvary and burial",
    "title_fr": "Calvaire et sépulture",
    "eventKeys": [
      "biblical:event:golgotha-e2",
      "biblical:event:golgotha-e3",
      "biblical:event:christ-tomb-e1"
    ]
  },
  {
    "id": "reading-chapter:resurrection",
    "era": "RESURRECTION",
    "title_en": "The Risen Christ and Ascension",
    "title_fr": "Le Christ ressuscité et l'Ascension",
    "eventKeys": [
      "biblical:event:christ-tomb-e2",
      "biblical:event:christ-tomb-e3",
      "biblical:event:emmaus-e1",
      "biblical:event:cenacle-e3",
      "biblical:event:galilee-sea-e4",
      "biblical:event:olives-e3"
    ]
  },
  {
    "id": "reading-chapter:apostles-church",
    "era": "APOSTLES",
    "title_en": "Pentecost and the earliest Church",
    "title_fr": "Pentecôte et la première Église",
    "eventKeys": [
      "biblical:passage:acts-2-1-41",
      "biblical:passage:acts-3-1-10",
      "biblical:passage:acts-7-54-60",
      "biblical:passage:acts-8-26-40"
    ]
  },
  {
    "id": "reading-chapter:apostles-conversion",
    "era": "APOSTLES",
    "title_en": "Peter, Saul and Antioch",
    "title_fr": "Pierre, Saul et Antioche",
    "eventKeys": [
      "biblical:passage:acts-9-1-22",
      "biblical:passage:acts-9-29-30",
      "biblical:passage:acts-9-36-43",
      "biblical:passage:acts-10-1-48",
      "biblical:passage:acts-11-19-26"
    ]
  },
  {
    "id": "reading-chapter:apostles-first-missions",
    "era": "APOSTLES",
    "title_en": "The apostolic missions",
    "title_fr": "Les missions apostoliques",
    "eventKeys": [
      "biblical:passage:acts-14-8-18",
      "biblical:passage:acts-15-1-29",
      "biblical:passage:acts-16-11-15",
      "biblical:passage:acts-17-1-9",
      "biblical:passage:acts-17-16-34",
      "biblical:passage:acts-18-1-18"
    ]
  },
  {
    "id": "reading-chapter:apostles-rome",
    "era": "APOSTLES",
    "title_en": "From Ephesus to Rome",
    "title_fr": "D'Éphèse à Rome",
    "eventKeys": [
      "biblical:passage:acts-19-1-20",
      "biblical:passage:acts-20-7-12",
      "biblical:passage:acts-20-17-38",
      "biblical:passage:acts-27-13-44",
      "biblical:passage:acts-28-16-31"
    ]
  },
  {
    "id": "reading-chapter:revelation-letters",
    "era": "REVELATION",
    "title_en": "John's visions and letters",
    "title_fr": "Visions et lettres de Jean",
    "eventKeys": [
      "biblical:passage:revelation-1-9-20",
      "biblical:passage:revelation-2-1-29",
      "biblical:passage:revelation-3-1-22"
    ]
  },
  {
    "id": "reading-chapter:revelation-heavenly",
    "era": "REVELATION",
    "title_en": "Heavenly liturgy and new Jerusalem",
    "title_fr": "Liturgie céleste et Jérusalem nouvelle",
    "eventKeys": [
      "biblical:passage:revelation-4-1-11",
      "biblical:passage:revelation-21-1-27"
    ]
  }
].map(x=>Object.freeze({...x,eventKeys:Object.freeze(x.eventKeys)})));
const escapeHTML=value=>String(value??"").replace(/[&<>"']/g,char=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));
const label=(lang,en,fr)=>lang==="fr"?fr:en;

/**
 * Fail closed if the donor catalogue drifts away from the 151-event source
 * in index, eventKey, or era. No guessed Scripture anchors.
 */
export function atlasReadingChapters(stops){
 if(!Array.isArray(stops)||stops.length!==151||ATLAS_READING_CHAPTERS.length!==37)return [];
 const seen=new Set(),byKey=new Map(stops.map((s,i)=>[s.eventKey,i]));
 if(byKey.size!==151)return [];
 const result=[];
 for(const ch of ATLAS_READING_CHAPTERS){
  const indices=[];
  for(const key of ch.eventKeys){
   if(seen.has(key))return [];
   seen.add(key);
   const i=byKey.get(key);
   if(i===undefined||stops[i].era!==ch.era)return [];
   indices.push(i);
  }
  if(!indices.length||indices.some((i,j)=>i!==indices[0]+j))return [];
  result.push(Object.freeze({...ch,start:indices[0],end:indices.at(-1),count:indices.length}));
 }
 if(seen.size!==151||result.some((x,i)=>x.start!==(i?result[i-1].end+1:0))||result.at(-1).end!==150)return [];
 return Object.freeze(result);
}

/** Render a small, accessible group navigator; no chapter text is created. */
export function renderAtlasReadingContents(stops,eras,lang="en",index=0){
 const chapters=atlasReadingChapters(stops);
 if(!chapters.length)return "";
 const erasByKey=new Map((eras??[]).map(x=>[x.era,x]));
 const groups=[];
 for(const ch of chapters){
  let group=groups.at(-1);
  if(!group||group.era!==ch.era){group={era:ch.era,title:erasByKey.get(ch.era),items:[]};groups.push(group);}
  group.items.push(ch);
 }
 return '<section class="aoBibleReadingPanel" id="ao-bible-reading-list" data-bible-reading-panel hidden aria-label="'+
  escapeHTML(label(lang,"Scripture journeys","Parcours bibliques"))+'">'+
  '<div class="aoBibleReadingTabs" role="tablist" aria-label="'+escapeHTML(label(lang,"Choose reading path","Choisir un parcours"))+'">'+
  '<button type="button" role="tab" aria-selected="true" data-bible-reading-tab="chapters">'+escapeHTML(label(lang,"37 chapters","37 chapitres"))+'</button>'+
  '<button type="button" role="tab" aria-selected="false" data-bible-reading-tab="arcs">'+escapeHTML(label(lang,"10 arcs","10 parcours"))+'</button>'+
  '<button type="button" role="tab" aria-selected="false" data-bible-reading-tab="themes">'+escapeHTML(label(lang,"9 themes","9 thèmes"))+'</button></div>'+
  '<div data-bible-reading-view="chapters" class="aoBibleReadingView">'+
  '<p class="aoBibleReadingDisclaimer">'+escapeHTML(label(lang,
   "37 groups of selected Scripture episodes · not an abridged or complete Bible",
   "37 groupes d’épisodes bibliques choisis · ni abrégé ni Bible intégrale"))+'</p>'+
  groups.map(group=>'<div class="aoBibleReadingGroup"><h3>'+
    escapeHTML(group.title?label(lang,group.title.title_en,group.title.title_fr):group.era)+'</h3>'+
    '<div class="aoBibleReadingGrid">'+group.items.map(ch=>
      '<button type="button" data-bible-reading-start="'+ch.start+'" data-bible-reading-end="'+ch.end+
      '" aria-pressed="'+String(index>=ch.start&&index<=ch.end)+'">'+
      '<span>'+escapeHTML(label(lang,ch.title_en,ch.title_fr))+'</span>'+
      '<small>'+ch.count+' '+escapeHTML(label(lang,ch.count===1?"episode":"episodes",ch.count===1?"épisode":"épisodes"))+'</small>'+
      '</button>'
    ).join("")+'</div></div>').join("")+
  '</div>'+
  renderAtlasJourneyViews(stops,chapters,lang,index)+
  '</section>';
}
