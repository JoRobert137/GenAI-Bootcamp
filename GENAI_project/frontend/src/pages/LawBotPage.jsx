/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Sidebar from "../components/Sidebar";
import FeatureNavbar from "../components/FeatureNavbar";

function LawBotPage() {
  const [messages, setMessages] = useState([
    { role: "bot", structured: [{ type: "text", text: <i>Hello! I'm LawBot ⚖️. I now provide accurate legal information from verified sources. How can I help you today?</i> }] },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 1️⃣ Try RAG endpoint first
      const response = await axios.post("http://localhost:8080/api/lawbot/rag", { 
        question: input 
      });

      const formattedReply = [];

      if (response.data.sources?.length) {
        formattedReply.push({ 
          type: "sources", 
          text: `📚 Verified Sources: ${response.data.sources.map(s => s.title).join(', ')}` 
        });
      }

      formattedReply.push({ 
        type: "text", 
        text: response.data.response 
      });

      setMessages((prev) => [...prev, { role: "bot", structured: formattedReply }]);

    } catch (ragError) {
      console.warn("RAG system unavailable, falling back to Gemini:", ragError);

      try {
        // 2️⃣ Fallback to Gemini endpoint
        const fallback = await axios.post("http://localhost:8080/api/lawbot", { 
          message: input 
        });
        const aiReply = fallback.data.reply;

        const formattedReply = [
          { type: "text", text: <i>⚠️ RAG system unavailable. Using Gemini mode...</i> }
        ];

        if (aiReply.summary) {
          formattedReply.push({ type: "summary", text: aiReply.summary });
        }
        if (aiReply.sections?.length) {
          aiReply.sections.forEach((sec) => {
            formattedReply.push({ type: "section", title: sec.title, content: sec.content });
          });
        }

        setMessages((prev) => [...prev, { role: "bot", structured: formattedReply }]);

      } catch (geminiError) {
        // 3️⃣ Both failed
        console.error("Both RAG and Gemini failed:", geminiError);
        setMessages((prev) => [
          ...prev,
          { role: "bot", structured: [{ type: "text", text: <i>❌ Error connecting to LawBot server.</i> }] },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex h-screen bg-blue-50 text-gray-900 pt-16">
      <FeatureNavbar
        pageActionLabel="+ New Chat"
        onActionClick={() => {
          setMessages([
            { role: "bot", structured: [{ type: "text", text: "Hello! I'm LawBot ⚖️. I now provide accurate legal information from verified sources. How can I help you today?" }] },
          ]);
        }}
      />
      {/* Sidebar */}
      <Sidebar
        title="LawBot ⚖️"
        subtitle="Your AI Legal Aid with Verified Sources"
        themeColor="blue"
        newChatLabel="+ New Chat"
        recentChats={["Drafting a rental agreement", "Understanding cyber law", "Filing a complaint letter"]}
        footerNote="Information sourced from Indian legal database"
        appName="CivicConnect AI"
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm border-l border-white/20">
        {/* Header */}
        <header className="p-4 border-b border-white/20 bg-blue-100/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-blue-800">LawBot Chat with RAG</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">✓ Verified Sources</span>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xl px-4 py-3 rounded-2xl shadow-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-blue-800 border border-blue-200 rounded-bl-none"
                }`}
              >
                {msg.role === "user" ? (
                  <p>{msg.text}</p>
                ) : (
                  Array.isArray(msg.structured) &&
                  msg.structured.map((item, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      {item.type === "sources" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-blue-700 font-medium">{item.text}</p>
                        </div>
                      )}

                      {item.type === "summary" && (
                        <p className="font-semibold text-blue-800 mb-2">🧭 Summary: {item.text}</p>
                      )}

                      {item.type === "section" && (
                        <div className="mt-2">
                          <h4 className="font-bold text-blue-700 text-base mb-2">{item.title}</h4>
                          <div className="space-y-2">
                            {item.content.map((c, jdx) => (
                              <div key={jdx}>
                                {c.subheading ? (
                                  <p className="font-semibold">{c.subheading}: <span className="font-normal">{c.text}</span></p>
                                ) : (
                                  <div className="prose prose-blue max-w-none prose-p:my-1 prose-li:my-0 prose-headings:mb-1">
                                    <ReactMarkdown>{c.text}</ReactMarkdown>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <hr className="my-3 border-blue-200" />
                        </div>
                      )}

                      {item.type === "text" && <div className="prose prose-blue max-w-none">{item.text}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-blue-200 px-4 py-2 rounded-2xl text-blue-600 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                🔍 Searching legal database...
              </div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 border-t border-white/20 bg-blue-100/50 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about consumer rights, RTI, fundamental rights..."
            className="flex-1 border border-blue-200 rounded-full px-4 py-2 text-blue-800 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)} // Using RAG version
          />
          <button
            onClick={() => handleSend(input)} // Using RAG version
            disabled={loading}
            className={`px-5 py-2 rounded-full text-white font-semibold transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Searching..." : "Send"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default LawBotPage;