import type { Node, Edge } from 'reactflow'
import type { RBACGraph } from '../types/rbac'

const KIND_COLOR: Record<string, string> = {
  role: '#7c3aed',
  permission: '#059669',
  resource: '#2563eb',
}

export function graphToFlowNodes(graph: RBACGraph): Node[] {
  return graph.nodes.map((n) => ({
    id: n.id,
    position: n.position,
    data: { label: n.name, kind: n.kind, nodeId: n.id },
    type: 'rbacNode',
    style: { borderColor: KIND_COLOR[n.kind] },
  }))
}

export function graphToFlowEdges(graph: RBACGraph): Edge[] {
  const grantEdges: Edge[] = graph.grants.flatMap((g) => [
    {
      id: `${g.id}-rp`,
      source: g.roleId,
      target: g.permissionId,
      style: { stroke: '#7c3aed', strokeWidth: 1.5 },
      animated: false,
      data: { grantId: g.id },
    },
    {
      id: `${g.id}-pr`,
      source: g.permissionId,
      target: g.resourceId,
      style: { stroke: '#059669', strokeWidth: 1.5 },
      animated: false,
      data: { grantId: g.id },
    },
  ])

  const extendsEdges: Edge[] = graph.nodes
    .filter((n) => n.kind === 'role')
    .flatMap((n) =>
      (n.extends ?? []).map((parentId) => ({
        id: `ext-${parentId}-${n.id}`,
        source: n.id,
        target: parentId,
        style: { stroke: '#a78bfa', strokeDasharray: '4 3' },
        label: 'extends',
      })),
    )

  const hierarchyEdges: Edge[] = graph.nodes
    .filter((n) => n.kind === 'resource' && n.parentId)
    .map((n) => ({
      id: `hier-${n.parentId}-${n.id}`,
      source: n.id,
      target: n.parentId as string,
      style: { stroke: '#60a5fa', strokeDasharray: '2 2' },
      label: 'child of',
    }))

  return [...grantEdges, ...extendsEdges, ...hierarchyEdges]
}
