import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {createCanonResearchReviewer,canonResearchPreviewEnabled}
 from "../src/learn/living-church-canon-research-reader.mjs";
import {createCanonResearchQuestionCatalog}
 from "../src/learn/formation-canon-question-catalog.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const provenance=read("data/learn/formation-canon-migration-provenance-20261018.v1.json");
const query="?aoVisibleMassReview=1&aoLivingChurchReview=1&aoLivingChurchCharacters=1&aoCanonResearchReview=1";
const win={location:{search:query}};
const fetcher=async uri=>{
 const bytes=readFileSync(fileURLToPath(uri));
 return {ok:true,json:async()=>JSON.parse(bytes.toString("utf8"))};
};
test("migration is exactly the 27 original Folio research-source Git blobs",()=>{
 assert.equal(provenance.sourceFileCount,27);
 assert.equal(provenance.files.length,27);
 assert.equal(new Set(provenance.files.map(x=>x.path)).size,27);
 for(const file of provenance.files){
  const bytes=readFileSync(new URL("../"+file.path,import.meta.url));
  const sha=createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
  assert.equal(sha,file.gitBlobSha,"Folio original source changed: "+file.path);
 }
});
test("Folio source adapter is fail-closed for 534 questions",async()=>{
 assert.equal(canonResearchPreviewEnabled(win),true);
 const index=read("data/learn/formation-historical-answer-crosswalk-20261013.v1.json");
 const delta=read("data/learn/research/formation-new-15-indexed-answer-adequacy-20261014.v1.json");
 const catalog=createCanonResearchQuestionCatalog(index,delta);
 assert.equal(catalog.counts.total,534);
 assert.equal(catalog.counts.withPreexistingSupplement,417);
 assert.equal(catalog.counts.publishableAnswers,0);
 assert.equal(catalog.listBank("LUT").length,25);
 assert.equal(catalog.listBank("BAP-EV").length,25);
 assert.equal(catalog.get("LIT-064"),null,"Older-only ID must remain outside original Folio 534");
 assert.equal(catalog.publicHandoff("LUT-005").routeTarget,null);
 assert.equal(catalog.get("LUT-005").canDisplaySourceAnswer,false);
 const reader=await createCanonResearchReviewer(win,{fetcher});
 assert.equal(reader.counts.total,534);
 assert.equal(reader.canPublish,false);
 assert.equal(reader.publicHandoff().ok,false);
 const review=reader.getEditorialAudit("LUT-011");
 assert.equal(review.class,"PINPOINT_CORRECTED_IN_SOURCE_OWNER_ERRATA_PENDING_APPROVAL");
 assert.equal(review.publicationAllowed,undefined);
 assert.equal(review.pinpoints.length,3);
 assert.match(review.pinpoints.map(p=>p.authority).join(" "),/Session XIII/);
 assert.match(review.held,/original-source citation errata/i);
 const corrected=await reader.originalResearch("LUT-011",{lang:"en"});
 assert.equal(corrected.ok,true);
 assert.equal(corrected.editorialCorrection.originalOwnerGitBlobSha,"2be4ae1ac77662f96a5fd6a68d972b0b51b63455");
 assert.deepEqual(corrected.paragraphs[0].sourceIds,["AC-X","TRENT-XIII","FC-VII"]);
 assert.ok(corrected.paragraphs[0].sources.some(s=>/thirteenth-session/.test(s.url)));
 assert.equal(corrected.publicAnswerAuthorized,false);
 const gifts=await reader.originalResearch("PEN-010",{lang:"en"});
 assert.equal(gifts.ok,true);
 assert.ok(gifts.editorialExtraWitnesses.some(w=>w.id==="SCHREINER-2014"));
 assert.equal(gifts.publicAnswerAuthorized,false);
 assert.equal(reader.getEditorialAudit("LUT-005"),null);
 const magic=await reader.originalResearch("ERR-009",{lang:"en"});
 assert.equal(magic.ok,true);
 assert.equal(magic.editorialAudit.class,"PINPOINT_CORRECTED_IN_SOURCE_OWNER_ERRATA_PENDING_APPROVAL");
 assert.equal(magic.editorialAudit.pinpoints.length,2);
 assert.deepEqual(magic.paragraphs[0].sourceIds,["CCC-2117"]);
 assert.deepEqual(magic.paragraphs[1].sourceIds,["CCC-2117"]);
 assert.equal(magic.editorialCorrection.publicAnswerAllowed,false);
 assert.equal(magic.publicAnswerAuthorized,false);
 const lut=await reader.originalResearch("LUT-005",{lang:"en"});
 assert.equal(lut.ok,true);
 assert.equal(lut.originalSourcePointer.recordId,"LUT-005");
 assert.match(lut.originalSourcePointer.path,/lutheran-13-partials/);
 assert.ok(lut.paragraphs.length>=2);
 assert.ok(lut.paragraphs[0].sourceText.includes("1999"));
 assert.equal(lut.publicAnswerAuthorized,false);
 assert.equal(lut.characterQuote,false);
 const fr=await reader.originalResearch("LUT-011",{lang:"fr"});
 assert.equal(fr.ok,true);
 assert.ok(fr.paragraphs.some(x=>x.sourceText?.includes("présence")));
 const baptist=await reader.originalResearch("BAP-EV-010",{lang:"en"});
 assert.equal(baptist.ok,true);
 assert.match(baptist.originalSourcePointer.path,/baptist-7-partials/);
 const protestant=await reader.originalResearch("PROT-025",{lang:"en"});
 assert.equal(protestant.ok,true);
 assert.equal(protestant.originalSourcePointer.recordId,"PROT-025");
 const direct=await reader.originalResearch("ISR-011",{lang:"en"});
 assert.equal(direct.ok,true);
 assert.equal(direct.originalSourcePointer.recordId,"APOL-045");
 assert.ok(direct.paragraphs.length>=4);
 const islam=await reader.originalResearch("ISL-005",{lang:"en"});
 assert.equal(islam.ok,true,"The 15-question Islamic supplement uses original entries[] not records[]");
 assert.equal(islam.originalSourcePointer.recordId,"ISL-005");
 assert.equal(islam.paragraphs.length,2);
 assert.ok(islam.paragraphs.some(x=>x.sourceText?.includes("Qur")));
 assert.equal(islam.publicAnswerAuthorized,false);
 assert.equal((await reader.originalResearch("LIT-064")).ok,false);
});
test("any missing fourth review flag blocks research fetch and publication",async()=>{
 for(const flag of ["aoCanonResearchReview","aoLivingChurchCharacters","aoVisibleMassReview","aoLivingChurchReview"]){
  const denied={location:{search:query.replace(flag+"=1",flag+"=0")}};
  assert.equal(canonResearchPreviewEnabled(denied),false);
  await assert.rejects(()=>createCanonResearchReviewer(denied,{fetcher}),/four explicit review flags/);
 }
});
