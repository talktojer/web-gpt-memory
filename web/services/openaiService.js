const openaiService = {
    async createUserEmbedding(openai, token, content) {
      const userEmbedsApiCallData = {
        model: 'text-embedding-ada-002',
        input: [content],
        options: {
          return_embeddings: true
        },
        user: token
      };
      const userEmbedsResponse = await openai.createEmbedding(userEmbedsApiCallData);
      return userEmbedsResponse.data.data[0].embedding;
    },
    async createChatCompletion(openai, normalizedContext) {
      const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: normalizedContext,
      });
      return result.data.choices[0].message ? result.data.choices[0].message.content.trim() : "";
    },
    async createAssistantEmbedding(openai, token, content) {
      const assistantEmbedsApiCallData = {
        model: 'text-embedding-ada-002',
        input: [content],
        options: {
          return_embeddings: true
        },
        user: token
      };
      const assistantEmbedsResponse = await openai.createEmbedding(assistantEmbedsApiCallData);
      return assistantEmbedsResponse.data.data[0].embedding;
    }
  };
  
  module.exports = openaiService;
  