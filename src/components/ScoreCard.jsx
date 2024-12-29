const ScoreCard = ({ stats, onReshuffle, onPracticeMissed }) => {
  const percentKnown = Math.round((stats.correct / stats.total) * 100)

  return (
    <div className="flash-card score-card active">
      <div className="score-stats">
        <div className="score-percent">Score: {percentKnown}%</div>
        <div className="score-detail">
          {stats.correct} / {stats.total} words known
        </div>
      </div>
      <div className="response-buttons">
        <button
          className="response-button reshuffle"
          onClick={onReshuffle}
        >
          Reshuffle All
        </button>
        {stats.missed > 0 && (
          <button
            className="response-button practice-missed"
            onClick={onPracticeMissed}
          >
            Only Missed
          </button>
        )}
      </div>
    </div>
  )
}

export default ScoreCard 