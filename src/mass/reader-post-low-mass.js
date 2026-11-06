// Post-Mass devotion alongside (not inside) the source-owned 65-card Order
// of Mass. Uses the existing certified Prayer corpus, never a second transcription.
import { PRAY_CANONICAL_DATA_V435930 } from "../pray/canonical-data.js";
import { leonineSourceSections } from "../pray/horarium-leonine-source-blocks.js";

export const ICKSP_LOW_MASS_BOOKLET="https://icksp.org.uk/newbrighton/wp-content/uploads/sites/2/2022/04/Mass_Booklet-B.pdf#page=54";
const BLOCK_COUNT=5;

export const POST_LOW_MASS_LEONINE_CSS=`
.ao-post-low-mass{margin:2.5rem 0 1rem;padding:1.25rem 1rem;border-top:1px solid var(--ao-mass-accent,#9a835c);font-family:var(--ao-missal-face,Georgia,serif);color:var(--ao-text,#e9e3d8)}
.ao-post-low-mass>h2{font-size:1.35rem;line-height:1.25;margin:0 0 .5rem;color:inherit}
.ao-post-low-mass>p{font-size:.95rem;line-height:1.55;margin:.45rem 0 1.15rem}
.ao-post-low-mass-prayer{margin:1.3rem 0 1.7rem}
.ao-post-low-mass-prayer h3{font-size:1.08rem;margin:0 0 .65rem}
.ao-post-low-mass-prayer [lang=la]{font-size:1.06rem;line-height:1.7}
.ao-post-low-mass-prayer [lang=en],.ao-post-low-mass-prayer [lang=fr]{font-size:.96rem;line-height:1.6;opacity:.82}
.ao-post-low-mass-prayer p{white-space:pre-wrap;margin:.55rem 0}
.ao-post-low-mass-prayer .ao-post-low-mass-translation{padding-top:.5rem;margin-top:.8rem;border-top:1px solid color-mix(in srgb,currentColor 20%,transparent)}
.ao-post-low-mass-source{font-size:.8rem;line-height:1.5;display:block;color:inherit}
.ao-post-low-mass-source a{color:inherit;text-decoration:underline;text-underline-offset:3px}
`;

export function postLowMassLeonineEligible(prepared,current,mode="LIVE"){
 const mass=prepared?.session?.resolvedMass;
 const plan=prepared?.session?.plan;
 if(String(mass?.form??"").toUpperCase()!=="LOW"||plan?.kind!=="MASS")return false;
 // A connected post-Mass function (e.g. funeral absolution or
 // Benediction) takes precedence; no Leonine panel may interrupt it.
 if((plan.followingGraphs??[]).length||(mass.followingActions??[]).length)return false;
 // Funeral and Nuptial Low Masses *may omit* these prayers under the
 // historical rules, but that is not a ban on the devotion. Keep the texts
 // accessible as OPTIONAL after any ordinary Low Mass without another
 // immediately-following rite. Do not confuse permission with obligation.
 // Card transitions carry cardTitle; cue-only state refreshes carry sectionTitle.
 // Both identify the same source-owned final Gospel. Never remove the
 // post-Mass devotion solely because the ribbon was refreshed.
 const title=String(current?.cardTitle||current?.sectionTitle||"");
 return String(mode).toUpperCase()==="MISSAL"
  ? /\bLast Gospel\b/i.test(title)
  : /Last Gospel\s*[·–—-]\s*The Word Made Flesh/i.test(title);
}

export function postLowMassLeonineSections(language="en"){
 const prayer=PRAY_CANONICAL_DATA_V435930.prayers?.mass_devotion_leonine;
 if(!prayer)throw new Error("Existing Leonine source prayer unavailable");
 const translated=String(language).toLowerCase().startsWith("fr")?"fr":"en";
 const latin=leonineSourceSections(prayer.la);
 const vernacular=leonineSourceSections(prayer[translated]);
 if(!latin||!vernacular||latin.length!==BLOCK_COUNT||vernacular.length!==BLOCK_COUNT)
  throw new Error("Five-block Leonine Prayer corpus source contract changed");
 return Object.freeze(latin.map((section,i)=>Object.freeze({
  index:i,
  label:section.label,
  latin:section.paragraphs,
  vernacular:vernacular[i].paragraphs,
  language:translated
 })));
}

const make=(doc,tag,cls,text)=>{
 const node=doc.createElement(tag);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=text;
 return node;
};
export function syncPostLowMassLeoninePrayers(root,prepared,current,mode="LIVE"){
 const card=root?.querySelector?.(".ao-prayer-card");
 if(!card)return false;
 let section=card.querySelector?.("[data-ao-post-low-mass-leonine]");
 const eligible=postLowMassLeonineEligible(prepared,current,mode);
 if(!eligible){section?.remove?.();return false;}
 const language=String(prepared?.readerPreferences?.language??"en").toLowerCase().startsWith("fr")?"fr":"en";
 if(section?.dataset?.language===language)return true;
 section?.remove?.();
 const doc=card.ownerDocument??globalThis.document;
 if(!doc?.createElement)return false;
 const fr=language==="fr";
 section=make(doc,"section","ao-post-low-mass");
 section.dataset.aoPostLowMassLeonine="true";
 section.dataset.language=language;
 section.setAttribute("aria-label",fr?"Prières léonines après la messe basse":"Leonine prayers after Low Mass");
 section.append(make(doc,"h2","",fr?"Après la messe basse · Prières léonines":"After Low Mass · Leonine Prayers"));
 section.append(make(doc,"p","",fr
  ?"Dévotion après la fin de la messe, distincte de l’Ordinaire. Ces prières peuvent être omises en certaines occasions, notamment à la messe privilégiée du Sacré-Cœur le premier vendredi ; suivre l’usage local du célébrant."
  :"A traditional devotion after Mass has ended, distinct from the Order of Mass. These prayers may be omitted on certain occasions, including the privileged First Friday Sacred Heart Mass; follow the celebrant’s local practice."));
 const subsections=postLowMassLeonineSections(language);
 for(const block of subsections){
  const item=make(doc,"section","ao-post-low-mass-prayer");
  item.dataset.leonineBlock=String(block.index+1);
  item.append(make(doc,"h3","",block.label[language]));
  const la=make(doc,"div","ao-post-low-mass-latin");
  la.setAttribute("lang","la");
  block.latin.forEach(p=>la.append(make(doc,"p",p.role==="versicle"?"ao-post-low-mass-versicle":p.role==="response"?"ao-post-low-mass-response":"",p.text.trim())));
  item.append(la);
  const translated=make(doc,"div","ao-post-low-mass-translation");
  translated.setAttribute("lang",language);
  block.vernacular.forEach(p=>translated.append(make(doc,"p",p.role==="versicle"?"ao-post-low-mass-versicle":p.role==="response"?"ao-post-low-mass-response":"",p.text.trim())));
  item.append(translated);
  section.append(item);
 }
 const source=make(doc,"small","ao-post-low-mass-source",
  fr?"Référence : livret de messe de l’ICKSP · prières après la messe basse. ":"Reference: ICKSP Mass booklet · prayers after Low Mass. ");
 const link=make(doc,"a","",fr?"Consulter le livret":"View booklet");
 link.href=ICKSP_LOW_MASS_BOOKLET;
 link.target="_blank";
 link.rel="noopener noreferrer";
 source.append(link);
 section.append(source);
 card.append(section);
 return true;
}
