import {findObservedMassSource,composeObservedMassSelection} from "./observed-mass-source.js";

// A source-date finder for the Mass *actually celebrated* on any actual date.
// It leaves the canonical calendar and the established votive/Requiem/Nuptial
// catalogue alone. The user reports what is observed: this UI does not
// certify an external solemnity, local permission or church indult.
export function mountObservedMassSourceSelector({
 doc=globalThis.document,getResolvedMass,resolveDay,recoverProper,
 language=()=> "en",onSelectionChange=()=>{},
}={}){
 if(!doc?.body||typeof getResolvedMass!=="function")
   throw new TypeError("Observed Mass selector requires a live host");
 let root=null,disposed=false,observer=null,latestDate=null,latestHostChoice=null;
 let candidate=null,selection=null,pending=false,request=0,message="",sourceDate="",sundayChoice="UNDECIDED";
 const flow=()=>doc.getElementById("ao-mass-flow-v1");
 const anchor=()=>flow()?.querySelector(".aoFlowActions");
 const fr=()=>String(language()).toLowerCase().startsWith("fr");
 const t=(en,frText)=>fr()?frText:en;
 const keyFor=mass=>[
   mass?.celebrationId??"mass_of_day",mass?.requestedCelebrationId??"mass_of_day",
   mass?.celebrationType??"CALENDAR"].join("|");
 function clear({notify=true,eraseDate=false}={}){
  ++request;candidate=null;selection=null;pending=false;sundayChoice="UNDECIDED";
  if(eraseDate)sourceDate="";
  message="";
  if(notify)onSelectionChange();
 }
 function selectionFor(base=getResolvedMass()){
   return selection?.massDate===base?.date && keyFor(base)===latestHostChoice
     ?selection:null;
 }
 function effectiveResolvedMass(base=getResolvedMass()){
   return selectionFor(base)?.legacy??base;
 }
 function update(){
   if(disposed)return;
   const base=getResolvedMass(),massDate=String(base?.date??"");
   const key=keyFor(base);
   if(latestDate!==null&&massDate!==latestDate){
     clear({notify:true,eraseDate:true});
   }else if(latestHostChoice!==null&&key!==latestHostChoice){
     clear({notify:true});
   }
   latestDate=massDate;latestHostChoice=key;
   const target=anchor();
   if(!target)return;
   if(!root?.isConnected){
     root=doc.createElement("section");root.className="aoObservedMassPicker";
     root.dataset.aoObservedMassPicker="";
     root.setAttribute("aria-label","Mass actually celebrated");
     root.innerHTML='<details data-observed-details>'+
       '<summary data-observed-heading></summary>'+
       '<p data-observed-explainer></p>'+
       '<div class="aoObservedMassRow"><label><span data-observed-date-label></span>'+
       '<input type="date" data-observed-date></label>'+
       '<button type="button" data-observed-lookup></button></div>'+
       '<div data-observed-candidate hidden></div>'+
       '<label data-observed-sunday-label hidden><span data-observed-sunday-heading></span>'+
       '<select data-observed-sunday-choice>'+
       '<option value="UNDECIDED"></option>'+
       '<option value="COMMEMORATE_SUNDAY"></option>'+
       '<option value="NO_SUNDAY_COMMEMORATION"></option>'+
       '</select></label>'+
       '<div class="aoObservedMassRow"><button type="button" data-observed-select disabled></button>'+
       '<button type="button" data-observed-clear></button></div>'+
       '<p data-observed-status role="status"></p>'+
       '<p data-observed-source-note></p>'+
       '</details>';
     root.addEventListener("change",event=>{
       const element=event.target;
       if(element?.matches?.("[data-observed-date]")){
         sourceDate=element.value;clear();update();
       }
       if(element?.matches?.("[data-observed-sunday-choice]")){
         sundayChoice=element.value;
         selection=null;onSelectionChange();update();
       }
     });
     root.addEventListener("click",event=>{
       const button=event.target?.closest?.("button");
       if(!button)return;
       event.preventDefault();
       if(button.matches("[data-observed-clear]")){clear({eraseDate:true});update();return;}
       if(button.matches("[data-observed-lookup]")){void lookup();return;}
       if(button.matches("[data-observed-select]")){void choose();return;}
     });
     target.insertAdjacentElement("beforebegin",root);
   }
   const active=selectionFor(base);
   root.querySelector("[data-observed-heading]").textContent=active?
     t("Actual Mass: ","Messe célébrée : ")+active.title:
     t("Different Mass actually celebrated","Autre messe effectivement célébrée");
   root.querySelector("[data-observed-explainer]").textContent=t(
    "If the church celebrates a Proper other than today's calendar Mass, find its liturgical source day. This does not change today's calendar or claim a feast was transferred.",
    "Si l’église célèbre un autre propre que celui du jour, recherchez la date liturgique de sa source. Cela ne change ni le calendrier ni la date de la fête.");
   root.querySelector("[data-observed-date-label]").textContent=t("Source feast / Mass date","Date de la fête ou de la messe source");
   root.querySelector("[data-observed-date]").value=sourceDate;
   root.querySelector("[data-observed-lookup]").textContent=t("Find Proper","Chercher le propre");
   const c=root.querySelector("[data-observed-candidate]");
   c.hidden=!candidate;
   c.textContent=candidate?candidate.title+" · "+candidate.sourceDate+" · "+candidate.sourcePath:"";
   const sunday=Boolean(candidate&&massDate!==sourceDate&&
     new Date(massDate+"T12:00:00Z").getUTCDay()===0);
   const sundayLabel=root.querySelector("[data-observed-sunday-label]");
   sundayLabel.hidden=!sunday;
   root.querySelector("[data-observed-sunday-heading]").textContent=t(
     "Sunday commemoration (consult the parish's actual formulary)",
     "Mémoire du dimanche (vérifier le formulaire réellement célébré)");
   const choices=root.querySelector("[data-observed-sunday-choice]");
   choices.value=sundayChoice;
   choices.options[0].text=t("Choose an option","Choisir une option");
   choices.options[1].text=t("Include Sunday's Collect, Secret and Postcommunion",
     "Ajouter collecte, secrète et postcommunion du dimanche");
   choices.options[2].text=t("No Sunday commemoration in this celebration",
     "Pas de mémoire du dimanche dans cette célébration");
   root.querySelector("[data-observed-select]").textContent=t("Use this Mass's Proper","Utiliser ce propre");
   root.querySelector("[data-observed-select]").disabled=pending||!candidate||base?.canStart!==true||
     (sunday&&sundayChoice==="UNDECIDED");
   root.querySelector("[data-observed-clear]").textContent=t("Use Mass of the day","Revenir à la messe du jour");
   root.querySelector("[data-observed-status]").textContent=pending?t("Resolving source texts…","Résolution des textes sources…"):
     message|| (active?t("Selected for this Mass only · not the calendar of the day.",
       "Choisi uniquement pour cette messe, sans modifier le calendrier."):"");
   root.querySelector("[data-observed-source-note]").textContent=t(
    "This follows the Mass you report attending; it does not independently establish rubrical permission, local indults or external solemnity. The reader refuses incomplete source texts.",
    "Ce choix suit la messe à laquelle vous assistez ; il ne certifie ni permission rubricale, ni indult local, ni solennité extérieure. Le lecteur refuse les textes sources incomplets.");
   root.dataset.aoObservedSourceSelected=String(Boolean(active));
   if(active)root.querySelector("[data-observed-details]").open=true;
 }
 async function lookup(){
   const token=++request,base=getResolvedMass(),massDate=base?.date;
   candidate=null;selection=null;pending=true;message="";onSelectionChange();update();
   try{
     const result=await findObservedMassSource({
       massDate,sourceDate,resolveDay,recoverProper,language:language(),
     });
     if(disposed||token!==request||getResolvedMass()?.date!==massDate)return;
     candidate=result;sundayChoice="UNDECIDED";
   }catch(error){
     if(disposed||token!==request)return;
     message=t("Proper unavailable: ","Propre indisponible : ")+String(error?.message??error);
   }finally{
     if(token===request){pending=false;update();}
   }
 }
 async function choose(){
   if(!candidate||pending)return;
   const token=++request,base=getResolvedMass();
   pending=true;message="";update();
   try{
     const chosen=await composeObservedMassSelection(candidate,{
       baseLegacy:base,sundayChoice,resolveDay,recoverProper,language:language(),
     });
     if(disposed||token!==request||getResolvedMass()?.date!==base.date)return;
     selection=chosen;message="";onSelectionChange();
   }catch(error){
     if(disposed||token!==request)return;
     selection=null;
     message=t("Cannot use this Proper: ","Impossible d’utiliser ce propre : ")+String(error?.message??error);
   }finally{
     if(token===request){pending=false;update();}
   }
 }
 const schedule=()=>queueMicrotask(update);
 doc.addEventListener("click",schedule);
 doc.addEventListener("change",schedule);
 observer=typeof doc.defaultView?.MutationObserver==="function"?
   new doc.defaultView.MutationObserver(records=>{
     if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&
       (node.id==="ao-mass-flow-v1"||node.matches?.(".aoFlowActions")||
        node.querySelector?.("#ao-mass-flow-v1,.aoFlowActions")))))schedule();
   }):null;
 observer?.observe(doc.body,{subtree:true,childList:true});
 update();
 return Object.freeze({
  update,selectionFor,effectiveResolvedMass,
  clear:()=>{clear();update();},
  status:()=>Object.freeze({date:latestDate,sourceDate,selected:selection?.sourcePath??null,pending,hasCandidate:Boolean(candidate)}),
  dispose(){disposed=true;++request;doc.removeEventListener("click",schedule);doc.removeEventListener("change",schedule);observer?.disconnect();root?.remove();}
 });
}
