import { useState, useEffect } from 'react'
import PracticeFlashCards from './components/PracticeFlashCards'
import LevelSelect from './components/LevelSelect'
import loadWords from './data/loadWords'
import './App.css'

const WORDS_PER_SESSION = 10

const randomSort = array => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

const selectRandomWords = words =>
  randomSort(words).slice(0, WORDS_PER_SESSION)

const App = () => {
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [words, setWords] = useState(null)
  const [loading, setLoading] = useState(false)

  const reshuffleAll = () =>
    setWords(words => randomSort(words))

  const reshuffleMissed = (missedWords) =>
    setWords(randomSort(missedWords))

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
            reshuffleAll={reshuffleAll}
            reshuffleMissed={reshuffleMissed}
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