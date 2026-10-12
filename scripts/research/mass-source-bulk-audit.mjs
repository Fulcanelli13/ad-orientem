#!/usr/bin/env node
// Research-only bulk inventory of source headings and annotations. No production writes.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
const input = "data/geography/research/mass-1962-uninspected-source-triage-20261011.v1.json";
const output = process.argv[2] || "data/geography/research/mass-seasonal-bulk-source-audit.v1.json";
const limit = Number(process.env.MASS_AUDIT_LIMIT || 0);
const concurrency = Math.min(12, Math.max(1, Number(process.env.MASS_AUDIT_CONCURRENCY || 6)));
const auditFamily = process.env.MASS_AUDIT_FAMILY || "NON_SANCTORAL";
const source = JSON.parse(readFileSync(input, "utf8"));
const list = source.rows.filter(r => auditFamily === "ALL" || (auditFamily === "NON_SANCTORAL" ? r.sourceFamily !== "SANCTORAL_FIXED_DATE_SOURCE" : r.sourceFamily === auditFamily)).slice(0, limit || undefined);
const rows = Array(list.length);
let next = 0;
function splitSections(txt) {
  const matches = [...txt.matchAll(/^\[([^\]\r\n]+)\]\s*$/gm)];
  return matches.map((m,i) => {
    const body = txt.slice(m.index + m[0].length, matches[i+1]?.index ?? txt.length);
    return {
      section: m[1],
      bibleNoteCandidates: [...body.matchAll(/^!([^\r\n]+)/gm)].map(x=>x[1].trim()),
      referenceDirectives: [...body.matchAll(/^(@[^\r\n]+)/gm)].map(x=>x[1].trim()),
      initialLatin: body.split(/\r?\n/).map(x=>x.trim()).find(x=>x && !x.startsWith("!") && !x.startsWith("@") && !x.startsWith("("))?.slice(0,300) ?? null
    };
  });
}
async function worker() {
  while (next < list.length) {
    const i = next++;
    const r = list[i];
    const url = "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/master/web/www/missa/Latin/" + r.sourcePath + ".txt";
    try {
      const response = await fetch(url, {headers: {"User-Agent":"ad-orientem-mass-research"}});
      if (!response.ok) throw new Error("HTTP " + response.status);
      const bytes = Buffer.from(await response.arrayBuffer());
      const digest = createHash("sha1").update("blob " + bytes.length + "\0").update(bytes).digest("hex");
      if (digest !== r.sourceBlobSha) throw new Error("CENSUS_GIT_BLOB_MISMATCH expected=" + r.sourceBlobSha + " actual=" + digest);
      const sections = splitSections(bytes.toString("utf8"));
      rows[i] = {sourcePath:r.sourcePath,sourceFamily:r.sourceFamily,sourceUrl:url,sourceBlobShaAtCensus:r.sourceBlobSha,sourceBlobVerified:true,
        retrieval:"RETRIEVED",sections,missal1962EligibilityVerified:false,scriptureVerseCollated:false,publishable:false};
    } catch(err) {
      rows[i] = {sourcePath:r.sourcePath,sourceFamily:r.sourceFamily,sourceUrl:url,retrieval:"ERROR",error:String(err),
        missal1962EligibilityVerified:false,scriptureVerseCollated:false,publishable:false};
    }
  }
}
await Promise.all(Array.from({length:concurrency},worker));
const result = {schema:"MASS_BULK_LATIN_SOURCE_SECTION_DISCOVERY_V1",sourceInventory:input,auditFamily,
  caution:"Raw section boundaries and editorial ! lines only; source file does not certify use in 1962 Missal. Verify edition and actual chant words separately.",
  totals:{attempted:rows.length,retrieved:rows.filter(x=>x.retrieval==="RETRIEVED").length,errors:rows.filter(x=>x.retrieval==="ERROR").length,
    chantSectionCandidates:rows.reduce((n,x)=>n+(x.sections||[]).filter(s=>/^(Introitus|Graduale|Tractus|Alleluia|Sequentia|Offertorium|Communio)/i.test(s.section)).length,0)},
  publicationApproved:false,rows};
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result.totals));
if(result.totals.errors)process.exitCode=1;
