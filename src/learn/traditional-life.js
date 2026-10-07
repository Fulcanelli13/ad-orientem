import "../pray/canonical-data.js";
import {
  LOW_MASS_RESPONSES_V381,
  SEASONAL_PRACTICES_V381,
  TRADITIONAL_LEARN_SOURCES_V381,
} from "./traditional-life-data.js";
import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";

export const TRADITIONAL_LEARN_VERSION="38.2-sacramental-life-formation";
export const TRADITIONAL_LEARN_ROOT_ID="ao-learn-traditional-root";

export const TRADITIONAL_LEARN_ROUTES=Object.freeze({
  "learn.rites.sick":Object.freeze({id:"learn.rites.sick",type:"module",domain:"learn",category:"catholic-life",title:"Serious Illness & Dying"}),
  "learn.rites.baptism":Object.freeze({id:"learn.rites.baptism",type:"module",domain:"learn",category:"catholic-life",title:"Baptism · Parents & Godparents"}),
  "learn.rites.confirmation":Object.freeze({id:"learn.rites.confirmation",type:"module",domain:"learn",category:"catholic-life",title:"Confirmation · Candidate & Sponsor"}),
  "learn.rites.matrimony":Object.freeze({id:"learn.rites.matrimony",type:"module",domain:"learn",category:"catholic-life",title:"Matrimony · Bride & Groom"}),
  "learn.serve_mass.responses":Object.freeze({id:"learn.serve_mass.responses",type:"module",domain:"learn",category:"mass-formation",title:"Low Mass Responses"}),
  "learn.scapular":Object.freeze({id:"learn.scapular",type:"module",domain:"learn",category:"catholic-life",title:"Brown Scapular"}),
  "learn.seasonal_rites":Object.freeze({id:"learn.seasonal_rites",type:"module",domain:"learn",category:"liturgical-life",title:"Seasonal Catholic Practice"}),
});

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const nl=v=>esc(v).replace(/\n/g,"<br>");
const uiIcon=id=>{const url=resolveCanonicalAssetUrl(id);return url?`<span data-ao-asset-id="${esc(id)}" aria-hidden="true" style="display:inline-block;width:18px;height:18px;background:currentColor;-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`:"";};
const stateOf=win=>win?.AO_RUNTIME_V8?.store?.getState?.()||{};
const isFr=win=>stateOf(win)?.language==="fr"||String(win?.document?.documentElement?.lang||"").toLowerCase().startsWith("fr");
const L=(win,en,fr)=>isFr(win)?(fr||en):en;
const pick=(win,pair)=>Array.isArray(pair)?pair[isFr(win)?1:0]:pair;
const prayers=win=>win?.AO_PRAY_CANONICAL_DATA_V435930?.prayers||{};

function css(){
  return `
#${TRADITIONAL_LEARN_ROOT_ID}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14970;background:var(--bg,#07111d);color:var(--text,#eee9df);overflow:auto;overscroll-behavior:contain;font-family:var(--font-liturgical,Georgia,serif)}
#${TRADITIONAL_LEARN_ROOT_ID} *{box-sizing:border-box}
.aoLearnTradTop{position:sticky;top:0;z-index:4;display:grid;grid-template-columns:42px minmax(0,1fr) 42px;align-items:center;gap:8px;padding:calc(12px + var(--safe-top,0px)) 0 12px;background:color-mix(in srgb,var(--bg,#07111d) 94%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border,rgba(255,255,255,.13))}
.aoLearnTradTop button{width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--border,rgba(255,255,255,.16));border-radius:10px;background:var(--surface-1,#102235);color:inherit;padding:0}.aoLearnTradTop button>span{width:18px!important;height:18px!important}.aoLearnTradTop div{min-width:0;text-align:left}.aoLearnTradTop small{display:block;color:var(--liturgical,#c7ae6d);font:600 .67rem/1.2 var(--font-display,serif);letter-spacing:.1em;text-transform:uppercase}.aoLearnTradTop strong{display:block;margin-top:2px;font:600 clamp(1.2rem,5vw,1.65rem)/1.08 var(--font-display,Georgia,serif);overflow:hidden;text-overflow:ellipsis}
.aoLearnTradWrap{width:min(900px,100%);margin:0 auto;padding:0 16px 42px;display:block}.aoLearnTradIntro{margin:0;padding:18px 0 11px;color:var(--muted,rgba(238,233,223,.7));font-size:.96rem;line-height:1.5}.aoLearnTradStatus{display:inline-flex;align-items:center;min-height:23px;width:max-content;padding:3px 7px;border:1px solid var(--liturgical-border,rgba(199,174,109,.35));border-radius:999px;color:var(--liturgical,#c7ae6d);font:600 .62rem/1.2 var(--font-display,serif);letter-spacing:.065em;text-transform:uppercase;margin:0 0 8px}
.aoLearnTradCard{padding:14px 0;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.13));border-radius:0;background:transparent}.aoLearnTradCard h3{margin:0 0 5px;color:var(--liturgical,#c7ae6d);font:600 .78rem/1.2 var(--font-display,Georgia,serif);letter-spacing:.055em;text-transform:uppercase}.aoLearnTradCard p{margin:5px 0;color:var(--muted,rgba(238,233,223,.72));line-height:1.48}.aoLearnTradActions{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.aoLearnTradActions button,.aoLearnTradBtn{display:inline-flex;align-items:center;min-height:36px;padding:8px 10px;border:1px solid var(--border,rgba(255,255,255,.16));border-radius:9px;background:var(--surface-1,#102235);color:inherit;font:600 .76rem/1.2 var(--font-display,system-ui)}.aoLearnTradActions button.primary,.aoLearnTradBtn.primary{border-color:var(--liturgical-border,rgba(199,174,109,.4));background:var(--liturgical-soft,rgba(199,174,109,.13))}
.aoLearnTradSource{margin-top:10px;padding:0;border:0;font-size:.72rem}.aoLearnTradSource summary{cursor:pointer;min-height:0;display:block;color:var(--muted,rgba(238,233,223,.58));font:400 .72rem/1.35 var(--font-display,system-ui)}.aoLearnTradSource a{color:var(--liturgical,#c7ae6d)}
.aoLearnTradCompare{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}.aoLearnTradCompare article{padding:12px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:12px;background:var(--surface-1,#102235)}.aoLearnTradCompare h3{margin:0 0 7px;font:600 1rem/1.2 var(--font-display,Georgia,serif)}.aoLearnTradCompare p{margin:0;color:var(--muted,rgba(238,233,223,.72));line-height:1.5}
.aoLearnTradTrainer{padding:12px 0;display:block}.aoLearnTradCue{color:var(--liturgical,#c7ae6d);font:600 .66rem/1.2 var(--font-display,serif);letter-spacing:.08em;text-transform:uppercase}.aoLearnTradPrompt{font:400 1.02rem/1.55 var(--font-liturgical,Georgia,serif);margin:8px 0 13px}.aoLearnTradAnswer{display:block;padding:9px 12px;border-left:2px solid var(--liturgical,#c7ae6d);background:var(--liturgical-soft,rgba(199,174,109,.07));margin:8px 0 12px}.aoLearnTradAnswer strong{display:block;font:600 1.05rem/1.55 var(--font-liturgical,Georgia,serif)}.aoLearnTradAnswer span{display:block;color:var(--muted);font-size:.8rem;margin-top:6px}.aoLearnTradNav{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:15px}.aoLearnTradNav button{min-height:42px;border:1px solid var(--border,rgba(255,255,255,.16));border-radius:10px;background:var(--surface-1,#102235);color:inherit}
.aoLearnTradPrayer{padding:14px 0;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.13));border-radius:0;background:transparent}.aoLearnTradPrayer h2{margin:0 0 12px;font:600 1.2rem/1.2 var(--font-display,Georgia,serif)}.aoLearnTradPrayer button{width:100%;padding:0;border:0;background:transparent;color:inherit;text-align:left;font:400 1.02rem/1.7 var(--font-liturgical,Georgia,serif)}.aoLearnTradPrayerText{font:400 1.02rem/1.7 var(--font-liturgical,Georgia,serif)}
.aoLearnTradSeasonList{display:grid;gap:0;border-top:1px solid var(--border,rgba(255,255,255,.13));margin:12px 0}.aoLearnTradSeason{width:100%;min-height:0;padding:13px 2px;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.13));border-radius:0;background:transparent;color:inherit;text-align:left;display:grid;gap:4px}.aoLearnTradSeason b{font:600 .98rem/1.2 var(--font-display,Georgia,serif)}.aoLearnTradSeason small{color:var(--liturgical,#c7ae6d);font-size:.69rem}.aoLearnTradSeason span{color:var(--muted);font-size:.82rem;line-height:1.4}
@media(max-width:520px){.aoLearnTradTop{grid-template-columns:40px minmax(0,1fr) 40px}.aoLearnTradCompare{grid-template-columns:1fr}.aoLearnTradWrap{padding-left:13px;padding-right:13px}}
`;
}
function source(win,label,url){
  return `<details class="aoLearnTradSource"><summary>${esc(L(win,"Source","Source"))} · ${esc(label)}</summary><p><a href="${esc(url)}" target="_blank" rel="noopener">${esc(L(win,"Open source","Ouvrir la source"))} ↗</a></p></details>`;
}
function card(win,title,text,extra=""){
  return `<article class="aoLearnTradCard"><h3>${esc(title)}</h3><p>${esc(text)}</p>${extra}</article>`;
}
function actions(items){
  return `<div class="aoLearnTradActions">${items.map(item=>`<button type="button" class="${item.primary?"primary":""}" ${item.route?`data-ao-tradlearn-route="${esc(item.route)}"`:""} ${item.prayer?`data-ao-tradlearn-prayer="${esc(item.prayer)}"`:""} ${item.nuptial?"data-ao-tradlearn-nuptial":""}>${esc(item.label)}</button>`).join("")}</div>`;
}
function top(win,title){
  return `<style data-ao-traditional-learn-style>${css()}</style><header class="aoLearnTradTop"><button type="button" data-ao-tradlearn-back aria-label="${esc(L(win,"Back","Retour"))}">${uiIcon("ao-ui-back")}</button><div><small>Lay Companion</small><strong>${esc(title)}</strong></div><button type="button" data-ao-tradlearn-close aria-label="${esc(L(win,"Close","Fermer"))}">${uiIcon("ao-ui-close")}</button></header>`;
}
function shell(win,title,intro,status,body){
  return `${top(win,title)}<main class="aoLearnTradWrap"><p class="aoLearnTradIntro">${esc(intro)}</p><span class="aoLearnTradStatus">${esc(status)}</span>${body}</main>`;
}
function prayerTitle(win,p,id){return isFr(win)?(p?.titleFr||p?.title||id):(p?.title||id)}
function prayerView(win,id){
  const p=prayers(win)[id];
  if(!p)return shell(win,L(win,"Prayer","Prière"),L(win,"The requested canonical prayer is unavailable in this build.","La prière canonique demandée n’est pas disponible dans cette version."),"", "");
  const vern=isFr(win)?(p.fr||p.en||p.la):(p.en||p.fr||p.la),latin=p.la||"",both=!!(vern&&latin);
  return `${top(win,prayerTitle(win,p,id))}<main class="aoLearnTradWrap"><article class="aoLearnTradPrayer"><h2>${esc(prayerTitle(win,p,id))}</h2>${both?`<button type="button" data-ao-tradlearn-flip><span data-face-v>${nl(vern)}</span><span data-face-la hidden>${nl(latin)}</span></button>`:`<div class="aoLearnTradPrayerText">${nl(vern||latin)}</div>`}</article>${source(win,p.provenance?.work||p.title||id,p.provenance?.url||p.sourceUrl||TRADITIONAL_LEARN_SOURCES_V381.baltimore)}</main>`;
}

function sick(win){
  return shell(win,
    L(win,"Serious Illness & Dying","Maladie grave & fin de vie"),
    L(win,"For the sick person, family and friends. The purpose is to know when to call the priest, how to prepare, what you may receive, and how to pray. Ad Orientem does not reproduce priest-only ritual directions.","Pour le malade, la famille et les proches. Le but est de savoir quand appeler le prêtre, comment se préparer, ce que l’on peut recevoir et comment prier. Ad Orientem ne reproduit pas les instructions rituelles réservées au prêtre."),
    L(win,"Prepare · Pray · Receive · Follow","Se préparer · Prier · Recevoir · Suivre"),
    card(win,L(win,"PREPARE","SE PRÉPARER"),L(win,"Call a priest early when serious illness, advanced age or danger of death makes sacramental care appropriate. If the sick person is able, help them prepare for Confession and Holy Communion/Viaticum.","Appelez un prêtre assez tôt lorsqu’une maladie grave, un âge avancé ou un danger de mort rend les soins sacramentels appropriés. Si le malade le peut, aidez-le à se préparer à la Confession et à la Sainte Communion/Viatique."),actions([
      {label:L(win,"Death may be near · Open Dying Companion","La mort peut être proche · Ouvrir l’accompagnement du mourant"),route:"pray.dying_companion",primary:true},
    ]))+
    card(win,L(win,"RECEIVE","RECEVOIR"),L(win,"Depending on the circumstances, the sick person may receive Penance, Anointing of the Sick and Holy Communion as Viaticum. The exact order and form belong to the priest; this guide helps the faithful understand the sacraments being received.","Selon les circonstances, le malade peut recevoir la Pénitence, l’Onction des malades et la Sainte Communion comme Viatique. L’ordre exact et la forme appartiennent au prêtre ; ce guide aide les fidèles à comprendre les sacrements reçus."))+
    card(win,L(win,"PRAY WITH THE SICK","PRIER AVEC LE MALADE"),L(win,"Use familiar Catholic prayers, the Rosary, acts of contrition and trust, and periods of silence. If death becomes imminent, move into the Dying Companion rather than mixing bedside prayers with prayers for someone who has already died.","Employez les prières catholiques familières, le Rosaire, les actes de contrition et de confiance, ainsi que des temps de silence. Si la mort devient imminente, passez à l’Accompagnement du mourant au lieu de mélanger les prières au chevet avec celles qui sont destinées à une personne déjà décédée."),actions([
      {label:L(win,"Prepare for Confession","Préparer la Confession"),route:"pray.confession"},
      {label:L(win,"Rosary","Rosaire"),route:"pray.rosary"},
      {label:L(win,"Dying Companion","Accompagnement du mourant"),route:"pray.dying_companion"},
    ]))+
    card(win,L(win,"AFTER DEATH · TRADITIONAL FUNERAL SEQUENCE","APRÈS LA MORT · SÉQUENCE FUNÈBRE TRADITIONNELLE"),L(win,"Once death has occurred, stop using prayers addressed to the dying person and move to suffrage for the departed. At a traditional Roman funeral, the Requiem Mass is distinct from the rites that may follow it. When the Absolution at the bier or catafalque is actually appointed, it follows the Mass; if the body then leaves for burial, In paradisum accompanies the departure and the burial rite continues according to the actual local ceremony. Ad Orientem keeps these as explicit following actions rather than pretending every Requiem has the same ending.","Une fois la mort survenue, cessez d’utiliser les prières adressées au mourant et passez aux suffrages pour le défunt. Lors de funérailles romaines traditionnelles, la Messe de Requiem est distincte des rites qui peuvent la suivre. Lorsque l’Absoute au cercueil ou au catafalque est effectivement prévue, elle suit la Messe ; si le corps part ensuite vers la sépulture, In paradisum accompagne le départ et le rite d’inhumation se poursuit selon la cérémonie locale effectivement célébrée. Ad Orientem conserve ces éléments comme actions suivantes explicites au lieu de supposer que chaque Requiem se termine de la même manière."),actions([
      {label:"Requiem æternam",prayer:"dead_eternal_rest_singular"},
      {label:"De profundis",prayer:"dead_de_profundis"},
    ]))+
    `<details class="aoLearnTradSource"><summary>${esc(L(win,"Why the traditional and current ceremonies may look different","Pourquoi les cérémonies traditionnelle et actuelle peuvent sembler différentes"))}</summary><article class="aoLearnTradCard"><p>${esc(L(win,"The older Roman rite of Extreme Unction used a fuller series of anointings; the current Roman Anointing normally uses the forehead and hands. This distinction is included only so families can recognize what they are witnessing—not to teach anyone to administer the sacrament.","L’ancien rite romain de l’Extrême-Onction employait une série plus développée d’onctions ; l’Onction romaine actuelle utilise normalement le front et les mains. Cette distinction n’est donnée que pour aider les familles à reconnaître ce qu’elles voient — non pour apprendre à administrer le sacrement."))}</p></article></details>`+
    source(win,"Rituale Romanum · 1952",TRADITIONAL_LEARN_SOURCES_V381.ritual1952)+
    source(win,"Paul VI · Sacram Unctionem Infirmorum · 1972",TRADITIONAL_LEARN_SOURCES_V381.currentAnointing)+
    source(win,"Catechism · Viaticum",TRADITIONAL_LEARN_SOURCES_V381.viaticum)
  );
}
function baptism(win){
  return shell(win,
    L(win,"Baptism · Parents & Godparents","Baptême · Parents & parrains"),
    L(win,"A lay guide for parents, godparents and family: how to prepare, what the godparents actually do, and how to recognize the traditional Roman ceremonies. It is not the minister’s baptismal manual.","Un guide laïc pour les parents, parrains et famille : comment se préparer, ce que font réellement les parrains et comment reconnaître les cérémonies romaines traditionnelles. Ce n’est pas le manuel baptismal du ministre."),
    L(win,"Prepare · Respond · Accompany","Se préparer · Répondre · Accompagner"),
    card(win,L(win,"BEFORE THE BAPTISM","AVANT LE BAPTÊME"),L(win,"Confirm which form of Baptism will be used. For an infant, the godparents answer on the child’s behalf during the traditional interrogations and profession of faith; parents and godparents should know the Creed and Our Father and understand that their responsibility continues after the ceremony.","Confirmez quelle forme du Baptême sera employée. Pour un enfant, les parrains répondent en son nom lors des interrogations traditionnelles et de la profession de foi ; parents et parrains doivent connaître le Credo et le Notre Père et comprendre que leur responsabilité continue après la cérémonie."),actions([
      {label:L(win,"Apostles’ Creed","Symbole des Apôtres"),prayer:"foundations_apostles_creed"},
      {label:L(win,"Our Father","Notre Père"),prayer:"foundations_our_father"},
    ]))+
    card(win,L(win,"TRADITIONAL ROMAN ORDER · WHAT YOU MAY SEE","ORDRE ROMAIN TRADITIONNEL · CE QUE VOUS POUVEZ VOIR"),L(win,"The older Roman infant rite begins at the church door with the child’s name and request for faith. Signs of the Cross, exorcistic prayers and blessed salt follow. The child is then admitted into the church; the Creed and Our Father accompany the approach to the font. Ephpheta, the renunciations and the anointing with the Oil of Catechumens precede the profession of faith and Baptism itself. After Baptism come the anointing with Sacred Chrism, the white garment and the lighted candle.","L’ancien rite romain du Baptême des enfants commence à la porte de l’église par le nom de l’enfant et la demande de la foi. Viennent ensuite les signes de croix, les prières d’exorcisme et le sel bénit. L’enfant est ensuite admis dans l’église ; le Credo et le Notre Père accompagnent l’approche des fonts. L’Ephpheta, les renoncements et l’onction d’huile des catéchumènes précèdent la profession de foi et le Baptême lui-même. Après le Baptême viennent l’onction du Saint Chrême, le vêtement blanc et le cierge allumé."))+
    card(win,L(win,"YOUR PART","VOTRE PART"),L(win,"Godparents answer when prompted for an infant, take part in the renunciations and profession of faith according to the form actually used, and physically present or support the child as directed. Parents remain the first educators of the child in the faith. Follow the celebrant’s prompts rather than memorizing an app script.","Les parrains répondent pour l’enfant lorsqu’ils y sont invités, participent aux renoncements et à la profession de foi selon la forme réellement employée, et présentent ou soutiennent physiquement l’enfant suivant les indications reçues. Les parents demeurent les premiers éducateurs de l’enfant dans la foi. Suivez les indications du célébrant plutôt que de mémoriser un script d’application."))+
    card(win,L(win,"GODPARENTS AFTER THE CEREMONY","LES PARRAINS APRÈS LA CÉRÉMONIE"),L(win,"The godparent’s task is not ceremonial only. The Church describes it as an ecclesial responsibility to help the baptized person live a Christian life faithful to Baptism. Choose godparents for faith and reliability, not merely for social convention.","La fonction du parrain n’est pas seulement cérémonielle. L’Église la décrit comme une responsabilité ecclésiale : aider le baptisé à mener une vie chrétienne fidèle à son Baptême. Choisissez les parrains pour leur foi et leur fidélité, non comme simple convention sociale."))+
    `<details class="aoLearnTradSource"><summary>${esc(L(win,"Emergency Baptism · only in real necessity","Baptême d’urgence · seulement en cas de réelle nécessité"))}</summary><article class="aoLearnTradCard"><p>${esc(L(win,"In a real necessity, especially danger of death when an ordinary minister cannot be obtained in time, any person can baptize provided he or she intends to do what the Church does. Pour water on the person’s head while saying: “I baptize you in the name of the Father, and of the Son, and of the Holy Spirit.” If this happens, contact the parish promptly so the Baptism can be recorded and the Church can determine what ceremonies remain to be supplied.","En cas de réelle nécessité, spécialement en danger de mort lorsqu’un ministre ordinaire ne peut être obtenu à temps, toute personne peut baptiser pourvu qu’elle ait l’intention de faire ce que fait l’Église. Versez de l’eau sur la tête de la personne en disant : « Je te baptise au nom du Père, et du Fils, et du Saint-Esprit. » Si cela arrive, contactez rapidement la paroisse afin que le Baptême soit inscrit et que l’Église détermine quelles cérémonies doivent encore être suppléées."))}</p></article></details>`+
    `<details class="aoLearnTradSource"><summary>${esc(L(win,"Traditional / current comparison","Comparaison traditionnelle / actuelle"))}</summary><div class="aoLearnTradCompare"><article><h3>${esc(L(win,"Older Roman form","Ancienne forme romaine"))}</h3><p>${esc(L(win,"The preparatory ceremonies before the font are much more extended: door, salt, exorcisms, entry, Ephpheta, renunciations and catechumenal anointing.","Les cérémonies préparatoires avant les fonts sont beaucoup plus développées : porte, sel, exorcismes, entrée, Ephpheta, renoncements et onction catéchuménale."))}</p></article><article><h3>${esc(L(win,"Current Roman form","Forme romaine actuelle"))}</h3><p>${esc(L(win,"The surrounding rites are reorganized around reception, Scripture, profession of faith, Baptism and explanatory signs. Do not import the older ceremonial into a celebration using the current rite.","Les rites environnants sont réorganisés autour de l’accueil, de l’Écriture, de la profession de foi, du Baptême et des signes explicatifs. N’importez pas le cérémonial ancien dans une célébration utilisant le rite actuel."))}</p></article></div></details>`+
    source(win,"Rituale Romanum · 1952",TRADITIONAL_LEARN_SOURCES_V381.ritual1952)+
    source(win,"Catechism of the Catholic Church · Baptism",TRADITIONAL_LEARN_SOURCES_V381.currentBaptism)+
    source(win,"Catechism / Compendium · minister in necessity",TRADITIONAL_LEARN_SOURCES_V381.currentBaptismWho)+
    source(win,"Code of Canon Law · godparents",TRADITIONAL_LEARN_SOURCES_V381.currentBaptismSponsors)
  );
}
function confirmation(win){
  return shell(win,
    L(win,"Confirmation · Candidate & Sponsor","Confirmation · Confirmand & parrain/marraine"),
    L(win,"A lay guide to preparation, the sponsor’s role and the ceremonies you may see when Confirmation is celebrated according to the older Roman Pontifical. It does not reproduce the bishop’s ceremonial.","Un guide laïc sur la préparation, le rôle du parrain et les cérémonies que vous pouvez voir lorsque la Confirmation est célébrée selon l’ancien Pontifical romain. Il ne reproduit pas le cérémonial de l’évêque."),
    L(win,"Prepare · Receive · Witness","Se préparer · Recevoir · Témoigner"),
    card(win,L(win,"BEFORE CONFIRMATION","AVANT LA CONFIRMATION"),L(win,"A candidate should already be baptized, know the principal truths of the Faith, intend to receive the sacrament and, if of the age of reason, be properly disposed and in the state of grace. Follow the priest or parish instructions for Confession, sponsor, name and practical preparation instead of assuming that every historical rubric remains in force.","Le confirmand doit déjà être baptisé, connaître les principales vérités de la Foi, vouloir recevoir le sacrement et, s’il a l’âge de raison, être convenablement disposé et en état de grâce. Suivez les indications du prêtre ou de la paroisse pour la Confession, le parrain, le nom et la préparation pratique au lieu de supposer que toute rubrique historique demeure en vigueur."),actions([
      {label:L(win,"Prepare for Confession","Préparer la Confession"),route:"pray.confession"},
      {label:L(win,"Come, Holy Ghost","Venez, Esprit Saint"),prayer:"sacrament_come_holy_spirit"},
    ]))+
    card(win,L(win,"THE SPONSOR","LE PARRAIN / LA MARRAINE"),L(win,"The sponsor is not decorative: the Church asks the sponsor to help the confirmed person live as a true witness of Christ. In the traditional Roman ceremony the sponsor commonly stands behind the candidate and places the right hand on the candidate’s right shoulder during the individual Confirmation. Follow the actual ceremonial given to you.","Le parrain ou la marraine n’est pas un simple figurant : l’Église lui demande d’aider le confirmé à vivre en véritable témoin du Christ. Dans la cérémonie romaine traditionnelle, le parrain se tient habituellement derrière le confirmand et pose la main droite sur son épaule droite pendant la Confirmation individuelle. Suivez le cérémonial qui vous est effectivement donné."))+
    card(win,L(win,"TRADITIONAL ROMAN ORDER · WHAT YOU MAY SEE","ORDRE ROMAIN TRADITIONNEL · CE QUE VOUS POUVEZ VOIR"),L(win,"The bishop first invokes the Holy Spirit over the confirmands with hands extended and prays for the seven gifts of the Holy Spirit. Each candidate then approaches with a sponsor. The bishop anoints the forehead with Sacred Chrism in the sign of the Cross while laying his hand on the candidate and using the traditional sacramental formula. A light touch on the cheek with the sign of peace follows, then the rite concludes with prayers and blessing.","L’évêque invoque d’abord le Saint-Esprit sur les confirmands, les mains étendues, et prie pour les sept dons du Saint-Esprit. Chaque confirmand s’approche ensuite avec son parrain. L’évêque oint le front du Saint Chrême en forme de croix, en imposant la main au confirmand et en employant la formule sacramentelle traditionnelle. Suit un léger toucher de la joue avec le signe de paix, puis le rite s’achève par des prières et la bénédiction."))+
    card(win,L(win,"WHAT THE SACRAMENT DOES","CE QUE FAIT LE SACREMENT"),L(win,"Confirmation completes baptismal grace by a special outpouring of the Holy Spirit. It strengthens the Christian bond with the Church and gives particular strength to confess the faith and bear witness to Christ in word and action.","La Confirmation perfectionne la grâce baptismale par une effusion spéciale du Saint-Esprit. Elle renforce le lien du chrétien avec l’Église et donne une force particulière pour confesser la foi et rendre témoignage au Christ par la parole et par les actes."))+
    card(win,L(win,"OLD PONTIFICAL RUBRICS ARE NOT AUTOMATIC CURRENT RULES","LES RUBRIQUES DE L’ANCIEN PONTIFICAL NE SONT PAS AUTOMATIQUEMENT DES RÈGLES ACTUELLES"),L(win,"Historical Pontificals include disciplinary and practical details such as fasting, forehead bands and older sponsor rules. They are valuable evidence for understanding the rite, but Ad Orientem does not turn them into universal present-day requirements. The actual authorized celebration and the instructions of the clergy govern what you should do.","Les anciens Pontificaux contiennent des détails disciplinaires et pratiques tels que le jeûne, les bandelettes au front et d’anciennes règles concernant les parrains. Ils sont précieux pour comprendre le rite, mais Ad Orientem ne les transforme pas en obligations universelles actuelles. La célébration réellement autorisée et les indications du clergé déterminent ce que vous devez faire."))+
    `<details class="aoLearnTradSource"><summary>${esc(L(win,"Traditional / current comparison","Comparaison traditionnelle / actuelle"))}</summary><div class="aoLearnTradCompare"><article><h3>${esc(L(win,"Older Roman Pontifical","Ancien Pontifical romain"))}</h3><p>${esc(L(win,"Extended invocation over all confirmands, individual anointing with the older formula, traditional sponsor presentation and the light touch on the cheek with the sign of peace.","Invocation développée sur tous les confirmands, onction individuelle avec l’ancienne formule, présentation traditionnelle par le parrain et léger toucher de la joue avec le signe de paix."))}</p></article><article><h3>${esc(L(win,"Current Roman rite","Rite romain actuel"))}</h3><p>${esc(L(win,"When celebrated separately from Baptism, the connection with Baptism is expressed by renewal of baptismal promises; the bishop extends his hands, invokes the Holy Spirit and anoints the forehead with Sacred Chrism using the current formula.","Lorsqu’elle est célébrée séparément du Baptême, le lien avec celui-ci est exprimé par le renouvellement des promesses baptismales ; l’évêque étend les mains, invoque le Saint-Esprit et oint le front du Saint Chrême avec la formule actuelle."))}</p></article></div></details>`+
    source(win,"Pontificale Romanum · 1962 reprint · De Confirmandis",TRADITIONAL_LEARN_SOURCES_V381.pontifical1962)+
    source(win,"French traditional catechetical witness · St Pius X",TRADITIONAL_LEARN_SOURCES_V381.frenchConfirmationCatechism)+
    source(win,"Catechism of the Catholic Church · Confirmation",TRADITIONAL_LEARN_SOURCES_V381.currentConfirmation)+
    source(win,"Code of Canon Law · sponsor",TRADITIONAL_LEARN_SOURCES_V381.currentConfirmationSponsor)
  );
}
function matrimony(win){
  return shell(win,
    L(win,"Matrimony · Bride & Groom","Mariage · Époux"),
    L(win,"For the couple and those assisting at the wedding. The focus is preparation, consent, participation and the Nuptial Mass—not instructions for the celebrant.","Pour les époux et ceux qui assistent au mariage. L’accent porte sur la préparation, le consentement, la participation et la Messe nuptiale — non sur les instructions destinées au célébrant."),
    L(win,"Prepare · Consent · Participate","Se préparer · Consentir · Participer"),
    card(win,L(win,"PREPARE","SE PRÉPARER"),L(win,"Confirm with the priest/parish which form of Matrimony will be used, what words and responses you will make, whether a Nuptial Mass is being celebrated, and any practical sacramental preparation required of you.","Confirmez avec le prêtre/la paroisse quelle forme de Mariage sera employée, quelles paroles et réponses vous aurez à faire, si une Messe nuptiale sera célébrée et toute préparation sacramentelle pratique qui vous concerne."))+
    card(win,L(win,"YOUR ESSENTIAL ACT","VOTRE ACTE ESSENTIEL"),L(win,"The spouses freely give and receive matrimonial consent. Ad Orientem can help you understand the ceremony, but it does not replace the exact formula and instructions given by the Church and your celebrant.","Les époux donnent et reçoivent librement le consentement matrimonial. Ad Orientem peut aider à comprendre la cérémonie, mais ne remplace pas la formule exacte et les indications données par l’Église et le célébrant."))+    card(win,L(win,"WHAT YOU MAY SEE IN THE TRADITIONAL CEREMONY","CE QUE VOUS POUVEZ VOIR DANS LA CÉRÉMONIE TRADITIONNELLE"),L(win,"The traditional Roman order places the spouses’ consent first. The priest then witnesses and blesses the union, holy water is used, and the ring or rings are blessed and exchanged according to the approved local custom; concluding prayers follow. Details such as one ring or two, the finger used and additional spoken formulas are not universal, so follow the rite actually given to you rather than importing a custom from another country.","L’ordre romain traditionnel place d’abord le consentement des époux. Le prêtre atteste et bénit ensuite l’union, l’eau bénite est employée, puis l’anneau ou les anneaux sont bénis et échangés selon la coutume locale approuvée ; des prières conclusives suivent. Les détails — un ou deux anneaux, le doigt employé et d’éventuelles formules supplémentaires — ne sont pas universels : suivez donc le rite qui vous est effectivement donné au lieu d’importer une coutume d’un autre pays."))+
    card(win,L(win,"FOLLOW THE WEDDING MASS","SUIVRE LA MESSE NUPTIALE"),L(win,"When the traditional Nuptial Mass is celebrated, use the existing certified Ad Orientem Nuptial Mass follower. The 1962 reader already owns the Nuptial Proper and the special marriage prayers after the Pater noster, together with the final blessing over the spouses; this Learn guide does not create a second Mass sequence.","Lorsque la Messe nuptiale traditionnelle est célébrée, utilisez le suivi certifié de la Messe nuptiale d’Ad Orientem. Le lecteur de 1962 possède déjà le Propre nuptial, les prières spéciales du mariage après le Pater noster ainsi que la bénédiction finale des époux ; ce guide d’apprentissage ne crée pas une seconde séquence de Messe."),actions([{label:L(win,"Open Nuptial Mass","Ouvrir la Messe nuptiale"),nuptial:true,primary:true}]))+
    card(win,L(win,"OLDER MISSAL NOTES ARE NOT AUTOMATIC 1962 RULES","LES NOTES DES ANCIENS MISSELS NE SONT PAS AUTOMATIQUEMENT DES RÈGLES DE 1962"),L(win,"Older hand missals can describe restrictions, commemorations and local wedding customs belonging to their own date. Ad Orientem uses them for explanation and comparison, but the live Nuptial Mass follows the app’s certified 1962 source contract. A 1951 rule is therefore never copied into the 1962 engine merely because it appears in an older missal.","Les anciens missels des fidèles peuvent décrire des restrictions, des commémoraisons et des coutumes matrimoniales propres à leur époque. Ad Orientem les utilise pour l’explication et la comparaison, mais la Messe nuptiale en direct suit le contrat de sources certifié de 1962 de l’application. Une règle de 1951 n’est donc jamais transférée dans le moteur de 1962 simplement parce qu’elle figure dans un ancien missel."))+
    `<details class="aoLearnTradSource"><summary>${esc(L(win,"Traditional / current context","Contexte traditionnel / actuel"))}</summary><article class="aoLearnTradCard"><p>${esc(L(win,"Both forms center on the spouses’ consent. The surrounding ceremonial, ring blessing/exchange and relation to Mass differ. This comparison is kept secondary because the couple needs participation guidance, not a celebrant’s ritual book.","Les deux formes ont pour centre le consentement des époux. Le cérémonial environnant, la bénédiction/l’échange des anneaux et le rapport à la Messe diffèrent. Cette comparaison reste secondaire parce que le couple a besoin d’un guide de participation, non d’un rituel de célébrant."))}</p></article></details>`+
    source(win,"Rituale Romanum · traditional Matrimony",TRADITIONAL_LEARN_SOURCES_V381.ritual1952)+
    source(win,"Catechism · Celebration of Marriage",TRADITIONAL_LEARN_SOURCES_V381.currentMarriage)+
    source(win,"Catechism · Matrimonial Consent",TRADITIONAL_LEARN_SOURCES_V381.currentConsent)
  );
}
function trainer(win,state){
  const x=LOW_MASS_RESPONSES_V381[state.trainerIndex]||LOW_MASS_RESPONSES_V381[0];
  return shell(win,
    L(win,"Serve Low Mass","Servir la Messe basse"),
    L(win,"Practice the common minister responses from the same certified 1962 Mass text already used by the Mass follower. This trains the words; it does not invent altar-server choreography.","Entraînez-vous aux réponses courantes du servant à partir du même texte certifié de la Messe de 1962 utilisé par le suivi de Messe. Ceci entraîne les paroles ; aucune chorégraphie de servant n’est inventée."),
    "1962 Mass · exact response text",
    `<section class="aoLearnTradTrainer"><div class="aoLearnTradCue">${esc(x.cue)} · ${state.trainerIndex+1} / ${LOW_MASS_RESPONSES_V381.length}</div><div class="aoLearnTradPrompt">${esc(x.prompt)}</div>${state.trainerReveal?`<div class="aoLearnTradAnswer"><strong>${esc(x.lat)}</strong><span>${esc(x.en)}</span></div>`:`<div class="aoLearnTradActions"><button type="button" class="primary" data-ao-tradlearn-reveal>${esc(L(win,"Reveal response","Afficher la réponse"))}</button></div>`}<div class="aoLearnTradNav"><button type="button" data-ao-tradlearn-trainer="prev" ${state.trainerIndex===0?"disabled":""}>← ${esc(L(win,"Previous","Précédent"))}</button><button type="button" data-ao-tradlearn-trainer="next" ${state.trainerIndex===LOW_MASS_RESPONSES_V381.length-1?"disabled":""}>${esc(L(win,"Next","Suivant"))} →</button></div></section>`+
    source(win,"Ad Orientem certified 1962 Mass corpus + Baltimore · Manner of Serving Mass",TRADITIONAL_LEARN_SOURCES_V381.baltimore)
  );
}
function scapular(win){
  return shell(win,
    L(win,"Brown Scapular","Scapulaire brun"),
    L(win,"A Marian devotion for the faithful. The useful questions are what the Scapular means, how to prepare for enrolment, and how to live the devotion—not how a minister performs the rite.","Une dévotion mariale pour les fidèles. Les questions utiles sont ce que signifie le Scapulaire, comment se préparer à l’imposition et comment vivre la dévotion — non comment un ministre accomplit le rite."),
    L(win,"Devotion · Prepare · Live","Dévotion · Se préparer · Vivre"),
    card(win,L(win,"WHAT IT IS","CE QUE C’EST"),L(win,"The Brown Scapular is a traditional Marian sacramental associated with the Carmelite family. It is a sign of devotion and relationship with Our Lady, not a charm or automatic guarantee.","Le Scapulaire brun est un sacramental marial traditionnel associé à la famille carmélitaine. C’est un signe de dévotion et de relation avec Notre-Dame, non un charme ni une garantie automatique."))+
    card(win,L(win,"PREPARE FOR ENROLMENT","SE PRÉPARER À L’IMPOSITION"),L(win,"If you wish to be enrolled, ask a priest or another properly authorised minister and follow the preparation they give you. Ad Orientem does not provide a self-investiture flow.","Si vous souhaitez recevoir l’imposition, adressez-vous à un prêtre ou à un autre ministre dûment autorisé et suivez la préparation qu’il vous donne. Ad Orientem ne propose pas d’auto-investiture."))+
    card(win,L(win,"LIVE THE DEVOTION","VIVRE LA DÉVOTION"),L(win,"Wear the Scapular as a devotional sign and let it support a genuinely Marian Catholic life of prayer and fidelity rather than treating the object superstitiously.","Portez le Scapulaire comme signe de dévotion et laissez-le soutenir une vie catholique réellement mariale de prière et de fidélité, plutôt que de traiter l’objet de manière superstitieuse."))+
    source(win,"Baltimore Manual · Scapular with form of Investing",TRADITIONAL_LEARN_SOURCES_V381.baltimore)+
    source(win,"Directory on Popular Piety · Scapular of Mount Carmel",TRADITIONAL_LEARN_SOURCES_V381.scapular)
  );
}
function seasonal(win){
  const rows=SEASONAL_PRACTICES_V381.map(item=>`<button type="button" class="aoLearnTradSeason" data-ao-tradlearn-route="${esc(item.route)}"><small>${esc(pick(win,item.when))}</small><b>${esc(pick(win,item.title))}</b><span>${esc(pick(win,item.detail))}</span></button>`).join("");
  return shell(win,
    L(win,"Traditional Liturgical Year","Année liturgique traditionnelle"),
    L(win,"A lay companion to recurring traditional observances: what the faithful can pray, attend and observe. The current modular Calendar remains the authority for dates and liturgical resolution.","Un compagnon laïc des observances traditionnelles récurrentes : ce que les fidèles peuvent prier, suivre et observer. Le Calendrier modulaire actuel reste l’autorité pour les dates et la résolution liturgique."),
    L(win,"Observe · Pray · Attend","Observer · Prier · Participer"),
    `<div class="aoLearnTradSeasonList">${rows}</div>`
  );
}

export function createTraditionalLearnRuntime(win=globalThis){
  const state={route:null,screen:"module",prayerId:null,trainerIndex:0,trainerReveal:false,returnFocus:null};
  function root(){return win?.document?.getElementById?.(TRADITIONAL_LEARN_ROOT_ID)||null}
  function ensureRoot(){
    const doc=win?.document;if(!doc?.body)return null;
    let node=root();if(node)return node;
    node=doc.createElement("section");node.id=TRADITIONAL_LEARN_ROOT_ID;node.dataset.aoTraditionalLearnOwner=TRADITIONAL_LEARN_VERSION;node.setAttribute("role","region");
    node.addEventListener("click",onClick);doc.body.append(node);return node;
  }
  function render(){
    const node=ensureRoot();if(!node||!state.route)return false;
    node.dataset.aoTraditionalLearnRoute=state.route;
    if(state.screen==="prayer")node.innerHTML=prayerView(win,state.prayerId);
    else if(state.route==="learn.rites.sick")node.innerHTML=sick(win);
    else if(state.route==="learn.rites.baptism")node.innerHTML=baptism(win);
    else if(state.route==="learn.rites.confirmation")node.innerHTML=confirmation(win);
    else if(state.route==="learn.rites.matrimony")node.innerHTML=matrimony(win);
    else if(state.route==="learn.serve_mass.responses")node.innerHTML=trainer(win,state);
    else if(state.route==="learn.scapular")node.innerHTML=scapular(win);
    else node.innerHTML=seasonal(win);
    node.scrollTop=0;queueMicrotask(()=>node.querySelector("button,[href],summary,[tabindex]:not([tabindex='-1'])")?.focus?.());return true;
  }
  function open(id,opts={}){
    const canonical=id==="learn.serve_mass"?"learn.serve_mass.responses":id;
    if(!TRADITIONAL_LEARN_ROUTES[canonical])return false;
    if(canonical==="learn.seasonal_rites"){
      close();
      win?.AO_CALENDAR_APP_V1?.setView?.("year");
      void win?.AO_APP_SHELL_V1?.navigate?.("calendar");
      return true;
    }
    state.route=canonical;state.screen="module";state.prayerId=null;state.trainerIndex=0;state.trainerReveal=false;state.returnFocus=opts.trigger||win?.document?.activeElement||null;
    ensureRoot();render();return true;
  }
  function close(){
    const node=root();if(node){const active=win?.document?.activeElement;if(node.contains(active))try{active.blur?.()}catch{}node.remove()}
    state.route=null;state.screen="module";state.prayerId=null;state.trainerReveal=false;state.returnFocus=null;return true;
  }
  async function handoff(route){
    close();
    if(route==="calendar"){await win?.AO_APP_SHELL_V1?.navigate?.("calendar");return true}
    if(String(route).startsWith("pray.")){
      await win?.AO_APP_SHELL_V1?.navigate?.("pray");
      return win?.AO_MODULES?.open?.(route,{returnContext:{surface:"learn"}})??false;
    }
    return win?.AO_MODULES?.open?.(route,{returnContext:{surface:"learn"}})??false;
  }
  function nuptial(){
    close();
    try{win?.AO_CELEBRATION_API?.select?.("nuptial");return win?.AO_CELEBRATION_API?.openPreflight?.()??win?.AO_CELEBRATION_API?.openChangeMass?.()??true}catch{return false}
  }
  function onClick(e){
    const b=e.target?.closest?.("button,[data-ao-tradlearn-flip]");if(!b)return;
    if(b.matches("[data-ao-tradlearn-back]")){e.preventDefault();if(state.screen==="prayer"){state.screen="module";state.prayerId=null;render()}else close();return}
    if(b.matches("[data-ao-tradlearn-close]")){e.preventDefault();close();return}
    if(b.matches("[data-ao-tradlearn-flip]")){e.preventDefault();const v=b.querySelector("[data-face-v]"),la=b.querySelector("[data-face-la]");if(v&&la){const showLatin=la.hidden;la.hidden=!showLatin;v.hidden=showLatin}return}
    if(b.dataset.aoTradlearnPrayer){e.preventDefault();state.screen="prayer";state.prayerId=b.dataset.aoTradlearnPrayer;render();return}
    if(b.dataset.aoTradlearnRoute){e.preventDefault();void handoff(b.dataset.aoTradlearnRoute);return}
    if(b.matches("[data-ao-tradlearn-nuptial]")){e.preventDefault();nuptial();return}
    if(b.matches("[data-ao-tradlearn-reveal]")){e.preventDefault();state.trainerReveal=true;render();return}
    if(b.dataset.aoTradlearnTrainer){e.preventDefault();const delta=b.dataset.aoTradlearnTrainer==="next"?1:-1;state.trainerIndex=Math.max(0,Math.min(LOW_MASS_RESPONSES_V381.length-1,state.trainerIndex+delta));state.trainerReveal=false;render()}
  }
  function status(){return Object.freeze({version:TRADITIONAL_LEARN_VERSION,installed:true,open:Boolean(root()),route:state.route,screen:state.screen,responseCards:LOW_MASS_RESPONSES_V381.length,priestCeremonialExposed:false})}
  return Object.freeze({version:TRADITIONAL_LEARN_VERSION,open,close,status,render});
}

export function ensureTraditionalLearnRegistry(win=globalThis){
  if(win?.AO_MODULES?.__aoTraditionalLearnV381)return win.AO_MODULES;
  const base=win?.AO_MODULES;if(!base)return null;
  const runtime=win.AO_TRADITIONAL_LEARN_V381||createTraditionalLearnRuntime(win);win.AO_TRADITIONAL_LEARN_V381=runtime;
  const alias=Object.freeze({id:"learn.serve_mass",type:"alias",domain:"learn",category:"mass-formation",title:"Low Mass Responses"});
  const wrapper={...base,__aoTraditionalLearnV381:true,
    get(id){if(id==="learn.serve_mass")return alias;return TRADITIONAL_LEARN_ROUTES[id]||base.get?.(id)||null},
    resolve(id){if(id==="learn.serve_mass")return {ok:true,input:id,id:"learn.serve_mass.responses",defaults:{},chain:["learn.serve_mass","learn.serve_mass.responses"],definition:TRADITIONAL_LEARN_ROUTES["learn.serve_mass.responses"]};if(TRADITIONAL_LEARN_ROUTES[id])return {ok:true,input:id,id,defaults:{},chain:[id],definition:TRADITIONAL_LEARN_ROUTES[id]};return base.resolve?.(id)},
    async open(id,opts={}){const canonical=id==="learn.serve_mass"?"learn.serve_mass.responses":id;if(TRADITIONAL_LEARN_ROUTES[canonical])return {ok:runtime.open(canonical,opts),input:String(id),canonicalId:canonical,type:"module",domain:"learn",options:opts,aliasChain:id===canonical?[id]:[id,canonical],error:null};return base.open?.(id,opts)},
    list(filter={}){const prior=[...(base.list?.(filter)||[])].filter(x=>!TRADITIONAL_LEARN_ROUTES[x?.id]);if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="learn"))prior.push(...Object.values(TRADITIONAL_LEARN_ROUTES));return prior}
  };
  win.AO_MODULES=wrapper;win.AO_MODULE_REGISTRY_V36=wrapper;return wrapper;
}

export function installTraditionalLearnModules(win=globalThis){
  if(!win)return false;
  if(!win.AO_TRADITIONAL_LEARN_V381)win.AO_TRADITIONAL_LEARN_V381=createTraditionalLearnRuntime(win);
  ensureTraditionalLearnRegistry(win);
  return win.AO_TRADITIONAL_LEARN_V381;
}

if(typeof window!=="undefined"&&typeof document!=="undefined")installTraditionalLearnModules(window);
