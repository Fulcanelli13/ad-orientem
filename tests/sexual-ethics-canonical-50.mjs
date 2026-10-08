import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_CANONICAL_VERSION,CSE_CANONICAL_DOSSIERS,CSE_CANONICAL_FAMILIES,CSE_CANONICAL_DOSSIER_MAP,CSE_QUESTION_OWNER_MAP} from "../src/learn/sexual-ethics-data/canonical.js";
import {CSE_QUESTION_MAP,CSE_QUESTIONS} from "../src/learn/sexual-ethics-data/index.js";
import {createSexualEthicsRuntime,SEXUAL_ETHICS_ROOT_ID} from "../src/learn/sexual-ethics.js";
import {CSE_DEBATE_POSITION_REFS,CSE_POSITION_SOURCE_IDS} from "../src/learn/sexual-ethics-data/provenance.js";

const registry=JSON.parse(readFileSync("data/learn/content-ownership-registry.v1.json","utf8"));
const audit=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-source-audit.v1.json","utf8"));
assert.equal(CSE_CANONICAL_VERSION,"CSE_CANONICAL_50_V1");
assert.equal(CSE_CANONICAL_FAMILIES.length,7);
assert.equal(CSE_CANONICAL_DOSSIERS.length,50);
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(audit.cases.length,55);
assert.equal(audit.summary.remaining_full_passage_review,55);
assert.equal(audit.summary.unmapped_opponent_sources,0);
assert.equal(audit.summary.missing_canonical_urls,0);
assert.equal(audit.cases.filter(c=>c.opponent_provenance.length===0).length,0);
assert.deepEqual(audit.cases.map(c=>c.id),[...CSE_POSITION_SOURCE_IDS]);
for(const row of audit.cases){
  const refs=CSE_DEBATE_POSITION_REFS[row.id];
  assert.deepEqual(row.opponent_provenance.map(x=>[x.source_id,x.locator]),refs.map(x=>[...x]),"source provenance changed: "+row.id);
  for(const source of row.opponent_provenance)assert.match(source.url,/^https:\/\//);
}
assert.equal(audit.summary.selected_primary_position_checks,34);
assert.equal(audit.summary.book_catalog_preview_cases,33);
assert.equal(audit.summary.remaining_full_passage_review,55);

const owned=[];
for(const [index,dossier] of CSE_CANONICAL_DOSSIERS.entries()){
  const existing=registry.sexual_ethics.canonical_dossiers[index];
  assert.equal(dossier.id,existing.id,"canonical registry owner drift");
  assert.deepEqual([...dossier.questionIds],existing.sources,"original 150-question ownership changed");
  assert.ok(dossier.title[0]&&dossier.title[1],"bilingual dossier title");
  assert.ok(CSE_CANONICAL_FAMILIES.some(f=>f.id===dossier.family));
  assert.equal(CSE_CANONICAL_DOSSIER_MAP[dossier.id],dossier);
  for(const id of dossier.questionIds){
    assert.ok(CSE_QUESTION_MAP[id],"missing original question "+id);
    assert.equal(CSE_QUESTION_OWNER_MAP[id],dossier.id,"wrong canonical owner "+id);
    owned.push(id);
  }
}
assert.equal(owned.length,150);
assert.equal(new Set(owned).size,150);
for(let n=1;n<=150;n++){
  const id=`CSE${String(n).padStart(3,"0")}`;
  assert.ok(owned.includes(id),"not reachable in dossier navigation: "+id);
}
const familyCounts=new Map(CSE_CANONICAL_FAMILIES.map(f=>[f.id,0]));
for(const d of CSE_CANONICAL_DOSSIERS)familyCounts.set(d.family,familyCounts.get(d.family)+1);
assert.ok([...familyCounts.values()].every(n=>n>0));

function fakeWin(lang="en"){
 const nodes=new Map(),bodyClasses=new Set(),listeners=new Map();
 const doc={
   documentElement:{lang},
   body:{classList:{add:x=>bodyClasses.add(x),remove:x=>bodyClasses.delete(x)},appendChild(el){nodes.set(el.id,el);},append(el){nodes.set(el.id,el);}},
   getElementById(id){return nodes.get(id)||null;},
   createElement(){
     const el={id:"",innerHTML:"",hidden:false,dataset:{},setAttribute(){},removeAttribute(){},
       addEventListener(type,fn){listeners.set(type,fn);},
       querySelector(){return null;},scrollTo(){},remove(){nodes.delete(this.id);}};
     return el;
   }
 };
 return {document:doc,console:{error(){throw Error("runtime error")}},_nodes:nodes,_listeners:listeners};
}
const en=fakeWin(),api=createSexualEthicsRuntime(en);
assert.equal(api.open(),true);
assert.equal(api.status().dossiers,50);
assert.equal(api.status().families,7);
let html=()=>en.document.getElementById(SEXUAL_ETHICS_ROOT_ID)?.innerHTML||"";
assert.match(html(),/50 thematic dossiers/);
assert.match(html(),/data-ao-cse-family/);
assert.doesNotMatch(html(),/10 questions/);
assert.equal(api.openFamily("marriage"),true);
assert.equal(api.status().view,"family");
assert.match(html(),/data-ao-cse-dossier="SEX-CORE-16"/);
assert.equal(api.openDossier("SEX-CORE-16"),true);
assert.equal(api.status().view,"dossier");
assert.match(html(),/data-ao-cse-question="CSE055"/);
assert.equal(api.openQuestion("CSE055"),true);
assert.equal(api.status().view,"question");
assert.match(html(),/Are oral stimulation/);
assert.equal(api.back(),true);
assert.equal(api.status().view,"dossier");
assert.equal(api.back(),true);
assert.equal(api.status().view,"family");
assert.equal(api.back(),true);
assert.equal(api.status().view,"sections");
assert.equal(api.open({questionId:"CSE149"}),true);
assert.equal(api.status().view,"question");
assert.equal(api.back(),true);
assert.equal(api.status().view,"dossier");
assert.equal(api.openDossier("SEX-CORE-02"),true);
assert.match(html(),/CSE006/);
assert.equal(api.back(),true);
assert.equal(api.status().view,"family");
assert.equal(api.back(),true);
assert.equal(api.status().view,"sections");
const inputEvent=en._listeners.get("input");
assert.equal(typeof inputEvent,"function");
inputEvent({target:{closest(){return {value:"flirting while engaged"};}}});
assert.match(html(),/CSE039/,"global 150-question alias search");
assert.equal(api.openQuestion("CSE039"),true);
assert.equal(api.back(),true);
assert.equal(api.status().view,"sections");
assert.match(html(),/CSE039/,"back restores search results");
assert.equal(api.close(),true);
assert.equal(api.status().open,false);

const fr=fakeWin("fr"),apiFR=createSexualEthicsRuntime(fr);
assert.equal(apiFR.open(),true);
let french=()=>fr.document.getElementById(SEXUAL_ETHICS_ROOT_ID)?.innerHTML||"";
assert.match(french(),/50 dossiers thématiques/);
assert.equal(apiFR.openFamily("courtship"),true);
assert.match(french(),/Chasteté avant le mariage/);
assert.equal(apiFR.openDossier("SEX-CORE-10"),true);
assert.match(french(),/regards volontaires et flirt/);
assert.equal(apiFR.openQuestion("CSE039"),true);
assert.match(french(),/Quand le flirt/);
assert.equal(apiFR.back(),true);
assert.equal(apiFR.status().view,"dossier");
assert.equal(apiFR.close(),true);

const reader=readFileSync("src/learn/sexual-ethics.js","utf8");
assert.match(reader,/function searchQuestions/);
assert.match(reader,/CSE_QUESTIONS\.filter/);
assert.match(reader,/item\.aliases/);
assert.match(reader,/Object\.values\(item\.debate\)/);
assert.match(reader,/data-ao-cse-home/);
assert.match(reader,/function openSection/,"legacy deep links must remain available");
assert.match(reader,/function openFamily/);
assert.match(reader,/function openDossier/);
assert.match(reader,/state\.returnView==="sections"/);
console.log("PASS Sexual Ethics 50-dossier navigation: 150 unique owners, 7 families, all original debates/search retained, back/home, French, 55-source audit.");
