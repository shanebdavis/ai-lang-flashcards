import { useState } from 'react'
import { initialWords } from './data/initialWords'
import PracticeFlashCards from './components/PracticeFlashCards'
import LevelSelect from './components/LevelSelect'
import './App.css'

const App = () => {
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [allWords] = useState(initialWords)

  return (
    <div className="app">
      {selectedLevel ? (
        <PracticeFlashCards 
          words={allWords} 
          onBack={() => setSelectedLevel(null)} 
        />
      ) : (
        <LevelSelect onSelect={setSelectedLevel} />
      )}
    </div>
  )
}

export default App 