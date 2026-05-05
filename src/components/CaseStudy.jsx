import { useState } from 'react'
import { generateCase, scoreAnswer } from '../utils/anthropic.js'
import { getCombinedContent, getLecturesInRange } from '../data/lectures.js'

export default function CaseStudy({ apiKey, rangeFrom, rangeTo, onNeedApiKey }) {
  const [status, setStatus] = useState('idle') // idle | loading | answering | scoring | done
  const [caseData, setCaseData] = useState(null)
  const [studentAnswer, setStudentAnswer] = useState('')
  const [scoreData, setScoreData] = useState(null)
  const [error, setError] = useState('')

  const lectures = getLecturesInRange(rangeFrom, rangeTo)

  async function generateNewCase() {
    if (!apiKey) { onNeedApiKey(); return }
    setStatus('loading')
    setError('')
    setScoreData(null)
    setStudentAnswer('')
    try {
      const content = getCombinedContent(rangeFrom, rangeTo)
      const data = await generateCase(apiKey, content)
      setCaseData(data)
      setStatus('answering')
    } catch (e) {
      setError(e.message)
      setStatus('idle')
    }
  }

  async function submitAnswer() {
    if (!studentAnswer.trim() || !caseData) return
    setStatus('scoring')
    try {
      const content = getCombinedContent(rangeFrom, rangeTo)
      const result = await scoreAnswer(apiKey, caseData, studentAnswer, content)
      setScoreData(result)
      setStatus('done')
    } catch (e) {
      setError(e.message)
      setStatus('answering')
    }
  }

  const scoreColor = (n) => {
    if (n >= 8) return 'text-[#34d399]'
    if (n >= 5) return 'text-[#f59e0b]'
    return 'text-[#f87171]'
  }

  const scoreBg = (n) => {
    if (n >= 8) return 'bg-[#0d2818] border-[#34d399]'
    if (n >= 5) return 'bg-[#1a1400] border-[#f59e0b]'
    return 'bg-[#2a0e0e] border-[#f87171]'
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header strip */}
      <div className="px-6 py-4 bg-[#161b22] border-b border-[#2a3140] flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white">Case Study</h2>
          <p className="text-xs text-[#9ba6b3]">
            {lectures.map(l => `Lect ${l.number}`).join(' · ')} &nbsp;·&nbsp;
            Apply concepts to a real-world scenario · Scored 0–10 by AI
          </p>
        </div>
        <button onClick={generateNewCase} disabled={status === 'loading' || status === 'scoring'}
          className="bg-[#7c5cff] text-white font-bold px-5 py-2 rounded-lg hover:bg-[#6b4fe0]
                     disabled:opacity-50 transition-colors text-sm">
          {status === 'loading' ? '⏳ Generating…' : status === 'idle' ? '▶ Generate Case' : '↺ New Case'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-3xl w-full mx-auto">

        {error && (
          <div className="bg-[#2a0e0e] border border-[#f87171] rounded-lg px-4 py-3 text-[#f87171] text-sm mb-4">
            {error}
          </div>
        )}

        {status === 'idle' && !caseData && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to practice?</h3>
            <p className="text-[#9ba6b3] max-w-sm mx-auto mb-6">
              Claude generates a realistic scenario from your selected lecture range.
              Write your answer, then get AI feedback with a score from 0–10.
            </p>
            <button onClick={generateNewCase}
              className="bg-[#7c5cff] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#6b4fe0] transition-colors text-lg">
              Generate Case Study
            </button>
          </div>
        )}

        {caseData && (
          <div className="space-y-5 fade-in">
            {/* Case title */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#1a1030] border border-[#7c5cff] text-[#a78bfa] text-xs font-bold rounded-full uppercase tracking-wider">
                Case Study
              </span>
              <h3 className="font-bold text-white text-lg">{caseData.title}</h3>
            </div>

            {/* Scenario */}
            <div className="bg-[#161b22] border border-[#2a3140] rounded-xl p-5">
              <p className="text-xs font-bold text-[#9ba6b3] uppercase tracking-wider mb-2">Scenario</p>
              <p className="text-[#e6edf3] leading-relaxed">{caseData.scenario}</p>
            </div>

            {/* Task */}
            <div className="bg-[#1a1030] border border-[#7c5cff] rounded-xl p-5">
              <p className="text-xs font-bold text-[#a78bfa] uppercase tracking-wider mb-2">Your Task</p>
              <p className="text-[#e6edf3] leading-relaxed">{caseData.task}</p>
            </div>

            {/* Expected concepts hint */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-[#9ba6b3]">Concepts to address:</span>
              {caseData.expectedConcepts?.map((c, i) => (
                <span key={i} className="px-2 py-0.5 bg-[#161b22] border border-[#2a3140] rounded text-xs text-[#cdd6e0]">
                  {c}
                </span>
              ))}
            </div>

            {/* Answer textarea */}
            {(status === 'answering' || status === 'scoring') && (
              <div>
                <label className="text-xs font-bold text-[#9ba6b3] uppercase tracking-wider block mb-2">
                  Your Answer
                </label>
                <textarea
                  value={studentAnswer}
                  onChange={e => setStudentAnswer(e.target.value)}
                  placeholder="Write your answer here. Reference specific concepts from the lecture, explain the approach, and justify your reasoning…"
                  rows={8}
                  disabled={status === 'scoring'}
                  className="w-full bg-[#0d1117] border border-[#2a3140] rounded-xl p-4 text-[#e6edf3]
                             placeholder-[#4a5568] focus:outline-none focus:border-[#7c5cff] text-sm
                             resize-none disabled:opacity-60"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-[#9ba6b3]">{studentAnswer.length} characters</span>
                  <button onClick={submitAnswer}
                    disabled={!studentAnswer.trim() || status === 'scoring'}
                    className="bg-[#7c5cff] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-[#6b4fe0]
                               disabled:opacity-50 transition-colors">
                    {status === 'scoring' ? '⏳ Scoring…' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            )}

            {/* Score results */}
            {status === 'done' && scoreData && (
              <div className="space-y-4 fade-in">
                {/* Score badge */}
                <div className={`flex items-center gap-4 p-5 rounded-xl border ${scoreBg(scoreData.score)}`}>
                  <div className={`text-5xl font-black ${scoreColor(scoreData.score)}`}>
                    {scoreData.score}<span className="text-2xl text-[#9ba6b3]">/10</span>
                  </div>
                  <p className="text-[#e6edf3] text-sm leading-relaxed">{scoreData.feedback}</p>
                </div>

                {/* What you got right */}
                {scoreData.correct?.length > 0 && (
                  <div className="bg-[#0d2818] border border-[#34d399]/30 rounded-xl p-4">
                    <p className="text-xs font-bold text-[#34d399] uppercase tracking-wider mb-3">What you got right</p>
                    <ul className="space-y-1.5">
                      {scoreData.correct.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-[#86efac]">
                          <span className="flex-shrink-0">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What's missing */}
                {scoreData.missing?.length > 0 && (
                  <div className="bg-[#1a1000] border border-[#f59e0b]/30 rounded-xl p-4">
                    <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-3">Missing / needs improvement</p>
                    <ul className="space-y-1.5">
                      {scoreData.missing.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-[#fcd34d]">
                          <span className="flex-shrink-0">◦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Review concepts */}
                {scoreData.review?.length > 0 && (
                  <div className="bg-[#161b22] border border-[#2a3140] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#9ba6b3] uppercase tracking-wider mb-3">Key concepts to review</p>
                    <div className="flex flex-wrap gap-2">
                      {scoreData.review.map((item, i) => (
                        <span key={i} className="px-3 py-1 bg-[#1a2d3a] border border-[#22d3ee]/30 text-[#22d3ee] text-xs rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={generateNewCase}
                    className="bg-[#7c5cff] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#6b4fe0] text-sm">
                    New Case Study
                  </button>
                  <button onClick={() => { setStatus('answering'); setScoreData(null); setStudentAnswer('') }}
                    className="px-5 py-2.5 border border-[#2a3140] text-[#9ba6b3] rounded-lg hover:border-[#3a4150] text-sm">
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
