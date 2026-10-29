/* Historical regional variations of 12 existing published Calendar Customs.
 * Source: draft research PR #1723, 2026-10-29, 22 bilingual variant dossiers.
 * No additional custom IDs, liturgical dates, local-service announcements or
 * indulgence grants. This is presented as historical evidence, NOT a direction
 * to perform a priestly blessing or to assume present local continuity.
 * The distinct 18 unpublished candidate profiles are explicitly excluded.
 */
const HISTORICAL_VARIANTS = Object.freeze([
  {
    "id": "AO-CUST-VAR-001",
    "parent_custom_id": "DEAD-003",
    "source_group_id": "CAT-WEISER-A-007",
    "title": {
      "en": "Prayer for the departed on Mondays",
      "fr": "Prière pour les défunts le lundi"
    },
    "historical_context": {
      "en": "In some Catholic households, Monday was devoted to remembering the faithful departed.",
      "fr": "Dans certains foyers catholiques, le lundi était consacré au souvenir des fidèles défunts."
    },
    "regional_practice_or_context": {
      "en": "A family may pray for its departed members on a Monday; this is optional, not a new liturgical obligation.",
      "fr": "Une famille peut prier le lundi pour ses défunts ; c'est une pratique facultative, non une nouvelle obligation liturgique."
    },
    "geography": [
      "Latin Catholic"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 27,
      "observation_ids": [
        "WEI58-02-004"
      ]
    },
    "category": "OPTIONAL_RECURRING_DOMESTIC",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-002",
    "parent_custom_id": "DEAD-003",
    "source_group_id": "CAT-WEISER-A-016",
    "title": {
      "en": "Remembering the dead on Ember days",
      "fr": "Prier pour les défunts aux Quatre-Temps"
    },
    "historical_context": {
      "en": "Historical accounts also associate Ember days with Masses and prayers for the departed.",
      "fr": "Les sources historiques associent aussi les Quatre-Temps à des messes et à des prières pour les défunts."
    },
    "regional_practice_or_context": {
      "en": "The existing prayer-for-the-dead entry may mention this seasonal intention; it does not prescribe a new Ember-day rite.",
      "fr": "La notice de prière pour les défunts peut rappeler cette intention saisonnière, sans prescrire un nouveau rite des Quatre-Temps."
    },
    "geography": [
      "Catholic Europe"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 36,
      "observation_ids": [
        "WEI58-03-005"
      ]
    },
    "category": "HISTORICAL_DATE_VARIANT",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-003",
    "parent_custom_id": "ADVT-001",
    "source_group_id": "CAT-WEISER-A-023",
    "title": {
      "en": "Lighting the Advent wreath as a family",
      "fr": "Allumer la couronne de l'Avent en famille"
    },
    "historical_context": {
      "en": "In some European families, a designated child lit the Advent wreath candle.",
      "fr": "Dans certains foyers européens, un enfant désigné allumait la bougie de la couronne de l'Avent."
    },
    "regional_practice_or_context": {
      "en": "As an optional family custom, a child may light the candle with adult supervision; the Calendar determines the Advent Sundays.",
      "fr": "Selon l'usage familial, un enfant peut allumer la bougie sous la surveillance d'un adulte ; les dimanches de l'Avent sont déterminés par le Calendrier."
    },
    "geography": [
      "Some European places"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 55,
      "observation_ids": [
        "WEI58-05-003"
      ]
    },
    "category": "OPTIONAL_FAMILY_COMPONENT",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-004",
    "parent_custom_id": "BLSS-003",
    "source_group_id": "CAT-WEISER-A-076",
    "title": {
      "en": "Using blessed Saint John's wine",
      "fr": "Usage du vin bénit de saint Jean"
    },
    "historical_context": {
      "en": "Central European traditions used wine blessed on Saint John's feast at family meals and important life moments.",
      "fr": "En Europe centrale, du vin bénit à la fête de saint Jean était utilisé aux repas familiaux et à certains moments importants de la vie."
    },
    "regional_practice_or_context": {
      "en": "This is an historical use of an already blessed object, not a blessing for the household to improvise; follow local practice.",
      "fr": "Il s'agit de l'usage historique d'un vin déjà bénit, non d'une bénédiction à improviser au foyer ; suivre l'usage local."
    },
    "geography": [
      "Central Europe"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 130,
      "observation_ids": [
        "WEI58-10-014"
      ]
    },
    "category": "HISTORICAL_BLESSED_OBJECT_USE",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-005",
    "parent_custom_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-003",
    "title": {
      "en": "Visiting family graves on Palm Sunday",
      "fr": "Visiter les tombes familiales le dimanche des Rameaux"
    },
    "historical_context": {
      "en": "Historical churchyard processions in parts of France and England were associated with visits to family graves.",
      "fr": "Des processions anciennes dans les cimetières attenants aux églises, notamment en France et en Angleterre, s'accompagnaient de visites aux tombes familiales."
    },
    "regional_practice_or_context": {
      "en": "The cemetery-visit article may note this regional timing without replacing the Palm Sunday liturgy.",
      "fr": "La notice sur la visite au cimetière peut mentionner cet usage régional sans se substituer à la liturgie des Rameaux."
    },
    "geography": [
      "France and England (reported historical)"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 190,
      "observation_ids": [
        "WEI58-15-005"
      ]
    },
    "category": "HISTORICAL_LOCAL_DATE_VARIANT",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-006",
    "parent_custom_id": "DOM-013",
    "source_group_id": "CAT-WEISER-B-006",
    "title": {
      "en": "Keeping blessed palms on farms",
      "fr": "Conserver les rameaux bénits dans les fermes"
    },
    "historical_context": {
      "en": "In some central and eastern European regions, Palm Sunday branches were placed in farm buildings and fields.",
      "fr": "Dans certaines régions d'Europe centrale et orientale, des rameaux des Rameaux étaient placés dans les bâtiments agricoles et les champs."
    },
    "regional_practice_or_context": {
      "en": "This is a regional use of already blessed branches; no promised protection against weather or illness should be inferred.",
      "fr": "Il s'agit d'un usage régional de rameaux déjà bénits ; aucune protection garantie contre les intempéries ou la maladie ne doit être suggérée."
    },
    "geography": [
      "Austria Bavaria Slavic regions"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 192,
      "observation_ids": [
        "WEI58-15-010"
      ]
    },
    "category": "HISTORICAL_REGIONAL_OBJECT_USE",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-007",
    "parent_custom_id": "BLSS-004",
    "source_group_id": "CAT-WEISER-B-018",
    "title": {
      "en": "Easter foods blessed in the home",
      "fr": "Bénédiction des aliments de Pâques à domicile"
    },
    "historical_context": {
      "en": "In certain central European villages, priests historically visited households to bless Easter foods on Holy Saturday.",
      "fr": "Dans certains villages d'Europe centrale, des prêtres passaient autrefois dans les foyers pour bénir les aliments de Pâques le Samedi saint."
    },
    "regional_practice_or_context": {
      "en": "This records a priestly local variant, not permission for a family to perform the clerical blessing or a promise of a parish visit.",
      "fr": "Cette variante locale concerne une bénédiction sacerdotale ; elle n'autorise pas la famille à accomplir le rite et ne suppose aucune visite paroissiale."
    },
    "geography": [
      "Certain Central European villages"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 208,
      "observation_ids": [
        "WEI58-15-037"
      ]
    },
    "category": "HISTORICAL_CLERICAL_VARIANT",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-008",
    "parent_custom_id": "EAST-001",
    "source_group_id": "CAT-WEISER-B-033",
    "title": {
      "en": "Easter Monday visits to grandparents",
      "fr": "Visiter les grands-parents le lundi de Pâques"
    },
    "historical_context": {
      "en": "French-Canadian examples describe Easter Monday visits to grandparents as part of the family celebration.",
      "fr": "Des témoignages canadiens-français décrivent la visite aux grands-parents le lundi de Pâques dans le cadre de la fête familiale."
    },
    "regional_practice_or_context": {
      "en": "The existing Emmaus-walk entry can offer this as an alternative regional family visit, not a universal practice.",
      "fr": "La notice sur la promenade d'Emmaüs peut présenter cette visite familiale régionale comme une variante, non comme un usage universel."
    },
    "geography": [
      "French Canada"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 223,
      "observation_ids": [
        "WEI58-16-029"
      ]
    },
    "category": "OPTIONAL_FAMILY_VARIANT",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-009",
    "parent_custom_id": "BLSS-004",
    "source_group_id": "CAT-WEISER-B-044",
    "title": {
      "en": "Paska among Easter foods",
      "fr": "La paska parmi les aliments de Pâques"
    },
    "historical_context": {
      "en": "Cross-marked paska breads appear among the traditional foods prepared in several Slavic households for Easter.",
      "fr": "Des pains de Pâques marqués d'une croix, appelés paska, figurent parmi les aliments traditionnels de plusieurs régions slaves."
    },
    "regional_practice_or_context": {
      "en": "Preparing a regional Easter bread is distinct from the priest's blessing of Easter foods; local recipes and dates vary.",
      "fr": "Préparer un pain pascal régional se distingue de la bénédiction sacerdotale des aliments ; recettes et dates varient localement."
    },
    "geography": [
      "Ukraine, Poland, other Slavic homes"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 238,
      "observation_ids": [
        "WEI58-17-023"
      ]
    },
    "category": "HISTORICAL_REGIONAL_FOOD",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-010",
    "parent_custom_id": "CORP-001",
    "source_group_id": "CAT-WEISER-B-076",
    "title": {
      "en": "Corpus Christi windows with lights and images",
      "fr": "Fenêtres ornées pour la Fête-Dieu"
    },
    "historical_context": {
      "en": "Historical Corpus Christi processions passed homes whose windows displayed candles and sacred images.",
      "fr": "Dans des usages anciens de la Fête-Dieu, des fenêtres donnant sur le parcours de la procession étaient ornées de cierges et d'images saintes."
    },
    "regional_practice_or_context": {
      "en": "This may enrich the existing procession-decoration custom where a local route is actually announced.",
      "fr": "Cette pratique peut enrichir la notice sur la décoration du parcours lorsqu'une procession locale est effectivement annoncée."
    },
    "geography": [
      "France Spain Portugal Belgium Italy and elsewhere"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 262,
      "observation_ids": [
        "WEI58-21-007"
      ]
    },
    "category": "LOCAL_PROCESSION_ROUTE_DECOR",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-011",
    "parent_custom_id": "CORP-001",
    "source_group_id": "CAT-WEISER-B-077",
    "title": {
      "en": "Greenery beside the Corpus Christi route",
      "fr": "Verdure sur le parcours de la Fête-Dieu"
    },
    "historical_context": {
      "en": "Birch and other greenery decorated homes and routes in some central and northern European Corpus Christi celebrations.",
      "fr": "Dans certaines régions d'Europe centrale et septentrionale, des rameaux de bouleau et d'autres verdures ornaient les maisons et les parcours de la Fête-Dieu."
    },
    "regional_practice_or_context": {
      "en": "Describe this as a local form of procession decoration, never a prescribed part of the Mass.",
      "fr": "Présenter cette verdure comme une variante locale de la décoration processionnelle, jamais comme une prescription de la messe."
    },
    "geography": [
      "Central and Northern Europe"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 262,
      "observation_ids": [
        "WEI58-21-008"
      ]
    },
    "category": "LOCAL_PROCESSION_ROUTE_DECOR",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-012",
    "parent_custom_id": "CORP-001",
    "source_group_id": "CAT-WEISER-B-084",
    "title": {
      "en": "Flower wreaths for Corpus Christi",
      "fr": "Couronnes de fleurs pour la Fête-Dieu"
    },
    "historical_context": {
      "en": "Flower wreaths, banners and bouquets have adorned Corpus Christi homes and processions in historical regional practice.",
      "fr": "Des couronnes de fleurs, bannières et bouquets ont orné les maisons et processions de la Fête-Dieu dans divers usages régionaux."
    },
    "regional_practice_or_context": {
      "en": "The wreath is a decoration; any separate priestly blessing belongs to the appropriate local rite.",
      "fr": "La couronne sert de décoration ; une éventuelle bénédiction sacerdotale relève d'un rite local distinct."
    },
    "geography": [
      "Central Europe and France"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 265,
      "observation_ids": [
        "WEI58-21-018"
      ]
    },
    "category": "LOCAL_PROCESSION_ROUTE_DECOR",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-013",
    "parent_custom_id": "PATR-001",
    "source_group_id": "CAT-WEISER-B-095",
    "title": {
      "en": "The local patronal feast",
      "fr": "La fête patronale locale"
    },
    "historical_context": {
      "en": "The Kirchweih or Kirmes of German-speaking communities may combine a parish dedication or patronal celebration with civic festivities.",
      "fr": "La Kirchweih ou Kirmes des régions germanophones peut associer la fête de dédicace ou patronale de la paroisse à des réjouissances civiles."
    },
    "regional_practice_or_context": {
      "en": "Attach this as regional history to the existing patronal custom; the actual dedication or patronal date must be resolved locally.",
      "fr": "Rattacher cette variante historique à la coutume patronale existante ; la date réelle de dédicace ou du patron doit être connue localement."
    },
    "geography": [
      "Germany, Hungary, Slovakia, Ukraine, Spain"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 279,
      "observation_ids": [
        "WEI58-23-007"
      ]
    },
    "category": "HISTORICAL_PATRONAL_VARIANT",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-014",
    "parent_custom_id": "NDAY-001",
    "source_group_id": "CAT-WEISER-B-096",
    "title": {
      "en": "Family privileges on a name day",
      "fr": "Petites attentions familiales le jour de fête"
    },
    "historical_context": {
      "en": "Some European households celebrated a baptismal patron's feast with small gifts and relief from ordinary chores.",
      "fr": "Dans certains foyers européens, la fête du saint patron de baptême donnait lieu à de petits cadeaux et à une dispense de tâches habituelles."
    },
    "regional_practice_or_context": {
      "en": "This is an optional family variation of the existing name-day custom, not a public holiday.",
      "fr": "C'est une variante familiale facultative de la fête du saint patron, non un jour férié."
    },
    "geography": [
      "European Catholic families"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 280,
      "observation_ids": [
        "WEI58-23-010"
      ]
    },
    "category": "OPTIONAL_NAME_DAY_COMPONENT",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-015",
    "parent_custom_id": "DEV-006",
    "source_group_id": "CAT-WEISER-B-097",
    "title": {
      "en": "Pilgrimage on a martyr's anniversary",
      "fr": "Pèlerinage à l'anniversaire d'un martyr"
    },
    "historical_context": {
      "en": "Early Christians sometimes visited martyrs' tombs on the anniversary of their death.",
      "fr": "Dans l'Église ancienne, des fidèles visitaient parfois les tombes des martyrs au jour anniversaire de leur mort."
    },
    "regional_practice_or_context": {
      "en": "This is historical background to shrine pilgrimage, not a present-day recommendation to enter inaccessible tombs.",
      "fr": "Il s'agit d'un rappel historique lié au pèlerinage, non d'une invitation actuelle à pénétrer dans des tombeaux inaccessibles."
    },
    "geography": [
      "Early and medieval Christian church"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 282,
      "observation_ids": [
        "WEI58-23-014"
      ]
    },
    "category": "HISTORICAL_PILGRIMAGE_CONTEXT",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-016",
    "parent_custom_id": "MARI-001",
    "source_group_id": "CAT-WEISER-B-101",
    "title": {
      "en": "Assumption procession through the fields",
      "fr": "Procession de l'Assomption à travers les champs"
    },
    "historical_context": {
      "en": "In Austrian and nearby communities, historical Marian processions on the Assumption included prayer through agricultural land.",
      "fr": "En Autriche et dans des régions voisines, des processions mariales historiques de l'Assomption traversaient les terres agricoles dans la prière."
    },
    "regional_practice_or_context": {
      "en": "This is a local form of Assumption procession, not a universal parish itinerary or a lay substitute for a priestly blessing.",
      "fr": "C'est une forme locale de procession de l'Assomption, ni un itinéraire paroissial universel ni un remplacement laïc d'une bénédiction sacerdotale."
    },
    "geography": [
      "Austria and Central Europe"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 289,
      "observation_ids": [
        "WEI58-24-004"
      ]
    },
    "category": "HISTORICAL_LOCAL_PROCESSION",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-017",
    "parent_custom_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-130",
    "title": {
      "en": "Preparing family graves before All Souls",
      "fr": "Préparer les tombes familiales avant les défunts"
    },
    "historical_context": {
      "en": "Cleaning and decorating graves before the commemoration of the faithful departed is historically documented in Catholic communities.",
      "fr": "Le nettoyage et l'ornement des tombes avant la commémoration des fidèles défunts sont attestés dans des communautés catholiques."
    },
    "regional_practice_or_context": {
      "en": "A family may care for a grave and pray for the deceased; cemetery regulations and local conditions still apply.",
      "fr": "Une famille peut entretenir une tombe et prier pour le défunt, dans le respect des règles du cimetière et des conditions locales."
    },
    "geography": [
      "Catholic European communities"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 310,
      "observation_ids": [
        "WEI58-26-010"
      ]
    },
    "category": "OPTIONAL_CEMETERY_PREPARATION",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-018",
    "parent_custom_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-131",
    "title": {
      "en": "Lights at family graves",
      "fr": "Lumières sur les tombes familiales"
    },
    "historical_context": {
      "en": "Candles and small protected lanterns were placed by graves around All Saints and All Souls in central Europe.",
      "fr": "En Europe centrale, on plaçait des cierges et de petites lanternes protégées près des tombes autour de la Toussaint et du jour des Défunts."
    },
    "regional_practice_or_context": {
      "en": "This is a regional remembrance practice, subject to cemetery fire restrictions; a candle itself does not establish an indulgence.",
      "fr": "C'est un usage régional de souvenir, soumis aux règles de sécurité du cimetière ; un cierge n'établit pas à lui seul une indulgence."
    },
    "geography": [
      "Central European Catholic countries"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 311,
      "observation_ids": [
        "WEI58-26-011"
      ]
    },
    "category": "OPTIONAL_CEMETERY_LIGHTS",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-019",
    "parent_custom_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-135",
    "title": {
      "en": "All Souls cemetery prayers in Brazil",
      "fr": "Prières au cimetière pour les Défunts au Brésil"
    },
    "historical_context": {
      "en": "Historical Brazilian accounts describe graveside visits, candles and prayer on All Souls.",
      "fr": "Des témoignages brésiliens anciens décrivent la visite au cimetière, les cierges et la prière le jour des Défunts."
    },
    "regional_practice_or_context": {
      "en": "Offer this as a Brazilian illustration of the existing prayerful cemetery visit, not as an automatically scheduled parish vigil.",
      "fr": "Présenter cet usage comme une illustration brésilienne de la visite priante au cimetière, sans annoncer automatiquement une veillée paroissiale."
    },
    "geography": [
      "Brazil"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 311,
      "observation_ids": [
        "WEI58-26-015"
      ]
    },
    "category": "HISTORICAL_BRAZILIAN_VARIANT",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-020",
    "parent_custom_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-136",
    "title": {
      "en": "All Souls grave visits in Puerto Rico",
      "fr": "Visites aux tombes pour les Défunts à Porto Rico"
    },
    "historical_context": {
      "en": "Historical Puerto Rican custom included cemetery visits with flowers and prayers for departed relatives.",
      "fr": "Un usage ancien de Porto Rico associait la visite au cimetière, les fleurs et la prière pour les proches défunts."
    },
    "regional_practice_or_context": {
      "en": "Treat it as local evidence supporting the existing cemetery-visit custom, not a new feast or mandatory ceremony.",
      "fr": "Le présenter comme une attestation locale de la coutume existante, non comme une nouvelle fête ou une cérémonie obligatoire."
    },
    "geography": [
      "Puerto Rico"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 311,
      "observation_ids": [
        "WEI58-26-016"
      ]
    },
    "category": "HISTORICAL_PUERTO_RICAN_VARIANT",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-021",
    "parent_custom_id": "DEAD-001",
    "source_group_id": "CAT-WEISER-B-137",
    "title": {
      "en": "Grave care and novena in the Philippines",
      "fr": "Soin des tombes et neuvaine aux Philippines"
    },
    "historical_context": {
      "en": "Philippine historical reports describe preparing graves and a sequence of prayers ahead of the All Souls commemoration.",
      "fr": "Des récits historiques philippins décrivent la préparation des tombes et une série de prières avant le jour des Défunts."
    },
    "regional_practice_or_context": {
      "en": "Grave maintenance is a cemetery custom; the novena is a separate prayer sequence that belongs with Prayer content.",
      "fr": "L'entretien des tombes est une coutume de cimetière ; la neuvaine est une suite de prières distincte, à présenter dans le module Prière."
    },
    "geography": [
      "Philippines"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 312,
      "observation_ids": [
        "WEI58-26-017"
      ]
    },
    "category": "CEMETERY_COMPONENT_PRAYER_SEPARATE",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  },
  {
    "id": "AO-CUST-VAR-022",
    "parent_custom_id": "NDAY-001",
    "source_group_id": "CAT-WEISER-B-177",
    "title": {
      "en": "Saint Anne's feast as a personal name day",
      "fr": "La fête de sainte Anne comme fête du prénom"
    },
    "historical_context": {
      "en": "Historical European family celebrations associated Saint Anne's feast with women bearing her name.",
      "fr": "Dans des usages familiaux européens anciens, la fête de sainte Anne était particulièrement célébrée par les personnes portant son prénom."
    },
    "regional_practice_or_context": {
      "en": "Show this only for someone whose baptismal patron is Saint Anne, as an example of the existing personal name-day custom.",
      "fr": "Ne présenter cet exemple qu'à la personne ayant sainte Anne pour patronne de baptême, au titre de la coutume existante de fête du prénom."
    },
    "geography": [
      "Central European historic"
    ],
    "source": {
      "book": "Francis X. Weiser, Handbook of Christian Feasts and Customs (1958)",
      "url": "https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf",
      "printed_page": 338,
      "observation_ids": [
        "WEI58-28-018"
      ]
    },
    "category": "PERSONAL_PATRON_CONDITION",
    "historical_context_only": true,
    "no_new_custom_card": true,
    "no_claim_of_current_local_availability": true,
    "is_1962_rubric_authorized": false,
    "current_indulgence_associated": false
  }
].map(row=>Object.freeze({
  ...row,
  title:Object.freeze(row.title),
  historical_context:Object.freeze(row.historical_context),
  regional_practice_or_context:Object.freeze(row.regional_practice_or_context),
  geography:Object.freeze(row.geography),
  source:Object.freeze({...row.source,observation_ids:Object.freeze(row.source.observation_ids)})
})));
const BY_PARENT=new Map();
for(const entry of HISTORICAL_VARIANTS){
 if(!BY_PARENT.has(entry.parent_custom_id))BY_PARENT.set(entry.parent_custom_id,[]);
 BY_PARENT.get(entry.parent_custom_id).push(entry);
}
for(const [parent,entries] of BY_PARENT)BY_PARENT.set(parent,Object.freeze(entries));
export const CALENDAR_HISTORICAL_CUSTOM_VARIANT_COUNT=HISTORICAL_VARIANTS.length;
export const CALENDAR_HISTORICAL_CUSTOM_PARENT_COUNT=BY_PARENT.size;
export const calendarHistoricalCustomVariantIds=()=>Object.freeze(HISTORICAL_VARIANTS.map(r=>r.id));
/** Bilingual regional observations nested inside an existing canonical article. */
export function calendarCustomHistoricalVariants(parentCustomId,{fr=false}={}){
 if(typeof parentCustomId!=="string")return Object.freeze([]);
 const lang=fr?"fr":"en";
 return Object.freeze((BY_PARENT.get(parentCustomId)||[]).map(row=>Object.freeze({
   id:row.id,
   source_group_id:row.source_group_id,
   parent_custom_id:row.parent_custom_id,
   title:row.title[lang],
   history:row.historical_context[lang],
   context_or_practice:row.regional_practice_or_context[lang],
   geography:row.geography,
   source:row.source,
   is_historical_source_observation:true,
   current_local_practice_not_verified:true,
   is_1962_liturgical_rubric:false,
   is_current_parish_announcement:false,
   associated_indulgence:false,
   is_extra_custom_card:false
 })));
}
