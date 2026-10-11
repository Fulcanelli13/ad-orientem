// Progressive, artwork-agnostic Angelus / Regina Caeli cinematic reader.
// The canonical verses, prayer buttons, translation faces and ritual rails remain
// owned by presentation-runtime.js. This layer moves their existing DOM nodes.
import "./angelus-cinematic-styles.js";

export const ANGELUS_CINEMATIC_VERSION = "angelus-cinematic-v1";
export const ANGELUS_CINEMATIC_SCENES = Object.freeze({
  angelus: Object.freeze([
    {id:"annunciation",latin:"Angelus Domini",en:"The Annunciation",fr:"L’Annonciation",effect:"reveal"},
    {id:"fiat",latin:"Ecce ancilla Domini",en:"The Fiat",fr:"Le Fiat",effect:"camera"},
    {id:"incarnation",latin:"Et Verbum caro factum est",en:"The Incarnation",fr:"L’Incarnation",effect:"light"},
    {id:"collect",latin:"Oremus",en:"Concluding Prayer",fr:"Oraison finale",effect:"stillness"}
  ]),
  regina: Object.freeze([
    {id:"rejoice",latin:"Regina cæli, lætare",en:"Rejoice, O Queen",fr:"Réjouissez-vous, ô Reine",effect:"reveal"},
    {id:"resurrection",latin:"Resurrexit",en:"He Is Risen",fr:"Il est ressuscité",effect:"light"},
    {id:"intercession",latin:"Ora pro nobis",en:"Pray for Us",fr:"Priez pour nous",effect:"camera"},
    {id:"collect",latin:"Oremus",en:"Concluding Prayer",fr:"Oraison finale",effect:"stillness"}
  ])
});

export function planAngelusChapters(types,form="angelus"){
  const groups=[[],[],[],[]];
  if(!Array.isArray(types))return groups;
  if(form==="regina"){
    let scene=0;
    types.forEach((type,index)=>{
      if(type==="collect")scene=3;
      groups[Math.min(scene,3)].push(index);
      if(type==="vr"&&scene<2)scene++;
    });
  }else{
    let scene=0;
    types.forEach((type,index)=>{
      if(type==="collect"||scene>=3)scene=3;
      groups[scene].push(index);
      if(type==="hail"&&scene<3)scene++;
    });
  }
  return groups;
}

export function validLocalArtworkUrl(src){
  if(typeof src!=="string"||! /^(?:\/|\.\/)?assets\/[a-zA-Z0-9/_.-]+\.(?:jpg|jpeg|png|webp|avif)$/.test(src))return false;
  return !src.split("/").includes("..");
}
const t=(en,fr,locale)=>locale==="fr"?fr:en;
const docOf=win=>win?.document||null;
function el(doc,tag,className="",text=""){
  const n=doc.createElement(tag);
  if(className)n.className=className;
  if(text)n.textContent=text;
  return n;
}
function motionReduced(win){
  return !!(win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||
    win?.AO_CINEMATIC_V4312?.isReducedMotion?.()||
    win?.AO_RUNTIME_V8?.store?.getState?.()?.settings?.reducedMotion);
}
function artworkFor(win,form,id){
  const value=win?.AO_ANGELUS_ARTWORK_V1?.[form]?.[id];
  if(!value||!validLocalArtworkUrl(value.src))return null;
  return {src:value.src,alt:typeof value.alt==="string"?value.alt:"",credit:typeof value.credit==="string"?value.credit:""};
}
function transitionStill(win,frame,form,scene){
  const target=artworkFor(win,form,scene.id);
  if(!target)return;
  const doc=docOf(win);
  const overlay=el(doc,"div","aoAngelusCinemaInterstitial");
  overlay.setAttribute("aria-hidden","true");
  const still=el(doc,"img");
  still.src=target.src;
  still.alt="";
  overlay.append(still,el(doc,"div","aoAngelusCinemaInterstitialShade"),el(doc,"p","aoAngelusCinemaInterstitialTitle",scene.latin));
  frame.closest(".aoP435930Sheet")?.append(overlay);
  win.setTimeout?.(()=>overlay.remove(),1050);
}
export function installAngelusCinematic({win=globalThis,root=docOf(win),form="angelus",locale="en",initialStep=0,onStageChange=()=>{}}={}){
  const doc=docOf(win),sequence=root?.querySelector?.(".aoP435930AngelusSequence");
  if(!doc||!sequence)return null;
  if(sequence.dataset.aoCinematicEnhanced==="1")return sequence.__aoAngelusCinematic||null;
  const scenes=ANGELUS_CINEMATIC_SCENES[form]||ANGELUS_CINEMATIC_SCENES.angelus;
  const cards=[...sequence.children].filter(n=>n.classList?.contains("aoP435930PrayerUnit"));
  if(!cards.length)return null;
  const groups=planAngelusChapters(cards.map(n=>n.dataset.aoAngelusUnit),form);
  // A malformed or newly-expanded prayer must never silently lose its cards.
  if(groups.flat().length!==cards.length||new Set(groups.flat()).size!==cards.length)return null;

  const timeline=el(doc,"nav","aoAngelusCinemaTimeline");
  timeline.setAttribute("aria-label",t("Prayer timeline","Chronologie de la prière",locale));
  const timelineButtons=scenes.map((scene,index)=>{
    const button=el(doc,"button","aoAngelusCinemaMilestone");
    button.type="button";button.dataset.aoAngelusGoto=String(index);
    button.setAttribute("aria-label",(index+1)+" / "+scenes.length+" · "+scene[locale==="fr"?"fr":"en"]);
    button.append(el(doc,"span","aoAngelusCinemaNumber",["I","II","III","IV"][index]),
      el(doc,"span","aoAngelusCinemaMilestoneName",scene[locale==="fr"?"fr":"en"]));
    timeline.append(button);
    return button;
  });
  const frame=el(doc,"div","aoAngelusCinemaFrame");
  frame.setAttribute("aria-label",t("Sacred artwork scene","Scène d’art sacré",locale));
  const backdrop=el(doc,"div","aoAngelusCinemaBackdrop");
  backdrop.setAttribute("aria-hidden","true");
  const currentArtwork=el(doc,"div","aoAngelusCinemaArtLayer");
  currentArtwork.setAttribute("aria-hidden","true");
  const sheen=el(doc,"div","aoAngelusCinemaSheen");
  sheen.setAttribute("aria-hidden","true");
  const caption=el(doc,"div","aoAngelusCinemaCaption");
  const kicker=el(doc,"span","aoAngelusCinemaKicker",t("MARIAN PRAYER","PRIÈRE MARIALE",locale));
  const title=el(doc,"h2","aoAngelusCinemaTitle");
  const latin=el(doc,"p","aoAngelusCinemaLatin");
  caption.append(kicker,title,latin);
  const artCredit=el(doc,"small","aoAngelusCinemaCredit");
  frame.append(backdrop,currentArtwork,sheen,caption,artCredit);

  const container=el(doc,"div","aoAngelusCinemaChapters");
  const chapterNodes=groups.map((indices,index)=>{
    const group=el(doc,"section","aoAngelusCinemaChapter");
    group.dataset.aoAngelusChapter=String(index);
    group.setAttribute("aria-label",scenes[index][locale==="fr"?"fr":"en"]);
    indices.forEach(i=>group.append(cards[i]));
    container.append(group);
    return group;
  });

  const controls=el(doc,"div","aoAngelusCinemaControls");
  const prev=el(doc,"button","aoAngelusCinemaPrev","‹  "+t("Previous","Précédent",locale));
  const next=el(doc,"button","aoAngelusCinemaNext",t("Next","Suivant",locale)+"  ›");
  prev.type=next.type="button";
  prev.dataset.aoAngelusMove="-1";next.dataset.aoAngelusMove="1";
  const stepLabel=el(doc,"span","aoAngelusCinemaStepLabel");
  stepLabel.setAttribute("aria-live","polite");
  controls.append(prev,stepLabel,next);
  sequence.replaceChildren(timeline,frame,container,controls);
  sequence.dataset.aoCinematicEnhanced="1";
  sequence.dataset.aoCinematicForm=form;

  const mount=root.querySelector?.(".aoP435930Mount");
  let step=0,lastImg=null,lastArtworkSrc="";
  let touchStart=null;
  function placeArtwork(scene){
    const art=artworkFor(win,form,scene.id);
    const src=art?.src||"";
    if(src===lastArtworkSrc)return;
    lastArtworkSrc=src;
    if(lastImg){lastImg.remove();lastImg=null;}
    currentArtwork.replaceChildren();
    if(!art){frame.dataset.artwork="unselected";artCredit.textContent="";return;}
    const img=el(doc,"img","aoAngelusCinemaArtwork current");
    img.loading="eager";img.decoding="async";img.alt="";
    img.setAttribute("aria-hidden","true");
    img.src=art.src;
    lastImg=img;currentArtwork.append(img);
    frame.dataset.artwork="selected";
    frame.setAttribute("aria-label",art.alt||scene[locale==="fr"?"fr":"en"]);
    artCredit.textContent=art.credit;
  }
  function scrollToScene(){
    if(!mount?.scrollTo||!mount.getBoundingClientRect)return;
    const offset=frame.getBoundingClientRect().top-mount.getBoundingClientRect().top+mount.scrollTop-74;
    mount.scrollTo({top:Math.max(0,offset),behavior:motionReduced(win)?"auto":"smooth"});
  }
  function setStep(value,{initial=false}={}){
    const nextStep=Math.max(0,Math.min(scenes.length-1,Number(value)||0));
    if(!initial&&nextStep===step)return step;
    if(!initial&&!motionReduced(win)&&lastImg)transitionStill(win,frame,form,scenes[nextStep]);
    step=nextStep;
    sceneApply();
    if(!initial){scrollToScene();onStageChange(step);}
    return step;
  }
  function sceneApply(){
    const scene=scenes[step];
    sequence.dataset.aoCinematicStep=String(step);
    frame.dataset.sceneId=scene.id;
    frame.dataset.effect=scene.effect;
    frame.dataset.sceneIndex=String(step);
    timelineButtons.forEach((button,i)=>{
      button.classList.toggle("active",i===step);
      if(i===step)button.setAttribute("aria-current","step");
      else button.removeAttribute("aria-current");
    });
    chapterNodes.forEach((group,i)=>{group.hidden=i!==step;});
    prev.disabled=step===0;next.disabled=step===scenes.length-1;
    stepLabel.textContent=(step+1)+" / "+scenes.length;
    title.textContent=scene[locale==="fr"?"fr":"en"];
    latin.textContent=scene.latin;
    placeArtwork(scene);
    if(!motionReduced(win)){
      frame.classList.remove("aoAngelusCinemaSceneIn");
      void frame.offsetWidth;
      frame.classList.add("aoAngelusCinemaSceneIn");
    }
  }
  timeline.addEventListener("click",event=>{
    const button=event.target.closest?.("[data-ao-angelus-goto]");
    if(button)setStep(Number(button.dataset.aoAngelusGoto));
  });
  controls.addEventListener("click",event=>{
    const button=event.target.closest?.("[data-ao-angelus-move]");
    if(button)setStep(step+Number(button.dataset.aoAngelusMove));
  });
  // Horizontal swipe only. Vertical prayer scrolling and text/language taps stay native.
  container.addEventListener("touchstart",event=>{
    if(event.touches?.length!==1||event.target.closest?.("button,a,input,select,textarea")){touchStart=null;return;}
    touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};
  },{passive:true});
  container.addEventListener("touchend",event=>{
    if(!touchStart||!event.changedTouches?.[0])return;
    const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
    touchStart=null;
    if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.45)setStep(step+(dx<0?1:-1));
  },{passive:true});
  frame.addEventListener("touchstart",event=>{
    if(event.touches?.length===1)touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};
  },{passive:true});
  frame.addEventListener("touchend",event=>{
    if(!touchStart||!event.changedTouches?.[0])return;
    const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
    touchStart=null;
    if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.45)setStep(step+(dx<0?1:-1));
  },{passive:true});

  setStep(initialStep,{initial:true});
  const api=Object.freeze({version:ANGELUS_CINEMATIC_VERSION,count:scenes.length,form,
    sceneIds:scenes.map(s=>s.id),getStep:()=>step,setStep});
  sequence.__aoAngelusCinematic=api;
  return api;
}
