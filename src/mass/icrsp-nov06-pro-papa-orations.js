// Exact institute-scoped 6 Nov 2026 Mass, not a universal 1962 calendar rule.
// ICRSP France's Ordo expressly orders "Or. pro Papa" in the III-class
// First Friday Sacred Heart votive Mass (Cogitationes).
// https://icrspfrance.fr/ordo.php?d=2026-11-06#j2026-11-06
// Latin: Missale Romanum, Tabula orationum, "Pro Papa".
// https://media.musicasacra.com/sjfm/AdditionalCollects/Collects-Pope.pdf
// French: Dom Guéranger's L'Année liturgique, historical bilingual readings:
// https://www.societaslaudis.org/fr/JG-DG-AL09TP-3_complet/
// English: editorial rendering of the original Latin. No papal name inferred.
// Scope intentionally requires an explicit ICRSP entry, never any other
// votive, date, institute, community, or sung Mass.
import {icrspFranceOrdoForDate} from "../calendar/icrsp-france-ordo-evidence.js";

export const ICRSP_NOV06_PRO_PAPA_SOURCE=Object.freeze({
 id:"ICRSP_2026_11_06_PRO_PAPA",date:"2026-11-06",
 principal:"Votive/Pent02-5",basis:"first_friday",form:"LOW",
 prayerPath:"1962_MISSALE_TABULA_ORATIONUM_PRO_PAPA",
 originalSource:"https://media.musicasacra.com/sjfm/AdditionalCollects/Collects-Pope.pdf",
 frenchSource:"https://www.societaslaudis.org/fr/JG-DG-AL09TP-3_complet/",
 ordo:"https://icrspfrance.fr/ordo.php?d=2026-11-06#j2026-11-06",
 prayers:Object.freeze({
  collects:Object.freeze({
   lat:"Deus, ómnium fidélium pastor et rector, fámulum tuum N., quem pastórem Ecclésiæ tuæ præésse voluísti, propítius réspice: da ei, quǽsumus, verbo et exémplo, quibus præest, profícere; ut ad vitam, una cum grege sibi crédito, pervéniat sempitérnam. Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
   en:"O God, shepherd and ruler of all the faithful, graciously look upon Thy servant N., whom Thou hast appointed shepherd over Thy Church. Grant, we beseech Thee, that by word and example he may benefit those entrusted to him, and with his flock attain everlasting life. Through our Lord Jesus Christ, Thy Son, who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
   fr:"O Dieu, qui êtes le Pasteur et le conducteur de tous les fidèles, regardez d’un œil propice votre serviteur N. que vous avez mis à la tête de votre Église en qualité de Pasteur ; donnez-lui, nous vous en supplions, d’être utile par sa parole et son exemple à ceux qui sont sous sa conduite, afin qu’il puisse parvenir à la vie éternelle avec le troupeau qui lui a été confié. Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il."
  }),
  secrets:Object.freeze({
   lat:"Oblátis, quǽsumus, Dómine, placáre munéribus: et fámulum tuum N., quem pastórem Ecclésiæ tuæ præésse voluísti, assídua protectióne gubérna. Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
   en:"Be appeased, we beseech Thee, O Lord, by these offered gifts, and govern by Thy continual protection Thy servant N., whom Thou hast appointed shepherd over Thy Church. Through our Lord Jesus Christ, Thy Son, who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
   fr:"Laissez-vous fléchir, Seigneur, par l’offrande de ces dons, et daignez gouverner par votre continuelle protection votre serviteur N. que vous avez voulu établir Pasteur de votre Église. Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il."
  }),
  postcommunions:Object.freeze({
   lat:"Hæc nos, quǽsumus, Dómine, divíni sacraménti percéptio prótegat: et fámulum tuum N., quem pastórem Ecclésiæ tuæ præésse voluísti, una cum commísso sibi grege, salvet semper et múniat. Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
   en:"May the reception of this divine sacrament protect us, we beseech Thee, O Lord; and may it always save and defend Thy servant N., whom Thou hast appointed shepherd over Thy Church, together with the flock entrusted to his care. Through our Lord Jesus Christ, Thy Son, who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
   fr:"Que la réception de ce divin Sacrement nous protège, Seigneur ; qu’elle sauve aussi et fortifie à jamais, avec le troupeau qui lui est confié, votre serviteur N. que vous avez établi Pasteur de votre Église. Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il."
  })
 })
});
const GROUPS=Object.freeze(["collects","secrets","postcommunions"]);
const SINGLE=Object.freeze({collects:"collect",secrets:"secret",postcommunions:"postcommunion"});
const valid=row=>row&&["lat","en","fr"].every(k=>typeof row[k]==="string"&&row[k].trim());
const hold=(proper,reason)=>Object.freeze({status:"UNVERIFIED",reason,proper});
export function projectIcrspNov06ProPapaOrations({proper,date,form,actualCelebrationId,
 votiveBasis,explicitInstituteSelection=false}={}){
 const spec=ICRSP_NOV06_PRO_PAPA_SOURCE;
 if(!explicitInstituteSelection||date!==spec.date||
    String(form??"").toUpperCase()!==spec.form||
    actualCelebrationId!=="sacred_heart"||votiveBasis!==spec.basis)
   return Object.freeze({status:"NOT_APPLICABLE",proper});
 const ordo=icrspFranceOrdoForDate(date);
 if(ordo?.scope!=="ICRSP_FRANCE_PARTICULAR_ORDO"||
    ordo.mass?.introit!=="Cogitationes"||
    ordo.mass?.class!==3||ordo.mass?.prayerForPope!==true)
   return hold(proper,"ICRSP_NOV06_ORDO_CHANGED");
 const envelope=proper?.data&&typeof proper.data==="object"?proper:null;
 const data=envelope?envelope.data:proper;
 if(String(data?.sourcePath??"")!==spec.principal)
   return hold(proper,"SACRED_HEART_PROPER_IDENTITY_MISMATCH");
 if(GROUPS.some(key=>{
   const entries=Array.isArray(data[key])?data[key]:(data[SINGLE[key]]?[data[SINGLE[key]]]:[]);
   return entries.length!==1||!valid(entries[0]);
 }))return hold(proper,"ONE_COMPLETE_PRINCIPAL_ORATION_PER_GROUP_REQUIRED");
 const additions={};
 for(const key of GROUPS){
  const first=(Array.isArray(data[key])?data[key]:[data[SINGLE[key]]])[0];
  additions[key]=Object.freeze([first,Object.freeze({
   ...spec.prayers[key],sourcePath:spec.prayerPath,
   liturgicalPurpose:"ORATIO_PRO_PAPA",date:spec.date
  })]);
 }
 const decision=Object.freeze({status:"SOURCE_ATTESTED",scope:ordo.scope,
  date:spec.date,form:spec.form,principal:spec.principal,
  sourceOrdo:spec.ordo,additionalPrayer:"PRO_PAPA",
  groupCounts:Object.freeze({collects:2,secrets:2,postcommunions:2}),
  authority:"1960_MISSAL_RUBRICS_433_437",
  notCalendarCommemoration:true,notUniversalSelection:true});
 const next=Object.freeze({...data,...additions,proPapaOrationDecision:decision});
 return Object.freeze({status:"APPLIED",decision,
  proper:envelope?Object.freeze({...envelope,data:next}):next});
}
