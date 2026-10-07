import "./traditional-pray-styles.js";
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
  canonicalAssetIdForPrayRoute,
  getCanonicalAsset,
  resolveCanonicalAssetUrl,
} from "../assets/asset-registry.js";

const VERSION="38.3-communion-treasury";
const ROUTES=Object.freeze({
  "pray.morning_evening":Object.freeze({id:"pray.morning_evening",type:"module",domain:"pray",category:"daily-prayer",title:"Morning & Evening Prayer"}),
  "pray.sacred_hymns":Object.freeze({id:"pray.sacred_hymns",type:"module",domain:"pray",category:"traditional-devotion",title:"Sacred Hymns & Canticles"}),
  "pray.holy_name_litany":Object.freeze({id:"pray.holy_name_litany",type:"module",domain:"pray",category:"traditional-devotion",title:"Litany of the Holy Name"}),
  "pray.nightly_examen":Object.freeze({id:"pray.nightly_examen",type:"module",domain:"pray",category:"daily-prayer",title:"Nightly Examination"}),
  "pray.meal_prayers":Object.freeze({id:"pray.meal_prayers",type:"module",domain:"pray",category:"daily-prayer",title:"Grace at Meals"}),
  "pray.sacred_heart":Object.freeze({id:"pray.sacred_heart",type:"module",domain:"pray",category:"sacred-heart",title:"Sacred Heart of Jesus"}),
  "pray.communion_treasury":Object.freeze({id:"pray.communion_treasury",type:"module",domain:"pray",category:"eucharistic",title:"Traditional Communion Prayers"}),
});

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const nl=v=>esc(v).replace(/\n/g,"<br>");
const data=()=>globalThis.AO_PRAY_CANONICAL_DATA_V435930||{prayers:{}};
const isFr=()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"||String(document.documentElement.lang||"").toLowerCase().startsWith("fr");
const L=(en,fr)=>isFr()?(fr||en):en;
const mount=()=>document.querySelector("#aoPray435930 .aoP435930Mount");
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
  return `<header class="aoP435930Head"><button type="button" class="aoP435930Back" data-tp381-back aria-label="${esc(L("Back","Retour"))}">←</button><div><small>${esc(L("PRAY","PRIER"))}</small><h1 id="aoP435930Title">${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:""}</div><button type="button" class="aoP435930Close" data-tp381-close aria-label="${esc(L("Close","Fermer"))}">×</button></header>`;
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
let S={route:"pray.morning_evening",screen:"module",daypart:"morning",hymn:"te_deum",hymnLang:"en",prayerId:null,sacredHeart:"litany",communion:"before"};

function renderMorningEvening(){
  const rows=S.daypart==="evening"?EVENING_PRAYER_SEQUENCE_V381:MORNING_PRAYER_SEQUENCE_V381;
  return `${head(L("Morning & Evening Prayer","Prières du matin & du soir"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("A traditional daily rule of prayer built from sourced Catholic forms. Foundational prayers may recur later in the Rosary or another devotion; that repetition belongs to the devotion and is not an error to be optimized away.","Une règle quotidienne traditionnelle bâtie à partir de formes catholiques sourcées. Les prières fondamentales peuvent revenir ensuite dans le Rosaire ou une autre dévotion ; cette répétition appartient à la dévotion et n’est pas une erreur à supprimer."))}</p><div class="aoTP381Tabs"><button type="button" data-tp381-daypart="morning" class="${S.daypart==="morning"?"active":""}">${esc(L("Morning","Matin"))}</button><button type="button" data-tp381-daypart="evening" class="${S.daypart==="evening"?"active":""}">${esc(L("Evening","Soir"))}</button></div>${prayerRows(rows)}${source("Baltimore Manual · Morning Prayers",TRADITIONAL_PRAY_SOURCES_V381.morning)}${source("Baltimore Manual · Evening Prayers",TRADITIONAL_PRAY_SOURCES_V381.evening)}</main>`;
}
function renderHymns(){
  const h=SACRED_HYMNS_V381[S.hymn]||SACRED_HYMNS_V381.te_deum;
  return `${head(L("Sacred Hymns & Canticles","Hymnes & cantiques sacrés"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("A deliberately small source-locked collection. These texts come from a public-domain Catholic prayer book rather than from an inherited app composition.","Une collection volontairement réduite et verrouillée sur ses sources. Ces textes proviennent d’un livre de prières catholique du domaine public et non d’une composition héritée d’une application."))}</p><div class="aoTP381Tabs"><button type="button" data-tp381-hymn="te_deum" class="${S.hymn==="te_deum"?"active":""}">Te Deum</button><button type="button" data-tp381-hymn="veni_creator" class="${S.hymn==="veni_creator"?"active":""}">Veni Creator</button><button type="button" data-tp381-hymn="ave_maris_stella" class="${S.hymn==="ave_maris_stella"?"active":""}">Ave Maris Stella</button></div><div class="aoTP381Lang"><button type="button" data-tp381-hymn-lang="en" class="${S.hymnLang==="en"?"active":""}">English</button><button type="button" data-tp381-hymn-lang="la" class="${S.hymnLang==="la"?"active":""}">Latin</button></div><section class="aoTP381Section"><h2>${esc(h.title)}</h2><p>${esc(h.subtitle)}</p><div class="aoTP381Reader">${nl(h[S.hymnLang]||h.en||h.la)}</div></section>${source("The Daily Prayer-Book · Burns & Oates · 1882",TRADITIONAL_PRAY_SOURCES_V381.dailybook)}</main>`;
}
function renderHolyName(){
  const vern=isFr()?HOLY_NAME_LITANY_V381.fr:HOLY_NAME_LITANY_V381.en;
  return `${head(L("Litany of the Holy Name of Jesus","Litanies du Saint Nom de Jésus"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("Historical approved Roman form, stored locally for complete offline prayer. Tap the text to replace the vernacular with Latin.","Forme romaine historique approuvée, conservée localement pour une prière entièrement hors ligne. Touchez le texte pour remplacer le français par le latin."))}</p>${status(L("Traditional · source-locked · offline","Traditionnelle · source verrouillée · hors ligne"))}<article class="aoTP381PrayerCard"><h3>${esc(L(HOLY_NAME_LITANY_V381.title,HOLY_NAME_LITANY_V381.titleFr))}</h3><button type="button" data-tp381-flip aria-label="${esc(L("Switch prayer language","Changer la langue de la prière"))}"><span data-face-v>${nl(vern)}</span><span data-face-la hidden>${nl(HOLY_NAME_LITANY_V381.la)}</span></button></article>${source("Rituale Romanum · 1925",HOLY_NAME_LITANY_V381.sources.latin)}${source("French traditional witness · Litanies du Saint Nom de Jésus",HOLY_NAME_LITANY_V381.sources.french)}</main>`;
}
function renderNightlyExamen(){
  return `${head(L("Nightly Examination","Examen du soir"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("A brief daily review before God. It is not the full preparation for sacramental Confession, and it does not record or score sins.","Une brève revue quotidienne devant Dieu. Ce n’est pas la préparation complète à la Confession sacramentelle, et l’application n’enregistre ni ne classe les péchés."))}</p>
    <section class="aoTP381Section"><h2>${esc(L("God","Dieu"))}</h2><p>${esc(L("Review prayer, worship, fidelity to God, and deliberate sins or omissions against duties owed to Him.","Repassez la prière, le culte, la fidélité à Dieu, ainsi que les fautes ou omissions délibérées contre les devoirs qui Lui sont dus."))}</p></section>
    <section class="aoTP381Section"><h2>${esc(L("Neighbour","Prochain"))}</h2><p>${esc(L("Review charity, justice, truth, patience, forgiveness, and the duties you owed to those entrusted to you today.","Repassez la charité, la justice, la vérité, la patience, le pardon et les devoirs envers ceux qui vous ont été confiés aujourd’hui."))}</p></section>
    <section class="aoTP381Section"><h2>${esc(L("Self","Soi-même"))}</h2><p>${esc(L("Review your thoughts, words, habits, duties, use of time, and self-command. Stop when the review is sufficient; do not chase exhaustive certainty.","Repassez vos pensées, paroles, habitudes, devoirs, l’usage du temps et la maîtrise de vous-même. Arrêtez lorsque l’examen est suffisant ; ne recherchez pas une certitude exhaustive."))}</p></section>
    <div class="aoTP381PrayerList"><button type="button" data-tp381-route="pray.confession"><span><b>${esc(L("Preparing for sacramental Confession?","Vous préparez-vous à la Confession sacramentelle ?"))}</b><small>${esc(L("Open the full Confession examination","Ouvrir l’examen complet de Confession"))}</small></span><i aria-hidden="true">→</i></button></div>
  </main>`;
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
  return `${head(L("Sacred Heart of Jesus","Sacré-Cœur de Jésus"),L("Litany · reparation · consecration","Litanies · réparation · consécration"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("A compact traditional Sacred Heart treasury. The Litany and Christ-the-King consecration are source-locked historical forms; the Act of Reparation reuses the app’s existing Pius XI canonical prayer rather than duplicating it.","Un petit trésor traditionnel du Sacré-Cœur. Les Litanies et la consécration du Christ-Roi sont des formes historiques verrouillées sur leurs sources ; l’Acte de réparation réutilise la prière canonique de Pie XI déjà présente dans l’application au lieu de la dupliquer."))}</p><div class="aoTP381Tabs"><button type="button" data-tp381-heart="litany" class="${tab==="litany"?"active":""}">${esc(L("Litany","Litanies"))}</button><button type="button" data-tp381-heart="reparation" class="${tab==="reparation"?"active":""}">${esc(L("Reparation","Réparation"))}</button><button type="button" data-tp381-heart="consecration" class="${tab==="consecration"?"active":""}">${esc(L("Consecration","Consécration"))}</button></div>${body}</main>`;
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
  return `${head(L("Traditional Communion Prayers","Prières traditionnelles de Communion"),L("Preparation · thanksgiving","Préparation · action de grâces"))}<main class="aoP435930Body aoTP381DonorBody"><p class="aoTP381Intro">${esc(L("A source-locked treasury of prayers long printed before and after Mass in the Roman-Missal tradition, retained only where the French Catholic tradition is also attested.","Un trésor de prières verrouillées sur leurs sources, longtemps imprimées avant et après la Messe dans la tradition du Missel romain, retenues seulement lorsqu’elles sont également attestées dans la tradition catholique française."))}</p><div class="aoTP381Tabs"><button type="button" data-tp381-communion="before" class="${tab==="before"?"active":""}">${esc(L("Before Communion","Avant la Communion"))}</button><button type="button" data-tp381-communion="after" class="${tab==="after"?"active":""}">${esc(L("After Communion","Après la Communion"))}</button></div>${body}</main>`;
}
function renderPrayer(){
  const p=data().prayers?.[S.prayerId];
  const parent=S.route==="pray.communion_treasury"?L("Traditional Communion Prayers","Prières traditionnelles de Communion"):L("Morning & Evening Prayer","Prières du matin & du soir");
  return `${head(prayerTitle(p,S.prayerId),parent)}<main class="aoP435930Body">${prayerCard(S.prayerId)}</main>`;
}
function render(){
  const m=mount();if(!m)return false;
  m.dataset.aoPrayView="traditional-pray";
  m.dataset.aoTraditionalPrayRoute=S.route;
  m.innerHTML=S.screen==="prayer"?renderPrayer():S.route==="pray.sacred_hymns"?renderHymns():S.route==="pray.holy_name_litany"?renderHolyName():S.route==="pray.nightly_examen"?renderNightlyExamen():S.route==="pray.meal_prayers"?renderMealPrayers():S.route==="pray.sacred_heart"?renderSacredHeart():S.route==="pray.communion_treasury"?renderCommunionTreasury():renderMorningEvening();
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
  BASE_OPEN("pray.hub",OPEN_OPTS);queueMicrotask(injectHome);return true;
}
function handleClick(e){
  const b=e.target.closest?.("button,[data-tp381-flip]");if(!b||!root()?.classList.contains("open"))return;
  if(!b.matches("[data-tp381-back],[data-tp381-close],[data-tp381-open],[data-tp381-daypart],[data-tp381-hymn],[data-tp381-hymn-lang],[data-tp381-prayer],[data-tp381-route],[data-tp381-heart],[data-tp381-communion],[data-tp381-flip]"))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(b.matches("[data-tp381-back]"))return back();
  if(b.matches("[data-tp381-close]"))return BASE_CLOSE();
  if(b.dataset.tp381Open)return open(b.dataset.tp381Open,{trigger:b});
  if(b.dataset.tp381Daypart){S.daypart=b.dataset.tp381Daypart==="evening"?"evening":"morning";return render()}
  if(b.dataset.tp381Hymn){S.hymn=SACRED_HYMNS_V381[b.dataset.tp381Hymn]?b.dataset.tp381Hymn:"te_deum";return render()}
  if(b.dataset.tp381HymnLang){S.hymnLang=b.dataset.tp381HymnLang==="la"?"la":"en";return render()}
  if(b.dataset.tp381Heart){S.sacredHeart=["litany","reparation","consecration"].includes(b.dataset.tp381Heart)?b.dataset.tp381Heart:"litany";return render()}
  if(b.dataset.tp381Communion){S.communion=b.dataset.tp381Communion==="after"?"after":"before";return render()}
  if(b.dataset.tp381Prayer){S.prayerId=b.dataset.tp381Prayer;S.screen="prayer";return render()}
  if(b.dataset.tp381Route){
    if(ROUTES[b.dataset.tp381Route])return open(b.dataset.tp381Route,{trigger:b});
    return BASE_OPEN(b.dataset.tp381Route,{trigger:b,returnContext:{surface:"domain",domain:"pray"}});
  }
  if(b.matches("[data-tp381-flip]")){
    const v=b.querySelector("[data-face-v]"),la=b.querySelector("[data-face-la]");if(v&&la){const showLatin=la.hidden;la.hidden=!showLatin;v.hidden=showLatin}return;
  }
}
function injectHome(){
  const m=mount();if(!m||m.dataset.aoPrayView!=="home"||m.querySelector(".aoTP381InsertedSection"))return false;
  const sections=[...m.querySelectorAll(".aoP435930ModuleSection")],before=sections.find(s=>/Devotional programmes|Programmes dévotionnels/i.test(s.querySelector("h3")?.textContent||""));
  const sec=document.createElement("section");sec.className="aoP435930ModuleSection aoTP381InsertedSection";
  const cards=[
    ["pray.morning_evening",L("Morning & Evening Prayer","Prières du matin & du soir"),L("Historical lay prayer-book sequence","Séquence historique de livre de prières laïc")],
    ["pray.sacred_hymns",L("Sacred Hymns & Canticles","Hymnes & cantiques sacrés"),"Te Deum · Veni Creator · Ave Maris Stella"],
    ["pray.holy_name_litany",L("Litany of the Holy Name","Litanies du Saint Nom"),L("Traditional Roman form · available offline","Forme romaine traditionnelle · disponible hors ligne")],
    ["pray.sacred_heart",L("Sacred Heart of Jesus","Sacré-Cœur de Jésus"),L("Litany · reparation · Christ-the-King consecration","Litanies · réparation · consécration du Christ-Roi")],
    ["pray.communion_treasury",L("Traditional Communion Prayers","Prières traditionnelles de Communion"),L("St Thomas · St Ambrose · St Bonaventure · En ego","Saint Thomas · saint Ambroise · saint Bonaventure · En ego")],
    ["pray.meal_prayers",L("Grace at Meals","Prières des repas"),L("Before and after meals","Avant et après les repas")],
  ];
  sec.innerHTML=`<div class="aoP435930ModuleSectionHead"><h3>${esc(L("Daily & traditional prayer","Prière quotidienne & traditionnelle"))}</h3><p>${esc(L("Source-led lay sequences and traditional texts recovered from the approved donor.","Séquences laïques guidées par les sources et textes traditionnels récupérés du donneur approuvé."))}</p></div><div class="aoP435930ModuleGrid">${cards.map(([route,title,desc])=>`<button type="button" class="aoP435930ModuleCard" data-tp381-open="${esc(route)}">${assetMarkup(route)}<small class="aoP435930ModuleKind">${esc(L("TRADITIONAL","TRADITIONNEL"))}</small><b>${esc(title)}</b><span class="aoP435930ModuleDescription">${esc(desc)}</span><i aria-hidden="true">→</i></button>`).join("")}</div>`;
  (before||sections.at(-1))?.insertAdjacentElement(before?"beforebegin":"afterend",sec);return true;
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
  PR.open=function(id,opts={}){if(ROUTES[id])return open(id,opts);const out=oldOpen(id,opts);if(id==="pray.hub"||id==="pray"||id==="home")queueMicrotask(injectHome);return out};
  document.addEventListener("click",handleClick,true);
  const mo=new MutationObserver(()=>queueMicrotask(injectHome));if(document.body)mo.observe(document.body,{subtree:true,childList:true});
  extendRegistry();
  window.AO_TRADITIONAL_PRAY_V381=Object.freeze({
    version:VERSION,
    routes:ROUTES,
    hymns:SACRED_HYMNS_V381,
    open,
    close:BASE_CLOSE,
    state:()=>({...S}),
    qa:()=>({pass:true,routeCount:Object.keys(ROUTES).length,hymnCount:Object.keys(SACRED_HYMNS_V381).length,morningCount:MORNING_PRAYER_SEQUENCE_V381.length,eveningCount:EVENING_PRAYER_SEQUENCE_V381.length,holyNamePolicy:"OFFLINE_SOURCE_LOCKED",sacredHeartPolicy:"SOURCE_LOCKED_TRADITIONAL",communionTreasuryPolicy:"FRENCH_WORLD_SOURCE_LOCKED",legacyTraditionOwner:false})
  });
  queueMicrotask(injectHome);
  return window.AO_TRADITIONAL_PRAY_V381;
}
export function installTraditionalPrayRuntime({pollMs=40,maxPolls=150}={}){
  if(typeof window==="undefined"||typeof document==="undefined")return false;
  if(window.AO_TRADITIONAL_PRAY_V381)return window.AO_TRADITIONAL_PRAY_V381;
  let i=0;const tryInstall=()=>{const r=mountRuntime();if(r)return r;if(i++<maxPolls)setTimeout(tryInstall,pollMs);return false};return tryInstall();
}
if(typeof window!=="undefined"&&typeof document!=="undefined")installTraditionalPrayRuntime();
export { ROUTES as TRADITIONAL_PRAY_ROUTES_V381 };
