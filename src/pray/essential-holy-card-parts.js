/**
 * F01 source-exact Holy Cards — 32 canonical texts, one direct-route alias.
 * All rendered parts reconstruct the original EN/FR/Latin face byte-for-byte.
 */
export const ESSENTIAL_HOLY_CARD_IDS_V1=Object.freeze([
 "foundations_sign_of_cross",
 "foundations_our_father",
 "foundations_hail_mary",
 "foundations_glory_be",
 "foundations_apostles_creed",
 "sacrament_act_of_contrition",
 "foundations_act_of_faith",
 "foundations_act_of_hope",
 "foundations_act_of_love",
 "foundations_guardian_angel",
 "foundations_grace_before_meals",
 "foundations_grace_after_meals",
 "foundations_morning_offering",
 "foundations_prayer_of_adoration",
 "mass_confiteor",
 "marian_memorare",
 "marian_consecration_immaculate_heart",
 "adoration_anima_christi",
 "adoration_spiritual_communion",
 "benediction_versicles",
 "adoration_lord_i_am_not_worthy",
 "sacrament_come_holy_spirit",
 "devotion_prayer_st_michael",
 "devotion_memorare_st_joseph",
 "devotion_consecration_christ_king",
 "church_prayer_for_pope",
 "sacred_heart_short_prayer",
 "sacred_heart_aspiration_trust",
 "foundations_eternal_rest",
 "devotion_ad_te_beate_ioseph",
 "dead_fidelium_deus",
 "dead_eternal_rest_singular"
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

const ABBREVIATION=/(?:St|S|N|Fr|Rev|Mr|Mrs|Dr|etc|℣|℟)\.$/i;

/**
 * Delimiter-only, no text editing. Prefer canonical newlines and sentence
 * boundaries; for long prose choose clauses. Never impose V/R on ordinary
 * prayers; authentic ℣/℟ already present in the source remain unmodified.
 */
function naturalPrayerParts(original){
 const marks=[];
 for(let i=0;i<original.length-1;i++){
  const c=original[i],next=original[i+1];
  if(c!=="\n"&&!/[\s]/.test(next))continue;
  let strength=0;
  if(c==="\n")strength=4;
  else if(/[.!?]/.test(c)){
   if(c==="."&&ABBREVIATION.test(original.slice(Math.max(0,i-5),i+1)))continue;
   strength=3;
  }else if(c===";"||c===":")strength=2;
  else if(c===",")strength=1;
  if(!strength)continue;
  let end=i+1;
  while(end<original.length&&/\s/.test(original[end]))end++;
  if(end>=original.length)continue;
  marks.push({end,strength});
 }
 const slices=[];let pos=0;
 while(pos<original.length){
  const remain=original.length-pos;
  if(remain<=200){slices.push(original.slice(pos));break}
  const inRange=marks.filter(m=>m.end>pos+60&&m.end<=pos+195);
  const hard=marks.find(m=>m.strength===4&&m.end>pos&&m.end<=pos+195);
  const candidates=inRange.filter(m=>m.strength>=2);
  let chosen=hard||(candidates.length?candidates:inRange).at(-1);
  if(!chosen)chosen=marks.find(m=>m.end>pos+60&&m.end<=pos+290);
  if(!chosen){slices.push(original.slice(pos));break}
  slices.push(original.slice(pos,chosen.end));
  pos=chosen.end;
 }
 if(slices.join("")!==original||slices.some(x=>!x.trim()))
  return [{text:original,collective:false,uncertified:true}];
 return slices.map(x=>({text:x,collective:false}));
}

export function essentialHolyCardParts(id,language,text){
 const original=String(text??"");
 if(!ESSENTIAL_HOLY_CARD_IDS_V1.includes(id)||!["en","fr","la"].includes(language)||!original)return null;
 const starts=STARTS[id]?.[language];
 if(!starts)return Object.freeze(naturalPrayerParts(original).map(p=>Object.freeze(p)));
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
  collective:id==="foundations_hail_mary"&&i===cuts.length-2
 }));
 if(parts.some(p=>!p.text.trim())||parts.map(p=>p.text).join("")!==original)
  return Object.freeze([{text:original,collective:false,uncertified:true}]);
 return Object.freeze(parts.map(p=>Object.freeze(p)));
}
