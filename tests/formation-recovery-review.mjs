import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRecoveryReviewRows,createFormationRecoveryReview,RECOVERY_REVIEW_ROOT,RECOVERY_REVIEW_SECTION_KEYS,RECOVERY_REVIEW_CHILD_KEYS} from "../src/learn/formation-recovery-review.js";
import {LEARN_MODULE_IDS} from "../src/learn/presentation.js";
const names=[
  ["BAQ questions","biblical-patristic-and-sedevacantist-question-supplement.v1.json"],
  ["BAQ answers","biblical-patristic-answers.v1.json"],
  ["Sedevacantism","sedevacantism-preconciliar-debates.v1.json"],
  ["Contemporary I","contemporary-controversies-source-pack.v1.json"],
  ["Contemporary II","contemporary-controversies-batch2-source-pack.v1.json"],
  ["Traditional Mass I","traditional-mass-objections-026-050-recovered.v1.json"],
  ["Traditional Mass II","traditional-mass-objections-051-065-reconciled.v1.json"],
  ["Traditionis custodes","traditionis-custodes-debates.v1.json"]
];
const packs=names.map(([label,name])=>({label,doc:JSON.parse(readFileSync("data/learn/"+name,"utf8"))}));
const rows=buildRecoveryReviewRows(packs);
const known=JSON.parse(readFileSync("data/learn/formation-recoverable-research-ledger-2026-10-08.v1.json","utf8"));
const ap=JSON.parse(readFileSync("data/learn/apologetics-canonical.v1.json","utf8"));
const cr=JSON.parse(readFileSync("data/learn/church-crisis-canonical.v1.json","utf8"));
const owners=new Set([...ap.dossiers,...cr.dossiers].map(x=>x.id));
assert.equal(rows.length,102);
assert.deepEqual(rows.map(x=>x.id).sort(),known.recovered_research.map(x=>x.id).sort());
assert.equal(new Set(rows.map(x=>x.id)).size,102);
assert.deepEqual(Object.fromEntries([...new Set(rows.map(x=>x.bank))].map(k=>[k,rows.filter(x=>x.bank===k).length])),{
  BAQ:26,Sedevacantism:8,"Contemporary I":6,"Contemporary II":12,
  "Traditional Mass I":25,"Traditional Mass II":15,"Traditionis custodes":10
});
for(const r of rows){
  assert.ok(r.id&&r.title_en&&r.bank);
  assert.ok(r.sourceRegistry instanceof Map);
  assert.ok(r.sourceRegistry.size>0);
  if(r.owner?.startsWith("APOL-")||r.owner?.startsWith("CR-"))assert.ok(owners.has(r.owner),r.id+" lacks canonical owner");
  for(const s of r.sourceRegistry.values())assert.ok(/^https:\/\//.test(s.url),r.id+" invalid source URL");
}
assert.equal(rows.filter(x=>x.bank==="BAQ" && !x.content).length,4);
assert.equal(rows.filter(x=>x.bank==="BAQ" && x.title_fr).length,22,"BAQ French original answer titles not reused");
const countAllSources = value => {
  let count=0;
  function walk(x){
    if(Array.isArray(x))return x.forEach(walk);
    if(!x||typeof x!=="object")return;
    if(Array.isArray(x.source_ids))count++;
    for(const [key,child] of Object.entries(x))if(key!=="source_ids")walk(child);
  }
  walk(value);
  return count;
};
const countVisibleSources = value => {
  let count=0;
  function walk(x){
    if(Array.isArray(x))return x.forEach(walk);
    if(!x||typeof x!=="object")return;
    if(Array.isArray(x.source_ids))count++;
    for(const key of RECOVERY_REVIEW_CHILD_KEYS)if(x[key])walk(x[key]);
  }
  for(const key of RECOVERY_REVIEW_SECTION_KEYS)if(value?.[key])walk(value[key]);
  return count;
};
const expected=rows.reduce((n,r)=>n+countAllSources(r.content),0);
const renderable=rows.reduce((n,r)=>n+countVisibleSources(r.content),0);
assert.equal(expected,481,"source-bearing text block count changed");
assert.equal(renderable,expected,"reader silently hides sourced paragraphs");

const fake={document:{getElementById:()=>null}};
const preview=createFormationRecoveryReview(fake);
assert.equal(preview.status().public,false);
assert.equal(preview.status().open,false);
assert.equal(preview.status().researchRecords,0);
assert.equal(RECOVERY_REVIEW_ROOT,"ao-formation-recovery-review");
for(const forbidden of ["learn.apologetics","learn.church_crisis","learn.formation_recovery"])assert.ok(!LEARN_MODULE_IDS.includes(forbidden));
const browser=readFileSync("src/learn/browser-entry.js","utf8");
assert.ok(browser.includes("aoFormationRecoveryReview=1"),"explicit URL gate not found");
assert.ok(browser.includes('import("./formation-recovery-review.js")'),"lazy QA import missing");
assert.ok(!browser.includes('import { createFormationRecoveryReview'),"QA reader must not be eager");

const nodes=new Map();
const fakeDocument={
  baseURI:"https://example.test/ad-orientem/index.html",
  documentElement:{lang:"en"},
  getElementById:id=>nodes.get(id)||null,
  createElement:tag=>{
    const el={tagName:tag,innerHTML:"",id:"",listeners:{},attributes:{},setAttribute(k,v){this.attributes[k]=v;},
      addEventListener(type,fn){this.listeners[type]=fn;},
      querySelector:()=>null,scrollTo(){},remove(){nodes.delete(this.id);}};
    return el;
  },
  body:{append(el){nodes.set(el.id,el);}}
};
const packLookup=new Map(names.map(([label,file])=>[file,packs.find(x=>x.label===label).doc]));
const windowLike={
  document:fakeDocument,
  location:{search:"?aoFormationRecoveryReview=1"},
  fetch:async url=>{
    const file=String(url).split("/").pop();
    const data=packLookup.get(file);
    return {ok:!!data,status:data?200:404,json:async()=>data};
  },
  AO_RUNTIME_V8:{store:{getState:()=>({language:"en"})}}
};
const live=createFormationRecoveryReview(windowLike);
assert.equal(await live.open(),true,"QA source files failed to mount");
assert.equal(live.status().researchRecords,102);
const node=nodes.get(RECOVERY_REVIEW_ROOT);
assert.ok(node.innerHTML.includes("Recovery source review"));
assert.ok(node.innerHTML.includes('data-rr-id="TLM026"'));
const makeClick=({id,back=false,home=false})=>({
  preventDefault(){},
  target:{closest:()=>({
    hasAttribute:key=>back&&key==="data-rr-back"||home&&key==="data-rr-home",
    dataset:{rrId:id}
  })}
});
node.listeners.click(makeClick({id:"TLM026"}));
assert.ok(node.innerHTML.includes("TLM026"),"detail not rendered");
assert.ok(node.innerHTML.includes("BEN07")||node.innerHTML.includes("Benedict"),"linked original sources unavailable");
assert.ok(node.innerHTML.includes("https://www.vatican.va/"),"source URLs missing in detail");
node.listeners.click(makeClick({back:true}));
assert.ok(node.innerHTML.includes('data-rr-id="TLM026"'),"hierarchical back did not restore list");
live.close();
assert.equal(live.status().open,false);

console.log(JSON.stringify({sourcePacks:packs.length,rows:rows.length,qa:"INTERNAL_QUERY_FLAG_ONLY",publicFormationRoutesAdded:0,canonicalDossiers:owners.size,publicationCertified:false},null,2));
