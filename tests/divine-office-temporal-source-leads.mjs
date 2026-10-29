import test from "node:test";
import assert from "node:assert/strict";
import {planTemporalOfficeLeads,planTemporalOfficeYear}
 from "../src/office/temporal-source-leads.js";
const paths=date=>planTemporalOfficeLeads(date).leads.map(l=>l.path);
test("Ash Wednesday, Lent I, Passion Sunday, Palm Sunday are distinct pinned keys",()=>{
 assert.ok(paths("2026-02-18").includes("Tempora/Quadp3-3"));
 assert.ok(paths("2026-02-22").includes("Tempora/Quad1-0"));
 assert.ok(paths("2026-03-22").includes("Tempora/Quad5-0"));
 assert.ok(paths("2026-03-29").includes("Tempora/Quad6-0"));
 assert.ok(paths("2026-04-03").includes("Tempora/Quad6-5"));
 assert.ok(planTemporalOfficeLeads("2026-04-03").uncertainties.includes(
  "TRIDUUM_SPECIAL_OFFICE_AND_TENEBRAE"));
});
test("Easter Sunday, Pentecost Sunday, Trinity Sunday derive source identities",()=>{
 assert.ok(paths("2026-04-05").includes("Tempora/Pasc0-0"));
 assert.ok(paths("2026-05-24").includes("Tempora/Pasc7-0"));
 assert.ok(paths("2026-05-31").includes("Tempora/Pent01-0"));
});
test("2026 after-Pentecost final Sunday uses Pent24 but not Pent26",()=>{
 assert.ok(paths("2026-11-22").includes("Tempora/Pent24-0"));
 assert.ok(!paths("2026-11-22").some(x=>/Pent(?:25|26|27|28)/.test(x)));
 assert.ok(planTemporalOfficeLeads("2026-11-15").uncertainties.includes(
  "RESUMED_EPIPHANY_SUNDAYS_AND_PRE_FINAL_POST_PENTECOST"));
});
test("2026 Septuagesima Sunday, Sexagesima and Quinquagesima source keys",()=>{
 assert.ok(paths("2026-02-01").includes("Tempora/Quadp1-0"));
 assert.ok(paths("2026-02-08").includes("Tempora/Quadp2-0"));
 assert.ok(paths("2026-02-15").includes("Tempora/Quadp3-0"));
});
test("Nativity and Epiphany date source keys are merely supplementary",()=>{
 assert.ok(paths("2026-12-26").includes("Tempora/Nat26"));
 assert.ok(paths("2026-01-01").includes("Tempora/Nat01"));
 assert.ok(paths("2026-01-14").includes("Tempora/Epi1-3"));
 assert.ok(!paths("2026-12-25").includes("Tempora/Nat25"));
});
test("the 2028 calendar varies with Easter and Advent, not hardcoded 2026 dates",()=>{
 const year=planTemporalOfficeYear(2028);
 assert.equal(year.civilDays,366);
 assert.equal(year.sourceTextFilesRead,0);
 assert.equal(year.appointedOffices,0);
 assert.equal(year.published,0);
 assert.equal(year.dates.length,366);
 assert.ok(year.totalCandidateKeys>200);
 assert.ok(Object.keys(year.families).length>=5);
 const leap=planTemporalOfficeLeads("2028-02-29");
 assert.equal(leap.status,"SOURCE_PATH_LEADS_NOT_LITURGICAL_APPOINTMENT");
});
test("source key lead never certifies a feast or produces liturgical text",()=>{
 const a=planTemporalOfficeLeads("2026-05-24");
 assert.ok(a.leads.length);
 assert.ok(a.leads.every(l=>l.officeAppointed===false&&
   l.rg91TablePosition===null&&l.sourceVariantSelected===false));
 assert.equal(a.anyOfficeTextRead,false);
 assert.equal(a.published,false);
 assert.equal(JSON.stringify(a).includes("Deus, qui"),false);
 assert.throws(()=>planTemporalOfficeLeads("2026-02-30"),
   /OFFICE_TEMPORAL_DATE_INVALID/);
});
