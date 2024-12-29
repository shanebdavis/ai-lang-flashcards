import Papa from 'papaparse'

const loadWords = async (level) => {
  const response = await fetch(`/words-${level}.csv`)
  const csvText = await response.text()

  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        const words = results.data
          .filter(row => row.word && row.english) // Skip empty rows
          .map((row, index) => ({
            id: `${level}-${index}`,
            spanish: row.word,
            english: row.english,
            level: row.languageLevel
          }))
        resolve(words)
      }
    })
  })
}

export default loadWords 