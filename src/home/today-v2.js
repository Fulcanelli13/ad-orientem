import { buildLiturgicalYear, buildMajorCelebrations } from "../calendar/liturgical-year.js";
import { calendarMassColour } from "../calendar/colour-projection.js";
import { TODAY_V2_CSS } from "./today-v2-styles.js";
import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";

// The uploaded Today v2 HTML is a visual reference, not a liturgical source.
// Actual observance always comes from the selected 1962 Calendar resolution.
export const TODAY_V2_VERSION="today-v2-calendar-artwork-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dateFormat=(date,fr,options)=>new Date(`${date}T12:00:00`).toLocaleDateString(fr?"fr-FR":"en-GB",options);
const upcoming=(date)=>buildMajorCelebrations(date).filter(x=>x.date>date).slice(0,3);
function exactDay(state){
 const r=state?.resolution;
 return !!(r&&r.date===state.selectedDate&&r.status!=="failed"&&r.day?.main);
}
function artSlot(markup){
 if(typeof markup!=="string"||!/<img\b/i.test(markup))
  return {available:false,html:'<div class="td2-art-empty" aria-hidden="true">✠</div>'};
 // Existing canonically resolved art markup only. No prototype image copied.
 return {available:true,html:`<div class="td2-source-art" data-art-source="existing">${markup}</div>`};
}
function prayerAttributes(row){
 if(row?.kind==="dynamic")return `data-home-cu-dynamic="${esc(row.id)}" data-home-cu-route="${esc(row.route||"pray.library")}"`;
 if(row?.kind==="static")return `data-home-cu-static="${esc(row.id)}"`;
 return `data-home-cu-route="${esc(row?.route||"pray.angelus_regina")}"`;
}
const section=(kicker,title,action="")=>`<div class="td2-section-head"><div><small>${esc(kicker)}</small><h2>${esc(title)}</h2></div>${action}</div>`;
const arrow='<span aria-hidden="true" class="td2-arrow">›</span>';
function icon(asset){
 const url=resolveCanonicalAssetUrl(asset);
 if(!url)return '';
 return '<span data-ao-asset-id="'+esc(asset)+'" aria-hidden="true" style="display:inline-block;width:22px;height:22px;background:currentColor;-webkit-mask:url(\''+esc(url)+'\') center/contain no-repeat;mask:url(\''+esc(url)+'\') center/contain no-repeat"></span>';
}
export function renderTodayV2({state,vm,resume=null,artMarkup="",enrichers=null,warnings=""}){
 const fr=vm.language==="fr",L=(en,frText)=>fr?frText:en,date=vm.dateIso;
 const y=buildLiturgicalYear(date),period=y.currentPeriod;
 const candidates=upcoming(date),next=candidates[0],observed=exactDay(state);
 const colour=observed?calendarMassColour(state.resolution):"";
 const art=artSlot(artMarkup);
 const prayer=enrichers?.visible?enrichers?.comingUp?.rows?.[0]:null;
 const prayerName=prayer?.title||(new Set(["easter","ascension"]).has(period.id)?"Regina Cæli":L("The Angelus","Angélus"));
 const resumeMeta=resume?[resume.date?dateFormat(resume.date,fr,{day:"2-digit",month:"2-digit",year:"numeric"}):"",resume.stepNumber||""].filter(Boolean).join(" · "):"";
 const massButton=resume?`data-resume-mass data-ao-resume-owner="${esc(resume.source)}"`:"data-home-mass-entry";
 const proper=vm.celebration,season=fr?period.fr:period.en;
 const nextTitle=event=>fr?event.fr:event.en;
 return `<style id="ao-today-v2-styles">${TODAY_V2_CSS}</style>
 <main class="homeScreen td2" data-ao-today-version="${TODAY_V2_VERSION}" data-ao-home-presentation-owner="modular-home-presentation-v1" data-home-language="${esc(vm.language)}">
  <header class="td2-top">
   <button type="button" data-home-calendar-view="picker" aria-label="${esc(L("Calendar","Calendrier"))}">${icon("ao-nav-calendar")}</button>
   <span>AD ORIENTEM</span>
   <button type="button" data-home-settings aria-label="${esc(L("Settings","Paramètres"))}">${icon("ao-ui-settings")}</button>
  </header>
  <nav class="td2-tabs" aria-label="${esc(L("Calendar views","Vues du calendrier"))}">
    <button type="button" aria-current="page">${esc(L("Today","Aujourd’hui"))}</button>
    <button type="button" data-home-calendar-view="picker">${esc(L("Month","Mois"))}</button>
    <button type="button" data-home-calendar-view="year">${esc(L("Liturgical Year","Année liturgique"))}</button>
  </nav>
  <div class="td2-date">${esc(dateFormat(date,fr,{weekday:"long",day:"numeric",month:"long",year:"numeric"}))}</div>
  <section class="td2-hero">
   <div class="td2-art" data-art-ready="${art.available}">
     ${art.html}<div class="td2-art-scrim"></div>
     <small class="td2-art-kicker">CALENDARIUM ROMANUM · 1962</small>
     <div class="td2-art-heading"><h1>${esc(proper)}</h1></div>
   </div>
   <div class="td2-hero-actions">
     <div class="td2-meta">
       ${vm.rank?`<span>${esc(vm.rank)}</span>`:""}
       ${colour?`<span><i class="td2-colour-dot" aria-hidden="true"></i>${esc(vm.colour)}</span>`:""}
       <span>${esc(season)}</span>
     </div>
     ${vm.formularyLabel?`<p class="td2-small">${esc(vm.formularyLabel)}</p>`:""}
     ${resume?`<p class="td2-small">${esc(L("Mass in progress","Messe en cours"))}${resumeMeta?" · "+esc(resumeMeta):""}</p>`:""}
     <button type="button" class="td2-primary" ${massButton}>${esc(resume?L("Resume Mass","Reprendre la Messe"):L("Open Today’s Mass","Ouvrir la Messe du jour"))}<span aria-hidden="true">→</span></button>
     <div class="td2-mass-utilities" aria-label="${esc(L("Around the Mass","Autour de la Messe"))}">
       <button type="button" data-action="prepare">${esc(L("Prepare","Se préparer"))}</button>
       <button type="button" data-action="thanks">${esc(L("Give thanks","Action de grâces"))}</button>
     </div>
   </div>
  </section>
  ${warnings?`<div class="td2-warnings">${warnings}</div>`:""}
  <section class="td2-context" aria-label="${esc(L("Liturgical context","Contexte liturgique"))}">
    <button type="button" data-home-calendar-view="year"><small>${esc(L("Liturgical time","Temps liturgique"))}</small><strong>${esc(season)}</strong><span>${esc(y.label)} →</span></button>
    <button type="button" ${next?`data-home-calendar-date="${esc(next.date)}"`:'data-home-calendar-view="picker"'}><small>${esc(L("Coming soon","À venir"))}</small><strong>${esc(next?nextTitle(next):L("Full Calendar","Calendrier complet"))}</strong><span>${next?esc(dateFormat(next.date,fr,{day:"2-digit",month:"short"})):""} →</span></button>
  </section>
  <div class="td2-body">
   <section class="td2-zone" aria-label="${esc(L("Pray now","Prier maintenant"))}">
     ${section(L("In your day","Dans votre journée"),L("Pray now","Prier maintenant"),`<button type="button" class="td2-textlink" data-home-cu-route="pray.library">${esc(L("All prayers","Toutes les prières"))} →</button>`)}
     <div class="td2-feature">
      <div><small>${esc(prayer?.when||L("In your day","Dans votre journée"))}</small><strong>${esc(prayerName)}</strong><span>${esc(prayer?.sub||L("Pause for prayer","Un moment pour prier"))}</span></div>
      <button type="button" ${prayerAttributes(prayer)}>${esc(L("Pray","Prier"))}</button>
     </div>
     <div class="td2-shortcuts">
      <button type="button" data-home-cu-route="pray.rosary">${icon("ao-rich-rosary")}${esc(L("Rosary","Rosaire"))}</button>
      <button type="button" data-home-cu-route="pray.confession">${icon("ao-rich-examination-of-conscience")}${esc(L("Confession","Confession"))}</button>
      <button type="button" data-home-cu-route="pray.adoration">${icon("ao-refined-church")}${esc(L("Adoration","Adoration"))}</button>
     </div>
   </section>
   <section class="td2-zone">
    ${section(L("Discover the day","Découvrir ce jour"),L("Read & reflect","Lire & méditer"))}
    <div class="td2-rows">
     <button type="button" class="td2-row" data-home-calendar><span><strong>${esc(L("The saint of the day","Le saint du jour"))}</strong><small>${esc(L("Life, observance and source references","Vie, célébration et références"))}</small></span>${arrow}</button>
     <button type="button" class="td2-row" data-action="gospel"><span><strong>${esc(L("Holy Gospel","Saint Évangile"))}</strong><small>${esc(vm.gospelReference?vm.gospelReference+" · "+L("Reading, translation and context","Lecture, traduction et contexte"):L("The appointed reading and its context","Lecture assignée et contexte"))}</small></span>${arrow}</button>
     <button type="button" class="td2-row" data-home-daily-catechism><span><strong>${esc(L("Daily Catechism","Catéchisme quotidien"))}</strong><small>${esc(enrichers?.dailyCatechism?.description||L("A lesson for formation","Une leçon pour se former"))}</small></span>${arrow}</button>
    </div>
   </section>
   <section class="td2-zone">
    ${section(L("Coming soon","À venir"),L("Approaching","À l’horizon"),`<button type="button" class="td2-textlink" data-home-calendar-view="picker">${esc(L("Full calendar","Calendrier complet"))} →</button>`)}
    <div class="td2-upcoming">${candidates.slice(0,2).map(e=>`<button type="button" data-home-calendar-date="${esc(e.date)}"><span class="td2-daynum">${esc(dateFormat(e.date,fr,{day:"2-digit"}))}<small>${esc(dateFormat(e.date,fr,{month:"short"}))}</small></span><span><strong>${esc(nextTitle(e))}</strong><small>${esc(L("Calendar milestone; check the observed day","Repère calendaire ; vérifier la célébration"))}</small></span>${arrow}</button>`).join("")}</div>
   </section>
   ${art.available?`<details class="td2-art-provenance"><summary>${esc(L("Artwork and sources","Œuvre et sources"))}</summary><div>${artMarkup}</div></details>`:""}
   <button type="button" class="td2-row td2-explore" data-home-find><span><strong>${esc(L("Explore","Explorer"))}</strong><small>${esc(L("Traditional Masses, shrines, customs and pilgrimages","Messes traditionnelles, sanctuaires, coutumes et pèlerinages"))}</small></span>${arrow}</button>
  </div>
 </main>`;
}