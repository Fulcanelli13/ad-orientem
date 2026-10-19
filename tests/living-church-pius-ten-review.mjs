import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createPiusXTenEditorialReview,piusTenEditorialScene} from
 "../previews/visible-mass-3d/living-church-pius-ten-review.mjs";

const demo=()=>({
 schema:"AO_PIUS_X_CONTENT_OWNED_TEN_CONVERSATION_PILOT_V1",
 status:"SOURCE_FIRST_VOICE_EDIT_V2_PILOT_UNAPPROVED",
 totals:{topics:10,approvedAnswers:0,avatarConversationTurns:23,outOfCharacterEditorialNotes:7},
 globalReleaseGates:{publication:false,humanTheologyApproval:false,voiceStyleApproval:false},
 episodes:Array.from({length:10},(_,i)=>{
  const n=String(i+1).padStart(2,"0"),id="SPX-PILOT-"+n;
  return {id,sourceUrl:"https://www.vatican.va/source/test-"+n,
   sourceScope:"Document Q"+n,spriteSuggestion:"explaining",
   publishable:false,renderedByApp:false,independentHistoricalCertification:false,
   turns:Array.from({length:3},(_,j)=>{
    const editorial=i<7&&j===2,turnId=id+"-T"+(j+1);
    return {id:turnId,sourceRef:id,visitorRelease:false,editorialApproval:false,
      sourceCheckedForSubstantiveClaims:false,sourceLanguageTranslationApproval:false,
      periodVoiceApproval:false,avatarLineAllowed:!editorial,
      speaker:editorial?"DOCUMENTARY_EDITORIAL_NOTE_NOT_PIUS_X":"PIUS_X_EDUCATIONAL_RECONSTRUCTION",
      editorialDisplaySurface:editorial?"OUT_OF_CHARACTER_SOURCE_NOTE":"PIUS_X_SOURCE_BOUNDED_DIALOGUE",
      language:{en:{visitor:"Visitor question "+turnId,response:"Source-bound draft "+turnId},
       fr:{visitor:"Question du visiteur "+turnId,response:"Brouillon historique "+turnId}}};
   })};
 })
});
const dataset=process.argv[2]?JSON.parse(readFileSync(process.argv[2],"utf8")):demo();
const review=createPiusXTenEditorialReview(dataset);
assert.equal(review.version,"AO_PIUS_X_TEN_EDITORIAL_REVIEW_BRIDGE_V1");
assert.equal(review.published,false);
assert.deepEqual(review.counts,{episodes:10,turns:30,character:23,editorialNotes:7,approved:0});
const home=piusTenEditorialScene(review,review.entry);
assert.equal(home.editorial,true);
assert.equal(home.actions.length,11);
for(let i=1;i<=10;i++){
 const family="SPX-PILOT-"+String(i).padStart(2,"0");
 for(let j=1;j<=3;j++){
  const id="pius-draft-"+family+"-T"+j;
  const en=piusTenEditorialScene(review,id,"en");
  const fr=piusTenEditorialScene(review,id,"fr");
  assert.ok(en?.text&&fr?.text);
  assert.match(en.label,/UNAPPROVED|EDITORIAL NOTE/);
  assert.ok(en.actions.some(x=>x[1]==="pius-review-source"));
  assert.equal(en.sourceUrl,fr.sourceUrl);
  assert.ok(en.sourceUrl.startsWith("https://"));
  if(en.editorial){
   assert.equal(en.pose,null,"Editor-only historical/canonical caveat must not show a Pius X sprite");
   assert.equal(en.label,"EDITORIAL NOTE · NOT ST PIUS X");
  }else assert.ok(["neutral","welcoming","explaining","thoughtful","grave"].includes(en.pose));
 }
}
const mutation=copy=>structuredClone(copy);
for(const change of [
 d=>{d.episodes[0].turns[0].editorialApproval=true;},
 d=>{d.episodes[0].turns[0].visitorRelease=true;},
 d=>{d.episodes[0].turns[0].sourceLanguageTranslationApproval=true;},
 d=>{d.episodes[0].turns[0].speaker="AUTHENTIC_POPE_QUOTE";},
 d=>{d.episodes[0].turns[2].avatarLineAllowed=true;},
 d=>{d.episodes[0].sourceUrl="https://example.net/wrong/source";},
 d=>{d.globalReleaseGates.publication=true;},
 d=>{d.episodes[1].sourceUrl="javascript:alert(1)";},
 d=>{d.totals.approvedAnswers=1;}
]){
 const next=mutation(dataset);
 change(next);
 assert.throws(()=>createPiusXTenEditorialReview(next),/refused/);
}
assert.equal(piusTenEditorialScene(review,"missing"),null);
console.log("PASS Pius X editor-only original visual-novel adapter: 10 families, 30 turns, 23 sprites, 7 explicitly non-character notes, EN/FR, 9 forbidden mutations rejected");
