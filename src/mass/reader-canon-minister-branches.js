// Conditional ministers are sourced from the 1962 Ritus servandus VIII.8
// and IX.4. They are deliberately kept out of the priest's independent
// cue/action clock and the 62-event baseline. This module returns editorial
// candidates only, NEVER a live minister action from reader scroll.
const ID=/^AO\.CANON\.MIN\.\d{3}$/;
const CUE=/^AO\.SM\.C\d{4}$/;
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const SCOPE=new Set(["SOLEMN","MISSA_CANTATA_INCENSE"]);
const CONDITIONAL=new Set(["SOURCE_PRESCRIBED","INCENSE_BRANCH","WHEN_REQUIRED"]);
const BASE_STATUS="PRIMARY_LATIN_CHECKED_CONDITIONAL_EDITORIAL_ONLY";

export function validateCanonMinisterFormBranches(data){
  if(data?.schema!=="ao-canon-minister-form-branches-v1" ||
     data.status!==BASE_STATUS ||
     data.respondentAtC0207?.cueId!=="AO.SM.C0207" ||
     data.respondentAtC0207?.low?.sourceClock!=="MINISTER_RESPONSE" ||
     data.respondentAtC0207?.sung?.sourceClock!=="USER_RESPONSE" ||
     data.respondentAtC0207?.publication!=="RESEARCH_REVIEW_NOT_LIVE" ||
     !Array.isArray(data.branches)||data.branches.length!==10)
    throw new Error("1962 Canon minister form-branch source registry is incomplete");
  const ids=new Set();
  for(const event of data.branches){
    if(!ID.test(String(event?.id??""))||ids.has(event.id)||
       !CUE.test(String(event.cueId??"")) ||
       !["DEACON","THURIFER"].includes(event.actor) ||
       !Array.isArray(event.forms)||event.forms.length===0 ||
       event.forms.some(x=>!SCOPE.has(x)) ||
       (event.actor==="DEACON"&&event.forms.some(x=>x!=="SOLEMN")) ||
       (event.actor==="THURIFER"&&!event.forms.includes("MISSA_CANTATA_INCENSE")) ||
       !CONDITIONAL.has(event.condition) ||
       event.observationalClock!=="INDEPENDENT_MINISTER_EVENT_ONLY" ||
       event.publication!=="RESEARCH_REVIEW_NOT_LIVE" ||
       !/^VIII\.8$|^IX\.4$/.test(String(event.sourceSection??""))||
       !Array.isArray(event.sourceUrls)||
       event.sourceUrls.some(url=>!String(url).startsWith("https://")) ||
       !event.sourceUrls.length ||!event.action)
      throw new Error("Uncertified minister/actor/conditional source: "+event?.id);
    ids.add(event.id);
  }
  const exact=Object.freeze([
    ["001","AO.SM.C0163","DEACON"],
    ["002","AO.SM.C0174","DEACON"],
    ["003","AO.SM.C0181","DEACON"],
    ["004","AO.SM.C0174","THURIFER"],
    ["005","AO.SM.C0181","THURIFER"],
    ["006","AO.SM.C0199","DEACON"],
    ["007","AO.SM.C0201","DEACON"],
    ["008","AO.SM.C0205","DEACON"],
    ["009","AO.SM.C0175","DEACON"],
    ["010","AO.SM.C0181","DEACON"],
  ]);
  for(const [n,cue,actor] of exact){
    const row=data.branches.find(x=>x.id==="AO.CANON.MIN."+n);
    if(row?.cueId!==cue||row?.actor!==actor)
      throw new Error(n+": conditional minister cue/actor identity diverged");
  }
  return Object.freeze({ministerCandidateCount:ids.size,
    deaconCount:data.branches.filter(x=>x.actor==="DEACON").length,
    thuriferCount:data.branches.filter(x=>x.actor==="THURIFER").length,
    publishable:0});
}

export function createCanonMinisterFormReviewController({data=null}={}){
  if(!data)return Object.freeze({
    supported:false,status:"MINISTER_SOURCE_NOT_LOADED",
    project:()=>Object.freeze({previewEnabled:false,ministerActions:Object.freeze([]),
      respondentRole:null,canPublish:false}),
  });
  const audit=validateCanonMinisterFormBranches(data);
  function project(cueId,{form="LOW",editorialPreview=false,
    observedMinisterActionIds=[],conditionMatches=[]}={}){
    const selected=String(form).toUpperCase(),id=String(cueId??"");
    const enabled=editorialPreview===true&&FORMS.has(selected);
    const observed=new Set(observedMinisterActionIds);
    const conditions=new Set(conditionMatches);
    const actions=enabled?data.branches.filter(event=>
      event.cueId===id&&event.forms.includes(selected)):[];
    const ministerActions=Object.freeze(actions.map(event=>Object.freeze({
      id:event.id,cueId:event.cueId,actor:event.actor,
      actionKey:event.id,action:event.action,
      sourceSection:event.sourceSection,
      sourceUrls:Object.freeze([...event.sourceUrls]),
      condition:event.condition,
      conditionVerified:event.condition!=="WHEN_REQUIRED" ||
        conditions.has(event.id),
      isObservedNow:observed.has(event.id),
      observedBy:"INDEPENDENT_MINISTER_EVENT_ONLY",
      publishable:false,
    })));
    let respondentRole=null;
    if(enabled&&id==="AO.SM.C0207"){
      const row=selected==="LOW"
        ?data.respondentAtC0207.low:data.respondentAtC0207.sung;
      respondentRole=Object.freeze({...row,personalRoleResolved:false,
        source:"CANONICAL_LOW_SUNG_RESPONSE_CLOCK",publishable:false});
    }
    return Object.freeze({
      previewEnabled:enabled,canPublish:false,cueId:id,
      ministerActions,respondentRole,
      status:enabled?"EDITORIAL_FORM_REVIEW_NOT_LIVE":"PREVIEW_DISABLED_OR_FORM_UNSUPPORTED",
    });
  }
  return Object.freeze({supported:true,audit,project});
}
