
(function(){
'use strict';
const VERSION='ARCH-RUBRICAL-2.1';
const GROUPS={
 lord:{en:'Our Lord & the Holy Trinity',fr:'Notre-Seigneur et la Sainte Trinité'},
 spirit:{en:'Holy Ghost',fr:'Saint-Esprit'},
 mary:{en:'Our Lady',fr:'Notre-Dame'},
 saints:{en:'Angels & Saints',fr:'Anges et saints'},
 needs:{en:'The Church & particular needs',fr:'Église et besoins particuliers'}
};
const CATALOGUE={
 trinity:{type:'votive',group:'lord',title:{en:'Most Holy Trinity',fr:'Très Sainte Trinité'},path:'Votive/Pent01-0r',colour:'White'},
 blessed_sacrament:{type:'votive',group:'lord',title:{en:'Blessed Sacrament',fr:'Très Saint-Sacrement'},path:'Votive/BlessedSacrament',colour:'White'},
 sacred_heart:{type:'votive',group:'lord',title:{en:'Sacred Heart of Jesus',fr:'Sacré-Cœur de Jésus'},path:'Votive/Pent02-5',colour:'White'},
 holy_cross:{type:'votive',group:'lord',title:{en:'Holy Cross',fr:'Sainte Croix'},path:'Votive/Cross',colour:'Red'},
 passion:{type:'votive',group:'lord',title:{en:'Passion of Our Lord',fr:'Passion de Notre-Seigneur'},path:'Votive/Passion',colour:'Red'},
 eternal_priest:{type:'votive',group:'lord',title:{en:'Jesus Christ, Supreme and Eternal Priest',fr:'Jésus-Christ, Souverain et Éternel Prêtre'},path:'Votive/JesusEternalPriest',colour:'White'},
 holy_ghost:{type:'votive',group:'spirit',title:{en:'Mass of the Holy Ghost',fr:'Messe du Saint-Esprit'},path:'Votive/HolySpirit',colour:'Red'},
 grace_holy_ghost:{type:'votive',group:'spirit',title:{en:'For the grace of the Holy Ghost',fr:'Pour obtenir la grâce du Saint-Esprit'},path:'Votive/HolySpirit2',colour:'Red'},
 saturday_bvm:{type:'votive',group:'mary',title:{en:'Saturday Mass of Our Lady',fr:'Messe de la Sainte Vierge le samedi'},pathResolver:'bvm',colour:'White'},
 immaculate_heart:{type:'votive',group:'mary',title:{en:'Immaculate Heart of Mary',fr:'Cœur Immaculé de Marie'},path:'Votive/08-22r',colour:'White'},
 angels:{type:'votive',group:'saints',title:{en:'Holy Angels',fr:'Saints Anges'},path:'Votive/Angels',colour:'White'},
 joseph:{type:'votive',group:'saints',title:{en:'St Joseph',fr:'Saint Joseph'},path:'Votive/Joseph',colour:'White'},
 apostles:{type:'votive',group:'saints',title:{en:'All the Holy Apostles',fr:'Tous les saints Apôtres'},pathResolver:'apostles',colour:'Red'},
 peter_paul:{type:'votive',group:'saints',title:{en:'Ss Peter and Paul',fr:'Saints Pierre et Paul'},pathResolver:'peterPaul',colour:'Red'},
 vocations:{type:'votive',group:'needs',title:{en:'For Vocations',fr:'Pour les vocations'},path:'Votive/AdVocationes',colour:'White'},
 faith:{type:'votive',group:'needs',title:{en:'Propagation of the Faith',fr:'Propagation de la Foi'},path:'Votive/FideiPropagatione',colour:'White'},
 unity:{type:'votive',group:'needs',title:{en:'Unity of the Church',fr:"Unité de l'Église"},path:'Votive/ProUnitateEcclesiae',colour:'White'},
 pestilence:{type:'votive',group:'needs',title:{en:'Time of Pestilence / Mortality',fr:'Temps de peste / mortalité'},path:'Votive/TemporeMortalitatis',colour:'Violet'},
 dedication:{type:'votive',group:'needs',title:{en:'Dedication of a Church',fr:"Dédicace d'une église"},path:'Votive/Terribilis',colour:'White'},
 nuptial:{type:'nuptial',title:{en:'Nuptial Mass · Missa pro Sponso et Sponsa',fr:'Messe nuptiale · Missa pro Sponso et Sponsa'},path:'Votive/Matrimonium',colour:'White'},
 requiem:{type:'requiem',title:{en:'Mass for the Dead',fr:'Messe des défunts'},path:'Votive/Defunctorum',colour:'Black'}
};
const REQUIEM_CIRCUMSTANCES={
 funeral:{en:'Funeral Mass',fr:'Messe de funérailles'},
 death:{en:'Day of death',fr:'Jour du décès'},
 burial:{en:'Final burial / interment',fr:'Inhumation définitive'},
 news:{en:'After news of death',fr:'Après réception de la nouvelle du décès'},
 days:{en:'3rd, 7th or 30th day',fr:'3e, 7e ou 30e jour'},
 anniversary:{en:'Anniversary',fr:'Anniversaire'},
 cemetery:{en:'Cemetery church / chapel',fr:'Église / chapelle de cimetière'},
 all_souls_octave:{en:'Within eight days from All Souls',fr:'Dans les huit jours à partir de la Commémoration des fidèles défunts'},
 ordinary:{en:'Ordinary Mass for the Dead',fr:'Messe ordinaire pour les défunts'}
};
const ARCH={
 version:VERSION,
 liturgicalDay:null,
 actualCelebration:{id:'mass_of_day',type:'calendar'},
 celebrationForm:'sung',
 followMode:'vox',
 readiness:null,
 resolvedProper:null,
 rubric:null,
 date:null,
 stage:null,
 history:[],
 search:'',
 requiemCircumstance:null,
 votiveBasis:'ordinary',
 rubricContext:{
  couplePresent:true,
  bridePreviouslyBlessed:false,
  groomPreviouslyBlessed:false,
  groomOnlyCustomAllowsBlessing:false,
  mixedMarriage:false,
  closedTimePermission:false,
  exposition:false,
  conventualConflict:false,
  onlyMassWithCandleBlessing:false,
  onlyMassWithAshes:false,
  rogationMassRequired:false,
  holyDayOfObligation:false,
  localFuneralImpediment:false
 },
 lastResolveToken:0
};
window.AO_CELEBRATION_CATALOGUE=CATALOGUE;
window.AO_CELEBRATION_ARCH_V1=ARCH;
function rt(){return window.AO_RUNTIME_V8||null}
function core(){return rt()?.store?.getState?.()||null}
function lang(){return core()?.language==='fr'?'fr':'en'}
function L(en,fr){return lang()==='fr'?fr:en}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function isoDate(){return core()?.selectedDate||new Date().toISOString().slice(0,10)}
function calendarTitle(s=core()){const d=s?.resolution?.day,p=s?.resolution?.proper?.status==='ready'?s.resolution.proper.data:null;return (lang()==='fr'?(p?.nameFr||p?.name||d?.main?.title):(p?.name||d?.main?.title))||L('Mass of the Day','Messe du jour')}
function calendarRank(s=core()){const d=s?.resolution?.day,p=s?.resolution?.proper?.status==='ready'?s.resolution.proper.data:null;return p?.rank||d?.main?.rank||''}
function calendarColour(s=core()){const d=s?.resolution?.day;return s?.resolution?.colourPlan?.label||d?.main?.color||''}
function calendarPath(s=core()){const p=s?.resolution?.proper?.status==='ready'?s.resolution.proper.data:null;return p?.sourcePath||p?.path||s?.resolution?.day?.main?.path||''}
function liturgicalDayObject(s=core()){return {date:s?.selectedDate||'',title:calendarTitle(s),rank:calendarRank(s),colour:calendarColour(s),proper:calendarPath(s),raw:s?.resolution?.day||null}}
function isPaschal(s=core()){const id=String(s?.resolution?.day?.tempora?.[0]?.id||'');return /^tempora:Pasc/i.test(id)||/^Pasc/i.test(id)}
function pathFor(def,s=core()){
 if(!def)return null;if(def.path)return def.path;
 if(def.pathResolver==='apostles')return isPaschal(s)?'Votive/ApostlesP':'Votive/Apostles';
 if(def.pathResolver==='peterPaul')return isPaschal(s)?'Votive/PeterPaulP':'Votive/PeterPaul';
 if(def.pathResolver==='bvm'){
  const id=String(s?.resolution?.day?.tempora?.[0]?.id||'');const d=new Date(`${s?.selectedDate||isoDate()}T12:00:00`);const m=d.getMonth()+1,day=d.getDate();
  if(/^tempora:Adv/i.test(id))return 'Commune/C10a';
  if(isPaschal(s))return 'Commune/C10Pasc';
  if((m===12&&day>=25)||m===1||(m===2&&day<=2))return 'Commune/C10b';
  if(/^tempora:(Quad|Sept|Sexa|Quinq)/i.test(id)||(m>=2&&m<=4))return 'Commune/C10c';
  return 'Commune/C10t';
 }
 return null;
}
function actualDef(){if(ARCH.actualCelebration.id==='mass_of_day')return null;return CATALOGUE[ARCH.actualCelebration.id]||null}
function actualTitle(){const def=actualDef();return def?def.title[lang()]||def.title.en:calendarTitle()}
function actualType(){const def=actualDef();return def?.type||'calendar'}
function actualPath(){const def=actualDef();return def?pathFor(def):calendarPath()}
function normalizeRank(v){const s=String(v||'').toUpperCase();const m=s.match(/\b([IVX]+|[1-4])\b/);if(!m)return null;const x=m[1];if(/^\d$/.test(x))return Number(x);return {I:1,II:2,III:3,IV:4}[x]||null}
function selectedDateObject(){const raw=isoDate();const d=new Date(`${raw}T12:00:00`);return Number.isNaN(d.getTime())?new Date():d}
function dayFacts(){
 const s=core(),d=selectedDateObject(),day=ARCH.liturgicalDay||liturgicalDayObject(s),path=String(day.proper||calendarPath(s)||''),title=String(day.title||calendarTitle(s)||''),rank=normalizeRank(day.rank),profile=typeof riteProfileFor==='function'?riteProfileFor(path,s?.resolution?.proper?.status==='ready'?s.resolution.proper.data:null):'';
 return {date:d,iso:isoDate(),day,path,title,rank,profile,isSunday:d.getDay()===0,isSaturday:d.getDay()===6,isFriday:d.getDay()===5,isThursday:d.getDay()===4,month:d.getMonth()+1,dom:d.getDate()};
}
function textHas(f,re){return re.test(`${f.title} ${f.path} ${f.profile}`)}
function isAllSouls(f=dayFacts()){return (f.month===11&&f.dom===2)||/^Sancti\/11-02/i.test(f.path)||textHas(f,/All Souls|Fidelium defunctorum|fidèles défunts/i)}
function isTriduum(f=dayFacts()){return ['holy_thursday_1962','good_friday_1962','easter_vigil_1962'].includes(f.profile)||['Tempora/Quad6-4','Tempora/Quad6-5','Tempora/Quad6-6'].includes(f.path)}
function isAshWednesday(f=dayFacts()){return f.profile==='ash_wednesday_1962'||f.path==='Tempora/Quadp3-3'||textHas(f,/Ash Wednesday|Mercredi des Cendres/i)}
function isCandlemas(f=dayFacts()){return f.profile==='candlemas_1962'||f.path==='Sancti/02-02'||textHas(f,/Purification|Candlemas|Chandeleur/i)}
function isChristmasSeason(f=dayFacts()){return (f.month===12&&f.dom>=25)||(f.month===1&&f.dom<=13)}
function isTempusClausum(f=dayFacts()){
 if(isTriduum(f))return true;
 if(/^Tempora\/Adv/i.test(f.path)||(f.month===12&&f.dom===25))return true;
 if(/^Tempora\/Quad/i.test(f.path)||isAshWednesday(f)||textHas(f,/Lent|Passiontide|Carême|Passion/i))return true;
 if(f.isSunday&&textHas(f,/Easter Sunday|Dominica Resurrectionis|Pâques/i))return true;
 return false;
}
function isFirstFriday(f=dayFacts()){return f.isFriday&&f.dom<=7}
function isFirstSaturday(f=dayFacts()){return f.isSaturday&&f.dom<=7}
function isFirstThursday(f=dayFacts()){return f.isThursday&&f.dom<=7}
function isOctaveDay(f=dayFacts()){return textHas(f,/octave/i)||/^Tempora\/(Pasc0|Pasc7|Nat)/i.test(f.path)}
function isFeriaIV(f=dayFacts()){return f.rank===4&&/^Tempora\//i.test(f.path)&&!textHas(f,/Saturday Office|Officium B\.?.?M\.?.?|Sainte Vierge le samedi/i)}
function isHolyWeekMonWed(f=dayFacts()){
 return f.rank===1&&(/^Tempora\/Quad6-[123]$/i.test(f.path)||textHas(f,/Monday|Tuesday|Wednesday of Holy Week|Lundi|Mardi|Mercredi de la Semaine Sainte/i));
}
function precedenceSlot(f=dayFacts()){
 if((f.month===12&&f.dom===25)||textHas(f,/Christmas Day|Nativity of the Lord|Noël/i)||textHas(f,/Easter Sunday|Pentecost|Whit Sunday|Pâques|Pentecôte/i))return 1;
 if(isTriduum(f))return 2;
 if((f.month===1&&f.dom===6)||textHas(f,/Epiphany|Ascension|Blessed Trinity|Most Holy Trinity|Corpus Christi|Sacred Heart|Christ the King|Épiphanie|Ascension|Trinité|Saint-Sacrement|Sacré-Cœur|Christ Roi/i))return 3;
 if((f.month===12&&f.dom===8)||(f.month===8&&f.dom===15)||textHas(f,/Immaculate Conception|Assumption|Immaculée Conception|Assomption/i))return 4;
 if((f.month===12&&f.dom===24)||(f.month===1&&f.dom===1)||textHas(f,/Vigil of Christmas|Octave-day of Christmas|Vigile de Noël|Octave de Noël/i))return 5;
 if(f.isSunday&&(/^Tempora\/(Adv|Quad)/i.test(f.path)||textHas(f,/Low Sunday|Dominica in Albis|Quasimodo|Dimanche in albis/i)))return 6;
 if(isAshWednesday(f)||isHolyWeekMonWed(f))return 7;
 if(isAllSouls(f))return 8;
 return null;
}
function isTopEightPrecedenceDay(f=dayFacts()){return precedenceSlot(f)!=null}
function isTopThreeOrAllSouls(f=dayFacts()){const n=precedenceSlot(f);return n===1||n===2||n===3||n===8}
function isChristmasOctave(f=dayFacts()){return (f.month===12&&f.dom>=25)||(f.month===1&&f.dom===1)||textHas(f,/octave of Christmas|octave de Noël/i)}
function dedicationConsecrationForbidden(f=dayFacts()){
 if((f.month===12&&[24,25].includes(f.dom))||(f.month===1&&f.dom===6)||isAllSouls(f))return true;
 if(textHas(f,/Ascension|Corpus Christi|Pentecost|Épiphanie|Ascension|Saint-Sacrement|Pentecôte/i))return true;
 if(/^Tempora\/Quad6-[0-7]$/i.test(f.path)||textHas(f,/Palm Sunday|Easter Sunday|Dimanche des Rameaux|Pâques/i))return true;
 return false;
}
function identityConflict(def,f=dayFacts()){
 const t=`${f.title} ${f.path}`.toLowerCase(),id=ARCH.actualCelebration.id;
 const tests={
  trinity:/trinity|trinit[eé]/,blessed_sacrament:/corpus christi|blessed sacrament|saint-sacrement/,sacred_heart:/sacred heart|sacr[eé]-cœur/,holy_cross:/holy cross|exaltation of the holy cross|sainte croix|exaltation de la croix/,passion:/passion of our lord|passion de notre-seigneur/,eternal_priest:/eternal priest|pr[eê]tre [eé]ternel/,holy_ghost:/pentecost|holy ghost|saint-esprit|pentec[oô]te/,immaculate_heart:/immaculate heart|cœur immacul[eé]/,angels:/holy angels|guardian angels|saints anges|anges gardiens/,joseph:/saint joseph|st joseph/,apostles:/apostles|ap[oô]tres/,peter_paul:/peter and paul|pierre et paul/
 };
 return !!(tests[id]&&tests[id].test(t));
}
function funeralUniversalBlock(f=dayFacts()){
 if((f.month===12&&f.dom===25)||textHas(f,/Christmas Day|Nativity of the Lord|Noël/i))return 'precedence-1';
 if(textHas(f,/Easter Sunday|Pentecost|Whit Sunday|Pâques|Pentecôte/i))return 'precedence-1';
 if(isTriduum(f))return 'precedence-2';
 if((f.month===1&&f.dom===6)||textHas(f,/Epiphany|Ascension|Blessed Trinity|Most Holy Trinity|Corpus Christi|Sacred Heart|Christ the King|Épiphanie|Ascension|Trinité|Saint-Sacrement|Sacré-Cœur|Christ Roi/i))return 'precedence-3';
 if((f.month===12&&f.dom===8)||(f.month===8&&f.dom===15)||textHas(f,/Immaculate Conception|Assumption|Immaculée Conception|Assomption/i))return 'precedence-4';
 if((f.month===12&&f.dom===24)||(f.month===1&&f.dom===1)||textHas(f,/Vigil of Christmas|Octave-day of Christmas|Vigile de Noël|Octave de Noël/i))return 'precedence-5';
 if(f.isSunday&&(/^Tempora\/(Adv|Quad)/i.test(f.path)||textHas(f,/Low Sunday|Dominica in Albis|Quasimodo|Dimanche in albis/i)))return 'precedence-6';
 return null;
}
function rubricalSources(...items){return items.filter(Boolean)}
function resultBase(status,code,summary,reason,extra={}){return {status,code,summary,reason,additions:[],conditions:[],sources:[],...extra}}
function votiveBasisOptions(def=actualDef(),f=dayFacts()){
 if(!def||def.type!=='votive')return [];
 const out=[];
 if(ARCH.actualCelebration.id!=='dedication')out.push({id:'ordinary',class:4,label:L('Ordinary votive · IV class','Votive ordinaire · IVe classe'),note:L('Requires a just cause such as necessity, benefit or devotion.','Exige une juste cause telle que nécessité, utilité ou dévotion.'),source:'RG 387–389'});
 if(ARCH.actualCelebration.id==='sacred_heart'&&isFirstFriday(f))out.push({id:'first_friday',class:3,label:L('First Friday devotion · III class','Dévotion du premier vendredi · IIIe classe'),note:L('Only where special Sacred Heart exercises are held that day.','Seulement là où des exercices spéciaux en l’honneur du Sacré-Cœur ont lieu ce jour-là.'),source:'RG 385b–386'});
 if(ARCH.actualCelebration.id==='immaculate_heart'&&isFirstSaturday(f))out.push({id:'first_saturday',class:3,label:L('First Saturday devotion · III class','Dévotion du premier samedi · IIIe classe'),note:L('Only where special Immaculate Heart exercises are held that day.','Seulement là où des exercices spéciaux en l’honneur du Cœur Immaculé ont lieu ce jour-là.'),source:'RG 385c–386'});
 if(ARCH.actualCelebration.id==='eternal_priest'&&(isFirstThursday(f)||isFirstSaturday(f)))out.push({id:'clergy_devotion',class:3,label:L('Clergy-sanctification devotion · III class','Dévotion pour la sanctification du clergé · IIIe classe'),note:L('First Thursday or first Saturday, where the prescribed special exercises are held.','Premier jeudi ou premier samedi, là où les exercices spéciaux prescrits ont lieu.'),source:'RG 385a–386'});
 if(ARCH.actualCelebration.id==='blessed_sacrament'){
  out.push({id:'eucharistic_congress_private',class:3,label:L('Eucharistic Congress · individual priest · III class','Congrès eucharistique · prêtre individuel · IIIe classe'),note:L('For an individual priest participating in a Eucharistic Congress.','Pour un prêtre individuel participant à un Congrès eucharistique.'),source:'RG 337, 385'});
  out.push({id:'eucharistic_congress_public',class:2,label:L('Eucharistic Congress · public celebration · II class','Congrès eucharistique · célébration publique · IIe classe'),note:L('For other public celebrations of the Congress.','Pour les autres célébrations publiques du Congrès.'),source:'RG 336'});
  out.push({id:'eucharistic_congress_principal',class:1,label:L('Eucharistic Congress · principal sung Mass · I class','Congrès eucharistique · Messe principale chantée · Ie classe'),note:L('Principal Congress Mass, in cantu.','Messe principale du Congrès, chantée.'),source:'RG 335'});
 }
 if(ARCH.actualCelebration.id==='faith')out.push({id:'mission_celebration',class:2,label:L('Mission celebration / congress · II class','Célébration / congrès missionnaire · IIe classe'),note:L('One such Mass in each church for a special Mission celebration or Missionary Congress.','Une telle Messe dans chaque église pour une célébration missionnaire spéciale ou un congrès missionnaire.'),source:'RG 369'});
 out.push({id:'grave_public',class:2,label:L('Grave public reason · II class','Motif grave et public · IIe classe'),note:L('Requires order or consent of the local Ordinary; the need must affect the whole or a notable part of the community.','Exige l’ordre ou le consentement de l’Ordinaire du lieu; le besoin doit concerner toute la communauté ou une partie notable de celle-ci.'),source:'RG 366–368'});
 out.push({id:'special_occasion',class:2,label:L('Defined special occasion · II class','Occasion spéciale définie · IIe classe'),note:L('For the particular occasions listed by the rubrics and with the respective Ordinary’s order or permission.','Pour les occasions particulières prévues par les rubriques et avec l’ordre ou la permission de l’Ordinaire compétent.'),source:'RG 370–372'});
 out.push({id:'sanctuary',class:2,label:L('Sanctuary / pilgrimage privilege · II class','Sanctuaire / privilège de pèlerinage · IIe classe'),note:L('Only where the sanctuary/place-of-devotion conditions of the rubrics are actually met.','Seulement lorsque les conditions rubricales du sanctuaire ou lieu de dévotion sont réellement remplies.'),source:'RG 373–377'});
 out.push({id:'extraordinary',class:ARCH.celebrationForm==='sung'?1:2,label:ARCH.celebrationForm==='sung'?L('Extraordinary celebration · sung · I class','Célébration extraordinaire · chantée · Ie classe'):L('Extraordinary celebration · low · II class','Célébration extraordinaire · basse · IIe classe'),note:L('Only for an extraordinary celebration of the type defined in RG 338–340.','Seulement pour une célébration extraordinaire du type défini aux RG 338–340.'),source:'RG 338–340'});
 if(ARCH.actualCelebration.id==='dedication')out.unshift({id:'dedication_consecration',class:1,label:L('Actual consecration of a church · I class','Consécration effective d’une église · Ie classe'),note:L('This basis is for the Mass of Dedication in the act of consecrating a church, not a generic private votive.','Cette base concerne la Messe de la Dédicace lors de la consécration d’une église, non une votive privée générique.'),source:'RG 329a, 331–334'});
 return out;
}
function currentVotiveBasis(def=actualDef(),f=dayFacts()){
 const opts=votiveBasisOptions(def,f);let b=opts.find(x=>x.id===ARCH.votiveBasis);
 if(!b){b=opts[0]||null;if(b)ARCH.votiveBasis=b.id}
 if(b?.id==='extraordinary')b={...b,class:ARCH.celebrationForm==='sung'?1:2,label:ARCH.celebrationForm==='sung'?L('Extraordinary celebration · sung · I class','Célébration extraordinaire · chantée · Ie classe'):L('Extraordinary celebration · low · II class','Célébration extraordinaire · basse · IIe classe')};
 return b;
}
function genericVotiveBlock(f=dayFacts()){
 const c=ARCH.rubricContext;
 if(c.conventualConflict)return resultBase('prohibited','votive-conventual-conflict',L('Votive Mass prohibited in this circumstance','Messe votive interdite dans cette circonstance'),L('In a church having only one Mass, a votive Mass is forbidden when the conventual obligation cannot be fulfilled by another priest.'),{sources:rubricalSources('RG 326a')});
 if(c.onlyMassWithCandleBlessing&&isCandlemas(f))return resultBase('prohibited','votive-candlemas-only-mass',L('Votive Mass prohibited at this Mass','Messe votive interdite à cette Messe'),L('On 2 February, in a church having only one Mass, a votive Mass cannot replace the Mass associated with the blessing of candles.'),{sources:rubricalSources('RG 326b')});
 if(c.rogationMassRequired)return resultBase('prohibited','votive-rogation-required',L('Rogation Mass takes precedence','La Messe des Rogations a préséance'),L('Where the Rogation Mass must be said with the Greater or Lesser Litanies, another votive Mass is not permitted in a church having only one Mass.'),{sources:rubricalSources('RG 326c')});
 return null;
}
function applyVotiveClass(def,basis,f=dayFacts()){
 const cls=basis?.class||4,id=ARCH.actualCelebration.id,slot=precedenceSlot(f),same=identityConflict(def,f);
 if(basis?.id==='dedication_consecration'){
  if(dedicationConsecrationForbidden(f))return resultBase('prohibited','dedication-consecration-day-forbidden',L('Church consecration is not permitted today','La consécration d’une église n’est pas permise aujourd’hui'),L('The 1960 rubrics forbid the consecration of a church on the specified major days. Because this basis is the Mass within the actual rite of consecration, the celebration itself must be moved.'),{votiveClass:1,basis:basis.id,transferable:true,sources:rubricalSources('RG 331–334')});
  return resultBase('permitted','dedication-consecration-required',L('Mass of Dedication required within the consecration rite','Messe de la Dédicace requise dans le rite de consécration'),L('When a church or oratory is actually consecrated on a day on which the rite is permitted, the Mass of Dedication forms part of the complete rite and must be celebrated even where another votive Mass I class would be impeded.'),{votiveClass:1,basis:basis.id,gloria:true,credo:true,tone:ARCH.celebrationForm==='sung'?'solemn':null,sources:rubricalSources('RG 331–334')});
 }
 if(same&&(f.rank===1||f.rank===2))return resultBase('impeded','votive-identity-conflict',L('The Mass of the occurring Office is used','La Messe de l’Office occurrent est utilisée'),L('A votive Mass of a mystery of the Lord, Our Lady, or a Saint is forbidden when a I- or II-class liturgical day occurs on which the Office is of that same mystery or person.'),{votiveClass:cls,basis:basis?.id,resultingCelebration:'mass_of_day',properSourceOverride:calendarPath(),sources:rubricalSources('RG 317')});
 let permitted=false;
 if(cls===1)permitted=slot==null;
 else if(cls===2)permitted=f.rank!=null&&f.rank>=2;
 else if(cls===3)permitted=f.rank!=null&&f.rank>=3;
 else permitted=f.rank===4;
 if(f.rank==null)return resultBase('permittedWithChanges','rank-unresolved',L('Calendar class must be verified','La classe du jour doit être vérifiée'),L('The 1960 rule is known, but the calendar day did not expose a usable I–IV class value.'),{votiveClass:cls,basis:basis?.id,sources:rubricalSources(basis?.source)});
 if(!permitted){
  if((cls===1||cls===2)&&f.rank===1&&!isTopThreeOrAllSouls(f))return resultBase('permittedWithChanges',`votive-${cls}-collect-retained`,L('Votive Mass impeded · its prayer is retained','Messe votive empêchée · sa collecte est conservée'),L('The votive Mass itself cannot replace today’s I-class Mass, but the prayer of the impeded I- or II-class votive Mass is added under one conclusion with the prayer of the Mass of the day.'),{votiveClass:cls,basis:basis?.id,resultingCelebration:'mass_of_day',properSourceOverride:calendarPath(),additions:[L('Prayer of the impeded votive Mass under one conclusion','Collecte de la Messe votive empêchée sous une seule conclusion')],sources:rubricalSources('RG 318',cls===1?'RG 330c':'RG 343c')});
  return resultBase('impeded',`votive-${cls}-impeded`,L(`Votive Mass ${['','I','II','III','IV'][cls]} class impeded today`,`Messe votive de ${['','Ie','IIe','IIIe','IVe'][cls]} classe empêchée aujourd’hui`),cls===1?L('A votive Mass I class is not permitted on liturgical days numbered 1–8 in the table of precedence.','Une Messe votive de Ie classe n’est pas permise les jours liturgiques numérotés 1 à 8 dans la table de préséance.'):L(`A votive Mass ${['','I','II','III','IV'][cls]} class may be celebrated only on liturgical days of the class allowed by the 1960 rubrics. Today is ${f.day.rank||'unresolved'}.`,`Une Messe votive de ${['','Ie','IIe','IIIe','IVe'][cls]} classe ne peut être célébrée que les jours admis par les rubriques de 1960. Aujourd’hui est ${f.day.rank||'non résolu'}.`),{votiveClass:cls,basis:basis?.id,transferable:false,sources:rubricalSources(basis?.source,cls===1?'RG 328–330':cls===2?'RG 341–343':cls===3?'RG 384–386':'RG 387–389')});
 }
 if(id==='saturday_bvm'&&!f.isSaturday)return resultBase('impeded','saturday-bvm-not-saturday',L('Saturday Mass of Our Lady requires Saturday','La Messe de Notre-Dame du samedi requiert un samedi'),L('This conceptual formulary is exposed as the traditional Saturday votive Mass of Our Lady; choose it on a Saturday.'),{votiveClass:cls,basis:basis?.id,sources:rubricalSources('RG 78–79, 389a')});
 const gloria=cls===1?true:cls===2?String(def?.colour||'').toLowerCase()!=='violet':cls===3?true:(id==='angels'||(id==='saturday_bvm'&&f.isSaturday));
 const credo=cls===1?true:cls===2?(f.isSunday||isOctaveDay(f)):false;
 const tone=ARCH.celebrationForm==='sung'?(cls===4?'ferial':'solemn'):null;
 const conditions=[];const additions=[];
 if(cls===4)conditions.push(L('A just cause (necessity, benefit or devotion) is required.','Une juste cause (nécessité, utilité ou dévotion) est requise.'));
 if(['grave_public','special_occasion'].includes(basis?.id))conditions.push(L('The required order or permission of the competent Ordinary must actually exist.','L’ordre ou la permission requis de l’Ordinaire compétent doit réellement exister.'));
 if(basis?.id==='sanctuary')conditions.push(L('The sanctuary/pilgrimage conditions of RG 373–377 must actually be met.','Les conditions de sanctuaire/pèlerinage des RG 373–377 doivent réellement être remplies.'));
 if(same&&(f.rank===3||f.rank===4))additions.push(L('The Office of the day is not commemorated in this votive Mass.','L’Office du jour n’est pas commémoré dans cette Messe votive.'));
 return resultBase('permitted','votive-permitted',L('Permitted today','Permise aujourd’hui'),L(`The selected rubrical basis makes this a votive Mass ${['','I','II','III','IV'][cls]} class, and today’s ${f.day.rank||''} day admits that class.`,`La base rubricale choisie en fait une Messe votive de ${['','Ie','IIe','IIIe','IVe'][cls]} classe, et le jour d’aujourd’hui (${f.day.rank||''}) admet cette classe.`),{votiveClass:cls,basis:basis?.id,gloria,credo,tone,conditions,additions,sources:rubricalSources(basis?.source,'RG 317–324',cls===1?'RG 328–330':cls===2?'RG 341–343':cls===3?'RG 384–386':'RG 387–389')});
}
function resolveVotive(def,f=dayFacts()){
 const block=genericVotiveBlock(f);if(block)return block;
 const basis=currentVotiveBasis(def,f);if(!basis)return resultBase('prohibited','no-votive-basis',L('No rubrical basis is available','Aucune base rubricale n’est disponible'),L('This formulary is not exposed without a defined 1960-rubric basis.'),{sources:[]});
 return applyVotiveClass(def,basis,f);
}
function resolveNuptial(def,f=dayFacts()){
 const c=ARCH.rubricContext;
 if(c.mixedMarriage)return resultBase('prohibited','nuptial-mixed-marriage',L('Nuptial Mass and blessing prohibited by the 1960 rubric','Messe et bénédiction nuptiales interdites par la rubrique de 1960'),L('The 1960 General Rubrics list a mixed marriage among the circumstances in which the special Nuptial Mass and Nuptial Blessing are absolutely forbidden. This is a historical liturgical rule, not a statement of present marriage law.'),{votiveClass:2,transferable:false,sources:rubricalSources('RG 381')});
 if(!c.couplePresent)return resultBase('prohibited','nuptial-couple-absent',L('Nuptial blessing cannot be given','La bénédiction nuptiale ne peut être donnée'),L('The Nuptial Blessing is omitted when the bridal couple are not present; the special Nuptial Mass cannot be celebrated when the blessing cannot be given.'),{votiveClass:2,transferable:true,sources:rubricalSources('RG 379–381c')});
 if(c.bridePreviouslyBlessed)return resultBase('prohibited','nuptial-bride-prior-blessing',L('Nuptial blessing not repeated','La bénédiction nuptiale n’est pas répétée'),L('Under the 1960 rubric the Nuptial Blessing is omitted if the bride has already received it; consequently the special Nuptial Mass cannot be celebrated.'),{votiveClass:2,sources:rubricalSources('RG 379, 381c')});
 if(c.groomPreviouslyBlessed&&!c.groomOnlyCustomAllowsBlessing)return resultBase('permittedWithChanges','nuptial-groom-prior-custom-check',L('Local custom must be verified','La coutume locale doit être vérifiée'),L('The rubric preserves a custom, where it exists, of imparting the Nuptial Blessing when only the man has previously received it. Until that local custom is confirmed, Ad Orientem does not assume the blessing may be repeated.'),{votiveClass:2,conditions:[L('Confirm whether the local custom mentioned in RG 381c applies.','Vérifiez si la coutume locale mentionnée au RG 381c s’applique.')],sources:rubricalSources('RG 381c')});
 if(isAllSouls(f)||isTriduum(f))return resultBase('prohibited','nuptial-absolute-prohibition',L('Nuptial Mass and blessing prohibited','Messe et bénédiction nuptiales interdites'),L('On All Souls’ Day and the last three days of Holy Week, the Nuptial Mass, its commemoration in the Mass of the day, and the Nuptial Blessing are all forbidden.'),{votiveClass:2,transferable:true,sources:rubricalSources('RG 381d')});
 if(isTempusClausum(f)&&!c.closedTimePermission)return resultBase('prohibited','nuptial-closed-time',L('Nuptial Mass and blessing require permission in the closed season','La Messe et la bénédiction nuptiales exigent une permission pendant le temps clos'),L('From the first Sunday of Advent through Christmas Day, and from Ash Wednesday through Easter Sunday, the Nuptial Mass and solemn blessing require permission of the local Ordinary for a just cause; the last three days of Holy Week remain absolutely excluded.'),{votiveClass:2,transferable:true,sources:rubricalSources('RG 378–381')});
 if(f.isSunday||f.rank===1)return resultBase('permittedWithChanges','nuptial-mass-of-day',L('Mass of the Day + Nuptial rites','Messe du jour + rites nuptiaux'),L('The special Nuptial votive Mass is impeded, but the Nuptial Blessing is not. The Mass of the Office is celebrated; the Nuptial collect is added under one conclusion and the blessing is given during Mass.'),{votiveClass:2,resultingCelebration:'mass_of_day',properSourceOverride:calendarPath(),additions:[L('Nuptial collect under one conclusion with the Collect of the day','Collecte nuptiale sous une seule conclusion avec la Collecte du jour'),L('Nuptial Blessing during Mass in the places prescribed by the Missal','Bénédiction nuptiale pendant la Messe aux endroits prescrits par le Missel')],sources:rubricalSources('RG 341, 378–381')});
 if(f.rank!=null&&f.rank>=2)return resultBase('permitted','nuptial-permitted',L('Nuptial Mass permitted','Messe nuptiale permise'),L('The Mass “For Bride and Bridegroom” is a votive Mass II class and is permitted today; the Nuptial Blessing is given within the Mass.'),{votiveClass:2,resultingCelebration:'nuptial',gloria:true,credo:isChristmasOctave(f),additions:[L('Nuptial Blessing within Mass','Bénédiction nuptiale dans la Messe')],conditions:c.groomPreviouslyBlessed?[L('The preserved local custom allowing the blessing when only the groom has previously received it has been affirmed.','La coutume locale conservée permettant la bénédiction lorsque seul l’époux l’a déjà reçue a été confirmée.')]:[],sources:rubricalSources('RG 341, 378–381')});
 return resultBase('permittedWithChanges','nuptial-rank-unresolved',L('Calendar class must be verified','La classe du jour doit être vérifiée'),L('The Nuptial rules are known, but the day’s I–IV class could not be read reliably.'),{votiveClass:2,sources:rubricalSources('RG 341, 378–381')});
}
function generalRequiemBlock(f=dayFacts()){
 const c=ARCH.rubricContext;
 if(c.exposition&&!isAllSouls(f))return resultBase('prohibited','requiem-exposition',L('Requiem prohibited during exposition','Requiem interdit pendant l’exposition'),L('Any Mass of the Dead is forbidden in a church or oratory for the whole time the Blessed Sacrament is exposed, except the Masses of All Souls.’'),{sources:rubricalSources('RG 393a')});
 if(c.conventualConflict)return resultBase('prohibited','requiem-conventual-conflict',L('Requiem prohibited at this Mass','Requiem interdit à cette Messe'),L('In a church having only one Mass, a Mass of the Dead is forbidden when a binding conventual Mass cannot be fulfilled by another priest, unless that conventual Mass itself may or must be for the Dead.'),{sources:rubricalSources('RG 393b')});
 if(c.onlyMassWithCandleBlessing&&isCandlemas(f))return resultBase('prohibited','requiem-candlemas-only-mass',L('Requiem prohibited at the only Mass','Requiem interdit à la Messe unique'),L('On 2 February, if this is the church’s only Mass and the blessing of candles takes place, a Mass of the Dead is forbidden.'),{sources:rubricalSources('RG 393c')});
 if(c.onlyMassWithAshes&&isAshWednesday(f))return resultBase('prohibited','requiem-ashes-only-mass',L('Requiem prohibited at the only Mass','Requiem interdit à la Messe unique'),L('On Ash Wednesday, if this is the church’s only Mass and the blessing/imposition of ashes takes place, a Mass of the Dead is forbidden.'),{sources:rubricalSources('RG 393c')});
 if(c.rogationMassRequired)return resultBase('prohibited','requiem-rogation-required',L('Rogation Mass takes precedence','La Messe des Rogations a préséance'),L('Where the Rogation Mass must be said with the Greater or Lesser Litanies in a church having only one Mass, a Mass of the Dead is forbidden.'),{sources:rubricalSources('RG 393c')});
 return null;
}
function resolveRequiem(def,f=dayFacts()){
 const block=generalRequiemBlock(f);if(block)return block;
 const c=ARCH.requiemCircumstance||ARCH.actualCelebration.circumstance||'ordinary';
 if(isAllSouls(f)&&c==='funeral')return resultBase('permittedWithChanges','funeral-all-souls',L('Funeral Mass permitted using the All Souls formulary','Messe de funérailles permise avec le formulaire de la Commémoration des fidèles défunts'),L('On All Souls’ Day a Funeral Mass uses the first Mass of the day with the appropriate prayers for the deceased; if the first Mass is already used for the Office, the second, or as a last resort the third, is used.'),{requiemClass:1,resultingCelebration:'mass_of_day',properSourceOverride:calendarPath(),sequenceDiesIrae:'required',additions:[L('Appropriate Funeral-Mass prayers for the deceased','Oraisons propres de la Messe de funérailles pour le défunt'),L('Absolution over the body or catafalque after Mass','Absoute sur le corps ou le catafalque après la Messe')],sources:rubricalSources('RG 402–409')});
 if(isAllSouls(f))return resultBase('permittedWithChanges','requiem-all-souls-calendar',L('Use the calendar Mass of All Souls','Utilisez la Messe du calendrier de la Commémoration des fidèles défunts'),L('All Souls is itself a I-class liturgical day with its own three Mass formularies. Generic Requiem selection is replaced by the Mass of the Day.'),{requiemClass:1,resultingCelebration:'mass_of_day',properSourceOverride:calendarPath(),sources:rubricalSources('RG 402–404')});
 if(c==='funeral'){
  const universal=funeralUniversalBlock(f);if(universal)return resultBase('impeded','funeral-universal-impediment',L('Funeral Mass impeded today','Messe de funérailles empêchée aujourd’hui'),L('The day belongs to one of the universal categories on which the 1960 rubrics prohibit the Funeral Mass. It may be transferred to the nearest unimpeded day.'),{requiemClass:1,transferable:true,sources:rubricalSources('RG 405–409',universal)});
  if(ARCH.rubricContext.holyDayOfObligation||ARCH.rubricContext.localFuneralImpediment)return resultBase('impeded','funeral-local-impediment',L('Funeral Mass impeded by a local/particular rule','Messe de funérailles empêchée par une règle locale/particulière'),L('The Funeral Mass is also forbidden on the specified holydays of obligation and on certain local dedication, titular, patronal, founder or religious-order feasts.'),{requiemClass:1,transferable:true,sources:rubricalSources('RG 406b–e')});
  const conditions=[];if(f.rank===1)conditions.push(L('Because this is a I-class day not automatically covered by the universal blockers, confirm that it is not a local holy day of obligation or one of the particular feasts listed in RG 406.','Comme il s’agit d’un jour de Ie classe non couvert automatiquement par les empêchements universels, vérifiez qu’il ne s’agit pas d’un jour de précepte local ni d’une des fêtes particulières énumérées au RG 406.'));
  return resultBase(conditions.length?'permittedWithChanges':'permitted','funeral-permitted',conditions.length?L('Generally permitted · local check required','Généralement permise · vérification locale requise'):L('Funeral Mass permitted','Messe de funérailles permise'),L('The Funeral Mass is a Mass of the Dead I class directly connected with the obsequies; no universal impediment has been detected for this day.'),{requiemClass:1,conditions,sequenceDiesIrae:'required',additions:[L('Absolution over the body or catafalque after Mass','Absoute sur le corps ou le catafalque après la Messe')],sources:rubricalSources('RG 399–401, 402, 405–409')});
 }
 if(['death','news','burial'].includes(c)){
  if(f.isSunday||f.rank===1)return resultBase('impeded','requiem-ii-impeded',L('II-class Requiem impeded today','Requiem de IIe classe empêché aujourd’hui'),L('A Mass on the day of death, after news of death, or for final interment is a Mass of the Dead II class and is not allowed on any Sunday or a liturgical day I class.'),{requiemClass:2,transferable:c==='news',sources:rubricalSources('RG 410–414')});
  return resultBase('permitted','requiem-ii-permitted',L('II-class Requiem permitted','Requiem de IIe classe permis'),L('The selected circumstance is a Mass of the Dead II class and today is neither a Sunday nor a I-class liturgical day.'),{requiemClass:2,sequenceDiesIrae:'optional',conditions:[L('The Mass must be applied for the deceased person.','La Messe doit être appliquée pour la personne défunte.')],sources:rubricalSources('RG 410–414')});
 }
 if(['days','anniversary','cemetery','all_souls_octave'].includes(c)){
  if(c==='all_souls_octave'){const md=f.month*100+f.dom;if(!(md>=1102&&md<=1109))return resultBase('impeded','requiem-all-souls-octave-date',L('This privilege belongs only to the eight-day period beginning on All Souls','Ce privilège n’appartient qu’aux huit jours commençant à la Commémoration des fidèles défunts'),L('The special III-class permission applies only within the eight days from All Souls’ Day inclusive.'),{requiemClass:3,sources:rubricalSources('RG 422')});}

  if(f.rank!=null&&f.rank<=2)return resultBase('impeded','requiem-iii-impeded',L('III-class Requiem impeded today','Requiem de IIIe classe empêché aujourd’hui'),L('The selected Requiem belongs to the III-class group and is forbidden on liturgical days I and II class.'),{requiemClass:3,transferable:['days','anniversary'].includes(c),sources:rubricalSources('RG 415–422')});
  if(f.rank==null)return resultBase('permittedWithChanges','requiem-iii-rank-unresolved',L('Calendar class must be verified','La classe du jour doit être vérifiée'),L('The III-class Requiem rule is known, but the calendar class could not be read reliably.'),{requiemClass:3,sources:rubricalSources('RG 415–419')});
  return resultBase('permitted','requiem-iii-permitted',L('III-class Requiem permitted','Requiem de IIIe classe permis'),L('The selected Requiem is III class, and today is a III- or IV-class liturgical day.'),{requiemClass:3,sequenceDiesIrae:'optional',conditions:c==='cemetery'?[L('The church or chapel must meet the cemetery-place definition of RG 420 and the Mass must be applied for the dead.','L’église ou chapelle doit répondre à la définition du lieu de cimetière du RG 420 et la Messe doit être appliquée pour les défunts.')]:[],sources:rubricalSources('RG 415–422')});
 }
 if(c==='ordinary'){
  if(isFeriaIV(f)&&!isChristmasSeason(f))return resultBase('permitted','requiem-iv-permitted',L('Daily Requiem permitted','Requiem quotidien permis'),L('A IV-class “Daily” Mass of the Dead may replace the Mass of the Office only on a feria IV class outside the Christmas season, and it should in fact be applied for the dead.'),{requiemClass:4,sequenceDiesIrae:'optional',conditions:[L('The Mass should actually be applied for the dead.','La Messe doit réellement être appliquée aux défunts.')],sources:rubricalSources('RG 423')});
  return resultBase('impeded','requiem-iv-impeded',L('Daily Requiem not permitted today','Requiem quotidien non permis aujourd’hui'),L('A IV-class “Daily” Requiem is limited to ferias IV class outside the Christmas season.'),{requiemClass:4,sources:rubricalSources('RG 423')});
 }
 return resultBase('prohibited','requiem-circumstance-missing',L('Requiem circumstance required','Circonstance du Requiem requise'),L('Choose the actual occasion so the app can determine the correct Requiem class.'),{sources:rubricalSources('RG 390–423')});
}
function rubricResolve(){
 const def=actualDef(),f=dayFacts();let out;
 if(!def){out=resultBase('permitted','calendar-mass',L('Mass of the Day','Messe du jour'),L('This is the celebration resolved by the 1962 calendar.'),{resultingCelebration:'mass_of_day',properSourceOverride:calendarPath(),sources:rubricalSources('1960 General Rubrics · calendar order')});}
 else if(!actualPath()){out=resultBase('prohibited','no-source',L('No usable formulary source','Aucune source de formulaire utilisable'),L('This celebration is not exposed without a defined source resolver.'),{sources:[]});}
 else if(def.type==='votive')out=resolveVotive(def,f);
 else if(def.type==='nuptial')out=resolveNuptial(def,f);
 else if(def.type==='requiem')out=resolveRequiem(def,f);
 else out=resultBase('prohibited','unsupported-celebration-type',L('Unsupported celebration type','Type de célébration non pris en charge'),L('No rubrical resolver has been defined for this celebration type.'),{sources:[]});
 if(def?.type==='requiem'&&ARCH.requiemCircumstance)out.circumstance=ARCH.requiemCircumstance;
 ARCH.rubric=out;return out;
}
function diag(){return{requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],votiveRecoveries:[],warnings:[],errors:[]}}
async function resolveReadiness(){
 const token=++ARCH.lastResolveToken;ARCH.readiness={loading:true};ARCH.resolvedProper=null;paintOpenSheet();
 try{
  const s=core();let p=null;
  if(ARCH.actualCelebration.id==='mass_of_day'){p=s?.resolution?.proper?.status==='ready'?s.resolution.proper.data:null;if(!p)throw new Error('Calendar Proper is not ready.');}
  else {const def=actualDef(),pr=rt()?.resolver?.properResolver;if(!pr)throw new Error('Proper resolver is not ready.');const meta={name:def.title.en,nameFr:def.title.fr,rank:'supplementary',color:def.colour||'White',properId:`celebration:${ARCH.actualCelebration.id}`,path:actualPath(),profile:def.type==='requiem'?'requiem_mass_1962':'ordinary_mass_1962',gloria:false,credo:false,inherited:false};p=await pr.resolveProper(meta,diag());}
  if(token!==ARCH.lastResolveToken)return;ARCH.resolvedProper=p;const en=p?.languageCoverage?.en||null,fr=p?.languageCoverage?.fr||null;ARCH.readiness={loading:false,la:{complete:true,expected:'Latin source',available:'ready',missing:[]},en:en||{complete:false,expected:0,available:0,missing:['not audited']},fr:fr||{complete:false,expected:0,available:0,missing:['not audited']},sourcePath:p?.sourcePath||actualPath()};
 }catch(e){if(token!==ARCH.lastResolveToken)return;ARCH.readiness={loading:false,error:e instanceof Error?e.message:String(e),la:{complete:!!actualPath()},en:{complete:false,expected:0,available:0,missing:['unavailable']},fr:{complete:false,expected:0,available:0,missing:['unavailable']},sourcePath:actualPath()};}
 paintOpenSheet();augmentHome();
}
function syncFromCore(){
 const s=core();if(!s)return;const changed=ARCH.date!==s.selectedDate;ARCH.liturgicalDay=liturgicalDayObject(s);if(changed){ARCH.date=s.selectedDate;ARCH.actualCelebration={id:'mass_of_day',type:'calendar'};ARCH.requiemCircumstance=null;ARCH.votiveBasis='ordinary';ARCH.rubricContext.closedTimePermission=false;ARCH.rubricContext.mixedMarriage=false;ARCH.rubricContext.bridePreviouslyBlessed=false;ARCH.rubricContext.groomPreviouslyBlessed=false;ARCH.rubricContext.groomOnlyCustomAllowsBlessing=false;ARCH.readiness=null;ARCH.resolvedProper=null;ARCH.rubric=null;}if(!ARCH.celebrationForm)ARCH.celebrationForm=s.settings?.massForm||'sung';if(!ARCH.followMode)ARCH.followMode=s.settings?.followMode||'vox';
}
function statusClass(r){return r.status==='permitted'?'ok':r.status==='impeded'||r.status==='prohibited'?'bad':'warn'}
function readinessCell(code,obj){if(ARCH.readiness?.loading)return `<div class="aoReadyCell"><b>${code}</b><span>${L('checking…','vérification…')}</span></div>`;if(ARCH.readiness?.error&&!obj?.complete)return `<div class="aoReadyCell bad"><b>${code}</b><span>${L('unavailable','indisponible')}</span></div>`;if(!obj)return `<div class="aoReadyCell"><b>${code}</b><span>—</span></div>`;const complete=!!obj.complete,avail=obj.available,expected=obj.expected;let text=complete?L('complete','complet'):(typeof avail==='number'&&typeof expected==='number'?`${avail}/${expected}`:L('partial','partiel'));return `<div class="aoReadyCell ${complete?'good':avail?'partial':'bad'}"><b>${code}</b><span>${esc(text)}</span></div>`}
function top(title,kicker,back=true){return `<div class="aoMassFlowTop"><button ${back?'data-ao-back':''} aria-label="Back">${back?'‹':'×'}</button><div class="title"><small>${esc(kicker)}</small><b>${esc(title)}</b></div><button data-ao-close aria-label="Close">×</button></div>`}
function shell(body,title=L('Change Mass','Changer de Messe'),kicker='Ad Orientem'){return `<div class="aoMassFlowBackdrop" data-ao-backdrop><section class="aoMassFlow" role="dialog" aria-modal="true">${top(title,kicker,ARCH.history.length>0)}<div class="aoMassFlowBody">${body}</div></section></div>`}
function currentCalendarSummary(){return `<div class="aoCalendarContext"><b>${esc(L('Calendar day','Jour liturgique'))}:</b> ${esc(ARCH.liturgicalDay?.title||'')} · ${esc(String(ARCH.liturgicalDay?.rank||''))}${ARCH.liturgicalDay?.colour?` · ${esc(ARCH.liturgicalDay.colour)}`:''}</div>`}
function mainChooser(){return shell(`<p class="aoFlowLead">${L('The calendar remains the default. Choose another celebration only when it is actually being celebrated.','Le calendrier reste le choix par défaut. Choisissez une autre célébration seulement si elle est réellement célébrée.')}</p><div class="aoFlowOptions"><button class="aoFlowOption" data-ao-select-day><div><b>${L('Mass of the Day','Messe du jour')}</b><span>${esc(ARCH.liturgicalDay?.title||'')}</span></div><i>→</i></button><button class="aoFlowOption" data-ao-open="votive"><div><b>${L('Votive Mass','Messe votive')}</b><span>${L('Choose the celebration; seasonal variants are automatic.','Choisissez la célébration; les variantes saisonnières sont automatiques.')}</span></div><i>→</i></button><button class="aoFlowOption" data-ao-open="nuptial"><div><b>${L('Marriage / Nuptial Mass','Mariage / Messe nuptiale')}</b><span>Missa pro Sponso et Sponsa</span></div><i>→</i></button><button class="aoFlowOption" data-ao-open="requiem"><div><b>${L('Mass for the Dead','Messe des défunts')}</b><span>${L('Choose the occasion, not a backend file.','Choisissez la circonstance, pas un fichier technique.')}</span></div><i>→</i></button><button class="aoFlowOption" data-ao-open="other"><div><b>${L('Other special celebration','Autre célébration spéciale')}</b><span>${L('Only defined cases will be exposed.','Seuls les cas définis seront proposés.')}</span></div><i>→</i></button></div>${currentCalendarSummary()}`,L('What Mass is being celebrated?','Quelle Messe est célébrée ?'))}
function votiveChooser(){const q=(ARCH.search||'').trim().toLowerCase();let html=`<p class="aoFlowLead">${L('Choose the conceptual celebration. Ad Orientem selects seasonal source variants automatically.','Choisissez la célébration conceptuelle. Ad Orientem sélectionne automatiquement les variantes saisonnières des sources.')}</p><input class="aoFlowSearch" data-ao-search placeholder="${L('Search votive Masses','Rechercher une Messe votive')}" value="${esc(ARCH.search)}"><div class="aoVotiveGroups">`;for(const [g,labels] of Object.entries(GROUPS)){const items=Object.entries(CATALOGUE).filter(([,d])=>d.type==='votive'&&d.group===g&&(!q||(d.title.en+' '+d.title.fr).toLowerCase().includes(q)));if(!items.length)continue;html+=`<section class="aoVotiveGroup"><h3>${esc(labels[lang()])}</h3>${items.map(([id,d])=>`<button class="aoVotiveItem" data-ao-celebration="${esc(id)}"><div><b>${esc(d.title[lang()]||d.title.en)}</b><span>${esc(pathFor(d)||'')}</span></div><i>→</i></button>`).join('')}</section>`}html+='</div>';return shell(html,L('Votive Masses','Messes votives'))}
function nuptialChooser(){return shell(`<div class="aoPreflightHero"><small>${L('Marriage','Mariage')}</small><h2>Missa pro Sponso et Sponsa</h2><p>${L('The sourced supplementary Nuptial formulary is available in the v18 line. Permission and any retained nuptial blessings are resolved separately from source availability.','Le formulaire nuptial supplémentaire sourcé est disponible dans la ligne v18. La permission et les bénédictions nuptiales éventuellement conservées sont résolues séparément de la disponibilité de la source.')}</p></div>${currentCalendarSummary()}<div class="aoFlowActions"><button class="primary" data-ao-celebration="nuptial">${L("Check today's celebration","Vérifier la célébration du jour")}</button></div>`,L('Marriage / Nuptial Mass','Mariage / Messe nuptiale'))}
function requiemChooser(){return shell(`<p class="aoFlowLead">${L('What is the occasion? The circumstance is stored separately from the underlying Requiem source.','Quelle est la circonstance ? Elle est conservée séparément de la source du Requiem.')}</p><div class="aoFlowOptions">${Object.entries(REQUIEM_CIRCUMSTANCES).map(([id,x])=>`<button class="aoCircumstance" data-ao-requiem="${id}"><div><b>${esc(x[lang()])}</b><span>${id==='ordinary'?L('General Mass for the Dead','Messe générale pour les défunts'):L('Circumstance-specific rubric classification follows.','La classification rubricale selon la circonstance suit.')}</span></div><i>→</i></button>`).join('')}</div><p class="aoPrototypeNote">${L('All Souls remains part of the actual calendar resolution on 2 November rather than a generic Requiem choice.','La Commémoration des fidèles défunts demeure une résolution du calendrier le 2 novembre et non un choix générique de Requiem.')}</p>`,L('Mass for the Dead','Messe des défunts'))}
function otherChooser(){return shell(`<p class="aoFlowLead">${L('This area stays deliberately conservative until both a rubric model and a formulary source are defined.','Cette zone reste volontairement prudente jusqu’à ce qu’un modèle rubrical et une source de formulaire soient définis.')}</p><div class="aoFlowOptions"><button class="aoFlowOption disabled"><div><b>${L('External Solemnity','Solennité extérieure')}</b><span>${L('Not yet exposed · rubric model required','Pas encore proposée · modèle rubrical requis')}</span></div><i>—</i></button><button class="aoFlowOption disabled"><div><b>${L('Special public occasion','Occasion publique spéciale')}</b><span>${L('Not yet exposed · source and rules required','Pas encore proposée · source et règles requises')}</span></div><i>—</i></button></div>`,L('Other special celebration','Autre célébration spéciale'))}
function votiveBasisUI(){const def=actualDef();if(def?.type!=='votive')return '';const f=dayFacts(),opts=votiveBasisOptions(def,f),current=currentVotiveBasis(def,f);return `<div class="aoFlowSection">${L('Rubrical basis','Base rubricale')}</div><div class="aoChoiceGrid aoBasisGrid">${opts.map(o=>`<button data-ao-basis="${esc(o.id)}" class="${current?.id===o.id?'active':''}"><b>${esc(o.label)}</b><small>${esc(o.note)}</small></button>`).join('')}</div><p class="aoPrototypeNote">${L('Choose the basis that describes the Mass actually being celebrated. Ad Orientem does not manufacture the required permission, public cause, pilgrimage status or devotional exercises.','Choisissez la base qui décrit la Messe réellement célébrée. Ad Orientem ne crée pas la permission, le motif public, le statut de pèlerinage ni les exercices de dévotion requis.')}</p>`}
function toggleRow(key,label,note){const on=!!ARCH.rubricContext[key];return `<button class="aoConditionToggle ${on?'active':''}" data-ao-condition="${esc(key)}"><span><b>${esc(label)}</b><small>${esc(note||'')}</small></span><i>${on?'✓':'○'}</i></button>`}
function nuptialContextUI(){if(actualDef()?.type!=='nuptial')return '';const f=dayFacts(),c=ARCH.rubricContext;return `<details class="aoWhyRubric aoConditions" open><summary>${L('Marriage conditions','Conditions du mariage')}</summary><div class="aoConditionGrid">${toggleRow('couplePresent',L('Bride and bridegroom are present','Les époux sont présents'),L('Required for the Nuptial Blessing.','Requis pour la bénédiction nuptiale.'))}${toggleRow('mixedMarriage',L('Mixed marriage under the 1960 rubric','Mariage mixte selon la rubrique de 1960'),L('Historical liturgical condition; this does not describe present canonical marriage law.','Condition liturgique historique; ceci ne décrit pas le droit matrimonial canonique actuel.'))}${toggleRow('bridePreviouslyBlessed',L('Bride has previously received the Nuptial Blessing','L’épouse a déjà reçu la bénédiction nuptiale'),L('The 1960 rubric omits the blessing in this case.','La rubrique de 1960 omet la bénédiction dans ce cas.'))}${toggleRow('groomPreviouslyBlessed',L('Groom only has previously received the Nuptial Blessing','Seul l’époux a déjà reçu la bénédiction nuptiale'),L('A local custom may permit the blessing to be given again.','Une coutume locale peut permettre de redonner la bénédiction.'))}${c.groomPreviouslyBlessed?toggleRow('groomOnlyCustomAllowsBlessing',L('The local custom allowing the groom-only case applies','La coutume locale permettant le cas de l’époux seul s’applique'),L('Affirm only when this local custom is known to apply.','N’affirmez que si cette coutume locale est connue comme applicable.')):''}${isTempusClausum(f)?toggleRow('closedTimePermission',L('Local Ordinary has permitted the solemn blessing during the closed season','L’Ordinaire du lieu a permis la bénédiction solennelle pendant le temps clos'),L('Necessary in tempus clausum, apart from days of absolute prohibition.','Nécessaire pendant le tempus clausum, sauf les jours d’interdiction absolue.')):''}</div></details>`}
function requiemContextUI(){if(actualDef()?.type!=='requiem')return '';const c=ARCH.requiemCircumstance;return `<details class="aoWhyRubric aoConditions"><summary>${L('Local conditions that can impede a Requiem','Conditions locales pouvant empêcher un Requiem')}</summary><div class="aoConditionGrid">${toggleRow('exposition',L('Blessed Sacrament is exposed in this church/oratory','Le Saint-Sacrement est exposé dans cette église/oratoire'),L('General prohibition during exposition, except All Souls.','Interdiction générale pendant l’exposition, sauf le 2 novembre.'))}${toggleRow('conventualConflict',L('Only Mass / binding conventual Mass conflict','Conflit Messe unique / obligation conventuelle'),L('Relevant where the required conventual Mass cannot be fulfilled by another priest.','Pertinent lorsque la Messe conventuelle requise ne peut être acquittée par un autre prêtre.'))}${isCandlemas()?toggleRow('onlyMassWithCandleBlessing',L('This is the only Mass and the candles are blessed','C’est la Messe unique et les cierges sont bénis'),'RG 393c'):''}${isAshWednesday()?toggleRow('onlyMassWithAshes',L('This is the only Mass and ashes are blessed/imposed','C’est la Messe unique et les cendres sont bénies/imposées'),'RG 393c'):''}${toggleRow('rogationMassRequired',L('The Rogation Mass is required at this Mass','La Messe des Rogations est requise à cette Messe'),'RG 393c')}${c==='funeral'?toggleRow('holyDayOfObligation',L('Today is a holy day of obligation relevant to RG 406b','Aujourd’hui est un jour de précepte visé au RG 406b'),L('Obligation status can depend on the place.','Le statut de précepte peut dépendre du lieu.')):''}${c==='funeral'?toggleRow('localFuneralImpediment',L('Local dedication / titular / principal patron / founder impediment applies','Un empêchement local de dédicace / titulaire / patron principal / fondateur s’applique'),L('Use for the particular-calendar cases listed in RG 406c–e.','À utiliser pour les cas du calendrier particulier énumérés au RG 406c–e.')):''}</div></details>`}
function rubricEffectsUI(r){const bits=[];if(r.votiveClass)bits.push(`${L('Votive class','Classe votive')}: ${['','I','II','III','IV'][r.votiveClass]}`);if(r.requiemClass)bits.push(`${L('Requiem class','Classe du Requiem')}: ${['','I','II','III','IV'][r.requiemClass]}`);if(typeof r.gloria==='boolean')bits.push(`Gloria: ${r.gloria?L('yes','oui'):L('no','non')}`);if(typeof r.credo==='boolean')bits.push(`Credo: ${r.credo?L('yes','oui'):L('no','non')}`);if(r.tone)bits.push(`${L('Sung tone','Ton chanté')}: ${r.tone==='solemn'?L('solemn','solennel'):L('ferial','férial')}`);if(r.sequenceDiesIrae)bits.push(`Dies iræ: ${r.sequenceDiesIrae==='required'?L('required','requis'):L('may be omitted','peut être omis')}`);if(r.resultingCelebration==='mass_of_day'&&ARCH.actualCelebration.id!=='mass_of_day')bits.push(L('Result: Mass of the Day with the listed additions','Résultat : Messe du jour avec les ajouts indiqués'));if(!bits.length&&!r.conditions?.length&&!r.additions?.length)return '';return `<div class="aoRubricEffects">${bits.length?`<div class="aoEffectChips">${bits.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}${r.additions?.length?`<div class="aoEffectList"><b>${L('Inserted / retained rites','Rites insérés / conservés')}</b><ul>${r.additions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}${r.conditions?.length?`<div class="aoEffectList"><b>${L('Conditions','Conditions')}</b><ul>${r.conditions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}</div>`}
function preflight(){const def=actualDef(),r=rubricResolve(),circ=ARCH.requiemCircumstance?REQUIEM_CIRCUMSTANCES[ARCH.requiemCircumstance]?.[lang()]:null;const typeLabel=def?.type==='votive'?L('Votive Mass','Messe votive'):def?.type==='nuptial'?L('Nuptial Mass','Messe nuptiale'):def?.type==='requiem'?L('Requiem','Requiem'):L('Mass of the Day','Messe du jour');const sourceText=(r.sources||[]).join(' · ');const reasonDetails=`<b>${L('Today','Aujourd’hui')}:</b> ${esc(ARCH.liturgicalDay?.title||'')} · ${esc(String(ARCH.liturgicalDay?.rank||''))}<br><b>${L('Requested','Demandée')}:</b> ${esc(actualTitle())}${circ?` · ${esc(circ)}`:''}<br><b>${L('Decision','Décision')}:</b> ${esc(r.reason)}${sourceText?`<br><b>${L('Rubrical basis','Base rubricale')}:</b> ${esc(sourceText)}`:''}<code>${esc(r.code)}</code>`;return shell(`<div class="aoPreflightHero"><small>${esc(typeLabel)}</small><h2>${esc(actualTitle())}</h2><p>${esc(actualPath()||'')}</p></div>${ARCH.actualCelebration.id!=='mass_of_day'?currentCalendarSummary():''}${votiveBasisUI()}${nuptialContextUI()}${requiemContextUI()}<div class="aoRubricStatus ${statusClass(r)}"><div>${r.status==='permitted'?'✓':r.status==='impeded'||r.status==='prohibited'?'!':'◐'}</div><div><strong>${esc(r.summary)}</strong><p>${esc(r.reason)}</p></div></div>${rubricEffectsUI(r)}<details class="aoWhyRubric"><summary>${L('Why? · Rubrical resolver details','Pourquoi ? · Détails du résolveur rubrical')}</summary><div>${reasonDetails}</div></details><div class="aoFlowSection">${L('How is Mass celebrated?','Comment la Messe est-elle célébrée ?')}</div><div class="aoChoiceGrid"><button data-ao-form="sung" class="${ARCH.celebrationForm==='sung'?'active':''}"><b>${L('Sung Mass','Messe chantée')}</b><small>${L('Ceremonial form for this session','Forme cérémonielle pour cette session')}</small></button><button data-ao-form="low" class="${ARCH.celebrationForm==='low'?'active':''}"><b>${L('Low Mass','Messe basse')}</b><small>${L('Ceremonial form for this session','Forme cérémonielle pour cette session')}</small></button></div><div class="aoFlowSection">${L('How do you want to follow?','Comment voulez-vous suivre ?')}</div><div class="aoChoiceGrid"><button data-ao-follow="vox" class="${ARCH.followMode==='vox'?'active':''}"><b>VOX</b><small>${L('Follow what is heard','Suivre ce qui est entendu')}</small></button><button data-ao-follow="missal" class="${ARCH.followMode==='missal'?'active':''}"><b>${L('Missal','Missel')}</b><small>${L('Complete liturgical action','Action liturgique complète')}</small></button></div><div class="aoFlowSection">${L('Content readiness','Disponibilité du contenu')}</div>${ARCH.readiness?.loading?`<div class="aoFlowLoading">${L('Resolving the selected formulary…','Résolution du formulaire sélectionné…')}</div>`:`<div class="aoReadiness">${readinessCell('LA',ARCH.readiness?.la)}${readinessCell('EN',ARCH.readiness?.en)}${readinessCell('FR',ARCH.readiness?.fr)}</div>`}${ARCH.readiness?.error?`<p class="aoPrototypeNote">${esc(ARCH.readiness.error)}</p>`:''}<div class="aoFlowActions"><button data-ao-save-defaults>${L('Save Sung/Low + VOX/Missal as defaults','Enregistrer Chantée/Basse + VOX/Missel comme valeurs par défaut')}</button><button data-ao-details>${L('Mass Details','Détails de la Messe')}</button><button class="primary" disabled>${L('Live sequence wiring intentionally deferred','Raccordement à la séquence en direct volontairement différé')}</button></div><p class="aoPrototypeNote">${L('Rubrical Resolver v2: the selection is now classified under the 1960 General Rubrics before it reaches the live sequence. Local permissions and church-specific circumstances are explicit inputs rather than guessed by the app.','Résolveur rubrical v2 : la sélection est maintenant classée selon les Rubriques générales de 1960 avant d’atteindre la séquence en direct. Les permissions locales et circonstances propres à l’église sont des entrées explicites et non des suppositions de l’application.')}</p><div class="aoArchitectureState"><b>ResolvedMass draft</b><br>calendarDay = ${esc(ARCH.liturgicalDay?.title||'')}<br>celebrationId = ${esc(ARCH.actualCelebration.id)}<br>celebrationType = ${esc(actualType())}<br>requestedSource = ${esc(actualPath()||'')}<br>resultingCelebration = ${esc(r.resultingCelebration||ARCH.actualCelebration.id)}<br>form = ${esc(ARCH.celebrationForm)}<br>followMode = ${esc(ARCH.followMode)}<br>rubric = ${esc(r.status)}${r.votiveClass?`<br>votiveClass = ${esc(r.votiveClass)}`:''}${r.requiemClass?`<br>requiemClass = ${esc(r.requiemClass)}`:''}</div>`,L('Mass preflight','Préparation de la Messe'))}
function localized(v){if(!v)return '';if(typeof v==='string')return v;return (lang()==='fr'?v.fr:v.en)||v.lat||''}
function effectiveCelebrationView(){
 const r=rubricResolve();
 const requested=ARCH.actualCelebration.id!=='mass_of_day';
 const fallsBack=requested&&r?.resultingCelebration==='mass_of_day';
 const blocked=requested&&['impeded','prohibited'].includes(r?.status);
 const calendar=ARCH.actualCelebration.id==='mass_of_day'||fallsBack||blocked;
 return {
  decision:r,
  calendar,
  title:calendar?calendarTitle():actualTitle(),
  path:calendar?calendarPath():actualPath(),
  type:calendar?'calendar':actualType(),
  requestedTitle:requested?actualTitle():null,
  requestedPath:requested?actualPath():null,
  requested,
  fallsBack,
  blocked
 };
}
function details(){
 const v=effectiveCelebrationView(),r=v.decision;
 const cal=core()?.resolution?.proper?.status==='ready'?core().resolution.proper.data:null;
 const p=v.calendar?cal:ARCH.resolvedProper;
 const fields=[[L('Introit','Introït'),p?.introit],[L('Collect','Collecte'),p?.collects?.[0]],[L('Epistle / Lesson','Épître / Leçon'),p?.epistle],[L('Gospel','Évangile'),p?.gospel],[L('Offertory','Offertoire'),p?.offertory],[L('Communion','Communion'),p?.communion]];
 const requestedNote=v.requested&&v.calendar?`<div class="aoCalendarContext"><b>${L('Requested celebration','Célébration demandée')}:</b> ${esc(v.requestedTitle||'')} · ${esc(v.requestedPath||'')}<br><b>${L('Resolved result','Résultat résolu')}:</b> ${esc(r?.summary||L('Mass of the Day','Messe du jour'))}</div>`:'';
 const additions=(r?.additions||[]).length?`<div class="aoEffectList"><b>${L('Inserted / retained rites','Rites insérés / conservés')}</b><ul>${r.additions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:'';
 return shell(`<div class="aoPreflightHero"><small>${L('Mass Details','Détails de la Messe')}</small><h2>${esc(v.title)}</h2><p>${esc(v.path||'')}</p></div>${requestedNote}${additions}<div class="aoFlowSection">${L('Resolved formulary','Formulaire résolu')}</div>${!p?`<div class="aoFlowLoading">${L('The resolved formulary is not ready yet.','Le formulaire résolu n’est pas encore prêt.')}</div>`:`<div class="aoDetailsGrid">${fields.map(([label,val])=>`<article><b>${esc(label)}</b><p>${esc(localized(val)||L('Unavailable in the current language.','Indisponible dans la langue actuelle.'))}</p></article>`).join('')}</div>`}<div class="aoFlowActions"><button data-ao-preflight>${L('Back to preflight','Retour à la préparation')}</button>${v.requested&&!v.calendar?`<button data-ao-calendar-mass>${L('Calendar Mass','Messe du calendrier')} · ${esc(ARCH.liturgicalDay?.title||'')}</button>`:''}</div>`,L('Mass Details','Détails de la Messe'))
}
function closeSheet(){
 const host=document.getElementById('ao-mass-flow-v1');if(host)host.remove();ARCH.stage=null;ARCH.history=[];
}
function stageMarkup(){
 switch(ARCH.stage){
  case 'main':return mainChooser();
  case 'votive':return votiveChooser();
  case 'nuptial':return nuptialChooser();
  case 'requiem':return requiemChooser();
  case 'other':return otherChooser();
  case 'preflight':return preflight();
  case 'details':return details();
  default:return '';
 }
}
function paintOpenSheet(){
 if(!ARCH.stage){document.getElementById('ao-mass-flow-v1')?.remove();return}
 let host=document.getElementById('ao-mass-flow-v1');
 if(!host){host=document.createElement('div');host.id='ao-mass-flow-v1';document.body.appendChild(host)}
 const html=stageMarkup();if(host.innerHTML!==html)host.innerHTML=html;
 queueMicrotask(()=>window.AO_SEQUENCE_BRIDGE_V23?.decorate?.());
}
function openStage(stage){
 if(!['main','votive','nuptial','requiem','other','preflight','details'].includes(stage))return;
 if(ARCH.stage)ARCH.history.push(ARCH.stage);ARCH.stage=stage;paintOpenSheet();
}
function goBack(){
 const prev=ARCH.history.pop();if(prev){ARCH.stage=prev;paintOpenSheet()}else closeSheet();
}
function resetSelectionState(){
 ARCH.readiness=null;ARCH.resolvedProper=null;ARCH.rubric=null;ARCH.lastResolveToken++;
}
function selectMassOfDay(){
 syncFromCore();ARCH.actualCelebration={id:'mass_of_day',type:'calendar'};ARCH.requiemCircumstance=null;ARCH.votiveBasis='ordinary';resetSelectionState();ARCH.history=[];ARCH.stage='preflight';rubricResolve();paintOpenSheet();void resolveReadiness();augmentHome();
}
function selectCelebration(id,options={}){
 const def=CATALOGUE[id];if(!def)return;
 syncFromCore();ARCH.actualCelebration={id,type:def.type};ARCH.requiemCircumstance=def.type==='requiem'?(options.circumstance||ARCH.requiemCircumstance||'ordinary'):null;ARCH.votiveBasis='ordinary';resetSelectionState();ARCH.history=[];ARCH.stage='preflight';rubricResolve();paintOpenSheet();void resolveReadiness();augmentHome();
}
function openMassDetails(){syncFromCore();ARCH.stage='details';ARCH.history=[];if(!ARCH.readiness)resolveReadiness();paintOpenSheet()}
function augmentHome(){
 syncFromCore();const s=core(),home=document.querySelector('.homeScreen');if(!home||s?.route!=='home')return;
 const v=effectiveCelebrationView(),r=v.decision;
 let ctl=home.querySelector('.aoCelebrationControl');if(!ctl){ctl=document.createElement('section');ctl.className='aoCelebrationControl';const block=home.querySelector('.celebrationBlock');block?.insertAdjacentElement('afterend',ctl)}
 if(ctl){
  let kicker=L('Mass selection','Choix de la Messe'),body=L('The calendar Mass is selected by default.','La Messe du calendrier est sélectionnée par défaut.'),extra='';
  if(v.requested&&!v.calendar){kicker=L('Actual celebration','Célébration actuelle');body=`${esc(actualType())} · ${esc(actualPath()||'')}`;extra=`<p class="aoAltCalendar"><b>${L('Calendar day','Jour liturgique')}:</b> ${esc(ARCH.liturgicalDay?.title||'')}</p>`}
  else if(v.requested&&v.fallsBack){kicker=L('Resolved celebration','Célébration résolue');body=esc(r?.summary||L('Mass of the Day','Messe du jour'));extra=`<p class="aoAltCalendar"><b>${L('Requested','Demandée')}:</b> ${esc(v.requestedTitle||'')}<br><b>${L('Result','Résultat')}:</b> ${esc(v.title)}</p>`}
  else if(v.requested&&v.blocked){kicker=L('Requested Mass unavailable','Messe demandée indisponible');body=esc(r?.summary||L('Mass of the Day remains in force.','La Messe du jour demeure en vigueur.'));extra=`<p class="aoAltCalendar"><b>${L('Calendar Mass','Messe du calendrier')}:</b> ${esc(v.title)}</p>`}
  ctl.innerHTML=`<div class="copy"><small>${kicker}</small><b>${esc(v.title)}</b><p>${body}</p>${extra}</div><button data-ao-change-mass>${L('Change Mass','Changer de Messe')}</button>`
 }
 const card=home.querySelector('.massCard');if(card){const k=card.querySelector('.cardKicker'),p=card.querySelector('p');if(k)k.textContent=L('Mass Details','Détails de la Messe');if(p)p.textContent=`${v.title} · ${L('Propers, readings, liturgical information','Propres, lectures, informations liturgiques')}`}
}
function install(){const r=rt();if(!r?.store){setTimeout(install,80);return}syncFromCore();ARCH.celebrationForm=r.store.getState().settings?.massForm||'sung';ARCH.followMode=r.store.getState().settings?.followMode||'vox';r.store.subscribe(()=>{syncFromCore();queueMicrotask(augmentHome)});augmentHome();window.addEventListener('pageshow',()=>queueMicrotask(augmentHome),{passive:true});}
document.addEventListener('click',e=>{const t=e.target?.closest?.('button');if(!t)return;if(t.dataset.aoChangeMass!==undefined){e.preventDefault();e.stopImmediatePropagation();syncFromCore();ARCH.stage='main';ARCH.history=[];paintOpenSheet();return}if(t.closest?.('.massCard')&&t.dataset.action==='today-mass'){e.preventDefault();e.stopImmediatePropagation();openMassDetails();return}if(t.dataset.action==='follow'&&t.closest?.('.phaseActions')){e.preventDefault();e.stopImmediatePropagation();syncFromCore();ARCH.stage='preflight';ARCH.history=[];if(!ARCH.readiness)resolveReadiness();paintOpenSheet();return}if(t.dataset.aoClose!==undefined){closeSheet();return}if(t.dataset.aoBack!==undefined){goBack();return}if(t.dataset.aoOpen){openStage(t.dataset.aoOpen);return}if(t.dataset.aoSelectDay!==undefined){selectMassOfDay();return}if(t.dataset.aoCelebration){selectCelebration(t.dataset.aoCelebration);return}if(t.dataset.aoRequiem){ARCH.requiemCircumstance=t.dataset.aoRequiem;selectCelebration('requiem',{circumstance:t.dataset.aoRequiem});return}if(t.dataset.aoBasis){ARCH.votiveBasis=t.dataset.aoBasis;ARCH.rubric=null;paintOpenSheet();return}if(t.dataset.aoCondition){const k=t.dataset.aoCondition;if(Object.prototype.hasOwnProperty.call(ARCH.rubricContext,k)){ARCH.rubricContext[k]=!ARCH.rubricContext[k];ARCH.rubric=null;paintOpenSheet()}return}if(t.dataset.aoForm){ARCH.celebrationForm=t.dataset.aoForm;paintOpenSheet();return}if(t.dataset.aoFollow){ARCH.followMode=t.dataset.aoFollow;paintOpenSheet();return}if(t.dataset.aoSaveDefaults!==undefined){const st=rt()?.store;if(st){st.dispatch({type:'live-form',form:ARCH.celebrationForm});st.dispatch({type:'live-follow-mode',mode:ARCH.followMode})}paintOpenSheet();return}if(t.dataset.aoDetails!==undefined){ARCH.history.push(ARCH.stage);ARCH.stage='details';paintOpenSheet();return}if(t.dataset.aoPreflight!==undefined){ARCH.history.push(ARCH.stage);ARCH.stage='preflight';paintOpenSheet();return}if(t.dataset.aoCalendarMass!==undefined){selectMassOfDay();return}},true);
document.addEventListener('click',e=>{if(e.target?.matches?.('[data-ao-backdrop]'))closeSheet()},true);
document.addEventListener('input',e=>{if(e.target?.matches?.('[data-ao-search]')){ARCH.search=e.target.value;const n=e.target.selectionStart;paintOpenSheet();const i=document.querySelector('[data-ao-search]');if(i){i.focus();try{i.setSelectionRange(n,n)}catch{}}}},true);
window.AO_CELEBRATION_API={openChangeMass(){syncFromCore();ARCH.stage='main';ARCH.history=[];paintOpenSheet()},openPreflight(){syncFromCore();ARCH.stage='preflight';ARCH.history=[];resolveReadiness();paintOpenSheet()},select:id=>selectCelebration(id),reset:selectMassOfDay,resolveRubrics:rubricResolve,resolveReadiness,setVotiveBasis(id){ARCH.votiveBasis=id;ARCH.rubric=null;return rubricResolve()},setCondition(key,value){if(Object.prototype.hasOwnProperty.call(ARCH.rubricContext,key)){ARCH.rubricContext[key]=!!value;ARCH.rubric=null}return rubricResolve()},getRubricState(){return {basis:ARCH.votiveBasis,context:{...ARCH.rubricContext},decision:rubricResolve()}},getResolvedMass(){const r=rubricResolve();const permitted=['permitted','permittedWithChanges'].includes(r.status);const resultId=r.resultingCelebration||ARCH.actualCelebration.id;const source=r.properSourceOverride||(resultId==='mass_of_day'?calendarPath():actualPath());return{date:isoDate(),calendarDay:ARCH.liturgicalDay,requestedCelebrationId:ARCH.actualCelebration.id,celebrationId:resultId,celebrationType:resultId==='mass_of_day'?'calendar':actualType(),properSource:source,calendarRank:ARCH.liturgicalDay?.rank||null,votiveClass:r.votiveClass||null,requiemClass:r.requiemClass||null,colour:resultId==='mass_of_day'?ARCH.liturgicalDay?.colour||null:actualDef()?.colour||null,gloria:typeof r.gloria==='boolean'?r.gloria:null,credo:typeof r.credo==='boolean'?r.credo:null,preface:null,commemorations:ARCH.liturgicalDay?.raw?.commemorations||[],seasonalMode:isPaschal()?'paschal':null,exceptionalProfile:resultId==='mass_of_day'?(typeof riteProfileFor==='function'?riteProfileFor(calendarPath(),core()?.resolution?.proper?.status==='ready'?core().resolution.proper.data:null):null):null,insertedRites:r.additions||[],conditions:r.conditions||[],rubricSources:r.sources||[],canStart:permitted,languageCoverage:ARCH.readiness,sourceDiagnostics:{architectureVersion:VERSION,rubricStatus:r.status,rubricCode:r.code,votiveBasis:ARCH.votiveBasis}}}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

