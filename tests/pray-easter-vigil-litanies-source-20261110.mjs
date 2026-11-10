import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {easterVigilTwoLitaniesStages,loadEasterVigilTwoLitanies,EASTER_VIGIL_PRAYER_DONOR_SOURCE_URL} from "../src/pray/easter-vigil-two-litanies.v1.js";
import {BATCH03_LITANY_EDITION_POLICY} from "../src/pray/litany-1962-use-policy.js";
const source=JSON.parse(readFileSync(new URL("../data/presentation/reader-easter-vigil.v1.json",import.meta.url),"utf8"));
const stages=easterVigilTwoLitaniesStages(source);
assert.equal(stages.length,7);
assert.deepEqual(stages.map(s=>s.rows.length),[24,24,24,20,20,20,20]);
assert.deepEqual(stages.map(s=>s.part),["I","I","I","I","II","II","II"]);
assert.equal(stages[0].r33RecordId,"EV-LIT1-400");
assert.equal(stages[4].r33RecordId,"EV-LIT2-600");
assert.equal(stages[4].scope,"AFTER_FONT_BAPTISMS_RENEWAL_AND_ASPERSION");
for(const language of [["lat","latin"],["en","english"],["fr","french"]]){
 const [srcKey,dstKey]=language;
 const expected=[source.bridge.litanyI[srcKey],source.bridge.litanyII[srcKey]]
  .flatMap(s=>s.split(/\r?\n/).filter(Boolean).map(row=>row.slice(2).trim()));
 const actual=stages.flatMap(s=>s.rows.map(r=>r[dstKey]));
 assert.equal(expected.length,152,"R33 "+srcKey+" must have all 152 rows");
 assert.deepEqual(actual,expected,"Every R33 donor character must survive to native Prayer "+srcKey);
 for(const stage of stages)for(const row of stage.rows)
  assert.equal(row.kind,row.ordinal%2===1?"VERSICLE":"RESPONSE");
}
const result=await loadEasterVigilTwoLitanies({fetcher:async url=>{
 assert.equal(url,EASTER_VIGIL_PRAYER_DONOR_SOURCE_URL);
 return {ok:true,json:async()=>source};
}});
assert.equal(result.printedEditionCertified,false);
assert.equal(result.ritualBaptismComplete,false);
assert.equal(result.sourceOwner,"R33_MASS_EASTER_VIGIL");
const truncated={...source,bridge:{...source.bridge,litanyII:{...source.bridge.litanyII,fr:source.bridge.litanyII.fr.split("\n").slice(0,-1).join("\n")}}};
assert.throws(()=>easterVigilTwoLitaniesStages(truncated),/wrong row count/);
const switched={...source,bridge:{...source.bridge,litanyI:{...source.bridge.litanyI,en:"℟. Wrong role\n"+source.bridge.litanyI.en.split("\n").slice(1).join("\n")}}};
assert.throws(()=>easterVigilTwoLitaniesStages(switched),/role\/order/);
assert.equal(BATCH03_LITANY_EDITION_POLICY.vigil.reader,"EXISTING_SPECIAL_MASS_OWNER");
assert.equal(BATCH03_LITANY_EDITION_POLICY.vigil.liturgical1962Certified,false);
assert.match(BATCH03_LITANY_EDITION_POLICY.vigil.prayerReader,/LOCAL_R33_TWO_DISTINCT_LITANY_PARTS/);
const reader=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const phrase of ["ensureEasterVigilTwoLitanies","renderEasterVigilTwoLitanies",
 "data-ao-easter-vigil-litanies","data-ao-vigil-rite-boundary",
 "data-ao-vigil-source-hold","data-p435930-vigil-lit-done",
 "if(LIT.use==='vigil')return renderEasterVigilTwoLitanies()"])
 assert.ok(reader.includes(phrase),"Missing R33 native Prayer behavior: "+phrase);
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
assert.ok(sw.includes("OFFLINE_CRITICAL_EASTER_VIGIL_LITANIES"));
assert.match(sw,/\.\.\.OFFLINE_CRITICAL_PRIVATE_LITANY,OFFLINE_CRITICAL_ROGATIONS_LATIN,OFFLINE_CRITICAL_EASTER_VIGIL_LITANIES/);
console.log("PASS both R33 original Easter Vigil Litanies: 92+60=152 source-exact bilingual lines per language (456 aligned rows); 7 distinct reading stages; actual baptism/font rites remain owned by Mass; no invented print certification.");
