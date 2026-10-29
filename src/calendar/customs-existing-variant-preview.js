/**
 * EN/FR historical and regional details for 12 ALREADY published Calendar customs.
 * Source-of-truth projection: PR #1723,
 * data/customs/master/customs-22-existing-owner-bilingual-variants-20261029.v1.json.
 *
 * Do NOT treat the 22 details as additional canonical cards, current events,
 * resolved 1962 feast days, priestly rites, or indulgence grants.
 * The research entries remain editorially unapproved; preview only.
 */
const RAW_VARIANTS=[
  {
    "variant_id": "AO-CUST-VAR-001",
    "parent_id": "DEAD-003",
    "source_group_id": "CAT-WEISER-A-007",
    "source_observation_ids": [
      "WEI58-02-004"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 27,
    "region_en": "Latin Catholic",
    "region_fr": "Communautés catholiques latines",
    "title_en": "Prayer for the departed on Mondays",
    "title_fr": "Prière pour les défunts le lundi",
    "history_en": "In some Catholic households, Monday was devoted to remembering the faithful departed.",
    "history_fr": "Dans certains foyers catholiques, le lundi était consacré au souvenir des fidèles défunts.",
    "practice_en": "A family may pray for its departed members on a Monday; this is optional, not a new liturgical obligation.",
    "practice_fr": "Une famille peut prier le lundi pour ses défunts ; c'est une pratique facultative, non une nouvelle obligation liturgique.",
    "caution_en": "No promise of a temporary release from purgatory; not a mandatory Monday devotion. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Aucune promesse de libération temporaire du purgatoire ; ce n'est pas une obligation du lundi. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "WEEKDAY_MONDAY"
  },
  {
    "variant_id": "AO-CUST-VAR-002",
    "parent_id": "DEAD-003",
    "source_group_id": "CAT-WEISER-A-016",
    "source_observation_ids": [
      "WEI58-03-005"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 36,
    "region_en": "Catholic Europe",
    "region_fr": "Europe catholique",
    "title_en": "Remembering the dead on Ember days",
    "title_fr": "Prier pour les défunts aux Quatre-Temps",
    "history_en": "Historical accounts also associate Ember days with Masses and prayers for the departed.",
    "history_fr": "Les sources historiques associent aussi les Quatre-Temps à des messes et à des prières pour les défunts.",
    "practice_en": "The existing prayer-for-the-dead entry may mention this seasonal intention; it does not prescribe a new Ember-day rite.",
    "practice_fr": "La notice de prière pour les défunts peut rappeler cette intention saisonnière, sans prescrire un nouveau rite des Quatre-Temps.",
    "caution_en": "Do not imply an extra universally prescribed Ember-Day Mass or indulgence. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Ne pas laisser entendre qu'une messe supplémentaire ou une indulgence est prescrite universellement. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "EMBER_DAYS_CALENDAR"
  },
  {
    "variant_id": "AO-CUST-VAR-003",
    "parent_id": "ADVT-001",
    "source_group_id": "CAT-WEISER-A-023",
    "source_observation_ids": [
      "WEI58-05-003"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 55,
    "region_en": "Some European places",
    "region_fr": "Certaines régions d'Europe",
    "title_en": "Lighting the Advent wreath as a family",
    "title_fr": "Allumer la couronne de l'Avent en famille",
    "history_en": "In some European families, a designated child lit the Advent wreath candle.",
    "history_fr": "Dans certains foyers européens, un enfant désigné allumait la bougie de la couronne de l'Avent.",
    "practice_en": "As an optional family custom, a child may light the candle with adult supervision; the Calendar determines the Advent Sundays.",
    "practice_fr": "Selon l'usage familial, un enfant peut allumer la bougie sous la surveillance d'un adulte ; les dimanches de l'Avent sont déterminés par le Calendrier.",
    "caution_en": "A local household variant, not a prescribed Advent gesture; observe fire safety. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Variante familiale locale, non un geste prescrit pour l'Avent ; respecter les précautions contre l'incendie. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "ADVENT_SUNDAYS"
  },
  {
    "variant_id": "AO-CUST-VAR-004",
    "parent_id": "BLSS-003",
    "source_group_id": "CAT-WEISER-A-076",
    "source_observation_ids": [
      "WEI58-10-014"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 130,
    "region_en": "Central Europe",
    "region_fr": "Europe centrale",
    "title_en": "Using blessed Saint John's wine",
    "title_fr": "Usage du vin bénit de saint Jean",
    "history_en": "Central European traditions used wine blessed on Saint John's feast at family meals and important life moments.",
    "history_fr": "En Europe centrale, du vin bénit à la fête de saint Jean était utilisé aux repas familiaux et à certains moments importants de la vie.",
    "practice_en": "This is an historical use of an already blessed object, not a blessing for the household to improvise; follow local practice.",
    "practice_fr": "Il s'agit de l'usage historique d'un vin déjà bénit, non d'une bénédiction à improviser au foyer ; suivre l'usage local.",
    "caution_en": "Domestic use is not the priestly blessing itself; do not infer medical benefits or universal ritual permission. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "L'usage familial ne remplace pas la bénédiction sacerdotale ; ne promettre aucun effet médical ni aucune autorisation rituelle universelle. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "ST_JOHN_EVANGELIST_DEC27"
  },
  {
    "variant_id": "AO-CUST-VAR-005",
    "parent_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-003",
    "source_observation_ids": [
      "WEI58-15-005"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 190,
    "region_en": "France and England (reported historical)",
    "region_fr": "France et Angleterre (usage historique)",
    "title_en": "Visiting family graves on Palm Sunday",
    "title_fr": "Visiter les tombes familiales le dimanche des Rameaux",
    "history_en": "Historical churchyard processions in parts of France and England were associated with visits to family graves.",
    "history_fr": "Des processions anciennes dans les cimetières attenants aux églises, notamment en France et en Angleterre, s'accompagnaient de visites aux tombes familiales.",
    "practice_en": "The cemetery-visit article may note this regional timing without replacing the Palm Sunday liturgy.",
    "practice_fr": "La notice sur la visite au cimetière peut mentionner cet usage régional sans se substituer à la liturgie des Rameaux.",
    "caution_en": "Not part of the universally prescribed Palm Sunday procession. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Cette visite ne fait pas partie de la procession des Rameaux prescrite universellement. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "PALM_SUNDAY_CALENDAR"
  },
  {
    "variant_id": "AO-CUST-VAR-006",
    "parent_id": "DOM-013",
    "source_group_id": "CAT-WEISER-B-006",
    "source_observation_ids": [
      "WEI58-15-010"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 192,
    "region_en": "Austria Bavaria Slavic regions",
    "region_fr": "Autriche, Bavière et régions slaves",
    "title_en": "Keeping blessed palms on farms",
    "title_fr": "Conserver les rameaux bénits dans les fermes",
    "history_en": "In some central and eastern European regions, Palm Sunday branches were placed in farm buildings and fields.",
    "history_fr": "Dans certaines régions d'Europe centrale et orientale, des rameaux des Rameaux étaient placés dans les bâtiments agricoles et les champs.",
    "practice_en": "This is a regional use of already blessed branches; no promised protection against weather or illness should be inferred.",
    "practice_fr": "Il s'agit d'un usage régional de rameaux déjà bénits ; aucune protection garantie contre les intempéries ou la maladie ne doit être suggérée.",
    "caution_en": "No guarantee of protection from lightning, disease or poor harvests. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Aucune garantie contre la foudre, la maladie ou les mauvaises récoltes. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "PALM_SUNDAY_CALENDAR"
  },
  {
    "variant_id": "AO-CUST-VAR-007",
    "parent_id": "BLSS-004",
    "source_group_id": "CAT-WEISER-B-018",
    "source_observation_ids": [
      "WEI58-15-037"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 208,
    "region_en": "Certain Central European villages",
    "region_fr": "Certains villages d'Europe centrale",
    "title_en": "Easter foods blessed in the home",
    "title_fr": "Bénédiction des aliments de Pâques à domicile",
    "history_en": "In certain central European villages, priests historically visited households to bless Easter foods on Holy Saturday.",
    "history_fr": "Dans certains villages d'Europe centrale, des prêtres passaient autrefois dans les foyers pour bénir les aliments de Pâques le Samedi saint.",
    "practice_en": "This records a priestly local variant, not permission for a family to perform the clerical blessing or a promise of a parish visit.",
    "practice_fr": "Cette variante locale concerne une bénédiction sacerdotale ; elle n'autorise pas la famille à accomplir le rite et ne suppose aucune visite paroissiale.",
    "caution_en": "Priest-only action; do not suggest that a family may reproduce the clerical formula. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Action sacerdotale ; ne pas proposer à la famille de reproduire la formule du prêtre. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "HOLY_SATURDAY_CALENDAR"
  },
  {
    "variant_id": "AO-CUST-VAR-008",
    "parent_id": "EAST-001",
    "source_group_id": "CAT-WEISER-B-033",
    "source_observation_ids": [
      "WEI58-16-029"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 223,
    "region_en": "French Canada",
    "region_fr": "Canada français",
    "title_en": "Easter Monday visits to grandparents",
    "title_fr": "Visiter les grands-parents le lundi de Pâques",
    "history_en": "French-Canadian examples describe Easter Monday visits to grandparents as part of the family celebration.",
    "history_fr": "Des témoignages canadiens-français décrivent la visite aux grands-parents le lundi de Pâques dans le cadre de la fête familiale.",
    "practice_en": "The existing Emmaus-walk entry can offer this as an alternative regional family visit, not a universal practice.",
    "practice_fr": "La notice sur la promenade d'Emmaüs peut présenter cette visite familiale régionale comme une variante, non comme un usage universel.",
    "caution_en": "Related to Easter Monday outings but not identical to a German Emmaus prayer walk. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Usage voisin des promenades pascales, sans être identique à une marche de prière d'Emmaüs. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "EASTER_MONDAY_CALENDAR"
  },
  {
    "variant_id": "AO-CUST-VAR-009",
    "parent_id": "BLSS-004",
    "source_group_id": "CAT-WEISER-B-044",
    "source_observation_ids": [
      "WEI58-17-023"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 238,
    "region_en": "Ukraine, Poland, other Slavic homes",
    "region_fr": "Familles slaves, notamment ukrainiennes et polonaises",
    "title_en": "Paska among Easter foods",
    "title_fr": "La paska parmi les aliments de Pâques",
    "history_en": "Cross-marked paska breads appear among the traditional foods prepared in several Slavic households for Easter.",
    "history_fr": "Des pains de Pâques marqués d'une croix, appelés paska, figurent parmi les aliments traditionnels de plusieurs régions slaves.",
    "practice_en": "Preparing a regional Easter bread is distinct from the priest's blessing of Easter foods; local recipes and dates vary.",
    "practice_fr": "Préparer un pain pascal régional se distingue de la bénédiction sacerdotale des aliments ; recettes et dates varient localement.",
    "caution_en": "Baking and marking bread are not the priest's rite of blessing Easter foods. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Préparer et décorer le pain ne constitue pas la bénédiction sacerdotale des aliments pascals. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "EASTER_PREPARATION_SEASON"
  },
  {
    "variant_id": "AO-CUST-VAR-010",
    "parent_id": "CORP-001",
    "source_group_id": "CAT-WEISER-B-076",
    "source_observation_ids": [
      "WEI58-21-007"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 262,
    "region_en": "France Spain Portugal Belgium Italy and elsewhere",
    "region_fr": "Europe latine, selon les régions",
    "title_en": "Corpus Christi windows with lights and images",
    "title_fr": "Fenêtres ornées pour la Fête-Dieu",
    "history_en": "Historical Corpus Christi processions passed homes whose windows displayed candles and sacred images.",
    "history_fr": "Dans des usages anciens de la Fête-Dieu, des fenêtres donnant sur le parcours de la procession étaient ornées de cierges et d'images saintes.",
    "practice_en": "This may enrich the existing procession-decoration custom where a local route is actually announced.",
    "practice_fr": "Cette pratique peut enrichir la notice sur la décoration du parcours lorsqu'une procession locale est effectivement annoncée.",
    "caution_en": "An ornament is not attendance at the procession or a separately indulgenced work. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "La décoration ne remplace pas la participation à la procession et ne constitue pas en soi une œuvre indulgenciée. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "CORPUS_CHRISTI_CALENDAR"
  },
  {
    "variant_id": "AO-CUST-VAR-011",
    "parent_id": "CORP-001",
    "source_group_id": "CAT-WEISER-B-077",
    "source_observation_ids": [
      "WEI58-21-008"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 262,
    "region_en": "Central and Northern Europe",
    "region_fr": "Europe centrale et septentrionale",
    "title_en": "Greenery beside the Corpus Christi route",
    "title_fr": "Verdure sur le parcours de la Fête-Dieu",
    "history_en": "Birch and other greenery decorated homes and routes in some central and northern European Corpus Christi celebrations.",
    "history_fr": "Dans certaines régions d'Europe centrale et septentrionale, des rameaux de bouleau et d'autres verdures ornaient les maisons et les parcours de la Fête-Dieu.",
    "practice_en": "Describe this as a local form of procession decoration, never a prescribed part of the Mass.",
    "practice_fr": "Présenter cette verdure comme une variante locale de la décoration processionnelle, jamais comme une prescription de la messe.",
    "caution_en": "Not a prescribed Roman liturgical act; never presume a parish procession exists. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Ce n'est pas un acte prescrit par la liturgie romaine ; ne pas supposer qu'une procession paroissiale a lieu. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "CORPUS_CHRISTI_CALENDAR"
  },
  {
    "variant_id": "AO-CUST-VAR-012",
    "parent_id": "CORP-001",
    "source_group_id": "CAT-WEISER-B-084",
    "source_observation_ids": [
      "WEI58-21-018"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 265,
    "region_en": "Central Europe and France",
    "region_fr": "Europe centrale et France",
    "title_en": "Flower wreaths for Corpus Christi",
    "title_fr": "Couronnes de fleurs pour la Fête-Dieu",
    "history_en": "Flower wreaths, banners and bouquets have adorned Corpus Christi homes and processions in historical regional practice.",
    "history_fr": "Des couronnes de fleurs, bannières et bouquets ont orné les maisons et processions de la Fête-Dieu dans divers usages régionaux.",
    "practice_en": "The wreath is a decoration; any separate priestly blessing belongs to the appropriate local rite.",
    "practice_fr": "La couronne sert de décoration ; une éventuelle bénédiction sacerdotale relève d'un rite local distinct.",
    "caution_en": "A priestly blessing of wreaths requires separate local ritual authority. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "La bénédiction sacerdotale des couronnes exige une autorité rituelle locale distincte. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "CORPUS_CHRISTI_CALENDAR"
  },
  {
    "variant_id": "AO-CUST-VAR-013",
    "parent_id": "PATR-001",
    "source_group_id": "CAT-WEISER-B-095",
    "source_observation_ids": [
      "WEI58-23-007"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 279,
    "region_en": "Germany, Hungary, Slovakia, Ukraine, Spain",
    "region_fr": "Régions d'Europe centrale, notamment germanophones",
    "title_en": "The local patronal feast",
    "title_fr": "La fête patronale locale",
    "history_en": "The Kirchweih or Kirmes of German-speaking communities may combine a parish dedication or patronal celebration with civic festivities.",
    "history_fr": "La Kirchweih ou Kirmes des régions germanophones peut associer la fête de dédicace ou patronale de la paroisse à des réjouissances civiles.",
    "practice_en": "Attach this as regional history to the existing patronal custom; the actual dedication or patronal date must be resolved locally.",
    "practice_fr": "Rattacher cette variante historique à la coutume patronale existante ; la date réelle de dédicace ou du patron doit être connue localement.",
    "caution_en": "Church dedication and the saint's patronal feast may differ; do not substitute the French regional custom's geography. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "La dédicace de l'église et la fête de son patron peuvent différer ; ne pas attribuer à l'Allemagne tous les usages français. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "LOCAL_PATRONAL_DATE_ONLY"
  },
  {
    "variant_id": "AO-CUST-VAR-014",
    "parent_id": "NDAY-001",
    "source_group_id": "CAT-WEISER-B-096",
    "source_observation_ids": [
      "WEI58-23-010"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 280,
    "region_en": "European Catholic families",
    "region_fr": "Familles catholiques européennes",
    "title_en": "Family privileges on a name day",
    "title_fr": "Petites attentions familiales le jour de fête",
    "history_en": "Some European households celebrated a baptismal patron's feast with small gifts and relief from ordinary chores.",
    "history_fr": "Dans certains foyers européens, la fête du saint patron de baptême donnait lieu à de petits cadeaux et à une dispense de tâches habituelles.",
    "practice_en": "This is an optional family variation of the existing name-day custom, not a public holiday.",
    "practice_fr": "C'est une variante familiale facultative de la fête du saint patron, non un jour férié.",
    "caution_en": "Personal patron and feast date require their own identification; not a universal day off. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Le patron personnel et sa date de fête doivent être identifiés ; ce n'est pas un congé universel. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "PERSONAL_PATRON_FEAST_ONLY"
  },
  {
    "variant_id": "AO-CUST-VAR-015",
    "parent_id": "DEV-006",
    "source_group_id": "CAT-WEISER-B-097",
    "source_observation_ids": [
      "WEI58-23-014"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 282,
    "region_en": "Early and medieval Christian church",
    "region_fr": "Communautés chrétiennes anciennes et médiévales",
    "title_en": "Pilgrimage on a martyr's anniversary",
    "title_fr": "Pèlerinage à l'anniversaire d'un martyr",
    "history_en": "Early Christians sometimes visited martyrs' tombs on the anniversary of their death.",
    "history_fr": "Dans l'Église ancienne, des fidèles visitaient parfois les tombes des martyrs au jour anniversaire de leur mort.",
    "practice_en": "This is historical background to shrine pilgrimage, not a present-day recommendation to enter inaccessible tombs.",
    "practice_fr": "Il s'agit d'un rappel historique lié au pèlerinage, non d'une invitation actuelle à pénétrer dans des tombeaux inaccessibles.",
    "caution_en": "Historical anniversary is not an automatic current pilgrimage schedule or indulgence. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "L'anniversaire historique n'établit ni un programme de pèlerinage actuel ni une indulgence. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "LOCAL_SHRINE_ANNIVERSARY_ONLY"
  },
  {
    "variant_id": "AO-CUST-VAR-016",
    "parent_id": "MARI-001",
    "source_group_id": "CAT-WEISER-B-101",
    "source_observation_ids": [
      "WEI58-24-004"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 289,
    "region_en": "Austria and Central Europe",
    "region_fr": "Autriche et Europe centrale",
    "title_en": "Assumption procession through the fields",
    "title_fr": "Procession de l'Assomption à travers les champs",
    "history_en": "In Austrian and nearby communities, historical Marian processions on the Assumption included prayer through agricultural land.",
    "history_fr": "En Autriche et dans des régions voisines, des processions mariales historiques de l'Assomption traversaient les terres agricoles dans la prière.",
    "practice_en": "This is a local form of Assumption procession, not a universal parish itinerary or a lay substitute for a priestly blessing.",
    "practice_fr": "C'est une forme locale de procession de l'Assomption, ni un itinéraire paroissial universel ni un remplacement laïc d'une bénédiction sacerdotale.",
    "caution_en": "An Austrian procession is not evidence that the published French practice is universal. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Une procession autrichienne ne rend pas universelle la coutume française déjà décrite. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "ASSUMPTION_AUG15_CALENDAR"
  },
  {
    "variant_id": "AO-CUST-VAR-017",
    "parent_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-130",
    "source_observation_ids": [
      "WEI58-26-010"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 310,
    "region_en": "Catholic European communities",
    "region_fr": "Communautés catholiques européennes",
    "title_en": "Preparing family graves before All Souls",
    "title_fr": "Préparer les tombes familiales avant les défunts",
    "history_en": "Cleaning and decorating graves before the commemoration of the faithful departed is historically documented in Catholic communities.",
    "history_fr": "Le nettoyage et l'ornement des tombes avant la commémoration des fidèles défunts sont attestés dans des communautés catholiques.",
    "practice_en": "A family may care for a grave and pray for the deceased; cemetery regulations and local conditions still apply.",
    "practice_fr": "Une famille peut entretenir une tombe et prier pour le défunt, dans le respect des règles du cimetière et des conditions locales.",
    "caution_en": "Care for a grave is distinct from the conditions of any cemetery-visit indulgence. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "L'entretien d'une tombe est distinct des conditions d'une éventuelle indulgence liée à la visite du cimetière. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "ALL_SAINTS_SOULS_PERIOD"
  },
  {
    "variant_id": "AO-CUST-VAR-018",
    "parent_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-131",
    "source_observation_ids": [
      "WEI58-26-011"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 311,
    "region_en": "Central European Catholic countries",
    "region_fr": "Europe centrale catholique",
    "title_en": "Lights at family graves",
    "title_fr": "Lumières sur les tombes familiales",
    "history_en": "Candles and small protected lanterns were placed by graves around All Saints and All Souls in central Europe.",
    "history_fr": "En Europe centrale, on plaçait des cierges et de petites lanternes protégées près des tombes autour de la Toussaint et du jour des Défunts.",
    "practice_en": "This is a regional remembrance practice, subject to cemetery fire restrictions; a candle itself does not establish an indulgence.",
    "practice_fr": "C'est un usage régional de souvenir, soumis aux règles de sécurité du cimetière ; un cierge n'établit pas à lui seul une indulgence.",
    "caution_en": "A lantern does not itself satisfy an indulgenced work, and fire safety and local rules apply. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Une lanterne ne constitue pas à elle seule une œuvre indulgenciée ; respecter les règles locales et la sécurité. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "ALL_SAINTS_SOULS_PERIOD"
  },
  {
    "variant_id": "AO-CUST-VAR-019",
    "parent_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-135",
    "source_observation_ids": [
      "WEI58-26-015"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 311,
    "region_en": "Brazil",
    "region_fr": "Brésil (témoignage historique)",
    "title_en": "All Souls cemetery prayers in Brazil",
    "title_fr": "Prières au cimetière pour les Défunts au Brésil",
    "history_en": "Historical Brazilian accounts describe graveside visits, candles and prayer on All Souls.",
    "history_fr": "Des témoignages brésiliens anciens décrivent la visite au cimetière, les cierges et la prière le jour des Défunts.",
    "practice_en": "Offer this as a Brazilian illustration of the existing prayerful cemetery visit, not as an automatically scheduled parish vigil.",
    "practice_fr": "Présenter cet usage comme une illustration brésilienne de la visite priante au cimetière, sans annoncer automatiquement une veillée paroissiale.",
    "caution_en": "Historical national evidence does not establish a uniform practice at every Brazilian cemetery. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Un témoignage historique national n'établit pas une coutume identique dans tous les cimetières du Brésil. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "ALL_SOULS_NOV2_CALENDAR"
  },
  {
    "variant_id": "AO-CUST-VAR-020",
    "parent_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-136",
    "source_observation_ids": [
      "WEI58-26-016"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 311,
    "region_en": "Puerto Rico",
    "region_fr": "Porto Rico (témoignage historique)",
    "title_en": "All Souls grave visits in Puerto Rico",
    "title_fr": "Visites aux tombes pour les Défunts à Porto Rico",
    "history_en": "Historical Puerto Rican custom included cemetery visits with flowers and prayers for departed relatives.",
    "history_fr": "Un usage ancien de Porto Rico associait la visite au cimetière, les fleurs et la prière pour les proches défunts.",
    "practice_en": "Treat it as local evidence supporting the existing cemetery-visit custom, not a new feast or mandatory ceremony.",
    "practice_fr": "Le présenter comme une attestation locale de la coutume existante, non comme une nouvelle fête ou une cérémonie obligatoire.",
    "caution_en": "Do not imply a universally scheduled nocturnal vigil or cemetery event. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Ne pas supposer une veillée nocturne ou une cérémonie organisée dans chaque cimetière. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "ALL_SOULS_NOV2_CALENDAR"
  },
  {
    "variant_id": "AO-CUST-VAR-021",
    "parent_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-137",
    "source_observation_ids": [
      "WEI58-26-017"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 312,
    "region_en": "Philippines",
    "region_fr": "Philippines (témoignage historique)",
    "title_en": "Grave care and novena in the Philippines",
    "title_fr": "Soin des tombes et neuvaine aux Philippines",
    "history_en": "Philippine historical reports describe preparing graves and a sequence of prayers ahead of the All Souls commemoration.",
    "history_fr": "Des récits historiques philippins décrivent la préparation des tombes et une série de prières avant le jour des Défunts.",
    "practice_en": "Grave maintenance is a cemetery custom; the novena is a separate prayer sequence that belongs with Prayer content.",
    "practice_fr": "L'entretien des tombes est une coutume de cimetière ; la neuvaine est une suite de prières distincte, à présenter dans le module Prière.",
    "caution_en": "The novena and the grave repairs are distinguishable actions; local scheduling is not established. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "La neuvaine et l'entretien des tombes sont des gestes distincts ; aucune date locale précise n'est garantie. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "ALL_SAINTS_SOULS_PERIOD"
  },
  {
    "variant_id": "AO-CUST-VAR-022",
    "parent_id": "NDAY-001",
    "source_group_id": "CAT-WEISER-B-177",
    "source_observation_ids": [
      "WEI58-28-018"
    ],
    "source_url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
    "source_book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
    "source_printed_page": 338,
    "region_en": "Central European historic",
    "region_fr": "Europe centrale (usage historique)",
    "title_en": "Saint Anne's feast as a personal name day",
    "title_fr": "La fête de sainte Anne comme fête du prénom",
    "history_en": "Historical European family celebrations associated Saint Anne's feast with women bearing her name.",
    "history_fr": "Dans des usages familiaux européens anciens, la fête de sainte Anne était particulièrement célébrée par les personnes portant son prénom.",
    "practice_en": "Show this only for someone whose baptismal patron is Saint Anne, as an example of the existing personal name-day custom.",
    "practice_fr": "Ne présenter cet exemple qu'à la personne ayant sainte Anne pour patronne de baptême, au titre de la coutume existante de fête du prénom.",
    "caution_en": "A regional name-day custom is not itself a prescribed rite or universal holiday. The 1958 historical description alone does not establish continued practice in every locality.",
    "caution_fr": "Une fête du prénom régionale n'est ni un rite prescrit ni un jour chômé universel. Le témoignage historique de 1958 n'établit pas à lui seul la permanence de cet usage dans toutes les localités.",
    "historically_attested": true,
    "publication_authorized": false,
    "current_practice_attestation": "NOT_CHECKED",
    "indulgence_grant_ids": [],
    "date_authority": "RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT",
    "anchor_key": "ST_ANNE_NAME_DAY_JUL26"
  }
];
export const CUSTOMS_EXISTING_VARIANT_TOTAL=22;
export const CUSTOMS_EXISTING_VARIANT_OWNER_TOTAL=12;
const allowedIds=new Set();
for(const row of RAW_VARIANTS){
 if(allowedIds.has(row.variant_id)||!row.parent_id||!row.source_group_id||
    !row.title_en||!row.title_fr||!row.history_en||!row.history_fr||
    !row.practice_en||!row.practice_fr||!row.caution_en||!row.caution_fr||
    !row.region_en||!row.region_fr||!/^https:\/\//.test(row.source_url)||
    !Number.isInteger(row.source_printed_page)||row.source_printed_page<1||
    row.publication_authorized!==false||row.historically_attested!==true||
    row.current_practice_attestation!=="NOT_CHECKED"||
    row.indulgence_grant_ids.length!==0||
    row.date_authority!=="RESOLVE_FROM_EXISTING_1962_CALENDAR_OR_REAL_LOCAL_EVENT")
   throw new Error("Unsafe historical Customs variant "+row.variant_id);
 allowedIds.add(row.variant_id);
 Object.freeze(row);
}
if(RAW_VARIANTS.length!==CUSTOMS_EXISTING_VARIANT_TOTAL||
   new Set(RAW_VARIANTS.map(r=>r.parent_id)).size!==CUSTOMS_EXISTING_VARIANT_OWNER_TOTAL)
 throw new Error("Customs research variant cardinality changed");
Object.freeze(RAW_VARIANTS);

/**
 * Read-only editorial projection. Region strings are historical source scopes,
 * NOT country entitlements or current user locations. No date or region is
 * inferred from the user's locale, IP address, or the Calendar date.
 */
export function calendarCustomHistoricalVariantPreview(parentId,{fr=false}={}){
 if(typeof parentId!=="string")return Object.freeze([]);
 return Object.freeze(RAW_VARIANTS.filter(r=>r.parent_id===parentId).map(r=>Object.freeze({
  id:r.variant_id,
  parent_id:r.parent_id,
  title:fr?r.title_fr:r.title_en,
  history:fr?r.history_fr:r.history_en,
  optional_practice:fr?r.practice_fr:r.practice_en,
  caution:fr?r.caution_fr:r.caution_en,
  historical_region:fr?r.region_fr:r.region_en,
  source:Object.freeze({book:r.source_book,url:r.source_url,printed_page:r.source_printed_page,
    observation_ids:Object.freeze([...r.source_observation_ids]),
    source_group_id:r.source_group_id}),
  editorial_preview_only:true,
  current_local_event_confirmed:false,
  current_regional_practice_verified:false,
  no_calendar_event:true,
  no_new_canonical_card:true,
  indulgence_grants:Object.freeze([])
 })));
}
