import assert from "node:assert/strict";
import {
  R17_ICON_KEYS,
  R17_FROZEN_ACTIVE_ICON_KEYS,
  R17_FROZEN_EXCLUDED_ICON_KEYS,
  iconKeysForReaderState,
  createHostIconResolver,
  auditHostIconBank,
} from "../src/mass/reader-icons.js";

const required=auditHostIconBank({}).required;
const bank=Object.fromEntries(required.map(key=>[key,"data:image/svg+xml;base64,"+Buffer.from("<svg/>").toString("base64")]));
const audit=auditHostIconBank(bank);
assert.equal(audit.complete,true);
assert.deepEqual(audit.missing,[]);
assert.deepEqual(audit.required,[...R17_FROZEN_ACTIVE_ICON_KEYS]);
assert.deepEqual(audit.excluded,[...R17_FROZEN_EXCLUDED_ICON_KEYS]);
for(const key of R17_FROZEN_EXCLUDED_ICON_KEYS)assert.equal(bank[key],undefined,
  key+" unexpectedly became a mandatory frozen asset");

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
assert.equal(keys.priestPositionIconKey,"priest_gospel");
assert.equal(keys.priestActionIconKey,null,"priest position must not masquerade as transient action art");
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
assert.equal(keys.priestPositionIconKey,"priest_foot");
assert.equal(keys.priestActionIconKey,null);

const broken={...bank}; delete broken.priest_steps;
assert.equal(auditHostIconBank(broken).complete,false);
assert.ok(auditHostIconBank(broken).missing.includes("priest_steps"));

console.log("reader icons: PASS — position and action ownership are separated; missing action art fails closed.");
