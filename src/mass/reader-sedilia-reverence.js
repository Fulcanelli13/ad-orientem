// Rubrical ledger for the seated sacred ministers' sung-word reverences.
// General Rubrics (1960) 518(b), 523; O'Connell, Celebration of Mass (1962),
// Sung Mass Gloria §§15-17 and Solemn Credo. These are liturgical obligations,
// NOT automatic timestamps. The chant/performance clock remains independent.
export const SEDILIA_REVERENCE_EVENTS=Object.freeze({
 "SED-GLORIA-ADORAMUS":Object.freeze({card:"Gloria · Praise and Supplication",section:"AO.CARD.003",words:"Adoramus te",source:"OCONNELL_1962_SUNG_GLORIA_16"}),
 "SED-GLORIA-GRATIAS":Object.freeze({card:"Gloria · Praise and Supplication",section:"AO.CARD.003",words:"Gratias agimus tibi",source:"OCONNELL_1962_SUNG_GLORIA_16"}),
 "SED-GLORIA-IESU-FIRST":Object.freeze({card:"Gloria · Praise and Supplication",section:"AO.CARD.003",words:"Iesu Christe — first",source:"OCONNELL_1962_SUNG_GLORIA_16"}),
 "SED-GLORIA-SUSCIPE":Object.freeze({card:"Gloria · Praise and Supplication",section:"AO.CARD.003",words:"Suscipe deprecationem nostram",source:"OCONNELL_1962_SUNG_GLORIA_16"}),
 "SED-GLORIA-IESU-SECOND":Object.freeze({card:"Gloria · Doxology",section:"AO.CARD.003",words:"Iesu Christe — second",source:"OCONNELL_1962_SUNG_GLORIA_16"}),
 "SED-CREDO-IESUM":Object.freeze({card:"Credo · The Father and the Son",section:"AO.CARD.009",words:"Iesum Christum",source:"OCONNELL_1962_SOLEMN_CREDO_2"}),
 "SED-CREDO-INCARNATUS":Object.freeze({card:"Credo · Incarnation, Passion and Resurrection",section:"AO.CARD.009",words:"Et incarnatus est ... et homo factus est",source:"RG60_518B",solemnSeatedActors:["P","S"],depth:"PROFOUND",deaconDuty:"BURSE_AND_CORPORAL_AT_ALTAR"}),
 "SED-CREDO-SIMUL":Object.freeze({card:"Credo · The Holy Spirit, Church and Life Eternal",section:"AO.CARD.009",words:"simul adoratur",source:"OCONNELL_1962_SOLEMN_CREDO_2"})
});
export const SEDILIA_REVERENCE_FORMS=Object.freeze([
 "MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"
]);
export function checkSediliaObservation({observation,card,form,mode,exceptionalIncarnatus=false,rite=null}={}){
 const event=SEDILIA_REVERENCE_EVENTS[observation?.eventId];
 if(!event||observation?.observed!==true||!["BEGIN","END"].includes(observation?.phase))
  return Object.freeze({accepted:false,reason:"UNVERIFIED_SEDILIA_OBSERVATION"});
 if(!SEDILIA_REVERENCE_FORMS.includes(form)||mode!=="LIVE"||
    rite==="REQUIEM"||card?.sourceSectionId!==event.section||
    card?.title!==event.card||card?.stateOnly===true)
  return Object.freeze({accepted:false,reason:"WRONG_SEDILIA_SOURCE_OR_FORM"});
 if(event===SEDILIA_REVERENCE_EVENTS["SED-CREDO-INCARNATUS"]&&exceptionalIncarnatus)
  return Object.freeze({accepted:false,reason:"INCARNATUS_EXCEPTION_REQUIRES_KNEEL"});
 return Object.freeze({accepted:true,eventId:observation.eventId,
  phase:observation.phase,words:event.words,source:event.source,
  actors:form==="SOLEMN"?(event.solemnSeatedActors??["P","D","S"]):["P"],
  sequence:observation.phase==="BEGIN"
   ?["UNCOVER_BIRETTA","PLACE_BIRETTA_ON_RIGHT_KNEE","BOW_UNCOVERED_HEAD"]
   :["STRAIGHTEN_HEAD","REPLACE_BIRETTA"]});
}
