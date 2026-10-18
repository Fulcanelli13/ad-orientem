/**
 * Source-ONLY Canon research folio, opt-in editorial review on real P3 stage.
 * Shows the original Folio answer draft as source evidence, not character speech.
 * No invented apologetics prose, copied database, or public route.
 */
import {canonResearchPreviewEnabled,createCanonResearchReviewer}
 from "./living-church-canon-research-reader.mjs";
export const CANON_DIALOGUE_UI_VERSION="AO_CANON_EDITORIAL_DIALOGUE_FOLIO_V1";
const css=`
#aoCanonResearchReview{position:absolute;z-index:8;left:14px;bottom:14px;width:min(760px,68vw);max-height:64%;overflow:auto;pointer-events:auto;border:1px solid #a48d69;border-radius:6px;background:linear-gradient(145deg,rgba(10,16,25,.99),rgba(23,25,29,.98));box-shadow:0 15px 46px #000a;padding:16px 20px;color:#eee2cf;font-family:Georgia,serif}
#aoCanonResearchReview[hidden]{display:none!important}
#aoCanonResearchReview .crKicker{font:10px/1.5 system-ui,sans-serif;color:#c7aa77;letter-spacing:.09em;text-transform:uppercase}
#aoCanonResearchReview .crHeading{font:21px/1.3 Georgia,serif;margin:7px 0 10px}
#aoCanonResearchReview .crCaution{font:12px/1.5 system-ui,sans-serif;border-left:2px solid #be9c67;padding:7px 10px;margin:10px 0;color:#d9c8aa}
#aoCanonResearchReview .crText{font:16px/1.55 Georgia,serif;white-space:pre-wrap;margin:10px 0 14px}
#aoCanonResearchReview .crScope{font:11px/1.5 system-ui,sans-serif;color:#bdb5a5;margin:6px 0}
#aoCanonResearchReview .crChoice{background:#212936;color:#f1e7d5;border:1px solid #79705e;border-radius:5px;padding:9px 12px;font:12px/1.4 system-ui,sans-serif;min-height:42px;cursor:pointer;text-align:left}
#aoCanonResearchReview .crChoice[disabled]{opacity:.5}
#aoCanonResearchReview .crNav{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}
#aoCanonResearchReview .crQuery{width:100%;min-height:43px;box-sizing:border-box;margin:8px 0;padding:10px;background:#0a121e;border:1px solid #746b5c;border-radius:5px;color:#f0e6d7;font:13px system-ui,sans-serif}
#aoCanonResearchReview .crEvidence{padding:8px 0;border-top:1px solid #635641}
#aoCanonResearchReview .crLink{display:inline-block;color:#dac39a;margin:5px 12px 3px 0;font:11px/1.4 system-ui,sans-serif}
#aoCanonResearchReview :is(button,input,a):focus-visible{outline:2px solid #dfc993;outline-offset:2px}
@media(max-width:720px){#aoCanonResearchReview{left:8px;right:8px;bottom:8px;width:auto;max-height:57%;padding:12px 13px}#aoCanonResearchReview .crHeading{font-size:18px}#aoCanonResearchReview .crText{font-size:14px}#aoCanonResearchReview .crChoice{min-height:40px}}
`;
const labels={
 en:{title:"Monsieur le Chanoine",stamp:"Original Formation research · editorial review only",
 warning:"Unpublished research. These are source-owned draft paragraphs, not quotations spoken by the Canon. No doctrinal, source-context or French release approval.",
 ask:"Ask a question",browse:"Browse interlocutors",debate:"Prepare a discussion",
 search:"Search historic questions by topic, denomination or ID",
 back:"Back",close:"Return to Canon",all:"All questions",sources:"Original source witnesses",
 unavailable:"An answer cannot be retrieved from its original source record.",
 none:"No source question matches. Try another term.",
 loading:"Loading exact original Formation records…",
 missing:"No original French paragraph exists in this source; do not invent a translation.",
 advance:"Next source paragraph",previous:"Previous paragraph",other:"Other questions in this bank",
 prompt:"Choose a topic or interlocutor. Questions are historical candidate wording, not certified verbatim chat transcripts."},
 fr:{title:"Monsieur le Chanoine",stamp:"Recherches originales de Formation · révision éditoriale",
 warning:"Recherches non publiées. Ces paragraphes appartiennent aux sources originales ; ce ne sont pas des paroles prononcées par le Chanoine. Aucune approbation doctrinale, documentaire ou linguistique pour publication.",
 ask:"Poser une question",browse:"Parcourir les interlocuteurs",debate:"Préparer une discussion",
 search:"Rechercher une question par sujet, confession ou identifiant",
 back:"Retour",close:"Revenir au Chanoine",all:"Toutes les questions",sources:"Documents originaux",
 unavailable:"La réponse n'est pas accessible depuis sa source originale.",
 none:"Aucune question trouvée. Essayez d'autres termes.",
 loading:"Chargement des recherches originales…",
 missing:"Cette source ne contient pas de paragraphe français original ; aucune traduction n'est inventée.",
 advance:"Paragraphe suivant",previous:"Paragraphe précédent",other:"Autres questions de cette catégorie",
 prompt:"Choisissez un thème ou un interlocuteur. Les titres historiques ne sont pas des transcriptions originales vérifiées."}
};
function node(doc,tag,cls,text){const v=doc.createElement(tag);if(cls)v.className=cls;if(text!=null)v.textContent=String(text);return v;}
function button(doc,label,action,key){
 const x=node(doc,"button","crChoice",label);x.type="button";x.dataset.action=key||"choice";x.addEventListener("click",action);return x;
}
export function createCanonSourceDialogueOverlay(win=globalThis,{root,getLang=()=> "en"}={}){
 if(!root||!canonResearchPreviewEnabled(win))throw Error("Canon source dialogue requires original P3 and four review flags");
 const doc=win.document;
 const style=node(doc,"style");style.id="aoCanonResearchReviewStyles";style.textContent=css;doc.head.append(style);
 const stage=node(doc,"section");stage.id="aoCanonResearchReview";
 stage.setAttribute("role","dialog");stage.setAttribute("aria-label","Canonical Formation research review");
 stage.hidden=true;root.append(stage);
 let disposed=false,reader=null,mode="index",bank=null,results=[],selected=null,
  paragraph=0,query="",purpose="learn",err="",loading=false,priorFocus=null;
 const L=()=>labels[getLang()==="fr"?"fr":"en"];
 const put=(parent,tag,cls,text)=>parent.appendChild(node(doc,tag,cls,text));
 const nav=()=>put(stage,"div","crNav");
 const act=(wrap,text,fn,key)=>wrap.appendChild(button(doc,text,fn,key));
 function back(){
  if(mode==="reading"){mode="results";selected=null;}
  else if(mode==="results"){mode="banks";query="";}
  else if(mode==="banks"){mode="index";bank=null;query="";}
  else close();
  render();
 }
 function close(){stage.hidden=true;priorFocus?.focus?.({preventScroll:true});return true;}
 function render(){
  if(disposed)return;
  const t=L();stage.dataset.mode=mode;stage.replaceChildren();
  put(stage,"div","crKicker",t.stamp);
  const controls=nav();act(controls,t.close,close,"close");
  if(mode!=="index")act(controls,t.back,back,"back");
  put(stage,"h3","crHeading",t.title);
  put(stage,"p","crCaution",t.warning);
  if(loading){put(stage,"p","crText",t.loading);return;}
  if(err){put(stage,"p","crText",err);}
  if(mode==="index"){
   put(stage,"p","crScope",t.prompt);
   put(stage,"p","crScope",String(reader?.counts.total||0)+" original question IDs · "+String(reader?.counts.withPreexistingSupplement||0)+" source supplements");
   const form=node(doc,"form"),input=node(doc,"input","crQuery");
   input.name="canonQuestionSearch";input.placeholder=t.search;input.setAttribute("aria-label",t.search);
   const submit=button(doc,t.ask,()=>{},"submit");submit.type="submit";
   form.append(input,submit);
   form.addEventListener("submit",e=>{e.preventDefault();search(input.value);});
   stage.append(form);
   const choices=nav();
   act(choices,t.browse,()=>{mode="banks";render();},"browse");
   act(choices,t.debate,()=>{purpose="debate";mode="banks";render();},"debate");
   return;
  }
  if(mode==="banks"){
   const wrapper=nav();
   for(const [key,num] of Object.entries(reader?.byBank||{}))
    act(wrapper,key+" ("+num+")",()=>browse(key),"bank");
   return;
  }
  if(mode==="results"){
   put(stage,"p","crScope",(bank||t.all)+" · "+results.length+" · "+(purpose==="debate"?t.debate:t.ask));
   if(!results.length)put(stage,"p","crText",t.none);
   for(const item of results.slice(0,50)){
    const btn=button(doc,item.historicalQuestionCandidate+" · "+item.questionId,
      ()=>{void openQuestion(item.questionId);},"question");
    btn.dataset.questionId=item.questionId;stage.append(btn);
   }
   return;
  }
  if(mode==="reading"){
   const rec=selected,meta=reader.get(rec?.questionId);
   put(stage,"h4","crHeading",meta?.historicalQuestionCandidate||rec?.questionId||t.unavailable);
   if(!rec?.ok){put(stage,"p","crText",t.unavailable);return;}
   put(stage,"p","crScope",rec.questionId+" · "+rec.originalSourcePointer.path);
   const p=rec.paragraphs[paragraph];
   if(p){
    const sec=put(stage,"div","crEvidence");
    put(sec,"div","crKicker",p.role.replace(/_/g," "));
    put(sec,"p","crText",p.sourceText||t.missing);
    const refs=nav();
    for(const s of p.sources){
     const a=node(doc,"a","crLink",s.title);a.href=s.url;
     a.target="_blank";a.rel="noopener noreferrer";refs.append(a);
    }
   }
   if(rec.editorialCorrection){
    const note=put(stage,"section","crEvidence");
    put(note,"div","crKicker",getLang()==="fr"?"Sources précisées · non approuvées":"Source-owner citation errata · still unpublished");
    put(note,"p","crCaution",getLang()==="fr"?
      "Les sources ont été précisées dans un correctif documentaire. Le contenu et sa traduction restent à valider.":
      rec.editorialCorrection.why);
    for(const witness of rec.editorialExtraWitnesses||[]){
     const a=node(doc,"a","crLink",witness.title);
     a.href=witness.url;a.rel="noopener noreferrer";a.target="_blank";note.append(a);
    }
   }
   if(rec.editorialAudit){
    const check=put(stage,"section","crEvidence");
    const french=getLang()==="fr";
    put(check,"div","crKicker",french?"Vérification des sources · non approuvée":
      "Targeted source check · NOT approved for publication");
    put(check,"p","crScope",rec.editorialAudit.class.replace(/_/g," "));
    put(check,"p","crCaution",french?"Une vérification supplémentaire des sources reste nécessaire.":
      rec.editorialAudit.held);
    const originals=put(check,"div","crNav");
    for(const source of rec.editorialAudit.pinpoints){
     const link=node(doc,"a","crLink",source.authority);
     link.href=source.url;link.target="_blank";link.rel="noopener noreferrer";
     originals.append(link);
    }
   }
   put(stage,"p","crScope",(paragraph+1)+" / "+rec.paragraphs.length);
   const actions=nav();
   if(paragraph>0)act(actions,t.previous,()=>{paragraph--;render();},"prev");
   if(paragraph<rec.paragraphs.length-1)act(actions,t.advance,()=>{paragraph++;render();},"next");
   if(meta?.bank)act(actions,t.other,()=>browse(meta.bank),"related");
  }
 }
 function browse(name){
  bank=name;query="";results=reader.listBank(name);mode="results";err="";render();
 }
 function search(text){
  query=String(text||"").trim();bank=null;results=reader.find(query,{limit:50});
  mode="results";err="";render();
 }
 async function openQuestion(id){
  if(!reader?.get(id))return false;
  mode="reading";selected={questionId:id,ok:false};paragraph=0;loading=true;render();
  try{selected=await reader.originalResearch(id,{lang:getLang()});err="";}
  catch{selected={questionId:id,ok:false};err=L().unavailable;}
  loading=false;render();return Boolean(selected?.ok);
 }
 async function open({purpose:next="learn",focusFrom=null}={}){
  if(disposed)return false;
  priorFocus=focusFrom||doc.activeElement;
  stage.hidden=false;purpose=next;mode="index";err="";loading=!reader;render();
  if(!reader){
   try{reader=await createCanonResearchReviewer(win);}
   catch{err=L().unavailable;loading=false;render();return false;}
  }
  loading=false;render();stage.querySelector('[data-action="close"]')?.focus?.();return true;
 }
 stage.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();close();}});
 return Object.freeze({open,close,
  dispose(){disposed=true;stage.remove();style.remove();},
  status(){return Object.freeze({open:!stage.hidden,mode,bank,query,purpose,
   questionCount:reader?.counts.total||0,selectedQuestion:selected?.questionId||null,
   paragraphIndex:paragraph,publicAnswerAuthorized:false});}});
}
