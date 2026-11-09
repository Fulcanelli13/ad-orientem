/**
 * Private source-text review session for the two finite Advent I pilots.
 * Deliberately NOT registered in AO_MODULES, released as an Hour, or imported
 * into the production Prayer reader. This module requires real pinned leaves.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";
import {createComplinePinnedReader,assembleDatedComplinePilot,
 createLatinComplinePinnedReader,assembleLatinDatedComplinePilot,
 createChristmas2026PrivateLatinPinnedReader,
 assembleChristmas2026PrivateLatinComplinePilot,
 createDec28Jan03PrivateLatinPinnedReader,
 assembleDec28Jan03PrivateLatinComplinePilot,
 createJan04_10PrivateLatinPinnedReader,
 assembleJan04_10PrivateLatinComplinePilot,
 createJan11_17PrivateLatinPinnedReader,
 assembleJan11_17PrivateLatinComplinePilot}
 from "./saturday-compline-2026-pilot.js";
import {createAdventFirstVespersBoundedPinnedReader} from "./advent-first-vespers-bounded-preview-reader.js";
import {assembleAdventI2026PrivatePreviewSession} from "./advent-first-vespers-preview-session.js";
import {buildAdventI2026ReadingFocus} from "./advent-first-vespers-reading-focus.js";

export const PRIVATE_OFFICE_REVIEW_SCHEMA="ao.office.pinned-private-trilingual-reading-review.v1";
const LANGUAGES=Object.freeze(["la","en","fr"]);
const COMPLINE_DATES=new Set([
 "2026-11-28","2026-11-29","2026-11-30","2026-12-01",
 "2026-12-02","2026-12-03","2026-12-04","2026-12-05",
 "2026-12-06","2026-12-07","2026-12-08","2026-12-09",
 "2026-12-10","2026-12-11","2026-12-12","2026-12-13",
 "2026-12-14","2026-12-15","2026-12-16","2026-12-17",
 "2026-12-18","2026-12-19","2026-12-20"
]);
function hold(reason){return Object.freeze({
 schema:PRIVATE_OFFICE_REVIEW_SCHEMA,status:"WITHHELD",reason,
 civilDate:null,officeDate:null,hour:null,events:Object.freeze([]),frames:Object.freeze([]),
 sourceRevision:PIN,reviewOnly:true,readingPublished:false,
 rightsApproved:false,liturgicallyCertified:false,publishable:false,published:false
});}
function textsValid(frames,activeLanguages=LANGUAGES){
 return Array.isArray(frames)&&frames.length>40&&frames.length<300&&
 frames.every(f=>f&&typeof f.kind==="string"&&
  (typeof f.sourceId==="string"&&f.sourceId.length>0||
    f.kind==="RESEARCH_CALENDAR_NOTICE"&&f.sourceId===null)&&
  activeLanguages.every(l=>Array.isArray(f.texts?.[l])&&f.texts[l].length>0&&
   f.texts[l].every(t=>typeof t==="string"&&t.length>0&&t.length<20000)));
}
export function projectPrivateOfficeReview({
 hour,date,pilot,focus,languageMode="trilingual",
 privateChristmasResearch=false,privateYearBoundaryResearch=false,
 privateEpiphanyResearch=false,privatePostEpiphanyResearch=false
}={}){
 if(!["trilingual","latin"].includes(languageMode))return hold("REVIEW_LANGUAGE_MODE_NOT_SUPPORTED");
 const activeLanguages=languageMode==="latin"?["la"]:LANGUAGES;
 if(!["COMPLINE","VESPERS"].includes(hour)||typeof date!=="string")
  return hold("HOUR_OR_DATE_OUTSIDE_PRIVATE_REVIEW");
 if(hour==="COMPLINE"){
  const christmasAllowed=privateChristmasResearch&&languageMode==="latin"&&
   date>="2026-12-21"&&date<="2026-12-27";
  const yearBoundaryAllowed=privateYearBoundaryResearch&&languageMode==="latin"&&
   (date>="2026-12-28"&&date<="2026-12-31"||
    date>="2027-01-01"&&date<="2027-01-03");
  const epiphanyAllowed=privateEpiphanyResearch&&languageMode==="latin"&&
   date>="2027-01-04"&&date<="2027-01-10";
  const postEpiphanyAllowed=privatePostEpiphanyResearch&&languageMode==="latin"&&
   date>="2027-01-11"&&date<="2027-01-17";
  if((!COMPLINE_DATES.has(date)&&!christmasAllowed&&!yearBoundaryAllowed&&
      !epiphanyAllowed&&!postEpiphanyAllowed)||!pilot||
   !/^SOURCE_FIRST_(?:SATURDAY|FERIAL_TUESDAY|APPOINTED)_COMPLINE_RESEARCH_NOT_CERTIFIED$/.test(pilot.status)||
   pilot.sourceRevision!==PIN||pilot.hour!=="COMPLINE"||
   !Array.isArray(pilot.availableLanguages)||
   pilot.availableLanguages.length!==activeLanguages.length||
   activeLanguages.some(l=>!pilot.availableLanguages.includes(l))||
   pilot.civilDate!==date||pilot.officeDate!==(date==="2026-12-07"?"2026-12-08":
    date==="2026-12-12"?"2026-12-13":
    date==="2026-12-19"?"2026-12-20":
    date==="2026-12-24"?"2026-12-25":
    date==="2026-12-31"?"2027-01-01":
    date==="2027-01-02"?"2027-01-03":
    date==="2027-01-05"?"2027-01-06":
    date==="2027-01-09"?"2027-01-10":
    date==="2027-01-16"?"2027-01-17":date)||
   pilot.blockCount!==42||pilot.blocks?.length!==42||
   pilot.frames?.length!==pilot.focusFrameCount||
   pilot.rightsApproved!==false||pilot.publishable!==false||
   pilot.published!==false||pilot.officeCompletenessCertified!==false||
   pilot.translationApproved!==false||
   !textsValid(pilot.frames,activeLanguages))
   return hold("COMPLINE_EXACT_UNPUBLISHED_SOURCE_PROOF_MISSING");
  return Object.freeze({
   schema:PRIVATE_OFFICE_REVIEW_SCHEMA,status:"PRIVATE_SOURCE_TEXT_REVIEW",
   civilDate:date,officeDate:pilot.officeDate,hour,
   events:pilot.blocks,frames:pilot.frames,sourceRevision:PIN,
   availableLanguages:Object.freeze([...activeLanguages]),
   eventCount:42,frameCount:pilot.frames.length,reviewOnly:true,
   readingPublished:false,rightsApproved:false,liturgicallyCertified:false,
   publishable:false,published:false
  });
 }
 if(date!=="2026-11-28"||pilot?.status!=="RESEARCH_PREVIEW_ASSEMBLED_NOT_RELEASED"||
  pilot.sourceRevision!==PIN||pilot.civilDate!==date||
  pilot.officeDate!=="2026-11-29"||
  pilot.preview?.status!=="PRIVATE_RESEARCH_PREVIEW_SOURCE_SEQUENCE_ONLY"||
  pilot.preview.blockCount!==38||pilot.preview.blocks?.length!==38||
  pilot.rightsApproved!==false||pilot.publishable!==false||
  pilot.published!==false||pilot.preview.completeHourCertified!==false||
  focus?.status!=="RESEARCH_VERSE_AND_STANZA_FOCUS_NOT_CERTIFIED"||
  focus.originalEventCount!==38||focus.focusFrameCount!==focus.frames?.length||
  focus.sourceTextAltered!==false||focus.rightsApproved!==false||
  focus.publishable!==false||focus.published!==false||
  !textsValid(focus.frames))
  return hold("FIRST_VESPERS_EXACT_UNPUBLISHED_SOURCE_PROOF_MISSING");
 return Object.freeze({
   schema:PRIVATE_OFFICE_REVIEW_SCHEMA,status:"PRIVATE_SOURCE_TEXT_REVIEW",
   civilDate:date,officeDate:"2026-11-29",hour,
   events:pilot.preview.blocks,frames:focus.frames,sourceRevision:PIN,
   eventCount:38,frameCount:focus.frames.length,reviewOnly:true,
   readingPublished:false,rightsApproved:false,liturgicallyCertified:false,
   publishable:false,published:false
 });
}
export async function assemblePrivateOfficeReview({
 hour,date,fetchSource,universalWitness=null,languageMode="trilingual"
}={}){
 if(!["trilingual","latin"].includes(languageMode))return hold("REVIEW_LANGUAGE_MODE_NOT_SUPPORTED");
 if(typeof fetchSource!=="function")return hold("FETCH_TRANSPORT_REQUIRED");
 if(hour==="COMPLINE"){
  if(!COMPLINE_DATES.has(date))return hold("COMPLINE_DATE_NOT_REVIEWED");
  try{
   const latin=languageMode==="latin";
   const reader=latin?createLatinComplinePinnedReader({date,fetchSource}):
    createComplinePinnedReader({date,fetchSource});
   const pilot=latin?await assembleLatinDatedComplinePilot({reader,date}):
    await assembleDatedComplinePilot({reader,date});
   return projectPrivateOfficeReview({hour,date,pilot,languageMode});
  }catch(error){return hold("COMPLINE_SOURCE_FAILURE:"+String(error?.message??error))}
 }
 if(hour==="VESPERS"&&date==="2026-11-28"){
  if(!universalWitness)return hold("UNIVERSAL_OFFICE_WITNESS_REQUIRED");
  try{
   const reader=createAdventFirstVespersBoundedPinnedReader({fetchSource});
   const pilot=await assembleAdventI2026PrivatePreviewSession({
    ...reader,universalWitness,recitation:"SOLO",minister:"BELOW_DEACON"
   });
   const focus=pilot.preview?buildAdventI2026ReadingFocus({preview:pilot.preview}):null;
   return projectPrivateOfficeReview({hour,date,pilot,focus});
  }catch(error){return hold("FIRST_VESPERS_SOURCE_FAILURE:"+String(error?.message??error))}
 }
 return hold("NOT_A_REVIEWED_HOUR");
}

/**
 * Opt-in Christmas private source review only.
 * The normal private Office API retains the original 23-date scope.
 * This helper cannot be reached through the public Office route.
 */
export async function assembleChristmas2026PrivateOfficeResearchReview({
 date,fetchSource
}={}){
 if(!(typeof date==="string"&&date>="2026-12-21"&&date<="2026-12-27"))
  return hold("CHRISTMAS_PRIVATE_SOURCE_DATE_NOT_IN_FINITE_LEDGER");
 if(typeof fetchSource!=="function")return hold("FETCH_TRANSPORT_REQUIRED");
 try{
  const reader=createChristmas2026PrivateLatinPinnedReader({date,fetchSource});
  const pilot=await assembleChristmas2026PrivateLatinComplinePilot({reader,date});
  return projectPrivateOfficeReview({
   hour:"COMPLINE",date,pilot,languageMode:"latin",
   privateChristmasResearch:true
  });
 }catch(error){
  return hold("CHRISTMAS_PRIVATE_SOURCE_FAILURE:"+String(error?.message??error));
 }
}

/**
 * Isolated source-driven 28 Dec 2026–3 Jan 2027 Latin Compline research.
 * No public routes call this; generic private and 21–27 Dec APIs unchanged.
 * A valid private text does NOT authorize publication.
 */
export async function assembleDec28Jan03PrivateOfficeResearchReview({
 date,fetchSource
}={}){
 const eligible=typeof date==="string"&&(
  date>="2026-12-28"&&date<="2026-12-31"||
  date>="2027-01-01"&&date<="2027-01-03"
 );
 if(!eligible)return hold("YEAR_BOUNDARY_DATE_OUTSIDE_FINITE_PRIVATE_RESEARCH");
 if(typeof fetchSource!=="function")return hold("FETCH_TRANSPORT_REQUIRED");
 try{
  const reader=createDec28Jan03PrivateLatinPinnedReader({date,fetchSource});
  const pilot=await assembleDec28Jan03PrivateLatinComplinePilot({reader,date});
  return projectPrivateOfficeReview({
   hour:"COMPLINE",date,pilot,languageMode:"latin",
   privateYearBoundaryResearch:true
  });
 }catch(error){
  return hold("YEAR_BOUNDARY_PINNED_SOURCE_FAILURE:"+String(error?.message??error));
 }
}

/**
 * Epiphany/First Vespers source-only review for 4–10 January 2027.
 * Does not authorize Prayer route, translation, chant or publication.
 */
export async function assembleJan04_10PrivateOfficeResearchReview({
 date,fetchSource
}={}){
 if(!(typeof date==="string"&&date>="2027-01-04"&&date<="2027-01-10"))
  return hold("EPIPHANY_PRIVATE_DATE_OUTSIDE_FINITE_LEDGER");
 if(typeof fetchSource!=="function")return hold("FETCH_TRANSPORT_REQUIRED");
 try{
  const reader=createJan04_10PrivateLatinPinnedReader({date,fetchSource});
  const pilot=await assembleJan04_10PrivateLatinComplinePilot({reader,date});
  return projectPrivateOfficeReview({
   hour:"COMPLINE",date,pilot,languageMode:"latin",
   privateEpiphanyResearch:true
  });
 }catch(error){
  return hold("EPIPHANY_PRIVATE_SOURCE_FAILURE:"+String(error?.message??error));
 }
}

/**
 * Finite source-first Roman Office 11–17 January 2027 Compline.
 * Historical private research, NOT a public permission, no EN/FR rights.
 */
export async function assembleJan11_17PrivateOfficeResearchReview({
 date,fetchSource
}={}){
 if(!(typeof date==="string"&&date>="2027-01-11"&&date<="2027-01-17"))
  return hold("JAN11_17_PRIVATE_DATE_OUTSIDE_FINITE_INTAKE");
 if(typeof fetchSource!=="function")return hold("FETCH_TRANSPORT_REQUIRED");
 try{
  const reader=createJan11_17PrivateLatinPinnedReader({date,fetchSource});
  const pilot=await assembleJan11_17PrivateLatinComplinePilot({reader,date});
  return projectPrivateOfficeReview({
   hour:"COMPLINE",date,pilot,languageMode:"latin",
   privatePostEpiphanyResearch:true
  });
 }catch(error){
  return hold("JAN11_17_SOURCE_FAILURE:"+String(error?.message??error));
 }
}
