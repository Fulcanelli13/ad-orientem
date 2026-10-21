/**
 * Minimal editorial *presentation* of already-published 1962 priest rubrics.
 * Neither prayer text nor the source event registry changes.
 * A sequence may be condensed only when every constituent action retains
 * its exact published source identity, actor and approved form.
 */
export const RUBRIC_PRESENTATION_OWNER="PUBLISHED_1962_RUBRIC_SHORT_COPY_V1";
const frozen=Object.freeze;
const IDENTITY=Object.freeze({
 "AO.SM.C0111":frozen({ids:frozen(["AO.RUB.C0111.01","AO.RUB.C0111.02","AO.RUB.C0111.03"]),
  en:"The priest makes a sign of the Cross with the paten, places the Host on the corporal and sets the paten aside.",
  fr:"Le prêtre trace un signe de croix avec la patène, dépose l’Hostie sur le corporal et met la patène de côté."}),
 "AO.SM.C0117":frozen({ids:frozen(["AO.RUB.C0117.01","AO.RUB.C0117.02"]),
  en:"The priest raises his eyes and hands, then joins his hands.",
  fr:"Le prêtre élève les yeux et les mains, puis joint les mains."}),
 "AO.SM.C0174":frozen({ids:frozen(["AO.RUB.C0174.01","AO.RUB.C0174.02","AO.RUB.C0174.04","AO.RUB.C0174.05"]),
  en:"The priest genuflects, elevates the Sacred Host, replaces It upon the corporal and genuflects again.",
  fr:"Le prêtre fait la génuflexion, élève la sainte Hostie, la repose sur le corporal et fait de nouveau la génuflexion."}),
 "AO.SM.C0262":frozen({ids:frozen(["AO.RUB.C0262.01","AO.RUB.C0262.02"]),
  en:"The priest kisses the altar and rises facing it.",
  fr:"Le prêtre baise l’autel et se redresse face à lui."}),
 "AO.SM.C0263":frozen({ids:frozen(["AO.RUB.C0263.01","AO.RUB.C0263.02","AO.RUB.C0263.03"]),
  en:"The priest raises his eyes and hands, joins his hands and bows his head towards the Cross.",
  fr:"Le prêtre élève les yeux et les mains, joint les mains et incline la tête vers la Croix."}),
});
const MISSA_COMPACT=Object.freeze({
 "AO.SM.C0232":frozen({ids:frozen(["AO.RUB.C0232.01","AO.RUB.C0232.02"]),
   en:"The priest traces a sign of the Cross with the Sacred Host, then receives It.",
   fr:"Le prêtre trace un signe de croix avec la sainte Hostie, puis la reçoit."}),
 "AO.SM.C0234":frozen({ids:frozen(["AO.RUB.C0234.01","AO.RUB.C0234.02"]),
   en:"The priest traces a sign of the Cross with the chalice, then receives the Precious Blood.",
   fr:"Le prêtre trace un signe de croix avec le calice, puis communie au Précieux Sang."})
});
const ICON_ALREADY_SAYS_ACTION=frozen(new Set([
  "AO.RUB.C0174.02","AO.RUB.C0181.02",
  "AO.RUB.C0232.02","AO.RUB.C0234.02",
]));
const CUE=/^AO\.SM\.C\d{4}$/;
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const locale=language=>String(language).toLowerCase().startsWith("fr")?"fr":"en";
function approved(events,cue,ids){
  if(!CUE.test(String(cue??""))||!Array.isArray(events)||!events.length)return false;
  const actions=events.filter(e=>e?.kind!=="STATE");
  return actions.length===ids.length&&actions.every((e,i)=>
    e?.id===ids[i]&&e?.sourceCueId===cue&&e?.sourceId==="MR62_RITUS"&&
    e?.owner==="PUBLISHED_R17_MISSAL_INLINE"&&
    e?.review==="EXISTING_PUBLISHED_R17_1962_RUBRIC"&&
    e?.actor==="PRIEST"&&e?.observedNow===false&&
    typeof e.displayText==="string"&&e.displayText.length>0);
}
function result(cue,rule,language){
 return frozen({owner:RUBRIC_PRESENTATION_OWNER,sourceCueId:cue,
  eventIds:rule.ids,text:rule[locale(language)],observedNow:false});
}
/**
 * Some source-only RUBRIC rows contain an action *list*, not printed liturgical
 * Latin. Reformulate only five fully witnessed sequences as short Missal prose.
 * No additional gesture or meaning is inferred.
 */
export function conciseMissalSourceRubric(paragraph,{form,language="en"}={}){
  if(!FORMS.has(String(form??"").toUpperCase())||paragraph?.kind!=="RUBRIC"||
     !Array.isArray(paragraph.sourceCueIds)||paragraph.sourceCueIds.length!==1)
     return null;
  const cue=paragraph.sourceCueIds[0],rule=IDENTITY[cue];
  if(!rule||!approved(paragraph.publishedMissalRubrics,cue,rule.ids))return null;
  return result(cue,rule,language);
}
/** Two sequential certified Communion gestures may share ONE Missal sentence,
 * but never drop either event, change speaker, or cross a source cue. */
export function conciseMissalInlineSequence(events,{form,language="en"}={}){
  if(!FORMS.has(String(form??"").toUpperCase())||!Array.isArray(events)||!events.length)return null;
  const cue=events[0].sourceCueId,rule=MISSA_COMPACT[cue];
  if(!rule||!approved(events,cue,rule.ids))return null;
  return result(cue,rule,language);
}
/**
 * Only silence a LIVE line when the *same* currently active source event
 * is already represented by an actually resolved priest-action icon.
 * Unpictured precise gestures, other card paragraphs, source-only rubric
 * rows, or ambiguous semantics remain textual. This is NOT a clock.
 */
export function liveActionCoveredByIcon(event,{cueId,priestAction,iconKey,iconResolved=false}={}){
  return Boolean(ICON_ALREADY_SAYS_ACTION.has(event?.id)&&
    event?.sourceCueId===cueId&&event?.sourceCueId===priestAction?.cueId&&
    event?.shortAction===priestAction?.label&&
    event?.owner==="PUBLISHED_R17_MISSAL_INLINE"&&
    event?.review==="EXISTING_PUBLISHED_R17_1962_RUBRIC"&&
    event?.sourceId==="MR62_RITUS"&&event?.observedNow===false&&
    typeof iconKey==="string"&&iconKey.length>0&&iconResolved===true);
}
