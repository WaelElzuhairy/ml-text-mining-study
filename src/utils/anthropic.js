const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

// Parse comma-separated keys from either the env var or a manually entered key
function parseKeys(apiKey) {
  const envKeys = import.meta.env.VITE_GROQ_KEY
  const source = envKeys || apiKey
  return source.split(',').map(k => k.trim()).filter(Boolean)
}

async function callGroq(apiKey, systemPrompt, userMessage, maxTokens = 1000) {
  const keys = parseKeys(apiKey)
  let lastError = null

  for (const key of keys) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return data.choices[0].message.content
    }

    const err = await res.json().catch(() => ({}))
    lastError = err?.error?.message || `Groq API error ${res.status}`

    // Only rotate on rate limit (429), fail fast on auth errors (401)
    if (res.status !== 429) break
  }

  throw new Error(lastError || 'All API keys exhausted')
}

// Generate crossword clues: returns [{term, clue}]
export async function generateCrosswordPairs(apiKey, lectureContent) {
  const system = `You are an NLP professor creating a crossword puzzle for students.
Return ONLY valid JSON — no markdown, no explanation.`

  const user = `Based on this lecture content, generate exactly 12 term-clue pairs for a crossword puzzle.

LECTURE CONTENT:
${lectureContent}

Rules:
- Terms must be SINGLE words or hyphenated (no spaces) — e.g. "TRANSFORMER", "SELF-ATTENTION", "BACKPROPAGATION", "OVERFITTING"
- Terms must be 4-15 characters
- Clues are concise definitions (max 12 words) matching the professor's style
- No duplicate terms
- Mix easy, medium, and hard clues
- Terms should cover the key vocabulary from the lecture

Return JSON array ONLY:
[
  {"term": "TRANSFORMER", "clue": "Architecture based entirely on attention mechanisms"},
  {"term": "EMBEDDING", "clue": "Dense vector representation of a word"},
  ...
]`

  const text = await callGroq(apiKey, system, user, 1000)
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Invalid response from AI')
  return JSON.parse(jsonMatch[0])
}

// Generate TicTacToe definitions: returns [{term, definition}] (9 items)
export async function generateTTTPairs(apiKey, lectureContent) {
  const system = `You are an NLP professor creating a vocabulary game for students.
Return ONLY valid JSON — no markdown, no explanation.`

  const user = `Based on this lecture content, generate exactly 9 term-definition pairs for a Tic-Tac-Toe vocabulary game.

LECTURE CONTENT:
${lectureContent}

Rules:
- Each "definition" is a short, clear description of the term (1-2 sentences max, professor-style)
- Terms should be key vocabulary words from the lecture
- Mix difficulty levels (3 easy, 3 medium, 3 hard)
- Definitions should be unambiguous — only one term fits each definition
- Draw definitions from different parts of the lecture (good coverage)

Return JSON array ONLY (exactly 9 items):
[
  {"term": "BERT", "definition": "A bidirectional encoder that learns context from both left and right sides simultaneously using masked language modeling."},
  {"term": "Attention", "definition": "A mechanism that allows the decoder to dynamically focus on different parts of the input at each generation step."},
  ...
]`

  const text = await callGroq(apiKey, system, user, 800)
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Invalid response from AI')
  return JSON.parse(jsonMatch[0])
}

// Generate a case study
export async function generateCase(apiKey, lectureContent) {
  const system = `You are Dr. Manar Elshazly, an ML for Text Mining professor creating realistic exam case studies.
Write in an academic but accessible style. Format your response as JSON only.`

  const user = `Based on this lecture content, generate a realistic case study scenario that requires students to apply the key concepts.

LECTURE CONTENT:
${lectureContent}

The case study must:
- Present a real-world business, medical, or research scenario (2-3 sentences)
- Pose a specific task question asking students to apply concepts from the lecture
- List 4-6 key concepts the answer should address (these are the expected concepts)
- Match the style of a real university exam question

Return JSON ONLY:
{
  "title": "Short descriptive title",
  "scenario": "2-3 sentence real-world scenario description...",
  "task": "Specific question asking students to apply the lecture concepts...",
  "expectedConcepts": ["concept1", "concept2", "concept3", "concept4", "concept5"]
}`

  const text = await callGroq(apiKey, system, user, 600)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid response from AI')
  return JSON.parse(jsonMatch[0])
}

// Score a student's case answer
export async function scoreAnswer(apiKey, caseData, studentAnswer, lectureContent) {
  const system = `You are Dr. Manar Elshazly, grading a student's exam answer.
Be constructive, specific, and encouraging. Return JSON only.`

  const user = `Grade this student's answer to a case study question.

CASE STUDY:
Scenario: ${caseData.scenario}
Task: ${caseData.task}
Expected concepts: ${caseData.expectedConcepts.join(', ')}

STUDENT ANSWER:
${studentAnswer}

LECTURE CONTENT (for reference):
${lectureContent.substring(0, 2000)}

Grade on a scale of 0-10. Be fair but rigorous.

Return JSON ONLY:
{
  "score": 7,
  "correct": ["What the student got right — specific points"],
  "missing": ["What's missing or needs improvement — specific points"],
  "review": ["Key concepts to revisit from the lecture"],
  "feedback": "1-2 sentence overall constructive comment"
}`

  const text = await callGroq(apiKey, system, user, 800)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid response from AI')
  return JSON.parse(jsonMatch[0])
}

// Validate a TicTacToe answer
export async function validateAnswer(apiKey, term, definition, studentAnswer) {
  const system = `You are a strict but fair NLP grader. Return JSON only.`
  const user = `The correct term is: "${term}"
The definition shown was: "${definition}"
The student answered: "${studentAnswer}"

Is the student's answer correct? Accept minor spelling variations, abbreviations, and partial matches if the core term is clearly identified.

Return JSON ONLY:
{"correct": true, "feedback": "Brief explanation"}`

  const text = await callGroq(apiKey, system, user, 100)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return { correct: false, feedback: 'Could not validate' }
  return JSON.parse(jsonMatch[0])
}
