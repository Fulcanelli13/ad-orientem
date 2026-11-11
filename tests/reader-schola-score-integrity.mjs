import {test} from "node:test";
import assert from "node:assert/strict";
import {createHash,webcrypto} from "node:crypto";
import {verifyApprovedScholaGabc} from "../src/mass/reader-schola-score-integrity.js";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";

const gabc="name: Synthetic Kyrie;\n%%\n(c4) KY(g)ri(h)e(i) e(h)lé(g)i(f)son.(e.) (::)";
const digest=createHash("sha256").update(gabc,"utf8").digest("hex");
const score=Object.freeze({
 scoreId:"SYNTHETIC_ONLY_DO_NOT_REGISTER",
 score_status:"approved",gabc,gabcSha256:digest
});
const proof=x=>verifyApprovedScholaGabc(x,{cryptoImpl:webcrypto,encoder:TextEncoder});

test("actual approved Gregorian bytes must match their independent SHA-256",async()=>{
 const accepted=await proof(score);
 assert.equal(accepted.schema,"ao-schola-score-integrity-v1");
 assert.equal(accepted.valid,true);
 assert.equal(accepted.reason,"EXACT_GABC_SHA256");
 assert.equal(Object.isFrozen(accepted),true);
});

test("declaration or matching catalogue ID cannot legalise altered musical notation",async()=>{
 for(const candidate of [
  {...score,gabc:score.gabc.replace("(g)","(f)")},
  {...score,gabc:score.gabc+" "},
  {...score,gabcSha256:"0".repeat(64)},
  {...score,gabcSha256:digest.toUpperCase()},
  {...score,score_status:"research"},
  {...score,gabc:"unrecognised"},
  {...score,gabc:undefined},
  {...score,gabcSha256:undefined},
  {...score,gabc:"x".repeat(200001)}
 ]){
   assert.equal((await proof(candidate)).valid,false,
     "Score payload mismatch allowed: "+JSON.stringify(Object.keys(candidate)));
 }
});

test("no cryptographic primitive means no automatic LIVE publication",async()=>{
 assert.equal((await verifyApprovedScholaGabc(score,{cryptoImpl:null})).valid,false);
 assert.equal((await verifyApprovedScholaGabc(score,{cryptoImpl:{subtle:{digest:async()=>{throw Error("unavailable")}}}})).valid,false);
});

test("existing two independently approved dismissal records still have true GABC hashes",async()=>{
 assert.deepEqual(APPROVED_MASS_INLINE_GABC.map(s=>s.selectionKey),
  ["DISMISSAL","DISMISSAL"]);
 for(const existing of APPROVED_MASS_INLINE_GABC){
   const verified=await proof({...existing,score_status:"approved"});
   assert.equal(verified.valid,true,
     existing.scoreId+" approved-score source bytes do not match the declared digest");
 }
});
