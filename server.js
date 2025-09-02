const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

// अपनी API Key को यहाँ डालें
const OPENAI_API_KEY = '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';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// यह वह एंडपॉइंट है जिसे आपकी वेबसाइट कॉल करेगी
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const completion = await openai.createCompletion({
            model: "text-davinci-003", // आप यहां कोई भी मॉडल चुन सकते हैं
            prompt: prompt,
            max_tokens: 150,
        });

        res.json({ text: completion.data.choices[0].text });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ error: 'OpenAI API से कनेक्ट करने में समस्या हुई।' });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
