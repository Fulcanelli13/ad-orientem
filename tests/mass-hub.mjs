import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MASS_HUB_CATEGORIES,createMassHubOwner} from "../src/mass/hub-browser.js";
import {tenebraeInitialFace,tenebraeLiveModel} from "../src/mass/tenebrae-live.js";
const values=MASS_HUB_CATEGORIES.map(x=>x[0]);
assert.deepEqual(values,["CALENDAR","VOTIVE","REQUIEM","NUPTIAL","OTHER","SOURCE_DATE"]);
assert.ok(MASS_HUB_CATEGORIES.every(row=>row.length===5&&row.slice(1).every(Boolean)));
const m={
 schema:"ao.tenebrae.1960.hour-reader.v1",dayIndex:0,hour:"MATINS",
 textsCompleteForSourceDerivedReading:true,printEditionCriticallyCertified:false,
 steps:[
  {id:"M.N1.P1",kind:"PSALM",latin:"Psalterium Latinum",en:"English Psalm",fr:"Psaume français",metadata:{psalm:"68"}},
  {id:"M.LESSON1",kind:"LESSON",latin:"Lectio prima",en:"First lesson",fr:"Première leçon",metadata:{}},
  {id:"M.RESP1",kind:"RESPONSORY",latin:"Responsum Latinum",en:"Responsory English",fr:"Répons français",metadata:{}},
  {id:"M.PATER",kind:"PRAYER",latin:"Pater noster",en:"Our Father",fr:"Notre Père",metadata:{saidSilently:true}},
 ]
};
assert.equal(tenebraeInitialFace(m.steps[0]),"latin");
assert.equal(tenebraeInitialFace(m.steps[1]),"vernacular");
assert.equal(tenebraeInitialFace(m.steps[2]),"latin");
let x=tenebraeLiveModel({data:m,mode:"LIVE",language:"fr"});
assert.equal(x.id,"M.N1.P1");
assert.equal(x.body,"Psalterium Latinum");
assert.equal(x.title,"Psaume 68");
assert.equal(x.total,4);
assert.equal(x.priestAction,null,"Tenebrae invented Mass priest movement");
assert.equal(x.schola,null,"Office inherited a Mass Schola track");
assert.equal(x.printedEditionCollated,false,"1960 source was spuriously declared print-certified");
x=tenebraeLiveModel({data:m,index:1,mode:"SIMPLE",language:"fr"});
assert.equal(x.body,"Première leçon");
x=tenebraeLiveModel({data:m,index:2,mode:"LIVE",language:"en",faces:{"M.RESP1":"vernacular"}});
assert.equal(x.body,"Responsory English","Clicked sung Latin was not replaced with vernacular");
x=tenebraeLiveModel({data:m,index:3,mode:"LIVE",language:"en"});
assert.equal(x.silent,true);
assert.equal(x.body,"Our Father");
x=tenebraeLiveModel({data:m,index:3,mode:"MISSAL",language:"fr"});
assert.equal(x.latin,"Pater noster");assert.equal(x.vernacular,"Notre Père");
assert.throws(()=>tenebraeLiveModel({data:m,mode:"UNKNOWN"}),/Unknown Tenebrae mode/);
const noDom=createMassHubOwner({AO_RUNTIME_V8:{store:{getState:()=>({language:"fr"})}}});
assert.equal(noDom.open(),false);
assert.equal(noDom.status().installed,false);
const host=readFileSync(new URL("../src/app/host-adapter.js",import.meta.url),"utf8");
assert.match(host,/import\("\.\.\/mass\/hub-browser\.js"\)/);
assert.match(host,/hasResumableMass/);
assert.match(host,/openPreflight/);
const reader=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
assert.match(reader,/AO_MASS_HUB_V1\?\.close/,"The actual native LIVE Mass did not close the hub");
assert.match(reader,/R17_NATIVE_PRODUCTION/);
const hub=readFileSync(new URL("../src/mass/hub-browser.js",import.meta.url),"utf8");
assert.match(hub,/openPreflight/);
assert.match(hub,/configure\(\{form:selectedForm,readerMode:selectedMode/);
assert.match(hub,/loadTenebrae/);
console.log("Mass hub: PASS — six real celebration categories, four forms, three reader modes, Tenebrae source-owned LIVE/parallel and precise Mass/Office separation.");
