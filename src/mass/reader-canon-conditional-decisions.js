// Canon source rules independently checked against Ritus servandus VIII.2,
// VIII.4, VIII.8, IX.3-4 and X.1. Editorial only: no reader adapter,
// user-facing French copy release, simulated priest observation or scrolling.
const CUES=Object.freeze([
 ["AO.SM.C0153","AO.CANON.R62.004","VIII.2","ROMAN_PONTIFF_AND_LOCAL_ORDINARY_FORMULA"],
 ["AO.SM.C0161","AO.CANON.R62.011","VIII.4","HANC_IGITUR_HANDS_AND_SEASONAL_PROPER"],
 ["AO.SM.C0201","AO.CANON.R62.055","IX.3-4","PER_IPSUM_CHALICE_UNCOVERING"],
 ["AO.SM.C0205","AO.CANON.R62.059","IX.3-4","PER_IPSUM_CHALICE_COVERING_AND_GENUFLECTION"],
 ["AO.SM.C0207","AO.CANON.R62.061","X.1_AND_CANON_AMEN","CANON_FINAL_AMEN_RESPONDER"],
]);
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const STATUS="SOURCE_RULES_RECONCILED_EDITORIAL_ONLY_NOT_PUBLISHED";

export function validateCanonConditionalDecisionReview({decisions,frenchReview,ministerData}={}){
 if(decisions?.schema!=="ao-canon-5-conditional-form-decisions-v1"||
    decisions.status!==STATUS||decisions.scope?.entries!==5||
    decisions.scope?.sourceRulesChecked!==5||
    decisions.scope?.userCopyApproved!==0||
    decisions.scope?.livePublished!==0||
    !Array.isArray(decisions.cases)||decisions.cases.length!==5||
    frenchReview?.rows?.length!==62||
    ministerData?.branches?.length!==11||
    ministerData.respondentAtC0207?.low?.sourceClock!=="MINISTER_RESPONSE"||
    ministerData.respondentAtC0207?.sung?.sourceClock!=="USER_RESPONSE")
   throw Error("Five Canon conditional cases require complete source-only evidence");
 const byFrench=new Map(frenchReview.rows.map(x=>[x.id,x]));
 const ids=new Set();
 for(const [i,tuple] of CUES.entries()){
   const [cue,action,section,subject]=tuple,row=decisions.cases[i],fr=byFrench.get(action);
   if(row?.cueId!==cue||row?.sourceActionId!==action||
      row?.sourceSection!==section||row?.subject!==subject||
      row?.id!=="AO.CANON.FORM."+String(i+1).padStart(3,"0")||
      ids.has(row.id)||fr?.cueId!==cue||
      fr?.formReview!=="FORM_OR_PASTORAL_REVIEW_PENDING"||
      fr?.reviewState!=="ORIGINAL_FRENCH_SOURCE_RECHECK_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY"||
      !String(fr.revisedFrenchRubric).trim()||
      !Array.isArray(row.sourceUrls)||row.sourceUrls.length<2||
      row.sourceUrls.some(x=>!x.startsWith("https://"))||
      !Array.isArray(row.inputs)||!row.inputs.length||
      !Array.isArray(row.branches)||!row.branches.length||
      !row.decision?.includes("COPY_APPROVAL_PENDING")&&
       row.decision!=="SOURCE_CLOCK_RESOLVED_PERSONAL_SPEAKER_UNSPECIFIED"||
      !row.releaseGate||!row.rule)
      throw Error("Five Canon conditional source identity/signoff drift: "+cue);
   ids.add(row.id);
 }
 const byId=new Map(ministerData.branches.map(x=>[x.id,x]));
 for(const [n,cue] of [["007","AO.SM.C0201"],["008","AO.SM.C0205"],["011","AO.SM.C0205"]]){
   const e=byId.get("AO.CANON.MIN."+n);
   if(e?.cueId!==cue||e.actor!=="DEACON"||e.forms.join(",")!=="SOLEMN"||
      (n==="011"&&e.condition!=="SOURCE_PRESCRIBED")||
      (n!=="011"&&e.condition!=="WHEN_REQUIRED"))
      throw Error("Deacon pall/genuflection conditional source drift");
 }
 return Object.freeze({reviewedSourceCases:5,copySignedOff:0,livePublishable:0,
   sourceActionIds:Object.freeze(CUES.map(x=>x[1]))});
}

export function createCanonConditionalDecisionController(data){
 const audit=validateCanonConditionalDecisionReview(data);
 const byCue=new Map(data.decisions.cases.map(x=>[x.cueId,x]));
 const byFrench=new Map(data.frenchReview.rows.map(x=>[x.id,x]));
 function project(cueId,{form="LOW",editorialPreview=false,context={}}={}){
   const id=String(cueId??""),selected=String(form??"").toUpperCase();
   const enabled=editorialPreview===true&&FORMS.has(selected);
   const row=enabled?byCue.get(id):null;
   if(!row)return Object.freeze({previewEnabled:false,canPublish:false,
     isObservedNow:false,decision:null});
   const solemn=selected==="SOLEMN";
   let result={sourceContextResolved:false,branch:"CONDITIONS_NOT_VERIFIED",
     actor:"NOT_ASSUMED",personalSpeakerResolved:false,canPublish:false,isObservedNow:false};
   if(id==="AO.SM.C0153"){
     const v=context;
     const hasContext=v.liturgicalJurisdictionVerified===true&&
       ["OCCUPIED","VACANT"].includes(v.apostolicSeeStatus)&&
       ["OCCUPIED","VACANT"].includes(v.localSeeStatus)&&
       ["ROME","OUTSIDE_ROME"].includes(v.location)&&
       ["PRESBYTER","BISHOP","POPE"].includes(v.celebrantRank);
     // Ritus VIII.2 explicitly specifies a deceased diocesan ordinary.
     // A generic vacancy flag alone is insufficient to certify that case.
     const ordinaryNeedsVacancyProof=v.celebrantRank==="PRESBYTER"&&
       v.location==="OUTSIDE_ROME"&&v.localSeeStatus==="VACANT";
     const localCauseVerified=!ordinaryNeedsVacancyProof||
       v.localVacancyReason==="ORDINARY_DECEASED";
     const impossiblePapalVacancy=v.celebrantRank==="POPE"&&
       v.apostolicSeeStatus==="VACANT";
     const resolved=hasContext&&localCauseVerified&&!impossiblePapalVacancy;
     const papalCommemoration=resolved?(
       v.celebrantRank==="POPE"?"REPLACED_BY_PAPAL_CELEBRANT_FORMULA":
       v.apostolicSeeStatus==="VACANT"?"OMITTED_APOSTOLIC_SEE_VACANT":
       "VERIFIED_PONTIFF_NAME_REQUIRED"):null;
     const ordinaryCommemoration=resolved?(
       v.celebrantRank==="POPE"?"REPLACED_BY_PAPAL_CELEBRANT_FORMULA":
       v.celebrantRank==="BISHOP"?"REPLACED_BY_EPISCOPAL_CELEBRANT_FORMULA":
       v.location==="ROME"?"OMITTED_ROMAN_CELEBRATION":
       v.localSeeStatus==="VACANT"?"OMITTED_ORDINARY_DECEASED":
       "VERIFIED_LOCAL_ORDINARY_NAME_REQUIRED"):null;
     const substitution=resolved?(
       v.celebrantRank==="POPE"?"PAPAL_SELF_FORMULA":
       v.celebrantRank==="BISHOP"?"EPISCOPAL_SELF_FORMULA":null):null;
     result={...result,sourceContextResolved:resolved,
       branch:!resolved?"CONDITIONS_NOT_VERIFIED":
        v.celebrantRank==="POPE"?"CELEBRANT_POPE":
        v.celebrantRank==="BISHOP"?"CELEBRANT_BISHOP_OR_PATRIARCH":
        v.apostolicSeeStatus==="VACANT"?"APOSTOLIC_SEE_VACANT":
        v.location==="ROME"?"ROMAN_LOCATION":
        v.localSeeStatus==="VACANT"?"LOCAL_SEE_VACANT":"ORDINARY_FORM",
       // The legacy branch is a summary, not a complete formula resolver:
       // vacant papal and diocesan sees may coexist independently.
       formulaComponents:Object.freeze({
         papalCommemoration,ordinaryCommemoration,
         celebrantSubstitution:substitution,
       }),
       localityReasonSourceVerified:resolved,
       actor:"PRIEST",formulaText:null};
   }else if(id==="AO.SM.C0161"){
     const variant=context.hancSourceVariant;
     const resolved=context.sourceSelectionVerified===true&&
       ["ORDINARY","VERIFIED_SPECIAL"].includes(variant);
     result={...result,sourceContextResolved:resolved,
       branch:resolved?(variant==="ORDINARY"?"NORMAL_HANC_IGITUR":
         "SOURCE_SELECTED_SPECIAL_HANC_IGITUR"):"CONDITIONS_NOT_VERIFIED",
       actor:"PRIEST",handPosition:"EXTENDED_OPEN_OVER_OBLATA_NOT_JOINED",
       sourceTextNeverInferredFromScroll:true};
   }else if(id==="AO.SM.C0201"||id==="AO.SM.C0205"){
     const event=id==="AO.SM.C0201"?"AO.CANON.MIN.007":"AO.CANON.MIN.008";
     const eligible=solemn&&context.chaliceHandlingNeeded===true&&
       context.deaconActionIndependentlyObserved===true;
     result={...result,sourceContextResolved:!solemn||eligible,
       branch:!solemn?"CELEBRANT_ACTION":eligible?
         "SOLEMN_DEACON_WHEN_REQUIRED":"SOLEMN_DEACON_NOT_ATTESTED",
       actor:!solemn?"PRIEST":eligible?"DEACON":"UNRESOLVED",
       conditionalMinisterActionId:event,
       deaconCoveringAssigned:eligible,
       independentDeaconGenuflection:id==="AO.SM.C0205"?
         "AO.CANON.MIN.011":null};
   }else if(id==="AO.SM.C0207"){
     const respondent=selected==="LOW"?data.ministerData.respondentAtC0207.low:
       data.ministerData.respondentAtC0207.sung;
     result={...result,sourceContextResolved:true,
       branch:selected==="LOW"?"LOW_MINISTER_RESPONSE":"SUNG_UNRESOLVED_RESPONDENTS",
       actor:respondent.speakerRole,sourceClock:respondent.sourceClock,
       personalSpeakerResolved:false};
   }
   return Object.freeze({previewEnabled:true,cueId:id,actionId:row.sourceActionId,
     sourceSection:row.sourceSection,sourceUrls:Object.freeze([...row.sourceUrls]),
     copyReview:"INDEPENDENT_EDITORIAL_SIGNOFF_REQUIRED",
     draftFrenchRubric:byFrench.get(row.sourceActionId).revisedFrenchRubric,
     ...result});
 }
 return Object.freeze({audit,project});
}
