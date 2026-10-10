#!/usr/bin/env node
// Sacred art source-research index: MANY candidate paintings per observed 1962 day.
// Do not mistake a seasonal fallback for an actual saint or appointed Gospel.
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {buildLiturgicalYear} from "../../src/calendar/liturgical-year.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const folder="artifacts/sacred-art-coverage";
const year=read("artifacts/calendar-oracle/1962-2026-full-year-audit.json");
const observed=read(folder+"/liturgical-priority-v1.json").observedYear.days;
const art=read("data/calendar/sacred-art-candidates.v1.json").artworks;
const exact=read("data/calendar/sacred-art-1962-exact-feast-source-links.v1.json").links;
const context=read("data/calendar/sacred-art-2026-i-class-contextual-reuse.v1.json").entries;
assert.equal(year.rows.length,365);
assert.equal(observed.length,365);
const acquired=art.filter(a=>/^[a-f0-9]{64}$/i.test(a.acquisition?.originalSha256||"")&&a.acquisition?.archiveOriginal);
assert.equal(new Set(acquired.map(a=>a.acquisition.originalSha256)).size,acquired.length);
const artworkById=new Map(acquired.map(a=>[a.id,a]));
const calendarByDate=new Map(observed.map(d=>[d.date,d]));
const arr=x=>Array.isArray(x)?x:[];
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const tagMap=new Map();
for(const a of acquired){
 const tags=new Set([...arr(a.tags?.iconography),...arr(a.association?.subjectKeys)]);
 for(const tag of tags){
  if(!tagMap.has(tag))tagMap.set(tag,[]);
  tagMap.get(tag).push(a);
 }
}
const tagged=k=>tagMap.get(k)||[];
const titles=[
 [/\b(?:saint|st)\s+andrew(?=$|\s+(?:apostle|the apostle)\b)/,"saint-andrew"],
 [/\b(?:saint|st)\s+anthony of padua\b/,"saint-anthony-padua"],
 [/\b(?:saint|st)\s+benedict\b(?!\s+joseph)/,"saint-benedict"],
 [/\b(?:saint|st)\s+catherine of siena\b/,"saint-catherine-siena"],
 [/\b(?:saint|st)\s+dominic\b(?!\s+savio)/,"saint-dominic"],
 [/\b(?:saint|st)\s+francis of assisi\b/,"saint-francis-assisi"],
 [/\b(?:saint|st)\s+jerome(?=$|\s+(?:priest|doctor|confessor)\b)/,"saint-jerome"],
 [/\b(?:saint|st)\s+john the baptist\b/,"saint-john-baptist"],
 [/\b(?:saint|st)\s+michael\b/,"saint-michael"],
 [/\b(?:saint|st)\s+paul(?=$|\s+(?:apostle|the apostle|commemoration)\b)/,"saint-paul"],
 [/\b(?:saint|st)\s+peter(?=$|\s+(?:apostle|the apostle|chair|commemoration)\b)/,"saint-peter"],
 [/\b(?:saint|st)\s+thomas aquinas\b/,"saint-thomas-aquinas"],
 [/\b(?:saint|st)\s+joseph(?=$|\s+(?:the workman|spouse of|patron of)\b)/,"saint-joseph"],
 [/(?:^epiphany\b|\bfeast of the epiphany\b)/,"adoration-magi"],
 [/\bnativity of (?:our lord|the lord|jesus|christ)\b/,"nativity"],
 [/\bnativity of (?:saint|st) john (?:the )?baptist\b/,"nativity-john-baptist"],
 [/\b(?:candlemas|purification of the blessed virgin|presentation of (?:our lord|the lord|jesus|christ))\b/,"presentation-jesus"],
 [/\bannunciation\b/,"annunciation"],
 [/\bvisitation\b/,"visitation"],
 [/\bimmaculate conception\b/,"immaculate-conception"],
 [/\bassumption\b/,"assumption-mary"],
 [/\b(?:our lady|blessed virgin).*rosary\b/,"our-lady-rosary"],
 [/\b(?:our lady|blessed virgin).*sorrows\b/,"seven-sorrows"],
 [/\btransfiguration\b/,"transfiguration"],
 [/\b(?:exaltation|invention) of (?:the )?(?:holy )?cross\b/,"crucifixion"],
 [/\bpentecost sunday\b/,"pentecost"],
 [/\bascension of (?:our lord|the lord)\b/,"ascension-christ"],
 [/\b(?:trinity sunday|most holy trinity)\b/,"holy-trinity"],
 [/\b(?:easter sunday|resurrection of (?:our lord|the lord))\b/,"resurrection"],
 [/\ball saints\b/,"all-saints"],
 [/\ball souls\b/,"holy-souls"],
 [/\bsacred heart of (?:jesus|our lord)\b/,"sacred-heart"],
 [/\b(?:saints peter and paul|sts peter and paul)\b/,"saints-peter-paul"],
 [/\bchrist the king\b/,"christ-in-glory"],
 [/\bholy family\b/,"holy-family"]
];
const episodes=[
 ["annunciation","Luke",1,26,38],["visitation","Luke",1,39,56],
 ["nativity-john-baptist","Luke",1,57,66],["presentation-jesus","Luke",2,22,38],
 ["adoration-magi","Matthew",2,1,12],["flight-egypt","Matthew",2,13,23],
 ["baptism-christ","Matthew",3,13,17],["baptism-christ","Mark",1,9,11],
 ["baptism-christ","Luke",3,21,22],["good-samaritan","Luke",10,25,37],
 ["woman-at-well","John",4,5,42],["transfiguration","Matthew",17,1,9],
 ["transfiguration","Mark",9,2,10],["transfiguration","Luke",9,28,36],
 ["calling-matthew","Matthew",9,9,13],["calling-matthew","Mark",2,13,17],
 ["calling-matthew","Luke",5,27,32],["agony-garden","Matthew",26,36,46],
 ["agony-garden","Mark",14,32,42],["agony-garden","Luke",22,39,46],
 ["supper-emmaus","Luke",24,13,35],
 ["nativity","Luke",2,15,20],
 ["adoration-shepherds","Luke",2,15,20],
 ["finding-jesus-temple","Luke",2,42,52],
 ["wise-foolish-virgins","Matthew",25,1,13],
 ["talents","Matthew",25,14,23],
 ["last-judgment","Matthew",25,31,46],
 ["keys-to-peter","Matthew",16,13,19],
 ["raising-widows-son","Luke",7,11,16],
 ["tribute-money","Matthew",22,15,21],
 ["healing-paralytic","Matthew",9,1,8],
 ["lost-sheep","Luke",15,1,7],
 ["great-supper","Luke",14,16,24],
 ["wedding-feast","Matthew",22,1,14],
 ["unforgiving-servant","Matthew",18,23,35],
 ["publican-pharisee","Luke",18,9,14],
 ["laborers-vineyard","Matthew",20,1,16],
 ["parable-sower","Luke",8,4,15],
 ["centurion-servant","Matthew",8,5,13],
 ["raising-jairus","Matthew",9,18,26],
 ["christ-and-children","Matthew",18,1,5],
 ["ten-lepers-scene","Luke",17,11,19],
 ["canaanite-woman","Matthew",15,21,28],
 ["anointing-bethany","John",12,1,9],
 ["exorcism-mute","Luke",11,14,28],
 ["peter-denial","Matthew",26,69,75],
 ["peter-denial","Mark",14,66,72],
 ["peter-denial","Luke",22,54,62],
 ["peter-denial","John",18,15,27],
 ["cleansing-temple","Luke",19,45,46],
 ["parable-vine","John",15,1,7],
 ["healing-deaf-mute","Mark",7,31,37],
 ["healing-leper","Matthew",8,1,4],
 ["feeding-four-thousand","Mark",8,1,9],
 ["feeding-five-thousand","John",6,1,15],
 ["feeding-five-thousand","Matthew",14,13,21],
 ["good-shepherd","John",10,11,16],
 ["wedding-cana","John",2,1,11],
 ["doubting-thomas","John",20,24,29],
 ["raising-jairus-daughter","Mark",5,21,43],
 ["noli-me-tangere","John",20,11,18]
];
const books={mt:"Matthew",matthew:"Matthew",mk:"Mark",mark:"Mark",mc:"Mark",
 lk:"Luke",luke:"Luke",lc:"Luke",jn:"John",joh:"John",john:"John"};
const matches=(p,row)=>p&&books[norm(p.book).replaceAll(" ","")]===row[1]
 &&Number(p.chapter)===row[2]&&Number(p.verseStart)<=row[4]&&Number(p.verseEnd)>=row[3];
const ranks=["STRICT_DAY_SOURCE_LINK","VERIFIED_CONTEXTUAL_LEDGER","OBSERVED_ID_TAG_UNREVIEWED",
 "TITULAR_PERSON_OR_EVENT_CANDIDATE","APPOINTED_GOSPEL_SCENE_CANDIDATE",
 "MARIAN_SATURDAY_CONTEXT","LITURGICAL_SEASON_CONTEXT","GENERIC_BACKGROUND"];
const perTierLimits={STRICT_DAY_SOURCE_LINK:30,VERIFIED_CONTEXTUAL_LEDGER:30,OBSERVED_ID_TAG_UNREVIEWED:20,
 TITULAR_PERSON_OR_EVENT_CANDIDATE:30,APPOINTED_GOSPEL_SCENE_CANDIDATE:30,
 MARIAN_SATURDAY_CONTEXT:5,LITURGICAL_SEASON_CONTEXT:5,GENERIC_BACKGROUND:1};
const days=year.rows.map(r=>{
 const observedDay=calendarByDate.get(r.date);
 assert.ok(observedDay&&observedDay.observedPrincipalId===r.mainId,"Source date mismatch "+r.date);
 const id=r.mainId,period=buildLiturgicalYear(r.date).currentPeriod.id,name=norm(r.title);
 const gospel=arr(r.scriptureContexts).find(s=>s.slot==="GOSPEL"&&s.passage);
 const proposals=new Map(),rawCounts={};
 function link(a,tier,evidence){
  if(!a)return;
  const prev=proposals.get(a.id);
  if(prev&&ranks.indexOf(prev.tier)<=ranks.indexOf(tier))return;
  proposals.set(a.id,{artworkId:a.id,title:a.title,artist:a.artist,
   originalSha256:a.acquisition.originalSha256,sourceUrl:a.source.objectUrl,
   rights:a.source.rights,rightsHeld:a.source.rights!=="CC0",
   tier,evidence,editorialAudit:"NOT_YET_PERFORMED",published:false});
 }
 for(const e of exact.filter(x=>x.observedPrincipalId===id&&x.observedDate2026===r.date)){
  const a=artworkById.get(e.artworkId);assert.ok(a&&a.acquisition.originalSha256===e.originalSha256);
  link(a,"STRICT_DAY_SOURCE_LINK",e.evidence);
 }
 for(const e of context.filter(x=>x.observedPrincipalId===id&&x.date2026===r.date)){
  const a=artworkById.get(e.artworkId);assert.ok(a&&a.acquisition.originalSha256===e.originalSha256);
  link(a,"VERIFIED_CONTEXTUAL_LEDGER",e.rationale);
 }
 for(const a of acquired)if(arr(a.association?.observedIds).includes(id)||arr(a.tags?.observed1962Identifiers).includes(id))
  link(a,"OBSERVED_ID_TAG_UNREVIEWED","Canonical observed ID tag, independent date-level verification pending");
 for(const [regex,tag] of titles)if(regex.test(name))for(const a of tagged(tag))
  link(a,"TITULAR_PERSON_OR_EVENT_CANDIDATE","Proper name suggests "+tag+"; confirm identity and artwork context");
 if(gospel?.passage)for(const e of episodes)if(matches(gospel.passage,e))
  for(const a of tagged(e[0]))link(a,"APPOINTED_GOSPEL_SCENE_CANDIDATE",
   "Source-bound appointed Gospel "+gospel.reference+"; event "+e[0]+"; inspect art");
 if(id.startsWith("commune:C10")&&/blessed virgin mary|virgin mary on saturday/.test(name))
  for(const a of [...tagged("marian"),...tagged("virgin-child")])
   link(a,"MARIAN_SATURDAY_CONTEXT","Marian Saturday common, not a precise Proper episode");
 for(const a of acquired)if(arr(a.association?.seasonIds).includes(period)||
  arr(a.tags?.liturgicalSeasonIds).includes(period))
  link(a,"LITURGICAL_SEASON_CONTEXT","1962 liturgical period "+period+" only");
 for(const a of [...tagged("universal"),...tagged("christ-blessing")])
  link(a,"GENERIC_BACKGROUND","General fallback only, not a specific subject");
 const options=ranks.flatMap(tier=>{
  const matching=[...proposals.values()].filter(x=>x.tier===tier).sort((a,b)=>a.artworkId.localeCompare(b.artworkId));
  rawCounts[tier]=matching.length;
  return matching.slice(0,perTierLimits[tier]);
 });
 const specific=options.filter(x=>ranks.indexOf(x.tier)<=4).length;
 const contextual=options.filter(x=>ranks.indexOf(x.tier)===5||ranks.indexOf(x.tier)===6).length;
 return {date:r.date,class:observedDay.rank,observedPrincipalId:id,observedTitle:r.title,
  liturgicalPeriod:period,appointedScripture:arr(r.scriptureContexts),
  alternatives:options,alternativeCount:options.length,originalCandidatesBeforeTierCaps:rawCounts,
  coverage:specific?"SUBJECT_RESEARCH":contextual?"CONTEXT_ONLY":"GENERIC_ONLY",
  specificSubjectResearchStillNeeded:!specific,editorialAudit:"NOT_YET_PERFORMED"};
});
assert.equal(days.length,365);
assert.equal(new Set(days.map(d=>d.date)).size,365);
const perClass=Object.fromEntries([1,2,3,4].map(k=>{
 const ds=days.filter(d=>d.class===k);
 return [k,{dates:ds.length,subjectResearch:ds.filter(d=>d.coverage==="SUBJECT_RESEARCH").length,
  contextOnly:ds.filter(d=>d.coverage==="CONTEXT_ONLY").length,
  genericOnly:ds.filter(d=>d.coverage==="GENERIC_ONLY").length,
  multiArtworkDates:ds.filter(d=>d.alternativeCount>1).length,
  options:ds.reduce((n,d)=>n+d.alternativeCount,0),
  gospelSourceDates:ds.filter(d=>d.appointedScripture.some(s=>s.slot==="GOSPEL"&&s.passage)).length}];
}));
assert.deepEqual([1,2,3,4].map(n=>perClass[n].dates),[53,76,165,71]);
const falseIdentityDays=[
 ["2026-01-15","saint-paul"],["2026-01-18","adoration-magi"],
 ["2026-01-25","adoration-magi"],["2026-01-28","saint-peter"],
 ["2026-02-04","saint-andrew"],["2026-04-27","saint-peter"],
 ["2026-04-29","saint-peter"],["2026-05-19","saint-peter"],
 ["2026-07-20","saint-jerome"],["2026-08-27","saint-joseph"],
 ["2026-09-18","saint-joseph"],["2026-11-08","adoration-magi"],
 ["2026-11-10","saint-andrew"],["2026-11-15","adoration-magi"]
];
for(const [date,misidentified] of falseIdentityDays){
 const row=days.find(d=>d.date===date);
 assert.ok(row,"Missing 2026 date "+date);
 assert.ok(!row.alternatives.some(x=>x.tier==="TITULAR_PERSON_OR_EVENT_CANDIDATE"&&x.evidence.includes("suggests "+misidentified+";")),
  "Invalid identity: "+date+" as "+misidentified);
}
const summary={dates:days.length,uniqueSourceOriginals:acquired.length,
 distinctOriginalsLinked:new Set(days.flatMap(d=>d.alternatives.map(a=>a.artworkId))).size,
 datedArtworkAssociations:days.reduce((n,d)=>n+d.alternativeCount,0),
 datesWithMultipleArtworks:days.filter(d=>d.alternativeCount>1).length,
 needSpecificSubjectResearch:days.filter(d=>d.specificSubjectResearchStillNeeded).length,
 perClass,userEditoriallyAudited:0,approvedForProduction:0};
const report={schema:"AO_SACRED_ART_FULL_YEAR_MULTIPLE_ASSOCIATIONS_V1",year:2026,
 status:"RESEARCH_AND_ASSOCIATION_ONLY_NOT_FINAL_HTML_AUDIT",summary,
 policy:{finalGalleryOnlyAfterBroadResearch:true,unflaggedDefaultEditorialDecision:"ACCEPT",
 exceptions:["REJECT_ARTWORK_GLOBALLY","MISPLACED_ON_DAY","INVESTIGATE_FURTHER"],
 rightsAndCropRemainIndependent:true},
 days};
mkdirSync(folder,{recursive:true});
writeFileSync(folder+"/full-year-multiple-associations.v1.json",JSON.stringify(report,null,2)+"\n");
const missing=days.filter(d=>d.specificSubjectResearchStillNeeded);
const md=[
 "# All 1962 classes — multiple proposed artwork associations per day",
 "",
 "One source-original SHA256 may be reused on many days. This is research, not the final HTML audit or app release.",
 "All source matches retain explicit relationship category and citation. Unrelated/generic fallback does not close missing specific subjects.",
 "",
 "| Class | Days | Specific subject research | Context only | Generic only | Several artworks | Total associations | Source Gospel available |",
 "|---|---:|---:|---:|---:|---:|---:|---:|",
 ...[1,2,3,4].map(k=>{const c=perClass[k];return "| "+["","I","II","III","IV"][k]+" | "+c.dates+" | "+c.subjectResearch+
 " | "+c.contextOnly+" | "+c.genericOnly+" | "+c.multiArtworkDates+" | "+c.options+" | "+c.gospelSourceDates+" |";}),
 "", "Distinct originals reused: "+summary.distinctOriginalsLinked+".",
 "Specific subject work still needed on "+missing.length+" days:",
 ...missing.map(d=>"- "+d.date+" · Class "+d.class+" · "+d.observedTitle+
 " · "+(d.appointedScripture.find(s=>s.slot==="GOSPEL")?.reference||"Gospel source not available")),
 "",
 "Final gallery is intentionally deferred until the broad research and associations are stable.",
 "Editorial audit is exception-only: unflagged = accepted; reject artwork globally, mark a day misplacement, or investigate; rights and crop reviewed separately."
];
writeFileSync(folder+"/full-year-multiple-associations.v1.md",md.join("\n")+"\n");
console.log("SACRED_ART_MULTIPLE_DAY_ASSOCIATIONS="+JSON.stringify(summary));
