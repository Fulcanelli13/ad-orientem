import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {
 OFFICE_PRECEDENCE_RULESET,OFFICE_PRECEDENCE_SOURCE,reviewOfficeOccurrence
} from "../src/office/precedence-review.js";
import {
 reviewOfficeHourHandoff,composeReviewedOfficeHourDraft
} from "../src/office/reviewed-hour-handoff.js";
import {createOfficeSectionResolver}
 from "../src/office/source-section-resolver.js";

const eve="2026-10-31",feast="2026-11-01";
function office(id,date,kind,position,{first=false,second=true}={}){
 return {id,date,kind,tablePosition:position,
  class:position<=13?1:position<=21?2:position<=27?3:4,
  ruleset:OFFICE_PRECEDENCE_RULESET,calendarScope:"UNIVERSAL",
  witness:{rubricSource:OFFICE_PRECEDENCE_SOURCE,sourceId:"fixture:"+id},
  printedOfficeCertified:false,sourceTextApproved:false,
  hasFirstVespers:first,hasSecondVespers:second};
}
function occurrence(date,candidates){
 return reviewOfficeOccurrence({
  date,candidates,officeCalendarEvidence:"INDEPENDENT_OFFICE_CANDIDATES_RESEARCH",
  localCalendarStatus:"UNIVERSAL_ONLY"
 });
}
const saturday=occurrence(eve,[office("saturday-feria",eve,"FERIA",28,{second:false})]);
const sunday=occurrence(feast,[office("all-saints",feast,"FEAST",11,{first:true})]);
const selection={
 edition:"ROMAN_1960",date:feast,hour:"VESPERS",officeKey:"all-saints",
 officePart:"FIRST",status:"RESEARCH_SELECTION",
 sourceRevision:DIVINUM_OFFICIUM_PIN,
 orderedSections:[{key:"verse-one",role:"VERSICLE",
  path:"Sancti/11-01",section:"Oratio"}]
};
function sectionResolver({missingFrench=false,unresolved=false}={}){
 const calls=[];
 const resolver=createOfficeSectionResolver({
  readSource:async(path,language)=>{
   calls.push({path,language});
   return {sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
    map:new Map(language==="fr"&&missingFrench?[]:[
     ["Oratio",[unresolved?"@Commune/C1:Oratio":language+" Office section"]]])};
  }
 });
 return {resolver,calls};
}
test("Saturday civil date maps to following feast's I Vespers source",async()=>{
 const handoff=reviewOfficeHourHandoff({
  civilDate:eve,hour:"VESPERS",occurrence:saturday,
  followingOccurrence:sunday,selection
 });
 assert.equal(handoff.status,"SOURCE_SELECTION_RESEARCH");
 assert.equal(handoff.civilDate,eve);
 assert.equal(handoff.officeDate,feast);
 assert.equal(handoff.officePart,"FIRST");
 assert.equal(handoff.officeSelectionAuthorized,false);
 const {resolver,calls}=sectionResolver();
 const draft=await composeReviewedOfficeHourDraft({resolver,handoff});
 assert.equal(draft.civilDate,eve);
 assert.equal(draft.date,feast);
 assert.equal(draft.officePart,"FIRST");
 assert.equal(draft.sectionCount,1);
 assert.equal(draft.publishable,false);
 assert.equal(draft.commemorationsApproved,false);
 assert.equal(calls.length,3);
});
test("a source list from the current Saturday cannot impersonate All Saints",()=>{
 const h=reviewOfficeHourHandoff({
  civilDate:eve,hour:"VESPERS",occurrence:saturday,
  followingOccurrence:sunday,selection:{...selection,date:eve}
 });
 assert.equal(h.canResearchParse,false);
 assert.equal(h.reason,"OFFICE_SOURCE_SELECTION_NOT_MATCHING_REVIEW");
});
test("unknown following occurrence blocks Vespers before any source reads",async()=>{
 const h=reviewOfficeHourHandoff({
  civilDate:eve,hour:"VESPERS",occurrence:saturday,selection
 });
 assert.equal(h.canResearchParse,false);
 const {resolver,calls}=sectionResolver();
 await assert.rejects(composeReviewedOfficeHourDraft({resolver,handoff:h}),
  /OFFICE_RESEARCH_HANDOFF_NOT_ELIGIBLE/);
 assert.equal(calls.length,0);
});
test("non-Vespers uses its civil day's Office and refuses part override",async()=>{
 const s={...selection,date:eve,hour:"LAUDS",officePart:undefined,
  officeKey:"saturday-feria"};
 const h=reviewOfficeHourHandoff({civilDate:eve,hour:"LAUDS",
  occurrence:saturday,selection:s});
 assert.equal(h.canResearchParse,true);
 const draft=await composeReviewedOfficeHourDraft({
  resolver:sectionResolver().resolver,handoff:h});
 assert.equal(draft.date,eve);
 assert.equal(draft.officePart,null);
 assert.equal(draft.publishable,false);
 const bad=reviewOfficeHourHandoff({civilDate:eve,hour:"LAUDS",
  occurrence:saturday,selection:{...s,officePart:"FIRST"}});
 assert.equal(bad.canResearchParse,false);
});
test("impeded celebrations require an independent disposition review",()=>{
 const date="2026-11-05";
 const both=occurrence(date,[office("feria",date,"FERIA",28),
  office("saint",date,"FEAST",24)]);
 const h=reviewOfficeHourHandoff({civilDate:date,hour:"LAUDS",occurrence:both,
  selection:{...selection,date,hour:"LAUDS",officePart:undefined,officeKey:"saint"}});
 assert.equal(h.reason,"OFFICE_IMPEDED_CELEBRATION_DISPOSITION_UNRESOLVED");
});
test("right ID with missing French source cannot generate trilingual draft",async()=>{
 const h=reviewOfficeHourHandoff({civilDate:eve,hour:"VESPERS",
  occurrence:saturday,followingOccurrence:sunday,selection});
 const {resolver}=sectionResolver({missingFrench:true});
 await assert.rejects(composeReviewedOfficeHourDraft({resolver,handoff:h}),
  /OFFICE_SOURCE_SECTION_EMPTY/);
});
test("unresolved same-language source directives cannot be silently composed",async()=>{
 const h=reviewOfficeHourHandoff({civilDate:eve,hour:"VESPERS",
  occurrence:saturday,followingOccurrence:sunday,selection});
 const {resolver}=sectionResolver({unresolved:true});
 await assert.rejects(composeReviewedOfficeHourDraft({resolver,handoff:h}),
  /OFFICE_SOURCE_DIRECTIVE_UNRESOLVED/);
});
test("invalid date and forged approval never authorize research handoff",()=>{
 const h=reviewOfficeHourHandoff({civilDate:"2026-02-30",hour:"VESPERS",
  occurrence:saturday,followingOccurrence:sunday,selection});
 assert.equal(h.canResearchParse,false);
 assert.equal(reviewOfficeHourHandoff({civilDate:eve,hour:"VESPERS",
  occurrence:{...saturday,officeSelectionAuthorized:true},
  followingOccurrence:sunday,selection}).canResearchParse,false);
});
