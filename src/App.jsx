import { useState } from 'react'
import { initialWords } from './data/initialWords'
import FlashCard from './components/FlashCard'
import './App.css'

const App = () => {
  const [allWords] = useState(initialWords)
  const [responses, setResponses] = useState({})
  const [visibleCards, setVisibleCards] = useState([allWords[0]])
  const addNewCard = () => {
    setVisibleCards(prev => [...prev, allWords[prev.length]])
  }

  const handleResponse = (wordId, value, updateOnly = false) => {
    setResponses(prev => ({ ...prev, [wordId]: value }))
    
    if (!updateOnly && visibleCards.length < allWords.length) {
      addNewCard()
    }
  }

  return (
    <div className="app">
      <div className="cards-container">
        {visibleCards.map((word, index) => {
          const invertIndex = visibleCards.length - index - 1
          return (
            <FlashCard
              key={word.id}
              word={word}
              isActive={invertIndex === 0}
              response={responses[word.id]}
              onResponse={handleResponse}
            style={{
              bottom: `${250 * invertIndex - 20}px`
            }}
          />
        )})}
      </div>
    </div>
  )
}

export default App 