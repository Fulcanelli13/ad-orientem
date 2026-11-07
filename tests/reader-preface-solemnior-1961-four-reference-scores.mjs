import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {
 PREFACE_SOLEMNIOR_RESEARCH_SCHEMA,
 PREFACE_SOLEMNIOR_RESEARCH_SCORES as appendix,
 PREFACE_SOLEMNIOR_ORIGINAL_GABC as original,
 PREFACE_SOLEMNIOR_SOURCE_ID,
 PREFACE_SOLEMNIOR_SOURCE_DOWNLOAD,
 PREFACE_SOLEMNIOR_WITNESSES
} from "../src/mass/reader-preface-solemnior-reference-scores.js";
import {PARTICIPATION_REFERENCE_SCORES as fixed24} from "../src/mass/reader-participation-reference-scores.js";
import {APPROVED_MASS_INLINE_GABC as approved} from "../src/mass/reader-inline-chant-approved.js";
import {selectApprovedInlineScore}
 from "../src/mass/reader-inline-chant-selector.js";

assert.equal(PREFACE_SOLEMNIOR_RESEARCH_SCHEMA,"ao-1961-preface-solemnior-four-extra-research-cues-v1");
assert.equal(PREFACE_SOLEMNIOR_SOURCE_ID,4451);
assert.ok(PREFACE_SOLEMNIOR_SOURCE_DOWNLOAD.endsWith("id=4451"));
assert.equal(appendix.length,4);
assert.equal(fixed24.length,24,"The canonical 24 archival participation snippets remain unchanged");
assert.equal(approved.length,2,"Only two Ite VIII fragments are publicly approved");
const expectedCues=["AO.SM.C0136","AO.SM.C0138","AO.SM.C0140","AO.SM.C0143"];
const expectedIndex=[1,3,5,7];
const originalPhrases=original.slice(original.indexOf("%%")+2).trim()
 .split("(::)").map(x=>x.trim()).filter(Boolean);
assert.equal(originalPhrases.length,8);
assert.deepEqual(PREFACE_SOLEMNIOR_WITNESSES.map(x=>x.url),[
 "https://gregobase.selapa.net/sources/3/221.png",
 "https://gregobase.selapa.net/sources/2/1009.png"
]);
let matches=0;
for(const [i,s] of appendix.entries()){
 assert.equal(s.eventId,"PREFACE_DIALOGUE");
 assert.deepEqual(s.sourceCueIds,[expectedCues[i]]);
 assert.deepEqual(s.sourceCueLatin,[s.sourceLatin]);
 assert.equal(s.sourcePhraseIndex,expectedIndex[i]);
 assert.equal(s.sourceId,4451);
 assert.equal(s.kind,"PEOPLE_RESPONSE");
 assert.equal(s.toneFamily,"SOLEMNIOR_1961_SOURCE_UNASSIGNED");
 assert.equal(s.researchOnly,true);
 assert.equal(s.publicScoreApproved,false);
 assert.equal(s.exactSourceContextCertified,false);
 assert.equal(s.originalSourceGabcChecked,true);
 assert.equal(s.printedNoteParity,"PENDING_INDEPENDENT_NEUME_COLLATION");
 assert.equal(s.actualRitualSetting,"NOT_CERTIFIED");
 assert.equal(s.publicationGate,"USER_AND_MUSICAL_SOURCE_REVIEWED_REQUIRED");
 assert.equal(s.printWitnesses.length,2);
 assert.ok(!fixed24.some(x=>x.id===s.id),"Unreviewed third Preface tone MUST NOT enter 24-score reader");
 const match=originalPhrases[s.sourcePhraseIndex];
 const actual=s.gabc.slice(s.gabc.indexOf("%%")+2).trim();
 assert.equal(actual,"(c3) "+match+" (::)","Actual notes match full source #4451 exactly");
 assert.equal(createHash("sha256").update(actual).digest("hex"),
  createHash("sha256").update("(c3) "+match+" (::)").digest("hex"));
 const existing=fixed24.filter(x=>x.sourceCueIds.length===1&&x.sourceCueIds[0]===s.sourceCueIds[0]
  &&[4449,4450].includes(x.sourceId));
 assert.equal(existing.length,2);
 if(i===0)assert.equal(existing[0].gabc.split("%%")[1].trim(),actual,
  "All three printed settings share the SAME Amen response formula");
 else assert.ok(existing.every(x=>x.gabc.split("%%")[1].trim()!==actual),
  "Most solemn is not silently treated as Solemn or Ferial");
 assert.equal(selectApprovedInlineScore({cueId:s.sourceCueIds[0],paragraph:{
  sourceCueIds:[s.sourceCueIds[0]],primary:s.sourceLatin
 },form:"SOLEMN",settingId:"SOLEMNIOR_1961"}),null);
 matches++;
}
assert.equal(matches,4);
const altered={...appendix[1],gabc:appendix[1].gabc.replace("spí(g)ri(f)","spí(h)ri(f)")};
assert.notEqual(altered.gabc.split("%%")[1].trim(),
 "(c3) "+originalPhrases[3]+" (::)","Pitch manipulation must fail source exactness");
console.log("PASS 4/4 1961 Tonus solemnior source-exact responses, distinct tone, 2 printed pages, public gate untouched");
