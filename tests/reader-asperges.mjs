import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAspergesPayload, createAspergesReaderController, resolveAspergesFormula, resolveAspergesRiteContext, is1962PalmSunday } from "../src/mass/reader-asperges.js";
import {availableOptionalMassRites,composeOptionalMassRites} from "../src/mass/full-mass-optional-rites.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-asperges.v1.json");
const graph=extension.graphs.ASP;

assert.equal(graph.length,6);
assert.deepEqual(resolveAspergesFormula({}),{formula:"ORDINARY",paschaltide:false,omitGloriaPatri:false});
assert.deepEqual(resolveAspergesFormula({omitGloriaPatri:true}),{formula:"ORDINARY",paschaltide:false,omitGloriaPatri:true});
assert.deepEqual(resolveAspergesFormula({paschaltide:true,omitGloriaPatri:true}),{formula:"PASCHAL",paschaltide:true,omitGloriaPatri:false});
assert.deepEqual(resolveAspergesRiteContext({session:{resolvedMass:{date:"2026-10-04",provenance:{seasonalMode:null}}}}),{
  paschaltide:false,omitGloriaPatri:false,source:"DATE_DERIVED_1962_SEASON"
});
assert.deepEqual(resolveAspergesRiteContext({session:{resolvedMass:{date:"2026-11-01",provenance:{seasonalMode:null}}}}),{
  paschaltide:false,omitGloriaPatri:false,source:"DATE_DERIVED_1962_SEASON"
},"All Saints 2026 Sunday uses Asperges me, not Eastertide Vidi aquam");
assert.deepEqual(resolveAspergesRiteContext({session:{resolvedMass:{date:"2026-04-12",provenance:{seasonalMode:null}}}}),{
  paschaltide:true,omitGloriaPatri:false,source:"DATE_DERIVED_1962_SEASON"
});
assert.deepEqual(resolveAspergesRiteContext({session:{resolvedMass:{date:"2026-03-22",provenance:{seasonalMode:null}}}}),{
  paschaltide:false,omitGloriaPatri:true,source:"DATE_DERIVED_1962_SEASON"
});
assert.deepEqual(resolveAspergesRiteContext({session:{resolvedMass:{date:"2026-10-04",provenance:{seasonalMode:"paschaltide"}}}}),{
  paschaltide:true,omitGloriaPatri:false,source:"HOST_SEASONAL_MODE"
});
assert.throws(()=>resolveAspergesRiteContext({session:{resolvedMass:{date:"2026-10-04",provenance:{seasonalMode:"mystery-season"}}}}),/ASPERGES_SEASONAL_MODE_UNRECOGNIZED/);


let built=buildAspergesPayload({graph,payload});
assert.equal(built.cards.length,5);
assert.equal(built.cards[1].title,"Asperges me");
assert.equal(built.cards[1].paragraphs.length,4);
assert.ok(built.cards[1].paragraphs.every(row=>
 row.latin && row.english && row.french && row.sourceRecordId==="ASP-030"),
 "All ordinary Asperges chant lines require Latin and bilingual reading aid");
const finalPrayer=built.cards[3].paragraphs;
assert.equal(finalPrayer.length,9,
 "Oremus, six versicles/responses, prayer and Amen must be complete");
assert.deepEqual(finalPrayer.map(row=>row.id),[
 "ASP-050-01","ASP-050-02","ASP-050-03","ASP-050-04",
 "ASP-050-05","ASP-050-06","ASP-050-OREMUS",
 "ASP-050-PRAYER","ASP-050-AMEN"]);
assert.equal(finalPrayer[6].latin,"℣. Orémus.");
assert.equal(finalPrayer[8].latin,"℟. Amen.");
assert.ok(finalPrayer.every(row=>
 row.sourceRecordId==="ASP-050" && row.english && row.french && row.latin),
 "Sunday Asperges versicles/Orémus/prayer and Amen must be EN/FR complete");
assert.ok(finalPrayer.slice(0,6).every((row,i)=>
 row.latin.startsWith(i%2===0?"℣. ":"℟. ")),
 "The exact Latin ℣ and ℟ speaker turns must remain visible");
assert.equal(built.cards[1].ministerOnly.actorScope,"CELEBRANT_MINISTERS");
assert.equal(built.cards[1].ministerOnly.posture,"KNEEL");
assert.equal(built.cards[1].posture,"STAND","minister kneeling leaked to faithful posture");
assert.equal(built.cards[2].personalTrigger,"ACTUALLY_SPRINKLED");
assert.equal(built.cards[4].handoff,"FOOT_CLUSTER");
for(const card of built.cards){
  assert.ok(card.titleFr,"R20 prayer/ritual cards must have a French section-jump title");
  if(card.guide){
    assert.ok(card.guideFr,"R20 source-owned participation guide must be available in French");
    assert.ok(card.guideFr.length>12,"French rubric must be meaningful");
  }
}
assert.ok(built.cards.filter(card=>card.paragraphs.length===0&&card.guide).length===3,
  "the three action-only stages must stay source-empty; their guide is a visible RUBRIC, not prayer text");
assert.equal(built.cards.flatMap(card=>card.sourceRecordIds).length,6,
  "visual source-guidance enhancement must not invent extra ASP source records");

built=buildAspergesPayload({graph,payload,riteContext:{omitGloriaPatri:true}});
assert.equal(built.cards[1].paragraphs.length,3,"Passiontide Gloria Patri omission not applied");
assert.equal(built.cards[1].paragraphs.some(x=>/Glória Patri/.test(x.latin)),false);

built=buildAspergesPayload({graph,payload,riteContext:{paschaltide:true}});
assert.equal(built.cards[1].title,"Vidi aquam");
assert.ok(built.cards[1].paragraphs.every(row=>
 row.latin && row.english && row.french),
 "Eastertide alternative must keep its own independent bilingual source rows");
assert.match(built.cards[1].paragraphs[0].latin,/Vidi aquam/);
assert.match(built.cards[1].paragraphs[0].latin,/allelúia/);
assert.equal(built.cards[1].paragraphs.some(x=>/Glória Patri/.test(x.latin)),true);

const paschalVersicles=built.cards[3].paragraphs;
for(const i of [0,1]){
 assert.match(paschalVersicles[i].latin,/Allelúia\.$/,"Eastertide 1961 source adds Alleluia after first versicle and response");
 assert.match(paschalVersicles[i].english,/Alleluia\.$/);
 assert.match(paschalVersicles[i].french,/Alléluia\.$/);
}
assert.ok(paschalVersicles.slice(2).every(x=>!x.latin.endsWith("Allelúia.")),
 "Do not invent Paschal Alleluia on unrelated versicles, oration, or Amen");
built=buildAspergesPayload({graph,payload,riteContext:{paschaltide:false}});
assert.ok(built.cards[3].paragraphs.slice(0,2).every(x=>!x.latin.endsWith("Allelúia.")),
 "Ordinary Sunday versicles must not acquire Eastertide Alleluia");

assert.equal(is1962PalmSunday("2026-03-29"),true);
assert.equal(is1962PalmSunday("2026-03-22"),false);
assert.equal(is1962PalmSunday("2026-04-05"),false);
assert.equal(is1962PalmSunday("2026-11-01"),false);
const sundayEligibility=date=>availableOptionalMassRites({date,canStart:true},
 {form:"MISSA_CANTATA_SIMPLE",kind:"CALENDAR"}).find(x=>x.id==="ASPERGES").allowed;
assert.equal(sundayEligibility("2026-03-22"),true,"Passion Sunday retains Asperges, without Gloria Patri");
assert.equal(sundayEligibility("2026-03-29"),false,"Palm Sunday omits the Sunday aspersion entirely");
assert.equal(sundayEligibility("2026-04-05"),true,"Easter Sunday uses Vidi aquam");
assert.equal(sundayEligibility("2026-11-01"),true,"All Saints 2026 retains Sunday Asperges");
const palm={date:"2026-03-29",canStart:true,insertedRites:["PALM"]};
const preservedPalm=composeOptionalMassRites(palm,
 {form:"SOLEMN",kind:"CALENDAR"},
 {precedingRites:["PALM","ASPERGES"]});
assert.deepEqual(preservedPalm.precedingRites,["PALM"],
 "An inherited stale ASPERGES flag must not collide with Palm procession");
assert.throws(()=>composeOptionalMassRites(palm,
 {form:"SOLEMN",kind:"CALENDAR",overrides:{ASPERGES:true}},
 {precedingRites:["PALM"]}),/MASS_RITE_NOT_APPLICABLE_ASPERGES/);


const ctrl=createAspergesReaderController({graph,payload});
let s=ctrl.project();
assert.equal(s.card.id,"ASP-R01");
ctrl.goTo("ASP-R03");
s=ctrl.project();
assert.equal(s.faithfulGesture,null,"personal Sign of Cross fired before actual sprinkling");
ctrl.setActuallySprinkled(true);
s=ctrl.project();
assert.equal(s.faithfulGesture,"MAKE_FULL_SIGN_OF_CROSS");
ctrl.goTo("ASP-R05");
s=ctrl.project();
assert.equal(s.handoff,"FOOT_CLUSTER");
assert.equal(s.atEnd,true);

for(const card of ctrl.cards){
  for(const row of card.paragraphs){
    assert.ok(row.latin,"Asperges reader row contains blank liturgical text");
  }
}

console.log("native Asperges payload: PASS — source-pinned text, actor scoping, personal sprinkling cue and Foot-cluster handoff.");
