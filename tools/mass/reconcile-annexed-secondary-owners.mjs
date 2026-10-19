#!/usr/bin/env node
/**
 * SECOND-PASS OWNER DISCOVERY. No new translations. No source modifications.
 * An identical normalized Latin LINE is evidence to review, NOT a license
 * to transplant an entire prayer or call that line 1962-certified.
 */
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {PRAY_CANONICAL_DATA_V435930} from "../../src/pray/canonical-data.js";
import {normalizeLatin,buildReconciliation} from "./reconcile-annexed-text-owners.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const PRAY_PATH="src/pray/canonical-data.js";
const SOURCE_AUDIT="data/pray/prayer-source-certification-inventory.v3.json";
const SCRIPTURE_README="data/scripture/witness/README.md";
const LITANY_PATH="src/pray/litany-source.js";
function extractLatin(file,path){
  const j=read(file);
  const leaf=path.split(".").reduce((node,key)=>node?.[key],j);
  if(typeof leaf!=="string")throw new Error("ANNEX_TEXT_LEAF_UNAVAILABLE:"+file+"#"+path);
  return leaf;
}
const asLine=s=>String(s??"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
// Evidence is line-level, not word-level. A line may include a response
// formula but represent a different litany prayer in historical editions.
function prayerLineIndex(){
  const prayers=PRAY_CANONICAL_DATA_V435930.prayers;
  const lineMap=new Map();
  let indexed=0,withLatin=0,withTrilingual=0;
  for(const [id,prayer] of Object.entries(prayers)){
    if(!prayer?.la)continue;
    withLatin++;
    if(prayer.en&&prayer.fr)withTrilingual++;
    const rows=[...asLine(prayer.la)];
    // Whole prayer can match a short source row (e.g. Ave Maria)
    // but a source multi-line prayer must not match an isolated line.
    rows.push(String(prayer.la).trim());
    for(let n=0;n<rows.length;n++){
      const key=normalizeLatin(rows[n]);
      if(!key || key.length<9)continue;
      indexed++;
      const row={prayerId:id,source:PRAY_PATH,sourceLocator:"prayers."+id+".la",
        lineIndex:n<rows.length-1?n:null,prayerStatus:prayer.sourceStatus??"UNCLASSIFIED",
        hasEnglish:typeof prayer.en==="string"&&Boolean(prayer.en.trim()),
        hasFrench:typeof prayer.fr==="string"&&Boolean(prayer.fr.trim()),
        decision:"EXACT_LATIN_PRAY_CANDIDATE_REQUIRES_EDITION_AND_SCOPE_REVIEW"};
      const a=lineMap.get(key)??[];
      if(!a.some(x=>x.prayerId===id && x.lineIndex===row.lineIndex))a.push(row);
      lineMap.set(key,a);
    }
  }
  return {lineMap,statistics:{prayers:Object.keys(prayers).length,
    withLatin,withTrilingual,indexedLines:indexed,distinctLatinLines:lineMap.size}};
}
const SCRIPTURE_HOLDS=Object.freeze([
 {rite:"HOLY_THURSDAY_POST",pathPrefix:"stripping.psalm21Pian.",
  sourceName:"Pian Psalter Psalm 21",sourceEdition:"PIAN_PSL",editionIssue:"NON_VULGATE_PSALTER",
  comparison:"Pian Latin is not interchangeable with Douay-Rheims/Vulgate Psalm 21; independently align all verses/edition numbering"},
 {rite:"ROGATIONS_PROCESSION",pathPrefix:"postLitany.psalm69.",
  sourceName:"Psalm 69 in the procession",sourceEdition:"1962_RITE",editionIssue:"PSALM_NUMBERING_RECENSION_UNCERTAIN",
  comparison:"Reconcile Vulgate versus Hebrew numbering, text recension, eight procession source groups and Gloria"},
 {rite:"CANDLEMAS",pathPrefix:"distribution.verses.",
  sourceName:"Nunc dimittis",sourceEdition:"1962_RITE",editionIssue:"LUKE_2_29_32_PLUS_DOXOLOGY",
  comparison:"Identify Luke 2:29-32 boundaries; doxology is not part of the Gospel citation"},
 {rite:"ASH",pathPrefix:"opening.psalm",
  sourceName:"Psalm 68 incipit",sourceEdition:"1962_RITE",editionIssue:"VULGATE_HEBREW_NUMBERING",
  comparison:"Psalm 68/69 heading and chant selection require verse-level normalization; this is not full Psalm text"},
 {rite:"ASPERGES",pathPrefix:"formulas.ORDINARY.psalm",
  sourceName:"Miserere, Psalm 50",sourceEdition:"1962_RITE",editionIssue:"VERSE_FRAGMENT",
  comparison:"The psalm incipit is not an entire chapter or source-verified alternate translation"},
]);
export function buildSecondaryReconciliation(){
  const sourceAudit=read(SOURCE_AUDIT);
  const first=buildReconciliation();
  const {lineMap,statistics}=prayerLineIndex();
  const matches=[];
  const unresolved=[];
  const scriptureCandidates=[];
  for(const row of first.unlinkedSourceLeaves){
    const latin=extractLatin(row.rite==="ASPERGES"?
      "data/presentation/reader-asperges.v1.json":
      first.scope[row.rite].source,row.path);
    const key=normalizeLatin(latin);
    const found=(lineMap.get(key)??[]).map(x=>({...x}));
    if(found.length){
      matches.push({rite:row.rite,source:first.scope[row.rite].source,path:row.path,
        sources:found,decision:"MATCHED_PRAY_LATIN_UNCERTIFIED_REUSE_PROPOSAL"});
    }else unresolved.push({rite:row.rite,source:first.scope[row.rite].source,path:row.path,
      decision:"NO_EXACT_ORDINARY_OR_PRAY_MATCH_NOT_GENUINE_TRANSLATION_GAP"});
    const candidates=SCRIPTURE_HOLDS.filter(h=>h.rite===row.rite &&
      (row.path===h.pathPrefix || row.path.startsWith(h.pathPrefix)));
    for(const h of candidates){
      scriptureCandidates.push({rite:row.rite,path:row.path,
        scriptureFamily:"data/scripture/witness/{dr-challoner,crampon-1923,cpdv-2009}/",
        scriptureStatus:"UNCOLLATED_SOURCE_WITNESS",sourceName:h.sourceName,
        issue:h.editionIssue,comparison:h.comparison,
        decision:"SCRIPTURE_REFERENCE_CANDIDATE_NO_VERSE_ALIGNMENT_OR_APPROVAL"});
    }
  }
  const breakdown={};
  for(const [rite,stats] of Object.entries(first.scope)){
    const prior=stats.unmatchedLeaves;
    const matchesN=matches.filter(x=>x.rite===rite).length;
    breakdown[rite]={firstPassUnmatched:prior,exactPRAYLineMatches:matchesN,
      withoutExactOwnerMatch:prior-matchesN,
      scriptureReviewCandidates:scriptureCandidates.filter(x=>x.rite===rite).length};
  }
  return {
    schema:"ao-annexed-second-pass-existing-owner-v1",
    status:"READ_ONLY_CANDIDATE_INDEX_NO_TEXT_COPY_NO_TRANSLATION",
    sourceOfTruth:first.sourceOwners,
    secondaryOwners:{
      prayerCorpus:PRAY_PATH,
      prayerAudit:SOURCE_AUDIT,
      historicalLitany:LITANY_PATH,
      scriptureWitnessPolicy:SCRIPTURE_README,
    },
    sourceLimitations:{
      prayers:"48 trilingual or partly trilingual prayer entries; the prayer inventory reports 0 fully source-certified prayers as of 2026-10-09. A Latin line match does NOT confer 1962-liturgical approval.",
      litany:"The existing Litany reader points to different 1883 English and 1862 French historical witnesses, not collated to the 1962 Litany and not the complete post-Litany Psalm/orations.",
      scripture:"DR-Challoner EN, Crampon FR, CPDV EN restored witness texts are UNCOLLATED_SOURCE_WITNESS and have no corresponding certified Latin in these packs. Scripture references are candidates, not Latin-source or verse-aligned matches.",
      variant:"Rogation Mass Proper has its own published trilingual owner; it must not be conflated with 112 procession invocations.",
      release:"No prayer or Scripture text is promoted by this exact-match inventory. First resolve effective canonical wording, role, rites and rights.",
    },
    prayerCorpus:statistics,
    existingInventoryCounts:sourceAudit.counts,
    summary:{firstPassScanned:first.summary.sourceLeavesScanned,
      firstPassOrdinaryMatches:first.summary.ordinaryMatchLeaves,
      firstPassWithoutOrdinaryMatch:first.summary.noExactOrdinaryMatchLeaves,
      exactPrayerLineMatches:matches.length,
      afterOrdinaryAndPrayerUnmatched:unresolved.length,
      scriptureCandidates:scriptureCandidates.length,
      confirmedMissingTranslations:0,
      missingTranslationStatus:"NOT_YET_ASSESSED",
    },
    breakdown,prayerLineMatches:matches,scriptureCandidates,
    stillNoExactOwnerMatch:unresolved,
    nextReview:"COLLATE_CONFIRMED_EDITION_AND_FULL_SEGMENTS_BEFORE_ANY_VERNACULAR_CHANGE",
  };
}
const invoked=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
  const data=buildSecondaryReconciliation();
  if(process.argv.includes("--write")){
    const output=resolve(root,"artifacts/annexed-second-pass-existing-owners.json");
    mkdirSync(dirname(output),{recursive:true});
    writeFileSync(output,JSON.stringify(data,null,2)+"\n");
  }
  console.log(JSON.stringify({status:data.status,prayerCorpus:data.prayerCorpus,
    summary:data.summary,breakdown:data.breakdown,
    firstMatches:data.prayerLineMatches.slice(0,12)},null,2));
}
