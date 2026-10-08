/** Rosary Guide: original concise explanatory prose with sources attached to every paragraph. */
export const ROSARY_GUIDE_V1=Object.freeze([
  {
    "heading": {
      "en": "The traditional fifteen mysteries",
      "fr": "Les quinze mystères traditionnels"
    },
    "body": {
      "en": "The traditional Rosary contemplates fifteen mysteries in three groups: Joyful, Sorrowful and Glorious. Five decades form one customary daily portion of this fifteen-decade Rosary.",
      "fr": "Le Rosaire traditionnel médite quinze mystères répartis en trois séries : joyeux, douloureux et glorieux. Cinq dizaines forment une partie habituelle du Rosaire complet de quinze dizaines."
    },
    "source": {
      "url": "https://www.newadvent.org/cathen/13184b.htm",
      "label": "Catholic Encyclopedia · Rosary"
    }
  },
  {
    "heading": {
      "en": "Prayer and contemplation",
      "fr": "Prière et contemplation"
    },
    "body": {
      "en": "The repeated Our Fathers and Hail Marys accompany contemplation of Christ’s life, Passion and glory. Attention to the mystery matters more than achieving a fast count of beads.",
      "fr": "La répétition des Notre Père et des Je vous salue Marie accompagne la contemplation de la vie, de la Passion et de la gloire du Christ. L’attention au mystère prime sur le comptage rapide des grains."
    },
    "source": {
      "url": "https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_01091883_supremi-apostolatus-officio.html",
      "label": "Leo XIII · Supremi apostolatus officio"
    }
  },
  {
    "heading": {
      "en": "Historical development and St Dominic",
      "fr": "Développement historique et saint Dominique"
    },
    "body": {
      "en": "The Dominican Order powerfully promoted the Rosary. Traditional accounts attribute its preaching to St Dominic, but historians distinguish this devotional tradition from the later documented development of fixed mysteries and confraternities.",
      "fr": "L’Ordre dominicain a largement répandu le Rosaire. La tradition attribue sa prédication à saint Dominique, mais l’histoire distingue ce récit pieux de l’évolution ultérieure attestée des mystères fixés et des confréries."
    },
    "source": {
      "url": "https://www.newadvent.org/cathen/13184b.htm",
      "label": "Catholic Encyclopedia · Rosary"
    }
  },
  {
    "heading": {
      "en": "Praying individually or together",
      "fr": "Prier seul ou en groupe"
    },
    "body": {
      "en": "One person can recite the entire Rosary. In a group, the leader and congregation share the prayers according to local custom, with clear versicles and responses where the text provides them; prayer remains more important than controlling the interface.",
      "fr": "Une personne peut réciter tout le Rosaire. En groupe, celui qui conduit et les fidèles se répartissent les prières selon l’usage, en distinguant les versets et répons lorsque le texte le prévoit ; l’interface doit rester secondaire."
    },
    "source": {
      "url": "https://www.vatican.va/content/dam/wss/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20020513_vers-direttorio_en.html",
      "label": "Directory on Popular Piety, §§197–202"
    }
  },
  {
    "heading": {
      "en": "Simple and Guided modes",
      "fr": "Modes Simple et Guidé"
    },
    "body": {
      "en": "Simple mode keeps familiar prayer words foregrounded. Guided mode can help with a short Gospel passage, the mystery’s meaning and a moment of recollection. Neither mode is a stopwatch or a judgment of spiritual progress.",
      "fr": "Le mode Simple privilégie les paroles familières des prières. Le mode Guidé peut aider par un bref passage de l’Évangile, le sens du mystère et un temps de recueillement. Aucun mode n’est un chronomètre ni un jugement du progrès spirituel."
    },
    "source": {
      "url": "https://www.vatican.va/content/john-paul-ii/en/apost_letters/2002/documents/hf_jp-ii_apl_20021016_rosarium-virginis-mariae.html",
      "label": "Rosarium Virginis Mariae, §§29–31"
    }
  },
  {
    "heading": {
      "en": "Later optional Luminous Mysteries",
      "fr": "Mystères lumineux : ajout facultatif ultérieur"
    },
    "body": {
      "en": "In 2002 John Paul II proposed five Luminous Mysteries as an optional addition, explicitly leaving their use to individuals and communities. They do not replace the traditional Joyful, Sorrowful and Glorious groups.",
      "fr": "En 2002, Jean-Paul II a proposé cinq mystères lumineux comme ajout facultatif, en laissant leur usage à la liberté des personnes et des communautés. Ils ne remplacent pas les groupes traditionnels joyeux, douloureux et glorieux."
    },
    "source": {
      "url": "https://www.vatican.va/content/john-paul-ii/en/apost_letters/2002/documents/hf_jp-ii_apl_20021016_rosarium-virginis-mariae.html",
      "label": "Rosarium Virginis Mariae, §19"
    }
  }
]);
export function rosaryGuideSections(language="en"){
 const lang=language==="fr"?"fr":"en";
 return ROSARY_GUIDE_V1.map(entry=>({heading:entry.heading[lang],body:entry.body[lang],source:entry.source}));
}
