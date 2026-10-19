/**
 * Opt-in editorial-only bridge for the 10 source-owned St Pius X draft scenes.
 * No duplicate doctrinal content: the host supplies the unmodified JSON from
 * the Formation content owner. No publication or authoritative reply state.
 */
const POSES=new Set(["neutral","welcoming","explaining","thoughtful","grave"]);
const URI=x=>{try{const u=new URL(x);return u.protocol==="https:"?u.href:null;}catch{return null;}};
const refuse=x=>{throw Error("St Pius X editorial dialogue bundle refused: "+x);};
export function createPiusXTenEditorialReview(bundle){
 if(bundle?.schema!=="AO_PIUS_X_CONTENT_OWNED_TEN_CONVERSATION_PILOT_V1"
  ||bundle?.status!=="SOURCE_FIRST_VOICE_EDIT_V2_PILOT_UNAPPROVED"
  ||bundle.totals?.topics!==10||bundle.totals?.avatarConversationTurns!==23
  ||bundle.totals?.outOfCharacterEditorialNotes!==7
  ||bundle.totals?.approvedAnswers!==0
  ||bundle.globalReleaseGates?.publication!==false
  ||bundle.globalReleaseGates?.humanTheologyApproval!==false
  ||bundle.globalReleaseGates?.voiceStyleApproval!==false
  ||!Array.isArray(bundle.episodes)||bundle.episodes.length!==10)
  refuse("unverified ownership, approval state or corpus count");
 const episodes=[],nodes=new Map(),seen=new Set();
 let character=0,notes=0;
 for(let i=0;i<10;i++){
  const ep=bundle.episodes[i];
  const episodeId="SPX-PILOT-"+String(i+1).padStart(2,"0");
  if(ep?.id!==episodeId||!POSES.has(ep.spriteSuggestion)||!URI(ep.sourceUrl)
   ||ep.publishable!==false||ep.renderedByApp!==false
   ||ep.independentHistoricalCertification!==false
   ||!Array.isArray(ep.turns)||ep.turns.length!==3)refuse("unverified episode "+episodeId);
  const topic={id:ep.id,sourceUrl:URI(ep.sourceUrl),sourceScope:ep.sourceScope,pose:ep.spriteSuggestion,
   idFirst:"pius-draft-"+ep.id+"-T1"};
  if(!topic.sourceScope||!topic.sourceScope.trim())refuse("missing source scope");
  episodes.push(Object.freeze(topic));
  for(let j=0;j<3;j++){
   const t=ep.turns[j];
   const id=episodeId+"-T"+(j+1);
   if(seen.has(id)||t?.id!==id||t.visitorRelease!==false
     ||t.editorialApproval!==false||t.sourceCheckedForSubstantiveClaims!==false
     ||t.sourceLanguageTranslationApproval!==false||t.periodVoiceApproval!==false
     ||t.sourceRef!==episodeId||!t.language?.en?.response||!t.language?.fr?.response
     ||!t.language?.en?.visitor||!t.language?.fr?.visitor)
    refuse("unsafe or incomplete turn "+id);
   seen.add(id);
   const editorial=t.avatarLineAllowed===false;
   if(editorial){
    if(t.speaker!=="DOCUMENTARY_EDITORIAL_NOTE_NOT_PIUS_X"||
       t.editorialDisplaySurface!=="OUT_OF_CHARACTER_SOURCE_NOTE")refuse("editorial masquerading as Pope");
    notes++;
   }else{
    if(t.avatarLineAllowed!==true||t.speaker!=="PIUS_X_EDUCATIONAL_RECONSTRUCTION"
       ||t.editorialDisplaySurface!=="PIUS_X_SOURCE_BOUNDED_DIALOGUE")refuse("unapproved character channel");
    character++;
   }
   nodes.set("pius-draft-"+id,Object.freeze({
    id:"pius-draft-"+id,episodeId,ordinal:j+1,editorial,sourceUrl:topic.sourceUrl,
    scope:topic.sourceScope,pose:editorial?null:topic.pose,
    en:Object.freeze({...t.language.en}),fr:Object.freeze({...t.language.fr})
   }));
  }
 }
 if(character!==23||notes!==7||nodes.size!==30)refuse("speaker boundaries");
 return Object.freeze({version:"AO_PIUS_X_TEN_EDITORIAL_REVIEW_BRIDGE_V1",
   published:false,episodes:Object.freeze(episodes),nodes,
   counts:Object.freeze({episodes:10,turns:30,character,editorialNotes:notes,approved:0}),
   entry:"pius-draft-home"});
}
export function piusTenEditorialScene(bundle,id,language="en"){
 if(!bundle||bundle.version!=="AO_PIUS_X_TEN_EDITORIAL_REVIEW_BRIDGE_V1")return null;
 const lang=language==="fr"?"fr":"en";
 if(id===bundle.entry){
  return Object.freeze({id,review:true,editorial:true,pose:null,
   label:"EDITORIAL PILOT · NOT ST PIUS X",
   text:lang==="fr"?"Dix conversations en cours de révision, non approuvées. Choisissez un sujet ; ce ne sont pas des paroles historiques authentiques.":
    "Ten unapproved reconstructed conversations. Choose a subject; these are not authentic spoken words of St Pius X.",
   actions:[...bundle.episodes.map((ep,i)=>[String(i+1).padStart(2,"0")+" · "+ep.id,ep.idFirst]),
    ["Return to St Pius X","pius"]],sourceUrl:null,lang});
 }
 const node=bundle.nodes.get(id);
 if(!node)return null;
 const turn=node[lang];
 const actions=[];
 const t=(n)=>"pius-draft-"+node.episodeId+"-T"+n;
 if(node.ordinal===1)actions.push([lang==="fr"?"Poursuivre":"Continue",t(2)]);
 if(node.ordinal===2)actions.push([lang==="fr"?"Vérifier une objection":"Check an objection",t(3)]);
 if(node.ordinal===3)actions.push([lang==="fr"?"Reprendre":"Return to beginning",t(1)]);
 actions.push([lang==="fr"?"Source originale":"Open original source","pius-review-source"]);
 actions.push([lang==="fr"?"Autres sujets":"Other subjects",bundle.entry]);
 return Object.freeze({id,review:true,editorial:node.editorial,
  pose:node.pose,label:node.editorial?"EDITORIAL NOTE · NOT ST PIUS X":"UNAPPROVED PIUS X RECONSTRUCTION",
  text:turn.visitor+"\n\n"+turn.response,actions,sourceUrl:node.sourceUrl,scope:node.scope,lang});
}
