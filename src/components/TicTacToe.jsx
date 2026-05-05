import { useState } from 'react'
import { generateTTTPairs, validateAnswer } from '../utils/anthropic.js'
import { getCombinedContent } from '../data/lectures.js'

/* ── Minimax AI ─────────────────────────────────────────────────────────── */
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function checkWinner(board) {
  for (const [a,b,c] of LINES)
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { winner: board[a], line: [a,b,c] }
  return null
}

function minimax(board, depth, isMax) {
  const w = checkWinner(board)
  if (w) return w.winner === 'O' ? 10 - depth : depth - 10
  if (board.every(Boolean)) return 0
  if (isMax) {
    let best = -Infinity
    board.forEach((_, i) => { if (!board[i]) { board[i]='O'; best=Math.max(best,minimax(board,depth+1,false)); board[i]=null } })
    return best
  } else {
    let best = Infinity
    board.forEach((_, i) => { if (!board[i]) { board[i]='X'; best=Math.min(best,minimax(board,depth+1,true)); board[i]=null } })
    return best
  }
}

function bestAIMove(board) {
  let best = -Infinity, move = -1
  board.forEach((_, i) => {
    if (!board[i]) {
      board[i] = 'O'
      const score = minimax(board, 0, false)
      board[i] = null
      if (score > best) { best = score; move = i }
    }
  })
  return move
}
/* ─────────────────────────────────────────────────────────────────────────── */

export default function TicTacToe({ apiKey, rangeFrom, rangeTo, onNeedApiKey }) {
  const [status, setStatus]         = useState('idle')
  const [pairs, setPairs]           = useState([])          // [{term, definition}] x9
  const [board, setBoard]           = useState(Array(9).fill(null)) // 'X'|'O'|null
  const [cellStatus, setCellStatus] = useState(Array(9).fill('hidden')) // hidden|open|correct|wrong
  const [activeCell, setActiveCell] = useState(null)
  const [inputVal, setInputVal]     = useState('')
  const [validating, setValidating] = useState(false)
  const [result, setResult]         = useState(null)  // {winner:'X'|'O'|'draw', line?}
  const [error, setError]           = useState('')
  const [feedback, setFeedback]     = useState(null)  // {correct, feedback} for last answer

  async function startGame() {
    if (!apiKey) { onNeedApiKey(); return }
    setStatus('loading'); setError('')
    try {
      const content = getCombinedContent(rangeFrom, rangeTo)
      const data = await generateTTTPairs(apiKey, content)
      setPairs(data.slice(0, 9))
      setBoard(Array(9).fill(null))
      setCellStatus(Array(9).fill('hidden'))
      setActiveCell(null)
      setResult(null)
      setFeedback(null)
      setStatus('playing')
    } catch (e) {
      setError(e.message); setStatus('idle')
    }
  }

  function openCell(idx) {
    if (board[idx] || cellStatus[idx] !== 'hidden' || result) return
    setActiveCell(idx)
    setInputVal('')
    setFeedback(null)
    setCellStatus(prev => { const n=[...prev]; n[idx]='open'; return n })
  }

  async function submitAnswer() {
    if (activeCell === null || !inputVal.trim()) return
    setValidating(true)
    const pair = pairs[activeCell]
    try {
      const res = await validateAnswer(apiKey, pair.term, pair.definition, inputVal.trim())
      setFeedback(res)

      const newBoard = [...board]
      const newStatus = [...cellStatus]

      if (res.correct) {
        newBoard[activeCell] = 'X'
        newStatus[activeCell] = 'correct'
        setBoard(newBoard)
        setCellStatus(newStatus)
        const win = checkWinner(newBoard)
        if (win) { setResult({ winner: 'X', line: win.line }); setActiveCell(null); setValidating(false); return }
        if (newBoard.every(Boolean)) { setResult({ winner: 'draw' }); setActiveCell(null); setValidating(false); return }
      } else {
        // Wrong: student loses the cell, AI plays
        newBoard[activeCell] = 'O'
        newStatus[activeCell] = 'wrong'

        const aiIdx = bestAIMove(newBoard)
        if (aiIdx !== -1) {
          newBoard[aiIdx] = 'O'
          newStatus[aiIdx] = 'wrong'
        }

        setBoard(newBoard)
        setCellStatus(newStatus)

        const win = checkWinner(newBoard)
        if (win) { setResult({ winner: 'O', line: win.line }); setActiveCell(null); setValidating(false); return }
        if (newBoard.every(Boolean)) { setResult({ winner: 'draw' }); setActiveCell(null); setValidating(false); return }
      }
      setActiveCell(null)
    } catch (e) {
      setFeedback({ correct: false, feedback: 'Validation failed: ' + e.message })
    }
    setValidating(false)
  }

  function isWinningCell(idx) {
    return result?.line?.includes(idx)
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⭕</div>
          <h2 className="text-2xl font-bold text-white mb-2">NLP Tic-Tac-Toe</h2>
          <p className="text-[#9ba6b3] max-w-md">
            9 cells, each hiding a definition. Pick a cell, read the definition, type the correct term.
            Get it right → X. Get it wrong → AI takes it (O) and makes a strategic move.
          </p>
          <div className="flex justify-center gap-8 mt-4 text-sm">
            <span className="text-[#34d399]">✅ Correct → X (you)</span>
            <span className="text-[#f87171]">❌ Wrong → O (AI) + AI moves</span>
          </div>
        </div>
        {error && (
          <div className="bg-[#2a0e0e] border border-[#f87171] rounded-lg px-4 py-3 text-[#f87171] text-sm max-w-sm text-center">
            {error}
          </div>
        )}
        <button onClick={startGame} disabled={status === 'loading'}
          className="bg-[#22d3ee] text-[#0d1117] font-bold px-8 py-3 rounded-xl hover:bg-[#06b6d4]
                     disabled:opacity-50 transition-colors text-lg">
          {status === 'loading' ? '⏳ Generating…' : '▶ Start Game'}
        </button>
      </div>
    )
  }

  const score = { X: board.filter(c => c==='X').length, O: board.filter(c => c==='O').length }

  return (
    <div className="flex-1 flex flex-col items-center p-6 overflow-auto">
      {/* Score bar */}
      <div className="flex items-center gap-8 mb-5">
        <div className="text-center">
          <div className="text-2xl font-black text-[#34d399]">{score.X}</div>
          <div className="text-xs text-[#9ba6b3]">You (X)</div>
        </div>
        <div className="text-[#9ba6b3] text-sm">vs</div>
        <div className="text-center">
          <div className="text-2xl font-black text-[#f87171]">{score.O}</div>
          <div className="text-xs text-[#9ba6b3]">AI (O)</div>
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`mb-5 px-6 py-3 rounded-xl font-bold text-lg fade-in
          ${result.winner === 'X' ? 'bg-[#0d2818] text-[#34d399] border border-[#34d399]'
          : result.winner === 'O' ? 'bg-[#2a0e0e] text-[#f87171] border border-[#f87171]'
          : 'bg-[#1c2230] text-[#9ba6b3] border border-[#2a3140]'}`}>
          {result.winner === 'X' ? '🎉 You win!' : result.winner === 'O' ? '🤖 AI wins!' : "🤝 It's a draw!"}
          <button onClick={startGame} className="ml-4 text-sm underline opacity-70 hover:opacity-100">Play again</button>
        </div>
      )}

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-lg mb-6">
        {Array.from({length:9}, (_,i) => {
          const stat = cellStatus[i]
          const mark = board[i]
          const pair = pairs[i]
          const winning = isWinningCell(i)
          return (
            <div key={i}
              onClick={() => stat === 'hidden' && !result && openCell(i)}
              className={`ttt-cell min-h-[110px]
                ${stat === 'hidden' && !result ? '' : ''}
                ${stat === 'correct' || (stat === 'open' && mark === 'X') ? 'used-x' : ''}
                ${stat === 'wrong'   || (stat === 'open' && mark === 'O') ? 'used-o' : ''}
                ${winning ? 'winning' : ''}
                ${activeCell === i ? 'border-[#22d3ee] bg-[#1a2d3a]' : ''}`}
            >
              {stat === 'hidden' && !mark && (
                <span className="text-3xl text-[#2a3140] group-hover:text-[#3a4150]">?</span>
              )}
              {mark && (
                <span className={`text-4xl font-black ${mark === 'X' ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
                  {mark}
                </span>
              )}
              {stat === 'open' && !mark && pair && (
                <p className="text-xs text-[#cdd6e0] text-center leading-relaxed">{pair.definition}</p>
              )}
              {(stat === 'correct' || stat === 'wrong') && pair && (
                <p className="text-xs text-center mt-1 opacity-70">{pair.term}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Answer input panel */}
      {activeCell !== null && pairs[activeCell] && (
        <div className="w-full max-w-lg bg-[#161b22] border border-[#22d3ee] rounded-xl p-5 fade-in">
          <p className="text-xs text-[#9ba6b3] uppercase tracking-wider mb-2">Definition</p>
          <p className="text-[#e6edf3] mb-4 leading-relaxed">{pairs[activeCell].definition}</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type the term…"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !validating && submitAnswer()}
              className="flex-1 bg-[#0d1117] border border-[#2a3140] rounded-lg px-4 py-2.5 text-white
                         placeholder-[#4a5568] focus:outline-none focus:border-[#22d3ee] text-sm"
              autoFocus
              disabled={validating}
            />
            <button onClick={submitAnswer} disabled={validating || !inputVal.trim()}
              className="bg-[#22d3ee] text-[#0d1117] font-bold px-5 py-2.5 rounded-lg hover:bg-[#06b6d4]
                         disabled:opacity-50 transition-colors">
              {validating ? '…' : 'Submit'}
            </button>
          </div>
          {feedback && (
            <div className={`mt-3 text-sm px-3 py-2 rounded-lg fade-in
              ${feedback.correct ? 'bg-[#0d2818] text-[#34d399]' : 'bg-[#2a0e0e] text-[#f87171]'}`}>
              {feedback.correct ? '✅' : '❌'} {feedback.feedback}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
