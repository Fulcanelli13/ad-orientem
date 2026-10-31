/**
 * Claude Choir v4.6 fixed-foot response model.
 * Original source: AO_Prayer_Choir_Litany_of_Loreto.html, app-ui source pinned
 * under tests/fixtures/claude-prayer/choir.app-ui.{css,js}.
 *
 * This adapter never adds, replaces or translates a prayer line. Each unit
 * retains its original raw source for exact witness reconstruction. A source
 * response is displayed in the single fixed foot bar (or inline on request).
 * Full Kyrie/Christe sentences and source ℣/℟ remain intact.
 */
const RESPONSE=/((?:,\s*|\s+—\s+))(?:(?:pray for us|have mercy on us|hear us|graciously hear us|spare us(?:,?\s*O Lord)?|deliver us(?:,?\s*O Lord)?|we beseech you,?\s*hear us|priez pour nous|ayez pitié de nous|écoutez-nous|exaucez-nous|délivrez-nous|pardonnez-nous|ora pro nobis|miserere nobis|audi nos|exaudi nos|parce nobis(?:,?\s*Domine)?|libera nos(?:,?\s*Domine)?|te rogamus,?\s*audi nos))[.!?]?\s*$/i;
export const CLAUDE_CHOIR_FIXED_BAR="ao-claude-choir-fixed-foot-v1";

export function claudeChoirSourceUnits(source){
 if(typeof source!=="string"||!source.trim())return null;
 const lines=source.match(/[^\n]*\n|[^\n]+$/g)||[];
 let section=0;
 const units=lines.map(raw=>{
  const ending=raw.endsWith("\n")?"\n":"";
  const body=ending?raw.slice(0,-1):raw;
  if(!body.trim()){section++;return Object.freeze({raw,kind:"gap",section,response:"",invocation:""});}
  if(/^\s*(?:℣|℟|V|R)\.\s/.test(body))
   return Object.freeze({raw,kind:"source-role",section,response:"",invocation:body});
  const em=body.indexOf(" — ");
  const m=em>=0?null:RESPONSE.exec(body);
  const split=em>0?em:(m&&m.index>0?m.index:-1);
  if(split>0){
   const divider=em>0?" — ":m[1];
   const before=body.slice(0,split);
   const after=body.slice(split+divider.length);
   if(before.trim()&&after.trim()){
    return Object.freeze({
     raw,kind:"pair",section,
     invocation:before,response:after,divider,ending
    });
   }
  }
  return Object.freeze({raw,kind:"full",section,response:"",invocation:body});
 });
 if(units.map(unit=>unit.raw).join("")!==source)throw Error("Litany source reconstruction failed");
 return Object.freeze(units);
}
export function claudeChoirFootFor(unit){
 return unit?.kind==="pair"?unit.response:"";
}
