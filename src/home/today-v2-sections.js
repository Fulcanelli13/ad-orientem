import { addDaysIso, buildLiturgicalYear, buildMajorCelebrations } from "../calendar/liturgical-year.js";
import { observedCycle } from "../calendar/observed-cycle.js";
import { canonical1962Commemorations } from "../calendar/traditional-day-adjudication.js";
import { observedCommemorationLabels } from "../calendar/observed-commemoration-labels.js";
import { buildReviewedSanctoralCards } from "../calendar/reviewed-sanctoral-cards.js";
import { getSharedSanctoralReadModel } from "../calendar/living-sanctoral-read-model.js";
import { HOME_ENRICHERS_VERSION } from "./enrichers.js";
import { homeSeasonalCustomForDate } from "../customs/seasonal-home-spotlight.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const L = (language,en,fr) => language === "fr" ? fr : en;
function homeReviewedHonours(observed,selected,language,readModel){
  if(!observed?.day?.main?.id||!readModel)return Object.freeze([]);
  try{
    return buildReviewedSanctoralCards({
      date:selected,language,jurisdiction:"UNSPECIFIED",
      observedPrincipalId:observed.day.main.id,
      observedCommemorationIds:canonical1962Commemorations(observed).map(x=>x.sourceId),
      ...readModel
    });
  }catch{return Object.freeze([]);}
}

export function buildTodayV2Sections(state,vm,enrichers,readModel=getSharedSanctoralReadModel()){
  const selected=vm.dateIso,language=vm.language,year=buildLiturgicalYear(selected),period=year.currentPeriod;
  const resolution=state?.resolution;
  // The store's selectedDate is canonical. Some resolver builds omit
  // resolution.date, while others stamp date on the resolution or day.
  // Respect any explicit stamp and never surface a previous day's feast while
  // a selection is resolving.
  const stamped=resolution?.date??resolution?.day?.date??null;
  const observed=!state?.resolving&&resolution?.status!=="failed"
    &&(!stamped||stamped===selected)&&resolution?.day?.main?resolution:null;
  const saintOrFeast=observed && observedCycle(observed)==="sanctorale"
    ? vm.celebration : null;
  // These are nominal general-calendar appointments, NOT an assertion that the
  // full 1962 precedence resolver has already observed each future celebration.
  const events=[...buildMajorCelebrations(selected),...buildMajorCelebrations(addDaysIso(year.end,1))]
    .filter(row=>row.date>selected)
    .sort((a,b)=>a.date.localeCompare(b.date));
  const unique=[];const seen=new Set();
  for(const row of events){
    if(seen.has(row.date+"|"+row.en))continue;
    unique.push(row);seen.add(row.date+"|"+row.en);
    if(unique.length===2)break;
  }
  const feature=enrichers?.visible?enrichers.comingUp?.rows?.[0]??null:null;
  const daily=enrichers?.visible?enrichers.dailyCatechism??null:null;
  const spotlight=homeSeasonalCustomForDate(selected);
  const historicalCommemorations=observed?observedCommemorationLabels(observed,{language}):Object.freeze([]);
  const modernHonours=homeReviewedHonours(observed,selected,language,readModel);
  return Object.freeze({selected,language,period,upcoming:unique,feature,daily,spotlight,
    saintOrFeast,hasObservedDay:!!observed,historicalCommemorations,modernHonours,
    gospelReference:vm.gospelReference||null,
    gospelStatus:vm.properStatus,
    gospelExcerpt:vm.gospelExcerpt||"",
  });
}
function dateDisplay(date,language){
  const [year,month,day]=date.split("-").map(Number);
  return new Intl.DateTimeFormat(language==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short"})
    .format(new Date(year,month-1,day,12));
}

function renderSeasonalCustomsSpotlight(selection,language){
 if(!selection)return "";
 const art=selection.article,loc=language==="fr"?"fr":"en";
 const txt=(en,fr)=>L(language,en,fr);
 const timing=selection.daysUntil===0
   ?txt("Tradition of this day","Tradition de ce jour")
   :txt("A tradition approaching","Une tradition à venir");
 const dateHuman=new Intl.DateTimeFormat(language==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"long"})
   .format(new Date(selection.contextDate+"T12:00:00Z"));
 const lead=selection.daysUntil>0
   ?txt("Associated with ","Liée au ")+dateHuman
   :txt("Associated with today's observance","Liée à la célébration du jour");
 const sources=(art.sources||[]).map(src=>
  '<li><a href="'+esc(src.url)+'" target="_blank" rel="noopener noreferrer">'+esc(src.title)+" ↗</a></li>"
 ).join("");
 const optional=txt("An optional custom; local practice and ministerial blessings may differ.","Coutume facultative ; les usages locaux et les bénédictions réservées au ministre peuvent varier.");
 return '<section class="aoTodayV2CustomSpotlight" data-home-custom-spotlight="'+esc(selection.id)+'" data-home-custom-date="'+esc(selection.contextDate)+'">'
 +'<div class="aoTodayV2CustomKicker">'+esc(timing)+'</div>'
 +'<h2>'+esc(art.title[loc])+'</h2>'
 +'<small class="aoTodayV2CustomTiming">'+esc(lead)+'</small>'
 +'<p class="aoTodayV2CustomSummary">'+esc(art.description[loc])+'</p>'
 +'<details class="aoTodayV2CustomDetails"><summary>'+esc(txt("Discover the tradition","Découvrir la coutume"))+' <span aria-hidden="true">›</span></summary>'
 +'<div class="aoTodayV2CustomReading">'
 +'<h3>'+esc(txt("History","Histoire"))+'</h3><p>'+esc(art.history[loc])+'</p>'
 +'<h3>'+esc(txt("Meaning","Signification"))+'</h3><p>'+esc(art.meaning[loc])+'</p>'
 +'<h3>'+esc(txt("Traditional practice","Pratique traditionnelle"))+'</h3><p>'+esc(art.practice[loc])+'</p>'
 +'<h3>'+esc(txt("Scope and cautions","Portée et précautions"))+'</h3><p>'+esc(art.scope[loc])+'</p><p>'+esc(art.caution[loc])+'</p>'
 +(sources?'<h3>'+esc(txt("Sources","Sources"))+'</h3><ul>'+sources+'</ul>':"")
 +'</div></details>'
 +'<p class="aoTodayV2CustomScope">'+esc(optional)+'</p>'
 +'<button type="button" data-home-calendar data-home-calendar-view="day" data-home-calendar-date="'+esc(selection.contextDate)+'" class="aoTodayV2CustomCalendarLink">'
 +esc(txt("View in Calendar","Voir dans le calendrier"))+' <span aria-hidden="true">›</span></button></section>';
}

export function renderTodayV2Sections(model,vm){
  const {language,period,feature,upcoming,daily,saintOrFeast,spotlight}=model;
  const txt=(en,fr)=>L(language,en,fr);
  const featureAttrs=feature?.kind==="dynamic"
    ? 'data-home-cu-dynamic="'+esc(feature.id)+'" data-home-cu-route="'+esc(feature.route||"pray.library")+'"'
    : 'data-home-cu-route="'+esc(feature?.route||"pray.library")+'"';
  const featureName=feature?.title||txt("Prayer Library","Livre de prières");
  const featureDetail=feature?.sub||txt("Choose a prayer for this moment","Choisir une prière pour ce moment");
  const featureRole=feature?.when||txt("Any time","À tout moment");
  // The hero already names the observance; keep this link about its context.
  // Preserve the Calendar Day owner; Saints handoff remains a separate PR.
  const saintTitle=saintOrFeast?txt("Life & sources","Vie et sources")
    :model.hasObservedDay?txt("About this celebration","À propos de cette célébration")
      :txt("Calendar day & sources","Jour du calendrier et sources");
  const saintDetail=saintOrFeast?txt("1962 observance · read the context","Observance de 1962 · découvrir le contexte")
    :model.hasObservedDay?txt("Liturgical day · context and sources","Jour liturgique · contexte et sources")
      :txt("Inspect the selected Calendar day","Consulter le jour choisi dans le calendrier");
  const gospelDetail=model.gospelReference||(
    model.gospelStatus==="ready"?txt("Read and explore the appointed Gospel","Lire et méditer l’Évangile du jour")
    :txt("Available when the Proper resolves","Disponible après résolution du Propre"));
  const cateTitle=daily?.title||txt("Daily Catechism","Catéchisme quotidien");
  const cateDetail=daily?.description||txt("Saint Pius X catechism","Catéchisme de saint Pie X");

  // Version C: one Home-owned calendar summary; source ownership remains
  // with the 1962 resolver and the separately reviewed later-calendar data.
  const historical=(model.historicalCommemorations||[]).map(c=>
    `<button type="button" class="aoTodayV2ObservedRow" data-home-calendar data-home-calendar-view="day"><strong>${esc(c.name)}</strong><span aria-hidden="true">›</span></button>`
  ).join("");
  const contemporary=(model.modernHonours||[]).map(c=>{
    const dateScope=c.dateAuthorityStatus==="DATE_ATTESTED_JURISDICTION_NOT_ESTABLISHED"
      ?txt("Liturgical date · local scope unverified","Date liturgique · portée locale non vérifiée")
      :c.dateAuthorityStatus==="UNIVERSAL_GENERAL_ROMAN"
        ?txt("Modern Roman calendar","Calendrier romain actuel")
        :txt("Particular calendar reference","Référence de calendrier particulier");
    return `<button type="button" class="aoTodayV2ObservedRow" data-home-calendar data-home-calendar-view="day"><span><strong>${esc(c.title)}</strong><small>${esc(dateScope)}</small></span><span aria-hidden="true">›</span></button>`;
  }).join("");
  const calendarHonours=historical
    ?`<div class="aoTodayV2GlanceHonours"><div class="aoTodayV2GlanceCategory">${esc(txt("1962 Mass commemoration","Commémoraison à la messe de 1962"))}</div>${historical}</div>`:"";
  const calendarLater=contemporary
    ?`<div class="aoTodayV2GlanceHonours"><div class="aoTodayV2GlanceCategory">${esc(txt("Later calendar","Calendrier ultérieur"))}</div>${contemporary}<p class="aoTodayV2GlanceCaveat">${esc(txt("The prescribed 1962 Mass remains unchanged","La messe prescrite de 1962 reste inchangée"))}</p></div>`:"";
  const row=(title,subtitle,attributes)=>'<button type="button" class="aoTodayV2EditorialRow" '+attributes+'><span><strong>'+esc(title)+'</strong><small>'+esc(subtitle)+'</small></span><span class="aoTodayV2Arrow" aria-hidden="true">›</span></button>';

  const calendarDates=upcoming.map(rowData=>{
    const name=language==="fr" ? rowData.fr : rowData.en;
    return `<button type="button" class="aoTodayV2Event" data-home-calendar data-home-calendar-view="day" data-home-calendar-date="${esc(rowData.date)}" aria-label="${esc(dateDisplay(rowData.date,language)+" · "+name)}"><span class="aoTodayV2EventDate">${esc(dateDisplay(rowData.date,language))}</span><strong>${esc(name)}</strong></button>`;
  }).join("");
  const glanceNote=txt("Upcoming calendar dates · confirm actual 1962 observance in Calendar","Dates à venir · vérifier la célébration effective de 1962 dans le calendrier");
  return `<section class="aoTodayV2CalendarGlance" aria-label="${esc(txt("Calendar at a glance","Aperçu du calendrier"))}">
    <h2>${esc(txt("Calendar at a glance","Aperçu du calendrier"))}</h2>
    ${calendarHonours}${calendarLater}
    <div class="aoTodayV2GlanceEvents">${calendarDates||'<p class="aoTodayV2GlanceEmpty">'+esc(txt("See dates in Calendar","Consulter les dates dans le calendrier"))+'</p>'}</div>
    <p class="aoTodayV2GlanceNote">${esc(glanceNote)}</p>
  </section>
  ${renderSeasonalCustomsSpotlight(spotlight,language)}
  <div class="aoTodayV2Below" data-ao-home-enricher-owner="${HOME_ENRICHERS_VERSION}">
    <section class="aoTodayV2Zone aoTodayV2PrayNow"><div class="aoTodayV2SectionHead"><div><h2>${esc(txt("Pray now","Prier maintenant"))}</h2></div><button type="button" data-home-cu-route="pray.library">${esc(txt("All prayers","Toutes les prières"))} →</button></div>
      <div class="aoTodayV2PrayerFeature"><div class="aoTodayV2PrayerGlyph" aria-hidden="true"></div><div><small>${esc(featureRole)}</small><strong>${esc(featureName)}</strong><span>${esc(featureDetail)}</span></div><button type="button" ${featureAttrs}>${esc(txt("Pray","Prier"))}</button></div>
      <div class="aoTodayV2PrayerShortcuts">
        <button type="button" data-home-cu-route="pray.rosary">${esc(txt("Rosary","Rosaire"))}</button>
        <button type="button" data-home-cu-route="pray.confession">${esc(txt("Confession","Confession"))}</button>
        <button type="button" data-home-cu-route="pray.adoration">${esc(txt("Adoration","Adoration"))}</button>
      </div>
    </section>
    <section class="aoTodayV2Zone aoTodayV2ReadReflect"><div class="aoTodayV2SectionHead"><div><h2>${esc(txt("Read & reflect","Lire et méditer"))}</h2></div></div>
      ${row(saintTitle,saintDetail,'data-home-calendar data-home-calendar-view="day"')}
      ${row(txt("The Gospel of the Mass","Évangile de la messe"),gospelDetail,'data-action="gospel"')}
      ${row(cateTitle,cateDetail,'data-home-daily-catechism')}
      ${row(txt("Sacred Scripture","Sainte Écriture"),txt("Read the traditional Catholic Bible","Lire la Bible catholique traditionnelle"),'data-home-scripture')}
    </section>
  </div>`;
}
