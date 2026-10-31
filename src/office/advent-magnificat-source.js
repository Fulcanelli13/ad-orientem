/**
 * Reusable source-only Gospel canticle composition witness.
 * Pinned DO horas.pl canticum(): Vespera -> num=3 -> Psalm(229+3)=232.
 * Psalm232 original files contain a heading + Luc. 1:46..55.
 * The Gloria is an exact named section of Psalterium/Common/Prayers.
 *
 * This is a bounded research component, NOT a certified Magnificat order.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {ADVENT_VESPERS_REMAINDER_SCHEMA} from "./advent-vespers-remainder-research.js";

export const OFFICE_MAGNIFICAT_SOURCE_SCHEMA="ao.office.magnificat-source-component.v1";
const LANGUAGES=["la","en","fr"], PSALM="Psalterium/Psalmorum/Psalm232";
const PRAYERS="Psalterium/Common/Prayers";
const PROPER="Tempora/Adv1-0";
const fail=reason=>Object.freeze({
 schema:OFFICE_MAGNIFICAT_SOURCE_SCHEMA,status:"WITHHELD",reason,
 canticleVersesLocated:false,sourceDoxologyLocated:false,
 rubricAntiphonPlacementVerified:false,appointedOfficeVerified:false,
 completeHourVerified:false,printedEditionCertified:false,
 translationAlignmentVerified:false,rightsApproved:false,
 publishable:false,published:false
});
function inputVerified(x){
 return x?.schema===ADVENT_VESPERS_REMAINDER_SCHEMA&&
  x.status==="VERSICLE_AND_MAGNIFICAT_ANTIPHON_SOURCES_IDENTIFIED"&&
  x.civilDate==="2026-11-28"&&x.officeDate==="2026-11-29"&&
  x.officePart==="FIRST"&&x.sourceRevision===DIVINUM_OFFICIUM_PIN&&
  x.magnficatAntiphonAppointmentVerified===false&&
  x.appointedOfficeVerified===false&&x.completeHourVerified===false&&
  x.publishable===false&&x.published===false;
}
function safeRead(s,path,language){
 return s?.sourceRevision===DIVINUM_OFFICIUM_PIN&&
  s.sourcePath===path&&s.language===language;
}
function canticleWitness(text){
 if(typeof text!=="string"||text.length<300||text.length>10000)
  return null;
 const rows=text.replace(/\r\n?/g,"\n").trim().split("\n");
 if(rows.length!==11||!/^\([^()]{10,200}Luc\.?(?: |[ ])?1:46-55\)$/iu.test(rows[0])&&
   !/^\([^()]{10,200}(?:Luke|Lc) 1:46-55\)$/iu.test(rows[0]))
  return null;
 const lines=[];
 for(let i=1;i<rows.length;i++){
  const line=rows[i].trim();
  const m=/^1:(4[6-9]|5[0-5]) (.+)$/u.exec(line);
  if(!m||Number(m[1])!==i+45||line.length>1400||
     /(?:^|\s)[$@&]|<[^>]*>|\{:/u.test(line))
   return null;
  lines.push(Object.freeze({verse:"Luke 1:"+(i+45),sourceLine:i+1,
   text:m[2]}));
 }
 return Object.freeze({sourceHeading:rows[0],verses:Object.freeze(lines)});
}
function gloriaWitness(map){
 if(!(map instanceof Map))return null;
 const raw=map.get("Gloria");
 if(!Array.isArray(raw)||raw.length!==2)return null;
 const a=raw.map(x=>typeof x==="string"?x.trim():"");
 if(!/^V\.\s+\S/u.test(a[0])||!/^R\.\s+\S/u.test(a[1])||
    a.some(x=>x.length>500||/[$@&{}<>]/u.test(x)))
  return null;
 return Object.freeze(a);
}
export async function assembleAdventMagnificatSourceResearch({
 sourceObservation,readCanticleSource,readSource
}={}){
 if(!inputVerified(sourceObservation))
  return fail("OFFICE_MAGNIFICAT_SOURCE_OBSERVATION_REQUIRED");
 if(typeof readCanticleSource!=="function"||typeof readSource!=="function")
  return fail("OFFICE_MAGNIFICAT_SOURCE_READERS_REQUIRED");
 const witnesses={};
 for(const language of LANGUAGES){
  const [rawCanticle,prayers]=await Promise.all([
   readCanticleSource(PSALM,language),readSource(PRAYERS,language)
  ]);
  if(!safeRead(rawCanticle,PSALM,language)||
     !safeRead(prayers,PRAYERS,language))
   return fail("OFFICE_MAGNIFICAT_PINNED_SOURCE_MISMATCH:"+language);
  const canticle=canticleWitness(rawCanticle.text);
  const gloria=gloriaWitness(prayers.map);
  const observed=sourceObservation.languages?.[language];
  if(!canticle||!gloria||
     typeof observed?.magnficatAntiphon!=="string"||
     !observed.magnficatAntiphon.trim()||
     observed.antiphonSourceId!==PROPER+"#Ant 1")
   return fail("OFFICE_MAGNIFICAT_CANTICLE_OR_GLORIA_MISSING:"+language);
  witnesses[language]=Object.freeze({
   canticle,gloria,antiphon:observed.magnficatAntiphon,
   sourceTrace:Object.freeze([
    Object.freeze({sourceId:PROPER+"#Ant 1",language}),
    Object.freeze({sourceId:PSALM+"#LUKE_1_46_55",language}),
    Object.freeze({sourceId:PRAYERS+"#Gloria",language})
   ]),
   sourceVerseCount:10,
   repeatedAntiphonLiturgicalPositionVerified:false,
   gloriaUseLiturgicallyAdjudicated:false,
   printAndTranslationCollated:false
  });
 }
 return Object.freeze({
  schema:OFFICE_MAGNIFICAT_SOURCE_SCHEMA,
  status:"MAGNIFICAT_THREE_LANGUAGE_SOURCE_COMPONENT_UNVERIFIED",
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  civilDate:"2026-11-28",officeDate:"2026-11-29",
  officePart:"FIRST",hour:"VESPERS",
  sourceCanticleId:PSALM+"#LUKE_1_46_55",
  sourceDoxologyId:PRAYERS+"#Gloria",
  sourceAntiphonId:PROPER+"#Ant 1",
  languages:Object.freeze(witnesses),
  sourceVerseCountPerLanguage:10,
  canticleVersesLocated:true,sourceDoxologyLocated:true,
  rubricAntiphonPlacementVerified:false,appointedOfficeVerified:false,
  completeHourVerified:false,printedEditionCertified:false,
  translationAlignmentVerified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
