import { useRef, useState } from 'react'
import { synthesize } from '../lib/api'
import type { PipelineResult } from '../lib/pipeline'
import { applyPipeline } from '../lib/pipeline'

interface PlaybackPanelProps {
  naiveResult: PipelineResult
  speaker: string
  rawIdentifier: string
}

type PlayState = 'idle' | 'loading' | 'playing' | 'error'

interface AudioAction {
  label: string
  emoji: string
  mode: 'naive' | 'tuned' | 'slower' | 'spelled'
  title: string
  primary?: boolean
}

const ACTIONS: AudioAction[] = [
  {
    label: 'Play Tuned',
    emoji: '▶',
    mode: 'tuned',
    title: 'Play the controlled-delivery version with spell(), pauses, and pronunciation control',
    primary: true,
  },
  {
    label: 'Play Naive',
    emoji: '⚠',
    mode: 'naive',
    title: 'Play the raw naive version — shows the problem we are solving',
  },
  {
    label: 'Repeat Slower',
    emoji: '🐢',
    mode: 'slower',
    title: 'Repeat at reduced speed (speedAlpha > 1.0 on Mist v2 = slower)',
  },
  {
    label: 'Spell It Out',
    emoji: '🔤',
    mode: 'spelled',
    title: 'Spell the identifier character by character using spell()',
  },
]

export function PlaybackPanel({
  naiveResult,
  speaker,
  rawIdentifier,
}: PlaybackPanelProps) {
  const [playState, setPlayState] = useState<PlayState>('idle')
  const [activeMode, setActiveMode] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentBlobUrl = useRef<string | null>(null)

  async function play(mode: AudioAction['mode']) {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current)
      currentBlobUrl.current = null
    }

    setPlayState('loading')
    setActiveMode(mode)
    setErrorMsg(null)

    try {
      // Choose the right pipeline result
      let result: PipelineResult
      if (mode === 'naive') {
        result = naiveResult
      } else {
        result = applyPipeline(
          naiveResult.text, // raw sentence
          rawIdentifier,
          mode,
        )
      }

      const blobUrl = await synthesize({
        text: result.text,
        speaker,
        speedAlpha: result.speedAlpha,
        phonemizeBetweenBrackets: result.phonemizeBetweenBrackets,
        pauseBetweenBrackets: result.pauseBetweenBrackets,
      })

      currentBlobUrl.current = blobUrl
      const audio = new Audio(blobUrl)
      audioRef.current = audio

      audio.onplay = () => setPlayState('playing')
      audio.onended = () => {
        setPlayState('idle')
        setActiveMode(null)
      }
      audio.onerror = () => {
        setPlayState('error')
        setErrorMsg('Audio playback failed')
      }

      await audio.play()
    } catch (err) {
      setPlayState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Synthesis failed')
      setActiveMode(null)
    }
  }

  const isLoading = playState === 'loading'

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Playback</h3>
        {playState === 'playing' && (
          <span className="flex items-center gap-1.5 text-xs text-accent-400">
            <span className="animate-pulse">●</span> Playing via Rime
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACTIONS.map((action) => {
          const isActive = activeMode === action.mode
          return (
            <button
              key={action.mode}
              onClick={() => play(action.mode)}
              disabled={isLoading}
              title={action.title}
              className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                action.primary
                  ? isActive
                    ? 'border-accent-500 bg-accent-600 text-white'
                    : 'border-accent-700 bg-accent-900 text-accent-300 hover:bg-accent-800'
                  : isActive
                    ? 'border-gray-500 bg-gray-700 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">
                {isActive && isLoading ? '⟳' : action.emoji}
              </span>
              <span>{action.label}</span>
            </button>
          )
        })}
      </div>

      {playState === 'error' && errorMsg && (
        <p className="mt-3 rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-xs text-red-400">
          ⚠ {errorMsg}
        </p>
      )}

      <div className="mt-3 text-xs text-gray-600">
        <strong className="text-gray-500">Tip:</strong> Play Naive first to hear the problem,
        then Play Tuned to hear the improvement.
      </div>
    </div>
  )
}
