import assert from "node:assert/strict";
import fs from "node:fs";

const p=JSON.parse(fs.readFileSync(new URL(
  "../data/directory/research/b99-20261026-590-applied-site-description-backfills.v1.json",
  import.meta.url),"utf8"));
assert.equal(p.schema,"AO_TLM_B99_BULK_590_REAL_SITE_FIELDS_V1");
assert.equal(p.baseline_b98_sha256,"848fb2fcadda58b1c22bc02e83a019bfab6947d8bddf86eb3cdfa4021bf05c77");
assert.equal(p.default_release,"RESEARCH_ONLY_NOT_PUBLIC");
assert.equal(p.do_not_overwrite,"any_nonempty_preexisting_description");
assert.equal(p.patches.length,590);
assert.equal(new Set(p.patches.map(x=>x.g)).size,590);
assert.equal(new Set(p.patches.map(x=>x.src+"|"+x.g)).size,590);
const tiers={};
for(const x of p.patches){
  assert.match(x.g,/^RG-/);
  assert(x.src.length>3);
  assert(x.text.length>3);
  assert.match(x.type,/^(SOURCE_PHYSICAL_DESCRIPTION|SOURCE_PHYSICAL_DESCRIPTION_APPROXIMATE|EXISTING_MASS_LOCATION_CLARIFICATION|SOURCE_LOCALITY_ONLY)$/);
  if(x.type==="SOURCE_LOCALITY_ONLY")assert(x.text.includes("(locality only; street not established"));
  tiers[x.type]=(tiers[x.type]||0)+1;
}
assert.deepEqual(tiers,{
  SOURCE_LOCALITY_ONLY:418,
  SOURCE_PHYSICAL_DESCRIPTION:19,
  SOURCE_PHYSICAL_DESCRIPTION_APPROXIMATE:92,
  EXISTING_MASS_LOCATION_CLARIFICATION:61,
});
console.log("B99: 590 actual frozen-ID keyed site-description patches PASS; 418 locality-only explicitly marked.");
