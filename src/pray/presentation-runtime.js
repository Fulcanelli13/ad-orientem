import "./canonical-data.js";
import "./presentation-styles.js";
import { canonicalAssetIdForPrayRoute, getCanonicalAsset, resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { formatDisplayDate, parseDisplayDate } from "../app/date-format.js";
import { isFirstWeekday as calendarIsFirstWeekday } from "../calendar/intelligence.js";

// Locked v43.59.30 PRAY presentation runtime. Kept intact inside a browser-only
// guard so unit tests may import the modular owner without a DOM.
if(typeof window!=="undefined"&&typeof document!=="undefined"&&!window.AO_PRAY_V435930){

(()=>{'use strict';
const VERSION='43.59.30-pray-acceptance';
const STORE_KEY='ao.pray.v435930';
const ROOT_ID='aoPray435930';
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
// TODO(ANGELUS_POSTURE_SATURDAY_VESPERS): standing from Saturday Vespers needs a liturgical-day boundary authority.
 // Do not infer this from a fixed civil-clock hour; current state only certifies civil Sunday plus Regina Cæli.
function selectedSunday(){
 const raw=core()?.selectedDate;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(raw||'')))return new Date().getDay()===0;
 const d=new Date(String(raw)+'T12:00:00');
 return !Number.isNaN(d.getTime())&&d.getDay()===0;
}
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
 const form=angelusChoice().form,stand=form==='regina'||selectedSunday();
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
   const stage=BEN_STAGES?.[BEN.step]?.[0]||'exposition';
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
 }else if(view==='confession'){
   if(CONF.stage===3)left=semanticRailChip('ao-live-sign-cross',L('Sign of Cross','Signe de croix'),L('In Confessional','Au confessionnal'),{channel:'transient'});
   right=semanticRailChip(
     'ao-rich-confession',
     L('Confession','Confession'),
     [L('Doctrine','Doctrine'),L('Prepare','Préparer'),L('Examination','Examen'),L('In Confessional','Au confessionnal'),L('After','Après')][CONF.stage]||L('Preparation','Préparation'),
     {channel:'persistent'}
   );
 }
 if(!left&&!right)return'';
 return `<div class="aoP435930SemanticRails" data-ao-pray-semantic-rails aria-hidden="true">${left?`<aside class="aoP435930SemanticRail left">${left}</aside>`:''}${right?`<aside class="aoP435930SemanticRail right">${right}</aside>`:''}</div>`;
}
const nl=v=>esc(v).replace(/\n/g,'<br>');
const runtime=()=>window.AO_RUNTIME_V8;
const core=()=>runtime()?.store?.getState?.()||{};
const isFr=()=>core()?.language==='fr';
const L=(en,fr)=>isFr()?(fr||en):en;
const lang=()=>isFr()?'fr':'en';
const P=id=>DATA.prayers?.[id]||null;
const nowIso=()=>new Date().toISOString();
const DEFAULT_STATE=Object.freeze({
  angelusMode:'auto',angelusHistoricalConclusion:false,
  rosary:{form:'standard',mode:'simple',recitation:'individual'},
  stations:{mode:'guided',stabat:false},
  adoration:{presence:'reserved'},
  firstFriday:{records:[]},firstSaturday:{records:[]}
});
function cloneDefault(){return JSON.parse(JSON.stringify(DEFAULT_STATE))}
function load(){
  const d=cloneDefault();
  try{
    const raw=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
    if(!raw||typeof raw!=='object')return d;
    d.angelusMode=['auto','angelus','regina'].includes(raw.angelusMode)?raw.angelusMode:'auto';
    d.angelusHistoricalConclusion=!!raw.angelusHistoricalConclusion;
    d.rosary.form=raw.rosary?.form==='devotional'?'devotional':'standard';
    d.rosary.mode=raw.rosary?.mode==='guided'?'guided':'simple';
    d.rosary.recitation=raw.rosary?.recitation==='group'?'group':'individual';
    d.stations.mode=raw.stations?.mode==='simple'?'simple':'guided';
    d.stations.stabat=!!raw.stations?.stabat;
    d.adoration.presence='reserved';
    d.firstFriday.records=Array.isArray(raw.firstFriday?.records)?raw.firstFriday.records.filter(x=>x&&x.date).slice(-36):[];
    d.firstSaturday.records=Array.isArray(raw.firstSaturday?.records)?raw.firstSaturday.records.filter(x=>x&&x.date).slice(-36):[];
  }catch{}
  return d;
}
let S=load();
let view='home',returnContext=null,returnFocus=null,navStack=[],externalResume=null,rosaryDonorReturnSnapshot=null,lastRenderSignature='';
let CONF={stage:0,marked:new Set(),since:'',graveReviewed:false,contrition:false};
let BEN={step:0,divinePraises:false};
let ADOR={mode:'home',visitStep:0,holyStep:0,fourStep:0,timer:null,timerEnd:0};
let FF={step:0,intention:false,communion:false};
let FS={step:0,intention:false,communion:false,rosary:false,meditation:false,confessionDate:'',medSet:'joyful',medMystery:0};
let PEN={step:0,token:0};
let LIT={step:0,sections:null,loading:false,error:'',token:0};
let SEVEN={step:0,sections:null,loading:false,error:'',srcToken:0,scriptToken:0};
let FORTY={step:0};
let STATIONS={step:0};
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
 if(!root||!rail)return;
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
function setRecitationMode(mode){S.rosary.recitation=mode==='group'?'group':'individual';save();try{localStorage.setItem('ao-prayer-recitation-mode',S.rosary.recitation)}catch{};return S.rosary.recitation}
function applySettingsPreferences(raw={}){
 const prayer=raw&&typeof raw==='object'?raw:{};
 const recitation=prayer.recitationMode==='group'?'group':prayer.recitationMode==='individual'?'individual':null;
 if(recitation)S.rosary.recitation=recitation;
 const stations=prayer.stations&&typeof prayer.stations==='object'?prayer.stations:{};
 if(stations.mode==='simple'||stations.mode==='guided')S.stations.mode=stations.mode;
 if(typeof stations.stabatMater==='boolean')S.stations.stabat=stations.stabatMater;
 const angelus=prayer.angelus&&typeof prayer.angelus==='object'?prayer.angelus:{};
 if(angelus.seasonalForm==='angelus')S.angelusMode='angelus';
 else if(angelus.seasonalForm==='regina_caeli')S.angelusMode='regina';
 else if(angelus.seasonalForm==='auto')S.angelusMode='auto';
 if(typeof angelus.traditionalConclusion==='boolean')S.angelusHistoricalConclusion=angelus.traditionalConclusion;
 save();
 if(recitation){try{localStorage.setItem('ao-prayer-recitation-mode',recitation)}catch{}}
 try{window.AO_PRAY_COHERENCE_V435930?.setMode?.(S.rosary.recitation)}catch{}
 if(document.getElementById(ROOT_ID)?.classList?.contains('open')){
  if(view==='stations'||view==='angelus')render();
 }
 return {
  recitationMode:S.rosary.recitation,
  stations:{mode:S.stations.mode,stabatMater:S.stations.stabat},
  angelus:{seasonalForm:S.angelusMode==='regina'?'regina_caeli':S.angelusMode,traditionalConclusion:!!S.angelusHistoricalConclusion}
 };
}
function shell(){
  let r=document.getElementById(ROOT_ID);if(r)return r;
  r=document.createElement('div');r.id=ROOT_ID;r.className='aoP435930Backdrop';r.setAttribute('aria-hidden','true');
  r.innerHTML='<section class="aoP435930Sheet" role="dialog" aria-modal="true" aria-labelledby="aoP435930Title"><div class="aoP435930Mount"></div></section>';
  document.body.appendChild(r);
  r.addEventListener('click',onClick);
  r.addEventListener('change',onChange);
  r.addEventListener('input',onInput);
  return r;
}
function mount(){return shell().querySelector('.aoP435930Mount')}
function open(id,opts={}){
  if(!document.getElementById('aoPrayerBookRoot')?.classList?.contains('open'))clearRosaryDonorReturn();
  returnContext=Object.prototype.hasOwnProperty.call(opts,'returnContext')?opts.returnContext:PRAY_CTX;returnFocus=opts.trigger||document.activeElement;
  navStack=[];
  if(id==='pray.hub')view='home';
  else if(id==='pray.angelus'||id==='pray.angelus_regina')view='angelus';
  else if(id==='pray.rosary'){
    view='home';navStack=[];
    return launchRosaryPlayer({view:'home',navStack:[],prayerReturnView:null,prayerId:null});
  }
  else if(id==='pray.confession')view='confession';
  else if(id==='pray.benediction')view='benediction';
  else if(id==='pray.adoration')view='adoration';
  else if(id==='pray.stations'){view='stations';STATIONS.step=0}
  else if(id==='pray.visit_blessed_sacrament'){view='adoration';ADOR.mode='visit'}
  else if(id==='pray.library')view='library';
  else if(id==='pray.penitential_psalms'){view='penitential';PEN.step=0}
  else if(id==='pray.litany_saints'){view='litany';LIT.step=0}
  else if(id==='pray.seven_words'){view='sevenWords';SEVEN.step=0}
  else if(id==='pray.forty_hours'){view='fortyHours';FORTY.step=0}
  else if(id==='pray.de_profundis'){view='prayerOnly';prayerReturnView='home';prayerId='dead_de_profundis'}
  else if(id==='pray.eternal_rest'){view='prayerOnly';prayerReturnView='home';prayerId='foundations_eternal_rest'}
  else if(id==='programme.first_friday')view='firstFriday';
  else if(id==='programme.first_saturday')view='firstSaturday';
  else return false;
  const r=shell();r.classList.add('open');r.setAttribute('aria-hidden','false');document.body.classList.add('aoP435930Open');render();
  queueMicrotask(()=>r.querySelector('button,[href],input,[tabindex]:not([tabindex="-1"])')?.focus?.());
  return true;
}
function close({silent=false}={}){
  stopTimer();const r=document.getElementById(ROOT_ID);r?.classList.remove('open');r?.setAttribute('aria-hidden','true');document.body.classList.remove('aoP435930Open');
  // Hard privacy boundary: examination state exists only for this open session.
  CONF={stage:0,marked:new Set(),since:'',graveReviewed:false,contrition:false};
  BEN={step:0,divinePraises:false};ADOR={mode:'home',visitStep:0,holyStep:0,fourStep:0,timer:null,timerEnd:0};
  if(!silent){FF={step:0,intention:false,communion:false};FS={step:0,intention:false,communion:false,rosary:false,meditation:false,confessionDate:'',medSet:'joyful',medMystery:0}}
  const ret=returnContext;returnContext=null;if(!silent){navStack=[];externalResume=null}if(!silent&&ret)queueMicrotask(()=>window.AO_NAV_V362?.restore?.(ret));
  try{returnFocus?.focus?.()}catch{} returnFocus=null;
}
function head(title,sub=''){
 const trailing=`<button type="button" class="aoP435930Close" data-p435930-close aria-label="${esc(L('Close','Fermer'))}">${assetIcon('ao-ui-close')}</button>`;
 return `<header class="aoP435930Head"><button type="button" class="aoP435930Back" data-p435930-back aria-label="${esc(L('Back','Retour'))}">${assetIcon('ao-ui-back')}</button><div><small>${esc(L('PRAY','PRIER'))}</small><h1 id="aoP435930Title">${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div>${trailing}</header>`;
}
function nav(title,items,active){return `<div class="aoP435930Seg" role="group" aria-label="${esc(title)}">${items.map(x=>`<button type="button" class="${x[0]===active?'active':''}" aria-pressed="${x[0]===active?'true':'false'}" data-p435930-seg="${esc(x[0])}">${esc(L(x[1],x[2]))}</button>`).join('')}</div>`}
function callout(text,type='info'){return `<div class="aoP435930Callout ${esc(type)}">${text}</div>`}
function sourceLine(p){if(!p)return'';const pr=p.provenance||{};const witness=pr.witness||p.source||L('Prayer source retained in the app','Source de la prière conservée dans l’application');return `<details class="aoP435930Source"><summary>${esc(L('Source / provenance','Source / provenance'))}</summary><p><b>${esc(pr.work||p.title||p.id)}</b></p><p>${esc(witness)}</p>${pr.adaptation?`<small>${esc(pr.adaptation)}</small>`:''}</details>`}
function prayerBlock(id,opts={}){
 const p=P(id);if(!p)return callout(esc(L('Prayer unavailable in this build.','Prière indisponible dans cette version.')),'warn');
 const vern=p[lang()]||'',latin=p.la||'',both=!!(latin&&vern),shown=vern||latin;
 return `<article class="aoP435930Prayer"><div class="aoP435930PrayerHead"><div><small>${esc(opts.kicker||'')}</small><h3>${esc(isFr()?(p.titleFr||p.title):p.title)}</h3></div>${both?'<span>LA ↔ '+(isFr()?'FR':'EN')+'</span>':''}</div>${both?`<button type="button" class="aoP435930Flip" data-p435930-flip aria-label="${esc(L('Switch prayer language','Changer la langue de la prière'))}"><span data-face-la>${nl(latin)}</span><span data-face-v hidden>${nl(vern)}</span></button>`:`<div class="aoP435930Text">${nl(shown)}</div>`}${sourceLine(p)}</article>`;
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
function renderPrayHome(){
 const sections=[
  {title:L('Daily & Marian','Quotidien & marial'),sub:L('Prayer that naturally structures the day.','Prière qui structure naturellement la journée.'),items:[
   ['own','pray.angelus_regina',L('Angelus / Regina Cæli','Angélus / Regina Cæli'),L('Daily Marian prayer · season-aware','Prière mariale quotidienne · selon le temps liturgique')],
   ['own','pray.rosary',L('Holy Rosary','Saint Rosaire'),L('Mysteries · guided or simple · individual or group','Mystères · guidé ou simple · individuel ou groupe')]
  ]},
  {title:L('Eucharistic','Eucharistique'),sub:L('Prayer before the Blessed Sacrament and companions for public Eucharistic devotion.','Prière devant le Saint-Sacrement et compagnons pour les dévotions eucharistiques publiques.'),items:[
   ['own','pray.adoration',L('Adoration & Visit','Adoration & visite'),L('Visit · open adoration · Holy Hour · Four Ends','Visite · adoration libre · Heure Sainte · quatre fins')],
   ['own','pray.benediction',L('Benediction','Bénédiction'),L('Live companion · follow what is happening in church','Compagnon en direct · suivre ce qui se passe dans l’église')],
   ['own','pray.forty_hours',L('Forty Hours','Quarante-Heures'),L('Live companion for prolonged exposition · yields to public rites','Compagnon pour l’exposition prolongée · s’efface devant les rites publics')]
  ]},
  {title:L('Penance, Passion & Intercession','Pénitence, Passion & intercession'),sub:L('Preparation for Confession and traditional devotions centred on repentance, the Passion and intercession.','Préparation à la Confession et dévotions traditionnelles centrées sur la pénitence, la Passion et l’intercession.'),items:[
   ['own','pray.confession',L('Confession','Confession'),L('Recollect · examine · contrition · after Confession','Recueillement · examen · contrition · après la Confession')],
   ['own','pray.stations',L('Stations of the Cross','Chemin de Croix'),L('14 Stations · guided or simple · optional Stabat Mater','14 stations · guidé ou simple · Stabat Mater facultatif')],
   ['own','pray.penitential_psalms',L('Seven Penitential Psalms','Sept psaumes pénitentiels'),L('Seven psalms · continues naturally into the Litany','Sept psaumes · se poursuit naturellement par les Litanies')],
   ['own','pray.seven_words',L('Seven Words of Our Lord','Sept Paroles de Notre-Seigneur'),L('Gospel word · traditional meditation · silence','Parole évangélique · méditation traditionnelle · silence')],
   ['own','pray.litany_saints',L('Litany of the Saints','Litanies des saints'),L('Call and response · individual or group','Invocations et répons · individuel ou groupe')]
  ]},
  {title:L('Devotional programmes','Programmes dévotionnels'),sub:L('Multi-month practices with guided stages; the app records only what you explicitly report.','Pratiques sur plusieurs mois avec étapes guidées ; l’application ne mémorise que ce que vous déclarez explicitement.'),items:[
   ['own','programme.first_friday',L('Nine First Fridays','Neuf premiers vendredis'),L('Guided Sacred Heart reparatory programme','Programme réparateur guidé du Sacré-Cœur')],
   ['own','programme.first_saturday',L('Five First Saturdays','Cinq premiers samedis'),L('Guided Immaculate Heart reparatory programme','Programme réparateur guidé du Cœur Immaculé')]
  ]},
  {title:L('Around Mass','Autour de la Messe'),sub:L('Preparation and thanksgiving remain tied to the Mass lifecycle rather than duplicated in PRAY.','La préparation et l’action de grâces restent liées au cycle de la Messe au lieu d’être dupliquées dans PRIER.'),items:[
   ['handoff','mass.prepare',L('Before Mass','Avant la Messe'),L('Preparation · recollection · offering','Préparation · recueillement · offrande')],
   ['handoff','mass.thanksgiving',L('After Mass','Après la Messe'),L('Immediate thanks · thanksgiving · return to duty','Remerciement immédiat · action de grâces · retour au devoir')]
  ]}
 ];
 const kind=it=>it[0]==='handoff'?L('AROUND MASS','AUTOUR DE LA MESSE'):it[1].startsWith('programme.')?L('PROGRAMME','PROGRAMME'):['pray.benediction','pray.forty_hours'].includes(it[1])?L('LIVE COMPANION','COMPAGNON EN DIRECT'):L('GUIDED','GUIDÉ');
 const card=it=>`<button type="button" class="aoP435930ModuleCard" ${it[0]==='own'?`data-p435930-own="${esc(it[1])}"`:`data-p435930-handoff="${esc(it[1])}"`}>${it[0]==='own'?moduleIcon(it[1]):''}<small class="aoP435930ModuleKind">${esc(kind(it))}</small><b>${esc(it[2])}</b><span class="aoP435930ModuleDescription">${esc(it[3])}</span><i aria-hidden="true">${assetIcon('ao-ui-next')}</i></button>`;
 return `${head(L('Pray','Prier'),L('Choose the kind of prayer you need','Choisissez le type de prière dont vous avez besoin'))}<main class="aoP435930Body aoP435930Home"><section class="aoP435930HomeIntro"><small>${esc(L('PRAY','PRIER'))}</small><h2>${esc(L('One place for the app’s prayer life','Un seul espace pour la vie de prière de l’application'))}</h2><p>${esc(L('Guided devotions, live companions, programmes and individual prayer texts are kept distinct so the next step is clear.','Les dévotions guidées, compagnons en direct, programmes et prières individuelles restent distincts afin que l’étape suivante soit évidente.'))}</p></section>${sections.map(sec=>`<section class="aoP435930ModuleSection"><div class="aoP435930ModuleSectionHead"><h3>${esc(sec.title)}</h3><p>${esc(sec.sub)}</p></div><div class="aoP435930ModuleGrid">${sec.items.map(card).join('')}</div></section>`).join('')}<section class="aoP435930ModuleSection aoP435930LibraryDoor"><div class="aoP435930ModuleSectionHead"><h3>${esc(L('Prayer Library','Livre de prières'))}</h3><p>${esc(L('Use this when you want a particular prayer rather than a guided devotion.','Utilisez-le lorsque vous cherchez une prière précise plutôt qu’une dévotion guidée.'))}</p></div><button type="button" class="aoP435930ModuleCard primary" data-p435930-own="pray.library">${moduleIcon('pray.library')}<small class="aoP435930ModuleKind">${esc(L('REFERENCE','RÉFÉRENCE'))}</small><b>${esc(L('Browse individual prayers','Parcourir les prières individuelles'))}</b><span class="aoP435930ModuleDescription">${esc(Object.keys(DATA.prayers||{}).length+' '+L('prayers available','prières disponibles'))}</span><i aria-hidden="true">${assetIcon('ao-ui-next')}</i></button></section></main>`;
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
function renderAngelus(){
 const c=angelusChoice(),form=c.form,obj=form==='regina'?DATA.regina:DATA.angelus,vern=obj?.[lang()]||'',lat=obj?.la||'';
 const unitsV=angelusUnits(vern,form),unitsL=angelusUnits(lat,form);
 const authority=c.auto&&!c.authority.ok?callout(esc(L('Automatic seasonal selection could not read the canonical liturgical context, so Angelus is shown. You can choose Regina Cæli manually.','La sélection saisonnière automatique n’a pas pu lire le contexte liturgique canonique ; l’Angelus est donc affiché. Vous pouvez choisir manuellement le Regina Cæli.')),'warn'):'';
 const labels={vr:L('Versicle & response','Verset & répons'),hail:L('Hail Mary','Je vous salue Marie'),collect:L('Collect','Oraison'),prayer:L('Prayer','Prière')};
 const units=unitsV.map((u,i)=>{
  const la=unitsL[i]?.text||'';
  const incarnation=form==='angelus'&&u.type==='vr'&&/(Word was made flesh|Verbum caro factum est|Verbe s[’']est fait chair)/i.test(u.text+' '+la);
  return `<article class="aoP435930LitCard aoP435930PrayerUnit" data-ao-angelus-unit="${esc(u.type)}" data-ao-angelus-index="${i}"${incarnation?' data-ao-incarnation="true"':''}><small>${esc(labels[u.type]||labels.prayer)}</small><button type="button" data-p435930-card-flip aria-label="${esc(L('Switch prayer language','Changer la langue de la prière'))}"><span data-face-v>${nl(u.text)}</span><span data-face-la hidden>${nl(la)}</span></button></article>`;
 }).join('');
 return `${head(form==='regina'?'Regina Cæli':'Angelus',L('Season-aware daily Marian prayer','Prière mariale quotidienne selon le temps liturgique'))}<main class="aoP435930Body" data-ao-angelus-form="${form}">${nav(L('Form','Forme'),[['auto','Automatic','Automatique'],['angelus','Angelus','Angelus'],['regina','Regina Cæli','Regina Cæli']],S.angelusMode)}${authority}<section class="aoRitualReaderGrid aoAngelusRitualGrid" data-ao-ritual-reader="angelus">${angelusExactRailMarkup()}<div class="aoP435930Cards aoP435930AngelusSequence">${units}</div></section><label class="aoP435930Toggle"><input type="checkbox" data-p435930-angelus-appendix ${S.angelusHistoricalConclusion?'checked':''}> <span><b>${esc(L('Historical conclusion','Conclusion historique'))}</b><small>${esc(L('Optional · off by default','Facultative · désactivée par défaut'))}</small></span></label>${S.angelusHistoricalConclusion?`<article class="aoP435930Appendix"><h3>${esc(L('Traditional conclusion','Conclusion traditionnelle'))}</h3><button type="button" class="aoP435930AppendixFlip" data-p435930-flip aria-label="${esc(L('Switch prayer language','Changer la langue de la prière'))}"><span data-face-v>${nl(DATA.angelusAppendix?.[lang()]||'')}</span><span data-face-la hidden>${nl(DATA.angelusAppendix?.la||'')}</span></button></article>`:''}</main>`;
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
 reopenResume(snapshot);
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
 try{window.AO_ROSARY_V381?.setForm?.(prefs.form)}catch{}
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
   action={value:'scripture-silence',label:L('Scripture · brief silence','Écriture · bref silence'),symbol:'·',persistent:false};
 }
 return{gesture,action,key,entering};
}
function rosaryDonorProgress(info){
 const current=Number.isInteger(info?.mi)?info.mi:null;
 return Array.from({length:5},(_,i)=>`<i class="${current!==null&&i<current?'done':current===i?'current':''}" data-mystery="${i+1}"></i>`).join('');
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
function ensureRosaryDonorProgress(r,info){
 const center=r.querySelector('.aoRosaryRitualCenter')||r.querySelector('.pbShell');if(!center)return null;
 let bar=center.querySelector(':scope > .rosary-decade-bar-v15[data-ao-exact-donor-progress]');
 if(!bar){
  bar=document.createElement('div');
  bar.className='rosary-decade-bar-v15';
  bar.dataset.aoExactDonorProgress='v3.4.14';
  bar.setAttribute('aria-hidden','true');
  const first=center.firstElementChild;
  if(first)first.insertAdjacentElement('afterend',bar);else center.prepend(bar);
 }
 bar.innerHTML=rosaryDonorProgress(info);
 bar.dataset.currentMystery=info?.mi===null?'':String(info.mi+1);
 return bar;
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

function rosaryDonorOverviewModel(info){
 const xs=info?.steps||[],current=Number(info?.index)||0;
 const mysteries=Array.from({length:5},(_,mi)=>{
  const index=xs.findIndex(x=>x?.kind==='mystery'&&Number(x?.mi)===mi);
  const step=index>=0?xs[index]:null;
  return {mi,index,title:String(step?.title||L(`Mystery ${mi+1}`,`Mystère ${mi+1}`)),current:Number(info?.mi)===mi};
 }).filter(x=>x.index>=0);
 const closing=xs.findIndex(x=>x?.kind==='conclusion'||x?.phase==='closing');
 return {current,mysteries,closing};
}
function ensureRosaryDonorOverview(r,info){
 const center=r.querySelector('.aoRosaryRitualCenter')||r.querySelector('.pbShell');if(!center)return null;
 const model=rosaryDonorOverviewModel(info);
 let opener=center.querySelector('[data-r23-overview-open]');
 if(!opener){
  opener=document.createElement('button');opener.type='button';opener.className='r23-overview-open';opener.dataset.r23OverviewOpen='';
  opener.textContent=L('Overview','Aperçu');opener.setAttribute('aria-haspopup','dialog');opener.setAttribute('aria-controls','r23-overview-sheet');
  const head=center.querySelector('.lab-view-head,.pbTop,.pbHead,header');
  if(head)head.appendChild(opener);else center.prepend(opener);
 }
 let sheet=center.querySelector('#r23-overview-sheet');
 if(!sheet){
  sheet=document.createElement('div');sheet.id='r23-overview-sheet';sheet.className='r23-modal';sheet.setAttribute('aria-hidden','true');
  center.appendChild(sheet);
 }
 const mysteryRows=model.mysteries.map(x=>`<button type="button" class="r23-overview-row${x.current?' current':''}" data-r23-overview-jump="${x.index}" data-r23-overview-mystery="${x.mi+1}"${x.current?' aria-current="step"':''}><span class="r23-overview-num">${x.mi+1}</span><span class="r23-overview-copy"><strong>${esc(x.title)}</strong><small>${esc(x.current?L('Current mystery','Mystère actuel'):L('Jump here','Aller ici'))}</small></span></button>`).join('');
 sheet.innerHTML=`<div class="r23-overview-panel" role="dialog" aria-modal="true" aria-labelledby="r23-overview-title"><div class="r23-overview-head"><div><small>${esc(L('The Holy Rosary','Le Saint Rosaire'))}</small><h2 id="r23-overview-title">${esc(L('Rosary overview','Aperçu du Rosaire'))}</h2></div><button type="button" data-r23-overview-close aria-label="${esc(L('Close overview','Fermer l’aperçu'))}">×</button></div><button type="button" class="r23-overview-section" data-r23-overview-jump="0"><span>${esc(L('Opening prayers','Prières d’introduction'))}</span><small>${model.current===0?esc(L('In progress','En cours')):esc(L('Jump here','Aller ici'))}</small></button><div class="r23-overview-mysteries">${mysteryRows}</div>${model.closing>=0?`<button type="button" class="r23-overview-section" data-r23-overview-jump="${model.closing}"><span>${esc(L('Closing prayers','Prières finales'))}</span><small>${esc(L('Jump here','Aller ici'))}</small></button>`:''}</div>`;
 return sheet;
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
 shell.dataset.aoRosaryBead=String(Number(info.step?.bead||0));
 shell.dataset.aoRosaryCue=info.step?.cue?'true':'false';
 shell.dataset.aoRosaryFinalCross=info.step?.finalCross?'true':'false';
 r.querySelectorAll('.rosary-decade-bar-v15[data-ao-exact-donor-progress]').forEach(node=>node.remove());
 ensureRosaryDonorRecitation(r);
 r.querySelectorAll('[data-r23-overview-open],#r23-overview-sheet').forEach(node=>node.remove());
 rosaryDonorArt(r,info);
 rosaryDonorMysteryFx(r,info);
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
function decorateRosary(){
 const r=rosaryDonorRoot();if(!r||!r.classList?.contains('open'))return;
 r.querySelectorAll('.flipHint,.translationNote,.pbFlipHint,.lab-flip-hint,[data-pb-flip-hint]').forEach(n=>{n.hidden=true;n.setAttribute('aria-hidden','true')});
 r.classList.toggle('aoP435930RosarySimple',S.rosary.mode==='simple');r.classList.toggle('aoP435930RosaryGuided',S.rosary.mode==='guided');
 let bar=r.querySelector('.aoP435930RosaryBar');if(!bar){bar=document.createElement('div');bar.className='aoP435930RosaryBar';bar.setAttribute('aria-label',L('Rosary reading depth','Profondeur du Rosaire'));const h=r.querySelector('.lab-view-head,.pbTop,.pbHead,header');h?.insertAdjacentElement('afterend',bar)}
 if(bar)bar.innerHTML=`<button type="button" data-p435930-rosary-depth="simple" class="${S.rosary.mode==='simple'?'active':''}" aria-pressed="${S.rosary.mode==='simple'}">${esc(L('Simple','Simple'))}</button><button type="button" data-p435930-rosary-depth="guided" class="${S.rosary.mode==='guided'?'active':''}" aria-pressed="${S.rosary.mode==='guided'}">${esc(L('Guided','Guidé'))}</button>`;
 if(S.rosary.mode==='guided'&&!r.querySelector('.aoP435930SilencePrompt')){const target=r.querySelector('.lab-contemplation');if(target){const n=document.createElement('div');n.className='aoP435930SilencePrompt';n.textContent=L('Silence · remain with the mystery before moving on.','Silence · demeurez avec le mystère avant de poursuivre.');target.appendChild(n)}}
 decorateRosaryExact(r);
 declutterRosaryDonor(r);
}
function renderConfession(){
 const stages=[L('Doctrine','Doctrine'),L('Prepare','Préparer'),L('Examination','Examen'),L('In Confessional','Au confessionnal'),L('After','Après')];
 const ex=isFr()?DATA.examFr:DATA.exam;let body='';
 if(CONF.stage===0)body=`${guideNow(L('What the Church teaches','Ce qu’enseigne l’Église'),L('The penitent approaches the sacrament with contrition, confession and satisfaction; sacramental absolution belongs to the priest. Ad Orientem assists preparation but never judges validity or simulates absolution.','Le pénitent approche le sacrement avec contrition, confession et satisfaction ; l’absolution sacramentelle appartient au prêtre. Ad Orientem aide à la préparation mais ne juge jamais la validité et ne simule jamais l’absolution.'))}${guideCue(L('GRAVE SIN','PÉCHÉ GRAVE'),L('Grave matter, full knowledge and deliberate consent are required together. If you are unsure, bring the matter to the priest rather than using the app as a classifier.','Matière grave, pleine connaissance et consentement délibéré sont requis ensemble. En cas de doute, exposez la question au prêtre plutôt que d’utiliser l’application comme classificateur.'))}`;
 if(CONF.stage===1)body=`${guideNow(L('Prepare before God','Se préparer devant Dieu'),L('Become recollected, ask for light, recall approximately how long it has been since your last Confession, and prepare sufficiently without chasing absolute certainty.','Recueillez-vous, demandez la lumière, rappelez-vous approximativement depuis combien de temps remonte votre dernière confession et préparez-vous suffisamment sans rechercher une certitude absolue.'))}<div class="aoP435930Checklist"><label><span>${esc(L('Since my last Confession','Depuis ma dernière confession'))}</span><input type="text" autocomplete="off" data-p435930-since value="${esc(CONF.since)}" placeholder="${esc(L('e.g. 3 weeks','p. ex. 3 semaines'))}"></label></div>${callout(esc(L('This field is session-only and is cleared when you leave Confession. No sin list is stored.','Ce champ n’existe que pendant cette session et est effacé lorsque vous quittez Confession. Aucune liste de péchés n’est enregistrée.')),'privacy')}${guidePrayers([{id:'sacrament_come_holy_spirit',kicker:L('Prayer for light','Prière pour demander la lumière')}])}`;
 if(CONF.stage===2)body=`${guideNow(L('Examine your conscience','Examinez votre conscience'),L('Move through the prompts slowly. They are points for reflection, not boxes to tick. Stop when the examination is sufficient and move to contrition.','Parcourez lentement les questions. Ce sont des points de réflexion, non des cases à cocher. Arrêtez lorsque l’examen est suffisant et passez à la contrition.'))}<p class="aoP435930Lead">${esc(ex?.intro||'')}</p><div class="aoP435930Exam aoP435930ExamReadOnly">${(ex?.sections||[]).map(sec=>`<details><summary>${esc(sec[0])}</summary><ul>${sec[1].map(q=>`<li>${esc(q)}</li>`).join('')}</ul></details>`).join('')}</div>${callout(esc(L('Nothing in this examination is selected, scored, saved, synced or converted into a sin list.','Rien dans cet examen n’est sélectionné, noté, enregistré, synchronisé ni transformé en liste de péchés.')),'privacy')}${guidePrayers([{id:'sacrament_act_of_contrition',kicker:L('Act of Contrition','Acte de contrition')}])}`;
 if(CONF.stage===3)body=`${guideNow(L('In the confessional','Au confessionnal'),L('Put the phone away. Confess remembered grave sins by kind and number; if a number is genuinely uncertain, give the best truthful estimate and say that you are estimating. Then confess other sins you wish to bring. Listen to the priest, receive the penance, make the Act of Contrition when directed, and attend to absolution.','Rangez le téléphone. Confessez les péchés graves dont vous vous souvenez selon leur espèce et leur nombre ; si le nombre est réellement incertain, donnez votre meilleure estimation sincère et précisez qu’il s’agit d’une estimation. Confessez ensuite les autres péchés que vous souhaitez accuser. Écoutez le prêtre, recevez la pénitence, faites l’Acte de contrition lorsqu’il vous y invite et soyez attentif à l’absolution.'))}${callout(esc(L('The app never records, transcribes or simulates the sacrament.','L’application n’enregistre, ne transcrit ni ne simule jamais le sacrement.')),'privacy')}`;
 if(CONF.stage===4)body=`${guideNow(L('Give thanks and complete what was given','Rendez grâce et accomplissez ce qui vous a été donné'),L('Thank God for His mercy. Carry out the penance promptly, make restitution where justice requires it, and choose one concrete amendment.','Remerciez Dieu pour sa miséricorde. Accomplissez rapidement la pénitence, faites restitution lorsque la justice l’exige et choisissez une résolution concrète.'))}<div class="aoP435930Doctrine"><article><h3>${esc(L('Penance','Pénitence'))}</h3><p>${esc(L('Do it as soon as reasonably possible.','Accomplissez-la dès que raisonnablement possible.'))}</p></article><article><h3>${esc(L('Repair','Réparation'))}</h3><p>${esc(L('Repair concrete harm where justice requires it and where this can prudently be done.','Réparez le tort concret lorsque la justice l’exige et que cela peut être fait prudemment.'))}</p></article><article><h3>${esc(L('Amendment','Résolution'))}</h3><p>${esc(L('Choose one specific amendment rather than reopening the whole examination.','Choisissez une résolution précise plutôt que de recommencer tout l’examen.'))}</p></article></div><button class="aoP435930Danger" type="button" data-p435930-conf-clear>${esc(L('Clear this preparation now','Effacer cette préparation maintenant'))}</button>`;
 return `${head(L('Confession','Confession'),L('Doctrine · prepare · examination · in Confessional · after','Doctrine · préparer · examen · au confessionnal · après'))}${guideRail(stages,CONF.stage,'conf')}<main class="aoP435930Body">${body}${guideNav('conf',CONF.stage,stages.length,L('Return to PRAY','Retour à PRIER'))}</main>`;
}
const BEN_STAGES=[
 ['exposition','Exposition','Exposition'],['adoration','Adoration','Adoration'],['hymn','Tantum Ergo','Tantum Ergo'],['prayer','Versicle & collect','Verset et oraison'],['blessing','Blessing','Bénédiction'],['praises','Divine Praises','Louanges divines'],['reposition','Reposition','Reposition']
];
function benMacroIndex(step){if(step<=0)return 0;if(step===1)return 1;if(step>=6)return 3;return 2}
function benMacroRail(step){const labels=[L('Exposition','Exposition'),L('Adoration','Adoration'),L('Benediction','Bénédiction'),L('Reposition','Reposition')];return `<div class="aoP435930StageRail aoP435930BenMacroRail">${labels.map((x,i)=>`<span class="${i===benMacroIndex(step)?'active':''}" ${i===benMacroIndex(step)?'aria-current="step"':''}>${esc(x)}</span>`).join('')}</div>`}
function renderBenediction(){
 const i=BEN.step,id=BEN_STAGES[i][0],titles=BEN_STAGES.map(x=>L(x[1],x[2]));let body='';
 if(id==='exposition')body=`${guideNow(L('Attend to the Exposition','Soyez attentif à l’exposition'),L('When the Blessed Sacrament is exposed, turn your attention to the altar. If O Salutaris is actually sung, pray or sing it with the church; otherwise follow what is used.','Lorsque le Saint-Sacrement est exposé, tournez votre attention vers l’autel. Si O Salutaris est effectivement chanté, priez-le ou chantez-le avec l’assemblée ; sinon, suivez ce qui est utilisé.'))}${prayerBlock('benediction_o_salutaris',{kicker:L('If sung here','Si chanté ici')})}${guideCue(L('WAIT FOR','ATTENDEZ'),L('Stay here until the opening hymn or prayers have finished and the service settles into adoration.','Restez ici jusqu’à la fin du chant ou des prières d’ouverture et jusqu’à ce que l’office entre dans l’adoration.'))}`;
 if(id==='adoration')body=`${guideNow(L('Remain with the public rite','Restez avec le rite public'),L('Adore in silence or follow the Scripture, prayer or sacred music actually being used. Do not fill the interval simply because the app has more text.','Adorez en silence ou suivez l’Écriture, la prière ou la musique sacrée réellement utilisées. Ne remplissez pas l’intervalle simplement parce que l’application contient davantage de texte.'))}${guideCue(L('WAIT FOR','ATTENDEZ'),L('Advance when Tantum Ergo begins, or when the service clearly moves into the hymn immediately before Benediction.','Avancez lorsque commence Tantum Ergo, ou lorsque l’office passe clairement au chant qui précède immédiatement la bénédiction.'))}`;
 if(id==='hymn')body=`${guideNow(L('Pray or sing Tantum Ergo','Priez ou chantez Tantum Ergo'),L('Follow the congregation and local posture. Keep your attention on the Blessed Sacrament rather than on the screen.','Suivez l’assemblée et la posture locale. Gardez votre attention sur le Saint-Sacrement plutôt que sur l’écran.'))}${prayerBlock('benediction_tantum_ergo',{kicker:L('Traditional hymn','Hymne traditionnel')})}${guideCue(L('WAIT FOR','ATTENDEZ'),L('Advance when the minister begins Panem de caelo and the collect that follows.','Avancez lorsque le ministre commence Panem de caelo et l’oraison qui suit.'))}`;
 if(id==='prayer')body=`${guideNow(L('Answer the versicle; listen to the collect','Répondez au verset ; écoutez l’oraison'),L('Make the response with the congregation. The minister then says the collect; do not race ahead of the public rite.','Faites le répons avec l’assemblée. Le ministre récite ensuite l’oraison ; ne devancez pas le rite public.'))}${prayerBlock('benediction_versicles',{kicker:L('Panem de caelo · Deus qui nobis','Panem de caelo · Deus qui nobis')})}${guideCue(L('WAIT FOR','ATTENDEZ'),L('Advance when the minister prepares to give the Eucharistic blessing.','Avancez lorsque le ministre se prépare à donner la bénédiction eucharistique.'))}`;
 if(id==='blessing')body=`${guideNow(L('Receive the Eucharistic blessing','Recevez la bénédiction eucharistique'),L('Stop interacting with the phone. Attend to the blessing being given with the Blessed Sacrament.','Cessez d’interagir avec le téléphone. Soyez attentif à la bénédiction donnée avec le Saint-Sacrement.'))}${guideCue(L('WAIT UNTIL IT ENDS','ATTENDEZ LA FIN'),L('Do not advance during the blessing. Continue only after it has ended and the service moves on.','N’avancez pas pendant la bénédiction. Continuez seulement lorsqu’elle est terminée et que l’office se poursuit.'))}`;
 if(id==='praises')body=`${guideNow(L('Follow what is actually prayed next','Suivez ce qui est réellement prié ensuite'),L('If the Divine Praises are said here, pray them with the church. If they are omitted, leave them off and continue when Reposition begins.','Si les Louanges divines sont récitées ici, priez-les avec l’assemblée. Si elles sont omises, ne les ajoutez pas et continuez lorsque commence la reposition.'))}<label class="aoP435930Toggle"><input type="checkbox" data-p435930-ben-praises ${BEN.divinePraises?'checked':''}><span><b>${esc(L('The Divine Praises are being said','Les Louanges divines sont récitées'))}</b><small>${esc(L('Show the text only when it belongs to this service','Afficher le texte seulement lorsqu’il appartient à cet office'))}</small></span></label>${BEN.divinePraises?prayerBlock('benediction_divine_praises',{kicker:L('Pray with the church','Prier avec l’assemblée')}):''}${guideCue(L('WAIT FOR','ATTENDEZ'),L('Advance when the Blessed Sacrament is being returned to the tabernacle.','Avancez lorsque le Saint-Sacrement est reporté au tabernacle.'))}`;
 if(id==='reposition')body=`${guideNow(L('Follow the Reposition','Suivez la reposition'),L('Follow the chant and movement actually used as the Blessed Sacrament is returned to the tabernacle. The app does not force Psalm 116 or another local custom.','Suivez le chant et le mouvement réellement utilisés lorsque le Saint-Sacrement est reporté au tabernacle. L’application n’impose ni le psaume 116 ni un autre usage local.'))}${guideCue(L('FINISH WHEN','TERMINEZ LORSQUE'),L('The Blessed Sacrament has been reposed and the public service has actually ended.','Le Saint-Sacrement a été replacé au tabernacle et l’office public est réellement terminé.'))}`;
 return `${head(L('Benediction','Bénédiction'),L('Live companion · the church determines the pace','Compagnon en direct · l’église détermine le rythme'))}${benMacroRail(i)}<main class="aoP435930Body">${callout(esc(L('Do not use Next because the app is ready. Move only when the public rite has reached the next moment.','N’utilisez pas Suivant parce que l’application est prête. Avancez seulement lorsque le rite public a atteint le moment suivant.')),'rubric')}${body}${guideNav('ben',i,BEN_STAGES.length,L('Finish after Reposition','Terminer après la reposition'))}</main>`;
}
function presenceBar(){return nav(L('Presence','Présence'),[['reserved','Reserved in tabernacle','Réservé au tabernacle'],['exposed','Exposed','Exposé']],adorationPresence())}
function timerMarkup(){
 if(!ADOR.timerEnd)return `<div class="aoP435930Timer"><b>${esc(L('Optional timer aid','Minuteur facultatif'))}</b><span>${esc(L('It never marks a devotion complete.','Il ne valide jamais une dévotion.'))}</span><div>${[10,20,30,60].map(n=>`<button type="button" data-p435930-timer="${n}">${n} min</button>`).join('')}</div></div>`;
 const rem=Math.max(0,ADOR.timerEnd-Date.now()),min=Math.ceil(rem/60000);return `<div class="aoP435930Timer running"><b>${esc(L('Timer aid','Minuteur'))}: ${min} min</b><span>${esc(L('Completion remains your explicit report.','L’accomplissement reste votre déclaration explicite.'))}</span><button type="button" data-p435930-timer-stop>${esc(L('Stop','Arrêter'))}</button></div>`;
}
function guideRail(items,active,kind){
 return `<div class="aoP435930StageRail aoP435930GuideRail">${items.map((x,i)=>`<button type="button" class="${i===active?'active':''}" ${i===active?'aria-current="step"':''} data-p435930-${kind}-step="${i}"><span>${i+1}</span><b>${esc(x)}</b></button>`).join('')}</div>`
}
function guideNow(title,action,note=''){
 return `<section class="aoP435930GuideNow"><small>${esc(L('NOW','MAINTENANT'))}</small><h2>${esc(title)}</h2><p>${esc(action)}</p>${note?`<span>${esc(note)}</span>`:''}</section>`
}
function guideCue(label,text){return text?`<section class="aoP435930GuideCue"><small>${esc(label)}</small><p>${esc(text)}</p></section>`:''}
function guidePrayers(items){return items?.length?`<div class="aoP435930GuidePrayers">${items.map(x=>prayerBlock(x.id,{kicker:x.kicker||L('Pray','Prier')})).join('')}</div>`:''}
function guideNav(kind,index,total,lastLabel){
 return `<div class="aoP435930GuideNav"><button type="button" class="aoP435930Secondary" data-p435930-${kind}-prev ${index===0?'disabled':''}>${esc(L('Previous','Précédent'))}</button><button type="button" class="aoP435930Primary" data-p435930-${kind}-next>${esc(index===total-1?(lastLabel||L('Finish','Terminer')):L('Continue','Continuer'))}</button></div>`
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
 {title:L('Reparation','Réparation'),now:L('Acknowledge sin beginning with your own need for mercy, then offer reparation for offences against God.','Reconnaissez le péché en commençant par votre propre besoin de miséricorde, puis offrez réparation pour les offenses faites à Dieu.'),prayers:[{id:'sacrament_act_of_contrition'}],silence:L('A longer traditional Act of Reparation is available if useful.','Un Acte de réparation traditionnel plus long est disponible si cela vous aide.'),extra:`<button type="button" class="aoP435930Secondary" data-p435930-open-prayer="sacred_heart_short_prayer">${esc(L('Open Act of Reparation','Ouvrir l’Acte de réparation'))}</button>`},
 {title:L('Petition','Demande'),now:L('Present the needs of the Church, others and yourself. Keep the order broad enough that prayer does not become only self-concern.','Présentez les besoins de l’Église, des autres et les vôtres. Gardez un ordre assez large pour que la prière ne devienne pas seulement préoccupée de soi.'),prayers:[{id:'foundations_our_father'}],silence:L('After asking, leave the intentions with God.','Après avoir demandé, laissez les intentions à Dieu.')},
 {title:L('Return to silence','Revenir au silence'),now:L('The method is finished. Stop adding material and return to silent adoration.','La méthode est terminée. Cessez d’ajouter du contenu et revenez à l’adoration silencieuse.'),prayers:[],silence:L('Remain as long as is appropriate; there is no completion score.','Demeurez aussi longtemps qu’il convient ; il n’y a aucun score d’accomplissement.')}
]}
function guidedStage(kind,steps,index,lastLabel){
 const st=steps[index]||steps[0];
 return `${guideRail(steps.map(x=>x.title),index,kind)}${guideNow(st.title,st.now)}${guidePrayers(st.prayers)}${guideCue(L('SILENCE / NOTICE','SILENCE / ATTENTION'),st.silence)}${st.extra||''}${guideNav(kind,index,steps.length,lastLabel)}`
}
function renderAdoration(){
 if(ADOR.mode==='home')return `${head(L('Adoration & Visit','Adoration et visite'),L('One Eucharistic family · choose the form that matches the situation','Une même famille eucharistique · choisissez la forme adaptée à la situation'))}<main class="aoP435930Body"><div class="aoP435930BigGrid"><button data-p435930-ador-mode="visit"><small>${esc(L('5–15 MIN','5–15 MIN'))}</small><b>${esc(L('Visit to the Blessed Sacrament','Visite au Saint-Sacrement'))}</b><span>${esc(L('Reserved tabernacle · guided arrival, adoration, thanksgiving, reparation, petition and silence','Tabernacle · arrivée guidée, adoration, action de grâces, réparation, demande et silence'))}</span></button><button data-p435930-ador-mode="open"><small>${esc(L('OPEN-ENDED','LIBRE'))}</small><b>${esc(L('Adoration','Adoration'))}</b><span>${esc(L('Silence first · optional guidance only when you need it','Silence d’abord · aide facultative seulement si nécessaire'))}</span></button><button data-p435930-ador-mode="holy"><small>${esc(L('~60 MIN','~60 MIN'))}</small><b>${esc(L('Holy Hour','Heure Sainte'))}</b><span>${esc(L('Gethsemane-centred · guided stages without forced timing','Centrée sur Gethsémani · étapes guidées sans minutage imposé'))}</span></button><button data-p435930-ador-mode="four"><small>${esc(L('METHOD','MÉTHODE'))}</small><b>${esc(L('Four Ends','Quatre fins'))}</b><span>${esc(L('Adoration · thanksgiving · reparation · petition · silence','Adoration · action de grâces · réparation · demande · silence'))}</span></button><button data-p435930-ador-mode="treasury"><small>${esc(L('TEXTS','TEXTES'))}</small><b>${esc(L('Eucharistic Treasury','Trésor eucharistique'))}</b><span>${esc(L('Traditional prayers for adoration and Benediction','Prières traditionnelles pour l’adoration et la Bénédiction'))}</span></button></div></main>`;
 let content='';
 if(ADOR.mode==='visit'){
  const steps=visitSteps();content=`${callout(esc(L('A Visit does not require exposition. This guide gives you a path without turning the visit into a checklist.','Une visite ne requiert pas l’exposition. Ce guide vous donne un chemin sans transformer la visite en liste à cocher.')),'rubric')}${guidedStage('visit',steps,ADOR.visitStep,L('Finish visit','Terminer la visite'))}`;
 }
 if(ADOR.mode==='open')content=`${presenceBar()}${adorationPresence()==='exposed'?callout(`<b>${esc(L('Public rite has priority.','Le rite public a priorité.'))}</b> ${esc(L('If Benediction begins, stop the private structure and follow the actual service.','Si la Bénédiction commence, arrêtez la structure privée et suivez l’office réel.'))} <button type="button" data-p435930-go-ben>${esc(L('Follow Benediction','Suivre la Bénédiction'))}</button>`,'rubric'):''}${guideNow(L('Be still','Rester en silence'),L('Silence is the default. You do not need to complete a sequence. Remain with Christ for as long as is appropriate.','Le silence est le point de départ. Vous n’avez pas besoin d’accomplir une séquence. Demeurez avec le Christ aussi longtemps qu’il convient.'))}<div class="aoP435930GuideChoices"><button type="button" class="aoP435930Primary" data-p435930-ador-mode="holy">${esc(L('Guided Holy Hour','Heure Sainte guidée'))}</button><button type="button" class="aoP435930Primary" data-p435930-ador-four>${esc(L('Guide me with the Four Ends','Me guider avec les quatre fins'))}</button><button type="button" class="aoP435930Secondary" data-p435930-open-prayer="foundations_prayer_of_adoration">${esc(L('Open a short act of adoration','Ouvrir un court acte d’adoration'))}</button><button type="button" class="aoP435930Secondary" data-p435930-open-prayer="adoration_spiritual_communion">${esc(L('Spiritual Communion','Communion spirituelle'))}</button></div>${guideCue(L('OPTIONAL TIMER','MINUTEUR FACULTATIF'),L('Use a timer only if it helps you remain present; it never certifies that adoration is complete.','N’utilisez un minuteur que s’il vous aide à demeurer présent ; il ne certifie jamais que l’adoration est accomplie.'))}${timerMarkup()}`;
 if(ADOR.mode==='holy'){
  const steps=holySteps();content=`${presenceBar()}${adorationPresence()==='exposed'?callout(`<b>${esc(L('Public rite has priority.','Le rite public a priorité.'))}</b> <button type="button" data-p435930-go-ben>${esc(L('Follow Benediction if it begins','Suivre la Bénédiction si elle commence'))}</button>`,'rubric'):''}${guidedStage('holy',steps,ADOR.holyStep,L('Finish Holy Hour','Terminer l’Heure Sainte'))}${guideCue(L('OPTIONAL TIMER','MINUTEUR FACULTATIF'),L('The hour is devotional, not a stopwatch test. Use timing only if it serves recollection.','L’heure est une dévotion, non une épreuve au chronomètre. N’utilisez le minutage que s’il sert le recueillement.'))}${timerMarkup()}`;
 }
 if(ADOR.mode==='four'){
  const steps=fourSteps();content=`${presenceBar()}${callout(esc(L('The Four Ends are a method for structuring prayer, not four tasks that earn completion.','Les quatre fins sont une méthode pour structurer la prière, non quatre tâches qui donnent un accomplissement.')),'rubric')}${guidedStage('four',steps,ADOR.fourStep,L('Return to silent adoration','Revenir à l’adoration silencieuse'))}`;
 }
 if(ADOR.mode==='treasury')content=`<div class="aoP435930LibraryMini">${['foundations_prayer_of_adoration','adoration_anima_christi','adoration_spiritual_communion','adoration_lord_i_am_not_worthy','benediction_o_salutaris','benediction_tantum_ergo','adoration_litany_blessed_sacrament'].map(id=>{const p=P(id);return p?`<button data-p435930-open-prayer="${id}"><b>${esc(isFr()?(p.titleFr||p.title):p.title)}</b><span>${esc(['en','fr','la'].filter(k=>p[k]).map(k=>k.toUpperCase()).join(' · '))}</span></button>`:''}).join('')}</div>`;
 return `${head(L('Adoration & Visit','Adoration et visite'),ADOR.mode==='visit'?L('Guided Visit','Visite guidée'):ADOR.mode==='open'?L('Open-ended Adoration','Adoration libre'):ADOR.mode==='holy'?L('Guided Holy Hour','Heure Sainte guidée'):ADOR.mode==='four'?L('Four Ends method','Méthode des quatre fins'):L('Eucharistic Treasury','Trésor eucharistique'))}<main class="aoP435930Body"><button class="aoP435930InlineBack" data-p435930-ador-home>${assetIcon('ao-ui-back')} ${esc(L('Choose another mode','Choisir un autre mode'))}</button>${content}</main>`;
}
function familyOf(p){if(['litany_loreto_1962','litany_loreto_current'].includes(p.id))return'litany_loreto';if(['foundations_eternal_rest','dead_eternal_rest_singular'].includes(p.id))return'eternal_rest';return p.id}
let LIB={q:'',cat:'all',open:null,language:null};
function normalizedSource(p){const pr=p.provenance||{};return {id:p.id,family:familyOf(p),work:pr.work||p.title||p.id,witness:pr.witness||p.source||'Normalized existing corpus',url:pr.url||p.sourceUrl||'',quality:pr.quality||p.sourceStatus||'NORMALIZED_EXISTING',adaptation:pr.adaptation||'UNSPECIFIED',languages:pr.languages||Object.fromEntries(['en','fr','la'].filter(k=>p[k]).map(k=>[k,'AVAILABLE']))}}
const SOURCE_REGISTRY=Object.freeze(Object.fromEntries(Object.values(DATA.prayers||{}).map(p=>[p.id,Object.freeze(normalizedSource(p))])));
function renderLibrary(){
 if(LIB.open){
  const p=P(LIB.open);if(!p){LIB.open=null;return renderLibrary()}
  const missing=['en','fr','la'].filter(k=>!p[k]),hasUi=!!p[lang()];
  const missingUi=!hasUi?callout(`${esc(L('No vernacular translation is available in the current UI language.','Aucune traduction vernaculaire n’est disponible dans la langue actuelle de l’interface.'))} ${esc(L('The available source text is shown without fabricating a substitute.','Le texte source disponible est affiché sans fabriquer de traduction de substitution.'))}`,'rubric'):'';
  const category=isFr()?(DATA.categories?.[p.category]?.fr||p.category):(DATA.categories?.[p.category]?.en||p.category),langs=['en','fr','la'].filter(k=>p[k]).map(k=>k.toUpperCase()).join(' · ');
  return `${head(isFr()?(p.titleFr||p.title):p.title,L('Prayer Library','Livre de prières'))}<main class="aoP435930Body"><button class="aoP435930InlineBack" data-p435930-lib-back>${assetIcon('ao-ui-back')} ${esc(L('Prayer Library','Livre de prières'))}</button>${missingUi}${prayerBlock(LIB.open)}<div class="aoP435930Meta"><span>${esc(L('Category','Catégorie'))}: <b>${esc(category)}</b></span><span>${esc(L('Languages','Langues'))}: <b>${esc(langs||L('Source language only','Langue source seulement'))}</b></span>${missing.length?`<span>${esc(L('Not available','Non disponible'))}: <b>${missing.map(x=>x.toUpperCase()).join(' · ')}</b></span>`:''}</div></main>`
 }
 const q=LIB.q.trim().toLowerCase();let rows=Object.values(DATA.prayers||{}).filter(p=>LIB.cat==='all'||p.category===LIB.cat);if(q)rows=rows.filter(p=>[p.title,p.titleFr,p.en,p.fr,p.la,p.id].join(' ').toLowerCase().includes(q));
 const cats=[['all',L('All','Toutes')],...Object.entries(DATA.categories||{}).map(([id,v])=>[id,isFr()?v.fr:v.en])];
 return `${head(L('Prayer Library','Livre de prières'),`${Object.keys(DATA.prayers||{}).length} ${L('prayers','prières')}`)}<main class="aoP435930Body"><label class="aoP435930Search"><span>${assetIcon('ao-ui-search')}</span><input type="search" data-p435930-lib-search value="${esc(LIB.q)}" placeholder="${esc(L('Search prayers','Rechercher une prière'))}"></label><div class="aoP435930Chips">${cats.map(([id,n])=>`<button type="button" class="${id===LIB.cat?'active':''}" data-p435930-lib-cat="${esc(id)}">${esc(n)}</button>`).join('')}</div><div class="aoP435930LibraryList">${rows.map(p=>{const langs=['en','fr','la'].filter(k=>p[k]).map(k=>k.toUpperCase()).join(' · ');return `<button type="button" data-p435930-lib-open="${esc(p.id)}"><small>${esc(isFr()?(DATA.categories?.[p.category]?.fr||p.category):(DATA.categories?.[p.category]?.en||p.category))}</small><b>${esc(isFr()?(p.titleFr||p.title):p.title)}</b><span>${esc(langs)}</span></button>`}).join('')||`<p>${esc(L('No prayers match this search.','Aucune prière ne correspond à cette recherche.'))}</p>`}</div></main>`;
}
function monthIndex(key){const d=dateObj(key);return d?d.getFullYear()*12+d.getMonth():null}
function consecutive(records,needed){const done=records.filter(x=>x.complete).sort((a,b)=>a.date.localeCompare(b.date));if(!done.length)return 0;let c=1;for(let i=done.length-1;i>0;i--){const a=monthIndex(done[i].date),b=monthIndex(done[i-1].date);if(a-b===1)c++;else break}return Math.min(c,needed)}
function history(records,label){return `<div class="aoP435930History"><h3>${esc(label)}</h3>${records.length?records.slice().reverse().map(r=>`<div><span>${esc(fmtDate(r.date))}</span><b class="${r.complete?'ok':'partial'}">${esc(r.complete?L('Reported complete','Déclaré accompli'):L('Incomplete / interrupted','Incomplet / interrompu'))}</b>${r.confessionDate?`<small>${esc(L('Confession','Confession'))}: ${esc(fmtDate(r.confessionDate))}</small>`:''}</div>`).join(''):`<p>${esc(L('No reports yet.','Aucune déclaration pour le moment.'))}</p>`}</div>`}
function upsert(arr,rec){const i=arr.findIndex(x=>x.date===rec.date);if(i>=0)arr[i]=rec;else arr.push(rec);arr.sort((a,b)=>a.date.localeCompare(b.date));while(arr.length>36)arr.shift()}
function handoff(id){externalResume=captureResume();close({silent:true});return BASE?.open?.(id,{returnContext:PRAY_CTX})}
function programmeRail(kind,step,items){
 return `<div class="aoP435930StageRail aoP435930ProgrammeRail">${items.map((x,i)=>`<button type="button" class="${i===step?'active':''}" ${i===step?'aria-current="step"':''} data-p435930-${kind}-stage="${i}"><span>${i+1}</span><b>${esc(L(x[0],x[1]))}</b></button>`).join('')}</div>`
}
function programmeNav(kind,step,total,lastLabel){
 const final=step===total-1;
 return `<div class="aoP435930GuideNav"><button type="button" class="aoP435930Secondary" data-p435930-${kind}-prev ${step===0?'disabled':''}>${esc(L('Previous','Précédent'))}</button>${final?`<button type="button" class="aoP435930Primary" data-p435930-program-home>${esc(lastLabel||L('Done · back to PRAY','Terminé · retour à PRIER'))}</button>`:`<button type="button" class="aoP435930Primary" data-p435930-${kind}-next>${esc(L('Continue','Continuer'))}</button>`}</div>`
}
function programmeSummary(rows){return `<div class="aoP435930ProgrammeSummary">${rows.map(r=>`<div class="${r[1]?'done':''}"><span>${r[1]?'✓':'○'}</span><b>${esc(r[0])}</b>${r[2]?`<small>${esc(r[2])}</small>`:''}</div>`).join('')}</div>`}
const FF_STAGES=[['Intention','Intention'],['Prepare','Préparer'],['Mass & Communion','Messe & Communion'],['Reparation','Réparation'],['Record','Enregistrer']];
const FS_STAGES=[['Intention','Intention'],['Confession','Confession'],['Mass & Communion','Messe & Communion'],['Rosary','Rosaire'],['15-minute meditation','Méditation de 15 min'],['Record','Enregistrer']];
const FS_MYSTERIES={
 joyful:{en:'Joyful Mysteries',fr:'Mystères joyeux',items:{en:['The Annunciation','The Visitation','The Nativity','The Presentation','The Finding of Jesus in the Temple'],fr:["L’Annonciation","La Visitation","La Nativité","La Présentation de Jésus au Temple","Le Recouvrement de Jésus au Temple"]}},
 sorrowful:{en:'Sorrowful Mysteries',fr:'Mystères douloureux',items:{en:['The Agony in the Garden','The Scourging at the Pillar','The Crowning with Thorns','The Carrying of the Cross','The Crucifixion and Death of Our Lord'],fr:["L’Agonie de Jésus au jardin des Oliviers","La Flagellation","Le Couronnement d’épines","Le Portement de la Croix","La Crucifixion et la mort de Notre-Seigneur"]}},
 glorious:{en:'Glorious Mysteries',fr:'Mystères glorieux',items:{en:['The Resurrection','The Ascension','The Descent of the Holy Spirit','The Assumption of Our Lady','The Coronation of Our Lady'],fr:["La Résurrection","L’Ascension","La Descente du Saint-Esprit","L’Assomption de la Sainte Vierge","Le Couronnement de la Sainte Vierge"]}},
 luminous:{en:'Luminous Mysteries · optional 2002 set',fr:'Mystères lumineux · série facultative de 2002',items:{en:['The Baptism of the Lord','The Wedding at Cana','The Proclamation of the Kingdom','The Transfiguration','The Institution of the Eucharist'],fr:["Le Baptême du Seigneur","Les Noces de Cana","L’Annonce du Royaume","La Transfiguration","L’Institution de l’Eucharistie"]}}
};
function firstFridayStage(date,valid){
 const s=FF.step;
 if(s===0)return `${guideNow(L('Offer this First Friday','Offrez ce premier vendredi'),L('Make the reparatory intention before Holy Communion. The intention gives the practice its devotional direction; it does not replace ordinary preparation for Communion.','Formez l’intention réparatrice avant la sainte Communion. Cette intention donne à la pratique son orientation dévotionnelle ; elle ne remplace pas la préparation ordinaire à la Communion.'))}<label class="aoP435930Toggle"><input type="checkbox" data-p435930-ff-intention ${FF.intention?'checked':''}><span><b>${esc(L('I make this Communion with a reparatory intention','Je fais cette Communion avec une intention réparatrice'))}</b><small>${esc(L('Your explicit intention · not inferred by the app','Votre intention explicite · non déduite par l’application'))}</small></span></label>${guideCue(L('NEXT','ENSUITE'),L('Prepare for Mass and for Holy Communion.','Préparez-vous à la Messe et à la sainte Communion.'))}${programmeNav('ff',s,FF_STAGES.length)}`;
 if(s===1)return `${guideNow(L('Prepare before Mass','Préparez-vous avant la Messe'),L('Recollect yourself before Mass. If sacramental Confession is needed before receiving Holy Communion, prepare for Confession first; otherwise proceed with your normal preparation for Mass.','Recueillez-vous avant la Messe. Si la Confession sacramentelle est nécessaire avant de recevoir la sainte Communion, préparez d’abord votre Confession ; sinon poursuivez votre préparation habituelle à la Messe.'))}<div class="aoP435930Handoffs"><button data-p435930-handoff="mass.prepare">${esc(L('Open Before Mass','Ouvrir Avant la Messe'))}</button><button data-p435930-own="pray.confession">${esc(L('Prepare for Confession','Préparer la Confession'))}</button></div>${guideCue(L('RETURN HERE','REVENEZ ICI'),L('When your preparation is complete, continue to the Mass & Communion stage.','Lorsque votre préparation est terminée, passez à l’étape Messe & Communion.'))}${programmeNav('ff',s,FF_STAGES.length)}`;
 if(s===2)return `${guideNow(L('Attend Mass and receive Holy Communion','Assistez à la Messe et recevez la sainte Communion'),L('Follow the Mass itself. After you have actually received Holy Communion on this First Friday, return here and report that act explicitly.','Suivez la Messe elle-même. Après avoir effectivement reçu la sainte Communion ce premier vendredi, revenez ici et déclarez explicitement cet acte.'))}<div class="aoP435930Handoffs"><button data-p435930-handoff="mass.follow">${esc(L('Follow Mass','Suivre la Messe'))}</button></div><label class="aoP435930Toggle"><input type="checkbox" data-p435930-ff-communion ${FF.communion?'checked':''}><span><b>${esc(L('I received Holy Communion on this First Friday','J’ai reçu la sainte Communion ce premier vendredi'))}</b><small>${esc(L('User report only','Déclaration de l’utilisateur seulement'))}</small></span></label>${guideCue(L('AFTER COMMUNION','APRÈS LA COMMUNION'),L('Remain for thanksgiving before moving into the reparatory prayer.','Demeurez en action de grâces avant de passer à la prière réparatrice.'))}${programmeNav('ff',s,FF_STAGES.length)}`;
 if(s===3)return `${guideNow(L('Thanksgiving and reparation','Action de grâces et réparation'),L('Begin with immediate thanksgiving after Communion. Then pray the Act of Reparation to the Sacred Heart. A Holy Hour may be added, but it is optional and distinct from the essential First-Friday act of Communion.','Commencez par l’action de grâces immédiate après la Communion. Puis priez l’Acte de réparation au Sacré-Cœur. Une Heure Sainte peut s’y ajouter, mais elle est facultative et distincte de l’acte essentiel de Communion du premier vendredi.'))}<div class="aoP435930Handoffs"><button data-p435930-handoff="mass.thanksgiving">${esc(L('Open Thanksgiving after Mass','Ouvrir Action de grâces après la Messe'))}</button><button data-p435930-handoff="pray.sacred_heart">${esc(L('Sacred Heart prayers','Prières du Sacré-Cœur'))}</button><button data-p435930-ador-mode-direct="holy">${esc(L('Optional Holy Hour','Heure Sainte facultative'))}</button></div>${prayerBlock('sacred_heart_short_prayer',{kicker:L('Act of Reparation','Acte de réparation')})}${programmeNav('ff',s,FF_STAGES.length)}`;
 const rows=[[L('Reparatory intention','Intention réparatrice'),FF.intention],[L('Holy Communion on the First Friday','Sainte Communion le premier vendredi'),FF.communion]];
 return `${guideNow(L('Review and record','Vérifiez et enregistrez'),L('The app records only what you explicitly report. It does not certify worthiness, grace, validity, salvation, or any promised effect.','L’application enregistre seulement ce que vous déclarez explicitement. Elle ne certifie ni dignité, ni grâce, ni validité, ni salut, ni aucun effet promis.'))}${programmeSummary(rows)}<button class="aoP435930Primary" data-p435930-ff-save ${!valid||!FF.intention||!FF.communion?'disabled':''}>${esc(L('Record this First Friday','Enregistrer ce premier vendredi'))}</button>${valid?`<button class="aoP435930Secondary" data-p435930-ff-interrupt>${esc(L('Record this month as incomplete / interrupted','Enregistrer ce mois comme incomplet / interrompu'))}</button>`:''}${programmeNav('ff',s,FF_STAGES.length)}`
}
function renderFirstFriday(){
 const date=selectedDateKey(),valid=isFirstWeekday(date,5),records=S.firstFriday.records,run=consecutive(records,9);
 return `${head(L('Nine First Fridays','Neuf premiers vendredis'),L('A guided reparatory programme · Communion remains the central act','Programme réparateur guidé · la Communion demeure l’acte central'))}${programmeRail('ff',FF.step,FF_STAGES)}<main class="aoP435930Body"><section class="aoP435930Date ${valid?'valid':'invalid'}"><small>${esc(L('Selected date','Date sélectionnée'))}</small><b>${esc(fmtDate(date))}</b><span>${esc(valid?L('First Friday','Premier vendredi'):L('Not the First Friday of this month · you may preview the guide, but cannot record completion','Ce n’est pas le premier vendredi du mois · vous pouvez consulter le guide, mais pas enregistrer l’accomplissement'))}</span></section>${firstFridayStage(date,valid)}<div class="aoP435930Run"><b>${run}/9</b><span>${esc(L('consecutive months currently represented by complete user reports','mois consécutifs actuellement représentés par des déclarations complètes'))}</span></div>${FF.step===4?history(records,L('History','Historique')):''}</main>`;
}
function firstSaturdayStage(date,valid){
 const s=FS.step;
 if(s===0)return `${guideNow(L('Set the reparatory intention','Formez l’intention réparatrice'),L('Intend to make the constituent acts in reparation to the Immaculate Heart. The intention governs the acts; it is not a fifth constituent act.','Ayez l’intention d’accomplir les actes constitutifs en réparation au Cœur Immaculé. L’intention gouverne les actes ; elle n’est pas un cinquième acte constitutif.'))}<label class="aoP435930Toggle"><input type="checkbox" data-p435930-fs-intention ${FS.intention?'checked':''}><span><b>${esc(L('I make these acts with a reparatory intention','J’accomplis ces actes avec une intention réparatrice'))}</b><small>${esc(L('Explicit intention · not inferred by the app','Intention explicite · non déduite par l’application'))}</small></span></label>${programmeNav('fs',s,FS_STAGES.length)}`;
 if(s===1)return `${guideNow(L('Confession','Confession'),L('If you have already made the reparatory Confession, enter its date. Otherwise use the Confession module to prepare. The Confession may occur at another time when made with the reparatory intention.','Si vous avez déjà fait la Confession réparatrice, indiquez sa date. Sinon, utilisez le module Confession pour vous préparer. La Confession peut avoir lieu à un autre moment lorsqu’elle est faite avec l’intention réparatrice.'))}<label class="aoP435930ProgrammeDate"><span><b>${esc(L('Date of Confession','Date de la Confession'))}</b><small>${esc(L('User report · may differ from the First Saturday date','Déclaration de l’utilisateur · peut différer de la date du premier samedi'))}</small></span><input type="text" inputmode="numeric" autocomplete="off" placeholder="DD/MM/YYYY" aria-label="${esc(L('Date of Confession · DD/MM/YYYY','Date de la Confession · JJ/MM/AAAA'))}" data-p435930-fs-confession value="${esc(FS.confessionDate?formatDisplayDate(FS.confessionDate):'')}"></label><div class="aoP435930Handoffs"><button data-p435930-own="pray.confession">${esc(L('Prepare for Confession','Préparer la Confession'))}</button></div>${programmeNav('fs',s,FS_STAGES.length)}`;
 if(s===2)return `${guideNow(L('Mass and Holy Communion','Messe et sainte Communion'),L('Attend Mass and receive Holy Communion on the First Saturday itself. Afterward, return here and report the Communion explicitly.','Assistez à la Messe et recevez la sainte Communion le premier samedi lui-même. Ensuite, revenez ici et déclarez explicitement la Communion.'))}<div class="aoP435930Handoffs"><button data-p435930-handoff="mass.prepare">${esc(L('Prepare for Mass','Se préparer à la Messe'))}</button><button data-p435930-handoff="mass.follow">${esc(L('Follow Mass','Suivre la Messe'))}</button><button data-p435930-handoff="mass.thanksgiving">${esc(L('Thanksgiving after Mass','Action de grâces après la Messe'))}</button></div><label class="aoP435930Toggle"><input type="checkbox" data-p435930-fs-communion ${FS.communion?'checked':''}><span><b>${esc(L('I received Holy Communion on this First Saturday','J’ai reçu la sainte Communion ce premier samedi'))}</b><small>${esc(L('User report only','Déclaration de l’utilisateur seulement'))}</small></span></label>${programmeNav('fs',s,FS_STAGES.length)}`;
 if(s===3)return `${guideNow(L('Pray five decades of the Rosary','Priez cinq dizaines du Rosaire'),L('Pray the canonical Rosary as a distinct constituent act. When you return, mark the act complete only if you actually prayed five decades.','Priez le Rosaire canonique comme acte constitutif distinct. À votre retour, ne marquez l’acte accompli que si vous avez effectivement prié cinq dizaines.'))}<div class="aoP435930Handoffs"><button data-p435930-own="pray.rosary">${esc(L('Open Rosary','Ouvrir le Rosaire'))}</button></div><label class="aoP435930Toggle"><input type="checkbox" data-p435930-fs-rosary ${FS.rosary?'checked':''}><span><b>${esc(L('I prayed five decades on this First Saturday','J’ai prié cinq dizaines ce premier samedi'))}</b><small>${esc(L('Distinct from the fifteen-minute meditation','Distinct de la méditation de quinze minutes'))}</small></span></label>${programmeNav('fs',s,FS_STAGES.length)}`;
 if(s===4)return `${guideNow(L('Spend fifteen minutes meditating on the Rosary mysteries','Passez quinze minutes à méditer les mystères du Rosaire'),L('This is not another five decades. Choose one or more mysteries and remain with them in meditation for fifteen minutes. The aid below guides the meditation without automatically certifying completion.','Il ne s’agit pas de cinq nouvelles dizaines. Choisissez un ou plusieurs mystères et demeurez avec eux en méditation pendant quinze minutes. L’aide ci-dessous guide la méditation sans certifier automatiquement son accomplissement.'))}<div class="aoP435930Handoffs"><button data-p435930-fs-meditate>${esc(L('Open guided 15-minute meditation','Ouvrir la méditation guidée de 15 min'))}</button></div><label class="aoP435930Toggle"><input type="checkbox" data-p435930-fs-meditation ${FS.meditation?'checked':''}><span><b>${esc(L('I completed fifteen minutes of mystery meditation','J’ai accompli quinze minutes de méditation des mystères'))}</b><small>${esc(L('Explicit user report','Déclaration explicite de l’utilisateur'))}</small></span></label>${programmeNav('fs',s,FS_STAGES.length)}`;
 const rows=[[L('Reparatory intention','Intention réparatrice'),FS.intention],[L('Confession','Confession'),!!FS.confessionDate,FS.confessionDate?fmtDate(FS.confessionDate):''],[L('Holy Communion','Sainte Communion'),FS.communion],[L('Five-decade Rosary','Rosaire de cinq dizaines'),FS.rosary],[L('15-minute meditation','Méditation de 15 minutes'),FS.meditation]];
 const complete=valid&&FS.intention&&FS.communion&&FS.rosary&&FS.meditation&&!!FS.confessionDate;
 return `${guideNow(L('Review the four acts and record the month','Vérifiez les quatre actes et enregistrez le mois'),L('Record completion only from your own report. The app does not infer sacramental validity, interior disposition, grace, or devotional effects.','N’enregistrez l’accomplissement qu’à partir de votre propre déclaration. L’application ne déduit ni validité sacramentelle, ni disposition intérieure, ni grâce, ni effets dévotionnels.'))}${programmeSummary(rows)}<button class="aoP435930Primary" data-p435930-fs-save ${complete?'':'disabled'}>${esc(L('Record this First Saturday','Enregistrer ce premier samedi'))}</button>${valid?`<button class="aoP435930Secondary" data-p435930-fs-interrupt>${esc(L('Record this month as incomplete / interrupted','Enregistrer ce mois comme incomplet / interrompu'))}</button>`:''}${programmeNav('fs',s,FS_STAGES.length)}`
}
function renderFirstSaturday(){
 const date=selectedDateKey(),valid=isFirstWeekday(date,6),records=S.firstSaturday.records,run=consecutive(records,5);
 return `${head(L('Five First Saturdays','Cinq premiers samedis'),L('A guided reparatory programme · four constituent acts, one intention','Programme réparateur guidé · quatre actes constitutifs, une intention'))}${programmeRail('fs',FS.step,FS_STAGES)}<main class="aoP435930Body"><section class="aoP435930Date ${valid?'valid':'invalid'}"><small>${esc(L('Selected date','Date sélectionnée'))}</small><b>${esc(fmtDate(date))}</b><span>${esc(valid?L('First Saturday','Premier samedi'):L('Not the First Saturday of this month · you may preview the guide, but cannot record completion','Ce n’est pas le premier samedi du mois · vous pouvez consulter le guide, mais pas enregistrer l’accomplissement'))}</span></section>${firstSaturdayStage(date,valid)}<div class="aoP435930Run"><b>${run}/5</b><span>${esc(L('consecutive months currently represented by complete user reports','mois consécutifs actuellement représentés par des déclarations complètes'))}</span></div>${FS.step===5?history(records,L('History','Historique')):''}</main>`;
}
function mysterySetButtons(){return `<div class="aoP435930MysterySets">${Object.entries(FS_MYSTERIES).map(([id,x])=>`<button type="button" class="${FS.medSet===id?'active':''}" data-p435930-fs-med-set="${id}">${esc(isFr()?x.fr:x.en)}</button>`).join('')}</div>`}
function mysteryButtons(){const set=FS_MYSTERIES[FS.medSet]||FS_MYSTERIES.joyful,items=set.items[lang()]||set.items.en;return `<div class="aoP435930MysteryList">${items.map((x,i)=>`<button type="button" class="${FS.medMystery===i?'active':''}" data-p435930-fs-med-mystery="${i}"><span>${i+1}</span><b>${esc(x)}</b></button>`).join('')}</div>`}
function selectedMystery(){const set=FS_MYSTERIES[FS.medSet]||FS_MYSTERIES.joyful,items=set.items[lang()]||set.items.en;return items[Math.max(0,Math.min(items.length-1,FS.medMystery||0))]}
function renderFSMeditation(){
 const mystery=selectedMystery();
 return `${head(L('First Saturday meditation','Méditation du premier samedi'),L('Fifteen minutes with one or more Rosary mysteries · distinct from the five decades','Quinze minutes avec un ou plusieurs mystères du Rosaire · distinctes des cinq dizaines'))}<main class="aoP435930Body"><section class="aoP435930MeditationIntro"><small>${esc(L('CHOOSE A MYSTERY','CHOISISSEZ UN MYSTÈRE'))}</small><h2>${esc(mystery)}</h2><p>${esc(L('You may remain with this mystery for the whole period or deliberately move to another mystery. Do not turn this into another decade of vocal prayer.','Vous pouvez demeurer avec ce mystère pendant toute la période ou passer délibérément à un autre mystère. Ne transformez pas cela en une nouvelle dizaine de prière vocale.'))}</p></section>${mysterySetButtons()}${mysteryButtons()}<section class="aoP435930MeditationFlow"><div>${guideNow(L('Place the mystery before you','Placez le mystère devant vous'),L('Recall the Gospel event simply. Who is present? What is happening? Do not rush to applications yet.','Rappelez simplement l’événement évangélique. Qui est présent ? Que se passe-t-il ? Ne vous hâtez pas encore vers les applications.'))}</div><div>${guideNow(L('Stay with Our Lady’s place in the mystery','Demeurez avec la place de Notre-Dame dans le mystère'),L('Consider what Mary receives, does, suffers, offers, or witnesses here. Remain with what belongs to this mystery rather than inventing a separate scene.','Considérez ce que Marie reçoit, fait, souffre, offre ou contemple ici. Demeurez avec ce qui appartient à ce mystère plutôt que d’inventer une scène distincte.'))}</div><div>${guideNow(L('Turn the mystery toward your own life','Tournez le mystère vers votre propre vie'),L('Ask what grace, conversion, imitation, patience, faith, charity, or fidelity this mystery calls for in you today.','Demandez quelle grâce, conversion, imitation, patience, foi, charité ou fidélité ce mystère appelle en vous aujourd’hui.'))}</div><div>${guideNow(L('Speak briefly, then remain silent','Parlez brièvement, puis demeurez en silence'),L('Speak to God or Our Lady in your own words, then stop adding words and remain with the mystery. Return gently when distracted.','Parlez à Dieu ou à Notre-Dame avec vos propres mots, puis cessez d’ajouter des paroles et demeurez avec le mystère. Revenez-y doucement en cas de distraction.'))}</div></section>${ADOR.timerEnd?timerMarkup():`<div class="aoP435930Timer aoP435930MeditationTimer"><b>${esc(L('15-minute timer aid','Minuteur de 15 minutes'))}</b><span>${esc(L('Start it when you are ready to begin the actual meditation. It never marks the act complete automatically.','Démarrez-le lorsque vous êtes prêt à commencer la méditation proprement dite. Il ne valide jamais automatiquement l’acte.'))}</span><button type="button" data-p435930-timer="15">15 min</button></div>`}<div class="aoP435930MeditationActions"><button class="aoP435930Primary" data-p435930-fs-meditation-complete>${esc(L('I completed fifteen minutes · return','J’ai accompli quinze minutes · retour'))}</button><button class="aoP435930Secondary" data-p435930-fs-meditation-return>${esc(L('Return without marking complete','Retour sans marquer comme accompli'))}</button></div></main>`
}
function renderPrayerOnly(id){const p=P(id);return `${head(p?(isFr()?(p.titleFr||p.title):p.title):L('Prayer','Prière'),L('Prayer Library','Livre de prières'))}<main class="aoP435930Body"><button class="aoP435930InlineBack" data-p435930-prayer-return>${assetIcon('ao-ui-back')} ${esc(L('Return','Retour'))}</button>${prayerBlock(id)}</main>`}
let prayerReturnView=null,prayerId=null;
function pushView(v=view){if(v)navStack.push(v);return navStack.length}
function popView(fallback='home'){view=navStack.length?navStack.pop():fallback;return view}
function captureResume(){return {view,navStack:[...navStack],prayerReturnView,prayerId}}
function reopenResume(snapshot){
 if(!snapshot)return false;
 navStack=Array.isArray(snapshot.navStack)?[...snapshot.navStack]:[];view=snapshot.view||'home';prayerReturnView=snapshot.prayerReturnView||null;prayerId=snapshot.prayerId||null;
 const r=shell();r.classList.add('open');r.setAttribute('aria-hidden','false');document.body.classList.add('aoP435930Open');render();
 queueMicrotask(()=>r.querySelector('button,[href],input,[tabindex]:not([tabindex="-1"])')?.focus?.());return true
}
function navigationSignature(){return [view,CONF.stage,BEN.step,ADOR.mode,ADOR.visitStep,ADOR.holyStep,ADOR.fourStep,FF.step,FS.step,PEN.step,LIT.step,SEVEN.step,FORTY.step,STATIONS.step,LIB.open||'',prayerId||'',S.angelusMode].join('|')}
function focusables(){const r=document.getElementById(ROOT_ID);if(!r?.classList.contains('open'))return [];return [...r.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null&&!el.hidden)}


const PEN_PSALMS=[{trad:6,modern:6},{trad:31,modern:32},{trad:37,modern:38},{trad:50,modern:51},{trad:101,modern:102},{trad:129,modern:130},{trad:142,modern:143}];
const WORD_REFS=['Luke 23:34','Luke 23:43','John 19:26–27','Matthew 27:46','John 19:28','John 19:30','Luke 23:46'];
const WORD_LABELS={en:['Father, forgive them','Today you shall be with me in paradise','Woman, behold your son','My God, why have you forsaken me?','I thirst','It is finished','Father, into your hands'],fr:['Père, pardonne-leur','Aujourd’hui tu seras avec moi dans le paradis','Femme, voici ton fils','Mon Dieu, pourquoi m’avez-vous abandonné ?','J’ai soif','Tout est consommé','Père, entre vos mains']};
function devotionalSource(title,detail=''){
 return `<details class="aoP435930Source"><summary>${esc(L('Source / provenance','Source / provenance'))}</summary><p><b>${esc(title)}</b></p>${detail?`<p>${esc(detail)}</p>`:''}</details>`
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
 const token=guard();try{const svc=runtime()?.scriptureService;if(!svc)throw new Error('Scripture service unavailable');const d=await svc.load(kind,{en:ref,fr:ref,lat:ref});if(token!==guard())return;const box=document.querySelector(selector);if(!box)return;box.innerHTML=scriptureFlip(d,full)}catch(e){if(token!==guard())return;const box=document.querySelector(selector);if(box)box.innerHTML=callout(esc(L('Scripture text could not be loaded.','Le texte de l’Écriture n’a pas pu être chargé.')),'warn')}
}
async function guidedWsText(title,key,language='en'){
 const ck='ao2:v435930:ws:'+language+':'+key;try{const c=localStorage.getItem(ck);if(c)return c}catch{}
 const host=language==='fr'?'fr.wikisource.org':'en.wikisource.org',api='https://'+host+'/w/api.php?action=parse&format=json&origin=*&prop=text&page='+encodeURIComponent(title),ac=new AbortController(),tm=setTimeout(()=>ac.abort(),8000);let r;
 try{r=await fetch(api,{signal:ac.signal})}finally{clearTimeout(tm)}if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json(),html=j?.parse?.text?.['*']||j?.parse?.text;if(!html)throw new Error('Source text unavailable');
 const doc=new DOMParser().parseFromString(html,'text/html');doc.querySelectorAll('script,style,.mw-editsection,.navbox,.metadata,.sistersitebox,.ws-noexport').forEach(n=>n.remove());let txt=(doc.querySelector('.mw-parser-output')||doc.body).innerText||'';txt=txt.replace(/\n{3,}/g,'\n\n').replace(/\[edit\]/g,'').trim();try{localStorage.setItem(ck,txt)}catch{}return txt
}

function stationFlip(la,vern,label){
 const hasBoth=!!(la&&vern),shown=vern||la||'';
 return `<article class="aoP435930Prayer aoP435930StationPrayer"><div class="aoP435930PrayerHead"><div><small>${esc(label||L('Pray','Prier'))}</small></div>${hasBoth?`<span>LA ↔ ${isFr()?'FR':'EN'}</span>`:''}</div>${hasBoth?`<button type="button" class="aoP435930Flip" data-p435930-flip aria-label="${esc(L('Switch prayer language','Changer la langue de la prière'))}"><span data-face-v>${nl(vern)}</span><span data-face-la hidden>${nl(la)}</span></button>`:`<div class="aoP435930Text">${nl(shown)}</div>`}</article>`
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
function renderStations(){
 const i=Math.max(0,Math.min(13,STATIONS.step)),titles=STATION_DATA.stationTitles?.[lang()]||STATION_DATA.stationTitles?.en||[],a=STATION_DATA.alphonsus?.[lang()]||STATION_DATA.alphonsus?.en||[],ala=STATION_DATA.alphonsus?.la||[],vr=STATION_DATA.stationVR||{},title=titles[i]||L('Station','Station')+' '+(i+1),guided=S.stations.mode!=='simple';
 const consider=guided&&a[i]?.consider?`<section class="aoP435930StationConsider aoP435930HistoricalFocus"><small>${esc(L('CONSIDER','CONSIDÉREZ'))}</small><p>${esc(a[i].consider)}</p></section>`:'';
 const alph=guided&&a[i]?.prayer?stationFlip(ala[i]?.prayer||'',a[i].prayer,L('Prayer of St Alphonsus','Prière de saint Alphonse')):'';
 const stabat=(S.stations.stabat&&i<13)?stationFlip(STATION_DATA.stabat?.[i]||'',(isFr()?STATION_DATA.stabatFr:STATION_DATA.stabatEn)?.[i]||'',L('Stabat Mater · between stations','Stabat Mater · entre les stations')):'';
 const action=i===0?L('Begin the Way of the Cross. If you are physically moving between stations, face or approach the first station; otherwise recollect yourself before beginning.','Commencez le Chemin de Croix. Si vous vous déplacez physiquement entre les stations, tournez-vous vers la première station ou approchez-vous-en ; sinon recueillez-vous avant de commencer.'):L('Come to this station and become still before reading. Let the movement between stations end before you begin the text.','Arrivez à cette station et demeurez immobile avant de lire. Laissez s’achever le déplacement entre les stations avant de commencer le texte.');
 return `${head(L('Stations of the Cross','Chemin de Croix'),L('XIV Stations · St Alphonsus · guided prayer','XIV Stations · saint Alphonse · prière guidée'))}${stationRail(i)}<main class="aoP435930Body aoP435930Stations">${nav(L('Depth','Profondeur'),[['guided','Guided','Guidé'],['simple','Simple','Simple']],S.stations.mode)}<label class="aoP435930Toggle aoP435930StationStabat"><input type="checkbox" data-p435930-station-stabat ${S.stations.stabat?'checked':''}><span><b>Stabat Mater</b><small>${esc(L('Include one stanza while moving between stations','Inclure une strophe pendant le déplacement entre les stations'))}</small></span></label>${guideNow(title,action,L('Station '+(i+1)+' of 14','Station '+(i+1)+' sur 14'))}${stationFlip((vr.la||[]).join('\n'),(vr[lang()]||vr.en||[]).join('\n'),L('Versicle & response','Verset & répons'))}${consider}${alph}<section class="aoP435930StationOrdinary"><small>${esc(L('TRADITIONAL PRAYERS OF THE ST ALPHONSUS METHOD','PRIÈRES TRADITIONNELLES DE LA MÉTHODE DE SAINT ALPHONSE'))}</small><p>${esc(L('In this traditional method, pray the Our Father, Hail Mary and Glory Be before moving on. These vocal prayers belong to the method; the Way of the Cross itself is centered on prayerfully visiting the stations and meditating on the Passion.','Dans cette méthode traditionnelle, récitez le Notre Père, le Je vous salue Marie et le Gloire au Père avant de poursuivre. Ces prières vocales appartiennent à cette méthode ; le Chemin de Croix lui-même est centré sur la visite priante des stations et la méditation de la Passion.'))}</p>${guidePrayers([{id:'foundations_our_father'},{id:'foundations_hail_mary'},{id:'foundations_glory_be'}])}</section>${stabat}${guideCue(i===13?L('FINISH','TERMINER'):L('MOVE TO THE NEXT STATION','ALLEZ À LA STATION SUIVANTE'),i===13?L('Remain briefly in silence after the Fourteenth Station. Finish without rushing into another screen.','Demeurez brièvement en silence après la quatorzième station. Terminez sans vous précipiter vers un autre écran.'):L('When the prayers are complete, move deliberately to the next station. If Stabat Mater is enabled, pray its stanza during the movement.','Lorsque les prières sont terminées, allez délibérément à la station suivante. Si le Stabat Mater est activé, récitez sa strophe pendant le déplacement.'))}<div class="aoP435930GuideNav"><button type="button" class="aoP435930Secondary" data-p435930-station-prev ${i===0?'disabled':''}>${esc(L('Previous station','Station précédente'))}</button><button type="button" class="aoP435930Primary" data-p435930-station-next>${esc(i===13?L('Finish devotion','Terminer la dévotion'):L('Next station','Station suivante'))}</button></div>${devotionalSource('St Alphonsus Liguori · traditional XIV Stations',L('Traditional St Alphonsus text; the Our Father, Hail Mary and Glory Be use the same prayer texts as the rest of PRAY.','Texte traditionnel de saint Alphonse ; le Notre Père, le Je vous salue Marie et le Gloire au Père utilisent les mêmes textes de prière que le reste de PRIER.'))}</main>`
}

function renderPenitential(){
 const i=Math.max(0,Math.min(6,PEN.step)),p=PEN_PSALMS[i],labels=PEN_PSALMS.map(x=>`Ps ${x.trad}`),ref=`Psalms ${p.trad}:1`,modern=p.modern!==p.trad?` (${p.modern})`:'';
 setTimeout(()=>{const t=++PEN.token;loadScriptureInto('[data-p435930-pen-scripture]','psalm',ref,true,()=>PEN.token)},0);
 const final=i===6;
 return `${head(L('Seven Penitential Psalms','Sept psaumes pénitentiels'),L('Traditional penitential psalmody · guided sequence','Psalmodie pénitentielle traditionnelle · séquence guidée'))}<main class="aoP435930Body">${callout(esc(L('Pray the seven Psalms in their traditional order. The app guides the sequence; it does not add a new penitential prayer around them.','Priez les sept Psaumes dans leur ordre traditionnel. L’application guide la séquence ; elle n’ajoute pas une nouvelle prière pénitentielle autour d’eux.')),'rubric')}${guideRail(labels,i,'pen')}${guideNow(`Psalm ${p.trad}${modern}`,L('Pray this Psalm slowly. Let the words themselves carry the act of repentance; do not rush to the next Psalm when you reach the final verse.','Priez lentement ce Psaume. Laissez les paroles elles-mêmes porter l’acte de pénitence ; ne passez pas immédiatement au Psaume suivant après le dernier verset.'))}<div class="aoP435930GuidedScripture" data-p435930-pen-scripture><p class="aoP435930Loading">${esc(L('Loading Scripture…','Chargement de l’Écriture…'))}</p></div>${guideCue(L('PAUSE','PAUSE'),L('Remain briefly in silence after the doxology or final verse, then continue when ready.','Demeurez brièvement en silence après la doxologie ou le dernier verset, puis continuez lorsque vous êtes prêt.'))}<div class="aoP435930GuideNav"><button type="button" class="aoP435930Secondary" data-p435930-pen-prev ${i===0?'disabled':''}>${esc(L('Previous Psalm','Psaume précédent'))}</button>${final?`<button type="button" class="aoP435930Primary" data-p435930-pen-litany>${esc(L('Continue with Litany of the Saints','Continuer avec les Litanies des saints'))}</button>`:`<button type="button" class="aoP435930Primary" data-p435930-pen-next>${esc(L('Next Psalm','Psaume suivant'))}</button>`}</div>${devotionalSource('Baltimore Manual · Seven Penitential Psalms and Litany of the Saints',L('Traditional sequence; Scripture text supplied by the app Scripture service.','Séquence traditionnelle ; texte de l’Écriture fourni par le service biblique de l’application.'))}</main>`
}
function litanyLines(txt){return String(txt||'').replace(/\r/g,'').split(/\n+/).map(x=>x.trim()).filter(x=>x&&x.length<320&&!/^(contents|navigation|see also|notes|references)$/i.test(x))}
function buildLitanySections(txt){
 let lines=litanyLines(txt);if(!lines.length)return[];const n=6,size=Math.ceil(lines.length/n),names=isFr()?['Ouverture','Marie et les anges','Apôtres et martyrs','Pasteurs et saints','Supplications','Conclusion']:['Opening','Mary & the angels','Apostles & martyrs','Pastors & saints','Supplications','Conclusion'];
 return names.map((title,i)=>({title,lines:lines.slice(i*size,Math.min(lines.length,(i+1)*size))})).filter(x=>x.lines.length)
}
async function ensureLitany(){
 if(LIT.sections||LIT.loading)return;LIT.loading=true;LIT.error='';const token=++LIT.token;try{let txt='';if(isFr()){txt=await guidedWsText('Œuvres de P. Corneille (Marty-Laveaux)/Tome 9/Les sept psaumes pénitentiaux','litany-saints-fr','fr');const k=txt.search(/LES LITANIES DES SAINTS|LITANIES DES SAINTS/i);if(k>=0)txt=txt.slice(k)}else{for(const title of ['A Manual of Prayers for the Use of the Catholic Laity/Litany of the Saints','A Manual of Prayers for the Use of the Catholic Laity/The Litany of the Saints']){try{txt=await guidedWsText(title,'litany-saints-en','en');if(txt)break}catch{}}const k=txt.search(/Lord, have mercy|Kyrie/i);if(k>0)txt=txt.slice(k)}if(token!==LIT.token)return;LIT.sections=buildLitanySections(txt);if(!LIT.sections.length)throw new Error('No litany sections');LIT.loading=false;render()}catch(e){if(token!==LIT.token)return;LIT.loading=false;LIT.error=String(e?.message||e);render()}
}
function renderLitany(){
 if(!LIT.sections&&!LIT.loading&&!LIT.error)setTimeout(ensureLitany,0);
 if(LIT.error)return `${head(L('Litany of the Saints','Litanies des saints'),L('Traditional litany','Litanies traditionnelles'))}<main class="aoP435930Body">${callout(esc(L('The Litany text could not be loaded. No substitute text is generated.','Le texte des Litanies n’a pas pu être chargé. Aucun texte de remplacement n’est généré.')),'warn')}${devotionalSource(isFr()?'Marty-Laveaux 1862 · Litanies des saints':'Baltimore Manual · Litany of the Saints')}</main>`;
 if(!LIT.sections)return `${head(L('Litany of the Saints','Litanies des saints'),L('Traditional litany','Litanies traditionnelles'))}<main class="aoP435930Body"><p class="aoP435930Loading">${esc(L('Loading the Litany…','Chargement des Litanies…'))}</p></main>`;
 LIT.step=Math.max(0,Math.min(LIT.sections.length-1,LIT.step));const st=LIT.sections[LIT.step],final=LIT.step===LIT.sections.length-1;
 return `${head(L('Litany of the Saints','Litanies des saints'),L('Call · response · guided in sections','Invocation · réponse · guidées par sections'))}<main class="aoP435930Body">${guideRail(LIT.sections.map(x=>x.title),LIT.step,'lit')}${guideNow(st.title,L('Pray the invocations in order. In Group mode the invocation belongs to the leader and the repeated answer to the group; do not race through the names.','Priez les invocations dans l’ordre. En mode Groupe, l’invocation revient au meneur et la réponse répétée au groupe ; ne précipitez pas les noms.'))}<article class="aoP435930Prayer"><div class="aoP435930Text">${nl(st.lines.join('\n'))}</div></article>${guideCue(L('PACE','RYTHME'),L('Leave a small breath between invocations. The repetition is part of the prayer, not text to skim.','Laissez un léger souffle entre les invocations. La répétition fait partie de la prière ; ce n’est pas un texte à parcourir rapidement.'))}<div class="aoP435930GuideNav"><button type="button" class="aoP435930Secondary" data-p435930-lit-prev ${LIT.step===0?'disabled':''}>${esc(L('Previous section','Section précédente'))}</button>${final?`<button type="button" class="aoP435930Primary" data-p435930-lit-done>${esc(L('Finish litany','Terminer les litanies'))}</button>`:`<button type="button" class="aoP435930Primary" data-p435930-lit-next>${esc(L('Continue','Continuer'))}</button>`}</div>${devotionalSource(isFr()?'Marty-Laveaux 1862 · Litanies des saints':'Baltimore Manual · Litany of the Saints')}</main>`
}
function splitSevenWords(txt){const re=/The (First|Second|Third|Fourth|Fifth|Sixth|Seventh) Word\.?/gi,ms=[...String(txt||'').matchAll(re)];if(ms.length<7)return null;return ms.slice(0,7).map((m,i)=>({title:m[0].replace(/\s+/g,' ').trim(),text:txt.slice(m.index+m[0].length,i+1<ms.length?ms[i+1].index:txt.length).trim()}))}
async function ensureSevenWords(){if(SEVEN.sections||SEVEN.loading)return;SEVEN.loading=true;SEVEN.error='';const token=++SEVEN.srcToken;try{const txt=await guidedWsText('A Manual of Prayers for the Use of the Catholic Laity/The Devotion of the Seven Words upon the Cross','seven-words','en');if(token!==SEVEN.srcToken)return;SEVEN.sections=splitSevenWords(txt);if(!SEVEN.sections)throw new Error('Could not divide Seven Words');SEVEN.loading=false;render()}catch(e){if(token!==SEVEN.srcToken)return;SEVEN.loading=false;SEVEN.error=String(e?.message||e);render()}}
function renderSevenWords(){
 if(!SEVEN.sections&&!SEVEN.loading&&!SEVEN.error)setTimeout(ensureSevenWords,0);const i=Math.max(0,Math.min(6,SEVEN.step)),label=(isFr()?WORD_LABELS.fr:WORD_LABELS.en)[i],ref=WORD_REFS[i];
 setTimeout(()=>{++SEVEN.scriptToken;loadScriptureInto('[data-p435930-word-scripture]','gospel',ref,false,()=>SEVEN.scriptToken)},0);
 const hist=SEVEN.sections?.[i]?.text||'';
 return `${head(L('Seven Words of Our Lord','Sept Paroles de Notre-Seigneur'),L('Gospel word · historical meditation · silence','Parole évangélique · méditation historique · silence'))}<main class="aoP435930Body">${guideRail((isFr()?WORD_LABELS.fr:WORD_LABELS.en).map((_,n)=>L('Word '+(n+1),'Parole '+(n+1))),i,'word')}${guideNow(L('Word '+(i+1),'Parole '+(i+1)),L('Read the Gospel words first. Stay with Christ’s words before moving into the historical meditation.','Lisez d’abord les paroles de l’Évangile. Demeurez avec les paroles du Christ avant de passer à la méditation historique.'))}<section class="aoP435930WordHero"><small>${esc(ref)}</small><h2>${esc(label)}</h2><div data-p435930-word-scripture><p class="aoP435930Loading">${esc(L('Loading Gospel text…','Chargement du texte évangélique…'))}</p></div></section>${SEVEN.error?callout(esc(L('The meditation could not be loaded. The Gospel Word remains available; no replacement text is generated.','La méditation n’a pas pu être chargée. La Parole évangélique reste disponible ; aucun texte de remplacement n’est généré.')),'warn'):SEVEN.loading&&!SEVEN.sections?`<p class="aoP435930Loading">${esc(L('Loading meditation…','Chargement de la méditation…'))}</p>`:hist?`<section class="aoP435930HistoricalFocus"><small>${esc(L('MEDITATION','MÉDITATION'))}</small><div class="aoP435930Text">${nl(hist)}</div>${isFr()?`<p class="aoP435930SourceNote">${esc(L('The source meditation is preserved in English because no vetted French witness is attached to this module.','La méditation source est conservée en anglais, faute de témoin français vérifié rattaché à ce module.'))}</p>`:''}</section>`:''}${guideCue(L('SILENCE','SILENCE'),L('When the meditation has ended, stop reading. Remain with this Word before advancing to the next.','Lorsque la méditation est terminée, cessez de lire. Demeurez avec cette Parole avant de passer à la suivante.'))}<div class="aoP435930GuideNav"><button type="button" class="aoP435930Secondary" data-p435930-word-prev ${i===0?'disabled':''}>${esc(L('Previous Word','Parole précédente'))}</button>${i===6?`<button type="button" class="aoP435930Primary" data-p435930-word-done>${esc(L('Finish devotion','Terminer la dévotion'))}</button>`:`<button type="button" class="aoP435930Primary" data-p435930-word-next>${esc(L('Next Word','Parole suivante'))}</button>`}</div>${devotionalSource('Baltimore Manual · The Devotion of the Seven Words upon the Cross',L('Historical meditation witness; Gospel text supplied separately by the app Scripture service.','Témoin historique de la méditation ; texte évangélique fourni séparément par le service biblique de l’application.'))}</main>`
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
function renderFortyHours(){
 FORTY.step=Math.max(0,Math.min(FORTY_STAGES.length-1,FORTY.step));return `${head(L('Forty Hours','Quarante-Heures'),L('Live companion · follow the church, not a timer','Compagnon en direct · suivez l’église, pas un minuteur'))}<main class="aoP435930Body">${callout(esc(L('Use this by what is happening around you, not by a timer. Public worship always outranks the private sequence on the screen.','Utilisez ce guide selon ce qui se passe autour de vous, non selon un minuteur. Le culte public a toujours priorité sur la séquence privée affichée à l’écran.')),'rubric')}${guideRail(FORTY_STAGES.map(x=>L(x[0],x[1])),FORTY.step,'forty')}${fortyStageBody()}<div class="aoP435930GuideNav"><button type="button" class="aoP435930Secondary" data-p435930-forty-prev ${FORTY.step===0?'disabled':''}>${esc(L('Previous','Précédent'))}</button>${FORTY.step===FORTY_STAGES.length-1?`<button type="button" class="aoP435930Primary" data-p435930-forty-done>${esc(L('Done · back to PRAY','Terminé · retour à PRIER'))}</button>`:`<button type="button" class="aoP435930Primary" data-p435930-forty-next>${esc(L('Continue','Continuer'))}</button>`}</div>${devotionalSource('Baltimore Manual · Forty Hours; Saint Andrew Daily Missal · 1951 · special Forty Hours Litany and prayers',L('Historical witnesses for the prayer aids and public-order note. The situational navigation is app guidance, not a claim that every church uses an identical ceremonial schedule.','Témoins historiques pour les aides de prière et la note sur l’ordre public. La navigation selon la situation est une aide de l’application, non l’affirmation que chaque église suit un cérémonial identique.'))}</main>`
}
function render(){const m=mount();if(!m)return;const sig=navigationSignature(),moved=sig!==lastRenderSignature;let html='';if(view==='home')html=renderPrayHome();else if(view==='angelus')html=renderAngelus();else if(view==='rosary')html=renderRosary();else if(view==='confession')html=renderConfession();else if(view==='benediction')html=renderBenediction();else if(view==='adoration')html=renderAdoration();else if(view==='library')html=renderLibrary();else if(view==='stations')html=renderStations();else if(view==='penitential')html=renderPenitential();else if(view==='litany')html=renderLitany();else if(view==='sevenWords')html=renderSevenWords();else if(view==='fortyHours')html=renderFortyHours();else if(view==='firstFriday')html=renderFirstFriday();else if(view==='firstSaturday')html=renderFirstSaturday();else if(view==='fsMeditation')html=renderFSMeditation();else if(view==='prayerOnly')html=renderPrayerOnly(prayerId);else html=renderPrayHome();m.dataset.aoPrayView=view;m.innerHTML=semanticRails()+html;lastRenderSignature=sig;if(moved)queueMicrotask(()=>{m.scrollTop=0});if(view==='stations')queueMicrotask(stationsFx);if(view==='angelus')queueMicrotask(bindAngelusExactRail);else stopAngelusExactRail()}
function stopTimer(){if(ADOR.timer){clearInterval(ADOR.timer);ADOR.timer=null}ADOR.timerEnd=0}
function startTimer(min){stopTimer();ADOR.timerEnd=Date.now()+Number(min)*60000;ADOR.timer=setInterval(()=>{if(Date.now()>=ADOR.timerEnd){stopTimer();render()}else render()},30000);render()}
function routeOwn(id){if(id==='pray.hub')view='home';else view=id==='pray.confession'?'confession':id==='pray.benediction'?'benediction':id==='pray.adoration'?'adoration':id==='pray.stations'?'stations':id==='pray.library'?'library':id==='pray.penitential_psalms'?'penitential':id==='pray.litany_saints'?'litany':id==='pray.seven_words'?'sevenWords':id==='pray.forty_hours'?'fortyHours':id==='programme.first_friday'?'firstFriday':id==='programme.first_saturday'?'firstSaturday':'angelus';if(view==='stations')lastStationsFxStep=null;render()}
function openPrayerOnly(id){prayerReturnView=view;prayerId=id;view='prayerOnly';render()}
function onClick(e){
 const b=e.target.closest?.('button,[data-p435930-flip]');if(!b)return;
 if(b.matches('[data-p435930-close]'))return close();
 if(b.matches('[data-p435930-back]')){if(view==='adoration'&&ADOR.mode!=='home'){ADOR.mode='home';return render()}if(view==='library'&&LIB.open){LIB.open=null;return render()}if(view==='prayerOnly'){view=prayerReturnView||'library';return render()}if(view!=='home'&&navStack.length){popView();return render()}return close()}
 if(b.matches('[data-p435930-flip]')){const a=b.querySelector('[data-face-la]'),v=b.querySelector('[data-face-v]');if(a&&v){const showV=v.hidden;v.hidden=!showV;a.hidden=showV}return}
 if(b.matches('[data-p435930-card-flip]')){const v=b.querySelector('[data-face-v]'),a=b.querySelector('[data-face-la]');if(v&&a){const showA=a.hidden;a.hidden=!showA;v.hidden=showA}return}
 const seg=b.dataset.p435930Seg;if(seg){if(view==='angelus'){S.angelusMode=seg;save()}else if(view==='rosary'){if(['standard','devotional'].includes(seg)){S.rosary.form=seg;save()}else if(['simple','guided'].includes(seg)){S.rosary.mode=seg;save()}else if(['individual','group'].includes(seg)){setRecitationMode(seg);try{window.AO_PRAY_COHERENCE_V435930?.setMode?.(seg)}catch{}}}else if(view==='adoration'&&['reserved','exposed'].includes(seg)){setAdorationPresence(seg)}else if(view==='stations'&&['guided','simple'].includes(seg)){S.stations.mode=seg;save()}else if(view==='library'&&LIB.open){LIB.language=seg}return render()}
 if(b.matches('[data-p435930-launch-rosary]')){launchRosaryPlayer(captureResume());return}
 if(b.dataset.p435930ConfStage!=null){CONF.stage=+b.dataset.p435930ConfStage;return render()}
 if(b.matches('[data-p435930-conf-prev]')){CONF.stage=Math.max(0,CONF.stage-1);return render()}
 if(b.matches('[data-p435930-conf-next]')){if(CONF.stage>=4){CONF={stage:0,marked:new Set(),since:'',graveReviewed:false,contrition:false};view='home';return render()}CONF.stage++;return render()}
 if(b.matches('[data-p435930-conf-clear]')){CONF={stage:0,marked:new Set(),since:'',graveReviewed:false,contrition:false};return render()}
 if(b.dataset.p435930BenStep!=null){BEN.step=+b.dataset.p435930BenStep;return render()}
 if(b.matches('[data-p435930-ben-prev]')){BEN.step=Math.max(0,BEN.step-1);return render()}
 if(b.matches('[data-p435930-ben-next]')){if(BEN.step===BEN_STAGES.length-1){setAdorationPresence('reserved');BEN={step:0,divinePraises:false};popView('home');return render()}BEN.step++;return render()}
 if(b.dataset.p435930AdorMode){ADOR.mode=b.dataset.p435930AdorMode;if(ADOR.mode==='visit')ADOR.visitStep=0;if(ADOR.mode==='holy')ADOR.holyStep=0;if(ADOR.mode==='four')ADOR.fourStep=0;return render()}
 if(b.matches('[data-p435930-ador-home]')){ADOR.mode='home';stopTimer();return render()}
 if(b.dataset.p435930Timer)return startTimer(+b.dataset.p435930Timer);
 if(b.matches('[data-p435930-timer-stop]')){stopTimer();return render()}
 if(b.matches('[data-p435930-go-ben]')){setAdorationPresence('exposed');pushView();view='benediction';BEN.step=0;return render()}
 if(b.matches('[data-p435930-ador-four]')){ADOR.mode='four';ADOR.fourStep=0;return render()}
 if(b.dataset.p435930HolyStep!=null){ADOR.holyStep=+b.dataset.p435930HolyStep;return render()}
 if(b.dataset.p435930VisitStep!=null){ADOR.visitStep=+b.dataset.p435930VisitStep;return render()}
 if(b.dataset.p435930FourStep!=null){ADOR.fourStep=+b.dataset.p435930FourStep;return render()}
 if(b.matches('[data-p435930-visit-prev]')){ADOR.visitStep=Math.max(0,ADOR.visitStep-1);return render()}
 if(b.matches('[data-p435930-visit-next]')){if(ADOR.visitStep>=visitSteps().length-1){ADOR.visitStep=0;ADOR.mode='home'}else ADOR.visitStep++;return render()}
 if(b.matches('[data-p435930-holy-prev]')){ADOR.holyStep=Math.max(0,ADOR.holyStep-1);return render()}
 if(b.matches('[data-p435930-holy-next]')){if(ADOR.holyStep>=holySteps().length-1){ADOR.holyStep=0;ADOR.mode='home'}else ADOR.holyStep++;return render()}
 if(b.matches('[data-p435930-four-prev]')){ADOR.fourStep=Math.max(0,ADOR.fourStep-1);return render()}
 if(b.matches('[data-p435930-four-next]')){if(ADOR.fourStep>=fourSteps().length-1){ADOR.fourStep=0;ADOR.mode='open'}else ADOR.fourStep++;return render()}
 if(b.matches('[data-p435930-go-rosary]')){launchRosaryPlayer(captureResume());return}
 if(b.dataset.p435930OpenPrayer)return openPrayerOnly(b.dataset.p435930OpenPrayer);
 if(b.matches('[data-p435930-prayer-return]')){view=prayerReturnView||'library';return render()}
 if(b.dataset.p435930StationStep!=null){STATIONS.step=Math.max(0,Math.min(13,+b.dataset.p435930StationStep));return render()}
 if(b.matches('[data-p435930-station-prev]')){STATIONS.step=Math.max(0,STATIONS.step-1);return render()}
 if(b.matches('[data-p435930-station-next]')){if(STATIONS.step>=13){STATIONS.step=0;view='home'}else STATIONS.step++;return render()}
 if(b.dataset.p435930LibCat!=null){LIB.cat=b.dataset.p435930LibCat;return render()}
 if(b.dataset.p435930LibOpen){LIB.open=b.dataset.p435930LibOpen;LIB.language=null;return render()}
 if(b.matches('[data-p435930-lib-back]')){LIB.open=null;return render()}
 if(b.dataset.p435930PenStep!=null){PEN.step=Math.max(0,Math.min(6,+b.dataset.p435930PenStep));return render()}
 if(b.matches('[data-p435930-pen-prev]')){PEN.step=Math.max(0,PEN.step-1);return render()}
 if(b.matches('[data-p435930-pen-next]')){PEN.step=Math.min(6,PEN.step+1);return render()}
 if(b.matches('[data-p435930-pen-litany]')){pushView();view='litany';LIT.step=0;return render()}
 if(b.dataset.p435930LitStep!=null){LIT.step=Math.max(0,Math.min((LIT.sections?.length||1)-1,+b.dataset.p435930LitStep));return render()}
 if(b.matches('[data-p435930-lit-prev]')){LIT.step=Math.max(0,LIT.step-1);return render()}
 if(b.matches('[data-p435930-lit-next]')){LIT.step=Math.min((LIT.sections?.length||1)-1,LIT.step+1);return render()}
 if(b.matches('[data-p435930-lit-done]')){if(navStack.at(-1)==='penitential'){navStack.pop();popView('home')}else popView('home');return render()}
 if(b.dataset.p435930WordStep!=null){SEVEN.step=Math.max(0,Math.min(6,+b.dataset.p435930WordStep));return render()}
 if(b.matches('[data-p435930-word-prev]')){SEVEN.step=Math.max(0,SEVEN.step-1);return render()}
 if(b.matches('[data-p435930-word-next]')){SEVEN.step=Math.min(6,SEVEN.step+1);return render()}
 if(b.matches('[data-p435930-word-done]')){popView('home');return render()}
 if(b.dataset.p435930FortyStep!=null){FORTY.step=Math.max(0,Math.min(FORTY_STAGES.length-1,+b.dataset.p435930FortyStep));return render()}
 if(b.matches('[data-p435930-forty-prev]')){FORTY.step=Math.max(0,FORTY.step-1);return render()}
 if(b.matches('[data-p435930-forty-next]')){FORTY.step=Math.min(FORTY_STAGES.length-1,FORTY.step+1);return render()}
 if(b.matches('[data-p435930-forty-done]')){FORTY.step=0;popView('home');return render()}
 if(b.matches('[data-p435930-forty-ben]')){pushView();view='benediction';BEN.step=0;return render()}
 if(b.dataset.p435930FortyOwn){const id=b.dataset.p435930FortyOwn;if(id==='pray.rosary'){launchRosaryPlayer(captureResume());return}pushView();if(id==='pray.adoration'){view='adoration';ADOR.mode=b.dataset.p435930FortyAdor||'open'}else if(id==='pray.litany_saints'){view='litany';LIT.step=0}else if(id==='pray.penitential_psalms'){view='penitential';PEN.step=b.dataset.p435930FortyPsalm!=null?+b.dataset.p435930FortyPsalm:0};return render()}
 if(b.dataset.p435930Handoff)return handoff(b.dataset.p435930Handoff);
 if(b.dataset.p435930Own){if(b.dataset.p435930Own==='pray.rosary'){launchRosaryPlayer(captureResume());return}pushView();routeOwn(b.dataset.p435930Own);return}
 if(b.matches('[data-p435930-ador-mode-direct]')){view='adoration';ADOR.mode=b.dataset.p435930AdorModeDirect;if(ADOR.mode==='visit')ADOR.visitStep=0;if(ADOR.mode==='holy')ADOR.holyStep=0;if(ADOR.mode==='four')ADOR.fourStep=0;return render()}
 if(b.dataset.p435930FfStage!=null){FF.step=Math.max(0,Math.min(FF_STAGES.length-1,+b.dataset.p435930FfStage));return render()}
 if(b.matches('[data-p435930-ff-prev]')){FF.step=Math.max(0,FF.step-1);return render()}
 if(b.matches('[data-p435930-ff-next]')){FF.step=Math.min(FF_STAGES.length-1,FF.step+1);return render()}
 if(b.dataset.p435930FsStage!=null){FS.step=Math.max(0,Math.min(FS_STAGES.length-1,+b.dataset.p435930FsStage));return render()}
 if(b.matches('[data-p435930-fs-prev]')){FS.step=Math.max(0,FS.step-1);return render()}
 if(b.matches('[data-p435930-fs-next]')){FS.step=Math.min(FS_STAGES.length-1,FS.step+1);return render()}
 if(b.dataset.p435930FsMedSet){FS.medSet=b.dataset.p435930FsMedSet;FS.medMystery=0;return render()}
 if(b.dataset.p435930FsMedMystery!=null){FS.medMystery=+b.dataset.p435930FsMedMystery;return render()}
 if(b.matches('[data-p435930-program-home]')){stopTimer();view='home';navStack=[];return render()}
 if(b.matches('[data-p435930-ff-save]')){const date=selectedDateKey();if(!isFirstWeekday(date,5)||!FF.intention||!FF.communion)return;upsert(S.firstFriday.records,{date,intention:true,communion:true,complete:true,reportedAt:nowIso()});save();FF.step=4;return render()}
 if(b.matches('[data-p435930-ff-interrupt]')){const date=selectedDateKey();if(!isFirstWeekday(date,5))return;upsert(S.firstFriday.records,{date,intention:!!FF.intention,communion:!!FF.communion,complete:false,interrupted:true,reportedAt:nowIso()});save();FF.step=4;return render()}
 if(b.matches('[data-p435930-fs-meditate]')){stopTimer();view='fsMeditation';return render()}
 if(b.matches('[data-p435930-fs-meditation-complete]')){stopTimer();FS.meditation=true;FS.step=4;view='firstSaturday';return render()}
 if(b.matches('[data-p435930-fs-meditation-return]')){stopTimer();FS.step=4;view='firstSaturday';return render()}
 if(b.matches('[data-p435930-fs-save]')){const date=selectedDateKey(),complete=isFirstWeekday(date,6)&&FS.intention&&FS.communion&&FS.rosary&&FS.meditation&&!!FS.confessionDate;if(!complete)return;upsert(S.firstSaturday.records,{date,intention:true,communion:true,rosary:true,meditation:true,confessionDate:FS.confessionDate,complete:true,reportedAt:nowIso()});save();FS.step=5;return render()}
 if(b.matches('[data-p435930-fs-interrupt]')){const date=selectedDateKey();if(!isFirstWeekday(date,6))return;upsert(S.firstSaturday.records,{date,intention:!!FS.intention,communion:!!FS.communion,rosary:!!FS.rosary,meditation:!!FS.meditation,confessionDate:FS.confessionDate||'',complete:false,interrupted:true,reportedAt:nowIso()});save();FS.step=5;return render()}
}
function onChange(e){const x=e.target;
 if(x.matches('[data-p435930-angelus-appendix]')){S.angelusHistoricalConclusion=x.checked;save();return render()}
 if(x.matches('[data-p435930-grave-reviewed]')){CONF.graveReviewed=x.checked;return}
 if(x.matches('[data-p435930-ben-praises]')){BEN.divinePraises=x.checked;return render()}
 if(x.matches('[data-p435930-station-stabat]')){S.stations.stabat=x.checked;save();return render()}
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
 'pray.visit_blessed_sacrament':{id:'pray.visit_blessed_sacrament',type:'module',domain:'pray',category:'eucharistic',title:'Visit to the Blessed Sacrament'},
 'pray.library':{id:'pray.library',type:'module',domain:'pray',category:'library',title:'Prayer Library'},
 'pray.penitential_psalms':{id:'pray.penitential_psalms',type:'module',domain:'pray',category:'penance-passion',title:'Seven Penitential Psalms'},
 'pray.litany_saints':{id:'pray.litany_saints',type:'module',domain:'pray',category:'penance-passion',title:'Litany of the Saints'},
 'pray.seven_words':{id:'pray.seven_words',type:'module',domain:'pray',category:'penance-passion',title:'Seven Words of Our Lord'},
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
window.AO_PRAY_V435930={version:VERSION,open,close,state:()=>({...JSON.parse(JSON.stringify(S)),view,confessionStage:CONF.stage,benedictionStep:BEN.step,adorationMode:ADOR.mode,adorationPresence:adorationPresence()}),setRecitationMode,applySettingsPreferences,sources:SOURCE_REGISTRY,qa,clearSavedState(){S=cloneDefault();setAdorationPresence('reserved');save();return true}};
})();


}
