// Phase 1B — fixed 1962 Ordo Missae text, NOT the liturgical-year Ordo.
// Audit-only: no edits to frozen LOW/SUNG donors, the pinned French
// witness, canonical corrections, Mass Proper data or reader UI.
import assert from "node:assert/strict";
import {readFile, mkdir, writeFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {dirname} from "node:path";
import {createReaderSectionResolver} from "../src/mass/reader-sections.js";
import {validateReaderTextCorpus,buildReaderSectionCard} from "../src/mass/reader-text.js";
import {applyCanonicalTextCorrection} from "../src/mass/canonical-text-corrections.js";
const read=async rel=>JSON.parse(await readFile(fileURLToPath(new URL("../"+rel,import.meta.url)),"utf8"));
const low=await read("data/presentation/reader-text-low.v1.json");
const sung=await read("data/presentation/reader-text-sung.v1.json");
const french=await read("data/presentation/reader-french-ordinary.v1.json");
const sectionMap=await read("data/presentation/reader-section-map.v0.13.1.json");
const sections=createReaderSectionResolver(sectionMap);
const output=fileURLToPath(new URL("../artifacts/mass-ordo-grammar/fixed-ordo-phase1b.json",import.meta.url));
const localeKeys=Object.keys(french.byCue).sort();
const corpusRows={};let macroCount=null;
for(const corpus of [low,sung]){
 const meta=validateReaderTextCorpus(corpus);
 assert.equal(meta.blocks,96);
 assert.equal(meta.properBlocks,11);
 const cues=corpus.blocks.filter(b=>!b.Proper_Slot).flatMap(b=>(b.units??[])
  .filter(u=>typeof u.latin==="string" && typeof u.english==="string")
  .map(u=>({id:u.cue_id,blockId:b.Block_ID,title:b.Title,type:u.type,latin:u.latin,
    en:u.english,fr:french.byCue[u.cue_id]})));
 assert.equal(cues.length,256,"Ordinary text cue coverage for "+corpus.form);
 assert.ok(cues.every(u=>typeof u.fr==="string"&&u.fr.trim()),"Missing French fixed-text cue");
 assert.equal(new Set(cues.map(x=>x.id)).size,256,"Duplicate cue identity");
 const sourceCorrections=[];
 for(const u of cues){
  const corrected=applyCanonicalTextCorrection(u.blockId,{
   cue_id:u.id,latin:u.latin,english:u.en});
  if(corrected.canonicalCorrectionId){
   sourceCorrections.push({id:corrected.canonicalCorrectionId,cueId:u.id,sourceLatin:u.latin,
     projectedLatin:corrected.latin});
  }
 }
 assert.equal(sourceCorrections.length,5, "Expected all 5 established canonical source corrections");
 corpusRows[corpus.form]={cues,canonicalCorrections:sourceCorrections,
  counts:{totalBlocks:corpus.blocks.length,ordinaryBlocks:corpus.blocks.filter(b=>!b.Proper_Slot).length,
   properPlaceholders:corpus.blocks.filter(b=>b.Proper_Slot).length,
   ordinaryCues:cues.length,sourceCorrections:sourceCorrections.length}};
 macroCount=corpus.macros.length;
}
assert.equal(localeKeys.length,256);
const byId=corpus=>new Map(corpusRows[corpus].cues.map(c=>[c.id,c]));
const sungCues=byId("SUNG"),lowCues=byId("LOW");
const prefix=s=>String(s).replace(/^[SMVRD]\.\s*/u,"");
const familyDifferences=[];
for(const [id,c] of sungCues){
 const counterpart=lowCues.get(id);
 assert.ok(counterpart,"Low Mass Ordinary cue ID absent "+id);
 for(const field of ["latin","en","fr"]){
  const a=c[field],b=counterpart[field];
  if(a!==b)familyDifferences.push({cueId:id,field,onlySpeakerPrefix:prefix(a)===prefix(b),
   sung:a,low:b});
 }
}
const unexpectedFamilyDifferences=familyDifferences.filter(x=>!x.onlySpeakerPrefix);
const suspects=[];
for(const [id,u] of sungCues){
 const rules=[
  ["EN_MALFORMED_INCENSE_PSALM",u.en,/Let my prayer, O Lord, like incense before You;/u],
  ["EN_UNNECESSARY_COMMA_AFTER_SUBJECT",u.en,/May this incense blessed by You, arise before You/u],
  ["UNRESOLVED_SOURCE_TOKEN",u.en,/(\b(?:undefined|null)\b|�|\{\{[^}]+\}\})/u],
  ["UNRESOLVED_SOURCE_TOKEN",u.fr,/(\b(?:undefined|null)\b|�|\{\{[^}]+\}\})/u],
  ["EN_DOUBLE_WORD",u.en,/\b(the the|and and|of of|to to|in in)\b/iu],
  ["FR_DOUBLE_WORD",u.fr,/\b(de de|les les|le le|et et|pour pour|que que)\b/iu]
 ];
 for(const [rule,value,pattern] of rules){
  const m=value.match(pattern);
  if(m)suspects.push({id:u.id,blockId:u.blockId,title:u.title,rule,
   language:rule.startsWith("FR_")?"fr":"en",excerpt:m[0],
   sourceText:value,classification:rule.startsWith("UNRESOLVED")?"MACHINE_FLAG":
    rule.includes("INCENSE")?"VERIFIED_GRAMMAR":"EDITORIAL_PUNCTUATION"});
 }
}
const slots=["INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","GRADUAL",
 "ALLELUIA_TRACT_SEQUENCE","GOSPEL","OFFERTORY","SECRET_SET",
 "PREFACE","COMMUNION","POSTCOMMUNION_SET"];
const properSlots=Object.fromEntries(slots.map(x=>[x,{
 status:"READY",data:{latin:"LATIN "+x,english:"ENGLISH "+x}}]));
const present=[];
for(const [corpus,form] of [[low,"LOW"],[sung,"MISSA_CANTATA_SIMPLE"]]){
 for(const lang of ["en","fr"]){
  for(const part of ["AO.CARD.003","AO.CARD.010","AO.CARD.013","AO.CARD.014"]){
   const card=buildReaderSectionCard({corpus,section:sections.sectionById(part),
    properSlots,vernacularLanguage:lang,frenchOrdinary:french,actualForm:form});
   for(const cueId of ["AO.SM.C0053","AO.SM.C0121","AO.SM.C0122","AO.SM.C0148","AO.SM.C0194"]){
    const paragraph=card.paragraphs.find(p=>p.sourceCueIds?.includes(cueId));
    if(paragraph)present.push({form,lang,sectionId:part,cueId,
      primary:paragraph.primary,alternate:paragraph.alternate,secondary:paragraph.secondary,
      sourceCueIds:paragraph.sourceCueIds});
   }
  }
 }
}
assert.equal(present.filter(x=>x.cueId==="AO.SM.C0122").length,4,
 "Incensation Psalm must be visible in LOW/SUNG both reader languages");
for(const row of present.filter(x=>x.cueId==="AO.SM.C0122")){
 assert.ok([row.primary,row.alternate,row.secondary].some(s=>
   String(s??"").includes("Let my prayer, O Lord, like incense before You")),
   "Audited corrupt English sentence was not found in active Ordo Missae projection");
}
for(const row of present.filter(x=>x.cueId==="AO.SM.C0194")){
 assert.ok([row.primary,row.alternate,row.secondary].some(s=>
   String(s??"").includes("lucis et pacis")),
   "Prior Canon Latin correction did not reach displayed card");
}
for(const row of present.filter(x=>x.cueId==="AO.SM.C0053")){
 assert.ok([row.primary,row.alternate,row.secondary].some(s=>
   String(s??"").includes("Gloire à Dieu au plus haut des cieux.")||String(s??"").includes("Glory to God in the highest.")),
   "The composed Gloria opening is not coherent in its reader language");
}
const summary={
 ordinaryMacroCount:macroCount,
 low:corpusRows.LOW.counts,sung:corpusRows.SUNG.counts,
 frenchPinnedCueCount:localeKeys.length,distinctOrdinaryCues:256,
 lowSungTextDifferences:familyDifferences.length,
 onlySpeakerPrefixDifferences:familyDifferences.filter(x=>x.onlySpeakerPrefix).length,
 unexpectedFamilyDifferences:unexpectedFamilyDifferences.length,
 sourceCorrectionsAlreadyApplied:corpusRows.SUNG.canonicalCorrections.length,
 confirmedOffertoryEnglishErrors:suspects.filter(x=>[
  "EN_MALFORMED_INCENSE_PSALM","EN_UNNECESSARY_COMMA_AFTER_SUBJECT"
 ].includes(x.rule)).length,detectedCandidates:suspects.length
};
assert.equal(unexpectedFamilyDifferences.length,0,"Real low/sung wording drift");
assert.equal(summary.confirmedOffertoryEnglishErrors,2);
const result={schema:"ao-1962-ordo-missae-fixed-text-qa-v1",scope:"Fixed Ordo Missae, NOT dated calendar or Proper texts",
 pinnedFrenchCommit:french.source.commit,forms:["LOW","MISSA_CANTATA_SIMPLE"],
 source:"frozen canonical Ordinary corpora plus production reader text projection",
 limitations:"Linguistic first pass, not full independent 1962 printed-Missal Latin collation; positive findings only",
 summary,suspects,unexpectedFamilyDifferences,
 inspectedActiveReaderSections:present,canonicalCorrections:corpusRows.SUNG.canonicalCorrections,
 witnesses:{
 incensePsalm:"https://www.dur.ac.uk/media/durham-university/research-/research-centres/catholic-studies-centre-for-ccs/Missa-Cantata-liturgy-booklet-17-6-19.pdf",
 upstreamInherited:"https://www.missalemeum.com/en/ordo",
 independentSecond:"https://www.ewtn.com/catholicism/library/ordinary-of-the-tridentine-mass-11210"
 }};
await mkdir(dirname(output),{recursive:true});
await writeFile(output,JSON.stringify(result,null,2)+"\n");
console.log("ORDO_MISSAE_QA_SUMMARY="+JSON.stringify(summary));
console.log("ORDO_MISSAE_QA_SUSPECTS="+JSON.stringify(suspects.map(x=>({
 id:x.id,blockId:x.blockId,language:x.language,rule:x.rule,excerpt:x.excerpt
}))));
console.log("ORDO_MISSAE_QA_ARTIFACT=artifacts/mass-ordo-grammar/fixed-ordo-phase1b.json");
console.log("PASS read-only Ordo Missae 256-cue, LOW/SUNG, EN/FR+Latin and final active card audit");
