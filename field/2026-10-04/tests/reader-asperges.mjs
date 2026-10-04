import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAspergesPayload, createAspergesReaderController, resolveAspergesFormula, resolveAspergesRiteContext } from "../src/mass/reader-asperges.js";

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
assert.equal(built.cards[1].ministerOnly.actorScope,"CELEBRANT_MINISTERS");
assert.equal(built.cards[1].ministerOnly.posture,"KNEEL");
assert.equal(built.cards[1].posture,"STAND","minister kneeling leaked to faithful posture");
assert.equal(built.cards[2].personalTrigger,"ACTUALLY_SPRINKLED");
assert.equal(built.cards[4].handoff,"FOOT_CLUSTER");

built=buildAspergesPayload({graph,payload,riteContext:{omitGloriaPatri:true}});
assert.equal(built.cards[1].paragraphs.length,3,"Passiontide Gloria Patri omission not applied");
assert.equal(built.cards[1].paragraphs.some(x=>/Glória Patri/.test(x.latin)),false);

built=buildAspergesPayload({graph,payload,riteContext:{paschaltide:true}});
assert.equal(built.cards[1].title,"Vidi aquam");
assert.match(built.cards[1].paragraphs[0].latin,/Vidi aquam/);
assert.match(built.cards[1].paragraphs[0].latin,/allelúia/);
assert.equal(built.cards[1].paragraphs.some(x=>/Glória Patri/.test(x.latin)),true);

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
