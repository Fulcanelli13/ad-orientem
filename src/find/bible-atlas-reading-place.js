// Device-local Biblical Atlas reading place. Uses stable event identity rather
// than presentation indices; no account, server tracking, or progress scores.
export const ATLAS_READING_PLACE_KEY="ao:biblical-atlas:reading-place:v1";
const SCHEMA="AO_BIBLICAL_ATLAS_READING_PLACE_V1";
export function readAtlasReadingPlace(storage,stops){
 if(!storage||!Array.isArray(stops)||!stops.length)return null;
 try{
  const raw=storage.getItem(ATLAS_READING_PLACE_KEY);
  if(!raw||raw.length>400)return null;
  const value=JSON.parse(raw);
  if(value?.schema!==SCHEMA||typeof value.eventKey!=="string"||
      !value.eventKey.startsWith("biblical:")||value.eventKey.length>180)return null;
  const match=stops.find(s=>s.eventKey===value.eventKey);
  return match?.index??null;
 }catch{return null;}
}
export function saveAtlasReadingPlace(storage,stop){
 if(!storage||typeof stop?.eventKey!=="string"||
    !stop.eventKey.startsWith("biblical:")||stop.eventKey.length>180)return false;
 try{
  storage.setItem(ATLAS_READING_PLACE_KEY,JSON.stringify({
   schema:SCHEMA,eventKey:stop.eventKey
  }));
  return true;
 }catch{return false;}
}
export function clearAtlasReadingPlace(storage){
 try{storage?.removeItem?.(ATLAS_READING_PLACE_KEY);return true;}catch{return false;}
}
