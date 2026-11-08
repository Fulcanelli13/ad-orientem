// Universal 1962 Roman Missal: 9 November, Lateran Basilica II-class
// Dedication, ordinary commemoration of St Theodore in NONCONVENTUAL LOW Mass.
// This is distinct from ICRSP France's additional "Or. pro Papa" claim.
// RG §111(c–d); RGMR §434(c), §437. Never copy the ICRSP article's Latin
// Postcommunion: it accidentally repeats its Secret Latin; the actual
// Theodore Postcommunion begins "Præsta nobis, quǽsumus, Dómine".
// Primary Latin/EN: https://thedailymissal.com/2026/11/09
// Cross-check French: https://icrspfrance.fr/textes-liturgiques.php?article=a0547_ancien
// Independent calendar: https://ordo.fsspx.org/en/day/2026-11-09?source=nullius
export const NOV09_THEODORE_SOURCE=Object.freeze({
 date:"2026-11-09",principalPath:"Sancti/11-09",principalIdPrefix:"sancti:11-09:2:",
 commemorationId:"1962_SANCTI_11_09_THEODORE_MARTYR",
 sourcePath:"1962_MISSALE_11_09_THEODORE_COMMEMORATION",
 sources:Object.freeze({
  original:"https://thedailymissal.com/2026/11/09",
  printedMissalNotice:"https://ordo.fsspx.org/en/day/2026-11-09?source=nullius",
  french:"https://icrspfrance.fr/textes-liturgiques.php?article=a0547_ancien"
 }),
 prayers:Object.freeze({
  collects:Object.freeze({
   lat:"Deus, qui nos beáti Theodóri Mártyris tui confessióne gloriósa circúmdas et prótegis: præsta nobis ex eius imitatióne profícere, et oratióne fulcíri. Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
   en:"O God, Who surround and protect us with the glorious profession of blessed Theodore, Your Martyr, grant us to profit by imitating him and to rejoice in his intercession. Through our Lord Jesus Christ, Thy Son, who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
   fr:"O Dieu, qui nous donnez la glorieuse profession de foi de votre bienheureux Martyr Théodore, comme appui et protection, accordez-nous la grâce de profiter de ses exemples, et d’être soutenus de ses prières. Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il."
  }),
  secrets:Object.freeze({
   lat:"Súscipe, Dómine, fidélium preces cum oblatiónibus hostiárum: et, intercedénte beáto Theodóro Mártyre tuo, per hæc piæ devotiónis offícia ad cæléstem glóriam transeámus. Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
   en:"Receive, O Lord, the prayers of the faithful together with the sacrificial offerings; and, through the intercession of blessed Theodore, Thy Martyr, grant that by these acts of pious devotion we may pass to heavenly glory. Through our Lord Jesus Christ, Thy Son, who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
   fr:"Agréez, Seigneur, les prières des fidèles avec l’offrande des hosties, et faites que le bienheureux Théodore, votre Martyr, intercédant en notre faveur, nous parvenions, en accomplissant ces devoirs d’une pieuse dévotion, à la gloire céleste. Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il."
  }),
  postcommunions:Object.freeze({
   lat:"Præsta nobis, quǽsumus, Dómine: intercedénte beáto Theodóro Mártyre tuo; ut, quod ore contíngimus, pura mente capiámus. Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
   en:"Grant, we beseech You, O Lord, by the intercession of blessed Theodore, Your Martyr, that what we taste with our lips we may consume with a pure heart. Through our Lord Jesus Christ, Thy Son, who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
   fr:"Accordez-nous, s’il vous plaît, Seigneur, que grâce à l’intercession de votre bienheureux Martyr Théodore, nous gardions dans un cœur pur ce que notre bouche a reçu. Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il."
  })
 })
});
const GROUPS=["collects","secrets","postcommunions"];
const complete=row=>row&&["lat","en","fr"].every(k=>
 typeof row[k]==="string"&&row[k].trim().length>30);
const hold=(proper,reason)=>Object.freeze({status:"UNVERIFIED",reason,proper});
export function project1962Nov09TheodoreCommemoration({
 proper,date,form,calendarResolution,celebrationId="mass_of_day",
 observedSource=false,isConventual=false
}={}){
 if(date!=="2026-11-09"||
  !["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(form))
  return Object.freeze({status:"NOT_APPLICABLE",proper});
 if(observedSource||celebrationId!=="mass_of_day"||isConventual!==false)
  return Object.freeze({status:"NOT_APPLICABLE",proper});
 const main=calendarResolution?.day?.main;
 const data=proper?.data&&typeof proper.data==="object"?proper.data:proper;
 if(calendarResolution?.status!=="ready"||calendarResolution.date!==date||
   main?.rank!==2||!String(main.id??"").startsWith(NOV09_THEODORE_SOURCE.principalIdPrefix)||
   main?.path!==NOV09_THEODORE_SOURCE.principalPath||
   data?.sourcePath!==NOV09_THEODORE_SOURCE.principalPath)
  return hold(proper,"LATERAN_1962_ORIGINAL_DAY_SOURCE_MISMATCH");
 // §111(c–d) only ordinary NONCONVENTUAL LOW Mass admits Theodore.
 // Sung forms are not entitled to an extra ordinary commemoration.
 if(form!=="LOW")
  return Object.freeze({status:"OMITTED_BY_1962_RUBRIC",proper,
   reason:"ORDINARY_COMMEMORATION_NOT_SAID_NONCONVENTUAL_SUNG"});
 if(GROUPS.some(k=>!Array.isArray(data[k])||data[k].length!==1||
   !complete(data[k][0])))
  return hold(proper,"LATERAN_ONE_COMPLETE_PRINCIPAL_ORATION_REQUIRED");
 const extra=Object.fromEntries(GROUPS.map(k=>[k,Object.freeze([
  data[k][0],Object.freeze({
   ...NOV09_THEODORE_SOURCE.prayers[k],
   sourcePath:NOV09_THEODORE_SOURCE.sourcePath,
   liturgicalPurpose:"COMMEMORATION_SAINT_THEODORE",
   ordoOrationId:"COMMEMORATION:SAINT_THEODORE_MARTYR",
   date,scope:"GENERAL_ROMAN_1962",rank:4
  })
 ])]));
 const meta=Object.freeze({
  status:"SOURCE_VERIFIED",date,form,scope:"GENERAL_ROMAN_1962",
  type:"ORDINARY_NONCONVENTUAL_LOW_MASS_COMMEMORATION",
  principal:"Sancti/11-09",additional:"SAINT_THEODORE_MARTYR",
  sourcePath:NOV09_THEODORE_SOURCE.sourcePath,
  order:["PRINCIPAL","COMMEMORATION:SAINT_THEODORE_MARTYR"],
  groups:Object.freeze({collects:2,secrets:2,postcommunions:2}),
  excludedInstitutePapalPrayer:true,
  authorities:["1960_GENERAL_RUBRICS_111_C_D",
   "1960_MISSAL_RUBRICS_434_C_437"]
 });
 const merged=Object.freeze({...data,...extra,
  verifiedNov09TheodoreCommemoration:meta});
 return Object.freeze({status:"APPLIED",decision:meta,
  proper:proper?.data&&typeof proper.data==="object"?
   Object.freeze({...proper,data:merged}):merged});
}
