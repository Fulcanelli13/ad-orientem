// M59 — 1961 GregoBase CC0 GABC excerpts for explicit, noncanonical
// Advent I Proper melody listening. The original 1,195-score archival import
// remains private research data; ONLY these five source-pinned records ship.
// Source ownership is held by the 1962 Proper, never this demonstration.
// No Gregorian rhythm certification, Mass assignment, choirs or paid sound.
import {compileExsurgeGabcResearchMelody,gabcResearchFingerprint}
  from './reader-schola-exsurge-gabc-melody.js';
import {scheduleGabcMelody} from './reader-schola-gabc-melody.js';
import {PROPER_M60_RESEARCH_SOURCES} from './reader-schola-advent2-4-proper-sources.js';
import {PROPER_M62_RESEARCH_SOURCES} from './reader-schola-christmas-proper-sources.js';
import {PROPER_M63_RESEARCH_SOURCES} from './reader-schola-christmas-dawn-communion-recovery.js';
import {PROPER_M65_RESEARCH_SOURCES} from './reader-schola-jan-epiphany-proper-sources.js';
import {PROPER_M67_RESEARCH_SOURCES} from './reader-schola-holy-family-epiphany2-proper-sources.js';
import {PROPER_M69_RESEARCH_SOURCES} from './reader-schola-prelent-proper-sources.js';

const freeze=Object.freeze;
const SUNG=new Set(['MISSA_CANTATA_SIMPLE','MISSA_CANTATA_INCENSE','SOLEMN']);
// Explicit independent FNV guards (renderer strings) plus archived SHA-256
// witnesses (checked in Node CI). Note counts come from M58's 1961 archive
// comparison, not inferred from the visitor's local programme.
export const PROPER_M59_RESEARCH_SOURCES=freeze(
[
  {
    "selectionId": "ADVENT1_INTROIT",
    "role": "INTROIT",
    "title": "Ad te levavi",
    "scoreId": "GREGOBASE-132",
    "officePart": "in",
    "printed1961Page": "1",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=132",
    "sha256": "0f3ba0e9034d2bca4f82d4644fc6cb38782d9d4e9a157256eae07db14be63e87",
    "sourceFingerprint": "b5f3a142",
    "rendererFingerprint": "cd4da87f",
    "sourceNotes": 171,
    "phraseNoteCounts": [
      116,
      33,
      7,
      15
    ],
    "bivirgaAdapters": [],
    "sourceGabc": "(c4) AD(gd~) te(f) le(gh)vá(h)vi(g.) *(,) á(gjj)ni(h)mam(gh) me(fg)am :(ghggf.0) (;) De(h)us(jj) me(jj/kj)us(jk..) (,) in(fg~) te(g) con(f)fí(fh/ji)do,(i_[oh:h]h_[oh:h]) (,) non(jjj) e(hg)ru(ghfg)bé(ghg___)scam :(g.) (:) ne(j)que(jv.jjj/h_[oh:h]i_[oh:h]h_[oh:h]) ir(h)rí(jkj)de(ih)ant(jjj) me(g.) (,) in(g)i(g)mí(g.h!iwj)ci(j_h) me(h_f)i :(f.) (:) ét(fh)e(hg)nim(g.) u(g)ni(g)vér(g!ihi)si(g.) (,) qui(g) te(g) ex(hji)spé(i/jkj)ctant,(hih.) (;) non(gh~) con(h)fun(hfhg)dén(ghg___)tur.(g.) (::) <i>Ps.</i> Vi(g)as(hg) tu(gj)as,(j) Dó(j)mi(j)ne,(j) de(ji)món(jk)stra(k) mi(jk)hi :(j.) (:) * et(jh~) sé(hj)mi(j)tas(j) tu(j)as(jji) é(gh)do(ji)ce(h) me.(g.) (::) Gló(g)ri(hg)a(gj) Pa(j)tri.(j) (::) <eu>sae(j)cu(jji)ló(gh)rum.(ji) A(h)men.</eu>(ghd___/ffg.) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "ADVENT1_GRADUAL",
    "role": "GRADUAL",
    "title": "Universi",
    "scoreId": "GREGOBASE-1169",
    "officePart": "gr",
    "printed1961Page": "2",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=1169",
    "sha256": "73eb1dc9b3ce179480b0f264bfc4736733215eee04947d1da2058445330edb41",
    "sourceFingerprint": "c84adf7c",
    "rendererFingerprint": "e763c6bd",
    "sourceNotes": 188,
    "phraseNoteCounts": [
      63,
      125
    ],
    "bivirgaAdapters": [
      {
        "from": "jvvH",
        "to": "jv/jvH"
      },
      {
        "from": "hvvGF",
        "to": "hv/hvGF"
      }
    ],
    "sourceGabc": "(f3) U(e)ni(f)vér(fh!ivHF'gvEC.efef)si(f.) *(,) qui(fe) te(h) ex(ij)spé(j)ctant,(j_i/j_i/j_g/h_[oh:h]i_[oh:h]h._[oh:h]) (;) non(i_[oh:h]) con(hg~)fun(ef)dén(hi)tur,(gh/ihivHG') Dó(f)mi(f_[oh:h]g_[oh:h]f_[oh:h])ne.(f.) (,) (kxef!hh//i./jkI'Gh_ihhf.) (f+::c4) <sp>V/</sp>. Vi(dh)as(h) tu(hg)as,(gh) Dó(g_[oh:h]f)mi(g_[uh:l]h)ne,(h.) (,) (fgh!jvjh//fgh!jvjh//jvvH'Gjk//jkJH.1) (,) (ixfgh!jvjh/jjh/!iggf.0) (:) no(hk)tas(k_[hl:1]j) fac([oll:1{0]j_lKJ'[oll:}]/kjjh.) (,) mi(hf/gh/jjh//jjvH'Gh!iwj_i)hi :(jjjvIH'jggf.0) (:) et(fg~) sé(g./hjHG'gf)mi(g)tas(g) tu(hv.fgf//ef'!gvffd/ec)as(c.) *(,) é(ff)do(g_[oh:h]f)ce(f!hgh) me.(hvvGF'EC//d!ewfd.1) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "ADVENT1_ALLELUIA",
    "role": "ALLELUIA",
    "title": "Ostende nobis",
    "scoreId": "GREGOBASE-1115",
    "officePart": "al",
    "printed1961Page": "2",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=1115",
    "sha256": "237505f794c96c2d5d0388f0f606b94881b6dc8e8f050f7e402914beab9b3337",
    "sourceFingerprint": "847c0a58",
    "rendererFingerprint": "fffd08ae",
    "sourceNotes": 183,
    "phraseNoteCounts": [
      37,
      146
    ],
    "bivirgaAdapters": [
      {
        "from": "ivvHF",
        "to": "iv/ivHF"
      },
      {
        "from": "hvvGE",
        "to": "hv/hvGE"
      }
    ],
    "sourceGabc": "(c3) AL(def)le(f_e/f!gwhg)lú(fhh'1h){ia}.(hiHF'fe.) <clear>*(;) <i>ij.</i>(gh//efED.f!gwhhg ehf/gffe.) (::) <sp>V/</sp>. Os(h)tén(hv.gih)de(h) no(hg)bis(g) Dó(gh!ivvHFhfg)mi(hg)ne(g.) (;) mi(g)se(g)ri(gf)cór(hji)di(h)am(gh) tu(f_ehvvGE.gxfgFD.1egF'Efe)am :(e.) (:) et(e) sa(e)lu(e)tá(feh)re(h.) tu(hfh'GE//fhF'D//gxgvFEf.0/[-1.5]hhh/ijHF.1)(,)(g_[oh:h]i_[oh:h]g_[oh:h]ivHG'he.gxf_e/g_[oh:h]e//gvFEfd)um(d.) (;) * da(fd/ef) no(hg/hfh)bis.(ghFE.) (,) (df!hvF'E//d.0f!gwhghvGFg.//egf'gvE'Defe.) (,) (gxhhvF'EfgED.gyhhvF'Ef_gffe.) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "ADVENT1_OFFERTORY",
    "role": "OFFERTORY",
    "title": "Ad te Domine",
    "scoreId": "GREGOBASE-962",
    "officePart": "of",
    "printed1961Page": "3",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=962",
    "sha256": "63af04c751dc1e9d691733cc42477d5bfa3e04f6c9c2937593f6de7e6b68dd65",
    "sourceFingerprint": "1734fcd5",
    "rendererFingerprint": "278df795",
    "sourceNotes": 152,
    "phraseNoteCounts": [
      152
    ],
    "bivirgaAdapters": [],
    "sourceGabc": "(f3) AD(c) te(ef//efefhhh_g) Dó(f)mi(fg!hvGF'g)ne(gf..) (;) * le(f_e/f!gwh)vá(h)vi(gf) á(hhhvF'Ef/hhh)ni(f)mam(fgef) me(f_[oh:h]g_[oh:h]f_[oh:h])am :(f.) (:) De(h)us(h) me(hihh)us,(g_[oh:h]f) (,) in(fe~) te(f) con(fe~)fí(fhG'E)do,(fe..) (;) non(hhi) e(h)ru(high)bé(h_[oh:h]i_[oh:h]h_[oh:h])scam :(h.) (:) ne(hh)que(h_g) ir(hhh)rí(f)de(e!gw!hvGF)ant(fgf) me(f.) (,) in(e)i(g)mí(i_[oh:h]h)ci(h) me(h_fgvFE'f)i :(fe..) (:) ét(fe)e(fgf)nim(fc) (,) u(efe)ni(f)vér(fih~)si(hi) qui(hg) te(f) ex(e)spé(efe)ctant,(c_[oh:h]bc.) (;) non(ef) con(ef)fun(f!gwh/ig/h_g)dén(fg!hvGF'g)tur.(gf..) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "ADVENT1_COMMUNION",
    "role": "COMMUNION",
    "title": "Dominus dabit",
    "scoreId": "GREGOBASE-1036",
    "officePart": "co",
    "printed1961Page": "3",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=1036",
    "sha256": "60cb56748adc371bfc376f4a5e75d1bafae87a112772a85cfb9b2c21223a1ed6",
    "sourceFingerprint": "137ce031",
    "rendererFingerprint": "feebb8dd",
    "sourceNotes": 68,
    "phraseNoteCounts": [
      68
    ],
    "bivirgaAdapters": [],
    "sourceGabc": "(c4) DO(ff)mi(fhg)nus(ghF'EfvE'DCdc..) <clear>*(,) da(ff)bit(ffg) be(fd)ni(f)gni(gh)tá(hj!kvJH)tem :(h.) (:) et(h) ter(ghg)ra(ef) no(ghhg)stra(g.) (;) da(hv.fhghvF'ED)bit(dfddc.) (,) fru(fg)ctum(e_[oh:h][ll:1]d/fgF'Ef) su(d_[oh:h]e_[oh:h]d_[oh:h])um.(d.) (::)",
    "scoreApproved": false
  }
] .map(spec=>freeze({...spec,phraseNoteCounts:freeze(spec.phraseNoteCounts),bivirgaAdapters:freeze(spec.bivirgaAdapters.map(x=>freeze(x)))})));

export const PROPER_M59_POLICY=freeze({
  manuscript:'GRADUALE_ROMANUM_1961',
  example:'FIRST_SUNDAY_OF_ADVENT_2026',
  selection:'EXPLICIT_STUDY_CHOICE_ONLY',
  liturgicalAssignment:false,automaticPlayback:false,
  approvedScores:0,printedNoteheadsIndependentlyCertified:false,
  GregorianRhythmCertified:false,localProgrammeChanged:false,
  noRemoteAudio:true,noPaidServices:true
});
// Add source-pinned Advent, Christmas, January and pre-Lent witnesses without bundling the 1195-score archive.
// Recovered Dawn Communion 1125 is separately source-pinned in M63;
// manual research hearing is not editorial chant certification.
export const PROPER_RESEARCH_SOURCES=freeze([
  ...PROPER_M59_RESEARCH_SOURCES,...PROPER_M60_RESEARCH_SOURCES,
  ...PROPER_M62_RESEARCH_SOURCES,...PROPER_M63_RESEARCH_SOURCES,
  ...PROPER_M65_RESEARCH_SOURCES,...PROPER_M67_RESEARCH_SOURCES,
  ...PROPER_M69_RESEARCH_SOURCES
]);
const byId=new Map(PROPER_RESEARCH_SOURCES.map(spec=>[spec.selectionId,spec]));
export function eligibleProperM59ResearchSource({
  form,mode='LIVE',isRequiem=false,selectionId
}={}){
 return String(mode).toUpperCase()==='LIVE' &&
   SUNG.has(String(form).toUpperCase()) && !isRequiem &&
   byId.has(String(selectionId));
}
export function properM59ResearchScore(selectionId){
 const spec=byId.get(String(selectionId));
 return spec?freeze({
  scoreId:spec.scoreId,role:spec.role,selectionId:spec.selectionId,
  gabc:spec.sourceGabc,scoreApproved:false,
  sourceUrl:spec.sourceUrl,sourceSha256:spec.sha256
 }):null;
}
export function compileProperM59ResearchMelody({
  selectionId,exsurge,source=null
}={}){
 const spec=byId.get(String(selectionId));
 if(!spec)return null;
 const original=source??properM59ResearchScore(selectionId);
 if(original?.scoreApproved!==false||
    original?.scoreId!==spec.scoreId||
    original?.selectionId!==spec.selectionId||
    original?.role!==spec.role||
    typeof original?.gabc!=='string'||
    gabcResearchFingerprint(original.gabc)!==spec.sourceFingerprint)
   return null;
 let adapted=original.gabc;
 if(spec.week){
   // M60/M62/M63/M65/M67/M69: pinned SHA/FNV guards the canonical research input;
   // expand only the two-virga same-pitch Gregorio abbreviation proven
   // parity-preserving in the full 15-score M60 Exsurge source probe.
   const bivirgaMatches=[...adapted.matchAll(/([a-m])vv/g)];
   if(bivirgaMatches.length!==spec.bivirgaCount)return null;
   adapted=adapted.replace(/([a-m])vv/g,(_,pitch)=>pitch+'v/'+pitch+'v');
 }else{
   // M59 keeps its independent per-token exact transformations unchanged.
   for(const {from,to} of spec.bivirgaAdapters){
     if(adapted.split(from).length-1!==1)return null;
     adapted=adapted.replace(from,to);
   }
 }
 const renderGabc='name:'+spec.title+';\noffice-part:'+spec.officePart+';\n%%\n'+adapted;
 if(gabcResearchFingerprint(renderGabc)!==spec.rendererFingerprint)
   return null;
 try{
   const melody=compileExsurgeGabcResearchMelody(renderGabc,{
     exsurge,scoreId:spec.scoreId,
     expectedFingerprint:spec.rendererFingerprint,
     expectedPhraseNoteCounts:[...spec.phraseNoteCounts],
     phraseSequence:spec.phraseNoteCounts.map((_,i)=>i)
   });
   if(melody.sourceNoteCount!==spec.sourceNotes ||
      melody.performance.length!==spec.sourceNotes||
      melody.phraseCount!==spec.phraseNoteCounts.length)
     return null;
   const timing=scheduleGabcMelody(melody);
   if(timing.events.length!==spec.sourceNotes||
      timing.certifiedGregorianTiming!==false)return null;
   return freeze({
      source:spec,melody,timing,sourceNotes:spec.sourceNotes,
      renderScore:freeze({scoreId:spec.scoreId,
        gabc:renderGabc,canonicalGabc:original.gabc,scoreApproved:false,
        researchOnly:true,sourceUrl:spec.sourceUrl}),
      approved:false,certified:false
   });
 }catch{return null;}
}
