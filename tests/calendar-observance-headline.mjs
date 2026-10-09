import assert from "node:assert/strict";
import {calendarObservanceHeadline} from "../src/calendar/observance-headline.js";
const sample=(date,id,extra={})=>({date,status:"ready",day:{main:{id,title:"Source-formulary headline"},...extra}});
for(const [date,id] of [
 ["2024-05-18","tempora:Pasc6-6:1:r"],
 ["2027-05-15","tempora:Pasc6-6:1:r"]
]){
 assert.equal(calendarObservanceHeadline(sample(date,id)),"Vigil of Pentecost");
 assert.equal(calendarObservanceHeadline(sample(date,id),"fr"),"Vigile de la Pentecôte");
}
for(const [date,id] of [
 ["2024-02-03","commune:C10c:4:w"],
 ["2024-04-20","commune:C10Pasc:4:w"],
 ["2024-06-08","commune:C10t:4:w"],
 ["2027-01-02","commune:C10b:4:w"],
 ["2027-11-27","commune:C10t:4:w"]
]){
 assert.equal(calendarObservanceHeadline(sample(date,id)),"Blessed Virgin Mary on Saturday");
 assert.equal(calendarObservanceHeadline(sample(date,id),"fr"),"Sainte Vierge Marie le samedi");
}
assert.equal(calendarObservanceHeadline(sample("2024-12-02","sancti:12-02:3:r")),"Saint Bibiana, Virgin and Martyr");
assert.equal(calendarObservanceHeadline(sample("2027-12-02","sancti:12-02:3:r"),"fr"),"Sainte Bibiane, vierge et martyre");
assert.equal(calendarObservanceHeadline(sample("2024-12-14","tempora:Adv2-6:3:v")),"Saturday after the Second Sunday of Advent");
assert.equal(calendarObservanceHeadline(sample("2024-12-14","tempora:Adv2-6:3:v"),"fr"),"Samedi après le deuxième dimanche de l’Avent");
assert.equal(calendarObservanceHeadline(sample("2024-06-09","commune:C10t:4:w")),null,"Sunday votive Mass cannot become BVM Saturday");
assert.equal(calendarObservanceHeadline(sample("2024-06-08","commune:C10t:4:w",{selectedMassOption:{id:"explicit"}})),null,"Explicit Mass option must win");
assert.equal(calendarObservanceHeadline(sample("2024-10-27","sancti:10-DU:1:w")),null,"Do not alter Christ the King or hide missing commemoration correction");
assert.equal(calendarObservanceHeadline({status:"failed"}),null);
assert.equal(calendarObservanceHeadline(sample("2024-03-25","tempora:Quad6-1:1:v")),null,"No blanket seasonal-title overrides");
console.log("PASS 1962 original-ID Calendar headline projection, English/French and explicit Mass guards");
