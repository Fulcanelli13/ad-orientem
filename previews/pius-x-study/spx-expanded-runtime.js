/* St Pius X 82-chapter editorial visual-novel review. Inlined by build script. */
(()=>{
"use strict";
const node=document.getElementById("spxExpandedCorpus");
const corpus=JSON.parse(node.textContent);
const artwork=JSON.parse(document.getElementById("spxData").textContent).art;
const $=id=>document.getElementById(id);
const esc=t=>String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const fold=t=>String(t??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[’‘']/g," ").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const chapters=corpus.chapters, byId=new Map(chapters.map(c=>[c.id,c]));
const ui={open:false,lang:"en",id:null,selected:[],menu:false,query:"",source:false,history:[],interaction:"opening",askResult:null,askCandidates:[]};
function rememberPlace(){
 if(!ui.id)return;
 ui.history.push({id:ui.id,selected:[...ui.selected],interaction:ui.interaction});
 if(ui.history.length>20)ui.history.shift();
}
const term={
en:{launch:"Explore {count} conversations",back:"Return to the original study",library:"Conversation library",search:"Search subjects and questions",entry:"Explore a subject",welcome:"Choose a question. These are documentary educational reconstructions, not verified speech of St Pius X.",review:"EDITORIAL REVIEW · NOT A HISTORICAL TRANSCRIPT",chapter:"Conversation",follow:"Where would you like to go next?",depth:"Ask a more specific question",related:"Related subjects",source:"Original source",sourceTitle:"Source and attribution",close:"Close",startOver:"Return to this subject",again:"Choose another subject",noResults:"No documented question matches that search. No reply has been invented.",special:"This subject requires fuller source review. Read the text as editorial commentary, not an authenticated papal statement.",biography:"Historical biography · editorial narrator",partialSource:"Source evidence incomplete · editorial voice only",editorialExplanation:"Historical editorial explanation · not Pope's testimony",catechism:"Catechetical reconstruction · not personally spoken by the Pope",documents:"Source-bound editorial recreation · not verbatim",foot:"The original source records remain unchanged. No doctrine, translation, papal voice or publication has been independently approved.",go:"Read this question",sourceLocus:"Document passage",all:"All conversations",recent:"Start here",prior:"Return to previous conversation",ask:"Ask in your own words",askButton:"Find documented answers",askHelp:"Offline editorial study: questions can lead only to existing, unapproved text. No AI-generated papal replies.",askUnknown:"No documented question was confidently located. Nothing has been invented.",askSuggestions:"Choose one of these documented questions; no answer has been inferred.",askFound:"Existing editorial answer displayed. This is not authenticated papal speech.",askShort:"Earlier shorter editorial wording, shown without rewriting:",askNoShort:"No earlier wording exists. You can select an authored follow-up or inspect the source.",askMore:"Choose an existing follow-up below for more detail; no new answer has been generated.",askSource:"Source locator opened. Claim-level verification remains pending.",askNeedContext:"Select a documented subject first.",fr:"Français",questions:"Questions",backPath:"Previous exchange",reviewOnly:"Review only",enrichedNote:"Expanded editorial answer — not a historical quotation",compare:"Read earlier short draft",citationLimit:"Document locator only; source wording and translations await independent verification."},
fr:{launch:"Explorer {count} conversations",back:"Retour à l'étude initiale",library:"Bibliothèque des conversations",search:"Rechercher un sujet ou une question",entry:"Explorer un sujet",welcome:"Choisissez une question. Il s'agit de reconstitutions pédagogiques documentaires, non de paroles authentifiées de saint Pie X.",review:"RÉVISION ÉDITORIALE · NON UNE TRANSCRIPTION HISTORIQUE",chapter:"Conversation",follow:"Quelle question souhaitez-vous approfondir ?",depth:"Poser une question plus précise",related:"Sujets connexes",source:"Source originale",sourceTitle:"Source et attribution",close:"Fermer",startOver:"Reprendre ce sujet",again:"Choisir un autre sujet",noResults:"Aucune question documentée ne correspond à cette recherche. Aucune réponse n'a été inventée.",special:"Ce sujet exige une vérification plus approfondie. Ce texte est un commentaire éditorial, non une parole pontificale authentifiée.",biography:"Biographie historique · rédaction éditoriale",partialSource:"Source incomplète · rédaction éditoriale uniquement",editorialExplanation:"Explication historique éditoriale · non témoignage pontifical",catechism:"Adaptation catéchétique · non personnellement prononcée par le pape",documents:"Reconstitution éditoriale fondée sur les sources · non verbatim",foot:"Les sources originales n'ont pas été modifiées. Aucune approbation indépendante doctrinale, linguistique, stylistique ou de publication.",go:"Ouvrir cette question",sourceLocus:"Passage cité",all:"Toutes les conversations",recent:"Pour commencer",prior:"Revenir à la conversation précédente",ask:"Poser une question libre",askButton:"Chercher les réponses documentées",askHelp:"Étude éditoriale hors ligne : seuls les textes existants et non approuvés peuvent être consultés. Aucune réponse pontificale générée par IA.",askUnknown:"Aucune question documentée trouvée avec suffisamment de certitude. Aucun texte inventé.",askSuggestions:"Choisissez une question documentée : aucune réponse n’a été déduite.",askFound:"Réponse éditoriale existante affichée, non parole pontificale authentifiée.",askShort:"Ancienne rédaction éditoriale plus courte, sans réécriture :",askNoShort:"Aucune rédaction antérieure. Choisissez une question préparée ou consultez la source.",askMore:"Choisissez ci-dessous une question supplémentaire existante. Aucune réponse nouvelle n’a été produite.",askSource:"Référence ouverte. Vérification précise des affirmations encore nécessaire.",askNeedContext:"Choisissez d’abord un sujet documenté.",fr:"English",questions:"Questions",backPath:"Échange précédent",reviewOnly:"Révision seulement",enrichedNote:"Réponse éditoriale développée — non une citation historique",compare:"Lire la première version abrégée",citationLimit:"Renvoi au passage uniquement ; textes et traductions à vérifier indépendamment."}};
const T=()=>term[ui.lang], lang=v=>v?.[ui.lang]||v?.en||"", current=()=>byId.get(ui.id)||null;
function isNarration(c){
return !!c&&c.sourceClass==="BIOGRAPHICAL_NARRATOR";
}
function isPartial(c){
return !!c&&(c.partial||c.sourceClass==="SOURCE_SCOPE_EDITORIAL_HOLD");
}
function isCatechism(c){
return !!c&&c.sourceClass==="CATECHETICAL_ADAPTATION";
}
function provenanceLabel(c){
if(isNarration(c))return T().biography;
if(isPartial(c))return T().partialSource;
if(isCatechism(c))return T().catechism;
if(c.sourceClass==="PAPAL_DOCUMENT_ADAPTATION")return T().documents;
return T().editorialExplanation;
}
const catLabels={
FOUNDATIONS_AND_BIOGRAPHY:{en:"Life, vocation and early pontificate",fr:"Vie, vocation et débuts du pontificat"},
CATECHESIS_AND_LITURGY:{en:"Catechism and liturgy",fr:"Catéchisme et liturgie"},
PASTORAL_AND_PERSONAL:{en:"Pastoral and spiritual life",fr:"Vie pastorale et spirituelle"},
DOCTRINE_AND_REASON:{en:"Doctrine, faith and reason",fr:"Doctrine, foi et raison"},
HISTORICAL_CHURCH_STATE:{en:"The Church and society",fr:"L'Église et la société"}
};
function words(q){return [...new Set(fold(q).split(" ").filter(x=>x.length>3))];}
function match(c,term){
const q=fold(term);if(q.length<2)return true;
const targets=[lang(c.title),c.id,c.source?.locus,...c.nodes.flatMap(n=>[lang(n.q),lang(n.a)])].join(" ");
const str=fold(targets);if(str.includes(q))return true;
const w=words(q);return w.length>=2&&w.filter(t=>str.includes(t)).length>=Math.min(2,w.length);
}
function visibleChapters(){return chapters.filter(c=>match(c,ui.query));}
function card(c,small=false){
return "<button type='button' class='spxc-topic"+(small?" compact":"")+"' data-spxc-open='"+esc(c.id)+"'><span>"+esc(lang(c.title))+"</span><small>"+esc(c.source.locus||c.id)+" · "+c.nodes.length+" "+esc(T().questions.toLowerCase())+"</small></button>";
}
function nav(){
const matches=visibleChapters(),by=new Map();
for(const c of matches){const k=c.category||"THEOLOGY_AND_CHURCH";if(!by.has(k))by.set(k,[]);by.get(k).push(c);}
return [...by.entries()].map(([k,cs])=>"<h3 class='spxc-group-title'>"+esc(lang(catLabels[k]||{en:k.replace(/_/g," "),fr:k.replace(/_/g," ")}))+" <span>"+cs.length+"</span></h3>"+cs.map(c=>card(c,true)).join("")).join("")||"<p class='spxc-note'>"+esc(T().noResults)+"</p>";
}
function choices(c,which){
if(!c)return "";
const first=c.nodes.filter(n=>!n.parentId&&n.id!==c.nodes[0]?.id);
const last=ui.selected.at(-1)||c.nodes[0].id;
const dependent=c.nodes.filter(n=>n.parentId===last);
const offered=which==="dependent"?dependent:first.filter(n=>!ui.selected.includes(n.id));
return offered.map(n=>"<button class='spxc-choice' data-spxc-choose='"+esc(n.id)+"'>"+esc(lang(n.q))+"<small>"+esc(c.source.locus||"")+"</small></button>").join("");
}
function conversationHTML(){
const c=current();if(!c)return welcomeHTML();
const items=[c.nodes[0],...ui.selected.map(id=>c.nodes.find(n=>n.id===id)).filter(Boolean)];
const turns=items.map((n,i)=>"<article class='spxc-turn'><p class='spxc-person'>"+(i===0?esc(T().chapter):esc(T().questions))+"</p><h3>"+esc(lang(n.q))+"</h3><p class='spxc-voice'>"+esc(provenanceLabel(c))+(n.editorialDepth?" · "+esc(T().enrichedNote):"")+"</p><p class='spxc-answer'>"+esc(lang(n.a))+"</p>"+(n.previousEditorialDraft?"<details class='spxc-original'><summary>"+esc(ui.lang==='fr'?'Comparer la version éditoriale précédente':'Compare previous editorial wording')+"</summary><p>"+esc(lang(n.previousEditorialDraft))+"</p></details>":"")+(n.editorialDepth&&n.originalDraft?"<details class='spxc-original'><summary>"+esc(T().compare)+"</summary><p>"+esc(lang(n.originalDraft))+"</p></details>":"")+"<button class='spxc-source-btn' data-spxc-source='"+esc(n.id)+"'>"+esc(T().source)+" · "+esc(n.source?.locus||c.source.locus)+" ↗</button></article>").join("");
const deep=choices(c,"dependent"),side=choices(c,"follow");
const related=(c.related||[]).map(id=>byId.get(id)).filter(Boolean);
return "<div class='spxc-bread'>"+esc(T().reviewOnly)+" · "+esc(c.source.locus)+"</div>"+
 "<h2 class='spxc-topic-title'>"+esc(lang(c.title))+"</h2>"+
 (isPartial(c)?"<p class='spxc-caution'>"+esc(T().special)+"</p>":"")+
 turns+
 (deep?"<div class='spxc-next'><h3>"+esc(T().depth)+"</h3>"+deep+"</div>":"")+
 (side?"<div class='spxc-next'><h3>"+esc(T().follow)+"</h3>"+side+"</div>":"")+
 (related.length?"<div class='spxc-next'><h3>"+esc(T().related)+"</h3>"+related.map(x=>card(x,true)).join("")+"</div>":"")+
 askPanel()+
 "<div class='spxc-bottom'>"+(ui.history.length?"<button data-spxc-return='1'>"+esc(T().prior)+"</button>":"")+"<button data-spxc-restart='1'>"+esc(T().startOver)+"</button><button data-spxc-index='1'>"+esc(T().again)+"</button></div>";
}

const askCommandSets={
 en:{short:["simpler please","shorter please","can you put that more simply","say that more simply"],more:["tell me more","more detail please","explain further"],source:["source please","what is your source","where is that from","show the source"]},
 fr:{short:["plus simplement","pouvez vous simplifier","en termes plus simples"],more:["dites m en plus","plus de details","expliquez davantage"],source:["quelle est la source","montrez la source","donnez la reference"]}
};
const askStop=new Set("what does did the this that there these those could would how why when where have with from please about explain that what your does dit vous quel quelle quels quelles suis pour dans avez comment pourquoi sont".split(" "));
function askTerms(t){return [...new Set(fold(t).split(" ").filter(x=>x.length>3&&!askStop.has(x)))];}
function askMatches(raw){
 const q=fold(raw),query=askTerms(raw),exact=[],candidates=[];
 for(const c of chapters)for(const n of c.nodes){
  const title=lang(n.q);if(q===fold(title)){exact.push({chapter:c.id,node:n.id});continue;}
  const keywords=askTerms(title+" "+lang(c.title));
  const common=query.filter(x=>keywords.includes(x)).length;
  if(common>=2)candidates.push({chapter:c.id,node:n.id,score:common/(query.length||1)+common/(keywords.length||1)});
 }
 candidates.sort((a,b)=>b.score-a.score);
 return exact.length?exact.slice(0,5):candidates.slice(0,5);
}
function askPanel(){
 const r=ui.askResult;
 const result=r?"<div class='spxc-ask-result' role='status'><p>"+esc(T()[r.kind]||T().askUnknown)+"</p>"+
 (r.short?"<p class='spxc-ask-short'>"+esc(r.short)+"</p>":"")+
 ui.askCandidates.map((m,i)=>{const c=byId.get(m.chapter),n=c?.nodes.find(x=>x.id===m.node);return c&&n?"<button type='button' class='spxc-choice' data-spxc-ask-pick='"+i+"'>"+esc(lang(n.q))+"<small>"+esc(lang(c.title))+"</small></button>":""}).join("")+"</div>":"";
 return "<section class='spxc-free-ask'><form id='spxc-ask-form'><label for='spxc-ask-input'>"+esc(T().ask)+"</label><div class='spxc-ask-row'><input id='spxc-ask-input' type='text' maxlength='240' autocomplete='off'><button type='submit'>"+esc(T().askButton)+"</button></div></form><p class='spxc-ask-help'>"+esc(T().askHelp)+"</p>"+result+"</section>";
}
function navigateAsk(m){
 const c=byId.get(m?.chapter),n=c?.nodes.find(x=>x.id===m?.node);if(!c||!n)return;
 if(ui.id!==c.id)rememberPlace();
 ui.id=c.id;ui.selected=n===c.nodes[0]?[]:n.parentId?[n.parentId,n.id]:[n.id];
 ui.interaction=ui.selected.length?"followup":"opening";ui.source=false;ui.menu=false;
 ui.askResult={kind:"askFound"};ui.askCandidates=[];render();
 document.querySelector(".spxc-main-scroll").scrollTop=0;
}
function submitAsk(raw){
 const q=fold(String(raw||"").slice(0,240));
 if(!q){ui.askResult=null;ui.askCandidates=[];render();return;}
 ui.askCandidates=[];
 const cmd=Object.entries(askCommandSets[ui.lang]).find(([,arr])=>arr.some(x=>fold(x)===q))?.[0];
 if(cmd){
  const c=current(),n=c?.nodes.find(x=>x.id===ui.selected.at(-1))||c?.nodes[0];
  if(!n){ui.askResult={kind:"askNeedContext"};render();return;}
  if(cmd==="source"){ui.source=n.id;ui.askResult={kind:"askSource"};}
  if(cmd==="more")ui.askResult={kind:"askMore"};
  if(cmd==="short"){
   const prior=n.previousEditorialDraft||n.previousDraft||n.originalDraft;
   ui.askResult=prior&&lang(prior)?{kind:"askShort",short:lang(prior)}:{kind:"askNoShort"};
  }
  render();return;
 }
 const results=askMatches(raw);
 if(results.length===1&&fold(raw)===fold(lang(byId.get(results[0].chapter).nodes.find(n=>n.id===results[0].node).q))){
  navigateAsk(results[0]);return;
 }
 ui.askCandidates=results;ui.askResult={kind:results.length?"askSuggestions":"askUnknown"};render();
}

function welcomeHTML(){
const starters=["SPX-001","SPX-009","SPX-EXP-012","SPX-EXP-001"].map(id=>byId.get(id)).filter(Boolean);
return "<p class='spxc-bread'>"+esc(T().review)+"</p><h2 class='spxc-topic-title'>"+esc(T().library)+"</h2>"+
 "<p class='spxc-intro'>"+esc(T().welcome)+"</p><div class='spxc-next'><h3>"+esc(T().recent)+"</h3>"+starters.map(x=>card(x)).join("")+"</div>"+
 askPanel()+"<p class='spxc-note'>"+esc(T().foot)+"</p>";
}
function citationHTML(){
const c=current();if(!c||!ui.source)return "";
const turn=c.nodes.find(n=>n.id===ui.source)||c.nodes[0];
const voiceNote=turn.sourceDrawerNote||c.nodes[0]?.sourceDrawerNote;
const source=turn.source?.url?turn.source:c.source;
const safeURL=/^https:\/\//.test(source.url);
return "<aside class='spxc-cite' role='dialog' aria-label='"+esc(T().sourceTitle)+"'><button data-spxc-source='close' class='spxc-cite-close'>"+esc(T().close)+" ×</button>"+
 "<h2>"+esc(T().sourceTitle)+"</h2><p>"+esc(provenanceLabel(c))+"</p><p>"+esc(T().sourceLocus)+": <strong>"+esc(source.locus)+"</strong></p>"+
 "<p>"+esc(source.genre||source.tier||"Research source")+"</p>"+
 (voiceNote?"<p class='spxc-note'>"+esc(lang(voiceNote))+"</p>":"")+
 "<p class='spxc-note'>"+esc(T().citationLimit)+"</p>"+
 (safeURL?"<a href='"+esc(source.url)+"' target='_blank' rel='noopener noreferrer'>"+esc(T().source)+" ↗</a>":"")+
 "<p class='spxc-note'>"+esc(T().foot)+"</p></aside>";
}
function render(){
if(!ui.open)return;
$("spxc-overlay").hidden=false;
$("spxc-caption").textContent=T().review;
$("spxc-launch").textContent=T().launch.replace("{count}",String(chapters.length));
$("spxc-close").textContent=T().back;
$("spxc-lang").textContent=T().fr;
$("spxc-search").placeholder=T().search;
$("spxc-search").value=ui.query;
$("spxc-nav").innerHTML=nav();
$("spxc-main").innerHTML=conversationHTML();
$("spxc-cite-slot").innerHTML=citationHTML();
const c=current(),narration=isNarration(c)||isPartial(c)||isCatechism(c)||c?.sourceClass==="SOURCE_BOUNDED_EDITORIAL_EXPLANATION";
const expression=ui.source?"thoughtful":ui.interaction==="followup"?"explaining":(c?.pose||"thoughtful");
$("spxc-portrait").dataset.expression=narration?"none":expression;
$("spxc-portrait").src=artwork[expression]||artwork.neutral;
$("spxc-portrait").hidden=narration;
$("spxc-overlay").style.setProperty("--spxc-study","url('"+artwork.study+"')");
$("spxc-menu").setAttribute("aria-expanded",String(ui.menu));
$("spxc-side").dataset.open=String(ui.menu);
document.documentElement.lang=ui.lang;
}
const launch=document.createElement("button");
launch.id="spxc-launch";launch.type="button";launch.textContent=T().launch.replace("{count}",String(chapters.length));
document.querySelector(".head-actions").prepend(launch);
const overlay=document.createElement("section");
overlay.id="spxc-overlay";overlay.hidden=true;overlay.setAttribute("aria-label","St Pius X expanded conversation review");
overlay.innerHTML="<div class='spxc-background'></div><img id='spxc-portrait' alt='' aria-hidden='true'>"+
"<div class='spxc-shell'><header class='spxc-head'><button id='spxc-close'></button><strong id='spxc-caption'></strong><button id='spxc-lang'></button><button id='spxc-menu' aria-expanded='false'>☰</button></header>"+
"<div class='spxc-columns'><aside id='spxc-side' data-open='false'><label class='spxc-search-label' for='spxc-search'>"+esc(T().search)+"</label><input id='spxc-search' type='search'><div id='spxc-nav'></div></aside>"+
"<main class='spxc-main-scroll'><div id='spxc-main'></div></main></div><div id='spxc-cite-slot'></div></div>";
document.body.append(overlay);
function openChapter(id){
if(!byId.has(id))return;
if(ui.id!==id)rememberPlace();
ui.id=id;ui.selected=[];ui.source=false;ui.menu=false;ui.interaction="opening";ui.askResult=null;ui.askCandidates=[];
render();$("spxc-main").closest(".spxc-main-scroll").scrollTop=0;
}
function close(){ui.open=false;overlay.hidden=true;document.documentElement.lang=JSON.parse(document.getElementById("spxData").textContent)?.docs?"en":"en";}
launch.addEventListener("click",()=>{ui.open=true;ui.id=null;ui.selected=[];ui.source=false;ui.query="";ui.history=[];ui.interaction="opening";ui.askResult=null;ui.askCandidates=[];render();});
overlay.addEventListener("submit",e=>{if(e.target.id!=="spxc-ask-form")return;e.preventDefault();submitAsk(e.target.querySelector("#spxc-ask-input").value);});
overlay.addEventListener("click",e=>{
const el=e.target.closest("button");if(!el)return;
if(el.dataset.spxcAskPick!==undefined){const m=ui.askCandidates[Number(el.dataset.spxcAskPick)];if(m)navigateAsk(m);return;}
if(el.id==="spxc-close"){close();return;}
if(el.id==="spxc-lang"){ui.lang=ui.lang==="en"?"fr":"en";render();return;}
if(el.id==="spxc-menu"){ui.menu=!ui.menu;render();return;}
if(el.dataset.spxcOpen){openChapter(el.dataset.spxcOpen);return;}
if(el.dataset.spxcChoose){const c=current(),n=c?.nodes.find(n=>n.id===el.dataset.spxcChoose);if(!n)return;
if(n.parentId&&!ui.selected.includes(n.parentId))return;
// A conversation is one visitor-selected branch, never accumulated siblings.
ui.selected=n.parentId?[n.parentId,n.id]:[n.id];
ui.source=false;ui.interaction="followup";ui.askResult=null;ui.askCandidates=[];render();const sc=document.querySelector(".spxc-main-scroll");sc.scrollTop=sc.scrollHeight;return;}
if(el.dataset.spxcSource){ui.source=el.dataset.spxcSource==="close"?false:el.dataset.spxcSource;render();return;}
if(el.dataset.spxcIndex){rememberPlace();ui.id=null;ui.selected=[];ui.source=false;ui.interaction="opening";render();return;}
if(el.dataset.spxcReturn){
 const prev=ui.history.pop();if(!prev||!byId.has(prev.id))return;
 ui.id=prev.id;ui.selected=prev.selected;ui.interaction=prev.interaction;ui.source=false;ui.menu=false;ui.askResult=null;ui.askCandidates=[];
 render();document.querySelector(".spxc-main-scroll").scrollTop=0;return;
}
if(el.dataset.spxcRestart){openChapter(ui.id);return;}
});
$("spxc-search").addEventListener("input",e=>{ui.query=e.target.value;$("spxc-nav").innerHTML=nav();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&ui.open){if(ui.source){ui.source=false;render();}else if(ui.menu){ui.menu=false;render();}else close();}});
})();
