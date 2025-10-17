const axios = require('axios');
require('dotenv').config();

const MODEL_NAME = process.env.MODEL_NAME; 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

const generateResponse = async (prompt, temperature = 0.3, top_p = 0.7) => {
    try {
        const response = await axios.post(
            GEMINI_API_URL,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: temperature,  // controls randomness
                    topP: top_p,               // nucleus sampling
                    // maxOutputTokens: 3000    // optional, adjust if needed
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY
                }
            }
        );

        // Safe extraction
        // const candidates = response.data?.candidates;
        // const text = candidates?.[0]?.content?.[0]?.text || "";

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        // const text = response.data?.candidates?.[0]?.output_text?.trim() || "";

        

        if (!text) {
            console.warn("Gemini returned empty text. Returning default response.");
            return {
                summary: "No response generated.",
                sections: []
            };
        }

        // --- STRUCTURING LOGIC ---
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const structured = { summary: '', sections: [] };

        let currentSection = null;
        let currentSubheading = null;

        lines.forEach(line => {
            line = line.trim();

            // Detect main section titles (bolded or ending with colon)
            const sectionMatch = line.match(/^\*\*(.+?)\*\*$/) || line.match(/^(.+?):$/);
            if (sectionMatch) {
                if (currentSection) structured.sections.push(currentSection);
                currentSection = { title: sectionMatch[1].trim(), content: [] };
                currentSubheading = null;
                return;
            }

            // Detect subheadings like "**What it is:**" or "**Eligibility:**"
            const subheadingMatch = line.match(/^\*\*(.+?)\*\*:?\s*(.*)/);
            if (subheadingMatch) {
                const [, subheading, content] = subheadingMatch;
                currentSubheading = { subheading: subheading.trim(), text: content.trim() || '' };
                currentSection?.content.push(currentSubheading);
                return;
            }

            // Regular content lines
            if (line.startsWith('- ') || line.startsWith('* ')) {
                // Bullet points
                const bulletText = line.replace(/^(-|\*)\s+/, '').trim();
                if (currentSubheading) {
                    currentSubheading.text += `\n- ${bulletText}`;
                } else {
                    currentSection?.content.push({ subheading: null, text: `- ${bulletText}` });
                }
            } else {
                // Plain text lines
                if (currentSubheading) {
                    currentSubheading.text += ` ${line}`;
                } else {
                    currentSection?.content.push({ subheading: null, text: line });
                }
            }
        });

        if (currentSection) structured.sections.push(currentSection);

        // First non-empty line as summary (if not already set)
        if (!structured.summary && structured.sections.length) {
            structured.summary = structured.sections[0].content?.[0]?.text || "";
        }

        return structured;

    } catch (error) {
        console.error("Gemini API error:", error.response?.data || error.message);
        // Return default structured response instead of throwing
        return {
            summary: "Sorry, I couldn't generate a response at the moment.",
            sections: []
        };
    }
};




const generateTranslation = async (prompt) => {
    try {

        const response = await axios.post(
            GEMINI_API_URL,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    topP: 0.7,
                    maxOutputTokens: 1000,
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY,
                },
            }
        );

        const translatedText =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
            "⚠️ Sorry, translation not available.";

        return translatedText;
    } catch (error) {
        console.error(
            "Gemini Translation API error:",
            error.response?.data || error.message
        );
        return "⚠️ Sorry, there was an error generating the translation.";
    }
};


module.exports = {
    getGeminiResponse: generateResponse,
    getTranslation: generateTranslation
};
