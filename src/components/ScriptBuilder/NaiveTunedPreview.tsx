interface NaiveTunedPreviewProps {
  naiveText: string
  tunedText: string
}

/**
 * Side-by-side display of the raw (naive) and controlled-delivery (tuned)
 * text strings before synthesis. Lets judges see the mechanism — not just
 * hear the output.
 */
export function NaiveTunedPreview({ naiveText, tunedText }: NaiveTunedPreviewProps) {
  if (!naiveText && !tunedText) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
            Naive
          </span>
          <span className="text-xs text-gray-600">Raw string, no processing</span>
        </div>
        <p className="font-mono text-xs text-gray-300 break-all">{naiveText || '—'}</p>
      </div>

      <div className="rounded-lg border border-accent-800/50 bg-accent-950/30 p-3">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-400">
            Tuned
          </span>
          <span className="text-xs text-gray-600">spell() + pauses + phonemes</span>
        </div>
        <p className="font-mono text-xs text-gray-300 break-all">{tunedText || '—'}</p>
      </div>
    </div>
  )
}
