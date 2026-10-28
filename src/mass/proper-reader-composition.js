// Display-only composition for blocks that contain a resolved Proper payload
// followed by fixed canonical Mass text. This module never changes event timing or
// actor ownership; it only restores the fixed text that follows the Proper cue.

export const PINNED_PROPER_FOLLOWUPS = Object.freeze({
  // The source's Collect/Postcommunion Proper blocks contain response
  // cues but no printed words for them. Materialise those canonical
  // R. Amen cues after the resolved prayer text, as already done for
  // Deo gratias at the Epistle and Laus tibi after the Gospel.
  // Additional commemorations with separate conclusions require their
  // own sourced structure before additional responses may be inserted.
  "AO.SM.B019": Object.freeze([
    Object.freeze({
      id:"AO.SM.C0074",kind:"RESPONSE",latin:"℟. Amen.",
      vernacular:Object.freeze({en:"℟. Amen.",fr:"℟. Amen."}),
      role:"FIXED_RESPONSE",speakerRole:"RESPONDERS",
      speakerEvidence:"CANONICAL_PROPER_RESPONSE_CUE",
    }),
  ]),
  "AO.SM.B088": Object.freeze([
    Object.freeze({
      id:"AO.SM.C0255",kind:"RESPONSE",latin:"℟. Amen.",
      vernacular:Object.freeze({en:"℟. Amen.",fr:"℟. Amen."}),
      role:"FIXED_RESPONSE",speakerRole:"RESPONDERS",
      speakerEvidence:"CANONICAL_PROPER_RESPONSE_CUE",
    }),
  ]),
  "AO.SM.B020": Object.freeze([
    Object.freeze({
      id:"AO.SM.C0076",
      kind:"RESPONSE",
      latin:"℟. Deo grátias.",
      vernacular:Object.freeze({
        en:"℟. Thanks be to God.",
        fr:"℟. Nous rendons grâces à Dieu.",
      }),
      role:"FIXED_RESPONSE",speakerRole:"RESPONDERS",
    }),
  ]),
  "AO.SM.B026": Object.freeze([
    Object.freeze({
      id:"AO.SM.C0087",
      kind:"RESPONSE",
      latin:"℟. Laus tibi, Christe.",
      vernacular:Object.freeze({
        en:"℟. Praise be to Thee, O Christ.",
        fr:"℟. Louange à vous, ô Christ.",
      }),
      role:"FIXED_RESPONSE",speakerRole:"RESPONDERS",
    }),
    Object.freeze({
      id:"AO.SM.C0088",
      kind:"TEXT",
      latin:"Per evangélica dicta deleántur nostra delícta.",
      vernacular:Object.freeze({
        en:"By the words of the Gospel may our sins be blotted out.",
        fr:"Que par les paroles de l’Évangile nos péchés soient effacés.",
      }),
      role:"PRIEST_PRIVATE",speakerRole:"PRIEST",
    }),
  ]),
});

function languageKey(language){
  return String(language??"en").toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function composeProperReaderParagraphs(blockId, resolvedProperParagraphs, {language="en",form="SUNG",omitFixedCueIds=[]}={}) {
  if (!Array.isArray(resolvedProperParagraphs) || resolvedProperParagraphs.length === 0) {
    throw new TypeError("Resolved Proper paragraphs required");
  }
  const locale=languageKey(language);
  const low=String(form).toUpperCase()==="LOW";
  // Explicit Requiem omission applies ONLY to the private Gospel-book kiss
  // follow-up. Retain the Laus tibi response and every other Proper footnote.
  const omissions=new Set(omitFixedCueIds);
  if(omissions.size && (blockId!=="AO.SM.B026"||
    omissions.size!==1||!omissions.has("AO.SM.C0088")||
    (PINNED_PROPER_FOLLOWUPS["AO.SM.B026"]??[]).map(x=>x.id).join(",")!==
      "AO.SM.C0087,AO.SM.C0088"))
    throw new Error("REQUIEM_GOSPEL_FOLLOWUP_SOURCE_IDENTITY_MISMATCH");
  const fixed=(PINNED_PROPER_FOLLOWUPS[String(blockId)] ?? [])
    .filter(row=>!omissions.has(row.id)).map(row=>Object.freeze({
    ...row,
    speakerRole:low&&row.kind==="RESPONSE"?"MINISTERS":row.speakerRole,
    speakerEvidence:low&&row.kind==="RESPONSE"
      ?"CANONICAL_LOW_MASS_MINISTER_RESPONSE_CLOCK":row.speakerEvidence,
    vernacular:row.vernacular?.[locale] ?? row.vernacular?.en ?? "",
  }));
  // The first Oremus is already a canonical Ordinary cue (C0072/C0253).
  // Subsequent source-owned Collect/Postcommunion prayer groups require a
  // distinct Amen followed by Oremus. Grouped commemorations under one
  // conclusion retain ONE group index, so they do not get an extra invitation.
  // Secret prayers remain silent, without inserted Oremus or public Amen.
  const prayerAnchor=blockId==="AO.SM.B019"?"AO.SM.C0073":
    blockId==="AO.SM.B088"?"AO.SM.C0254":null;
  const rows=[];
  let lastGroup=null;
  for(const paragraph of resolvedProperParagraphs){
    const group=Number.isInteger(paragraph.orationGroupIndex) ?
      paragraph.orationGroupIndex : null;
    if(prayerAnchor && group!==null && lastGroup!==null && group!==lastGroup){
      if(group!==lastGroup+1)throw new Error(
        blockId+": source prayer groups out of order"
      );
      const label=blockId==="AO.SM.B019"?"COLLECT":"POSTCOMMUNION";
      const stem="R17.ORATION."+label+".G"+lastGroup;
      rows.push(Object.freeze({
        id:stem+".AMEN",kind:"RESPONSE",
        latin:"℟. Amen.",vernacular:"℟. Amen.",
        role:"FIXED_RESPONSE",speakerRole:low?"MINISTERS":"RESPONDERS",
        speakerEvidence:low?"1962_LOW_MASS_INTERMEDIATE_ORATION_MINISTER_RESPONSE":
          "1962_INTERMEDIATE_ORATION_RESPONDERS",
        prayerRole:"ORATION_RESPONSE",liturgicalGroup:"R17.ORATION."+label+".G"+lastGroup,
        sourceCueIds:Object.freeze([]),sourceAnchorCueId:prayerAnchor,
        sourceRule:"1960_MISSAL_RUBRICS_436_437_505",
        displayOnly:true,
      }));
      rows.push(Object.freeze({
        id:"R17.ORATION."+label+".G"+group+".OREMUS",kind:"VERSICLE",
        latin:"Orémus.",vernacular:locale==="fr"?"Prions.":"Let us pray.",
        role:"PRIEST",speakerRole:"PRIEST",
        prayerRole:"ORATION_INVITATION",liturgicalGroup:"R17.ORATION."+label+".G"+group,
        sourceCueIds:Object.freeze([]),sourceAnchorCueId:prayerAnchor,
        sourceRule:"1960_MISSAL_RUBRICS_436_437_505",
        displayOnly:true,
      }));
    }
    rows.push(Object.freeze({...paragraph}));
    if(group!==null)lastGroup=group;
  }
  return Object.freeze([...rows,...fixed]);
}
