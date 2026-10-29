import test from "node:test";
import assert from "node:assert/strict";
import {
 OFFICE_PRECEDENCE_RULESET,OFFICE_PRECEDENCE_SOURCE,
 reviewOfficeOccurrence,reviewOfficeVespersConcurrence
} from "../src/office/precedence-review.js";

const date="2026-10-31",next="2026-11-01";
function office(id,day,kind,pos,{first=false,second=true,scope="UNIVERSAL"}={}){
 return {
  id,date:day,kind,tablePosition:pos,
  class:pos<=13?1:pos<=21?2:pos<=27?3:4,
  ruleset:OFFICE_PRECEDENCE_RULESET,calendarScope:scope,
  witness:{rubricSource:OFFICE_PRECEDENCE_SOURCE,sourceId:"office-witness:"+id},
  printedOfficeCertified:false,sourceTextApproved:false,
  hasFirstVespers:first,hasSecondVespers:second
 };
}
function occurrence(day,candidates,overrides={}){
 return reviewOfficeOccurrence({
  date:day,candidates,
  officeCalendarEvidence:"INDEPENDENT_OFFICE_CANDIDATES_RESEARCH",
  localCalendarStatus:"UNIVERSAL_ONLY",...overrides
 });
}
test("RG91 compares explicit Office table positions without Mass rank",()=>{
 const day="2026-11-05";
 const a=office("ordinary-feria",day,"FERIA",28);
 const b=office("universal-feast",day,"FEAST",24);
 const r=occurrence(day,[a,b]);
 assert.equal(r.status,"RUBRIC_CANDIDATE");
 assert.equal(r.candidate.principalId,"universal-feast");
 assert.equal(r.candidate.tablePosition,24);
 assert.deepEqual(r.outstanding,["RG_93_102_IMPEDED_OFFICE_DISPOSITION"]);
 assert.equal(r.officeSelectionAuthorized,false);
});
test("RG91 position ties with secondary precedence unknown are quarantined",()=>{
 const day="2026-10-29";
 const a=office("feast-one",day,"FEAST",24);
 const b=office("feast-two",day,"FEAST",24);
 assert.equal(occurrence(day,[a,b]).reason,"RG_91_POSITION_TIE_REQUIRES_ORDO");
});
test("missing Office-calendar authority, bad date and corrupt rank fail closed",()=>{
 const item=office("feria",date,"FERIA",28,{second:false});
 assert.equal(reviewOfficeOccurrence({date,candidates:[item]}).reason,
  "INDEPENDENT_OFFICE_CALENDAR_REQUIRED");
 assert.equal(occurrence("2026-02-30",[item]).status,"WITHHELD");
 assert.equal(occurrence(date,[{...item,class:1}]).status,"WITHHELD");
 assert.equal(occurrence(date,[{...item,witness:{...item.witness,rubricSource:"MASS_CALENDAR"}}]).status,"WITHHELD");
});
test("local proper feasts cannot be guessed from universal calendar",()=>{
 const special=office("local-patron",date,"FEAST",12,{scope:"LOCAL"});
 assert.equal(occurrence(date,[special]).reason,"LOCAL_CALENDAR_UNRESOLVED");
 const resolved=occurrence(date,[special],{localCalendarStatus:"LOCAL_RESEARCH_RECONCILED"});
 assert.equal(resolved.status,"RUBRIC_CANDIDATE");
 assert.equal(resolved.liturgicallyCertified,false);
});
test("impeded first class feast needs independent transfer assessment",()=>{
 const sunday=office("advent-sunday","2026-12-06","SUNDAY",6,{first:true});
 const feast=office("another-first-class-feast","2026-12-06","FEAST",11,{first:true});
 assert.equal(occurrence("2026-12-06",[sunday,feast]).reason,
  "RG_95_99_FIRST_CLASS_TRANSFER_REVIEW_REQUIRED");
});
test("special Office of the Dead is not the ordinary RG91 appointment",()=>{
 const dead=office("all-souls","2026-11-02","OFFICE_OF_DEAD",8);
 assert.equal(occurrence("2026-11-02",[dead]).reason,
  "SPECIAL_OFFICE_REQUIRES_OWN_RUBRICS");
});
test("October 31, 2026: All Saints First Vespers candidate, not a certified Office",()=>{
 const sat=occurrence(date,[office("feria-saturday",date,"FERIA",28,
  {second:false})]);
 const feast=occurrence(next,[office("all-saints",next,"FEAST",11,
  {first:true})]);
 const r=reviewOfficeVespersConcurrence({date,today:sat,tomorrow:feast});
 assert.equal(r.status,"RUBRIC_CANDIDATE");
 assert.equal(r.candidate.principalId,"all-saints");
 assert.equal(r.candidate.part,"FIRST");
 assert.equal(r.reason,"RG_13_27_37_79_SATURDAY_FIRST_VESPERS");
 assert.equal(r.officeSelectionAuthorized,false);
 assert.equal(r.commemorationsApproved,false);
});
test("First Advent Sunday candidate after Saturday BVM ending at None",()=>{
 const saturday="2026-11-28",sunday="2026-11-29";
 const a=occurrence(saturday,[office("saturday-bvm",saturday,"SATURDAY_BVM",27,
  {second:false})]);
 const b=occurrence(sunday,[office("advent-one",sunday,"SUNDAY",6,
  {first:true})]);
 const r=reviewOfficeVespersConcurrence({date:saturday,today:a,tomorrow:b});
 assert.equal(r.candidate.part,"FIRST");
 assert.equal(r.candidate.principalId,"advent-one");
});
test("RG105 equality retains current II Vespers, no approved commemoration",()=>{
 const a=occurrence("2026-09-20",[office("sunday","2026-09-20","SUNDAY",15)]);
 const b=occurrence("2026-09-21",[office("lord-feast","2026-09-21","FEAST",14,
  {first:true})]);
 const r=reviewOfficeVespersConcurrence({date:"2026-09-20",today:a,tomorrow:b});
 assert.equal(r.candidate.part,"SECOND");
 assert.equal(r.reason,"RG_105_EQUAL_CLASS_CURRENT_SECOND");
 assert.equal(r.commemorationReview,"RG_106_114_BR_250_259_REQUIRED");
});
test("RG104 higher class tomorrow wins, not by Table 91 ordinal",()=>{
 const a=occurrence("2026-09-20",[office("sunday","2026-09-20","SUNDAY",15)]);
 const b=occurrence("2026-09-21",[office("solemn-feast","2026-09-21","FEAST",11,
  {first:true})]);
 const r=reviewOfficeVespersConcurrence({date:"2026-09-20",today:a,tomorrow:b});
 assert.equal(r.reason,"RG_104_HIGHER_CLASS");
 assert.equal(r.candidate.part,"FIRST");
});
test("current II Vespers retained when following I Vespers are ineligible",()=>{
 const a=occurrence("2026-09-20",[office("sunday","2026-09-20","SUNDAY",15)]);
 const b=occurrence("2026-09-21",[office("simple-feast","2026-09-21","FEAST",24,
  {first:false})]);
 const r=reviewOfficeVespersConcurrence({date:"2026-09-20",today:a,tomorrow:b});
 assert.equal(r.reason,"NO_FOLLOWING_FIRST_VESPERS");
 assert.equal(r.candidate.part,"SECOND");
});
test("non-Saturday or special missing II Vespers require review",()=>{
 const a=occurrence("2026-11-05",[office("ordinary","2026-11-05","FERIA",28,
  {second:false})]);
 const b=occurrence("2026-11-06",[office("feast","2026-11-06","FEAST",11,
  {first:true})]);
 const r=reviewOfficeVespersConcurrence({date:"2026-11-05",today:a,tomorrow:b});
 assert.equal(r.status,"WITHHELD");
 assert.equal(r.reason,"CURRENT_OFFICE_WITHOUT_SECOND_VESPERS_REQUIRES_REVIEW");
});
test("discontinuous calendar pairs, missing Office decisions and local divergence fail",()=>{
 const a=occurrence(date,[office("saturday",date,"FERIA",28,{second:false})]);
 const b=occurrence(next,[office("all-saints",next,"FEAST",11,{first:true})]);
 assert.equal(reviewOfficeVespersConcurrence({date:"2026-10-30",today:a,tomorrow:b}).status,"WITHHELD");
 assert.equal(reviewOfficeVespersConcurrence({date,today:a,tomorrow:{...b,status:"WITHHELD"}}).status,"WITHHELD");
 const c=occurrence(next,[office("local-patron",next,"FEAST",12,{scope:"LOCAL",first:true})],
  {localCalendarStatus:"LOCAL_RESEARCH_RECONCILED"});
 assert.equal(reviewOfficeVespersConcurrence({date,today:a,tomorrow:c}).reason,
  "LOCAL_CALENDAR_SCOPE_CHANGED");
});
test("every candidate remains research-only and no Office becomes published",()=>{
 const day="2026-11-05";
 const r=occurrence(day,[office("feria",day,"FERIA",28)]);
 const s=occurrence("2026-11-06",[office("feast","2026-11-06","FEAST",24)]);
 const v=reviewOfficeVespersConcurrence({date:day,today:r,tomorrow:s});
 for(const obj of [r,s,v]){
  assert.equal(obj.officeSelectionAuthorized,false);
  assert.equal(obj.commemorationsApproved,false);
  assert.equal(obj.liturgicallyCertified,false);
  assert.equal(obj.published,0);
 }
});
