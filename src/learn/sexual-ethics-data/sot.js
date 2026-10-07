import { CSE_QUESTIONS, CSE_SOURCE_MAP } from "./index.js";

export const CSE_SOT_VERSION="CSE_SOT_V2";

export const CSE_RELATED_TARGETS=Object.freeze({
  "learn.catechism":Object.freeze({id:"learn.catechism",surface:"learn",label:Object.freeze(["Traditional Catechism","Catéchisme traditionnel"])}),
  "learn.rites.matrimony":Object.freeze({id:"learn.rites.matrimony",surface:"learn",label:Object.freeze(["Matrimony formation","Formation au mariage"])}),
  "learn.catholic_life":Object.freeze({id:"learn.catholic_life",surface:"learn",label:Object.freeze(["Catholic Life","Vie catholique"])}),
  "pray.confession":Object.freeze({id:"pray.confession",surface:"pray",label:Object.freeze(["Confession preparation","Préparation à la confession"])}),
});

const SECTION_EVIDENCE=Object.freeze({
  foundations:Object.freeze(["PHILOSOPHY","MORAL_THEOLOGY"]),
  authority:Object.freeze(["MAGISTERIUM","EXEGESIS","HISTORY"]),
  chastity:Object.freeze(["MORAL_THEOLOGY","ASCETICS"]),
  courtship:Object.freeze(["MORAL_THEOLOGY","PASTORAL_PRUDENCE"]),
  marriage:Object.freeze(["MAGISTERIUM","CANON_LAW","MORAL_THEOLOGY"]),
  marital:Object.freeze(["MORAL_THEOLOGY","MAGISTERIUM","PASTORAL_PRUDENCE"]),
  contraception:Object.freeze(["MAGISTERIUM","MORAL_THEOLOGY"]),
  pornography:Object.freeze(["MORAL_THEOLOGY","MAGISTERIUM","PASTORAL_PRUDENCE"]),
  homosexuality:Object.freeze(["MAGISTERIUM","MORAL_THEOLOGY","PASTORAL_PRUDENCE"]),
  gender:Object.freeze(["LATER_MAGISTERIUM","ANTHROPOLOGY","EMPIRICAL_SCIENCE"]),
  reproduction:Object.freeze(["BIOETHICS","MAGISTERIUM","MEDICINE"]),
  violence:Object.freeze(["MORAL_THEOLOGY","VOLUNTARINESS","EMPIRICAL_SCIENCE"]),
  "family-digital":Object.freeze(["PARENTAL_EDUCATION","MORAL_THEOLOGY","ANALOGICAL_APPLICATION"]),
  confession:Object.freeze(["SACRAMENTAL_DISCIPLINE","MORAL_THEOLOGY","CANON_LAW"]),
  popular:Object.freeze(["APOLOGETICS","MORAL_THEOLOGY","PASTORAL_PRUDENCE"]),
});

const SECTION_RELATED=Object.freeze({
  foundations:Object.freeze(["learn.catechism"]),
  authority:Object.freeze(["learn.catechism"]),
  chastity:Object.freeze(["learn.catholic_life"]),
  courtship:Object.freeze(["learn.rites.matrimony"]),
  marriage:Object.freeze(["learn.rites.matrimony"]),
  marital:Object.freeze(["learn.rites.matrimony"]),
  contraception:Object.freeze(["learn.rites.matrimony"]),
  reproduction:Object.freeze(["learn.rites.matrimony"]),
  confession:Object.freeze(["pray.confession"]),
  "family-digital":Object.freeze(["learn.catholic_life"]),
});

const CONFIDENCE_OVERRIDES=Object.freeze({
  CSE014:"HISTORICAL_DOSSIER",
  CSE029:"MIXED_EVIDENCE",
  CSE070:"CASE_ANALYSIS",
  CSE076:"CASE_ANALYSIS",
  CSE088:"MIXED_EVIDENCE",
  CSE094:"MIXED_EVIDENCE",
  CSE108:"CASE_ANALYSIS",
  CSE110:"UNRESOLVED_PRACTICAL",
  CSE112:"PRIMARY_PLUS_EMPIRICAL",
  CSE128:"ANALOGICAL_APPLICATION",
  CSE130:"ANALOGICAL_APPLICATION",
  CSE137:"PASTORAL_GUIDANCE",
  CSE149:"MIXED_EVIDENCE",
});

const GLOSSARY_TERMS=Object.freeze({
  CSE004:Object.freeze(["natural law"]),
  CSE010:Object.freeze(["intrinsically evil act","moral object"]),
  CSE016:Object.freeze(["conscience"]),
  CSE019:Object.freeze(["grave matter","mortal sin","culpability"]),
  CSE037:Object.freeze(["proximate occasion of sin"]),
  CSE052:Object.freeze(["marital debt"]),
  CSE063:Object.freeze(["moral object","intention","means"]),
  CSE068:Object.freeze(["direct sterilization"]),
  CSE069:Object.freeze(["double effect","foreseen effect","intended effect"]),
  CSE131:Object.freeze(["kind and number"]),
});

function precision(locator=""){
  const value=String(locator);
  if(/[§]|\bcan(?:n)?\.|\baa?\.|\b(?:Mt|Mk|Lk|Jn|Rom|Ex|Gen|1 Cor|2 Cor|1 Thess|2 Thess|Eph|Gal)\b|\bII\.[AB]\.|Sixth Commandment ·/i.test(value))return "EXACT_OR_NARROW";
  return "TOPICAL";
}

function uniq(values){return [...new Set(values.filter(Boolean))];}

export function relatedTargetsFor(item){
  const ids=uniq([...(SECTION_RELATED[item?.section]||[]),...(item?.cross||[])]);
  return Object.freeze(ids.map(id=>CSE_RELATED_TARGETS[id]).filter(Boolean));
}

function confidenceFor(item){
  if(CONFIDENCE_OVERRIDES[item.id])return CONFIDENCE_OVERRIDES[item.id];
  if(item.layer==="PASTORAL_CASE")return "CASE_ANALYSIS";
  if(item.layer==="LATER_APPLICATION")return "ANALOGICAL_OR_LATER_APPLICATION";
  return "HIGH";
}

function sourceRecords(item){
  return Object.freeze((item.refs||[]).map(([sourceId,locator])=>{
    const source=CSE_SOURCE_MAP[sourceId]||{};
    return Object.freeze({
      sourceId,
      locator,
      title:source.title||sourceId,
      authorityType:source.authority_type||"UNKNOWN",
      role:source.role||"UNKNOWN",
      precision:precision(locator),
      url:source.canonical_url||null,
      urlFr:source.canonical_url_fr||null,
    });
  }));
}

export const CSE_SOT_MATRIX=Object.freeze(CSE_QUESTIONS.map(item=>{
  const sources=sourceRecords(item);
  const crossLinks=relatedTargetsFor(item);
  const completeEn=Boolean(item.q?.[0]&&item.a?.[0]&&(item.depth==="STANDARD"||item.d?.[0]));
  const completeFr=Boolean(item.q?.[1]&&item.a?.[1]&&(item.depth==="STANDARD"||item.d?.[1]));
  const nonArgumentLead=sources.filter(source=>source.role!=="argument_lead");
  return Object.freeze({
    id:item.id,
    number:item.number,
    section:item.section,
    depth:item.depth,
    question:Object.freeze([...item.q]),
    proposition:Object.freeze([...item.a]),
    deeperArgument:item.d?Object.freeze([...item.d]):null,
    doctrinalLayer:item.layer,
    confidence:confidenceFor(item),
    evidenceDomains:SECTION_EVIDENCE[item.section]||Object.freeze(["MORAL_THEOLOGY"]),
    sources,
    hasNonArgumentLeadAuthority:nonArgumentLead.length>0,
    narrowCitationCount:sources.filter(source=>source.precision==="EXACT_OR_NARROW").length,
    topicalCitationCount:sources.filter(source=>source.precision==="TOPICAL").length,
    crossLinks,
    apostolateHandoff:item.depth==="DEBATE"?"APF06":null,
    glossaryTerms:GLOSSARY_TERMS[item.id]||Object.freeze([]),
    languageStatus:Object.freeze({en:completeEn?"COMPLETE":"INCOMPLETE",fr:completeFr?"COMPLETE":"INCOMPLETE"}),
  });
}));

export const CSE_GAP_AUDIT=Object.freeze([
  Object.freeze({topic:"Adultery / consensual non-monogamy",status:"COVERED",record:"CSE117",action:"Replaced low-value sexual-sacrilege slot in v2 hardening."}),
  Object.freeze({topic:"Double effect",status:"COVERED_BY_METHOD",records:Object.freeze(["CSE008","CSE009","CSE068","CSE069"]),action:"Keep as embedded method; no standalone question needed for a practical 150-question module."}),
  Object.freeze({topic:"Sexual sacrilege as a distinct species",status:"EXCLUDED_LOW_USER_VALUE",action:"Retain in specialist moral theology, not the main app corpus."}),
  Object.freeze({topic:"Detailed annulment law",status:"CROSS_LINK",target:"learn.rites.matrimony"}),
  Object.freeze({topic:"Detailed confession mechanics",status:"CROSS_LINK",target:"pray.confession",records:Object.freeze(["CSE119","CSE131","CSE132","CSE133","CSE134","CSE135","CSE136","CSE137","CSE138","CSE139","CSE140"])}),
  Object.freeze({topic:"Abortion and full embryo-personhood treatment",status:"OUT_OF_SCOPE",action:"Belongs in Bioethics / Life rather than Sexual Ethics."}),
  Object.freeze({topic:"Safeguarding procedures and reporting",status:"OUT_OF_SCOPE",action:"Pastoral/safeguarding owner; CSE retains moral distinctions about coercion and voluntariness."}),
  Object.freeze({topic:"Modern gender and digital sexual applications",status:"COVERED_AS_LATER_APPLICATION",records:Object.freeze(["CSE091","CSE092","CSE093","CSE094","CSE095","CSE096","CSE097","CSE098","CSE099","CSE100","CSE127","CSE128","CSE129","CSE130"])}),
  Object.freeze({topic:"Future fertility technologies",status:"COVERED_BY_PROTOCOL",record:"CSE107"}),
]);

export const CSE_SOT_AUDIT=Object.freeze({
  version:CSE_SOT_VERSION,
  records:CSE_SOT_MATRIX.length,
  bilingual:CSE_SOT_MATRIX.every(record=>record.languageStatus.en==="COMPLETE"&&record.languageStatus.fr==="COMPLETE"),
  allHaveNonArgumentLeadAuthority:CSE_SOT_MATRIX.every(record=>record.hasNonArgumentLeadAuthority),
  debateHandoffs:CSE_SOT_MATRIX.filter(record=>record.apostolateHandoff==="APF06").length,
  recordsWithCrossLinks:CSE_SOT_MATRIX.filter(record=>record.crossLinks.length>0).length,
  recordsWithNarrowCitation:CSE_SOT_MATRIX.filter(record=>record.narrowCitationCount>0).length,
  caseAnalysisRecords:Object.freeze(CSE_SOT_MATRIX.filter(record=>["CASE_ANALYSIS","PASTORAL_GUIDANCE","UNRESOLVED_PRACTICAL"].includes(record.confidence)).map(record=>record.id)),
  analogicalRecords:Object.freeze(CSE_SOT_MATRIX.filter(record=>String(record.confidence).includes("ANALOGICAL")).map(record=>record.id)),
});
