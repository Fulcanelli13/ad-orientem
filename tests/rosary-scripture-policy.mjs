import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ROSARY_SCRIPTURE_REFERENCE_V1,ROSARY_SCRIPTURE_POLICY_V1,rosaryScripturePassage,rosaryMeditationCitationLabel} from "../src/pray/rosary-scripture-policy.js";
import {ROSARY_MYSTERY_CONTEXT_V1} from "../src/pray/rosary-mystery-context.v1.js";
import {ROSARY_GUIDED_BEAD_MEDITATIONS_V1} from "../src/pray/rosary-guided-bead-meditations.v1.js";
import {ROSARY_GUIDED_BEAD_EVIDENCE_V1} from "../src/pray/rosary-guided-bead-evidence.v1.js";

const audit=JSON.parse(readFileSync("data/pray/rosary-scripture-editorial-inventory.v1.json","utf8"));
const entries=Object.entries(ROSARY_SCRIPTURE_REFERENCE_V1);
assert.equal(entries.length,20,"twenty historical+optional Rosary mysteries require a passage");
assert.deepEqual(entries.map(([id])=>id),[
  "joy1","joy2","joy3","joy4","joy5","lum1","lum2","lum3","lum4","lum5",
  "sor1","sor2","sor3","sor4","sor5","glo1","glo2","glo3","glo4","glo5"
]);
assert.equal(Object.keys(ROSARY_GUIDED_BEAD_EVIDENCE_V1).length,20,
 "all 20 mysteries require stable per-bead source ownership");
const relationshipCounts={};
for(const [id,meditations] of Object.entries(ROSARY_GUIDED_BEAD_MEDITATIONS_V1)){
 const citations=ROSARY_GUIDED_BEAD_EVIDENCE_V1[id];
 assert.equal(citations?.length,10,id+" has missing per-bead source ownership");
 for(const [index,citation] of citations.entries()){
  assert.equal(citation.bead,index+1,id+" source/bead index drift");
  assert.equal(meditations[index].bead,citation.bead,id+" text/source index mismatch");
  assert.equal(citation.isDirectQuotation,false,"a Rosary meditation must never claim to be biblical quotation");
  assert.equal(citation.textualApproval,"NOT_A_BIBLICAL_QUOTATION");
  assert.match(citation.primaryUrl,/^https:\/\//);
  assert.match(citation.frenchPrimaryUrl,/^https:\/\//);
  assert.ok(citation.reference.length>=8,"source is not a clear reference: "+id+"."+index);
  relationshipCounts[citation.relationship]=(relationshipCounts[citation.relationship]||0)+1;
 }
}
const biblicalLinks=Object.values(ROSARY_GUIDED_BEAD_EVIDENCE_V1).flat().filter(x=>/^https:\/\/fr\.wikisource\.org\/wiki\/Bible_Crampon_1923\//.test(x.frenchPrimaryUrl));
assert.equal(biblicalLinks.length,190,"expected 190 chapter-specific Crampon links and 10 doctrinal witnesses");
for(const citation of biblicalLinks){
 const fr=rosaryMeditationCitationLabel(citation,{french:true});
 const en=rosaryMeditationCitationLabel(citation,{french:false});
 assert.notEqual(fr,"",citation.reference+" missing French displayed label");
 assert.equal(en,citation.reference,citation.reference+" English label must remain source-aligned");
 assert.ok(/^(Luc|Matthieu|Marc|Jean|Actes|Romains|Hébreux|Apocalypse|Isaïe|1 Pierre)\s\d+:/.test(fr),
    "French Catholic citation still displays an English book name: "+fr);
}
assert.equal(rosaryMeditationCitationLabel({reference:"Council of Trent",referenceFr:"Concile de Trente"},{french:true}),"Concile de Trente");
assert.equal(rosaryMeditationCitationLabel({reference:"John 19:26-27"},{french:true}),"Jean 19:26-27");
assert.equal(rosaryMeditationCitationLabel({reference:"1 Peter 2:24-25"},{french:true}),"1 Pierre 2:24-25");
for(const citation of biblicalLinks){
 const chapter=citation.reference.match(/\b(\d+):\d+/)?.[1];
 assert.ok(chapter,"cannot identify Bible chapter in "+citation.reference);
 assert.equal(new URL(citation.frenchPrimaryUrl).hash,"#"+chapter,
   "French Scripture source must open at chapter rather than at the book's title page: "+citation.reference);
}
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.joy5[2].en,/unaware that Jesus has stayed behind/);
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.joy5[2].fr,/sans savoir que Jésus est resté à Jérusalem/);
assert.equal(ROSARY_GUIDED_BEAD_EVIDENCE_V1.joy5[1].reference,"Luke 2:43");
assert.equal(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.joy5[1].en,"At twelve years old, Jesus stays behind in Jerusalem.");
assert.equal(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.joy5[1].fr,"À douze ans, Jésus reste à Jérusalem.");
assert.equal(ROSARY_GUIDED_BEAD_EVIDENCE_V1.glo3[5].reference,"Acts 2:5-6");
assert.equal(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.glo3[6].en,"Each hears the apostles speaking in his own language.");
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.glo3[6].fr,/propre langue/);
assert.equal(ROSARY_GUIDED_BEAD_EVIDENCE_V1.joy5[1].frenchPrimaryUrl.endsWith("#2"),true);
assert.equal(ROSARY_GUIDED_BEAD_EVIDENCE_V1.sor2[4].primaryUrl,
 "https://www.biblegateway.com/passage/?search=Isaiah%2053%3A5&version=DRA",
 "Isaias 53 must use the stable Douay–Rheims BibleGateway passage, not stale CCEL path");
assert.equal(Object.values(relationshipCounts).reduce((x,y)=>x+y,0),200);
assert.equal(relationshipCounts.MARIAN_TYPOLOGICAL_READING,6);
assert.equal(relationshipCounts.DEFINED_DOCTRINE,2);
assert.equal(relationshipCounts.DOGMATIC_TEACHING,2);
assert.equal(relationshipCounts.MAGISTERIAL_TEACHING,2);
assert.equal(ROSARY_GUIDED_BEAD_EVIDENCE_V1.glo4[9].relationship,"DEVOTIONAL_REFLECTION");
assert.equal(ROSARY_GUIDED_BEAD_EVIDENCE_V1.glo5[6].relationship,"MAGISTERIAL_TEACHING");
assert.equal(relationshipCounts.SCRIPTURAL_PASSION_INTERPRETATION,3);
assert.equal(ROSARY_GUIDED_BEAD_EVIDENCE_V1.glo4[6].reference,"Munificentissimus Deus §44");
assert.equal(ROSARY_GUIDED_BEAD_EVIDENCE_V1.glo5[0].relationship,"MARIAN_TYPOLOGICAL_READING");
assert.deepEqual(ROSARY_GUIDED_BEAD_EVIDENCE_V1.sor2.slice(4,7).map(x=>x.reference),
 ["Isaias 53:5","1 Peter 2:23","1 Peter 2:24-25"]);
// Sorrowful mystery V follows the actual Calvary sequence and preserves the
// order of the two filial entrustments in John 19:26-27, not the reverse.
const calvary=ROSARY_GUIDED_BEAD_MEDITATIONS_V1.sor5;
const calvaryEvidence=ROSARY_GUIDED_BEAD_EVIDENCE_V1.sor5;
assert.deepEqual(calvaryEvidence.map(x=>x.reference),[
 "John 19:18","John 19:19","John 19:25","John 19:26","John 19:26",
 "John 19:27","John 19:28","John 19:29","John 19:30","John 19:30"
],"Calvary sequence drifted from the 1962-compatible Douay-Rheims Gospel order");
assert.match(calvary[0].en,/crucified on Calvary/);
assert.match(calvary[1].fr,/Roi des Juifs/);
assert.match(calvary[4].en,/disciple to His Mother/);
assert.match(calvary[4].fr,/disciple bien-aimé à sa Mère/);
assert.match(calvary[5].en,/Mother to the beloved disciple/);
assert.match(calvary[5].fr,/Mère au disciple bien-aimé/);
assert.match(calvary[9].en,/gives up His spirit/);
for(const row of calvaryEvidence){
 assert.equal(row.relationship,"SCRIPTURAL_PARAPHRASE");
 assert.equal(new URL(row.frenchPrimaryUrl).hash,"#19");
}
assert.equal(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.sor3[7].en,"They spit upon the Lord in mockery.");
assert.equal(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.sor3[7].fr,"Ils crachent sur le Seigneur.");
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.sor4[6].fr,/avertit les femmes/);
assert.equal(ROSARY_GUIDED_BEAD_EVIDENCE_V1.sor2[6].reference,"1 Peter 2:24-25");
assert.deepEqual(ROSARY_GUIDED_BEAD_EVIDENCE_V1.lum5.slice(8).map(x=>x.relationship),
 ["DOGMATIC_TEACHING","DOGMATIC_TEACHING"],"Trent's teaching must own the Eucharistic doctrinal cues");
assert.match(ROSARY_GUIDED_BEAD_EVIDENCE_V1.lum5[8].primaryUrl,/twentysecond-session-of-the-council-of-trent/);
assert.match(ROSARY_GUIDED_BEAD_EVIDENCE_V1.lum5[8].frenchPrimaryUrl,/doctrines-et-canons-sur-le-sacrifice-de-la-messe/);
assert.match(ROSARY_GUIDED_BEAD_EVIDENCE_V1.lum5[9].primaryUrl,/thirteenth-session-of-the-council-of-trent/);
assert.match(ROSARY_GUIDED_BEAD_EVIDENCE_V1.lum5[9].frenchPrimaryUrl,/decret-sur-le-sacrement-de-leucharistie/);
assert.match(ROSARY_GUIDED_BEAD_EVIDENCE_V1.lum5[8].referenceFr,/Concile de Trente/);
assert.equal(ROSARY_GUIDED_BEAD_EVIDENCE_V1.sor4[6].relationship,"SCRIPTURAL_PARAPHRASE");
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.sor4[6].en,/warns the women/);
for(const x of [...ROSARY_GUIDED_BEAD_EVIDENCE_V1.glo4.slice(6),...ROSARY_GUIDED_BEAD_EVIDENCE_V1.glo5.slice(6)]){
 assert.equal(x.frenchWitnessLanguage,"la","papal doctrine should disclose source Latin in French mode");
 assert.match(x.frenchPrimaryUrl,/vatican\.va\/content\/pius-xii\/la\//);
}
const rosaryPolicy=readFileSync("src/pray/rosary-scripture-policy.js","utf8");
assert.match(rosaryPolicy,/rosaryMeditationCitationLabel\(witness,\{french\}\)/);
assert.match(rosaryPolicy,/frenchWitnessLanguage==="la"/);
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.joy1[2].en,/ponders the meaning/);
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.joy2[2].fr,/Élisabeth/);
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.joy4[3].en,/two turtledoves or two young pigeons/);
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.joy4[3].fr,/deux tourterelles ou deux petites colombes/);
assert.match(ROSARY_GUIDED_BEAD_MEDITATIONS_V1.lum4[9].en,/keep the vision secret/);
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
