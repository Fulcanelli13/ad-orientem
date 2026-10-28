import assert from "node:assert/strict";
import {needsProductionBuild} from "../tools/vercel-build-eligibility.mjs";

const cases=[
 [[],true,"empty diff must build"],
 [["README.md"],false,"documentation-only must skip"],
 [["docs/mass-schola-notes.md",".github/workflows/qa.yml"],false,"documentation and CI only must skip"],
 [["scripts/art/audit.py","tests/art-asset-registry.mjs"],false,"research tooling only must skip"],
 [["data/research/archive/audit.json"],false,"unpublished research must skip"],
 [["data/directory/research/staging/worldwide.json"],false,"private staging must skip"],
 [["data/geography/research/new-sites.json"],false,"unpublished geography research must skip"],
 [["assets/staged/place-media/picture.jpg"],false,"staged media alone must skip"],
 [["README.md","src/mass/browser-entry.js"],true,"native Mass changes always build"],
 [["src/pray/traditional-pray-runtime.js"],true,"prayer updates always build"],
 [["data/scripture/catena/matthew.json"],true,"scripture updates always build"],
 [["assets/active/devotional-module/hero.webp"],true,"approved art updates always build"],
 [["data/research/mass-special-rite-music-events-20261019.v1.json"],true,"live Schola registry always builds"],
 [["data/directory/research/canonical-g0-site-admissions-b84-b90-20261026.v1.json"],true,"Find loader research fixture always builds"],
 [["tools/build-web-preview.mjs"],true,"release builder changes build"],
 [["tools/vercel-build-eligibility.mjs"],true,"ignore-script changes build"],
 [["vercel.json"],true,"deployment settings build"],
 [["package.json"],true,"package changes build"],
 [["data/mass/unclassified.json"],true,"all unknown data/mass files build"],
 [[".github/workflows/qa.yml","data/mass/unclassified.json"],true,"runtime change not concealed by CI files"],
 [["unfamiliar/new-file.ext"],true,"unknown file builds"],
 [["../../README.md"],true,"invalid path fails open"],
 [["README.md",null],true,"bad changed file fails open"],
];
for(const [paths,expected,label] of cases)
 assert.equal(needsProductionBuild(paths),expected,label);
console.log("PASS Vercel production ignored-build safety: "+cases.length+" cases");
