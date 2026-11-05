// Exact 1961 *Gospel response* source GABCs, never a complete Gospel reading.
// The GregoBase records #4490/#4491 explicitly omit the example Gospel text.
// Original GABC stored in sourceWitnesess; the only excerpts taken are the
// independently printed responder phrases, not a constructed text-tone score.
// Both scores stay research-only until printed-neume collation and approval.
export const GOSPEL_1961_REFERENCE_WITNESSES=Object.freeze([
  {
    "sourceId": 4490,
    "sourceName": "Dominus vobiscum (Toni Evangelii)",
    "toneFamily": "GOSPEL_STANDARD",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 106; Graduale Romanum 1961 p. 126*",
    "gabc": "name:Dominus vobiscum (Toni Evangelii);\noffice-part:Toni Communes;\nbook:Graduale Romanum, 1961, p. 126* & The Liber Usualis, 1961, p. 106;\n%%\n(c3) DO(h)mi(h)nus(h) vo(h)bís(h)cum.(h.) (::) <sp>R/</sp>. Et(h) cum(h) spí(h)ri(h)tu(h) tu(h)o.(h.) (::) (Z)\nSe(h)quén(h)ti(h)a(h) san(h)cti(h) E(h)van(h)gé(h)li(h)i(h) se(h)cún(h)dum(f) Mat(h)thaé(hr1.)um.(h.) (::) (Z)\n<sp>R/</sp>. Gló(h)ri(h)a(h) ti(h)bi(f) Dó(hr1)mi(h)ne.(h.) (::)"
  },
  {
    "sourceId": 4491,
    "sourceName": "Dominus vobiscum (Toni Evangelii: Alter Tonus ad libitum.)",
    "toneFamily": "GOSPEL_ALTERNATE_AD_LIBITUM",
    "sourceFolio": "Liber Usualis (Solesmes, 1961), p. 107; Graduale Romanum 1961 p. 127*",
    "gabc": "name:Dominus vobiscum (Toni Evangelii: Alter Tonus ad libitum.);\noffice-part:Toni Communes;\nbook:Graduale Romanum, 1961, p. 127* & The Liber Usualis, 1961, p. 107;\n%%\n(c3) DO(h)mi(h)nus(h) vo(f)bís(h)cum.(h.) (::) <sp>R/</sp>. Et(h) cum(h) spí(h)ri(h)tu(f) tu(h)o.(h.) (::) (Z)\nSe(h)quén(h)ti(h)a(h) san(h)cti(f) E(hr1)van(g)gé(gr1)li(h)i(h.) (,) se(h)cún(h)dum(h) Jo(h)án(hr1f)nem.(f.) (::) (Z)\n<sp>R/</sp>. Gló(h)ri(h)a(h) ti(h)bi(f) Dó(h)mi(h)ne.(h.) (::)"
  }
]
 .map(w=>Object.freeze({...w,sourceUrl:"https://gregobase.selapa.net/chant.php?id="+w.sourceId,
    publicScoreApproved:false})));
const sourceResponses=Object.freeze([
 Object.freeze({sourceCueId:"AO.SM.C0083",sourceCueLatin:"℟. Et cum spíritu tuo.",
    phraseIndex:1,eventId:"GOSPEL",kind:"PEOPLE_RESPONSE",label:"Gospel greeting"}),
 Object.freeze({sourceCueId:"AO.SM.C0085",sourceCueLatin:"℟. Glória tibi, Dómine.",
    phraseIndex:3,eventId:"GOSPEL",kind:"PEOPLE_RESPONSE",label:"Gospel proclamation"})
]);
const extract=w=>{
 const body=w.gabc.slice(w.gabc.indexOf("%%")+2).trim();
 const phrases=body.split("(::)").map(x=>x.trim()).filter(Boolean);
 if(phrases.length!==4||!body.startsWith("(c3)")||
    !phrases[1].includes("Et(")||!phrases[3].includes("Gló("))
  throw new Error("ORIGINAL_1961_GOSPEL_RESPONSE_SOURCE_SHAPE_CHANGED");
 return sourceResponses.map(response=>{
  // (Z) is the blank-space separator after the preceding printed system,
  // not a neume to import into the isolated congregational response.
  const line=phrases[response.phraseIndex].replace(/^\(Z\)\s*/,"");
  return Object.freeze({
   id:"AO.REF.GOSPEL_"+w.sourceId+"."+response.sourceCueId.slice(-4),
   sourceId:w.sourceId,sourceName:w.sourceName,sourceUrl:w.sourceUrl,
   sourceFolio:w.sourceFolio,
   sourceDocument:"src/mass/reader-gospel-response-reference-scores.js",
   sourcePhraseIndex:response.phraseIndex,
   sourceCueIds:Object.freeze([response.sourceCueId]),
   sourceCueLatin:Object.freeze([response.sourceCueLatin]),
   sourceLatin:response.sourceCueLatin,
   kind:response.kind,eventId:response.eventId,toneFamily:w.toneFamily,
   settingId:w.toneFamily,
   sourceLabel:response.label,
   printVerification:"PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
   publicScoreApproved:false,
   fullGospelIncluded:false,
   gabc:"name: "+w.sourceName+" — "+response.label+
    ";\noffice-part: Toni Communes;\nsource: "+w.sourceFolio+";\n%%\n(c3) "+line+" (::)"
  });
 });
};
export const GOSPEL_RESPONSE_REFERENCE_SCORES=Object.freeze(
 GOSPEL_1961_REFERENCE_WITNESSES.flatMap(extract));
