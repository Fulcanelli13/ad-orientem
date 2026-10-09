const KEY = "ao-scripture-v1";
function read(storage) {
  try {
    const value = JSON.parse(storage?.getItem?.(KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
export function createScripturePreferences(storage = globalThis.localStorage) {
  const allowed = new Set(["en","fr","la"]);
  function save(value) {
    try { storage?.setItem?.(KEY, JSON.stringify(value)); return true; } catch { return false; }
  }
  return Object.freeze({
    load() {
      const raw = read(storage);
      const bookmarks = Array.isArray(raw.bookmarks)
        ? raw.bookmarks.filter(x=>x && typeof x === "object" && typeof x.book === "string"
          && Number.isSafeInteger(x.chapter) && x.chapter>0
          && Number.isSafeInteger(x.verseStart) && x.verseStart>0).slice(0,500)
        : [];
      const language = allowed.has(raw.language)?raw.language:"en";
      return {language, bookmarks};
    },
    englishEdition() {
      const requested = read(storage).englishEdition;
      return ["dr-challoner","ncb-2019"].includes(requested) ? requested : "dr-challoner";
    },
    setEnglishEdition(editionId) {
      if (!["dr-challoner","ncb-2019"].includes(editionId)) throw new Error("Unavailable English reader preference");
      return save({...read(storage),englishEdition:editionId});
    },
    setLanguage(language) {
      if(!allowed.has(language)) throw new Error("Unsupported Scripture language");
      return save({...read(storage),language});
    },
    toggleBookmark(passage) {
      if(!passage?.book || !Number.isSafeInteger(passage.chapter) || passage.chapter<1
        || !Number.isSafeInteger(passage.verseStart) || passage.verseStart<1) throw new Error("Invalid bookmark");
      const key = [passage.book,passage.chapter,passage.verseStart].join(":");
      const current = this.load();
      const exists = current.bookmarks.some(x=>[x.book,x.chapter,x.verseStart].join(":")===key);
      const bookmarks = exists
        ? current.bookmarks.filter(x=>[x.book,x.chapter,x.verseStart].join(":")!==key)
        : [...current.bookmarks,{book:passage.book,chapter:passage.chapter,verseStart:passage.verseStart}].slice(-500);
      save({...read(storage),bookmarks});
      return !exists;
    }
  });
}
