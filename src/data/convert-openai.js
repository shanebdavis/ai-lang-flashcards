#!/usr/bin/env node

import fs from 'fs';
import OpenAi from 'openai';
import ArtStandardLib from 'art-standard-lib'
const { log } = ArtStandardLib

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

const outputFields = ["type", "gender", "dictionaryForm", "languageLevel", "english"];
const inputFile = 'words-ERROR.csv';
const outputFile = 'words-error-fixed.csv';
const BATCH_SIZE = 100;

// Write header row first
const header = ['word', 'frequency', ...outputFields].join(',');
fs.writeFileSync(outputFile, header + '\n');

const getResponse = async word => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: `
I'm going to provide you with a single Spanish word. The word will only contain lower case letters even if it should normally be capitalized. You are going to help categorize the word for us in a language learning app. Your output will be in JSON. The very first character of your output will be an open curly brace. Your output will be as follows:

{
"type": "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "proprer-noun" | "other",
"gender": "masculine" | "feminine" | "neuter" | "other",
"dictionaryForm": string // the dictionary form of the word. For verbs, this will be the infinitive form. For nouns, this will be the singular form. etc... If the word is missing an accent, you should add it for the dictionary form. For abreviations like "Sr." the dictionary form should be expanded to "Señor".
"languageLevel": "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "other",
"english": string // the english translation of the word
}

NOTE: The actual JSON output should include no extra characters or whitespace.

The word is: ${word}`
    }],
    response_format: { type: 'json_object' },
  });

  const jsonResponse = response.choices[0].message.content;
  return JSON.parse(jsonResponse);
}

const escapeCsvField = field => {
  if (field == null) return ''
  const str = String(field)
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

const processBatch = async batch => Promise.all(
  batch.map(async ([word, frequency]) => {
    let parsedResponse = {}
    try {
      parsedResponse = await getResponse(word)
    } catch (error) {
      outputFields.forEach(field => parsedResponse[field] = 'ERROR')
    }
    return [
      word,
      frequency,
      ...outputFields.map(field => parsedResponse[field])
    ].map(escapeCsvField).join(',') + '\n'
  })
)

const processFile = async () => {
  const lines = await fs.promises.readFile(inputFile, 'utf8')
  const allLines = lines.split('\n').filter(Boolean)
  const totalLines = allLines.length - 1 // -1 for header
  let processedLines = 0
  const startTime = Date.now()

  // Skip header line
  const dataLines = allLines.slice(1)

  // Process in batches
  for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
    const batchStartTime = Date.now()

    const batch = dataLines
      .slice(i, i + BATCH_SIZE)
      .map(line => line.split(','))

    const results = await processBatch(batch)
    fs.appendFileSync(outputFile, results.join(''))

    processedLines += batch.length
    const percentComplete = (processedLines / totalLines) * 100

    // Calculate time remaining
    const elapsedMs = Date.now() - startTime
    const msPerLine = elapsedMs / processedLines
    const remainingLines = totalLines - processedLines
    const remainingMs = msPerLine * remainingLines
    const remainingMins = Math.ceil(remainingMs / 60000)

    console.log(
      `Processed ${processedLines} of ${totalLines} ` +
      `(${percentComplete.toFixed(2)}%) - ` +
      `Est. ${remainingMins} minutes remaining (${msPerLine} ms/line)`
    )
  }

  const totalMins = Math.ceil((Date.now() - startTime) / 60000)
  console.log(`Processing complete in ${totalMins} minutes. Output written to ${outputFile}`)
}

processFile().catch(console.error)