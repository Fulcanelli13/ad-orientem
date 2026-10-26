// Source-backed Gregorian Proper exemplar for the *resolved* Christmas Day
// Mass (in die), Graduale Romanum 1961 pp. 33–35. These GABC witnesses are
// GregoBase CC0 transcriptions; never derive an assigned score from date alone.
// Each entry needs BOTH an exact Latin incipit and the canonical Proper slot.
const CHANTS=Object.freeze([
{trackId:"INTROIT",id:"GREGOBASE-72",title:"Puer natus est",incipit:"puer natus est nobis",mode:7,folio:"33",liber:"408",gabc:String.raw`name:Puer natus est;
office-part:Introitus;
mode:7;
book:Graduale Romanum, 1961, p. 33 & The Liber Usualis, 1961, p. 408;
transcriber:Andrew Hinkley;
%%
(c3) PU(ei)ER(i.) *() na(iji)tus(h) est(hhh) no(ih/ji)bis,(i.) (;) et(ei~) fí(iji)li(hg)us(f) da(hhi)tus(h) est(h) no(hihh)bis :(efe.) (:) cu(e)jus(f) im(h)pé(gi!jk)ri(ih)um(h.) (,) su(h)per(h) hú(ih/ji)me(h_g)rum(hhh) e(h_f//hghvG~F~)jus :(gf..) (:) et(hg) vo(h)cá(hji)bi(h)tur(hhh) no(h)men(hhh) e(highvG~F~)jus,(gf..) (;) ma(hj)gni(i) con(eh~)sí(h)li(hhh_f)i(f) An(fhf___!gwh)ge(efe___)lus.(e.) (::) <i>Ps.</i> Can(ehg)tá(hi)te(i) Dó(i)mi(i)no(i) cán(ik)ti(j)cum(j) no(ji)vum :(ij..) *(:) qui(ig)a(hi) mi(i)ra(i)bí(i!jwk)li(i')a(h) fe(hhh)cit.(fe..) (::) Gló(ehg)ri(hi)a(i) Pa(i)tri.(i) (::) <eu>E(i) u(i!jwk) o(i') u(h) a(hhh) e.</eu>(fe..) (::)`},
{trackId:"GRADUAL",id:"GREGOBASE-1163",title:"Viderunt omnes · Graduale",incipit:"viderunt omnes fines terrae",mode:5,folio:"33",liber:"409",gabc:String.raw`name:Viderunt omnes;
office-part:Graduale;
mode:5;
book:Graduale Romanum, 1961, p. 33 & The Liber Usualis, 1961, p. 409 & Graduale Romanum, 1974, p. 48 & Gregorian Missal, 1990, p. 199;
transcriber:Andrew Hinkley;
%%
(c3) VI(d)dé(d)runt(fh~) o(hiH'F//hhhjvIH)mnes(h.) *(,) fi(hi)nes(h_f) ter(hfhhf)rae(f/hhf/hg/hf..) (;) sa(f)lu(hg)tá(h_gi)re(ivHGh_f) (,) De(f_e/f!gwh/i_[oh:h]h)i(hg/ijk) no(i_[oh:h]h)stri :(hg/hf..) (:) ju(f)bi(hg)lá(h)te(hhh) De(fhee[ll:1]d)o(de!fhFD.1) (;) o(d!f'h/ijh)mnis(gxh.f!gw!hvGE'fw!gvFE) ter(ded)ra.(d!f'h//d!f'hhv'1GE//dfe/fee[ll:1]d.0) (::)
<sp>V/</sp>. No(d)tum(fe~) fe(eh)cit(hi~) Dó(ihhf/hiHG.hiFD.1)(,)(f/hhi/hhf/hiHG.hiFD.1)(,)(gxfg//e!g'h/ghghvFD.1)(,)(fdfED//fd/ef!hh/i!jwk)mi(ih)nus(hiHF.1) (;) sa(f)lu(hg)tá(hhf/hhf)re(f) su(fhf/hhf)um :(f.) (:) an(f)te(f) con(fi~)spé(i)ctum(hiH'F) gén(h.i!jwk)ti(ih)um(hiHF.1) (;) re(f!h'i/hhf)ve(f)lá(hfhhe/fd)vit(d.) *(,) ju(f)stí(f/hhfg)ti(ef)am(gxhf/ge) su(d)am.(cd/efe.) (,) (de!fhFE.gxde'f!hhe'gvFD.1) (::)`},
{trackId:"ALLELUIA_TRACT_SEQUENCE",id:"GREGOBASE-324",title:"Dies sanctificatus · Alleluia",incipit:"dies sanctificatus illuxit nobis",mode:2,folio:"34",liber:"409",gabc:String.raw`name:Dies sanctificatus;
office-part:Alleluia;
mode:2;
book:Graduale Romanum, 1961, p. 34 & The Liber Usualis, 1961, p. 409 & Graduale Romanum, 1974, p. 49 & Gregorian Missal, 1990, p. 200;
transcriber:Andrew Hinkley;
%%
(f3) AL(e)le(f)lú(hi~){ia}.(i_[oh:h]h/iggf.0) <clear>*(,) <i>ij.</i>(hv.iji./[-0.5]ef/h_f//hv.ghe/hhh.f!gwhf.1) (::) <sp>V/</sp>.
Di(f_e/f!gwh'!iv//jiihi)es(iv.hh/fgf.) san(fg~)cti(f)fi(f)cá(fg)tus(f.) (,) il(f)lú(fg)xit(f) no(f!hh/ijHF'ivH'GEf./hfhhf/ge)bis :(e.) (:) ve(ffe/ffe/fc..)(,)(ef!hvvF'Ehhh)ní(hi)te(h) gen(hi~)tes,(h.) (,) et(h) ad(h)o(h)rá(h)te(ivH'Gh') Dó(f)mi(f_[oh:h]g_[oh:h]f_[oh:h])num :(f.) (:) qui(f)a(f) hó(f!h'i)di(jiihi)e(iv.hh/fgf.) (,) de(f)scén(fg~)dit(f) lux(f) ma(f!hh/ijHF'ivH'GEf./hfhhf/ge)gna(e.) (;) * su(hh)per(hi~) ter(i_[oh:h]h/jij)ram.(jvvIH'GE//f!gwhf.1) (::)`},
{trackId:"OFFERTORY",id:"GREGOBASE-1274",title:"Tui sunt caeli",incipit:"tui sunt caeli",mode:4,folio:"35",liber:"410",gabc:String.raw`name:Tui sunt caeli;
office-part:Offertorium;
mode:4;
book:Graduale Romanum, 1961, p. 35 & The Liber Usualis, 1961, p. 410;
transcriber:Andrew Hinkley;
%%
(c4) TU(f)I(ded) sunt(f) *() cae(e/fgF'EfvED)li,(fd/efe.) (;) et(fd~) tu(dfe)a(f) est(g_[oh:h]efvEDgvFE) ter(hvGFgvFE)ra :(e.) (:) or(d!g'h)bem(g) ter(fgffe)rá(egffe)rum,(fff) (;) et(dec) ple(dfe)ni(e)tú(e!gfg)di(d)nem(d.) (,) e(ff/gd/fffd/fffv_E~D~)jus(e[ll:1]d..) (,) tu(f!h'j) fun(gh)dá(egff)sti :(fe..) (:) ju(hg)stí(h_ghvGE//f!gwhgh//f!gwhgh)ti(f)a(eef.) (,) et(f.d!ewf) ju(f)dí(fffhvGF'D//gvFE'D)ci(d!ewf_d)um(d.) (;) prae(d)pa(ef)rá(gh)ti(g)o(ghGF.efED.) (,) se(fv.fffdgvFE)dis(g_[oh:h]f/hggf/ghg) tu(egff)ae.(fe..) (::)`},
{trackId:"COMMUNION",id:"GREGOBASE-1139",title:"Viderunt omnes · Communio",incipit:"viderunt omnes fines terrae",mode:1,folio:"35",liber:"410",gabc:String.raw`name:Viderunt omnes;
office-part:Communio;
mode:1;
book:Graduale Romanum, 1961, p. 35 & The Liber Usualis, 1961, p. 410;
transcriber:Andrew Hinkley;
%%
(c4) VI(fg)dé(gff)runt(de~) o(cd~)mnes(d.) *(,) fi(d!f'g)nes(gh) ter(hjjg)rae(g_[oh:h]fhvGE.) (;) sa(f)lu(ghg)tá(hv.fh!jvvH'GE'f)re(f.) (,) De(f_dfvECfhg___)i(ghF'Ef) no(d_[oh:h]e_[oh:h]d_[oh:h])stri.(d.) (::)`},
]);
export const CHRISTMAS_DAY_PROPER_SCORES_1961=Object.freeze(CHANTS.map(row=>Object.freeze({
  ...row,status:"SOURCE_MATCH_REQUIRED_NOT_DATE_ASSIGNED",version:"Solesmes",
  provenance:"GREGOBASE_CC0_TRANSCRIPTION",transcriptionAuthor:"Andrew Hinkley",
  bookWitnesses:Object.freeze([
    "Graduale Romanum (Solesmes, 1961), p. "+row.folio,
    "Liber Usualis (Solesmes, 1961), p. "+row.liber,
  ]),
  sourceUrl:"https://gregobase.selapa.net/chant.php?id="+row.id.slice(10),
  gabcUrl:"https://gregobase.selapa.net/download.php?elem=1&format=gabc&id="+row.id.slice(10),
})));
