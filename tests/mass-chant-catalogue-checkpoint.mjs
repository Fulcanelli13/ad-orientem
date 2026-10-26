import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {SCHEMA} from "../tools/mass/ingest-gregobase-1961.mjs";
import {replayGregoBaseCheckpoints} from "../tools/mass/replay-gregobase-checkpoints.mjs";
const sha=text=>createHash("sha256").update(text).digest("hex");
const records=[{id:"GREGOBASE-72",gregobaseId:72,sourceUrl:"https://gregobase.selapa.net/chant.php?id=72",
 status:"HISTORICAL_SOURCE_METADATA_NOT_READER_APPROVED"},
 {id:"GREGOBASE-1163",gregobaseId:1163,sourceUrl:"https://gregobase.selapa.net/chant.php?id=1163",
 status:"HISTORICAL_SOURCE_METADATA_NOT_READER_APPROVED"}];
const recordHash="f".repeat(64);
const shard={schema:SCHEMA,sourceSha256:recordHash,index:1,total:1,records};
const content=JSON.stringify(shard)+"\n",b64=Buffer.from(content).toString("base64");
const fragments=[b64.slice(0,100),b64.slice(100)];
const manifest={schema:SCHEMA,sha256:recordHash,summary:{total:2},
 shards:[{file:"catalogue-001.json",count:2,minId:72,maxId:1163}]};
const metadata={shard:1,total:1,sha256:sha(content),bytes:Buffer.byteLength(content),
 parts:fragments.length,file:"catalogue-001.json"};
const lines=[
 "2026-10-26T18:00:00Z AO_GREGORIAN_MANIFEST="+JSON.stringify(manifest),
 "2026-10-26T18:00:01Z AO_CHANT_CHECKPOINT_META="+JSON.stringify(metadata),
 ...fragments.map((data,i)=>"2026-10-26T18:00:02Z AO_CHANT_CHECKPOINT_PART="+
  JSON.stringify({shard:1,part:i+1,total:2,data})),
];
const result=replayGregoBaseCheckpoints(lines.join("\n"));
assert.equal(result.records,2);
assert.equal(result.integrity,"SHA256_VERIFIED");
assert.equal(result.shards.size,1);
assert.equal(result.shards.get("catalogue-001.json"),content);
assert.throws(()=>replayGregoBaseCheckpoints(lines.slice(0,3).join("\n")),/Missing|invalid/);
assert.throws(()=>replayGregoBaseCheckpoints([...lines,lines[3]].join("\n")),/DUPLICATE_PART/);
assert.throws(()=>replayGregoBaseCheckpoints(lines.map(x=>
 x.replace(metadata.sha256,"0".repeat(64))).join("\n")),/Checksum mismatch/);
assert.throws(()=>replayGregoBaseCheckpoints(lines.map(x=>
 x.replace('"count":2','"count":3')).join("\n")),/count mismatch/);
assert.throws(()=>replayGregoBaseCheckpoints(lines.map(x=>
 x.replace("catalogue-001.json","../escape.json")).join("\n")),/Invalid|incomplete/);
console.log("PASS Graduale checkpoint replay: SHA256, ordered chunks, source ID/count and path integrity");
