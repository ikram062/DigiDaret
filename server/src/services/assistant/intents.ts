import type { Language } from "../../../generated/prisma/client";
import { hasArabicScript, normalize } from "./normalize.ts";

export type Intent =
  | "GREETING"
  | "THANKS"
  | "HELP"
  | "MY_TURN"
  | "NEXT_PAYMENT"
  | "WHO_RECEIVES"
  | "MISSED"
  | "SAFETY_FUND"
  | "GRACE"
  | "DEBT"
  | "ORDER_RULES"
  | "TRUST_RECORD"
  | "ABOUT"
  | "MY_CIRCLES"
  | "REFUSE_PREDICT"
  | "REFUSE_ADVICE"
  | "REFUSE_RANK";

/** Keywords in English, French, Darija (Latin letters) and Arabic. Longer phrases weigh more. */
const KEYWORDS: Record<Intent, string[]> = {
  GREETING: [
    "hello", "hi", "hey", "good morning", "good evening", "bonjour", "salut", "bonsoir", "coucou",
    "salam", "salam alaykoum", "ahlan", "sbah l khir", "marhba", "labas", "مرحبا", "السلام عليكم", "اهلا", "سلام", "صباح الخير",
  ],
  THANKS: ["thanks", "thank you", "merci", "chokran", "choukran", "barak allah", "شكرا", "بارك الله"],
  HELP: ["help", "aide", "aidez moi", "3awnni", "3awn", "msa3ada", "what can you do", "que peux tu faire", "مساعده", "ساعدني"],
  MY_TURN: [
    "my turn", "when do i receive", "when do i get", "when will i receive", "when do i get paid", "my payout", "my slot", "which month do i receive", "what position",
    "mon tour", "quand je recois", "quand est ce que je recois", "ma position", "mon rang", "quand je touche", "quand je suis paye",
    "dor dyali", "dori", "fash kayji dor", "imta kayji dor", "imta nakhod", "imta ghadi nakhod", "imta ghan9bd", "fin dori", "chhal dori", "tour dyali", "kayji dor dyali",
    "دوري", "متي استلم", "متي اتسلم", "نوبتي", "متي اخذ", "ترتيبي", "متي يجي دوري",
  ],
  NEXT_PAYMENT: [
    "how much do i owe", "how much do i pay", "how much is due", "what do i owe", "what do i pay", "next payment", "when is my payment", "when do i pay", "when is it due",
    "due date", "what is due", "amount due", "how much this month", "how much must i pay",
    "combien je dois", "combien je paie", "combien dois je payer", "prochain paiement", "prochaine echeance", "quand je dois payer", "date limite", "echeance", "a payer",
    "chhal khass nkhellas", "chhal khassni", "chhal nkhellas", "chhal khass", "imta khass nkhellas", "wach khass nkhellas", "imta nkhellas", "khass nkhellas", "ch7al khass nkhellas", "chhal",
    "كم يجب ان ادفع", "كم ادفع", "كم علي", "متي ادفع", "الدفعه القادمه", "موعد الدفع", "المبلغ المستحق", "كم المبلغ", "كم يجب",
  ],
  WHO_RECEIVES: [
    "who receives", "who gets the pot", "who gets paid", "who is receiving", "who takes the pot", "who gets the money", "whose turn", "who gets it this month",
    "qui recoit", "qui touche", "a qui le tour", "a qui est le tour", "qui prend le pot",
    "chkoun li ghadi yakhod", "chkoun ghadi yakhod", "chkoun ghayakhod", "chkoun yakhod", "chkoun li ghay akhod", "3la mn dor", "dor mn", "chkoun dor", "chkoun li dor", "chkoun li ghadi ya5od",
    "من يستلم", "من سياخذ", "دور من", "من الذي يستلم", "من ياخذ",
  ],
  MISSED: [
    "if i miss", "miss a payment", "missed payment", "cannot pay", "can t pay", "cant pay", "do not pay", "dont pay", "fail to pay", "late payment",
    "if someone does not pay", "if someone misses", "if someone doesn t pay", "someone stops paying", "what happens if",
    "si je rate", "si je ne paie pas", "je ne peux pas payer", "paiement manque", "retard de paiement", "si quelqu un ne paie pas", "que se passe t il si", "que se passe til si",
    "ila ma khelastch", "ila ma khelasch", "ila ma 9drtch nkhellas", "ila ma khelst", "ila 3tlt", "ila wa7ed ma khelasch", "ila chi wa7ed ma khelasch", "chnou kaykoun ila", "chnou kaywqa3 ila",
    "ach kaywqa3 ila", "ila nsit", "ila ma khlst", "kaywqa3 ila",
    "اذا لم ادفع", "اذا تاخرت", "اذا لم يدفع", "ماذا يحدث اذا", "لم استطع الدفع", "تاخر الدفع", "اذا فاتني",
  ],
  SAFETY_FUND: [
    "safety fund", "reserve", "who covers", "who pays if", "fonds de securite", "fonds de garantie", "qui couvre",
    "sandou9 l aman", "sandou9 laman", "sandouq laman", "sandou9", "sandouq", "صندوق الامان", "صندوق",
  ],
  GRACE: [
    "grace period", "grace", "how many days late", "delai de grace", "periode de grace", "delai", "mohla", "mohlat", "l mohla", "nhar mohla", "مهله", "فتره السماح",
  ],
  DEBT: [
    "do i owe", "am i in debt", "my debt", "still owe", "est ce que je dois", "ma dette", "je dois encore", "wach 3liya", "3liya dayn", "dayn", "3liya chi flous", "wach 3liya flous", "هل علي دين", "علي دين", "دين",
  ],
  ORDER_RULES: [
    "payout order", "how is the order", "order of payout", "who goes first", "who receives first", "how is the order decided", "why is my turn", "how is the order chosen", "how are turns decided",
    "ordre de passage", "ordre des paiements", "qui passe en premier", "comment l ordre", "ordre", "comment est decide l ordre",
    "tartib", "kifach kaytrtbou", "kifach kayt7ded", "tarteeb", "chkoun lowel", "chkoun luwal", "chkoun kayakhod lowel", "3lach ana", "kifach kayt7ded l ordre", "kifach kaytrtb",
    "ترتيب", "كيف يتم الترتيب", "من الاول", "من يستلم اولا", "كيف يتم تحديد",
  ],
  TRUST_RECORD: [
    "trust record", "reliability", "reliability level", "my record", "my score", "my level", "my points", "lender", "share my record", "points",
    "sijil", "mon score", "mon niveau", "mon historique", "preteur", "mes points",
    "sijil dyali", "nqati", "nqat dyali", "score dyali", "niveau dyali",
    "سجلي", "نقاطي", "مستواي", "سجل", "نقاط",
  ],
  ABOUT: [
    "what is a daret", "what is digidaret", "how does it work", "how does this work", "what is this", "explain daret", "what is daret",
    "c est quoi", "comment ca marche", "qu est ce que", "qu est ce qu une daret",
    "chnou hiya", "chnou hia", "kifach kaykhdem", "kifach khddam", "chnou hada", "chno hiya daret", "chnou hiya daret", "chnou hiya digidaret",
    "ما هي الدارت", "كيف يعمل", "ما هذا", "ما هي الجمعيه", "ما هو",
  ],
  MY_CIRCLES: [
    "my circles", "which circles", "my circle", "my darets", "summary", "overview", "where am i", "my status",
    "mes cercles", "mon cercle", "mes darets", "resume", "statut", "ma situation",
    "dawayri", "daret dyali", "darati", "dawair", "fin wsalt", "ch7al mn daret", "dawayr dyali",
    "دوائري", "دارتي", "جمعياتي", "ملخص",
  ],
  REFUSE_PREDICT: [
    "who will miss", "who will not pay", "who won t pay", "who is going to miss", "will he pay", "will she pay", "will they pay", "predict", "is it risky", "trustworthy", "who is reliable", "can i trust", "who might miss", "who will default",
    "qui va rater", "qui ne va pas payer", "va t il payer", "predire", "risque", "fiable", "puis je faire confiance", "qui va manquer",
    "chkoun ghadi ma ykhellasch", "chkoun ghadi ykhser", "wach ghaykhelas", "wach ghadi ikhelas", "chkoun ma ghaykhelasch", "chkoun ghadi ma yakhlasch", "wach ghayakhlas", "t7ass", "wach tiqa", "wach moutiq", "khatar", "chkoun ghadi ma ykhlasch",
    "من لن يدفع", "من سيتاخر", "هل سيدفع", "هل يمكن الوثوق", "توقع", "خطر",
  ],
  REFUSE_ADVICE: [
    "should i take a loan", "should i borrow", "loan", "invest", "investment", "advice", "should i join", "is it safe to", "is it worth", "legal advice", "financial advice", "should i",
    "dois je", "pret", "emprunt", "investir", "conseil", "conseille moi",
    "wach ndir", "sllef", "sleff", "kredi", "nsa7ni", "nsa7", "wach khass ndir", "9rd", "9rod", "wach n9bel", "wach nsal",
    "هل يجب", "قرض", "استثمار", "نصيحه", "اقتراض", "استشاره",
  ],
  REFUSE_RANK: [
    "his score", "her score", "their score", "someone s score", "other members score", "others score", "s score", "s points", "s level", "s ranking", "s reliability", "everyone s reliability", "others reliability", "other members reliability", "score of", "points of", "level of", "everyone s points", "everyone s score", "everyone points", "who has the highest score", "best score", "ranking", "rank members", "compare members",
    "son score", "leur score", "classement", "points des autres", "qui a le meilleur", "score de", "points de", "niveau de", "score d", "points d",
    "score dyalhom", "nqat dyalhom", "nqat dyal", "score dyal", "chkoun 3ndou l kbar", "chkoun l a7sen", "nqat dyal l akhorin", "nqat kolchi",
    "نقاط الاخرين", "ترتيب الاعضاء", "نقاط الاعضاء",
  ],
};

/** Refusals win ties: a question that is partly about a prediction is refused, not answered. */
const PRIORITY: Intent[] = [
  "REFUSE_PREDICT", "REFUSE_RANK", "REFUSE_ADVICE", "MISSED", "DEBT", "SAFETY_FUND", "GRACE", "ORDER_RULES", "WHO_RECEIVES",
  "MY_TURN", "NEXT_PAYMENT", "TRUST_RECORD", "MY_CIRCLES", "ABOUT", "HELP", "THANKS", "GREETING",
];

const prepared = (Object.entries(KEYWORDS) as [Intent, string[]][]).map(([intent, kws]) => ({
  intent,
  kws: kws.map((k) => normalize(k)).map((k) => ({ k, words: k.split(" ").length, arabic: hasArabicScript(k) })),
}));

export type Detection = { intent: Intent | null; score: number };

export function detectIntent(message: string): Detection {
  const text = ` ${normalize(message)} `;
  let best: Detection = { intent: null, score: 0 };
  let bestRank = 99;

  for (const { intent, kws } of prepared) {
    let score = 0;
    for (const { k, words, arabic } of kws) {
      const hit = arabic ? text.includes(k) : text.includes(` ${k} `);
      if (hit) score += words + k.length / 100; // phrase length first, then characters, as tie-break
    }
    // greetings and thanks never beat a real question...
    if (intent === "GREETING" || intent === "THANKS") score *= 0.5;
    // ...and a refusal beats an ordinary answer ("who will miss a payment?" is a prediction
    // request, not a question about missed payments)
    if (intent.startsWith("REFUSE_")) score *= 1.5;
    const rank = PRIORITY.indexOf(intent);
    if (score > best.score || (score === best.score && score > 0 && rank < bestRank)) {
      best = { intent, score };
      bestRank = rank;
    }
  }
  return best.score >= 0.5 ? best : { intent: null, score: 0 };
}

// ---- which language to answer in ---------------------------------------------------------

const MARKERS: Record<"DARIJA" | "FRENCH" | "ENGLISH", Set<string>> = {
  DARIJA: new Set(
    "fash chhal ch7al wach dyal dyali dyalek dyalo kayn kayji imta emta khass khassni nkhellas khellas chkoun kifach chnou chno daba 3la 3liya ghadi bghit mzyan wakha safi sandou9 mohla tartib 3ndi 3ndek hna ila nti ana howa hiya li kaywqa3 kayt7ded ach".split(" ").map((w) => normalize(w)),
  ),
  FRENCH: new Set(
    "je tu il nous vous mon ma mes quand combien que qui est ce comment si pas paiement mois tour ordre de la le les du des un une pour dans sur avec rate paie peux dois recois touche dis moi tous quel quelle vos votre puis est ce qu il y".split(" "),
  ),
  ENGLISH: new Set(
    "my when how much what who is the do i if will am pay turn owe receive get paid miss payment can does this it to of order next which tell me everyone show you are was have has there any please about anyone all their his her your safety fund record score points level change swap licensed should take loan would could get make give need want where why with for from and".split(" "),
  ),
};

/** Same language and script the member wrote in. Falls back to their chosen language. */
export function pickLanguage(message: string, preferred: Language): Language {
  if (hasArabicScript(message)) return "ARABIC";
  const words = normalize(message).split(" ");
  const score = (set: Set<string>) => words.filter((w) => set.has(w)).length;
  const s = { DARIJA: score(MARKERS.DARIJA), FRENCH: score(MARKERS.FRENCH), ENGLISH: score(MARKERS.ENGLISH) };
  const max = Math.max(s.DARIJA, s.FRENCH, s.ENGLISH);
  if (max === 0) return preferred === "ARABIC" ? "ENGLISH" : preferred;
  // on a tie: the member's chosen language, otherwise English
  const winners = (["ENGLISH", "FRENCH", "DARIJA"] as const).filter((k) => s[k] === max);
  return winners.includes(preferred as keyof typeof s) ? preferred : winners[0]!;
}

/**
 * "Can I...?" questions ask about what is allowed, which a keyword match cannot answer
 * ("can I swap my turn?" mentions "my turn" but is not asking when it is).
 */
const PERMISSION = ["can i", "could i", "may i", "am i allowed", "is it possible", "puis je", "est ce que je peux", "est ce possible", "wach nqdar", "wach imken", "wach ymken", "هل يمكنني", "هل استطيع", "هل يمكن"].map((p) => normalize(p));
export function isPermissionQuestion(message: string): boolean {
  const text = normalize(message);
  return PERMISSION.some((p) => text.startsWith(p));
}
