import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {APPROVED_CLASS_I_2026,approvedClassIHeroForDate,approvedClassIHeroMarkup,approvedClassIHeroCss} from "../src/calendar/approved-class-i-heroes-2026.js";

test("all ten frozen date-specific approvals remain in their own collection",()=>{
 assert.equal(APPROVED_CLASS_I_2026.length,10);
 assert.equal(new Set(APPROVED_CLASS_I_2026.map(x=>x.date)).size,10);
 for(const row of APPROVED_CLASS_I_2026){
  assert.match(row.date,/^2026-\\d{2}-\\d{2}$/);
  assert.equal(row.editorialApproval,"APPROVED_DATE_SPECIFIC_2026-10-19");
  assert.ok(row.principalId?.includes(":1:"));
  assert.ok(row.title&&row.artist&&row.source&&row.artworkId);
  assert.equal(approvedClassIHeroForDate(row.date,row.principalId),row);
  assert.equal(approvedClassIHeroForDate(row.date,"unexpected:principal"),null);
  assert.ok(approvedClassIHeroMarkup(row.date,row.principalId).includes(row.artist));
  assert.equal(approvedClassIHeroMarkup(row.date.replace("2026","2027"),row.principalId),"");
 }
});

test("image publication is not implied by approval",()=>{
 const embargo=APPROVED_CLASS_I_2026.filter(x=>x.imagePublicationStatus==="HELD_SOURCE_REUSE_RIGHTS");
 assert.deepEqual(embargo.map(x=>x.date),["2026-10-25","2026-11-29"]);
 for(const row of embargo){
  assert.equal(row.image,null);
  assert.match(approvedClassIHeroMarkup(row.date,row.principalId),/pending reuse clearance/);
  assert.doesNotMatch(approvedClassIHeroMarkup(row.date,row.principalId),/<img/);
 }
 const previews=APPROVED_CLASS_I_2026.filter(x=>x.image);
 assert.equal(previews.length,8);
 for(const row of previews){
  assert.match(row.image,/^https:\\/\\/thumb.wikimedia.org\\/wikipedia\\/commons\\/thumb\\//);
  assert.match(row.imagePublicationStatus,/NOT_OFFLINE_CERTIFIED/);
 }
});

test("native Calendar owns the rendering; no mass-reader change",()=>{
 const calendar=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
 assert.match(calendar,/import \\{ approvedClassIHeroMarkup, approvedClassIHeroCss \\}/);
 assert.match(calendar,/approvedClassIHeroMarkup\\(selected, r\\?\\.day\\?\\.main\\?\\.id, fr\\(\\)\\)/);
 assert.match(calendar,/\\$\\{approvedClassIHeroCss\\}/);
 assert.match(approvedClassIHeroCss,/aoClassIApprovedHero/);
});
