/*
 * Mass Explorer P1: read-only educational presentation over certified
 * Sung Guide and original ritual text owners. This module neither changes
 * the ritual reader nor imports draft Ultra Master/Mystery research.
 */
import {loadGuideRegistry,validateGuideRegistry} from "../mass/reader-guide.js";
import {massMomentExistingGuideSections,massMomentStudyLinks} from "./mass-moments-study.js";
import {massFormationScriptureHtmlForAnchorIds} from "./mass-formation-scripture-context.js";
import {sourceReferenceSafeUrl} from "./source-reference-panel.js";
import {massMapHtml,massMapCss,projectMassMap,MASS_MAP_PHASES,massMapPhaseIndex} from "./mass-map.js";

export const MASS_EXPLORER_ROUTE="learn.mass_explorer";
export const MASS_EXPLORER_VERSION="mass-explorer-p1-sung-guide-v1";
export const MASS_EXPLORER_ROOT="ao-mass-explorer-root";
const TEXT_URL=new URL("../../data/presentation/reader-text-sung.v1.json",import.meta.url);
const FRENCH_URL=new URL("../../data/presentation/reader-french-ordinary.v1.json",import.meta.url);
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pick=(fr,en,french)=>fr?french:en;
const keys=["PRE.ASPERGES",...Array.from({length:30},(_,i)=>"AO.CARD."+String(i+1).padStart(3,"0")),"POST.MASS"];
// The visual Map and fallback textual index share one five-phase definition.
const groupLabels=MASS_MAP_PHASES.map(phase=>phase.title);

function assertCorpus(corpus,french){
  if(corpus?.schema!=="ao-reader-text-corpus-v1"||corpus.form!=="SUNG"||!Array.isArray(corpus.blocks))throw new Error("Certified Sung text corpus required");
  if(french?.schema!=="ao-reader-french-ordinary-v1"||!french.byCue||typeof french.byCue!=="object")throw new Error("Approved French cue witness required");
}

/** No new Mass IDs: Guide macro identity and AO.SM source blocks stay distinct. */
export function buildMassExplorerCatalog(guideRegistry,corpus,french){
  validateGuideRegistry(guideRegistry);
  assertCorpus(corpus,french);
  const byKey=new Map(),byBlock=new Map();
  for(const key of keys){
    const guide=guideRegistry.entries[key];
    if(!guide)throw new Error("Missing certified Guide "+key);
    byKey.set(key,{key,guide,blocks:[]});
  }
  for(const source of corpus.blocks){
    const id=String(source.Block_ID||"");
    const macro=String(source.Macro_ID||"");
    const match=/^AO\.SM\.M(\d{2})$/.exec(macro);
    if(!/^AO\.SM\.B\d{3}$/.test(id)||!match||byBlock.has(id))throw new Error("Invalid or duplicate source block "+id);
    const key="AO.CARD."+match[1].padStart(3,"0");
    const owner=byKey.get(key);
    if(!owner)throw new Error("Unowned canonical source block "+id);
    owner.blocks.push(source);
    byBlock.set(id,{key,source});
  }
  if(!byBlock.size)throw new Error("Missing canonical source blocks");
  for(const entry of byKey.values())Object.freeze(entry.blocks);
  return Object.freeze({byKey,byBlock,frenchByCue:french.byCue,sequence:Object.freeze([...keys]),source:"CERTIFIED_SUNG_GUIDE_AND_RITUAL_TEXT",crosswalkStatus:"P0_PENDING"});
}

/**
 * P0 handoff boundary: accepts only existing IDs and profile-scoped production
 * data. No researcher-provided relationship is implicitly promoted.
 */
export function getMassExplorerMoment(catalog,canonicalMomentId,context={}){
  if(context.form&&context.form!=="SUNG")return null;
  const block=catalog.byBlock.get(canonicalMomentId);
  const key=block?.key||canonicalMomentId;
  const entry=catalog.byKey.get(key);
  if(!entry)return null;
  return Object.freeze({key,guide:entry.guide,blocks:entry.blocks,selectedBlockId:block?.source.Block_ID??null,
    guideProfile:entry.guide.profile,publication:"PUBLISHED_GUIDE_AND_CANONICAL_TEXT",
    relationshipStatus:catalog.crosswalkStatus});
}

async function fetchJson(url,fetchImpl){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Mass Explorer source unavailable: "+(response?.status??"network"));
  return response.json();
}
export async function loadMassExplorerCatalog({fetchImpl=globalThis.fetch}={}){
  const [guides,text,fr]=await Promise.all([
    loadGuideRegistry({fetchImpl}),
    fetchJson(TEXT_URL,fetchImpl),
    fetchJson(FRENCH_URL,fetchImpl)
  ]);
  return buildMassExplorerCatalog(guides.registry,text,fr);
}

function guideSources(guide,fr){
  // Historic Guide bibliographies are approved contextual pointers, not
  // certified exact-page claims. Keep this distinct from P0 source edges.
  const urls=String(guide.sourceLinks||"").split(";").map(x=>x.trim())
    .filter(x=>sourceReferenceSafeUrl(x)).slice(0,10);
  if(!urls.length)return "";
  return '<details class="aoMXDetails"><summary>'+pick(fr,"Guide bibliography","Bibliographie du Guide")+'</summary>'+
    '<p>'+esc(guide.sourceLine)+'</p><p class="aoMXQuiet">'+pick(fr,
    "Contextual document links only; exact passage, edition and author claims require separate review.",
    "Liens documentaires contextuels ; le passage exact, l’édition et les attributions demandent une vérification distincte.")+'</p>'+
    '<ol>'+urls.map((url,i)=>'<li><a target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">'+
       esc(pick(fr,"Reference ","Référence ")+(i+1))+' ↗</a></li>').join("")+'</ol></details>';
}

function sourceBlockHtml(catalog,source,fr){
  if(!source)return "";
  if(source.Proper_Slot)return '<section class="aoMXText"><h2>'+esc(source.Title)+'</h2><p class="aoMXQuiet">'+esc(pick(fr,
    "This is a variable Proper text. It must be supplied by the selected Mass; no generic text is substituted.",
    "Ce texte du Propre varie selon la Messe choisie ; aucun texte générique n’est substitué."))+'</p></section>';
  const rows=(source.units||[]).filter(unit=>unit?.latin||unit?.english).map(unit=>{
    const translation=fr?catalog.frenchByCue[unit.cue_id]:unit.english;
    // Canonical clock, not the legacy source field name, distinguishes
    // English action rubrics from actual Latin liturgical prayer.
    if(unit.clock==="PRIEST_ACTION"){
      const value=translation||unit.english||unit.latin;
      const lang=fr&&catalog.frenchByCue[unit.cue_id]?"fr":"en";
      return '<aside class="aoMXAction" data-ao-mx-cue="'+esc(unit.cue_id||"")+'">'+
        '<small>'+pick(fr,"Priest’s action","Action du prêtre")+'</small>'+
        '<p lang="'+lang+'">'+esc(value)+'</p></aside>';
    }
    return '<div class="aoMXTextRow" data-ao-mx-cue="'+esc(unit.cue_id||"")+'">'+
      (unit.latin?'<p lang="la" class="aoMXLatin">'+esc(unit.latin)+'</p>':"")+
      (translation?'<p lang="'+(fr?"fr":"en")+'" class="aoMXTranslation">'+esc(translation)+'</p>':
       '<p class="aoMXQuiet">'+pick(fr,"Translation unavailable for this cue.","Traduction indisponible pour ce segment.")+'</p>')+
    '</div>';
  }).join("");
  return '<section class="aoMXText" aria-label="'+esc(pick(fr,"Canonical liturgical text","Texte liturgique canonique"))+'">'+
    '<h2>'+esc(source.Title)+'</h2>'+
    (source.Branch_Status&&source.Branch_Status!=="NORMATIVE_1962"?
      '<p class="aoMXQuiet">'+esc(pick(fr,"Conditional ceremonial branch · ","Branche cérémonielle conditionnelle · ")+source.Branch_Status)+'</p>':"")+
    (rows||'<p class="aoMXQuiet">'+esc(pick(fr,"No public text for this block.","Aucun texte publié pour cette section."))+'</p>')+
   '</section>';
}
function groupFor(key){return massMapPhaseIndex(key==="PRE.ASPERGES"?0:key==="POST.MASS"?31:Number(key.slice(-3)));}
export function massExplorerIndexHtml(catalog,{french=false}={}){
  const rows=groupLabels.map((labels,n)=>{
    const moments=catalog.sequence.filter(key=>groupFor(key)===n);
    return '<section class="aoMXGroup"><h2>'+esc(labels[french?1:0])+'</h2>'+
       moments.map(key=>{
         const moment=catalog.byKey.get(key);
         return '<button type="button" class="aoMXRow" data-ao-mx-moment="'+esc(key)+'">'+
           '<span class="aoMXIndex">'+esc(key==="PRE.ASPERGES"||key==="POST.MASS"?"·":String(moment.guide.sequence).padStart(2,"0"))+'</span>'+
           '<span><strong>'+esc(moment.guide.moment)+'</strong>'+
           (moment.blocks.length?'<small>'+moment.blocks.length+' '+pick(french,"source blocks","textes sources")+'</small>':"")+
           '</span></button>';
       }).join("")+'</section>';
  }).join("");
  return '<main class="aoMXWrap"><div class="aoMXHero"><small>'+pick(french,"UNDERSTAND THE MASS","COMPRENDRE LA MESSE")+'</small>'+
    '<h1>'+pick(french,"Mass Explorer","Explorer la Messe")+'</h1><p>'+pick(french,"Follow the Mass in its proper order, then open the original prayers and existing approved Guide explanations. This study reader does not change LIVE, Simple or Missal.",
     "Parcourez la Messe dans son ordre liturgique, puis ouvrez les prières originales et les explications du Guide existant. Ce lecteur d’étude ne modifie pas les modes LIVE, Simple ou Missel.")+
    '</p></div><div class="aoMXIndexSwitch"><button type="button" data-ao-mx-view="map">'+pick(french,"Visual Mass Map","Carte visuelle de la Messe")+'</button></div>'+rows+'</main>';
}
export function massExplorerMomentHtml(catalog,key,{blockId=null,french=false}={}){
  const moment=getMassExplorerMoment(catalog,key,{form:"SUNG"});
  if(!moment)return "";
  const {guide,blocks}=moment;
  const selected=blocks.find(x=>x.Block_ID===blockId)??blocks.find(x=>!x.Proper_Slot)??blocks[0]??null;
  const positions=catalog.sequence,idx=positions.indexOf(key);
  const guideSections=massMomentExistingGuideSections(guide);
  const links=massMomentStudyLinks(key);
  return '<main class="aoMXWrap aoMXMoment" data-ao-mx-current="'+esc(key)+'">'+
   '<small class="aoMXKicker">'+esc(pick(french,"SUNG MASS · ORIGINAL GUIDE","MESSE CHANTÉE · GUIDE D’ORIGINE"))+'</small>'+
   '<h1>'+esc(guide.moment)+'</h1><p class="aoMXLead">'+esc(guide.short)+'</p>'+
   (blocks.length?'<nav class="aoMXBlockIndex" aria-label="'+esc(pick(french,"Prayers and ceremonies","Prières et cérémonies"))+'">'+
     blocks.map(b=>'<button type="button" data-ao-mx-block="'+esc(b.Block_ID)+'" aria-current="'+(b===selected?"true":"false")+'">'+esc(b.Title)+'</button>').join("")+
     '</nav>':'<p class="aoMXQuiet">'+pick(french,"This Guide moment has no ordinary Sung source block; ceremony depends on the selected rite.","Cette étape du Guide ne comporte pas de texte ordinaire de la Messe chantée ; la cérémonie dépend du rite choisi.")+'</p>')+
   sourceBlockHtml(catalog,selected,french)+
   '<details class="aoMXDetails" open><summary>'+pick(french,"Guide explanation","Explication du Guide")+'</summary>'+
     (french?'<p class="aoMXQuiet" lang="fr">Le commentaire du Guide est actuellement disponible en anglais ; aucune traduction française n’est inventée.</p>':"")+
     '<p class="aoMXQuiet">'+pick(french,"Existing Guide commentary for the broader Mass moment, not an independently certified commentary on every individual prayer.",
     "Commentaire existant du Guide pour l’ensemble de l’étape, non une analyse distinctement certifiée de chaque prière.")+'</p>'+
     guideSections.map(x=>'<section><h2>'+esc(x.heading)+'</h2><p>'+esc(x.text)+'</p></section>').join("")+'</details>'+
   (links.scriptureAnchorIds.length?'<section class="aoMXRelated"><p class="aoMXQuiet">'+pick(french,
     "Curated Scripture parallels for this broader Guide moment; relationship labels appear with each passage.",
     "Rapprochements bibliques étudiés pour l’étape entière du Guide ; chaque lien précise son rapport au texte.")+'</p>'+
     massFormationScriptureHtmlForAnchorIds(links.scriptureAnchorIds,{french})+'</section>':"")+
   guideSources(guide,french)+
   (links.stageId?'<section class="aoMXFormationLink"><button type="button" data-ao-mx-study="'+esc(links.stageId)+'">'+
     esc(pick(french,"Open related Formation lesson · ","Ouvrir la leçon de Formation · ")+links.stageId)+' →</button></section>':"")+
   '<nav class="aoMXPreviousNext">'+
     '<button type="button" data-ao-mx-prev '+(idx<=0?"disabled":"")+'>'+pick(french,"Previous","Précédent")+'</button>'+
     '<button type="button" data-ao-mx-index>'+pick(french,"All moments","Toutes les étapes")+'</button>'+
     '<button type="button" data-ao-mx-next '+(idx===positions.length-1?"disabled":"")+'>'+pick(french,"Next","Suivant")+'</button>'+
   '</nav></main>';
}

export function massExplorerCss(){
 return [
  "#ao-mass-explorer-root{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14972;background:var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#eee9df);overflow-y:auto;overscroll-behavior:contain;font-family:var(--ao-font-body,Georgia,serif)}",
  "#ao-mass-explorer-root[hidden]{display:none!important}#ao-mass-explorer-root *{box-sizing:border-box}",
  ".aoMXTop{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:10px;align-items:center;padding:calc(9px + var(--safe-top,0px)) 12px 10px;border-bottom:1px solid var(--ao-rule,#393c40);background:#080c12eF;backdrop-filter:blur(12px)}",
  ".aoMXTop div{text-align:center;min-width:0}.aoMXTop small{display:block;color:var(--liturgical,#c9ad78);letter-spacing:.1em;font:600 .62rem/1.4 system-ui}.aoMXTop strong{display:block;line-height:1.35}",
  ".aoMXTop button,.aoMXPreviousNext button{min-height:44px;border:1px solid var(--ao-rule,#393c40);border-radius:9px;background:var(--ao-surface-1,#101821);color:inherit;cursor:pointer}",
  ".aoMXWrap{width:min(820px,100%);margin:auto;padding:26px 16px 55px}.aoMXWrap h1{font:500 clamp(2rem,7vw,3.2rem)/1.12 var(--ao-font-display,Georgia,serif);margin:9px 0 12px}.aoMXHero{padding:8px 0 28px}.aoMXHero small,.aoMXKicker{color:var(--liturgical,#c9ad78);font:600 .7rem/1.4 system-ui;letter-spacing:.1em}.aoMXHero p,.aoMXLead{color:var(--ao-text-muted,#adb2b7);line-height:1.62}",
  ".aoMXGroup{margin:12px 0 26px}.aoMXGroup h2{color:var(--liturgical,#c9ad78);font:500 1.2rem/1.4 var(--ao-font-display,Georgia,serif);border-bottom:1px solid var(--ao-rule,#393c40);padding:11px 0;margin:0}",
  ".aoMXRow{display:grid;grid-template-columns:38px 1fr;gap:8px;width:100%;min-height:56px;padding:13px 4px;align-items:center;text-align:left;border:0;border-bottom:1px solid var(--ao-rule,#393c40);background:transparent;color:inherit;cursor:pointer}.aoMXRow strong{font:500 1rem/1.4 var(--ao-font-display,Georgia,serif)}.aoMXRow small{display:block;color:var(--ao-text-muted,#adb2b7);font:400 .7rem/1.5 system-ui}.aoMXIndex{color:var(--liturgical,#c9ad78);font:400 .74rem/1 system-ui}",
  ".aoMXBlockIndex{display:flex;gap:8px;overflow:auto;scrollbar-width:thin;padding:12px 0 18px;scroll-snap-type:x proximity}.aoMXBlockIndex button{flex:0 0 auto;max-width:250px;min-height:44px;padding:10px 12px;border:1px solid var(--ao-rule,#393c40);border-radius:8px;background:var(--ao-surface-1,#101821);color:inherit;text-align:left;white-space:normal;font:400 .78rem/1.35 system-ui;scroll-snap-align:start}.aoMXBlockIndex button[aria-current=true]{border-color:var(--liturgical,#c9ad78);color:var(--liturgical,#c9ad78)}",
  ".aoMXText{margin:8px 0 25px;padding:8px 0;border-top:1px solid var(--ao-rule,#393c40)}.aoMXText h2,.aoMXDetails h2{font:500 1.2rem/1.4 var(--ao-font-display,Georgia,serif)}.aoMXTextRow{padding:12px 0;border-bottom:1px solid var(--ao-rule,#393c40)}.aoMXLatin{font:400 1.15rem/1.7 var(--ao-font-body,Georgia,serif);margin:0 0 9px}.aoMXTranslation{font:400 .99rem/1.6 var(--ao-font-body,Georgia,serif);margin:0;color:var(--ao-text-muted,#adb2b7)}",
  ".aoMXAction{margin:8px 0;padding:12px 14px;border-left:2px solid var(--liturgical,#c9ad78);background:var(--ao-surface-1,#101821);color:var(--ao-text-muted,#adb2b7)}.aoMXAction small{display:block;margin:0 0 5px;color:var(--liturgical,#c9ad78);font:600 .65rem/1.4 var(--ao-font-ui,system-ui);letter-spacing:.06em;text-transform:uppercase}.aoMXAction p{margin:0;font:400 .9rem/1.55 var(--ao-font-body,Georgia,serif);white-space:pre-line}",
  ".aoMXIndexSwitch button{min-height:44px;padding:9px 13px;border:1px solid var(--liturgical,#c9ad78);background:transparent;color:var(--liturgical,#c9ad78);border-radius:9px;cursor:pointer}",
  massMapCss(),
  ".aoMXDetails{border-top:1px solid var(--ao-rule,#393c40);margin:17px 0;padding:9px 0}.aoMXDetails summary{min-height:44px;cursor:pointer;color:var(--liturgical,#c9ad78);font:500 1.05rem/1.5 var(--ao-font-display,Georgia,serif);padding:10px 0}.aoMXDetails p{white-space:pre-line;line-height:1.65}.aoMXDetails a{color:var(--liturgical,#c9ad78);overflow-wrap:anywhere}.aoMXQuiet{font:400 .8rem/1.52 system-ui;color:var(--ao-text-muted,#adb2b7)}",
  ".aoMXRelated .aoMFBible{margin-top:12px}.aoMXRelated .aoMFBible ul{list-style:none;margin:0;padding:0}.aoMXRelated .aoMFBibleItem{margin:8px 0;border:1px solid var(--ao-rule,#393c40);border-radius:10px;padding:12px}.aoMXRelated .aoScriptureContextCapsule{display:flex;flex-wrap:wrap;gap:6px;justify-content:space-between;align-items:center;width:100%;min-height:44px;background:transparent;color:var(--liturgical,#c9ad78);border:0;text-align:left}.aoMXRelated .aoMFBibleItem small{display:block;color:var(--ao-text-muted,#adb2b7);line-height:1.4}",
  ".aoMXFormationLink button{width:100%;min-height:48px;padding:12px 15px;background:var(--ao-surface-1,#101821);color:var(--liturgical,#c9ad78);border:1px solid var(--ao-rule,#393c40);border-radius:10px;text-align:left;font:500 .85rem/1.5 system-ui;cursor:pointer}",
  ".aoMXPreviousNext{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:7px;margin:25px 0}.aoMXPreviousNext button:disabled{opacity:.35}.aoMXMoment{padding-top:20px}",
  "#ao-mass-explorer-root :is(button,summary,a):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}",
  "@media(max-width:430px){.aoMXWrap{padding:17px 13px 44px}.aoMXTop{gap:6px}.aoMXTextRow{padding:9px 0}.aoMXPreviousNext button{font-size:.76rem}}",
  "@media(prefers-reduced-motion:reduce){.aoMXBlockIndex{scroll-behavior:auto}}"
 ].join("");
}

export function createMassExplorerRuntime(win=globalThis,{fetchImpl=globalThis.fetch}={}){
  let catalog=null,loading=null,returnFocus=null,momentKey=null,blockId=null,indexView="map";
  const root=()=>win?.document?.getElementById?.(MASS_EXPLORER_ROOT)||null;
  const french=()=>win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"||
       String(win?.document?.documentElement?.lang||"").startsWith("fr");
  function paint({focusBlock=false}={}){
    const node=root();if(!node||!catalog)return false;
    const fr=french();
    node.setAttribute("aria-label",pick(fr,"Mass Explorer","Explorer la Messe"));
    node.innerHTML='<style>'+massExplorerCss()+'</style>'+
      '<header class="aoMXTop"><button type="button" data-ao-mx-back aria-label="'+pick(fr,"Back","Retour")+'">←</button>'+
      '<div><small>FORMATION</small><strong>'+pick(fr,"Mass Explorer","Explorer la Messe")+'</strong></div>'+
      '<button type="button" data-ao-mx-close aria-label="'+pick(fr,"Close","Fermer")+'">×</button></header>'+
      (momentKey?massExplorerMomentHtml(catalog,momentKey,{blockId,french:fr}):
        indexView==="map"?massMapHtml(catalog,{french:fr}):massExplorerIndexHtml(catalog,{french:fr}));
    node.scrollTop=0;
    const selected=node.querySelector('.aoMXBlockIndex [aria-current="true"]');
    const rail=selected?.closest?.(".aoMXBlockIndex");
    if(rail){
      // Rebuilding the tab row resets its scrollLeft. Keep the selected
      // canonical source block visible without scrolling the article itself.
      const container=rail.getBoundingClientRect(),item=selected.getBoundingClientRect();
      rail.scrollLeft+=(item.left-container.left)-(container.width-item.width)/2;
    }
    const heading=node.querySelector("main h1");
    heading?.setAttribute("tabindex","-1");
    (focusBlock&&selected?selected:heading)?.focus?.({preventScroll:true});
    return true;
  }
  function setMoment(key,selectedBlockId=null){
    if(!catalog?.byKey.has(key))return false;
    momentKey=key;
    blockId=selectedBlockId&&catalog.byBlock.get(selectedBlockId)?.key===key?selectedBlockId:null;
    return paint({focusBlock:Boolean(selectedBlockId)});
  }
  function close(toLearn=false){
    const node=root();
    if(node?.contains?.(win?.document?.activeElement))win.document.activeElement?.blur?.();
    node?.remove();
    win?.document?.body?.classList?.remove?.("aoMassExplorerOpen");
    if(toLearn)Promise.resolve().then(()=>win?.AO_LEARN_APP_V1?.open?.());
    else try{returnFocus?.focus?.({preventScroll:true});}catch{}
    returnFocus=null;return true;
  }
  function ensureRoot(){
    let node=root();if(node)return node;
    if(!win?.document?.body)return null;
    node=win.document.createElement("section");node.id=MASS_EXPLORER_ROOT;
    node.setAttribute("role","region");node.setAttribute("aria-label",french()?"Explorer la Messe":"Mass Explorer");
    node.dataset.aoMassExplorerOwner=MASS_EXPLORER_VERSION;
    node.addEventListener("click",event=>{
      const t=event.target?.closest?.("button");if(!t)return;
      if(t.matches("[data-ao-mx-close]")){event.preventDefault();close(true);return;}
      if(t.matches("[data-ao-mx-back]")){event.preventDefault();if(momentKey){momentKey=null;blockId=null;paint();}else close(true);return;}
      if(t.dataset.aoMxMoment){event.preventDefault();setMoment(t.dataset.aoMxMoment);return;}
      if(t.dataset.aoMxMapBlock){
        event.preventDefault();
        const target=catalog?.byBlock.get(t.dataset.aoMxMapBlock);
        if(target)setMoment(target.key,t.dataset.aoMxMapBlock);
        return;
      }
      if(t.dataset.aoMxView){
        event.preventDefault();
        if(t.dataset.aoMxView==="map"||t.dataset.aoMxView==="list"){
          indexView=t.dataset.aoMxView;momentKey=null;blockId=null;paint();
        }
        return;
      }
      if(t.dataset.aoMxPhase!==undefined){
        event.preventDefault();
        const n=Number(t.dataset.aoMxPhase),phase=Number.isInteger(n)?projectMassMap(catalog).phases[n]:null;
        if(!phase)return;
        node.querySelectorAll("[data-ao-mx-phase]").forEach(button=>
          button.getAttribute("data-ao-mx-phase")===String(n)?
            button.setAttribute("aria-current","step"):button.removeAttribute("aria-current"));
        const section=node.querySelector('[data-ao-mx-phase-section="'+n+'"]');
        section?.scrollIntoView?.({block:"start",behavior:win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?"instant":"smooth"});
        section?.querySelector?.("h2")?.setAttribute?.("tabindex","-1");
        section?.querySelector?.("h2")?.focus?.({preventScroll:true});
        return;
      }
      if(t.matches("[data-ao-mx-open-mass]")){
        event.preventDefault();
        t.disabled=true;
        void Promise.resolve(win?.AO_APP_SHELL_V1?.navigate?.("mass")).then(result=>{
          if(result?.ok===true)return;
          if(t.isConnected){
            t.disabled=false;
            const notice=win.document.createElement("p");
            notice.setAttribute("role","alert");
            notice.className="aoMXQuiet";
            notice.textContent=pick(french(),"Mass preparation could not be opened; your study position is preserved.","La préparation de la Messe n’a pas pu s’ouvrir ; votre position d’étude est conservée.");
            t.insertAdjacentElement("afterend",notice);
          }
        }).catch(error=>{
          win?.console?.error?.("Mass preparation handoff failed",error);
          if(t.isConnected)t.disabled=false;
        });
        return;
      }
      if(t.dataset.aoMxBlock){event.preventDefault();setMoment(momentKey,t.dataset.aoMxBlock);return;}
      if(t.dataset.aoMxStudy){
        event.preventDefault();
        const stageId=t.dataset.aoMxStudy;
        const explorerReturn={momentKey,blockId};
        close(false);
        void win?.AO_LEARN_APP_V1?.openModule?.("learn.mass",{stageId,explorerReturn})
          ?.catch?.(error=>win?.console?.error?.("Formation lesson could not open",error));
        return;
      }
      if(t.matches("[data-ao-mx-index]")){event.preventDefault();momentKey=null;blockId=null;paint();return;}
      if(t.matches("[data-ao-mx-prev],[data-ao-mx-next]")){
        event.preventDefault();const i=catalog.sequence.indexOf(momentKey),next=i+(t.matches("[data-ao-mx-next]")?1:-1);
        if(next>=0&&next<catalog.sequence.length)setMoment(catalog.sequence[next]);
      }
      // Shared Scripture click owner receives the original capsule bubbling event.
    });
    win.document.body.append(node);return node;
  }
  async function open(opts={}){
    returnFocus=opts.trigger??win?.document?.activeElement??null;
    if(!catalog){
      if(!loading)loading=loadMassExplorerCatalog({fetchImpl}).then(x=>{catalog=x;return x}).finally(()=>loading=null);
      try{await loading;}catch(error){win?.console?.error?.("Mass Explorer sources unavailable",error);return false;}
    }
    if(!ensureRoot())return false;
    indexView=opts.view==="list"?"list":"map";
    const requested=opts.blockId&&catalog.byBlock.get(opts.blockId);
    momentKey=requested?.key??(catalog.byKey.has(opts.momentKey)?opts.momentKey:null);
    blockId=requested?.source.Block_ID??null;
    win?.document?.body?.classList?.add?.("aoMassExplorerOpen");
    paint();return true;
  }
  const status=()=>Object.freeze({installed:true,open:!!root(),version:MASS_EXPLORER_VERSION,
    momentKey,blockId,indexView,moments:catalog?.sequence.length??0,sourceBlocks:catalog?.byBlock.size??0,
    p0Crosswalk:catalog?.crosswalkStatus??"P0_PENDING"});
  return Object.freeze({open,close,status,setMoment});
}

export function installMassExplorerModule(win=globalThis){
  if(!win)return false;
  if(!win.AO_MASS_EXPLORER_V1)win.AO_MASS_EXPLORER_V1=createMassExplorerRuntime(win);
  if(win?.AO_MODULES?.__aoMassExplorerV1)return win.AO_MASS_EXPLORER_V1;
  const base=win?.AO_MODULES;if(!base)return false;
  const runtime=win.AO_MASS_EXPLORER_V1;
  const definition=Object.freeze({id:MASS_EXPLORER_ROUTE,type:"module",domain:"learn",category:"mass-explorer",title:"Mass Explorer"});
  const wrapper={...base,__aoMassExplorerV1:true,
    get(id){return id===MASS_EXPLORER_ROUTE?definition:base.get?.(id)||null;},
    resolve(id){if(id===MASS_EXPLORER_ROUTE)return {ok:true,input:id,id,defaults:{},chain:[id],definition};return base.resolve?.(id);},
    async open(id,opts={}){if(id===MASS_EXPLORER_ROUTE)return {ok:await runtime.open(opts),input:String(id),canonicalId:id,type:"module",domain:"learn",options:opts,error:null};return base.open?.(id,opts);},
    list(filter={}){const prior=[...(base.list?.(filter)||[])].filter(x=>x?.id!==MASS_EXPLORER_ROUTE);
      if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="learn"))prior.push(definition);
      return prior;}
  };
  win.AO_MODULES=wrapper;win.AO_MODULE_REGISTRY_V36=wrapper;
  return runtime;
}
