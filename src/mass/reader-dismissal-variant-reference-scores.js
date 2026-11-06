// Source-owning GregoBase/Solesmes 1961 dismissal alternatives.
// DO NOT confuse these two formulae with normal Ite, missa est.
// All records research-preview only; publication requires printed musical
// collation and explicit editorial approval. No invented notes / audio.
export const DISMISSAL_VARIANT_REFERENCE_SCHEMA="ao-mass-dismissal-variant-reference-v1";
export const DISMISSAL_VARIANT_ORIGINAL_WITNESSES=Object.freeze([
  {
    "key": "BENEDICAMUS_VIII",
    "sourceId": 2901,
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=2901",
    "sourceFolio": "The Liber Usualis (Solesmes, 1961), pp. 39–40",
    "formula": "BENEDICAMUS_DOMINO",
    "settingId": "BENEDICAMUS_VIII",
    "riteScope": "ORDINARY",
    "fullSourceGabc": "name:Benedicamus VIII;\noffice-part:Kyriale;\nmode:5;\nbook:The Liber Usualis, 1961, p. 39 & The Liber Usualis, 1961, p. 40 & Chants of the Church, 1956, p. 22;\n%%\n(c3) BE(gxd)ne(f')di(g)cá(h)mus(h.) Dó(gxivHGh.kvIH'Ghih.)(,)(gxhvFE'Dgf)mi(e[ll:1]d)no.(d.) (::) (Z-)\n~~~~~<sp>R/</sp>. De(gxd!fgh)o(h.ivHGh.kvIH'Ghih.) (,) (gxhvFE'Dgf) grá(e')ti(e)as.(d.) (::)",
    "originalPhraseCount": 2,
    "publicScoreApproved": false,
    "printedNoteParity": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION"
  },
  {
    "key": "REQUIESCANT",
    "sourceId": 823,
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=823",
    "sourceFolio": "Graduale Romanum (Solesmes, 1961), p. 102*; Liber Usualis (1961), p. 1815",
    "formula": "REQUIESCANT_IN_PACE",
    "settingId": "REQUIESCANT_1961",
    "riteScope": "REQUIEM",
    "fullSourceGabc": "name:Requiescant;\noffice-part:Kyriale;\nbook:Graduale Romanum, 1961, p. 102* & The Liber Usualis, 1961, p. 1815 & Chants of the Church, 1956, p. 70;\ntranscriber:Andrew Hinkley;\n%%\n(c4) RE(g)qui(h)é(h)scant(g') in(h) pa(hg)ce.(g.) (::) <sp>R/</sp>. A(g)men.(gh..) (::)",
    "originalPhraseCount": 2,
    "publicScoreApproved": false,
    "printedNoteParity": "PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION"
  }
].map(Object.freeze));
const SOURCE_CUES=Object.freeze(["AO.SM.C0259","AO.SM.C0260"]);
const EXPECTED=Object.freeze({
  "BENEDICAMUS_VIII": [
    "℣. Benedicámus Dómino.",
    "℟. Deo grátias."
  ],
  "REQUIESCANT": [
    "℣. Requiéscant in pace.",
    "℟. Amen."
  ]
});
function extract(witness){
 const full=String(witness.fullSourceGabc);
 const parts=full.slice(full.indexOf("%%")+2).trim().split("(::)").map(x=>x.trim()).filter(Boolean);
 if(parts.length!==2||!parts[0].startsWith("(")||!parts[1].includes("<sp>R/</sp>"))
   throw Error("UNEXPECTED_1961_DISMISSAL_PHRASE_SHAPE: "+witness.key);
 const clef=(parts[0].match(/^\(([cf][1-4])\)/)||[])[0];
 if(!clef)throw Error("DISMISSAL_CLEF_MISSING");
 return SOURCE_CUES.map((sourceCueId,i)=>Object.freeze({
  id:"AO.REF."+witness.key+"."+sourceCueId.slice(-4),
  sourceId:witness.sourceId,sourceName:witness.key,sourceUrl:witness.sourceUrl,
  sourceFolio:witness.sourceFolio,
  sourcePhraseIndex:i,sourceCueIds:Object.freeze([sourceCueId]),
  sourceCueLatin:Object.freeze([EXPECTED[witness.key][i]]),
  sourceLatin:EXPECTED[witness.key][i],
  kind:i===0?"DISMISSAL_MINISTER":"PEOPLE_RESPONSE",
  eventId:"DISMISSAL",toneFamily:"EXPLICIT_DISMISSAL_VARIANT",
  formula:witness.formula,settingId:witness.settingId,riteScope:witness.riteScope,
  printVerification:witness.printedNoteParity,publicScoreApproved:false,
  gabc:"name: "+witness.key+" "+sourceCueId+";\noffice-part:Kyriale;\nsource: "+witness.sourceFolio+
       ";\n%%\n"+clef+" "+parts[i].replace(/^\([cf][1-4]\)/,"")
          .replace(/^\s*\(Z-?\)\s*/,"").replace(/^~+\s*/,"").trim()+" (::)"
 }));
}
export const DISMISSAL_VARIANT_REFERENCE_SCORES=Object.freeze(
 DISMISSAL_VARIANT_ORIGINAL_WITNESSES.flatMap(extract));
