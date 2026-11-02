import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";
import {APPROVED_MASS_INLINE_GABC} from "./reader-inline-chant-approved.js";
export const INLINE_CHANT_SCHEMA="ao-mass-inline-approved-gabc-v1";
export const INLINE_CHANT_SUNG_FORMS=Object.freeze(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
export const INLINE_CHANT_SELECTION_KEYS=Object.freeze([
 "KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI",
 "DISMISSAL","PREFACE_DIALOGUE","PATER_NOSTER","COLLECT","POSTCOMMUNION",
 "GOSPEL","MASS_RESPONSES","ASPERSION","PROPER_INTROIT","PROPER_GRADUAL",
 "PROPER_ALLELUIA","PROPER_TRACT","PROPER_SEQUENCE","PROPER_OFFERTORY",
 "PROPER_COMMUNION","SPECIAL_RITE"
]);
const keys=new Set(INLINE_CHANT_SELECTION_KEYS);
const cuePattern=/^(?:AO\.SM\.C\d{4}|GF-SOP-\d\d-[KR]|GF-X-52[123])$/;
const normalized=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/[æœ]/gi,c=>c.toLowerCase()==="æ"?"ae":"oe").replace(/[℣℟]/g,"")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const identical=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const scoreCueList=score=>Array.isArray(score?.sourceCueIds)?score.sourceCueIds:
 score?.sourceCueId?[score.sourceCueId]:[];
const selectedId=(key,settings,fallback)=>{
 const selected=settings?.[key];
 return typeof selected==="string"&&selected?selected:
  key==="DISMISSAL"?String(fallback??""):"";
};
