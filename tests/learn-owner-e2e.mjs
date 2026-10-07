import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const repoRoot=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const candidate=resolve(repoRoot,"."+pathname);
    if(candidate!==repoRoot&&!candidate.startsWith(repoRoot+sep)){res.writeHead(403);res.end("forbidden");return}
    const data=await readFile(candidate);
    res.writeHead(200,{"content-type":mime[extname(candidate)]??"application/octet-stream","cache-control":"no-store"});res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4178,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const pageErrors=[];
  const ariaFocusErrors=[];
  page.on("pageerror",error=>pageErrors.push(String(error?.message??error)));
  page.on("console",message=>{
    const text=message.text();
    if(/Blocked aria-hidden|aria-hidden.*focus|retained focus/i.test(text))ariaFocusErrors.push(text);
  });

  await page.goto("http://127.0.0.1:4178/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.installed===true &&
    globalThis.AO_HOME_APP_V1?.status?.().installed===true &&
    globalThis.AO_LEARN_APP_V1?.status?.().installed===true,
    null,{timeout:30000}
  );
  await page.waitForSelector("[data-ao-app-surface='learn']",{state:"visible",timeout:30000});

  const formationRibbon=await page.locator("[data-ao-app-surface='learn']").evaluate(node=>({
    surface:node.dataset.aoAppSurface,
    text:(node.textContent??"").trim(),
    aria:node.getAttribute("aria-label"),
  }));
  assert.equal(formationRibbon.surface,"learn","Formation ribbon changed the canonical app surface");
  assert.equal(formationRibbon.text,"Formation","phone ribbon still displays Learn / Apprendre");
  assert.equal(formationRibbon.aria,"Formation","phone ribbon ARIA label still exposes Learn / Apprendre");

  const assertNoMass=async label=>{
    const snapshot=await page.evaluate(()=>({
      route:globalThis.AO_RUNTIME_V8?.store?.getState?.()?.route??null,
      nativeReader:Boolean(document.getElementById("ao-r17-native-reader-preview")?.isConnected),
      nativeRuntime:Boolean(globalThis.AO_R17_MASS_RUNTIME),
    }));
    assert.notEqual(snapshot.route,"live",label+": legacy/core LIVE route started");
    assert.equal(snapshot.nativeReader,false,label+": native Mass reader mounted");
    assert.equal(snapshot.nativeRuntime,false,label+": native Mass runtime started");
  };

  const assertFocusSafe=async label=>{
    const issue=await page.evaluate(()=>{
      const active=document.activeElement;
      if(!active||active===document.body||active===document.documentElement)return null;
      const hidden=active.closest?.('[aria-hidden="true"],[hidden]');
      return hidden?{tag:active.tagName,hidden:hidden.id||hidden.className||hidden.tagName}:null;
    });
    assert.equal(issue,null,label+": focus remained inside a hidden/aria-hidden ancestor");
  };

  async function openLearn(){
    await page.locator("[data-ao-app-surface='learn']").tap();
    await page.waitForSelector("#ao-learn-modular-root",{state:"visible",timeout:10000});
    await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.getActive?.()==="learn",null,{timeout:10000});
  }

  await openLearn();
  const learned=await page.evaluate(()=>{
    const root=document.getElementById("ao-learn-modular-root");
    const donor=document.getElementById("ao-v37-root");
    const ribbon=document.getElementById("ao-global-ribbon");
    const rr=root?.getBoundingClientRect(),rb=ribbon?.getBoundingClientRect();
    const tapTargets=[...root.querySelectorAll("button")].map(node=>{const r=node.getBoundingClientRect();return {w:r.width,h:r.height}});
    const oldLearn=document.getElementById("ao-learn-root");
    const oldCate=document.getElementById("ao-cate-root");
    const oldDaily=document.getElementById("ao-daily-cate-root");
    return {
      active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
      status:globalThis.AO_LEARN_APP_V1?.status?.()??null,
      owner:root?.dataset?.aoLearnOwner??null,
      presentationOwner:root?.dataset?.aoLearnPresentationOwner??null,
      routeOwner:document.documentElement.dataset.aoLearnRouteOwner??null,
      modules:[...root.querySelectorAll("[data-ao-learn-module]")].map(node=>node.dataset.aoLearnModule),
      donorVisible:Boolean(donor&&!donor.hidden&&document.body.classList.contains("aoV37ShellOpen")),
      donorNavCount:root.querySelectorAll("[data-v37-domain],[data-v37-open],.aoV37DomainDock").length,
      sourcesUtilityCount:root.querySelectorAll('[data-ao-learn-module="utility.sources"]').length,
      legacyFeatureVisible:Boolean(
        (oldLearn&&!oldLearn.hidden) ||
        (oldCate&&!oldCate.hidden) ||
        (oldDaily&&!oldDaily.hidden&&oldDaily.getAttribute("aria-hidden")!=="true")
      ),
      geometry:{
        width:rr?.width??0,
        scrollWidth:root?.scrollWidth??0,
        clientWidth:root?.clientWidth??0,
        rootBottom:rr?.bottom??0,
        ribbonTop:rb?.top??Infinity,
        tapTargets,
      },
    };
  });
  assert.equal(learned.active,"learn");
  assert.equal(learned.status?.installed,true);
  assert.equal(learned.owner,"modular-learn-v1");
  assert.equal(learned.presentationOwner,"modular-learn-presentation-v1");
  assert.equal(learned.routeOwner,"modular-learn-v1");
  assert.deepEqual(learned.modules,["learn.catechism.daily","learn.latin","learn.mass","learn.spiritual_life","learn.catechism","learn.glossary","learn.sexual_ethics","learn.rites.sick","learn.rites.baptism","learn.rites.first_communion","learn.rites.confirmation","learn.rites.holy_orders","learn.rites.matrimony","learn.serve_mass.responses","learn.scapular","today.gospel"]);
  assert.equal(await page.locator("#ao-learn-modular-root [data-ao-learn-module=\'today.saint\']").count(),0,"Saint of the Day remained visible in Learn");
  assert.equal(learned.donorVisible,false,"historical V37 Learn donor remained visible underneath modular Learn");
  assert.equal(learned.donorNavCount,0,"historical V37 navigation leaked into modular Learn");
  assert.equal(learned.sourcesUtilityCount,0,"top-level Sources leaked back into Learn");
  assert.equal(learned.legacyFeatureVisible,false,"a historical Learn child renderer was already visible underneath the modular hub");
  assert.ok(learned.geometry.width>300,"Learn phone surface collapsed");
  assert.ok(learned.geometry.scrollWidth<=learned.geometry.clientWidth+1,"Learn phone surface has horizontal overflow");
  assert.ok(learned.geometry.rootBottom<=learned.geometry.ribbonTop+2,"Learn surface covers the global app ribbon");
  assert.ok(learned.geometry.tapTargets.length>=6,"Learn surface lost expected controls");
  for(const target of learned.geometry.tapTargets)assert.ok(target.w>=44&&target.h>=44,"Learn touch target fell below 44px");
  await assertNoMass("Home -> Learn");
  await assertFocusSafe("Home -> Learn");

  // Glossary: category-first navigation, multilingual search and sourced term drawer.
  await page.locator('#ao-learn-modular-root [data-ao-learn-module="learn.glossary"]').tap();
  await page.waitForFunction(()=>
    globalThis.AO_GLOSSARY_V1?.status?.().open===true &&
    globalThis.AO_GLOSSARY_V1?.status?.().loaded===true &&
    globalThis.AO_GLOSSARY_V1?.status?.().entries===450 &&
    Boolean(document.getElementById("ao-glossary-root")),
    null,{timeout:10000}
  );
  const glossaryLanding=await page.evaluate(()=>{
    const root=document.getElementById("ao-glossary-root");
    return {
      categories:root?.querySelectorAll("[data-gloss-category]").length??0,
      renderedTerms:root?.querySelectorAll("[data-gloss-entry]").length??0,
      width:root?.getBoundingClientRect()?.width??0,
      overflow:root?(root.scrollWidth-root.clientWidth):Infinity,
      status:globalThis.AO_GLOSSARY_V1?.status?.()??null,
    };
  });
  assert.equal(glossaryLanding.categories,13,"Glossary landing lost its 13 category homes");
  assert.equal(glossaryLanding.renderedTerms,0,"Glossary landing regressed to a flat term list");
  assert.equal(glossaryLanding.status?.entries,450,"Glossary runtime lost canonical inventory");
  assert.ok(glossaryLanding.width>300,"Glossary phone surface collapsed");
  assert.ok(glossaryLanding.overflow<=1,"Glossary has horizontal overflow on phone");

  const glossSearch=page.locator("#ao-glossary-root [data-gloss-search]");
  await glossSearch.fill("transubstantiation");
  await page.waitForFunction(()=>Boolean(document.querySelector('#ao-glossary-root [data-gloss-entry="G033"]')),null,{timeout:5000});
  await page.locator('#ao-glossary-root [data-gloss-entry="G033"]').tap();
  await page.waitForSelector("#ao-glossary-root .aoGlossDetailCard",{state:"visible",timeout:5000});
  const glossaryDetail=await page.evaluate(()=>({
    title:document.querySelector("#ao-glossary-root .aoGlossDetailHead h2")?.textContent?.trim()??"",
    latin:document.querySelector("#ao-glossary-root .aoGlossLatin")?.textContent?.trim()??"",
    definition:document.querySelector("#ao-glossary-root .aoGlossDefinition")?.textContent?.trim()??"",
    explanation:document.querySelector("#ao-glossary-root .aoGlossExplanation")?.textContent?.trim()??"",
    sourceLinks:document.querySelectorAll("#ao-glossary-root .aoGlossSources a[href]").length,
  }));
  assert.equal(glossaryDetail.title,"Transubstantiation");
  assert.equal(glossaryDetail.latin,"transsubstantiatio");
  assert.match(glossaryDetail.definition,/conversion/i,"Glossary term drawer did not render the sourced short definition");
  assert.ok(glossaryDetail.explanation.length>80,"Glossary term drawer did not render the sourced explanation");
  assert.ok(glossaryDetail.sourceLinks>=1,"Glossary term drawer has no clickable source");
  await page.locator("#ao-glossary-root [data-gloss-close]").tap();

  await glossSearch.fill("");
  await page.waitForFunction(()=>Boolean(document.querySelector('#ao-glossary-root [data-gloss-category="latin_rubrics"]')),null,{timeout:5000});
  await page.locator('#ao-glossary-root [data-gloss-category="latin_rubrics"]').tap();
  await page.waitForSelector('#ao-glossary-root [data-gloss-collection="lexemes"]',{state:"visible",timeout:5000});
  const latinHub=await page.evaluate(()=>({
    lexemes:globalThis.AO_GLOSSARY_V1?.status?.().lexemes??0,
    phrases:globalThis.AO_GLOSSARY_V1?.status?.().phrases??0,
    collections:document.querySelectorAll("#ao-glossary-root [data-gloss-collection]").length,
  }));
  assert.equal(latinHub.lexemes,350,"Glossary runtime lost the 350-lemma Core Latin registry");
  assert.equal(latinHub.phrases,80,"Glossary runtime lost the 80-phrase Latin phrasebook");
  assert.equal(latinHub.collections,2,"Latin & Rubrics should expose lexicon and phrasebook collections");

  await page.locator('#ao-glossary-root [data-gloss-collection="lexemes"]').tap();
  await page.waitForSelector('#ao-glossary-root [data-gloss-stage="1"]',{state:"visible",timeout:5000});
  await page.locator('#ao-glossary-root [data-gloss-stage="1"]').tap();
  await page.waitForSelector("#ao-glossary-root [data-gloss-lexeme]",{state:"visible",timeout:5000});
  const firstLexeme=page.locator("#ao-glossary-root [data-gloss-lexeme]").first();
  await firstLexeme.tap();
  await page.waitForSelector("#ao-glossary-root .aoGlossDetailCard",{state:"visible",timeout:5000});
  const lexemeDetail=await page.evaluate(()=>({
    type:globalThis.AO_GLOSSARY_V1?.status?.().detailType??"",
    title:document.querySelector("#ao-glossary-root .aoGlossDetailHead h2")?.textContent?.trim()??"",
    definition:document.querySelector("#ao-glossary-root .aoGlossDefinition")?.textContent?.trim()??"",
    sources:document.querySelectorAll("#ao-glossary-root .aoGlossSources a[href]").length,
  }));
  assert.equal(lexemeDetail.type,"lexeme","Latin lexeme drawer did not switch detail type");
  assert.ok(lexemeDetail.title.length>0,"Latin lexeme drawer has no lemma");
  assert.ok(lexemeDetail.definition.length>0,"Latin lexeme drawer has no EN/FR gloss");
  assert.ok(lexemeDetail.sources>=1,"Latin lexeme drawer has no source link");
  await page.locator("#ao-glossary-root [data-gloss-close]").tap();
  await page.locator("#ao-glossary-root [data-gloss-back]").tap();
  await page.locator("#ao-glossary-root [data-gloss-back]").tap();

  await page.locator('#ao-glossary-root [data-gloss-collection="phrases"]').tap();
  await page.waitForSelector('#ao-glossary-root [data-gloss-phrase="P013"]',{state:"visible",timeout:5000});
  await page.locator('#ao-glossary-root [data-gloss-phrase="P013"]').tap();
  await page.waitForSelector("#ao-glossary-root .aoGlossDetailCard",{state:"visible",timeout:5000});
  const phraseDetail=await page.evaluate(()=>({
    type:globalThis.AO_GLOSSARY_V1?.status?.().detailType??"",
    title:document.querySelector("#ao-glossary-root .aoGlossDetailHead h2")?.textContent?.trim()??"",
    translation:document.querySelector("#ao-glossary-root .aoGlossDefinition")?.textContent?.trim()??"",
    sources:document.querySelectorAll("#ao-glossary-root .aoGlossSources a[href]").length,
  }));
  assert.equal(phraseDetail.type,"phrase","Phrasebook drawer did not switch detail type");
  assert.equal(phraseDetail.title,"Dominus vobiscum.");
  assert.match(phraseDetail.translation,/Lord be with you/i);
  assert.ok(phraseDetail.sources>=1,"Phrasebook drawer has no source link");
  await page.locator("#ao-glossary-root [data-gloss-close]").tap();
  await page.locator("#ao-glossary-root [data-gloss-back]").tap();
  await page.locator("#ao-glossary-root [data-gloss-back]").tap();
  await page.waitForFunction(()=>
    !document.getElementById("ao-glossary-root") &&
    !document.getElementById("ao-learn-modular-root")?.hidden &&
    globalThis.AO_LEARN_APP_V1?.status?.().child==null,
    null,{timeout:10000}
  );
  await assertNoMass("Glossary -> Formation");
  await assertFocusSafe("Glossary -> Formation");

  // Spiritual Life: published 14-lesson phone journey, readable and explicitly non-scored.
  await page.locator('#ao-learn-modular-root [data-ao-learn-module="learn.spiritual_life"]').tap();
  await page.waitForFunction(()=>
    globalThis.AO_SPIRITUAL_LIFE_V1?.status?.().open===true &&
    globalThis.AO_SPIRITUAL_LIFE_V1?.status?.().view==="list" &&
    Boolean(document.getElementById("ao-spiritual-life-root")),
    null,{timeout:10000}
  );
  const spiritualLanding=await page.evaluate(()=>{
    const root=document.getElementById("ao-spiritual-life-root");
    const rect=root?.getBoundingClientRect();
    const buttons=[...root.querySelectorAll("button")].map(node=>{const r=node.getBoundingClientRect();return {w:r.width,h:r.height}});
    return {
      status:globalThis.AO_SPIRITUAL_LIFE_V1?.status?.()??null,
      lessons:root?.querySelectorAll("[data-ao-sl-lesson]").length??0,
      width:rect?.width??0,
      overflow:root?(root.scrollWidth-root.clientWidth):Infinity,
      buttons,
      text:root?.textContent??"",
    };
  });
  assert.equal(spiritualLanding.status?.lessons,14,"Spiritual Life runtime lost its 14-lesson corpus");
  assert.equal(spiritualLanding.status?.claims,76,"Spiritual Life runtime lost claim coverage");
  assert.equal(spiritualLanding.status?.sources,12,"Spiritual Life runtime lost source coverage");
  assert.equal(spiritualLanding.status?.scoring,false,"Spiritual Life introduced spiritual scoring");
  assert.equal(spiritualLanding.status?.persistence,false,"Spiritual Life introduced persistent spiritual tracking");
  assert.equal(spiritualLanding.lessons,14,"Spiritual Life landing does not expose all 14 lessons");
  assert.ok(spiritualLanding.width>300,"Spiritual Life phone surface collapsed");
  assert.ok(spiritualLanding.overflow<=1,"Spiritual Life has horizontal overflow on 390px phone geometry");
  assert.match(spiritualLanding.text,/There is no score|Il n’y a ni score/,"Spiritual Life lost its anti-scoring boundary");
  for(const target of spiritualLanding.buttons)assert.ok(target.w>=44&&target.h>=44,"Spiritual Life landing touch target fell below 44px");
  await assertNoMass("Spiritual Life landing");
  await assertFocusSafe("Spiritual Life landing");

  await page.locator('#ao-spiritual-life-root [data-ao-sl-lesson="SL01"]').tap();
  await page.waitForFunction(()=>
    globalThis.AO_SPIRITUAL_LIFE_V1?.status?.().view==="lesson" &&
    globalThis.AO_SPIRITUAL_LIFE_V1?.status?.().lessonId==="SL01",
    null,{timeout:10000}
  );
  const spiritualLesson=await page.evaluate(()=>{
    const root=document.getElementById("ao-spiritual-life-root");
    return {
      title:root?.querySelector(".aoSLLessonHead h1")?.textContent?.trim()??"",
      kicker:root?.querySelector(".aoSLTopTitle small")?.textContent?.trim()??"",
      blocks:root?.querySelectorAll(".aoSLBlock").length??0,
      practices:root?.querySelectorAll(".aoSLPractice").length??0,
      sources:root?.querySelectorAll(".aoSLSources").length??0,
      sourceLinks:root?.querySelectorAll(".aoSLSources a[href]").length??0,
      practiceText:root?.querySelector(".aoSLPractice small")?.textContent?.trim()??"",
      overflow:root?(root.scrollWidth-root.clientWidth):Infinity,
    };
  });
  assert.equal(spiritualLesson.title,"The Interior Life","Spiritual Life Lesson 1 title regressed");
  assert.match(spiritualLesson.kicker,/Lesson 1 of 14/,"Spiritual Life lesson count is not visible");
  assert.equal(spiritualLesson.blocks,3,"Spiritual Life lesson lost the frozen three-block rhythm");
  assert.equal(spiritualLesson.practices,1,"Spiritual Life lesson lost its single application");
  assert.equal(spiritualLesson.sources,1,"Spiritual Life lesson lost its source drawer");
  assert.ok(spiritualLesson.sourceLinks>=2,"Spiritual Life Lesson 1 source drawer is too thin");
  assert.match(spiritualLesson.practiceText,/not scored/i,"Spiritual Life practice lost the non-scored label");
  assert.ok(spiritualLesson.overflow<=1,"Spiritual Life lesson has horizontal overflow");
  await assertNoMass("Spiritual Life Lesson 1");
  await assertFocusSafe("Spiritual Life Lesson 1");

  await page.locator("#ao-spiritual-life-root [data-ao-sl-next]").tap();
  await page.waitForFunction(()=>globalThis.AO_SPIRITUAL_LIFE_V1?.status?.().lessonId==="SL02",null,{timeout:10000});
  assert.equal((await page.locator("#ao-spiritual-life-root .aoSLLessonHead h1").textContent())?.trim(),"Living in God's Presence","Spiritual Life next navigation failed");
  await page.locator("#ao-spiritual-life-root [data-ao-sl-back]").tap();
  await page.waitForFunction(()=>globalThis.AO_SPIRITUAL_LIFE_V1?.status?.().view==="list",null,{timeout:10000});
  await page.locator("#ao-spiritual-life-root [data-ao-sl-back]").tap();
  await page.waitForFunction(()=>
    !document.getElementById("ao-spiritual-life-root") &&
    !document.getElementById("ao-learn-modular-root")?.hidden &&
    globalThis.AO_LEARN_APP_V1?.status?.().child==null,
    null,{timeout:10000}
  );
  await assertNoMass("Spiritual Life -> Formation");
  await assertFocusSafe("Spiritual Life -> Formation");

  const recoveredTraditional=[
    "learn.rites.sick",
    "learn.rites.baptism",
    "learn.rites.first_communion",
    "learn.rites.confirmation",
    "learn.rites.holy_orders",
    "learn.rites.matrimony",
    "learn.serve_mass.responses",
    "learn.scapular",
  ];
  for(const id of recoveredTraditional){
    await page.locator(`#ao-learn-modular-root [data-ao-learn-module="${id}"]`).tap();
    await page.waitForFunction(expected=>{
      const s=globalThis.AO_TRADITIONAL_LEARN_V381?.status?.();
      const root=document.getElementById("ao-learn-traditional-root");
      return s?.open===true&&s?.route===expected&&Boolean(root);
    },id,{timeout:10000});
    const child=await page.evaluate(()=>{const r=document.getElementById("ao-learn-traditional-root"),b=r?.getBoundingClientRect();return{
      owner:r?.dataset?.aoTraditionalLearnOwner??null,
      overflow:r?(r.scrollWidth-r.clientWidth):Infinity,
      width:b?.width??0,
      donorVisible:Boolean(document.getElementById("aoV38Traditions")?.classList?.contains("open")),
      priestCeremonialExposed:globalThis.AO_TRADITIONAL_LEARN_V381?.status?.().priestCeremonialExposed,
    }});
    assert.equal(child.owner,"38.5-after-death-family-absorption",id+": wrong child owner");
    assert.ok(child.width>300,id+": child collapsed on phone");
    assert.ok(child.overflow<=1,id+": child has horizontal overflow");
    assert.equal(child.donorVisible,false,id+": historical Traditions monolith became visible");
    assert.equal(child.priestCeremonialExposed,false,id+": priest-only ceremonial scope leaked");
    await assertFocusSafe(id+" open");
    await page.locator("#ao-learn-traditional-root [data-ao-tradlearn-back]").tap();
    await page.waitForFunction(()=>
      !document.getElementById("ao-learn-traditional-root") &&
      !document.getElementById("ao-learn-modular-root")?.hidden &&
      globalThis.AO_LEARN_APP_V1?.status?.().child==null,
      null,{timeout:10000}
    );
    await assertFocusSafe(id+" return");
  }

  assert.equal(await page.locator('#ao-learn-modular-root [data-ao-learn-module="learn.seasonal_rites"]').count(),0,
    "final v38.4 donor dedupe requires no duplicate Seasonal Catholic Practice launcher");
  const seasonal=await page.evaluate(()=>globalThis.AO_MODULES?.open?.("learn.seasonal_rites",{returnContext:{surface:"learn"}}));
  assert.equal(seasonal?.ok,true,"seasonal compatibility alias failed");
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="calendar" &&
    globalThis.AO_CALENDAR_APP_V1?.status?.().open===true,
    null,{timeout:10000}
  );
  await assertNoMass("Seasonal alias -> Calendar");
  await assertFocusSafe("Seasonal alias -> Calendar");
  await openLearn();

  await page.locator("#ao-learn-modular-root [data-ao-learn-home]").tap();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="home" &&
    !document.getElementById("ao-learn-modular-root") &&
    document.querySelector(".homeScreen")?.dataset?.aoHomeOwner==="modular-home-v2",
    null,{timeout:10000}
  );
  await assertNoMass("Learn -> Home");
  await assertFocusSafe("Learn -> Home");

  await openLearn();
  await page.locator("[data-ao-app-surface='pray']").tap();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="pray" &&
    globalThis.AO_PRAY_APP_V1?.status?.().installed===true &&
    !document.getElementById("ao-learn-modular-root"),
    null,{timeout:10000}
  );
  await assertNoMass("Learn -> Pray");
  await assertFocusSafe("Learn -> Pray");

  await openLearn();
  await page.locator("[data-ao-app-surface='calendar']").tap();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="calendar" &&
    globalThis.AO_CALENDAR_APP_V1?.status?.().open===true &&
    !document.getElementById("ao-learn-modular-root"),
    null,{timeout:10000}
  );
  await assertNoMass("Learn -> Calendar");
  await assertFocusSafe("Learn -> Calendar");

  await openLearn();
  await page.locator("[data-ao-app-surface='settings']").tap();
  await page.waitForFunction(()=>
    globalThis.AO_APP_SHELL_V1?.getActive?.()==="settings" &&
    !document.getElementById("ao-learn-modular-root"),
    null,{timeout:10000}
  );
  const settings=await page.evaluate(()=>({
    active:globalThis.AO_APP_SHELL_V1?.getActive?.()??null,
    learnMounted:Boolean(document.getElementById("ao-learn-modular-root")),
    donorLearnVisible:Boolean(document.getElementById("ao-v37-root")&&!document.getElementById("ao-v37-root").hidden&&document.body.classList.contains("aoV37ShellOpen")),
  }));
  assert.equal(settings.active,"settings","Learn -> Settings did not complete through AO_APP_SHELL_V1");
  assert.equal(settings.learnMounted,false,"modular Learn remained mounted underneath Settings");
  assert.equal(settings.donorLearnVisible,false,"historical Learn donor resurfaced under Settings");
  await assertNoMass("Learn -> Settings");
  await assertFocusSafe("Learn -> Settings");

  assert.deepEqual(ariaFocusErrors,[],"aria/focus regression: "+JSON.stringify(ariaFocusErrors));
  assert.deepEqual(pageErrors,[],"uncaught errors in modular Learn phone journey: "+JSON.stringify(pageErrors));

  await context.close();
  console.log("PASS modular Learn phone journey: Home -> Learn -> Home and Learn -> Pray/Calendar/Settings");
}finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
