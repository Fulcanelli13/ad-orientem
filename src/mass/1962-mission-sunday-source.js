// Missal 1960 §§444–446, 453: one extra Collect *under the same
// conclusion* as the Mass Collect on Mission Sunday, including Sung Mass.
// It is NEVER an extra separate Collect/Secret/Postcommunion commemoration.
//
// Liturgical original & English translation:
// https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Commune/Propaganda.txt
// https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/English/Commune/Propaganda.txt
// French historical translation: Le Précurseur, Montréal, janvier 1921,
// vol. 1 no. 4, p. 87 (public domain; historical devotional translation):
// https://www.pressemic.org/wp-content/uploads/2025/06/prec-1921-01-04.pdf
// https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html

export const MISSION_SUNDAY_SOURCE=Object.freeze({
  id:"1962_PRO_FIDEI_PROPAGATIONE_COLLECT",
  sourcePath:"Commune/Propaganda",rubrics:"MISSAL_1960_444_445_446_453",
  texts:Object.freeze({
    lat:"Deus, qui omnes hómines vis salvos fíeri, et ad agnitiónem veritátis veníre: mitte, quǽsumus, operários in messem tuam, et da eis cum omni fidúcia loqui verbum tuum; ut sermo tuus currat et clarificétur, et omnes gentes cognóscant te solum Deum verum, et quem misísti Jesum Christum Fílium tuum, Dóminum nostrum.",
    en:"O God, who desirest that all men should be saved, and come to the knowledge of the truth: send forth, we beseech thee, labourers into thy harvest, and grant them grace to speak thy word with all trust, that thy words may run and be glorified, and that all nations may know thee, the one true God, and him whom thou hast sent, Jesus Christ thy Son our Lord.",
    fr:"Seigneur qui voulez que tous les hommes soient sauvés et arrivent à la connaissance de la vérité, envoyez, nous vous en supplions, des ouvriers évangéliques pour faire votre moisson, et accordez-leur d’annoncer en toute confiance votre divine parole, de manière à ce qu’elle se propage rapidement, qu’elle brille d’un vif éclat et que toutes les nations vous reconnaissent pour le Dieu véritable, ainsi que Celui que vous nous avez envoyé, Jésus-Christ votre Fils Notre-Seigneur.",
  }),
  translationProvenance:Object.freeze({la:"DIVINUM_1962",en:"DIVINUM_TRADITIONAL",fr:"LE_PRECURSEUR_1921_PUBLIC_DOMAIN"}),
  // O'Connell, The Celebration of Mass (1962): when the principal Collect
  // receives a second prayer under one conclusion, the conclusion belongs
  // to the SECOND prayer. Propaganda ends with "$Qui tecum", not "$Per Dominum".
  // https://isidore.co/misc/Res%20pro%20Deo/ITOPL_OCR-layer-only/11a.%20Liturgy/d-The%20Celebration%20of%20Mass-%20O%27Connel%201962_OCR.pdf
  // https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Ordo/Ordo.txt
  conclusion:Object.freeze({
    lat:"Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
    en:"Who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
    fr:"Qui vit et règne avec vous dans l’unité du Saint-Esprit, Dieu, dans tous les siècles des siècles. Ainsi soit-il.",
  }),
});
const ISO=/^\d{4}-\d{2}-\d{2}$/;
const validDay=date=>ISO.test(String(date??""))&&!Number.isNaN(Date.parse(date+"T12:00:00Z"));
export function penultimateOctoberSunday(year){
  if(!Number.isInteger(year)||year<1900||year>2199)throw new RangeError("Unsupported liturgical year");
  const d=new Date(Date.UTC(year,9,31,12)),last=d.getUTCDay();
  return new Date(Date.UTC(year,9,31-last-7,12)).toISOString().slice(0,10);
}
const conclusions=Object.freeze({
  lat:/^Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum\. Amen\.$/,
  en:/^Through our Lord Jesus Christ, Thy Son, Who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end\. Amen\.$/,
  fr:/^Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles\. Ainsi soit-il\.$/,
});
function splitCollect(value,lang){
  const original=String(value??"").trim();
  const last=original.lastIndexOf("\n");
  if(last<1)return null;
  const body=original.slice(0,last).trim();
  const conclusion=original.slice(last+1).trim();
  if(!body||!conclusions[lang].test(conclusion))return null;
  return Object.freeze({body,conclusion});
}
function returnUnchanged(proper,status,reason=null){
  return Object.freeze({status,reason,proper});
}
/**
 * Compose only a witnessed ordinary Roman 1962 Mass, using the *already
 * form-selected* Proper. The extra Collect is counted WITH the first Collect.
 * We do not invent a new Oremus, separate conclusion or third secret.
 */
export function applyMissionSundayCollect({
  proper,calendarResolution,form,localMissionSundayDate=null,
  competingUnderOneConclusion=[],celebrationId="mass_of_day",
}={}){
  const envelope=proper?.data&&typeof proper.data==="object"?proper:null;
  const data=envelope?envelope.data:proper;
  const date=calendarResolution?.date;
  if(!validDay(date))return returnUnchanged(proper,"NOT_APPLICABLE","INVALID_DAY");
  if(localMissionSundayDate!==null&&(!validDay(localMissionSundayDate)||
    new Date(localMissionSundayDate+"T12:00:00Z").getUTCDay()!==0))
    return returnUnchanged(proper,"UNVERIFIED","INVALID_LOCAL_MISSION_DATE");
  const year=Number(date.slice(0,4));
  const target=localMissionSundayDate??penultimateOctoberSunday(year);
  if(target!==date)return returnUnchanged(proper,"NOT_APPLICABLE","DIFFERENT_DATE");
  if(!["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(form))
    return returnUnchanged(proper,"UNVERIFIED","UNSUPPORTED_FORM");
  const main=calendarResolution?.day?.main;
  const expectedSource=String(main?.path??"");
  if(!data||calendarResolution?.status!=="ready"||
    !/^tempora:[a-z0-9-]+-0:2:/i.test(String(main?.id??""))||
    Number(main?.rank)!==2||String(data.sourcePath??"")!==expectedSource||
    ![null,"","mass_of_day"].includes(celebrationId))
    return returnUnchanged(proper,"UNVERIFIED","MASS_PRINCIPAL_OR_PRECEDENCE_UNVERIFIED");
  if(!Array.isArray(competingUnderOneConclusion))
    return returnUnchanged(proper,"UNVERIFIED","COMPETITION_SOURCE_UNVERIFIED");
  if(competingUnderOneConclusion.length)
    return returnUnchanged(proper,"UNVERIFIED","PRIORITY_444_445_REQUIRES_SELECTION");
  const rows=data.collects;
  if(!Array.isArray(rows)||rows.length<1||rows.length>3)
    return returnUnchanged(proper,"UNVERIFIED","PRINCIPAL_COLLECT_SOURCE_UNAVAILABLE");
  const original=rows[0];
  const parts=Object.fromEntries(["lat","en","fr"].map(lang=>[lang,splitCollect(original?.[lang],lang)]));
  if(Object.values(parts).some(part=>!part))
    return returnUnchanged(proper,"UNVERIFIED","PRINCIPAL_COLLECT_CONCLUSION_UNVERIFIED");
  const texts=MISSION_SUNDAY_SOURCE.texts;
  if(["lat","en","fr"].some(lang=>!texts[lang]||/\n|(?:^|\s)(?:Per Dóminum|Qui tecum|Through our Lord|Par Notre-Seigneur)/i.test(texts[lang])))
    return returnUnchanged(proper,"UNVERIFIED","MISSION_COLLECT_BODY_UNVERIFIED");
  const oneConclusion=Object.freeze({
    status:"CERTIFIED",rule:"1960_MISSAL_444_446_453",
    sourcePath:MISSION_SUNDAY_SOURCE.sourcePath,
    requiredOn:date,form,parts:Object.freeze(["PRINCIPAL_MASS","PRO_FIDEI_PROPAGATIONE"]),
    conclusionOwner:"PRO_FIDEI_PROPAGATIONE",
    segments:Object.freeze(["lat","en","fr"].reduce((acc,lang)=>{
      acc[lang]=Object.freeze({principal:parts[lang].body,mission:texts[lang],
        conclusion:MISSION_SUNDAY_SOURCE.conclusion[lang]});return acc;
    },{})),
  });
  const combined=Object.freeze({...original,
    lat:parts.lat.body+"\n\n"+texts.lat+"\n"+MISSION_SUNDAY_SOURCE.conclusion.lat,
    en:parts.en.body+"\n\n"+texts.en+"\n"+MISSION_SUNDAY_SOURCE.conclusion.en,
    fr:parts.fr.body+"\n\n"+texts.fr+"\n"+MISSION_SUNDAY_SOURCE.conclusion.fr,
    oneConclusion,
  });
  const selected=Object.freeze({...data,
    collects:Object.freeze([combined,...rows.slice(1)]),
    collect:combined,
    missionSundayCollectDecision:Object.freeze({
      status:"CERTIFIED",source:"1962_PROPER_RESOLVER",
      date,form,applied:true,collectGroupCount:rows.length,
      extraSecret:false,extraPostcommunion:false,
      underOneConclusion:true,rule:"1960_MISSAL_453",
    }),
  });
  return Object.freeze({status:"APPLIED",proper:envelope?
    Object.freeze({...envelope,data:selected}):selected,decision:selected.missionSundayCollectDecision});
}
