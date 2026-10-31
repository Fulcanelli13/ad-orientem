/*
 * Runtime-to-editorial Prayer artwork identity (research-only).
 * This module DOES NOT choose an image, fetch art or publish photography.
 * A slot is a candidate pool, not a certified pixel asset or approval for
 * every specific devotional stage. Explicit user scopes remain decisive.
 */
import {resolveChapletArtworkStage} from "./chaplet-artwork-stage-contract.v1.js";

export const PRAYER_ART_RUNTIME_IDENTITY_VERSION="2026-10-30-v2";

const ROSARY={
 joyful:["02","03","04","05","06"],
 sorrowful:["07","08","09","10","11"],
 glorious:["12","13","14","15","16"]
};
const LUMINOUS=[
 "SEM-rosary.baptism_of_christ",
 "SEM-rosary.wedding_at_cana",
 "SEM-rosary.proclamation_of_kingdom",
 "SEM-rosary.transfiguration",
 "SEM-rosary.institution_of_eucharist"
];
const BENE=[
 ["exposition","STG-pray.benediction-01","EXACT_STAGE_FAMILY"],
 ["adoration","STG-pray.adoration-02","CONTEXTUAL_UNVERIFIED"],
 ["hymn","STG-pray.benediction-02","EXACT_STAGE_FAMILY"],
 ["prayer","COV-pray.benediction","RITE_PRAYER_COVER_CONTEXTUAL"],
 ["blessing","STG-pray.benediction-03","EXACT_BLESSING_ART_MISSING"],
 ["praises","STG-pray.benediction-04","EXACT_STAGE_FAMILY"],
 ["reposition","STG-pray.benediction-04","CONTEXTUAL_UNVERIFIED"]
];
const SLUG={
 firstFriday:"programme.first_friday",
 firstSaturday:"programme.first_saturday"
};
const index=(value,max)=>value===null||value===undefined||value===""?null:Number.isInteger(Number(value))&&Number(value)>=0&&Number(value)<max?Number(value):null;
const pad=n=>String(n).padStart(2,"0");
const result=(key,slot,fit,extra={})=>Object.freeze({
 key,slot:slot||null,fit,publicationReady:false,assetUrl:null,
 ...extra
});
// The 1962 and current Loreto texts are distinct editions of the same Marian invocation;
// their approved Marian paintings are reusable, but the text remains separate.
const devotional=(id)=>id==="litany_loreto_current"?"COV-litany_loreto_1962":id==="pray.nightly_examen"?"COV-daily.nightly_examen":"COV-"+id;

export function resolveArtworkRuntimeIdentity(input={}){
 const owner=String(input.owner||"presentation");
 if(owner==="chaplet")return resolveChapletArtworkStage({id:input.id,stage:input.stage,bead:input.bead});
 if(owner==="angelusUnit"){
  // The blueprint has additional time-of-day and feast slots; those are not
  // individual prayer units. Resolve only the actual theological utterance,
  // using canonical Latin, and let the three Hail Marys inherit their verses.
  const form=input.form==="regina"?"regina":"angelus";
  const cover=form==="regina"?"COV-pray.angelus_regina":"COV-pray.angelus";
  const kind=String(input.type||"");
  const first=String(input.latinText||"").replace(/\r/g,"").split("\n")[0].trim();
  const key="angelus:"+form+":unit-"+(index(input.unitIndex,30)??"unknown");
  const exact=form==="angelus"
    ?(/Angelus Domini nuntiavit/i.test(first)?"STG-pray.angelus-05"
      :/Ecce ancilla Domini/i.test(first)?"STG-pray.angelus-06"
      :/Et Verbum caro factum est/i.test(first)?"STG-pray.angelus-07"
      :/Ora pro nobis, sancta Dei Genetrix/i.test(first)?"STG-pray.angelus-08":null)
    :(/Regina c(?:æ|ae)li,? lætare/i.test(first)?"STG-pray.angelus_regina-01"
      :/Resurrexit|Gaude et lætare/i.test(first)?"STG-pray.angelus_regina-02":null);
  if(kind==="collect")return result(key,form==="regina"?"STG-pray.angelus_regina-04":"STG-pray.angelus-09","CANONICAL_COLLECT_STAGE");
  if(kind==="vr")return result(key,exact||cover,exact?"EXACT_LATIN_INVOCATION_STAGE":"UNMATCHED_VERSE_COVER_CONTEXTUAL");
  if(kind==="hail"&&form==="angelus"){
    const prior=String(input.previousSlot||"");
    const approvedInheritance=["STG-pray.angelus-05","STG-pray.angelus-06","STG-pray.angelus-07"].includes(prior);
    return result(key,approvedInheritance?prior:cover,approvedInheritance?"HAIL_MARY_INHERITS_PRECEDING_INVOCATION":"HAIL_MARY_CONTEXT_NOT_RESOLVED");
  }
  return result(key,cover,"FORM_COVER_CONTEXTUAL_NO_EXACT_UNIT");
 }
 if(owner==="novena"){
  const id=String(input.id||""),screen=String(input.screen||"overview"),day=index(Number(input.day)-1,9),stage=index(input.stage,6);
  if(!id||screen==="overview")return result("novena:overview",null,"NOT_AN_IMAGE_BEARING_PRAYER_CARD");
  const key="novena:"+id+":"+screen+(day===null?"":":day-"+pad(day+1))+(screen==="day"?":"+String(input.mode||"guided")+":stage-"+(stage===null?"unknown":pad(stage+1)):"");
  const cover=devotional("novena."+id);
  // Reuse an approved day-scene pool in the three genuinely illustrated novenas.
  // St Thérèse remains on hold: her day pool is contextual, not a cleared saint portrait.
  const dayPool=screen==="day"&&["holy_ghost","christmas","holy_souls"].includes(id)?"STG-novena."+id+"-01":null;
  return result(key,dayPool||cover,id==="st_therese"?"SAINT_THERESE_UNAPPROVED_IMAGE_SOURCE":"NOVENA_COVER_CONTEXTUAL_NOT_DAY_SCENE",{day:day===null?null:day+1,stage:screen==="day"?stage:null});
 }
 if(owner==="traditional"){
  const route=String(input.route||"pray.morning_evening");
  if(input.screen==="prayer"&&input.prayerId)return result("traditional:prayer:"+input.prayerId,devotional(input.prayerId),"CANONICAL_SHARED_PRAYER");
  if(route==="pray.morning_evening"){
   const part=input.daypart==="evening"?"evening":"morning";
   const step=index(input.dailyStep,14);
   const prayerId=String(input.stepPrayerId||"");
   return result("traditional:daily:"+part+":"+(step===null?"list":"step-"+pad(step+1)),prayerId?devotional(prayerId):"COV-daily."+part,
    prayerId?"CANONICAL_SHARED_PRAYER":"DAILY_COVER_CONTEXTUAL");
  }
  if(route==="pray.nightly_examen"){
   const step=index(input.examenStep,5)??0;
   return result("traditional:examen:"+pad(step+1),step===4?"COV-sacrament_act_of_contrition":"COV-daily.nightly_examen",step===4?"SHARED_ACT_OF_CONTRITION":"CONTEXTUAL_EXAMEN_COVER");
  }
  if(route==="pray.holy_name_litany")return result("traditional:holy-name-litany","COV-devotion_consecration_christ_king","APPROVED_CHRIST_PORTRAIT_CONTEXTUAL_REUSE_NOT_EXACT_HOLY_NAME_DEPICTION",{sourceSubject:"Salvator Mundi",approvedPool:"COV-devotion_consecration_christ_king",visualPublicationBlocked:true});
  const map={
   "pray.sacred_hymns":"COV-prayer.hymns",
   "pray.meal_prayers":"COV-foundations_grace_before_meals",
   "pray.sacred_heart":"COV-prayer.sacred_heart",
   "pray.communion_treasury":"COV-prayer.communion",
   "pray.good_death":"COV-prayer.good_death",
   "pray.dying_companion":"COV-prayer.good_death"
  };
  return result("traditional:"+route,map[route]||null,map[route]?"CONTEXTUAL_ROUTE_COVER":"NO_BLUEPRINT_ARTWORK_SLOT");
 }
 const view=String(input.view||"home"),n=Number(input.step||0);
 if(["home","family","library"].includes(view))return result("presentation:"+view,null,"NOT_AN_IMAGE_BEARING_PRAYER_CARD");
 if(view==="prayerOnly"){
  const id=String(input.prayerId||"");
  return result("presentation:canonical:"+id,id?devotional(id):null,id?"CANONICAL_SHARED_PRAYER":"NO_PRAYER_ID");
 }
 if(view==="stations"){
  const i=index(n,14);return result("presentation:stations:"+(i===null?"unknown":pad(i+1)),i===null?null:"STG-pray.stations-"+pad(i+1),i===null?"INVALID_STEP":"EXACT_EVENT_STAGE");
 }
 if(view==="benediction"){
  const i=index(n,BENE.length),b=i===null?null:BENE[i];
  return result("presentation:benediction:"+(b?.[0]||"unknown"),b?.[1]||null,b?.[2]||"INVALID_STEP");
 }
 if(view==="penitential"){
  const i=index(n,7);return result("presentation:penitential:"+(i===null?"unknown":pad(i+1)),i===null?null:"STG-pray.penitential_psalms-"+pad(i+1),i===null?"INVALID_STEP":"EXACT_PSALM_STAGE");
 }
 if(view==="sevenWords"){
  // The source's closing prayers are an appendix, not an eighth Gospel word.
  if(input.section==="historicalConclusion")return result("presentation:seven-words:historical-conclusion","STG-pray.seven_words-08","SEPARATE_HISTORICAL_CONCLUSION_NOT_GOSPEL_SAYING");
  const i=index(n,7);return result("presentation:seven-words:"+(i===null?"unknown":pad(i+1)),i===null?null:"STG-pray.seven_words-"+pad(i+1),i===null?"INVALID_STEP":"EXACT_WORD_STAGE");
 }
 if(view==="confession"){
  const i=index(n,4);return result("presentation:confession:"+(i===null?"unknown":pad(i+1))+(input.path?":path-"+input.path:""),i===null?null:"STG-pray.confession-"+pad(i+1),i===null?"INVALID_STEP":"BROAD_CONFESSION_STAGE_NOT_EVERY_SUBCARD");
 }
 if(view==="adoration"){
  const mode=String(input.mode||"home");
  if(mode==="visit")return result("presentation:adoration:visit:"+pad((index(n,7)??0)+1),"STG-pray.adoration-01","VISIT_STAGE_CONTEXTUAL_NOT_EXACT");
  if(mode==="holy")return result("presentation:adoration:holy:"+pad((index(n,8)??0)+1),n===0?"STG-pray.rosary-07":"COV-pray.adoration",n===0?"GETHSEMANE_EXACT_EVENT_SHARED_WITH_ROSARY":"HOLY_HOUR_COVER_CONTEXTUAL");
  if(mode==="four"){
   const i=index(n,5),slot=i!==null&&i<4?"STG-pray.adoration.four_ends-"+pad(i+1):"COV-pray.adoration.four_ends";
   return result("presentation:adoration:four:"+pad((i??0)+1),slot,"FOUR_ENDS_CONTEXTUAL_UNVERIFIED");
  }
  return result("presentation:adoration:"+mode,"COV-pray.adoration","CONTEXTUAL_ADORATION_COVER");
 }
 if(view==="firstFriday"||view==="firstSaturday"){
  const route=SLUG[view],size=view==="firstFriday"?5:6,i=index(n,size);
  return result("presentation:"+view+":"+(i===null?"unknown":pad(i+1)),i===null?null:"STG-"+route+"-01",i===null?"INVALID_STEP":"PROGRAMME_SHARED_POOL_NOT_EACH_STAGE");
 }
 if(view==="fsMeditation"||view==="rosary"){
  const set=String(input.set||"joyful").toLowerCase(),mi=index(input.mystery,5);
  const array=ROSARY[set];
  if(mi===null)return result("presentation:"+view+":intro","COV-pray.rosary","ROSARY_COVER_CONTEXTUAL");
  if(array)return result("presentation:"+view+":"+set+":"+pad(mi+1),"STG-pray.rosary-"+array[mi],"MYSTERY_EVENT_INHERITED_ACROSS_BEADS");
  if(set==="luminous")return result("presentation:"+view+":luminous:"+pad(mi+1),LUMINOUS[mi],"OPTIONAL_SEMANTIC_ONLY_RUNTIME_CARD_JOIN_UNVERIFIED");
  return result("presentation:"+view+":unknown",null,"UNKNOWN_MYSTERY_SET");
 }
 if(view==="angelus")return result("presentation:angelus:"+(input.form==="regina"?"regina":"ordinary"),input.form==="regina"?"COV-pray.angelus_regina":"COV-pray.angelus","DYNAMIC_PARAGRAPH_STAGE_NOT_JOINED");
 if(view==="litany")return result("presentation:litany:page-"+pad((index(n,200)??0)+1),"COV-pray.litany_saints","DYNAMIC_WITNESS_PAGINATION_NOT_SCENE_JOINED");
 if(view==="fortyHours")return result("presentation:forty-hours:"+pad((index(n,6)??0)+1),n===4?"COV-pray.benediction":"COV-pray.forty_hours",n===4?"BENEDICTION_SHARED_RITE_COVER":"CONTEXTUAL_COVER_NOT_STAGE_SPECIFIC");
 return result("presentation:"+view,null,"NO_RUNTIME_ARTWORK_MAPPING");
}

export function stampArtworkRuntimeIdentity(element,input){
 const identity=resolveArtworkRuntimeIdentity(input);
 if(element?.dataset){
  element.dataset.aoArtworkRuntimeKey=identity.key;
  element.dataset.aoArtworkEditorialSlot=identity.slot||"";
  element.dataset.aoArtworkFit=identity.fit;
  element.dataset.aoArtworkPublished="false";
 }
 return identity;
}
