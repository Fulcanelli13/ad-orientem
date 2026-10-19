#!/usr/bin/env node
/**
 * Every Rogation Litany source invocation is classified and assigned a stable
 * index, not recopied or translated. Roman General Rubrics 82-90 take
 * precedence over any older repetition instruction in Liber Usualis chant.
 * No runtime actions/EN/FR source changes, all comparisons advisory.
 */
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {buildReconciliation,normalizeLatin} from "./reconcile-annexed-text-owners.mjs";
import {buildSecondaryReconciliation} from "./reconcile-annexed-secondary-owners.mjs";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const read=path=>JSON.parse(readFileSync(resolve(root,path),"utf8"));
export const ROGATION_SOURCE="data/presentation/reader-rogations.v1.json";
export const GOVERNING_RUBRIC="1962 Rubricae generales 82-90";
export const CHANT_BOOK_WITNESS="https://icksp.org.uk/newbrighton/wp-content/uploads/sites/2/2020/04/Rogations.pdf";
export const RUBRIC_SOURCE="https://la.wikisource.org/wiki/Missale_Romanum_1962";
const GROUPS=Object.freeze([
 {start:0,end:62,group:"SAINT_INVOCATIONS",clock:"PROCESSION_AT_SANCTA_MARIA",
  section:"Invocation of Our Lady, angels and saints"},
 {start:63,end:64,group:"PROPITIUS_ESTO",clock:"LITANY_CONTINUES",
  section:"Two petitions for mercy"},
 {start:65,end:85,group:"LIBERA_NOS",clock:"LITANY_CONTINUES",
  section:"Deliverance and mysteries of Christ"},
 {start:86,end:103,group:"TE_ROGAMUS",clock:"LITANY_CONTINUES",
  section:"Supplications for Church and faithful"},
 {start:104,end:106,group:"AGNUS_DEI",clock:"LITANY_CONTINUES",
  section:"Three Lamb of God petitions"},
 {start:107,end:111,group:"CONCLUSION",clock:"LITANY_CONTINUES",
  section:"Christ hear us and threefold Kyrie"},
]);
function family(index){
  if(index<=10)return "BVM_ANGELS_PATRIARCHS";
  if(index<=29)return "APOSTLES_EVANGELISTS_AND_DISCIPLES";
  if(index<=37)return "MARTYRS";
  if(index<=46)return "PONTIFFS_CONFESSORS_DOCTORS";
  if(index<=53)return "PRIESTS_MONKS_EREMITES";
  return "HOLY_WOMEN_AND_ALL_SAINTS";
}
function getGroup(index){
  const match=GROUPS.filter(x=>index>=x.start&&index<=x.end);
  if(match.length!==1)throw new Error("ROGATION_GROUP_BOUNDARY_UNRESOLVED:"+index);
  return match[0];
}
function sourceReferences(prior,index){
  const path="processionLitany."+index;
  const o=prior.ordinaryReuseCandidates.find(x=>
    x.rite==="ROGATIONS_PROCESSION"&&x.path===path);
  return o?[...new Set(o.cues.map(c=>c.id))]:[];
}
function prayReferences(prior,index){
  const path="processionLitany."+index;
  const p=prior.prayerLineMatches.find(x=>
    x.rite==="ROGATIONS_PROCESSION"&&x.path===path);
  return p?[...new Set(p.sources.map(s=>s.prayerId))]:[];
}
function detectMarker(latin){
  const n=normalizeLatin(latin);
  if(n.endsWith("ora pro nobis"))return "ORA_PRO_NOBIS";
  if(n.endsWith("orate pro nobis"))return "ORATE_PRO_NOBIS";
  if(n.endsWith("intercedite pro nobis"))return "INTERCEDITE_PRO_NOBIS";
  if(n.endsWith("libera nos domine"))return "LIBERA_NOS_DOMINE";
  if(n.endsWith("te rogamus audi nos"))return "TE_ROGAMUS_AUDI_NOS";
  if(n.endsWith("miserere nobis"))return "MISERERE_NOBIS";
  if(n.endsWith("parce nobis domine"))return "PARCE_NOBIS_DOMINE";
  if(n.endsWith("exaudi nos domine"))return "EXAUDI_NOS_DOMINE";
  return "EXACT_TEXT_UNCLASSIFIED";
}
/**
 * Decomposing a litany invocation into a repeated RESPONSE FORMULA and a
 * unique petition/saint is *review metadata* only. No template is allowed to
 * synthesize a sentence, alter case/agreement, or substitute a translation.
 */
const RESPONSE_FORMULA_OWNER_IDS=Object.freeze({
 ORA_PRO_NOBIS:"ROG-LIT-FORMULA-ORA-PRO-NOBIS",
 ORATE_PRO_NOBIS:"ROG-LIT-FORMULA-ORATE-PRO-NOBIS",
 INTERCEDITE_PRO_NOBIS:"ROG-LIT-FORMULA-INTERCEDITE-PRO-NOBIS",
 LIBERA_NOS_DOMINE:"ROG-LIT-FORMULA-LIBERA-NOS-DOMINE",
 TE_ROGAMUS_AUDI_NOS:"ROG-LIT-FORMULA-TE-ROGAMUS-AUDI-NOS",
 MISERERE_NOBIS:"ROG-LIT-FORMULA-MISERERE-NOBIS",
 PARCE_NOBIS_DOMINE:"ROG-LIT-FORMULA-PARCE-NOBIS-DOMINE",
 EXAUDI_NOS_DOMINE:"ROG-LIT-FORMULA-EXAUDI-NOS-DOMINE",
});
function reviewQueue(row){
 if(row.ordinaryCueIds.length)return "EXACT_ORDINARY_WORDING_COLLATION";
 if(row.prayPrayerIds.length)return "EXACT_PRAY_WORDING_AND_EDITION_COLLATION";
 if(row.group==="SAINT_INVOCATIONS"||row.group==="PROPITIUS_ESTO"||
    row.group==="LIBERA_NOS"||row.group==="TE_ROGAMUS"||
    row.group==="AGNUS_DEI"||row.group==="CONCLUSION")
   return row.responseFormula==="EXACT_TEXT_UNCLASSIFIED"?
     "LITANY_UNTEMPLATED_INVOCATION_1962_WITNESS":
     "LITANY_FORMULA_PLUS_UNIQUE_INVOCATION_WITNESS";
 if(row.family==="PSALM_69"||row.family==="EXSURGE_OPENING")
   return "SCRIPTURE_PSALTER_EDITION_AND_VERSE_COLLATION";
 if(row.family==="TEN_CONCLUDING_COLLECTS")
   return "TEN_RITE_SPECIFIC_COLLECTS_PRINT_COLLATION";
 return "RITE_DIALOGUE_SUFFRAGE_AND_RESPONSE_PRINT_COLLATION";
}
function tally(rows,key){
 return Object.fromEntries([...new Set(rows.map(x=>x[key]))].sort()
   .map(v=>[v,rows.filter(x=>x[key]===v).length]));
}
export function buildRogationsLitanyOwnershipMatrix(){
  const data=read(ROGATION_SOURCE);
  const base=buildReconciliation();
  const second=buildSecondaryReconciliation();
  const litany=data.processionLitany??[];
  if(litany.length!==112||!litany[0].startsWith("Sancta Maria,")||
    !litany[62].startsWith("Omnes Sancti") ||
    !litany[63].startsWith("Propitius esto")||
    !litany[65].startsWith("Ab omni malo")||
    !litany[86].startsWith("Peccatores")||
    !litany[103].startsWith("Fili Dei")||
    !litany[104].startsWith("Agnus Dei")||
    !litany[107].startsWith("Christe, audi")||
    !litany[111].startsWith("Kyrie"))
    throw new Error("ROGATION_112_INVOCATION_BOUNDARY_CHANGED_RECOLLATE_1962");
  const items=litany.map((latin,index)=>{
    const group=getGroup(index);
    const cueIds=sourceReferences(base,index);
    const prayIds=prayReferences(second,index);
    return {
      sourceId:"ROG-PRC-010",rowId:"ROG-R03-"+(index+1),
      sourceLocator:ROGATION_SOURCE+"#processionLitany."+index,
      index,sequence:index+1,group:group.group,
      family:group.group==="SAINT_INVOCATIONS"?family(index):null,
      responseFormula:detectMarker(latin),
      responseFormulaOwnerId:RESPONSE_FORMULA_OWNER_IDS[detectMarker(latin)]??null,
      uniqueInvocationSourceOwner:ROGATION_SOURCE+"#processionLitany."+index,
      formulaReuseStatus:"REVIEW_ONLY_NO_VERNACULAR_COMPOSITION",
      ordinaryCueIds:cueIds,prayPrayerIds:prayIds,
      draftTranslationPromotion:"BLOCKED_PENDING_OWNERSHIP_REVIEW",
      sourceStatus:"LATIN_DONOR_SOURCE_ONLY_NOT_FINAL_1962_PRINT_COLLATION",
      repetition:1,
      guide:group.section,
      idDisambiguation:index===14?"SANCTE_JACOBE_FIRST_APOSTOLIC_POSITION":
        index===17?"SANCTE_JACOBE_SECOND_APOSTOLIC_POSITION":null,
      ownerDecision:cueIds.length?"CANDIDATE_CANONICAL_ORDINARY_WORDING":
        prayIds.length?"CANDIDATE_PRAY_WORDING_CHECK_EDITION":
        "UNRESOLVED_OTHER_SOURCE_FAMILIES_NOT_MISSING_TRANSLATION",
      reviewQueue:reviewQueue({group:group.group,responseFormula:detectMarker(latin),
        ordinaryCueIds:cueIds,prayPrayerIds:prayIds}),
    };
  });
  const count=label=>items.filter(x=>x.group===label).length;
  const summary=Object.fromEntries(GROUPS.map(g=>[g.group,count(g.group)]));
  const collisions=items.filter(x=>x.idDisambiguation);
  if(collisions.length!==2||normalizeLatin(litany[14])!==normalizeLatin(litany[17]))
    throw new Error("ROGATION_IDENTICAL_SAINT_JAMES_TWICE_DISTINCT_POSITION_LOCK");
  // In the *1962* rite the processional petitions are *not doubled*,
  // notwithstanding the supplied Liber's older English chant rubric.
  // The preceding singers' opening Kyrie/response belongs to another
  // ceremonial portion and cannot be expanded into duplicate 112 items.
  // Every additional Latin source leaf is indexed by the existing native
  // paragraph ID. The Litany is not the Psalm, suffrages or ten collects.
  // Index only. Text remains exclusively with the donor payload.
  const extra=[];
  const keep=(rowId,sourcePath,sourceRecordId,family)=>{
    const canonical=base.ordinaryReuseCandidates.find(x=>
      x.rite==="ROGATIONS_PROCESSION"&&x.path===sourcePath);
    const prayer=second.prayerLineMatches.find(x=>
      x.rite==="ROGATIONS_PROCESSION"&&x.path===sourcePath);
    const ordinaryCueIds=canonical?[...new Set(canonical.cues.map(c=>c.id))]:[];
    const prayPrayerIds=prayer?[...new Set(prayer.sources.map(s=>s.prayerId))]:[];
    extra.push({
      rowId,sourceRecordId,sourceLocator:ROGATION_SOURCE+"#"+sourcePath,
      family,ordinaryCueIds,prayPrayerIds,
      decision:ordinaryCueIds.length?"CANDIDATE_CANONICAL_ORDINARY_WORDING":
        prayPrayerIds.length?"CANDIDATE_PRAY_WORDING_CHECK_EDITION":
        "UNRESOLVED_OTHER_SOURCE_FAMILIES_NOT_MISSING_TRANSLATION",
      draftTranslationPromotion:"BLOCKED_PENDING_OWNERSHIP_REVIEW",
      reviewQueue:reviewQueue({family,ordinaryCueIds,prayPrayerIds}),
    });
  };
  const index=(prefix,length,pathPrefix,sourceRecordId,family,selector=i=>i)=>
    Array.from({length},(_,i)=>keep(prefix+(i+1),pathPrefix+selector(i),sourceRecordId,family));
  keep("ROG-R01-A1","opening.antiphon","ROG-LIT-010","EXSURGE_OPENING");
  keep("ROG-R01-P","opening.psalm","ROG-LIT-010","EXSURGE_OPENING");
  keep("ROG-R01-G","opening.gloria","ROG-LIT-010","EXSURGE_OPENING");
  keep("ROG-R01-A2","opening.repeat","ROG-LIT-010","EXSURGE_OPENING");
  index("ROG-R02-",18,"litanyBeforeProcession.", "ROG-LIT-020","PRE_PROCESSION_DIALOGUE",i=>i+".1");
  keep("ROG-R04-PN","postLitany.pater","ROG-PS-010","POST_LITANY_PATERNOSTER");
  keep("ROG-R04-V","postLitany.versicle","ROG-PS-010","POST_LITANY_PATERNOSTER");
  keep("ROG-R04-R","postLitany.response","ROG-PS-010","POST_LITANY_PATERNOSTER");
  index("ROG-R04-PS",8,"postLitany.psalm69.","ROG-PS-010","PSALM_69");
  index("ROG-R04-S",24,"postLitany.suffrages.","ROG-PS-010","POST_LITANY_SUFFRAGES",i=>i+".1");
  keep("ROG-R05-OR","postLitany.oremus","ROG-END-010","COLLECT_INVITATION");
  index("ROG-R05-O",10,"postLitany.orations.","ROG-END-010","TEN_CONCLUDING_COLLECTS");
  index("ROG-R05-F",7,"postLitany.final.","ROG-END-010","FINAL_DIALOGUE",i=>i+".1");
  if(extra.length!==75)throw Error("ROGATION_ADDITIONAL_75_SOURCE_ROWS_CHANGED");
  if(new Set([...items.map(x=>x.rowId),...extra.map(x=>x.rowId)]).size!==187)
    throw Error("ROGATION_187_UNIQUE_READER_IDS_CHANGED");
  const supplementalSummary=Object.fromEntries(
    [...new Set(extra.map(x=>x.family))].map(kind=>[
      kind,extra.filter(x=>x.family===kind).length]));
  const otherRows={
    opening:Object.keys(data.opening??{}).length,
    beforeProcession:data.litanyBeforeProcession?.length??0,
    psalm69:data.postLitany?.psalm69?.length??0,
    suffrages:data.postLitany?.suffrages?.length??0,
    collectInvitation:typeof data.postLitany?.oremus==="string"?1:0,
    orations:data.postLitany?.orations?.length??0,
    final:data.postLitany?.final?.length??0,
  };
  return {
    schema:"ao-rogation-1962-litany-112-owner-map-v1",
    status:"INDEXED_LATIN_SOURCE_NO_VERNACULAR_PROMOTIONS",
    ritualAuthority:{
      primary:GOVERNING_RUBRIC,sourcePage:"Rubricae generales 82,83,85,86,89,90",
      latinWitness:RUBRIC_SOURCE,
      norm:"Litaniae Sanctorum (quae tamen non duplicantur) cum suis precibus",
      petitionsDuplicated:false,processionRequired:false,
      massFollowsActiveRiteOnly:true,
    },
    chantBook:{
      source:CHANT_BOOK_WITNESS,
      section:"The Greater and Lesser Litanies, pp. 835-840",
      processionalStart:"All rise at Sancta Maria",
      historicallyPrintedDirection:"Each invocation is doubled, unless the Procession cannot take place.",
      conflict:"OLDER_CHANT_BOOK_DIRECTION_OVERRIDDEN_BY_1962_GENERAL_RUBRICS",
      witnessUse:"CHANT_ORDER_GREGORIAN_SOURCE_ONLY_NOT_PROCESSION_REPETITION_AUTHORITY",
    },
    keyCautions:[
      "Never treat identical 'Sancte Jacobe' at indices 14 and 17 as a redundant invocation: two Apostolic positions are distinguished by sequence.",
      "The Litany of Loreto and other PRAY litanies are different prayers; sharing Sancta Maria or Agnus Dei is an owner REUSE CANDIDATE only.",
      "Mass Proper 'Exaudivit de templo' is distinct from the procession Litany and already has a reviewed trilingual source owner.",
      "Historical 1883 English and 1862 French Litany witnesses cannot be promoted to the 1962 procession automatically.",
      "No duplicate invocation or synthetic Schola track is added because an older chant book indicates double invocations.",
    ],
    sections:GROUPS.map(({start,end,group,section})=>({
      group,sourceFirstIndex:start,sourceLastIndex:end,
      count:end-start+1,description:section,
    })),
    summary:{
      invocationCount:items.length,sections:summary,
      ordinaryCueCandidateOccurrences:items.filter(x=>x.ordinaryCueIds.length).length,
      prayerCorpusCandidateOccurrences:items.filter(x=>x.prayPrayerIds.length).length,
      withAnyKnownExactOwner:items.filter(x=>x.ordinaryCueIds.length||x.prayPrayerIds.length).length,
      withNeitherOfTwoOwners:items.filter(x=>!x.ordinaryCueIds.length&&!x.prayPrayerIds.length).length,
      sameLiteralButDistinctSaintPositions:collisions.map(x=>x.rowId),
      additionalRogationPrayerRows:otherRows,
      supplementalBreakdown:supplementalSummary,
      completeSourceRows:items.length+extra.length,
      fullSourceOrdinaryMatches:[...items,...extra].filter(x=>x.ordinaryCueIds.length).length,
      fullSourcePrayMatchesWithoutOrdinary:[...items,...extra].filter(x=>
        !x.ordinaryCueIds.length&&x.prayPrayerIds.length).length,
      fullSourceUnlinked:[...items,...extra].filter(x=>
        !x.ordinaryCueIds.length&&!x.prayPrayerIds.length).length,
      reviewQueues:tally([...items,...extra],"reviewQueue"),
      unlinkedReviewQueues:tally([...items,...extra].filter(x=>
        !x.ordinaryCueIds.length&&!x.prayPrayerIds.length),"reviewQueue"),
      invocationResponseFormulaCounts:tally(items,"responseFormula"),
      linkedResponseOwnerCounts:tally(items.filter(x=>
        x.responseFormulaOwnerId),"responseFormulaOwnerId"),
      editorialTranslationGaps:null,
      unresolvedReason:"Exact-match corpus ownership is not an exhaustive source comparison.",
    },
    items,supplementalSourceRows:extra,
  };
}
const called=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(called){
 const result=buildRogationsLitanyOwnershipMatrix();
 if(process.argv.includes("--write")){
   const path=resolve(root,"artifacts/rogations-litany-112-source-ownership.json");
   mkdirSync(dirname(path),{recursive:true});
   writeFileSync(path,JSON.stringify(result,null,2)+"\n");
 }
 console.log(JSON.stringify({status:result.status,summary:result.summary,
   sections:result.sections,witnessConflict:result.chantBook.conflict},null,2));
}
