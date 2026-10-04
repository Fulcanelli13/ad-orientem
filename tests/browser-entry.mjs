import assert from "node:assert/strict";
import {
  mapLegacyFollowMode,
  mapInsertedRites,
  deriveHostOptions,
  stampMassReaderUi,
  mountR17Preview,
  ACTIVE_MASS_STORAGE_KEY,
  readPersistedActiveMass,
  persistedMassIsResumable,
  resolveHostIconAssets,
} from "../src/mass/browser-entry.js";

assert.equal(mapLegacyFollowMode("missal"), "MISSAL");
assert.equal(mapLegacyFollowMode("read"), "MISSAL");
assert.equal(mapLegacyFollowMode("simple"), "SIMPLE");
assert.equal(mapLegacyFollowMode("vox"), "LIVE");
assert.equal(mapLegacyFollowMode(undefined), "LIVE");

const bridgedIcons={stand:"data:image/svg+xml;base64,PHN2Zy8+"};
assert.equal(resolveHostIconAssets({AO_R17_ICON_ASSETS:bridgedIcons}),bridgedIcons,
  "explicit modular icon bank stopped taking precedence");
assert.equal(resolveHostIconAssets({}),null,
  "icon resolver invented a host bank when no bridge/global bank exists");

const rites = mapInsertedRites([
  "asperges",
  "corpus procession",
  "requiem absolution",
  "rogation procession",
]);
assert.deepEqual([...rites.precedingRites], ["ASPERGES", "ROGATIONS"]);
assert.deepEqual(
  [...rites.followingActions],
  ["CORPUS_CHRISTI_PROCESSION", "REQUIEM_ABSOLUTION", "GENERIC_PROCESSION"],
);

const resolvedProper={status:"READY",data:{id:"RESOLVED"}};
let options = deriveHostOptions({
  resolvedMass: { insertedRites: ["ash"], proper:resolvedProper },
  assemblyStatus: null,
  arch: { celebrationForm: "low", followMode: "missal" },
  runtimeState: { settings: { localMassProfile: "LOCAL" } },
});
assert.equal(options.proper, resolvedProper,"final bridge still depended on legacy assembly status for Proper");
assert.equal(options.celebrationForm, "low");
assert.equal(options.presentationMode, "MISSAL");
assert.deepEqual([...options.precedingRites], ["ASH"]);
assert.equal(options.localProfile, "LOCAL");

const funeralContext={bodyPresent:true,burialProcession:true};
options = deriveHostOptions({
  resolvedMass:{
    insertedRites:["requiem absolution"],
    proper:resolvedProper,
    requiemAbsolution:funeralContext,
  },
});
assert.deepEqual([...options.followingActions],["REQUIEM_ABSOLUTION"]);
assert.deepEqual(options.requiemAbsolution,funeralContext,
  "browser bridge dropped explicit Requiem funeral context");

options = deriveHostOptions({
  resolvedMass: { insertedRites: [], proper:resolvedProper },
  assemblyStatus: { ok:true, proper:{id:"HOST"} },
});
assert.equal(options.proper.id,"HOST","available host preflight Proper stopped taking precedence");

const uiDoc={documentElement:{dataset:{}}};
assert.equal(stampMassReaderUi("R17_NATIVE_PRODUCTION",uiDoc),"R17_NATIVE_PRODUCTION");
assert.equal(uiDoc.documentElement.dataset.aoMassReaderUi,"R17_NATIVE_PRODUCTION");
assert.equal(stampMassReaderUi("LEGACY_EXPLICIT_ROLLBACK",uiDoc),"LEGACY_EXPLICIT_ROLLBACK");
assert.equal(uiDoc.documentElement.dataset.aoMassReaderUi,"LEGACY_EXPLICIT_ROLLBACK");

assert.throws(
  () => deriveHostOptions({
    resolvedMass: {},
    assemblyStatus: { ok: false, reason: "blocked" },
  }),
  /blocked/,
);


const persistedStorage={
  value:null,
  getItem(key){return key===ACTIVE_MASS_STORAGE_KEY?this.value:null;},
  setItem(key,value){if(key===ACTIVE_MASS_STORAGE_KEY)this.value=String(value);},
};
persistedStorage.setItem(ACTIVE_MASS_STORAGE_KEY,JSON.stringify({
  schema:"ao-mass-entry-bootstrap-v1",
  session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE"}},
  readerPreferences:{mode:"LIVE",postureProfile:"TRADITIONAL_WALSH",gestureProfile:"GUIDED_1962",language:"en"},
  state:"active",
  readerPosition:{sectionId:"AO.CARD.003"},
}));
const persisted=readPersistedActiveMass(persistedStorage);
assert.equal(persisted?.session?.resolvedMass?.form,"MISSA_CANTATA_INCENSE");
assert.equal(persisted?.readerPreferences?.mode,"LIVE");
assert.equal(persisted?.readerPosition?.sectionId,"AO.CARD.003");
assert.equal(persistedMassIsResumable(persisted),true);
assert.equal(persistedMassIsResumable({...persisted,state:"complete"}),false);
assert.equal(readPersistedActiveMass({getItem:()=>"{bad"}),null);

// browser-entry persisted Mass contract

console.log("browser-entry host mapping: PASS");

const iconKeys=[
  "stand","sit","kneel","genuflect","bow","cross","gospel_crosses","breast_strike","head_bow","profound_bow","hands_joined",
  "response","schola","priest_audible","priest_silent","priest_foot","priest_steps","priest_centre","priest_epistle","priest_gospel","priest_sedilia","priest_rail","priest_people",
];
const iconAssets=Object.fromEntries(iconKeys.map(key=>[key,"data:image/svg+xml;base64,PHN2Zy8+"]));

const nativeChoice=await mountR17Preview({
  doc:{},
  prepared:{},
  nativeMount:({readLegacyActive})=>({kind:"native",hasLegacyDonor:typeof readLegacyActive==="function"}),
  iconAssets,
});
assert.equal(nativeChoice.uiOwner,"R17_NATIVE_PRODUCTION");
assert.equal(nativeChoice.preview.kind,"native");
assert.equal(nativeChoice.preview.hasLegacyDonor,false,"native production reader still received legacy-active donor");
assert.equal(nativeChoice.fallbackReason,null);

await assert.rejects(
  ()=>mountR17Preview({
    doc:{},
    prepared:{},
    nativeMount:()=>{throw new Error("native blocked")},
    iconAssets,
  }),
  /native blocked/,
  "native failure silently fell back to the obsolete mirror reader"
);

await assert.rejects(
  ()=>mountR17Preview({
    doc:{},prepared:{},iconAssets:{},
    nativeMount:()=>({kind:"should-not-mount"}),
  }),
  /R17_ICON_BANK_INCOMPLETE/,
  "missing icon bank silently degraded instead of failing closed"
);

console.log("browser-entry native production cutover: PASS");
