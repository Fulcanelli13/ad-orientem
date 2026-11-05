// Exact 1961 common-tone responses. Source-pair ownership is essential:
// Canon closing Amen is not a generic replacement for prayer/Private Amens;
// Pax Domini Amen and Et cum spiritu tuo are bound to the two distinct
// source phrases before the Agnus Dei, never an inferred parish performance.
// This research-only Exsurge layer is NOT a printed-note certification.
export const CANON_PAX_RESPONSE_SCHEMA="ao-mass-canon-pax-responses-1961-v1";
export const CANON_PAX_1961_WITNESSES=Object.freeze([
  {
    "sourceId": 7282,
    "sourceName": "Per omnia ... Et ne nos inducas",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=7282",
    "sourceFolio": "Graduale Romanum (Solesmes, 1961), p. 132*; Liber Usualis (1961), p. 110",
    "fullSourceGabc": "name:Per omnia ... Et ne nos inducas;\noffice-part:Toni Communes;\nbook:Graduale Romanum, 1961, p. 132* & The Liber Usualis, 1961, p. 110;\ntranscriber:Veronica Brandt;\n%%\n(c3) PER(c) ó(e)mni(f)a(f) saé(g)cu(f)la(f) sae(e)cu(f)ló(fe)rum.(e.) (::) <sp>R/</sp>. A(e)men.(ef..) (::) <sp>V/</sp>. Et(c) ne(e) nos(f) in(f)dú(g)cas(f) in(f) ten(f)ta(e)ti(f)ó(fe)nem.(e.) (::) <sp>R/</sp>. Sed(e) lí(f)be(f)ra(f) nos(f) a(g) ma(fe)lo.(e.) (::)",
    "publicScoreApproved": false
  },
  {
    "sourceId": 4327,
    "sourceName": "Per omnia ... Pax Domini",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=4327",
    "sourceFolio": "Graduale Romanum (Solesmes, 1961), p. 133*; Liber Usualis (1961), p. 110",
    "fullSourceGabc": "name:Per omnia ... Pax Domini;\noffice-part:Toni Communes;\nbook:Graduale Romanum, 1961, p. 133* & The Liber Usualis, 1961, p. 110;\n%%\n(c3) PER(c) ó(e)mni(f)a(f) saé(g)cu(f)la(f) sae(e)cu(f)ló(fe)rum.(e.) (::)\n<sp>R/</sp>. A(e)men.(ef..) (::)\n<sp>V/</sp>. Pax(f) †~Dó(ef)mi(f)ni(f.) (,) sit(g) †~sem(f)per(e) vo(f)bís-(fe)†cum.(e.) (::)\n<sp>R/</sp>. Et(e) cum(f) spí(f)ri(e)tu(e) tu(f)o.(f.) (::)",
    "publicScoreApproved": false
  }
].map(Object.freeze));
const CUE_SPECS=Object.freeze([
  {
    "sourceId": 7282,
    "phraseIndex": 1,
    "sourceCueId": "AO.SM.C0207",
    "sourceCueLatin": "℟. Amen.",
    "eventId": "CANON_END",
    "sourceRole": "RESPONDERS"
  },
  {
    "sourceId": 4327,
    "phraseIndex": 1,
    "sourceCueId": "AO.SM.C0218",
    "sourceCueLatin": "℟. Amen.",
    "eventId": "PAX_DOMINI",
    "sourceRole": "RESPONDERS"
  },
  {
    "sourceId": 4327,
    "phraseIndex": 3,
    "sourceCueId": "AO.SM.C0220",
    "sourceCueLatin": "℟. Et cum spíritu tuo.",
    "eventId": "PAX_DOMINI",
    "sourceRole": "RESPONDERS"
  }
].map(Object.freeze));
function exactSourcePhrases(witness){
 const original=witness.fullSourceGabc;
 const body=original.slice(original.indexOf("%%")+2).trim();
 const clef=body.match(/^\(([cf][1-4])\)/)?.[0];
 if(!clef)throw Error("MISSING_PRINTED_CLEF_"+witness.sourceId);
 const phrases=body.split("(::)").map(v=>v.trim()).filter(Boolean);
 if(phrases.length!==4||phrases[0].indexOf("PER(")<0||
    !phrases[1].includes("A(")||!phrases[3].includes("<sp>R/</sp>"))
  throw Error("SOURCE_1961_COMMON_TONE_SHAPE_CHANGED_"+witness.sourceId);
 return {clef,phrases};
}
export const CANON_PAX_REFERENCE_SCORES=Object.freeze(CUE_SPECS.map(cue=>{
 const witness=CANON_PAX_1961_WITNESSES.find(w=>w.sourceId===cue.sourceId);
 if(!witness)throw Error("UNREGISTERED_SOURCE_"+cue.sourceId);
 const {clef,phrases}=exactSourcePhrases(witness);
 const original=phrases[cue.phraseIndex];
 if(!original.includes("<sp>R/</sp>"))throw Error("NOT_ORIGINAL_RESPONSE_PHRASE_"+cue.sourceCueId);
 return Object.freeze({
  id:"AO.REF."+cue.eventId+"."+cue.sourceCueId.slice(-4),
  sourceId:witness.sourceId,sourceName:witness.sourceName,sourceUrl:witness.sourceUrl,
  sourceFolio:witness.sourceFolio,sourceDocument:"src/mass/reader-canon-pax-response-reference-scores.js",
  sourcePhraseIndex:cue.phraseIndex,sourceCueIds:Object.freeze([cue.sourceCueId]),
  sourceCueLatin:Object.freeze([cue.sourceCueLatin]),sourceLatin:cue.sourceCueLatin,
  kind:"PEOPLE_RESPONSE",sourceRole:cue.sourceRole,eventId:cue.eventId,
  toneFamily:"PRINTED_COMMON_TONE_FIXED_EXCHANGE",settingId:"COMMON_1961_"+cue.sourceId,
  printVerification:"PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
  publicScoreApproved:false,
  gabc:"name: "+witness.sourceName+" response "+cue.sourceCueId+
   ";\\noffice-part:Toni Communes;\\nsource: "+witness.sourceFolio+
   ";\\n%%\\n"+clef+" "+original+" (::)"
 });
}));
