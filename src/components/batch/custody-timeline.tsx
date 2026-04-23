import type { TransferEvent } from '@/types'
import { cn } from '@/lib/utils'

const HANDLER_COLORS: Record<string, string> = {
  farmer: 'bg-green-100 text-green-800',
  transporter: 'bg-blue-100 text-blue-800',
  aggregator: 'bg-indigo-100 text-indigo-800',
  processor: 'bg-purple-100 text-purple-800',
  exporter: 'bg-orange-100 text-orange-800',
  buyer: 'bg-gray-100 text-gray-800',
}

export function CustodyTimeline({ events }: { events: TransferEvent[] }) {
  if (!events.length) return <p className="text-sm text-gray-400">No custody events recorded.</p>

  return (
    <ol className="relative border-l border-gray-200 ml-3">
      {events.map((event, idx) => (
        <li key={event.id} className="mb-6 ml-6">
          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#1a4d1a] text-white text-xs font-bold ring-4 ring-white">
            {idx + 1}
          </span>
          <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', HANDLER_COLORS[event.handler_type] ?? 'bg-gray-100 text-gray-600')}>
                {event.handler_type.toUpperCase()}
              </span>
              <time className="text-xs text-gray-400">
                {new Date(event.recorded_at).toLocaleString('en-NG')}
              </time>
            </div>
            {event.from_party && (
              <p className="text-xs text-gray-500">From: {event.from_party}</p>
            )}
            <p className="text-sm font-medium text-gray-800">→ {event.to_party}</p>
            {event.location && <p className="text-xs text-gray-500 mt-0.5">📍 {event.location}</p>}
            {event.notes && <p className="text-xs text-gray-500 mt-0.5 italic">{event.notes}</p>}
            <p className="text-xs text-gray-300 mt-1.5 font-mono truncate">hash: {event.event_hash.slice(0, 20)}…</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
