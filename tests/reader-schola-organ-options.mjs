import assert from "node:assert/strict";
import {organAuthorityForScholaEvent} from "../src/mass/reader-schola-event-timeline.js";
const event={id:"OFFERTORY_ORGAN_OPTION",kind:"ORGAN_OPTION"};
const none=organAuthorityForScholaEvent(event,{});
assert.equal(none.status,"REQUIRES_CONTEXT");
assert.equal(none.actuallyPlaying,"UNKNOWN");
const ordinary={provenance:{organ1962:{verified:true,source:"LITURGICAL_PLAN_1962",season:"ORDINARY"}}};
const permitted=organAuthorityForScholaEvent(event,ordinary);
assert.equal(permitted.status,"SOLO_POTENTIALLY_PERMITTED");
assert.equal(permitted.solo,"PERMITTED_NOT_OBSERVED");
assert.equal(permitted.actuallyPlaying,"UNKNOWN");
assert.equal(permitted.precision,"SOURCE_SECTION_NOT_EXACT_PRIEST_CUE");
const advent={provenance:{organ1962:{verified:true,source:"LITURGICAL_PLAN_1962",season:"ADVENT"}}};
const restricted=organAuthorityForScholaEvent(event,advent);
assert.equal(restricted.status,"SOLO_FORBIDDEN");
assert.equal(restricted.accompaniment,"ACCOMPANIMENT_ONLY_NOT_OBSERVED");
const requiem=organAuthorityForScholaEvent(event,{overlays:["REQUIEM"]});
assert.equal(requiem.status,"SOLO_FORBIDDEN");
assert.equal(requiem.accompaniment,"ACCOMPANIMENT_ONLY_NOT_OBSERVED");
const fake=organAuthorityForScholaEvent(event,{provenance:{organ1962:{
 verified:false,source:"LITURGICAL_PLAN_1962",season:"EASTER"}}});
assert.equal(fake.status,"REQUIRES_CONTEXT");
const doubtful=organAuthorityForScholaEvent(event,{provenance:{organ1962:{
 verified:true,source:"UNVERIFIED",season:"ORDINARY"}}});
assert.equal(doubtful.status,"REQUIRES_CONTEXT");
const holy={provenance:{organ1962:{verified:true,source:"LITURGICAL_PLAN_1962",season:"LENT",triduum:true}}};
assert.equal(organAuthorityForScholaEvent(event,holy).status,"REQUIRES_EXACT_RITE_STAGE");
assert.equal(organAuthorityForScholaEvent({id:"SANCTUS",kind:"CHANT"},ordinary),null);
const amended={provenance:{organ1962:{verified:true,source:"LITURGICAL_PLAN_1962",season:"LENT",
 exceptionalFeastConfirmed:true}}};
assert.equal(organAuthorityForScholaEvent(event,amended).status,"SOLO_POTENTIALLY_PERMITTED");
assert.equal(organAuthorityForScholaEvent(event,{provenance:{organ1962:{
 verified:true,source:"LITURGICAL_PLAN_1962",season:"LENT"}}}).status,"SOLO_FORBIDDEN");
console.log("PASS organ event permissions use existing 1958 authority, fail closed for unverified and Triduum stages");
