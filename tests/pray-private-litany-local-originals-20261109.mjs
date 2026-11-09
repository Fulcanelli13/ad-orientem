import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {createHash,webcrypto} from "node:crypto";
import {loadPrivateLitanyLocal,privateLitanyLocalUrl} from "../src/pray/litany-private-local-loader.v1.js";
import {paginateLitanyProper} from "../src/pray/litany-source.js";

const specs=[
 {language:"en",revision:12282621,file:"../data/pray/private-litany-of-saints-1883-en.v1.json",min:110},
 {language:"fr",revision:14794744,file:"../data/pray/private-litany-of-saints-1862-fr.v1.json",min:165}
];
for(const spec of specs){
 const obj=JSON.parse(readFileSync(new URL(spec.file,import.meta.url),"utf8"));
 assert.equal(obj.schema,"ao.pray.private-litany.local-source.v1");
 assert.equal(obj.language,spec.language);
 assert.equal(obj.sourceRevisionId,spec.revision);
 assert.equal(obj.sourceStatus,"HISTORICAL_TRANSCRIPTION_UNCOLLATED");
 assert.equal(obj.liturgical1962Certified,false);
 assert.equal(obj.sourceScope,"PRIVATE_LITANY_PROPER_ONLY__OMITS_APPENDED_PSALM_AND_COLLECTS");
 assert.ok(obj.text.length>3000);
 const lines=obj.text.split(/\n+/).map(x=>x.trim()).filter(Boolean);
 assert.equal(lines.length,obj.lineCount);
 assert.ok(lines.length>=spec.min);
 assert.equal(paginateLitanyProper(obj.text,spec.language).length,obj.pages);
 assert.equal(createHash("sha256").update(obj.text).digest("hex"),obj.sha256);
 assert.ok(obj.sourceUrl.includes("oldid="+spec.revision));
 assert.ok(!obj.text.includes("Psalm LXIX.")&&!obj.text.includes("psalmus lxix."),"Appended Psalm cannot enter Litany proper");
 const fetcher=async url=>{
  assert.equal(url,privateLitanyLocalUrl(spec.language));
  return {ok:true,json:async()=>obj};
 };
 const work=await loadPrivateLitanyLocal(spec.language,{fetcher,cryptoProvider:webcrypto});
 assert.equal(work.text,obj.text);
 assert.equal(work.lines,obj.lineCount);
 assert.equal(work.pages,obj.pages);
 assert.equal(work.sourceRevisionId,obj.sourceRevisionId);
 const tampered={...obj,text:obj.text+" addition"};
 await assert.rejects(()=>loadPrivateLitanyLocal(spec.language,{fetcher:async()=>({ok:true,json:async()=>tampered}),cryptoProvider:webcrypto}),/digest mismatch|line\/page count mismatch/);
 const false1962={...obj,liturgical1962Certified:true};
 await assert.rejects(()=>loadPrivateLitanyLocal(spec.language,{fetcher:async()=>({ok:true,json:async()=>false1962}),cryptoProvider:webcrypto}),/provenance/);
 console.log("PASS private Litany "+spec.language+" "+obj.lineCount+" source lines, "+obj.pages+" cards, original revision "+obj.sourceRevisionId);
}
const french=JSON.parse(readFileSync(new URL(specs[1].file,import.meta.url),"utf8")).text;
assert.ok(french.includes("Jésus-Christ, avez pitié de nous."),
 "1862 original suspicious reading must not be silently corrected");
assert.ok(/Saint Jean,\s*riez pour nous\./.test(french),
 "1862 original St John split line anomaly must be preserved without emendation");
const presentation=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const worker=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
for(const contract of [
 'import {loadPrivateLitanyLocal}',
 'const bundle=await loadPrivateLitanyLocal(language)',
 'LIT.sourceMode=\'self-hosted-private-historical-witness\'',
 'data-ao-private-litany-bundled',
 'const raw=await guidedWsText(witness.title,witness.cacheKey,language)',
 'renderBatch03PublicLitanyReference()'
])assert.ok(presentation.includes(contract),"Lost historical reader/fallback contract: "+contract);
for(const file of ["private-litany-of-saints-1883-en.v1.json","private-litany-of-saints-1862-fr.v1.json"])
 assert.ok(worker.includes(file),"Historical Litany missing from installed offline snapshot: "+file);
console.log("PASS two complete, separately sourced, first-install offline-capable private Litany witnesses; no 1962 certification or invented translations");
