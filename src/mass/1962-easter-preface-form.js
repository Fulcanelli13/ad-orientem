// Exact three-form reconstruction of the 1962 Paschal Preface from the
// historical [Pasch] source, which encodes all three alternatives together.
// Does not choose the Mass. Never invent a translation on missing source data.
// Rubric (1962 Missal): Vigil = nocte; Easter day through Saturday in albis
// = die; later until Ascension vigil = hoc.
// https://icrspfrance.fr/textes-liturgiques.php?article=xe8e36173_lisible
export const EASTER_PREFACE_FORMS=Object.freeze({
  VIGIL_NIGHT:"VIGIL_NIGHT",
  OCTAVE_DAY:"OCTAVE_DAY",
  EASTERTIDE:"EASTERTIDE",
});
export const EASTER_PREFACE_AUTHORITY=
  "https://liturgiapapal.org/index.php/recursos-lit%C3%BArgicos/misal/missale-1962/1716-prefacios.html";

const templates=Object.freeze({
  la:Object.freeze({
    title:/^Paschalis(?:\r?\n)/u,
    alternatives:/sed in~\s*hoc potíssimum~\s*\(sed tempore Passionis\)\s*hac potíssimum nocte~\s*\(sed octava Paschæ\)\s*hac potíssimum die~/u,
    variants:Object.freeze({
      VIGIL_NIGHT:"sed in hac potíssimum nocte",
      OCTAVE_DAY:"sed in hac potíssimum die",
      EASTERTIDE:"sed in hoc potíssimum",
    }),
    anchors:[/Vere dignum et justum est/iu,/cum Pascha nostrum immolátus est Christus/iu,
      /Qui mortem nostram moriéndo destrúxit/iu,/sine fine dicéntes/iu],
  }),
  en:Object.freeze({
    title:/^Easter(?:\r?\n)/u,
    alternatives:/in this season~\s*\(sed tempore Passionis\)\s*on this night~\s*\(sed octava Paschæ\)\s*on this day~/u,
    variants:Object.freeze({
      VIGIL_NIGHT:"on this night",
      OCTAVE_DAY:"on this day",
      EASTERTIDE:"in this season",
    }),
    anchors:[/It is truly meet and just/iu,/Christ our Pasch was sacrificed/iu,
      /by rising again hath restored us to life/iu,/evermore saying/iu],
  }),
  fr:Object.freeze({
    title:/^de Pâques(?:\r?\n)/u,
    alternatives:/en ce temps \(à la Messe de la Vigile pascale\) en cette nuit \(pendant l’octave de Pâques\) en ce jour \(après l’octave de Pâques\)/u,
    variants:Object.freeze({
      VIGIL_NIGHT:"en cette nuit",
      OCTAVE_DAY:"en ce jour",
      EASTERTIDE:"en ce temps",
    }),
    anchors:[/Il est vraiment juste et nécessaire/iu,/le Christ, notre pâque, a été immolé/iu,
      /nous a rendu la vie en ressuscitant/iu,/disant sans cesse/iu],
  }),
});

/**
 * @returns {string|null} A source-derived single-variant complete Preface,
 * or null when the trilingual source template is missing or has drifted.
 */
export function render1962EasterPrefaceVariant(sourceText,language,variant){
  const spec=templates[language];
  const form=spec?.variants?.[variant];
  if(!form||typeof sourceText!=="string"||sourceText.length<220)return null;
  if(!spec.title.test(sourceText)||spec.anchors.some(rx=>!rx.test(sourceText)))
    return null;
  const found=sourceText.match(spec.alternatives);
  if(!found||sourceText.match(new RegExp(spec.alternatives.source,"gu"))?.length!==1)
    return null;
  const selected=sourceText.replace(spec.alternatives,form)
    .replace(/~\s*\r?\n/g," ")
    .replace(/[ \t]*\r?\n[ \t]*/g,"\n")
    .trim();
  const firstBreak=selected.indexOf("\n");
  if(firstBreak<1)return null;
  const output=selected.slice(0,firstBreak)+"\n"+
    selected.slice(firstBreak+1).replace(/\s+/gu," ").trim();
  if(spec.anchors.some(rx=>!rx.test(output)))return null;
  // Both extraneous options and their parenthetical source instructions
  // must disappear from reader-facing text; the picked words must survive.
  if(output.includes("(sed tempore Passionis)")||
     output.includes("(sed octava Paschæ)")||
     output.includes("(à la Messe de la Vigile pascale)")||
     output.includes("(pendant l’octave de Pâques)")||
     output.includes("(après l’octave de Pâques)")||
     !output.includes(form))return null;
  if(language==="la" && (output.match(/potíssimum/gu)||[]).length!==1)return null;
  return output;
}
