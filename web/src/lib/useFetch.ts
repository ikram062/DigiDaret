import { useCallback, useEffect, useState } from "react"
import { api } from "./api"

type State<T> = { data?: T; error?: string; loading: boolean }

/** Loads `path` once (and again on `reload`). `setData` lets an action swap in a fresh response. */
export function useFetch<T>(path: string) {
  const [state, setState] = useState<State<T>>({ loading: true })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let off = false
    api<T>(path)
      .then((data) => !off && setState({ data, loading: false }))
      .catch((e: Error) => !off && setState({ error: e.message, loading: false }))
    return () => {
      off = true
    }
  }, [path, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  const setData = useCallback((data: T) => setState({ data, loading: false }), [])
  return { ...state, reload, setData }
}
