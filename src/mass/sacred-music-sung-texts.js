// Composers reference ONE shared Requiem text registry.
// Movement-specific sequence and repetition belong here, not in the text bank.
// No edition, performance or musical timing is certified by a textual sequence.
import {sharedRequiemTextUnit,REQUIEM_TEXT_TRACK_XWALK} from "./shared-requiem-text-units.js";
export const SACRED_MUSIC_TEXT_PLANS=Object.freeze({
  "faure-requiem-op48": [
    {
      "movementId": "faure-requiem-op48-1",
      "textIds": [
        "REQ.INTROIT.001",
        "REQ.INTROIT.002",
        "REQ.INTROIT.003",
        "REQ.INTROIT.004",
        "REQ.INTROIT.005",
        "REQ.INTROIT.006",
        "REQ.KYRIE.001",
        "REQ.KYRIE.002",
        "REQ.KYRIE.001"
      ]
    },
    {
      "movementId": "faure-requiem-op48-2",
      "textIds": [
        "REQ.OFFERTORY.001",
        "REQ.OFFERTORY.002",
        "REQ.OFFERTORY.003",
        "REQ.OFFERTORY.001",
        "REQ.OFFERTORY.004",
        "REQ.OFFERTORY.005",
        "REQ.OFFERTORY.006",
        "REQ.OFFERTORY.007",
        "REQ.OFFERTORY.008",
        "REQ.OFFERTORY.009",
        "REQ.OFFERTORY.010",
        "REQ.OFFERTORY.011",
        "REQ.OFFERTORY.012",
        "REQ.OFFERTORY.013"
      ]
    },
    {
      "movementId": "faure-requiem-op48-3",
      "textIds": [
        "REQ.SANCTUS_BENEDICTUS.001",
        "REQ.SANCTUS_BENEDICTUS.002",
        "REQ.SANCTUS_BENEDICTUS.003",
        "REQ.SANCTUS_BENEDICTUS.004"
      ]
    },
    {
      "movementId": "faure-requiem-op48-4",
      "textIds": [
        "REQ.PIE_JESU_SEQUENCE_EXCERPT.001",
        "REQ.PIE_JESU_SEQUENCE_EXCERPT.002",
        "REQ.PIE_JESU_SEQUENCE_EXCERPT.001",
        "REQ.PIE_JESU_SEQUENCE_EXCERPT.003"
      ]
    },
    {
      "movementId": "faure-requiem-op48-5",
      "textIds": [
        "REQ.AGNUS_DEI.001",
        "REQ.PIE_JESU_SEQUENCE_EXCERPT.002",
        "REQ.AGNUS_DEI.001",
        "REQ.PIE_JESU_SEQUENCE_EXCERPT.003",
        "REQ.COMMUNION.001",
        "REQ.COMMUNION.002",
        "REQ.COMMUNION.003",
        "REQ.COMMUNION.004"
      ]
    },
    {
      "movementId": "faure-requiem-op48-6",
      "textIds": [
        "REQ.ABSOLUTION_RESPONSORY.001",
        "REQ.ABSOLUTION_RESPONSORY.002",
        "REQ.ABSOLUTION_RESPONSORY.003",
        "REQ.ABSOLUTION_RESPONSORY.004",
        "REQ.ABSOLUTION_RESPONSORY.005",
        "REQ.ABSOLUTION_RESPONSORY.006",
        "REQ.ABSOLUTION_RESPONSORY.007",
        "REQ.ABSOLUTION_RESPONSORY.008",
        "REQ.ABSOLUTION_RESPONSORY.009",
        "REQ.COMMUNION.003",
        "REQ.COMMUNION.004",
        "REQ.ABSOLUTION_RESPONSORY.001",
        "REQ.ABSOLUTION_RESPONSORY.002",
        "REQ.ABSOLUTION_RESPONSORY.003",
        "REQ.ABSOLUTION_RESPONSORY.004"
      ]
    },
    {
      "movementId": "faure-requiem-op48-7",
      "textIds": [
        "REQ.FUNERAL_PROCESSION.001",
        "REQ.FUNERAL_PROCESSION.002",
        "REQ.FUNERAL_PROCESSION.003",
        "REQ.FUNERAL_PROCESSION.004",
        "REQ.FUNERAL_PROCESSION.005",
        "REQ.FUNERAL_PROCESSION.006"
      ]
    }
  ]
});
export const SACRED_MUSIC_SUNG_TEXTS=Object.freeze(Object.fromEntries(
 Object.entries(SACRED_MUSIC_TEXT_PLANS).map(([workId, movements])=>[
  workId,Object.freeze(movements.map(({movementId,textIds})=>Object.freeze({
   movementId,
   lines:Object.freeze(textIds.map((id,index)=>{
    const source=sharedRequiemTextUnit(id);
    if(!source)throw new Error("UNRESOLVED_SACRED_MUSIC_TEXT_UNIT:"+movementId+":"+id);
    return Object.freeze({latin:source.latin,en:source.en,fr:source.fr,
     textId:id,section:source.section,scholaTrack:REQUIEM_TEXT_TRACK_XWALK[source.section],
     position:index+1});
   }))
  })))
 ])));
export function sungTextForMovement(workId,movementId){
 return SACRED_MUSIC_SUNG_TEXTS[workId]?.find(x=>x.movementId===movementId)??null;
}
export function sungTextCoverage(workId,movementIds=[]){
 return Object.freeze({workId,total:movementIds.length,complete:movementIds.filter(id=>Boolean(sungTextForMovement(workId,id))).length});
}
