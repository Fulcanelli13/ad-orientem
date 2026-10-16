// Typed, source-gated descriptors. Never infer extraordinary gifts from sainthood.
const labels=Object.freeze({
 DOCTOR_OF_CHURCH:["Doctor of the Church","Docteur de l’Église"],
 CHURCH_FATHER:["Church Father","Père de l’Église"],
 DECLARED_PATRON:["Declared patron","Patron déclaré"],
 THEOLOGIAN:["Theologian","Théologien"],
 SPIRITUAL_WRITER:["Spiritual writer","Auteur spirituel"],
 CONTEMPLATIVE_RELIGIOUS:["Contemplative religious","Religieux contemplatif"],
 RELIGIOUS:["Religious","Religieux"],
 PRIEST:["Priest","Prêtre"],
 BISHOP:["Bishop","Évêque"],
 POPE:["Pope","Pape"],
 PASTOR:["Pastor","Pasteur"],
 MISSIONARY:["Missionary","Missionnaire"],
 MARTYR:["Martyr","Martyr"],
 MYSTIC:["Mystic","Mystique"],
 VISIONARY_WITNESS:["Visionary witness","Témoin de visions"],
 SPIRITUAL_DIRECTOR:["Spiritual director","Directeur spirituel"],
 FOUNDER:["Founder","Fondateur"],
 MONASTIC:["Monastic","Monastique"],
 HERMIT:["Hermit","Ermite"],
 APOLOGIST:["Apologist","Apologiste"],
 TEACHER:["Teacher","Enseignant"],
 CHARITY_TO_POOR:["Charity to the poor","Charité envers les pauvres"],
 PASTORAL_CARITY:["Pastoral charity","Charité pastorale"],
 REFORMER:["Reformer","Réformateur"],
 MARIAN_APPARITION_ACCOUNT:["Reported Marian apparition","Apparition mariale rapportée"],
 CHRIST_APPARITION_ACCOUNT:["Reported appearance of Christ","Apparition du Christ rapportée"],
 STIGMATA_ACCOUNT:["Reported stigmata","Stigmates rapportés"],
 MIRACULOUS_HEALING_ACCOUNT:["Reported healing","Guérison rapportée"],
 OTHER_MIRACLE_ACCOUNT:["Reported miracle","Miracle rapporté"],
 OTHER_VISION_ACCOUNT:["Reported vision","Vision rapportée"],
 BILOCATION_ACCOUNT:["Reported bilocation","Bilocation rapportée"],
 LEVITATION_ACCOUNT:["Reported levitation","Lévitation rapportée"],
 INCORRUPTIBILITY_ACCOUNT:["Reported incorruptibility","Incorruptibilité rapportée"],
 EUCHARISTIC_PHENOMENON_ACCOUNT:["Reported Eucharistic phenomenon","Phénomène eucharistique rapporté"],
 PROPHECY_ACCOUNT:["Reported prophecy","Prophétie rapportée"],
 ANGELIC_APPARITION_ACCOUNT:["Reported angelic apparition","Apparition angélique rapportée"],
});
const statuses=new Set([
 "ACKNOWLEDGED_IN_HOLY_SEE_DOCUMENT_NOT_PROOF_OF_EVERY_DETAIL",
 "ACCOUNT_DESCRIBED_WITH_DISCERNMENT_IN_MAGISTERIAL_DOCUMENT",
 "ECCLESIASTICALLY_APPROVED_SUBJECT_TO_SCOPE",
 "HISTORICAL_PRIMARY_SOURCE_REPORT",
 "SOURCE_DOCUMENTED_BUT_NOT_ECCLESIALLY_ADJUDICATED"
]);
const attributions=new Set(["PERSONAL_REPORTED_EXPERIENCE","PERSONAL_LIFETIME_ACTION",
 "POSTHUMOUS_INTERCESSION","SHRINE_SITE_EVENT","HAGIOGRAPHIC_TRADITION"]);
export const saintCategoryLabel=(code,lang="en")=>labels[code]?.[lang==="fr"?1:0]??null;
const arr=x=>Array.isArray(x)?x:[];
const nonempty=x=>typeof x==="string"&&!!x.trim();
function sourceOK(ids,sources){
 return arr(ids).length>0&&arr(ids).every(id=>{
  const record=sources?.[id];
  try{const u=new URL(record?.url);return u.protocol==="https:"&&u.hostname==="www.vatican.va";}catch{return false;}
 });
}
export function sourceBoundSaintClassifications(person,sources){
 if(person?.classification?.schema!=="ao.saint.classification.v1")return null;
 const honours=arr(person.classification.formal_honours);
 const roles=arr(person.classification.roles);
 const events=arr(person.extraordinary_accounts);
 const legalHonour=new Set(["DOCTOR_OF_CHURCH","CHURCH_FATHER","DECLARED_PATRON"]);
 if(!honours.every(h=>legalHonour.has(h?.code)&&nonempty(h.basis)&&sourceOK(h.source_ids,sources)))return null;
 if(!roles.every(r=>saintCategoryLabel(r?.code)&&!legalHonour.has(r.code)&&nonempty(r.basis)&&sourceOK(r.source_ids,sources)))return null;
 if(!events.every(e=>nonempty(e.event_id)&&saintCategoryLabel(e.kind)&&!legalHonour.has(e.kind)
   &&statuses.has(e.status)&&attributions.has(e.attribution)
   &&nonempty(e.subject)&&nonempty(e.en)&&nonempty(e.fr)
   &&sourceOK(e.source_ids,sources)))return null;
 if(person.extraordinary_coverage!=="PARTIAL_SOURCE_REVIEW_NOT_EXHAUSTIVE")return null;
 return Object.freeze({
  honours:Object.freeze(honours.map(x=>Object.freeze({code:x.code,en:saintCategoryLabel(x.code),fr:saintCategoryLabel(x.code,"fr")}))),
  roles:Object.freeze(roles.map(x=>Object.freeze({code:x.code,en:saintCategoryLabel(x.code),fr:saintCategoryLabel(x.code,"fr")}))),
  extraordinary:Object.freeze(events.map(e=>Object.freeze({
   id:e.event_id,kind:e.kind,en:e.en,fr:e.fr,
   label_en:saintCategoryLabel(e.kind),label_fr:saintCategoryLabel(e.kind,"fr"),
   status:e.status,attribution:e.attribution,
   source_ids:Object.freeze([...e.source_ids])
  }))),
 });
}
