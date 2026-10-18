// A user-reported service remains outside the Mass state machine.
// Open the already-canonical Prayer reader as a temporary overlay, keeping
// the underlying preflight mounted and its choices unmodified.
import {ADJACENT_SERVICE_CHOICES} from "./adjacent-service-context.js";

const ROUTES=Object.freeze({
 ADORATION:"pray.adoration",
 BENEDICTION:"pray.benediction"
});
export function adjacentServiceReaderRoute(id){
 const known=ADJACENT_SERVICE_CHOICES.find(x=>x.id===id);
 return known?ROUTES[known.service]??null:null;
}
export async function openAdjacentServiceReader(id,{
 win=globalThis,trigger=null,
 ensureReader=async()=> {
   const {ensurePrayReader}=await import("../pray/browser-entry.js");
   return ensurePrayReader({win});
 }
}={}){
 const route=adjacentServiceReaderRoute(id);
 if(!route)return Object.freeze({ok:false,reason:"UNKNOWN_SERVICE"});
 try{
  const ready=await ensureReader();
  if(ready===false)return Object.freeze({ok:false,reason:"PRAY_READER_UNAVAILABLE"});
  const donor=win?.AO_PRAY_V435930;
  if(typeof donor?.open!=="function")return Object.freeze({ok:false,reason:"PRAY_READER_UNAVAILABLE"});
  // Setting returnContext:null is deliberate: closing Prayer does not call
  // Home or re-open the Mass host and thus cannot wipe the selected Proper.
  // The donor restores focus to the triggering button on a normal close.
  const opened=await Promise.resolve(donor.open(route,{
   returnContext:null,trigger
  }));
  return Object.freeze({ok:opened===true||opened?.ok===true,
   reason:opened===true||opened?.ok===true?null:"PRAY_ROUTE_UNAVAILABLE"});
 }catch(error){
  return Object.freeze({ok:false,reason:"PRAY_OPEN_ERROR",
   detail:String(error?.message??error)});
 }
}
