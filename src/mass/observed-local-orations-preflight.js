import {select1962CommemorationsForMassForm} from "./1962-commemoration-form-source.js";
import {projectObservedLocalOrations,OBSERVABLE_ORATION_GROUPS} from "./1962-observed-local-orations.js";

// One-session, pre-Mass declaration of additional local orations. Source
// verification is independent of the parish's actual intended practice.
// No default, storage, LIVE controls or change to the normative 1962 selector.
export function mountObservedLocalOrationsPreflight({
  doc=globalThis.document,getResolvedMass,getSelectedForm,
  getCalendarResolution,language=()=> "en",mountTarget=()=>null,
  subscribeCalendarState=null,
}={}){
  if(!doc?.createElement||typeof getResolvedMass!=="function"||
     typeof getSelectedForm!=="function"||typeof getCalendarResolution!=="function")
    throw new TypeError("Observed local orations require a Mass and Calendar owner");
  let root=null,disposed=false,lastKey=null,confirmed=false;
  const selected=new Set();
  const t=(en,fr)=>String(language()).startsWith("fr")?fr:en;
  const norm=x=>String(x??"").trim().toLowerCase();

  function inspect(mass){
    const day=getCalendarResolution(),form=String(getSelectedForm()??"").toUpperCase();
    if(!mass||!day||day.status!=="ready"||day.date!==mass.date||
       !day.proper||mass.canStart!==true)return null;
    const standard=select1962CommemorationsForMassForm({
      proper:day.proper,calendarResolution:day,form,
      celebrationId:mass.celebrationId??"mass_of_day",
      isConventual:mass.conventualMass??false,
      observedSource:mass?.sourceDiagnostics?.actualMassSelection==="OBSERVED_SOURCE_DAY"
    });
    const commemoration=day.day?.commemorations?.[0];
    if(standard.status!=="CERTIFIED"||!commemoration?.id)return null;
    // A successful dry-run establishes exact date/source/omission/text
    // eligibility; it does NOT assert that the parish will say the prayer.
    const trial=projectObservedLocalOrations({
      originalProper:day.proper,selectedProper:standard.proper,
      calendarResolution:day,form,commemorationId:commemoration.id,
      observedGroups:["collects"],confirmedForThisCelebration:true
    });
    if(trial.status!=="OBSERVED_LOCAL_NOT_1962_NORMATIVE")return null;
    const raw=day.proper.data??day.proper;
    const key=[
      mass.date,form,norm(mass.celebrationId??"mass_of_day"),
      norm(mass.requestedCelebrationId??"mass_of_day"),
      norm(raw.sourcePath),norm(commemoration.id),
      String(language()).startsWith("fr")?"fr":"en",
    ].join("|");
    return Object.freeze({key,date:mass.date,form,
      commemorationId:commemoration.id,
      title:String(String(language()).startsWith("fr")?
        (commemoration.titleFr??commemoration.nameFr??commemoration.title??commemoration.name??commemoration.id):
        (commemoration.title??commemoration.name??commemoration.id))});
  }

  function reset(){selected.clear();confirmed=false;}
  function selectionFor(mass=getResolvedMass()){
    const available=inspect(mass);
    if(!available||lastKey!==available.key||selected.size===0)return null;
    if(!confirmed)throw new Error("LOCAL_ADDITIONAL_ORATIONS_NEED_EXPLICIT_CONFIRMATION");
    return Object.freeze({date:available.date,form:available.form,
      commemorationId:available.commemorationId,
      observedGroups:Object.freeze(OBSERVABLE_ORATION_GROUPS.filter(id=>selected.has(id))),
      confirmedForThisCelebration:true});
  }
  function refresh(){
    if(disposed)return;
    let mass=null;try{mass=getResolvedMass();}catch{return;}
    const available=inspect(mass);
    const key=available?.key??null;
    if(key!==lastKey){reset();lastKey=key;}
    const anchor=mountTarget();
    if(!anchor?.isConnected)return;
    if(!root?.isConnected){
      root=doc.createElement("section");
      root.dataset.aoObservedLocalOrations="";
      root.className="aoObservedLocalOrations";
      root.innerHTML='<details data-local-oration-details>'+
        '<summary data-local-oration-heading></summary>'+
        '<p data-local-oration-explanation></p>'+
        '<p data-local-oration-source></p>'+
        '<div data-local-oration-groups role="group"></div>'+
        '<label class="aoLocalOrationConfirm"><input type="checkbox" data-local-oration-confirm>'+
        '<span data-local-oration-confirm-label></span></label>'+
        '<p data-local-oration-feedback role="status"></p>'+
        '</details>';
      const groups=root.querySelector("[data-local-oration-groups]");
      for(const id of OBSERVABLE_ORATION_GROUPS){
        const label=doc.createElement("label");label.className="aoLocalOrationChoice";
        const input=doc.createElement("input");input.type="checkbox";
        input.dataset.localOrationGroup=id;
        const span=doc.createElement("span");span.dataset.localOrationLabel=id;
        label.append(input,span);groups.append(label);
      }
      root.addEventListener("change",event=>{
        const el=event.target;
        if(el?.matches?.("[data-local-oration-group]")){
          if(el.checked)selected.add(el.dataset.localOrationGroup);
          else selected.delete(el.dataset.localOrationGroup);
          // Affirmation must follow the final exact choice, not an old set.
          confirmed=false;refresh();
        }else if(el?.matches?.("[data-local-oration-confirm]")){
          confirmed=el.checked&&selected.size>0;
          refresh();
        }
      });
      anchor.insertAdjacentElement("beforebegin",root);
    }
    root.hidden=!available;
    if(!available)return;
    const labels={
      collects:t("Additional Collect","Collecte supplémentaire"),
      secrets:t("Additional Secret","Secrète supplémentaire"),
      postcommunions:t("Additional Postcommunion","Postcommunion supplémentaire")
    };
    root.querySelector("[data-local-oration-heading]").textContent=
      t("Additional local prayers","Prières locales supplémentaires");
    root.querySelector("[data-local-oration-explanation]").textContent=t(
      "Optional local practice, not the universal 1962 prescription. Select only prayers specifically confirmed for this celebration. An additional Collect does not imply an additional Secret or Postcommunion.",
      "Usage local facultatif, non prescrit par les rubriques universelles de 1962. Sélectionnez uniquement les prières confirmées pour cette célébration. Une collecte supplémentaire n'implique pas une secrète ni une postcommunion supplémentaires."
    );
    root.querySelector("[data-local-oration-source]").textContent=
      t("Calendar commemoration: ","Mémoire du calendrier : ")+available.title;
    for(const el of root.querySelectorAll("[data-local-oration-group]"))
      el.checked=selected.has(el.dataset.localOrationGroup);
    for(const el of root.querySelectorAll("[data-local-oration-label]"))
      el.textContent=labels[el.dataset.localOrationLabel];
    const checkbox=root.querySelector("[data-local-oration-confirm]");
    checkbox.checked=confirmed;
    checkbox.disabled=selected.size===0;
    root.querySelector("[data-local-oration-confirm-label]").textContent=t(
      "I have checked that exactly these additional prayers are intended at this Mass.",
      "J'ai vérifié que ces seules prières supplémentaires sont prévues à cette messe."
    );
    root.querySelector("[data-local-oration-feedback]").textContent=
      selected.size===0?t("Default: the 1962 form's ordinary prayer selection remains unchanged.",
        "Par défaut, les prières prévues pour cette forme selon 1962 restent inchangées.") :
      confirmed?t("Confirmed for this Mass only; source-verified words, local practice.",
        "Confirmé pour cette messe seulement ; textes vérifiés, usage local.") :
      t("Confirm the exact selection before entering Mass.",
        "Confirmez le choix exact avant d'entrer dans la messe.");
  }
  const onChange=()=>queueMicrotask(refresh);
  doc.addEventListener("change",onChange);
  const unsubscribe=typeof subscribeCalendarState==="function"?
    subscribeCalendarState(()=>queueMicrotask(refresh)):null;
  refresh();
  return Object.freeze({
    refresh,selectionFor,status:()=>Object.freeze({
      visible:Boolean(root?.isConnected&&!root.hidden),date:lastKey?.split("|")[0]??null,
      groups:Object.freeze([...selected]),confirmed,
      ready:selected.size===0||confirmed,
    }),
    dispose(){disposed=true;try{unsubscribe?.()}catch{}
      doc.removeEventListener("change",onChange);
      root?.remove();root=null;reset();}
  });
}
