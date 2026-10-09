import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CONTEXTUAL_GLOSSARY_TERMS,glossaryContextCapsule,installContextualStudyBridge} from "../src/app/contextual-study.js";

const canonical=[1,2,3].flatMap(n=>{
 const start=(n-1)*150+1,end=n*150;
 return JSON.parse(readFileSync(`data/glossary/concepts-${String(start).padStart(3,"0")}-${end}.v1.json`,"utf8")).entries;
});
const byId=new Map(canonical.map(item=>[item.id,item]));
assert.equal(Object.keys(CONTEXTUAL_GLOSSARY_TERMS).length,12);
for(const [id,copy] of Object.entries(CONTEXTUAL_GLOSSARY_TERMS)){
 const source=byId.get(id);
 assert.ok(source,"Unknown canonical Glossary entry "+id);
 assert.equal(copy.en,source.labels.en,"English source entry label drift "+id);
 assert.equal(copy.fr,source.labels.fr,"French source entry label drift "+id);
 const en=glossaryContextCapsule(id),fr=glossaryContextCapsule(id,{french:true});
 assert.ok(en.includes('data-ao-glossary-context="'+id+'"'));
 assert.ok(fr.includes(copy.fr));
 assert.match(en,/aria-label="Understand : /);
 assert.match(fr,/aria-label="Comprendre : /);
}
assert.equal(glossaryContextCapsule("learn.apologetics"),"","Do not deep link unpublished dossiers as Glossary");
assert.equal(glossaryContextCapsule('G001"><img src=x>'),"","Never interpolate a caller-supplied invalid identity");
const pray=readFileSync("src/pray/presentation-runtime.js","utf8");
const mass=readFileSync("src/mass/reader-dom.js","utf8");
const spiritual=readFileSync("src/learn/spiritual-life.js","utf8");
const bootstrap=readFileSync("src/app/browser-entry.js","utf8");
const glossary=readFileSync("src/glossary/browser-entry.js","utf8");
assert.match(pray,/glossaryContextCapsule/);
for(const item of ['eucharistic:\x27G301\x27','penance:\x27G036\x27','passion:\x27G419\x27'])
 assert.ok(pray.includes(item),"Missing source-mapped Prayer family: "+item);
assert.match(mass,/glossaryContextCapsule\("G067"\)/);
assert.match(spiritual,/SL01:"G001"/);
assert.match(spiritual,/SL03:"G324"/);
assert.match(spiritual,/SL12:"G044"/);
assert.match(bootstrap,/installContextualStudyBridge\(globalThis\)/);
assert.match(glossary,/state\.origin==="context"/);
assert.match(glossary,/returning\.trigger\.focus/);

const handlers={};
const root={
 head:{append(){}},
 documentElement:{append(){}},
 getElementById:()=>null,
 createElement:()=>({setAttribute(){},dataset:{},textContent:"",id:""}),
 addEventListener:(name,handler)=>{handlers[name]=handler},
 removeEventListener:(name)=>{delete handlers[name]},
};
const calls=[];
let accepted=true;
const owner={
 async open(opts){calls.push({...opts});return accepted;},
 close(){calls.push("closed");return true;},
 status(){return {detailId:accepted?calls.at(-1)?.entryId:null}}
};
const win={document:root,AO_GLOSSARY_V1:owner,AO_RUNTIME_V8:{store:{getState:()=>({language:"en"})}}};
const bridge=installContextualStudyBridge(win);
assert.equal(bridge,installContextualStudyBridge(win),"Must be idempotent");
assert.equal(bridge.status().termCount,12);
assert.equal(await bridge.openTerm("G001"),true);
assert.equal(calls[0].entryId,"G001");
assert.equal(calls[0].origin,"context");
assert.equal(await bridge.openTerm("BAD"),false);
assert.equal(calls.length,1,"Unknown entry must not open generic Glossary");
accepted=false;
assert.equal(await bridge.openTerm("G044"),false,"Rejected exact definition must fail closed");
assert.ok(calls.includes("closed"),"Rejected exact definition must close generic Glossary");
bridge.dispose();
assert.equal(win.AO_CONTEXTUAL_STUDY_V1,undefined);
console.log("PASS canonical contextual glossary identities, 3 owner surfaces and fail-closed handoffs");
