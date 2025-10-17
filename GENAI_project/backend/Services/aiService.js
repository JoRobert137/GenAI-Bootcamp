const promptManager = require('../utils/promptManager');
const geminiService = require('../Controller/geminiService');


async function handleUnifiedChat(req, res) {
    try {
        const body = req.body || {};
        const message = body.message;
        if (!message) return res.status(400).json({ error: "Message is required" });

        const prompt = promptManager.getUnifiedPrompt(message);
        const aiReply = await geminiService.getGeminiResponse(prompt);
        res.json({ reply: aiReply });
    } catch (err) {
        console.error("AI Service Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

function handleLawBotChat(req, res) {
    const message = req.body.message;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const prompt = promptManager.getLawBotPrompt(message);

    geminiService.getGeminiResponse(prompt)
        .then(aiReply => res.json({ reply: aiReply }))
        .catch(err => {
            console.error("LawBot Error:", err);
            res.status(500).json({ error: "Internal Server Error" });
        });
}

function handleTalk2GovChat(req, res) {
    const message = req.body.message;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const prompt = promptManager.getTalk2GovPrompt(message);
    geminiService.getGeminiResponse(prompt)
        .then(aiReply => res.json({ reply: aiReply }))
        .catch(err => {
            console.error("Talk2Gov Error:", err);
            res.status(500).json({ error: "Internal Server Error" });
        });
}

async function handleLocalLanguageChat(req, res) {
    try {
        const { message, language } = req.body;

        if (!message) return res.status(400).json({ error: "Message is required" });
        if (!language) return res.status(400).json({ error: "Target language is required" });

        // Create prompt with target language
        const prompt = promptManager.getLocalLanguagePrompt(message, language);

        // Get plain translated text
        const translation = await geminiService.getTranslation(prompt);

        // Return only the translated text
        res.json({ reply: translation });
    } catch (err) {
        console.error("Local Language Assistant Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { handleUnifiedChat, handleLawBotChat,handleTalk2GovChat,handleLocalLanguageChat };
