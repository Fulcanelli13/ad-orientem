// M67 — nine opt-in Gregorian Proper research listening sources for the 2027
// Holy Family and Second Sunday after Epiphany. Based on pinned, CI-verified M66.
// MANDATORY HOLD: Holy Family Introit (GREGOBASE-336, Exsultet [1961]
// versus Exsultat [1962]) is NOT shipped as playable source until editorial
// resolution. No automatic Mass assignment, no 1962 text alteration, no
// approved digital notation or certified Gregorian rhythm. Offline Exsurge only.
const freeze=Object.freeze;
export const M67_HOLY_FAMILY_INTROIT_HOLD=freeze({
 selectionId:'HOLY_FAMILY_INTROIT',scoreId:'GREGOBASE-336',
 printed1961Opening:'Exsultet gaudio',
 printed1962Opening:'Exsultat gaudio',
 noResearchAudioUntilEditorialResolution:true
});
export const PROPER_M67_RESEARCH_SOURCES=freeze(
[
  {
    "selectionId": "HOLY_FAMILY_GRADUAL",
    "week": "HOLY_FAMILY",
    "role": "GRADUAL",
    "title": "Unam petii... Beati",
    "scoreId": "GREGOBASE-260",
    "officePart": "gr",
    "printed1961Page": "60",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=260",
    "sha256": "68c556e17ac379fd375087e16ffd574a549d4e3c105e38ddb871abf8766f1231",
    "sourceFingerprint": "7f89296c",
    "rendererFingerprint": "4bbda557",
    "sourceNotes": 198,
    "phraseNoteCounts": [
      95,
      103
    ],
    "bivirgaCount": 0,
    "sourceGabc": "(c4) U(ffg)nam(f) pé(ghgh)ti(g)i(fgFD.1) (,) * a(d) Dó(dgf/gh)mi(g)no,(ixg./hiGF'fd/f_[oh:h]g_[oh:h]f._[oh:h]) (;) hanc(hj~) re(j_h)quí(jhjjh)ram :(h.) (:) ut(h) in(hj)há(j)bi(ixij!kvJ'IH'i)tem(ih..) (,) in(ixi) do(hhg)mo(gh) Dó(hg/hf/g_[oh:h]f)mi(ef)ni(f.) (;) ó(h)mni(g)bus(h) di(ixi)é(gf)bus(g.) (,) vi(gh)tae(f) me(fgf)ae.(ixf./hiHF.1hg/hjhh/fgf.) (z0::c3) \r\n<sp>V/</sp>. Be(d)á(df!hh/ijh)ti(h.) (,) qui(h) há(hi)bi(h)tant(h) in(h) do(h)mo(h) tu(h)a,(h_g) (,) Dó(i!jwk)mi(ih)ne :(hg/i_[oh:h]h//jvIH'Ghf..) (:) in(hh) saé(h)cu(h)la(h) sae(h)cu(h)ló(ih/ij_h)(,)(ih/ij_ij//hi/jij)rum(jh/jkihh/fgf.) (:) * lau(de'f)dá(fhGF')bunt(i) te.(hhf.) (,) (gxg_[oh:h]fgvED.fgED.fehv.hhhff//dfe/fee[ll:1]d.0) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "HOLY_FAMILY_ALLELUIA",
    "week": "HOLY_FAMILY",
    "role": "ALLELUIA",
    "title": "Vere tu es",
    "scoreId": "GREGOBASE-816",
    "officePart": "al",
    "printed1961Page": "61",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=816",
    "sha256": "209cd78262361cbc1b0ddeaebe5c20ce2666122c1346e04ecf55ef0e90759968",
    "sourceFingerprint": "2caac894",
    "rendererFingerprint": "4ed386c3",
    "sourceNotes": 135,
    "phraseNoteCounts": [
      41,
      94
    ],
    "bivirgaCount": 2,
    "sourceGabc": "(c4) AL(gh)le(fvEDef/gf/hg)lú(fg~){ia}.(g.) *~(;) <i>ij.</i>(hgjvvIH'kvJH'hg.) (,) (hvGF'EDgv.fg!hvhgjvIH'hg.) (::) <sp>V/</sp>. Ve(gh)re(fvED) tu(ef/gfhvGF'g) es(g.) (;) Rex(hji) abs(j)cón(h!iwj'!kvJH'hg//hjghvGFhv.g.h!iwji)di(hg)tus,(g.) (:) De(gj)us(jvIH) Is(hkkj)ra(hg)el(g.) <clear>*(,) ~Sal(gh)vá(fvEDef/gfhvGF'g)tor.(g.) (;) (hgjvvIH'kvJH'hg.) (,) (hvGF'EDgv.fg!hvhgjvIH'hg.) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "HOLY_FAMILY_OFFERTORY",
    "week": "HOLY_FAMILY",
    "role": "OFFERTORY",
    "title": "Tulerunt Jesum",
    "scoreId": "GREGOBASE-93",
    "officePart": "of",
    "printed1961Page": "63",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=93",
    "sha256": "f10e0d3860b97506f4799d7e1aca8aa0817c0229972012466aedd8e2351f0170",
    "sourceFingerprint": "6eda0964",
    "rendererFingerprint": "9ff2b327",
    "sourceNotes": 102,
    "phraseNoteCounts": [
      102
    ],
    "bivirgaCount": 0,
    "sourceGabc": "(c4) TU(cd'f)lé(f)runt(ef'g) *() Je(dgF'EghG'FgvFE)sum(f.) (;) pa(f)rén(fgf/gff'fd~)tes(dgF'E) e(hgh_fhggd~)jus(dgF'EfgFD.1) (;) in(df/gef) Je(f)rú(f/[1]{/[-1]ix}f/hih/ih)sa(hg)lem,(gh/igh.) (:) ut(ef) sí(ghhg)ste(gf)rent(fg!hvhg) e(dgF'E)um(e.) (,) Dó(eg!hvGFghg)mi(e)no.(egf/gffe.) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "HOLY_FAMILY_COMMUNION",
    "week": "HOLY_FAMILY",
    "role": "COMMUNION",
    "title": "Descendit Jesus (Comm.)",
    "scoreId": "GREGOBASE-626",
    "officePart": "co",
    "printed1961Page": "63",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=626",
    "sha256": "feba832d5a594fdfae66606df1a15e076a81938f2f1e59d09e2f0af18f729f38",
    "sourceFingerprint": "fad6ac61",
    "rendererFingerprint": "40b03491",
    "sourceNotes": 66,
    "phraseNoteCounts": [
      66
    ],
    "bivirgaCount": 1,
    "sourceGabc": "(c4) DE(fg)scén(gff)dit(de) Je(cd)sus(d.) (,) * cum(f) e(ghgh)is,(gv.fgFD.1) (;) et(d) ve(f_eg)nit(gh) Ná(hj)za(hg)reth,(gv.fhGE.) (:) et(ghg) e(hv.fh!jvvH'GE'f)rat(f.) (,) súb(f_dfvECfhg___)di(h)tus(ghF'Ef) il(d_[oh:h]e_[oh:h]d_[oh:h])lis.(d.) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "EPIPHANY2_INTROIT",
    "week": "EPIPHANY2",
    "role": "INTROIT",
    "title": "Omnis terra",
    "scoreId": "GREGOBASE-13",
    "officePart": "in",
    "printed1961Page": "67",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=13",
    "sha256": "0a0f32831c239db5d1d9daf444d31f3ce21b87758df0f1b4867f032eabe5018e",
    "sourceFingerprint": "5fd40112",
    "rendererFingerprint": "14be248e",
    "sourceNotes": 143,
    "phraseNoteCounts": [
      90,
      38,
      7,
      8
    ],
    "bivirgaCount": 0,
    "sourceGabc": "(c4) O(fff)mnis(dfe') ter(e!g'h~)ra(h.) *(,) ad(gh)ó(hjjg)ret(hgff/ded.) te,(e.f!gwh) De(ghffef)us,(fe..) (;) et(fff) psal(e.f!gwh)lat(h_g) ti(gef)bi :(e[ll:1]d..) (:) psal(fv.fff)mum(dfe') di(ef'h)cat(h.) (,) nó(hg/h!jj)mi(hjg)ni(h_g) tu(ixef!hig)o,(g.) (,) Al(fff)tís(ef'g)si(fhG'FgvFE)me.(e.) (::) <i>Ps.</i> Ju(hg)bi(gh)lá(h)te(h) De(h)o(hg) o(gi)mnis(i) ter(hi)ra,(h.) (:) * psal(hg~)mum(gh) dí(h)ci(h)te(h) nó(h)mi(h)ni(h) e(h)jus :(h.) (,) da(h)te(h) gló(h)ri(h)am(h) lau(gf~)di(gh) e(g)jus.(e.) (::) Gló(hg)ri(gh)a(h) Pa(h)tri.(h) (::) <eu>E(h) u(h) o(gf) u(gh) a(g) e.</eu>(e.) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "EPIPHANY2_GRADUAL",
    "week": "EPIPHANY2",
    "role": "GRADUAL",
    "title": "Misit Dominus",
    "scoreId": "GREGOBASE-932",
    "officePart": "gr",
    "printed1961Page": "68",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=932",
    "sha256": "542f0dcbf498a672579c60bfcd9df10abe80881641702a8ad7ab76c3a9d1bc49",
    "sourceFingerprint": "5285c8c2",
    "rendererFingerprint": "69de7d77",
    "sourceNotes": 311,
    "phraseNoteCounts": [
      123,
      188
    ],
    "bivirgaCount": 0,
    "sourceGabc": "(c3) MI(dd)sit(ef~) Dó(f_devDC[ull:0]B.e_[oh:h]c/de)mi(d)nus(d.) *(;) ver(fd/ef!hh/ihi)bum(hgh) su(f_e/f!hhvFD.1fvEDe[ll:1]d)um,(d.) (:) et(fe~) sa(eh)ná(h)vit(gxhfgED.) (`) e(fdfED//fd/ef!hh/ig/hf/hi!kkk_[hl:1]h)os :(h.) (:) et(f) e(h)rí(hi)pu(h)it(hh) e(hh//hhjvIG'hvF'Ef!hhivHG)os(h.) (;) de(h) in(h)tér(h)i(h_g)tu(e) e(f)ó(hiH'F)rum.(de//fiH'GE.) (,) (gxfhF'E//fgED.) (::) \r\n<sp>V/</sp>. Con(d)fi(d)te(f)án(hf/hhf/hhf/hhh)(,)(f!hhf/hhf/hhh//ih/!hf/hhf/hhh)tur(h.) (,) Dó(h)mi(h)no(ih//h'hh_f//hhf/hhe//gxfgED./[-0.5]hhjvIH.) (:) mi(d)se(d)ri(fe)cór(eh)di(h)ae(ih) (,) (hhh'/ihhg./[-0.5]i/jiih.0/[-0.5]j/kjjh.0/[-0.5]i/jiig./h/ihh//fh//ghFE'e[ll:1]d.0) (;) e(fdfED//f_d/ef!gwh'!iv)jus :(hg/ijIH.ghGF.) (:) et(f) mi(hfh)ra(h)bí(i)li(hi)a(hh) (,) e(hh//hhjvIG'hvF'Ef!hhivHG)jus(h.) (;) fí(hh)li(hih)is(h_f) *() hó(fh!ij)mi(hg)num.(hhhf/hhhf/hhf.) (,) (de/f!hh/ijghf.0gxegFD.1) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "EPIPHANY2_ALLELUIA",
    "week": "EPIPHANY2",
    "role": "ALLELUIA",
    "title": "Laudate Deum",
    "scoreId": "GREGOBASE-538",
    "officePart": "al",
    "printed1961Page": "68",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=538",
    "sha256": "54da6662f8bb2e9d2a8983e82189b2c01abc12957f2372625583caf0a761a638",
    "sourceFingerprint": "2e9b9231",
    "rendererFingerprint": "d527787e",
    "sourceNotes": 140,
    "phraseNoteCounts": [
      30,
      110
    ],
    "bivirgaCount": 0,
    "sourceGabc": "(c4) AL(fd~)le(ef'g)lú(hgh){ia}.(ixhiHG'gf.0) <clear>*(,) <i>ij.</i>(ixhiHG'ge./ghGF'Ef_gffe.) (::) \r\n<sp>V/</sp>. Lau(h)dá(h)te(g) De(ghG'E)um(fgfg.) (;) o(g)mnes(gh) An(h_g~)ge(ghg'/hf)li(e[ll:1]d) e(egF'~D~)jus :(d.) (:) lau(dc~)dá(f)te(ghg) e(ixhiG'Eg./hiF'D//fffdgvFE.)(,)(df/h_f/g_[oh:h]efv.df!gvFE'f)um(fe..) (;) o(fd~)mnes(f) vir(f)tú(ef/g_[oh:h]efv.df!gvFE'f)tes(fe..) *(;) e(fd/ef!g'h)jus.(ixhiHG'gf.0) (,) (ixhiHG'ge./ghGF'Ef_gffe.) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "EPIPHANY2_OFFERTORY",
    "week": "EPIPHANY2",
    "role": "OFFERTORY",
    "title": "Jubilate Deo universa",
    "scoreId": "GREGOBASE-937",
    "officePart": "of",
    "printed1961Page": "69",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=937",
    "sha256": "39ba4e97f576629193d9e12b9de57d57c72bd884f5c2c064a6c436cc0158561a",
    "sourceFingerprint": "083fa56c",
    "rendererFingerprint": "4592fb1d",
    "sourceNotes": 324,
    "phraseNoteCounts": [
      324
    ],
    "bivirgaCount": 0,
    "sourceGabc": "(c4) JU(c)bi(d)lá(ixdh'!iv)te(h) *() De(hjh)o(ghggf.0) (;) u(ghg)ni(hg)vér(hv.g!jjj)sa(fg) ter(ixfh!jvHGig/hi)ra :(h.) (:) ju(h)bi(h)lá(jhjGF'fvD'C)(,)(ddc/dd//cd!ff//g/hhg/hh)(,)(fg/hhh//gh!jjj//ij/kkj)(,)([oll:1;7.4mm]lk/lmK[oll:0]J'jvIH'k)te(kjjvIH) De(hjh)o(ghggf.0) (;) u(ghg)ni(hg)vér(hv.g!jjj)sa(fg) ter(fh!jvHGig/h!jjh)(,)(jjvH'Gh!iwj_i)ra :(jjjvIH'jggf.0) (:) psal(fh)mum(hg~) dí(h_g/jjj)ci(h_g)te(ghGF.) (,) nó(fg/h_f/ghg___//jkj)mi(jjji)ni(hg) e(gv.fhhghv.gh!jjjh~)jus :(hhgh.) (:) ve(jk)ní(klkl)te,(j_h) (,) et(h_g) au(gh)dí(hj/kjk)te,(k_[hl:1]h_[hl:1]) (,) et(jk[oll:1{1]/lkl[oll:}]) nar(j_h)rá(hj)bo(jjj) vo(hhg)bis,(g_[oh:h]fg.) (;) o(fg/h_f//ghg___//jkj//j'j)mnes(hjG'Fg.) (,) qui(f) ti(ghg)mé(h_fg)tis(fgd) De(fhg___)um,(g.) (:) quan(hj)ta(jji) fe(jvIH)cit(h_g) Dó(g_[oh:h]e)mi(fgffg)nus(gd..) (;) á(df/gfgf//f'ffd/g_[oh:h]ef.)(,)(hjg)ni(fdf)mae(f) me(fffgvFD)ae,(d.) (:) al(fg~)le(e_[oh:h][ll:1]d/fh//ghgefghfgvFE)lú(d!ewfef){ia}.(e[ll:1]d..) (::)",
    "scoreApproved": false
  },
  {
    "selectionId": "EPIPHANY2_COMMUNION",
    "week": "EPIPHANY2",
    "role": "COMMUNION",
    "title": "Dicit Dominus",
    "scoreId": "GREGOBASE-230",
    "officePart": "co",
    "printed1961Page": "70",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=230",
    "sha256": "959b3ec8174e5d4e9d2289da15fae2536ca72e6559dccf9b566be89fca85f6a2",
    "sourceFingerprint": "fbb8bdb3",
    "rendererFingerprint": "a980d122",
    "sourceNotes": 143,
    "phraseNoteCounts": [
      143
    ],
    "bivirgaCount": 0,
    "sourceGabc": "(c4) DI(fh)cit(h) Dó(ixhiHG')mi(hggfg)nus :(fg..) *(;) ~Im(df~)plé(f)te(df) hý(f)dri(fff)as(df) a(ff/g_[oh:h]f)qua(f.) (;) et(f) fer(gh~)te(h) ar(hg~)chi(h)tri(h!iwj)clí(ghGF'g)no.(gf..) (:) Cum(f) gu(ghg)stás(h!jij)set(ixhhi) ar(gh~)chi(f)tri(ghgh)clí(ghGF'g)nus(gf..) (;) a(h)quam(ghg) vi(hg)num(fg) fa(ghg___)ctam,(g.) (;) di(ixii//g!i'j)cit(ih~) spon(fgf~)so :(f.) (:) Ser(hg~)vá(jlk)sti(j) vi(jlk)num(j) bo(i.h!iwj)num(h_g) (,) us(gh!jlk)que(j) ad(hj)huc.(jg..) (:) Hoc(j) si(j)gnum(i) fe(h)cit(g) Je(g)sus(fh) pri(fg)mum(g.) (,) co(h)ram(i) di(j)scí(i_[oh:h]h)pu(gf)lis(gh) su(f.)is.(f.) (::)",
    "scoreApproved": false
  }
].map(spec=>freeze({...spec,phraseNoteCounts:freeze([...spec.phraseNoteCounts])})));
