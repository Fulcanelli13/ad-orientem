/*
 * Living Catena reader question pilot. These are modern, provisional prompts,
 * not quotations by any Church Father and not certified doctrinal answers.
 * Every navigation target must be present verbatim in the canonical, selected,
 * hash-verified chapter pack; invalid/missing references are silently withheld.
 *
 * The editorial research registry and its human approvals remain separate.
 */
export const CATENA_READER_QUESTION_SCHEMA="ao.catena.reader-source-questions.v1";
export const CATENA_READER_QUESTION_ROWS=Object.freeze([
  {
    "id": "mat-sower-why",
    "sourcePointer": "catena.matthew.13.1:17",
    "father": "Chrysostom",
    "evidence": "the rock be made rich soil",
    "question": "Why does Christ sow His word even where it may not bear fruit?",
    "topic": "Sower",
    "sourceChunk": "matthew-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-sower-incarnation",
    "sourcePointer": "catena.matthew.13.1:12",
    "father": "Chrysostom",
    "evidence": "by His incarnation being brought nearer to us",
    "question": "What does it mean that the divine Sower went out?",
    "topic": "Incarnation",
    "sourceChunk": "matthew-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-net",
    "sourcePointer": "catena.matthew.13.47:4",
    "father": "Chrysostom",
    "evidence": "here, because of their evil life",
    "question": "How does the net differ from the tares and the sower?",
    "topic": "Net",
    "sourceChunk": "matthew-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-harvest",
    "sourcePointer": "catena.matthew.13.36:9",
    "father": "Chrysostom",
    "evidence": "two different things",
    "question": "Why can the harvest mean both conversion and the Last Judgment?",
    "topic": "Harvest",
    "sourceChunk": "matthew-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-leaven",
    "sourcePointer": "catena.matthew.16.5:4",
    "father": "Chrysostom",
    "evidence": "Because He would remind them",
    "question": "Why does Christ warn of the Pharisees using the image of leaven?",
    "topic": "Leaven",
    "sourceChunk": "matthew-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-sabbath",
    "sourcePointer": "catena.matthew.12.9:6",
    "father": "Augustine",
    "evidence": "they first asked the Lord",
    "question": "How does Augustine reconcile the Gospel accounts of the Sabbath healing?",
    "topic": "Sabbath",
    "sourceChunk": "matthew-09-12",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mark-son-of-god",
    "sourcePointer": "catena.mark.1.1:2",
    "father": "Bede",
    "evidence": "one Lord Jesus Christ, Son of God, and of man",
    "question": "Why does Mark begin by calling Jesus the Son of God?",
    "topic": "Son of God",
    "sourceChunk": "mark-01-04",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mark-sonship",
    "sourcePointer": "catena.mark.1.1:3",
    "father": "Hilary",
    "evidence": "by origin, not by adoption",
    "question": "How is Christ the Son of God differently from us?",
    "topic": "Divine Sonship",
    "sourceChunk": "mark-01-04",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mark-baptism",
    "sourcePointer": "catena.mark.1.9:1",
    "father": "Pseudo-Chrysostom",
    "evidence": "not baptized for the remission of sins",
    "question": "Why was the sinless Christ baptized by John?",
    "topic": "Baptism",
    "sourceChunk": "mark-01-04",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mark-baptism-spirit",
    "sourcePointer": "catena.mark.1.9:2",
    "father": "Bede",
    "evidence": "sanctifying the waters of Jordan",
    "question": "What does Christ’s baptism reveal about our baptism?",
    "topic": "Holy Spirit",
    "sourceChunk": "mark-01-04",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "luke-lost",
    "sourcePointer": "catena.luke.15.11:0",
    "father": "Ambrose",
    "evidence": "a threefold remedy",
    "question": "Why does Christ tell three parables about what was lost and found?",
    "topic": "Mercy",
    "sourceChunk": "luke-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "luke-far-country",
    "sourcePointer": "catena.luke.15.11:6",
    "father": "Chrysostom",
    "evidence": "not locally departing from God",
    "question": "What does the prodigal son’s distant country signify?",
    "topic": "Sin",
    "sourceChunk": "luke-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "luke-sheep-son",
    "sourcePointer": "catena.luke.15.11:1",
    "father": "Chrysostom",
    "evidence": "father receives his penitent son",
    "question": "How does the returning son differ from the lost sheep?",
    "topic": "Repentance",
    "sourceChunk": "luke-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "luke-famine",
    "sourcePointer": "catena.luke.15.11:8",
    "father": "Augustine",
    "evidence": "The famine is the want of the word of truth",
    "question": "Why does the prodigal son become impoverished away from his father?",
    "topic": "Truth",
    "sourceChunk": "luke-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-eternal-word",
    "sourcePointer": "catena.john.1.1:0",
    "father": "Chrysostom",
    "evidence": "speaks immediately of the Eternal Generation",
    "question": "Why does John begin with the eternal Word instead of Christ’s birth?",
    "topic": "Eternal Word",
    "sourceChunk": "john-01-04",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-word-meaning",
    "sourcePointer": "catena.john.1.1:1",
    "father": "Augustine",
    "evidence": "signifies both Word and Reason",
    "question": "Why is the Son of God called the Word?",
    "topic": "Word",
    "sourceChunk": "john-01-04",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-uncreated-word",
    "sourcePointer": "catena.john.1.1:3",
    "father": "Basil",
    "evidence": "This Word is not a human word",
    "question": "Is the divine Word a created word like ours?",
    "topic": "Uncreated Word",
    "sourceChunk": "john-01-04",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-door",
    "sourcePointer": "catena.john.10.1:3",
    "father": "Augustine",
    "evidence": "who enters by Christ",
    "question": "What does it mean to enter through Christ the door?",
    "topic": "Christ the Door",
    "sourceChunk": "john-09-12",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-shepherd",
    "sourcePointer": "catena.john.10.1:12",
    "father": "Chrysostom",
    "evidence": "He would lead all to the truth",
    "question": "Why does the Good Shepherd go before His sheep?",
    "topic": "Good Shepherd",
    "sourceChunk": "john-09-12",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-beatitudes",
    "sourcePointer": "catena.matthew.5.1:7",
    "father": "Augustine",
    "evidence": "greater commandments",
    "question": "Why does Christ teach a higher righteousness in the Sermon on the Mount?",
    "topic": "Beatitudes",
    "sourceChunk": "matthew-05-08",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-our-father",
    "sourcePointer": "catena.matthew.6.9:5",
    "father": "Cyprian",
    "evidence": "We say not My Father, but Our Father",
    "question": "Why does Jesus teach us to pray “Our Father” rather than “My Father”?",
    "topic": "Our Father",
    "sourceChunk": "matthew-05-08",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.matthew.6.9:4",
        "father": "Chrysostom",
        "evidence": "the forgiveness of sins, the adoption"
      }
    ]
  },
  {
    "id": "mat-prayer-words",
    "sourcePointer": "catena.matthew.6.9:1",
    "father": "Cyprian",
    "evidence": "taught us also to pray",
    "question": "Why should Christians pray with the words Christ Himself taught?",
    "topic": "Prayer",
    "sourceChunk": "matthew-05-08",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-prayer-adoption",
    "sourcePointer": "catena.matthew.6.9:4",
    "father": "Chrysostom",
    "evidence": "the forgiveness of sins, the adoption",
    "question": "What does calling God our Father imply about our adoption?",
    "topic": "Adoption",
    "sourceChunk": "matthew-05-08",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-hallowed",
    "sourcePointer": "catena.matthew.6.9:12",
    "father": "Augustine",
    "evidence": "may be held sacred of men",
    "question": "What are we asking when we pray that God's name be hallowed?",
    "topic": "Hallowed",
    "sourceChunk": "matthew-05-08",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-peter-confession",
    "sourcePointer": "catena.matthew.16.13:18",
    "father": "Hilary",
    "evidence": "from God came forth God the Son",
    "question": "What does Peter's confession teach about Christ's divine nature?",
    "topic": "Confession",
    "sourceChunk": "matthew-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-rock-church",
    "sourcePointer": "catena.matthew.16.13:30",
    "father": "Chrysostom",
    "evidence": "On this faith and confession I will build my Church",
    "question": "How does Christ's promise to build His Church relate to Peter's confession?",
    "topic": "Church",
    "sourceChunk": "matthew-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.matthew.16.13:18",
        "father": "Hilary",
        "evidence": "true and unalterable faith"
      }
    ]
  },
  {
    "id": "mat-gates-hell",
    "sourcePointer": "catena.matthew.16.13:34",
    "father": "Jerome",
    "evidence": "gates of hell to mean vice and sin",
    "question": "What are the gates of hell that will not prevail against the Church?",
    "topic": "Church",
    "sourceChunk": "matthew-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-forgiveness-limit",
    "sourcePointer": "catena.matthew.18.21:3",
    "father": "Chrysostom",
    "evidence": "something endless and ever enduring",
    "question": "Does Christ place a numerical limit on forgiving others?",
    "topic": "Forgiveness",
    "sourceChunk": "matthew-17-20",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.matthew.18.21:2",
        "father": "Augustine",
        "evidence": "how oft soever he sin against thee"
      }
    ]
  },
  {
    "id": "mat-forgive-often",
    "sourcePointer": "catena.matthew.18.21:2",
    "father": "Augustine",
    "evidence": "how oft soever he sin against thee",
    "question": "How often should a Christian forgive someone who sins against him?",
    "topic": "Mercy",
    "sourceChunk": "matthew-17-20",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-judgment-christ",
    "sourcePointer": "catena.matthew.25.31:3",
    "father": "Augustine",
    "evidence": "seen in human shape",
    "question": "How will Christ appear to the just and the wicked at judgment?",
    "topic": "Judgment",
    "sourceChunk": "matthew-25-28",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-last-supper",
    "sourcePointer": "catena.matthew.26.26:0",
    "father": "Jerome",
    "evidence": "true paschal sacrament",
    "question": "How does the Last Supper fulfil the Passover?",
    "topic": "Eucharist",
    "sourceChunk": "matthew-25-28",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.matthew.26.26:6",
        "father": "Ambrose",
        "evidence": "Melchisedech offered bread and wine"
      }
    ]
  },
  {
    "id": "mat-eucharist-unity",
    "sourcePointer": "catena.matthew.26.26:4",
    "father": "Augustine",
    "evidence": "mystery of our peace and unity",
    "question": "Why does Augustine connect Eucharistic bread with the unity of the Church?",
    "topic": "Unity",
    "sourceChunk": "matthew-25-28",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mat-melchizedek",
    "sourcePointer": "catena.matthew.26.26:6",
    "father": "Ambrose",
    "evidence": "Melchisedech offered bread and wine",
    "question": "How does Melchizedek prefigure Christ's offering at the Last Supper?",
    "topic": "Sacrifice",
    "sourceChunk": "matthew-25-28",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mark-children-humility",
    "sourcePointer": "catena.mark.10.13:1",
    "father": "Chrysostom",
    "evidence": "tread under foot worldly pride",
    "question": "Why does Christ welcome children despite the disciples' objections?",
    "topic": "Children",
    "sourceChunk": "mark-09-12",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mark-childlike",
    "sourcePointer": "catena.mark.10.13:5",
    "father": "Bede",
    "evidence": "innocence and purity of mind",
    "question": "What does it mean to receive God's kingdom like a little child?",
    "topic": "Humility",
    "sourceChunk": "mark-09-12",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.mark.10.13:4",
        "father": "Theophylact",
        "evidence": "harmlessness and simplicity"
      }
    ]
  },
  {
    "id": "mark-new-passover",
    "sourcePointer": "catena.mark.14.22:0",
    "father": "Bede",
    "evidence": "Sacrament of His own Body and Blood",
    "question": "How does the Eucharist replace the sacrifice of the old Passover?",
    "topic": "Passover",
    "sourceChunk": "mark-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "mark-real-body",
    "sourcePointer": "catena.mark.14.22:3",
    "father": "Theophylact",
    "evidence": "not a mere figure of the Body of Christ",
    "question": "Why does the Catena say Eucharistic bread is not merely a figure?",
    "topic": "Eucharist",
    "sourceChunk": "mark-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.mark.14.22:4",
        "father": "Chrysostom",
        "evidence": "not man who makes the offerings"
      }
    ]
  },
  {
    "id": "mark-consecration",
    "sourcePointer": "catena.mark.14.22:4",
    "father": "Chrysostom",
    "evidence": "not man who makes the offerings",
    "question": "Who brings about the consecration of Christ's Body and Blood?",
    "topic": "Consecration",
    "sourceChunk": "mark-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "luke-gabriel",
    "sourcePointer": "catena.luke.1.26:2",
    "father": "Gregory",
    "evidence": "the bearer of the highest of all tidings",
    "question": "Why was the Archangel Gabriel sent to announce Christ's birth?",
    "topic": "Annunciation",
    "sourceChunk": "luke-01-04",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "luke-virgin-birth",
    "sourcePointer": "catena.luke.1.26:5",
    "father": "Augustine",
    "evidence": "born according to the flesh of a virgin",
    "question": "What does Christ's birth from the Virgin Mary signify?",
    "topic": "Virgin Birth",
    "sourceChunk": "luke-01-04",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "luke-martha-mary",
    "sourcePointer": "catena.luke.10.38:12",
    "father": "Augustine",
    "evidence": "Not thine a bad one, but hers a better",
    "question": "Was Martha wrong to serve Christ while Mary listened to Him?",
    "topic": "Martha and Mary",
    "sourceChunk": "luke-09-12",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.luke.10.38:15",
        "father": "Gregory",
        "evidence": "contemplative life"
      }
    ]
  },
  {
    "id": "luke-contemplation",
    "sourcePointer": "catena.luke.10.38:15",
    "father": "Gregory",
    "evidence": "the contemplative life",
    "question": "How do Martha and Mary illustrate the active and contemplative lives?",
    "topic": "Contemplation",
    "sourceChunk": "luke-09-12",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "luke-pharisee-pride",
    "sourcePointer": "catena.luke.18.9:0",
    "father": "Augustine",
    "evidence": "concerning humility and against pride",
    "question": "What is Christ teaching through the Pharisee and the publican?",
    "topic": "Humility",
    "sourceChunk": "luke-17-20",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.luke.18.9:5",
        "father": "Augustine",
        "evidence": "His fault was not that he gave God thanks"
      }
    ]
  },
  {
    "id": "luke-pharisee-prayer",
    "sourcePointer": "catena.luke.18.9:5",
    "father": "Augustine",
    "evidence": "His fault was not that he gave God thanks",
    "question": "Why was the Pharisee's prayer condemned even though he thanked God?",
    "topic": "Prayer",
    "sourceChunk": "luke-17-20",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "luke-thief-pardon",
    "sourcePointer": "catena.luke.23.38:5",
    "father": "Ambrose",
    "evidence": "The Lord quickly pardons",
    "question": "Why did Christ promise Paradise to the penitent thief so quickly?",
    "topic": "Mercy",
    "sourceChunk": "luke-21-24",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.luke.23.38:7",
        "father": "Chrysostom",
        "evidence": "no one after his sins might despair"
      }
    ]
  },
  {
    "id": "luke-thief-hope",
    "sourcePointer": "catena.luke.23.38:7",
    "father": "Chrysostom",
    "evidence": "no one after his sins might despair",
    "question": "What does the good thief teach sinners about hope?",
    "topic": "Repentance",
    "sourceChunk": "luke-21-24",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "luke-thief-confession",
    "sourcePointer": "catena.luke.23.38:4",
    "father": "Gregory",
    "evidence": "nothing remained free from torture, but his heart and tongue",
    "question": "How could the thief confess his faith while nailed to the Cross?",
    "topic": "Faith",
    "sourceChunk": "luke-21-24",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "luke-emmaus",
    "sourcePointer": "catena.luke.24.13:8",
    "father": "Gregory",
    "evidence": "inwardly both loved and doubted",
    "question": "Why did the disciples fail to recognise the risen Christ on the road?",
    "topic": "Emmaus",
    "sourceChunk": "luke-21-24",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-nicodemus",
    "sourcePointer": "catena.john.3.1:3",
    "father": "Augustine",
    "evidence": "believed, but were not as yet born again",
    "question": "Why was Nicodemus' initial belief not yet the new birth?",
    "topic": "Nicodemus",
    "sourceChunk": "john-01-04",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-born-again",
    "sourcePointer": "catena.john.3.1:8",
    "father": "Chrysostom",
    "evidence": "spiritual begetting",
    "question": "What does Jesus mean when He says we must be born again?",
    "topic": "New Birth",
    "sourceChunk": "john-01-04",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-manna",
    "sourcePointer": "catena.john.6.47:5",
    "father": "Augustine",
    "evidence": "the bread the manna typified",
    "question": "How did the manna foreshadow the bread of life?",
    "topic": "Manna",
    "sourceChunk": "john-05-08",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.john.6.47:13",
        "father": "Bede",
        "evidence": "mystery of His Body and Blood"
      }
    ]
  },
  {
    "id": "john-bread-body",
    "sourcePointer": "catena.john.6.47:13",
    "father": "Bede",
    "evidence": "mystery of His Body and Blood",
    "question": "How is Christ's living bread connected to His Body and Blood?",
    "topic": "Eucharist",
    "sourceChunk": "john-05-08",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-sacrament-love",
    "sourcePointer": "catena.john.6.47:15",
    "father": "Augustine",
    "evidence": "O sacrament of mercy, O sign of unity",
    "question": "Why does Augustine call the Eucharist a sign of unity and bond of love?",
    "topic": "Communion",
    "sourceChunk": "john-05-08",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-resurrection",
    "sourcePointer": "catena.john.11.17:14",
    "father": "Chrysostom",
    "evidence": "I am the resurrection and the life",
    "question": "Why does Christ call Himself the Resurrection and the Life?",
    "topic": "Resurrection",
    "sourceChunk": "john-09-12",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.john.11.17:17",
        "father": "Augustine",
        "evidence": "For faith is the life of the soul"
      }
    ]
  },
  {
    "id": "john-faith-life",
    "sourcePointer": "catena.john.11.17:17",
    "father": "Augustine",
    "evidence": "For faith is the life of the soul",
    "question": "How can a believer live even though the body dies?",
    "topic": "Eternal Life",
    "sourceChunk": "john-09-12",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-vine-branches",
    "sourcePointer": "catena.john.15.1:1",
    "father": "Augustine",
    "evidence": "vine and the branches are of the same nature",
    "question": "How does the vine and its branches express our union with Christ?",
    "topic": "True Vine",
    "sourceChunk": "john-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-pruning",
    "sourcePointer": "catena.john.15.1:6",
    "father": "Chrysostom",
    "evidence": "tribulations and trials",
    "question": "Why does the Father prune branches that already bear fruit?",
    "topic": "Fruitfulness",
    "sourceChunk": "john-13-16",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.john.15.1:7",
        "father": "Augustine",
        "evidence": "the more fruitful they may be"
      }
    ]
  },
  {
    "id": "john-holy-spirit",
    "sourcePointer": "catena.john.20.19:16",
    "father": "Augustine",
    "evidence": "Holy Ghost proceeded not only from the Father, but the Son",
    "question": "What does Christ's breathing on the Apostles signify?",
    "topic": "Holy Spirit",
    "sourceChunk": "john-17-20",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  },
  {
    "id": "john-remit-sins",
    "sourcePointer": "catena.john.20.19:20",
    "father": "Gregory",
    "evidence": "retain some men’s sins, and remit others",
    "question": "How does Christ entrust the Apostles with authority to forgive sins?",
    "topic": "Remission",
    "sourceChunk": "john-17-20",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer",
    "related": [
      {
        "sourcePointer": "catena.john.20.19:18",
        "father": "Chrysostom",
        "evidence": "but to remit sins"
      }
    ]
  },
  {
    "id": "john-gift-forgiveness",
    "sourcePointer": "catena.john.20.19:18",
    "father": "Chrysostom",
    "evidence": "but to remit sins",
    "question": "Why does Christ speak of forgiving sins when He gives the Holy Spirit?",
    "topic": "Forgiveness",
    "sourceChunk": "john-17-20",
    "editorialStatus": "unapproved_reader_navigation_not_standalone_answer"
  }
].map(x=>Object.freeze(x)));
const ID=/^(catena\.(?:matthew|mark|luke|john)\.\d+\.\d+):(\d+)$/;
export function curatedCatenaReaderQuestions(rows,{limit=5}={}){
 if(!Array.isArray(rows)||!rows.length)return Object.freeze([]);
 const byId=new Map(rows.map(x=>[x.id,x]));
 const selected=[];
 for(const item of CATENA_READER_QUESTION_ROWS){
  const match=ID.exec(item.sourcePointer);
  if(!match)continue;
  const r=byId.get(item.sourcePointer);
  if(!r||r.father!==item.father||r.pericopeId!==match[1]||
   r.ordinal!==Number(match[2])+1||!String(r.text||"").includes(item.evidence)||
   typeof r.sourceUrl!=="string"||!r.sourceUrl.startsWith("https://www.ecatholic2000.com/"))
   continue;
  selected.push(Object.freeze({
   id:item.id,question:item.question,topic:item.topic,
   sourcePointer:item.sourcePointer,lookupTerm:item.topic,
   kind:"curated-source-pointer",editorialStatus:item.editorialStatus,
   sourceEvidence:item.evidence
  }));
  if(selected.length>=Math.max(1,Math.min(6,limit)))break;
 }
 return Object.freeze(selected);
}

/**
 * Companion excerpts are deliberately not inferred by keyword similarity.
 * Only original wording explicitly mapped and verified against the currently
 * selected source pericope is eligible. Distinct voices are never combined.
 */
export function curatedCatenaReaderCompanions(rows,route,{limit=2}={}){
 if(!Array.isArray(rows)||!route||route.kind!=="curated-source-pointer")
  return Object.freeze([]);
 const item=CATENA_READER_QUESTION_ROWS.find(x=>x.id===route.id&&x.sourcePointer===route.sourcePointer);
 if(!item?.related?.length)return Object.freeze([]);
 const source=rows.find(r=>r.id===route.sourcePointer);
 if(!source||source.father!==item.father||!source.text.includes(item.evidence))
  return Object.freeze([]);
 const found=[];
 const max=Math.max(1,Math.min(3,limit));
 for(const rel of item.related){
  const row=rows.find(r=>r.id===rel.sourcePointer);
  if(!row||row.pericopeId!==source.pericopeId||
   row.father!==rel.father||row.father===source.father||
   !row.text.includes(rel.evidence)||
   !row.sourceUrl?.startsWith("https://www.ecatholic2000.com/"))continue;
  found.push(Object.freeze({
   ...row,comparisonSourceEvidence:rel.evidence,
   comparisonOf:source.id,comparisonQuestionId:item.id
  }));
  if(found.length>=max)break;
 }
 return Object.freeze(found);
}
