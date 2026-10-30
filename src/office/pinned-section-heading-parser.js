/**
 * Bounded exact-heading source section parser for the Compline research reader.
 * Extracted from the proven Advent I Vespers parser without importing
 * that 100+-file research programme. Does NOT evaluate Divinum Officium
 * conditional directives, macros or late-edition substitutions.
 */
const NORMAL=/^\[([A-Za-z][A-Za-z0-9_. -]{0,100})\]\s*$/u;
export function parsePinnedOfficeSectionHeadings(text,allowed){
 if(!(allowed instanceof Set)||allowed.size<1||allowed.size>20)
  throw Error("OFFICE_SECTION_ALLOWLIST_REQUIRED");
 if(typeof text!=="string"||text.length<40||text.length>320000)
  throw Error("OFFICE_RAW_SOURCE_SECTION_FILE_INVALID");
 const map=new Map();
 let section=null;
 for(const line of text.replace(/\r\n?/gu,"\n").split("\n")){
  const header=NORMAL.exec(line);
  if(header){
   section=allowed.has(header[1])?header[1]:null;
   if(section!==null){
    if(map.has(section))throw Error("OFFICE_DUPLICATED_SOURCE_SECTION:"+section);
    map.set(section,[]);
   }
   continue;
  }
  if(/^\[[^\]]+\]\s+\(/u.test(line)){section=null;continue}
  if(section!==null&&line.trim())map.get(section).push(line.trim());
 }
 if([...allowed].some(key=>!map.has(key)))
  throw Error("OFFICE_REQUIRED_SOURCE_SECTION_MISSING");
 return map;
}
