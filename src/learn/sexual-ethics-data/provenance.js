import { CSE_SOURCE_MAP } from "./sources.js";
import { CSE_HIGH_STAGE_SOURCE_IDS } from "./stage-evidence-high24.js";
import { CSE_REMAINING_STAGE_SOURCE_IDS } from "./stage-evidence-remaining31.js";

const freezeRefs=refs=>Object.freeze((refs||[]).map(ref=>Object.freeze([...ref])));
const freezeMap=record=>Object.freeze(Object.fromEntries(Object.entries(record).map(([id,refs])=>[id,freezeRefs(refs)])));

export const CSE_DEBATE_POSITION_REFS=freezeMap({
  CSE006:[["MILL_IV_FULL","Chapter IV · limits of social authority, not a complete sexual ethic"],["MILL1859","Ch. IV · Of the Limits to the Authority of Society over the Individual"]],
  CSE007:[["PP_CONSENT","What’s consent? · FRIES framework"],["FARLEY2008","Just Sex · justice framework"]],
  CSE008:[["FLETCHER_EXCERPTS","Original book excerpts on the sole norm of agape, via critical review; NOT the same as the slogan 'love is love'"],["FLETCHER_TABLET","six propositions 1–2 and 5: charity as ruling norm; secondary explanation, not a direct author quotation"],["FLETCHER1966","situation ethics · loving concern and contextual moral judgment"],["FARLEY2008","Just Sex · justice framework"]],
  CSE010:[["FLETCHER_EXCERPTS","Original book excerpts on the sole norm of agape, via critical review; NOT the same as the slogan 'love is love'"],["FLETCHER_TABLET","six propositions 2, 5, 6: context and ends/means; secondary not original Fletcher book text"],["FLETCHER1966","critique of absolute rules and intrinsically fixed moral judgments"],["CURRAN2006","moral norms and dissent"]],
  CSE012:[["CURRAN_CDF1986","lists sexual topics contested by Curran; not a direct claim about what Jesus explicitly said"],["CURRAN1978","sexual ethics and critique of traditional manualism"]],
  CSE013:[["CURRAN1987","dissenting framework and scriptural sources; not a passage directly attributing Paul's ethics to culture"],["CURRAN1978","sexual morality and contemporary moral theology"]],
  CSE014:[["CURRAN1987","paras. on changes in sexual teaching, non-infallible dissent, historical development"],["CURRAN1992","living tradition and development in Catholic moral theology"],["CURRAN2006","dissent from official sexual teaching"]],
  CSE016:[["CURRAN_TALK1986","Original address (16 October 1986), sections 1 and 3–6 · qualified theological dissent; NOT unrestricted private-conscience authority"],["CURRAN1987","paras. on public theological dissent from non-infallible teaching; not automatic priority of private conscience"],["CURRAN2006","conscience, dissent and hierarchical teaching office"]],
  CSE018:[["CURRAN_TALK1986","Original address (16 October 1986), sections 1 and 3–6 · qualified theological dissent; NOT unrestricted private-conscience authority"],["CURRAN1987","paras. on contested teaching and dissent; does not teach every disputed choice is free"],["CURRAN2006","theological dissent and magisterial authority"]],
  CSE020:[["NIDA_ADDICTION","compulsive use and impaired self-control"],["CCC","§2352"],["ST77","aa.6–7"]],
  CSE021:[["FREUD1924_FULL","Original 1908 Freud essay, complete 1924 English translation; cultural constraint and different capacities for sublimation"],["FREUD1908","modern sexual morality and nervousness: original criticism of sexual abstinence and repression; does not evaluate Catholic chastity as virtue"],["FARLEY2008","sexuality and its meanings · Just Sex"]],
  CSE029:[["PRIEST_WELLBEING2016","qualitative interviews: six of 15 priests described negative celibacy effects, not population prevalence"],["FARLEY2008","celibacy and sexual ethics"]],
  CSE031:[["CURRAN_CDF1986","documents Curran's dissent about premarital intercourse; not a direct 'engaged couple' argument"],["FLETCHER1966","premarital sex as potentially right depending on circumstances"],["FARLEY2008","Just Sex; contexts for sexual relationships"],["PP_RELATIONSHIPS","sexual and romantic relationships"]],
  CSE035:[["PEW_CO2019","original US survey: 23% of cohabiters cited relationship testing as a major reason, 38% finances and 37% convenience"],["PP_RELATIONSHIPS","hooking up, falling in love and healthy relationships"],["FARLEY2008","marriage, family and sexual relationships"]],
  CSE038:[["PP_SEX","descriptive sexual health material, not proponent of 'looking is not touching'; no identifiable proponent verified"]],
  CSE039:[["PP_RELATIONSHIPS","healthy relationships and communication"],["PP_CONSENT","boundaries and sexual consent"]],
  CSE040:[["PP_SEX","oral sex, anal sex, genital touching and sexual activity"],["PP_SAFERSEX","oral, anal and other sexual activity"]],
  CSE043:[["FARLEY_QUOTED2012","p. 293 same-sex civil marriage; p. 295 same-sex relationships"],["FARLEY2008","same-sex relationships, marriage and family"],["APA_LGB","sexual orientation and same-sex relationships"]],
  CSE044:[["CIC","can.1084 §3: authentic sterility premise; not an opposing advocate"],["FARLEY_QUOTED2012","Just Love p.293: genuine advocacy of legal same-sex unions, NOT the infertility/impotence analogy in this editorial objection"],["CDF2003","§§2–4: doctrinal account of marriage; the infertility inference remains explicitly illustrative"]],
  CSE045:[["PEW_CO2019","original survey: respondents cite love/companionship in marriage; no claim procreation is morally obsolete"],["FARLEY2008","marriage, family and just love"]],
  CSE049:[["FARLEY_QUOTED2012","pp. 304–305 on marriage commitment and possible release"],["FARLEY2008","divorce and second marriage"]],
  CSE050:[["FARLEY_QUOTED2012","p. 310 on remarriage after divorce"],["CURRAN1987","author discusses divorce and proposed change in moral teaching"],["FARLEY2008","divorce and second marriage"],["CURRAN2006","divorce and dissent from official teaching"]],
  CSE051:[["PP_CONSENT","consent in ongoing relationships"],["FARLEY2008","justice and mutuality in sexual relationships"]],
  CSE054:[["PP_CONSENT","consent is required every time"],["RAINN_ALCOHOL","consent, coercion and incapacity"]],
  CSE055:[["PP_SEX","oral sex, manual stimulation and sexual choices"],["PP_SAFERSEX","sex toys, oral and anal sexual activity"]],
  CSE056:[["APA_CNM","consensual non-monogamy fact sheet"],["PP_OPEN","open relationships and consensual additional partners"]],
  CSE058:[["PP_ANAL","anal sex, consent and risk reduction"],["PP_SEX","anal sex and sexual choice"]],
  CSE061:[["CURRAN1987","paras. on physicalism criticism and contraception"],["PP_BIRTHCONTROL","birth control methods and pregnancy prevention"],["CURRAN2006","dissent on contraception"]],
  CSE063:[["CURRAN1987","paras. on contraception and moral object, not NFP analogy verbatim"],["PP_BIRTHCONTROL","birth control and fertility awareness"],["CURRAN2006","contraception and dissent"]],
  CSE064:[["CURRAN1987","paras. on contraception and physicalism, not NFP analogy verbatim"],["PP_BIRTHCONTROL","birth control and fertility-awareness methods"],["CURRAN2006","contraception and dissent"]],
  CSE070:[["PP_BIRTHCONTROL","contraceptive methods and individual choice"],["CURRAN2006","contraception and Catholic dissent"]],
  CSE071:[["FARLEY_QUOTED2012","p. 236 directly quoted argument regarding masturbation"],["PP_MAST","masturbation described as normal and healthy"]],
  CSE074:[["PP_PORN","pornography as adult sexual material; consent and media context"]],
  CSE076:[["PP_PORN","pornography and sexual media"],["FARLEY2008","sexuality, justice and relationship context"]],
  CSE083:[["FARLEY_QUOTED2012","p. 295 direct statement on same-sex relations"],["FARLEY2008","same-sex relationships and just love"],["APA_LGB","sexual orientation and homosexuality"]],
  CSE084:[["FARLEY_QUOTED2012","p. 295 on same-sex relationships; does not assert specific infertility analogy"],["FARLEY2008","same-sex relationships, marriage and family"],["APA_LGB","sexual orientation and same-sex relationships"]],
  CSE087:[["APA_LGB_POLICY","APA resolution on discrimination and psychological harms; clinical/public policy not Catholic moral doctrine"],["APA_LGB","stigma, prejudice and sexual orientation"]],
  CSE088:[["APA_LGB_POLICY","APA resolution affirming homosexuality is not a psychiatric disorder; does not resolve whether sexual conduct is moral"],["APA_LGB","homosexuality is not classified as mental illness"]],
  CSE089:[["FARLEY_QUOTED2012","p. 293 on civil recognition and marriage of same-sex couples"],["APA_LGB","same-sex relationships and discrimination"],["FARLEY2008","same-sex relationships, marriage and family"]],
  CSE093:[["FARLEY2008","gender, embodiment and sexuality"],["APA_TRANS","gender identity and gender expression"]],
  CSE094:[["APA_TRANSCARE_FULL2024","Original APA Council February 2024 four-page policy, p. 1–2; affirming care, limits of evidence and noncoercive support"],["APA_TRANS","gender identity and gender dysphoria"],["APA_SEXTHERAPY","clinical work with sexuality and gender"]],
  CSE095:[["APA_TRANSCARE_FULL2024","Original APA 2024 policy pp. 1–3; stigma, respectful care and family participation, not a universal linguistic rule"],["APA_TRANSCARE","affirming evidence-based inclusive care"],["APA_TRANS","support and gender expression"]],
  CSE096:[["WPATH8_FULL","Standards of Care 8, clinical assessment and intervention, individualization and limitations"],["WPATH8","Standards of Care Version 8"],["APA_TRANSCARE","affirming evidence-based inclusive care"]],
  CSE101:[["ASRM_ART","informed consent and assisted reproduction"]],
  CSE104:[["ASRM_GC","gestational carriers and intended parents"]],
  CSE112:[["RAINN_CONSENT101","explicitly REFUTES inference from physiological response to consent; this is rebuttal evidence, not a proponent"],["ASSAULT2024","physiological response during non-consensual sexual activity"],["PP_CONSENT","consent versus unwanted sexual activity"]],
  CSE117:[["RAINN_ASSAULT","explicitly supports incapacity and coercion limits on consent; not an opponent advocating impaired consent"],["RAINN_ALCOHOL","significant impairment and consent"],["PP_CONSENT","drugs, alcohol and freely given consent"]],
  CSE123:[["SINGER_KUHSE1990","1990 original Kuhse–Singer chapter summary: moral status and right-to-life arguments about early human embryos"],["ACOG_ABORTION","abortion as health care"],["PP_ABORTION","abortion information and patient choice"]],
  CSE124:[["ACOG_ABORTION","abortion access and patient health"],["PP_ABORTION","abortion decision-making"]],
  CSE125:[["ACOG_ECTOPIC","clinical FAQ: life-threatening rupture, methotrexate and surgery; not moral permissibility"],["ACOG_ECTOPIC_GUIDELINE","Practice Bulletin 193: rapid intervention for unstable tubal ectopic pregnancy; abstract only"],["ACOG_ABORTION","life- and health-threatening pregnancy complications"]],
  CSE141:[["FRANCIS_SPADARO2013","original interview: warns against disproportionate repetition of selected sexual topics; does not reject Church sexual morality"],["FARLEY2008","Christian sexual ethics and its scope"],["CURRAN1978","sexual and medical ethics controversies"]],
  CSE142:[["FREUD1924_FULL","Original 1908 Freud essay; does not evaluate Catholic chastity in contemporary digital settings"],["FREUD1908","historical critique of enforced abstinence; no direct support for claim digital modernity makes chastity impossible"],["FARLEY2008","celibacy, sexuality and Christian sexual ethics"]],
  CSE143:[["PURITY_SHAME2026","1,273 participant correlational study: sexual shame association; explicitly no causation established"],["PURITY_SURVIVORS2026","original paper abstract: shame and purity culture in trauma-exposed groups; evangelical, not Catholic doctrinal teaching"],["APA_SEXTHERAPY","sexual shame and psychotherapy"],["FARLEY2008","sexual ethics and justice"]],
  CSE145:[["FLETCHER_EXCERPTS","Original book excerpts on the sole norm of agape, via critical review; NOT the same as the slogan 'love is love'"],["FLETCHER_TABLET","six propositions 1–2 and 5: love as intrinsic good and norm; secondary position account not literal Fletcher quotation"],["FLETCHER1966","agape and loving concern as the governing moral norm"],["FARLEY2008","love, justice and sexual relationships"],["PP_RELATIONSHIPS","love and healthy relationships"]],
  CSE149:[["APA_LGB","modern psychology of sexual orientation"],["APA_TRANS","gender identity and psychology"],["ASRM_ART","assisted reproduction ethics"],["ACOG_ABORTION","abortion and evidence-based medicine"]],
});

// These are common misconceptions: linked empirical documents rebut them rather than advocate them.
export const CSE_MISCONCEPTION_REBUTTAL_IDS=Object.freeze(["CSE112","CSE117"]);

// For these debate scenarios, external citations establish context or a documented
// concern, not an individual proponent's exact hypothetical wording.
export const CSE_CONTEXT_ONLY_POSITION_IDS=Object.freeze(["CSE012","CSE013","CSE014","CSE016","CSE018","CSE020","CSE021","CSE031","CSE035","CSE038","CSE039","CSE040","CSE044","CSE045","CSE051","CSE054","CSE063","CSE064","CSE070","CSE074","CSE076","CSE084","CSE141","CSE142","CSE143","CSE145"]);

export const CSE_POSITION_SOURCE_IDS=Object.freeze(Object.keys(CSE_DEBATE_POSITION_REFS).sort());

function uniqRefs(refs){
  const out=[];
  const seen=new Set();
  for(const ref of refs||[]){
    const key=ref.join("|");
    if(seen.has(key))continue;
    seen.add(key);out.push(Object.freeze([...ref]));
  }
  return Object.freeze(out);
}

export function paragraphRefsFor(item,kind,field=null){
  const catholic=freezeRefs(item?.refs||[]);
  const position=CSE_DEBATE_POSITION_REFS[item?.id]||Object.freeze([]);
  if(kind==="question")return item?.depth==="DEBATE"&&position.length?position:catholic;
  if(kind!=="debate")return catholic;
  const selectedIds=CSE_HIGH_STAGE_SOURCE_IDS[item?.id]?.[field]||CSE_REMAINING_STAGE_SOURCE_IDS[item?.id]?.[field];
  if(selectedIds?.length){
    // Every selected ID must already be present in this question's original sources.
    // The source excerpt locator is preserved; no invented page/chapter locators.
    const opponentStage=["opposition","appeal","counter"].includes(field);
    const byId=new Map((opponentStage?[...catholic,...position]:[...position,...catholic]).map(ref=>[ref[0],ref]));
    const selected=selectedIds.map(id=>byId.get(id)).filter(Boolean);
    if(selected.length===selectedIds.length)return uniqRefs(selected);
  }
  if(field==="opposition"||field==="appeal"||field==="counter")return position.length?position:catholic;
  if(field==="concession")return uniqRefs([...position,...catholic]);
  return catholic;
}

export function validateParagraphRefs(item,refs){
  if(!refs?.length)return false;
  return refs.every(([sourceId,locator])=>Boolean(CSE_SOURCE_MAP[sourceId]?.canonical_url&&locator));
}
