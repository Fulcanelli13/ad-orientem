export const CINEMATIC_RUNTIME_VERSION="43.12-ZERO-OBSERVER-CINEMATIC-CERTIFICATION";

export function installCinematicRuntime(win=globalThis){
  if(win?.AO_CINEMATIC_V4312?.version==="43.12-ZERO-OBSERVER-CINEMATIC-CERTIFICATION") return win.AO_CINEMATIC_V4312;
  const d=win?.document;
  if(!d) return null;

  const VERSION="43.12-ZERO-OBSERVER-CINEMATIC-CERTIFICATION";
  const STYLE_ID="ao-v4312-cinematic-loading-css";
  const BOOT_ID="ao-cinema-boot";
  const TRANSITION_ID="ao-cinema-transition";
  const LOADER_ID="ao-cinema-loader";
  const CSS=`
#ao-cinema-boot,#ao-cinema-transition,#ao-cinema-loader{font-family:var(--font-liturgical);color:var(--text);-webkit-font-smoothing:antialiased}
#ao-cinema-boot{position:fixed;z-index:2147483000;inset:0;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 34%,color-mix(in srgb,var(--liturgical) 16%,transparent),transparent 26rem),linear-gradient(180deg,#0c1118 0%,#070a0f 72%,#05070a 100%);opacity:1;visibility:visible;transition:opacity .62s cubic-bezier(.2,.75,.2,1),visibility 0s linear .62s}
#ao-cinema-boot.aoCinemaBootDone{opacity:0;visibility:hidden;pointer-events:none}.aoCinemaBootAtmosphere{position:absolute;inset:-12%;pointer-events:none;background:radial-gradient(ellipse at 50% 22%,color-mix(in srgb,var(--liturgical) 12%,transparent),transparent 36%);filter:blur(10px);animation:aoCinemaBreathe 4.6s ease-in-out infinite alternate}.aoCinemaBootInner{position:relative;width:min(84vw,390px);padding:26px 22px;text-align:center}.aoCinemaBootCross{display:grid;place-items:center;width:60px;height:60px;margin:0 auto 20px;border:1px solid color-mix(in srgb,var(--liturgical) 48%,rgba(255,255,255,.16));border-radius:50%;background:color-mix(in srgb,var(--liturgical) 7%,transparent);box-shadow:0 0 0 8px color-mix(in srgb,var(--liturgical) 2%,transparent),0 0 44px color-mix(in srgb,var(--liturgical) 15%,transparent);color:color-mix(in srgb,var(--liturgical) 76%,#efe9dd);font:500 1.65rem/1 var(--font-display);animation:aoCinemaCross 2.7s ease-in-out infinite}.aoCinemaBootKicker{color:var(--liturgical);font:600 .61rem/1 var(--font-display);letter-spacing:.24em;text-transform:uppercase}.aoCinemaBootTitle{margin:10px 0 5px;font:600 clamp(1.6rem,7vw,2.15rem)/1.08 var(--font-display);letter-spacing:.085em;text-transform:uppercase}.aoCinemaBootSub{color:var(--muted);font-size:.86rem}.aoCinemaBootRule{position:relative;width:min(250px,70vw);height:1px;margin:24px auto 14px;background:rgba(255,255,255,.07);overflow:hidden}.aoCinemaBootRule i{position:absolute;inset:0 auto 0 -45%;width:45%;background:linear-gradient(90deg,transparent,var(--liturgical),transparent);box-shadow:0 0 16px var(--liturgical);animation:aoCinemaSweep 1.65s ease-in-out infinite}.aoCinemaBootStatus{min-height:1.3em;color:var(--muted-2);font-size:.75rem;letter-spacing:.035em}.aoCinemaBootStatus.ready{color:color-mix(in srgb,var(--liturgical) 74%,var(--text))}
@keyframes aoCinemaSweep{0%{transform:translateX(0);opacity:.15}45%{opacity:1}100%{transform:translateX(320%);opacity:.15}}@keyframes aoCinemaBreathe{to{transform:scale(1.045);opacity:.76}}@keyframes aoCinemaCross{50%{transform:translateY(-2px);box-shadow:0 0 52px color-mix(in srgb,var(--liturgical) 18%,transparent)}}
#ao-cinema-transition{position:fixed;z-index:2147482900;inset:0;display:grid;place-items:center;pointer-events:none;opacity:0;visibility:hidden;background:radial-gradient(circle at 50% 48%,color-mix(in srgb,var(--liturgical) 13%,transparent),transparent 24rem),rgba(5,8,12,.94);backdrop-filter:blur(13px);transition:opacity .18s ease,visibility 0s linear .2s}
#ao-cinema-transition.aoCinemaTransitionOn{opacity:1;visibility:visible;transition:opacity .11s ease}#ao-cinema-transition.aoCinemaTransitionOut{opacity:0;visibility:visible;transition:opacity .48s cubic-bezier(.2,.75,.2,1)}.aoCinemaTransitionInner{text-align:center;padding:28px 24px;transform:translateY(5px);opacity:.76;transition:transform .46s cubic-bezier(.18,.8,.2,1),opacity .42s ease}.aoCinemaTransitionOn .aoCinemaTransitionInner{transform:none;opacity:1}.aoCinemaTransitionGlyph{display:block;margin-bottom:13px;color:var(--liturgical);font:500 1.1rem/1 var(--font-display)}.aoCinemaTransitionKicker{display:block;color:var(--liturgical);font:600 .56rem/1 var(--font-display);letter-spacing:.19em;text-transform:uppercase}.aoCinemaTransitionTitle{display:block;margin-top:9px;font:600 clamp(1.1rem,5vw,1.45rem)/1.15 var(--font-display)}.aoCinemaTransitionLine{display:block;width:96px;height:1px;margin:17px auto 0;background:linear-gradient(90deg,transparent,var(--liturgical),transparent);transform:scaleX(.15);opacity:.3;transition:transform .48s .02s ease,opacity .3s ease}.aoCinemaTransitionOn .aoCinemaTransitionLine{transform:scaleX(1);opacity:.8}
#ao-cinema-loader{position:fixed;z-index:2147482800;inset:0;display:grid;place-items:center;padding:22px;pointer-events:none;opacity:0;visibility:hidden;background:rgba(5,8,12,.64);backdrop-filter:blur(8px);transition:opacity .24s ease,visibility 0s linear .25s}#ao-cinema-loader.aoCinemaLoaderOn{opacity:1;visibility:visible;transition:opacity .18s ease}.aoCinemaLoaderCard{width:min(88vw,360px);padding:20px 19px 18px;border:1px solid var(--liturgical-border);border-radius:18px;background:linear-gradient(180deg,color-mix(in srgb,var(--surface-2) 94%,transparent),rgba(9,13,19,.96));box-shadow:0 24px 70px rgba(0,0,0,.34)}.aoCinemaLoaderHead{display:flex;align-items:center;gap:11px;margin-bottom:16px}.aoCinemaLoaderMark{width:30px;height:30px;display:grid;place-items:center;border:1px solid var(--liturgical-border);border-radius:50%;color:var(--liturgical)}.aoCinemaLoaderText{display:flex;flex-direction:column;gap:3px}.aoCinemaLoaderText b{font:600 .8rem/1.2 var(--font-display)}.aoCinemaLoaderText small{color:var(--muted-2);font-size:.7rem}.aoCinemaSkeleton{display:grid;gap:9px}.aoCinemaSkeleton i{display:block;height:8px;border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,.045),rgba(255,255,255,.1),color-mix(in srgb,var(--liturgical) 17%,rgba(255,255,255,.07)),rgba(255,255,255,.045));background-size:240% 100%;animation:aoCinemaSkeleton 1.35s linear infinite}.aoCinemaSkeleton i:nth-child(1){width:76%}.aoCinemaSkeleton i:nth-child(2){width:94%}.aoCinemaSkeleton i:nth-child(3){width:62%}@keyframes aoCinemaSkeleton{to{background-position:-140% 0}}
.aoCinemaArt{background:linear-gradient(110deg,rgba(255,255,255,.035),rgba(255,255,255,.075),rgba(255,255,255,.035));background-size:220% 100%;animation:aoCinemaArtShimmer 1.5s linear infinite;overflow:hidden}.aoCinemaArt img{transition:filter .72s cubic-bezier(.18,.8,.2,1),opacity .58s ease,transform 1.05s cubic-bezier(.18,.8,.2,1)}.aoCinemaArt img.aoCinemaImagePending{filter:blur(15px);opacity:.28;transform:scale(1.028)}.aoCinemaArt img.aoCinemaImageReady{filter:none;opacity:1;transform:none}.aoCinemaArt img.aoCinemaImageError{filter:none;opacity:.18}@keyframes aoCinemaArtShimmer{to{background-position:-120% 0}}
@media(prefers-reduced-motion:reduce){#ao-cinema-boot,#ao-cinema-transition,#ao-cinema-loader,.aoCinemaTransitionInner,.aoCinemaTransitionLine,.aoCinemaArt img{animation:none!important;transition:none!important;transform:none!important;filter:none!important}.aoCinemaBootAtmosphere,.aoCinemaBootCross,.aoCinemaBootRule i,.aoCinemaSkeleton i{animation:none!important}}
html[data-reduced-motion="true"] #ao-cinema-transition,html[data-reduced-motion="true"] #ao-cinema-loader{backdrop-filter:none}`;

  if(!d.getElementById(STYLE_ID)){
    const style=d.createElement("style"); style.id=STYLE_ID; style.textContent=CSS; (d.head||d.documentElement).append(style);
  }
  if(!d.getElementById(BOOT_ID)){
    const el=d.createElement("div"); el.id=BOOT_ID; el.setAttribute("role","status"); el.setAttribute("aria-live","polite");
    el.innerHTML='<div class="aoCinemaBootAtmosphere" aria-hidden="true"></div><div class="aoCinemaBootInner"><div class="aoCinemaBootCross" aria-hidden="true">✠</div><div class="aoCinemaBootKicker">AD ORIENTEM</div><div class="aoCinemaBootTitle">Missale Romanum</div><div class="aoCinemaBootSub">1962</div><div class="aoCinemaBootRule" aria-hidden="true"><i></i></div><div class="aoCinemaBootStatus" data-ao-cinema-boot-status>Preparing today’s Mass…</div></div>'; d.body?.append(el);
  }
  if(!d.getElementById(TRANSITION_ID)){
    const el=d.createElement("div"); el.id=TRANSITION_ID; el.setAttribute("aria-hidden","true");
    el.innerHTML='<div class="aoCinemaTransitionInner"><span class="aoCinemaTransitionGlyph" aria-hidden="true">✠</span><span class="aoCinemaTransitionKicker" data-ao-cinema-transition-kicker>AD ORIENTEM</span><strong class="aoCinemaTransitionTitle" data-ao-cinema-transition-title></strong><span class="aoCinemaTransitionLine" aria-hidden="true"></span></div>'; d.body?.append(el);
  }
  if(!d.getElementById(LOADER_ID)){
    const el=d.createElement("div"); el.id=LOADER_ID; el.setAttribute("aria-hidden","true");
    el.innerHTML='<div class="aoCinemaLoaderCard"><div class="aoCinemaLoaderHead"><div class="aoCinemaLoaderMark" aria-hidden="true">✠</div><div class="aoCinemaLoaderText"><b data-ao-cinema-loader-title></b><small data-ao-cinema-loader-sub></small></div></div><div class="aoCinemaSkeleton" aria-hidden="true"><i></i><i></i><i></i></div></div>'; d.body?.append(el);
  }

  const runtime=()=>win?.AO_RUNTIME_V8;
  const state=()=>runtime()?.store?.getState?.()||null;
  const reduced=()=>Boolean(
    win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    state()?.settings?.reducedMotion ||
    d?.documentElement?.dataset?.aoMotionV1==="reduced" ||
    d?.documentElement?.dataset?.reducedMotion==="true"
  );
  const fr=()=>state()?.language==="fr";
  const L=(en,frText)=>fr()?frText:en;
  const q=(sel,root=d)=>root?.querySelector?.(sel)||null;
  const routeMeta={
    "enter-live":()=>({kicker:"AD ORIENTEM",title:L("Entering Mass","Entrée dans la Messe")}),
    "leave-live":()=>({kicker:"AD ORIENTEM",title:L("Returning home","Retour à l’accueil")}),
    "enter-prepare":()=>({kicker:L("BEFORE MASS","AVANT LA MESSE"),title:L("Preparation for Mass","Préparation à la Messe")}),
    "leave-prepare":()=>({kicker:"AD ORIENTEM",title:L("Returning home","Retour à l’accueil")}),
    "enter-thanksgiving":()=>({kicker:L("AFTER MASS","APRÈS LA MESSE"),title:L("Thanksgiving","Action de grâce")}),
    "finish-live":()=>({kicker:L("AFTER MASS","APRÈS LA MESSE"),title:L("Thanksgiving","Action de grâce")}),
    "leave-thanksgiving":()=>({kicker:"AD ORIENTEM",title:L("Returning home","Retour à l’accueil")}),
    "scripture-open":()=>({kicker:L("SACRED SCRIPTURE","SAINTE ÉCRITURE"),title:L("Opening the reading","Ouverture de la lecture")}),
    "scripture-close":()=>({kicker:"AD ORIENTEM",title:L("Returning","Retour")})
  };
  let transitionTimer=null,loaderTimer=null,lastLoadingKey="",bootFinished=false,storeInstalled=false;

  function showTransition(meta){
    const el=d.getElementById(TRANSITION_ID);
    if(!el||reduced()||d.getElementById(BOOT_ID)?.classList.contains("aoCinemaBootDone")===false||!meta?.title) return false;
    win.clearTimeout?.(transitionTimer);
    q("[data-ao-cinema-transition-kicker]",el).textContent=meta.kicker||"AD ORIENTEM";
    q("[data-ao-cinema-transition-title]",el).textContent=meta.title;
    el.classList.remove("aoCinemaTransitionOut"); el.classList.add("aoCinemaTransitionOn"); el.setAttribute("aria-hidden","false");
    transitionTimer=win.setTimeout?.(()=>{
      el.classList.remove("aoCinemaTransitionOn"); el.classList.add("aoCinemaTransitionOut");
      transitionTimer=win.setTimeout?.(()=>{el.classList.remove("aoCinemaTransitionOut");el.setAttribute("aria-hidden","true");},520);
    },Math.max(260,Number(meta.hold)||360));
    return true;
  }
  function loadingSpec(s){
    if(!s) return null;
    if(s.resolving){
      const active=win?.AO_APP_SHELL_V1?.getActive?.()||win?.AO_GLOBAL_RIBBON_V4323?.getActive?.();
      const panel=win?.AO_NAV_V25?.getState?.()?.panel;
      if(active==="calendar"||panel==="calendar") return {key:"calendar",title:L("Resolving the 1962 calendar","Résolution du calendrier de 1962"),sub:L("Selecting the proper Mass and liturgical colour","Sélection de la Messe et de la couleur liturgique")};
    }
    if(s.scripture?.loading) return {key:"scripture",title:L("Opening Sacred Scripture","Ouverture de la Sainte Écriture"),sub:L("Loading the appointed reading and commentary","Chargement de la lecture et du commentaire")};
    return null;
  }
  function hideLoader(){
    win.clearTimeout?.(loaderTimer); lastLoadingKey="";
    const el=d.getElementById(LOADER_ID); if(!el) return;
    if(el.dataset?.aoLoadingDirector==="active")return; // ongoing lazy module owns current visual
    win.AO_LOADING_DIRECTOR_V1?.releaseLegacy?.();
    el.classList.remove("aoCinemaLoaderOn"); el.removeAttribute("data-kind"); el.setAttribute("aria-hidden","true");
  }
  function syncLoading(s=state()){
    const spec=loadingSpec(s);
    if(!spec){hideLoader();return;}
    if(d.getElementById(BOOT_ID)&&!d.getElementById(BOOT_ID).classList.contains("aoCinemaBootDone")) return;
    if(lastLoadingKey===spec.key&&d.getElementById(LOADER_ID)?.classList.contains("aoCinemaLoaderOn")) return;
    lastLoadingKey=spec.key; win.clearTimeout?.(loaderTimer);
    loaderTimer=win.setTimeout?.(()=>{
      const current=loadingSpec(state()); if(!current||current.key!==spec.key) return;
      const el=d.getElementById(LOADER_ID); if(!el) return;
      q("[data-ao-cinema-loader-title]",el).textContent=current.title; q("[data-ao-cinema-loader-sub]",el).textContent=current.sub;
      el.dataset.kind=current.key; el.classList.add("aoCinemaLoaderOn"); el.setAttribute("aria-hidden","false");
      win.AO_LOADING_DIRECTOR_V1?.adoptLegacy?.(current.key);
    },220);
  }
  const ART_SELECTORS=[".aoProperArt img",".aoRuleModuleHero img",".aoV401RosaryHero img",".aoSaintArtCard img",".aoSaintReaderMedia img","[data-ao-proper-art] img",".aoV4311StationsArt img"];
  function prepArt(img){
    if(!img||img.dataset?.aoCinemaImage==="1") return;
    img.dataset.aoCinemaImage="1"; const host=img.parentElement; host?.classList.add("aoCinemaArt");
    const ready=()=>{img.classList.remove("aoCinemaImagePending","aoCinemaImageError");img.classList.add("aoCinemaImageReady");host?.classList.remove("aoCinemaArt");};
    const fail=()=>{img.classList.remove("aoCinemaImagePending");img.classList.add("aoCinemaImageError");host?.classList.remove("aoCinemaArt");};
    if(img.complete&&img.naturalWidth>0){ready();return;}
    img.classList.add("aoCinemaImagePending"); img.addEventListener?.("load",ready,{once:true}); img.addEventListener?.("error",fail,{once:true});
  }
  function scanArt(root=d){root?.querySelectorAll?.(ART_SELECTORS.join(","))?.forEach(prepArt);}
  function scanPresentation(root=d){scanArt(root);}
  function queuePresentationScan(){win.requestAnimationFrame?.(()=>scanPresentation());}

  function installStore(){
    const st=runtime()?.store;
    if(!st?.dispatch||!st?.subscribe||storeInstalled) return Boolean(storeInstalled);
    storeInstalled=true;
    if(!st.__aoCinematicV4312Wrapped){
      const original=st.dispatch.bind(st);
      st.dispatch=(action)=>{
        const make=routeMeta[action?.type]; if(make) showTransition(make());
        const result=original(action); syncLoading(st.getState()); queuePresentationScan(); return result;
      };
      try{Object.defineProperty(st,"__aoCinematicV4312Wrapped",{value:true,configurable:true});}catch{st.__aoCinematicV4312Wrapped=true;}
    }
    st.subscribe?.(s=>{syncLoading(s);queuePresentationScan();});
    syncLoading(st.getState()); return true;
  }
  function finishBoot(reason="ready"){
    if(bootFinished) return false; bootFinished=true; win.clearTimeout?.(bootWatchdog);
    win.AO_LOADING_DIRECTOR_V1?.endBoot?.();
    const el=d.getElementById(BOOT_ID); if(!el) return false;
    const s=state(),status=q("[data-ao-cinema-boot-status]",el),title=s?.resolution?.proper?.data?.name||s?.resolution?.day?.main?.title||"";
    if(status){status.textContent=title?(title+" · "+L("Ready","Prêt")):L("Ready","Prêt");status.classList.add("ready");}
    win.setTimeout?.(()=>{
      el.classList.add("aoCinemaBootDone"); el.dataset.reason=reason;
      win.setTimeout?.(()=>{el.remove();syncLoading(state());},reduced()?0:720);
    },reduced()?0:260);
    return true;
  }
  function homeReady(){const s=state();return Boolean(s&&d.querySelector?.(".homeScreen")&&!s.resolving&&s.resolution&&(!d.fonts||d.fonts.status==="loaded"));}
  // A suspended requestAnimationFrame must not leave a visible, pointer-blocking
  // launch curtain over an otherwise usable app indefinitely. Keep the usual
  // home-stability path; this independent wall-clock guard is the fallback.
  const bootWatchdog=win.setTimeout?.(()=>finishBoot("guard-timeout"),8000);
  const started=win.performance?.now?.()||Date.now(); let stable=0;
  const bootTick=()=>{
    installStore(); stable=homeReady()?stable+1:0;
    if(stable>=6){finishBoot("home-stable");return;}
    if((win.performance?.now?.()||Date.now())-started>7000){finishBoot("guard-timeout");return;}
    win.requestAnimationFrame?.(bootTick);
  };
  win.requestAnimationFrame?.(bootTick);
  const wait=win.setInterval?.(()=>{if(installStore())win.clearInterval?.(wait);},40);
  win.setTimeout?.(()=>win.clearInterval?.(wait),6000);
  scanPresentation();

  const api=Object.freeze({version:VERSION,showTransition,finishBoot,scanArt,scanPresentation,queuePresentationScan,isReducedMotion:reduced,observerFree:true});
  win.AO_CINEMATIC_V4312=api; win.AO_CINEMATIC_V4311=api;
  return api;
}

if(typeof window!=="undefined"&&typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>installCinematicRuntime(window),{once:true});else installCinematicRuntime(window);}
