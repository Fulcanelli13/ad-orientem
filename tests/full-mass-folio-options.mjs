import assert from "node:assert/strict";
import {normalizeFolioExperience,experiencePrayerRoute,experiencePrayerDepth,mayOpenFolioPrayer} from "../src/mass/full-mass-folio-options.js";
assert.deepEqual(normalizeFolioExperience({}, "fr-FR"),{before:"none",after:"none",language:"fr"});
assert.deepEqual(normalizeFolioExperience({before:"prepare",after:"thanksgiving",language:"en"},"fr"),
  {before:"prepare",after:"thanksgiving",language:"en"});
assert.deepEqual(normalizeFolioExperience({before:"unknown",after:"unknown",language:"la"},"en"),
  {before:"none",after:"none",language:"en"});
assert.equal(experiencePrayerRoute("before"),"mass.prepare");
assert.equal(experiencePrayerRoute("after"),"mass.thanksgiving");
assert.equal(experiencePrayerRoute("unrecognized"),null);
assert.equal(mayOpenFolioPrayer("before",{before:"prepare"}),true);
assert.equal(experiencePrayerDepth("before",{before:"prepare"}),"brief");
assert.equal(experiencePrayerDepth("before",{before:"full"}),"full");
assert.equal(experiencePrayerDepth("before",{before:"none"}),null);
assert.equal(experiencePrayerDepth("after",{after:"thanksgiving"}),"brief");
assert.equal(experiencePrayerDepth("after",{after:"full"}),"full");
assert.equal(experiencePrayerDepth("after",{after:"none"}),null);
assert.equal(experiencePrayerDepth("unknown",{before:"full"}),null);
assert.deepEqual(normalizeFolioExperience({before:"full",after:"full",language:"fr"}),{before:"full",after:"full",language:"fr"});
assert.equal(mayOpenFolioPrayer("before",{before:"none"}),false);
assert.equal(mayOpenFolioPrayer("after",{after:"thanksgiving"}),true);
assert.equal(mayOpenFolioPrayer("after",{after:"none"}),false);
console.log("PASS: Folio language, brief/full prayer depths and Proper-neutrality remain source-locked");
