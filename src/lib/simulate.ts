import type { RBACGraph, SimulationResult, Grant } from '../types/rbac'

/** All roles reachable from a starting role via `extends`, including itself. Cycle-safe. */
export function resolveRoleClosure(graph: RBACGraph, roleId: string): string[] {
  const seen = new Set<string>()
  const stack = [roleId]
  while (stack.length) {
    const id = stack.pop()!
    if (seen.has(id)) continue
    seen.add(id)
    const node = graph.nodes.find((n) => n.id === id)
    for (const parent of node?.extends ?? []) stack.push(parent)
  }
  return [...seen]
}

/** A resource and every ancestor above it (resource hierarchy walks UP to root). */
export function resolveResourceAncestors(graph: RBACGraph, resourceId: string): string[] {
  const chain: string[] = []
  let current: string | null | undefined = resourceId
  const seen = new Set<string>()
  while (current && !seen.has(current)) {
    seen.add(current)
    chain.push(current)
    const node = graph.nodes.find((n) => n.id === current)
    current = node?.parentId ?? null
  }
  return chain
}

/**
 * Can `userId` perform `permissionId` on `resourceId`?
 *
 * Logic:
 *  1. Expand the user's roles through inheritance (`extends`).
 *  2. For the target resource, walk up its ancestor chain (a grant with
 *     cascade=true on an ancestor covers descendants).
 *  3. A grant matches if role ∈ expandedRoles, permission matches, and
 *     resource is either the exact resource or an ancestor with cascade=true.
 */
export function simulateAccess(
  graph: RBACGraph,
  userId: string,
  permissionId: string,
  resourceId: string,
): SimulationResult {
  const reasoning: string[] = []
  const user = graph.users.find((u) => u.id === userId)
  if (!user) return { allowed: false, matchedGrants: [], reasoning: ['User not found.'] }

  const expandedRoles = new Set<string>()
  for (const r of user.roleIds) {
    resolveRoleClosure(graph, r).forEach((x) => expandedRoles.add(x))
  }
  reasoning.push(
    `User "${user.name}" resolves to roles: ${[...expandedRoles]
      .map((id) => graph.nodes.find((n) => n.id === id)?.name ?? id)
      .join(', ')}`,
  )

  const ancestorChain = resolveResourceAncestors(graph, resourceId)
  reasoning.push(
    `Resource hierarchy checked: ${ancestorChain
      .map((id) => graph.nodes.find((n) => n.id === id)?.name ?? id)
      .join(' → ')}`,
  )

  const matched: Grant[] = graph.grants.filter((g) => {
    if (!expandedRoles.has(g.roleId)) return false
    if (g.permissionId !== permissionId) return false
    if (g.resourceId === resourceId) return true
    const idx = ancestorChain.indexOf(g.resourceId)
    return idx > 0 && g.cascade
  })

  if (matched.length === 0) {
    reasoning.push('No matching grant found across resolved roles and resource hierarchy.')
  } else {
    for (const g of matched) {
      const roleName = graph.nodes.find((n) => n.id === g.roleId)?.name
      const resName = graph.nodes.find((n) => n.id === g.resourceId)?.name
      reasoning.push(
        `Matched: role "${roleName}" grants this permission on "${resName}"${
          g.resourceId !== resourceId ? ' (cascaded to descendant)' : ''
        }.`,
      )
    }
  }

  return { allowed: matched.length > 0, matchedGrants: matched, reasoning }
}
