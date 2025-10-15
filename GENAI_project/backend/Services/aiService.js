const promptManager = require('../utils/promptManager');
const geminiService = require('../Controller/geminiService');


function handleUnifiedChat(req, res) {
    const message = req.body.message;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    // Build prompt
    const prompt = promptManager.getUnifiedPrompt(message);

    // Get AI response (mock for now)
    geminiService.getGeminiResponse(prompt)
        .then(function (aiReply) {
            res.json({ reply: aiReply });
        })
        .catch(function (err) {
            console.error("AI Service Error:", err);
            res.status(500).json({ error: "Internal Server Error" });
        });
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

module.exports = { handleUnifiedChat, handleLawBotChat };
