import assert from "node:assert/strict";
import {normalizeFolioExperience,experiencePrayerRoute,mayOpenFolioPrayer} from "../src/mass/full-mass-folio-options.js";
assert.deepEqual(normalizeFolioExperience({}, "fr-FR"),{before:"none",after:"none",language:"fr"});
assert.deepEqual(normalizeFolioExperience({before:"prepare",after:"thanksgiving",language:"en"},"fr"),
  {before:"prepare",after:"thanksgiving",language:"en"});
assert.deepEqual(normalizeFolioExperience({before:"unknown",after:"unknown",language:"la"},"en"),
  {before:"none",after:"none",language:"en"});
assert.equal(experiencePrayerRoute("before"),"mass.prepare");
assert.equal(experiencePrayerRoute("after"),"mass.thanksgiving");
assert.equal(experiencePrayerRoute("unrecognized"),null);
assert.equal(mayOpenFolioPrayer("before",{before:"prepare"}),true);
assert.equal(mayOpenFolioPrayer("before",{before:"none"}),false);
assert.equal(mayOpenFolioPrayer("after",{after:"thanksgiving"}),true);
assert.equal(mayOpenFolioPrayer("after",{after:"none"}),false);
console.log("PASS: Folio language and Before/After choices stay finite and source-neutral");
