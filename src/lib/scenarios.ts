import type { IdentifierType } from './identifiers'

export type ScenarioId = 'otp' | 'delivery' | 'name' | 'custom'

export interface ScenarioField {
  id: string
  label: string
  placeholder: string
  identifierType: IdentifierType
  required: boolean
}

export interface Scenario {
  id: ScenarioId
  title: string
  description: string
  icon: string
  fields: ScenarioField[]
  /**
   * Builds the sentence template for the given field values.
   * Used for BOTH naive and tuned — the pipeline then transforms
   * the identifier portion specifically.
   */
  buildScript: (values: Record<string, string>) => string
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'otp',
    title: 'OTP Confirmation Call',
    description: 'Read a one-time password clearly, digit by digit.',
    icon: '🔑',
    fields: [
      {
        id: 'otp',
        label: 'One-Time Password',
        placeholder: '482135',
        identifierType: 'otp',
        required: true,
      },
    ],
    buildScript: (v) =>
      `Your one-time password is ${v.otp}. I repeat, your OTP is ${v.otp}. Please do not share this with anyone.`,
  },
  {
    id: 'delivery',
    title: 'Delivery Readback',
    description: 'Confirm a delivery order with pincode and order ID.',
    icon: '📦',
    fields: [
      {
        id: 'orderId',
        label: 'Order ID',
        placeholder: 'PRM423GDD',
        identifierType: 'orderId',
        required: true,
      },
      {
        id: 'pincode',
        label: 'Delivery Pincode',
        placeholder: '110001',
        identifierType: 'pincode',
        required: true,
      },
    ],
    buildScript: (v) =>
      `Your delivery order ${v.orderId} is out for delivery to pincode ${v.pincode}. Please keep someone available to receive the package.`,
  },
  {
    id: 'name',
    title: 'Name Confirmation',
    description: 'Confirm a customer name, handling difficult pronunciations.',
    icon: '👤',
    fields: [
      {
        id: 'name',
        label: 'Customer Name',
        placeholder: 'Subramanian',
        identifierType: 'name',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Number',
        placeholder: '+919876543210',
        identifierType: 'phone',
        required: false,
      },
    ],
    buildScript: (v) =>
      v.phone
        ? `Hello, this is a call for ${v.name}. We are trying to reach the number ${v.phone}. Please call us back if this is incorrect.`
        : `Hello, this is a call for ${v.name}. Please press 1 to confirm your details.`,
  },
  {
    id: 'custom',
    title: 'Custom Identifier',
    description: 'Test any identifier — phone, OTP, name, or order ID.',
    icon: '⚙️',
    fields: [
      {
        id: 'identifier',
        label: 'Identifier',
        placeholder: 'Type anything…',
        identifierType: 'unknown',
        required: true,
      },
    ],
    buildScript: (v) => `Your reference is ${v.identifier}. Please note this down carefully.`,
  },
]

export function getScenario(id: ScenarioId): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0]
}
