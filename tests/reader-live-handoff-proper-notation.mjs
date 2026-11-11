import {test} from "node:test";
import assert from "node:assert/strict";
import {selectLiveHandoffProperReferences} from "../src/mass/reader-live-handoff-proper-notation.js";

const sung="MISSA_CANTATA_INCENSE";
const latin="Gaudeamus omnes in Domino, diem festum celebrantes.";
const schola=Object.freeze({
  owner:"R17_NATIVE_SCHOLA",trackId:"INTROIT",segmentId:"INTROIT.1",
  cueId:null,latin,musicStatus:"EXPECTED_NOT_OBSERVED",composedWorkId:null
});
const resolvedMass=Object.freeze({date:"2026-11-01",
  form:sung,proper:{sourcePath:"Sancti/11-01"},overlays:[]});
const itinerary=Object.freeze({supported:true,properProgramme:[{
  trackId:"INTROIT",source:"THIS_MASS_RESOLVED_1962_PROPER",
  status:"SOURCE_TEXT_ONLY_NOT_APPROVED_SCORE",
  lines:[{id:"INTROIT.1",latin}]
}]});
const base=Object.freeze({schola,form:sung,resolvedMass,itinerary,
  sourceGate:true,approvedScoreVisible:false});
const select=overrides=>selectLiveHandoffProperReferences({...base,...overrides});

test("All Saints Introit is matched by actual selected 1962 Mass source, text and role",()=>{
 const found=select();
 assert.equal(found.length,1);
 assert.equal(found[0].scoreId,"GREGOBASE-752");
 assert.equal(found[0].trackId,"INTROIT");
 assert.equal(found[0].sourceSegmentId,"INTROIT.1");
 assert.equal(found[0].scoreRole,"INTROIT");
 assert.equal(found[0].status,"REFERENCE_ONLY_NOT_APPROVED");
 assert.equal(found[0].sourceScoreApproved,false);
 assert.equal(found[0].musicalPerformance,"NOT_OBSERVED");
 assert.ok(found[0].gabc.includes("%%"));
 assert.equal(Object.isFrozen(found),true);
});

test("Proper references fail closed for Low Mass, unapproved source or wrong resolved calendar",()=>{
 for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"])
   assert.equal(select({form}).length,1);
 assert.deepEqual(select({form:"LOW"}),[]);
 assert.deepEqual(select({sourceGate:false}),[]);
 assert.deepEqual(select({approvedScoreVisible:true}),[]);
 assert.deepEqual(select({resolvedMass:{...resolvedMass,date:"2026-11-02"}}),[]);
 assert.deepEqual(select({resolvedMass:{...resolvedMass,proper:{sourcePath:"Sancti/12-08"}}}),[]);
 assert.deepEqual(select({resolvedMass:{...resolvedMass,overlays:["REQUIEM"]}}),[]);
 assert.deepEqual(select({itinerary:{...itinerary,supported:false}}),[]);
 assert.deepEqual(select({itinerary:{...itinerary,properProgramme:[]}}),[]);
 assert.deepEqual(select({itinerary:{...itinerary,properProgramme:[
  ...itinerary.properProgramme,...itinerary.properProgramme]}}),[]);
 for(const edits of [
  {trackId:"COMMUNION"},{segmentId:"INTROIT.2"},{latin:"Gaudeamus"}, 
  {musicStatus:"HEARD"},{composedWorkId:"FAURE"},
  {owner:"PREVIEW_SAMPLE"}
 ])assert.deepEqual(select({schola:{...schola,...edits}}),[],
   "Bad native source: "+Object.keys(edits).join(","));
});

test("Advent I combined Gradual and Alleluia yields two distinct source references",()=>{
 const joined="Universi qui te exspectant non confundentur Domine. "+
   "Ostende nobis Domine misericordiam tuam et salutare tuum da nobis.";
 const source={date:"2026-11-29",form:sung,overlays:[],
   proper:{sourcePath:"Tempora/Adv1-0"}};
 const track={owner:"R17_NATIVE_SCHOLA",trackId:"GRADUAL",
   segmentId:"GRADUAL.1",cueId:null,latin:joined,
   musicStatus:"EXPECTED_NOT_OBSERVED"};
 const programme={supported:true,properProgramme:[{
   trackId:"GRADUAL",source:"THIS_MASS_RESOLVED_1962_PROPER",
   status:"SOURCE_TEXT_ONLY_NOT_APPROVED_SCORE",
   lines:[{id:"GRADUAL.1",latin:joined}]
 }]};
 const found=select({resolvedMass:source,schola:track,itinerary:programme});
 assert.deepEqual(found.map(x=>x.scoreId),["GREGOBASE-1169","GREGOBASE-1115"]);
 assert.deepEqual(found.map(x=>x.scoreRole),["GRADUAL","ALLELUIA"]);
 assert.equal(found.every(x=>x.sourceScoreApproved===false),true);
 assert.equal(found.every(x=>x.sourceSegmentId==="GRADUAL.1"),true);
 assert.deepEqual(select({resolvedMass:{...source,proper:{sourcePath:"Tempora/Adv2-0"}},
   schola:track,itinerary:programme}),[]);
});
