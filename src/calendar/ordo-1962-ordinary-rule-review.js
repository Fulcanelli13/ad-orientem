// Read-only decisions from the universal 1960 General Rubrics (1962 Missal).
// Do NOT mutate selected Mass, Reader ceremonies, Office or local Ordo.
import {calendarMassColour} from "./colour-projection.js";
export const ORDO_1962_RULE_REVIEW_VERSION="ao-1962-ordo-rule-review-v1";
export const RULES_URL="https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html";
export const BREVIARY_RULES_URL="https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html";
const withheld=reason=>Object.freeze({status:"WITHHELD",value:null,reason});
const result=(value,clause,scope,sourceUrl=RULES_URL)=>Object.freeze({
  status:"RULE_SUPPORTED",value,clause,sourceUrl,scope
});
const iso=id=>{
  if(typeof id!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(id))return false;
  const d=new Date(id+"T12:00:00.000Z");
  return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===id;
};
const rank=v=>{
  if([1,2,3,4].includes(Number(v)) && /^\d$/.test(String(v)))return Number(v);
  const match=String(v??"").trim().toUpperCase().match(/^(IV|III|II|I)(?:\s|[.\-]|$)/);
  return match?({I:1,II:2,III:3,IV:4})[match[1]]:null;
};
const principalId=id=>/^(?:sancti|tempora|commune):[A-Za-z0-9:-]+$/.test(id)||id===":feria:4:w";
const principalClass=id=>{
  const match=id.match(/:([1-4]):[a-z]$/i);
  return match?Number(match[1]):null;
};
const sourceKind=id=>id.startsWith("sancti:")?"SANCTORAL":
  id.startsWith("tempora:")?"TEMPORAL":id===":feria:4:w"?"GENERIC_FERIA":"OTHER";
const hasVotiveOrRequiemProfile=p=>/(?:votive|requiem|dead)/i.test(String(p?.riteProfile??p?.profile??""));
const absent=(reason)=>Object.freeze({gloria:withheld(reason),credo:withheld(reason),
  scope:"GENERAL_ROMAN_1962",authority:RULES_URL,nonInstructional:true});
/**
 * Small *positive* source-indexed rules. A valid 1962 source ID, principal
 * feast class, same-date ready Calendar resolution and the principal Proper
 * are prerequisites. Absence of a match is not "no Gloria/Credo".
 *
 * RGMR §475a: the Credo is said on Sundays, even when a feast displaces
 * their Office. §475b: I-class feasts; §476d: III/IV class festive Masses.
 * §432b: Gloria is omitted at Masses celebrated in violet.
 *
 * For the Gloria on an ordinary non-violet day, RGMR §§431-432 require
 * knowledge of whether the Office says Te Deum; rank/colour alone is
 * insufficient, so this engine leaves that flag unresolved.
 */
export function review1962OrdinaryForCalendarDay(resolution){
  const date=resolution?.date,day=resolution?.day?.main,proper=resolution?.proper?.data;
  if(!iso(date)||resolution?.status!=="ready"||!day||!proper||
     resolution?.proper?.status!=="ready"||!String(proper.sourcePath??"").trim())
    return absent("SAME_DATE_CANONICAL_PROPER_REQUIRED");
  const id=String(day.id??""),klass=rank(day.rank);
  if(!principalId(id)||!klass||principalClass(id)!==klass)
    return absent("SOURCE_ID_AND_CLASS_MUST_MATCH");
  if(/^tempora:Quad6-5r:/i.test(id))
    return absent("GOOD_FRIDAY_NOT_MASS");
  if(hasVotiveOrRequiemProfile(proper))
    return absent("ALTERNATE_MASS_FORM_REQUIRES_OWN_DECISION");
  const sunday=new Date(date+"T12:00:00.000Z").getUTCDay()===0;
  const colour=String(calendarMassColour(resolution)||"").trim().toLowerCase();
  const violet=["violet","purple","violaceus"].includes(colour);
  const black=["black","noir","niger"].includes(colour);
  let gloria=withheld("OFFICE_TE_DEUM_NOT_ATTESTED");
  let credo=withheld("FEAST_OR_SUNDAY_CATEGORY_NOT_ATTESTED");
  // Black as actual Mass colour (not Good Friday action) also omits Gloria;
  // do not infer this from purple/black visual day-phase palettes.
  if(violet)gloria=result(false,"RGMR_432_B","MASS_COLOUR_VIOLET");
  if(black)gloria=result(false,"RGMR_432_D","BLACK_MASS_CONTEXT");
  // The Breviary (237c) explicitly has Te Deum on *all feasts*.
  // A source-resolved sanctoral I/II/III feast therefore uses Gloria in
  // nonviolet vestments under the Missal (431a); IV-class commemorations
  // are not silently promoted into such feasts.
  if(!violet&&!black&&sourceKind(id)==="SANCTORAL"&&klass<=3)
    gloria=result(true,"BR_237_C_AND_RGMR_431_A","SANCTORAL_FEAST_TE_DEUM",BREVIARY_RULES_URL);
  // A IV-class green weekday of the Sundays-after-Pentecost cycle is a
  // "feria per annum": Office Te Deum is *omitted* (Breviary 238c).
  // Unlike an ordinary Sunday, it carries neither Gloria nor Credo.
  // Source-ID/date/class/colour are all required; no calendar-name guess.
  const ordinaryPentecostFeria=!sunday&&klass===4&&colour==="green"&&
    (/^tempora:Pent\d{1,2}-[1-6]:4:g$/i.test(id)||sourceKind(id)==="GENERIC_FERIA");
  if(ordinaryPentecostFeria)
    gloria=result(false,"BR_238_C_AND_RGMR_432_A","IV_CLASS_PER_ANNUM_FERIA",BREVIARY_RULES_URL);
  if(sunday)credo=result(true,"RGMR_475_A","SUNDAY");
  else if(ordinaryPentecostFeria)credo=result(false,"RGMR_475_476","IV_CLASS_PER_ANNUM_FERIA");
  else if(sourceKind(id)==="SANCTORAL"){
    if(klass===1)credo=result(true,"RGMR_475_B","FIRST_CLASS_SANCTORAL_FEAST");
    else if(klass>=3)credo=result(false,"RGMR_476_D","THIRD_OR_FOURTH_CLASS_SANCTORAL_FEAST");
    else if(klass===2&&/^sancti:10-07:2:/i.test(id))
      credo=result(true,"RGMR_475_C","OUR_LADY_OF_THE_ROSARY_SOURCE_ID");
    // A second-class Lord/BVM feast needs its *specific identity*, not
    // a vernacular title or the colour white, to invoke §475(c).
  }
  return Object.freeze({date,principalId:id,rank:klass,scope:"GENERAL_ROMAN_1962",
    authority:RULES_URL,gloria,credo,nonInstructional:true,
    prefaceRule:"RGMR_482_499_REQUIRE_SOURCE_SPECIFIC_SELECTION"});
}
