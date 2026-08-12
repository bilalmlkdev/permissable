import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type NodeMouseHandler,
  type NodeDragHandler,
  type Connection,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useRBACStore } from '../lib/store'
import { graphToFlowNodes, graphToFlowEdges } from '../lib/toFlow'
import RBACNode from './RBACNode'

const nodeTypes = { rbacNode: RBACNode }

export default function GraphCanvas({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const { nodes: rbacNodes, grants, updateNode, addGrant } = useRBACStore()

  const nodes = useMemo(
    () =>
      graphToFlowNodes({ nodes: rbacNodes, grants, users: [] }).map((n) => ({
        ...n,
        selected: n.id === selectedId,
      })),
    [rbacNodes, grants, selectedId],
  )
  const edges = useMemo(() => graphToFlowEdges({ nodes: rbacNodes, grants, users: [] }), [rbacNodes, grants])

  const onNodeClick: NodeMouseHandler = useCallback((_e, node) => onSelect(node.id), [onSelect])
  const onPaneClick = useCallback(() => onSelect(null), [onSelect])

  const onNodeDragStop: NodeDragHandler = useCallback(
    (_e, node) => updateNode(node.id, { position: node.position }),
    [updateNode],
  )

  // Dragging an edge from a role -> permission -> resource creates a grant.
  // We treat a role->permission connection as "staged" implicitly by requiring
  // the user to connect role directly to a permission that's already linked to
  // a resource is ambiguous, so instead: connecting ANY two nodes among
  // role/permission/resource triples is handled by drag-connect role->resource
  // through an intermediate permission picker is overkill for a canvas gesture;
  // simplest robust UX: connecting role -> permission stages nothing on its own,
  // real grants are made in the Inspector's "Add Grant" control (explicit and
  // unambiguous about which permission+resource pair is intended).
  const onConnect = useCallback(
    (_c: Connection) => {
      // Intentionally a no-op on canvas; grants are created explicitly via the
      // Inspector panel so a Role→Permission→Resource triple is always fully
      // specified. See comment above.
    },
    [addGrant],
  )

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={20} />
        <Controls className="!bg-neutral-900 !border-neutral-700 [&>button]:!bg-neutral-900 [&>button]:!border-neutral-700 [&>button]:!text-neutral-300" />
        <MiniMap
          className="!bg-neutral-900"
          nodeColor={(n) => (n.data?.kind === 'role' ? '#7c3aed' : n.data?.kind === 'permission' ? '#059669' : '#2563eb')}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  )
}
