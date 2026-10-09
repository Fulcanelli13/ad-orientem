// 1960 General Rubrics §80: Greater Litanies on April 25;
// only if April 25 is Easter Sunday or Easter Monday transfer to Easter Tuesday.
// Local ordinary may authorize public supplications (§§82-83), NOT arbitrary
// Greater Litany calendar transfers. This module never starts a procession.
export function gregorianEasterDate(year){
  if(!Number.isInteger(year)||year<1900||year>2099)throw new RangeError("LITANY_YEAR_OUT_OF_RANGE");
  const a=year%19,b=Math.floor(year/100),c=year%100;
  const d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25);
  const g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30;
  const i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k+700)%7;
  const m=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*m+114)/31);
  const day=((h+l-7*m+114)%31)+1;
  return new Date(Date.UTC(year,month-1,day));
}
function iso(date){
  return date.toISOString().slice(0,10);
}
function validIso(value){
  if(typeof value!=="string"||!/^(19|20)\d\d-\d\d-\d\d$/.test(value))return false;
  const time=Date.parse(value+"T00:00:00Z");
  return Number.isFinite(time)&&iso(new Date(time))===value;
}
export function majorLitanyDate(year){
  const easter=gregorianEasterDate(year);
  const nominal=new Date(Date.UTC(year,3,25));
  const offset=(nominal-easter)/86400000;
  if(offset===0||offset===1){
    return iso(new Date(easter.getTime()+2*86400000));
  }
  return iso(nominal);
}
export function isMajorLitanyDay(date){
  if(!validIso(date))return false;
  return majorLitanyDate(Number(date.slice(0,4)))===date;
}
export function isLesserRogationDay(date){
  if(!validIso(date))return false;
  const easter=gregorianEasterDate(Number(date.slice(0,4)));
  const offset=(Date.parse(date+"T00:00:00Z")-easter.getTime())/86400000;
  return [36,37,38].includes(offset);
}
export function litanyObservanceOn(date){
  if(isMajorLitanyDay(date))return "MAJOR";
  if(isLesserRogationDay(date))return "MINOR";
  return null;
}
