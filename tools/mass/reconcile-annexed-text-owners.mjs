#!/usr/bin/env node
/**
 * Mass annex textual ownership: read-only cross-source census.
 * NEVER translates, rewrites, or promotes rite text.
 * Run: node tools/mass/reconcile-annexed-text-owners.mjs [--write]
 * Compares exact normalized source Latin, NOT prayer titles or fuzzy meaning.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const read=path=>JSON.parse(readFileSync(resolve(root,path),"utf8"));
export const RITES=Object.freeze([
  ["ASPERGES","data/presentation/reader-asperges.v1.json",["formulas","versicles","prayer"]],
  ["PALM","data/presentation/reader-palm.v1.json",["texts"]],
  ["ASH","data/presentation/reader-ash.v1.json",["opening","blessingOrations","distribution","conclusion"]],
  ["CANDLEMAS","data/presentation/reader-candlemas.v1.json",["dialogue","blessingOrations","distribution","procession"]],
  ["ROGATIONS_PROCESSION","data/presentation/reader-rogations.v1.json",["opening","litanyBeforeProcession","processionLitany","postLitany"]],
  ["REQUIEM_ABSOLUTION","data/presentation/reader-requiem-absolution.v1.json",["nonIntres","liberaMe","kyriePaterVersicles","departure"]],
  ["CORPUS_CHRISTI","data/presentation/reader-corpus-christi.v1.json",["pangeLingua","tantumErgo","benediction"]],
  ["HOLY_THURSDAY_POST","data/presentation/reader-holy-thursday-post.v1.json",["pangeLingua","tantumErgo","stripping"]],
]);
export const OWNER_SOURCES=Object.freeze({
  latinAndEnglish:"data/presentation/reader-text-sung.v1.json",
  latinAndEnglishLow:"data/presentation/reader-text-low.v1.json",
  french:"data/presentation/reader-french-ordinary.v1.json",
  englishCorrections:"data/mass/canonical-text-corrections.v1.json",
  rogationMassProper:"data/mass/rogation-proper-trilingual.v1.json",
  rogationProcession:"data/presentation/reader-rogations.v1.json",
  authoritativePolicy:"data/mass/source-reconciliation-gates.v1.json",
});
export function normalizeLatin(text){
  return String(text??"").replace(/[℣℟✠†]/g,"").replace(/[æÆ]/g,"ae").replace(/[œŒ]/g,"oe")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}
const skip=new Set(["id","kind","type","source","status","authority","schema","name","title",
  "incipit","note","notes","guide","version","sourceRecordId","liturgicalVariant",
  "english","french","translationSource","sourceStatus","owner","responseEn","responseFr",
  "invitationEn","invitationFr","antiphonEn","antiphonFr","psalmEn","psalmFr",
  "gloriaEn","gloriaFr"]);
function skipKey(key){
  return skip.has(key)||/(?:English|French|En|Fr)$/.test(key);
}
function collectStrings(value,path="",found=[]){
  if(typeof value==="string"){
    const latin=value.trim();
    if(latin.length>=4 && !/^https?:\/\//i.test(latin) && normalizeLatin(latin).length>=4)
      found.push({path,latin});
  }else if(Array.isArray(value)){
    for(let i=0;i<value.length;i++)collectStrings(value[i],path+"."+i,found);
  }else if(value && typeof value==="object"){
    for(const [key,child] of Object.entries(value)){
      if(!skipKey(key))collectStrings(child,path?path+"."+key:key,found);
    }
  }
  return found;
}
export function buildReconciliation(){
  const sung=read(OWNER_SOURCES.latinAndEnglish);
  const low=read(OWNER_SOURCES.latinAndEnglishLow);
  const french=read(OWNER_SOURCES.french);
  const canon=new Map();
  const forms={SUNG:sung,LOW:low};
  for(const [form,source] of Object.entries(forms)){
    for(const block of source.blocks??[])for(const unit of block.units??[]){
      const key=normalizeLatin(unit.latin);
      if(!key)continue;
      if(!canon.has(key))canon.set(key,[]);
      canon.get(key).push({
        cueId:unit.cue_id,blockId:block.Block_ID,form,
        // Source locations only, never replicate canonical liturgical wording.
        englishSource:OWNER_SOURCES.latinAndEnglish+(form==="LOW"?" (LOW uses its own donor)":""),
        frenchSource:typeof french.byCue?.[unit.cue_id]==="string"?OWNER_SOURCES.french:null,
      });
    }
  }
  const all=[];
  const scope={};
  for(const [rite,file,parts] of RITES){
    const payload=read(file);
    const extracted=parts.flatMap(part=>collectStrings(payload[part],part));
    const rows=extracted.map(({path,latin})=>{
      const key=normalizeLatin(latin);
      const canonicalMatches=canon.get(key)??[];
      return {rite,source:file,path,canonicalMatches:canonicalMatches.map(match=>({
        cueId:match.cueId,form:match.form,blockId:match.blockId,
        frenchOwner:match.frenchSource,
      })),comparisonKey:key,
        decision:canonicalMatches.length?"REUSE_CANDIDATE_REVIEW_ROLE_AND_MODE":"NO_EXACT_ORDINARY_MATCH_NOT_A_MISSING_TRANSLATION"};
    });
    scope[rite]={source:file,scannedLeaves:rows.length,matchedLeaves:rows.filter(r=>r.canonicalMatches.length).length,
      unmatchedLeaves:rows.filter(r=>!r.canonicalMatches.length).length};
    all.push(...rows);
  }
  const group=new Map;
  for(const row of all){
    const a=group.get(row.comparisonKey)??[];
    a.push(row);group.set(row.comparisonKey,a);
  }
  const crossRiteGroups=[...group.entries()].filter(([,occurrences])=>
    new Set(occurrences.map(r=>r.rite)).size>1).map(([key,occurrences])=>({
      comparisonKey:key,occurrences:occurrences.map(r=>({rite:r.rite,path:r.path})),
      canonicalCueCandidates:[...new Set(occurrences.flatMap(r=>r.canonicalMatches.map(c=>c.cueId)))],
      decision:"SHARED_LATIN_CHECK_CONTEXT_BEFORE_SELECTING_ONE_TRANSLATION_OWNER",
    })).sort((a,b)=>b.occurrences.length-a.occurrences.length||a.comparisonKey.localeCompare(b.comparisonKey));
  // These two are different ceremonies. Similar phrases must not merge the
  // Mass Proper's scope, proclamation clock or public procession Litany.
  const rogationProper=read(OWNER_SOURCES.rogationMassProper);
  const properKeys=(rogationProper.sections??[]).map(s=>s.key);
  const ordinaryCueIds=new Set([...canon.values()].flat().map(x=>x.cueId));
  const allRiteMatches=all.filter(x=>x.canonicalMatches.length);
  const countUnique=(list,key)=>new Set(list.map(key)).size;
  return {
    schema:"ao-annexed-text-owner-reconciliation-v1",
    status:"AUDIT_ONLY_NO_TEXT_CHANGES_NO_EDITORIAL_APPROVAL",
    authority:"SOURCE_RECONCILIATION_GATE",
    generatedFrom:"repository original source files, reproducible via node tools/mass/reconcile-annexed-text-owners.mjs",
    sourceOwners:OWNER_SOURCES,
    editorialPrecedence:[
      "Latin/1962 rite and canonical cue ownership controls",
      "Retain reviewed canonical Ordinary English/French and its correction overlay",
      "Rogation Mass Proper is separate from the Rogation procession Litany",
      "Only identical source Latin authorizes a translation-reuse CANDIDATE, never an automatic gesture, response or rite merge",
      "A passage without an exact match is NOT a confirmed translation gap",
      "Draft PR #1441 editorial translations are provisional until collated against these owner records",
    ],
    corpus:{canonicalOrdinaryUniqueLatin:canon.size,canonicalOrdinaryCueIds:ordinaryCueIds.size,
      rogationProperSectionCount:properKeys.length,rogationProperSections:properKeys,
      rogationProperReviewedLanguages:["la","en","fr"]},
    summary:{annexedRites:RITES.length,sourceLeavesScanned:all.length,
      ordinaryMatchLeaves:allRiteMatches.length,
      distinctOrdinaryMatchLatin:countUnique(allRiteMatches,x=>x.comparisonKey),
      crossRiteSharedLatinGroups:crossRiteGroups.length,
      noExactOrdinaryMatchLeaves:all.length-allRiteMatches.length},
    scope,
    ordinaryReuseCandidates:allRiteMatches.map(x=>({
      rite:x.rite,path:x.path,cues:x.canonicalMatches.map(c=>({id:c.cueId,form:c.form})),
      decision:x.decision,
    })),
    crossRiteGroups,
    unlinkedSourceLeaves:all.filter(r=>!r.canonicalMatches.length).map(r=>({
      rite:r.rite,path:r.path,decision:r.decision,
    })),
    hold:{
      required:"CANONICAL_TEXT_REUSE_AND_PROVENANCE_RECONCILIATION_BEFORE_PROMOTING_NEW_TRANSLATIONS",
      noBlindChangesTo:"48-card LIVE, Simple, 1962 ceremony state, 1962 Latin, translation witnesses",
      multiWitnessNotExhaustive:"Other liturgical books, Scripture, saint/litany registries, and user files require a second verified semantic comparison.",
      missingTranslationCount:null,
      rationale:"No exact Ordinary match does not establish translation absence in other source families.",
    }
  };
}
const called=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(called){
  const report=buildReconciliation();
  if(process.argv.includes("--write")){
    const destination=resolve(root,"artifacts/annexed-text-owner-reconciliation.json");
    mkdirSync(dirname(destination),{recursive:true});
    writeFileSync(destination,JSON.stringify(report,null,2)+"\n");
  }
  console.log(JSON.stringify({status:report.status,corpus:report.corpus,summary:report.summary,
    scope:report.scope,
    topShared:report.crossRiteGroups.slice(0,15).map(x=>({
      incipit:x.comparisonKey.slice(0,85),uses:x.occurrences.length,
      rites:[...new Set(x.occurrences.map(y=>y.rite))],
    }))},null,2));
}
