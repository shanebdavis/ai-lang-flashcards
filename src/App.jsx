import { useState, useEffect } from 'react'
import { PracticeFlashCards } from './components/PracticeFlashCards'
import { TagSelector } from './components/TagSelector'
import { loadWords, VALID_COUNTRIES } from './data/loadWords'
import './App.css'

const SESSION_SIZES = [
  { words: 10, label: 'Quick Practice' },
  { words: 25, label: 'Regular Session' },
  { words: 100, label: 'Extended Practice' }
]

const randomSort = array => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

const App = () => {
  const [allWords, setAllWords] = useState([])
  const [selectedTags, setSelectedTags] = useState(new Set())
  const [metadata, setMetadata] = useState({
    partsOfSpeech: [],
    gradeLevels: [],
    cefrLevels: [],
    countries: []
  })
  const [loading, setLoading] = useState(true)
  const [sessionWords, setSessionWords] = useState(null)

  useEffect(() => {
    loadWords()
      .then(data => {
        setAllWords(data.words)
        setMetadata({
          partsOfSpeech: data.partsOfSpeech,
          gradeLevels: data.gradeLevels,
          cefrLevels: data.cefrLevels,
          countries: data.countries
        })
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load words:', error)
        setLoading(false)
      })
  }, [])

  const handleTagToggle = tag => {
    const newTags = new Set(selectedTags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    setSelectedTags(newTags)
  }

  // Split selected tags by category
  const getTagsByCategory = () => {
    const categories = {
      cefrLevels: new Set(),
      gradeLevels: new Set(),
      partsOfSpeech: new Set(),
      countries: new Set()
    }

    Array.from(selectedTags).forEach(tag => {
      if (tag.startsWith('grade-')) {
        categories.gradeLevels.add(tag)
      } else if (VALID_COUNTRIES.includes(tag)) {
        categories.countries.add(tag)
      } else if (tag.match(/^[ABC][12]$/)) {
        categories.cefrLevels.add(tag)
      } else {
        categories.partsOfSpeech.add(tag)
      }
    })

    return categories
  }

  const getMatchingWords = () => {
    if (selectedTags.size === 0) return allWords

    const categories = getTagsByCategory()
    console.log('Categories:', categories)

    const filtered = allWords.filter(word => {
      // For each category with selected tags, at least one tag must match (OR)
      // All categories with selected tags must have a match (AND)
      return (
        // If category has no selected tags, return true (no filtering)
        // If category has selected tags, at least one must match
        (categories.cefrLevels.size === 0 ||
          Array.from(categories.cefrLevels).some(tag => word.tags.includes(tag))) &&
        (categories.gradeLevels.size === 0 ||
          Array.from(categories.gradeLevels).some(tag => word.tags.includes(tag))) &&
        (categories.partsOfSpeech.size === 0 ||
          Array.from(categories.partsOfSpeech).some(tag => word.tags.includes(tag))) &&
        (categories.countries.size === 0 ||
          Array.from(categories.countries).some(tag => word.tags.includes(tag)))
      )
    })

    // Get 3 random examples
    const examples = [...filtered]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => `${w.spanish} (${w.english})`)

    console.log('Total words:', allWords.length)
    console.log('Filtered words count:', filtered.length)
    console.log('Random examples:', examples.join(', '))

    return filtered
  }

  const startSession = (requestedCount) => {
    const matchingWords = getMatchingWords()
    // Use all matching words if we don't have enough
    const actualCount = Math.min(requestedCount, matchingWords.length)
    setSessionWords(randomSort(matchingWords).slice(0, actualCount))
  }

  const endSession = () => {
    setSessionWords(null)
  }

  if (loading) {
    return <div className="loading">Loading words...</div>
  }

  if (sessionWords) {
    return (
      <PracticeFlashCards
        words={sessionWords}
        onBack={endSession}
        reshuffleAll={() => setSessionWords(randomSort(sessionWords))}
        reshuffleMissed={missedWords => setSessionWords(randomSort(missedWords))}
      />
    )
  }

  const matchingWords = getMatchingWords()

  return (
    <div className="app">
      <h1>Spanish Flash Cards</h1>

      <div className="tag-selectors">
        <TagSelector
          title="CEFR Level"
          tags={metadata.cefrLevels}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />
        <TagSelector
          title="Grade Level"
          tags={metadata.gradeLevels.map(n => `grade-${n}`)}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />
        <TagSelector
          title="Part of Speech"
          tags={metadata.partsOfSpeech}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />
        <TagSelector
          title="Countries"
          tags={metadata.countries}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />
      </div>

      <div className="stats">
        {matchingWords.length} words match selected tags
        ({selectedTags.size ? Array.from(selectedTags).join(', ') : 'no tags selected'})
        {matchingWords.length > 0 && (
          <div className="examples">
            Examples: {[...matchingWords]
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map(w => w.spanish)
              .join(', ')
            }
          </div>
        )}
      </div>

      {matchingWords.length > 0 && (
        <div className="session-buttons">
          {SESSION_SIZES.map(({ words: requestedCount, label }) => {
            const actualCount = Math.min(requestedCount, matchingWords.length)
            return (
              <button
                key={requestedCount}
                className="start-session-button"
                onClick={() => startSession(requestedCount)}
              >
                {label}
                <span className="word-count">
                  ({actualCount} word{actualCount !== 1 ? 's' : ''})
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { App }
