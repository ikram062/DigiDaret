import { useEffect } from "react"
import { ScrollTrigger } from "@/lib/gsap"
import { initLenis } from "@/lib/lenis"
import { Nav } from "@/sections/Nav"
import { Hero } from "@/sections/Hero"
import { Names } from "@/sections/Names"
import { Problem } from "@/sections/Problem"
import { HowItWorks } from "@/sections/HowItWorks"
import { SafetyDemo } from "@/sections/SafetyDemo"
import { TrustRecord } from "@/sections/TrustRecord"
import { Assistant } from "@/sections/Assistant"
import { Africa } from "@/sections/Africa"
import { StatusFooter } from "@/sections/StatusFooter"

export function Landing() {
  useEffect(() => {
    window.scrollTo(0, 0)
    const destroy = initLenis()
    // fonts change layout, so re-measure once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return destroy
  }, [])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Names />
        <Problem />
        <HowItWorks />
        <SafetyDemo />
        <TrustRecord />
        <Assistant />
        <Africa />
        <StatusFooter />
      </main>
    </>
  )
}
