import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Buffer} from "node:buffer";
import {validateSourceWork} from "../src/source-text/contracts.js";
import {parsePlainSource,parseCleanHtmlSource} from "../src/source-text/parse.js";
import {packageSourceDocument} from "../src/source-text/package.js";
import {createSourceTextReader} from "../src/source-text/reader.js";
const from=relative=>new URL("../"+relative,import.meta.url);
const sample=readFileSync(from("data/source-text/pilot/original.txt"),"utf8");
const saved=JSON.parse(readFileSync(from("data/source-text/pilot/manifest.json"),"utf8"));
const candidate=JSON.parse(readFileSync(from("data/source-text/work-candidates.v1.json"),"utf8"));
assert.equal(candidate.works.length,13);
assert.equal(candidate.publishedFullTextCount,0);
for(const work of candidate.works){
 assert.equal(work.extraction,"METADATA_ONLY__NOT_PARSED");
 assert.equal(work.importPermission,"NOT_GRANTED");
 assert.ok(work.sourceWorkId.startsWith("WORK-"));
}
const work=saved.work;
assert.equal(validateSourceWork(work,{requireReproduction:true}),work);
const parsed=parsePlainSource(work,sample);
const bundled=packageSourceDocument(parsed,{chunkSize:3});
assert.deepEqual(bundled.manifest,saved,"The published manifest must reproduce from the project-authored original");
for(const [path,content] of Object.entries(bundled.chunks)){
 assert.equal(readFileSync(from("data/source-text/pilot/"+path),"utf8"),content,
 "Published chunk must be byte-identical to deterministic parser output");
}
assert.equal(parsed.passages.length,7);
assert.equal(Object.keys(bundled.chunks).length,3);
assert.ok(new Set(parsed.passages.map(x=>x.id)).size===parsed.passages.length);
assert.ok(parsed.passages.every(x=>x.editionId===work.editionId&&x.witnessId===work.witnessId));
const again=parsePlainSource(work,sample.replace(/\n/g,"\r\n"));
assert.deepEqual(again.passages,parsed.passages,"Line endings must not change locators or text");
const plain="# Example\n\nAlpha & Beta.\n\n## Notes\n\n- Item one.\n\n> Witness text.";
const html='<article><h1>Example</h1><p>Alpha &amp; Beta.</p><h2>Notes</h2><ul><li>Item one.</li></ul><blockquote>Witness text.</blockquote></article>';
assert.deepEqual(parsePlainSource(work,plain).passages,parseCleanHtmlSource(work,html).passages,
 "Equivalent clean HTML and plain text must have the same passage IDs and content");
assert.throws(()=>parseCleanHtmlSource(work,'<p>Bad <em>markup</strong></p>'),/INLINE_UNBALANCED/);
assert.throws(()=>parseCleanHtmlSource(work,'<script>bad</script>'),/UNSAFE_OR_UNSUPPORTED/);
assert.throws(()=>parseCleanHtmlSource(work,'<p onclick="bad()">A</p>'),/UNSAFE_OR_UNSUPPORTED/);
assert.throws(()=>parseCleanHtmlSource(work,'<p><img src="bad"></p>'),/UNSAFE_OR_UNSUPPORTED/);
assert.throws(()=>parseCleanHtmlSource(work,'<p>Unknown &unknown;</p>'),/ENTITY_UNSUPPORTED/);
assert.throws(()=>parseCleanHtmlSource(work,'<p>Unclosed'),/STRUCTURE_UNSUPPORTED/);
assert.throws(()=>parseCleanHtmlSource(work,'Unwrapped text.'),/STRUCTURE_UNSUPPORTED/);
assert.throws(()=>parsePlainSource({...work,rights:{status:"UNREVIEWED"}},sample),/REPRODUCTION_NOT_CLEARED/);
assert.throws(()=>parsePlainSource({...work,demoOnly:false},sample),/DEMO_CANNOT_BE_PUBLIC/);
assert.throws(()=>parsePlainSource({...work,rights:{status:"REPRODUCTION_CLEARED"}},sample),/REPRODUCTION_NOT_CLEARED/);
let reads=0;
const reader=createSourceTextReader({manifest:saved,loadChunk:async path=>{
 reads++;return readFileSync(from("data/source-text/pilot/"+path),"utf8");
}});
assert.equal(reads,0,"Construction must not fetch text");
assert.equal(reader.loadedChunks(),0);
assert.ok(reader.searchMetadata("Finding").length>=1);
assert.equal(reads,0,"Metadata search must not fetch text");
const first=await reader.open(reader.firstId);
assert.equal(reads,1);
assert.ok(first.passage.text.startsWith("This is project-authored"));
const second=await reader.open(first.next);
assert.equal(reads,1,"Reading within the same chunk must use cache");
assert.equal(second.previous,first.passage.id);
await reader.open(saved.passages[3].id);
assert.equal(reads,2,"The next chapter fetches only one more chunk");
await assert.rejects(reader.open("WORK-AO-SOURCE-DEMO/root/absent"),/PASSAGE_NOT_FOUND/);
const full=await reader.searchFullText("external source");
assert.equal(full.length,1);
assert.equal(reads,3,"Full-text search fetches remaining text explicitly");
await reader.searchFullText("demonstration");
assert.equal(reads,3,"Chunk cache prevents repeated requests");
const unsafeManifest=JSON.parse(JSON.stringify(saved));
unsafeManifest.chunks[0].path="../secrets.json";
assert.throws(()=>createSourceTextReader({manifest:unsafeManifest,loadChunk:async()=>""}),/CHUNK_PATH_INVALID/);
const forged=createSourceTextReader({manifest:saved,loadChunk:async()=>JSON.stringify({
 schema:"AO_SOURCE_TEXT_V1",workId:work.id,passages:[{id:"OTHER-WORK/evil",text:"bad"}]
})});
await assert.rejects(forged.open(forged.firstId),/CHUNK_COUNT_MISMATCH|CHUNK_IDENTITY_MISMATCH/);
const metadataBytes=Buffer.byteLength(JSON.stringify(saved),"utf8");
const textBytes=Object.values(bundled.chunks).reduce((n,x)=>n+Buffer.byteLength(x,"utf8"),0);
assert.ok(metadataBytes<16384);
console.log("PASS source-text parser pilot: 13 metadata-only works; 7 exact passages; 3 lazy chunks; rights and integrity fail closed");
console.log(JSON.stringify({pilotManifestBytes:metadataBytes,pilotTextChunkBytes:textBytes,
 metadataSearchTextFetches:0,firstPassageTextFetches:1,
 explicitFullTextSearchTextFetches:3,productionBundleSavings:"NOT_MEASURED"}));
