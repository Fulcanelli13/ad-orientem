// Display-only composition for ordinary text.
// Canonical cue identity is preserved in sourceCueIds; no ritual event timing changes.

const COMPOSITE_RULES = Object.freeze({
  "AO.SM.B016": Object.freeze([
    Object.freeze({
      sourceCueIds:Object.freeze(["AO.SM.C0053","AO.SM.C0054"]),
      id:"AO.SM.C0053+AO.SM.C0054",
      kind:"TEXT",
      latin:"Glória in excélsis Deo.",
      vernacular:Object.freeze({
        en:"Glory to God in the highest.",
        fr:"Gloire à Dieu au plus haut des cieux.",
      }),
    }),
  ]),
  // The immutable Low and Sung donors split one *single* versicle into
  // C0141 and C0142, causing "Deo nostro / our God" to float alone.
  // Recompose visually; retain both source cue IDs and the response C0143.
  "AO.SM.B044": Object.freeze([
    Object.freeze({
      sourceCueIds:Object.freeze(["AO.SM.C0141","AO.SM.C0142"]),
      id:"AO.SM.C0141+AO.SM.C0142",
      kind:"VERSICLE",
      latin:"℣. Grátias agámus Dómino Deo nostro.",
      vernacular:Object.freeze({
        en:"Let us give thanks to the Lord our God.",
        fr:"Rendons grâces au Seigneur notre Dieu.",
      }),
    }),
  ]),
  "AO.SM.B027": Object.freeze([
    Object.freeze({
      sourceCueIds:Object.freeze(["AO.SM.C0089","AO.SM.C0090"]),
      id:"AO.SM.C0089+AO.SM.C0090",
      kind:"TEXT",
      latin:"Credo in unum Deum.",
      vernacular:Object.freeze({
        en:"I believe in one God.",
        fr:"Je crois en un seul Dieu.",
      }),
    }),
  ]),
});

function languageKey(language){
  return String(language??"en").toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function composeOrdinaryReaderParagraphs(block, rawParagraphs, {language="en"}={}) {
  if(!block?.Block_ID) throw new TypeError("Canonical block required");
  if(!Array.isArray(rawParagraphs)) throw new TypeError("Raw paragraph array required");

  const rules=COMPOSITE_RULES[block.Block_ID] ?? [];
  if(!rules.length) return Object.freeze(rawParagraphs.map(x=>Object.freeze({...x})));

  const locale=languageKey(language);
  const consumed=new Set(rules.flatMap(rule=>rule.sourceCueIds));
  const byId=new Map(rawParagraphs.map(p=>[p.id,p]));
  for(const rule of rules){
    for(const cueId of rule.sourceCueIds){
      if(!byId.has(cueId)) throw new Error(block.Block_ID+": composite source cue missing "+cueId);
    }
  }

  const out=[];
  let ruleInserted=false;
  for(const paragraph of rawParagraphs){
    if(consumed.has(paragraph.id)){
      if(!ruleInserted){
        for(const rule of rules) out.push(Object.freeze({
          ...rule,
          vernacular:rule.vernacular?.[locale] ?? rule.vernacular?.en ?? "",
        }));
        ruleInserted=true;
      }
      continue;
    }
    out.push(paragraph);
  }
  return Object.freeze(out.map(x=>Object.freeze({...x})));
}
