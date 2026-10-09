/**
 * Original source-identified Hammer day headings (1909 English Gutenberg witness).
 * NOT an original French edition, NOT embedded Meditation or Practice text.
 * A central Scripture/prayer source owner remains authoritative for displayed prayers.
 */
export const HAMMER_DAY_SOURCE_URL_V1="https://www.gutenberg.org/files/33671/33671-h/33671-h.htm";
export const HAMMER_DAY_SECTIONS_V1=Object.freeze({
  "annunciation": [
    "The Annunciation",
    "The Import of the Angel’s Salutation",
    "The Effect of the Angel’s Salutation",
    "Mary’s Question",
    "The Solution",
    "Mary’s Consent",
    "Mary’s Fortitude in Suffering",
    "Mary, the Mother of God",
    "Mary Our Mother"
  ],
  "seven_sorrows": [
    "Devotion to the Seven Sorrows of Mary",
    "Mary’s First Sorrow: Simeon’s Prophecy in the Temple",
    "Mary’s Second Sorrow: The Flight into Egypt",
    "Mary’s Third Sorrow: Jesus Lost in Jerusalem",
    "Mary’s Fourth Sorrow: She Meets Jesus Carrying His Cross",
    "Mary’s Fifth Sorrow: Beneath the Cross",
    "Mary’s Sixth Sorrow: The Taking Down of Jesus’ Body from the Cross",
    "Mary’s Seventh Sorrow: Jesus Is Buried",
    "Why Mary Had to Suffer"
  ],
  "assumption": [
    "Mary’s Death Was Without Pain",
    "At Mary’s Tomb",
    "The Empty Tomb",
    "Reasons for the Bodily Assumption of Mary into Heaven",
    "Mary’s Glorious Entrance into Heaven",
    "Mary Crowned in Heaven",
    "Mary’s Bliss in Heaven",
    "Mary, the Queen of Mercy",
    "Mary in Heaven the Help of Christians on Earth"
  ]
});
export function hammerHistoricalDayWitness(id,day){
  const index=Number(day)-1;
  const title=HAMMER_DAY_SECTIONS_V1[String(id||"")]?.[index];
  return title?Object.freeze({title,url:HAMMER_DAY_SOURCE_URL_V1,day:index+1,language:"en",meditation:"PRESENT_IN_ORIGINAL_NOT_EMBEDDED",practice:"PRESENT_IN_ORIGINAL_NOT_EMBEDDED"}):null;
}
