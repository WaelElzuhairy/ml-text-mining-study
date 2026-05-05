import { LECTURES } from '../data/lectures.js'

export default function Sidebar({ selected, onSelect }) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#2a3140] bg-[#0d1117] overflow-y-auto">
      <div className="p-4 border-b border-[#2a3140]">
        <p className="text-xs font-semibold text-[#9ba6b3] uppercase tracking-widest">Lectures</p>
      </div>
      <nav className="py-2">
        {LECTURES.map(lect => (
          <button
            key={lect.id}
            onClick={() => onSelect(lect.id)}
            className={`w-full text-left px-4 py-3 transition-colors group
              ${selected === lect.id
                ? 'bg-[#1a2d3a] border-r-2 border-[#22d3ee]'
                : 'hover:bg-[#161b22]'}`}
          >
            <div className={`text-xs font-bold mb-0.5
              ${selected === lect.id ? 'text-[#22d3ee]' : 'text-[#9ba6b3] group-hover:text-[#e6edf3]'}`}>
              LECT {lect.number}
            </div>
            <div className={`text-sm leading-tight
              ${selected === lect.id ? 'text-white' : 'text-[#cdd6e0]'}`}>
              {lect.title}
            </div>
          </button>
        ))}
      </nav>
    </aside>
  )
}
