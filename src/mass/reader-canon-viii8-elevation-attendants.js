// 1962 Ritus servandus VIII.8: acolyte torches and subdeacon posture.
// Research-only context resolution. Never synthesizes live priest/minister events.
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const ACTIONS=new Set(["LIGHT_MINIMUM_TWO_TORCHES","GENUFLECT_IN_HIS_PLACE","EXTINGUISH_TORCHES"]);
const EXPECTED=["AO.CANON.VIII8.001","AO.CANON.VIII8.002","AO.CANON.VIII8.003",
 "AO.CANON.VIII8.004","AO.CANON.VIII8.005","AO.CANON.VIII8.006"];
const PENDING=Object.freeze({status:"EDITORIAL_PREVIEW_DISABLED",publishable:false,
 observedNow:false,scheduledActions:Object.freeze([])});
function freeze(a){return Object.freeze(a)}
function checkedRows({source,legacyMinisters}={}){
 if(source?.schema!=="ao-mass-canon-viii8-elevation-attendants-v1"||
    source.status!=="1962_RITUS_VIII8_ADDITIONAL_MINISTER_EVENTS_EDITORIAL_ONLY"||
    source.rows?.length!==6||source.counts?.addedSourceEvents!==6||
    source.counts?.acolyteEvents!==5||source.counts?.subdeaconEvents!==1||
    source.counts?.conditionalExtinguishBranches!==4||
    source.counts?.livePublished!==0||
    source.sourceApproval!=="PENDING_INDEPENDENT_EDITORIAL_SIGNOFF"||
    source.publication!=="FORBIDDEN"||
    legacyMinisters?.schema!=="ao-canon-minister-form-branches-v1"||
    legacyMinisters.branches?.length!==11)
   throw Error("VIII.8 acolyte/subdeacon source data or existing minister ledger invalid");
 const ids=legacyMinisters.branches.map(x=>x.id).sort();
 if(JSON.stringify(ids)!==JSON.stringify([...source.reusedExistingMinisterIDs].sort()))
  throw Error("Do not duplicate or override 11 existing minister branches");
 const acts=[],seen=new Set();
 for(let i=0;i<6;i++){
  const x=source.rows[i];
  if(x?.id!==EXPECTED[i]||seen.has(x.id)||x.form!=="SOLEMN"||
    !["ACOLYTES","SUBDEACON"].includes(x.actor)||!ACTIONS.has(x.action)||
    x.actor===(x.action==="GENUFLECT_IN_HIS_PLACE"?"ACOLYTES":"SUBDEACON")||
    x.sourceSection!=="VIII.8"||
    typeof x.sourcePhrase!=="string"||x.sourcePhrase.length<16||
    !Array.isArray(x.sourceUrls)||x.sourceUrls.length<2||
    !x.sourceUrls.every(u=>u.startsWith("https://"))||
    x.release!=="EDITORIAL_ONLY"||
    x.observedNow!==false||x.publishable!==false||x.faithfulPosture!==null)
   throw Error("VIII.8 source action/actor/release drift at "+x?.id);
  seen.add(x.id);acts.push(freeze({...x,sourceUrls:freeze([...x.sourceUrls])}));
 }
 if(acts[0].action!=="LIGHT_MINIMUM_TWO_TORCHES"||
    acts[1].actor!=="SUBDEACON"||acts[1].action!=="GENUFLECT_IN_HIS_PLACE"||
    acts.slice(2).some(x=>x.action!=="EXTINGUISH_TORCHES")||
    JSON.stringify(acts.slice(2).map(x=>x.condition))!==JSON.stringify([
     "NO_COMMUNICANTS_AND_NOT_FAST_DAY_AND_NOT_REQUIEM",
     "COMMUNICANTS_PRESENT","FAST_DAY","MASS_FOR_DEAD"
    ]))
   throw Error("VIII.8 ceremonial stage or exception ownership drift");
 return freeze(acts);
}
export function validateCanonVIII8Attendants(input){
 return freeze({status:"VIII8_EVENTS_SOURCE_LINKED_UNPUBLISHED",
  actions:checkedRows(input),publishable:false,liveEvents:0});
}
export function createCanonVIII8AttendantReview(input){
 const audit=validateCanonVIII8Attendants(input);
 function preview({editorialPreview=false,form="LOW",communicantsPresent=null,
   fastDay1962=null,massForDead=null}={}){
  if(editorialPreview!==true||!FORMS.has(String(form).toUpperCase()))
   return PENDING;
  if(String(form).toUpperCase()!=="SOLEMN")
   return freeze({status:"NO_VIII8_TORCH_OR_SUBDEACON_RULE_FOR_THIS_FORM",
    publishable:false,observedNow:false,scheduledActions:freeze([])});
  const flags=[communicantsPresent,fastDay1962,massForDead];
  if(flags.some(x=>typeof x!=="boolean"))
   return freeze({status:"VIII8_EXCEPTION_CONTEXT_NOT_VERIFIED",
    publishable:false,observedNow:false,scheduledActions:freeze([])});
  const keepThroughCommunion=flags.some(Boolean);
  const extinguish=audit.actions[keepThroughCommunion?(
     communicantsPresent?3:fastDay1962?4:5):2];
  const events=[audit.actions[0],audit.actions[1],extinguish].map(x=>
   freeze({id:x.id,actor:x.actor,action:x.action,relativeAnchor:x.anchor,
    sourceSection:x.sourceSection,observedNow:false,publishable:false}));
  return freeze({status:"VIII8_PLANNED_SOURCE_ORDER_EDITORIAL_ONLY",
   form:"SOLEMN",torchMinimumCount:2,
   extinguishAfter:keepThroughCommunion?"COMMUNION":"CHALICE_ELEVATION",
   reviewExceptionReasons:freeze([
    ...(communicantsPresent?["COMMUNICANTS_PRESENT"]:[]),
    ...(fastDay1962?["FAST_DAY_1962"]:[]),
    ...(massForDead?["MASS_FOR_DEAD"]:[])]),
   hasIndependentSubdeaconGenuflection:true,
   publishable:false,observedNow:false,scheduledActions:freeze(events)});
 }
 return freeze({audit,preview});
}
