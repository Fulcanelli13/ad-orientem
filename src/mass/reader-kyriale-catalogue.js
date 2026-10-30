// Historical chant-index metadata, NOT GABC notation, an audio recording,
// certification of local performance, or a replacement for the 1962 rubric.
// Primary witness: Kyriale Romanum, e Graduali sacrosanctae Romanae Ecclesiae
// desumptum (2001), preserved by Church Music Association of America:
// https://media.churchmusicassociation.org/pdf/kyriale.pdf
// Cross-index: 1961 Liber Usualis / Kyriale (CMAA resource list):
// https://musicasacra.com/music/latin-settings/
// The indexed Mass names are also independently enumerated at
// https://www.cantusorgani.org/kyriale/ (Nova Organi Harmonia).
const freeze=Object.freeze;
export const KYRIALE_SOURCE=freeze({
 id:"KYRIALE_ROMANUM_CMAA",
 title:"Kyriale Romanum — e Graduali Romano (CMAA facsimile)",
 url:"https://media.churchmusicassociation.org/pdf/kyriale.pdf",
 comparisonUrl:"https://musicasacra.com/music/latin-settings/",
 scope:"EDITION_INDEX_ONLY",
 note:"The historical edition verifies the setting identities, not a local performance or the melody's digital encoding."
});
export const KYRIALE_ORDINARY_MOVEMENTS=freeze([
 "KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"
]);
const massNames=freeze([
 ["I","Lux et origo","Easter season"],
 ["II","Kyrie fons bonitatis","Solemn feasts"],
 ["III","Kyrie Deus sempiterne","Solemn feasts"],
 ["IV","Cunctipotens Genitor Deus","Feasts"],
 ["V","Kyrie magnae Deus potentiae","Feasts"],
 ["VI","Kyrie Rex Genitor","Feasts"],
 ["VII","Kyrie Rex splendens","Feasts"],
 ["VIII","De Angelis","Feasts"],
 ["IX","Cum jubilo","Feasts of the Blessed Virgin Mary"],
 ["X","Alme Pater","Feasts of the Blessed Virgin Mary"],
 ["XI","Orbis factor","Sundays through the year"],
 ["XII","Pater cuncta","Feasts"],
 ["XIII","Stelliferi Conditor","Feasts"],
 ["XIV","Jesu Redemptor","Octave celebrations in historical source"],
 ["XV","Dominator Deus","Ferias and commemorations in historical source"],
 ["XVI","In feriis per annum","Ferias through the year"],
 ["XVII","In dominicis Adventus et Quadragesimae","Sundays in Advent and Lent"],
 ["XVIII","Deus Genitor alme","Advent and Lenten ferias, vigils, Ember days and Rogations"]
]);
const movementsForMass=index=>index>=16?
 ["KYRIE","SANCTUS_BENEDICTUS","AGNUS_DEI"]:
 ["KYRIE","GLORIA","SANCTUS_BENEDICTUS","AGNUS_DEI"];
export const KYRIALE_MASSES=freeze(massNames.map(([roman,title,usage],i)=>freeze({
 id:"MASS_"+String(i+1).padStart(2,"0"),
 roman,title:"Mass "+roman+" · "+title,usage,
 availableMovements:freeze(movementsForMass(i+1)),
 sourceId:KYRIALE_SOURCE.id,sourceUrl:KYRIALE_SOURCE.url,
 status:"SOURCE_EDITION_INDEXED",verifiedPerformance:false,scoreEncoded:false
})));
export const KYRIALE_CREDOS=freeze(["I","II","III","IV","V","VI"].map((roman,i)=>freeze({
 id:"CREDO_"+String(i+1).padStart(2,"0"),
 roman,title:"Credo "+roman,usage:"Independent Credo setting",
 availableMovements:freeze(["CREDO"]),
 sourceId:KYRIALE_SOURCE.id,sourceUrl:KYRIALE_SOURCE.url,
 status:"SOURCE_EDITION_INDEXED",verifiedPerformance:false,scoreEncoded:false
})));
const choices=freeze([...KYRIALE_MASSES,...KYRIALE_CREDOS]);
const byId=new Map(choices.map(c=>[c.id,c]));
export function kyrialeChoicesForMovement(movement){
 return freeze(choices.filter(c=>c.availableMovements.includes(movement)));
}
export function resolveKyrialeChoice(movement,id){
 const item=byId.get(String(id??""));
 return item?.availableMovements.includes(movement)?item:null;
}
// Source-linked notation leads from the existing unmerged 1961 score pilot
// (#1749). These seven IDs are *research references*, not note-by-note
// facsimile-validated scores, liturgical recommendations or actual singing.
// Never infer a score merely from a typed local title; only explicit catalogue
// selections are eligible to reveal their matching lead.
export const KYRIALE_RESEARCH_NOTATION_EXAMPLES=freeze([
 ["KYRIE","MASS_16",545,"Kyrie XVI","54*"],
 ["KYRIE","MASS_11",2982,"Kyrie XI","38*"],
 ["KYRIE","MASS_08",1184,"Kyrie VIII","28*"],
 ["GLORIA","MASS_08",961,"Gloria VIII","29*"],
 ["CREDO","CREDO_03",749,"Credo III","64*"],
 ["SANCTUS_BENEDICTUS","MASS_08",1384,"Sanctus VIII · Benedictus","30*"],
 ["AGNUS_DEI","MASS_08",2760,"Agnus Dei VIII","31*"],
].map(([movement,catalogueId,sourceId,title,folio])=>freeze({
 movement,catalogueId,scoreId:"GREGOBASE-"+sourceId,title,
 printedWitness:"Graduale Romanum (Solesmes 1961), p. "+folio,
 sourceUrl:"https://gregobase.selapa.net/chant.php?id="+sourceId,
 status:"RESEARCH_TRANSCRIPTION_NOT_FACSIMILE_APPROVED",
 scoreApproved:false,recordingApproved:false,observedPerformance:false,
})));
const notationBySelection=new Map(KYRIALE_RESEARCH_NOTATION_EXAMPLES.map(
 record=>[record.movement+":"+record.catalogueId,record]));
export function kyrialeResearchNotationPreview(movement,catalogueId){
 const indexed=resolveKyrialeChoice(movement,catalogueId);
 return indexed?notationBySelection.get(movement+":"+indexed.id)??null:null;
}

export function canonicalKyrialeSelection(value,movement){
 return resolveKyrialeChoice(movement,value)?.id??"";
}
