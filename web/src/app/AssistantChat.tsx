import { useEffect, useRef, useState, type FormEvent } from "react"
import { Bot, Send, Sparkles } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { useFetch } from "@/lib/useFetch"
import { cn } from "@/lib/utils"
import { ErrorBox, Loading } from "./ui"

type Start = { welcome: string; chips: string[]; aiEnabled: boolean }
type Source = "rules" | "ai" | "fallback"
type Msg = { role: "user" | "assistant"; text: string; source?: Source }

const sourceNote: Record<Source, string | null> = {
  rules: "Answered from your circles and their rules",
  ai: "AI-generated from your circle data. It can be wrong.",
  fallback: null,
}

export function AssistantChat() {
  const { data, error, loading } = useFetch<Start>("/assistant/start")
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  const all: Msg[] = data ? [{ role: "assistant", text: data.welcome, source: "fallback" }, ...msgs] : msgs

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [msgs.length, busy])

  if (loading) return <Loading />
  if (error || !data) return <ErrorBox message={error ?? "The assistant is not available right now."} />

  async function send(text: string) {
    const message = text.trim()
    if (!message || busy) return
    const history = msgs.slice(-8).map((m) => ({ role: m.role, text: m.text }))
    setMsgs((m) => [...m, { role: "user", text: message }])
    setInput("")
    setBusy(true)
    try {
      const r = await api<{ reply: string; source: Source }>("/assistant", { body: { message, history } })
      setMsgs((m) => [...m, { role: "assistant", text: r.reply, source: r.source }])
    } catch (e) {
      const text = e instanceof ApiError ? e.message : "Something went wrong. Please try again."
      setMsgs((m) => [...m, { role: "assistant", text, source: "fallback" }])
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void send(input)
  }

  return (
    <div className="flex h-[calc(100svh-11rem)] min-h-[28rem] flex-col lg:h-[calc(100svh-7rem)]">
      <div className="mb-5">
        <p className="text-sm text-ink/50">AI assistant</p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-ink sm:text-5xl">Your rules, in your language</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-ink/60">
          <Sparkles className="size-4 text-forest" />
          Information only. It never decides, predicts or approves anything.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-ink/10 bg-white/60 p-4 sm:p-6" aria-live="polite">
        {all.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
            {m.role === "assistant" && (
              <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-forest text-sand">
                <Bot className="size-4" />
              </span>
            )}
            <div className={cn("max-w-[85%]", m.role === "user" && "text-right")}>
              <div
                dir="auto"
                className={cn(
                  "inline-block whitespace-pre-line rounded-2xl px-4 py-3 text-left text-[15px] leading-relaxed",
                  m.role === "user" ? "rounded-br-md bg-saffron text-ink" : "rounded-bl-md bg-sand-2/80 text-ink",
                )}
              >
                {m.text}
              </div>
              {m.role === "assistant" && m.source && sourceNote[m.source] && <p className="mt-1 px-1 text-[11px] text-ink/40">{sourceNote[m.source]}</p>}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-forest text-sand">
              <Bot className="size-4" />
            </span>
            <div className="flex gap-1 rounded-2xl rounded-bl-md bg-sand-2/80 px-4 py-4" aria-label="The assistant is typing">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-1.5 animate-bounce rounded-full bg-ink/40" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={end} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {data.chips.map((c) => (
          <button key={c} type="button" disabled={busy} onClick={() => send(c)} className="rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-sm text-ink/75 transition hover:border-forest hover:text-forest disabled:opacity-50">
            {c}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={400}
          dir="auto"
          placeholder="Ask about your circle…"
          aria-label="Your question"
          className="h-12 min-w-0 flex-1 rounded-2xl border border-ink/15 bg-white px-4 text-ink outline-none placeholder:text-ink/35 focus:border-forest focus:ring-2 focus:ring-jade/30"
        />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="flex size-12 items-center justify-center rounded-2xl bg-forest text-sand transition hover:bg-ink disabled:opacity-50">
          <Send className="size-5" />
        </button>
      </form>
    </div>
  )
}
