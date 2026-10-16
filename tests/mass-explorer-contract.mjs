import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  buildMassExplorerCatalog,getMassExplorerMoment,massExplorerIndexHtml,
  massExplorerMomentHtml,MASS_EXPLORER_ROUTE
} from "../src/learn/mass-explorer.js";
import {MASS_MAP_PHASES,massMapPhaseIndex,projectMassMap,massMapHtml,massMapCss} from "../src/learn/mass-map.js";
import {massStudyStages,massStudyPathsHtml} from "../src/learn/mass-study-paths.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const data=path=>JSON.parse(read(path));
const guides=data("data/presentation/guide-registry.v1.json");
const sung=data("data/presentation/reader-text-sung.v1.json");
const french=data("data/presentation/reader-french-ordinary.v1.json");
const catalog=buildMassExplorerCatalog(guides,sung,french);
const formation=data("data/learn/mass-formation-campion.v1.json");
const full=buildMassExplorerCatalog(guides,sung,french,formation);
assert.equal(full.formationStages.length,8);
assert.equal(massStudyStages(formation).length,8);
assert.deepEqual(full.formationStages.map(x=>x.id),["MF01","MF02","MF03","MF04","MF05","MF06","MF07","MF08"]);
assert.equal(full.formationStages[2].title.en,"The Offertory and your offering");
const thematicHtml=massStudyPathsHtml(full.formationStages);
assert.equal((thematicHtml.match(/data-ao-mx-stage="MF0[1-8]"/g)||[]).length,8);
assert.match(thematicHtml,/id="ao-mx-themes"/);
assert.match(massStudyPathsHtml(full.formationStages,{french:true}),/L’Offertoire et votre offrande/);
assert.match(massMapHtml(full,{studyHtml:thematicHtml}),/data-ao-mx-stage="MF03"/);
assert.throws(()=>massStudyStages({...formation,stages:formation.stages.slice(1)}),/eight published/);

assert.equal(MASS_EXPLORER_ROUTE,"learn.mass_explorer");
assert.equal(catalog.sequence.length,32,"every published Guide moment remains navigable");
assert.equal(catalog.byBlock.size,sung.blocks.length,"no Sung source block omitted");
assert.equal(catalog.byBlock.size,96,"pinned Sung source corpus contract");
assert.equal(catalog.source,"CERTIFIED_SUNG_GUIDE_AND_RITUAL_TEXT");
assert.equal(catalog.crosswalkStatus,"P0_PENDING");
const map=projectMassMap(catalog);
assert.equal(map.momentCount,32);
assert.equal(map.blockCount,96);
assert.equal(map.provenance,"PUBLISHED_SUNG_GUIDE_AND_SOURCE_ONLY");
assert.equal(map.relationshipStatus,"P0_PENDING");
assert.deepEqual(map.phases.map(p=>p.stops.length),[1,9,9,7,6]);
assert.equal(MASS_MAP_PHASES.length,5);
assert.equal(massMapPhaseIndex(0),0);
assert.equal(massMapPhaseIndex(10),2);
assert.equal(massMapPhaseIndex(31),4);
assert.equal(massMapPhaseIndex(32),-1);
assert.deepEqual(map.phases.flatMap(x=>x.stops.map(s=>s.key)),catalog.sequence);
assert.equal(map.phases.flatMap(x=>x.stops).reduce((count,stop)=>count+stop.blocks.length,0),96);
const mapEn=massMapHtml(catalog);
const mapFr=massMapHtml(catalog,{french:true});
assert.match(mapEn,/data-ao-mx-map="sung"/);
assert.equal((mapEn.match(/data-ao-mx-moment="/g)||[]).length,32);
assert.equal((mapEn.match(/data-ao-mx-map-block="/g)||[]).length,96);
assert.equal((mapEn.match(/data-ao-mx-phase="/g)||[]).length,5);
assert.match(mapEn,/data-ao-mx-moment="AO.CARD.010"/);
assert.match(mapEn,/data-ao-mx-map-block="AO.SM.B031"/);
assert.match(mapEn,/data-ao-mx-open-mass/);
assert.match(mapFr,/Carte de la Messe/);
assert.match(mapEn,/THE 1962 SUNG MASS · STUDY MAP/);
assert.doesNotMatch(mapEn,/unpublished Ultra Master|P0 draft bibliography/);
assert.match(massMapCss(),/aoMXMapJourney/);
assert.throws(()=>projectMassMap({...catalog,sequence:catalog.sequence.slice(1)}),/32 published Guide/);
for(const [key,entry] of catalog.byKey){
  assert.equal(entry.guide.key,key);
  if(key.startsWith("AO.CARD."))assert.ok(entry.blocks.length,key+" needs canonical text block ownership");
}
for(const block of sung.blocks){
  assert.equal(getMassExplorerMoment(catalog,block.Block_ID).key,
    "AO.CARD."+block.Macro_ID.slice(-2).padStart(3,"0"));
}
assert.equal(getMassExplorerMoment(catalog,"AO.SM.B031").selectedBlockId,"AO.SM.B031");
assert.equal(getMassExplorerMoment(catalog,"AO.SM.B031",{form:"LOW"}),null,
  "Sung witness must not masquerade as Low Mass");
assert.equal(getMassExplorerMoment(catalog,"AO.SM.DOES_NOT_EXIST"),null);
const en=massExplorerMomentHtml(full,"AO.CARD.010",{blockId:"AO.SM.B031"});
assert.match(en,/Suscipe, sancte Pater/);
assert.match(en,/Suscipe, sancte Pater, omnipotens/);
assert.match(en,/Original Guide|SUNG MASS/);
assert.match(en,/data-ao-mx-block="AO.SM.B031"/);
assert.match(en,/data-ao-mx-jump="prayer"/);
assert.match(en,/data-ao-mx-jump="guide"/);
assert.match(en,/data-ao-mx-jump="course"/);
assert.match(en,/The Offertory and your offering/);
assert.doesNotMatch(en,/data-ao-mx-jump="scripture"/,
  "Original Offertory Guide has no approved direct Scripture capsule: keep Romans within MF03");
assert.match(en,/class="aoMXAction" data-ao-mx-cue="AO.SM.C0111"/,"priestly action must have separate semantic presentation");
assert.doesNotMatch(en,/<p lang="la" class="aoMXLatin">\[MAKES THE CROSS/,"English rubrics must not be marked as Latin");
assert.doesNotMatch(en,/research-only manuscript|Ultra Master claim/);
const fr=massExplorerMomentHtml(catalog,"AO.CARD.010",{blockId:"AO.SM.B031",french:true});
assert.match(fr,/Guide d’origine|Guide d’ORIGINE|MESSE CHANTÉE/);
assert.match(fr,/Suscipe, sancte Pater/);
assert.match(fr,/data-ao-mx-current="AO.CARD.010"/);
const study=massExplorerMomentHtml(catalog,"AO.CARD.003");
assert.match(study,/data-ao-mx-study="MF01"/,"existing Formation owner must be reachable");
assert.match(read("src/learn/mass-formation.js"),/state\.explorerReturn/,"return to actually visited Explorer must be supported");
const sanctus=massExplorerMomentHtml(catalog,"AO.CARD.013");
assert.match(sanctus,/data-ao-scripture-context/,"reuse existing Scripture click owner");
assert.match(sanctus,/Isaiah|Matthew|Sanctus/);
const list=massExplorerIndexHtml(catalog);
assert.equal((list.match(/data-ao-mx-moment=/g)||[]).length,32);
assert.match(list,/Mass Explorer/);
assert.match(list,/data-ao-mx-moment="PRE.ASPERGES"/);
assert.match(list,/data-ao-mx-moment="POST.MASS"/);
assert.match(massExplorerMomentHtml(catalog,"AO.CARD.010",{blockId:"AO.SM.B030"}),/variable Proper text/);
const script=read("src/learn/browser-entry.js");
const lazy=read("src/learn/lazy-module-registry.js");
const formationHome=read("src/learn/presentation.js");
assert.match(script,/MASS_EXPLORER_ROUTE_ID/);
assert.match(lazy,/massExplorer:\(\)=>import\("\.\/mass-explorer\.js"\)/);
assert.match(formationHome,/id:"learn.mass_explorer"/);
assert.match(read("src/learn/mass-explorer.js"),/massStudyPathsHtml\(catalog\.formationStages/);
assert.match(read("src/learn/mass-formation.js"),/studyStageId:/);
assert.match(formationHome,/id:"learn.mass"/,"existing Formation stays in service");
console.log("Mass Map + Explorer: five visual phases, 32 Guide routes, 96 Sung source blocks, bilingual witness, Scripture capsules, legacy Formation and P0 hold passed");
