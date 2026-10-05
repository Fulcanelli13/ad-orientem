import assert from "node:assert/strict";
import { R17_ICON_KEYS, iconKeysForReaderState, createHostIconResolver, auditHostIconBank } from "../src/mass/reader-icons.js";
import { R17_PRODUCTION_ICON_ASSETS, R17_PRODUCTION_ICON_BANK_VERSION } from "../src/mass/reader-icon-assets-v4-8.js";

const required=auditHostIconBank({}).required;
const bank=Object.fromEntries(required.map(key=>[key,"data:image/svg+xml;base64,"+Buffer.from("<svg/>").toString("base64")]));
const audit=auditHostIconBank(bank);
assert.equal(audit.complete,true);
assert.deepEqual(audit.missing,[]);

const productionAudit=auditHostIconBank(R17_PRODUCTION_ICON_ASSETS);
assert.equal(productionAudit.complete,true,"repository production icon bank is incomplete");
assert.deepEqual(productionAudit.missing,[]);
assert.match(R17_PRODUCTION_ICON_BANK_VERSION,/^4\.8\.0\+/);

const resolve=createHostIconResolver({assets:bank});
assert.match(resolve("stand"),/^data:image/);
assert.equal(resolve("missing"),null);

let keys=iconKeysForReaderState({
  posture:{value:"KNEEL"},
  gesture:{type:"GOSPEL_CROSSES"},
  response:{text:"Amen"},
  priestVoice:{value:"LOW_VOICE"},
  priestPosition:{station:"ALTAR_GOSPEL_MISSAL"},
  schola:{label:"Credo"},
});
assert.equal(keys.postureIconKey,"kneel");
assert.equal(keys.gestureIconKey,"gospel_crosses");
assert.equal(keys.responseIconKey,"response");
assert.equal(keys.priestVoiceIconKey,"priest_silent");
assert.equal(keys.priestActionIconKey,"priest_gospel");
assert.equal(keys.scholaIconKey,"schola");

keys=iconKeysForReaderState({
  posture:{label:"STAND"},
  gesture:{label:"Bow the head"},
  priestVoice:{label:"AUDIBLE"},
  priestPosition:{station:"FOOT_CENTER"},
});
assert.equal(keys.postureIconKey,R17_ICON_KEYS.posture.STAND);
assert.equal(keys.gestureIconKey,"head_bow");
assert.equal(keys.priestVoiceIconKey,"priest_audible");
assert.equal(keys.priestActionIconKey,"priest_foot");

const broken={...bank}; delete broken.priest_steps;
assert.equal(auditHostIconBank(broken).complete,false);
assert.ok(auditHostIconBank(broken).missing.includes("priest_steps"));

console.log("reader icons: PASS — native state maps to repository-owned approved bank and missing assets fail closed.");
