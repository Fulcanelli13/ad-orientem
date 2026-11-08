/**
 * Three short traditional devotional forms checked against the user's
 * May 2013 Red Booklet scan, PDF pp. 60, 65, 68 (printed 59, 64, 67).
 *
 * These are SHORT PRIVATE invocations, never replacements for the canonical
 * Confession preparation, Pius XI Act of Reparation, or Rosary bead engine.
 * The scan is not redistributed. English is the sole attested face from it:
 * no artificial French/Latin text and no claimed 2013 permissions.
 *
 * Fatima is a source comparator only until its actual donor player text
 * and placement are compared by phone acceptance.
 */
const WITNESSES={
 guardianAngelConfession:{
  id:"conf_angel",printedPage:59,pdfPage:60,language:"en",
  title:"Guardian Angel · before Confession",
  english:"My Guardian Angel, help me to make a good confession.",
  route:"pray.confession",mode:"supplemental_private_invocation",
  source:"Coalition in Support of Ecclesia Dei · Booklet Missal · May 2013 · p. 59",
  independentSimilarWitness:"https://stccc.org/examination-of-conscience/",
  printedTextCompared:true,existingCanonicalTextReplaced:false
 },
 heartAspirations:{
  id:"communion_heart_aspirations",printedPage:64,pdfPage:65,language:"en",
  title:"Short aspirations to the Sacred Heart",
  englishLines:Object.freeze([
   "Heart of Jesus, burning with love for us, set our hearts on fire with love of Thee.",
   "Heart of Jesus, I put my trust in Thee.",
   "Sweet Heart of Jesus, grant that I may love Thee more and more."
  ]),
  route:"pray.communion_treasury",mode:"optional_after_communion",
  source:"Coalition in Support of Ecclesia Dei · Booklet Missal · May 2013 · p. 64",
  independentSimilarWitness:"https://archseattle.org/sacredheart/",
  printedTextCompared:true,existingCanonicalTextReplaced:false
 },
 fatimaDecade:{
  id:"fatima",printedPage:67,pdfPage:68,language:"en",
  title:"Fatima decade prayer · 2013 booklet form",
  english:"O my Jesus, forgive us our sins. Save us from the fires of hell. Lead all souls to Heaven, especially those most in need of Thy mercy.",
  route:"pray.rosary",mode:"source_comparison_only",
  source:"Coalition in Support of Ecclesia Dei · Booklet Missal · May 2013 · p. 67",
  independentSimilarWitness:"https://wafboston.org/prayers",
  printedTextCompared:true,existingCanonicalTextReplaced:false,
  donorWordingCertified:false
 }
};
export const RED_BOOKLET_2013_VARIANT_WITNESSES_V1=Object.freeze(
 Object.fromEntries(Object.entries(WITNESSES).map(([k,v])=>[k,Object.freeze(v)]))
);
