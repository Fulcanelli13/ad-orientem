/** Source-owned 20-path St Pius X scene flow. Review-only, no doctrinal data duplication. */
export const PIUS20_SCENE_VERSION="AO_LC_PIUS20_VISUAL_NOVEL_REVIEW_V1";
export function createLivingChurchPius20Scene({source,render,openGuide}={}){
 if(source?.version!=="AO_LC_PIUS20_PINNED_CONTENT_BRIDGE_V1"||
  source.published!==false||source.status()?.approvedCharacterAnswers!==0||
  source.chapters?.length!==20||typeof source.inspect!=="function"||
  typeof render!=="function"||typeof openGuide!=="function")
  throw Error("Pius X 20-path scene requires unapproved pinned source and existing character host");
 let language="en",epoch=0,active=null;
 const visited=new Set();
 const l=(en,fr)=>language==="fr"?fr:en;
 const lbl=r=>r[language];
 const go=(id)=>void visit(id);
 const backToPius=()=>openGuide("pius");
 function home(page=0){
  epoch++;
  const start=Math.max(0,Math.min(15,Math.floor(Math.max(0,page)/5)*5));
  active="pius20-page:"+start;
  const options=source.chapters.slice(start,start+5).map(ch=>({label:lbl(ch),act:()=>chapter(ch.id)}));
  if(start>0)options.push({label:l("Previous subjects","Sujets précédents"),act:()=>home(start-5)});
  if(start<15)options.push({label:l("More subjects","Autres sujets"),act:()=>home(start+5)});
  options.push({label:"English",act:()=>{language="en";home(start)}},
   {label:"Français",act:()=>{language="fr";home(start)}},
   {label:l("Return to St Pius X","Revenir à saint Pie X"),act:backToPius});
  render({id:active,pose:"neutral",label:l("ST PIUS X · SOURCE-FIRST REVIEW","SAINT PIE X · RÉVISION DES SOURCES"),
   dialogue:l("Choose a subject. The source is the 1905 Catechism; these drafts are not historical quotations.",
    "Choisissez un sujet. La source est le Catéchisme de 1905 ; ces textes ne sont pas des citations historiques."),
   question:null,answer:null,sourceUrl:null,options,language});
  return true;
 }
 function chapter(id){
  const ch=source.chapters.find(x=>x.id===id);if(!ch)return false;
  epoch++;active="pius20-chapter:"+id;
  render({id:active,pose:"thoughtful",label:l("ST PIUS X · SELECT A QUESTION","SAINT PIE X · CHOISIR UNE QUESTION"),
   dialogue:lbl(ch),question:null,answer:null,sourceUrl:null,
   options:[...ch.entries.map(e=>({label:lbl(e),act:()=>go("pius20-question:"+e.id)})),
    {label:l("All subjects","Tous les sujets"),act:()=>home(0)},
    {label:"English",act:()=>{language="en";chapter(id)}},
    {label:"Français",act:()=>{language="fr";chapter(id)}}],language});
  return true;
 }
 async function question(id){
  const current=++epoch;active="pius20-question:"+id;
  render({id:active,pose:"explaining",label:l("ST PIUS X · HISTORICAL EDITORIAL DRAFT","SAINT PIE X · PROJET DE TEXTE HISTORIQUE"),
   dialogue:l("Reading original source-owner record…","Consultation du texte source…"),
   options:[],language});
  let item;try{item=await source.inspect(id)}catch{item=null}
  if(current!==epoch||active!=="pius20-question:"+id)return false;
  if(!item||item.published!==false||item.originalPrintedQuestionNumber!==false){
   render({id:active,pose:"thoughtful",label:l("Source unavailable","Source indisponible"),
    dialogue:l("No approved source-backed reply is available.","Aucune réponse sourcée approuvée n’est disponible."),
    options:[{label:l("Back to subjects","Retour aux sujets"),act:()=>home(0)}],language});
   return false;
  }
  visited.add(id);
  const options=[];
  for(const n of item.next.filter(x=>!visited.has(x.id)).slice(0,3))
   options.push({label:lbl(n),act:()=>question(n.id)});
  const related=item.related?.find(x=>!visited.has(x.id));
  if(related)options.push({label:l("Related: ","Sujet connexe : ")+lbl(related),act:()=>question(related.id)});
  if(item.chanoine)options.push({label:l("Check Chanoine referral","Vérifier le renvoi au Chanoine"),
   act:()=>canonNotice(item)});
  options.push({label:l("Chapter questions","Questions du chapitre"),act:()=>chapter(item.arc)},
   {label:"English",act:()=>{language="en";question(id)}},
   {label:"Français",act:()=>{language="fr";question(id)}},
   {label:l("Return to St Pius X","Revenir à saint Pie X"),act:backToPius});
  render({id:active,pose:item.pose,label:l("ST PIUS X · UNAPPROVED RECONSTRUCTION","SAINT PIE X · RECONSTITUTION NON APPROUVÉE"),
   dialogue:item.answer[language],question:item.visitor[language],sourceLabel:item.sourceLabel,
   sourceUrl:item.originalWitness,editorialNote:item.editorialNote?.[language]||null,
   options,language});
  return true;
 }
 function canonNotice(item){
  epoch++;
  active="pius20-canon:"+item.id;
  const matched=item.chanoine.status==="MATCHED_NARROW_CONTENT_SUBJECT";
  render({id:active,pose:"thoughtful",label:l("CHANOINE · SOURCE ELIGIBILITY ONLY","CHANOINE · SOURCES À VÉRIFIER"),
   dialogue:matched?
    l("A related ready Apostolate source exists; no specific Chanoine character reply has been approved. Consult his existing guide if you wish.",
      "Une réponse doctrinale connexe existe, mais aucune réplique du personnage du Chanoine n’est approuvée."):
    l("There is no verified Chanoine answer for this exact question. No replacement reply will be invented.",
      "Il n’existe aucune réponse vérifiée du Chanoine pour cette question précise."),
   options:[{label:l("Visit existing Chanoine guide","Consulter le guide du Chanoine"),act:()=>openGuide("canon")},
    {label:l("Back to the question","Retour à la question"),act:()=>question(item.id)}],language});
  return true;
 }
 async function visit(id){
  if(id==="pius20-home")return home(0);
  if(id.startsWith("pius20-page:"))return home(Number(id.slice("pius20-page:".length))||0);
  if(id.startsWith("pius20-chapter:"))return chapter(id.slice("pius20-chapter:".length));
  if(id.startsWith("pius20-question:"))return question(id.slice("pius20-question:".length));
  if(id.startsWith("pius20-canon:"))return question(id.slice("pius20-canon:".length));
  return false;
 }
 return Object.freeze({version:PIUS20_SCENE_VERSION,owns:id=>typeof id==="string"&&id.startsWith("pius20-"),
  open:()=>home(0),visit,cancel:()=>{epoch++;active=null;},
  status:()=>Object.freeze({sourceCommit:source.sourceCommit,active,language,visited:visited.size,
   offeredChanoineReply:false,denzingerRequired:false,published:false})});
}
