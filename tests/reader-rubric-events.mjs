import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createReaderRubricEventController,
  validateReaderRubricEvents,
} from "../src/mass/reader-rubric-events.js";
import { iconKeysForReaderState } from "../src/mass/reader-icons.js";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const data=load("../data/presentation/reader-rubric-events.v1.json");
const frozenActions=load("../data/presentation/reader-priest-actions.v1.json");

const audit=validateReaderRubricEvents(data);
assert.equal(audit.schema,"ao-reader-rubric-events-v1");
assert.equal(audit.itemCount,57);
assert.equal(audit.sourceCount,2);
assert.ok(audit.primaryPriestCueCount>20);
assert.equal(data.invariants.primaryAuthority,"ROMAN_MISSAL_1962");
assert.equal(data.invariants.campionRole,"DISCOVERY_AND_EXPLANATORY_PROVENANCE_ONLY");
assert.equal(data.invariants.canonicalTextMutationAllowed,false);
assert.equal(data.invariants.frozenDonorRegistryMutationAllowed,false);
assert.equal(data.invariants.cardStructureMutationAllowed,false);

const controller=createReaderRubricEventController({data});
assert.equal(controller.supported,true);

const gloria=controller.project("AO.SM.C0058");
assert.equal(gloria.primaryPriestAction.label,"BOWS HEAD");
assert.equal(gloria.primaryPriestAction.trigger,"Gratias agimus tibi");
assert.equal(gloria.primaryPriestAction.iconKey,"head_bow");
assert.deepEqual(gloria.primaryPriestAction.sources,["MR62_RITUS"]);
assert.ok(gloria.primaryPriestAction.campionPages.includes(26));

const chaliceOffering=controller.project("AO.SM.C0115");
assert.deepEqual(chaliceOffering.events.map(x=>x.label),[
  "CROSSES WITH CHALICE","PLACES CHALICE","COVERS CHALICE"
]);
assert.equal(chaliceOffering.primaryPriestAction.label,"CROSSES WITH CHALICE");

const hostElevation=controller.project("AO.SM.C0174");
assert.deepEqual(hostElevation.events.map(x=>x.label),[
  "GENUFLECTS",
  "ELEVATES HOST",
  "ELEVATION BELL · HOST",
  "REPLACES HOST",
  "GENUFLECTS",
  "THUMB AND INDEX FINGERS REMAIN JOINED",
]);
assert.equal(hostElevation.primaryPriestAction.label,"ELEVATES HOST");
assert.equal(hostElevation.events.find(x=>x.kind==="BELL").actor,"SERVER");
assert.equal(hostElevation.events.find(x=>x.kind==="BELL").presentationOwner,"reader-transients");
assert.equal(hostElevation.activeStates.THUMB_INDEX_JOINED.value,true);

assert.equal(controller.project("AO.SM.C0204").activeStates.THUMB_INDEX_JOINED.value,true);
assert.equal(controller.project("AO.SM.C0247").activeStates.THUMB_INDEX_JOINED.value,true);
assert.equal(controller.project("AO.SM.C0248").activeStates.THUMB_INDEX_JOINED,undefined,
  "finger discipline did not terminate at the ablutions");

const living=controller.project("AO.SM.C0155");
assert.equal(living.primaryPriestAction.label,"REMEMBERS THE LIVING");
const dead=controller.project("AO.SM.C0193");
assert.equal(dead.primaryPriestAction.label,"REMEMBERS THE DEAD");

const blessingPrep=controller.project("AO.SM.C0263");
assert.deepEqual(blessingPrep.events.map(x=>x.label),[
  "RAISES EYES AND HANDS","JOINS HANDS","BOWS HEAD TO CROSS"
]);

const icon=iconKeysForReaderState({priestAction:gloria.primaryPriestAction});
assert.equal(icon.priestActionIconKey,"head_bow",
  "rubric overlay exact icon key was not preserved");

assert.equal(frozenActions.items.length,77,
  "Campion overlay must not modify the frozen 77-row priest-action registry");
assert.equal(frozenActions.source.sha256,
  "2f091b2f099387cbd709cadd78aff5c25ca1d4152ad0af18083edf301609891f",
  "frozen donor source hash changed");

const noData=createReaderRubricEventController();
assert.equal(noData.supported,false);
assert.equal(noData.project("AO.SM.C0174").primaryPriestAction,null);

console.log("reader rubric events: PASS — multi-action 1962 overlay enriches priest cues without mutating frozen donor/card authority.");
