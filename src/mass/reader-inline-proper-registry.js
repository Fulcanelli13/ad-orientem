// Reusable, source-owned mapping of existing 1961 GABC transcriptions into
// the unchanged 65-card 1962 reader. No network, title search, or scraping.
// Each binding is editorial data; publication approval is NOT implied.
export const PROPER_REFERENCE_REGISTRY_SCHEMA="ao-1962-mass-proper-reference-registry-v1";
export const PROPER_REFERENCE_LABELS=Object.freeze({
 INTROIT:"Introit",GRADUAL:"Gradual",ALLELUIA:"Alleluia",
 TRACT:"Tract",SEQUENCE:"Sequence",OFFERTORY:"Offertory",COMMUNION:"Communion"
});
// A fixed Sanctoral date is only an appointment guard, NOT a 2026-specific
// score identifier. For genuine Commons, a future source-specific binding can
// omit monthDay and serve as many dates as appoint that exact source.
export const PROPER_REFERENCE_BINDINGS=Object.freeze([
 {sourcePath:"Sancti/07-07",monthDay:"07-07",role:"INTROIT",paragraphId:"INTROIT.1",
  scoreId:"GREGOBASE-48",openings:["sacerdotes tui domine induant iustitiam"]},
 {sourcePath:"Sancti/07-07",monthDay:"07-07",role:"GRADUAL",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-415",openings:["sacerdotes eius induam salutari"]},
 {sourcePath:"Sancti/07-07",monthDay:"07-07",role:"ALLELUIA",paragraphId:"ALLELUIA_TRACT_SEQUENCE.1",
  scoreId:"GREGOBASE-1187",openings:["iuravit dominus","tu es sacerdos in aeternum"]},
 // Some authentic source layouts place the Gradual and Alleluia in one
 // canonical paragraph. The companion is shown ONLY with its verified Gradual.
 {sourcePath:"Sancti/07-07",monthDay:"07-07",role:"ALLELUIA",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-1187",afterScoreId:"GREGOBASE-415",
  openings:["iuravit dominus","tu es sacerdos in aeternum"]},
 {sourcePath:"Sancti/11-01",monthDay:"11-01",role:"INTROIT",paragraphId:"INTROIT.1",
  scoreId:"GREGOBASE-752",openings:["gaudeamus omnes in domino diem festum celebrantes"]},
 {sourcePath:"Sancti/11-01",monthDay:"11-01",role:"GRADUAL",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-371",openings:["timete dominum omnes sancti eius"]},
 {sourcePath:"Sancti/11-01",monthDay:"11-01",role:"ALLELUIA",paragraphId:"ALLELUIA_TRACT_SEQUENCE.1",
  scoreId:"GREGOBASE-1237",openings:["venite ad me omnes qui laboratis et onerati estis"]},
 {sourcePath:"Sancti/11-01",monthDay:"11-01",role:"OFFERTORY",paragraphId:"OFFERTORY.1",
  scoreId:"GREGOBASE-835",openings:["iustorum animae in manu dei sunt"]},
 {sourcePath:"Sancti/11-01",monthDay:"11-01",role:"COMMUNION",paragraphId:"COMMUNION.1",
  scoreId:"GREGOBASE-345",openings:["beati mundo corde quoniam ipsi deum videbunt"]},
 // November 30: the source ledger identifies five unique existing 1961
 // GABC candidates. Introit and Offertory have the same opening but are
 // different scores. The Communion retains the 1961 sung textual variant.
 {sourcePath:"Sancti/11-30",monthDay:"11-30",role:"INTROIT",paragraphId:"INTROIT.1",
  scoreId:"GREGOBASE-475",openings:["mihi autem nimis honorati sunt amici tui deus"]},
 {sourcePath:"Sancti/11-30",monthDay:"11-30",role:"GRADUAL",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-307",openings:["constitues eos principes super omnem terram"]},
 {sourcePath:"Sancti/11-30",monthDay:"11-30",role:"ALLELUIA",paragraphId:"ALLELUIA_TRACT_SEQUENCE.1",
  scoreId:"GREGOBASE-984",openings:["dilexit andream dominus in odorem suavitatis"]},
 {sourcePath:"Sancti/11-30",monthDay:"11-30",role:"OFFERTORY",paragraphId:"OFFERTORY.1",
  scoreId:"GREGOBASE-499",openings:["mihi autem nimis honorati sunt amici tui deus"]},
 {sourcePath:"Sancti/11-30",monthDay:"11-30",role:"COMMUNION",paragraphId:"COMMUNION.1",
  scoreId:"GREGOBASE-552",openings:["venite post me faciam vos fieri piscatores hominum"]},
 // Source-owned combined pre-Gospel paragraph: Gradual followed by Alleluia.
 {sourcePath:"Sancti/11-30",monthDay:"11-30",role:"ALLELUIA",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-984",afterScoreId:"GREGOBASE-307",openings:["dilexit andream dominus in odorem suavitatis"]},
 // Gaudete: Advent III selected source, not a civil-calendar date guess.
 {sourcePath:"Tempora/Adv3-0",role:"INTROIT",paragraphId:"INTROIT.1",
  scoreId:"GREGOBASE-1225",openings:["gaudete in domino semper iterum dico gaudete modestia vestra"]},
 {sourcePath:"Tempora/Adv3-0",role:"GRADUAL",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-1007",openings:["qui sedes domine super cherubim excita potentiam tuam et"]},
 {sourcePath:"Tempora/Adv3-0",role:"ALLELUIA",paragraphId:"ALLELUIA_TRACT_SEQUENCE.1",
  scoreId:"GREGOBASE-855",openings:["excita domine potentiam tuam et veni ut salvos facias"]},
 {sourcePath:"Tempora/Adv3-0",role:"ALLELUIA",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-855",afterScoreId:"GREGOBASE-1007",openings:["excita domine potentiam tuam et veni ut salvos facias"]},
 {sourcePath:"Tempora/Adv3-0",role:"OFFERTORY",paragraphId:"OFFERTORY.1",
  scoreId:"GREGOBASE-113",openings:["benedixisti domine terram tuam avertisti captivitatem iacob remisisti iniquitatem"]},
 {sourcePath:"Tempora/Adv3-0",role:"COMMUNION",paragraphId:"COMMUNION.1",
  scoreId:"GREGOBASE-218",openings:["dicite pusillanimes confortamini et nolite timere ecce deus noster"]},
 // Epiphany: Jan 6 selected source and chant role (Alleluia differs from Communion).
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"INTROIT",paragraphId:"INTROIT.1",
  scoreId:"GREGOBASE-403",openings:["ecce advenit dominator dominus et regnum in manu eius"]},
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"GRADUAL",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-205",openings:["omnes de saba venient aurum et thus deferentes et"]},
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"ALLELUIA",paragraphId:"ALLELUIA_TRACT_SEQUENCE.1",
  scoreId:"GREGOBASE-524",openings:["vidimus stellam eius in oriente et venimus cum muneribus"]},
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"ALLELUIA",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-524",afterScoreId:"GREGOBASE-205",openings:["vidimus stellam eius in oriente et venimus cum muneribus"]},
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"OFFERTORY",paragraphId:"OFFERTORY.1",
  scoreId:"GREGOBASE-1147",openings:["reges tharsis et insulae munera offerent reges arabum et"]},
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"COMMUNION",paragraphId:"COMMUNION.1",
  scoreId:"GREGOBASE-918",openings:["vidimus stellam eius in oriente et venimus cum muneribus"]}
].map(row=>Object.freeze({...row,openings:Object.freeze([...row.openings])})));
const SUNG=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const validSource=path=>/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/.test(path);
export function createProperReferenceRegistry({scores,bindings=PROPER_REFERENCE_BINDINGS}={}){
 if(!Array.isArray(scores)||!Array.isArray(bindings))throw TypeError("REFERENCE_REGISTRY_ARRAYS_REQUIRED");
 const byId=new Map();
 for(const score of scores){
  if(!/^GREGOBASE-\d+$/.test(score?.id??"")||byId.has(score.id)||
     score.publicScoreApproved!==false||!/^[a-f0-9]{64}$/.test(score.sha256??"")||
     typeof score.gabc!=="string"||!score.gabc.includes("\n%%\n"))
    throw Error("INVALID_REFERENCE_SCORE_CATALOG");
  byId.set(score.id,score);
 }
 const rows=new Map();
 for(const binding of bindings){
  if(!validSource(binding.sourcePath)||!/^\d{2}-\d{2}$/.test(binding.monthDay??"")&&binding.monthDay!=null||
     !/^[A-Z_]+$/.test(binding.role)||!PROPER_REFERENCE_LABELS[binding.role]||
     !/^(?:INTROIT|GRADUAL|ALLELUIA_TRACT_SEQUENCE|OFFERTORY|COMMUNION)\.1$/.test(binding.paragraphId)||
     !Array.isArray(binding.openings)||!binding.openings.length||
     binding.openings.some(x=>norm(x)!==x||x.length<12)||
     !byId.has(binding.scoreId)||byId.get(binding.scoreId).key!==binding.role)
    throw Error("INVALID_REFERENCE_SOURCE_BINDING");
  const key=binding.sourcePath+"|"+binding.paragraphId;
  rows.set(key,[...(rows.get(key)??[]),binding]);
 }
 function select({paragraph,resolvedMass,form}={}){
  if(!SUNG.has(String(form??"").toUpperCase())||!paragraph||
     paragraph.kind==="RUBRIC"||resolvedMass?.overlays?.includes("REQUIEM"))
    return Object.freeze([]);
  const sourcePath=(resolvedMass?.proper?.data??resolvedMass?.proper)?.sourcePath;
  const key=String(sourcePath??"")+"|"+String(paragraph.id??"");
  const sourceRows=rows.get(key)??[];
  if(!sourceRows.length)return Object.freeze([]);
  const date=String(resolvedMass?.date??"");
  const latin=[paragraph.primary,paragraph.secondary,paragraph.alternate]
   .filter(x=>typeof x==="string"&&x.length).map(norm);
  const matched=[];
  for(const b of sourceRows){
   if(b.monthDay&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date.slice(5)!==b.monthDay))
    continue;
   if(!b.openings.some(opening=>latin.some(s=>s.includes(opening))))continue;
   if(b.afterScoreId&&!matched.some(s=>s.id===b.afterScoreId))continue;
   matched.push(byId.get(b.scoreId));
  }
  return Object.freeze(matched);
 }
 return Object.freeze({schema:PROPER_REFERENCE_REGISTRY_SCHEMA,
  scoreCount:byId.size,bindingCount:bindings.length,select});
}
