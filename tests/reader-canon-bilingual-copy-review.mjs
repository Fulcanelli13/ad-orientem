import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCanonBilingualCopyReview,createCanonBilingualCopyReviewController}
 from "../src/mass/reader-canon-bilingual-copy-review.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const witnesses={
 bilingual:read("../data/research/mass-canon-62-bilingual-two-layer-review-20261014.json"),
 french:read("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json"),
 trigger:read("../data/research/mass-canon-62-source-trigger-audit-20261013.json"),
 triage:read("../data/research/mass-canon-flagged-french-copy-triage-20261013.json"),
};
const audit=validateCanonBilingualCopyReview(witnesses);
assert.deepEqual([audit.count,audit.priest,audit.minister,audit.flagged,audit.publicationReady],
 [62,58,4,29,0]);
assert.equal(audit.guideFrenchOwner,"CANONICAL_R62");
assert.equal(audit.surfaceCounts.FOCUS_WORDS_NO_DUPLICATE,2);
assert.equal(audit.surfaceCounts.SERVER_RIBBON_ONLY,3);
assert.equal(audit.surfaceCounts.PRIEST_RIBBON_STATE_ONLY,2);
assert.equal(audit.surfaceCounts.INDEPENDENT_STAGE_EDITORIAL_ONLY,2);
assert.equal(audit.surfaceCounts.GUIDE_ONLY,13);
assert.equal(audit.surfaceCounts.GUIDE_AND_FORM_CONTEXT,1);
assert.equal(Object.values(audit.surfaceCounts).reduce((n,v)=>n+v,0),62);
const byId=new Map(audit.rows.map(x=>[x.actionId,x]));
for(const x of audit.rows){
 assert.ok(x.shortDraft.fr.length>5&&x.shortDraft.en.length>5);
 assert.ok(x.guideDraft.fr.length>x.shortDraft.fr.length/2);
 assert.ok(x.guideDraft.en.length>20);
 assert.ok(x.sourceUrls.every(s=>s.startsWith("https://")));
 assert.equal(x.guideFrenchOwnerId,x.actionId);
 assert.equal(x.copyApproval,"NOT_APPROVED");
 assert.doesNotMatch(x.guideDraft.en,/\\b(?:reader|scroll|source trigger|generic paragraph|actor ownership|implementation|render|dashboard)\\b/i,
  "Guide copy must state the substantive rite rather than implementation commentary");
 assert.equal(x.canPublish,false);
 assert.equal(x.observedNow,false);
 assert.equal(x.faithfulPosture,null);
}
for(const [n,phraseFr,phraseEn] of [
 ["011","mains ouvertes","open hands"],
 ["022","consécration","consecration"],
 ["024","élève l’Hostie","elevates the Host"],
 ["026","pouces et index","thumbs and index"],
 ["027","Le servant sonne","server rings"],
 ["028","Le calice est découvert","chalice is uncovered"],
 ["032","consécration du calice","chalice consecration"],
 ["035","Le servant sonne","server rings"],
 ["040","garde les mains étendues","keeps his hands extended"],
 ["050","hausse la voix","raises his voice"],
 ["058","l’Hostie au-dessus","Host above"],
 ["059","repose les espèces","replaces the sacred species"],
 ["061","Le répondant dit Amen","respondent says Amen"],
 ["062","Le servant donne le signal","server gives the warning bell"],
]){
 const row=byId.get("AO.CANON.R62."+n);
 assert.ok(row,"Missing required form/actor/source cue "+n);
 assert.ok(row.shortDraft.fr.includes(phraseFr),n+": French copy semantics drift");
 assert.ok(row.shortDraft.en.includes(phraseEn),n+": English copy semantics drift");
}
assert.equal(byId.get("AO.CANON.R62.023").reviewSurface,
 "INDEPENDENT_STAGE_EDITORIAL_ONLY");
assert.equal(byId.get("AO.CANON.R62.024").reviewSurface,
 "INDEPENDENT_STAGE_EDITORIAL_ONLY");
assert.equal(byId.get("AO.CANON.R62.022").reviewSurface,
 "FOCUS_WORDS_NO_DUPLICATE");
assert.equal(byId.get("AO.CANON.R62.032").reviewSurface,
 "FOCUS_WORDS_NO_DUPLICATE");
for(const n of ["027","035","062"])
 assert.equal(byId.get("AO.CANON.R62."+n).reviewSurface,"SERVER_RIBBON_ONLY");
assert.equal(byId.get("AO.CANON.R62.061").reviewSurface,"GUIDE_ONLY");
for(const n of ["026","040","053"])
 assert.ok(!["INLINE_ATOMIC_EDITORIAL","INDEPENDENT_STAGE_EDITORIAL_ONLY"].includes(
  byId.get("AO.CANON.R62."+n).reviewSurface),"Persistent states cannot flash");
for(const n of ["001","025","034","055","059"])
 assert.ok(!["INLINE_ATOMIC_EDITORIAL","INDEPENDENT_STAGE_EDITORIAL_ONLY"].includes(
  byId.get("AO.CANON.R62."+n).reviewSurface),"Composite actions not single observed events");
const editor=createCanonBilingualCopyReviewController(witnesses);
assert.equal(editor.project().rows.length,0,"A default production call may not receive copy");
assert.equal(editor.project({editorialPreview:true,form:"REQUIEM"}).rows.length,0,
 "Unsupported form must fail closed");
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const preview=editor.project({editorialPreview:true,form});
 assert.equal(preview.rows.length,62);
 assert.equal(preview.canPublish,false);
 assert.equal(preview.publicationReady,0);
 assert.ok(preview.rows.every(x=>x.observedNow===false));
 const one=editor.project({editorialPreview:true,form,
  actionIds:["AO.CANON.R62.024","AO.CANON.R62.035"]});
 assert.deepEqual(one.rows.map(x=>x.actor),["PRIEST","SERVER"]);
 assert.equal(one.rows[0].reviewSurface,"INDEPENDENT_STAGE_EDITORIAL_ONLY");
 assert.equal(one.rows[1].reviewSurface,"SERVER_RIBBON_ONLY");
}
assert.throws(()=>editor.project({editorialPreview:true,
 actionIds:["AO.CANON.R62.999"]}),/Unknown/);
function mutated(fn){const c=structuredClone(witnesses);fn(c);return c;}
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[0].canPublish=true;
})),/drift/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[22].currentlyVisible=true;
})),/drift/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[23].automaticallyTriggeredByScroll=true;
})),/drift/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[27].actor="DEACON";
})),/drift/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[26].actor="PRIEST";
})),/drift/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[27].shortDraft.fr="Il découvre le calice.";
})),/universal action/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[21].reviewSurface="INLINE_ATOMIC_EDITORIAL";
})),/source|counts/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[22].reviewSurface="INLINE_ATOMIC_EDITORIAL";
})),/non-text ceremony/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[26].reviewSurface="INLINE_ATOMIC_EDITORIAL";
})),/respondent|server/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[0].sourceUrls=["https://example.com/unverified"];
})),/drift/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[0].guideDraft.frCanonicalActionId="AO.CANON.R62.002";
})),/drift/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.french.rows[0].reviewState="PUBLISHED"; x.french.status="PUBLISHED";
})),/unpublished source witnesses/);
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.triage.rows.pop();
})),/unpublished source witnesses/);
console.log("PASS: 62 source-linked bilingual Canon short/guide drafts, 29 flagged, 0 published, 4 form fail-closed and stage/actor separation.");
