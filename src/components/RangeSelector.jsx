import { LECTURES } from '../data/lectures.js'

export default function RangeSelector({ from, to, onChange }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-[#161b22] border-b border-[#2a3140]">
      <span className="text-xs font-semibold text-[#9ba6b3] uppercase tracking-wider">Lecture Range:</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#9ba6b3]">From</span>
        <select
          value={from}
          onChange={e => onChange(Number(e.target.value), to)}
          className="bg-[#0d1117] border border-[#2a3140] text-[#e6edf3] text-sm rounded-lg px-3 py-1.5
                     focus:outline-none focus:border-[#22d3ee] cursor-pointer"
        >
          {LECTURES.map(l => (
            <option key={l.id} value={l.id} disabled={l.id > to}>
              Lect {l.number} — {l.title}
            </option>
          ))}
        </select>
        <span className="text-xs text-[#9ba6b3]">To</span>
        <select
          value={to}
          onChange={e => onChange(from, Number(e.target.value))}
          className="bg-[#0d1117] border border-[#2a3140] text-[#e6edf3] text-sm rounded-lg px-3 py-1.5
                     focus:outline-none focus:border-[#22d3ee] cursor-pointer"
        >
          {LECTURES.map(l => (
            <option key={l.id} value={l.id} disabled={l.id < from}>
              Lect {l.number} — {l.title}
            </option>
          ))}
        </select>
      </div>
      <span className="text-xs text-[#9ba6b3] ml-1">
        ({to - from + 1} lecture{to - from !== 0 ? 's' : ''})
      </span>
    </div>
  )
}
