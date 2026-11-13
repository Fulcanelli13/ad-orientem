/**
 * Curated, source-preserving focused passages for standalone prayers only.
 * Boundaries mark the START of a new meaningful passage. No punctuation
 * heuristics, no invented texts, no reuse in the Rosary or Angelus engines.
 * A mismatch with the source hides the contemplative option.
 */
export const A3_FOCUS_CUTS=Object.freeze({
  foundations_sign_of_cross:{
    la:["et Filii","et Spiritus Sancti","Amen."],
    en:["and of the Son","and of the Holy Spirit","Amen."],
    fr:["et du Fils","et du Saint-Esprit","Amen."]
  },
  foundations_our_father:{
    la:["sanctificetur nomen tuum","adveniat regnum tuum","fiat voluntas tua",
      "Panem nostrum","et dimitte nobis debita nostra","et ne nos inducas",
      "sed libera nos a malo","Amen."],
    en:["hallowed be Thy name","Thy kingdom come","Thy will be done",
      "Give us this day","and forgive us our trespasses","and lead us not",
      "but deliver us from evil","Amen."],
    fr:["que votre nom soit sanctifié","que votre règne arrive","que votre volonté",
      "Donnez-nous aujourd’hui","pardonnez-nous nos offenses","et ne nous laissez",
      "mais délivrez-nous du mal","Amen."]
  },
  foundations_hail_mary:{
    la:["benedicta tu in mulieribus","et benedictus fructus","Sancta Maria",
      "ora pro nobis peccatoribus","nunc et in hora","Amen."],
    en:["blessed art thou among women","and blessed is the fruit","Holy Mary",
      "pray for us sinners","now and at the hour","Amen."],
    fr:["vous êtes bénie entre toutes les femmes","et Jésus, le fruit","Sainte Marie",
      "priez pour nous","maintenant et à l’heure","Amen."]
  },
  foundations_glory_be:{
    la:["et Filio","et Spiritui Sancto","Sicut erat in principio","et nunc",
      "et semper","et in sæcula sæculorum","Amen."],
    en:["and to the Son","and to the Holy Spirit","As it was in the beginning",
      "is now","and ever shall be","world without end","Amen."],
    fr:["au Fils","et au Saint-Esprit","comme il était au commencement",
      "maintenant","et toujours","et dans les siècles des siècles","Amen."]
  },
  sacrament_act_of_contrition:{
    la:["eáque detéstor","quia peccándo","sed præsértim","Ídeo fírmiter propóno","Amen."],
    en:["and I detest all my sins","but most of all","I firmly resolve","Amen."],
    fr:["parce que vous êtes infiniment bon","Je prends la ferme résolution","Amen."]
  },
  foundations_guardian_angel:{
    la:["me, tibi commíssum","illúmina","Amen."],
    en:["to whom God’s love","ever this day","to light and guard","Amen."],
    fr:["et à qui j’ai été confié","éclaire-moi","Amen."]
  },
  foundations_grace_before_meals:{
    la:["et haec tua dona","quae de tua largitáte","per Christum Dóminum nostrum","Amen."],
    en:["and these thy gifts","which we are about to receive","through Christ our Lord","Amen."],
    fr:["ainsi que les dons","par le Christ notre Seigneur","Amen."]
  },
  marian_memorare:{
    la:["non esse auditum a saeculo","Ego, tali animatus confidentia",
      "ad te, Virgo virginum","ad te venio","coram te gemens",
      "Noli, Mater Verbi","verba mea despicere","sed audi propitia","Amen."],
    en:["that never was it known","Inspired by this confidence",
      "I fly unto thee","to thee do I come","before thee I stand",
      "O Mother of the Word Incarnate","despise not my petitions",
      "but in thy mercy","Amen."],
    fr:["qu’on n’a jamais entendu dire","Animé d’une pareille confiance",
      "ô Vierge des vierges","je viens à vous","et, gémissant",
      "Ô Mère du Verbe incarné","ne méprisez pas mes prières",
      "mais écoutez-les favorablement","Amen."]
  }
});
export const A3_FIT_RATIO=.40;
export function a3CuratedPassages(id,text,language){
  const cuts=A3_FOCUS_CUTS[id]?.[language];
  if(!cuts||typeof text!=="string"||!text.trim())return null;
  let last=0;
  const parts=[];
  for(const marker of cuts){
    const index=text.indexOf(marker,last+1);
    if(index<=last||text.indexOf(marker,index+1)!==-1)return null;
    parts.push(text.slice(last,index));
    last=index;
  }
  parts.push(text.slice(last));
  if(parts.some(p=>!p.trim())||parts.join("")!==text)return null;
  return parts;
}
export function a3ReadingLayout(textHeight,viewportHeight){
  if(!Number.isFinite(textHeight)||!Number.isFinite(viewportHeight)||viewportHeight<=0)return "cinematic";
  return textHeight/viewportHeight>A3_FIT_RATIO?"veil":"cinematic";
}
