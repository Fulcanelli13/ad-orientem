/**
 * One opening artwork per Angelus session, then a full, source-cued
 * Incarnation posture cinematic. Does not own prayer text or passage timing.
 */
import {
  selectAngelusOpeningArtwork,resolveAngelusArtworkImage,
  ANGELUS_CINEMATIC_VERSION,
} from "./angelus-cinematic-policy.js";
import {resolveCanonicalAssetUrl} from "../assets/asset-registry.js";
import "./devotional-cinematic-styles.js";

export const DEVOTIONAL_CINEMATIC_VERSION=ANGELUS_CINEMATIC_VERSION;
const sessions=new WeakMap();
let lastArtworkId=null;
function session(mount){
  let entry=sessions.get(mount);
  if(!entry){
    entry={openingShown:false,seenCues:new Set(),opening:null,posture:null,
      openingTimer:null};
    sessions.set(mount,entry);
  }
  return entry;
}
function create(doc,tag,cls,text){
  const el=doc.createElement(tag);el.className=cls;
  if(text!==undefined)el.textContent=text;
  return el;
}
function reduced(win){
  return Boolean(win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    win?.AO_CINEMATIC_V4312?.isReducedMotion?.() ||
    win?.AO_RUNTIME_V8?.store?.getState?.()?.settings?.reducedMotion);
}
function cleanupNode(node){node?.remove?.()}
function closeOpening(mount,win){
  const entry=session(mount);
  if(entry.openingTimer!=null)win?.clearTimeout?.(entry.openingTimer);
  entry.openingTimer=null;cleanupNode(entry.opening);entry.opening=null;
}
function closePosture(mount){
  const entry=session(mount);
  if(entry.posture){
    const focus=entry.posture.__aoPreviousFocus;
    cleanupNode(entry.posture);
    entry.posture=null;
    if(focus?.isConnected)focus.focus?.({preventScroll:true});
  }
}
export function resetDevotionalCinematicSession({mount,win=globalThis}={}){
  if(!mount)return;
  closeOpening(mount,win);
  closePosture(mount);
  sessions.delete(mount);
}
export function devotionalInterludePlan({form="angelus",card}={}){
  if(form!=="angelus"||card?.id!=="announcement")return null;
  return Object.freeze({id:"angelus-opening",title:card.title,
    latin:"Angelus Domini nuntiavit Mariæ",
    durationMs:3200,artworkOwner:"USER_REVIEWED_SACRED_ART",
    repeatPerCard:false});
}
/** Called only at the beginning (including a source-owned restored first card).
 * No later card will ever replay this image. If remote artwork cannot be
 * resolved we present a text-only opening rather than unapproved Tanner art.
 */
export function showDevotionalInterlude({
  mount,form="angelus",card,language="en",win=globalThis,
}={}){
  const plan=devotionalInterludePlan({form,card});
  const sheet=mount?.closest?.("#aoPray435930")?.querySelector?.(".aoP435930Sheet");
  if(!sheet||!plan)return false;
  const entry=session(mount);
  if(entry.openingShown)return false;
  entry.openingShown=true;
  const artwork=selectAngelusOpeningArtwork({lastId:lastArtworkId});
  // A title-only interstitial with a large empty image zone is an
  // interruption without art. Skip the opening tableau until a final
  // approved reproduction is available from the canonical catalogue.
  if(!artwork)return false;
  lastArtworkId=artwork.id;
  const doc=sheet.ownerDocument;
  const root=create(doc,"section","aoDevoCinematicInterstitial aoDevoCinematicOpening");
  root.dataset.aoDevotionalScene="opening";
  root.dataset.aoSceneArt=artwork?.id??"none";
  root.setAttribute("aria-label",language==="fr"?"Ouverture de l’Angélus":"Opening of the Angelus");
  root.style.setProperty("--ao-devo-duration",plan.durationMs+"ms");
  const imageZone=create(doc,"div","aoDevoCinematicImageZone");
  const heading=create(doc,"div","aoDevoCinematicHeading");
  heading.append(create(doc,"small","",language==="fr"?"ANGÉLUS":"ANGELUS"),
    create(doc,"h2","",language==="fr"?"L’Annonciation":"The Annunciation"),
    create(doc,"p","",plan.latin));
  if(artwork)heading.append(create(doc,"small","aoDevoCinematicCredit",
    artwork.artist+" · "+artwork.title));
  const skip=create(doc,"button","aoDevoCinematicSkip",
    language==="fr"?"Passer":"Continue");
  skip.type="button";
  skip.setAttribute("aria-label",language==="fr"?"Passer l’ouverture":"Continue to prayer");
  skip.addEventListener("click",()=>closeOpening(mount,win),{once:true});
  root.append(imageZone,heading,skip);
  doc.body.append(root);
  entry.opening=root;
  if(artwork){
    Promise.resolve(resolveAngelusArtworkImage(artwork,{fetchImpl:win?.fetch?.bind?.(win)}))
      .then(url=>{
        if(!url||entry.opening!==root)return;
        const img=create(doc,"img","aoDevoCinematicArtwork");
        img.alt="";img.setAttribute("aria-hidden","true");
        img.decoding="async";img.loading="eager";
        img.addEventListener("error",()=>{imageZone.dataset.aoArtFailed="true";img.remove()},{once:true});
        img.src=url;imageZone.append(img);
      }).catch(()=>{imageZone.dataset.aoArtFailed="true"});
  }else imageZone.dataset.aoArtAbsent="true";
  entry.openingTimer=win?.setTimeout?.(()=>closeOpening(mount,win),plan.durationMs);
  return true;
}
/** Folio v1: the certified Incarnation cue lives beside its prayer.
 * This is a presentation hint, not evidence of a performed gesture.
 * The caller supplies the actual focused verse; no timer invents a cue.
 */
export function showDevotionalParagraphCue({
  mount,cue,action=null,anchor=null,language="en",win=globalThis,
}={}){
  const card=mount?.querySelector?.(".aoDevoCard:not([hidden])");
  if(!card)return false;
  closePosture(mount); // retire legacy blocking scene, if any
  card.querySelectorAll(".aoFolioInlineGesture").forEach(node=>node.remove());
  card.removeAttribute("data-ao-gesture-cinematic");
  if(cue!=="profound-bow"||!action||
    action.id!=="ANGELUS.INCARNATION"||
    action.sourceCue!=="Et Verbum caro factum est")return true;
  const unit=anchor?.closest?.(".aoP435930PrayerUnit")||
    card.querySelector('[data-ao-incarnation="true"]');
  if(!unit||!card.contains(unit))return false;
  const doc=card.ownerDocument;
  const note=create(doc,"aside","aoFolioInlineGesture");
  note.dataset.aoDevotionalScene="incarnation-inline";
  note.dataset.aoPostureAction=action.action;
  note.dataset.aoSourceCue=action.sourceCue;
  note.dataset.aoReducedMotion=String(reduced(win));
  note.setAttribute("aria-label",language==="fr"?"Geste de l’Incarnation":"Incarnation gesture");
  const icon=create(doc,"span","aoFolioGestureIcon");
  icon.setAttribute("aria-hidden","true");
  const url=resolveCanonicalAssetUrl(action.iconAssetId);
  if(url){
    const masked='url("'+url.replaceAll('"',"%22")+'")';
    icon.style.maskImage=masked;icon.style.webkitMaskImage=masked;
  }else icon.hidden=true;
  const label=create(doc,"span","aoFolioGestureLabel",action.label);
  label.append(create(doc,"small","aoFolioGestureLatin","Et Verbum caro factum est"));
  note.append(icon,label);
  unit.after(note);
  card.dataset.aoGestureCinematic=action.action.toLowerCase();
  return true;
}
