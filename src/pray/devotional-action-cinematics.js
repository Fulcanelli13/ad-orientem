// Shared non-Mass cinematic owner. It never determines prayer text, day,
 // custom, posture or the ceremonial occurrence of an external public rite.
import {resolveCanonicalAssetUrl} from "../assets/asset-registry.js";
import "./devotional-action-cinematic-styles.js";
export const DEVOTIONAL_ACTION_CINEMATIC_VERSION="devotional-action-v1";
const norm=v=>String(v??"").trim();
const fixed=(id,kind,assetId,latin,en,fr,sourceCue)=>Object.freeze({
  id,kind,assetId,latin,sourceCue,labels:Object.freeze({en,fr}),
  decorative:true,observedNow:false,canonicalAuthority:false,
  assertsPerformedGesture:false,
});
export function resolveDevotionalActionScene({
  view=null,form=null,cardId=null,cue=null,posture=null,
  adorationMode=null,visitStep=null,benedictionStage=null,
  stationStep=null,stationRitual=null,
}={}){
  // Angelus has one exact owner: angelus-cinematic-policy.js and
  // devotional-cinematic.js (PR #1196). Do not create a second gesture.
  if(view==="angelus")return null;
  if(view==="benediction"){
    // A user-selected stage is not independent observation of the blessing.
    if(benedictionStage!=="blessing")return null;
    return fixed("BENEDICTION.BLESSING","SOLEMN_ACTION","ao-live-blessing","Benedictio",
      "Attend to the Eucharistic blessing","Recueillez-vous pour la Bénédiction eucharistique",
      "BENEDICTION.PUBLIC_STAGE.BLESSING");
  }
  if(view==="adoration"){
    if(adorationMode==="visit" && visitStep===0)return fixed(
      "VISIT.ARRIVAL","REVERENCE","ao-live-genuflect",null,
      "Make the appropriate reverence","Faites la révérence appropriée",
      "ADORATION.VISIT.ARRIVAL");
    // Open Adoration is not necessarily Exposition or Benediction, and
    // remaining in silent prayer does not prescribe a change of posture.
    return null;
  }
  if(view==="stations"){
    // The current St Alphonsus reader provides no certified kneel/bow
    // records per Station. Explicitly do NOT synthesize 14 genuflections.
    if(stationRitual?.certified!==true ||
       !["KNEEL","STAND","GENUFLECT","BOW","PROFOUND_BOW"].includes(stationRitual?.action) ||
       !Number.isInteger(stationStep)||stationStep<0||stationStep>13)return null;
    const labels={KNEEL:["Kneel","Mettez-vous à genoux"],
      STAND:["Stand","Levez-vous"],GENUFLECT:["Genuflect","Faites la génuflexion"],
      BOW:["Bow your head","Inclinez la tête"],
      PROFOUND_BOW:["Bow profoundly","Inclinez-vous profondément"]};
    const icon={KNEEL:"ao-live-kneel",STAND:"ao-live-stand",
      GENUFLECT:"ao-live-genuflect",BOW:"ao-live-head-bow",
      PROFOUND_BOW:"ao-live-profound-bow"}[stationRitual.action];
    const [en,fr]=labels[stationRitual.action];
    return fixed("STATIONS."+stationStep+"."+stationRitual.action,"POSTURE",icon,null,
      en,fr,norm(stationRitual.sourceCueId));
  }
  return null;
}
export function approvedOpeningArtworkPool(records=[],subject="ANNUNCIATION"){
  const target=norm(subject).toUpperCase();
  return Object.freeze((Array.isArray(records)?records:[]).filter(record=>
    record?.approval==="APPROVED" &&
    Number(record?.rating)>=3 &&
    norm(record?.subject).toUpperCase()===target &&
    typeof record?.localPath==="string" &&
    /^assets\/[a-zA-Z0-9_./-]+\.(?:webp|jpg|jpeg|png)$/.test(record.localPath) &&
    !record.localPath.includes("..") &&
    typeof record?.artist==="string" && typeof record?.title==="string"
  ).map(r=>Object.freeze({id:r.id,localPath:r.localPath,title:r.title,artist:r.artist})));
}
export function selectSessionArtwork(pool=[],previousId=null,random=Math.random){
  const eligible=pool.filter(x=>x?.id);
  if(!eligible.length)return null;
  const candidates=eligible.length>1?eligible.filter(x=>x.id!==previousId):eligible;
  const n=Number(random());
  return candidates[Math.min(candidates.length-1,Math.floor((Number.isFinite(n)?Math.max(0,n):0)*candidates.length))];
}
function make(doc,tag,cls,txt){
  const el=doc.createElement(tag);
  el.className=cls;
  if(txt!==undefined)el.textContent=txt;
  return el;
}
export function createDevotionalActionCinematic(win=globalThis){
  let lastKey=null,active=null,priorFocus=null;
  const reduced=()=>Boolean(win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    win.AO_CINEMATIC_V4312?.isReducedMotion?.());
  function dismiss(){
    const current=active;active=null;
    current?.remove();
    if(priorFocus?.isConnected)priorFocus.focus?.({preventScroll:true});
    priorFocus=null;
  }
  function reset(){dismiss();lastKey=null;}
  function sync(scene,{mount,language="en",sessionKey=""}={}){
    const key=scene?norm(sessionKey)+"|"+scene.id+"|"+scene.sourceCue:null;
    if(key===lastKey)return false;
    dismiss();lastKey=key;
    if(!scene || !mount?.isConnected)return false;
    const doc=mount.ownerDocument;
    const host=mount.closest("#aoPray435930");
    if(!host?.classList.contains("open"))return false;
    const overlay=make(doc,"section","aoDevotionalActionCinematic");
    overlay.dataset.aoActionScene=scene.id;
    overlay.dataset.aoActionKind=scene.kind;
    overlay.dataset.aoReducedMotion=String(reduced());
    overlay.setAttribute("role","group");
    overlay.setAttribute("aria-label",language==="fr"?"Indication de prière":"Prayer action cue");
    const inner=make(doc,"div","aoDevotionalActionInner");
    const kicker=make(doc,"small","aoDevotionalActionKicker",scene.kind==="POSTURE"
      ?(language==="fr"?"GESTE DE PRIÈRE":"PRAYER POSTURE")
      :(language==="fr"?"MOMENT SOLENNEL":"SOLEMN MOMENT"));
    inner.append(kicker);
    if(scene.assetId){
      const art=make(doc,"span","aoDevotionalActionIcon");
      const url=resolveCanonicalAssetUrl(scene.assetId);
      if(url){art.style.maskImage='url("'+url.replaceAll('"','%22')+'")';
        art.style.webkitMaskImage=art.style.maskImage;}
      else art.hidden=true; // never substitute a fake gesture icon
      art.setAttribute("aria-hidden","true");
      inner.append(art);
    }
    if(scene.latin)inner.append(make(doc,"p","aoDevotionalActionLatin",scene.latin));
    inner.append(make(doc,"h2","aoDevotionalActionTitle",scene.labels[language==="fr"?"fr":"en"]));
    const button=make(doc,"button","aoDevotionalActionContinue",language==="fr"?"Continuer la prière":"Continue prayer");
    button.type="button";
    button.addEventListener("click",dismiss);
    inner.append(button);overlay.append(inner);
    priorFocus=doc.activeElement;
    host.querySelector(".aoP435930Sheet")?.append(overlay);
    active=overlay;
    button.focus?.({preventScroll:true});
    return true;
  }
  return Object.freeze({sync,reset,dismiss,current:()=>active?.dataset.aoActionScene??null});
}
