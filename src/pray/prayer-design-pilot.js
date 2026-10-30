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
export function prayerPilotAliases(L){
  return {
    marian:{
      title:L("Our Lady","Notre-Dame"),
      description:L("Marian prayer and consecration, with routes to their existing canonical readers.","Prières mariales et consécration, avec accès aux lecteurs canoniques existants."),
      assetId:"ao-rich-rosary",
      items:[
        ["own","pray.angelus_regina",L("Angelus / Regina Cæli","Angélus / Regina Cæli"),L("Prayer of the hour","Prière de l'heure")],
        ["own","pray.rosary",L("Holy Rosary","Saint Rosaire"),L("Traditional mysteries and Scripture","Mystères traditionnels et Écriture")],
        ["own","programme.first_saturday",L("Five First Saturdays","Cinq premiers samedis"),L("Immaculate Heart devotion","Dévotion au Cœur Immaculé")],
        ["own","pray.montfort_consecration",L("Montfort preparation","Préparation de Montfort"),L("33-day consecration preparation","Préparation de 33 jours")],
        ["external","pray.novenas",L("Marian novenas","Neuvaines mariales"),L("Choose the source-defined novena","Choisissez la neuvaine sourcée")],
        ["own","pray.library",L("Marian prayers in the library","Prières mariales dans le livre"),L("Browse canonical prayer texts","Parcourez les textes canoniques")]
      ]
    },
    novenas:{
      title:L("Novenas & Journeys","Neuvaines & parcours"),
      description:L("Source-owned daily, weekly and monthly devotional journeys.","Parcours de dévotion quotidiens, hebdomadaires ou mensuels établis par les sources."),
      assetId:"ao-rich-novenas",
      items:[
        ["external","pray.novenas",L("Novenas","Neuvaines"),L("Nine-day programmes","Parcours de neuf jours")],
        ["own","pray.montfort_consecration",L("Montfort · 33 days","Montfort · 33 jours"),L("Preparation and consecration","Préparation et consécration")],
        ["own","programme.first_friday",L("Nine First Fridays","Neuf premiers vendredis"),L("Sacred Heart devotion","Dévotion au Sacré-Cœur")],
        ["own","programme.first_saturday",L("Five First Saturdays","Cinq premiers samedis"),L("Immaculate Heart devotion","Dévotion au Cœur Immaculé")]
      ]
    },
    ourlord:{
      title:L("Our Lord","Notre-Seigneur"),
      description:L("The Passion, Sacred Heart and prayers addressed to Our Lord.","La Passion, le Sacré-Cœur et les prières adressées à Notre-Seigneur."),
      assetId:"ao-rich-stations",
      items:[
        ["own","pray.stations",L("Stations of the Cross","Chemin de Croix"),L("Fourteen stations","Quatorze stations")],
        ["own","pray.seven_words",L("Seven Last Words","Sept dernières Paroles"),L("Gospel and meditation","Évangile et méditation")],
        ["own","pray.five_wounds",L("Five Wounds","Cinq Plaies"),L("Passionist chaplet","Chapelet passioniste")],
        ["external","pray.sacred_heart",L("Sacred Heart","Sacré-Cœur"),L("Traditional prayers and reparation","Prières traditionnelles et réparation")],
        ["own","programme.first_friday",L("Nine First Fridays","Neuf premiers vendredis"),L("Reparatory devotion","Dévotion réparatrice")]
      ]
    },
    saints:{
      title:L("Saints & Angels","Saints & anges"),
      description:L("Prayers of intercession and devotions to the saints.","Prières d'intercession et dévotions aux saints."),
      assetId:"ao-rich-prayer-library",
      items:[
        ["own","pray.litany_saints",L("Litany of the Saints","Litanies des saints"),L("Call and response","Invocations et répons")],
        ["own","pray.st_joseph_seven_sorrows",L("St Joseph · Sorrows and Joys","Saint Joseph · Douleurs et Joies"),L("Seven paired meditations","Sept méditations en paires")],
        ["external","pray.good_death",L("Good Death prayers","Prières pour une bonne mort"),L("St Joseph and final perseverance","Saint Joseph et persévérance finale")],
        ["own","pray.for_priests",L("Prayers for priests","Prières pour les prêtres"),L("Intercession and vocations","Intercession et vocations")],
        ["own","pray.library",L("Prayer Library","Livre de prières"),L("Find individual saints' prayers","Trouvez les prières aux saints")]
      ]
    },
    intentions:{
      title:L("Life & Intentions","Vie & intentions"),
      description:L("Prayer for personal circumstances, spiritual preparation and particular needs.","Prière pour les circonstances personnelles, la préparation spirituelle et les besoins particuliers."),
      assetId:"ao-rich-confession",
      items:[
        ["own","pray.occasional_intercessions",L("Occasional intercessions","Intercessions occasionnelles"),L("Family, sickness, peace and other needs","Famille, maladie, paix et autres besoins")],
        ["own","pray.confession",L("Confession preparation","Préparation à la confession"),L("Examination and pastoral preparation","Examen et préparation")],
        ["external","pray.good_death",L("Preparation for a Good Death","Préparation à une bonne mort"),L("Traditional prayers","Prières traditionnelles")],
        ["external","pray.dying_companion",L("Dying Companion","Accompagnement du mourant"),L("Bedside prayer and priestly priority","Prière au chevet et priorité au prêtre")],
        ["own","pray.library",L("Prayer Library","Livre de prières"),L("Individual prayers by need","Prières particulières selon les besoins")]
      ]
    }
  };
}
// Preserve all six canonical families through the nine editorial doors.
// Route identities and source-owned readers remain unchanged.
const LEGACY_FAMILY_BRIDGES=Object.freeze({
 intentions:"penance",ourlord:"passion",novenas:"devotions"
});
export function resolvedPrayerPilotFamilies(L,families){
 const aliases=prayerPilotAliases(L);
 for(const [door,canonical] of Object.entries(LEGACY_FAMILY_BRIDGES)){
  const seen=new Set(aliases[door].items.map(item=>item[1]));
  const additions=[];
  for(const item of families?.[canonical]?.items||[]){
   if(seen.has(item[1]))continue;
   seen.add(item[1]);additions.push(item);
  }
  aliases[door]={...aliases[door],items:[...aliases[door].items,...additions]};
 }
 return {...families,...aliases};
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
    (f.items||[]).forEach(item=>{
      const [owner,id,title,description]=item;
      if(!routes.has(owner+":"+id))routes.set(owner+":"+id,{owner,id,title,description});
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
  return head(L("Pray","Prier"),L("Find a prayer or devotion","Trouvez une prière ou une dévotion"))+
    '<main class="aoP435930Body aoPrayPilotHome">'+
      '<div class="aoPrayPilotTop"><h2>'+esc(L("Enter into prayer","Entrer en prière"))+'</h2>'+
      '<label class="aoPrayPilotSearch">'+assetIcon("ao-ui-search","aoPrayPilotSearchIcon")+
      '<input type="search" data-p435930-pilot-search autocomplete="off" aria-label="'+esc(L("Search all prayers and devotions","Rechercher toutes les prières et dévotions"))+'" placeholder="'+esc(L("Search prayers and devotions","Rechercher prières et dévotions"))+'"></label>'+
      '<p class="aoPrayPilotIntro">'+esc(L("Choose a door or search the existing prayer library and readers.","Choisissez une porte ou recherchez les prières et les lecteurs existants."))+'</p></div>'+
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
export function renderPilotAngelusEntry({head,L,esc,form,posture,moduleIcon,recitation='individual'}){
  const regina=form==="regina";
  return head(regina?"Regina Cæli":"Angelus",L("Prayer of the hour","Prière de l'heure"))+
    '<main class="aoP435930Body aoPrayPilotAngelusEntry">'+
      '<section class="aoPrayPilotAngelusHero">'+
        '<div class="aoPrayPilotAngelusSymbol" aria-hidden="true">'+moduleIcon("pray.angelus_regina")+'</div>'+
        '<small>'+esc(L("A pause for prayer","Une pause pour prier"))+'</small>'+
        '<h2>'+(regina?"Regina Cæli":"Angelus")+'</h2>'+
        '<p>'+esc(regina?L("Rejoice, O Queen of Heaven.","Réjouissez-vous, Reine du ciel."):L("The Angel of the Lord declared unto Mary.","L'Ange du Seigneur apporta l'annonce à Marie."))+'</p>'+
        '<div class="aoPrayPilotEntryMeta">'+esc(regina?L("Eastertide · stand according to local custom","Temps pascal · debout selon la coutume locale"):posture)+'</div>'+
      '</section>'+
      '<div class="aoPrayPilotAngelusActions">'+
        '<div class="aoPrayPilotRecitation" role="group" aria-label="'+esc(L("Recitation","Récitation"))+'">'+
          '<button type="button" data-p435930-pilot-angelus-recitation="individual" aria-pressed="'+String(recitation!=='group')+'">'+esc(L("Alone","Seul"))+'</button>'+
          '<button type="button" data-p435930-pilot-angelus-recitation="group" aria-pressed="'+String(recitation==='group')+'">'+esc(L("With others","Avec d’autres"))+'</button>'+
        '</div>'+
        '<button type="button" class="aoPrayPilotBegin" data-p435930-pilot-angelus-begin>'+esc(L("Begin prayer","Commencer la prière"))+'</button>'+
        '<p>'+esc(L("The existing named cards, prayer text, language faces and exact gesture cues are preserved.","Les cartes, textes, langues et gestes existants sont conservés."))+'</p>'+
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
    "#aoPray435930 .aoPrayPilotAngelusEntry{display:flex;flex-direction:column;min-height:0}",
    "#aoPray435930 .aoPrayPilotAngelusHero{flex:1;min-height:300px;display:flex;flex-direction:column;justify-content:flex-end;padding:24px 20px;background:linear-gradient(160deg,#28364b,#121923 68%,#10141b);color:#f3e9dc}",
    "#aoPray435930 .aoPrayPilotAngelusSymbol{display:grid;place-items:center;flex:1;min-height:70px;max-height:170px;color:var(--liturgical,#c9ae76)}",
    "#aoPray435930 .aoPrayPilotAngelusSymbol svg{width:88px;height:88px;max-width:100%}",
    "#aoPray435930 .aoPrayPilotAngelusHero small{font:600 11px/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#dcc398}",
    "#aoPray435930 .aoPrayPilotAngelusHero h2{font:600 40px/1.1 var(--ao-font-display,Georgia,serif);margin:8px 0}",
    "#aoPray435930 .aoPrayPilotAngelusHero p{font:italic 17px/1.5 var(--ao-font-display,Georgia,serif);margin:0}",
    "#aoPray435930 .aoPrayPilotEntryMeta{margin-top:16px;font-size:13px;color:#e1c7a8}",
    "#aoPray435930 .aoPrayPilotAngelusActions{padding:18px 20px 28px}",
    "#aoPray435930 .aoPrayPilotRecitation{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin-bottom:12px;padding:4px;border-radius:999px;background:var(--surface-1,#18202a)}",
    "#aoPray435930 .aoPrayPilotRecitation button{min-width:0;min-height:44px;border:0;border-radius:999px;background:transparent;color:var(--muted,#ccc);font:600 13px/1.3 var(--ao-font-ui,system-ui,sans-serif)}",
    "#aoPray435930 .aoPrayPilotRecitation button[aria-pressed=true]{background:var(--surface-2,#303b46);color:var(--text,#fff);box-shadow:0 1px 4px rgba(0,0,0,.16)}",
    "#aoPray435930 .aoPrayPilotBegin{width:100%;min-height:52px;border:0;border-radius:999px;background:var(--liturgical,#c9ae76);color:#0d1520;font:600 16px/1.2 var(--ao-font-display,Georgia,serif)}",
    "#aoPray435930 .aoPrayPilotAngelusActions p{font:400 12px/1.45 var(--ao-font-display,Georgia,serif);color:var(--muted,#aaa);text-align:center}",
    "@media(max-width:359px){#aoPray435930 .aoPrayPilotMosaic{grid-auto-rows:37px}#aoPray435930 .aoPrayPilotTileCaption{font-size:12px;padding:18px 6px 6px}#aoPray435930 .aoPrayPilotLarge .aoPrayPilotTileCaption{font-size:18px;padding:27px 9px 9px}#aoPray435930 .aoPrayPilotTop h2{font-size:25px}}",
    "@media(prefers-reduced-motion:reduce){#aoPray435930 .aoPrayPilotTile{scroll-behavior:auto}}"
  ].join("\n");
  const style=document.createElement("style");style.id="ao-prayer-design-pilot-css";style.textContent=css;document.head.appendChild(style);
}
installStyles();
