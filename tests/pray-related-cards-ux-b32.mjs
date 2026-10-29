import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {canonicalAssetIdForPrayRoute,getCanonicalAsset} from "../src/assets/asset-registry.js";
const source=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const start=source.indexOf("function prayRelatedFamilyItems(id){");
const end=source.indexOf("function renderPrayFamily(){",start);
assert.ok(start>=0&&end>start,"Contextual Pray family card declarations must exist");
const related=source.slice(start,end);
const expected=[
 ["pray.five_wounds","passion"],
 ["pray.occasional_intercessions","devotions"],
 ["pray.st_joseph_seven_sorrows","devotions"],
 ["pray.montfort_consecration","devotions"],
 ["pray.for_priests","eucharistic"]
];
for(const [route,family] of expected){
 assert.equal([...related.matchAll(new RegExp("['\"]"+route.replaceAll(".","\\.")+"['\"]","g"))].length,1,
  "Contextual card duplicated or missing: "+route);
 assert.ok(related.includes("if(id==='"+family+"')"),"Related route family needs stable parent "+route);
 const icon=canonicalAssetIdForPrayRoute(route);
 assert.ok(icon&&getCanonicalAsset(icon),"Use existing valid canonical icon for "+route);
}
for(const route of [
 "pray.rosary_methods","pray.divine_mercy","pray.five_wounds",
 "pray.precious_blood","pray.little_crown","pray.tenebrae"
]){
 const id=canonicalAssetIdForPrayRoute(route);
 assert.ok(id&&getCanonicalAsset(id),"Missing existing canonical icon for "+route);
}
const family=source.slice(end,source.indexOf("function openFamily(id){",end));
assert.match(family,/family\.items\.map\(prayFamilyItem\)/,
 "Historical canonical Prayer family cards must use the original module renderer");
assert.match(family,/related\.map\(item=>prayFamilyItem\(item,true\)\)/,
 "Related cards must use the original illustrated module renderer with contextual identity");
assert.match(source,/data-ao-pray-contextual="true"/,
 "The contextual marker must distinguish discovery aliases from the frozen Prayer catalogue");
assert.ok(!/aoFiveWoundsFamilyAside|aoOccasionalFamilyAside|aoPriestsFamilyAside/.test(family),
 "Unstyled plain Prayer links must not be appended after the illustrated card grid");
assert.equal(source.slice(source.indexOf("function prayFamilies(){"),source.indexOf("function prayFamilyDoor(")).includes("pray.montfort_consecration"),false,
 "Do not mutate the frozen historical 23-route source family inventory");
console.log("Prayer related cards PASS: five contextual routes are uniform illustrated source-owned cards, six recent modes have valid canonical icons; historical family inventory unchanged.");
