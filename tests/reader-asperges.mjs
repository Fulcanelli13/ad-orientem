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
assert.match(built.cards[1].paragraphs[0].latin,/Vidi aquam/);
assert.match(built.cards[1].paragraphs[0].latin,/allelúia/);
assert.equal(built.cards[1].paragraphs.some(x=>/Glória Patri/.test(x.latin)),true);

// Exact printed 1962 dialogue and invitation, with independently sourced
// editor-reviewed English/French columns. No source cue or stage added.
const ordinary=buildAspergesPayload({graph,payload});
const ordinaryRows=ordinary.cards.flatMap(c=>c.paragraphs);
assert.equal(ordinaryRows.length,13,"1962 ordinary Asperges 4 chant + 9 versicle/prayer rows");
assert.equal(ordinary.cards[3].paragraphs.length,9);
assert.deepEqual(ordinary.cards[3].paragraphs.slice(6).map(p=>p.id),[
  "ASP-050-OREMUS","ASP-050-PRAYER","ASP-050-AMEN"]);
assert.equal(ordinary.cards[3].paragraphs[6].latin,"Orémus.");
assert.equal(ordinary.cards[3].paragraphs[6].french,"Prions.");
assert.ok(ordinaryRows.every(p=>p.latin?.trim()&&p.english?.trim()&&p.french?.trim()),
  "An English or French Missal prayer row is missing source-crosschecked text");
assert.ok(ordinaryRows.every(p=>p.sourceRecordId==="ASP-030"||p.sourceRecordId==="ASP-050"),
  "Reader text invented an unowned Asperges source event");
assert.equal(ordinaryRows.some(p=>/allelúia/i.test(p.latin)&&p.id.startsWith("ASP-050")),false,
  "Paschal alleluia contaminated ordinary-season versicles");
assert.ok(ordinary.cards[3].paragraphs.slice(0,6).every((p,i)=>
  p.kind===(i%2===0?"VERSICLE":"RESPONSE")));
const paschal=buildAspergesPayload({graph,payload,riteContext:{paschaltide:true}});
assert.equal(paschal.cards[3].paragraphs.length,9);
assert.equal(paschal.cards[1].paragraphs.length,4);
assert.ok(paschal.cards[3].paragraphs.slice(0,2).every(p=>p.latin.endsWith("allelúia.")&&
  p.english.endsWith("alleluia.")&&p.french.endsWith("alléluia.")),
  "The two appointed Paschal alleluia endings were omitted");
assert.ok(paschal.cards[3].paragraphs.slice(2,6).every(p=>!/allelúia/i.test(p.latin)),
  "The Paschal alleluia was applied to later unaffected verses");
assert.deepEqual(ordinary.cards.map(c=>c.sourceRecordIds),
  paschal.cards.map(c=>c.sourceRecordIds),
  "Changing Asperges seasonal formula modified source ceremonial topology");
const brokenTranslations=structuredClone(payload);
brokenTranslations.prayer.french="";
assert.throws(()=>buildAspergesPayload({graph,payload:brokenTranslations}),
  /ASPERGES_BILINGUAL_SOURCE_ROW_INCOMPLETE/);
const brokenVersicles=structuredClone(payload);
brokenVersicles.versicles[1].kind="VERSICLE";
assert.throws(()=>buildAspergesPayload({graph,payload:brokenVersicles}),
  /ASPERGES_1962_SIX_VERSE_RESPONSE_SOURCE_ORDER_REQUIRED/);

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
