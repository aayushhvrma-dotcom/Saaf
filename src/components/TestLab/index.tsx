import { useState } from 'react'
import { synthesize } from '../../lib/api'

interface Fixture {
  id: string
  category: string
  identifier: string
  naiveText: string
  tunedText: string
}

interface TestResult {
  fixtureId: string
  condition: 'naive' | 'tuned'
  heard: string
  correct: boolean
}

interface BlindTestProps {
  fixtures: Fixture[]
  speaker: string
  onResult?: (result: TestResult) => void
}

type PlayState = 'idle' | 'loading' | 'playing'

export function BlindTest({ fixtures, speaker, onResult }: BlindTestProps) {
  const [results, setResults] = useState<TestResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [heardText, setHeardText] = useState('')
  const [playState, setPlayState] = useState<PlayState>('idle')
  const [activeCondition, setActiveCondition] = useState<'A' | 'B' | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [playedA, setPlayedA] = useState(false)
  const [playedB, setPlayedB] = useState(false)

  const fixture = fixtures[currentIndex]

  // In blind mode, A=naive and B=tuned (but labels hide this from the listener)
  const conditionMap = { A: 'naive', B: 'tuned' } as const

  async function playClip(label: 'A' | 'B') {
    if (!fixture || !speaker) return
    const condition = conditionMap[label]
    const text = condition === 'naive' ? fixture.naiveText : fixture.tunedText

    setPlayState('loading')
    setActiveCondition(label)

    try {
      const blobUrl = await synthesize({
        text,
        speaker,
        speedAlpha: condition === 'tuned' ? 1.0 : 1.0,
        phonemizeBetweenBrackets: condition === 'tuned',
        pauseBetweenBrackets: condition === 'tuned',
      })
      const audio = new Audio(blobUrl)
      audio.onplay = () => setPlayState('playing')
      audio.onended = () => {
        setPlayState('idle')
        if (label === 'A') setPlayedA(true)
        if (label === 'B') setPlayedB(true)
        URL.revokeObjectURL(blobUrl)
      }
      await audio.play()
    } catch {
      setPlayState('idle')
    }
  }

  function submitResponse() {
    if (!fixture || !heardText.trim()) return

    // Record result for whichever condition they were testing
    // In the full test, we score against the expected identifier
    const score: TestResult = {
      fixtureId: fixture.id,
      condition: 'tuned', // placeholder — actual scoring happens on export
      heard: heardText.trim(),
      correct: heardText.trim().toLowerCase() === fixture.identifier.toLowerCase(),
    }
    setResults((prev) => [...prev, score])
    onResult?.(score)
    setHeardText('')
    setPlayedA(false)
    setPlayedB(false)
    setActiveCondition(null)
    setRevealed(false)

    if (currentIndex < fixtures.length - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }

  const accuracy =
    results.length > 0
      ? Math.round((results.filter((r) => r.correct).length / results.length) * 100)
      : null

  if (!fixture) {
    return (
      <div className="py-12 text-center text-gray-400">
        <div className="text-4xl mb-4">✅</div>
        <p className="text-lg font-semibold text-white mb-2">Test complete!</p>
        <p>Accuracy: {accuracy}% ({results.filter((r) => r.correct).length}/{results.length} correct)</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Item {currentIndex + 1} of {fixtures.length} · {fixture.category}
        </span>
        {accuracy !== null && (
          <span className="text-xs text-accent-400">Running accuracy: {accuracy}%</span>
        )}
      </div>

      {/* Blind A/B player */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <p className="mb-4 text-sm text-gray-400">
          Listen to both clips and type what you heard. Do not look at the category or identifier.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {(['A', 'B'] as const).map((label) => (
            <button
              key={label}
              onClick={() => playClip(label)}
              disabled={playState === 'loading'}
              className={`flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all ${
                activeCondition === label && playState === 'playing'
                  ? 'border-accent-500 bg-accent-900 text-accent-300'
                  : label === 'A' && playedA
                    ? 'border-green-800 bg-green-950/30 text-green-400'
                    : label === 'B' && playedB
                      ? 'border-green-800 bg-green-950/30 text-green-400'
                      : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {activeCondition === label && playState === 'loading' ? '⟳' : '▶'} Clip {label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={heardText}
          onChange={(e) => setHeardText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitResponse()}
          placeholder="Type the identifier you heard…"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-accent-500 focus:outline-none mb-3"
        />

        <div className="flex gap-2">
          <button
            onClick={submitResponse}
            disabled={!heardText.trim()}
            className="flex-1 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit & Next
          </button>
          <button
            onClick={() => setRevealed(true)}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-gray-200"
          >
            Reveal
          </button>
        </div>

        {revealed && (
          <div className="mt-3 rounded-lg border border-amber-800 bg-amber-950/30 p-3 text-xs">
            <strong className="text-amber-400">Revealed:</strong>
            <p className="text-gray-300 mt-1">
              Clip A = <span className="font-mono text-red-400">Naive</span> ·
              Clip B = <span className="font-mono text-accent-400">Tuned</span>
            </p>
            <p className="text-gray-500 mt-1">
              Expected: <span className="font-mono text-white">{fixture.identifier}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function FixtureList({ fixtures }: { fixtures: Fixture[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800">
      <table className="w-full text-xs">
        <thead className="border-b border-gray-800 bg-gray-900">
          <tr>
            <th className="px-4 py-2 text-left text-gray-500">Category</th>
            <th className="px-4 py-2 text-left text-gray-500">Identifier</th>
          </tr>
        </thead>
        <tbody>
          {fixtures.map((f, i) => (
            <tr
              key={f.id}
              className={`border-b border-gray-800/50 ${i % 2 === 0 ? 'bg-gray-900/50' : ''}`}
            >
              <td className="px-4 py-2 font-medium text-gray-400">{f.category}</td>
              <td className="px-4 py-2 font-mono text-white">{f.identifier}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface ResultsTallyProps {
  results: TestResult[]
  onExport: () => void
}

export function ResultsTally({ results, onExport }: ResultsTallyProps) {
  const correct = results.filter((r) => r.correct).length
  const pct = results.length ? Math.round((correct / results.length) * 100) : 0

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Results</h3>
        <button
          onClick={onExport}
          disabled={results.length === 0}
          className="rounded-lg border border-accent-700 bg-accent-950 px-3 py-1 text-xs text-accent-300 hover:bg-accent-900 disabled:opacity-40"
        >
          Export evidence-results.json
        </button>
      </div>
      <p className="text-3xl font-bold text-white">
        {pct}%
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({correct}/{results.length} correct)
        </span>
      </p>
      <p className="mt-1 text-xs text-gray-600">
        Acceptance threshold: tuned ≥ 20 pp higher than naive exact-match accuracy.
      </p>
    </div>
  )
}
