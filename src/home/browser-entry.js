import { openMassTextsSheet } from "../mass/mass-texts-sheet.js";
import { ensureLearnModule } from "../learn/lazy-module-registry.js";
import { verifiedH4WeekColour } from "./today-h4-view.js";
import { openH4ChoicesSheet,closeH4ChoicesSheet } from "./today-h4-change-sheet.js";
import { HOME_PRESENTATION_VERSION, renderHome, reconcileTodayHero } from "./presentation.js";
import { loadSharedSanctoralReadModel } from "../calendar/living-sanctoral-read-model.js";

const VERSION="modular-home-v2";

function runtime(win){return win?.AO_RUNTIME_V8??null;}
function state(win){return runtime(win)?.store?.getState?.()??null;}

function closeTransientSurfaces(win){
  try{win?.AO_LEARN_APP_V1?.close?.();}catch{}
  try{win?.AO_CALENDAR_APP_V1?.close?.({surface:"home"});}catch{}
  try{win?.AO_FIND_APP_V1?.close?.();}catch{}
  try{win?.AO_SCRIPTURE_APP_V1?.close?.();}catch{}
  try{win?.AO_INLINE_CUES_V251?.closeGuide?.();}catch{}
  try{win?.AO_RULE_V411?.closeSheet?.();}catch{}
  try{win?.AO_CONTENT_V37?.closeDiagnostics?.();}catch{}
  try{win?.document?.getElementById?.("ao-use-guide-v9")?.remove?.();}catch{}
  try{win?.document?.querySelectorAll?.(".aoArtInfoBackdrop,.aoArtQaBackdrop")?.forEach?.(node=>node.remove?.());}catch{}
  try{win?.AOTraditionalPrayerBook?.close?.({silent:true});}catch{}
  try{win?.AO_UNDERSTAND_MASS?.close?.();}catch{}
  try{win?.AO_TRADITIONAL_CATECHISM?.close?.();}catch{}
  try{win?.AO_DAILY_CATECHISM?.close?.();}catch{}
  try{win?.AO_TRAD_V26?.close?.();}catch{}
  try{win?.AO_EUCHARISTIC_V354?.close?.();}catch{}
  try{win?.AO_V37_SHELL?.close?.();}catch{}
  try{win?.AO_NAV_V25?.closePanel?.();}catch{}
}

function resetCoreRoute(win){
  const store=runtime(win)?.store;
  if(typeof store?.getState!=="function"||typeof store?.dispatch!=="function")return false;
  let s=store.getState();
  if(s?.homeSheet)store.dispatch({type:"home-sheet",sheet:null});
  s=store.getState();
  if(s?.route==="scripture")store.dispatch({type:"scripture-close"});
  s=store.getState();
  if(s?.route==="live")store.dispatch({type:"leave-live"});
  else if(s?.route==="prepare")store.dispatch({type:"leave-prepare"});
  else if(s?.route==="thanksgiving")store.dispatch({type:"leave-thanksgiving"});
  return true;
}

function retireLegacyHomeEnrichers(win){
  try{
    win?.document?.querySelectorAll?.(".aoComingUpV4323,.aoDailyCateHome")?.forEach?.(node=>{
      const active=win?.document?.activeElement;
      if(active&&node.contains?.(active)){try{active.blur?.();}catch{}}
      node.remove?.();
    });
  }catch{}
}

function retireUnresolvedSaintArt(win){
  try{
    win?.document?.querySelectorAll?.(".aoSaintArtCard")?.forEach?.(node=>{
      let data=null;
      try{data=JSON.parse(node?.dataset?.result||"null")}catch{}
      if(!data?.result||data.result.item)return;
      const active=win?.document?.activeElement;
      if(active&&node.contains?.(active)){try{active.blur?.();}catch{}}
      node.remove?.();
    });
  }catch{}
}

function rehydrateRemainingHomeDonors(win){
  // Coming Up and Daily Catechism Home presentation are modular now.
  // Keep unrelated donor services, then physically retire any historical
  // Home cards they recreate as compatibility side effects.
  try{win?.AO_EUCHARISTIC_V354?.ensureHome?.();}catch{}
  try{win?.AO_V37_SHELL?.ensureHome?.();}catch{}
  retireLegacyHomeEnrichers(win);
  retireUnresolvedSaintArt(win);
}

function watchRetiredHomeEnrichers(win,onMutation){
  if(typeof win?.MutationObserver!=="function"||!win?.document?.documentElement)return null;
  const observer=new win.MutationObserver(()=>onMutation?.());
  observer.observe(win.document.documentElement,{subtree:true,childList:true});
  return observer;
}

function root(win){return win?.document?.getElementById?.("app")??null;}

export function createHomeOwner(win=globalThis){
  let unsubscribe=null;
  let retryTimer=null;
  let enricherClicksBound=false;
  let retiredEnricherObserver=null;
  let inlineCalendarView=null;
  let inlineCalendarRestoring=false;
  let requestedDailyHonours=false;
  const weekColourCache=new Map(),weekColourPending=new Map();
  function hydrateH4WeekColours(current){
    const screen=win?.document?.querySelector?.(".homeScreen.aoTodayH4");
    if(!screen)return;
    const dots=[...screen.querySelectorAll("[data-home-week-colour]")];
    const apply=(date,col)=>{
      const latest=win?.document?.querySelector?.(".homeScreen.aoTodayH4");
      if(!latest)return;
      for(const dot of latest.querySelectorAll("[data-home-week-colour]")){
        if(dot.dataset.homeWeekColour!==date)continue;
        if(col){dot.style.setProperty("--ao-h4-day-colour",col);dot.dataset.verifiedColour=col;}
        else {dot.style.removeProperty("--ao-h4-day-colour");delete dot.dataset.verifiedColour;}
      }
    };
    for(const dot of dots){
      const date=dot.dataset.homeWeekColour;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date??""))continue;
      if(weekColourCache.has(date)){apply(date,weekColourCache.get(date));continue;}
      const selected=current?.resolution?.date===date?
        verifiedH4WeekColour(current.resolution,date):null;
      if(selected){weekColourCache.set(date,selected);apply(date,selected);continue;}
      if(weekColourPending.has(date))continue;
      const resolver=runtime(win)?.resolver;
      if(typeof resolver?.resolveDay!=="function")continue;
      const task=Promise.resolve().then(()=>resolver.resolveDay(date))
        .then(resolved=>{
          const colour=verifiedH4WeekColour(resolved,date);
          weekColourCache.set(date,colour);
          apply(date,colour);
        })
        .catch(()=>{weekColourCache.set(date,null);apply(date,null);})
        .finally(()=>weekColourPending.delete(date));
      weekColourPending.set(date,task);
    }
  }

  function ensureRetiredEnricherWatch(){
    if(retiredEnricherObserver)return;
    retiredEnricherObserver=watchRetiredHomeEnrichers(win,()=>{
      if(state(win)?.route==="home"){
        retireLegacyHomeEnrichers(win);
        retireUnresolvedSaintArt(win);
        // The historical Home donor may repaint #app asynchronously while the
        // current destination remains Today. Restore the *same* shared Calendar
        // in the new slot rather than losing Year/Month to a silent DOM swap.
        if(inlineCalendarView&&!inlineCalendarRestoring){
          const screen=win?.document?.querySelector?.(".homeScreen.aoTodayV2");
          const slot=screen?.querySelector?.("[data-home-calendar-inline]");
          const calendar=slot?.querySelector?.("#ao-calendar-modular-root");
          const intact=Boolean(calendar?.isConnected&&!slot.hidden&&
            screen?.dataset?.aoHomeCalendarView===inlineCalendarView);
          if(slot&&!intact){
            inlineCalendarRestoring=true;
            queueMicrotask(()=>{
              if(!inlineCalendarView||state(win)?.route!=="home"){
                inlineCalendarRestoring=false;return;
              }
              Promise.resolve(openHomeCalendar(inlineCalendarView))
                .finally(()=>{inlineCalendarRestoring=false});
            });
          }
        }
      }
    });
    retireLegacyHomeEnrichers(win);
    retireUnresolvedSaintArt(win);
  }

  function bindEnricherClicks(){
    if(enricherClicksBound||typeof win?.document?.addEventListener!=="function")return;
    win.document.addEventListener("click",onEnricherClick,true);
    enricherClicksBound=true;
  }

  function routeAccepted(value){
    return value===true||value?.ok===true;
  }

  function showRouteError(id,trigger){
    // Do not turn an unsuccessful deep link into an unrelated Prayer hub.
    if(state(win)?.route!=="home")return;
    const screen=win?.document?.querySelector?.(".homeScreen");
    const doc=win?.document;
    if(!screen||typeof doc?.createElement!=="function")return;
    const previous=trigger?.closest?.("[data-home-shortcut-error]")??null;
    const anchor=previous?.parentElement??(screen.contains?.(trigger)?trigger?.parentElement:null)??screen;
    screen.querySelectorAll?.("[data-home-shortcut-error]")?.forEach?.(node=>node.remove?.());
    const fr=state(win)?.language==="fr";
    const box=doc.createElement("div");
    box.dataset.homeShortcutError=id;
    box.setAttribute("role","alert");
    box.style.cssText="margin:10px 0;padding:12px;border:1px solid var(--ao-rule,#56524c);border-radius:10px;color:inherit;background:var(--ao-bg-canvas,#080c12);font:inherit";
    const message=doc.createElement("span");
    message.textContent=fr
      ?"Impossible d’ouvrir le contenu demandé. Vous pouvez réessayer."
      :"The requested item could not be opened. You can retry.";
    const retry=doc.createElement("button");
    retry.type="button";
    retry.dataset.homeShortcutRetry=id;
    retry.textContent=fr?"Réessayer":"Retry";
    retry.style.cssText="display:block;margin-top:9px;min-height:44px;padding:8px 16px;color:inherit;background:transparent;border:1px solid var(--ao-rule,#56524c);border-radius:8px";
    box.append(message,retry);
    anchor.appendChild(box);
  }

  function clearRouteError(){
    win?.document?.querySelectorAll?.(".homeScreen [data-home-shortcut-error]")?.forEach?.(node=>node.remove?.());
  }

  function navigateHomeShortcut(surface,{trigger=null,routeId=surface}={}){
    // An unsuccessful shell navigation is not a successful click. Preserve
    // the selected target and provide a visible retry on the Home card.
    return Promise.resolve().then(()=>win?.AO_APP_SHELL_V1?.navigate?.(surface))
      .then(result=>{
        if(routeAccepted(result)){clearRouteError();return true;}
        showRouteError(routeId,trigger);
        return false;
      }).catch(error=>{
        try{win?.console?.error?.("Home destination unavailable",surface,error)}catch{}
        showRouteError(routeId,trigger);
        return false;
      });
  }

  function openRoute(route,{trigger=null}={}){
    const id=String(route??"");
    if(!id)return false;
    if(id==="mass.current")return navigateHomeShortcut("mass",{trigger,routeId:id});
    if(id==="today.calendar"||id==="calendar")return navigateHomeShortcut("calendar",{trigger,routeId:id});
    if(id==="find.traditions")return navigateHomeShortcut("calendar",{trigger,routeId:"calendar"}); // backward-compatible bookmark; no Atlas
    if(["settings","find","mass","calendar"].includes(id))return navigateHomeShortcut(id,{trigger,routeId:id});
    if(id.startsWith("pray.")||id.startsWith("learn.")){
      const exactFallback=()=>{
        try{
          if(id.startsWith("pray.")){
            // Only the requested canonical route is a valid fallback; never
            // substitute AO_PRAY_APP_V1.open(), which opens the generic hub.
            return win?.AO_PRAY_V435930?.open?.(id,{trigger})??false;
          }
          return win?.AO_LEARN_APP_V1?.openModule?.(id)??false;
        }catch(error){
          try{win?.console?.error?.("Home exact-route fallback failed",id,error)}catch{}
          return false;
        }
      };
      const finish=value=>{
        if(routeAccepted(value)){clearRouteError();return true;}
        showRouteError(id,trigger);
        return false;
      };
      const fallback=()=>Promise.resolve(exactFallback()).then(finish).catch(error=>{
        try{win?.console?.error?.("Home exact-route fallback rejected",id,error)}catch{}
        return finish(false);
      });
      try{
        const registry=win?.AO_MODULES;
        if(typeof registry?.open!=="function")return fallback();
        // A Promise is not a successful open. Require a positive result
        // from the requested module, including cold-load failures.
        return Promise.resolve(registry.open(id)).then(value=>
          routeAccepted(value)?finish(value):fallback()
        ).catch(error=>{
          try{win?.console?.error?.("Home module route failed",id,error)}catch{}
          return fallback();
        });
      }catch(error){
        try{win?.console?.error?.("Home module route failed",id,error)}catch{}
        return fallback();
      }
    }
    try{return win?.AO_MODULES?.open?.(id)??false;}catch{return false;}
  }

  function showHomeToday(){
    inlineCalendarView=null;
    const screen=win?.document?.querySelector?.(".homeScreen.aoTodayV2");
    if(screen){
      try{win?.AO_CALENDAR_APP_V1?.close?.({surface:"home"})}catch{}
      delete screen.dataset.aoHomeCalendarView;
      const slot=screen.querySelector("[data-home-calendar-inline]");
      if(slot)slot.hidden=true;
    }
    paint(state(win));
    return true;
  }
  async function openHomeCalendar(view="picker",date=null){
    if(!["day","picker","year"].includes(view))view="picker";
    const screen=win?.document?.querySelector?.(".homeScreen.aoTodayV2");
    const slot=screen?.querySelector?.("[data-home-calendar-inline]");
    if(!screen||!slot||state(win)?.route!=="home")return false;
    inlineCalendarView=view;
    slot.hidden=false;
    screen.dataset.aoHomeCalendarView=view;
    for(const button of screen.querySelectorAll(".aoTodayV2Tabs [aria-current]"))
      button.removeAttribute("aria-current");
    const selectedTab=screen.querySelector('.aoTodayV2Tabs [data-home-calendar-view="'+view+'"]');
    selectedTab?.setAttribute("aria-current","page");
    // H4 intentionally has no always-visible tabs on Today. In the Calendar
    // subview, retain the canonical Day / Month / Liturgical Year selector.
    for(const button of screen.querySelectorAll(".aoH4CalendarViews [data-home-calendar-view]")){
      if(button.dataset.homeCalendarView===view)button.setAttribute("aria-current","page");
      else button.removeAttribute("aria-current");
    }
    const api=win?.AO_CALENDAR_APP_V1;
    const opened=await api?.openEmbedded?.(slot,{view,onClose:()=>{
      if(inlineCalendarView)showHomeToday();
    }});
    if(opened!==true){showHomeToday();return false}
    if(date&&/^\d{4}-\d{2}-\d{2}$/.test(date))await api.select?.(date,{closeAfter:false});
    return true;
  }

  function onEnricherClick(event){
    const target=event?.target;
    const retry=target?.closest?.("[data-home-shortcut-retry]");
    if(retry){
      event.preventDefault?.();
      if(retry.dataset?.homeShortcutRetry==="home.did-you-know"){
        const exact=win?.document?.querySelector?.(".homeScreen [data-home-dyk-entry]");
        if(exact&&!exact.disabled){exact.click();return;}
      }
      void openRoute(retry.dataset?.homeShortcutRetry,{trigger:retry});
      return;
    }
    const resumeMass=target?.closest?.("[data-resume-mass]");
    if(resumeMass){
      event.preventDefault?.();
      event.stopImmediatePropagation?.();
      // This is the only Home control authorized to restore an active R17
      // checkpoint. Follow Mass and the ribbon Mass icon always prepare.
      void Promise.resolve(win?.AO_APP_SHELL_V1?.navigate?.("mass",{resume:true}))
        .then(result=>{
          if(routeAccepted(result)){clearRouteError();return;}
          showRouteError("mass.resume",resumeMass);
        }).catch(error=>{
          try{win?.console?.error?.("Mass resume unavailable",error)}catch{}
          showRouteError("mass.resume",resumeMass);
        });
      return;
    }
    const h4Begin=target?.closest?.("[data-home-h4-begin]");
    if(h4Begin){
      event.preventDefault?.();event.stopImmediatePropagation?.();
      if(h4Begin.disabled)return;
      const current=state(win);
      if(current?.route!=="home"||current?.resolving||
         current?.resolution?.proper?.status!=="ready"||
         (current.resolution.date&&current.resolution.date!==current.selectedDate)){
        showRouteError("mass.unavailable",h4Begin);return;
      }
      h4Begin.disabled=true;
      void Promise.resolve(win?.AO_R17_BROWSER_ENTRY?.startFromToday?.())
        .then(result=>{
          if(result?.ok===true){clearRouteError();return;}
          showRouteError("mass.begin",h4Begin);
        }).catch(error=>{
          try{win?.console?.error?.("Today R17 Mass entry rejected",error)}catch{}
          showRouteError("mass.begin",h4Begin);
        }).finally(()=>{if(h4Begin.isConnected)h4Begin.disabled=false});
      return;
    }
    const h4Change=target?.closest?.("[data-home-h4-change]");
    if(h4Change){
      event.preventDefault?.();event.stopImmediatePropagation?.();
      // The Change sheet is a presentation of R17's one existing preflight.
      // Alternative Mass/Proper selection still goes through the host resolver.
      const opened=openH4ChoicesSheet(win,{
        onOtherMass:()=>{void navigateHomeShortcut("mass",{trigger:h4Change,routeId:"mass.choices"});},
        onDone:()=>{
          if(state(win)?.route!=="home")return;
          // The modal is now removed and Home re-paints from canonical R17 state.
          // Restore keyboard focus to the fresh Change trigger, not the detached
          // button that opened the dialog (and do not scroll the phone viewport).
          if(paint(state(win))){
            const trigger=win?.document?.querySelector?.(".homeScreen.aoTodayH4 [data-home-h4-change]");
            try{trigger?.focus?.({preventScroll:true});}catch{trigger?.focus?.();}
          }
        },
      });
      if(!opened)void navigateHomeShortcut("mass",{trigger:h4Change,routeId:"mass.choices"});
      return;
    }
    const h4Readings=target?.closest?.("[data-home-h4-readings]");
    if(h4Readings){
      event.preventDefault?.();event.stopImmediatePropagation?.();
      const current=state(win),resolved=current?.resolution;
      const proper=resolved?.proper?.status==="ready"&&
        (!resolved.date||resolved.date===current.selectedDate)?resolved.proper.data:null;
      const fr=current?.language==="fr";
      const title=fr?(proper?.nameFr||proper?.name||resolved?.day?.main?.title):
        (proper?.name||resolved?.day?.main?.title);
      const sheet=openMassTextsSheet(win.document,{
        proper,language:fr?"fr":"en",date:current?.selectedDate,
        title,sourceReady:Boolean(proper),opener:h4Readings});
      if(!sheet)showRouteError("mass.readings",h4Readings);
      return;
    }
    const massEntry=target?.closest?.("[data-home-mass-entry]");
    if(massEntry){
      event.preventDefault?.();
      event.stopImmediatePropagation?.();
      void navigateHomeShortcut("mass",{trigger:massEntry,routeId:"mass.current"});
      return;
    }
    // The modular Today Home retains the canonical 1962 Calendar's Mass
    // I/II/III chooser. Unlike the legacy Home, it has a separate DOM root:
    // delegate the visible button to the *existing* host resolver rather
    // than building another Mass catalogue or guessing a donor from labels.
    const formulary=target?.closest?.(".homeScreen.aoTodayV2 [data-formulary]");
    if(formulary){
      event.preventDefault?.();
      event.stopImmediatePropagation?.();
      const rt=runtime(win),current=state(win);
      const date=current?.selectedDate,index=Number(formulary.dataset.formulary);
      const options=current?.resolution?.day?.massOptions??[];
      const selected=options.find(x=>x.index===index);
      const existing=rt?.resolver?.formularies;
      const resolve=rt?.controller?.home?.resolve;
      if(current?.route!=="home"||current?.resolving||
         current?.resolution?.status!=="ready"||current.resolution.date!==date||
         !Number.isInteger(index)||!selected?.path||
         typeof existing?.set!=="function"||typeof resolve!=="function"){
        showRouteError("calendar.formulary",formulary);
        return;
      }
      existing.set(date,index);
      void Promise.resolve(rt.controller.home.resolve(date)).then(()=>{
        const latest=state(win);
        if(latest?.selectedDate!==date||latest?.resolution?.date!==date||
           latest?.resolution?.day?.selectedMassOption?.path!==selected.path)
          showRouteError("calendar.formulary",formulary);
      }).catch(error=>{
        try{win?.console?.error?.("1962 source formulary selection failed",error)}catch{}
        showRouteError("calendar.formulary",formulary);
      });
      return;
    }
    const restoreToday=target?.closest?.("[data-home-restore-today]");
    if(restoreToday){
      event.preventDefault?.();event.stopImmediatePropagation?.();
      // Calendar navigation deliberately retains its selected date so users
      // can inspect its Mass from Home. Reset only on this explicit command,
      // never as a side effect of closing the embedded Calendar.
      if(state(win)?.route==="home"){
        const now=new Date();
        const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),
          String(now.getDate()).padStart(2,"0")].join("-");
        if(state(win)?.selectedDate!==today){
          // The store action changes selectedDate but does NOT resolve the
          // corresponding 1962 Proper. Use the canonical Calendar selector:
          // it invalidates stale Home resolution work and commits the matching
          // day and Proper atomically, even after the embedded view is closed.
          const select=win?.AO_CALENDAR_APP_V1?.select;
          if(typeof select!=="function"){showRouteError("calendar.today",restoreToday);return;}
          void Promise.resolve(select(today,{closeAfter:false}))
            .then(ok=>{if(ok!==true)showRouteError("calendar.today",restoreToday);})
            .catch(error=>{
              try{win?.console?.error?.("Return to today's Calendar day failed",error)}catch{}
              showRouteError("calendar.today",restoreToday);
            });
        }
      }
      return;
    }
    const prayerJump=target?.closest?.("[data-home-prayer-jump]");
    if(prayerJump){
      event.preventDefault?.();event.stopImmediatePropagation?.();
      if(state(win)?.route!=="home")return;
      if(inlineCalendarView)showHomeToday();
      const jump=()=>{
        const area=win?.document?.getElementById?.("ao-home-prayer-through-day");
        area?.scrollIntoView?.({block:"start",behavior:win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?"auto":"smooth"});
        area?.focus?.({preventScroll:true});
      };
      (win?.queueMicrotask?.bind(win)||queueMicrotask)(jump);
      return;
    }
    const calendarGlossary=target?.closest?.("[data-home-calendar-glossary]");
    if(calendarGlossary){
      event.preventDefault?.();event.stopImmediatePropagation?.();
      const button=win?.document?.querySelector?.("#ao-calendar-modular-root [data-cal-glossary]");
      button?.click?.();
      return;
    }
    const backToday=target?.closest?.("[data-home-calendar-today]");
    if(backToday){event.preventDefault?.();event.stopImmediatePropagation?.();showHomeToday();return}
    const calendar=target?.closest?.("[data-home-calendar]");
    if(calendar){
      event.preventDefault?.();event.stopImmediatePropagation?.();
      const view=calendar.dataset?.homeCalendarView||"picker";
      const date=calendar.dataset?.homeCalendarDate||null;
      void openHomeCalendar(view,date).then(ok=>{
        if(!ok)showRouteError("calendar",calendar);
      });
      return;
    }
    const settings=target?.closest?.("[data-home-settings]");
    if(settings){
      event.preventDefault?.();
      event.stopImmediatePropagation?.();
      void navigateHomeShortcut("settings",{trigger:settings,routeId:"settings"});
      return;
    }
    const find=target?.closest?.("[data-home-find]");
    if(find){
      event.preventDefault?.();
      event.stopImmediatePropagation?.();
      void navigateHomeShortcut("find",{trigger:find,routeId:"find"});
      return;
    }
    const dyk=target?.closest?.("[data-home-dyk-open]");
    if(dyk){
      event.preventDefault?.();event.stopImmediatePropagation?.();
      const entryId=dyk.dataset?.homeDykEntry;
      if(!/^G\d{3}$/.test(String(entryId??""))||dyk.disabled){
        showRouteError("home.did-you-know",dyk);return;
      }
      // The source-owning bilingual Glossary opens the exact cited concept;
      // no generic Learn hub and no independent Home fact detail.
      void Promise.resolve().then(()=>ensureLearnModule("learn.glossary",win))
        .then(()=>win?.AO_GLOSSARY_V1?.open?.({entryId,origin:"context",trigger:dyk}))
        .then(opened=>{
          if(opened===true){clearRouteError();return;}
          showRouteError("home.did-you-know",dyk);
        }).catch(error=>{
          try{win?.console?.error?.("Did You Know source unavailable",error)}catch{}
          showRouteError("home.did-you-know",dyk);
        });
      return;
    }
    const daily=target?.closest?.("[data-home-daily-catechism]");
    if(daily){
      event.preventDefault?.();
      try{
        const opened=win?.AO_DAILY_CATECHISM?.open?.();
        if(opened===undefined||opened===false)showRouteError("today.daily-catechism",daily);
      }catch(error){
        win?.console?.error?.("Daily Catechism could not open",error);
        showRouteError("today.daily-catechism",daily);
      }
      return;
    }
    const dynamic=target?.closest?.("[data-home-cu-dynamic]");
    if(dynamic){
      event.preventDefault?.();
      event.stopImmediatePropagation?.();
      const id=dynamic.dataset?.homeCuDynamic;
      if(id==="dynamic.free"){void openRoute("pray.library",{trigger:dynamic});return;}
      // Contextual Prayer actions use the same canonical reader as the
      // Prayers catalogue. The legacy Daily Rule is a tracking service,
      // not a second devotional rendering owner.
      const canonicalRoute=dynamic.dataset?.homeCuRoute||
        (/^angelus\.(morning|noon|evening)$/.test(id)?"pray.angelus_regina":null);
      if(String(canonicalRoute??"").startsWith("pray.")){
        void openRoute(canonicalRoute,{trigger:dynamic});
        return;
      }
      try{if(win?.AO_RULE_V411?.openDynamic?.(id))return;}catch{}
      void openRoute(dynamic.dataset?.homeCuRoute,{trigger:dynamic});
      return;
    }
    const stat=target?.closest?.("[data-home-cu-static]");
    if(stat){
      event.preventDefault?.();
      event.stopImmediatePropagation?.();
      const id=stat.dataset?.homeCuStatic||"";
      // All Home daily-prayer shortcuts have the same canonical reader as
      // the Prayers catalogue. AO_RULE_V411.openStatic() presents a competing
      // legacy sheet and must not intercept a devotional reading session.
      const routes={
        rosary:"pray.rosary",
        angelus:"pray.angelus_regina",
        morning:"pray.morning_evening",
        evening:"pray.morning_evening",
        examen:"pray.nightly_examen",
      };
      const canonical=routes[id];
      if(canonical){
        void openRoute(canonical,{trigger:stat});
      }else{
        // Unknown practice is not a prayer route; retain its original
        // tracking action rather than opening an unrelated Prayer hub.
        try{win?.AO_RULE_V411?.openStatic?.(id)}catch(error){
          win?.console?.error?.("Home Daily Rule unavailable",error);
          showRouteError(id,stat);
        }
      }
      return;
    }
    const route=target?.closest?.("[data-home-cu-route]");
    if(route){
      event.preventDefault?.();
      void openRoute(route.dataset?.homeCuRoute,{trigger:route});
      return;
    }
    const all=target?.closest?.("[data-home-cu-all]");
    if(all){
      event.preventDefault?.();
      void navigateHomeShortcut("calendar",{trigger:all,routeId:"calendar"});
    }
  }

  function markOwner(){
    const screen=win?.document?.querySelector?.(".homeScreen")??null;
    if(screen?.dataset){
      screen.dataset.aoHomeOwner=VERSION;
      screen.dataset.aoHomePresentationOwner=HOME_PRESENTATION_VERSION;
    }
    return screen;
  }

  function paint(next=state(win)){
    if(next?.route!=="home")return false;
    if(inlineCalendarView&&win?.document?.querySelector?.(".homeScreen.aoTodayV2 [data-home-calendar-inline]"))return true;
    const appRoot=root(win);
    if(!appRoot)return false;
    const rendered=renderHome(appRoot,next,win);
    if(!rendered)return false;
    markOwner();
    hydrateH4WeekColours(next);
    // Lazy on resolved Home only. Calendar and Home reuse the exact same
    // read model and network request; no second modern saint resolver.
    if(!requestedDailyHonours&&next?.resolution?.day?.main&&!next?.resolving){
      requestedDailyHonours=true;
      const fetcher=typeof win?.fetch==="function"?win.fetch.bind(win):null;
      void loadSharedSanctoralReadModel(fetcher).then(model=>{
        if(model&&state(win)?.route==="home"&&!inlineCalendarView)
          paint(state(win));
      });
    }
    const queue=typeof win?.queueMicrotask==="function"?win.queueMicrotask.bind(win):queueMicrotask;
    queue(()=>{rehydrateRemainingHomeDonors(win);reconcileTodayHero(appRoot)});
    return true;
  }

  function attachPresentation(){
    if(unsubscribe)return true;
    const store=runtime(win)?.store;
    if(typeof store?.getState!=="function"||typeof store?.subscribe!=="function"){
      if(typeof win?.setTimeout==="function"&&!retryTimer){
        retryTimer=win.setTimeout(()=>{retryTimer=null;attachPresentation();},80);
      }
      return false;
    }
    unsubscribe=store.subscribe(next=>{if(next?.route==="home")paint(next);else closeH4ChoicesSheet(win);});
    paint(store.getState());
    return true;
  }

  function open(){
    // In-page Calendar is still the Home destination. Boot/enricher owners can
    // request Home again during first-use Calendar resolution: that is not an
    // instruction to discard the user's selected Year or Month view.
    if(inlineCalendarView&&state(win)?.route==="home"){
      const slot=win?.document?.querySelector?.(".homeScreen.aoTodayV2 [data-home-calendar-inline]");
      if(slot){
        ensureRetiredEnricherWatch();
        attachPresentation();
        if(!slot.querySelector("#ao-calendar-modular-root"))
          void openHomeCalendar(inlineCalendarView);
        markOwner();
        return true;
      }
    }
    inlineCalendarView=null;
    closeTransientSurfaces(win);
    resetCoreRoute(win);
    try{win?.AO_SETTINGS_APP_V1?.restoreHome?.();}catch{}
    ensureRetiredEnricherWatch();
    attachPresentation();
    paint(state(win));
    const visible=markOwner();
    if(!visible)return false;
    try{win?.AO_APP_SHELL_V1?.syncSurface?.("home");}catch{}
    return true;
  }

  function status(){
    const screen=win?.document?.querySelector?.(".homeScreen")??null;
    return Object.freeze({
      version:VERSION,
      installed:true,
      visibleOwner:screen?.dataset?.aoHomeOwner??null,
      presentationOwner:screen?.dataset?.aoHomePresentationOwner??null,
      presentationAttached:Boolean(unsubscribe),
      route:state(win)?.route??null,
      donorHomeAvailable:typeof win?.AO_NAV_V362?.home==="function",
      enrichersOwner:screen?.querySelector?.("[data-ao-home-enricher-owner]")?.dataset?.aoHomeEnricherOwner??null,
    });
  }

  function dispose(){
    closeH4ChoicesSheet(win);
    try{unsubscribe?.();}catch{}
    unsubscribe=null;
    if(retryTimer&&typeof win?.clearTimeout==="function")win.clearTimeout(retryTimer);
    retryTimer=null;
    if(enricherClicksBound){
      try{win?.document?.removeEventListener?.("click",onEnricherClick,true);}catch{}
      enricherClicksBound=false;
    }
    try{retiredEnricherObserver?.disconnect?.();}catch{}
    retiredEnricherObserver=null;
  }

  bindEnricherClicks();
  ensureRetiredEnricherWatch();
  attachPresentation();
  return Object.freeze({version:VERSION,open,paint,status,dispose});
}

export function installHomeBrowserOwner(win=globalThis){
  if(win?.AO_HOME_APP_V1)return win.AO_HOME_APP_V1;
  const api=createHomeOwner(win);
  win.AO_HOME_APP_V1=api;
  return api;
}

if(typeof window!=="undefined"&&typeof document!=="undefined"){
  installHomeBrowserOwner(window);
}
