// Source-backed definitions for the five *unbound* priest-side source-only
// cues. These observation keys are NOT canonical MC-event IDs, and MUST NOT
// be passed to observePriestCeremonialEvent() or inferred from reader/Schola
// navigation. They document the independent evidence needed before binding.
const RITUS_SERVANDUS_1962="https://1962ordo.today/1962-rubrics/";
const ROWS=[
  ["AO.SM.C0042","AO.CARD.001","CELEBRANT_REACHES_EPISTLE_MISSAL_FOR_INTROIT",
   "III.2; III.4 (solemn sequence)","PRIEST_POSITION",
   "Observe the celebrant physically arrive before the Epistle-side Missal; in Solemn Mass allow for preceding incensation.",
   ["MC-INT-010","MC-INT-020"]],
  ["AO.SM.C0077","AO.CARD.006","CELEBRANT_PRIVATELY_READS_GRADUAL",
   "VI.4 (Solemn Mass); VI.8 (sung minister distinction)","PRIEST_VOICE",
   "Observe the celebrant himself quietly read the Gradual; the Schola chant is an independent clock. Solemn is explicit in VI.4; sung-form variants require separate adjudication.",
   ["MC-EPI-020","MC-CHT-010"]],
  ["AO.SM.C0109","AO.CARD.010","CELEBRANT_PRIVATELY_READS_OFFERTORY",
   "VII.1-2","PRIEST_VOICE",
   "Observe the celebrant say the Offertory antiphon before preparing the gifts; neither Schola singing nor host offering proves this event. Never carry the source cue's faithful SIT state across.",
   ["MC-OFF-020","MC-OFF-030","MC-OFF-040"]],
  ["AO.SM.C0250","AO.CARD.026","CELEBRANT_TURNS_TO_PEOPLE_BEFORE_POSTCOMMUNION_GREETING",
   "XI.1","PRIEST_ACTION",
   "After reciting the Communion antiphon the celebrant returns to centre, kisses the altar, and physically turns toward the congregation before the first Dominus vobiscum.",
   ["MC-END-010","MC-END-020","MC-END-030"]],
  ["AO.SM.C0256","AO.CARD.027","CELEBRANT_TURNS_TO_PEOPLE_BEFORE_DISMISSAL_GREETING",
   "XI.1-2","PRIEST_ACTION",
   "After all Postcommunions, and the Oratio super populum when prescribed, observe the celebrant return to centre, kiss the altar and turn before the final Dominus vobiscum.",
   ["MC-END-050","MC-END-060","MC-END-070"]],
];
export const ORDINARY_SUNG_PENDING_PRIEST_OBSERVATIONS=Object.freeze(ROWS.map(
 ([cueId,sourceSectionId,observationKey,rubric,priestChannel,observationCriterion,forbiddenProxyEvents])=>
  Object.freeze({cueId,sourceSectionId,observationKey,rubric,sourceUrl:RITUS_SERVANDUS_1962,
    priestChannel,observationCriterion,forbiddenProxyEvents:Object.freeze(forbiddenProxyEvents),
    eventId:null,activation:"SPECIFIED_UNBOUND_NO_TRIGGER",
    automatedIconAllowed:false,faithfulPostureAllowed:false,scholaClockAllowed:false})
));
