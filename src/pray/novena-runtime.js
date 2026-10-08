import { NOVENA_CORPUS_V4 as CORPUS, NOVENA_START_KIND } from "./novena-corpus-v4.js";
import { NOVENA_CONTEXT_V1, novenaContext } from "./novena-context-v1.js";
import { installNovenaStyles } from "./novena-styles.js";
import { novenaStatusFor } from "../calendar/intelligence.js";
import { formatDisplayDate } from "../app/date-format.js";
import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { clearReturnStack, hasReturnPoint, returnToPrevious } from "../app/return-stack.js";

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
let OPEN_OPTS={};
let N={screen:'overview',id:null,day:1,mode:(()=>{try{return localStorage.getItem(STORE_MODE)==='simple'?'simple':'guided'}catch{return'guided'}})(),stage:0,showEnglish:false};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n1UiIcon=id=>{
 const url=resolveCanonicalAssetUrl(id);
 if(url)return `<span class="aoP435930UiIcon" data-ao-asset-id="${esc(id)}" aria-hidden="true" style="display:inline-block;width:18px;height:18px;background:currentColor;-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`;
 return "";
};
const nl=v=>esc(v).replace(/\n/g,'<br>');
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
function calStatus(n){const now=selectedDate(),key=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'),c=novenaStatusFor(n,key,{fr:isFr()});const w={start:new Date(c.window.start+'T12:00:00'),end:new Date(c.window.end+'T12:00:00'),feast:new Date(c.window.feast+'T12:00:00')};return{kind:c.kind,day:c.day,label:c.label,w}}
function head(title,sub=''){return `<header class="aoP435930Head"><button type="button" class="aoP435930Back" data-n1-back aria-label="${esc(L('Back','Retour'))}">${n1UiIcon('ao-ui-back')}</button><div><small>${esc(L('PRAY · NOVENAS','PRIER · NEUVAINES'))}</small><h1 id="aoP435930Title">${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div><button type="button" class="aoP435930Home" data-n1-home aria-label="${esc(L('Home','Accueil'))}">${n1UiIcon('ao-nav-home')}</button></header>`}
function modeNav(){return `<div class="aoP435930Seg" role="group" aria-label="${esc(L('Depth','Profondeur'))}"><button type="button" class="${N.mode==='simple'?'active':''}" aria-pressed="${N.mode==='simple'}" data-n1-mode="simple">${esc(L('Simple','Simple'))}</button><button type="button" class="${N.mode==='guided'?'active':''}" aria-pressed="${N.mode==='guided'}" data-n1-mode="guided">${esc(L('Guided','Guidé'))}</button></div>`}
function sourceDetails(n){const s=n.source,links=(n.historySources||[]).map(x=>`<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)} ↗</a></li>`).join('');return `<details class="aoN1Details"><summary>${esc(L('Sources & edition','Sources et édition'))}</summary><p><b>${esc(s.work)}</b><br>${esc(s.authors)}<br>${esc(s.edition)}<br>${esc(s.approval)}</p><p>${esc(s.adaptation)}</p><ul>${links}</ul><p class="aoN1Fine">${esc(L('The underlying historical witnesses remain auditable. French prayer bodies are either traditional French witnesses or clearly labelled editorial translations aligned to the source text.','Les témoins historiques demeurent vérifiables. Les textes français sont soit des témoins français traditionnels, soit des traductions éditoriales explicitement signalées et alignées sur le texte source.'))}</p></details>`}
function contextSource(id){return (NOVENA_CONTEXT_V1.sourceRegistry||[]).find(x=>x.id===id)||null}
function contextDetails(n){
 const x=novenaContext(n.id);if(!x)return'';
 const practice=`<details class="aoN1Details"><summary>${esc(L('Practice & gestures','Pratique et gestes'))}</summary><p>${esc(isFr()?x.practice.fr:x.practice.en)}</p><p class="aoN1Fine">${esc(L('Unless the historical source explicitly says otherwise, Ad Orientem does not impose a universal kneeling, standing, candle, image or other material requirement.','Sauf indication explicite de la source historique, Ad Orientem n’impose aucune exigence universelle d’agenouillement, de station, de bougie, d’image ou d’autre objet matériel.'))}</p></details>`;
 const current=x.indulgence.current_public_novena,src=contextSource(current.source_id);
 const related=(x.indulgence.related_current_works||[]).map(item=>{const s=contextSource(item.source_id);return `<li><b>${esc(item.classification.replaceAll('_',' '))}</b><br>${esc(isFr()?item.fr:item.en)}${s?`<br><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`:''}</li>`}).join('');
 const indulgence=`<details class="aoN1Details"><summary>${esc(L('Indulgences','Indulgences'))}</summary><p><b>${esc(L('Current public-novena grant','Concession actuelle pour la neuvaine publique'))}</b><br>${esc(isFr()?current.fr:current.en)}</p>${src?`<p><a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.title)} ↗</a></p>`:''}${related?`<p><b>${esc(L('Related currently indulgenced works','Œuvres associées actuellement indulgenciées'))}</b></p><ul>${related}</ul>`:''}<p><b>${esc(L('Historical indulgence context','Contexte historique des indulgences'))}</b><br>${esc(isFr()?x.indulgence.historical.fr:x.indulgence.historical.en)}</p><p class="aoN1Fine">${esc(L('Plenary indulgences require the conditions and dispositions specified by current Church law. Historical grants are not carried forward automatically.','Les indulgences plénières exigent les conditions et dispositions prévues par le droit actuel de l’Église. Les anciennes concessions ne sont pas automatiquement reconduites.'))}</p></details>`;
 const crossLinks=(x.crossDomain.links||[]).length;
 const cross=`<details class="aoN1Details"><summary>${esc(L('Customs & places','Coutumes et lieux'))}</summary><p>${esc(isFr()?x.crossDomain.display.fr:x.crossDomain.display.en)}</p>${crossLinks?`<button type="button" class="aoP435930Secondary" data-n1-explore="${esc(n.id)}">${esc(L('Explore related customs & places','Explorer les coutumes et lieux associés'))}</button>`:''}<p class="aoN1Fine">${esc(L('Geographical association is evidence-backed only; proximity to a shrine, community or TLM venue never creates a custom link by itself.','Toute association géographique doit être étayée par des preuves ; la proximité d’un sanctuaire, d’une communauté ou d’un lieu de messe traditionnelle ne crée jamais à elle seule un lien coutumier.'))}</p></details>`;
 return practice+indulgence+cross;
}
function about(n){return `<div class="aoN1Info"><h3>${esc(L('What this novena is','Ce qu’est cette neuvaine'))}</h3><p>${esc(txt(n.meaning))}</p></div><details class="aoN1Details" open><summary>${esc(L('History','Histoire'))}</summary><p>${esc(txt(n.history))}</p></details><details class="aoN1Details"><summary>${esc(L('How to pray it','Comment la prier'))}</summary><p>${esc(txt(n.how))}</p></details>${contextDetails(n)}${sourceDetails(n)}`}
function icon(){return `<span class="aoN1HeroIcon" aria-hidden="true"><svg viewBox="0 0 128 128"><use href="#ao-rich-novenas"></use></svg></span>`}
function renderOverview(){const items=Object.values(CORPUS),statuses=items.map(n=>[n,calStatus(n)]),next=statuses.filter(x=>x[1].kind==='active'||x[1].kind==='upcoming').sort((a,b)=>a[1].w.start-b[1].w.start)[0];return `${head(L('Novenas','Neuvaines'),L('Traditional novenas · guided prayer','Neuvaines traditionnelles · prière guidée'))}<main class="aoP435930Body"><section class="aoN1Hero">${icon()}<small>${items.length} ${esc(L('bilingual sourced novenas','neuvaines bilingues sourcées'))}</small><h2>${esc(L('Guided novenas, with each historical form kept visible','Neuvaines guidées, en conservant la forme historique de chacune'))}</h2><p>${esc(L('Each novena preserves its historical form, explains where it comes from, and can be prayed in Guided or Simple mode. No streaks, completion scores or devotional history are stored.','Chaque neuvaine conserve sa forme historique, explique son origine et peut être priée en mode Guidé ou Simple. Aucun streak, score d’accomplissement ni historique dévotionnel n’est enregistré.'))}</p></section>${next?`<div class="aoN1Calendar"><b>${esc(next[1].kind==='active'?L('In season now','En cours dans le calendrier'):L('Coming up','À venir'))}</b><br>${esc(txt(next[0].title))} · ${esc(next[1].label)}</div>`:''}<section><span class="aoN1Kicker">${esc(L('TRADITIONAL NOVENAS','NEUVAINES TRADITIONNELLES'))}</span><div class="aoN1Grid">${statuses.map(([n,c])=>`<button type="button" class="aoN1Card ${c.kind==='active'?'active':''}" data-n1-select="${esc(n.id)}"><small>${esc(txt(n.family))}</small><b>${esc(txt(n.title))}</b><span>${esc(c.label)}</span><em>${esc(n.form==='REPEAT_FORM'?L('one historical form · 9 days','une forme historique · 9 jours'):L('9 day-specific prayers','9 prières propres'))}</em></button>`).join('')}</div></section></main>`}
function renderDetail(n){const c=calStatus(n),suggest=(c.kind==='active'||c.kind==='upcoming')?c.day:1;return `${head(txt(n.title),txt(n.family))}<main class="aoP435930Body"><section class="aoN1Hero"><small>${esc(n.form==='REPEAT_FORM'?L('REPEATED HISTORICAL FORM','FORME HISTORIQUE RÉPÉTÉE'):L('DAY-SPECIFIC HISTORICAL FORM','FORME HISTORIQUE JOUR PAR JOUR'))}</small><h2>${esc(txt(n.feast))}</h2><p>${esc(txt(n.how))}</p></section>${modeNav()}<div class="aoN1Calendar"><b>${esc(L('Liturgical relationship','Relation liturgique'))}</b><br>${esc(c.label)}<br><span class="aoN1Fine"><b>${esc(startKindLabel(n))}</b> · ${esc(txt(n.traditionalStart))}${n.calendar.precision.includes('PENDING')?' · '+L('transfer-aware 1962 binding still pending','liaison 1962 tenant compte des transferts encore à finaliser'):''}</span></div><section><span class="aoN1Kicker">${esc(L('CHOOSE THE DAY','CHOISIR LE JOUR'))}</span><div class="aoN1DayGrid">${n.days.map((d,i)=>`<button type="button" class="${i+1===suggest?'active':''}" data-n1-day="${i+1}">${i+1}</button>`).join('')}</div></section><button type="button" class="aoP435930Primary" data-n1-begin="${suggest}">${esc(c.kind==='active'?L(`Pray today · Day ${suggest}`,`Prier aujourd’hui · Jour ${suggest}`):c.kind==='upcoming'?L(`Next · Day ${suggest}`,`Prochain · Jour ${suggest}`):L('Begin Day 1','Commencer le jour 1'))}</button>${about(n)}</main>`}
function sourceWitness(text,label){
 if(!text)return'';
 const bilingual=typeof text==='object'&&text!==null;
 const en=bilingual?String(text.en||''):String(text||'');
 const fr=bilingual?String(text.fr||''):'';
 const n=N.id?CORPUS[N.id]:null;
 if(isFr()&&!N.showEnglish&&!fr)return `<div class="aoN1FailClosed"><b>${esc('Le texte français de cette prière n’est pas disponible.')}</b><br>${esc('Ad Orientem refuse d’inventer silencieusement un texte de prière.')}<br><button type="button" class="aoP435930Secondary" data-n1-show-en>${esc('Afficher le témoin anglais')}</button></div>`;
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
 return `<article class="aoN1SourceText"><small>${esc(witnessLabel)}</small><p>${nl(value)}</p>${toggle}</article>`;
}
function canonicalPrayer(id,count=1){const p=prayerData()[id];if(!p)return `<div class="aoN1FailClosed">${esc(L('Canonical prayer record unavailable in this build.','Prière canonique indisponible dans cette version.'))}</div>`;const v=(isFr()?p.fr:p.en)||'',la=p.la||'',title=isFr()?(p.titleFr||p.title):p.title;return `<article class="aoN1Canon"><div class="aoN1CanonHead"><b>${esc(title||id)}</b><span>${count>1?count+'×':''}</span></div>${la&&v?`<button type="button" data-n1-flip><span data-face-v>${nl(v)}</span><span data-face-la hidden>${nl(la)}</span></button>`:`<div>${nl(v||la)}</div>`}</article>`}
function commonPrayers(n){return (n.commonPrayers||[]).map(x=>canonicalPrayer(x[0],x[1])).join('')}
function daySource(n,d){return n.form==='REPEAT_FORM'?n.repeatText:d.text}
function novenaPattern(n){return n.pattern||(n.id==='immaculate_conception'?'OPENING_DAY_COMMON_CLOSE':'STANDARD')}
function stages(n){const p=novenaPattern(n);return p==='HAMMER_MARIAN'?6:p==='OPENING_DAY_COMMON_CLOSE'?5:p==='COMMON_BEFORE_REPEAT'?4:(n.sharedClosingText?5:4)}
function stageRail(n){const total=stages(n);return `<div class="aoN1StageRail" aria-label="${esc(L('Guided stages','Étapes guidées'))}">${Array.from({length:total},(_,i)=>`<span class="${i<N.stage?'done':i===N.stage?'current':''}"></span>`).join('')}</div>`}
function commonNote(n){if(n.commonNote)return txt(n.commonNote);return n.id==='st_joseph'?L('Moran directs three Our Fathers and three Hail Marys each day.','Moran prescrit trois Notre Père et trois Je vous salue Marie chaque jour.'):n.id==='holy_ghost'||n.id==='christmas'?L('The source directs one Our Father, one Hail Mary and one Glory Be after the daily prayer.','La source prescrit un Notre Père, un Je vous salue Marie et un Gloire au Père après la prière du jour.'):n.id==='immaculate_conception'?L('Moran directs nine Hail Marys and one Glory Be before the day prayer; they are kept here as a distinct guided stage.','Moran prescrit neuf Je vous salue Marie et un Gloire au Père avant la prière du jour ; ils sont conservés ici comme étape guidée distincte.'):L('The historical source does not prescribe an additional daily prayer sequence beyond the novena prayer itself.','La source historique ne prescrit pas de séquence quotidienne supplémentaire au-delà de la prière de neuvaine elle-même.')}
function hammerChurchStage(n){return `${sourceWitness(n.churchPrayer,L('Historical “Prayer of the Church”','« Prière de l’Église » historique'))}${n.loretoCanonical?canonicalPrayer(n.loretoCanonical,1):''}`}
function hammerTailStage(n){return `<div class="aoN1Info"><h3>${esc(L('Hail Mary & invocation','Je vous salue Marie et invocation'))}</h3><p>${esc(commonNote(n))}</p></div>${commonPrayers(n)}${sourceWitness(n.ejaculation,L('Historical ejaculation','Invocation historique'))}`}
function stageContent(n,d){
 const p=novenaPattern(n);
 if(N.stage===0)return `<div class="aoN1Info"><span class="aoN1Kicker">${esc(L('PREPARE','PRÉPARER'))}</span><h3>${esc(txt(d.theme))}</h3><p>${esc(txt(d.guide))}</p></div><div class="aoN1Calendar"><b>${esc(L('Before you begin','Avant de commencer'))}</b><br>${esc(L('Set the intention of the novena, become recollected, and make the Sign of the Cross. The intention is not stored.','Posez l’intention de la neuvaine, recueillez-vous et faites le signe de la Croix. L’intention n’est pas enregistrée.'))}</div>`;
 if(p==='HAMMER_MARIAN'){
  if(N.stage===1)return sourceWitness(n.opening,L('Preparatory prayer','Prière préparatoire'));
  if(N.stage===2)return hammerChurchStage(n);
  if(N.stage===3)return sourceWitness(daySource(n,d),L('Proper prayer of the day','Prière propre du jour'));
  if(N.stage===4)return hammerTailStage(n);
  if(N.stage===5)return `<div class="aoN1Info"><span class="aoN1Kicker">${esc(L('CLOSE','CONCLURE'))}</span><h3>${esc(L('Remain briefly in prayer','Demeurez brièvement en prière'))}</h3><p>${esc(L('The historical sequence is complete. Ad Orientem does not mark the day completed or maintain a devotional streak.','La séquence historique est terminée. Ad Orientem ne marque pas le jour comme accompli et ne maintient aucun streak dévotionnel.'))}</p></div>${sourceDetails(n)}`;
 }
 if(p==='OPENING_DAY_COMMON_CLOSE'&&N.stage===1)return sourceWitness(n.opening,L('Common opening','Ouverture commune'));
 if(p==='COMMON_BEFORE_REPEAT'){
  if(N.stage===1)return `<div class="aoN1Info"><h3>${esc(L('Common prayers','Prières communes'))}</h3><p>${esc(commonNote(n))}</p></div>${commonPrayers(n)}`;
  if(N.stage===2)return sourceWitness(daySource(n,d),L('Historical prayer','Prière historique'));
  if(N.stage===3)return `<div class="aoN1Info"><span class="aoN1Kicker">${esc(L('CLOSE','CONCLURE'))}</span><h3>${esc(L('Remain briefly in prayer','Demeurez brièvement en prière'))}</h3><p>${esc(L('The source sequence is complete. Ad Orientem stores no completion score or devotional streak.','La séquence de la source est terminée. Ad Orientem n’enregistre ni score d’achèvement ni streak dévotionnel.'))}</p></div>${sourceDetails(n)}`;
 }
 const prayerStage=p==='OPENING_DAY_COMMON_CLOSE'?2:1;
 const commonStage=p==='OPENING_DAY_COMMON_CLOSE'?3:2;
 const sharedClosingStage=n.sharedClosingText?3:null;
 const closeStage=p==='OPENING_DAY_COMMON_CLOSE'?4:(n.sharedClosingText?4:3);
 if(N.stage===prayerStage)return sourceWitness(daySource(n,d),L('Historical prayer','Prière historique'));
 if(N.stage===commonStage)return `<div class="aoN1Info"><h3>${esc(L('Common prayers','Prières communes'))}</h3><p>${esc(commonNote(n))}</p></div>${commonPrayers(n)}`;
 if(sharedClosingStage!==null&&N.stage===sharedClosingStage)return sourceWitness(n.sharedClosingText,txt(n.sharedClosingLabel||{en:'Common closing prayer',fr:'Prière commune de conclusion'}));
 if(N.stage===closeStage){const loreto=n.closingCanonical?canonicalPrayer(n.closingCanonical,1):'';return `${loreto}<div class="aoN1Info"><span class="aoN1Kicker">${esc(L('CLOSE','CONCLURE'))}</span><h3>${esc(L('Remain briefly in prayer','Demeurez brièvement en prière'))}</h3><p>${esc(p==='OPENING_DAY_COMMON_CLOSE'?L('Moran permits the Litany of Loreto or Tota pulchra. Ad Orientem reuses the canonical 1962 Loreto record rather than duplicating the text.','Moran permet les Litanies de Lorette ou Tota pulchra. Ad Orientem réutilise l’enregistrement canonique 1962 des Litanies de Lorette au lieu de dupliquer le texte.'):L('The day ends here. Ad Orientem does not mark it “completed”; return tomorrow or select another day when appropriate.','Le jour se termine ici. Ad Orientem ne le marque pas « accompli » ; revenez demain ou choisissez un autre jour lorsque cela convient.'))}</p></div>${sourceDetails(n)}`}
 return'';
}
function renderDay(n){const d=n.days[N.day-1]||n.days[0],p=novenaPattern(n);if(N.mode==='simple'){
 let body='';
 if(p==='HAMMER_MARIAN')body=`${sourceWitness(n.opening,L('Preparatory prayer','Prière préparatoire'))}${hammerChurchStage(n)}${sourceWitness(daySource(n,d),L('Proper prayer of the day','Prière propre du jour'))}${hammerTailStage(n)}`;
 else if(p==='COMMON_BEFORE_REPEAT')body=`${commonPrayers(n)}${sourceWitness(daySource(n,d),L('Historical prayer','Prière historique'))}`;
 else body=`${p==='OPENING_DAY_COMMON_CLOSE'?sourceWitness(n.opening,L('Common opening','Ouverture commune')):''}${sourceWitness(daySource(n,d),L('Historical prayer','Prière historique'))}${commonPrayers(n)}${n.sharedClosingText?sourceWitness(n.sharedClosingText,txt(n.sharedClosingLabel||{en:'Common closing prayer',fr:'Prière commune de conclusion'})):''}${n.closingCanonical?canonicalPrayer(n.closingCanonical,1):''}`;
 return `${head(`${L('Day','Jour')} ${N.day} · ${txt(d.theme)}`,txt(n.title))}<main class="aoP435930Body">${modeNav()}${body}${sourceDetails(n)}<div class="aoN1Nav"><button type="button" data-n1-day-prev ${N.day===1?'disabled':''}>← ${esc(L('Previous day','Jour précédent'))}</button><button type="button" class="primary" data-n1-day-next>${esc(N.day===9?L('Return to novena','Retour à la neuvaine'):L('Next day','Jour suivant'))} →</button></div></main>`}
 const total=stages(n);return `${head(`${L('Day','Jour')} ${N.day} · ${txt(d.theme)}`,txt(n.title))}<main class="aoP435930Body">${modeNav()}${stageRail(n)}${stageContent(n,d)}<div class="aoN1Nav"><button type="button" data-n1-stage-prev ${N.stage===0?'disabled':''}>← ${esc(L('Back','Retour'))}</button><button type="button" class="primary" data-n1-stage-next>${esc(N.stage===total-1?L('Finish this day','Terminer ce jour'):L('Continue','Continuer'))} →</button></div></main>`}
function render(){const m=mount();if(!m)return;const n=N.id?CORPUS[N.id]:null;let h=N.screen==='overview'?renderOverview():N.screen==='detail'&&n?renderDetail(n):N.screen==='day'&&n?renderDay(n):renderOverview();m.dataset.aoPrayView='novenas';m.dataset.aoN1='true';m.classList.toggle('aoP435930FocusRunway',N.screen==='day'&&N.mode==='guided');m.innerHTML=h;m.scrollTop=0;queueMicrotask(()=>m.querySelector('button,[href],summary,[tabindex]:not([tabindex="-1"])')?.focus?.())}
function open(opts={}){
 OPEN_OPTS={...opts};N.stage=0;N.showEnglish=false;
 const requested=String(opts?.novenaId||'');
 if(requested&&CORPUS[requested]){
  N.id=requested;N.screen='detail';
  const status=calStatus(CORPUS[requested]);
  N.day=status.kind==='active'?status.day:1;
 }else{
  N.screen='overview';N.id=null;N.day=1;
 }
 BASE_OPEN('pray.hub',opts);render();return true
}
function back(){if(N.screen==='day'){N.screen='detail';N.stage=0;N.showEnglish=false;return render()}if(N.screen==='detail'){N.screen='overview';N.id=null;return render()}if(hasReturnPoint()){BASE_CLOSE();void returnToPrevious();return true}BASE_OPEN('pray.hub',OPEN_OPTS);if(OPEN_OPTS.returnFamily)window.AO_PRAY_V435930?.openFamily?.(OPEN_OPTS.returnFamily);return true}
function goHome(){clearReturnStack();BASE_CLOSE();const p=window.AO_APP_SHELL_V1?.navigate?.('home');if(p&&typeof p.catch==='function')p.catch(()=>window.AO_NAV_V362?.openHome?.());else if(!p)window.AO_NAV_V362?.openHome?.();return true}
function onClick(e){const b=e.target.closest?.('button,[data-n1-flip]');if(!b)return;if(!b.matches('[data-n1-open],[data-n1-back],[data-n1-home],[data-n1-select],[data-n1-day],[data-n1-begin],[data-n1-mode],[data-n1-show-en],[data-n1-flip],[data-n1-stage-prev],[data-n1-stage-next],[data-n1-day-prev],[data-n1-day-next],[data-n1-explore]'))return;e.preventDefault();e.stopImmediatePropagation();if(b.matches('[data-n1-open]'))return open({trigger:b});if(b.matches('[data-n1-home]'))return goHome();if(b.matches('[data-n1-back]'))return back();if(b.matches('[data-n1-explore]')){const id=b.dataset.n1Explore||N.id,n=CORPUS[id];BASE_CLOSE();try{window.AO_FIND_APP_V1?.open?.({lens:'traditions',query:txt(n?.title)||id})}catch{}return}if(b.dataset.n1Select){N.id=b.dataset.n1Select;N.screen='detail';N.day=calStatus(CORPUS[N.id]).kind==='active'?calStatus(CORPUS[N.id]).day:1;N.stage=0;N.showEnglish=false;return render()}if(b.dataset.n1Day){N.day=+b.dataset.n1Day;N.screen='day';N.stage=0;N.showEnglish=false;return render()}if(b.dataset.n1Begin){N.day=+b.dataset.n1Begin;N.screen='day';N.stage=0;N.showEnglish=false;return render()}if(b.dataset.n1Mode){N.mode=b.dataset.n1Mode==='simple'?'simple':'guided';try{localStorage.setItem(STORE_MODE,N.mode)}catch{}N.stage=0;return render()}if(b.matches('[data-n1-show-en]')){N.showEnglish=!N.showEnglish;return render()}if(b.matches('[data-n1-flip]')){const v=b.querySelector('[data-face-v]'),a=b.querySelector('[data-face-la]');if(v&&a){const showA=a.hidden;a.hidden=!showA;v.hidden=showA}return}if(b.matches('[data-n1-stage-prev]')){N.stage=Math.max(0,N.stage-1);return render()}if(b.matches('[data-n1-stage-next]')){const n=CORPUS[N.id],last=stages(n)-1;if(N.stage>=last){N.screen='detail';N.stage=0;N.showEnglish=false}else N.stage++;return render()}if(b.matches('[data-n1-day-prev]')){N.day=Math.max(1,N.day-1);N.showEnglish=false;return render()}if(b.matches('[data-n1-day-next]')){if(N.day>=9){N.screen='detail';N.stage=0}else{N.day++;N.showEnglish=false}return render()}}
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
const qa=()=>({version:VERSION,corpusCount:Object.keys(CORPUS).length,allNineDays:Object.values(CORPUS).every(n=>n.days.length===9),forms:[...new Set(Object.values(CORPUS).map(n=>n.form))],patterns:[...new Set(Object.values(CORPUS).map(n=>novenaPattern(n)))],noCompletionTracking:true,noIntentStorage:true,frenchHistoricalPrayerPolicy:'FAIL_CLOSED_EXPLICIT_EN_WITNESS_OPTION',calendarHooks:Object.fromEntries(Object.values(CORPUS).map(n=>[n.id,n.calendar.precision])),canonicalReuse:{ourFather:true,hailMary:true,gloryBe:true,loreto1962:true},pass:Object.keys(CORPUS).length===16&&Object.values(CORPUS).every(n=>n.days.length===9)});
const NOVENA_API=Object.freeze({version:VERSION,open,close:BASE_CLOSE,state:()=>({...N}),corpus:CORPUS,calendarStatus:id=>CORPUS[id]?calStatus(CORPUS[id]):null,qa});
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
