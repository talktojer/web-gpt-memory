const express = require('express');
const hat = require('hat');
const contextService = require('../services/contextService');
const embeddingsService = require('../services/embeddingsService');
const openaiService = require('../services/openaiService');
const path = require('path');
const fs = require('fs-extra');

// Maximum number of previous exchanges to include
const MAX_EXCHANGES = 30;

const router = express.Router();

module.exports = (openai) => {
  router.post('/', async (req, res) => {
    const { token, message } = req.body;

    const sessionPath = path.join(__dirname, '../sessions', `${token}.json`);
    const embeddingsDir = path.join(__dirname, '../embeddings');

    try {
      let context = await contextService.loadContext(token);
      let currentTime = Date.now();

      let userMessage = {
        role: 'user',
        content: message,
        timestamp: currentTime,
        uuid: hat(),
        vector: [],
        timestring: new Date().toString()
      };
      context.push({role: userMessage.role, content: userMessage.content});

      // Get embeddings for user message
      userMessage.vector = await openaiService.createUserEmbedding(openai, token, userMessage.content);

      let contextEmbeddings = await embeddingsService.loadEmbeddings(token);

      let memorySummary = embeddingsService.summarizeMemory(contextEmbeddings);

      let extendedContext = context.concat(memorySummary);

      let normalizedContext = extendedContext.map(entry => {
        if (entry.vector) {
          entry.vector = embeddingsService.normalizeVector(entry.vector);
        }
        // Exclude vectors from the data sent to OpenAI
        return { role: entry.role, content: entry.content };
      });

      // Limit the context to the maximum number of exchanges
      normalizedContext = normalizedContext.slice(-MAX_EXCHANGES);

      const assistantMessage = await openaiService.createChatCompletion(openai, normalizedContext);

      let assistantMessageObj = {
        role: 'assistant',
        content: assistantMessage,
        timestamp: currentTime,
        uuid: hat(),
        vector: [],
        timestring: new Date().toString()
      };

      context.push({role: assistantMessageObj.role, content: assistantMessageObj.content});

      // Get embeddings for assistant message
      assistantMessageObj.vector = await openaiService.createAssistantEmbedding(openai, token, assistantMessage);

      const timestamp = Math.floor(new Date().getTime() / 1000);

      const assistantEmbedsPath = path.join(embeddingsDir, `log_${token}-${timestamp}_a.json`);

      const userEmbedsPath = path.join(embeddingsDir, `log_${token}-${timestamp}_u.json`);

      await fs.promises.writeFile(assistantEmbedsPath, JSON.stringify(assistantMessageObj, null, 2), 'utf-8');
      await fs.promises.writeFile(userEmbedsPath, JSON.stringify(userMessage, null, 2), 'utf-8');

      await fs.promises.writeFile(sessionPath, JSON.stringify(context), 'utf-8');

      res.json({ assistantMessage });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
