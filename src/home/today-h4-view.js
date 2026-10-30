// H4 Today door. Pure, source-owned projection of the canonical Home view model.
// No fixture dates, Mass catalogue, art mapping, or parallel preference store.
import { TODAY_H4_CSS } from "./today-h4-styles.js";
import { HOME_ENRICHERS_VERSION } from "./enrichers.js";
import { calendarMassColour } from "../calendar/colour-projection.js";
// Display only verified liturgical colours; never infer them from the season.
export function verifiedH4WeekColour(resolved,date){
  if(resolved?.status!=="ready"||resolved.date!==date||!resolved.day?.main)return null;
  const value=String(calendarMassColour(resolved)).trim().toLowerCase();
  return ({green:"#62a473",vert:"#62a473",white:"#e9e0c9",blanc:"#e9e0c9",
    red:"#d0574a",rouge:"#d0574a",black:"#8c8c8c",noir:"#8c8c8c",
    violet:"#9a7bc4",purple:"#9a7bc4",rose:"#d99aae"})[value]??null;
}
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const L=(fr,en,french)=>fr?french:en;
const dateLabel=(date,fr)=>{
  const d=new Date(date+"T12:00:00");
  return new Intl.DateTimeFormat(fr?"fr-FR":"en-GB",{day:"numeric",month:"short"}).format(d);
};
const dayOf=(date,fr)=>{
  const d=new Date(date+"T12:00:00");
  return new Intl.DateTimeFormat(fr?"fr-FR":"en-GB",{weekday:"short"}).format(d).replace(".","");
};
export function h4Enabled(win=globalThis){
  try{return new URLSearchParams(win?.location?.search??"").get("aoTodayH4")==="1"}catch{return false}
}
export function h4HomeView(vm,model,{resume=null,coverage=null,choices=null}={}){
  const fr=vm.language==="fr",say=(en,frText)=>L(fr,en,frText),ready=vm.resolvedForSelection&&vm.properStatus==="ready"&&!vm.loading;
  const week=vm.week.map(d=>'<button type="button" class="dayCell'+(d.selected?' selected':'')+(d.today?' today':'')+'" data-date="'+esc(d.date)+'" aria-pressed="'+d.selected+'"><span>'+esc(d.day)+'</span><b>'+esc(d.number)+'</b><i class="aoWeekColour" data-home-week-colour="'+esc(d.date)+'" aria-hidden="true"></i></button>').join("");
  const properIdentity=vm.massFormularyName?'<p class="aoH4Formulary">'+esc(vm.massFormularyName)+'</p>':"";
  const introit=vm.massIntroit?'<p class="aoH4Introit" lang="la">'+esc(vm.massIntroit)+'</p>':"";
  const formName=({
    LOW:say("Low Mass","Messe basse"),
    MISSA_CANTATA_SIMPLE:say("Sung · no incense","Chantée · sans encens"),
    MISSA_CANTATA_INCENSE:say("Sung · incense","Chantée · avec encens"),
    SOLEMN:say("Solemn Mass","Messe solennelle"),
  })[choices?.chosenForm]??null;
  const selectedChoices=[formName,choices?.readerMode==="MISSAL"?say("Missal","Missel"):
    choices?.readerMode==="LIVE"?"LIVE":null].filter(Boolean).join(" · ")||
    say("Choose Mass options","Choisir les options de messe");
  const resumeLabel=resume?[resume.date?dateLabel(resume.date,fr):"",resume.stepNumber?say("Card ","Carte ")+resume.stepNumber:""].filter(Boolean).join(" · "):"";
  const mainAction=resume?
    '<button type="button" class="aoH4Primary" data-resume-mass data-ao-resume-owner="R17_NATIVE"><span><strong>'+esc(say("Resume Mass","Reprendre la messe"))+'</strong><small>'+esc(resumeLabel)+'</small></span><span class="aoH4Arrow" aria-hidden="true">›</span></button>':
    '<button type="button" class="aoH4Primary" data-home-h4-begin'+(ready?'':' disabled aria-disabled="true"')+'><span><strong>'+esc(vm.isToday?say("Begin Mass","Commencer la messe"):say("Begin selected Mass","Commencer la messe choisie"))+'</strong><small>'+esc(selectedChoices)+'</small></span><span class="aoH4Arrow" aria-hidden="true">›</span></button>';
  const unresolved=!resume&&!ready?'<div class="aoH4Status" role="status">'+esc(vm.loading?say("Resolving the selected Mass…","Résolution de la messe choisie…"):say("Mass texts are not yet available. Begin is unavailable.","Les textes de la messe ne sont pas encore disponibles. Le démarrage est indisponible."))+'</div>':"";
  const feature=model.enricherVisible?model.feature:null;
  const attrs=feature?.kind==="dynamic"?
    'data-home-cu-dynamic="'+esc(feature.id)+'" data-home-cu-route="'+esc(feature.route||"pray.library")+'"':
    'data-home-cu-route="'+esc(feature?.route||"pray.library")+'"';
  const due=Number.isFinite(feature?.due)?new Intl.DateTimeFormat(fr?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(2026,0,1,Math.floor(feature.due/60),feature.due%60)):null;
  const nextRole=feature?.role||say("Choose a prayer","Choisir une prière");
  const prayerTitle=feature?.title||say("Prayer Library","Livre de prières");
  const prayerCaption=feature?.sub||say("Prayers for this day","Prières de ce jour");
  const rosaryRule=model.enricherVisible&&model.enricherRule?.kind==="static"&&model.enricherRule?.id==="rosary";
  const rosaryAttr=rosaryRule?'data-home-cu-static="rosary"':'data-home-cu-route="pray.rosary"';
  const upcoming=(model.upcoming||[]).map(d=>'<button type="button" class="aoTodayV2Event aoTcmRow" data-home-calendar data-home-calendar-view="day" data-home-calendar-date="'+esc(d.date)+'"><span class="aoH4Eyebrow">'+esc(dateLabel(d.date,fr))+'</span><strong>'+esc(fr?d.fr:d.en)+'</strong><small>'+esc(dayOf(d.date,fr))+'</small></button>').join("");
  const spotlight=model.spotlight;
  const custom=spotlight?.article?'<button type="button" class="aoH4Custom" data-home-calendar data-home-calendar-view="day" data-home-calendar-date="'+esc(spotlight.contextDate)+'"><span class="aoH4Eyebrow">'+esc(say("Tradition","Coutume"))+'</span><strong>'+esc(spotlight.article.title[fr?"fr":"en"])+'</strong><small>'+esc(dateLabel(spotlight.contextDate,fr))+'</small></button>':"";
  const gospelSub=model.gospelReference||say("Available when the Proper resolves","Disponible après résolution du Propre");
  const cate=model.daily?.title||say("Daily Catechism","Catéchisme quotidien");
  return '<style data-ao-today-v2-style>'+TODAY_H4_CSS+'</style>'+
  '<main class="homeScreen aoTodayV2 aoTodayH4" data-home-language="'+vm.language+'" data-ao-home-presentation-owner="modular-home-presentation-v1">'+
  '<header class="aoH4Bar"><span class="aoH4Wordmark">AD ORIENTEM</span><button class="aoH4Utility" type="button" data-home-settings aria-label="'+esc(say("Settings","Réglages"))+'">⚙</button></header>'+
  '<div class="aoH4CalendarBack"><button type="button" data-home-calendar-today aria-label="'+esc(say("Back to Today","Retour à aujourd’hui"))+'">←</button><strong>'+esc(say("Calendar","Calendrier"))+'</strong></div>'+
  '<div class="aoTodayV2CalendarInline aoH4CalendarInline" data-home-calendar-inline hidden aria-label="'+esc(say("Liturgical calendar","Calendrier liturgique"))+'"></div>'+
  '<div class="aoH4TodayContent">'+
  '<div class="aoH4DateBar"><button class="aoH4DateOpen" type="button" data-home-calendar data-home-calendar-view="picker" data-home-calendar-date="'+esc(vm.dateIso)+'"><span class="aoH4Eyebrow">'+esc(vm.isToday?say("Today","Aujourd’hui"):say("Viewing","Jour choisi"))+' · '+esc(say("Calendar","Calendrier"))+'</span><strong>'+esc(vm.dateTitle)+'</strong></button>'+
  (!vm.isToday?'<button class="aoH4DateReset" type="button" data-home-restore-today>'+esc(say("Today","Aujourd’hui"))+'</button>':'')+'</div>'+
  '<nav class="dateRail aoH4Week" aria-label="'+esc(say("Week","Semaine"))+'">'+week+'</nav>'+
  '<section class="celebrationBlock aoTodayV2Frontispiece aoH4Door"><div class="aoTodayV2Art"><div class="aoTodayV2ArtSource" data-ao-home-art-slot><div class="aoTodayV2NoArt" aria-label="'+esc(say("No approved artwork","Sans œuvre d’art approuvée"))+'"></div></div></div>'+
  '<div class="aoTodayV2HeroActions aoH4MassBody"><div class="aoTodayV2DayIdentity"><span class="aoH4MassIdentity"><i class="aoH4Dot" aria-hidden="true"></i>'+esc([vm.rank,vm.colour].filter(Boolean).join(" · "))+'</span><h1>'+esc(vm.observedTitle)+'</h1></div>'+properIdentity+introit+
  '<section class="aoTodayV2Mass">'+mainAction+unresolved+
  '<button class="aoH4Change" type="button" data-home-h4-change><span>'+esc(say("Mass, ceremony & reader choices","Messe, forme et lecture"))+'</span><strong>'+esc(say("Change","Modifier"))+' ›</strong></button>'+
  '<div class="aoH4Acts"><button type="button" data-home-h4-readings>'+esc(say("Readings","Lectures"))+'</button><button type="button" data-action="prepare">'+esc(say("Prepare","Se préparer"))+'</button><button type="button" data-action="thanks">'+esc(say("Give thanks","Action de grâces"))+'</button></div></section></div></section>'+
  (coverage&&!coverage.complete?'<p class="aoH4Status" role="status">'+esc(say("Some translations are unavailable.","Certaines traductions sont indisponibles."))+'</p>':"")+
  '<section class="aoTodayV2PrayerThroughDay" id="ao-home-prayer-through-day" tabindex="-1"><div class="aoH4SectionHead"><h2>'+esc(say("Pray","Prier"))+'</h2><button type="button" data-home-cu-route="pray.library">'+esc(say("All prayers","Toutes les prières"))+' ›</button></div>'+
  '<div class="aoTodayV2Zone aoTodayV2PrayNow"><button type="button" class="aoH4Prayer" '+attrs+'><span class="aoH4PrayerGlyph" aria-hidden="true">✝</span><span class="aoH4PrayerText"><span class="aoH4Eyebrow">'+esc(nextRole)+(due?' · '+esc(due):'')+'</span><strong>'+esc(prayerTitle)+'</strong><small>'+esc(prayerCaption)+'</small></span><span aria-hidden="true">›</span></button>'+
  '<div class="aoH4Chips aoTodayV2PrayerShortcuts"><button '+rosaryAttr+' type="button">'+esc(say("Rosary","Rosaire"))+(rosaryRule?'<span class="aoH4Mine">'+esc(say("MY RULE","MA RÈGLE"))+'</span>':'')+'</button><button data-home-cu-route="pray.confession" type="button">'+esc(say("Confession","Confession"))+'</button><button data-home-cu-route="pray.adoration" type="button">'+esc(say("Adoration","Adoration"))+'</button></div></div></section>'+
  '<section class="aoTodayV2CalendarGlance"><div class="aoH4SectionHead"><h2>'+esc(say("This week","Cette semaine"))+'</h2></div><div class="aoH4Upcoming aoTodayV2GlanceEvents">'+upcoming+custom+'</div></section>'+
  '<div class="aoTodayV2Below" data-ao-home-enricher-owner="'+HOME_ENRICHERS_VERSION+'"><section class="aoTodayV2ReadReflect"><div class="aoH4SectionHead"><h2>'+esc(say("Read","Lire"))+'</h2></div><div class="aoH4Read">'+
  '<button type="button" data-action="gospel"><span><strong>'+esc(say("Gospel of the Mass","Évangile de la messe"))+'</strong><small>'+esc(gospelSub)+'</small></span><span class="aoH4Arrow" aria-hidden="true">›</span></button>'+
  '<button type="button" data-home-daily-catechism><span><strong>'+esc(cate)+'</strong><small>'+esc(model.daily?.description||say("Daily lesson","Leçon du jour"))+'</small></span><span class="aoH4Arrow" aria-hidden="true">›</span></button>'+
  '</div></section></div><div style="height:32px"></div></div></main>';
}
