import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {angelusCardPlan} from "../src/pray/devotional-card-deck.js";
import {angelusCommunalParts} from "../src/pray/angelus-folio-recitation.js";
import {splitAngelusVersicleResponse} from "../src/pray/angelus-guide-data.js";
import {ROSARY_GUIDED_BEAD_MEDITATIONS_V1} from "../src/pray/rosary-guided-bead-meditations.v1.js";
import {ROSARY_GUIDED_BEAD_EVIDENCE_V1} from "../src/pray/rosary-guided-bead-evidence.v1.js";
import {ROSARY_MYSTERY_CONTEXT_V1} from "../src/pray/rosary-mystery-context.v1.js";
import {ROSARY_METHODS,rosaryPlan} from "../src/pray/devotional-methods-v1.js";
import {rosaryNamedChapters,rosaryCurrentChapter} from "../src/pray/rosary-card-chapters.js";

const src=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const policySource=readFileSync(new URL("../src/pray/rosary-scripture-policy.js",import.meta.url),"utf8");
const source=PRAY_CANONICAL_DATA_V435930;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const nl=v=>esc(v).replace(/\n/g,"<br>");
function plain(x){return String(x||"").replace(/<[^>]+>/g,"").replace(/&amp;/g,"&")
 .replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">")
 .replace(/[℣℟]\.?/g,"").replace(/\b[VR]\./g,"").replace(/\s/g,"").normalize("NFC");}
const within=(src,a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,"Missing original reader block "+a);return src.slice(i,j)};
let locale="en",form="angelus",checks=0;
const S={angelusMode:"angelus",angelusLatin:false,angelusGuided:true,angelusHistoricalConclusion:false,
 rosary:{recitation:"individual"}};
const DATA={angelus:source.angelus,regina:source.regina,angelusAppendix:source.angelusAppendix};
const env={S,DATA,esc,nl,lang:()=>locale,isFr:()=>locale==="fr",L:(en,fr)=>locale==="fr"?(fr||en):en,
 PRAYER_PILOT_ENABLED:false,ANGELUS_PILOT_ENTRY:false,ANGELUS_CARD_INDEX:1,ANGELUS_COVER_DISMISSED:true,
 CLAUDE_ANGELUS_HOUR:12,angelusOptionsOpen:false,angelusSaturdayVespersDate:"",
 angelusChoice:()=>({form,auto:false,authority:{ok:true}}),angelusExactPosture:()=>({stand:false,assetId:""}),
 angelusExactRailMarkup:()=>"",assetIcon:()=>"",selectedWeekday:()=>1,selectedDateKey:()=>"",
 nav:()=>"",head:title=>"<header><h1>"+esc(title)+"</h1></header>",releasedModulePhotoMarkup:()=>"",
 claudeHorariumClock:()=>"",claudeHorariumStrokes:()=>"",angelusGuideSections:()=>[],
 B01_AUGUST_QUEEN_SOURCE:{url:"https://example.org/source"},angelusCommunalParts,
 splitAngelusVersicleResponse,callout:message=>'<p>'+message+'</p>'
};
const angelusCode=within(src,"function angelusUnits(text,form){","function normalizeRosaryPrefs(");
const fns=new Function("env","with(env){"+angelusCode+"\nreturn {angelusUnits,renderAngelus};}")(env);
// Two historical complete prayers; 8 and 4 original units, all original
// EN/FR/LA witnesses. Test real final HTML, not just the data registry.
for(const requestedForm of ["angelus","regina"]){
 form=requestedForm;S.angelusMode=form;
 const expected=requestedForm==="angelus"?8:4;
 for(const loc of ["en","fr"]){
  locale=loc;
  const vern=fns.angelusUnits(DATA[form][loc],form);
  const latin=fns.angelusUnits(DATA[form].la,form);
  assert.equal(vern.length,expected);
  assert.equal(latin.length,expected);
  assert.deepEqual(vern.map(x=>x.type),latin.map(x=>x.type));
  assert.equal(angelusCardPlan({form,language:loc}).length,form==="angelus"?5:4);
  for(const defaultLatin of [false,true]){
   S.angelusLatin=defaultLatin;
   S.angelusHistoricalConclusion=form==="angelus";
   const html=fns.renderAngelus();
   const cards=[...html.matchAll(/<article class="aoP435930LitCard[\s\S]*?<\/article>/g)].map(x=>x[0]);
   assert.equal(cards.length,expected,"No duplication or dropped Angelus/Regina prayer units");
   assert.ok(html.includes('data-ao-angelus-form="'+form+'"'));
   for(let i=0;i<expected;i++){
    const card=cards[i];
    assert.ok(card.includes('data-ao-angelus-index="'+i+'"'));
    assert.ok(card.includes('data-face-v lang="'+loc+'"'));
    assert.ok(card.includes('data-face-la lang="la"'));
    const offset=card.indexOf('<span data-face-la lang="la"');
    const actualV=card.slice(card.indexOf('<span data-face-v lang='),offset);
    const actualLA=card.slice(offset);
    assert.ok(plain(actualV).includes(plain(vern[i].text)),
      "Angelus original "+form+"/"+loc+"/"+i+" lost its complete sourced utterance");
    assert.ok(plain(actualLA).includes(plain(latin[i].text)),
      "Angelus Latin "+form+"/"+i+" lost its complete sourced utterance");
    checks++;
   }
   if(form==="angelus"){
    assert.equal((html.match(/data-ao-incarnation="true"/g)||[]).length,1);
    assert.ok(html.includes('data-face-la lang="la"'),"Historical conclusion must retain Latin");
   }
  }
 }
}
// Rosary is a preserved canonical Lab Ora donor, NOT a second card engine:
// prove 200 bilingual editorial texts are projected into their existing bead
// via the real source policy, with separately owned edition/typology evidence.
const sourceMethods=["ordinary","dominican","montfort","montfort_short","scriptural"];
for(const method of sourceMethods){
 const plan=rosaryPlan({method,decades:5,set:"joyful"});
 assert.equal(plan.canonicalOwner,"AO_ROSARY_V381");
 assert.equal(plan.readyForLive,true);
 assert.equal(plan.ids.length,5);
 checks++;
}
assert.equal(rosaryPlan({method:"ordinary",decades:15}).ids.length,15);
for(const id of Object.keys(ROSARY_GUIDED_BEAD_MEDITATIONS_V1)){
 const moments=ROSARY_GUIDED_BEAD_MEDITATIONS_V1[id];
 const citations=ROSARY_GUIDED_BEAD_EVIDENCE_V1[id];
 assert.equal(moments.length,10);assert.equal(citations.length,10);
 assert.ok(ROSARY_MYSTERY_CONTEXT_V1[id]);
 for(let i=0;i<10;i++){
  const m=moments[i],w=citations[i];
  assert.equal(m.bead,i+1);assert.equal(w.bead,i+1);
  assert.ok(m.en?.trim()&&m.fr?.trim());
  assert.equal(w.isDirectQuotation,false,"Editorial Rosary cannot masquerade as Scripture quotation");
  assert.equal(w.textualApproval,"NOT_A_BIBLICAL_QUOTATION");
  assert.ok(w.primaryUrl.startsWith("https://")&&w.frenchPrimaryUrl.startsWith("https://"));
 }
}
const families={joy:"joyful",sor:"sorrowful",glo:"glorious",lum:"luminous"};
const policy=new Function("env","with(env){"+
 policySource.replace(/^import [^\n]*\n/gm,"").replace(/^export /gm,"")+
 "\nreturn {applyRosaryScripturePolicy};}")({
 ROSARY_GUIDED_BEAD_MEDITATIONS_V1,ROSARY_GUIDED_BEAD_EVIDENCE_V1,ROSARY_MYSTERY_CONTEXT_V1,
 parseScriptureContext:reference=>reference?{reference}:null,
 restoreRosaryBeadScripture:()=>{},
});
function fakeNode(tag){
 return {tagName:tag,dataset:{},children:[],lang:"",textContent:"",append(...x){this.children.push(...x)},
 appendChild(x){this.children.push(x)},setAttribute(k,v){this[k]=v},remove(){}};
}
for(const id of Object.keys(ROSARY_GUIDED_BEAD_MEDITATIONS_V1)){
 const set=families[id.slice(0,3)],mi=Number(id.slice(3))-1;
 for(let bead=1;bead<=10;bead++){
  for(const french of [false,true]){
   const prayer=fakeNode("div"),shell=fakeNode("div");
   const document={createElement:fakeNode,createTextNode:text=>({textContent:text})};
   const root={ownerDocument:document,
    querySelector:sel=>sel===".pbShell"?shell:sel===".lab-prayer-sheet"?prayer:null,
    querySelectorAll:()=>[]};
   const applied=policy.applyRosaryScripturePolicy(root,
    {set,mi,step:{cue:true,bead,kind:"prayer"}},{french,guided:true});
   assert.equal(applied,true,id+"."+bead+" did not render within canonical donor");
   const note=prayer.children.find(x=>x.dataset?.aoRosaryGuidedBead);
   assert.ok(note,"No genuine existing-bead meditation face "+id+"."+bead);
   assert.equal(note.dataset.aoRosaryGuidedBead,id+".b"+bead);
   assert.equal(note.dataset.aoRosaryContext,"editorial-meditation");
   assert.equal(note.lang,french?"fr":"en");
   assert.equal(note.children[0]?.textContent,ROSARY_GUIDED_BEAD_MEDITATIONS_V1[id][bead-1][french?"fr":"en"]);
   assert.equal(note.dataset.aoRosarySourceType,ROSARY_GUIDED_BEAD_EVIDENCE_V1[id][bead-1].relationship);
   checks++;
  }
 }
}
assert.ok(src.includes("window.AOTraditionalPrayerBook?.openModule?.('rosary'"),"Canonical rosary donor handoff lost");
assert.ok(src.includes("AO_ROSARY_V381"),"Existing original bead owner absent");
assert.ok(src.includes("data-ao-rosary-exact-donor"),"Locked donor marker must remain");
assert.ok(!src.includes("new RosaryEngine"),"Do not introduce a competing Rosary engine");
console.log("PASS · "+checks+" original-source-to-rendered Angelus/Regina and existing-donor Rosary checks: 8/4 units × EN/FR/Latin and Latin default toggle, 200 bilingual editorial bead meditations × EN/FR rendered by source policy, five traditional Rosary methods and locked canonical bead owner; no fabricated Scripture quotations");
