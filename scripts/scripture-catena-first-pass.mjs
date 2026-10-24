/*
 * Living Catena — whole-corpus, source-preserving first pass.
 *
 * Run: node scripts/scripture-catena-first-pass.mjs
 *
 * IMPORTANT: This is a deterministic lexical inventory and review plan.
 * It does not infer that a Father posed a quoted question, approve an
 * interpretation, replace patristic words, or create Messenger responses.
 * Canonical Catena fragments remain the sole source of text.
 */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join,resolve} from "node:path";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const original=rel=>JSON.parse(readFileSync(join(root,rel),"utf8"));
const manifest=original("data/scripture/catena/manifest.v1.json");
const outdir=join(root,"data/scripture/catena/research/full-corpus-pass-20261021");
mkdirSync(outdir,{recursive:true});
const topics=[
 ["genealogy",/\b(genealog|generation|ancestr|lineage|begat|descend|abraham|david|joseph|heli)\b/i],
 ["incarnation",/\b(incarnat|virgin birth|conceiv|womb|human nature|born of a woman|became flesh|flesh of christ)\b/i],
 ["trinity",/\b(trinit|one substance|consubstantial|father and (the )?son|holy ghost|holy spirit|person[s]? of)\b/i],
 ["baptism",/\b(bapti|baptiz|jordan|washing of regeneration)\b/i],
 ["repentance",/\b(repent|peniten|contrit|conversion|converted|confess(?:ion|ed)?|remorse)\b/i],
 ["forgiveness",/\b(forgive|forgiven|forgiveness|remission|pardon|absolution)\b/i],
 ["faith",/\b(faith|believ|unbelief|incredul|credul)\b/i],
 ["grace",/\b(grace|merit|justif|predestin|elect(?:ion|ed)?|free will)\b/i],
 ["prayer",/\b(pray|prayer|petition|supplication|ask(?:ed|ing)? of god)\b/i],
 ["fasting",/\b(fast(?:ed|ing|s)?|bridegroom)\b/i],
 ["charity",/\b(love|charity|merciful|mercy|compassion|alms)\b/i],
 ["poverty_riches",/\b(poor|rich|riches|wealth|money|treasure|possessions?|beggar|mammon|talents?)\b/i],
 ["discipleship",/\b(discip|apostle|follow me|deny himself|take up (his|the) cross|obedien)\b/i],
 ["church",/\b(church|ecclesi|bishop|apostolic|body of christ|keys of heaven)\b/i],
 ["kingdom",/\b(kingdom of (god|heaven)|heavenly kingdom|kingdom of heaven)\b/i],
 ["parables",/\b(parable|figuratively|by the similitude|likened)\b/i],
 ["miracles_healing",/\b(heal|blind|deaf|dumb|leper|lame|palsy|miracle|raised (?:him|her|the dead)|sickness)\b/i],
 ["demons_temptation",/\b(demon|dæmon|devil|satan|tempt|evil spirit|unclean spirit|beelzebub)\b/i],
 ["mary_mother",/\b(virgin mary|mother of (god|jesus|our lord)|blessed virgin|holy virgin|madonna)\b/i],
 ["women_tomb",/\b(magdalene|magdalen|women at the tomb|tomb of (?:christ|jesus))\b/i],
 ["passion_crucifixion",/\b(passion|crucif|cross|golgotha|calvary|pilate|betray|judas|suffer(?:ed|ing|s)?)\b/i],
 ["resurrection",/\b(resurrect|rose from the dead|risen|rising from the dead|empty tomb)\b/i],
 ["ascension",/\b(ascend|ascension|taken up into heaven)\b/i],
 ["eucharist",/\b(eucharist|body and blood|bread of life|eat my flesh|drink my blood|lord.s supper|chalice)\b/i],
 ["judgement",/\b(judg|judgment|judgement|condemn|hell|punishment|everlasting fire)\b/i],
 ["eternal_life",/\b(eternal life|everlasting life|immortal|life to come|life everlasting)\b/i],
 ["scripture_prophecy",/\b(prophe|scripture|written in the law|moses|isaiah|psalm|fulfill(?:ed|ment)?)\b/i],
 ["jew_gentile",/\b(gentile|jew(?:s|ish)?|israel|synagogue|pharisee|sadducee|samaritan)\b/i],
 ["sabbath_law",/\b(sabbath|law of moses|commandment|precept|ritual law|circumcis)\b/i],
 ["angel",/\b(angel|archangel|heavenly messenger)\b/i],
 ["marriage_family",/\b(marri|husband|wife|divorce|adulter|father and mother|children)\b/i],
 ["chronology_gospels",/\b(evangelists? differ|other evangelist|matthew and (?:mark|luke|john)|mark and luke|according to luke|according to matthew|contradict|reconcil)\b/i]
];
const flagLegend={
 Q:"Literal question mark present; speaker unclassified",
 V:"Quotation or reported speech signal; speaker ambiguous",
 O:"Potential objector or hypothetical voice",
 D:"Potential dependence on preceding discourse",
 R:"Abbreviated editorial citation/reference (not exact original work proof)",
 C:"Collective gloss or pseudo-author label: source attribution review required",
 L:"Long excerpt over 1800 characters; may contain several arguments",
 S:"Short excerpt below 65 characters; may depend on preceding fragment",
 U:"No lexical topic matched",
 T:"More than seven lexical topics matched; possible over-tagging"
};
const summarizeTop=(m,n)=>Object.entries(m).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,n);
const increment=(obj,k)=>{obj[k]=(obj[k]||0)+1};
const byBook=[],allFathers={},allTopics={},allFlags={},duplicates=new Map(),allIDs=new Set();
let totalFragments=0,totalPericopes=0,totalQuestionRows=0,totalQuestionMarks=0,totalMultiFatherGroups=0,totalTopicless=0,totalBatches=0;
const write=(file,value)=>writeFileSync(join(outdir,file),JSON.stringify(value)+"\n");
for(const b of manifest.books){
 const book=b.gospel;
 const pack=original("data/scripture/catena/"+book+".json");
 assert.equal(pack.pericopes.length,b.pericopes,book+" pericopes differ from pinned manifest");
 const rows=[],groups=[],fatherCounts={},topicCounts={},flagCounts={};
 let qRows=0,qMarks=0,multiFatherGroupCount=0;
 for(const p of pack.pericopes){
  assert.ok(!allIDs.has(p.id),"Duplicate pericope "+p.id);
  allIDs.add(p.id);totalPericopes++;
  const topicFathers=new Map(),topicOrdinals=new Map(),perRows=[];
  for(let i=0;i<p.segments.length;i++){
   const seg=p.segments[i],text=seg.text||"",father=seg.father||"Unknown";
   const t=topics.filter(x=>x[1].test(text)).map(x=>x[0]);
   const qm=(text.match(/\?/g)||[]).length,flags=[];
   if(qm){flags.push("Q");qRows++;qMarks+=qm;totalQuestionRows++;totalQuestionMarks+=qm}
   if(/(?:“[^”]{1,220}”|'[^']{1,140}'|(?:saith|said|says|asked|spoke|replied|answered)\b)/i.test(text))flags.push("V");
   if(/\b(?:but they say|some may say|some one will say|object(?:ed|ion)|against this|one might ask|imagined interlocutor)\b/i.test(text))flags.push("O");
   if(/\b(?:otherwise|as (?:we|was) said above|as before|see above|ubi sup|ibid|it follows|he adds|above mentioned)\b/i.test(text))flags.push("D");
   if(/^\((?:ubi sup|ibid|non occ)/i.test(text))flags.push("R");
   if(/^(?:Pseudo-|Gloss|The Council)/i.test(father))flags.push("C");
   if(text.length>1800)flags.push("L");
   if(text.length<65)flags.push("S");
   if(!t.length){flags.push("U");totalTopicless++}
   if(t.length>7)flags.push("T");
   const row=[p.id,i,father,t,flags,text.length,qm];
   rows.push(row);perRows.push(row);increment(fatherCounts,father);increment(allFathers,father);
   for(const tag of t){
    increment(topicCounts,tag);increment(allTopics,tag);
    if(!topicFathers.has(tag))topicFathers.set(tag,new Set());
    topicFathers.get(tag).add(father);
    if(!topicOrdinals.has(tag))topicOrdinals.set(tag,[]);
    topicOrdinals.get(tag).push(i);
   }
   for(const f of flags){increment(flagCounts,f);increment(allFlags,f)}
   const normalized=text.replace(/^\([^)]{0,140}\)\s*/,"").toLowerCase().replace(/\s+/g," ").replace(/[’‘]/g,"'").trim();
   if(normalized.length>100){
    const digest=createHash("sha256").update(normalized).digest("hex");
    if(!duplicates.has(digest))duplicates.set(digest,{normalized,ids:[]});
    const found=duplicates.get(digest);
    assert.equal(found.normalized,normalized,"Duplicate fingerprint collision");
    found.ids.push(p.id+":"+i);
   }
  }
  const potentialGroups=[...topicFathers.entries()].filter(([,f])=>f.size>=2)
    .map(([tag,f])=>[tag,f.size,topicOrdinals.get(tag)])
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  multiFatherGroupCount+=potentialGroups.length;
  groups.push([p.id,p.verse_keys,perRows.length,new Set(perRows.map(r=>r[2])).size,perRows.filter(r=>r[6]).length,potentialGroups]);
 }
 assert.equal(rows.length,b.fragments,book+" fragments differ from pinned manifest");
 totalFragments+=rows.length;totalMultiFatherGroups+=multiFatherGroupCount;
 const priority=r=>r[4].includes("Q")?300+(r[4].includes("O")?25:0)+(r[4].includes("R")?20:0):r[4].includes("O")?100:r[4].includes("R")?80:r[4].includes("D")?50:r[4].includes("L")?25:0;
 const reviewOrder=rows.map((row,i)=>[i,priority(row)]).sort((a,b)=>b[1]-a[1]||a[0]-b[0]).map(x=>x[0]);
 const reviewBatches300=[];
 for(let k=0;k<reviewOrder.length;k+=300)reviewBatches300.push({batchNumber:reviewBatches300.length+1,rowIndexes:reviewOrder.slice(k,k+300)});
 totalBatches+=reviewBatches300.length;
 const totals={gospel:book,pericopes:pack.pericopes.length,fragments:rows.length,questionPunctuationFragments:qRows,questionPunctuationMarks:qMarks,distinctInheritedFatherLabels:Object.keys(fatherCounts).length,multiFatherLexicalGroups:multiFatherGroupCount,reviewBatches300:reviewBatches300.length};
 const researchFile={
 schema:"ao.catena.first-pass-book.v1",sourceManifest:"data/scripture/catena/manifest.v1.json",
 pinnedProviderCommit:manifest.originCommit,gospel:book,status:"research_only__not_a_patristic_dialogue",
 description:"Every canonical excerpt is indexed by pericope and zero-based segment ordinal, with inherited author label and provisional lexical signals only.",
 rowColumns:["pericopeId","segmentOrdinalZeroBased","inheritedFatherLabel","lexicalTopicCandidates","reviewFlags","sourceCharacterCount","questionMarkCount"],
 flagLegend,totals,fatherCounts,topicCounts,flagCounts,rows,
 pericopeGroups:groups,reviewBatches300
 };
 write(book+"-index.v1.json",researchFile);
 byBook.push(totals);
 console.log("PASS "+book+": "+rows.length+" original excerpts, "+pack.pericopes.length+" passages, "+qRows+" question-punctuation fragments, "+reviewBatches300.length+" review batches");
}
assert.equal(totalFragments,manifest.totalFragments);
assert.equal(totalPericopes,manifest.totalPericopes);
const duplicateGroups=[...duplicates.values()].filter(x=>x.ids.length>1);
const summary={
 schema:"ao.catena.first-pass-summary.v1",date:"2026-10-21",
 sourceManifest:"data/scripture/catena/manifest.v1.json",sourceOriginCommit:manifest.originCommit,
 status:"research_only__requires_human_question_author_answer_alignment",
 totals:{
  expectedFragments:manifest.totalFragments,analyzedFragments:totalFragments,
  expectedPericopes:manifest.totalPericopes,analyzedPericopes:totalPericopes,
  questionPunctuationFragments:totalQuestionRows,questionPunctuationMarks:totalQuestionMarks,
  fragmentsWithoutLexicalTopics:totalTopicless,multiFatherLexicalGroups:totalMultiFatherGroups,
  reviewBatches300:totalBatches,distinctInheritedFatherLabels:Object.keys(allFathers).length,
  normalizedDuplicateGroups:duplicateGroups.length,
  normalizedDuplicateExcerptOccurrences:duplicateGroups.reduce((n,x)=>n+x.ids.length,0)
 },byBook,topInheritedFatherLabels:summarizeTop(allFathers,50),
 topicCounts:allTopics,flagCounts:allFlags,
 duplicatePointers:duplicateGroups.map(x=>x.ids),
 reviewPolicy:[
 "A question mark in an excerpt may belong to Christ, a biblical speaker, an adversary, a reported voice or a Father: no questioner identity is inferred.",
 "Lexical topic overlap among different Father labels identifies review candidates, not proven parallel theological argument or agreement.",
 "Do not rewrite, summarize, paraphrase, or generate Father speech for publication.",
 "If a fragment needs surrounding context, the source text must be inspected beyond its Catena extract before publication.",
 "Review 300 excerpt pointers per batch, prioritize question-punctuation and attribution/context risks, and require human approval.",
 "Father-label counts reflect historical Catena editorial labels; they do not certify critical-edition authorship.",
 "Do not expand with external writings until their missing contribution is established against existing Catena excerpts."
 ]};
write("summary.v1.json",summary);
console.log("FULL CORPUS PASS: "+JSON.stringify(summary.totals));
