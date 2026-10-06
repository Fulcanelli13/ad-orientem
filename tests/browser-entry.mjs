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
  clearPersistedActiveMass,
  resolveHostIconAssets,
} from "../src/mass/browser-entry.js";
import { auditHostIconBank, R17_FROZEN_ACTIVE_ICON_KEYS, R17_FROZEN_EXCLUDED_ICON_KEYS } from "../src/mass/reader-icons.js";

assert.equal(mapLegacyFollowMode("missal"), "MISSAL");
assert.equal(mapLegacyFollowMode("read"), "MISSAL");
assert.equal(mapLegacyFollowMode("simple"), "SIMPLE");
assert.equal(mapLegacyFollowMode("vox"), "LIVE");
assert.equal(mapLegacyFollowMode(undefined), "LIVE");

const staleHostIcons={
  stand:"data:image/svg+xml;base64,PHN2Zy8+",
  cross:"data:image/svg+xml;base64,PHN2Zy8+",
  gospel_crosses:"data:image/svg+xml;base64,PHN2Zy8+",
  priest_sedilia:"data:image/svg+xml;base64,PHN2Zy8+",
};
const productionIcons=resolveHostIconAssets({AO_R17_ICON_ASSETS:staleHostIcons});
assert.notEqual(productionIcons,staleHostIcons,
  "stale host icon bank regained authority over the frozen modular bank");
const productionAudit=auditHostIconBank(productionIcons);
assert.equal(productionAudit.complete,true,"externalized frozen active icon bank is incomplete");
assert.deepEqual(productionAudit.missing,[]);
assert.deepEqual(productionAudit.required,[...R17_FROZEN_ACTIVE_ICON_KEYS]);
assert.deepEqual(productionAudit.excluded,[...R17_FROZEN_EXCLUDED_ICON_KEYS]);
assert.match(productionIcons.stand,/assets\/active\/live-posture\/ao-live-stand\.svg$/);
assert.match(productionIcons.priest_gospel,/assets\/active\/live-actors\/ao-live-priest-gospel-side\.png$/);
for(const key of R17_FROZEN_EXCLUDED_ICON_KEYS)assert.equal(productionIcons[key],undefined,
  key+" was reintroduced despite FROZEN_EXCLUDED status");

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
  removeItem(key){if(key===ACTIVE_MASS_STORAGE_KEY)this.value=null;},
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
assert.equal(clearPersistedActiveMass(persistedStorage),true);
assert.equal(readPersistedActiveMass(persistedStorage),null,"stale persisted Mass checkpoint was not clearable");

// browser-entry persisted Mass contract

console.log("browser-entry host mapping: PASS");

const iconKeys=[...R17_FROZEN_ACTIVE_ICON_KEYS];
const iconAssets=Object.fromEntries(iconKeys.map(key=>[key,"data:image/svg+xml;base64,PHN2Zy8+"]));

const previousHostIcons=globalThis.AO_R17_ICON_ASSETS;
globalThis.AO_R17_ICON_ASSETS={};
const bundledChoice=await mountR17Preview({
  doc:{},
  prepared:{},
  nativeMount:({iconResolver})=>({kind:"bundled",stand:iconResolver("stand")}),
});
assert.equal(bundledChoice.preview.kind,"bundled");
assert.match(bundledChoice.preview.stand,/assets\/active\/live-posture\/ao-live-stand\.svg$/,
  "native reader failed to mount from the bundled frozen bank without host injection");
if(previousHostIcons===undefined)delete globalThis.AO_R17_ICON_ASSETS;
else globalThis.AO_R17_ICON_ASSETS=previousHostIcons;

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
