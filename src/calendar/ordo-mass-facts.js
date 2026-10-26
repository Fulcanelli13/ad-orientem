// Read-only general Roman (1962) Ordo projection for the existing Calendar.
// This is an evidence-adapter, not an independent celebration picker or rubric engine.
import {inspect1962PrefaceSelection} from "../mass/1962-preface-decision.js";
import {calendarMassColour} from "./colour-projection.js";
import {observedCommemorationLabels} from "./observed-commemoration-labels.js";

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
function certifiedOrdinaryFlags(proper,principalId){
  const d=proper?.ordoRubricDecision;
  if(d?.status!=="CERTIFIED"||d?.source!=="1962_PROPER_RESOLVER"||
     d?.principalCelebrationId!==principalId||
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
  const selectedPreface=proper.preface;
  const decision=inspect1962PrefaceSelection({
    principalCelebrationId:principalId,selectedPreface,
    requestedCelebrationId:"mass_of_day"
  });
  const heading=str(selectedPreface?.lat??selectedPreface?.la).split(/\r?\n/)[0]?.trim();
  const preface=decision.status==="MATCH"&&heading?
    Object.freeze({status:"MATCH",heading,source:"1962_PREFACE_NARROW_OWNER_REGISTER"}):
    decision.status==="CONTRADICTION"?
      Object.freeze({status:"SOURCE_CONFLICT",heading:null}):
      decision.status==="MISSING_PREFACE"?
        Object.freeze({status:"MISSING",heading:null}):noStatus;
  const flags=certifiedOrdinaryFlags(proper,principalId);
  const lang=String(language).toLowerCase().startsWith("fr")?"fr":"en";
  const commemorations=observedCommemorationLabels(resolution,{language:lang})
    .map(c=>c.name);
  return Object.freeze({
    status:"SOURCE_PROPER",reason:null,scope:"GENERAL_ROMAN_1962",
    date,principalId,sourcePath:path,
    // No unreviewed inherited Sunday or alternative labels.
    introitIncipit:latinIntroitIncipit(proper.introit),
    preface,gloria:flags.gloria,credo:flags.credo,
    massColour:str(calendarMassColour(resolution))||null,
    commemorations:Object.freeze(commemorations),
    commemorationsApplyToChosenForm:null,
    alternateMasses:Object.freeze([]),
    noAlternativeMassPermissionInferred:true,
  });
}
