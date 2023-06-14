const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const cors = require('cors');
require('dotenv').config();

const newSessionRouter = require('./routes/newSession');
const loadSessionRouter = require('./routes/loadSession');
const sendMessageRouter = require('./routes/sendMessage');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/new-session', newSessionRouter);
app.use('/load-session', loadSessionRouter);
app.use('/send-message', sendMessageRouter(openai));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
