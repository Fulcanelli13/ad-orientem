/**
 * Ask the Church: source-governed conversational router.
 * No theological prose, personal circumstances or chat messages are persisted.
 * The registry owns every proposed target; this layer never copies its content.
 */
export const ASK_CHURCH_OBJECTIVE_ENGINE_VERSION = '1.0.0-preview';
const BANNED = new Set(['learn.apologetics','learn.church_crisis']);
const text = (en,fr,lang) => lang === 'fr' ? fr : en;
const normalized = value => String(value??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();

export const OBJECTIVE_COPY = Object.freeze({
 defend:{title:['Defend the faith','Défendre la foi'],prompt:['Who are you speaking with, and what is their objection?','Avec qui parlez-vous, et quelle est son objection ?']},
 understand:{title:['Understand a teaching','Comprendre un enseignement'],prompt:['Which part of Catholic teaching would you like to understand?','Quel aspect de la doctrine catholique voulez-vous comprendre ?']},
 situation:{title:['Talk through a situation','Parler d’une situation'],prompt:['Which general situation fits? You do not need to share private details.','Quelle situation générale vous concerne ? Vous n’avez pas à dévoiler de détails privés.']},
 practice:{title:['Practise a conversation','S’exercer à discuter'],prompt:['What discussion would you like to prepare for?','À quelle conversation voulez-vous vous préparer ?']},
 prayer:{title:['Build a prayer life','Développer la vie de prière'],prompt:['Are you beginning, praying as a family, or exploring a devotion?','Débutez-vous, priez-vous en famille, ou découvrez-vous une dévotion ?']},
 prepare:{title:['Prepare for a sacrament','Préparer un sacrement'],prompt:['Which sacrament or event are you preparing for?','Pour quel sacrement ou événement vous préparez-vous ?']},
 explore:{title:['Explore something new','Découvrir quelque chose'],prompt:['Would you prefer a teaching, a sacred place, or a devotion?','Préférez-vous découvrir un enseignement, un lieu sacré, ou une dévotion ?']}
});
export const BRANCH_COPY = Object.freeze({
 protestant:['A discussion about the Bible or Protestant objections','Discussion biblique ou objections protestantes'],
 critic:['Someone challenges the Church','Quelqu’un critique l’Église'],
 newcomer:['Explaining the faith to a newcomer','Expliquer la foi à un débutant'],
 mass:['Understand the traditional Mass','Comprendre la Messe traditionnelle'],
 sacraments:['Understand the sacraments','Comprendre les sacrements'],
 scripture:['Understand Scripture and Tradition','Comprendre l’Écriture et la Tradition'],
 latin:['Learn Latin for the Missal','Apprendre le latin du Missel'],
 confession_return:['Return to Confession after a long absence','Revenir à la Confession après longtemps'],
 confession_question:['Understand Confession','Comprendre la Confession'],
 illness:['Someone is seriously ill','Une personne est gravement malade'],
 bereavement:['Someone has died','Une personne est décédée'],
 moral:['Understand a moral question','Comprendre une question morale'],
 colleague:['Answer a colleague or friend','Répondre à un collègue ou ami'],
 scripture_alone:['Discuss Scripture alone','Discuter de l’Écriture seule'],
 eucharist:['Discuss the Eucharist','Discuter de l’Eucharistie'],
 begin:['Begin a regular prayer life','Commencer à prier régulièrement'],
 family:['Pray together as a family','Prier en famille'],
 adoration:['Learn about Eucharistic adoration','Découvrir l’adoration eucharistique'],
 devotions:['Explore devotions and novenas','Découvrir les dévotions et neuvaines'],
 first_communion:['Prepare a child for First Communion','Préparer un enfant à la Première Communion'],
 baptism:['Prepare for Baptism','Préparer un Baptême'],
 marriage:['Prepare for Marriage','Préparer le Mariage'],
 first_mass:['Attend the traditional Mass for the first time','Assister à la Messe traditionnelle pour la première fois'],
 places:['Discover sacred places','Découvrir des lieux sacrés'],
 ideas:['Explore Catholic beliefs','Découvrir les croyances catholiques']
});
const DEFINITIONS = [
 {objective:'situation',branch:'confession_return',rx:/\b(confess(?:ion|ed|ing)?|penance|confesar|confesser|confesse|confessional)\b/,spec:/\b(years|months|long time|longtemps|annees|ans|decades|return|retour|depuis|revenir)\b/},
 {objective:'situation',branch:'confession_question',rx:/\b(confess(?:ion|ed|ing)?|penance|confesseur|priest absolution|sacrement de penitence)\b/},
 {objective:'defend',branch:'protestant',rx:/\b(protestant|sola scriptura|scripture alone|bible alone|reformed|baptist|evangelical|evangelique)\b/},
 {objective:'practice',branch:'colleague',rx:/\b(debat|argue|practice|practise|roleplay|interlocutor|exercer|entrain|colleague)\b/},
 {objective:'prayer',branch:'family',rx:/\b(family rosary|family prayer|rosaire en famille|chapelet en famille|prier en famille)\b/},
 {objective:'prayer',branch:'adoration',rx:/\b(adoration|benediction|blessed sacrament|saint sacrement)\b/},
 {objective:'prayer',branch:'devotions',rx:/\b(novena|neuvaine|first friday|first saturday|sacred heart)\b/},
 {objective:'prayer',branch:'begin',rx:/\b(pray|praying|prayers|prayer|priere|prier|priant|prions|oraison|devotion)\b/},
 {objective:'prepare',branch:'first_communion',rx:/\b(first communion|premiere communion|first holy communion)\b/},
 {objective:'prepare',branch:'baptism',rx:/\b(baptis|bapteme|godparent|parrain|marraine)\b/},
 {objective:'prepare',branch:'marriage',rx:/\b(marriage|matrimony|wedding|mariage|epoux|fiance)\b/},
 {objective:'situation',branch:'illness',rx:/\b(illness|dying|seriously ill|viaticum|anointing|gravement malade|mourant)\b/},
 {objective:'situation',branch:'bereavement',rx:/\b(died|bereave|funeral|deceased|deuil|decede|mort|funerailles)\b/},
 {objective:'understand',branch:'mass',rx:/\b(mass|messe|liturgy|liturgie|offertory|consecration|rubric)\b/},
 {objective:'understand',branch:'scripture',rx:/\b(scripture|bible|tradition|ecriture|evangile)\b/},
 {objective:'understand',branch:'latin',rx:/\b(latin|latin language|langue latine|missal)\b/},
 {objective:'understand',branch:'sacraments',rx:/\b(sacrament|sacrement|eucharist|bapteme)\b/},
];
function chooseDetected(raw){
 const value=normalized(raw);
 if(!value||value.length<4)return null;
 // Specific matches first: a generic 'Mass' in 'preparing for first Mass' should not steal intent.
 if(/\b(first mass|first latin mass|never been to mass|premiere messe)\b/.test(value))return {objective:'prepare',branch:'first_mass'};
 if(/\b(contracept|chast|sexual|scrupulos|moralit|morality)\b/.test(value))return {objective:'situation',branch:'moral'};
 for(const def of DEFINITIONS){if(def.rx.test(value)&&(!def.spec||def.spec.test(value)))return {objective:def.objective,branch:def.branch};}
 if(/\b(question|understand|learn|teach|comprendre|apprendre)\b/.test(value))return {objective:'understand',branch:null};
 return null;
}

export function createAskChurchObjectiveEngine(survey,{lang='en'}={}){
 if(!survey||survey.schema!=='AO_ASK_CHURCH_APP_ROUTE_SURVEY_V1')throw new Error('Unrecognised source routing survey');
 const all=new Map(survey.routes.map(x=>[x.id,x]));
 const scenarios=new Map(survey.apostolateScenarios.map(x=>[x.id,x]));
 const objectiveMap=new Map(survey.objectives.map(x=>[x.id,x]));
 if(all.size!==survey.routes.length || scenarios.size!==survey.apostolateScenarios.length)throw new Error('Duplicate routing identities');
 for(const entry of survey.objectives){
  for(const path of entry.paths){
   if(!Array.isArray(path.targets)||path.targets.length===0)throw new Error('Empty objective path');
   for(const id of path.targets){
    const r=all.get(id)||scenarios.get(id);
    if(!r||BANNED.has(id)||r.releaseGate==='RESEARCH_ONLY'||r.publicationState && r.publicationState!=='READY_IN_RUNTIME_SOT')throw new Error('Unavailable or research-only route: '+id);
   }
  }
 }
 const state={objective:null,branch:null,lang:lang==='fr'?'fr':'en',turns:0,restore:[]};
 function optionObjective(id){const r=objectiveMap.get(id);const c=OBJECTIVE_COPY[id];return r&&c?{id,title:c.title[state.lang==='fr'?1:0]}:null;}
 function snapshot(){return Object.freeze({objective:state.objective,branch:state.branch,lang:state.lang,turns:state.turns});}
 function objectives(){return survey.objectives.map(x=>optionObjective(x.id)).filter(Boolean)}
 function branches(){return (objectiveMap.get(state.objective)?.paths||[]).map(x=>({id:x.id,title:BRANCH_COPY[x.id]?.[state.lang==='fr'?1:0]||x.id}));}
 function prompt(){return state.objective ? text(...OBJECTIVE_COPY[state.objective].prompt,state.lang):text('What would you like help with today?','Que souhaitez-vous approfondir aujourd’hui ?',state.lang);}
 function setObjective(id){if(!objectiveMap.has(id))return false;state.restore.push(snapshot());state.objective=id;state.branch=null;state.turns++;return true;}
 function setBranch(id){if(!state.objective||!objectiveMap.get(state.objective).paths.some(x=>x.id===id))return false;state.restore.push(snapshot());state.branch=id;state.turns++;return true;}
 function targets(){const p=objectiveMap.get(state.objective)?.paths.find(x=>x.id===state.branch);return p?p.targets.map((id,i)=>({id,order:i+1,route:all.get(id)||null,scenario:scenarios.get(id)||null})):[];}
 function interpret(message){const detected=chooseDetected(message);if(!detected)return {kind:'clarify'};if(!setObjective(detected.objective))return {kind:'clarify'};
  if(detected.branch&&setBranch(detected.branch))return {kind:'path',objective:state.objective,branch:state.branch};
  return {kind:'objective',objective:state.objective};
 }
 function back(){const prior=state.restore.pop();if(!prior)return false;state.objective=prior.objective;state.branch=prior.branch;state.turns=prior.turns;return true;}
 function reset(){state.objective=null;state.branch=null;state.turns=0;state.restore.length=0;}
 function language(next){state.lang=next==='fr'?'fr':'en';return snapshot();}
 function lookup(id){const r=all.get(id)||scenarios.get(id);return r && !BANNED.has(id) && r.releaseGate!=='RESEARCH_ONLY'?r:null;}
 return Object.freeze({objectives,branches,prompt,setObjective,setBranch,targets,interpret,back,reset,language,snapshot,lookup});
}
