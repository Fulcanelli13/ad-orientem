// Standalone sacred-music programme reader. Does not mount or change R17 Mass.
import {SACRED_MUSIC_WORKS,sacredMusicProgramme} from "./sacred-music-works.js";
const ROLE_LABELS=Object.freeze({
 INTROIT_KYRIE:["Introit + Kyrie","Introït + Kyrie"],INTROIT:["Introit","Introït"],
 KYRIE:["Kyrie","Kyrie"],OFFERTORY:["Offertory","Offertoire"],
 SANCTUS:["Sanctus","Sanctus"],BENEDICTUS:["Benedictus","Benedictus"],
 DIES_IRAE_EXCERPT:["Dies irae · excerpt","Dies irae · extrait"],
 SEQUENCE_PART:["Dies irae · section","Dies irae · section"],
 AGNUS_AND_COMMUNION:["Agnus + Communion","Agnus + Communion"],
 AGNUS_DEI:["Agnus Dei","Agnus Dei"],COMMUNION:["Communion","Communion"],
 ABSOLUTION_IF_CELEBRATED:["After-Mass Absolution · conditional","Absoute après messe · facultative"],
 FUNERAL_PROCESSION_IF_CELEBRATED:["Funeral procession · conditional","Procession funèbre · facultative"]
});
const t=(lang,en,fr)=>lang==="fr"?fr:en;
function element(doc,tag,className,text){const el=doc.createElement(tag);if(className)el.className=className;if(text!=null)el.textContent=String(text);return el;}
export function mountSacredMusicGuide(root,{workId="faure-requiem-op48",language="en",mode="CONCERT"}={}){
 if(!root?.ownerDocument)throw new TypeError("Guide root element required");
 const doc=root.ownerDocument;
 let selected=SACRED_MUSIC_WORKS.some(w=>w.id===workId)?workId:SACRED_MUSIC_WORKS[0].id;
 let lang=language==="fr"?"fr":"en",form=mode==="MASS"?"MASS":"CONCERT";
 root.classList.add("aoMusicGuide");
 const header=element(doc,"header","aoMusicHead");
 const eyebrow=element(doc,"p","aoMusicEyebrow");
 const title=element(doc,"h1",null);
 const intro=element(doc,"p","aoMusicIntro");
 header.append(eyebrow,title,intro);
 const controls=element(doc,"div","aoMusicControls");
 const workLabel=element(doc,"label","aoMusicField");
 const workLabelText=element(doc,"span");
 const picker=element(doc,"select");picker.setAttribute("aria-label","Choose sacred-music work");
 for(const work of SACRED_MUSIC_WORKS){const option=element(doc,"option",null,work.composer+" · "+work.title+" "+work.catalogue);option.value=work.id;picker.append(option);}
 workLabel.append(workLabelText,picker);
 const modeBlock=element(doc,"fieldset","aoMusicMode");
 const legend=element(doc,"legend");modeBlock.append(legend);
 const modeBtns={};
 for(const kind of ["CONCERT","MASS"]){const b=element(doc,"button","aoMusicModeButton");b.type="button";b.dataset.aoMusicMode=kind;b.setAttribute("aria-pressed",String(kind===form));modeBlock.append(b);modeBtns[kind]=b;}
 const languageBtn=element(doc,"button","aoMusicLanguage");languageBtn.type="button";languageBtn.setAttribute("aria-label","Switch between English and French");
 controls.append(workLabel,modeBlock,languageBtn);
 const scope=element(doc,"p","aoMusicScope");scope.setAttribute("role","status");
 const sourceNote=element(doc,"p","aoMusicSourceNote");
 const workHeading=element(doc,"h2","aoMusicWorkHeading");
 const list=element(doc,"ol","aoMusicMovements");
 const sources=element(doc,"div","aoMusicSources");
 const caution=element(doc,"p","aoMusicCaution");
 const footer=element(doc,"footer","aoMusicFooter");
 const back=element(doc,"a",null);back.href="./index.html";
 footer.append(back);
 root.replaceChildren(header,controls,scope,workHeading,sourceNote,list,caution,sources,footer);
 const syncUrl=()=>{
  try{const url=new URL(doc.location.href);url.searchParams.set("work",selected);url.searchParams.set("mode",form.toLowerCase());url.searchParams.set("lang",lang);doc.defaultView?.history?.replaceState?.(null,"",url.pathname+url.search+url.hash);}catch{}
 };
 const paint=()=>{
  const view=sacredMusicProgramme(selected,{language:lang,mode:form});if(!view)return;
  eyebrow.textContent=t(lang,"AD ORIENTEM · SACRED MUSIC","AD ORIENTEM · MUSIQUE SACRÉE");
  title.textContent=t(lang,"Sacred music programmes","Programmes de musique sacrée");
  intro.textContent=t(lang,"Works and movements, distinct from the appointed 1962 liturgy and from what was actually performed.","Œuvres et mouvements, distincts de la liturgie prescrite en 1962 et de l'exécution réellement entendue.");
  workLabelText.textContent=t(lang,"Composition","Composition");picker.value=selected;
  legend.textContent=t(lang,"Guide context","Contexte du guide");
  modeBtns.CONCERT.textContent=t(lang,"Music only","Musique seule");modeBtns.MASS.textContent=t(lang,"During Mass","Pendant la messe");
  for(const k of ["CONCERT","MASS"])modeBtns[k].setAttribute("aria-pressed",String(k===form));
  languageBtn.textContent=lang==="en"?"FR":"EN";
  scope.textContent=view.scope;
  workHeading.textContent=view.work.composer+" — "+view.work.title+" "+view.work.catalogue;
  sourceNote.textContent=view.note;
  list.replaceChildren();
  for(const m of view.movements){
   const li=element(doc,"li","aoMusicMovement");
   const detail=element(doc,"details");
   const summary=element(doc,"summary");
   const number=element(doc,"span","aoMusicNumber",String(m.index).padStart(2,"0"));
   const movementTitle=element(doc,"span","aoMusicMovementName",m.title);
   const role=element(doc,"span","aoMusicRole",ROLE_LABELS[m.role]?.[lang==="fr"?1:0]||m.role);
   summary.append(number,movementTitle,role);
   const explanation=element(doc,"p",null,m.description);
   detail.append(summary,explanation);li.append(detail);list.append(li);
  }
  caution.textContent=t(lang,"Metadata and independent editorial explanations only. No audio, score, licence clearance, or claimed local performance. A musical movement never substitutes for a required 1962 prayer or rite.","Métadonnées et explications éditoriales seulement. Ni audio, ni partition, ni autorisation de droits, ni exécution locale certifiée. Aucun mouvement musical ne remplace une prière ou un rite prescrit en 1962.");
  sources.replaceChildren(element(doc,"h3",null,t(lang,"Sources","Sources")));
  for(const href of view.work.sources){const a=element(doc,"a",null,new URL(href).hostname);a.href=href;a.rel="noopener noreferrer";a.target="_blank";sources.append(a);}
  back.textContent=t(lang,"Return to Ad Orientem","Retourner à Ad Orientem");
 };
 picker.addEventListener("change",()=>{selected=picker.value;paint();syncUrl()});
 for(const kind of ["CONCERT","MASS"])modeBtns[kind].addEventListener("click",()=>{form=kind;paint();syncUrl()});
 languageBtn.addEventListener("click",()=>{lang=lang==="en"?"fr":"en";paint();syncUrl()});
 paint();
 return Object.freeze({getState:()=>Object.freeze({workId:selected,language:lang,mode:form}),dispose:()=>root.replaceChildren()});
}
