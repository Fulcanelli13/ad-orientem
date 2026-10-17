import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assessPrintableProper} from "../src/calendar/print-proper.js";
import {
  MASS_EXPLORER_SELECTED_PROPER_VERSION,
  selectedCalendarProperProjection,selectedCalendarProperSlotHtml
} from "../src/learn/mass-explorer-selected-calendar-proper.js";
import {buildMassExplorerCatalog,massExplorerMomentHtml} from "../src/learn/mass-explorer.js";
const data=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const catalog=buildMassExplorerCatalog(
 data("data/presentation/guide-registry.v1.json"),
 data("data/presentation/reader-text-sung.v1.json"),
 data("data/presentation/reader-french-ordinary.v1.json"),
 data("data/learn/mass-formation-campion.v1.json"),
 data("data/learn/mass-explorer-prayer-readings.v1.json")
);
const phrase=s=>({lat:"Látin "+s+" & <tested>.",en:"English "+s+" & <tested>.",fr:"Français "+s+" & <tested>."});
const selected={
 selectedDate:"2026-10-07",resolution:{
 date:"2026-10-07",status:"ready",
 day:{main:{title:"Our Lady of the Holy Rosary",rank:2,path:"Sancti/10-07"},commemorations:[]},
 proper:{status:"ready",data:{
  name:"Our Lady of the Holy Rosary",nameFr:"Notre-Dame du Très Saint Rosaire",
  sourcePath:"Sancti/10-07",riteProfile:"ordinary_mass",
  introit:phrase("introit"),collects:[phrase("collect")],
  epistle:phrase("epistle"),preGospelChants:[
   {kind:"gradual",text:phrase("gradual")},{kind:"alleluia",text:phrase("alleluia")}
  ],
  gospel:phrase("gospel"),offertory:phrase("offertory"),
  secrets:[phrase("secret")],preface:phrase("preface"),
  communion:phrase("communion"),postcommunions:[phrase("postcommunion")],
  specialSections:[],preparatoryLessons:[]
 }}
}};
assert.equal(assessPrintableProper(selected.resolution,{language:"en",massForm:"MISSA_CANTATA_SIMPLE"}).ok,true,
 "Existing Calendar printable-Proper gate is authoritative");
const mappings=[
 ["AO.SM.B014","INTROIT","introit"],
 ["AO.SM.B019","COLLECT_SET","collect"],
 ["AO.SM.B020","EPISTLE_OR_LESSON","epistle"],
 ["AO.SM.B021","GRADUAL","gradual"],
 ["AO.SM.B022","ALLELUIA_TRACT_SEQUENCE","alleluia"],
 ["AO.SM.B026","GOSPEL","gospel"],
 ["AO.SM.B030","OFFERTORY","offertory"],
 ["AO.SM.B040","SECRET_SET","secret"],
 ["AO.SM.B045","PREFACE","preface"],
 ["AO.SM.B085","COMMUNION","communion"],
 ["AO.SM.B088","POSTCOMMUNION_SET","postcommunion"]
];
for(const [fr,lang] of [[false,"en"],[true,"fr"]]){
 const projection=selectedCalendarProperProjection(selected,{french:fr});
 assert.equal(projection?.schema,MASS_EXPLORER_SELECTED_PROPER_VERSION);
 assert.equal(projection.owner,"SELECTED_CALENDAR_DAY_SUNG_NOT_OBSERVED_MASS");
 assert.equal(projection.date,selected.selectedDate);
 assert.equal(projection.sourcePath,"Sancti/10-07");
 assert.equal(projection.slotsAvailable,11);
 assert.equal(projection.language,lang);
 for(const [blockId,slot,kind] of mappings){
  const owner=catalog.byBlock.get(blockId);
  assert.equal(owner?.source?.Proper_Slot,slot);
  const html=massExplorerMomentHtml(catalog,owner.key,{
   blockId,french:fr,selectedCalendarProper:projection
  });
  assert.match(html,new RegExp('data-ao-mx-calendar-proper="'+slot+'"'));
  assert.ok(html.includes('data-ao-mx-calendar-date="2026-10-07"'));
  assert.ok(html.includes("Sancti/10-07"));
  assert.ok(html.includes("&lt;tested&gt;"),"Source must be safely escaped");
  assert.ok(html.includes((fr?"Français ":"English ")+kind));
  assert.ok(html.includes("Látin "+kind));
  assert.ok(html.includes('data-ao-mx-anchor="prayer"'));
  assert.ok(html.includes('id="ao-mx-guide"'));
  assert.equal((html.match(/data-ao-mx-calendar-proper=/g)||[]).length,1,
   "Calendar text must not be duplicated");
  assert.ok(html.includes('data-ao-mx-cue=')===false,"Variable Proper has no invented ordinary cue");
 }
 const wrongLanguage=selectedCalendarProperSlotHtml("INTROIT",projection,{french:!fr});
 assert.equal(wrongLanguage,"","Do not label an English verified text as French");
 assert.equal(selectedCalendarProperSlotHtml("UNKNOWN",projection,{french:fr}),"");
}
const failures=[
 c=>{c.selectedDate="2026-10-08";},
 c=>{c.resolution.date="2026-10-08";},
 c=>{c.resolution.status="failed";},
 c=>{c.resolution.day.main=null;},
 c=>{c.resolution.proper.status="unavailable";},
 c=>{c.resolution.proper.data.sourcePath="";},
 c=>{c.resolution.proper.data.gospel.en="";},
 c=>{c.resolution.proper.data.preface.fr="";},
 c=>{c.resolution.proper.data.specialSections=[{id:"requiem-absolution"}];},
 c=>{c.resolution.proper.data.riteProfile="good_friday";},
 c=>{c.resolution.proper.data.collects=[];}
];
for(const [i,mutate] of failures.entries()){
 const x=structuredClone(selected);mutate(x);
 assert.equal(selectedCalendarProperProjection(x),null,"Rejected invalid selected day or Proper "+i);
}
const sermon=catalog.byBlock.get("AO.SM.B096");
assert.ok(!sermon.source.Proper_Slot);
assert.doesNotMatch(massExplorerMomentHtml(catalog,sermon.key,{
 blockId:"AO.SM.B096",selectedCalendarProper:selectedCalendarProperProjection(selected)
}),/data-ao-mx-calendar-proper=/,"Sermon never receives invented Proper text");
for(const blockId of ["AO.SM.B001","AO.SM.B051","AO.SM.B095"]){
 const owner=catalog.byBlock.get(blockId);
 assert.doesNotMatch(massExplorerMomentHtml(catalog,owner.key,{
  blockId,selectedCalendarProper:selectedCalendarProperProjection(selected)
 }),/data-ao-mx-calendar-proper=/,"Fixed texts must stay with their existing owners");
}
const fallback=massExplorerMomentHtml(catalog,catalog.byBlock.get("AO.SM.B014").key,{
 blockId:"AO.SM.B014",selectedCalendarProper:null
});
assert.ok(fallback.includes("No fully verified Proper"));
assert.doesNotMatch(fallback,/data-ao-mx-calendar-proper=/);
const app=readFileSync(new URL("../src/learn/mass-explorer.js",import.meta.url),"utf8");
const adapter=readFileSync(new URL("../src/learn/mass-explorer-selected-calendar-proper.js",import.meta.url),"utf8");
const ritual=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
assert.ok(adapter.includes('from "../calendar/print-proper.js"'));
assert.doesNotMatch(adapter,/resolveDay|resolveSource|fetch\(/,
 "Adapter must reuse already-resolved Calendar source; never fetch a new Proper");
assert.doesNotMatch(ritual,/mass-explorer-selected-calendar-proper/);
assert.ok(app.includes("selectedCalendarProperProjection("));
console.log("PASS Mass Explorer: 11 variable Proper slots reuse Calendar certified print projection; exact selected date & source identity; bilingual, escaped, 11 fail-closed scenarios; no separate resolver or ritual-reader modification.");
