import {addDaysIso,buildLiturgicalYear} from "../calendar/liturgical-year.js";

// A given liturgical title may fall on a different date when transferred.
// These ids describe the actual source celebration, never the civil calendar
// alone. Do not classify every white Mass as Marian or every martyrs' feast as
// one of the Apostles.
export const APOSTLE_1962_FEAST_IDS=Object.freeze(new Set([
 "01-25","02-22","02-24","05-11","06-11","06-29","06-30",
 "07-25","08-24","09-21","10-28","11-30","12-21","12-27"
]));
export const ST_JOSEPH_1962_FEAST_IDS=Object.freeze(new Set(["03-19","05-01"]));

export function temporal1962PrefaceChoice(day,{allowLocalAdventPreface=false}={}){
 const date=String(day?.date??"");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
 const cycle=buildLiturgicalYear(date);
 const period=cycle.currentPeriod?.id??"";
 const mainId=String(day?.day?.main?.id??"");
 const feast=/^sancti:(\d\d-\d\d):/i.exec(mainId)?.[1]??null;

 // A major proper feast outranks the seasonal Preface (including Lent).
 if(feast&&ST_JOSEPH_1962_FEAST_IDS.has(feast))return {section:"Joseph",formulary:feast,reason:"ST_JOSEPH_PROPER"};
 // During the Christmas octave the Nativity Preface supersedes saints'
 // non-divine-mystery Prefaces. Respect an already non-Common Proper.
 if(period==="christmas")return {section:"Nat",reason:"CHRISTMAS_SEASON"};
 if(feast&&APOSTLE_1962_FEAST_IDS.has(feast))return {section:"Apostolis",formulary:feast,reason:"APOSTLE_PROPER"};
 // The Purification uses the Nativity Preface, not the Marian Preface.
 if(feast==="02-02")return {section:"Nat",reason:"PURIFICATION_EXCEPTION"};

 // Vigilia Pentecostes precedes the octave but already uses the Holy
 // Ghost Preface; the Ascension seasonal Preface stops the day before it.
 if(period==="ascension"&&date===addDaysIso(cycle.pentecost,-1)){
   return {section:"Spiritu",reason:"PENTECOST_VIGIL"};
 }
 const sections={
  epiphany:"Epi",lent:"Quad",easter:"Pasch",ascension:"Asc",
  pentecost:"Spiritu"
 };
 if(sections[period])return {section:sections[period],reason:"SEASONAL_"+period.toUpperCase(),
  ...(period==="easter"?{easterVariant:date<=addDaysIso(cycle.easter,6)?"OCTAVE":"ORDINARY"}:{})};
 // [Adv] is an optional/local Preface in the 1962 printing tradition,
 // particularly France and Belgium; not a universal 1962 replacement.
 if(period==="advent"&&allowLocalAdventPreface)
   return {section:"Adv",reason:"REGIONALLY_AUTHORIZED_ADVENT_VARIANT"};
 return null;
}
