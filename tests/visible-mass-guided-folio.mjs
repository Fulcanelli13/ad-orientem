import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {createVisibleMassDialogueDirector} from "../previews/visible-mass-3d/visible-mass-dialogue-director.mjs";
import {mountVisibleMassDialogueFolio} from "../previews/visible-mass-3d/visible-mass-dialogue-folio.mjs";
import {validateVisibleMassBeats,VISIBLE_MASS_BEATS,VISIBLE_MASS_PATH_OPENINGS,
 VISIBLE_MASS_PRIORITY_CROSSOVERS,VISIBLE_MASS_BEAT_STATUS} from "../previews/visible-mass-3d/visible-mass-narrative-beats.mjs";
const dir="previews/visible-mass-3d/";
const read=p=>JSON.parse(fs.readFileSync(dir+p,"utf8"));
const graph=read("GUIDED_TRAIL_GRAPH_RESEARCH_20261018.v1.json");
const pilot=read("PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json");
const historic=read("HISTORICAL_SYMBOLIC_ANSWERS_20261017.v1.json");
const functional=read("HISTORICAL_FUNCTIONAL_ANSWERS_NEXT_20261017.v1.json");
const answerIds=[...historic.answers,...functional.answers].map(x=>x.question_id);
assert.equal(answerIds.length,97);
const beats=validateVisibleMassBeats(graph,pilot,answerIds);
assert.equal(beats.originalVMQStops,19);
assert.equal(beats.crossovers,6);
assert.equal(beats.status,VISIBLE_MASS_BEAT_STATUS);
assert.equal(VISIBLE_MASS_PRIORITY_CROSSOVERS.length,6);
assert.equal(Object.keys(VISIBLE_MASS_PATH_OPENINGS).length,4);
assert.ok(Object.values(VISIBLE_MASS_BEATS).every(b=>b.status===VISIBLE_MASS_BEAT_STATUS));
assert.ok(Object.values(VISIBLE_MASS_BEATS).every(b=>!b.observation.includes("St Pius X")));

const make=(initialState=null)=>createVisibleMassDialogueDirector(graph,pilot,answerIds,{initialState});
const g=make();
assert.equal(g.status().active,null);
assert.equal(g.nextSuggestion(),null);
assert.equal(g.chooseTrail("FIRST_VISIT"),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0062");
assert.equal(g.nextSuggestion().objectId,"SN04");
assert.equal(g.status().readCount,0);
assert.equal(g.skipSuggestion(),true);
assert.equal(g.status().readCount,0,"skipping must not count as read");
assert.equal(g.nextSuggestion().questionId,"VMQ-0056");
assert.equal(g.target("VMQ-0062").objectId,"SN04","first visit now opens the original sanctuary-step photo marker");
assert.equal(g.target("VMQ-0052").objectId,"AL19","retable is the same-photo hotspot");
assert.equal(g.target("VMQ-0017").objectId,"AL07","candlesticks are a mapped hotspot");
assert.equal(g.target("VMQ-0018"),null,"held candle-count rubric may not be answered");
assert.equal(g.target("VMQ-0064"),null,"held step-count rubric may not be answered");
assert.equal(g.markRead("VMQ-0056"),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0001");
assert.equal(g.markRead("VMQ-0001"),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0013");
assert.equal(g.chooseTrail("ALTAR_MYSTERY"),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0013");
assert.equal(g.markRead("VMQ-0013"),true);
assert.equal(g.status().readCount,3);
assert.equal(g.nextSuggestion().questionId,"VMQ-0014");
assert.equal(g.chooseTrail("FIRST_VISIT"),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0005","shared read IDs must not replay on switching paths");
assert.equal(g.skipTrail(),true);
assert.equal(g.status().visible,false);
assert.equal(g.status().readCount,3);
assert.equal(g.skipSuggestion(),false,"a paused trail cannot silently advance itself");
assert.equal(g.chooseTrail("FOLLOW_PRIEST"),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0065","priest route begins with original steps source");
assert.equal(g.leaveGuide(),true);
assert.equal(g.status().visible,false);
assert.equal(g.resume(),true);
assert.equal(g.nextSuggestion().questionId,"VMQ-0065");
const restored=make(g.serialize());
assert.equal(restored.status().active,"FOLLOW_PRIEST");
assert.equal(restored.status().readCount,3);
assert.equal(restored.nextSuggestion().questionId,"VMQ-0065");
assert.equal(restored.chooseTrail("FIRST_VISIT"),true);
assert.equal(restored.nextSuggestion().questionId,"VMQ-0005");
assert.equal(restored.markRead("VMQ-0064"),false);
assert.equal(restored.status().readCount,3);
assert.equal(restored.target("VMQ-0057").objectId,"SN02");
assert.ok(restored.related("VMQ-0013").some(q=>q.questionId==="VMQ-0014"));
assert.ok(restored.related("VMQ-0013").every(q=>["AL01","AL06","AL07","AL19","SN02","SN04"].includes(q.objectId)));
assert.equal(restored.chooseTrail("SANCTUARY_SECRETS"),true);
assert.equal(restored.nextSuggestion().questionId,"VMQ-0052");
assert.equal(restored.markRead("VMQ-0052"),true);
assert.equal(restored.nextSuggestion().questionId,"VMQ-0053");
assert.equal(restored.chooseTrail("FIRST_VISIT"),true);
assert.equal(restored.nextSuggestion().questionId,"VMQ-0005","reading retable must not reset previous path");
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
for(const id of ["guide-dock","guide-toggle","guide-status","guide-routes","guide-actions","guide-opening","guide-prompt","guide-target"])
 elements.set(id,doc.createElement("div"));
const storage=new Map();
const win={document:doc,sessionStorage:{
  getItem:k=>storage.get(k)??null,
  setItem:(k,v)=>storage.set(k,v)
}};
const hits=[];const focused=[];
let folio=mountVisibleMassDialogueFolio(win,{graph,pilot,answerIds,onPreview:id=>focused.push(id),navigate:(objectId,questionId)=>{
 hits.push({objectId,questionId});return true;
}});
assert.equal(elements.get("guide-dock").hidden,false);
assert.equal(elements.get("guide-routes").children.length,4);
assert.equal(folio.chooseTrail("ALTAR_MYSTERY"),true);
assert.equal(folio.nextSuggestion().questionId,"VMQ-0013");
assert.equal(elements.get("guide-opening").textContent,VISIBLE_MASS_PATH_OPENINGS.ALTAR_MYSTERY);
assert.equal(elements.get("guide-opening").hidden,false);
assert.equal(elements.get("guide-prompt").textContent,VISIBLE_MASS_BEATS["VMQ-0013"].observation);
assert.equal(elements.get("guide-target").textContent,pilot.questions.find(q=>q.id==="VMQ-0013").question.en);
const alternate=elements.get("guide-actions").children.find(b=>b.dataset.guideQuestion==="VMQ-0014");
assert.ok(alternate,"Calvary alternative should be available from photographed crucifix");
assert.equal(alternate.textContent,pilot.questions.find(q=>q.id==="VMQ-0014").question.en);
const photoFocus=elements.get("guide-actions").children.find(b=>b.dataset.guidePreview==="AL06");
assert.ok(photoFocus);photoFocus.onclick();
assert.deepEqual(focused,["AL06"],"focus must use genuine photographed object identity");
assert.equal(folio.status().readCount,0,"pointing at a photo is not a discovery");
assert.deepEqual(hits,[],"a photo focus must not open a source answer");
assert.equal(folio.explore("VMQ-0013"),true);
assert.deepEqual(hits,[{objectId:"AL06",questionId:"VMQ-0013"}]);
assert.equal(folio.status().readCount,0,"navigating to a question must not mark it as read");
assert.equal(folio.markRead("VMQ-0013"),true);
assert.equal(folio.nextSuggestion().questionId,"VMQ-0014");
assert.equal(elements.get("guide-opening").hidden,true,"introductory narrative must not recur after original question opens");
const actions=elements.get("guide-actions").children;
const skip=actions.find(b=>b.textContent==="Skip suggestion");
assert.ok(skip);skip.onclick();
assert.equal(folio.nextSuggestion().questionId,"VMQ-0002");
assert.equal(folio.status().readCount,1);
const afterSkip=folio.serialize();
assert.equal(elements.get("guide-prompt").textContent,VISIBLE_MASS_BEATS["VMQ-0002"].observation);
folio=mountVisibleMassDialogueFolio(win,{graph,pilot,answerIds,navigate:()=>true});
assert.deepEqual(folio.serialize(),afterSkip,"same-session remount preserves reads and per-trail skips");
assert.equal(folio.nextSuggestion().questionId,"VMQ-0002");
assert.equal(folio.chooseTrail("ALTAR_MYSTERY"),true);
assert.equal(elements.get("guide-opening").hidden,true,"already introduced paths cannot repeat introduction");
assert.equal(folio.chooseTrail("SANCTUARY_SECRETS"),true);
assert.equal(folio.nextSuggestion().questionId,"VMQ-0052");
assert.equal(folio.explore("VMQ-0052"),true);
assert.equal(folio.markRead("VMQ-0052"),true);
assert.equal(folio.nextSuggestion().questionId,"VMQ-0053");
folio.chooseTrail("FOLLOW_PRIEST");
assert.equal(folio.nextSuggestion().questionId,"VMQ-0065");
assert.equal(folio.explore("VMQ-0065"),true);
assert.equal(folio.markRead("VMQ-0065"),true);
assert.equal(folio.nextSuggestion().questionId,"VMQ-0063");
// Dismiss an entire trail; every alternative trail must remain selectable.
const dismiss=elements.get("guide-actions").children.flatMap(x=>x.className==="guide-exits"?x.children:[x]).find(b=>b.textContent==="Skip this path");
assert.ok(dismiss);
dismiss.onclick();
assert.equal(folio.status().visible,false);
assert.equal(elements.get("guide-routes").children.length,4,"skipping a trail cannot trap visitors in an old path");
const secret=elements.get("guide-routes").children.find(b=>b.dataset.trail==="SANCTUARY_SECRETS");
assert.ok(secret);
secret.onclick();
assert.equal(folio.status().active,"SANCTUARY_SECRETS");
assert.equal(folio.nextSuggestion().questionId,"VMQ-0053");
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
console.log("PASS Visible Mass M2 guide: original six-photo VMQ gates, non-fiction dialogue beats, six editorial crossovers, photo-only focus, no replay, skip/switch/resume and session restoration.");
