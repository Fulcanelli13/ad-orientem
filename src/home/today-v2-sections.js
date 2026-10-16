import { addDaysIso, buildLiturgicalYear, buildMajorCelebrations } from "../calendar/liturgical-year.js";
import { observedCycle } from "../calendar/observed-cycle.js";
import { canonical1962Commemorations } from "../calendar/traditional-day-adjudication.js";
import { buildReviewedSanctoralCards } from "../calendar/reviewed-sanctoral-cards.js";
import { getSharedSanctoralReadModel } from "../calendar/living-sanctoral-read-model.js";
import { HOME_ENRICHERS_VERSION } from "./enrichers.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const L = (language,en,fr) => language === "fr" ? fr : en;
// Read only the resolved 1962 day's actual commemorations; never promote
// displaced source candidates or opaque date codes to historical observances.
function home1962Commemorations(resolution,language){
  for(const value of [resolution?.day?.commemorations,resolution?.day?.main?.commemorations,resolution?.commemorations]){
    const items=Array.isArray(value)?value:value==null?[]:[value];
    const out=[],seen=new Set();
    for(const item of items){
      const raw=typeof item==="string"?item:
        language==="fr"?
          item?.titleFr||item?.nameFr||item?.title?.fr||item?.title?.en||item?.title||item?.name:
          item?.title?.en||item?.titleEn||item?.title||item?.nameEn||item?.name;
      const name=typeof raw==="string"?raw.trim():"";
      if(!name||/^(?:\d{1,2}[-_/]\d{1,4}|(?:sancti|tempora):)/i.test(name))continue;
      const key=typeof item==="object"&&item?.id?item.id.replace(/:[1-4]:[a-z]{1,3}$/i,""):name.toLowerCase();
      if(seen.has(key))continue;
      seen.add(key);
      out.push(Object.freeze({id:key,name,authority:"1962_MASS_COMMEMORATION"}));
    }
    if(out.length)return Object.freeze(out);
  }
  return Object.freeze([]);
}
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
  const historicalCommemorations=observed?home1962Commemorations(observed,language):Object.freeze([]);
  const modernHonours=homeReviewedHonours(observed,selected,language,readModel);
  return Object.freeze({selected,language,period,upcoming:unique,feature,daily,
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
export function renderTodayV2Sections(model,vm){
  const {language,period,feature,upcoming,daily,saintOrFeast}=model;
  const txt=(en,fr)=>L(language,en,fr);
  const next=upcoming[0];
  const featureAttrs=feature?.kind==="dynamic"
    ? 'data-home-cu-dynamic="'+esc(feature.id)+'" data-home-cu-route="'+esc(feature.route||"pray.library")+'"'
    : 'data-home-cu-route="'+esc(feature?.route||"pray.library")+'"';
  const featureName=feature?.title||txt("Prayer Library","Livre de prières");
  const featureDetail=feature?.sub||txt("Choose a prayer for this moment","Choisir une prière pour ce moment");
  const featureRole=feature?.when||txt("Any time","À tout moment");
  const saintTitle=saintOrFeast||txt("Saints and feasts of this day","Saints et fêtes de ce jour");
  const saintDetail=saintOrFeast?txt("Observed feast · sources","Fête observée · sources")
    :txt("Open the resolved calendar day","Ouvrir le jour liturgique résolu");
  const gospelDetail=model.gospelReference||(
    model.gospelStatus==="ready"?txt("Read and explore the appointed Gospel","Lire et méditer l’Évangile du jour")
    :txt("Available when the Proper resolves","Disponible après résolution du Propre"));
  const cateTitle=daily?.title||txt("Daily Catechism","Catéchisme quotidien");
  const cateDetail=daily?.description||txt("Saint Pius X catechism","Catéchisme de saint Pie X");
  const historical=(model.historicalCommemorations||[]).map(c=>
    '<button type="button" class="aoTodayV2ObservedRow" data-home-calendar data-home-calendar-view="day"><span><small>'+
    esc(txt("1962 Mass commemoration","Commémoraison à la messe de 1962"))+'</small><strong>'+
    esc(c.name)+'</strong></span><span class="aoTodayV2Arrow" aria-hidden="true">›</span></button>'
  ).join("");
  const contemporary=(model.modernHonours||[]).map(c=>{
    const dateScope=c.dateAuthorityStatus==="DATE_ATTESTED_JURISDICTION_NOT_ESTABLISHED"
      ?txt("Liturgical date · local scope unverified","Date liturgique · portée locale non vérifiée")
      :c.dateAuthorityStatus==="UNIVERSAL_GENERAL_ROMAN"
        ?txt("Modern Roman calendar","Calendrier romain actuel")
        :txt("Particular calendar reference","Référence de calendrier particulier");
    return '<button type="button" class="aoTodayV2ObservedRow" data-home-calendar data-home-calendar-view="day"><span><small>'+
      esc(dateScope)+'</small><strong>'+esc(c.title)+'</strong><em>'+
      esc(txt("The prescribed 1962 Mass remains unchanged","La messe prescrite de 1962 reste inchangée"))+
      '</em></span><span class="aoTodayV2Arrow" aria-hidden="true">›</span></button>';
  }).join("");
  const honouredSection=historical||contemporary?
    '<section class="aoTodayV2Honoured" aria-label="'+esc(txt("Also observed today","Également honorés aujourd'hui"))+
    '"><div class="aoTodayV2HonouredHeading"><small>'+
    esc(txt("IN THE CHURCH TODAY","DANS L'ÉGLISE AUJOURD'HUI"))+'</small><h2>'+
    esc(txt("Also honoured today","Également honorés aujourd'hui"))+
    '</h2></div>'+historical+contemporary+'</section>':"";
  const row=(title,subtitle,attributes)=>'<button type="button" class="aoTodayV2EditorialRow" '+attributes+'><span><strong>'+esc(title)+'</strong><small>'+esc(subtitle)+'</small></span><span class="aoTodayV2Arrow" aria-hidden="true">›</span></button>';
  const monthLink='data-home-calendar data-home-calendar-view="picker"';
  const yearLink='data-home-calendar data-home-calendar-view="year"';
  const calendarDates=upcoming.map(rowData=>{
    const name=language==="fr" ? rowData.fr : rowData.en;
    return '<button type="button" class="aoTodayV2Event" data-home-calendar data-home-calendar-view="day" data-home-calendar-date="'+esc(rowData.date)+'"><span class="aoTodayV2EventDate">'+esc(dateDisplay(rowData.date,language))+'</span><span><strong>'+esc(name)+'</strong><small>'+esc(txt("Calendar date · verify observance in Calendar","Date du calendrier · vérifier la célébration dans le calendrier"))+'</small></span><span aria-hidden="true">›</span></button>';
  }).join("");
  return `<div class="aoTodayV2Context">
    <button type="button" ${yearLink}><small>${esc(txt("LITURGICAL TIME","TEMPS LITURGIQUE"))}</small><strong>${esc(language==="fr"?period.fr:period.en)}</strong></button>
    <button type="button" ${monthLink}><small>${esc(txt("COMING SOON","À VENIR"))}</small><strong>${esc(next?language==="fr"?next.fr:next.en:txt("Full calendar","Calendrier complet"))}</strong>${next?'<span>'+esc(dateDisplay(next.date,language))+'</span>':""}</button>
  </div>
  ${honouredSection}
  <div class="aoTodayV2Below" data-ao-home-enricher-owner="${HOME_ENRICHERS_VERSION}">
    <section class="aoTodayV2Zone aoTodayV2PrayNow"><div class="aoTodayV2SectionHead"><div><small>${esc(txt("IN YOUR DAY","DANS VOTRE JOURNÉE"))}</small><h2>${esc(txt("Pray now","Prier maintenant"))}</h2></div><button type="button" data-home-cu-route="pray.library">${esc(txt("All prayers","Toutes les prières"))} →</button></div>
      <div class="aoTodayV2PrayerFeature"><div class="aoTodayV2PrayerGlyph" aria-hidden="true"></div><div><small>${esc(featureRole)}</small><strong>${esc(featureName)}</strong><span>${esc(featureDetail)}</span></div><button type="button" ${featureAttrs}>${esc(txt("Pray","Prier"))}</button></div>
      <div class="aoTodayV2PrayerShortcuts">
        <button type="button" data-home-cu-route="pray.rosary">${esc(txt("Rosary","Rosaire"))}</button>
        <button type="button" data-home-cu-route="pray.confession">${esc(txt("Confession","Confession"))}</button>
        <button type="button" data-home-cu-route="pray.adoration">${esc(txt("Adoration","Adoration"))}</button>
      </div>
    </section>
    <section class="aoTodayV2Zone aoTodayV2ReadReflect"><div class="aoTodayV2SectionHead"><div><small>${esc(txt("DISCOVER THE DAY","DÉCOUVRIR CE JOUR"))}</small><h2>${esc(txt("Read & reflect","Lire et méditer"))}</h2></div></div>
      ${row(saintTitle,saintDetail,'data-home-calendar data-home-calendar-view="day"')}
      ${row(txt("The Gospel of the Mass","Évangile de la messe"),gospelDetail,'data-action="gospel"')}
      ${row(cateTitle,cateDetail,'data-home-daily-catechism')}
      ${row(txt("Sacred Scripture","Sainte Écriture"),txt("Read the traditional Catholic Bible","Lire la Bible catholique traditionnelle"),'data-home-scripture')}
    </section>
    <section class="aoTodayV2Zone aoTodayV2Approaching"><div class="aoTodayV2SectionHead"><div><small>${esc(txt("THE COMING DAYS","LES PROCHAINS JOURS"))}</small><h2>${esc(txt("Approaching","À venir"))}</h2></div><button type="button" ${monthLink}>${esc(txt("Full calendar","Calendrier complet"))} →</button></div>
      <div class="aoTodayV2Upcoming">${calendarDates||'<p>'+esc(txt("Browse the full calendar","Consulter le calendrier complet"))+'</p>'}</div>
    </section>
  </div>`;
}
