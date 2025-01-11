#!/usr/bin/env node

import fs from 'fs';
import OpenAi from 'openai';
import ArtStandardLib from 'art-standard-lib'
const { log } = ArtStandardLib

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

const outputFields = ["gradeLevel", "cefrLevel", "countryInUsage"];
const inputFile = 'dictionary.csv';
const outputFile = 'dictionary-enhanced.csv';
const BATCH_SIZE = 100;

const MODEL = 'gpt-4o-mini';
const PRICE_PER_INPUT_TOKEN = 0.15 / 1000000;
const PRICE_PER_OUTPUT_TOKEN = 0.075 / 1000000;
let totalCost = 0;

// Write header row first
const header = ['Spanish Word', 'Translation', 'Gender', 'Part-of-Speech', ...outputFields].join(',');
fs.writeFileSync(outputFile, header + '\n');

const getResponse = async (word, translation, gender, pos) => {
  const prompt = `
I'm going to provide you with a Spanish word and its English translation. Help categorize it for a language learning app. Your output will be JSON starting with an open curly brace:

{
"gradeLevel": number, // 0 for pre-school, 1-12 for respective grades. Use 13 for college level.
"cefrLevel": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
"countryInUsage": list one or more countries where this word is commonly used. e.g. Spain, Mexico, Chile, Argentina, etc.
}

Base your assessment on:
- Word complexity
- How early children typically learn this word
- Frequency of use in everyday language
- CEFR guidelines for vocabulary progression

Word info format: Spanish Word,Translation,Gender,Part-of-Speech
Word info: ${word},${translation},${gender},${pos}
English translation: ${translation}`

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'system', content: prompt }],
    response_format: { type: 'json_object' },
  });

  // Track costs
  const inputTokens = response.usage.prompt_tokens;
  const outputTokens = response.usage.completion_tokens;
  const cost = (inputTokens * PRICE_PER_INPUT_TOKEN) + (outputTokens * PRICE_PER_OUTPUT_TOKEN);
  totalCost += cost;

  return JSON.parse(response.choices[0].message.content);
}

const getResponseWithRetry = async (word, translation, gender, pos, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await getResponse(word, translation, gender, pos);
    } catch (error) {
      if (attempt === retries) throw error;
      console.error(`Attempt ${attempt} failed for word ${word}:`, error);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
}

const escapeCsvField = field => {
  if (field == null) return ''
  const str = String(field)
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

const processBatch = async batch => Promise.all(
  batch.map(async line => {
    try {
      const [spanishWord, translation, gender, pos] = line.map(field =>
        field?.trim().replace(/^["']|["']$/g, '')
      )

      // Skip if empty or contains "given name" (case insensitive)
      if (!spanishWord || !translation || /given name/i.test(translation)) {
        console.error('Skipping line:', line)
        return null
      }

      let parsedResponse = {}
      try {
        parsedResponse = await getResponseWithRetry(spanishWord, translation, gender, pos)
        // console.log('Success:', spanishWord, parsedResponse)
      } catch (error) {
        console.error('OpenAI Error for word:', spanishWord, error)
        outputFields.forEach(field => parsedResponse[field] = 'ERROR')
      }

      return [
        spanishWord,
        translation,
        gender || '',
        pos || '',
        ...outputFields.map(field => parsedResponse[field])
      ].map(escapeCsvField).join(',') + '\n'
    } catch (error) {
      console.error('Processing error:', line, error)
      return null
    }
  })
)

const processFile = async () => {
  const lines = await fs.promises.readFile(inputFile, 'utf8')
  const allLines = lines.split('\n')
    .filter(line => line.trim())
    .map(line => line.split(',').map(field => field.trim()))

  const totalLines = allLines.length - 1
  let processedLines = 0
  const startTime = Date.now()

  // Skip header line
  const dataLines = allLines.slice(1)

  for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
    const batch = dataLines.slice(i, i + BATCH_SIZE)
    const results = await processBatch(batch)

    const validResults = results.filter(Boolean)
    if (validResults.length) {
      fs.appendFileSync(outputFile, validResults.join(''))
    }

    processedLines += batch.length
    const percentComplete = (processedLines / totalLines) * 100
    const elapsedMs = Date.now() - startTime
    const msPerLine = elapsedMs / processedLines
    const remainingLines = totalLines - processedLines
    const remainingMs = msPerLine * remainingLines
    const remainingMins = Math.ceil(remainingMs / 60000)
    const wordsPerDollar = totalCost > 0 ? (processedLines / totalCost).toFixed(1) : 'N/A'

    console.log(
      `Processed ${processedLines} of ${totalLines} ` +
      `(${percentComplete.toFixed(2)}%) - ` +
      `Est. ${remainingMins} minutes remaining (${msPerLine.toFixed(1)} ms/line) - ` +
      `Cost: $${totalCost.toFixed(4)} (${wordsPerDollar} words/$)`
    )
  }

  const totalMins = Math.ceil((Date.now() - startTime) / 60000)
  const finalWordsPerDollar = totalCost > 0 ? (processedLines / totalCost).toFixed(1) : 'N/A'
  console.log(`Processing complete in ${totalMins} minutes. ` +
    `Output written to ${outputFile}. ` +
    `Total cost: $${totalCost.toFixed(4)} (${finalWordsPerDollar} words/$)`)
}

processFile().catch(console.error)