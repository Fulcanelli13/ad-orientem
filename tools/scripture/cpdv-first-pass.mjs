/**
 * Editorial first-pass examination of the actual pinned DRC and CPDV texts,
 * 2026-10-09. This is a prioritized finding inventory, NOT biblical
 * translation certification or an ecclesiastical approbation.
 * Every question remains open until the publisher master, Latin source,
 * translation sense and reference range have been checked in context.
 */
const findings=[
 ["Genesis 3:15","medium","Retains the traditional feminine pronoun and crushed-head rendering; check the Latin and traditional exegesis, noting translation and interpretation are distinct."],
 ["Isaiah 7:14","low","Retains virgin and Immanuel; verify wording of the messianic prophecy in the primary CPDV edition."],
 ["Matthew 1:23","low","Retains the virgin conception and God-with-us statement. Contextual review remains required."],
 ["Luke 1:28","low","Retains full of grace and the blessing among women; check textual provenance and punctuation."],
 ["Luke 1:42","low","Preserves the blessing of Our Lady and of the fruit of her womb."],
 ["Luke 1:43","high","How does this concern me can obscure Elizabeth's expression of wonder at the Mother of her Lord visiting her."],
 ["Luke 1:46","low","Magnificat's magnifies is more accessible than doth magnify, with no obvious discrepancy in the examined verse."],
 ["John 1:1","high","Inversion God was the Word follows Latin order but can be read ambiguously; review Trinity/Word predication, original language, and surrounding prologue."],
 ["John 1:14","medium","Retains Word made flesh sense and only-begotten Son; compare capitalization and Sonship wording to latest author master."],
 ["John 6:51","high","The examined verse contains only the opening bread-of-life sentence; verify Vulgate-specific distribution of the Eucharistic flesh clause across verses."],
 ["John 6:54","low","Retains necessity of eating the Son of Man's flesh and drinking his blood; examine nearby verses 52–59."],
 ["Matthew 26:26","low","Preserves This is my body and the institution narrative."],
 ["Luke 22:19","medium","Retains body given for you and commemoration, but compare institutional vocabulary and context with Luke's printed Vulgate."],
 ["1Corinthians 11:27","medium","Shall be liable of is awkward modern English; retains culpability for irreverent reception."],
 ["1Corinthians 11:29","medium","Not discerning it to be the body retains Eucharistic reference; confirm meaning of judgment and preparation for Communion."],
 ["Matthew 16:18","low","Retains Peter, rock, Church and gates of Hell; theology not determined by isolated verse."],
 ["Matthew 16:19","low","Retains keys and binding/loosing, using release for loose; review ecclesial register in context."],
 ["John 20:23","low","Retains forgiving and retaining sins; verify sacramental context."],
 ["Matthew 28:19","low","Retains baptism in the names of the Father, Son and Holy Spirit."],
 ["1Timothy 3:15","medium","Pillar and foundation of truth retained; awkward syntax around the house of God."],
 ["2Thessalonians 2:14","high","Original source Catholic versification places hold the traditions here rather than common 2:15. Never auto-link by bare modern verse ID."],
 ["James 2:24","low","Retains justification by works and not faith alone."],
 ["Romans 8:28","medium","Meaning broadly aligned; unto good and subordinate clause remain difficult, so accessibility gain limited."],
 ["Matthew 5:28","high","Anyone who will have looked is unnatural grammar and risks obscuring Christ's teaching about deliberate lust."],
 ["1Corinthians 13:4","medium","Modernises envy and dealeth but is not inflated is an awkward expression for not puffed up."],
 ["Acts 2:42","medium","Communion of the breaking of the bread is still difficult to parse; check ecclesial and liturgical terminology."],
 ["Proverbs 3:5","low","Replaces thy with your but retains the formal term prudence; readability improvement modest."],
 ["Psalms 22:1","high","Catholic/Vulgate Psalm 22 corresponds to common modern Psalm 23; directs me differs from ruleth me and familiar shepherd idiom."],
 ["Sirach 24:1","high","Wisdom will praise her own mind is an unusually interpretive wording compared with DRC's her own self; inspect Vulgate animam suam and ecclesial use."],
 ["Tobit 12:9","medium","Retains almsgiving and sins; align Vulgate/deuterocanonical numbering and sacramental interpretation."],
 ["2Maccabees 12:46","high","The explicit holy and wholesome prayer for the dead is in verse 46 of the acquired Catholic witnesses, not verse 45. Verify chapter mapping before cross-version links."],
 ["Wisdom 2:12","medium","Let us encircle the just may change the nuance of lie in wait for the just; compare Latin and Christological traditional interpretation."],
 ["Baruch 3:36","medium","Concise assertion of the one true God; deuterocanonical versification may vary by edition."],
 ["Revelation 12:1","medium","Retains the woman clothed with the sun; Marian identification is a traditional typological interpretation, not automatically the sole literal referent."]
];
export const CPDV_FIRST_PASS=Object.freeze(Object.fromEntries(findings.map(([reference,priority,note])=>[
 reference,Object.freeze({reference,priority,note,kind:"first-pass-editorial-observation",
 independentOriginalEditionCollation:"pending",
 fullContextReview:"pending",theologicalReview:"pending",certificate:"NOT_CERTIFIED"})
])));
export function annotateCpdvReview(report) {
 if(!Array.isArray(report?.items))throw new TypeError("Review items missing");
 const seen=new Set();
 const items=report.items.map(item=>{
  const note=CPDV_FIRST_PASS[item.reference];
  if(!note)throw new Error("Missing editorial observation: "+item.reference);
  if(seen.has(item.reference))throw new Error("Duplicate reviewed reference "+item.reference);
  seen.add(item.reference);
  return {...item,firstPass:note,approvedForPublication:false,doctrinalReview:"pending",
   textualCollation:"pending",readabilityReview:"pending"};
 });
 const missing=Object.keys(CPDV_FIRST_PASS).filter(x=>!seen.has(x));
 if(missing.length)throw new Error("Unused editorial observations "+missing.join(", "));
 return {...report,items,
  firstPassReviewed:items.length,
  priorityCount:Object.fromEntries(["high","medium","low"].map(p=>[p,items.filter(i=>i.firstPass.priority===p).length])),
  certified:0,
  warning:"34 human-authored comparison observations; none constitutes textual, ecclesial or theological certification."};
}
