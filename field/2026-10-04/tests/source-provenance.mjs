import fs from "node:fs";
import assert from "node:assert/strict";
import {
  assertProductionSourceProvenance,
  auditProductionSourceProvenance,
  isProductionAuthorityUrl,
} from "../src/mass/source-provenance.js";

assert.equal(isProductionAuthorityUrl("https://categpt.chat/es/santo/example"),false);
assert.equal(isProductionAuthorityUrl("https://missale.online/example"),true);

const bad={
  slots:{
    secret:{sourceUrl:"https://categpt.chat/es/santo/example"},
    communion:{sourceRef:"https://categpt.chat/es/santo/example"},
  }
};
const audit=auditProductionSourceProvenance(bad);
assert.equal(audit.pass,false);
assert.equal(audit.issues.length,2);
assert.throws(()=>assertProductionSourceProvenance(bad),/categpt\.chat/);

const good={
  slots:{gospel:{sourceUrl:"https://missale.online/example"}},
  orations:{collectSet:[{sourceRef:"PRIMARY_FIXTURE"}]}
};
assert.equal(assertProductionSourceProvenance(good).pass,true);

console.log("production source provenance quarantine: PASS");

const witnesses=JSON.parse(fs.readFileSync(new URL("../data/mass/golden-proper-witnesses.v1.json", import.meta.url),"utf8"));
assert.equal(witnesses.status,"CERTIFIED_REPLACEMENT_WITNESSES");
assert.equal(witnesses.fixture.id,"2026-10-04_XIX_POST_PENTECOSTEN");
assert.equal(witnesses.fixture.slots.length,3);
assert.deepEqual(witnesses.fixture.slots.map(x=>x.blockId),["AO.SM.B040","AO.SM.B085","AO.SM.B088"]);
assert.equal(isProductionAuthorityUrl(witnesses.fixture.sourceUrl),true);
assert.equal(witnesses.fixture.slots.every(x=>x.witness && x.productionBlocker!==true),true);
console.log("golden Proper replacement provenance: PASS");
