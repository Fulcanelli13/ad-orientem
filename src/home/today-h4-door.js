// H4 Today presentation. All content comes from existing Home, 1962 Calendar,
// prayer-rule, Mass Proper and curated-art owners; no fixture days or images.
export const TODAY_H4_VERSION="today-h4-door-v1";
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const labels=(fr,en,french)=>fr?french:en;
function colourOf(name){
 const normalized=String(name??"").trim().toLowerCase();
 const palette={green:"#62a473",vert:"#62a473",white:"#e9e0c9",blanc:"#e9e0c9",red:"#d0574a",rouge:"#d0574a",black:"#8c8c8c",noir:"#8c8c8c",violet:"#9a7bc4",purple:"#9a7bc4",rose:"#d99aae"};
 return palette[normalized]??null;
}
function weekdayBar(vm){
 return vm.week.map(c=>`<button type="button" class="dayCell${c.selected?" selected":""}${c.today?" today":""}" data-date="${escapeHtml(c.date)}" aria-pressed="${c.selected}" aria-label="${escapeHtml(c.date)}" ${c.selected?'aria-current="date"':""}><span>${escapeHtml(c.day)}</span><b>${escapeHtml(c.number)}</b><i class="aoWeekColour" aria-hidden="true" ${c.selected&&colourOf(vm.colour)?'style="background:'+colourOf(vm.colour)+'"':""}></i></button>`).join("");
}
function dateLabel(iso,fr){
 const date=new Date(iso+"T12:00:00");
 return Number.isFinite(date.getTime())
  ?new Intl.DateTimeFormat(fr?"fr-FR":"en-GB",{weekday:"short",day:"numeric",month:"short"}).format(date).replace(".","")
  :iso;
}
function prayerNow(feature,vm){
 const fr=vm.language==="fr";
 if(!feature)return null;
 const route=String(feature.route??"pray.library");
 const id=String(feature.id??"");
 const due=Number(feature.due);
 const time=Number.isInteger(due)&&due>=0&&due<1440
  ?String(Math.floor(due/60)).padStart(2,"0")+":"+String(due%60).padStart(2,"0")
  :null;
 // Never label a future 18:00 Angelus as the CURRENT evening prayer.
 const next=feature.kind!=="dynamic";
 const when=next&&time?labels(fr,"Next · ","À venir · ")+time
  :(feature.role||labels(fr,"Pray","Prier"));
 return {
  route,id,
  when,name:feature.title||labels(fr,"Prayer","Prière"),
  description:next&&time
   ?labels(fr,"At ","À ")+time
   :(feature.sub||labels(fr,"Open this prayer","Ouvrir cette prière"))
 };
}
export function renderTodayH4({state,vm,sections,resume,assetIcon,version,css}){
 const fr=vm.language==="fr",t=(en,french)=>labels(fr,en,french),esc=escapeHtml;
 const ready=vm.resolvedForSelection&&vm.properStatus==="ready"&&!vm.loading;
 const resumeTitle=resume?t("Resume Mass","Reprendre la messe"):t("Open Mass","Ouvrir la messe");
 const resumeDetail=resume?.sectionId||resume?.date||"";
 const summary=vm.massFormularyName||t("Mass of the day","Messe du jour");
 const dayStatus=vm.calendarFailed?t("Calendar unavailable","Calendrier indisponible"):vm.loading?
  t("Resolving the liturgical day…","Résolution du jour liturgique…"):
  vm.properStatus!=="ready"?t("The Mass texts are not yet available from this source.","Les textes de cette messe ne sont pas encore disponibles depuis cette source."):"";
 const title=t("AD ORIENTEM","AD ORIENTEM");
 const massPrimary=resume?
   `<button type="button" class="aoH4Primary aoTodayV2PrimaryMass" data-resume-mass data-ao-resume-owner="${esc(resume.source)}"><span><strong>${esc(resumeTitle)}</strong><small>${esc(resumeDetail)}</small></span><span class="aoH4Arrow" aria-hidden="true">›</span></button>`:
   `<button type="button" class="aoH4Primary aoTodayV2PrimaryMass" data-home-mass-entry ${!ready?"disabled aria-disabled=\"true\"":""}><span><strong>${esc(vm.isToday?t("Open today's Mass","Ouvrir la messe du jour"):t("Open selected Mass","Ouvrir la messe choisie"))}</strong><small>${esc(t("1962 Proper · LIVE or Missal","Propre de 1962 · DIRECT ou Missel"))}</small></span><span class="aoH4Arrow" aria-hidden="true">›</span></button>`;
 const massCredit=vm.massIntroit?'<p class="aoH4Introit" lang="la">'+esc(vm.massIntroit)+"</p>":"";
 const dot=colourOf(vm.colour);
 const feature=vm.isToday?prayerNow(sections.feature,vm):null;
 const featureAttrs=sections.feature?.kind==="dynamic"
  ?'data-home-cu-dynamic="'+esc(sections.feature.id)+'" data-home-cu-route="'+esc(feature?.route||"pray.library")+'"'
  :'data-home-cu-route="'+esc(feature?.route||"pray.library")+'"';
 const rule=vm.isToday?sections.enricherRule:null;
 const rosaryIsRule=rule?.id==="rosary"&&rule.kind==="static";
 const rosary=`<button type="button" data-home-cu-route="pray.rosary">${esc(t("Rosary","Rosaire"))}${rosaryIsRule?'<small class="aoH4Mine">'+esc(t("MY RULE","MA RÈGLE"))+"</small>":""}</button>`;
 const eventCards=sections.upcoming.map(e=>{
  const name=fr?e.fr:e.en;
  return `<button type="button" data-home-calendar data-home-calendar-view="day" data-home-calendar-date="${esc(e.date)}"><span class="aoH4Eyebrow">${esc(dateLabel(e.date,fr))}</span><strong>${esc(name)}</strong><small>${esc(t("View in Calendar","Voir dans le calendrier"))}</small></button>`;
 }).join("");
 const custom=sections.spotlight;
 const customCard=custom?.article?`<button type="button" data-home-calendar data-home-calendar-view="day" data-home-calendar-date="${esc(custom.contextDate)}"><span class="aoH4Eyebrow">${esc(t("Tradition","Coutume"))} · ${esc(dateLabel(custom.contextDate,fr))}</span><strong>${esc(fr?custom.article.title.fr:custom.article.title.en)}</strong><small>${esc(t("History and practice","Histoire et pratique"))}</small></button>`:"";
 const gospel=sections.gospelReference||t("Available once the Proper resolves","Disponible après résolution du Propre");
 const daily=sections.daily;
 const prayerSection=`<div class="aoH4SectionHead"><h2>${esc(t("Pray","Prier"))}</h2><button type="button" data-home-cu-route="pray.library">${esc(t("All prayers","Toutes les prières"))} ›</button></div>
 ${feature?`<button type="button" class="aoH4Prayer" ${featureAttrs}><span class="aoH4PrayerGlyph" aria-hidden="true">✣</span><span class="aoH4PrayerText"><span class="aoH4Eyebrow">${esc(feature.when)}</span><strong>${esc(feature.name)}</strong><small>${esc(feature.description)}</small></span><span aria-hidden="true">›</span></button>`:""}
 <div class="aoH4Chips">${rosary}<button type="button" data-home-cu-route="pray.confession">${esc(t("Confession","Confession"))}</button><button type="button" data-home-cu-route="pray.adoration">${esc(t("Adoration","Adoration"))}</button></div>`;
 const calendarNotice=!vm.isToday?`<button type="button" class="aoH4DateReset" data-home-restore-today>${esc(t("Today","Aujourd’hui"))}</button>`:"";
 const massIdentity=[vm.rank,vm.colour].filter(Boolean).join(" · ");
 return `<style data-ao-today-v2-style>${css}</style>
 <main class="homeScreen aoTodayV2 aoTodayH4" data-home-language="${vm.language}" data-ao-home-presentation-owner="${esc(version)}" data-ao-today-layout="${TODAY_H4_VERSION}">
 <header class="aoH4Bar"><strong class="aoH4Wordmark">${title}</strong><button type="button" class="aoH4Utility" data-home-settings aria-label="${esc(t("Settings","Réglages"))}">${assetIcon("ao-ui-settings")}</button></header>
 <div class="aoH4CalendarBack"><button type="button" data-home-calendar-today aria-label="${esc(t("Return to Today","Retour à aujourd’hui"))}">‹</button><strong>${esc(t("Calendar","Calendrier"))}</strong></div>
 <div class="aoTodayV2CalendarInline aoH4CalendarInline" data-home-calendar-inline hidden aria-label="${esc(t("Liturgical calendar","Calendrier liturgique"))}"></div>
 <div class="aoH4TodayContent">
 <div class="aoH4DateBar dateNavigator"><button type="button" class="aoH4DateOpen dateTitle" data-home-calendar data-home-calendar-view="picker" data-home-calendar-date="${esc(vm.dateIso)}"><span class="aoH4Eyebrow">${esc(vm.isToday?t("Today","Aujourd’hui"):t("Viewing","Jour choisi"))}</span><strong>${esc(vm.dateTitle)}</strong></button>${calendarNotice}</div>
 <div class="dateRail aoH4Week" aria-label="${esc(t("Liturgical week","Semaine liturgique"))}">${weekdayBar(vm)}</div>
 <section class="celebrationBlock aoEditorialHero aoTodayV2Frontispiece aoH4Door" ${dot?'style="--ao-liturgical-color:'+dot+'"':""} aria-label="${esc(t("The Mass","La messe"))}">
 <div class="aoTodayV2Art"><div class="aoTodayV2ArtSource" data-ao-home-art-slot></div></div>
 <div class="aoTodayV2HeroActions aoH4MassBody">
 <div class="aoH4MassIdentity">${dot?'<i class="aoH4Dot" aria-hidden="true"></i>':""}<span>${esc(massIdentity)}</span></div>
 <h1>${esc(vm.observedTitle)}</h1><p class="aoH4Formulary">${esc(summary)}</p>${massCredit}
 <section class="aoTodayV2Mass">${dayStatus?'<div class="aoH4Status" role="status">'+esc(dayStatus)+"</div>":""}
 ${massPrimary}
 <button type="button" class="aoH4Change" data-home-mass-change><span>${esc(t("Ceremony, reading and prayer preferences","Forme, lecture et prières"))}</span><strong>${esc(t("Change","Modifier"))}</strong></button>
 <div class="aoH4Acts"><button type="button" data-home-h4-readings>${esc(t("Readings","Lectures"))}</button><button type="button" data-action="prepare">${esc(t("Prepare","Se préparer"))}</button><button type="button" data-action="thanks">${esc(t("Give thanks","Remercier"))}</button></div>
 </section></div></section>
 <div id="ao-home-prayer-through-day" class="aoTodayV2PrayerThroughDay aoTodayV2PrayNow" tabindex="-1">${prayerSection}</div>
 <section class="aoH4WeekSection"><div class="aoH4SectionHead"><h2>${esc(t("This week","Cette semaine"))}</h2><button type="button" data-home-calendar data-home-calendar-view="picker">${esc(t("Calendar","Calendrier"))} ›</button></div><div class="aoH4Upcoming">${eventCards}${customCard}</div></section>
 <div class="aoTodayV2Below" data-ao-home-enricher-owner="modular-home-enrichers-v1">
 <div class="aoH4SectionHead"><h2>${esc(t("Read","Lire"))}</h2></div>
 <div class="aoH4Read"><button type="button" data-action="gospel"><span>✦</span><span><strong>${esc(t("The Gospel","L’Évangile"))}</strong><small>${esc(gospel)}</small></span><span class="aoH4Arrow" aria-hidden="true">›</span></button>
 <button type="button" data-home-daily-catechism><span>✦</span><span><strong>${esc(daily?.title||t("Daily Catechism","Catéchisme quotidien"))}</strong><small>${esc(daily?.badge||t("St Pius X","Saint Pie X"))}</small></span><span class="aoH4Arrow" aria-hidden="true">›</span></button></div></div>
 </div></main>`;
}
