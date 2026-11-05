#!/usr/bin/env node
/**
 * Sacred Atlas Wave 1: source-bound second-editor decisions -> staged published guide JSON.
 *
 * No automatic approval, image publication, route geometry change, or GitHub write.
 * The --apply flag explicitly writes the native accepted-guide file; caller must review
 * the diff and merge an ordinary gated GitHub PR for GitHub Pages release.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const P="data/shrines/research/";
const PACKS=["sacred-atlas-wave1-first10-extended-guides-20261105.v1.json",
 "sacred-atlas-wave1-guides11-20-20261105.v1.json",
 "sacred-atlas-wave1-guides21-30-20261105.v1.json",
 "sacred-atlas-wave1-guides31-43-20261105.v1.json",
 "sacred-atlas-wave1-guides44-56-20261105.v1.json"];
const DEST="data/shrines/illustrated-place-guides-wave1-reviewed.v1.json";
const otherGuides=[
"data/shrines/illustrated-place-guides-ireland.v1.json",
"data/shrines/illustrated-place-guides-france.v1.json",
"data/shrines/illustrated-place-guides-france-r67.v1.json",
"data/shrines/illustrated-place-guides-world-marian-r1.v1.json",
"data/shrines/illustrated-place-guides-global-saints-r1.v1.json",
"data/shrines/illustrated-place-guides-global-marian-b2.v1.json"
];
const read=p=>JSON.parse(fs.readFileSync(path.isAbsolute(p)?p:path.join(ROOT,p),"utf8"));
const sourceOk=s=>typeof s==="string"&&/^https:\/\/[^\s]+$/.test(s);
function fnv32(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,"0")}
function fingerprint(g){return fnv32(JSON.stringify([g.place_id,g.subtitle_en,g.subtitle_fr,g.sections]))}
function parseArgs(args){
 let out={};
 for(let i=0;i<args.length;i++){
  if(args[i]==="--apply"){out.apply=true;continue}
  if(["--decisions","--output"].includes(args[i])&&args[i+1]){out[args[i].slice(2)]=args[++i];continue}
  throw Error("Unknown argument "+args[i]);
 }
 return out;
}
function run(){
 const args=parseArgs(process.argv.slice(2));
 if(!args.decisions)throw Error("Use --decisions /path/to/owner-review.json (never stage automatically).");
 if(args.apply&&args.output)throw Error("Use --apply for curated native file OR --output for separate staging JSON, not both.");
 const master=read("data/geography/research/sacred-atlas-editorial-master-530-20261104.v1.json");
 const canonical=master.batch_plan.shrine_guide_expansion[0].place_ids;
 const map=new Map(master.places.map(p=>[p.place_id,p]));
 const guides=PACKS.flatMap(n=>read(P+n).guides);
 const previous=read(DEST);
 const decisions=read(args.decisions);
 const sourceReg=read("data/shrines/source-registry.v1.json");
 const relicReg=read("data/explore/sacred-phenomena-seed.v1.json");
 const bySource=new Map(sourceReg.sources.map(s=>[s.id,s]));
 if(previous.schema!=="AO_ILLUSTRATED_PLACE_GUIDES_V1"||!Array.isArray(previous.guides))throw Error("Native guide registry is invalid.");
 if(decisions.schema!=="AO_SACRED_ATLAS_W1_SECOND_EDITOR_DECISIONS_V1"||decisions.reviewer_role!=="INDEPENDENT_SECOND_EDITOR"||String(decisions.reviewer||"").trim().length<3||!Array.isArray(decisions.entries))
  throw Error("A named independent second-editor decision export is mandatory.");
 if(decisions.entries.length!==56||new Set(decisions.entries.map(x=>x.place_id)).size!==56)throw Error("Require exact 56 review decisions; partial or duplicate export refused.");
 assert.deepEqual(guides.map(g=>g.place_id),canonical,"Source drafts must match original 56-Place master ordering.");
 const oldIds=new Set(otherGuides.flatMap(p=>read(p).guides.map(g=>g.place_id)));
 const currIds=new Set(previous.guides.map(g=>g.place_id));
 const decisionMap=new Map(decisions.entries.map(e=>[e.place_id,e]));
 const provenRelic=relicReg.relics.find(x=>x.id==="relic:FR:main-saint-quentin");
 if(provenRelic?.authenticity_finding?.status!=="ATTRIBUTION_EXCLUDED_BY_DATING"||!/2008 analysis/.test(provenRelic.summary_en))
  throw Error("Saint-Quentin correction is not present in canonical public relic record.");
 const sc=guides.find(g=>g.place_id==="place:IT:santa-croce-gerusalemme-rome");
 if(!sc?.sections.some(s=>s.id==="closure"&&s.paragraphs.some(p=>/23 October 2026/.test(p.en)&&/diocesidiroma.it/.test(p.source_url))))
  throw Error("Santa Croce latest diocesan reopening evidence is missing.");
 const sourcesToRepair=["SHR-PIL-IT-saint-paul-outside-walls-rome","SHR-FR-VEZELAY-MADELEINE"];
 for(const id of sourcesToRepair)if(!sourceOk(bySource.get(id)?.url)||/press.vatican.va|samedi-saint/.test(bySource.get(id).url))throw Error("Canonical source repair missing for "+id);
 const accepted=[];
 for(const g of guides){
  const d=decisionMap.get(g.place_id);
  if(!d||d.guide_fingerprint!==fingerprint(g))throw Error("Review snapshot stale, tampered or missing: "+g.place_id);
  if(!["PENDING","HOLD","REJECTED","APPROVED_FOR_IMPORT"].includes(d.decision))throw Error("Unknown decision "+g.place_id);
  if(d.decision!=="APPROVED_FOR_IMPORT")continue;
  if(oldIds.has(g.place_id)||currIds.has(g.place_id))throw Error("Guide already present in published corpus: "+g.place_id);
  if(!d.reviewed_at||Number.isNaN(Date.parse(d.reviewed_at)))throw Error("Missing review date "+g.place_id);
  if(![d.identity_verified,d.relic_claims_verified,d.visit_scope_verified,d.media_scope_verified,d.special_issues_verified].every(x=>x===true))
   throw Error("Missing whole-guide second-editor gate for "+g.place_id);
  if(!Array.isArray(d.sections)||d.sections.length!==g.sections.length)throw Error("Paragraph review incomplete "+g.place_id);
  for(let i=0;i<g.sections.length;i++){
   const s=g.sections[i],check=d.sections[i];
   if(check.id!==s.id||![check.source_verified,check.translation_verified,check.claims_qualified].every(x=>x===true))
    throw Error("Paragraph source / translation / qualification not reviewed: "+g.place_id+"/"+s.id);
   if(!s.paragraphs?.length||!s.paragraphs.every(p=>p.en?.length>120&&p.fr?.length>120&&sourceOk(p.source_url)))
    throw Error("Substantive bilingual source issue: "+g.place_id+"/"+s.id);
  }
  const p=map.get(g.place_id);
  if(!p||p.shrine?.shrine_id!==g.shrine_id||p.editorial_state!=="BILINGUAL_SHRINE_SYNOPSIS_ONLY")throw Error("Identity drift for "+g.place_id);
  if(JSON.stringify(g.existing_relic_ids)!==JSON.stringify(p.relic_ids)||JSON.stringify(g.existing_pilgrimage_ids)!==JSON.stringify(p.pilgrimage_ids))throw Error("Associated heritage IDs drift "+g.place_id);
  const trusted=p.shrine.source_ids.map(id=>bySource.get(id)).find(s=>s&&sourceOk(s.url)&&s.directness!=="SECONDARY");
  const official_url=trusted?.url||g.sections[0].paragraphs[0].source_url;
  accepted.push({place_id:g.place_id,publication:"PUBLISHED",language_policy:"BILINGUAL_SOURCE_FIRST",
   official_url,region_en:g.country_code,region_fr:g.country_code,subtitle_en:g.subtitle_en,subtitle_fr:g.subtitle_fr,
   image_policy:"USE_APPROVED_PLACE_MEDIA_ONLY",gallery:[],
   sections:g.sections,stops:[],chronology:[],programmes:[],
   visit:{en:"Check current access and pilgrimage arrangements with the named source before travelling.",
    fr:"Consulter la source officielle pour les modalités actuelles de visite et de pèlerinage avant le déplacement.",
    source_url:official_url},
   review:{reviewer:decisions.reviewer,reviewed_at:d.reviewed_at,source_fingerprint:d.guide_fingerprint,decision_scope:"INDEPENDENT_SECOND_EDITOR_EN_FR_SOURCE_REVIEW"}});
 }
 const result={...previous,
  version:"1.0.0",reviewed_on:new Date().toISOString().slice(0,10),
  guides:[...previous.guides,...accepted]};
 console.log(JSON.stringify({reviewer:decisions.reviewer,total:56,accepted:accepted.length,held:decisions.entries.filter(x=>x.decision==="HOLD").length,
  rejected:decisions.entries.filter(x=>x.decision==="REJECTED").length,previousPublished:previous.guides.length,
  resultingPublished:result.guides.length,mode:args.apply?"APPLY_NATIVE_REGISTRY":args.output?"STAGE_SEPARATE_FILE":"VALIDATE_ONLY"},null,2));
 if(args.apply&&accepted.length===0)throw Error("No accepted guides to publish; refusing no-op apply.");
 if(args.apply){fs.writeFileSync(path.join(ROOT,DEST),JSON.stringify(result,null,2)+"\n");console.log("Changed curated registry. Review diff and create gated PR; no auto-commit or deployment.");}
 else if(args.output){const output=path.resolve(args.output);if(output===path.join(ROOT,DEST))throw Error("Cannot overwrite production without explicit --apply");fs.writeFileSync(output,JSON.stringify(result,null,2)+"\n");console.log("Staged "+output);}
}
try{run()}catch(e){console.error("WAVE1 REVIEW GATE FAILED:",e.message);process.exitCode=1}
