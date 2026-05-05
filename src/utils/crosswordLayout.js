/**
 * Simple crossword layout generator.
 * Places words on a grid by finding letter intersections.
 */

export function buildCrossword(wordPairs) {
  // Normalize: uppercase, strip spaces
  const words = wordPairs.map((w, i) => ({
    ...w,
    clean: w.term.toUpperCase().replace(/[^A-Z]/g, ''),
    id: i,
  })).filter(w => w.clean.length >= 3)

  if (!words.length) return { placed: [], grid: {}, rows: 0, cols: 0 }

  // Sort longest first — better anchor words
  words.sort((a, b) => b.clean.length - a.clean.length)

  const grid = {} // "r,c" -> letter
  const placed = [] // {word, row, col, dir, clue, number}

  const has = (r, c) => `${r},${c}` in grid
  const get = (r, c) => grid[`${r},${c}`]
  const set = (r, c, letter) => { grid[`${r},${c}`] = letter }

  function canPlace(word, r, c, dir) {
    const dr = dir === 'down' ? 1 : 0
    const dc = dir === 'across' ? 1 : 0
    // Cell immediately before word must be empty
    if (has(r - dr, c - dc)) return false
    // Cell immediately after word must be empty
    if (has(r + dr * word.length, c + dc * word.length)) return false

    for (let i = 0; i < word.length; i++) {
      const cr = r + dr * i
      const cc = c + dc * i
      if (has(cr, cc)) {
        if (get(cr, cc) !== word[i]) return false // letter conflict
      } else {
        // Make sure perpendicular neighbors are empty (would create unintended words)
        if (dir === 'across') {
          if (has(cr - 1, cc) || has(cr + 1, cc)) return false
        } else {
          if (has(cr, cc - 1) || has(cr, cc + 1)) return false
        }
      }
    }
    return true
  }

  function doPlace(wordObj, r, c, dir) {
    const dr = dir === 'down' ? 1 : 0
    const dc = dir === 'across' ? 1 : 0
    for (let i = 0; i < wordObj.clean.length; i++) {
      set(r + dr * i, c + dc * i, wordObj.clean[i])
    }
    placed.push({ ...wordObj, row: r, col: c, dir, number: 0 })
  }

  // Place first word horizontally at origin
  doPlace(words[0], 0, 0, 'across')

  // Try to place each remaining word
  for (let wi = 1; wi < words.length; wi++) {
    const word = words[wi]
    let best = null
    let bestIntersections = 0

    for (const pw of placed) {
      const dir = pw.dir === 'across' ? 'down' : 'across'
      const dr = pw.dir === 'down' ? 1 : 0
      const dc = pw.dir === 'across' ? 1 : 0 // perpendicular new word direction helpers
      const ndr = dir === 'down' ? 1 : 0
      const ndc = dir === 'across' ? 1 : 0

      // Find every letter match between placed word and new word
      for (let pi = 0; pi < pw.clean.length; pi++) {
        for (let ni = 0; ni < word.clean.length; ni++) {
          if (pw.clean[pi] !== word.clean[ni]) continue

          // The intersection point in the grid
          const intR = pw.row + dr * pi
          const intC = pw.col + dc * pi
          // New word starts at:
          const startR = intR - ndr * ni
          const startC = intC - ndc * ni

          if (!canPlace(word.clean, startR, startC, dir)) continue

          // Score: count how many cells are already occupied (more intersections = better)
          let intersections = 0
          for (let k = 0; k < word.clean.length; k++) {
            if (has(startR + ndr * k, startC + ndc * k)) intersections++
          }
          if (intersections > bestIntersections || best === null) {
            bestIntersections = intersections
            best = { r: startR, c: startC, dir }
          }
        }
      }
    }

    if (best) doPlace(word, best.r, best.c, best.dir)
    // If no placement found, word is skipped (crossword might have < 12 words)
  }

  // Normalize coordinates so min row/col = 0
  if (!placed.length) return { placed: [], grid: {}, rows: 0, cols: 0 }

  const rs = Object.keys(grid).map(k => +k.split(',')[0])
  const cs = Object.keys(grid).map(k => +k.split(',')[1])
  const minR = Math.min(...rs), minC = Math.min(...cs)
  const maxR = Math.max(...rs), maxC = Math.max(...cs)

  const normGrid = {}
  for (const [key, letter] of Object.entries(grid)) {
    const [r, c] = key.split(',').map(Number)
    normGrid[`${r - minR},${c - minC}`] = letter
  }

  const normPlaced = placed.map(p => ({ ...p, row: p.row - minR, col: p.col - minC }))

  // Assign numbers top-to-bottom, left-to-right
  const sorted = [...normPlaced].sort((a, b) =>
    a.row !== b.row ? a.row - b.row : a.col - b.col
  )
  sorted.forEach((p, i) => { p.number = i + 1 })
  normPlaced.forEach(p => {
    const m = sorted.find(s => s.id === p.id)
    if (m) p.number = m.number
  })

  return { placed: normPlaced, grid: normGrid, rows: maxR - minR + 1, cols: maxC - minC + 1 }
}
