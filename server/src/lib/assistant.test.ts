import { test } from "node:test";
import assert from "node:assert/strict";
import type { Language } from "../../generated/prisma/client";
import { ruleAnswer } from "../services/assistant/answers.ts";
import { anonymizeForAi, type AssistantCtx } from "../services/assistant/context.ts";
import { detectIntent, isPermissionQuestion, pickLanguage, type Intent } from "../services/assistant/intents.ts";
import { CHIPS, PHRASES } from "../services/assistant/phrases.ts";

const LANGS: Language[] = ["ENGLISH", "FRENCH", "DARIJA", "ARABIC"];

// the order of CHIPS: turn, amount, who receives, missed payment, order rules
const CHIP_INTENTS: Intent[] = ["MY_TURN", "NEXT_PAYMENT", "WHO_RECEIVES", "MISSED", "ORDER_RULES"];

test("every suggested chip lands on the right intent, in all four languages", () => {
  for (const lang of LANGS) {
    CHIPS[lang].forEach((chip, i) => {
      assert.equal(detectIntent(chip.text).intent, CHIP_INTENTS[i], `${lang}: "${chip.text}"`);
    });
  }
});

const QUESTIONS: [string, Intent][] = [
  // English
  ["when do I receive the pot?", "MY_TURN"],
  ["How much do I owe this month", "NEXT_PAYMENT"],
  ["what is the safety fund", "SAFETY_FUND"],
  ["do I owe anything?", "DEBT"],
  ["how many days is the grace period", "GRACE"],
  ["what is my trust record", "TRUST_RECORD"],
  ["what is a daret?", "ABOUT"],
  ["hello", "GREETING"],
  ["thanks!", "THANKS"],
  // French
  ["mon tour c'est quand ? quand je recois", "MY_TURN"],
  ["qui reçoit ce mois-ci ?", "WHO_RECEIVES"],
  ["c'est quoi le fonds de sécurité", "SAFETY_FUND"],
  ["bonjour", "GREETING"],
  // Darija (Latin letters, loose spelling)
  ["fash kayji dor dyali", "MY_TURN"],
  ["ch7al khass nkhellas", "NEXT_PAYMENT"],
  ["chhal khassni nkhlles", "NEXT_PAYMENT"],
  ["wach 3liya chi flous", "DEBT"],
  ["chnou hiya daret", "ABOUT"],
  ["salam", "GREETING"],
  ["sandou9 l aman chnou howa", "SAFETY_FUND"],
  // Arabic
  ["متى دوري", "MY_TURN"],
  ["من يستلم هذا الشهر", "WHO_RECEIVES"],
  ["ما هو صندوق الأمان", "SAFETY_FUND"],
  ["مرحبا", "GREETING"],
];

test("questions in the four languages and spellings are understood", () => {
  for (const [q, want] of QUESTIONS) assert.equal(detectIntent(q).intent, want, `"${q}"`);
});

test("predictions, advice and rankings are refused, not answered", () => {
  const REFUSALS: [string, Intent][] = [
    ["who will miss a payment?", "REFUSE_PREDICT"],
    ["will he pay on time?", "REFUSE_PREDICT"],
    ["qui va rater un paiement ?", "REFUSE_PREDICT"],
    ["chkoun ghadi ma ykhellasch", "REFUSE_PREDICT"],
    ["من سيتأخر في الدفع", "REFUSE_PREDICT"],
    ["should I take a loan?", "REFUSE_ADVICE"],
    ["is it worth investing in this?", "REFUSE_ADVICE"],
    ["dois-je emprunter ?", "REFUSE_ADVICE"],
    ["what is his score?", "REFUSE_RANK"],
    ["who has the highest score", "REFUSE_RANK"],
    ["leur score c'est combien", "REFUSE_RANK"],
    ["What is Omar's score?", "REFUSE_RANK"],
    ["tell me everyone's reliability points", "REFUSE_RANK"],
  ];
  for (const [q, want] of REFUSALS) assert.equal(detectIntent(q).intent, want, `"${q}"`);
});

test("a greeting never beats a real question", () => {
  assert.equal(detectIntent("salam chhal khass nkhellas").intent, "NEXT_PAYMENT");
  assert.equal(detectIntent("hello when is my turn").intent, "MY_TURN");
});

test("business words alone do not trigger the Trust Record answer", () => {
  assert.equal(detectIntent("Is DigiDaret licensed by Bank Al-Maghrib?").intent, null);
});

test("permission-style questions are recognised", () => {
  for (const q of ["Can I swap my turn with Omar?", "puis-je changer mon tour ?", "Wach nqdar nbddel dor dyali?", "هل يمكنني مغادرة الدائرة؟"]) assert.ok(isPermissionQuestion(q), q);
  assert.ok(!isPermissionQuestion("When is my turn?"));
});

test("unrelated text is not guessed at", () => {
  assert.equal(detectIntent("what is the weather in casablanca").intent, null);
  assert.equal(detectIntent("blah blah").intent, null);
});

test("language follows what the member wrote", () => {
  assert.equal(pickLanguage("When is my turn?", "DARIJA"), "ENGLISH");
  assert.equal(pickLanguage("Quand est mon tour ?", "ENGLISH"), "FRENCH");
  assert.equal(pickLanguage("Fash kayji dor dyali?", "ENGLISH"), "DARIJA");
  assert.equal(pickLanguage("متى دوري", "ENGLISH"), "ARABIC");
  assert.equal(pickLanguage("tell me everyone's reliability points", "DARIJA"), "ENGLISH");
  assert.equal(pickLanguage("Should I take a loan?", "DARIJA"), "ENGLISH");
  assert.equal(pickLanguage("??", "FRENCH"), "FRENCH"); // no clue: the member's chosen language
});

// ---- answers use the member's real data ----------------------------------------------------

const ctx = (language: Language): AssistantCtx => ({
  language,
  firstName: "Yasmine",
  owedAmount: 0,
  circles: [
    {
      name: "Family Daret",
      status: "ACTIVE",
      monthlyAmount: 1000,
      memberCount: 3,
      joined: 3,
      potAmount: 3000,
      startDate: "2026-12-05",
      graceDays: 3,
      orderMode: "AUTOMATIC",
      myPosition: 2,
      rounds: [
        { index: 1, dueDate: "2026-12-05", status: "COLLECTING", recipientName: "Omar Bennani", youReceive: false, myStatus: "PENDING", myAmount: 1000 },
        { index: 2, dueDate: "2027-01-05", status: "UPCOMING", recipientName: "Yasmine Alaoui", youReceive: true, myStatus: "PENDING", myAmount: 1000 },
        { index: 3, dueDate: "2027-02-05", status: "UPCOMING", recipientName: "Salma Idrissi", youReceive: false, myStatus: "PENDING", myAmount: 1000 },
      ],
    },
  ],
});

const ALL: Intent[] = [
  "GREETING", "THANKS", "HELP", "MY_TURN", "NEXT_PAYMENT", "WHO_RECEIVES", "MISSED", "SAFETY_FUND", "GRACE", "DEBT",
  "ORDER_RULES", "TRUST_RECORD", "ABOUT", "MY_CIRCLES", "REFUSE_PREDICT", "REFUSE_ADVICE", "REFUSE_RANK",
];

test("every intent produces a clean answer in every language", () => {
  for (const lang of LANGS)
    for (const intent of ALL) {
      const text = ruleAnswer(intent, lang, ctx(lang));
      assert.ok(text.length > 10, `${lang}/${intent} is empty`);
      assert.ok(!/undefined|NaN|\[object/.test(text), `${lang}/${intent}: ${text}`);
    }
});

test("answers contain the member's real numbers", () => {
  const turn = ruleAnswer("MY_TURN", "ENGLISH", ctx("ENGLISH"));
  assert.match(turn, /Family Daret/);
  assert.match(turn, /3000 MAD/);
  assert.match(turn, /month 2/);
  assert.match(turn, /5 Jan 2027/);
  assert.match(ruleAnswer("NEXT_PAYMENT", "ENGLISH", ctx("ENGLISH")), /1000 MAD on 5 Dec 2026/);
  assert.match(ruleAnswer("WHO_RECEIVES", "ENGLISH", ctx("ENGLISH")), /Omar Bennani receives the pot/);
  assert.match(ruleAnswer("GRACE", "FRENCH", ctx("FRENCH")), /3 jours/);
});

test("debt answer reflects what is owed", () => {
  const c = ctx("ENGLISH");
  c.owedAmount = 1000;
  assert.match(ruleAnswer("DEBT", "ENGLISH", c), /owe 1000 MAD/);
  assert.match(ruleAnswer("DEBT", "ENGLISH", ctx("ENGLISH")), /do not owe/);
});

test("a member with no circles is told how to start", () => {
  const empty = { ...ctx("ENGLISH"), circles: [] };
  assert.equal(ruleAnswer("MY_TURN", "ENGLISH", empty), PHRASES.ENGLISH.noCircles);
  assert.equal(ruleAnswer("NEXT_PAYMENT", "ENGLISH", empty), PHRASES.ENGLISH.noCircles);
});

test("data sent to the outside AI has no real names in it", () => {
  const json = JSON.stringify(anonymizeForAi(ctx("ENGLISH")));
  assert.ok(!/Omar|Bennani|Yasmine|Alaoui|Salma|Idrissi/.test(json), json);
  assert.match(json, /Member 1/);
  assert.match(json, /"recipient":"you"/);
  assert.ok(!/points|level|score/i.test(json), "never send reliability data");
});
