import { adaptV346ResolvedMass, prepareMassSessionFromV346 } from "../src/mass/host-adapter.js";

const expect=(x,m)=>{if(!x)throw new Error(m)};
const base={
  date:"2026-10-04",
  calendarDay:{id:"Tempora/Pent18-0",title:"Sunday"},
  requestedCelebrationId:"mass_of_day",
  celebrationId:"mass_of_day",
  celebrationType:"calendar",
  properSource:"Tempora/Pent18-0",
  canStart:true,
  insertedRites:[],
  conditions:[],
  rubricSources:["RG60"],
  sourceDiagnostics:{architectureVersion:"1"},
};
const proper={sourcePath:"Tempora/Pent18-0",introit:{lat:"x"}};

const ordinary=prepareMassSessionFromV346(base,{form:"sung",followMode:"vox",proper});
expect(ordinary.resolvedMass.form==="MISSA_CANTATA_INCENSE","legacy sung form mapping changed");
expect(ordinary.resolvedMass.presentationMode==="LIVE","legacy vox mode mapping changed");
expect(ordinary.resolvedMass.explicitlySelectedCelebration===false,"Mass of day became manual override");
expect(ordinary.plan.massEntry==="FOOT_CLUSTER","ordinary plan changed");

const rosary=prepareMassSessionFromV346({
  ...base,
  requestedCelebrationId:"holy_rosary",
  celebrationId:"holy_rosary",
  celebrationType:"votive",
  properSource:"Sancti/10-07",
},{
  form:"mc-simple",
  presentationMode:"SIMPLE",
  proper:{sourcePath:"Sancti/10-07",introit:{lat:"Gaudeamus"}},
});
expect(rosary.resolvedMass.actualCelebration.id==="holy_rosary","manual celebration identity lost");
expect(rosary.resolvedMass.overlays.includes("VOTIVE_PROPER"),"Votive Proper overlay not inferred");
expect(rosary.resolvedMass.form==="MISSA_CANTATA_SIMPLE","MC simple mapping lost");

let missingProper=false;
try{
  adaptV346ResolvedMass({
    ...base,
    requestedCelebrationId:"st_therese",
    celebrationId:"st_therese",
    celebrationType:"votive",
  },{form:"low"});
}catch{missingProper=true}
expect(missingProper,"Votive session without Proper did not fail closed");

const req=prepareMassSessionFromV346({
  ...base,
  requestedCelebrationId:"requiem",
  celebrationId:"requiem",
  celebrationType:"requiem",
  properSource:"Votive/Requiem",
},{
  form:"solemn",
  proper:{sourcePath:"Votive/Requiem",isRequiem:true},
});
expect(req.resolvedMass.overlays.includes("REQUIEM"),"Requiem overlay not inferred");
expect(req.plan.blessingAllowed===false,"Requiem blessing survived");

const reqAbs=prepareMassSessionFromV346({
  ...base,
  requestedCelebrationId:"requiem",
  celebrationId:"requiem",
  celebrationType:"requiem",
},{
  form:"solemn",
  proper:{isRequiem:true},
  followingActions:["REQUIEM_ABSOLUTION"],
});
expect(reqAbs.plan.normalLastGospel===false,"Absolution branch did not suppress Last Gospel");

const nuptial=prepareMassSessionFromV346({
  ...base,
  requestedCelebrationId:"nuptial",
  celebrationId:"nuptial",
  celebrationType:"nuptial",
},{
  form:"low",
  proper:{sourcePath:"MATRIMONIUM_V16"},
});
expect(nuptial.resolvedMass.overlays.includes("NUPTIAL"),"Nuptial overlay not inferred");
expect(nuptial.plan.insertions.length===3,"Nuptial insertions not compiled");

const gf=prepareMassSessionFromV346({
  ...base,
  exceptionalProfile:"good-friday-1962",
},{
  form:"solemn",
  proper,
});
expect(gf.plan.kind==="DISTINCT_RITE" && gf.plan.canonicalMassGraphActive===false,"Good Friday profile did not become distinct rite");

const corpusDate=prepareMassSessionFromV346({
  ...base,
  celebrationId:"corpus_christi",
  requestedCelebrationId:"mass_of_day",
},{
  proper,
});
expect(corpusDate.plan.normalLastGospel===true && corpusDate.plan.blessingAllowed===true,"Corpus date alone activated procession");

const corpusAction=prepareMassSessionFromV346(base,{
  proper,
  followingActions:["CORPUS_CHRISTI_PROCESSION"],
});
expect(corpusAction.plan.normalLastGospel===false && corpusAction.plan.blessingAllowed===false,"Explicit Corpus procession ending lost");

let blocked=false;
try{ adaptV346ResolvedMass({...base,canStart:false},{proper}); }catch{blocked=true}
expect(blocked,"Blocked preflight was allowed to enter Mass");

console.log("v3.4.6 host adapter PASS: calendar/manual/Votive/Requiem/Nuptial/distinct-rite/following-action guards.");
