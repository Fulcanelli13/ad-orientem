// Calendar headline projection only. Never change the underlying 1962 DayResolver,
// Mass selection, seasonal Proper, rank, colour, or commemorations.
// Decisions key off original Missal identifiers rather than translated titles.
const observanceNames=Object.freeze({
  "tempora:Pasc6-6:1:r":["Vigil of Pentecost","Vigile de la Pentecôte"],
  "sancti:12-02:3:r":["Saint Bibiana, Virgin and Martyr","Sainte Bibiane, vierge et martyre"],
  "tempora:Adv2-6:3:v":["Saturday after the Second Sunday of Advent","Samedi après le deuxième dimanche de l’Avent"],
});
const bvmSaturdayIds=new Set([
  "commune:C10b:4:w","commune:C10c:4:w",
  "commune:C10Pasc:4:w","commune:C10t:4:w",
]);
export function calendarObservanceHeadline(resolution,language="en"){
  if(!resolution||resolution.status==="failed")return null;
  const id=String(resolution?.day?.main?.id||"");
  const french=String(language).toLowerCase().startsWith("fr");
  const pair=observanceNames[id];
  if(pair)return pair[french?1:0];
  if(!bvmSaturdayIds.has(id))return null;
  // The same Common formulary may be chosen as a votive Mass on other dates;
  // do not misrepresent it as a Saturday office then.
  const date=String(resolution.date||"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+"T12:00:00Z").getUTCDay()!==6)return null;
  return french?"Sainte Vierge Marie le samedi":"Blessed Virgin Mary on Saturday";
}
