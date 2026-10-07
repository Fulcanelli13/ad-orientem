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
  bell:{label:"ALTAR BELLS"},
  schola:{label:"Credo"},
});
assert.equal(keys.postureIconKey,"kneel");
assert.equal(keys.gestureIconKey,"gospel_crosses");
assert.equal(keys.responseIconKey,"response");
assert.equal(keys.priestVoiceIconKey,"priest_silent");
assert.equal(keys.priestPositionIconKey,"priest_gospel");
assert.equal(keys.priestActionIconKey,"priest_elevation","recovered frozen elevation art is not selected");
assert.equal(keys.bellIconKey,"bells","active altar-bell cue lost its frozen V4 icon");
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

const broken={...bank}; delete broken.priest_steps;
assert.equal(auditHostIconBank(broken).complete,false);
assert.ok(auditHostIconBank(broken).missing.includes("priest_steps"));

keys=iconKeysForReaderState({priestAction:{label:"GENUFLECTS"}});
assert.equal(keys.priestActionIconKey,null,"quarantined priest-genuflect binary must remain text-only");
keys=iconKeysForReaderState({priestAction:{label:"WASHES / PURIFIES"}});
assert.equal(keys.priestActionIconKey,"lavabo");
keys=iconKeysForReaderState({priestAction:{label:"INCENSES ALTAR"}});
assert.equal(keys.priestActionIconKey,"priest_incense_altar");
keys=iconKeysForReaderState({priestAction:{label:"BLESSES PEOPLE"}});
assert.equal(keys.priestActionIconKey,"blessing");
keys=iconKeysForReaderState({priestAction:{label:"GIVES COMMUNION"}});
assert.equal(keys.priestActionIconKey,"communion");
keys=iconKeysForReaderState({priestAction:{label:"UNMAPPED SOURCE ACTION"}});
assert.equal(keys.priestActionIconKey,null,"unmapped action guessed an unrelated icon");

console.log("reader icons: PASS — exact recovered V4 action/bell art is source-mapped; quarantined or unmapped actions fail closed.");
