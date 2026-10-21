// Reader-only, objective section introductions. Not liturgical rubrics,
// exhortations, optional prayers or a new Mass-study corpus.
// Each sentence is a concise editorial projection of already published
// Formation claims or the original 1962 Mass text. Do not import P0 drafts.
export const READER_OBJECTIVE_CONTEXT_OWNER="MASS_READER_OBJECTIVE_CONTEXT_V1";
export const READER_OBJECTIVE_CONTEXT_ROWS=Object.freeze([
  {blockId:"AO.SM.B026",en:"The Holy Gospel is proclaimed as part of the Mass of the Catechumens.",fr:"Le saint Évangile est proclamé pendant la Messe des catéchumènes.",evidence:["MF01-C02"]},
  {blockId:"AO.SM.B031",en:"The gifts are prepared for the Eucharistic Sacrifice.",fr:"Les offrandes sont préparées pour le Sacrifice eucharistique.",evidence:["MF01-C03"]},
  {blockId:"AO.SM.B047",en:"The priest begins the silent Roman Canon, the prayer of offering and intercession.",fr:"Le prêtre commence le Canon romain à voix basse, prière d'offrande et d'intercession.",evidence:["MF04-C01"]},
  {blockId:"AO.SM.B048",en:"Within the Canon, the Church commemorates the living.",fr:"Dans le Canon, l'Église fait mémoire des vivants.",evidence:["MF04-C02"]},
  {blockId:"AO.SM.B052",en:"In this part, the bread is consecrated into Christ's Body and the Sacred Host is then elevated.",fr:"Dans cette partie, le pain devient le Corps du Christ par la consécration ; la sainte Hostie est ensuite élevée.",evidence:["MF05-C01","MF05-C03"]},
  {blockId:"AO.SM.B053",en:"In this part, the wine is consecrated into Christ's Blood and the chalice is then elevated.",fr:"Dans cette partie, le vin devient le Sang du Christ par la consécration ; le calice est ensuite élevé.",evidence:["MF05-C01","MF05-C03"]},
  {blockId:"AO.SM.B057",en:"Within the Canon, the Church commemorates the faithful departed.",fr:"Dans le Canon, l'Église fait mémoire des fidèles défunts.",evidence:["MF04-C02"]},
  {blockId:"AO.SM.B060",en:"The Canon ends by giving glory to the Father through Christ, in the unity of the Holy Ghost.",fr:"Le Canon s'achève en rendant gloire au Père par le Christ, dans l'unité du Saint-Esprit.",evidence:["AO.SM.C0202","AO.SM.C0203","AO.SM.C0204"]},
  {blockId:"AO.SM.B074",en:"The celebrant receives the Sacred Host; his Communion belongs to the integrity of the Mass.",fr:"Le célébrant communie à la sainte Hostie ; sa communion appartient à l'intégrité de la Messe.",evidence:["MF07-C01"]},
  {blockId:"AO.SM.B088",en:"The Postcommunion is the Church's liturgical thanksgiving after Communion.",fr:"La Postcommunion est l'action de grâces liturgique de l'Église après la Communion.",evidence:["MF08-C01"]},
].map(row=>Object.freeze({...row,evidence:Object.freeze([...row.evidence])})));

const byBlock=new Map(READER_OBJECTIVE_CONTEXT_ROWS.map(row=>[row.blockId,row]));
const knownForms=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const sourceCue=id=>/^AO\.SM\.C\d{4}$/.test(String(id??""));

// The canonical cue (not card number, inferred time or Schola playback) owns
// the chosen block. Return null if a split/conditional/exceptional card does
// not expose an unambiguous source row at that exact cue.
export function projectReaderObjectiveContext(card,{cueId,form,language="en"}={}){
  if(!sourceCue(cueId)||!knownForms.has(String(form??"").toUpperCase())||
     !Array.isArray(card?.blocks)||!Array.isArray(card?.paragraphs))return null;
  const matches=[];
  for(const block of card.blocks){
    const row=byBlock.get(block.blockId);
    if(!row||!Number.isInteger(block.firstParagraphIndex)||
       !Number.isInteger(block.paragraphCount)||block.paragraphCount<1)continue;
    const start=block.firstParagraphIndex,end=start+block.paragraphCount;
    if(start<0||end>card.paragraphs.length)continue;
    if(card.paragraphs.slice(start,end).some(p=>
      Array.isArray(p.sourceCueIds)&&p.sourceCueIds.includes(cueId)))matches.push(row);
  }
  if(matches.length!==1)return null;
  const selected=matches[0];
  const locale=String(language).toLowerCase().startsWith("fr")?"fr":"en";
  const text=selected[locale];
  return Object.freeze({owner:READER_OBJECTIVE_CONTEXT_OWNER,
    status:"SOURCE_GROUNDED_EDITORIAL_SHORT",blockId:selected.blockId,
    cueId:String(cueId),language:locale,text,evidence:selected.evidence,observedNow:false});
}
