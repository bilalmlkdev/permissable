import { useState } from 'react'
import { Plus, ShieldCheck, Key, Box, Trash2 } from 'lucide-react'
import { useRBACStore } from '../lib/store'
import type { NodeKind } from '../types/rbac'
import clsx from 'clsx'

const KIND_META: Record<NodeKind, { label: string; icon: typeof ShieldCheck; color: string }> = {
  role: { label: 'Roles', icon: ShieldCheck, color: 'text-violet-400' },
  permission: { label: 'Permissions', icon: Key, color: 'text-emerald-400' },
  resource: { label: 'Resources', icon: Box, color: 'text-blue-400' },
}

export default function Sidebar({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const { nodes, addNode, removeNode } = useRBACStore()
  const [drafts, setDrafts] = useState<Record<NodeKind, string>>({ role: '', permission: '', resource: '' })

  const handleAdd = (kind: NodeKind) => {
    const name = drafts[kind].trim()
    if (!name) return
    const idx = nodes.filter((n) => n.kind === kind).length
    addNode(kind, name, { x: 40 + (kind === 'role' ? 0 : kind === 'permission' ? 340 : 680), y: 60 + idx * 100 })
    setDrafts((d) => ({ ...d, [kind]: '' }))
  }

  return (
    <aside className="w-72 shrink-0 border-r border-neutral-800 bg-neutral-950 overflow-y-auto">
      {(['role', 'permission', 'resource'] as NodeKind[]).map((kind) => {
        const meta = KIND_META[kind]
        const Icon = meta.icon
        const items = nodes.filter((n) => n.kind === kind)
        return (
          <div key={kind} className="border-b border-neutral-800 p-3">
            <div className={clsx('flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-2', meta.color)}>
              <Icon size={13} />
              {meta.label}
            </div>
            <div className="flex gap-1.5 mb-2">
              <input
                value={drafts[kind]}
                onChange={(e) => setDrafts((d) => ({ ...d, [kind]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd(kind)}
                placeholder={`New ${kind}...`}
                className="flex-1 min-w-0 rounded bg-neutral-900 border border-neutral-700 px-2 py-1 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500"
              />
              <button
                onClick={() => handleAdd(kind)}
                className="rounded bg-neutral-800 hover:bg-neutral-700 px-2 flex items-center justify-center border border-neutral-700"
                aria-label={`Add ${kind}`}
              >
                <Plus size={14} />
              </button>
            </div>
            <ul className="space-y-1">
              {items.map((n) => (
                <li
                  key={n.id}
                  onClick={() => onSelect(n.id)}
                  className={clsx(
                    'group flex items-center justify-between rounded px-2 py-1.5 text-sm cursor-pointer',
                    selectedId === n.id ? 'bg-neutral-800' : 'hover:bg-neutral-900',
                  )}
                >
                  <span className="truncate">{n.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeNode(n.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
              {items.length === 0 && <li className="text-xs text-neutral-600 italic px-2">None yet</li>}
            </ul>
          </div>
        )
      })}
    </aside>
  )
}
