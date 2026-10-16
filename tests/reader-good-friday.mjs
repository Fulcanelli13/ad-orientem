import assert from "node:assert/strict";
import "./distinct-rite-scripture-order.mjs";
import "./native-rite-scripture-context.mjs";
import { readFileSync } from "node:fs";
import { buildGoodFridayReader, createGoodFridayReaderController } from "../src/mass/reader-good-friday.js";
import { compileMassPlan, makeResolvedMass } from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const core=load("../data/mass/special-days-core.v1.1.json");
const payload=load("../data/presentation/reader-good-friday.v1.json");
const ordinary=load("../data/presentation/reader-text-sung.v1.json");
const graph=core.graphs.GF;

assert.equal(graph.length,56);
const resolved=makeResolvedMass({
  date:"2027-03-26",
  form:"SOLEMN",
  presentationMode:"LIVE",
  calendarCelebration:{id:"good-friday",type:"CALENDAR"},
  distinctRite:"GOOD_FRIDAY",
});
const plan=compileMassPlan(resolved);
assert.equal(plan.kind,"DISTINCT_RITE");
assert.equal(plan.rite,"GOOD_FRIDAY");
assert.equal(plan.canonicalMassGraphActive,false);
assert.equal(plan.ordinaryMassAssumptionsAllowed,false);

let built=buildGoodFridayReader({graph,payload});
assert.equal(built.ordinaryMassGraphActive,false);
assert.equal(built.sourceRecordCount,56);
assert.equal(built.jewishPrayerVariant,"PRINTED_1962");
assert.equal(built.venerationMode,"PERSONAL");
assert.equal(built.willReceiveCommunion,false);
assert.ok(built.steps.every(x=>/^GF-/.test(x.recordId)));
assert.equal(new Set(built.steps.map(x=>x.recordId)).size,built.steps.length);
assert.ok(!built.steps.some(x=>x.recordId==="GF-VEN-650"),"corporate veneration leaked into personal branch");
assert.ok(!built.steps.some(x=>x.recordId==="GF-COM-850"),"personal Communion step appeared for non-communicant");
for(const id of ["GF-VEN-600","GF-VEN-610","GF-VEN-620","GF-VEN-630","GF-VEN-640"]){
  assert.ok(built.steps.some(x=>x.recordId===id),id+" missing from personal veneration");
}

const death=built.steps.find(x=>x.recordId==="GF-PASS-320");
assert.equal(death.posture,"KNEEL");
assert.equal(death.action,"PAUSE_BRIEFLY");
assert.equal(death.surfaceKey,"PASSION_BEFORE_DEATH");
const resume=built.steps.find(x=>x.recordId==="GF-PASS-330");
assert.equal(resume.posture,"STAND");
assert.equal(resume.surfaceKey,"PASSION_AFTER_DEATH");
assert.ok(payload.passion.preDeath.at(-1).includes("tradidit spiritum"));
assert.ok(payload.passion.postDeath[0].startsWith("Iudaei ergo"));

for(let n=1;n<=9;n++){
  const s=String(n).padStart(2,"0");
  const kneel=built.steps.find(x=>x.recordId===`GF-SOP-${s}-K`);
  const rise=built.steps.find(x=>x.recordId===`GF-SOP-${s}-R`);
  assert.equal(kneel.posture,"KNEEL",s+" solemn prayer lost Flectamus genua");
  assert.equal(kneel.action,"SILENT_PRAYER");
  assert.equal(rise.posture,"STAND",s+" solemn prayer lost Levate");
  assert.equal(kneel.surfaceKey,rise.surfaceKey);
}
// Every kneel/rise pair shares its visual prayer text but only the exact
// Flectamus and Levate lines own the two canonical state events.
for(let n=1;n<=9;n++){
  const nn=String(n).padStart(2,"0");
  const kneel=built.steps.find(x=>x.recordId==="GF-SOP-"+nn+"-K");
  const rise=built.steps.find(x=>x.recordId==="GF-SOP-"+nn+"-R");
  const k=kneel.paragraphs.find(x=>x.id==="GF-SOP-"+nn+"-K");
  const r=kneel.paragraphs.find(x=>x.id==="GF-SOP-"+nn+"-R");
  assert.equal(k.latin,"Flectamus genua.");
  assert.equal(r.latin,"Levate.");
  assert.deepEqual([...k.sourceIds],["GF-SOP-"+nn+"-K"]);
  assert.deepEqual([...r.sourceIds],["GF-SOP-"+nn+"-R"]);
  assert.deepEqual([...rise.paragraphs.find(x=>x.id===k.id).sourceIds],[kneel.recordId]);
  assert.deepEqual([...rise.paragraphs.find(x=>x.id===r.id).sourceIds],[rise.recordId]);
  for(const row of kneel.paragraphs.filter(x=>!["GF-SOP-"+nn+"-K","GF-SOP-"+nn+"-R"].includes(x.id))){
    assert.deepEqual([...row.sourceIds],[],nn+" unrelated prayer text owns a kneeling event");
  }
}

const jewishSurface=built.steps.find(x=>x.recordId==="GF-SOP-08-K");
assert.ok(jewishSurface.paragraphs.some(x=>/auferat velamen/.test(x.latin)),"printed 1962 Jewish prayer was not the default");
assert.ok(!jewishSurface.paragraphs.some(x=>/plenitudine gentium/.test(x.latin)),"2008 Jewish prayer silently replaced printed 1962 text");

const later=buildGoodFridayReader({graph,payload,jewishPrayerVariant:"HOLY_SEE_2008"});
const laterJewish=later.steps.find(x=>x.recordId==="GF-SOP-08-K");
assert.ok(laterJewish.paragraphs.some(x=>/plenitudine gentium/.test(x.latin)),"explicit 2008 overlay did not resolve");
// Holy See Secretariat of State 4 February 2008 is the PRIMARY authority
// for the optional later formula; the printed 1962 prayer stays independent.
// https://www.vatican.va/roman_curia/secretariat_state/2008/documents/rc_seg-st_20080204_nota-missale-romanum_en.html
const original1962=payload.solemnPrayers[7].variants.PRINTED_1962;
const official2008=payload.solemnPrayers[7].variants.HOLY_SEE_2008;
assert.equal(official2008.intention,
  "Oremus et pro Iudaeis. Ut Deus et Dominus noster illuminet corda eorum, ut agnoscant Iesum Christum salvatorem omnium hominum.");
assert.equal(official2008.prayer,
  "Omnipotens sempiterne Deus, qui vis ut omnes homines salvi fiant et ad agnitionem veritatis veniant, concede propitius, ut plenitudine gentium in Ecclesiam tuam intrante omnis Israel salvus fiat. Per Christum Dominum nostrum. Amen.");
assert.ok(!official2008.prayer.includes("Per eundem Dominum nostrum"),
  "2008 Vatican oration must not inherit the printed 1962 conclusion");
assert.ok(original1962.prayer.includes("qui Iudaeos etiam a tua misericordia non repellis"));
assert.ok(original1962.prayer.endsWith("per omnia saecula saeculorum. Amen."),
  "Primary-source correction must never overwrite original 1962 prayer");
assert.equal(laterJewish.paragraphs.find(x=>x.id==="GF-SOP-08-P").latin,official2008.prayer,
  "Native Good Friday 2008 reader must show the exact issued conclusion");
assert.equal(jewishSurface.paragraphs.find(x=>x.id==="GF-SOP-08-P").latin,original1962.prayer,
  "Native Good Friday printed reader must remain original 1962");

for(const n of [1,2,3]){
  const k=built.steps.find(x=>x.recordId===`GF-X-52${n}`);
  const r=built.steps.find(x=>x.recordId===`GF-X-53${n}`);
  assert.equal(k.posture,"KNEEL");
  assert.equal(k.action,"BRIEF_SILENT_ADORATION");
  assert.equal(r.posture,"STAND");
  assert.equal(k.surfaceKey,`UNVEILING_${n}`);
}

for(let n=1;n<=3;n++){
  const kneel=built.steps.find(x=>x.recordId==="GF-X-52"+n);
  const rise=built.steps.find(x=>x.recordId==="GF-X-53"+n);
  for(const step of [kneel,rise]){
    const proclamation=step.paragraphs.find(x=>x.id==="GF-X-"+n+"-V");
    const response=step.paragraphs.find(x=>x.id==="GF-X-"+n+"-R");
    assert.deepEqual([...proclamation.sourceIds],[],"Ecce lignum falsely triggered kneeling");
    assert.deepEqual([...response.sourceIds],["GF-X-52"+n],"Cross response not tied to its own unveiling");
  }
}

const genuflect=built.steps.find(x=>x.recordId==="GF-VEN-620");
assert.equal(genuflect.personalOnly,true);
assert.equal(genuflect.action,"ONE_SIMPLE_GENUFLECTION");
assert.equal(genuflect.personalState,"GENUFLECTING");
assert.ok(!built.steps.some(x=>x.recordId==="GF-VEN-650"));

const corporate=buildGoodFridayReader({graph,payload,venerationMode:"CORPORATE_SILENT"});
assert.ok(corporate.steps.some(x=>x.recordId==="GF-VEN-650"));
for(const id of ["GF-VEN-600","GF-VEN-610","GF-VEN-620","GF-VEN-630","GF-VEN-640"]){
  assert.ok(!corporate.steps.some(x=>x.recordId===id),id+" leaked into corporate-silent branch");
}
const corp=corporate.steps.find(x=>x.recordId==="GF-VEN-650");
assert.equal(corp.action,"SILENT_ADORATION_FROM_PLACE");
assert.equal(corp.personalOnly,false);

const communicant=buildGoodFridayReader({graph,payload,willReceiveCommunion:true});
// Voice attribution follows the actual Good Friday actors, not the common
// assumption that the celebrant alone says the entire Pater noster.
const expectedCommunionSpeakers=[
  ["GF-COM-830",["CELEBRANT","ALL","CELEBRANT","ALL"]],
  ["GF-COM-840",["CELEBRANT","CELEBRANT","CELEBRANT",undefined,"DEACON","DEACON","DEACON","CELEBRANT","ALL","CELEBRANT","ALL","CELEBRANT","CELEBRANT"]],
  ["GF-COM-850",[undefined]],
];
for(const [recordId,expected] of expectedCommunionSpeakers){
  const step=communicant.steps.find(x=>x.recordId===recordId);
  assert.deepEqual(step.paragraphs.map(p=>p.speaker),expected,
    recordId+" confused celebrant, congregation or communicants");
}
assert.deepEqual(
  communicant.steps.find(x=>x.recordId==="GF-COM-820").paragraphs.map(p=>p.speaker),
  expectedCommunionSpeakers[0][1],
  "arrival at altar lost shared Pater speaker ownership"
);

const receive=communicant.steps.find(x=>x.recordId==="GF-COM-850");
assert.deepEqual(receive.paragraphs.map(row=>row.id),["GF-COM-850-T"],
  "personal Communion card repeats the common Ecce / Domine non sum dignus");
assert.equal(receive.paragraphs[0].kind,"RUBRIC");
const preparation=communicant.steps.find(x=>x.recordId==="GF-COM-840");
assert.equal(preparation.paragraphs.length,13);
for(const id of ["GF-COM-DNSD","GF-COM-FDNSD"])
  assert.equal(preparation.paragraphs.find(row=>row.id===id).repetitions,3,
    id+" lost the triple repetition in the Good Friday order");
assert.deepEqual(preparation.paragraphs.filter(row=>row.kind==="RESPONSE").map(row=>[row.id,row.latin,row.speaker]),[
  ["GF-COM-MIS-R","Amen.","ALL"],
  ["GF-COM-IND-R","Amen.","ALL"],
],"faithful responses to Misereatur and Indulgentiam were omitted");
assert.equal(preparation.paragraphs.find(row=>row.id==="GF-COM-CONF").kind,"RUBRIC");
const ordinaryMinister=ordinary.blocks.find(x=>x.Block_ID==="AO.SM.B007");
assert.deepEqual(payload.communion.deaconConfiteor.parts.map(x=>x.cueId),
  ["AO.SM.C0021","AO.SM.C0022","AO.SM.C0023"]);
assert.deepEqual(payload.communion.deaconConfiteor.parts.map(x=>x.latin),
  ordinaryMinister.units.map(x=>x.latin),
  "Good Friday Confiteor must equal authoritative 1962 Ordinary ministers' words");
assert.deepEqual(payload.communion.deaconConfiteor.parts.map(x=>x.english),
  ordinaryMinister.units.map(x=>x.english));
const confRows=preparation.paragraphs.filter(x=>/^GF-COM-CONF-[123]$/.test(x.id));
assert.equal(confRows.length,3);
assert.deepEqual(confRows.map(x=>x.latin),ordinaryMinister.units.map(x=>x.latin));
assert.ok(confRows.every(x=>x.speaker==="DEACON"));
assert.ok(confRows[0].latin.includes("et tibi, pater"));
assert.ok(confRows[2].latin.includes("et te, pater"));
assert.ok(!confRows.map(x=>x.latin).join(" ").includes("et vobis, fratres"));
assert.ok(preparation.paragraphs.findIndex(x=>x.id==="GF-COM-CONF-3")<
  preparation.paragraphs.findIndex(x=>x.id==="GF-COM-MIS"));
for(const [description,mutated] of [
  ["wrong deacon addressee",{...payload,communion:{...payload.communion,
    deaconConfiteor:{...payload.communion.deaconConfiteor,
      parts:payload.communion.deaconConfiteor.parts.map((x,i)=>
        i===0?{...x,latin:x.latin.replace("et tibi, pater","et vobis, fratres")}:x)}}}],
  ["missing prayer",{...payload,communion:{...payload.communion,
    deaconConfiteor:{...payload.communion.deaconConfiteor,parts:[]}}}],
]){
  assert.throws(()=>buildGoodFridayReader({graph,payload:mutated}),
    /deacon Confiteor/,description);
}

assert.equal(receive.actorScope,"COMMUNICANT");
assert.equal(receive.personalOnly,true);
assert.equal(receive.posture,"KNEEL");
assert.equal(receive.action,"RECEIVE_COMMUNION");
assert.equal(communicant.steps.find(x=>x.recordId==="GF-COM-830").posture,"STAND");
assert.equal(communicant.steps.find(x=>x.recordId==="GF-COM-840").posture,"KNEEL");
assert.equal(communicant.steps.find(x=>x.recordId==="GF-COM-860").posture,"STAND");

const end=communicant.steps.find(x=>x.recordId==="GF-END-900");
assert.equal(end.paragraphs.length,3);
assert.equal(end.posture,"STAND");
assert.equal(communicant.steps.at(-1).recordId,"GF-END-910");
assert.ok(!communicant.steps.some(x=>/FINAL_BLESSING|LAST_GOSPEL|ITE_MISSA/i.test(x.triggerKey)),"ordinary Mass ending leaked into Good Friday");

const ctrl=createGoodFridayReaderController({graph,payload,willReceiveCommunion:true});
assert.equal(ctrl.project().step.recordId,"GF-OPEN-010");
ctrl.goToRecord("GF-PASS-320");
assert.equal(ctrl.project().posture,"KNEEL");
assert.equal(ctrl.project().action,"PAUSE_BRIEFLY");
ctrl.next();
assert.equal(ctrl.project().step.recordId,"GF-PASS-330");
assert.equal(ctrl.project().posture,"STAND");

const venerate=createGoodFridayReaderController({graph,payload});
venerate.goToRecord("GF-VEN-600");
const personalSequence=[
  ["GF-VEN-600","WAITING",null],
  ["GF-VEN-610","APPROACHING","APPROACH_CROSS"],
  ["GF-VEN-620","GENUFLECTING","ONE_SIMPLE_GENUFLECTION"],
  ["GF-VEN-630","VENERATING","KISS_OR_VENERATE_CROSS"],
  ["GF-VEN-640","COMPLETE","RETURN_TO_PLACE"],
];
for(const [i,[id,personalState,action]] of personalSequence.entries()){
  const state=venerate.project();
  assert.equal(state.step.recordId,id,"personal Cross state advanced from unrelated hymn text");
  assert.equal(state.personalState,personalState);
  assert.equal(state.action,action);
  assert.equal(state.personalOnly,true);
  assert.equal(state.card.id,"CROSS_VENERATION");
  if(i<personalSequence.length-1)venerate.next();
}
venerate.next();
assert.equal(venerate.project().step.recordId,"GF-X-700",
  "personal Cross veneration was not completed before altar replacement");
const noPersonal=createGoodFridayReaderController({graph,payload,venerationMode:"CORPORATE_SILENT"});
assert.equal(noPersonal.goToRecord("GF-VEN-620").step.recordId,"GF-OPEN-010",
  "corporate silent mode manufactured a personal genuflection state");
noPersonal.goToRecord("GF-VEN-650");
assert.equal(noPersonal.project().action,"SILENT_ADORATION_FROM_PLACE");

// Sacramental object movement is a separate 1962 source state; accompanying
// antiphons cannot imply that the Blessed Sacrament has reached the altar.
const objectRite=createGoodFridayReaderController({graph,payload});
for(const [record,posture,object] of [
  ["GF-COM-810","KNEEL","BLESSED_SACRAMENT_RETURNING"],
  ["GF-COM-820","STAND","BLESSED_SACRAMENT_AT_ALTAR"],
  ["GF-COM-830","STAND",null],
  ["GF-COM-840","KNEEL",null],
  ["GF-COM-860","STAND",null],
]){
  objectRite.goToRecord(record);
  const state=objectRite.project();
  assert.equal(state.posture,posture,record+" lost its distinct temporary posture");
  assert.equal(state.objectState,object,record+" retained a stale sacramental object state");
}
assert.equal(objectRite.project().step.recordId,"GF-COM-860");

// The personal Communion flag can change in the rite, without forcing a
// reconstruction of the liturgical texts or erasing the current source cue.
const changing=createGoodFridayReaderController({graph,payload,willReceiveCommunion:false});
changing.goToRecord("GF-COM-840");
assert.equal(changing.project().willReceiveCommunion,false);
assert.equal(changing.project().posture,"KNEEL");
assert.equal(changing.project().card.paragraphs.length,13);
changing.setWillReceiveCommunion(true);
assert.equal(changing.project().step.recordId,"GF-COM-840",
  "changing personal Communion choice unexpectedly restarted the rite");
assert.equal(changing.project().willReceiveCommunion,true);
assert.equal(changing.built.steps.filter(x=>x.recordId==="GF-COM-850").length,1);
changing.next();
assert.equal(changing.project().step.recordId,"GF-COM-850");
assert.equal(changing.project().personalState,"RECEIVING_COMMUNION");
assert.equal(changing.project().personalOnly,true);
changing.setWillReceiveCommunion(false);
assert.equal(changing.project().step.recordId,"GF-COM-860",
  "changing to noncommunicant during personal Communion returned to priest prayers");
assert.equal(changing.project().personalState,null);
assert.equal(changing.project().posture,"STAND");
assert.equal(changing.project().willReceiveCommunion,false);
assert.ok(!changing.built.steps.some(x=>x.recordId==="GF-COM-850"),
  "opted-out personal Communion event remained in runtime");
changing.previous();
assert.equal(changing.project().step.recordId,"GF-COM-840");
changing.next();
assert.equal(changing.project().step.recordId,"GF-COM-860",
  "noncommunicant was forced through personal reception");
changing.setWillReceiveCommunion(true);
assert.equal(changing.project().step.recordId,"GF-COM-860",
  "adding a personal option changed current common concluding posture");
changing.goToRecord("GF-COM-840");
changing.next();
assert.equal(changing.project().step.recordId,"GF-COM-850");
changing.next();
assert.equal(changing.project().step.recordId,"GF-COM-860");
changing.next();
assert.equal(changing.project().step.recordId,"GF-END-900");
assert.equal(changing.project().action,"RESPOND_AMEN");
changing.next();
assert.equal(changing.project().step.recordId,"GF-END-910");
assert.equal(changing.project().action,null);
assert.equal(changing.project().objectState,null);
assert.equal(changing.project().personalState,null);
assert.equal(changing.project().atEnd,true);

// The source-bound preparation and Pater remain identical whichever personal
// choice is made: priest formulas are not a proxy for personal reception.
const baseline=buildGoodFridayReader({graph,payload,willReceiveCommunion:false});
const withCommunion=buildGoodFridayReader({graph,payload,willReceiveCommunion:true});
for(const id of ["GF-COM-810","GF-COM-820","GF-COM-830","GF-COM-840","GF-COM-860","GF-END-900","GF-END-910"]){
  const a=baseline.steps.find(x=>x.recordId===id);
  const b=withCommunion.steps.find(x=>x.recordId===id);
  assert.equal(JSON.stringify(a.paragraphs),JSON.stringify(b.paragraphs),
    id+" text or source metadata changed because of a personal Communion decision");
  assert.equal(a.posture,b.posture);
  assert.equal(a.objectState,b.objectState);
}

console.log("Good Friday distinct rite: PASS — 56-state graph, Passion death pause, nine Solemn Prayers, three unveilings, personal veneration/Communion and 1962 prayer policy.");
