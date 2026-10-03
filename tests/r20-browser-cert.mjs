import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.R20_BASE_URL || 'http://127.0.0.1:8765';
const ENTRY = '/migration/mass-v1.76/modular-index.html';
const origin = new URL(BASE).origin;

const results = [];
const failures = [];

function assert(cond, message, detail = null) {
  if (!cond) {
    const e = new Error(message);
    e.detail = detail;
    throw e;
  }
}

const scenarios = [
  { id:'low', q:'form=low', form:'low', rite:'ordinary', mass:true, modes:true },
  { id:'mc-simple', q:'form=mc-simple', form:'mc-simple', rite:'ordinary', mass:true, modes:true, schola:true },
  { id:'mc-incense', q:'form=mc-incense', form:'mc-incense', rite:'ordinary', mass:true, modes:true, schola:true },
  { id:'solemn', q:'form=solemn', form:'solemn', rite:'ordinary', mass:true, modes:true, schola:true },
  { id:'requiem-absolution', q:'form=low&rite=requiem&following=absolution&body=1&burial=1', form:'low', rite:'requiem', mass:true },
  { id:'nuptial', q:'form=low&rite=nuptial&nuptial_eligibility=PERMITTED&proper_path=Votive%2FMatrimonium&proper_type=nuptial', form:'low', rite:'nuptial', mass:true },
  { id:'holy-thursday', q:'form=mc-incense&rite=holy-thursday&mandatum=1&reposition=1', form:'mc-incense', rite:'holy-thursday', mass:true },
  { id:'good-friday', q:'form=low&rite=good-friday', form:'low', rite:'good-friday', mass:false },
  { id:'easter-vigil', q:'form=solemn&rite=easter-vigil', form:'solemn', rite:'easter-vigil', mass:true },
  { id:'corpus-procession', q:'form=mc-incense&following=corpus&participating=1', form:'mc-incense', rite:'ordinary', mass:true },
  { id:'palm-procession', q:'form=mc-incense&pre=palm&pre_done=1&palm_received=1&palm_procession=1&participating=1', form:'mc-incense', rite:'ordinary', mass:true },
  { id:'ash-wednesday-overlay', q:'form=low&pre=ash&pre_done=1&ash_received=1', form:'low', rite:'ordinary', mass:true },
  { id:'candlemas-overlay', q:'form=mc-simple&pre=candlemas&pre_done=1&has_candle=1&candle_received=1', form:'mc-simple', rite:'ordinary', mass:true }
];

const viewports = [
  { name:'desktop', width:1280, height:900 },
  { name:'mobile-390', width:390, height:844 }
];

async function pageState(page) {
  return await page.evaluate(() => {
    const AO = window.AO || {};
    const r15 = AO.R15Audit?.run?.() || null;
    const r14 = AO.R14Audit?.run?.() || null;
    const unified = AO.UnifiedAudit?.run?.() || null;
    const focus = AO.FocusAudit?.run?.() || null;
    return {
      form: AO.MassProfile?.id || null,
      rite: AO.MassProfile?.rite || 'ordinary',
      r15,
      r14,
      unified,
      focus,
      cards: document.querySelectorAll('#reader .mass-card').length,
      activeCards: document.querySelectorAll('#reader .mass-card.is-active').length,
      bodyMode: document.body.dataset.mode || null,
      aoR15Dataset: document.documentElement.dataset.aoR15 || null,
      language: AO.Language || null,
      profilePill: document.getElementById('aoProfilePill')?.textContent || '',
      duplicateIds: (() => {
        const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);
        return ids.filter((x,i)=>ids.indexOf(x)!==i);
      })()
    };
  });
}

async function testModes(page, scenario) {
  const out = {};
  for (const mode of ['read','simple','live']) {
    const btn = page.locator('[data-mode-btn="'+mode+'"]');
    await btn.waitFor({state:'attached', timeout:15000});
    await btn.click({timeout:15000});
    await page.waitForFunction(m => document.body.dataset.mode === m, mode, {timeout:15000});
    await page.waitForTimeout(250);
    const audit = await page.evaluate(() => ({
      unified: window.AO?.UnifiedAudit?.run?.() || null,
      focus: window.AO?.FocusAudit?.run?.() || null,
      cards: document.querySelectorAll('#reader .mass-card').length,
      active: document.querySelectorAll('#reader .mass-card.is-active').length,
      stale: document.querySelectorAll('#reader .mass-card:not(.is-active) .active, #reader .mass-card:not(.is-active) .focus-current, #reader .mass-card:not(.is-active) [aria-current="true"]').length,
      mode: document.body.dataset.mode
    }));
    assert(audit.mode === mode, scenario.id+': mode did not switch to '+mode, audit);
    assert(audit.cards > 0, scenario.id+': no Mass cards in '+mode, audit);
    assert(audit.active === 1, scenario.id+': expected exactly one active card in '+mode, audit);
    assert(audit.stale === 0, scenario.id+': stale focus nodes in '+mode, audit);
    if (audit.unified) assert(audit.unified.pass === true, scenario.id+': UnifiedAudit failed in '+mode, audit.unified);
    if (audit.focus) assert(audit.focus.pass !== false, scenario.id+': FocusAudit failed in '+mode, audit.focus);
    out[mode] = audit;
  }

  // Horizontal card navigation must actually change the active card and keep one-card ownership.
  await page.locator('[data-mode-btn="live"]').click();
  await page.waitForFunction(() => document.body.dataset.mode === 'live');
  const before = await page.evaluate(() => [...document.querySelectorAll('#reader .mass-card')].findIndex(c=>c.classList.contains('is-active')));
  const next = page.locator('#cardNext');
  if (await next.isEnabled().catch(()=>false)) {
    await next.click();
    await page.waitForTimeout(650);
    const after = await page.evaluate(() => ({
      index:[...document.querySelectorAll('#reader .mass-card')].findIndex(c=>c.classList.contains('is-active')),
      active:document.querySelectorAll('#reader .mass-card.is-active').length
    }));
    assert(after.active === 1, scenario.id+': card navigation broke active-card ownership', after);
    if (before >= 0 && (await page.locator('#reader .mass-card').count()) > 1) {
      assert(after.index !== before, scenario.id+': Next card did not advance', {before,after});
    }
    out.navigation = {before, after};
  }

  // SIMPLE ordinary-text tap must toggle a swap unit vernacular -> Latin -> vernacular.
  await page.locator('[data-mode-btn="simple"]').click();
  await page.waitForFunction(() => document.body.dataset.mode === 'simple');
  const swap = page.locator('.mass-card.is-active .flow-unit[data-language-mode="swap"][data-language="vernacular"]').first();
  if (await swap.count()) {
    await swap.click();
    await page.waitForTimeout(120);
    const latin = await swap.getAttribute('data-language');
    assert(latin === 'latin', scenario.id+': ordinary translation tap did not switch to Latin', {latin});
    await swap.click();
    await page.waitForTimeout(120);
    const vern = await swap.getAttribute('data-language');
    assert(vern === 'vernacular', scenario.id+': second translation tap did not return to vernacular', {vern});
    out.translationTap = true;
  } else {
    out.translationTap = 'NO_SWAP_UNIT_ON_FIRST_SIMPLE_CARD';
  }

  return out;
}

async function specialAssertions(page, scenario) {
  return await page.evaluate((id) => {
    const AO = window.AO || {};
    const ctx = AO.Calendar?.context || {};
    const result = {id};

    if (id === 'requiem-absolution') {
      result.absolutionActive = !!AO.RequiemAbsolutionR07?.active?.(ctx);
      result.lastGospelVisible = !!document.querySelector('[data-block="AO.SM.B095"]');
      result.pass = result.absolutionActive && !result.lastGospelVisible;
    } else if (id === 'nuptial') {
      result.graphCount = AO.NuptialR08?.graph?.length || 0;
      result.eligibility = ctx.nuptialEligibility || null;
      result.properReady = AO.R09State?.ready ?? null;
      result.pass = result.graphCount === 16 && String(result.eligibility) === 'PERMITTED' && result.properReady === true;
    } else if (id === 'holy-thursday') {
      const c = AO.TriduumR11?.holyThursdayMassContract?.(ctx);
      result.contract = c || null;
      result.pass = !!c && c.credo === false && c.ending?.finalBlessing === false && c.ending?.lastGospel === false;
    } else if (id === 'good-friday') {
      const c = AO.TriduumR11?.goodFridayRuntimeContract?.(ctx);
      result.contract = c || null;
      result.massBlocks = document.querySelectorAll('#reader [data-block^="AO.SM.B"]').length;
      result.pass = !!c && c.useMassEngine === false && result.massBlocks === 0;
    } else if (id === 'easter-vigil') {
      const c = AO.TriduumR11?.easterVigilRuntimeContract?.(ctx);
      result.contract = c || null;
      result.pass = c?.handoff?.target === 'MC-0012' && c?.ordinaryFootPrayersForbidden === true && c?.ordinaryIntroitForbidden === true;
    } else if (id === 'corpus-procession') {
      const selected = AO.ProcessionsR12?.corpusSelected?.(ctx);
      const ending = AO.ProcessionsR12?.corpusMassEnding?.(ctx);
      result.selected = !!selected;
      result.ending = ending || null;
      result.pass = !!selected && ending?.finalBlessing === false && ending?.lastGospel === false && ending?.dismissal === 'BENEDICAMUS_DOMINO';
    } else if (id === 'palm-procession') {
      const p = AO.SpecialPreMassR10?.openingPolicy?.(ctx);
      result.opening = p || null;
      result.pass = p?.openingMode === 'FOOT_CLUSTER_OMITTED' && p?.entry === 'INTROIT';
    } else if (id === 'ash-wednesday-overlay') {
      const p = AO.SpecialPreMassR10?.openingPolicy?.(ctx);
      result.opening = p || null;
      result.pass = p?.openingMode === 'FOOT_CLUSTER_OMITTED' && p?.entry === 'INTROIT';
    } else if (id === 'candlemas-overlay') {
      const p = AO.SpecialPreMassR10?.openingPolicy?.(ctx);
      const candle = AO.SpecialPreMassR10?.candleState?.('GOSPEL_START', ctx);
      result.opening = p || null;
      result.candle = candle || null;
      result.pass = p?.openingMode === 'FOOT_CLUSTER_OMITTED' && candle?.active === true && candle?.lit === true;
    } else {
      result.pass = true;
    }
    return result;
  }, scenario.id);
}

async function setupGuards(browser) {
  const checks = [];
  {
    const context = await browser.newContext({viewport:{width:390,height:844}});
    const page = await context.newPage();
    await page.goto(BASE+ENTRY+'?form=low&rite=nuptial&setup=1', {waitUntil:'domcontentloaded', timeout:120000});
    await page.waitForFunction(() => window.AO?.R15Audit?.run && document.querySelector('[data-r15-enter]'), null, {timeout:120000});
    const s = await page.evaluate(() => ({
      gateOpen: document.getElementById('aoFormGate')?.classList.contains('open'),
      disabled: document.querySelector('[data-r15-enter]')?.disabled,
      title: document.querySelector('[data-r15-enter]')?.title
    }));
    assert(s.gateOpen && s.disabled, 'Nuptial setup did not block unresolved eligibility', s);
    checks.push({id:'nuptial-entry-guard',pass:true,detail:s});
    await context.close();
  }
  {
    const context = await browser.newContext({viewport:{width:390,height:844}});
    const page = await context.newPage();
    await page.goto(BASE+ENTRY+'?form=low&rite=good-friday&setup=1', {waitUntil:'domcontentloaded', timeout:120000});
    await page.waitForFunction(() => window.AO?.R15Audit?.run && document.querySelector('[data-r15-enter]'), null, {timeout:120000});
    const s = await page.evaluate(() => ({
      gateOpen: document.getElementById('aoFormGate')?.classList.contains('open'),
      choicesDisplay: getComputedStyle(document.querySelector('.ao-form-choices')).display,
      noteDisplay: getComputedStyle(document.querySelector('.ao-r15-distinct-note')).display,
      title: document.title
    }));
    assert(s.gateOpen && s.choicesDisplay === 'none' && s.noteDisplay !== 'none', 'Good Friday setup did not present distinct-rite UI', s);
    checks.push({id:'good-friday-distinct-setup',pass:true,detail:s});
    await context.close();
  }
  return checks;
}

const browser = await chromium.launch({headless:true});
try {
  results.push({kind:'setup-guards', checks:await setupGuards(browser)});

  for (const scenario of scenarios) {
    const vpList = scenario.modes ? viewports : [viewports[1]];
    for (const vp of vpList) {
      const context = await browser.newContext({viewport:{width:vp.width,height:vp.height}});
      const page = await context.newPage();
      const pageErrors = [];
      const localHttpErrors = [];
      page.on('pageerror', e => pageErrors.push(String(e.stack || e.message || e)));
      page.on('response', r => {
        const u = r.url();
        if (u.startsWith(origin) && r.status() >= 400) localHttpErrors.push({url:u,status:r.status()});
      });

      const url = BASE + ENTRY + '?' + scenario.q;
      const rec = {kind:'scenario',scenario:scenario.id,viewport:vp.name,url};
      try {
        await page.goto(url, {waitUntil:'domcontentloaded', timeout:120000});
        await page.waitForFunction(() => window.AO?.R15Audit?.run && window.AO?.MassProfile, null, {timeout:120000});
        await page.waitForTimeout(700);

        const state = await pageState(page);
        rec.initial = state;
        assert(pageErrors.length === 0, scenario.id+': uncaught browser errors', pageErrors);
        assert(localHttpErrors.length === 0, scenario.id+': local HTTP dependency failures', localHttpErrors);
        assert(state.duplicateIds.length === 0, scenario.id+': duplicate DOM IDs', state.duplicateIds);
        assert(state.form === scenario.form, scenario.id+': wrong form', state);
        assert((state.rite || 'ordinary') === scenario.rite, scenario.id+': wrong rite', state);
        assert(state.r15?.pass === true, scenario.id+': R15 runtime audit failed', state.r15);
        assert(state.r14?.pass !== false, scenario.id+': R14 integration audit failed', state.r14);

        if (scenario.mass) {
          assert(state.cards > 0, scenario.id+': expected Mass cards', state);
          assert(state.activeCards === 1, scenario.id+': expected exactly one active card', state);
          if (state.unified) assert(state.unified.pass === true, scenario.id+': initial UnifiedAudit failed', state.unified);
        } else {
          assert(state.cards === 0 || scenario.id === 'good-friday', scenario.id+': distinct rite unexpectedly created ordinary Mass cards', state);
        }

        if (scenario.modes) rec.modes = await testModes(page, scenario);

        if (scenario.schola) {
          const schola = await page.evaluate(() => {
            const b=document.getElementById('scholaTranslationToggle');
            if(!b) return {exists:false};
            const before=b.getAttribute('aria-pressed');
            b.click();
            const after=b.getAttribute('aria-pressed');
            b.click();
            return {exists:true,before,after,restored:b.getAttribute('aria-pressed')};
          });
          assert(schola.exists && schola.before !== schola.after && schola.before === schola.restored, scenario.id+': Schola translation toggle failed', schola);
          rec.scholaTranslation = schola;
        }

        const special = await specialAssertions(page, scenario);
        assert(special.pass === true, scenario.id+': special-rite assertion failed', special);
        rec.special = special;
        rec.pageErrors = pageErrors;
        rec.localHttpErrors = localHttpErrors;
        rec.pass = true;
      } catch (e) {
        rec.pass = false;
        rec.error = String(e.stack || e);
        rec.detail = e.detail || null;
        rec.pageErrors = pageErrors;
        rec.localHttpErrors = localHttpErrors;
        failures.push(rec);
        try {
          await page.screenshot({path:'r20-failure-'+scenario.id+'-'+vp.name+'.png',fullPage:true});
        } catch {}
      } finally {
        results.push(rec);
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

const summary = {
  release:'R20',
  generatedAt:new Date().toISOString(),
  baseUrl:BASE,
  scenarioRuns:results.filter(x=>x.kind==='scenario').length,
  passed:results.filter(x=>x.kind==='scenario'&&x.pass).length,
  failed:failures.length,
  pass:failures.length===0,
  results
};
fs.writeFileSync('R20_BROWSER_CERTIFICATION.json', JSON.stringify(summary,null,2));
console.log(JSON.stringify({release:summary.release,scenarioRuns:summary.scenarioRuns,passed:summary.passed,failed:summary.failed,pass:summary.pass},null,2));
if (failures.length) {
  console.error(JSON.stringify(failures,null,2));
  process.exit(1);
}
