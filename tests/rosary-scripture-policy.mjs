import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ROSARY_SCRIPTURE_REFERENCE_V1,ROSARY_SCRIPTURE_POLICY_V1,rosaryScripturePassage} from "../src/pray/rosary-scripture-policy.js";
import {ROSARY_MYSTERY_CONTEXT_V1} from "../src/pray/rosary-mystery-context.v1.js";
import {ROSARY_GUIDED_BEAD_MEDITATIONS_V1} from "../src/pray/rosary-guided-bead-meditations.v1.js";

const audit=JSON.parse(readFileSync("data/pray/rosary-scripture-editorial-inventory.v1.json","utf8"));
const entries=Object.entries(ROSARY_SCRIPTURE_REFERENCE_V1);
assert.equal(entries.length,20,"twenty historical+optional Rosary mysteries require a passage");
assert.deepEqual(entries.map(([id])=>id),[
  "joy1","joy2","joy3","joy4","joy5","lum1","lum2","lum3","lum4","lum5",
  "sor1","sor2","sor3","sor4","sor5","glo1","glo2","glo3","glo4","glo5"
]);
assert.equal(Object.keys(ROSARY_GUIDED_BEAD_MEDITATIONS_V1).length,20,"all 20 mysteries need guided bead meditations");
for(const [id,moments] of Object.entries(ROSARY_GUIDED_BEAD_MEDITATIONS_V1)){
 assert.ok(ROSARY_SCRIPTURE_REFERENCE_V1[id],id+" lacks source passage");
 assert.equal(moments.length,10,id+" must provide exactly ten sequential meditations");
 for(const [index,moment] of moments.entries()){
   assert.equal(moment.bead,index+1,id+" bead order drift");
   for(const language of ["en","fr"]){
      assert.ok(moment[language].length>=25,id+" "+index+" empty "+language+" meditation");
      assert.ok(!/\.\.\.|…|\[\s*\.\.\.\s*\]/.test(moment[language]),"ellipsis in "+id+" "+language);
   }
 }
}
assert.equal(Object.keys(ROSARY_MYSTERY_CONTEXT_V1).length,20,
 "all 20 mysteries must have coherent bilingual contextual Scripture meditations");
assert.equal(ROSARY_SCRIPTURE_POLICY_V1.readingMode,"SOURCE_LINKED_BILINGUAL_MYSTERY_CONTEXT");
assert.equal(ROSARY_SCRIPTURE_REFERENCE_V1.lum3.reference,"Mark 1:14-20",
 "Kingdom proclamation requires complete context rather than an isolated clause");
assert.equal(ROSARY_SCRIPTURE_REFERENCE_V1.sor2.reference,"John 19:1-3",
 "Scourging must retain the context surrounding the isolated verse");
assert.equal(ROSARY_SCRIPTURE_REFERENCE_V1.glo4.reference,"Luke 1:46-55",
 "Assumption biblical reference must not silently confuse Vulgate and Hebrew Psalm numbering");
for(const [id,ctx] of Object.entries(ROSARY_MYSTERY_CONTEXT_V1)){
 assert.equal(ctx.reference,ROSARY_SCRIPTURE_REFERENCE_V1[id].reference,
   id+" reference drift between sources and displayed summary");
 assert.ok(["Luc","Matthieu","Marc","Jean","Actes","Apocalypse"].includes(ctx.bookFr),id+" lacks verified Crampon book owner");
 for(const language of ["en","fr"]){
   assert.ok(ctx.summary[language].length>=95,id+" "+language+" does not explain the mystery coherently");
   assert.ok(ctx.intention[language].length>=25,id+" "+language+" lacks a prayer intention");
   assert.ok(!/\.\.\.|…|\[\s*\.\.\.\s*\]/.test(ctx.summary[language]),id+" "+language+" contains abridged quote markers");
 }
 assert.equal(ctx.publicTextStatus,"EDITORIAL_SUMMARY_NOT_VERBATIM_SCRIPTURE",
   id+" summary could be misidentified as verbatim Douay/Crampon");
 const passage=rosaryScripturePassage(id);
 assert.ok(passage&&passage.hrefFr.startsWith("https://fr.wikisource.org/wiki/Bible_Crampon_1923/"),
   id+" has no French Catholic edition link");
 assert.ok(passage.href.includes("version=DRA"),id+" English link not Douay–Rheims");
}
assert.match(rosaryScripturePassage("glo4").doctrinalHref,/munificentissimus-deus\.html$/);
assert.match(rosaryScripturePassage("glo5").doctrinalHref,/ad-caeli-reginam\.html$/);
assert.equal(rosaryScripturePassage("joy1").doctrinalHref,null);
assert.equal(ROSARY_MYSTERY_CONTEXT_V1.glo4.kind,"related_scripture_for_doctrinal_mystery");
assert.equal(ROSARY_MYSTERY_CONTEXT_V1.glo5.kind,"traditional_marian_typology");
assert.match(ROSARY_MYSTERY_CONTEXT_V1.glo4.summary.en,/assumed body and soul into heavenly glory/);
assert.match(readFileSync("src/pray/rosary-scripture-policy.js","utf8"),/The Assumption is not narrated here/,
 "historical clarification belongs in Scripture guidance, not the meditation");
assert.match(ROSARY_MYSTERY_CONTEXT_V1.glo5.summary.en,/Mother of the King of kings/);
assert.match(readFileSync("src/pray/rosary-scripture-policy.js","utf8"),/God.s people and traditionally interpreted/,
 "symbolic and ecclesial interpretation must remain in Scripture guidance");
assert.equal(rosaryScripturePassage("unknown"),null,"unknown mystery must fail closed");
assert.equal(audit.rows.length,200,"all 200 original cues must remain accounted for in the editorial archive");
assert.equal(new Set(audit.rows.map(x=>x.id)).size,200,"original bead identities were lost");
assert.equal(ROSARY_SCRIPTURE_POLICY_V1.donorExcerptCount,200);
assert.equal(ROSARY_SCRIPTURE_POLICY_V1.publicPerBeadExcerptStatus,"WITHHELD_UNTIL_PASSAGE_CERTIFICATION");
assert.ok(audit.rows.every(x=>x.reviewStatus==="PRIMARY_PASSAGE_COLLATION_PENDING"),
 "cannot relabel unattributed original snippets as independently verified");
for(const [id,ref] of entries){
  assert.match(ref.reference,/^[A-Z][\w\s]+\s+\d+:\d+(?:-\d+)?$/,"unsupported scriptural reference format: "+id);
  assert.match(rosaryScripturePassage(id).href,/^https:\/\/www\.biblegateway\.com\/passage\/\?/);
  assert.equal(ref.type==="traditional_typology",id==="glo4"||id==="glo5","typology classification drift: "+id);
}
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.match(runtime,/applyRosaryScripturePolicy\(r,info/,"Rosary active player must use the curation policy");
assert.match(runtime,/decorateRosaryExact\(r\)/,"canonical player should remain the runtime owner");
const policy=readFileSync("src/pray/rosary-scripture-policy.js","utf8");
assert.match(policy,/\.lab-prayer-sheet \.lab-scripture-cue/,"uncertified excerpt display not gated");
assert.match(policy,/\.lab-prayer-sheet \.lab-scripture-actions/,"unreviewed per-bead commentary/action pairing not gated");
assert.match(policy,/passage\.type==="traditional_typology"/);
assert.ok(!policy.includes("window.AO_ROSARY_V381="),"no replacement Rosary player allowed");
console.log("PASS Rosary bilingual Scripture: 20 coherent EN/FR mystery contexts, Crampon + Douay links, 200 held donor cues and accurate Marian typology");
