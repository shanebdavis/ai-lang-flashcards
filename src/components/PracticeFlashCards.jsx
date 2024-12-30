import { useState, useEffect } from 'react'
import { FlashCard } from './FlashCard'
import { ScoreCard } from './ScoreCard'

export const PracticeFlashCards = ({ words, reshuffleAll, reshuffleMissed, onBack }) => {
  const [responses, setResponses] = useState({})
  const [visibleCards, setVisibleCards] = useState(words ? [words[0]] : [])

  useEffect(() => {
    setResponses({})
    setVisibleCards(words ? [words[0]] : [])
  }, [words])

  const addNewCard = () =>
    setVisibleCards(prev => [...prev, words[prev.length]])

  const handleResponse = (wordId, value, updateOnly = false) => {
    setResponses(prev => ({ ...prev, [wordId]: value }))

    if (!updateOnly && visibleCards.length < words.length) {
      addNewCard()
    }
  }

  // Don't render anything if we don't have words
  const responseCount = Object.keys(responses).length
  if (!words?.length) return null

  const done = responseCount === words.length

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
                isActive={responses[word.id] === undefined}
                response={responses[word.id]}
                onResponse={handleResponse}
                cardNumber={index + 1}
                totalCards={words.length}
                style={{
                  bottom: `${250 * invertIndex - 20 + (done ? 250 : 0)}px`
                }}
              />
            )
          })}
          {done && <ScoreCard
            stats={{
              correct: Object.values(responses).filter(Boolean).length,
              total: words.length,
              missed: words.length - Object.values(responses).filter(Boolean).length
            }}
            onReshuffle={reshuffleAll}
            onPracticeMissed={() => reshuffleMissed(words.filter(word => !responses[word.id]))}
          />}
        </div>
      </div>
    </>
  )
}
