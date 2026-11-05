import assert from "node:assert/strict";
import {compareIckspScheduleSnapshots} from "../tools/directory/report-icksp-live-schedule-drift.mjs";
const mk=(ids)=>({records:ids.map(schedule_id=>({schedule_id}))});
const baseline=mk(["a","b","c","d"]);
const current=mk(["a","c","new"]);
const delta=compareIckspScheduleSnapshots(baseline,current,{checkedAt:"2026-11-05T12:00:00Z"});
assert.equal(delta.schema,"AO_ICKSP_LIVE_SCHEDULE_DRIFT_REVIEW_V1");
assert.deepEqual(delta.missing_baseline_schedule_ids,["b","d"]);
assert.deepEqual(delta.new_live_schedule_ids,["new"]);
assert.equal(delta.baseline_count,4);
assert.equal(delta.live_count,3);
assert.equal(delta.drift_detected,true);
assert.equal(delta.publication_authorized,false);
assert.equal(delta.source_identity_diff_requires_review,true);
assert.equal(delta.recheck_required,true);
const renamed=compareIckspScheduleSnapshots(
 mk(["ao-schedule-old-address-0-1","ao-schedule-unchanged-1-1"]),
 mk(["ao-schedule-new-address-0-1","ao-schedule-unchanged-1-1"])
);
assert.deepEqual(renamed.same_source_slot_identity_changes,[{
 source_slot:"0",old_id:"ao-schedule-old-address-0-1",
 new_id:"ao-schedule-new-address-0-1",
}]);
assert.deepEqual(renamed.unmatched_baseline_ids,[]);
assert.deepEqual(renamed.unmatched_live_ids,[]);
assert.equal(renamed.drift_detected,true,"Even a same-source renamed ID requires review");
const exact=compareIckspScheduleSnapshots(baseline,baseline);
assert.equal(exact.drift_detected,false);
assert.deepEqual(exact.missing_baseline_schedule_ids,[]);
assert.deepEqual(exact.new_live_schedule_ids,[]);
console.log("PASS ICKSP schedule drift produces review-only exact source identity delta and does not approve missing Mass times");
