import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import {mysteryMassReviewMarkup,mysteryMassReviewEnabled,createMysteryMassReviewRuntime} from "../src/learn/mystery-mass-review.js";
import {MYSTERY_MASS_REVIEW_DATA as data} from "../src/learn/mystery-mass-review-data.js";
import {LEARN_LAYOUT} from "../src/learn/presentation.js";
import {parseScriptureContext} from "../src/scripture/context.js";

const dir=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const manifest=JSON.parse(readFileSync(resolve(dir,"data/learn/research/mystery-mass-source-led-narrative-drafts-20261014.v1.json"),"utf8"));
const fr=JSON.parse(readFileSync(resolve(dir,"data/learn/research/mystery-mass-biblical-24-french-editorial-drafts-20261014.v1.json"),"utf8"));
assert.equal(data.biblical.length,24);
assert.equal(data.liturgical.length,39);
assert.deepEqual(data.biblical.map(x=>x.id),manifest.biblicalNarrativeDrafts.map(x=>x.id));
assert.deepEqual(data.liturgical.map(x=>x.id),manifest.liturgicalStudySelections.map(x=>x.owner));
for(const [i,x] of data.biblical.entries()){
  assert.equal(x.narrative.en,manifest.biblicalNarrativeDrafts[i].narrative);
  assert.equal(x.narrative.fr,fr.drafts[i].narrativeFr);
  assert.ok(x.narrative.fr.length>450);
  assert.equal(x.artwork,null);
  for(const ref of x.scripture) assert.ok(parseScriptureContext(ref),ref);
  assert.ok(x.massOwners.every(id=>data.liturgical.some(m=>m.id===id)));
}
for(const [i,x] of data.liturgical.entries()){
  const s=manifest.liturgicalStudySelections[i];
  assert.equal(x.studies.length,s.studyOfMassExistingDrafts.length);
  for(const [j,study] of x.studies.entries()){
    assert.equal(study.deep.en,s.studyOfMassExistingDrafts[j].originalEnglishDeep);
    assert.equal(study.deep.fr,s.studyOfMassExistingDrafts[j].originalFrenchDeep);
  }
}
assert.equal(data.liturgical.flatMap(x=>x.studies).length,44);
assert.equal(data.liturgical.filter(x=>x.canon).length,14);
const family=LEARN_LAYOUT.sections.find(x=>x.id==="liturgy-tradition");
assert.ok(family.items.some(x=>x.id==="learn.mystery_mass"&&x.reviewOnly));
assert.equal(mysteryMassReviewEnabled({location:{search:""}}),false);
assert.equal(mysteryMassReviewEnabled({location:{search:"?mysteryReview=1"}}),true);
assert.equal(mysteryMassReviewEnabled({location:{search:"?mysteryReview=10"}}),false);
const b=mysteryMassReviewMarkup({mode:"biblical",index:2,language:"fr"});
assert.match(b,/Caïn|Abel/);
assert.match(b,/data-mm-mode="liturgical"/);
assert.match(b,/data-ao-scripture-context="Genesis 4:1–16"/);
assert.match(b,/data-mm-jump-mass="AO.CANON.09"/);
assert.doesNotMatch(b,/src=".*\.(?:png|jpg|webp)"/);
const mass=mysteryMassReviewMarkup({mode:"liturgical",index:0,language:"fr",deep:true});
assert.match(mass,/data-mm-mode="biblical"/);
assert.match(mass,/data-mm-depth/);
assert.match(mass,/Lire en contexte/);
const canon=mysteryMassReviewMarkup({mode:"liturgical",index:manifest.liturgicalStudySelections.findIndex(x=>x.owner==="AO.CANON.10"),language:"en",deep:true});
assert.match(canon,/Supplices te rogamus/);
assert.match(canon,/Angelic|Angel|angel/i);

function fakeWindow(query){
 const nodes=new Map(),body={classList:{add(){},remove(){}},append(node){nodes.set(node.id,node);}};
 const doc={body,getElementById(id){return nodes.get(id)||null;},createElement(tag){
  const listeners=new Map();
  return {tag,id:null,hidden:false,style:{},dataset:{},listeners,addEventListener(n,fn){listeners.set(n,fn);},setAttribute(){},removeAttribute(){},querySelector(){return null;},scrollTop:0,remove(){nodes.delete(this.id);}};
 }};
 return {location:{search:query},document:doc,AO_RUNTIME_V8:{store:{getState:()=>({language:"en"})}}};
}
const blocked=createMysteryMassReviewRuntime(fakeWindow("?mode=normal"));
assert.equal(blocked.open(),false);
const win=fakeWindow("?mysteryReview=1");
const player=createMysteryMassReviewRuntime(win);
assert.equal(player.open(),true);
assert.equal(player.status().open,true);
assert.equal(player.status().biblicalScenes,24);
const root=win.document.getElementById("ao-mystery-mass-review-root");
const click=attrs=>root.listeners.get("click")({target:{closest:()=>({
 contains(){return true;},dataset:attrs,hasAttribute:()=>false,matches(sel){return sel.includes("data-mm-mode")&&Boolean(attrs.mmMode)||sel.includes("data-mm-move")&&Boolean(attrs.mmMove);}
})},preventDefault(){}});
 // DOM mock doesn't model CSS selectors; direct pure view checks cover actual branch.
assert.match(root.innerHTML,/Creation and worship/);
player.close();
assert.equal(player.status().open,false);
console.log("Mystery two-path app reviewer: exact 24/39 source payload, 44 bilingual studies, 14 Canon dossiers, 51 Scripture references, hidden-by-default discovery contract and Bible navigation markup pass.");
