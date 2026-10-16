import assert from "node:assert/strict";
import {
 SCRIPTURE_LINK_COUNTS,SCRIPTURE_LINKED_OBJECTS,scriptureLinkedObjectsForPassage
} from "../src/scripture/related-objects.js";
import {parseScriptureContext} from "../src/scripture/context.js";

assert.deepEqual(SCRIPTURE_LINK_COUNTS,{rosary:20,rosaryBead:190,novena:16,massFormation:18,prayer:8,station:9});
assert.equal(SCRIPTURE_LINKED_OBJECTS.length,261);
assert.equal(new Set(SCRIPTURE_LINKED_OBJECTS.map(x=>x.id)).size,261);
for(const x of SCRIPTURE_LINKED_OBJECTS){
 assert.ok(x.reference&&x.relation&&x.title.en&&x.title.fr,x.id);
 assert.deepEqual(parseScriptureContext(x.reference).passage,x.passage,x.id);
}
// Exact source-based verse intersection, not fuzzy theological relevance.
const hits=scriptureLinkedObjectsForPassage(parseScriptureContext("Luke 1:28").passage,{limit:100});
const ids=hits.map(x=>x.id);
assert.ok(ids.includes("rosary:joy1"));
assert.ok(ids.includes("rosaryBead:joy1:2"),"The individual Angelic Salutation bead must be discoverable");
assert.equal(SCRIPTURE_LINKED_OBJECTS.filter(x=>x.source==="rosaryBead").length,190);
assert.equal(SCRIPTURE_LINKED_OBJECTS.filter(x=>x.source==="rosaryBead"&&x.target?.bead>=1).length,190);
assert.equal(SCRIPTURE_LINKED_OBJECTS.some(x=>x.id==="rosaryBead:lum5:9"),false,"Council of Trent is not a Bible citation");
assert.ok(ids.includes("novena:annunciation"));
assert.ok(ids.includes("novena:immaculate_conception"));
assert.ok(ids.includes("prayer:foundations_hail_mary"));
assert.ok(!ids.includes("rosary:joy2"));
assert.ok(!ids.includes("massFormation:MFS01"));
assert.equal(scriptureLinkedObjectsForPassage(parseScriptureContext("Luke 1:28").passage,{limit:1}).length,1);
assert.deepEqual(scriptureLinkedObjectsForPassage(parseScriptureContext("Matthew 2:1").passage),[]);
assert.equal(SCRIPTURE_LINKED_OBJECTS.some(x=>x.id==="station:3"),false,
 "The first fall is a devotional scene, not a source-proven Gospel passage");
const typology=SCRIPTURE_LINKED_OBJECTS.find(x=>x.id==="novena:assumption");
assert.equal(typology.relation,"TYPOLOGICAL_READING_NOT_HISTORICAL_REPORT");
assert.equal(typology.target?.novenaId,"assumption");
const lastGospel=SCRIPTURE_LINKED_OBJECTS.find(x=>x.id==="massFormation:MFS16");
assert.equal(lastGospel.relation,"CONDITIONAL_RITE_CONTEXT");
assert.equal(lastGospel.target?.stageId,"MF08");
const prayer=SCRIPTURE_LINKED_OBJECTS.find(x=>x.id==="prayer:foundations_hail_mary");
assert.equal(prayer.relation,"COMPOSITE_DEVOTION");
console.log("PASS Scripture reverse index: 71 original edges + 190 canonical Rosary bead citations, source boundaries and traditional Stations held");
