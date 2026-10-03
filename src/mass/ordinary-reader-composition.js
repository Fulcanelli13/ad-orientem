// Display-only composition for ordinary text.
// Canonical cue identity is preserved in sourceCueIds; no ritual event timing changes.

const COMPOSITE_RULES = Object.freeze({
  "AO.SM.B016": Object.freeze([
    Object.freeze({
      sourceCueIds:Object.freeze(["AO.SM.C0053","AO.SM.C0054"]),
      id:"AO.SM.C0053+AO.SM.C0054",
      kind:"TEXT",
      latin:"Glória in excélsis Deo.",
      vernacular:"Glory to God in the highest.",
    }),
  ]),
});

export function composeOrdinaryReaderParagraphs(block, rawParagraphs) {
  if(!block?.Block_ID) throw new TypeError("Canonical block required");
  if(!Array.isArray(rawParagraphs)) throw new TypeError("Raw paragraph array required");

  const rules=COMPOSITE_RULES[block.Block_ID] ?? [];
  if(!rules.length) return Object.freeze(rawParagraphs.map(x=>Object.freeze({...x})));

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
        for(const rule of rules) out.push(rule);
        ruleInserted=true;
      }
      continue;
    }
    out.push(paragraph);
  }
  return Object.freeze(out.map(x=>Object.freeze({...x})));
}
