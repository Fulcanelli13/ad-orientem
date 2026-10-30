import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

// Genuine modular app, not the H1.1 HTML review harness or a mocked Home.
// Output is a review artifact, never a published liturgical source.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/home-h11-acceptance");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",".json":"application/json",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg",".jpeg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
  try{
    const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+name);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4381,"127.0.0.1",ok);});
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const size of [{width:390,height:844},{width:320,height:568}]){
    const context=await browser.newContext({viewport:size,deviceScaleFactor:1,isMobile:true,hasTouch:true,
      locale:"en-GB",colorScheme:"dark",serviceWorkers:"block"});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",error=>errors.push(String(error?.message??error)));
    const prefix=size.width===390?"390":"320";
    await page.goto("http://127.0.0.1:4381/index.html",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible",timeout:30000});
    await page.waitForFunction(()=>{
      const boot=document.getElementById("ao-cinema-boot");
      const ready=!boot||boot.hidden||getComputedStyle(boot).display==="none"||
        getComputedStyle(boot).pointerEvents==="none";
      return ready && Boolean(globalThis.AO_SETTINGS_DONOR_V4359?.setPath) &&
        Boolean(globalThis.AO_APP_LITURGICAL_THEME_V1?.status?.());
    },null,{timeout:35000});

    const mode=async value=>{
      await page.evaluate(value=>globalThis.AO_SETTINGS_DONOR_V4359.setPath("appearance.mode",value),value);
      await page.waitForFunction(value=>document.documentElement.dataset.aoAppearanceV1===value,
        value,{timeout:10000});
      return page.evaluate(()=>({
        effective:document.documentElement.dataset.aoAppearanceV1,
        chosen:document.documentElement.dataset.aoAppearanceChoiceV1,
        bg:getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
      }));
    };
    const inspect=async label=>{
      const state=await page.evaluate(()=>({
        width:innerWidth,documentWidth:document.documentElement.scrollWidth,
        sections:[...document.querySelectorAll(".homeScreen.aoTodayV2 .aoTodayV2PrayNow, .homeScreen.aoTodayV2 .aoTodayV2CalendarGlance")].map(x=>x.className),
        selected:document.querySelectorAll(".homeScreen.aoTodayV2 .dateRail .dayCell.selected").length,
        week:document.querySelectorAll(".homeScreen.aoTodayV2 .dateRail .dayCell").length,
        primary:document.querySelectorAll(".homeScreen.aoTodayV2 [data-home-mass-entry],.homeScreen.aoTodayV2 [data-resume-mass]").length,
        appearance:document.documentElement.dataset.aoAppearanceV1
      }));
      assert.ok(state.documentWidth<=state.width+2,label+" horizontal overflow: "+JSON.stringify(state));
      assert.equal(state.week,7,label+" must retain the actual selected-date week rail");
      assert.equal(state.selected,1,label+" must have one selected day");
      assert.ok(state.sections[0]?.includes("aoTodayV2PrayNow") &&
        state.sections[1]?.includes("aoTodayV2CalendarGlance"),label+" should put Prayer above Calendar");
      assert.equal(state.primary,1,label+" must have exactly one Mass entry or Resume action");
      const ribbon=await page.evaluate(()=>{
        const nav=document.querySelector("#ao-global-ribbon .aoGlobalRibbonInner");
        const active=[...document.querySelectorAll("#ao-global-ribbon [data-ao-app-surface]")];
        const donor=document.querySelector('#ao-global-ribbon [data-ao-app-secondary="mass"]');
        return {items:active.map(b=>b.dataset.aoAppSurface),
          columns:getComputedStyle(nav).gridTemplateColumns.split(" ").filter(Boolean).length,
          massVisible:!!donor&&getComputedStyle(donor).display!=="none",
          massFocusable:!!donor?.hasAttribute("data-ao-app-surface"),
          navScroll:nav.scrollWidth-nav.clientWidth};
      });
      assert.deepEqual(ribbon.items,["home","pray","learn","find"],
        label+" must have Today/Pray/Formation/Explore only");
      assert.equal(ribbon.columns,4,label+" still reserves a fifth Mass slot");
      assert.equal(ribbon.massVisible,false,label+" Mass donor icon is visible");
      assert.equal(ribbon.massFocusable,false,label+" hidden Mass still owns a navigation action");
      assert.ok(ribbon.navScroll<=1,label+" ribbon overflows 320/390px phone width");
      return state;
    };
    // H3 Today editorial migration: the existing source-owned sections now
    // consume shared cards/rows. Do not replace Prayer or Calendar actions.
    const editorial=async label=>{
      const info=await page.evaluate(()=>{
        const home=document.querySelector(".homeScreen.aoTodayV2");
        const card=home.querySelector(".aoTodayV2CalendarGlance");
        const reflect=home.querySelector(".aoTodayV2ReadReflect");
        const custom=home.querySelector(".aoTodayV2CustomSpotlight");
        const background=el=>getComputedStyle(el).backgroundColor;
        return {token:getComputedStyle(home).getPropertyValue("--ao-tcm-card-radius").trim(),
          calendar:background(card),reflection:background(reflect),
          custom:custom?background(custom):null,
          radius:getComputedStyle(card).borderRadius,
          appointmentNote:card.querySelector(".aoTodayV2GlanceNote")?.textContent||"",
          calendarRows:card.querySelectorAll(".aoTodayV2Event.aoTcmRow").length,
          readRows:reflect.querySelectorAll(".aoTodayV2EditorialRow.aoTcmRow").length,
          saint:reflect.querySelectorAll('[data-home-calendar-view="day"]').length,
          gospel:reflect.querySelectorAll('[data-action="gospel"]').length,
          catechism:reflect.querySelectorAll("[data-home-daily-catechism]").length,
          scripture:reflect.querySelectorAll("[data-home-scripture]").length,
          prayer:home.querySelectorAll('[data-home-cu-route="pray.rosary"]').length,
          footer:home.querySelectorAll(".aoTodayExploreFoot button").length,
          footerColumns:getComputedStyle(home.querySelector(".aoTodayExploreFoot")).gridTemplateColumns,
          totalWidth:document.documentElement.scrollWidth,viewport:innerWidth};
      });
      assert.equal(info.token,"18px",label+" missing shared kit");
      assert.equal(info.radius,"18px",label+" calendar card has not migrated");
      assert.equal(info.calendar,info.reflection,label+" editorial cards should share a surface");
      if(info.custom)assert.equal(info.custom,info.calendar,label+" optional Customs card must share surface");
      assert.ok(info.calendarRows<=2,label+" upcoming calendar must not invent additional dates");
      assert.equal(info.readRows,4,label+" reflection rows changed");
      assert.deepEqual([info.saint,info.gospel,info.catechism,info.scripture,info.prayer,info.footer],
        [1,1,1,1,1,2],label+" changed an existing route");
      assert.match(info.appointmentNote,/calendar appointments|dates annoncées/i,
        label+" removed the observed-date caveat");
      assert.ok(info.totalWidth<=info.viewport+2,label+" horizontal overflow");
      return info;
    };
    assert.equal((await mode("dark")).effective,"dark");
    await inspect(prefix+" dark Today");
    const darkEditorial=await editorial(prefix+" dark Today");
    await page.screenshot({path:resolve(output,prefix+"-today-dark.png")});
    const light=await mode("light");
    assert.equal(light.bg,"#F6F2EA","Light appearance must use the shared foundation");
    await inspect(prefix+" light Today");
    const lightEditorial=await editorial(prefix+" light Today");
    assert.notEqual(lightEditorial.calendar,darkEditorial.calendar,
      "Calendar/Reflection card backgrounds must respond to light/dark appearance");
    await page.screenshot({path:resolve(output,prefix+"-today-light.png")});

    // A real Settings control must exist; an appearance mode is not merely CSS.
    await page.locator(".homeScreen [data-home-settings]").click();
    await page.waitForSelector('#ao-settings-modular-root [data-settings-route="/settings/accessibility"]',{timeout:15000});
    await page.locator('#ao-settings-modular-root [data-settings-route="/settings/accessibility"]').click();
    await page.waitForSelector('#ao-settings-modular-root [data-pref-path="appearance.mode"][data-pref-value="auto"]');
    await page.locator('#ao-settings-modular-root [data-pref-path="appearance.mode"][data-pref-value="auto"]').click();
    await page.waitForFunction(()=>document.documentElement.dataset.aoAppearanceChoiceV1==="auto");
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.aoAppearanceV1),"dark",
      "Auto must follow the current dark device");
    await page.emulateMedia({colorScheme:"light"});
    await page.waitForFunction(()=>document.documentElement.dataset.aoAppearanceV1==="light");
    await page.screenshot({path:resolve(output,prefix+"-settings-auto-light.png")});
    await page.evaluate(()=>globalThis.AO_SETTINGS_APP_V1?.close?.());
    await page.waitForSelector(".homeScreen.aoTodayV2",{state:"visible"});

    await page.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359.setPath("general.uiLanguage","fr"));
    await page.waitForFunction(()=>document.querySelector(".homeScreen.aoTodayV2")?.dataset?.homeLanguage==="fr");
    assert.match(await page.locator(".aoTodayV2ReadReflect .aoTodayV2SectionHead h2").innerText(),
      /Lire et méditer/,"Today reflection heading is not French");
    await editorial(prefix+" French Today");
    await page.locator('.aoTodayV2Tabs [data-home-calendar-view="picker"]').click();
    await page.waitForSelector('.aoTodayV2[data-ao-home-calendar-view="picker"] #ao-calendar-modular-root',{state:"attached",timeout:30000});
    await page.screenshot({path:resolve(output,prefix+"-month-light-fr.png")});
    await page.locator('.aoTodayV2Tabs [data-home-calendar-view="year"]').click();
    await page.waitForSelector('.aoTodayV2[data-ao-home-calendar-view="year"] #ao-calendar-modular-root',{state:"attached",timeout:30000});
    await page.screenshot({path:resolve(output,prefix+"-year-light-fr.png")});

    assert.equal(errors.length,0,"Unexpected H1.1 browser errors: "+JSON.stringify(errors));
    console.log("PASS H1.1 "+prefix+"px dark/light/auto Settings and embedded Calendar: "+JSON.stringify(light));
    // H4 is a review-only source projection; test it on the genuine app,
    // not the supplied prototype harness. The production H3 remains default.
    const h4=await context.newPage(),h4Errors=[];
    h4.on("pageerror",error=>h4Errors.push(String(error?.message??error)));
    await h4.goto("http://127.0.0.1:4381/index.html?aoTodayH4=1",{waitUntil:"domcontentloaded",timeout:90000});
    await h4.waitForSelector(".homeScreen.aoTodayH4",{state:"visible",timeout:30000});
    await h4.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.installed),null,{timeout:30000});
    // A painted Home behind the cinematic boot is not a screenshot of Home.
    // Require the real startup overlay to finish before any H4 captures.
    await h4.waitForFunction(()=>{
      const boot=document.getElementById("ao-cinema-boot");
      if(!boot||!boot.isConnected)return true;
      const style=getComputedStyle(boot);
      return style.display==="none"||style.visibility==="hidden"||Number(style.opacity)<.02;
    },null,{timeout:60000});
    const auditH4=async label=>{
      const r=await h4.evaluate(()=>{
        const home=document.querySelector(".homeScreen.aoTodayH4");
        const hero=home?.querySelector(".aoH4Door");
        const art=hero?.querySelector("[data-ao-home-art-slot] img");
        const button=home?.querySelector("[data-home-h4-begin], [data-resume-mass]");
        const date=home?.querySelector(".aoH4DateOpen");
        return {
          width:innerWidth,documentWidth:document.documentElement.scrollWidth,
          date:date?.textContent?.trim()??"",
          week:home?.querySelectorAll(".aoH4Week .dayCell").length,
          selected:home?.querySelectorAll(".aoH4Week .dayCell.selected").length,
          massCards:home?.querySelectorAll(".aoH4Door").length,
          beginOrResume:home?.querySelectorAll("[data-home-h4-begin], [data-resume-mass]").length,
          change:home?.querySelectorAll("[data-home-h4-change]").length,
          reading:home?.querySelectorAll("[data-home-h4-readings]").length,
          prayer:home?.querySelectorAll(".aoH4Prayer").length,
          rosary:home?.querySelectorAll(".aoH4Chips button").length,
          events:home?.querySelectorAll(".aoH4Upcoming .aoTodayV2Event").length,
          read:home?.querySelectorAll(".aoH4Read button").length,
          hiddenOldTabs:home?.querySelectorAll(".aoTodayV2Tabs").length,
          oldExplore:home?.querySelectorAll(".aoTodayExploreFoot").length,
          artwork:!!art,buttonVisible:!!button&&getComputedStyle(button).display!=="none",
          firstFoldActionBottom:button?.getBoundingClientRect().bottom??null,
          ribbonTop:document.getElementById("ao-global-ribbon")?.getBoundingClientRect().top??null,
          initialScrollTop:document.scrollingElement?.scrollTop??0,
        };
      });
      assert.ok(r.documentWidth<=r.width+2,label+" H4 document overflow: "+JSON.stringify(r));
      assert.ok(r.date.length>=10,label+" H4 date not visible");
      assert.deepEqual([r.week,r.selected,r.massCards,r.beginOrResume,r.change,r.reading,r.prayer,r.rosary,r.read,r.hiddenOldTabs,r.oldExplore],
        [7,1,1,1,1,1,1,3,2,0,0],label+" H4 layout contract");
      assert.ok(r.events<=2,label+" H4 upcoming copied unsourced dates");
      assert.equal(r.buttonVisible,true,label+" Mass door hidden");
      assert.equal(r.initialScrollTop,0,label+" H4 first-fold audit must start at scroll 0");
      assert.ok(r.ribbonTop!=null&&r.firstFoldActionBottom<=r.ribbonTop+2,
        label+" H4 Begin/Resume must be visible above fixed ribbon without scrolling: "+JSON.stringify(r));
      return r;
    };
    await h4.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359?.setPath?.("appearance.mode","dark"));
    await h4.waitForFunction(()=>document.documentElement.dataset.aoAppearanceV1==="dark",null,{timeout:10000});
    await auditH4(prefix+" H4 dark");
    await h4.screenshot({path:resolve(output,prefix+"-h4-door-dark.png"),fullPage:true});
    await h4.evaluate(()=>globalThis.AO_SETTINGS_DONOR_V4359?.setPath?.("appearance.mode","light"));
    await h4.waitForFunction(()=>document.documentElement.dataset.aoAppearanceV1==="light",null,{timeout:10000});
    await auditH4(prefix+" H4 light");
    await h4.screenshot({path:resolve(output,prefix+"-h4-door-light.png"),fullPage:true});
    // Change is a modal presentation over the one R17 source-owned preflight.
    await h4.waitForFunction(()=>Boolean(globalThis.AO_R17_BROWSER_ENTRY?.installed),null,{timeout:15000});
    await h4.locator("[data-home-h4-change]").click();
    await h4.waitForSelector(".aoH4ChoiceDialog[open]",{state:"visible",timeout:10000});
    const choicesBefore=await h4.evaluate(()=>({
      owner:globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight,
      modal:Boolean(document.querySelector(".aoH4ChoiceDialog")),
      focusedInside:document.querySelector(".aoH4ChoiceDialog")?.contains(document.activeElement)===true
    }));
    assert.ok(choicesBefore.owner,"H4 Change must read authoritative preflight");
    assert.ok(choicesBefore.modal,"H4 Change must open an actual dialog");
    assert.equal(choicesBefore.focusedInside,true,"H4 Change must keep focus within the dialog");
    const modalWidth=await h4.evaluate(()=>{
      const box=document.querySelector(".aoH4ChoiceDialog")?.getBoundingClientRect();
      return {left:box?.left,right:box?.right,viewport:innerWidth,
        options:document.querySelectorAll(".aoH4ChoiceDialog [data-h4-option]").length};
    });
    assert.ok(modalWidth.left>=-1&&modalWidth.right<=modalWidth.viewport+1,
      prefix+" H4 Change sheet overflow: "+JSON.stringify(modalWidth));
    assert.equal(modalWidth.options,5,prefix+" Change must not duplicate Mass preflight inputs");
    await h4.locator('[data-h4-option="readerMode"]').selectOption("MISSAL");
    await h4.waitForFunction(()=>globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight?.readerMode==="MISSAL");
    await h4.locator('[data-h4-option="readerLanguage"]').selectOption("fr");
    await h4.waitForFunction(()=>globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight?.experience?.language==="fr");
    await h4.locator('[data-h4-option="beforeMass"]').selectOption("prepare");
    await h4.waitForFunction(()=>globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight?.experience?.before==="prepare");
    await h4.locator('[data-h4-option="afterMass"]').selectOption("thanksgiving");
    await h4.waitForFunction(()=>globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight?.experience?.after==="thanksgiving");
    await h4.screenshot({path:resolve(output,prefix+"-h4-change-light.png")});
    await h4.locator("[data-h4-remember]").click();
    await h4.waitForFunction(()=>{
      const value=globalThis.AO_SETTINGS_DONOR_V4359?.snapshot?.()?.preferences?.mass?.todayChoices;
      return value?.readerMode==="MISSAL"&&value?.readerLanguage==="fr"&&
        value?.beforeMass==="prepare"&&value?.afterMass==="thanksgiving";
    },null,{timeout:10000});
    assert.match(await h4.locator("[data-h4-save-status]").innerText(),
      /saved|enregistrés/i,"Remember must report a real Settings write");
    // New page in the same browser context verifies persisted Settings defaults,
    // not merely preflight state held by the original live tab.
    const remembered=await context.newPage();
    await remembered.goto("http://127.0.0.1:4381/index.html?aoTodayH4=1",
      {waitUntil:"domcontentloaded",timeout:90000});
    await remembered.waitForFunction(()=>Boolean(
      globalThis.AO_R17_BROWSER_ENTRY?.installed&&globalThis.AO_SETTINGS_DONOR_V4359?.snapshot?.()),
      null,{timeout:30000});
    const restored=await remembered.evaluate(()=>({
      stored:globalThis.AO_SETTINGS_DONOR_V4359.snapshot().preferences.mass.todayChoices,
      current:globalThis.AO_R17_BROWSER_ENTRY.status().fullMassPreflight,
    }));
    assert.equal(restored.stored.readerMode,"MISSAL",prefix+" remembered reader");
    assert.equal(restored.current.readerMode,"MISSAL",prefix+" R17 must load remembered reader");
    assert.equal(restored.current.experience.language,"fr",prefix+" remembered translation");
    assert.equal(restored.current.experience.before,"prepare",prefix+" remembered preparation");
    assert.equal(restored.current.experience.after,"thanksgiving",prefix+" remembered thanksgiving");
    await remembered.locator(".homeScreen [data-home-settings]").click();
    await remembered.waitForSelector('#ao-settings-modular-root [data-settings-route="/settings/mass"]',
      {state:"visible",timeout:15000});
    await remembered.locator('#ao-settings-modular-root [data-settings-route="/settings/mass"]').click();
    await remembered.waitForSelector('#ao-settings-modular-root [data-pref-clear-today]',
      {state:"visible",timeout:15000});
    await remembered.locator('#ao-settings-modular-root [data-pref-clear-today]').click();
    await remembered.waitForFunction(()=>globalThis.AO_SETTINGS_DONOR_V4359?.snapshot?.()
      ?.preferences?.mass?.todayChoices===null,null,{timeout:10000});
    await remembered.close();
    await h4.locator(".aoH4SheetBottom [data-h4-sheet-close]").click();
    await h4.waitForSelector(".aoH4ChoiceDialog",{state:"detached",timeout:10000});
    assert.match(await h4.locator(".aoH4Primary small").innerText(),/Missal|Missel/,
      "H4 Begin must reflect the source preflight reader selection");
    // The no-art state must collapse the illustration, not leave a decorative
    // placeholder or bury the single Begin/Resume door beneath the phone ribbon.
    await h4.evaluate(()=>{
      scrollTo({top:0,behavior:"instant"});
      document.querySelector(".aoH4Door")?.classList.add("aoTodayV2ArtMissing");
    });
    // The presentation bridge animates Home with transient filter:blur().
    // Never accept a blurred frame as no-art visual evidence.
    await h4.waitForFunction(()=>{
      const node=document.querySelector(".aoH4Door");
      if(!node)return false;
      const style=getComputedStyle(node);
      return style.filter==="none"&&Number(style.opacity)>.99;
    },null,{timeout:10000});
    await h4.waitForTimeout(650);
    const noArt=await h4.evaluate(()=>{
      const art=document.querySelector(".aoH4Door .aoTodayV2Art");
      const door=document.querySelector(".aoH4Door");
      const action=door?.querySelector("[data-home-h4-begin], [data-resume-mass]");
      const ribbon=document.querySelector("#ao-global-ribbon");
      const rect=action?.getBoundingClientRect(),nav=ribbon?.getBoundingClientRect();
      return {display:art?getComputedStyle(art).display:null,
        door:door?.getBoundingClientRect().height,
        actionTop:rect?.top,actionBottom:rect?.bottom,ribbonTop:nav?.top,
        documentWidth:document.documentElement.scrollWidth,viewport:innerWidth};
    });
    assert.equal(noArt.display,"none",prefix+" H4 no-art must collapse image block");
    assert.ok(noArt.documentWidth<=noArt.viewport+2,prefix+" H4 no-art overflow: "+JSON.stringify(noArt));
    assert.ok(noArt.actionBottom<=noArt.ribbonTop+2,
      prefix+" H4 no-art Mass entry must remain above the phone ribbon: "+JSON.stringify(noArt));
    const settledNoArt=await h4.evaluate(()=>{
      const hero=document.querySelector(".aoH4Door");
      const screen=document.querySelector(".homeScreen.aoTodayH4");
      return {heroFilter:getComputedStyle(hero).filter,screenFilter:getComputedStyle(screen).filter,
        top:document.scrollingElement?.scrollTop};
    });
    assert.deepEqual(settledNoArt,{heroFilter:"none",screenFilter:"none",top:0},
      prefix+" no-art capture must be settled and at the initial viewport");
    await h4.screenshot({path:resolve(output,prefix+"-h4-no-art-light.png")});
    await h4.evaluate(()=>document.querySelector(".aoH4Door")?.classList.remove("aoTodayV2ArtMissing"));
    await h4.locator("[data-home-h4-readings]").click();
    await h4.waitForSelector(".aoMassTextsOverlay",{state:"visible",timeout:10000});
    await h4.locator("[data-mass-texts-close]").click();
    await h4.locator(".aoH4DateOpen").click();
    await h4.waitForSelector(".aoTodayH4[data-ao-home-calendar-view='picker'] #ao-calendar-modular-root",{state:"attached",timeout:25000});
    await h4.screenshot({path:resolve(output,prefix+"-h4-calendar-light.png")});
    await h4.locator(".aoH4CalendarBack [data-home-calendar-today]").click();
    await h4.waitForSelector(".homeScreen.aoTodayH4 .aoH4Door",{state:"visible",timeout:10000});
    assert.equal(h4Errors.length,0,prefix+" H4 page errors: "+JSON.stringify(h4Errors));
    await h4.close();
    await context.close();
  }
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
