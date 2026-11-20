import { ComingSoon } from "./ComingSoon"

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
