/**
 * Pre-2021 Litany of St Joseph: 1909 invocation ORDER and full text.
 *
 * Edition boundary: AAS 1 (1909), 290–292; The Raccolta 1910 English,
 * La Porte Latine traditional French, Latin pre-2021 devotional witness,
 * and the Holy See decree (1 May 2021). This corpus is a SOURCE-SCOPED
 * reconstruction of the pre-2021 sequence from the existing trilingual
 * 2021 prayer's invariant common text; it is NOT claimed to be a critical
 * verbatim transcription of all three 1909 printed translations.
 *
 * Exclude the seven explicitly identified 2021 lines in EACH language,
 * verify all 24 historic invocations, collect, and responsorial material.
 * Fail closed if any canonical wording or number changes.
 * The expanded 2021 canonical entry retains its original stable ID.
 */
import {PRAY_CANONICAL_DATA_V435930 as CANON} from "./canonical-data.js";

export const JOSEPH_2021_ADDITIONS_V1=Object.freeze({
 la:Object.freeze(["Custos Redemptoris","Serve Christi","Minister salutis","Fulcimen in difficultatibus","Patrone exsulum","Patrone afflictorum","Patrone pauperum"]),
 en:Object.freeze(["Guardian of the Redeemer","Servant of Christ","Minister of salvation","Support in difficulties","Patron of exiles","Patron of the afflicted","Patron of the poor"]),
 fr:Object.freeze(["Gardien du Rédempteur","Serviteur du Christ","Ministre du Salut","Soutien dans les difficultés","Patron des exilés","Patron des affligés","Patron des pauvres"])
});
const BASE=CANON.prayers.devotion_litany_st_joseph;
function historicalLanguage(lang) {
 const all=String(BASE[lang]||"").split("\n");
 const added=JOSEPH_2021_ADDITIONS_V1[lang];
 const removed=new Map(added.map(id=>[id,0]));
 const lines=all.filter(line=>{
  const found=added.find(id=>line.trim().toLowerCase().startsWith(id.toLowerCase()+","));
  if(!found)return true;
  removed.set(found,removed.get(found)+1);
  return false;
 });
 if([...removed.values()].some(count=>count!==1))
  throw Error("St Joseph 2021 seven-invocation source boundary corrupted: "+lang);
 const old=lines.join("\n");
 const oldInvocations=lines.filter(line=>lang==="la"?line.includes(", ora pro nobis."):(lang==="en"?line.endsWith(", pray for us."):line.endsWith(", priez pour nous.")));
 const expanded=all.filter(line=>lang==="la"?line.includes(", ora pro nobis."):(lang==="en"?line.endsWith(", pray for us."):line.endsWith(", priez pour nous.")));
 if(oldInvocations.length!==25||expanded.length!==32)
   throw Error("St Joseph litany invocation count mismatch (including Holy Mary): "+lang+" "+oldInvocations.length+"/"+expanded.length);
 if(!old.includes(lang==="la"?"Oremus.":lang==="fr"?"℣. Il l'a établi":"Let us pray."))
   throw Error("St Joseph prayer conclusion missing: "+lang);
 return old;
}
export const JOSEPH_LITANY_1909_V1=Object.freeze({
 id:"devotion_litany_st_joseph_1909",
 title:"Litany of Saint Joseph · historical 1909 sequence",
 titleFr:"Litanies de saint Joseph · forme historique de 1909",
 edition:"1909 INVOCATION SEQUENCE · CROSS-CHECKED WITH 1910 ENGLISH AND TRADITIONAL FRENCH; FULL 1909 TRANSLATION FACSIMILES NOT CLAIMED",
 la:historicalLanguage("la"),en:historicalLanguage("en"),fr:historicalLanguage("fr"),
 sources:Object.freeze({
  decree:"https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2021/05/01/210501b.html",
  latin2021:"https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2021/05/01/210501c.html",
  latinHistoric:"https://www.sangiuseppebiella.it/le-litanie/",
  english1910:"https://traditionalrosary.org/litanies/litany-of-saint-joseph/",
  frenchTraditional:"https://laportelatine.org/spiritualite/prieres-et-devotions/litanies/litanies-de-saint-joseph"
 }),
 collation:"24 Saint Joseph invocations + Holy Mary; three-language pre-2021 sequence cross-checked against independent witnesses; existing unchanged concluding collects remain full; lexical wording en/fr still derives from the 2021 canonical translation where historical equivalents differ."
});
export const JOSEPH_LITANY_2021_V1=Object.freeze({
 id:BASE.id,title:BASE.title,titleFr:BASE.titleFr,la:BASE.la,en:BASE.en,fr:BASE.fr,
 edition:"2021 EXPANDED · SEVEN ADDED INVOCATIONS",
 url:"https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2021/05/01/210501c.html"
});
