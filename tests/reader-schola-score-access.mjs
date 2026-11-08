import assert from "node:assert/strict";
import {resolveScholaSelectedScoreAccess} from "../src/mass/reader-schola-score-access.js";

const roles=["INTROIT","GRADUAL","ALLELUIA_TRACT_SEQUENCE","OFFERTORY","COMMUNION"];
const latin=[
 "Gaudeámus omnes in Dómino, diem festum celebrántes sub honóre Sanctórum ómnium.",
 "Timéte Dóminum, omnes Sancti ejus: quóniam nihil deest timéntibus eum.",
 "Veníte ad me, omnes, qui laborátis et oneráti estis: et ego refíciam vos.",
 "Justórum ánimæ in manu Dei sunt, et non tanget illos torméntum malítiæ.",
 "Beáti mundo corde, quóniam ipsi Deum vidébunt; beáti pacífici."
];
const itinerary={supported:true,properProgramme:roles.map((trackId,i)=>({
 trackId,eventId:trackId,source:"THIS_MASS_RESOLVED_1962_PROPER",
 status:"SOURCE_TEXT_ONLY_NOT_APPROVED_SCORE",
 lines:[{id:trackId+".1",latin:latin[i]}]
})),events:[
 {id:"KYRIE",trackId:"KYRIE",kind:"CHANT"},
 {id:"GLORIA",trackId:"GLORIA",kind:"CHANT"},
 {id:"SANCTUS",trackId:"SANCTUS_BENEDICTUS",kind:"CHANT"},
 {id:"BENEDICTUS_CONTINUOUS",trackId:"SANCTUS_BENEDICTUS",kind:"CHANT"}
],localOrdinarySelections:{KYRIE:"MASS_08",GLORIA:"MASS_08",
 SANCTUS_BENEDICTUS:"MASS_08"}};
const saints={date:"2026-11-01",proper:{data:{sourcePath:"Sancti/11-01"}},overlays:[]};
const x=resolveScholaSelectedScoreAccess({itinerary,resolvedMass:saints,form:"SOLEMN"});
assert.equal(x.schema,"ao-schola-selected-score-access-v1");
assert.equal(x.supported,true);
assert.deepEqual(x.proper.map(r=>r.scores.map(s=>s.id)),
 [["GREGOBASE-752"],["GREGOBASE-371"],["GREGOBASE-1237"],
  ["GREGOBASE-835"],["GREGOBASE-345"]]);
assert.equal(x.proper.every(r=>r.status==="SOURCE_BOUND_PROVISIONAL_1961_NOTATION"),true);
assert.equal(x.proper.every(r=>r.scores.every(s=>s.publicScoreApproved===false)),true);
assert.equal(x.ordinary.length,3);
assert.deepEqual(x.ordinary.map(r=>r.trackId),["KYRIE","GLORIA","SANCTUS_BENEDICTUS"]);
assert.equal(x.ordinary[0].source.status,"ORIGINAL_PRINT_FACSIMILE_REFERENCE");
assert.equal(x.publicApprovalsAdded,0);
assert.equal(x.heardMusicInferred,false);
const none=resolveScholaSelectedScoreAccess({
 itinerary,resolvedMass:{...saints,proper:{data:{sourcePath:"Sancti/11-02"}}},form:"SOLEMN"
});
assert.equal(none.proper.every(x=>x.scores.length===0),true);
for(const guard of [
 {...saints,date:"2026-11-02"},
 {...saints,overlays:["REQUIEM"]}
]){
 const withheld=resolveScholaSelectedScoreAccess({itinerary,resolvedMass:guard,form:"SOLEMN"});
 assert.equal(withheld.proper.every(x=>x.scores.length===0),true);
 if(guard.overlays.includes("REQUIEM"))assert.deepEqual(withheld.ordinary,[],
   "A stored non-Requiem Kyriale programme leaked into the Requiem");
}
const low=resolveScholaSelectedScoreAccess({itinerary,resolvedMass:saints,form:"LOW"});
assert.equal(low.proper.every(r=>r.scores.length===0),true);
assert.equal(low.supported,false);
assert.deepEqual(low.ordinary,[],"Low Mass cannot inherit Kyriale print references");
const noLocal=resolveScholaSelectedScoreAccess({
 itinerary:{...itinerary,localOrdinarySelections:{}},
 resolvedMass:saints,form:"SOLEMN"
});
assert.deepEqual(noLocal.ordinary,[],"Unselected Kyriale inherited original print");
const noSource=resolveScholaSelectedScoreAccess({
 itinerary:{...itinerary,properProgramme:itinerary.properProgramme.map(e=>({
  ...e,source:"UNKNOWN_OR_DIFFERENT_MASS"
 }))},resolvedMass:saints,form:"SOLEMN"
});
assert.equal(noSource.proper.every(x=>!x.scores.length),true);
const noChant=resolveScholaSelectedScoreAccess({itinerary:{supported:false},
 resolvedMass:saints,form:"SOLEMN"});
assert.equal(noChant.supported,false);
assert.equal(noChant.proper.length,0);
console.log("SCHOLA_SELECTED_SCORE_ACCESS_PASS 5 source Proper scores + 3 explicitly selected Kyriale originals, fail-closed");
