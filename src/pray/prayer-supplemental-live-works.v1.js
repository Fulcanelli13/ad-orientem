/**
 * Eight SOURCE-BOUND, individually browser-compared historical prayer works,
 * already rendered by B19/B20/B21 source-owned readers. The source modules
 * remain the sole owners of all prayer body wording and available languages.
 * This index creates NO prayer text copies, new translations, or certification
 * of an original 1910–1914 printed image.
 *
 * The exact eight work IDs were individually exercised at source-body level
 * in PR #2594 Stage 6. The published reader is already registered on main.
 */
import {PRIESTLY_INTERCESSIONS_B19} from "./priestly-intercessions-b19.js";
import {OCCASIONAL_INTERCESSIONS_B20} from "./occasional-intercessions-b20.js";
import {OCCASIONAL_INTERCESSIONS_B21} from "./occasional-intercessions-b21.js";

const b19=PRIESTLY_INTERCESSIONS_B19.map(w=>Object.freeze({
 id:w.id,subject:"VII",route:"pray.for_priests",purpose:w.purpose,
 en:w.titleEn,fr:w.titleFr,sourceLanguage:w.la?"en_la":"en",
 owner:"B19",printImageCertified:false
}));
const b20=OCCASIONAL_INTERCESSIONS_B20.map(w=>Object.freeze({
 id:w.id,subject:w.purpose==="family"?"II":"VII",
 route:"pray.occasional_intercessions",purpose:w.purpose,
 en:w.titleEn,fr:w.titleFr,sourceLanguage:"en",
 owner:"B20",printImageCertified:false
}));
const b21=OCCASIONAL_INTERCESSIONS_B21.map(w=>Object.freeze({
 id:w.id,subject:"VII",route:"pray.occasional_intercessions",
 purpose:w.purpose,en:w.titleEn,fr:w.titleFr,
 sourceLanguage:w.la?"en_la":"en",owner:"B21",printImageCertified:false
}));

export const PRAYER_SUPPLEMENTAL_LIVE_WORK_LINKS_V1=Object.freeze([...b19,...b20,...b21]);
const byId=new Map(PRAYER_SUPPLEMENTAL_LIVE_WORK_LINKS_V1.map(w=>[w.id,w]));
export function prayerSupplementalLiveWork(id){return byId.get(String(id||""))||null}
export function prayerSupplementalLiveWorksForSubject(subject,query=""){
 const q=String(query||"").trim().toLocaleLowerCase();
 return PRAYER_SUPPLEMENTAL_LIVE_WORK_LINKS_V1.filter(w=>(w.subject===subject||(subject==="all"&&!!q))&&
  (!q||[w.en,w.fr,w.id,w.purpose].some(x=>x.toLocaleLowerCase().includes(q))));
}
