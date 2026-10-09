import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  openReaderGlossaryContext,
  navigateReaderSurface,
  openReaderScriptureContext,
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
assert.match(productionIcons.stand,/assets\/active\/mass-v46\/stand\.svg$/);
assert.match(productionIcons.priest_gospel_rich,/assets\/active\/mass-v46\/priest_gospel_rich\.svg$/);
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

const browserEntrySource=readFileSync("src/mass/browser-entry.js","utf8");
assert.match(browserEntrySource,/function massGlossaryTerms\(preview\)/,"Mass reader lost current-card glossary mapping");
assert.match(browserEntrySource,/data-reader-glossary/,"Mass browser bridge lost glossary button ownership");
for(const id of ["G052","G057","G061","G062","G063","G266","G320","G067"]){
  assert.match(browserEntrySource,new RegExp('"'+id+'"'),"Mass glossary mapping lost "+id);
}
assert.match(browserEntrySource,/openTerms\(massGlossaryTerms\(preview\),\{origin:"mass"\}\)/,"Mass glossary no longer opens as contextual overlay");

// Mass can be the very first module visited: the terms control must
// install its single canonical glossary owner rather than silently no-op.
const massPreview={getCurrentCard:()=>({title:"Communion of the Priest",sectionTitle:"Communion",sectionId:"AO.CARD.023"})};
const ownerCall=[];
const readyGlossary={async openTerms(ids,options){
  ownerCall.push({ids,options});
  return true;
}};
let usedLoader=0;
assert.equal(await openReaderGlossaryContext(massPreview,{
  win:{AO_GLOSSARY_V1:readyGlossary},
  loader:async()=>{usedLoader++;throw new Error("SHOULD_NOT_LOAD");},
}),true);
assert.equal(usedLoader,0,"Already-loaded glossary should not trigger a second import");
assert.deepEqual(ownerCall[0].options,{origin:"mass"});
assert.ok(ownerCall[0].ids.includes("G031")&&ownerCall[0].ids.includes("G064"),
  "Mass context terms were not passed through to original Glossary owner");
const lazyWindow={};
assert.equal(await openReaderGlossaryContext(massPreview,{
  win:lazyWindow,
  loader:async()=>{usedLoader++;return {installGlossaryModule(win){win.AO_GLOSSARY_V1=readyGlossary;return readyGlossary;}};},
}),true);
assert.equal(usedLoader,1,"First-use Mass glossary must lazy-load exactly once");
assert.equal(lazyWindow.AO_GLOSSARY_V1,readyGlossary,"Canonical glossary module was not installed");
await assert.rejects(()=>openReaderGlossaryContext(massPreview,{
  win:{},
  loader:async()=>({installGlossaryModule:()=>false}),
}),/MASS_GLOSSARY_NOT_READY/,"Missing glossary owner must fail visibly");
await assert.rejects(()=>openReaderGlossaryContext(massPreview,{
  win:{AO_GLOSSARY_V1:{openTerms:async()=>false}},
}),/MASS_GLOSSARY_CONTEXT_UNAVAILABLE/,"A rejected Glossary context must not report success");
await assert.rejects(()=>openReaderGlossaryContext(massPreview,{
  win:{},loader:async()=>{throw new Error("NETWORK_OFFLINE")},
}),/NETWORK_OFFLINE/,"First-use loading failure must propagate to the error notice");
assert.match(readFileSync("src/mass/browser-entry.js","utf8"),/Glossary could not open\. Mass remains available/,
  "Glossary first-use error is not visible to English readers");
assert.match(readFileSync("src/mass/browser-entry.js","utf8"),/Impossible d’ouvrir le glossaire/,
  "Glossary first-use error is not visible to French readers");



const knownScripture={open:(reference,{language})=>{
  assert.equal(reference,"Luke 18:9-14");
  assert.equal(language,"fr");
  return true;
}};
assert.equal(await openReaderScriptureContext("Luke 18:9-14",{
  win:{AO_SCRIPTURE_CONTEXT_V1:knownScripture},language:"fr",
  loader:async()=>{throw new Error("SHOULD_NOT_LOAD");},
}),true,"loaded canonical Scripture owner must be reused");
const lazyScriptureWin={};
assert.equal(await openReaderScriptureContext("Luke 18:9-14",{
  win:lazyScriptureWin,language:"fr",
  loader:async()=>({installScriptureBrowserOwner(win){
    win.AO_SCRIPTURE_CONTEXT_V1=knownScripture;
  }}),
}),true,"Scripture owner should install on first use");
await assert.rejects(()=>openReaderScriptureContext("Luke 18:9-14",{
  win:{},loader:async()=>({installScriptureBrowserOwner:()=>false}),
}),/MASS_SCRIPTURE_OWNER_NOT_READY/);
await assert.rejects(()=>openReaderScriptureContext("Luke 18:9-14",{
  win:{AO_SCRIPTURE_CONTEXT_V1:{open:()=>false}},
}),/MASS_SCRIPTURE_CONTEXT_UNAVAILABLE/);
await assert.rejects(()=>openReaderScriptureContext("Luke 18:9-14",{
  win:{},loader:async()=>{throw new Error("OFFLINE_SCRIPTURE_IMPORT");},
}),/OFFLINE_SCRIPTURE_IMPORT/);
await assert.rejects(()=>openReaderScriptureContext("Luke 18:9-14",{
  win:{AO_SCRIPTURE_CONTEXT_V1:{open:()=>Promise.reject(new Error("SCRIPTURE_RENDER_FAILED"))}},
}),/SCRIPTURE_RENDER_FAILED/);
const scriptureBridgeSource=readFileSync("src/mass/browser-entry.js","utf8");
assert.match(scriptureBridgeSource,/data-r17-native-cue/,"Scripture context reference must follow card changes");
assert.match(scriptureBridgeSource,/Scripture context could not open\. Mass remains available/);
assert.match(scriptureBridgeSource,/Le contexte biblique n’a pas pu être ouvert/);
console.log("browser-entry Scripture context lazy owner and failures: PASS");

const shellSuccess={AO_APP_SHELL_V1:{navigate:async surface=>({ok:true,surface})}};
assert.equal(await navigateReaderSurface("home",{win:shellSuccess}),true);
assert.equal(await navigateReaderSurface("settings",{win:shellSuccess}),true);
assert.equal(await navigateReaderSurface("home",{win:{AO_APP_SHELL_V1:{navigate:async()=>({ok:false,reason:"LIVE_MASS_LEAVE_CANCELLED"})}}}),false,
  "deliberately cancelled live-Mass exit must not be reported as an error");
for(const [surface,reason] of [["home","HOME_OWNER_UNAVAILABLE"],["settings","SETTINGS_OWNER_UNAVAILABLE"]]){
  await assert.rejects(()=>navigateReaderSurface(surface,{
    win:{AO_APP_SHELL_V1:{navigate:async()=>({ok:false,reason})}},
  }),new RegExp(reason),"structured shell failures must be surfaced to the reader");
}
await assert.rejects(()=>navigateReaderSurface("home",{win:{}}),/APP_SHELL_NOT_READY/,
  "a missing shell must not silently ignore Home");
await assert.rejects(()=>navigateReaderSurface("settings",{
  win:{AO_APP_SHELL_V1:{navigate:()=>{throw new Error("SETTINGS_OWNER_THROW")}}},
}),/SETTINGS_OWNER_THROW/,"synchronous shell failures must surface");
await assert.rejects(()=>navigateReaderSurface("home",{
  win:{AO_APP_SHELL_V1:{navigate:()=>Promise.reject(new Error("HOME_OWNER_REJECT"))}},
}),/HOME_OWNER_REJECT/,"async shell failures must surface");
const navigationSource=readFileSync("src/mass/browser-entry.js","utf8");
assert.match(navigationSource,/data-reader-navigation-error|readerNavigationError/,
  "reader Home and Settings failures must show accessible feedback");
assert.match(navigationSource,/aria-busy/,
  "reader navigation must prevent duplicate activation while navigating");
assert.match(navigationSource,/checkpointPersistedMass\(\{preview\}\)/,
  "reader navigation must checkpoint current Mass context");
console.log("browser-entry reader navigation feedback: PASS");

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
assert.match(bundledChoice.preview.stand,/assets\/active\/mass-v46\/stand\.svg$/,
  "native reader failed to mount from the bundled exact v4.6 donor bank without host injection");
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
