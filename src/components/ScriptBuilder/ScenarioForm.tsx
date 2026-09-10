import { useState } from 'react'
import type { ScenarioId } from '../../lib/scenarios'
import { getScenario } from '../../lib/scenarios'
import { CoverageBadges } from './CoverageBadges'
import { NaiveTunedPreview } from './NaiveTunedPreview'
import { VoicePicker } from './VoicePicker'
import { PlaybackPanel } from '../PlaybackPanel'
import { buildPair } from '../../lib/pipeline'

interface ScenarioFormProps {
  scenarioId: ScenarioId
  speaker: string
  onSpeakerChange: (s: string) => void
  onBack: () => void
}

export function ScenarioForm({
  scenarioId,
  speaker,
  onSpeakerChange,
  onBack,
}: ScenarioFormProps) {
  const scenario = getScenario(scenarioId)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    Object.fromEntries(scenario.fields.map((f) => [f.id, ''])),
  )

  function updateField(id: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [id]: value }))
  }

  const allRequired = scenario.fields
    .filter((f) => f.required)
    .every((f) => fieldValues[f.id].trim().length > 0)

  // Find the primary identifier (first required field with a non-name type, or first field)
  const primaryField =
    scenario.fields.find((f) => f.required && f.identifierType !== 'unknown') ??
    scenario.fields[0]
  const primaryValue = fieldValues[primaryField?.id ?? ''] ?? ''

  // Build raw sentence and pipeline pair
  const rawSentence = scenario.buildScript(fieldValues)
  const pair = primaryValue
    ? buildPair(rawSentence, primaryValue)
    : null

  // Tokens for coverage check — all non-empty name-type fields
  const nameTokens = scenario.fields
    .filter((f) => f.identifierType === 'name' && fieldValues[f.id].trim())
    .map((f) => fieldValues[f.id].trim())

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        ← Back to scenarios
      </button>

      <div className="mb-6">
        <span className="text-3xl">{scenario.icon}</span>
        <h2 className="mt-2 text-xl font-bold text-white">{scenario.title}</h2>
        <p className="text-sm text-gray-500">{scenario.description}</p>
      </div>

      <div className="space-y-6">
        {/* Identifier fields */}
        <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-300">Identifier Input</h3>

          {scenario.fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400">
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
                <span className="ml-2 rounded bg-gray-800 px-1.5 py-0.5 text-gray-600">
                  {field.identifierType}
                </span>
              </label>
              <input
                type="text"
                value={fieldValues[field.id]}
                onChange={(e) => updateField(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-accent-500 focus:outline-none"
              />
            </div>
          ))}

          {/* Live OOV badges for name-type fields */}
          {nameTokens.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">Dictionary coverage:</span>
              <CoverageBadges tokens={nameTokens} />
            </div>
          )}
        </div>

        {/* Voice picker */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <VoicePicker value={speaker} onChange={onSpeakerChange} />
        </div>

        {/* Naive vs Tuned preview */}
        {pair && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Text sent to Rime
            </h3>
            <NaiveTunedPreview
              naiveText={pair.naive.text}
              tunedText={pair.tuned.text}
            />
          </div>
        )}

        {/* Playback panel */}
        {pair && speaker && (
          <PlaybackPanel
            naiveResult={pair.naive}
            speaker={speaker}
            rawIdentifier={primaryValue}
          />
        )}

        {!allRequired && (
          <p className="text-center text-xs text-gray-600">
            Fill in the required fields above to enable playback.
          </p>
        )}
      </div>
    </div>
  )
}
