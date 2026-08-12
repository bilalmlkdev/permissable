import { useMemo, useState } from 'react'
import { Play, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react'
import { useRBACStore } from '../lib/store'
import { simulateAccess } from '../lib/simulate'
import clsx from 'clsx'

export default function Simulator() {
  const { nodes, grants, users, addUser, removeUser, updateUser } = useRBACStore()
  const [userId, setUserId] = useState(users[0]?.id ?? '')
  const [permissionId, setPermissionId] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [newUserName, setNewUserName] = useState('')

  const roles = nodes.filter((n) => n.kind === 'role')
  const permissions = nodes.filter((n) => n.kind === 'permission')
  const resources = nodes.filter((n) => n.kind === 'resource')

  const result = useMemo(() => {
    if (!userId || !permissionId || !resourceId) return null
    return simulateAccess({ nodes, grants, users }, userId, permissionId, resourceId)
  }, [nodes, grants, users, userId, permissionId, resourceId])

  const selectedUser = users.find((u) => u.id === userId)

  return (
    <div className="w-96 shrink-0 border-l border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center gap-2 text-sm font-semibold mb-3">
          <Play size={14} className="text-amber-400" /> Access simulator
        </div>

        <div className="space-y-2">
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full rounded bg-neutral-900 border border-neutral-700 px-2 py-1.5 text-sm">
            <option value="">User...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select value={permissionId} onChange={(e) => setPermissionId(e.target.value)} className="w-full rounded bg-neutral-900 border border-neutral-700 px-2 py-1.5 text-sm">
            <option value="">Permission...</option>
            {permissions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select value={resourceId} onChange={(e) => setResourceId(e.target.value)} className="w-full rounded bg-neutral-900 border border-neutral-700 px-2 py-1.5 text-sm">
            <option value="">Resource...</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {result && (
          <div
            className={clsx(
              'mt-3 rounded-lg border p-3 text-sm',
              result.allowed ? 'bg-emerald-950/50 border-emerald-700' : 'bg-red-950/50 border-red-800',
            )}
          >
            <div className={clsx('flex items-center gap-2 font-semibold mb-2', result.allowed ? 'text-emerald-300' : 'text-red-300')}>
              {result.allowed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {result.allowed ? 'Allowed' : 'Denied'}
            </div>
            <ul className="space-y-1 text-xs text-neutral-400">
              {result.reasoning.map((line, i) => (
                <li key={i}>• {line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-neutral-400 mb-2">Users</div>
        <div className="flex gap-1.5 mb-3">
          <input
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newUserName.trim()) {
                addUser(newUserName.trim(), [])
                setNewUserName('')
              }
            }}
            placeholder="New user name..."
            className="flex-1 min-w-0 rounded bg-neutral-900 border border-neutral-700 px-2 py-1 text-sm placeholder:text-neutral-500"
          />
          <button
            onClick={() => {
              if (!newUserName.trim()) return
              addUser(newUserName.trim(), [])
              setNewUserName('')
            }}
            className="rounded bg-neutral-800 hover:bg-neutral-700 px-2 border border-neutral-700"
          >
            <Plus size={14} />
          </button>
        </div>

        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="rounded border border-neutral-800 bg-neutral-900/60 p-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{u.name}</span>
                <button onClick={() => removeUser(u.id)} className="text-neutral-500 hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {roles.map((r) => {
                  const checked = u.roleIds.includes(r.id)
                  return (
                    <button
                      key={r.id}
                      onClick={() =>
                        updateUser(u.id, {
                          roleIds: checked ? u.roleIds.filter((id) => id !== r.id) : [...u.roleIds, r.id],
                        })
                      }
                      className={clsx(
                        'text-xs px-2 py-0.5 rounded-full border',
                        checked ? 'bg-violet-700 border-violet-500 text-white' : 'bg-neutral-900 border-neutral-700 text-neutral-400',
                      )}
                    >
                      {r.name}
                    </button>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedUser && null}
    </div>
  )
}
