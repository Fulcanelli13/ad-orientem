import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PARTICIPATION_REFERENCE_SCORES,participationReferenceScoresForParagraph}
 from "../src/mass/reader-participation-reference-scores.js";
import {ORDINARY_1961_SCORE_SOURCES} from "../src/mass/reader-ordinary-scores-1961.js";
import {GOSPEL_1961_REFERENCE_WITNESSES,GOSPEL_RESPONSE_REFERENCE_SCORES} from "../src/mass/reader-gospel-response-reference-scores.js";
import {researchGabcPhrases} from "../src/mass/reader-music-gabc-source-screen.js";
const file=async path=>JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const research=await file("data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json");
const corpus=await file("data/presentation/reader-text-sung.v1.json");
const audit=await file("data/mass/ordinary-sung-speaker-audit.v1.json");
const cueText=new Map(corpus.blocks.flatMap(x=>x.units.map(y=>[y.cue_id,y.latin])));
const roles=new Map(audit.records.map(x=>[x.cueId,x.role]));
const sourceLookup=new Map([...research.scores.map(x=>[x.sourceId,x.gabc]),
 ...ORDINARY_1961_SCORE_SOURCES.map(x=>[Number(x.id.slice(10)),x.gabc]),
 ...GOSPEL_1961_REFERENCE_WITNESSES.map(x=>[x.sourceId,x.gabc])]);
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z0-9]+/g,"");
assert.equal(PARTICIPATION_REFERENCE_SCORES.length,17);
assert.equal(GOSPEL_1961_REFERENCE_WITNESSES.length,2);
assert.equal(GOSPEL_RESPONSE_REFERENCE_SCORES.length,4);
assert.deepEqual(GOSPEL_1961_REFERENCE_WITNESSES.map(x=>x.sourceId),[4490,4491]);
assert.equal(new Set(PARTICIPATION_REFERENCE_SCORES.map(x=>x.id)).size,17);
for(const score of PARTICIPATION_REFERENCE_SCORES){
 const original=sourceLookup.get(score.sourceId);
 assert.ok(original,score.id+" source GABC not in pinned corpus");
 const phrases=researchGabcPhrases(original);
 const excerpt=researchGabcPhrases(score.gabc);
 assert.equal(excerpt.length,1,score.id+" must contain one musical phrase");
 assert.equal(excerpt[0],phrases[score.sourcePhraseIndex],score.id+" source-note witness");
 assert.equal(excerpt[0],norm(score.sourceLatin),score.id+" source-Latin witness");
 assert.equal(score.publicScoreApproved,false);
 assert.equal(score.printVerification,"PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION");
 assert.equal(score.sourceUrl,"https://gregobase.selapa.net/chant.php?id="+score.sourceId);
 for(const cueId of score.sourceCueIds)assert.ok(cueText.has(cueId));
 assert.equal(norm(score.sourceCueIds.map(x=>cueText.get(x)).join(" ")),norm(score.sourceLatin));
 assert.deepEqual(score.sourceCueLatin,score.sourceCueIds.map(x=>cueText.get(x)),
  "Exact source fragment text (not the translation or combined incipit)");

 assert.ok(score.sourceCueIds.every(x=>score.kind==="CELEBRANT_INTONATION"
  ?roles.get(x)==="PRIEST":roles.get(x)==="RESPONDERS"));
}
const cue=n=>"AO.SM.C"+String(n).padStart(4,"0");
const p=n=>({id:"p"+n,kind:"TEXT",primary:cueText.get(cue(n)),sourceCueIds:[cue(n)]});
const context=kind=>({provenance:{musicToneContext:{
 schema:"ao-1962-sourced-tone-context-v1",sourceOwner:"1962_PROPER_RESOLVER",
 verified:true,celebrationKind:kind,liturgicalClass:1}}});
const solemn=context("SUNDAY"),ferial=context("FERIA");
const get=(n,m,opts={})=>participationReferenceScoresForParagraph({
 paragraph:p(n),paragraphs:[p(n)],form:"MISSA_CANTATA_SIMPLE",
 resolvedMass:m,...opts}).map(x=>x.sourceId);
assert.deepEqual(get(138,solemn),[4449]);
assert.deepEqual(get(138,ferial),[4450]);
assert.deepEqual(get(140,solemn),[4449]);
assert.deepEqual(get(143,ferial),[4450]);
assert.deepEqual(get(136,solemn),[4449]);
assert.deepEqual(get(71,solemn),[4487]);
assert.deepEqual(get(252,solemn),[4487]);
assert.deepEqual(get(71,ferial),[]);
assert.deepEqual(get(138,null),[]);
assert.deepEqual(get(210,solemn),[7282],
 "The final Pater noster response melody does not change for solemn tone");
assert.deepEqual(get(210,ferial),[7282],
 "The same response melody is retained in ferial tone");
assert.deepEqual(get(210,null),[],
 "Actual celebration tone context is still required for the source preview");
assert.deepEqual(get(210,solemn,{form:"LOW"}),[]);
assert.deepEqual(get(138,solemn,{form:"LOW"}),[]);
const pater=PARTICIPATION_REFERENCE_SCORES.find(x=>x.sourceId===7282);
assert.equal(pater.toneFamily,"COMMON_CLOSING_MELODY_SOLEMN_OR_FERIAL");
assert.match(pater.toneAuthority.source,/paragraph 68/);
assert.equal(pater.toneAuthority.printedScoreNoteParity,"PENDING");
assert.deepEqual(get(138,solemn,{paragraph:{...p(138),primary:"Wrong response"}}),[]);
const originalResponse=p(138);
const bilingualResponse={...originalResponse,primary:"And with thy spirit.",
 secondary:originalResponse.primary};
assert.deepEqual(get(138,solemn,{paragraph:bilingualResponse,
 paragraphs:[bilingualResponse]}),[4449],
 "In bilingual Missal mode the Latin source may be in the second column");
assert.deepEqual(get(138,solemn,{paragraph:{
 ...originalResponse,primary:originalResponse.primary.replace("tuo","to")}}),[],
 "Dropping the Latin letter u cannot be normalized away");
assert.deepEqual(get(138,solemn,{paragraph:bilingualResponse,
 paragraphs:[{...bilingualResponse,secondary:"Mismatched Latin source"}]}),[],
 "Correct source cannot attach to an altered displayed row");
assert.deepEqual(get(138,solemn,{paragraphs:[{...originalResponse,primary:"And with thy spirit."}]}),[],
 "Vernacular alone must not authenticate Gregorian source notation");

assert.deepEqual(get(138,solemn,{paragraphs:[p(138),p(138)]}),[]);
for(const [n,adj,sourceId,key,setting] of [
 [53,54,961,"GLORIA","MASS_08"],[89,90,749,"CREDO","CREDO_03"]
]){
 const paras=[p(n),p(adj)];
 const base={paragraph:paras[0],paragraphs:paras,form:"SOLEMN",
  resolvedMass:solemn,selectedSettings:{[key]:setting}};
 assert.deepEqual(participationReferenceScoresForParagraph(base).map(x=>x.sourceId),[sourceId]);
 assert.deepEqual(participationReferenceScoresForParagraph({...base,selectedSettings:{}}),[]);
 assert.deepEqual(participationReferenceScoresForParagraph({...base,paragraphs:[p(n)]}),[]);
 assert.deepEqual(participationReferenceScoresForParagraph({...base,paragraph:paras[1]}),[]);
 assert.deepEqual(participationReferenceScoresForParagraph({...base,
  resolvedMass:{...solemn,provenance:{...solemn.provenance,
   [key.toLowerCase()]:false}}}),[]);
}
for(const tone of ["GOSPEL_STANDARD","GOSPEL_ALTERNATE_AD_LIBITUM"]){
 const source=tone==="GOSPEL_STANDARD"?4490:4491;
 for(const cueId of [83,85]){
  const byTone=get(cueId,solemn,{selectedSettings:{GOSPEL_TONE:tone}});
  assert.deepEqual(byTone,[source],"One original Gospel response for explicit selected source");
  assert.deepEqual(get(cueId,ferial,{selectedSettings:{GOSPEL_TONE:tone}}),[source],
   "Gospel tones must remain independent of Preface solemn/ferial tones");
  assert.deepEqual(get(cueId,null,{selectedSettings:{GOSPEL_TONE:tone}}),[source],
   "Gospel response reference does not borrow another liturgical tone");
 }
}
assert.deepEqual(get(83,solemn),[4490],"Normal Gospel uses standard reference, not ad-lib");
assert.deepEqual(get(85,solemn),[4490]);
assert.deepEqual(get(83,solemn,{selectedSettings:{GOSPEL_TONE:"UNKNOWN"}}),[],
 "Do not guess when a wrong Gospel tone is selected");
assert.deepEqual(get(85,solemn,{form:"LOW"}),[]);
assert.deepEqual(get(85,solemn,{paragraph:{...p(85),primary:"Gloria Patri"}}),[]);
assert.deepEqual(get(85,solemn,{paragraphs:[p(85),p(85)]}),[]);
assert.deepEqual(get(87,solemn),[],"No Gospel-ending response from incomplete chant");
for(const witness of GOSPEL_1961_REFERENCE_WITNESSES){
 assert.equal(witness.publicScoreApproved,false);
 assert.equal(researchGabcPhrases(witness.gabc).length,4,
  "Both original 1961 Gospel chants are incomplete: only four opening phrases");
}
console.log("PASS 17 exact 1961 Gregorian phrase candidates: Gospel standard/ad-lib, Preface, Pater ending, Gloria/Credo; held from publication");
