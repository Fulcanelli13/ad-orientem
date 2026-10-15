import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ACTIVE_SAINTS_CHANNEL,SAINTS_CHANNELS,applySaintsReleaseBoundary} from "../src/find/saints-release-policy.js";
import {projectSaintCatalogueItems} from "../src/find/saints-catalogue.js";
import {projectSaintSourceIndexItems} from "../src/find/saints-source-index.js";
import {projectSaintPlaceItems} from "../src/find/saints-lens.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const researchData={
 saints:read("data/saints/holiness-first-editorial-pilot-20261015.v1.json"),
 saintsDoctors:read("data/saints/holiness-first-eight-doctors-research-20261015.v1.json"),
 saintsVocations:read("data/saints/holiness-first-sixteen-cross-vocation-research.v1.json"),
 saintsOwnerIndex:read("data/saints/read-only-calendar-art-index-20261015.v1.json"),
 saintsCalendarBridge:read("data/saints/parallel-owner-identity-bridge-20261015.v1.json"),
 geography:{places:read("data/geography/seed-registry.v1.json").places},
 shrines:{shrines:read("data/shrines/shrines-pilgrimages-seed.v1.json").shrines}
};
assert.equal(ACTIVE_SAINTS_CHANNEL,SAINTS_CHANNELS.PILOT_SIX,
 "Public source channel must be explicitly reviewed before wider release");
const publicDataset=applySaintsReleaseBoundary(researchData);
assert.equal(publicDataset.saintsRelease.channel,"PILOT_SIX");
assert.equal(publicDataset.saintsRelease.researchEnabled,false);
assert.equal(publicDataset.saintsDoctors,null);
assert.equal(publicDataset.saintsVocations,null);
assert.equal(publicDataset.saintsOwnerIndex,null);
assert.equal(publicDataset.saintsRelease.publicPortraitsApproved,false);
assert.equal(publicDataset.saintsRelease.allowUncertified1962Mass,false);
const original=projectSaintPlaceItems(researchData);
const publicSites=projectSaintPlaceItems(publicDataset);
assert.equal(original.length,9);
assert.equal(publicSites.length,9);
assert.equal(publicSites.filter(x=>x.map_publishable).length,8);
const pub=projectSaintCatalogueItems(publicDataset);
assert.equal(pub.length,6,"No 24 unapproved biographies in public list");
assert(pub.every(x=>x.saints.length===1&&x.saints[0].artwork_id===null));
assert(pub.some(x=>x.saint_id==="blessed:jacques-desire-laval"),
 "Blessed person remains blessed, never auto-canonized");
assert.equal(projectSaintSourceIndexItems(publicDataset,"historical").length,0);
assert.equal(projectSaintSourceIndexItems(publicDataset,"later").length,0);
assert.equal(projectSaintSourceIndexItems(publicDataset,"doctors").length,0);
const publicVm=buildExploreViewModel({language:"en",lens:"saints",view:"list",items:pub,
 filters:{saintScope:"profiles",saintCategory:"ALL"},saintsRelease:publicDataset.saintsRelease});
const html=renderExploreToString(publicVm);
assert(html.includes("Six source-linked Saints pilot profiles"));
assert(html.includes("6</strong><span>saint profiles"));
assert(!html.includes('data-find-filter="saintScope"'));
assert(!html.includes('data-find-filter="saintCategory"'));
assert(!html.includes("24 additional lives"));
assert(!html.includes("John Chrysostom"));
assert(!html.includes('data-explore-item="saints:person:saint:thomas-aquinas"'));
const research=applySaintsReleaseBoundary(researchData,SAINTS_CHANNELS.RESEARCH_PREVIEW);
assert.equal(research.saintsRelease.researchEnabled,true);
assert.equal(projectSaintCatalogueItems(research).length,30);
assert.equal(projectSaintSourceIndexItems(research,"historical").length,307);
assert.equal(projectSaintSourceIndexItems(research,"later").length,271);
assert.equal(projectSaintSourceIndexItems(research,"doctors").length,38);
const devVm=buildExploreViewModel({language:"en",lens:"saints",view:"list",
 items:projectSaintCatalogueItems(research),filters:{saintScope:"profiles"},
 saintsRelease:research.saintsRelease});
assert(renderExploreToString(devVm).includes('data-find-filter="saintScope"'));
console.log("PASS Saints release gate: default 6 public/9 sites/8 pins, 24 biographies + 307/271/38 source records research-only");
