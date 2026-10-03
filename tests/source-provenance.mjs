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
