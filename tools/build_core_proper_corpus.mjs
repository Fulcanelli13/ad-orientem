import assert from "node:assert/strict";
import crypto from "node:crypto";
import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT = resolve(ROOT, "artifacts/core-proper-corpus");
const PIN = "126a07f91ede04664108abb6fb20ace3f4de14b9";

const RECOVERY_DONORS = Object.freeze({
  "C10t:Latin":"obsolete/missa/Latin/Commune/C10t.txt",
  "C10t:English":"obsolete/missa/English/Commune/C10t.txt",
  "C10t:Francais":"obsolete/missa/French/Commune/C10t.txt",
  "Nat29:Latin":"web/www/missa/Latin/Tempora/Nat29.txt",
  "Nat29:English":"web/www/missa/English/Tempora/Nat29.txt",
  "Nat29:Francais":"web/www/missa/Francais/Tempora/Nat29.txt",
  "Nat30:Latin":"web/www/missa/Latin/Tempora/Nat30.txt",
  "Nat30:English":"web/www/missa/English/Tempora/Nat30.txt",
  "Nat30:Francais":"web/www/missa/Francais/Tempora/Nat30.txt",
  "Nat31:Latin":"web/www/missa/Latin/Tempora/Nat31.txt",
  "Nat31:English":"web/www/missa/English/Tempora/Nat31.txt",
  "Nat31:Francais":"web/www/missa/Francais/Tempora/Nat31.txt",
});

async function loadRecoverySources() {
  const base = "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/" + PIN + "/";
  const out = {};
  for (const [key,path] of Object.entries(RECOVERY_DONORS)) {
    const response = await fetch(base + path);
    if (!response.ok) throw new Error("Corpus recovery donor unavailable " + key + " -> " + path + " (" + response.status + ")");
    out[key] = await response.text();
  }
  return out;
}

function arg(name, fallback) {
  const prefix = "--" + name + "=";
  const hit = process.argv.find(x => x.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}
const discoveryStart = arg("discovery-start", "2000-01-01");
const discoveryEnd = arg("discovery-end", "2027-12-31");
const encounterStart = arg("encounter-start", "2025-11-30");
const encounterEnd = arg("encounter-end", "2026-11-28");

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function datesBetween(start, end) {
  const out = [];
  let d = new Date(start + "T12:00:00Z");
  const last = new Date(end + "T12:00:00Z");
  while (d <= last) {
    out.push(isoDate(d));
    d = new Date(d.getTime() + 86400000);
  }
  return out;
}
function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}
function normalizedTokens(text) {
  return String(text || "")
    .normalize("NFC")
    .toLocaleLowerCase("la")
    .replace(/[0-9]+/gu, " ")
    .match(/[\p{L}]+(?:['’][\p{L}]+)?/gu) ?? [];
}
function rootFamily(path) {
  const p = String(path || "");
  if (p.startsWith("Tempora/")) return "TEMPORAL";
  if (p.startsWith("Sancti/")) return "SANCTORAL";
  if (p.startsWith("Commune/")) return "COMMON";
  return "OTHER";
}
function isSpecialProfile(profile) {
  return new Set([
    "good_friday_1962",
    "holy_thursday_1962",
    "easter_vigil_1962",
    "palm_sunday_1962",
    "candlemas_1962",
    "ash_wednesday_1962",
    "requiem_mass_1962",
  ]).has(String(profile || ""));
}
function denominator(row) {
  if (isSpecialProfile(row.riteProfile)) return "SPECIAL_RITES";
  return "NORMAL_PROPERS";
}
function finalLatin(row) {
  return (row.segments || []).map(x => x.text).filter(Boolean).join("\n\n");
}
function referencedFamilies(row) {
  const refs = [
    ...(row.diagnostic?.referencesResolved || []),
    ...(row.diagnostic?.structuralInheritances || []),
    ...(row.diagnostic?.legacyCommonRecoveries || []),
  ];
  const text = JSON.stringify(refs);
  return {
    temporal: /Tempora\//.test(text),
    sanctoral: /Sancti\//.test(text),
    common: /Commune\//.test(text),
  };
}
function csvCell(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
}

const mime = {
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".svg":"image/svg+xml",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".webp":"image/webp",
};

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    const candidate = resolve(ROOT, "." + pathname);
    if (candidate !== ROOT && !candidate.startsWith(ROOT + sep)) {
      res.writeHead(403); res.end("forbidden"); return;
    }
    const path = candidate === ROOT ? resolve(ROOT, "index.html") : candidate;
    const data = await readFile(path);
    res.writeHead(200, {
      "content-type": mime[extname(path)] ?? "application/octet-stream",
      "cache-control":"no-store",
    });
    res.end(data);
  } catch (error) {
    res.writeHead(error?.code === "ENOENT" ? 404 : 500);
    res.end(String(error?.message ?? error));
  }
});

async function listen() {
  await new Promise((ok, fail) => {
    server.once("error", fail);
    server.listen(4197, "127.0.0.1", ok);
  });
}
async function closeServer() {
  await new Promise(resolveClose => server.close(resolveClose));
}

async function resolveBatch(page, dates) {
  return page.evaluate(async (dateList) => {
    const runtime = globalThis.AO_RUNTIME_V8;
    const resolver = runtime?.resolver;
    if (!resolver?.resolveDay) throw new Error("AO_RUNTIME_V8.resolver.resolveDay unavailable");

    const textLat = value => String(value?.lat || "").trim();
    const pushText = (segments, slot, value) => {
      const text = textLat(value);
      if (text) segments.push({ slot, text });
    };
    const pushList = (segments, slot, values) => {
      for (let i = 0; i < (values || []).length; i++) pushText(segments, slot + ":" + (i + 1), values[i]);
    };
    const extract = result => {
      const p = result?.proper?.status === "ready" ? result.proper.data : null;
      if (!p) {
        return {
          date: result?.date ?? null,
          status: result?.proper?.status ?? result?.status ?? "failed",
          error: result?.proper?.error ?? result?.error ?? "NO_PROPER",
          diagnostic: result?.diagnostic ?? null,
        };
      }
      const segments = [];
      pushText(segments, "introit", p.introit);
      pushList(segments, "collect", p.collects);
      pushText(segments, "epistle", p.epistle);
      for (let i = 0; i < (p.preGospelChants || []).length; i++) {
        pushText(segments, "pre_gospel:" + ((p.preGospelChants[i]?.kind) || (i + 1)), p.preGospelChants[i]?.text);
      }
      pushText(segments, "sequence", p.sequence);
      pushText(segments, "gospel", p.gospel);
      pushText(segments, "offertory", p.offertory);
      pushList(segments, "secret", p.secrets);
      pushText(segments, "preface", p.preface);
      pushText(segments, "communion", p.communion);
      pushList(segments, "postcommunion", p.postcommunions);
      pushText(segments, "super_populum", p.superPopulum);
      for (let i = 0; i < (p.preparatoryLessons || []).length; i++) {
        const row = p.preparatoryLessons[i];
        pushText(segments, "preparatory_lesson:" + (i + 1), row?.lesson);
        pushText(segments, "preparatory_chant:" + (i + 1), row?.gradual);
        pushText(segments, "preparatory_collect:" + (i + 1), row?.collect);
      }
      for (let i = 0; i < (p.specialSections || []).length; i++) {
        const row = p.specialSections[i];
        pushText(segments, "special:" + (row?.id || (i + 1)), row?.text);
      }
      return {
        date: result.date,
        status: "ready",
        sourcePath: p.sourcePath ?? null,
        properId: p.properId ?? null,
        riteProfile: p.riteProfile ?? "ordinary_mass",
        inheritedProper: Boolean(p.inheritedProper),
        formularyIndex: p.formularyIndex ?? 0,
        formularies: p.formularies ?? null,
        observance: {
          title: result?.day?.main?.title ?? p.name ?? null,
          rank: result?.day?.main?.rank ?? p.rank ?? null,
          color: result?.day?.main?.color ?? p.color ?? null,
          flexibility: result?.day?.main?.flexibility ?? null,
        },
        commemorations: p.calendarCommemorations ?? [],
        sourceRules: p.sourceRules ?? [],
        segments,
        sourceRecoveries: [...(globalThis.__AO_CORPUS_SOURCE_RECOVERIES ?? [])],
        diagnostic: {
          requestedFiles: result?.diagnostic?.requestedFiles ?? [],
          referencesResolved: result?.diagnostic?.referencesResolved ?? [],
          structuralInheritances: result?.diagnostic?.structuralInheritances ?? [],
          legacyCommonRecoveries: result?.diagnostic?.legacyCommonRecoveries ?? [],
          languageGaps: result?.diagnostic?.languageGaps ?? [],
          warnings: result?.diagnostic?.warnings ?? [],
          errors: result?.diagnostic?.errors ?? [],
        },
      };
    };

    const all = [];
    for (const date of dateList) {
      globalThis.__AO_CORPUS_CURRENT_DATE = date;
      globalThis.__AO_CORPUS_SOURCE_RECOVERIES = [];
      const first = await resolver.resolveDay(date, { formularyIndex: 0 });
      all.push(extract(first));
      const count = Math.max(1, Number(first?.day?.massOptions?.length || 1));
      for (let i = 1; i < count; i++) {
        globalThis.__AO_CORPUS_CURRENT_DATE = date;
        globalThis.__AO_CORPUS_SOURCE_RECOVERIES = [];
        const alternate = await resolver.resolveDay(date, { formularyIndex: i });
        all.push(extract(alternate));
      }
    }
    return all;
  }, dates);
}

function canonicalize(rows) {
  const docs = new Map();
  const failures = [];
  for (const row of rows) {
    if (row.status !== "ready" || !row.sourcePath) {
      failures.push(row);
      continue;
    }
    const text = finalLatin(row);
    const hash = sha256(text);
    const key = row.sourcePath + "::" + hash;
    const current = docs.get(key) || {
      key,
      sourcePath: row.sourcePath,
      sourceFamily: rootFamily(row.sourcePath),
      finalLatinSha256: hash,
      riteProfile: row.riteProfile,
      denominator: denominator(row),
      inheritedProper: row.inheritedProper,
      firstObserved: row.date,
      lastObserved: row.date,
      observedDates: [],
      observedCount: 0,
      formularyIndexes: new Set(),
      observanceTitles: new Set(),
      referenceFamilies: { temporal:false, sanctoral:false, common:false },
      segments: row.segments,
      diagnosticSample: row.diagnostic,
    };
    current.observedCount += 1;
    current.lastObserved = row.date;
    if (current.observedDates.length < 20 && !current.observedDates.includes(row.date)) current.observedDates.push(row.date);
    current.formularyIndexes.add(row.formularyIndex ?? 0);
    if (row.observance?.title) current.observanceTitles.add(row.observance.title);
    const rf = referencedFamilies(row);
    current.referenceFamilies.temporal ||= rf.temporal;
    current.referenceFamilies.sanctoral ||= rf.sanctoral;
    current.referenceFamilies.common ||= rf.common;
    docs.set(key, current);
  }
  return {
    docs: [...docs.values()].map(x => ({
      ...x,
      formularyIndexes:[...x.formularyIndexes].sort((a,b)=>a-b),
      observanceTitles:[...x.observanceTitles].sort(),
    })),
    failures,
  };
}

function buildSurfaceStats(canonicalDocs, encounterRows) {
  const stats = new Map();
  const docSets = new Map();
  const slotCounts = new Map();
  const specialCounts = new Map();
  const encounterCounts = new Map();

  const touch = token => {
    if (!stats.has(token)) stats.set(token, {
      token,
      encounterCount:0,
      normalDocDispersion:0,
      temporalDocs:0,
      sanctoralDocs:0,
      commonSourceDocs:0,
      specialCount:0,
    });
    return stats.get(token);
  };

  for (const doc of canonicalDocs) {
    const tokens = new Set(normalizedTokens((doc.segments || []).map(x => x.text).join("\n")));
    if (doc.denominator !== "NORMAL_PROPERS") continue;
    for (const token of tokens) {
      const key = token;
      if (!docSets.has(key)) docSets.set(key, new Set());
      docSets.get(key).add(doc.key);
      const s = touch(token);
      if (doc.sourceFamily === "TEMPORAL") s.temporalDocs += 1;
      if (doc.sourceFamily === "SANCTORAL") s.sanctoralDocs += 1;
      if (doc.referenceFamilies?.common || doc.sourceFamily === "COMMON") s.commonSourceDocs += 1;
    }
  }

  for (const [token,set] of docSets) touch(token).normalDocDispersion = set.size;

  for (const row of encounterRows) {
    if (row.status !== "ready") continue;
    const target = denominator(row) === "NORMAL_PROPERS" ? encounterCounts : specialCounts;
    for (const segment of row.segments || []) {
      for (const token of normalizedTokens(segment.text)) {
        target.set(token, (target.get(token) || 0) + 1);
        if (denominator(row) === "NORMAL_PROPERS") {
          const skey = segment.slot + "::" + token;
          slotCounts.set(skey, (slotCounts.get(skey) || 0) + 1);
        }
      }
    }
  }
  for (const [token,count] of encounterCounts) touch(token).encounterCount = count;
  for (const [token,count] of specialCounts) touch(token).specialCount = count;

  const rows = [...stats.values()].sort((a,b) =>
    b.normalDocDispersion - a.normalDocDispersion ||
    b.encounterCount - a.encounterCount ||
    a.token.localeCompare(b.token)
  );
  const slots = [...slotCounts.entries()].map(([key,count]) => {
    const i = key.indexOf("::");
    return {slot:key.slice(0,i),token:key.slice(i+2),count};
  }).sort((a,b)=>b.count-a.count);
  return {rows,slots};
}

function buildNgrams(encounterRows, n) {
  const counts = new Map();
  for (const row of encounterRows) {
    if (row.status !== "ready" || denominator(row) !== "NORMAL_PROPERS") continue;
    for (const segment of row.segments || []) {
      const t = normalizedTokens(segment.text);
      for (let i=0;i<=t.length-n;i++) {
        const key=t.slice(i,i+n).join(" ");
        counts.set(key,(counts.get(key)||0)+1);
      }
    }
  }
  return [...counts.entries()]
    .map(([ngram,count])=>({ngram,count}))
    .sort((a,b)=>b.count-a.count || a.ngram.localeCompare(b.ngram))
    .slice(0,1000);
}

await mkdir(OUT, { recursive:true });
await listen();
let browser;
try {
  browser = await chromium.launch({headless:true});
  const context = await browser.newContext({viewport:{width:1280,height:900},locale:"en-GB"});
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", e => pageErrors.push(String(e?.message ?? e)));
  await page.goto("http://127.0.0.1:4197/index.html?aoR17Reader=native", {
    waitUntil:"domcontentloaded", timeout:90000
  });
  await page.waitForFunction(() =>
    typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay === "function",
    null, {timeout:45000}
  );

  const pin = await page.evaluate(() => globalThis.AO_SOURCE_TRANSPORT_COMPAT?.pin ?? globalThis.AO_DIVINUM_OFFICIUM_PIN ?? null);
  if (pin) assert.equal(pin, PIN, "production Divinum Officium pin drifted");

  const recoverySources = await loadRecoverySources();
  await page.evaluate(({sources,pin,donors}) => {
    const upstreamFetch = globalThis.fetch.bind(globalThis);
    const RECOVERY_DONORS_BROWSER = donors;\n    const langKey = value => /^French$/i.test(value) ? "Francais" : value;
    const responseFor = (text, donor, requested) => {
      globalThis.__AO_CORPUS_SOURCE_RECOVERIES ??= [];
      globalThis.__AO_CORPUS_SOURCE_RECOVERIES.push({
        date: globalThis.__AO_CORPUS_CURRENT_DATE ?? null,
        requested,
        donor,
        policy: "CORPUS_ONLY_PINNED_SOURCE_RECOVERY",
      });
      return new Response(text, {
        status:200,
        headers:{
          "content-type":"text/plain; charset=utf-8",
          "x-ao-corpus-recovery":"1",
          "x-ao-corpus-donor":donor,
        },
      });
    };
    globalThis.fetch = async (input,init) => {
      const raw = typeof input === "string" ? input : (input?.url ?? String(input ?? ""));
      let match = raw.match(new RegExp(
        "^https://raw\\.githubusercontent\\.com/DivinumOfficium/divinum-officium/" + pin +
        "/obsolete/missa/(Latin|English|Francais|French)/Commune/C10t\\.txt$","i"
      ));
      if (match) {
        const language = langKey(match[1]);
        const key = "C10t:" + language;
        const text = sources[key];
        if (text != null) return responseFor(text, RECOVERY_DONORS_BROWSER[key], raw);
      }

      match = raw.match(new RegExp(
        "^https://raw\\.githubusercontent\\.com/DivinumOfficium/divinum-officium/" + pin +
        "/web/www/(?:missa|horas)/(Latin|English|Francais|French)/Tempora/Nat1-1\\.txt$","i"
      ));
      if (match) {
        const date = String(globalThis.__AO_CORPUS_CURRENT_DATE ?? "");
        const md = date.slice(5);
        const donorId = md === "12-29" ? "Nat29" : md === "12-30" ? "Nat30" : md === "12-31" ? "Nat31" : null;
        if (donorId) {
          const language = langKey(match[1]);
          const key = donorId + ":" + language;
          const text = sources[key];
          if (text != null) return responseFor(text, RECOVERY_DONORS_BROWSER[key], raw);
        }
      }
      return upstreamFetch(input,init);
    };
  }, {sources:recoverySources,pin:PIN,donors:RECOVERY_DONORS});

  const discoveryDates = datesBetween(discoveryStart, discoveryEnd);
  const encounterDates = datesBetween(encounterStart, encounterEnd);
  const discoveryRows = [];
  const encounterRows = [];
  const batchSize = 31;

  for (let i=0;i<discoveryDates.length;i+=batchSize) {
    const batch=discoveryDates.slice(i,i+batchSize);
    discoveryRows.push(...await resolveBatch(page,batch));
    if ((i/batchSize)%12===0) console.log("discovery", i, "/", discoveryDates.length);
  }
  for (let i=0;i<encounterDates.length;i+=batchSize) {
    encounterRows.push(...await resolveBatch(page,encounterDates.slice(i,i+batchSize)));
  }

  const canonical = canonicalize(discoveryRows);
  const surface = buildSurfaceStats(canonical.docs, encounterRows);
  const bigrams = buildNgrams(encounterRows,2);
  const trigrams = buildNgrams(encounterRows,3);

  const manifest = {
    schema:"ao-core-proper-corpus-v1",
    generatedAt:new Date().toISOString(),
    source:{
      adOrientemBranch:process.env.GITHUB_REF_NAME ?? null,
      divinumOfficiumPin:PIN,
      resolver:"AO_RUNTIME_V8.resolver.resolveDay",
      policy:"production-resolver-output-only",
    },
    windows:{discoveryStart,discoveryEnd,encounterStart,encounterEnd},
    methodology:{
      discovery:"All production calendar days and all exposed formularies in the discovery window; final resolved Latin is canonicalized by sourcePath + final-text SHA-256.",
      encounter:"One complete liturgical-year window; every production-resolved formulary occurrence contributes encounter frequency.",
      specialRites:["good_friday_1962","holy_thursday_1962","easter_vigil_1962","palm_sunday_1962","candlemas_1962","ash_wednesday_1962","requiem_mass_1962"],
      sourceRecovery:"Two pinned-source anomalies are recovered only inside this research harness: Tempora/Nat1-1 is date-mapped to Nat29/Nat30/Nat31 on 29-31 December; obsolete Mass Commune/C10t is served from its pinned obsolete/missa donor before source-transport compatibility can redirect it to a non-existent Hours file.",
      note:"Raw Divinum Officium filenames are never counted directly. Reference resolution, 1960 section selection, commemorations, inherited Propers, and production calendar substitutions are inherited from Ad Orientem runtime.",
    },
    summary:{
      discoveryRows:discoveryRows.length,
      encounterRows:encounterRows.length,
      canonicalDocuments:canonical.docs.length,
      normalDocuments:canonical.docs.filter(x=>x.denominator==="NORMAL_PROPERS").length,
      specialDocuments:canonical.docs.filter(x=>x.denominator==="SPECIAL_RITES").length,
      failedDiscoveryRows:canonical.failures.length,
      failedEncounterRows:encounterRows.filter(x=>x.status!=="ready").length,
      pageErrors,
    },
    documents:canonical.docs,
    failures:{
      discovery:canonical.failures,
      encounter:encounterRows.filter(x=>x.status!=="ready"),
    },
  };

  await writeFile(resolve(OUT,"resolved-proper-manifest.json"),JSON.stringify(manifest,null,2));
  await writeFile(resolve(OUT,"encounter-records.json"),JSON.stringify({
    schema:"ao-core-proper-encounters-v1",
    source:manifest.source,
    window:{encounterStart,encounterEnd},
    rows:encounterRows,
  },null,2));
  await writeFile(resolve(OUT,"surface-statistics.json"),JSON.stringify({
    schema:"ao-core-proper-surface-stats-v1",
    source:manifest.source,
    rows:surface.rows,
    slotCounts:surface.slots,
    bigrams,
    trigrams,
  },null,2));

  const csv = [
    ["token","encounter_count","normal_doc_dispersion","temporal_docs","sanctoral_docs","common_source_docs","special_count"],
    ...surface.rows.map(x=>[
      x.token,x.encounterCount,x.normalDocDispersion,x.temporalDocs,x.sanctoralDocs,x.commonSourceDocs,x.specialCount
    ])
  ].map(row=>row.map(csvCell).join(",")).join("\n");
  await writeFile(resolve(OUT,"surface-ranking.csv"),csv+"\n");

  console.log(JSON.stringify(manifest.summary,null,2));
  assert.equal(pageErrors.length,0,"uncaught page errors during corpus sweep");
  assert.equal(canonical.failures.length,0,"discovery resolver failures present");
  assert.equal(encounterRows.some(x=>x.status!=="ready"),false,"encounter resolver failures present");
  await context.close();
} finally {
  await browser?.close();
  await closeServer();
}
