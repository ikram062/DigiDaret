import type { Language } from "../../../generated/prisma/client";
import type { AssistantCtx, CircleCtx } from "./context.ts";
import type { Intent } from "./intents.ts";
import { PHRASES, fmtDate, type TurnKind } from "./phrases.ts";

/** A deterministic answer written from the member's own data. No AI involved, so it cannot invent anything. */
export function ruleAnswer(intent: Intent, lang: Language, ctx: AssistantCtx): string {
  const P = PHRASES[lang];
  const d = (iso: string) => fmtDate(lang, iso);
  const circles = ctx.circles;
  const perCircle = (f: (c: CircleCtx) => string | null, empty: string) => {
    const lines = circles.map(f).filter((x): x is string => !!x);
    return lines.length ? lines.join("\n") : empty;
  };

  switch (intent) {
    case "GREETING":
      return P.hello(ctx.firstName);
    case "THANKS":
      return P.thanks;
    case "HELP":
      return P.help;

    case "MY_TURN":
      return perCircle((c) => {
        if (c.status === "ACTIVE" && c.myPosition) {
          const r = c.rounds.find((x) => x.index === c.myPosition);
          return P.turn(c, "active", c.myPosition, r ? d(r.dueDate) : "");
        }
        const kind: TurnKind = c.myPosition ? "proposed" : c.orderMode === "AUTOMATIC" ? "autoPending" : "manualPending";
        return P.turn(c, kind, c.myPosition ?? 0, "");
      }, P.noCircles);

    case "NEXT_PAYMENT": {
      if (circles.length === 0) return P.noCircles;
      const lines = circles.map((c) => {
        if (c.status === "FORMING") return P.notStarted(c, d(c.startDate));
        const next = c.rounds.find((r) => r.myStatus === "PENDING");
        return next ? P.nextPay(c, next.myAmount ?? c.monthlyAmount, d(next.dueDate)) : null;
      });
      const out = lines.filter((x): x is string => !!x);
      return out.length ? out.join("\n") : P.nothingDue;
    }

    case "WHO_RECEIVES":
      return perCircle((c) => {
        if (c.status === "FORMING") return P.notStarted(c, d(c.startDate));
        const cur = c.rounds.find((r) => r.status === "COLLECTING") ?? c.rounds.find((r) => r.status === "UPCOMING");
        return cur ? P.whoRecv(c, cur.recipientName, cur.youReceive, d(cur.dueDate)) : null;
      }, P.noCircles);

    case "MY_CIRCLES":
      return perCircle((c) => P.circleLine(c), P.noCircles);

    case "GRACE":
      return circles.length ? circles.map((c) => P.grace(c)).join("\n") : P.graceGeneric;

    case "DEBT":
      return ctx.owedAmount > 0 ? P.owes(ctx.owedAmount) : P.owesNothing;

    case "MISSED":
      return P.missed;
    case "SAFETY_FUND":
      return P.safetyFund;
    case "ORDER_RULES":
      return P.order;
    case "TRUST_RECORD":
      return P.trust;
    case "ABOUT":
      return P.about;
    case "REFUSE_PREDICT":
      return P.refusePredict;
    case "REFUSE_ADVICE":
      return P.refuseAdvice;
    case "REFUSE_RANK":
      return P.refuseRank;
  }
}

export const unknownAnswer = (lang: Language) => `${PHRASES[lang].unknown} ${PHRASES[lang].help}`;
