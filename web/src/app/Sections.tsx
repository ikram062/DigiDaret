import { useAuth } from "@/auth/context"
import { languageLabel } from "@/lib/api"
import { ComingSoon } from "./ComingSoon"

export function Circles() {
  return (
    <ComingSoon
      eyebrow="My circles"
      title="Create your circle"
      intro="Keep the Daret exactly as you know it. We add the protection it never had."
      points={[
        "Name it, set the monthly amount and the number of members.",
        "Invite friends with a WhatsApp link. Every member is ID-verified.",
        "Agree the dates, payout order and missed-payment rules upfront. Everyone accepts them before it starts.",
        "See the Safety Fund and who still owes what, in one place.",
      ]}
    />
  )
}

export function Payments() {
  return (
    <ComingSoon
      eyebrow="Payments"
      title="Automatic payments"
      intro="The monthly contribution is debited on the agreed date. Nobody chases anybody."
      points={[
        "Your contributions and the pot you receive, month by month.",
        "If a payment is missed: a reminder, a retry, then a short grace period.",
        "If it is still unpaid, the Safety Fund covers the gap up to a cap. The member still owes it.",
      ]}
    />
  )
}

export function Record() {
  return (
    <ComingSoon
      eyebrow="Trust Record"
      title="A history you own"
      intro="Every on-time payment is recorded. It belongs to you, and a lender sees it only with your consent."
      points={[
        "Your payment facts and your Reliability Level, worked out by published rules.",
        "A one-page Trust Statement you can send to a lender.",
        "A \"Share with a lender\" switch that is off by default, with a log of every share.",
      ]}
    />
  )
}

export function Assistant() {
  const { user } = useAuth()
  return (
    <ComingSoon
      eyebrow="AI assistant"
      title="Your rules, in your language"
      intro="Ask about your circle: when is my turn, how much is due, what happens if I miss. It explains. It never decides, predicts or approves anything."
      points={[
        "Answers come from the rules your group agreed, not from a guess.",
        "Reminders before a due date.",
        user
          ? `It will answer in ${languageLabel[user.preferredLanguage]}, the language you chose.`
          : "Darija, Arabic, French or English.",
      ]}
    />
  )
}
