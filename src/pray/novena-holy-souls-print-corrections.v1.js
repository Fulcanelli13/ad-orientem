// The donor N3 corpus remains unmodified. These are five English prayer-body
// corrections to the actual historical Redemptorist printed source (1894
// copyright; 1907 imprimatur in the scanned copy), verified against the
// original photographed prayer pages, NOT blind OCR or a modern paraphrase.
//
// Source PDF: https://www.catholickingdom.com/s_Library/Books/M/Manual_of_the_Purgatorian_Society_OCR_CK.pdf
// See docs/pray/NOVENA-PRINT-TEN-EXCEPTION-RESOLUTION-20261029.md.
// French is a revised EDITORIAL translation of this historical English, not a
// claimed historical French witness. No current indulgence is certified.

const F=Object.freeze;
export const HOLY_SOULS_PRINT_ALIGNED_V1=F({
  1:F({
    printedPages:[199,200],
    en:"O Jesus, my Saviour, I have so often deserved to be cast into Hell; how great would be my suffering if I were now cast away and obliged to think that I, myself, had caused my damnation! I thank Thee for the patience with which Thou hast endured me. My God, I love Thee above all things; and I am heartily sorry for having offended Thee, because Thou art infinite goodness. I wish to die rather than offend Thee again. Grant me the grace of perseverance; have pity on me, and at the same time on the blessed souls that suffer in Purgatory. Mary, Mother of God, come to their assistance with thy powerful intercession."
  }),
  2:F({
    printedPages:[202,203],
    en:"Woe to me, unhappy being, who have spent on earth so many years and have earned naught but Hell! I give Thee thanks, O Lord, for granting me time even now to atone for my sins. My good God, I am heartily sorry for having offended Thee. Send me Thy assistance, that I may employ the time remaining to me in Thy love and service; have compassion on me, and, at the same time, on the holy souls suffering in Purgatory. O Mary, Mother of God, come to their assistance with thy powerful intercession."
  }),
  4:F({
    printedPages:[204,205],
    en:"O my God, because Thou art infinite goodness, I am sorry with my whole heart for having offended Thee. I wish to die rather than ever offend Thee more. Give me holy perseverance; have pity on me, and have pity on all the holy souls that burn in the cleansing fire, and love Thee with all their heart. O Mary, Mother of God, come to their assistance with thy powerful intercession.",
    fr:"Ô mon Dieu ! parce que vous êtes la bonté infinie, je regrette de tout mon cœur de vous avoir offensé. Je désire mourir plutôt que de vous offenser encore. Donnez-moi la sainte persévérance ; ayez pitié de moi et de toutes les saintes âmes qui brûlent dans le feu purificateur et vous aiment de tout leur cœur. Ô Marie, Mère de Dieu, venez à leur secours par votre puissante intercession."
  }),
  6:F({
    printedPages:[206,207],
    en:"O my Divine Redeemer, Thou didst die for me on the Cross, and hast so often united Thyself with me in Holy Communion, and I have repaid Thee only with ingratitude. Now, however, I love Thee above all things, O supreme Good; and I am more grieved at my offences against Thee than at any other evil. I wish to die rather than offend Thee again. Grant me the grace of holy perseverance. Have compassion on me, and, at the same time, on the holy souls suffering in Purgatory. Mary, Mother of God, come to their aid with thy powerful intercession."
  }),
  9:F({
    printedPages:[209,210],
    en:"O my God, how was it possible that I for so many years have borne tranquilly the separation from Thee and Thy holy grace! O infinite Goodness, how long-suffering hast Thou shown Thyself to me! Henceforth I shall love Thee above all things. I am deeply sorry for having offended Thee; I wish rather to die than to offend Thee again. Grant me the grace of holy perseverance, and do not permit that I should ever again fall into sin. Have compassion on the holy souls suffering in Purgatory. I pray Thee, moderate their sufferings; shorten the time of their misery; call them soon unto Thee in Heaven, that they may behold Thee face to face, and forever love Thee. Mary, Mother of Mercy, come to their aid with thy powerful intercession, and pray for us also who are still in danger of eternal damnation.",
    fr:"Ô mon Dieu ! comment ai-je pu, pendant tant d’années, supporter tranquillement d’être séparé de vous et de votre sainte grâce ! Ô Bonté infinie, combien vous avez été patient envers moi ! Désormais je vous aimerai par-dessus toutes choses. Je regrette profondément de vous avoir offensé ; je désire plutôt mourir que de vous offenser de nouveau. Accordez-moi la grâce de la sainte persévérance et ne permettez pas que je retombe jamais dans le péché. Ayez compassion des saintes âmes qui souffrent dans le Purgatoire. Je vous en prie, modérez leurs souffrances ; abrégez le temps de leur peine ; appelez-les bientôt auprès de vous dans le ciel afin qu’elles vous contemplent face à face et vous aiment éternellement. Marie, Mère de Miséricorde, venez à leur secours par votre puissante intercession, et priez aussi pour nous qui sommes encore en danger de la damnation éternelle."
  })
});
export const HOLY_SOULS_PRINT_ALIGNED_DAY_IDS=Object.freeze(Object.keys(HOLY_SOULS_PRINT_ALIGNED_V1).map(Number));
