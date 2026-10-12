// Observed pre-Mass ceremonial events, before the first canonical prayer cue.
// This controller records only explicitly witnessed priest actions. It does
// not issue normative instructions, infer a tabernacle state, or tell the faithful
// to move. Mass may always begin when these observations are unavailable.
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const REVERENCES=new Set(["PROFOUND_BOW","SIMPLE_GENUFLECTION"]);

export function createObservedPriestEntranceController({form}={}){
  if(!FORMS.has(form))throw new TypeError("Supported 1962 Mass form required");
  let phase="UNOBSERVED",arrival=null,reverence=null;
  const state=()=>Object.freeze({
    phase,form,observed:arrival!==null||reverence!==null,
    arrived:arrival!==null,reverenceObserved:reverence!==null,
    event:reverence?Object.freeze({...reverence}):arrival?Object.freeze({...arrival}):null,
    arrival:arrival?Object.freeze({...arrival}):null,
    reverence:reverence?Object.freeze({...reverence}):null,
    // No pre-text gesture may remain active after the first Mass cue.
    priestAction:phase==="REVERENCE_OBSERVED" ? reverence.kind : null,
    sourceOwner:phase==="MASS_STARTED"?"PREMASS_EVENT_CLOSED"
      : reverence||arrival?"EXPLICIT_PRIEST_ENTRANCE_OBSERVATION"
      :"PREMASS_UNOBSERVED_FAIL_CLOSED",
    cueId:null,faithfulPosture:null,liturgicalRequirementCertified:false
  });
  const reject=reason=>Object.freeze({accepted:false,reason,state:state()});
  return Object.freeze({
    project:state,
    observeArrival({actor,observed,station,headwearRemoved=null}={}){
      if(phase==="MASS_STARTED")return reject("MASS_ALREADY_STARTED");
      if(arrival||actor!=="PRIEST"||observed!==true||
         station!=="FOOT_OF_ALTAR"||
         !(headwearRemoved===null||typeof headwearRemoved==="boolean"))
        return reject("ARRIVAL_NOT_OBSERVED");
      arrival={actor:"PRIEST",observed:true,station,headwearRemoved,
        owner:"EXPLICIT_PRIEST_ENTRANCE_OBSERVATION"};
      if(phase==="UNOBSERVED")phase="ARRIVED";
      return Object.freeze({accepted:true,state:state()});
    },
    observeReverence({actor,observed,kind,blessedSacramentReserved=null}={}){
      if(phase==="MASS_STARTED")return reject("MASS_ALREADY_STARTED");
      if(reverence||actor!=="PRIEST"||observed!==true||
         !REVERENCES.has(kind)||
         !(blessedSacramentReserved===null||typeof blessedSacramentReserved==="boolean"))
        return reject("REVERENCE_NOT_OBSERVED");
      // A witnessed bow/genuflection is recordable even when entrance or
      // reservation status was not witnessed. Neither is guessed from kind.
      reverence={actor:"PRIEST",observed:true,kind,blessedSacramentReserved,
        owner:"EXPLICIT_PRIEST_ENTRANCE_OBSERVATION"};
      phase="REVERENCE_OBSERVED";
      return Object.freeze({accepted:true,state:state()});
    },
    beginMass(){
      // Never make an observer certify biretta removal, tabernacle reservation,
      // or reverence in order to reach the first words of the Mass.
      if(phase==="MASS_STARTED")return Object.freeze({accepted:true,alreadyStarted:true,state:state()});
      phase="MASS_STARTED";
      return Object.freeze({accepted:true,alreadyStarted:false,state:state()});
    },
    reset(){phase="UNOBSERVED";arrival=null;reverence=null;return state()}
  });
}

// Existing right-rail priest-action surface can show a truly observed gesture
// while NO canonical Mass cue is yet active. It must not retain it at C0001.
export function projectObservedPreMassPriestAction({state=null,activeCueId=null}={}){
  if(activeCueId!=null || state?.phase!=="REVERENCE_OBSERVED" ||
     state?.reverence?.observed!==true)return null;
  const type=state.reverence.kind;
  if(type==="SIMPLE_GENUFLECTION")return Object.freeze({
    label:"GENUFLECTS",action:"GENUFLECTS",iconKey:"genuflect",
    cueId:null,owner:"OBSERVED_PREMASS_PRIEST",transient:true
  });
  if(type==="PROFOUND_BOW")return Object.freeze({
    label:"BOWS PROFOUNDLY",action:"BOWS PROFOUNDLY",
    iconKey:"priest_profound_bow_rich",
    cueId:null,owner:"OBSERVED_PREMASS_PRIEST",transient:true
  });
  return null;
}
