import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const authority=load("../data/mass/solemn-pax-authority.v1.json");
const events=load("../data/mass/mc-events-05.v1.json").events;
const formState=load("../data/presentation/reader-form-state.v1.json");

assert.equal(authority.schema,"ao-solemn-pax-authority-v1");
assert.equal(authority.status,"CERTIFIED_PRIMARY_1962_RUBRIC");
assert.equal(authority.canonicalEventId,"MC-COM-160");
assert.equal(authority.sourceMoment,"E55");
assert.equal(authority.readerCueId,"AO.SM.C0225");
assert.equal(authority.primaryAuthority.authorityTier,"A");
assert.match(authority.primaryAuthority.section,/Ritus servandus.*X\.8/i);
assert.deepEqual(authority.readerOwnership.actorChain,["CELEBRANT","DEACON","SUBDEACON","CHOIR_OR_ACOLYTES"]);

const paxDomini=events.find(e=>e.id==="MC-COM-100");
const peacePrayer=events.find(e=>e.id==="MC-COM-150");
const transfer=events.find(e=>e.id==="MC-COM-160");
assert.ok(paxDomini&&peacePrayer&&transfer,"Pax canonical event triad incomplete");
assert.notEqual(paxDomini.id,peacePrayer.id);
assert.notEqual(peacePrayer.id,transfer.id);
assert.equal(transfer.evidenceTier,"A");
assert.equal(transfer.forms.SOLEMN,"CERTIFIED");
assert.equal(transfer.forms.LOW,"UNAVAILABLE_OVERLAY");
assert.deepEqual(transfer.conditions,["FORM_IS_SOLEMN"]);
assert.ok(transfer.authorityRefs.includes("data/mass/solemn-pax-authority.v1.json#primaryAuthority"));

assert.equal(formState.solemn.paxTransferCue,"AO.SM.C0225");
assert.equal(formState.solemn.paxTransferAuthority,"CERTIFIED_PRIMARY_1962_RITUS_SERVANDUS_X_8");
const minister=formState.solemn.ministerEvents.find(e=>e.id==="SMIN-013");
assert.equal(minister.canonicalMcEvent,"MC-COM-160");
assert.equal(minister.authorityStatus,"CERTIFIED_PRIMARY_1962_RUBRIC");
assert.match(minister.actor,/DEACON/);
assert.match(minister.actor,/SUBDEACON/);

assert.equal(authority.negativeAuthority.effect,"REQUIEM_OVERLAY_SUPPRESSES_MC_COM_150_AND_MC_COM_160");

console.log("Solemn Pax authority: PASS — primary 1962 rubric pins MC-COM-160 and AO.SM.C0225 reader ownership.");
