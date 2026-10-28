import assert from "node:assert/strict";
import {
 defaultPersonalDailyPrefs, personalDailyOptions,
 buildPersonalDailyPlan, changePersonalDailyPrefs,
 normalizePersonalDailyPrefs
} from "../src/pray/daily-personal-rule.js";
import {reviewedDailyPurpose} from "../src/pray/daily-stage-alternative-review.js";
import {prayerAcquisitionCandidates} from "../src/pray/prayer-acquisition-historical-witnesses.v1.js";

const enID="ignatius_suscipe_lasance_1908_en";
const laID="ignatius_suscipe_lasance_1908_la";
const enOptions=personalDailyOptions("morning","en");
const laOptions=personalDailyOptions("morning","la");
const frOptions=personalDailyOptions("morning","fr");
assert.ok(enOptions.some(x=>x.id===enID&&x.text.startsWith("Take, O Lord")));
assert.ok(laOptions.some(x=>x.id===laID&&x.text.startsWith("Suscipe, Domine")));
assert.ok(!frOptions.some(x=>x.id.startsWith("ignatius_suscipe_lasance")));
assert.ok(!personalDailyOptions("evening","en").some(x=>x.id===enID));
assert.equal(prayerAcquisitionCandidates("self_offering",{language:"fr"}).length,0);
assert.equal(reviewedDailyPurpose(enID,"morning","offering")?.scope,"narrower");
assert.equal(reviewedDailyPurpose(laID,"morning","offering")?.scope,"narrower");
assert.equal(reviewedDailyPurpose(enID,"evening","offering"),null);
assert.equal(reviewedDailyPurpose(enID,"morning","thanksgiving"),null);
for(const language of ["en","la"]){
 const id=language==="en"?enID:laID;
 const defaultPrefs=defaultPersonalDailyPrefs(language);
 const unselected=buildPersonalDailyPlan({daypart:"morning",prefs:defaultPrefs});
 const baseline=unselected.rows.find(x=>x.sourceId==="daily-prayer");
 assert.ok(baseline&&baseline.text);
 assert.ok(unselected.purposeChoices.find(x=>x.purpose==="offering").options.some(x=>x.id===id));
 const choice=changePersonalDailyPrefs(defaultPrefs,{action:"purpose",daypart:"morning",value:id});
 assert.equal(choice.purposeSelections.morning.offering,id);
 const saved=normalizePersonalDailyPrefs(JSON.parse(JSON.stringify(choice)),language);
 assert.equal(saved.purposeSelections.morning.offering,id);
 const selected=buildPersonalDailyPlan({daypart:"morning",prefs:saved});
 assert.equal(selected.selectedPurposes.offering,id);
 assert.equal(selected.rows.find(x=>x.sourceId==="daily-prayer").text,baseline.text,
  "A source-specific offering must never replace the full Pius X opening");
 const later=changePersonalDailyPrefs(saved,{action:"purpose",daypart:"morning",value:"none:offering"});
 assert.ok(!later.purposeSelections.morning.offering);
 const foreign=normalizePersonalDailyPrefs({...saved,language:"fr"},"fr");
 const fr=buildPersonalDailyPlan({daypart:"morning",prefs:foreign});
 assert.ok(!fr.selectedPurposes.offering);
 assert.ok(!fr.purposeChoices.flatMap(x=>x.options).some(x=>x.id===id));
}
assert.ok(!personalDailyOptions("morning","en").some(x=>x.id.includes("concede_mihi")));
assert.ok(!personalDailyOptions("morning","en").some(x=>x.id.includes("prayer_before_meditation")));
console.log("1908 Suscipe EN/LA: in one-tap Morning Offering with unchanged Pius X original, storage-safe choice and no French fallback PASS");
