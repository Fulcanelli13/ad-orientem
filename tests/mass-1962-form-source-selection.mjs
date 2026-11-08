import assert from "node:assert/strict";
import {select1962CommemorationsForMassForm as select} from "../src/mass/1962-commemoration-form-source.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {assessPrintableProper,renderPrintableProperHtml} from "../src/calendar/print-proper.js";

const tr=n=>({lat:"Oratio latina "+n,en:"English prayer "+n,fr:"Prière française "+n});
const one=tr("principal"),extra=tr("Marian");
const base={
  sourcePath:"Tempora/Pent20-0",riteProfile:"ordinary_mass",
  name:"XX Sunday after Pentecost",
  introit:tr("introit"),epistle:tr("epistle"),gradual:tr("gradual"),gospel:tr("gospel"),
  offertory:tr("offertory"),preface:tr("preface"),communion:tr("communion"),
  collects:[one,extra],secrets:[one,extra],postcommunions:[one,extra],
  calendarCommemorations:[{path:"Sancti/10-11",name:"Divine Maternity",inseparable:false}],
};
const day={
  date:"2026-10-11",status:"ready",
  day:{main:{id:"tempora:Pent20-0:2:g",rank:2,title:"XX Sunday after Pentecost",path:"Tempora/Pent20-0"},
    commemorations:[{id:"sancti:10-11:2:w",rank:2,path:"Sancti/10-11",title:"Divine Maternity"}]},
  proper:{status:"ready",data:base}
};
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const original={status:"READY",data:base};
  const selected=select({proper:original,calendarResolution:day,form});
  assert.equal(selected.status,"CERTIFIED",form);
  const p=selected.proper.data;
  const expected=form==="LOW"?2:1;
  assert.equal(p.commemorationFormDecision.appliedCount,expected-1,form);
  assert.equal(p.collects.length,expected,form);
  assert.equal(p.secrets.length,expected,form);
  assert.equal(p.postcommunions.length,expected,form);
  assert.equal(p.calendarCommemorations.length,1,"Calendar is preserved");
  assert.equal(p.appliedCommemorations.length,expected-1);
  assert.deepEqual(p.collects[0],one,"Principal prayer must not be replaced");
  assert.equal(properToReaderSlots(p,{language:"fr"}).slots.COLLECT_SET.data.paragraphs.length,expected);
  assert.equal(properToReaderSlots(p,{language:"en"}).slots.SECRET_SET.data.paragraphs.length,expected);
  const printed=assessPrintableProper(day,{language:"fr",massForm:form});
  assert.equal(printed.ok,true,form+": "+printed.reason);
  assert.equal(printed.sections.filter(x=>x.kind==="collect").length,expected,form);
  const html=renderPrintableProperHtml(day,{language:"en",massForm:form});
  assert.equal((html.match(/<h2 id="section-\d+">Collect/g)||[]).length,expected);
}
// Explicit source witnesses: a displaced Sunday and two Advent ferias
// are privileged in ALL four forms under 1960 General Rubrics §108.
const privileged=[
  ["2026-11-01","Sancti/11-01","sancti:11-01:1:w",1,
    "Tempora/Pent23-0","tempora:Pent23-0:2:g",2,
    "PRIVILEGED_SUNDAY_UNDER_I_CLASS_SANCTORAL"],
  ["2026-11-30","Sancti/11-30","sancti:11-30:2:r",2,
    "Tempora/Adv1-1","tempora:Adv1-1:3:v",3,
    "PRIVILEGED_ADVENT_FERIA_UNDER_SANCTORAL"],
  ["2026-12-08","Sancti/12-08","sancti:12-08:1:w",1,
    "Tempora/Adv2-2","tempora:Adv2-2:3:v",3,
    "PRIVILEGED_ADVENT_FERIA_UNDER_SANCTORAL"]
];
for(const [date,mainPath,mainId,mainRank,commPath,commId,commRank,scope] of privileged){
  const source={...base,sourcePath:mainPath,calendarCommemorations:[{path:commPath,prayerSourcePath:commPath.includes("/Adv")?commPath.replace(/-[1-6]$/,"-0"):commPath,name:"Source commemoration"}]};
  const sourceDay={...day,date,day:{main:{id:mainId,rank:mainRank,path:mainPath,title:"Principal"},
    commemorations:[{id:commId,rank:commRank,path:commPath,title:"Commemoration"}]},
    proper:{status:"ready",data:source}};
  for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
    const result=select({proper:source,calendarResolution:sourceDay,form});
    assert.equal(result.status,"CERTIFIED",date+" / "+form+": "+result.reason);
    assert.equal(result.decision.scope,scope);
    assert.equal(result.decision.appliedCount,1,date+" / "+form);
    assert.deepEqual(["collects","secrets","postcommunions"].map(k=>result.proper[k].length),[2,2,2]);
    assert.equal(result.proper.calendarCommemorations.length,1);
    const mapped=properToReaderSlots(result.proper,{language:"fr"});
    assert.equal(mapped.slots.COLLECT_SET.data.paragraphs.length,2);
    assert.equal(assessPrintableProper(sourceDay,{language:"en",massForm:form}).ok,true);
  }
  if(commPath.includes("/Adv")){
    const poisoned={...source,calendarCommemorations:[{
      ...source.calendarCommemorations[0],prayerSourcePath:"Tempora/Adv4-0"
    }]};
    assert.equal(select({proper:poisoned,calendarResolution:sourceDay,form:"LOW"}).reason,
      "RUBRICAL_CLASSIFICATION_PENDING","Unrelated Advent Sunday alias cannot be silently trusted");
  }
  const differentDay={...sourceDay,date:"2026-10-20"};
  if(date==="2026-11-01"){
    assert.equal(select({proper:source,calendarResolution:differentDay,form:"SOLEMN"}).reason,
      "RUBRICAL_CLASSIFICATION_PENDING","Sunday cannot inherit classification on weekday");
  }
}

// 19 March (St Joseph) and 25 March (Annunciation), 2026: the
// III-class Lent / Passiontide feria is a privileged commemoration even
// when the universal I-class Sanctoral feast takes the Mass.
for(const [date,mainPath,commPath] of [
  ["2026-03-19","Sancti/03-19","Tempora/Quad4-4"],
  ["2026-03-25","Sancti/03-25","Tempora/Quad5-3"],
]){
  const mainId="sancti:"+mainPath.slice(-5)+":1:w";
  const commId="tempora:"+commPath.slice("Tempora/".length)+":3:v";
  const source={...base,sourcePath:mainPath,
    calendarCommemorations:[{path:commPath,prayerSourcePath:commPath,name:"Lenten feria"}]};
  const witness={...day,date,day:{
    main:{id:mainId,rank:1,path:mainPath,title:"I-class feast"},
    commemorations:[{id:commId,rank:3,path:commPath,title:"III-class Lent feria"}]},
    proper:{status:"ready",data:source}};
  for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
    const result=select({proper:source,calendarResolution:witness,form});
    assert.equal(result.status,"CERTIFIED",date+"/"+form+": "+result.reason);
    assert.equal(result.decision.scope,"PRIVILEGED_LENT_PASSION_FERIA_UNDER_I_CLASS_SANCTORAL");
    assert.equal(result.decision.appliedCount,1);
    for(const field of ["collects","secrets","postcommunions"])
      assert.equal(result.proper[field].length,2,date+"/"+form+"/"+field);
    for(const language of ["en","fr"]){
      const slots=properToReaderSlots(result.proper,{language}).slots;
      for(const key of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]){
        assert.equal(slots[key].status,"READY",date+"/"+form+"/"+language+"/"+key);
        assert.equal(slots[key].data.paragraphs.length,2);
      }
    }
    assert.equal(assessPrintableProper(witness,{language:"fr",massForm:form}).ok,true);
  }
  assert.equal(select({proper:{...source,
    calendarCommemorations:[{path:commPath,prayerSourcePath:"Tempora/Quad2-1"}]},
    calendarResolution:witness,form:"SOLEMN"}).reason,"RUBRICAL_CLASSIFICATION_PENDING",
    "Wrong Lenten prayer-source identity must not be silently certified");
  assert.equal(select({proper:{...source,secrets:[one]},
    calendarResolution:witness,form:"LOW"}).reason,"ORATION_SOURCE_INCOMPLETE",
    "Incomplete source Secret cannot be made certifiable by a privileged rank");
  assert.equal(select({proper:source,
    calendarResolution:{...witness,day:{...witness.day,main:{...witness.day.main,rank:3}}},
    form:"SOLEMN"}).reason,"RUBRICAL_CLASSIFICATION_PENDING");
}

// Source-identified Lent feria: ordinary commemoration only in Low Mass.
for(const [date,feriaPath,saintPath,rank] of [
 ["2026-02-23","Tempora/Quad1-1","Sancti/02-23",3],
 ["2026-03-06","Tempora/Quad2-5","Sancti/03-06",3],
 ["2026-03-24","Tempora/Quad5-2","Sancti/03-24",4]
]){
 const source={...base,sourcePath:feriaPath,
   calendarCommemorations:[{path:saintPath,prayerSourcePath:saintPath,
     name:"Original Lenten commemoration"}]};
 const witness={...day,date,day:{
   main:{id:"tempora:"+feriaPath.slice("Tempora/".length)+":3:v",
     rank:3,path:feriaPath,title:"Lenten feria"},
   commemorations:[{id:"sancti:"+saintPath.slice("Sancti/".length)+":"+rank+":w",
     rank,path:saintPath,title:"Impeded saint"}]},
   proper:{status:"ready",data:source}};
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
   const selected=select({proper:source,calendarResolution:witness,form});
   assert.equal(selected.status,"CERTIFIED",date+"/"+form+": "+selected.reason);
   assert.equal(selected.decision.scope,"LENT_PASSION_III_CLASS_FERIA_ORDINARY_COMMEMORATION");
   const n=form==="LOW"?2:1;
   for(const field of ["collects","secrets","postcommunions"])
     assert.equal(selected.proper[field].length,n,date+"/"+form+"/"+field);
   for(const language of ["en","fr"]){
     const slots=properToReaderSlots(selected.proper,{language}).slots;
     for(const name of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]){
       assert.equal(slots[name].status,"READY");
       assert.equal(slots[name].data.paragraphs.length,n);
     }
   }
   assert.equal(assessPrintableProper(witness,{language:"fr",massForm:form}).ok,true);
 }
 for(const [mutant,expected] of [
  [{...source,calendarCommemorations:[{path:saintPath,prayerSourcePath:"Sancti/04-13"}]},
    "RUBRICAL_CLASSIFICATION_PENDING"],
  [{...source,secrets:[one]},"ORATION_SOURCE_INCOMPLETE"]
 ]){
   assert.equal(select({proper:mutant,calendarResolution:witness,form:"LOW"}).reason,expected);
 }
 assert.equal(select({proper:source,calendarResolution:witness,
   form:"LOW",isConventual:true}).reason,"CONVENTUAL_RULES_NOT_VERIFIED");
}
// II-class St Matthias displaces, but must commemorate, the III-class
// Lenten feria in Low AND nonconventual Sung/Solemn Mass.
{
 const date="2026-02-24",path="Sancti/02-24",feria="Tempora/Quad1-2";
 const source={...base,sourcePath:path,calendarCommemorations:[
   {path:feria,prayerSourcePath:feria,name:"Feria III Lent"}]};
 const witness={...day,date,day:{
   main:{id:"sancti:02-24:2:r",rank:2,path,title:"St Matthias"},
   commemorations:[{id:"tempora:Quad1-2:3:v",rank:3,path:feria,
     title:"Lenten feria"}]},proper:{status:"ready",data:source}};
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
   const result=select({proper:source,calendarResolution:witness,form});
   assert.equal(result.status,"CERTIFIED",form+": "+result.reason);
   assert.equal(result.decision.scope,"PRIVILEGED_LENT_PASSION_FERIA_UNDER_II_CLASS_SANCTORAL");
   assert.equal(result.decision.appliedCount,1);
   for(const field of ["collects","secrets","postcommunions"])
     assert.equal(result.proper[field].length,2);
   for(const language of ["en","fr"]){
     const slots=properToReaderSlots(result.proper,{language}).slots;
     for(const slot of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]){
       assert.equal(slots[slot].status,"READY");
       assert.equal(slots[slot].data.paragraphs.length,2);
     }
   }
 }
 assert.equal(select({proper:{...source,secrets:[one]},
   calendarResolution:witness,form:"SOLEMN"}).reason,"ORATION_SOURCE_INCOMPLETE");
}

// Actual 2026 day owners: a IV-class feria using the inherited
// post-Pentecost Sunday Proper, with an ordinary IV-class saint. The
// Ordinary retains the Calendar identity; Low alone retains prayers.
for(const [date,mainPath,saintPath] of [
  ["2026-10-05","Tempora/Pent19-0","Sancti/10-05"],
  ["2026-07-16","Tempora/Pent07-0","Sancti/07-16"]
]){
  const source={...base,sourcePath:mainPath,
    calendarCommemorations:[{path:saintPath,prayerSourcePath:saintPath,
      name:"Original calendar commemoration"}]};
  const witness={...day,date,day:{
    main:{id:":feria:4:w",rank:4,path:null,title:"Post-Pentecost feria"},
    commemorations:[{id:"sancti:"+saintPath.slice(-5)+":4:w",
      rank:4,path:saintPath,title:"Ordinary fourth-class commemoration"}]},
    proper:{status:"ready",data:source}};
  for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
    const selected=select({proper:source,calendarResolution:witness,form});
    assert.equal(selected.status,"CERTIFIED",date+"/"+form+": "+selected.reason);
    assert.equal(selected.decision.scope,
      "PENTECOST_SEASON_IV_CLASS_FERIA_ORDINARY_COMMEMORATION");
    const n=form==="LOW"?2:1;
    assert.equal(selected.decision.appliedCount,n-1);
    for(const group of ["collects","secrets","postcommunions"])
      assert.equal(selected.proper[group].length,n,date+"/"+form+"/"+group);
    for(const language of ["en","fr"]){
      const slots=properToReaderSlots(selected.proper,{language}).slots;
      for(const name of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]){
        assert.equal(slots[name].status,"READY",date+"/"+form+"/"+language+"/"+name);
        assert.equal(slots[name].data.paragraphs.length,n);
      }
    }
    assert.equal(assessPrintableProper(witness,{language:"en",massForm:form}).ok,true);
  }
  // Refuse unverified principal ranks, unrelated prayer owners, and
  // different seasons. Do not promote institute-specific substitute Masses.
  assert.equal(select({proper:source,calendarResolution:{...witness,
    day:{...witness.day,main:{...witness.day.main,rank:3}}},
    form:"LOW"}).reason,"RUBRICAL_CLASSIFICATION_PENDING");
  assert.equal(select({proper:{...source,calendarCommemorations:[
    {path:saintPath,prayerSourcePath:"Sancti/11-05"}]},
    calendarResolution:witness,form:"LOW"}).reason,"RUBRICAL_CLASSIFICATION_PENDING");
  assert.equal(select({proper:{...source,sourcePath:"Tempora/Quad1-0"},
    calendarResolution:witness,form:"LOW"}).reason,"RUBRICAL_CLASSIFICATION_PENDING",
    "Unrelated season may not inherit Pentecost source identity");
  assert.equal(select({proper:{...source,secrets:[one]},
    calendarResolution:witness,form:"LOW"}).reason,"ORATION_SOURCE_INCOMPLETE");
}

for(const [change,reason] of [
  [{date:"2026-10-12"},"RUBRICAL_CLASSIFICATION_PENDING"],
  [{day:{main:{...day.day.main,rank:1},commemorations:day.day.commemorations}},"RUBRICAL_CLASSIFICATION_PENDING"],
  [{day:{main:day.day.main,commemorations:[...day.day.commemorations,...day.day.commemorations]}},"MULTIPLE_COMMEMORATIONS_SOURCE_PRIORITY_PENDING"],
]){
  const blocked=select({proper:base,calendarResolution:{...day,...change},form:"LOW"});
  assert.equal(blocked.status,"UNVERIFIED");assert.equal(blocked.reason,reason);
}
assert.equal(select({proper:base,calendarResolution:day,form:"SOLEMN",isConventual:true}).reason,
  "CONVENTUAL_RULES_NOT_VERIFIED");
assert.equal(select({proper:base,calendarResolution:day,form:"LOW",celebrationId:"votive"}).reason,
  "ALTERNATE_FORMULARY");
assert.equal(select({proper:{...base,calendarCommemorations:[{path:"Other"}]},calendarResolution:day,form:"LOW"}).reason,
  "RUBRICAL_CLASSIFICATION_PENDING");
assert.equal(select({proper:{...base,secrets:[one]},calendarResolution:day,form:"LOW"}).reason,
  "ORATION_SOURCE_INCOMPLETE");
assert.equal(assessPrintableProper({...day,day:{...day.day,commemorations:[
  {...day.day.commemorations[0],rank:1}]}},{massForm:"SOLEMN"}).ok,false);
console.log("PASS: source-owned II-class Sunday commemoration, four forms × reader × print, strict holds for unsupported cases.");
