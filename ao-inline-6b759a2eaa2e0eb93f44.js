
(()=>{'use strict';
const VERSION='26.1-source-package-lock';
const base=window.AO_TRAD_V26;
if(!base||!base.registry||!base.sources)return;
const rt=()=>window.AO_RUNTIME_V8||window.AdOrientemB1?.runtime||null;
const state=()=>rt()?.store?.getState?.()||null;
const fr=()=>state()?.language==='fr';
const L=(en,frs)=>fr()?frs:en;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const VALID_ROLES=new Set(['source_text','liturgical_text','historical_instruction','current_instruction','editorial_navigation','source_note','historical_note','rubrical_note','user_content']);
const WITNESSES={
 balt1888:{id:'balt1888',work:'A Manual of Prayers for the Use of the Catholic Laity',author:'Third Plenary Council of Baltimore',publisher:'The Catholic Publication Society',year:1888,edition:'New York, 1888',rights:'public_domain',sourceType:'private_devotion',framework:'historical prayer manual; 1962 overlay required where ritual instructions touch Mass',url:'https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Instructions_for_Hearing_Mass'},
 las1911:{id:'las1911',work:'With God: A Book of Prayers and Reflections',author:'F. X. Lasance',publisher:'Benziger Brothers',year:1911,edition:'New York / Cincinnati / Chicago, 1911',rights:'public_domain',sourceType:'private_devotion',framework:'historical prayer manual; 1962 overlay required where ritual instructions touch Mass',url:'https://en.wikisource.org/wiki/With_God'}
};
const PACKAGES={
 MASS_PREP_BALT_1888:{
  id:'MASS_PREP_BALT_1888',witness:'balt1888',status:'source_text_supplied_v352',section:'On the Manner of Hearing Mass → Prayers before Mass',pages:'89–90',verifiedStructure:true,
  title:{en:'Before Mass · Baltimore 1888',fr:'Avant la Messe · Baltimore 1888'},
  note:{en:'The source structure is locked in v26.1. The live public-domain source transcription is supplied by the later v35.2 reader; v26.1 remains the provenance/structure compatibility layer.',fr:'La structure de la source est verrouillée dans v26.1. La transcription publique active est fournie par le lecteur v35.2 ; v26.1 demeure la couche de compatibilité pour la provenance et la structure.'},
  steps:[
   {id:'prep_recollection',role:'historical_instruction',heading:'Recollection, humility and lively faith',sourceRef:'p. 89',description:'Introductory instruction immediately before the Prayers before Mass.'},
   {id:'prep_holy_ghost',role:'source_text',heading:'Invocation of the Holy Ghost',sourceRef:'p. 89',description:'Prayer text is rendered by v35.2; this v26.1 record preserves source role and page mapping.'},
   {id:'prep_versicle_collect',role:'source_text',heading:'Versicle, response and collect',sourceRef:'p. 89',description:'Prayer text is rendered by v35.2; this v26.1 record preserves source role and page mapping.'},
   {id:'prep_look_down',role:'source_text',heading:'Prayer before the Holy Sacrifice',sourceRef:'pp. 89–90',description:'Prayer text is rendered by v35.2; this v26.1 record preserves source role and page mapping.'},
   {id:'prep_transition',role:'editorial_navigation',heading:'Start Mass',sourceRef:null,description:'Application navigation only; not part of the historical prayer text.'}
  ],
  action:{adapter:'prepare',labelEn:'Use retained v25 preparation',labelFr:'Utiliser la préparation v25 conservée'}
 },
 MASS_OFFER_BALT_1888:{
  id:'MASS_OFFER_BALT_1888',witness:'balt1888',status:'source_locked_editorial_bridge',section:'Devotions for Mass · Part I · Prayer at the beginning of Mass',pages:'90–91',verifiedStructure:true,
  title:{en:'Offer This Mass · Baltimore 1888',fr:'Offrir cette Messe · Baltimore 1888'},
  note:{en:'Baltimore explicitly provides places to mention persons and particular requests. Ad Orientem may attach locally saved user intentions at those source-defined insertion points without rewriting the prayer itself.',fr:'Baltimore prévoit explicitement des endroits où mentionner des personnes et des demandes particulières. Ad Orientem peut y rattacher des intentions locales sans réécrire la prière.'},
  steps:[
   {id:'offer_glory',role:'source_note',heading:'God’s honor, praise, adoration and glory',sourceRef:'p. 90',description:'Source-defined first intention of the offering.'},
   {id:'offer_passion',role:'source_note',heading:'Remembrance of the Passion and Death of Christ',sourceRef:'p. 90',description:'Source-defined second intention.'},
   {id:'offer_thanks',role:'source_note',heading:'Thanksgiving for blessings',sourceRef:'p. 90',description:'Source-defined third intention.'},
   {id:'offer_people',role:'user_content',heading:'Persons for whom the user wishes to pray',sourceRef:'p. 90',description:'User-entered names attach to the source’s explicit names placeholder; they are not interpolated into newly written prayer prose.'},
   {id:'offer_requests',role:'user_content',heading:'Particular requests',sourceRef:'p. 90',description:'User-entered requests attach to the source’s explicit requests placeholder.'}
  ],
  action:{legacyModule:'MASS_OFFER_BALT_1888',labelEn:'Manage saved intentions',labelFr:'Gérer les intentions enregistrées'}
 },
 COMM_PREP_LAS_1911:{
  id:'COMM_PREP_LAS_1911',witness:'las1911',status:'source_text_supplied_v352',section:'Devotions for Holy Communion → Short Acts and Prayers for Holy Communion → Before Holy Communion',pages:'419–421',verifiedStructure:true,
  title:{en:'Prepare for Holy Communion · Lasance 1911',fr:'Préparation à la Sainte Communion · Lasance 1911'},
  note:{en:'The six-act sequence is source-verified here; the live public-domain transcription is supplied by v35.2. v41.5 certifies that six-act scope as complete while keeping the 1911 ritual note historical.',fr:'La séquence en six actes est vérifiée ici ; la transcription publique active est fournie par v35.2. v41.5 certifie ce périmètre en six actes comme complet tout en conservant la note rituelle de 1911 comme historique.'},
  steps:['Faith','Hope','Charity','Contrition','Desire','Humility'].map((heading,i)=>({id:'comm_prep_'+heading.toLowerCase(),role:'source_text',heading,sourceRef:i<4?'p. 419–420':'pp. 420–421',description:'Source text is rendered by v35.2; this v26.1 record preserves the Lasance role and page mapping.'})),
  overlays:[{kind:'rubrical_note',title:'Historical source vs 1962 Communion rite',historical:'Lasance directs the communicant to make a new act of contrition while the pre-Communion Confiteor and absolution are recited.',current:'For the 1962 framework, Ad Orientem must not make that Confiteor universal. The 1962 rubric omits the confession and absolution when Communion is distributed within Mass, while retaining Ecce Agnus Dei and the threefold Domine, non sum dignus.',policy:'Keep Lasance’s historical instruction in source metadata; let the 1962 Mass engine determine the actual ritual cues.'}],
  action:{adapter:'prepare_communion',labelEn:'Use retained v25 Communion preparation',labelFr:'Utiliser la préparation à la Communion v25'}
 },
 COMM_THANKS_LAS_1911:{
  id:'COMM_THANKS_LAS_1911',witness:'las1911',status:'source_text_supplied_v352',section:'Devotions for Holy Communion → After Holy Communion',pages:'415–433 (recollection counsel and principal thanksgiving sequence)',verifiedStructure:true,
  title:{en:'Thanksgiving after Holy Communion · Lasance 1911',fr:'Action de grâces après la Sainte Communion · Lasance 1911'},
  note:{en:'The principal thanksgiving sequence is source-locked here and populated by v35.2. v41.5 records it as a scoped core sequence rather than claiming every optional Lasance devotion is embedded.',fr:'La séquence principale d’action de grâces est verrouillée ici et alimentée par v35.2. v41.5 l’enregistre comme noyau délimité sans prétendre que toutes les dévotions facultatives de Lasance sont intégrées.'},
  steps:[
   {id:'thanks_silence',role:'historical_instruction',heading:'Silence and recollection',sourceRef:'pp. 415–418',description:'Lasance transmits Eymard’s counsel to remain in simple recollection after receiving.'},
   {id:'thanks_faith',role:'source_text',heading:'Faith & Adoration',sourceRef:'p. 422',description:'Source text is rendered by v35.2; this v26.1 record preserves source role and page mapping.'},
   {id:'thanks_hope',role:'source_text',heading:'Hope',sourceRef:'p. 423',description:'Source text is rendered by v35.2; this v26.1 record preserves source role and page mapping.'},
   {id:'thanks_love',role:'source_text',heading:'Love',sourceRef:'p. 423',description:'Source text is rendered by v35.2; this v26.1 record preserves source role and page mapping.'},
   {id:'thanks_thanksgiving',role:'source_text',heading:'Thanksgiving',sourceRef:'pp. 423–424',description:'Source text is rendered by v35.2; this v26.1 record preserves source role and page mapping.'},
   {id:'thanks_reparation',role:'source_text',heading:'Reparation & Consecration',sourceRef:'pp. 424–425',description:'Source text is rendered by v35.2; this v26.1 record preserves source role and page mapping.'},
   {id:'thanks_petitions',role:'source_text',heading:'Petitions',sourceRef:'pp. 425–426',description:'Source text is rendered by v35.2; this v26.1 record preserves source role and page mapping.'},
   {id:'thanks_living',role:'source_text',heading:'Commemoration of the Living',sourceRef:'p. 426',description:'Optional source section.'},
   {id:'thanks_dead',role:'source_text',heading:'Commemoration of the Dead',sourceRef:'pp. 426–427',description:'Optional source section.'},
   {id:'thanks_resolution',role:'source_text',heading:'Final prayers, reflections and resolutions',sourceRef:'pp. 428–433',description:'Source sequence continues with concluding material and traditional prayers.'}
  ],
  overlays:[{kind:'historical_note',title:'Historical indulgence notes',historical:'The 1911 source includes period indulgence notices alongside several prayers.',current:'v26.1 does not present those notices as presently operative grants.',policy:'Preserve them only as historical source metadata until independently verified against current norms.'}],
  action:{adapter:'thanks',labelEn:'Use retained v25 Thanksgiving',labelFr:'Utiliser l’action de grâces v25 conservée'}
 },
 CONFESSION_LAS_1911:{
  id:'CONFESSION_LAS_1911',witness:'las1911',status:'source_text_supplied_v352',section:'Devotions for Confession',pages:'382–395',verifiedStructure:true,
  title:{en:'Confession · Lasance 1911',fr:'Confession · Lasance 1911'},
  note:{en:'The Lasance Confession sequence and page map are locked here; the live historical source core is rendered by v35.2. Sensitive marked examination state remains session-only and separate from ordinary saved intentions.',fr:'La séquence et la cartographie des pages de Lasance sont verrouillées ici ; le noyau historique actif est rendu par v35.2. Les éléments sensibles cochés demeurent uniquement en session et séparés des intentions enregistrées.'},
  steps:[
   {id:'conf_before',role:'source_text',heading:'Prayer before Confession',sourceRef:'pp. 382–384',description:'Source section is rendered by v35.2; this v26.1 record preserves structure and page mapping.'},
   {id:'conf_exam',role:'source_text',heading:'Examination of Conscience',sourceRef:'pp. 384–389',description:'Historical examination retained as historical source material.'},
   {id:'conf_after_exam',role:'source_text',heading:'After the Examination',sourceRef:'p. 389',description:'Source section locked.'},
   {id:'conf_contrition',role:'source_text',heading:'Considerations to excite true Contrition',sourceRef:'pp. 389–391',description:'Source section locked.'},
   {id:'conf_act',role:'source_text',heading:'Act of Contrition',sourceRef:'p. 391',description:'Source section locked.'},
   {id:'conf_how',role:'historical_instruction',heading:'How to make the Confession',sourceRef:'pp. 391–395',description:'Historical instruction must remain distinct from any current-disciplinary overlay.'},
   {id:'conf_thanks',role:'source_text',heading:'Thanksgiving after Confession',sourceRef:'p. 395',description:'Source section locked.'}
  ],
  overlays:[{kind:'current_instruction',title:'Discipline separation',historical:'Lasance’s examination and practical instructions remain intact as a 1911 historical witness.',current:'Any present canonical or disciplinary guidance must be separately sourced and rendered as a current-practice overlay.',policy:'Never rewrite the historical source as though every disciplinary statement were current.'},{kind:'source_note',title:'Privacy class',historical:'Not a source-text claim.',current:'Marked examination items use session-only memory; no cloud sync, analytics payload, or persistent save is introduced by this engine.',policy:'Clear preparation explicitly after use; sensitive state remains separate from ordinary intentions.'}],
  action:{adapter:'confession',labelEn:'Use retained v25 Confession',labelFr:'Utiliser la Confession v25 conservée'}
 }
};
const origOpen=base.open.bind(base);
const origClose=base.close.bind(base);
function root(){return document.getElementById('ao-v26-exercises')}
function witness(p){return WITNESSES[p.witness]}
function sourceMeta(p){const w=witness(p);return `<section class="aoV26Section aoV26Source"><span class="aoV26Eyebrow">${L('Source lock','Verrouillage de source')}</span><h2>${esc(w.work)}</h2><dl class="aoV261SourceGrid"><dt>${L('Author / editor','Auteur / éditeur')}</dt><dd>${esc(w.author)}</dd><dt>${L('Edition','Édition')}</dt><dd>${esc(w.publisher)} · ${w.year}</dd><dt>${L('Section','Section')}</dt><dd>${esc(p.section)}</dd><dt>${L('Pages','Pages')}</dt><dd>${esc(p.pages)}</dd><dt>${L('Content type','Type')}</dt><dd>${esc(w.sourceType)}</dd><dt>${L('Reuse','Réutilisation')}</dt><dd>${L('Public-domain historical edition','Édition historique du domaine public')}</dd><dt>${L('Package state','État du paquet')}</dt><dd>${L('Source structure locked · live source text supplied by v35.2','Structure verrouillée · texte-source actif fourni par v35.2')}</dd></dl><a href="${esc(w.url)}" target="_blank" rel="noopener">${L('Open source witness','Ouvrir le témoin source')} ↗</a></section>`}
function top(p){return `<header class="aoV26Top"><button type="button" data-v261-back aria-label="${L('Back','Retour')}">←</button><div><small>${L('Traditional Exercises · source package','Exercices traditionnels · paquet source')}</small><strong>${esc(fr()?p.title.fr:p.title.en)}</strong></div><button type="button" data-v261-close aria-label="${L('Close','Fermer')}">×</button></header>`}
function stepCard(s,i){return `<article class="aoV261Step"><header><span class="aoV261No">${i+1}</span><div><h3>${esc(s.heading)}</h3><div class="aoV261Meta"><span>${esc(s.role)}</span>${s.sourceRef?`<span>${esc(s.sourceRef)}</span>`:''}</div></div></header><p>${esc(s.description||'')}</p></article>`}
function overlays(p){return (p.overlays||[]).map(o=>`<aside class="aoV261Overlay"><span class="aoV26Eyebrow">${esc(o.kind)}</span><h3>${esc(o.title)}</h3><p><strong>${L('Historical source:','Source historique :')}</strong> ${esc(o.historical)}</p><p><strong>${L('1962 / current layer:','Couche 1962 / actuelle :')}</strong> ${esc(o.current)}</p><p><strong>${L('Rendering policy:','Règle d’affichage :')}</strong> ${esc(o.policy)}</p></aside>`).join('')}
function actions(p){const a=p.action||{};if(a.legacyModule)return `<div class="aoV261Actions"><button type="button" class="primary" data-v261-legacy-module="${esc(a.legacyModule)}">${esc(L(a.labelEn,a.labelFr))}</button></div>`;if(a.adapter)return `<div class="aoV261Actions"><button type="button" class="primary" data-v261-adapter="${esc(a.adapter)}">${esc(L(a.labelEn,a.labelFr))}</button></div>`;return''}
function renderPackage(id){const p=PACKAGES[id],r=root();if(!p||!r)return false;document.body.classList.add('aoV26Open');r.hidden=false;r.setAttribute('aria-hidden','false');r.innerHTML=`<div class="aoV26Shell">${top(p)}<section class="aoV26Hero"><span class="aoV261Badge">${L('Source structure · text supplied by v35.2','Structure source · texte fourni par v35.2')}</span><h1>${esc(fr()?p.title.fr:p.title.en)}</h1><p>${esc(fr()?p.note.fr:p.note.en)}</p></section><p class="aoV261Notice">${L('This pass intentionally records structure, provenance, page mapping, content roles and compatibility overlays without inventing or silently normalising devotional wording.','Cette passe enregistre volontairement la structure, la provenance, les pages, les rôles de contenu et les surcouches de compatibilité sans inventer ni normaliser silencieusement le texte dévotionnel.')}</p>${p.steps.map(stepCard).join('')}${overlays(p)}${actions(p)}${sourceMeta(p)}</div>`;return true}
function open(id=null){if(id&&PACKAGES[id])return renderPackage(id);return origOpen(id)}
function adapter(kind){origClose();const store=rt()?.store;if(kind==='prepare'||kind==='prepare_communion'){store?.dispatch({type:'enter-prepare'});if(kind==='prepare_communion')store?.dispatch({type:'prepare-communion',value:true});return true}if(kind==='thanks'){store?.dispatch({type:'enter-thanksgiving'});return true}if(kind==='confession'){if(window.AOTraditionalPrayerBook?.openModule){window.AOTraditionalPrayerBook.openModule('confession',{returnContext:{surface:'traditional-exercises'}});return true}}return false}
function close(){origClose();return true}
function patchRegistry(){for(const [id,p] of Object.entries(PACKAGES)){const m=base.registry[id];if(!m)continue;m.sourcePackage={status:p.status,section:p.section,pages:p.pages,verifiedStructure:p.verifiedStructure,stepCount:p.steps.length,overlayCount:(p.overlays||[]).length};m.sourceLocked=true;if(m.status==='source_pending')m.status='source_locked';m.contentReady=false;m.summary=m.summary||{};m.summary.en=(m.summary.en||'')+' Source structure and page mapping locked in v26.1.';m.summary.fr=(m.summary.fr||'')+' Structure et cartographie des pages verrouillées dans v26.1.'}}
function qa(){const ps=Object.values(PACKAGES),steps=ps.flatMap(p=>p.steps),roles=[...new Set(steps.map(s=>s.role))];return{version:VERSION,packages:{expected:5,actual:ps.length,pass:ps.length===5,allVerifiedStructure:ps.every(p=>p.verifiedStructure===true),allPageMapped:ps.every(p=>!!p.pages&&p.steps.every(s=>s.sourceRef!==undefined)),allWitnessed:ps.every(p=>!!WITNESSES[p.witness])},steps:{count:steps.length,roles,rolesValid:roles.every(r=>VALID_ROLES.has(r)),idsUnique:new Set(steps.map(s=>s.id)).size===steps.length},overlays:{count:ps.reduce((n,p)=>n+(p.overlays||[]).length,0),communion1962Overlay:(PACKAGES.COMM_PREP_LAS_1911.overlays||[]).some(x=>x.kind==='rubrical_note'),confessionDisciplineOverlay:(PACKAGES.CONFESSION_LAS_1911.overlays||[]).some(x=>x.kind==='current_instruction')},contentIntegrity:{originalPrayerTextAdded:false,sourceTextFieldsEmbedded:steps.filter(s=>Object.prototype.hasOwnProperty.call(s,'text')).length,pass:steps.every(s=>!Object.prototype.hasOwnProperty.call(s,'text'))},privacy:{confessionStorage:base.confessionStore?.storageClass||null,intentionStorage:'localStorage with memory fallback'},massEngineChanged:false,v26PrefixPreserved:true}}
patchRegistry();
const patched={...base,version:VERSION,open,close,sourcePackages:PACKAGES,sourceWitnesses:WITNESSES,qaSourceLock:qa};
window.AO_TRAD_V26=patched;
window.AO_TRAD_SOURCE_V261={version:VERSION,packages:PACKAGES,witnesses:WITNESSES,qa,open:renderPackage};
window.AO_V261_META={version:'v26.1',baseline:'Ad-Orientem-2.0-v26-TRADITIONAL-EXERCISES-ENGINE-PHASE-A.html',scope:['source-package lock','page mapping','content-role lock','1962 compatibility overlay','confession discipline/privacy separation'],massEngineChanged:false,v26PrefixPreserved:true,originalPrayerTextAdded:false};
document.addEventListener('click',e=>{const back=e.target.closest?.('[data-v261-back]');if(back){e.preventDefault();origOpen();return}const c=e.target.closest?.('[data-v261-close]');if(c){e.preventDefault();close();return}const a=e.target.closest?.('[data-v261-adapter]');if(a){e.preventDefault();adapter(a.dataset.v261Adapter);return}const lm=e.target.closest?.('[data-v261-legacy-module]');if(lm){e.preventDefault();origOpen(lm.dataset.v261LegacyModule);return}},true);
})();
