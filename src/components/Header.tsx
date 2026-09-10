import { ProviderBadge } from './ProviderBadge'

interface HeaderProps {
  speaker: string
}

export function Header({ speaker }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎙️</span>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white uppercase">Saaf</h1>
            <p className="text-xs text-gray-500">Controlled Voice Delivery</p>
          </div>
        </div>
        <ProviderBadge speaker={speaker} />
      </div>
    </header>
  )
}
