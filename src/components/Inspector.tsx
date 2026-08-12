import { useState } from 'react'
import { X } from 'lucide-react'
import { useRBACStore } from '../lib/store'

export default function Inspector({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const { nodes, grants, updateNode, setRoleExtends, addGrant, removeGrant } = useRBACStore()
  const node = nodes.find((n) => n.id === nodeId)
  const [grantPerm, setGrantPerm] = useState('')
  const [grantRes, setGrantRes] = useState('')
  const [grantCascade, setGrantCascade] = useState(true)

  if (!node) return null

  const roles = nodes.filter((n) => n.kind === 'role' && n.id !== nodeId)
  const permissions = nodes.filter((n) => n.kind === 'permission')
  const resources = nodes.filter((n) => n.kind === 'resource')

  const nodeGrants = grants.filter((g) =>
    node.kind === 'role' ? g.roleId === nodeId : node.kind === 'permission' ? g.permissionId === nodeId : g.resourceId === nodeId,
  )

  return (
    <aside className="w-80 shrink-0 border-l border-neutral-800 bg-neutral-950 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wide text-neutral-500">{node.kind}</span>
        <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200">
          <X size={16} />
        </button>
      </div>

      <input
        value={node.name}
        onChange={(e) => updateNode(nodeId, { name: e.target.value })}
        className="w-full rounded bg-neutral-900 border border-neutral-700 px-2 py-1.5 text-sm font-medium mb-4 focus:outline-none focus:border-neutral-500"
      />

      {node.kind === 'role' && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-neutral-400 mb-1.5">Inherits from (extends)</div>
          <div className="space-y-1">
            {roles.map((r) => {
              const checked = node.extends?.includes(r.id) ?? false
              return (
                <label key={r.id} className="flex items-center gap-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const current = node.extends ?? []
                      setRoleExtends(
                        nodeId,
                        e.target.checked ? [...current, r.id] : current.filter((id) => id !== r.id),
                      )
                    }}
                  />
                  {r.name}
                </label>
              )
            })}
            {roles.length === 0 && <div className="text-xs text-neutral-600 italic">No other roles yet</div>}
          </div>
        </div>
      )}

      {node.kind === 'resource' && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-neutral-400 mb-1.5">Parent resource</div>
          <select
            value={node.parentId ?? ''}
            onChange={(e) => updateNode(nodeId, { parentId: e.target.value || null })}
            className="w-full rounded bg-neutral-900 border border-neutral-700 px-2 py-1.5 text-sm"
          >
            <option value="">(top-level - no parent)</option>
            {resources
              .filter((r) => r.id !== nodeId)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {node.kind === 'role' && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-neutral-400 mb-1.5">Grant new permission</div>
          <div className="space-y-1.5">
            <select
              value={grantPerm}
              onChange={(e) => setGrantPerm(e.target.value)}
              className="w-full rounded bg-neutral-900 border border-neutral-700 px-2 py-1.5 text-sm"
            >
              <option value="">Permission...</option>
              {permissions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={grantRes}
              onChange={(e) => setGrantRes(e.target.value)}
              className="w-full rounded bg-neutral-900 border border-neutral-700 px-2 py-1.5 text-sm"
            >
              <option value="">On resource...</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              <input type="checkbox" checked={grantCascade} onChange={(e) => setGrantCascade(e.target.checked)} />
              Cascade to descendant resources
            </label>
            <button
              disabled={!grantPerm || !grantRes}
              onClick={() => {
                addGrant(nodeId, grantPerm, grantRes, grantCascade)
                setGrantPerm('')
                setGrantRes('')
              }}
              className="w-full rounded bg-violet-700 hover:bg-violet-600 disabled:opacity-40 disabled:hover:bg-violet-700 px-2 py-1.5 text-sm font-medium"
            >
              Add grant
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="text-xs font-semibold text-neutral-400 mb-1.5">
          {node.kind === 'role' ? 'Grants from this role' : node.kind === 'permission' ? 'Grants using this permission' : 'Grants on this resource'}
        </div>
        <ul className="space-y-1">
          {nodeGrants.map((g) => {
            const roleName = nodes.find((n) => n.id === g.roleId)?.name
            const permName = nodes.find((n) => n.id === g.permissionId)?.name
            const resName = nodes.find((n) => n.id === g.resourceId)?.name
            return (
              <li key={g.id} className="flex items-center justify-between text-xs bg-neutral-900 rounded px-2 py-1.5 border border-neutral-800">
                <span className="truncate">
                  <span className="text-violet-400">{roleName}</span> → <span className="text-emerald-400">{permName}</span> →{' '}
                  <span className="text-blue-400">{resName}</span>
                  {g.cascade && <span className="text-neutral-500"> (cascades)</span>}
                </span>
                <button onClick={() => removeGrant(g.id)} className="text-neutral-500 hover:text-red-400 ml-2 shrink-0">
                  <X size={12} />
                </button>
              </li>
            )
          })}
          {nodeGrants.length === 0 && <li className="text-xs text-neutral-600 italic">No grants yet</li>}
        </ul>
      </div>
    </aside>
  )
}
