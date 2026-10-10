// First-class Mass domain: an actual module like Calendar, not the old
// preflight's parent navigation. Canonical host still owns Mass permissions,
// Proper selection and the existing R17 native 48-card LIVE reader.
const FORMS=Object.freeze([
 ["LOW","Low Mass","Messe basse"],
 ["MISSA_CANTATA_SIMPLE","Missa Cantata","Messe chantée"],
 ["MISSA_CANTATA_INCENSE","Missa Cantata · incense","Messe chantée · encens"],
 ["SOLEMN","Solemn Mass","Messe solennelle"],
]);
const MODES=Object.freeze([["LIVE","LIVE","LIVE"],["SIMPLE","Simple","Simple"],["MISSAL","Missal","Missel"]]);
const CATEGORIES=Object.freeze([
 ["CALENDAR","Mass of the day","Messe du jour","Calendar Proper · actual date","Propre du calendrier · date réelle"],
 ["VOTIVE","Votive","Votive","Source-resolved permitted votive Mass","Messe votive permise et sourcée"],
 ["REQUIEM","Requiem","Requiem","Mass for the departed","Messe des défunts"],
 ["NUPTIAL","Nuptial","Nuptiale","Matrimonial Mass and blessings","Messe et bénédictions nuptiales"],
 ["OTHER","Special liturgy","Liturgie particulière","Holy Week and other source-owned rites","Semaine sainte et rites particuliers"],
 ["SOURCE_DATE","Other Proper","Autre propre","Follow the Mass actually celebrated","Suivre la messe effectivement célébrée"],
]);
export const MASS_HUB_CATEGORIES=CATEGORIES;
const formSet=new Set(FORMS.map(x=>x[0])),modeSet=new Set(MODES.map(x=>x[0]));
const tr=(en,fr,locale)=>locale==="fr"?fr:en;
const node=(doc,tag,cls,value)=>{const el=doc.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el};
function sourceSummary(resolved){
 if(!resolved||typeof resolved!=="object")return Object.freeze({date:null,title:null,source:null,ready:false});
 return Object.freeze({
  date:String(resolved.date??"")||null,
  title:String(resolved.celebrationTitle??resolved.actualCelebration?.title??resolved.calendarDay?.title??"").trim()||null,
  source:String(resolved.properSource??resolved.proper?.sourcePath??"").trim()||null,
  ready:resolved.canStart===true,
 });
}
export function createMassHubOwner(win=globalThis,{
 openPreflight=()=>win?.AO_CELEBRATION_API?.openPreflight?.(),
 configure=options=>win?.AO_R17_BROWSER_ENTRY?.configure?.(options),
 getResolvedMass=()=>win?.AO_CELEBRATION_API?.getResolvedMass?.(),
 loadTenebrae=()=>import("./tenebrae-live.js"),
}={}){
 const doc=win?.document;
 let root=null,screen="hub",tenebrae=null,selectedForm="MISSA_CANTATA_INCENSE",
  selectedMode="LIVE",opening=false,error="",disposed=false;
 const locale=()=>win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"?"fr":"en";
 const T=(en,fr)=>tr(en,fr,locale());
 const status=()=>Object.freeze({
  installed:Boolean(doc?.body),open:Boolean(root?.isConnected&&!root.hidden),
  screen,selectedForm,selectedMode,opening,error,
  mass:sourceSummary(getResolvedMass()),tenebrae:tenebrae?.status?.()??null,
 });
 function close(){
  tenebrae?.dispose?.();tenebrae=null;
  root?.remove();root=null;screen="hub";opening=false;error="";
  if(doc?.documentElement?.dataset)delete doc.documentElement.dataset.aoMassHubOpen;
  return true;
 }
 async function prepare(category="CALENDAR"){
  if(opening||disposed)return false;
  opening=true;error="";render();
  try{
   const started=await Promise.resolve(openPreflight());
   if(started===false||started?.ok===false)throw new Error("MASS_PREFLIGHT_UNAVAILABLE");
   // The host's preflight command returns void on some original donor builds.
   // Never report success if that void command failed to show its backdrop.
   if(started===undefined){
    const backdrop=doc?.querySelector?.("#ao-mass-flow-v1 .aoMassFlowBackdrop");
    if(!backdrop?.isConnected||backdrop.hidden||backdrop.getAttribute("aria-hidden")==="true")
      throw new Error("MASS_PREFLIGHT_NOT_VISIBLE");
   }
   // The native preflight is authoritative: changing a card here only requests
   // a choice. It never fabricates a liturgical permission or text.
   const configured=await Promise.resolve(configure({form:selectedForm,readerMode:selectedMode,
     category:category==="CALENDAR"?null:category}));
   if(configured?.ok===false)throw new Error(configured.reason??"MASS_CATEGORY_UNAVAILABLE");
   root.hidden=true;
   if(doc?.documentElement?.dataset)doc.documentElement.dataset.aoMassHubOpen="preflight";
   return true;
  }catch(e){error=String(e.message??e);return false}
  finally{opening=false;render()}
 }
 async function showTenebrae(){
  if(!root||disposed)return false;
  screen="tenebrae";root.dataset.aoMassHubScreen="tenebrae";render();
  const holder=root.querySelector("[data-mass-hub-tenebrae]");
  if(!holder)return false;
  try{
   const mod=await loadTenebrae();
   if(disposed||screen!=="tenebrae")return false;
   tenebrae=mod.mountTenebraeLive({
    doc,root:holder,language:locale,onBack:()=>{
     tenebrae?.dispose?.();tenebrae=null;screen="hub";render();
    }
   });
   return true;
  }catch(e){
   error=T("Tenebrae reader could not be opened: ","Impossible d’ouvrir l’office des Ténèbres : ")+String(e.message??e);
   screen="hub";render();return false;
  }
 }
 function render(){
  if(!root||disposed)return;
  root.lang=locale();root.dataset.aoMassHubScreen=screen;
  if(screen==="tenebrae"){
   root.replaceChildren(node(doc,"section","aoMassHubTenebraeView"));
   root.firstChild.dataset.massHubTenebrae="";
   return;
  }
  const ribbon=node(doc,"header","aoMassHubRibbon");
  const home=node(doc,"button","aoMassHubBack","⌂");home.type="button";home.dataset.massHubHome="";home.setAttribute("aria-label",T("Go to home","Retour à l’accueil"));
  const title=node(doc,"div","aoMassHubRibbonTitle",T("MASS · LITURGY","MESSE · LITURGIE"));
  const prefs=node(doc,"button","aoMassHubBack","⋯");prefs.type="button";prefs.dataset.massHubInfo="";prefs.setAttribute("aria-label",T("About this module","À propos de ce module"));
  ribbon.append(home,title,prefs);
  const state=node(doc,"div","aoMassHubStateRibbon");
  const side=node(doc,"span","",T("FOLLOW THE LITURGY","SUIVRE LA LITURGIE"));
  const mid=node(doc,"span","",T("1962 ROMAN MISSAL","MISSEL ROMAIN 1962"));
  const right=node(doc,"span","",selectedMode);
  state.append(side,mid,right);
  const progress=node(doc,"div","aoMassHubProgress");progress.append(node(doc,"span",""));
  const main=node(doc,"main","aoMassHubMain"),heading=node(doc,"div","aoMassHubIntro");
  const eyebrow=node(doc,"small","aoMassHubKicker",T("SACRED LITURGY","SAINTE LITURGIE"));
  const h=node(doc,"h1","",T("Mass and the Sacred Offices","Messe et offices sacrés"));
  const description=node(doc,"p","",T(
   "Choose the Mass actually celebrated, its Proper and ceremonial form. Tenebrae and the Holy Week rites are distinct source-owned liturgies.",
   "Choisissez la messe effectivement célébrée, son propre et sa forme. Les Ténèbres et les offices de la Semaine sainte conservent leurs rites propres."));
  heading.append(eyebrow,h,description);main.append(heading);
  const current=sourceSummary(getResolvedMass());
  const currentCard=node(doc,"section","aoMassHubCurrent");
  const headingRow=node(doc,"div","aoMassHubCurrentHeading");
  headingRow.append(node(doc,"small","",T("CURRENT CALENDAR MASS","MESSE DU CALENDRIER")),
   node(doc,"small","",current.date??"—"));
  const currentName=node(doc,"h2","",current.title??T("Choose a Mass","Choisir une messe"));
  const proper=node(doc,"p","",current.source?
   T("Proper: ","Propre : ")+current.source:
   T("Proper resolved on preparation","Propre résolu lors de la préparation"));
  currentCard.append(headingRow,currentName,proper);main.append(currentCard);
  const forms=node(doc,"section","aoMassHubOptions");
  forms.append(node(doc,"h2","",T("Ceremonial form","Forme de la célébration")));
  const formRow=node(doc,"div","aoMassHubFormOptions");
  FORMS.forEach(([id,en,fr])=>{
   const b=node(doc,"button","aoMassHubSelect",tr(en,fr,locale()));b.type="button";
   b.dataset.massHubForm=id;b.setAttribute("aria-pressed",String(selectedForm===id));formRow.append(b);
  });forms.append(formRow);
  const modes=node(doc,"div","aoMassHubModeRow"),modeTitle=node(doc,"strong","",T("Follow with","Suivre avec"));
  modes.append(modeTitle);
  MODES.forEach(([id,en,fr])=>{
   const b=node(doc,"button","aoMassHubSelect",tr(en,fr,locale()));b.type="button";
   b.dataset.massHubMode=id;b.setAttribute("aria-pressed",String(selectedMode===id));modes.append(b);
  });forms.append(modes);main.append(forms);
  const choices=node(doc,"section","aoMassHubChoices");
  choices.append(node(doc,"h2","",T("Choose the celebration and Proper","Choisir la célébration et le propre")));
  const grid=node(doc,"div","aoMassHubCardGrid");
  CATEGORIES.forEach(([id,en,fr,descEn,descFr])=>{
   const b=node(doc,"button","aoMassHubCard");b.type="button";b.dataset.massHubCategory=id;
   const label=node(doc,"strong","",tr(en,fr,locale()));
   const note=node(doc,"small","",tr(descEn,descFr,locale()));
   const arrow=node(doc,"span","aoMassHubArrow","↗");
   b.append(label,note,arrow);grid.append(b);
  });
  choices.append(grid);main.append(choices);
  const office=node(doc,"section","aoMassHubOffice");
  office.append(node(doc,"small","aoMassHubKicker",T("SACRED TRIDUUM","TRIDUUM SACRÉ")));
  office.append(node(doc,"h2","",T("Tenebrae · Matins and Lauds","Ténèbres · Matines et Laudes")));
  office.append(node(doc,"p","",T(
   "Three Holy Week Offices, presented in LIVE, Simple or parallel Missal reading. Tenebrae is not a Mass.",
   "Les offices des trois jours saints, en lecture LIVE, Simple ou Missel bilingue. Les Ténèbres ne sont pas une messe.")));
  const openOffice=node(doc,"button","aoMassHubAction",T("Open Tenebrae","Ouvrir les Ténèbres"));
  openOffice.type="button";openOffice.dataset.massHubTenebrae="";office.append(openOffice);main.append(office);
  const foot=node(doc,"footer","aoMassHubFooter",T(
   "Actual Mass choices are source-resolved. A selected feast date is not proof of rubrical permission. The native R17 reader remains authoritative.",
   "Les choix sont résolus depuis les sources. Choisir une date de fête ne prouve pas la permission rubricale. Le lecteur natif R17 reste l’autorité."));
  if(error){const notice=node(doc,"p","aoMassHubError",error);notice.setAttribute("role","alert");main.prepend(notice)}
  const spinner=opening?node(doc,"p","aoMassHubProgressText",T("Opening source-backed Mass preparation…","Ouverture de la préparation sourcée…")):null;
  if(spinner)main.prepend(spinner);
  root.replaceChildren(ribbon,state,progress,main,foot);
  root.querySelectorAll("button").forEach(button=>{if(opening)button.disabled=true});
 }
 function onClick(event){
  const b=event.target?.closest?.("button");if(!b||!root?.contains(b))return;
  if(b.hasAttribute("data-mass-hub-home")){
   void Promise.resolve(win?.AO_APP_SHELL_V1?.navigate?.("home")).then(result=>{
    if(result?.ok===true)close();
   });return;
  }
  if(b.hasAttribute("data-mass-hub-info")){
   const foot=root?.querySelector(".aoMassHubFooter");if(foot)foot.scrollIntoView({block:"nearest"});return;
  }
  if(b.dataset.massHubForm){if(formSet.has(b.dataset.massHubForm)){selectedForm=b.dataset.massHubForm;render()}return}
  if(b.dataset.massHubMode){if(modeSet.has(b.dataset.massHubMode)){selectedMode=b.dataset.massHubMode;render()}return}
  if(b.dataset.massHubCategory){void prepare(b.dataset.massHubCategory);return}
  if(b.hasAttribute("data-mass-hub-tenebrae")){void showTenebrae();}
 }
 function open(){
  if(disposed||!doc?.body)return false;
  if(!root){
   root=node(doc,"section","aoMassHubSurface");root.id="ao-mass-modular-root";
   root.dataset.aoMassHubOwner="modular-mass-hub-v1";
   root.setAttribute("aria-label","Mass and Sacred Offices");
   root.addEventListener("click",onClick);
   doc.body.append(root);
  }
  root.hidden=false;screen="hub";error="";render();
  doc.documentElement.dataset.aoMassHubOpen="true";
  return true;
 }
 return Object.freeze({version:"mass-hub-v1",open,close,prepare,showTenebrae,status,
  dispose(){close();disposed=true}});
}
export function installMassHubBrowserOwner(win=globalThis){
 if(win?.AO_MASS_HUB_V1)return win.AO_MASS_HUB_V1;
 const api=createMassHubOwner(win);win.AO_MASS_HUB_V1=api;return api;
}
