import test from "node:test";
import assert from "node:assert/strict";
import {buildAnnualOfficeReadiness,ANNUAL_OFFICE_HOURS,ANNUAL_OFFICE_LANGUAGES}
  from "../src/office/annual-readiness-register.js";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {parseReadinessArgs} from "../scripts/office/build-annual-readiness-register.mjs";
const probe=(records)=>({
  schema:"ao.office.engine-probe-manifest.v1",sourceRevision:DIVINUM_OFFICIUM_PIN,
  researchOnly:true,publicReaderEnabled:false,counts:{published:0},records
});
const raw=(date="2026-10-28",hour="VESPERS",language="fr")=>({
  date,hour,language,envelopePass:true,status:"CAPTURED_UNVERIFIED",
  sha256:"a".repeat(64),compositionVerified:false,
  languageCompletenessVerified:false,printedBreviaryCertified:false,
  publishable:false
});
test("2026 full-year register has exactly 8,760 unverified slots and zero approvals",()=>{
  const d=buildAnnualOfficeReadiness({year:2026});
  assert.equal(d.summary.civilDays,365);
  assert.equal(d.summary.planned,8760);
  assert.equal(d.rows.length,8760);
  assert.equal(new Set(d.rows.map(r=>r.key)).size,8760);
  assert.equal(d.summary.notGenerated,8760);
  assert.equal(d.summary.rawCaptured,0);
  assert.equal(d.summary.liturgicallyCertified,0);
  assert.equal(d.summary.approved,0);
  assert.equal(d.summary.published,0);
  assert.equal(d.release.canPublish,false);
  assert.equal(d.release.publicRouteEnabled,false);
  assert.equal(d.exceptions.allYearDiscrepanciesActuallyChecked,false);
  assert.deepEqual(ANNUAL_OFFICE_HOURS,["MATINS","LAUDS","PRIME","TERCE","SEXT","NONE","VESPERS","COMPLINE"]);
  assert.deepEqual(ANNUAL_OFFICE_LANGUAGES,["la","en","fr"]);
  assert.ok(d.rows.every(r=>!r.officePrecedenceVerified&&!r.independentPrintedTextVerified&&
    !r.translationVerified&&!r.rightsReviewed&&!r.approved&&!r.published));
  const known=d.exceptions.knownBlockingRows;
  assert.ok(known.some(r=>r.key==="2026-11-02|PRIME|en"&&
    r.flags.includes("KNOWN_ALL_SOULS_PRIME_EN_RECIPIENT_SCOPE_MISMATCH")));
  assert.ok(known.some(r=>r.key==="2026-11-01|VESPERS|fr"&&
    r.flags.includes("KNOWN_PINNED_FR_VESPERS_SUNDAY_COMM_MISSING_CANDIDATE_UNPUBLISHED")));
  const sunday=d.rows.find(r=>r.key==="2026-11-01|VESPERS|la");
  assert.ok(sunday.reviewFlags.includes("SECOND_VESPERS_COMMEMORATIONS_REQUIRE_OFFICE_ORDO"));
  assert.ok(sunday.calendarMajorDayCandidates.includes("All Saints"));
  const saturday=d.rows.find(r=>r.key==="2026-10-31|VESPERS|fr");
  assert.ok(saturday.reviewFlags.includes("FIRST_VESPERS_CONCURRENCE_REQUIRES_OFFICE_ORDO"));
});
test("2028 leap-year inventory contains February 29, all eight hours and three languages",()=>{
  const d=buildAnnualOfficeReadiness({year:2028});
  assert.equal(d.summary.civilDays,366);
  assert.equal(d.summary.planned,8784);
  const leap=d.rows.filter(x=>x.date==="2028-02-29");
  assert.equal(leap.length,24);
  assert.equal(new Set(leap.map(x=>x.hour)).size,8);
  assert.equal(new Set(leap.map(x=>x.language)).size,3);
  assert.equal(d.summary.liturgicallyCertified,0);
  assert.equal(d.summary.published,0);
});
test("one actual pinned XHTML probe increments raw coverage ONLY, not certification",()=>{
  const d=buildAnnualOfficeReadiness({year:2026,probeManifests:[probe([raw()])]});
  assert.equal(d.summary.rawCaptured,1);
  assert.equal(d.summary.notGenerated,8759);
  assert.equal(d.summary.datesWithAnyRawEvidence,1);
  assert.equal(d.summary.byHour.VESPERS.rawCaptured,1);
  assert.equal(d.summary.byLanguage.fr.rawCaptured,1);
  const row=d.rows.find(x=>x.key==="2026-10-28|VESPERS|fr");
  assert.equal(row.state,"RAW_CAPTURED_UNVERIFIED");
  assert.equal(row.rawCaptureSha256,"a".repeat(64));
  assert.equal(row.structureVerified,false);
  assert.equal(row.approved,false);
  assert.equal(d.summary.liturgicallyCertified,0);
  assert.equal(d.summary.published,0);
});
test("failed source envelopes never count as captured evidence",()=>{
  const d=buildAnnualOfficeReadiness({year:2026,
    probeManifests:[probe([{...raw(),envelopePass:false,status:"CAPTURE_FAILED"}])]});
  assert.equal(d.summary.rawCaptured,0);
});
test("untrusted, falsely certified, duplicate or wrong-revision probe evidence fails closed",()=>{
  for(const bad of [
    probe([{...raw(),publishable:true}]),
    probe([{...raw(),compositionVerified:true}]),
    probe([{...raw(),printedBreviaryCertified:true}]),
    probe([{...raw(),languageCompletenessVerified:true}]),
    probe([{...raw(),sha256:"invalid"}]),
    probe([{...raw(),hour:"MASS"}]),
    probe([raw(),raw()]),
    {...probe([raw()]),sourceRevision:"unpinned"},
    {...probe([raw()]),publicReaderEnabled:true}
  ])assert.throws(()=>buildAnnualOfficeReadiness({year:2026,probeManifests:[bad]}),
    /OFFICE_REGISTER_/);
});
test("no arbitrary years and invalid CLI argument combinations",()=>{
  for(const year of [1899,2101,2026.5,NaN,"2026"])
    assert.throws(()=>buildAnnualOfficeReadiness({year}),/YEAR_INVALID/);
  assert.deepEqual(parseReadinessArgs(["--year","2026","--out","/tmp/office"]),
    {year:2026,out:"/tmp/office",probe:null,ledger:null});
  assert.throws(()=>parseReadinessArgs(["--year","2026"]),/YEAR_OUTPUT_REQUIRED/);
  assert.throws(()=>parseReadinessArgs(["--year","2026","--out","/tmp","--out","/foo"]),
    /ARGS_INVALID/);
});


test("historical metadata ledger flag is accepted as CLI input, never as an approval",()=>{
  const cli=parseReadinessArgs(["--year","2026","--out","/tmp/office",
    "--ledger-file","/tmp/2026-capture-45.json"]);
  assert.equal(cli.ledger,"/tmp/2026-capture-45.json");
  assert.equal(cli.probe,null);
});
