import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {execFileSync} from "node:child_process";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const root="data/shrines/research/";
const packs=["sacred-atlas-wave1-first10-extended-guides-20261105.v1.json",
"sacred-atlas-wave1-guides11-20-20261105.v1.json",
"sacred-atlas-wave1-guides21-30-20261105.v1.json",
"sacred-atlas-wave1-guides31-43-20261105.v1.json",
"sacred-atlas-wave1-guides44-56-20261105.v1.json"];
const guides=packs.flatMap(p=>read(root+p).guides);
const approvedPath="data/shrines/illustrated-place-guides-wave1-reviewed.v1.json";
const approved=read(approvedPath);
const hero=read("data/geography/approved-place-media.v1.json");
const source=read("data/shrines/source-registry.v1.json");
const rel=read("data/explore/sacred-phenomena-seed.v1.json").relics.find(x=>x.id==="relic:FR:main-saint-quentin");
const ledger=read(root+"sacred-atlas-wave1-batch56-editorial-closure-20261105.v1.json");
const html=fs.readFileSync(root+"sacred-atlas-wave1-all56-second-editor-review-20261105.html","utf8");
const script="tools/atlas/stage-sacred-atlas-wave1-reviewed-guides.mjs";
const service=fs.readFileSync("src/find/explore-data-service.js","utf8");
function fp(g){let h=2166136261,s=JSON.stringify([g.place_id,g.subtitle_en,g.subtitle_fr,g.sections]);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,"0")}
assert.equal(guides.length,56);
assert.equal(ledger.counts.expanded_bilingual_drafts_second_editor_pending,56);
assert.equal(ledger.counts.published_guide_changes,0);
assert.equal(ledger.counts.photo_cover_changes,0);
assert.equal(hero.items.length,379);
assert.equal(approved.schema,"AO_ILLUSTRATED_PLACE_GUIDES_V1");
assert.deepEqual(approved.guides,[]);
assert.match(service,/illustratedWave1Reviewed/);
assert.ok(!/fetchJson\(EXPLORE_DATA_URLS\.[^,]*research/i.test(service));
assert.equal(rel.authenticity_finding.status,"ATTRIBUTION_EXCLUDED_BY_DATING");
assert.match(rel.summary_en,/2008 analysis/);
assert.match(rel.summary_en,/ruling out attribution/);
assert.match(rel.summary_fr,/excluant son attribution/);
assert.match(rel.title_en,/attribution disproved/);
assert.equal(source.sources.find(x=>x.id==="SHR-PIL-IT-saint-paul-outside-walls-rome").url,
 "https://www.vatican.va/various/basiliche/san_paolo/en/basilica/tomba.htm");
assert.equal(source.sources.find(x=>x.id==="SHR-FR-VEZELAY-MADELEINE").url,
 "https://www.basiliquedevezelay.org/marie-madeleine/");
const santa=guides.find(x=>x.place_id==="place:IT:santa-croce-gerusalemme-rome");
assert.match(santa.sections.find(s=>s.id==="closure").paragraphs[0].en,/23 October 2026/);
assert.match(santa.sections.find(s=>s.id==="closure").paragraphs[0].fr,/23 octobre 2026/);
assert.equal(santa.sections.find(s=>s.id==="closure").paragraphs[0].source_url,
 "https://www.diocesidiroma.it/riapre-la-cappella-delle-reliquie-a-santa-croce-in-gerusalemme/");
const match=html.match(/<script id="ao-review-bundle" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(match,"Embedded offline review data absent");
const embedded=JSON.parse(match[1]);
assert.equal(embedded.guides.length,56);
assert.equal(new Set(embedded.guides.map(x=>x.place_id)).size,56);
assert.equal(embedded.guides.filter(x=>x.photo_asset_path).length,34);
assert.ok(embedded.guides.every(x=>x.published===false&&x.sections.length===3&&x.sections.every(s=>s.paragraphs.every(p=>p.en&&p.fr&&p.source_url))));
assert.ok(html.includes('Export all 56 decisions as JSON'));
assert.ok(html.includes('APPROVED_FOR_IMPORT'));
assert.ok(html.includes('source_verified'));
assert.ok(html.includes('translation_verified'));
assert.ok(html.includes('claims_qualified'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"ao-atlas-w1-"));
const original=fs.readFileSync(approvedPath,"utf8");
const mk=()=>({schema:"AO_SACRED_ATLAS_W1_SECOND_EDITOR_DECISIONS_V1",reviewer:"Second Editor Test Fixture",reviewer_role:"INDEPENDENT_SECOND_EDITOR",
 source_bundle_date:"2026-11-05",entries:guides.map(g=>({
 place_id:g.place_id,guide_fingerprint:fp(g),decision:"PENDING",
 sections:g.sections.map(s=>({id:s.id,source_verified:false,translation_verified:false,claims_qualified:false})),
 identity_verified:false,relic_claims_verified:false,visit_scope_verified:false,media_scope_verified:false,special_issues_verified:false,
 notes:"",reviewed_at:null
 }))});
const file=path.join(tmp,"review.json"),out=path.join(tmp,"output.json");
const run=(args,shouldFail=false)=>{
 try{const stdout=execFileSync(process.execPath,[script,"--decisions",file,...args],{encoding:"utf8",stdio:["ignore","pipe","pipe"]});
  if(shouldFail)throw Error("Unsafe review passed");return stdout;
 }catch(e){if(!shouldFail)throw e;return String(e.stderr||e.message)}
};
try{
 let d=mk();fs.writeFileSync(file,JSON.stringify(d));let stdout=run([]);
 assert.match(stdout,/"accepted": 0/);
 assert.match(run(["--apply"],true),/No accepted guides to publish/);
 d.entries[0].decision="APPROVED_FOR_IMPORT";d.entries[0].reviewed_at="2026-11-05T08:00:00Z";
 fs.writeFileSync(file,JSON.stringify(d));assert.match(run([],true),/Missing whole-guide second-editor gate/);
 let e=d.entries[0];for(const k of ["identity_verified","relic_claims_verified","visit_scope_verified","media_scope_verified","special_issues_verified"])e[k]=true;
 e.sections=e.sections.map(s=>({...s,source_verified:true,translation_verified:true,claims_qualified:true}));
 fs.writeFileSync(file,JSON.stringify(d));stdout=run(["--output",out]);
 assert.match(stdout,/"accepted": 1/);
 let staged=read(out);assert.equal(staged.guides.length,1);
 assert.equal(staged.guides[0].place_id,guides[0].place_id);
 assert.equal(staged.guides[0].publication,"PUBLISHED");
 assert.equal(staged.guides[0].sections.length,3);
 assert.equal(staged.guides[0].image_policy,"USE_APPROVED_PLACE_MEDIA_ONLY");
 assert.equal(staged.guides[0].review.reviewer,"Second Editor Test Fixture");
 assert.match(staged.guides[0].official_url,/^https:\/\//);
 assert.equal(fs.readFileSync(approvedPath,"utf8"),original,"Staging modified public file");
 e.guide_fingerprint="00000000";fs.writeFileSync(file,JSON.stringify(d));
 assert.match(run(["--output",out],true),/snapshot stale, tampered or missing/);
 e.guide_fingerprint=fp(guides[0]);e.sections[1].translation_verified=false;
 fs.writeFileSync(file,JSON.stringify(d));assert.match(run([],true),/Paragraph source \/ translation \/ qualification not reviewed/);
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
console.log("Sacred Atlas Wave1 editorial release PASS: 56 offline cards, 34 approved thumbnails, source corrections, fail-closed editor JSON and one synthetic staged accepted guide; zero public guide changes.");
