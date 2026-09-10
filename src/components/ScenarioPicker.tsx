import type { Scenario } from '../lib/scenarios'
import { SCENARIOS } from '../lib/scenarios'

interface ScenarioPickerProps {
  onSelect: (scenarioId: string) => void
}

export function ScenarioPicker({ onSelect }: ScenarioPickerProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-3xl font-bold text-white">
          Choose a Scenario
        </h2>
        <p className="mx-auto max-w-xl text-gray-400">
          Ops teams running voice confirmation calls in India need names, OTPs,
          and addresses to be heard right the first time.
          Select a scenario to hear the difference between naive and controlled delivery.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SCENARIOS.map((scenario: Scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario.id)}
            className="group flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-5 text-left transition-all hover:border-accent-600 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <span className="text-3xl">{scenario.icon}</span>
            <div>
              <h3 className="mb-1 font-semibold text-white group-hover:text-accent-300">
                {scenario.title}
              </h3>
              <p className="text-xs text-gray-500">{scenario.description}</p>
            </div>
            <div className="mt-auto">
              <span className="text-xs font-medium text-accent-500 group-hover:text-accent-400">
                Try it →
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-gray-600">
        All identifiers are synthetic — no real personal data is used.
      </p>
    </div>
  )
}
