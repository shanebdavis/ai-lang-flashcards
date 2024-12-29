import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

// Read and parse the input file
const input = fs.readFileSync('words-all.csv', 'utf8')
const records = parse(input, {
  columns: true,
  skip_empty_lines: true
})

// Group records by category
const properNouns = []
const englishWords = []
const errorWords = []
const byLevel = {
  A1: [],
  A2: [],
  B1: [],
  B2: [],
  C1: [],
  C2: [],
  other: []
}

// Process each record
records.forEach(record => {
  if (record.type === 'ERROR') {
    errorWords.push(record)
  } else if (record.type === 'proper-noun') {
    properNouns.push(record)
  } else if (record.word.toLowerCase() === record.english.toLowerCase()) {
    englishWords.push(record)
  } else {
    const targetLevel = record.languageLevel in byLevel ? record.languageLevel : 'other'
    byLevel[targetLevel].push(record)
  }
})

// Write output files with headers
const writeCSV = (filename, records) => {
  if (records.length > 0) {
    const csv = stringify(records, {
      header: true,
      columns: ['word', 'frequency', 'type', 'gender', 'dictionaryForm', 'languageLevel', 'english']
    })
    fs.writeFileSync(filename, csv)
  }
}

writeCSV('words-proper-nouns.csv', properNouns)
writeCSV('words-english.csv', englishWords)
writeCSV('words-ERROR.csv', errorWords)

Object.entries(byLevel).forEach(([level, records]) => {
  if (records.length > 0) {
    writeCSV(`words-${level}.csv`, records)
  }
}) 