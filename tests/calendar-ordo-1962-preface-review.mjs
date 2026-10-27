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
// Independently computed seasonal boundaries, the exact reused Sunday
// source and the general-Roman IV-class white feria jointly attest §299
// plus §489(b) / §490(b), not a generic date or colour alone.
for(const [date,path,heading,category,clause] of [
  ["2026-04-15","Tempora/Pasc1-0","Paschalis","PASCHALIS","489_B"],
  ["2026-04-16","Tempora/Pasc1-0","Paschalis","PASCHALIS","489_B"],
  ["2026-04-17","Tempora/Pasc1-0","Paschalis","PASCHALIS","489_B"],
  ["2026-04-20","Tempora/Pasc2-0","Paschalis","PASCHALIS","489_B"],
  ["2026-04-23","Tempora/Pasc2-0","Paschalis","PASCHALIS","489_B"],
  ["2026-05-06","Tempora/Pasc4-0","Paschalis","PASCHALIS","489_B"],
  ["2026-05-08","Tempora/Pasc4-0","Paschalis","PASCHALIS","489_B"],
  ["2026-05-21","Tempora/Pasc6-0","de Ascensione Domini","ASCENSIO","490_B"],
  ["2026-05-22","Tempora/Pasc6-0","de Ascensione Domini","ASCENSIO","490_B"],
]){
  const resolution=sample(date,":feria:4:w",4,"White",heading);
  resolution.proper.data.sourcePath=path;
  const d=review1962PrefaceForCalendarDay(resolution);
  assert.equal(d.status,"RULE_TEXT_AGREE",date+": inherited white feria classification");
  assert.equal(d.expected,category,date);
  assert.equal(d.clause,clause,date);
  assert.equal(d.actual,category,date);
  assert.equal(d.autoPublish,false,date);
  assert.equal(d.changesReader,false,date);
  const falseCases=[
    {...resolution,date:"2026-02-10"},
    {...resolution,proper:{...resolution.proper,data:{...resolution.proper.data,color:"Violet"}}},
    {...resolution,proper:{...resolution.proper,data:{...resolution.proper.data,sourcePath:"Tempora/Pasc3-0"}}},
    {...resolution,day:{main:{id:"sancti:04-15:3:w",rank:3,color:"White"}}},
    {...resolution,day:{main:{id:":feria:4:w",rank:4,color:"White"},selectedMassOption:{path:"Sancti/04-15"}}},
  ];
  for(const candidate of falseCases)
    assert.notEqual(review1962PrefaceForCalendarDay(candidate).basis,
      d.basis,"Unmatched season/source/colour/identity must never inherit "+date);
}
const wrongSource=sample("2026-04-15",":feria:4:w",4,"White","Communis");
wrongSource.proper.data.sourcePath="Tempora/Pasc1-0";
assert.equal(review1962PrefaceForCalendarDay(wrongSource).status,"SOURCE_CONFLICT",
  "Authenticated source-season obligation cannot be silenced by a raw Common Preface");


// Verified source witnesses from the first bulk screen of all 142 ordinary
// Sanctoral raw-Communis cases. These are original donor rule observations,
// NOT certificates or automatic reader/Calendar text replacements.
const {readFileSync}=await import("node:fs");
const witness=JSON.parse(readFileSync(new URL(
  "../data/research/1962-sanctoral-preface-source-screen-20261027.v1.json",
  import.meta.url),"utf8"));
assert.equal(witness.cases.length,142);
const witnessByPath=new Map(witness.cases.map(x=>[x.canonicalSourcePath,x]));
assert.equal(witnessByPath.size,142);
const marianPaths=["02-11","07-02","08-05","08-15","08-22",
  "09-08","09-12","09-15","11-21"];
for(const md of marianPaths){
  const w=witnessByPath.get("Sancti/"+md);
  assert.ok(w?.upstreamRuleTokens.some(token=>/^Prefatio=Maria/.test(token)),
    md+" source lacks original Marian rule attestation");
  const id="sancti:"+md+":3:w";
  const rank=md==="08-15"?1:md==="07-02"||md==="08-22"||
    md==="09-08"||md==="09-15"?2:3;
  const source=sample("2026-"+md,id.replace(":3:",":"+rank+":"),rank,"White","Communis");
  source.proper.data.sourcePath="Sancti/"+md;
  const d=review1962PrefaceForCalendarDay(source);
  assert.equal(d.status,"SOURCE_CONFLICT",md+" missed §495 Marian proper");
  assert.equal(d.expected,"MARIA");
  assert.equal(d.actual,"COMMUNIS");
  assert.equal(d.clause,"495");
  assert.equal(d.basis,"ORIGINAL_MARIAN_PREFATIO_SOURCE_1960");
  assert.equal(d.autoPublish,false);
  assert.equal(d.changesReader,false);
  const renamed={...source,proper:{...source.proper,data:{...source.proper.data,
    sourcePath:"Sancti/11-04"}}};
  assert.equal(review1962PrefaceForCalendarDay(renamed).status,"UNMAPPED",
    "A Marian title/date without exact original source ID/path is not enough");
}
for(const [md,token,basis,rank] of [
  ["08-06","(rubrica 1960)Prefatio=Communis",
    "EXPLICIT_1960_TRANSFIGURATION_COMMON",2],
  ["08-14","Prefatio=Communis","EXPLICIT_ASSUMPTION_VIGIL_COMMON",2]
]){
  const w=witnessByPath.get("Sancti/"+md);
  assert.ok(w?.upstreamRuleTokens.includes(token),md+" missing source version witness");
  const isVigil=md==="08-14";
  const src=sample("2026-"+md,"sancti:"+md+":"+rank+":"+(isVigil?"v":"w"),
    rank,isVigil?"Violet":"White","Communis");
  src.proper.data.sourcePath="Sancti/"+md;
  const d=review1962PrefaceForCalendarDay(src);
  assert.equal(d.status,"RULE_TEXT_AGREE");
  assert.equal(d.expected,"COMMUNIS");
  assert.equal(d.basis,basis);
  assert.equal(d.clause,"498");
  assert.equal(d.autoPublish,false);
  assert.equal(d.changesReader,false);
  if(md==="08-06"){
    const oldVersion=sample("2026-08-06","sancti:08-06:2:w",
      2,"White","de Nativitate Domini");
    oldVersion.proper.data.sourcePath="Sancti/08-06";
    assert.equal(review1962PrefaceForCalendarDay(oldVersion).status,"SOURCE_CONFLICT",
      "A pre-1960 Nativity selector must not supersede 1960 Common");
  }
}
// Two redirect-sensitive cases need further source/edition adjudication.
assert.equal(witness.additionalRedirectOwnerCases.length,2);
assert.equal(witness.cases.filter(x=>x.upstreamRuleTokens.length>0).length,11);
console.log("PASS 142-original-source sanctoral witness: nine §495 Marian conflicts, two qualified Common agreements, two redirect holds");

console.log("PASS 1962 Preface source audit: owner, principal Mass, category, trilingual, regional exclusion, conflict, exceptions");
