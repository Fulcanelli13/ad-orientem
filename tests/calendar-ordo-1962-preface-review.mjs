import assert from "node:assert/strict";
import {classify1962PrefaceHeading,review1962PrefaceForCalendarDay,
  PREFACE_RUBRIC_SOURCE} from "../src/calendar/ordo-1962-preface-review.js";
const sample=(date,id,rank,color,head,{lang=true,riteProfile="ordinary_mass"}={})=>({
  date,status:"ready",day:{main:{id,rank,color}},
  proper:{status:"ready",data:{
    sourcePath:id.startsWith("sancti")?"Sancti/10-07":"Tempora/Pent20-0",
    color,riteProfile,
    preface:{lat:head+"\nVere dignum",en:lang?"The Preface":"",fr:lang?"La Préface":""},
  }}
});
const check=(id,date,rank,color,heading,expected,clause)=>{
  const d=review1962PrefaceForCalendarDay(sample(date,id,rank,color,heading));
  assert.equal(d.expected,expected,date+": expected source-selected category");
  assert.equal(d.actual,expected,date+": actual Latin heading classification");
  assert.equal(d.clause,clause,date+": expected 1960 rubric section");
  assert.equal(d.status,"RULE_TEXT_AGREE",date+": "+JSON.stringify(d));
  assert.equal(d.sourceUrl,PREFACE_RUBRIC_SOURCE);
  assert.equal(d.autoPublish,false);
  assert.equal(d.changesReader,false);
};
check("sancti:01-01:1:w","2026-01-01",1,"White","de Nativitate Domini","NATIVITATE","484_A");
check("sancti:01-06:1:w","2026-01-06",1,"White","de Epiphania Domini","EPIPHANIA","485_A");
check("tempora:Epi1-0:2:w","2026-01-11",2,"White","de Epiphania Domini","EPIPHANIA","485_B");
check("tempora:Epi2-0:2:g","2026-01-18",2,"Green","de sanctissima Trinitate","TRINITATE","494_B");
check("tempora:Quadp1-0:2:v","2026-02-01",2,"Violet","de sanctissima Trinitate","TRINITATE","494_B");
check("tempora:Quad4-0:1:pv","2026-03-15",1,"Rose","de Quadragesima","QUADRAGESIMA","486_A");
check("tempora:Quad6-4r:1:w","2026-04-02",1,"White","de Sancta Cruce","CRUX","487_A");
check("tempora:Pent01-0r:1:w","2026-05-31",1,"White","de sanctissima Trinitate","TRINITATE","494_A");
check("sancti:02-24:2:r","2026-02-24",2,"Red","de Apostolis","APOSTOLI","497");
check("sancti:06-29:1:r","2026-06-29",1,"Red","de Apostolis","APOSTOLI","497");
check("sancti:07-01:1:r","2026-07-01",1,"Red","de Sancta Cruce","CRUX","487_A");
check("sancti:09-14:2:r","2026-09-14",2,"Red","de Sancta Cruce","CRUX","487_A");
check("sancti:10-DU:1:w","2026-10-25",1,"White","de D.N. Jesu Christi Rege","CHRISTUS_REX","492");
check("sancti:12-25m1:1:w","2026-12-25",1,"White","de Nativitate Domini","NATIVITATE","484_A");
check("sancti:02-02:2:w","2026-02-02",2,"White","de Nativitate Domini","NATIVITATE","484_A");
check("sancti:03-19:1:w","2026-03-19",1,"White","de Sancto Joseph","JOSEPH","496");
check("sancti:03-25:1:w","2026-03-25",1,"White","de Beata Maria Virgine","MARIA","495");
check("sancti:05-01r:1:w","2026-05-01",1,"White","de Sancto Joseph","JOSEPH","496");
check("sancti:10-07:2:w","2026-10-07",2,"White","de Beata Maria Virgine","MARIA","495");
check("sancti:10-DU:1:w","2026-10-25",1,"White","de Jesu Christo Rege","CHRISTUS_REX","492");
check("sancti:10-28:2:r","2026-10-28",2,"Red","de Apostolis","APOSTOLI","497");
check("sancti:12-08:1:w","2026-12-08",1,"White","de Beata Maria Virgine","MARIA","495");
check("tempora:Pent02-5:1:w","2026-06-12",1,"White","de sacratissimo Cordis Jesu","COR_IESU","491");
check("tempora:Pasc5-4:1:w","2026-05-14",1,"White","de Ascensione Domini","ASCENSIO","490_A");
check("tempora:Pasc7-0:1:r","2026-05-24",1,"Red","de Spiritu Sancto","SPIRITU","493_A");
check("tempora:Pasc0-0:1:w","2026-04-05",1,"White","Paschalis","PASCHALIS","489_A");
check("tempora:Pasc7-6:1:r","2026-05-30",1,"Red","de Spiritu Sancto","SPIRITU","493_A");
check("tempora:Pent20-0:2:g","2026-10-11",2,"Green","de sanctissima Trinitate","TRINITATE","494_B");
check("tempora:Adv2-0:1:v","2026-12-06",1,"Violet","de sanctissima Trinitate","TRINITATE","494_B");
check("tempora:Quad5-0:1:v","2026-03-22",1,"Violet","de sancta Cruce","CRUX","487_A");
check("tempora:Quadp3-3:1:v","2026-02-18",1,"Violet","de Quadragesima","QUADRAGESIMA","486_A");
check(":feria:4:w","2026-10-26",4,"Green","Communis","COMMUNIS","498");
check("sancti:12-26:2:r","2026-12-26",2,"Red","de Nativitate Domini","NATIVITATE","484_B");
const conflict=review1962PrefaceForCalendarDay(sample("2026-10-07","sancti:10-07:2:w",2,"White","Communis"));
assert.equal(conflict.status,"SOURCE_CONFLICT");
assert.equal(conflict.expected,"MARIA");
assert.equal(conflict.actual,"COMMUNIS");
assert.equal(conflict.autoPublish,false);
const pent=review1962PrefaceForCalendarDay(sample("2026-05-24","tempora:Pasc7-0:1:r",1,"Red","Communis"));
assert.equal(pent.status,"SOURCE_CONFLICT");
const francais=review1962PrefaceForCalendarDay(sample("2026-12-08","sancti:12-08:1:w",1,"White","de Beata Maria Virgine",{lang:false}));
assert.equal(francais.status,"TRANSLATIONS_INCOMPLETE");
assert.equal(francais.trilingualTextComplete,false);
const unknown=review1962PrefaceForCalendarDay(sample("2026-10-15","sancti:10-15:3:w",3,"White","Communis"));
assert.equal(unknown.status,"UNMAPPED","Unlisted saint must not infer a Common Preface");
const noTitle=review1962PrefaceForCalendarDay(sample("2026-10-25","sancti:10-DU:1:w",1,"White","unclassified header"));
assert.equal(noTitle.status,"UNCLASSIFIED_TEXT");
const comm=sample("2026-10-11","tempora:Pent20-0:2:g",2,"Green","de sanctissima Trinitate");
const withMarianCommemoration={...comm,day:{...comm.day,
  commemorations:[{id:"sancti:10-11:2:w",title:"Maternity of the BVM"}]}};
assert.equal(review1962PrefaceForCalendarDay(withMarianCommemoration).expected,"TRINITATE",
  "A commemoration does not bring a Preface under RGMR §483");
assert.equal(review1962PrefaceForCalendarDay({...comm,status:"failed"}).status,"WITHHELD");
assert.equal(review1962PrefaceForCalendarDay(sample("2026-04-03","tempora:Quad6-5r:1:b",1,"Black","Communis")).status,"NOT_MASS");
assert.equal(review1962PrefaceForCalendarDay(sample("2026-10-26",":feria:4:w",4,"Green","Communis",{riteProfile:"votive_mass"})).status,"WITHHELD");
assert.equal(review1962PrefaceForCalendarDay(sample("2026-01-08",":feria:4:w",4,"White","Communis")).status,"UNMAPPED",
  "Generic feria in another season cannot inherit October's Common Preface");
assert.equal(review1962PrefaceForCalendarDay(sample("2026-10-07","sancti:10-07:2:w",1,"White","de Beata Maria Virgine")).status,
 "WITHHELD","Principal rank must match canonical source identity");
assert.equal(review1962PrefaceForCalendarDay(sample("2026-02-31","sancti:02-02:2:w",2,"White","de Nativitate Domini")).status,
 "WITHHELD","Impossible civil date must not be accepted");
const placeholder=sample("2026-10-07","sancti:10-07:2:w",2,"White","de Beata Maria Virgine");
placeholder.proper.data.preface.fr="@unresolved";
assert.equal(review1962PrefaceForCalendarDay(placeholder).status,"TRANSLATIONS_INCOMPLETE",
 "Unresolved source marker must not count as a translated Preface");
assert.equal(classify1962PrefaceHeading("de sacratíssimo Cordis Jesu"),"COR_IESU");

// 2020 optional-preface authority boundary: the original 1962 general cycle
// must never quietly certify these later ad-libitum Prefaces as mandatory.
// Sources: CDF Quo magis (22 February 2020) and its accompanying Note.
const baptist2020=sample("2026-06-24","sancti:06-24:1:w",1,"White","de S. Joannis Baptistæ");
baptist2020.proper.data.sourcePath="Sancti/06-24";
const baptistDecision=review1962PrefaceForCalendarDay(baptist2020);
assert.equal(baptistDecision.status,"UNMAPPED","St John the Baptist optional 2020 Preface is not the mandatory 1962 baseline");
assert.equal(baptistDecision.autoPublish,false);
assert.equal(baptistDecision.changesReader,false);
const dedication2020=sample("2026-11-09","sancti:11-09:2:w",2,"White","in Dedicatione Ecclesiae");
dedication2020.proper.data.sourcePath="Sancti/11-09";
const dedicationDecision=review1962PrefaceForCalendarDay(dedication2020);
assert.equal(dedicationDecision.status,"UNMAPPED","Dedication optional/particular Preface requires its own authority");
assert.equal(dedicationDecision.autoPublish,false);
assert.equal(dedicationDecision.changesReader,false);

// Full-year source regression: these two *named* non-Trinity headings are
// not equivalent to the 1960 §494(b) Sunday Preface.
for(const [date,id,sourcePath,heading,actual] of [
  ["2026-06-07","tempora:Pent02-0r:2:g","Tempora/Pent02-0r","de Nativitate Domini","NATIVITATE"],
  ["2026-06-14","tempora:Pent03-0r:2:g","Tempora/Pent03-0r","de sacratissimo Cordis Jesu","COR_IESU"]
]){
  const resolution=sample(date,id,2,"Green",heading);
  resolution.proper.data.sourcePath=sourcePath;
  const decision=review1962PrefaceForCalendarDay(resolution);
  assert.equal(decision.status,"SOURCE_CONFLICT",date+": wrong named raw Preface cannot be shown as source-matched");
  assert.equal(decision.expected,"TRINITATE");
  assert.equal(decision.actual,actual);
  assert.equal(decision.autoPublish,false);
  assert.equal(decision.changesReader,false);
}
// Even an attested Paschal reused Proper does not establish the independent
// season/date permission when the principal source ID is only generic feria.
for(const [date,path,heading] of [
  ["2026-04-15","Tempora/Pasc1-0","Paschalis"],
  ["2026-05-21","Tempora/Pasc6-0","de Ascensione Domini"]
]){
  const resolution=sample(date,":feria:4:w",4,"White",heading);
  resolution.proper.data.sourcePath=path;
  const decision=review1962PrefaceForCalendarDay(resolution);
  assert.equal(decision.status,"UNMAPPED",date+": reused white feria requires independent seasonal evidence");
  assert.equal(decision.autoPublish,false);
  assert.equal(decision.changesReader,false);
}

console.log("PASS 1962 Preface source audit: owner, principal Mass, category, trilingual, regional exclusion, conflict, exceptions");
