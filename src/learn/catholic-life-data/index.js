import CL01 from "./cl01.js";
import CL02 from "./cl02.js";
import CL03 from "./cl03.js";
import CL04 from "./cl04.js";
import CL05 from "./cl05.js";
import CL06 from "./cl06.js";
import CL07 from "./cl07.js";
import CL08 from "./cl08.js";
import CL09 from "./cl09.js";
import CL10 from "./cl10.js";
import {CATHOLIC_LIFE_SOURCES,CATHOLIC_LIFE_SOURCE_MAP} from "./sources.js";

export const CATHOLIC_LIFE_VERSION="1.2.0";
export const CATHOLIC_LIFE_ROUTE="learn.catholic_life";
export const CATHOLIC_LIFE_COURSES=Object.freeze([CL01,CL02,CL03,CL04,CL05,CL06,CL07,CL08,CL09,CL10]);
export const CATHOLIC_LIFE_STAGES=Object.freeze(CATHOLIC_LIFE_COURSES.flatMap(course=>course.stages));
export const CATHOLIC_LIFE_STAGE_MAP=Object.freeze(Object.fromEntries(CATHOLIC_LIFE_STAGES.map(stage=>[stage.id,stage])));
export const CATHOLIC_LIFE_COURSE_MAP=Object.freeze(Object.fromEntries(CATHOLIC_LIFE_COURSES.map(course=>[course.id,course])));
export {CATHOLIC_LIFE_SOURCES,CATHOLIC_LIFE_SOURCE_MAP};

export function validateCatholicLifeCorpus(){
  const errors=[];
  const ids=new Set();
  const take=(id,kind)=>{
    if(!id){errors.push(kind+"_MISSING_ID");return;}
    if(ids.has(id))errors.push("DUPLICATE_ID:"+id);
    ids.add(id);
  };
  if(CATHOLIC_LIFE_COURSES.length!==10)errors.push("COURSE_COUNT:"+CATHOLIC_LIFE_COURSES.length);
  if(CATHOLIC_LIFE_STAGES.length!==79)errors.push("STAGE_COUNT:"+CATHOLIC_LIFE_STAGES.length);
  for(const course of CATHOLIC_LIFE_COURSES){
    take(course.id,"COURSE");
    for(const stage of course.stages){
      take(stage.id,"STAGE");
      for(const card of stage.cards||[]){
        take(card.id,"CARD");
        for(const claim of card.claims||[]){
          take(claim.id,"CLAIM");
          if(claim.layer==="TRADITIONAL")errors.push("GENERIC_TRADITIONAL_LAYER:"+claim.id);
          if(claim.layer==="PASTORAL"&&!claim.basis)errors.push("PASTORAL_WITHOUT_BASIS:"+claim.id);
          if(claim.layer==="CUSTOM"&&(!claim.territory||!claim.territory.length))errors.push("CUSTOM_WITHOUT_TERRITORY:"+claim.id);
          for(const sourceId of claim.sources||[]){
            const source=CATHOLIC_LIFE_SOURCE_MAP[sourceId];
            if(!source)errors.push("MISSING_SOURCE:"+claim.id+":"+sourceId);
          }
          if(claim.layer==="PROFILE_1962"&&(claim.sources||[]).length){
            const ok=claim.sources.some(sourceId=>(CATHOLIC_LIFE_SOURCE_MAP[sourceId]?.profile_validity||[]).includes("PROFILE_1962"));
            if(!ok)errors.push("NO_1962_VALID_SOURCE:"+claim.id);
          }
        }
      }
    }
  }
  for(const source of CATHOLIC_LIFE_SOURCES){
    take(source.source_id,"SOURCE");
    if(String(source.status||"").startsWith("MIGRATION_REFERENCE"))errors.push("MIGRATION_SOURCE:"+source.source_id);
  }
  return Object.freeze({
    ok:errors.length===0,
    errors:Object.freeze(errors),
    courseCount:CATHOLIC_LIFE_COURSES.length,
    stageCount:CATHOLIC_LIFE_STAGES.length,
    sourceCount:CATHOLIC_LIFE_SOURCES.length,
  });
}

export const CATHOLIC_LIFE_VALIDATION=validateCatholicLifeCorpus();
export default CATHOLIC_LIFE_COURSES;
