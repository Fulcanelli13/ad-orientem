import {TENEBRAE_DAY_NAMES} from "./tenebrae-1960.js";
import {tenebraeGuideCopy,TENEBRAE_GUIDE_LINKS} from "./tenebrae-guides.js";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const nl=x=>esc(x).replace(/\n/g,"<br>");
function label(en,fr,locale){return locale==="fr"?fr:en}
function stepTitle(step,locale){
 const id=String(step?.id??""),n=step?.metadata?.psalm??null;
 if(id.startsWith("M.N")&&id.includes(".P"))return label("Psalm ","Psaume ",locale)+n;
 if(id.includes("VERSUM"))return label("Versicle and response","Verset et répons",locale);
 if(id.startsWith("M.LESSON"))return label("Lesson ","Leçon ",locale)+id.replace("M.LESSON","");
 if(id.startsWith("M.RESP"))return label("Responsory ","Répons ",locale)+id.replace("M.RESP","");
 if(id.startsWith("L.P"))return step?.metadata?.canticle?label("Canticle","Cantique",locale):label("Psalm ","Psaume ",locale)+n;
 if(id==="M.PATER")return label("Our Father (silently)","Notre Père (en silence)",locale);
 if(id==="M.COLLECT")return label("Concluding prayer","Oraison finale",locale);
 if(id==="L.BENEDICTUS")return "Benedictus";
 if(id==="L.CHRISTUS")return "Christus factus est";
 if(id==="L.PATER")return label("Our Father (silently)","Notre Père (en silence)",locale);
 if(id==="L.COLLECT")return label("Concluding prayer","Oraison finale",locale);
 return id;
}
export function renderTenebraeBody({day=0,hour="MATINS",index=0,face="vernacular",french=false,data=null,loading=false,error=null,guided=true}={}){
 const loc=french?"fr":"en",L=(en,fr)=>label(en,fr,loc),steps=data?.steps??[];
 const current=steps[index]??null;
 const guide=tenebraeGuideCopy({day,hour,step:current,french});
 const days=TENEBRAE_DAY_NAMES[loc].map((name,i)=>
  '<button type="button" data-p435930-tenebrae-day="'+i+'" aria-pressed="'+(day===i)+'" class="aoTenebDay '+(day===i?"active":"")+'">'+esc(name)+'</button>').join("");
 const hours=[["MATINS","Matins","Matines"],["LAUDS","Lauds","Laudes"]].map(([id,en,fr])=>
  '<button type="button" data-p435930-tenebrae-hour="'+id+'" aria-pressed="'+(hour===id)+'" class="aoTenebHour '+(hour===id?"active":"")+'">'+esc(L(en,fr))+'</button>').join("");
 const modeButtons=[["simple",L("Simple","Simple")],["guided",L("Guided","Guidé")]].map(([id,name])=>
  '<button type="button" data-p435930-tenebrae-mode="'+id+'" class="'+(guided===(id==="guided")?"active":"")+'" aria-pressed="'+(guided===(id==="guided"))+'">'+esc(name)+'</button>').join("");
 const jumps=hour==="MATINS"
  ?[[0,L("Nocturn I","Ier nocturne")],[10,L("Nocturn II","IIe nocturne")],[20,L("Nocturn III","IIIe nocturne")],[30,L("Final prayers","Prières finales")]]
  :[[0,L("Psalms","Psaumes")],[6,"Benedictus"],[7,"Christus factus est"],[8,L("Final prayers","Prières finales")]];
 const jumpMarkup=steps.length?'<nav class="aoTenebJump" aria-label="'+esc(L("Jump to a part of the Office","Aller à une partie de l’Office"))+'">'+
  jumps.map(([start,name],i)=>'<button type="button" data-p435930-tenebrae-jump="'+start+'" class="'+(index>=start&&(i===jumps.length-1||index<jumps[i+1][0])?"active":"")+'" aria-current="'+(index>=start&&(i===jumps.length-1||index<jumps[i+1][0])?"step":"false")+'">'+esc(name)+'</button>').join("")+'</nav>':'';
 const context=guided&&current&&guide.detail?
  '<aside class="aoTenebContext" aria-label="'+esc(L("Explanation of this passage","Explication de ce passage"))+'"><strong>'+esc(guide.title)+'</strong><p>'+esc(guide.detail)+'</p></aside>':'';
 let material="";
 if(error)material='<div class="aoTenebEmpty" role="alert"><p>'+esc(L("The local Office text could not be verified.","Le texte local de l’Office n’a pas pu être vérifié."))+'</p><button type="button" data-p435930-tenebrae-retry>'+esc(L("Retry","Réessayer"))+'</button></div>';
 else if(!current)material='<div class="aoTenebEmpty" role="status">'+esc(L("Preparing the source texts…","Préparation des textes sources…"))+'</div>';
 else{
  const progress=(index+1)+" / "+steps.length;
  material='<article class="aoTenebReading" data-tenebrae-section="'+esc(current.id)+'">'+
   '<div class="aoTenebReadingTop"><span>'+esc(hour==="MATINS"?L("Matins","Matines"):L("Lauds","Laudes"))+' · '+esc(progress)+'</span>'+
   '<button type="button" data-p435930-tenebrae-face aria-label="'+esc(L("Switch Latin and translation","Passer du latin à la traduction"))+'">'+esc(face==="latin"?L("English","Français"):"Latin")+' ↔</button></div>'+
   '<h3>'+esc(stepTitle(current,loc))+'</h3>'+context+
   '<div class="aoTenebPrayer" lang="'+(face==="latin"?"la":loc)+'">'+nl(face==="latin"?current.latin:current[loc])+'</div>'+
   '<div class="aoTenebFooter">'+
   '<button type="button" data-p435930-tenebrae-move="previous" '+(index===0?"disabled":"")+' aria-label="'+esc(L("Previous text","Texte précédent"))+'">← '+esc(L("Previous","Précédent"))+'</button>'+
   '<span>'+esc(progress)+'</span>'+
   '<button type="button" data-p435930-tenebrae-move="next" '+(index>=steps.length-1?"disabled":"")+' aria-label="'+esc(L("Next text","Texte suivant"))+'">'+esc(L("Next","Suivant"))+' →</button></div></article>';
 }
 const edition=L(
  "Matins may, for good reason, be anticipated after 2 PM on the previous day. Lauds belongs to the morning (1960 rubrics §§144–145). The earlier fifteen-candle ceremony is not imposed here.",
  "Pour une juste raison, les Matines peuvent être anticipées après 14 h la veille. Les Laudes appartiennent au matin (rubriques de 1960, §§144–145). L’ancien cérémonial des quinze cierges n’est pas imposé ici."
 );
 const witness=L(
  "The complete hour text is assembled locally from the open-source Divinum Officium 1960/61 Roman Breviary corpus. Independent photographed-Breviary critical collation remains pending.",
  "L’heure complète est assemblée localement à partir du Bréviaire romain 1960/61 de Divinum Officium. La collation critique avec l’édition imprimée reste à accomplir."
 );
 const about='<details class="aoTenebGuideIntro"><summary>'+esc(L("Understanding Tenebrae · history & how to participate","Comprendre les Ténèbres · histoire et participation"))+'</summary>'+
  '<p>'+esc(guide.overview)+'</p><p>'+esc(guide.structure)+'</p><p>'+esc(guide.method)+'</p>'+
  '<h3>'+esc(L("The lights and the strepitus","Les cierges et le strepitus"))+'</h3><p>'+esc(guide.ceremonial)+'</p>'+
  '<h3>'+esc(L("When are the offices prayed?","Quand prier ces offices ?"))+'</h3><p>'+esc(guide.timing)+'</p>'+
  '<p class="aoTenebRefs"><a href="'+TENEBRAE_GUIDE_LINKS.rubrics+'" target="_blank" rel="noopener noreferrer">'+esc(L("1960 rubrics §§144–145","Rubriques de 1960 §§144–145"))+'</a> · <a href="'+TENEBRAE_GUIDE_LINKS.history+'" target="_blank" rel="noopener noreferrer">'+esc(L("Historical account","Présentation historique"))+'</a> · <a href="'+TENEBRAE_GUIDE_LINKS.candles+'" target="_blank" rel="noopener noreferrer">'+esc(L("Candle history","Histoire des cierges"))+'</a></p></details>';
 return '<main class="aoP435930Body aoTenebBody" data-tenebrae-ready="'+Boolean(data)+'" data-tenebrae-mode="'+(guided?"guided":"simple")+'">'+
  '<section class="aoTenebIntro"><small>TRIDUUM · BREVIARIUM ROMANUM 1961</small><h2>'+esc(L("Office of Tenebrae","Office des Ténèbres"))+'</h2><p>'+esc(L("The three days · Matins and Lauds","Les trois jours · Matines et Laudes"))+'</p></section>'+
  about+
  '<nav class="aoTenebDays" aria-label="'+esc(L("Select Holy Week day","Choisir le jour"))+'">'+days+'</nav>'+
  '<div class="aoTenebHours" role="group" aria-label="'+esc(L("Select canonical hour","Choisir l’heure canoniale"))+'">'+hours+'</div>'+
  '<div class="aoTenebMode" role="group" aria-label="'+esc(L("Reading mode","Mode de lecture"))+'">'+modeButtons+'</div>'+
  (guided?'<p class="aoTenebDayContext">'+esc(guide.day)+'</p>':'')+jumpMarkup+
  material+
  '<details class="aoTenebSource"><summary>'+esc(L("Liturgical edition and source","Édition liturgique et sources"))+'</summary><p>'+esc(edition)+'</p><p>'+esc(witness)+'</p><p>'+esc(guide.sourceWarning)+'</p><p>© 2026 Divinum Officium · MIT · <a href="https://github.com/DivinumOfficium/divinum-officium" target="_blank" rel="noopener noreferrer">Source</a></p></details></main>';
}
