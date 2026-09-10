interface ProviderBadgeProps {
  speaker: string
  className?: string
}

/**
 * Always-visible badge showing the active TTS provider.
 * Required by the hackathon eligibility rules:
 * "Make the active speech provider observable."
 */
export function ProviderBadge({ speaker, className = '' }: ProviderBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-accent-700 bg-accent-950 px-3 py-1 text-xs font-mono text-accent-300 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
      <span>Speech: Rime · mistv2 · {speaker || '—'}</span>
    </div>
  )
}
