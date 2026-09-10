import { useState } from 'react'
import { Header } from './components/Header'
import { ScenarioPicker } from './components/ScenarioPicker'
import { ScenarioForm } from './components/ScriptBuilder/ScenarioForm'
import { BlindTest, FixtureList, ResultsTally } from './components/TestLab'
import { buildPair } from './lib/pipeline'
import type { ScenarioId } from './lib/scenarios'
import fixtures from '../fixtures/fixtures.json'

type TestResult = { fixtureId: string; condition: 'naive' | 'tuned'; heard: string; correct: boolean }
type View = 'home' | 'builder' | 'testlab'

// Build fixture list for Test Lab from the committed fixtures.json
const ALL_FIXTURES = [
  ...fixtures.names.map((id) => ({
    id: `names__${id}`,
    category: 'names',
    identifier: id,
    ...buildPair(`This call is for ${id}. Please confirm if this is correct.`, id),
  })),
  ...fixtures.phone_numbers.map((id) => ({
    id: `phones__${id}`,
    category: 'phone_numbers',
    identifier: id,
    ...buildPair(`Your registered phone number is ${id}. Please verify this number.`, id),
  })),
  ...fixtures.pincodes.map((id) => ({
    id: `pincodes__${id}`,
    category: 'pincodes',
    identifier: id,
    ...buildPair(`Your delivery pincode is ${id}. We will deliver to this location.`, id),
  })),
  ...fixtures.order_ids.map((id) => ({
    id: `orders__${id}`,
    category: 'order_ids',
    identifier: id,
    ...buildPair(`Your order reference is ${id}. Please keep this for your records.`, id),
  })),
].map((f) => ({
  id: f.id,
  category: f.category,
  identifier: f.identifier,
  naiveText: f.naive.text,
  tunedText: f.tuned.text,
}))

type Fixture = (typeof ALL_FIXTURES)[0]

function TestLabView({
  fixtures: fixtureList,
  speaker,
  onExport,
}: {
  fixtures: Fixture[]
  speaker: string
  onExport: (results: TestResult[]) => void
}) {
  const [results, setResults] = useState<TestResult[]>([])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-white">🧪 Test Lab</h2>
        <p className="text-sm text-gray-500">
          Blind A/B listening test — the acceptance test harness. Each item plays both a naive
          and tuned clip (labeled A and B). Type what you heard, then submit.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <ResultsTally results={results} onExport={() => onExport(results)} />
          <BlindTest
            fixtures={fixtureList}
            speaker={speaker}
            onResult={(r) => setResults((prev) => [...prev, r])}
          />
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Fixture Set ({fixtureList.length} items)
          </h3>
          <FixtureList fixtures={fixtureList} />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [scenarioId, setScenarioId] = useState<ScenarioId>('otp')
  const [speaker, setSpeaker] = useState<string>('')

  function handleSelectScenario(id: string) {
    setScenarioId(id as ScenarioId)
    setView('builder')
  }

  function handleExportResults(results: TestResult[]) {
    const data = {
      exportedAt: new Date().toISOString(),
      model: 'mistv2',
      speaker,
      results,
      summary: {
        total: results.length,
        correct: results.filter((r) => r.correct).length,
        accuracy: results.length
          ? Math.round((results.filter((r) => r.correct).length / results.length) * 100)
          : 0,
      },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'evidence-results.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header speaker={speaker} />

      {/* Tab navigation */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto flex max-w-5xl gap-1 px-4">
          {[
            { id: 'home', label: 'Scenarios' },
            { id: 'testlab', label: '🧪 Test Lab' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as View)}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                view === tab.id || (view === 'builder' && tab.id === 'home')
                  ? 'border-accent-500 text-accent-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      {(view === 'home') && (
        <ScenarioPicker onSelect={handleSelectScenario} />
      )}

      {view === 'builder' && (
        <ScenarioForm
          scenarioId={scenarioId}
          speaker={speaker}
          onSpeakerChange={setSpeaker}
          onBack={() => setView('home')}
        />
      )}

      {view === 'testlab' && (
        <TestLabView
          fixtures={ALL_FIXTURES}
          speaker={speaker || 'cove'}
          onExport={handleExportResults}
        />
      )}

      {/* Footer — always visible compliance strip */}
      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        Speech: Rime (mistv2) · No fallback · All identifiers are synthetic data
      </footer>
    </div>
  )
}
