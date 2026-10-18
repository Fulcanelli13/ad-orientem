/**
 * Ephemeral Living Church conversation trail.
 * Records source IDs, selected objective IDs and guide transitions only.
 * Never stores typed messages, private circumstances, or doctrinal excerpts.
 * Not persisted or sent to a remote service.
 */
export const LIVING_CHURCH_TRAIL_VERSION="AO_LC_EPHEMERAL_TRAIL_V1";
const GUIDES=new Set(["pius-x","canon","sacristan"]);
const KINDS=new Set(["guide","objective","source"]);
const safeId=x=>typeof x==="string"&&x.length>0&&x.length<=100&&/^[a-zA-Z0-9_.:-]+$/.test(x);
export function createLivingChurchConversationTrail({limit=18}={}){
 if(!Number.isInteger(limit)||limit<3||limit>40)throw Error("Invalid in-memory history bound");
 const rows=[];
 function record({kind,guide,objective=null,sourceId=null}={}){
  if(!KINDS.has(kind)||!GUIDES.has(guide)||
   objective!==null&&!safeId(objective)||
   sourceId!==null&&!safeId(sourceId))return Object.freeze({ok:false});
  if(kind==="objective"&&!objective||kind==="source"&&!sourceId)
   return Object.freeze({ok:false});
  const event=Object.freeze({kind,guide,objective,sourceId});
  const last=rows.at(-1);
  if(last&&JSON.stringify(last)===JSON.stringify(event))return Object.freeze({ok:true,duplicate:true});
  rows.push(event);if(rows.length>limit)rows.shift();
  return Object.freeze({ok:true});
 }
 return Object.freeze({
  version:LIVING_CHURCH_TRAIL_VERSION,
  record,
  entries:()=>Object.freeze([...rows]),
  count:()=>rows.length,
  clear:()=>{rows.splice(0);return true;}
 });
}
