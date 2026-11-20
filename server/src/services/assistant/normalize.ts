/**
 * Makes messages comparable: lowercase, no accents, no Arabic diacritics, one spelling per
 * Arabic letter, no punctuation, and no doubled Latin letters ("khellas" and "khelas" match).
 * Darija is often typed in Latin letters with digits (3 = ع, 7 = ح, 9 = ق), so digits stay.
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // Latin accents
    .replace(/[ً-ٰٟـ]/g, "") // Arabic diacritics and tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/([a-z])\1+/g, "$1")
    .trim();
}

export const hasArabicScript = (s: string) => /[؀-ۿ]/.test(s);
