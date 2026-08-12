import { useState } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { ShieldCheck, Download, RotateCcw } from 'lucide-react'
import Sidebar from './components/Sidebar'
import GraphCanvas from './components/GraphCanvas'
import Inspector from './components/Inspector'
import Simulator from './components/Simulator'
import ExportModal from './components/ExportModal'
import { useRBACStore } from './lib/store'

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showExport, setShowExport] = useState(false)
  const reset = useRBACStore((s) => s.reset)

  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-950 text-neutral-100">
      <header className="h-14 shrink-0 border-b border-neutral-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck size={18} className="text-violet-400" />
          Permissable
          <span className="text-xs font-normal text-neutral-500 ml-2">visual RBAC builder</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Reset to the example graph? This discards current changes.')) reset()
            }}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border border-neutral-700 hover:bg-neutral-900"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded bg-violet-700 hover:bg-violet-600 font-medium"
          >
            <Download size={14} />
            Export middleware
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar selectedId={selectedId} onSelect={setSelectedId} />
        <ReactFlowProvider>
          <GraphCanvas selectedId={selectedId} onSelect={setSelectedId} />
        </ReactFlowProvider>
        {selectedId && <Inspector nodeId={selectedId} onClose={() => setSelectedId(null)} />}
        <Simulator />
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  )
}
