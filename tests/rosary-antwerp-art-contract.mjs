import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {ANTWERP_CYCLE_VERSION,ANTWERP_FIFTEEN,ANTWERP_IDS,
 ANTWERP_IMAGE_STATUS,ANTWERP_RELEASE_RULES,antwerpEntryFor,antwerpPackReady}
 from "../src/pray/rosary-antwerp-cycle.js";
import {ANTWERP_IMAGE_PACK_V1} from "../src/pray/rosary-antwerp-licences.v1.js";

const sources=JSON.parse(readFileSync("data/pray/rosary-antwerp-commons-sources.v1.json","utf8"));
assert.equal(ANTWERP_CYCLE_VERSION,"rosary-antwerp-1617-catalog-v1");
assert.equal(ANTWERP_FIFTEEN.length,15);
assert.deepEqual(ANTWERP_IDS,sources.entries.map(x=>x.id));
assert.equal(ANTWERP_IDS.filter(x=>x.startsWith("joy")).length,5);
assert.equal(ANTWERP_IDS.filter(x=>x.startsWith("sor")).length,5);
assert.equal(ANTWERP_IDS.filter(x=>x.startsWith("glo")).length,5);
assert.equal(ANTWERP_FIFTEEN.filter(x=>x.rightsStatus===ANTWERP_IMAGE_STATUS).length,15);
assert.ok(ANTWERP_FIFTEEN.every(x=>/^https:\/\//.test(x.sourceUrl)));
assert.ok(sources.entries.every(x=>x.filePage.startsWith("https://commons.wikimedia.org/wiki/File:")));
assert.equal(new Set(sources.entries.map(x=>x.fileName)).size,15);
assert.equal(ANTWERP_FIFTEEN.find(x=>x.id==="sor2").artist,"Peter Paul Rubens");
assert.equal(ANTWERP_FIFTEEN.find(x=>x.id==="sor4").artist,"Anthony van Dyck");
assert.equal(ANTWERP_FIFTEEN.find(x=>x.id==="sor5").artist,"Jacob Jordaens");
assert.equal(ANTWERP_FIFTEEN.find(x=>x.id==="glo4").title,"The Assumption");
assert.match(ANTWERP_FIFTEEN.find(x=>x.id==="glo2").attributionNote,/attributed/);
assert.equal(ANTWERP_RELEASE_RULES.defaultCollection,"existing");
assert.equal(ANTWERP_RELEASE_RULES.completeCycleRequired,15);
assert.equal(ANTWERP_RELEASE_RULES.existingArtworkMayNeverBeDeleted,true);
assert.equal(ANTWERP_RELEASE_RULES.optionalLuminousUsesExisting,true);
assert.equal(antwerpPackReady(null),false);
const entry=id=>({id,src:"assets/pray/rosary/antwerp/"+id+".webp",rightsStatus:"cleared",
 photographerCredit:"Wikimedia Commons · public domain art",
 licenceEvidenceUrl:"https://commons.wikimedia.org/wiki/File:"+id+".jpg",
 sha256:"a".repeat(64),width:1200,height:1600});
const mocked={version:"antwerp-15-cleared-v1",entries:ANTWERP_IDS.map(entry)};
assert.equal(antwerpPackReady(mocked),true);
assert.equal(antwerpEntryFor(mocked,"sor4")?.artist,"Anthony van Dyck");
assert.equal(antwerpEntryFor(mocked,"lum1"),null);
assert.equal(antwerpPackReady({...mocked,entries:mocked.entries.slice(0,14)}),false);
assert.equal(antwerpPackReady({...mocked,entries:mocked.entries.map((e,i)=>i===3?{...e,src:"https://example.com/x.webp"}:e)}),false);
assert.equal(antwerpPackReady({...mocked,entries:mocked.entries.map((e,i)=>i===3?{...e,rightsStatus:"pending"}:e)}),false);
assert.equal(antwerpPackReady({...mocked,entries:mocked.entries.map((e,i)=>i===3?{...e,sha256:"incorrect"}:e)}),false);
assert.equal(antwerpPackReady({...mocked,entries:mocked.entries.map((e,i)=>i===3?{...e,src:mocked.entries[2].src}:e)}),false);
const presentation=readFileSync("src/pray/rosary-cinematic.js","utf8");
assert.match(presentation,/ANTWERP_IMAGE_PACK_V1/,"Full image manifest must be static module input");
assert.match(presentation,/root\.dataset\.aoRosaryArtCollection="existing"/,
 "Existing art must remain default if Antwerp has one missing asset");
assert.match(presentation,/collection==="antwerp"\?antwerpEntryFor/);
assert.match(presentation,/stage\.dataset\.artwork="fallback"/);
assert.doesNotMatch(presentation,/AO_ROSARY_ANTWERP_CLEARED_V1/,
 "Art-pack approval cannot be bypassed from mutable global window variables");

const packFile="data/pray/rosary-antwerp-production-pack.v1.json";
if(existsSync(packFile)){
 const full=JSON.parse(readFileSync(packFile,"utf8"));
 assert.equal(antwerpPackReady(full),true,"Committed Antwerp package failed complete 15/15 manifest");
 assert.deepEqual(full,ANTWERP_IMAGE_PACK_V1,"Runtime pack and provenance ledger disagree");
 for(const p of full.entries){
   assert.equal(p.licenceEvidenceUrl,sources.entries.find(x=>x.id===p.id).filePage);
   const bytes=readFileSync(p.src);
   assert.ok(bytes.length<750_001&&bytes.length>30_000);
   assert.equal(createHash("sha256").update(bytes).digest("hex"),p.sha256,p.id+" binary hash drift");
   assert.ok(bytes[0]===82&&bytes[1]===73&&bytes[2]===70&&bytes[3]===70,"Not a RIFF WebP");
 }
}else{
 assert.equal(ANTWERP_IMAGE_PACK_V1,null,
  "No public approved package exists; dynamic image selection must stay disabled");
}
console.log("PASS Antwerp Rosary 15/15 art source/rights gate and current-art preservation");
