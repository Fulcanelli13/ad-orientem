// 1962 All Souls is a Mass for the Dead even when the host selects the
// CALENDAR Mass of the day, rather than its generic REQUIEM category.
// Source-bound only: never infer Requiem conditions from November 2 alone.
// Missal 1960 §402 and Ritus servandus XIII.
// https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html
export const ALL_SOULS_1962_FORMULARIES=Object.freeze([
 "Sancti/11-02m1","Sancti/11-02m2","Sancti/11-02m3"
]);

export function is1962AllSoulsCalendarMass(resolvedMass,proper=null){
 const r=resolvedMass??{};
 const p=proper?.data??proper??r.proper?.data??r.proper??{};
 const date=String(r.date??"");
 const id=String(r.calendarDay?.id??"");
 const path=String(p.sourcePath??proper?.sourcePath??"");
 return /^\d{4}-11-02$/.test(date)&&id==="sancti:11-02m1:1:b"&&
   path==="Sancti/11-02m1"&&
   [null,"","mass_of_day"].includes(r.requestedCelebrationId??null)&&
   [null,"","mass_of_day"].includes(r.celebrationId??null)&&
   ["CALENDAR","MASS_OF_DAY",""].includes(String(r.celebrationType??"").toUpperCase());
}

export function allSouls1962RequiemOverlay(resolvedMass,proper=null){
 return is1962AllSoulsCalendarMass(resolvedMass,proper)
   ?Object.freeze(["REQUIEM"]):Object.freeze([]);
}
