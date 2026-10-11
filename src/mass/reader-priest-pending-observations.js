// Five primary-rubric-backed priest-side observation events. These extend
// the *opt-in priest adapter only*: they are not part of the six-file 178-event
// certified MC objective traversal, nor can the Schola/card cursor fire them.
// The source-only cue is projected only after exact, independently reported
// priest movement or recitation with separately observed actor and evidence.
// "Certified" below describes the rubric identity, NOT field acceptance.
const RITUS="https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/";
const ROWS=[
  ["AO.SM.C0042","AO.CARD.001","MC-OBS-INT-POS","INTROIT",null,"NONE",
   "CELEBRANT_REACHES_EPISTLE_MISSAL_FOR_INTROIT","III.7-8","PRIEST_POSITION",
   "Observe celebrant actually at Epistle-side Missal after any incensation; Schola entrance and priest recitation are distinct instants.",
   "observedPosition","ALTAR_EPISTLE_MISSAL",["MC-INT-010","MC-INT-020"]],
  ["AO.SM.C0077","AO.CARD.006","MC-OBS-GRADUAL","CHANT","proper.gradual","LOW_VOICE",
   "CELEBRANT_PRIVATELY_READS_GRADUAL","VI.4","PRIEST_VOICE",
   "Observe celebrant personally reading Gradual softly after Solemn subdeacon Epistle; never take the Schola Gradual as priest timing. Other sung forms await rubric adjudication.",
   "observedDelivery","READ",["MC-EPI-020","MC-CHANT-010"]],
  ["AO.SM.C0109","AO.CARD.010","MC-OBS-OFFERTORY","OFFERTORY","proper.offertory","LOW_VOICE",
   "CELEBRANT_PRIVATELY_READS_OFFERTORY","VII.1-2","PRIEST_VOICE",
   "Observe celebrant himself quietly recite Offertory antiphon after Oremus but before preparing gifts; do not import the source cue's congregation SIT posture.",
   "observedDelivery","READ",["MC-OFF-020","MC-OFF-030","MC-OFF-040"]],
  ["AO.SM.C0250","AO.CARD.026","MC-OBS-PC-TURN","CONCLUSION",null,"NONE",
   "CELEBRANT_TURNS_TO_PEOPLE_BEFORE_POSTCOMMUNION_GREETING","XI.1","PRIEST_ACTION",
   "Observe physical turn toward the congregation after Communion antiphon, return to centre and altar kiss, before the first Postcommunion Dominus vobiscum.",
   "observedAction","TURN_TO_PEOPLE",["MC-END-010","MC-END-020","MC-END-030"]],
  ["AO.SM.C0256","AO.CARD.027","MC-OBS-DISMISS-TURN","CONCLUSION",null,"NONE",
   "CELEBRANT_TURNS_TO_PEOPLE_BEFORE_DISMISSAL_GREETING","XI.1-3","PRIEST_ACTION",
   "Observe physical turn after all Postcommunions, including the Oratio super populum when prescribed, and the altar kiss; never infer it from the final greeting.",
   "observedAction","TURN_TO_PEOPLE",["MC-END-050","MC-END-060","MC-END-070"]],
];
export const ORDINARY_SUNG_PENDING_PRIEST_OBSERVATIONS=Object.freeze(ROWS.map(
 ([cueId,sourceSectionId,eventId,phase,contentRef,speechAudibility,observationKey,rubric,
   priestChannel,observationCriterion,requiredWitness,requiredValue,forbiddenProxyEvents])=>
  Object.freeze({cueId,sourceSectionId,eventId,phase,contentRef,speechAudibility,
    observationKey,rubric,sourceUrl:RITUS,priestChannel,observationCriterion,
    requiredWitness,requiredValue,forbiddenProxyEvents:Object.freeze(forbiddenProxyEvents),
    activation:"EXPLICIT_OBSERVER_EVENT_ONLY",observerOnly:true,
    automatedIconAllowed:false,faithfulPostureAllowed:false,scholaClockAllowed:false})
));
// These exact MC-OBS-* identities can be reported by a human ceremonial
// observer. There is NO traversal order: they are prohibited from normal MC
// objective scheduling. Source texts/card counts remain unchanged.
export const ORDINARY_SUNG_PRIEST_OBSERVER_EVENTS=Object.freeze(
  ORDINARY_SUNG_PENDING_PRIEST_OBSERVATIONS.map(row=>Object.freeze({
    id:row.eventId,phase:row.phase,actor:"PRIEST",contentRef:row.contentRef,
    title:row.observationKey,voice:Object.freeze({audibility:row.speechAudibility==="NONE"
      ?"SILENT_ACTION":row.speechAudibility,speechAudibility:row.speechAudibility}),
    sourceCueId:row.cueId,sourceSectionId:row.sourceSectionId,
    observerOnly:true,automaticActivation:false,sourceUrl:row.sourceUrl,
    sourceRubric:row.rubric,
  }))
);
