import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {legacyHomeArtworkExcluded,removeExcludedLegacyHomeArtwork} from "../src/home/legacy-art-exclusions.js";

for(const artworkId of ["AO001","AO015","AO105","AO084"]){
  assert(legacyHomeArtworkExcluded({artworkId,artist:"Unknown"}),artworkId+" must be blocked");
}
assert(legacyHomeArtworkExcluded({artist:"Fra Angelico"}));
assert(legacyHomeArtworkExcluded({artist:"El Greco"}));
assert(legacyHomeArtworkExcluded({alt:"El Greco — Pentecost"}));
assert(!legacyHomeArtworkExcluded({artworkId:"AO133",artist:"Raphael",alt:"Raphael — Saint Michael"}));
assert(!legacyHomeArtworkExcluded({artworkId:"approved-rubens",artist:"Peter Paul Rubens"}));
const blocked={removed:0,getAttribute:key=>key==="data-ao-proper-art"?"AO015":null,
  querySelector:q=>q==="img"?{getAttribute:()=> "El Greco — Pentecost"}:
    q==="figcaption"?{textContent:"El Greco",querySelector:()=>({textContent:"El Greco"})}:null,
  remove(){this.removed++}};
const good={removed:0,getAttribute:key=>key==="data-ao-proper-art"?"AO133":null,
  querySelector:q=>q==="img"?{getAttribute:()=> "Raphael — St Michael"}:
    q==="figcaption"?{textContent:"Raphael",querySelector:()=>({textContent:"Raphael"})}:null,
  remove(){this.removed++}};
const slot={querySelectorAll:q=>q.startsWith("figure")?[blocked,good]:[]};
assert.equal(removeExcludedLegacyHomeArtwork(slot),1);
assert.equal(blocked.removed,1);
assert.equal(good.removed,0);
const source=readFileSync(new URL("../src/home/presentation.js",import.meta.url),"utf8");
assert.match(source,/removeExcludedLegacyHomeArtwork\(slot\)/);
console.log("Home sacred-art legacy exclusions: PASS");
