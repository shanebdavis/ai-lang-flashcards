import { useState } from 'react'
import { initialWords } from './data/initialWords'
import PracticeFlashCards from './components/PracticeFlashCards'
import './App.css'

const App = () => {
  const [allWords] = useState(initialWords)

  return (
    <div className="app">
      <PracticeFlashCards words={allWords} />
    </div>
  )
}

export default App 