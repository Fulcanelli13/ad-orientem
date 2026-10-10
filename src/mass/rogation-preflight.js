import { rogationProperReady, majorLitanyVotiveReady } from "./rogation-mass-selection.js";
import { isLesserRogationDay, isMajorLitanyDay, litanyObservanceOn } from "./litany-dates.js";
export { isLesserRogationDay, isMajorLitanyDay, majorLitanyDate, litanyObservanceOn } from "./litany-dates.js";

// Eligibility describes the liturgical observance, NEVER selects a procession.
// The actual DayResolver can appoint a saint on a Minor Rogation weekday:
// for example, St Monica III class on 2027-05-04. Public Litanies
// still belong to that weekday; the II-class processional Mass has
// a separate impediment gate on a I-class celebration.
export function resolvedRogationCandidate(legacy, resolvedDay=null,{requireResolver=false}={}){
  const normalized=resolvedDay?.proper?.data??null;
  const rank=Number(resolvedDay?.day?.main?.rank??legacy?.calendarRank??legacy?.calendarDay?.rank);
  const source=String(normalized?.sourcePath??normalized?.meta?.path??
    legacy?.properSource??legacy?.calendarDay?.path??"");
  const validRank=[1,2,3,4].includes(rank);
  const verifiedDay=resolvedDay?.status==="ready" &&
    resolvedDay?.proper?.status==="ready" &&
    (resolvedDay?.date==null||resolvedDay.date===legacy?.date) &&
    validRank && typeof normalized?.sourcePath==="string" &&
    normalized.sourcePath.length>0;
  // Legacy fallback is conservative: only the familiar IV-class Feria is
  // admitted without independent proof from the shared DayResolver.
  const legacyFeria=rank===4 && source==="Tempora/Pasc5-0";
  const observance=litanyObservanceOn(legacy?.date);
  const eligible=legacy?.canStart===true && observance!==null &&
    (legacy?.requestedCelebrationId??"mass_of_day")==="mass_of_day" &&
    (requireResolver?verifiedDay:(verifiedDay||legacyFeria&&observance==="MINOR"));
  return Object.freeze({
    eligible,date:eligible?legacy.date:null,dayClass:eligible?rank:null,
    observance:eligible?observance:null,
    votiveAllowed:eligible&&rank!==1,
    defaultProperSource:eligible?source:null,
    authority:verifiedDay?"DAY_RESOLVER":eligible?"LEGACY_FERIA_PREFLIGHT":null
  });
}
export function rogationPrefaceReady(preface){
  if(preface?.schema!=="AO_1962_ROGATION_EASTER_PREFACE_V1" ||
    preface?.status!=="PUBLISHED_1962_EASTER_PREFACE"||
    preface?.published!==true || preface?.publicationAllowed!==true ||
    preface?.selection!=="IN_HOC_POTISSIMUM" ||
    !preface?.source?.url || !preface?.source?.edition)return false;
  const t=preface.text;
  return ["lat","en","fr"].every(k=>typeof t?.[k]==="string"&&t[k].trim().length>100)&&
    /in hoc potissimum/i.test(t.lat)&&
    !/in hac potissimum die|in hac potissimum nocte/i.test(t.lat);
}
export async function loadRogationPreflightLibrary({
  fetchImpl=globalThis.fetch,baseUrl=import.meta.url
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("ROGATION_FETCH_REQUIRED");
  const paths=[
    "../../data/mass/rogation-proper-source-gate.v1.json",
    "../../data/mass/rogation-proper-trilingual.v1.json",
    "../../data/mass/rogation-easter-preface.v1.json",
    "../../data/mass/major-litany-release-gate.v1.json"
  ];
  const out=await Promise.all(paths.map(async path=>{
    const response=await fetchImpl(new URL(path,baseUrl));
    if(!response?.ok)throw new Error("ROGATION_SOURCE_UNAVAILABLE");
    return response.json();
  }));
  return Object.freeze({sourceGate:out[0],sourceProper:out[1],preface:out[2],majorGate:out[3]});
}
export function rogationPublicChoiceReady(library){
  return Boolean(rogationProperReady(library?.sourceGate,library?.sourceProper) &&
    rogationPrefaceReady(library?.preface));
}
export function majorRogationPublicChoiceReady(library,candidate){
  return majorLitanyVotiveReady({
    date:candidate?.date,dayClass:candidate?.dayClass,
    observance:candidate?.observance,majorGate:library?.majorGate,
    sourceGate:library?.sourceGate,sourceProper:library?.sourceProper,
    preface:library?.preface
  });
}
export function projectRogationPreflight({
 legacy,choice="DAY_MASS",service=null,library=null,
 resolvedDay=null,requireResolver=false
}={}){
  const candidate=resolvedRogationCandidate(legacy,resolvedDay,{requireResolver});
  if(!candidate.eligible)return Object.freeze({visible:false,choice:"DAY_MASS",selection:null});
  if(![null,"PUBLIC_PROCESSION","ORDINARY_AUTHORIZED_SUPPLICATIONS"].includes(service))
    throw new Error("ROGATION_PUBLIC_SERVICE_INVALID");
  if(!["DAY_MASS","ROGATION_MASS"].includes(choice))throw new Error("ROGATION_CHOICE_INVALID");
  const available=candidate.votiveAllowed && (candidate.observance==="MAJOR"?
    majorRogationPublicChoiceReady(library,candidate):rogationPublicChoiceReady(library));
  if(choice==="ROGATION_MASS"&&!candidate.votiveAllowed)return Object.freeze({
    visible:true,available:false,choice,selection:null,reason:"VOTIVE_II_CLASS_IMPEDED"
  });
  if(choice==="ROGATION_MASS"&&candidate.observance==="MAJOR"&&!available)return Object.freeze({
    visible:true,available:false,choice,selection:null,reason:"MAJOR_LITANY_VOTIVE_NOT_SOURCE_CERTIFIED"
  });
  if(choice==="ROGATION_MASS"&&!available)return Object.freeze({
    visible:true,available:false,choice,selection:null,reason:"PROPER_OR_PREFACE_UNPUBLISHED"
  });
  const selection=choice==="DAY_MASS"&&service===null?null:{
    choice,observanceConfirmed:true,observance:candidate.observance,dayClass:candidate.dayClass,service,
    ...(choice==="ROGATION_MASS"?{
      sourceGate:library.sourceGate,sourceProper:library.sourceProper,
      ...(candidate.observance==="MAJOR"?{
        majorGate:library.majorGate,sourcePreface:library.preface
      }:{}),
      preface:{
        ...library.preface.text,
        sourceRef:library.preface.source.edition,
        sourceUrl:library.preface.source.url
      }
    }:{})
  };
  if(choice==="ROGATION_MASS"&&!service)return Object.freeze({
    visible:true,available,choice,selection:null,reason:"PUBLIC_RITE_NOT_SELECTED"
  });
  return Object.freeze({visible:true,available,choice,selection});
}

export function mountRogationPreflight({doc,getResolvedMass,resolveDay=null,fetchImpl=globalThis.fetch,language=()=> "en"}={}){
  if(!doc?.createElement||typeof getResolvedMass!=="function")throw new TypeError("Rogation DOM and resolver required");
  let choice="DAY_MASS",service=null,library=null,loading=false,disposed=false,root=null,lastDate=null;
  let verifiedDay=null,verifiedDate=null,pendingDate=null,loadError=null;
  const container=()=>doc.getElementById("ao-mass-flow-v1");
  const mount=()=>container()?.querySelector(".aoFlowActions")??container()?.querySelector("[data-ao-start-live]")?.parentElement;
  const labels=()=>String(language()).startsWith("fr")?{
    summary:"Observance des Rogations",summaryMajor:"Litanies majeures",service:"Office public",none:"Sans litanies publiques",
    procession:"Procession publique",supplications:"Supplications publiques autorisées",
    mass:"Messe",day:"Messe du jour",proper:"Messe des Rogations · Exaudivit",
    properMajor:"Messe des Litanies majeures · Exaudivit",
    ready:"La messe des Rogations exige des litanies publiques expressément choisies.",
    blocked:"Le propre des Rogations n'est pas encore certifié ; la messe du jour reste possible après les litanies publiques.",
    loading:"Vérification du propre et de la préface…",
    unavailable:"Les sources des Rogations ne peuvent être chargées ; la messe du jour reste disponible.",
    impeded:"Une célébration de Ire classe empêche la messe votive des Rogations ; la messe du jour demeure possible après les litanies publiques.",
    majorBlocked:"La messe votive propre aux Litanies majeures n'est pas encore certifiée. Après une procession ou des supplications publiques, la messe du jour peut être célébrée."
  }:{
    summary:"Rogation observance",summaryMajor:"Greater Litanies",service:"Public rite",none:"No public litanies",
    procession:"Public procession",supplications:"Authorized public supplications",
    mass:"Mass",day:"Mass of the day",proper:"Rogation Mass · Exaudivit",
    properMajor:"Greater Litany Mass · Exaudivit",
    ready:"The Rogation Mass requires explicitly selected public litanies.",
    blocked:"The Rogation Proper is not yet certified; the Mass of the day remains available after public litanies.",
    loading:"Checking the Proper and Easter Preface…",
    unavailable:"The Rogation source files could not be loaded; the Mass of the day remains available.",
    impeded:"A first-class celebration prevents the Rogation votive Mass; the Mass of the day remains available after public litanies.",
    majorBlocked:"The separate Greater Litany votive Mass is not yet certified for this season. The Mass of the day remains available after an explicitly selected public rite."
  };
  function refresh(){
    if(disposed)return;
    let legacy=null;try{legacy=getResolvedMass()}catch{return}
    const date=legacy?.date??null;
    if(date!==lastDate){
      choice="DAY_MASS";service=null;lastDate=date;
      verifiedDate=null;verifiedDay=null;pendingDate=null;
    }
    if(typeof resolveDay==="function"&&litanyObservanceOn(date)!==null&&
      legacy?.canStart===true&&verifiedDate!==date&&pendingDate!==date){
      pendingDate=date;
      void Promise.resolve().then(()=>resolveDay(date)).then(day=>{
        if(disposed||lastDate!==date)return;
        verifiedDay=day;verifiedDate=date;pendingDate=null;refresh();
      }).catch(()=>{
        if(disposed||lastDate!==date)return;
        verifiedDay={status:"unavailable"};verifiedDate=date;pendingDate=null;refresh();
      });
    }
    const candidate=resolvedRogationCandidate(legacy,
      verifiedDate===date?verifiedDay:null,{requireResolver:typeof resolveDay==="function"});
    if(!candidate.eligible){root?.remove();root=null;choice="DAY_MASS";service=null;return}
    const anchor=mount();if(!anchor)return;
    if(root&&!root.isConnected)root=null;
    if(!root){
      root=doc.createElement("details");
      root.className="aoRogationPreflight";
      root.setAttribute("data-ao-rogation-preflight","");
      root.innerHTML='<summary>Rogation observance</summary><label>Public rite <select data-rogation-service><option value="">No public litanies</option><option value="PUBLIC_PROCESSION">Public procession</option><option value="ORDINARY_AUTHORIZED_SUPPLICATIONS">Authorized public supplications</option></select></label><label>Mass <select data-rogation-choice><option value="DAY_MASS">Mass of the day</option><option value="ROGATION_MASS">Rogation Mass · Exaudivit</option></select></label><p data-rogation-status role="status"></p>';
      root.style.cssText="margin:9px 0;padding:12px 14px;border:1px solid var(--liturgical-border,rgba(197,174,116,.28));border-radius:12px;background:var(--liturgical-soft,rgba(255,255,255,.025));color:var(--text,#ede4d9);font:inherit";
      root.querySelector("summary").style.cssText="cursor:pointer;font-weight:600;min-height:44px;line-height:44px;display:list-item";
      root.querySelectorAll("label").forEach(x=>x.style.cssText="display:block;margin-top:11px;font-size:.83rem");
      root.querySelectorAll("select").forEach(x=>x.style.cssText="display:block;min-height:44px;max-width:100%;margin-top:4px;padding:8px;border:1px solid var(--liturgical-border,rgba(255,255,255,.2));border-radius:8px;background:var(--surface-1,#12202c);color:inherit");
      root.addEventListener("change",e=>{
        if(e.target?.matches?.("[data-rogation-service]"))service=e.target.value||null;
        if(e.target?.matches?.("[data-rogation-choice]"))choice=e.target.value;
        refresh();
      });
      anchor.insertAdjacentElement("beforebegin",root);
    }
    const enabled=candidate.votiveAllowed && (candidate.observance==="MAJOR"?
      majorRogationPublicChoiceReady(library,candidate):rogationPublicChoiceReady(library));
    const dedicated=root.querySelector('[data-rogation-choice] option[value="ROGATION_MASS"]');
    dedicated.disabled=!enabled;
    if(!enabled&&choice==="ROGATION_MASS")choice="DAY_MASS";
    const l=labels();
    root.querySelector("summary").textContent=candidate.observance==="MAJOR"?l.summaryMajor:l.summary;
    const services=root.querySelector("[data-rogation-service]");
    services.closest("label").firstChild.textContent=l.service+" ";
    services.options[0].textContent=l.none;
    services.options[1].textContent=l.procession;
    services.options[2].textContent=l.supplications;
    const masses=root.querySelector("[data-rogation-choice]");
    masses.closest("label").firstChild.textContent=l.mass+" ";
    masses.options[0].textContent=l.day;
    masses.options[1].textContent=candidate.observance==="MAJOR"?l.properMajor:l.proper;
    root.querySelector("[data-rogation-service]").value=service??"";
    root.querySelector("[data-rogation-choice]").value=choice;
    root.querySelector("[data-rogation-status]").textContent=loadError?l.unavailable:
      loading?l.loading:!candidate.votiveAllowed?l.impeded:
      candidate.observance==="MAJOR"&&!enabled?l.majorBlocked:
      enabled?l.ready:l.blocked;
    if(!loading&&!library){
      loading=true;
      void loadRogationPreflightLibrary({fetchImpl}).then(value=>{
        library=value;loadError=null;refresh();
      }).catch(error=>{
        library={};loadError=String(error?.message??error);refresh();
      }).finally(()=>{loading=false;refresh()});
    }
  }
  function selectionFor(legacy){
    const snapshot=projectRogationPreflight({
      legacy,choice,service,library,
      resolvedDay:verifiedDate===legacy?.date?verifiedDay:null,
      requireResolver:typeof resolveDay==="function"
    });
    if(snapshot.choice==="ROGATION_MASS"&&!snapshot.available)
      throw new Error(snapshot.reason??"ROGATION_PROPER_NOT_PUBLISHED");
    return snapshot.selection;
  }
  refresh();
  const observer=typeof doc.defaultView?.MutationObserver==="function"?
    new doc.defaultView.MutationObserver(records=>{
      if(records.some(record=>[...record.addedNodes].some(node=>
        node.nodeType===1 && (node.id==="ao-mass-flow-v1" ||
          node.querySelector?.("#ao-mass-flow-v1")))))refresh();
    }):null;
  observer?.observe(doc.body,{childList:true,subtree:true});
  return Object.freeze({refresh,selectionFor,
    status:()=>Object.freeze({verifiedDate,lastDate,ready:rogationPublicChoiceReady(library),
      sourceError:loadError,sourceLoading:loading,visible:Boolean(root?.isConnected)}),
    dispose(){
    disposed=true;observer?.disconnect();root?.remove();root=null;
  }});
}
