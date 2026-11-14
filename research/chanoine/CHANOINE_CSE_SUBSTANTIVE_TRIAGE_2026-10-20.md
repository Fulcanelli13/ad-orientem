# Le Chanoine — 147-dialogue substantive editorial triage

**Date:** 20 October 2026  
**Branch / draft PR:** `research/chanoine-cse-source-dialogue-20261019` / #1489  
**Status:** `EDITORIAL_REPAIRS_PROPOSED; ALL APPROVALS STILL FALSE`

## Scope and conclusion

This is a substantive **exception-finding pass**, not a claim that all 147 replies have undergone line-by-line primary-source certification. Every source/pastoral dialogue was included in machine-assisted checks for coverage, bilingual presence, duplicated objections, lengths, ownership and pre-existing risk labels. Selected theological, clinical and pastoral cases were compared manually to their preserved source passages. **Twelve concrete source-semantic repairs** were drafted with complete English and French replacements in [the repair overlay](./chanoine-cse-semantic-repair-proposals-12.v1.json); these have NOT been applied to the review composite or any public route.

The source Q&A and provenance are unchanged. All three archived entries remain excluded: CSE055→CSE057; CSE056→CSE051; CSE058→CSE057. The 360 pre-existing Chanoine conversations are unaffected.

## Complete editorial review queue

See [the machine-readable 147-record queue](./chanoine-cse-147-substantive-review-queue.v1.json). Its three source-risk lanes, inherited from the assembled composite, partition all 147:

| Review lane | Conversations | Required reviewers |
| --- | ---: | --- |
| Specialist (canon law, theology, safeguarding, clinical ethics, bioethics, survivor care, minors or sacramental practice) | **39** | Subject-matter reviewer first |
| Doctrinal-source | **31** | Primary-source theological reviewer |
| General editorial | **77** | Source fidelity, bilingual editor and priest-character editor |
| **Total** | **147** | No human sign-offs yet |

Priority assignments: **4 critical source-semantic corrections**, **35 further specialist-review entries**, **3 other source-semantic repair entries**, **3 compression-watch entries**, **102 standard review entries**. These categories are exclusive in the queue and should not be confused with its three reviewer lanes.

All **147/147** contain bilingual pastoral main answers, questions and follow-up answers. There are **52** inherited source objections and **95** original editorial follow-ups. No duplicated English follow-up question was found by exact normalization; no gross EN/FR length imbalance beyond 0.55×–1.8× was detected. These checks cannot establish correctness of doctrine or translation.

## Actionable bilingual correction set — twelve IDs

| ID | Priority of correction | Why it requires change |
| --- | --- | --- |
| CSE045 | P1 | Papal formulations about the husband's domestic primacy and reciprocal subjection were compressed into a vague opposition to coercion; preserve the historical difference, not an artificial harmonization |
| CSE070 | P1 | The conditional distinction for a spouse who reluctantly tolerates another spouse's contraception omits crucial conditions from `Casti connubii` §59 |
| CSE089 | P1 | The reason offered by the 2003 CDF statement on the civil institution of marriage is lost when the reply refers vaguely to the public meaning of marriage |
| CSE096 | P1 | `Dignitas infinita` §60's qualified reference to interventions intended as sex changes must not be expanded to every alteration of sexual characteristics |
| CSE014 | P2 | Concrete witnesses from Christ, Saint Paul, the Roman Catechism and Pius XI were removed by compression |
| CSE035 | P2 | Source deliberately avoids an empirical verdict on whether cohabitation works as a compatibility test; draft inadvertently shifts toward one |
| CSE049 | P2 | English omits the essential juridical adjective 'sacramental'; French has a small punctuation error in the core rule |
| CSE101 | P2 | A detached 'whatever one judges' voice understates the Catholic IVF judgment, even in the hypothetical without embryo destruction |
| CSE104 | P2 | Opposing professional-ethics argument has vanished from an intended debate; preserve fair representation while distinguishing it from the magisterial norm |
| CSE110 | P2 | `Dignitas personae` §19 on prenatal adoption is more exact: praiseworthy intention with unresolved difficulties, not blanket permission |
| CSE124 | P2 | The definitive Catholic norm about direct abortion following rape/incest is omitted, even while important survivor-care language is retained |
| CSE032 | P3 | Restore concrete premarital-discernment topics: contraception, openness to children and explicit disagreement |

These are editorial **proposals**, not adjudications of every theological question. Safeguarding and clinical content must also be evaluated by competent specialists. The corrections keep care for harmed persons, no unsupported clinical prescriptions, and no invented claims attributed to Archbishop Lefebvre.

## Primary texts independently checked

The following *specific* source distinctions were cross-checked against Vatican-hosted primary texts, separately from the internal source seed:

1. **CSE045:** [Pius XI, `Casti connubii`, §§26–29](https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_19301231_casti-connubii.html) treats domestic primacy alongside the wife's dignity and freedom; [John Paul II, `Mulieris dignitatem`, §24](https://www.vatican.va/content/john-paul-ii/en/apost_letters/1988/documents/hf_jp-ii_apl_15081988_mulieris-dignitatem.html) explicitly characterizes subjection of spouses as mutual. The editorial text must preserve both emphases.
2. **CSE070:** [`Casti connubii`, §59](https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_19301231_casti-connubii.html) specifies grave cause, reluctant toleration, and a duty not to neglect dissuasion; it does not reclassify contraception as good.
3. **CSE096:** [`Dignitas infinita`, §60](https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2024/04/08/240408c.html) describes the sex-change intervention at issue and a distinct case of medically resolving genital abnormalities; the document is not an individualized clinical protocol.
4. **CSE110:** [`Dignitas personae`, §19](https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20081208_dignitas-personae_en.html) treats prenatal-adoption proposals as praiseworthy in intention yet involving serious problems.

Primary-text verification here is **not** a medical or moral approval for the 147 dialogues. Remaining source pointers still need verification in their exact cited locations.

## Persona and reader experience

The fictional Chanoine should speak as a traditional **una cum** priest addressing a real visitor, neither pretending to be Archbishop Lefebvre nor describing himself as a detached scholar of Lefebvre. Lexical screens found **37/147** main answers referring to institutions with expressions such as 'the Church', 'Catholic teaching' or 'the Magisterium', and **75/147** using at least one first- or second-person pastoral pronoun. Neither statistic is itself a defect: editorial readers must test whether the line is natural, firm, respectful, historically plausible and source-faithful, not force artificial personal pronouns into every reply.

## Remaining gates

1. Approve or amend **12 proposed repairs** and recompile the unified JSON from the overlays; never patch only the generated composite while leaving its upstream records divergent.
2. Resolve **39 specialist** cases and independently review the **31 doctrinal-source** cases, including source-locator verification and any empirical claim needing independent evidence.
3. Complete **77 general** source-semantic, EN/FR and character-voice reviews; this count is a lane, not an additional unique population.
4. Run full validation again; verify archival and publication locks, then request human editorial sign-off. No direct publishing, no ready-for-review transition or merge before this.

**Explicit non-certifications:** `publication_approved=false`, `claim_level_certified=false`, `persona_voice_approved=false`, `safeguarding_approved=false`, `english_french_reviewed=false` for all 147 at this stage.
