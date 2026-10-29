import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {
  OFFICE_VESPERS_CONCURRENCE_VERSION,reviewOfficeVespersConcurrence,
  inspectOfficeVespersPair,inspectAllSaintsToAllSouls
} from "../src/office/vespers-concurrence-gate.js";

const cal=(date,id,rank)=>({date,status:"ready",day:{main:{id,rank}}});
const make=(todayClass,followingClass,options={})=>{
  const date="2026-10-31",followingDate="2026-11-01";
  const current={id:"sancti:10-31",class:todayClass,officeKind:"FERIAL",
    hasSecondVespers:true,...options.current};
  const following={id:"sancti:11-01",class:followingClass,officeKind:"FESTIVE",
    hasFirstVespers:true,...options.following};
  return {date,followingDate,current,following,
    todayCalendar:cal(date,current.id,options.calendarTodayRank??todayClass),
    followingCalendar:cal(followingDate,following.id,options.calendarFollowingRank??followingClass)};
};
const witness=(date,headline)=>({
  schema:"ao.office.source-cells.v1",date,hour:"VESPERS",language:"la",
  sourceRevision:DIVINUM_OFFICIUM_PIN,status:"STRUCTURED_UNVERIFIED",
  publishable:false,headline,sections:[{
    sourceCellId:"Vespera1",text:"Incipit\n℣. Deus in adiutorium",
    sourceIndex:1,index:1,semantic:{role:"OPENING"}
  }]
});
test("generic Vespers comparer reads two canonical Calendar days and never authorizes an Office",()=>{
  assert.equal(OFFICE_VESPERS_CONCURRENCE_VERSION,"ao.office.vespers-concurrence.v1");
  for(const [a,b,expectedPart,expectedId,clause] of [
    [3,1,"FIRST","sancti:11-01","RG_104_HIGHER_CLASS"],
    [1,2,"SECOND","sancti:10-31","RG_104_HIGHER_CLASS"],
    [1,1,"SECOND","sancti:10-31","RG_105_EQUAL_CLASS_CURRENT_SECOND"],
    [4,3,"FIRST","sancti:11-01","RG_104_HIGHER_CLASS"],
  ]){
    const result=reviewOfficeVespersConcurrence(make(a,b));
    assert.equal(result.status,"RUBRIC_CANDIDATE");
    assert.equal(result.reason,clause);
    assert.equal(result.candidate.part,expectedPart);
    assert.equal(result.candidate.principalId,expectedId);
    assert.equal(result.officeSelectionAuthorized,false);
    assert.equal(result.commemorationsApproved,false);
    assert.equal(result.published,0);
  }
});
test("unverified eligibility, calendar drift, special Office and invalid dates fail closed",()=>{
  const scenarios=[
    [{following:{hasFirstVespers:null}},"SECOND_AND_FIRST_VESPERS_ELIGIBILITY_UNPROVEN"],
    [{current:{hasSecondVespers:false}},"SECOND_AND_FIRST_VESPERS_ELIGIBILITY_UNPROVEN"],
    [{following:{officeKind:"OFFICE_OF_DEAD"}},"BR_173_SPECIAL_OFFICE_OF_DEAD_REQUIRES_OWN_PROPER"],
    [{current:{officeKind:"OFFICE_OF_DEAD"}},"BR_173_SPECIAL_OFFICE_OF_DEAD_REQUIRES_OWN_PROPER"],
    [{calendarFollowingRank:1},"INDEPENDENT_OFFICE_CLASS_AND_CALENDAR_RANK_REQUIRED"],
  ];
  for(const [override,reason] of scenarios){
    const d=make(2,3,override),r=reviewOfficeVespersConcurrence(d);
    assert.equal(r.status,"WITHHELD");
    assert.equal(r.reason,reason);
    assert.equal(r.officeSelectionAuthorized,false);
    assert.equal(r.published,0);
  }
  const base=make(2,3);
  assert.equal(reviewOfficeVespersConcurrence({...base,followingDate:"2026-11-03"}).reason,
    "NON_ADJACENT_OR_INVALID_DATES");
  assert.equal(reviewOfficeVespersConcurrence({...base,todayCalendar:null}).reason,
    "BOTH_CANONICAL_CALENDAR_DAYS_REQUIRED");
  assert.equal(reviewOfficeVespersConcurrence({...base,followingCalendar:{
    ...base.followingCalendar,date:"2026-10-31"
  }}).reason,"BOTH_CANONICAL_CALENDAR_DAYS_REQUIRED");
  const none=reviewOfficeVespersConcurrence(make(1,2,{following:{hasFirstVespers:false}}));
  assert.equal(none.status,"WITHHELD");
  assert.equal(none.reason,"NO_FOLLOWING_FIRST_VESPERS");
  assert.equal(none.candidate.part,"SECOND");
  assert.equal(none.officeSelectionAuthorized,false);
});
test("two source-owned First/Second Vespers pilots confirm only the source pattern",()=>{
  const pairs=[
    {id:"ALL_SAINTS",eve:"2026-10-31",day:"2026-11-01",headline:"Omnium Sanctorum ~ I. classis"},
    {id:"ADVENT_I",eve:"2026-11-28",day:"2026-11-29",headline:"Dominica I Adventus ~ I. classis"}
  ];
  for(const p of pairs){
    const first=witness(p.eve,p.headline+"\nVespera de sequenti.");
    const second=witness(p.day,p.headline+"\nVespera");
    const r=inspectOfficeVespersPair({id:p.id,eve:first,day:second});
    assert.equal(r.sourceStructureConsistent,true);
    assert.equal(r.localOfficePrecedenceVerified,false);
    assert.equal(r.commemorationsVerified,false);
    assert.equal(r.published,0);
    assert.equal(inspectOfficeVespersPair({id:p.id,eve:witness(p.eve,p.headline),
      day:second}).sourceStructureConsistent,false);
    assert.equal(inspectOfficeVespersPair({id:p.id,eve:first,
      day:witness(p.day,p.headline+"\nVespera de sequenti")}).sourceStructureConsistent,false);
    assert.throws(()=>inspectOfficeVespersPair({id:p.id,eve:{...first,publishable:true},
      day:second}),/WITNESS_INVALID/);
    assert.throws(()=>inspectOfficeVespersPair({id:p.id,eve:{...first,sourceRevision:"changed"},
      day:second}),/WITNESS_INVALID/);
  }
});
test("All Saints to All Souls special Office is NEVER auto-promoted from two headlines",()=>{
  const r=inspectAllSaintsToAllSouls({
    saints:witness("2026-11-01","Omnium Sanctorum ~ I. classis"),
    souls:witness("2026-11-02","In Commemoratione Omnium Fidelium Defunctorum ~ I. classis"),
  });
  assert.equal(r.sourceHeadlinesConsistent,true);
  assert.equal(r.calendarAllSoulsDateMatches,true);
  assert.equal(r.vesperalOfficeOnNovember1NotIndependentlyAdjudicated,true);
  assert.equal(r.commemorationsVerified,false);
  assert.equal(r.officeSelectionAuthorized,false);
  assert.equal(r.published,0);
});
