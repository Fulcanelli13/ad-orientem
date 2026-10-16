import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  buildMassExplorerCatalog,getMassExplorerMoment,massExplorerIndexHtml,
  massExplorerMomentHtml,MASS_EXPLORER_ROUTE
} from "../src/learn/mass-explorer.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const data=path=>JSON.parse(read(path));
const guides=data("data/presentation/guide-registry.v1.json");
const sung=data("data/presentation/reader-text-sung.v1.json");
const french=data("data/presentation/reader-french-ordinary.v1.json");
const catalog=buildMassExplorerCatalog(guides,sung,french);
assert.equal(MASS_EXPLORER_ROUTE,"learn.mass_explorer");
assert.equal(catalog.sequence.length,32,"every published Guide moment remains navigable");
assert.equal(catalog.byBlock.size,sung.blocks.length,"no Sung source block omitted");
assert.equal(catalog.byBlock.size,96,"pinned Sung source corpus contract");
assert.equal(catalog.source,"CERTIFIED_SUNG_GUIDE_AND_RITUAL_TEXT");
assert.equal(catalog.crosswalkStatus,"P0_PENDING");
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
const en=massExplorerMomentHtml(catalog,"AO.CARD.010",{blockId:"AO.SM.B031"});
assert.match(en,/Suscipe, sancte Pater/);
assert.match(en,/Suscipe, sancte Pater, omnipotens/);
assert.match(en,/Original Guide|SUNG MASS/);
assert.match(en,/data-ao-mx-block="AO.SM.B031"/);
assert.doesNotMatch(en,/research-only manuscript|Ultra Master claim/);
const fr=massExplorerMomentHtml(catalog,"AO.CARD.010",{blockId:"AO.SM.B031",french:true});
assert.match(fr,/Guide d’origine|Guide d’ORIGINE|MESSE CHANTÉE/);
assert.match(fr,/Suscipe, sancte Pater/);
assert.match(fr,/data-ao-mx-current="AO.CARD.010"/);
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
assert.match(formationHome,/id:"learn.mass"/,"existing Formation stays in service");
console.log("Mass Explorer: 32 Guide routes, 96 Sung source blocks, bilingual witness, Scripture capsules, legacy Formation and P0 hold passed");
