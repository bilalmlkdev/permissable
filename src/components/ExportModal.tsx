import { useState } from 'react'
import { X, Copy, Download, Check } from 'lucide-react'
import { useRBACStore } from '../lib/store'
import { exportExpressMiddleware } from '../export/exportExpress'
import { exportNextjsMiddleware } from '../export/exportNextjs'
import clsx from 'clsx'

type Target = 'express' | 'nextjs'

export default function ExportModal({ onClose }: { onClose: () => void }) {
  const graph = useRBACStore()
  const [target, setTarget] = useState<Target>('express')
  const [copied, setCopied] = useState(false)

  const code = target === 'express' ? exportExpressMiddleware(graph) : exportNextjsMiddleware(graph)
  const filename = target === 'express' ? 'rbac.middleware.js' : 'rbac.ts'

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div
        className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <div className="flex gap-1">
            {(['express', 'nextjs'] as Target[]).map((t) => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                className={clsx(
                  'px-3 py-1.5 rounded text-sm font-medium',
                  target === t ? 'bg-violet-700 text-white' : 'text-neutral-400 hover:bg-neutral-900',
                )}
              >
                {t === 'express' ? 'Express' : 'Next.js'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copy} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded bg-neutral-900 border border-neutral-700 hover:bg-neutral-800">
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={download} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded bg-neutral-900 border border-neutral-700 hover:bg-neutral-800">
              <Download size={13} />
              Download
            </button>
            <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200 ml-1">
              <X size={18} />
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto p-4 text-xs leading-relaxed text-neutral-300 font-mono whitespace-pre">{code}</pre>
      </div>
    </div>
  )
}
