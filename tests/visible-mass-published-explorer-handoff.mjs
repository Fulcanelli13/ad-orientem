import assert from "node:assert/strict";
import fs from "node:fs";
import {visibleMassResearchMomentLinks,openVisibleMassInExistingExplorer,
 VISIBLE_MASS_PUBLICATION_STATE} from "../previews/visible-mass-3d/photographic-published-explorer-handoff.mjs";

const expected=new Map([
 ["AL01",["AO.CARD.010","AO.CARD.015"]],
 ["AL06",["AO.CARD.015"]],
 ["AL07",["AO.CARD.015"]],
 ["AL19",[]],
 ["SN02",["AO.CARD.024","AO.CARD.025"]],
 ["SN04",[]]
]);
assert.equal(VISIBLE_MASS_PUBLICATION_STATE,"DRAFT_CONTEXTUAL_LINKS_REVIEW_ONLY");
const publishedReadings=JSON.parse(fs.readFileSync("data/learn/mass-explorer-prayer-readings.v1.json","utf8"));
const publishedExplorerSource=fs.readFileSync("src/learn/mass-explorer.js","utf8");
assert.equal(publishedReadings.status,"EDUCATIONAL_SOURCE_READING");
assert.equal(publishedReadings.scope,"EXPLORER_ONLY");
assert.equal(publishedReadings.entries.length,84,"Visible Mass must stay synchronized with current production Mass Explorer");
assert.ok(publishedExplorerSource.includes("mass-explorer-prayer-readings.js"),"canonical Mass Explorer must own the 84 readings");

for(const [id,ids] of expected){
 assert.deepEqual(visibleMassResearchMomentLinks(id).map(x=>x.guideId),[],
   "unapproved relationship must not be exposed by default");
 const links=visibleMassResearchMomentLinks(id,{reviewMode:true});
 assert.deepEqual(links.map(x=>x.guideId),ids);
 assert.ok(links.every(x=>x.publication==="RESEARCH_CANDIDATE_NOT_RITUAL_INSTRUCTION"));
 assert.ok(links.every(x=>x.destination==="learn.mass_explorer"));
}
assert.deepEqual(visibleMassResearchMomentLinks("UNKNOWN",{reviewMode:true}),[]);
const trigger={tagName:"BUTTON",focus(){}};
const calls=[];
const app={AO_MODULES:{async open(id,opts){calls.push({id,opts});return {ok:true};}}};
const success=await openVisibleMassInExistingExplorer(app,{
 objectId:"SN02",guideId:"AO.CARD.024",reviewMode:true,trigger});
assert.equal(success.ok,true);
assert.equal(success.momentKey,"AO.CARD.024");
assert.equal(calls.length,1);
assert.equal(calls[0].id,"learn.mass_explorer");
assert.equal(calls[0].opts.trigger,trigger);
assert.equal(calls[0].opts.momentKey,"AO.CARD.024");
assert.equal((await openVisibleMassInExistingExplorer(app,{objectId:"SN02",guideId:"AO.CARD.024",trigger})).ok,false);
assert.equal(calls.length,1,"default must not open an unapproved relationship");
assert.equal((await openVisibleMassInExistingExplorer(app,{objectId:"SN02",guideId:"AO.CARD.025",reviewMode:true,form:"LOW"})).reason,"EXPLORER_GUIDE_IS_SUNG_ONLY");
assert.equal(calls.length,1,"Low Mass may not inherit Sung Guide navigation");
assert.equal((await openVisibleMassInExistingExplorer(app,{objectId:"AL19",guideId:"AO.CARD.015",reviewMode:true})).ok,false);
assert.equal(calls.length,1);
assert.equal((await openVisibleMassInExistingExplorer({}, {objectId:"AL01",guideId:"AO.CARD.015",reviewMode:true})).reason,"PRODUCTION_EXPLORER_NOT_IN_STANDALONE_PREVIEW");
let fallbackOpts;
const fallback={AO_MASS_EXPLORER_V1:{async open(opts){fallbackOpts=opts;return true;}}};
assert.equal((await openVisibleMassInExistingExplorer(fallback,{objectId:"AL01",guideId:"AO.CARD.010",reviewMode:true,trigger})).ok,true);
assert.equal(fallbackOpts.momentKey,"AO.CARD.010");
const stale=await openVisibleMassInExistingExplorer({AO_MODULES:{open:async()=>({ok:false})}},{objectId:"AL01",guideId:"AO.CARD.010",reviewMode:true});
assert.equal(stale.reason,"EXISTING_MASS_EXPLORER_REJECTED");
const source=fs.readFileSync("previews/visible-mass-3d/photographic-published-explorer-handoff.mjs","utf8");
assert.ok(!source.includes("guideRegistry.entries"));
assert.ok(!source.includes("readings.v1.json"));
assert.ok(!source.includes("AO.SM.B001"));
console.log("PASS Visible Mass published Explorer handoff: exact six-photo preview links, no duplicate Guide or prayer copy, native production API only, fail-closed form and standalone.");
