/**
 * F01 Prayer Card — display-only, source-owned clause boundaries.
 *
 * Every part is a substring of the canonical witness, and concatenating
 * parts reconstructs it byte-for-byte. No punctuation, wording, edition or
 * language is generated. Fail closed to one paragraph on witness changes.
 */
export const ESSENTIAL_HOLY_CARD_IDS_V1=Object.freeze([
 "foundations_sign_of_cross",
 "foundations_our_father",
 "foundations_hail_mary",
 "foundations_glory_be",
 "foundations_apostles_creed"
]);

const STARTS=Object.freeze({
 foundations_sign_of_cross:Object.freeze({en:[],fr:[],la:[]}),
 foundations_our_father:Object.freeze({
  en:["Thy kingdom come;","Thy will be done","Give us this day","and forgive us","and lead us not"],
  fr:["que votre règne arrive;","que votre volonté soit faite","Donnez-nous aujourd’hui","pardonnez-nous nos offenses","et ne nous laissez pas"],
  la:["adveniat regnum tuum;","fiat voluntas tua","Panem nostrum","et dimitte nobis","et ne nos inducas"]
 }),
 foundations_hail_mary:Object.freeze({
  en:["blessed art thou among women","Holy Mary, Mother of God"],
  fr:["vous êtes bénie entre toutes les femmes","Sainte Marie, Mère de Dieu"],
  la:["benedicta tu in mulieribus","Sancta Maria, Mater Dei"]
 }),
 foundations_glory_be:Object.freeze({
  en:["As it was in the beginning"],
  fr:["comme il était au commencement"],
  la:["Sicut erat in principio"]
 }),
 foundations_apostles_creed:Object.freeze({
  en:["and in Jesus Christ","Who was conceived","suffered under Pontius Pilate","He descended into hell;","on the third day","He ascended into heaven","from there He shall come","I believe in the Holy Spirit"],
  fr:["et en Jésus-Christ","qui a été conçu","a souffert sous Ponce Pilate","est descendu aux enfers;","le troisième jour","est monté aux cieux","d’où il viendra","Je crois au Saint-Esprit"],
  la:["Et in Iesum Christum","qui conceptus est","passus sub Pontio Pilato","descendit ad inferos;","tertia die","ascendit ad cælos;","inde venturus est","Credo in Spiritum Sanctum"]
 })
});

export function essentialHolyCardParts(id,language,text){
 const original=String(text??"");
 const starts=STARTS[id]?.[language];
 if(!starts||!original)return null;
 if(!starts.length)return Object.freeze([{text:original,collective:false}]);
 const cuts=[0];let cursor=0;
 for(const anchor of starts){
  const at=original.indexOf(anchor,cursor);
  if(at<=cursor||original.indexOf(anchor,at+anchor.length)!==-1)
   return Object.freeze([{text:original,collective:false,uncertified:true}]);
  cuts.push(at);cursor=at+anchor.length;
 }
 cuts.push(original.length);
 const parts=cuts.slice(0,-1).map((start,i)=>({
  text:original.slice(start,cuts[i+1]),
  // A collective Hail Mary continuation is visually indented, never
  // assigned an invented ℣/℟ marker. It receives normal independent focus.
  collective:id==="foundations_hail_mary"&&i===cuts.length-2
 }));
 if(parts.some(p=>!p.text.trim())||parts.map(p=>p.text).join("")!==original)
  return Object.freeze([{text:original,collective:false,uncertified:true}]);
 return Object.freeze(parts.map(p=>Object.freeze(p)));
}
