import {validateMandatumSource} from "./reader-holy-thursday-mandatum-events.js";
// 1962 Holy Thursday Mandatum: optional in-Mass presentation overlay.
// Not the post-Mass translation to the altar of repose.
export const MANDATUM_1962=Object.freeze({
 schema:"AO_1962_MANDATUM_B08",optional:true,
 witnesses:["https://www.laudemus.org/?date=2026-04-02&place_id=2","https://phonemissal.com/2021/03/26/holy-thursday-1962-propers/"],
 status:"SOURCE_LINKED_SELECTED_CHANTS_NOT_FULL_PRINTED_COLLATION",
 texts:[
  {id:"01",lat:"Mandátum novum do vobis: ut diligátis ínvicem, sicut diléxi vos, dicit Dóminus.",en:"A new commandment I give you: love one another as I have loved you, says the Lord.",fr:"Je vous donne un commandement nouveau : aimez-vous les uns les autres comme je vous ai aimés, dit le Seigneur."},
  {id:"02",lat:"Postquam surréxit Dóminus a cena, misit aquam in pelvim et cœpit laváre pedes discipulórum: hoc exémplum relíquit eis.",en:"After supper the Lord poured water into a basin and began to wash His disciples' feet, leaving them this example.",fr:"Après la Cène, le Seigneur versa de l'eau dans un bassin et commença à laver les pieds de ses disciples, leur laissant cet exemple."},
  {id:"03",lat:"In hoc cognóscent omnes quia discípuli mei estis, si dilectiónem habuéritis ad ínvicem.",en:"By this all shall know that you are My disciples, if you have love for one another.",fr:"Tous reconnaîtront que vous êtes mes disciples si vous vous aimez les uns les autres."},
  {id:"04",lat:"Ubi cáritas et amor, Deus ibi est. Congregávit nos in unum Christi amor. Exsultémus, et in ipso iucundémur. Timeámus, et amémus Deum vivum. Et ex corde diligámus nos sincéro.",en:"Where charity and love are, God is there. Christ's love has gathered us together; let us rejoice in Him, fear and love the living God, and sincerely love one another.",fr:"Où sont la charité et l'amour, Dieu est présent. L'amour du Christ nous a réunis ; réjouissons-nous en lui, craignons et aimons le Dieu vivant, et aimons-nous sincèrement."},
  {id:"05",lat:"Orémus. Adésto, Dómine, quǽsumus, offício servitútis nostræ: et, quia tu discípulis tuis pedes laváre dignátus es, ne despícias ópera mánuum tuárum, quæ nobis retinénda mandásti; ut, sicut hic nobis et a nobis exterióra abluúntur inquinaménta, sic a te ómnium nostrum interióra lavéntur peccáta. Quod ipse præstáre dignéris, qui vivis et regnas in sǽcula sæculórum. Amen.",en:"Let us pray. Be present, Lord, at this service. As Thou didst wash Thy disciples' feet, do not despise the work Thou hast commanded; as outward stains are washed away, cleanse our inward sins. Who livest and reignest forever. Amen.",fr:"Prions. Seigneur, assistez-nous en ce service. Puisque vous avez lavé les pieds de vos disciples, ne dédaignez pas ce geste que vous avez commandé ; tandis que sont effacées les souillures extérieures, purifiez nos péchés intérieurs. Vous qui vivez et régnez pour les siècles des siècles. Ainsi soit-il."}
 ],
 omittedUntilCollation:["full 1962 antiphon and psalm verse repetitions","remaining appointed antiphons","Pater and versicle/response series"],
});


const freeze=Object.freeze;
const HT_ROOT="Tempora/Quad6-4r";
export function projectHolyThursdayMass(model,resolvedMass,{mandatumPresent=false,language="en",mandatumSource=null}={}){
 const path=resolvedMass?.proper?.data?.sourcePath??resolvedMass?.proper?.sourcePath;
 if(path!==HT_ROOT){
   if(mandatumPresent)throw new Error("Mandatum cannot be inserted in a non-Holy-Thursday Proper");
   return model;
 }
 if(!Array.isArray(model?.cards))throw new TypeError("Holy Thursday requires a ready Mass reader model");
 const all=[...model.cards].filter(card=>card.sectionId!=="AO.CARD.009"&&card.sourceSectionId!=="AO.CARD.009");
 if(mandatumPresent){
   validateMandatumSource(mandatumSource);
   const at=all.findIndex(c=>c.sectionId==="AO.CARD.008"||c.sourceSectionId==="AO.CARD.008");
   if(at<0)throw new Error("Holy Thursday Mandatum requires the Homily card");
   const useFrench=String(language).toLowerCase().startsWith("fr");
   const paragraphs=MANDATUM_1962.texts.map(t=>freeze({
     id:"AO.HT.MANDATUM."+t.id,kind:"TEXT",primary:useFrench?t.fr:t.en,
     secondary:null,alternate:t.lat,replaceOnToggle:true,sourceCueIds:freeze([]),
     active:false,role:t.id==="05"?"CELEBRANT":"SCHOLA",
     evidenceStatus:MANDATUM_1962.status
   }));
   const inserted=freeze({
     schema:"ao-holy-thursday-mandatum-card-v1",sectionId:"AO.HT.MANDATUM",
     title:"Mandatum · Washing of Feet",part:"Mass of the Catechumens",
     sourceSequence:null,sourceSectionId:null,blocks:freeze([]),
     paragraphs:freeze(paragraphs),stateOnly:false,optional:true,
     sourceRecordIds:freeze(mandatumSource.events.map(e=>e.id)),
     mandatumSourceEvents:freeze(mandatumSource.events.map(e=>freeze({...e}))),
     actorScope:"SELECTED_MEN_AND_MINISTERS",faithfulPosture:"LOCAL_OR_INHERIT",
     provenance:freeze({source:"MISSAL_1962_SECONDARY",textComplete:false,
       placement:"AFTER_HOMILY_BEFORE_OFFERTORY",canonicalEventMutation:false}),
   });
   all.splice(at+1,0,inserted);
 }
 const cards=freeze(all.map((card,i)=>freeze({
   ...card,sequence:i+1,
   sourceSequence:card.sectionId==="AO.HT.MANDATUM"?null:(card.sourceSequence??card.sequence),
 })));
 const byId=new Map(cards.map(x=>[x.sectionId,x]));
 function cardBySequence(n){const x=Number(n);return Number.isInteger(x)&&x>0&&x<=cards.length?cards[x-1]:null}
 function neighbor(id,direction){
   const here=byId.get(String(id));if(!here)return null;
   return cardBySequence(here.sequence+(direction==="previous"?-1:direction==="next"?1:0));
 }
 function cardForEvent(eventId){
   const id=String(eventId??"");
   if(mandatumPresent){
     const stepIndex=mandatumSource.events.findIndex(e=>e.id===id);
     if(stepIndex>=0){
       const card=byId.get("AO.HT.MANDATUM");
       return freeze({
         canonicalEventId:id,
         section:freeze({sectionId:card.sectionId,name:card.title,eventIds:card.sourceRecordIds,canonicalAuthority:true}),
         card,
         mandatumEvent:mandatumSource.events[stepIndex],
         mandatumStageIndex:stepIndex,
         progress:freeze({index:card.sequence,total:cards.length,label:card.sequence+" / "+cards.length}),
       });
     }
   }
   if(id.startsWith("MC-CRD-"))return null;
   const hit=model.cardForEvent(eventId);if(!hit)return null;
   const card=byId.get(hit.card.sectionId)||cards.find(x=>x.sourceSectionId===hit.card.sectionId);
   if(!card)return null;
   return freeze({...hit,card,progress:freeze({
      index:card.sequence,total:cards.length,label:card.sequence+" / "+cards.length
   })});
 }
 return freeze({...model,cards,totalCards:cards.length,
   structureOwner:model.structureOwner+"+HOLY_THURSDAY_1962",
   holyThursday:true,mandatumPresent:!!mandatumPresent,credoOmitted:true,
   mandatumSource:mandatumPresent?mandatumSource:null,
   mandatumEventIds:freeze(mandatumPresent?mandatumSource.events.map(e=>e.id):[]),
   cardBySequence,cardForEvent,
   previousCard:id=>neighbor(id,"previous"),nextCard:id=>neighbor(id,"next")
 });
}
