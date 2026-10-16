/*
 * Reverse lookup of EXISTING curated cross-module Scripture references.
 * This is a navigation index, not an independently edited Bible/source corpus.
 * An overlapping verse never establishes identical rites, events or doctrine.
 * Selected liturgical Propers (Mass and Calendar) stay dynamic and are not
 * projected into this static registry.
 */
import {scripturePassage} from "./catalogue.js";
import {parseScriptureContext} from "./context.js";
import {ROSARY_SCRIPTURE_LINKS} from "./links.js";
import {ROSARY_GUIDED_BEAD_EVIDENCE_V1} from "../pray/rosary-guided-bead-evidence.v1.js";
import {NOVENA_SCRIPTURE_CONTEXT_V1} from "../pray/novena-scripture-context.js";
import {MASS_FORMATION_SCRIPTURE_ANCHORS,MASS_FORMATION_SCRIPTURE_RELATIONSHIPS} from "../learn/mass-formation-scripture-context.js";
import {PRAYER_SCRIPTURE_ORIGINS,STATION_SCRIPTURE_ORIGINS} from "../pray/scripture-origins.js";

const rosaryGroups=Object.freeze({
  joy:["Joyful mystery","Mystère joyeux"],
  lum:["Luminous mystery","Mystère lumineux"],
  sor:["Sorrowful mystery","Mystère douloureux"],
  glo:["Glorious mystery","Mystère glorieux"]
});
const prayerTitles=Object.freeze({
  foundations_our_father:["Our Father","Notre Père"],
  foundations_hail_mary:["Hail Mary","Je vous salue Marie"],
  foundations_prayer_of_adoration:["Act of adoration","Prière d'adoration"],
  weekday_magnificat:["Magnificat","Magnificat"],
  adoration_lord_i_am_not_worthy:["Lord, I am not worthy","Seigneur, je ne suis pas digne"],
  weekday_benedictus:["Benedictus","Benedictus"],
  dead_de_profundis:["De profundis","De profundis"],
  benediction_adoremus_ps116:["Adoremus · Psalm","Adoremus · Psaume"]
});
const one=(source,id,passage,relation,title,description=null,target=null)=>{
  const p=scripturePassage(passage);
  return Object.freeze({
    id:source+":"+id,source,objectId:id,passage:p,
    reference:p.book+" "+p.chapter+":"+p.verseStart+
      (p.verseEnd===p.verseStart?"":"–"+p.verseEnd),
    relation,title:Object.freeze(title),
    description:description?Object.freeze(description):null,
    target:target?Object.freeze(target):null
  });
};
const all=[];
for(const [id,row] of Object.entries(ROSARY_SCRIPTURE_LINKS)){
  const group=rosaryGroups[id.slice(0,3)];
  if(!group||!Number.isInteger(Number(id.slice(3))))throw new Error("Unknown curated Rosary object: "+id);
  const n=id.slice(3);
  all.push(one("rosary",id,row.passage,row.relation,{
    en:group[0]+" "+n,fr:group[1]+" "+n
  },row.editorialSummary,{type:"rosary",mysteryId:id}));
}
// Bead evidence belongs to Prayer; it is NOT a text corpus or permission
// to reproduce uncollated excerpts. Exclude the ten doctrinal-only cues,
// including non-Scripture records, rather than pretending they are verses.
for(const [mysteryId,beads] of Object.entries(ROSARY_GUIDED_BEAD_EVIDENCE_V1)){
  if(!ROSARY_SCRIPTURE_LINKS[mysteryId])throw new Error("Unknown Rosary bead mystery: "+mysteryId);
  const group=rosaryGroups[mysteryId.slice(0,3)];
  for(const bead of beads){
    if(!Number.isInteger(bead.bead)||bead.bead<1||bead.bead>10)
      throw new Error("Invalid canonical Rosary bead: "+mysteryId);
    const parsed=parseScriptureContext(bead.reference);
    if(!parsed)continue; // Magisterial/doctrinal sources are not biblical verses.
    all.push(one("rosaryBead",mysteryId+":"+bead.bead,parsed.passage,bead.relationship,{
      en:group[0]+" "+mysteryId.slice(3)+" · bead "+bead.bead,
      fr:group[1]+" "+mysteryId.slice(3)+" · grain "+bead.bead
    },{
      en:"Source-linked guided meditation; not a verbatim quotation.",
      fr:"Méditation guidée liée à la source ; non citation littérale."
    },{type:"rosary",mysteryId,bead:bead.bead}));
  }
}
for(const [id,row] of Object.entries(NOVENA_SCRIPTURE_CONTEXT_V1)){
  const parsed=parseScriptureContext(row.reference);
  if(!parsed)throw new Error("Invalid Novena Scripture relationship: "+id);
  const label=id.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
  all.push(one("novena",id,parsed.passage,row.relation,{
    en:"Novena · "+label,fr:"Neuvaine · "+label
  },{en:row.en,fr:row.fr},{type:"novena",novenaId:id}));
}
for(const row of MASS_FORMATION_SCRIPTURE_ANCHORS){
  const parsed=parseScriptureContext(row.reference);
  if(!parsed)throw new Error("Invalid Mass Formation link: "+row.id);
  all.push(one("massFormation",row.id,parsed.passage,row.relationship,
    row.title,MASS_FORMATION_SCRIPTURE_RELATIONSHIPS[row.relationship],{type:"massFormation",stageId:row.stageId}));
}
for(const [id,row] of Object.entries(PRAYER_SCRIPTURE_ORIGINS)){
  if(!prayerTitles[id])throw new Error("Prayer title missing for "+id);
  all.push(one("prayer",id,row.passage,row.relationship,
    {en:"Prayer · "+prayerTitles[id][0],fr:"Prière · "+prayerTitles[id][1]}));
}
for(let i=0;i<STATION_SCRIPTURE_ORIGINS.length;i++){
  const row=STATION_SCRIPTURE_ORIGINS[i];
  if(!row?.passage)continue; // Five traditional/devotional scenes: NEVER fabricate Bible verses.
  const number=String(i+1);
  all.push(one("station",number,row.passage,row.relationship,
    {en:"Stations of the Cross · "+number,fr:"Chemin de croix · "+number}));
}
const unique=new Set(all.map(x=>x.id));
if(unique.size!==all.length)throw new Error("Duplicate cross-module Scripture object");
export const SCRIPTURE_LINKED_OBJECTS=Object.freeze(all);
export const SCRIPTURE_LINK_COUNTS=Object.freeze(Object.fromEntries(
 ["rosary","rosaryBead","novena","massFormation","prayer","station"].map(source=>[
  source,all.filter(x=>x.source===source).length
 ])
));
export function scriptureLinkedObjectsForPassage(passage,{limit=24}={}){
  const p=scripturePassage(passage);
  return SCRIPTURE_LINKED_OBJECTS.filter(x=>
    x.passage.book===p.book&&x.passage.chapter===p.chapter&&
    x.passage.verseStart<=p.verseEnd&&x.passage.verseEnd>=p.verseStart
  ).slice(0,Math.max(0,Math.min(100,Number.isInteger(limit)?limit:24)));
}
