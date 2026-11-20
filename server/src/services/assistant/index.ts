import type { Language } from "../../../generated/prisma/client";
import { env } from "../../config/env.ts";
import { ruleAnswer, unknownAnswer } from "./answers.ts";
import type { AssistantCtx } from "./context.ts";
import { detectIntent, isPermissionQuestion, pickLanguage } from "./intents.ts";
import { askAi } from "./llm.ts";
import { CHIPS, PHRASES } from "./phrases.ts";

export type Source = "rules" | "ai" | "fallback";
export type Reply = { reply: string; source: Source; language: Language };

const LANGUAGE_NAME: Record<Language, string> = {
  ENGLISH: "English",
  FRENCH: "French",
  DARIJA: "Darija in Latin letters",
  ARABIC: "Arabic",
};

/**
 * 1) Known questions are answered by the rules engine from the member's real data.
 *    Free, instant, and it cannot make anything up.
 * 2) Anything else goes to the free AI model, if a key is set, with strict instructions.
 * 3) If that is off or fails, a safe fallback lists what the assistant can do.
 */
export async function answer(
  message: string,
  history: { role: "user" | "assistant"; text: string }[],
  ctx: AssistantCtx,
): Promise<Reply> {
  const language = pickLanguage(message, ctx.language);
  const { intent } = detectIntent(message);

  const refusal = intent?.startsWith("REFUSE_") ?? false;
  // "Can I...?" questions are about what is allowed. Rules cannot answer them, the AI can.
  const askAiFirst = isPermissionQuestion(message) && !refusal;

  if (intent && !askAiFirst) return { reply: ruleAnswer(intent, language, ctx), source: "rules", language };

  const ai = await askAi(ctx, LANGUAGE_NAME[language], history, message);
  if (ai) return { reply: ai, source: "ai", language };

  // The AI is off or down. A plain keyword question still gets its rule answer, but a
  // "Can I...?" question does not: the nearest rule would answer a different question.
  if (intent && !askAiFirst) return { reply: ruleAnswer(intent, language, ctx), source: "rules", language };

  return { reply: unknownAnswer(language), source: "fallback", language };
}

export function startPayload(ctx: AssistantCtx) {
  return {
    welcome: PHRASES[ctx.language].hello(ctx.firstName),
    chips: CHIPS[ctx.language].map((c) => c.text),
    aiEnabled: !!env.geminiKey,
  };
}
