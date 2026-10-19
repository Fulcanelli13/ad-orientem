#!/usr/bin/env node
/**
 * Compare *current* native annex text rows against original canonical
 * Ordinary English/French. Do NOT modify either source or claim final
 * acceptance; the effective English patch overlay is separate.
 */
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {normalizeLatin} from "./reconcile-annexed-text-owners.mjs";
import {buildAspergesPayload} from "../../src/mass/reader-asperges.js";
import {buildPalmPayload} from "../../src/mass/reader-palm.js";
import {buildAshPayload} from "../../src/mass/reader-ash.js";
import {buildCandlemasPayload} from "../../src/mass/reader-candlemas.js";
import {buildRogationsPayload} from "../../src/mass/reader-rogations.js";
import {buildRequiemAbsolutionPayload} from "../../src/mass/reader-requiem-absolution.js";
import {buildCorpusChristiProcessionPayload} from "../../src/mass/reader-corpus-christi.js";
import {buildHolyThursdayPostPayload} from "../../src/mass/reader-holy-thursday-post.js";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const graph=read("data/mass/special-days-extension.v1.3.json").graphs;
const records=[
  ["ASPERGES","ASP","reader-asperges",buildAspergesPayload,{}],
  ["PALM","PALM","reader-palm",buildPalmPayload,{}],
  ["ASH","ASH","reader-ash",buildAshPayload,{}],
  ["CANDLEMAS","CND","reader-candlemas",buildCandlemasPayload,{}],
  ["ROGATIONS_PROCESSION","ROG","reader-rogations",buildRogationsPayload,{}],
  ["REQUIEM_ABSOLUTION","ABS","reader-requiem-absolution",buildRequiemAbsolutionPayload,{bodyPresent:true,burialProcession:true}],
  ["CORPUS_CHRISTI","CORPUS","reader-corpus-christi",buildCorpusChristiProcessionPayload,{}],
  ["HOLY_THURSDAY_POST","HT_POST","reader-holy-thursday-post",buildHolyThursdayPostPayload,{}],
];
function normVernacular(value){
  return String(value??"").replace(/[℣℟✠†]/g,"").normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}
export function buildDraftCollisionAudit(){
  const corpus=read("data/presentation/reader-text-sung.v1.json");
  const french=read("data/presentation/reader-french-ordinary.v1.json");
  const can=new Map;
  for(const block of corpus.blocks??[])for(const u of block.units??[]){
    const k=normalizeLatin(u.latin);
    if(!k)continue;
    const item={cueId:u.cue_id,english:u.english??null,
      french:french.byCue?.[u.cue_id]??null};
    if(!can.has(k))can.set(k,[]);
    can.get(k).push(item);
  }
  const matched=[];
  const scope={};
  for(const [rite,key,file,builder,options] of records){
    const p=read("data/presentation/"+file+".v1.json");
    const cards=builder({graph:graph[key],payload:p,...options}).cards;
    const rows=cards.flatMap(card=>card.paragraphs??[]);
    let hits=0;
    for(const row of rows){
      const candidates=can.get(normalizeLatin(row.latin))??[];
      if(!candidates.length)continue;
      hits++;
      const hasEnglish=typeof row.english==="string"&&row.english.trim().length>0;
      const hasFrench=typeof row.french==="string"&&row.french.trim().length>0;
      const englishSame=hasEnglish && candidates.some(c=>
        c.english && normVernacular(c.english)===normVernacular(row.english));
      const frenchSame=hasFrench && candidates.some(c=>
        c.french && normVernacular(c.french)===normVernacular(row.french));
      const record={
        rite,cardId:cardByRow(cards,row),rowId:row.id,sourceRecordId:row.sourceRecordId,
        ordinaryCueCandidates:[...new Set(candidates.map(c=>c.cueId))],
        draftHasEnglish:hasEnglish,draftHasFrench:hasFrench,
        englishMatchesFrozenDonor:hasEnglish?Boolean(englishSame):null,
        frenchMatchesPinnedOrdinary:hasFrench?Boolean(frenchSame):null,
        decision:!hasEnglish||!hasFrench?"EXISTING_BILINGUAL_OWNER_REUSE_CANDIDATE_NO_ANNEX_TRANSLATION":
          englishSame&&frenchSame?"BILINGUAL_WORDING_MATCH_RELINK_OWNER":
          "EDITORIAL_WORDING_COLLISION_ADJUDICATE_ONCE",
        note:"Exact normalized Latin only. Ceremonial event and speaker role are not transferable.",
      };
      matched.push(record);
    }
    scope[rite]={cards:cards.length,sourceRows:rows.length,matchingOrdinaryLatinRows:hits,
      matchingRowsWithoutFullDraftLanguages:matched.filter(x=>x.rite===rite &&
        (!x.draftHasEnglish||!x.draftHasFrench)).length,
      matchingRowsWithEditorialCollision:matched.filter(x=>x.rite===rite &&
        x.decision==="EDITORIAL_WORDING_COLLISION_ADJUDICATE_ONCE").length};
  }
  return {
    schema:"ao-draft-annex-wording-owner-collision-audit-v1",
    status:"SOURCE_COMPARISON_ONLY_NO_TEXT_PROMOTIONS",
    guard:"English is compared to original SUNG donor, not automatically the effective approved canonical correction layer. Review exact cue & event role before any reuse.",
    checkedAgainst:["data/presentation/reader-text-sung.v1.json",
      "data/presentation/reader-french-ordinary.v1.json"],
    summary:{rites:records.length,matchedRows:matched.length,
      completeExistingBilingualOwnerCandidates:matched.filter(r=>
        !r.draftHasEnglish||!r.draftHasFrench).length,
      provisionalEditorialWordingCollisions:matched.filter(r=>
        r.decision==="EDITORIAL_WORDING_COLLISION_ADJUDICATE_ONCE").length,
      sameDraftAndDonor:matched.filter(r=>r.decision==="BILINGUAL_WORDING_MATCH_RELINK_OWNER").length},
    scope,matched,
    gate:"DO_NOT_RETRANSLATE_DO_NOT_AUTO_REPLACE_TEXT_DO_NOT_IMPORT_MASS_CUES",
  };
}
function cardByRow(cards,row){
  return cards.find(c=>(c.paragraphs??[]).includes(row))?.id??null;
}
const called=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(called){
 const result=buildDraftCollisionAudit();
 if(process.argv.includes("--write")){
   const destination=resolve(root,"artifacts/annexed-draft-translation-collisions.json");
   mkdirSync(dirname(destination),{recursive:true});
   writeFileSync(destination,JSON.stringify(result,null,2)+"\n");
 }
 console.log(JSON.stringify({status:result.status,summary:result.summary,
   scope:result.scope,collisions:result.matched.filter(r=>
     r.decision==="EDITORIAL_WORDING_COLLISION_ADJUDICATE_ONCE").slice(0,28)},null,2));
}
