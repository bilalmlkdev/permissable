import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { ShieldCheck, Key, Box } from 'lucide-react'
import clsx from 'clsx'

const ICONS = { role: ShieldCheck, permission: Key, resource: Box }
const KIND_STYLES = {
  role: 'bg-violet-950/60 border-violet-500 text-violet-100',
  permission: 'bg-emerald-950/60 border-emerald-500 text-emerald-100',
  resource: 'bg-blue-950/60 border-blue-500 text-blue-100',
}

function RBACNodeComponent({ data, selected }: NodeProps<{ label: string; kind: 'role' | 'permission' | 'resource' }>) {
  const Icon = ICONS[data.kind]
  return (
    <div
      className={clsx(
        'rounded-lg border-2 px-3 py-2 min-w-[140px] shadow-lg backdrop-blur-sm transition-shadow',
        KIND_STYLES[data.kind],
        selected && 'ring-2 ring-white/70',
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-neutral-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <Icon size={14} className="shrink-0 opacity-80" />
        <span className="text-sm font-medium truncate">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-neutral-400 !w-2 !h-2" />
    </div>
  )
}

export default memo(RBACNodeComponent)
