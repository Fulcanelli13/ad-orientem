import {parseScriptureContext} from "../scripture/context.js";

/**
 * Contextual navigation for the eight existing source-backed Mass lessons.
 * Each entry is a BIBLE STUDY PARALLEL to the named lesson, not an assertion
 * that the 1962 Missal prints the identical text or prescribes a particular
 * Proper, gesture or rite. No draft historical explanations are imported.
 * The shared Scripture owner alone supplies translation, versification,
 * passage/chapter/commentary, original-source labels and return navigation.
 */
export const MASS_FORMATION_SCRIPTURE_ANCHORS=Object.freeze([
  {id:"MFS17",stageId:"MF01",reference:"Matthew 20:30–31",relationship:"COMPARATIVE_PASSAGE",title:{en:"Kyrie · the cry for mercy",fr:"Kyrie · l'appel à la miséricorde"}},
  {id:"MFS18",stageId:"MF01",reference:"John 1:14",relationship:"DOCTRINAL_PARALLEL",title:{en:"The Incarnation · Word made flesh",fr:"L'Incarnation · le Verbe fait chair"}},
  {id:"MFS01",stageId:"MF01",reference:"Luke 2:14",relationship:"ADAPTED_WORDS",title:{en:"Gloria · angelic acclamation",fr:"Gloria · acclamation des anges"}},
  {id:"MFS02",stageId:"MF01",reference:"Isaiah 6:3",relationship:"ADAPTED_WORDS",title:{en:"Sanctus · Isaiah's vision",fr:"Sanctus · vision d'Isaïe"}},
  {id:"MFS03",stageId:"MF01",reference:"Matthew 21:9",relationship:"ADAPTED_WORDS",title:{en:"Benedictus · entry into Jerusalem",fr:"Benedictus · entrée à Jérusalem"}},
  {id:"MFS04",stageId:"MF02",reference:"Luke 18:13",relationship:"COMPARATIVE_PASSAGE",title:{en:"Contrition and the publican",fr:"Contrition et prière du publicain"}},
  {id:"MFS05",stageId:"MF03",reference:"Romans 12:1",relationship:"DOCTRINAL_PARALLEL",title:{en:"Offering oneself to God",fr:"S'offrir à Dieu"}},
  {id:"MFS06",stageId:"MF04",reference:"1 Timothy 2:1–2",relationship:"DOCTRINAL_PARALLEL",title:{en:"Prayers and intercessions",fr:"Prières et intercessions"}},
  {id:"MFS07",stageId:"MF05",reference:"1 Corinthians 11:23–26",relationship:"NARRATIVE_CONTEXT",title:{en:"The Lord's Supper · apostolic account",fr:"La Cène · récit apostolique"}},
  {id:"MFS08",stageId:"MF05",reference:"Luke 22:20",relationship:"NARRATIVE_CONTEXT",title:{en:"The chalice at the Last Supper",fr:"Le calice à la dernière Cène"}},
  {id:"MFS09",stageId:"MF06",reference:"Genesis 4:4",relationship:"NAMED_FIGURE",title:{en:"Abel's offering",fr:"L'offrande d'Abel"}},
  {id:"MFS10",stageId:"MF06",reference:"Genesis 22:1–19",relationship:"NAMED_FIGURE",title:{en:"Abraham and Isaac",fr:"Abraham et Isaac"}},
  {id:"MFS11",stageId:"MF06",reference:"Genesis 14:18–20",relationship:"NAMED_FIGURE",title:{en:"Melchisedech in Genesis",fr:"Melchisédech dans la Genèse"}},
  {id:"MFS12",stageId:"MF06",reference:"Hebrews 7:1–17",relationship:"DOCTRINAL_PARALLEL",title:{en:"Melchisedech and priesthood",fr:"Melchisédech et le sacerdoce"}},
  {id:"MFS13",stageId:"MF07",reference:"Matthew 6:9–13",relationship:"ADAPTED_WORDS",title:{en:"The Lord's Prayer",fr:"Le Notre Père"}},
  {id:"MFS14",stageId:"MF07",reference:"John 1:29",relationship:"ADAPTED_WORDS",title:{en:"Behold the Lamb of God",fr:"Voici l'Agneau de Dieu"}},
  {id:"MFS15",stageId:"MF07",reference:"Matthew 8:8",relationship:"ADAPTED_WORDS",title:{en:"The centurion's words",fr:"Les paroles du centurion"}},
  {id:"MFS16",stageId:"MF08",reference:"John 1:1–14",relationship:"CONDITIONAL_RITE_CONTEXT",title:{en:"Last Gospel · only when prescribed",fr:"Dernier Évangile · lorsqu'il est prescrit"}}
].map(item=>Object.freeze({...item,title:Object.freeze(item.title)})));

export const MASS_FORMATION_SCRIPTURE_RELATIONSHIPS=Object.freeze({
 ADAPTED_WORDS:{en:"Related biblical words; not a word-for-word Missal collation.",fr:"Paroles bibliques liées ; sans prétendre à une identité littérale avec le Missel."},
 COMPARATIVE_PASSAGE:{en:"Devotional comparison, not a quotation from the rite.",fr:"Rapprochement spirituel, non une citation du rite."},
 DOCTRINAL_PARALLEL:{en:"Theological context, not identical liturgical wording.",fr:"Contexte théologique, non une formule liturgique identique."},
 NARRATIVE_CONTEXT:{en:"Biblical account; the full 1962 sacramental formula is not reproduced here.",fr:"Récit biblique ; la formule sacramentelle complète de 1962 n'est pas reproduite ici."},
 NAMED_FIGURE:{en:"Person named by the Roman Canon; not a Proper reading.",fr:"Personnage nommé dans le Canon romain ; non une lecture du Propre."},
 CONDITIONAL_RITE_CONTEXT:{en:"Only for Masses in which the Last Gospel is prescribed.",fr:"Uniquement aux Messes où le Dernier Évangile est prescrit."}
});

const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const sameOwners=new Set();
for(const item of MASS_FORMATION_SCRIPTURE_ANCHORS){
 if(!/^MF0[1-8]$/.test(item.stageId)||
    !MASS_FORMATION_SCRIPTURE_RELATIONSHIPS[item.relationship]||
    !item.title.en||!item.title.fr||!parseScriptureContext(item.reference)||sameOwners.has(item.id))
  throw new Error("Invalid Mass Formation Scripture study anchor: "+item.id);
 sameOwners.add(item.id);
}
export function massFormationScriptureForStage(stageId){
 return MASS_FORMATION_SCRIPTURE_ANCHORS.filter(x=>x.stageId===stageId);
}

/** Marked-up buttons are handled by the single installed Scripture click owner. */
export function massFormationScriptureHtml(stageId,{french=false}={}){
 return renderMassFormationScriptureLinks(massFormationScriptureForStage(stageId),{french});
}
/** Existing study-only Scripture labels, reused without creating new verse
 * citations, editions or a second Scripture reader. Unknown anchors fail closed. */
export function massFormationScriptureHtmlForAnchorIds(ids,{french=false}={}){
 const unique=[...new Set(ids||[])];
 const byId=new Map(MASS_FORMATION_SCRIPTURE_ANCHORS.map(item=>[item.id,item]));
 if(unique.some(id=>!byId.has(id)))throw new Error("Unknown Mass Formation Scripture anchor");
 return renderMassFormationScriptureLinks(unique.map(id=>byId.get(id)),{french});
}
function renderMassFormationScriptureLinks(links,{french=false}={}){
 if(!links.length)return "";
 const lang=french?"fr":"en";
 const rows=links.map(item=>{
  const note=MASS_FORMATION_SCRIPTURE_RELATIONSHIPS[item.relationship][lang];
  const name=item.title[lang];
  return '<li class="aoMFBibleItem"><button type="button" class="aoScriptureContextCapsule" data-ao-scripture-context="'+esc(item.reference)+
   '" data-ao-mass-formation-anchor="'+esc(item.id)+'" aria-label="'+esc((french?"Lire dans la Bible : ":"Read in Bible: ")+name+" · "+item.reference)+
   '"><strong>'+esc(name)+'</strong><span>'+esc(item.reference)+'</span></button><small>'+esc(note)+'</small></li>';
 }).join("");
 return '<section class="aoMFBible" aria-label="'+(french?"Écriture en contexte":"Scripture in context")+
  '"><h2>'+(french?"Approfondir dans la Bible":"Explore the Bible passages")+'</h2><p>'+
  (french?"Ces passages éclairent le thème étudié ; ils ne remplacent ni le Missel de 1962 ni les sources citées dans la leçon.":"These passages illuminate the lesson; they do not replace the 1962 Missal or the lesson’s cited sources.")+
  '</p><ul>'+rows+'</ul></section>';
}
