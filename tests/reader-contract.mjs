import fs from "node:fs";
import path from "node:path";
import {
  HARDENED_CROSS_CUES,
  resolveReaderPreferences,
  resolvePosture,
  resolveMomentState,
  makeGuideState,
  dialogueLanguagePolicy,
} from "../src/mass/reader-state.js";

const root=process.cwd();
const contract=JSON.parse(fs.readFileSync(path.join(root,"data/presentation/reader-contract.v1.json"),"utf8"));
const low=JSON.parse(fs.readFileSync(path.join(root,"data/mass/low-reconciled-manifest.v2.json"),"utf8"));
const expect=(x,m)=>{if(!x)throw new Error(m)};

expect(contract.canonicalSungPayloadSha256==="050ce4b65918890a252078c9942f1dde282d2494dabe0e522bb842c03be20b28","Sung payload provenance changed");
expect(contract.guide.certifiedEntryCount===32,"Guide entry contract changed");
expect(contract.guide.registryPayloadStatus==="RECOVERED_CONTINUITY_CERTIFIED","Recovered Guide registry certification lost");
expect(contract.guide.registryFile==="guide-registry.v1.json","Guide registry file binding lost");
expect(HARDENED_CROSS_CUES.length===15,"v1.77 hardened cue set must remain 15");
expect(HARDENED_CROSS_CUES.every(id=>contract.hardening.crossSourceMismatchCues.includes(id)),"Hardened cue coverage mismatch");
expect(contract.ownershipRepairs.ordinaryIncarnatusPersistentKneel===false,"Persistent Incarnatus kneel reintroduced");
expect(contract.ownershipRepairs.currentColorIconsUseMasks===true,"currentColor mask contract lost");

const prefs=resolveReaderPreferences({mode:"live",postureProfile:"MY_LOCAL",gestureProfile:"guided_1962"});
const noLocal=resolvePosture({sourcedPosture:{value:"KNEEL",fixed:false},preferences:prefs});
expect(noLocal.value===null && noLocal.owner==="LOCAL_FAIL_CLOSED","Empty local posture invented a command");
const local=resolvePosture({sourcedPosture:{value:"KNEEL",fixed:false},localOverride:"STAND",preferences:prefs});
expect(local.value==="STAND" && local.owner==="LOCAL_OVERRIDE","Local posture override lost");
const fixed=resolvePosture({sourcedPosture:{value:"KNEEL",fixed:true},localOverride:"STAND",preferences:prefs});
expect(fixed.value==="KNEEL" && fixed.owner==="SOURCED_FIXED","Local profile overrode a fixed ritual state");

const incarnatus=resolveMomentState({semantic:"INCARNATUS",posture:{value:"KNEEL"}});
expect(incarnatus.posture===null,"Incarnatus retained persistent kneeling");
expect(incarnatus.gesture.type==="GENUFLECT" && incarnatus.gesture.transient===true,"Incarnatus genuflection cue lost");

const guideMissing=makeGuideState();
expect(guideMissing.buttonVisible===true && guideMissing.failClosed===true && guideMissing.rubric===null,"Missing Guide registry did not fail closed");
let badGuide=false;
try{ makeGuideState({rubric:{title:"Invented"},registryAvailable:false}); }catch{ badGuide=true; }
expect(badGuide,"Unsourced Guide rubric was accepted");

const vr=dialogueLanguagePolicy("response");
expect(vr.primary==="LATIN" && vr.vernacular==="UNDER_EACH_LINE","Dialogue language policy changed");
const prose=dialogueLanguagePolicy("prayer");
expect(prose.primary==="VERNACULAR" && prose.replaceOnToggle===true,"Ordinary text language policy changed");

expect(low.canonical_low_payload.semantic_match_to_v1_74c===true,"Low semantic reconciliation lost");
expect(low.canonical_low_payload.blocks===96 && low.canonical_low_payload.priest_events===275,"Low canonical payload counts changed");
expect(low.faithful_practice.posture_profiles.length===4,"Low posture profiles changed");
expect(low.faithful_practice.gesture_profiles.length===3,"Low gesture profiles changed");
expect(low.validation.browser_errors===0 && low.validation.horizontal_overflow===false,"Low phone validation regressed");

console.log("Reader convergence PASS: 15 hardened cues; 32-guide contract; Low v2.15 practice profile contract.");
