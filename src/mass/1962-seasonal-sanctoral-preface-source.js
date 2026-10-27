// Exact 1962 Roman Missal 2026 Sanctoral seasonal Preface source gate.
// Pinned Latin Sancti originals: DivinumOfficium commit ad8783641455bae3….
// RGMR 1960 §§482, 489(b), 490(b): seasonal Preface applies when a
// festive principal Mass lacks its own proper Preface. NEVER apply this
// solely from an English title, colour or fixed month/day without a date.
// Exact 2026 selected principal ID rank and vestment suffix from the
// source-audited 365-day resolver, not guessed from the feast title.
const entries=str=>new Map(str.split(" ").map(item=>{
  const [date,rank,colour]=item.split(":");
  return [date,rank+":"+colour];
}));
const paschal=entries("04-13:3:r 04-14:3:r 04-21:3:w 04-22:3:r "+
  "04-24:3:r 04-27:3:w 04-28:3:w 04-29:3:r 04-30:3:w "+
  "05-02:3:w 05-04:3:w 05-05:3:w 05-07:3:r 05-09:3:w 05-12:3:r");
const ascension=entries("05-15:3:w 05-16:3:w 05-18:3:r 05-19:3:w 05-20:3:w");
export const SEASONAL_SANCTORAL_SOURCE_COMMIT=
  "ad8783641455bae38a8eb5782b34241a7b3ff2ef";
export const SEASONAL_SANCTORAL_2026_COUNTS=Object.freeze({
  paschal:paschal.size,ascension:ascension.size,total:paschal.size+ascension.size
});
function gregorianEaster(year){
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4);
  const e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
  const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4;
  const l=(32+2*e+2*i-h-k+7)%7,m=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*m+114)/31);
  return Date.UTC(year,month-1,((h+l-7*m+114)%31)+1);
}
const dayNumber=date=>Date.parse(date+"T00:00:00.000Z");
export function required1962SeasonalSanctoralPrefaceOwner(id,sourcePath,date){
  const v=String(id??"");
  const match=/^sancti:(\d{2}-\d{2}):([1-4]):([a-z]{1,2})$/i.exec(v);
  if(!match||!/^\d{4}-\d{2}-\d{2}$/.test(String(date??""))||
     String(date).slice(5)!==match[1]||
     String(sourcePath??"").toLowerCase()!=="sancti/"+match[1])return null;
  const year=Number(String(date).slice(0,4));
  // This exact original-source screen was performed for the 2026 Ordo.
  // Other years need their own actual resolved celebration identity.
  if(year!==2026)return null;
  const days=Math.round((dayNumber(date)-gregorianEaster(year))/86400000);
  const token=match[2]+":"+match[3].toLowerCase();
  const category=paschal.get(match[1])===token&&days>=8&&days<=38?"PASCHALIS":
    ascension.get(match[1])===token&&days>=40&&days<=47?"ASCENSIO":null;
  if(!category)return null;
  return Object.freeze({
    category,section:category==="PASCHALIS"?"Pasch":"Asc",
    variant:category==="PASCHALIS"?"EASTERTIDE":null,
    originalPath:String(sourcePath),principalId:v,date,
    scope:category==="PASCHALIS"?"SANCTORAL_EASTERTIDE_1962":
      "SANCTORAL_ASCENSION_1962",
    rubric:category==="PASCHALIS"?"RGMR_489_B":"RGMR_490_B"
  });
}
export function originalSanctoralLacksOwnPreface(parsed,owner){
  if(!owner||!(parsed?.map instanceof Map))return false;
  // An original proper-preface directive always outranks a seasonal default.
  const rules=parsed.map.get("Rule")??[];
  if(!Array.isArray(rules))return false;
  return !rules.some(s=>/^(?:\(.*\))?\s*Prefatio\s*=/i.test(String(s).trim()));
}
export function matches1962SeasonalSanctoralSelection(preface,owner){
  if(!owner||!preface||preface.seasonalSanctoralDate!==owner.date||
    preface.prefaceSection!==owner.section||
    preface.recoveryScope!==owner.scope)return false;
  const latin=String(preface.lat??preface.la??"").normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const three=Boolean(String(preface.en??"").trim()&&String(preface.fr??"").trim());
  if(!three)return false;
  if(owner.category==="ASCENSIO")
    return latin.startsWith("de ascensione domini")&&
      latin.includes("qui post resurrectionem suam")&&
      preface.prefaceVariant==null;
  return owner.category==="PASCHALIS"&&
    latin.startsWith("paschalis")&&
    latin.includes("sed in hoc potissimum")&&
    latin.includes("cum pascha nostrum immolatus est christus")&&
    !latin.includes("hac potissimum nocte")&&
    !latin.includes("hac potissimum die")&&
    (latin.match(/potissimum/g)||[]).length===1&&
    preface.prefaceVariant==="EASTERTIDE";
}
