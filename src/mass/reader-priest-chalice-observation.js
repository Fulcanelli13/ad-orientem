// Opt-in, independently REPORTED chalice actions: never canonical Mass cues.
// The historical Missal rubric belongs to AO.SM.B032 (Ritus servandus VII.4,
// VII.9); this controller does not add timing, icons, posture, or animations.
// A caller must report seeing the actor and the physical action. This module
// cannot itself verify physical events or derive them from prayer/Schola/scroll.
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const CHALICE_BLOCK="AO.SM.B032";
const CHALICE_SECTION="AO.CARD.010";
const RITUS="https://www.intratext.com/IXT/LAT0820/_PI.HTM";

function actionRules(form,requiem){
  const solemn=form==="SOLEMN";
  return Object.freeze({
    WINE_POURED:Object.freeze({actor:solemn?"DEACON":"PRIEST",object:"WINE",
      phase:"BEFORE_PRAYER"}),
    ...(solemn?{WATER_PRESENTED:Object.freeze({actor:"SUBDEACON",object:"WATER",
      phase:"DURING_PRAYER"})}:{}),
    ...(!requiem?{WATER_BLESSED:Object.freeze({actor:"PRIEST",object:"WATER",
      phase:"DURING_PRAYER"})}:{}),
    WATER_ADDED:Object.freeze({actor:solemn?"SUBDEACON":"PRIEST",object:"WATER",
      phase:"DURING_PRAYER"}),
  });
}

export function createObservedChalicePreparationController({resolvedMass=null}={}){
  const form=String(resolvedMass?.form??"").toUpperCase();
  const supported=FORMS.has(form)&&Boolean(resolvedMass?.actualCelebration);
  const requiem=String(resolvedMass?.actualCelebration?.type??"").toUpperCase()==="REQUIEM"
    || (Array.isArray(resolvedMass?.overlays)&&resolvedMass.overlays.includes("REQUIEM"));
  const rules=supported?actionRules(form,requiem):Object.freeze({});
  const observations=new Map();
  let closed=false;
  const project=()=>{
    const rows=Object.freeze([...observations.values()]);
    return Object.freeze({
      supported: supported&&!closed,
      reason:closed?"CLOSED":supported?null:"MASS_SELECTION_UNRESOLVED",
      form:supported?form:null,requiem:supported?requiem:null,
      sourceSectionId:CHALICE_SECTION,sourceBlockId:CHALICE_BLOCK,
      sourceUrl:RITUS,
      observationAuthority:"EXPLICIT_HUMAN_REPORT_NOT_SENSOR_VERIFIED",
      sourceOwner:rows.length?"OBSERVED_CHALICE_ACTION_REPORTED":"CHALICE_UNOBSERVED_FAIL_CLOSED",
      observations:rows,latest:rows.at(-1)??null,
      // A record is NOT an active priest gesture or a canonical timed event.
      priestAction:null,sacredMinister:null,faithfulPosture:null,
      cueId:null,cinematic:null,automatedIconAllowed:false,
    });
  };
  const reject=reason=>Object.freeze({accepted:false,reason,state:project()});
  return Object.freeze({
    project,
    observe(report={}){
      if(closed)return reject("CLOSED");
      if(!supported)return reject("MASS_SELECTION_UNRESOLVED");
      const {action,actor,object,phase,observed,source}=report??{};
      // The observer supplies action, actor, object AND phase. No defaults
      // from a known rubric, card, source text or expected progression.
      if(observed!==true||source!=="EXPLICIT_OBSERVATION")
        return reject("INDEPENDENT_OBSERVATION_REQUIRED");
      const key=String(action??"");
      const rule=Object.hasOwn(rules,key)?rules[key]:null;
      if(!rule)return reject("ACTION_NOT_ALLOWED_FOR_SELECTED_MASS");
      if(actor!==rule.actor||object!==rule.object||phase!==rule.phase)
        return reject("ACTOR_OBJECT_OR_PHASE_MISMATCH");
      if(observations.has(key))return reject("ACTION_ALREADY_REPORTED");
      const entry=Object.freeze({
        action:key,actor,object,phase,observed:true,source,
        observationStatus:"REPORTED_NOT_PHYSICALLY_VERIFIED",
        owner:"EXPLICIT_CHALICE_OBSERVATION",sourceSectionId:CHALICE_SECTION,
        sourceBlockId:CHALICE_BLOCK,sourceUrl:RITUS,
        canonicalCueId:null,syntheticTiming:false,
      });
      observations.set(key,entry);
      return Object.freeze({accepted:true,observation:entry,state:project()});
    },
    reset(){observations.clear();return project()},
    close(){observations.clear();closed=true;return project()},
  });
}
