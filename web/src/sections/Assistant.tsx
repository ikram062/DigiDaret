import { useRef } from "react"
import { Bot, Check, X } from "lucide-react"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap"
import { SplitReveal } from "@/components/fx/SplitReveal"

const does = [
  "Answers: when is my turn, how much is due, what if I miss",
  "Sends reminders before a due date",
  "Explains the rules the group already agreed",
  "Speaks Darija, Arabic, French and English",
]
const never = [
  "Predict who will miss a payment",
  "Score or rank members, or set anyone's deposit",
  "Approve, refuse or recommend a loan",
  "Give financial or legal advice",
]

const chat = [
  { who: "me", ar: "Fash kayji dor dyali?", en: "When is my turn?" },
  {
    who: "bot",
    ar: "Dorek f chher 3. Hada mktoub f l-contrat li wafe9ti 3lih.",
    en: "Your turn is in month 3. It is written in the contract you accepted.",
  },
  { who: "me", ar: "Chkoun ghadi y-khser?", en: "Who will miss a payment?" },
  {
    who: "bot",
    ar: "Ma kan-t-wa9a3ch. Kan-chra7 ghir l-9awanin li dwiti 3lihom f l-group.",
    en: "I do not predict. I only explain the rules your group agreed.",
  },
]

export function Assistant() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const msgs = gsap.utils.toArray<HTMLElement>("[data-msg]")
      gsap.set(msgs, { opacity: 0, y: 20, scale: 0.96 })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: "[data-chat]", start: "top 70%", once: true },
      })
      msgs.forEach((m, i) => {
        const isBot = m.dataset.who === "bot"
        tl.to(m, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, i === 0 ? 0 : `>${isBot ? 0.9 : 0.5}`)
      })
      gsap.from("[data-list] li", {
        opacity: 0,
        x: -24,
        stagger: 0.07,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-list]", start: "top 85%", once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="assistant" className="grain relative overflow-hidden bg-ink-2 py-28 text-sand sm:py-36">
      <div className="absolute -right-40 top-1/3 size-[500px] rounded-full bg-majorelle/20 blur-[140px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        {/* chat */}
        <div data-chat className="order-2 lg:order-1">
          <div className="mx-auto max-w-md rounded-[2.2rem] border border-white/10 bg-ink p-4 shadow-[0_40px_100px_rgba(0,0,0,.5)]">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-jade text-ink">
                <Bot className="size-5" />
              </span>
              <div>
                <div className="font-medium">DigiDaret assistant</div>
                <div className="text-xs text-jade">Information only</div>
              </div>
            </div>
            <div className="space-y-3 px-1 py-5">
              {chat.map((m, i) => (
                <div
                  key={i}
                  data-msg
                  data-who={m.who}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    m.who === "me"
                      ? "ml-auto rounded-br-md bg-saffron text-ink"
                      : "rounded-bl-md bg-white/10 text-sand"
                  }`}
                >
                  <p className="font-medium leading-snug">{m.ar}</p>
                  <p className={`mt-1 text-xs italic ${m.who === "me" ? "text-ink/60" : "text-sand/50"}`}>
                    {m.en}
                  </p>
                </div>
              ))}
            </div>
            <p className="px-3 pb-2 text-center text-[11px] text-sand/30">
              Prototype · answers come from the agreed rules, not from a guess
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-jade">Your AI agent</p>
          <SplitReveal
            as="h2"
            onScroll
            text="Rules in your own language."
            accent={["language."]}
            accentClass="italic text-saffron"
            className="font-display text-[clamp(2.4rem,5vw,4.4rem)] font-semibold leading-[1.02]"
          />
          <p className="mt-6 max-w-lg text-lg text-sand/70">
            It explains. It never decides, predicts or approves anything, and it is the only AI
            feature we claim.
          </p>
          <div data-list className="mt-10 grid gap-8 sm:grid-cols-2">
            <ul className="space-y-3">
              <li className="mb-1 text-xs font-semibold uppercase tracking-widest text-jade">It does</li>
              {does.map((t) => (
                <li key={t} className="flex gap-3 text-sm text-sand/80">
                  <Check className="mt-0.5 size-4 shrink-0 text-jade" /> {t}
                </li>
              ))}
            </ul>
            <ul className="space-y-3">
              <li className="mb-1 text-xs font-semibold uppercase tracking-widest text-terracotta">It never</li>
              {never.map((t) => (
                <li key={t} className="flex gap-3 text-sm text-sand/80">
                  <X className="mt-0.5 size-4 shrink-0 text-terracotta" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
