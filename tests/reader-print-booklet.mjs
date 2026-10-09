import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createMassReaderModel} from "../src/mass/reader-model.js";
import {projectSourceFirst48Presentation} from "../src/mass/reader-live-product48.js";
import {assessMassTextPrint,renderMassTextPrintHtml} from "../src/mass/reader-print-booklet.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
const canonSourceMap=load("../data/presentation/reader-canon-source-map.v1.json");
const frenchOrdinary=load("../data/presentation/reader-french-ordinary.v1.json");
const guide=load("../data/presentation/guide-registry.v1.json");
const t=(la,en,fr)=>({lat:la,en,fr});
const proper={
 sourcePath:"Sancti/10-07",
 introit:t("Intróitus &", "Introit &", "Introït &"),collects:[t("Orátio","Collect","Collecte")],
 epistle:t("Epístola","Epistle","Épître"),gradual:t("Graduale","Gradual","Graduel"),
 sequence:t("","",""),gospel:t("Evangélium","Gospel","Évangile"),
 offertory:t("Offertórium","Offertory","Offertoire"),
 secrets:[t("Secreta","Secret","Secrète")],
 preface:t("Præfátio","Preface","Préface"),
 communion:t("Commúnio","Communion","Communion"),
 postcommunions:[t("Postcommúnio","Postcommunion","Postcommunion")],
};
const makePrepared=(form="MISSA_CANTATA_INCENSE",language="en")=>({
 session:{
  resolvedMass:{
   schema:"ao-resolved-mass-v2",date:"2026-10-07",form,presentationMode:"LIVE",
   actualCelebration:{id:"sancti:10-07",type:"CALENDAR",title:"Our Lady of the Holy Rosary"},
   calendarCelebration:{id:"sancti:10-07",type:"CALENDAR"},
   proper:{status:"READY",data:proper},
   overlays:[],precedingRites:[],followingActions:[],distinctRite:null,
  },
  plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:[],blessingAllowed:true,normalLastGospel:true}
 },
 readerPreferences:{language,mode:"LIVE"}
});
function getModel(prepared){
 return createMassReaderModel({
  resolvedMass:{...prepared.session.resolvedMass,presentationMode:"MISSAL"},
  sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,
  frenchOrdinary,vernacularLanguage:prepared.readerPreferences.language
 });
}
for(const [form,language] of [["MISSA_CANTATA_INCENSE","en"],["MISSA_CANTATA_SIMPLE","fr"],["LOW","en"],["LOW","fr"]]){
 const prepared=makePrepared(form,language);
 const model=getModel(prepared),presented=model;
 const output=assessMassTextPrint({prepared,model:presented,guideRegistry:guide,language});
 assert.equal(output.ok,true,form+" "+language+": "+JSON.stringify({reason:output.reason,errors:output.errors?.slice(0,20)}));
 assert.equal(output.cards.length,30,"canonical 30 Missal print sections must print exactly once");
 assert.equal(output.blockCount,96,"all 96 original canonical text blocks must be accounted for");
 const html=renderMassTextPrintHtml({prepared,model:presented,guideRegistry:guide,language});
 assert.equal((html.match(/class="section"/g)||[]).length,30);
 assert.match(html,/Per ómnia sǽcula sæculórum/,"Canon conclusion absent from printable Mass");
 assert.match(html,/AO\.SM\.C0206|R17 96/,"Canonical text provenance or block count missing");
 assert.match(html,/Orátio|Orátio/);
 assert.match(html,/source cue identifiers|identifiants de répliques/);
 assert.match(html,/Sancti\/10-07/);
 assert.match(html,/Ordinary and Proper texts|Textes de l’Ordinaire/);
 assert.doesNotMatch(html,/certified complete liturgical Missal(?!(?:\.))/);
 assert.match(html,/&amp;/);
 if(language==="fr")assert.match(html,/lang="fr"/);
 else assert.match(html,/lang="en"/);
}
const baseline=makePrepared();
const model=getModel(baseline);
for(const mutate of [
 p=>p.session.resolvedMass.precedingRites.push("PALM"),
 p=>p.session.plan.precedingGraphs.push("ASPERGES"),
 p=>p.session.plan.followingGraphs.push("CORPUS_CHRISTI_PROCESSION"),
 p=>p.session.resolvedMass.overlays.push("NUPTIAL"),
 p=>p.session.resolvedMass.form="SOLEMN",
 p=>p.session.plan.kind="DISTINCT_RITE",
 p=>p.session.plan.normalLastGospel=false,
 p=>p.session.plan.blessingAllowed=false,
 p=>p.session.resolvedMass.distinctRite="GOOD_FRIDAY",
 ]){
 const p=makePrepared();mutate(p);
 assert.equal(assessMassTextPrint({prepared:p,model,guideRegistry:guide}).ok,false,
  "Complex/modified rite must fail closed");
}
assert.equal(assessMassTextPrint({prepared:baseline,model:{...model,cards:model.cards.slice(1)},guideRegistry:guide}).ok,false);
const fullLive=createMassReaderModel({resolvedMass:baseline.session.resolvedMass,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,frenchOrdinary});
assert.equal(fullLive.totalCards,39);
const live48=projectSourceFirst48Presentation(fullLive);
assert.equal(live48.totalCards,48);
assert.equal(assessMassTextPrint({prepared:baseline,model:live48,guideRegistry:guide}).ok,false,"LIVE presentation cannot masquerade as a full print master");
assert.equal(assessMassTextPrint({prepared:baseline,model,guideRegistry:null}).ok,false);
const missing=structuredClone(model.cards.map(x=>x));
const target=missing.find(x=>x.paragraphs.length>0);
const at=missing.indexOf(target);missing[at]={...target,paragraphs:[...target.paragraphs]};
missing[at].paragraphs[0]={...missing[at].paragraphs[0],primary:"",alternate:"",secondary:""};
const broken={...model,cards:missing};
assert.equal(assessMassTextPrint({prepared:baseline,model:broken,guideRegistry:guide}).ok,false,
 "Partial bilingual source text must not be presented as complete");
console.log("PASS native bilingual Mass text print: authentic Low and Sung corpora, 30 Missal sections/96 unique blocks, R17 English/French, Canon no duplication, exclusion of all unsupported rite graphs");
