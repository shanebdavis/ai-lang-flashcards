import { useState } from 'react'
import FlashCard from './FlashCard'

const PracticeFlashCards = ({ words }) => {
  const [responses, setResponses] = useState({})
  const [visibleCards, setVisibleCards] = useState([words[0]])

  const addNewCard = () => 
    setVisibleCards(prev => [...prev, words[prev.length]])

  const handleResponse = (wordId, value, updateOnly = false) => {
    setResponses(prev => ({ ...prev, [wordId]: value }))
    
    if (!updateOnly && visibleCards.length < words.length) {
      addNewCard()
    }
  }

  return (
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
        )
      })}
    </div>
  )
}

export default PracticeFlashCards 