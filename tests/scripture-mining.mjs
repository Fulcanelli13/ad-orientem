import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {SCRIPTURE_EDITIONS,DEFAULT_SCRIPTURE_EDITION} from "../src/scripture/catalogue.js";
import {createScripturePreferences} from "../src/scripture/preferences.js";
import {sourceMiningTargets,loadSourceMiningTargets,miningWorkbenchUrl} from "../src/scripture/mining-targets.js";
import {SCRIPTURE_LINK_COUNTS} from "../src/scripture/related-objects.js";
import {mineScriptureReference,validateScriptureMiningDecision,
  countIndependentSelections,MINING_ENGLISH_EDITIONS} from "../src/scripture/mining-service.js";
import {estherParallelSpans} from "../src/scripture/esther-span-crosswalk.js";
import {parseScriptureContext} from "../src/scripture/context.js";

assert.equal(DEFAULT_SCRIPTURE_EDITION.en,"dr-challoner");
assert.equal(SCRIPTURE_EDITIONS["cpdv-2009"].role,"readability-option");
assert.equal(SCRIPTURE_EDITIONS["dr-challoner"].role,"default");
assert.deepEqual(MINING_ENGLISH_EDITIONS,["cpdv-2009","dr-challoner"]);
assert.ok(Object.values(SCRIPTURE_EDITIONS).every(edition=>edition.enabled===false));
const storage={read:null,getItem(){return this.read},setItem(_key,v){this.read=v}};
const pref=createScripturePreferences(storage);
assert.equal(pref.englishEdition(),"dr-challoner","Fresh reader opens the historical edition; CPDV is optional");
assert.equal(pref.setEnglishEdition("cpdv-2009"),true);
assert.equal(pref.englishEdition(),"cpdv-2009","Explicit readable alternative must persist");
assert.equal(pref.setEnglishEdition("dr-challoner"),true);
assert.equal(pref.englishEdition(),"dr-challoner","Switching back remains possible");
const events=[];
const witnessLoader=async(editionId,book)=>{
 events.push("witness:"+editionId+":"+book);
 return [{editionId,book,chapter:1,verseStart:28,verseEnd:28,
   text:editionId==="cpdv-2009"?"Clear CPDV source witness":"Historic Douay source witness",
   sourceStatus:"UNCOLLATED_SOURCE_WITNESS",reviewed:false},
  {editionId,book,chapter:1,verseStart:29,verseEnd:29,
   text:"Contextual witness only",sourceStatus:"UNCOLLATED_SOURCE_WITNESS",reviewed:false}];
};
const commentaryLoader=async()=>[{citation:"Catena Aurea, Luke 1:28",
 source:{url:"https://www.ecatholic2000.com/catena/untitled-62.shtml"},
 segments:[{father:"St Ambrose",text:"Original attributed historical commentary."}]}];
const mined=await mineScriptureReference("Luke 1:28",{
 origin:{moduleId:"rosary",objectId:"joy1",bead:2},witnessLoader,commentaryLoader,
 fetcher:async()=>{throw Error("Unexpected network")}
});
assert.equal(mined.primaryEdition,"cpdv-2009");
assert.equal(mined.comparisonEdition,"dr-challoner");
assert.equal(mined.readings["cpdv-2009"].verses.length,1,"Only requested verse, not all book text");
assert.equal(mined.readings["dr-challoner"].verses.length,1);
assert.match(mined.readings["cpdv-2009"].verses[0].text,/Clear CPDV/);
assert.deepEqual(events,["witness:cpdv-2009:Luke","witness:dr-challoner:Luke"]);
assert.equal(mined.commentary.sections[0].segments[0].father,"St Ambrose");
assert.equal(mined.origin.bead,2);
assert.equal(mined.editorialStatus,"RESEARCH_NOT_APPROVED_FOR_VERBATIM_ROSARY_CUES");
// A single-verse extraction is not automatic approval to quote on a Rosary bead.
assert.equal(mined.readings["cpdv-2009"].sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
assert.equal(mined.exactEditionParallelVerified,false);
assert.ok(mined.readings["cpdv-2009"].sourceUrl.startsWith("https://sacredbible.org/"));
assert.ok(mined.readings["dr-challoner"].sourceUrl.includes("biblegateway.com"));
await assert.rejects(()=>mineScriptureReference("UnknownBook 1:1",{witnessLoader}),/INVALID_CATHOLIC/);
const split=await mineScriptureReference("Esther 14:1-2",{witnessLoader,commentaryLoader});
assert.equal(split.readings["dr-challoner"].available,true,
 "Mapped Greek-addition spans now use the existing source-collated Esther concordance");
assert.equal(split.readings["dr-challoner"].passage.chapter,9,
 "CPDV 14:1–2 maps to traditional Esther 9:1–2 rather than matching numbered chapters");
assert.equal(split.readings["dr-challoner"].sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
assert.equal(split.readings["dr-challoner"].verses.length,0,
 "The tiny Luke-only test fixture supplies no Esther words; never fabricate missing text");
const selected=validateScriptureMiningDecision({reference:"Luke 1:28",rating:5,
 disposition:"SUITABLE_ELSEWHERE",originModule:"rosary",originId:"joy1",
 destinationId:"joy2",destinationBead:8,duplicate:true});
assert.equal(selected.schema,"ao.scripture.mining-decision.v1");
assert.equal(selected.duplicate,true);
assert.equal(selected.editorialStatus,"RESEARCH_SELECTION_UNAPPROVED");
assert.ok(!("text" in selected),"Do not duplicate Bible translations in reviewer exports");
assert.throws(()=>validateScriptureMiningDecision({...selected,rating:6}),/INVALID_SCRIPTURE/);
assert.equal(countIndependentSelections([
 {editorialFamilyId:"Catholic Lectionary",qualified:true},
 {editorialFamilyId:"Catholic Lectionary",qualified:true},
 {editorialFamilyId:"Missal 1962",qualified:false},
 {editorialFamilyId:"Other publisher",qualified:true}
]),2);
const html=readFileSync(new URL("../previews/scripture-mining-workbench-20261017.html",import.meta.url),"utf8");
assert.match(html,/mineScriptureReference/);
assert.match(html,/ROSARY_GUIDED_BEAD_EVIDENCE_V1/);
assert.match(html,/Export JSON/);
assert.match(html,/CPDV first/);
assert.ok(!/https:\/\/raw\.githubusercontent\.com/.test(html),"No live third-party corpus fetch");
assert.equal(sourceMiningTargets("mass").length,SCRIPTURE_LINK_COUNTS.massFormation);
assert.equal(sourceMiningTargets("formation").length,SCRIPTURE_LINK_COUNTS.massFormation,
 "Formation reuses the Mass study source owner rather than creating duplicate citations");
assert.equal(sourceMiningTargets("novena").length,16);
assert.equal(sourceMiningTargets("prayer").length,8);
assert.equal(sourceMiningTargets("stations").length,9);
assert.equal(sourceMiningTargets("historia").length,0,"Never invent Atlas data without its owner");
assert.equal(sourceMiningTargets("rosary").length,0,"Rosary already owns its per-bead controls");
assert.equal(sourceMiningTargets("novena").find(x=>x.objectId==="annunciation")?.reference,"Luke 1:26–38");
assert.equal(sourceMiningTargets("mass").find(x=>x.objectId==="MFS01")?.relation,"ADAPTED_WORDS");
const atlasFixture=Object.freeze([{
 source:"atlas",objectId:"biblical:event:fixture",id:"atlas:biblical:event:fixture",
 reference:"Luke 1:28",title:{en:"Atlas source fixture",fr:"Fixture Atlas"},
 relation:"BIBLICAL_NARRATIVE_OR_VISION_EVENT"
}]);
const atlasTargets=await loadSourceMiningTargets("historia",{atlasLoader:async()=>atlasFixture});
assert.equal(atlasTargets.length,1);
assert.equal(atlasTargets[0].objectId,"biblical:event:fixture");
assert.equal(sourceMiningTargets("historia",{atlasEvents:atlasFixture}).length,1);
assert.match(miningWorkbenchUrl({module:"novena",objectId:"annunciation",reference:"Luke 1:26–38"}),
 /scripture-mining-workbench-20261017\.html\?module=novena/);
assert.throws(()=>miningWorkbenchUrl({module:"rosary",mystery:"joy9",bead:2}),/INVALID_MINING_MYSTERY/);
const beadReview=validateScriptureMiningDecision({reference:"Luke 1:28",
 rating:5,disposition:"KEEP_HERE",originModule:"rosary",originId:"joy1",
 originBead:2,destinationId:"joy1",destinationBead:2,duplicate:false});
assert.equal(beadReview.originBead,2,"Distinct Guided beads must retain editorial identity");
const legacyReview=validateScriptureMiningDecision({...beadReview,originBead:undefined});
assert.equal(legacyReview.originBead,null,"Older exported ratings remain readable");
const inlineScript=html.split('<script type="module">')[1]?.split("</script>")[0];
assert.ok(inlineScript,"Workbench must retain a single module entry point");
const syntax=spawnSync(process.execPath,["--check","--input-type=module"],
 {input:inlineScript,encoding:"utf8"});
assert.equal(syntax.status,0,syntax.stderr||"Workbench script failed syntax validation");
assert.match(html,/loadSourceMiningTargets/);
assert.match(html,/linkedObject/);
assert.match(readFileSync(new URL("../src/scripture/library.js",import.meta.url),"utf8"),/ao_scripture_research/,
 "The canonical reader can open editorial mining on explicit opt-in only");

// P3: original Esther source-collated verses are composed into ordered spans.
const esther=({chapter,verseStart,verseEnd=verseStart})=>({book:"Esther",chapter,verseStart,verseEnd});
assert.deepEqual(estherParallelSpans(esther({chapter:7,verseStart:12,verseEnd:17}),
 "cpdv-2009","dr-challoner"),[
 esther({chapter:4,verseStart:10,verseEnd:14}),
 esther({chapter:15,verseStart:1}),
 esther({chapter:4,verseStart:15})
],"Do not flatten rearranged Catholic Esther to a fabricated continuous Douay passage");
assert.deepEqual(estherParallelSpans(esther({chapter:4,verseStart:12,verseEnd:13}),
 "dr-challoner","cpdv-2009"),[esther({chapter:7,verseStart:14})],
 "Two Douay verses are precisely one CPDV verse, not duplicate text");
assert.equal(estherParallelSpans(esther({chapter:15,verseStart:15}),
 "cpdv-2009","dr-challoner"),null,"Unknown coordinates fail closed");
const estherRows=async(editionId,book)=>{
 const rows=[];
 const add=(chapter,verse)=>rows.push({book,chapter,verseStart:verse,verseEnd:verse,
  text:editionId+" verse "+chapter+":"+verse,sourceStatus:"UNCOLLATED_SOURCE_WITNESS"});
 if(editionId==="cpdv-2009"){for(let v=12;v<=17;v++)add(7,v)}
 else{for(let v=10;v<=15;v++)add(4,v);add(15,1)}
 return rows;
};
const multiEsther=await mineScriptureReference("Esther 7:12-17",{
 witnessLoader:estherRows,commentaryLoader:async()=>[]
});
assert.equal(multiEsther.referenceEdition,"cpdv-2009");
assert.equal(multiEsther.exactEditionParallelVerified,true);
assert.equal(multiEsther.readings["cpdv-2009"].verses.length,6);
assert.deepEqual(multiEsther.readings["dr-challoner"].verses.map(x=>x.chapter+":"+x.verse),[
 "4:10","4:11","4:12","4:13","4:14","15:1","4:15"
]);
assert.equal(multiEsther.readings["dr-challoner"].sourceUrls.length,3);
assert.equal(multiEsther.readings["dr-challoner"].sourceUrl,null,
 "One source URL would conceal a discontiguous traditional sequence");
const traditionalEsther=await mineScriptureReference("Esther 4:12-13",{
 referenceEdition:"dr-challoner",witnessLoader:estherRows,commentaryLoader:async()=>[]
});
assert.equal(traditionalEsther.readings["cpdv-2009"].passage.chapter,7);
assert.equal(traditionalEsther.readings["cpdv-2009"].passage.verseStart,14);
assert.equal(traditionalEsther.readings["cpdv-2009"].verses.length,1);
await assert.rejects(()=>mineScriptureReference("Luke 1:28",{
 referenceEdition:"dr-challoner",witnessLoader
}),/REFERENCE_EDITION_OVERRIDE_ONLY_FOR_ESTHER/);
const sourceAware=validateScriptureMiningDecision({...selected,referenceEdition:"dr-challoner"});
assert.equal(sourceAware.referenceEdition,"dr-challoner");
assert.equal(validateScriptureMiningDecision(selected).referenceEdition,"cpdv-2009",
 "Historic decision exports without edition metadata stay readable");


const correctionDelta=JSON.parse(readFileSync(
 new URL("../data/research/historia-salutis-v18-part-ii-correction-delta.v1.json",import.meta.url),"utf8"));
assert.equal(correctionDelta.sourceRowCount,217);
assert.equal(correctionDelta.releaseStatus,"EDITORIAL_RESEARCH_ONLY_NOT_APPROVED");
assert.deepEqual(correctionDelta.chapters.map(x=>x.chapterId),
 ["H21","H27","H42","H45","H53","H54","H73","H76"]);
assert.deepEqual(correctionDelta.chapters.map(x=>x.units.length),[5,5,7,2,4,5,7,5]);
assert.equal(new Set(correctionDelta.chapters.flatMap(x=>x.units.map(y=>y.unitId))).size,40);
assert.ok(correctionDelta.chapters.flatMap(x=>x.units).every(x=>
 x.originalReference&&x.candidateReadings.length&&x.approved===false&&x.textReviewed===false));
assert.equal(correctionDelta.chapters.find(c=>c.chapterId==="H42").units[6].originalReference,"Esther 4:1–17");
assert.equal(correctionDelta.chapters.find(c=>c.chapterId==="H42").units[6].sourceEdition,"UNDETERMINED_IN_V18");
assert.equal(correctionDelta.chapters.find(c=>c.chapterId==="H76").units[3].originalReference,"Revelation 13:1–10");


const sourceVerses=(edition,book)=>{
 const raw=JSON.parse(readFileSync(new URL(
   "../data/scripture/witness/"+edition+"/"+book+".json",import.meta.url),"utf8"));
 assert.equal(raw.editionId,edition);
 return new Set(raw.verses.map(v=>v[0]+":"+v[1]));
};
const cpEsther=sourceVerses("cpdv-2009","Esther");
const drEsther=sourceVerses("dr-challoner","Esther");
const findChapter=id=>correctionDelta.chapters.find(c=>c.chapterId===id);
const h42=findChapter("H42"),h76=findChapter("H76");
const estherUnit=h42.units.find(x=>x.originalReference==="Esther 4:1–17");
assert.equal(estherUnit.sourceEdition,"UNDETERMINED_IN_V18",
 "v18's unnamed Esther reference edition is never guessed");
assert.equal(estherUnit.candidateEdition,"cpdv-2009");
assert.equal(estherUnit.fullCompanionReadings.length,4);
assert.ok(estherUnit.fullCompanionReadings.every(x=>x.edition==="cpdv-2009"));
let previous=-1;
for(const reference of estherUnit.candidateReadings){
 const m=/^Esther (\d+):(\d+)(?:[–-](\d+))?$/.exec(reference);
 assert.ok(m,"Candidate must be an explicit CPDV source reference: "+reference);
 const ch=Number(m[1]),first=Number(m[2]),last=Number(m[3]||m[2]);
 assert.ok(ch*1000+first>previous,"CPDV Esther primary reading order must be monotonic");
 previous=ch*1000+last;
 for(let v=first;v<=last;v++){
  assert.ok(cpEsther.has(ch+":"+v),"Missing CPDV Esther "+ch+":"+v);
  const destination=estherParallelSpans(esther({chapter:ch,verseStart:v}),"cpdv-2009","dr-challoner");
  assert.ok(destination,"Unmapped Catholic Esther verse "+ch+":"+v);
  for(const d of destination)for(let w=d.verseStart;w<=d.verseEnd;w++)
   assert.ok(drEsther.has(d.chapter+":"+w),"Mapped Douay Esther missing "+d.chapter+":"+w);
 }
}
assert.ok(estherUnit.candidateReadings.includes("Esther 10:1–11"),
 "Haman's presence and speech must remain intelligible");
assert.ok(estherUnit.candidateReadings.includes("Esther 14:16–22"),
 "Violent reversal and Purim context may not be silently erased");
const daniel3=h42.units.find(x=>x.originalReference==="Daniel 3:24–90");
for(const edition of ["cpdv-2009","dr-challoner"]){
 const source=sourceVerses(edition,"Daniel");
 for(const reference of daniel3.candidateReadings){
  const m=/^Daniel (\d+):(\d+)(?:[–-](\d+))?$/.exec(reference);
  assert.ok(m);
  for(let v=Number(m[2]);v<=Number(m[3]||m[2]);v++)
   assert.ok(source.has(m[1]+":"+v),"Missing Daniel verse "+edition+" "+m[1]+":"+v);
 }
}
const rev12=h76.units.find(x=>x.originalReference==="Revelation 12:1–17");
assert.deepEqual(rev12.candidateReadings,["Revelation 12:1–18"]);
for(const edition of ["cpdv-2009","dr-challoner"]){
 const source=sourceVerses(edition,"Revelation");
 assert.ok(source.has("12:18")&&source.has("13:11"),
  "The two installed Catholic witnesses require the dragon transition and second beast");
}


const H42_PRINCIPAL_VERSES=195;
const H42_PRINCIPAL_IDS=["H42-01","H42-02","H42-03","H42-04","H42-05","H42-06","H42-07"];
let h42PrincipalCount=0;
for(const [idx,unit] of h42.units.entries()){
 assert.equal(unit.unitId,H42_PRINCIPAL_IDS[idx]);
 assert.equal(unit.principalEdition,"cpdv-2009");
 assert.ok(["SOURCE_SELECTED_CONTINUITY_PENDING","SOURCE_SEAM_INSPECTED_NOT_READALOUD"].includes(unit.principalStatus),"No sequence has yet passed complete oral continuity acceptance");
 assert.ok(unit.principalReadings.length>0&&unit.candidateReadings.length>0);
 assert.notEqual(unit.principalReadings,unit.candidateReadings,
  "The concise and expanded source selection must be separately retained");
 let lastBook=null,lastPosition=-1;
 for(const ref of unit.principalReadings){
  const parsed=parseScriptureContext(ref);
  assert.ok(parsed,"All principal references must parse: "+ref);
  const p=parsed.passage;
  const current=p.chapter*1000+p.verseStart;
  assert.ok(lastBook===null||lastBook===p.book&&current>lastPosition,
    "H42 independent witness should read forward: "+unit.unitId+" "+ref);
  lastBook=p.book;lastPosition=p.chapter*1000+p.verseEnd;
  const cp=sourceVerses("cpdv-2009",p.book),dr=sourceVerses("dr-challoner",p.book);
  for(let v=p.verseStart;v<=p.verseEnd;v++){
   h42PrincipalCount++;
   assert.ok(cp.has(p.chapter+":"+v),"Absent CPDV H42 verse "+ref);
   if(p.book==="Esther"){
    const linked=estherParallelSpans(esther({chapter:p.chapter,verseStart:v}),
       "cpdv-2009","dr-challoner");
    assert.ok(linked,"Unmapped principal Esther verse "+p.chapter+":"+v);
    for(const span of linked)for(let w=span.verseStart;w<=span.verseEnd;w++)
     assert.ok(dr.has(span.chapter+":"+w),"Unresolved Douay principal Esther verse");
   }else{
    assert.ok(dr.has(p.chapter+":"+v),"Missing DR companion H42 verse "+ref);
   }
  }
 }
 assert.equal(unit.approved,false,"Short excerpts are research, never publish by default");
}
assert.equal(h42PrincipalCount,H42_PRINCIPAL_VERSES);
assert.equal(correctionDelta.principalSelectionCount.principalVerseUnits,H42_PRINCIPAL_VERSES);
assert.ok(h42.units.find(x=>x.unitId==="H42-05").principalReadings.includes("Tobit 3:24–25"),
 "Raphael's initial intercession role must be represented");
assert.ok(h42.units.find(x=>x.unitId==="H42-05").principalReadings.includes("Tobit 12:12–15"),
 "The angelic identity revelation must not be cut off");
assert.ok(h42.units.find(x=>x.unitId==="H42-06").principalReadings.includes("Judith 7:6–7"),
 "The siege threat must not be cut from Judith's climax");
assert.ok(h42.units.find(x=>x.unitId==="H42-07").principalReadings.includes("Esther 14:16–17"),
 "The Purim outcome may not suppress the defensive violence");
const workbenchAudit=readFileSync(
 new URL("../previews/scripture-mining-workbench-20261017.html",import.meta.url),"utf8");
assert.match(workbenchAudit,/historiaReadingDepth/);
assert.match(workbenchAudit,/principalReadings/);
assert.match(workbenchAudit,/EXPANDED RESEARCH READING/);


// H76 edition-specific continuity: condensed Apocalypse while retaining H77/H78.
assert.equal(correctionDelta.principalSelectionCount.h76Witnesses,5);
assert.equal(correctionDelta.principalSelectionCount.h76PrincipalVerseUnits,59);
assert.equal(correctionDelta.principalSelectionCount.h76ExpandedVerseUnits,83);
assert.equal(correctionDelta.principalSelectionCount.h76PublicationApprovals,0);
assert.match(correctionDelta.revelationEditorialBoundary.h77,/19–20/);
assert.match(correctionDelta.revelationEditorialBoundary.h78,/21–22/);
const cpRevelation=sourceVerses("cpdv-2009","Revelation");
const drRevelation=sourceVerses("dr-challoner","Revelation");
let h76VerseCount=0, h76Expanded=0;
for(const [index,unit] of h76.units.entries()){
 assert.equal(unit.unitId,"H76-"+String(index+1).padStart(2,"0"));
 assert.equal(unit.principalEdition,"cpdv-2009");
 assert.ok(["SOURCE_SELECTED_CONTINUITY_PENDING","SOURCE_SEAM_INSPECTED_NOT_READALOUD"].includes(unit.principalStatus),"No sequence has yet passed complete oral continuity acceptance");
 assert.equal(unit.approved,false);
 assert.ok(unit.fullCompanionReadings.length>=1,"Each H76 unit has independently accessible full/hope texts");
 let previous=-1;
 for(const ref of unit.principalReadings){
  const passage=parseScriptureContext(ref)?.passage;
  assert.ok(passage&&passage.book==="Revelation","Bad Revelation excerpt "+ref);
  const pos=passage.chapter*1000+passage.verseStart;
  assert.ok(pos>previous,"Revelation vision spans must retain original source order");
  previous=passage.chapter*1000+passage.verseEnd;
  assert.ok(passage.chapter<19,"H77/H78 may not be absorbed by H76");
  for(let v=passage.verseStart;v<=passage.verseEnd;v++){
   const verse=passage.chapter+":"+v;
   h76VerseCount++;
   assert.ok(cpRevelation.has(verse)&&drRevelation.has(verse),
    "Missing original Catholic witness at Revelation "+verse);
  }
 }
 for(const ref of unit.candidateReadings){
  const passage=parseScriptureContext(ref)?.passage; assert.ok(passage&&passage.book==="Revelation");
  h76Expanded+=passage.verseEnd-passage.verseStart+1;
 }
 for(const comp of unit.fullCompanionReadings){
  const passage=parseScriptureContext(comp.reference)?.passage;
  assert.ok(passage&&passage.book==="Revelation"&&passage.chapter<19,
   "Companion Scripture must remain within H76 scenes, not H77/H78");
  assert.equal(comp.edition,"cpdv-2009");
  assert.equal(comp.canonicalStatus,"CATHOLIC_SCRIPTURE");
 }
}
assert.equal(h76VerseCount,59);
assert.equal(h76Expanded,83);
const rev12Short=h76.units.find(u=>u.unitId==="H76-03");
const rev13Short=h76.units.find(u=>u.unitId==="H76-04");
const babylonShort=h76.units.find(u=>u.unitId==="H76-05");
assert.ok(rev12Short.principalReadings.includes("Revelation 12:17–18"),
 "The dragon's seashore transition into the beasts must remain");
assert.ok(rev13Short.principalReadings.includes("Revelation 13:10–12")&&
          rev13Short.principalReadings.includes("Revelation 13:15–18"),
 "Both beasts, testimony and mark must be preserved");
assert.ok(babylonShort.principalReadings.includes("Revelation 17:12–14")&&
          babylonShort.principalReadings.includes("Revelation 18:24"),
 "The Lamb's victory and persecution of martyrs must remain");
assert.ok(h76.units[0].fullCompanionReadings.some(x=>x.reference==="Revelation 7:9–17"),
 "The vision of the redeemed cannot disappear from the H76 reading experience");
assert.ok(h76.units[4].fullCompanionReadings.some(x=>x.reference==="Revelation 14:1–5"),
 "Keep the Lamb and the redeemed as a hope counterpoint");


// All six additional chapters share the existing one-owner editorial delta.
assert.equal(correctionDelta.researchMetrics.highRiskChapters,8);
assert.equal(correctionDelta.researchMetrics.legacyUnits,12);
assert.equal(correctionDelta.researchMetrics.addedUnits,28);
assert.equal(correctionDelta.researchMetrics.totalUnits,40);
const additionalIds=["H21","H27","H45","H53","H54","H73"];
assert.equal(additionalIds.reduce((n,id)=>n+findChapter(id).units.length,0),28);
const intendedOriginals={
 H21:["Exodus 12:31–42","Exodus 13:17–22","Exodus 14:15–31","Exodus 16:2–4, 12–15","Exodus 17:1–7"],
 H27:["Judges 4:4–9, 14–24","Judges 6:11–24","Judges 7:2–8, 16–22","Judges 13:2–7, 24–25","Judges 16:23–30"],
 H45:["Matthew 1:1–17","Luke 3:23–38"],
 H53:["Matthew 5:1–12","Matthew 6:9–15","Matthew 7:24–29","Matthew 13:1–23"],
 H54:["Mark 1:21–28","Mark 2:1–12","Mark 4:35–41","John 6:1–15","John 9:1–12"],
 H73:["Acts 16:11–15","Acts 16:22–40","Acts 17:16–34","Acts 18:1–11","Acts 20:17–38","Acts 27:1–44","Acts 28:23–31"]
};
const sourceCache=new Map();
const getSet=(edition,book)=>{
 const key=edition+":"+book;
 if(!sourceCache.has(key))sourceCache.set(key,sourceVerses(edition,book));
 return sourceCache.get(key);
};
let checkedAdditional=0;
for(const id of additionalIds){
 const chapter=findChapter(id);
 assert.deepEqual(chapter.units.map(u=>u.originalReference),intendedOriginals[id],
  "Never overwrite a v18 original reference when making a correction: "+id);
 for(let i=0;i<chapter.units.length;i++){
  const u=chapter.units[i];
  assert.equal(u.unitId,id+"-"+String(i+1).padStart(2,"0"));
  assert.equal(u.principalEdition,"cpdv-2009");
  assert.equal(u.candidateEdition,"cpdv-2009");
  assert.equal(u.approved,false);
  assert.equal(u.textReviewed,false);
  assert.equal(u.rightsReviewed,false);
  assert.ok(["SOURCE_SELECTED_CONTINUITY_PENDING","SOURCE_SEAM_INSPECTED_NOT_READALOUD"].includes(u.principalStatus),"These units still require final oral continuity acceptance");
  let lastChapter=-1,lastVerse=-1;
  for(const ref of [...u.candidateReadings,...u.principalReadings,
    ...u.fullCompanionReadings.map(c=>c.reference)]){
   const p=parseScriptureContext(ref)?.passage;
   assert.ok(p,"All research extracts resolve into a single Scripture passage: "+ref);
   assert.ok(p.verseStart<=p.verseEnd,ref);
   const cp=getSet("cpdv-2009",p.book),dr=getSet("dr-challoner",p.book);
   for(let v=p.verseStart;v<=p.verseEnd;v++){
    assert.ok(cp.has(p.chapter+":"+v),"Absent CPDV "+ref+": "+v);
    assert.ok(dr.has(p.chapter+":"+v),"Absent Douay "+ref+": "+v);
   }
  }
  for(const ref of u.principalReadings){
   const p=parseScriptureContext(ref).passage;
   assert.ok(p.chapter>lastChapter||p.chapter===lastChapter&&p.verseStart>lastVerse,
    "Principal unit is strictly ordered with no overlapping verses: "+id+" "+ref);
   lastChapter=p.chapter;lastVerse=p.verseEnd;
   checkedAdditional+=p.verseEnd-p.verseStart+1;
  }
  assert.ok(u.fullCompanionReadings.every(c=>c.canonicalStatus==="CATHOLIC_SCRIPTURE"));
 }
}
assert.ok(checkedAdditional>100);
// The faithful-scripture exceptions are not interchangeable story cuts.
assert.ok(findChapter("H21").units[2].principalReadings.includes("Exodus 14:5–10"));
assert.ok(findChapter("H21").units[2].principalReadings.includes("Exodus 15:1–2"));
assert.ok(findChapter("H21").units[2].fullCompanionReadings.some(x=>x.reference==="Exodus 15:1–21"));
assert.ok(findChapter("H27").units[4].principalReadings.includes("Judges 16:15–22"),
 "Samson's betrayal must precede the final collapse");
assert.deepEqual(findChapter("H45").units.map(u=>u.principalReadings[0]),
 ["Matthew 1:1–17","Luke 3:23–38"]);
assert.match(findChapter("H45").excludedInference,/MARYS_BIOLOGICAL_GENEALOGY/);
assert.ok(findChapter("H53").units[3].principalReadings.includes("Matthew 13:18–23"),
 "Jesus' own explanation must accompany the parable of the sower");
assert.ok(findChapter("H54").units[4].principalReadings.includes("John 9:35–38"),
 "The man born blind must confess faith at the end of his episode");
assert.equal(findChapter("H54").units[3].relatedChapter,"H56",
 "The one multiplication miracle is cross-linked, not duplicated");
assert.ok(findChapter("H73").units[1].principalReadings.includes("Acts 16:16–21"),
 "The imprisonment's cause and charge must be visible");
assert.ok(findChapter("H73").units[5].principalReadings.includes("Acts 27:30–32"),
 "Crew escape is an antecedent to Paul's warning");
assert.equal(findChapter("H73").status,"SEVEN_REPRESENTATIVE_SCENES_NOT_COMPLETE_ACTS_ITINERARY");


// V7 evidence is associated by original overlapping Atlas events, never
// confused with the independently unapproved selected verse snippets.
assert.equal(correctionDelta.frequencyReconciliation.v7PublishedSelections,460);
assert.equal(correctionDelta.frequencyReconciliation.v7AtlasEvents,151);
assert.equal(correctionDelta.frequencyReconciliation.reconciledEditorialUnits,40);
assert.equal(correctionDelta.frequencyReconciliation.withOverlappingAtlasEvent,19);
assert.equal(correctionDelta.frequencyReconciliation.withoutOverlappingAtlasEvent,21);
assert.equal(correctionDelta.frequencyReconciliation.distinctAtlasEventsLinked,20);
assert.equal(correctionDelta.frequencyReconciliation.qualifiedSourceRowsLinked,53);
assert.equal(correctionDelta.frequencyReconciliation.heldNonQualifiedRowsLinked,3);
assert.equal(correctionDelta.frequencyReconciliation.unitsWithStrictSimpleMultiFamilyBoundaryAgreement,4);
assert.equal(correctionDelta.frequencyReconciliation.noPublisherPopularityClaim,true);
let linked=0,unlinked=0,strict=0;
for(const chapter of correctionDelta.chapters)for(const unit of chapter.units){
 const e=unit.v7FrequencyReconciliation;
 assert.ok(e,"Every original v18 unit must have independently sourced research disposition");
 assert.equal(e.provenance.sourceSchema,"AO_COMPARATIVE_PERICOPE_MASTER_MATRIX_V7");
 assert.match(e.provenance.sourceBlobSha,/^[a-f0-9]{40}$/);
 assert.equal(e.automaticApproval,false);
 assert.match(e.interpretation,/not count agreements with these proposed principal verses/i);
 if(e.matchedAtlasEvents.length){linked++}else{unlinked++;
  assert.equal(e.status,"NO_OVERLAPPING_ATLAS_EVENT_IN_V7_NOT_A_NEGATIVE_SEARCH_RESULT");
 }
 const families=new Set(e.qualifiedSelectionRecords.map(z=>z.sourceFamily));
 assert.equal(e.linkedIndependentPublisherFamilyCount,families.size,
  "Publisher variants must never count as distinct independent sources");
 assert.equal(e.linkedIndependentPublisherFamilies.length,families.size);
 for(const row of e.qualifiedSelectionRecords){
  assert.ok(row.sourceURL?.startsWith("https://"));
  assert.ok(row.sourceId&&row.reference&&row.sourceFamily);
  assert.notEqual(row.sourceId,"MISSAL62");
  assert.notEqual(row.sourceId,"CHRON152");
 }
 for(const group of e.exactSimpleSelectionBoundaryAgreements){
  strict++;
  assert.ok(group.independentFamilyCount>=2);
  assert.equal(group.independentFamilies.length,group.independentFamilyCount);
  assert.ok(group.reference.includes(":"));
 }
}
assert.equal(linked,19);
assert.equal(unlinked,21);
assert.equal(strict,4);
assert.ok(findChapter("H27").units.every(u=>u.v7FrequencyReconciliation.status.startsWith("NO_OVERLAPPING")),
 "Do not invent V7 support for the judges who have no existing Atlas event");
assert.ok(findChapter("H45").units.every(u=>u.v7FrequencyReconciliation.linkedIndependentPublisherFamilyCount===0),
 "No V7 publisher count proves that two genealogical lists are identical");
assert.ok(findChapter("H76").units.every(u=>u.v7FrequencyReconciliation.qualifiedSelectionRecords.length===0),
 "There is no matched V7 publisher comparison for the H76 beast visions");
assert.equal(findChapter("H54").units[1].v7FrequencyReconciliation.exactSimpleSelectionBoundaryAgreements[0].independentFamilyCount,3,
 "Three distinct families choose Mark 2:1–12, without implying doctrinal approval");
assert.equal(findChapter("H54").units[2].v7FrequencyReconciliation.exactSimpleSelectionBoundaryAgreements[0].fullyMatchesPrincipal,false,
 "Conventional Mark 4:35–41 must not masquerade as verbatim installed 4:35–40");
assert.ok(findChapter("H42").units[6].v7FrequencyReconciliation.qualifiedSelectionRecords.every(r=>
 r.relation==="ESTHER_EDITION_UNSPECIFIED_IN_PUBLISHER_RECORD"),
 "Do not compare traditional Esther references against rearranged CPDV as if they were identical");
assert.ok(findChapter("H42").units[6].principalReadings.includes("Esther 5:5–6"));
assert.ok(findChapter("H42").units[6].principalReadings.includes("Esther 11:2–10"));
assert.ok(findChapter("H42").units[6].principalReadings.includes("Esther 12:3–12"));
assert.ok(findChapter("H54").units[4].principalReadings.includes("John 9:5–7"));
assert.ok(findChapter("H54").units[4].principalReadings.includes("John 9:13–17"));
assert.ok(findChapter("H73").units[1].principalReadings.includes("Acts 16:35–40"));
assert.match(workbenchAudit,/historiaResearch/);
assert.match(workbenchAudit,/Publisher research/);


// Narrative-necessity audit is an editorial filter over exactly the 217 original
// v18 verse-segment slots, not a second Bible app, not a rewrite of canon.
const necessity=JSON.parse(readFileSync(
 new URL("../data/research/historia-salutis-v18-necessity-audit.v1.json",import.meta.url),"utf8"));
assert.equal(necessity.schema,"ao.historia.v18.narrative-necessity-disposition.v1");
assert.equal(necessity.status,"PROPOSED_EDITORIAL_AUDIT_NOT_PUBLISHED");
assert.equal(necessity.upstream.originalWorkbookEdited,false);
assert.equal(necessity.upstream.originalSegmentCount,217);
assert.equal(necessity.upstream.originalChapterCount,78);
assert.equal(necessity.upstream.existingResearchUnitsReused,40);
assert.equal(necessity.units.length,217);
assert.equal(necessity.chapterSummaries.length,78);
assert.deepEqual(necessity.counts.dispositionUnits,{A:93,B:67,C:54,D:3});
assert.deepEqual(necessity.counts.chapterTreatments,{main:61,merge:15,storyOnly:2});
const auditCount={A:0,B:0,C:0,D:0};
const foundChapters=new Set(),foundIds=new Set(),orders=new Map();
let reused=0;
for(const u of necessity.units){
 assert.ok(!foundIds.has(u.unitId),"Every v18 segment has one and only one proposed classification");
 foundIds.add(u.unitId);
 foundChapters.add(u.historiaChapterId);
 auditCount[u.disposition]++;
 assert.equal(u.presentationApproved,false);
 assert.equal(u.sourceTextApproved,false);
 assert.equal(u.originalV18ScopePreserved,true);
 assert.equal(u.editorialApproval,"PROPOSED_REVIEW_REQUIRED");
 assert.equal(u.canonicalDestinationVerified,false,"Do not invent new person/event/story locations");
 assert.ok(u.sourceReferenceOriginal.length>2);
 assert.ok(u.sceneFocus.length>5);
 assert.ok(u.narrativeRationale.length>15);
 const expected=(orders.get(u.historiaChapterId)||0)+1;
 assert.equal(u.sourceOrder,expected,"Do not reorder the original v18 source segment series");
 orders.set(u.historiaChapterId,expected);
 if(u.existingAbridgmentResearch){
  reused++;
  assert.equal(u.existingAbridgmentResearch.originalRefConcordant,true);
  assert.equal(u.existingAbridgmentResearch.unitId,u.unitId);
  const older=findChapter(u.historiaChapterId)?.units.find(x=>x.unitId===u.unitId);
  assert.ok(older&&older.originalReference===u.sourceReferenceOriginal,
   "New triage must refer to the old abridgment registry rather than fork it");
 }
 if(u.disposition==="C"){
  assert.match(u.mainNarrativeAction,/LINK_FROM_EXISTING_CHARACTER_EVENT_OR_SCRIPTURE/);
  assert.match(u.destinationPolicy,/Never create a compulsory secondary series/);
 }
 if(u.disposition==="D")assert.equal(u.mainNarrativeAction,
  "CANONICAL_SCRIPTURE_READER_ONLY_NO_FEATURED_STORY");
}
assert.equal(foundChapters.size,78);
assert.equal(foundIds.size,217);
assert.equal(reused,40);
assert.deepEqual(auditCount,necessity.counts.dispositionUnits);
const disp=id=>necessity.units.find(u=>u.unitId===id);
assert.equal(disp("H73-02").disposition,"C","Philippi is an optional Paul story");
assert.equal(disp("H73-07").disposition,"A","The universal mission culminates in Rome");
assert.equal(disp("H27-01").disposition,"C");
assert.equal(disp("H27-05").disposition,"C");
assert.equal(disp("H54-04").disposition,"D");
assert.equal(disp("H54-04").suggestedExistingIntegrationTarget,"H56-01");
assert.equal(disp("H70-02").disposition,"D");
assert.equal(disp("H70-02").suggestedExistingIntegrationTarget,"H70-01");
assert.equal(disp("H45-01").disposition,"B");
assert.equal(disp("H45-02").disposition,"B");
assert.match(disp("H45-01").specialFunction,/SEPARATE_GOSPEL_GENEALOGY/);
assert.match(disp("H04-01").narrativeRationale,/protoevangelium/);
assert.ok(necessity.nonNegotiable.includes("No second extended Bible experience"));
assert.ok(necessity.nonNegotiable.some(x=>x.includes("original 151 Atlas event")));
assert.equal(necessity.reviewGates.canPublish,false);


assert.equal(necessity.routeReconciliation.status,
 "CONSERVATIVE_EXISTING_ROUTE_IDENTITIES_CHECKED_NOT_PROMOTED");
assert.equal(necessity.routeReconciliation.counts.C,54);
assert.equal(necessity.routeReconciliation.counts.exactAtlasReference,20);
assert.equal(necessity.routeReconciliation.counts.noExactAtlasReference,34);
assert.equal(necessity.routeReconciliation.counts.existingStoryResearchGroupCandidate,10);
assert.equal(necessity.routeReconciliation.counts.editionHeldExactReference,1);
assert.equal(necessity.routeReconciliation.counts.readyToAutoPublish,0);
assert.equal(necessity.routeReconciliation.counts.verifiedUserFacingCharacterPages,0);
let exactEvents=0,scriptureOnly=0,storyCandidates=0;
for(const unit of necessity.units.filter(x=>x.disposition==="C")){
 const route=unit.existingRouteAudit;
 assert.ok(route,"Never assign a fictional external story destination");
 assert.equal(route.willCreateAdditionalExperience,false);
 assert.equal(route.bibleReaderPassageAvailableAsFallback,true);
 assert.equal(route.standaloneStoryPageVerified,false);
 if(route.canonicalAtlasIdExists){
  exactEvents++;
  assert.ok(route.candidateCanonicalAtlasEvent.eventKey.startsWith("biblical:"));
  assert.ok(route.candidateCanonicalAtlasEvent.sourceBlobSha.length===40);
 }else{
  scriptureOnly++;
  assert.equal(route.candidateCanonicalAtlasEvent,null);
  assert.equal(route.linkActivationStatus,"NO_EXACT_EVENT_USE_EXISTING_SCRIPTURE_LINK_ONLY");
 }
 storyCandidates+=route.existingDonorStoryResearchCandidates.length;
 for(const z of route.existingDonorStoryResearchCandidates)
  assert.equal(z.status,"RESEARCH_ONLY_NOT_A_VERIFIED_USER_FACING_PAGE");
}
assert.equal(exactEvents,20);
assert.equal(scriptureOnly,34);
assert.equal(storyCandidates,10);
assert.equal(disp("H73-02").existingRouteAudit.linkActivationStatus,
 "NO_EXACT_EVENT_USE_EXISTING_SCRIPTURE_LINK_ONLY");
assert.equal(disp("H27-01").existingRouteAudit.canonicalAtlasIdExists,false);
assert.equal(disp("H54-05").existingRouteAudit.candidateCanonicalAtlasEvent.eventKey,
 "biblical:event:siloam-miracle-26");
assert.equal(disp("H42-07").existingRouteAudit.linkActivationStatus,
 "HOLD_EDITION_CROSSWALK");


// The 37 proposed movements are a narrative analysis layer. Neither v18's
// 78 chapter IDs nor its 217 verse-segment source owners are replaced.
const spine=JSON.parse(readFileSync(
 new URL("../data/research/historia-salutis-v18-main-spine-consolidation.v1.json",import.meta.url),"utf8"));
assert.equal(spine.schema,"ao.historia.v18.provisional-main-spine-consolidation.v1");
assert.equal(spine.status,"EDITORIAL_PROPOSAL_ONLY_NOT_PUBLICATION");
assert.equal(spine.movements.length,37);
assert.equal(spine.source.original78Chapters,true);
assert.equal(spine.source.original217Segments,true);
assert.equal(spine.stats.essentialUnits,93);
assert.equal(spine.stats.shortContextCandidateUnits,58);
assert.equal(spine.stats.otherContextNotSelected,9);
assert.equal(spine.stats.independentStoriesExcludedFromMain,54);
assert.equal(spine.stats.noExtraPresentations,3);
assert.equal(spine.continuityChecks.length,12);
assert.equal(spine.stats.highPrioritySourceBridges,2);
let previousNumber=0;
const seenChapterIds=new Set(),seenUnitIds=new Set(),seenA=new Set(),seenB=new Set();
let totalC=0,totalD=0;
for(const movement of spine.movements){
 assert.equal(movement.proposedEditorialOrder,++previousNumber);
 assert.equal(movement.id,"HS-M"+String(previousNumber).padStart(2,"0"));
 assert.equal(movement.isFinalChapter,false);
 assert.equal(movement.appChanges,false);
 assert.equal(movement.editorialRisk,"CONTINUITY_AND_CATHOLIC_EDITORIAL_REVIEW_REQUIRED");
 assert.ok(movement.indispensable.sourceUnitIds.length>=1);
 for(const chapterId of movement.originalChapterSpan.chapterIds){
  assert.ok(!seenChapterIds.has(chapterId));
  seenChapterIds.add(chapterId);
 }
 assert.equal(movement.originalChapterSpan.first,movement.originalChapterSpan.chapterIds[0]);
 assert.equal(movement.originalChapterSpan.last,movement.originalChapterSpan.chapterIds.at(-1));
 const unitIds=[
  ...movement.indispensable.sourceUnitIds,
  ...movement.optionalBriefBridges.map(x=>x.unitId),
  ...movement.secondaryContextHeld,
  ...movement.independentStoriesNotMandatory,
  ...movement.noExtraPresentation
 ];
 for(const uid of unitIds){
  const original=disp(uid);
  assert.ok(original,"A spine unit may only refer to an original v18 segment");
  assert.ok(movement.originalChapterSpan.chapterIds.includes(original.historiaChapterId));
  assert.ok(!seenUnitIds.has(uid),"All 217 original segments have exactly one disposition");
  seenUnitIds.add(uid);
 }
 for(const x of movement.indispensable.sourceReferences){
  const original=disp(x.unitId);
  assert.equal(original.disposition,"A");
  assert.equal(x.reference,original.sourceReferenceOriginal);
  assert.equal(x.approved,false);
  seenA.add(x.unitId);
 }
 for(const x of movement.optionalBriefBridges){
  const original=disp(x.unitId);
  assert.equal(original.disposition,"B");
  assert.equal(x.sourceReference,original.sourceReferenceOriginal);
  assert.equal(x.mode,"SHORT_CONTEXT_NOT_FULL_REQUIRED_READING");
  seenB.add(x.unitId);
 }
 for(const uid of movement.secondaryContextHeld)assert.equal(disp(uid).disposition,"B");
 for(const uid of movement.independentStoriesNotMandatory){
  assert.equal(disp(uid).disposition,"C");
  totalC++;
 }
 for(const uid of movement.noExtraPresentation){
  assert.equal(disp(uid).disposition,"D");
  totalD++;
 }
}
assert.equal(seenChapterIds.size,78);
assert.equal(seenUnitIds.size,217);
assert.equal(seenA.size,93);
assert.equal(seenB.size,58);
assert.equal(totalC,54);
assert.equal(totalD,3);
const main34=spine.movements.find(x=>x.id==="HS-M34");
assert.deepEqual(main34.indispensable.sourceUnitIds,["H73-07"]);
assert.ok(main34.independentStoriesNotMandatory.includes("H73-02"));
assert.ok(main34.independentStoriesNotMandatory.includes("H73-06"));
const main21=spine.movements.find(x=>x.id==="HS-M21");
assert.ok(main21.optionalBriefBridges.some(x=>x.unitId==="H54-02"));
assert.ok(main21.noExtraPresentation.includes("H54-04"));
const genealogyMovement=spine.movements.find(x=>x.id==="HS-M18");
assert.ok(genealogyMovement.optionalBriefBridges.some(x=>x.unitId==="H45-01"));
assert.ok(genealogyMovement.optionalBriefBridges.some(x=>x.unitId==="H45-02"));
const bridgeIds=spine.sourceBridgeCandidates.map(x=>x.id);
assert.deepEqual(bridgeIds,["HS-BRIDGE-PARACLETE","HS-BRIDGE-ROME-ARRIVAL"]);
for(const source of spine.sourceBridgeCandidates){
 assert.equal(source.sourcePresence,"VERIFIED_BOTH_INSTALLED_CATHOLIC_ENGLISH_WITNESSES");
 assert.equal(source.approval,"NOT_EDITORIALLY_APPROVED");
 assert.equal(source.needsExactWordingCollation,true);
 const parsed=parseScriptureContext(source.reference)?.passage;
 assert.ok(parsed);
 for(let v=parsed.verseStart;v<=parsed.verseEnd;v++){
  assert.ok(getSet("cpdv-2009",parsed.book).has(parsed.chapter+":"+v));
  assert.ok(getSet("dr-challoner",parsed.book).has(parsed.chapter+":"+v));
 }
}
assert.equal(spine.editorialGates.readAloudVerified,false);
assert.equal(spine.editorialGates.catholicEditorialReview,false);
assert.equal(spine.editorialGates.userAccepted,false);
assert.equal(spine.editorialGates.publicReaderChanged,false);


// The next economy pass must never silently restore filler by copying every B passage.
const desk=JSON.parse(readFileSync(new URL(
 "../data/research/historia-salutis-v18-continuity-desk-pass.v1.json",import.meta.url),"utf8"));
assert.equal(desk.schema,"ao.historia.v18.main-spine-continuity-desk-pass.v1");
assert.equal(desk.status,"EDITORIAL_DESK_TRIAGE_PENDING_FULL_READALOUD");
assert.equal(desk.counts.originalV18Units,217);
assert.equal(desk.counts.originalChapters,78);
assert.equal(desk.counts.movements,37);
assert.equal(desk.counts.essentialUnits,93);
assert.equal(desk.counts.originalBContextUnits,67);
assert.deepEqual(desk.counts.bContextDisposition,{
 MANDATORY_BRIEF_CONTEXT:29,GENEALOGY_NAVIGATION_NOT_PROSE:2,
 TYPOLOGICAL_REFERENCE_ONLY:5,NO_MAIN_CONTEXT_NEEDED:31});
assert.equal(desk.counts.independentStoryUnitsStillC,54);
assert.equal(desk.counts.noFeaturedReadingUnitsStillD,3);
assert.equal(desk.counts.bridgeSourceCandidates,11);
assert.equal(desk.counts.bridgesOutsideV18,7);
assert.equal(desk.counts.fullReadAloudCompleted,false);
assert.equal(desk.publication.editorialApproved,false);
assert.equal(desk.publication.sourceEditionCollationApproved,false);
assert.equal(desk.publication.alteredPublicApp,false);
const seenBDesk=new Set();
let keepB=0;
for(const decision of desk.contextDecisions){
 assert.ok(!seenBDesk.has(decision.unitId),"Original B identity must appear only once");
 seenBDesk.add(decision.unitId);
 assert.equal(disp(decision.unitId).disposition,"B");
 assert.equal(decision.originalReference,disp(decision.unitId).sourceReferenceOriginal);
 assert.equal(decision.sourceOwner,"ORIGINAL_V18_SEGMENT");
 assert.equal(decision.requiredAsWholePassage,false,"B context must not be wholesale reinstated");
 assert.equal(decision.nativeTextPublicationApproved,false);
 assert.equal(decision.reviewStatus,"DESK_TRIAGED_ORAL_READING_PENDING");
 assert.ok(spine.movements.some(m=>m.id===decision.movementId));
 if(decision.readthroughDecision==="MANDATORY_BRIEF_CONTEXT"){
  keepB++;
  assert.ok(decision.contextPurpose.length>25);
 }
}
assert.equal(seenBDesk.size,67);
assert.equal(keepB,29);
assert.equal(desk.contextDecisions.find(d=>d.unitId==="H07-01").readthroughDecision,"NO_MAIN_CONTEXT_NEEDED",
 "Ark construction is already supplied by the original Genesis 6 bridge; never repeat it");
assert.equal(desk.contextDecisions.find(d=>d.unitId==="H06-01").readthroughDecision,"NO_MAIN_CONTEXT_NEEDED",
 "Do not double-count moral corruption before the Ark");
assert.equal(desk.contextDecisions.find(d=>d.unitId==="H73-03").readthroughDecision,"NO_MAIN_CONTEXT_NEEDED",
 "Athens is not a required stop en route to Rome");
assert.equal(desk.contextDecisions.find(d=>d.unitId==="H45-01").readthroughDecision,"GENEALOGY_NAVIGATION_NOT_PROSE");
assert.equal(desk.contextDecisions.find(d=>d.unitId==="H45-02").readthroughDecision,"GENEALOGY_NAVIGATION_NOT_PROSE");
let outsideV18=0;
const seenBridge=new Set();
for(const b of desk.sourceBridgeCandidates){
 assert.ok(!seenBridge.has(b.id));seenBridge.add(b.id);
 assert.ok(desk.movementDecisions.some(m=>m.movementId===b.movementId&&m.sourceBridgeCandidates.includes(b.id)));
 assert.equal(b.approvedToInsertText,false);
 assert.equal(b.originalWorkbookModified,false);
 assert.equal(b.installedSourceVersePresenceVerified,true);
 assert.equal(b.identicalCoordsInCPDVAndDouay,true);
 assert.equal(b.needsLiteraryConcordanceReview,true);
 const p=parseScriptureContext(b.reference)?.passage;
 assert.ok(p,"All proposed bridge references must be exact Scripture passages");
 assert.equal(p.verseEnd-p.verseStart+1,b.cpVerses);
 assert.equal(p.verseEnd-p.verseStart+1,b.douayVerses);
 for(let vv=p.verseStart;vv<=p.verseEnd;vv++){
  assert.ok(getSet("cpdv-2009",p.book).has(p.chapter+":"+vv),
    "CPDV missing continuity source "+b.reference);
  assert.ok(getSet("dr-challoner",p.book).has(p.chapter+":"+vv),
    "Douay missing continuity source "+b.reference);
 }
 if(b.selectionOrigin==="NEW_VERSE_CANDIDATE")outsideV18++;
 if(b.originalV18SourceIdIfAny){
  assert.ok(disp(b.originalV18SourceIdIfAny),
   "Pre-existing B/C source must keep its original ownership");
 }
}
assert.equal(outsideV18,7);
assert.equal(seenBridge.size,11);
assert.equal(desk.movementDecisions.length,37);
assert.ok(desk.movementDecisions.every(x=>!x.mainNarrativeReadyForFullLiteraryReading));
assert.ok(desk.genreAndOwnershipGuards.some(g=>g.issue==="Narrative without filler"));
assert.deepEqual(desk.contextBatch10_19.retiredDuplicateNotes,["H34-02","H48-02"]);
assert.equal(desk.contextDecisions.find(x=>x.unitId==="H34-02").readthroughDecision,"NO_MAIN_CONTEXT_NEEDED");
assert.equal(desk.contextDecisions.find(x=>x.unitId==="H48-02").readthroughDecision,"NO_MAIN_CONTEXT_NEEDED");
assert.ok(desk.contextDecisions.filter(x=>x.editorialBatch==="MOVEMENTS_10_19"&&x.proposedReadingTransition)
 .every(x=>/\((?:Exodus|Numbers|Deuteronomy|Ruth|1 Samuel|2 Samuel|1 Kings|Isaiah|Nehemiah|1 Maccabees|2 Maccabees|Luke|Matthew) /.test(x.contextPurpose)),
 "Context prose must name genuine biblical sources, not issue reader-facing editor instructions");


await import("./historia-essential-economy.mjs");
await import("./historia-continuous-proof.mjs");
await import("./historia-p3-late-draft-seams.mjs");
await import("./historia-p3-three-witness-reading-preflight.mjs");
await import("./historia-p3-three-edition-corpus.mjs");
await import("./historia-p3-bridge-source-order.mjs");
console.log("Shared source mining, Esther spans and editorial review contracts passed");
