/**
 * Choir F02/F03 display model. Ids are the canonical 2026 Prayer v5.1
 * registry's source-owned texts, not a new prayer corpus. Collection and
 * Scripture routes continue through their existing engine.
 */
export const CHOIR_SOURCE_F02=Object.freeze([
 "marian_hail_holy_queen","weekday_magnificat",
 "benediction_o_salutaris","benediction_tantum_ergo",
 "weekday_benedictus","devotion_st_anthony_lost_items",
 "dead_de_profundis","traditional_veni_sancte_sequence",
 "sub_tuum","benediction_adoremus_ps116"
]);
export const CHOIR_SOURCE_F03=Object.freeze([
 "benediction_divine_praises","adoration_litany_blessed_sacrament",
 "devotion_litany_st_joseph","litany_loreto_1962","litany_loreto_current"
]);
export const CHOIR_SOURCE_IDS=Object.freeze([...CHOIR_SOURCE_F02,...CHOIR_SOURCE_F03]);
const STYLES=Object.freeze({
 marian_hail_holy_queen:"antiphon",weekday_magnificat:"canticle",
 benediction_o_salutaris:"hymn",benediction_tantum_ergo:"hymn",
 weekday_benedictus:"canticle",devotion_st_anthony_lost_items:"responsory",
 dead_de_profundis:"psalm",traditional_veni_sancte_sequence:"sequence",
 sub_tuum:"antiphon",benediction_adoremus_ps116:"psalm",
 benediction_divine_praises:"praises",
 adoration_litany_blessed_sacrament:"litany",devotion_litany_st_joseph:"litany",
 litany_loreto_1962:"litany",litany_loreto_current:"litany"
});
export const choirKind=id=>STYLES[id]||null;
// This expression only captures a clearly attested response at the end of
// the SOURCE line. It does not attach fabricated ℣ or ℟ speaker labels.
const RESPONSE=/(,\s*)(?:(?:pray for us|have mercy on us|hear us|graciously hear us|spare us(?:,? O Lord)?|deliver us(?:,? O Lord)?|priez pour nous|ayez pitié de nous|écoutez-nous|exaucez-nous|délivrez-nous|pardonnez-nous|ora pro nobis|miserere nobis|audi nos|exaudi nos|parce nobis(?:,? Domine)?|libera nos(?:,? Domine)?))[.!?]?\s*$/i;
function sourceLinePieces(line,id,kind,stanza){
 const whole=String(line||"");
 if(!whole.trim())return [{raw:whole,kind:"space",stanza}];
 if(/^[ \t]*(?:℣|℟)\./.test(whole)){
  return [{raw:whole,kind:/^[ \t]*℟\./.test(whole)?"response":"versicle",stanza}];
 }
 if(kind==="litany"){
  const phrase=whole.replace(/\n$/,"");
  const m=RESPONSE.exec(phrase);
  if(m&&m.index>0){
   const idx=m.index+m[1].length;
   return [
    {raw:whole.slice(0,idx),kind:"invocation",stanza},
    {raw:whole.slice(idx),kind:"response",stanza}
   ];
  }
 }
 // Source-authored verse line always gets its own independent focus.
 // A long source line with sentences may be divided at punctuation alone.
 const chunks=[];let pos=0;
 if(whole.trim().length>175){
  const cuts=[...whole.matchAll(/[.!?;:]\s+(?=\S)/g)]
   .map(m=>m.index+m[0].length).filter(n=>n>0&&n<whole.length);
  while(whole.length-pos>175){
   const candidates=cuts.filter(n=>n>pos+55&&n<=pos+195);
   const cut=candidates.at(-1);
   if(!cut)break;
   chunks.push(whole.slice(pos,cut));pos=cut;
  }
 }
 chunks.push(whole.slice(pos));
 if(chunks.join("")!==whole)return [{raw:whole,kind:"prose",stanza,uncertified:true}];
 return chunks.map(raw=>({raw,kind:kind==="litany"?"invocation":kind==="praises"?"praise":"verse",stanza}));
}
export function choirSourceBeats(id,language,source){
 if(!CHOIR_SOURCE_IDS.includes(id)||!["en","fr","la"].includes(language)||
  typeof source!=="string"||!source.trim())return null;
 const kind=choirKind(id),lines=source.match(/[^\n]*\n|[^\n]+$/g)||[];
 let stanza=0;
 const beats=lines.flatMap(line=>{
  const out=sourceLinePieces(line,id,kind,stanza);
  if(!line.trim())stanza++;
  return out;
 });
 if(!beats.length||beats.map(b=>b.raw).join("")!==source)
  return Object.freeze([{raw:source,kind:"prose",stanza:0,uncertified:true}]);
 return Object.freeze(beats.map(b=>Object.freeze(b)));
}
