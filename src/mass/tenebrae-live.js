// The 1960/61 Tenebrae Office is not a Mass. Consume the canonical local
// source corpus with the same ribbon/focus/translations grammar as R17 LIVE.
import {loadTenebraeHour,TENEBRAE_DAY_NAMES} from "../pray/tenebrae-1960.js";
const CHANT=new Set(["PSALM","CANTICLE","ANTIPHON","RESPONSORY","VERSICLE"]);
const HOURS=["MATINS","LAUDS"],MODES=["LIVE","SIMPLE","MISSAL"];
const tr=(en,fr,l)=>l==="fr"?fr:en;
export const tenebraeInitialFace=step=>CHANT.has(step?.kind)?"latin":"vernacular";
export function tenebraeLiveModel({data,index=0,mode="LIVE",language="en",faces={}}={}){
 if(data?.schema!=="ao.tenebrae.1960.hour-reader.v1")throw new TypeError("Tenebrae source required");
 if(!MODES.includes(mode))throw new TypeError("Unknown Tenebrae mode");
 const i=Math.max(0,Math.min(index,data.steps.length-1)),step=data.steps[i];
 const face=faces[step.id]??tenebraeInitialFace(step);
 const title=step.id==="L.BENEDICTUS"?"Benedictus":step.id==="L.CHRISTUS"?"Christus factus est":
  step.kind==="PSALM"?tr("Psalm ","Psaume ",language)+(step.metadata?.psalm??""):
  step.kind==="LESSON"?tr("Lesson","Leçon",language):
  step.kind==="RESPONSORY"?tr("Responsory","Répons",language):
  step.kind==="VERSICLE"?tr("Versicle and response","Verset et répons",language):
  step.id.endsWith("COLLECT")?tr("Concluding prayer","Oraison finale",language):
  step.id.endsWith("PATER")?"Pater noster":String(step.kind).replaceAll("_"," ");
 return Object.freeze({schema:"ao-mass-tenebrae-live.v1",index:i,total:data.steps.length,
  id:step.id,title,kind:step.kind,mode,language,face,
  latin:step.latin,vernacular:step[language],body:face==="latin"?step.latin:step[language],
  silent:step.metadata?.saidSilently===true,priestAction:null,schola:null,
  sourceVerified:data.textsCompleteForSourceDerivedReading,
  printedEditionCollated:data.printEditionCriticallyCertified});
}
function node(doc,tag,cls,txt){const x=doc.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x}
export function mountTenebraeLive({doc=globalThis.document,root,language=()=> "en",onBack=()=>{},loader=loadTenebraeHour}={}){
 if(!doc?.createElement||!root||typeof loader!=="function")throw new TypeError("Tenebrae reader needs root and loader");
 let day=0,hour="MATINS",index=0,mode="LIVE",data=null,faces={},loading=false,error=null,disposed=false,token=0;
 const l=()=>language()==="fr"?"fr":"en",T=(en,fr)=>tr(en,fr,l());
 root.dataset.aoMassTenebrae="live";root.classList.add("aoMassTenebrae");
 const bar=node(doc,"header","aoMassHubRibbon");
 const back=node(doc,"button","aoMassHubBack","←");back.type="button";back.dataset.tenebraeBack="";
 const jump=node(doc,"select","aoTenebraeJump");jump.setAttribute("aria-label","Jump to Office text");
 const close=node(doc,"button","aoMassHubBack","×");close.type="button";close.dataset.tenebraeBack="";
 bar.append(back,jump,close);
 const rail=node(doc,"div","aoMassHubStateRibbon"),left=node(doc,"span",""),centre=node(doc,"span",""),right=node(doc,"span","");
 rail.append(left,centre,right);
 const track=node(doc,"div","aoMassHubProgress"),fill=node(doc,"span","");track.append(fill);
 const controls=node(doc,"div","aoTenebraeControls"),days=node(doc,"div","aoTenebraeDays"),
  hours=node(doc,"div","aoTenebraeHours"),modes=node(doc,"div","aoTenebraeModes");
 controls.append(days,hours,modes);
 const main=node(doc,"main","aoTenebraeFocus");
 const provenance=node(doc,"details","aoTenebraeProvenance"),summary=node(doc,"summary",""),
  witness=node(doc,"p","");
 provenance.append(summary,witness);
 root.replaceChildren(bar,rail,track,controls,main,provenance);
 const choose=(group,options,key,selected,labels)=>{
  group.replaceChildren();
  options.forEach((v,i)=>{
   const button=node(doc,"button","",labels[i]);button.type="button";button.dataset[key]=String(v);
   button.setAttribute("aria-pressed",String(selected===v));group.append(button);
  });
 };
 function render(){
  if(disposed)return;
  root.lang=l();back.setAttribute("aria-label",T("Back to Mass","Retour à la messe"));
  left.textContent=T("FOLLOW · OFFICE","SUIVRE · OFFICE");
  centre.textContent=T("TENEBRAE · 1960/61","TÉNÈBRES · 1960/61");
  right.textContent=hour==="MATINS"?T("MATINS","MATINES"):T("LAUDS","LAUDES");
  choose(days,[0,1,2],"tenebraeDay",day,TENEBRAE_DAY_NAMES[l()]);
  choose(hours,HOURS,"tenebraeHour",hour,[T("Matins","Matines"),T("Lauds","Laudes")]);
  choose(modes,MODES,"tenebraeMode",mode,["LIVE","SIMPLE",T("Missal","Missel")]);
  summary.textContent=T("Edition and sources","Édition et sources");
  witness.textContent=T(
   "1960/61 Roman Breviary, locally assembled from MIT-licensed Divinum Officium. Independent critical collation with the printed Breviary and parish ceremony certification remain pending. Tenebrae is Matins and Lauds, not a Mass.",
   "Bréviaire romain 1960/61, assemblé localement de Divinum Officium (licence MIT). La collation critique avec le bréviaire imprimé et les cérémonies paroissiales ne sont pas certifiées. Les Ténèbres sont les Matines et les Laudes, non une messe.");
  main.replaceChildren();jump.replaceChildren();
  if(loading||!data){
   const msg=node(doc,"p","aoTenebraeFeedback",loading?T("Loading Office texts…","Chargement des textes de l’Office…"):
    error?T("Source unavailable: ","Source indisponible : ")+String(error.message??error):T("Select the Office","Choisir l’Office"));
   msg.setAttribute("role",error?"alert":"status");main.append(msg);
   if(error){const retry=node(doc,"button","aoMassHubAction",T("Retry","Réessayer"));retry.type="button";retry.dataset.tenebraeRetry="";main.append(retry)}
   fill.style.width="0%";return;
  }
  const v=tenebraeLiveModel({data,index,mode,language:l(),faces});index=v.index;
  fill.style.width=String((index+1)/v.total*100)+"%";
  data.steps.forEach((step,i)=>{
   const op=node(doc,"option","",step.kind+" · "+step.id);op.value=String(i);jump.append(op);
  });jump.value=String(index);
  const intro=node(doc,"small","aoTenebraeKicker",TENEBRAE_DAY_NAMES[l()][day]+" · "+hour+" · "+String(index+1)+" / "+v.total);
  const heading=node(doc,"h2","aoTenebraeHeading",v.title);
  const card=node(doc,"article","aoTenebraeCard");card.dataset.tenebraeCue=v.id;
  const kind=node(doc,"small","aoTenebraeKind",v.kind),content=node(doc,"div","aoTenebraeText");
  if(mode==="MISSAL"){
   content.classList.add("aoTenebraeParallel");
   const lat=node(doc,"div","aoTenebraeLatin",v.latin),vern=node(doc,"div","aoTenebraeTranslation",v.vernacular);
   lat.lang="la";vern.lang=l();content.append(lat,vern);
  }else{
   const body=node(doc,"button","aoTenebraeReading",v.body);body.type="button";
   body.dataset.tenebraeToggle="";body.lang=v.face==="latin"?"la":l();
   body.setAttribute("aria-label",T("Switch Latin and translation","Passer du latin à la traduction"));
   content.append(body);
  }
  card.append(kind,content);
  const nav=node(doc,"div","aoTenebraeMove");
  const prev=node(doc,"button","",T("Previous","Précédent"));prev.type="button";prev.dataset.tenebraeMove="-1";prev.disabled=index===0;
  const count=node(doc,"span","",String(index+1)+" / "+v.total);
  const next=node(doc,"button","",T("Next","Suivant"));next.type="button";next.dataset.tenebraeMove="1";next.disabled=index>=v.total-1;
  nav.append(prev,count,next);main.append(intro,heading,card,nav);
 }
 async function load(){
  const now=++token;loading=true;error=null;data=null;render();
  try{
   const model=await loader({dayIndex:day,hour});
   if(now!==token||disposed)return;
   if(model?.schema!=="ao.tenebrae.1960.hour-reader.v1"||model.textsCompleteForSourceDerivedReading!==true)
    throw new Error("TENEBRAE_SOURCE_INCOMPLETE");
   data=model;index=0;faces={};
  }catch(e){if(now===token&&!disposed)error=e}
  finally{if(now===token&&!disposed){loading=false;render()}}
 }
 root.addEventListener("click",event=>{
  const b=event.target?.closest?.("button");if(!b)return;
  if(b.hasAttribute("data-tenebrae-back")){onBack();return}
  if(b.dataset.tenebraeDay!==undefined){day=Number(b.dataset.tenebraeDay);void load();return}
  if(b.dataset.tenebraeHour){hour=b.dataset.tenebraeHour;void load();return}
  if(b.dataset.tenebraeMode){mode=b.dataset.tenebraeMode;render();return}
  if(b.dataset.tenebraeMove!==undefined){index+=Number(b.dataset.tenebraeMove);render();return}
  if(b.hasAttribute("data-tenebrae-retry")){void load();return}
  if(b.hasAttribute("data-tenebrae-toggle")&&data){
   const v=tenebraeLiveModel({data,index,mode,language:l(),faces});
   faces={...faces,[v.id]:v.face==="latin"?"vernacular":"latin"};render();
  }
 });
 jump.addEventListener("change",()=>{index=Number(jump.value);render()});
 void load();
 return Object.freeze({
  status:()=>Object.freeze({day,hour,index,mode,ready:Boolean(data),error:error?String(error.message??error):null}),
  selectMode:next=>{if(!MODES.includes(next))return false;mode=next;render();return true},
  dispose(){disposed=true;++token;root.replaceChildren()}
 });
}
