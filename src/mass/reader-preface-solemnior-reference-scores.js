// Research-only third Preface tone from two 1961 Solesmes witnesses.
// It is NOT part of the source-certified public Gregorian Mass reader.
// The 1961 sources print "3. Tonus solemnior"; they DO NOT by themselves
// establish a selected parish/Mass context or owner musical approval.
//
// Full original GABC downloaded from GregoBase #4451 on 2026-11-06.
// Source plates:
// Graduale Romanum (Solesmes 1961) p.132*
//   https://gregobase.selapa.net/sources/2/1009.png
// Liber Usualis (Solesmes 1961) p.110
//   https://gregobase.selapa.net/sources/3/221.png
// Only the four exact congregation-response phrases are excerpted, with the
// original c3 clef and ALL neumes and Solesmes marks intact.
export const PREFACE_SOLEMNIOR_SOURCE_ID=4451;
export const PREFACE_SOLEMNIOR_ORIGINAL_GABC=String.raw`name:Toni Praefationum (3. Tonus solemnior);
office-part:Toni Communes;
book:Graduale Romanum, 1961, p. 132* & The Liber Usualis, 1961, p. 110;
%%
(c3) PER(c) ó(e)mni(f)a(f) saé(g)cu(f)la(f) sae(e)cu(f)ló(fe)rum.(e.) (::)
<sp>R/</sp>. A(e)men.(ef..) (::)
<nlba><sp>V/</sp>. Dó(e)mi(f)nus</nlba>(gf) vo(ef)bís(gf)cum.(f.) (::)
<sp>R/</sp>. Et(e) cum(f) spí(g)ri(f)tu(ef) tu(gf)o.(f.) (::)
<sp>V/</sp>. Sur(e.f!gwh)sum(gf) cor(fg)da.(fe..) (::)
<sp>R/</sp>. Ha(e)bé(e.f!gwh)mus(g) ad(gf~) Dó(f!gwh)mi(f)num.(fe..) (::)
<sp>V/</sp>. Grá(h)ti(gvFE)as(f) a(f)gá(hg)mus(g.) (,)
Dó(f!gwh)mi(g)no(fe) De(ef)o(h) no(gfg)stro.(f.) (::)
<sp>R/</sp>. Di(f!gwh)gnum(g) et(gf~) ju(f!gwh)stum(f) est.(fe..) (::)`;
export const PREFACE_SOLEMNIOR_SOURCE_URL=
 "https://gregobase.selapa.net/chant.php?id=4451";
export const PREFACE_SOLEMNIOR_SOURCE_DOWNLOAD=
 "https://gregobase.selapa.net/download.php?elem=1&format=gabc&id=4451";
export const PREFACE_SOLEMNIOR_WITNESSES=Object.freeze([
 Object.freeze({book:"Liber Usualis (Solesmes, 1961)",page:"110",
  url:"https://gregobase.selapa.net/sources/3/221.png"}),
 Object.freeze({book:"Graduale Romanum (Solesmes, 1961)",page:"132*",
  url:"https://gregobase.selapa.net/sources/2/1009.png"})
]);
const phrases=PREFACE_SOLEMNIOR_ORIGINAL_GABC.split("%%")[1]
 .split("(::)").map(s=>s.trim()).filter(Boolean);
const rows=[
 {index:1,cueId:"AO.SM.C0136",latin:"℟. Amen.",label:"Amen"},
 {index:3,cueId:"AO.SM.C0138",latin:"℟. Et cum spíritu tuo.",label:"Et cum spiritu tuo"},
 {index:5,cueId:"AO.SM.C0140",latin:"℟. Habémus ad Dóminum.",label:"Habemus ad Dominum"},
 {index:7,cueId:"AO.SM.C0143",latin:"℟. Dignum et iustum est.",label:"Dignum et iustum est"}
];
if(phrases.length!==8||!phrases[0].startsWith("(c3)"))
 throw Error("PREFACE_SOLEMNIOR_1961_ORIGINAL_WITNESS_CHANGED");
export const PREFACE_SOLEMNIOR_RESEARCH_SCHEMA="ao-1961-preface-solemnior-four-extra-research-cues-v1";
export const PREFACE_SOLEMNIOR_RESEARCH_SCORES=Object.freeze(rows.map((row,i)=>{
 const phrase=phrases[row.index];
 if(!phrase?.startsWith("<sp>R/</sp>."))
  throw Error("PREFACE_SOLEMNIOR_PHRASE_INDEX_CHANGED_"+row.index);
 return Object.freeze({
  id:"AO.REF.PREFACE_SOLEMNIOR_1961."+row.cueId.split(".").at(-1),
  eventId:["PREFACE_GREETING","PREFACE_GREETING","PREFACE_SURSUM_CORDA","PREFACE_GRATIAS"][i],
  sourceId:PREFACE_SOLEMNIOR_SOURCE_ID,
  sourceName:"Toni Praefationum (3. Tonus solemnior)",
  sourceUrl:PREFACE_SOLEMNIOR_SOURCE_URL,
  sourceFolio:"Liber Usualis (Solesmes 1961), p.110; Graduale Romanum (Solesmes 1961), p.132*",
  sourcePhraseIndex:row.index,
  sourceCueIds:Object.freeze([row.cueId]),
  sourceCueLatin:Object.freeze([row.latin]),
  sourceLatin:row.latin,
  printedLabel:row.label,
  kind:"PEOPLE_RESPONSE",
  toneFamily:"SOLEMNIOR_1961_SOURCE_UNASSIGNED",
  printWitnesses:PREFACE_SOLEMNIOR_WITNESSES,
  originalFullSourceGabc:PREFACE_SOLEMNIOR_ORIGINAL_GABC,
  gabc:"name: "+row.label+" (Tonus solemnior 1961);"+
       "
office-part: Toni Communes;
source: GR 1961 p.132*, LU 1961 p.110;"+
       "
%%
(c3) "+phrase+" (::)",
  originalSourceGabcChecked:true,
  printedPagesLocated:true,
  printedNoteParity:"PENDING_INDEPENDENT_NEUME_COLLATION",
  actualRitualSetting:"NOT_CERTIFIED",
  exactSourceContextCertified:false,
  researchOnly:true,
  publicScoreApproved:false,
  reviewerDecision:"UNREVIEWED",
  publicationGate:"USER_AND_MUSICAL_SOURCE_REVIEWED_REQUIRED"
 });
}));
