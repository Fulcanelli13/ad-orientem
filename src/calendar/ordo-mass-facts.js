// Read-only general Roman (1962) Ordo projection for the existing Calendar.
// This is an evidence-adapter, not an independent celebration picker or rubric engine.
import {review1962PrefaceForCalendarDay} from "./ordo-1962-preface-review.js";
import {calendarMassColour} from "./colour-projection.js";
import {observedCommemorationLabels} from "./observed-commemoration-labels.js";
import {review1962OrdinaryForCalendarDay} from "./ordo-1962-ordinary-rule-review.js";

export const ORDO_MASS_FACTS_VERSION="ao-calendar-ordo-mass-facts-v1";
const str=value=>typeof value==="string"?value.trim():"";
const nonMass=id=>/^tempora:Quad6-5r:/i.test(str(id));
const empty=(status,reason,base={})=>Object.freeze({
  status,reason,scope:"GENERAL_ROMAN_1962",principalId:null,
  sourcePath:null,introitIncipit:null,preface:Object.freeze({status:"WITHHELD",heading:null}),
  gloria:null,credo:null,commemorations:Object.freeze([]),
  alternateMasses:Object.freeze([]),...base
});
const noStatus=Object.freeze({status:"WITHHELD",heading:null});

// Short quotation from the Latin source, not a generated/intuited formulary title.
export function latinIntroitIncipit(introit){
  const latin=str(introit?.lat??introit?.la);
  if(!latin)return null;
  const lines=latin.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  for(const line of lines){
    let words=line
      .replace(/^(?:introitus|introit|intro[iï]t)\s*[:.·]?\s*/iu,"")
      .replace(/^(?:[℣℟]\.|[VR]\.)\s*/iu,"")
      // Roman Missal transcriptions often print a Psalm/chapter citation
      // *before* the Introit proper. This is provenance, not the incipit.
      .replace(/^(?:[1-3]\s*)?[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ. ]{0,18}\s+\d{1,3}[:.,]\d{1,3}(?:[-–]\d{1,3})?\s*[.:]?\s*/u,"")
      .trim();
    if(!words||/^[\\$@]/.test(words)||!/(?:\p{L}[^\p{L}]+){0,}\p{L}/u.test(words))continue;
    if((words.match(/\p{L}+/gu)||[]).length<2)continue;
    // Do not treat headings such as 'Psalm 129' as Latin Introit texts.
    if(/^(?:ps(?:almus|alm|al)?\.?|psalm)\s+\d+$/iu.test(words))continue;
    const snippet=words.split(/\s+/u).slice(0,5).join(" ");
    return snippet.length>75?snippet.slice(0,75).trimEnd():snippet;
  }
  return null;
}

// A future typed rubric decision may be displayed only when produced by the
// owner of the 1962 Proper and scoped to the identical principal Mass.
function certifiedOrdinaryFlags(proper,principalId,date){
  const d=proper?.ordoRubricDecision;
  if(d?.status!=="CERTIFIED"||d?.source!=="1962_PROPER_RESOLVER"||
     d?.principalCelebrationId!==principalId||d?.date!==date||
     d?.calendarScope!=="GENERAL_ROMAN_1962"||
     !str(d?.evidenceUrl).startsWith("https://"))return {gloria:null,credo:null};
  return {gloria:typeof d.gloria==="boolean"?d.gloria:null,
    credo:typeof d.credo==="boolean"?d.credo:null};
}

export function calendarOrdoMassFacts(resolution,{language="en"}={}){
  const date=str(resolution?.date),main=resolution?.day?.main;
  if(!date||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!main||
     resolution?.status!=="ready")
    return empty("UNAVAILABLE","CALENDAR_DAY_NOT_READY");
  const principalId=str(main.id);
  if(!principalId)return empty("UNAVAILABLE","PRINCIPAL_SOURCE_ID_MISSING");
  if(nonMass(principalId))
    return empty("SPECIAL_LITURGY","GOOD_FRIDAY_NOT_MASS",{principalId});
  const pr=resolution?.proper;
  const proper=pr?.status==="ready"?pr.data:null;
  if(!proper||typeof proper!=="object")
    return empty("PROPER_UNAVAILABLE","PROPER_NOT_READY",{principalId});
  const path=str(proper.sourcePath??pr.sourcePath);
  if(!path)return empty("PROPER_UNAVAILABLE","PROPER_SOURCE_PATH_MISSING",{principalId});
  // A reusable proper or its text sections are not evidence that another
  // votive or religious formulary is permitted on this civil date.
  // The displayed Preface is screened against the principal 1962 Mass and
  // the general 1960 rubrics, not merely against a plausible Latin heading.
  const review=review1962PrefaceForCalendarDay(resolution);
  const preface=review.status==="RULE_TEXT_AGREE"?
    Object.freeze({status:"MATCH",heading:review.heading,
      source:"1960_ROMAN_MISSAL_PREFACE_REVIEW",clause:review.clause,
      sourceUrl:review.sourceUrl,autoPublish:false}):
    review.status==="SOURCE_CONFLICT"?
      Object.freeze({status:"SOURCE_CONFLICT",heading:null,
        expected:review.expected,actual:review.actual,
        clause:review.clause,sourceUrl:review.sourceUrl,autoPublish:false}):
      Object.freeze({status:review.status==="UNCLASSIFIED_TEXT"?"UNVERIFIED":"WITHHELD",
        heading:null,autoPublish:false});
  const selectedFlags=certifiedOrdinaryFlags(proper,principalId,date);
  const ruleReview=review1962OrdinaryForCalendarDay(resolution);
  // An explicit Proper-owner certification outranks a general summary, but
  // an authentic universal *contradiction* (e.g. violet + Gloria) blocks
  // publishing either flag until source owners reconcile the evidence.
  const choose=(rubric,selected)=>{
    const rule=ruleReview[rubric];
    if(rule?.status==="RULE_SUPPORTED"&&typeof selected==="boolean"&&
       selected!==rule.value)return Object.freeze({value:null,status:"SOURCE_CONFLICT",
         sourceUrl:rule.sourceUrl,clause:rule.clause});
    if(typeof selected==="boolean")return Object.freeze({value:selected,status:"PROPER_CERTIFIED"});
    if(rule?.status==="RULE_SUPPORTED")return Object.freeze({
      value:rule.value,status:"GENERAL_RULE_ATTESTED",sourceUrl:rule.sourceUrl,clause:rule.clause
    });
    return Object.freeze({value:null,status:"WITHHELD"});
  };
  const gloria=choose("gloria",selectedFlags.gloria);
  const credo=choose("credo",selectedFlags.credo);
  const lang=String(language).toLowerCase().startsWith("fr")?"fr":"en";
  const commemorations=observedCommemorationLabels(resolution,{language:lang})
    .map(c=>c.name);
  return Object.freeze({
    status:"SOURCE_PROPER",reason:null,scope:"GENERAL_ROMAN_1962",
    date,principalId,sourcePath:path,
    // No unreviewed inherited Sunday or alternative labels.
    introitIncipit:latinIntroitIncipit(proper.introit),
    preface,gloria:gloria.value,credo:credo.value,
    ordinaryRubricEvidence:Object.freeze({gloria,credo}),
    massColour:str(calendarMassColour(resolution))||null,
    commemorations:Object.freeze(commemorations),
    commemorationsApplyToChosenForm:null,
    alternateMasses:Object.freeze([]),
    noAlternativeMassPermissionInferred:true,
  });
}
