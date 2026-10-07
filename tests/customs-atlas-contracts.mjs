import fs from "node:fs";
import assert from "node:assert/strict";
import {
  CUSTOMS_ATLAS_SCHEMA,
  auditAttestation,
  auditCustom,
  auditNegativeKnowledge,
  assertCustomsAtlasRegistry,
} from "../src/find/customs-contracts.js";

function readJson(relative) {
  return JSON.parse(fs.readFileSync(new URL(relative, import.meta.url), "utf8"));
}

const contract = readJson("../data/customs/customs-contract.v1.json");
const atlas = readJson("../data/customs/customs-atlas-seed.v1.json");
const sourceRegistry = readJson("../data/customs/source-registry.v1.json");
const negative = readJson("../data/customs/negative-knowledge.v1.json");
const geography = readJson("../data/geography/seed-registry.v1.json");

assert.equal(contract.schema, CUSTOMS_ATLAS_SCHEMA);
assert.equal(contract.version, "1.0.0");
assert.ok(contract.invariants.some(value => /proximity/i.test(value)));
assert.ok(contract.invariants.some(value => /HOLD and REJECT/i.test(value)));
assert.ok(contract.invariants.some(value => /Calendar owns date computation/i.test(value)));

for (const custom of atlas.customs) {
  assert.equal(auditCustom(custom).length, 0, custom.custom_id);
}
for (const attestation of atlas.attestations) {
  assert.equal(auditAttestation(attestation).length, 0, attestation.attestation_id);
}
for (const entry of negative.entries) {
  assert.equal(auditNegativeKnowledge(entry).length, 0, entry.custom_id);
}

assert.equal(atlas.customs.length, 13);
assert.equal(atlas.attestations.length, 67);
assert.equal(negative.entries.length, 7);

const result = assertCustomsAtlasRegistry({
  customs: atlas.customs,
  attestations: atlas.attestations,
  sources: sourceRegistry.sources,
  negativeKnowledge: negative.entries,
  geoAreas: geography.geoAreas,
  places: geography.places,
});
assert.equal(result.pass, true);
assert.deepEqual(result.counts, {
  customs: 13,
  attestations: 71,
  sources: 75,
  negativeKnowledge: 7,
});
assert.deepEqual(
  [...result.mapCandidates].sort(),
  ["att:DEV-009:LAGHET", "att:DEV-010:LOURDES", "att:DOM-006:PARAY", "att:DOM-007:PARAY", "att:DEV-007:SAINTE-ANNE-D-AURAY", "att:DEV-009:ALTOETTING", "att:DEV-010:MARIAZELL", "att:DEV-007:EINSIEDELN-ENGELWEIHE", "att:DEV-007:CHAMPION", "att:DEV-010:GUADALUPE-LA-CROSSE", "att:DEV-007:SAINTE-ANNE-BEAUPRE", "att:DEV-010:NOTRE-DAME-DU-CAP", "att:DEV-007:LORETO-VENUTA", "att:DEV-007:POMPEI-SUPPLICA", "att:DEV-007:JASNA-GORA", "att:DEV-007:KALWARIA-ASSUMPTION", "att:DEV-007:WALSINGHAM", "att:DEV-007:HOLYWELL-ST-WINEFRIDE", "att:DEV-007:ST-PETER-CHANEL-NZ", "att:DEV-007:UGWOGO-PERPETUAL-HELP", "att:DEV-007:NAMUGONGO-MARTYRS-DAY", "att:DEV-007:MUNYONYO-MARTYRS", "att:DEV-007:GUADALUPE-MX", "att:DEV-007:ZAPOPAN-ROMERIA", "att:DEV-007:APARECIDA", "att:DEV-007:CIRIO-NAZARE", "att:DEV-007:LAS-LAJAS", "att:DEV-007:CHIQUINQUIRA", "att:DEV-007:BANNEUX", "att:DEV-006:BEAURAING", "att:DEV-007:SVATA-HORA", "att:DEV-007:ST-WENCESLAS-BOLESLAV", "att:DEV-007:HEILOO-FIRST-SATURDAY", "att:DEV-007:MAASTRICHT-STERRE-DER-ZEE", "att:DEV-007:FATIMA-MAY13", "att:DEV-007:SAMEIRO", "att:DEV-006:NEUMANN-PHILADELPHIA", "att:DEV-010:MIRACULOUS-MEDAL-PHILADELPHIA", "att:DEV-006:CZESTOCHOWA-US-WALK", "att:DEV-006:SETON-SEA-SERVICES", "att:DEV-007:GROTTO-LOURDES-FEAST", "att:DEV-006:BERMONT-GREUX", "att:DEV-007:PONTMAIN-JAN17", "att:DEV-010:PONTMAIN-CANDLE", "att:DEV-006:PELLEVOISIN-ANNUAL", "att:DEAD-003:MONTLIGEON", "att:DEV-006:RUE-DU-BAC", "att:DEV-006:WIGRATZBAD", "att:DEV-007:MARIAHILF-AMBERG-BERGFEST", "att:DEV-007:NUSSDORF-LEONHARDIRITT", "att:DEV-007:FRIELINGSDORF-APOLLINARIS", "att:DEV-006:BETTBRUNN", "att:DEV-010:BETTBRUNN-VOTIVE-CANDLES", "att:DEV-007:MARIA-VESPERBILD-FATIMA", "att:DEV-006:AURIESVILLE-RESTORATION", "att:DEV-007:STOCKBRIDGE-DIVINE-MERCY", "att:DEV-006:LITCHFIELD-LOURDES", "att:DEV-007:FISKDALE-ST-ANNE-NOVENA"].sort(),
);

const laghet = atlas.attestations.find(item => item.attestation_id === "att:DEV-009:LAGHET");
assert.equal(laghet.map_policy, "PLACE");
assert.equal(laghet.place_id, "place:FR:sanctuaire-notre-dame-de-laghet");
assert.equal(laghet.place_name_hint, null);

const lourdes = atlas.attestations.find(item => item.attestation_id === "att:DEV-010:LOURDES");
assert.equal(lourdes.map_policy, "PLACE");
assert.equal(lourdes.place_id, "place:FR:sanctuaire-notre-dame-de-lourdes");

const sainteAnne = atlas.attestations.find(item => item.attestation_id === "att:DEV-007:SAINTE-ANNE-D-AURAY");
assert.equal(sainteAnne.map_policy,"PLACE");
assert.equal(sainteAnne.place_id,"place:FR:sainte-anne-d-auray");

const altoetting=atlas.attestations.find(item=>item.attestation_id==="att:DEV-009:ALTOETTING");
assert.equal(altoetting.place_id,"place:DE:altoetting-gnadenkapelle");
const mariazell=atlas.attestations.find(item=>item.attestation_id==="att:DEV-010:MARIAZELL");
assert.equal(mariazell.place_id,"place:AT:mariazell-basilica");
const einsiedeln=atlas.attestations.find(item=>item.attestation_id==="att:DEV-007:EINSIEDELN-ENGELWEIHE");
assert.equal(einsiedeln.place_id,"place:CH:einsiedeln-monastery");

const champion=atlas.attestations.find(item=>item.attestation_id==="att:DEV-007:CHAMPION");
assert.equal(champion.place_id,"place:US:champion-shrine");
const guadalupe=atlas.attestations.find(item=>item.attestation_id==="att:DEV-010:GUADALUPE-LA-CROSSE");
assert.equal(guadalupe.place_id,"place:US:guadalupe-shrine-la-crosse");
const sainteAnneBeaupre=atlas.attestations.find(item=>item.attestation_id==="att:DEV-007:SAINTE-ANNE-BEAUPRE");
assert.equal(sainteAnneBeaupre.place_id,"place:CA:sainte-anne-de-beaupre");
const ndc=atlas.attestations.find(item=>item.attestation_id==="att:DEV-010:NOTRE-DAME-DU-CAP");
assert.equal(ndc.place_id,"place:CA:notre-dame-du-cap");

for(const [id,place] of [
  ["att:DEV-007:LORETO-VENUTA","place:IT:loreto-santa-casa"],
  ["att:DEV-007:POMPEI-SUPPLICA","place:IT:pompei-rosary-shrine"],
  ["att:DEV-007:JASNA-GORA","place:PL:jasna-gora"],
  ["att:DEV-007:KALWARIA-ASSUMPTION","place:PL:kalwaria-zebrzydowska"],
  ["att:DEV-007:WALSINGHAM","place:GB:walsingham-catholic-shrine"],
  ["att:DEV-007:HOLYWELL-ST-WINEFRIDE","place:GB:holywell-st-winefride"],
]){
  const att=atlas.attestations.find(item=>item.attestation_id===id);
  assert.ok(att,id+" missing");
  assert.equal(att.place_id,place,id);
}

for(const [id,place] of [
  ["att:DEV-007:ST-PETER-CHANEL-NZ","place:NZ:st-peter-chanel-russell"],
  ["att:DEV-007:UGWOGO-PERPETUAL-HELP","place:NG:ugwogo-nike-national-marian-shrine"],
  ["att:DEV-007:NAMUGONGO-MARTYRS-DAY","place:UG:namugongo-martyrs"],
  ["att:DEV-007:MUNYONYO-MARTYRS","place:UG:munyonyo-martyrs"],
]){
  const att=atlas.attestations.find(item=>item.attestation_id===id);
  assert.ok(att,id+" missing");
  assert.equal(att.place_id,place,id);
}

for(const [id,place] of [
  ["att:DEV-007:GUADALUPE-MX","place:MX:basilica-guadalupe-mexico-city"],
  ["att:DEV-007:ZAPOPAN-ROMERIA","place:MX:basilica-zapopan"],
  ["att:DEV-007:APARECIDA","place:BR:aparecida-national-shrine"],
  ["att:DEV-007:CIRIO-NAZARE","place:BR:nazare-belem"],
  ["att:DEV-007:LAS-LAJAS","place:CO:las-lajas-ipiales"],
  ["att:DEV-007:CHIQUINQUIRA","place:CO:chiquinquira-basilica"],
]){
  const att=atlas.attestations.find(item=>item.attestation_id===id);
  assert.ok(att,id+" missing");
  assert.equal(att.place_id,place,id);
}

for(const [id,place] of [
  ["att:DEV-007:BANNEUX","place:BE:banneux"],
  ["att:DEV-006:BEAURAING","place:BE:beauraing"],
  ["att:DEV-007:SVATA-HORA","place:CZ:svata-hora-pribram"],
  ["att:DEV-007:ST-WENCESLAS-BOLESLAV","place:CZ:stara-boleslav-st-wenceslas"],
  ["att:DEV-007:HEILOO-FIRST-SATURDAY","place:NL:heiloo-olv-ter-nood"],
  ["att:DEV-007:MAASTRICHT-STERRE-DER-ZEE","place:NL:maastricht-sterre-der-zee"],
  ["att:DEV-007:FATIMA-MAY13","place:PT:fatima-sanctuary"],
  ["att:DEV-007:SAMEIRO","place:PT:sameiro-braga"],
]){
  const att=atlas.attestations.find(item=>item.attestation_id===id);
  assert.ok(att,id+" missing");
  assert.equal(att.place_id,place,id);
}

for(const [id,place] of [
  ["att:DEV-006:BERMONT-GREUX","place:FR:bermont-greux"],
  ["att:DEV-007:PONTMAIN-JAN17","place:FR:pontmain"],
  ["att:DEV-010:PONTMAIN-CANDLE","place:FR:pontmain"],
  ["att:DEV-006:PELLEVOISIN-ANNUAL","place:FR:pellevoisin"],
  ["att:DEAD-003:MONTLIGEON","place:FR:montligeon"],
  ["att:DEV-006:RUE-DU-BAC","place:FR:rue-du-bac"],
]){
  const att=atlas.attestations.find(item=>item.attestation_id===id);
  assert.ok(att,id+" missing");
  assert.equal(att.place_id,place,id);
  assert.equal(att.map_policy,"PLACE",id);
}
const pontmainCandle=atlas.attestations.find(item=>item.attestation_id==="att:DEV-010:PONTMAIN-CANDLE");
assert.match(pontmainCandle.evidence_note,/candle/i);
const montligeonDead=atlas.attestations.find(item=>item.attestation_id==="att:DEAD-003:MONTLIGEON");
assert.match(montligeonDead.evidence_note,/prayer for the dead/i);
const rueDuBacPilgrimage=atlas.attestations.find(item=>item.attestation_id==="att:DEV-006:RUE-DU-BAC");
assert.match(rueDuBacPilgrimage.evidence_note,/organized pilgrimages/i);

for(const [id,place] of [
  ["att:DEV-006:WIGRATZBAD","place:DE:wigratzbad-maria-vom-sieg"],
  ["att:DEV-007:MARIAHILF-AMBERG-BERGFEST","place:DE:mariahilf-amberg"],
  ["att:DEV-007:NUSSDORF-LEONHARDIRITT","place:DE:st-leonhard-nussdorf"],
  ["att:DEV-007:FRIELINGSDORF-APOLLINARIS","place:DE:st-apollinaris-frielingsdorf"],
  ["att:DEV-006:BETTBRUNN","place:DE:bettbrunn-st-salvator"],
  ["att:DEV-010:BETTBRUNN-VOTIVE-CANDLES","place:DE:bettbrunn-st-salvator"],
  ["att:DEV-007:MARIA-VESPERBILD-FATIMA","place:DE:maria-vesperbild"],
]){
  const att=atlas.attestations.find(item=>item.attestation_id===id);
  assert.ok(att,id+" missing");
  assert.equal(att.place_id,place,id);
  assert.equal(att.map_policy,"PLACE",id);
}

for(const [id,place] of [
  ["att:DEV-006:AURIESVILLE-RESTORATION","place:US:auriesville-martyrs"],
  ["att:DEV-007:STOCKBRIDGE-DIVINE-MERCY","place:US:divine-mercy-stockbridge"],
  ["att:DEV-006:LITCHFIELD-LOURDES","place:US:lourdes-litchfield"],
  ["att:DEV-007:FISKDALE-ST-ANNE-NOVENA","place:US:st-anne-fiskdale"],
]){
  const att=atlas.attestations.find(item=>item.attestation_id===id);
  assert.ok(att,id+" missing");
  assert.equal(att.place_id,place,id);
  assert.equal(att.map_policy,"PLACE",id);
}

const universalPilgrimage = atlas.attestations.find(item => item.attestation_id === "att:DEV-006:WORLD");
assert.equal(universalPilgrimage.map_policy, "NOT_MAPPED");

const rejectedId = new Set(negative.entries.map(item => item.custom_id));
for (const custom of atlas.customs) {
  assert.equal(rejectedId.has(custom.custom_id), false, `${custom.custom_id} leaked from negative knowledge`);
}

const activeRejected = structuredClone(atlas.customs[0]);
activeRejected.custom_id = "BAD-REJECT";
activeRejected.decision = "REJECT — test";
assert.ok(auditCustom(activeRejected).some(item => item.code === "NEGATIVE_FINDING_IN_ACTIVE_CUSTOMS"));

const badPending = structuredClone(laghet);
badPending.map_policy = "PLACE_PENDING";
badPending.place_id = null;
badPending.place_name_hint = null;
assert.ok(auditAttestation(badPending).some(item => item.code === "PLACE_PENDING_REQUIRES_HINT"));

const secondaryOnlyPlace = structuredClone(laghet);
secondaryOnlyPlace.attestation_id = "att:TEST:SECONDARY";
secondaryOnlyPlace.custom_id = "FOOD-001";
secondaryOnlyPlace.source_ids = ["PAIN-BENIT"];
assert.throws(
  () => assertCustomsAtlasRegistry({
    customs: atlas.customs,
    attestations: [...atlas.attestations, secondaryOnlyPlace],
    sources: sourceRegistry.sources,
    negativeKnowledge: negative.entries,
    geoAreas: geography.geoAreas,
    places: geography.places,
  }),
  error => error?.issues?.some(item => item.code === "MAP_CLAIM_LACKS_DIRECT_EVIDENCE"),
);

const negativeNotBlocked = structuredClone(negative.entries[0]);
negativeNotBlocked.map_blocked = false;
assert.ok(auditNegativeKnowledge(negativeNotBlocked).some(item => item.code === "NEGATIVE_NOT_MAP_BLOCKED"));

console.log("customs atlas source-of-truth and attestation registry: PASS");
