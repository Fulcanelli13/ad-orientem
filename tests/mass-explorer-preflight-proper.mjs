import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 selectedPreflightStudyProper,MASS_EXPLORER_PREFLIGHT_PROPER_SELECTION
} from "../src/mass/preflight-study-proper.js";
import {
 selectedPreflightMassProperProjection,selectedCalendarProperProjection
} from "../src/learn/mass-explorer-selected-calendar-proper.js";
import {assessResolvedProperTextSections} from "../src/calendar/print-proper.js";
import {buildMassExplorerCatalog,massExplorerMomentHtml} from "../src/learn/mass-explorer.js";

const data=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const catalog=buildMassExplorerCatalog(
 data("data/presentation/guide-registry.v1.json"),
 data("data/presentation/reader-text-sung.v1.json"),
 data("data/presentation/reader-french-ordinary.v1.json"),
 data("data/learn/mass-formation-campion.v1.json"),
 data("data/learn/mass-explorer-prayer-readings.v1.json"),
 data("data/learn/mass-explorer-approved-studies.v1.json")
);
const text=s=>({lat:"Látin "+s+" & <verified>.",en:"English "+s+" & <verified>.",fr:"Français "+s+" & <verified>."});
const date="2026-10-07",path="Sancti/10-07";
const proper={
 name:"Our Lady of the Holy Rosary",nameFr:"Notre-Dame du Très Saint Rosaire",
 sourcePath:path,riteProfile:"ordinary_mass",
 introit:text("introit"),collects:[text("collect")],
 epistle:text("epistle"),
 preGospelChants:[{kind:"gradual",text:text("gradual")},{kind:"alleluia",text:text("alleluia")}],
 gospel:text("gospel"),offertory:text("offertory"),secrets:[text("secret")],
 preface:text("preface"),communion:text("communion"),
 postcommunions:[text("postcommunion")],specialSections:[],preparatoryLessons:[]
};
const selected={
 date,canStart:true,
 celebrationId:"our_lady_rosary",requestedCelebrationId:"our_lady_rosary",
 celebrationType:"VOTIVE",celebrationTitle:"Our Lady of the Rosary",
 properSource:path,
 proper:{status:"READY",sourcePath:path,data:proper},
 actualCelebration:{title:"Our Lady of the Rosary"}
};
const formSelection={form:"MISSA_CANTATA_SIMPLE",kind:"VOTIVE"};
const input={
 base:selected,selectedCalendarDate:date,formSelection,
 observedGate:{ready:true},assemblyStatus:{ok:true}
};
const ctx=selectedPreflightStudyProper(input);
assert.equal(ctx?.schema,MASS_EXPLORER_PREFLIGHT_PROPER_SELECTION);
assert.equal(ctx?.selection,"EXPLICIT_ALTERNATE_MASS");
assert.equal(ctx?.identity,"VOTIVE");
assert.equal(ctx?.ready,true);
assert.equal(ctx?.sourcePath,path);
assert.equal(ctx?.proper,proper,"Projection must reuse exact existing host source, not copy/re-resolve");
assert.equal(ctx.rubricalPermission,"NOT_ASSERTED_BY_STUDY_VIEW");
const blocks=[
 ["AO.SM.B014","INTROIT","introit"],["AO.SM.B019","COLLECT_SET","collect"],
 ["AO.SM.B020","EPISTLE_OR_LESSON","epistle"],["AO.SM.B021","GRADUAL","gradual"],
 ["AO.SM.B022","ALLELUIA_TRACT_SEQUENCE","alleluia"],["AO.SM.B026","GOSPEL","gospel"],
 ["AO.SM.B030","OFFERTORY","offertory"],["AO.SM.B040","SECRET_SET","secret"],
 ["AO.SM.B045","PREFACE","preface"],["AO.SM.B085","COMMUNION","communion"],
 ["AO.SM.B088","POSTCOMMUNION_SET","postcommunion"]
];
for(const [fr,language] of [[false,"en"],[true,"fr"]]){
 const projection=selectedPreflightMassProperProjection(ctx,{french:fr});
 assert.equal(projection.owner,"EXPLICIT_PREFLIGHT_MASS");
 assert.equal(projection.slotsAvailable,11);
 assert.equal(projection.sourcePath,path);
 assert.equal(projection.language,language);
 for(const [id,slot,kind] of blocks){
  const owner=catalog.byBlock.get(id);
  assert.equal(owner.source.Proper_Slot,slot);
  const html=massExplorerMomentHtml(catalog,owner.key,{blockId:id,french:fr,selectedCalendarProper:projection});
  assert.ok(html.includes('data-ao-mx-calendar-proper="'+slot+'"'));
  assert.ok(html.includes('data-ao-mx-proper-owner="EXPLICIT_PREFLIGHT_MASS"'));
  assert.ok(html.includes((fr?"Français ":"English ")+kind));
  assert.ok(html.includes("Látin "+kind));
  assert.ok(html.includes("&lt;verified&gt;"));
  assert.match(html,/chosen in pre-Mass preparation|choisi à la préparation/);
  assert.doesNotMatch(html,/<verified>/);
 }
}
assert.equal(selectedPreflightStudyProper({base:{...selected,
 celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",celebrationType:"CALENDAR"}
 ,selectedCalendarDate:date}),null,"Default Calendar choice must retain original Calendar projection");
// Changing to a LOW Mass does not justify projecting a SUNG educational Proper.
function altered(change){
 const value=structuredClone(input);change(value);
 return selectedPreflightStudyProper(value);
}
const rejected=[
 x=>{x.base.canStart=false},
 x=>{x.base.date="2026-10-08"},
 x=>{x.selectedCalendarDate="2026-10-08"},
 x=>{x.base.properSource="Sancti/10-08"},
 x=>{x.base.proper.status="UNAVAILABLE"},
 x=>{x.base.proper.data.sourcePath="Sancti/10-08"},
 x=>{x.base.celebrationTitle="";x.base.actualCelebration=null;x.base.proper.data.name=""},
 x=>{x.formSelection.form="LOW"},
 x=>{x.formSelection=null},
 x=>{x.assemblyStatus.ok=false},
 x=>{x.observedGate.ready=false},
 x=>{x.base.exceptionalProfile="good-friday-1962"}
];
for(const [i,change] of rejected.entries()){
 const held=altered(change);
 assert.equal(held?.selection,"EXPLICIT_ALTERNATE_MASS","No Calendar fallback when an alternate source fails "+i);
 assert.equal(held.ready,false,i+" must not publish unverified Mass text");
 const projection=selectedPreflightMassProperProjection(held);
 assert.equal(projection?.owner,"EXPLICIT_ALTERNATE_MASS_BLOCKED");
 const block=catalog.byBlock.get("AO.SM.B014");
 const html=massExplorerMomentHtml(catalog,block.key,{
  blockId:"AO.SM.B014",selectedCalendarProper:projection
 });
 assert.ok(html.includes("Calendar-day Proper will not be substituted"));
 assert.doesNotMatch(html,/data-ao-mx-calendar-proper=/);
}
const noObserved={...input,base:{...selected,
 celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",celebrationType:"CALENDAR"},
 observedStatus:{sourceDate:"2026-10-07",selected:null,pending:true}};
const undecided=selectedPreflightStudyProper(noObserved);
assert.equal(undecided.ready,false);
assert.equal(undecided.reason,"OBSERVED_SOURCE_SELECTION_UNCONFIRMED");
const mismatchedRequested=selectedPreflightStudyProper({
 ...input,base:{...selected,celebrationId:"mass_of_day",
   requestedCelebrationId:"our_lady_rosary",celebrationType:"CALENDAR"}
});
assert.equal(mismatchedRequested?.ready,false);
assert.equal(mismatchedRequested?.selection,"EXPLICIT_ALTERNATE_MASS",
 "A requested alternate must not silently fall back to the Calendar when the host has not resolved that change");
const observedLegacy={...selected,
 sourceDiagnostics:{actualMassSelection:"OBSERVED_SOURCE_DAY"}};
const observed={
 schema:"ao-observed-mass-selection-v1",
 massDate:date,sourceDate:"2026-10-01",sourcePath:path,
 proper:selected.proper,legacy:observedLegacy,sourceOwned:true,
 permissionStatus:"NOT_INDEPENDENTLY_VERIFIED"
};
const observedCtx=selectedPreflightStudyProper({...input,
 base:{...selected,celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",celebrationType:"CALENDAR"},
 observedSelection:observed,
 formSelection:{form:"MISSA_CANTATA_SIMPLE",kind:"VOTIVE"},
 observedStatus:{sourceDate:"2026-10-01",selected:path,pending:false}});
assert.equal(observedCtx.ready,true);
assert.equal(observedCtx.identity,"OBSERVED_SOURCE_DAY");
assert.equal(observedCtx.sourceDate,"2026-10-01");
assert.equal(observedCtx.rubricalPermission,"NOT_INDEPENDENTLY_VERIFIED");
for(const change of [
 x=>{x.observedSelection.sourceOwned=false},
 x=>{x.observedSelection.sourcePath="Sancti/10-08"},
 x=>{x.observedSelection.massDate="2026-10-08"},
 x=>{x.observedSelection.legacy.sourceDiagnostics.actualMassSelection="NO"}
]){
 const source=structuredClone({...input,
  base:{...selected,celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",celebrationType:"CALENDAR"},
  observedSelection:observed,
  formSelection:{form:"MISSA_CANTATA_SIMPLE",kind:"VOTIVE"}
 });change(source);
 assert.equal(selectedPreflightStudyProper(source).ready,false,"Observed source must fail closed");
}
const corrupt=structuredClone(ctx);
corrupt.proper.gospel.fr="";
assert.equal(selectedPreflightMassProperProjection(corrupt).owner,"EXPLICIT_ALTERNATE_MASS_BLOCKED",
 "Incomplete French cannot be published just because English is complete");
const exceptional=structuredClone(ctx);
exceptional.proper.specialSections=[{id:"special"}];
assert.equal(selectedPreflightMassProperProjection(exceptional).owner,"EXPLICIT_ALTERNATE_MASS_BLOCKED");
const english=assessResolvedProperTextSections(ctx.proper,{language:"en"});
assert.equal(english.ok,true);
const printedGate=readFileSync(new URL("../src/calendar/print-proper.js",import.meta.url),"utf8");
assert.match(printedGate,/return assessResolvedProperTextSections\(p,\{language\}\)/,
 "The printable Calendar Proper must continue reusing the same bilingual source gate");
const bridge=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
assert.match(bridge,/selectedStudyProper: \(\) =>/);
assert.doesNotMatch(bridge,/massExplorerMomentHtml|selectedPreflightMassProperProjection/);
console.log("PASS exact selected alternate Proper: 11 canonical slots × EN/FR, observed source choice, 16 fail-closed variants; Calendar print gate retained, zero new source catalogues and no reader mutation.");
