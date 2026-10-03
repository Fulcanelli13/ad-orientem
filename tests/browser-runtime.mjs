import { createBrowserMassRuntime } from "../src/mass/browser-runtime.js";

const expect=(x,m)=>{if(!x)throw new Error(m)};

const root={
  innerHTML:"",
  querySelector(){return null},
  querySelectorAll(){return []},
  addEventListener(){},
};

let mounted=false;
const runtime=createBrowserMassRuntime({
  root,
  celebrationApi:{getResolvedMass:()=>({
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
  })},
  resolveHostOptions:()=>({
    form:"mc-incense",
    proper:{sourcePath:"Sancti/10-07",introit:{lat:"Gaudeamus"}},
  }),
  readReaderPreferences:()=>({
    mode:"live",
    postureProfile:"FOLLOW_CONGREGATION",
    gestureProfile:"GUIDED_1962",
  }),
  onReaderMounted:()=>{mounted=true},
});

const entered=await runtime.enter();
expect(mounted,"reader mount callback not invoked");
expect(root.innerHTML.includes('data-ao-reader-shell'),"reader shell not mounted");
expect(root.innerHTML.includes("Holy Rosary"),"actual celebration title not carried into shell");
expect(entered.session.resolvedMass.form==="MISSA_CANTATA_INCENSE","Mass form changed during DOM mount");
expect(entered.session.resolvedMass.presentationMode==="LIVE","presentation mode changed during DOM mount");

runtime.destroy();
expect(root.innerHTML==="","destroy did not clear reader shell");

console.log("Browser Mass runtime PASS: preflight/session bootstrap mounts converged reader shell without mutating Mass form.");
