import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {missalRubricDetailForParagraph} from "../src/mass/reader-missal-rubric-detail.js";
import {missalSourceRubricCopy,shouldShowExtendedMissalRubric} from "../src/mass/reader-missal-book-rubrics.js";
import {withPublishedMissalParagraphRubrics} from "../src/mass/reader-missal-rubrics.js";
import {normalizeReaderMoment} from "../src/mass/reader-dom.js";

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const registry=read("../data/presentation/reader-rubric-events.v1.json");
const sung=read("../data/presentation/reader-text-sung.v1.json");
const french=read("../data/presentation/reader-french-ordinary.v1.json");
const mk=(cue,latin,vernacular)=>({
 id:cue,sourceCueIds:[cue],kind:"RUBRIC",primary:latin,secondary:vernacular
});

// All fifteen "Latin" donor brackets are in fact editorial ENGLISH.
// They have an existing, independently preserved French byCue witness.
const rubrics=sung.blocks.flatMap(b=>b.units.filter(u=>
 /^\s*\[/.test(String(u.latin??""))));
assert.equal(rubrics.length,15);
for(const u of rubrics){
 assert.ok(french.byCue[u.cue_id],"Missing French bracket source: "+u.cue_id);
 const row=mk(u.cue_id,u.latin,french.byCue[u.cue_id]);
 const fr=missalSourceRubricCopy(row,{language:"fr"});
 assert.equal(fr.owner,"EXISTING_SOURCE_VERNACULAR_RUBRIC");
 assert.equal(fr.translationAvailable,true);
 assert.equal(fr.isLiturgicalLatin,false);
 assert.equal(fr.requestedLanguage,"fr");
 assert.equal(fr.text,french.byCue[u.cue_id].replace(/^\[([\s\S]*)\]$/,"$1").trim());
 assert.ok(!/^\[/.test(fr.text),"Rubric displayed with donor square brackets");
 const en=missalSourceRubricCopy(mk(u.cue_id,u.latin,u.english),{language:"en"});
 assert.equal(en.text,u.english.replace(/^\[([\s\S]*)\]$/,"$1").trim());
 // Real reader language policy: vernacular primary, English uppercase donor
 // alternate. The former MUST win, even without a separate secondary.
 const actualEnglish=missalSourceRubricCopy({
   kind:"RUBRIC",primary:u.english,secondary:null,alternate:u.latin
 },{language:"en"});
 const actualFrench=missalSourceRubricCopy({
   kind:"RUBRIC",primary:french.byCue[u.cue_id],secondary:null,alternate:u.latin
 },{language:"fr"});
 assert.equal(actualEnglish.text,en.text,"EN reader selected donor's uppercase pseudo-Latin rubric");
 assert.equal(actualFrench.text,fr.text,"FR reader selected donor's uppercase pseudo-Latin rubric");
 assert.ok(/\p{Ll}/u.test(actualEnglish.text)&&/\p{Ll}/u.test(actualFrench.text),
  "Source rubrics must be editorial sentence-case, not all-uppercase donor labels");
}
assert.equal(missalSourceRubricCopy({kind:"TEXT",primary:"Hoc est enim"}),null);
const host=mk("AO.SM.C0174",
 "[GENUFLECTS — ELEVATES THE SACRED HOST — REPLACES IT — GENUFLECTS]",
 "[Génuflexion — élévation de la sainte Hostie — dépose l’Hostie — génuflexion]");
const published=withPublishedMissalParagraphRubrics([host],registry,{form:"LOW",language:"fr"})[0];
assert.deepEqual(published.publishedMissalRubrics.filter(x=>x.kind!=="STATE"&&x.kind!=="BELL").map(x=>x.id),[
 "AO.RUB.C0174.01","AO.RUB.C0174.02",
 "AO.RUB.C0174.04","AO.RUB.C0174.05"
]);
assert.deepEqual(published.publishedMissalRubrics.filter(x=>x.kind==="STATE").map(x=>x.id),
 ["AO.RUB.C0174.06"],"Approved finger discipline remains distinct");
assert.equal(missalRubricDetailForParagraph(published),null,
 "Repeating the same four actions is not a long rubric");
const paten=withPublishedMissalParagraphRubrics([mk("AO.SM.C0111",
 "[MAKES THE CROSS WITH THE PATEN — PLACES THE HOST — SETS THE PATEN ASIDE]",
 "[Fait le signe de croix avec la patène — dépose l’Hostie — met la patène de côté]"
)],registry,{form:"LOW"})[0];
assert.equal(missalRubricDetailForParagraph(paten),null,
 "Repeating the same three paten gestures is not a long rubric");
const single=withPublishedMissalParagraphRubrics([{
 id:"AO.SM.C0169",sourceCueIds:["AO.SM.C0169"],kind:"TEXT",
 primary:"elevatis oculis",secondary:"raising his eyes",
}],registry,{form:"LOW"})[0];
assert.equal(missalRubricDetailForParagraph(single),null,
 "A Latin trigger is not itself a new long ceremonial description");
const norm=normalizeReaderMoment({paragraphs:[published]});
assert.equal(norm.paragraphs[0].publishedMissalRubrics.length,6);
assert.deepEqual(norm.paragraphs[0].publishedMissalRubrics.filter(x=>x.kind==="BELL").map(x=>x.id),
 ["AO.RUB.C0174.03"],"The server bell is a separate printed direction, not a fifth priest action");
assert.equal(missalRubricDetailForParagraph(norm.paragraphs[0]),null);
const speculative={
 status:"EDITORIAL_RESEARCH_ONLY",owner:"MISSAL_RUBRIC_LONG_CERTIFIED",
 materiallyAdditional:true,description:"An invented speculative longer rubrical text to fill the screen.",
 sourceUrl:"https://example.com",cueId:"AO.SM.C0174",
};
assert.equal(shouldShowExtendedMissalRubric(speculative),false);
assert.equal(missalRubricDetailForParagraph({...published,approvedExtendedCeremonial:speculative}),null);
const sourceLocked={
 ...speculative,status:"APPROVED_ADDITIONAL_1962_CEREMONIAL_TEXT",
 description:"A genuinely additional approved ceremonial passage, which is different from the visible short rubric."
};
assert.equal(shouldShowExtendedMissalRubric(sourceLocked),true,
 "Explicit new editorial authority may enable a future genuine long treatment");
assert.equal(missalRubricDetailForParagraph({...published,approvedExtendedCeremonial:{
 ...sourceLocked,cueId:"AO.SM.C0999"}}),null,"Wrong cue must fail closed");
assert.equal(missalRubricDetailForParagraph({...published,approvedExtendedCeremonial:sourceLocked}).sourceCueId,
 "AO.SM.C0174");
console.log("PASS 15 English/French source-only book rubrics, zero false Latin column, 4 Host actions + 1 finger state + 1 source-bound bell direction, no repetitive long expansions, future certified detail gate.");
