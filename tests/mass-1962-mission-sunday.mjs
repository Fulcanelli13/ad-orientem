import assert from "node:assert/strict";
import {applyMissionSundayCollect,penultimateOctoberSunday,MISSION_SUNDAY_SOURCE} from "../src/mass/1962-mission-sunday-source.js";
import {select1962CommemorationsForMassForm} from "../src/mass/1962-commemoration-form-source.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {assessPrintableProper,renderPrintableProperHtml} from "../src/calendar/print-proper.js";

const ending=Object.freeze({
  lat:"Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
  en:"Through our Lord Jesus Christ, Thy Son, Who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
  fr:"Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il.",
});
const tr=id=>({lat:"Latin "+id,en:"English "+id,fr:"Français "+id});
const collect=Object.freeze(Object.fromEntries(["lat","en","fr"].map(lang=>[lang,tr("principal")[lang]+"\n"+ending[lang]])));
const proper={
  sourcePath:"Tempora/Pent21-0",riteProfile:"ordinary_mass",
  name:"XXI Sunday after Pentecost",
  introit:tr("introit"),epistle:tr("epistle"),gradual:tr("gradual"),gospel:tr("gospel"),
  offertory:tr("offertory"),preface:tr("preface"),communion:tr("communion"),
  collects:[collect,collect],secrets:[tr("secret"),tr("secret Luke")],
  postcommunions:[tr("postcommunion"),tr("postcommunion Luke")],
  calendarCommemorations:[{path:"Sancti/10-18",prayerSourcePath:"Sancti/10-18",name:"St Luke"}],
};
const day={status:"ready",date:"2026-10-18",
  day:{main:{id:"tempora:Pent21-0:2:g",rank:2,path:"Tempora/Pent21-0",title:"XXI Sunday"},
    commemorations:[{id:"sancti:10-18:2:r",rank:2,path:"Sancti/10-18",title:"St Luke"}]},
  proper:{status:"ready",data:proper}};
assert.equal(penultimateOctoberSunday(2026),"2026-10-18");
assert.equal(penultimateOctoberSunday(2027),"2027-10-24");
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const selected=select1962CommemorationsForMassForm({proper,calendarResolution:day,form});
  assert.equal(selected.status,"CERTIFIED",form+": "+selected.reason);
  const result=selected.proper,expected=form==="LOW"?2:1;
  assert.equal(result.missionSundayCollectDecision.status,"CERTIFIED");
  assert.equal(result.missionSundayCollectDecision.collectGroupCount,expected);
  assert.equal(result.collects.length,expected,"Mission collect is not a separate oration");
  assert.equal(result.secrets.length,expected,"Secret must not be inserted");
  assert.equal(result.postcommunions.length,expected,"Postcommunion must not be inserted");
  assert.equal(result.calendarCommemorations.length,1,"St Luke remains in Calendar");
  assert.ok(result.collects[0].oneConclusion?.segments?.fr?.mission.startsWith("Seigneur"));
  for(const lang of ["lat","en","fr"]){
    const final=result.collects[0][lang];
    assert.ok(final.includes(MISSION_SUNDAY_SOURCE.texts[lang]),lang);
    assert.equal(final.split(ending[lang]).length,2,lang+" duplicates/loses conclusion");
    assert.ok(final.indexOf(MISSION_SUNDAY_SOURCE.texts[lang])<final.indexOf(ending[lang]));
  }
  const fr=properToReaderSlots(result,{language:"fr"});
  const en=properToReaderSlots(result,{language:"en"});
  assert.equal(fr.slots.COLLECT_SET.data.paragraphs.length,expected+1,
    form+" needs separate main/Mission focus segments plus separate St Luke if Low");
  assert.equal(en.slots.COLLECT_SET.data.paragraphs.length,expected+1);
  assert.equal(fr.slots.COLLECT_SET.data.paragraphs[0].liturgicalGroup,"COLLECT_UNDER_ONE_CONCLUSION");
  assert.equal(fr.slots.COLLECT_SET.data.paragraphs[1].liturgicalGroup,"COLLECT_UNDER_ONE_CONCLUSION");
  const audit=assessPrintableProper(day,{massForm:form,language:"fr"});
  assert.equal(audit.ok,true,audit.reason);
  assert.equal(audit.sections.filter(x=>x.kind==="collect").length,expected);
  assert.match(renderPrintableProperHtml(day,{massForm:form,language:"en"}),/Missions \(single conclusion\)/);
}
for(const [arg,reason] of [
  [{localMissionSundayDate:"2026-10-25"},"DIFFERENT_DATE"],
  [{competingUnderOneConclusion:["RITUAL_COLLECT"]},"PRIORITY_444_445_REQUIRES_SELECTION"],
  [{proper:{...proper,collects:[{...collect,fr:"Bad conclusion"}]}},"PRINCIPAL_COLLECT_CONCLUSION_UNVERIFIED"],
  [{calendarResolution:{...day,day:{main:{...day.day.main,rank:1},commemorations:day.day.commemorations}}},"MASS_PRINCIPAL_OR_PRECEDENCE_UNVERIFIED"],
  [{celebrationId:"votive"},"MASS_PRINCIPAL_OR_PRECEDENCE_UNVERIFIED"],
]){
  const selected=applyMissionSundayCollect({proper,calendarResolution:day,form:"LOW",...arg});
  assert.equal(selected.reason,reason);
  assert.notEqual(selected.status,"APPLIED");
}
const competing=select1962CommemorationsForMassForm({
  proper:{...proper,oneConclusionCollects:[{kind:"RITUAL",priority:1}]},
  calendarResolution:day,form:"LOW"});
assert.equal(competing.status,"UNVERIFIED");
assert.match(competing.reason,/MISSION_SUNDAY_PRIORITY_444_445/);
assert.equal(competing.proper.missionSundayCollectDecision.status,"UNVERIFIED");
const failedSlots=properToReaderSlots(competing.proper,{language:"fr"});
assert.equal(failedSlots.slots.COLLECT_SET.status,"MISSING",
  "Unverified competition must not silently omit a prescribed mission Collect");
assert.equal(assessPrintableProper({...day,proper:{status:"ready",data:competing.proper}},
  {massForm:"LOW",language:"fr"}).ok,false);
assert.equal(applyMissionSundayCollect({proper,calendarResolution:{...day,date:"2026-10-11"},form:"LOW"}).status,"NOT_APPLICABLE");
console.log("PASS §453: October Mission Sunday across four forms, one Collect conclusion, sourced languages, no extra Secret/Postcommunion, safe competition gates and reader/print parity.");
