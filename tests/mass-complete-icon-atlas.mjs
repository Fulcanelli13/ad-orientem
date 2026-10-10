import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../reviews/mass-complete-icon-assignment-atlas-20261011.html",import.meta.url),"utf8");
const src=html.match(/<script type="application\/json" id="atlas-data">([\s\S]*?)<\/script>/);
assert.ok(src,"standalone atlas did not embed source inventories");
const atlas=JSON.parse(src[1]),{assets,targets,metadata}=atlas;
assert.equal(metadata.inventory117,117,"V4.1.1 hardened source count changed");
assert.equal(metadata.mass67,67,"the frozen Mass originals denominator changed");
assert.equal(metadata.matrix142,142,"Campion 142-action source changed");
assert.equal(metadata.matrixBound,125,"125-source binding audit changed");
assert.ok(assets.length>=300 && assets.filter(a=>a.available).length>=200);
assert.equal(new Set(assets.map(a=>a.id)).size,assets.length);
assert.equal(new Set(targets.map(t=>t.id)).size,targets.length);
for(const [group,count] of Object.entries({"Campion matrix":142,"Priest stations":49,"Faithful postures":23,
  "Faithful gestures":59,"Priest actions":77,"Rubrical events":57,"Responses":23,
  "Priest voice":126,"User selections":52})){
 assert.equal(targets.filter(t=>t.channel===group).length,count,group);
}
for(const id of ["GM.F.C0068.01","GM.F.C0104.01"]){
 const candidate=targets.find(t=>t.id===id);
 assert.ok(candidate,`Traditional cross cue missing: ${id}`);
}
assert.ok(assets.some(a=>a.path==="assets/active/mass-v46/cross.svg"&&a.available));
assert.ok(assets.some(a=>a.path==="assets/active/mass-v46/sit.svg"&&a.available));
assert.ok(assets.some(a=>a.path==="assets/active/mass-v46/stand.svg"&&a.available));
assert.ok(assets.some(a=>a.group==="Unapproved proposals"));
for(const marker of ["ao-icon-assignment-review-v1","data-primary","data-alternate",
 "Same actor","All records with same actor","id=\"atlas-data\"","Export review JSON","Import review JSON"]){
 // Export reviewer UI must remain functional, not a static image gallery.
 assert.ok(html.toLowerCase().includes(marker.toLowerCase()),marker+" missing");
}
assert.match(html,/URL\.createObjectURL/);
assert.match(html,/localStorage\.setItem/);
assert.match(html,/schema:"ao-icon-assignment-review-v1"/);
assert.match(html,/Campion is a useful catechetical discovery witness/);
console.log("Mass complete icon atlas: PASS",assets.length,"assets",targets.length,"assignable targets");
