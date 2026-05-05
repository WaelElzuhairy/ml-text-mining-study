import { CHEATSHEETS } from '../data/cheatsheets.js'
import { LECTURES } from '../data/lectures.js'

export default function CheatSheetViewer({ lectureId }) {
  const lect = LECTURES.find(l => l.id === lectureId)
  const html = CHEATSHEETS[lectureId]

  if (!lect) return null

  if (!html) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-white mb-2">{lect.title}</h3>
          <p className="text-[#9ba6b3]">Cheat sheet coming soon.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-[#161b22] border-b border-[#2a3140]">
        <div>
          <span className="text-xs font-bold text-[#22d3ee] uppercase tracking-wider mr-2">LECT {lect.number}</span>
          <span className="text-sm text-[#cdd6e0]">{lect.title}</span>
        </div>
        <button
          onClick={() => {
            const win = window.open('', '_blank')
            win.document.write(html)
            win.document.close()
            setTimeout(() => win.print(), 500)
          }}
          className="flex items-center gap-1.5 text-xs text-[#9ba6b3] hover:text-[#e6edf3] transition-colors px-3 py-1.5
                     border border-[#2a3140] rounded-lg hover:border-[#3a4150]"
        >
          🖨️ Print / PDF
        </button>
      </div>

      {/* Iframe renders the self-contained HTML cheat sheet */}
      <iframe
        srcDoc={html}
        className="flex-1 w-full"
        style={{ border: 'none', background: '#0d1117' }}
        title={`${lect.title} Cheat Sheet`}
      />
    </div>
  )
}
