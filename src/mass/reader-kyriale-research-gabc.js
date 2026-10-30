// Exact source-preserving seven Gregorian Ordinary research transcriptions.
// Reused from draft #1749; no claim of note-for-note facsimile approval,
// permission to publish the full source edition, or observed local singing.
import {ORDINARY_1961_SCORE_SOURCES} from "./reader-ordinary-scores-1961.js";
import {kyrialeResearchNotationPreview} from "./reader-kyriale-catalogue.js";
const KYRIE_XVI_GABC=`name:Kyrie XVI;
office-part:Kyriale;
mode:3;
book:Graduale Romanum, 1961, p. 54* & The Liber Usualis, 1961, p. 59 & Chants of the Church, 1956, p. 40;
transcriber:Andrew Hinkley;
commentary:XI-XIII. s.;
%%
(c4) KY(g)ri(hi)e(ii) *() e(g)lé(h_)i(i)son.(i.) <i>iij.</i>(::)
Chri(k)ste(ij) e(h)lé(h_)i(i)son.(i.) <i>iij.</i>(::)
Ký(g)ri(hi)e(ii) e(g)lé(h_)i(i)son.(i.) <i>ij.</i>(::)
Ký(g)ri(hi)e(ii) *() e(g)lé(hj)i(h)son.(ighvGFE.) (::)`;

const KYRIE_XI_GABC=`name:Kyrie XI;
office-part:Kyriale;
mode:1;
book:Graduale Romanum, 1961, p. 38* & The Liber Usualis, 1961, p. 46 & Chants of the Church, 1956, p. 30;
transcriber:Andrew Hinkley;
%%
(c4) KY(ixhi)ri(hg)e(hd..) *(,) e(ixfgh!ivHGfvED)lé(c')i(d)son.(d.) <i>iij.</i>(::)
Chri(hg)ste(kv.jkJH'Gh.) (,) e(ixfgh!ivHGfvED)lé(c')i(d)son.(d.) <i>iij.</i>(::)
Ký(ixhi)ri(hg)e(hd..) (,) e(ixfgh!ivHGfvED)lé(c')i(d)son.(d.) <i>ij.</i>(::)
Ký(dfd)ri(cd)e(d.gv.fgFD'Cd.) <clear>*(,) e(ixfgh!ivHGfvED)lé(c')i(d)son.(d.) (::)`;
const KYRIE_VIII_GABC=`name:Kyrie VIII;
office-part:Kyriale;
mode:5;
book:Graduale Romanum, 1961, p. 28* & The Liber Usualis, 1961, p. 37 & Chants of the Church, 1956, p. 19;
transcriber:Andrew Hinkley;
commentary:XV-XVI. s.;
%%
(c3) KY(d)ri(gxfgh)e(h.ivHGh.) *~{~}(/[-2]kvIH'Ghih.) (,) e(gxhvFE'Dgf)lé(e')i(e)son.(d.) <i>iij.</i>(::)
Chri(f)ste(fvED'Cd.gxd!fg!hv.ivHGh.) (,) e(gxhvFE'Dgf)lé(e')i(e)son.(d.) <i>iij.</i>(::)
Ký(k')ri(j)e(kvJI'jkh.1gxkhiv./[-0.5]fg!hv.) (,) e(gxhvFE'Dgf)lé(e')i(e)son.(d.) <i>ij.</i>(::)
Ký(k')ri(j)e(kvJI'jkh.1) <clear>*(,) (kjkvJI'jkh.1gxkhiv./[-0.5]fg!hv.) <clear>**(,) e(gxhvFE'Dgf)lé(e')i(e)son.(d.) (::)`;

const SCORE_GABC=new Map([
 ["GREGOBASE-545",KYRIE_XVI_GABC],
 ["GREGOBASE-2982",KYRIE_XI_GABC],
 ["GREGOBASE-1184",KYRIE_VIII_GABC],
 ...ORDINARY_1961_SCORE_SOURCES.map(item=>[item.id,item.gabc])
]);
export function offlineKyrialeResearchScore(movement,catalogueId){
 const lead=kyrialeResearchNotationPreview(movement,catalogueId);
 const gabc=lead?SCORE_GABC.get(lead.scoreId):null;
 return lead&&typeof gabc==="string"&&gabc.includes("%%")
   ?Object.freeze({...lead,gabc}):null;
}
export const OFFLINE_KYRIALE_RESEARCH_SCORE_COUNT=SCORE_GABC.size;
