/**
 * Two distinct Easter Vigil Litany sections. The same bilingual text and
 * choreography remain owned by the 38-record R33 Mass reader, not Prayer.
 *
 * Exactly 92 call/response lines before the font and exactly 60 after the
 * font/renewal rites, in the donated Latin/English/French presentation text.
 * These are NOT a private Litany, nor a complete Roman Ritual baptism text.
 * The 1962 printed liturgical source has NOT been independently collated.
 */
export const EASTER_VIGIL_PRAYER_DONOR_SOURCE_URL=new URL(
 "../../data/presentation/reader-easter-vigil.v1.json",import.meta.url).href;
export const EASTER_VIGIL_PRAYER_READING_STATUS="R33_RECOVERED_DONOR_1962_GRAPH__PRINT_UNCOLLATED";

function assert(test,reason){
 if(!test)throw Error("Easter Vigil Litany source incomplete: "+reason);
}
const frozen=Object.freeze;
function parsePart(value,part,expected){
 const languages=["lat","en","fr"];
 const lists=Object.fromEntries(languages.map(lang=>{
  assert(typeof value?.[lang]==="string",part+" "+lang+" absent");
  const lines=value[lang].split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  assert(lines.length===expected,part+" "+lang+" wrong row count");
  return [lang,lines];
 }));
 const rows=Array.from({length:expected},(_,i)=>{
  const kind=i%2===0?"VERSICLE":"RESPONSE";
  const texts={};
  for(const lang of languages){
   const line=lists[lang][i],prefix=kind==="VERSICLE"?"℣.":"℟.";
   assert(line.startsWith(prefix),part+" "+lang+" role/order "+(i+1));
   const txt=line.slice(prefix.length).trim();
   assert(txt.length>=2,part+" "+lang+" empty source line "+(i+1));
   texts[lang]=txt;
  }
  return frozen({part,ordinal:i+1,kind,latin:texts.lat,english:texts.en,french:texts.fr});
 });
 return frozen(rows);
}
function stage(part,number,rows){
 const first=part==="I";
 return frozen({
  id:"vigil-litany-"+part.toLowerCase()+"-"+number,
  part,
  r33RecordId:first?"EV-LIT1-400":"EV-LIT2-600",
  scope:first?"BEFORE_FONT_AND_BAPTISMAL_RITES":"AFTER_FONT_BAPTISMS_RENEWAL_AND_ASPERSION",
  title:frozen({
   en:"Easter Vigil Litany · "+part+" · "+number+(first?"/4":"/3"),
   fr:"Litanies de la Vigile pascale · "+part+" · "+number+(first?"/4":"/3")
  }),
  rows:frozen(rows)
 });
}
const chunks=(array,size)=>Array.from({length:Math.ceil(array.length/size)},(_,i)=>array.slice(i*size,(i+1)*size));
export function easterVigilTwoLitaniesStages(payload){
 assert(payload?.schema==="ao-r33-easter-vigil-payload-v1","R33 payload schema");
 assert(payload?.status==="RECOVERED_SOURCE_DONOR_WITH_1962_GRAPH","source status");
 assert(payload?.authority?.principle?.includes("38-record EV graph"),"distinct Mass choreography ownership");
 const first=parsePart(payload.bridge?.litanyI,"I",92);
 const second=parsePart(payload.bridge?.litanyII,"II",60);
 assert(first[0].latin==="Kýrie eléison","first section begins with Kyrie");
 assert(second[0].latin==="Propítius esto","second section begins with Propitius");
 assert(second.at(-1).latin==="Christe, exáudi nos","second section end");
 assert(typeof payload.bridge?.renewal?.lat==="string" && typeof payload.bridge?.font?.lat==="string",
  "font and baptismal-renewal source branches must remain present under the distinct R33 Mass owner");
 const sections=frozen([
  ...chunks(first,24).map((rows,i)=>stage("I",i+1,rows)),
  ...chunks(second,20).map((rows,i)=>stage("II",i+1,rows))
 ]);
 assert(sections.length===7,"seven cards across two separate Litanies");
 for(const lang of ["latin","english","french"]){
  const complete=sections.flatMap(s=>s.rows.map(r=>r[lang]));
  assert(complete.length===152&&complete.every(x=>x.length>=2),
   "all 152 source lines retained in "+lang);
 }
 return sections;
}
export async function loadEasterVigilTwoLitanies({
 fetcher=globalThis.fetch?.bind(globalThis)
}={}){
 if(typeof fetcher!=="function")throw Error("Easter Vigil source fetch unavailable");
 const response=await fetcher(EASTER_VIGIL_PRAYER_DONOR_SOURCE_URL,{cache:"force-cache"});
 if(!response?.ok)throw Error("Original R33 Mass source unavailable");
 const data=await response.json();
 return frozen({
  sourceUrl:EASTER_VIGIL_PRAYER_DONOR_SOURCE_URL,
  status:EASTER_VIGIL_PRAYER_READING_STATUS,
  printedEditionCertified:false,
  ritualBaptismComplete:false,
  sourceOwner:"R33_MASS_EASTER_VIGIL",
  stages:easterVigilTwoLitaniesStages(data)
 });
}
