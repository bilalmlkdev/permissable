import type { RBACGraph } from '../types/rbac'

/** Emits the graph as a NODES lookup (by id) and a flat GRANTS array. */
export function serializeGraphData(graph: RBACGraph): string {
  const nodesById: Record<string, unknown> = {}
  for (const n of graph.nodes) {
    nodesById[n.id] = {
      id: n.id,
      kind: n.kind,
      name: n.name,
      parentId: n.parentId ?? null,
      extends: n.extends ?? [],
    }
  }
  const grants = graph.grants.map((g) => ({
    roleId: g.roleId,
    permissionId: g.permissionId,
    resourceId: g.resourceId,
    cascade: g.cascade,
    ...(g.condition ? { condition: g.condition } : {}),
  }))

  return `const NODES = ${JSON.stringify(nodesById, null, 2)};

const GRANTS = ${JSON.stringify(grants, null, 2)};`
}
