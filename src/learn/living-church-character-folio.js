/**
 * The Living Church P3 — review-only visual-novel folio.
 * Source-bound navigation, NOT speech attributed to historical persons.
 * No independent doctrinal answers, invented rubrics, free-form AI replies or
 * duplication of the original Visible Mass/Ask/Catechism owners.
 */
import {createAskChurchObjectiveEngine} from "./ask-church-objective-engine.js";
import {canonResearchPreviewEnabled} from "./living-church-canon-research-reader.mjs";
import {createCanonSourceDialogueOverlay} from "./living-church-canon-dialogue-ui.mjs";
import {visibleMassResearchMomentLinks} from "../../previews/visible-mass-3d/photographic-published-explorer-handoff.mjs";
export const LIVING_CHURCH_FOLIO_VERSION="AO_LIVING_CHURCH_P3_FOLIO_V1";
const BANK_URL=new URL("../../data/learn/living-church-character-assets.v1.json",import.meta.url);
const PILOT_URL=new URL("../../previews/visible-mass-3d/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json",import.meta.url);
const isOK=v=>v===true||v?.ok===true;
const id=(v)=>String(v||"").replace(/[^a-z0-9_.:-]/gi,"");
const copy={
 en:{
  label:"The Living Church",status:"Source-guided research preview · not published",
  guide:"Choose a guide",sacristan:"The Sacristan",canon:"Monsieur le Chanoine",pius:"St Pius X",
  asks:"Choose the next question or follow the indicated original source. These prompts are editorial navigation, not words spoken by the portrayed person.",
  piusDisclosure:"Historical simulation. St Pius X is represented by an illustrative avatar. The prompts are not his words. Only original Catechism text from the canonical source may be presented as his teaching.",
  questionIntro:"The original photographic inventory records these questions about the selected object. Opening them uses the original research viewer.",
  understand:"The Canon can direct you towards existing Mass Explorer explanations. Photograph-to-ceremony connections here remain contextual research candidates, not approved 1962 rubrics.",
  piusIntro:"Explore the original St Pius X Catechism by subject. A topic selection is not a quotation, and the original Catechism owner remains authoritative.",
  sacristanIntro:"You can examine the original object and the questions attached to it. The photographic record is preserved rather than reconstructed.",
  fallback:"This question or destination cannot be opened from the sanctuary review yet.",
  help:"Select an objective or describe a subject. Only verified source destinations are available from this setting.",
  openSource:"Open original object questions",mass:"Related Mass moments",objectives:"Choose an objective",
  study:"Catechism topics",back:"Back to guide",close:"Explore freely",
  submit:"Find topic",placeholder:"What would you like to explore?",
  source:"Source",held:"Return path not yet verified",open:"Open original Mass Explorer",
  noLinks:"No certified object-to-moment relationship is available here.",
  return:"Return to the photograph",piusSource:"PX1912 · 433 original Catechism questions",
  sourceQuestion:"Open original question",new:"Change objective",unsupported:"Source owner rejected the request",
  topic:"Choose a more specific objective",shown:"Original source · research review only",
  apologetics:"Apologetics questions · source review",debate:"Prepare a discussion · source review"
 },
 fr:{
  label:"L’Église vivante",status:"Aperçu documentaire · non publié",guide:"Choisir un guide",
  sacristan:"Le Sacristain",canon:"Monsieur le Chanoine",pius:"Saint Pie X",
  asks:"Choisissez une question ou consultez la source originale. Ces indications sont éditoriales et non des paroles attribuées au personnage.",
  piusDisclosure:"Simulation historique. Saint Pie X est représenté par une illustration. Ces indications ne sont pas ses paroles. Seuls les textes originaux du Catéchisme peuvent être présentés comme son enseignement.",
  questionIntro:"L’inventaire photographique original contient les questions suivantes. Leur consultation se fait dans le dossier de recherche original.",
  understand:"Le Chanoine peut vous orienter vers les explications existantes de Mass Explorer. Les relations photographies-cérémonies sont des pistes de recherche, non des rubriques approuvées de 1962.",
  piusIntro:"Parcourez le Catéchisme original de saint Pie X par sujet. Choisir un sujet ne constitue pas une citation.",
  sacristanIntro:"Examinez l’objet original et les questions qui lui sont associées. Le document photographique n’est pas reconstitué.",
  fallback:"Cette question ou destination n’est pas accessible depuis cet aperçu.",
  help:"Choisissez un objectif ou décrivez un sujet. Seules les sources vérifiées sont accessibles ici.",
  openSource:"Questions sur cet objet",mass:"Moments de la Messe",objectives:"Choisir un objectif",
  study:"Sujets du Catéchisme",back:"Retour au guide",close:"Explorer librement",
  submit:"Trouver un sujet",placeholder:"Que souhaitez-vous approfondir ?",
  source:"Source",held:"Retour non encore vérifié",open:"Ouvrir Mass Explorer",
  noLinks:"Aucune relation source-vers-moment n’est confirmée ici.",
  return:"Revenir à la photographie",piusSource:"PX1912 · 433 questions originales",
  sourceQuestion:"Ouvrir la question originale",new:"Changer d’objectif",unsupported:"La source a refusé la requête",
  topic:"Précisez votre objectif",shown:"Source originale · recherche non publiée",
  apologetics:"Questions d’apologétique · aperçu documentaire",debate:"Préparer une discussion · aperçu documentaire"
 }
};
const CSS=`
#aoLivingChurchCharacterFolio{position:absolute;inset:62px 0 0;z-index:17;pointer-events:none;font-family:Georgia,serif;color:#f0e7d9;isolation:isolate;overflow:hidden}
#aoLivingChurchCharacterFolio[hidden]{display:none!important}
#aoLivingChurchCharacterFolio .lcVeil{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,11,16,.49),rgba(7,10,14,.04) 52%,rgba(8,11,16,.14)),linear-gradient(0deg,rgba(6,9,14,.8),transparent 70%);pointer-events:none}
#aoLivingChurchCharacterFolio[data-guide="pius-x"] .lcVeil{background:linear-gradient(90deg,rgba(8,12,19,.32),rgba(7,9,15,.22)),linear-gradient(0deg,rgba(6,9,14,.75),transparent 75%),url('/assets/living-church/backgrounds/pius-x-papal-study.webp') center/cover no-repeat}
#aoLivingChurchCharacterFolio .lcCharacters{position:absolute;top:12px;left:12px;z-index:3;display:flex;gap:6px;pointer-events:auto}
#aoLivingChurchCharacterFolio .lcCharacters button{max-width:160px;min-height:44px;border:1px solid #716552;border-radius:5px;background:rgba(9,16,25,.91);color:#e9dfcc;padding:9px 12px;font:12px/1.25 Georgia,serif;cursor:pointer}
#aoLivingChurchCharacterFolio .lcCharacters button[aria-pressed="true"]{border-color:#d4b985;background:#332d26;color:#fff}
#aoLivingChurchCharacterFolio .lcCharacterImage{position:absolute;right:1%;bottom:5%;max-width:min(52vw,710px);max-height:95%;object-fit:contain;object-position:bottom;filter:drop-shadow(7px 11px 20px #000b);pointer-events:none}
#aoLivingChurchCharacterFolio .lcFolio{position:absolute;z-index:4;left:14px;bottom:14px;width:min(730px,67vw);max-height:62%;overflow:auto;pointer-events:auto;border:1px solid #877352;border-radius:6px;background:linear-gradient(145deg,rgba(11,17,25,.98),rgba(21,24,27,.97));box-shadow:0 12px 42px #000a;padding:17px 20px 15px}
#aoLivingChurchCharacterFolio .lcKicker{font:10px/1.5 system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#cdb486}
#aoLivingChurchCharacterFolio .lcHeading{font:23px/1.2 Georgia,serif;margin:6px 0 9px}
#aoLivingChurchCharacterFolio .lcStatus{font:11px/1.5 system-ui,sans-serif;color:#bcb4a6}
#aoLivingChurchCharacterFolio .lcPrompt{font:17px/1.48 Georgia,serif;margin:10px 0 13px}
#aoLivingChurchCharacterFolio .lcDisclaimer{font:12px/1.5 system-ui,sans-serif;border-left:2px solid #c1a477;padding:7px 11px;margin:9px 0;color:#d4c9b7}
#aoLivingChurchCharacterFolio .lcChoices{display:flex;flex-wrap:wrap;gap:8px;margin:9px 0}
#aoLivingChurchCharacterFolio .lcChoices button{min-height:43px;text-align:left;background:#202632;color:#f1e5ce;border:1px solid #666052;border-radius:5px;padding:9px 12px;font:12px/1.35 system-ui,sans-serif;cursor:pointer}
#aoLivingChurchCharacterFolio .lcChoices button:disabled{opacity:.56;cursor:not-allowed}
#aoLivingChurchCharacterFolio .lcChoices button[data-primary="true"]{border-color:#c6ab78}
#aoLivingChurchCharacterFolio .lcForm{display:flex;gap:8px;margin-top:13px}
#aoLivingChurchCharacterFolio .lcForm input{min-width:0;flex:1;background:#0a111b;color:#f8f0e1;border:1px solid #67635c;padding:10px 12px;border-radius:5px;font:13px system-ui,sans-serif}
#aoLivingChurchCharacterFolio .lcForm button{background:#c4a977;color:#111;border:0;border-radius:5px;padding:10px 13px;font:12px system-ui,sans-serif}
#aoLivingChurchCharacterFolio .lcNotice{min-height:18px;margin:9px 0 0;font:11px/1.4 system-ui,sans-serif;color:#c7b697}
#aoLivingChurchCharacterFolio button:focus-visible,#aoLivingChurchCharacterFolio input:focus-visible{outline:2px solid #dfc993;outline-offset:2px}
#aoLivingChurchCharacterFolio .lcExplore{position:absolute;right:12px;top:13px;z-index:5;pointer-events:auto;background:rgba(7,13,20,.89);color:#f0e5d3;border:1px solid #8a7453;border-radius:5px;padding:9px 12px;font:12px system-ui,sans-serif;cursor:pointer}
@media(max-width:720px){#aoLivingChurchCharacterFolio .lcCharacters{left:8px;top:10px;right:8px;gap:4px}#aoLivingChurchCharacterFolio .lcCharacters button{font-size:11px;padding:6px;flex:1}#aoLivingChurchCharacterFolio .lcExplore{top:65px;right:8px}#aoLivingChurchCharacterFolio .lcCharacterImage{right:-13%;max-width:91vw;max-height:79%;bottom:18%}#aoLivingChurchCharacterFolio .lcFolio{left:8px;right:8px;bottom:8px;width:auto;max-height:56%;padding:12px 13px}#aoLivingChurchCharacterFolio .lcHeading{font-size:19px}#aoLivingChurchCharacterFolio .lcPrompt{font-size:15px;line-height:1.38}#aoLivingChurchCharacterFolio .lcChoices{gap:5px}#aoLivingChurchCharacterFolio .lcChoices button{font-size:11px;min-height:40px;padding:7px 10px}}
@media(prefers-reduced-motion:reduce){#aoLivingChurchCharacterFolio *{transition:none!important;animation:none!important}}
`;
function el(doc,tag,cls="",value=null){const node=doc.createElement(tag);if(cls)node.className=cls;if(value!==null)node.textContent=String(value);return node;}
export async function mountLivingChurchCharacterFolio(win=globalThis,{host,frame,integration,survey}={}){
 if(!host||!frame||typeof integration?.nativeOpen!=="function"||
   survey?.schema!=="AO_ASK_CHURCH_APP_ROUTE_SURVEY_V1"||
   !survey?.objectives?.length)throw Error("Original source owners required for character folio");
 const base=integration.sourceContext?.();
 if(!base?.context?.objectId||base.context.scene?.sceneId!=="BROMPTON_ALTAR_2019_B")
  throw Error("Select an original source-owned altar object first");
 const [bankResponse,pilotResponse]=await Promise.all([
  win.fetch(BANK_URL.href),win.fetch(PILOT_URL.href)]);
 if(!bankResponse.ok||!pilotResponse.ok)throw Error("Original sprite or VMQ registry missing");
 const [bank,pilot]=await Promise.all([bankResponse.json(),pilotResponse.json()]);
 if(bank?.schema!=="AO_LIVING_CHURCH_P3_SPRITE_BANK_V1"||
   bank.chars?.length!==3||bank.emotions?.length!==5||
   pilot?.questions?.length!==134||pilot.status!=="RESEARCH_ONLY_NO_PUBLICATION")
  throw Error("Unverified character assets or original VMQ source");
 const doc=win.document,old=doc.getElementById("aoLivingChurchCharacterFolio");
 old?.remove();doc.getElementById("aoLivingChurchCharacterStyles")?.remove();
 const sheet=el(doc,"style");sheet.id="aoLivingChurchCharacterStyles";sheet.textContent=CSS;doc.head.append(sheet);
 const root=el(doc,"section");root.id="aoLivingChurchCharacterFolio";
 root.setAttribute("role","region");root.setAttribute("aria-label","Living Church source-guided character review");
 root.dataset.guide="sacristan";
 const veil=el(doc,"div","lcVeil");veil.setAttribute("aria-hidden","true");
 const nav=el(doc,"nav","lcCharacters");nav.setAttribute("aria-label","Choose your guide");
 const image=el(doc,"img","lcCharacterImage");image.alt="";image.setAttribute("aria-hidden","true");
 const closeButton=el(doc,"button","lcExplore");closeButton.type="button";
 const panel=el(doc,"section","lcFolio");panel.setAttribute("aria-label","Source-guided dialogue folio");
 const kicker=el(doc,"div","lcKicker"),heading=el(doc,"h2","lcHeading"),status=el(doc,"div","lcStatus");
 const prompt=el(doc,"p","lcPrompt"),disclosure=el(doc,"p","lcDisclaimer");
 const choices=el(doc,"div","lcChoices"),notice=el(doc,"p","lcNotice");notice.setAttribute("role","status");
 const form=el(doc,"form","lcForm"),input=el(doc,"input"),submit=el(doc,"button");
 input.type="text";input.setAttribute("aria-label","Objective or topic");submit.type="submit";form.append(input,submit);
 panel.append(kicker,heading,status,prompt,disclosure,choices,form,notice);
 root.append(veil,image,nav,closeButton,panel);host.append(root);
 const engine=createAskChurchObjectiveEngine(survey,{lang:base.context.lang});
 let guide="sacristan",emotion="welcoming",mode="home",closed=false,message="";
 const objects=new Map(pilot.objects.map(x=>[x.object_id,x]));
 const questions=new Map(pilot.questions.map(x=>[x.id,x]));
 const snapshot=()=>integration.sourceContext?.()?.context||null;
 const current=()=>{const s=snapshot();return s&&s.scene?.sceneId==="BROMPTON_ALTAR_2019_B"?s:null;};
 const L=()=>copy[engine.snapshot().lang];
  const canonOverlay=canonResearchPreviewEnabled(win)?createCanonSourceDialogueOverlay(win,{root,getLang:()=>engine.snapshot().lang}):null;
 const refer=key=>bank.images[guide]?.[key]||null;
 function addChoice(label,callback,{primary=false,disabled=false}={}){
  const b=el(doc,"button","",label);b.type="button";b.dataset.primary=String(primary);
  b.disabled=disabled;b.addEventListener("click",callback);choices.append(b);return b;
 }
 function selectGuide(next){
  if(!["sacristan","canon","pius-x"].includes(next)||closed)return false;
  const ctx=current();if(!ctx)return false;
  const origin=frame.contentWindow?.AO_VISIBLE_MASS_LIVING_CHURCH_P1;
  const verdict=origin?.chooseGuide?.(next);
  if(!isOK(verdict)){message=L().unsupported;render();return false;}
  canonOverlay?.close();guide=next;emotion="welcoming";mode="home";message="";render();return true;
 }
 async function enterMoment(){
  const c=current();if(!c){message=L().unsupported;render();return;}
  const links=visibleMassResearchMomentLinks(c.objectId,{reviewMode:true});
  if(!links.length){message=L().noLinks;emotion="thoughtful";render();return;}
  mode="moments";emotion="explaining";render();
 }
 function showOriginalQuestion(qid){
  const c=current(),q=questions.get(qid);
  if(!c||!q||q.primary_object_id!==c.objectId)return false;
  const ok=frame.contentWindow?.AO_VISIBLE_MASS_HOTSPOT_PILOT?.guideExplore?.(qid)===true;
  if(ok){hide();return true;}
  message=L().fallback;emotion="thoughtful";render();return false;
 }
 async function openMass(){
  if(closed)return;
  emotion="thoughtful";message="";render();
  const response=await integration.nativeOpen("learn.mass_explorer");
  if(response?.ok){hide();return;}
  message=L().fallback+" ["+id(response?.code)+"]";emotion="grave";render();
 }
 function beginObjectives(objective=null){
  mode="objectives";
  if(objective)engine.setObjective(objective);
  emotion="explaining";message="";render();
 }
 function render(){
  if(closed)return;
  const lang=engine.snapshot().lang,c=current(),words=L();
  root.dataset.guide=guide;root.lang=lang;
  const asset=refer(emotion)||refer("neutral");
  image.src=asset||"";image.hidden=!asset;
  kicker.textContent=words.status;
  heading.textContent=guide==="sacristan"?words.sacristan:guide==="canon"?words.canon:words.pius;
  status.textContent=guide==="pius-x"?words.piusSource:
    (c?.objectId||"")+" · "+(objects.get(c?.objectId)?.glossary_id||"")+" · "+words.shown;
  disclosure.textContent=guide==="pius-x"?words.piusDisclosure:words.asks;
  closeButton.textContent=words.close;
  input.placeholder=words.placeholder;submit.textContent=words.submit;
  form.hidden=mode==="questions"||mode==="moments";
  choices.replaceChildren();
  for(const item of bank.chars){
   let b=nav.querySelector('[data-persona="'+item.id+'"]');
   if(!b){b=el(doc,"button");b.type="button";b.dataset.persona=item.id;nav.append(b);
    b.addEventListener("click",()=>selectGuide(item.id));}
   b.textContent=item.name[lang];b.setAttribute("aria-pressed",String(item.id===guide));
  }
  if(mode==="home"){
   prompt.textContent=guide==="sacristan"?words.sacristanIntro:guide==="canon"?words.understand:words.piusIntro;
   addChoice(words.openSource,()=>{mode="questions";emotion="explaining";render();},{primary:guide==="sacristan"});
   addChoice(words.mass,enterMoment,{primary:guide==="canon"});
   addChoice(guide==="pius-x"?words.study:words.objectives,()=>beginObjectives(guide==="pius-x"?"understand":null),{primary:guide==="pius-x"});
   if(guide==="sacristan")addChoice(words.canon,()=>selectGuide("canon"));
   if(guide==="canon"){
     if(canonOverlay){
      addChoice(words.apologetics,()=>{void canonOverlay.open({purpose:"learn",focusFrom:doc.activeElement});},{primary:true});
      addChoice(words.debate,()=>{void canonOverlay.open({purpose:"debate",focusFrom:doc.activeElement});});
     }
     addChoice(words.pius,()=>selectGuide("pius-x"));
    }
  }else if(mode==="questions"){
   prompt.textContent=words.questionIntro;
   const listed=pilot.questions.filter(q=>q.primary_object_id===c?.objectId).slice(0,12);
   for(const q of listed)addChoice((q.question?.[lang]||q.question?.en||q.id)+" · "+q.id,()=>showOriginalQuestion(q.id));
   addChoice(words.back,()=>{mode="home";render();});
  }else if(mode==="moments"){
   prompt.textContent=words.understand;
   const links=visibleMassResearchMomentLinks(c?.objectId,{reviewMode:true});
   for(const link of links)addChoice(link.label+" · "+link.guideId,openMass,{primary:true});
   if(!links.length)addChoice(words.noLinks,()=>{}, {disabled:true});
   addChoice(words.back,()=>{mode="home";render();});
  }else if(mode==="objectives"){
   const st=engine.snapshot();
   prompt.textContent=st.branch?words.help:st.objective?engine.prompt():words.help;
   if(!st.objective){
    for(const obj of engine.objectives())addChoice(obj.title,()=>beginObjectives(obj.id));
   }else if(!st.branch){
    for(const b of engine.branches())addChoice(b.title,()=>{engine.setBranch(b.id);render();});
    addChoice(words.new,()=>{engine.reset();render();});
   }else{
    for(const t of engine.targets()){
     const label=t.route?.id||t.scenario?.id||t.id;
     const enabled=t.id==="learn.mass_explorer"&&
       visibleMassResearchMomentLinks(c?.objectId,{reviewMode:true}).some(l=>l.destination===t.id);
     addChoice((label==="learn.mass_explorer"?words.open:label)+(enabled?"":" · "+words.held),
       ()=>{if(enabled)void openMass();},{primary:enabled,disabled:!enabled});
    }
    addChoice(words.new,()=>{engine.reset();render();});
   }
   addChoice(words.back,()=>{mode="home";render();});
  }
  notice.textContent=message;
 }
 function hide(){canonOverlay?.close();root.hidden=true;}
 function show(){if(closed)return false;if(!current())return false;root.hidden=false;message="";render();return true;}
 function close(){closed=true;canonOverlay?.dispose();root.remove();sheet.remove();}
 function returnToPhoto(){
  hide();frame.contentWindow?.AO_VISIBLE_MASS_HOTSPOT_PILOT?.focusContext?.();
  frame.focus?.({preventScroll:true});
 }
 closeButton.addEventListener("click",returnToPhoto);
 root.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&!root.hidden){
   event.preventDefault();returnToPhoto();
  }
 });
 form.addEventListener("submit",e=>{
  e.preventDefault();const v=input.value.trim();input.value="";
  if(!v)return;
  const result=engine.interpret(v);
  if(result.kind==="clarify"){message=words().fallback;emotion="thoughtful";}
  else{mode="objectives";emotion="explaining";message="";}
  render();
 });
 function words(){return copy[engine.snapshot().lang];}
 render();
 return Object.freeze({show,hide,close,chooseGuide:selectGuide,
  status:()=>Object.freeze({version:LIVING_CHURCH_FOLIO_VERSION,
   open:!root.hidden&&!closed,guide,emotion,mode,
   objective:engine.snapshot(),sourceObject:current()?.objectId||null,
   questionCount:questions.size,assetReady:!image.hidden&&Boolean(image.src),
    canonResearch:canonOverlay?.status()||null,
   publication:"REVIEW_ONLY_NOT_HISTORICAL_SPEECH",nativeHandoff:"P2_SOURCE_GATED"})
 });
}
