import { useState, useEffect, useRef, useCallback } from 'react'
import { generateCrosswordPairs } from '../utils/anthropic.js'
import { buildCrossword } from '../utils/crosswordLayout.js'
import { getCombinedContent } from '../data/lectures.js'

export default function Crossword({ apiKey, rangeFrom, rangeTo, onNeedApiKey }) {
  const [status, setStatus] = useState('idle') // idle | loading | playing | done
  const [pairs, setPairs] = useState([])
  const [layout, setLayout] = useState(null)
  const [userGrid, setUserGrid] = useState({}) // "r,c" -> typed letter
  const [selected, setSelected] = useState(null) // {r, c}
  const [activeWord, setActiveWord] = useState(null) // placed word obj
  const [activeDir, setActiveDir] = useState('across')
  const [checked, setChecked] = useState({}) // "r,c" -> true/false
  const [revealed, setRevealed] = useState({})
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function startGame() {
    if (!apiKey) { onNeedApiKey(); return }
    setStatus('loading')
    setError('')
    setChecked({})
    setRevealed({})
    setUserGrid({})
    setSelected(null)
    setActiveWord(null)
    try {
      const content = getCombinedContent(rangeFrom, rangeTo)
      const rawPairs = await generateCrosswordPairs(apiKey, content)
      setPairs(rawPairs)
      const result = buildCrossword(rawPairs)
      setLayout(result)
      setStatus('playing')
    } catch (e) {
      setError(e.message)
      setStatus('idle')
    }
  }

  // Find which word(s) own a cell
  function getWordsAtCell(r, c) {
    if (!layout) return []
    return layout.placed.filter(pw => {
      const dr = pw.dir === 'down' ? 1 : 0
      const dc = pw.dir === 'across' ? 1 : 0
      for (let i = 0; i < pw.clean.length; i++) {
        if (pw.row + dr * i === r && pw.col + dc * i === c) return true
      }
      return false
    })
  }

  function handleCellClick(r, c) {
    const words = getWordsAtCell(r, c)
    if (!words.length) return

    if (selected?.r === r && selected?.c === c) {
      // Toggle direction
      const other = words.find(w => w.dir !== activeDir)
      if (other) { setActiveDir(other.dir); setActiveWord(other) }
    } else {
      setSelected({ r, c })
      const preferred = words.find(w => w.dir === activeDir) || words[0]
      setActiveDir(preferred.dir)
      setActiveWord(preferred)
    }
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (!selected || !activeWord) return
    const { r, c } = selected
    const dr = activeDir === 'down' ? 1 : 0
    const dc = activeDir === 'across' ? 1 : 0

    if (e.key === 'Backspace') {
      e.preventDefault()
      if (userGrid[`${r},${c}`]) {
        setUserGrid(prev => { const n = {...prev}; delete n[`${r},${c}`]; return n })
      } else {
        // Move backward
        const pr = r - dr, pc = c - dc
        if (layout.grid[`${pr},${pc}`]) {
          setSelected({ r: pr, c: pc })
          setUserGrid(prev => { const n = {...prev}; delete n[`${pr},${pc}`]; return n })
        }
      }
      return
    }

    if (e.key === 'ArrowRight') { e.preventDefault(); setSelected({ r, c: c + 1 }); return }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); setSelected({ r, c: c - 1 }); return }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setSelected({ r: r + 1, c }); return }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setSelected({ r: r - 1, c }); return }

    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault()
      const letter = e.key.toUpperCase()
      setUserGrid(prev => ({ ...prev, [`${r},${c}`]: letter }))
      // Advance to next cell in word
      const nr = r + dr, nc = c + dc
      if (layout.grid[`${nr},${nc}`]) setSelected({ r: nr, c: nc })
    }
  }

  function checkAnswers() {
    if (!layout) return
    const result = {}
    for (const [key, letter] of Object.entries(layout.grid)) {
      const typed = userGrid[key]
      if (typed) result[key] = typed === letter
    }
    setChecked(result)
  }

  function revealWord() {
    if (!activeWord) return
    const dr = activeWord.dir === 'down' ? 1 : 0
    const dc = activeWord.dir === 'across' ? 1 : 0
    const updates = {}
    const revs = {}
    for (let i = 0; i < activeWord.clean.length; i++) {
      const key = `${activeWord.row + dr * i},${activeWord.col + dc * i}`
      updates[key] = activeWord.clean[i]
      revs[key] = true
    }
    setUserGrid(prev => ({ ...prev, ...updates }))
    setRevealed(prev => ({ ...prev, ...revs }))
  }

  function getCellState(r, c) {
    const key = `${r},${c}`
    if (!layout?.grid[key]) return 'black'
    if (revealed[key]) return 'revealed'
    if (checked[key] === true) return 'correct'
    if (checked[key] === false) return 'wrong'
    // Highlight active word
    if (activeWord) {
      const dr = activeWord.dir === 'down' ? 1 : 0
      const dc = activeWord.dir === 'across' ? 1 : 0
      for (let i = 0; i < activeWord.clean.length; i++) {
        if (activeWord.row + dr * i === r && activeWord.col + dc * i === c) {
          if (selected?.r === r && selected?.c === c) return 'active'
          return 'highlighted'
        }
      }
    }
    if (selected?.r === r && selected?.c === c) return 'active'
    return 'empty'
  }

  function getStartNumber(r, c) {
    return layout?.placed.find(pw => pw.row === r && pw.col === c)?.number
  }

  const across = layout?.placed.filter(p => p.dir === 'across').sort((a,b) => a.number - b.number) || []
  const down   = layout?.placed.filter(p => p.dir === 'down').sort((a,b) => a.number - b.number) || []

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">✏️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Crossword Puzzle</h2>
          <p className="text-[#9ba6b3] max-w-md">
            Claude generates ~12 terms from the selected lecture range.
            Fill in the grid using across and down clues.
          </p>
        </div>
        {error && (
          <div className="bg-[#2a0e0e] border border-[#f87171] rounded-lg px-4 py-3 text-[#f87171] text-sm max-w-sm text-center">
            {error}
          </div>
        )}
        <button onClick={startGame} disabled={status === 'loading'}
          className="bg-[#22d3ee] text-[#0d1117] font-bold px-8 py-3 rounded-xl hover:bg-[#06b6d4]
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg">
          {status === 'loading' ? '⏳ Generating puzzle…' : '▶ Start Crossword'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex gap-0 overflow-hidden">
      {/* Hidden input to capture keypresses */}
      <input ref={inputRef} className="sr-only" onKeyDown={handleKeyDown} readOnly />

      {/* Grid */}
      <div className="flex-1 overflow-auto p-6 flex flex-col items-center" onClick={() => inputRef.current?.focus()}>
        <div className="flex gap-3 mb-5">
          <button onClick={checkAnswers}
            className="px-4 py-2 bg-[#22d3ee] text-[#0d1117] font-bold rounded-lg hover:bg-[#06b6d4] text-sm">
            Check Answers
          </button>
          <button onClick={revealWord} disabled={!activeWord}
            className="px-4 py-2 border border-[#7c5cff] text-[#a78bfa] rounded-lg hover:bg-[#1a1030] text-sm
                       disabled:opacity-40 disabled:cursor-not-allowed">
            Reveal Word
          </button>
          <button onClick={startGame}
            className="px-4 py-2 border border-[#2a3140] text-[#9ba6b3] rounded-lg hover:border-[#3a4150] text-sm">
            New Puzzle
          </button>
        </div>

        {/* Crossword grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${layout.cols}, 36px)`, gap: '2px' }}>
          {Array.from({ length: layout.rows }, (_, r) =>
            Array.from({ length: layout.cols }, (_, c) => {
              const state = getCellState(r, c)
              const num = getStartNumber(r, c)
              const letter = userGrid[`${r},${c}`] || ''
              return (
                <div key={`${r},${c}`}
                  className={`crossword-cell ${state === 'black' ? 'black' : ''} ${state === 'active' ? 'active' : ''} ${state === 'highlighted' ? 'highlighted' : ''} ${state === 'correct' ? 'correct' : ''} ${state === 'wrong' ? 'wrong' : ''} ${state === 'revealed' ? 'revealed' : ''}`}
                  onClick={() => state !== 'black' && handleCellClick(r, c)}
                >
                  {state !== 'black' && num && <span className="crossword-num">{num}</span>}
                  {state !== 'black' && <span>{letter}</span>}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Clues panel */}
      <div className="w-64 border-l border-[#2a3140] overflow-y-auto p-4 bg-[#0d1117] flex-shrink-0">
        <div className="mb-5">
          <h3 className="text-xs font-bold text-[#22d3ee] uppercase tracking-wider mb-3">Across</h3>
          {across.map(pw => (
            <button key={`a-${pw.number}`}
              onClick={() => { setActiveWord(pw); setActiveDir('across'); setSelected({ r: pw.row, c: pw.col }) }}
              className={`w-full text-left text-xs px-2 py-1.5 rounded mb-1 transition-colors
                ${activeWord?.id === pw.id && activeDir === 'across'
                  ? 'bg-[#1a2d3a] text-[#22d3ee]'
                  : 'text-[#9ba6b3] hover:text-[#e6edf3] hover:bg-[#161b22]'}`}>
              <span className="font-bold mr-1">{pw.number}.</span>{pw.clue}
            </button>
          ))}
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#a78bfa] uppercase tracking-wider mb-3">Down</h3>
          {down.map(pw => (
            <button key={`d-${pw.number}`}
              onClick={() => { setActiveWord(pw); setActiveDir('down'); setSelected({ r: pw.row, c: pw.col }) }}
              className={`w-full text-left text-xs px-2 py-1.5 rounded mb-1 transition-colors
                ${activeWord?.id === pw.id && activeDir === 'down'
                  ? 'bg-[#1a1030] text-[#a78bfa]'
                  : 'text-[#9ba6b3] hover:text-[#e6edf3] hover:bg-[#161b22]'}`}>
              <span className="font-bold mr-1">{pw.number}.</span>{pw.clue}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
