import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { DEFAULT_PREFERENCES } from "./donor-state.js";
import { PREFERENCES_BOOK_CSS } from "./preferences-book-css.js";

export const SETTINGS_PRESENTATION_VERSION="modular-settings-presentation-v4359.6";

export function canonicalSettingsAppVersion(win=globalThis){
  return win?.document?.documentElement?.dataset?.aoRelease||win?.AO_RELEASE_AUTHORITY_V4359?.version||"43.59.6";
}

export function buildSettingsViewModel(win=globalThis,{route="/settings",live=false,updateCheck="idle"}={}){
  const donor=win?.AO_SETTINGS_DONOR_V4359?.snapshot?.()||{preferences:DEFAULT_PREFERENCES,profiles:[]};
  const language=donor.preferences?.general?.uiLanguage==="fr"?"fr":"en";
  const location=win?.location??{};
  const hostname=String(location.hostname||"").toLowerCase();
  const pathname=String(location.pathname||"");
  const githubPages=hostname==="fulcanelli13.github.io"&&(!pathname||pathname==="/ad-orientem"||pathname.startsWith("/ad-orientem/"));
  const vercel=/\.vercel\.app$/i.test(hostname);
  const hostKind=githubPages?"github_pages":vercel?"vercel":"other";
  const origin=typeof location.origin==="string"&&/^https?:\/\//.test(location.origin)
    ?location.origin:hostname?"https://"+hostname:"";
  const appAddress=origin+(pathname|| (githubPages?"/ad-orientem/":"/"));
  const standalone=Boolean(win?.matchMedia?.("(display-mode: standalone)")?.matches||win?.navigator?.standalone===true);
  return Object.freeze({
    route:String(route||"/settings"),
    language,
    live:Boolean(live),
    version:canonicalSettingsAppVersion(win),
    updateCheck,
    offline:win?.AO_OFFLINE_APP_V1?.status||null,
    canonicalHost:githubPages,
    hostKind,appAddress,standalone,
    preferences:donor.preferences||DEFAULT_PREFERENCES,
    profiles:Array.isArray(donor.profiles)?donor.profiles:[]
  });
}

export function settingsCss(rootId="ao-settings-modular-root"){
  return `
:root{--ao-settings-max:var(--ao-content-max,760px)}
html[data-ao-text-scale-v1="small"]{font-size:93.75%}html[data-ao-text-scale-v1="standard"]{font-size:100%}html[data-ao-text-scale-v1="large"]{font-size:112.5%}html[data-ao-text-scale-v1="extra_large"]{font-size:125%}
html[data-ao-motion-v1="reduced"] *,html[data-ao-motion-v1="reduced"] *::before,html[data-ao-motion-v1="reduced"] *::after{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
html[data-ao-contrast-v1="high"]{--border:color-mix(in srgb,var(--text,#f5f2e9) 48%,transparent);--muted:color-mix(in srgb,var(--text,#f5f2e9) 82%,transparent);--muted-2:color-mix(in srgb,var(--text,#f5f2e9) 70%,transparent)}
html[data-ao-sacred-art-v1="subtle"] .aoSacredArt,html[data-ao-sacred-art-v1="subtle"] [data-sacred-art]{opacity:.55}html[data-ao-sacred-art-v1="minimal"] .aoSacredArt,html[data-ao-sacred-art-v1="minimal"] [data-sacred-art]{display:none!important}
html[data-ao-settings-surface="open"] #ao-global-ribbon{z-index:var(--ao-z-global-nav,2147483300)!important;pointer-events:auto!important}
#${rootId}{position:fixed;z-index:var(--ao-z-modal,2147483200);isolation:isolate;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;pointer-events:auto;background:var(--ao-bg-canvas,var(--bg,#0b0f13));color:var(--ao-text-primary,var(--text,#f3efe8));overflow:auto;overscroll-behavior:contain;font-family:var(--ao-font-body,var(--font-body,Georgia,serif));padding-bottom:24px}
#${rootId},#${rootId} *{box-sizing:border-box}#${rootId}[hidden]{display:none!important}
#${rootId} .aoSetTop{position:sticky;top:0;z-index:3;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:8px;padding:calc(9px + env(safe-area-inset-top,0px)) 10px 9px;background:color-mix(in srgb,var(--bg,#0b0f13) 94%,transparent);border-bottom:1px solid var(--border,rgba(255,255,255,.12));backdrop-filter:blur(16px)}
#${rootId} .aoSetInstallAddress{display:block;max-width:100%;overflow-wrap:anywhere;word-break:normal;font:500 12px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-text-secondary,var(--muted,#b2ad9e))}
#${rootId} .aoSetTop button{width:var(--ao-control-h,44px);height:var(--ao-control-h,44px);border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.12)));border-radius:var(--ao-pill-radius,999px);background:var(--ao-surface-1,var(--surface-1,#151a20));color:inherit;display:grid;place-items:center}
#${rootId} .aoSetTopIcon{display:block;width:18px;height:18px;background:currentColor}#${rootId} .aoSetTitle{min-width:0;text-align:center}#${rootId} .aoSetTitle small{display:block;color:var(--liturgical,#c6a66b);font:700 var(--ao-type-ui-xs,11px)/1.1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;text-transform:uppercase}#${rootId} .aoSetTitle strong{display:block;margin-top:3px;font:500 19px/1.18 var(--ao-font-display,var(--font-display,Georgia,serif));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${rootId} .aoSetWrap{width:min(var(--ao-content-max,760px),100%);margin:0 auto;padding:16px var(--ao-page-gutter,14px) 32px}#${rootId} .aoSetIntro{padding:4px 4px 13px;color:var(--muted,#b8c0c7);font-size:.84rem;line-height:1.45}
#${rootId} .aoSetSection{margin:15px 0 22px}#${rootId} .aoSetSection>h2{margin:0 4px 7px;color:var(--liturgical,#c6a66b);font:750 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;text-transform:uppercase}
#${rootId} .aoSetGroup{overflow:hidden;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:var(--ao-card-radius,15px);background:var(--ao-surface-1,var(--surface-1,#141a20))}
#${rootId} .aoSetRow{width:100%;min-width:0;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;padding:12px 13px;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.09));background:transparent;color:inherit;text-align:left}#${rootId} .aoSetRow:last-child{border-bottom:0}#${rootId} .aoSetRow:disabled{opacity:.5}#${rootId} .aoSetRowText{min-width:0}#${rootId} .aoSetRowText b{display:block;font:650 var(--ao-type-ui,14px)/1.3 var(--ao-font-ui,system-ui,sans-serif)}#${rootId} .aoSetRowText small{display:block;margin-top:3px;color:var(--muted,#b3bac0);font-size:var(--ao-type-ui-sm,12px);line-height:1.35}#${rootId} .aoSetRowEnd{color:var(--muted,#b3bac0);font-size:.78rem;white-space:nowrap}
#${rootId} .aoSetSegments{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}#${rootId} .aoSetSegments button{min-height:var(--ao-control-h,44px);padding:6px 10px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:999px;background:var(--surface-2,#10151a);color:var(--muted,#b8c0c7);font:700 var(--ao-type-ui-xs,11px)/1.1 var(--ao-font-ui,system-ui,sans-serif)}#${rootId} .aoSetSegments button.active{border-color:var(--liturgical-border,var(--liturgical,#c6a66b));background:var(--liturgical-soft,rgba(198,166,107,.12));color:var(--text,#f3efe8)}
#${rootId} .aoSetSwitch{width:46px;height:28px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:999px;background:var(--surface-2,#0f1419);padding:2px}#${rootId} .aoSetSwitch i{display:block;width:22px;height:22px;border-radius:50%;background:var(--muted-2,#8f989f);transition:transform .16s ease}#${rootId} .aoSetSwitch.on{background:var(--liturgical-soft,rgba(198,166,107,.16));border-color:var(--liturgical-border,var(--liturgical,#c6a66b))}#${rootId} .aoSetSwitch.on i{transform:translateX(17px);background:var(--liturgical,#c6a66b)}
#${rootId} .aoSetSelect{max-width:48vw;min-height:var(--ao-control-h,44px);border:1px solid var(--border,rgba(255,255,255,.12));border-radius:10px;background:var(--surface-2,#10151a);color:inherit;padding:6px 28px 6px 9px;font:650 var(--ao-type-ui-sm,12px)/1.2 var(--ao-font-ui,system-ui,sans-serif)}
#${rootId} .aoSetNote{margin:10px 4px 0;padding:10px 11px;border-left:2px solid var(--liturgical,#c6a66b);border-radius:0 10px 10px 0;background:var(--liturgical-soft,rgba(198,166,107,.08));color:var(--muted,#b8c0c7);font-size:var(--ao-type-ui-sm,12px);line-height:1.42}#${rootId} .aoSetNote strong{color:var(--text,#f3efe8)}
#${rootId} .aoSetDanger{color:#f0b8ae!important}#${rootId} .aoSetProfileName{width:100%;min-height:var(--ao-control-h,44px);border:1px solid var(--border,rgba(255,255,255,.12));border-radius:var(--ao-control-radius,11px);background:var(--ao-surface-2,var(--surface-2,#10151a));color:inherit;padding:9px 10px;font:600 var(--ao-type-ui,14px)/1.2 var(--ao-font-ui,system-ui,sans-serif)}
#${rootId} .aoSetRow:disabled{opacity:.55;cursor:not-allowed}#${rootId} .aoSetBadge{display:inline-block;padding:3px 7px;border:1px solid var(--border,rgba(255,255,255,.1));border-radius:999px;color:var(--muted,#b8c0c7);font-size:var(--ao-type-ui-xs,11px)}#${rootId} .aoSetBadge.active{border-color:var(--liturgical-border,var(--liturgical,#c6a66b));color:var(--liturgical,#c6a66b)}
#${rootId} .aoSetEmpty{padding:18px 13px;color:var(--muted,#b8c0c7);font-size:var(--ao-type-ui-sm,12px);line-height:1.45}#${rootId} .aoSetAction{min-height:var(--ao-control-h,44px);padding:9px 12px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:var(--ao-control-radius,11px);background:var(--ao-surface-2,var(--surface-2,#10151a));color:inherit;font:700 var(--ao-type-ui-sm,12px)/1.1 var(--ao-font-ui,system-ui,sans-serif)}
#${rootId} .aoSetInlineIcon{display:inline-block;width:1em;height:1em;background:currentColor;vertical-align:-.12em}
#${rootId} .aoSetSource{padding:12px 13px;border-bottom:1px solid var(--border,rgba(255,255,255,.09))}#${rootId} .aoSetSource:last-child{border-bottom:0}#${rootId} .aoSetSource summary{cursor:pointer;min-height:var(--ao-control-h,44px);display:flex;align-items:center;font:650 var(--ao-type-ui-sm,12px)/1.25 var(--ao-font-ui,system-ui,sans-serif)}#${rootId} .aoSetSource p{margin:8px 0 0;color:var(--muted,#b3bac0);font-size:var(--ao-type-ui-sm,12px);line-height:1.45}#${rootId} .aoSetSourceKey{padding:10px 13px;border-bottom:1px solid var(--border,rgba(255,255,255,.09));color:var(--muted,#b3bac0);font-size:var(--ao-type-ui-sm,12px)}#${rootId} .aoSetSourceKey:last-child{border-bottom:0}
@media(max-width:430px){#${rootId} .aoSetWrap{padding-left:var(--ao-page-gutter-phone,12px);padding-right:var(--ao-page-gutter-phone,12px)}#${rootId} .aoSetRow{padding:11px}#${rootId} .aoSetSegments{max-width:54vw}#${rootId} .aoSetSelect{max-width:52vw}#${rootId} .aoSetRowText b{font-size:.86rem}}
@media(max-width:350px){#${rootId} .aoSetWrap{padding-left:7px;padding-right:7px}#${rootId} .aoSetRow{grid-template-columns:minmax(0,1fr);gap:8px}#${rootId} .aoSetSegments{max-width:none;justify-content:flex-start}#${rootId} .aoSetSelect{max-width:100%;width:100%}#${rootId} .aoSetSwitch{justify-self:start}}
`+PREFERENCES_BOOK_CSS;
}

export function renderSettingsToString(win=globalThis,{route="/settings",live=false,updateCheck="idle",familyOpen=1,resetAsk=false}={}){
  const vm=buildSettingsViewModel(win,{route,live,updateCheck}),p=vm.preferences,profiles=vm.profiles,fr=vm.language==="fr";
  const L=(en,frText)=>fr?(frText||en):en;
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const icon=(id,cls="aoSetInlineIcon")=>{const u=resolveCanonicalAssetUrl(id);return u?`<span class="${cls}" aria-hidden="true" data-ao-asset-id="${id}" style="-webkit-mask:url('${esc(u)}') center/contain no-repeat;mask:url('${esc(u)}') center/contain no-repeat"></span>`:"";};
  const path=(obj,key)=>String(key).split(".").reduce((v,k)=>v?.[k],obj);
  const SECTIONS=[
    ["I","Reading","Lecture","Appearance, text, contrast and paintings","Apparence, texte, contraste et peintures","/settings/accessibility"],
    ["II","Languages","Langues","App, translation and Latin","Application, traductions et latin","/settings/language-reading"],
    ["III","Holy Mass","Sainte Messe","Defaults for every new Mass","Choix pour chaque nouvelle Messe","/settings/mass"],
    ["IV","My churches","Mes églises","Customs of the churches you attend","Usages des églises que vous fréquentez","/settings/local-customs"],
    ["V","Prayer","Prière","Nine traditional prayer families","Neuf familles de prières","/settings/prayer"],
    ["VI","On this device","Sur cet appareil","Screen, vibration, resume, reminders","Écran, vibrations, reprise, rappels","/settings/general"],
    ["VII","Your data","Vos données","What is kept, and clearing it","Données conservées et suppression","/settings/privacy-data"],
    ["VIII","About & sources","À propos et sources","Version, editions, art and licences","Version, éditions, art et licences","/settings/about-sources"]
  ];
  const sectionIndex=SECTIONS.findIndex(s=>s[5]===vm.route),current=SECTIONS[sectionIndex];
  const header=(title,landing=false)=>'<header class="aoSetTop">'+
    (landing?'<span class="aoPrefHeadStub" aria-hidden="true"></span>':
      '<button type="button" data-settings-back aria-label="'+esc(L("Back","Retour"))+'">‹</button>')+
    '<div class="aoSetTitle"><strong>'+esc(L("Preferences","Préférences"))+'</strong></div>'+
    '<button type="button" data-settings-close aria-label="'+esc(L("Close","Fermer"))+'">×</button></header>';
  const section=(title,body)=>'<section class="aoSetSection"><h2>'+esc(title)+'</h2><div class="aoSetGroup">'+body+'</div></section>';
  const row=(title,sub,end="",attrs="")=>'<button type="button" class="aoSetRow" '+attrs+'><span class="aoSetRowText"><b>'+esc(title)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':"")+'</span><span class="aoSetRowEnd">'+end+'</span></button>';
  const routeRow=(title,sub,r)=>row(title,sub,'<span aria-hidden="true">☞</span>','data-settings-route="'+esc(r)+'"');
  const infoRow=(title,sub,end="")=>'<div class="aoSetRow aoSetInfoRow" data-settings-info><span class="aoSetRowText"><b>'+esc(title)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':"")+'</span><span class="aoSetRowEnd">'+end+'</span></div>';
  const seg=(label,key,items)=>{const active=path(p,key);return '<div class="aoSetRow aoPrefChoice"><span class="aoSetRowText"><b>'+esc(label)+'</b></span><span class="aoSetSegments" role="group" aria-label="'+esc(label)+'">'+items.map(([v,en,frt])=>
    '<button type="button" data-pref-path="'+esc(key)+'" data-pref-value="'+esc(v)+'" class="'+(active===v?'active':'')+'" aria-pressed="'+(active===v)+'">'+esc(L(en,frt))+'</button>').join("")+'</span></div>';};
  const toggle=(title,sub,key)=>'<div class="aoSetRow aoPrefChoice"><span class="aoSetRowText"><b>'+esc(title)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':"")+'</span><span class="aoSetSegments" role="group" aria-label="'+esc(title)+'">'+[[true,L("On","Oui")],[false,L("Off","Non")]].map(([v,label])=>
    '<button type="button" data-pref-path="'+esc(key)+'" data-pref-value="'+v+'" class="'+(path(p,key)===v?'active':'')+'" aria-pressed="'+(path(p,key)===v)+'">'+esc(label)+'</button>').join("")+'</span></div>';
  // A native select is never used on the Preferences surface; even long choices
  // remain ordinary words underlined in the verified liturgical colour.
  const select=(title,sub,key,items)=>'<div class="aoPrefSelectGroup">'+seg(title,key,items)+(sub?'<p class="aoSetNote">'+esc(sub)+'</p>':"")+'</div>';
  const note=text=>'<div class="aoSetNote">'+text+'</div>';
  const shell=(title,body,landing=false)=>{
    const next=sectionIndex>=0&&sectionIndex<7?SECTIONS[sectionIndex+1]:null;
    const chapter=current?'<div class="aoPrefChapter"><span class="n">'+current[0]+'</span><h2>'+esc(L(current[1],current[2]))+'</h2></div>':"";
    const ribbon='<button class="aoPrefRibbon" type="button" data-settings-contents aria-expanded="false" aria-label="'+esc(L("Contents","Sommaire"))+'"></button>';
    const menu='<nav class="aoPrefDrop" data-settings-toc hidden aria-label="'+esc(L("Contents","Sommaire"))+'">'+SECTIONS.map(t=>'<button type="button" data-settings-book-route="'+t[5]+'" class="'+(t===current?'current':'')+'"><span class="n">'+t[0]+'</span>'+esc(L(t[1],t[2]))+'</button>').join("")+'</nav>';
    const foot='<footer class="aoPrefFoot"><span>'+esc(current?current[0]+" · "+L(current[1],current[2]):L("Contents","Sommaire"))+'</span>'+
      (next?'<button type="button" data-settings-route="'+next[5]+'">'+esc(L("Next","Suite"))+' <b>'+next[0]+' ›</b></button>':'<span>✠</span>')+'</footer>';
    return '<div class="aoPrefBook" data-ao-preferences-book="r1">'+header(title,landing)+ribbon+menu+
      '<main class="aoSetWrap">'+chapter+body+'</main>'+foot+'<style>'+settingsCss("ao-settings-modular-root")+'</style></div>';
  };

  if(vm.route==="/settings"||vm.route==="main"){
    return shell(L("Preferences","Préférences"),
      '<div class="aoPrefCover"><h1>'+esc(L("Preferences","Préférences"))+'</h1><p class="aoSetIntro">'+
      esc(L("These are your defaults. Inside a prayer, Aa changes them for that sitting only.","Voici vos choix habituels. Dans chaque prière, Aa les modifie seulement pour cette séance."))+'</p></div>'+
      '<nav class="aoPrefContents" aria-label="'+esc(L("Contents","Sommaire"))+'">'+SECTIONS.map(t=>'<button type="button" data-settings-route="'+t[5]+'"><span class="n">'+t[0]+'</span><span class="t">'+esc(L(t[1],t[2]))+'<small>'+esc(L(t[3],t[4]))+'</small></span><span class="f" aria-hidden="true">›</span></button>').join("")+'</nav>',true);
  }
  if(vm.route==="/settings/general"){
    return shell(L("General","Général"),
      section(L("APP","APPLICATION"),
        toggle(L("Vibration feedback","Retour par vibration"),L("Vibrate gently when you tap certain controls.","Vibration légère lors de certaines actions."),"general.hapticsEnabled")+
        toggle(L("Keep screen on","Garder l’écran allumé"),L("Stops the screen from dimming while following Mass or guided prayer.","Empêche la mise en veille pendant la Messe ou une prière guidée."),"general.keepAwakeDuringGuidedUse")+
        toggle(L("Remember where I stopped","Mémoriser où je me suis arrêté"),L("Offer to continue an unfinished Mass or prayer.","Proposer de reprendre une Messe ou une prière inachevée."),"general.offerResume")));
  }
  if(vm.route==="/settings/accessibility"){
    const opts=p.accessibility;
    const fs={system:"19px",small:"17px",standard:"19px",large:"21.5px",extra_large:"24px"}[opts.textScale]||"19px";
    const specimen='<div class="aoPrefSpecimen'+(p.appearance.sacredArt==="subtle"?' quiet':p.appearance.sacredArt==="minimal"?' none':'')+
      (opts.contrast==="high"?' strong':'')+'" style="--ao-pref-spec-size:'+fs+'"><div class="aoPrefSpecimenInner">'+
      '<div class="aoPrefSpecimenPlate" aria-hidden="true"></div><div class="aoPrefSpecimenText"><span class="past">'+esc(L("Behold the handmaid of the Lord.","Voici la servante du Seigneur."))+'</span><div><i>℣</i> '+esc(L("And the Word was made flesh.","Et le Verbe s’est fait chair."))+'</div><div><i>℟</i> '+esc(L("And dwelt among us.","Et il a habité parmi nous."))+'</div></div></div><div class="aoPrefSpecimenCaption"><span>'+esc(L("Specimen","Exemple"))+'</span><i>'+esc(L("Follows your choices","Suit vos préférences"))+'</i></div></div>';
    return shell(L("Reading","Lecture"),specimen+
      select(L("Appearance","Apparence"),"","appearance.mode",[["auto","As the device","Selon l’appareil"],["dark","Night","Nuit"],["light","Vellum","Vélin"]])+
      select(L("Size of text","Taille du texte"),"","accessibility.textScale",[["system","As the device","Selon l’appareil"],["small","Small","Petite"],["standard","Usual","Normale"],["large","Large","Grande"],["extra_large","Largest","Très grande"]])+
      select(L("Contrast","Contraste"),L("Stronger keeps prayed lines darker as well","Le contraste renforcé conserve une meilleure lisibilité des lignes précédentes"),"accessibility.contrast",[["system","As the device","Selon l’appareil"],["standard","Usual","Normal"],["high","Stronger","Renforcé"]])+
      select(L("Paintings","Peintures"),L("One setting for the whole app: Mass, prayer and Home","Un seul choix pour toute l’application : Messe, prière et accueil"),"appearance.sacredArt",[["full","Full","Complètes"],["subtle","Quiet","Discrètes"],["minimal","None","Aucune"]])+
      select(L("Movement","Mouvement"),"","accessibility.motion",[["system","As the device","Selon l’appareil"],["standard","Usual","Normal"],["reduced","Less","Réduit"]]));
  }
  if(vm.route==="/settings/language-reading"){
    return shell(L("Languages","Langues"),
      seg(L("Language of the app","Langue de l’application"),"general.uiLanguage",[["en","English","Anglais"],["fr","Français","Français"]])+
      seg(L("Translation beside the Latin","Traduction à côté du latin"),"reading.vernacularFollowsUiLanguage",[[true,"Same as the app","Comme l’application"],[false,"Choose language","Choisir la langue"]])+
      (p.reading.vernacularFollowsUiLanguage?"":seg(L("Translation language","Langue de traduction"),"reading.vernacular",[["en","English","Anglais"],["fr","Français","Français"]]))+
      seg(L("Latin","Latin"),"reading.latinDisplay",[["with","With the translation","Avec la traduction"],["only","Latin only","Latin seulement"],["off","Translation only","Traduction seulement"]])+
      note(esc(L("These are saved language preferences. Prayer and Mass readers retain their own source-faithful language options in Aa and Your Mass.","Il s’agit des préférences linguistiques enregistrées. Les lecteurs de prière et de Messe conservent leurs options propres dans Aa et Votre Messe."))));
  }
  if(vm.route==="/settings/mass"){
    const church=p.mass.defaultProfileId?profiles.find(x=>x.id===p.mass.defaultProfileId)?.name:L("Standard 1962 practice","Pratique standard de 1962");
    const today=p.mass.todayChoices;
    const label=(value,mapping)=>mapping[value]||value;
    const remembered=today?section(L("REMEMBERED TODAY CHOICES","CHOIX MÉMORISÉS POUR LA MESSE"),
      infoRow(L("Defaults saved from Today","Choix enregistrés depuis Aujourd’hui"),
        [
          label(today.form,{LOW:L("Low","Basse"),MISSA_CANTATA_SIMPLE:L("Sung without incense","Chantée sans encens"),
            MISSA_CANTATA_INCENSE:L("Sung with incense","Chantée avec encens"),SOLEMN:L("Solemn","Solennelle")}),
          today.readerMode==="MISSAL"?L("Missal","Missel"):"LIVE",
          today.readerLanguage?.toUpperCase(),
          label(today.beforeMass,{none:L("No preparation","Sans préparation"),prepare:L("Brief preparation","Préparation brève"),full:L("Full preparation","Préparation complète")}),
          label(today.afterMass,{none:L("No thanksgiving","Sans action de grâces"),thanksgiving:L("Brief thanksgiving","Action de grâces brève"),full:L("Full thanksgiving","Action de grâces complète")}),
        ].join(" · "))+
      row(L("Forget remembered choices","Effacer les choix mémorisés"),
        L("Restore the ordinary Mass defaults above","Rétablir les préférences habituelles ci-dessus"),
        "",'data-pref-clear-today=""')):"";
    return shell(L("Holy Mass","Sainte Messe"),
      section(L("MASS","MESSE"),
        seg(L("How I usually follow Mass","Ma façon habituelle de suivre la Messe"),"mass.defaultExperience",[["simple","Simple","Simple"],["missal","Missal","Missel"],["live","LIVE","LIVE"]])+
        seg(L("Ceremony","Cérémonie"),"mass.defaultForm",[["low","Low","Basse"],["sung","Sung","Chantée"],["sung_incense","Sung with incense","Chantée avec encens"],["solemn","Solemn","Solennelle"]])+
        seg(L("Participation during Mass","Participation pendant la Messe"),"mass.responseEmphasis",[["quiet","Mostly quiet","Plutôt silencieux"],["responses","Join responses","Participer aux réponses"]])+
        toggle(L("Remember my place in Mass","Mémoriser ma place dans la Messe"),"","mass.resumeEnabled")+
        toggle(L("Offer thanksgiving after Mass","Proposer l’action de grâces après la Messe"),"","mass.offerThanksgivingAfterMass")+
        routeRow(L("Usual church","Église habituelle"),church,"/settings/local-customs")+
        seg(L("Preparation before Mass","Préparation avant la Messe"),"mass.preparationDepth",[["none","None","Aucune"],["standard","Brief","Brève"],["full","Full","Complète"]])+
        seg(L("Thanksgiving after Mass","Action de grâces après la Messe"),"mass.thanksgivingDepth",[["none","None","Aucune"],["standard","Brief","Brève"],["full","Full","Complète"]]))+
      remembered+
      note(`<strong>${esc(L("Future sessions only","Pour les sessions futures seulement"))}</strong><br>${esc(L("These are the same choices as Your Mass. They apply from the next Mass and will not change a Mass already in progress.","Ce sont les mêmes choix que Votre Messe. Ils s’appliquent à la prochaine Messe sans modifier celle qui est en cours."))}`));
  }
  if(vm.route==="/settings/prayer"){
    const fam=[
      ["I",L("Hours","Heures"),"Angelus · morning · evening",
        seg(L("Angelus or Regina Cæli","Angélus ou Regina Cæli"),"prayer.angelus.seasonalForm",[["auto","By the season","Selon le temps"],["angelus","Angelus","Angélus"],["regina_caeli","Regina Cæli","Regina Cæli"]])+
        toggle(L("Concluding prayers","Prières finales"),"","prayer.angelus.traditionalConclusion")],
      ["II",L("Beads","Chapelets"),L("Rosary and chaplets","Rosaire et chapelets"),
        toggle(L("A verse before each Ave","Un verset avant chaque Ave"),"","prayer.rosary.verseBeforeAve")+
        toggle(L("Scripture before each mystery","Écriture avant chaque mystère"),"","prayer.rosary.scriptureCues")+
        toggle(L("Fatima prayer","Prière de Fatima"),"","prayer.rosary.fatimaPrayer")+
        toggle(L("Commentary","Commentaire"),"","prayer.rosary.commentary")],
      ["III",L("Ways","Chemins"),L("Stations · Seven Last Words","Chemin de Croix · Sept Paroles"),
        seg(L("Stations reading","Lecture du Chemin de Croix"),"prayer.stations.mode",[["guided","Guided","Guidée"],["simple","Simple","Simple"]])+
        toggle("Stabat Mater",L("Between stations","Entre les stations"),"prayer.stations.stabatMater")],
      ["IV",L("Novenas","Neuvaines"),L("Novenas and programmes","Neuvaines et programmes"),
        seg(L("Show each day as","Présenter chaque jour en"),"prayer.novenas.layout",[["stages","Stages","Étapes"],["page","One page","Une page"]])],
      ["V",L("Litanies","Litanies"),L("Litanies and psalms","Litanies et psaumes"),
        seg(L("The response","La réponse"),"prayer.litanies.responsePlacement",[["bar","In the choir bar","Dans le chœur"],["inline","After each line","Après chaque ligne"]])],
      ["VI",L("Eucharistic","Eucharistie"),L("Visits and adoration","Visites et adoration"),
        seg(L("Silent time offered","Temps de silence proposé"),"prayer.eucharistic.silentMinutes",[["5","5 min","5 min"],["10","10 min","10 min"],["15","15 min","15 min"],["30","30 min","30 min"]])],
      ["VII",L("Rites","Rites"),L("Benediction · Confession","Bénédiction · Confession"),
        seg(L("Rite text","Texte du rite"),"prayer.rites.textLanguage",[["both","Latin with translation","Latin et traduction"],["en","Translation only","Traduction uniquement"]])],
      ["VIII",L("The dead","Défunts"),L("Memento and intercessions","Memento et intercessions"),
        routeRow(L("Your names","Vos intentions"),L("Manage saved names under Your data","Gérer les noms enregistrés dans Vos données"),"/settings/privacy-data")],
      ["IX",L("Essentials","Essentiels"),L("The holy cards","Les cartes de prière"),
        seg(L("Plates on the cards","Peintures sur les cartes"),"prayer.essentials.artRotation",[["daily","Change daily","Changer chaque jour"],["fixed","Keep one","Garder la même"]])]
    ];
    return shell(L("Prayer","Prière"),
      note(esc(L("All nine prayer families appear here. Options not yet connected to a particular prayer reader are saved without changing its sourced text.","Les neuf familles de prières sont réunies ici. Les choix pas encore reliés à un lecteur sont enregistrés sans modifier ses textes de source.")))+
      fam.map(([n,t,desc,body],i)=>'<div class="aoPrefFamily"><button type="button" data-pref-family="'+i+'" aria-expanded="'+(i===familyOpen)+'"><span class="n">'+n+'</span><span class="t">'+esc(t)+'<small>'+esc(desc)+'</small></span><span aria-hidden="true">'+(i===familyOpen?"⌄":"›")+'</span></button>'+
        (i===familyOpen?'<div class="aoPrefFamilyBody">'+body+'</div>':"")+'</div>').join(""));
  }
  if(vm.route==="/settings/local-customs"){
    return shell(L("Local Church & Customs","Église locale & usages"),
      `<div class="aoSetIntro">${esc(L("Save practices that are customary at a particular church. This helps the app guide you there; it does not change the 1962 Mass itself.","Enregistrez les usages habituels d’une église. Cela aide l’application à vous guider sur place ; cela ne change pas la Messe de 1962 elle-même."))}</div>`+
      section(L("BASELINE","RÉFÉRENCE"),
        row(L("Standard 1962 practice","Pratique standard de 1962"),L("No local profile","Aucun profil local"),p.mass.defaultProfileId===null?`<span class="aoSetBadge active">${esc(L("Default","Par défaut"))}</span>`:"",`data-profile-default=""`))+
      section(L("SAVED CHURCHES","ÉGLISES ENREGISTRÉES"),
        (profiles.length?profiles.map(pr=>routeRow(pr.name,pr.customs?.postureGuidance==="local_community"?L("Local community guidance","Guide de la communauté locale"):L("Saved local practices","Usages locaux enregistrés"),`/settings/local-customs/${encodeURIComponent(pr.id)}`)).join(""):`<div class="aoSetEmpty">${esc(L("No custom profiles yet.","Aucun profil personnalisé."))}</div>`)+
        `<div class="aoSetRow"><span class="aoSetRowText"><b>${esc(L("Add a church","Ajouter une église"))}</b></span><button type="button" class="aoSetAction" data-profile-add>${esc(L("Add","Ajouter"))}</button></div>`));
  }
  if(vm.route.startsWith("/settings/local-customs/")){
    const id=decodeURIComponent(vm.route.split("/").pop()),pr=profiles.find(x=>x.id===id);
    if(!pr)return shell(L("Local Church & Customs","Église locale & usages"),`<div class="aoSetEmpty">${esc(L("Profile not found.","Profil introuvable."))}</div>`);
    const customSelect=(title,key,items)=>{const active=pr.customs?.[key];return `<label class="aoSetRow"><span class="aoSetRowText"><b>${esc(title)}</b></span><select class="aoSetSelect" data-profile-id="${esc(id)}" data-profile-key="${esc(key)}">${items.map(([v,en,frt])=>`<option value="${esc(v)}"${active===v?" selected":""}>${esc(L(en,frt))}</option>`).join("")}</select></label>`;};
    const unspecified=[["unspecified","Not specified","Non précisé"]];
    return shell(pr.name,
      section(L("CHURCH","ÉGLISE"),`<label class="aoSetRow"><span class="aoSetRowText"><b>${esc(L("Church name","Nom de l’église"))}</b></span><input class="aoSetProfileName" data-profile-name="${esc(id)}" value="${esc(pr.name)}"></label>`+
        toggle(L("Use as my usual church","Utiliser comme mon église habituelle"),"","__profile_default__").replace('data-pref-toggle="__profile_default__"',`data-profile-use-default="${esc(id)}"`).replace(`aria-pressed="false"`,`aria-pressed="${p.mass.defaultProfileId===id}"`).replace("aoSetSwitch ","aoSetSwitch "+(p.mass.defaultProfileId===id?"on ":"")))+
      section(L("LOCAL CUSTOMS","USAGES LOCAUX"),
        customSelect(L("Holy Communion","Sainte Communion"),"communionPractice",[...unspecified,["usually_offered","Usually distributed","Habituellement distribuée"],["usually_not_offered","Usually not distributed","Habituellement non distribuée"]])+
        customSelect(L("Incense at Sung Mass","Encens à la Messe chantée"),"incensePractice",[...unspecified,["usually_used","Usually used","Habituellement utilisé"],["usually_not_used","Usually not used","Habituellement non utilisé"]])+
        customSelect(L("Asperges before Sunday Mass","Asperges avant la Messe du dimanche"),"aspergesPractice",[...unspecified,["usually_included","Usually included","Habituellement inclus"],["usually_not_included","Usually not included","Habituellement omis"]])+
        customSelect("Second Confiteor","secondConfiteor",[["baseline","Use standard 1962 practice","Suivre la pratique standard de 1962"],["retained_locally","Usually retained here","Habituellement conservé ici"]])+
        customSelect(L("If used, do the faithful join the Second Confiteor?","S’il est utilisé, les fidèles récitent-ils le second Confiteor ?"),"secondConfiteorParticipation",[...unspecified,["usually_joined","The faithful usually join","Les fidèles le récitent habituellement"],["usually_not_joined","The faithful usually do not join","Les fidèles ne le récitent habituellement pas"]])+
        customSelect(L("Who reads the Epistle?","Qui lit l’Épître ?"),"epistleMinister",[...unspecified,["celebrant","Priest","Prêtre"],["lector","Lector","Lecteur"]])+
        customSelect(L("Sit during longer chants between the readings","S’asseoir pendant les longs chants entre les lectures"),"longInterlectionSeating",[...unspecified,["usually_used","Usually","Habituellement"],["usually_not_used","Usually not","Habituellement non"]])+
        customSelect(L("When is the Benedictus sung?","Quand chante-t-on le Benedictus ?"),"sanctusHandling",[...unspecified,["gregorian_continuous","With the Sanctus","Avec le Sanctus"],["deferred_benedictus","After the Consecration","Après la Consécration"]])+
        customSelect(L("Marian antiphon after Mass","Antienne mariale après la Messe"),"marianAntiphon",[["none","None","Aucune"],["salve_regina","Salve Regina","Salve Regina"]]))+
      note(esc(L("Detailed event-level posture editing remains gated; saved local practice never changes Mass text, priest rubrics or liturgical law.","L’édition détaillée des postures reste limitée ; les usages locaux enregistrés ne changent jamais le texte de la Messe, les rubriques du prêtre ni la loi liturgique.")))+
      section(L("DATA","DONNÉES"),row(L("Delete profile","Supprimer le profil"),"",icon("ao-ui-close"),`class="aoSetDanger" data-profile-delete="${esc(id)}"`)));
  }
  if(vm.route==="/settings/privacy-data"){
    const dataRow=(en,french,act,disabled=false)=>row(L(en,french),"",'<span aria-hidden="true">☞</span>','data-data-action="'+act+'"'+(disabled?" disabled":""));
    const group=(title,body)=>'<div class="aoPrefDataGroup"><h3>'+esc(title)+'</h3>'+body+'</div>';
    return shell(L("Your data","Vos données"),
      note(esc(L("These controls clear saved information on this device. Each action has its own confirmation.","Ces contrôles effacent les informations conservées sur cet appareil. Chaque action demande confirmation.")))+
      group(L("Progress","Progression"),
        dataRow("An unfinished Mass","Une Messe inachevée","clear-mass",vm.live)+
        dataRow("Prayer sessions","Sessions de prière","clear-prayer")+
        dataRow("Learning progress","Progression de formation","clear-progress")+
        dataRow("Bookmarks","Signets","clear-bookmarks"))+
      group(L("Your lists","Vos listes"),
        dataRow("Saved churches","Églises enregistrées","reset-profiles"))+
      group(L("Storage","Stockage"),
        dataRow("Temporary downloaded files","Fichiers temporaires téléchargés","clear-cache"))+
      '<div class="aoPrefReset">'+(resetAsk?
        '<p>'+esc(L("This cannot be undone. Your saved preferences, church profiles and supported session data will be cleared.","Cette opération est irréversible. Vos préférences, églises et données de séance prises en charge seront effacées."))+'</p>'+
        '<button type="button" data-settings-reset-confirm'+(vm.live?' disabled':'')+'>'+esc(L("Yes, begin again","Oui, tout recommencer"))+' ☞</button>'+
        '<button type="button" data-settings-reset-cancel>'+esc(L("Keep everything","Tout conserver"))+' ☞</button>':
        '<p>'+esc(L("Begin again: return preferences, lists and saved progress to their initial state.","Tout recommencer : rétablir les préférences, les listes et la progression à leur état initial."))+'</p>'+
        '<button type="button" data-settings-reset-ask'+(vm.live?' disabled':'')+'>'+esc(L("Begin again…","Tout recommencer…"))+' ☞</button>')+'</div>'+
      note(esc(L("An examination of conscience is never stored as a persistent list of sins.","Un examen de conscience n’est jamais enregistré comme une liste permanente de péchés."))));
  }
  if(vm.route==="/settings/about-sources"||vm.route==="about-sources"){
    const sourceFamilies=fr?[
      ["Livres liturgiques et base 1962","Missel romain de 1962, Rubriques générales de 1960 et sources normatives applicables."],
      ["Calendrier et Propre","L’autorité liturgique est distinguée du fournisseur numérique des données."],
      ["Écriture","Les éditions et la provenance sont indiquées par langue dans le lecteur biblique."],
      ["Commentaire","Les commentaires patristiques ou traditionnels restent attribués à leurs auteurs et éditions."],
      ["Doctrine et catéchisme","Les textes doctrinaux gardent leur corpus et leur niveau d’autorité propres."],
      ["Prières et méthodes dévotionnelles","Les témoins historiques et manuels traditionnels ne sont pas présentés comme loi liturgique."],
      ["Autorités des programmes","Premier vendredi et premier samedi distinguent l’autorité du programme des sources de leurs composants."],
      ["Art sacré","Artiste, œuvre, collection et droits sont conservés lorsqu’ils sont connus."]
    ]:[
      ["Liturgical books & 1962 basis","The 1962 Roman Missal, 1960 General Rubrics and applicable normative sources control liturgical claims."],
      ["Calendar & Proper data","Liturgical authority is kept distinct from the digital provider supplying data."],
      ["Scripture","Edition and provenance are identified by language in the Scripture reader."],
      ["Commentary","Patristic and traditional commentary remains attributed to its author and edition."],
      ["Doctrine & Catechism","Doctrinal texts retain their own corpus and authority level."],
      ["Prayer & devotional methods","Historical witnesses and traditional manuals are not presented as liturgical law."],
      ["Programme authorities","First Friday and First Saturday keep programme authority distinct from component sources."],
      ["Sacred art","Artist, work, collection and rights are retained where known."]
    ];
    const provenance=fr?
      ["Source officielle / normative","Source liturgique de 1962","Témoin historique","Méthode dévotionnelle traditionnelle","Guide éditorial Ad Orientem","Traduction / adaptation"]:
      ["Official / governing source","1962 liturgical source","Historical witness","Traditional devotional source","Ad Orientem editorial guidance","Translation / adaptation"];
    const sourceDetails=sourceFamilies.map(([title,body])=>`<details class="aoSetSource"><summary>${esc(title)}</summary><p>${esc(body)}</p></details>`).join("");
    const provenanceSummary=provenance.join(" · ");
    const methodology=`<details class="aoSetSource"><summary>${esc(L("How source labels work","Fonctionnement des mentions de source"))}</summary><p>${esc(provenanceSummary)}</p></details>`;
    const offline=vm.offline;
    const snapshotId=offline?.ready&&offline?.version?String(offline.version).slice(0,12):"";
    const candidateId=offline?.pendingVersion&&offline.pendingVersion!==offline.version?String(offline.pendingVersion).slice(0,12):"";
    const canCheck=Boolean(offline?.supported&&offline?.registered);
    const offlineLabel=candidateId
      ?L("New offline copy ready to apply","Nouvelle copie hors ligne prête à être appliquée")
      :snapshotId?L("Saved offline copy","Copie hors ligne enregistrée")
      :offline?.supported?L("No active offline copy yet","Pas encore de copie hors ligne active")
      :L("Offline version tracking unavailable here","Suivi des versions hors ligne indisponible ici");
    const checkLabel=vm.updateCheck==="checking"
      ?L("Checking for updates…","Recherche de mises à jour…")
      :candidateId?L("New copy staged; installation requires a separate tap","Nouvelle copie prête ; installation sur demande")
      :vm.updateCheck==="current"?L("No new offline copy detected","Aucune nouvelle copie hors ligne détectée")
      :vm.updateCheck==="error"?L("Update check failed; saved copy retained","Échec du contrôle ; copie conservée")
      :L("Check for a newer saved copy","Rechercher une nouvelle copie");
    const canApply=Boolean(candidateId&&canCheck&&!vm.live&&vm.updateCheck!=="applying");
    const applyLabel=vm.live
      ?L("Finish Mass before installing; saved copy retained","Terminez la Messe avant installation ; copie conservée")
      :vm.updateCheck==="applying"?L("Applying update…","Installation de la mise à jour…")
      :vm.updateCheck==="applyError"?L("Update could not be installed; retry without deleting data","Installation impossible ; réessayez sans effacer les données")
      :L("Install the ready copy and reload the app","Installer la copie prête et recharger l’application");
    const canonicalUrl="https://fulcanelli13.github.io/ad-orientem/";
    const snapshotLabel=snapshotId
      ?'<span class="aoSetBadge" data-settings-snapshot-id="'+esc(snapshotId)+'">'+esc(snapshotId)+'</span>'
      :'<span class="aoSetBadge" data-settings-snapshot-empty>—</span>';
    const hostName=vm.hostKind==="github_pages"
      ?L("GitHub Pages · install address","GitHub Pages · adresse d’installation")
      :vm.hostKind==="vercel"
        ?L("Vercel · separate network site","Vercel · site en ligne distinct")
        :L("Other app address · source unverified","Autre adresse · source non vérifiée");
    const launchName=vm.standalone
      ?L("Launched from Home Screen","Lancée depuis l’écran d’accueil")
      :L("Opened in browser","Ouverte dans le navigateur");
    const addressMarkup='<span class="aoSetInstallAddress" data-settings-active-site="'+
      esc(vm.hostKind)+'">'+esc(vm.appAddress||L("Unknown address","Adresse inconnue"))+'</span>';
    const updateButtons=(vm.hostKind==="github_pages"||offline?.supported)
      ?row(L("Check for updates","Vérifier les mises à jour"),checkLabel,
        icon("ao-ui-next"),'data-settings-check-update'+(canCheck&&vm.updateCheck!=="checking"&&vm.updateCheck!=="applying"?"":" disabled"))+
        (candidateId?row(L("Install ready update","Installer la mise à jour prête"),applyLabel,
          icon("ao-ui-next"),'data-settings-apply-update'+(canApply?"":" disabled")):"")
      :"";
    const updateExplanation=vm.hostKind==="github_pages"
      ?L("This installed address receives new GitHub Pages versions. Checking prepares a new saved snapshot; installation requires your separate tap and reload. It never deletes your preferences or prayer progress, and must not interrupt Mass. The snapshot fingerprint is not a Git commit.",
         "Cette adresse reçoit les nouvelles versions GitHub Pages. La vérification prépare une copie ; son installation nécessite un geste distinct et un rechargement. Elle ne supprime ni préférences ni progression et ne doit pas interrompre la Messe. L’empreinte n’est pas un commit Git.")
      :vm.hostKind==="vercel"
        ?L("Vercel loads its network version when reopened online. This address cannot update an app installed from GitHub Pages; those two sites do not share offline snapshots or saved preferences. For the previously installed icon, open its GitHub Pages Settings instead.",
           "Vercel charge sa version en ligne lors d’une nouvelle ouverture. Cette adresse ne peut pas mettre à jour une application installée depuis GitHub Pages ; les deux sites ne partagent ni copies hors ligne ni préférences. Pour l’icône déjà installée, ouvrez ses réglages GitHub Pages.")
        :L("Updates for this address are not verified. For the documented install use the GitHub Pages address; opening another website does not migrate installed data.",
           "Les mises à jour de cette adresse ne sont pas vérifiées. Utilisez l’adresse GitHub Pages documentée pour l’installation ; ouvrir un autre site ne transfère pas les données.");
    const updateBox=section(L("APP VERSION & UPDATES","VERSION & MISES À JOUR"),
      infoRow(L("This site","Ce site"),hostName,addressMarkup)+
      infoRow(L("Launch mode","Mode de lancement"),launchName,icon("ao-ui-info"))+
      infoRow(L("Release label","Version affichée"),
        L("App version · not the Git commit","Version de l’app · non le commit Git"),
        '<span class="aoSetBadge" data-settings-app-version>'+esc(vm.version)+'</span>')+
      infoRow(L("Offline snapshot","Copie hors ligne"),offlineLabel,snapshotLabel)+
      (offline?.error?infoRow(L("Last update error","Dernière erreur de mise à jour"),
        L("Diagnostic code; saved data is retained","Code de diagnostic ; les données restent conservées"),
        '<span class="aoSetBadge" data-settings-update-error>'+esc(String(offline.error).slice(0,220))+'</span>'):"")+
      updateButtons+
      (vm.canonicalHost?"":infoRow(L("Documented install site","Site d’installation documenté"),
        L("A separate site — not an update to this installation","Un site distinct — pas une mise à jour de cette installation"),
        '<a href="'+canonicalUrl+'" target="_blank" rel="noopener noreferrer" data-settings-canonical-site>'+esc(L("GitHub Pages ↗","GitHub Pages ↗"))+'</a>')) +
      note(esc(updateExplanation)));
    return shell(L("About & Sources","À propos & sources"),
      `<div class="aoSetIntro">${esc(L("Sources are grouped by what they control. Exact prayer, commentary and calendar claims keep contextual attribution where they appear.","Les sources sont regroupées selon ce qu’elles contrôlent. Les prières, commentaires et affirmations calendaires gardent leur attribution contextuelle là où ils apparaissent."))}</div>`+
      updateBox+
      section(L("SOURCES","SOURCES"),sourceDetails+methodology)+
      section(L("ABOUT","À PROPOS"),
        infoRow(L("1962 Roman Mass","Messe romaine de 1962"),L("The app keeps the 1962 Mass itself separate from local church practices and private prayers.","L’application garde la Messe de 1962 elle-même distincte des usages locaux et des prières privées."),icon("ao-ui-sources"))+
        infoRow(L("Local church practices","Usages de l’église locale"),L("Saved churches help the app reflect what usually happens in a particular place. They do not change the Mass.","Les églises enregistrées aident l’application à refléter ce qui se fait habituellement dans un lieu précis. Elles ne changent pas la Messe."),icon("ao-ui-info"))+
        infoRow(L("Prayer sources","Sources des prières"),L("Prayer texts keep their source information where it is available.","Les textes de prière conservent leurs informations de source lorsqu’elles sont disponibles."),icon("ao-ui-sources"))+
        infoRow(L("Scripture editions","Éditions de l’Écriture"),L("English uses the Douay-Rheims tradition; French support includes Crampon 1923 where integrated; Latin liturgical Scripture follows the app’s source corpus.","L’anglais suit la tradition Douay-Rheims ; le français comprend Crampon 1923 là où il est intégré ; le latin liturgique suit le corpus de sources de l’application."),icon("ao-ui-sources"))+
        infoRow(L("Artwork sources & rights","Sources & droits des œuvres"),L("Artwork keeps a record of where it came from and how it may be used.","Les œuvres gardent une indication de leur origine et de leurs conditions d’utilisation."),icon("ao-ui-info"))+
        infoRow(L("Acknowledgements & licences","Remerciements & licences"),L("Third-party texts and artworks retain their individual source/licence notices.","Les textes et œuvres tiers conservent leurs notices de source/licence propres."),icon("ao-ui-info"))+

        routeRow(L("Privacy & Data","Confidentialité & données"),L("Review storage and clear saved progress.","Consulter le stockage et effacer la progression."),"/settings/privacy-data")));
  }
  return renderSettingsToString(win,{route:"/settings",live});
}
