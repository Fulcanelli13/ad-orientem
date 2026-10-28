import { NOVENA_CORPUS_V4 as CORPUS, NOVENA_START_KIND } from "./novena-corpus-v4.js";
import { ICKSP_THERESE_DEVOTIONS_V1 } from "./icksp-therese-devotions.v1.js";
import { ICKSP_DIVINE_INFANT_KING_NOVENA_V1, monthlyInfantKingStatus } from "./icksp-divine-infant-king-novena.v1.js";
import { ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1, annualInstituteImmaculateStatus } from "./icksp-immaculate-conception-novena.v1.js";
// Existing sixteen remain frozen; the ICKSP source is an optional extension of the same reader.
const ADDITIONAL_NOVENAS=Object.freeze({[ICKSP_DIVINE_INFANT_KING_NOVENA_V1.id]:ICKSP_DIVINE_INFANT_KING_NOVENA_V1,[ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1.id]:ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1});
const ALL_NOVENAS=Object.freeze({...CORPUS,...ADDITIONAL_NOVENAS});
import { novenaSourceAccess } from "./novena-source-access.v1.js";
import { novenaScriptureContextHtml } from "./novena-scripture-context.js";
import { hammerHistoricalDayWitness } from "./novena-hammer-day-witness.v1.js";
import { hammerHistoricalDayText } from "./novena-hammer-original-texts.v1.js";
import { NOVENA_CONTEXT_V1, novenaContext } from "./novena-context-v1.js";
import { installNovenaStyles } from "./novena-styles.js";
import { installSequentialDevotionalReader,novenaStageChapters } from "./devotional-sequence-adapter.js";
import { novenaStatusFor } from "../calendar/intelligence.js";
import { formatDisplayDate } from "../app/date-format.js";
import {captureObservedModuleOrigin,returnToObservedModuleOrigin} from "../app/observed-module-return.js";
import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";

// Bilingual completion layer over the exact v43.59.33 Guided Novenas N3 donor.
// The donor stays frozen; V4 adds French prayer bodies and the four previously held targets.
const VERSION="44.0-bilingual-novenas-v1";

function mountNovenaRuntime(){
 if(typeof window==="undefined"||typeof document==="undefined")return false;
 if(window.AO_NOVENAS_V3)return window.AO_NOVENAS_V3;
 installNovenaStyles(document);
const PR=window.AO_PRAY_V435930;
if(!PR?.open||!PR?.close)return;
const BASE_OPEN=PR.open.bind(PR),BASE_CLOSE=PR.close.bind(PR);
const STORE_MODE='ao:novenas:n1:mode';
let OPEN_OPTS={},OPEN_RECEIPT=null,detailFromOverview=false;
let N={screen:'overview',id:null,day:1,mode:(()=>{try{return localStorage.getItem(STORE_MODE)==='simple'?'simple':'guided'}catch{return'guided'}})(),stage:0,showEnglish:false};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n1UiIcon=id=>{
 const url=resolveCanonicalAssetUrl(id);
 if(url)return `<span class="aoP435930UiIcon" data-ao-asset-id="${esc(id)}" aria-hidden="true" style="display:inline-block;width:18px;height:18px;background:currentColor;-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`;
 return "";
};
const nl=v=>esc(v).replace(/\n/g,'<br>');
// Preserve original paragraph boundaries; single newlines remain deliberate line breaks.
const novenaParagraphs=v=>String(v??'').replace(/\r\n/g,'\n')
 .split(/\n[ \t]*\n+/).filter(x=>x.trim())
 .map(x=>'<p class="aoN1PrayerParagraph">'+nl(x)+'</p>').join('');
const isFr=()=>{try{const x=JSON.parse(localStorage.getItem('ao2:settings:v1')||'{}');return x.language==='fr'}catch{return false}};
const L=(en,fr)=>isFr()?fr:en;
const txt=o=>o?(isFr()?o.fr:o.en)||o.en||o.fr||'':'';
const startKindLabel=n=>n?.startKind===NOVENA_START_KIND.TRADITIONAL
 ?L('Traditional start','Début traditionnel')
 :L('Suggested start','Début suggéré');
const mount=()=>document.querySelector('#aoPray435930 .aoP435930Mount');
const root=()=>document.getElementById('aoPray435930');
const prayerData=()=>window.AO_PRAY_CANONICAL_DATA_V435930?.prayers||{};
function selectedDate(){
 const v=window.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate;
 if(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}/.test(v))return new Date(v.slice(0,10)+'T12:00:00');
 if(v instanceof Date&&!isNaN(v))return new Date(v.getFullYear(),v.getMonth(),v.getDate(),12);
 const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);
}
function fmt(d){return formatDisplayDate(d)}
function calStatus(n){
 if(n.id===ICKSP_DIVINE_INFANT_KING_NOVENA_V1.id){
  const v=monthlyInfantKingStatus(selectedDate());
  return isFr()?{...v,label:v.kind==='active'?`Jour ${v.day} sur 9 · neuvaine du 17 au 25`:'Prochaine neuvaine mensuelle · du 17 au 25'}:v;
 }
 if(n.id===ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1.id){
  const v=annualInstituteImmaculateStatus(selectedDate());
  return isFr()?{...v,label:v.kind==='active'?`Jour ${v.day} sur 9 · du 30 novembre au 8 décembre`:`Prochaine neuvaine de l’Institut · 30 novembre–8 décembre ${v.w.start.getFullYear()}`}:v;
 }
 const now=selectedDate(),key=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'),c=novenaStatusFor(n,key,{fr:isFr()});const w={start:new Date(c.window.start+'T12:00:00'),end:new Date(c.window.end+'T12:00:00'),feast:new Date(c.window.feast+'T12:00:00')};return{kind:c.kind,day:c.day,label:c.label,w}}
function head(title,sub=''){return `<header class="aoP435930Head"><button type="button" class="aoP435930Back" data-n1-back aria-label="${esc(L('Back','Retour'))}">${n1UiIcon('ao-ui-back')}</button><div><small>${esc(L('PRAY · NOVENAS','PRIER · NEUVAINES'))}</small><h1 id="aoP435930Title">${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div><button type="button" class="aoP435930Home" data-n1-home aria-label="${esc(typeof OPEN_OPTS?.onCloseReturn==='function'?L('Return to Scripture','Retour à l’Écriture'):L('Home','Accueil'))}">${n1UiIcon('ao-nav-home')}</button></header>`}
function modeNav(){return `<div class="aoP435930Seg" role="group" aria-label="${esc(L('Depth','Profondeur'))}"><button type="button" class="${N.mode==='simple'?'active':''}" aria-pressed="${N.mode==='simple'}" data-n1-mode="simple">${esc(L('Simple','Simple'))}</button><button type="button" class="${N.mode==='guided'?'active':''}" aria-pressed="${N.mode==='guided'}" data-n1-mode="guided">${esc(L('Guided','Guidé'))}</button></div>`}
function sourceDetails(n){
 const s=n.source||{},section=novenaSourceAccess(n.id),url=String(s.url||'');
 const direct=/^https:\/\/[a-z0-9.-]+\//i.test(url)
   ?`<p><a class="aoN1SourcePrimary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(L('Read the cited text','Consulter le texte cité'))} ↗</a></p>`
   :`<p class="aoN1Fine">${esc(L('A direct source link is unavailable.','Aucun lien direct vers la source n’est disponible.'))}</p>`;
 const note=section?`<p class="aoN1Fine aoN1SourceSection"><b>${esc(txt(section.heading))}</b></p><p class="aoN1Fine">${esc(txt(section.note))}</p>`:'';
 const links=(n.historySources||[]).filter(x=>/^https:\/\//i.test(x.url||'')).map(x=>`<li><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.label)} ↗</a></li>`).join('');
 return `<details class="aoN1Details aoN1SourceDetails"><summary>${esc(L('Sources & edition','Sources et édition'))}</summary><p><b>${esc(s.work||n.id)}</b><br>${esc(s.authors||'')}<br>${esc(s.edition||'')}<br>${esc(s.approval||'')}</p>${direct}${note}${s.adaptation?`<p>${esc(s.adaptation)}</p>`:''}${links?`<ul>${links}</ul>`:''}<p class="aoN1Fine">${esc(L('An identified source or translation is not in itself proof of complete word-for-word collation.', 'Un texte source identifié ou une traduction ne constitue pas, à lui seul, une vérification intégrale mot à mot.'))}</p></details>`;
}
function contextSource(id){return (NOVENA_CONTEXT_V1.sourceRegistry||[]).find(x=>x.id===id)||null}
function contextDetails(n){
 const x=novenaContext(n.id);if(!x)return'';
 const practice=`<details class="aoN1Details"><summary>${esc(L('Practice & gestures','Pratique et gestes'))}</summary><p>${esc(isFr()?x.practice.fr:x.practice.en)}</p><p class="aoN1Fine">${esc(L('Kneeling, candles and images are not universal requirements of every novena. Follow the historical text and legitimate local custom.','L’agenouillement, les bougies et les images ne sont pas exigés par toutes les neuvaines. Suivez le texte historique et l’usage local légitime.'))}</p></details>`;
 const current=x.indulgence.current_public_novena,src=contextSource(current.source_id);
 const related=(x.indulgence.related_current_works||[]).map(item=>{const s=contextSource(item.source_id);return `<li><b>${esc(item.classification.replaceAll('_',' '))}</b><br>${esc(isFr()?item.fr:item.en)}${s?`<br><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`:''}</li>`}).join('');
 const indulgence=`<details class="aoN1Details"><summary>${esc(L('Indulgences','Indulgences'))}</summary><p><b>${esc(L('Current public-novena grant','Concession actuelle pour la neuvaine publique'))}</b><br>${esc(isFr()?current.fr:current.en)}</p>${src?`<p><a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.title)} ↗</a></p>`:''}${related?`<p><b>${esc(L('Related currently indulgenced works','Œuvres associées actuellement indulgenciées'))}</b></p><ul>${related}</ul>`:''}<p><b>${esc(L('Historical indulgence context','Contexte historique des indulgences'))}</b><br>${esc(isFr()?x.indulgence.historical.fr:x.indulgence.historical.en)}</p><p class="aoN1Fine">${esc(L('Plenary indulgences require the conditions and dispositions specified by current Church law. Historical grants are not carried forward automatically.','Les indulgences plénières exigent les conditions et dispositions prévues par le droit actuel de l’Église. Les anciennes concessions ne sont pas automatiquement reconduites.'))}</p></details>`;
 const crossLinks=(x.crossDomain.links||[]).length;
 const cross=`<details class="aoN1Details"><summary>${esc(L('Customs & places','Coutumes et lieux'))}</summary><p>${esc(isFr()?x.crossDomain.display.fr:x.crossDomain.display.en)}</p>${crossLinks?`<button type="button" class="aoP435930Secondary" data-n1-explore="${esc(n.id)}">${esc(L('Explore related customs & places','Explorer les coutumes et lieux associés'))}</button>`:''}<p class="aoN1Fine">${esc(L('Geographical association is evidence-backed only; proximity to a shrine, community or TLM venue never creates a custom link by itself.','Toute association géographique doit être étayée par des preuves ; la proximité d’un sanctuaire, d’une communauté ou d’un lieu de messe traditionnelle ne crée jamais à elle seule un lien coutumier.'))}</p></details>`;
 return practice+indulgence+cross;
}
function about(n){return `<div class="aoN1Info"><h3>${esc(L('What this novena is','Ce qu’est cette neuvaine'))}</h3><p>${esc(txt(n.meaning))}</p></div><details class="aoN1Details"><summary>${esc(L('History','Histoire'))}</summary><p>${esc(txt(n.history))}</p></details><details class="aoN1Details"><summary>${esc(L('How to pray it','Comment la prier'))}</summary><p>${esc(txt(n.how))}</p></details>${contextDetails(n)}${novenaScriptureContextHtml(n.id,{french:isFr()})}${sourceDetails(n)}`}
function icon(){return `<span class="aoN1HeroIcon" aria-hidden="true"><svg viewBox="0 0 128 128"><use href="#ao-rich-novenas"></use></svg></span>`}
function renderOverview(){const items=Object.values(CORPUS),statuses=items.map(n=>[n,calStatus(n)]),next=statuses.filter(x=>x[1].kind==='active'||x[1].kind==='upcoming').sort((a,b)=>a[1].w.start-b[1].w.start)[0];return `${head(L('Novenas','Neuvaines'),L('Traditional novenas · guided prayer','Neuvaines traditionnelles · prière guidée'))}<main class="aoP435930Body"><section class="aoN1Hero">${icon()}<small>${items.length} ${esc(L('bilingual sourced novenas','neuvaines bilingues sourcées'))}</small><h2>${esc(L('Choose a novena','Choisissez une neuvaine'))}</h2><p>${esc(L('Choose Simple to read the traditional prayers continuously, or Guided to follow their sequence one stage at a time.','Choisissez le mode Simple pour lire les prières traditionnelles sans interruption, ou le mode Guidé pour suivre leurs étapes.'))}</p></section>${next?`<div class="aoN1Calendar"><b>${esc(next[1].kind==='active'?L('In season now','En cours dans le calendrier'):L('Coming up','À venir'))}</b><br>${esc(txt(next[0].title))} · ${esc(next[1].label)}</div>`:''}<section><span class="aoN1Kicker">${esc(L('TRADITIONAL NOVENAS','NEUVAINES TRADITIONNELLES'))}</span><div class="aoN1Grid">${statuses.map(([n,c])=>`<button type="button" class="aoN1Card ${c.kind==='active'?'active':''}" data-n1-select="${esc(n.id)}"><small>${esc(txt(n.family))}</small><b>${esc(txt(n.title))}</b><span>${esc(c.label)}</span><em>${esc(n.form==='REPEAT_FORM'?L('one historical form · 9 days','une forme historique · 9 jours'):L('9 day-specific prayers','9 prières propres'))}</em></button>`).join('')}</div></section><section data-n1-institute-supplement><span class="aoN1Kicker">${esc(L('INSTITUTE DEVOTIONS','DÉVOTIONS DE L’INSTITUT'))}</span><div class="aoN1Grid"><button type="button" class="aoN1Card" data-n1-supplement="divine_infant_king"><small>${esc(txt(ICKSP_DIVINE_INFANT_KING_NOVENA_V1.family))}</small><b>${esc(txt(ICKSP_DIVINE_INFANT_KING_NOVENA_V1.title))}</b><span>${esc(calStatus(ICKSP_DIVINE_INFANT_KING_NOVENA_V1).label)}</span><em>${esc(L('One historical prayer · nine days · monthly 17–25','Une prière historique · neuf jours · 17–25 de chaque mois'))}</em></button><button type="button" class="aoN1Card" data-n1-supplement="icksp_immaculate_conception"><small>${esc(txt(ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1.family))}</small><b>${esc(txt(ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1.title))}</b><span>${esc(calStatus(ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1).label)}</span><em>${esc(L('Pius X prayer · 30 Nov–8 Dec · repeats each day','Prière de Pie X · 30 nov.–8 déc. · répétée chaque jour'))}</em></button><button type="button" class="aoN1Card" data-n1-therese-weekly><small>${esc(L('Every Tuesday · recurring devotion','Chaque mardi · dévotion hebdomadaire'))}</small><b>${esc(L('St Thérèse · perpetual Institute novena','Sainte Thérèse · neuvaine perpétuelle de l’Institut'))}</b><span>${esc(L('Original ICKSP form · source linked','Forme propre de l’ICRSP · source accessible'))}</span><em>${esc(L('Weekly Tuesday prayer · not nine successive days','Prière du mardi · non neuf jours consécutifs'))}</em></button></div></section></main>`}
function novenaDayFolio(n,active,{compact=false}={}){
 const days=n.days.map((d,i)=>{
  const day=i+1,selected=day===active;
  return `<button type="button" class="aoN1DayLeaf ${selected?'active':''}" data-n1-day="${day}" aria-label="${esc(L('Read day ','Lire le jour ')+day+': '+txt(d.theme))}" aria-current="${selected?'step':'false'}" title="${esc(txt(d.theme))}"><span class="aoN1DayLeafRule" aria-hidden="true"></span><small>${day}</small></button>`;
 }).join('');
 return `${compact?'<details class="aoN1DayDisclosure"><summary>':'<section class="aoN1DayFolio">'}
  <span class="aoN1DayFolioLabel">${esc(L('Nine days of prayer','Neuf jours de prière'))}</span>
  <span class="aoN1DayFolioActive">${esc(L('Day ','Jour ')+active+L(' of 9',' sur 9'))}</span>
  ${compact?'</summary>':''}
  <div class="aoN1DayGrid" role="group" aria-label="${esc(L('Choose a novena day','Choisir un jour de neuvaine'))}">${days}</div>
  ${compact?'</details>':'</section>'}`;
}
function renderDetail(n){
 const c=calStatus(n),suggest=(c.kind==='active'||c.kind==='upcoming')?c.day:1;
 const startNote=n.calendar.precision.includes('PENDING')
  ?L(' · Transfer-aware 1962 date still under review',' · Date 1962 avec transfert encore à vérifier'):'';
 return `${head(txt(n.title),txt(n.family))}
  <main class="aoP435930Body aoN1DetailFolio" data-ao-novena-detail="quiet-v1">
   <div class="aoN1ContextLine">
    <span>${esc(startKindLabel(n))}</span>
    <b>${esc(txt(n.traditionalStart))}</b>
    <small>${esc(c.label+startNote)}</small>
   </div>
   ${modeNav()}
   ${novenaDayFolio(n,suggest)}
   <button type="button" class="aoP435930Primary aoN1PrayDay" data-n1-begin="${suggest}">${esc(c.kind==='active'?L('Pray today · Day '+suggest,'Prier aujourd’hui · Jour '+suggest):L('Pray day '+suggest,'Prier le jour '+suggest))}</button>
   ${n.id==="st_therese"?`<div class="aoN1Info" data-n1-therese-source><h3>${esc(L("Institute of Christ the King · St Thérèse","Institut du Christ-Roi · Sainte Thérèse"))}</h3><p>${esc(L("The Institute’s perpetual Tuesday novena, prayer for missionaries and historical prayer to St Thérèse are separate from the existing Twenty-Four Glory Bes novena.","La neuvaine perpétuelle du mardi, la prière pour les missionnaires et la prière historique de l’Institut sont distinctes de la présente neuvaine des vingt-quatre Gloria Patri."))}</p><button type="button" data-n1-icksp-therese>${esc(L("Open Institute devotions","Ouvrir les dévotions de l’Institut"))}</button></div>`:""}
   <details class="aoN1AboutDisclosure">
    <summary>${esc(L('About this novena · history, practice and sources','À propos de cette neuvaine · histoire, pratique et sources'))}</summary>
    <div class="aoN1AboutContents"><p class="aoN1AboutFeast">${esc(txt(n.feast))}</p><p>${esc(txt(n.how))}</p>${about(n)}</div>
   </details>
  </main>`;
}
function sourceWitness(text,label){
 if(!text)return'';
 const bilingual=typeof text==='object'&&text!==null;
 const en=bilingual?String(text.en||''):String(text||'');
 const fr=bilingual?String(text.fr||''):'';
 const n=N.id?ALL_NOVENAS[N.id]:null;
 if(isFr()&&!N.showEnglish&&!fr)return `<div class="aoN1FailClosed"><b>${esc('Le texte français de cette prière n’est pas disponible.')}</b><br><button type="button" class="aoP435930Secondary" data-n1-show-en>${esc('Afficher le témoin anglais')}</button></div>`;
 const showEnglish=isFr()&&N.showEnglish;
 const value=showEnglish?en:(isFr()?fr:en);
 let witnessLabel=label;
 if(isFr()){
   if(showEnglish)witnessLabel='TÉMOIN SOURCE ANGLAIS';
   else if(String(n?.frenchTextStatus||'').includes('SOURCE_LOCKED'))witnessLabel='TEXTE FRANÇAIS TRADITIONNEL';
   else if(String(n?.frenchTextStatus||'').includes('TRADITIONAL_FRENCH_WITNESS'))witnessLabel='TEXTE FRANÇAIS TRADITIONNEL';
   else witnessLabel='TRADUCTION FRANÇAISE · ALIGNÉE SUR LA SOURCE';
 }
 const toggle=isFr()&&en&&fr?`<button type="button" class="aoP435930Secondary" data-n1-show-en>${esc(showEnglish?'Revenir au français':'Voir le témoin anglais')}</button>`:'';
 return `<article class="aoN1SourceText"><small>${esc(witnessLabel)}</small>${novenaParagraphs(value)}${toggle}</article>`;
}
function canonicalPrayer(id,count=1){const p=prayerData()[id];if(!p)return `<div class="aoN1FailClosed">${esc(L('Canonical prayer record unavailable in this build.','Prière canonique indisponible dans cette version.'))}</div>`;const v=(isFr()?p.fr:p.en)||'',la=p.la||'',title=isFr()?(p.titleFr||p.title):p.title;return `<article class="aoN1Canon"><div class="aoN1CanonHead"><b>${esc(title||id)}</b><span>${count>1?count+'×':''}</span></div>${la&&v?`<button type="button" data-n1-flip><span data-face-v>${nl(v)}</span><span data-face-la hidden>${nl(la)}</span></button>`:`<div>${nl(v||la)}</div>`}</article>`}
function commonPrayers(n){return (n.commonPrayers||[]).map(x=>canonicalPrayer(x[0],x[1])).join('')}
function daySource(n,d){return n.form==='REPEAT_FORM'?n.repeatText:d.text}
function novenaPattern(n){return n.pattern||(n.id==='immaculate_conception'?'OPENING_DAY_COMMON_CLOSE':'STANDARD')}
function novenaChapters(n){return novenaPattern(n)==='SOURCE_REPEAT_ONLY'
 ?[{id:'prepare',title:L('Prepare','Se préparer')},{id:'repeat',title:L('Historical prayer','Prière historique')},{id:'close',title:L('Close','Conclure')}]
 :novenaStageChapters({pattern:novenaPattern(n),sharedClosing:!!n.sharedClosingText},{french:isFr()})}
function stages(n){const p=novenaPattern(n);return p==='SOURCE_REPEAT_ONLY'?3:p==='HAMMER_MARIAN'?6:p==='OPENING_DAY_COMMON_CLOSE'?5:p==='COMMON_BEFORE_REPEAT'?4:(n.sharedClosingText?5:4)}
function stageRail(n){const total=stages(n);return `<div class="aoN1StageRail" aria-label="${esc(L('Guided stages','Étapes guidées'))}">${Array.from({length:total},(_,i)=>`<span class="${i<N.stage?'done':i===N.stage?'current':''}"></span>`).join('')}</div>`}
function commonNote(n){if(n.commonNote)return txt(n.commonNote);return n.id==='st_joseph'?L('Moran directs three Our Fathers and three Hail Marys each day.','Moran prescrit trois Notre Père et trois Je vous salue Marie chaque jour.'):n.id==='holy_ghost'||n.id==='christmas'?L('The source directs one Our Father, one Hail Mary and one Glory Be after the daily prayer.','La source prescrit un Notre Père, un Je vous salue Marie et un Gloire au Père après la prière du jour.'):n.id==='immaculate_conception'?L('Moran directs nine Hail Marys and one Glory Be before the day prayer; they are kept here as a distinct guided stage.','Moran prescrit neuf Je vous salue Marie et un Gloire au Père avant la prière du jour ; ils sont conservés ici comme étape guidée distincte.'):L('The historical source does not prescribe an additional daily prayer sequence beyond the novena prayer itself.','La source historique ne prescrit pas de séquence quotidienne supplémentaire au-delà de la prière de neuvaine elle-même.')}
function hammerChurchStage(n){return `${sourceWitness(n.churchPrayer,L('Historical “Prayer of the Church”','« Prière de l’Église » historique'))}${n.loretoCanonical?canonicalPrayer(n.loretoCanonical,1):''}`}
function hammerTailStage(n){return `<div class="aoN1Info"><h3>${esc(L('Hail Mary & invocation','Je vous salue Marie et invocation'))}</h3><p>${esc(commonNote(n))}</p></div>${commonPrayers(n)}${sourceWitness(n.ejaculation,L('Historical ejaculation','Invocation historique'))}`}
function hammerSourceDayDetails(n){
 const witness=hammerHistoricalDayWitness(n.id,N.day),historical=hammerHistoricalDayText(n.id,N.day);
 if(!witness||!historical)return "";
 const title=esc(witness.title),url=esc(witness.url);
 return `<details class="aoN1Details" data-n1-hammer-source-day="${witness.day}" data-n1-hammer-source-novena="${esc(n.id)}"><summary>${esc(L('Original meditation & practice','Méditation et pratique historiques'))}</summary><p><b>${title}</b> · ${esc(L('Day','Jour'))} ${witness.day}</p><p class="aoN1Fine">${esc(L('Historical English source (1909). An original French translation has not been certified. These longer texts are distinct from the short editorial day guide.','Source historique anglaise (1909). Aucune traduction française originale n’a été certifiée. Ces textes développés sont distincts du bref guide rédactionnel.'))}</p><h3>${esc(L('Meditation (1909)','Méditation (1909, anglais)'))}</h3><p lang="en">${nl(historical.meditation)}</p><h3>${esc(L('Practice (1909)','Pratique (1909, anglais)'))}</h3><p lang="en">${nl(historical.practice)}</p><p><a href="${url}" target="_blank" rel="noopener noreferrer">${esc(L('Original edition transcription','Transcription de l’édition originale'))} ↗</a></p></details>`;
}
function stageContent(n,d){
 const p=novenaPattern(n);
 if(N.stage===0)return `<div class="aoN1Info"><span class="aoN1Kicker">${esc(L('PREPARE','PRÉPARER'))}</span><h3>${esc(txt(d.theme))}</h3><p>${esc(txt(d.guide))}</p></div><div class="aoN1Calendar"><b>${esc(L('Before you begin','Avant de commencer'))}</b><br>${esc(L('Set the intention of the novena, become recollected, and make the Sign of the Cross. The intention is not stored.','Posez l’intention de la neuvaine, recueillez-vous et faites le signe de la Croix. L’intention n’est pas enregistrée.'))}</div>`;
 if(p==='SOURCE_REPEAT_ONLY'){
  if(N.stage===1)return sourceWitness(daySource(n,d),L('Historical prayer','Prière historique'));
  return `<div class="aoN1Info"><span class="aoN1Kicker">${esc(L('CLOSE','CONCLURE'))}</span><h3>${esc(L('Remain briefly in prayer','Demeurez brièvement en prière'))}</h3><p>${esc(txt(n.commonNote))}</p></div>${sourceDetails(n)}`;
 }
 if(p==='HAMMER_MARIAN'){
  if(N.stage===1)return sourceWitness(n.opening,L('Preparatory prayer','Prière préparatoire'));
  if(N.stage===2)return hammerChurchStage(n);
  if(N.stage===3)return sourceWitness(daySource(n,d),L('Proper prayer of the day','Prière propre du jour'))+hammerSourceDayDetails(n);
  if(N.stage===4)return hammerTailStage(n);
  if(N.stage===5)return `<div class="aoN1Info"><span class="aoN1Kicker">${esc(L('CLOSE','CONCLURE'))}</span><h3>${esc(L('Remain briefly in prayer','Demeurez brièvement en prière'))}</h3><p>${esc(L('Confide your intention to God and remain a moment in silence.','Confiez votre intention à Dieu et demeurez un instant en silence.'))}</p></div>${sourceDetails(n)}`;
 }
 if(p==='OPENING_DAY_COMMON_CLOSE'&&N.stage===1)return sourceWitness(n.opening,L('Common opening','Ouverture commune'));
 if(p==='COMMON_BEFORE_REPEAT'){
  if(N.stage===1)return `<div class="aoN1Info"><h3>${esc(L('Common prayers','Prières communes'))}</h3><p>${esc(commonNote(n))}</p></div>${commonPrayers(n)}`;
  if(N.stage===2)return sourceWitness(daySource(n,d),L('Historical prayer','Prière historique'));
  if(N.stage===3)return `<div class="aoN1Info"><span class="aoN1Kicker">${esc(L('CLOSE','CONCLURE'))}</span><h3>${esc(L('Remain briefly in prayer','Demeurez brièvement en prière'))}</h3><p>${esc(L('Entrust your intention to God before leaving this prayer.','Confiez votre intention à Dieu avant de quitter cette prière.'))}</p></div>${sourceDetails(n)}`;
 }
 const prayerStage=p==='OPENING_DAY_COMMON_CLOSE'?3:1;
 const commonStage=2;
 const sharedClosingStage=n.sharedClosingText?3:null;
 const closeStage=p==='OPENING_DAY_COMMON_CLOSE'?4:(n.sharedClosingText?4:3);
 if(N.stage===prayerStage)return sourceWitness(daySource(n,d),L('Historical prayer','Prière historique'));
 if(N.stage===commonStage)return `<div class="aoN1Info"><h3>${esc(L('Common prayers','Prières communes'))}</h3><p>${esc(commonNote(n))}</p></div>${commonPrayers(n)}`;
 if(sharedClosingStage!==null&&N.stage===sharedClosingStage)return sourceWitness(n.sharedClosingText,txt(n.sharedClosingLabel||{en:'Common closing prayer',fr:'Prière commune de conclusion'}));
 if(N.stage===closeStage){const loreto=n.closingCanonical?canonicalPrayer(n.closingCanonical,1):'';return `${loreto}<div class="aoN1Info"><span class="aoN1Kicker">${esc(L('CLOSE','CONCLURE'))}</span><h3>${esc(L('Remain briefly in prayer','Demeurez brièvement en prière'))}</h3><p>${esc(p==='OPENING_DAY_COMMON_CLOSE'?L('Moran directs the Litany of Loreto or the Tota pulchra hymn; this reader uses the Litany.','Moran prescrit les Litanies de Lorette ou l’hymne Tota pulchra ; ce lecteur utilise les Litanies.'):L('After a moment of silence, return tomorrow for the next day of the novena.','Après un instant de silence, revenez demain pour le jour suivant de la neuvaine.'))}</p></div>${sourceDetails(n)}`}
 return'';
}
function renderDay(n){const d=n.days[N.day-1]||n.days[0],p=novenaPattern(n);if(N.mode==='simple'){
 let body='';
 if(p==='HAMMER_MARIAN')body=`${sourceWitness(n.opening,L('Preparatory prayer','Prière préparatoire'))}${hammerChurchStage(n)}${sourceWitness(daySource(n,d),L('Proper prayer of the day','Prière propre du jour'))}${hammerSourceDayDetails(n)}${hammerTailStage(n)}`;
 else if(p==='COMMON_BEFORE_REPEAT')body=`${commonPrayers(n)}${sourceWitness(daySource(n,d),L('Historical prayer','Prière historique'))}`;
 else body=`${p==='OPENING_DAY_COMMON_CLOSE'?sourceWitness(n.opening,L('Common opening','Ouverture commune'))+commonPrayers(n):''}${sourceWitness(daySource(n,d),L('Historical prayer','Prière historique'))}${p==='OPENING_DAY_COMMON_CLOSE'?'':commonPrayers(n)}${n.sharedClosingText?sourceWitness(n.sharedClosingText,txt(n.sharedClosingLabel||{en:'Common closing prayer',fr:'Prière commune de conclusion'})):''}${n.closingCanonical?canonicalPrayer(n.closingCanonical,1):''}`;
 return `${head(txt(n.title),L('Day ','Jour ')+N.day)}<main class="aoP435930Body aoN1Reader" data-ao-novena-deck="simple">${modeNav()}${novenaDayFolio(n,N.day,{compact:true})}<section class="aoDevoCard" data-ao-devo-card="day-${N.day}"><header class="aoDevoCardHead"><h2 class="aoDevoCardTitle">${esc(txt(d.theme))}</h2></header><div class="aoDevoCardScroll" role="region" aria-label="${esc(txt(d.theme))}">${body}</div></section>${sourceDetails(n)}<div class="aoN1Nav"><button type="button" data-n1-day-prev ${N.day===1?'disabled':''}>← ${esc(L('Previous day','Jour précédent'))}</button><button type="button" class="primary" data-n1-day-next>${esc(N.day===9?L('Return to novena','Retour à la neuvaine'):L('Next day','Jour suivant'))} →</button></div></main>`}
 const total=stages(n);const chapter=novenaChapters(n)[N.stage];return `${head(txt(n.title),L('Day ','Jour ')+N.day)}<main class="aoP435930Body aoN1Reader" data-ao-novena-deck="guided">${modeNav()}${novenaDayFolio(n,N.day,{compact:true})}<section class="aoDevoCard" data-ao-devo-card="${esc(chapter.id)}"><header class="aoDevoCardHead"><h2 class="aoDevoCardTitle">${esc(chapter.title)}</h2></header><div class="aoDevoCardScroll" role="region" aria-label="${esc(chapter.title)}">${stageContent(n,d)}</div></section><div class="aoN1Nav"><button type="button" data-n1-stage-prev ${N.stage===0?'disabled':''}>← ${esc(L('Back','Retour'))}</button><button type="button" class="primary" data-n1-stage-next>${esc(N.stage===total-1?L('Finish this day','Terminer ce jour'):L('Continue','Continuer'))} →</button></div></main>`}
function renderInstituteThereseWeekly(){
 const d=ICKSP_THERESE_DEVOTIONS_V1, t=d.prayerFromNovena;
 const link=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
 const chosen=selectedDate(),days=(2-chosen.getDay()+7)%7,next=new Date(chosen);next.setDate(chosen.getDate()+days);
 const today=days===0;
 return `${head(L('St Thérèse · perpetual Tuesday novena','Sainte Thérèse · neuvaine perpétuelle du mardi'),L('Weekly devotion, not a nine-day sequence','Dévotion hebdomadaire, et non série de neuf jours'))}
 <main class="aoP435930Body aoN1Reader" data-n1-therese-weekly-reader="true">
 <section class="aoN1Info"><span class="aoN1Kicker">${esc(L('INSTITUTE OF CHRIST THE KING','INSTITUT DU CHRIST-ROI'))}</span>
 <h2>${esc(L('Perpetual Tuesday novena','Neuvaine perpétuelle du mardi'))}</h2>
 <p>${esc(today?L('Tuesday · the recurring day of devotion','Mardi · jour de cette dévotion'):L('Next Tuesday: ','Prochain mardi : ')+(fmt(next)))}</p>
 <p>${esc(L('The Institute’s complete Tuesday prayer includes intentions for its Little Flower Recurring Gift Society. Those named intentions remain intact at the official source. No payment, membership, or fixed American meeting time is required to participate personally.','La prière complète de l’Institut comprend les intentions de sa Little Flower Recurring Gift Society. Elles sont conservées intégralement dans sa source. Aucune cotisation, adhésion ou heure américaine particulière ne conditionne une participation personnelle.'))}</p>
 <p>${link(d.perennialInstituteNovena.source_url,L('Read the complete Institute Tuesday novena','Lire la neuvaine complète du mardi de l’Institut'))}</p>
 </section>
 <section class="aoDevoCard" data-ao-devo-card="therese-historical-1925"><header class="aoDevoCardHead"><h2 class="aoDevoCardTitle">${esc(L('Distinct historical prayer to St Thérèse · 1925','Prière historique distincte à sainte Thérèse · 1925'))}</h2></header>
 <div class="aoDevoCardScroll"><p>${esc(L('Historical English witness; no verified historical French translation is substituted. This is not the Institute’s identical Tuesday prayer.','Texte historique anglais ; aucune traduction française historique non vérifiée ne lui est substituée. Ce n’est pas le texte identique de la neuvaine du mardi de l’Institut.'))}</p>
 <div class="aoN1PrayerParagraph" lang="en">${novenaParagraphs(t.en)}</div>
 <p>${esc(L('The 1925 booklet then directs readers to pray the Hail, Holy Queen, retained as a separate canonical prayer.','Le livret de 1925 prescrit ensuite le Salve Regina, conservé comme prière canonique séparée.'))}</p>
 ${canonicalPrayer('marian_hail_holy_queen')}</div></section>
 <details class="aoN1Details"><summary>${esc(L('Missionaries and historical editions','Missionnaires et éditions historiques'))}</summary>
 <p>${esc(L('The Institute’s particular prayer for missionaries and the historical Raccolta no. 573 are distinct attested forms. The Institute wording is preserved at its original source.','La prière propre de l’Institut pour les missionnaires et le Raccolta historique n° 573 sont deux formes distinctes. La rédaction de l’Institut est conservée à sa source.'))}</p>
 <p>${link(d.missionaryIntercession.source_url,L('Institute prayer for missionaries','Prière de l’Institut pour les missionnaires'))}</p>
 <p>${link(t.source_url,L('1925 historical printed prayer · pp. 38–39','Prière historique imprimée en 1925 · p. 38–39'))}</p>
 <p>${esc(isFr()?t.sourceNote.fr:t.sourceNote.en)}</p>
 <p>${esc(L('The existing Twenty-Four Glory Bes nine-day novena remains a separate form.','La neuvaine des vingt-quatre Gloria Patri déjà présente demeure une forme distincte.'))}</p>
 </details>
 <button type="button" class="aoP435930Secondary" data-n1-therese-back>${esc(L('Back to all novenas','Retour aux neuvaines'))}</button></main>`;
}
function render(){const m=mount();if(!m)return;const n=N.id?ALL_NOVENAS[N.id]:null;let h=N.screen==='overview'?renderOverview():N.screen==='weekly'?renderInstituteThereseWeekly():N.screen==='detail'&&n?renderDetail(n):N.screen==='day'&&n?renderDay(n):renderOverview();m.dataset.aoPrayView='novenas';m.dataset.aoN1='true';m.classList.toggle('aoP435930FocusRunway',N.screen==='day'&&N.mode==='guided');m.innerHTML=h;m.scrollTop=0;queueMicrotask(()=>{
  if(N.screen==='day'&&n&&m.querySelector('.aoN1Reader')){
   const guided=N.mode==='guided';
   const chapters=guided?novenaChapters(n):
    [{id:'day-'+N.day,title:L('Day ','Jour ')+N.day+' · '+txt((n.days[N.day-1]||n.days[0]).theme)}];
   installSequentialDevotionalReader({mount:m,kind:'novena',chapters,activeIndex:guided?N.stage:0,
    paragraphSelector:'.aoN1PrayerParagraph,.aoN1Canon,.aoN1Info > p,.aoN1Calendar',
    timelineLabel:L('Prayer stages','Étapes de la prière'),
    onNavigate:idx=>{if(!guided)return;N.stage=idx;render()}
   });
  }
  m.querySelector('button,[href],summary,[tabindex]:not([tabindex="-1"])')?.focus?.();
 })}
function open(opts={}){
 OPEN_RECEIPT=captureObservedModuleOrigin(window,"pray");
 OPEN_OPTS={...opts};N.stage=0;N.showEnglish=false;
 detailFromOverview=false;
 const requested=String(opts?.novenaId||'');
 if(requested&&ALL_NOVENAS[requested]){
  N.id=requested;N.screen='detail';
  const status=calStatus(ALL_NOVENAS[requested]);
  N.day=status.kind==='active'?status.day:1;
 }else{
  N.screen='overview';N.id=null;N.day=1;
 }
 BASE_OPEN('pray.hub',opts);render();return true
}
function returnToScripture(){
 const restore=OPEN_OPTS?.onCloseReturn;
 if(typeof restore!=="function")return false;
 OPEN_OPTS={};OPEN_RECEIPT=null;
 BASE_CLOSE({silent:true});
 Promise.resolve().then(restore).catch(error=>console.error("Novena Scripture return failed",error));
 return true;
}
function back(){
 if(N.screen==='weekly'){N.screen='overview';N.id=null;return render()}
 if(N.screen==='day'){N.screen='detail';N.stage=0;N.showEnglish=false;return render()}
 // A direct Calendar/Today deep link has not visited the Novena overview.
 if(N.screen==='detail'&&detailFromOverview){
  N.screen='overview';N.id=null;detailFromOverview=false;return render()
 }
 if(returnToScripture())return true;
 return returnToObservedModuleOrigin(window,OPEN_RECEIPT,{
  close:()=>BASE_CLOSE(),
  restoreParent:()=>{
   BASE_OPEN('pray.hub',OPEN_OPTS);
   if(OPEN_OPTS.returnFamily)window.AO_PRAY_V435930?.openFamily?.(OPEN_OPTS.returnFamily);
   return true;
  }
 });
}
function goHome(){if(returnToScripture())return true;BASE_CLOSE();const p=window.AO_APP_SHELL_V1?.navigate?.('home');if(p&&typeof p.catch==='function')p.catch(()=>window.AO_NAV_V362?.openHome?.());else if(!p)window.AO_NAV_V362?.openHome?.();return true}
function onClick(e){const b=e.target.closest?.('button,[data-n1-flip]');if(!b)return;if(!b.matches('[data-n1-open],[data-n1-back],[data-n1-home],[data-n1-icksp-therese],[data-n1-therese-weekly],[data-n1-therese-back],[data-n1-supplement],[data-n1-select],[data-n1-day],[data-n1-begin],[data-n1-mode],[data-n1-show-en],[data-n1-flip],[data-n1-stage-prev],[data-n1-stage-next],[data-n1-day-prev],[data-n1-day-next],[data-n1-explore]'))return;e.preventDefault();e.stopImmediatePropagation();if(b.matches('[data-n1-open]'))return open({trigger:b});if(b.matches('[data-n1-icksp-therese],[data-n1-therese-weekly]')){N.screen='weekly';return render()};if(b.matches('[data-n1-therese-back]')){N.screen='overview';N.id=null;return render()}if(b.matches('[data-n1-home]'))return goHome();if(b.matches('[data-n1-back]'))return back();if(b.matches('[data-n1-explore]')){const id=b.dataset.n1Explore||N.id,n=ALL_NOVENAS[id],query=txt(n?.title)||id;void Promise.resolve(window.AO_APP_SHELL_V1?.navigate?.('find')).then(result=>result?.ok===true?window.AO_FIND_APP_V1?.open?.({lens:'traditions',view:'list',query}):false).catch(error=>console.error('Novena Explore navigation failed',error));return}if(b.dataset.n1Supplement){
  const id=b.dataset.n1Supplement;if(!ADDITIONAL_NOVENAS[id])return;
  detailFromOverview=N.screen==='overview';N.id=id;N.screen='detail';
  const state=calStatus(ALL_NOVENAS[id]);N.day=state.kind==='active'?state.day:1;
  N.stage=0;N.showEnglish=false;return render()
 }
 if(b.dataset.n1Select){detailFromOverview=N.screen==='overview';N.id=b.dataset.n1Select;N.screen='detail';N.day=calStatus(ALL_NOVENAS[N.id]).kind==='active'?calStatus(ALL_NOVENAS[N.id]).day:1;N.stage=0;N.showEnglish=false;return render()}if(b.dataset.n1Day){N.day=+b.dataset.n1Day;N.screen='day';N.stage=0;N.showEnglish=false;return render()}if(b.dataset.n1Begin){N.day=+b.dataset.n1Begin;N.screen='day';N.stage=0;N.showEnglish=false;return render()}if(b.dataset.n1Mode){N.mode=b.dataset.n1Mode==='simple'?'simple':'guided';try{localStorage.setItem(STORE_MODE,N.mode)}catch{}N.stage=0;return render()}if(b.matches('[data-n1-show-en]')){N.showEnglish=!N.showEnglish;return render()}if(b.matches('[data-n1-flip]')){const v=b.querySelector('[data-face-v]'),a=b.querySelector('[data-face-la]');if(v&&a){const showA=a.hidden;a.hidden=!showA;v.hidden=showA}return}if(b.matches('[data-n1-stage-prev]')){N.stage=Math.max(0,N.stage-1);return render()}if(b.matches('[data-n1-stage-next]')){const n=ALL_NOVENAS[N.id],last=stages(n)-1;if(N.stage>=last){N.screen='detail';N.stage=0;N.showEnglish=false}else N.stage++;return render()}if(b.matches('[data-n1-day-prev]')){N.day=Math.max(1,N.day-1);N.showEnglish=false;return render()}if(b.matches('[data-n1-day-next]')){if(N.day>=9){N.screen='detail';N.stage=0}else{N.day++;N.showEnglish=false}return render()}}
document.addEventListener('click',onClick,true);
const oldOpen=PR.open.bind(PR);PR.open=function(id,opts={}){if(id==='pray.novenas'||id==='novenas'||id==='novena')return open(opts);return oldOpen(id,opts)};
const MOD=window.AO_MODULES;
if(MOD&&!MOD.__aoNovenasV3){
 const def=Object.freeze({id:'pray.novenas',type:'module',domain:'pray',category:'traditional-devotion',title:'Novenas',action:'novena.n1',contexts:Object.freeze(['pray','today-when-relevant'])});
 const definitions=Object.freeze({...MOD.definitions,'pray.novenas':def});
 const aliases=Object.freeze({...MOD.aliases,novenas:'pray.novenas',novena:'pray.novenas'});
 const wrapper={...MOD,definitions,aliases,__aoNovenasV3:true,
  get(id){return ['pray.novenas','novenas','novena'].includes(String(id))?def:MOD.get?.(id)},
  resolve(id){return ['pray.novenas','novenas','novena'].includes(String(id))?{ok:true,input:String(id),id:'pray.novenas',defaults:{},chain:id==='pray.novenas'?[]:[String(id)],definition:def}:MOD.resolve?.(id)},
  async open(id,opts={}){if(['pray.novenas','novenas','novena'].includes(String(id)))return{ok:open(opts),input:String(id),canonicalId:'pray.novenas',type:'module',domain:'pray',options:opts,aliasChain:id==='pray.novenas'?[]:[String(id)],error:null};return MOD.open?.(id,opts)},
  list(filter={}){const xs=[...(MOD.list?.(filter)||[])].filter(x=>x?.id!=='pray.novenas');if((!filter?.type||filter.type==='module')&&(!filter?.domain||String(filter.domain).toLowerCase()==='pray'))xs.push(def);return xs}
 };
 window.AO_MODULES=wrapper;window.AO_MODULE_REGISTRY_V36=wrapper;
}
const qa=()=>({version:VERSION,corpusCount:Object.keys(CORPUS).length,allNineDays:Object.values(CORPUS).every(n=>n.days.length===9),forms:[...new Set(Object.values(CORPUS).map(n=>n.form))],patterns:[...new Set(Object.values(CORPUS).map(n=>novenaPattern(n)))],noCompletionTracking:true,noIntentStorage:true,supplementalCount:Object.keys(ADDITIONAL_NOVENAS).length,frenchHistoricalPrayerPolicy:'FAIL_CLOSED_EXPLICIT_EN_WITNESS_OPTION',calendarHooks:Object.fromEntries(Object.values(CORPUS).map(n=>[n.id,n.calendar.precision])),canonicalReuse:{ourFather:true,hailMary:true,gloryBe:true,loreto1962:true},pass:Object.keys(CORPUS).length===16&&Object.values(CORPUS).every(n=>n.days.length===9)});
const NOVENA_API=Object.freeze({version:VERSION,open,close:BASE_CLOSE,state:()=>({...N}),corpus:CORPUS,supplemental:ADDITIONAL_NOVENAS,calendarStatus:id=>ALL_NOVENAS[id]?calStatus(ALL_NOVENAS[id]):null,qa});
window.AO_NOVENAS_V3=NOVENA_API;
window.AO_NOVENAS_V2=NOVENA_API;
window.AO_NOVENAS_V1=NOVENA_API;
window.AO_NOVENA_CORPUS_V3=CORPUS;
window.AO_NOVENA_CORPUS_V2=CORPUS;
window.AO_NOVENA_CORPUS_V1=CORPUS;
 return window.AO_NOVENAS_V3||false;
}

export function installNovenaRuntime({pollMs=40,maxPolls=150}={}){
 if(typeof window==="undefined"||typeof document==="undefined")return false;
 if(window.AO_NOVENAS_V3)return window.AO_NOVENAS_V3;
 let attempt=0;
 const tryInstall=()=>{
  const installed=mountNovenaRuntime();
  if(installed)return installed;
  if(attempt++<maxPolls)setTimeout(tryInstall,pollMs);
  return false;
 };
 return tryInstall();
}

if(typeof window!=="undefined"&&typeof document!=="undefined")installNovenaRuntime();

export { CORPUS as NOVENA_CORPUS_V3 };
