import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const load = p => JSON.parse(readFileSync(p, "utf8"));
const a = load("data/learn/learn-the-faith-certification-001-018.v1.json");
const w = load("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
const c = load("data/learn/learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json");
assert.equal(a.lessons.length, 18);
assert.equal(a.lessons.reduce((n,l)=>n+l.claims.length,0), 56);
assert.equal(a.batchFindings.passageEvidenceBatch20261009.distinctCompleteItalianTranscriptionQARead,114);
assert.equal(a.batchFindings.passageEvidenceBatch20261009.citationScopeCorrections,3);
assert.equal(a.batchFindings.passageEvidenceBatch20261009.bilingualSubstantiveCorrections,1);
assert.equal(a.batchFindings.passageEvidenceBatch20261009.independentDoctrineApprovalCount,0);
assert.equal(a.reviewGate.publicationApproved,false);
assert.equal(c.publicationGate.nativeFrenchEdit,false);
assert.equal(c.publicationGate.fullOriginalPassageHumanVerification,false);
const byQ=new Map(w.entries.map(x=>[x.q,x])), all=new Set();
let reviewed=0, englishLinks=0, italianLinks=0, latinLinks=0;
for(const l of a.lessons)for(const [i,claim] of l.claims.entries()){
  assert.ok(claim.en?.trim()&&claim.fr?.trim(),l.id+" claim "+i+" missing bilingual text");
  assert.equal(claim.witnessPassageReview?.status,"PINNED_ENGLISH_QA_AND_LATIN_VATICAN_I_SCOPE_REVIEWED");
  assert.equal(claim.witnessPassageReview?.italian1912TranscriptionRead,true);
  assert.equal(claim.witnessPassageReview?.original1912ItalianCollated,false);
  assert.equal(claim.witnessPassageReview?.nativeFrenchEdited,false);
  assert.equal(claim.witnessPassageReview?.doctrinalHumanApproved,false);
  reviewed++;
  for(const s of claim.sources){
    assert.equal(s.locators?.length,s.refs?.length);
    for(const p of s.locators){
      assert.ok(p.url?.startsWith("https://"),"Claim source lacks direct external hyperlink");
      if(s.source==="PIUS_X_1912"){
        const n=Number(p.ref.slice(-3)), entry=byQ.get(n);
        assert.ok(entry,"Missing canonical witness Q"+n);
        assert.equal(p.url,entry.source_file_url);
        assert.equal(p.stem,entry.q_stem);
        assert.match(p.englishAnswerWitnessFingerprint,/^[0-9a-f]{8}$/);
        assert.ok(p.englishAnswerWitnessCharacters>8);
        all.add(n);englishLinks++;
      }else{
        assert.equal(s.source,"VATICAN_I_DEI_FILIUS");
        assert.ok(p.url.includes("vatican.va/content/pius-ix/la/documents/constitutio-dogmatica-dei-filius"));
        latinLinks++;
      }
    }
    if(s.source==="PIUS_X_1912"){
      assert.equal(s.italianOriginalLanguageLocators.length,s.refs.length);
      for(let j=0;j<s.refs.length;j++){
        const it=s.italianOriginalLanguageLocators[j],en=s.locators[j];
        assert.equal(it.ref,en.ref);
        assert.ok(it.url.includes("/content/books/pius-x-catechism/it/"));
        assert.ok(it.url.includes(w.upstreamCommit));
        assert.match(it.italianAnswerWitnessFingerprint,/^[0-9a-f]{8}$/);
        assert.ok(it.italianAnswerWitnessCharacters>8);
        italianLinks++;
      }
    }
  }
}
assert.equal(reviewed,56);
assert.equal(all.size,114);
assert.equal(italianLinks,englishLinks);
assert.equal(a.lessons.find(x=>x.id==="LTF-002").claims[2].sources[0].refs.includes("PXQ011"),false);
assert.deepEqual(a.lessons.find(x=>x.id==="LTF-013").claims[1].sources[0].refs,["PXQ078","PXQ079"]);
const ec=a.lessons.find(x=>x.id==="LTF-017").claims[3];
assert.ok(ec.en.startsWith("The Church is necessary for salvation."));
assert.ok(ec.fr.startsWith("L’Église est nécessaire au salut."));
console.log(JSON.stringify({status:"PASS",lessonCount:18,bilingualClaims:reviewed,distinctActiveItalianAndEnglishQa:all.size,englishLinks,italianLinks,latinLinks,publicationApproved:false}));
