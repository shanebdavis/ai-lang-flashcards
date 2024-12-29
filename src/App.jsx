import { useState, useEffect } from 'react'
import PracticeFlashCards from './components/PracticeFlashCards'
import LevelSelect from './components/LevelSelect'
import loadWords from './data/loadWords'
import './App.css'

const WORDS_PER_SESSION = 25

const selectRandomWords = words => 
  [...words]
    .sort(() => Math.random() - 0.5)
    .slice(0, WORDS_PER_SESSION)

const App = () => {
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [words, setWords] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedLevel) {
      setLoading(true)
      loadWords(selectedLevel)
        .then(loadedWords => {
          setWords(selectRandomWords(loadedWords))
          setLoading(false)
        })
        .catch(error => {
          console.error('Failed to load words:', error)
          setLoading(false)
          setSelectedLevel(null)
        })
    } else {
      setWords(null)
    }
  }, [selectedLevel])

  return (
    <div className="app">
      {selectedLevel ? (
        loading ? (
          <div className="loading">Loading words...</div>
        ) : (
          <PracticeFlashCards 
            words={words} 
            onBack={() => setSelectedLevel(null)} 
          />
        )
      ) : (
        <LevelSelect onSelect={setSelectedLevel} />
      )}
    </div>
  )
}

export default App 