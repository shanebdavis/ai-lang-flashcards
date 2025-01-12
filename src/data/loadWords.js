import dictionaryEnhancedCsv from './dictionary-enhanced.csv?raw'

export const VALID_COUNTRIES = [
  'Mexico',
  'Colombia',
  'Spain',
  'Argentina',
  'Peru',
  'Venezuela',
  'Chile',
  'Ecuador',
  'Guatemala',
  'Cuba'
]

// Create a regex pattern for all valid countries
const COUNTRY_REGEX = new RegExp(VALID_COUNTRIES.join('|'), 'i')

export const POS_TO_FULL_POS = {
  'abbr': 'abbreviation',
  'adj': 'adjective',
  'adv': 'adverb',
  'art': 'article',
  'conj': 'conjunction',
  'contraction': 'contraction',
  'interj': 'interjection',
  'letter': 'letter',
  'noun': 'noun',
  'phrase': 'phrase',
  'prep': 'preposition',
  'prop': 'proper noun',
  'proverb': 'proverb',
  'v': 'verb',
  'vi': 'intransitive verb',
  'vp': 'pronominal verb',
  'vr': 'reflexive verb',
  'vt': 'transitive verb',
}

// Create a Set of valid POS tags for quick lookup
const VALID_POS = new Set(Object.keys(POS_TO_FULL_POS))

const VERB_SUBTYPES = new Set(['vi', 'vp', 'vr', 'vt', 'vit', 'vrr', 'vtr'])

const extractTags = line => {
  // First, handle the special case of quoted fields containing commas
  const fields = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField.trim())
      currentField = ''
    } else {
      currentField += char
    }
  }
  fields.push(currentField.trim())

  // Now we have properly split fields even with commas inside quotes
  const [spanish, english, gender, pos, gradeLevel, cefrLevel, countryInUsage] = fields

  // Clean up the countryInUsage field
  const cleanCountryUsage = countryInUsage
    ?.replace(/^"/, '') // Remove leading quote
    ?.replace(/"$/, '') // Remove trailing quote
    ?.toLowerCase()

  // Skip words that don't match any valid country
  if (!COUNTRY_REGEX.test(cleanCountryUsage)) {
    return null
  }

  const tags = new Set()

  // Extract part-of-speech tags and convert to full form immediately
  const posMatches = pos.match(/\{(\w+)\}/g) || []
  const validPosMatches = []

  posMatches.forEach(match => {
    const posTag = match.slice(1, -1)
    if (VALID_POS.has(posTag)) {
      const fullPosTag = POS_TO_FULL_POS[posTag]
      validPosMatches.push(fullPosTag)
      tags.add(fullPosTag)  // Add the full form to tags

      // If this is a verb subtype, also add the base 'verb' tag
      if (VERB_SUBTYPES.has(posTag)) {
        const verbTag = POS_TO_FULL_POS['v']
        validPosMatches.push(verbTag)
        tags.add(verbTag)
      }
    } else {
      console.warn(`Unknown POS tag "${posTag}" in word "${spanish}" (${english})`)
    }
  })

  if (validPosMatches.length === 0 && posMatches.length > 0) {
    console.warn(`No valid POS tags for word "${spanish}" (${english}). Found: ${posMatches.map(m => m.slice(1, -1)).join(', ')}`)
  }

  // Add grade level and CEFR level as tags
  if (gradeLevel && gradeLevel !== 'ERROR') tags.add(`grade-${gradeLevel}`)
  if (cefrLevel && cefrLevel !== 'ERROR') tags.add(cefrLevel)

  // Add normalized country tags - handle comma-separated list properly
  const countryMatches = VALID_COUNTRIES.filter(country => {
    const pattern = new RegExp(`\\b${country}\\b`, 'i')
    return pattern.test(cleanCountryUsage)
  })

  if (countryMatches.length === 0) {
    return null
  }

  countryMatches.forEach(country => tags.add(country))

  return {
    spanish,
    english,
    tags: Array.from(tags),
    rawPos: validPosMatches,  // Now contains full forms
    rawGradeLevel: gradeLevel,
    rawCefrLevel: cefrLevel,
    rawCountries: countryMatches
  }
}

const loadWords = async () => {
  const fileContent = dictionaryEnhancedCsv
  const lines = fileContent.split('\n').slice(1)
    .filter(line => line.trim())

  console.log('Total lines before processing:', lines.length)

  const uniqueSets = {
    partsOfSpeech: new Set(Object.values(POS_TO_FULL_POS)), // Use full forms
    gradeLevels: new Set(),
    cefrLevels: new Set(),
    countries: new Set(VALID_COUNTRIES)
  }

  const words = lines.map((line, index) => {
    const word = extractTags(line)
    if (!word) return null

    // No need to transform POS anymore since we're already using full forms
    if (word.rawGradeLevel && word.rawGradeLevel !== 'ERROR') {
      uniqueSets.gradeLevels.add(Number(word.rawGradeLevel))
    }
    if (word.rawCefrLevel && word.rawCefrLevel !== 'ERROR') {
      uniqueSets.cefrLevels.add(word.rawCefrLevel)
    }

    return {
      id: `word-${index}`,
      spanish: word.spanish,
      english: word.english,
      type: word.rawPos[0] || '', // Already in full form
      tags: word.tags
    }
  }).filter(Boolean)

  console.log('Words after filtering:', words.length)
  console.log('Sample of first few words:', words.slice(0, 5))
  const details = {
    partsOfSpeech: Array.from(uniqueSets.partsOfSpeech).sort(),
    gradeLevels: Array.from(uniqueSets.gradeLevels).sort((a, b) => a - b),
    cefrLevels: Array.from(uniqueSets.cefrLevels).sort(),
    countries: Array.from(uniqueSets.countries).sort()
  }
  console.log(details)

  return {
    words,
    partsOfSpeech: Array.from(uniqueSets.partsOfSpeech).sort(),
    gradeLevels: Array.from(uniqueSets.gradeLevels).sort((a, b) => a - b),
    cefrLevels: Array.from(uniqueSets.cefrLevels).sort(),
    countries: Array.from(uniqueSets.countries).sort()
  }
}

export { loadWords } 