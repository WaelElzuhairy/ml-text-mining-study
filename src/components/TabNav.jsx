const TABS = [
  { id: 'lectures', label: 'Lectures', icon: '📚' },
  { id: 'games',    label: 'Games',    icon: '🎮' },
  { id: 'cases',    label: 'Cases',    icon: '🧠' },
]

export default function TabNav({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 px-4 border-b border-[#2a3140] bg-[#0d1117]">
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors
            ${active === t.id
              ? 'border-[#22d3ee] text-[#22d3ee]'
              : 'border-transparent text-[#9ba6b3] hover:text-[#e6edf3]'}`}
        >
          <span>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  )
}
