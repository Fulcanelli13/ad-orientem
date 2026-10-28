import "./confession-path-styles.js";
import "./stations-direct-access-styles.js";
import "./five-wounds-chaplet-styles.js";
import "./first-monthly-direct-prayers-styles.js";
import { confessionExaminationCards, confessionRiteCards, confessionAfterCards, confessionStepAt, confessionPath, CONFESSION_PATHS, CONFESSION_SOURCE_LINKS, CONFESSION_HISTORICAL_SOURCE_POLICY } from "./confession-paths.js";
import {B01_PIUS_X_1905_CONTRITION} from "./icksp-batch01-public.v1.js";
import "./canonical-data.js";
import {libraryGuideForPrayer} from "./library-context.js";
import "./presentation-styles.js";
import "./adoration-folio-styles.js";
import {installAngelusCardDeck} from "./devotional-card-deck.js";
import {updateDevotionalProgress,devotionalProgressMarkup} from "./devotional-progress.js";
import {angelusCommunalParts} from "./angelus-folio-recitation.js";
import {internalPrayerView,supportedDirectPrayerRoute} from "./internal-route-owner.js";
import {FIVE_WOUNDS_SOURCE_V1,FIVE_WOUNDS_WOUNDS_V1,FIVE_WOUNDS_CHAPLET_V1,fiveWoundsStep,fiveWoundsGroupProgress} from "./five-wounds-chaplet.v1.js";
import {installSequentialDevotionalReader,mercyChapters} from "./devotional-sequence-adapter.js";
import {ensureDevotionalReadingRunway} from "./devotional-reading-runway.js";
import {monthlyDevotionalRegister} from "./quiet-devotional-progression.js";
import "./quiet-devotional-progression-styles.js";
import {showDevotionalInterlude,showDevotionalParagraphCue,resetDevotionalCinematicSession} from "./devotional-cinematic.js";
import {resolveAngelusIncarnationCinematic} from "./angelus-cinematic-policy.js";
import {certifiedPublicStationCue,stationPhaseOfFocusedParagraph,STATIONS_PUBLIC_POSTURE_SOURCE} from "./stations-posture-policy.js";
import {resolveDevotionalActionScene,createDevotionalActionCinematic} from "./devotional-action-cinematics.js";
import "./devotional-methods-styles.js";
import "./tenebrae-styles.js";
import {loadTenebraeHour} from "./tenebrae-1960.js";
import {renderTenebraeBody} from "./tenebrae-presentation.js";
import {freshTenebraeCeremony,tenebraeCeremonialAction} from "./tenebrae-ceremonial.v1.js";
import { angelusGuideSections, resolveAngelusPosture, splitAngelusVersicleResponse } from "./angelus-guide-data.js";
import { rosaryGuideSections } from "./rosary-guide-data.js";
import {B01_AUGUST_QUEEN_SOURCE} from "./icksp-batch01-public.v1.js";
import { rosaryNamedChapters,rosaryCurrentChapter } from "./rosary-card-chapters.js";
import {installRosaryActiveCard} from "./rosary-active-card.js";
import { divineMercySteps, mercyStepText, MERCY_WITNESSES, MERCY_OPTIONAL_OPENINGS, rosaryPlan, ROSARY_METHODS } from "./devotional-methods-v1.js";
import {mercyBeadNavHTML,updateMercyBeadNav} from "./mercy-bead-presentation.js";
import { applyRosaryScripturePolicy } from "./rosary-scripture-policy.js";
import { scriptureContextCapsule } from "../scripture/context.js";
import { glossaryContextCapsule } from "../app/contextual-study.js";
import {prayerScriptureOrigin,stationScriptureOrigin} from "./scripture-origins.js";
import { prayEditionWitness } from "./prayer-edition-witnesses.v1.js";
import { canonicalAssetIdForPrayRoute, getCanonicalAsset, resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { formatDisplayDate, parseDisplayDate } from "../app/date-format.js";
import { isFirstWeekday as calendarIsFirstWeekday } from "../calendar/intelligence.js";
import { DEVOTIONAL_UX_CONTRACT_VERSION, devotionalUxContract } from "./devotional-ux-contract.js";
import { LITANY_SOURCE_WITNESSES, LITANY_WITNESS_REVIEW_V1, reviewLitanyTranscription, extractLitanyProper, paginateLitanyProper } from "./litany-source.js";
import {BATCH03_LITANY_EDITION_POLICY,BATCH03_ICRSP_MAJOR_PROCESSION_STEPS,BATCH03_LITANY_SOURCE_STATUS,batch03LitanyUse} from "./litany-1962-use-policy.js";
import {PENITENTIAL_PSALMS_VULGATE,penitentialPsalmReference,auditPenitentialPsalmResponse,PENITENTIAL_PSALMS_TEXT_STATUS} from "./penitential-psalms-source.js";
import { DEVOTIONAL_WITNESSES, PRAYER_WITNESSED_VARIANTS } from "./devotional-witness-links.v1.js";
import { parseSevenWordsHistoricalWitness } from "./seven-words-witness.v1.js";
import {sevenWordsLocalWitnessText, SEVEN_WORDS_LOCAL_EN_1889_V1} from "./seven-words-offline-1889.v1.js";
import { prayCollationNotice } from "./source-collation-notices.v1.js";
import { prayerCompendiumFrenchWitness } from "./compendium-french-witnesses.v1.js";
import {christKingStages,CHRIST_KING_OPTION_DEFAULTS,CHRIST_KING_CONSECRATION,CHRIST_KING_ROYAL_PRAISES,CHRIST_KING_WITNESSES} from "./christ-king-benediction.js";
import {benedictionAlleluiaStatus,benedictionVersiclesForDate,BENEDICTION_1962_WITNESS} from "./benediction-1962.js";
import {divinePraisesForForm,DIVINE_PRAISES_EDITION} from "./benediction-divine-praises.js";
import {FORTY_HOURS_SOLEMN_SOURCE,FORTY_HOURS_SOLEMN_STAGES,fortySolemnAt} from "./forty-hours-solemn.js";
import {EUCHARISTIC_WITNESS_IDS,getEucharisticWitness,EUCHARISTIC_SOURCE} from "./eucharistic-witnesses.js";
import {instituteOptionalFor} from "./icksp-batch02-optional.js";
import {SACRED_HEART_DEVOTIONS_V382} from "./traditional-pray-data.js";
import {ADORATION_FOUR_OPTIONAL_SOURCE_IDS,ADORATION_FOUR_SOURCE_LABELS,adorationFourOptionFor,normalizedAdorationFourChoices} from "./adoration-four-purpose-options.js";

// Locked v43.59.30 PRAY presentation runtime. Kept intact inside a browser-only
// guard so unit tests may import the modular owner without a DOM.
if(typeof window!=="undefined"&&typeof document!=="undefined"&&!window.AO_PRAY_V435930){

(()=>{'use strict';
const VERSION='43.59.30-pray-acceptance';
let homeNavigationError=false,homeNavigationPending=false;
const STORE_KEY='ao.pray.v435930';
const ROOT_ID='aoPray435930';
const actionCinematics=createDevotionalActionCinematic(window);
const DATA=window.AO_PRAY_CANONICAL_DATA_V435930||{prayers:{},categories:{}};
const BASE=window.AO_MODULES;
const PRAY_CTX={surface:'domain',domain:'pray'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const PRAY_EMBEDDED_CANONICAL_ASSET_IDS=new Set([
 'ao-refined-scripture','ao-refined-devotions','ao-rich-immaculate-heart','ao-rich-prayer-library','ao-rich-novenas',
 'ao-rich-begin-end-day','ao-rich-morning-offering','ao-rich-night-prayer','ao-rich-our-lady-marian-devotions','ao-rich-examination-of-conscience'
]);
const embeddedAssetIcon=(assetId,className)=>{
 const symbol=document.getElementById(assetId);
 if(!symbol)return'';
 const viewBox=symbol.getAttribute('viewBox')||symbol.getAttribute('viewbox')||'0 0 128 128';
 return `<svg class="${esc(className)}" data-ao-asset-id="${esc(assetId)}" data-ao-asset-renderer="embedded-symbol" viewBox="${esc(viewBox)}" aria-hidden="true" focusable="false"><use href="#${esc(assetId)}"></use></svg>`;
};
const assetIcon=(assetId,className='aoP435930UiIcon',opts={})=>{
 if(assetId==='ao-ui-back')return `<svg class="${esc(className)}" data-ao-inline-asset-id="ao-ui-back" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M10.5 6.5 5 12l5.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
 if(assetId==='ao-ui-close')return `<svg class="${esc(className)}" data-ao-inline-asset-id="ao-ui-close" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M6.75 6.75 17.25 17.25M17.25 6.75 6.75 17.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
 if(assetId==='ao-live-sign-cross')return `<svg class="${esc(className)}" data-ao-inline-asset-id="ao-live-sign-cross" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 3.5v17M7.2 8.2h9.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M12 3.5c1.2 1 2.1 1.7 3 2.2M7.5 12c1.3 1.6 2.8 2.8 4.5 3.8M16.5 12c-1.3 1.6-2.8 2.8-4.5 3.8" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" opacity=".55"/></svg>`;
 const asset=getCanonicalAsset(assetId);
 if(!asset)return'';
 if(opts.preferEmbedded||asset.kind==='embedded_svg_symbol'||asset.kind==='symbol'){
   const embedded=embeddedAssetIcon(assetId,className);
   if(embedded)return embedded;
 }
 const url=resolveCanonicalAssetUrl(assetId);
 if(url)return `<span class="${esc(className)}" data-ao-asset-id="${esc(assetId)}" data-ao-asset-renderer="mask" aria-hidden="true" style="display:inline-block;width:1em;height:1em;background:currentColor;-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`;
 return embeddedAssetIcon(assetId,className);
};
const moduleIcon=route=>{
 const assetId=canonicalAssetIdForPrayRoute(route);
 if(!assetId)return'';
 const icon=assetIcon(assetId,'aoP435930ModuleAsset',{preferEmbedded:PRAY_EMBEDDED_CANONICAL_ASSET_IDS.has(assetId)});
 if(!icon)return'';
 return `<span class="aoP435930ModuleIcon" data-ao-pray-module-route="${esc(route)}" data-ao-pray-module-asset="${esc(assetId)}">${icon}</span>`;
};
// Vespers boundary is supplied by the user, never inferred from a civil-clock hour.
let angelusSaturdayVespersDate=null;
function selectedWeekday(){
 const d=new Date(selectedDateKey()+'T12:00:00');
 return Number.isNaN(d.getTime())?new Date().getDay():d.getDay();
}
function selectedSunday(){return selectedWeekday()===0}
function semanticRailChip(assetId,label,value='',opts={}){
 if(!assetId||!label)return'';
 const channel=opts.channel==='transient'?'transient':'persistent';
 const cueClass=channel==='transient'?' cue-enter':'';
 return `<div class="aoP435930SemanticRailChip ${channel}${cueClass}" data-ao-pray-rail-channel="${channel}" data-ao-pray-rail-asset="${esc(assetId)}"><span class="aoP435930SemanticRailCard">${assetIcon(assetId,'aoP435930SemanticRailIcon')}</span><span class="aoP435930SemanticRailLabel">${esc(label)}</span>${value?`<small>${esc(value)}</small>`:''}</div>`;
}
function ritualChannelLabel(channel){
 return ({posture:L('Posture','Posture'),gesture:L('Gesture','Geste'),action:L('Action','Action'),context:L('Context','Contexte')})[channel]||channel;
}
function ritualSlotMarkup(channel,assetId,label,{emphasis=false,value=''}={}){
 if(!channel||!assetId||!label)return'';
 return `<div class="aoRitualSlot${emphasis?' is-emphasis':''}" data-channel="${esc(channel)}" data-value="${esc(value||label)}"${emphasis?' role="status" aria-live="polite"':''}>${assetIcon(assetId,'aoRitualIcon')}<span class="aoRitualMeta"><span class="aoRitualKey">${esc(ritualChannelLabel(channel))}</span><span class="aoRitualValue">${esc(label)}</span></span></div>`;
}
function angelusExactPosture(){
 const form=angelusChoice().form;
 const choice=resolveAngelusPosture({form,weekday:selectedWeekday(),saturdayAfterVespers:angelusSaturdayVespersDate===selectedDateKey()});
 const stand=choice.stand;
 return {form,stand,assetId:stand?'ao-live-stand':'ao-live-kneel',label:stand?L('Stand','Debout'):L('Kneel','À genoux')};
}
function angelusExactRailMarkup(){
 const p=angelusExactPosture();
 return `<aside class="aoRitualRail aoRitualFaithfulRail" data-ao-ritual-rail data-ao-ritual-module="angelus" data-ao-ritual-channels="posture,gesture" aria-label="${esc(L('Prayer posture and gesture','Posture et geste de prière'))}">${ritualSlotMarkup('posture',p.assetId,p.label,{value:p.stand?'stand':'kneel'})}</aside>`;
}
function semanticRails(){
 let left='',right='';
 if(view==='angelus'){
   // Angelus owns the exact donor ritual grid inside renderAngelus().
   return'';
 }else if(view==='rosary'){
   // Exact donor v3.14 keeps the Rosary chooser rail-free; ritual state begins inside the canonical player.
   return'';
 }else if(view==='stations'){
   const roman=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV'];
   const i=Math.max(0,Math.min(13,Number(STATIONS.step)||0));
   left=semanticRailChip(
     i===13?'ao-refined-silence':'ao-live-look',
     i===13?L('Silence','Silence'):L('Face station','Regardez la station'),
     i===13?L('After the XIV Station','Après la XIVe station'):L('Become still','Demeurez immobile'),
     {channel:i===13?'transient':'persistent'}
   );
   right=semanticRailChip('ao-rich-stations',L('Stations','Chemin de Croix'),`${roman[i]} / XIV`,{channel:'persistent'});
 }else if(view==='adoration'){
   const presence=adorationPresence();
   const arrival=ADOR.mode==='visit'&&ADOR.visitStep===0;
   left=arrival
     ?semanticRailChip('ao-live-genuflect',L('Genuflect','Génuflexion'),L('On arrival','À l’arrivée'),{channel:'transient'})
     :semanticRailChip('ao-refined-silence',L('Silence','Silence'),L('Remain present','Demeurez présent'),{channel:'persistent'});
   right=semanticRailChip('ao-rich-adoration',L('Adoration','Adoration'),presence==='exposed'?L('Exposed','Exposé'):L('Reserved','Réservé'),{channel:'persistent'});
 }else if(view==='benediction'){
   const stage=benStages()[BEN.step]?.[0]||'exposition';
   const service={
     exposition:['ao-rich-adoration',L('Exposition','Exposition')],
     adoration:['ao-refined-silence',L('Adoration','Adoration')],
     hymn:['ao-rich-adoration','Tantum Ergo'],
     prayer:['ao-live-response',L('Respond','Répondre')],
     blessing:['ao-live-blessing',L('Blessing','Bénédiction')],
     praises:['ao-live-response',L('Divine Praises','Louanges divines')],
     reposition:['ao-rich-adoration',L('Reposition','Reposition')]
   }[stage]||['ao-rich-adoration',L('Benediction','Bénédiction')];
   if(stage==='prayer'||stage==='praises')left=semanticRailChip('ao-live-response',L('Respond','Répondre'),'',{channel:'transient'});
   right=semanticRailChip(service[0],service[1],L('Public rite','Rite public'),{channel:stage==='adoration'?'persistent':'transient'});
 }else if(view==='fortyHours'){
   const stage=Math.max(0,Math.min(FORTY_STAGES.length-1,FORTY.step));
   const cues=[
     ['ao-live-genuflect',L('Reverence','Révérence'),L('On arrival','À l’arrivée'),'transient'],
     ['ao-refined-silence',L('Silence','Silence'),L('Adore','Adorer'),'persistent'],
     ['ao-rich-prayer-library',L('Prayer aid','Aide de prière'),L('Optional','Facultatif'),'persistent'],
     ['ao-live-response',L('Public devotion','Dévotion publique'),L('Follow the church','Suivez l’église'),'transient'],
     ['ao-live-blessing',L('Benediction','Bénédiction'),L('Public rite','Rite public'),'transient'],
     ['ao-live-genuflect',L('Final reverence','Révérence finale'),L('Before leaving','Avant de partir'),'transient']
   ];
   const cue=cues[stage]||cues[1];
   left=semanticRailChip(cue[0],cue[1],cue[2],{channel:cue[3]});
   right=semanticRailChip('ao-rich-adoration',L('Forty Hours','Quarante-Heures'),L(FORTY_STAGES[stage]?.[0]||'',FORTY_STAGES[stage]?.[1]||''),{channel:'persistent'});
 }else if(view==='confession'){
   // The phone accompanies preparation only. The sign-of-cross cue belongs
   // to the first rehearsal card, not to every card or an implied live rite.
   if(CONF.stage===2&&CONF.riteStep===0)left=semanticRailChip('ao-live-sign-cross',L('Sign of Cross','Signe de croix'),L('Before entering','Avant d’entrer'),{channel:'transient'});
   right=semanticRailChip(
     'ao-rich-confession',
     L('Confession','Confession'),
     [L('Prepare','Préparer'),L('Examination','Examen'),L('Before entering','Avant d’entrer'),L('After','Après')][CONF.stage]||L('Preparation','Préparation'),
     {channel:'persistent'}
   );
 }
 if(!left&&!right)return'';
 return `<div class="aoP435930SemanticRails" data-ao-pray-semantic-rails aria-hidden="true">${left?`<aside class="aoP435930SemanticRail left">${left}</aside>`:''}${right?`<aside class="aoP435930SemanticRail right">${right}</aside>`:''}</div>`;
}
const nl=v=>esc(v).replace(/\n/g,'<br>');
const runtime=()=>window.AO_RUNTIME_V8;
const core=()=>runtime()?.store?.getState?.()||{};
// Prayer locale is session-local; global UI language and Mass state are unchanged.
let praySessionLanguage=null;
const isFr=()=>(praySessionLanguage??core()?.language)==='fr';
const L=(en,fr)=>isFr()?(fr||en):en;
const lang=()=>isFr()?'fr':'en';
const P=id=>DATA.prayers?.[id]||null;
const nowIso=()=>new Date().toISOString();
const DEFAULT_STATE=Object.freeze({
  angelusMode:'auto',angelusHistoricalConclusion:true,angelusGuided:false,
  rosary:{form:'standard',mode:'simple',recitation:'individual'},
  stations:{mode:'guided',stabat:false,recitation:'individual'},
  adoration:{presence:'reserved'},
  firstFriday:{records:[],tracking:false},firstSaturday:{records:[],tracking:false}
});
function cloneDefault(){return JSON.parse(JSON.stringify(DEFAULT_STATE))}
function load(){
  const d=cloneDefault();
  try{
    const raw=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
    if(!raw||typeof raw!=='object')return d;
    d.angelusMode=['auto','angelus','regina'].includes(raw.angelusMode)?raw.angelusMode:'auto';
    d.angelusHistoricalConclusion=typeof raw.angelusHistoricalConclusion==='boolean'?raw.angelusHistoricalConclusion:true;
    d.angelusGuided=!!raw.angelusGuided;
    d.rosary.form=raw.rosary?.form==='devotional'?'devotional':'standard';
    d.rosary.mode=raw.rosary?.mode==='guided'?'guided':'simple';
    d.rosary.recitation=raw.rosary?.recitation==='group'?'group':'individual';
    d.stations.mode=raw.stations?.mode==='simple'?'simple':'guided';
    d.stations.stabat=!!raw.stations?.stabat;
    d.stations.recitation=raw.stations?.recitation==='group'?'group':(raw.rosary?.recitation==='group'?'group':'individual');
    d.adoration.presence='reserved';
    d.firstFriday.records=Array.isArray(raw.firstFriday?.records)?raw.firstFriday.records.filter(x=>x&&x.date).slice(-36):[];
    d.firstFriday.tracking=!!raw.firstFriday?.tracking;
    d.firstSaturday.records=Array.isArray(raw.firstSaturday?.records)?raw.firstSaturday.records.filter(x=>x&&x.date).slice(-36):[];
    d.firstSaturday.tracking=!!raw.firstSaturday?.tracking;
  }catch{}
  return d;
}
let S=load();
let view='home',familyId=null,returnContext=null,returnFocus=null,navStack=[],externalResume=null,rosaryDonorReturnSnapshot=null,lastRenderSignature='';
let MERCY={step:0,includeClosing:false,guide:'guided',optionsOpen:false};
let FIVE_WOUNDS={index:0,latin:false};
let ROSARY_FIFTEEN={active:false};
// Only a source-launched exact Rosary object owns this temporary return receipt.
let rosaryScriptureReturn=null;
let ROSARY_CHOOSER={method:'ordinary',decades:5,guide:S.rosary.mode==='guided'?'guided':'simple',optionsOpen:false};
function freshConfessionState(){return {stage:0,path:null,examStep:0,riteStep:0,afterStep:0,contrition:"standard",since:''}}
let CONF=freshConfessionState();
let BEN={step:0,divinePraises:false,praisesForm:'1962',celebration:"ordinary",feastOptions:{...CHRIST_KING_OPTION_DEFAULTS}};
let ADOR={mode:'home',visitStep:0,holyStep:0,fourStep:0,timer:null,timerEnd:0,quiet:false};
const ADOR_FOUR_CHOICES_KEY="ao.pray.adoration-four-choices.v1";
let ADOR_FOUR_CHOICES=null;
function adorationFourChoices(){
 if(ADOR_FOUR_CHOICES)return ADOR_FOUR_CHOICES;
 let raw={};try{raw=JSON.parse(globalThis.localStorage?.getItem(ADOR_FOUR_CHOICES_KEY)||"{}")}catch{}
 return ADOR_FOUR_CHOICES=normalizedAdorationFourChoices(raw);
}
function saveAdorationFourChoice(purpose,id){
 const old=adorationFourChoices();
 const next=normalizedAdorationFourChoices({...old,[purpose]:id||null});
 ADOR_FOUR_CHOICES=next;
 try{globalThis.localStorage?.setItem(ADOR_FOUR_CHOICES_KEY,JSON.stringify(next))}catch{}
}
// Adoration preserves an explicit, secondary handoff to the distinct public
// Benediction reader. The wording indicates whether this is a first visit or
// a return from that rite; opening Adoration never starts Benediction.
let adorationReturnFromBenediction=false;
let adorationQuietReturn=null;
let FF={step:0,intention:false,communion:false};
let FS={step:0,intention:false,communion:false,rosary:false,meditation:false,confessionDate:'',medSet:'joyful',medMystery:0};
let PEN={step:0,token:0};
let PEN_CACHE={busy:false,complete:false,checked:0,failed:[],audit:[],message:''};
let LIT={step:0,sections:null,loading:false,error:'',token:0,language:null,use:'private'};
let SEVEN={step:0,sections:null,appendix:'',loading:false,error:'',srcToken:0,scriptToken:0,scriptureOnly:false};
let FORTY={mode:'choose',step:0,solemnStep:0};
let STATIONS={step:0,optionsOpen:false,publicPosture:false,simpleResponses:false};
// An explicitly selected public Stations method owns its local recitation/depth.
// A shared Rosary or prayer-settings preference must not silently deactivate it.
const stationReaderMode=()=>STATIONS.publicPosture?'guided':S.stations.mode;
const stationRecitation=()=>STATIONS.publicPosture?'group':S.stations.recitation;
let ANGELUS_CARD_INDEX=0,angelusOptionsOpen=false;
let TEN={day:0,hour:'MATINS',step:0,face:'vernacular',guided:true,model:null,loading:false,error:null,epoch:0,ceremony:freshTenebraeCeremony()};
let lastStationsFxStep=null;
let angelusRitualObserver=null,lastAngelusRitualCard=null;
function stopAngelusExactRail(){
 try{angelusRitualObserver?.disconnect?.()}catch{}
 angelusRitualObserver=null;lastAngelusRitualCard=null;
}
function bindAngelusExactRail(){
 stopAngelusExactRail();
 if(view!=='angelus')return;
 const root=mount(),rail=root?.querySelector?.('[data-ao-ritual-module="angelus"]');
 if(!root||!rail||root.querySelector('[data-ao-devotional-deck]'))return;
 const p=angelusExactPosture(),cards=[...root.querySelectorAll('.aoP435930AngelusSequence .aoP435930PrayerUnit')];
 const sync=card=>{
   if(card===lastAngelusRitualCard)return;
   lastAngelusRitualCard=card||null;
   rail.querySelectorAll('[data-channel="gesture"]').forEach(x=>x.remove());
   const incarnation=p.form==='angelus'&&card?.dataset?.aoIncarnation==='true';
   if(incarnation&&p.stand){
     rail.insertAdjacentHTML('beforeend',ritualSlotMarkup('gesture','ao-live-profound-bow',L('Bow profoundly','Inclination profonde'),{emphasis:true,value:'profound-bow'}));
   }
 };
 sync(null);
 if(!cards.length)return;
 if(typeof IntersectionObserver!=='function'){sync(cards[0]);return}
 angelusRitualObserver=new IntersectionObserver(entries=>{
   const visible=entries.filter(e=>e.isIntersecting&&e.intersectionRatio>=.56).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
   if(visible[0])sync(visible[0].target);
 },{threshold:[.56,.7]});
 cards.forEach(card=>angelusRitualObserver.observe(card));
}
const STATION_DATA={"stationTitles":{"en":["Jesus Is Condemned to Death","Jesus Is Made to Bear His Cross","Jesus Falls the First Time","Jesus Meets His Blessed Mother","Simon of Cyrene Helps Jesus Carry His Cross","Veronica Wipes the Face of Jesus","Jesus Falls the Second Time","Jesus Consoles the Women of Jerusalem","Jesus Falls the Third Time","Jesus Is Stripped of His Garments","Jesus Is Nailed to the Cross","Jesus Dies on the Cross","Jesus Is Taken Down from the Cross","Jesus Is Laid in the Sepulchre"],"la":["Iesus condemnatur ad mortem","Iesus baiulat crucem","Iesus primum cadit sub cruce","Iesus occurrit Matri suae","Simon Cyrenaeus adiuvat Iesum crucem portare","Veronica faciem Iesu abstergit","Iesus iterum cadit sub cruce","Iesus alloquitur mulieres Ierusalem","Iesus tertium cadit sub cruce","Iesus vestibus exuitur","Iesus cruci affigitur","Iesus moritur in cruce","Iesus de cruce deponitur","Iesus in sepulcro ponitur"],"fr":["Jésus est condamné à mort","Jésus est chargé de sa croix","Jésus tombe pour la première fois","Jésus rencontre sa très sainte Mère","Simon de Cyrène aide Jésus à porter sa croix","Véronique essuie le visage de Jésus","Jésus tombe pour la deuxième fois","Jésus console les filles de Jérusalem","Jésus tombe pour la troisième fois","Jésus est dépouillé de ses vêtements","Jésus est cloué à la croix","Jésus meurt sur la croix","Jésus est descendu de la croix","Jésus est mis au tombeau"]},"stationVR":{"en":["℣. We adore Thee, O Christ, and we bless Thee.","℟. Because by Thy holy Cross Thou hast redeemed the world."],"la":["℣. Adoramus te, Christe, et benedicimus tibi.","℟. Quia per sanctam crucem tuam redemisti mundum."],"fr":["℣. Nous vous adorons, ô Christ, et nous vous bénissons.","℟. Parce que par votre sainte Croix vous avez racheté le monde."]},"stabat":["Stabat Mater dolorosa\niuxta Crucem lacrimosa,\ndum pendebat Filius.","Cuius animam gementem,\ncontristatam et dolentem,\npertransivit gladius.","O quam tristis et afflicta\nfuit illa benedicta,\nMater Unigeniti!","Quae maerebat et dolebat,\npia Mater, dum videbat\nnati poenas inclyti.","Quis est homo qui non fleret,\nMatrem Christi si videret\nin tanto supplicio?","Quis non posset contristari,\nChristi Matrem contemplari\ndolentem cum Filio?","Pro peccatis suae gentis\nvidit Iesum in tormentis,\net flagellis subditum.","Vidit suum dulcem Natum\nmoriendo desolatum,\ndum emisit spiritum.","Eia, Mater, fons amoris,\nme sentire vim doloris\nfac, ut tecum lugeam.","Fac ut ardeat cor meum\nin amando Christum Deum,\nut sibi complaceam.","Sancta Mater, istud agas,\nCrucifixi fige plagas\ncordi meo valide.","Tui Nati vulnerati,\ntam dignati pro me pati,\npoenas mecum divide.","Fac me tecum pie flere,\nCrucifixo condolere,\ndonec ego vixero."],"alphonsus":{"en":[{"consider":"Consider how Jesus, after having been scourged and crowned with thorns, was unjustly condemned by Pilate to die on the Cross.","prayer":"My adorable Jesus, it was not Pilate; no, it was my sins that condemned Thee to die. I beseech Thee, by the merits of this sorrowful journey, to assist my soul in its journey toward eternity. I love Thee, my beloved Jesus; I love Thee more than myself; I repent with my whole heart of having offended Thee. Never permit me to separate myself from Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider how Jesus, in making this journey with the Cross on His shoulders, thought of us, and offered for us to His Father the death He was about to undergo.","prayer":"My most beloved Jesus, I embrace all the tribulations Thou hast destined for me until death. I beseech Thee, by the merits of the pain Thou didst suffer in carrying Thy Cross, to give me the necessary help to carry mine with perfect patience and resignation. I love Thee, Jesus my love; I love Thee more than myself; I repent of having offended Thee. Never permit me to separate myself from Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider this first fall of Jesus under His Cross. His flesh was torn by the scourges, His head crowned with thorns, and He had lost a great quantity of blood. He was so weakened that He could scarcely walk, and yet He had to carry this great load upon His shoulders. The soldiers struck Him rudely, and thus He fell several times in His journey.","prayer":"My beloved Jesus, it is not the weight of the Cross, but my sins which have made Thee suffer so much pain. By the merits of this first fall, deliver me from the misfortune of falling into mortal sin. I love Thee, Jesus, with my whole heart; I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider the meeting of the Son and the Mother which took place on this journey. Jesus and Mary looked at each other, and their looks became as so many arrows to wound those hearts which loved each other so tenderly.","prayer":"My most loving Jesus, by the sorrow that Thou didst experience in this meeting, grant me the grace of a truly devoted love for Thy most holy Mother. And thou, my Queen, who wast overwhelmed with sorrow, obtain for me, by thy intercession, a continual and tender remembrance of the Passion of thy Son. I love Thee, Jesus my love; I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider how the Jews, seeing that at each step Jesus, from weakness, was on the point of expiring, and fearing that He would die on the way when they wished Him to die the shameful death of the Cross, constrained Simon the Cyrenian to carry the Cross behind our Lord.","prayer":"My most beloved Jesus, I will not refuse the Cross as the Cyrenian did; I accept it, I embrace it. I accept in particular the death Thou hast destined for me, with all the pains which may accompany it; I unite it to Thy death and offer it to Thee. Thou hast died for love of me. I will die for love of Thee, and to please Thee. Help me by Thy grace. I love Thee, Jesus my love; I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider how the holy woman named Veronica, seeing Jesus so afflicted and His face bathed in sweat and blood, presented Him with a towel, with which He wiped His adorable face, leaving on it the impression of His holy countenance.","prayer":"My most beloved Jesus, Thy face was beautiful before, but in this journey it has lost all its beauty, and wounds and blood have disfigured it. Alas! my soul also was once beautiful, when it received Thy grace in Baptism; but I have disfigured it since by my sins. Thou alone, my Redeemer, can restore it to its former beauty. Do this by Thy Passion. I love Thee, Jesus my love; I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider the second fall of Jesus under the Cross, a fall which renews the pain of all the wounds of the head and members of our afflicted Lord.","prayer":"My most gentle Jesus, how many times Thou hast pardoned me, and how many times have I fallen again and begun again to offend Thee! By the merits of this new fall, give me the necessary helps to persevere in Thy grace until death. Grant that in all temptations which assail me, I may always commend myself to Thee. I love Thee, Jesus my Love, with my whole heart; I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider how those women wept with compassion at seeing Jesus in such a pitiable state, streaming with Blood as He walked along. But Jesus said to them: “Weep not for Me, but for your children.”","prayer":"My Jesus, laden with sorrows, I weep for the offenses I have committed against Thee, because of the pains they have deserved, and still more because of the displeasure they have caused Thee, Who hast loved me so much. It is Thy love more than the fear of hell which causes me to weep for my sins. My Jesus, I love Thee more than myself. I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider the third fall of Jesus Christ. His weakness was extreme, and the cruelty of His executioners excessive, who tried to hasten His steps when He had scarcely strength to move.","prayer":"Ah, my outraged Jesus, by the merits of the weakness Thou didst suffer in going to Calvary, give me strength sufficient to conquer all human respect and all my wicked passions, which have led me to despise Thy friendship. I love Thee, Jesus my love, with my whole heart. I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider the violence with which the executioners stripped Jesus. His inner garments adhered to His torn flesh, and they dragged them off so roughly that the skin came with them. Compassionate thy Saviour thus cruelly treated.","prayer":"My innocent Jesus, by the merits of the torments Thou hast felt, help me to strip myself of all affection to things of earth, in order that I may place all my love in Thee, Who art so worthy of my love. I love Thee, O Jesus, with my whole heart. I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider how Jesus, after being thrown on the Cross, extended His hands and offered to His Eternal Father the sacrifice of His life for our salvation. They fastened Him with nails and then, raising the Cross, left Him to die in anguish.","prayer":"My Jesus, loaded with contempt, nail my heart to Thy feet, that it may ever remain there, to love Thee and never quit Thee again. I love Thee more than myself. I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider how thy Jesus, after three hours of agony on the Cross, consumed at length with anguish, abandons Himself to the weight of His Body, bows His Head, and dies.","prayer":"O my dying Jesus, I kiss devoutly the Cross on which Thou didst die for love of me. I have merited by my sins to die a miserable death, but Thy death is my hope. By the merits of Thy death, give me grace to die embracing Thy feet and burning with love for Thee. I yield my soul into Thy hands. I love Thee with my whole heart; I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider how, after the death of our Lord, two of His disciples, Joseph and Nicodemus, took Him down from the Cross and placed Him in the arms of His afflicted Mother, who received Him with unutterable tenderness and pressed Him to her bosom.","prayer":"O Mother of Sorrows, for the love of this Son, accept me for thy servant and pray to Him for me. And Thou, my Redeemer, since Thou hast died for me, permit me to love Thee; for I wish but Thee and nothing more. I love Thee, my Jesus, and I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."},{"consider":"Consider how the disciples carried the Body of Jesus to bury it, accompanied by His holy Mother, who arranged it in the sepulchre with her own hands. They then closed the tomb, and all withdrew.","prayer":"Ah, my buried Jesus, I kiss the stone that encloses Thee. But Thou didst rise again the third day. I beseech Thee by Thy resurrection, make me rise glorious with Thee at the last day, to be always united with Thee in Heaven, to praise Thee and love Thee forever. I love Thee, and I repent of having offended Thee. Never permit me to offend Thee again. Grant that I may love Thee always, and then do with me what Thou wilt."}],"la":[{"consider":"Considera quomodo Iesus Christus, iam flagellatus et spinis coronatus, iniuste tandem a Pilato ad mortem crucis condemnetur.","prayer":"O adorande Iesu, non Pilatus, sed iniqua mea vita te ad mortem condemnavit. Per meritum laboriosissimi huius itineris, quod ad Calvariae montem instituis, precor te, ut me semper in via, qua anima mea in aeternitatem tendit, benigne comiteris. Amo te, o Iesu, mi Amor, magis quam meipsum, et ex intimo corde paenitet me quod tibi displicui. Ne sinas me iterum a te separari. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit. Quod tibi placitum est, hoc idem mihi est acceptum."},{"consider":"Considera quomodo Iesus Christus, portans humeris crucem, fuerit inter eundum, memor tui, offerendo pro te aeterno Patri mortem, quam erat obiturus.","prayer":"Amabilissime Iesu, amplector omnes res adversas, quas mihi usque ad obitum tolerandas praefixisti, et, per durum illum, quem in portanda tua cruce pertulisti, laborem, precor te, ut vires mihi subministres, quibus ego quoque crucem meam, aequo ac patienti animo, portare valeam. Amo te, o Iesu, mi Amor, paenitet me quod tibi displicui. Ne sinas me iterum separari a te. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera primum hunc Iesu Christi sub cruce lapsum. Habebat carnem ex saeva flagellatione multifarie sauciam, caput redimitum spinarum corona; profuderat insuper cruorem in tanta copia, ut vix pedem prae virium defectione movere posset. Et quoniam gravi crucis onere premebatur et immisericorditer a militibus propellebatur, accidit ut pluries inter eundum humi procumberet.","prayer":"O mi Iesu, non est onus crucis, sed peccatorum meorum pondus, quod tantis te afficit doloribus. Rogo te, per primum hunc tuum lapsum, ut ab omni in peccatum me lapsu tuearis. Amo te, o Iesu, ex toto corde meo; paenitet me quod tibi displicui. Ne sinas me iterum in peccatum prolabi. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera qualis fuerit, in hac via, Filii et Matris occursus. Iesus et Maria se mutuo aspexerunt, mutuique eorum aspectus fuerunt totidem sagittae, quibus amantia eorum pectora transverberabantur.","prayer":"Amantissime Iesu, per acerbum dolorem, quem in hoc occursu expertus es, redde me, precor, sanctissimae Matri tuae vere devotum. Tu vero, perdolens mea Regina, intercede pro me, et obtine mihi talem cruciatum Filii tui memoriam, ut mens mea in pia illorum contemplatione perpetuo detineatur. Amo te, o Iesu, mi Amor; paenitet me quod tibi displicui. Ne sinas me iterum in te peccare. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera quomodo Iudaei, videntes Iesum ad quemlibet passum animam propemodum prae lassitudine efflantem, et timentes ex altera parte ne, quem crucis supplicio affectum volebant, in via moreretur, compellant Simonem Cyrenaeum ad baiulandam crucem post Dominum.","prayer":"O dulcissime Iesu, nolo sicut Cyrenaeus repudiare crucem; libenter eam amplector in meque recipio, amplector speciatim quam mihi praefiniisti mortem cum omnibus, quos haec secum adductura est, doloribus. Coniungo eam cum morte tua, sicque coniunctam eam in sacrificium tibi offero. Tu amore mei mortuus es; volo ego quoque mori amore tui, ea mente ut rem tibi gratam faciam. Tu vero adiuva me tua gratia. Amo te, o Iesu, mi Amor; paenitet me quod tibi displicui. Ne sinas me iterum tibi displicere. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera quomodo sancta illa femina Veronica, videns Iesum doloribus confectum eiusque vultum sudore ac sanguine madidum, porrigat ei linteolum in quo ipse, abstersa facie, sacram sui imaginem impressam relinquit.","prayer":"O mi Iesu, formosa erat antea facies tua; verum hac in via non amplius formosa apparet, sed est vulneribus et cruore omnino deformis. Hei mihi! quam formosa quoque erat anima mea, cum gratiam tuam per baptismum recepisset: peccando eam postea deformem reddidi. Tu solus, mi Redemptor, pristinam venustatem ei restituere vales; quod ut facias, per tuae Passionis meritum te precor. Amo te Iesu, mi Amor; paenitet me quod tibi displicui; ne sinas me iterum tibi displicere. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera alterum Iesu Christi sub cruce lapsum, quo lapsu perdolenti Domino omnes venerandi capitis et totius corporis plagae recrudescunt, omnesque cruciatus renovantur.","prayer":"Mansuetissime Iesu, quam frequenter concessisti mihi veniam! Ego vero in eadem relapsus sum peccata, measque in te offensas renovavi. Per meritum novi huius tui lapsus adiuva me, ut in gratia tua usque ad obitum perseverem. Fac ut in omnibus, quae me invasurae sunt, tentationibus me tibi semper commendem. Amo te ex toto corde meo, o Iesu, mi Amor; paenitet me quod tibi displicui: ne sinas me iterum tibi displicere. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera quomodo mulieres, videntes Iesum lassitudine exanimatum et cruore inter eundum diffluentem, commiseratione permoveantur, lacrimasque profundant. Ad flentes autem conversus: “Nolite, inquit, flere super me, sed super vos ipsas flete et super filios vestros.”","prayer":"O perdolens Iesu, defleo mea in te peccata ob poenas quidem quibus me dignum reddiderunt, sed maxime ob molestiam quam tibi intulerunt, tibi qui me tantopere amasti. Ad fletum minus infernus quam amor tui me excitat. O mi Iesu, amo te magis quam meipsum; paenitet me quod tibi displicui; ne sinas me iterum tibi displicere. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera tertium Iesu Christi sub cruce lapsum. Procumbit quia nimia erat eius debilitas, et nimia saevitia carnificum, qui volebant ut gressum acceleraret, dum vix unum gradum facere posset.","prayer":"O inclementer habite Iesu, per meritum illius virium defectionis, qua in via ad Calvarium laborare voluisti, tanto, precor, me vigore conforta, ut nullum amplius ad humana iudicia respectum habeam, ac vitiosam meam naturam edomem: quod utrumque in causa fuit cur tuam olim amicitiam contempserim. Amo te, o Iesu, mi Amor, ex toto corde meo; paenitet me quod tibi displicui: ne sinas me iterum tibi displicere. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera quam violenter Iesus vestimentis suis spolietur. Cum enim vestis interior arcte carni flagellis dilaniatae adhaereret, carnifices, avellendo vestem, cutem ei quoque avellunt. Subeat te commiseratio Domini tui, eumque sic alloquere.","prayer":"Innocentissime Iesu, per meritum doloris quem inter hanc spoliationem passus es, adiuva me, precor, ut omnem in res creatas affectum exuam, et tota voluntatis meae inclinatione ad te solum convertar, qui meo nimis dignus es amore. Amo te ex toto corde meo; paenitet me quod tibi displicui; ne sinas me iterum tibi displicere. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera quomodo Iesus in crucem coniciatur, et extensis brachiis, vitam suam in sacrificium pro nostra salute aeterno Patri offerat. Carnifices clavis eum affigunt, dein erigunt crucem, et infami patibulo suffixum saevae morti permittunt.","prayer":"O contemptissime Iesu, affige pedibus tuis cor meum, ut amoris vinculo ligatum semper tecum remaneat, necque amplius a te avellatur. Amo te magis quam meipsum; paenitet me quod tibi displicui: ne permittas me iterum tibi displicere. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera tuum cruci suffixum Iesum, qui post trium horarum cum morte luctam, doloribus tandem consumptus addicit corpus morti, et inclinato capite emittit spiritum.","prayer":"O mortue Iesu, exosculor, pietatis sensu intime commotus, hanc crucem in qua tu, mei causa, vitae tuae finem implevisti. Ob commissa peccata infelicem mihi mortem promerui; sed mors tua est spes mea. Per mortis tuae merita, concede mihi precor, ut in amplexu pedum tuorum extremum spiritum, tui amore flagrans, aliquando reddam. In manus tuas commendo spiritum meum. Amo te ex toto corde meo; paenitet me quod tibi displicui: ne sinas me iterum tibi displicere. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera quomodo duo ex Iesu discipulis, Iosephus nempe et Nicodemus, eum exanimatum de cruce tollant et inter brachia perdolentis Matris reponant, quae mortuum Filium peramanter recipit et arcte complectitur.","prayer":"O moerens Mater, per amorem quo Filium tuum amas, accipe me in servum tuum et precare eum pro me. Tu vero, o mi Redemptor, quoniam pro me mortuus es, fac benigne ut amem te; te enim solum volo, nec extra te aliud quidpiam mihi opto. Amo te, o mi Iesu, paenitet me quod tibi displicui: ne sinas me iterum tibi displicere. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."},{"consider":"Considera quomodo discipuli exanimem Redemptorem ad locum sepulturae deferant. Moerens Mater eos comitatur, et propriis manibus corpus Filii sepulturae accommodat. Sepulchrum dein occluditur, et omnes a loco recedunt.","prayer":"O sepulte Iesu, exosculor hunc, qui te recondit, lapidem; sed post triduum ex sepulcro resurges. Per tuam resurrectionem fac me, precor, extremo die gloriosum tecum resurgere, et venire in caelum, ubi tecum semper coniunctus, te laudabo et in aeternum amabo. Amo te, et doleo quod tibi displicui: ne sinas me iterum tibi displicere. Da mihi perpetuum amorem tui, et dein fac de me quidquid tibi placuerit."}],"fr":[{"consider":"Considérez comment Jésus, après avoir été flagellé et couronné d’épines, fut enfin injustement condamné par Pilate à mourir sur la Croix.","prayer":"Ô Jésus adorable, ce n’est pas Pilate, mais mes péchés qui Vous ont condamné à mort. Par les mérites de ce douloureux chemin que Vous entreprenez vers le Calvaire, je Vous supplie d’accompagner mon âme dans le chemin qui la conduit à l’éternité. Je Vous aime, ô Jésus, mon amour, plus que moi-même; je me repens de tout mon cœur de Vous avoir offensé. Ne permettez pas que je me sépare encore de Vous. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez comment Jésus-Christ, portant la Croix sur ses épaules, pensait à nous en chemin, et offrait pour nous à son Père éternel la mort qu’Il allait souffrir.","prayer":"Ô Jésus très aimable, j’embrasse toutes les adversités que Vous m’avez destinées jusqu’à la mort; et, par la douleur que Vous avez endurée en portant votre Croix, je Vous supplie de me donner les forces nécessaires pour porter la mienne avec une parfaite patience et résignation. Je Vous aime, Jésus mon amour; je me repens de Vous avoir offensé. Ne permettez pas que je me sépare encore de Vous. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez cette première chute de Jésus sous le poids de la Croix. Sa chair était déchirée par la flagellation, sa tête couronnée d’épines, et Il avait répandu tant de sang qu’Il pouvait à peine marcher. Cependant Il devait porter sur ses épaules ce pesant fardeau; les soldats Le poussaient sans pitié, et Il tomba ainsi plusieurs fois sur le chemin.","prayer":"Ô mon Jésus, ce n’est pas le poids de la Croix, mais celui de mes péchés qui Vous a causé tant de souffrances. Par les mérites de cette première chute, préservez-moi du malheur de tomber dans le péché mortel. Je Vous aime, ô Jésus, de tout mon cœur; je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez la rencontre du Fils et de la Mère sur ce chemin. Jésus et Marie se regardèrent, et leurs regards furent comme autant de flèches qui transpercèrent leurs Cœurs si tendrement unis.","prayer":"Ô Jésus très aimant, par la douleur que Vous avez éprouvée dans cette rencontre, accordez-moi la grâce d’un amour vraiment dévoué envers votre très sainte Mère. Et Vous, ô ma Reine, qui fûtes accablée de douleur, obtenez-moi par votre intercession un souvenir continuel et tendre de la Passion de votre Fils. Je Vous aime, Jésus mon amour; je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez comment les Juifs, voyant Jésus près d’expirer de faiblesse à chaque pas, craignirent qu’Il ne mourût en chemin, tandis qu’ils voulaient Le voir mourir de la mort ignominieuse de la Croix; ils contraignirent donc Simon de Cyrène à porter la Croix derrière Notre-Seigneur.","prayer":"Ô mon très doux Jésus, je ne veux pas refuser la Croix comme le Cyrénéen; je l’accepte, je l’embrasse. J’accepte en particulier la mort que Vous m’avez destinée, avec toutes les douleurs qui pourront l’accompagner; je l’unis à votre mort et je Vous l’offre. Vous êtes mort par amour pour moi; je veux mourir par amour pour Vous et pour Vous plaire. Aidez-moi de votre grâce. Je Vous aime, Jésus mon amour; je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez comment la sainte femme nommée Véronique, voyant Jésus si affligé et son visage baigné de sueur et de sang, Lui présenta un linge avec lequel Il essuya son adorable Face, y laissant empreinte son image sacrée.","prayer":"Ô mon Jésus très aimé, votre Face était belle auparavant; mais sur ce chemin les blessures et le sang l’ont entièrement défigurée. Hélas! mon âme aussi était belle lorsqu’elle reçut votre grâce au Baptême; mais je l’ai défigurée par mes péchés. Vous seul, ô mon Rédempteur, pouvez lui rendre sa première beauté. Faites-le par les mérites de votre Passion. Je Vous aime, Jésus mon amour; je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez la seconde chute de Jésus sous la Croix, chute qui renouvelle la douleur de toutes les plaies de la tête et des membres de Notre-Seigneur affligé.","prayer":"Ô mon très doux Jésus, combien de fois Vous m’avez pardonné, et combien de fois suis-je retombé dans les mêmes fautes et ai-je recommencé à Vous offenser! Par les mérites de cette nouvelle chute, donnez-moi les secours nécessaires pour persévérer dans votre grâce jusqu’à la mort. Accordez que, dans toutes les tentations qui m’assailliront, je me recommande toujours à Vous. Je Vous aime, Jésus mon amour, de tout mon cœur; je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez comment ces femmes, voyant Jésus épuisé et couvert de sang sur son chemin, pleuraient de compassion. Mais Jésus, se tournant vers elles, leur dit: « Ne pleurez pas sur Moi, mais pleurez sur vous-mêmes et sur vos enfants. »","prayer":"Ô Jésus chargé de douleurs, je pleure les offenses que j’ai commises contre Vous, à cause des peines qu’elles ont méritées, mais plus encore à cause du déplaisir qu’elles Vous ont causé, à Vous qui m’avez tant aimé. C’est votre amour, plus que la crainte de l’enfer, qui me fait pleurer mes péchés. Mon Jésus, je Vous aime plus que moi-même; je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez la troisième chute de Jésus-Christ. Sa faiblesse était extrême, et excessive la cruauté de ses bourreaux, qui voulaient hâter ses pas alors qu’Il avait à peine la force de se mouvoir.","prayer":"Ô Jésus si cruellement traité, par les mérites de cette faiblesse que Vous avez voulu souffrir sur le chemin du Calvaire, donnez-moi assez de force pour vaincre tout respect humain et toutes mes passions mauvaises, qui m’ont autrefois conduit à mépriser votre amitié. Je Vous aime, Jésus mon amour, de tout mon cœur; je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez avec quelle violence les bourreaux dépouillèrent Jésus de ses vêtements. Sa tunique intérieure adhérait à sa chair déchirée, et ils l’arrachèrent avec tant de rudesse qu’ils emportèrent avec elle la peau de ses plaies. Ayez compassion de votre Sauveur ainsi cruellement traité.","prayer":"Ô Jésus innocent, par les mérites de ce tourment, aidez-moi à me dépouiller de toute affection aux choses de la terre, afin que je place tout mon amour en Vous, qui êtes si digne d’être aimé. Je Vous aime, ô Jésus, de tout mon cœur; je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez comment Jésus, étendu sur la Croix, ouvre ses mains et offre à son Père éternel le sacrifice de sa vie pour notre salut. Ses bourreaux L’y attachent avec des clous; puis, ayant élevé la Croix, ils Le laissent mourir dans les angoisses sur ce gibet infâme.","prayer":"Ô mon Jésus accablé d’opprobres, attachez mon cœur à vos pieds, afin qu’il y demeure toujours pour Vous aimer et ne Vous quitte jamais. Je Vous aime plus que moi-même; je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez Jésus crucifié qui, après trois heures d’agonie sur la Croix, consumé enfin par les douleurs, abandonne son Corps à la mort, incline la tête et rend l’esprit.","prayer":"Ô mon Jésus mourant, je baise avec dévotion la Croix sur laquelle Vous êtes mort par amour pour moi. Par mes péchés, j’ai mérité une mort malheureuse; mais votre mort est mon espérance. Par les mérites de votre mort, accordez-moi la grâce de mourir en embrassant vos pieds et brûlant d’amour pour Vous. Je remets mon âme entre vos mains. Je Vous aime de tout mon cœur; je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez comment, après la mort de Notre-Seigneur, deux de ses disciples, Joseph et Nicodème, Le descendirent de la Croix et Le déposèrent dans les bras de sa Mère affligée, qui reçut son Fils mort avec une tendresse inexprimable et Le pressa contre son Cœur.","prayer":"Ô Mère des douleurs, par l’amour que Vous portez à votre Fils, recevez-moi pour votre serviteur et priez-Le pour moi. Et Vous, ô mon Rédempteur, puisque Vous êtes mort pour moi, permettez-moi de Vous aimer; car je ne veux que Vous et rien de plus. Je Vous aime, ô mon Jésus; je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."},{"consider":"Considérez comment les disciples portèrent le Corps de Jésus au lieu de sa sépulture. Sa Mère affligée les accompagna et, de ses propres mains, disposa le Corps de son Fils dans le tombeau. Le sépulcre fut ensuite fermé, et tous se retirèrent.","prayer":"Ô Jésus enseveli, je baise la pierre qui Vous renferme. Mais Vous ressusciterez le troisième jour. Par votre Résurrection, faites, je Vous en supplie, que je ressuscite glorieux avec Vous au dernier jour et que j’aille au ciel, où, toujours uni à Vous, je Vous louerai et Vous aimerai éternellement. Je Vous aime et je me repens de Vous avoir offensé. Ne permettez pas que je Vous offense encore. Donnez-moi de Vous aimer toujours; et ensuite disposez de moi comme il Vous plaira."}]},"stabatEn":["At the Cross her station keeping, the sorrowful Mother stood weeping while her Son hung upon the Cross.","Through her grieving and afflicted soul there passed a sword of sorrow.","How sad and afflicted was that blessed Mother of the Only-begotten Son.","She mourned and suffered, the loving Mother, while she beheld the pains of her glorious Son.","Who would not weep to see the Mother of Christ in such great suffering?","Who could fail to grieve, contemplating the Mother of Christ suffering with her Son?","For the sins of his people she saw Jesus in torments and subjected to scourges.","She saw her sweet Son desolate in death until he gave up his spirit.","O Mother, fountain of love, make me feel the force of sorrow, that I may mourn with you.","Make my heart burn with love of Christ my God, that I may be pleasing to him.","Holy Mother, do this: fix the wounds of the Crucified firmly in my heart.","Share with me the pains of your wounded Son, who deigned to suffer so much for me.","Grant that I may devoutly weep with you and compassionate the Crucified as long as I live."],"stabatFr":["Au pied de la Croix, la Mère douloureuse demeurait en pleurs tandis que son Fils y était suspendu.","À travers son âme gémissante, contristée et douloureuse passa un glaive de douleur.","Qu’elle était triste et affligée, cette Mère bénie du Fils unique.","Elle gémissait et souffrait, la Mère aimante, en contemplant les peines de son Fils glorieux.","Quel homme ne pleurerait en voyant la Mère du Christ dans une si grande souffrance ?","Qui pourrait ne pas s’attrister en contemplant la Mère du Christ souffrant avec son Fils ?","Pour les péchés de son peuple, elle vit Jésus dans les tourments et soumis aux fouets.","Elle vit son doux Fils abandonné dans la mort jusqu’à ce qu’il rendît l’esprit.","Ô Mère, source d’amour, faites-moi sentir la force de la douleur afin que je pleure avec vous.","Faites que mon cœur brûle d’amour pour le Christ mon Dieu, afin que je lui sois agréable.","Sainte Mère, faites ceci : imprimez profondément dans mon cœur les plaies du Crucifié.","Partagez avec moi les souffrances de votre Fils blessé, qui a daigné tant souffrir pour moi.","Accordez-moi de pleurer pieusement avec vous et de compatir au Crucifié tant que je vivrai."]};
const ADORATION_SESSION_KEY='ao.app.adoration.presence.v1';
function adorationPresence(){try{return sessionStorage.getItem(ADORATION_SESSION_KEY)==='exposed'?'exposed':'reserved'}catch{return'reserved'}}
function setAdorationPresence(value){const next=value==='exposed'?'exposed':'reserved';try{sessionStorage.setItem(ADORATION_SESSION_KEY,next)}catch{};S.adoration.presence='reserved';save();return next}
function save(){try{const out=JSON.parse(JSON.stringify(S));if(out.adoration)delete out.adoration.presence;localStorage.setItem(STORE_KEY,JSON.stringify(out))}catch{}}
function setRecitationMode(mode){const value=mode==='group'?'group':'individual';S.rosary.recitation=value;S.stations.recitation=value;save();try{localStorage.setItem('ao-prayer-recitation-mode',value)}catch{};return value}
function applySettingsPreferences(raw={}){
 const prayer=raw&&typeof raw==='object'?raw:{};
 const recitation=prayer.recitationMode==='group'?'group':prayer.recitationMode==='individual'?'individual':null;
 if(recitation){S.rosary.recitation=recitation;S.stations.recitation=recitation}
 const stations=prayer.stations&&typeof prayer.stations==='object'?prayer.stations:{};
 if(stations.mode==='simple'||stations.mode==='guided')S.stations.mode=stations.mode;
 if(typeof stations.stabatMater==='boolean')S.stations.stabat=stations.stabatMater;
 const angelus=prayer.angelus&&typeof prayer.angelus==='object'?prayer.angelus:{};
 if(angelus.seasonalForm==='angelus')S.angelusMode='angelus';
 else if(angelus.seasonalForm==='regina_caeli')S.angelusMode='regina';
 else if(angelus.seasonalForm==='auto')S.angelusMode='auto';
 if(typeof angelus.traditionalConclusion==='boolean')S.angelusHistoricalConclusion=angelus.traditionalConclusion;
 if(typeof angelus.guided==='boolean')S.angelusGuided=angelus.guided;
 save();
 if(recitation){try{localStorage.setItem('ao-prayer-recitation-mode',recitation)}catch{}}
 try{window.AO_PRAY_COHERENCE_V435930?.setMode?.(S.rosary.recitation)}catch{}
 if(document.getElementById(ROOT_ID)?.classList?.contains('open')){
  if(view==='stations'||view==='angelus')render();
 }
 return {
  recitationMode:S.rosary.recitation,
  stations:{mode:S.stations.mode,stabatMater:S.stations.stabat,recitation:S.stations.recitation},
  angelus:{seasonalForm:S.angelusMode==='regina'?'regina_caeli':S.angelusMode,traditionalConclusion:!!S.angelusHistoricalConclusion}
 };
}
let prayTouch=null;
let suppressPrayerFlipTarget=null;
function shell(){
  let r=document.getElementById(ROOT_ID);if(r)return r;
  r=document.createElement('div');r.id=ROOT_ID;r.className='aoP435930Backdrop';r.setAttribute('aria-hidden','true');r.dataset.aoDevotionalUx=DEVOTIONAL_UX_CONTRACT_VERSION;
  r.innerHTML='<section class="aoP435930Sheet" role="dialog" aria-modal="true" aria-labelledby="aoP435930Title"><div class="aoP435930Mount"></div></section>';
  document.body.appendChild(r);
  r.addEventListener('click',onClick);
  r.addEventListener('change',onChange);
  // Keep the one Prayer-options drawer stable across child rerenders.
  r.addEventListener('toggle',e=>{
   if(!e.target?.isConnected)return;
   if(e.target.matches?.('details[data-ao-stations-options]'))STATIONS.optionsOpen=e.target.open;
   if(e.target.matches?.('details[data-ao-angelus-options]'))angelusOptionsOpen=e.target.open;
   if(e.target.matches?.('details[data-ao-mercy-options]'))MERCY.optionsOpen=e.target.open;
  },true);
  r.addEventListener('input',onInput);
  r.addEventListener('touchstart',onPrayTouchStart,{passive:true});
  r.addEventListener('touchend',onPrayTouchEnd,{passive:true});
  return r;
}
function mount(){return shell().querySelector('.aoP435930Mount')}
function open(id,opts={}){
  actionCinematics.reset();
  // Do not corrupt return context or Back state for an unsupported deep link.
  if(!supportedDirectPrayerRoute(id))return false;
  // A Benediction-to-Adoration transition can offer a contextual doorway
  // back to the public rite; a fresh private entry cannot.
  if(id==='pray.adoration')adorationReturnFromBenediction=view==='benediction';
  else if(id!=='pray.benediction')adorationReturnFromBenediction=false;
  homeNavigationError=false;
  if(!document.getElementById('aoPrayerBookRoot')?.classList?.contains('open'))clearRosaryDonorReturn();
  returnContext=Object.prototype.hasOwnProperty.call(opts,'returnContext')?opts.returnContext:PRAY_CTX;returnFocus=opts.trigger||document.activeElement;
  navStack=[];familyId=null;
  if(id==='pray.hub')view='home';
  else if(id==='pray.angelus'||id==='pray.angelus_regina'){view='angelus';ANGELUS_CARD_INDEX=0;resetDevotionalCinematicSession({mount:mount(),win:window});}
  else if(id==='pray.rosary'){
    const source=opts.sourceObject;
    if(source){
      const mysteryId=String(source.mysteryId||"");
      if(!/^(joy|lum|sor|glo)[1-5]$/.test(mysteryId)||
         (source.bead!==undefined&&(!Number.isInteger(source.bead)||source.bead<1||source.bead>10)))
        return false;
      const donor=window.AO_ROSARY_V381;
      if(typeof donor?.setMysterySet!=="function"||typeof donor?.steps!=="function"||
         typeof donor?.setStep!=="function")return false;
    }
    ROSARY_FIFTEEN.active=false;
    rosaryScriptureReturn=null;
    window.AO_ROSARY_V381?.setMethod?.('ordinary');
    view='home';navStack=[];
    if(!launchRosaryPlayer({view:'home',navStack:[],prayerReturnView:null,prayerId:null}))return false;
    if(!source)return true;
    const donor=window.AO_ROSARY_V381,code=source.mysteryId.slice(0,3);
    const set={joy:"joyful",lum:"luminous",sor:"sorrowful",glo:"glorious"}[code];
    const index=Number(source.mysteryId.slice(3))-1;
    const switched=donor.setMysterySet(set,{step:0})===true;
    const steps=switched?donor.steps():[];
    const step=steps.findIndex(item=>item?.mi===index&&(
      source.bead===undefined?item.kind==="mystery":Boolean(item.cue)&&Number(item.bead)===source.bead
    ));
    if(step<0||donor.setStep(step)===false){
      try{window.AOTraditionalPrayerBook?.close?.({silent:true})}catch{}
      const root=rosaryDonorRoot();
      root?.classList?.remove("open");root?.setAttribute?.("aria-hidden","true");
      clearRosaryDonorReturn();return false;
    }
    rosaryScriptureReturn=typeof opts.onCloseReturn==="function"?opts.onCloseReturn:null;
    decorateRosary();setTimeout(decorateRosary,0);
    return true;
  }
  else if(id==='pray.divine_mercy'){view='mercy';MERCY.step=0;}
  else if(id==='pray.rosary_methods'){view='rosaryMethods';}
  else if(id==='pray.confession'){view='confession';CONF=freshConfessionState();}
  else if(id==='pray.benediction'){view='benediction';BEN={step:0,divinePraises:false,praisesForm:'1962',celebration:'ordinary',feastOptions:{...CHRIST_KING_OPTION_DEFAULTS}};}
  else if(id==='pray.adoration')view='adoration';
  else if(id==='pray.stations'){view='stations';STATIONS.step=0}
  else if(id==='pray.visit_blessed_sacrament'){view='adoration';ADOR.mode='visit'}
  else if(id==='pray.library')view='library';
  else if(id==='pray.penitential_psalms'){view='penitential';PEN.step=0}
  else if(id==='pray.litany_saints'){view='litany';LIT.step=0}
  else if(id==='pray.seven_words'){view='sevenWords';SEVEN.step=0}
  else if(id==='pray.tenebrae'){view='tenebrae';TEN.day=0;TEN.hour='MATINS';TEN.step=0;TEN.guided=true;TEN.model=null;TEN.error=null;TEN.ceremony=freshTenebraeCeremony();TEN.epoch++}
  else if(id==='pray.forty_hours'){view='fortyHours';FORTY={mode:'choose',step:0,solemnStep:0}}
  else if(id==='pray.de_profundis'){view='prayerOnly';prayerReturnView='home';prayerId='dead_de_profundis'}
  else if(id==='pray.eternal_rest'){view='prayerOnly';prayerReturnView='home';prayerId='foundations_eternal_rest'}
  else if(id==='programme.first_friday')view='firstFriday';
  else if(id==='programme.first_saturday')view='firstSaturday';
  else return false;
  const r=shell();r.classList.add('open');r.setAttribute('aria-hidden','false');document.body.classList.add('aoP435930Open');render();
  queueMicrotask(()=>r.querySelector('button,[href],input,[tabindex]:not([tabindex="-1"])')?.focus?.());
  return true;
}
function close({silent=false,preserve=false}={}){
  actionCinematics.reset();
  resetDevotionalCinematicSession({mount:mount(),win:window});
  stopTimer();const r=document.getElementById(ROOT_ID);r?.classList.remove('open');r?.setAttribute('aria-hidden','true');document.body.classList.remove('aoP435930Open');
  if(!preserve){
    praySessionLanguage=null;
    // Privacy-sensitive preparation is memory-only and is cleared on a true close.
    CONF=freshConfessionState();
    BEN={step:0,divinePraises:false,praisesForm:'1962',celebration:'ordinary',feastOptions:{...CHRIST_KING_OPTION_DEFAULTS}};ADOR={mode:'home',visitStep:0,holyStep:0,fourStep:0,timer:null,timerEnd:0,quiet:false};adorationQuietReturn=null;
    if(!silent){FF={step:0,intention:false,communion:false};FS={step:0,intention:false,communion:false,rosary:false,meditation:false,confessionDate:'',medSet:'joyful',medMystery:0}}
  }
  const ret=returnContext;returnContext=null;if(!silent&&!preserve){navStack=[];externalResume=null}if(!silent&&ret)queueMicrotask(()=>{if(ret?.surface==='apostolate')void window?.AO_APP_SHELL_V1?.navigate?.('apostolate');else window.AO_NAV_V362?.restore?.(ret)});
  try{returnFocus?.focus?.()}catch{} returnFocus=null;
}
function head(title,sub=''){
 const settings=view==='angelus'?`<button type="button" class="aoFolioSettingsTrigger" data-p435930-angelus-settings aria-controls="aoAngelusOptions" aria-expanded="${angelusOptionsOpen?'true':'false'}" aria-label="${esc(L('Prayer parameters','Paramètres de prière'))}">${assetIcon('ao-ui-settings')||'⚙'}</button>`:'';
 // One in-session control serves all source-owned prayer card readers with real EN/FR text.
 const prayerLanguage=['adoration','benediction','stations','confession','fiveWounds'].includes(view)
  ? `<button type="button" class="aoP435930SessionLanguage" data-p435930-session-language lang="${lang()}" aria-label="${esc(L('Prayer language: English. Switch to French','Langue de prière : français. Passer en anglais'))}" title="${esc(L('Switch to French','Passer en anglais'))}">${lang().toUpperCase()}</button>`
  :'';
 const trailing=settings+prayerLanguage+`<button type="button" class="aoP435930Home" data-p435930-home aria-label="${esc(L('Home','Accueil'))}">${assetIcon('ao-nav-home')}</button>`;
 return `<header class="aoP435930Head"><button type="button" class="aoP435930Back" data-p435930-back aria-label="${esc(L('Back','Retour'))}">${assetIcon('ao-ui-back')}</button><div><small>${esc(L('PRAY','PRIER'))}</small><h1 id="aoP435930Title">${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div>${trailing}</header>`;
}
function nav(title,items,active){return `<div class="aoP435930Seg" role="group" aria-label="${esc(title)}">${items.map(x=>`<button type="button" class="${x[0]===active?'active':''}" aria-pressed="${x[0]===active?'true':'false'}" data-p435930-seg="${esc(x[0])}">${esc(L(x[1],x[2]))}</button>`).join('')}</div>`}
function callout(text,type='info'){return `<div class="aoP435930Callout ${esc(type)}">${text}</div>`}
// The exact historic witness, when identified, must be a usable hyperlink.
const PRAY_LITURGICAL_TRANSCRIPTION=Object.freeze({
 mass_confiteor:"https://la.wikisource.org/wiki/Ordinarium_miss%C3%A6_(1962)",
 adoration_lord_i_am_not_worthy:"https://la.wikisource.org/wiki/Ordinarium_miss%C3%A6_(1962)"
});
function praySourceURL(p){
 const source=prayEditionWitness(p?.id)?.url||p?.provenance?.url||p?.sourceUrl||PRAY_LITURGICAL_TRANSCRIPTION[p?.id]||"";
 // A scheme allowlist avoids injecting arbitrary markup into a source link.
 try{const url=new URL(source);return url.protocol==="https:"||url.protocol==="http:"?url.href:""}catch{return""}
}
function sourceLine(p){
 if(!p)return'';
 const pr=p.provenance||{},edition=prayEditionWitness(p.id),localeWitness=!edition&&isFr()?prayerCompendiumFrenchWitness(p.id):null,url=localeWitness?.url||praySourceURL(p);
 const witness=edition?L(edition.label.en,edition.label.fr):(pr.witness||p.source||L('Source witness not recorded','Témoin textuel non documenté'));
 const transcribed=!edition&&!!PRAY_LITURGICAL_TRANSCRIPTION[p.id]&&!pr.url&&!p.sourceUrl;
 const sourceLink=url
   ?`<a class="aoP435930SourceLink" target="_blank" rel="noopener noreferrer" href="${esc(url)}">${esc(localeWitness?(localeWitness.isComparative?L('Compare the published French edition','Comparer avec l’édition française publiée'):L('Read the published French text','Consulter le texte français publié')):transcribed?L('Read the 1962 Roman Ordinary (secondary transcription)','Lire l’Ordinaire romain de 1962 (transcription secondaire)'):L('Open the cited source','Consulter la source citée'))} ↗</a>`
   :`<small>${esc(L('A direct source link has not yet been verified.','Aucun lien direct vers la source n’est encore vérifié.'))}</small>`;
 const editionNote=edition?'<p>'+esc(L(edition.note.en,edition.note.fr))+'</p>':'';
 const additionalWitness=edition?.secondaryUrl
   ?'<a class="aoP435930SourceLink" target="_blank" rel="noopener noreferrer" href="'+esc(edition.secondaryUrl)+'">'+esc(L('Additional historical/decree witness','Témoin historique ou décret complémentaire'))+' ↗</a>'
   :'';
 const collation=prayCollationNotice(p.id);
 const collationLinks=collation?.relatedWitnesses?.filter(x=>x.url!==url&&x.url!==edition?.secondaryUrl).map(x=>`<p><a class="aoP435930SourceLink" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.label)} ↗</a></p>`).join('')||'';
 const collationDisclosure=collation?`<p class="aoP435930SourceEditionVariant">${esc(L(collation.notice.en,collation.notice.fr))}</p>${collationLinks}`:'';
 const textualVariant=PRAYER_WITNESSED_VARIANTS[p.id];
 const variantNotice=textualVariant?`<p class="aoP435930SourceWitnessNote">${esc(L(textualVariant.noteEn,textualVariant.noteFr))} <a href="${esc(textualVariant.url)}" target="_blank" rel="noopener noreferrer">${esc(L('Original French witness','Témoin français original'))} ↗</a></p>`:'';
 const langHold=p.id==='marian_consecration_immaculate_heart'
   ?`<p>${esc(L('This consecration is documented in English only; no equivalent French or Latin formula has been certified.','Cette consécration est documentée en anglais seulement ; aucune formule française ou latine équivalente n’a été certifiée.'))}</p>`
   :'';
 return `<details class="aoP435930Source"><summary>${esc(L('Source / provenance','Source / provenance'))}</summary><p><b>${esc(pr.work||p.title||p.id)}</b></p><p>${esc(witness)}</p>${sourceLink}${additionalWitness}${editionNote}${transcribed?`<small>${esc(L('This online transcription is a reference to the 1962 text, not a verified facsimile of the printed Missal.','Cette transcription en ligne renvoie au texte de 1962 ; il ne s’agit pas d’un fac-similé du Missel imprimé certifié.'))}</small>`:''}${pr.adaptation?`<small>${esc(pr.adaptation)}</small>`:''}${langHold}${variantNotice}${collationDisclosure}</details>`;
}
const DEVOTIONAL_GUIDE_LINKS=Object.freeze({
 stations:[
  ['Herbert Thurston, S.J. · The Stations of the Cross','https://www.gutenberg.org/files/79316/79316-h/79316-h.htm'],
  ['Westminster Cathedral · How to make the Stations','https://westminstercathedral.org.uk/how-to-make-the-stations-of-the-cross/']
 ],
 confession:[['Catechism of the Catholic Church · Penance and Reconciliation','https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_4.html']],
 firstFriday:[['Pius XII · Haurietis Aquas','https://www.vatican.va/content/pius-xii/en/encyclicals/documents/hf_p-xii_enc_15051956_haurietis-aquas.html']],
 firstSaturday:[['Shrine of Fatima · First Saturdays','https://www.fatima.pt/en/pages/first-saturdays']]
});
function guideLinks(id){
 const xs=DEVOTIONAL_GUIDE_LINKS[id]||[];if(!xs.length)return'';
 return `<div class="aoP435930GuideLinks">${xs.map(([label,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('')}</div>`;
}
function devotionalGuide(id){
 const guides={
  stations:{
   title:L('Guide · history & practice','Guide · histoire & pratique'),
   intro:L('This companion follows the traditional fourteen Stations using the St Alphonsus method. The versicle and response belong to communal use; the Our Father, Hail Mary and Glory Be belong to this method, and a Stabat Mater stanza may accompany the movement between stations.','Ce compagnon suit les quatorze Stations traditionnelles selon la méthode de saint Alphonse. Le verset et le répons conviennent à la récitation commune ; le Notre Père, le Je vous salue Marie et le Gloire au Père appartiennent à cette méthode, et une strophe du Stabat Mater peut accompagner le déplacement entre les stations.'),
   practice:L('Move physically when the place permits; otherwise make the movement interiorly. The app gives only cues that are supported by the devotion and does not invent a universal local posture.','Déplacez-vous physiquement lorsque le lieu le permet ; sinon faites ce déplacement intérieurement. L’application ne donne que les indications appuyées par la dévotion et n’invente pas une posture locale universelle.')
  },
  penitential:{
   title:L('Guide · Scripture and penance','Guide · Écriture et pénitence'),
   intro:L('The seven penitential psalms are presented as biblical texts in their traditional devotional order. The historical order and the verses shown here have separate sources; this is not a claim to reproduce a single printed psalter.','Les sept psaumes pénitentiels sont présentés comme des textes bibliques dans leur ordre dévotionnel traditionnel. L’ordre historique et les versets affichés ont des sources distinctes ; il ne s’agit pas de la reproduction d’un psautier imprimé unique.'),
   practice:L('Proceed psalm by psalm with pauses as needed. Continuing to a litany is optional and does not make the psalms incomplete.','Priez les psaumes les uns après les autres, avec des pauses si nécessaire. La poursuite par des litanies reste facultative et ne conditionne pas l’accomplissement des psaumes.')
  },
  litany:{
   title:L('Guide · invocations and witness','Guide · invocations et témoin'),
   intro:L('This is the Litany proper extracted from a historical transcription. The appended psalm and prayers in that witness have not been misclassified as invocations, and the transcription has not been certified as a 1962 ritual edition.','Il s’agit des litanies proprement dites extraites d’une transcription historique. Le psaume et les oraisons annexes ne sont pas traités comme des invocations, et la transcription n’est pas certifiée comme édition rituelle de 1962.'),
   practice:L('Use the sections and responses for private or group prayer; follow the actual clergy and book during a public rite. This guide prescribes no universal posture.','Suivez les sections et répons pour la prière privée ou commune ; pendant un rite public, suivez le clergé et le livre réellement utilisés. Ce guide n’impose aucune posture universelle.')
  },
  sevenWords:{
   title:L('Guide · Gospel and historical meditation','Guide · Évangile et méditation historique'),
   intro:L('Each of the seven Gospel sayings is accompanied by its biblical reference, followed by an independently witnessed English historical meditation. No unverified French translation of those meditations is supplied.','Chacune des sept paroles évangéliques est accompagnée de sa référence biblique, suivie d’une méditation historique attestée en anglais. Aucune traduction française non vérifiée de ces méditations n’est proposée.'),
   practice:L('Read the Gospel words first, then the meditation where available. Pause in silence and advance voluntarily; the concluding prayers are separate source material.','Lisez d’abord les paroles de l’Évangile, puis la méditation lorsqu’elle est disponible. Faites une pause silencieuse et avancez librement ; les prières finales sont des éléments distincts de la source.')
  },
  confession:{
   title:L('Guide · sacrament & preparation','Guide · sacrement & préparation'),
   intro:L('The sacrament has a stable fundamental structure: contrition, confession and satisfaction on the part of the penitent, and absolution through the ministry of the Church. This module prepares the penitent; it never replaces the priest or judges sacramental validity.','Le sacrement possède une structure fondamentale stable : contrition, confession et satisfaction du pénitent, puis absolution par le ministère de l’Église. Ce module prépare le pénitent ; il ne remplace jamais le prêtre et ne juge pas la validité sacramentelle.'),
   practice:L('The concrete discipline and celebration of Penance developed over the centuries. The app therefore separates doctrinal explanation from the practical flow used before and after an actual Confession.','La discipline concrète et la célébration de la Pénitence ont évolué au cours des siècles. L’application sépare donc l’explication doctrinale du parcours pratique utilisé avant et après une confession réelle.')
  },
  benediction:{
   title:L('Guide · public Eucharistic rite','Guide · rite eucharistique public'),
   intro:L('Benediction is followed as a public rite, not as a private checklist. Local order can vary, so the church in front of you determines the pace and whether optional texts such as the Divine Praises are actually used.','La Bénédiction se suit comme rite public, non comme liste privée. L’ordre local peut varier : l’église devant vous détermine le rythme et l’usage éventuel de textes comme les Louanges divines.'),
   practice:L('The lit / muted reader is the primary orientation device. Advance only when the corresponding public action actually occurs.','Le lecteur en texte éclairé / atténué est le principal repère. N’avancez que lorsque l’action publique correspondante se produit réellement.')
  },
  adoration:{
   title:L('Guide · presence, silence & prayer','Guide · présence, silence & prière'),
   intro:L('Adoration does not require filling the whole visit with text. Silence is a complete mode of prayer; the guided Visit, Holy Hour and Four Ends are optional structures when help is useful.','L’adoration n’exige pas de remplir toute la visite de texte. Le silence est un mode de prière complet ; la Visite guidée, l’Heure Sainte et les Quatre Fins sont des structures facultatives lorsque l’aide est utile.'),
   practice:L('When a public rite begins, public worship takes precedence over the private guide.','Lorsqu’un rite public commence, le culte public a priorité sur le guide privé.')
  },
  fortyHours:{
   title:L('Guide · Forty Hours','Guide · Quarante-Heures'),
   intro:L('Forty Hours is prolonged public Eucharistic exposition with periods of adoration and public ceremonial. This companion therefore follows what is actually happening rather than imposing a timer or a universal local schedule.','Les Quarante-Heures sont une exposition eucharistique publique prolongée, avec des temps d’adoration et un cérémonial public. Ce compagnon suit donc ce qui se passe réellement au lieu d’imposer un minuteur ou un horaire local universel.'),
   practice:L('Traditional private aids remain optional. When clergy lead a hymn, procession, sermon, Litany or Benediction, stop the private sequence and follow the public devotion.','Les aides privées traditionnelles restent facultatives. Lorsque le clergé conduit un hymne, une procession, un sermon, des Litanies ou la Bénédiction, interrompez la séquence privée et suivez la dévotion publique.')
  },
  firstFriday:{
   title:L('Guide · First Fridays','Guide · Premiers vendredis'),
   intro:L('The programme belongs to devotion to the Sacred Heart and is reparatory in character. Holy Communion on the First Friday is the central act in this guide; optional record keeping is kept separate from the spiritual practice itself.','Le programme appartient à la dévotion au Sacré-Cœur et possède un caractère réparateur. La sainte Communion du premier vendredi est l’acte central de ce guide ; l’enregistrement facultatif reste séparé de la pratique spirituelle elle-même.'),
   practice:L('Pius XII explains the wider Sacred Heart devotion as a devotion of love and reparation, while warning against reducing it to external acts or benefits sought.','Pie XII présente la dévotion au Sacré-Cœur comme une dévotion d’amour et de réparation, tout en mettant en garde contre sa réduction à des actes extérieurs ou aux avantages recherchés.')
  },
  firstSaturday:{
   title:L('Guide · First Saturdays','Guide · Premiers samedis'),
   intro:L('The Fatima practice joins Confession, Holy Communion, five decades of the Rosary and fifteen minutes of meditation on the mysteries, with a reparatory intention, across five First Saturdays.','La pratique de Fatima réunit la Confession, la sainte Communion, cinq dizaines du Rosaire et quinze minutes de méditation sur les mystères, avec une intention réparatrice, pendant cinq premiers samedis.'),
   practice:L('The guide can help you carry out the acts without turning them into an automatic certificate. Private month-by-month tracking is optional.','Le guide peut vous aider à accomplir les actes sans les transformer en certificat automatique. Le suivi privé mois par mois est facultatif.')
  }
 };
 const g=guides[id];if(!g)return'';
 return `<details class="aoP435930GuideInfo" data-ao-devotional-guide="${esc(id)}"><summary>${esc(g.title)}</summary><div><p>${esc(g.intro)}</p><p>${esc(g.practice)}</p>${guideLinks(id)}</div></details>`;
}

function prayerBlock(id,opts={}){
 const p=opts.record||P(id);if(!p)return callout(esc(L('Prayer unavailable in this build.','Prière indisponible dans cette version.')),'warn');
 const vern=p[lang()]||'',latin=p.la||'',both=!!(latin&&vern),englishOnly=!vern&&!latin&&!!p.en,shown=vern||latin||p.en||'';
 const origin=opts.scriptureContext?prayerScriptureOrigin(id):null;
 const originCapsule=origin?.reference?'<div class="aoP435930ScriptureOrigin" data-ao-prayer-scripture-origin="'+esc(id)+'">'+
   scriptureContextCapsule(origin.reference,{french:isFr()})+
   '<small>'+esc(origin.isVerbatimBibleText
     ? L('Biblical text · original chapter','Texte biblique · chapitre original')
     : L('Biblical origin or adaptation · not an entire Bible quotation','Origine ou adaptation biblique · non une citation intégrale'))+
   '</small></div>':'';
 const languageNotice=englishOnly?`<p class="aoP435930SourceLanguageNotice" lang="${isFr()?'fr':'en'}">${esc(L('The verified source is available in English only; no Latin or French translation is claimed.','Seul le texte source anglais est disponible ; aucune traduction latine ou française n’est revendiquée.'))}</p>`:'';
 return `<article class="aoP435930Prayer">${languageNotice}<div class="aoP435930PrayerHead"><div><small>${esc(opts.kicker||'')}</small><h3>${esc(isFr()?(p.titleFr||p.title):p.title)}</h3></div>${both?'<span>LA ↔ '+(isFr()?'FR':'EN')+'</span>':''}</div>${both?`<button type="button" class="aoP435930Flip" data-p435930-flip aria-label="${esc(L('Switch prayer language','Changer la langue de la prière'))}"><span data-face-v>${nl(vern)}</span><span data-face-la hidden>${nl(latin)}</span></button>`:`<div class="aoP435930Text" ${englishOnly?'lang="en"':''}>${nl(shown)}</div>`}${originCapsule}${sourceLine(p)}</article>`;
}
function selectedDateKey(){
 const v=core()?.selectedDate;
 if(typeof v==='string'){const m=v.match(/\d{4}-\d{2}-\d{2}/);if(m)return m[0]}
 if(v instanceof Date&&!isNaN(v))return `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`;
 return '';
}
function dateObj(key){const m=String(key||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3],12,0,0):null}
function fmtDate(key){const d=dateObj(key);if(!d)return key||L('No date selected','Aucune date sélectionnée');const weekday=new Intl.DateTimeFormat(isFr()?'fr-FR':'en-GB',{weekday:'long'}).format(d);return `${weekday} · ${formatDisplayDate(d)}`}
const isFirstWeekday=calendarIsFirstWeekday;
function paschal(){
 try{const c=window.AO_RULE_V411?.liturgicalContext?.(core());if(typeof c?.isEastertide==='boolean')return {ok:true,value:c.isEastertide}}
 catch{}
 return {ok:false,value:false};
}
function angelusChoice(){const p=paschal();if(S.angelusMode==='regina')return {form:'regina',auto:false,authority:p};if(S.angelusMode==='angelus')return {form:'angelus',auto:false,authority:p};return {form:p.ok&&p.value?'regina':'angelus',auto:true,authority:p}}
function splitPrayer(text){return String(text||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean)}
function prayFamilies(){
 return Object.freeze({
  daily:Object.freeze({
   title:L('Daily Prayer','Prière quotidienne'),
   description:L('The prayers that structure ordinary Catholic life each day.','Les prières qui structurent la vie catholique quotidienne.'),
   assetId:'ao-rich-begin-end-day',
   items:Object.freeze([
    ['external','pray.morning_evening',L('Morning & Evening Prayer','Prières du matin & du soir'),L('A stable daily sequence for beginning and ending the day.','Une séquence quotidienne stable pour commencer et terminer la journée.')],
    ['own','pray.angelus_regina',L('Angelus / Regina Cæli','Angélus / Regina Cæli'),L('The traditional Marian prayer of the day and season.','La prière mariale traditionnelle du jour et du temps liturgique.')],
    ['own','pray.rosary',L('Holy Rosary','Saint Rosaire'),L('Pray the five decades with today’s mysteries.','Priez les cinq dizaines avec les mystères du jour.')],
    ['external','pray.meal_prayers',L('Grace at Meals','Prières des repas'),L('Traditional prayers before and after meals.','Prières traditionnelles avant et après les repas.')],
    ['external','pray.nightly_examen',L('Nightly Examination','Examen du soir'),L('A short examination before night prayer.','Un bref examen avant la prière du soir.')]
   ])
  }),
  chaplets:Object.freeze({
   title:L('Rosary & Chaplets','Rosaire & chapelets'),
   description:L('Choose a bead devotion. Each retains its own traditional prayers and method.','Choisissez une dévotion au chapelet. Chacune conserve ses prières et sa méthode traditionnelles.'),
   assetId:'ao-rich-rosary',
   items:Object.freeze([
    ['own','pray.rosary',L('The Holy Rosary','Le Saint Rosaire'),L('Pray the five decades with today’s mysteries.','Priez les cinq dizaines avec les mystères du jour.')],
    ['own','pray.rosary_methods',L('Ways to pray the Rosary','Manières de prier le Rosaire'),L('Dominican, Montfort or Scripture-linked methods.','Méthodes dominicaine, de Montfort ou avec les Écritures.')],
    ['own','pray.divine_mercy',L('Chaplet of Divine Mercy','Chapelet de la Divine Miséricorde'),L('A distinct five-decade chaplet with its own prayers.','Un chapelet distinct de cinq dizaines avec ses propres prières.')],
    ['own','pray.five_wounds',L('Chaplet of the Five Wounds','Chapelet des Cinq Plaies'),L('Five short meditations · Glory Be and Hail Mary.','Cinq courtes méditations · Gloria Patri et Ave Maria.')]
   ])
  }),
  eucharistic:Object.freeze({
   title:L('Eucharistic Prayer','Prière eucharistique'),
   description:L('Prayer before the Blessed Sacrament and public Eucharistic devotions.','Prière devant le Saint-Sacrement et dévotions eucharistiques publiques.'),
   assetId:'ao-rich-adoration',
   items:Object.freeze([
    ['own','pray.adoration',L('Adoration & Visit','Adoration & visite'),L('Visit · open adoration · Holy Hour · Four Ends.','Visite · adoration libre · Heure Sainte · quatre fins.')],
    ['own','pray.benediction',L('Benediction','Bénédiction'),L('Follow the public rite as it happens in church.','Suivez le rite public tel qu’il se déroule dans l’église.')],
    ['own','pray.forty_hours',L('Forty Hours','Quarante-Heures'),L('A companion for prolonged Eucharistic exposition.','Un compagnon pour l’exposition eucharistique prolongée.')],
    ['external','pray.communion_treasury',L('Traditional Communion Prayers','Prières traditionnelles de Communion'),L('Preparation and thanksgiving from traditional sources.','Préparation et action de grâces d’après des sources traditionnelles.')]
   ])
  }),
  penance:Object.freeze({
   title:L('Confession & Penance','Confession & pénitence'),
   description:L('Prepare for Confession and pray the Church’s penitential texts.','Préparez la Confession et priez les textes pénitentiels de l’Église.'),
   assetId:'ao-rich-confession',
   items:Object.freeze([
    ['own','pray.confession',L('Confession','Confession'),L('Prepare · examine · contrition · after Confession.','Préparer · examiner · contrition · après la Confession.')],
    ['own','pray.penitential_psalms',L('Seven Penitential Psalms','Sept psaumes pénitentiels'),L('The traditional seven-psalm penitential sequence.','La séquence traditionnelle des sept psaumes pénitentiels.')],
    ['own','pray.litany_saints',L('Litany of the Saints','Litanies des saints'),L('Traditional intercession in call-and-response form.','Intercession traditionnelle sous forme d’invocations et de répons.')]
   ])
  }),
  passion:Object.freeze({
   title:L('Passion & Stations','Passion & Chemin de Croix'),
   description:L('Prayer centred on the Passion of Our Lord.','Prière centrée sur la Passion de Notre-Seigneur.'),
   assetId:'ao-rich-stations',
   items:Object.freeze([
    ['own','pray.stations',L('Stations of the Cross','Chemin de Croix'),L('Fourteen Stations with the existing guided or simple companion.','Quatorze stations avec le compagnon guidé ou simple existant.')],
    ['own','pray.five_wounds',L('Chaplet of the Five Wounds','Chapelet des Cinq Plaies'),L('Meditate on the five wounds of Our Lord.','Méditez les cinq plaies de Notre-Seigneur.')],
    ['own','pray.seven_words',L('Seven Words of Our Lord','Sept Paroles de Notre-Seigneur'),L('Gospel word · traditional meditation · silence.','Parole évangélique · méditation traditionnelle · silence.')],
   ['own','pray.tenebrae',L('Office of Tenebrae','Office des Ténèbres'),L('Three sacred days · Matins and Lauds · simple or guided.','Trois jours saints · Matines et Laudes · simple ou guidé.')]
   ])
  }),
  devotions:Object.freeze({
   title:L('Devotions & Novenas','Dévotions & neuvaines'),
   description:L('Traditional devotions, reparatory practices and prayers for particular needs.','Dévotions traditionnelles, pratiques réparatrices et prières pour des besoins particuliers.'),
   assetId:'ao-rich-novenas',
   items:Object.freeze([
    ['external','pray.novenas',L('Novenas','Neuvaines'),L('Sixteen source-backed novenas with calendar context.','Seize neuvaines sourcées avec contexte calendaire.')],
    ['own','programme.first_friday',L('Nine First Fridays','Neuf premiers vendredis'),L('The Sacred Heart reparatory devotion.','La dévotion réparatrice au Sacré-Cœur.')],
    ['own','programme.first_saturday',L('Five First Saturdays','Cinq premiers samedis'),L('The Immaculate Heart reparatory devotion.','La dévotion réparatrice au Cœur Immaculé.')],
    ['external','pray.sacred_heart',L('Sacred Heart of Jesus','Sacré-Cœur de Jésus'),L('Litany · reparation · consecration.','Litanies · réparation · consécration.')],
    ['external','pray.holy_name_litany',L('Litany of the Holy Name','Litanies du Saint Nom'),L('Traditional Roman form available offline.','Forme romaine traditionnelle disponible hors ligne.')],
    ['external','pray.sacred_hymns',L('Sacred Hymns & Canticles','Hymnes & cantiques sacrés'),L('Three principal hymns · eight additional historical Office texts.','Trois hymnes principales · huit autres textes historiques de l’Office.')],
    ['external','pray.good_death',L('Preparation for a Good Death','Préparation à une bonne mort'),L('St Joseph · final perseverance · traditional prayers.','Saint Joseph · persévérance finale · prières traditionnelles.')],
    ['external','pray.dying_companion',L('Dying Companion','Accompagnement du mourant'),L('Priest · Viaticum · bedside prayer · commendation.','Prêtre · Viatique · prière au chevet · recommandation.')]
   ])
  }),
  library:Object.freeze({
   title:L('Prayer Library','Livre de prières'),
   description:L('Find a particular prayer rather than a guided devotion.','Trouvez une prière précise plutôt qu’une dévotion guidée.'),
   assetId:'ao-rich-prayer-library',
   direct:'pray.library',
   items:Object.freeze([])
  })
 });
}
function prayFamilyDoor(id,family){
 return `<button type="button" class="aoP435930ModuleCard aoP435930FamilyDoor" ${family.direct?`data-p435930-own="${esc(family.direct)}"`:`data-p435930-family="${esc(id)}"`}>${assetIcon(family.assetId,'aoP435930ModuleAsset',{preferEmbedded:true})}<small class="aoP435930ModuleKind">${esc(L('PRAYER','PRIÈRE'))}</small><b>${esc(family.title)}</b><span class="aoP435930ModuleDescription">${esc(family.description)}</span><i aria-hidden="true">${assetIcon('ao-ui-next')}</i></button>`;
}
function prayFamilyItem(item){
 const [owner,route,title,description]=item;
 const attr=owner==='external'?`data-p435930-external="${esc(route)}"`:`data-p435930-own="${esc(route)}"`;
 return `<button type="button" class="aoP435930ModuleCard" ${attr}>${moduleIcon(route)}<small class="aoP435930ModuleKind">${esc(route.startsWith('programme.')?L('DEVOTION','DÉVOTION'):L('PRAYER','PRIÈRE'))}</small><b>${esc(title)}</b><span class="aoP435930ModuleDescription">${esc(description)}</span><i aria-hidden="true">${assetIcon('ao-ui-next')}</i></button>`;
}
function myCustomsDoor(){
 const name=L('My Customs & Prayers','Mes coutumes et prières');
 const desc=L('Your own household customs, personal prayers and chosen dates.','Vos coutumes familiales, prières personnelles et dates choisies.');
 return '<button type="button" class="aoP435930ModuleCard" data-p435930-my-customs>'
  +moduleIcon('pray.library')+'<small class="aoP435930ModuleKind">'+esc(L('PERSONAL','PERSONNEL'))+'</small>'
  +'<b>'+esc(name)+'</b><span class="aoP435930ModuleDescription">'+esc(desc)+'</span></button>';
}
function renderPrayHome(){
 const families=prayFamilies();
 const door=id=>prayFamilyDoor(id,families[id]);
 const intro=L('Choose the prayer suited to the moment, or open the full Prayer Library.','Choisissez la prière qui convient au moment, ou ouvrez le Livre de prières.');
 const group=(en,fr,body)=>`<section class="aoP435930RootGroup"><h3>${esc(L(en,fr))}</h3><div class="aoP435930RootGroupDoors aoP435930ModuleGrid">${body}</div></section>`;
 return `${head(L('Pray','Prier'),L('A place for daily prayer and devotion','Un lieu de prière et de dévotion'))}<main class="aoP435930Body aoP435930Home aoP435930RootOrganised">
  <section class="aoP435930HomeIntro"><small>${esc(L('PRAY','PRIER'))}</small><h2>${esc(L('Enter into prayer','Entrer en prière'))}</h2><p>${esc(intro)}</p></section>
  <section class="aoP435930RootFeatured" aria-label="${esc(L('Begin with daily prayer','Commencer par la prière quotidienne'))}">${door('daily')}</section>
  ${group('Before the Blessed Sacrament','Devant le Saint-Sacrement',door('eucharistic'))}
  ${group('Penance and the Passion','Pénitence et Passion',door('penance')+door('passion'))}
  ${group('Devotions and prayers','Dévotions et prières',door('devotions')+door('library')+myCustomsDoor())}
  ${group('Rosary and chaplets','Rosaire et chapelets',
    door('chaplets')+prayFamilyItem(['own','pray.divine_mercy',L('Chaplet of Divine Mercy','Chapelet de la Divine Miséricorde'),L('Open the chaplet directly','Ouvrir directement le chapelet')]))}
 </main>`;
}
function renderPrayFamily(){
 const family=prayFamilies()[familyId];
 if(!family){familyId=null;view='home';return renderPrayHome()}
 return `${head(family.title,L('Choose a prayer or devotion','Choisissez une prière ou une dévotion'))}<main class="aoP435930Body aoP435930Home"><section class="aoP435930HomeIntro">${familyId==='chaplets'?'':`<small>${esc(L('PRAY','PRIER'))}</small><h2>${esc(family.title)}</h2>`}<p>${esc(family.description)}</p>${({eucharistic:'G301',penance:'G036',passion:'G419'})[familyId]?'<div class="aoP435930ContextRow">'+glossaryContextCapsule(({eucharistic:'G301',penance:'G036',passion:'G419'})[familyId],{french:isFr()})+'</div>':''}</section><div class="aoP435930ModuleGrid">${family.items.map(prayFamilyItem).join('')}</div></main>`;
}
function openFamily(id){
 const family=prayFamilies()[String(id??'')];
 if(!family||family.direct)return false;
 familyId=String(id);view='family';render();return true;
}
function angelusUnits(text,form){
 const lines=String(text||'').replace(/\r/g,'').split(/\n/).map(x=>x.trim()).filter(Boolean),out=[];
 const isV=x=>/^(?:℣\.?|V\.)\s*/i.test(x),isR=x=>/^(?:℟\.?|R\.)\s*/i.test(x);
 const isHail=x=>/^(?:Hail Mary|Ave Maria|Je vous salue)/i.test(x);
 const isCollect=x=>/^(?:Let us pray|Oremus|Prions)\b/i.test(x);
 for(let i=0;i<lines.length;i++){
  const line=lines[i];
  if(isV(line)&&i+1<lines.length&&isR(lines[i+1])){out.push({type:'vr',text:line+'\n'+lines[++i]});continue}
  if(form==='angelus'&&isHail(line)){out.push({type:'hail',text:line});continue}
  if(isCollect(line)){out.push({type:'collect',text:line});continue}
  if(out.length&&out[out.length-1].type==='collect')out[out.length-1].text+=' '+line;
  else out.push({type:'prayer',text:line});
 }
 return out;
}
function angelusGuideMarkup(form){
 const sections=angelusGuideSections(form,lang());
 const related=`<section class="aoAngelusGuideSection" data-ao-b01-august-queen><h3>${esc(L("Related Marian devotion","Dévotion mariale associée"))}</h3><p>${esc(L("August Queen of Heaven is a separate prayer, not an Angelus or Regina Cæli response.","L’Auguste Reine des Cieux est une prière distincte, et non un répons de l’Angélus ou du Regina Cæli."))} <a href="${esc(B01_AUGUST_QUEEN_SOURCE.url)}" target="_blank" rel="noopener noreferrer">${esc(L("ICKSP · August Queen prayer","ICKSP · Prière de l’Auguste Reine"))} ↗</a></p></section>`;
 return `<details class="aoP435930GuideInfo aoAngelusGuide" data-ao-devotional-guide="${esc(form)}"><summary>${esc(L('Guide · history, meaning & practice','Guide · histoire, sens et pratique'))}</summary><div class="aoAngelusGuideBody">${sections.map(entry=>`<section class="aoAngelusGuideSection"><h3>${esc(entry.heading)}</h3><p>${esc(entry.body)} <a href="${esc(entry.source.url)}" target="_blank" rel="noopener noreferrer">${esc(entry.source.label)} ↗</a></p></section>`).join('')}${related}</div></details>`;
}
function angelusDialogueHTML(parts){
 return `<span class="aoAngelusDialogue">${parts.map(part=>`<span class="aoAngelusDialogueLine ${part.role}" data-ao-angelus-voice="${part.role}"><span class="ao-liturgical-speaker" data-ao-speaker-role="${part.role==='leader'?'versicle':'response'}">${part.role==='leader'?'℣.':'℟.'}</span><span>${esc(part.text)}</span></span>`).join('')}</span>`;
}
function angelusUtterance(text,type){
 if(S.rosary.recitation!=='group')return nl(text);
 if(type==='hail'||type==='collect'){
  const prayer=angelusCommunalParts(text,type);
  if(prayer)return angelusDialogueHTML(prayer);
 }
 if(type!=='vr')return nl(text);
 const lines=String(text||'').replace(/\r/g,'').split('\n').map(x=>x.trim()).filter(Boolean);
 const strict=splitAngelusVersicleResponse(text);
 const parts=strict.length===2?strict:lines.length===2?lines.map((line,i)=>({
   role:i===0?'leader':'response',
   text:line.replace(i===0?/^(?:℣|V)\.?\s*/i:/^(?:℟|R)\.?\s*/i,'').trim()
 })):[];
 return parts.length===2?angelusDialogueHTML(parts):nl(text);
}
function renderAngelus(){
 const c=angelusChoice(),form=c.form,obj=form==='regina'?DATA.regina:DATA.angelus,vern=obj?.[lang()]||'',lat=obj?.la||'';
 const unitsV=angelusUnits(vern,form),unitsL=angelusUnits(lat,form);
 const authority=c.auto&&!c.authority.ok?callout(esc(L('Automatic seasonal selection could not read the canonical liturgical context, so Angelus is shown. You can choose Regina Cæli manually.','La sélection saisonnière automatique n’a pas pu lire le contexte liturgique canonique ; l’Angelus est donc affiché. Vous pouvez choisir manuellement le Regina Cæli.')),'warn'):'';
 const labels={vr:L('Versicle & response','Verset & répons'),hail:L('Hail Mary','Je vous salue Marie'),collect:L('Collect','Oraison'),prayer:L('Prayer','Prière')};
 const saturday=selectedWeekday()===6&&form==='angelus';
 const vespersToggle=saturday?`<label class="aoP435930Toggle aoAngelusVespers"><input type="checkbox" data-p435930-angelus-vespers ${angelusSaturdayVespersDate===selectedDateKey()?'checked':''}><span><b>${esc(L('After Saturday Vespers','Après les vêpres du samedi'))}</b><small>${esc(L('Traditional standing custom · select only when Vespers has begun','Usage traditionnel : debout · activer seulement après le début des vêpres'))}</small></span></label>`:'';
 const recitationMode=nav(L('Recitation','Récitation'),[['individual','Individual','Individuel'],['group','Group','Groupe']],S.rosary.recitation);
 const guideMode=nav(L('Prayer depth','Degré d’accompagnement'),[['simple','Simple','Simple'],['guided','Guided','Guidé']],S.angelusGuided?'guided':'simple');
 const posture=angelusExactPosture();
 const postureText=form==='regina'?L('Stand during Eastertide.','Restez debout pendant le temps pascal.'):posture.stand?L('Stand · Sunday or after Saturday Vespers','Debout · dimanche ou après les vêpres du samedi'):L('Kneel · ordinary days','À genoux · jours ordinaires');
 const postureNote=`<details class="aoFolioPostureNote"><summary>${assetIcon(posture.assetId,'aoFolioPostureIcon')}<span>${esc(postureText)}</span><span aria-hidden="true">ⓘ</span></summary><p>${esc(L('Traditional custom: kneel on ordinary days; stand on Sundays and after Saturday Vespers. These are devotional customs, not universal obligations. Follow the approved local custom.','Usage traditionnel : à genoux les jours ordinaires ; debout le dimanche et après les vêpres du samedi. Ce sont des usages de dévotion, non des obligations universelles. Suivez la coutume locale approuvée.'))}</p></details>`;
 const units=unitsV.map((u,i)=>{
  const la=unitsL[i]?.text||'';
  const incarnation=form==='angelus'&&u.type==='vr'&&/(Word was made flesh|Verbum caro factum est|Verbe s[’']est fait chair)/i.test(u.text+' '+la);
  return `<article class="aoP435930LitCard aoP435930PrayerUnit" data-ao-angelus-unit="${esc(u.type)}" data-ao-angelus-index="${i}"${incarnation?' data-ao-incarnation="true"':''}><small>${esc(labels[u.type]||labels.prayer)}</small><button type="button" data-p435930-card-flip aria-label="${esc(L('Switch prayer language','Changer la langue de la prière'))}"><span data-face-v>${angelusUtterance(u.text,u.type)}</span><span data-face-la hidden>${angelusUtterance(la,u.type)}</span></button></article>`;
 }).join('');
 return `${head(form==='regina'?'Regina Cæli':'Angelus','')}<main class="aoP435930Body aoP435930AngelusReader aoFolioReader" data-ao-angelus-form="${form}" data-ao-angelus-recitation="${S.rosary.recitation}">${authority}<details id="aoAngelusOptions" class="aoP435930PrayerOptions aoFolioOptions" data-ao-angelus-options ${angelusOptionsOpen?'open':''}><summary>${esc(L('Prayer parameters','Paramètres de prière'))}</summary><div class="aoP435930PrayerOptionsBody">${nav(L('Form','Forme'),[['auto','Automatic','Automatique'],['angelus','Angelus','Angelus'],['regina','Regina Cæli','Regina Cæli']],S.angelusMode)}${recitationMode}${guideMode}${vespersToggle}${form==='angelus'?`<label class="aoP435930Toggle"><input type="checkbox" data-p435930-angelus-appendix ${S.angelusHistoricalConclusion?'checked':''}><span><b>${esc(L('Closing prayers','Prières finales'))}</b></span></label>`:''}${angelusGuideMarkup(form)}</div></details>${postureNote}<section class="aoRitualReaderGrid aoAngelusRitualGrid" data-ao-ritual-reader="angelus">${angelusExactRailMarkup()}<div class="aoP435930Cards aoP435930AngelusSequence">${units}</div></section>${form==='angelus'&&S.angelusHistoricalConclusion?`<article class="aoP435930Appendix" hidden><button type="button" class="aoP435930AppendixFlip" data-p435930-flip><span data-face-v>${nl(DATA.angelusAppendix?.[lang()]||'')}</span><span data-face-la hidden>${nl(DATA.angelusAppendix?.la||'')}</span></button></article>`:''}</main>`;
}
function normalizeRosaryPrefs(raw=S.rosary){
 return Object.freeze({
  form:raw?.form==='devotional'?'devotional':'standard',
  mode:raw?.mode==='guided'?'guided':'simple',
  recitation:raw?.recitation==='group'?'group':'individual'
 })
}
function rosaryDonorRoot(){
 const canonical=[...document.querySelectorAll('#aoPrayerBookRoot')];
 const active=canonical.find(el=>el.classList?.contains('open')&&el.querySelector?.('.pbShell'));
 if(active)return active;
 const exact=canonical.find(el=>el.querySelector?.('.pbShell[data-ao-rosary-exact-donor="v3.4.14"]'));
 if(exact)return exact;
 return canonical[0]
  ||document.querySelector('.pbRoot,.aoPrayerBook,.lab-prayerbook,[data-pb-root]')
  ||document.querySelector('#ao-prayerbook-root')
  ||document.querySelector('[class*="PrayerBook"]')
  ||[...document.querySelectorAll('body > *')].find(el=>el.querySelector?.('[data-v38-rosary-form]'))
  ||null
}
function storeRosaryDonorReturn(snapshot){
 const root=rosaryDonorRoot();if(!root||!snapshot)return false;
 rosaryDonorReturnSnapshot=snapshot;
 try{root.dataset.aoPrayRosaryReturn=JSON.stringify(snapshot)}catch{}
 return true
}
function readRosaryDonorReturn(){
 if(rosaryDonorReturnSnapshot)return rosaryDonorReturnSnapshot;
 const raw=rosaryDonorRoot()?.dataset?.aoPrayRosaryReturn;if(!raw)return null;
 try{return JSON.parse(raw)}catch{return null}
}
function clearRosaryDonorReturn(){
 const root=rosaryDonorRoot();if(root)delete root.dataset.aoPrayRosaryReturn;
 rosaryDonorReturnSnapshot=null;externalResume=null;
}
function returnFromRosaryDonor(e,root,snapshot){
 if(!root||!snapshot)return false;
 e?.preventDefault?.();e?.stopImmediatePropagation?.();
 const sourceReturn=rosaryScriptureReturn;
 rosaryScriptureReturn=null;
 clearRosaryDonorReturn();
 try{
  const api=window.AOTraditionalPrayerBook;
  if(typeof api?.close==='function')api.close({silent:true});
 }catch{}
 // Some preserved PrayerBook builds expose openModule/getState but no close method.
 // In that case the exact-donor presentation layer must only close the visible shell;
 // it must not mutate Rosary engine state.
 if(root.classList?.contains('open')){
  root.classList.remove('open');
  root.setAttribute('aria-hidden','true');
 }
 if(sourceReturn)queueMicrotask(()=>void sourceReturn());
 else reopenResume(snapshot);
 return true;
}
function setRosaryPrayerLanguage(host,face='vernacular'){
 if(!host)return false;
 const latin=host.querySelector?.('[data-pb-latin]'),vern=host.querySelector?.('[data-pb-vern]');
 if(!latin||!vern)return false;
 const showLatin=face==='latin';
 host.dataset.face=showLatin?'latin':'vernacular';
 host.dataset.aoRosaryLanguageDefault='vernacular';
 latin.hidden=!showLatin;
 vern.hidden=showLatin;
 host.setAttribute?.('aria-pressed',showLatin?'true':'false');
 host.setAttribute?.('aria-label',showLatin?L('Show vernacular','Afficher la langue vernaculaire'):L('Show Latin','Afficher le latin'));
 if(!host.matches?.('button,a,[role="button"]'))host.setAttribute?.('role','button');
 if(!host.matches?.('button,a')&&host.tabIndex<0)host.tabIndex=0;
 return true;
}
function toggleRosaryPrayerLanguage(host){
 return setRosaryPrayerLanguage(host,host?.dataset?.face==='latin'?'vernacular':'latin');
}
function bindRosaryDonorBack(root){
 const back=root?.querySelector?.('.lab-back[data-pb-back],.lab-back');
 if(back)back.dataset.aoRosaryReturnBound='1';
 if(document.documentElement?.dataset?.aoRosaryReturnCapture!=='v3-window-path'){
  if(document.documentElement?.dataset)document.documentElement.dataset.aoRosaryReturnCapture='v3-window-path';
  window.addEventListener('click',e=>{
   const path=typeof e.composedPath==='function'?e.composedPath():[],
    back=path.find(node=>node?.classList?.contains?.('lab-back'))||e.target?.closest?.('.lab-back'),
    nav=path.find(node=>node?.matches?.('[data-lab-rosary-next],[data-lab-rosary-prev]'))||e.target?.closest?.('[data-lab-rosary-next],[data-lab-rosary-prev]'),
    flip=path.find(node=>node?.matches?.('.lab-prayer-flip[data-pb-flip]'))||e.target?.closest?.('.lab-prayer-flip[data-pb-flip]'),
    hit=back||nav||flip,
    donorRoot=path.find(node=>node?.id==='aoPrayerBookRoot')||hit?.closest?.('#aoPrayerBookRoot')||rosaryDonorRoot();
   if(!donorRoot||!hit||!donorRoot.contains(hit))return;
   if(donorRoot.querySelector?.('.pbShell')?.dataset?.aoRosaryExactDonor!=='v3.4.14')return;
   if(flip&&donorRoot.dataset?.aoRosaryActiveRoot==='true'){
    e.preventDefault();e.stopImmediatePropagation();
    toggleRosaryPrayerLanguage(flip);
    return;
   }
   if(nav&&donorRoot.dataset?.aoRosaryActiveRoot==='true'){
    const api=window.AO_ROSARY_V381,st=api?.state?.(),steps=api?.steps?.()||[];
    if(typeof api?.setStep==='function'&&steps.length){
     const current=Math.max(0,Math.min(steps.length-1,Math.trunc(Number(st?.step)||0))),
      delta=nav.matches('[data-lab-rosary-prev]')?-1:1,
      target=Math.max(0,Math.min(steps.length-1,current+delta));
     if(ROSARY_FIFTEEN.active){
      const sets=['joyful','sorrowful','glorious'],at=sets.indexOf(st?.set),
        firstDecade=steps.findIndex(x=>x.kind==='mystery'&&x.phase==='decade'),
        lastDecade=steps.findLastIndex(x=>x.phase==='decade');
      if(at>=0&&firstDecade>=0&&lastDecade>=firstDecade){
       const goingForward=delta===1&&at<2&&current===lastDecade;
       const goingBack=delta===-1&&at>0&&current===firstDecade;
       if(goingForward||goingBack){
        e.preventDefault();e.stopImmediatePropagation();
        const set=sets[at+(goingForward?1:-1)];
        if(api.setMysterySet?.(set)===true){
         const nextSteps=api.steps?.()||[];
         const step=goingForward?nextSteps.findIndex(x=>x.kind==='mystery'&&x.phase==='decade'):
           nextSteps.findLastIndex(x=>x.phase==='decade');
         if(step>=0)api.setStep(step);
         decorateRosary();setTimeout(decorateRosary,0);
        }
        return;
       }
       // The opening belongs only to the first group; later sets begin at their first mystery.
       if(delta===-1&&at>0&&current<=firstDecade){
        e.preventDefault();e.stopImmediatePropagation();return;
       }
      }
     }
     if(target!==current){
      e.preventDefault();e.stopImmediatePropagation();
      if(api.setStep(target)!==false){decorateRosary();setTimeout(decorateRosary,0)}
      return;
     }
    }
   }
   if(!back)return;
   let snapshot=rosaryDonorReturnSnapshot;
   if(!snapshot){
    try{snapshot=JSON.parse(donorRoot.dataset?.aoPrayRosaryReturn||'null')}catch{snapshot=null}
   }
   if(!snapshot)return;
   returnFromRosaryDonor(e,donorRoot,snapshot);
  },true);
 }
 return !!back;
}
function syncRosaryPrefs(raw=S.rosary){
 const prefs=normalizeRosaryPrefs(raw);
 try{const donor=window.AO_ROSARY_V381;if(donor?.getForm?.()!==prefs.form)donor?.setForm?.(prefs.form)}catch{}
 try{localStorage.setItem('ao-prayer-recitation-mode',prefs.recitation)}catch{}
 try{window.AO_PRAY_COHERENCE_V435930?.setMode?.(prefs.recitation)}catch{}
 return prefs
}
function restoreRosaryLaunchPrefs(raw,attempt=0){
 const prefs=normalizeRosaryPrefs(raw),root=rosaryDonorRoot();
 const native=root?.querySelector?.(`[data-ao-recitation="${prefs.recitation}"]`);
 if(!root?.classList?.contains('open')||!native){
  if(attempt<80)setTimeout(()=>restoreRosaryLaunchPrefs(prefs,attempt+1),25);
  return prefs
 }
 if(!native.classList.contains('active')){
  try{native.click()}catch{}
 }
 S.rosary.form=prefs.form;S.rosary.mode=prefs.mode;S.rosary.recitation=prefs.recitation;save();
 syncRosaryPrefs(prefs);decorateRosary();
 if(attempt<81)setTimeout(()=>{
  const r=rosaryDonorRoot(),n=r?.querySelector?.(`[data-ao-recitation="${prefs.recitation}"]`);
  if(r?.classList?.contains('open')&&n&&!n.classList.contains('active'))restoreRosaryLaunchPrefs(prefs,81)
 },120);
 return prefs
}
function renderRosary(){
 const rs=window.AO_ROSARY_V381?.state?.()||{};
 return `${head(L('Holy Rosary','Saint Rosaire'))}<main class="aoP435930Body aoP435930RosaryFallback"><button type="button" class="aoP435930Primary" data-p435930-launch-rosary>${esc(rs.set?L('Continue Rosary','Continuer le Rosaire'):L('Begin Rosary','Commencer le Rosaire'))}</button></main>`;
}
function launchTraditionalRosaryMethod(method){
 const api=window.AO_ROSARY_V381;
 if(!['ordinary','dominican','montfort','montfort_short','scriptural'].includes(method)||typeof api?.setMethod!=='function')return false;
 ROSARY_FIFTEEN.active=false;
 if(method!=='ordinary'){S.rosary.form='standard';if(method==='scriptural')S.rosary.mode='guided';save()}
 if(api.setMethod(method)!==true)return false;
 if(launchRosaryPlayer(captureResume())){setTimeout(decorateRosary,0);return true}
 api.setMethod('ordinary');return false;
}
function launchFifteenRosary(){
 const api=window.AO_ROSARY_V381;
 if(typeof api?.setMysterySet!=='function')return false;
 if(api.setMethod?.('ordinary')!==true)return false;
 ROSARY_FIFTEEN.active=true;
 if(!launchRosaryPlayer(captureResume())){ROSARY_FIFTEEN.active=false;return false}
 // A newly opened canonical donor is always started in the Joyful set.
 if(api.setMysterySet('joyful',{step:0})===true){decorateRosary();return true;}
 ROSARY_FIFTEEN.active=false;return false;
}
function launchRosaryPlayer(resume=captureResume()){
 const prefs=syncRosaryPrefs({...S.rosary});
 externalResume=resume;rosaryDonorReturnSnapshot=resume;lastRosaryFxMystery='';
 close({silent:true});
 const opened=window.AOTraditionalPrayerBook?.openModule?.('rosary',{returnContext:PRAY_CTX});
 if(opened===false){
   reopenResume(resume);view='rosary';render();return false;
 }
 storeRosaryDonorReturn(resume);
 restoreRosaryLaunchPrefs(prefs);
 return true;
}
let lastRosaryRitualKey='',lastRosaryFxMystery='';
function rosaryLiveInfo(){
 const api=window.AO_ROSARY_V381,st=api?.state?.()||null,xs=api?.steps?.()||[];
 if(!st||!xs.length)return null;
 const index=Math.max(0,Math.min(xs.length-1,Number(st.step)||0)),step=xs[index]||null;
 const mi=Number.isInteger(step?.mi)?step.mi:null;
 return {state:st,steps:xs,index,step,set:String(st.set||''),mi};
}
function rosaryExactSlot(channel,item,{emphasis=false}={}){
 if(!item)return'';
 const labels={posture:L('Posture','Posture'),gesture:L('Gesture','Geste'),action:L('Action','Action')};
 const icon=item.assetId?assetIcon(item.assetId,'aoRitualIcon'):`<span class="aoRitualIcon aoRitualSymbol" aria-hidden="true">${esc(item.symbol||'·')}</span>`;
 return `<div class="aoRitualSlot${emphasis?' is-emphasis':''}" data-channel="${esc(channel)}" data-value="${esc(item.value||'')}" role="status" aria-label="${esc((labels[channel]||channel)+' '+(item.label||''))}">${icon}<span class="aoRitualMeta"><span class="aoRitualKey">${esc(labels[channel]||channel)}</span><span class="aoRitualValue">${esc(item.label||'')}</span></span></div>`;
}
function rosaryExactState(info){
 if(!info)return{gesture:null,action:null,key:''};
 const step=info.step||{},kind=String(step.kind||''),prayerKey=String(step.key||''),phase=String(step.phase||''),
   bead=Number(step.bead||0),hasCue=!!step.cue,finalCross=step.finalCross===true,
   guided=S.rosary.mode==='guided',
   key=[info.index,kind,prayerKey,phase,bead,hasCue,guided,finalCross].join(':'),
   entering=key!==lastRosaryRitualKey;
 let gesture=null,action=null;
 if(prayerKey==='sign'&&(phase==='opening'||finalCross)){
   gesture={
     value:finalCross?'closing-sign-cross':'opening-sign-cross',
     label:finalCross?L('Closing Sign of the Cross','Signe de Croix final'):L('Sign of the Cross','Signe de la Croix'),
     assetId:'ao-live-sign-cross',
     persistent:false
   };
 }
 if(guided&&kind==='mystery'){
   action={value:'mystery-silence',label:L('Pause · contemplate','Pause · contemplez'),symbol:'·',persistent:true};
 }else if(guided&&hasCue){
   action={value:'scripture-silence',label:L('Meditate · brief silence','Méditez · bref silence'),symbol:'·',persistent:false};
 }
 return{gesture,action,key,entering};
}
function rosaryDonorArt(r,info){
 const center=r.querySelector('.aoRosaryRitualCenter')||r.querySelector('.pbShell');
 if(!center)return'';
 const img=r.querySelector('.aoV401RosaryHero img,.lab-contemplation img,[data-ao-rosary-art] img,.r23-mystery-art,img[data-mystery-art]');
 const apiArt=info?.mi!==null
  ?(window.AO_ROSARY_V401?.preview?.(info.set,info.mi)||window.AO_ROSARY_V41?.preview?.(info.set,info.mi)||'')
  :'';
 const src=img?.currentSrc||img?.src||apiArt||'';
 center.classList.toggle('r24-has-mystery-art',!!src&&info?.mi!==null);
 if(src&&info?.mi!==null)center.style.setProperty('--r24-mystery-art',`url("${String(src).replace(/"/g,'\\\"')}")`);
 else center.style.removeProperty('--r24-mystery-art');
 return src;
}
function ensureRosaryDonorRecitation(r){
 const center=r.querySelector('.aoRosaryRitualCenter')||r.querySelector('.pbShell');if(!center)return null;
 let head=center.querySelector('.r29-head-recitation[data-ao-exact-donor-recitation]');
 if(!head){
  head=document.createElement('div');
  head.className='r29-head-recitation';
  head.dataset.aoExactDonorRecitation='v3.4.14';
  head.setAttribute('role','group');
  head.setAttribute('aria-label',L('Recitation mode','Mode de récitation'));
  const host=center.querySelector('.lab-view-head,.pbTop,.pbHead,header')||center;
  host.appendChild(head);
 }
 head.innerHTML=`<button type="button" data-p435930-recitation="individual" aria-pressed="${S.rosary.recitation==='individual'}" class="${S.rosary.recitation==='individual'?'active':''}"><span class="r29-wide">${esc(L('Individual','Individuel'))}</span><span class="r29-short">${esc(L('Ind.','Ind.'))}</span></button><button type="button" data-p435930-recitation="group" aria-pressed="${S.rosary.recitation==='group'}" class="${S.rosary.recitation==='group'?'active':''}">${esc(L('Group','Groupe'))}</button>`;
 return head;
}
function rosaryDonorMysteryFx(r,info){
 if(info?.step?.kind!=='mystery'||info?.mi===null)return false;
 const key=info.set+':'+info.mi;if(key===lastRosaryFxMystery)return false;
 lastRosaryFxMystery=key;
 const title=r.querySelector('.aoV401RosaryHero figcaption span:first-child,.lab-contemplation h2,.r23-contemplation h2')?.textContent?.trim()
  ||L(`Mystery ${info.mi+1}`,`Mystère ${info.mi+1}`);
 const fx=window.AO_CINEMATIC_V4312||window.AO_CINEMATIC_V4311;
 if(fx?.isReducedMotion?.())return false;
 fx?.showTransition?.({kicker:L('HOLY ROSARY','SAINT ROSAIRE'),title,hold:430});
 return true;
}

function closeRosaryDonorOverview(r,{restoreFocus=true}={}){
 const sheet=r?.querySelector?.('#r23-overview-sheet');if(!sheet)return false;
 sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');
 if(restoreFocus)r.querySelector('[data-r23-overview-open]')?.focus?.();
 return true;
}
function normalizeRosaryExactStructure(shell){
 const legacyGrid=shell?.querySelector?.(':scope > .aoRosaryRitualGrid:not(.pbShell)');
 if(legacyGrid){
  const center=legacyGrid.querySelector(':scope > .aoRosaryRitualCenter');
  if(center){
   while(center.firstChild)shell.insertBefore(center.firstChild,legacyGrid);
  }
  legacyGrid.remove();
 }
 shell?.classList?.remove('aoRosaryRitualGrid');
 shell?.classList?.add('aoRosaryRitualCenter','aoRosarySingleColumn');
 if(shell?.dataset)shell.dataset.aoRosaryLayout='single-column';
 return shell;
}
function ownRosaryDonorRoots(active){
 document.querySelectorAll('#aoPrayerBookRoot').forEach(root=>{
  const isActive=root===active;
  root.dataset.aoRosaryActiveRoot=isActive?'true':'false';
  if(!isActive&&root.classList?.contains('open')){
   root.classList.remove('open');
   root.setAttribute('aria-hidden','true');
  }
 });
}
function decorateRosaryExact(r){
 r.querySelectorAll('.aoP435930RosarySemanticRails').forEach(x=>x.remove());
 const info=rosaryLiveInfo();if(!info?.state?.set)return false;
 const shell=normalizeRosaryExactStructure(r.querySelector('.pbShell'));if(!shell)return false;
 ownRosaryDonorRoots(r);
 bindRosaryDonorBack(r);
 let rail=shell.querySelector(':scope > .aoRosaryFaithfulRail');
 if(!rail){
  rail=document.createElement('aside');
  rail.className='aoRitualRail aoRosaryFaithfulRail';
  rail.dataset.aoRitualRail='';
  rail.dataset.aoRitualModule='rosary';
  rail.dataset.aoRitualChannels='posture,gesture,action';
  rail.setAttribute('aria-label',L('Rosary posture, gesture and contemplation','Posture, geste et contemplation du Rosaire'));
  const head=shell.querySelector(':scope > .lab-view-head,:scope > .pbTop,:scope > .pbHead,:scope > header');
  if(head)head.insertAdjacentElement('afterend',rail);else shell.prepend(rail);
 }
 const st=rosaryExactState(info),slots=[
  rosaryExactSlot('gesture',st.gesture,{emphasis:st.entering&&!!st.gesture}),
  rosaryExactSlot('action',st.action,{emphasis:st.entering&&!!st.action})
 ].filter(Boolean);
 rail.innerHTML=slots.join('');
 rail.hidden=!slots.length;
 shell.dataset.aoRosaryExactDonor='v3.4.14';
 shell.dataset.aoRosaryStep=String(info.index);
 shell.dataset.aoRosaryKind=String(info.step?.kind||'');
 shell.dataset.aoRosaryKey=String(info.step?.key||'');
 shell.dataset.aoRosaryPhase=String(info.step?.phase||'');
 // Shell metadata must not impersonate a click target for native rosary beads.
 shell.removeAttribute('data-ao-rosary-bead');
 shell.dataset.aoRosaryCurrentBead=String(Number(info.step?.bead||0));
 shell.dataset.aoRosaryCue=info.step?.cue?'true':'false';
 shell.dataset.aoRosaryFinalCross=info.step?.finalCross?'true':'false';
 r.querySelectorAll('.rosary-decade-bar-v15[data-ao-exact-donor-progress]').forEach(node=>node.remove());
 ensureRosaryDonorRecitation(r);
 r.querySelectorAll('[data-r23-overview-open],#r23-overview-sheet').forEach(node=>node.remove());
 rosaryDonorArt(r,info);
 rosaryDonorMysteryFx(r,info);
 // Source-first mystery context, not the uncertified 200-bead quotation bank.
 applyRosaryScripturePolicy(r,info,{french:isFr(),guided:S.rosary.mode==='guided'});
 lastRosaryRitualKey=st.key;
 return true;
}
function rosarySetHeading(set){
 const labels={
  joyful:L('Joyful Mysteries','Mystères joyeux'),
  sorrowful:L('Sorrowful Mysteries','Mystères douloureux'),
  glorious:L('Glorious Mysteries','Mystères glorieux'),
  luminous:L('Luminous Mysteries','Mystères lumineux')
 };
 return labels[String(set||'')]||'';
}
function declutterRosaryDonor(r){
 const info=rosaryLiveInfo(),setHeading=rosarySetHeading(info?.set);
 const headerTitle=r.querySelector('.lab-view-head h1');
 if(headerTitle&&setHeading)headerTitle.textContent=setHeading;
 const mysteryKicker=r.querySelector('.lab-contemplation .kicker,.r23-contemplation .kicker');
 if(mysteryKicker){mysteryKicker.hidden=true;mysteryKicker.setAttribute('aria-hidden','true');mysteryKicker.dataset.aoRosaryRedundant='true';}
 const prayerCount=r.querySelector('.lab-prayer-count');
 if(prayerCount){prayerCount.hidden=true;prayerCount.setAttribute('aria-hidden','true');prayerCount.dataset.aoRosaryRedundant='true';}
 const prayerRubric=r.querySelector('.lab-prayer-sheet>.rubric');
 if(prayerRubric&&info?.step?.phase!=='opening'){
   prayerRubric.hidden=true;prayerRubric.setAttribute('aria-hidden','true');prayerRubric.dataset.aoRosaryRedundant='true';
 }
 const beadStage=r.querySelector('.lab-bead-stage');
 if(beadStage&&info?.step?.kind==='mystery'){
   beadStage.hidden=true;beadStage.setAttribute('aria-hidden','true');beadStage.dataset.aoRosaryDeferred='true';
 }
 r.querySelectorAll('.lab-option-bar .lab-step-count').forEach(node=>{
   node.hidden=true;node.setAttribute('aria-hidden','true');node.dataset.aoRosaryRedundant='true';
 });
 r.querySelectorAll('button').forEach(button=>{
   const label=String(button.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
   if(['guide','preferences','préférences'].includes(label)){
     button.hidden=true;button.setAttribute('aria-hidden','true');button.dataset.aoRosaryRedundant='true';
   }
 });
 r.querySelectorAll('[data-r23-overview-open],#r23-overview-sheet').forEach(node=>node.remove());
 r.querySelectorAll('.lab-view-head .aoModuleHome,.lab-view-head .lab-lang').forEach(node=>{
   node.hidden=true;node.setAttribute('aria-hidden','true');node.dataset.aoRosaryRedundant='true';
 });
 r.querySelectorAll('.lab-prayer-flip[data-pb-flip]').forEach(host=>{
   if(host.dataset.aoRosaryLanguageDefault==='vernacular')return;
   setRosaryPrayerLanguage(host,'vernacular');
 });
}
let rosaryGuideOpen=false;
function ensureRosaryGuide(r){
 const shell=r?.querySelector?.('.pbShell');if(!shell)return null;
 const language=lang();
 let guide=shell.querySelector('[data-ao-rosary-guide]');
 if(guide&&guide.dataset.aoRosaryGuideLanguage===language)return guide;
 const wasOpen=guide ? guide.open===true : rosaryGuideOpen;
 if(!guide){
   guide=document.createElement('details');
   guide.className='aoRosaryGuide';
   guide.dataset.aoRosaryGuide='';
   guide.addEventListener('toggle',()=>{rosaryGuideOpen=guide.open===true});
   const bar=shell.querySelector('.aoP435930RosaryBar');
   const header=shell.querySelector('.lab-view-head,.pbTop,.pbHead,header');
   if(bar)bar.insertAdjacentElement('afterend',guide);
   else if(header)header.insertAdjacentElement('afterend',guide);
   else shell.prepend(guide);
 }
 // Preserve the open Guide and the Rosary step; repaint only for a language change.
 guide.dataset.aoRosaryGuideLanguage=language;
 const allSections=rosaryGuideSections(language),later=allSections.at(-1);
 guide.innerHTML=`<summary>${esc(L('Guide · history, mysteries & practice','Guide · histoire, mystères et pratique'))}</summary><div class="aoRosaryGuideBody">${allSections.slice(0,-1).map(section=>`<section class="aoRosaryGuideSection"><h3>${esc(section.heading)}</h3><p>${esc(section.body)} <a href="${esc(section.source.url)}" target="_blank" rel="noopener noreferrer">${esc(section.source.label)} ↗</a></p></section>`).join('')}<section class="aoRosaryGuideSection aoRosaryHistoricalAppendix" data-ao-b01-rosary-later><h3>${esc(L("Later historical note · 2002","Note historique ultérieure · 2002"))}</h3><h3>${esc(later.heading)}</h3><p>${esc(later.body)} <a href="${esc(later.source.url)}" target="_blank" rel="noopener noreferrer">${esc(later.source.label)} ↗</a></p></section><p class="aoRosaryGuideRelated" data-ao-b01-rosary-related>${esc(L("Other Marian prayer, outside the Rosary sequence:","Autre prière mariale, hors du Rosaire :"))} <a href="${esc(B01_AUGUST_QUEEN_SOURCE.url)}" target="_blank" rel="noopener noreferrer">${esc(L("August Queen of Heaven · ICKSP","Auguste Reine des Cieux · ICKSP"))} ↗</a></p></div>`;
 guide.open=wasOpen;
 rosaryGuideOpen=guide.open===true;
 return guide;
}
let rosaryPreparationOpen=false,rosaryMysteriesOpen=false;
// A Rosary opening is prayer-first: move the preserved recommendation ahead of
// presentation options without changing the donor's buttons, event handlers or
// historical form selection. The active-bead screen has no hero and is untouched.
function prepareRosaryOpening(r){
 const shell=r?.querySelector?.('.pbShell');
 const hero=shell?.querySelector?.(':scope > .lab-rosary-hero');
 if(!hero)return false;
 const header=shell.querySelector(':scope > .lab-view-head');
 let disclosure=shell.querySelector(':scope > .aoRosaryPreparation');
 if(!disclosure){
  disclosure=document.createElement('details');
  disclosure.className='aoRosaryPreparation';
  disclosure.dataset.aoRosaryPreparation='';
  disclosure.addEventListener('toggle',()=>{rosaryPreparationOpen=disclosure.open===true});
  const summary=document.createElement('summary');
  summary.append(document.createTextNode(L('Reading and recitation options','Options de lecture et de récitation')));
  const state=document.createElement('span');
  state.className='aoRosaryPreparationState';summary.append(state);
  const body=document.createElement('div');
  body.className='aoRosaryPreparationBody';
  disclosure.append(summary,body);
 }
 // Keep a stable, meaningful order for a first-time visitor, retaining
 // the exact source-owned action as the first prominent card.
 if(header&&hero.previousElementSibling!==header)header.insertAdjacentElement('afterend',hero);
 if(disclosure.previousElementSibling!==hero)hero.insertAdjacentElement('afterend',disclosure);
 const body=disclosure.querySelector('.aoRosaryPreparationBody');
 const bar=shell.querySelector('.aoP435930RosaryBar');
 const recitation=shell.querySelector('.lab-recitation-mode,.r29-head-recitation');
 const guide=shell.querySelector('.aoRosaryGuide');
 const form=shell.querySelector('.v38RosaryForm');
 const options=shell.querySelector('.lab-option-bar');
 for(const node of [bar,recitation,form,options,guide]){
  if(node&&node.parentElement!==body)body.appendChild(node);
 }
 // The original four mystery buttons stay interactive and source-owned.
 // They should not repeat today's recommended mystery until requested.
 let mysteries=shell.querySelector(':scope > .aoRosaryOtherMysteries');
 if(!mysteries){
   mysteries=document.createElement('details');
   mysteries.className='aoRosaryOtherMysteries';
   mysteries.dataset.aoRosaryOtherMysteries='';
   const summary=document.createElement('summary');
   summary.textContent=L('Choose different mysteries','Choisir d’autres mystères');
   const content=document.createElement('div');
   content.className='aoRosaryMysteryChoices';
   mysteries.append(summary,content);
   mysteries.addEventListener('toggle',()=>{rosaryMysteriesOpen=mysteries.open===true});
 }
 if(mysteries.previousElementSibling!==disclosure)disclosure.insertAdjacentElement('afterend',mysteries);
 const grid=shell.querySelector('.lab-mystery-grid');
 const target=mysteries.querySelector('.aoRosaryMysteryChoices');
 if(grid&&grid.parentElement!==target)target.appendChild(grid);
 mysteries.open=rosaryMysteriesOpen;
 const state=disclosure.querySelector('.aoRosaryPreparationState');
 if(state)state.textContent=[
  S.rosary.mode==='guided'?L('Guided','Guidé'):L('Simple','Simple'),
  S.rosary.recitation==='group'?L('Group','Groupe'):L('Individual','Individuel')
 ].join(' · ');
 disclosure.open=rosaryPreparationOpen;
 return true;
}
// Reading preferences belong behind one optional control during the
// active Rosary. Reparent the *existing* donor controls; the canonical bead
// engine continues to own recitation, Scripture, history and progression.
let rosaryActiveOptionsOpen=false;
function prepareRosaryActive(r){
 const shell=r?.querySelector?.('.pbShell');
 if(!shell||shell.querySelector(':scope > .lab-rosary-hero')||
    !shell.querySelector('[data-lab-rosary-next]'))return false;
 const rail=shell.querySelector(':scope > .aoRosaryFaithfulRail');
 const header=shell.querySelector(':scope > .lab-view-head');
 const after=rail||header;if(!after)return false;
 let options=shell.querySelector(':scope > .aoRosaryActiveOptions');
 if(!options){
   options=document.createElement('details');
   options.className='aoRosaryActiveOptions';
   options.dataset.aoRosaryActiveOptions='';
   const summary=document.createElement('summary');
   summary.append(document.createTextNode(L('Reading options','Options de lecture')));
   const state=document.createElement('span');
   state.className='aoRosaryActiveOptionsState';
   summary.appendChild(state);
   const body=document.createElement('div');
   body.className='aoRosaryActiveOptionsBody';
   options.append(summary,body);
   // Initial state is restored only on a newly recreated donor sheet.
   // Never override a native details click on an already mounted control;
   // the donor repaints asynchronously and its toggle event may be pending.
   options.open=rosaryActiveOptionsOpen;
   options.addEventListener('toggle',()=>{rosaryActiveOptionsOpen=options.open===true});
 }
 if(after.nextElementSibling!==options)after.insertAdjacentElement('afterend',options);
 const body=options.querySelector('.aoRosaryActiveOptionsBody');
 const reading=shell.querySelector('.aoP435930RosaryBar');
 const recitation=shell.querySelector('.r29-head-recitation,.lab-recitation-mode');
 const guide=shell.querySelector('.aoRosaryGuide');
 for(const control of [reading,recitation,guide]){
   if(control&&control.parentElement!==body)body.appendChild(control);
 }
 const state=options.querySelector('.aoRosaryActiveOptionsState');
 if(state)state.textContent=[
   S.rosary.mode==='guided'?L('Guided','Guidé'):L('Simple','Simple'),
   S.rosary.recitation==='group'?L('Group','Groupe'):L('Individual','Individuel')
 ].join(' · ');
 return true;
}
function installRosaryNamedTimeline(r){
 const info=rosaryLiveInfo(),shell=r?.querySelector(".pbShell");
 if(!info?.steps?.length||!shell||!shell.querySelector("[data-lab-rosary-next]"))return false;
 const titles=FS_MYSTERIES[info.set]?.items?.[isFr()?"fr":"en"]||[];
 const chapters=rosaryNamedChapters(info.steps,{set:info.set,french:isFr(),titles});
 const selected=rosaryCurrentChapter(chapters,info.index);
 let timeline=shell.querySelector(":scope > .aoRosaryNamedTimeline");
 if(!timeline){
  timeline=document.createElement("nav");timeline.className="aoDevoTimeline aoRosaryNamedTimeline";
  timeline.dataset.aoRosaryNamedTimeline="1";
  timeline.setAttribute("aria-label",L("Rosary prayer cards","Cartes du Rosaire"));
  timeline.addEventListener("click",event=>{
   const button=event.target.closest("[data-ao-rosary-chapter]");
   if(!button)return;
   const start=Number(button.dataset.aoRosaryChapter);
   const state=rosaryLiveInfo();
   if(!state||!Number.isInteger(start)||start<0||start>=state.steps.length)return;
   event.preventDefault();event.stopPropagation();
   if(typeof window.AO_ROSARY_V381?.setStep!=="function"||window.AO_ROSARY_V381.setStep(start)===false)return;
   setTimeout(decorateRosary,0);
  });
 }
 const key=info.set+":"+lang()+":"+chapters.map(c=>c.id+":"+c.start).join("|");
 if(timeline.dataset.aoRosaryPlan!==key){
  timeline.dataset.aoRosaryPlan=key;
  const stops=document.createElement("div");stops.className="aoDevoStops";
  chapters.forEach((chapter,index)=>{
   const button=document.createElement("button");button.type="button";button.className="aoDevoStop";
   button.dataset.aoRosaryChapter=String(chapter.start);
   const number=document.createElement("span");number.className="aoDevoStopNumber";number.textContent=String(index+1).padStart(2,"0");
   const title=document.createElement("span");title.className="aoDevoStopTitle";title.textContent=chapter.title;
   button.append(number,title);stops.append(button);
  });
  timeline.replaceChildren(stops);
 }
 [...timeline.querySelectorAll("[data-ao-rosary-chapter]")].forEach((b,i)=>{
  b.classList.toggle("active",i===selected);
  b.setAttribute("aria-current",i===selected?"step":"false");
 });
 updateDevotionalProgress(timeline,{index:selected,total:chapters.length,language:lang()});
 const options=shell.querySelector(":scope > .aoRosaryActiveOptions");
 const head=shell.querySelector(":scope > .lab-view-head");
 const after=options||shell.querySelector(":scope > .aoRosaryFaithfulRail")||head;
 if(after&&timeline.previousElementSibling!==after)after.insertAdjacentElement("afterend",timeline);
 return true;
}
function decorateRosary(){
 const r=rosaryDonorRoot();if(!r||!r.classList?.contains('open'))return;
 // Montfort's historical methods cover fifteen traditional mysteries only.
 if(['montfort','montfort_short'].includes(window.AO_ROSARY_V381?.getMethod?.())){
  r.querySelectorAll('[data-pb-rosary-set="luminous"]').forEach(b=>{
   b.hidden=true;b.disabled=true;b.setAttribute('aria-hidden','true');
  });
 }
 r.querySelectorAll('.flipHint,.translationNote,.pbFlipHint,.lab-flip-hint,[data-pb-flip-hint]').forEach(n=>{n.hidden=true;n.setAttribute('aria-hidden','true')});
 // Existing donor's Individual / Group options visually tracked the mode
 // but had no pressed-state semantics. Keep the canonical controls; annotate
 // them from the single Prayer preference owner after each donor repaint.
 r.querySelectorAll('[data-ao-recitation]').forEach(button=>{
   const mode=button.dataset.aoRecitation;
   if(mode==='individual'||mode==='group')
     button.setAttribute('aria-pressed',String(S.rosary.recitation===mode));
 });
 r.classList.toggle('aoP435930RosarySimple',S.rosary.mode==='simple');r.classList.toggle('aoP435930RosaryGuided',S.rosary.mode==='guided');
 let bar=r.querySelector('.aoP435930RosaryBar');if(!bar){bar=document.createElement('div');bar.className='aoP435930RosaryBar';bar.setAttribute('aria-label',L('Rosary reading depth','Profondeur du Rosaire'));const h=r.querySelector('.lab-view-head,.pbTop,.pbHead,header');h?.insertAdjacentElement('afterend',bar)}
 if(bar)bar.innerHTML=`<button type="button" data-p435930-rosary-depth="simple" class="${S.rosary.mode==='simple'?'active':''}" aria-pressed="${S.rosary.mode==='simple'}">${esc(L('Simple','Simple'))}</button><button type="button" data-p435930-rosary-depth="guided" class="${S.rosary.mode==='guided'?'active':''}" aria-pressed="${S.rosary.mode==='guided'}">${esc(L('Guided','Guidé'))}</button>`;
 if(S.rosary.mode==='guided'&&!r.querySelector('.aoP435930SilencePrompt')){const target=r.querySelector('.lab-contemplation');if(target){const n=document.createElement('div');n.className='aoP435930SilencePrompt';n.textContent=L('Silence · remain with the mystery before moving on.','Silence · demeurez avec le mystère avant de poursuivre.');target.appendChild(n)}}
 decorateRosaryExact(r);
 ensureRosaryGuide(r);
 prepareRosaryOpening(r);
 prepareRosaryActive(r);
 declutterRosaryDonor(r);
 installRosaryNamedTimeline(r);
 const info=rosaryLiveInfo();
 if(info?.steps?.length){
  const titles=FS_MYSTERIES[info.set]?.items?.[isFr()?"fr":"en"]||[];
  installRosaryActiveCard({
   root:r,stepIndex:info.index,
   chapters:rosaryNamedChapters(info.steps,{set:info.set,french:isFr(),titles}),
   navigate:start=>{
    const api=window.AO_ROSARY_V381;
    if(typeof api?.setStep==="function"&&api.setStep(start)!==false)
     setTimeout(decorateRosary,0);
   }
  });
 }
}
function confessionModeLabel(path){
 const p=confessionPath(path);
 return p?esc(isFr()?p.titleFr:p.titleEn):esc(L("Choose your preparation","Choisissez votre préparation"));
}
function confessionSingleCard(card,pos,count,context){
 const title=card.kind==="questions"?card.title:isFr()?card.fr:card.en;
 const body=card.kind==="questions"
  ?`<ul class="aoP435930ConfQuestions">${card.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ul>`
  :`<p>${esc(isFr()?card.bodyFr:card.bodyEn)}</p>`;
 return `<section class="aoP435930ConfOneCard" data-ao-confession-card="${esc(card.id)}" data-conf-${esc(context)}-step="${pos}" aria-label="${esc(L('Confession step','Étape de la confession'))+' '+(pos+1)}">
   <small>${esc(L('Step','Étape'))} · ${pos+1} / ${count}</small>
   <h2 tabindex="-1">${esc(title)}</h2>${body}
   </section>`;
}
function confessionContritionPicker(kicker){
 // Source alternatives are prayer texts *before* entering, never an app-led rite.
 const pius=CONF.contrition==="piusx",record=B01_PIUS_X_1905_CONTRITION;
 const chooser='<nav class="aoP435930ConfContritionChoices" data-ao-conf-contrition-picker role="group" aria-label="'+
   esc(L("Choose an Act of Contrition","Choisir un acte de contrition"))+'">'+
   '<button type="button" data-p435930-conf-contrition="standard" aria-pressed="'+String(!pius)+'">'+
     esc(L("Established Act","Acte habituel"))+'</button>'+
   '<button type="button" data-p435930-conf-contrition="piusx" aria-pressed="'+String(pius)+'">'+
     esc(L("St Pius X · 1905","Saint Pie X · 1905"))+'</button></nav>';
 const prayer=pius?prayerBlock(record.id,{record,kicker}):guidePrayers([{id:"sacrament_act_of_contrition",kicker}]);
 const note=pius?'<p class="aoP435930ConfContritionSourceStatus" data-ao-conf-contrition-source-status>'+
   esc(L("This is an editorial English rendering of the attested 1905 Italian catechism, not a certified historical English edition. It is a private preparatory prayer, not a priest’s sacramental formula.",
   "Cette traduction française est une adaptation éditoriale du catéchisme italien de 1905, non une édition française historique certifiée. Il s’agit d’une prière préparatoire personnelle, non d’une formule sacramentelle du prêtre."))+
   ' <a href="'+esc(record.provenance.url)+'" target="_blank" rel="noopener noreferrer">'+
   esc(L("1905 Italian original","Original italien de 1905"))+'</a></p>':'';
 return '<section class="aoP435930ConfContrition" data-ao-confession-act aria-label="'+
   esc(L("Prayer before entering the confessional","Prière avant d’entrer au confessionnal"))+'">'+
   '<h3>'+esc(L("Act of Contrition · private preparation","Acte de contrition · préparation personnelle"))+'</h3>'+chooser+note+prayer+'</section>';
}
function confessionExaminationView(ex){
 const cards=confessionExaminationCards(CONF.path,ex?.sections);
 const pos=confessionStepAt(CONF.examStep,cards.length);
 const note=CONF.path==="regular"
  ?L("Four short groups cover all Ten Commandments. Pause to recall what you need to confess; no answers or sins are recorded.","Quatre groupes brefs couvrent les dix commandements. Prenez le temps de vous souvenir de ce que vous devez confesser ; aucune réponse ni aucun péché n'est enregistré.")
  :L("Read one step at a time. A diligent but reasonable examination is enough; the confessor can help with uncertainty.","Avancez étape par étape. Un examen diligent mais raisonnable suffit ; le confesseur peut vous aider en cas de doute.");
 return `${guideNow(L('Examine your conscience','Examinez votre conscience'),note)}
 ${confessionSingleCard(cards[pos],pos,cards.length,"exam")}
 ${pos===cards.length-1?confessionContritionPicker(L("Act of Contrition","Acte de contrition")):""}`;
}

function renderConfession(){
 const stages=[L('Prepare','Préparer'),L('Examination','Examen'),L('Before entering','Avant d’entrer'),L('After','Après')];
 const ex=isFr()?DATA.examFr:DATA.exam;
 const path=confessionPath(CONF.path);
 let body='';
 if(CONF.stage===0){
  const choices=Object.values(CONFESSION_PATHS).map(p=>`<button type="button" data-p435930-conf-path="${esc(p.id)}" aria-pressed="${CONF.path===p.id}" class="${CONF.path===p.id?'selected':''}">
   <strong>${esc(isFr()?p.titleFr:p.titleEn)}</strong>
   <span>${esc(isFr()?p.descriptionFr:p.descriptionEn)}</span></button>`).join('');
  body=`${guideNow(L('What kind of Confession?','Quelle préparation à la confession ?'),L('Select the situation that fits. The length of time since your last Confession does not automatically mean you need a general Confession.','Choisissez votre situation. Une longue absence ne signifie pas automatiquement qu’une confession générale est nécessaire.'))}
  <div class="aoP435930ConfPathCards" role="group" aria-label="${esc(L('Confession preparation path','Parcours de préparation'))}">${choices}</div>
  <div class="aoP435930Checklist"><label><span>${esc(L('Time since last good Confession (optional)','Depuis votre dernière bonne confession (facultatif)'))}</span><input type="text" autocomplete="off" data-p435930-since value="${esc(CONF.since)}" placeholder="${esc(L('e.g. 3 weeks / several years','p. ex. 3 semaines / plusieurs années'))}"></label></div>
  ${callout(esc(L('This time estimate remains only in this session. The app never asks you to enter, mark or save sins.','Cette indication n’existe que pendant cette session. L’application ne demande jamais de saisir, cocher ou enregistrer vos péchés.')),'privacy')}
  ${guidePrayers([{id:'sacrament_come_holy_spirit',kicker:L('Prayer for light','Prière pour demander la lumière')}])}`;
 }
 if(CONF.stage===1)body=confessionExaminationView(ex);
 if(CONF.stage===2){
  // Read these rehearsal cards before entering; never encourage reading the phone during absolution.
  const cards=confessionRiteCards(CONF.path),pos=confessionStepAt(CONF.riteStep,cards.length);
  body=`${guideNow(L('Before you enter the confessional','Avant d\'entrer au confessionnal'),L('Review these simple steps, then put your phone away. The sacrament takes place with the priest, not in this app.','Relisez ces étapes, puis rangez votre téléphone. Le sacrement a lieu avec le prêtre, non dans cette application.'))}
  ${confessionSingleCard(cards[pos],pos,cards.length,"rite")}
  ${pos===cards.length-1?confessionContritionPicker(L("Read before entering","À relire avant d’entrer")):""}
  ${callout(esc(L('No audio recording, transcript, stored sins or simulated absolution.','Aucun enregistrement audio, aucune transcription, aucun péché conservé, aucune absolution simulée.')),'privacy')}`;
 }
 if(CONF.stage===3){
  const cards=confessionAfterCards(),pos=confessionStepAt(CONF.afterStep,cards.length);
  body=`${guideNow(L('After Confession','Après la confession'),L('Give thanks, complete your assigned penance and repair harm where justice requires. These steps do not imply that absolution occurred merely by navigating the app.','Rendez grâce, accomplissez la pénitence reçue et réparez le tort lorsque la justice l\'exige. Naviguer dans l\'application ne signifie pas qu\'une absolution a été reçue.'))}
  ${confessionSingleCard(cards[pos],pos,cards.length,"after")}
  ${pos===cards.length-1?`<button class="aoP435930Danger" type="button" data-p435930-conf-clear>${esc(L('Clear this preparation now','Effacer cette préparation maintenant'))}</button>`:''}`;
 }
 const sources=`<details class="aoP435930ConfSources"><summary>${esc(L('Catholic sources and explanation','Sources et explication catholiques'))}</summary>
   <p>${esc(L('A general Confession is a wider individual examination; it is not required simply because the last Confession was long ago, and is not the exceptional collective rite of general absolution. All unconfessed grave sins remembered after diligent examination must be confessed by kind and number.','Une confession générale est un examen individuel plus large ; une longue absence ne l’impose pas, et elle n’est pas le rite exceptionnel d’absolution générale collective. Tout péché grave non encore confessé, rappelé après un examen diligent, doit être confessé selon son espèce et son nombre.'))}</p>
   ${CONFESSION_SOURCE_LINKS.map(src=>`<a href="${esc(isFr()&&src.urlFr?src.urlFr:src.url)}" target="_blank" rel="noopener noreferrer">${esc(isFr()&&src.labelFr?src.labelFr:src.label)} ↗</a>`).join('')}</details>`;
 // Preserve all three canonical Confession paths and their original private
 // question texts. The source model owns the step sequence; this wrapper
 // supplies only the shared card shell and local paragraph-focus viewport.
 let cardSequence=null,cardIndex=0;
 if(CONF.stage===1&&path){
  cardSequence=confessionExaminationCards(CONF.path,ex?.sections);
  cardIndex=confessionStepAt(CONF.examStep,cardSequence.length);
 }else if(CONF.stage===2&&path){
  cardSequence=confessionRiteCards(CONF.path);
  cardIndex=confessionStepAt(CONF.riteStep,cardSequence.length);
 }else if(CONF.stage===3&&path){
  cardSequence=confessionAfterCards();
  cardIndex=confessionStepAt(CONF.afterStep,cardSequence.length);
 }
 if(cardSequence){
  const card=cardSequence[cardIndex];
  const title=card.kind==='questions'?card.title:isFr()?card.fr:card.en;
  body=`<section class="aoDevoCard" data-ao-devo-card="${esc(card.id)}">
    <header class="aoDevoCardHead"><small class="aoDevoCardNumber">${cardIndex+1} / ${cardSequence.length}</small><h2 class="aoDevoCardTitle">${esc(title)}</h2></header>
    <div class="aoDevoCardScroll" role="region" aria-label="${esc(title)}">${body}</div>
  </section>`;
 }
 const optionalPrayers=CONF.stage===2&&cardSequence&&cardIndex===cardSequence.length-1?
 `<details class="aoP435930ConfHistoricalOptions" data-ao-batch03-conf-contrition><summary>${esc(L('Historical Act of Contrition · alternative source','Acte de contrition historique · source alternative'))}</summary>
 <p>${esc(L('The established canonical Act and optional St Pius X prayer are distinct sources. English and French renderings of the 1905 Italian original are editorial and not certified published translations. Read before entering; follow the priest during the sacrament.','L’acte canonique habituel et la prière facultative de saint Pie X proviennent de sources distinctes. Les versions française et anglaise du texte italien de 1905 sont éditoriales, non des traductions imprimées certifiées. Lisez-les avant d’entrer ; suivez le prêtre pendant le sacrement.'))}</p>
 <a href="${esc(CONFESSION_HISTORICAL_SOURCE_POLICY.piusX.source)}" target="_blank" rel="noopener noreferrer">${esc(L('St Pius X · 1905 original','Saint Pie X · original de 1905'))} ↗</a></details>`:
 CONF.stage===3&&cardSequence&&cardIndex===cardSequence.length-1?
 `<details class="aoP435930ConfHistoricalOptions" data-ao-batch03-conf-thanks><summary>${esc(L('Optional thanksgiving prayer','Prière d’action de grâces facultative'))}</summary>
 <p>${esc(L('This is private thanksgiving after an actual Confession, not proof of absolution or a substitute for assigned penance.','Action de grâces personnelle après une confession réelle, non preuve de l’absolution ni substitut à la pénitence imposée.'))}</p>${guidePrayers([{id:'foundations_glory_be',kicker:L('Glory Be','Gloire au Père')}])}</details>`:'';
 const lastCard=CONF.stage===3&&CONF.afterStep===confessionAfterCards().length-1;
 const stageBoundary=CONF.stage===0||(cardSequence&&cardIndex===cardSequence.length-1);
 // A step button is warranted at a section boundary, not within an
 // examination/rehearsal card deck. Stage 2 -> After remains an explicit
 // user action; traversing the app must never imply sacramental absolution.
 const navigation=stageBoundary?`<div class="aoP435930GuideNav aoP435930FinalExit"><button type="button" class="aoP435930Primary" data-p435930-conf-next ${CONF.stage===0&&!path?'disabled aria-disabled="true"':''}>${esc(lastCard?L('Finish · clear and return','Terminer · effacer et revenir'):CONF.stage===2?L('After Confession · when ready','Après la confession · lorsque vous êtes prêt'):CONF.stage===0?L('Begin examination','Commencer l’examen'):L('Continue to next section','Passer à la section suivante'))}</button></div>`:'';
 const sectionRail=guideRail(stages,CONF.stage,'conf');
 const initialProgress=CONF.stage===0?devotionalProgressMarkup({index:0,total:stages.length,language:lang(),unit:'stage'}):'';
 return `${head(L('Confession','Confession'),confessionModeLabel(CONF.path))}<div class="aoP435930ConfNavShell">${sectionRail}${initialProgress}</div><main class="aoP435930Body aoP435930ConfessionReader" data-ao-confession-section="${CONF.stage}" data-ao-confession-card-index="${cardIndex}" data-ao-confession-final="${cardSequence?cardIndex===cardSequence.length-1:'false'}">${body}${optionalPrayers}${devotionalGuide('confession')}${sources}${navigation}</main>`;
}
const BEN_STAGES=[
 ['exposition','Exposition','Exposition'],['adoration','Adoration','Adoration'],['hymn','Tantum Ergo','Tantum Ergo'],['prayer','Versicle & collect','Verset et oraison'],['blessing','Blessing','Bénédiction'],['praises','Divine Praises','Louanges divines'],['reposition','Reposition','Reposition']
];
function benStages(){return christKingStages(BEN_STAGES,BEN.celebration,BEN.feastOptions)}
function benMacroIndex(step){const id=benStages()[step]?.[0];if(id==='exposition')return 0;if(id==='adoration'||id?.startsWith('king-'))return 1;if(id==='reposition')return 3;return 2}
function benMacroRail(step){const labels=[L('Exposition','Exposition'),L('Adoration','Adoration'),L('Benediction','Bénédiction'),L('Reposition','Reposition')];return `<div class="aoP435930StageRail aoP435930BenMacroRail">${labels.map((x,i)=>`<span class="${i===benMacroIndex(step)?'active':''}" ${i===benMacroIndex(step)?'aria-current="step"':''}>${esc(x)}</span>`).join('')}</div>`}
function benFeastSource(title,url){
 return '<p class="aoP435930FeastSource"><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+' ↗</a></p>';
}
function benFeastPrayer(record,title,url){
 const vern=record[lang()]||record.en||'',latin=record.la||'',both=Boolean(vern&&latin);
 return '<article class="aoP435930Prayer aoP435930FeastPrayer">'+
  '<div class="aoP435930PrayerHead"><div><h3>'+esc(title)+'</h3></div></div>'+
  (both?'<button type="button" class="aoP435930Flip" data-p435930-flip aria-label="'+esc(L('Replace prayer with Latin','Remplacer la prière par le latin'))+'"><span data-face-v>'+nl(vern)+'</span><span data-face-la hidden>'+nl(latin)+'</span></button>':
   '<div class="aoP435930Text">'+nl(vern||latin)+'</div>')+
  benFeastSource(L('Text and provenance','Texte et provenance'),url)+
  (record.note?'<details class="aoP435930FeastEdition"><summary>'+esc(L('Text version','Version du texte'))+'</summary><p>'+esc(record.note)+'</p></details>':'')+'</article>';
}
function benFeastOptions(){
 const enabled=BEN.celebration==='christKing';
 const opts=[['procession',L('Eucharistic procession','Procession eucharistique')],
  ['royalPraises','Christus vincit'],['sacredHeartLitany',L('Litany of the Sacred Heart','Litanies du Sacré-Cœur')],
  ['consecration',L('Consecration of the human race','Consécration du genre humain')]];
 return '<details class="aoP435930PrayerOptions aoP435930BenFeastOptions" data-ao-ben-feast-options>'+
  '<summary>'+esc(L('Celebration · '+(enabled?'Christ the King':'Ordinary'),'Célébration · '+(enabled?'Christ-Roi':'Ordinaire')))+'</summary>'+
  '<div class="aoP435930PrayerOptionsBody">'+
  '<label class="aoP435930Toggle"><input type="checkbox" data-p435930-ben-feast '+(enabled?'checked':'')+'><span><b>'+esc(L('Christ the King · optional elements','Christ-Roi · éléments facultatifs'))+'</b><small>'+esc(L('This is not a universal order of service.','Ceci n’est pas un ordre de cérémonie universel.'))+'</small></span></label>'+
  (enabled?opts.map(([key,label])=>'<label class="aoP435930Toggle"><input type="checkbox" data-p435930-ben-feast-option="'+key+'" '+(BEN.feastOptions[key]?'checked':'')+'><span><b>'+esc(label)+'</b></span></label>').join(''):'')+
  benFeastSource(L('Pius XI · Quas primas §28','Pie XI · Quas primas §28'),CHRIST_KING_WITNESSES.decree)+
  benFeastSource(L('2012 Royal Praises witness · not a prescribed local 1962 chant','Témoin des Laudes de 2012 · non un chant local de 1962 prescrit'),CHRIST_KING_WITNESSES.royalPraises)+
  '</div></details>';
}
function renderBenediction(){
 const stages=benStages(),i=Math.max(0,Math.min(stages.length-1,BEN.step)),id=stages[i][0],titles=stages.map(x=>L(x[1],x[2]));let body='';
 if(id==='exposition')body=`${guideNow(L('Attend to the Exposition','Soyez attentif à l’exposition'),L('When the Blessed Sacrament is exposed, turn your attention to the altar. If O Salutaris is actually sung, pray or sing it with the church; otherwise follow what is used.','Lorsque le Saint-Sacrement est exposé, tournez votre attention vers l’autel. Si O Salutaris est effectivement chanté, priez-le ou chantez-le avec l’assemblée ; sinon, suivez ce qui est utilisé.'))}${prayerBlock('benediction_o_salutaris',{kicker:L('If sung here','Si chanté ici')})}${guideCue(L('WAIT FOR','ATTENDEZ'),L('Stay here until the opening hymn or prayers have finished and the service settles into adoration.','Restez ici jusqu’à la fin du chant ou des prières d’ouverture et jusqu’à ce que l’office entre dans l’adoration.'))}`;
 if(id==='adoration')body=`${guideNow(L('Remain with the public rite','Restez avec le rite public'),L('Adore in silence or follow the Scripture, prayer or sacred music actually being used. Do not fill the interval simply because the app has more text.','Adorez en silence ou suivez l’Écriture, la prière ou la musique sacrée réellement utilisées. Ne remplissez pas l’intervalle simplement parce que l’application contient davantage de texte.'))}${guideCue(L('WAIT FOR','ATTENDEZ'),L('Advance when Tantum Ergo begins, or when the service clearly moves into the hymn immediately before Benediction.','Avancez lorsque commence Tantum Ergo, ou lorsque l’office passe clairement au chant qui précède immédiatement la bénédiction.'))}`;

 if(id==='king-procession')body=guideNow(L('Follow the Eucharistic procession','Suivez la procession eucharistique'),L('A procession is an optional local addition; follow the clergy, actual route and hymns.','Une procession est un usage local facultatif ; suivez le clergé, le parcours et les chants réels.'))+guideCue(L('WAIT FOR','ATTENDEZ'),L('Continue after the procession ends and the prayers actually begin.','Continuez lorsque la procession se termine et que les prières commencent.'));
 if(id==='king-royal-praises')body=guideNow(L('Laudes Regiae · follow the schola','Laudes Regiæ · suivez la schola'),L('Complete four-part 2012 Vatican chant witness: for the Church, Pope, bishops and faithful, with all the invocations and concluding acclamations. The current local chant can differ.','Témoin complet du chant pontifical de 2012 en quatre parties : Église, Pape, évêques et fidèles, avec toutes les invocations et acclamations finales. Le chant de votre chapelle peut différer.'))+benFeastPrayer(CHRIST_KING_ROYAL_PRAISES,L('Christus vincit · Laudes Regiae','Christus vincit · Laudes Regiæ'),CHRIST_KING_WITNESSES.royalPraises)+benFeastSource(L('ICKSP chant book · Pope, bishop and faithful verses','Chants ICRSP · versets pour le pape, l’évêque et les fidèles'),CHRIST_KING_WITNESSES.royalPraisesICKSPIndex)+guideCue(L('LOCAL CHOIR TAKES PRIORITY','LA SCHOLA LOCALE PRIME'),L('Follow the actual names and verses sung at your church. Advance only when the next prayer begins.','Suivez les noms et les versets effectivement chantés dans votre église. Avancez uniquement lorsque commence la prière suivante.'));
 if(id==='king-sacred-heart-litany')body=
  guideNow(L('Litany of the Sacred Heart','Litanies du Sacré-Cœur'),L('The Institute’s Ordo for 25 October 2026 places the litany before the consecration. Follow the clergy: the app does not establish which text or portions were sung at your chapel.','L’Ordo de l’Institut du 25 octobre 2026 prévoit les litanies avant la consécration. Suivez le clergé : l’application ne prétend pas connaître les parties effectivement chantées dans votre chapelle.'))+
  benFeastPrayer(SACRED_HEART_DEVOTIONS_V382.litany,L('Litany of the Sacred Heart','Litanies du Sacré-Cœur'),CHRIST_KING_WITNESSES.sacredHeartLitany)+
  guideCue(L('AFTER THE LITANY','APRÈS LES LITANIES'),L('Advance to the consecration when it actually begins. Do not advance while the litany is still being prayed.','Passez à la consécration lorsqu’elle commence réellement. N’avancez pas tant que les litanies se poursuivent.'))+
  benFeastSource(L('ICKSP Ordo · 25 October 2026','Ordo ICRSP · 25 octobre 2026'),CHRIST_KING_WITNESSES.christKingOrdo);
 if(id==='king-consecration')body=guideNow(L('Act of Dedication of the human race','Acte de consécration du genre humain'),L('This begins “Most sweet Jesus, Redeemer of the human race”, not the different short personal Christ the King prayer.','Cet acte commence par « Très doux Jésus, Rédempteur du genre humain », et diffère de la courte consécration personnelle au Christ-Roi.'))+benFeastPrayer(CHRIST_KING_CONSECRATION,L('Consecration of the human race','Consécration du genre humain'),(isFr()?CHRIST_KING_WITNESSES.consecrationFrench:CHRIST_KING_WITNESSES.consecrationEnglish))+guideCue(L('WAIT FOR','ATTENDEZ'),L('Continue when the consecration ends and Tantum Ergo is actually sung.','Avancez quand la consécration prend fin et que commence effectivement le Tantum Ergo.'));
 if(id==='hymn')body=`${guideNow(L('Pray or sing Tantum Ergo','Priez ou chantez Tantum Ergo'),L('Follow the congregation and local posture. Keep your attention on the Blessed Sacrament rather than on the screen.','Suivez l’assemblée et la posture locale. Gardez votre attention sur le Saint-Sacrement plutôt que sur l’écran.'))}${prayerBlock('benediction_tantum_ergo',{kicker:L('Traditional hymn','Hymne traditionnel')})}${guideCue(L('WAIT FOR','ATTENDEZ'),L('Advance when the minister begins Panem de caelo and the collect that follows.','Avancez lorsque le ministre commence Panem de caelo et l’oraison qui suit.'))}`;
 if(id==='prayer')body=`${guideNow(L('Answer the versicle; listen to the collect','Répondez au verset ; écoutez l’oraison'),L('Make the response with the congregation. The minister then says the collect; do not race ahead of the public rite.','Faites le répons avec l’assemblée. Le ministre récite ensuite l’oraison ; ne devancez pas le rite public.'))}${prayerBlock('benediction_versicles',{kicker:L('Panem de caelo · Deus qui nobis','Panem de caelo · Deus qui nobis'),record:{...P('benediction_versicles'),...benedictionVersiclesForDate(P('benediction_versicles'),selectedDateKey())}})}${benFeastSource(L('1961 Graduale · seasonal Alleluia (Paschal time or Corpus Christi feast)','Graduel 1961 · Alleluia saisonnier (temps pascal ou Fête-Dieu)'),BENEDICTION_1962_WITNESS.url)}${!benedictionAlleluiaStatus(selectedDateKey()).known?callout(esc(L('A canonical calendar date was not available; no seasonal Alleluia has been assumed.','Date du calendrier canonique indisponible : l’Alléluia saisonnier n’a pas été présumé.')),'warn'):''}${guideCue(L('WAIT FOR','ATTENDEZ'),L('Advance when the minister prepares to give the Eucharistic blessing.','Avancez lorsque le ministre se prépare à donner la bénédiction eucharistique.'))}`;
 if(id==='blessing')body=`${guideNow(L('Receive the Eucharistic blessing','Recevez la bénédiction eucharistique'),L('Stop interacting with the phone. Attend to the blessing being given with the Blessed Sacrament.','Cessez d’interagir avec le téléphone. Soyez attentif à la bénédiction donnée avec le Saint-Sacrement.'))}${guideCue(L('WAIT UNTIL IT ENDS','ATTENDEZ LA FIN'),L('Do not advance during the blessing. Continue only after it has ended and the service moves on.','N’avancez pas pendant la bénédiction. Continuez seulement lorsqu’elle est terminée et que l’office se poursuit.'))}`;
 if(id==='praises')body=`${guideNow(L('Follow what is actually prayed next','Suivez ce qui est réellement prié ensuite'),L('If the Divine Praises are said here, pray them with the church. If they are omitted, leave them off and continue when Reposition begins.','Si les Louanges divines sont récitées ici, priez-les avec l’assemblée. Si elles sont omises, ne les ajoutez pas et continuez lorsque commence la reposition.'))}
 <label class="aoP435930Toggle"><input type="checkbox" data-p435930-ben-praises ${BEN.divinePraises?'checked':''}><span><b>${esc(L('The Divine Praises are being said','Les Louanges divines sont récitées'))}</b><small>${esc(L('Show the text only when it belongs to this service','Afficher le texte seulement lorsqu’il appartient à cet office'))}</small></span></label>
 ${BEN.divinePraises?`<div class="aoP435930GuideMode" role="group" aria-label="${esc(L('Divine Praises edition','Version des Louanges divines'))}"><label><input type="radio" name="ao-ben-praises-edition" value="1962" data-p435930-ben-praises-form ${BEN.praisesForm==='1962'?'checked':''}>${esc(L('1962 · 13 invocations','1962 · 13 invocations'))}</label><label><input type="radio" name="ao-ben-praises-edition" value="later" data-p435930-ben-praises-form ${BEN.praisesForm==='later'?'checked':''}>${esc(L('After 1964 · 14 invocations','Après 1964 · 14 invocations'))}</label></div>`+prayerBlock('benediction_divine_praises',{kicker:L('Pray with the church','Prier avec l’assemblée'),record:divinePraisesForForm(P('benediction_divine_praises'),BEN.praisesForm)})+benFeastSource(L('AAS 56 (1964), p. 338 · Holy Spirit invocation added after 1962','AAS 56 (1964), p. 338 · invocation au Saint-Esprit ajoutée après 1962'),DIVINE_PRAISES_EDITION.witness):''}
 ${guideCue(L('WAIT FOR','ATTENDEZ'),L('Advance when the Blessed Sacrament is being returned to the tabernacle.','Avancez lorsque le Saint-Sacrement est reporté au tabernacle.'))}`;
 if(id==='reposition')body=`${guideNow(L('Follow the Reposition','Suivez la reposition'),L('Follow the chant and movement actually used as the Blessed Sacrament is returned to the tabernacle. The app does not force Psalm 116 or another local custom.','Suivez le chant et le mouvement réellement utilisés lorsque le Saint-Sacrement est reporté au tabernacle. L’application n’impose ni le psaume 116 ni un autre usage local.'))}${guideCue(L('FINISH WHEN','TERMINEZ LORSQUE'),L('The Blessed Sacrament has been reposed and the public service has actually ended.','Le Saint-Sacrement a été replacé au tabernacle et l’office public est réellement terminé.'))}`;
 return `${head(L('Benediction','Bénédiction'),L('Live companion · the church determines the pace','Compagnon en direct · l’église détermine le rythme'))}<main class="aoP435930Body aoP435930BenedictionReader" data-ao-benediction-step="${i}" data-ao-benediction-celebration="${esc(BEN.celebration)}" data-ao-benediction-final="${i===stages.length-1}">
  ${benFeastOptions()}${batch02SourceLinks('benediction-optional-local')}
 <section class="aoDevoCard" data-ao-devo-card="${esc(id)}">
  <header class="aoDevoCardHead"><small class="aoDevoCardNumber">${i+1} / ${stages.length}</small><h2 class="aoDevoCardTitle">${esc(titles[i])}</h2></header>
  <div class="aoDevoCardScroll" role="region" tabindex="0" aria-label="${esc(titles[i])}">${body}</div>
 </section>
 <details class="aoP435930PrayerOptions" data-ao-benediction-guide><summary>${esc(L('Rite guidance and sources','Guide du rite et sources'))}</summary>
 ${callout(esc(L('Advance only when the public rite actually reaches the next moment. Never use the app as a timer or substitute for the clergy.','Avancez seulement lorsque le rite public atteint réellement l’étape suivante. Ne remplacez ni le clergé ni le déroulement de l’office par un minuteur.')),'rubric')}${devotionalGuide('benediction')}</details>
 ${guideNav('ben',i,stages.length,L('Finish after Reposition','Terminer après la reposition'))}
 </main>`;
}
function presenceBar(){return nav(L('Presence','Présence'),[['reserved','Reserved in tabernacle','Réservé au tabernacle'],['exposed','Exposed','Exposé']],adorationPresence())}
function timerMarkup(){
 if(!ADOR.timerEnd)return `<div class="aoP435930Timer"><b>${esc(L('Optional timer aid','Minuteur facultatif'))}</b><span>${esc(L('It never marks a devotion complete.','Il ne valide jamais une dévotion.'))}</span><div>${[10,20,30,60].map(n=>`<button type="button" data-p435930-timer="${n}">${n} min</button>`).join('')}</div></div>`;
 const rem=Math.max(0,ADOR.timerEnd-Date.now()),min=Math.ceil(rem/60000);return `<div class="aoP435930Timer running"><b>${esc(L('Timer aid','Minuteur'))}: ${min} min</b><span>${esc(L('Completion remains your explicit report.','L’accomplissement reste votre déclaration explicite.'))}</span><button type="button" data-p435930-timer-stop>${esc(L('Stop','Arrêter'))}</button></div>`;
}
function adorationTimerDisclosure(){
 return `<details class="aoAdorationOptionDisclosure" data-ao-adoration-timer ${ADOR.timerEnd?'open':''}><summary>${esc(L('Optional time aid','Minuteur facultatif'))}</summary>${timerMarkup()}</details>`;
}
function guideRail(items,active,kind){
 return `<div class="aoP435930StageRail aoP435930GuideRail">${items.map((x,i)=>`<button type="button" class="${i===active?'active':''}" ${i===active?'aria-current="step"':''} data-p435930-${kind}-step="${i}"><span>${i+1}</span><b>${esc(x)}</b></button>`).join('')}</div>`
}
function litFlowRail(items,active,kind){
 return `<div class="aoP435930StageRail aoP435930LitFlow" data-ao-lit-flow="${esc(kind)}">${items.map((x,i)=>`<button type="button" class="${i===active?'current':i<active?'past':'future'}" ${i===active?'aria-current="step"':''} data-p435930-${kind}-step="${i}"><span>${i+1}</span><b>${esc(x)}</b></button>`).join('')}</div>`;
}
function guideNow(title,action,note=''){
 return `<section class="aoP435930GuideNow"><small>${esc(L('NOW','MAINTENANT'))}</small><h2>${esc(title)}</h2><p>${esc(action)}</p>${note?`<span>${esc(note)}</span>`:''}</section>`
}
function guideCue(label,text){return text?`<section class="aoP435930GuideCue"><small>${esc(label)}</small><p>${esc(text)}</p></section>`:''}
function guidePrayers(items){return items?.length?`<div class="aoP435930GuidePrayers">${items.map(x=>prayerBlock(x.id,{kicker:x.kicker||L('Pray','Prier')})).join('')}</div>`:''}
function guideNav(kind,index,total,lastLabel){
 // Source owner advances via swipe/chapter select. The only explicit
 // action is finishing a finite devotion or following a completed public rite.
 if(index!==total-1)return '';
 return `<div class="aoP435930GuideNav aoP435930FinalExit"><button type="button" class="aoP435930Primary" data-p435930-${kind}-finish>${esc(lastLabel||L('Finish','Terminer'))}</button></div>`
}
function visitSteps(){return [
 {title:L('Recollect','Se recueillir'),now:L('Become still before the tabernacle. Settle your posture according to the place and local custom, then make the Sign of the Cross.','Restez immobile devant le tabernacle. Prenez la posture qui convient au lieu et à la coutume locale, puis faites le signe de la Croix.'),prayers:[{id:'foundations_sign_of_cross'}],silence:L('Let the movement of arriving end before you begin speaking.','Laissez s’achever le mouvement de l’arrivée avant de commencer à parler.')},
 {title:L('Faith & adoration','Foi & adoration'),now:L('Make an act of faith, then adore Christ present in the Blessed Sacrament. Do not hurry into petitions yet.','Faites un acte de foi, puis adorez le Christ présent au Saint-Sacrement. Ne vous hâtez pas encore vers les demandes.'),prayers:[{id:'foundations_act_of_faith'},{id:'foundations_prayer_of_adoration'}],silence:L('Remain briefly with the truth you have just professed.','Demeurez brièvement dans la vérité que vous venez de professer.')},
 {title:L('Thanksgiving','Action de grâces'),now:L('Recall concrete gifts: creation, redemption, the Eucharist, and at least one grace received today. Give thanks in your own words.','Rappelez des dons concrets : la création, la rédemption, l’Eucharistie et au moins une grâce reçue aujourd’hui. Rendez grâce avec vos propres mots.'),prayers:[{id:'foundations_glory_be',kicker:L('Optional doxology','Doxologie facultative')}],silence:L('Name the gifts slowly rather than trying to make a long list.','Nommez les dons lentement plutôt que d’essayer d’établir une longue liste.')},
 {title:L('Reparation','Réparation'),now:L('Begin with your own sins and need for mercy. Offer sorrow for indifference toward Christ without judging particular people.','Commencez par vos propres péchés et votre besoin de miséricorde. Offrez votre regret pour l’indifférence envers le Christ sans juger des personnes particulières.'),prayers:[{id:'sacrament_act_of_contrition'}],silence:L('Stay a moment in humble sorrow, then entrust the past to God’s mercy.','Demeurez un moment dans une humble contrition, puis confiez le passé à la miséricorde de Dieu.')},
 {title:L('Petition','Demande'),now:L('Pray for the Church, those entrusted to you, those who suffer, and your own real needs. Then pray the Our Father.','Priez pour l’Église, ceux qui vous sont confiés, ceux qui souffrent et vos propres besoins réels. Puis récitez le Notre Père.'),prayers:[{id:'foundations_our_father'}],silence:L('Leave room after each intention instead of rushing to the next.','Laissez un espace après chaque intention au lieu de vous précipiter vers la suivante.')},
 {title:L('Silence','Silence'),now:L('Stop adding words. Remain before Christ in silence. When distracted, return simply to His presence.','Cessez d’ajouter des paroles. Demeurez en silence devant le Christ. En cas de distraction, revenez simplement à sa présence.'),prayers:[],silence:L('There is nothing to complete here. Remain as long as is appropriate.','Il n’y a rien à accomplir ici. Demeurez aussi longtemps qu’il convient.')},
 {title:L('Leave recollected','Partir recueilli'),now:L('Before leaving, renew your love of God. If you cannot receive sacramentally now, a Spiritual Communion is optional. Finish with the Sign of the Cross.','Avant de partir, renouvelez votre amour de Dieu. Si vous ne pouvez pas communier sacramentellement maintenant, une communion spirituelle est facultative. Terminez par le signe de la Croix.'),prayers:[{id:'foundations_act_of_love'},{id:'adoration_spiritual_communion',kicker:L('Optional','Facultatif')},{id:'foundations_sign_of_cross'}],silence:''}
]}
function holySteps(){return [
 {title:L('Gethsemane','Gethsémani'),now:L('Read Matthew 26:36–46 slowly. Notice Christ’s sorrow, His request that the disciples watch, and His obedience to the Father.','Lisez lentement Matthieu 26, 36–46. Remarquez la tristesse du Christ, sa demande aux disciples de veiller et son obéissance au Père.'),prayers:[{id:'foundations_act_of_faith'}],silence:L('Remain with one phrase or image from the passage before moving on.','Demeurez avec une phrase ou une image du passage avant de poursuivre.')},
 {title:L('Adoration','Adoration'),now:L('Adore Christ for who He is before asking for anything. Let worship come before usefulness.','Adorez le Christ pour ce qu’Il est avant de demander quoi que ce soit. Que l’adoration précède l’utilité.'),prayers:[{id:'foundations_prayer_of_adoration'},{id:'foundations_glory_be'}],silence:L('Stay with the simple act of adoration.','Demeurez dans ce simple acte d’adoration.')},
 {title:L('Watch with Christ','Veiller avec le Christ'),now:L('Set aside words for a while. Stay with Christ in Gethsemane; when distracted, return to the scene rather than beginning another devotion.','Mettez les paroles de côté un moment. Demeurez avec le Christ à Gethsémani ; en cas de distraction, revenez à la scène plutôt que de commencer une autre dévotion.'),prayers:[],silence:L('This stage is intentionally mostly silent.','Cette étape est volontairement surtout silencieuse.')},
 {title:L('Reparation','Réparation'),now:L('Bring your own sins first, then the sins and indifference of the world, without turning the prayer into judgment of others.','Présentez d’abord vos propres péchés, puis les péchés et l’indifférence du monde, sans transformer la prière en jugement des autres.'),prayers:[{id:'sacrament_act_of_contrition'}],silence:L('If you want the longer traditional Act of Reparation, open it below.','Si vous souhaitez l’Acte de réparation traditionnel plus long, ouvrez-le ci-dessous.'),extra:`<button type="button" class="aoP435930Secondary" data-p435930-open-prayer="sacred_heart_short_prayer">${esc(L('Open Act of Reparation','Ouvrir l’Acte de réparation'))}</button>`},
 {title:L('Intercession','Intercession'),now:L('Intercede for those far from God, the dying, the suffering, your family, and those who have asked your prayers. Then pray the Our Father.','Intercédez pour ceux qui sont loin de Dieu, les mourants, ceux qui souffrent, votre famille et ceux qui ont demandé vos prières. Puis récitez le Notre Père.'),prayers:[{id:'foundations_our_father'}],silence:L('Pause after the intentions that carry real weight for you.','Faites une pause après les intentions qui ont un poids réel pour vous.')},
 {title:L('Surrender','Abandon'),now:L('Place one fear, duty or suffering before God and accept His will without pretending the difficulty is unreal.','Présentez à Dieu une crainte, un devoir ou une souffrance et acceptez sa volonté sans prétendre que la difficulté est irréelle.'),prayers:[{id:'foundations_act_of_hope'}],silence:L('Do not force an emotion of peace. Simply remain available to God.','Ne forcez pas un sentiment de paix. Demeurez simplement disponible à Dieu.')},
 {title:L('Optional Agony decade','Dizaine de l’Agonie facultative'),now:L('If it helps you remain with Gethsemane, pray the first Sorrowful Mystery. This is optional and remains part of the Rosary, not a required Holy Hour element.','Si cela vous aide à demeurer à Gethsémani, priez le premier Mystère douloureux. Cela est facultatif et reste une partie du Rosaire, non un élément obligatoire de l’Heure Sainte.'),prayers:[],silence:'',extra:`<button type="button" class="aoP435930Primary" data-p435930-go-rosary>${esc(L('Open Rosary','Ouvrir le Rosaire'))}</button>`},
 {title:L('Final silence','Silence final'),now:L('Put the phone down and finish in silence. When you are ready to leave, make an Act of Love.','Posez le téléphone et terminez dans le silence. Lorsque vous êtes prêt à partir, faites un acte d’amour.'),prayers:[{id:'foundations_act_of_love'}],silence:L('Leave without rushing immediately into another stream of information.','Partez sans vous précipiter immédiatement dans un autre flux d’informations.')}
]}
function fourSteps(){return [
 {title:L('Adoration','Adoration'),now:L('Begin with God Himself. Adore Him for who He is, not first for what He gives you.','Commencez par Dieu Lui-même. Adorez-Le pour ce qu’Il est, non d’abord pour ce qu’Il vous donne.'),prayers:[{id:'foundations_prayer_of_adoration'}],silence:L('Remain briefly in simple worship.','Demeurez brièvement dans une adoration simple.')},
 {title:L('Thanksgiving','Action de grâces'),now:L('Give thanks for creation, redemption, the Eucharist and particular graces. Name concrete gifts rather than speaking only in generalities.','Rendez grâce pour la création, la rédemption, l’Eucharistie et les grâces particulières. Nommez des dons concrets plutôt que de rester dans les généralités.'),prayers:[{id:'foundations_glory_be',kicker:L('Optional doxology','Doxologie facultative')}],silence:L('Let gratitude become specific.','Que votre gratitude devienne concrète.')},
 {title:L('Reparation','Réparation'),now:L('Acknowledge sin beginning with your own need for mercy, then offer reparation for offences against God.','Reconnaissez le péché en commençant par votre propre besoin de miséricorde, puis offrez réparation pour les offenses faites à Dieu.'),prayers:[{id:'sacrament_act_of_contrition'}],silence:L('A longer traditional Act of Reparation is available if useful.','Un Acte de réparation traditionnel plus long est disponible si cela vous aide.'),extra:''},
 {title:L('Petition','Demande'),now:L('Present the needs of the Church, others and yourself. Keep the order broad enough that prayer does not become only self-concern.','Présentez les besoins de l’Église, des autres et les vôtres. Gardez un ordre assez large pour que la prière ne devienne pas seulement préoccupée de soi.'),prayers:[{id:'foundations_our_father'}],silence:L('After asking, leave the intentions with God.','Après avoir demandé, laissez les intentions à Dieu.')},
 {title:L('Return to silence','Revenir au silence'),now:L('The method is finished. Stop adding material and return to silent adoration.','La méthode est terminée. Cessez d’ajouter du contenu et revenez à l’adoration silencieuse.'),prayers:[],silence:L('Remain as long as is appropriate; there is no completion score.','Demeurez aussi longtemps qu’il convient ; il n’y a aucun score d’accomplissement.')}
]}
function enterAdorationQuiet(){
 const m=mount();
 const card=m?.querySelector('.aoP435930AdorationReader .aoDevoCardScroll');
 adorationQuietReturn={
  mode:ADOR.mode,visitStep:ADOR.visitStep,holyStep:ADOR.holyStep,fourStep:ADOR.fourStep,
  mountScroll:m?.scrollTop||0,cardScroll:card?.scrollTop||0
 };
 stopTimer();ADOR.quiet=true;render();
}
function exitAdorationQuiet(){
 ADOR.quiet=false;
 const resume=adorationQuietReturn;adorationQuietReturn=null;
 render();
 if(!resume)return;
 queueMicrotask(()=>{
  if(view!=='adoration'||ADOR.quiet||ADOR.mode!==resume.mode)return;
  const m=mount();if(!m)return;
  m.scrollTop=resume.mountScroll;
  const card=m.querySelector('.aoP435930AdorationReader .aoDevoCardScroll');
  if(card){
   // The shared reader creates the focus runway in a later animation frame.
   // Establish that same runway synchronously before restoring this scroll.
   const paragraphs=[...card.querySelectorAll('.aoP435930GuideNow p,.aoP435930GuideCue p,.aoP435930Prayer .aoP435930Flip,.aoP435930Prayer .aoP435930Text')];
   ensureDevotionalReadingRunway(card,paragraphs,{ratio:.40});
   card.dataset.aoFocusRunway='1';
   card.scrollTop=resume.cardScroll;
   // Guard against a later font/layout pass without changing the stage.
   requestAnimationFrame(()=>{
    if(view==='adoration'&&!ADOR.quiet&&ADOR.mode===resume.mode&&card.isConnected){
     m.scrollTop=resume.mountScroll;
     card.scrollTop=resume.cardScroll;
    }
   });
  }
  m.querySelector('.aoAdorationQuietLink,.aoAdorationQuietEnter')?.focus?.({preventScroll:true});
 });
}
function adorationFourOptionalMarkup(purpose){
 const ids=ADORATION_FOUR_OPTIONAL_SOURCE_IDS[purpose]||[];
 const eligible=ids.filter(id=>!!P(id)?.[lang()]&&!!P(id)?.provenance?.url);
 if(!eligible.length)return "";
 const chosen=adorationFourChoices()[purpose];
 const selected=adorationFourOptionFor(purpose,chosen)&&eligible.includes(chosen)?chosen:null;
 const label=L("Additional complete prayer (optional)","Prière intégrale complémentaire (facultative)");
 const button=(id,title,active)=>'<button type="button" data-p435930-four-choice="'+esc(purpose+":"+id)+'" aria-pressed="'+String(active)+'">'+esc(title)+'</button>';
 const selections=button("none",L("None","Aucune"),!selected)+eligible.map(id=>{
  const name=ADORATION_FOUR_SOURCE_LABELS[id];return button(id,L(name.en,name.fr),selected===id);
 }).join("");
 const reading=selected?'<div class="aoFourPurposeReading" data-ao-four-source="'+esc(selected)+'">'+
  prayerBlock(selected,{kicker:L("Separate optional devotion","Dévotion distincte facultative")})+'</div>':"";
 return '<section class="aoFourPurposeOption" data-ao-four-purpose="'+esc(purpose)+'" aria-label="'+esc(label)+'">'+
  '<small class="aoFourPurposeCaption">'+esc(label)+'</small>'+
  '<div class="aoFourPurposeChoices" role="group" aria-label="'+esc(label)+'">'+selections+'</div>'+
  reading+'</section>';
}
function guidedStage(kind,steps,index,lastLabel){
 const st=steps[index]||steps[0];
 // The original stage/prayer arrays remain canonical; only the visual
 // presentation is shared with the other dual-axis devotional readers.
 return `<section class="aoDevoCard" data-ao-devo-card="${kind}-${index}">
 <header class="aoDevoCardHead"><small class="aoDevoCardNumber">${index+1} / ${steps.length}</small><h2 class="aoDevoCardTitle">${esc(st.title)}</h2></header>
 <div class="aoDevoCardScroll" role="region" tabindex="0" aria-label="${esc(st.title)}">
 ${guideNow(st.title,st.now)}${guidePrayers(st.prayers)}${kind==='four'?adorationFourOptionalMarkup(['adoration','thanksgiving','reparation','petition'][index]):''}${guideCue(L('SILENCE / NOTICE','SILENCE / ATTENTION'),st.silence)}${st.extra||''}<button type="button" class="${st.prayers.length===0?'aoAdorationQuietEnter':'aoAdorationQuietLink'}" data-p435930-ador-quiet-enter>${esc(st.prayers.length===0?L('Remain in silence','Demeurer en silence'):L('Pause in silence','Faire une pause en silence'))}</button>
 </div></section>${guideNav(kind,index,steps.length,lastLabel)}`
}
function batch02SourceLinks(destination){
 const items=instituteOptionalFor(destination);
 return `<details class="aoP435930PrayerOptions aoBatch02OptionalSources"><summary>${esc(L('Institute prayer alternatives · source links','Prières complémentaires de l’Institut · sources'))}</summary><p>${esc(L('These are optional related prayers or locally used chants, not obligatory parts of the rite. Source-specific modern wording is linked until reuse and recension have been independently certified.','Prières connexes et chants employés localement, non parties obligatoires du rite. Les textes modernes propres à la source sont liés jusqu’à certification indépendante des versions et droits de réutilisation.'))}</p><div class="aoP435930LibraryMini">${items.map(x=>`<a href="${esc(x.source)}" target="_blank" rel="noopener noreferrer"><b>${esc(isFr()?x.titleFr:x.titleEn)}</b> <small>${esc(x.category)} · ${esc(x.language)} ↗</small></a>`).join('')}</div></details>`;
}
function eucharisticWitnessTreasury(){
 const tantum=P("benediction_tantum_ergo");
 const cards=EUCHARISTIC_WITNESS_IDS.map(id=>{
  const rec=getEucharisticWitness(id,{tantum});
  const role=rec.category==="corpus-christi-mass-sequence"?L("Corpus Christi Mass sequence","Séquence de la messe de la Fête-Dieu"):rec.category==="corpus-christi-office-antiphon"?L("Corpus Christi Vespers antiphon","Antienne des vêpres de la Fête-Dieu"):L("Full Eucharistic hymn · concluding stanzas are Tantum Ergo","Hymne eucharistique complet · les dernières strophes sont Tantum Ergo");
  return `<details class="aoP435930PrayerOptions aoEucharisticWitness" data-ao-eucharistic-witness="${esc(rec.id)}"><summary>${esc(rec.titleLa)}</summary><p><small>${esc(role)}. ${esc(L("Original Latin; modern English/French translations are not supplied without reuse verification.","Latin original ; les traductions modernes anglaises ou françaises ne sont pas reproduites sans vérification des droits."))}</small></p><div class="aoP435930Text" lang="la">${nl(rec.la)}</div><p><a href="${esc(rec.source)}" target="_blank" rel="noopener noreferrer">${esc(L("ICRSP Corpus Christi · original source","ICRSP Fête-Dieu · source originale"))} ↗</a></p></details>`;
 }).join("");
 return `<section data-ao-eucharistic-treasury="latin-source"><h3>${esc(L('Historical Eucharistic texts','Textes eucharistiques historiques'))}</h3><p>${esc(L('The Eucharistic Pange lingua is not the Passiontide hymn with a similar title. Lauda Sion is a Mass sequence; O sacrum convivium is an Office antiphon. Neither is imposed on silent adoration or Benediction.','Le Pange lingua eucharistique n’est pas l’hymne du Temps de la Passion du même nom. Lauda Sion est une séquence de messe ; O sacrum convivium est une antienne de l’Office. Aucun n’est imposé à l’adoration silencieuse ni à la Bénédiction.'))}</p>${cards}</section>`;
}
function renderAdoration(){
 if(ADOR.mode==='home')return `${head(L('Adoration & Visit','Adoration et visite'),L('Enter prayer without a prescribed duration','Entrer en prière sans durée imposée'))}
  <main class="aoP435930Body aoAdorationChooser" data-ao-adoration-chooser="quiet-v2">
   <p class="aoAdorationChooserIntroduction">${esc(L('Choose the form suited to where you are.','Choisissez la forme adaptée au lieu où vous vous trouvez.'))}</p>
   <div class="aoAdorationPrimaryGrid">
    <button type="button" data-p435930-ador-mode="visit">
     <small>${esc(L('AT THE TABERNACLE','DEVANT LE TABERNACLE'))}</small>
     <b>${esc(L('Visit to the Blessed Sacrament','Visite au Saint-Sacrement'))}</b>
     <span>${esc(L('A simple path for prayer before the reserved Sacrament.','Un chemin simple de prière devant le Saint-Sacrement réservé.'))}</span>
    </button>
    <button type="button" data-p435930-ador-mode="open">
     <small>${esc(L('IN STILLNESS','DANS LE SILENCE'))}</small>
     <b>${esc(L('Silent Adoration','Adoration silencieuse'))}</b>
     <span>${esc(L('Be still. Prayers and guidance are available only when wanted.','Demeurez en silence. Prières et aide restent facultatives.'))}</span>
    </button>
   </div>
   <details class="aoAdorationMethodsDisclosure" data-ao-adoration-methods>
    <summary>${esc(L('Guided forms and Eucharistic prayers','Formes guidées et prières eucharistiques'))}</summary>
    <div class="aoP435930BigGrid">
     <button type="button" data-p435930-ador-mode="holy">
      <b>${esc(L('Guided Holy Hour','Heure Sainte guidée'))}</b>
      <span>${esc(L('Meditation centred on Gethsemane, without enforced timing.','Méditation centrée sur Gethsémani, sans minutage imposé.'))}</span>
     </button>
     <button type="button" data-p435930-ador-mode="four">
      <b>${esc(L('The Four Ends','Les quatre fins'))}</b>
      <span>${esc(L('Adoration, thanksgiving, reparation and petition.','Adoration, action de grâces, réparation et demande.'))}</span>
     </button>
     <button type="button" data-p435930-ador-mode="treasury">
      <b>${esc(L('Eucharistic Treasury','Trésor eucharistique'))}</b>
      <span>${esc(L('Traditional Eucharistic prayers, available directly.','Prières eucharistiques traditionnelles, en accès direct.'))}</span>
     </button>
    </div>
   </details>
   <p class="aoAdorationChooserAfterword">${esc(L('If a public liturgical rite begins, follow the rite rather than a private guide.','Si un rite liturgique public commence, suivez le rite plutôt qu’un guide privé.'))}</p>
   ${adorationReturnFromBenediction?`<button type="button" class="aoP435930Secondary aoAdorationPublicRiteLink" data-p435930-go-ben>
     ${esc(L('Return to public Benediction','Revenir à la bénédiction eucharistique'))}
     <small>${esc(L('Includes optional Christ the King procession and prayers','Avec procession et prières facultatives du Christ-Roi'))}</small>
   </button>`:''}
  </main>`;
 if(ADOR.quiet)return `${head(L('Silent Adoration','Adoration silencieuse'),L('No prescribed duration','Sans durée imposée'))}
 <main class="aoP435930Body aoP435930AdorationReader aoAdorationQuietScreen" role="dialog" aria-modal="true" aria-labelledby="aoAdorationQuietTitle" data-ao-adoration-folio="v1" data-ao-adoration-mode="${esc(ADOR.mode)}" data-ao-adoration-quiet="true">
 <small>${esc(L('IN SILENCE','EN SILENCE'))}</small>
 <h2 id="aoAdorationQuietTitle">${esc(L('Remain before Christ','Demeurez devant le Christ'))}</h2>
 <p>${esc(L('No steps to complete. Set the phone aside and remain in prayer.','Aucune étape à accomplir. Posez le téléphone et demeurez en prière.'))}</p>
 <button type="button" class="aoAdorationQuietExit" data-p435930-ador-quiet-exit>${esc(L('Return to prayer','Revenir à la prière'))}</button></main>`;
 let content='';
 if(ADOR.mode==='visit'){
  const steps=visitSteps();content=`${guidedStage('visit',steps,ADOR.visitStep,L('Finish visit','Terminer la visite'))}<details class="aoAdorationVisitNote"><summary>${esc(L('About a visit to the reserved Sacrament','À propos d’une visite au Saint-Sacrement réservé'))}</summary><p>${esc(L('A Visit does not require exposition. This guide offers a path for prayer without turning the visit into a checklist.','Une visite ne requiert pas l’exposition. Ce guide propose un chemin de prière sans transformer la visite en liste à cocher.'))}</p></details>`;
 }
 if(ADOR.mode==='open')content=`<section class="aoAdorationOpenPrayer"><span class="aoAdorationStillSymbol" aria-hidden="true"></span>${adorationPresence()==='exposed'?callout(`<b>${esc(L('Public rite has priority.','Le rite public a priorité.'))}</b> ${esc(L('If Benediction begins, stop the private structure and follow the actual service.','Si la Bénédiction commence, arrêtez la structure privée et suivez l’office réel.'))} <button type="button" data-p435930-go-ben>${esc(L('Follow Benediction','Suivre la Bénédiction'))}</button>`,'rubric'):''}${guideNow(L('Be still','Rester en silence'),L('Silence is the default. You do not need to complete a sequence. Remain with Christ for as long as is appropriate.','Le silence est le point de départ. Vous n’avez pas besoin d’accomplir une séquence. Demeurez avec le Christ aussi longtemps qu’il convient.'))}<button type="button" class="aoAdorationQuietEnter" data-p435930-ador-quiet-enter>${esc(L('Enter silence','Entrer en silence'))}</button></section><details class="aoAdorationOptionDisclosure"><summary>${esc(L('Optional prayers and guided forms','Prières et formes guidées facultatives'))}</summary><div class="aoP435930GuideChoices"><button type="button" class="aoP435930Primary" data-p435930-ador-mode="holy">${esc(L('Guided Holy Hour','Heure Sainte guidée'))}</button><button type="button" class="aoP435930Primary" data-p435930-ador-four>${esc(L('Guide me with the Four Ends','Me guider avec les quatre fins'))}</button><button type="button" class="aoP435930Secondary" data-p435930-open-prayer="foundations_prayer_of_adoration">${esc(L('Open a short act of adoration','Ouvrir un court acte d’adoration'))}</button><button type="button" class="aoP435930Secondary" data-p435930-open-prayer="adoration_spiritual_communion">${esc(L('Spiritual Communion','Communion spirituelle'))}</button></div></details><details class="aoAdorationOptionDisclosure" data-ao-adoration-presence><summary>${esc(L('Presence and public rite','Présence et rite public'))}</summary>${presenceBar()}</details>${adorationTimerDisclosure()}`;
 if(ADOR.mode==='holy'){
  const steps=holySteps();content=`${presenceBar()}${guidedStage('holy',steps,ADOR.holyStep,L('Finish Holy Hour','Terminer l’Heure Sainte'))}${adorationPresence()==='exposed'?callout(`<b>${esc(L('Public rite has priority.','Le rite public a priorité.'))}</b> <button type="button" data-p435930-go-ben>${esc(L('Follow Benediction if it begins','Suivre la Bénédiction si elle commence'))}</button>`,'rubric'):''}${adorationTimerDisclosure()}`;
 }
 if(ADOR.mode==='four'){
  const steps=fourSteps();content=`${presenceBar()}${guidedStage('four',steps,ADOR.fourStep,L('Return to silent adoration','Revenir à l’adoration silencieuse'))}${callout(esc(L('The Four Ends are a method for structuring prayer, not four tasks that earn completion.','Les quatre fins sont une méthode pour structurer la prière, non quatre tâches qui donnent un accomplissement.')),'rubric')}`;
 }
 if(ADOR.mode==='treasury')content=`<div class="aoP435930LibraryMini">${['foundations_prayer_of_adoration','adoration_anima_christi','adoration_spiritual_communion','adoration_lord_i_am_not_worthy','benediction_o_salutaris','benediction_tantum_ergo','adoration_litany_blessed_sacrament'].map(id=>{const p=P(id);return p?`<button data-p435930-open-prayer="${id}"><b>${esc(isFr()?(p.titleFr||p.title):p.title)}</b><span>${esc(['en','fr','la'].filter(k=>p[k]).map(k=>k.toUpperCase()).join(' · '))}</span></button>`:''}).join('')}</div>`+eucharisticWitnessTreasury()+batch02SourceLinks('adoration-optional');
 const isGuided=['visit','holy','four'].includes(ADOR.mode);
 const stage=isGuided?(ADOR.mode==='visit'?ADOR.visitStep:ADOR.mode==='holy'?ADOR.holyStep:ADOR.fourStep):-1;
 return `${head(L('Adoration & Visit','Adoration et visite'),ADOR.mode==='visit'?L('Guided Visit','Visite guidée'):ADOR.mode==='open'?L('Open-ended Adoration','Adoration libre'):ADOR.mode==='holy'?L('Guided Holy Hour','Heure Sainte guidée'):ADOR.mode==='four'?L('Four Ends method','Méthode des quatre fins'):L('Eucharistic Treasury','Trésor eucharistique'))}<main class="aoP435930Body aoP435930AdorationReader" data-ao-adoration-folio="v1" data-ao-adoration-mode="${esc(ADOR.mode)}" data-ao-adoration-step="${stage}"><button class="aoP435930InlineBack" data-p435930-ador-home>${assetIcon('ao-ui-back')} ${esc(L('Choose another mode','Choisir un autre mode'))}</button>${content}${devotionalGuide('adoration')} </main>`;
}
function familyOf(p){if(['litany_loreto_1962','litany_loreto_current'].includes(p.id))return'litany_loreto';if(['foundations_eternal_rest','dead_eternal_rest_singular'].includes(p.id))return'eternal_rest';return p.id}
let LIB={q:'',cat:'all',open:null,language:null};
function normalizedSource(p){const pr=p.provenance||{},ed=prayEditionWitness(p.id);return {id:p.id,family:familyOf(p),work:pr.work||p.title||p.id,witness:ed?.label.en||pr.witness||p.source||'Normalized existing corpus',url:praySourceURL(p),quality:ed?.witnessType||pr.quality||p.sourceStatus||'LEGACY_SOURCE_DOCUMENTED_NOT_PRIMARY_COLLATED',adaptation:pr.adaptation||'UNSPECIFIED',languages:pr.languages||Object.fromEntries(['en','fr','la'].filter(k=>p[k]).map(k=>[k,'AVAILABLE']))}}
const SOURCE_REGISTRY=Object.freeze(Object.fromEntries(Object.values(DATA.prayers||{}).map(p=>[p.id,Object.freeze(normalizedSource(p))])));
function libraryOverviewGuide(){
 return `<details class="aoP435930GuideInfo" data-ao-prayer-library-guide="overview"><summary>${esc(L('Guide · find and use a prayer','Guide · trouver et prier un texte'))}</summary>
  <div><p>${esc(L('Search by name or text, or choose a category. Open the prayer itself instead of working through a compulsory list.','Recherchez un nom ou un texte, ou choisissez une catégorie. Ouvrez la prière sans devoir parcourir une liste obligatoire.'))}</p>
  <p>${esc(L('Use the Latin switch where both texts exist. Open Source / provenance to examine the actual witness and any documented version differences. For a guided devotion, use its dedicated companion.','Utilisez le changement vers le latin lorsque les deux textes existent. Ouvrez « Source / provenance » pour consulter le témoin et les variantes documentées. Pour une dévotion guidée, utilisez son compagnon dédié.'))}</p></div></details>`;
}
function libraryContextMarkup(p){
 const g=libraryGuideForPrayer(p,{french:isFr()});
 if(!g)return '';
 const category=isFr()?(DATA.categories?.[g.category]?.fr||g.category):(DATA.categories?.[g.category]?.en||g.category);
 return `<details class="aoP435930GuideInfo" data-ao-prayer-library-guide="${esc(g.id)}"><summary>${esc(L('Guide · meaning and practice','Guide · sens et pratique'))}</summary>
  <div><p><b>${esc(category)}</b> — ${esc(g.context)}</p><p>${esc(g.practice)}</p>${g.versionNote?`<p>${esc(g.versionNote)}</p>`:''}
  <p>${esc(L('Textual attribution and its source link are in the Source / provenance disclosure above.','L’attribution du texte et son lien de source figurent dans la section « Source / provenance » ci-dessus.'))}</p></div></details>`;
}
function renderLibrary(){
 if(LIB.open){
  const p=P(LIB.open);if(!p){LIB.open=null;return renderLibrary()}
  const missing=['en','fr','la'].filter(k=>!p[k]),hasUi=!!p[lang()];
  const missingUi=!hasUi?callout(`${esc(L('No vernacular translation is available in the current UI language.','Aucune traduction vernaculaire n’est disponible dans la langue actuelle de l’interface.'))} ${esc(L('The available source text is shown without fabricating a substitute.','Le texte source disponible est affiché sans fabriquer de traduction de substitution.'))}`,'rubric'):'';
  const category=isFr()?(DATA.categories?.[p.category]?.fr||p.category):(DATA.categories?.[p.category]?.en||p.category),langs=['en','fr','la'].filter(k=>p[k]).map(k=>k.toUpperCase()).join(' · ');
  return `${head(isFr()?(p.titleFr||p.title):p.title,L('Prayer Library','Livre de prières'))}<main class="aoP435930Body aoP435930LibraryReader" data-ao-library-card="single"><button class="aoP435930InlineBack" data-p435930-lib-back>${assetIcon('ao-ui-back')} ${esc(L('Prayer Library','Livre de prières'))}</button>${missingUi}<section class="aoDevoCard" data-ao-devo-card="${esc(LIB.open)}"><div class="aoDevoCardScroll" role="region" aria-label="${esc(isFr()?(p.titleFr||p.title):p.title)}">${prayerBlock(LIB.open,{scriptureContext:true})}</div></section>${libraryContextMarkup(p)}<div class="aoP435930Meta"><span>${esc(L('Category','Catégorie'))}: <b>${esc(category)}</b></span><span>${esc(L('Languages','Langues'))}: <b>${esc(langs||L('Source language only','Langue source seulement'))}</b></span>${missing.length?`<span>${esc(L('Not available','Non disponible'))}: <b>${missing.map(x=>x.toUpperCase()).join(' · ')}</b></span>`:''}</div></main>`
 }
 const q=LIB.q.trim().toLowerCase();let rows=Object.values(DATA.prayers||{}).filter(p=>LIB.cat==='all'||p.category===LIB.cat);if(q)rows=rows.filter(p=>[p.title,p.titleFr,p.en,p.fr,p.la,p.id].join(' ').toLowerCase().includes(q));
 const cats=[['all',L('All','Toutes')],...Object.entries(DATA.categories||{}).map(([id,v])=>[id,isFr()?v.fr:v.en])];
 return `${head(L('Prayer Library','Livre de prières'),`${Object.keys(DATA.prayers||{}).length} ${L('prayers','prières')}`)}<main class="aoP435930Body">${libraryOverviewGuide()}<label class="aoP435930Search"><span>${assetIcon('ao-ui-search')}</span><input type="search" data-p435930-lib-search value="${esc(LIB.q)}" placeholder="${esc(L('Search prayers','Rechercher une prière'))}"></label><div class="aoP435930Chips">${cats.map(([id,n])=>`<button type="button" class="${id===LIB.cat?'active':''}" data-p435930-lib-cat="${esc(id)}">${esc(n)}</button>`).join('')}</div><div class="aoP435930LibraryList">${rows.map(p=>{const langs=['en','fr','la'].filter(k=>p[k]).map(k=>k.toUpperCase()).join(' · ');return `<button type="button" data-p435930-lib-open="${esc(p.id)}"><small>${esc(isFr()?(DATA.categories?.[p.category]?.fr||p.category):(DATA.categories?.[p.category]?.en||p.category))}</small><b>${esc(isFr()?(p.titleFr||p.title):p.title)}</b><span>${esc(langs)}</span></button>`}).join('')||`<p>${esc(L('No prayers match this search.','Aucune prière ne correspond à cette recherche.'))}</p>`}</div></main>`;
}
function monthIndex(key){const d=dateObj(key);return d?d.getFullYear()*12+d.getMonth():null}
function consecutive(records,needed){const done=records.filter(x=>x.complete).sort((a,b)=>a.date.localeCompare(b.date));if(!done.length)return 0;let c=1;for(let i=done.length-1;i>0;i--){const a=monthIndex(done[i].date),b=monthIndex(done[i-1].date);if(a-b===1)c++;else break}return Math.min(c,needed)}
function history(records,label){return `<div class="aoP435930History"><h3>${esc(label)}</h3>${records.length?records.slice().reverse().map(r=>`<div><span>${esc(fmtDate(r.date))}</span><b class="${r.complete?'ok':'partial'}">${esc(r.complete?L('Reported complete','Déclaré accompli'):L('Incomplete / interrupted','Incomplet / interrompu'))}</b>${r.confessionDate?`<small>${esc(L('Confession','Confession'))}: ${esc(fmtDate(r.confessionDate))}</small>`:''}</div>`).join(''):`<p>${esc(L('No reports yet.','Aucune déclaration pour le moment.'))}</p>`}</div>`}
function upsert(arr,rec){const i=arr.findIndex(x=>x.date===rec.date);if(i>=0)arr[i]=rec;else arr.push(rec);arr.sort((a,b)=>a.date.localeCompare(b.date));while(arr.length>36)arr.shift()}
function handoff(id){const resume=captureResume();externalResume=resume;close({silent:true,preserve:true});return BASE?.open?.(id,{returnContext:PRAY_CTX,returnPrayerSnapshot:resume})}
function devotionalMonthRegisterMarkup(kind,records,tracking,selectedDate){
 const saturday=kind==="saturday",needed=saturday?5:9;
 const report=monthlyDevotionalRegister(tracking?records:[],{needed,selectedDate});
 const format=new Intl.DateTimeFormat(isFr()?'fr-FR':'en-GB',{month:'short',year:'numeric',timeZone:'UTC'});
 const fullFormat=new Intl.DateTimeFormat(isFr()?'fr-FR':'en-GB',{month:'long',year:'numeric',timeZone:'UTC'});
 const statusLabel=status=>status==='recorded'?L('Self-reported complete','Déclaré accompli'):status==='incomplete'?L('Self-reported incomplete','Déclaré incomplet'):L('Not recorded','Non enregistré');
 const cells=report.cells.map(c=>{
  const d=new Date(Date.UTC(c.year,Number(c.key.slice(5))-1,1));
  const name=fullFormat.format(d),short=format.format(d);
  const status=tracking?c.status:'unrecorded';
  return `<div class="aoQuietMonthCell" data-status="${status}" data-month="${c.key}" aria-label="${esc(name+' · '+statusLabel(status))}"><span aria-hidden="true"></span><abbr title="${esc(name+' · '+statusLabel(status))}">${esc(short)}</abbr></div>`;
 }).join('');
 const details=!tracking
  ?L('Private recording is optional. No devotional acts are inferred.','Le suivi privé est facultatif. Aucun acte dévotionnel n’est déduit.')
  :report.interrupted
  ?L('The latest entry was reported incomplete. Earlier reports remain in your history.','La dernière entrée est déclarée incomplète. Les déclarations antérieures restent dans l’historique.')
  :report.streak
  ?L('Consecutive months explicitly reported: ','Mois consécutifs explicitement déclarés : ')+report.streak+L(' of ',' sur ')+needed+'.'
  :L('No consecutive completed months recorded in this series.','Aucune suite de mois consécutifs accomplis n’est enregistrée.');
 const title=saturday?L('The five-month register','Le registre des cinq mois'):L('The nine-month register','Le registre des neuf mois');
 return `<section class="aoQuietMonthRegister" data-ao-month-kind="${kind}" data-ao-month-streak="${tracking?report.streak:0}" data-ao-month-tracking="${tracking}" aria-label="${esc(title)}">
  <div class="aoQuietMonthTitle"><span>${esc(title)}</span><small>${esc(L('Private record','Suivi privé'))}</small></div>
  <div class="aoQuietMonthGrid" aria-label="${esc(L('Monthly participation, as reported by you','Participation mensuelle déclarée par vous-même'))}">${cells}</div>
  <p class="aoQuietMonthNote">${esc(details)} ${esc(L('An unrecorded month is not automatically a missed devotion.','Un mois non enregistré ne signifie pas automatiquement une dévotion manquée.'))}</p>
 </section>`;
}
function devotionalMonthSummary(kind,records,tracking,selectedDate){
 const saturday=kind==="saturday",needed=saturday?5:9;
 const report=monthlyDevotionalRegister(tracking?records:[],{needed,selectedDate});
 const title=saturday?L('First Saturdays · month record','Premiers samedis · suivi mensuel'):L('First Fridays · month record','Premiers vendredis · suivi mensuel');
 const count=tracking?report.streak+' / '+needed:L('Optional','Facultatif');
 const cells=tracking?report.cells.map(c=>`<i class="aoQuietSeriesPip" data-status="${c.status}"></i>`).join(''):'';
 const tracker=saturday?'fs':'ff';
 return `<details class="aoQuietSeriesDisclosure" data-ao-series-kind="${kind}">
  <summary aria-label="${esc(title+' · '+count)}">
   <span class="aoQuietSeriesHeading">${esc(title)}</span>
   <span class="aoQuietSeriesPips" aria-hidden="true">${cells}</span>
   <span class="aoQuietSeriesCount">${esc(count)}</span>
   <span class="aoQuietSeriesChevron" aria-hidden="true">⌄</span>
  </summary>
  <div class="aoQuietSeriesExpanded">
   <label class="aoP435930TrackingToggle">
    <input type="checkbox" data-p435930-${tracker}-tracking ${tracking?'checked':''}>
    <span><b>${esc(L('Keep a private month-by-month record','Conserver un suivi privé mois par mois'))}</b>
     <small>${esc(L('Optional · the guide works without tracking','Facultatif · le guide fonctionne sans suivi'))}</small></span>
   </label>
   ${tracking?devotionalMonthRegisterMarkup(kind,records,tracking,selectedDate):
      `<p class="aoQuietSeriesOffNote">${esc(L('Nothing is recorded unless you choose to report each month.','Aucun mois n’est enregistré sans votre déclaration explicite.'))}</p>`}
  </div>
 </details>`;
}
function programmeRail(kind,step,items){
 // The canonical FF/FS stage is the only cursor. Do not equate position with
 // a recorded First Friday/Saturday, or invent an independent progress owner.
 return `<div class="aoP435930ProgrammeNavShell"><nav class="aoP435930StageRail aoP435930ProgrammeRail" aria-label="${esc(L('Devotional stages','Étapes de la dévotion'))}">${items.map((x,i)=>`<button type="button" class="${i===step?'active':''}" ${i===step?'aria-current="step"':''} data-p435930-${kind}-stage="${i}"><span>${i+1}</span><b>${esc(L(x[0],x[1]))}</b></button>`).join('')}</nav>${devotionalProgressMarkup({index:step,total:items.length,language:lang(),unit:'stage'})}</div>`
}
function programmeNav(kind,step,total,lastLabel){
 // Stages are selected with the rail, horizontal swipe or keyboard arrows.
 // Only the explicit final return is a button; record/save actions stay separate.
 if(step!==total-1)return '';
 return `<div class="aoP435930GuideNav aoP435930ProgrammeExit"><button type="button" class="aoP435930Primary" data-p435930-program-home>${esc(lastLabel||L('Done · back to PRAY','Terminé · retour à PRIER'))}</button></div>`;
}
function programmeSummary(rows){return `<div class="aoP435930ProgrammeSummary">${rows.map(r=>`<div class="${r[1]?'done':''}"><span>${r[1]?'✓':'○'}</span><b>${esc(r[0])}</b>${r[2]?`<small>${esc(r[2])}</small>`:''}</div>`).join('')}</div>`}
const FF_STAGES=[['Intention','Intention'],['Prepare','Préparer'],['Mass & Communion','Messe & Communion'],['Reparation','Réparation'],['Finish','Terminer']];
const FS_STAGES=[['Intention','Intention'],['Confession','Confession'],['Mass & Communion','Messe & Communion'],['Rosary','Rosaire'],['15-minute meditation','Méditation de 15 min'],['Finish','Terminer']];
const FS_MYSTERIES={
 joyful:{en:'Joyful Mysteries',fr:'Mystères joyeux',items:{en:['The Annunciation','The Visitation','The Nativity','The Presentation','The Finding of Jesus in the Temple'],fr:["L’Annonciation","La Visitation","La Nativité","La Présentation de Jésus au Temple","Le Recouvrement de Jésus au Temple"]}},
 sorrowful:{en:'Sorrowful Mysteries',fr:'Mystères douloureux',items:{en:['The Agony in the Garden','The Scourging at the Pillar','The Crowning with Thorns','The Carrying of the Cross','The Crucifixion and Death of Our Lord'],fr:["L’Agonie de Jésus au jardin des Oliviers","La Flagellation","Le Couronnement d’épines","Le Portement de la Croix","La Crucifixion et la mort de Notre-Seigneur"]}},
 glorious:{en:'Glorious Mysteries',fr:'Mystères glorieux',items:{en:['The Resurrection','The Ascension','The Descent of the Holy Spirit','The Assumption of Our Lady','The Coronation of Our Lady'],fr:["La Résurrection","L’Ascension","La Descente du Saint-Esprit","L’Assomption de la Sainte Vierge","Le Couronnement de la Sainte Vierge"]}},
 luminous:{en:'Luminous Mysteries · optional 2002 set',fr:'Mystères lumineux · série facultative de 2002',items:{en:['The Baptism of the Lord','The Wedding at Cana','The Proclamation of the Kingdom','The Transfiguration','The Institution of the Eucharist'],fr:["Le Baptême du Seigneur","Les Noces de Cana","L’Annonce du Royaume","La Transfiguration","L’Institution de l’Eucharistie"]}}
};
function firstMonthlyDirectPrayers(kind){
 // These are source-owned entry points, not claims of sacramental participation
 // or substitute conditions for the First Friday / First Saturday devotions.
 const friday=kind==="friday";
 const cards=friday
  ?'<button type="button" data-p435930-ff-direct-prayer><strong>'+
    esc(L("Pray the Act of Reparation","Prier l’Acte de réparation"))+
    '</strong><small>'+esc(L("Sacred Heart · canonical prayer text","Sacré-Cœur · texte canonique"))+'</small></button>'
  :'<button type="button" data-p435930-fs-direct-rosary><strong>'+
    esc(L("Pray five decades","Prier cinq dizaines"))+
    '</strong><small>'+esc(L("Open the existing Rosary","Ouvrir le Rosaire existant"))+'</small></button>'+
   '<button type="button" data-p435930-fs-direct-meditate><strong>'+
    esc(L("Meditate for 15 minutes","Méditer pendant 15 minutes"))+
    '</strong><small>'+esc(L("Separate Rosary mystery meditation","Méditation distincte des mystères"))+'</small></button>';
 const note=friday
  ?L("This associated prayer does not replace reparatory Holy Communion.",
     "Cette prière associée ne remplace pas la Communion réparatrice.")
  :L("The Rosary and fifteen-minute meditation are distinct acts; Confession and Communion also remain necessary.",
     "Le Rosaire et la méditation de quinze minutes sont deux actes distincts ; la Confession et la Communion restent également nécessaires.");
 return '<section class="aoFirstMonthlyDirect" data-ao-first-monthly-direct="'+kind+'" aria-label="'+
  esc(L("Open prayer directly","Ouvrir directement la prière"))+'">'+
  '<div class="aoFirstMonthlyDirectTop"><strong>'+esc(L("Prayer & meditation","Prière et méditation"))+
  '</strong><small>'+esc(L("Direct access · no month recorded","Accès direct · aucun mois enregistré"))+
  '</small></div><div class="aoFirstMonthlyDirectChoices">'+cards+'</div>'+
  '<p>'+esc(note)+'</p></section>';
}
function firstFridayStage(date,valid){
 const s=FF.step;
 if(s===4&&!S.firstFriday.tracking)return `${guideNow(L('Finish simply','Terminez simplement'),L('No record is required. Give thanks and conclude the devotion without turning it into a completion test.','Aucun enregistrement n’est requis. Rendez grâce et concluez la dévotion sans la transformer en test d’accomplissement.'))}${programmeNav('ff',s,FF_STAGES.length,L('Done · return','Terminé · retour'))}`;
 if(s===0)return `${guideNow(L('Offer this First Friday','Offrez ce premier vendredi'),L('Make the reparatory intention before Holy Communion. The intention gives the practice its devotional direction; it does not replace ordinary preparation for Communion.','Formez l’intention réparatrice avant la sainte Communion. Cette intention donne à la pratique son orientation dévotionnelle ; elle ne remplace pas la préparation ordinaire à la Communion.'))}<label class="aoP435930Toggle"><input type="checkbox" data-p435930-ff-intention ${FF.intention?'checked':''}><span><b>${esc(L('I make this Communion with a reparatory intention','Je fais cette Communion avec une intention réparatrice'))}</b><small>${esc(L('Your explicit intention · not inferred by the app','Votre intention explicite · non déduite par l’application'))}</small></span></label>${guideCue(L('NEXT','ENSUITE'),L('Prepare for Mass and for Holy Communion.','Préparez-vous à la Messe et à la sainte Communion.'))}${programmeNav('ff',s,FF_STAGES.length)}`;
 if(s===1)return `${guideNow(L('Prepare before Mass','Préparez-vous avant la Messe'),L('Recollect yourself before Mass. If sacramental Confession is needed before receiving Holy Communion, prepare for Confession first; otherwise proceed with your normal preparation for Mass.','Recueillez-vous avant la Messe. Si la Confession sacramentelle est nécessaire avant de recevoir la sainte Communion, préparez d’abord votre Confession ; sinon poursuivez votre préparation habituelle à la Messe.'))}<div class="aoP435930Handoffs"><button data-p435930-handoff="mass.prepare">${esc(L('Open Before Mass','Ouvrir Avant la Messe'))}</button><button data-p435930-own="pray.confession">${esc(L('Prepare for Confession','Préparer la Confession'))}</button></div><details class="aoP435930Source"><summary>${esc(L('Historical practice and local customs','Pratique historique et coutumes locales'))}</summary><p>${esc(L('The reparatory Communion on nine consecutive First Fridays is the central historical practice. Confession is necessary when required for worthy Communion; a local parish programme may also offer routine Confession, Mass, the Sacred Heart Litany and Benediction without making all of these separate universal conditions.','La Communion réparatrice durant neuf premiers vendredis consécutifs est au cœur de la pratique historique. La Confession est nécessaire lorsqu’elle est requise pour communier dignement ; une paroisse peut aussi proposer Confession, Messe, litanies du Sacré-Cœur et Bénédiction, sans que chaque activité soit une condition universelle supplémentaire.'))}</p><p><a href="https://www.institute-christ-king.org/pittsburgh-about" target="_blank" rel="noopener noreferrer">${esc(L('ICKSP parish practice','Pratique paroissiale de l’ICRSP'))}</a></p></details>${guideCue(L('RETURN HERE','REVENEZ ICI'),L('When your preparation is complete, continue to the Mass & Communion stage.','Lorsque votre préparation est terminée, passez à l’étape Messe & Communion.'))}${programmeNav('ff',s,FF_STAGES.length)}`;
 if(s===2)return `${guideNow(L('Attend Mass and receive Holy Communion','Assistez à la Messe et recevez la sainte Communion'),L('Follow the Mass itself. After you have actually received Holy Communion on this First Friday, return here and report that act explicitly.','Suivez la Messe elle-même. Après avoir effectivement reçu la sainte Communion ce premier vendredi, revenez ici et déclarez explicitement cet acte.'))}<div class="aoP435930Handoffs"><button data-p435930-handoff="mass.follow">${esc(L('Follow Mass','Suivre la Messe'))}</button></div><label class="aoP435930Toggle"><input type="checkbox" data-p435930-ff-communion ${FF.communion?'checked':''}><span><b>${esc(L('I received Holy Communion on this First Friday','J’ai reçu la sainte Communion ce premier vendredi'))}</b><small>${esc(L('User report only','Déclaration de l’utilisateur seulement'))}</small></span></label>${guideCue(L('AFTER COMMUNION','APRÈS LA COMMUNION'),L('Remain for thanksgiving before moving into the reparatory prayer.','Demeurez en action de grâces avant de passer à la prière réparatrice.'))}${programmeNav('ff',s,FF_STAGES.length)}`;
 if(s===3)return `${guideNow(L('Thanksgiving and reparation','Action de grâces et réparation'),L('Begin with immediate thanksgiving after Communion. Then pray the Act of Reparation to the Sacred Heart. A Holy Hour may be added, but it is optional and distinct from the essential First-Friday act of Communion.','Commencez par l’action de grâces immédiate après la Communion. Puis priez l’Acte de réparation au Sacré-Cœur. Une Heure Sainte peut s’y ajouter, mais elle est facultative et distincte de l’acte essentiel de Communion du premier vendredi.'))}<div class="aoP435930Handoffs"><button data-p435930-handoff="mass.thanksgiving">${esc(L('Open Thanksgiving after Mass','Ouvrir Action de grâces après la Messe'))}</button><button data-p435930-handoff="pray.sacred_heart">${esc(L('Sacred Heart prayers','Prières du Sacré-Cœur'))}</button><button data-p435930-ador-mode-direct="holy">${esc(L('Optional Holy Hour','Heure Sainte facultative'))}</button></div>${prayerBlock('sacred_heart_short_prayer',{kicker:L('Act of Reparation','Acte de réparation')})}${programmeNav('ff',s,FF_STAGES.length)}`;
 const rows=[[L('Reparatory intention','Intention réparatrice'),FF.intention],[L('Holy Communion on the First Friday','Sainte Communion le premier vendredi'),FF.communion]];
 return `${guideNow(L('Review and record','Vérifiez et enregistrez'),L('The app records only what you explicitly report. It does not certify worthiness, grace, validity, salvation, or any promised effect.','L’application enregistre seulement ce que vous déclarez explicitement. Elle ne certifie ni dignité, ni grâce, ni validité, ni salut, ni aucun effet promis.'))}${programmeSummary(rows)}<button class="aoP435930Primary" data-p435930-ff-save ${!valid||!FF.intention||!FF.communion?'disabled':''}>${esc(L('Record this First Friday','Enregistrer ce premier vendredi'))}</button>${valid?`<button class="aoP435930Secondary" data-p435930-ff-interrupt>${esc(L('Record this month as incomplete / interrupted','Enregistrer ce mois comme incomplet / interrompu'))}</button>`:''}${programmeNav('ff',s,FF_STAGES.length)}`
}
function renderFirstFriday(){
 const date=selectedDateKey(),valid=isFirstWeekday(date,5),records=S.firstFriday.records,tracking=!!S.firstFriday.tracking;
 return `${head(L('Nine First Fridays','Neuf premiers vendredis'),L('Guided Sacred Heart reparation','Réparation guidée au Sacré-Cœur'))}${programmeRail('ff',FF.step,FF_STAGES)}<main class="aoP435930Body ${tracking?'aoTrackingOn':'aoTrackingOff'}" tabindex="0" aria-label="${esc(L('First Friday stage content','Contenu de l’étape du premier vendredi'))}">
  <section class="aoP435930Date ${valid?'valid':'invalid'}"><small>${esc(L('Selected date','Date sélectionnée'))}</small><b>${esc(fmtDate(date))}</b><span>${esc(valid?L('First Friday','Premier vendredi'):tracking?L('Not the First Friday · guide available, recording disabled','Ce n’est pas le premier vendredi · guide disponible, enregistrement désactivé'):L('Not the First Friday · you may still preview the guide','Ce n’est pas le premier vendredi · vous pouvez quand même consulter le guide'))}</span></section>
  ${firstMonthlyDirectPrayers('friday')}
  ${firstFridayStage(date,valid)}
  ${devotionalGuide('firstFriday')}
  ${devotionalMonthSummary('friday',records,tracking,date)}
  ${tracking&&FF.step===4?history(records,L('Private history','Historique privé')):''}
 </main>`;
}
function firstSaturdayStage(date,valid){
 const s=FS.step;
 if(s===5&&!S.firstSaturday.tracking)return `${guideNow(L('Finish simply','Terminez simplement'),L('No record is required. Give thanks and conclude the reparatory practice without turning it into a certification screen.','Aucun enregistrement n’est requis. Rendez grâce et concluez la pratique réparatrice sans la transformer en écran de certification.'))}${programmeNav('fs',s,FS_STAGES.length,L('Done · return','Terminé · retour'))}`;
 if(s===0)return `${guideNow(L('Set the reparatory intention','Formez l’intention réparatrice'),L('Intend to make the constituent acts in reparation to the Immaculate Heart. The intention governs the acts; it is not a fifth constituent act.','Ayez l’intention d’accomplir les actes constitutifs en réparation au Cœur Immaculé. L’intention gouverne les actes ; elle n’est pas un cinquième acte constitutif.'))}<label class="aoP435930Toggle"><input type="checkbox" data-p435930-fs-intention ${FS.intention?'checked':''}><span><b>${esc(L('I make these acts with a reparatory intention','J’accomplis ces actes avec une intention réparatrice'))}</b><small>${esc(L('Explicit intention · not inferred by the app','Intention explicite · non déduite par l’application'))}</small></span></label>${programmeNav('fs',s,FS_STAGES.length)}`;
 if(s===1)return `${guideNow(L('Confession','Confession'),L('If you have already made a reparatory Confession, enter its date. Otherwise use the Confession module to prepare. Historical guidance allows Confession at another suitable time when the reparatory intention is present; this guide imposes no invented fixed number of days.','Si vous avez déjà fait la Confession réparatrice, indiquez sa date. Sinon, utilisez le module Confession pour vous préparer. La tradition admet la Confession à un autre moment convenable avec l’intention réparatrice ; ce guide n’impose aucun nombre arbitraire de jours.'))}<label class="aoP435930ProgrammeDate"><span><b>${esc(L('Date of Confession','Date de la Confession'))}</b><small>${esc(L('User report · may differ from the First Saturday date','Déclaration de l’utilisateur · peut différer de la date du premier samedi'))}</small></span><input type="text" inputmode="numeric" autocomplete="off" placeholder="DD/MM/YYYY" aria-label="${esc(L('Date of Confession · DD/MM/YYYY','Date de la Confession · JJ/MM/AAAA'))}" data-p435930-fs-confession value="${esc(FS.confessionDate?formatDisplayDate(FS.confessionDate):'')}"></label><div class="aoP435930Handoffs"><button data-p435930-own="pray.confession">${esc(L('Prepare for Confession','Préparer la Confession'))}</button></div>${programmeNav('fs',s,FS_STAGES.length)}`;
 if(s===2)return `${guideNow(L('Mass and Holy Communion','Messe et sainte Communion'),L('Attend Mass and receive Holy Communion on the First Saturday itself. Afterward, return here and report the Communion explicitly.','Assistez à la Messe et recevez la sainte Communion le premier samedi lui-même. Ensuite, revenez ici et déclarez explicitement la Communion.'))}<div class="aoP435930Handoffs"><button data-p435930-handoff="mass.prepare">${esc(L('Prepare for Mass','Se préparer à la Messe'))}</button><button data-p435930-handoff="mass.follow">${esc(L('Follow Mass','Suivre la Messe'))}</button><button data-p435930-handoff="mass.thanksgiving">${esc(L('Thanksgiving after Mass','Action de grâces après la Messe'))}</button></div><label class="aoP435930Toggle"><input type="checkbox" data-p435930-fs-communion ${FS.communion?'checked':''}><span><b>${esc(L('I received Holy Communion on this First Saturday','J’ai reçu la sainte Communion ce premier samedi'))}</b><small>${esc(L('User report only','Déclaration de l’utilisateur seulement'))}</small></span></label>${programmeNav('fs',s,FS_STAGES.length)}`;
 if(s===3)return `${guideNow(L('Pray five decades of the Rosary','Priez cinq dizaines du Rosaire'),L('Pray the canonical Rosary as a distinct constituent act. When you return, mark the act complete only if you actually prayed five decades.','Priez le Rosaire canonique comme acte constitutif distinct. À votre retour, ne marquez l’acte accompli que si vous avez effectivement prié cinq dizaines.'))}<div class="aoP435930Handoffs"><button data-p435930-own="pray.rosary">${esc(L('Open Rosary','Ouvrir le Rosaire'))}</button></div><label class="aoP435930Toggle"><input type="checkbox" data-p435930-fs-rosary ${FS.rosary?'checked':''}><span><b>${esc(L('I prayed five decades on this First Saturday','J’ai prié cinq dizaines ce premier samedi'))}</b><small>${esc(L('Distinct from the fifteen-minute meditation','Distinct de la méditation de quinze minutes'))}</small></span></label>${programmeNav('fs',s,FS_STAGES.length)}`;
 if(s===4)return `${guideNow(L('Spend fifteen minutes meditating on the Rosary mysteries','Passez quinze minutes à méditer les mystères du Rosaire'),L('This is not another five decades. Choose one or more mysteries and remain with them in meditation for fifteen minutes. The aid below guides the meditation without automatically certifying completion.','Il ne s’agit pas de cinq nouvelles dizaines. Choisissez un ou plusieurs mystères et demeurez avec eux en méditation pendant quinze minutes. L’aide ci-dessous guide la méditation sans certifier automatiquement son accomplissement.'))}<div class="aoP435930Handoffs"><button data-p435930-fs-meditate>${esc(L('Open guided 15-minute meditation','Ouvrir la méditation guidée de 15 min'))}</button></div><label class="aoP435930Toggle"><input type="checkbox" data-p435930-fs-meditation ${FS.meditation?'checked':''}><span><b>${esc(L('I completed fifteen minutes of mystery meditation','J’ai accompli quinze minutes de méditation des mystères'))}</b><small>${esc(L('Explicit user report','Déclaration explicite de l’utilisateur'))}</small></span></label>${programmeNav('fs',s,FS_STAGES.length)}`;
 const rows=[[L('Reparatory intention','Intention réparatrice'),FS.intention],[L('Confession','Confession'),!!FS.confessionDate,FS.confessionDate?fmtDate(FS.confessionDate):''],[L('Holy Communion','Sainte Communion'),FS.communion],[L('Five-decade Rosary','Rosaire de cinq dizaines'),FS.rosary],[L('15-minute meditation','Méditation de 15 minutes'),FS.meditation]];
 const complete=valid&&FS.intention&&FS.communion&&FS.rosary&&FS.meditation&&!!FS.confessionDate;
 return `${guideNow(L('Review the four acts and record the month','Vérifiez les quatre actes et enregistrez le mois'),L('Record completion only from your own report. The app does not infer sacramental validity, interior disposition, grace, or devotional effects.','N’enregistrez l’accomplissement qu’à partir de votre propre déclaration. L’application ne déduit ni validité sacramentelle, ni disposition intérieure, ni grâce, ni effets dévotionnels.'))}${programmeSummary(rows)}<button class="aoP435930Primary" data-p435930-fs-save ${complete?'':'disabled'}>${esc(L('Record this First Saturday','Enregistrer ce premier samedi'))}</button>${valid?`<button class="aoP435930Secondary" data-p435930-fs-interrupt>${esc(L('Record this month as incomplete / interrupted','Enregistrer ce mois comme incomplet / interrompu'))}</button>`:''}${programmeNav('fs',s,FS_STAGES.length)}`
}
function renderFirstSaturday(){
 const date=selectedDateKey(),valid=isFirstWeekday(date,6),records=S.firstSaturday.records,tracking=!!S.firstSaturday.tracking;
 return `${head(L('Five First Saturdays','Cinq premiers samedis'),L('Guided reparation to the Immaculate Heart','Réparation guidée au Cœur Immaculé'))}${programmeRail('fs',FS.step,FS_STAGES)}<main class="aoP435930Body ${tracking?'aoTrackingOn':'aoTrackingOff'}" tabindex="0" aria-label="${esc(L('First Saturday stage content','Contenu de l’étape du premier samedi'))}">
  <section class="aoP435930Date ${valid?'valid':'invalid'}"><small>${esc(L('Selected date','Date sélectionnée'))}</small><b>${esc(fmtDate(date))}</b><span>${esc(valid?L('First Saturday','Premier samedi'):tracking?L('Not the First Saturday · guide available, recording disabled','Ce n’est pas le premier samedi · guide disponible, enregistrement désactivé'):L('Not the First Saturday · you may still preview the guide','Ce n’est pas le premier samedi · vous pouvez quand même consulter le guide'))}</span></section>
  ${firstMonthlyDirectPrayers('saturday')}
  ${firstSaturdayStage(date,valid)}
  ${devotionalGuide('firstSaturday')}
  ${devotionalMonthSummary('saturday',records,tracking,date)}
  ${tracking&&FS.step===5?history(records,L('Private history','Historique privé')):''}
 </main>`;
}
function mysterySetButtons(){return `<div class="aoP435930MysterySets">${Object.entries(FS_MYSTERIES).filter(([id])=>id!=='luminous').map(([id,x])=>`<button type="button" class="${FS.medSet===id?'active':''}" data-p435930-fs-med-set="${id}">${esc(isFr()?x.fr:x.en)}</button>`).join('')}</div>`}
function mysteryButtons(){const set=FS_MYSTERIES[FS.medSet]||FS_MYSTERIES.joyful,items=set.items[lang()]||set.items.en;return `<div class="aoP435930MysteryList">${items.map((x,i)=>`<button type="button" class="${FS.medMystery===i?'active':''}" data-p435930-fs-med-mystery="${i}"><span>${i+1}</span><b>${esc(x)}</b></button>`).join('')}</div>`}
function selectedMystery(){const set=FS_MYSTERIES[FS.medSet]||FS_MYSTERIES.joyful,items=set.items[lang()]||set.items.en;return items[Math.max(0,Math.min(items.length-1,FS.medMystery||0))]}
function renderFSMeditation(){
 const mystery=selectedMystery();
 return `${head(L('First Saturday meditation','Méditation du premier samedi'),L('Fifteen minutes with one or more Rosary mysteries · distinct from the five decades','Quinze minutes avec un ou plusieurs mystères du Rosaire · distinctes des cinq dizaines'))}<main class="aoP435930Body"><section class="aoP435930MeditationIntro"><small>${esc(L('CHOOSE A MYSTERY','CHOISISSEZ UN MYSTÈRE'))}</small><h2>${esc(mystery)}</h2><p>${esc(L('You may remain with this mystery for the whole period or deliberately move to another mystery. Do not turn this into another decade of vocal prayer.','Vous pouvez demeurer avec ce mystère pendant toute la période ou passer délibérément à un autre mystère. Ne transformez pas cela en une nouvelle dizaine de prière vocale.'))}</p></section>${mysterySetButtons()}${mysteryButtons()}<section class="aoP435930MeditationFlow"><div>${guideNow(L('Place the mystery before you','Placez le mystère devant vous'),L('Recall the Gospel event simply. Who is present? What is happening? Do not rush to applications yet.','Rappelez simplement l’événement évangélique. Qui est présent ? Que se passe-t-il ? Ne vous hâtez pas encore vers les applications.'))}</div><div>${guideNow(L('Stay with Our Lady’s place in the mystery','Demeurez avec la place de Notre-Dame dans le mystère'),L('Consider what Mary receives, does, suffers, offers, or witnesses here. Remain with what belongs to this mystery rather than inventing a separate scene.','Considérez ce que Marie reçoit, fait, souffre, offre ou contemple ici. Demeurez avec ce qui appartient à ce mystère plutôt que d’inventer une scène distincte.'))}</div><div>${guideNow(L('Turn the mystery toward your own life','Tournez le mystère vers votre propre vie'),L('Ask what grace, conversion, imitation, patience, faith, charity, or fidelity this mystery calls for in you today.','Demandez quelle grâce, conversion, imitation, patience, foi, charité ou fidélité ce mystère appelle en vous aujourd’hui.'))}</div><div>${guideNow(L('Speak briefly, then remain silent','Parlez brièvement, puis demeurez en silence'),L('Speak to God or Our Lady in your own words, then stop adding words and remain with the mystery. Return gently when distracted.','Parlez à Dieu ou à Notre-Dame avec vos propres mots, puis cessez d’ajouter des paroles et demeurez avec le mystère. Revenez-y doucement en cas de distraction.'))}</div></section>${ADOR.timerEnd?timerMarkup():`<div class="aoP435930Timer aoP435930MeditationTimer"><b>${esc(L('15-minute timer aid','Minuteur de 15 minutes'))}</b><span>${esc(L('Start it when you are ready to begin the actual meditation. It never marks the act complete automatically.','Démarrez-le lorsque vous êtes prêt à commencer la méditation proprement dite. Il ne valide jamais automatiquement l’acte.'))}</span><button type="button" data-p435930-timer="15">15 min</button></div>`}<div class="aoP435930MeditationActions"><button class="aoP435930Primary" data-p435930-fs-meditation-complete>${esc(L('I completed fifteen minutes · return','J’ai accompli quinze minutes · retour'))}</button><button class="aoP435930Secondary" data-p435930-fs-meditation-return>${esc(L('Return without marking complete','Retour sans marquer comme accompli'))}</button></div></main>`
}
function renderPrayerOnly(id){const p=P(id);return `${head(p?(isFr()?(p.titleFr||p.title):p.title):L('Prayer','Prière'),prayerReturnView==='firstFriday'?L('First Friday · Sacred Heart','Premier vendredi · Sacré-Cœur'):L('Prayer Library','Livre de prières'))}<main class="aoP435930Body aoP435930LibraryReader" data-ao-library-card="single"><button class="aoP435930InlineBack" data-p435930-prayer-return>${assetIcon('ao-ui-back')} ${esc(L('Return','Retour'))}</button><section class="aoDevoCard" data-ao-devo-card="${esc(id)}"><div class="aoDevoCardScroll" role="region" aria-label="${esc(p?(isFr()?(p.titleFr||p.title):p.title):L('Prayer','Prière'))}">${prayerBlock(id,{scriptureContext:true})}</div></section>${p?libraryContextMarkup(p):""}</main>`}
let prayerReturnView=null,prayerId=null;
function pushView(v=view){if(v)navStack.push(v);return navStack.length}
function popView(fallback='home'){view=navStack.length?navStack.pop():fallback;return view}
function backToParent(){
 if(view==='mercy'||view==='rosaryMethods'){view='home';return render()}
 if(view==='family'){view='home';familyId=null;navStack=[];return render()}
 if(view==='adoration'&&ADOR.mode!=='home'){ADOR.quiet=false;ADOR.mode='home';return render()}
 if(view==='fortyHours'&&FORTY.mode!=='choose'){FORTY.mode='choose';return render()}
 if(view==='library'&&LIB.open){LIB.open=null;return render()}
 if(view==='prayerOnly'){view=prayerReturnView||'library';return render()}
 if(view!=='home'&&navStack.length){popView();return render()}
 if(view!=='home'&&familyId){view='family';return render()}
 // Opened as the Pray tab (no caller to return to): Back goes Home, like
 // the Home button. A bare close() here left the tab on a blank surface.
 if(!returnContext)return goGlobalHome();
 return close();
}
async function goGlobalHome(){
 if(homeNavigationPending)return false;
 homeNavigationPending=true;
 const before=externalResume;
 externalResume=captureResume();
 try{
  // Only the canonical shell may close Prayer and activate Home. Unlike
  // the former fire-and-forget code, a resolved {ok:false} is a failure.
  const result=await window?.AO_APP_SHELL_V1?.navigate?.('home');
  if(result===true||result?.ok===true){homeNavigationError=false;return true;}
 }catch(error){console.error('PRAY Home navigation failed',error)}
 finally{homeNavigationPending=false}
 externalResume=before;
 // A hard-Home attempt may have already closed Prayer. Restore its hub, not
 // cleared private Confession/examination state, and show an actionable error.
 let node=document.getElementById(ROOT_ID);
 if(!node?.classList?.contains('open')){
  try{await window?.AO_APP_SHELL_V1?.navigate?.('pray')}catch(error){console.error('PRAY recovery navigation failed',error)}
  node=document.getElementById(ROOT_ID);
  if(!node?.classList?.contains('open')){
   open('pray.hub',{returnContext:PRAY_CTX});
   try{window?.AO_APP_SHELL_V1?.syncSurface?.('pray')}catch{}
  }
 }
 homeNavigationError=true;
 render();
 return false;
}
function touchBlocked(target){
 // Swiping on the large prayer text must work; a tap still flips it to Latin.
 if(target?.closest?.('[data-p435930-flip],[data-p435930-card-flip]'))return false;
 return !!target?.closest?.('button,a,input,textarea,select,summary,[contenteditable="true"]');
}
function horizontalStep(direction){
 const d=direction>0?1:-1;
 if(view==='stations'){STATIONS.step=Math.max(0,Math.min(13,STATIONS.step+d));render();return true}
 if(view==='confession'){if(!CONF.path)return false;CONF.stage=Math.max(0,Math.min(3,CONF.stage+d));render();return true}
 if(view==='benediction'){BEN.step=Math.max(0,Math.min(benStages().length-1,BEN.step+d));render();return true}
 if(view==='adoration'&&ADOR.mode==='visit'){ADOR.visitStep=Math.max(0,Math.min(visitSteps().length-1,ADOR.visitStep+d));render();return true}
 if(view==='adoration'&&ADOR.mode==='holy'){ADOR.holyStep=Math.max(0,Math.min(holySteps().length-1,ADOR.holyStep+d));render();return true}
 if(view==='adoration'&&ADOR.mode==='four'){ADOR.fourStep=Math.max(0,Math.min(fourSteps().length-1,ADOR.fourStep+d));render();return true}
 if(view==='penitential'){PEN.step=Math.max(0,Math.min(6,PEN.step+d));render();return true}
 if(view==='litany'&&LIT.sections?.length){LIT.step=Math.max(0,Math.min(LIT.sections.length-1,LIT.step+d));render();return true}
 if(view==='sevenWords'){SEVEN.step=Math.max(0,Math.min(6,SEVEN.step+d));render();return true}if(view==='tenebrae'&&TEN.model){TEN.step=Math.max(0,Math.min(TEN.model.steps.length-1,TEN.step+d));render();return true}
 if(view==='fortyHours'){FORTY.step=Math.max(0,Math.min(FORTY_STAGES.length-1,FORTY.step+d));render();return true}
 if(view==='firstFriday'){FF.step=Math.max(0,Math.min(FF_STAGES.length-1,FF.step+d));render();return true}
 if(view==='firstSaturday'){FS.step=Math.max(0,Math.min(FS_STAGES.length-1,FS.step+d));render();return true}
 return false;
}
function onPrayTouchStart(e){
 // A dual-axis card is the sole owner of its horizontal touch gesture.
 // Do not also advance the historical global step cursor (two-card skip).
 if(e.target?.closest?.('.aoDevoCardScroll')&&mount()?.querySelector('.aoDevoSequenceTimeline')){
  prayTouch=null;return;
 }
 const t=e.touches?.[0];if(!t||touchBlocked(e.target)){prayTouch=null;return}
 prayTouch={x:t.clientX,y:t.clientY,at:Date.now(),flipTarget:t.target?.closest?.('[data-p435930-flip],[data-p435930-card-flip]')||null};
}
function onPrayTouchEnd(e){
 if(!prayTouch)return;
 const t=e.changedTouches?.[0],start=prayTouch;prayTouch=null;if(!t)return;
 const dx=t.clientX-start.x,dy=t.clientY-start.y,elapsed=Date.now()-start.at;
 if(elapsed>1300||Math.abs(dx)<72||Math.abs(dx)<Math.abs(dy)*1.35)return;
 // Suppress only a click synthesized on the exact swiped prayer face.
 // Never block taps on a subsequent card or another devotion.
 suppressPrayerFlipTarget=start.flipTarget;
 horizontalStep(dx<0?1:-1);
}
function captureResume(){return {view,familyId,navStack:[...navStack],prayerReturnView,prayerId}}
function restoreHandoff(snapshot){if(!snapshot||typeof snapshot.view!=="string")return false;externalResume=null;return reopenResume(snapshot)}
function reopenResume(snapshot){
 if(!snapshot)return false;
 navStack=Array.isArray(snapshot.navStack)?[...snapshot.navStack]:[];view=snapshot.view||'home';familyId=snapshot.familyId||null;prayerReturnView=snapshot.prayerReturnView||null;prayerId=snapshot.prayerId||null;
 const r=shell();r.classList.add('open');r.setAttribute('aria-hidden','false');document.body.classList.add('aoP435930Open');render();
 queueMicrotask(()=>r.querySelector('button,[href],input,[tabindex]:not([tabindex="-1"])')?.focus?.());return true
}
function navigationSignature(){return [view,MERCY.step,MERCY.includeClosing,MERCY.guide,FIVE_WOUNDS.index,FIVE_WOUNDS.latin,TEN.day,TEN.hour,TEN.step,TEN.face,familyId||'',CONF.stage,CONF.path||'',CONF.examStep,CONF.riteStep,CONF.afterStep,BEN.step,ADOR.mode,ADOR.visitStep,ADOR.holyStep,ADOR.fourStep,FF.step,FS.step,PEN.step,LIT.step,SEVEN.step,FORTY.step,STATIONS.step,LIB.open||'',prayerId||'',S.angelusMode].join('|')}
function focusables(){const r=document.getElementById(ROOT_ID);if(!r?.classList.contains('open'))return [];return [...r.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null&&!el.hidden)}


const PEN_PSALMS=[{trad:6,modern:6},{trad:31,modern:32},{trad:37,modern:38},{trad:50,modern:51},{trad:101,modern:102},{trad:129,modern:130},{trad:142,modern:143}];
const WORD_REFS=['Luke 23:34','Luke 23:43','John 19:26–27','Matthew 27:46','John 19:28','John 19:30','Luke 23:46'];
const WORD_LABELS={en:['Father, forgive them','Today you shall be with me in paradise','Woman, behold your son','My God, why have you forsaken me?','I thirst','It is finished','Father, into your hands'],fr:['Père, pardonne-leur','Aujourd’hui tu seras avec moi dans le paradis','Femme, voici ton fils','Mon Dieu, pourquoi m’avez-vous abandonné ?','J’ai soif','Tout est consommé','Père, entre vos mains']};
function devotionalSource(title,detail='',witnessId=''){
 const record=DEVOTIONAL_WITNESSES[witnessId]||null;
 const links=record?.links?.map(link=>`<p><a class="aoP435930SourceLink" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.title)} ↗</a></p>`).join('')||'';
 const hold=!record?`<p><small>${esc(L('A direct original-text link has not been independently verified.','Aucun lien direct vers le texte original n’a été vérifié de manière indépendante.'))}</small></p>`:'';
 return `<details class="aoP435930Source"><summary>${esc(L('Source / provenance','Source / provenance'))}</summary><p><b>${esc(title)}</b></p>${detail?`<p>${esc(detail)}</p>`:''}${links}${hold}</details>`
}
function scriptureRows(d,language='vernacular',full=false){
 const rows=language==='la'?(d?.latinChapter||[]):isFr()?(d?.frenchChapter||[]):(d?.englishChapter||[]);if(full)return rows;
 const r=d?.reference;if(!r)return rows;return rows.filter(v=>+v.verse>=+r.start&&+v.verse<=+r.end)
}
function scriptureVerseHtml(rows){return rows.length?rows.map(v=>`<span class="aoP435930ScriptureVerse"><sup>${esc(v.verse)}</sup>${esc(v.text||v.value||'')}</span>`).join(' '):`<span>${esc(L('Text unavailable.','Texte indisponible.'))}</span>`}
function scriptureFlip(d,full=false){
 const la=scriptureVerseHtml(scriptureRows(d,'la',full)),ve=scriptureVerseHtml(scriptureRows(d,'vernacular',full));
 return `<button type="button" class="aoP435930ScriptureFlip" data-p435930-card-flip aria-label="${esc(L('Switch Scripture language','Changer la langue de l’Écriture'))}"><span data-face-v>${ve}</span><span data-face-la hidden>${la}</span><i>LA ↔ ${isFr()?'FR':'EN'}</i></button>`
}
async function loadScriptureInto(selector,kind,ref,full,guard){
 const token=guard();
 let deadline=null;
 try{
  const svc=runtime()?.scriptureService;
  if(!svc||typeof svc.load!=='function')throw new Error('Canonical Scripture service unavailable');
  // A silent upstream Scripture request must not leave the prayer on
  // "Loading…" indefinitely. The deadline changes UI state, not the source
  // or edition; late responses are ignored rather than installed.
  const d=await Promise.race([
   Promise.resolve().then(()=>svc.load(kind,{en:ref,fr:ref,lat:ref},{contextOnly:true})),
   new Promise((_,reject)=>{deadline=setTimeout(
    ()=>reject(new Error('Canonical Scripture source request timed out')),12000)})
  ]);
  if(token!==guard())return;
  const box=document.querySelector(selector);
  if(!box)return;
  // The service may resolve a valid reference shell without text. Never
  // treat an empty bilingual response as a successfully loaded Psalm/Gospel.
  if(!scriptureRows(d,'vernacular',full).length&&!scriptureRows(d,'la',full).length)
   throw new Error('No original Scripture verses in resolved source');
  box.innerHTML=scriptureFlip(d,full);
  box.dataset.aoScriptureContent='ready';
  box.dataset.aoScriptureSource=kind;
 }catch(e){
  if(token!==guard())return;
  const box=document.querySelector(selector);
  if(!box)return;
  box.dataset.aoScriptureContent='unavailable';
  box.dataset.aoScriptureSource=kind;
  box.innerHTML=callout(esc(L('Scripture text could not be loaded. This passage has not been replaced by a paraphrase.','Le texte de l’Écriture n’a pas pu être chargé. Aucun texte de remplacement n’a été inventé.')),'warn')+
   `<button class="aoP435930Secondary" type="button" data-p435930-scripture-retry="${esc(kind)}">${esc(L('Retry original Scripture text','Réessayer de charger le texte biblique'))}</button>`;
  console.warn('Canonical Prayer Scripture source unavailable',kind,ref,String(e?.message||e));
 }finally{
  if(deadline!==null)clearTimeout(deadline);
 }
}
async function guidedWsText(title,key,language='en'){
 const ck='ao2:v435930:ws:'+language+':'+key;try{const c=localStorage.getItem(ck);if(c)return c}catch{}
 const host=language==='fr'?'fr.wikisource.org':'en.wikisource.org',api='https://'+host+'/w/api.php?action=parse&format=json&origin=*&prop=text&page='+encodeURIComponent(title),ac=new AbortController(),tm=setTimeout(()=>ac.abort(),8000);let r;
 try{r=await fetch(api,{signal:ac.signal})}finally{clearTimeout(tm)}if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json(),html=j?.parse?.text?.['*']||j?.parse?.text;if(!html)throw new Error('Source text unavailable');
 const doc=new DOMParser().parseFromString(html,'text/html');doc.querySelectorAll('script,style,.mw-editsection,.navbox,.metadata,.sistersitebox,.ws-noexport').forEach(n=>n.remove());const content=doc.querySelector('.mw-parser-output')||doc.body;
  const clone=content.cloneNode(true);
  clone.querySelectorAll('br').forEach(node=>node.replaceWith(doc.createTextNode('\n')));
  clone.querySelectorAll('p,dd,li,h2,h3,pre').forEach(node=>node.appendChild(doc.createTextNode('\n')));
  let txt=(content.innerText||'').trim()||clone.textContent||'';txt=txt.replace(/\n{3,}/g,'\n\n').replace(/\[edit\]/g,'').trim();try{localStorage.setItem(ck,txt)}catch{}return txt
}

function stationFlip(la,vern,label){
 const hasBoth=!!(la&&vern),shown=vern||la||'';
 return `<article class="aoP435930Prayer aoP435930StationPrayer"><div class="aoP435930PrayerHead"><div><small>${esc(label||L('Pray','Prier'))}</small></div>${hasBoth?`<span>LA ↔ ${isFr()?'FR':'EN'}</span>`:''}</div>${hasBoth?`<button type="button" class="aoP435930Flip" data-p435930-flip aria-label="${esc(L('Switch prayer language','Changer la langue de la prière'))}"><span data-face-v>${nl(vern)}</span><span data-face-la hidden>${nl(la)}</span></button>`:`<div class="aoP435930Text">${nl(shown)}</div>`}</article>`
}
function stationResponse(vr){
 const la=vr.la||[],ve=vr[lang()]||vr.en||[],group=stationRecitation()==='group';
 const line=(role,latin,vern)=>`<div class="aoP435930VRLine ${role}" data-role="${role}"><span class="ao-liturgical-speaker" data-ao-speaker-role="${role==='leader'?'versicle':'response'}">${role==='leader'?'℣.':'℟.'}</span><button type="button" class="aoP435930Flip" data-p435930-flip aria-label="${esc(L('Switch response language','Changer la langue du répons'))}"><span data-face-v>${esc(String(vern||'').replace(/^[℣℟]\.\s*/,''))}</span><span data-face-la hidden>${esc(String(latin||'').replace(/^[℣℟]\.\s*/,''))}</span></button></div>`;
 return `<article class="aoP435930VR ${group?'group':'individual'}"><small>${esc(group?L('GROUP · VERSICLE & RESPONSE','GROUPE · VERSET & RÉPONS'):L('VERSICLE & RESPONSE','VERSET & RÉPONS'))}</small>${line('leader',la[0],ve[0])}${line('response',la[1],ve[1])}</article>`;
}
function stationRail(active){const roman=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV'];return `<div class="aoP435930StageRail aoP435930GuideRail aoP435930StationRail">${roman.map((r,i)=>`<button type="button" class="${i===active?'active':''}" ${i===active?'aria-current="step"':''} data-p435930-station-step="${i}"><span>${r}</span><b>${esc((STATION_DATA.stationTitles?.[lang()]||STATION_DATA.stationTitles?.en||[])[i]||'')}</b></button>`).join('')}</div>`}
function stationsFx(){
 const i=Math.max(0,Math.min(13,Number(STATIONS.step)||0));
 if(lastStationsFxStep===i)return false;
 lastStationsFxStep=i;
 const roman=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV'];
 const title=(STATION_DATA.stationTitles?.[lang()]||STATION_DATA.stationTitles?.en||[])[i]||L('Station','Station')+' '+(i+1);
 const fx=window.AO_CINEMATIC_V4312||window.AO_CINEMATIC_V4311;
 if(fx?.isReducedMotion?.())return false;
 fx?.showTransition?.({kicker:L('STATIONS OF THE CROSS','CHEMIN DE CROIX'),title:`${roman[i]} · ${title}`,hold:430});
 return true;
}

function stationsDirectReadingChoices(){
 // Both display modes use the same fourteen source-owned Stations. The
 // abbreviated view is not an invented second historical rite or text.
 const mode=stationReaderMode(),publicMethod=STATIONS.publicPosture;
 const choice=(id,title,description)=>'<button type="button" data-p435930-station-reading="'+id+
  '" aria-pressed="'+String(mode===id)+'"'+(id==="simple"&&publicMethod?' disabled aria-disabled="true"':'')+'>'+
  '<strong>'+esc(title)+'</strong><small>'+esc(description)+'</small></button>';
 const group=choice("guided",L("Guided · St Alphonsus","Guidé · saint Alphonse"),
  L("Meditation, source prayer and traditional responses","Méditation, prière historique et répons traditionnels"))+
  choice("simple",L("Simple · contemplation","Simple · contemplation"),
  L("Station, Gospel context and silence","Station, contexte évangélique et silence"));
 const publicNote=publicMethod?'<p class="aoStationsDirectPublicNotice">'+
  esc(L("Public Stations posture is active; it uses the guided form with group responses. Change this separately in reading options.",
    "Les postures publiques sont actives : le parcours guidé avec répons communs s’applique. Modifiez-les séparément dans les options."))+'</p>':"";
 return '<section class="aoStationsDirectReading" data-ao-stations-direct-reading aria-label="'+
  esc(L("Choose how to read the fourteen Stations","Choisir la lecture des quatorze Stations"))+'">'+
  '<nav role="group" class="aoStationsDirectReadingChoices" aria-label="'+
  esc(L("Reading depth","Niveau de lecture"))+'">'+group+'</nav>'+publicNote+'</section>';
}
function renderStations(){
 const i=Math.max(0,Math.min(13,STATIONS.step)),titles=STATION_DATA.stationTitles?.[lang()]||STATION_DATA.stationTitles?.en||[],a=STATION_DATA.alphonsus?.[lang()]||STATION_DATA.alphonsus?.en||[],ala=STATION_DATA.alphonsus?.la||[],vr=STATION_DATA.stationVR||{},title=titles[i]||L('Station','Station')+' '+(i+1),guided=stationReaderMode()!=='simple';
 const consider=guided&&a[i]?.consider?`<section class="aoP435930StationConsider aoP435930HistoricalFocus"><small>${esc(L('CONSIDER','CONSIDÉREZ'))}</small><p>${esc(a[i].consider)}</p></section>`:'';
 const alph=guided&&a[i]?.prayer?stationFlip(ala[i]?.prayer||'',a[i].prayer,L('Prayer of St Alphonsus','Prière de saint Alphonse')):'';
 const stabat=(S.stations.stabat&&i<13)?stationFlip(STATION_DATA.stabat?.[i]||'',(isFr()?STATION_DATA.stabatFr:STATION_DATA.stabatEn)?.[i]||'',L('Stabat Mater · between stations','Stabat Mater · entre les stations')):'';
 const stationOrigin=stationScriptureOrigin(i);
 const stationScripture=stationOrigin?.reference?'<div class="aoP435930ScriptureOrigin" data-ao-station-scripture-origin="'+String(i+1)+'">'+
   scriptureContextCapsule(stationOrigin.reference,{french:isFr()})+
   '<small>'+esc(L('Gospel account illuminating this meditation, not a claim that every detail is biblical',
      'Récit évangélique éclairant cette méditation, sans prétendre que tous les détails soient bibliques'))+'</small></div>':'';
 const action=i===0?L('Begin the Way of the Cross. If you are physically moving between stations, face or approach the first station; otherwise recollect yourself before beginning.','Commencez le Chemin de Croix. Si vous vous déplacez physiquement entre les stations, tournez-vous vers la première station ou approchez-vous-en ; sinon recueillez-vous avant de commencer.'):L('Come to this station and become still before reading. Let the movement between stations end before you begin the text.','Arrivez à cette station et demeurez immobile avant de lire. Laissez s’achever le déplacement entre les stations avant de commencer.');
 const ordinary=guided?`<details class="aoP435930StationOrdinary"><summary>${esc(L('Our Father · Hail Mary · Glory Be','Notre Père · Je vous salue Marie · Gloire au Père'))}</summary><p>${esc(L('Pray the Our Father, Hail Mary and Glory Be before moving on.','Récitez le Notre Père, le Je vous salue Marie et le Gloire au Père avant de poursuivre.'))}</p>${guidePrayers([{id:'foundations_our_father'},{id:'foundations_hail_mary'},{id:'foundations_glory_be'}])}</details>`:'';
 return `${head(L('Stations of the Cross','Chemin de Croix'),L('XIV Stations · St Alphonsus','XIV Stations · saint Alphonse'))}${stationRail(i)}<main class="aoP435930Body aoP435930Stations">${stationsDirectReadingChoices()}<details class="aoP435930PrayerOptions" data-ao-stations-options ${STATIONS.optionsOpen?'open':''}><summary><span>${esc(L('Reading and recitation options','Options de lecture et de récitation'))}</span><small>${esc((stationReaderMode()==='guided'?L('Guided','Guidé'):L('Simple','Simple'))+' · '+(stationRecitation()==='group'?L('Group','Groupe'):L('Individual','Individuel'))+(S.stations.stabat?' · Stabat Mater':''))}</small></summary><div class="aoP435930PrayerOptionsBody"><div class="aoP435930ModeRow">${nav(L('Recitation','Récitation'),[['individual','Individual','Individuel'],['group','Group','Groupe']],stationRecitation())}</div><label class="aoP435930Toggle aoP435930StationPublicPosture"><input type="checkbox" data-p435930-station-public-posture ${STATIONS.publicPosture?'checked':''}><span><b>${esc(L('Traditional public Stations posture','Postures du Chemin de Croix public traditionnel'))}</b><small>${esc(L('Optional public method: genuflect at the versicle, stand during meditation, kneel for prayer. Source: Catholic Worship (1872).','Méthode publique facultative : génuflexion au verset, debout pendant la méditation, à genoux pour la prière. Source : Catholic Worship (1872).'))}</small></span></label><a href="${STATIONS_PUBLIC_POSTURE_SOURCE.url}" target="_blank" rel="noopener noreferrer" class="aoP435930SourceLink">${esc(L('Read the historical source','Lire la source historique'))}</a><label class="aoP435930Toggle aoP435930StationStabat"><input type="checkbox" data-p435930-station-stabat ${S.stations.stabat?'checked':''}><span><b>Stabat Mater</b><small>${esc(L('Include one stanza while moving between stations','Inclure une strophe pendant le déplacement entre les stations'))}</small></span></label><label class="aoP435930Toggle aoBatch03SimpleVersicles"><input type="checkbox" data-p435930-station-simple-responses ${STATIONS.simpleResponses?'checked':''}><span><b>${esc(L('Versicle and response in Simple mode','Verset et répons en mode simple'))}</b><small>${esc(L('Optional: contemplation alone does not require a fixed spoken formula. Guided St Alphonsus is unchanged.','Facultatif : la méditation n’exige pas une formule vocale unique. Le parcours guidé de saint Alphonse ne change pas.'))}</small></span></label><p class="aoP435930SourceNote">${esc(L('Praying privately before duly erected Stations, taking part in public Stations, and meditating elsewhere are not identical circumstances for indulgences. Follow the church and the current discipline; this app makes no indulgence determination.','Prier en privé devant un Chemin de Croix légitimement érigé, participer à un Chemin de Croix public et méditer ailleurs ne relèvent pas des mêmes conditions d’indulgences. Suivez les règles de l’Église ; cette application ne juge pas leur accomplissement.'))}</p>${devotionalGuide('stations')}</div></details><section class="aoDevoCard" data-ao-devo-card="station-${i+1}"><header class="aoDevoCardHead"><small class="aoDevoCardNumber">${i+1} / 14</small><h2 class="aoDevoCardTitle">${esc(title)}</h2></header><div class="aoDevoCardScroll" role="region" tabindex="0" aria-label="${esc(title)}">${guideNow(title,action,L('Station '+(i+1)+' of 14','Station '+(i+1)+' sur 14'))}${guided||STATIONS.simpleResponses?stationResponse(vr):''}${stationScripture}${consider}${alph}${ordinary}${stabat}${guideCue(i===13?L('FINISH','TERMINER'):L('MOVE TO THE NEXT STATION','ALLEZ À LA STATION SUIVANTE'),i===13?L('Remain briefly in silence after the Fourteenth Station.','Demeurez brièvement en silence après la quatorzième station.'):L('Move deliberately to the next station. If Stabat Mater is enabled, pray its stanza during the movement.','Allez délibérément à la station suivante. Si le Stabat Mater est activé, récitez sa strophe pendant le déplacement.'))}</div></section>${i===13?`<div class="aoP435930GuideNav aoP435930FinalExit"><button type="button" class="aoP435930Primary" data-p435930-station-finish>${esc(L("Finish devotion","Terminer la dévotion"))}</button></div>`:""}${devotionalSource('St Alphonsus Liguori · traditional XIV Stations',L('Historical English printed method; French prayer rendering awaits independent comparison with a French edition.','Méthode conservée dans un livre anglais ancien ; le texte français reste à comparer avec une édition française.'),'stations')}</main>`
}
// Shared visual structure only. Scripture, historical texts, stage ownership
// and completion/handoff remain with the original devotion modules.
function sourcedDevotionalCard({kind,id,title,index,total,body}){
 return `<section class="aoDevoCard" data-ao-devo-card="${esc(id)}">
 <header class="aoDevoCardHead"><small class="aoDevoCardNumber">${index+1} / ${total}</small><h2 class="aoDevoCardTitle">${esc(title)}</h2></header>
 <div class="aoDevoCardScroll" role="region" aria-label="${esc(title)}">${body}</div>
 </section>`;
}
function sourceWitnessParagraphs(value){
 // Keep original order and wording while exposing paragraphs to the focus
 // system. A line break inside a paragraph is not a new source text.
 return String(value||'').split(/\n\s*\n/).filter(s=>s.trim())
  .map(s=>`<p class="aoP435930WitnessParagraph">${nl(s)}</p>`).join('');
}
async function warmPenitentialPsalmCorpus(){
 if(PEN_CACHE.busy)return;
 PEN_CACHE={busy:true,complete:false,checked:0,failed:[],audit:[],message:''};render();
 const svc=runtime()?.scriptureService;
 for(const p of PENITENTIAL_PSALMS_VULGATE){
  const ref=penitentialPsalmReference(p);
  try{
   if(typeof svc?.load!=='function')throw Error('Canonical Scripture service unavailable');
   const data=await svc.load('psalm',{en:ref,fr:ref,lat:ref},{contextOnly:true});
   const audit=auditPenitentialPsalmResponse(data);
   const deficiencies=Object.entries(audit).filter(([_,x])=>x.verses<4||!x.uniqueOrdered||!x.nonempty||!x.contiguous).map(([name])=>name);
   PEN_CACHE.audit.push({ref,audit});
   if(deficiencies.length)PEN_CACHE.failed.push(ref+' ['+deficiencies.join(', ')+']');
  }catch(e){PEN_CACHE.failed.push(ref+' · '+String(e?.message||e).slice(0,110))}
  PEN_CACHE.checked++;
 }
 PEN_CACHE.busy=false;PEN_CACHE.complete=PEN_CACHE.failed.length===0;
 PEN_CACHE.message=PEN_CACHE.complete?'verified-warm-cache':'incomplete-source-evidence';
 if(view==='penitential')render();
}
function penitentialOfflineControls(){
 const counts=PEN_CACHE.audit.map(x=>`${esc(x.ref)}: EN ${x.audit.en.verses}, FR ${x.audit.fr.verses}, LA ${x.audit.la.verses}`).join(' · ');
 return `<details class="aoP435930PrayerOptions aoBatch03PsalmOffline" data-ao-penitential-offline>
 <summary>${esc(L('All seven Psalms · source and offline access','Sept psaumes · sources et accès hors ligne'))}</summary>
 <p>${esc(L('Only the canonical Catholic Scripture service supplies verses. To prepare these seven chapters for later offline access, load them once while connected. The verification checks verse order and available EN/FR/LA faces; no text is invented. Browser storage may be cleared by the device.',
 'Seul le service biblique catholique canonique fournit les versets. Pour préparer ces sept chapitres à une lecture ultérieure hors connexion, chargez-les d’abord avec Internet. La vérification examine l’ordre et les versions EN/FR/LA disponibles ; aucun texte n’est inventé. Le navigateur peut effacer son cache.'))}</p>
 <button type="button" data-p435930-pen-cache ${PEN_CACHE.busy?'disabled':''}>${esc(PEN_CACHE.busy?L('Checking seven chapters…','Vérification des sept chapitres…'):L('Load and check all seven chapters','Charger et vérifier les sept chapitres'))}</button>
 <p role="status" data-ao-pen-cache-status>${esc(PEN_CACHE.busy?L('Loading validated Scripture texts','Chargement des textes bibliques validés'):PEN_CACHE.checked?L('Chapters checked: ','Chapitres examinés : ')+PEN_CACHE.checked+'/7 · '+(PEN_CACHE.complete?L('All language faces present and ordered','Toutes les versions présentes et ordonnées'):L('Some language faces are missing or need review','Certaines versions manquent ou demandent une vérification')):'')}</p>
 ${PEN_CACHE.audit.length?`<details><summary>${esc(L('Chapter coverage details','Couverture par chapitre'))}</summary><p>${counts}</p></details>`:''}
 ${PEN_CACHE.failed.length?`<p class="aoP435930SourceNote">${esc(PEN_CACHE.failed.join(' · '))}</p>`:''}</details>`;
}
function renderPenitential(){
 const i=Math.max(0,Math.min(6,PEN.step)),p=PEN_PSALMS[i],ref=`Psalms ${p.trad}:1`,modern=p.modern!==p.trad?` (${p.modern})`:'';
 setTimeout(()=>{const t=++PEN.token;loadScriptureInto('[data-p435930-pen-scripture]','psalm',ref,true,()=>PEN.token)},0);
 const title=`Psalm ${p.trad}${modern}`,final=i===6;
 const body=`${scriptureContextCapsule(ref,{french:isFr()})}
  ${guideNow(title,L('Pray this Psalm slowly. Let the words themselves carry the act of repentance; do not rush to the next Psalm when you reach the final verse.','Priez lentement ce Psaume. Laissez les paroles elles-mêmes porter l’acte de pénitence ; ne passez pas immédiatement au Psaume suivant après le dernier verset.'))}
  <div class="aoP435930GuidedScripture" data-p435930-pen-scripture><p class="aoP435930Loading">${esc(L('Loading Scripture…','Chargement de l’Écriture…'))}</p></div>
  ${guideCue(L('PAUSE','PAUSE'),L('Remain briefly in silence after the doxology or final verse, then continue when ready.','Demeurez brièvement en silence après la doxologie ou le dernier verset, puis continuez lorsque vous êtes prêt.'))}`;
 const chapter=sourcedDevotionalCard({kind:'penitential',id:'penitential-'+i,title,index:i,total:PEN_PSALMS.length,body});
 return `${head(L('Seven Penitential Psalms','Sept psaumes pénitentiels'),L('Traditional penitential psalmody · guided sequence','Psalmodie pénitentielle traditionnelle · séquence guidée'))}
 <main class="aoP435930Body aoP435930DevotionalGuidedReader" data-ao-devotional-owner="penitential" data-ao-devotional-final="${final}">
 ${chapter}
 ${final?`<div class="aoP435930GuideNav aoP435930FinalExit"><button type="button" class="aoP435930Primary" data-p435930-pen-litany>${esc(L("Continue with Litany of the Saints","Continuer avec les Litanies des saints"))}</button></div>`:""}
 <details class="aoP435930PrayerOptions aoP435930GuidedContext"><summary>${esc(L('Guide to the traditional sequence','Guide de la séquence traditionnelle'))}</summary>
 ${callout(esc(L('Pray the seven Psalms in their traditional order. The app guides the sequence; it does not add a new penitential prayer around them.','Priez les sept Psaumes dans leur ordre traditionnel. L’application guide la séquence ; elle n’ajoute pas une nouvelle prière pénitentielle autour d’eux.')),'rubric')}${devotionalGuide('penitential')}</details>
 ${penitentialOfflineControls()}
 ${devotionalSource(L('Historical Seven Penitential Psalms sequence','Séquence historique des sept psaumes pénitentiels'),L('The historical books witness the order; the verses are displayed from the separately selected Catholic Scripture edition.','Les livres historiques attestent l’ordre ; les versets proviennent de l’édition biblique catholique choisie séparément.'),'penitential')}
 </main>`;
}
// The downloaded pages contain material *after* the Litany. Extract only the
// bounded historical witness; do not present Psalm 69 and collects as invocations.
async function ensureLitany(){
 if(LIT.sections||LIT.loading)return;
 LIT.loading=true;LIT.error='';
 const token=++LIT.token;
 const witness=LITANY_SOURCE_WITNESSES[lang()]||LITANY_SOURCE_WITNESSES.en;
 try{
  const language=lang();
  const raw=await guidedWsText(witness.title,witness.cacheKey,language);
  if(token!==LIT.token)return;
  let proper;
  try{
   proper=extractLitanyProper(raw,language);
   LIT.sections=paginateLitanyProper(proper,language);
   LIT.review=reviewLitanyTranscription(proper,language);
  }catch(error){
   // A malformed downloaded transcript must never be kept forever in the
   // offline/local witness cache. Evict only this exact historical witness,
   // so Retry is able to fetch and validate it anew on the next attempt.
   try{localStorage.removeItem('ao2:v435930:ws:'+language+':'+witness.cacheKey)}catch{}
   throw error;
  }
  LIT.step=0;LIT.loading=false;render();
 }catch(error){
  if(token!==LIT.token)return;
  LIT.loading=false;LIT.sections=null;LIT.error=String(error?.message||error);render();
 }
}
function litanySourceDisclosure(){
 const witness=LITANY_SOURCE_WITNESSES[lang()]||LITANY_SOURCE_WITNESSES.en;
 const audit=LITANY_WITNESS_REVIEW_V1[lang()]||LITANY_WITNESS_REVIEW_V1.en;
 const suspect=LIT.review?.suspectedReadings||[];
 const note=suspect.length?`<p class="aoP435930SourceNote" data-ao-litany-suspect-readings="${suspect.length}">${esc(L('This historical web transcription contains readings awaiting comparison with the printed facsimile. The original words are shown without silent correction.','Cette transcription historique contient des leçons à vérifier sur le fac-similé imprimé. Le texte est conservé sans correction silencieuse.'))}</p>`:'';
 return `<details class="aoP435930Source"><summary>${esc(L('Historical text and edition','Texte historique et édition'))}</summary>
 <p><a href="${esc(witness.url)}" target="_blank" rel="noopener noreferrer">${esc(witness.label)} ↗</a></p>
 <p><a href="${esc(audit.transcriptionRevision)}" target="_blank" rel="noopener noreferrer">${esc(L('Reviewed transcription revision','Révision du texte consultée'))} ↗</a>${audit.printFacsimile?` · <a href="${esc(audit.printFacsimile)}" target="_blank" rel="noopener noreferrer">${esc(L('1862 printed facsimile','Fac-similé imprimé de 1862'))} ↗</a>`:''}</p>
 <p>${esc(L('Distinct historical witness; not a certified 1962 liturgical edition. Only the Litany proper is displayed, excluding the appended psalm and collects.','Témoin historique distinct ; il ne s’agit pas d’une édition liturgique de 1962 certifiée. Seules les litanies sont affichées, sans le psaume ni les oraisons qui suivent.'))}</p>
 ${note}</details>`;
}
function batch03LitanyUseOptions(){
 const uses=Object.values(BATCH03_LITANY_EDITION_POLICY);
 return `<nav class="aoP435930GuideNav aoBatch03LitanyUses" aria-label="${esc(L('Litany edition and use','Version et usage des litanies'))}">
 ${uses.map(u=>`<button type="button" data-p435930-lit-use="${esc(u.id)}" aria-pressed="${LIT.use===u.id}" class="${LIT.use===u.id?'active':''}">${esc(isFr()?u.labelFr:u.labelEn)}</button>`).join('')}</nav>`;
}
function renderBatch03PublicLitanyReference(){
 const selected=batch03LitanyUse(LIT.use),major=LIT.use==='major';
 const title=L('Litany of the Saints','Litanies des saints');
 const intro=major?
  L('This ICRSP Latin–French witness includes the Major Litanies procession, invocations, prayers and collects. The liturgical text is not the 1883 English private edition nor the 1862 Corneille French edition. Complete line-by-line publication is held pending collation; use the identified original source, not an invented harmonisation.',
    'Ce témoin latin–français de l’ICRSP comprend la procession des Litanies majeures, les invocations, prières et oraisons. Il n’est ni le livre privé anglais de 1883, ni le texte de Corneille de 1862. La publication intégrale attend une collation mot à mot ; consultez le texte original, sans harmonisation inventée.'):
  LIT.use==='vigil'?
   L('The restored Easter Vigil has a distinct shorter litany governed by its own order and responses. The private litany cannot stand in for that rite. Follow the existing Easter Vigil Mass reader when attending the liturgy.',
     'La Vigile pascale restaurée possède ses litanies abrégées propres, régies par leur ordre et leurs répons. Les litanies privées ne remplacent pas ce rite ; suivez le lecteur de la Vigile pascale lors de la célébration.'):
   L('The solemn Forty Hours rite has clergy-led public litanies, processions and prayers when celebrated locally. The existing three-day Forty Hours guide is the correct participant companion; it is not a substitute for the ceremonial book.',
     'Les Quarante-Heures solennelles comportent, lorsqu’elles sont célébrées localement, des litanies, processions et prières publiques conduites par le clergé. Le parcours existant sur trois jours accompagne le fidèle sans remplacer le cérémonial.');
 const sequence=major?`<ol class="aoP435930HistoricalSequence" data-ao-icrsp-major-sequence>${BATCH03_ICRSP_MAJOR_PROCESSION_STEPS.map(x=>`<li><b>${esc(x.id)}</b> · ${esc(isFr()?x.fr:x.en)} <small>${esc(x.role)}</small></li>`).join('')}</ol>`:'';
 const links=major?`<a class="aoP435930SourceLink" href="${esc(BATCH03_LITANY_SOURCE_STATUS.source)}" target="_blank" rel="noopener noreferrer">${esc(L('Open complete ICRSP Latin–French Major Litanies','Ouvrir les Litanies majeures intégrales latin–français de l’ICRSP'))} ↗</a><a class="aoP435930SourceLink" href="${esc(BATCH03_LITANY_EDITION_POLICY.major.additionalSourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(L('Rogations: distinct accompanying rite','Rogations : rite connexe distinct'))} ↗</a>`:
  LIT.use==='forty'? `<button type="button" class="aoP435930Primary" data-p435930-lit-forty>${esc(L('Open the existing Forty Hours guide','Ouvrir le parcours existant des Quarante-Heures'))}</button>`:'';
 return `${head(title,L('Historical editions and liturgical uses','Éditions historiques et usages liturgiques'))}
 <main class="aoP435930Body aoP435930DevotionalGuidedReader" data-ao-litany-use="${esc(selected.id)}">
 ${batch03LitanyUseOptions()}<section class="aoDevoCard"><div class="aoDevoCardScroll"><h2>${esc(isFr()?selected.labelFr:selected.labelEn)}</h2><p>${esc(intro)}</p>
 ${major?`<p class="aoP435930SourceNote">${esc(L('1960 Rubricae generales, n. 82: the Major Litany is not doubled. Historical commentary reproduced with the ICRSP source describes a different repetition practice; it must not automatically control a 1962 ceremony.','Rubriques générales de 1960, n° 82 : les Litanies majeures ne se redoublent pas. Un commentaire historique reproduit avec la source ICRSP décrit une autre pratique ; il ne régit pas automatiquement une cérémonie de 1962.'))}</p>`:''}${sequence}${links}<p><small>${esc(L('Status: distinct 1962 Latin–French public edition not yet locally transcribed or certified. No invented Latin, French or English prayers are displayed.','État : l’édition publique latin–français de 1962 n’est pas encore transcrite ni certifiée localement. Aucune prière latine, française ou anglaise n’est inventée.'))}</small></p></div></section></main>`;
}
function renderLitany(){
 if(LIT.use!=='private')return renderBatch03PublicLitanyReference();
 // A preference change must not retain the other language's historical edition.
 if(LIT.language!==lang()){
  LIT.language=lang();LIT.token++;LIT.sections=null;LIT.review=null;LIT.loading=false;LIT.error='';LIT.step=0;
 }
 if(!LIT.sections&&!LIT.loading&&!LIT.error)setTimeout(ensureLitany,0);
 if(LIT.error)return `${head(L('Litany of the Saints','Litanies des saints'),L('Traditional litany','Litanies traditionnelles'))}<main class="aoP435930Body">${batch03LitanyUseOptions()}${callout(esc(L('The historical text could not be verified or loaded. No substitute is displayed.','Le texte historique n’a pas pu être chargé ou vérifié. Aucun remplacement n’est affiché.')),'warn')}<button type="button" class="aoP435930Secondary" data-p435930-lit-retry>${esc(L('Try again','Réessayer'))}</button>${litanySourceDisclosure()}</main>`;
 if(!LIT.sections)return `${head(L('Litany of the Saints','Litanies des saints'),L('Traditional litany','Litanies traditionnelles'))}<main class="aoP435930Body">${batch03LitanyUseOptions()}<p class="aoP435930Loading">${esc(L('Loading the Litany…','Chargement des Litanies…'))}</p></main>`;
 LIT.step=Math.max(0,Math.min(LIT.sections.length-1,LIT.step));
 const st=LIT.sections[LIT.step],final=LIT.step===LIT.sections.length-1;
 const text=st.lines.map(line=>`<p class="aoP435930LitanyLine">${esc(line)}</p>`).join('');
 const body=`${guideNow(st.title,L('Pray the historical wording in order. In a group, agree who leads the responses; this transcription does not assign every voice.','Priez le texte historique dans l’ordre. En groupe, convenez de la répartition des répons ; cette transcription n’attribue pas chaque voix.'))}
  <article class="aoP435930Prayer ${S.rosary.recitation==='group'?'aoP435930GroupRecitation':''}"><div class="aoP435930Text aoP435930LitanyVerses">${text}</div></article>
  ${guideCue(L('PACE','RYTHME'),L('Leave a small breath between invocations. The repetition is part of the prayer, not text to skim.','Laissez un léger souffle entre les invocations. La répétition fait partie de la prière ; ce n’est pas un texte à parcourir rapidement.'))}`;
 const card=sourcedDevotionalCard({kind:'litany',id:'litany-'+LIT.step,title:st.title,index:LIT.step,total:LIT.sections.length,body});
 return `${head(L('Litany of the Saints','Litanies des saints'),L('Call · response · guided in sections','Invocation · réponse · guidées par sections'))}
 <main class="aoP435930Body aoP435930DevotionalGuidedReader" data-ao-devotional-owner="litany" data-ao-devotional-final="${final}">
 ${batch03LitanyUseOptions()}
 ${card}
 ${final?`<div class="aoP435930GuideNav aoP435930FinalExit"><button type="button" class="aoP435930Primary" data-p435930-lit-done>${esc(L('Finish litany','Terminer les litanies'))}</button></div>`:''}
 <details class="aoP435930PrayerOptions aoP435930GuidedContext"><summary>${esc(L('Recitation and reading guide','Mode de récitation et guide'))}</summary>
 ${nav(L('Recitation','Récitation'),[['individual','Individual','Individuel'],['group','Group','Groupe']],S.rosary.recitation)}${devotionalGuide('litany')}</details>
 ${litanySourceDisclosure()}</main>`;
}
async function ensureSevenWords(){
 if(SEVEN.sections||SEVEN.loading)return;
 SEVEN.loading=true;SEVEN.error='';
 const token=++SEVEN.srcToken;
 try{
  const txt=sevenWordsLocalWitnessText(); // packaged with the app: no Wikisource runtime dependency
  if(token!==SEVEN.srcToken)return;
  const witnessed=parseSevenWordsHistoricalWitness(txt);
  SEVEN.sections=witnessed.sections;SEVEN.appendix=witnessed.appendix;
  SEVEN.loading=false;render();
 }catch(error){
  if(token!==SEVEN.srcToken)return;
  SEVEN.sections=null;SEVEN.appendix='';
  SEVEN.loading=false;SEVEN.error=String(error?.message||error);render();
 }
}
function renderSevenWords(){
 if(!SEVEN.scriptureOnly&&!SEVEN.sections&&!SEVEN.loading&&!SEVEN.error)setTimeout(ensureSevenWords,0);
 const i=Math.max(0,Math.min(6,SEVEN.step)),label=(isFr()?WORD_LABELS.fr:WORD_LABELS.en)[i],ref=WORD_REFS[i];
 setTimeout(()=>{++SEVEN.scriptToken;loadScriptureInto('[data-p435930-word-scripture]','gospel',ref,false,()=>SEVEN.scriptToken)},0);
 const hist=SEVEN.scriptureOnly?'':(SEVEN.sections?.[i]?.text||'');
 const appendix=!SEVEN.scriptureOnly&&i===6&&SEVEN.appendix?`<details class="aoP435930Source aoP435930SevenClosing"><summary>${esc(L('Historical concluding prayers (English)','Prières finales historiques (anglais)'))}</summary><div class="aoP435930Text" lang="en">${nl(SEVEN.appendix)}</div></details>`:'';
 const scripture=`<section class="aoP435930WordHero"><small>${esc(ref)}</small>
  ${scriptureContextCapsule(ref,{french:isFr()})}
  <div data-p435930-word-scripture><p class="aoP435930Loading">${esc(L('Loading Gospel text…','Chargement du texte évangélique…'))}</p></div></section>`;
 const witness=SEVEN.scriptureOnly?'':SEVEN.error
  ?callout(esc(L('The meditation could not be loaded. The Gospel Word remains available; no replacement text is generated.','La méditation n’a pas pu être chargée. La Parole évangélique reste disponible ; aucun texte de remplacement n’est généré.')),'warn')
  :SEVEN.loading&&!SEVEN.sections?`<p class="aoP435930Loading">${esc(L('Loading meditation…','Chargement de la méditation…'))}</p>`
  :hist?`<section class="aoP435930HistoricalFocus"><small>${esc(L('MEDITATION','MÉDITATION'))}</small><div class="aoP435930Text" lang="en">${sourceWitnessParagraphs(hist)}</div>${isFr()?`<p class="aoP435930SourceNote">${esc(L('The source meditation is preserved in English because no vetted French witness is attached to this module.','La méditation source est conservée en anglais, faute de témoin français vérifié rattaché à ce module.'))}</p>`:''}</section>`:'';
 const body=`${guideNow(L('Word '+(i+1),'Parole '+(i+1)),L('Read the Gospel words first. Stay with Christ’s words before moving into the historical meditation.','Lisez d’abord les paroles de l’Évangile. Demeurez avec les paroles du Christ avant de passer à la méditation historique.'))}
 ${scripture}<div class="aoP435930Seg" role="group" aria-label="${esc(L('Contemplation method','Méthode de contemplation'))}"><button type="button" data-p435930-word-method="scripture" aria-pressed="${SEVEN.scriptureOnly}">${esc(L('Scripture and silence','Écriture et silence'))}</button><button type="button" data-p435930-word-method="historical" aria-pressed="${!SEVEN.scriptureOnly}">${esc(L('Historical meditation','Méditation historique'))}</button></div>${witness}
 ${guideCue(L('SILENCE','SILENCE'),L('When the meditation has ended, stop reading. Remain with this Word before advancing to the next.','Lorsque la méditation est terminée, cessez de lire. Demeurez avec cette Parole avant de passer à la suivante.'))}`;
 const card=sourcedDevotionalCard({kind:'sevenWords',id:'word-'+(i+1),title:label,index:i,total:WORD_REFS.length,body});
 return `${head(L('Seven Words of Our Lord','Sept Paroles de Notre-Seigneur'),L('Gospel word · historical meditation · silence','Parole évangélique · méditation historique · silence'))}
 <main class="aoP435930Body aoP435930DevotionalGuidedReader" data-ao-devotional-owner="sevenWords" data-ao-devotional-final="${i===6}">
 ${card}
 ${i===6?`<div class="aoP435930GuideNav aoP435930FinalExit"><button type="button" class="aoP435930Primary" data-p435930-word-done>${esc(L('Finish devotion','Terminer la dévotion'))}</button></div>`:''}
 <details class="aoP435930PrayerOptions aoP435930GuidedContext"><summary>${esc(L('Historical meditation guide','Guide de la méditation historique'))}</summary>${devotionalGuide('sevenWords')}</details>
 <details class="aoP435930Source"><summary>${esc(L('Historic French Seven Words · separate source (research)','Sept Paroles historiques françaises · source distincte (recherche)'))}</summary><p>${esc(L('Berthaumier’s 1854 French translation of a distinct St Bonaventure-attributed seven-word method is documented, but has not yet been independently collated against all printed pages; it is not a translation of the Baltimore text.','La traduction française de Berthaumier (1854) d’une méthode distincte des sept Paroles, attribuée à saint Bonaventure, est identifiée mais non encore collationnée sur toutes les pages imprimées. Il ne s’agit pas de la traduction du texte de Baltimore.'))}</p><a href="https://fr.wikisource.org/wiki/Livre:%C5%92uvres_spirituelles_de_S._Bonaventure,_tome_1,_1854.djvu" target="_blank" rel="noopener noreferrer">${esc(L('1854 original scanned edition','Édition originale numérisée de 1854'))}</a></details>\n ${devotionalSource('Baltimore Manual · The Devotion of the Seven Words upon the Cross',L('English historical witness packaged locally from Wikisource transcription. Independent print-page collation remains pending. Gospel text is separate; concluding prayers follow the Seventh Word as a distinct appendix.','Témoin anglais historique conservé localement d’après une transcription Wikisource ; comparaison avec l’édition imprimée à achever. Le texte biblique est distinct ; les prières finales forment une annexe.'),'sevenWords')}${appendix}</main>`;
}
const FORTY_STAGES=[['Arrive','Arriver'],['Adore','Adorer'],['Prayer aids','Aides de prière'],['Public devotion','Dévotion publique'],['Benediction','Bénédiction'],['Leave','Partir']];
function fortyStageBody(){
 const i=FORTY.step;if(i===0)return `${guideNow(L('Arrive and recollect','Arriver et se recueillir'),L('Enter quietly, acknowledge the Blessed Sacrament, and let the movement of arrival end before choosing any private prayer. Forty Hours is a church devotion already in progress; the app does not start it for you.','Entrez calmement, saluez le Saint-Sacrement et laissez s’achever le mouvement de l’arrivée avant de choisir une prière privée. Les Quarante-Heures sont une dévotion ecclésiale déjà en cours ; l’application ne la commence pas pour vous.'))}${guidePrayers([{id:'foundations_act_of_faith'},{id:'foundations_prayer_of_adoration'}])}${guideCue(L('NOTICE','ATTENTION'),L('Look at what is actually happening in the church before selecting a private devotion.','Regardez ce qui se passe réellement dans l’église avant de choisir une dévotion privée.'))}`;
 if(i===1)return `${guideNow(L('Remain in adoration','Demeurer en adoration'),L('Silence is sufficient. Stay before Christ without trying to fill the whole visit with material.','Le silence suffit. Demeurez devant le Christ sans chercher à remplir toute la visite de contenu.'))}${guideCue(L('SILENCE','SILENCE'),L('If silence becomes difficult, use the next stage for a traditional prayer aid rather than endlessly adding material.','Si le silence devient difficile, utilisez l’étape suivante pour une aide de prière traditionnelle plutôt que d’ajouter sans cesse du contenu.'))}`;
 if(i===2)return `${guideNow(L('Use a traditional prayer aid if needed','Utiliser une aide traditionnelle si nécessaire'),L('Choose one aid and pray it attentively. You do not need to complete every item.','Choisissez une seule aide et priez-la attentivement. Vous n’avez pas à tout accomplir.'))}<div class="aoP435930GuideChoices"><button type="button" class="aoP435930Secondary" data-p435930-forty-own="pray.adoration" data-p435930-forty-ador="visit">${esc(L('Guided Visit to the Blessed Sacrament','Visite guidée au Saint-Sacrement'))}</button><button type="button" class="aoP435930Secondary" data-p435930-forty-own="pray.litany_saints">${esc(L('Private Litany of the Saints','Litanies des saints · prière privée'))}</button><button type="button" class="aoP435930Secondary" data-p435930-forty-own="pray.penitential_psalms" data-p435930-forty-psalm="3">Miserere · Psalm 50</button><button type="button" class="aoP435930Secondary" data-p435930-forty-own="pray.rosary">${esc(L('Rosary / Litany of Loreto','Rosaire / Litanies de Lorette'))}</button><button type="button" class="aoP435930Secondary" data-p435930-handoff="pray.holy_name_litany">${esc(L('Litany of the Holy Name','Litanies du Saint Nom'))}</button></div>${guideCue(L('RETURN','REVENIR'),L('After the chosen prayer, return to quiet adoration rather than immediately choosing another.','Après la prière choisie, revenez à l’adoration silencieuse plutôt que d’en choisir immédiatement une autre.'))}`;
 if(i===3)return `${guideNow(L('Yield to the public devotion','Céder la place à la dévotion publique'),L('If clergy lead prayers, a sermon, procession, hymn or other part of the Forty Hours observance, stop the private guide and participate in what the Church is doing in front of you.','Si le clergé conduit des prières, un sermon, une procession, un hymne ou une autre partie des Quarante-Heures, arrêtez le guide privé et participez à ce que l’Église accomplit devant vous.'))}${callout(esc(L('In the historical solemn Roman Forty Hours order, opening or reposition may include the Litany of the Saints, Psalm 69 (Deus, in adiutorium) and proper Forty Hours prayers. These are public ceremonial texts: follow the book and clergy actually being used in the church rather than substituting the app’s ordinary private Litany.','Dans l’ordre romain solennel historique des Quarante-Heures, l’ouverture ou la reposition peuvent comprendre les Litanies des saints, le psaume 69 (Deus, in adiutorium) et des oraisons propres aux Quarante-Heures. Ce sont des textes du cérémonial public : suivez le livre et le clergé effectivement employés dans l’église au lieu de substituer les Litanies privées ordinaires de l’application.')),'rubric')}${guideCue(L('WAIT FOR THE CHURCH','ATTENDRE L’ÉGLISE'),L('The pace and public text belong to the actual observance, not to the app.','Le rythme et le texte public appartiennent à l’observance réelle, non à l’application.'))}`;
 if(i===4)return `${guideNow(L('When Benediction begins','Lorsque la Bénédiction commence'),L('Switch from private adoration to the live Benediction companion. Advance there only when the corresponding action happens in the church.','Passez de l’adoration privée au compagnon de Bénédiction en direct. N’avancez là-bas que lorsque l’action correspondante se produit dans l’église.'))}<button type="button" class="aoP435930Primary" data-p435930-forty-ben>${esc(L('Follow Benediction','Suivre la Bénédiction'))}</button>`;
 return `${guideNow(L('Leave recollected','Partir recueilli'),L('Before leaving, give thanks, make your final act of reverence, and carry the recollection of the visit back into your duties.','Avant de partir, rendez grâce, faites votre dernier acte de révérence et emportez le recueillement de la visite dans vos devoirs.'))}${guidePrayers([{id:'foundations_act_of_love'}])}${guideCue(L('RETURN TO DUTY','RETOUR AU DEVOIR'),L('Do not turn the exit into another checklist. Finish simply and go.','Ne transformez pas la sortie en nouvelle liste de contrôle. Terminez simplement et partez.'))}`
}
function renderFortySolemn(){
 const total=FORTY_HOURS_SOLEMN_STAGES.length;
 FORTY.solemnStep=Math.max(0,Math.min(total-1,FORTY.solemnStep));
 const st=fortySolemnAt(FORTY.solemnStep),i=FORTY.solemnStep;
 const label=L(st.titleEn,st.titleFr),desc=L(st.bodyEn,st.bodyFr);
 const calendar=[1,2,3].map(day=>{
  const first=FORTY_HOURS_SOLEMN_STAGES.findIndex(x=>x.day===day);
  return `<button type="button" class="aoP435930Secondary" data-p435930-forty-solemn-jump="${first}" aria-pressed="${st.day===day}">${esc(L('Day ','Jour ')+day)}</button>`;
 }).join("");
 const next=i<total-1?`<button type="button" data-p435930-forty-solemn-next>${esc(L('Next actual stage','Étape suivante réelle'))}</button>`:`<button type="button" data-p435930-forty-choose>${esc(L('Back to choices','Retour aux choix'))}</button>`;
 const actions=st.id==="day3-benediction"
 ?`<button type="button" class="aoP435930Primary" data-p435930-forty-ben>${esc(L('Follow live Benediction','Suivre la Bénédiction en direct'))}</button>`
 :st.kind==="participant"?`<button type="button" class="aoP435930Secondary" data-p435930-forty-own="pray.adoration" data-p435930-forty-ador="open">${esc(L('Open silent Adoration','Ouvrir l’adoration silencieuse'))}</button>`:"";
 return `${head(L('Solemn Forty Hours','Quarante-Heures solennelles'),L('Participant’s three-day ceremonial reference','Repères des cérémonies publiques sur trois jours'))}
 <main class="aoP435930Body aoP435930SolemnReader" data-ao-forty-mode="solemn" data-ao-forty-day="${st.day}" data-ao-forty-stage="${esc(st.id)}">
 <button type="button" class="aoP435930InlineBack" data-p435930-forty-choose>${esc(L('Choose another way to follow','Changer de parcours'))}</button>
 <p>${esc(L('A sourced historical guide, not a parish timetable or a replacement for the clergy’s ceremonial book. The order shown is indicative; follow the local church whenever it differs.','Guide historique sourcé, non horaire paroissial ni substitut au cérémonial du clergé. L’ordre affiché est indicatif ; suivez votre église s’il diffère.'))}</p>
 <nav class="aoFortySolemnControls" style="display:flex;gap:8px;flex-wrap:wrap" aria-label="${esc(L('Three days','Trois jours'))}">${calendar}</nav>
 <section class="aoDevoCard" data-ao-devo-card="solemn-${esc(st.id)}">
 <header class="aoDevoCardHead"><small>${esc(L('Day ','Jour ')+st.day)} · ${i+1} / ${total}</small><h2 class="aoDevoCardTitle">${esc(label)}</h2></header>
 <div class="aoDevoCardScroll" role="region" aria-label="${esc(label)}"><p>${esc(desc)}</p><p><small>${esc(st.kind==="public"?L('Clergy-led public ceremony','Cérémonie publique du clergé'):st.kind==="participant"?L('Participant / private adoration','Fidèle / adoration privée'):L('Historical context','Contexte historique'))} ${st.conditional?L('· only if held locally','· si célébré localement'):''}</small></p>${actions}</div></section>
 <nav class="aoFortySolemnControls" style="display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap" aria-label="${esc(L('Ceremonial navigation','Navigation cérémonielle'))}"><button type="button" data-p435930-forty-solemn-prev ${i===0?'disabled':''}>${esc(L('Previous','Précédent'))}</button>${next}</nav>
 <p class="aoP435930FeastSource"><a href="${esc(FORTY_HOURS_SOLEMN_SOURCE.institute)}" target="_blank" rel="noopener noreferrer">${esc(L('ICKSP · Forty Hours historical structure','ICRSP · Déroulement historique des Quarante-Heures'))} ↗</a></p>
 <details class="aoP435930PrayerOptions"><summary>${esc(L('Ceremonial source and limits','Sources et limites cérémonielles'))}</summary><p>${esc(L('The Institute describes opening and closing votive Masses, a Mass for Peace on the second day, public Litany and processions in the complete solemn observance. Exact order and proper prayers await a verified local ceremonial witness. The app never asks a lay person to perform the public blessing.','L’Institut décrit les messes votives d’ouverture et de clôture, la messe pour la paix au deuxième jour, les litanies et processions publiques dans la forme solennelle complète. L’ordre exact et les prières propres exigent un cérémonial local vérifié. L’application n’attribue jamais au fidèle la bénédiction publique.'))}</p></details></main>`;
}
function renderFortyHours(){
 if(FORTY.mode==='choose')return `${head(L('Forty Hours','Quarante-Heures'),L('Choose the experience appropriate to your visit','Choisissez le parcours adapté à votre visite'))}<main class="aoP435930Body aoP435930AdorationReader" data-ao-forty-mode="choose"><div class="aoP435930BigGrid"><button type="button" data-p435930-forty-mode="visitor"><b>${esc(L('Visiting the Forty Hours','Visiter les Quarante-Heures'))}</b><span>${esc(L('The existing six-stage quiet companion for an individual visit.','Le parcours silencieux existant en six étapes pour une visite personnelle.'))}</span></button><button type="button" data-p435930-forty-mode="solemn"><b>${esc(L('Following the solemn Forty Hours','Suivre les Quarante-Heures solennelles'))}</b><span>${esc(L('Three-day guide to public ceremonies, with local variations.','Parcours sur trois jours des cérémonies publiques et variantes locales.'))}</span></button></div>${devotionalSource('Baltimore Manual · Forty Hours (1889)',L('Historical account and private prayer aids. Not a universal ceremonial timetable.','Présentation historique et aides de prière privées, non un horaire cérémoniel universel.'),'fortyHours')}</main>`;
 if(FORTY.mode==='solemn')return renderFortySolemn();
 FORTY.step=Math.max(0,Math.min(FORTY_STAGES.length-1,FORTY.step));
 const index=FORTY.step,title=L(FORTY_STAGES[index][0],FORTY_STAGES[index][1]);
 const card=sourcedDevotionalCard({kind:'fortyHours',id:'forty-'+index,title,index,total:FORTY_STAGES.length,
   body:fortyStageBody()});
 return `${head(L('Forty Hours','Quarante-Heures'),L('Live companion · follow the church, not a timer','Compagnon en direct · suivez l’église, pas un minuteur'))}
 <main class="aoP435930Body aoP435930DevotionalGuidedReader" data-ao-devotional-owner="fortyHours" data-ao-devotional-final="${index===FORTY_STAGES.length-1}">
 ${card}
 ${index===FORTY_STAGES.length-1?`<div class="aoP435930GuideNav aoP435930FinalExit"><button type="button" class="aoP435930Primary" data-p435930-forty-done>${esc(L("Done · return","Terminé · retour"))}</button></div>`:""}
 <details class="aoP435930PrayerOptions aoP435930GuidedContext"><summary>${esc(L('Public-rite guidance and sources','Guide du rite public et sources'))}</summary>
 ${callout(esc(L('Use this by what is happening around you, not by a timer. Public worship always outranks the private sequence on the screen.','Utilisez ce guide selon ce qui se passe autour de vous, non par un minuteur. Le culte public a toujours priorité sur la séquence privée affichée à l’écran.')),'rubric')}${devotionalGuide('fortyHours')}</details>
 ${devotionalSource('Baltimore Manual · Forty Hours (1889)',L('Historical account and private prayer aids. This is not an original witness of every public Forty Hours ceremonial or a claim that old indulgence grants remain current.','Présentation historique et aides de prière privées. Ce document ne certifie ni tous les cérémoniaux publics ni le maintien actuel des anciennes indulgences.'),'fortyHours')}</main>`;
}
function setTenebrae(day=TEN.day,hour=TEN.hour){
 TEN.epoch++;const nextDay=Math.max(0,Math.min(2,Number(day)||0));
 if(nextDay!==TEN.day)TEN.ceremony=freshTenebraeCeremony();
 TEN.day=nextDay;
 TEN.hour=hour==="LAUDS"?"LAUDS":"MATINS";TEN.step=0;
 TEN.model=null;TEN.error=null;TEN.loading=false;render();
}
async function ensureTenebrae(){
 if(view!=='tenebrae'||TEN.model||TEN.loading||TEN.error)return;
 const token=++TEN.epoch;
 TEN.loading=true;
 try{
  const result=await loadTenebraeHour({dayIndex:TEN.day,hour:TEN.hour});
  if(token!==TEN.epoch)return;
  TEN.model=result;TEN.error=null;
 }catch(error){
  if(token!==TEN.epoch)return;
  TEN.error=String(error?.message??error);
  console.error("Tenebrae local 1960 Office source invalid",error);
 }finally{
  if(token===TEN.epoch){TEN.loading=false;if(view==='tenebrae')render()}
 }
}
function renderTenebrae(){
 if(!TEN.model&&!TEN.loading&&!TEN.error)setTimeout(()=>void ensureTenebrae(),0);
 return head(L('Office of Tenebrae','Office des Ténèbres'),L('Triduum · Matins and Lauds','Triduum · Matines et Laudes'))+
  renderTenebraeBody({day:TEN.day,hour:TEN.hour,index:TEN.step,face:TEN.face,
   french:isFr(),data:TEN.model,loading:TEN.loading,error:TEN.error,guided:TEN.guided,ceremony:TEN.ceremony});
}
/**
 * One guided devotional lane, not a different Stations method.
 * Fixed original prayers are reused via canonical source IDs. The five
 * Hail Marys follow the five sets in the Raccolta recension; contemporary
 * instructions that place these between sets are alternative descriptions.
 * Historical indulgence/grant language is never displayed or asserted.
 */
function renderFiveWounds(){
 const index=Math.max(0,Math.min(29,FIVE_WOUNDS.index));FIVE_WOUNDS.index=index;
 const langCode=FIVE_WOUNDS.latin?'la':(isFr()?'fr':'en');
 const step=fiveWoundsStep(index,langCode);
 const progress=fiveWoundsGroupProgress(index);
 if(!step)return callout(esc(L('Verified prayer unavailable.','Prière vérifiée indisponible.')),'warn');
 const dots=FIVE_WOUNDS_WOUNDS_V1.map((w,i)=>{
  const label=isFr()?w.fr:w.en;
  return '<button type="button" data-p435930-five-wound="'+i+'" class="'+
   (progress.group===i+1?'active':'')+'" '+(progress.group===i+1?'aria-current="step"':'')+
   ' aria-label="'+esc(label)+'" title="'+esc(label)+'">'+
   '<span aria-hidden="true"></span><small>'+esc(label)+'</small></button>';
 }).join('');
 const beads=Array.from({length:6},(_,i)=>'<span class="'+(progress.position===i+1?'current':'')+
  (i===5?' ave':'')+'" aria-hidden="true"></span>').join('');
 const prayerLabel=step.kind==='gloria'
  ?L('Glory Be · prayer of praise','Gloria Patri · prière de louange')
  :L('Hail Mary · Our Lady of Sorrows','Ave Maria · Notre-Dame des Douleurs');
 const nature=step.kind==='gloria'
  ?L('Meditate on this wound. Pray the Glory Be.','Méditez cette plaie. Récitez le Gloire au Père.')
  :L('Offer one Hail Mary in honour of Our Lady of Sorrows.','Récitez un Je vous salue Marie en l’honneur de Notre-Dame des Douleurs.');
 const prev=index>0?'<button type="button" data-p435930-five-prev>'+esc(L('Previous','Précédent'))+'</button>':'';
 const finish=step.isLast;
 const next='<button type="button" class="primary" '+(finish?'data-p435930-five-finish':'data-p435930-five-next')+'>'+
  esc(finish?L('Finish chaplet','Terminer le chapelet'):L('Next prayer','Prière suivante'))+'</button>';
 const langButton='<button type="button" data-p435930-five-latin aria-pressed="'+String(FIVE_WOUNDS.latin)+
  '" aria-label="'+esc(FIVE_WOUNDS.latin?L('Return to vernacular prayer','Revenir à la prière vernaculaire'):L('Pray in Latin','Prier en latin'))+'">'+
  esc(FIVE_WOUNDS.latin?L('EN / FR','EN / FR'):'LATIN')+'</button>';
 return head(L('Chaplet of the Five Wounds','Chapelet des Cinq Plaies'),L('A meditation on the Passion · five wounds','Méditation de la Passion · cinq plaies'))+
 '<main class="aoP435930Body aoFiveWounds" data-ao-five-wounds-reader>'+
 '<header><p class="aoFiveWoundsEyebrow">'+esc(L('PASSION · TRADITIONAL CHAPLET','PASSION · CHAPELET TRADITIONNEL'))+
 '</p><h2>'+esc(step.wound)+'</h2><p>'+esc(nature)+'</p></header>'+
 '<nav class="aoFiveWoundsRail" aria-label="'+esc(L('The five wounds','Les cinq plaies'))+'">'+dots+'</nav>'+
 '<div class="aoFiveWoundsProgress" role="progressbar" aria-valuemin="0" aria-valuemax="30" aria-valuenow="'+
  progress.completed+'" aria-label="'+esc(L('Chaplet progress','Progression du chapelet'))+'"><span style="width:'+
  Math.round(progress.completed/30*100)+'%"></span></div>'+
 '<div class="aoFiveWoundsBeads" aria-label="'+esc(L('Five Glory Bes, then a Hail Mary','Cinq Gloria Patri, puis un Ave Maria'))+'">'+beads+'</div>'+
 '<article class="aoFiveWoundsPrayer" tabindex="0"><div class="aoFiveWoundsPrayerTop"><small>'+
 esc(prayerLabel)+'</small>'+langButton+'</div><p class="aoFiveWoundsPrayerText" lang="'+
 esc(langCode)+'">'+nl(step.text)+'</p></article>'+
 '<footer class="aoFiveWoundsActions">'+prev+next+'</footer>'+
 '<details class="aoFiveWoundsSource"><summary>'+esc(L('Historical form & sources','Forme historique et sources'))+
 '</summary><p>'+esc(L('Five groups of five Glory Bes; after each group one Hail Mary in honour of Our Lady of Sorrows. This is a private devotional chaplet, not the Stations of the Cross.',
 'Cinq groupes de cinq Gloria Patri ; à la fin de chaque groupe, un Ave Maria en l’honneur de Notre-Dame des Douleurs. Il s’agit d’un chapelet privé, distinct du Chemin de Croix.'))+
 '</p><p>'+esc(L('Historical indulgence provisions are not represented as current grants. Blessed physical beads or special medals are not prerequisites for praying here.',
 'Les concessions anciennes d’indulgences ne sont pas présentées comme actuelles. Aucun chapelet matériel béni ni médaille particulière n’est exigé pour cette prière.'))+'</p>'+
 FIVE_WOUNDS_SOURCE_V1.sources.map((url,i)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+
 esc(i?L('Raccolta source text','Texte de la Raccolta'):L('Passionist historical archive','Archives historiques passionistes'))+'</a>').join('')+
 '</details></main>';
}
function renderMercy(){
 const steps=divineMercySteps({includeClosing:MERCY.includeClosing});
 const index=Math.max(0,Math.min(MERCY.step,steps.length-1));MERCY.step=index;
 const item=steps[index],fr=isFr(),language=fr?'fr':'en';
 const groupTitle={opening:L('Opening prayers','Prières initiales'),'large-bead':L('Large bead','Gros grain'),'small-bead':L('Small bead','Petit grain'),conclusion:L('Closing invocations','Invocations finales'),'optional-conclusion':L('Optional closing prayer','Prière finale facultative')}[item.group];
 const chapters=mercyChapters(steps,{french:fr});
 const activeChapter=chapters.find(x=>index>=x.start&&index<x.start+x.entries.length)||chapters[0];
 const chapterIndex=chapters.indexOf(activeChapter);
 const prayerParagraphs=activeChapter.entries.map(({index:stepIndex,step})=>{
  const selected=stepIndex===index;
  const marker=step.decade
   ?(step.group==='large-bead'?L('Large bead','Gros grain'):L('Small bead ','Petit grain ')+step.bead)
   :L('Prayer ','Prière ')+(stepIndex+1);
  return '<article tabindex="0" class="aoMercyLine aoDevoParagraph'+(selected?' aoMercyPrayer':'')+'" data-ao-mercy-step="'+stepIndex+'" data-ao-devo-active="'+selected+'"><small>'+esc(marker)+'</small><p>'+esc(mercyStepText(step,language))+'</p></article>';
 }).join('');
 const note=item.group==='large-bead'?L('Pray once on the large bead.','Récitez une fois sur le gros grain.'):item.group==='small-bead'?L('Pray on each of the ten small beads.','Récitez sur chacun des dix petits grains.'):item.group==='conclusion'?L('Repeat three times.','Répétez trois fois.'):'';
 return `${head(L('Chaplet of Divine Mercy','Chapelet de la Divine Miséricorde'),L('Five decades · St Faustina, 1935','Cinq dizaines · Sainte Faustine, 1935'))}<main class="aoP435930Body aoMercyReader" data-ao-mercy-deck="chapters-v1" data-ao-mercy-bead-reader="quiet-v1"><details class="aoMercyOptional aoBatch02MercyOpenings" data-ao-mercy-opening-options><summary>${esc(L('Optional prayers before the Chaplet · St Faustina','Prières facultatives avant le chapelet · sainte Faustine'))}</summary><p>${esc(L('These are additional opening devotions, not new rosary beads. The original prayer wording is available at the official source; modern English translations are not reproduced without permission or independent reuse rights. French and Latin are not fabricated.','Ces prières préliminaires sont facultatives et ne constituent pas de nouveaux grains. Le texte se consulte dans sa source officielle ; aucune traduction française ou latine n’est inventée.'))}</p>${MERCY_OPTIONAL_OPENINGS.map(x=>`<p><a href="${esc(x.source)}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a> · ${esc(x.diary)} <small>EN · ${esc(L('source-only','lien vers la source'))}</small></p>`).join('')}</details>${mercyBeadNavHTML(steps,index,{french:fr})}<section class="aoDevoCard" data-ao-devo-card="${esc(activeChapter.id)}"><header class="aoDevoCardHead"><h2 class="aoDevoCardTitle">${esc(activeChapter.title)}</h2></header><div class="aoDevoCardScroll" role="region" aria-label="${esc(activeChapter.title)}">${prayerParagraphs}</div></section><p class="aoMercyNote">${esc(note)}</p>${MERCY.guide==='guided'?'<p class="aoMercyHelp">'+esc(L('Contemplate the sorrowful Passion of Our Lord and pray for the whole world. Continue at your own pace.','Méditez la douloureuse Passion de Notre-Seigneur et priez pour le monde entier. Avancez à votre rythme.'))+'</p>':''}<details class="aoMercyOptional" data-ao-mercy-options ${MERCY.optionsOpen?"open":""}><summary>${esc(L("Prayer options","Options de prière"))}<small>${esc(L("Guidance and concluding prayer","Guide et prière finale"))}</small></summary><div class="aoMercyOptions"><button type="button" data-p435930-mercy-guide aria-pressed="${MERCY.guide==='guided'}">${esc(L('Guided explanation','Explication guidée'))}</button><button type="button" data-p435930-mercy-closing aria-pressed="${MERCY.includeClosing}">${esc(L('Optional concluding prayer','Prière finale facultative'))}</button></div></details><p class="aoMercySource"><a href="${esc(MERCY_WITNESSES[language])}" target="_blank" rel="noopener noreferrer">${esc(L('Original published prayer sequence','Texte et ordre publiés'))} ↗</a></p></main>`;
}
function renderRosaryMethods(){
 const allowed=['ordinary','dominican','montfort','montfort_short','scriptural'];
 const choices={
  ordinary:[L('Traditional','Traditionnel'),L('The traditional prayers and mysteries.','Les prières et mystères traditionnels.')],
  dominican:[L('Dominican','Dominicain'),L('Dominican opening and conclusion.','Ouverture et conclusion dominicaines.')],
  montfort:[L('Montfort · first method','Montfort · première méthode'),L('Offer each decade and ask for its spiritual fruit (adapted).','Offrir chaque dizaine et demander son fruit spirituel (adaptation).')],
  montfort_short:[L('Montfort · second method','Montfort · deuxième méthode'),L('Mystery clausules inserted into the Hail Mary.','Clausules des mystères insérées dans l’Ave Maria.')],
  scriptural:[L('Scripture-linked','Avec les Écritures'),L('Guided meditations with original biblical readings.','Méditations guidées et lectures bibliques originales.')]
 };
 const method=allowed.includes(ROSARY_CHOOSER.method)?ROSARY_CHOOSER.method:'ordinary',
  methodData=ROSARY_METHODS[method],decades=method==='ordinary'&&ROSARY_CHOOSER.decades===15?15:5;
 const methods=allowed.map(id=>{
  const active=id===method;
  return '<button type="button" class="aoRosaryChoice'+(active?' active':'')+'" data-p435930-rosary-choose="'+esc(id)+'" aria-pressed="'+active+'"><strong>'+esc(choices[id][0])+'</strong><small>'+esc(choices[id][1])+'</small></button>';
 }).join('');
 const size=[5,15].map(count=>'<button type="button" data-p435930-rosary-decades="'+count+'" aria-pressed="'+(decades===count)+'"'+(count===15&&method!=='ordinary'?' disabled':'')+'>'+esc(count===5?L('Five decades','Cinq dizaines'):L('Fifteen decades','Quinze dizaines'))+'</button>').join('');
 const depths=['simple','guided'].map(mode=>'<button type="button" data-p435930-rosary-guidance="'+mode+'" aria-pressed="'+(ROSARY_CHOOSER.guide===mode)+'"'+(method==='scriptural'&&mode==='simple'?' disabled':'')+'>'+esc(mode==='simple'?L('Simple','Simple'):L('Guided','Guidé'))+'</button>').join('');
 const chosenDepth=ROSARY_CHOOSER.guide==='guided'?L('Guided reading','Lecture guidée'):L('Simple reading','Lecture simple');
 return `${head(L('Holy Rosary','Saint Rosaire'),L('Choose how to pray','Choisissez comment prier'))}
 <main class="aoP435930Body aoMercyMethods aoRosaryChooser" data-ao-rosary-chooser>
  <section class="aoRosaryReady" aria-label="${esc(L('Selected Rosary prayer','Rosaire choisi'))}">
    <p class="aoMercyKicker">${esc(L('Ready to pray','Prêt à prier'))}</p>
    <h2>${esc(choices[method][0])}</h2>
    <p class="aoRosaryReadyChoice">${esc(decades===15?L('Fifteen decades','Quinze dizaines'):L('Five decades','Cinq dizaines'))} · ${esc(chosenDepth)}</p>
    <p class="aoRosaryReadyDescription">${esc(choices[method][1])}</p>
    <button type="button" class="aoRosaryBegin" data-p435930-rosary-begin>${esc(L('Begin Rosary','Commencer le Rosaire'))}</button>
  </section>
  <p class="aoRosarySourceCurrent"><a href="${esc(methodData.source)}" target="_blank" rel="noopener noreferrer">${esc(L('Source for the chosen method','Source de la méthode choisie'))} ↗</a>${method==='montfort'?'<small>'+esc(L('Adapted devotional wording; not a literal translation.','Formulation dévotionnelle adaptée, non traduction littérale.'))+'</small>':method==='montfort_short'?'<small>'+esc(L('Original French clauses; English and Latin editorial translations.','Clausules françaises originales ; versions anglaise et latine éditoriales.'))+'</small>':method==='scriptural'?'<small>'+esc(L('Editorial Scripture-linked method: approved Douay–Rheims/CPDV and Crampon 1923 verse registry. The 2002 apostolic letter is later commentary, not the historical source.','Méthode éditoriale liée aux Écritures : registre approuvé Douay–Rheims/CPDV et Crampon 1923. La lettre de 2002 est un commentaire ultérieur, non la source historique.'))+'</small>':''}</p>
  <button type="button" class="aoRosaryCustomizeToggle" data-p435930-rosary-customize aria-expanded="${ROSARY_CHOOSER.optionsOpen?'true':'false'}" aria-controls="ao-rosary-chooser-options">${esc(L('Change method, duration or reading','Changer méthode, durée ou lecture'))}<span aria-hidden="true">${ROSARY_CHOOSER.optionsOpen?'−':'+'}</span></button>
  <div id="ao-rosary-chooser-options" class="aoRosaryCustomPanel" ${ROSARY_CHOOSER.optionsOpen?'':'hidden'}>
  <section><p class="aoMercyKicker">${esc(L('Prayer method','Méthode de prière'))}</p><div class="aoRosaryChoiceGrid" role="group" aria-label="${esc(L('Rosary method','Méthode du Rosaire'))}">${methods}</div></section>
  <section class="aoRosaryChooserOptions"><p class="aoMercyKicker">${esc(L('Duration','Durée'))}</p><div class="aoMercyOptions" role="group" aria-label="${esc(L('Number of decades','Nombre de dizaines'))}">${size}</div>${method!=='ordinary'?'<small>'+esc(L('The complete fifteen-decade journey is available with Traditional for now.','Le parcours de quinze dizaines est pour l’instant disponible avec Traditionnel.'))+'</small>':''}</section>
  <section class="aoRosaryChooserOptions"><p class="aoMercyKicker">${esc(L('Reading','Lecture'))}</p><div class="aoMercyOptions" role="group" aria-label="${esc(L('Reading guidance','Accompagnement'))}">${depths}</div></section>
  <details class="aoRosaryHeld"><summary>${esc(L('Other historical clausules','Autres clausules historiques'))}</summary><p>${esc(L('Separate editions are still being collated and are not yet available as a live method.','Les autres éditions sont en cours de vérification et ne sont pas encore disponibles en lecture.'))} <a href="${esc(ROSARY_METHODS.clausules.source)}" target="_blank" rel="noopener noreferrer">${esc(L('Research source','Source de recherche'))} ↗</a></p></details>
  </div>
 </main>`;
}
// Keep customization visible and keyboard focus on the same native control
// when the chooser rerenders after a method, decade or reading change.
function refreshRosaryChoiceFocus(attribute,value){
 render();
 queueMicrotask(()=>{
  const host=mount(),node=host?.querySelector?.('['+attribute+'="'+value+'"]');
  node?.focus?.({preventScroll:true});
 });
}
function installLibraryParagraphFocus(m,id){
 const card=m.querySelector(".aoP435930LibraryReader .aoDevoCard");
 if(!card||!id)return;
 // The existing Prayer coherence engine already recognises proper prose,
 // versicles, responses and stanza breaks. Reuse its semantic output instead
 // of reparsing the prayer and erasing V./R. ownership.
 window.AO_PRAY_COHERENCE_V435930?.decorate?.();
 const lines=card.querySelectorAll(
  ".aoP435930Prayer .aoP435930SemanticFace > :not(.aoP435930PrayerSpacer)"
 );
 lines.forEach(line=>line.classList.add("aoLibraryLine"));
 const p=P(id);
 const title=p?(isFr()?(p.titleFr||p.title):p.title):L('Prayer','Prière');
 const reader=installSequentialDevotionalReader({
  mount:m,kind:"library",chapters:[{id,title}],
  activeIndex:0,paragraphSelector:".aoLibraryLine",
  timelineLabel:L('Prayer timeline','Parcours de la prière')
 });
 // A one-card prayer has no meaningful chapter navigation or positional
 // progress. Remove the adapter's one-of-one chrome, but preserve its
 // card-local focus, bilingual flip observer, keyboard and scroll handlers.
 m.querySelector(".aoP435930LibraryReader .aoDevoSequenceTimeline")?.remove();
 const languageFaces=card.querySelectorAll("[data-face-v],[data-face-la]");
 if(languageFaces.length&&typeof MutationObserver==="function"){
  const observer=new MutationObserver(()=>reader?.focus?.());
  languageFaces.forEach(face=>observer.observe(face,{attributes:true,attributeFilter:["hidden"]}));
 }
 card.addEventListener("click",event=>{
  if(event.target.closest("[data-p435930-flip]"))queueMicrotask(()=>reader?.focus?.());
 });
}
function render(){const m=mount();if(!m)return;const sig=navigationSignature(),moved=sig!==lastRenderSignature;let html='';if(view==='home')html=renderPrayHome();else if(view==='mercy')html=renderMercy();else if(view==='fiveWounds')html=renderFiveWounds();else if(view==='rosaryMethods')html=renderRosaryMethods();else if(view==='family')html=renderPrayFamily();else if(view==='angelus')html=renderAngelus();else if(view==='rosary')html=renderRosary();else if(view==='confession')html=renderConfession();else if(view==='benediction')html=renderBenediction();else if(view==='adoration')html=renderAdoration();else if(view==='library')html=renderLibrary();else if(view==='stations')html=renderStations();else if(view==='penitential')html=renderPenitential();else if(view==='litany')html=renderLitany();else if(view==='sevenWords')html=renderSevenWords();else if(view==='tenebrae')html=renderTenebrae();else if(view==='fortyHours')html=renderFortyHours();else if(view==='firstFriday')html=renderFirstFriday();else if(view==='firstSaturday')html=renderFirstSaturday();else if(view==='fsMeditation')html=renderFSMeditation();else if(view==='prayerOnly')html=renderPrayerOnly(prayerId);else html=renderPrayHome();m.dataset.aoPrayView=view;m.innerHTML=(view==='adoration'&&ADOR.quiet?'':semanticRails())+(homeNavigationError
 ?'<div role="alert" data-p435930-home-error style="padding:12px 16px;border-bottom:1px solid var(--ao-rule,rgba(217,197,154,.2));font:inherit"><span>'+esc(L('Home could not be opened. Your Prayer screen has been restored.','Impossible d’ouvrir l’accueil. L’écran Prière a été rétabli.'))+'</span> <button type="button" data-p435930-home-retry style="min-height:44px;margin-left:8px;padding:8px 16px;border:1px solid var(--ao-rule,rgba(217,197,154,.35));border-radius:999px;background:transparent;color:inherit;font:inherit">'+esc(L('Retry','Réessayer'))+'</button></div>':'')+html;lastRenderSignature=sig;if(moved)queueMicrotask(()=>{m.scrollTop=0});
 // Source-owned public rite stages and private Visit arrival are projected,
 // never interpreted as observed acts or additional liturgical requirements.
 if(view==='adoration'&&ADOR.quiet){
  actionCinematics.sync(null,{mount:m});
  queueMicrotask(()=>m.querySelector('[data-p435930-ador-quiet-exit]')?.focus?.({preventScroll:true}));
 }else if(view==='benediction'||view==='adoration'||view==='stations'){
  const scene=resolveDevotionalActionScene({
    view,benedictionStage:view==='benediction'?benStages()[BEN.step]?.[0]:null,
    adorationMode:view==='adoration'?ADOR.mode:null,
    visitStep:view==='adoration'?ADOR.visitStep:null,
    stationStep:view==='stations'?STATIONS.step:null,
    stationRitual:view==='stations'?certifiedPublicStationCue({
      stationStep:STATIONS.step,phase:'versicle',
      enabled:STATIONS.publicPosture,
      guided:stationReaderMode()==='guided',
    }):null, // explicitly opening a public Station begins at its versicle
  });
  actionCinematics.sync(scene,{mount:m,language:lang(),sessionKey:view});
 }else if(view!=='angelus'){
  actionCinematics.sync(null,{mount:m});
 }
 if(view==='stations')queueMicrotask(stationsFx);
 if(view==='angelus')queueMicrotask(()=>{
  const form=angelusChoice().form,posture=angelusExactPosture();
  const cardDeck=installAngelusCardDeck({
   mount:m,form,language:lang(),historicalConclusion:form==='angelus'&&S.angelusHistoricalConclusion,
   recitationMode:S.rosary.recitation,guided:!!S.angelusGuided,
   appendixText:{vern:DATA.angelusAppendix?.[lang()],latin:DATA.angelusAppendix?.la},
   initialIndex:ANGELUS_CARD_INDEX,
   onCardChange:(_card,index)=>{
    // Opening sacred artwork belongs only to prayer entry, never card changes.
    ANGELUS_CARD_INDEX=index;
   },
   onCue:cue=>{
    const active=cue==='profound-bow';
    const action=active?resolveAngelusIncarnationCinematic({
     form,weekday:selectedWeekday(),
     saturdayAfterVespers:angelusSaturdayVespersDate===selectedDateKey(),
     language:lang()
    }):null;
    // Source-anchored, non-blocking inline cinematic. No modal/Continue gate.
    const scene=m.querySelector('[data-ao-devo-card="incarnation"]');
    if(scene){
     let banner=scene.querySelector('.aoFolioIncarnationCue');
     if(active&&action&&!banner){
      scene.querySelector('.aoDevoCardHead')?.insertAdjacentHTML('beforeend',
       `<div class="aoFolioIncarnationCue" role="status">${assetIcon(action.iconAssetId,'aoFolioIncarnationIcon')}<span>${esc(action.label)}</span></div>`);
      banner=scene.querySelector('.aoFolioIncarnationCue');
     }
     scene.classList.toggle('aoFolioIncarnationActive',active&&!!action);
     banner?.classList.toggle('is-active',active&&!!action);
    }
    const rail=m.querySelector('[data-ao-ritual-module="angelus"]');
    if(rail){
     rail.querySelectorAll('[data-channel="gesture"]').forEach(el=>el.remove());
     if(active&&action)rail.insertAdjacentHTML('beforeend',
      ritualSlotMarkup('gesture',action.iconAssetId,action.label,{emphasis:true,value:action.action}));
    }
   }
  });
  // Folio starts with the prayer. An opening artwork must never block recitation.
  if(!cardDeck)bindAngelusExactRail();
 });else stopAngelusExactRail();
 if((view==='library'&&LIB.open)||(view==='prayerOnly'&&prayerId))queueMicrotask(()=>installLibraryParagraphFocus(m,view==='library'?LIB.open:prayerId));
 // Four independent source owners share the same presentation engine.
 // No source sequence is copied into the adapter; it only names and focuses
 // cards and emits explicit, user-initiated navigation.
 if(['penitential','litany','sevenWords','fortyHours'].includes(view))queueMicrotask(()=>{
  const owner=view;
  if(owner==='litany'&&!LIT.sections?.length)return; // fail closed during historical witness loading
  const stages=owner==='penitential'?PEN_PSALMS.map((p,i)=>({
    id:'penitential-'+i,title:'Psalm '+p.trad+(p.modern!==p.trad?' ('+p.modern+')':'')
   })):owner==='litany'?LIT.sections.map((x,i)=>({id:'litany-'+i,title:x.title}))
   :owner==='sevenWords'?WORD_REFS.map((_,i)=>({id:'word-'+(i+1),title:(isFr()?WORD_LABELS.fr:WORD_LABELS.en)[i]}))
   :FORTY_STAGES.map((x,i)=>({id:'forty-'+i,title:L(x[0],x[1])}));
  const step=owner==='penitential'?PEN.step:owner==='litany'?LIT.step
   :owner==='sevenWords'?SEVEN.step:FORTY.step;
  const reader=installSequentialDevotionalReader({
   mount:m,kind:owner,chapters:stages,activeIndex:step,
   paragraphSelector:'.aoP435930GuideNow p,.aoP435930GuideCue p,.aoP435930ScriptureVerse,.aoP435930LitanyLine,.aoP435930WitnessParagraph,.aoP435930Text,.aoP435930Prayer .aoP435930Flip',
   timelineLabel:owner==='penitential'?L('Seven Penitential Psalms','Sept psaumes pénitentiels')
    :owner==='litany'?L('Litany invocations','Invocations des litanies')
    :owner==='sevenWords'?L('Seven Gospel Words','Sept Paroles évangéliques')
    :L('Forty Hours · follow the church','Quarante-Heures · suivez le rite'),
   onNavigate:i=>{
    if(view!==owner)return;
    if(owner==='penitential')PEN.step=i;
    else if(owner==='litany')LIT.step=i;
    else if(owner==='sevenWords')SEVEN.step=i;
    else FORTY.step=i;
    render();
   }
  });
  if(reader)m.querySelector('.aoP435930DevotionalGuidedReader')
   ?.setAttribute('data-ao-devotional-dual-axis','true');
 });
 if(view==='confession'&&CONF.path&&CONF.stage>=1)queueMicrotask(()=>{
  const stage=CONF.stage,path=CONF.path;
  const cards=stage===1?confessionExaminationCards(path,(isFr()?DATA.examFr:DATA.exam)?.sections):
    stage===2?confessionRiteCards(path):confessionAfterCards();
  const index=stage===1?CONF.examStep:stage===2?CONF.riteStep:CONF.afterStep;
  const chapters=cards.map(card=>({
   id:card.id,title:card.kind==='questions'?card.title:isFr()?card.fr:card.en
  }));
  const reader=installSequentialDevotionalReader({
   mount:m,kind:'confession',chapters,activeIndex:index,
   paragraphSelector:'.aoP435930GuideNow p,.aoP435930ConfOneCard>p,.aoP435930ConfOneCard .aoP435930ConfQuestions>li,.aoP435930Prayer .aoP435930Flip,.aoP435930Prayer .aoP435930Text',
   timelineLabel:L('Confession examination and preparation cards','Étapes de préparation à la confession'),
   onNavigate:i=>{
    if(view!=='confession'||CONF.stage!==stage||CONF.path!==path)return;
    if(stage===1)CONF.examStep=i;
    else if(stage===2)CONF.riteStep=i;
    else CONF.afterStep=i;
    render();
   }
  });
  if(reader)m.querySelector('.aoP435930ConfessionReader')?.setAttribute('data-ao-confession-dual-axis','true');
 });
 if(view==='adoration'&&['visit','holy','four'].includes(ADOR.mode))queueMicrotask(()=>{
  const mode=ADOR.mode;
  const steps=mode==='visit'?visitSteps():mode==='holy'?holySteps():fourSteps();
  const index=mode==='visit'?ADOR.visitStep:mode==='holy'?ADOR.holyStep:ADOR.fourStep;
  const chapters=steps.map((step,i)=>({id:mode+'-'+i,title:step.title}));
  const reader=installSequentialDevotionalReader({
   mount:m,kind:'adoration',chapters,activeIndex:index,
   paragraphSelector:'.aoP435930GuideNow p,.aoP435930GuideCue p,.aoP435930Prayer .aoP435930Flip,.aoP435930Prayer .aoP435930Text',
   timelineLabel:L('Adoration prayer stages','Étapes de la prière d’adoration'),
   onNavigate:i=>{
    if(ADOR.mode!==mode)return;
    if(mode==='visit')ADOR.visitStep=i;
    else if(mode==='holy')ADOR.holyStep=i;
    else ADOR.fourStep=i;
    render()
   }
  });
  if(reader){
   const host=m.querySelector('.aoP435930AdorationReader');
   host?.setAttribute('data-ao-adoration-dual-axis','true');
   host?.setAttribute('data-ao-adoration-final',String(index===steps.length-1));
  }
 });
 if(view==='benediction')queueMicrotask(()=>{
  const stages=benStages(),titles=stages.map(stage=>L(stage[1],stage[2]));
  const chapters=stages.map((stage,i)=>({id:stage[0],title:titles[i]}));
  const reader=installSequentialDevotionalReader({
   mount:m,kind:'benediction',chapters,activeIndex:BEN.step,
   paragraphSelector:'.aoP435930GuideNow p,.aoP435930GuideCue p,.aoP435930Prayer .aoP435930Flip,.aoP435930Prayer .aoP435930Text',
   timelineLabel:L('Benediction stages','Étapes de la Bénédiction'),
   onNavigate:i=>{BEN.step=i;render()}
  });
  if(reader)m.querySelector('.aoP435930BenedictionReader')?.setAttribute('data-ao-benediction-dual-axis','true');
 });
 if(view==='stations')queueMicrotask(()=>{
  const titles=STATION_DATA.stationTitles?.[lang()]||STATION_DATA.stationTitles?.en||[];
  const chapters=Array.from({length:14},(_,i)=>({id:'station-'+(i+1),
   title:titles[i]||L('Station','Station')+' '+(i+1)}));
  installSequentialDevotionalReader({
   mount:m,kind:'stations',chapters,activeIndex:STATIONS.step,
   paragraphSelector:'.aoP435930VRLine,.aoP435930StationConsider p,.aoP435930HistoricalFocus p,.aoP435930Flip,.aoP435930Text,.aoP435930GuideNow p,.aoP435930GuideCue p',
   onNavigate:i=>{actionCinematics.reset();STATIONS.step=i;render()},
   onFocus:paragraph=>{
    // Only explicitly selected traditional public method, exact visible
    // source paragraph, and actual user scroll may own a posture cinematic.
    const phase=stationPhaseOfFocusedParagraph(paragraph);
    const ritual=certifiedPublicStationCue({stationStep:STATIONS.step,phase,
      enabled:STATIONS.publicPosture,
      guided:stationReaderMode()==='guided'});
    const stationScene=resolveDevotionalActionScene({
      view:'stations',stationStep:STATIONS.step,stationRitual:ritual,
    });
    actionCinematics.sync(stationScene,{mount:m,language:lang(),sessionKey:'stations-public'});
   }
  });
 });
 if(view==='mercy')queueMicrotask(()=>{
  const steps=divineMercySteps({includeClosing:MERCY.includeClosing});
  const chapters=mercyChapters(steps,{french:isFr()});
  const current=chapters.findIndex(x=>MERCY.step>=x.start&&MERCY.step<x.start+x.entries.length);
  installSequentialDevotionalReader({
   mount:m,kind:'mercy',chapters,activeIndex:Math.max(0,current),
   restoreStep:MERCY.step,paragraphSelector:'.aoMercyLine',
   onNavigate:(i,chapter)=>{
    MERCY.step=chapter.start;render();
    // A bead change is enough; do not interrupt recitation with a chapter cinematic.
   },
   onFocus:paragraph=>{
    const i=Number(paragraph.dataset.aoMercyStep);
    if(!Number.isInteger(i)||i===MERCY.step)return;
    MERCY.step=i;
    m.querySelectorAll('.aoMercyPrayer').forEach(el=>el.classList.remove('aoMercyPrayer'));
    paragraph.classList.add('aoMercyPrayer');
    updateMercyBeadNav(m,steps,i,{french:isFr()});

   }
  });
 });
}
function stopTimer(){if(ADOR.timer){clearInterval(ADOR.timer);ADOR.timer=null}ADOR.timerEnd=0}
function startTimer(min){stopTimer();ADOR.timerEnd=Date.now()+Number(min)*60000;ADOR.timer=setInterval(()=>{if(Date.now()>=ADOR.timerEnd){stopTimer();render()}else render()},30000);render()}
function routeOwn(id){
 const next=internalPrayerView(id);
 if(!next)return false;
 view=next;
 if(next==='stations'){STATIONS.step=0;lastStationsFxStep=null}
 if(next==='tenebrae'){TEN.day=0;TEN.hour='MATINS';TEN.step=0;TEN.guided=true;TEN.model=null;TEN.error=null;TEN.loading=false;TEN.epoch++}
 if(next==='angelus'){ANGELUS_CARD_INDEX=0;resetDevotionalCinematicSession({mount:mount(),win:window});}
 if(next==='mercy')MERCY.step=0;
 if(next==='fiveWounds'){FIVE_WOUNDS.index=0;FIVE_WOUNDS.latin=false}
 if(next==='rosaryMethods')ROSARY_CHOOSER.optionsOpen=false;
 if(id==='pray.visit_blessed_sacrament')ADOR.mode='visit';
 if(id==='pray.de_profundis'||id==='pray.eternal_rest'){
  prayerReturnView='home';
  prayerId=id==='pray.de_profundis'?'dead_de_profundis':'foundations_eternal_rest';
 }
 render();
 return true;
}
function clearInternalPrayerRouteErrors(){mount()?.querySelectorAll?.('[data-p435930-internal-route-error]')?.forEach?.(el=>el.remove())}
function showInternalPrayerRouteError(button,id){
 clearInternalPrayerRouteErrors();
 const panel=document.createElement('div');
 panel.dataset.p435930InternalRouteError=id;
 panel.setAttribute('role','alert');
 panel.style.cssText='padding:12px;margin:8px 0;border:1px solid var(--ao-rule,rgba(217,197,154,.35));border-radius:10px';
 const message=document.createElement('p');
 message.textContent=L('This prayer could not be opened. Its original screen is unchanged.','Impossible d’ouvrir cette prière. L’écran précédent est conservé.');
 const retry=document.createElement('button');
 retry.type='button';
 retry.dataset.p435930RetryInternal=id;
 retry.textContent=L('Retry','Réessayer');
 retry.style.cssText='min-height:44px;padding:8px 16px;background:transparent;color:inherit;border:1px solid currentColor;border-radius:8px';
 panel.append(message,retry);
 button?.insertAdjacentElement?.('afterend',panel);
 return false;
}
function openPrayerOnly(id){prayerReturnView=view;prayerId=id;view='prayerOnly';render()}
let externalFamilyEpoch=0;
function clearExternalFamilyError(){
 document.querySelectorAll?.('[data-p435930-family-open-error]')?.forEach?.(node=>node.remove?.());
}
async function openExternalFamilyRoute(button,route,returnFamily){
 const attempt=++externalFamilyEpoch;
 if(button?.getAttribute?.('aria-busy')==='true')return false;
 clearExternalFamilyError();
 button?.setAttribute?.('aria-busy','true');
 let result=null;
 try{result=await window?.AO_MODULES?.open?.(route,{returnContext:PRAY_CTX,returnFamily});}
 catch(error){console.error('PRAY family route failed',route,error);}
 finally{button?.removeAttribute?.('aria-busy');}
 if(result===true||result?.ok===true)return true;
 if(attempt!==externalFamilyEpoch||view!=='family'||familyId!==returnFamily||button?.isConnected===false)return false;
 const panel=document.createElement('div');
 panel.dataset.p435930FamilyOpenError=route;
 panel.setAttribute('role','alert');
 panel.style.cssText='margin:8px 0 12px;padding:12px;border:1px solid var(--ao-rule,rgba(217,197,154,.25));border-radius:10px;font:inherit';
 const message=document.createElement('p');
 message.textContent=L('This prayer could not be opened. Please retry.','Impossible d’ouvrir cette prière. Veuillez réessayer.');
 message.style.cssText='margin:0 0 8px;line-height:1.4';
 const retry=document.createElement('button');
 retry.type='button';
 retry.dataset.p435930RetryExternal=route;
 retry.textContent=L('Retry','Réessayer');
 retry.style.cssText='min-height:44px;padding:8px 16px;background:transparent;color:inherit;border:1px solid var(--ao-rule,rgba(217,197,154,.35));border-radius:999px';
 panel.append(message,retry);
 button?.insertAdjacentElement?.('afterend',panel);
 return false;
}
function onClick(e){
 const myCustoms=e.target.closest?.('[data-p435930-my-customs]');
 if(myCustoms){
   e.preventDefault();
   void import('../customs/personal-ui.js').then(module=>module.openMyCustoms({language:isFr()?'fr':'en'}))
     .catch(error=>console.error('My Customs & Prayers unavailable',error));
   return;
 }

 // Explicit native-details toggle: iOS/Chromium touch and keyboard share one
 // source-disclosure action; cancel the default to prevent a double toggle.
 const sourceSummary=e.target.closest?.('details.aoP435930Source > summary');
 if(sourceSummary){
  e.preventDefault();
  const detail=sourceSummary.parentElement;
  if(detail?.tagName==='DETAILS')detail.open=!detail.open;
  return;
 }
 const b=e.target.closest?.('button,[data-p435930-flip]');if(!b)return;
 if(b.hasAttribute('data-p435930-session-language')&&['adoration','benediction','stations','confession','fiveWounds'].includes(view)){
  const current=mount(),outerScroll=current?.scrollTop||0;
  const innerScroll=current?.querySelector('.aoDevoCardScroll')?.scrollTop||0;
  praySessionLanguage=isFr()?'en':'fr';
  render();
  queueMicrotask(()=>{
   const next=mount();if(!next)return;
   next.scrollTop=outerScroll;
   const card=next.querySelector('.aoDevoCardScroll');if(card)card.scrollTop=innerScroll;
   next.querySelector('[data-p435930-session-language]')?.focus?.({preventScroll:true});
  });
  return;
 }
 if(b.hasAttribute('data-p435930-angelus-settings')){
  const detail=mount()?.querySelector?.('#aoAngelusOptions');
  if(detail){detail.open=!detail.open;angelusOptionsOpen=detail.open;b.setAttribute('aria-expanded',String(detail.open))}
  return;
 }
 if(view==='fiveWounds'){
   if(b.hasAttribute('data-p435930-five-wound')){
     const i=Number(b.dataset.p435930FiveWound);
     if(Number.isInteger(i)&&i>=0&&i<5){FIVE_WOUNDS.index=i*6;return render()}
     return;
   }
   if(b.hasAttribute('data-p435930-five-latin')){FIVE_WOUNDS.latin=!FIVE_WOUNDS.latin;return render()}
   if(b.hasAttribute('data-p435930-five-prev')){FIVE_WOUNDS.index=Math.max(0,FIVE_WOUNDS.index-1);return render()}
   if(b.hasAttribute('data-p435930-five-next')){FIVE_WOUNDS.index=Math.min(29,FIVE_WOUNDS.index+1);return render()}
   if(b.hasAttribute('data-p435930-five-finish')&&FIVE_WOUNDS.index===29){
     FIVE_WOUNDS.index=0;FIVE_WOUNDS.latin=false;return backToParent();
   }
 }
 if(b.hasAttribute('data-p435930-mercy-open')){view='mercy';MERCY.step=0;navStack=[];return render()}
 if(b.hasAttribute('data-p435930-rosary-methods')){view='rosaryMethods';navStack=[];return render()}
 if(b.hasAttribute('data-p435930-rosary-customize')){
  ROSARY_CHOOSER.optionsOpen=!ROSARY_CHOOSER.optionsOpen;
  render();
  queueMicrotask(()=>mount()?.querySelector?.('[data-p435930-rosary-customize]')?.focus?.({preventScroll:true}));
  return;
 }
 if(b.hasAttribute('data-p435930-rosary-choose')){const id=b.dataset.p435930RosaryChoose;if(!['ordinary','dominican','montfort','montfort_short','scriptural'].includes(id))return;ROSARY_CHOOSER.method=id;if(id!=='ordinary')ROSARY_CHOOSER.decades=5;if(id==='scriptural')ROSARY_CHOOSER.guide='guided';return refreshRosaryChoiceFocus('data-p435930-rosary-choose',id)}
 if(b.hasAttribute('data-p435930-rosary-decades')){const n=Number(b.dataset.p435930RosaryDecades);if(![5,15].includes(n)||n===15&&ROSARY_CHOOSER.method!=='ordinary')return;ROSARY_CHOOSER.decades=n;return refreshRosaryChoiceFocus('data-p435930-rosary-decades',String(n))}
 if(b.hasAttribute('data-p435930-rosary-guidance')){const mode=b.dataset.p435930RosaryGuidance;if(!['simple','guided'].includes(mode)||ROSARY_CHOOSER.method==='scriptural'&&mode==='simple')return;ROSARY_CHOOSER.guide=mode;return refreshRosaryChoiceFocus('data-p435930-rosary-guidance',mode)}
 if(b.hasAttribute('data-p435930-rosary-begin')){S.rosary.mode=ROSARY_CHOOSER.guide;save();return ROSARY_CHOOSER.method==='ordinary'&&ROSARY_CHOOSER.decades===15?launchFifteenRosary():launchTraditionalRosaryMethod(ROSARY_CHOOSER.method)}
 if(b.hasAttribute('data-p435930-rosary-original'))return launchTraditionalRosaryMethod('ordinary');
 if(b.hasAttribute('data-p435930-rosary-method-launch'))return launchTraditionalRosaryMethod(b.dataset.p435930RosaryMethodLaunch);
 if(b.hasAttribute('data-p435930-rosary-fifteen'))return launchFifteenRosary();
 if(view==='mercy'){
  if(b.hasAttribute('data-p435930-mercy-jump')){
   const steps=divineMercySteps({includeClosing:MERCY.includeClosing});
   const n=Number(b.dataset.p435930MercyJump);
   if(Number.isInteger(n)&&n>=0&&n<steps.length){MERCY.step=n;return render()}
   return;
  }
  if(b.hasAttribute('data-p435930-mercy-guide')){MERCY.guide=MERCY.guide==='guided'?'simple':'guided';return render()}
  if(b.hasAttribute('data-p435930-mercy-closing')){MERCY.includeClosing=!MERCY.includeClosing;return render()}
 }
 if(b.matches('[data-p435930-close]'))return close();
 if(b.matches('[data-p435930-home]')||b.matches('[data-p435930-home-retry]'))return goGlobalHome();
 if(b.matches('[data-p435930-back]'))return backToParent()
 if(view==='tenebrae'&&b.hasAttribute('data-p435930-tenebrae-ceremony')){
  const step=TEN.model?.steps?.[TEN.step]||null;
  TEN.ceremony=tenebraeCeremonialAction(TEN.ceremony,b.dataset.p435930TenebraeCeremony,step);
  return render();
 }
 if(view==='tenebrae'&&b.hasAttribute('data-p435930-tenebrae-mode')){
  TEN.guided=b.dataset.p435930TenebraeMode==='guided';return render();
 }
 if(view==='tenebrae'&&b.hasAttribute('data-p435930-tenebrae-jump')){
  if(!TEN.model)return;
  const dest=Number(b.dataset.p435930TenebraeJump);
  if(!Number.isInteger(dest)||dest<0||dest>=TEN.model.steps.length)return;
  TEN.step=dest;return render();
 }
 if(view==='tenebrae'&&b.hasAttribute('data-p435930-tenebrae-day'))return setTenebrae(Number(b.dataset.p435930TenebraeDay));
 if(view==='tenebrae'&&b.hasAttribute('data-p435930-tenebrae-hour'))return setTenebrae(TEN.day,b.dataset.p435930TenebraeHour);
 if(view==='tenebrae'&&b.hasAttribute('data-p435930-tenebrae-face')){TEN.face=TEN.face==='latin'?'vernacular':'latin';return render()}
 if(view==='tenebrae'&&b.hasAttribute('data-p435930-tenebrae-retry')){TEN.error=null;TEN.model=null;return render()}
 if(b.dataset.p435930Family){familyId=b.dataset.p435930Family;view='family';navStack=[];return render()}
 if(b.dataset.p435930RetryExternal){
  const holder=b.closest?.('[data-p435930-family-open-error]');
  const card=holder?.previousElementSibling;
  if(card?.dataset?.p435930External){
    e.preventDefault?.();
    void openExternalFamilyRoute(card,card.dataset.p435930External,familyId);
  }
  return;
 }
 if(b.dataset.p435930External){
  e.preventDefault?.();
  void openExternalFamilyRoute(b,b.dataset.p435930External,familyId);
  return;
 }
 if(b.matches('[data-p435930-flip]')){if(b===suppressPrayerFlipTarget){suppressPrayerFlipTarget=null;return;}const a=b.querySelector('[data-face-la]'),v=b.querySelector('[data-face-v]');if(a&&v){const showV=v.hidden;v.hidden=!showV;a.hidden=showV}return}
 if(b.matches('[data-p435930-card-flip]')){if(b===suppressPrayerFlipTarget){suppressPrayerFlipTarget=null;return;}const v=b.querySelector('[data-face-v]'),a=b.querySelector('[data-face-la]');if(v&&a){const showA=a.hidden;a.hidden=!showA;v.hidden=showA}return}
 const seg=b.dataset.p435930Seg;if(seg){if(view==='angelus'){if(['individual','group'].includes(seg))setRecitationMode(seg);else if(['simple','guided'].includes(seg)){S.angelusGuided=seg==='guided';save()}else if(['auto','angelus','regina'].includes(seg)){S.angelusMode=seg;ANGELUS_CARD_INDEX=0;angelusOptionsOpen=false;save()}}else if(view==='rosary'){if(['standard','devotional'].includes(seg)){S.rosary.form=seg;save()}else if(['simple','guided'].includes(seg)){S.rosary.mode=seg;save()}else if(['individual','group'].includes(seg)){setRecitationMode(seg);try{window.AO_PRAY_COHERENCE_V435930?.setMode?.(seg)}catch{}}}else if(view==='adoration'&&['reserved','exposed'].includes(seg)){setAdorationPresence(seg)}else if(view==='stations'&&['guided','simple'].includes(seg)){S.stations.mode=seg;if(seg==='simple')STATIONS.publicPosture=false;save()}else if(view==='stations'&&['individual','group'].includes(seg)){setRecitationMode(seg);if(seg==='individual')STATIONS.publicPosture=false}else if(view==='litany'&&['individual','group'].includes(seg)){setRecitationMode(seg)}else if(view==='library'&&LIB.open){LIB.language=seg}return render()}
 if(b.matches('[data-p435930-launch-rosary]')){launchRosaryPlayer(captureResume());return}
 if(b.hasAttribute("data-p435930-conf-contrition")){
   if(view!=="confession"||!CONF.path||![1,2].includes(CONF.stage))return;
   const selected=b.dataset.p435930ConfContrition;
   if(selected!=="standard"&&selected!=="piusx")return;
   const last=CONF.stage===1
     ?confessionExaminationCards(CONF.path,(isFr()?DATA.examFr:DATA.exam)?.sections).length-1
     :confessionRiteCards(CONF.path).length-1;
   if((CONF.stage===1?CONF.examStep:CONF.riteStep)!==last)return;
   if(CONF.contrition===selected)return;
   CONF.contrition=selected;return render();
 }
 if(b.hasAttribute('data-p435930-station-reading')){
   if(view!=='stations')return;
   const selected=b.dataset.p435930StationReading;
   if(selected!=='guided'&&selected!=='simple')return;
   // An explicit historical public posture selection is not silently
   // cancelled by an abbreviated private reading request.
   if(selected==='simple'&&STATIONS.publicPosture)return;
   if(S.stations.mode===selected)return;
   S.stations.mode=selected;save();actionCinematics.reset();return render();
 }
 if(b.dataset.p435930ConfPath!=null){
   if(!confessionPath(b.dataset.p435930ConfPath))return;
   CONF.path=b.dataset.p435930ConfPath;
   CONF.examStep=0;CONF.riteStep=0;CONF.afterStep=0;
   return render();
 }
 if(b.dataset.p435930ConfStep!=null||b.dataset.p435930ConfStage!=null){
   const target=Number(b.dataset.p435930ConfStep??b.dataset.p435930ConfStage);
   if(!CONF.path&&target>0)return;
   CONF.stage=Math.max(0,Math.min(3,Number.isInteger(target)?target:0));
   CONF.examStep=0;CONF.riteStep=0;CONF.afterStep=0;
   return render();
 }
 if(b.matches('[data-p435930-conf-next]')){
   if(!CONF.path)return;
   if(CONF.stage===1){
     const count=confessionExaminationCards(CONF.path,(isFr()?DATA.examFr:DATA.exam)?.sections).length;
     if(CONF.examStep<count-1){CONF.examStep++;return render();}
   }
   if(CONF.stage===2){
     const count=confessionRiteCards(CONF.path).length;
     if(CONF.riteStep<count-1){CONF.riteStep++;return render();}
   }
   if(CONF.stage===3){
     const count=confessionAfterCards().length;
     if(CONF.afterStep<count-1){CONF.afterStep++;return render();}
     CONF=freshConfessionState();return backToParent();
   }
   CONF.stage++;return render();
 }
 if(b.matches('[data-p435930-conf-clear]')){CONF=freshConfessionState();return render()}
 if(b.dataset.p435930BenStep!=null){BEN.step=+b.dataset.p435930BenStep;return render()}
 if(b.matches('[data-p435930-ben-finish]')&&BEN.step===benStages().length-1){
  setAdorationPresence('reserved');BEN={step:0,divinePraises:false,praisesForm:'1962',celebration:'ordinary',feastOptions:{...CHRIST_KING_OPTION_DEFAULTS}};popView('home');return render()
 }
 if(b.hasAttribute('data-p435930-four-choice')){
  if(view!=='adoration'||ADOR.mode!=='four'||ADOR.quiet)return;
  const raw=String(b.dataset.p435930FourChoice||'');
  const colon=raw.indexOf(':');if(colon<0)return;
  const purpose=raw.slice(0,colon),id=raw.slice(colon+1);
  const phase=['adoration','thanksgiving','reparation','petition'][ADOR.fourStep];
  if(purpose!==phase)return;
  if(id!=='none'&&(!adorationFourOptionFor(purpose,id)||!P(id)?.[lang()]||!P(id)?.provenance?.url))return;
  const current=adorationFourChoices()[purpose]||null,chosen=id==='none'?null:id;
  if(current===chosen)return;
  // Only the optional source-prayer selector is replaced: never remount
  // the historical stage, parent scroll, timer, silence cue or ritual rail.
  const section=mount()?.querySelector('.aoP435930AdorationReader[data-ao-adoration-mode="four"] [data-ao-four-purpose="'+purpose+'"]');
  if(!section)return;
  saveAdorationFourChoice(purpose,chosen);
  const holder=section.ownerDocument.createElement('div');
  holder.innerHTML=adorationFourOptionalMarkup(purpose);
  const replacement=holder.firstElementChild;
  if(!replacement)return;
  section.replaceWith(replacement);
  replacement.querySelector('[data-p435930-four-choice="'+raw+'"]')?.focus?.({preventScroll:true});
  return;
 }
 if(b.matches('[data-p435930-ador-quiet-enter]'))return enterAdorationQuiet();
 if(b.matches('[data-p435930-ador-quiet-exit]'))return exitAdorationQuiet();
 if(b.dataset.p435930AdorMode){ADOR.quiet=false;ADOR.mode=b.dataset.p435930AdorMode;if(ADOR.mode==='visit')ADOR.visitStep=0;if(ADOR.mode==='holy')ADOR.holyStep=0;if(ADOR.mode==='four')ADOR.fourStep=0;return render()}
 if(b.matches('[data-p435930-ador-home]')){ADOR.quiet=false;ADOR.mode='home';stopTimer();return render()}
 if(b.dataset.p435930Timer)return startTimer(+b.dataset.p435930Timer);
 if(b.matches('[data-p435930-timer-stop]')){stopTimer();return render()}
 if(b.matches('[data-p435930-go-ben]')){setAdorationPresence('exposed');pushView();view='benediction';BEN.step=0;return render()}
 if(b.matches('[data-p435930-ador-four]')){ADOR.quiet=false;ADOR.mode='four';ADOR.fourStep=0;return render()}
 if(b.dataset.p435930HolyStep!=null){ADOR.holyStep=+b.dataset.p435930HolyStep;return render()}
 if(b.dataset.p435930VisitStep!=null){ADOR.visitStep=+b.dataset.p435930VisitStep;return render()}
 if(b.dataset.p435930FourStep!=null){ADOR.fourStep=+b.dataset.p435930FourStep;return render()}
 if(b.matches('[data-p435930-visit-finish]')&&ADOR.visitStep===visitSteps().length-1){ADOR.visitStep=0;ADOR.mode='home';return render()}

 if(b.matches('[data-p435930-holy-finish]')&&ADOR.holyStep===holySteps().length-1){ADOR.holyStep=0;ADOR.mode='home';return render()}

 if(b.matches('[data-p435930-four-finish]')&&ADOR.fourStep===fourSteps().length-1){ADOR.fourStep=0;ADOR.mode='open';return render()}

 if(b.matches('[data-p435930-go-rosary]')){launchRosaryPlayer(captureResume());return}
 if(b.dataset.p435930OpenPrayer)return openPrayerOnly(b.dataset.p435930OpenPrayer);
 if(b.matches('[data-p435930-prayer-return]')){view=prayerReturnView||'library';return render()}
 if(b.dataset.p435930StationStep!=null){STATIONS.step=Math.max(0,Math.min(13,+b.dataset.p435930StationStep));return render()}
 if(b.matches('[data-p435930-station-finish]')&&STATIONS.step===13){STATIONS.step=0;return backToParent()}
 if(b.dataset.p435930LibCat!=null){LIB.cat=b.dataset.p435930LibCat;return render()}
 if(b.dataset.p435930LibOpen){LIB.open=b.dataset.p435930LibOpen;LIB.language=null;return render()}
 if(b.matches('[data-p435930-lib-back]')){LIB.open=null;return render()}
 if(b.dataset.p435930ScriptureRetry){
  // Retry only the exact currently displayed source identity, never switch
  // translation or fetch an alternative unsourced prayer text silently.
  if(view==='penitential'&&b.dataset.p435930ScriptureRetry==='psalm'){
   const ref='Psalms '+PEN_PSALMS[Math.max(0,Math.min(6,PEN.step))].trad+':1';
   ++PEN.token;loadScriptureInto('[data-p435930-pen-scripture]','psalm',ref,true,()=>PEN.token);
  }else if(view==='sevenWords'&&b.dataset.p435930ScriptureRetry==='gospel'){
   const ref=WORD_REFS[Math.max(0,Math.min(6,SEVEN.step))];
   ++SEVEN.scriptToken;loadScriptureInto('[data-p435930-word-scripture]','gospel',ref,false,()=>SEVEN.scriptToken);
  }
  return;
 }
 if(b.dataset.p435930PenStep!=null){PEN.step=Math.max(0,Math.min(6,+b.dataset.p435930PenStep));return render()}
 if(b.matches('[data-p435930-pen-cache]')){void warmPenitentialPsalmCorpus();return}
 if(b.matches('[data-p435930-pen-litany]')){pushView();view='litany';LIT.step=0;return render()}
 if(b.dataset.p435930LitStep!=null){LIT.step=Math.max(0,Math.min((LIT.sections?.length||1)-1,+b.dataset.p435930LitStep));return render()}
 if(b.hasAttribute('data-p435930-lit-use')){const choice=b.dataset.p435930LitUse;if(!BATCH03_LITANY_EDITION_POLICY[choice])return;LIT.use=choice;LIT.step=0;return render()}
 if(b.matches('[data-p435930-lit-forty]')){pushView('litany');routeOwn('pray.forty_hours');return render()}
 if(b.matches('[data-p435930-lit-retry]')){LIT.error='';LIT.sections=null;LIT.step=0;return render()}
 if(b.matches('[data-p435930-lit-done]')){if(navStack.at(-1)==='penitential'){navStack.pop();popView('home')}else popView('home');return render()}
 if(b.dataset.p435930WordMethod){SEVEN.scriptureOnly=b.dataset.p435930WordMethod==='scripture';return render()}
 if(b.dataset.p435930WordStep!=null){SEVEN.step=Math.max(0,Math.min(6,+b.dataset.p435930WordStep));return render()}
 if(b.matches('[data-p435930-word-done]')){popView('home');return render()}
 if(b.dataset.p435930FortyStep!=null){FORTY.step=Math.max(0,Math.min(FORTY_STAGES.length-1,+b.dataset.p435930FortyStep));return render()}
 if(b.hasAttribute('data-p435930-forty-mode')){FORTY.mode=b.dataset.p435930FortyMode==='solemn'?'solemn':'visitor';FORTY.step=0;FORTY.solemnStep=0;return render()}
 if(b.hasAttribute('data-p435930-forty-choose')){FORTY.mode='choose';return render()}
 if(b.hasAttribute('data-p435930-forty-solemn-jump')){const i=Number(b.dataset.p435930FortySolemnJump);if(Number.isInteger(i)&&i>=0&&i<FORTY_HOURS_SOLEMN_STAGES.length){FORTY.solemnStep=i;return render()}return}
 if(b.hasAttribute('data-p435930-forty-solemn-prev')){FORTY.solemnStep=Math.max(0,FORTY.solemnStep-1);return render()}
 if(b.hasAttribute('data-p435930-forty-solemn-next')){FORTY.solemnStep=Math.min(FORTY_HOURS_SOLEMN_STAGES.length-1,FORTY.solemnStep+1);return render()}
 if(b.matches('[data-p435930-forty-done]')){FORTY.step=0;return backToParent()}
 if(b.matches('[data-p435930-forty-ben]')){pushView();view='benediction';BEN.step=0;return render()}
 if(b.dataset.p435930FortyOwn){const id=b.dataset.p435930FortyOwn;if(id==='pray.rosary'){launchRosaryPlayer(captureResume());return}pushView();if(id==='pray.adoration'){view='adoration';ADOR.mode=b.dataset.p435930FortyAdor||'open'}else if(id==='pray.litany_saints'){view='litany';LIT.step=0}else if(id==='pray.penitential_psalms'){view='penitential';PEN.step=b.dataset.p435930FortyPsalm!=null?+b.dataset.p435930FortyPsalm:0};return render()}
 if(b.dataset.p435930Handoff)return handoff(b.dataset.p435930Handoff);
 if(b.dataset.p435930RetryInternal){
  const id=b.dataset.p435930RetryInternal;
  const original=b.closest('[data-p435930-internal-route-error]')?.previousElementSibling;
  if(original?.dataset?.p435930Own===id){
   if(!internalPrayerView(id))return showInternalPrayerRouteError(original,id);
   clearInternalPrayerRouteErrors();pushView();routeOwn(id);
  }
  return;
 }
 if(b.dataset.p435930Own){
  const id=b.dataset.p435930Own;
  if(id==='pray.rosary'){launchRosaryPlayer(captureResume());return}
  // Validation must precede pushView: unknown targets must never become Angelus.
  if(!internalPrayerView(id))return showInternalPrayerRouteError(b,id);
  clearInternalPrayerRouteErrors();
  pushView();routeOwn(id);return;
 }
 if(b.matches('[data-p435930-ador-mode-direct]')){view='adoration';ADOR.mode=b.dataset.p435930AdorModeDirect;if(ADOR.mode==='visit')ADOR.visitStep=0;if(ADOR.mode==='holy')ADOR.holyStep=0;if(ADOR.mode==='four')ADOR.fourStep=0;return render()}
 if(b.hasAttribute('data-p435930-ff-direct-prayer')){
   if(view!=='firstFriday'||!P('sacred_heart_short_prayer'))return;
   prayerReturnView='firstFriday';prayerId='sacred_heart_short_prayer';
   view='prayerOnly';return render();
 }
 if(b.hasAttribute('data-p435930-fs-direct-rosary')){
   if(view!=='firstSaturday')return;
   // Reuse the canonical Rosary owner and its exact programme return snapshot.
   // Opening the player never sets FS.rosary or records a month.
   launchRosaryPlayer(captureResume());return;
 }
 if(b.hasAttribute('data-p435930-fs-direct-meditate')){
   if(view!=='firstSaturday')return;
   // Same meditation reader as the programme's stage-four handoff; it never
   // sets FS.meditation until the user explicitly reports completion there.
   stopTimer();view='fsMeditation';return render();
 }
 if(b.dataset.p435930FfStage!=null){FF.step=Math.max(0,Math.min(FF_STAGES.length-1,+b.dataset.p435930FfStage));return render()}
 if(b.matches('[data-p435930-ff-prev]')){FF.step=Math.max(0,FF.step-1);return render()}
 if(b.matches('[data-p435930-ff-next]')){FF.step=Math.min(FF_STAGES.length-1,FF.step+1);return render()}
 if(b.dataset.p435930FsStage!=null){FS.step=Math.max(0,Math.min(FS_STAGES.length-1,+b.dataset.p435930FsStage));return render()}
 if(b.matches('[data-p435930-fs-prev]')){FS.step=Math.max(0,FS.step-1);return render()}
 if(b.matches('[data-p435930-fs-next]')){FS.step=Math.min(FS_STAGES.length-1,FS.step+1);return render()}
 if(b.dataset.p435930FsMedSet){FS.medSet=['joyful','sorrowful','glorious'].includes(b.dataset.p435930FsMedSet)?b.dataset.p435930FsMedSet:'joyful';FS.medMystery=0;return render()}
 if(b.dataset.p435930FsMedMystery!=null){FS.medMystery=+b.dataset.p435930FsMedMystery;return render()}
 if(b.matches('[data-p435930-program-home]')){stopTimer();return backToParent()}
 if(b.matches('[data-p435930-ff-save]')){const date=selectedDateKey();if(!isFirstWeekday(date,5)||!FF.intention||!FF.communion)return;upsert(S.firstFriday.records,{date,intention:true,communion:true,complete:true,reportedAt:nowIso()});save();FF.step=4;return render()}
 if(b.matches('[data-p435930-ff-interrupt]')){const date=selectedDateKey();if(!isFirstWeekday(date,5))return;upsert(S.firstFriday.records,{date,intention:!!FF.intention,communion:!!FF.communion,complete:false,interrupted:true,reportedAt:nowIso()});save();FF.step=4;return render()}
 if(b.matches('[data-p435930-fs-meditate]')){stopTimer();view='fsMeditation';return render()}
 if(b.matches('[data-p435930-fs-meditation-complete]')){stopTimer();FS.meditation=true;FS.step=4;view='firstSaturday';return render()}
 if(b.matches('[data-p435930-fs-meditation-return]')){stopTimer();FS.step=4;view='firstSaturday';return render()}
 if(b.matches('[data-p435930-fs-save]')){const date=selectedDateKey(),complete=isFirstWeekday(date,6)&&FS.intention&&FS.communion&&FS.rosary&&FS.meditation&&!!FS.confessionDate;if(!complete)return;upsert(S.firstSaturday.records,{date,intention:true,communion:true,rosary:true,meditation:true,confessionDate:FS.confessionDate,complete:true,reportedAt:nowIso()});save();FS.step=5;return render()}
 if(b.matches('[data-p435930-fs-interrupt]')){const date=selectedDateKey();if(!isFirstWeekday(date,6))return;upsert(S.firstSaturday.records,{date,intention:!!FS.intention,communion:!!FS.communion,rosary:!!FS.rosary,meditation:!!FS.meditation,confessionDate:FS.confessionDate||'',complete:false,interrupted:true,reportedAt:nowIso()});save();FS.step=5;return render()}
}
function onChange(e){const x=e.target;
 if(x.matches('[data-p435930-ff-tracking]')){const expanded=!!x.closest('details.aoQuietSeriesDisclosure')?.open;S.firstFriday.tracking=x.checked;save();render();if(expanded)mount()?.querySelector('details.aoQuietSeriesDisclosure')?.setAttribute('open','');return}
 if(x.matches('[data-p435930-fs-tracking]')){const expanded=!!x.closest('details.aoQuietSeriesDisclosure')?.open;S.firstSaturday.tracking=x.checked;save();render();if(expanded)mount()?.querySelector('details.aoQuietSeriesDisclosure')?.setAttribute('open','');return}
 if(x.matches('[data-p435930-angelus-appendix]')){S.angelusHistoricalConclusion=x.checked;save();return render()}
 if(x.matches('[data-p435930-angelus-vespers]')){angelusSaturdayVespersDate=x.checked&&selectedWeekday()===6?selectedDateKey():null;return render()}
 if(x.matches('[data-p435930-grave-reviewed]')){CONF.graveReviewed=x.checked;return}
 if(x.matches('[data-p435930-ben-feast]')){BEN.celebration=x.checked?'christKing':'ordinary';BEN.step=0;render();queueMicrotask(()=>{const d=mount()?.querySelector('[data-ao-ben-feast-options]');if(d)d.open=true});return}
  if(x.matches('[data-p435930-ben-feast-option]')){
   const key=x.dataset.p435930BenFeastOption;
   if(!Object.hasOwn(CHRIST_KING_OPTION_DEFAULTS,key))return;
   const current=benStages()[BEN.step]?.[0];BEN.feastOptions[key]=x.checked;
   const stages=benStages(),index=stages.findIndex(x=>x[0]===current);
   BEN.step=index>=0?index:Math.max(0,stages.findIndex(x=>x[0]==='hymn'));
   render();queueMicrotask(()=>{const d=mount()?.querySelector('[data-ao-ben-feast-options]');if(d)d.open=true});return;
  }
  if(x.matches('[data-p435930-ben-praises]')){BEN.divinePraises=x.checked;return render()}
 if(x.matches('[data-p435930-ben-praises-form]')){BEN.praisesForm=x.value==='later'?'later':'1962';return render()}
 if(x.matches('[data-p435930-station-simple-responses]')){STATIONS.simpleResponses=x.checked;return render()}
 if(x.matches('[data-p435930-station-stabat]')){S.stations.stabat=x.checked;save();return render()}
 if(x.matches('[data-p435930-station-public-posture]')){
  STATIONS.publicPosture=x.checked;
  // Effective public recitation and Guided depth are local to Stations.
  actionCinematics.reset();return render()
 }
 if(x.matches('[data-p435930-ff-intention]'))FF.intention=x.checked;
 if(x.matches('[data-p435930-ff-communion]'))FF.communion=x.checked;
 if(x.matches('[data-p435930-fs-intention]'))FS.intention=x.checked;
 if(x.matches('[data-p435930-fs-communion]'))FS.communion=x.checked;
 if(x.matches('[data-p435930-fs-rosary]'))FS.rosary=x.checked;
 if(x.matches('[data-p435930-fs-meditation]'))FS.meditation=x.checked;
 if(x.matches('[data-p435930-fs-confession]'))FS.confessionDate=x.value.trim()?(parseDisplayDate(x.value)||''):'';
 if(view==='firstFriday'||view==='firstSaturday')render();
}
function onInput(e){const x=e.target;if(x.matches('[data-p435930-since]'))CONF.since=x.value;if(x.matches('[data-p435930-lib-search]')){LIB.q=x.value;const pos=x.selectionStart;render();const n=document.querySelector('[data-p435930-lib-search]');n?.focus();try{n?.setSelectionRange(pos,pos)}catch{}}}
// Keep shared Rosary preferences synchronized when the preserved canonical player changes them.
document.addEventListener('click',e=>{
 const donorBack=e.target?.closest?.('.lab-back'),donorRoot=donorBack?.closest?.('#aoPrayerBookRoot')||rosaryDonorRoot(),donorResume=readRosaryDonorReturn();
 if(donorRoot&&donorBack&&donorRoot.contains(donorBack)&&donorResume&&donorRoot.querySelector?.('.pbShell')?.dataset?.aoRosaryExactDonor==='v3.4.14'){
  // Modular PRAY owns the return handoff, while the preserved engine keeps Rosary state.
  returnFromRosaryDonor(e,donorRoot,donorResume);
  return
 }
 const overviewOpen=e.target.closest?.('[data-r23-overview-open]');if(overviewOpen){
  const r=rosaryDonorRoot();const sheet=r?.querySelector?.('#r23-overview-sheet');if(sheet){e.preventDefault();e.stopPropagation();sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');sheet.querySelector('[data-r23-overview-close]')?.focus?.()}return
 }
 const overviewClose=e.target.closest?.('[data-r23-overview-close]');if(overviewClose){const r=rosaryDonorRoot();e.preventDefault();e.stopPropagation();closeRosaryDonorOverview(r);return}
 const overviewJump=e.target.closest?.('[data-r23-overview-jump]');if(overviewJump){
  const r=rosaryDonorRoot(),api=window.AO_ROSARY_V381,target=Math.max(0,Math.trunc(Number(overviewJump.dataset.r23OverviewJump)||0));
  e.preventDefault();e.stopPropagation();
  if(api?.setStep?.(target)!==false){closeRosaryDonorOverview(r,{restoreFocus:false});setTimeout(decorateRosary,0)}
  return
 }
 const f=e.target.closest?.('[data-v38-rosary-form]');if(f){S.rosary.form=f.dataset.v38RosaryForm==='devotional'?'devotional':'standard';save();setTimeout(decorateRosary,20)}
 const r=e.target.closest?.('[data-ao-recitation]');if(r){S.rosary.recitation=r.dataset.aoRecitation==='group'?'group':'individual';save();setTimeout(decorateRosary,20)}
 const d=e.target.closest?.('[data-p435930-rosary-depth]');if(d){S.rosary.mode=d.dataset.p435930RosaryDepth==='guided'?'guided':'simple';save();setTimeout(decorateRosary,0)}
 const m=e.target.closest?.('[data-p435930-recitation]');if(m){S.rosary.recitation=m.dataset.p435930Recitation==='group'?'group':'individual';save();try{localStorage.setItem('ao-prayer-recitation-mode',S.rosary.recitation)}catch{};setTimeout(decorateRosary,0)}
 const step=e.target.closest?.('[data-lab-rosary-next],[data-lab-rosary-prev],[data-v401-rosary-jump],[data-ao-rosary-bead],[data-lab-rosary-today],[data-pb-rosary-set],[data-lab-rosary-change],[data-pb-rosary-change]');
 if(step){if(step.matches?.('[data-lab-rosary-change],[data-pb-rosary-change]'))lastRosaryRitualKey='';setTimeout(decorateRosary,0)}
},true);
// Route old PRAY entry points through the final shared owner. No Mass route is intercepted.
document.addEventListener('click',e=>{
 const el=e.target.closest?.('[data-pb-module],[data-v37-open],[data-v4349-pray-open],[data-v383-open],[data-ao354-launch]');if(!el||el.closest(`#${ROOT_ID}`))return;
 let id='';if(el.dataset.pbModule){const m={rosary:'pray.rosary',angelus:'pray.angelus_regina',confession:'pray.confession',benediction:'pray.benediction',stations:'pray.stations'};id=m[el.dataset.pbModule]||''}
 if(el.dataset.v37Open)id=el.dataset.v37Open;if(el.dataset.v4349PrayOpen)id=el.dataset.v4349PrayOpen;if(el.dataset.v383Open)id=el.dataset.v383Open;
 if(el.dataset.ao354Launch){const m={'first-friday':'programme.first_friday','first-saturday':'programme.first_saturday'};id=m[el.dataset.ao354Launch]||id}
 if(!TARGET[id])return;e.preventDefault();e.stopImmediatePropagation();open(id,{trigger:el,returnContext:PRAY_CTX});
},true);
document.addEventListener('keydown',e=>{
 const flip=e.target?.closest?.("#aoPrayerBookRoot[data-ao-rosary-active-root='true'] .lab-prayer-flip[data-pb-flip]");
 if(flip&&(e.key==='Enter'||e.key===' ')){
  e.preventDefault();e.stopImmediatePropagation();toggleRosaryPrayerLanguage(flip);return;
 }
 const r=document.getElementById(ROOT_ID);if(!r?.classList.contains('open'))return;
 if(view==='adoration'&&ADOR.quiet){
  if(e.key==='Escape'){e.preventDefault();exitAdorationQuiet();return}
  if(e.key==='Tab'){e.preventDefault();r.querySelector('[data-p435930-ador-quiet-exit]')?.focus?.();return}
 }
 if((view==='firstFriday'||view==='firstSaturday')&&
   (e.key==='ArrowRight'||e.key==='ArrowLeft')&&
   !e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&
   r.contains(e.target)&&e.target.closest('.aoP435930Body')&&
   !e.target.closest('button,a,input,textarea,select,summary,[contenteditable]')){
  e.preventDefault();
  horizontalStep(e.key==='ArrowRight'?1:-1);
  // The programme re-renders on a stage change; keep keyboard reading focus.
  queueMicrotask(()=>r.querySelector('.aoP435930Body')?.focus?.({preventScroll:true}));
  return;
 }
 // The Tenebrae stage owner is already horizontalStep; this is only a
 // keyboard fallback for the swipe-first source reader, not a second cursor.
 if(view==='tenebrae'&&TEN.model&&
    (e.key==='ArrowRight'||e.key==='ArrowLeft')&&
    !e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&
    r.contains(e.target)&&e.target.closest('.aoTenebReading')&&
    !e.target.closest('button,a,input,textarea,select,summary,[contenteditable]')){
  e.preventDefault();
  horizontalStep(e.key==='ArrowRight'?1:-1);
  queueMicrotask(()=>r.querySelector('.aoTenebReading')?.focus?.({preventScroll:true}));
  return;
 }
 if((view==='benediction'||view==='adoration'&&['visit','holy','four'].includes(ADOR.mode))&&
   (e.key==='ArrowRight'||e.key==='ArrowLeft')&&
   !e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&
   r.contains(e.target)&&e.target.closest('.aoDevoCardScroll')&&
   !e.target.closest('button,a,input,textarea,select,summary,[contenteditable]')){
  e.preventDefault();
  horizontalStep(e.key==='ArrowRight'?1:-1);
  queueMicrotask(()=>r.querySelector('.aoDevoCardScroll')?.focus?.({preventScroll:true}));
  return;
 }
 if(view==='stations'&&
   (e.key==='ArrowRight'||e.key==='ArrowLeft')&&
   !e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&
   r.contains(e.target)&&e.target.closest('.aoP435930Stations .aoDevoCardScroll')&&
   !e.target.closest('button,a,input,textarea,select,summary,[contenteditable]')){
  e.preventDefault();
  horizontalStep(e.key==='ArrowRight'?1:-1);
  queueMicrotask(()=>r.querySelector('.aoP435930Stations .aoDevoCardScroll')?.focus?.({preventScroll:true}));
  return;
 }
 if(e.key==='Escape'){e.preventDefault();close();return}
 if(e.key==='Tab'){const f=focusables();if(!f.length){e.preventDefault();return}const first=f[0],last=f[f.length-1],a=document.activeElement;if(e.shiftKey&&(a===first||!r.contains(a))){e.preventDefault();last.focus()}else if(!e.shiftKey&&(a===last||!r.contains(a))){e.preventDefault();first.focus()}}
});
const TARGET={
 'pray.hub':{id:'pray.hub',type:'module',domain:'pray',category:'hub',title:'Pray'},
 'pray.rosary':{id:'pray.rosary',type:'module',domain:'pray',category:'marian',title:'Holy Rosary'},
 'pray.angelus_regina':{id:'pray.angelus_regina',type:'module',domain:'pray',category:'daily-prayer',title:'Angelus / Regina Cæli'},
 'pray.angelus':{id:'pray.angelus',type:'alias',domain:'pray',category:'daily-prayer',title:'Angelus / Regina Cæli'},
 'pray.confession':{id:'pray.confession',type:'module',domain:'pray',category:'confession',title:'Confession'},
 'pray.benediction':{id:'pray.benediction',type:'module',domain:'pray',category:'eucharistic',title:'Benediction'},
 'pray.adoration':{id:'pray.adoration',type:'module',domain:'pray',category:'eucharistic',title:'Adoration'},
 'pray.stations':{id:'pray.stations',type:'module',domain:'pray',category:'penance-passion',title:'Stations of the Cross'},
 'pray.five_wounds':{id:'pray.five_wounds',type:'module',domain:'pray',category:'penance-passion',title:'Chaplet of the Five Wounds'},
 'pray.visit_blessed_sacrament':{id:'pray.visit_blessed_sacrament',type:'module',domain:'pray',category:'eucharistic',title:'Visit to the Blessed Sacrament'},
 'pray.library':{id:'pray.library',type:'module',domain:'pray',category:'library',title:'Prayer Library'},
 'pray.penitential_psalms':{id:'pray.penitential_psalms',type:'module',domain:'pray',category:'penance-passion',title:'Seven Penitential Psalms'},
 'pray.litany_saints':{id:'pray.litany_saints',type:'module',domain:'pray',category:'penance-passion',title:'Litany of the Saints'},
 'pray.seven_words':{id:'pray.seven_words',type:'module',domain:'pray',category:'penance-passion',title:'Seven Words of Our Lord'},
 'pray.tenebrae':{id:'pray.tenebrae',type:'module',domain:'pray',category:'penance-passion',title:'Office of Tenebrae'},
 'pray.forty_hours':{id:'pray.forty_hours',type:'module',domain:'pray',category:'eucharistic',title:'Forty Hours'},
 'pray.de_profundis':{id:'pray.de_profundis',type:'prayer',domain:'pray',category:'dead',title:'De profundis'},
 'pray.eternal_rest':{id:'pray.eternal_rest',type:'prayer',domain:'pray',category:'dead',title:'Requiem æternam'},
 'programme.first_friday':{id:'programme.first_friday',type:'programme',domain:'pray',category:'sacred-heart-reparation',title:'Nine First Fridays'},
 'programme.first_saturday':{id:'programme.first_saturday',type:'programme',domain:'pray',category:'immaculate-heart-reparation',title:'Five First Saturdays'}
};
if(BASE&&!BASE.__v435930PrayAudit){
 const wrapper={__v435930PrayAudit:true,
  get(id){return TARGET[id]||BASE.get?.(id)||null},
  resolve(id){if(id==='pray.angelus')return {ok:true,id,definition:TARGET['pray.angelus_regina'],defaults:{},chain:['pray.angelus','pray.angelus_regina']};if(TARGET[id])return {ok:true,id,definition:TARGET[id],defaults:{},chain:[id]};return BASE.resolve?.(id)||{ok:false,error:'UNKNOWN_MODULE'}},
  async open(id,opts={}){const canonical=id==='pray.angelus'?'pray.angelus_regina':id;if(TARGET[canonical])return {ok:!!open(canonical,opts),input:String(id),canonicalId:canonical,type:TARGET[canonical].type,domain:'pray',options:opts,aliasChain:id===canonical?[id]:[id,canonical],error:null};return BASE.open?.(id,opts)},
  list(filter={}){const prior=(BASE.list?.(filter)||[]).filter(x=>!TARGET[x.id]);const own=Object.values(TARGET).filter(x=>x.id!=='pray.angelus'&&(!filter.domain||String(x.domain).toLowerCase()===String(filter.domain).toLowerCase())&&(!filter.type||x.type===filter.type));return [...prior,...own]},
  canonicalForElement(el){let id=el?.dataset?.v4349PrayOpen||el?.dataset?.v37Open||el?.dataset?.v383Open||'';if(TARGET[id])return id;return BASE.canonicalForElement?.(el)||null},
  auditDOM(...args){return BASE.auditDOM?.(...args)},
  qa(){const q=BASE.qa?.()||{};return {...q,v435930PrayAudit:true,v435930Definitions:Object.keys(TARGET).length}},COLLECTION:BASE.COLLECTION
 };window.AO_MODULES=wrapper;window.AO_MODULE_REGISTRY_V36=wrapper;
}
// Canonical PRAY domain entry: bottom navigation and returns from legacy PRAY modules land here.
const PRAY_SHELL=window.AO_V37_SHELL;
if(PRAY_SHELL&&!PRAY_SHELL.__v435930ModuleHome){
 const priorOpen=PRAY_SHELL.openDomain?.bind(PRAY_SHELL);
 PRAY_SHELL.openDomain=domain=>{
  if(String(domain).toLowerCase()==='pray'){
   try{PRAY_SHELL.close?.()}catch{}
   if(externalResume){const snap=externalResume;externalResume=null;reopenResume(snap);return true}
   open('pray.hub',{returnContext:null});
   return true;
  }
  return priorOpen?priorOpen(domain):false;
 };
 PRAY_SHELL.__v435930ModuleHome=true;
}
function qa(){
 const d=DATA.prayers||{},ids=Object.keys(d),missingProv=ids.filter(id=>!(d[id].provenance||d[id].source||d[id].sourceStatus));
 const immaculate=d.marian_consecration_immaculate_heart||{};
 return {version:VERSION,pass:ids.length===48&&!!P('sacrament_act_of_contrition')&&!!P('litany_loreto_1962'),prayerRecords:ids.length,sourceRegistry:Object.keys(SOURCE_REGISTRY).length,missingProvenanceSignals:missingProv,immaculateHeartLanguages:{en:!!immaculate.en,fr:!!immaculate.fr,la:!!immaculate.la},confessionPersistence:'session-only',massRoutesIntercepted:false,angelusUsesCanonicalPaschalContext:true,internalNavigation:'stack',externalResume:true,dialogFocusTrap:true,stageScrollReset:true};
}
window.AO_PRAY_SOURCE_REGISTRY_V435930=SOURCE_REGISTRY;
window.AO_PRAY_V435930={restoreHandoff,version:VERSION,uxContract:devotionalUxContract(),open,openFamily,close,state:()=>({...JSON.parse(JSON.stringify(S)),view,confessionStage:CONF.stage,confessionPath:CONF.path,confessionExaminationStep:CONF.examStep,benedictionStep:BEN.step,adorationMode:ADOR.mode,adorationPresence:adorationPresence()}),setRecitationMode,applySettingsPreferences,sources:SOURCE_REGISTRY,qa,clearSavedState(){S=cloneDefault();setAdorationPresence('reserved');save();return true}};
})();


}
