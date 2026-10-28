// Phone walk with the reader's own Next control:
// 1. A Mass without Gloria / Credo (and every Requiem) skips those cards in
//    Low, sung LIVE and Solemn Missal; no Gloria chant window appears.
// 2. In a sung Mass the choir's Gradual continues across Munda cor meum and the
//    Agnus Dei continues across the priest's prayers before his Communion.
import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" };
const server = http.createServer(async (req, res) => {
  try {
    const path = resolve(root, "." + decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname));
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    const bytes = await readFile(path);
    res.writeHead(200, { "content-type": mime[extname(path)] ?? "application/octet-stream", "cache-control": "no-store" }); res.end(bytes);
  } catch (e) { res.writeHead(e?.code === "ENOENT" ? 404 : 500); res.end(); }
});
await new Promise((ok, fail) => { server.once("error", fail); server.listen(4311, "127.0.0.1", ok); });

async function walk(browser, query) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const page = await ctx.newPage(); const errors = [];
    page.on("pageerror", e => errors.push(String(e.message ?? e)));
    await page.goto(`http://127.0.0.1:4311/tests/fixtures/reader-phone-harness.html?${query}`, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForFunction(() => ["true","error"].includes(document.documentElement.dataset.harnessReady), {}, { timeout: 45000 });
    const startupError=await page.evaluate(()=>window.__AO_PHONE_HARNESS_ERROR??null);
    assert.equal(startupError,null,query+": source-owned reader fixture failed: "+startupError);
    const visited = await page.evaluate(async () => {
      const api = window.__AO_PHONE_PREVIEW; const seen = [];
      api.showSequence(api.model.cards[0].sequence);
      await new Promise(r => setTimeout(r, 150));
      for (let i = 0; i < 140; i++) {
        const card = api.getCurrentCard(); if (!card) break;
        const s = api.getScholaState();
        seen.push({ title: card.title, source: String(card.sourceSectionId ?? card.sectionId), schola: s?.trackId ?? null });
        const before = card.sectionId;
        document.querySelector('[data-reader-nav="next"]')?.click();
        await new Promise(r => setTimeout(r, 100));
        if (api.getCurrentCard()?.sectionId === before) break;
      }
      return seen;
    });
    assert.deepEqual(errors, [], query + ": page errors");
    return visited;
  } finally { await ctx.close(); }
}
const has = (cards, section) => cards.some(c => c.source === section);

let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const base of ["production=1&mode=LIVE&form=LOW", "production=1&aoLiveCards=65&form=MISSA_CANTATA_SIMPLE", "production=1&mode=MISSAL&form=SOLEMN"]) {
    const normal = await walk(browser, base + "&gloria=1&credo=1");
    assert.ok(has(normal, "AO.CARD.003") && has(normal, "AO.CARD.009"), base + ": a day with Gloria and Credo lost them");
    const noGloria = await walk(browser, base + "&gloria=0&credo=1");
    assert.ok(!has(noGloria, "AO.CARD.003"), base + ": Gloria shown on a day without Gloria");
    assert.ok(has(noGloria, "AO.CARD.009"), base + ": Credo lost on a day that has it");
    assert.ok(!noGloria.some(c => c.schola === "GLORIA"), base + ": a Gloria chant window appeared without a Gloria");
    const noCredo = await walk(browser, base + "&gloria=1&credo=0");
    assert.ok(has(noCredo, "AO.CARD.003") && !has(noCredo, "AO.CARD.009"), base + ": Credo shown on a day without Credo");
    assert.ok(!noCredo.some(c => c.schola === "CREDO"), base + ": a Credo chant window appeared without a Credo");
    const requiem = await walk(browser, base + "&requiem=1");
    assert.ok(!has(requiem, "AO.CARD.003") && !has(requiem, "AO.CARD.009"), base + ": a Requiem showed Gloria or Credo");
    assert.equal(normal.length - noGloria.length, normal.filter(c => c.source === "AO.CARD.003").length, base + ": removing the Gloria removed other cards");
  }

  // Sung Mass: the choir's windows across the priest's own prayers.
  const sung = await walk(browser, "production=1&aoLiveCards=65&form=MISSA_CANTATA_SIMPLE&gloria=1&credo=1");
  const at = re => sung.find(c => re.test(c.title));
  assert.equal(at(/^Gradual/)?.schola, "GRADUAL");
  assert.equal(at(/^Preparation for the Gospel/)?.schola, "GRADUAL", "the Gradual ended while the priest said Munda cor meum");
  assert.equal(at(/^Proclamation of the Holy Gospel/)?.schola, null, "the Gradual continued into the Gospel");
  assert.equal(at(/^Commingling/)?.schola, "AGNUS_DEI", "the Agnus Dei had not begun at the commingling");
  assert.equal(at(/^Agnus Dei/)?.schola, "AGNUS_DEI");
  assert.equal(at(/^Prayers before the Priest/)?.schola, "AGNUS_DEI", "the Agnus Dei ended during the priest's prayers before Communion");
  assert.equal(at(/^Domine, non sum dignus · Celebr/)?.schola, "AGNUS_DEI");
  assert.equal(at(/^The Priest receives the Sacred Host/)?.schola, "COMMUNION", "the Communion window did not take over");
  console.log("Gloria/Credo omission and Schola windows on the phone: PASS — Low, sung LIVE and Solemn Missal; Requiem; Gradual and Agnus Dei windows.");
} finally {
  await browser?.close();
  server.close();
}
