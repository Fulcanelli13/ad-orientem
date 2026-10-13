// Source-owned 1962 multiple-oration delivery: no duplicate Oremus,
// no invented conclusion for a commemoration joined under one conclusion.
// Exercises the actual Proper slot + display-composition implementations.
import assert from "node:assert/strict";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {composeProperReaderParagraphs} from "../src/mass/proper-reader-composition.js";

const t=(tag)=>({lat:"Latin "+tag+" ... Per Dominum. Amen.",
  en:"English "+tag+" ... Through our Lord. Amen.",
  fr:"Français "+tag+" ... Par Notre-Seigneur. Ainsi soit-il."});
function proper({collects=[t("Collect")],secrets=[t("Secret")],
  postcommunions=[t("Postcommunion")]}={}){
  return {
    sourcePath:"Sancti/10-07",
    introit:t("Introit"),collects,epistle:t("Epistle"),
    gradual:t("Gradual"),gospel:t("Gospel"),offertory:t("Offertory"),
    secrets,preface:t("Preface"),communion:t("Communion"),postcommunions,
  };
}
const blockId={
  COLLECT_SET:"AO.SM.B019",
  SECRET_SET:"AO.SM.B040",
  POSTCOMMUNION_SET:"AO.SM.B088",
};
const content=(slot,group,lang)=>composeProperReaderParagraphs(blockId[slot],
  group.slots[slot].data.paragraphs,{language:lang});
const isOremus=x=>/Orémus\./.test(x.latin);
const isResponse=x=>x.kind==="RESPONSE"&&/Amen\./.test(x.latin);

for(const lang of ["en","fr"]){
  const singleton=properToReaderSlots(proper(),{language:lang});
  assert.equal(singleton.ready,true);
  for(const slot of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]){
    const rendered=content(slot,singleton,lang);
    assert.equal(rendered.filter(isOremus).length,0,
      slot+": the initial invitation is already in the Ordinary");
    assert.equal(rendered.filter(isResponse).length,
      slot==="SECRET_SET"?0:1,slot+": single canonical final response");
  }

  const two=properToReaderSlots(proper({
    collects:[t("Collect 1"),t("Collect 2")],
    secrets:[t("Secret 1"),t("Secret 2")],
    postcommunions:[t("Post 1"),t("Post 2")],
  }),{language:lang});
  assert.equal(two.ready,true);
  for(const slot of ["COLLECT_SET","POSTCOMMUNION_SET"]){
    const rows=content(slot,two,lang);
    assert.equal(rows.length,5,slot+": two prayers + two responses + later Oremus");
    assert.equal(rows[0].orationGroupIndex,1);
    assert.ok(isResponse(rows[1]),slot+": response at end of first prayer");
    assert.ok(isOremus(rows[2]),slot+": second Oremus");
    assert.equal(rows[2].speakerRole,"PRIEST");
    assert.equal(rows[2].vernacular,lang==="fr"?"Prions.":"Let us pray.");
    assert.equal(rows[3].orationGroupIndex,2);
    assert.ok(isResponse(rows[4]),slot+": final canonical response retained");
    assert.ok(rows[1].id!==rows[4].id,slot+": no duplicate response ownership");
    assert.equal(rows[1].sourceAnchorCueId,slot==="COLLECT_SET"?
      "AO.SM.C0073":"AO.SM.C0254");
  }
  const secretRows=content("SECRET_SET",two,lang);
  assert.equal(secretRows.length,2,"Two Secrets have no new Oremus or public Amen");
  assert.ok(secretRows.every(p=>p.kind==="TEXT"));

  // Two extra commemorations are grouped under ONE conclusion; even
  // though the reader illuminates two paragraphs, their group remains 2.
  const joined=(tag)=>{
    const segments={};
    for(const code of ["lat","en","fr"]){
      const principal=code+" "+tag+" commemoration A",
        additional=code+" "+tag+" commemoration B",
        conclusion=code+" "+tag+" conclusion Amen.";
      segments[code]={principal,additional,conclusion};
    }
    return Object.assign(Object.fromEntries(
      ["lat","en","fr"].map(code=>[
        code,segments[code].principal+"\n\n"+
          segments[code].additional+"\n"+segments[code].conclusion,
      ])),{
      oneConclusion:{status:"CERTIFIED",kind:"MULTIPLE_COMMEMORATIONS",segments}
    });
  };
  const triple=properToReaderSlots(proper({
    collects:[t("Collect principal"),joined("collect")],
    secrets:[t("Secret principal"),joined("secret")],
    postcommunions:[t("Post principal"),joined("post")],
  }),{language:lang});
  assert.equal(triple.ready,true);
  for(const slot of ["COLLECT_SET","POSTCOMMUNION_SET"]){
    const rows=content(slot,triple,lang);
    assert.equal(rows.length,6,slot+": principal + grouped 2-prayer block + two interludes + final response");
    assert.equal(rows.filter(isOremus).length,1,
      slot+": third Collect shares group and must NOT trigger a third Oremus");
    assert.equal(rows.filter(isResponse).length,2,
      slot+": no extra response at shared conclusion");
    assert.equal(rows[3].orationGroupIndex,2);
    assert.equal(rows[4].orationGroupIndex,2);
    assert.equal(rows[3].liturgicalGroup,"COLLECT_UNDER_ONE_CONCLUSION");
    assert.equal(rows[4].liturgicalGroup,"COLLECT_UNDER_ONE_CONCLUSION");
  }
  const threeSecrets=content("SECRET_SET",triple,lang);
  assert.equal(threeSecrets.length,3);
  assert.equal(threeSecrets.filter(isOremus).length,0);
  assert.equal(threeSecrets.filter(isResponse).length,0);

  // Mission/Peter-Paul single-conclusion case: no phantom invitation.
  const singleJoined=properToReaderSlots(proper({
    collects:[joined("mission")],
    secrets:[joined("secret")],
    postcommunions:[joined("post")],
  }),{language:lang});
  assert.equal(singleJoined.ready,true);
  for(const slot of ["COLLECT_SET","POSTCOMMUNION_SET"]){
    const rows=content(slot,singleJoined,lang);
    assert.equal(rows.length,3,slot+": two text units under single conclusion, final Amen");
    assert.equal(rows.filter(isOremus).length,0);
    assert.equal(rows.filter(isResponse).length,1);
  }

  // The two-group output must be presentation-only and leave source text intact.
  const parent=proper({collects:[t("P"),t("Q")]});
  const snapshot=JSON.stringify(parent);
  const mapped=properToReaderSlots(parent,{language:lang});
  content("COLLECT_SET",mapped,lang);
  assert.equal(JSON.stringify(parent),snapshot);
}
console.log("PASS: 1962 Collect/Postcommunion Oremus and intermediate Amen group boundaries, EN/FR; Secrets and single-conclusion exceptions preserved.");
