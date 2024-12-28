const FlashCard = ({ word, isActive, response, onResponse }) => {
  const handleResponse = value => {
    if (isActive) {
      onResponse(word.id, value)
    } else {
      onResponse(word.id, value, true)
    }
  }

  return (
    <div className={`flash-card ${isActive ? 'active' : ''}`}>
      <h2>{word.spanish}</h2>
      {!isActive && <p className="english">{word.english}</p>}
      <div className="response-buttons">
        <button 
          className={`response-button si ${response === true ? 'selected' : ''}`}
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

export default FlashCard 