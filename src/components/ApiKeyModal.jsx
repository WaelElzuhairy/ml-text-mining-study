import { useState } from 'react'

export default function ApiKeyModal({ onSave, onClose }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  function handleSave() {
    const trimmed = key.trim()
    if (!trimmed.startsWith('gsk_')) {
      setError('Key should start with gsk_…')
      return
    }
    onSave(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-content-center bg-black/70 backdrop-blur-sm"
         style={{alignItems:'center',justifyContent:'center'}}>
      <div className="bg-[#161b22] border border-[#2a3140] rounded-2xl p-8 w-full max-w-md shadow-2xl fade-in">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🔑</span>
          <h2 className="text-xl font-bold text-white">Groq API Key</h2>
        </div>
        <p className="text-[#9ba6b3] text-sm mb-6">
          Required for Games and Cases tabs. Free forever at console.groq.com — no credit card needed.
          Your key is stored in memory only and never saved anywhere.
        </p>

        <input
          type="password"
          placeholder="gsk_..."
          value={key}
          onChange={e => { setKey(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="w-full bg-[#0d1117] border border-[#2a3140] rounded-lg px-4 py-3 text-white
                     placeholder-[#4a5568] focus:outline-none focus:border-[#22d3ee] text-sm font-mono mb-2"
          autoFocus
        />
        {error && <p className="text-[#f87171] text-xs mb-3">{error}</p>}

        <p className="text-[#9ba6b3] text-xs mb-6">
          Get a free key at{' '}
          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer"
             className="text-[#22d3ee] hover:underline">console.groq.com/keys</a>
          {' '}— sign up with Google, no card required.
        </p>

        <div className="flex gap-3">
          <button onClick={handleSave}
            className="flex-1 bg-[#22d3ee] text-[#0d1117] font-bold py-2.5 rounded-lg hover:bg-[#06b6d4] transition-colors">
            Save Key
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 border border-[#2a3140] rounded-lg text-[#9ba6b3] hover:border-[#3a4150] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
