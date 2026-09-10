import { useEffect, useRef, useState } from 'react'
import { checkCoverage } from '../../lib/api'

interface CoverageBadgesProps {
  tokens: string[]
}

type CoverageStatus = 'loading' | 'known' | 'oov' | 'idle'

interface TokenStatus {
  token: string
  status: CoverageStatus
}

/**
 * Shows a live OOV (out-of-vocabulary) badge for each identifier token.
 * Green = in Rime's dictionary; Amber = OOV, will use custom pronunciation.
 * Debounced to avoid hammering the API on every keystroke.
 */
export function CoverageBadges({ tokens }: CoverageBadgesProps) {
  const [statuses, setStatuses] = useState<TokenStatus[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const nonEmpty = tokens.filter((t) => t.trim().length > 0)
    if (nonEmpty.length === 0) {
      setStatuses([])
      return
    }

    // Initialize to loading
    setStatuses(nonEmpty.map((t) => ({ token: t, status: 'loading' })))

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const oovWords = await checkCoverage(nonEmpty.join(' '))
        const oovSet = new Set(oovWords)
        setStatuses(
          nonEmpty.map((t) => ({
            token: t,
            status: oovSet.has(t) ? 'oov' : 'known',
          })),
        )
      } catch {
        setStatuses(nonEmpty.map((t) => ({ token: t, status: 'idle' })))
      }
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [tokens])

  if (statuses.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map(({ token, status }) => (
        <span
          key={token}
          title={
            status === 'oov'
              ? 'Not in Rime dictionary — custom pronunciation will be applied'
              : status === 'known'
                ? 'In Rime dictionary'
                : 'Checking…'
          }
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-medium transition-colors ${
            status === 'known'
              ? 'border border-green-800 bg-green-950 text-green-400'
              : status === 'oov'
                ? 'border border-amber-700 bg-amber-950 text-amber-400'
                : 'border border-gray-700 bg-gray-900 text-gray-500'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === 'known'
                ? 'bg-green-400'
                : status === 'oov'
                  ? 'bg-amber-400'
                  : 'bg-gray-500 animate-pulse'
            }`}
          />
          {token}
          {status === 'oov' && <span className="opacity-70">OOV</span>}
        </span>
      ))}
    </div>
  )
}
