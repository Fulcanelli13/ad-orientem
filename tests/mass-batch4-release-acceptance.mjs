import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const root=new URL("../",import.meta.url);
const text=path=>readFileSync(new URL(path,root),"utf8");
const json=path=>JSON.parse(text(path));
const pkg=json("package.json"),release=json("data/presentation/reader-release-gate.v1.json");
const workflow=text(".github/workflows/r17-mass-convergence.yml");
const phoneDefault=text("tests/reader-phone-production-card-default.mjs");
const curated=text("tests/reader-phone-curated65.mjs");
const phoneMain=text("tests/reader-phone-acceptance.mjs");
const grid=text("tests/mass-form-special-integration.mjs");
const entry=text("src/mass/reader-native-preview.js");
const formState=json("data/presentation/reader-form-state.v1.json");
const claim=(ok,msg)=>assert(ok,msg);
claim(release.productionDefault==="R17_NATIVE","Native reader is not production default");
claim(release.status==="FINAL_NATIVE_READY","Release registry is not ready");
claim(Array.isArray(release.openBlockers)&&release.openBlockers.length===0,"Existing registry reports code blockers");
// The current release presentation has 64 prayer cards, uniting Sanctus and Benedictus. The 48-card state is
// explicitly an older rollback and cannot serve as the only release evidence.
for(const [name,needle] of [["63 ordinary","cards:64,visible:63"],["64 optional","cards:64,visible:64"],["48 rollback","cards:48,visible:48"]])
 claim(phoneDefault.includes(needle),"Production default browser acceptance missing "+name);
claim(phoneDefault.includes("production=1"),"Phone test is not exercising production entry");
claim(phoneDefault.includes("aoLiveCards=48"),"Rollback 48 not explicitly identified");
claim(curated.includes("walked.visited.length,expectedVisible"),"Curated full-card rehearsal missing");
claim(curated.includes("walked.defects,[]"),"Curated traversal defect assertion missing");
claim(curated.includes("independentPriest.scholaUnchanged,true"),"Independent priest/Schola test missing");
claim(curated.includes("secondConfiteor:true"),"Optional second Confiteor not exercised");
for(const width of ["width:320","width:390","width:768"])
 claim(curated.includes(width),"Curated device-size evidence missing "+width);
claim(phoneMain.includes("AO.CANON.06"),"Consecration focal tests missing");
claim(phoneMain.includes("ELEVATION BELL"),"Host elevation bell gate missing");
claim(formState.low.canonicalCueCount===275&&formState.low.cueStates.length===275,"Low cue source changed");
claim(formState.solemn.sacredMinisterDeltaCount===19,"Solemn minister delta changed");
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"])
 claim(grid.includes(form),"Missing form acceptance "+form);
for(const family of ["ASPERGES","PALM","ASH","CANDLEMAS","ROGATIONS",
 "GOOD_FRIDAY","EASTER_VIGIL","REQUIEM_ABSOLUTION","CORPUS_CHRISTI_PROCESSION",
 "HOLY_THURSDAY_POST","GENERIC_PROCESSION","NUPTIAL"])
 claim(existsSync(new URL("tests/"+(family==="NUPTIAL"?"app-shell-nuptial-e2e.mjs":family==="EASTER_VIGIL"?"app-shell-easter-vigil-e2e.mjs":"app-shell-final-e2e.mjs"),root)),
 "Missing real-shell special-rite script "+family);
for(const [name,script] of Object.entries({
 production:"node tests/reader-phone-production-card-default.mjs",
 curated:"npm run test:phone-curated65",
 realShell:"node tests/app-shell-final-e2e.mjs",
 nuptial:"node tests/app-shell-nuptial-e2e.mjs",
 vigil:"node tests/app-shell-easter-vigil-e2e.mjs",
 rails:"npm run test:reader-live-rails-phone",
 priest:"npm run test:priest-chant-phone",
 entrance:"npm run test:priest-entrance-phone"
}))claim(pkg.scripts["test:phone"]?.includes(script)||workflow.includes(script),
 "Production phone CI misses "+name+": "+script);
claim(pkg.scripts["test"]?.includes("npm run test:mass-integration-grid"),"Four-form integration matrix is absent from Node CI");
claim(workflow.includes("phone-browser:")&&workflow.includes("curated65-phone:"),
 "R17 CI lacks independent default and curated phone jobs");
claim(entry.includes("observePriestEvent")&&entry.includes("observePriestReverence"),"Independent observation APIs missing");
claim(pkg.scripts["check:reader-release"]?.includes("reader-release-certification"),
 "Release gate script missing");
console.log("PASS Batch 4 release automation contract: curated 63/64 production, explicit 48 rollback, Low/Sung/Solemn, holy-day paths, priest/Schola, icons/rail and phone gates. Physical-device acceptance is NOT certified.");
