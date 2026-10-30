// H4 Today door. Pure, source-owned projection of the canonical Home view model.
// No fixture dates, Mass catalogue, art mapping, or parallel preference store.
import { TODAY_H4_CSS } from "./today-h4-styles.js";
import { H7_SANCTUARY_CSS } from "./h7-sanctuary-authoritative-css.js";
import { HOME_ENRICHERS_VERSION } from "./enrichers.js";
import { homeDidYouKnowMarkup } from "./did-you-know-glossary.js";
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
  // H4 is the approved Home. The old Today is retained as an explicit,
  // reversible query-only rollback while the production transition settles.
  try{return new URLSearchParams(win?.location?.search??"").get("aoTodayH4")!=="0"}catch{return true}
}
export function h4HomeView(vm,model,{resume=null,coverage=null,choices=null}={}){
  const fr=vm.language==="fr",say=(en,frText)=>L(fr,en,frText),ready=vm.resolvedForSelection&&vm.properStatus==="ready"&&!vm.loading;
  const week=vm.week.map(d=>'<button type="button" class="dayCell'+(d.selected?' selected':'')+(d.today?' today':'')+'" data-date="'+esc(d.date)+'" aria-pressed="'+d.selected+'"><span class="w">'+esc(d.day)+'</span><b class="n">'+esc(d.number)+'</b><i class="aoWeekColour" data-home-week-colour="'+esc(d.date)+'" aria-hidden="true"></i></button>').join("");
  // Keep actual formulary identity ahead of the Calendar's attested weekday context.
  // The latter is never mislabelled as an appointed Sunday Mass.
  const subtitle=vm.massFormularyName||vm.contextualObservanceName;
  const properIdentity=subtitle?'<p class="aoH4Formulary">'+esc(subtitle)+'</p>':"";
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
    '<button type="button" class="aoH4Primary" data-home-mass-entry data-home-h4-begin'+(ready?'':' disabled aria-disabled="true"')+'><span><strong>'+esc(vm.isToday?say("Begin Mass","Commencer la messe"):say("Begin selected Mass","Commencer la messe choisie"))+'</strong><small>'+esc(selectedChoices)+'</small></span><span class="aoH4Arrow" aria-hidden="true">›</span></button>';
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

  return '<style data-ao-today-v2-style>'+TODAY_H4_CSS+'\n'+H7_SANCTUARY_CSS+'</style>'+
  '<main class="homeScreen aoTodayV2 aoTodayH4 aoH7Screens" data-home-language="'+vm.language+'" data-ao-home-presentation-owner="modular-home-presentation-v1">'+
  '<div class="aoH4CalendarBack"><button type="button" data-home-calendar-today aria-label="'+esc(say("Back to Home","Retour à l’accueil"))+'">←</button><strong>'+esc(say("Calendar","Calendrier"))+'</strong><button type="button" class="aoH4CalendarHelp" data-home-calendar-glossary aria-label="'+esc(say("Terms and definitions","Termes et définitions"))+'">?</button></div>'+
  '<nav class="aoH4CalendarViews" aria-label="'+esc(say("Calendar views","Vues du calendrier"))+'">'+
  '<button type="button" data-home-calendar data-home-calendar-view="day">'+esc(say("Day","Jour"))+'</button>'+
  '<button type="button" data-home-calendar data-home-calendar-view="picker">'+esc(say("Month","Mois"))+'</button>'+
  '<button type="button" data-home-calendar data-home-calendar-view="year">'+esc(say("Liturgical Year","Année liturgique"))+'</button></nav>'+
  '<div class="aoTodayV2CalendarInline aoH4CalendarInline" data-home-calendar-inline hidden aria-label="'+esc(say("Liturgical calendar","Calendrier liturgique"))+'"></div>'+
  '<div class="aoH4TodayContent">'+
  // Claude H7 Prototype 1: homepage is the full-bleed painting and single Mass entry.
  '<div class="aoH7HomeView home">'+
  '<section class="celebrationBlock aoTodayV2Frontispiece hero aoH7Hero">'+
  '<div class="aoTodayV2Art"><div class="aoTodayV2ArtSource art" data-ao-home-art-slot><div class="aoTodayV2NoArt" aria-label="'+esc(say("No approved artwork","Aucune œuvre approuvée"))+'"></div></div></div>'+
  '<div class="sh"></div><div class="top"><span class="wm">AD ORIENTEM</span>'+
  '<button class="ib" type="button" data-home-calendar data-home-calendar-view="picker" aria-label="'+esc(say("Calendar","Calendrier"))+'"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg></button>'+
  '<button class="ib" type="button" data-home-settings aria-label="'+esc(say("Settings","Réglages"))+'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 5.2l2.1 2.1M16.7 16.7l2.1 2.1M5.2 18.8l2.1-2.1M16.7 7.3l2.1-2.1"/></svg></button></div>'+
  '<div class="aoTodayV2HeroActions tx"><button class="date" type="button" data-home-calendar data-home-calendar-view="picker" data-home-calendar-date="'+esc(vm.dateIso)+'"><span class="eb">'+esc(vm.isToday?say("Today","Aujourd’hui"):say("Selected","Jour choisi"))+'</span><b>'+esc(vm.dateTitle)+'</b><span aria-hidden="true">⌄</span></button>'+
  '<span class="rb">'+esc([vm.weekday,vm.rank,vm.colour].filter(Boolean).join(" · "))+'</span>'+
  '<h1>'+esc(vm.observedTitle)+'</h1>'+properIdentity.replace('class="aoH4Formulary"','class="aoH4Formulary ml"')+
  '<div class="mks"><span class="mk">'+esc(vm.rank)+'</span><span class="mk c">'+esc(vm.colour)+'</span></div>'+
  '<section class="aoTodayV2Mass"><button type="button" class="btn glass aoH7Enter" data-home-h7-enter>'+
  '<span><b>'+esc(say("Enter the Mass","Entrer dans la messe"))+'</b><small lang="la">'+esc(vm.massIntroit||say("Mass of the day","Messe du jour"))+'</small></span>'+
  '<span class="ar" aria-hidden="true">›</span></button></section></div></section>'+
  '<nav class="dateRail aoH4Week wk aoH7Week" aria-label="'+esc(say("Week","Semaine"))+'">'+week+'</nav>'+
  (coverage&&!coverage.complete?'<p class="aoH4Status" role="status">'+esc(say("Some translations are unavailable.","Certaines traductions sont indisponibles."))+'</p>':"")+
  '<section class="aoTodayV2PrayerThroughDay sec" id="ao-home-prayer-through-day" tabindex="-1"><div class="aoH4SectionHead"><h2>'+esc(say("Pray","Prier"))+'</h2><button type="button" data-home-cu-route="pray.library">'+esc(say("All prayers","Toutes les prières"))+' ›</button></div>'+
  '<div class="aoTodayV2Zone aoTodayV2PrayNow"><button type="button" class="aoH4Prayer np" '+attrs+'><span class="aoH4PrayerGlyph" aria-hidden="true">✝</span><span class="aoH4PrayerText"><span class="aoH4Eyebrow">'+esc(nextRole)+(due?' · '+esc(due):'')+'</span><strong>'+esc(prayerTitle)+'</strong><small>'+esc(prayerCaption)+'</small></span><span aria-hidden="true">›</span></button>'+
  '<div class="aoH4Chips aoTodayV2PrayerShortcuts chips"><button '+rosaryAttr+' type="button">'+esc(say("Rosary","Rosaire"))+(rosaryRule?'<span class="aoH4Mine">'+esc(say("MY RULE","MA RÈGLE"))+'</span>':'')+'</button><button data-home-cu-route="pray.confession" type="button">'+esc(say("Confession","Confession"))+'</button><button data-home-cu-route="pray.adoration" type="button">'+esc(say("Adoration","Adoration"))+'</button></div></div></section>'+
  '<section class="aoTodayV2CalendarGlance"><div class="aoH4SectionHead"><h2>'+esc(say("This week","Cette semaine"))+'</h2><button type="button" data-home-calendar data-home-calendar-view="picker">'+esc(say("Calendar","Calendrier"))+' ›</button></div><div class="aoH4Upcoming aoTodayV2GlanceEvents wkc">'+upcoming+custom+'</div></section>'+
  '<section class="aoH4DiscoveryStandalone" aria-label="'+esc(say("Did you know?","Le saviez-vous ?"))+'">'+homeDidYouKnowMarkup(vm.language)+'</section>'+
  '<div class="aoTodayV2Below" data-ao-home-enricher-owner="'+HOME_ENRICHERS_VERSION+'"><section class="aoTodayV2ReadReflect"><div class="aoH4SectionHead"><h2>'+esc(say("Read","Lire"))+'</h2></div><div class="aoH4Read">'+
  '<button type="button" class="row" data-action="gospel"><span><strong>'+esc(say("Gospel of the Mass","Évangile de la messe"))+'</strong><small>'+esc(gospelSub)+'</small></span><span class="aoH4Arrow" aria-hidden="true">›</span></button>'+
  '</div></section></div><div style="height:32px"></div></div></div>'+
  '<div class="aoH7DoorView" hidden><div class="band" style="height:150px"><div class="aoH7DoorArt art6"></div>'+
  '<button type="button" class="ib back" data-home-h7-back aria-label="'+esc(say("Back","Retour"))+'"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button></div>'+
  '<div class="body door"><div class="dhead"><span class="rb">'+esc([vm.weekday,vm.rank,vm.colour].filter(Boolean).join(" · "))+'</span><span class="cr">✠</span>'+
  '<h2>'+esc(vm.observedTitle)+'</h2><p class="ver">'+esc(vm.dateTitle)+'</p>'+
  '<div class="mks"><span class="mk">'+esc(vm.rank)+'</span><span class="mk c">'+esc(vm.colour)+'</span></div></div><div class="dr"></div>'+
  (subtitle?'<p class="why">'+esc(subtitle)+'</p>':"")+
  '<div class="dsec"><div class="ordo"><div><small>Gloria</small><b class="no">—</b></div><div><small>Credo</small><b class="no">—</b></div><div><small>'+esc(say("Preface","Préface"))+'</small><b class="no">—</b></div></div>'+
  (vm.massIntroit?'<div class="intr" style="margin-top:18px"><span class="rb">Introitus</span><p lang="la"><span class="drop">'+esc(vm.massIntroit.slice(0,1))+'</span>'+esc(vm.massIntroit.slice(1))+'</p></div>':"")+
  '<span class="rb">'+esc(say("The Proper","Le Propre"))+'</span>'+
  ['Introit','Collect','Epistle','Gospel','Offertory','Communion'].map(x=>'<button type="button" class="lrow" data-home-h4-readings><span>'+esc(x)+'</span><span class="ch" aria-hidden="true">›</span></button>').join("")+
  (vm.formularies.length?'<span class="rb">'+esc(say("Other Masses permitted","Autres messes permises"))+'</span>'+vm.formularies.map(x=>'<button class="lrow" type="button" data-formulary="'+x.index+'"><span>'+esc(x.label)+'</span><span class="ch">›</span></button>').join(""):"")+
  '<span class="rb">'+esc(say("Your Mass","Votre messe"))+'</span><button type="button" class="lrow" data-home-h4-change><span>'+esc(selectedChoices)+'</span><small>'+esc(say("Change","Modifier"))+'</small><span class="ch" aria-hidden="true">›</span></button>'+
  '</div><div class="endsp"></div></div><div class="foot">'+mainAction.replace('class="aoH4Primary"','class="aoH4Primary btn"')+
  unresolved+'<div class="mini"><button type="button" data-action="prepare">'+esc(say("Prepare","Se préparer"))+'</button>'+
  '<button type="button" data-action="thanks">'+esc(say("Give thanks","Action de grâces"))+'</button>'+
  '<button type="button" data-home-h4-change>'+esc(say("Change","Modifier"))+'</button></div></div></div></main>';

}
