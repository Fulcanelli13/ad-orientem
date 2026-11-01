import {prayerDoorArtSlot} from "./art-slot-map.v1.js";
/**
 * Prayer discovery + Angelus presentation (default; explicitly reversible).
 *
 * This file is PRESENTATION ONLY. It does not alter any canonical prayer,
 * devotional event stream, ritual posture, seasonal resolver or saved progress.
 * The nine-door landing is on by default. ?aoPrayerPilot=0 restores the legacy hub.
 * Artwork is intentionally not invented: the mosaic uses native Ad Orientem
 * semantic icons until approved art identities and crops are wired separately.
 */
export const PRAYER_DESIGN_PILOT_SCHEMA="ao-prayer-discovery-angelus-pilot-v1";
export function prayerPilotEnabled(win){
  try{return new URLSearchParams(win.location.search).get("aoPrayerPilot")!=="0"}
  catch{return true}
}
/**
 * One visible shelf per complete devotion. Existing internal and external route
 * identities are NOT changed; reader-internal methods and general hymns remain
 * searchable without becoming duplicate family cards.
 *
 * "prayer" items are canonical single-text records from DATA.prayers, not
 * newly authored prayers or independent devotional reader engines.
 */
export const PRAYER_DOOR_ORDER_V1=Object.freeze({
 daily:["pray.morning_evening","pray.angelus_regina","pray.meal_prayers","pray.nightly_examen"],
 chaplets:["pray.rosary","pray.divine_mercy","pray.five_wounds","pray.precious_blood","pray.little_crown"],
 eucharistic:["pray.adoration","pray.benediction","pray.forty_hours","pray.communion_treasury"],
 marian:["litany_loreto_1962","marian_memorare","marian_hail_holy_queen","sub_tuum","marian_consecration_immaculate_heart"],
 novenas:["pray.novenas","programme.first_friday","programme.first_saturday","pray.montfort_consecration"],
 ourlord:["pray.stations","pray.seven_words","pray.tenebrae","pray.sacred_heart","pray.holy_name_litany"],
 saints:["pray.litany_saints","pray.st_joseph_seven_sorrows","devotion_prayer_st_michael","devotion_litany_st_joseph","devotion_st_anthony_lost_items","foundations_guardian_angel"],
 intentions:["pray.confession","pray.penitential_psalms","pray.occasional_intercessions","pray.for_priests","pray.good_death","pray.dying_companion"],
 library:[]
});
export const PRAYER_SEARCH_ONLY_ROUTES_V1=Object.freeze(["pray.rosary_methods","pray.sacred_hymns"]);
export const PRAYER_PRIMARY_DOOR_V1=Object.freeze(Object.fromEntries(
 Object.entries(PRAYER_DOOR_ORDER_V1).flatMap(([door,ids])=>ids.map(id=>[id,door]))
));
export function prayerPilotAliases(L){
 return {
  marian:{
   title:L("Our Lady","Notre-Dame"),
   description:L("Traditional Marian litanies, antiphons and prayers.","Litanies, antiennes et prières mariales traditionnelles."),
   assetId:"ao-rich-rosary",
   items:[
    ["prayer","litany_loreto_1962",L("Litany of Loreto","Litanies de Lorette"),L("Traditional invocations and responses","Invocations et répons traditionnels")],
    ["prayer","marian_memorare",L("Memorare","Souvenez-vous"),L("Prayer for Our Lady's intercession","Prière demandant l'intercession de Notre-Dame")],
    ["prayer","marian_hail_holy_queen",L("Hail Holy Queen","Salve Regina"),L("Marian antiphon","Antienne mariale")],
    ["prayer","sub_tuum",L("Sub Tuum Praesidium","Sous l'abri de votre miséricorde"),L("Ancient Marian prayer","Ancienne prière mariale")],
    ["prayer","marian_consecration_immaculate_heart",L("Consecration to the Immaculate Heart","Consécration au Cœur Immaculé"),L("Traditional consecration prayer","Prière traditionnelle de consécration")]
   ]
  },
  novenas:{
   title:L("Novenas & Journeys","Neuvaines & parcours"),
   description:L("Daily and monthly programmes, each with its original prayer sequence.","Programmes quotidiens et mensuels, avec leurs prières propres."),
   assetId:"ao-rich-novenas",
   items:[
    ["external","pray.novenas",L("Novenas","Neuvaines"),L("The canonical nine-day programmes","Programmes canoniques de neuf jours")],
    ["own","programme.first_friday",L("Nine First Fridays","Neuf premiers vendredis"),L("Sacred Heart reparatory devotion","Dévotion réparatrice au Sacré-Cœur")],
    ["own","programme.first_saturday",L("Five First Saturdays","Cinq premiers samedis"),L("Immaculate Heart devotion","Dévotion au Cœur Immaculé")],
    ["own","pray.montfort_consecration",L("Montfort · 33 days","Montfort · 33 jours"),L("Preparation and consecration","Préparation et consécration")]
   ]
  },
  ourlord:{
   title:L("Our Lord","Notre-Seigneur"),
   description:L("The Passion, Sacred Heart and Holy Name.","La Passion, le Sacré-Cœur et le Saint Nom."),
   assetId:"ao-rich-stations",
   items:[
    ["own","pray.stations",L("Stations of the Cross","Chemin de Croix"),L("Fourteen Stations","Quatorze stations")],
    ["own","pray.seven_words",L("Seven Last Words","Sept dernières Paroles"),L("Gospel words and meditation","Paroles évangéliques et méditation")],
    ["own","pray.tenebrae",L("Office of Tenebrae","Office des Ténèbres"),L("Matins and Lauds of the Sacred Triduum","Matines et Laudes du Triduum")],
    ["external","pray.sacred_heart",L("Sacred Heart","Sacré-Cœur"),L("Litany, reparation and consecration","Litanies, réparation et consécration")],
    ["external","pray.holy_name_litany",L("Litany of the Holy Name","Litanies du Saint Nom"),L("Traditional Roman form","Forme romaine traditionnelle")]
   ]
  },
  saints:{
   title:L("Saints & Angels","Saints & anges"),
   description:L("Traditional intercession and prayers to the saints and angels.","Intercession et prières aux saints et aux anges."),
   assetId:"ao-rich-prayer-library",
   items:[
    ["own","pray.litany_saints",L("Litany of the Saints","Litanies des saints"),L("Call and response","Invocations et répons")],
    ["own","pray.st_joseph_seven_sorrows",L("St Joseph · Sorrows and Joys","Saint Joseph · Douleurs et Joies"),L("Seven paired meditations","Sept méditations en paires")],
    ["prayer","devotion_prayer_st_michael",L("Prayer to St Michael","Prière à saint Michel"),L("Traditional angelic intercession","Intercession angélique traditionnelle")],
    ["prayer","devotion_litany_st_joseph",L("Litany of Saint Joseph","Litanies de saint Joseph"),L("Traditional litany","Litanies traditionnelles")],
    ["prayer","devotion_st_anthony_lost_items",L("St Anthony","Saint Antoine"),L("Prayer for lost things","Prière pour les objets perdus")],
    ["prayer","foundations_guardian_angel",L("Guardian Angel","Ange gardien"),L("Traditional guardian angel prayer","Prière traditionnelle à l'ange gardien")]
   ]
  },
  intentions:{
   title:L("Life & Intentions","Vie & intentions"),
   description:L("Confession, penance, intercession and particular needs.","Confession, pénitence, intercession et intentions particulières."),
   assetId:"ao-rich-confession",
   items:[
    ["own","pray.confession",L("Confession","Confession"),L("Examination, contrition and preparation","Examen, contrition et préparation")],
    ["own","pray.penitential_psalms",L("Seven Penitential Psalms","Sept psaumes pénitentiels"),L("Traditional penitential sequence","Séquence pénitentielle traditionnelle")],
    ["own","pray.occasional_intercessions",L("Occasional Intercessions","Intercessions occasionnelles"),L("Family, sickness, peace and other needs","Famille, maladie, paix et autres besoins")],
    ["own","pray.for_priests",L("Prayers for Priests","Prières pour les prêtres"),L("Clergy and vocations","Clergé et vocations")],
    ["external","pray.good_death",L("Preparation for a Good Death","Préparation à une bonne mort"),L("Final perseverance and traditional prayers","Persévérance finale et prières traditionnelles")],
    ["external","pray.dying_companion",L("Dying Companion","Accompagnement du mourant"),L("Bedside prayer and priestly priority","Prière au chevet et priorité au prêtre")]
   ]
  }
 };
}
export function resolvedPrayerPilotFamilies(L,families){
 const aliases=prayerPilotAliases(L),catalog={...families,...aliases};
 const candidates=new Map();
 // Preserve canonical family routes as discoverable source records, even when
 // their old family placement is being retired.
 for(const family of Object.values(catalog)){
  for(const item of family?.items||[])if(!candidates.has(item[1]))candidates.set(item[1],item);
 }
 const result={...catalog};
 for(const [door,ids] of Object.entries(PRAYER_DOOR_ORDER_V1)){
  const family=catalog[door];
  if(!family)continue;
  result[door]={...family,items:ids.map(id=>family.items?.find(item=>item[1]===id)||candidates.get(id)).filter(Boolean)};
 }
 // Search-only links preserve the original route without duplicating a shelf.
 result.library={...result.library,searchItems:PRAYER_SEARCH_ONLY_ROUTES_V1.map(id=>candidates.get(id)).filter(Boolean)};
 return result;
}
const MOSAIC=[
  {id:"chaplets",col:"1/5",row:"1/6",large:true},
  {id:"marian",col:"5/7",row:"1/4"},
  {id:"daily",col:"5/7",row:"4/7"},
  {id:"library",col:"1/3",row:"6/9"},
  {id:"novenas",col:"3/5",row:"6/10"},
  {id:"eucharistic",col:"5/7",row:"7/11"},
  {id:"ourlord",col:"1/3",row:"9/13"},
  {id:"saints",col:"3/5",row:"10/13"},
  {id:"intentions",col:"5/7",row:"11/13"}
];
const simplify=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export function filterPilotDiscovery(root,value){
  if(!root)return;
  const q=simplify(value.trim()),results=root.querySelector("[data-ao-pray-pilot-results]");
  const mosaic=root.querySelector("[data-ao-pray-pilot-mosaic]");
  if(!results||!mosaic)return;
  results.hidden=!q;mosaic.hidden=!!q;
  // The R1.1 facets filter existing source/route metadata; they do not
  // introduce a new prayer index or infer Latin witnesses.
  const active=[...results.querySelectorAll('[data-p435930-pilot-facet][aria-pressed="true"]')]
    .map(node=>node.dataset.p435930PilotFacet);
  const forms=active.filter(id=>id!=="la");
  let count=0;
  for(const row of results.querySelectorAll("[data-pilot-searchable]")){
    const match=!!q&&simplify(row.dataset.pilotSearchable).includes(q)
      &&(!forms.length||forms.includes(row.dataset.pilotForm))
      &&(!active.includes("la")||row.dataset.pilotLatin==="true");
    row.hidden=!match;if(match)count++;
  }
  const counter=root.querySelector("[data-ao-pilot-result-count]");
  if(counter)counter.textContent=String(count);
  const empty=root.querySelector("[data-ao-pilot-empty]");
  if(empty)empty.hidden=count!==0;
}
export function renderPilotDiscovery({head,L,esc,DATA,families,assetIcon}){
  const all=resolvedPrayerPilotFamilies(L,families);
  const makeTile=tile=>{
    const family=all[tile.id];
    const label=tile.id==="library"?L("Essential Prayers","Prières essentielles"):family.title;
    const target=family.direct?' data-p435930-own="'+esc(family.direct)+'"':' data-p435930-family="'+esc(tile.id)+'"';
    const slot=prayerDoorArtSlot(tile.id);
    const artLink=slot?' data-ao-art-slot-id="'+esc(slot.slotId)+'" data-ao-art-rotation="'+esc(slot.rotation)+'" data-ao-art-binding="unassigned"':'';
    return '<button type="button" class="aoPrayPilotTile'+(tile.large?' aoPrayPilotLarge':'')+'" style="grid-column:'+tile.col+';grid-row:'+tile.row+'"'+target+artLink+' aria-label="'+esc(label)+'">'+
      '<span class="aoPrayPilotTileSymbol" aria-hidden="true">'+assetIcon(family.assetId,"aoPrayPilotNativeIcon",{preferEmbedded:true})+'</span>'+
      '<span class="aoPrayPilotTileCaption">'+esc(label)+'</span></button>';
  };
  const routes=new Map();
  Object.values(all).forEach(f=>{
    [...(f.items||[]),...(f.searchItems||[])].forEach(item=>{
      const [owner,id,title,description]=item;
      // Canonical single-text records are already indexed below as DATA.prayers.
      if(owner==="prayer")return;
      if(!routes.has(id))routes.set(id,{owner,id,title,description});
    });
  });
  const routeForm=id=>/novena|montfort|first_friday|first_saturday/.test(id)?"novena"
    :/rosary|chaplet|five_wounds|little_crown|precious_blood|mercy/.test(id)?"chaplet"
    :/litany/.test(id)?"litany":"prayer";
  const routeRows=[...routes.values()].map(row=>
    '<button type="button" class="aoPrayPilotResult" data-pilot-form="'+routeForm(row.id)+'" data-pilot-latin="false" data-pilot-searchable="'+esc([row.title,row.description].join(" "))+'"'+
    (row.owner==="external"?' data-p435930-external="':' data-p435930-own="')+esc(row.id)+'">'+
    '<b>'+esc(row.title)+'</b><small>'+esc(row.description)+'</small></button>'
  ).join("");
  const prayerRows=Object.entries(DATA.prayers||{}).map(([id,p])=>
    '<button type="button" class="aoPrayPilotResult" data-pilot-form="'+(id.includes("litany")?"litany":"prayer")+'" data-pilot-latin="'+Boolean(p.la)+'" data-pilot-searchable="'+esc([p.title,p.titleFr,id].join(" "))+'" data-p435930-pilot-prayer="'+esc(id)+'">'+
    '<b>'+esc(p.titleFr&&L("EN","FR")==="FR"?p.titleFr:p.title)+'</b>'+
    '<small>'+esc(L("Canonical prayer text","Texte canonique de prière"))+'</small></button>'
  ).join("");
  return head(L("Pray","Prier"),"")+
    '<main class="aoP435930Body aoPrayPilotHome">'+
      '<div class="aoPrayPilotTop"><h2>'+esc(L("Prayer","Prière"))+'</h2>'+
      '<label class="aoPrayPilotSearch">'+assetIcon("ao-ui-search","aoPrayPilotSearchIcon")+
      '<input type="search" data-p435930-pilot-search autocomplete="off" aria-label="'+esc(L("Search all prayers and devotions","Rechercher toutes les prières et dévotions"))+'" placeholder="'+esc(L("Search prayers and devotions","Rechercher prières et dévotions"))+'"></label>'+
      '</div>'+
      '<div data-ao-pray-pilot-results class="aoPrayPilotResults" hidden>'+
      '<div class="aoPrayPilotFacets" role="group" aria-label="'+esc(L("Filter search results","Filtrer les résultats"))+'">'+
      [["prayer",L("Prayers","Prières")],["litany",L("Litanies","Litanies")],["chaplet",L("Chaplets","Chapelets")],["novena",L("Novenas","Neuvaines")],["la",L("Latin","Latin")]]
        .map(([id,label])=>'<button type="button" data-p435930-pilot-facet="'+id+'" aria-pressed="false">'+esc(label)+'</button>').join("")+
      '</div><p><b data-ao-pilot-result-count>0</b> '+esc(L("results","résultats"))+'</p>'+routeRows+prayerRows+
      '<p data-ao-pilot-empty hidden>'+esc(L("No matching prayers or devotions.","Aucune prière ni dévotion correspondante."))+'</p></div>'+
      '<section data-ao-pray-pilot-mosaic class="aoPrayPilotMosaic" aria-label="'+esc(L("Prayer categories","Catégories de prières"))+'">'+MOSAIC.map(makeTile).join("")+'</section>'+
      '<button type="button" class="aoPrayPilotCustoms" data-p435930-my-customs>'+assetIcon("ao-rich-prayer-library","aoPrayPilotCustomsIcon",{preferEmbedded:true})+'<span><b>'+esc(L("My Customs & Prayers","Mes coutumes et prières"))+'</b><small>'+esc(L("Personal prayers and household customs","Prières personnelles et coutumes familiales"))+'</small></span></button>'+
    '</main>';
}
export function renderPilotAngelusEntry({head,L,esc,form,posture,moduleIcon,recitation='individual',hour=12}){
  const regina=form==="regina";
  const selectedHour=[6,12,18].includes(hour)?hour:12;
  const hourName=selectedHour===6?L("Dawn","Aube"):selectedHour===18?L("Dusk","Soir"):L("Midday","Midi");
  const hourTime=String(selectedHour).padStart(2,"0")+":00";
  const count=regina?[3,3,3]:[3,3,3,9]; // Decorative bell grouping only; not a substitute for the source prayer cards.
  const strokes=count.map((n,i)=>'<span class="aoPrayPilotBellGroup" aria-hidden="true">'+Array.from({length:n},()=>'<span class="aoPrayPilotBellDot"></span>').join('')+'</span>').join('');
  return head(regina?"Regina Cæli":"Angelus",L("Prayer of the hour","Prière de l'heure"))+
    '<main class="aoP435930Body aoPrayPilotAngelusEntry">'+
      '<section class="aoPrayPilotAngelusHero" data-ao-art-publication="unassigned">'+
        '<small class="aoPrayPilotAngelusArtSlot">'+esc(L("ART SLOT · ANGELUS","EMPLACEMENT D’ART · ANGÉLUS"))+'</small>'+
        '<div class="aoPrayPilotAngelusCoverCopy">'+
          '<small class="aoPrayPilotHourEyebrow">'+moduleIcon("pray.angelus_regina")+'<span>'+esc(hourName+" · "+hourTime)+'</span></small>'+
          '<h2>'+esc(regina?"Regina Cæli":L("The Angelus","L’Angélus"))+'</h2>'+
          '<p>'+esc(regina?L("Rejoice, O Queen of Heaven.","Réjouissez-vous, Reine du ciel."):L("The bell calls us to remember the Incarnation.","La cloche nous rappelle le mystère de l’Incarnation."))+'</p>'+
          '<div class="aoPrayPilotBellMoments" aria-label="'+esc(L("Traditional bell sequence","Sonnerie traditionnelle"))+'">'+strokes+'</div>'+
        '</div>'+
      '</section>'+
      '<div class="aoPrayPilotAngelusActions">'+
        '<button type="button" class="aoPrayPilotBegin" data-p435930-pilot-angelus-begin>'+esc(L("Begin","Commencer"))+'</button>'+
        '<div class="aoPrayPilotRecitation" role="group" aria-label="'+esc(L("Recitation","Récitation"))+'">'+
          '<button type="button" data-p435930-pilot-angelus-recitation="individual" aria-pressed="'+String(recitation!=='group')+'">'+esc(L("Alone","Seul"))+'</button>'+
          '<button type="button" data-p435930-pilot-angelus-recitation="group" aria-pressed="'+String(recitation==='group')+'">'+esc(L("With others","Avec d’autres"))+'</button>'+
        '</div>'+
      '</div>'+
    '</main>';
}
function installStyles(){
  if(typeof document==="undefined"||document.getElementById("ao-prayer-design-pilot-css"))return;
  const css=[
    "#aoPray435930 .aoPrayPilotHome{display:block;width:100%;min-width:0;box-sizing:border-box;padding:0 0 20px;overflow-y:auto}",
    "#aoPray435930 .aoPrayPilotTop{padding:6px 16px 10px}",
    "#aoPray435930 .aoPrayPilotTop h2{font:600 28px/1.16 var(--ao-font-display,Georgia,serif);margin:8px 0 12px;color:var(--text,#f3ead7)}",
    "#aoPray435930 .aoPrayPilotSearch{min-height:46px;display:flex;gap:10px;align-items:center;padding:0 13px;border:1px solid var(--border,#4c4841);border-radius:12px;background:var(--surface-1,#18202a);color:var(--muted,#aaa)}",
    "#aoPray435930 .aoPrayPilotSearch input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--text,#f3ead7);font:400 16px/1.3 var(--ao-font-display,Georgia,serif)}",
    "#aoPray435930 .aoPrayPilotSearchIcon{width:19px;height:19px}",
    "#aoPray435930 .aoPrayPilotIntro{font:400 13px/1.4 var(--ao-font-display,Georgia,serif);color:var(--muted,#aaa);margin:9px 0 0}",
    "#aoPray435930 .aoPrayPilotMosaic{display:grid;width:100%;min-width:0;box-sizing:border-box;grid-template-columns:repeat(6,minmax(0,1fr));grid-auto-rows:44px;gap:3px;max-width:590px;margin:0 auto 2px;padding:0 3px}",
    "#aoPray435930 .aoPrayPilotTile{position:relative;width:100%;height:100%;min-width:0;min-height:0;padding:0;overflow:hidden;border:0;border-radius:2px;background:linear-gradient(140deg,#243548,#111920);color:#fff;cursor:pointer;text-align:left}",
    "#aoPray435930 .aoPrayPilotTile:nth-child(3n+2){background:linear-gradient(140deg,#51412f,#1a1e23)}",
    "#aoPray435930 .aoPrayPilotTile:nth-child(3n){background:linear-gradient(140deg,#43334f,#161c29)}",
    "#aoPray435930 .aoPrayPilotTile:focus-visible{outline:3px solid var(--liturgical,#c9ae76);outline-offset:-3px;z-index:2}",
    "#aoPray435930 .aoPrayPilotTile::after{content:'';position:absolute;inset:32% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.78));pointer-events:none}",
    "#aoPray435930 .aoPrayPilotTileSymbol{position:absolute;inset:0;display:grid;place-items:center;color:rgba(231,212,180,.52)}",
    "#aoPray435930 .aoPrayPilotNativeIcon{width:46%;height:46%;max-width:116px;max-height:116px;opacity:.9}",
    "#aoPray435930 .aoPrayPilotTileCaption{position:absolute;left:0;right:0;bottom:0;z-index:1;padding:24px 8px 8px;font:600 14px/1.13 var(--ao-font-display,Georgia,serif);text-shadow:0 1px 3px #000}",
    "#aoPray435930 .aoPrayPilotLarge .aoPrayPilotTileCaption{font-size:22px;padding:40px 13px 12px}",
    "#aoPray435930 .aoPrayPilotCustoms{display:flex;align-items:center;gap:10px;min-height:48px;margin:12px auto 0;padding:10px 14px;width:calc(100% - 32px);max-width:564px;border:1px solid var(--border,#4c4841);border-radius:12px;background:var(--surface-1,#18202a);color:var(--text,#f3ead7);text-align:left;cursor:pointer}",
    "#aoPray435930 .aoPrayPilotCustoms:focus-visible{outline:3px solid var(--liturgical,#c9ae76);outline-offset:2px}",
    "#aoPray435930 .aoPrayPilotCustomsIcon{flex:0 0 26px;width:26px;height:26px}",
    "#aoPray435930 .aoPrayPilotCustoms span{display:flex;min-width:0;flex-direction:column;gap:3px}",
    "#aoPray435930 .aoPrayPilotCustoms b{font:600 15px/1.2 var(--ao-font-display,Georgia,serif)}",
    "#aoPray435930 .aoPrayPilotCustoms small{font:400 12px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#aaa)}",
    "#aoPray435930 .aoPrayPilotResults{padding:4px 16px 24px}",
    "#aoPray435930 .aoPrayPilotResults[hidden],#aoPray435930 .aoPrayPilotMosaic[hidden],#aoPray435930 .aoPrayPilotResult[hidden]{display:none!important}",
    "#aoPray435930 .aoPrayPilotFacets{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 12px}",
    "#aoPray435930 .aoPrayPilotFacets button{min-height:44px;padding:8px 12px;border:1px solid var(--border,#555);border-radius:999px;background:var(--surface-1,#1a2530);color:var(--text,#eee);font:600 12px/1.2 var(--ao-font-ui,system-ui,sans-serif)}",
    "#aoPray435930 .aoPrayPilotFacets button[aria-pressed=true]{border-color:var(--liturgical,#c9ae76);background:color-mix(in srgb,var(--liturgical,#c9ae76) 20%,var(--surface-1,#1a2530))}",
    "#aoPray435930 .aoPrayPilotResult{display:block;width:100%;min-height:55px;text-align:left;background:transparent;border:0;border-bottom:1px solid var(--border,#333);padding:10px 0;color:var(--text,#fff);cursor:pointer}",
    "#aoPray435930 .aoPrayPilotResult b{display:block;font:500 17px/1.25 var(--ao-font-display,Georgia,serif)}",
    "#aoPray435930 .aoPrayPilotResult small{display:block;margin-top:3px;color:var(--muted,#aaa);font-size:12px;line-height:1.35}",
    "#aoPray435930 .aoPrayDoorInterior{box-sizing:border-box;width:100%;max-width:640px;margin:0 auto;padding:18px 16px 28px;min-width:0}",
    "#aoPray435930 .aoPrayDoorHeading{margin:0 0 24px;padding:0}",
    "#aoPray435930 .aoPrayDoorHeading small{font:600 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em;color:var(--liturgical,#c9ae76)}",
    "#aoPray435930 .aoPrayDoorHeading h2{font:600 clamp(27px,6vw,35px)/1.15 var(--ao-font-display,Georgia,serif);color:var(--text,#f3ead7);margin:7px 0 8px}",
    "#aoPray435930 .aoPrayDoorHeading p{font:400 14px/1.5 var(--ao-font-display,Georgia,serif);color:var(--muted,#aaa);margin:0;max-width:45ch}",
    "#aoPray435930 .aoPrayDoorFeatured{display:flex;align-items:center;gap:13px;min-height:132px;width:100%;padding:15px;border:1px solid var(--border,#4c4841);border-radius:12px;background:linear-gradient(120deg,var(--surface-2,#23313e),var(--surface-1,#18202a));color:var(--text,#f3ead7);text-align:left;cursor:pointer}",
    "#aoPray435930 .aoPrayDoorFeaturedIcon{display:grid;place-items:center;flex:0 0 60px;width:60px;height:76px;color:var(--liturgical,#c9ae76)}",
    "#aoPray435930 .aoPrayDoorFeaturedIcon svg{max-width:56px;max-height:66px}",
    "#aoPray435930 .aoPrayDoorFeaturedCopy{display:flex;flex:1;flex-direction:column;gap:5px;min-width:0}",
    "#aoPray435930 .aoPrayDoorFeaturedCopy small{font:600 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;color:var(--liturgical,#c9ae76)}",
    "#aoPray435930 .aoPrayDoorFeaturedCopy b{font:600 21px/1.24 var(--ao-font-display,Georgia,serif)}",
    "#aoPray435930 .aoPrayDoorFeaturedCopy span{font:400 12px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#bbb)}",
    "#aoPray435930 .aoPrayDoorFeatured>i,#aoPray435930 .aoPrayDoorShelfRow>i{flex:0 0 20px;color:var(--muted,#aaa)}",
    "#aoPray435930 .aoPrayDoorShelfList{display:flex;flex-direction:column;margin-top:18px;border-top:1px solid var(--border,#4c4841)}",
    "#aoPray435930 .aoPrayDoorShelfRow{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:70px;padding:13px 4px;width:100%;text-align:left;background:transparent;border:0;border-bottom:1px solid var(--border,#4c4841);color:var(--text,#f3ead7);cursor:pointer}",
    "#aoPray435930 .aoPrayDoorShelfCopy{display:flex;flex:1;min-width:0;flex-direction:column;gap:5px}",
    "#aoPray435930 .aoPrayDoorShelfCopy b{font:600 17px/1.25 var(--ao-font-display,Georgia,serif)}",
    "#aoPray435930 .aoPrayDoorShelfCopy small{font:400 12px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#aaa)}",
    "#aoPray435930 .aoPrayDoorContext{margin-top:18px;padding:13px 0 4px;border-top:1px solid var(--border,#4c4841);opacity:.85}",
    "#aoPray435930 .aoPrayDoorFeatured:focus-visible,#aoPray435930 .aoPrayDoorShelfRow:focus-visible{outline:2px solid var(--liturgical,#c9ae76);outline-offset:2px}",
    "@media(max-width:359px){#aoPray435930 .aoPrayDoorInterior{padding:12px 12px 24px}#aoPray435930 .aoPrayDoorFeatured{gap:9px;padding:11px}#aoPray435930 .aoPrayDoorFeaturedIcon{flex-basis:47px;width:47px}#aoPray435930 .aoPrayDoorFeaturedCopy b{font-size:19px}}",
    "#aoPray435930 .aoP435930Body.aoPrayPilotAngelusEntry{display:flex!important;flex-direction:column!important;flex-wrap:nowrap!important;gap:0!important;padding:0!important;margin:0 auto!important;min-height:calc(100dvh - 120px)!important;box-sizing:border-box;background:#17110d}",
    "#aoPray435930 .aoPrayPilotAngelusHero{flex:1 1 auto!important;min-height:270px!important;position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:20px 18px 12px;background:linear-gradient(153deg,#bc9261 0%,#795735 29%,#3b281b 61%,#17110d 100%);color:#f3e9dc}",
    "#aoPray435930 .aoPrayPilotAngelusSymbol{display:grid;place-items:center;flex:1;min-height:70px;max-height:170px;color:var(--liturgical,#c9ae76)}",
    "#aoPray435930 .aoPrayPilotAngelusSymbol svg{width:88px;height:88px;max-width:100%}",
    "#aoPray435930 .aoPrayPilotAngelusHero small{font:600 11px/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#dcc398}",
    "#aoPray435930 .aoPrayPilotAngelusHero h2{font:600 40px/1.1 var(--ao-font-display,Georgia,serif);margin:8px 0}",
    "#aoPray435930 .aoPrayPilotAngelusHero p{font:italic 17px/1.5 var(--ao-font-display,Georgia,serif);margin:0}",
    "#aoPray435930 .aoPrayPilotEntryMeta{margin-top:16px;font-size:13px;color:#e1c7a8}",
    "#aoPray435930 .aoPrayPilotAngelusActions{padding:6px 18px 18px;background:#17110d}",
    "#aoPray435930 .aoPrayPilotRecitation{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px;margin:9px auto 0;padding:3px;border-radius:8px;background:#332a26;width:max-content;max-width:100%}",
    "#aoPray435930 .aoPrayPilotRecitation button{min-width:62px;min-height:32px;padding:0 9px;border:0;border-radius:6px;background:transparent;color:#c0aea0;font:500 12px/1.3 var(--ao-font-ui,system-ui,sans-serif)}",
    "#aoPray435930 .aoPrayPilotRecitation button[aria-pressed=true]{background:#6c5a52;color:#fff;box-shadow:0 1px 4px rgba(0,0,0,.16)}",
    "#aoPray435930 .aoPrayPilotBegin{width:100%;min-height:48px;border:0;border-radius:999px;background:#f5efe9;color:#28211d;font:600 16px/1.2 var(--ao-font-display,Georgia,serif)}",
    "#aoPray435930 .aoPrayPilotAngelusActions p{font:400 12px/1.45 var(--ao-font-display,Georgia,serif);color:var(--muted,#aaa);text-align:center}",
    "#aoPray435930 .aoPrayPilotAngelusArtSlot{position:absolute;top:17px;left:14px;padding:2px 5px;background:rgba(17,13,10,.35);font:500 9px/1.2 var(--ao-font-ui,system-ui,sans-serif);color:rgba(255,242,226,.77)}",
    "#aoPray435930 .aoPrayPilotAngelusCoverCopy{width:100%;max-width:430px}",
    "#aoPray435930 .aoPrayPilotAngelusCoverCopy .aoPrayPilotHourEyebrow{display:flex;align-items:center;gap:7px;font:600 11px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.10em;color:#e4cdab}",
    "#aoPray435930 .aoPrayPilotHourEyebrow svg{width:16px;height:16px}",
    "#aoPray435930 .aoPrayPilotAngelusCoverCopy h2{font-size:clamp(30px,7vw,38px);margin:7px 0 7px}",
    "#aoPray435930 .aoPrayPilotAngelusCoverCopy p{font-size:15px;max-width:28ch;line-height:1.35;color:#e9d8c4}",
    "#aoPray435930 .aoPrayPilotBellMoments{display:flex;align-items:center;gap:7px;flex-wrap:nowrap;margin-top:15px;min-height:9px}",
    "#aoPray435930 .aoPrayPilotBellGroup{display:inline-flex;align-items:center;gap:3px}",
    "#aoPray435930 .aoPrayPilotBellDot{display:inline-block;width:4px;height:4px;border:1px solid #e3c8a5;border-radius:50%;opacity:.75}",
    "@media(max-height:620px){#aoPray435930 .aoPrayPilotAngelusHero{padding-bottom:8px}#aoPray435930 .aoPrayPilotAngelusActions{padding-bottom:11px}#aoPray435930 .aoPrayPilotAngelusArtSlot{top:8px}}",
    "@media(max-width:359px){#aoPray435930 .aoPrayPilotMosaic{grid-auto-rows:37px}#aoPray435930 .aoPrayPilotTileCaption{font-size:12px;padding:18px 6px 6px}#aoPray435930 .aoPrayPilotLarge .aoPrayPilotTileCaption{font-size:18px;padding:27px 9px 9px}#aoPray435930 .aoPrayPilotTop h2{font-size:25px}}",
    "@media(prefers-reduced-motion:reduce){#aoPray435930 .aoPrayPilotTile{scroll-behavior:auto}}"
  ].join("\n");
  const style=document.createElement("style");style.id="ao-prayer-design-pilot-css";style.textContent=css;document.head.appendChild(style);
}
installStyles();
