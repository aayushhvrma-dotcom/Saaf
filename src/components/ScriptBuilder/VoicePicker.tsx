import { useEffect, useState } from 'react'
import { fetchVoices, getMistV2EnglishVoices } from '../../lib/api'

interface VoicePickerProps {
  value: string
  onChange: (speaker: string) => void
}

/**
 * Voice dropdown populated from the live Rime catalog.
 * Filtered to Mist v2 English voices.
 * Default: first voice in catalog (typically a well-rounded English voice).
 *
 * Using the live catalog instead of a hardcoded list satisfies the brief's
 * requirement: "use the current catalog at submission time."
 */
export function VoicePicker({ value, onChange }: VoicePickerProps) {
  const [voices, setVoices] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVoices()
      .then(({ catalog }) => {
        const v = getMistV2EnglishVoices(catalog as Record<string, Record<string, string[]>>)
        setVoices(v)
        if (!value && v.length > 0) {
          onChange(v[0])
        }
      })
      .catch(() => setError('Failed to load voice catalog'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="animate-spin">⟳</span> Loading voices from Rime catalog…
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400">
        Voice
        <span className="ml-2 text-gray-600">(Mist v2 · English)</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
        title="Mist v2 selected — the only current model supporting inline custom phonetic pronunciation (phonemizeBetweenBrackets)"
      >
        {voices.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-600">
        Mist v2 is selected because it supports inline pronunciation control via{' '}
        <code className="text-gray-500">phonemizeBetweenBrackets</code> — the mechanism
        this pipeline depends on.
      </p>
    </div>
  )
}
