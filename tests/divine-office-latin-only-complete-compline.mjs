import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";
import {createLatinComplinePinnedReader,assembleLatinDatedComplinePilot}
 from "../src/office/saturday-compline-2026-pilot.js";
import {assemblePrivateOfficeReview,projectPrivateOfficeReview}
 from "../src/office/private-office-review.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER,projectComplineRecitation}
 from "../src/office/compline-recitation-projection.js";
import {projectSaturdayComplinePsalmFrame}
 from "../src/office/compline-psalm-display-projection.js";

const load=name=>JSON.parse(readFileSync(
 new URL("../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const saturday=load("advent-i-saturday-compline");
const tuesday=load("advent-i-feria-iii-compline");
const week=load("advent-i-week-compline");
const base="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/";
function source({truncate=false}={}){
 const calls=[];
 const fetchSource=async(url)=>{
  calls.push(url);
  assert.ok(url.startsWith(base+"Latin/"),
   "Latin-only Compline requested a translation: "+url);
  const raw=decodeURIComponent(url.slice((base+"Latin/").length));
  assert.match(raw,/\.txt$/u);
  const id=raw.slice(0,-4);
  let body;
  if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const n=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   body=[87,102,233].includes(n)?saturday.psalms[n]:
    [11,12,15].includes(n)?tuesday.psalms[n]?.text:
    week.psalms[n]?.text;
   if(truncate&&n===87)body=body.slice(0,15);
  }else{
   const items=saturday.sections[id];
   assert.ok(items,"Original Latin source file not whitelisted: "+id);
   body=Object.entries(items)
    .map(([heading,lines])=>"["+heading+"]\n"+lines.join("\n"))
    .join("\n\n")+"\n";
  }
  assert.equal(typeof body,"string",id);
  return {ok:true,status:200,url,text:async()=>body};
 };
 return {fetchSource,calls};
}
const dates=["2026-11-28","2026-11-29","2026-11-30","2026-12-01",
 "2026-12-02","2026-12-03","2026-12-04","2026-12-05"];
test("all eight appointed dates assemble 42 complete Latin blocks without reading any translations",async()=>{
 for(const date of dates){
  const transport=source();
  const reader=createLatinComplinePinnedReader({date,fetchSource:transport.fetchSource});
  const result=await assembleLatinDatedComplinePilot({reader,date});
  assert.match(result.status,/SOURCE_FIRST_.*COMPLINE_RESEARCH_NOT_CERTIFIED/u,date+": "+result.reason);
  assert.equal(result.sourceRevision,PIN);
  assert.deepEqual(result.availableLanguages,["la"]);
  assert.equal(result.blockCount,42);
  assert.equal(result.blocks.at(-1).kind,"FINAL_ASSISTANCE");
  assert.match(result.blocks.at(-1).texts.la[0],/^Divínum auxílium/u);
  assert.equal(result.blocks.at(-1).texts.la[1],"R. Amen.");
  assert.equal(result.blocks.some(x=>x.kind==="FINAL_RESPONSE"),false);
  assert.match(result.blocks.find(x=>x.kind==="BLESSING"&&x.sourceId.includes("Completorium2")).texts.la[0],/Benedícat et custódiat/u);
  assert.ok(result.focusFrameCount>42);
  assert.ok(result.blocks.every(b=>
   Object.keys(b.texts).length===1&&Array.isArray(b.texts.la)&&b.texts.la.length>0));
  assert.ok(result.frames.every(f=>
   Object.keys(f.texts).length===1&&Array.isArray(f.texts.la)&&f.texts.la.length>0));
  assert.equal(result.sourceTextAltered,false);
  assert.equal(result.officeCompletenessCertified,false);
  assert.equal(result.rightsApproved,false);
  assert.equal(result.published,false);
  assert.ok(transport.calls.length>0);
  assert.ok(transport.calls.every(u=>u.includes("/Latin/")));
  assert.equal(reader.cachedDistinctFiles(),reader.maxDistinctFiles);
  // Re-using the exact source pilot, independently project its PRINTED 1961
  // ordinary, not the raw 42-event research extraction.
  const review=projectPrivateOfficeReview({
   hour:"COMPLINE",date,pilot:result,languageMode:"latin"
  });
  assert.equal(review.status,"PRIVATE_SOURCE_TEXT_REVIEW",date+": "+review.reason);
  for(const context of [COMPLINE_CONTEXT.FINAL_PRAYER,COMPLINE_CONTEXT.OTHER_TIME]){
   const reading=projectComplineRecitation(review,{context});
   assert.equal(reading.status,"PRIVATE_SOURCE_TEXT_REVIEW",
    date+" "+context+": "+reading.reason);
   assert.equal(reading.sourceEventCount,42);
   assert.equal(reading.readingEventCount,40);
   assert.equal(reading.readingEvents.length,40);
   assert.equal(reading.blessingAmensRestoredFromPinnedSource,2);
   assert.equal(reading.presidingMinister,COMPLINE_MINISTER.NON_PRIEST);
   assert.equal(reading.ministerDialoguesResolved,2);
   const visitaConclusion=reading.frames.filter(x=>x.shortConclusionPrinted1961);
   assert.equal(visitaConclusion.length,1,"printed §65 requires one short Visita ending");
   assert.deepEqual(visitaConclusion[0].texts.la,["Per Dóminum.","R. Amen."]);
   assert.match(visitaConclusion[0].sourceTexts.la[0],/^r\. Per Dóminum nostrum Jesum Christum/u);
   assert.equal(reading.visitaShortConclusionPrinted1961,true);
   const soloDialogues=reading.frames.filter(f=>f.kind==="DIALOGUE");
   assert.equal(soloDialogues.length,2);
   assert.ok(soloDialogues.every(f=>f.texts.la[0]==="V. Dómine, exáudi oratiónem meam."));
   assert.ok(soloDialogues.every(f=>f.sourceTexts.la[0]==="V. Dóminus vobíscum."));
   const priest=projectComplineRecitation(review,{
    context,minister:COMPLINE_MINISTER.PRIEST
   });
   assert.equal(priest.status,"PRIVATE_SOURCE_TEXT_REVIEW",date+" "+context+": "+priest.reason);
   assert.equal(priest.readingEventCount,40);
   assert.equal(priest.sourceEventCount,42);
   assert.equal(priest.ministerDialoguesResolved,2);
   const priestDialogues=priest.frames.filter(f=>f.kind==="DIALOGUE");
   assert.equal(priestDialogues.length,2);
   assert.ok(priestDialogues.every(f=>f.texts.la[0]==="V. Dóminus vobíscum."));
   assert.ok(priestDialogues.every(f=>f.texts.la[1]==="R. Et cum spíritu tuo."));
   assert.ok(priestDialogues.every(f=>f.sourceTexts.la.length===4));
   assert.equal(priest.published,false);
   const confession=reading.frames.find(frame=>frame.kind==="CONFITEOR");
   assert.ok(confession,"printed 1961 single recitation Confiteor");
   assert.equal(confession.gestureRubrics?.la,"Percutit sibi pectus");
    assert.ok(confession.sourceTexts.la[0].includes("/:(percutit sibi pectus):/"),"original source gesture rubric retained");
   assert.ok(!confession.texts.la[0].includes("/:"),"editorial gesture syntax not recited");
   assert.ok(confession.texts.la[0].startsWith("Confíteor Deo"));
   const hymn=reading.frames.filter(frame=>frame.kind==="HYMN");
   assert.equal(hymn.length,3);
   assert.ok(hymn[0].texts.la[0].startsWith("Te lucis ante términum"));
   assert.ok(hymn[2].texts.la[0].startsWith("Præsta, Pater piíssime"));
   assert.ok(hymn[0].sourceTexts.la[0].startsWith("v. Te lucis"));
   assert.ok(hymn[2].sourceTexts.la[0].startsWith("* Præsta"));
   assert.ok(hymn.every(frame=>frame.texts.la.every(line=>!line.startsWith("* "))));
   const saturday=date==="2026-11-28"||date==="2026-12-05";
   assert.equal(reading.printedPsalmDisplayFrames,saturday?41:0);
   if(saturday){
    const psalmFrames=reading.frames.filter(x=>x.sourceNumberingNormalized);
    assert.equal(psalmFrames.length,41);
    const p87=psalmFrames.filter(x=>x.sourceId.includes("Psalm87#"));
    const p102=psalmFrames.filter(x=>x.sourceId.includes("Psalm102#"));
    assert.equal(p87.length,19);
    assert.equal(p102.length,22);
    assert.deepEqual(p87.map(x=>x.printedVerseLabel),[
     "87:2","87:3","87:4","87:5–6","87:6","87:7","87:8","87:9",
     "87:9–10","87:10","87:11","87:12","87:13","87:14",
     "87:15","87:16","87:17","87:18","87:19"
    ]);
    assert.deepEqual(p102.map(x=>x.printedVerseLabel),[
     ...Array.from({length:12},(_,i)=>"102:"+(i+1)),
     "102:13–14","102:14–15","102:16","102:17",
     "102:17–18","102:18","102:19","102:20","102:21","102:22"
    ]);
    assert.equal(p87[0].sourceVerseLabel,"87:2");
    assert.match(p87[0].sourceTexts.la[0],/^87:2 Dómine/u);
    assert.match(p87[0].texts.la[0],/^Dómine/u);
    assert.equal(p102[12].sourceVerseLabel,"102:13");
    assert.match(p102[12].texts.la[0],/quóniam ipse cognóvit figméntum nostrum/u);
    assert.equal(p102[13].printedVerseLabel,"102:14–15");
    assert.match(p102[13].texts.la[0],/homo, sicut fænum/u);
    assert.ok(psalmFrames.every(x=>
     x.texts.la[0]===x.sourceTexts.la[0].replace(/^\d+:\d+ /u,"")));
   }
   assert.equal(reading.postCanticleKyrieOmitted,true);
   assert.equal(reading.postCanticlePaterOmitted,true);
   assert.equal(reading.readingPublished,false);
   assert.equal(reading.liturgicallyCertified,false);
   assert.equal(reading.published,false);
   assert.ok(reading.frames.every(f=>
    f.sourceId!=="Psalterium/Common/Prayers#Kyrie"&&
    f.sourceId!=="Psalterium/Common/Prayers#Pater noster Et"));
   assert.ok(reading.frames.some(f=>f.kind==="FINAL_ASSISTANCE"));
  }
  await assert.rejects(reader.section("Psalterium/Common/Prayers","Pater noster","fr"),/COMPLINE_LANGUAGE_NOT_SUPPORTED/);
 }
});
test("native review projects Latin source text without any English/French witness",async()=>{
 const transport=source();
 const reading=await assemblePrivateOfficeReview({
  hour:"COMPLINE",date:"2026-11-28",
  fetchSource:transport.fetchSource,languageMode:"latin"
 });
 assert.equal(reading.status,"PRIVATE_SOURCE_TEXT_REVIEW",reading.reason);
 assert.deepEqual(reading.availableLanguages,["la"]);
 assert.equal(reading.eventCount,42);
 assert.ok(reading.frameCount>42);
 assert.equal(reading.readingPublished,false);
 assert.equal(reading.publishable,false);
 assert.equal(reading.published,false);
 assert.ok(transport.calls.every(x=>x.includes("/Latin/")));
});
test("printed Saturday psalm labelling refuses source drift and preserves originals",()=>{
 const original=Object.freeze({kind:"PSALM",sourceId:"Psalterium/Psalmorum/Psalm87#2-19",
  subIndex:0,subTotal:19,focusType:"PSALM_VERSE",
  texts:Object.freeze({la:Object.freeze(["87:2 Dómine, Deus salútis meæ"])})});
 const projected=projectSaturdayComplinePsalmFrame(original);
 assert.equal(projected.label,"87:2");
 assert.equal(projected.texts.la[0],"Dómine, Deus salútis meæ");
 assert.equal(original.texts.la[0],"87:2 Dómine, Deus salútis meæ");
 assert.equal(projectSaturdayComplinePsalmFrame({...original,
  texts:{la:["87:3 Dómine, Deus salútis meæ"]}}),null);
 assert.equal(projectSaturdayComplinePsalmFrame({...original,subTotal:18}),null);
});
test("Latin missing source fails closed and cannot display partial Hour",async()=>{
 const r=await assemblePrivateOfficeReview({
  hour:"COMPLINE",date:"2026-11-28",
  fetchSource:source({truncate:true}).fetchSource,
  languageMode:"latin"
 });
 assert.equal(r.status,"WITHHELD");
 assert.equal(r.frames.length,0);
 assert.equal(r.published,false);
});
test("language scopes and unreviewed dates never silently default to other witnesses",async()=>{
 const transport=source();
 const bad=await assemblePrivateOfficeReview({
  hour:"COMPLINE",date:"2026-11-28",
  fetchSource:transport.fetchSource,languageMode:"latin-and-french"
 });
 assert.equal(bad.status,"WITHHELD");
 assert.equal(transport.calls.length,0);
 for(const d of ["2026-11-27","2026-12-06"]){
  const x=await assemblePrivateOfficeReview({
   hour:"COMPLINE",date:d,fetchSource:transport.fetchSource,languageMode:"latin"
  });
  assert.equal(x.status,"WITHHELD");
 }
});

test("1961 §147 and Office §56: last-prayer Compline substitutes examen for ONLY the opening Pater",async()=>{
 const transport=source();
 const raw=await assemblePrivateOfficeReview({
  hour:"COMPLINE",date:"2026-11-28",
  fetchSource:transport.fetchSource,languageMode:"latin"
 });
 assert.equal(raw.status,"PRIVATE_SOURCE_TEXT_REVIEW",raw.reason);
 const final=projectComplineRecitation(raw,{context:COMPLINE_CONTEXT.FINAL_PRAYER});
 assert.equal(final.status,"PRIVATE_SOURCE_TEXT_REVIEW",final.reason);
 assert.equal(final.eventCount,42,"complete original source register preserved");
 assert.equal(final.frames.length,raw.frames.length-2,
  "1961 §65 removes post-Nunc Kyrie and second Pater");
 assert.equal(final.sourceEventCount,42);
 assert.equal(final.readingEventCount,40);
 assert.equal(final.readingEvents.length,40);
 assert.equal(final.postCanticleKyrieOmitted,true);
 assert.equal(final.postCanticlePaterOmitted,true);
 assert.equal(final.blessingAmensRestoredFromPinnedSource,2);
 assert.ok(final.frames.filter(f=>f.kind==="BLESSING").every(f=>
  f.texts.la.at(-1)==="R. Amen."));
 assert.ok(final.frames.every(f=>f.sourceId!=="Psalterium/Common/Prayers#Kyrie"&&
  f.sourceId!=="Psalterium/Common/Prayers#Pater noster Et"));
 assert.equal(final.openingPaterOmitted,true);
 assert.equal(final.editorialRubricFrames,1);
 assert.equal(final.frames.filter(f=>f.kind==="EXAMINATION").length,1);
 assert.equal(final.frames.some(f=>f.kind==="PATER_NOSTER"&&
  f.sourceId==="Psalterium/Common/Prayers#Pater noster"),false);
 assert.equal(final.frames.some(f=>f.sourceId==="Psalterium/Common/Prayers#Pater noster Et"),false,
  "the printed 1961 Compline ordinary never has a post-Nunc Pater");
 assert.equal(final.frames.find(f=>f.kind==="EXAMINATION").originalSourceOnly,false);
 assert.equal(final.published,false);
 const other=projectComplineRecitation(raw,{context:COMPLINE_CONTEXT.OTHER_TIME});
 assert.equal(other.status,"PRIVATE_SOURCE_TEXT_REVIEW");
 assert.equal(other.frames.some(f=>f.sourceId==="Psalterium/Common/Prayers#Pater noster"),true);
 assert.equal(other.editorialRubricFrames,0);
 assert.equal(other.readingEventCount,40);
 assert.equal(other.frames.some(f=>f.sourceId==="Psalterium/Common/Prayers#Kyrie"),false);
 assert.equal(other.frames.some(f=>f.sourceId==="Psalterium/Common/Prayers#Pater noster Et"),false);
 assert.equal(other.blessingAmensRestoredFromPinnedSource,2);
 assert.equal(other.published,false);
 assert.equal(projectComplineRecitation(raw,{context:"CHOIR_UNDEFINED"}).status,"WITHHELD");
 assert.equal(projectComplineRecitation(raw,{minister:"UNKNOWN"}).status,"WITHHELD");
});
