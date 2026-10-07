import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { DEFAULT_PREFERENCES } from "./donor-state.js";

export const SETTINGS_PRESENTATION_VERSION="modular-settings-presentation-v4359.6";

export function canonicalSettingsAppVersion(win=globalThis){
  return win?.document?.documentElement?.dataset?.aoRelease||win?.AO_RELEASE_AUTHORITY_V4359?.version||"43.59.6";
}

export function buildSettingsViewModel(win=globalThis,{route="/settings",live=false}={}){
  const donor=win?.AO_SETTINGS_DONOR_V4359?.snapshot?.()||{preferences:DEFAULT_PREFERENCES,profiles:[]};
  const language=donor.preferences?.general?.uiLanguage==="fr"?"fr":"en";
  return Object.freeze({
    route:String(route||"/settings"),
    language,
    live:Boolean(live),
    version:canonicalSettingsAppVersion(win),
    preferences:donor.preferences||DEFAULT_PREFERENCES,
    profiles:Array.isArray(donor.profiles)?donor.profiles:[]
  });
}

export function settingsCss(rootId="ao-settings-modular-root"){
  return `
:root{--ao-settings-max:720px}
html[data-ao-text-scale-v1="small"]{font-size:93.75%}html[data-ao-text-scale-v1="standard"]{font-size:100%}html[data-ao-text-scale-v1="large"]{font-size:112.5%}html[data-ao-text-scale-v1="extra_large"]{font-size:125%}
html[data-ao-motion-v1="reduced"] *,html[data-ao-motion-v1="reduced"] *::before,html[data-ao-motion-v1="reduced"] *::after{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
html[data-ao-contrast-v1="high"]{--border:color-mix(in srgb,var(--text,#f5f2e9) 48%,transparent);--muted:color-mix(in srgb,var(--text,#f5f2e9) 82%,transparent);--muted-2:color-mix(in srgb,var(--text,#f5f2e9) 70%,transparent)}
html[data-ao-sacred-art-v1="subtle"] .aoSacredArt,html[data-ao-sacred-art-v1="subtle"] [data-sacred-art]{opacity:.55}html[data-ao-sacred-art-v1="minimal"] .aoSacredArt,html[data-ao-sacred-art-v1="minimal"] [data-sacred-art]{display:none!important}
#${rootId}{position:fixed;z-index:15670;inset:0;pointer-events:auto;background:var(--bg,#0b0f13);color:var(--text,#f3efe8);overflow:auto;overscroll-behavior:contain;font-family:var(--font-body,system-ui,sans-serif);padding-bottom:calc(var(--ao-global-ribbon-h,68px) + 24px + env(safe-area-inset-bottom,0px))}
#${rootId},#${rootId} *{box-sizing:border-box}#${rootId}[hidden]{display:none!important}
#${rootId} .aoSetTop{position:sticky;top:0;z-index:3;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:8px;padding:calc(9px + env(safe-area-inset-top,0px)) 10px 9px;background:color-mix(in srgb,var(--bg,#0b0f13) 94%,transparent);border-bottom:1px solid var(--border,rgba(255,255,255,.12));backdrop-filter:blur(16px)}
#${rootId} .aoSetTop button{width:42px;height:42px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:50%;background:var(--surface-1,#151a20);color:inherit;display:grid;place-items:center}
#${rootId} .aoSetTopIcon{width:18px;height:18px}#${rootId} .aoSetTitle{min-width:0;text-align:center}#${rootId} .aoSetTitle small{display:block;color:var(--liturgical,#c6a66b);font:700 .56rem/1.1 var(--font-display,system-ui);letter-spacing:.12em;text-transform:uppercase}#${rootId} .aoSetTitle strong{display:block;margin-top:3px;font:600 1rem/1.15 var(--font-display,system-ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${rootId} .aoSetWrap{width:min(var(--ao-settings-max),100%);margin:0 auto;padding:16px 12px 32px}#${rootId} .aoSetIntro{padding:4px 4px 13px;color:var(--muted,#b8c0c7);font-size:.84rem;line-height:1.45}
#${rootId} .aoSetSection{margin:15px 0 22px}#${rootId} .aoSetSection>h2{margin:0 4px 7px;color:var(--liturgical,#c6a66b);font:750 .61rem/1.2 var(--font-display,system-ui);letter-spacing:.12em;text-transform:uppercase}
#${rootId} .aoSetGroup{overflow:hidden;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:15px;background:var(--surface-1,#141a20)}
#${rootId} .aoSetRow{width:100%;min-width:0;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;padding:12px 13px;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.09));background:transparent;color:inherit;text-align:left}#${rootId} .aoSetRow:last-child{border-bottom:0}#${rootId} .aoSetRow:disabled{opacity:.5}#${rootId} .aoSetRowText{min-width:0}#${rootId} .aoSetRowText b{display:block;font:620 .9rem/1.25 var(--font-display,system-ui)}#${rootId} .aoSetRowText small{display:block;margin-top:3px;color:var(--muted,#b3bac0);font-size:.71rem;line-height:1.35}#${rootId} .aoSetRowEnd{color:var(--muted,#b3bac0);font-size:.78rem;white-space:nowrap}
#${rootId} .aoSetSegments{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}#${rootId} .aoSetSegments button{min-height:34px;padding:6px 9px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:999px;background:var(--surface-2,#10151a);color:var(--muted,#b8c0c7);font:700 .68rem/1.1 var(--font-display,system-ui)}#${rootId} .aoSetSegments button.active{border-color:var(--liturgical-border,var(--liturgical,#c6a66b));background:var(--liturgical-soft,rgba(198,166,107,.12));color:var(--text,#f3efe8)}
#${rootId} .aoSetSwitch{width:46px;height:28px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:999px;background:var(--surface-2,#0f1419);padding:2px}#${rootId} .aoSetSwitch i{display:block;width:22px;height:22px;border-radius:50%;background:var(--muted-2,#8f989f);transition:transform .16s ease}#${rootId} .aoSetSwitch.on{background:var(--liturgical-soft,rgba(198,166,107,.16));border-color:var(--liturgical-border,var(--liturgical,#c6a66b))}#${rootId} .aoSetSwitch.on i{transform:translateX(17px);background:var(--liturgical,#c6a66b)}
#${rootId} .aoSetSelect{max-width:48vw;min-height:36px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:10px;background:var(--surface-2,#10151a);color:inherit;padding:6px 28px 6px 9px;font:650 .72rem/1.2 var(--font-display,system-ui)}
#${rootId} .aoSetNote{margin:10px 4px 0;padding:10px 11px;border-left:2px solid var(--liturgical,#c6a66b);border-radius:0 10px 10px 0;background:var(--liturgical-soft,rgba(198,166,107,.08));color:var(--muted,#b8c0c7);font-size:.73rem;line-height:1.42}#${rootId} .aoSetNote strong{color:var(--text,#f3efe8)}
#${rootId} .aoSetDanger{color:#f0b8ae!important}#${rootId} .aoSetProfileName{width:100%;min-height:42px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:11px;background:var(--surface-2,#10151a);color:inherit;padding:9px 10px;font:600 .88rem/1.2 var(--font-display,system-ui)}
#${rootId} .aoSetBadge{display:inline-block;padding:3px 7px;border:1px solid var(--border,rgba(255,255,255,.1));border-radius:999px;color:var(--muted,#b8c0c7);font-size:.61rem}#${rootId} .aoSetBadge.active{border-color:var(--liturgical-border,var(--liturgical,#c6a66b));color:var(--liturgical,#c6a66b)}
#${rootId} .aoSetEmpty{padding:18px 13px;color:var(--muted,#b8c0c7);font-size:.78rem;line-height:1.45}#${rootId} .aoSetAction{min-height:40px;padding:9px 12px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:11px;background:var(--surface-2,#10151a);color:inherit;font:700 .74rem/1.1 var(--font-display,system-ui)}
#${rootId} .aoSetInlineIcon{display:inline-block;width:1em;height:1em;background:currentColor;vertical-align:-.12em}
#${rootId} .aoSetSource{padding:12px 13px;border-bottom:1px solid var(--border,rgba(255,255,255,.09))}#${rootId} .aoSetSource:last-child{border-bottom:0}#${rootId} .aoSetSource summary{cursor:pointer;font-weight:650}#${rootId} .aoSetSource p{margin:8px 0 0;color:var(--muted,#b3bac0);font-size:.72rem;line-height:1.45}#${rootId} .aoSetSourceKey{padding:10px 13px;border-bottom:1px solid var(--border,rgba(255,255,255,.09));color:var(--muted,#b3bac0);font-size:.74rem}#${rootId} .aoSetSourceKey:last-child{border-bottom:0}
@media(max-width:430px){#${rootId} .aoSetWrap{padding-left:10px;padding-right:10px}#${rootId} .aoSetRow{padding:11px}#${rootId} .aoSetSegments{max-width:54vw}#${rootId} .aoSetSelect{max-width:52vw}#${rootId} .aoSetRowText b{font-size:.86rem}}
@media(max-width:350px){#${rootId} .aoSetWrap{padding-left:7px;padding-right:7px}#${rootId} .aoSetRow{grid-template-columns:minmax(0,1fr);gap:8px}#${rootId} .aoSetSegments{max-width:none;justify-content:flex-start}#${rootId} .aoSetSelect{max-width:100%;width:100%}#${rootId} .aoSetSwitch{justify-self:start}}
`;
}

export function renderSettingsToString(win=globalThis,{route="/settings",live=false}={}){
  const vm=buildSettingsViewModel(win,{route,live}),p=vm.preferences,profiles=vm.profiles,fr=vm.language==="fr";
  const L=(en,frText)=>fr?(frText||en):en;
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const icon=(id,cls="aoSetInlineIcon")=>{const u=resolveCanonicalAssetUrl(id);return u?`<span class="${cls}" aria-hidden="true" data-ao-asset-id="${id}" style="-webkit-mask:url('${esc(u)}') center/contain no-repeat;mask:url('${esc(u)}') center/contain no-repeat"></span>`:"";};
  const path=(obj,key)=>String(key).split(".").reduce((v,k)=>v?.[k],obj);
  const header=(title,landing=false)=>`<header class="aoSetTop">${landing?`<span></span>`:`<button type="button" data-settings-back aria-label="${esc(L("Back","Retour"))}">${icon("ao-ui-back","aoSetTopIcon")}</button>`}<div class="aoSetTitle"><small>${esc(L("SETTINGS","RÉGLAGES"))}</small><strong>${esc(title)}</strong></div><button type="button" data-settings-close aria-label="${esc(L("Close","Fermer"))}">${icon("ao-ui-close","aoSetTopIcon")}</button></header>`;
  const section=(title,body)=>`<section class="aoSetSection"><h2>${esc(title)}</h2><div class="aoSetGroup">${body}</div></section>`;
  const row=(title,sub,end="",attrs="")=>`<button type="button" class="aoSetRow" ${attrs}><span class="aoSetRowText"><b>${esc(title)}</b>${sub?`<small>${esc(sub)}</small>`:""}</span><span class="aoSetRowEnd">${end}</span></button>`;
  const routeRow=(title,sub,r)=>row(title,sub,icon("ao-ui-next"),`data-settings-route="${esc(r)}"`);
  const seg=(label,key,items)=>{const active=path(p,key);return `<div class="aoSetRow"><span class="aoSetRowText"><b>${esc(label)}</b></span><span class="aoSetSegments">${items.map(([v,en,frt])=>`<button type="button" data-pref-path="${esc(key)}" data-pref-value="${esc(v)}" class="${active===v?"active":""}" aria-pressed="${active===v}">${esc(L(en,frt))}</button>`).join("")}</span></div>`;};
  const toggle=(title,sub,key)=>{const on=Boolean(path(p,key));return `<button type="button" class="aoSetRow" data-pref-toggle="${esc(key)}" aria-pressed="${on}"><span class="aoSetRowText"><b>${esc(title)}</b>${sub?`<small>${esc(sub)}</small>`:""}</span><span class="aoSetSwitch ${on?"on":""}" aria-hidden="true"><i></i></span></button>`;};
  const select=(title,sub,key,items)=>{const active=path(p,key);return `<label class="aoSetRow"><span class="aoSetRowText"><b>${esc(title)}</b>${sub?`<small>${esc(sub)}</small>`:""}</span><select class="aoSetSelect" data-pref-select="${esc(key)}">${items.map(([v,en,frt])=>`<option value="${esc(v)}"${active===v?" selected":""}>${esc(L(en,frt))}</option>`).join("")}</select></label>`;};
  const note=text=>`<div class="aoSetNote">${text}</div>`;
  const shell=(title,body,landing=false)=>`${header(title,landing)}<main class="aoSetWrap">${body}</main><style>${settingsCss("ao-settings-modular-root")}</style>`;

  if(vm.route==="/settings"||vm.route==="main"){
    return shell(L("Settings","Réglages"),
      section(L("APP","APPLICATION"),
        routeRow(L("General","Général"),L("Language, vibration, screen and resume options","Langue, vibration, écran et reprise"),"/settings/general")+
        routeRow(L("Display & Accessibility","Affichage & accessibilité"),L("Text size, animations, contrast and artwork","Taille du texte, animations, contraste et œuvres"),"/settings/accessibility")+
        routeRow(L("Language & Text","Langue & textes"),L("App language and translation language","Langue de l’application et langue des traductions"),"/settings/language-reading"))+
      section(L("MASS & PRAYER","MESSE & PRIÈRE"),
        routeRow(L("Mass","Messe"),L("Choices used when you start a new Mass","Choix utilisés lorsque vous commencez une nouvelle Messe"),"/settings/mass")+
        routeRow(L("Local Church & Customs","Église locale & usages"),L("Save the usual practices at a particular church","Enregistrer les usages habituels d’une église"),"/settings/local-customs")+
        routeRow(L("Prayer & Devotions","Prière & dévotions"),L("Choose how the Rosary, Stations and Angelus behave","Choisir le comportement du Rosaire, du Chemin de Croix et de l’Angélus"),"/settings/prayer"))+
      section(L("DATA","DONNÉES"),routeRow(L("Privacy & Data","Confidentialité & données"),L("Clear saved progress or restore defaults","Effacer la progression ou rétablir les réglages"),"/settings/privacy-data"))+
      section(L("ABOUT","À PROPOS"),row(L("About & Sources","À propos & sources"),L("Where the app’s texts, Scripture and artwork come from","Origine des textes, de l’Écriture et des œuvres"),icon("ao-ui-next"),'data-settings-route="/settings/about-sources" data-settings-sources')),true);
  }
  if(vm.route==="/settings/general"){
    return shell(L("General","Général"),
      section(L("APP","APPLICATION"),
        seg(L("App language","Langue de l’application"),"general.uiLanguage",[["en","English","Anglais"],["fr","Français","Français"]])+
        toggle(L("Vibration feedback","Retour par vibration"),L("Vibrate gently when you tap certain controls.","Vibration légère lors de certaines actions."),"general.hapticsEnabled")+
        toggle(L("Keep screen on","Garder l’écran allumé"),L("Stops the screen from dimming while following Mass or guided prayer.","Empêche la mise en veille pendant la Messe ou une prière guidée."),"general.keepAwakeDuringGuidedUse")+
        toggle(L("Remember where I stopped","Mémoriser où je me suis arrêté"),L("Offer to continue an unfinished Mass or prayer.","Proposer de reprendre une Messe ou une prière inachevée."),"general.offerResume")));
  }
  if(vm.route==="/settings/accessibility"){
    return shell(L("Display & Accessibility","Affichage & accessibilité"),
      section(L("DISPLAY","AFFICHAGE"),
        select(L("Text size","Taille du texte"),"","accessibility.textScale",[["system","Use device setting","Réglage de l’appareil"],["small","Small","Petite"],["standard","Normal","Normale"],["large","Large","Grande"],["extra_large","Extra large","Très grande"]])+
        select(L("Animations","Animations"),"","accessibility.motion",[["system","Use device setting","Réglage de l’appareil"],["standard","Standard","Standard"],["reduced","Fewer animations","Moins d’animations"]])+
        select(L("Text contrast","Contraste du texte"),"","accessibility.contrast",[["system","Use device setting","Réglage de l’appareil"],["standard","Standard","Standard"],["high","Higher contrast","Contraste renforcé"]])+
        seg(L("Sacred artwork","Art sacré"),"appearance.sacredArt",[["full","Full","Complet"],["subtle","Subtle","Discret"],["minimal","Minimal","Minimal"]])));
  }
  if(vm.route==="/settings/language-reading"){
    return shell(L("Language & Text","Langue & textes"),
      section(L("LANGUAGE","LANGUE"),
        seg(L("App language","Langue de l’application"),"general.uiLanguage",[["en","English","Anglais"],["fr","Français","Français"]])+
        toggle(L("Use app language for translations","Utiliser la langue de l’application pour les traductions"),L("Keeps translations in the same language as the app unless another is chosen below.","Conserve les traductions dans la langue de l’application sauf choix contraire."),"reading.vernacularFollowsUiLanguage")+
        seg(L("Translation language","Langue de traduction"),"reading.vernacular",[["en","English","Anglais"],["fr","Français","Français"]]))+
      note(esc(L("Latin remains available for liturgical text. Simple, Missal and LIVE keep their distinct reading behaviour; this setting changes translation and explanation language only.","Le latin reste disponible pour le texte liturgique. Simple, Missel et LIVE gardent leur fonctionnement propre ; ce réglage change seulement la langue des traductions et explications."))));
  }
  if(vm.route==="/settings/mass"){
    const church=p.mass.defaultProfileId?profiles.find(x=>x.id===p.mass.defaultProfileId)?.name:L("Standard 1962 practice","Pratique standard de 1962");
    return shell(L("Mass","Messe"),
      section(L("MASS","MESSE"),
        seg(L("How I usually follow Mass","Ma façon habituelle de suivre la Messe"),"mass.defaultExperience",[["simple","Simple","Simple"],["missal","Missal","Missel"],["live","LIVE","LIVE"]])+
        seg(L("Usual Mass form","Forme habituelle de Messe"),"mass.defaultForm",[["sung","Sung","Chantée"],["low","Low","Basse"]])+
        seg(L("Participation during Mass","Participation pendant la Messe"),"mass.responseEmphasis",[["quiet","Mostly quiet","Plutôt silencieux"],["responses","Join responses","Participer aux réponses"]])+
        toggle(L("Remember my place in Mass","Mémoriser ma place dans la Messe"),"","mass.resumeEnabled")+
        toggle(L("Offer thanksgiving after Mass","Proposer l’action de grâces après la Messe"),"","mass.offerThanksgivingAfterMass")+
        routeRow(L("Usual church","Église habituelle"),church,"/settings/local-customs")+
        seg(L("Preparation length","Durée de la préparation"),"mass.preparationDepth",[["quick","Quick","Rapide"],["standard","Standard","Standard"],["full","Full","Complète"]])+
        seg(L("Thanksgiving length","Durée de l’action de grâces"),"mass.thanksgivingDepth",[["quick","Quick","Rapide"],["standard","Standard","Standard"],["full","Full","Complète"]]))+
      note(`<strong>${esc(L("Future sessions only","Pour les sessions futures seulement"))}</strong><br>${esc(L("These choices are used when you start a new Mass. They will not change a Mass already in progress.","Ces choix sont utilisés lorsque vous commencez une nouvelle Messe. Ils ne modifient pas une Messe déjà en cours."))}`));
  }
  if(vm.route==="/settings/prayer"){
    return shell(L("Prayer & Devotions","Prière & dévotions"),
      section(L("PRAYER","PRIÈRE"),
        seg(L("Prayer mode","Mode de prière"),"prayer.recitationMode",[["individual","Individual","Individuelle"],["group","In a group","En groupe"]]))+
      section(L("ROSARY","ROSAIRE"),
        toggle(L("Fatima prayer","Prière de Fatima"),"","prayer.rosary.fatimaPrayer")+
        toggle(L("Scripture passages","Passages de l’Écriture"),"","prayer.rosary.scriptureCues")+
        toggle(L("Commentary","Commentaire"),"","prayer.rosary.commentary")+
        select(L("Sacred artwork","Art sacré"),"","prayer.rosary.sacredArt",[["inherit","Use main artwork setting","Utiliser le réglage principal"],["full","Full","Complet"],["subtle","Subtle","Discret"],["off","Off","Désactivé"]]))+
      section(L("STATIONS","CHEMIN DE CROIX"),
        seg(L("Mode","Mode"),"prayer.stations.mode",[["guided","Guided","Guidé"],["simple","Simple","Simple"]])+
        toggle("Stabat Mater",L("Include between stations","Inclure entre les stations"),"prayer.stations.stabatMater"))+
      section(L("ANGELUS","ANGÉLUS"),
        seg(L("Seasonal form","Forme saisonnière"),"prayer.angelus.seasonalForm",[["auto","Automatic","Automatique"],["angelus","Angelus","Angélus"],["regina_caeli","Regina Cæli","Regina Cæli"]])+
        toggle(L("Include the traditional concluding prayers","Inclure les prières conclusives traditionnelles"),"","prayer.angelus.traditionalConclusion")));
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
    const dataRow=(en,frt,a,danger=false,disabled=false)=>row(L(en,frt),"",danger?icon("ao-ui-close"):"",`${danger?'class="aoSetDanger" ':''}data-data-action="${a}"${disabled?" disabled":""}`);
    return shell(L("Privacy & Data","Confidentialité & données"),
      section(L("DATA","DONNÉES"),
        dataRow("Clear unfinished Mass","Effacer la Messe inachevée","clear-mass",false,vm.live)+
        dataRow("Clear prayer sessions","Effacer les sessions de prière","clear-prayer")+
        dataRow("Restore default settings","Rétablir les réglages par défaut","reset-preferences")+
        dataRow("Delete saved churches","Supprimer les églises enregistrées","reset-profiles")+
        dataRow("Clear learning progress","Effacer la progression d’apprentissage","clear-progress")+
        dataRow("Clear bookmarks","Effacer les favoris","clear-bookmarks")+
        dataRow("Clear temporary downloaded files","Effacer les fichiers temporaires téléchargés","clear-cache")+
        dataRow("Reset the whole app","Réinitialiser toute l’application","reset-all",true))+
      note(`<strong>${esc(L("Privacy","Confidentialité"))}</strong><br>${esc(L("Selections made during an examination of conscience are temporary and are not stored as a persistent list of sins.","Les sélections faites pendant un examen de conscience sont temporaires et ne sont pas enregistrées comme liste persistante de péchés."))}`));
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
    const provenanceRows=provenance.map(value=>`<div class="aoSetSourceKey">${esc(value)}</div>`).join("");
    return shell(L("About & Sources","À propos & sources"),
      `<div class="aoSetIntro">${esc(L("Sources are grouped by what they control. Exact prayer, commentary and calendar claims keep contextual attribution where they appear.","Les sources sont regroupées selon ce qu’elles contrôlent. Les prières, commentaires et affirmations calendaires gardent leur attribution contextuelle là où ils apparaissent."))}</div>`+
      section(L("SOURCES","SOURCES"),sourceDetails)+
      section(L("PROVENANCE","PROVENANCE"),provenanceRows)+
      section(L("ABOUT","À PROPOS"),
        row(L("1962 Roman Mass","Messe romaine de 1962"),L("The app keeps the 1962 Mass itself separate from local church practices and private prayers.","L’application garde la Messe de 1962 elle-même distincte des usages locaux et des prières privées."),icon("ao-ui-sources"))+
        row(L("Local church practices","Usages de l’église locale"),L("Saved churches help the app reflect what usually happens in a particular place. They do not change the Mass.","Les églises enregistrées aident l’application à refléter ce qui se fait habituellement dans un lieu précis. Elles ne changent pas la Messe."),icon("ao-ui-info"))+
        row(L("Prayer sources","Sources des prières"),L("Prayer texts keep their source information where it is available.","Les textes de prière conservent leurs informations de source lorsqu’elles sont disponibles."),icon("ao-ui-sources"))+
        row(L("Scripture editions","Éditions de l’Écriture"),L("English uses the Douay-Rheims tradition; French support includes Crampon 1923 where integrated; Latin liturgical Scripture follows the app’s source corpus.","L’anglais suit la tradition Douay-Rheims ; le français comprend Crampon 1923 là où il est intégré ; le latin liturgique suit le corpus de sources de l’application."),icon("ao-ui-sources"))+
        row(L("Artwork sources & rights","Sources & droits des œuvres"),L("Artwork keeps a record of where it came from and how it may be used.","Les œuvres gardent une indication de leur origine et de leurs conditions d’utilisation."),icon("ao-ui-info"))+
        row(L("Acknowledgements & licences","Remerciements & licences"),L("Third-party texts and artworks retain their individual source/licence notices.","Les textes et œuvres tiers conservent leurs notices de source/licence propres."),icon("ao-ui-info"))+
        row(L("Version","Version"),"",`<span class="aoSetBadge" data-settings-app-version>${esc(vm.version)}</span>`)+
        row(L("Privacy","Confidentialité"),L("Your settings and progress are stored on this device unless a feature clearly tells you otherwise.","Vos réglages et votre progression sont enregistrés sur cet appareil sauf indication claire d’une fonctionnalité."),icon("ao-ui-info"))));
  }
  return renderSettingsToString(win,{route:"/settings",live});
}
