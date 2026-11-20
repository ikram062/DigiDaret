import { Marquee } from "@/components/fx/Marquee"

const rowA = [
  ["Daret", "دارت"],
  ["Gameya", "جمعية"],
  ["Tontine", ""],
  ["Susu", ""],
  ["Esusu", ""],
  ["Njangi", ""],
  ["Chama", ""],
  ["Stokvel", ""],
]
const rowB = [
  ["Sanduq", "صندوق"],
  ["Equb", ""],
  ["Hagbad", ""],
  ["Upatu", ""],
  ["Ajo", ""],
  ["Mukando", ""],
  ["Xitique", ""],
]

function Row({ items, outline }: { items: string[][]; outline?: boolean }) {
  return (
    <>
      {items.map(([name, ar], i) => (
        <span key={name} className="flex items-center">
          <span
            className={`font-display text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-none tracking-tight ${
              (i % 2 === 0) !== !!outline ? "text-sand" : "text-outline text-sand/60"
            }`}
          >
            {name}
          </span>
          {ar && <span className="mx-4 font-arabic text-[clamp(1.5rem,3vw,2.5rem)] text-saffron">{ar}</span>}
          <span className="mx-8 size-3 rotate-45 bg-jade" />
        </span>
      ))}
    </>
  )
}

/** One idea, many names. */
export function Names() {
  return (
    <section className="relative overflow-hidden bg-ink py-16 text-sand">
      <p className="mb-8 px-5 text-center text-xs uppercase tracking-[0.3em] text-sand/50">
        One circle. Many names. Across a whole continent.
      </p>
      <Marquee duration={50}>
        <Row items={rowA} />
      </Marquee>
      <div className="h-4" />
      <Marquee reverse duration={60}>
        <Row items={rowB} outline />
      </Marquee>
    </section>
  )
}
