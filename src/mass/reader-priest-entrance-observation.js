// Pre-Mass observation lane. Never infer the celebrant's entrance or reverence
// from the first canonical Mass text cue.
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const REVERENCES=new Set(["PROFOUND_BOW","SIMPLE_GENUFLECTION"]);
export function createObservedPriestEntranceController({form}={}){
  if(!FORMS.has(form))throw new TypeError("Supported 1962 Mass form required");
  let phase="UNOBSERVED",observation=null;
  const state=()=>Object.freeze({
    phase,observed:observation!==null,form,
    event:observation?Object.freeze({...observation}):null,
    priestAction:observation?.observedReverence??null,
    sourceOwner:observation?"EXPLICIT_PRIEST_ENTRANCE_OBSERVATION":"PREMASS_UNOBSERVED_FAIL_CLOSED",
    cueId:null,faithfulPosture:null,
    liturgicalRequirementCertified:false
  });
  return Object.freeze({
    project:state,
    observeArrival({actor,observed,station,headwearRemoved}={}){
      if(phase!=="UNOBSERVED"||actor!=="PRIEST"||observed!==true||
         station!=="FOOT_OF_ALTAR"||typeof headwearRemoved!=="boolean")
        return Object.freeze({accepted:false,reason:"ARRIVAL_NOT_OBSERVED",state:state()});
      phase="ARRIVED";
      observation={actor:"PRIEST",station,headwearRemoved,observedReverence:null};
      return Object.freeze({accepted:true,state:state()});
    },
    observeReverence({actor,observed,kind,blessedSacramentReserved}={}){
      // Tabernacle state is an explicit observed datum, not a date-based guess.
      if(phase!=="ARRIVED"||actor!=="PRIEST"||observed!==true||
         !REVERENCES.has(kind)||typeof blessedSacramentReserved!=="boolean")
        return Object.freeze({accepted:false,reason:"REVERENCE_NOT_VERIFIED",state:state()});
      // The historical book distinguishes the reserved Sacrament. It does NOT,
      // by itself, certify every 1962 local context; retain observed action only.
      phase="REVERENCE_OBSERVED";
      observation={...observation,observedReverence:kind,blessedSacramentReserved};
      return Object.freeze({accepted:true,state:state()});
    },
    beginMass(){
      if(phase!=="REVERENCE_OBSERVED")return Object.freeze({accepted:false,reason:"PREMASS_OBSERVATION_INCOMPLETE",state:state()});
      phase="MASS_STARTED";
      return Object.freeze({accepted:true,state:state()});
    },
    reset(){phase="UNOBSERVED";observation=null;return state()}
  });
}
