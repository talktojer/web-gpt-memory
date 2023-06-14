const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const mathjs = require('mathjs');

async function loadEmbeddings(token) {
    const embeddingsDir = path.join(__dirname, '../embeddings');
    const assistantEmbeddingFiles = await fs.promises.readdir(embeddingsDir)
        .then(files => files.filter(file => file.startsWith(`log_${token}`) && file.endsWith('_a.json')));
    const userEmbeddingFiles = await fs.promises.readdir(embeddingsDir)
        .then(files => files.filter(file => file.startsWith(`log_${token}`) && file.endsWith('_u.json')));

    let embeddings = [];

    for (const file of assistantEmbeddingFiles) {
        const filePath = path.join(embeddingsDir, file);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const jsonContent = JSON.parse(content);
        embeddings.push(jsonContent.vector); // Specifically extracting vectors
    }

    for (const file of userEmbeddingFiles) {
        const filePath = path.join(embeddingsDir, file);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const jsonContent = JSON.parse(content);
        embeddings.push(jsonContent.vector); // Specifically extracting vectors
    }

    return embeddings;
}


function normalizeVector(vector) {
  let magnitude = mathjs.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

function summarizeMemory(embeddings) {
    // If embeddings is empty, return an empty array
    if (!embeddings.length) {
      return [];
    }
  
    let avgEmbedding = mathjs.mean(embeddings, 0);
    let memorySummary = { role: 'system', content: '', vector: avgEmbedding, timestamp: Date.now() };
    
    return [memorySummary];
  }
  

module.exports = {
  loadEmbeddings,
  normalizeVector,
  summarizeMemory
};
