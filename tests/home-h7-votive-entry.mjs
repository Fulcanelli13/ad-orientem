import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {h4HomeView} from "../src/home/today-h4-view.js";
import {sourceOwnedCatalogueRows} from "../src/mass/full-mass-catalogue.js";

const vm={
 dateIso:"2026-11-06",language:"en",formularies:[],week:[],weekday:"Friday",
 dateTitle:"6 November",observedTitle:"1962 Mass",rank:"IV Class",colour:"green",
 isToday:true,massIntroit:"",resolvedForSelection:false,properStatus:"idle",loading:false
};
const model={upcoming:[],spotlight:null,feature:null};
const en=h4HomeView(vm,model);
assert.match(en,/Which Mass is being celebrated\?/);
for(const kind of ["VOTIVE","REQUIEM","NUPTIAL","OTHER"])
 assert.match(en,new RegExp('data-home-h7-mass-kind="'+kind+'"'));
assert.match(en,/Choose a votive Mass/);
assert.match(en,/data-home-h4-begin/,"Existing Mass of the day remains directly startable");
assert.match(en,/data-home-h4-change/,"Existing ceremony/reader preferences remain");
assert.equal((en.match(/data-home-h7-mass-kind=/g)||[]).length,4);

const fr=h4HomeView({...vm,language:"fr"},model);
assert.match(fr,/Choisir une messe votive/);
assert.match(fr,/Quelle messe est célébrée/);

const owner=readFileSync("src/home/browser-entry.js","utf8");
assert.match(owner,/\["VOTIVE","REQUIEM","NUPTIAL","OTHER"\]\.includes\(kind\)/);
assert.match(owner,/navigateHomeShortcut\("mass",\{trigger:h7Kind/);
assert.match(owner,/chooseCelebrationKind\?\.\(kind\)/);
const bridge=readFileSync("src/mass/browser-entry.js","utf8");
assert.match(bridge,/chooseCelebrationKind: kind =>/);
assert.match(bridge,/state\.fullMassPreflight\.openCategory\(kind\)/);
assert.match(bridge,/MASS_PREFLIGHT_NOT_VISIBLE/);
const preflight=readFileSync("src/mass/full-mass-preflight.js","utf8");
for(const kind of ["CALENDAR","VOTIVE","REQUIEM","NUPTIAL","OTHER","SOURCE_DATE"])
 assert.match(preflight,new RegExp('"'+kind+'".*|"'+kind+'"'));
assert.match(preflight,/api\.openChangeMass\(\)/);
assert.match(preflight,/control\.click\(\)/);

// The source-owned catalogue must expose the host's exact votive choices,
// including disabled states. It must not construct a parallel votive registry.
const sources=[
 {getAttribute:()=> "holy_rosary",querySelector:sel=>sel.includes("b")?{textContent:"Our Lady of the Rosary"}:{textContent:"Votive"},disabled:false},
 {getAttribute:()=> "sacred_heart",querySelector:sel=>sel.includes("b")?{textContent:"Sacred Heart"}:{textContent:"Only when permitted"},disabled:true}
];
const body={querySelectorAll:()=>sources};
const choices=sourceOwnedCatalogueRows(body,"votive");
assert.equal(choices.length,2);
assert.deepEqual(choices.map(x=>x.id),["holy_rosary","sacred_heart"]);
assert.equal(choices[1].disabled,true);
assert.equal(choices[0].source,sources[0]);
console.log("PASS: H7 presents direct actual Mass categories and delegates votive identity to the source-owned catalogue.");
