const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const LevelSelect = ({ onSelect }) => (
  <div className="level-select">
    <h1>Choose Your Level</h1>
    <div className="level-buttons">
      {levels.map(level => (
        <button 
          key={level}
          className="level-button"
          onClick={() => onSelect(level)}
        >
          {level}
        </button>
      ))}
    </div>
  </div>
)

export default LevelSelect 