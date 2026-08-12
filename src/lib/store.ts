import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { RBACGraph, RBACNode, Grant, User, NodeKind } from '../types/rbac'
import { seedGraph } from '../data/seed'

interface RBACStore extends RBACGraph {
  addNode: (kind: NodeKind, name: string, position: { x: number; y: number }, parentId?: string | null) => string
  updateNode: (id: string, patch: Partial<RBACNode>) => void
  removeNode: (id: string) => void

  addGrant: (roleId: string, permissionId: string, resourceId: string, cascade?: boolean) => void
  removeGrant: (id: string) => void

  addUser: (name: string, roleIds: string[]) => void
  updateUser: (id: string, patch: Partial<User>) => void
  removeUser: (id: string) => void

  setRoleExtends: (roleId: string, extendsIds: string[]) => void

  reset: () => void
}

// Bump this if the persisted shape changes in a way old localStorage data
// can't be read as-is; add a migration below rather than breaking existing
// users' saved graphs.
const STORE_VERSION = 1

export const useRBACStore = create<RBACStore>()(
  persist(
    (set, get) => ({
      ...seedGraph(),

      addNode: (kind, name, position, parentId = null) => {
        const id = `${kind}_${nanoid(6)}`
        const node: RBACNode = {
          id,
          kind,
          name,
          position,
          parentId: kind === 'resource' ? parentId : undefined,
          extends: kind === 'role' ? [] : undefined,
        }
        set((s) => ({ nodes: [...s.nodes, node] }))
        return id
      },

      updateNode: (id, patch) =>
        set((s) => ({
          nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        })),

      removeNode: (id) =>
        set((s) => ({
          nodes: s.nodes.filter((n) => n.id !== id),
          grants: s.grants.filter(
            (g) => g.roleId !== id && g.permissionId !== id && g.resourceId !== id,
          ),
          users: s.users.map((u) => ({ ...u, roleIds: u.roleIds.filter((r) => r !== id) })),
        })),

      addGrant: (roleId, permissionId, resourceId, cascade = true) => {
        const exists = get().grants.some(
          (g) => g.roleId === roleId && g.permissionId === permissionId && g.resourceId === resourceId,
        )
        if (exists) return
        const grant: Grant = { id: `grant_${nanoid(6)}`, roleId, permissionId, resourceId, cascade }
        set((s) => ({ grants: [...s.grants, grant] }))
      },

      removeGrant: (id) => set((s) => ({ grants: s.grants.filter((g) => g.id !== id) })),

      addUser: (name, roleIds) =>
        set((s) => ({ users: [...s.users, { id: `user_${nanoid(6)}`, name, roleIds }] })),

      updateUser: (id, patch) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),

      removeUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

      setRoleExtends: (roleId, extendsIds) =>
        set((s) => ({
          nodes: s.nodes.map((n) => (n.id === roleId ? { ...n, extends: extendsIds } : n)),
        })),

      reset: () => set(seedGraph()),
    }),
    {
      name: 'permissable-graph',
      version: STORE_VERSION,
      // Only persist the graph data itself, not action functions.
      partialize: (state) => ({ nodes: state.nodes, grants: state.grants, users: state.users }),
      // If localStorage ever contains corrupt/unreadable data (private
      // browsing quirks, manual edits, a future breaking version bump),
      // fail open to the seed graph instead of crashing the app.
      migrate: (persistedState) => persistedState as RBACGraph,
    },
  ),
)
