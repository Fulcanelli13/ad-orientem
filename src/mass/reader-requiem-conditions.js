// One resolved-Mass Requiem predicate for Low and Sung ceremonial projections.
// Do not infer the rite from a date or reader scroll. Unknown selections remain
// ordinary only where an ordinary form has actually been selected.
export function isExplicitRequiemMass(prepared,conditions=null){
  const resolved=prepared?.session?.resolvedMass??{};
  const plan=prepared?.session?.plan??{};
  if(resolved?.provenance?.isRequiem===true || resolved?.isRequiem===true)return true;
  const token=x=>String(typeof x==="string"?x:x?.id??x?.type??"").trim().toUpperCase();
  const arr=x=>Array.isArray(x)?x:[];
  if(["REQUIEM","MASS_FOR_THE_DEAD"].includes(token(resolved?.actualCelebration?.type)))return true;
  if(["REQUIEM","MASS_FOR_THE_DEAD"].includes(token(resolved?.actualCelebration?.kind)))return true;
  return [
    ...arr(resolved.overlays),
    ...arr(resolved.conditions),
    ...arr(resolved?.provenance?.conditions),
    ...arr(plan.overlayGraphs),
    ...arr(conditions instanceof Set?[...conditions]:conditions)
  ].some(x=>["REQUIEM","MASS_FOR_THE_DEAD"].includes(token(x)));
}

// Ritus servandus XIII.1: in Masses for the Dead the entire Psalm 42
// (Judica me) with its repeated Introibo dialogue is omitted, but the FIRST
// Introibo/Ad Deum and the subsequent Adjutorium/Confiteor remain.
// XIII.1 also omits Gloria Patri + Sicut erat at the Lavabo; the Psalm
// Lavabo itself remains. Suppress only exact donor cues, not the canonical
// Ordinary or its underlying archival source files.
// https://usus-antiquior.github.io/ritus-servandus.html#XIII
const REQUIEM_FOOT_PSALM_AND_LAVABO_OMISSIONS=Object.freeze([
 ...Array.from({length:10},(_,i)=>"AO.SM.C"+String(i+4).padStart(4,"0")),
 "AO.SM.C0126","AO.SM.C0127",
]);
export function requiemFootPsalmAndLavaboOmittedCuesForResolvedMass(resolvedMass){
 return isExplicitRequiemMass({session:{resolvedMass}})
   ?REQUIEM_FOOT_PSALM_AND_LAVABO_OMISSIONS:Object.freeze([]);
}

// XIII.1: the private Jube, Domine / Dominus sit in corde meo before
// the Gospel and the Per evangelica dicta with Gospel-book kiss are omitted.
// Munda cor meum, the Gospel proclamation and Laus tibi remain unchanged.
// Neither calendar date nor the generic burial following-action is authority.
const REQUIEM_GOSPEL_OMISSIONS=Object.freeze([
 "AO.SM.C0080","AO.SM.C0088",
]);
export function requiemGospelOmittedCuesForResolvedMass(resolvedMass){
 return isExplicitRequiemMass({session:{resolvedMass}})
   ?REQUIEM_GOSPEL_OMISSIONS:Object.freeze([]);
}
export function isRequiemGospelCeremonyOmitted(cueId,prepared,conditions=null){
 return REQUIEM_GOSPEL_OMISSIONS.includes(String(cueId??"")) &&
   isExplicitRequiemMass(prepared,conditions);
}
// XIII.1: at the Introit the celebrant does NOT sign himself; he makes
// a Cross above the Missal with his extended right hand.
export function requiemIntroitCrossActionForResolvedMass(resolvedMass){
 if(!isExplicitRequiemMass({session:{resolvedMass}}))return null;
 return Object.freeze({
   cueId:"AO.SM.C0042",
   action:"Traces the sign of the Cross over the Missal, without signing himself.",
   source:"RITUS_SERVANDUS_XIII_1",
   observedNow:false,
 });
}

// Ritus servandus XIII.2: at a Requiem the INITIAL altar incensation
// at the Introit is omitted, even in a form using incense at the Offertory.
// These are exact fixed-Ordinary source identities; never globally disable
// incense on a selected Requiem Mass.
// https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/
const OMITTED_REQUIEM_ENTRANCE_INCENSE_CUES=Object.freeze([
  "AO.SM.C0040","AO.SM.C0041",
]);
export function requiemEntranceIncensationOmittedCuesForResolvedMass(resolvedMass){
  return isExplicitRequiemMass({session:{resolvedMass}})
    ? OMITTED_REQUIEM_ENTRANCE_INCENSE_CUES : Object.freeze([]);
}
export function isRequiemEntranceIncensationOmitted(cueId,prepared,conditions=null){
  return OMITTED_REQUIEM_ENTRANCE_INCENSE_CUES.includes(String(cueId??""))
    && isExplicitRequiemMass(prepared,conditions);
}

// Ritus servandus XIII.1: after Placeat and the altar kiss, the
// final blessing is OMITTED and the Last Gospel follows directly.
const OMITTED_REQUIEM_FINAL_BLESSING_CUES=Object.freeze([
 "AO.SM.C0263","AO.SM.C0264","AO.SM.C0265","AO.SM.C0266",
]);
export function requiemFinalBlessingOmittedCuesForResolvedMass(resolvedMass){
 return isExplicitRequiemMass({session:{resolvedMass}})
   ? OMITTED_REQUIEM_FINAL_BLESSING_CUES : Object.freeze([]);
}
export function isRequiemFinalBlessingOmitted(cueId,prepared,conditions=null){
 return OMITTED_REQUIEM_FINAL_BLESSING_CUES.includes(String(cueId??""))
   && isExplicitRequiemMass(prepared,conditions);
}

// Ritus servandus XIII.2: at an incensed Requiem Offertory ONLY the
// celebrant receives incense after the oblations and altar are incensed.
// Do not present the ordinary 'clergy and people are incensed' direction.
// This does not alter the underlying Canonical Latin prayer source.
export function requiemOffertoryIncensationVariantsForResolvedMass(resolvedMass){
 return isExplicitRequiemMass({session:{resolvedMass}})
  ? Object.freeze({"AO.SM.C0124":Object.freeze({
      lat:"[Incensatur solus celebrans]",
      en:"[Only the celebrant is incensed]",
      fr:"[Seul le célébrant est encensé]",
    })})
  : null;
}

// Ritus servandus X.4 / XIII.1: at a Mass for the dead the celebrant does
// not strike his breast at the three Agnus Dei invocations. Do not project
// optional faithful strike prompts from the ordinary rite either.
// This filters actions only: prayer, priest voice and posture stay independent.
export function isRequiemAgnusBreastStrikeOmitted(cueId,prepared,conditions=null){
  return /^AO\.SM\.C022[234]$/.test(String(cueId??"")) && isExplicitRequiemMass(prepared,conditions);
}

// Ritus servandus XIII.1: this is a FORM-SELECTED TEXT substitution in the
// existing Ordinary cue IDs, NOT another Proper or reader corpus.
// https://www.intratext.com/IXT/LAT0820/_PO.HTM
// Source-owned Requiem text does not imply observed physical action.
const REQUIEM_AGNUS=Object.freeze(Object.fromEntries([
  ["AO.SM.C0222","dona eis réquiem.","grant them rest.","donnez-leur le repos."],
  ["AO.SM.C0223","dona eis réquiem.","grant them rest.","donnez-leur le repos."],
  ["AO.SM.C0224","dona eis réquiem sempitérnam.","grant them eternal rest.","donnez-leur le repos éternel."],
].map(([cueId,latinEnding,englishEnding,frenchEnding])=>[cueId,Object.freeze({
  lat:"Agnus Dei, qui tollis peccáta mundi: "+latinEnding,
  en:"Lamb of God, who takest away the sins of the world: "+englishEnding,
  fr:"Agneau de Dieu, qui enlevez les péchés du monde : "+frenchEnding,
})])));
export function requiemAgnusVariantsForResolvedMass(resolvedMass){
  if(!isExplicitRequiemMass({session:{resolvedMass}}))return null;
  return REQUIEM_AGNUS;
}

// 1962 Missal General Rubrics 507(c) and Ritus servandus XIII.1:
// every Mass for the Dead has Requiescant in pace / Amen, not the ordinary
// Ite, missa est / Deo gratias. Keep the original two cue identities and
// donor text untouched; this is a source-selected reader display variant.
// https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html
const REQUIEM_DISMISSAL=Object.freeze({
  "AO.SM.C0259":Object.freeze({
    lat:"℣. Requiéscant in pace.",
    en:"℣. May they rest in peace.",
    fr:"℣. Qu'ils reposent en paix.",
  }),
  "AO.SM.C0260":Object.freeze({
    lat:"℟. Amen.",en:"℟. Amen.",fr:"℟. Amen.",
  }),
});
export function requiemDismissalVariantsForResolvedMass(resolvedMass){
  return isExplicitRequiemMass({session:{resolvedMass}})
    ?REQUIEM_DISMISSAL:null;
}

// Ritus servandus XI.1: after Dominus vobiscum the Requiem dismissal is
// delivered facing the altar; the ordinary-facing-people source action is
// inapplicable. Return an exact cue guard for Low and Sung state channels.
export function isRequiemAltarFacingDismissal(cueId,prepared,conditions=null){
  return String(cueId??"")==="AO.SM.C0259" &&
    isExplicitRequiemMass(prepared,conditions);
}

// In the 1962 Requiem the FIRST pre-Communion peace prayer is omitted,
// but the two following priest-Communion prayers remain. Exact canonical
// cue ownership must be preserved for LIVE / SIMPLE / MISSAL navigation.
// Ritus servandus X.4; XIII.1: https://www.intratext.com/IXT/LAT0820/_PO.HTM
const OMITTED_REQUIEM_ORDINARY_CUES=Object.freeze(["AO.SM.C0225"]);
export function requiemOmittedOrdinaryCuesForResolvedMass(resolvedMass){
  return isExplicitRequiemMass({session:{resolvedMass}})?OMITTED_REQUIEM_ORDINARY_CUES:Object.freeze([]);
}
export function isRequiemFirstPeacePrayerOmitted(cueId,prepared,conditions=null){
  return String(cueId??"")==="AO.SM.C0225"&&isExplicitRequiemMass(prepared,conditions);
}


// Ritus servandus XIII.3: the distribution of candles is CONDITIONAL.
// These are static book/source notes, never an observed candle event, a
// universal faithful posture, or a replacement for the canonical Mass cues.
// The sermon and post-Mass lighting directions belong to the explicit
// Absolution following-action, not the Mass's ordinary dismissal.
export const REQUIEM_XIII3_SOURCE="https://usus-antiquior.github.io/ritus-servandus.html#XIII";
export const REQUIEM_XIII3_NOTE_OWNER="REQUIEM_XIII3_CONDITIONAL_SOURCE";
const REQUIEM_XIII3_NOTES=Object.freeze({
  "AO.SM.C0076":Object.freeze({
    en:"If candles are to be distributed, they are distributed after the Epistle.",
    fr:"Si des cierges doivent être distribués, on les distribue après l’Épître.",
  }),
  "AO.SM.C0082":Object.freeze({
    en:"If candles have been distributed, they are lit at the Gospel.",
    fr:"Si des cierges ont été distribués, on les allume à l’Évangile.",
  }),
  "AO.SM.C0174":Object.freeze({
    en:"If candles have been distributed, they are lit at the elevation of the Blessed Sacrament.",
    fr:"Si des cierges ont été distribués, on les allume à l’élévation du Saint-Sacrement.",
  }),
});
const REQUIEM_XIII3_FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);

// Preserve the original text and event-owner lists. An unmatched/ordinary
// source cue never acquires a Requiem-specific ceremonial explanation.
export function withRequiemXIII3MissalNotes(paragraphs,resolvedMass,{language="en"}={}){
  if(!Array.isArray(paragraphs))return Object.freeze([]);
  if(!isExplicitRequiemMass({session:{resolvedMass}}) ||
     !REQUIEM_XIII3_FORMS.has(String(resolvedMass?.form??"").toUpperCase()))
    return Object.freeze(paragraphs);
  const french=String(language).toLowerCase().startsWith("fr");
  return Object.freeze(paragraphs.map(paragraph=>{
    const notes=[...new Set(Array.isArray(paragraph?.sourceCueIds)?paragraph.sourceCueIds:[])]
      .filter(cueId=>Object.hasOwn(REQUIEM_XIII3_NOTES,cueId))
      .map(cueId=>Object.freeze({
        id:"AO.REQ.XIII3."+cueId.slice(-5),
        sourceCueId:cueId,
        actor:"FAITHFUL",
        kind:"CONDITIONAL_DIRECTION",
        sourceId:"MR62_RITUS",
        sourceUrl:REQUIEM_XIII3_SOURCE,
        owner:REQUIEM_XIII3_NOTE_OWNER,
        review:"RITUS_1962_REQUIEM_CANDLE_CONDITIONAL",
        displayText:REQUIEM_XIII3_NOTES[cueId][french?"fr":"en"],
        observedNow:false,
      }));
    if(!notes.length)return paragraph;
    return Object.freeze({...paragraph,
      publishedMissalRubrics:Object.freeze([
        ...(Array.isArray(paragraph.publishedMissalRubrics)?paragraph.publishedMissalRubrics:[]),
        ...notes,
      ]),
    });
  }));
}
