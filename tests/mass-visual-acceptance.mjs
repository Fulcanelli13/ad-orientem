import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/visual-acceptance");
await mkdir(out,{recursive:true});
const mime={
  ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",
};
const server=http.createServer(async(req,res)=>{
  try{
    const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+p);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4190,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB"});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error?.message??error)));
  await page.goto("http://127.0.0.1:4190/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed===true,null,{timeout:30000});

  const setup=await page.evaluate(async()=>{
    const t=(lat,en)=>({lat,en});
    const proper={
      sourcePath:"Sancti/10-07",
      name:"Our Lady of the Rosary",
      color:"white",
      introit:t("Gaudeámus omnes in Dómino","Let us all rejoice in the Lord"),
      collects:[t("Deus, cuius Unigénitus","O God, whose only-begotten Son")],
      epistle:t("Ab inítio et ante sǽcula","From the beginning and before the world"),
      gradual:t("Propter veritátem","Because of truth"),
      sequence:{lat:"",en:""},
      gospel:t("In illo témpore: Missus est Angelus","At that time the Angel was sent"),
      offertory:t("In me grátia omnis viæ","In me is all grace of the way"),
      secrets:[t("Fac nos, quǽsumus, Dómine","Grant us, we beseech Thee, O Lord")],
      preface:t("Vere dignum et iustum est","It is truly meet and just"),
      communion:t("Floréte, flores","Send forth flowers"),
      postcommunions:[t("Sacratíssimæ Genetrícis tuæ","May the prayers of Thy most holy Mother")],
    };
    let route="live";
    globalThis.__AO_MASS_VISUAL_LEGACY_STARTS=0;
    globalThis.AO_SEQUENCE_BRIDGE_V23={
      startLive(){globalThis.__AO_MASS_VISUAL_LEGACY_STARTS+=1;},
      getActive(){return null;},
      getAssemblyStatus(){return null;},
    };
    globalThis.AO_SEQUENCE_BRIDGE_V22=null;
    globalThis.AO_RUNTIME_V8={
      store:{
        getState:()=>({
          route,selectedDate:"2026-10-04",language:"en",
          settings:{
            massForm:"mc-incense",followMode:"vox",massPostureProfile:"TRADITIONAL_WALSH",
            massGestureProfile:"TRADITIONAL",faithfulCommunion:true,textMode:"oriented",
          },
        }),
        subscribe:()=>()=>{},
        dispatch:(action)=>{route=action?.route??route;return action;},
      },
    };
    globalThis.AO_CELEBRATION_ARCH_V1={
      date:"2026-10-04",celebrationForm:"mc-incense",followMode:"vox",
      actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Our Lady of the Rosary"},
    };
    globalThis.AO_CELEBRATION_API={
      getResolvedMass:()=>({
        canStart:true,date:"2026-10-04",
        calendarDay:{id:"Tempora/Pent18-0",title:"Sunday"},
        requestedCelebrationId:"holy_rosary",celebrationId:"holy_rosary",celebrationType:"VOTIVE",
        actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Our Lady of the Rosary"},
        proper,properSource:"Sancti/10-07",insertedRites:[],conditions:["GLORIA_APPOINTED","CREDO_APPOINTED","AGNUS_DEI_PUBLIC","LAST_GOSPEL_PRESENT"],rubricSources:["RG60"],
      }),
    };
    const mod=await import("/src/mass/browser-entry.js?mass-visual-audit=1");
    const controller=mod.createBrowserMassController();
    const prepared=await controller.enter();
    globalThis.__AO_SPECIAL_RITE_VISUAL_PREPARED=prepared;
    return {schema:prepared.schema,form:prepared.session.resolvedMass.form,mode:prepared.readerPreferences.mode};
  });

  assert.equal(setup.form,"MISSA_CANTATA_INCENSE");
  assert.equal(setup.mode,"LIVE");
  await page.waitForSelector("#ao-r17-native-reader-preview",{state:"visible",timeout:30000});
  // The native shell mounts before its initial projected cue is committed on
  // requestAnimationFrame. Inspect the completed source-backed state, not
  // the transient mount placeholder ('—').
  await page.waitForFunction(()=>
    document.querySelector("#ao-r17-native-reader-preview [data-role='posture']")?.textContent?.trim()==="STAND",
    null,{timeout:7000});

  const opening=await page.evaluate(()=>({
    uiOwner:globalThis.AO_R17_MASS_RUNTIME?.uiOwner??null,
    liturgicalColour:document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")?.dataset.liturgicalColour??null,
    liturgicalSource:document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")?.dataset.liturgicalSource??null,
    massBackground:document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")?.style.getPropertyValue("--ao-mass-bg")??null,
    legacyStarts:globalThis.__AO_MASS_VISUAL_LEGACY_STARTS??0,
    modeButtons:document.querySelectorAll("#ao-r17-native-reader-preview [data-reader-mode]").length,
    livePressed:document.querySelector("#ao-r17-native-reader-preview [data-reader-mode='LIVE']")?.getAttribute("aria-pressed")??null,
    modeSwitchLocked:[...document.querySelectorAll("#ao-r17-native-reader-preview [data-reader-mode]")].every(x=>x.disabled),
    stateRibbon:Boolean(document.querySelector("#ao-r17-native-reader-preview .ao-state-ribbon")),
    leftRail:Boolean(document.querySelector("#ao-r17-native-reader-preview .ao-rail-left")),
    rightRail:Boolean(document.querySelector("#ao-r17-native-reader-preview .ao-rail-right")),
    title:document.querySelector("#ao-r17-native-reader-preview [data-role='card-title']")?.textContent?.trim()??"",
    titleHidden:document.querySelector("#ao-r17-native-reader-preview [data-role='card-title']")?.hidden??false,
    body:document.querySelector("#ao-r17-native-reader-preview [data-role='paragraphs']")?.textContent?.trim()??"",
    scholaDock:document.querySelector("#ao-r17-native-reader-preview .ao-schola-dock")?.dataset?.active??null,
    scholaInRightRail:Boolean(document.querySelector("#ao-r17-native-reader-preview .ao-rail-right [data-channel='schola']")),
    stageLeft:document.querySelector("#ao-r17-native-reader-preview .ao-reader-stage")?.dataset?.leftRail??null,
    stageRight:document.querySelector("#ao-r17-native-reader-preview .ao-reader-stage")?.dataset?.rightRail??null,
    focusedParagraphs:document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph[data-active='true']").length,
    homeButton:Boolean(document.querySelector("#ao-r17-native-reader-preview [data-reader-home]")),
    preferencesButton:Boolean(document.querySelector("#ao-r17-native-reader-preview [data-reader-preferences]")),
    appSettingsButton:Boolean(document.querySelector("#ao-r17-native-reader-preview [data-reader-parameters]")),
    homeControlText:document.querySelector("#ao-r17-native-reader-preview [data-reader-home]")?.textContent?.trim()??"",
    preferencesControlText:document.querySelector("#ao-r17-native-reader-preview [data-reader-preferences]")?.textContent?.trim()??"",
    homeControlDonorIcon:document.querySelector("#ao-r17-native-reader-preview [data-reader-home] [data-ao-donor-icon='home']")?.dataset?.aoDonorIcon??null,
    preferencesControlDonorIcon:document.querySelector("#ao-r17-native-reader-preview [data-reader-preferences] [data-ao-donor-icon='preferences']")?.dataset?.aoDonorIcon??null,
    homeControlPath:document.querySelector("#ao-r17-native-reader-preview [data-reader-home] svg path")?.getAttribute("d")??"",
    preferencesCircleCount:document.querySelectorAll("#ao-r17-native-reader-preview [data-reader-preferences] svg circle").length,
    preferencesPath:document.querySelector("#ao-r17-native-reader-preview [data-reader-preferences] svg path")?.getAttribute("d")??"",
    homeControlRect:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview [data-reader-home]")?.getBoundingClientRect();return x?{width:x.width,height:x.height}:null})(),
    preferencesControlRect:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview [data-reader-preferences]")?.getBoundingClientRect();return x?{width:x.width,height:x.height}:null})(),
    stateLabels:[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-state-kicker")].map(x=>x.textContent?.trim()??""),
    openingPosture:document.querySelector("#ao-r17-native-reader-preview [data-role='posture']")?.textContent?.trim()??"",
    openingPostureIconHidden:document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='posture-top']")?.hidden??null,
    guideLabel:document.querySelector("#ao-r17-native-reader-preview [data-role='guide-short']")?.textContent?.trim()??"",
    preferencesOpen:document.querySelector("#ao-r17-native-reader-preview [data-role='mass-preferences']")?.dataset?.open??null,
    floatingClose:Boolean(document.querySelector("#ao-r17-native-reader-preview [aria-label='Close Mass reader']")),
    sectionJumpDisabled:document.querySelector("#ao-r17-native-reader-preview [data-role='section-jump']")?.disabled??null,
    sectionButtonCount:document.querySelectorAll("#ao-r17-native-reader-preview [data-reader-section]").length,
    totalCards:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.totalCards??null,
    sourceTotalCards:globalThis.AO_R17_NATIVE_READER_PREVIEW?.sourceModel?.totalCards??null,
    structureOwner:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.structureOwner??null,
    sourceStructureOwner:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.sourceStructureOwner??null,
    historicalIdentityClaim:globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.historicalV183IdentityClaim??null,
    shellRect:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview .ao-reader-shell")?.getBoundingClientRect();return x?{width:x.width,height:x.height}:null})(),
  }));
  assert.equal(opening.uiOwner,"R17_NATIVE_PRODUCTION");
  assert.equal(opening.liturgicalColour,"WHITE","selected Rosary Mass must own its white theme, not the Sunday calendar");
  assert.equal(opening.liturgicalSource,"SELECTED_PROPER");
  assert.equal(opening.massBackground,"#191815");
  assert.equal(opening.legacyStarts,0);
  assert.equal(opening.modeButtons,3);
  assert.equal(opening.livePressed,"true");
  assert.equal(opening.stateRibbon,true);
  assert.equal(opening.leftRail,true);
  assert.equal(opening.rightRail,true);
  assert.ok(opening.title.length>0);
  assert.equal(opening.titleHidden,true,"duplicate card title remained visible under the state ribbon");
  assert.ok(opening.body.length>0);
  assert.equal(opening.scholaInRightRail,false,"Schola remained trapped in the narrow right rail");
  assert.equal(opening.scholaDock,"true","active Schola did not move to the readable dedicated dock");
  assert.equal(opening.homeButton,true,"LIVE first ribbon lost Home control");
  assert.equal(opening.preferencesButton,true,"v1.80 first ribbon lost Mass preferences control");
  assert.equal(opening.appSettingsButton,true,"Mass preferences lost its app-settings handoff");
  assert.equal(opening.homeControlText,"","Home control retained obsolete text after canonical icon externalization");
  assert.equal(opening.preferencesControlText,"","Mass preferences control retained obsolete text after canonical icon externalization");
  assert.equal(opening.homeControlDonorIcon,"home","Mass Home control is not the exact v1.80 donor icon owner");
  assert.equal(opening.preferencesControlDonorIcon,"preferences","Mass preferences control is not the exact v1.80 donor icon owner");
  assert.equal(opening.homeControlPath,"M3.5 10.7 12 3.8l8.5 6.9v9.1h-5.4v-5.7H8.9v5.7H3.5z",
    "Mass Home icon drifted from the v1.80 house glyph");
  assert.equal(opening.preferencesCircleCount,3,"Mass preferences icon lost one of the three v1.80 slider knobs");
  assert.equal(opening.preferencesPath,"M4 7h10M18 7h2M4 17h2M10 17h10M4 12h5M13 12h7",
    "Mass preferences icon drifted from the v1.80 sliders glyph");
  assert.ok(opening.homeControlRect?.width>=44&&opening.homeControlRect?.height>=44,"Home control lost a usable phone touch target");
  assert.ok(opening.preferencesControlRect?.width>=44&&opening.preferencesControlRect?.height>=44,"Mass preferences control lost a usable phone touch target");
  assert.deepEqual(opening.stateLabels,["YOU","PRIEST"],"persistent state ribbon is no longer YOU / GUIDE / PRIEST");
  assert.equal(opening.openingPosture,"STAND","opening YOU state regressed to an empty or incorrect posture");
  assert.equal(opening.openingPostureIconHidden,false,"opening YOU state lost its exact posture icon");
  assert.ok(["OPEN","RUBRICS"].includes(opening.guideLabel),"Guide centre cell lost v1.79/v1.80 semantics");
  assert.equal(opening.preferencesOpen,"false","Mass preferences sheet should be closed at reader entry");
  assert.equal(opening.floatingClose,false,"obsolete floating close button still overlays the LIVE ribbon");
  assert.equal(opening.sectionJumpDisabled,false,"source-first section jump is disabled");
  assert.equal(opening.sectionButtonCount,opening.totalCards,"section jump does not expose the complete current display model");
  assert.equal(opening.totalCards,48,"visible Sung LIVE presentation no longer preserves the approved 48-step concept");
  assert.equal(opening.sourceTotalCards,39,"48-step presentation mutated or replaced the certified 39-step source model");
  assert.equal(opening.structureOwner,"SOURCE_FIRST_LIVE_PRODUCT_48");
  assert.equal(opening.sourceStructureOwner,"SOURCE_FIRST_LIVE");
  assert.equal(opening.historicalIdentityClaim,false,"source-first product 48 must not masquerade as recovered historical C01-C48 identity");
  assert.ok(opening.shellRect?.width<=390.5&&opening.shellRect?.height<=844.5,"native LIVE shell overflows phone viewport");

  // v1.80 phone visual colour matrix. The underlying canonical Rosary Mass
  // remains unchanged; only the presentation palette is temporarily exercised.
  // This audits the real 390px browser CSS/silhouettes, rather than producing
  // a claimed liturgical celebration from an invented calendar fixture.
  const paletteBase=await page.evaluate(()=>{
    const shell=document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]");
    return {style:shell?.getAttribute("style")??"",colour:shell?.dataset.liturgicalColour,
      source:shell?.dataset.liturgicalSource};
  });
  const paletteColours=["WHITE","RED","GREEN","VIOLET","ROSE","BLACK","GOLD","NEUTRAL"];
  const paletteAudit=[];
  for(const colour of paletteColours){
    const audit=await page.evaluate(async(selected)=>{
      const {resolveMassLiturgicalTheme}=await import("/src/mass/reader-liturgical-theme.js");
      const theme=resolveMassLiturgicalTheme(selected==="NEUTRAL"
        ? {session:{resolvedMass:{actualCelebration:{title:"Unresolved"}}}}
        : {session:{resolvedMass:{actualCelebration:{title:"Colour study"},
          proper:{status:"READY",data:{colour:selected}},provenance:{colour:"GREEN"}}},
          legacyResolvedMass:{calendarDay:{colour:"GREEN"}}});
      const shell=document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]");
      for(const [name,value] of Object.entries(theme.tokens))
        shell.style.setProperty("--ao-mass-"+name.replace(/[A-Z]/g,c=>"-"+c.toLowerCase()),value);
      shell.dataset.liturgicalColour=theme.key;
      shell.dataset.liturgicalSource=theme.source;
      const probe=document.createElement("span");
      probe.className="ao-ritual-cross-symbol";
      probe.textContent="+";
      probe.style.cssText="position:absolute;left:0;top:0;visibility:hidden";
      shell.appendChild(probe);
      const style=getComputedStyle(shell);
      const fill=shell.querySelector(".ao-schola-progress>span");
      const posture=shell.querySelector('[data-icon-slot="posture-top"]');
      const priest=shell.querySelector('[data-icon-slot="priest-position"]');
      const rail=shell.querySelector('.ao-rail-right [data-channel="priest-voice"]');
      const rect=el=>el?({width:el.getBoundingClientRect().width,
        height:el.getBoundingClientRect().height}):null;
      const result={colour:theme.key,source:theme.source,tokens:theme.tokens,
        background:style.backgroundImage,topColour:getComputedStyle(probe).color,
        progressColour:fill?getComputedStyle(fill).backgroundColor:null,
        posture:rect(posture),priest:rect(priest),rail:rect(rail),
        viewportWidth:document.documentElement.scrollWidth};
      probe.remove();
      return result;
    },colour);
    assert.equal(audit.colour,colour,"selected Mass theme did not resolve: "+colour);
    assert.equal(audit.source,colour==="NEUTRAL"?"UNRESOLVED":"SELECTED_PROPER");
    const rgb=hex=>{const bytes=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
      return "rgb("+bytes.join(", ")+")";};
    assert.equal(audit.topColour,rgb(audit.tokens.accentText),
      colour+" ritual cross did not use the source-selected accent text");
    assert.equal(audit.progressColour,rgb(audit.tokens.accent),
      colour+" Schola progress remained fixed green");
    assert.ok(audit.background.includes("linear-gradient("),colour+" Mass background lost the dark ambience");
    assert.ok(audit.posture?.width>=48&&audit.posture?.height>=48,
      colour+" top faithful icon no longer meets v1.77/v1.80 scale");
    assert.ok(audit.priest?.width>=48&&audit.priest?.height>=48,
      colour+" top priest icon no longer meets donor scale");
    assert.ok(audit.rail?.width>=46&&audit.rail?.width<=52,
      colour+" right cue rail no longer matches 48px phone geometry");
    assert.ok(audit.viewportWidth<=391,colour+" palette adds horizontal phone overflow");
    paletteAudit.push({colour,source:audit.source,accent:audit.tokens.accent,
      accentText:audit.tokens.accentText,posture:audit.posture,priest:audit.priest,rail:audit.rail});
    await page.screenshot({path:resolve(out,"v180-palette-"+colour.toLowerCase()+"-390.png"),fullPage:false});
  }
  await page.evaluate(original=>{
    const shell=document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]");
    shell.setAttribute("style",original.style);
    shell.dataset.liturgicalColour=original.colour;
    shell.dataset.liturgicalSource=original.source;
  },paletteBase);
  await writeFile(resolve(out,"v180-palette-mobile-audit.json"),
    JSON.stringify({source:"Definitive v1.80 donor; simulated colours on live Rosary reader, 390px",colours:paletteAudit},null,2));

  // LIVE visual hierarchy: one instance for persistent posture and priest
  // action, while surrounding prose remains readable at rest.
  await page.waitForTimeout(400);
  const hierarchy=await page.evaluate(()=>{
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const postureTop=root?.querySelector('[data-icon-slot="posture-top"]');
    const postureRail=root?.querySelector('.ao-rail-left [data-channel="posture"]');
    const badge=root?.querySelector(".ao-priest-action-badge");
    const active=root?.querySelector('.ao-reader-paragraph[data-active="true"]');
    const inactive=[...root?.querySelectorAll?.('.ao-reader-paragraph[data-kind="TEXT"]:not([data-active="true"])')??[]];
    const next=root?.querySelector('[data-reader-nav="next"]');
    const previous=root?.querySelector('[data-reader-nav="previous"]');
    return {
      postureTopVisible:postureTop && !postureTop.hidden,
      postureRailDisplay:postureRail?getComputedStyle(postureRail).display:null,
      badgeDisplay:badge?getComputedStyle(badge).display:null,
      activeOpacity:active?Number.parseFloat(getComputedStyle(active).opacity):null,
      inactiveOpacity:inactive.length?Number.parseFloat(getComputedStyle(inactive[inactive.length-1]).opacity):null,
      nextOpacity:next?Number.parseFloat(getComputedStyle(next).opacity):null,
      nextHeight:next?.getBoundingClientRect().height,
      previousHeight:previous?.getBoundingClientRect().height,
    };
  });
  assert.equal(hierarchy.postureTopVisible,true,"top posture owner became unavailable");
  assert.equal(hierarchy.postureRailDisplay,"none","persistent posture is duplicated in LIVE rail and top state ribbon");
  assert.equal(hierarchy.badgeDisplay,"none","priest action appears in both top badge and right action rail");

  // Exact posture transitions from R17 are same-valued on purpose: the
  // resolved persistent posture has *just become* the source cue target.
  // A previous "different from posture" test silently hid these LIVE cues.
  // Render real DOM on a detached fixture, preserving the current Mass.
  const postureTransitions=await page.evaluate(async()=>{
    const [{createReaderDomAdapter},{createHostIconResolver},{R17_FROZEN_ACTIVE_ICON_ASSETS}]=await Promise.all([
      import("/src/mass/reader-dom.js?posture-rail-audit=1"),
      import("/src/mass/reader-icons.js"),
      import("/src/mass/reader-icon-bank.js"),
    ]);
    const host=document.createElement("div");
    host.style.cssText="position:absolute;left:-9999px;top:0;width:390px;height:844px";
    document.body.appendChild(host);
    const adapter=createReaderDomAdapter({
      root:host,iconResolver:createHostIconResolver({assets:R17_FROZEN_ACTIVE_ICON_ASSETS}),
      allowPresentationModeSwitch:false,
    });
    try{
      adapter.mount({readerPreferences:{mode:"LIVE"},session:{resolvedMass:{
        presentationMode:"LIVE",actualCelebration:{title:"Mass"}
      }}});
      const base={id:"POSTURE-CUE-TEST",sectionTitle:"Kyrie",cardTitle:"Kyrie",
        posture:{label:"STAND"},postureIconKey:"stand",
        paragraphs:[{id:"p1",primary:"Kyrie eleison",active:true}]};
      const snapshot=()=>{
        const el=host.querySelector('.ao-rail-left [data-channel="posture-change"]');
        const icon=el?.querySelector('[data-icon-slot="posture-change"]');
        return {
          active:el?.dataset.active,display:el?getComputedStyle(el).display:null,
          iconHidden:icon?.hidden,iconMask:icon?.style.maskImage??"",
          stablePosture:host.querySelector('[data-role="posture"]')?.textContent,
          permanentRail:host.querySelector('.ao-rail-left [data-channel="posture"]')
            ?getComputedStyle(host.querySelector('.ao-rail-left [data-channel="posture"]')).display:null,
        };
      };
      adapter.renderMoment({...base,postureCue:{label:"STAND",cueId:"AO.SM.C0001"},
        postureChangeIconKey:"stand"});
      const exact=snapshot();
      // A repeated chrome update with the same source cue must not flash
      // an already active transition off before the reader advances.
      adapter.renderMoment({...base,cardUpdate:false,
        postureCue:{label:"STAND",cueId:"AO.SM.C0001"}});
      const continued=snapshot();
      adapter.renderMoment({...base,cardUpdate:false,postureCue:null});
      const afterwards=snapshot();
      // A later Collect source row specifying the *same* STAND state is
      // an informational marker, not a second instruction to stand.
      // The cue controller rejects C0070 before it can reach the DOM.
      adapter.renderMoment({...base,cardUpdate:false,postureCue:null});
      const redundant=snapshot();
      adapter.renderMoment({...base,cardUpdate:false,posture:{label:"KNEEL"},
        postureIconKey:"kneel",postureCue:{label:"STAND",cueId:"AO.SM.C0070"},
        postureChangeIconKey:"stand"});
      const disagreement=snapshot();
      return {exact,continued,afterwards,redundant,disagreement};
    }finally{adapter.destroy();host.remove();}
  });
  assert.equal(postureTransitions.exact.active,"true",
    "source-matched posture-change cue did not reach the left rail");
  assert.equal(postureTransitions.exact.display,"grid",
    "source-matched posture-change icon remains CSS-hidden");
  assert.equal(postureTransitions.exact.iconHidden,false,
    "v4.6 posture icon not painted at exact transition");
  assert.match(postureTransitions.exact.iconMask,/stand\.svg/,
    "posture cue used something other than the frozen donor stand master");
  assert.equal(postureTransitions.exact.stablePosture,"STAND");
  assert.equal(postureTransitions.exact.permanentRail,"none",
    "persistent posture duplicated the top ribbon after restoring transient cue");
  assert.equal(postureTransitions.continued.active,"true",
    "same source cue re-render prematurely dropped its transition icon");
  for(const state of [postureTransitions.afterwards,postureTransitions.redundant,postureTransitions.disagreement]){
    assert.equal(state.active,"false",
      "obsolete or profile-contradicting posture change persisted");
    assert.equal(state.display,"none");
    assert.equal(state.iconHidden,true);
  }

  assert.ok(hierarchy.activeOpacity>=.95,"active prayer lost primary visual focus: "+JSON.stringify(hierarchy));
  assert.ok(hierarchy.inactiveOpacity>=.59&&hierarchy.inactiveOpacity<=.7,
    "surrounding prayer text is unreadably dim or overwhelms active text: "+JSON.stringify(hierarchy));
  assert.ok(hierarchy.nextOpacity>=.2&&hierarchy.nextOpacity<=.35,
    "resting card arrow distracts from prayer focus: "+JSON.stringify(hierarchy));
  assert.ok(hierarchy.nextHeight>=44&&hierarchy.previousHeight>=44,
    "reducing arrow chrome accidentally reduced touch targets: "+JSON.stringify(hierarchy));

  // Phone ergonomics acceptance at standard and narrow widths. Test computed
  // hitboxes, not a CSS string or desktop hover state.
  const phoneAudit=[];
  for(const width of [390,320]){
    await page.setViewportSize({width,height:844});
    // The section menu is display:none while closed, so its clickable geometry
    // must be measured with the menu actually open.
    await page.locator("#ao-r17-native-reader-preview [data-role='section-jump']").click();
    const audit=await page.evaluate(()=>{
      const root=document.querySelector("#ao-r17-native-reader-preview");
      const rect=selector=>{
        const el=root?.querySelector(selector),box=el?.getBoundingClientRect();
        const cs=el?getComputedStyle(el):null;
        return box?{width:box.width,height:box.height,left:box.left,right:box.right,
          fontSize:Number.parseFloat(cs?.fontSize??"0"),display:cs?.display}:null;
      };
      const row={
        viewport:document.documentElement.clientWidth,
        prefsClose:rect(".ao-mass-prefs-close"),
        modeButton:rect(".ao-mode-ribbon button"),
        preferencesAction:rect(".ao-mass-prefs-more"),
        sectionItem:rect('[data-reader-section]'),
        guideKicker:rect(".ao-guide-copy small"),
        scholaSlower:rect("[data-schola-slower]"),
        scholaFaster:rect("[data-schola-faster]"),
        scholaPause:rect("[data-schola-pause]"),
        scholaToggle:rect("[data-schola-toggle]"),
        scholaDock:rect(".ao-schola-dock"),
        prayerBody:rect(".ao-prayer-body"),
        prayerCard:rect(".ao-prayer-card"),
        leftRail:rect(".ao-rail-left"),
        rightRail:rect(".ao-rail-right"),
        stateLabels:[...root.querySelectorAll(".ao-state-label")].map(el=>({
          text:el.textContent.trim(),
          width:el.getBoundingClientRect().width,
          whiteSpace:getComputedStyle(el).whiteSpace,
          clamp:getComputedStyle(el).webkitLineClamp,
          fontSize:Number.parseFloat(getComputedStyle(el).fontSize)
        })),
        focusLine:(()=>{
          const card=root.querySelector(".ao-prayer-card");
          const dock=root.querySelector(".ao-schola-dock");
          return {line:card?.getBoundingClientRect().top+(card?.clientHeight??0)*.39,
            dockTop:dock?.getBoundingClientRect().top,
            active:dock?.dataset.active}
        })(),
      };
      return row;
    });
    assert.ok(audit.prefsClose?.width>=44&&audit.prefsClose?.height>=44,
      "preferences close has an undersized phone target: "+JSON.stringify(audit));
    assert.ok(audit.modeButton?.height>=44&&audit.modeButton?.fontSize>=10,
      "mode labels are still microscopic: "+JSON.stringify(audit));
    assert.ok(audit.preferencesAction?.height>=44&&audit.preferencesAction?.fontSize>=10,
      "preferences actions are too small to tap/read: "+JSON.stringify(audit));
    assert.ok(audit.sectionItem?.height>=44&&audit.sectionItem?.fontSize>=12,
      "section picker targets are too small: "+JSON.stringify(audit));
    assert.ok(audit.guideKicker?.fontSize>=9,
      "Guide label is microscopic: "+JSON.stringify(audit));
    for(const name of ["scholaSlower","scholaFaster","scholaPause"]){
      assert.ok(audit[name]?.height>=44,
        "Schola "+name+" has an undersized target: "+JSON.stringify(audit));
    }
    assert.ok(audit.scholaToggle?.height>=40,
      "Schola hide/show target too small: "+JSON.stringify(audit));
    assert.ok(audit.scholaDock?.left>=0&&audit.scholaDock?.right<=width+1,
      "Schola dock extends beyond the phone screen: "+JSON.stringify(audit));
    assert.ok(audit.stateLabels.every(x=>x.whiteSpace==="normal"&&Number(x.clamp)>=2),
      "YOU/PRIEST ribbon still clips state text to a single line: "+JSON.stringify(audit));
    if(width===320){
      assert.ok(audit.prayerBody?.width>=205,
        "320px mobile prayer reading measure remains constricted: "+JSON.stringify(audit));
      assert.ok(audit.prayerBody.left>=audit.leftRail.right,
        "prayer text overlaps faithful gesture rail: "+JSON.stringify(audit));
      assert.ok(audit.prayerBody.right<=audit.rightRail.left,
        "prayer text overlaps priest gesture rail: "+JSON.stringify(audit));
      assert.ok(audit.stateLabels.every(x=>Number(x.clamp)===3),
        "narrow-phone state labels did not gain a third readable line: "+JSON.stringify(audit));
    }
    assert.ok(audit.focusLine?.line<audit.focusLine?.dockTop-20,
      "Schola dock obscures the certified 39% active-cue reading line: "+JSON.stringify(audit));
    phoneAudit.push({width,audit});
    await page.locator("#ao-r17-native-reader-preview [data-role='section-jump']").click();
  }
  await page.setViewportSize({width:390,height:844});

  // v1.79 Guide: structured sheet, curated sections and source links.
  const guideButton=page.locator("#ao-r17-native-reader-preview [data-role='guide-button']");
  assert.equal(await guideButton.isDisabled(),false,"opening v1.79 Guide is disabled");
  await guideButton.click();
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='guide-popover']")?.hidden===false);
  const guideAudit=await page.evaluate(()=>({
    kicker:document.querySelector("#ao-r17-native-reader-preview .ao-guide-kicker")?.textContent?.trim()??"",
    title:document.querySelector("#ao-r17-native-reader-preview .ao-guide-title")?.textContent?.trim()??"",
    summary:document.querySelector("#ao-r17-native-reader-preview .ao-guide-summary")?.textContent?.trim()??"",
    headings:[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-guide-section h3,#ao-r17-native-reader-preview .ao-guide-section h4")].map(x=>x.textContent?.trim()??""),
    sectionCount:document.querySelectorAll("#ao-r17-native-reader-preview .ao-guide-section").length,
    sources:document.querySelector("#ao-r17-native-reader-preview .ao-guide-sources p")?.textContent?.trim()??"",
    sourceLinks:document.querySelectorAll("#ao-r17-native-reader-preview .ao-guide-links a").length,
  }));
  assert.equal(guideAudit.kicker,"Guide · 1962 Sung Mass","Guide lost v1.79 identity");
  assert.ok(guideAudit.title.length>0&&guideAudit.summary.length>0,"Guide header is not curated");
  assert.ok(guideAudit.sectionCount>=5,"Guide collapsed back into an unstructured long-text dump");
  for(const heading of ["What is happening","What should I do?","For prayer"]){
    assert.ok(guideAudit.headings.includes(heading),"Guide is missing curated section: "+heading);
  }
  assert.ok(guideAudit.sources.length>0,"Guide lost its source line");
  assert.ok(guideAudit.sourceLinks>=1,"Guide lost source links");
  await page.locator("#ao-r17-native-reader-preview [data-guide-close]").click();
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='guide-popover']")?.hidden===true);

  const scholaDock=page.locator("#ao-r17-native-reader-preview .ao-schola-dock");
  const scholaToggle=scholaDock.locator("[data-schola-toggle]");
  await scholaToggle.click();
  assert.equal(await scholaDock.getAttribute("data-collapsed"),"true","Schola hide control did not collapse the dock");
  // A short break in the sung track must not strand the user with an
  // invisible SHOW button. This checks the actual CSS at 390px and 320px.
  for(const width of [390,320]){
    await page.setViewportSize({width,height:844});
    const state=await page.evaluate(()=>{
      const dock=document.querySelector("#ao-r17-native-reader-preview .ao-schola-dock");
      const original=dock.dataset.active;
      dock.dataset.active="false";
      const display=getComputedStyle(dock).display;
      const toggle=dock.querySelector("[data-schola-toggle]");
      const bounds=toggle.getBoundingClientRect();
      dock.dataset.active=original;
      return {display,label:toggle.textContent.trim(),width:bounds.width,height:bounds.height};
    });
    assert.notEqual(state.display,"none","collapsed Schola SHOW handle vanished when Schola became inactive");
    assert.equal(state.label,"SHOW");
    assert.ok(state.width>=44&&state.height>=36,"collapsed Schola handle is not tappable: "+JSON.stringify(state));
  }
  await page.setViewportSize({width:390,height:844});
  const scholaHitGeometry=await page.evaluate(()=>{
    const toggle=document.querySelector("#ao-r17-native-reader-preview [data-schola-toggle]")?.getBoundingClientRect();
    const next=document.querySelector("#ao-r17-native-reader-preview [data-reader-nav='next']")?.getBoundingClientRect();
    const overlap=toggle&&next ? !(next.right<=toggle.left||next.left>=toggle.right||next.bottom<=toggle.top||next.top>=toggle.bottom) : null;
    return {toggle:toggle?{left:toggle.left,right:toggle.right,top:toggle.top,bottom:toggle.bottom}:null,
      next:next?{left:next.left,right:next.right,top:next.top,bottom:next.bottom}:null,overlap};
  });
  assert.equal(scholaHitGeometry.overlap,false,
    "collapsed Schola SHOW control overlaps the Next edge target: "+JSON.stringify(scholaHitGeometry));
  await scholaToggle.click();
  assert.equal(await scholaDock.getAttribute("data-collapsed"),"false","Schola show control did not restore the dock");
  const scholaBefore=await scholaDock.evaluate(el=>el.getBoundingClientRect().height);
  const handle=scholaDock.locator("[data-schola-resize]");
  const handleBox=await handle.boundingBox();
  if(handleBox){
    await page.mouse.move(handleBox.x+handleBox.width/2,handleBox.y+handleBox.height/2);
    await page.mouse.down();
    await page.mouse.move(handleBox.x+handleBox.width/2,Math.max(1,handleBox.y-34),{steps:4});
    await page.mouse.up();
    const scholaAfter=await scholaDock.evaluate(el=>el.getBoundingClientRect().height);
    assert.ok(scholaAfter>scholaBefore+10,"Schola drag handle did not resize the dock");
  }

  // v1.76-v1.80 Schola interaction contract: page/progress, persisted speed,
  // explicit pause/resume, and translation which temporarily pauses motion.
  const scholaState=await page.evaluate(()=>({
    page:document.querySelector("#ao-r17-native-reader-preview [data-role='schola-page']")?.textContent?.trim()??"",
    progress:document.querySelector("#ao-r17-native-reader-preview [data-role='schola-progress']")?.style?.width??"",
    speed:document.querySelector("#ao-r17-native-reader-preview [data-role='schola-speed']")?.textContent?.trim()??"",
    latin:document.querySelector("#ao-r17-native-reader-preview [data-role='schola']")?.textContent?.trim()??"",
  }));
  assert.match(scholaState.page,/\d+\s*\/\s*\d+/,"Schola lost page state");
  assert.match(scholaState.progress,/^\d+(?:\.\d+)?%$/,"Schola lost progress state");
  assert.equal(scholaState.speed,"0.45×","Schola no longer starts on donor default speed");
  assert.ok(scholaState.latin.length>0,"Schola stream is empty");
  const scholaBacking=await scholaDock.evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.equal(scholaBacking,"rgb(17, 25, 20)",
    "Schola dock is translucent and shows competing Latin prayer text behind the controls");

  await scholaDock.locator("[data-schola-faster]").click();
  assert.equal(await scholaDock.locator("[data-role='schola-speed']").textContent(),"0.60×","Schola faster control did not advance donor speed ladder");
  assert.equal(await page.evaluate(()=>localStorage.getItem("ao-schola-speed")),"0.6","Schola speed did not persist");

  const scholaPause=scholaDock.locator("[data-schola-pause]");
  await scholaPause.click();
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"true","Schola pause control did not pause");
  assert.equal((await scholaPause.textContent())?.trim(),"RESUME","paused Schola does not expose resume");
  await scholaPause.click();
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"false","Schola resume control did not resume");

  await scholaDock.locator("[data-schola-translate]").click();
  assert.equal(await scholaDock.getAttribute("data-show-translation"),"true","Schola translation did not open");
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"true","Schola translation did not pause moving text");
  assert.ok(((await scholaDock.locator("[data-role='schola-translation']").textContent())??"").trim().length>0,"Schola translation is empty");
  await scholaDock.locator("[data-schola-translate]").click();
  assert.equal(await scholaDock.getAttribute("data-show-translation"),"false","Schola translation did not close");
  assert.equal(await scholaPause.getAttribute("aria-pressed"),"false","Schola did not resume after translation closed");

  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden===true,null,{timeout:5000});
  await page.screenshot({path:resolve(out,"06-mass-live-opening.png"),fullPage:false});

  await page.locator("#ao-r17-native-reader-preview [data-role='section-jump']").click();
  const hostSection=page.locator("#ao-r17-native-reader-preview [data-reader-section]").filter({hasText:/Consecration.*Host/i}).first();
  assert.equal(await hostSection.count(),1,"source-first section menu exposes no Host Consecration");
  await hostSection.click();
  await page.waitForFunction(()=>/Consecration/i.test(document.querySelector("#ao-r17-native-reader-preview [data-role='section-title']")?.textContent??""),null,{timeout:5000});
  // Section picker is a deliberate jump; only continuous reading owns the
  // v1.80 part-transition overlay. Exact source-cue elevations remain intact.
  const jumpCinema=await page.evaluate(()=>({
    kind:document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.dataset?.kind??null,
    hidden:document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden??null,
  }));
  assert.ok(jumpCinema.hidden || jumpCinema.kind!=="PART_TRANSITION",
    "manual section jump incorrectly played linear-reader part cinematic: "+JSON.stringify(jumpCinema));

  const consecration=await page.evaluate(()=>{
    const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
    const cards=preview?.model?.cards??[];
    const card=preview?.getCurrentCard?.()??null;
    return {
      sectionId:card?.sectionId??null,
      sourceSequence:card?.sourceSequence??card?.sequence??null,
      title:document.querySelector("#ao-r17-native-reader-preview [data-role='card-title']")?.textContent?.trim()??"",
      paragraphs:[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph")].map(x=>x.textContent?.trim()??""),
      primaryTexts:[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph .ao-line-primary")].map(x=>x.textContent?.trim()??""),
      secondaryTexts:[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph .ao-line-secondary")].map(x=>x.textContent?.trim()??""),
      rubricCount:document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph[data-kind='RUBRIC']").length,
      consecrationWordsCount:document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph[data-kind='CONSECRATION_WORDS']").length,
      cardTitleHidden:document.querySelector("#ao-r17-native-reader-preview [data-role='card-title']")?.hidden??false,
      guideShort:document.querySelector("#ao-r17-native-reader-preview [data-role='guide-short']")?.textContent?.trim()??"",
      stageLeft:document.querySelector("#ao-r17-native-reader-preview .ao-reader-stage")?.dataset?.leftRail??null,
      stageRight:document.querySelector("#ao-r17-native-reader-preview .ao-reader-stage")?.dataset?.rightRail??null,
      scholaDock:document.querySelector("#ao-r17-native-reader-preview .ao-schola-dock")?.dataset?.active??null,
      leftActive:document.querySelectorAll("#ao-r17-native-reader-preview .ao-rail-left [data-active='true']").length,
      rightActive:document.querySelectorAll("#ao-r17-native-reader-preview .ao-rail-right [data-active='true']").length,
      guideDisabled:document.querySelector("#ao-r17-native-reader-preview [data-role='guide-button']")?.disabled??null,
      progress:document.querySelector("#ao-r17-native-reader-preview [data-role='progress']")?.textContent?.trim()??"",
      totalCards:preview?.model?.totalCards??cards.length,
      cardIds:cards.map(x=>x.sectionId),
    };
  });
  assert.ok(consecration.sectionId,"source-first reader exposed no Host Consecration section");
  assert.match(consecration.title,/Consecration/i);
  assert.equal(consecration.cardTitleHidden,true,"Consecration duplicated its title inside the prayer card");
  assert.ok(consecration.paragraphs.length>0,"Consecration rendered no prayer text");
  assert.ok(consecration.primaryTexts.some(x=>/Hoc est enim Corpus meum/i.test(x)),"Host Consecration is not Latin-prominent");
  assert.ok(consecration.secondaryTexts.some(x=>/THIS IS MY BODY/i.test(x)),"Host Consecration lost vernacular support beneath Latin");
  assert.ok(consecration.rubricCount>=1,"elevation action still renders as ordinary prayer prose");
  assert.ok(consecration.consecrationWordsCount>=1,"Words of Consecration lost dedicated salience");
  assert.equal(consecration.stageLeft,"true","donor LIVE faithful rail disappeared when no transient cue was active");
  assert.equal(consecration.stageRight,"true","donor LIVE audio rail disappeared at the Consecration");
  const rubricPresentation=await page.evaluate(()=>{
    const rubric=[...document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph[data-kind='RUBRIC']")]
      .find(el=>getComputedStyle(el).display!=="none");
    if(!rubric)return null;
    const cs=getComputedStyle(rubric);
    return {headingDisplay:getComputedStyle(rubric,"::before").display,fontSize:Number.parseFloat(cs.fontSize),text:rubric.textContent.trim()};
  });
  assert.ok(rubricPresentation?.text.length>0,"LIVE rubric source text disappeared");
  assert.equal(rubricPresentation.headingDisplay,"none","LIVE rubric regained repeated micro-sized RUBRIC headings");
  assert.ok(rubricPresentation.fontSize>=12,"LIVE rubrics remain too small to read");

  assert.notEqual(consecration.guideShort,"","short Guide rubric is not visible in the state ribbon");
  await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden===true,null,{timeout:5000});
  await page.screenshot({path:resolve(out,"07-mass-live-consecration.png"),fullPage:false});

  const wordsCue=page.locator("#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='AO.SM.C0173']");
  const elevationCue=page.locator("#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='AO.SM.C0174']");
  assert.equal(await wordsCue.count(),1,"Host Consecration words cue AO.SM.C0173 is not exposed in the source-first reader");
  assert.equal(await elevationCue.count(),1,"Host elevation action cue AO.SM.C0174 is not exposed in the source-first reader");

  await wordsCue.evaluate(el=>{
    const card=el.closest(".ao-prayer-card");
    const cr=card.getBoundingClientRect(),er=el.getBoundingClientRect();
    const top=er.top-cr.top+card.scrollTop;
    const bottom=er.bottom-cr.top+card.scrollTop;
    card.scrollTop=Math.max(0,(top+bottom)/2-card.clientHeight*.39);
    card.dispatchEvent(new Event("scroll"));
  });
  await page.waitForFunction(()=>document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue==="AO.SM.C0173",null,{timeout:5000});
  const wordsState=await page.evaluate(()=>({
    cue:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue??null,
    bellActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='bell']")?.dataset?.active??null,
    cinematicHidden:document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden??null,
    bellOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerBell??null,
    cinematicOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerCinematic??null,
  }));
  assert.equal(wordsState.cue,"AO.SM.C0173");
  assert.equal(wordsState.bellActive,"false","Host words cue fired the elevation bell before the action cue");
  assert.equal(wordsState.cinematicHidden,true,"Host words cue fired the elevation cinematic before the action cue");

  await elevationCue.evaluate(el=>{
    const card=el.closest(".ao-prayer-card");
    const cr=card.getBoundingClientRect(),er=el.getBoundingClientRect();
    const top=er.top-cr.top+card.scrollTop;
    const bottom=er.bottom-cr.top+card.scrollTop;
    card.scrollTop=Math.max(0,(top+bottom)/2-card.clientHeight*.39);
    card.dispatchEvent(new Event("scroll"));
  });
  await page.waitForFunction(()=>
    document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue==="AO.SM.C0174" &&
    document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden===false,
    null,{timeout:5000});
  // The donor used the embedded raw PNG as a currentColor alpha mask.
  // The SVG transport wrapper is only a visible fallback until the source
  // PNG is extracted from the same-origin canonical asset.
  await page.waitForFunction(()=>{
    const icon=document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='cinematic']");
    return icon && !icon.hidden && !icon.classList.contains("ao-icon-direct") &&
      icon.style.maskImage.includes("data:image/png;base64,");
  },null,{timeout:5000});
  const elevationState=await page.evaluate(()=>({
    cue:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue??null,
    bellActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='bell']")?.dataset?.active??null,
    bellText:document.querySelector("#ao-r17-native-reader-preview [data-role='bell']")?.textContent?.trim()??"",
    bellIconHidden:document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='bell']")?.hidden??null,
    bellIconMask:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='bell']");return x?.style?.maskImage||x?.style?.webkitMaskImage||""})(),
    cueStateSupported:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCueState?.()?.supported??null,
    cueStateReason:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCueState?.()?.reason??null,
    cueStateAction:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCueState?.()?.priestAction?.label??null,
    cueStateActionOwner:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCueState?.()?.ownership?.priestAction??null,
    projectedAction:globalThis.AO_R17_NATIVE_READER_STATE?.priestAction?.label??null,
    projectedActionIconKey:globalThis.AO_R17_NATIVE_READER_STATE?.priestActionIconKey??null,
    cinematicKind:document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.dataset?.kind??null,
    cinematicTitle:document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic-title']")?.textContent?.trim()??"",
    cinematicSub:document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic-sub']")?.textContent?.trim()??"",
    cinematicIcon:(()=>{const x=document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='cinematic']");return {
      hidden:x?.hidden??null,
      direct:x?.classList?.contains("ao-icon-direct")??false,
      background:x?.style?.backgroundImage??"",
      mask:x?.style?.maskImage||x?.style?.webkitMaskImage||"",
    }})(),
    bellOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerBell??null,
    cinematicOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerCinematic??null,
  }));
  assert.equal(elevationState.cue,"AO.SM.C0174");
  assert.equal(elevationState.bellActive,"true","Host elevation action cue did not activate the bell channel");
  assert.match(elevationState.bellText,/ELEVATION BELL/i);
  assert.equal(elevationState.bellIconHidden,false,"Host elevation bell rail is active but its icon is hidden");
  assert.match(elevationState.bellIconMask,/mass-v46\/bells\.svg/,
    "Host elevation bell rail is active but is not using the exact v4.6 donor bell art");
  assert.equal(elevationState.cueStateSupported,true,
    "Sung cue-state controller is not active at the Host elevation: "+JSON.stringify(elevationState));
  assert.equal(elevationState.cueStateAction,"ELEVATES HOST",
    "loaded v1.80 priest-action registry does not expose the Host elevation action at AO.SM.C0174: "+JSON.stringify(elevationState));
  assert.equal(elevationState.projectedAction,"ELEVATES HOST",
    "native state projection dropped the Host elevation action after cue resolution");
  assert.equal(elevationState.projectedActionIconKey,"priest_elevate_host_rich","Host elevation cue lost its exact v4.6 action key");
  assert.equal(elevationState.cinematicKind,"ELEVATION");
  const elevationBackdrop=await page.locator("#ao-r17-native-reader-preview [data-role='cinematic']").evaluate(el=>({
    backgroundColor:getComputedStyle(el).backgroundColor,
    backgroundImage:getComputedStyle(el).backgroundImage,
  }));
  assert.equal(elevationBackdrop.backgroundColor,"rgb(7, 11, 8)",
    "Host Elevation illustration is competing with the underlying RUBRIC through a transparent backdrop");
  assert.match(elevationBackdrop.backgroundImage,/radial-gradient/,
    "Host Elevation lost its restrained radial sacred-light treatment");
  assert.equal(elevationState.cinematicTitle,"ELEVATION");
  assert.equal(elevationState.cinematicSub,"SACRED HOST");
  assert.equal(elevationState.cinematicIcon.hidden,false,"Host elevation master is hidden");
  assert.equal(elevationState.cinematicIcon.direct,false,
    "rich Host elevation still uses fixed-colour SVG-wrapper fallback");
  assert.equal(elevationState.cinematicIcon.background,"",
    "rich Host elevation has a competing fixed-colour background image");
  assert.match(elevationState.cinematicIcon.mask,/data:image\/png;base64,/,
    "Host elevation did not restore exact v1.80 transparent-PNG alpha masking");
  const elevationColour=await page.locator("#ao-r17-native-reader-preview [data-icon-slot='cinematic']").evaluate(icon=>({
    color:getComputedStyle(icon).color,
    backgroundColor:getComputedStyle(icon).backgroundColor,
    mask:getComputedStyle(icon).maskImage,
  }));
  assert.equal(elevationColour.backgroundColor,elevationColour.color,
    "Host elevation rich pictogram is no longer liturgical-currentColor adaptive");
  assert.match(elevationColour.mask,/data:image\/png;base64,/,
    "Chromium did not accept the unwrapped v1.80 rich alpha mask");
  assert.match(elevationState.bellOwner,/R17_RECOVERED_CUE_CANONICAL_SOUND_EVENT/);
  assert.match(elevationState.cinematicOwner,/R17_EXACT_ELEVATION_CINEMATIC/);
  await page.screenshot({path:resolve(out,"08-mass-host-elevation.png"),fullPage:false});

  async function focusCanonicalCue(cueId){
    const section=await page.evaluate((id)=>{
      const preview=globalThis.AO_R17_NATIVE_READER_PREVIEW;
      const target=(preview?.model?.cards??[]).find(card=>(card?.paragraphs??[]).some(p=>(p?.sourceCueIds??[]).includes(id)));
      if(!target)return null;
      preview.showSection?.(target.sectionId);
      return {sectionId:target.sectionId,title:target.title};
    },cueId);
    assert.ok(section?.sectionId,"source-first display model has no section for "+cueId);
    // Direct section navigation has no part-transition cinematic; allow
    // any genuine cue-scoped cinema to complete for salience screenshots.
    await page.waitForFunction(()=>document.querySelector("#ao-r17-native-reader-preview [data-role='cinematic']")?.hidden===true,null,{timeout:5000});
    const cue=page.locator(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${cueId}']`);
    assert.equal(await cue.count(),1,cueId+" is not exposed exactly once in the current source-first section");
    for(let attempt=0;attempt<30;attempt++){
      await cue.evaluate((el,attempt)=>{
        const card=el.closest(".ao-prayer-card");
        const cr=card.getBoundingClientRect(),er=el.getBoundingClientRect();
        const top=er.top-cr.top+card.scrollTop;
        const bottom=er.bottom-cr.top+card.scrollTop;
        const max=Math.max(0,card.scrollHeight-card.clientHeight);
        const target=Math.min(max,Math.max(0,(top+bottom)/2-card.clientHeight*.39));
        // An early cue may have no possible fixed-39% position. Scroll a
        // little further on retries to exercise its adaptive opening zone.
        card.scrollTop=Math.min(max,Math.max(target,attempt*12));
        card.dispatchEvent(new Event("scroll"));
      },attempt);
      await page.waitForTimeout(100);
      const active=await page.evaluate(()=>document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue??null);
      if(active===cueId)break;
    }
    const focusDebug=await page.evaluate((id)=>{
      const root=document.getElementById("ao-r17-native-reader-preview");
      const el=document.querySelector(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${id}']`);
      const card=el?.closest(".ao-prayer-card");
      const cr=card?.getBoundingClientRect(),er=el?.getBoundingClientRect();
      return {
        expected:id,
        active:root?.dataset?.r17NativeCue??null,
        scrollTop:card?.scrollTop??null,
        maxScroll:card?Math.max(0,card.scrollHeight-card.clientHeight):null,
        clientHeight:card?.clientHeight??null,
        targetTop:cr&&er?er.top-cr.top+(card?.scrollTop??0):null,
        targetBottom:cr&&er?er.bottom-cr.top+(card?.scrollTop??0):null,
        targetActive:el?.dataset?.active??null,
      };
    },cueId);
    assert.equal(focusDebug.active,cueId,"exact cue did not acquire 39% focus territory: "+JSON.stringify(focusDebug));
    return page.evaluate((id)=>({
      cue:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17NativeCue??null,
      section:document.querySelector("#ao-r17-native-reader-preview [data-role='section-title']")?.textContent?.trim()??"",
      gesture:document.querySelector("#ao-r17-native-reader-preview [data-role='gesture']")?.textContent?.trim()??"",
      response:document.querySelector("#ao-r17-native-reader-preview [data-role='response']")?.textContent?.trim()??"",
      responseActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='response']")?.dataset?.active??null,
      posture:document.querySelector("#ao-r17-native-reader-preview [data-role='posture']")?.textContent?.trim()??"",
      leftRail:document.querySelector("#ao-r17-native-reader-preview .ao-reader-stage")?.dataset?.leftRail??null,
      gestureActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='gesture']")?.dataset?.active??null,
      postureActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='posture']")?.dataset?.active??null,
      gestureIconHidden:document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='gesture']")?.hidden??null,
      postureIconHidden:document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='posture']")?.hidden??null,
      scholaSharedActive:document.querySelector("#ao-r17-native-reader-preview [data-channel='schola-shared']")?.dataset?.active??null,
      scholaSharedIconHidden:document.querySelector("#ao-r17-native-reader-preview [data-icon-slot='schola-shared']")?.hidden??null,
      scholaDockActive:document.querySelector("#ao-r17-native-reader-preview .ao-schola-dock")?.dataset?.active??null,
      activeParagraphs:document.querySelectorAll("#ao-r17-native-reader-preview .ao-reader-paragraph[data-active='true']").length,
      targetActive:document.querySelector(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${id}']`)?.dataset?.active??null,
      gestureOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerGesture??null,
      anchorWords:[...document.querySelectorAll(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${id}'] .ao-ritual-trigger-live`)].map(el=>el.textContent.trim()),
      anchorFlag:document.querySelector(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${id}']`)?.dataset.ritualCueActive??null,
      // Verify that triggering a transient action does not rebuild the
      // source paragraph or steal focus/translation state on cue updates.
      anchoredParagraphSource:document.querySelector(`#ao-r17-native-reader-preview .ao-reader-paragraph[data-cue-id='${id}'] .ao-line-primary`)?.textContent?.trim()??"",

      postureOwner:document.getElementById("ao-r17-native-reader-preview")?.dataset?.r17OwnerPosture??null,
    }),cueId);
  }

  // Multi-fragment and single-word anchors are resolved at exactly their
  // canonical cue, not merely at the section or card level.
  const gloriaAdoramus=await focusCanonicalCue("AO.SM.C0056");
  assert.ok(gloriaAdoramus.anchorWords.some(word=>/Ador[aá]mus te|We adore thee|Nous vous adorons/i.test(word)),
    "Adoramus te gesture rail activates without highlighting the sourced phrase in the displayed language: "+JSON.stringify(gloriaAdoramus));
  assert.equal(gloriaAdoramus.anchorFlag,"true");

  const gloriaBow=await focusCanonicalCue("AO.SM.C0061");
  assert.match(gloriaBow.gesture,/BOW HEAD/i,"Traditional Gloria Holy Name cue is not visibly salient");
  assert.equal(gloriaBow.posture,"STAND","Gloria posture did not remain visible in the faithful state ribbon");
  assert.equal(gloriaBow.leftRail,"true","active Gloria gesture did not reveal the faithful cue rail");
  assert.equal(gloriaBow.gestureActive,"true");
  assert.equal(gloriaBow.postureActive,"true");
  assert.equal(gloriaBow.gestureIconHidden,false,"Gloria bow lost its canonical gesture icon");
  const priestBowArt=await page.evaluate(()=>{
    const root=document.getElementById("ao-r17-native-reader-preview");
    const rail=root?.querySelector('.ao-rail-right [data-channel="priest-action"]');
    const art=root?.querySelector('[data-icon-slot="priest-action"]');
    return {active:rail?.dataset.active,hidden:art?.hidden??null,
      image:art?.style.backgroundImage??"",mask:art?.style.maskImage??""};
  });
  assert.equal(priestBowArt.active,"true","Gloria source priest bow action is missing from the rail");
  assert.equal(priestBowArt.hidden,false,
    "matrix BOWS HEAD incorrectly overrode the correctly bound rubric head_bow artwork");
  assert.equal(gloriaBow.scholaSharedActive,"true","shared Gloria text lost the v1.76 right-rail Schola indicator");
  assert.equal(gloriaBow.scholaSharedIconHidden,false,"shared Gloria text has no visible Schola pictogram");
  assert.equal(gloriaBow.scholaDockActive,"false","shared Gloria text duplicated itself in the Schola dock");
  assert.equal(gloriaBow.targetActive,"true","Gloria bow cue is not the active focus paragraph");
  assert.equal(gloriaBow.anchorFlag,"true","Gloria bow rail/Latin anchor state diverged");
  assert.ok(gloriaBow.anchorWords.some(word=>/Iesu Christe|Jesu Christe|Jesus Christ|Jésus-Christ/i.test(word)),
    "Gloria Holy Name bow cue lacks its source-aligned phrase highlight: "+JSON.stringify(gloriaBow));
  assert.ok(!gloriaBow.anchorWords.some(word=>/Ador[aá]mus te|We adore thee|Nous vous adorons/i.test(word)),
    "Gloria previous-word ritual highlight leaked into the next cue");
  await page.screenshot({path:resolve(out,"09-mass-gloria-bow.png"),fullPage:false});

  // Source-owned v1.80 LISTEN cue appears during actual sung priest text,
  // but the separate faithful response and posture channels remain independent.
  const collectListening=await focusCanonicalCue("AO.SM.C0070");
  const listenCue=await page.evaluate(()=>{
    const rail=document.querySelector("#ao-r17-native-reader-preview .ao-rail-left [data-channel='attention']");
    const image=rail?.querySelector('[data-icon-slot="attention"]');
    const postureCue=document.querySelector("#ao-r17-native-reader-preview .ao-rail-left [data-channel='posture-change']");
    return {active:rail?.dataset.active,display:rail?getComputedStyle(rail).display:null,
      iconHidden:image?.hidden??null,iconMask:image?.style.maskImage??"",
      postureCueActive:postureCue?.dataset.active??null};
  });
  assert.equal(listenCue.active,"true","sung Collect did not activate the faithful LISTEN channel: "+JSON.stringify({collectListening,listenCue}));
  assert.equal(listenCue.display,"grid","LISTEN cue exists but is hidden by rail CSS");
  assert.equal(listenCue.iconHidden,false,"LISTEN cue lost its exact donor art");
  assert.match(listenCue.iconMask,/listen\.svg/,"LISTEN cue resolved to the wrong donor key");
  assert.equal(listenCue.postureCueActive,"false",
    "persistent STAND was duplicated as a second posture-change icon");

  const incarnatus=await focusCanonicalCue("AO.SM.C0096");
  assert.match(incarnatus.gesture,/GENUFLECT/i,"Incarnatus genuflection is not visibly salient");
  assert.equal(incarnatus.posture,"STAND","Incarnatus transient genuflection incorrectly replaced the persistent standing posture");
  assert.equal(incarnatus.leftRail,"true");
  assert.equal(incarnatus.gestureIconHidden,false,"Incarnatus lost its canonical genuflect icon");
  assert.equal(incarnatus.targetActive,"true");
  assert.equal(incarnatus.anchorFlag,"true","Incarnatus genuflect rail did not activate its Latin words");
  assert.ok(incarnatus.anchorWords.some(word=>/Et incarn[aá]tus est|And was incarnate|Il a pris chair/i.test(word)) &&
    incarnatus.anchorWords.some(word=>/et homo factus est|and was made man|s.est fait homme/i.test(word)),
    "Credo Incarnatus sourced opening and closing words are not highlighted as its gesture engages: "+JSON.stringify(incarnatus));
  await page.screenshot({path:resolve(out,"10-mass-incarnatus.png"),fullPage:false});

  // Check unrelated phases, not just Gloria/Credo. These anchors belong to
  // their exact canonical cues, in the language the reader already displays.
  const confiteorStrike=await focusCanonicalCue("AO.SM.C0022");
  assert.match(confiteorStrike.gesture,/STRIKE BREAST/i);
  assert.equal(confiteorStrike.anchorFlag,"true");
  assert.ok(confiteorStrike.anchorWords.some(word=>/mea culpa|through my fault|C.est ma faute/i.test(word)),
    "Confiteor triple breast-strike lacks its source-owned word highlight: "+JSON.stringify(confiteorStrike));

  const nobisStrike=await focusCanonicalCue("AO.SM.C0196");
  assert.match(nobisStrike.gesture,/STRIKE BREAST/i);
  assert.equal(nobisStrike.anchorFlag,"true");
  assert.ok(nobisStrike.anchorWords.some(word=>/Nobis quoque peccat[oó]ribus|To us also|À nous aussi/i.test(word)),
    "Nobis quoque breast-strike and its words are not synchronized: "+JSON.stringify(nobisStrike));

  const nextNobis=await focusCanonicalCue("AO.SM.C0197");
  assert.equal(nextNobis.gestureActive,"false","Nobis breast strike is incorrectly repeated on the following Canon sentence");
  assert.notEqual(nextNobis.anchorFlag,"true","Nobis words remained highlighted after the strike cue");

  const agnus=await focusCanonicalCue("AO.SM.C0222");
  assert.match(agnus.gesture,/STRIKE BREAST/i,"Agnus Dei breast-strike cue is not visibly salient");
  assert.equal(agnus.posture,"STAND","Agnus Dei source posture is not visible in the faithful state ribbon");
  assert.equal(agnus.leftRail,"true");
  assert.equal(agnus.gestureIconHidden,false,"Agnus Dei breast strike lost its canonical icon");
  assert.equal(agnus.targetActive,"true");
  assert.equal(agnus.anchorFlag,"true");
  assert.ok(agnus.anchorWords.some(word=>/Agnus Dei|Lamb of God|Agneau de Dieu/i.test(word)),
    "Agnus Dei breast-strike failed to highlight the invocation");
  for(const cueId of ["AO.SM.C0223","AO.SM.C0224"]){
    const repeat=await focusCanonicalCue(cueId);
    assert.match(repeat.gesture,/STRIKE BREAST/i,"each Agnus Dei invocation must own one distinct strike");
    assert.equal(repeat.anchorFlag,"true");
    assert.ok(repeat.anchorWords.some(word=>/Agnus Dei|Lamb of God|Agneau de Dieu/i.test(word)),
      "repeated Agnus Dei cue lacks its own highlight: "+JSON.stringify(repeat));
  }
  await page.screenshot({path:resolve(out,"11-mass-agnus-dei.png"),fullPage:false});

  const lastGospelGenuflect=await focusCanonicalCue("AO.SM.C0273");
  assert.match(lastGospelGenuflect.gesture,/GENUFLECT/i,"Last Gospel ET VERBUM CARO cue is not visibly salient");
  assert.equal(lastGospelGenuflect.posture,"STAND","Last Gospel persistent posture should remain standing around the transient genuflection");
  assert.equal(lastGospelGenuflect.leftRail,"true");
  assert.equal(lastGospelGenuflect.gestureIconHidden,false,"Last Gospel genuflect lost its canonical icon");
  assert.equal(lastGospelGenuflect.targetActive,"true");
  assert.equal(lastGospelGenuflect.anchorFlag,"true");
  assert.ok(lastGospelGenuflect.anchorWords.some(word=>/ET VERBUM CARO FACTUM EST|AND THE WORD WAS MADE FLESH|ET LE VERBE S.EST FAIT CHAIR/i.test(word)),
    "Last Gospel genuflection words not synchronized with the gesture icon");
  await page.screenshot({path:resolve(out,"12-mass-last-gospel-genuflect.png"),fullPage:false});

  const lastGospelRise=await focusCanonicalCue("AO.SM.C0274");
  assert.match(lastGospelRise.gesture,/RISE/i,"Last Gospel return-to-standing cue is not visibly salient");
  assert.equal(lastGospelRise.posture,"STAND");
  assert.equal(lastGospelRise.leftRail,"true");
  assert.equal(lastGospelRise.targetActive,"true");
  assert.equal(lastGospelRise.anchorFlag,"true");
  assert.ok(lastGospelRise.anchorWords.some(word=>/Et habit[aá]vit in nobis|And dwelt among us|et il a habit[eé] parmi nous/i.test(word)),
    "Last Gospel return to standing does not identify its exact source words");

  const dismissalResponse=await focusCanonicalCue("AO.SM.C0260");
  assert.equal(dismissalResponse.responseActive,"true","Deo gratias source response not present at dismissal");
  assert.match(dismissalResponse.response,/Deo gr[aá]tias/i);
  const afterDismissal=await focusCanonicalCue("AO.SM.C0261");
  assert.equal(afterDismissal.responseActive,"false","Deo gratias response persists after its actual source cue");

  // Donor-parity guard for the regression visible on wide browsers: the reader
  // must remain a centred ritual surface, not expand into a dashboard-width card.
  await page.setViewportSize({width:1440,height:900});
  await page.waitForTimeout(80);
  const wide=await page.evaluate(()=>{
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const mode=root?.querySelector(".ao-mode-ribbon");
    const viewport=root?.querySelector(".ao-card-viewport");
    const card=root?.querySelector(".ao-prayer-card");
    const body=root?.querySelector(".ao-prayer-body");
    const left=root?.querySelector(".ao-rail-left");
    const right=root?.querySelector(".ao-rail-right");
    const nonActive=[...root?.querySelectorAll?.(".ao-reader-paragraph:not([data-active='true'])")??[]]
      .map(node=>Number.parseFloat(getComputedStyle(node).opacity))
      .filter(Number.isFinite);
    const rect=x=>x?(()=>{const r=x.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom}})():null;
    const cs=card?getComputedStyle(card):null;
    return {
      shell:rect(root),
      modeRibbon:rect(mode),
      cardViewport:rect(viewport),
      prayerBody:rect(body),
      cardBorderTop:cs?.borderTopWidth??null,
      cardBackgroundImage:cs?.backgroundImage??null,
      cardBoxShadow:cs?.boxShadow??null,
      leftRailDisplay:left?getComputedStyle(left).display:null,
      rightRailDisplay:right?getComputedStyle(right).display:null,
      nonActiveOpacityMin:nonActive.length?Math.min(...nonActive):null,
    };
  });
  assert.ok(wide.modeRibbon?.width<340,"mode selector regressed into browser-width tabs: "+JSON.stringify(wide));
  assert.ok(wide.cardViewport?.width>=wide.prayerBody?.width,"transparent reader viewport no longer contains the centred prayer measure");
  assert.ok(wide.prayerBody?.width<=800,"prayer measure lost donor 790px maximum: "+JSON.stringify(wide));
  assert.equal(wide.cardBorderTop,"0px","giant bordered prayer card chrome returned");
  assert.equal(wide.cardBackgroundImage,"none","giant panel background returned behind prayer text");
  assert.equal(wide.cardBoxShadow,"none","giant card shadow returned");
  assert.equal(wide.leftRailDisplay,"flex","left ritual rail is not persistent in LIVE");
  assert.equal(wide.rightRailDisplay,"flex","right ritual rail is not persistent in LIVE");
  if(wide.nonActiveOpacityMin!=null)assert.ok(wide.nonActiveOpacityMin>=0.39,
    "surrounding prayer text became unreadably dark again: "+JSON.stringify(wide));
  await page.screenshot({path:resolve(out,"13-mass-wide-donor-shell.png"),fullPage:false});

  // Run the same R17 production shell with real 1962 Palm/Candlemas/
  // Requiem prelude graphs. Assertions exercise actual clickable buttons and
  // the Gospel-word gesture, not mock snapshots or an isolated CSS example.
  await page.setViewportSize({width:390,height:844});
  async function mountSpecialRite(kind){
    return page.evaluate(async kind=>{
      globalThis.AO_R17_NATIVE_READER_PREVIEW?.destroy?.();
      const {mountNativeReaderPreview}=await import("/src/mass/reader-native-preview.js");
      const {createHostIconResolver}=await import("/src/mass/reader-icons.js");
      const {R17_FROZEN_ACTIVE_ICON_ASSETS}=await import("/src/mass/reader-icon-bank.js");
      const base=globalThis.__AO_SPECIAL_RITE_VISUAL_PREPARED;
      const previous=base.session.resolvedMass;
      const prelude=kind==="PALM"?"PALM":kind==="CANDLEMAS"?"CANDLEMAS":null;
      const following=kind==="REQUIEM"?"REQUIEM_ABSOLUTION":
        kind==="HOLY_THURSDAY"?"HOLY_THURSDAY_POST":null;
      const resolvedMass={
        ...previous,
        precedingRites:prelude?[prelude]:[],
        followingActions:following?[following]:[],
        overlays:following?["REQUIEM"]:previous.overlays,
        provenance:{
          ...previous.provenance,
          ...(following?{requiemAbsolution:{bodyPresent:true,burialProcession:true}}:{}),
        },
      };
      const plan={
        ...base.session.plan,
        precedingGraphs:prelude?[prelude]:[],
        followingGraphs:following?[following]:[],
        overlayGraphs:following?["REQUIEM"]:base.session.plan.overlayGraphs,
        massEntry:prelude?"INTROIT":"FOOT",
        normalLastGospel:!["PALM","REQUIEM","HOLY_THURSDAY"].includes(kind),
        blessingAllowed:!["REQUIEM","HOLY_THURSDAY"].includes(kind),
      };
      delete plan.lifecycle;
      const prepared={...base,session:{...base.session,resolvedMass,plan}};
      const api=await mountNativeReaderPreview({
        prepared,iconResolver:createHostIconResolver({assets:R17_FROZEN_ACTIVE_ICON_ASSETS}),
      });
      globalThis.__AO_SPECIAL_RITE_VISUAL_API=api;
      return {first:api.getCurrentCard()?.id,hasRoot:Boolean(api.root)};
    },kind);
  }
  async function advanceRiteTo(target,max=10){
    for(let attempt=0;attempt<max;attempt++){
      const current=await page.evaluate(()=>{
        const api=globalThis.__AO_SPECIAL_RITE_VISUAL_API;
        return api?.getCurrentCard()?.id??api?.getCurrentCard()?.sectionId??null;
      });
      if(current===target)return;
      await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
      await page.waitForTimeout(390);
    }
    const final=await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API?.getCurrentCard()?.id);
    assert.equal(final,target,"special rite navigation did not reach "+target);
  }

  const palmStart=await mountSpecialRite("PALM");
  assert.equal(palmStart.first,"PALM-R01");
  assert.equal(await page.locator("#ao-r17-native-reader-preview [data-role='rite-choice']:visible").count(),0,
    "Palm participation capsule permanently cluttered the common blessing");
  await advanceRiteTo("PALM-R03");
  const palmOpening=await page.evaluate(()=>{
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const target=root.querySelector('[data-paragraph-id="PALM-R03-01"]');
    return {
      sourceCue:target?.dataset.cueId,
      active:target?.dataset.active,
      anchorWords:[...target?.querySelectorAll(".ao-ritual-trigger-live")??[]].map(x=>x.textContent.trim()),
      gesture:root.querySelector('[data-role="gesture"]')?.textContent?.trim()??"",
      iconVisible:root.querySelector('[data-icon-slot="gesture"]')?.hidden===false,
    };
  });
  assert.equal(palmOpening.sourceCue,"PALM-R03-01",
    "Palm crosses assigned to a whole Gospel source block instead of its heading");
  assert.equal(palmOpening.active,"true");
  assert.ok(palmOpening.anchorWords.some(word=>/Sequ[eé]ntia sancti Evang[eé]lii/i.test(word.normalize("NFD").replace(/\p{M}/gu,""))),
    "Palm Gospel crosses missing exact source-text highlight: "+JSON.stringify(palmOpening));
  assert.match(palmOpening.gesture,/Forehead.*lips.*breast/i);
  assert.equal(palmOpening.iconVisible,true,"Palm Gospel heading has no dedicated small-cross icon");
  await page.locator("#ao-r17-native-reader-preview .ao-prayer-card").evaluate(card=>{
    card.scrollTop=220;
    card.dispatchEvent(new Event("scroll"));
  });
  await page.waitForTimeout(160);
  const palmReading=await page.evaluate(()=>{
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const opening=root.querySelector('[data-paragraph-id="PALM-R03-01"]');
    return {
      active:opening?.dataset.active,
      highlighted:opening?.querySelectorAll(".ao-ritual-trigger-live").length??0,
      railActive:root.querySelector('[data-channel="gesture"]')?.dataset.active,
      owner:root.dataset.r17OwnerGesture,
    };
  });
  assert.equal(palmReading.active,"false","Palm Gospel crosses held past proclamation heading");
  assert.equal(palmReading.highlighted,0,"Palm heading words remained highlighted during the reading");
  assert.equal(palmReading.railActive,"false","Palm Gospel-cross icon remained in rail throughout the reading");
  await advanceRiteTo("PALM-R04");
  const palmChoice=page.locator("#ao-r17-native-reader-preview [data-role='rite-choice']");
  assert.equal(await palmChoice.isVisible(),true,"Palm processional choice not shown at procession");
  assert.equal(await palmChoice.locator('[data-rite-participation="false"]').getAttribute("aria-pressed"),"true");
  await page.setViewportSize({width:320,height:700});
  const choiceBox=await palmChoice.boundingBox();
  assert.ok(choiceBox&&choiceBox.x>=-0.5&&choiceBox.x+choiceBox.width<=320.5,
    "procession control overflows a 320px device: "+JSON.stringify(choiceBox));
  const joinPalm=palmChoice.locator('[data-rite-participation="true"]');
  const joinBox=await joinPalm.boundingBox();
  assert.ok(joinBox&&joinBox.height>=44,"procession Join target is below 44px");
  await page.touchscreen.tap(joinBox.x+joinBox.width/2,joinBox.y+joinBox.height/2);
  assert.equal(await joinPalm.getAttribute("aria-pressed"),"true",
    "touch selection failed to commit Palm personal participation");
  assert.equal(await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getPalmState().posture),"PROCESSIONAL");
  await page.locator('[data-rite-participation="false"]').click();
  assert.equal(await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getPalmState().posture),null);
  await advanceRiteTo("PALM-R06");
  assert.equal(await palmChoice.isVisible(),false,"Palm choice persisted into common final prayer");

  await page.setViewportSize({width:390,height:844});
  const candlemasStart=await mountSpecialRite("CANDLEMAS");
  assert.equal(candlemasStart.first,"CND-R01");
  await advanceRiteTo("CND-R03");
  await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.setCandlemasRecipientState("RECEIVE_CANDLE"));
  await advanceRiteTo("CND-R05");
  const candleChoice=page.locator("#ao-r17-native-reader-preview [data-role='rite-choice']");
  assert.equal(await candleChoice.isVisible(),true);
  assert.equal(await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getCandlemasState().candleState),
    "BLESSED_CANDLE_HELD");
  await candleChoice.locator('[data-rite-participation="true"]').click();
  const candleJoined=await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getCandlemasState());
  assert.equal(candleJoined.posture,"PROCESSIONAL");
  assert.equal(candleJoined.candleState,"CANDLE_LIT");
  await candleChoice.locator('[data-rite-participation="false"]').click();
  assert.equal(await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getCandlemasState().posture),null);

  const requiemStart=await mountSpecialRite("REQUIEM");
  assert.ok(requiemStart.hasRoot);
  const requiemJump=await page.evaluate(()=>{
    const api=globalThis.__AO_SPECIAL_RITE_VISUAL_API;
    const cards=api.model.cards;
    const terminal=cards.at(-1);
    // A Requiem suppresses the final blessing, which is a separate split
    // M29.B presentation card. The last *visible* Mass card is M29.A Placeat.
    const lastAllowed=cards.findLast(card=>
      Number(card.sourceSequence)===29 &&
      !card.blocks?.some(block=>block.blockId==="AO.SM.B092"));
    const shown=api.showSection(lastAllowed.sectionId);
    return {
      terminal:{sectionId:terminal?.sectionId,sourceSequence:terminal?.sourceSequence,sourceSectionId:terminal?.sourceSectionId},
      lastAllowed:{sectionId:lastAllowed?.sectionId,sourceSequence:lastAllowed?.sourceSequence,sourceSectionId:lastAllowed?.sourceSectionId},
      shown:shown?.sectionId??null,
      current:api.getCurrentCard()?.sectionId??null,
      following:api.getLifecycleState()?.contract?.followingAction??null,
    };
  });
  assert.equal(requiemJump.shown,requiemJump.lastAllowed.sectionId,
    "Requiem source-plan last card could not be selected: "+JSON.stringify(requiemJump));
  await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
  await page.waitForTimeout(500);
  const requiemFirst=await page.evaluate(()=>{
    const api=globalThis.__AO_SPECIAL_RITE_VISUAL_API;
    return {
      card:api.getCurrentCard()?.id??api.getCurrentCard()?.sectionId??null,
      active:api.getRequiemAbsolutionState()?.card?.id??null,
      lifecycle:api.getLifecycleState()?.stage??null
    };
  });
  assert.equal(requiemFirst.active,"ABS-R01",
    "Mass/Requiem Absolution handoff failed: "+JSON.stringify({requiemJump,requiemFirst}));
  await advanceRiteTo("ABS-R05",10);
  const burialChoice=page.locator("#ao-r17-native-reader-preview [data-role='rite-choice']");
  assert.equal(await burialChoice.isVisible(),true,"Requiem burial procession choice missing");
  assert.equal(await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getRequiemAbsolutionState().posture),null);
  await burialChoice.locator('[data-rite-participation="true"]').click();
  assert.equal(await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getRequiemAbsolutionState().posture),
    "PROCESSIONAL");
  await burialChoice.locator('[data-rite-participation="false"]').click();
  assert.equal(await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getRequiemAbsolutionState().posture),null);

  const specialRites={palmOpening,palmReading,palmStart,candlemasStart,requiemStart};
  await page.screenshot({path:resolve(out,"14-special-rite-participation.png"),fullPage:false});

  // Good Friday remains a distinct 56-record rite: the personal act is not
  // driven by the Improperia soundtrack, and the death pause belongs to
  // "tradidit spiritum", not the beginning of the long Passion paragraph.
  const goodFridayMounted=await page.evaluate(async()=>{
    globalThis.__AO_SPECIAL_RITE_VISUAL_API?.destroy?.();
    const {mountNativeReaderPreview}=await import("/src/mass/reader-native-preview.js");
    const {makeResolvedMass,compileMassPlan}=await import("/src/mass/session-engine.js");
    const {createHostIconResolver}=await import("/src/mass/reader-icons.js");
    const {R17_FROZEN_ACTIVE_ICON_ASSETS}=await import("/src/mass/reader-icon-bank.js");
    const resolvedMass=makeResolvedMass({
      date:"2027-03-26",form:"SOLEMN",presentationMode:"LIVE",
      calendarCelebration:{id:"good-friday",type:"CALENDAR",title:"Good Friday"},
      distinctRite:"GOOD_FRIDAY",
      provenance:{goodFriday:{venerationMode:"PERSONAL"}},
    });
    const prepared={
      ...globalThis.__AO_SPECIAL_RITE_VISUAL_PREPARED,
      session:{resolvedMass,plan:compileMassPlan(resolvedMass)},
    };
    const api=await mountNativeReaderPreview({
      prepared,iconResolver:createHostIconResolver({assets:R17_FROZEN_ACTIVE_ICON_ASSETS}),
    });
    globalThis.__AO_GOOD_FRIDAY_VISUAL_API=api;
    return {
      record:api.getGoodFridayState()?.step?.recordId,
      ordinaryMassGraph:api.ownership.ordinaryMassGraph,
    };
  });
  assert.equal(goodFridayMounted.ordinaryMassGraph,"INACTIVE");
  assert.equal(goodFridayMounted.record,"GF-OPEN-010");
  const gfPanel=page.locator("#ao-r17-native-reader-preview [data-role='good-friday-personal']");
  assert.equal(await gfPanel.isVisible(),false,"personal Good Friday controls appeared in opening rites");

  await page.evaluate(()=>globalThis.__AO_GOOD_FRIDAY_VISUAL_API.goToGoodFridayRecord("GF-PASS-310"));
  const beforeDeath=await page.evaluate(()=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    const card=api.root.querySelector(".ao-prayer-card");
    const p=card.querySelector('.ao-reader-paragraph[data-cue-id="GF-PASS-320"]');
    const text=p?.querySelector(".ao-line-primary")?.firstChild;
    const needle="tradidit spiritum";
    const offset=String(text?.textContent??"").toLowerCase().lastIndexOf(needle);
    if(!text||offset<0)return {offset,present:Boolean(p)};
    const range=document.createRange();
    range.setStart(text,offset);range.setEnd(text,offset+needle.length);
    const phrase=range.getBoundingClientRect(),r=card.getBoundingClientRect();
    card.scrollTop=Math.max(0,Math.min(card.scrollHeight-card.clientHeight,
      card.scrollTop+phrase.top-r.top-card.clientHeight*.37));
    card.dispatchEvent(new Event("scroll"));
    return {offset,record:api.getGoodFridayState().step.recordId,scroll:card.scrollTop};
  });
  assert.ok(beforeDeath.offset>=0,"source Passion death words were not assigned to the Good Friday cue");
  await page.waitForTimeout(180);
  const deathPosition=await page.evaluate(()=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    const card=api.root.querySelector(".ao-prayer-card");
    const p=card.querySelector('.ao-reader-paragraph[data-cue-id="GF-PASS-320"]');
    const bounds=p?.getBoundingClientRect(),viewport=card.getBoundingClientRect();
    return {
      record:api.getGoodFridayState().step.recordId,
      scrollTop:card.scrollTop,
      maxScroll:card.scrollHeight-card.clientHeight,
      cueParagraphTop:bounds?.top??null,
      focusLine:viewport.top+card.clientHeight*.39,
    };
  });
  assert.equal(deathPosition.record,"GF-PASS-320",
    "scrolling to the exact Passion death words did not start the kneeling pause: "+JSON.stringify({beforeDeath,deathPosition}));
  const atDeath=await page.evaluate(()=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    const p=api.root.querySelector('.ao-reader-paragraph[data-cue-id="GF-PASS-320"]');
    return {
      record:api.getGoodFridayState().step.recordId,
      posture:api.root.querySelector('[data-role="posture"]')?.textContent?.trim(),
      active:p?.dataset.active,
      highlighted:[...p?.querySelectorAll(".ao-ritual-trigger-live")??[]].map(n=>n.textContent.trim()),
      panel:api.root.querySelector('[data-role="good-friday-personal"]')?.hidden,
    };
  });
  assert.equal(atDeath.posture,"KNEEL");
  assert.equal(atDeath.active,"true");
  assert.ok(atDeath.highlighted.some(x=>/tradidit spiritum/i.test(x)),
    "Passion death kneel did not highlight the exact Latin words: "+JSON.stringify(atDeath));
  assert.equal(atDeath.panel,false,"death pause lacks an explicit continue action");
  await page.screenshot({path:resolve(out,"15-good-friday-death-pause.png"),fullPage:false});
  await gfPanel.locator("[data-good-friday-advance]").click();
  const afterDeath=await page.evaluate(()=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    return {
      record:api.getGoodFridayState().step.recordId,
      posture:api.root.querySelector('[data-role="posture"]')?.textContent?.trim(),
      lingering:api.root.querySelectorAll(".ao-ritual-trigger-live").length,
      panel:api.root.querySelector('[data-role="good-friday-personal"]')?.hidden,
    };
  });
  assert.equal(afterDeath.record,"GF-PASS-330");
  assert.equal(afterDeath.posture,"STAND","Passion narration did not restore standing");
  assert.equal(afterDeath.lingering,0,"Passion death highlight continued into resumed reading");
  assert.equal(afterDeath.panel,true,"the death pause capsule persisted after resuming");

  // Exercise every Good Friday Solemn Prayer as a separate source-led
  // kneel-at-Flectamus / stand-at-Levate transition on an actual 390px
  // Chromium reader, including prayer VIII's printed 1962 Latin text.
  async function focusGoodFridayWord(cueId){
    return page.evaluate(cueId=>{
      const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
      const card=api.root.querySelector(".ao-prayer-card");
      const p=[...card.querySelectorAll(".ao-reader-paragraph[data-cue-id]")]
        .find(x=>x.dataset.cueId===cueId);
      if(!p)return {missing:cueId,current:api.getGoodFridayState().step.recordId};
      const rect=p.getBoundingClientRect(),frame=card.getBoundingClientRect();
      const target=card.scrollTop+rect.top-frame.top-card.clientHeight*.39+2;
      // A source cue already aligned with the 39% line at card-open has
      // not yet been encountered by scrolling. Advance a minimal 12px
      // rather than pretending the card's initial paint triggers speech.
      // Levate requires a second, distinct forward movement after kneeling;
      // duplicate browser scroll events at the same position do not suffice.
      const minForward=/-R$/.test(cueId)?card.scrollTop+4:12;
      card.scrollTop=Math.min(card.scrollHeight-card.clientHeight,
        Math.max(12,target,minForward));
      card.dispatchEvent(new Event("scroll"));
      return {cueId,scrollTop:card.scrollTop,maxScroll:card.scrollHeight-card.clientHeight,
        paragraphTop:rect.top,viewportTop:frame.top,viewportHeight:card.clientHeight};
    },cueId);
  }
  const prayerChecks=[];
  for(let n=1;n<=9;n++){
    const nn=String(n).padStart(2,"0"),kneel="GF-SOP-"+nn+"-K",rise="GF-SOP-"+nn+"-R";
    await page.evaluate(id=>globalThis.__AO_GOOD_FRIDAY_VISUAL_API.goToGoodFridayRecord(id),kneel);
    const before=await page.evaluate(()=>{
      const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
      return {posture:api.root.querySelector('[data-role="posture"]')?.textContent?.trim(),
        formula:globalThis.AO_R17_NATIVE_READER_STATE?.exactFormulaActive??null};
    });
    assert.equal(before.posture,"STAND","Prayer "+n+" knee cue activated before Flectamus");
    assert.equal(before.formula,null);
    const kGeometry=await focusGoodFridayWord(kneel);
    const active=await page.evaluate(id=>{
      const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
      return {record:api.getGoodFridayState().step.recordId,
        posture:api.root.querySelector('[data-role="posture"]')?.textContent?.trim(),
        highlight:[...api.root.querySelectorAll('.ao-ritual-trigger-live')].map(el=>el.textContent.trim()),
        formula:globalThis.AO_R17_NATIVE_READER_STATE?.exactFormulaActive??null,
      };
    },kneel);
    assert.equal(active.posture,"KNEEL",
      "Prayer "+n+" Flectamus did not kneel: "+JSON.stringify({kGeometry,active}));
    assert.equal(active.formula,kneel);
    const duplicateScroll=await page.evaluate(()=>{
      const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
      api.root.querySelector(".ao-prayer-card").dispatchEvent(new Event("scroll"));
      return api.getGoodFridayState().step.recordId;
    });
    assert.equal(duplicateScroll,kneel,
      "same-position scroll wrongly skipped from Flectamus to Levate");
    assert.ok(active.highlight.some(x=>/Flectamus genua/i.test(x)),
      "Prayer "+n+" source words were not highlighted");
    const rGeometry=await focusGoodFridayWord(rise);
    const completed=await page.evaluate(()=>{
      const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
      return {record:api.getGoodFridayState().step.recordId,
        posture:api.root.querySelector('[data-role="posture"]')?.textContent?.trim(),
        highlight:[...api.root.querySelectorAll('.ao-ritual-trigger-live')].map(el=>el.textContent.trim()),
        formula:globalThis.AO_R17_NATIVE_READER_STATE?.exactLevateActive??null,
      };
    });
    assert.equal(completed.record,rise,
      "Prayer "+n+" Levate did not activate: "+JSON.stringify({rGeometry,completed}));
    assert.equal(completed.posture,"STAND");
    assert.ok(completed.highlight.some(x=>/Levate/i.test(x)),
      "Prayer "+n+" source rise was not highlighted");
    prayerChecks.push({number:n,kneel:active.formula,rise:completed.formula});
  }
  const unveilChecks=[];
  for(let n=1;n<=3;n++){
    const id="GF-X-52"+n,standing="GF-X-53"+n;
    await page.evaluate(id=>globalThis.__AO_GOOD_FRIDAY_VISUAL_API.goToGoodFridayRecord(id),id);
    const before=await page.evaluate(()=>{
      const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
      return {posture:api.root.querySelector('[data-role="posture"]')?.textContent?.trim(),
        formula:globalThis.AO_R17_NATIVE_READER_STATE?.exactFormulaActive};
    });
    assert.equal(before.posture,"STAND","Unveiling "+n+" kneels before Venite adoremus");
    const geometry=await focusGoodFridayWord(id);
    if(geometry.maxScroll<=8){
      // These short 3-line source cards cannot scroll to the response.
      // The in-card context control supplies an explicit ceremonial action,
      // rather than treating initial visibility as actual kneeling.
      assert.equal(await gfPanel.isVisible(),true,
        "unscrollable unveiling lacks the response-owned kneel action");
      assert.match(await gfPanel.locator("[data-good-friday-advance]").textContent(),/Kneel for adoration/i);
      await gfPanel.locator("[data-good-friday-advance]").click();
    }
    const kneeling=await page.evaluate(()=>{
      const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
      return {posture:api.root.querySelector('[data-role="posture"]')?.textContent?.trim(),
        highlights:[...api.root.querySelectorAll('.ao-ritual-trigger-live')].map(x=>x.textContent.trim()),
        formula:globalThis.AO_R17_NATIVE_READER_STATE?.exactFormulaActive};
    });
    assert.equal(kneeling.posture,"KNEEL",
      "Unveiling "+n+" missed its response: "+JSON.stringify({geometry,kneeling}));
    assert.ok(kneeling.highlights.some(x=>/Venite.*adoremus/i.test(x)));
    assert.equal(await gfPanel.isVisible(),true,
      "Unveiling "+n+" missing explicit silent-adoration completion");
    await gfPanel.locator("[data-good-friday-advance]").click();
    const after=await page.evaluate(()=>{
      const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
      return {record:api.getGoodFridayState().step.recordId,
        posture:api.root.querySelector('[data-role="posture"]')?.textContent?.trim(),
        highlights:api.root.querySelectorAll(".ao-ritual-trigger-live").length};
    });
    assert.equal(after.record,standing);
    assert.equal(after.posture,"STAND","Unveiling "+n+" did not restore standing");
    assert.equal(after.highlights,0,"Unveiling "+n+" retained highlighted kneeling words");
    unveilChecks.push({number:n,posture:after.posture});
  }
  await page.screenshot({path:resolve(out,"16a-good-friday-prayers-and-unveilings.png"),fullPage:false});

  await page.evaluate(()=>globalThis.__AO_GOOD_FRIDAY_VISUAL_API.goToGoodFridayRecord("GF-VEN-600"));
  const venerationRecords=["GF-VEN-600","GF-VEN-610","GF-VEN-620","GF-VEN-630","GF-VEN-640"];
  for(let i=0;i<venerationRecords.length;i++){
    const state=await page.evaluate(()=>globalThis.__AO_GOOD_FRIDAY_VISUAL_API.getGoodFridayState());
    assert.equal(state.step.recordId,venerationRecords[i]);
    assert.equal(state.personalOnly,true);
    assert.equal(await gfPanel.isVisible(),true,"personal veneration capsule disappeared mid-ceremony");
    const control=gfPanel.locator("[data-good-friday-advance]");
    const rect=await control.boundingBox();
    assert.ok(rect?.height>=44,"Cross-veneration action is not a 44px mobile target");
    await control.click();
  }
  assert.equal(await page.evaluate(()=>globalThis.__AO_GOOD_FRIDAY_VISUAL_API.getGoodFridayState().step.recordId),
    "GF-X-700","personal veneration did not return cleanly to the common rite");
  assert.equal(await gfPanel.isVisible(),false,"personal Cross-veneration controls persisted after completion");

  // Good Friday personal reception is selected in situ, not inferred from
  // the celebrant's Communion or the Ecce Agnus Dei text. Test both routes
  // and the exact sacramental-object / posture boundaries in Chromium.
  const communionTransitions=[];
  for(const [id,posture,object] of [
    ["GF-COM-810","KNEEL","BLESSED_SACRAMENT_RETURNING"],
    ["GF-COM-820","STAND","BLESSED_SACRAMENT_AT_ALTAR"],
    ["GF-COM-830","STAND",null],
    ["GF-COM-840","KNEEL",null]
  ]){
    const projection=await page.evaluate(id=>{
      const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
      api.goToGoodFridayRecord(id);
      const state=api.getGoodFridayState();
      return {
        id:state.step.recordId,
        posture:api.root.querySelector('[data-role="posture"]')?.textContent?.trim(),
        object:globalThis.AO_R17_NATIVE_READER_STATE?.objectState??null,
        paragraphCount:state.card.paragraphs.length,
      };
    },id);
    assert.equal(projection.id,id);
    assert.equal(projection.posture,posture,id+" wrong temporary posture");
    assert.equal(projection.object,object,id+" sacramental object state drifted");
    communionTransitions.push(projection);
  }
  const displayedSpeakers=async recordId=>page.evaluate(id=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    api.goToGoodFridayRecord(id);
    return [...api.root.querySelectorAll(".ao-reader-paragraph[data-speaker]")].map(node=>({
      id:node.dataset.paragraphId,
      speaker:node.dataset.speaker,
      label:node.querySelector(".ao-good-friday-speaker-label")?.textContent??null,
    }));
  },recordId);
  const paterSpeakers=await displayedSpeakers("GF-COM-830");
  assert.deepEqual(paterSpeakers.map(row=>[row.speaker,row.label]),[
    ["CELEBRANT","Celebrant"],["ALL","All present"],
    ["CELEBRANT","Celebrant"],["ALL","All present"]
  ],"Good Friday Pater wrongly treats congregational prayer as the priest's alone");
  const preparationSpeakers=await displayedSpeakers("GF-COM-840");
  assert.deepEqual(preparationSpeakers.map(row=>row.speaker),[
    "CELEBRANT","CELEBRANT","CELEBRANT","CELEBRANT",
    "ALL","CELEBRANT","ALL","CELEBRANT","CELEBRANT"
  ]);
  assert.deepEqual(preparationSpeakers.map(row=>row.label).filter(Boolean),
    ["Celebrant","Celebrant","All present","Celebrant","All present","Celebrant"],
    "Good Friday alternations between celebrant and responses were lost");
  const communionWords=await page.evaluate(()=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    const rows=[...api.root.querySelectorAll(".ao-reader-paragraph")];
    return {
      responseIds:rows.filter(n=>["GF-COM-MIS-R","GF-COM-IND-R"].includes(n.dataset.paragraphId))
        .map(n=>[n.dataset.paragraphId,n.dataset.speaker,n.textContent.trim()]),
      repeated:rows.filter(n=>n.querySelector(".ao-good-friday-repeat"))
        .map(n=>[n.dataset.paragraphId,n.querySelector(".ao-good-friday-repeat").textContent])
    };
  });
  assert.deepEqual(communionWords.responseIds.map(row=>row.slice(0,2)),[
    ["GF-COM-MIS-R","ALL"],["GF-COM-IND-R","ALL"]
  ]);
  assert.deepEqual(communionWords.repeated,[
    ["GF-COM-DNSD","3 times"],["GF-COM-FDNSD","3 times"]
  ]);
  const communionChoice=page.locator("#ao-r17-native-reader-preview [data-role='good-friday-communion-choice']");
  assert.equal(await communionChoice.isVisible(),true,
    "the faithful cannot select personal Communion during preparation");
  const receive=communionChoice.locator('[data-gf-communion="true"]');
  const communionRemain=communionChoice.locator('[data-gf-communion="false"]');
  assert.equal(await communionRemain.getAttribute("aria-pressed"),"true",
    "Good Friday silently assumed personal reception without authorization");
  const receiverBox=await receive.boundingBox();
  assert.ok(receiverBox?.height>=44,"Communion participation control is not touch safe");
  await receive.click();
  assert.equal(await receive.getAttribute("aria-pressed"),"true");
  assert.equal(await page.evaluate(()=>globalThis.__AO_GOOD_FRIDAY_VISUAL_API.getGoodFridayState().step.recordId),
    "GF-COM-840","personal choice unexpectedly moved the common reader");
  await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
  const receiving=await page.evaluate(()=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    const state=api.getGoodFridayState();
    return {
      id:state.step.recordId,action:state.action,
      posture:api.root.querySelector('[data-role="posture"]')?.textContent?.trim(),
      personal:state.personalOnly,choice:state.willReceiveCommunion,
    };
  });
  assert.equal(receiving.id,"GF-COM-850");
  assert.equal(receiving.action,"RECEIVE_COMMUNION");
  assert.equal(receiving.posture,"KNEEL");
  assert.equal(receiving.personal,true);
  assert.equal(receiving.choice,true);
  assert.deepEqual(await displayedSpeakers("GF-COM-850"),[],
    "personal reception must not re-display the shared celebrant formulas");
  const receptionRubric=await page.evaluate(()=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    return api.root.querySelector(".ao-reader-paragraph[data-paragraph-id='GF-COM-850-T']")?.textContent.trim();
  });
  assert.match(receptionRubric??"",/Et procedit ad distributionem Communionis\./);
  assert.equal(await communionChoice.isVisible(),false);
  assert.equal(await gfPanel.isVisible(),true,
    "individual Communion completion was not exposed");
  await gfPanel.locator("[data-good-friday-advance]").click();
  const received=await page.evaluate(()=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    const state=api.getGoodFridayState();
    return {id:state.step.recordId,posture:state.posture,object:state.objectState,
      personal:state.personalState};
  });
  assert.deepEqual(received,{id:"GF-COM-860",posture:"STAND",object:null,personal:null});
  assert.equal(await gfPanel.isVisible(),false,"personal Communion action persisted after completion");
  assert.equal(await page.locator("#ao-r17-native-reader-preview [data-speaker]").count(),0,
    "communicant-specific labels leaked into the common Good Friday conclusion");

  await page.evaluate(()=>globalThis.__AO_GOOD_FRIDAY_VISUAL_API.goToGoodFridayRecord("GF-COM-840"));
  await communionRemain.click();
  assert.equal(await communionRemain.getAttribute("aria-pressed"),"true");
  await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
  const nonCommunicant=await page.evaluate(()=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    const state=api.getGoodFridayState();
    return {id:state.step.recordId,posture:state.posture,personal:state.personalState,
      choseCommunion:state.willReceiveCommunion};
  });
  assert.deepEqual(nonCommunicant,{
    id:"GF-COM-860",posture:"STAND",personal:null,choseCommunion:false,
  },"noncommunicant was still forced through a personal reception step");
  await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
  const ending=await page.evaluate(()=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    const state=api.getGoodFridayState();
    return {id:state.step.recordId,action:state.action,
      paragraphs:state.card.paragraphs.length,
      title:state.card.title};
  });
  assert.equal(ending.id,"GF-END-900");
  assert.equal(ending.paragraphs,3);
  assert.equal(ending.action,"RESPOND_AMEN");
  await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
  const departure=await page.evaluate(()=>{
    const api=globalThis.__AO_GOOD_FRIDAY_VISUAL_API;
    const state=api.getGoodFridayState();
    return {id:state.step.recordId,atEnd:state.atEnd,action:state.action,
      object:state.objectState};
  });
  assert.deepEqual(departure,{id:"GF-END-910",atEnd:true,action:null,object:null});
  assert.equal(await communionChoice.isVisible(),false);
  await page.screenshot({path:resolve(out,"16b-good-friday-communion-conclusion.png"),fullPage:false});

  const goodFriday={beforeDeath,atDeath,afterDeath,
    solemnPrayerPairs:prayerChecks,unveilingIntervals:unveilChecks,
    venerationSteps:venerationRecords.length,
    communionTransitions,receiving,received,nonCommunicant,ending,departure};
  await page.screenshot({path:resolve(out,"16-good-friday-veneration-exit.png"),fullPage:false});

  // Holy Thursday joining is a choice, not an automatic transition from
  // kneeling to walking. After following, the return genuflection is personal.
  const holyThursdayStart=await mountSpecialRite("HOLY_THURSDAY");
  assert.ok(holyThursdayStart.hasRoot);
  const holyJump=await page.evaluate(()=>{
    const api=globalThis.__AO_SPECIAL_RITE_VISUAL_API;
    const card=api.model.cards.findLast(c=>
      Number(c.sourceSequence)===29 && !c.blocks?.some(b=>b.blockId==="AO.SM.B092"));
    const shown=api.showSection(card.sectionId);
    return {requested:card.sectionId,shown:shown?.sectionId??null};
  });
  assert.equal(holyJump.shown,holyJump.requested,
    "Holy Thursday's suppressed final blessing could not be bypassed");
  await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
  await advanceRiteTo("HT-R02",5);
  const holyPanel=page.locator("#ao-r17-native-reader-preview [data-role='rite-choice']");
  assert.equal(await holyPanel.isVisible(),true,"Holy Thursday participant choice is not visible");
  const waiting=await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getHolyThursdayPostState());
  assert.equal(waiting.joiningState,"WAITING");
  assert.equal(waiting.posture,"KNEEL","waiting for the Sacrament to pass must not become walking");
  assert.equal(await holyPanel.locator('[data-rite-participation="true"]').getAttribute("aria-pressed"),"false");
  assert.equal(await holyPanel.locator('[data-rite-participation="false"]').getAttribute("aria-pressed"),"false");
  await holyPanel.locator('[data-rite-participation="false"]').click();
  const remain=await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getHolyThursdayPostState());
  assert.equal(remain.joiningState,"NOT_JOINING");
  assert.equal(remain.posture,"LOCAL_OR_INHERIT");
  await holyPanel.locator('[data-rite-participation="true"]').click();
  const following=await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getHolyThursdayPostState());
  assert.equal(following.joiningState,"JOINING");
  assert.equal(following.posture,"STAND_WALK");
  await advanceRiteTo("HT-R03",2);
  assert.equal(await holyPanel.isVisible(),false,"Holy Thursday choice cluttered altar-of-repose prayer");
  assert.equal(await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getHolyThursdayPostState().posture),"KNEEL");
  await advanceRiteTo("HT-R04",2);
  assert.equal(await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getHolyThursdayPostState().posture),
    "STAND_DOUBLE_KNEE_GENUFLECTION_STAND",
    "Holy Thursday's personal return reverence was not preserved");
  await page.locator("#ao-r17-native-reader-preview [data-reader-nav='previous']").click();
  await page.locator("#ao-r17-native-reader-preview [data-reader-nav='previous']").click();
  assert.equal(await holyPanel.isVisible(),true);
  await holyPanel.locator('[data-rite-participation="false"]').click();
  await advanceRiteTo("HT-R04",3);
  const localReturn=await page.evaluate(()=>globalThis.__AO_SPECIAL_RITE_VISUAL_API.getHolyThursdayPostState());
  assert.equal(localReturn.joiningState,"NOT_JOINING");
  assert.equal(localReturn.posture,"LOCAL_OR_INHERIT",
    "Holy Thursday return genuflection was imposed on a nonparticipant");
  await advanceRiteTo("HT-R05",2);
  assert.equal(await holyPanel.isVisible(),false);

  const holyThursday={waiting:waiting.joiningState,remain:remain.joiningState,
    followed:following.joiningState,return:localReturn.posture};
  await page.screenshot({path:resolve(out,"17-holy-thursday-personal-joining.png"),fullPage:false});

  await writeFile(resolve(out,"mass-audit.json"),JSON.stringify({
    setup,opening,hierarchy,consecration,wordsState,elevationState,
    salience:{gloriaAdoramus,gloriaBow,incarnatus,agnus,lastGospelGenuflect,lastGospelRise},
    wide,phoneAudit,specialRites,goodFriday,holyThursday,
    errors
  },null,2));
  assert.deepEqual(errors,[],"page errors during native Mass visual audit: "+JSON.stringify(errors));
  console.log("mass visual acceptance capture: PASS",JSON.stringify({opening,consecration},null,2));
  await context.close();
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
