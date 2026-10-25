import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CUE_SURFACE,resolveCueSurface,sourceActionRubricLabel}
  from "../src/mass/reader-cue-visual-policy.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const canon=read("data/presentation/mass-icon-canonical-set-20261021.v1.json");
const actions=read("data/presentation/reader-priest-actions.v1.json").items;
const source=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const gap=new Set(canon.gaps.map(x=>x.meaningId));
assert.equal(gap.size,10);
const base={
 mode:"LIVE",cueId:"AO.SM.C0204",sourceCueId:"AO.SM.C0204",
 actionMeaning:"priest.action.minor_elevation",iconKey:null,iconUrl:null,
 hasSourceRubric:false,printedRubric:false,
};
assert.equal(resolveCueSurface(base),CUE_SURFACE.INLINE_RUBRIC);
for(const bad of [
 {...base,mode:"SIMPLE"}, {...base,mode:"MISSAL"},
 {...base,sourceCueId:"AO.SM.C0205"},
 {...base,cueId:"UNKNOWN"}, {...base,actionMeaning:"POSITION_TRANSITION"},
 {...base,actionMeaning:"faithful.gesture.bow_head"},
 {...base,hasSourceRubric:true}, {...base,printedRubric:true},
])assert.equal(resolveCueSurface(bad),CUE_SURFACE.GUIDE_ONLY,
  "Never invent a new non-source action or duplicate printed rubrics");
assert.equal(resolveCueSurface({...base,iconKey:"canon:priest.action.elevate_host",iconUrl:"/approved/host.svg"}),
 CUE_SURFACE.ICON);
assert.equal(resolveCueSurface({...base,iconKey:"canon:priest.action.elevate_host",iconUrl:null}),
 CUE_SURFACE.INLINE_RUBRIC,"An icon identifier without an actual asset is not a pictogram");
assert.equal(sourceActionRubricLabel("MINOR ELEVATION","en"),"The priest raises the Host and chalice slightly.");
assert.equal(sourceActionRubricLabel("MINOR ELEVATION","fr"),"Le prêtre élève légèrement l’Hostie et le calice.");
assert.equal(sourceActionRubricLabel(""),null);
assert.ok(actions.some(x=>x.cueId==="AO.SM.C0204"&&x.label==="MINOR ELEVATION"));
assert.ok(actions.some(x=>x.cueId==="AO.SM.C0242"&&x.label==="SHOWS SACRED HOST"));
for(const guard of [
 "function syncRailIconSurfaces(root)",'item.dataset.iconVisible=String(visual)',
 "function syncIconlessSourceRubric(root,current,mode,iconResolver,form)",
 'note.dataset.sourceCueId=cueId','note.dataset.observedNow="false"',
 "syncIconlessSourceRubric(root,current,mode,iconResolver",
 'node.dataset.cueId===cueId',
 'icon.dataset.approvedPriestHeadBowEvent=event.id'
])assert.ok(source.includes(guard),"Source/meaning contract removed: "+guard);
assert.ok(!source.includes('display:block!important;max-width:50px;padding:2px;'),
 "A miniature fallback label still occupies an empty LIVE rail box");
console.log("Mass cue visual policy: PASS — ICON/INLINE_RUBRIC/GUIDE_ONLY, exact source ownership, no miniature empty rail labels.");
