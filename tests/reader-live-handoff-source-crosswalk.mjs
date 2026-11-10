import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createMassReaderModel} from "../src/mass/reader-model.js";
import {projectDirectOrdinaryCuratedLiveCards}
 from "../src/mass/reader-live-direct-curated.js";
import {
 LIVE_HANDOFF_CROSSWALK_SCHEMA,LIVE_HANDOFF_REFERENCE_ANCHORS,
 LIVE_HANDOFF_OUTSIDE_MASS_REFERENCES,
 resolveLiveHandoffSourceCrosswalk,nativeCardForHandoffReference
} from "../src/mass/reader-live-handoff-source-crosswalk.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const source={
 sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
 lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
 sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
 canonSourceMap:load("../data/presentation/reader-canon-source-map.v1.json")
};
const proper={
 sourcePath:"Sancti/10-07",
 introit:{lat:"Introitus",en:"Introit"},collects:[{lat:"Collecta",en:"Collect"}],
 epistle:{lat:"Epistola",en:"Epistle"},
 gradual:{lat:"Graduale",en:"Gradual"},
 alleluia_tract:{lat:"Alleluia",en:"Alleluia"},
 sequence:{lat:"",en:""},gospel:{lat:"Evangelium",en:"Gospel"},
 offertory:{lat:"Offertorium",en:"Offertory"},
 secrets:[{lat:"Secreta",en:"Secret"}],
 preface:{lat:"Praefatio",en:"Preface"},
 communion:{lat:"Communio",en:"Communion"},
 postcommunions:[{lat:"Postcommunio",en:"Postcommunion"}]
};
function actual(form,scenario="ORDINARY"){
 const req=scenario==="REQUIEM";
 const withSequence=scenario==="SEQUENCE"||req;
 const resolved={
   schema:"ao-resolved-mass-v2",
   date:req?"2026-11-02":"2026-10-07",
   form,presentationMode:"MISSAL",
   calendarCelebration:{id:req?"ALL_SOULS":"HOLY_ROSARY",type:"CALENDAR"},
   actualCelebration:{id:req?"requiem":"holy_rosary",type:req?"REQUIEM":"VOTIVE"},
   explicitlySelectedCelebration:true,
   proper:{status:"READY",data:{
     ...proper,sourcePath:req?"Votive/Requiem":"Sancti/10-07",
     sequence:withSequence?{lat:"Sequentia",en:"Sequence"}:{lat:"",en:""}
   }},
   overlays:req?["REQUIEM"]:["VOTIVE_PROPER"],
   precedingRites:[],followingActions:[],distinctRite:null
 };
 const macros=createMassReaderModel({...source,resolvedMass:resolved});
 const model=projectDirectOrdinaryCuratedLiveCards(macros,source.canonSourceMap);
 return {model,resolved};
}
assert.equal(LIVE_HANDOFF_REFERENCE_ANCHORS.length,65);
assert.deepEqual(LIVE_HANDOFF_REFERENCE_ANCHORS.map(x=>x.referenceId),
 Array.from({length:65},(_,i)=>"C"+String(i+1).padStart(2,"0")));
assert.deepEqual(LIVE_HANDOFF_OUTSIDE_MASS_REFERENCES.map(x=>x.referenceId),
 ["P1","P2","Q1"]);
assert.ok(LIVE_HANDOFF_OUTSIDE_MASS_REFERENCES.every(x=>x.outside65===true));
assert.deepEqual(LIVE_HANDOFF_REFERENCE_ANCHORS.slice(28,31).map(x=>[
 x.referenceId,x.sourceKey,x.cutOrdinal,x.referenceTitle]),[
 ["C29","AO.CARD.013",1,"Sanctus"],
 ["C30","AO.CANON.01",1,"Te igitur"],
 ["C31","AO.CANON.02",1,"Memento, Domine — Living"]
]);
assert.deepEqual(LIVE_HANDOFF_REFERENCE_ANCHORS.slice(34,38).map(x=>[
 x.referenceId,x.sourceKey,x.cutOrdinal]),[
 ["C35","AO.CANON.06",1],["C36","AO.CANON.06",2],
 ["C37","AO.CANON.07",1],["C38","AO.CANON.07",2]
]);
const forms=["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
for(const form of forms){
 const {model}=actual(form);
 assert.equal(model.totalCards,65,form+" expected baseline");
 const result=resolveLiveHandoffSourceCrosswalk({model,form});
 assert.equal(result.schema,LIVE_HANDOFF_CROSSWALK_SCHEMA);
 assert.equal(result.status,"EXACT_NATIVE_65_CROSSWALK",form+
   " expected exact native source crosswalk, got "+JSON.stringify(result.holds));
 assert.equal(result.sourceMatches,65);
 assert.equal(result.exactReferenceMatches,65);
 assert.equal(result.mappings.length,65);
 assert.equal(result.holds.length,0);
 assert.equal(result.additionalNativeCards.length,0);
 assert.equal(result.publicReaderChanged,false);
 assert.equal(result.independentScholaProgression,true);
 assert.equal(result.visualClockIsNotObservedSinging,true);
 assert.deepEqual(result.mappings.map(x=>x.nativeCardId),
   model.cards.map(c=>c.sectionId),form+" must resolve original native ID, not add cards");
 assert.deepEqual(result.mappings.map(x=>x.nativeSequence),
   Array.from({length:65},(_,i)=>i+1));
 assert.ok(result.mappings.every(x=>x.evidence?.sourceOwned===true));
 assert.ok(result.mappings.some(x=>x.evidence.sourceCueIds.length>0));
 assert.equal(result.mappings[28].nativeTitle,"Sanctus");
 assert.equal(result.mappings[28].nativeCardId,"AO.LIVECURATED.AO.CARD.013.1");
 assert.equal(result.mappings[35].evidence.canonSegmentId,"AO.CANON.06");
 assert.equal(result.mappings[37].evidence.canonSegmentId,"AO.CANON.07");
 assert.equal(result.mappings[44].evidence.canonSegmentId,"AO.CANON.14");
 assert.equal(result.mappings[44].evidence.sourceBlockIds.includes("AO.SM.B061"),true);
 assert.equal(nativeCardForHandoffReference({crosswalk:result,model,referenceId:"C36"}),
   model.cards[35]);
 assert.equal(nativeCardForHandoffReference({crosswalk:result,model,referenceId:"C55"}),
   model.cards[54]);
 assert.equal(nativeCardForHandoffReference({crosswalk:result,model,referenceId:"P1"}),null);
 assert.equal(nativeCardForHandoffReference({crosswalk:result,model,referenceId:"C66"}),null);
 if(form==="LOW"){
   assert.equal(result.mappings[6].titleStatus,"SOURCE_VALID_LOW_MASS_TITLE");
   assert.equal(result.mappings[15].titleStatus,"SOURCE_VALID_LOW_MASS_TITLE");
 }
}
for(const scenario of ["SEQUENCE","REQUIEM"]){
 const {model}=actual("SOLEMN",scenario);
 const result=resolveLiveHandoffSourceCrosswalk({model,form:"SOLEMN"});
 assert.equal(result.status,"SOURCE_VARIANT_OR_DRIFT_HOLD",scenario+
  " must not be forced into prototype's fixed reference count");
 assert.ok(result.holds.length>0);
 assert.ok(result.mappings.every(row=>!row.nativeCardId ||
   model.cards.some(c=>c.sectionId===row.nativeCardId)));
 assert.ok(result.mappings.every(row=>row.referenceNumber>=1&&row.referenceNumber<=65));
 assert.equal(nativeCardForHandoffReference({crosswalk:result,model,referenceId:"C30"}),null);
 assert.ok(result.additionalNativeCards.length>=1);
}
const {model}=actual("SOLEMN");
const base=resolveLiveHandoffSourceCrosswalk({model,form:"SOLEMN"});
const mutate=(i,data)=>{
 const cards=[...model.cards];
 cards[i]={...cards[i],...data};
 return {...model,cards};
};
const changedTitle=resolveLiveHandoffSourceCrosswalk({
 model:mutate(35,{title:"Incorrect Consecration"}),form:"SOLEMN"});
assert.equal(changedTitle.status,"SOURCE_VARIANT_OR_DRIFT_HOLD");
assert.ok(changedTitle.holds.some(x=>x.referenceId==="C36"&&
 x.reason==="NATIVE_TITLE_OR_CUT_VARIANT_REQUIRES_REVIEW"));
const changedOwner=resolveLiveHandoffSourceCrosswalk({
 model:mutate(35,{provenance:{...model.cards[35].provenance,canonSegmentId:"AO.CANON.07"}}),
 form:"SOLEMN"});
assert.ok(changedOwner.holds.some(x=>x.referenceId==="C36"&&
 x.reason==="NATIVE_SOURCE_OWNER_DRIFT"));
const changedId=resolveLiveHandoffSourceCrosswalk({
 model:mutate(35,{sectionId:"AO.LIVECURATED.AO.CANON.06.999"}),form:"SOLEMN"});
assert.ok(changedId.holds.some(x=>x.referenceId==="C36"&&
 x.reason==="MISSING_EXACT_NATIVE_SOURCE_CUT"));
assert.equal(changedId.additionalNativeCards.length,1);
assert.equal(resolveLiveHandoffSourceCrosswalk({model:{
 ...model,cards:[model.cards[0],model.cards[0]]
}}).reason,"DUPLICATE_OR_EMPTY_NATIVE_SOURCE_CARD_ID");
assert.equal(resolveLiveHandoffSourceCrosswalk({model:{cards:model.cards,
 structureOwner:"HISTORICAL_48"}}).reason,"CANONICAL_DIRECT_65_FAMILY_MODEL_REQUIRED");
assert.equal(resolveLiveHandoffSourceCrosswalk({}).reason,"ACTUAL_NATIVE_SOURCE_CARDS_REQUIRED");
console.log("LIVE_HANDOFF_65_SOURCE_CROSSWALK_PASS 4 actual Mass forms, 65/65 exact native identities, 14 Canon segments, state-only source omissions, variants held, no parallel timeline");
