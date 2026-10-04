import { createMassEntryController } from "../src/mass/app-shell-bootstrap.js";

const expect=(x,m)=>{if(!x)throw new Error(m)};

const proper={sourcePath:"Sancti/10-07",introit:{lat:"Gaudeamus"}};
const base={
  date:"2026-10-04",
  calendarDay:{id:"Tempora/Pent18-0",title:"Sunday"},
  requestedCelebrationId:"holy_rosary",
  celebrationId:"holy_rosary",
  celebrationType:"votive",
  properSource:"Sancti/10-07",
  canStart:true,
  insertedRites:[],
  conditions:[],
  rubricSources:["RG60"],
};

let opened=null;
const controller=createMassEntryController({
  celebrationApi:{getResolvedMass:()=>base},
  resolveHostOptions:()=>({form:"mc-simple",proper}),
  readReaderPreferences:()=>({
    mode:"simple",
    postureProfile:"FOLLOW_CONGREGATION",
    gestureProfile:"GUIDED_1962",
    language:"vernacular",
  }),
  openReader:(payload)=>{opened=payload},
});

const prepared=await controller.prepare();
expect(prepared.schema==="ao-mass-entry-bootstrap-v1","bootstrap schema changed");
expect(prepared.session.resolvedMass.form==="MISSA_CANTATA_SIMPLE","Mass form was not preserved");
expect(prepared.session.resolvedMass.presentationMode==="SIMPLE","reader mode did not own presentation mode");
expect(prepared.session.resolvedMass.actualCelebration.id==="holy_rosary","manual actual celebration lost");
expect(prepared.session.resolvedMass.overlays.includes("VOTIVE_PROPER"),"Votive overlay missing");
expect(prepared.readerPreferences.mode==="SIMPLE","reader preferences not normalized");
expect(opened===null,"prepare() opened the reader");

const entered=await controller.enter();
expect(opened===entered,"enter() did not hand exact prepared payload to reader");

let blockedOpen=false;
const blocked=createMassEntryController({
  celebrationApi:{getResolvedMass:()=>({...base,canStart:false})},
  resolveHostOptions:()=>({form:"low",proper}),
  readReaderPreferences:()=>({mode:"live"}),
  openReader:()=>{blockedOpen=true},
});
let blockedThrown=false;
try{ await blocked.enter(); }catch{ blockedThrown=true }
expect(blockedThrown,"blocked preflight entered Mass");
expect(blockedOpen===false,"reader opened after blocked preflight");

let missingProperOpen=false;
const missingProper=createMassEntryController({
  celebrationApi:{getResolvedMass:()=>base},
  resolveHostOptions:()=>({form:"low"}),
  readReaderPreferences:()=>({mode:"missal"}),
  openReader:()=>{missingProperOpen=true},
});
let properThrown=false;
try{ await missingProper.enter(); }catch{ properThrown=true }
expect(properThrown,"manual Votive without Proper did not fail closed");
expect(missingProperOpen===false,"reader opened without required Proper");

console.log("App-shell Mass bootstrap PASS: preflight → ResolvedMass → session → reader handoff.");
