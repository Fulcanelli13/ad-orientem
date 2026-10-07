import { CSE_SOURCE_MAP } from "./sources.js";

const freezeRefs=refs=>Object.freeze((refs||[]).map(ref=>Object.freeze([...ref])));
const freezeMap=record=>Object.freeze(Object.fromEntries(Object.entries(record).map(([id,refs])=>[id,freezeRefs(refs)])));

export const CSE_DEBATE_POSITION_REFS=freezeMap({
  CSE006:[["MILL1859","Ch. IV · Of the Limits to the Authority of Society over the Individual"]],
  CSE007:[["PP_CONSENT","What’s consent? · FRIES framework"],["FARLEY2008","Just Sex · justice framework"]],
  CSE008:[["FLETCHER1966","situation ethics · loving concern and contextual moral judgment"],["FARLEY2008","Just Sex · justice framework"]],
  CSE010:[["FLETCHER1966","critique of absolute rules and intrinsically fixed moral judgments"],["CURRAN2006","moral norms and dissent"]],
  CSE012:[["CURRAN1978","sexual ethics and critique of traditional manualism"]],
  CSE013:[["CURRAN1978","sexual morality and contemporary moral theology"]],
  CSE014:[["CURRAN1992","living tradition and development in Catholic moral theology"],["CURRAN2006","dissent from official sexual teaching"]],
  CSE016:[["CURRAN2006","conscience, dissent and hierarchical teaching office"]],
  CSE018:[["CURRAN2006","theological dissent and magisterial authority"]],
  CSE020:[["NIDA_ADDICTION","compulsive use and impaired self-control"],["CCC","§2352"],["ST77","aa.6–7"]],
  CSE021:[["FARLEY2008","sexuality and its meanings · Just Sex"]],
  CSE029:[["FARLEY2008","celibacy and sexual ethics"]],
  CSE031:[["FLETCHER1966","premarital sex as potentially right depending on circumstances"],["FARLEY2008","Just Sex; contexts for sexual relationships"],["PP_RELATIONSHIPS","sexual and romantic relationships"]],
  CSE035:[["PP_RELATIONSHIPS","hooking up, falling in love and healthy relationships"],["FARLEY2008","marriage, family and sexual relationships"]],
  CSE038:[["PP_SEX","different kinds of sex and personal sexual choices"],["FARLEY2008","sexuality and its meanings"]],
  CSE039:[["PP_RELATIONSHIPS","healthy relationships and communication"],["PP_CONSENT","boundaries and sexual consent"]],
  CSE040:[["PP_SEX","oral sex, anal sex, genital touching and sexual activity"],["PP_SAFERSEX","oral, anal and other sexual activity"]],
  CSE043:[["FARLEY2008","same-sex relationships, marriage and family"],["APA_LGB","sexual orientation and same-sex relationships"]],
  CSE044:[["FARLEY2008","same-sex relationships, marriage and family"],["APA_LGB","sexual orientation and homosexuality"]],
  CSE045:[["FARLEY2008","marriage, family and just love"]],
  CSE049:[["FARLEY2008","divorce and second marriage"]],
  CSE050:[["FARLEY2008","divorce and second marriage"],["CURRAN2006","divorce and dissent from official teaching"]],
  CSE051:[["PP_CONSENT","consent in ongoing relationships"],["FARLEY2008","justice and mutuality in sexual relationships"]],
  CSE054:[["PP_CONSENT","consent is required every time"],["RAINN_ALCOHOL","consent, coercion and incapacity"]],
  CSE055:[["PP_SEX","oral sex, manual stimulation and sexual choices"],["PP_SAFERSEX","sex toys, oral and anal sexual activity"]],
  CSE056:[["APA_CNM","consensual non-monogamy fact sheet"],["PP_OPEN","open relationships and consensual additional partners"]],
  CSE058:[["PP_ANAL","anal sex, consent and risk reduction"],["PP_SEX","anal sex and sexual choice"]],
  CSE061:[["PP_BIRTHCONTROL","birth control methods and pregnancy prevention"],["CURRAN2006","dissent on contraception"]],
  CSE063:[["PP_BIRTHCONTROL","birth control and fertility awareness"],["CURRAN2006","contraception and dissent"]],
  CSE064:[["PP_BIRTHCONTROL","birth control and fertility-awareness methods"],["CURRAN2006","contraception and dissent"]],
  CSE070:[["PP_BIRTHCONTROL","contraceptive methods and individual choice"],["CURRAN2006","contraception and Catholic dissent"]],
  CSE071:[["PP_MAST","masturbation described as normal and healthy"]],
  CSE074:[["PP_PORN","pornography as adult sexual material; consent and media context"]],
  CSE076:[["PP_PORN","pornography and sexual media"],["FARLEY2008","sexuality, justice and relationship context"]],
  CSE083:[["FARLEY2008","same-sex relationships and just love"],["APA_LGB","sexual orientation and homosexuality"]],
  CSE084:[["FARLEY2008","same-sex relationships, marriage and family"],["APA_LGB","sexual orientation and same-sex relationships"]],
  CSE087:[["APA_LGB","stigma, prejudice and sexual orientation"]],
  CSE088:[["APA_LGB","homosexuality is not classified as mental illness"]],
  CSE089:[["APA_LGB","same-sex relationships and discrimination"],["FARLEY2008","same-sex relationships, marriage and family"]],
  CSE093:[["FARLEY2008","gender, embodiment and sexuality"],["APA_TRANS","gender identity and gender expression"]],
  CSE094:[["APA_TRANS","gender identity and gender dysphoria"],["APA_SEXTHERAPY","clinical work with sexuality and gender"]],
  CSE095:[["APA_TRANSCARE","affirming evidence-based inclusive care"],["APA_TRANS","support and gender expression"]],
  CSE096:[["WPATH8","Standards of Care Version 8"],["APA_TRANSCARE","affirming evidence-based inclusive care"]],
  CSE101:[["ASRM_ART","informed consent and assisted reproduction"]],
  CSE104:[["ASRM_GC","gestational carriers and intended parents"]],
  CSE112:[["ASSAULT2024","physiological response during non-consensual sexual activity"],["PP_CONSENT","consent versus unwanted sexual activity"]],
  CSE117:[["RAINN_ALCOHOL","significant impairment and consent"],["PP_CONSENT","drugs, alcohol and freely given consent"]],
  CSE123:[["ACOG_ABORTION","abortion as health care"],["PP_ABORTION","abortion information and patient choice"],["SINGER2011","abortion and moral status in applied ethics"]],
  CSE124:[["ACOG_ABORTION","abortion access and patient health"],["PP_ABORTION","abortion decision-making"]],
  CSE125:[["ACOG_ABORTION","life- and health-threatening pregnancy complications"]],
  CSE141:[["FARLEY2008","Christian sexual ethics and its scope"],["CURRAN1978","sexual and medical ethics controversies"]],
  CSE142:[["FARLEY2008","celibacy, sexuality and Christian sexual ethics"]],
  CSE143:[["APA_SEXTHERAPY","sexual shame and psychotherapy"],["FARLEY2008","sexual ethics and justice"]],
  CSE145:[["FLETCHER1966","agape and loving concern as the governing moral norm"],["FARLEY2008","love, justice and sexual relationships"],["PP_RELATIONSHIPS","love and healthy relationships"]],
  CSE149:[["APA_LGB","modern psychology of sexual orientation"],["APA_TRANS","gender identity and psychology"],["ASRM_ART","assisted reproduction ethics"],["ACOG_ABORTION","abortion and evidence-based medicine"]],
});

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
  if(field==="opposition"||field==="appeal"||field==="counter")return position.length?position:catholic;
  if(field==="concession")return uniqRefs([...position,...catholic]);
  return catholic;
}

export function validateParagraphRefs(item,refs){
  if(!refs?.length)return false;
  return refs.every(([sourceId,locator])=>Boolean(CSE_SOURCE_MAP[sourceId]?.canonical_url&&locator));
}
