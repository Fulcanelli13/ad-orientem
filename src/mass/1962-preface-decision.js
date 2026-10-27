// 1962 Preface decision gate. No translation, text substitution or DOM ownership.
// When source metadata is incomplete, return UNRESOLVED rather than Common.
// The actual calendar/proper source owner must supply an authenticated identity.
const OWNERS=Object.freeze({
  "tempora:pasc7-0":"SPIRITU",
  "sancti:10-07":"MARIA",
  "sancti:12-08":"MARIA",
  "sancti:02-02":"NATIVITATE"
});
const HEADINGS=Object.freeze({
  SPIRITU:/^(?:de\s+spiritu\s+sancto|de\s+sancto\s+spiritu)/i,
  QUADRAGESIMA:/^de\s+quadragesima/i,
  MARIA:/^(?:de\s+beata\s+maria\s+virgine|de\s+b\.?\s*m\.?\s*v\.?)/i,
  NATIVITATE:/^de\s+nativitate\s+domini/i,
  TRINITATE:/^de\s+sanctissima\s+trinitate/i,
  COMMUNIS:/^communis/i,
  PASCHALIS:/^paschalis/i
});
const YEAR_CYCLE=Object.freeze({
  "2026-05-24":"tempora:Pasc7-0",
  "2026-10-07":"sancti:10-07",
  "2026-12-08":"sancti:12-08"
});
const slotText=(preface)=>String(preface?.lat??preface?.la??"").trim();
const heading=text=>Object.entries(HEADINGS).find(([,regex])=>regex.test(text))?.[0]??null;
const ownerKey=id=>String(id??"").toLowerCase().replace(/:[^:]+:[^:]+$/,"");
export function inspect1962PrefaceSelection({principalCelebrationId,selectedPreface,requestedCelebrationId=null}={}){
  if(requestedCelebrationId&&requestedCelebrationId!=="mass_of_day")
    return Object.freeze({status:"NEEDS_SELECTED_FORMULARY",requiredId:null,actualId:heading(slotText(selectedPreface)),
      reason:"An explicit votive or special Mass cannot inherit the day's principal Preface blindly."});
  const key=ownerKey(principalCelebrationId);
  // Required Prefaces for the source-owned Lenten Temporale and for the
  // Pentecost Vigil/octave: 1960 Missal §§486(a), 493(a). An inherited
  // Common Preface must be blocked if source recovery cannot retrieve the
  // authenticated named trilingual section.
  const id=String(principalCelebrationId??"");
  const requiredId=OWNERS[key]??
    (/^tempora:Quad[1-4]-[0-6]:[1-3]:v$/i.test(id)?"QUADRAGESIMA":
     /^tempora:Pasc(?:6-6|7-[0-6]):1:r$/i.test(id)?"SPIRITU":null);
  const actualId=heading(slotText(selectedPreface));
  if(!requiredId)return Object.freeze({status:"UNMAPPED_SOURCE",requiredId:null,actualId,
    reason:"No category certified by this narrow source decision register; no inferred Common Preface."});
  return Object.freeze({status:!actualId?"MISSING_PREFACE":actualId===requiredId?"MATCH":"CONTRADICTION",
    requiredId,actualId,reason:actualId===requiredId?null:"Resolved Latin Preface contradicts 1962 celebration source."});
}
export const PREFACE_SELECTION_WITNESSES=Object.freeze({
  sources:Object.freeze([
    "https://extraordinaryform.org/ordo/2025-2026Ordo.pdf",
    "https://www.liturgiapapal.org/index.php/recursos-lit%C3%BArgicos/misal/missale-1962/1716-prefacios.html",
    "https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Ordo/Prefationes.txt"
  ]),
  verifiedOwnerKeys:Object.freeze(Object.keys(OWNERS)),
  verifiedSeasonalPatterns:Object.freeze([
    "tempora:Quad[1-4]-[0-6]:[1-3]:v → QUADRAGESIMA (§486a)",
    "tempora:Pasc(6-6|7-[0-6]):1:r → SPIRITU (§493a)"
  ]),
  auditCycleCrosscheck:Object.freeze(YEAR_CYCLE),
  note:"Narrow regression owners only; expand to full-year 1962 rubrical certification before release."
});
