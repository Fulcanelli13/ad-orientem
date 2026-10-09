import "./traditional-pray-styles.js";
import {guidedDailyCards,NIGHTLY_EXAMEN_CARDS,clampPrayerCardStep,guidedStepLabel} from "./guided-daily-cards.js";
import {
  SACRED_HYMNS_V381,
  MORNING_PRAYER_SEQUENCE_V381,
  EVENING_PRAYER_SEQUENCE_V381,
  HOLY_NAME_LITANY_V381,
  SACRED_HEART_DEVOTIONS_V382,
  COMMUNION_TREASURY_V383,
  TRADITIONAL_PRAY_SOURCES_V381,
} from "./traditional-pray-data.js";
import {
  GOOD_DEATH_DYING_V384,
  GOOD_DEATH_DYING_SOURCES_V384,
} from "./good-death-data.js";
import {
  canonicalAssetIdForPrayRoute,
  getCanonicalAsset,
  resolveCanonicalAssetUrl,
} from "../assets/asset-registry.js";

const VERSION="38.4-good-death-dying-companion";
const ROUTES=Object.freeze({
  "pray.morning_evening":Object.freeze({id:"pray.morning_evening",type:"module",domain:"pray",category:"daily-prayer",title:"Morning & Evening Prayer"}),
  "pray.sacred_hymns":Object.freeze({id:"pray.sacred_hymns",type:"module",domain:"pray",category:"traditional-devotion",title:"Sacred Hymns & Canticles"}),
  "pray.holy_name_litany":Object.freeze({id:"pray.holy_name_litany",type:"module",domain:"pray",category:"traditional-devotion",title:"Litany of the Holy Name"}),
  "pray.nightly_examen":Object.freeze({id:"pray.nightly_examen",type:"module",domain:"pray",category:"daily-prayer",title:"Nightly Examination"}),
  "pray.meal_prayers":Object.freeze({id:"pray.meal_prayers",type:"module",domain:"pray",category:"daily-prayer",title:"Grace at Meals"}),
  "pray.sacred_heart":Object.freeze({id:"pray.sacred_heart",type:"module",domain:"pray",category:"sacred-heart",title:"Sacred Heart of Jesus"}),
  "pray.communion_treasury":Object.freeze({id:"pray.communion_treasury",type:"module",domain:"pray",category:"eucharistic",title:"Traditional Communion Prayers"}),
  "pray.good_death":Object.freeze({id:"pray.good_death",type:"module",domain:"pray",category:"traditional-devotion",title:"Preparation for a Good Death"}),
  "pray.dying_companion":Object.freeze({id:"pray.dying_companion",type:"module",domain:"pray",category:"pastoral-care",title:"Dying Companion"}),
});

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const nl=v=>esc(v).replace(/\n/g,"<br>");
const data=()=>globalThis.AO_PRAY_CANONICAL_DATA_V435930||{prayers:{}};
const isFr=()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"||String(document.documentElement.lang||"").toLowerCase().startsWith("fr");
const L=(en,fr)=>isFr()?(fr||en):en;
const mount=()=>document.querySelector("#aoPray435930 .aoP435930Mount");
const uiIcon=id=>{const url=resolveCanonicalAssetUrl(id);return url?`<span class="aoP435930UiIcon" data-ao-asset-id="${esc(id)}" aria-hidden="true" style="display:inline-block;width:18px;height:18px;background:currentColor;-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`:"";};
const root=()=>document.getElementById("aoPray435930");

function assetMarkup(route){
  const assetId=canonicalAssetIdForPrayRoute(route);
  if(!assetId)return "";
  const asset=getCanonicalAsset(assetId);
  const symbol=document.getElementById(assetId);
  if(symbol){
    const vb=symbol.getAttribute("viewBox")||symbol.getAttribute("viewbox")||"0 0 128 128";
    return `<svg class="aoTP381ModuleGlyph" data-ao-asset-id="${esc(assetId)}" viewBox="${esc(vb)}" aria-hidden="true"><use href="#${esc(assetId)}"></use></svg>`;
  }
  const url=resolveCanonicalAssetUrl(assetId);
  if(url&&asset?.path)return `<span class="aoTP381ModuleGlyph mask" data-ao-asset-id="${esc(assetId)}" aria-hidden="true" style="-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`;
  return "";
}

function head(title,sub=""){
  return `<header class="aoP435930Head"><button type="button" class="aoP435930Back" data-tp381-back aria-label="${esc(L("Back","Retour"))}">${uiIcon("ao-ui-back")}</button><div><small>${esc(L("PRAY","PRIER"))}</small><h1 id="aoP435930Title">${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:""}</div><button type="button" class="aoP435930Home" data-tp381-home aria-label="${esc(L("Home","Accueil"))}">${uiIcon("ao-nav-home")}</button></header>`;
}
function source(label,url){
  return `<details class="aoTP381Source"><summary>${esc(L("Source","Source"))} · ${esc(label)}</summary><p><a href="${esc(url)}" target="_blank" rel="noopener">${esc(L("Open source","Ouvrir la source"))} ↗</a></p></details>`;
}
function status(text){
  return `<span class="aoTP381Status">${esc(text)}</span>`;
}
function prayerTitle(p,id){
  if(!p)return id;
  return isFr()?(p.titleFr||p.title||id):(p.title||id);
}
function prayerCard(id){
  const p=data().prayers?.[id];
  if(!p)return `<div class="aoTP381Fail">${esc(L("This canonical prayer is unavailable in the current corpus.","Cette prière canonique n’est pas disponible dans le corpus actuel."))}</div>`;
  const vern=isFr()?(p.fr||p.en||p.la):(p.en||p.fr||p.la),latin=p.la||"",both=!!(vern&&latin);
  const prov=p.provenance||{};
  return `<article class="aoTP381PrayerCard"><h3>${esc(prayerTitle(p,id))}</h3>${both?`<button type="button" data-tp381-flip aria-label="${esc(L("Switch prayer language","Changer la langue de la prière"))}"><span data-face-v>${nl(vern)}</span><span data-face-la hidden>${nl(latin)}</span></button>`:`<div class="aoTP381Reader">${nl(vern||latin)}</div>`}${source(prov.work||p.title||id,prov.url||p.sourceUrl||TRADITIONAL_PRAY_SOURCES_V381.baltimore)}</article>`;
}
function prayerRows(rows){
  return `<div class="aoTP381PrayerList">${rows.map(([id,title,note])=>`<button type="button" ${id.includes(".")?`data-tp381-route="${esc(id)}"`:`data-tp381-prayer="${esc(id)}"`}><span><b>${esc(title)}</b><small>${esc(note)}</small></span><i aria-hidden="true">→</i></button>`).join("")}</div>`;
}

let BASE_OPEN=null,BASE_CLOSE=null,OPEN_OPTS={};
let S={route:"pray.morning_evening",screen:"module",daypart:"morning",hymn:"te_deum",hymnLang:null,prayerId:null,sacredHeart:"litany",communion:"before",dying:"now",dailyMode:"guided",dailyStep:0,examenStep:0,returnToDaily:false};

function guidedCardFrame({id,title,step,total,body,onStep="daily",complete=false,returnButton=""}){
 const label=guidedStepLabel(step,total,isFr()?"fr":"en");
 const finished=step===total;
 const controls=finished
   ? `<div class="aoTP381GuideNav"><button type="button" data-tp381-${onStep}-step="0">${esc(L("Start again","Recommencer"))}</button>${returnButton||`<button type="button" data-tp381-${onStep}-overview>${esc(L("See all prayers","Voir toutes les prières"))}</button>`}</div>`
   : `<nav class="aoTP381GuideNav" aria-label="${esc(L("Prayer steps","Étapes de prière"))}"><button type="button" data-tp381-${onStep}-step="${step-1}" ${step===0?'disabled':''}>${esc(L("Previous","Précédent"))}</button><button type="button" data-tp381-${onStep}-step="${step+1}">${esc(step===total-1?L("Finish","Terminer"):L("Next","Suivant"))}</button></nav>`;
 const titleMarkup=finished?L("Prayer completed","Prière terminée"):title;
 const copy=finished?L("You have reached the end of this prayer sequence. You may begin again or return to the overview.","Vous avez terminé cette suite de prières. Vous pouvez recommencer ou revenir à la liste."):body;
 return `<section class="aoTP381GuideCard" data-ao-pray-guide-card="${esc(id)}" data-guide-step="${step}" aria-label="${esc(label)}"><small class="aoTP381GuideCount">${esc(label)}</small><h2 tabindex="-1" data-ao-guided-focus>${esc(titleMarkup)}</h2>${copy}${controls}</section>`;
}
function renderDailyGuided(rows){
 const total=rows.length,step=clampPrayerCardStep(S.dailyStep,total);
 const row=rows[step];
 const body=step===total?"":row.kind==="examination"
   ?`<p>${esc(L("Review the day before God: your duties towards Him, your neighbour, and yourself. This is a brief daily examen, not sacramental Confession.","Revoyez la journée devant Dieu : vos devoirs envers Lui, le prochain et vous-même. Il s’agit d’un bref examen quotidien, non d’une Confession sacramentelle."))}</p><button type="button" class="aoTP381GuideSubroute" data-tp381-daily-examen>${esc(L("Open guided nightly examination","Ouvrir l’examen du soir guidé"))}</button>`
   :prayerCard(row.id);
 return guidedCardFrame({id:step===total?"daily-finished":row.id,title:step===total?"":row.title,
   step,total,body,onStep:"daily"});
}
function renderMorningEvening(){
 const rows=guidedDailyCards(S.daypart);
 const intro=L("A traditional daily rule of prayer built from sourced Catholic forms. Foundational prayers may recur later in the Rosary or another devotion; that repetition belongs to the devotion and is not an error to be optimized away.","Une règle quotidienne traditionnelle bâtie à partir de formes catholiques sourcées. Les prières fondamentales peuvent revenir ensuite dans le Rosaire ou une autre dévotion ; cette répétition appartient à la dévotion et n’est pas une erreur à supprimer.");
 return `${head(L("Morning & Evening Prayer","Prières du matin & du soir"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(intro)}</p><div class="aoTP381Tabs"><button type="button" data-tp381-daypart="morning" class="${S.daypart==="morning"?"active":""}">${esc(L("Morning","Matin"))}</button><button type="button" data-tp381-daypart="evening" class="${S.daypart==="evening"?"active":""}">${esc(L("Evening","Soir"))}</button></div><div class="aoTP381GuideMode" role="group" aria-label="${esc(L("Prayer view","Présentation des prières"))}"><button type="button" data-tp381-daily-mode="guided" aria-pressed="${S.dailyMode==="guided"}">${esc(L("Guided · one card at a time","Guidé · une carte à la fois"))}</button><button type="button" data-tp381-daily-mode="list" aria-pressed="${S.dailyMode==="list"}">${esc(L("All prayers","Toutes les prières"))}</button></div>${S.dailyMode==="guided"?renderDailyGuided(rows):prayerRows(rows.map(x=>[x.id,x.title,x.note]))}${source("Baltimore Manual · Morning Prayers",TRADITIONAL_PRAY_SOURCES_V381.morning)}${source("Baltimore Manual · Evening Prayers",TRADITIONAL_PRAY_SOURCES_V381.evening)}</main>`;
}
function renderHymns(){
  const h=SACRED_HYMNS_V381[S.hymn]||SACRED_HYMNS_V381.te_deum;
  const lang=S.hymnLang|| (isFr()?"fr":"en");
  const text=h[lang];
  if(!text)throw new Error("Sacred hymn language missing: "+S.hymn+" · "+lang);
  const frenchSources={
    te_deum:["Divinum Officium · French Ordo witness",TRADITIONAL_PRAY_SOURCES_V381.teDeumFrench],
    veni_creator:["Comtesse de Ségur · Livre de messe des petits enfants · 1858",TRADITIONAL_PRAY_SOURCES_V381.veniCreatorFrench],
    ave_maris_stella:["Pierre Corneille · Office de la sainte Vierge · historical French witness",TRADITIONAL_PRAY_SOURCES_V381.aveMarisFrench],
  };
  const frSource=frenchSources[S.hymn]||frenchSources.te_deum;
  return `${head(L("Sacred Hymns & Canticles","Hymnes & cantiques sacrés"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("A deliberately small traditional collection with identified sources. Latin, English and French witnesses are identified rather than silently substituted.","Une collection traditionnelle volontairement réduite, avec ses sources clairement identifiées. Les témoins latin, anglais et français sont identifiés plutôt que remplacés silencieusement."))}</p><div class="aoTP381Tabs"><button type="button" data-tp381-hymn="te_deum" class="${S.hymn==="te_deum"?"active":""}">Te Deum</button><button type="button" data-tp381-hymn="veni_creator" class="${S.hymn==="veni_creator"?"active":""}">Veni Creator</button><button type="button" data-tp381-hymn="ave_maris_stella" class="${S.hymn==="ave_maris_stella"?"active":""}">Ave Maris Stella</button></div><div class="aoTP381Lang"><button type="button" data-tp381-hymn-lang="en" class="${lang==="en"?"active":""}">${esc(L("English","Anglais"))}</button><button type="button" data-tp381-hymn-lang="fr" class="${lang==="fr"?"active":""}">Français</button><button type="button" data-tp381-hymn-lang="la" class="${lang==="la"?"active":""}">Latin</button></div><section class="aoTP381Section"><h2>${esc(h.title)}</h2><p>${esc(L(h.subtitle,h.subtitleFr))}</p><div class="aoTP381Reader">${nl(text)}</div></section>${source("The Daily Prayer-Book · Burns & Oates · 1882",TRADITIONAL_PRAY_SOURCES_V381.dailybook)}${source(frSource[0],frSource[1])}</main>`;
}
function renderHolyName(){
  const vern=isFr()?HOLY_NAME_LITANY_V381.fr:HOLY_NAME_LITANY_V381.en;
  return `${head(L("Litany of the Holy Name of Jesus","Litanies du Saint Nom de Jésus"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("Historical approved Roman form, stored locally for complete offline prayer. Tap the text to replace the vernacular with Latin.","Forme romaine historique approuvée, conservée localement pour une prière entièrement hors ligne. Touchez le texte pour remplacer le français par le latin."))}</p>${status(L("Traditional · sourced · offline","Traditionnelle · sourcée · hors ligne"))}<article class="aoTP381PrayerCard"><h3>${esc(L(HOLY_NAME_LITANY_V381.title,HOLY_NAME_LITANY_V381.titleFr))}</h3><button type="button" data-tp381-flip aria-label="${esc(L("Switch prayer language","Changer la langue de la prière"))}"><span data-face-v>${nl(vern)}</span><span data-face-la hidden>${nl(HOLY_NAME_LITANY_V381.la)}</span></button></article>${source("Rituale Romanum · 1925",HOLY_NAME_LITANY_V381.sources.latin)}${source("French traditional witness · Litanies du Saint Nom de Jésus",HOLY_NAME_LITANY_V381.sources.french)}</main>`;
}
function renderNightlyExamen(){
 const steps=NIGHTLY_EXAMEN_CARDS,step=clampPrayerCardStep(S.examenStep,steps.length),item=steps[step];
 const focus=step===steps.length?"":`<p>${esc(isFr()?item.bodyFr:item.bodyEn)}</p>`;
 const prayer=(item?.id==="resolve"&&!S.returnToDaily)?prayerCard("sacrament_act_of_contrition"):"";
 const after=step===steps.length&&S.returnToDaily
  ?`<button type="button" data-tp381-examen-return>${esc(L("Continue Evening Prayer","Poursuivre les prières du soir"))}</button>`:"";
 const card=guidedCardFrame({id:item?.id||"examen-finished",title:item?isFr()?item.titleFr:item.titleEn:"",
  step,total:steps.length,body:focus+prayer,onStep:"examen",returnButton:after});
 return `${head(L("Nightly Examination","Examen du soir"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("A brief daily review before God. It is not the full preparation for sacramental Confession, and it does not record or score sins.","Une brève revue quotidienne devant Dieu. Ce n’est pas la préparation complète à la Confession sacramentelle, et l’application n’enregistre ni ne classe les péchés."))}</p>${card}<div class="aoTP381PrayerList"><button type="button" data-tp381-route="pray.confession"><span><b>${esc(L("Preparing for sacramental Confession?","Vous préparez-vous à la Confession sacramentelle ?"))}</b><small>${esc(L("Open the full Confession examination","Ouvrir l’examen complet de Confession"))}</small></span><i aria-hidden="true">→</i></button></div></main>`;
}
function renderMealPrayers(){
  return `${head(L("Grace at Meals","Prières des repas"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("The ordinary Catholic table prayers already present in the canonical prayer corpus, surfaced here for daily use.","Les prières catholiques ordinaires des repas déjà présentes dans le corpus canonique, présentées ici pour l’usage quotidien."))}</p>${prayerCard("foundations_grace_before_meals")}${prayerCard("foundations_grace_after_meals")}</main>`;
}
function sourcedPrayerCard(item,label){
  const vern=isFr()?(item?.fr||item?.en||item?.la):(item?.en||item?.fr||item?.la),latin=item?.la||"",both=!!(vern&&latin);
  return `<article class="aoTP381PrayerCard"><h3>${esc(label)}</h3>${both?`<button type="button" data-tp381-flip aria-label="${esc(L("Switch prayer language","Changer la langue de la prière"))}"><span data-face-v>${nl(vern)}</span><span data-face-la hidden>${nl(latin)}</span></button>`:`<div class="aoTP381Reader">${nl(vern||latin)}</div>`}</article>`;
}
function renderSacredHeart(){
  const d=SACRED_HEART_DEVOTIONS_V382,tab=S.sacredHeart||"litany";
  let body="";
  if(tab==="reparation"){
    body=`${prayerCard("sacred_heart_short_prayer")}${source("Pius XI · Miserentissimus Redemptor · 1928","https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_19280508_miserentissimus-redemptor.html")}`;
  }else if(tab==="consecration"){
    const c=d.humanRaceConsecration;
    body=`${sourcedPrayerCard(c,L(c.title,c.titleFr))}<p class="aoTP381Intro">${esc(L("This is the traditional Pius XI-era form associated with Christ the King and preserved in pre-conciliar missals. The current Enchiridion prints an abbreviated form; Ad Orientem keeps the historical form here because this is the traditional devotional corpus.","Il s’agit de la forme traditionnelle de l’époque de Pie XI, associée au Christ-Roi et conservée dans les missels préconciliaires. L’Enchiridion actuel imprime une forme abrégée ; Ad Orientem conserve ici la forme historique parce qu’il s’agit du corpus dévotionnel traditionnel."))}</p>${source("Acta Apostolicae Sedis · 1927 · Latin",c.sources.latin)}${source("La Porte Latine · traditional French form",c.sources.french)}`;
  }else{
    const l=d.litany;
    body=`${sourcedPrayerCard(l,L(l.title,l.titleFr))}${source("La Porte Latine · French & Latin traditional form",l.sources.frenchLatin)}`;
  }
  return `${head(L("Sacred Heart of Jesus","Sacré-Cœur de Jésus"),L("Litany · reparation · consecration","Litanies · réparation · consécration"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("A compact traditional Sacred Heart treasury. The Litany and Christ-the-King consecration are identified historical forms; the Act of Reparation reuses the app’s existing Pius XI canonical prayer rather than duplicating it.","Un petit trésor traditionnel du Sacré-Cœur. Les Litanies et la consécration du Christ-Roi sont des formes historiques identifiées ; l’Acte de réparation réutilise la prière canonique de Pie XI déjà présente dans l’application au lieu de la dupliquer."))}</p><div class="aoTP381Tabs"><button type="button" data-tp381-heart="litany" class="${tab==="litany"?"active":""}">${esc(L("Litany","Litanies"))}</button><button type="button" data-tp381-heart="reparation" class="${tab==="reparation"?"active":""}">${esc(L("Reparation","Réparation"))}</button><button type="button" data-tp381-heart="consecration" class="${tab==="consecration"?"active":""}">${esc(L("Consecration","Consécration"))}</button></div>${body}</main>`;
}
function renderCommunionTreasury(){
  const d=COMMUNION_TREASURY_V383,tab=S.communion==="after"?"after":"before";
  const commonSource=tab==="before"?d.sources.beforeFrenchLatin:d.sources.afterFrenchLatin;
  let body="";
  if(tab==="before"){
    body=`<p class="aoTP381Intro">${esc(L("Choose what helps you prepare. These are traditional preparations, not a checklist to be completed before every Communion.","Choisissez ce qui vous aide à vous préparer. Ce sont des préparations traditionnelles, non une liste à accomplir avant chaque Communion."))}</p>
      ${prayerRows([
        ["sacrament_come_holy_spirit",L("Come, Holy Ghost","Venez, Esprit Saint"),L("Invocation for light and recollection","Invocation pour la lumière et le recueillement")],
        ["foundations_act_of_faith",L("Act of Faith","Acte de foi"),L("Traditional act","Acte traditionnel")],
        ["foundations_act_of_hope",L("Act of Hope","Acte d'espérance"),L("Traditional act","Acte traditionnel")],
        ["foundations_act_of_love",L("Act of Charity","Acte de charité"),L("Traditional act","Acte traditionnel")],
        ["sacrament_act_of_contrition",L("Act of Contrition","Acte de contrition"),L("Traditional act","Acte traditionnel")]
      ])}
      ${sourcedPrayerCard(d.beforeThomas,L(d.beforeThomas.title,d.beforeThomas.titleFr))}
      ${sourcedPrayerCard(d.beforeAmbrose,L(d.beforeAmbrose.title,d.beforeAmbrose.titleFr))}
      ${source(L("French & Latin traditional prayer witness","Témoin traditionnel français & latin"),commonSource)}`;
  }else{
    body=`<p class="aoTP381Intro">${esc(L("Remain in thanksgiving after Communion. Choose one or more prayers and leave room for silence; the app does not treat the treasury as a completion list.","Demeurez en action de grâces après la Communion. Choisissez une ou plusieurs prières et laissez place au silence ; l’application ne traite pas ce trésor comme une liste à compléter."))}</p>
      ${prayerRows([["adoration_anima_christi","Anima Christi",L("Traditional Eucharistic thanksgiving","Action de grâces eucharistique traditionnelle")]])}
      ${sourcedPrayerCard(d.afterThomas,L(d.afterThomas.title,d.afterThomas.titleFr))}
      ${sourcedPrayerCard(d.afterBonaventure,L(d.afterBonaventure.title,d.afterBonaventure.titleFr))}
      ${sourcedPrayerCard(d.enEgo,L(d.enEgo.title,d.enEgo.titleFr))}
      <details class="aoTP381Source"><summary>${esc(L("Indulgences · current discipline","Indulgences · discipline actuelle"))}</summary><p>${esc(L("The current Enchiridion grants a partial indulgence for an approved act of thanksgiving after Communion and expressly gives Anima Christi and En ego as examples. It grants a plenary indulgence for devoutly reciting En ego before an image of Christ crucified after Communion on any Friday of Lent, under the usual conditions. Historical days-or-years grants printed in old missals are not the current way indulgences are measured.","L’Enchiridion actuel accorde une indulgence partielle pour une formule pieuse approuvée d’action de grâces après la Communion et donne expressément comme exemples l’Anima Christi et l’En ego. Il accorde une indulgence plénière à qui récite pieusement l’En ego devant une image du Christ crucifié après la Communion, un vendredi du Carême, aux conditions habituelles. Les anciennes concessions exprimées en jours ou en années dans les vieux missels ne constituent plus la manière actuelle de mesurer les indulgences."))}</p><p><a href="${esc(d.sources.currentIndulgences)}" target="_blank" rel="noopener">${esc(L("Apostolic Penitentiary · Enchiridion","Pénitencerie apostolique · Enchiridion"))} ↗</a></p></details>
      ${source(L("French & Latin traditional thanksgiving witness","Témoin traditionnel français & latin de l’action de grâces"),commonSource)}`;
  }
  return `${head(L("Traditional Communion Prayers","Prières traditionnelles de Communion"),L("Preparation · thanksgiving","Préparation · action de grâces"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("A sourced treasury of prayers long printed before and after Mass in the Roman-Missal tradition, retained only where the French Catholic tradition is also attested.","Un trésor de prières sourcées, longtemps imprimées avant et après la Messe dans la tradition du Missel romain, retenues seulement lorsqu’elles sont également attestées dans la tradition catholique française."))}</p><div class="aoTP381Tabs"><button type="button" data-tp381-communion="before" class="${tab==="before"?"active":""}">${esc(L("Before Communion","Avant la Communion"))}</button><button type="button" data-tp381-communion="after" class="${tab==="after"?"active":""}">${esc(L("After Communion","Après la Communion"))}</button></div>${body}</main>`;
}
function renderGoodDeath(){
  const d=GOOD_DEATH_DYING_V384;
  return `${head(L("Preparation for a Good Death","Préparation à une bonne mort"),L("St Joseph · perseverance · readiness","Saint Joseph · persévérance · préparation"))}<main class="aoP435930Body aoTP381DonorBody">
    <p class="aoTP381Intro">${esc(L("This is an ordinary devotional treasury for preparing throughout life for a holy death. It is not an emergency checklist and it does not replace the sacraments or the ministry of a priest.","Il s’agit d’un trésor dévotionnel ordinaire pour se préparer, durant la vie, à une sainte mort. Ce n’est pas une liste d’urgence et il ne remplace ni les sacrements ni le ministère d’un prêtre."))}</p>
    <section class="aoTP381Section"><h2>${esc(L("St Joseph · patron of the dying","Saint Joseph · patron des mourants"))}</h2><p>${esc(L("The Roman prayers for the dying explicitly invoke St Joseph as patron of the dying. Reuse the app’s existing St Joseph corpus here rather than creating duplicate texts.","Les prières romaines pour les mourants invoquent explicitement saint Joseph comme patron des mourants. L’application réutilise ici son corpus existant de saint Joseph au lieu de créer des doublons."))}</p></section>
    ${prayerRows([
      ["devotion_litany_st_joseph",L("Litany of Saint Joseph","Litanies de saint Joseph"),L("Includes the invocation Patron of the dying","Comprend l’invocation Patron des mourants")],
      ["devotion_ad_te_beate_ioseph",L("To Thee, O Blessed Joseph","À vous, bienheureux Joseph"),L("Traditional prayer asking for a happy death","Prière traditionnelle demandant une bonne mort")],
      ["devotion_memorare_st_joseph",L("Memorare to St Joseph","Souvenez-vous à saint Joseph"),L("Traditional recourse to St Joseph","Recours traditionnel à saint Joseph")]
    ])}
    <section class="aoTP381Section"><h2>${esc(L("Final perseverance and readiness","Persévérance finale et préparation"))}</h2><p>${esc(L("The traditional preparation for death is not a separate spiritual life. It deepens the ordinary acts of faith, hope, charity, contrition and confidence in Our Lady at the hour of death.","La préparation traditionnelle à la mort n’est pas une vie spirituelle séparée. Elle approfondit les actes ordinaires de foi, d’espérance, de charité, de contrition et la confiance en Notre-Dame à l’heure de la mort."))}</p></section>
    ${prayerRows([
      ["foundations_act_of_faith",L("Act of Faith","Acte de foi"),L("Renew faith","Renouveler la foi")],
      ["foundations_act_of_hope",L("Act of Hope","Acte d’espérance"),L("Renew hope","Renouveler l’espérance")],
      ["foundations_act_of_love",L("Act of Charity","Acte de charité"),L("Renew charity","Renouveler la charité")],
      ["sacrament_act_of_contrition",L("Act of Contrition","Acte de contrition"),L("Sorrow for sin and purpose of amendment","Contrition et ferme propos")],
      ["foundations_hail_mary",L("Hail Mary","Je vous salue Marie"),L("Pray for us now and at the hour of our death","Priez pour nous maintenant et à l’heure de notre mort")]
    ])}
    ${sourcedPrayerCard(d.aspirations,L(d.aspirations.title,d.aspirations.titleFr))}
    ${source("Acta Apostolicae Sedis · 1922 · Ordo Commendationis Animae",GOOD_DEATH_DYING_SOURCES_V384.romanJoseph1922)}
    ${source(L("Current customary invocations · Apostolic Penitentiary","Invocations usuelles actuelles · Pénitencerie apostolique"),GOOD_DEATH_DYING_SOURCES_V384.currentIndulgences)}
    <div class="aoTP381PrayerList"><button type="button" data-tp381-route="pray.dying_companion"><span><b>${esc(L("Someone may be dying now","Une personne est peut-être mourante maintenant"))}</b><small>${esc(L("Open the bedside Dying Companion","Ouvrir l’accompagnement au chevet du mourant"))}</small></span><i aria-hidden="true">→</i></button></div>
  </main>`;
}
function renderDyingCompanion(){
  const d=GOOD_DEATH_DYING_V384,tab=["now","pray","commend"].includes(S.dying)?S.dying:"now";
  let body="";
  if(tab==="pray"){
    body=`<p class="aoTP381Intro">${esc(L("Keep the prayers short and peaceful. If the dying person can answer, let them join as they are able; if not, pray quietly beside them.","Gardez les prières brèves et paisibles. Si le mourant peut répondre, laissez-le s’unir comme il le peut; sinon, priez doucement auprès de lui."))}</p>
      ${prayerRows([
        ["sacrament_act_of_contrition",L("Act of Contrition","Acte de contrition"),L("If the person can pray it","Si la personne peut la réciter")],
        ["foundations_act_of_faith",L("Act of Faith","Acte de foi"),L("Short act of faith","Bref acte de foi")],
        ["foundations_act_of_hope",L("Act of Hope","Acte d’espérance"),L("Short act of hope","Bref acte d’espérance")],
        ["foundations_act_of_love",L("Act of Charity","Acte de charité"),L("Short act of charity","Bref acte de charité")],
        ["foundations_hail_mary",L("Hail Mary","Je vous salue Marie"),L("At the hour of our death","À l’heure de notre mort")],
        ["adoration_anima_christi","Anima Christi",L("Passion of Christ, strengthen me","Passion du Christ, fortifiez-moi")]
      ])}
      ${sourcedPrayerCard(d.aspirations,L(d.aspirations.title,d.aspirations.titleFr))}
      <div class="aoTP381PrayerList"><button type="button" data-tp381-route="pray.st_joseph"><span><b>${esc(L("St Joseph","Saint Joseph"))}</b><small>${esc(L("Patron of the dying · open the existing St Joseph module","Patron des mourants · ouvrir le module existant de saint Joseph"))}</small></span><i aria-hidden="true">→</i></button></div>
      ${source(L("French customary invocations","Invocations usuelles françaises"),GOOD_DEATH_DYING_SOURCES_V384.frenchInvocations)}`;
  }else if(tab==="commend"){
    body=`<p class="aoTP381Intro">${esc(L("The Commendation of the Soul is a traditional prayer of the Church as death approaches. These prayers may be prayed at the bedside; they do not imitate absolution, Anointing, Viaticum or the Apostolic Blessing, which belong to the priestly sacramental ministry.","La recommandation de l’âme est une prière traditionnelle de l’Église à l’approche de la mort. Ces prières peuvent être récitées au chevet du mourant; elles n’imitent ni l’absolution, ni l’Onction, ni le Viatique, ni la Bénédiction apostolique, qui relèvent du ministère sacramentel du prêtre."))}</p>
      ${sourcedPrayerCard(d.proficiscere,L(d.proficiscere.title,d.proficiscere.titleFr))}
      ${source("Traditional Roman Commendation · Latin",GOOD_DEATH_DYING_SOURCES_V384.latinProficiscere)}
      ${source(L("Historical French Catholic witness","Témoin catholique français historique"),GOOD_DEATH_DYING_SOURCES_V384.frenchProficiscere)}
      <section class="aoTP381Section"><h2>${esc(L("If the person has died","Si la personne est décédée"))}</h2><p>${esc(L("Move from prayers for the dying to suffrage for the departed; do not continue presenting the person as still in the agony of death.","Passez des prières pour le mourant aux suffrages pour le défunt; ne continuez pas à présenter la personne comme encore dans l’agonie."))}</p></section>
      ${prayerRows([
        ["dead_eternal_rest_singular",L("Eternal Rest · for one deceased person","Repos éternel · pour un défunt"),L("Immediate suffrage for the departed","Suffrage immédiat pour le défunt")],
        ["dead_de_profundis","De profundis · Psalm 129",L("Traditional prayer for the departed","Prière traditionnelle pour les défunts")]
      ])}`;
  }else{
    body=`<section class="aoTP381Section"><h2>${esc(L("Call a priest now","Appelez un prêtre maintenant"))}</h2><p>${esc(L("If death may be approaching, contact a priest without waiting for the person to become unconscious. Ask specifically about Confession or Penance, Anointing of the Sick, Holy Communion as Viaticum, and the Apostolic Blessing at the point of death.","Si la mort peut être proche, contactez un prêtre sans attendre que la personne perde connaissance. Demandez explicitement la Confession ou Pénitence, l’Onction des malades, la sainte Communion en Viatique et la Bénédiction apostolique à l’article de la mort."))}</p></section>
      <section class="aoTP381Section"><h2>${esc(L("What this companion does","Ce que fait cet accompagnement"))}</h2><p>${esc(L("It helps the faithful pray and act at the bedside. For fuller formation about Penance, Anointing and Viaticum, use the Serious Illness guide; this companion does not duplicate that material and never simulates priestly absolution, sacramental anointing, administration of Viaticum or the Apostolic Blessing.","Il aide les fidèles à prier et à agir au chevet. Pour une formation plus complète sur la Pénitence, l’Onction et le Viatique, utilisez le guide Maladie grave; cet accompagnement ne duplique pas ce contenu et ne simule jamais l’absolution sacerdotale, l’onction sacramentelle, l’administration du Viatique ou la Bénédiction apostolique."))}</p></section>
      <div class="aoTP381PrayerList"><button type="button" data-tp381-route="learn.rites.sick"><span><b>${esc(L("Understand the sacraments for serious illness","Comprendre les sacrements en cas de maladie grave"))}</b><small>${esc(L("Open the Serious Illness & Dying formation guide","Ouvrir le guide de formation Maladie grave & fin de vie"))}</small></span><i aria-hidden="true">→</i></button></div>
      <details class="aoTP381Source"><summary>${esc(L("At the point of death · current indulgence","À l’article de la mort · indulgence actuelle"))}</summary><p>${esc(isFr()?d.currentIndulgence.fr:d.currentIndulgence.en)}</p><p><a href="${esc(GOOD_DEATH_DYING_SOURCES_V384.currentIndulgences)}" target="_blank" rel="noopener">${esc(L("Apostolic Penitentiary · Enchiridion","Pénitencerie apostolique · Enchiridion"))} ↗</a></p></details>
      <details class="aoTP381Source"><summary>${esc(L("Why Viaticum matters","Pourquoi le Viatique est important"))}</summary><p>${esc(L("The Church gives the Eucharist as Viaticum to those about to leave this life. Together with Penance and Anointing of the Sick, it belongs to the sacraments that complete the Christian’s earthly pilgrimage.","L’Église donne l’Eucharistie en Viatique à ceux qui sont sur le point de quitter cette vie. Avec la Pénitence et l’Onction des malades, il appartient aux sacrements qui achèvent le pèlerinage terrestre du chrétien."))}</p><p><a href="${esc(GOOD_DEATH_DYING_SOURCES_V384.viaticum)}" target="_blank" rel="noopener">${esc(L("Catechism · Viaticum","Catéchisme · Viatique"))} ↗</a></p></details>`;
  }
  return `${head(L("Dying Companion","Accompagnement du mourant"),L("Priest · prayer · commendation","Prêtre · prière · recommandation"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("A bedside companion for the faithful when death may be near. The first action is pastoral, not digital: obtain a priest when possible.","Un accompagnement au chevet pour les fidèles lorsque la mort peut être proche. La première action est pastorale, non numérique : obtenir un prêtre lorsque cela est possible."))}</p><div class="aoTP381Tabs"><button type="button" data-tp381-dying="now" class="${tab==="now"?"active":""}">${esc(L("Now","Maintenant"))}</button><button type="button" data-tp381-dying="pray" class="${tab==="pray"?"active":""}">${esc(L("Pray","Prier"))}</button><button type="button" data-tp381-dying="commend" class="${tab==="commend"?"active":""}">${esc(L("Commend","Recommander"))}</button></div>${body}</main>`;
}
function renderPrayer(){
  const p=data().prayers?.[S.prayerId];
  const parent=S.route==="pray.communion_treasury"?L("Traditional Communion Prayers","Prières traditionnelles de Communion"):S.route==="pray.good_death"?L("Preparation for a Good Death","Préparation à une bonne mort"):S.route==="pray.dying_companion"?L("Dying Companion","Accompagnement du mourant"):L("Morning & Evening Prayer","Prières du matin & du soir");
  return `${head(prayerTitle(p,S.prayerId),parent)}<main class="aoP435930Body">${prayerCard(S.prayerId)}</main>`;
}
function glossaryTermsForState(){
  if(S.screen==="prayer")return ["G326"];
  if(S.route==="pray.sacred_hymns")return ["G326","G321"];
  if(S.route==="pray.holy_name_litany")return ["G096","G154","G326"];
  if(S.route==="pray.nightly_examen")return ["G328","G019","G011","G012"];
  if(S.route==="pray.meal_prayers")return ["G326","G237"];
  if(S.route==="pray.sacred_heart")return ["G321","G331","G330"];
  if(S.route==="pray.communion_treasury")return ["G031","G030","G326"];
  if(S.route==="pray.good_death")return ["G156","G037","G326"];
  if(S.route==="pray.dying_companion")return ["G037","G038","G156"];
  return ["G326","G324"];
}
function injectGlossaryAction(){
  const m=mount();const body=m?.querySelector?.(".aoP435930Body");if(!body||body.querySelector("[data-tp381-glossary]"))return false;
  const button=document.createElement("button");
  button.type="button";button.className="aoTP381Glossary";button.dataset.tp381Glossary="true";
  button.textContent=L("Terms & explanations","Termes & explications");
  body.insertAdjacentElement("afterbegin",button);return true;
}
function render(){
  const m=mount();if(!m)return false;
  m.dataset.aoPrayView="traditional-pray";
  m.dataset.aoTraditionalPrayRoute=S.route;
  m.innerHTML=S.screen==="prayer"?renderPrayer():S.route==="pray.sacred_hymns"?renderHymns():S.route==="pray.holy_name_litany"?renderHolyName():S.route==="pray.nightly_examen"?renderNightlyExamen():S.route==="pray.meal_prayers"?renderMealPrayers():S.route==="pray.sacred_heart"?renderSacredHeart():S.route==="pray.communion_treasury"?renderCommunionTreasury():S.route==="pray.good_death"?renderGoodDeath():S.route==="pray.dying_companion"?renderDyingCompanion():renderMorningEvening();
  injectGlossaryAction();
  m.scrollTop=0;
  queueMicrotask(()=>m.querySelector("button,[href],summary,[tabindex]:not([tabindex='-1'])")?.focus?.());
  return true;
}
function open(route,opts={}){
  if(!ROUTES[route])return false;
  OPEN_OPTS={...opts};S={...S,route,screen:"module",prayerId:null};
  BASE_OPEN("pray.hub",opts);
  render();return true;
}
function back(){
  if(S.screen==="prayer"){S.screen="module";S.prayerId=null;return render()}
  BASE_OPEN("pray.hub",OPEN_OPTS);if(OPEN_OPTS.returnFamily)window.AO_PRAY_V435930?.openFamily?.(OPEN_OPTS.returnFamily);return true;
}
function goHome(){
  BASE_CLOSE();
  const p=window.AO_APP_SHELL_V1?.navigate?.("home");
  if(p&&typeof p.catch==="function")p.catch(()=>window.AO_NAV_V362?.openHome?.());
  else if(!p)window.AO_NAV_V362?.openHome?.();
  return true;
}
function handleClick(e){
  const b=e.target.closest?.("button,[data-tp381-flip]");if(!b||!root()?.classList.contains("open"))return;
  if(!b.matches("[data-tp381-back],[data-tp381-home],[data-tp381-open],[data-tp381-daypart],[data-tp381-hymn],[data-tp381-hymn-lang],[data-tp381-prayer],[data-tp381-route],[data-tp381-heart],[data-tp381-communion],[data-tp381-dying],[data-tp381-flip],[data-tp381-glossary]"))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(b.matches("[data-tp381-back]"))return back();
  if(b.matches("[data-tp381-home]"))return goHome();
  if(b.matches("[data-tp381-glossary]")){const g=window?.AO_GLOSSARY_V1;if(typeof g?.openTerms==="function")void g.openTerms(glossaryTermsForState(),{origin:"pray"});return;}
  if(b.dataset.tp381Open)return open(b.dataset.tp381Open,{trigger:b});
  if(b.dataset.tp381Daypart){S.daypart=b.dataset.tp381Daypart==="evening"?"evening":"morning";return render()}
  if(b.dataset.tp381Hymn){S.hymn=SACRED_HYMNS_V381[b.dataset.tp381Hymn]?b.dataset.tp381Hymn:"te_deum";return render()}
  if(b.dataset.tp381HymnLang){S.hymnLang=["en","fr","la"].includes(b.dataset.tp381HymnLang)?b.dataset.tp381HymnLang:(isFr()?"fr":"en");return render()}
  if(b.dataset.tp381Heart){S.sacredHeart=["litany","reparation","consecration"].includes(b.dataset.tp381Heart)?b.dataset.tp381Heart:"litany";return render()}
  if(b.dataset.tp381Communion){S.communion=b.dataset.tp381Communion==="after"?"after":"before";return render()}
  if(b.dataset.tp381Dying){S.dying=["now","pray","commend"].includes(b.dataset.tp381Dying)?b.dataset.tp381Dying:"now";return render()}
  if(b.dataset.tp381Prayer){S.prayerId=b.dataset.tp381Prayer;S.screen="prayer";return render()}
  if(b.dataset.tp381Route){
    const route=b.dataset.tp381Route;
    if(ROUTES[route])return open(route,{trigger:b});
    if(String(route).startsWith("learn.")){
      BASE_CLOSE();
      void (async()=>{
        try{await window?.AO_APP_SHELL_V1?.navigate?.("learn")}catch{}
        try{await window?.AO_MODULES?.open?.(route,{returnContext:{surface:"pray",route:S.route}})}catch{}
      })();
      return;
    }
    return BASE_OPEN(route,{trigger:b,returnContext:{surface:"domain",domain:"pray"}});
  }
  if(b.matches("[data-tp381-flip]")){
    const v=b.querySelector("[data-face-v]"),la=b.querySelector("[data-face-la]");if(v&&la){const showLatin=la.hidden;la.hidden=!showLatin;v.hidden=showLatin}return;
  }
}
function extendRegistry(){
  const MOD=window.AO_MODULES;if(!MOD||MOD.__aoTraditionalPrayV381)return;
  const prior=MOD;
  const wrapper={...prior,__aoTraditionalPrayV381:true,
    get(id){return ROUTES[id]||prior.get?.(id)||null},
    resolve(id){if(ROUTES[id])return {ok:true,input:String(id),id,defaults:{},chain:[id],definition:ROUTES[id]};return prior.resolve?.(id)},
    async open(id,opts={}){if(ROUTES[id])return {ok:open(id,opts),input:String(id),canonicalId:id,type:"module",domain:"pray",options:opts,aliasChain:[id],error:null};return prior.open?.(id,opts)},
    list(filter={}){const xs=[...(prior.list?.(filter)||[])].filter(x=>!ROUTES[x?.id]);if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="pray"))xs.push(...Object.values(ROUTES));return xs}
  };
  window.AO_MODULES=wrapper;window.AO_MODULE_REGISTRY_V36=wrapper;
}
function mountRuntime(){
  if(typeof window==="undefined"||typeof document==="undefined")return false;
  if(window.AO_TRADITIONAL_PRAY_V381)return window.AO_TRADITIONAL_PRAY_V381;
  const PR=window.AO_PRAY_V435930;if(!PR?.open||!PR?.close)return false;
  BASE_OPEN=PR.open.bind(PR);BASE_CLOSE=PR.close.bind(PR);
  const oldOpen=PR.open.bind(PR);
  PR.open=function(id,opts={}){if(ROUTES[id])return open(id,opts);return oldOpen(id,opts)};
  document.addEventListener("click",handleClick,true);
  extendRegistry();
  window.AO_TRADITIONAL_PRAY_V381=Object.freeze({
    version:VERSION,
    routes:ROUTES,
    hymns:SACRED_HYMNS_V381,
    open,
    close:BASE_CLOSE,
    state:()=>({...S}),
    qa:()=>({pass:true,routeCount:Object.keys(ROUTES).length,hymnCount:Object.keys(SACRED_HYMNS_V381).length,morningCount:MORNING_PRAYER_SEQUENCE_V381.length,eveningCount:EVENING_PRAYER_SEQUENCE_V381.length,holyNamePolicy:"OFFLINE_SOURCE_LOCKED",sacredHeartPolicy:"SOURCE_LOCKED_TRADITIONAL",communionTreasuryPolicy:"FRENCH_WORLD_SOURCE_LOCKED",goodDeathPolicy:"ROMAN_ST_JOSEPH_SOURCE_LOCKED",dyingCompanionPolicy:"PASTORAL_NOT_SACRAMENT_SIMULATION",seriousIllnessBridge:"learn.rites.sick",legacyTraditionOwner:false})
  });
  return window.AO_TRADITIONAL_PRAY_V381;
}
export function installTraditionalPrayRuntime({pollMs=40,maxPolls=150}={}){
  if(typeof window==="undefined"||typeof document==="undefined")return false;
  if(window.AO_TRADITIONAL_PRAY_V381)return window.AO_TRADITIONAL_PRAY_V381;
  let i=0;const tryInstall=()=>{const r=mountRuntime();if(r)return r;if(i++<maxPolls)setTimeout(tryInstall,pollMs);return false};return tryInstall();
}
if(typeof window!=="undefined"&&typeof document!=="undefined")installTraditionalPrayRuntime();
export { ROUTES as TRADITIONAL_PRAY_ROUTES_V381 };
