import { useEffect } from 'react'
import { POS_TO_FULL_POS } from '../data/loadWords'

export const FlashCard = ({ word, isActive, response, onResponse, style, cardNumber, totalCards }) => {
  const handleResponse = value => {
    if (isActive) {
      onResponse(word.id, value)
    } else {
      onResponse(word.id, value, true)
    }
  }

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!isActive) return

      switch (event.key) {
        case 's':
        case 'ArrowLeft':
          handleResponse(true)
          break
        case 'n':
        case 'ArrowRight':
          handleResponse(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isActive, word.id])

  const fullType = POS_TO_FULL_POS[word.type?.toLowerCase()] || word.type || ''

  return (
    <div
      className={`flash-card ${isActive ? 'active' : ''}`}
      style={style}
    >
      <div className="card-counter">{cardNumber}/{totalCards}</div>
      <h2>{word.spanish}</h2>
      <p className={`english ${isActive ? 'hidden' : ''}`}>
        {word.english} {fullType && `(${fullType})`}
      </p>
      <div className="response-buttons">
        <button
          className={`response-button si ${response ? 'selected' : ''}`}
          onClick={() => handleResponse(true)}
        >
          Sí <span className="key-hint">(s ←)</span>
        </button>
        <button
          className={`response-button no ${response === false ? 'selected' : ''}`}
          onClick={() => handleResponse(false)}
        >
          No <span className="key-hint">(n →)</span>
        </button>
      </div>
    </div>
  )
}
