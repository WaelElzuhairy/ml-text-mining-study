import { useState } from 'react'
import TabNav from './components/TabNav.jsx'
import Sidebar from './components/Sidebar.jsx'
import RangeSelector from './components/RangeSelector.jsx'
import CheatSheetViewer from './components/CheatSheetViewer.jsx'
import Crossword from './components/Crossword.jsx'
import TicTacToe from './components/TicTacToe.jsx'
import CaseStudy from './components/CaseStudy.jsx'
import ApiKeyModal from './components/ApiKeyModal.jsx'

export default function App() {
  const [activeTab, setActiveTab]     = useState('lectures')
  const [selectedLecture, setSelected] = useState(1)
  const [rangeFrom, setRangeFrom]     = useState(1)
  const [rangeTo, setRangeTo]         = useState(8)
  const [apiKey, setApiKey]           = useState('')
  const [showApiModal, setShowApiModal] = useState(false)
  const [gameMode, setGameMode]       = useState('crossword') // crossword | tictactoe

  function handleRangeChange(f, t) { setRangeFrom(f); setRangeTo(t) }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0d1117] text-[#e6edf3]">
      {/* Site Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-[#2a3140] bg-[#161b22] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22d3ee] to-[#7c5cff] flex items-center justify-center text-sm font-black text-[#0d1117]">
            ML
          </div>
          <div>
            <span className="font-bold text-white text-sm">ML for Text Mining</span>
            <span className="text-[#9ba6b3] text-xs ml-2 hidden sm:inline">— Study Companion</span>
          </div>
        </div>
        <button
          onClick={() => setShowApiModal(true)}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-colors
            ${apiKey
              ? 'border-[#34d399]/40 text-[#34d399] hover:border-[#34d399]'
              : 'border-[#f59e0b]/40 text-[#f59e0b] hover:border-[#f59e0b]'}`}
        >
          {apiKey ? '🔑 Key saved' : '🔑 Set API Key'}
        </button>
      </header>

      <TabNav active={activeTab} onChange={setActiveTab} />

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LECTURES TAB ── */}
        {activeTab === 'lectures' && (
          <>
            <Sidebar selected={selectedLecture} onSelect={setSelected} />
            <CheatSheetViewer lectureId={selectedLecture} />
          </>
        )}

        {/* ── GAMES TAB ── */}
        {activeTab === 'games' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <RangeSelector from={rangeFrom} to={rangeTo} onChange={handleRangeChange} />

            {/* Game selector */}
            <div className="flex gap-2 px-5 py-3 border-b border-[#2a3140] bg-[#0d1117]">
              <button
                onClick={() => setGameMode('crossword')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${gameMode === 'crossword'
                    ? 'bg-[#1a2d3a] text-[#22d3ee] border border-[#22d3ee]/40'
                    : 'text-[#9ba6b3] hover:text-[#e6edf3] border border-transparent'}`}
              >
                ✏️ Crossword
              </button>
              <button
                onClick={() => setGameMode('tictactoe')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${gameMode === 'tictactoe'
                    ? 'bg-[#1a1030] text-[#a78bfa] border border-[#7c5cff]/40'
                    : 'text-[#9ba6b3] hover:text-[#e6edf3] border border-transparent'}`}
              >
                ⭕ NLP Tic-Tac-Toe
              </button>
            </div>

            {gameMode === 'crossword'
              ? <Crossword apiKey={apiKey} rangeFrom={rangeFrom} rangeTo={rangeTo} onNeedApiKey={() => setShowApiModal(true)} />
              : <TicTacToe apiKey={apiKey} rangeFrom={rangeFrom} rangeTo={rangeTo} onNeedApiKey={() => setShowApiModal(true)} />
            }
          </div>
        )}

        {/* ── CASES TAB ── */}
        {activeTab === 'cases' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <RangeSelector from={rangeFrom} to={rangeTo} onChange={handleRangeChange} />
            <CaseStudy apiKey={apiKey} rangeFrom={rangeFrom} rangeTo={rangeTo} onNeedApiKey={() => setShowApiModal(true)} />
          </div>
        )}
      </div>

      {showApiModal && (
        <ApiKeyModal
          onSave={(k) => { setApiKey(k); setShowApiModal(false) }}
          onClose={() => setShowApiModal(false)}
        />
      )}
    </div>
  )
}
