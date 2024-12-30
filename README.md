# AI Language Flashcards (ALF)

Goals

- Learn language through immersion
- Use flashcards to drill in and focus on what you don't know until you know it
- Use AI to make the flashcards interesting and engaging
- Track your progress

# Motivation

I love DuoLingo, but why does every "card" have to be a test? Further, why do I need to switch between Spanish and English every card. I want to learn the same way kids do - by exposure. Where a DuoLingo lession is about 10 cards, I think I can make a compelling flashcard app that helps you study about 100 cards (words) with about the same amount of effort. Further, I have a guess that with AI we might be able to make the flashcards more interesting and engaging.

# Spanish Data

I'm struggling to get good data for Spanish words. What I want is every Spanish word in every conguation organized by grade level.

Currently I'm working with data from [FrequencyWords](https://github.com/hermitdave/FrequencyWords/tree/master/content/2018/es), but it's kind-of a mess. It contains a lot of English words and propery names. Still, ChatGPT is helping me clean it up.

- [words-all.csv](src/data/words-all.csv)
- Processed with ChatGPT: [convert-openai.js](src/data/convert-openai.js)
