// A 1962 rubrical Low Mass communion warning must not be confused with the
// excluded legacy "priest Domine non sum dignus" bell. The canonical Mass
// event MC-COM-185 is presently unavailable/uncertified for Low objective
// traversal. This independent source-only *display* does not certify it,
// change the traversal, or claim that a bell was heard.
export const LOW_COMMUNION_BELL_RUBRIC=Object.freeze({
  source:"Missale Romanum (1962), Ritus servandus X.6",
  exactLatin:"Si qui sunt communicandi in Missa, paulo antea ministrans campanulæ signo eos moneat.",
  corroboration:"J. B. O’Connell, The Celebration of Mass (1964), Appendix B, p. 315, n. 2",
  sourceCueId:"AO.SM.C0225",
  window:"SHORTLY_BEFORE_FAITHFUL_COMMUNION",
  customaryAnchor:"SHORTLY_AFTER_AGNUS_DEI",
  explicitlyNot:"PRIEST_DOMINE_NON_SUM_DIGNUS_C0229_TO_C0231",
  canonicalEventIdStillUncertified:"MC-COM-185",
  owner:"1962_LOW_MASS_RITUS_SERVANDUS_X6_DISPLAY_ONLY",
  actualSound:"UNKNOWN",
});

const freeze=Object.freeze;
const faithfulCondition="FAITHFUL_COMMUNICANTS_PRESENT";
export function projectLowMassCommunionWarning({
 form=null,activeCueId=null,conditions=null,
 canonicalTransient=null,transitionPending=false,
}={}){
  const id=String(activeCueId??"");
  if(String(form).toUpperCase()!=="LOW"||id!==LOW_COMMUNION_BELL_RUBRIC.sourceCueId)
    return freeze({applies:false,bell:null,cinematic:null,
      owner:"NOT_LOW_MASS_COMMUNION_WARNING"});
  if(transitionPending===true)return freeze({applies:true,bell:null,cinematic:null,
    owner:"LOW_READER_CARD_TRANSITION_WAITING",status:"TRANSITION_WAITING"});
  const active=Array.isArray(conditions) && conditions.includes(faithfulCondition);
  if(!active)return freeze({applies:true,bell:null,cinematic:null,
    owner:"LOW_FAITHFUL_COMMUNION_NOT_CONFIRMED",status:"CONDITION_INACTIVE"});
  // Fail closed if/when an objective owner is eventually certified. Never
  // let a second independently authored bell duplicate a canonical event.
  if(canonicalTransient?.bell)return freeze({applies:true,bell:null,cinematic:null,
    owner:"CANONICAL_COMMUNION_BELL_ALREADY_PRESENT",status:"DUPLICATE_PREVENTED"});
  if(canonicalTransient?.reason!=="CANONICAL_EVENT_UNAVAILABLE_FOR_FORM")
    return freeze({applies:true,bell:null,cinematic:null,
      owner:"LOW_CANONICAL_BELL_STATE_REQUIRES_REVIEW",status:"UNRESOLVED"});
  const owner=LOW_COMMUNION_BELL_RUBRIC.owner;
  const bell=freeze({
    cueId:id,label:"COMMUNION WARNING",detail:"Before Communion of the faithful",
    canonicalEventIds:freeze([]),soundEvents:freeze([]),
    sourceTiming:freeze({
      sourceClock:"PRIEST_PRIVATE",
      rubricalWindow:LOW_COMMUNION_BELL_RUBRIC.window,
      timingPrecision:"APPROXIMATE_SOURCE_TEXT_LANDMARK",
      customaryAnchor:LOW_COMMUNION_BELL_RUBRIC.customaryAnchor,
      reason:"LOW_PRIVATE_PRAYER_NOT_INDEPENDENT_SERVER_OBSERVATION",
    }),
    owner,sourceAuthority:LOW_COMMUNION_BELL_RUBRIC.source,
    status:"EXPECTED_NOT_OBSERVED",observedNow:false,actuallyHeard:"UNKNOWN",
    notAnObservation:true,transient:true,presentationHoldMs:1350,
  });
  const cinematic=freeze({
    id:"LOW:X6:COMMUNION_WARNING",cueId:id,
    kind:"BELL",title:"COMMUNION WARNING",
    subtitle:"BEFORE COMMUNION OF THE FAITHFUL",
    durationMs:1350,transient:true,owner,canonicalAuthority:false,
    observedNow:false,notAnObservation:true,
    timingPrecision:"APPROXIMATE_SOURCE_TEXT_LANDMARK",
  });
  return freeze({applies:true,bell,cinematic,owner,
    status:"SOURCE_RUBRIC_DISPLAY_ONLY_NOT_CANONICAL_TRAVERSAL"});
}
