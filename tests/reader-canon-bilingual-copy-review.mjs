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
const canonicalShortById=new Map(witnesses.french.rows.map(x=>[x.id,x]));
assert.equal(witnesses.bilingual.counts.shortFrenchCanonicalLinks,62);
assert.equal(witnesses.bilingual.rows.filter(x=>Object.hasOwn(x.shortDraft,"fr")).length,0,
 "A second French short-rubric text owner must not exist");
for(const raw of witnesses.bilingual.rows){
 assert.equal(raw.shortDraft.frCanonicalActionId,raw.actionId,
  "Bilingual packet must link to exact source-owned French short text");
 assert.ok(raw.shortDraft.en.length>4,"English short copy must remain present");
}
for(const x of audit.rows){
 assert.ok(x.shortDraft.fr.length>5&&x.shortDraft.en.length>5);
 assert.ok(x.guideDraft.fr.length>x.shortDraft.fr.length/2);
 assert.ok(x.guideDraft.en.length>20);
 assert.ok(x.sourceUrls.every(s=>s.startsWith("https://")));
 assert.equal(x.guideFrenchOwnerId,x.actionId);
 assert.equal(x.copyApproval,"NOT_APPROVED");
 assert.doesNotMatch(x.guideDraft.en,/\b(?:reader|scroll|source trigger|generic paragraph|actor ownership|implementation|render|dashboard)\b/i,
  "Guide copy must state the substantive rite rather than implementation commentary");
 assert.equal(x.canPublish,false);
 assert.equal(x.observedNow,false);
 assert.equal(x.faithfulPosture,null);
}
for(const [n,phraseEn] of [
 ["011","open hands"],["022","consecration"],["024","elevates the Host"],
 ["026","thumbs and index"],["027","server rings"],
 ["028","chalice is uncovered"],["032","chalice consecration"],
 ["035","server rings"],["040","keeps his hands extended"],
 ["050","raises his voice"],["058","Host above"],
 ["059","replaces the sacred species"],["061","respondent says Amen"],
 ["062","server gives the warning bell"],
]){
 const row=byId.get("AO.CANON.R62."+n);
 assert.ok(row,"Missing required form/actor/source cue "+n);
 assert.equal(row.shortDraft.fr,canonicalShortById.get(row.actionId).shortFrenchRubricDraft,
  n+": French short text must resolve from the canonical R62 source");
 assert.ok(row.shortDraft.en.includes(phraseEn),n+": English copy semantics drift");
}
const englishSourceParity={
  "001": [
    "lowers his hands and eyes",
    "bows profoundly"
  ],
  "002": [
    "straightens",
    "then joins his hands"
  ],
  "004": [
    "hands extended",
    "prescribed conditions"
  ],
  "005": [
    "joins and raises his hands",
    "slightly bowed"
  ],
  "008": [
    "prescribed proper form",
    "certain days"
  ],
  "011": [
    "open hands",
    "until Per Christum"
  ],
  "013": [
    "benedictam",
    "adscriptam",
    "ratam"
  ],
  "016": [
    "raises and joins",
    "towards the cross"
  ],
  "017": [
    "If other Hosts",
    "first uncovers",
    "accepit panem"
  ],
  "020": [
    "left hand",
    "with his right"
  ],
  "023": [
    "adores the consecrated Host",
    "first genuflection"
  ],
  "026": [
    "except to touch a consecrated Host",
    "until the washing"
  ],
  "027": [
    "server rings three times or continuously",
    "Host elevation"
  ],
  "028": [
    "chalice is uncovered",
    "deacon when required at Solemn Mass",
    "priest raises it slightly"
  ],
  "029": [
    "item tibi gratias agens"
  ],
  "030": [
    "left hand",
    "with his right"
  ],
  "032": [
    "Bending over the chalice",
    "chalice consecration"
  ],
  "033": [
    "Haec quotiescumque",
    "first genuflection"
  ],
  "034": [
    "first genuflection",
    "elevates the chalice",
    "has it covered",
    "genuflects again"
  ],
  "035": [
    "server rings three times or continuously",
    "chalice elevation"
  ],
  "036": [
    "Unde et memores quietly"
  ],
  "037": [
    "de tuis donis ac datis"
  ],
  "039": [
    "Panem sanctum",
    "Calicem salutis"
  ],
  "041": [
    "Supplices te rogamus",
    "hands joined"
  ],
  "042": [
    "ex hac altaris participatione"
  ],
  "043": [
    "Corpus",
    "Sanguinem"
  ],
  "046": [
    "joins and raises his hands",
    "Blessed Sacrament"
  ],
  "047": [
    "faithful departed",
    "brief silence"
  ],
  "051": [
    "famulis tuis",
    "hands extended"
  ],
  "053": [
    "Per quem haec omnia"
  ],
  "055": [
    "deacon at Solemn Mass when required",
    "takes the Host"
  ],
  "056": [
    "Per ipsum",
    "cum ipso",
    "in ipso"
  ],
  "057": [
    "Patri",
    "Sancti",
    "between the chalice and his breast"
  ],
  "059": [
    "replaces the sacred species",
    "deacon at Solemn Mass when required",
    "priest genuflects"
  ],
  "060": [
    "Per omnia saecula saeculorum audibly"
  ],
  "061": [
    "respondent says Amen",
    "minister at Low Mass",
    "respondents at Sung Masses"
  ]
};
assert.equal(Object.keys(englishSourceParity).length,36);
for(const [number,phrases] of Object.entries(englishSourceParity)){
 const action="AO.CANON.R62."+number,copy=byId.get(action);
 assert.ok(copy,"Missing approved-source identity "+action);
 for(const text of phrases)assert.ok(copy.shortDraft.en.includes(text),
  action+": essential French source nuance lost from English copy: "+text);
 assert.equal(copy.shortDraft.fr,canonicalShortById.get(action).shortFrenchRubricDraft);
 assert.equal(copy.canPublish,false);
 assert.equal(copy.observedNow,false);
}
for(const row of audit.rows){
 const canonical=canonicalShortById.get(row.actionId);
 assert.equal(row.shortDraft.fr,canonical.shortFrenchRubricDraft,
  row.actionId+": Canon bilingual preview has a competing French short copy");
 assert.equal(row.guideDraft.fr,canonical.revisedFrenchRubric,
  row.actionId+": Canon bilingual preview has a competing French long copy");
 assert.equal(row.shortFrenchOwnerId,canonical.id);
 assert.equal(row.guideFrenchOwnerId,canonical.id);
}
for(const [number,pattern] of [
 ["001",/les abaisse, joint les mains et s’incline profondément/],
 ["011",/jusqu’à « Per Christum »/],
 ["026",/jusqu’à l’ablution des doigts/],
 ["028",/diacre à la messe solennelle/],
 ["055",/diacre à la messe solennelle/],
 ["058",/l’Hostie tenue au-dessus/],
 ["059",/diacre à la messe solennelle/],
]){
 assert.match(byId.get("AO.CANON.R62."+number).shortDraft.fr,pattern,
  number+": qualified 1962 French source action cannot be shortened by stale bilingual copy");
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
})),/drift/,"An unauthorized second French owner must fail closed");
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.bilingual.rows[27].shortDraft.frCanonicalActionId="AO.CANON.R62.027";
})),/drift/,"Cross-referencing a different French source action must fail closed");
assert.throws(()=>validateCanonBilingualCopyReview(mutated(x=>{
 x.french.rows[27].shortFrenchRubricDraft="Il découvre le calice.";
})),/universal action/,"Canonical French cannot universalize Solemn deacon ownership");
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
console.log("PASS: 62 canonical French short/long references (0 duplicates), 62 English proposals, 29 flagged, 0 published, 4 form fail-closed and actor separation.");
