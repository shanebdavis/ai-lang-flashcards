import { useState } from 'react'
import FlashCard from './FlashCard'

const PracticeFlashCards = ({ words, onBack }) => {
  const [responses, setResponses] = useState({})
  const [visibleCards, setVisibleCards] = useState(words ? [words[0]] : [])

  const addNewCard = () => 
    setVisibleCards(prev => [...prev, words[prev.length]])

  const handleResponse = (wordId, value, updateOnly = false) => {
    setResponses(prev => ({ ...prev, [wordId]: value }))
    
    if (!updateOnly && visibleCards.length < words.length) {
      addNewCard()
    }
  }

  // Don't render anything if we don't have words
  if (!words?.length) return null

  return (
    <>
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>
      <div className="practice-flash-cards">
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
                cardNumber={index + 1}
                totalCards={words.length}
                style={{
                  bottom: `${250 * invertIndex - 20}px`
                }}
              />
            )
          })}
        </div>
      </div>
    </>
  )
}

export default PracticeFlashCards 