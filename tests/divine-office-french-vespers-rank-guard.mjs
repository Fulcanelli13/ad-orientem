import test from "node:test";
import assert from "node:assert/strict";
import {frenchSundayRankGuardCandidate,PINNED_RANK_GUARD_FILE}
 from "../scripts/office/experiment-french-vespers-rank-guard.mjs";

test("rank guard candidate changes exactly one reversible literal and no other rules",()=>{
  const original="start\n  && $w{Rank} !~ /Adv|Quad|Passio|Epi|Corp|Nat|Cord|Asc|Dominica|;;6/i\nend";
  const r=frenchSundayRankGuardCandidate(original);
  assert.equal(PINNED_RANK_GUARD_FILE,"web/cgi-bin/horas/specials/orationes.pl");
  assert.equal(r.changedOnlySundayRankRecognition,true);
  assert.equal(r.sourceModificationIsScratchOnly,true);
  assert.equal(r.certifiedPrintedOffice,false);
  assert.equal(r.published,0);
  assert.equal(r.content.replace("|Dominica|dimanche|","|Dominica|"),original);
  assert.notEqual(r.originalSha256,r.candidateSha256);
});
test("unrecognized, already-modified or duplicated Perl source fails closed",()=>{
  for(const input of [
    "",
    "&& $w{Rank} !~ /Dominica|;;6/i",
    "&& $w{Rank} !~ /Adv|Quad|Passio|Epi|Corp|Nat|Cord|Asc|Dominica|dimanche|;;6/i",
    "&& $w{Rank} !~ /Adv|Quad|Passio|Epi|Corp|Nat|Cord|Asc|Dominica|;;6/i\n"+
      "&& $w{Rank} !~ /Adv|Quad|Passio|Epi|Corp|Nat|Cord|Asc|Dominica|;;6/i",
  ]) assert.throws(()=>frenchSundayRankGuardCandidate(input),/ANCHOR_NOT_UNIQUE/);
});
