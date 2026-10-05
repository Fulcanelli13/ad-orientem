// Generated semantic registry for the authoritative Ad Orientem asset contract.
// Core records come from asset-manifest-v4.1.1.json and preserve V4 exactly.
// This module defines identity/ownership only; it does not force runtime migration.

export const AO_ASSET_BANK_CONTRACT=Object.freeze({
  "bank": "Ad Orientem Icon Asset Bank",
  "version": "4.1.1",
  "state": "HARDENED",
  "coreVersion": "4.0",
  "coreAssetCount": 109,
  "extensionAssetCount": 8,
  "activeAssetCount": 117
});

export const AO_CANONICAL_CORE_ASSETS=Object.freeze({
  "ao-live-boat-bearer": {
    "semanticId": "ACTOR.BOAT_BEARER",
    "label": "Boat Bearer",
    "assetId": "ao-live-boat-bearer",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-boat-bearer.png",
    "sha256": "ecb94cb1ba2f74136a763d91cb7c03beef3dfa959b6b403ec69c095b991192e8",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-mc": {
    "semanticId": "ACTOR.MASTER_OF_CEREMONIES",
    "label": "Master of Ceremonies",
    "assetId": "ao-live-mc",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-mc.png",
    "sha256": "97786ddf7e60b7650bda3d2cac10cb5eb7fb3d46c050c4d6b01106c3e372a6bc",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-centre": {
    "semanticId": "ACTOR.PRIEST.CENTRE_AD_ORIENTEM",
    "label": "Priest — Centre (Ad Orientem)",
    "assetId": "ao-live-priest-centre",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-priest-centre.png",
    "sha256": "127198855c1f26cac5ef1419e84ea54902542aa4fad35e832041d383cbd8c526",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-epistle-side": {
    "semanticId": "ACTOR.PRIEST.EPISTLE_SIDE",
    "label": "Priest — At Missal (Epistle Side)",
    "assetId": "ao-live-priest-epistle-side",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-priest-epistle-side.png",
    "sha256": "c27a58d196d0d4b7881f603a17cba1a60d67bbb7836e657e58d4da39779ee59f",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-facing-people": {
    "semanticId": "ACTOR.PRIEST.FACING_PEOPLE",
    "label": "Priest — Facing People",
    "assetId": "ao-live-priest-facing-people",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-priest-facing-people.png",
    "sha256": "ec6dccb0194dd1201cecd9d6ec781255d97ca1861b061c84950655cc37b011d8",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-gospel-side": {
    "semanticId": "ACTOR.PRIEST.GOSPEL_SIDE",
    "label": "Priest — Gospel Side",
    "assetId": "ao-live-priest-gospel-side",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-priest-gospel-side.png",
    "sha256": "b872eb38a778cf2be8764a6b0bfa4733a84c4d87a0e002dab1f04f22ee014fcf",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-thurifer": {
    "semanticId": "ACTOR.THURIFER",
    "label": "Thurifer",
    "assetId": "ao-live-thurifer",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-thurifer.png",
    "sha256": "1ec0039ae4c4fbb676f2b847cbea8d9446e51a2f636ab77a20130bf227e35346",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-bells": {
    "semanticId": "SOUND.ALTAR_BELLS",
    "label": "Altar Bells",
    "assetId": "ao-live-bells",
    "kind": "mask",
    "path": "assets/active/live-audio/ao-live-bells.png",
    "sha256": "16ec2bd4511827b7ac6fd2e7c7b6fe3f8cc54ddd715eea707618e0e9c4527758",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-audible": {
    "semanticId": "SOUND.PRIEST.AUDIBLE",
    "label": "Priest Audible",
    "assetId": "ao-live-priest-audible",
    "kind": "mask",
    "path": "assets/active/live-audio/ao-live-priest-audible.png",
    "sha256": "f3e08e9a206346149baa19c31d94afb1f5fa7217c4b33e0d8cebc5814c1e55e1",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-silent": {
    "semanticId": "SOUND.PRIEST.SILENT",
    "label": "Priest Silent",
    "assetId": "ao-live-priest-silent",
    "kind": "mask",
    "path": "assets/active/live-audio/ao-live-priest-silent.png",
    "sha256": "1172aba87bfa16e2a70554aab0cafeac0c3f9a5978152a2a0ee33e87608c087c",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-schola": {
    "semanticId": "SOUND.SCHOLA",
    "label": "Schola Active",
    "assetId": "ao-live-schola",
    "kind": "mask",
    "path": "assets/active/live-audio/ao-live-schola.png",
    "sha256": "6ab82d51b76b675427d6e3e8b8e77b07f0fc07e1975c58daa0d5b8054c75a543",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-schola-rest": {
    "semanticId": "SOUND.SCHOLA.REST",
    "label": "Schola Rest",
    "assetId": "ao-live-schola-rest",
    "kind": "mask",
    "path": "assets/active/live-audio/ao-live-schola-rest.png",
    "sha256": "987c837ef83d14726783c6696cfb71a87de9528a2c3b00fa5de6a34ded640753",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-church": {
    "semanticId": "CONTEXT.CHURCH",
    "label": "In Church",
    "assetId": "ao-refined-church",
    "kind": "symbol",
    "path": "assets/active/daily-context/ao-refined-church.svg",
    "sha256": "c20a60bd959af39ee233bc27dc51e0806f5650e0222336dca7512ed4be6f7cf6",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-difficult-moments": {
    "semanticId": "CONTEXT.DIFFICULT_MOMENTS",
    "label": "Difficult Moments",
    "assetId": "ao-refined-difficult-moments",
    "kind": "symbol",
    "path": "assets/active/daily-context/ao-refined-difficult-moments.svg",
    "sha256": "647cba97c2f412ceefec32c73994a367aa35c7886c7393bc76d438e44f671e3b",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-help": {
    "semanticId": "CONTEXT.HELP",
    "label": "Need Help",
    "assetId": "ao-refined-help",
    "kind": "symbol",
    "path": "assets/active/daily-context/ao-refined-help.svg",
    "sha256": "7e1a6fa6d2e629776128e034556a97f34278c295502a701eb012d5670d3dbfb7",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-meal": {
    "semanticId": "CONTEXT.MEAL",
    "label": "Meal",
    "assetId": "ao-refined-meal",
    "kind": "symbol",
    "path": "assets/active/daily-context/ao-refined-meal.svg",
    "sha256": "3ae02c450946bc698a881d2df84a61b07991dd71278ca74e48a4549dca7fa456",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-rest": {
    "semanticId": "CONTEXT.REST",
    "label": "Rest",
    "assetId": "ao-refined-rest",
    "kind": "symbol",
    "path": "assets/active/daily-context/ao-refined-rest.svg",
    "sha256": "299b4f2d4be228a47ca264b2e853047543243fdcb6e0a2cfa29fabba75d69a89",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-travel": {
    "semanticId": "CONTEXT.TRAVEL",
    "label": "Travel",
    "assetId": "ao-refined-travel",
    "kind": "symbol",
    "path": "assets/active/daily-context/ao-refined-travel.svg",
    "sha256": "bd61f5302249ad3fa48698d329ccf82e53a7ae6d704242a96903fe035334cb88",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-work": {
    "semanticId": "CONTEXT.WORK",
    "label": "Work",
    "assetId": "ao-refined-work",
    "kind": "symbol",
    "path": "assets/active/daily-context/ao-refined-work.svg",
    "sha256": "33a17281c037ea4dd03dad7c784615c91f97337750454a1d2004871db7d90872",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-adoration": {
    "semanticId": "MODULE.ADORATION",
    "label": "Adoration & Benediction",
    "assetId": "ao-rich-adoration",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-adoration.png",
    "sha256": "c4aba21ec81378cdfb090641955cd3265f8c8ae5b2f821d3291fb022a28faabd",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-angelus": {
    "semanticId": "MODULE.ANGELUS",
    "label": "Angelus / Regina Cæli",
    "assetId": "ao-rich-angelus",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-angelus.png",
    "sha256": "0841f5785465a167136a39b922cd371bfb6df60c4fc68f1a6a67e7020da152e8",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-confession": {
    "semanticId": "MODULE.CONFESSION",
    "label": "Confession",
    "assetId": "ao-rich-confession",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-confession.png",
    "sha256": "7cab7471e12cdfa3e8ef8f4798c9aef77d8c81df8ed54d9fcf825228bd3a0980",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-devotions": {
    "semanticId": "MODULE.DEVOTIONS",
    "label": "Devotions",
    "assetId": "ao-refined-devotions",
    "kind": "symbol",
    "path": "assets/active/devotional-module/ao-refined-devotions.svg",
    "sha256": "551a53d84e5b4b49e6d51e86905a291d92e3a97fe1c2d5ef10fe17015b65db0f",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-eucharistic-life": {
    "semanticId": "MODULE.EUCHARISTIC_LIFE",
    "label": "Eucharistic Life",
    "assetId": "ao-rich-eucharistic-life",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-eucharistic-life.png",
    "sha256": "6a415ee00079034e92fe1d97726373477027aedf24083202e541cadc75a61bed",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-holy-souls": {
    "semanticId": "MODULE.HOLY_SOULS",
    "label": "Holy Souls",
    "assetId": "ao-rich-holy-souls",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-holy-souls.png",
    "sha256": "60276d399e9d36f498509cc095acd148f267df603d33290ba096411926424fdc",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-holy-spirit": {
    "semanticId": "MODULE.HOLY_SPIRIT",
    "label": "Holy Spirit",
    "assetId": "ao-rich-holy-spirit",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-holy-spirit.png",
    "sha256": "07bf3eae3b745d99cdf6f80c2493223fe6276c6cc041031cf1066d026e42d1f2",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-immaculate-heart": {
    "semanticId": "MODULE.IMMACULATE_HEART",
    "label": "Immaculate Heart",
    "assetId": "ao-rich-immaculate-heart",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-immaculate-heart.png",
    "sha256": "556587eaf3d845460bf0bf64f45cd700e1ce982df6a33a8f728bf16fa5859386",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-mental-prayer": {
    "semanticId": "MODULE.MENTAL_PRAYER",
    "label": "Mental Prayer",
    "assetId": "ao-rich-mental-prayer",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-mental-prayer.png",
    "sha256": "fc9d0048e9a758fe12df4532559fff7661ae6f9d6703ee61ee9e77085ddaba85",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-novenas": {
    "semanticId": "MODULE.NOVENAS",
    "label": "Novenas",
    "assetId": "ao-rich-novenas",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-novenas.png",
    "sha256": "ee686dc29d52f681f74d75625db1dbbc8674dfcc1602c22d1955374f875f944c",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-plan-of-life": {
    "semanticId": "MODULE.PLAN_OF_LIFE",
    "label": "Plan of Life",
    "assetId": "ao-rich-plan-of-life",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-plan-of-life.png",
    "sha256": "ca2732b547666b4fe6a7d00e976add3ec80b41a59c054348b7386960d925de3c",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-prayer-library": {
    "semanticId": "MODULE.PRAYER_LIBRARY",
    "label": "Prayer Library",
    "assetId": "ao-rich-prayer-library",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-prayer-library.png",
    "sha256": "b3186b328bb01cfa5567f59b9eb68e39f42038f772f148366a6cbb22bf3dc53c",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-pray-now": {
    "semanticId": "MODULE.PRAY_NOW",
    "label": "Pray Now",
    "assetId": "ao-refined-pray-now",
    "kind": "symbol",
    "path": "assets/active/devotional-module/ao-refined-pray-now.svg",
    "sha256": "7444907e6c219e82026bbd266ff861b993840350e5991471b6c1a713c1b10f7a",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-recollection": {
    "semanticId": "MODULE.RECOLLECTION",
    "label": "Recollection",
    "assetId": "ao-rich-recollection",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-recollection.png",
    "sha256": "429b960a3e5270b350b20b9955a52a080d417b4e42577275c4d1f62c0daeef77",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-rosary": {
    "semanticId": "MODULE.ROSARY",
    "label": "Rosary",
    "assetId": "ao-rich-rosary",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-rosary.png",
    "sha256": "63023c5299bb140c27dd8d2f3bdc15fabfd66c3b96f96baf3b338460bb8f4bf9",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-sacred-heart": {
    "semanticId": "MODULE.SACRED_HEART",
    "label": "Sacred Heart",
    "assetId": "ao-rich-sacred-heart",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-sacred-heart.png",
    "sha256": "1364c6a3e0c4301cf7ab5253116ede1889d7b1a0005c1b2a5dc9ed0ccca5cdff",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-silence": {
    "semanticId": "MODULE.SILENCE",
    "label": "Silence",
    "assetId": "ao-refined-silence",
    "kind": "symbol",
    "path": "assets/active/devotional-module/ao-refined-silence.svg",
    "sha256": "c3004d1e3a9862c2913912ddc1518c1d1faea02b446e794dbf6279c467e41869",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-spiritual-combat": {
    "semanticId": "MODULE.SPIRITUAL_COMBAT",
    "label": "Spiritual Combat",
    "assetId": "ao-rich-spiritual-combat",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-spiritual-combat.png",
    "sha256": "8eb0323785100555fb0e194fa2483f81b0cd39e51b39641607ff1de4ab72b33c",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-stations": {
    "semanticId": "MODULE.STATIONS",
    "label": "Stations of the Cross",
    "assetId": "ao-rich-stations",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-stations.png",
    "sha256": "a7dc11f041ec9cc64fcc2b97de4a5d0f367366a9eaef07c50afd58233f4fafad",
    "status": "FROZEN_ACTIVE"
  },
  "ao-rich-st-joseph": {
    "semanticId": "MODULE.ST_JOSEPH",
    "label": "St Joseph",
    "assetId": "ao-rich-st-joseph",
    "kind": "mask",
    "path": "assets/active/devotional-module/ao-rich-st-joseph.png",
    "sha256": "f956d9abfb855ee4f2c76a5767b12e12123748d897c2f5c88000c94e2a956d21",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-breast-strike": {
    "semanticId": "GESTURE.BREAST_STRIKE",
    "label": "Breast Strike",
    "assetId": "ao-live-breast-strike",
    "kind": "mask",
    "path": "assets/active/live-gesture/ao-live-breast-strike.png",
    "sha256": "a56a3d2024b73424c14e7094ed35caff5bc710ccfcbb650275e0601ed966aa56",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-hands-joined": {
    "semanticId": "GESTURE.HANDS_JOINED",
    "label": "Hands Joined",
    "assetId": "ao-live-hands-joined",
    "kind": "mask",
    "path": "assets/active/live-gesture/ao-live-hands-joined.png",
    "sha256": "8e6554a6229cd138c332c9ed6083c82cef4abe64ec149c364eb71d4794a27632",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-head-bow": {
    "semanticId": "GESTURE.HEAD_BOW",
    "label": "Head Bow",
    "assetId": "ao-live-head-bow",
    "kind": "mask",
    "path": "assets/active/live-gesture/ao-live-head-bow.png",
    "sha256": "34617bb5f581620c9fa943be21575daa5cec4d702c60cbc8b7987495b0ba6078",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-profound-bow": {
    "semanticId": "GESTURE.PROFOUND_BOW",
    "label": "Profound Bow",
    "assetId": "ao-live-profound-bow",
    "kind": "mask",
    "path": "assets/active/live-gesture/ao-live-profound-bow.png",
    "sha256": "1f24c3e0297a3117fc428d2b96f2bcf21c290728a9aa72705feeaa450b7544dc",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-bow": {
    "semanticId": "POSTURE.BOW",
    "label": "Bow",
    "assetId": "ao-live-bow",
    "kind": "mask",
    "path": "assets/active/live-posture/ao-live-bow.png",
    "sha256": "36032c09e2cfb432449f5a84449e543e765497b4cd4ef10ae5c32c595a446405",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-genuflect": {
    "semanticId": "POSTURE.GENUFLECT",
    "label": "Genuflect",
    "assetId": "ao-live-genuflect",
    "kind": "symbol",
    "path": "assets/active/live-posture/ao-live-genuflect.svg",
    "sha256": "34ce386b806157e73f1ff1811152d0617677c4bfd2073c46290ddeccfe84c74f",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-kneel": {
    "semanticId": "POSTURE.KNEEL",
    "label": "Kneel",
    "assetId": "ao-live-kneel",
    "kind": "symbol",
    "path": "assets/active/live-posture/ao-live-kneel.svg",
    "sha256": "eda5c927849d32ffaa83d8efc9de885178050e78bdcc7a0a30310f6f85f858ec",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-sit": {
    "semanticId": "POSTURE.SIT",
    "label": "Sit",
    "assetId": "ao-live-sit",
    "kind": "mask",
    "path": "assets/active/live-posture/ao-live-sit.png",
    "sha256": "0a8e59bcc82d49f02f6d0ce7cb60ab1201b406045977cb9f08e22de46675f15a",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-stand": {
    "semanticId": "POSTURE.STAND",
    "label": "Stand",
    "assetId": "ao-live-stand",
    "kind": "symbol",
    "path": "assets/active/live-posture/ao-live-stand.svg",
    "sha256": "245fcc201fb360b36247412d9406bfbe4ee00e4391775bfc8e1db64ea02ca2b4",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-beginner": {
    "semanticId": "MODULE.BEGINNER",
    "label": "Beginner / Getting Started",
    "assetId": "ao-refined-beginner",
    "kind": "symbol",
    "path": "assets/active/formation-module/ao-refined-beginner.svg",
    "sha256": "2d914898e733da6ed45fdf60b38288667ae96f3382c40e03e010b5e292dbdc80",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-calendar-upcoming": {
    "semanticId": "MODULE.CALENDAR_UPCOMING",
    "label": "Coming Up / Liturgical Calendar",
    "assetId": "ao-refined-calendar-upcoming",
    "kind": "symbol",
    "path": "assets/active/formation-module/ao-refined-calendar-upcoming.svg",
    "sha256": "35ec10d89b4cb2f9b39dd43939362d244f4751cf5462a8bdef6dc02418af0f70",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-catholic-world": {
    "semanticId": "MODULE.CATHOLIC_WORLD",
    "label": "Catholic World",
    "assetId": "ao-refined-catholic-world",
    "kind": "symbol",
    "path": "assets/active/formation-module/ao-refined-catholic-world.svg",
    "sha256": "5bc5baed7846a21df0b744aa4fa3c01ba51bfc2e1b5072df36b9ab6a036ff407",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-journal": {
    "semanticId": "MODULE.JOURNAL",
    "label": "Journal",
    "assetId": "ao-refined-journal",
    "kind": "symbol",
    "path": "assets/active/formation-module/ao-refined-journal.svg",
    "sha256": "1eaa7b854c39ca7c261ea2a7657ecf9d1c71911355a009c5bdd98cefc87b5112",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-resolution": {
    "semanticId": "MODULE.RESOLUTION",
    "label": "Resolution",
    "assetId": "ao-refined-resolution",
    "kind": "symbol",
    "path": "assets/active/formation-module/ao-refined-resolution.svg",
    "sha256": "f10d8797da55b81f705e894ca658eba6a0195b9e12858195f4733f9a296619cf",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-saint-of-day": {
    "semanticId": "MODULE.SAINT_OF_DAY",
    "label": "Saint of the Day",
    "assetId": "ao-refined-saint-of-day",
    "kind": "symbol",
    "path": "assets/active/formation-module/ao-refined-saint-of-day.svg",
    "sha256": "55d5d32a87e66cb8fc48029c49df33b312a032a6a542b259d9d952b667496e7f",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-scripture": {
    "semanticId": "MODULE.SCRIPTURE",
    "label": "Scripture / Today’s Gospel",
    "assetId": "ao-refined-scripture",
    "kind": "symbol",
    "path": "assets/active/formation-module/ao-refined-scripture.svg",
    "sha256": "032ec42954061176ddb7812acff83dee02cec85610a0c440cd3be351a905121d",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-spiritual-life": {
    "semanticId": "MODULE.SPIRITUAL_LIFE",
    "label": "Spiritual Life",
    "assetId": "ao-refined-spiritual-life",
    "kind": "symbol",
    "path": "assets/active/formation-module/ao-refined-spiritual-life.svg",
    "sha256": "c4447a713ca04af682fe44385af9fa53b79cce6c3836c7817a18e9dfa24469dd",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-study": {
    "semanticId": "MODULE.STUDY",
    "label": "Study",
    "assetId": "ao-refined-study",
    "kind": "symbol",
    "path": "assets/active/formation-module/ao-refined-study.svg",
    "sha256": "f2a98a01023ac78d2bb89658d6bc895614c27ddd95fc807057d0785bbcdb7aec",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-back": {
    "semanticId": "UI.BACK",
    "label": "Back",
    "assetId": "ao-ui-back",
    "kind": "symbol",
    "path": "assets/active/ui/ao-ui-back.svg",
    "sha256": "6fa76327acec6b8ea638eaa003bee231495ed2c09da695b1328bc6153f66e8ce",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-check": {
    "semanticId": "UI.CHECK",
    "label": "Check",
    "assetId": "ao-ui-check",
    "kind": "symbol",
    "path": "assets/active/ui/ao-ui-check.svg",
    "sha256": "ee7ae8a8b2221c2b567a4ec79ba85398fdf0a61afe4eeda7eb6a62d5fe54c23c",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-close": {
    "semanticId": "UI.CLOSE",
    "label": "Close",
    "assetId": "ao-ui-close",
    "kind": "symbol",
    "path": "assets/active/ui/ao-ui-close.svg",
    "sha256": "09d6201070424b8aee9277cc04acaeb5962c8af429d137638350edeacf47f1e1",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-expand": {
    "semanticId": "UI.EXPAND",
    "label": "Expand",
    "assetId": "ao-ui-expand",
    "kind": "symbol",
    "path": "assets/active/ui/ao-ui-expand.svg",
    "sha256": "8efc169ae002959bbd4279a6d1bd36bb8bc5b1d4578c8f7a38258e2c20bb112c",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-external": {
    "semanticId": "UI.EXTERNAL",
    "label": "External",
    "assetId": "ao-ui-external",
    "kind": "symbol",
    "path": "assets/active/ui/ao-ui-external.svg",
    "sha256": "26763d11fe232da94a16f0e9dffc6de90360c4e4982865928afba99af984ea65",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-info": {
    "semanticId": "UI.INFO",
    "label": "Info",
    "assetId": "ao-ui-info",
    "kind": "symbol",
    "path": "assets/active/ui/ao-ui-info.svg",
    "sha256": "1d0a4ae2ed6065e7a36957f1b2e133e54ce9ade342aec6bd2edd4a256ff68126",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-next": {
    "semanticId": "UI.NEXT",
    "label": "Next",
    "assetId": "ao-ui-next",
    "kind": "symbol",
    "path": "assets/active/ui/ao-ui-next.svg",
    "sha256": "8f5bee6dbd70cdc0dee5c7f7d9d6820a9ac513b534053c7685964d62d1a4bac6",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-previous": {
    "semanticId": "UI.PREVIOUS",
    "label": "Previous",
    "assetId": "ao-ui-previous",
    "kind": "symbol",
    "path": "assets/active/ui/ao-ui-previous.svg",
    "sha256": "1f2b4f1f74dad53831faac508b582ecca636297158d49fe636091cfb6c286323",
    "status": "FROZEN_ACTIVE"
  },
  "ao-refined-privacy": {
    "semanticId": "UI.PRIVACY",
    "label": "Privacy",
    "assetId": "ao-refined-privacy",
    "kind": "symbol",
    "path": "assets/active/ui/ao-refined-privacy.svg",
    "sha256": "c3946d3abf2ba3b7cad222dee56625815d380b3060870e31f849c51feab308ac",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-search": {
    "semanticId": "UI.SEARCH",
    "label": "Search",
    "assetId": "ao-ui-search",
    "kind": "symbol",
    "path": "assets/active/ui/ao-ui-search.svg",
    "sha256": "bbfd23515545b34fa4ba6704c03e7da12154dfa0536d0231b1e9588bfb5b921a",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-sources": {
    "semanticId": "UI.SOURCES",
    "label": "Sources",
    "assetId": "ao-ui-sources",
    "kind": "symbol",
    "path": "assets/active/ui/ao-ui-sources.svg",
    "sha256": "2036f05e35ae76d7777072e773cb7c5eeeda28df565c8614b7a92d5186e76bea",
    "status": "FROZEN_ACTIVE"
  },
  "ao-nav-calendar": {
    "semanticId": "NAV.GLOBAL.CALENDAR",
    "label": "Calendar",
    "assetId": "ao-nav-calendar",
    "kind": "mask",
    "path": "assets/active/navigation/ao-nav-calendar.png",
    "sha256": "f143a7c01c9bcc2ad8d5df23b5bd84bcad4470945054761f408401379a8e2f43",
    "status": "FROZEN_ACTIVE"
  },
  "ao-nav-home": {
    "semanticId": "NAV.GLOBAL.HOME",
    "label": "Home — Ad Orientem identity",
    "assetId": "ao-nav-home",
    "kind": "mask",
    "path": "assets/active/navigation/ao-nav-home.png",
    "sha256": "9a03d23f2e4cf468e2946973fed3522eea5b7920844307d0109b7085fe9b819f",
    "status": "FROZEN_ACTIVE"
  },
  "ao-nav-learn": {
    "semanticId": "NAV.GLOBAL.LEARN",
    "label": "Learn",
    "assetId": "ao-nav-learn",
    "kind": "mask",
    "path": "assets/active/navigation/ao-nav-learn.png",
    "sha256": "afc13baf0217aee4e2c4f9fa2decc3325ef9d40d918d675eeef9be29b4c66f22",
    "status": "FROZEN_ACTIVE"
  },
  "ao-brand-emblem": {
    "semanticId": "NAV.GLOBAL.MASS",
    "label": "Mass",
    "assetId": "ao-brand-emblem",
    "kind": "mask",
    "path": "assets/active/navigation/ao-brand-emblem.png",
    "sha256": "8fa04230a74384932606a4b7eabd9e5e5bfb45f486bf0c4d23c51f2f5d957cbf",
    "status": "FROZEN_ACTIVE"
  },
  "ao-nav-pray": {
    "semanticId": "NAV.GLOBAL.PRAY",
    "label": "Pray",
    "assetId": "ao-nav-pray",
    "kind": "mask",
    "path": "assets/active/navigation/ao-nav-pray.png",
    "sha256": "593941700a9ced05ba76c1e7697a6a97863572b18a2ffc56df9fc9124380e43d",
    "status": "FROZEN_ACTIVE"
  },
  "ao-nav-settings": {
    "semanticId": "NAV.GLOBAL.SETTINGS",
    "label": "Settings",
    "assetId": "ao-nav-settings",
    "kind": "mask",
    "path": "assets/active/navigation/ao-nav-settings.png",
    "sha256": "6bc33b1a590e7c6551c45c17236bf3d23a4a3801d86af07f12501c5ae602c57a",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-processional": {
    "semanticId": "ACTION.ENTRANCE_PROCESSION",
    "label": "Entrance Procession",
    "assetId": "ao-live-processional",
    "kind": "mask",
    "path": "assets/active/live-actions/ao-live-processional.png",
    "sha256": "9d3b4cc872008dd05789a1fd4e076333e20e901fe4855f0605ea9ca0c9d97205",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-recessional": {
    "semanticId": "ACTION.RECESSION",
    "label": "Recessional",
    "assetId": "ao-live-recessional",
    "kind": "mask",
    "path": "assets/active/live-actions/ao-live-recessional.png",
    "sha256": "70e680fd6c90cc305eaedda5b82bbd6027d1b2d83dc9e6b6789eb8d9b0c6124f",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-blessing": {
    "semanticId": "ACTION.BLESSING",
    "label": "Blessing",
    "assetId": "ao-live-blessing",
    "kind": "mask",
    "path": "assets/active/live-actions/ao-live-blessing.png",
    "sha256": "620d70d4c40ba75deec8985f043683df6dae0e6bfe72490744eae7c83190417c",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-communion": {
    "semanticId": "ACTION.COMMUNION",
    "label": "Communion",
    "assetId": "ao-live-communion",
    "kind": "mask",
    "path": "assets/active/live-actions/ao-live-communion.png",
    "sha256": "08edf0b3859a27a810a1cf786a46c0e65186915d3671ffa470fbb661ad6f253e",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-elevation": {
    "semanticId": "ACTION.HOST_ELEVATION",
    "label": "Priest — Elevation",
    "assetId": "ao-live-priest-elevation",
    "kind": "mask",
    "path": "assets/active/live-actions/ao-live-priest-elevation.png",
    "sha256": "78ec06b7f5afa061c2698a776b4738defc2f30fa357c92d6c8fa4cedd4ae64b7",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-lavabo": {
    "semanticId": "ACTION.LAVABO",
    "label": "Lavabo",
    "assetId": "ao-live-lavabo",
    "kind": "mask",
    "path": "assets/active/live-actions/ao-live-lavabo.png",
    "sha256": "4310dfa0d50b71f116ae0ae4d171ef145939c750318b29b3b63fc6273f3e186b",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-candle-bearers": {
    "semanticId": "ACTOR.CANDLE_BEARERS",
    "label": "Candle Bearers",
    "assetId": "ao-live-candle-bearers",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-candle-bearers.png",
    "sha256": "a4aa5d370a3daeb66d3741fba9dcc94d652043b5f296cb0124f9e8f515cdb350",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-cantor": {
    "semanticId": "ACTOR.CANTOR",
    "label": "Cantor",
    "assetId": "ao-live-cantor",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-cantor.png",
    "sha256": "166436d5f606e2c7b382c03c99bee2cce424699240d959c7004acc643fb783be",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-cross-bearer": {
    "semanticId": "ACTOR.CROSS_BEARER",
    "label": "Cross Bearer",
    "assetId": "ao-live-cross-bearer",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-cross-bearer.png",
    "sha256": "409725c4c9b985b9d1ece27de17de8a02dabd5baa617225e65ae0ea94b834361",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-deacon": {
    "semanticId": "ACTOR.DEACON",
    "label": "Deacon",
    "assetId": "ao-live-deacon",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-deacon.png",
    "sha256": "d0d9cee5e1fa1d9d213f4ee6debe192fbeeec9b808ef1fb2c795061e6f3f4bd7",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-genuflect": {
    "semanticId": "ACTOR.PRIEST.GENUFLECT",
    "label": "Priest — Genuflect",
    "assetId": "ao-live-priest-genuflect",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-priest-genuflect.png",
    "sha256": "d421532271ccf3978249032e02bcf5f59c6cee8b2d49fbff062da75a96b660d6",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-incense-altar": {
    "semanticId": "ACTOR.PRIEST.INCENSING_ALTAR",
    "label": "Priest — Incensing Altar",
    "assetId": "ao-live-priest-incense-altar",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-priest-incense-altar.png",
    "sha256": "7e613ebf726773d3fab4921b98b0107ecfcdc166b357cc474946e1e391f11f48",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-incense-people": {
    "semanticId": "ACTOR.PRIEST.INCENSING_PEOPLE",
    "label": "Priest — Incensing People",
    "assetId": "ao-live-priest-incense-people",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-priest-incense-people.png",
    "sha256": "14c807483ff7920a8cad78db04012512f329527442980508fb33a9b303e3998a",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-server": {
    "semanticId": "ACTOR.SERVER.GENERIC",
    "label": "Server / Acolyte",
    "assetId": "ao-live-server",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-server.png",
    "sha256": "c5f9b8ae7de7203edd16a223408f82536a42837f30077bb00d98662bbd3577ea",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-subdeacon": {
    "semanticId": "ACTOR.SUBDEACON",
    "label": "Subdeacon",
    "assetId": "ao-live-subdeacon",
    "kind": "mask",
    "path": "assets/active/live-actors/ao-live-subdeacon.png",
    "sha256": "df2611a13e633a9dfb22f45b03159a210f948910a739691268b180f563420bdc",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-hear": {
    "semanticId": "CUE.HEAR",
    "label": "Hear",
    "assetId": "ao-live-hear",
    "kind": "mask",
    "path": "assets/active/live-cue/ao-live-hear.png",
    "sha256": "41946cfe034c4d17579a00595ab543a501f7019e0f4b1cd553de627effad3ced",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-look": {
    "semanticId": "CUE.LOOK",
    "label": "Look",
    "assetId": "ao-live-look",
    "kind": "mask",
    "path": "assets/active/live-cue/ao-live-look.png",
    "sha256": "a40af000f69024040a48c83717463b998d867a05e9b9f9917414726512646fb9",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-response": {
    "semanticId": "CUE.RESPONSE",
    "label": "Response V/R",
    "assetId": "ao-live-response",
    "kind": "mask",
    "path": "assets/active/live-cue/ao-live-response.png",
    "sha256": "9d96892b0afda03f52629aedc5fcbe7531b8ea19218c1c42aafacaed97cab624",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-you": {
    "semanticId": "CUE.YOU",
    "label": "You",
    "assetId": "ao-live-you",
    "kind": "mask",
    "path": "assets/active/live-cue/ao-live-you.png",
    "sha256": "0371d738ead9b39b9d568d7c7712801597fcde32efd903bb00dae9a9d6a16ed6",
    "status": "FROZEN_ACTIVE"
  },
  "ao-module-before-mass": {
    "semanticId": "MODULE.BEFORE_MASS",
    "label": "Before Mass",
    "assetId": "ao-module-before-mass",
    "kind": "mask",
    "path": "assets/active/modules/ao-module-before-mass.png",
    "sha256": "09922590a391aa91e727238c83e61d37d3f95e7f99c4ba28dee16aa25d3e07c3",
    "status": "FROZEN_ACTIVE"
  },
  "ao-module-catechism": {
    "semanticId": "MODULE.CATECHISM",
    "label": "Traditional Catechism",
    "assetId": "ao-module-catechism",
    "kind": "mask",
    "path": "assets/active/modules/ao-module-catechism.png",
    "sha256": "ef893112f2f81a6b8884c5ae06745aa4c0166e52ead92b5b62ca17f1b7202e6b",
    "status": "FROZEN_ACTIVE"
  },
  "ao-module-mass-intention": {
    "semanticId": "MODULE.MASS_INTENTION",
    "label": "Mass Intention",
    "assetId": "ao-module-mass-intention",
    "kind": "mask",
    "path": "assets/active/modules/ao-module-mass-intention.png",
    "sha256": "c93e4fc2d8e8af727e33367da0c3a15f543e284823b21325f50fdae197736c28",
    "status": "FROZEN_ACTIVE"
  },
  "ao-module-thanksgiving": {
    "semanticId": "MODULE.THANKSGIVING_AFTER_MASS",
    "label": "Thanksgiving After Mass",
    "assetId": "ao-module-thanksgiving",
    "kind": "mask",
    "path": "assets/active/modules/ao-module-thanksgiving.png",
    "sha256": "0688d9cac03c09d31a433895cfa09a95f76d49a55fdd2a601478ad8a82f76ded",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-ascending-steps": {
    "semanticId": "POSITION.PRIEST.ASCENDING_STEPS",
    "label": "Priest — Ascending Steps",
    "assetId": "ao-live-priest-ascending-steps",
    "kind": "mask",
    "path": "assets/active/live-priest-position/ao-live-priest-ascending-steps.png",
    "sha256": "d866722786abea05313d12023bb282ddc9efe03ec1e1f7a00a1fef78be7c3d42",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-communion-rail": {
    "semanticId": "POSITION.PRIEST.COMMUNION_RAIL",
    "label": "Priest — Distributing Communion at Rail",
    "assetId": "ao-live-priest-communion-rail",
    "kind": "mask",
    "path": "assets/active/live-priest-position/ao-live-priest-communion-rail.png",
    "sha256": "f0aee42b284347e03c3c7e1d663e609de59ad7dc963764f576c5f0f869d92d74",
    "status": "FROZEN_ACTIVE"
  },
  "ao-live-priest-foot-altar": {
    "semanticId": "POSITION.PRIEST.FOOT_OF_ALTAR",
    "label": "Priest — Foot of Altar",
    "assetId": "ao-live-priest-foot-altar",
    "kind": "mask",
    "path": "assets/active/live-priest-position/ao-live-priest-foot-altar.png",
    "sha256": "c35defd145fd745741489f44259f7cb6e3c736b824a7e3918ed5539ff96495df",
    "status": "FROZEN_ACTIVE"
  },
  "ao-special-cross-veneration": {
    "semanticId": "ACTION.CROSS_VENERATION",
    "label": "Cross Veneration",
    "assetId": "ao-special-cross-veneration",
    "kind": "mask",
    "path": "assets/active/special-days/ao-special-cross-veneration.png",
    "sha256": "ab29b142161d354d3bde1f9111d11e8819cff353f6281967b9e6657049bcd758",
    "status": "FROZEN_ACTIVE"
  },
  "ao-special-ashes": {
    "semanticId": "OBJECT.ASHES",
    "label": "Ashes",
    "assetId": "ao-special-ashes",
    "kind": "mask",
    "path": "assets/active/special-days/ao-special-ashes.png",
    "sha256": "aaf9f16283d09ff6590aaae24a41bc55d704fcb88a70f973657aca297471bcc4",
    "status": "FROZEN_ACTIVE"
  },
  "ao-special-candle-lit": {
    "semanticId": "OBJECT.CANDLE.LIT",
    "label": "Candle Lit",
    "assetId": "ao-special-candle-lit",
    "kind": "mask",
    "path": "assets/active/special-days/ao-special-candle-lit.png",
    "sha256": "8b2511b00941152d48889ef862ee13b93f3f79bc96f15ed74094b967705a9d49",
    "status": "FROZEN_ACTIVE"
  },
  "ao-special-candle-unlit": {
    "semanticId": "OBJECT.CANDLE.UNLIT",
    "label": "Candle Unlit",
    "assetId": "ao-special-candle-unlit",
    "kind": "mask",
    "path": "assets/active/special-days/ao-special-candle-unlit.png",
    "sha256": "545511cc67412f2d4395214513683b9287081d254e3729739528a61886e11b9f",
    "status": "FROZEN_ACTIVE"
  },
  "ao-special-mandatum-basin-towel": {
    "semanticId": "OBJECT.MANDATUM_BASIN_TOWEL",
    "label": "Mandatum Basin and Towel",
    "assetId": "ao-special-mandatum-basin-towel",
    "kind": "mask",
    "path": "assets/active/special-days/ao-special-mandatum-basin-towel.png",
    "sha256": "3b8e2ad74f1579dc0a76a2f8d5e4a6a127b322910ecd201926a9dee06a800426",
    "status": "FROZEN_ACTIVE"
  },
  "ao-special-palm": {
    "semanticId": "OBJECT.PALM",
    "label": "Palm Branch",
    "assetId": "ao-special-palm",
    "kind": "mask",
    "path": "assets/active/special-days/ao-special-palm.png",
    "sha256": "d379e13c1a009f1c1e78ce5657f78f940f6dafdb954fa434ee7a266e82d0db7c",
    "status": "FROZEN_ACTIVE"
  },
  "ao-special-paschal-candle": {
    "semanticId": "OBJECT.PASCHAL_CANDLE",
    "label": "Paschal Candle",
    "assetId": "ao-special-paschal-candle",
    "kind": "mask",
    "path": "assets/active/special-days/ao-special-paschal-candle.png",
    "sha256": "f0bee664e0d286fd9ca00d3cbda6824eedbf55a51635a21300d0537226990ca8",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-home": {
    "semanticId": "UI.HOME",
    "label": "Home",
    "assetId": "ao-ui-home",
    "kind": "mask",
    "path": "assets/active/ui/ao-ui-home.png",
    "sha256": "ac09e47b3db7e94e0203e8c0a411d44dfecc964874b6d9499496612ebb29bcf7",
    "status": "FROZEN_ACTIVE"
  },
  "ao-ui-settings": {
    "semanticId": "UI.SETTINGS",
    "label": "Settings",
    "assetId": "ao-ui-settings",
    "kind": "mask",
    "path": "assets/active/ui/ao-ui-settings.png",
    "sha256": "5fbc3ae746ab08f39cae2a44264117a3faccf535c34b113f87e83a3776dbe2e2",
    "status": "FROZEN_ACTIVE"
  }
});

export const AO_CANONICAL_EXTENSION_ASSETS=Object.freeze({
  "ao-rich-begin-end-day": {
    "semanticId": "module.daily.begin_end_day",
    "label": "Morning & Evening Prayer",
    "assetId": "ao-rich-begin-end-day",
    "owner": "module",
    "kind": "embedded_svg_symbol",
    "source": "existing post-V4 app asset formally admitted in V4.1",
    "status": "HARDENED_EXTENSION"
  },
  "ao-rich-examination-of-conscience": {
    "semanticId": "module.examination_of_conscience",
    "label": "Examination of Conscience",
    "assetId": "ao-rich-examination-of-conscience",
    "owner": "module",
    "kind": "embedded_svg_symbol",
    "source": "existing post-V4 app asset formally admitted in V4.1",
    "status": "HARDENED_EXTENSION"
  },
  "ao-rich-guides": {
    "semanticId": "module.understand_mass",
    "label": "Understand the Mass",
    "assetId": "ao-rich-guides",
    "owner": "module",
    "kind": "embedded_svg_symbol",
    "source": "existing post-V4 app asset formally admitted in V4.1",
    "status": "HARDENED_EXTENSION"
  },
  "ao-rich-morning-offering": {
    "semanticId": "module.morning_prayer",
    "label": "Morning Prayer",
    "assetId": "ao-rich-morning-offering",
    "owner": "module",
    "kind": "embedded_svg_symbol",
    "source": "existing post-V4 app asset formally admitted in V4.1",
    "status": "HARDENED_EXTENSION"
  },
  "ao-rich-night-prayer": {
    "semanticId": "module.night_prayer",
    "label": "Night Prayer",
    "assetId": "ao-rich-night-prayer",
    "owner": "module",
    "kind": "embedded_svg_symbol",
    "source": "existing post-V4 app asset formally admitted in V4.1",
    "status": "HARDENED_EXTENSION"
  },
  "ao-rich-our-lady-marian-devotions": {
    "semanticId": "module.marian.general",
    "label": "Our Lady / Marian Devotions",
    "assetId": "ao-rich-our-lady-marian-devotions",
    "owner": "module",
    "kind": "embedded_svg_symbol",
    "source": "existing post-V4 app asset formally admitted in V4.1",
    "status": "HARDENED_EXTENSION"
  },
  "ao-ui-lost": {
    "semanticId": "ui.help.lost",
    "label": "I’m Lost",
    "assetId": "ao-ui-lost",
    "owner": "ui",
    "kind": "png_mask_alias",
    "source": "legacy ao-nav-im-lost artwork migrated to V4.1 UI ownership",
    "status": "HARDENED_EXTENSION"
  },
  "ao-live-sign-cross": {
    "semanticId": "live.gesture.sign_cross",
    "label": "Sign of the Cross",
    "assetId": "ao-live-sign-cross",
    "owner": "live",
    "kind": "png_mask_alias",
    "source": "legacy ao-posture-sign-cross artwork migrated to V4.1 Live ownership",
    "status": "HARDENED_EXTENSION"
  }
});

export const AO_REMOVED_ASSET_IDS=Object.freeze([
  "ao-nav-mass",
  "ao-nav-im-lost",
  "ao-posture-sign-cross",
  "ao-nav-mass-map"
]);

export const AO_SHARED_IDENTITY_MAPPINGS=Object.freeze([
  {
    "route": "pray.benediction",
    "module_root": "pray.adoration",
    "asset_id": "ao-rich-adoration",
    "reason": "Benediction is a subview of the combined Adoration & Benediction module."
  },
  {
    "route": "pray.forty_hours",
    "asset_id": "ao-rich-adoration",
    "reason": "Forty Hours intentionally uses the same Eucharistic/Adoration icon."
  }
]);

export function getCanonicalAsset(assetId){
  const id=String(assetId??"").trim();
  return AO_CANONICAL_CORE_ASSETS[id]??AO_CANONICAL_EXTENSION_ASSETS[id]??null;
}

export function isCanonicalAssetId(assetId){
  return Boolean(getCanonicalAsset(assetId));
}

export function resolveCanonicalAssetUrl(assetId,baseUrl=import.meta.url){
  const record=AO_CANONICAL_CORE_ASSETS[String(assetId??"").trim()];
  if(!record?.path)return null;
  return new URL("../../"+record.path,baseUrl).href;
}
