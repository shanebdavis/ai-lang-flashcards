
const typeToShort = {
  'noun': 'n',
  'verb': 'v',
  'adjective': 'adj',
  'adverb': 'adv',
}

export const FlashCard = ({ word, isActive, response, onResponse, style, cardNumber, totalCards }) => {
  const handleResponse = value => {
    if (isActive) {
      onResponse(word.id, value)
    } else {
      onResponse(word.id, value, true)
    }
  }

  return (
    <div
      className={`flash-card ${isActive ? 'active' : ''}`}
      style={style}
    >
      <div className="card-counter">{cardNumber}/{totalCards}</div>
      <h2>{word.spanish}</h2>
      <p className={`english ${isActive ? 'hidden' : ''}`}>
        {word.english} ({typeToShort[word.type]}. {word.dictionaryForm})
      </p>
      <div className="response-buttons">
        <button
          className={`response-button si ${response ? 'selected' : ''}`}
          onClick={() => handleResponse(true)}
        >
          Sí
        </button>
        <button
          className={`response-button no ${response === false ? 'selected' : ''}`}
          onClick={() => handleResponse(false)}
        >
          No
        </button>
      </div>
    </div>
  )
}
