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
 // Epiphany, 6 January. The same "Vidimus stellam" incipit is in
 // DISTINCT Alleluia (1961 p. 58, Mode II) and Communion (p. 59, Mode IV);
 // role + paragraph + 1962 source owner prevents cross-melody borrowing.
 // Late Advent: every score has one exact 1962 temporal source owner;
 // no Third/Fourth Sunday source overlap, no Advent IV ambiguous roles.
 {sourcePath:"Tempora/Adv3-0",role:"INTROIT",paragraphId:"INTROIT.1",
  scoreId:"GREGOBASE-1225",openings:["gaudete in domino semper iterum dico gaudete"]},
 {sourcePath:"Tempora/Adv3-0",role:"GRADUAL",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-1007",openings:["qui sedes domine super cherubim excita potentiam tuam"]},
 {sourcePath:"Tempora/Adv3-0",role:"ALLELUIA",paragraphId:"ALLELUIA_TRACT_SEQUENCE.1",
  scoreId:"GREGOBASE-855",openings:["excita domine potentiam tuam et veni ut salvos facias nos"]},
 {sourcePath:"Tempora/Adv3-0",role:"ALLELUIA",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-855",afterScoreId:"GREGOBASE-1007",
  openings:["excita domine potentiam tuam et veni ut salvos facias nos"]},
 {sourcePath:"Tempora/Adv3-0",role:"OFFERTORY",paragraphId:"OFFERTORY.1",
  scoreId:"GREGOBASE-113",openings:["benedixisti domine terram tuam avertisti captivitatem"]},
 {sourcePath:"Tempora/Adv3-0",role:"COMMUNION",paragraphId:"COMMUNION.1",
  scoreId:"GREGOBASE-218",openings:["dicite pusillanimes confortamini et nolite timere"]},
 {sourcePath:"Tempora/Adv4-0",role:"INTROIT",paragraphId:"INTROIT.1",
  scoreId:"GREGOBASE-79",openings:["rorate coeli desuper et nubes pluant justum","rorate caeli desuper et nubes pluant iustum"]},
 {sourcePath:"Tempora/Adv4-0",role:"GRADUAL",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-284",openings:["prope est dominus omnibus invocantibus eum"]},
 // First Sundays of Advent, recurring temporal source owners.
 // Source-owned 1962 Graduale separates the Gradual and Alleluia in musical
 // role but may render them in one source paragraph in the Order of Mass.
 // Keep both originals bound to their own distinct score identities.
 // 1961/1962 Offertory wording differs: deliberately NO Offertory binding.
 {sourcePath:"Tempora/Adv1-0",role:"INTROIT",paragraphId:"INTROIT.1",
  scoreId:"GREGOBASE-132",openings:["ad te levavi animam meam deus meus in te confido"]},
 {sourcePath:"Tempora/Adv1-0",role:"GRADUAL",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-1169",openings:["universi qui te exspectant non confundentur domine"]},
 {sourcePath:"Tempora/Adv1-0",role:"ALLELUIA",paragraphId:"ALLELUIA_TRACT_SEQUENCE.1",
  scoreId:"GREGOBASE-1115",openings:["ostende nobis domine misericordiam tuam et salutare tuum da nobis"]},
 {sourcePath:"Tempora/Adv1-0",role:"ALLELUIA",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-1115",afterScoreId:"GREGOBASE-1169",
  openings:["ostende nobis domine misericordiam tuam et salutare tuum da nobis"]},
 {sourcePath:"Tempora/Adv1-0",role:"COMMUNION",paragraphId:"COMMUNION.1",
  scoreId:"GREGOBASE-1036",openings:["dominus dabit benignitatem et terra nostra dabit fructum suum"]},
 {sourcePath:"Tempora/Adv2-0",role:"INTROIT",paragraphId:"INTROIT.1",
  scoreId:"GREGOBASE-356",openings:["populus sion ecce dominus veniet ad salvandas gentes"]},
 {sourcePath:"Tempora/Adv2-0",role:"GRADUAL",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-1268",openings:["ex sion species decoris eius deus manifeste veniet"]},
 {sourcePath:"Tempora/Adv2-0",role:"ALLELUIA",paragraphId:"ALLELUIA_TRACT_SEQUENCE.1",
  scoreId:"GREGOBASE-292",openings:["laetatus sum in his quae dicta sunt mihi in domum domini ibimus"]},
 {sourcePath:"Tempora/Adv2-0",role:"ALLELUIA",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-292",afterScoreId:"GREGOBASE-1268",
  openings:["laetatus sum in his quae dicta sunt mihi in domum domini ibimus"]},
 {sourcePath:"Tempora/Adv2-0",role:"COMMUNION",paragraphId:"COMMUNION.1",
  scoreId:"GREGOBASE-966",openings:["ierusalem surge et sta in excelso et vide iucunditatem"]},
 // Immaculate Conception (8 December), p. 400–404 in GR 1961.
 // Source role, printed page, full Latin opening and Mass appointment are
 // simultaneous guards; the common incipits are insufficient on their own.
 {sourcePath:"Sancti/12-08",monthDay:"12-08",role:"INTROIT",paragraphId:"INTROIT.1",
  scoreId:"GREGOBASE-622",openings:["gaudens gaudebo in domino et exsultabit anima mea"]},
 {sourcePath:"Sancti/12-08",monthDay:"12-08",role:"GRADUAL",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-713",openings:["benedicta es tu virgo maria a domino deo excelso"]},
 {sourcePath:"Sancti/12-08",monthDay:"12-08",role:"ALLELUIA",paragraphId:"ALLELUIA_TRACT_SEQUENCE.1",
  scoreId:"GREGOBASE-1057",openings:["tota pulchra es maria et macula originalis non est in te"]},
 // Original 1962 Graduale also carries the Alleluia; never present it
 // without the independently matched Benedicta es tu Gradual.
 {sourcePath:"Sancti/12-08",monthDay:"12-08",role:"ALLELUIA",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-1057",afterScoreId:"GREGOBASE-713",
  openings:["tota pulchra es maria et macula originalis non est in te"]},
 {sourcePath:"Sancti/12-08",monthDay:"12-08",role:"OFFERTORY",paragraphId:"OFFERTORY.1",
  scoreId:"GREGOBASE-210",openings:["ave maria gratia plena dominus tecum benedicta tu in mulieribus"]},
 {sourcePath:"Sancti/12-08",monthDay:"12-08",role:"COMMUNION",paragraphId:"COMMUNION.1",
  scoreId:"GREGOBASE-1004",openings:["gloriosa dicta sunt de te maria quia fecit tibi magna"]},
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"INTROIT",paragraphId:"INTROIT.1",
  scoreId:"GREGOBASE-403",openings:["ecce advenit dominator dominus"]},
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"GRADUAL",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-205",openings:["omnes de saba venient aurum et thus deferentes"]},
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"ALLELUIA",paragraphId:"ALLELUIA_TRACT_SEQUENCE.1",
  scoreId:"GREGOBASE-524",openings:["vidimus stellam eius in oriente"]},
 // The pinned 1962 source contains the Alleluia inside its Graduale section.
 // Only a Gradual paragraph that ALSO contains the genuine Alleluia text,
 // after the matched Gradual, may display the companion score.
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"ALLELUIA",paragraphId:"GRADUAL.1",
  scoreId:"GREGOBASE-524",afterScoreId:"GREGOBASE-205",
  openings:["vidimus stellam eius in oriente"]},
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"OFFERTORY",paragraphId:"OFFERTORY.1",
  scoreId:"GREGOBASE-1147",openings:["reges tharsis et insulae munera offerent"]},
 {sourcePath:"Sancti/01-06",monthDay:"01-06",role:"COMMUNION",paragraphId:"COMMUNION.1",
  scoreId:"GREGOBASE-918",openings:["vidimus stellam eius in oriente"]},
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
  scoreId:"GREGOBASE-345",openings:["beati mundo corde quoniam ipsi deum videbunt"]}
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
