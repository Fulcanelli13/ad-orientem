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
  priestAction:{label:"ELEVATES HOST"},
  schola:{label:"Credo"},
});
assert.equal(keys.postureIconKey,"kneel");
assert.equal(keys.gestureIconKey,"gospel_crosses");
assert.equal(keys.responseIconKey,"response");
assert.equal(keys.priestVoiceIconKey,"priest_silent");
assert.equal(keys.priestPositionIconKey,"priest_centre");
assert.equal(keys.priestActionIconKey,"priest_elevate_host_rich","recovered v4.6 Host elevation art is not wired");
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
assert.equal(keys.priestActionIconKey,null,"position-only state must remain action-art free");

const broken={...bank}; delete broken.priest_ascending_rich;
assert.equal(auditHostIconBank(broken).complete,false);
assert.ok(auditHostIconBank(broken).missing.includes("priest_ascending_rich"));

keys=iconKeysForReaderState({priestPosition:{station:"ALTAR_CENTER",facing:"PEOPLE"}});
assert.equal(keys.priestPositionIconKey,"priest_facing_people","top PRIEST position ignored facing-people state");

keys=iconKeysForReaderState({priestAction:{label:"GENUFLECTS"}});
assert.equal(keys.priestActionIconKey,"priest_genuflect");
keys=iconKeysForReaderState({priestAction:{label:"WASHES / PURIFIES"}});
assert.equal(keys.priestActionIconKey,"lavabo");
keys=iconKeysForReaderState({priestAction:{label:"UNMAPPED SOURCE ACTION"}});
assert.equal(keys.priestActionIconKey,null,"unmapped action guessed an unrelated icon");

console.log("reader icons: PASS — v1.77 plain position pictograms and exact v4.6 rich action art remain separately owned.");
