import { useState } from 'react'
import { initialWords } from './data/initialWords'
import FlashCard from './components/FlashCard'
import './App.css'

const App = () => {
  const [words] = useState(initialWords)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState({})

  const handleResponse = (wordId, value, updateOnly = false) => {
    setResponses(prev => ({ ...prev, [wordId]: value }))
    if (!updateOnly && currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const visibleCards = words.slice(
    Math.max(0, currentIndex - 4),
    currentIndex + 1
  )

  return (
    <div className="app">
      <div className="cards-container">
        {visibleCards.map((word, idx) => (
          <FlashCard
            key={word.id}
            word={word}
            isActive={idx === visibleCards.length - 1}
            response={responses[word.id]}
            onResponse={handleResponse}
          />
        ))}
      </div>
    </div>
  )
}

export default App 