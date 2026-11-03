/**
 * Store four previously approved museum works in the dedicated release branch.
 * Runs only in an authenticated, branch-pinned GitHub Action.
 * All output bytes are verified against museum images acquired in research PR2332.
 * This does NOT grant final publication approval.
 */
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync,existsSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {createHash} from "node:crypto";
const ledger=JSON.parse(readFileSync(new URL("../../data/prayer/artwork-editorial-20261101/museum-four-originals-staging-20261103.v1.json",import.meta.url),"utf8"));
assert.equal(ledger.works.length,4);
assert.equal(ledger.coveredCanonicalSlots,15);
assert.equal(ledger.publicReleaseAllowed,false);
assert.equal(process.env.GITHUB_REF,"refs/heads/release/prayer-four-museum-originals-20261103",
 "Source staging must never write on main or a non-release branch");
assert.equal(process.env.GITHUB_REPOSITORY,"Fulcanelli13/ad-orientem");
const allow=new Set(["openaccess-cdn.clevelandart.org","images.metmuseum.org"]);
function dimensions(b){
 assert.equal(b.readUInt16BE(0),0xffd8,"JPEG bytes expected");
 let p=2;
 while(p<b.length-16){
  if(b[p]!==0xff){p++;continue}
  let mark=b[p+1];p+=2;
  if(mark===0xd9||mark===0xda)break;
  if(mark===0xd8||mark===0x01)continue;
  const len=b.readUInt16BE(p);
  assert.ok(len>=2 && p+len<=b.length,"Invalid JPEG segment");
  if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(mark))return {width:b.readUInt16BE(p+5),height:b.readUInt16BE(p+3)};
  p+=len;
 }
 throw Error("JPEG dimensions unavailable");
}
let added=0;
for(const w of ledger.works){
 const u=new URL(w.directOriginal);
 assert.equal(u.protocol,"https:");
 assert.ok(allow.has(u.hostname),"Unapproved host "+u.hostname);
 assert.ok(w.image.startsWith("assets/prayer/released/") && w.image.endsWith("-original.jpg"));
 assert.ok(w.rights==="CMA_OPEN_ACCESS_CC0"||w.rights==="MET_OPEN_ACCESS_PUBLIC_DOMAIN");
 const destination=resolve(w.image);
 if(existsSync(destination)){
  const existing=readFileSync(destination);
  assert.equal(createHash("sha256").update(existing).digest("hex"),w.sha256,"Existing file hash drift");
  assert.equal(existing.length,w.bytes);
  continue;
 }
 const res=await fetch(w.directOriginal,{signal:AbortSignal.timeout(50000)});
 assert.ok(res.ok,"Museum fetch failed "+res.status+" "+w.id);
 assert.ok(allow.has(new URL(res.url).hostname),"Redirect outside museum");
 const b=Buffer.from(await res.arrayBuffer());
 assert.equal(b.length,w.bytes,"Original byte length differs from documented acquisition");
 assert.equal(createHash("sha256").update(b).digest("hex"),w.sha256,"Original hash mismatch "+w.id);
 assert.deepEqual(dimensions(b),{width:w.width,height:w.height},"Unexpected museum image dimensions");
 mkdirSync(dirname(destination),{recursive:true});
 writeFileSync(destination,b,{flag:"wx"});
 added++;
 console.log("STAGED_VERIFIED "+w.id+" "+w.width+"x"+w.height+" "+w.sha256);
}
console.log("STAGING_COMPLETE "+JSON.stringify({files:ledger.works.length,newFiles:added,slots:ledger.coveredCanonicalSlots,publicationAllowed:false}));
