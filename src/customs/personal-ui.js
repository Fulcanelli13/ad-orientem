/* Standalone household Customs & Prayers editor. No changes to Mass or Calendar law. */
import { calendarCustomArticleIds, calendarCustomArticle } from "../calendar/customs-read-model.js";
import { createMyCustomsStore, MY_CUSTOMS_SEASONS } from "./personal-store.js";
import { installMyCustomsStyle } from "./personal-style.js";

export const MY_CUSTOMS_UI_VERSION="my-customs-prayers-v1";
const ROOT="ao-my-customs-prayers";
const TEXT={
 en:{title:"My Customs & Prayers",intro:"Your household customs and prayers, separate from the sourced Catholic catalogue.",
  type:"Add",personal:"My custom",prayer:"My prayer",canonical:"Adopt a sourced custom",
  choose:"Choose a documented custom",name:"Title",body:"Description or prayer",note:"Personal notes",
  when:"Personal Calendar association",none:"No date",annual:"Every year on this date",season:"During a liturgical season",
  mmdd:"Month and day (MM-DD)",whichSeason:"Liturgical season",save:"Save",update:"Save changes",cancel:"Cancel editing",
  saved:"My saved practices",empty:"No personal practices saved yet.",close:"Close",edit:"Edit",remove:"Delete",
  ownLabel:"Personal, written by you",sourcedLabel:"Adopted from sourced catalogue",prayerLabel:"Personal prayer",
  sources:"Documentary sources for this custom",error:"Could not save this entry.",
  privacy:"Saved only in this browser, on this device. There is no cloud sync or automatic backup; clearing site data may erase these entries.",
  unavailable:"Browser storage is unavailable. Personal entries cannot be saved.",
  confirm:"Delete this personal entry?",disclaimer:"These are personal associations, not new liturgical feasts, requirements or announced parish events."},
 fr:{title:"Mes coutumes et prières",intro:"Vos coutumes et prières familiales, distinctes du catalogue catholique sourcé.",
  type:"Ajouter",personal:"Ma coutume",prayer:"Ma prière",canonical:"Adopter une coutume sourcée",
  choose:"Choisir une coutume documentée",name:"Titre",body:"Description ou prière",note:"Notes personnelles",
  when:"Association personnelle au Calendrier",none:"Sans date",annual:"Chaque année à cette date",season:"Pendant un temps liturgique",
  mmdd:"Mois et jour (MM-JJ)",whichSeason:"Temps liturgique",save:"Enregistrer",update:"Enregistrer les modifications",cancel:"Annuler",
  saved:"Mes pratiques",empty:"Aucune pratique personnelle enregistrée.",close:"Fermer",edit:"Modifier",remove:"Supprimer",
  ownLabel:"Personnel, rédigé par vous",sourcedLabel:"Adopté du catalogue sourcé",prayerLabel:"Prière personnelle",
  sources:"Sources documentaires de cette coutume",error:"Impossible d’enregistrer cette entrée.",
  privacy:"Enregistré uniquement dans ce navigateur, sur cet appareil. Aucune synchronisation ni sauvegarde automatique. L’effacement des données du site peut supprimer ces entrées.",
  unavailable:"Le stockage local est indisponible. Enregistrement impossible.",
  confirm:"Supprimer cette entrée personnelle ?",disclaimer:"Il s’agit d’associations personnelles, non de nouvelles fêtes, obligations ou cérémonies paroissiales annoncées."}
};
const SEASON_LABELS={
 advent:["Advent","Avent"],christmas:["Christmas","Noël"],epiphany:["Epiphany","Épiphanie"],
 "after-epiphany":["After Epiphany","Après l’Épiphanie"],septuagesima:["Septuagesima","Septuagésime"],
 lent:["Lent","Carême"],passion:["Passiontide","Temps de la Passion"],easter:["Eastertide","Temps pascal"],
 ascension:["Ascensiontide","Temps de l’Ascension"],pentecost:["Pentecost octave","Octave de la Pentecôte"],
 "after-pentecost":["After Pentecost","Après la Pentecôte"]
};
function node(doc,tag,text="",cls=""){
 const e=doc.createElement(tag);
 if(text)e.textContent=text;
 if(cls)e.className=cls;
 return e;
}
function options(doc,select,items){
 for(const [value,label] of items){
   const o=node(doc,"option",label);o.value=value;select.append(o);
 }
}
function field(doc,parent,labelText,name,tag="input",opts=null,wide=false){
 const label=node(doc,"label",labelText,wide?"myc-wide":"");
 const input=node(doc,tag);input.name=name;
 if(tag==="textarea"){input.rows=4}
 if(opts)options(doc,input,opts);
 label.append(input);parent.append(label);
 return {label,input};
}
export function openMyCustoms({win=globalThis,language="en"}={}){
 const doc=win?.document;if(!doc?.body)return false;
 const fr=language==="fr",t=TEXT[fr?"fr":"en"];
 let storage=null;try{storage=win.localStorage}catch{}
 const customIds=calendarCustomArticleIds();
 const articles=customIds.map(calendarCustomArticle).filter(Boolean);
 const articleById=new Map(articles.map(a=>[a.id,a]));
 const store=createMyCustomsStore({storage,canonicalIds:customIds});
 installMyCustomsStyle(doc);
 doc.getElementById(ROOT)?.remove();
 const previousFocus=doc.activeElement;
 const dialog=node(doc,"dialog");dialog.id=ROOT;dialog.setAttribute("aria-label",t.title);
 doc.body.append(dialog);
 let editing=null,error="";
 function close(){
   try{dialog.close()}catch{}
   dialog.remove();
   try{previousFocus?.focus?.({preventScroll:true})}catch{}
 }
 function scheduleLabel(rule){
   if(rule?.kind==="annual")return rule.mmdd;
   if(rule?.kind==="season")return (SEASON_LABELS[rule.season]||[rule.season,rule.season])[fr?1:0];
   return t.none;
 }
 function titleOf(item){
   return item.origin==="canonical"?articleById.get(item.customId)?.title[fr?"fr":"en"]||item.customId:item.title;
 }
 function savedCard(item){
   const card=node(doc,"article","","myc-entry");
   const source=item.origin==="canonical"?t.sourcedLabel:item.kind==="prayer"?t.prayerLabel:t.ownLabel;
   card.append(node(doc,"small",source+" · "+scheduleLabel(item.schedule)),node(doc,"h3",titleOf(item)));
   if(item.body)card.append(node(doc,"p",item.body));
   if(item.note)card.append(node(doc,"p",item.note));
   const article=item.origin==="canonical"?articleById.get(item.customId):null;
   if(article){
     const details=node(doc,"details"),summary=node(doc,"summary",t.sources);details.append(summary);
     for(const s of article.sources||[]){
       const p=node(doc,"p");const a=node(doc,"a",s.title);
       a.href=s.url;a.target="_blank";a.rel="noopener noreferrer";p.append(a);details.append(p);
     }card.append(details);
   }
   const actions=node(doc,"div","","myc-actions");
   const edit=node(doc,"button",t.edit),del=node(doc,"button",t.remove);
   edit.type="button";del.type="button";
   edit.addEventListener("click",()=>{
     editing=item.id;error="";render();
     dialog.querySelector("form")?.scrollIntoView?.({block:"start"});
   });
   del.addEventListener("click",()=>{
     if(typeof win.confirm==="function"&&!win.confirm(t.confirm))return;
     try{store.remove(item.id);editing=null;error=""}catch(err){error=String(err.message||err)}
     render();
   });
   actions.append(edit,del);card.append(actions);
   return card;
 }
 function render(){
   dialog.replaceChildren();
   const wrap=node(doc,"div","","myc-wrap");
   const header=node(doc,"header","","myc-top"),intro=node(doc,"div");
   intro.append(node(doc,"small",t.ownLabel,"myc-eyebrow"),node(doc,"h1",t.title),node(doc,"p",t.intro));
   const closeButton=node(doc,"button","×");closeButton.type="button";
   closeButton.setAttribute("aria-label",t.close);closeButton.addEventListener("click",close);
   header.append(intro,closeButton);wrap.append(header,node(doc,"p",t.privacy,"myc-info"));
   const formTitle=node(doc,"h2",t.type);
   const form=node(doc,"form"),grid=node(doc,"div","","myc-grid");
   const type=field(doc,grid,t.type,"entryType","select",[
     ["personal:custom",t.personal],["personal:prayer",t.prayer],["canonical",t.canonical]]);
   const canonical=field(doc,grid,t.choose,"customId","select",articles.map(a=>[a.id,a.title[fr?"fr":"en"]]));
   const title=field(doc,grid,t.name,"title","input");
   title.input.maxLength=150;
   const body=field(doc,grid,t.body,"body","textarea",null,true);body.input.maxLength=8000;
   const note=field(doc,grid,t.note,"note","textarea",null,true);note.input.maxLength=2500;
   const sched=field(doc,grid,t.when,"recurrence","select",[["none",t.none],["annual",t.annual],["season",t.season]]);
   const mmdd=field(doc,grid,t.mmdd,"mmdd","input");
   mmdd.input.placeholder="MM-DD";mmdd.input.maxLength=5;mmdd.input.pattern="\\d{2}-\\d{2}";
   const season=field(doc,grid,t.whichSeason,"season","select",
     MY_CUSTOMS_SEASONS.map(s=>[s,(SEASON_LABELS[s]||[s,s])[fr?1:0]]));
   const sync=()=>{
     const isCanonical=type.input.value==="canonical",kind=sched.input.value;
     type.input.disabled=Boolean(editing);
     canonical.label.hidden=!isCanonical;
     title.label.hidden=isCanonical;body.label.hidden=isCanonical;
     title.input.required=!isCanonical;
     canonical.input.required=isCanonical;
     mmdd.label.hidden=kind!=="annual";mmdd.input.required=kind==="annual";
     season.label.hidden=kind!=="season";
   };
   type.input.addEventListener("change",sync);sched.input.addEventListener("change",sync);
   const active=store.list().find(x=>x.id===editing);
   if(active){
     type.input.value=active.origin==="canonical"?"canonical":"personal:"+active.kind;
     canonical.input.value=active.customId||articles[0]?.id||"";
     title.input.value=active.title;body.input.value=active.body;note.input.value=active.note;
     sched.input.value=active.schedule.kind;
     mmdd.input.value=active.schedule.mmdd||"";
     season.input.value=active.schedule.season||MY_CUSTOMS_SEASONS[0];
   }
   sync();
   form.append(grid);
   const notice=node(doc,"p",error||(!store.available?t.unavailable:""),"myc-error");
   notice.hidden=!error&&store.available;notice.setAttribute("role","alert");form.append(notice);
   const actions=node(doc,"div","","myc-actions"),submit=node(doc,"button",active?t.update:t.save,"myc-save");
   submit.type="submit";submit.disabled=!store.available;actions.append(submit);
   if(active){
     const cancel=node(doc,"button",t.cancel);cancel.type="button";
     cancel.addEventListener("click",()=>{editing=null;error="";render()});actions.append(cancel);
   }form.append(actions);
   form.addEventListener("submit",event=>{
     event.preventDefault();
     const isCanonical=type.input.value==="canonical",rec=sched.input.value;
     const schedule=rec==="annual"?{kind:"annual",mmdd:mmdd.input.value.trim()}:
       rec==="season"?{kind:"season",season:season.input.value}:{kind:"none"};
     const entry={origin:isCanonical?"canonical":"personal",kind:isCanonical?"custom":type.input.value.split(":")[1],
       customId:canonical.input.value,title:title.input.value,body:body.input.value,
       note:note.input.value,schedule};
     try{
       if(editing)store.update(editing,entry);else store.add(entry);
       editing=null;error="";render();
     }catch(err){error=String(err?.message||t.error);notice.textContent=error;notice.hidden=false}
   });
   wrap.append(formTitle,form,node(doc,"p",t.disclaimer,"myc-info"));
   const list=store.list();
   wrap.append(node(doc,"h2",t.saved+" ("+list.length+")"));
   if(!list.length)wrap.append(node(doc,"p",t.empty));
   else for(const item of list)wrap.append(savedCard(item));
   dialog.append(wrap);
 }
 dialog.addEventListener("close",()=>{
   dialog.remove();try{previousFocus?.focus?.({preventScroll:true})}catch{}
 },{once:true});
 render();
 try{if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","")}
 catch{dialog.setAttribute("open","")}
 dialog.querySelector("button")?.focus?.({preventScroll:true});
 return true;
}
