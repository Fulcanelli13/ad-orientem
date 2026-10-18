// Red Missal English editorial batch 1: 256-cue review worklist and
// 1962 source-to-LOW/SUNG native reader cross-surface regression.
// This file does NOT claim to have manually collated 256 scanned passages.
import assert from "node:assert/strict";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {createReaderSectionResolver} from "../src/mass/reader-sections.js";
import {validateReaderTextCorpus,buildReaderSectionCard} from "../src/mass/reader-text.js";
import {applyCanonicalTextCorrection} from "../src/mass/canonical-text-corrections.js";
const path=rel=>fileURLToPath(new URL("../"+rel,import.meta.url));
const load=async rel=>JSON.parse(await readFile(path(rel),"utf8"));
const [low,sung,french,sectionMap,manifest,corrections]=await Promise.all([
 "data/presentation/reader-text-low.v1.json",
 "data/presentation/reader-text-sung.v1.json",
 "data/presentation/reader-french-ordinary.v1.json",
 "data/presentation/reader-section-map.v0.13.1.json",
 "data/research/mass-ordo-red-missal-2013-editorial.v1.json",
 "data/mass/canonical-text-corrections.v1.json",
].map(load));
const sections=createReaderSectionResolver(sectionMap);
const approved=new Map(manifest.approvedCues.map(x=>[x.id,x]));
assert.equal(approved.size,4);
const allCorrections=new Map(corrections.corrections.map(x=>[x.cueId,x]));
const reviewRows={};
const defaults=["INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","GRADUAL",
 "ALLELUIA_TRACT_SEQUENCE","GOSPEL","OFFERTORY","SECRET_SET","PREFACE",
 "COMMUNION","POSTCOMMUNION_SET"];
const properSlots=Object.fromEntries(defaults.map(s=>[s,{status:"READY",data:{
 latin:"SOURCE LATIN "+s,english:"SOURCE ENGLISH "+s}}]));
for(const corpus of [low,sung]){
 validateReaderTextCorpus(corpus);
 const rows=[];
 const check=new Map();
 for(const block of corpus.blocks.filter(b=>!b.Proper_Slot)){
  const seq=block.Macro_ID.slice(-2),range=manifest.macroBookletPrintPages[seq];
  assert.ok(Array.isArray(range),"Missing booklet page location for "+block.Macro_ID);
  for(const unit of block.units??[]){
   if(typeof unit.latin!=="string"||typeof unit.english!=="string")continue;
   const corrected=applyCanonicalTextCorrection(block.Block_ID,unit);
   assert.equal(corrected.cue_id,unit.cue_id);
   const a=approved.get(unit.cue_id)??null,correction=allCorrections.get(unit.cue_id);
   if(a){
    assert.ok(correction,"Approved correction missing: "+unit.cue_id);
    assert.equal(correction.id,a.correctionId);
    assert.equal(correction.field,"english");
    assert.ok(unit.english.includes(correction.from),"Exact original English changed: "+unit.cue_id);
    assert.ok(corrected.english.includes(correction.to),"Approved Red correction missing: "+unit.cue_id);
    assert.ok(!corrected.english.includes(correction.from),"Uncorrected Red English remains: "+unit.cue_id);
    assert.equal(corrected.latin,unit.latin,"English editorial edit modified Latin: "+unit.cue_id);
   }else{
    assert.equal(corrected.english,unit.english,"Unreviewed English cue was rewritten: "+unit.cue_id);
   }
   assert.equal(french.byCue[unit.cue_id]!==undefined,true,"Untranslated Ordinary FR cue: "+unit.cue_id);
   const row={cueId:unit.cue_id,blockId:block.Block_ID,blockTitle:block.Title,
    macroId:block.Macro_ID,bookletPrintedPageRange:range,
    existingLatin:corrected.latin,originalEnglish:unit.english,
    approvedEnglish:corrected.english,originalFrench:french.byCue[unit.cue_id],
    status:a?.status??"NOT_YET_INDEPENDENTLY_COLLATED",
    approvedBookletPdfPage:a?.bookletPdfPage??null,
    correctionId:a?.correctionId??null};
   rows.push(row);
   check.set(unit.cue_id,row);
  }
 }
 assert.equal(rows.length,manifest.canonicalCuesExpected,
  corpus.form+": fixed Ordo Missae 256 cue review coverage changed");
 assert.equal(new Set(rows.map(x=>x.cueId)).size,rows.length);
 reviewRows[corpus.form]=rows;
 // Exercise the native reader's actual source-to-presentation pipeline for
 // the amended Offertory and Orate fratres cards, in both EN/FR locales.
 for(const lang of ["en","fr"]){
  for(const cardId of ["AO.CARD.010","AO.CARD.011"]){
   const card=buildReaderSectionCard({corpus,section:sections.sectionById(cardId),
    properSlots,vernacularLanguage:lang,frenchOrdinary:french,
    actualForm:corpus.form==="LOW"?"LOW":"MISSA_CANTATA_SIMPLE"});
   for(const item of manifest.approvedCues){
    if(!card.blocks.some(b=>b.blockId===check.get(item.id).blockId))continue;
    const p=card.paragraphs.find(x=>x.sourceCueIds?.includes(item.id));
    assert.ok(p,corpus.form+"/"+lang+": approved source cue not in reader "+item.id);
    const display=[p.primary,p.alternate,p.secondary].filter(Boolean).join("\n");
    const corrected=check.get(item.id);
    if(lang==="en"){
     assert.ok(display.includes(allCorrections.get(item.id).to),
       corpus.form+" reader lacks approved English "+item.id);
     assert.ok(!display.includes(allCorrections.get(item.id).from),
       corpus.form+" reader still exposes erroneous English "+item.id);
    }else{
     assert.ok(display.includes(corrected.originalFrench),
       corpus.form+" English edit changed French prayer "+item.id);
    }
    assert.ok(display.includes(corrected.existingLatin),
      corpus.form+" reader lost controlling Latin at "+item.id);
   }
  }
 }
}
const l=new Map(reviewRows.LOW.map(x=>[x.cueId,x]));
for(const row of reviewRows.SUNG){
 const lowRow=l.get(row.cueId);
 assert.ok(lowRow,"SUNG cue not in LOW: "+row.cueId);
 const normalize=s=>String(s).replace(/^[SMVRD]\.\s*/,"");
 for(const f of ["existingLatin","approvedEnglish"]){
  assert.equal(normalize(lowRow[f]),normalize(row[f]),
   "Non-speaker Low/Sung wording divergence "+row.cueId+"/"+f);
 }
}
const output=path("artifacts/mass-ordo-red-missal/256-cue-editorial-worklist.json");
await mkdir(dirname(output),{recursive:true});
const review={schema:"ao.mass.ordo-missae.red-missal.editorial-worklist.v1",
 witness:manifest.source,status:"ONLY_FIRST_4_APPROVED; ALL_OTHER_CUES_PENDING",
 sampleSize:256,formCount:2,approvedCount:approved.size,
 rows:reviewRows.SUNG,formParity:"LOW/SUNG checked",french:"UNCHANGED",
 openTranslationDecisions:manifest.unresolvedTranslationDecisions};
await writeFile(output,JSON.stringify(review,null,2)+"\n");
console.log("RED_MISSAL_SUMMARY="+JSON.stringify({sourceCues:256,lowCues:reviewRows.LOW.length,
 sungCues:reviewRows.SUNG.length,approved:approved.size,pending:256-approved.size,
 lowSungParity:"PASS",actualReaderEnglishFrench:"PASS"}));
console.log("RED_MISSAL_ARTIFACT=artifacts/mass-ordo-red-missal/256-cue-editorial-worklist.json");
console.log("PASS Red Missal editorial batch 1: four exact-source upgrades and 256-cue worklist");
