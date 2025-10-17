/* eslint-disable no-unused-vars */
import Sidebar from "../components/Sidebar";
import FeatureNavbar from "../components/FeatureNavbar";
import React, { useState } from "react";
import axios from "axios";

function LanguageAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      structured: [{
        type: "text", 
        text: <i>👋 Hello! I'm your Local Language Assistant. Paste or type any text and I'll simplify or translate it.</i>
      }],
    },
  ]);
  const [input, setInput] = useState("");
  const [targetLang, setTargetLang] = useState("hi");
  const [loading, setLoading] = useState(false);

  const getLangName = (code) => {
    const map = {
      hi: "Hindi",
      bn: "Bengali",
      ta: "Tamil",
      te: "Telugu",
      mr: "Marathi",
      ml: "Malayalam",
      gu: "Gujarati",
      kn: "Kannada",
      pa: "Punjabi",
      ur: "Urdu",
    };
    return map[code] || "Unknown";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input; // preserve current message before clearing
    setInput("");
    setLoading(true);

    try {
      // ✅ Call updated backend route
      const res = await axios.post("http://localhost:8080/api/translate", {
        message: input,
        language: targetLang,
      });

      const translatedText =
        res.data?.reply?.trim() ||
        res.data?.trim?.() ||
        "⚠️ Sorry, translation not available.";

      const botReply = {
        role: "bot",
        structured: [
          {
            type: "text",
            text: translatedText,
          },
        ],
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Translation API error:", err);
      const botReply = {
        role: "bot",
        structured: [
          {
            type: "text",
            text: "⚠️ Sorry, there was an error processing your request.",
          },
        ],
      };
      setMessages((prev) => [...prev, botReply]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };


  return (
    <div className="flex h-screen bg-purple-50 text-gray-900 pt-16">
      <FeatureNavbar
        pageActionLabel="+ New Translation"
        onActionClick={() => {
          setMessages([
            {
              role: "bot",
              structured: [{
                type: "text", 
                text: "👋 Hello! I'm your Local Language Assistant. Paste or type any text and I'll simplify or translate it."
              }]
            },
          ]);
        }}
      />


      <Sidebar
        title="Language Assistant 🌐"
        subtitle="Your Regional AI Guide"
        themeColor="purple"
        newChatLabel="+ New Translation"
        recentChats={["Legal document translation", "Government scheme explanation", "Technical term simplification"]}
        footerNote="Supports 10+ Indian languages"
        appName="CivicConnect AI"
        className="pt-16"

      />

      <main className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm border-l border-white/20">

        {/* Header */}
        <header className="p-4 border-b border-white/20 bg-purple-100/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-purple-800">
            Local Language Assistant

          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">🌐 Multilingual</span>
            
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="border border-purple-200 rounded-lg px-3 py-1 text-purple-800 focus:ring-2 focus:ring-purple-400 outline-none transition text-sm"
            >
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="mr">Marathi</option>
              <option value="ml">Malayalam</option>
              <option value="gu">Gujarati</option>
              <option value="kn">Kannada</option>
              <option value="pa">Punjabi</option>
              <option value="ur">Urdu</option>
            </select>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div

                className={`max-w-xl px-4 py-3 rounded-2xl shadow-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-white text-purple-800 border border-purple-200 rounded-bl-none"
                }`}

              >
                {msg.role === "user" ? (
                  <p>{msg.text}</p>
                ) : (
                  Array.isArray(msg.structured) &&
                  msg.structured.map((item, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      {item.type === "summary" && (
                        <p className="font-semibold text-purple-800 mb-2">
                          🔍 {item.text}
                        </p>
                      )}

                      {item.type === "text" && (
                        <div className="prose prose-purple max-w-none">
                          {item.text}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-purple-200 px-4 py-2 rounded-2xl text-purple-600 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                🌐 Translating...
              </div>
            </div>
          )}
        </div>


        {/* Input Box */}
        <div className="p-4 border-t border-white/20 bg-purple-100/50 flex items-center gap-3">

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}

            placeholder="Type or paste text to translate or simplify..."
            className="flex-1 border border-purple-200 rounded-full px-4 py-2 text-purple-800 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"

            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading}

            className={`px-5 py-2 rounded-full text-white font-semibold transition ${
              loading
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}

          >
            {loading ? "Translating..." : "Send"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default LanguageAssistantPage;