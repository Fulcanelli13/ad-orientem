// Research-only DYK display adapter. This module does not approve, publish,
// route, or register a fact in Home. It removes the old drafting Q-form so the
// existing Home "Did you know that…" header is never repeated in the card.
export function normalizeDraftStatement(text,language="en"){
  const raw=String(text??"").trim();
  const fr=language==="fr";
  if(language!=="en"&&!fr)throw new TypeError("Unsupported DYK language");
  const lead=fr?/^Saviez-vous qu(?:e\s*,?\s*|['’])/i:/^Did you know that\s+/i;
  if(!lead.test(raw))throw new TypeError("Unrecognized DYK drafting prefix");
  let statement=raw.replace(lead,"").replace(/\?\s*$/,"").trim();
  if(!statement||/^[,;:]/.test(statement)||/[?]/.test(statement))
    throw new TypeError("Unreviewed DYK statement syntax");
  statement=statement[0].toLocaleUpperCase(fr?"fr":"en")+statement.slice(1);
  if(!/[.!…]$/.test(statement))statement+=".";
  return statement;
}
// Conversion is syntactic, not a factual, doctrinal, cultural, or FR-style
// certificate. Individual claims remain gated by source, native translation,
// semantic duplication and exact-click browser acceptance.
