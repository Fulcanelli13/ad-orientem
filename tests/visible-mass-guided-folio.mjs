import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {createVisibleMassDialogueDirector} from "../previews/visible-mass-3d/visible-mass-dialogue-director.mjs";
import {mountVisibleMassDialogueFolio} from "../previews/visible-mass-3d/visible-mass-dialogue-folio.mjs";
const dir="previews/visible-mass-3d/";
const read=p=>JSON.parse(fs.readFileSync(dir+p,"utf8"));
const graph=read("GUIDED_TRAIL_GRAPH_RESEARCH_20261018.v1.json");
const pilot=read("PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json");
const historic=read("HISTORICAL_SYMBOLIC_ANSWERS_20261017.v1.json");
const functional=read("HISTORICAL_FUNCTIONAL_ANSWERS_NEXT_20261017.v1.json");
const answerIds=[...historic.answers,...functional.answers].map(x=>x.question_id);
assert.equal(answerIds.length,97);
const make=(initialState=null)=>createVisibleMassDialogueDirector(graph,pilot,answerIds,{initialState});
const g=make();
assert.equal(g.status().active,null);
assert.equal(g.nextSuggestion(),null);
assert.equal(g.chooseTrail("FIRST_VISIT"),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0056");
assert.equal(g.nextSuggestion().objectId,"SN02");
assert.equal(g.status().readCount,0);
assert.equal(g.skipSuggestion(),true);
assert.equal(g.status().readCount,0,"skipping must not count as read");
assert.equal(g.nextSuggestion().questionId,"VMQ-0001");
assert.equal(g.target("VMQ-0062"),null,"three-hotspot slice cannot fake sanctuary-step camera");
assert.equal(g.target("VMQ-0018"),null,"pending rubrical answer must never be shown as resolved");
assert.equal(g.markRead("VMQ-0001"),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0013");
assert.equal(g.chooseTrail("ALTAR_MYSTERY"),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0013");
assert.equal(g.markRead("VMQ-0013"),true);
assert.equal(g.status().readCount,2);
assert.equal(g.nextSuggestion().questionId,"VMQ-0014");
assert.equal(g.chooseTrail("FIRST_VISIT"),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0005","shared read IDs must not replay on switching paths");
assert.equal(g.skipTrail(),true);
assert.equal(g.status().visible,false);
assert.equal(g.status().readCount,2);
assert.equal(g.chooseTrail("FOLLOW_PRIEST"),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0005");
assert.equal(g.leaveGuide(),true);
assert.equal(g.status().visible,false);
assert.equal(g.resume(),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0005");
const restored=make(g.serialize());
assert.equal(restored.status().active,"FOLLOW_PRIEST");
assert.equal(restored.status().readCount,2);
assert.equal(restored.nextSuggestion().questionId,"VMQ-0005");
assert.equal(restored.chooseTrail("FIRST_VISIT"),true);
assert.equal(restored.nextSuggestion().questionId,"VMQ-0005");
assert.equal(restored.markRead("VMQ-0064"),false);
assert.equal(restored.status().readCount,2);
assert.equal(restored.target("VMQ-0057").objectId,"SN02");
assert.ok(restored.related("VMQ-0013").some(q=>q.questionId==="VMQ-0014"));
assert.ok(restored.related("VMQ-0013").every(q=>["AL01","AL06","SN02"].includes(q.objectId)));
assert.deepEqual([...new Set(restored.status().availableRoutes.map(t=>t.id))].sort(),["ALTAR_MYSTERY","FIRST_VISIT","FOLLOW_PRIEST","SANCTUARY_SECRETS"]);
assert.equal(restored.chooseTrail("BAD_ID"),false);

// The live folio is pure UI: simulate the host document and verify the
// original source ID is handed to the original photo/question owner.
const elements=new Map();
const doc={
  getElementById:id=>elements.get(id),
  createElement:tag=>({
    tagName:tag.toUpperCase(),children:[],dataset:{},hidden:false,attributes:{},
    setAttribute(k,v){this.attributes[k]=v;},
    append(...items){this.children.push(...items);},
    appendChild(item){this.children.push(item);return item;},
    replaceChildren(...items){this.children=[...items];}
  })
};
for(const id of ["guide-dock","guide-toggle","guide-status","guide-routes","guide-actions","guide-prompt","guide-target"])
 elements.set(id,doc.createElement("div"));
const storage=new Map();
const win={document:doc,sessionStorage:{
  getItem:k=>storage.get(k)??null,
  setItem:(k,v)=>storage.set(k,v)
}};
const hits=[];
let folio=mountVisibleMassDialogueFolio(win,{graph,pilot,answerIds,navigate:(objectId,questionId)=>{
 hits.push({objectId,questionId});return true;
}});
assert.equal(elements.get("guide-dock").hidden,false);
assert.equal(elements.get("guide-routes").children.length,4);
assert.equal(folio.chooseTrail("ALTAR_MYSTERY"),true);
assert.equal(folio.nextSuggestion().questionId,"VMQ-0013");
assert.equal(elements.get("guide-prompt").textContent,pilot.questions.find(q=>q.id==="VMQ-0013").question.en);
assert.equal(folio.explore("VMQ-0013"),true);
assert.deepEqual(hits,[{objectId:"AL06",questionId:"VMQ-0013"}]);
assert.equal(folio.status().readCount,0,"navigating to a question must not mark it as read");
assert.equal(folio.markRead("VMQ-0013"),true);
assert.equal(folio.nextSuggestion().questionId,"VMQ-0014");
const actions=elements.get("guide-actions").children;
const skip=actions.find(b=>b.textContent==="Skip suggestion");
assert.ok(skip);skip.onclick();
assert.equal(folio.nextSuggestion().questionId,"VMQ-0002");
assert.equal(folio.status().readCount,1);
const afterSkip=folio.serialize();
folio=mountVisibleMassDialogueFolio(win,{graph,pilot,answerIds,navigate:()=>true});
assert.deepEqual(folio.serialize(),afterSkip,"same-session remount preserves reads and per-trail skips");
assert.equal(folio.nextSuggestion().questionId,"VMQ-0002");
const source=fs.readFileSync(dir+"sanctuary-hotspot-pilot.html","utf8");
assert.match(source,/visible-mass-dialogue-folio\.mjs/);
assert.match(source,/GUIDED_TRAIL_GRAPH_RESEARCH_20261018\.v1\.json/);
assert.match(source,/function guideNavigate\(/);
assert.match(source,/state\.guide\?\.markRead\(q\.id\)/);
assert.match(source,/id="guide-dock"/);
assert.match(source,/id="guide-return"/);
const script=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script);new vm.Script(script);
assert.doesNotMatch(source,/<canvas\b/);
console.log("PASS Visible Mass three-photo guided dialogue: skip, switch, suspend/resume, shared reads, held answer gates, original photo VMQ navigation and session restoration.");
