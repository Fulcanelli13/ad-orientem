import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {M05_SCORE_PARITY_SPECS,researchGabcPhrases,
 auditM05GabcRecord,permittedPublicGregorianScore}
 from "../src/mass/reader-music-gabc-source-screen.js";

const file=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const corpus=file("data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json");
const sung=file("data/presentation/reader-text-sung.v1.json");
const asp=file("data/presentation/reader-asperges.v1.json");
const cueById=new Map(sung.blocks.flatMap(b=>(b.units??[])
 .filter(u=>u.latin!=null).map(u=>[u.cue_id,u.latin])));
const audit=record=>auditM05GabcRecord({record,cueById,aspergesFormulas:asp.formulas});
assert.equal(corpus.schema,"ao-mass-music-m05-cc0-gabc-research-v1");
assert.equal(corpus.scores.length,7);
assert.equal(corpus.license.spdx,"CC0-1.0");
assert.equal(corpus.policy.repositoryResearchOnly,true);
assert.equal(corpus.policy.automaticMassImport,false);
const expected=[
 ["PREFACE_SOLEMN",4449,8,6],
 ["PREFACE_FERIAL",4450,8,6],
 ["ORATIONS_FESTIVE",4487,2,4],
 ["PATERNOSTER_COMMON",7282,4,2],
 ["ASPERGES_NORMAL",497,3,3],
 ["ASPERGES_PASCHAL",958,3,3],
 ["DISMISSAL_ITE_I",2988,2,2]
];
let sum=0;
for(let i=0;i<expected.length;i++){
 const [id,grego,phrases,matches]=expected[i],record=corpus.scores[i];
 assert.equal(record.id,id);
 assert.equal(record.sourceId,grego);
 assert.match(record.sourceFolio,/1961/);
 assert.match(record.gabcUrl,/gregobase\.selapa\.net\/download\.php/);
 assert.equal(record.renderApproved,false);
 assert.equal(record.editorialApproval,"PENDING_USER_FINAL_COLLECTION_REVIEW");
 assert.equal(record.textWitnessStatus,
   "GABC_RETRIEVED_PRINTED_SOURCE_LISTED_NOT_FACSIMILE_VERIFIED");
 const result=audit(record);
 assert.equal(result.schema,"ao-mass-music-m05-source-screen-v1",id);
 assert.equal(result.textParity,"PINNED_TEXT_MATCHES_GABC",
   id+" source or GABC Latin mismatched "+JSON.stringify(result));
 assert.equal(result.phraseCount,phrases,id);
 assert.equal(result.expectedComparisons,matches,id);
 assert.equal(result.matchedComparisons,matches,id);
 assert.equal(result.scoreRelease,"BLOCKED");
 assert.equal(result.editorialApproval,"PENDING_USER_FINAL_COLLECTION_REVIEW");
 assert.equal(result.transcriptionRights,"GREGOBASE_CC0_SOURCE_ATTESTED");
 assert.equal(result.facsimileMusicVerification,"PENDING");
 assert.equal(result.audio,"NOT_INCLUDED");
 assert.equal(result.actuallySung,"UNKNOWN");
 assert.equal(permittedPublicGregorianScore(result),null,
   "CC0 transcription is not editorial/printed-source approval");
 // Spoofed approval flags cannot bypass the closed M05 release gate.
 assert.equal(permittedPublicGregorianScore({
   ...result,facsimileMusicVerification:"VERIFIED"},{
     sourceId:grego,approved:true,userEditorialDecision:"APPROVED",
     printedEditionVerified:true,approvedRights:"GREGOBASE_CC0"
   }),null,"Research-derived fake approval promoted score");
 sum+=matches;
}
assert.equal(sum,26,"GABC source-screen coverage changed");
const solemn=corpus.scores[0],ferial=corpus.scores[1];
assert.notEqual(solemn.gabc,ferial.gabc,
 "The three Preface responses must not always use one identical setting");
for(const record of [solemn,ferial]){
 const parts=researchGabcPhrases(record.gabc);
 assert.equal(parts.length,8);
 assert.match(parts[0],/peromnia/);
 assert.match(parts[1],/amen/);
 assert.match(parts[2],/dominusvobiscum/);
 assert.match(parts[3],/etcumspiritutuo/);
 assert.match(parts[4],/sursumcorda/);
 assert.match(parts[5],/habemusaddominum/);
 assert.match(parts[6],/gratiasagamusdominodeonostro/);
 assert.match(parts[7],/dignumetiustumest/);
}
for(const record of corpus.scores.filter(x=>x.scoreFamily==="ASPERGES")){
 const phrases=researchGabcPhrases(record.gabc);
 assert.match(phrases[2],/gloriapatri/);
 assert.match(phrases[2],/sicuteratinprincipio/);
 assert.match(phrases[2],/amen/);
}
const paschal=corpus.scores.at(-1);
assert.equal(M05_SCORE_PARITY_SPECS.DISMISSAL_ITE_I.coverage,
 "PASCHAL_DOUBLE_ALLELUIA_CANDIDATE_NOT_ORDINARY_ITE");
assert.ok(paschal.gabc.includes("al(g)le(f)lú"));
assert.equal(audit({...solemn,gabc:solemn.gabc.replace("Dó(e)mi(f)nus","O(e)mi(f)nus")})
 .textParity,"MISMATCH_OR_INCOMPLETE",
 "A corrupted celebrant intonation cannot pass GABC text parity");
assert.equal(audit({...paschal,gabc:paschal.gabc.replace("grá(g')ti","dá(g')ti")})
 .textParity,"MISMATCH_OR_INCOMPLETE",
 "A corrupted double-Alleluia response cannot pass");
assert.equal(audit({...ferial,editorialApproval:"APPROVED"})
 .status,"MALFORMED_SOURCE_OR_APPROVAL_GATE",
 "Research dataset cannot self-declare editorial approval");
const extra=researchGabcPhrases("name:Empty;\n%%\n");
assert.deepEqual(extra,[]);
const publicDeps=readFileSync(new URL("../src/mass/reader-mass-sung-dialogue-pairs.js",import.meta.url),"utf8");
assert.doesNotMatch(publicDeps,/mass-music-m05-cc0-gabc/);
assert.doesNotMatch(publicDeps,/reader-music-gabc-source-screen/);
console.log("PASS M05 seven CC0 chant GABCs · 26 text parity checks · three Preface pairs and two seasonal aspersions · publication blocked");
