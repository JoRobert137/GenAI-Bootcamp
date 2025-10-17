/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Sidebar from "../components/Sidebar";
import FeatureNavbar from "../components/FeatureNavbar";

function Talk2GovPage() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      structured: [
        {
          type: "text",
          text: <i>Hello! I'm Talk2Gov 🏛️. I can help you find government schemes. How can I assist you today?</i>,
        },
      ],
    },
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
      const response = await axios.post("http://localhost:8080/api/talk2gov", {
        message: input,
      });
      const aiReply = response.data.reply;
      const formattedReply = [];

      if (aiReply.summary) {
        formattedReply.push({ type: "summary", text: aiReply.summary });
      }

      if (aiReply.sections?.length) {
        aiReply.sections.forEach((section) => {
          formattedReply.push({
            type: "section",
            title: section.title,
            content: section.content,
          });
        });
      }

      setMessages((prev) => [
        ...prev,
        { role: "bot", structured: formattedReply },
      ]);
    } catch (error) {
      console.error("Talk2Gov frontend error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          structured: [
            {
              type: "text",
              text: <i>⚠️ Error connecting to Talk2Gov server.</i>,
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-green-50 text-gray-900 pt-16">
      <FeatureNavbar
        pageActionLabel="+ New Query"
        onActionClick={() => {
          setMessages([
            {
              role: "bot",
              structured: [
                {
                  type: "text",
                  text: "Hello! I'm Talk2Gov 🏛️. I can help you find government schemes. How can I assist you today?",
                },
              ],
            },
          ]);
        }}
      />

      {/* Sidebar */}
      <Sidebar
        title="Talk2Gov 🏛️"
        subtitle="Discover Government Schemes"
        themeColor="green"
        newChatLabel="+ New Query"
        recentChats={["PM Awas Yojana eligibility", "Jan Dhan Yojana benefits", "Farmer scheme queries"]}
        footerNote="Empowering Citizens, Simplifying Governance"
        appName="CivicConnect AI"
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm border-l border-white/20">
        {/* Header */}
        <header className="p-4 border-b border-white/20 bg-green-100/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-green-800">Talk2Gov Chat</h2>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">🏛️ Scheme Finder</span>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xl px-4 py-3 rounded-2xl shadow-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-green-600 text-white rounded-br-none"
                    : "bg-white text-green-800 border border-green-200 rounded-bl-none"
                }`}
              >
                {msg.role === "user" ? (
                  <p>{msg.text}</p>
                ) : (
                  Array.isArray(msg.structured) &&
                  msg.structured.map((item, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      {item.type === "summary" && (
                        <p className="font-semibold text-green-800 mb-2">
                          🧭 Summary: {item.text}
                        </p>
                      )}

                      {item.type === "section" && (
                        <div className="mt-2">
                          <h4 className="font-bold text-green-700 text-base mb-2">
                            {item.title}
                          </h4>
                          <div className="space-y-2">
                            {item.content.map((c, jdx) => (
                              <div key={jdx}>
                                {c.subheading ? (
                                  <p className="font-semibold">
                                    {c.subheading}:{" "}
                                    <span className="font-normal">
                                      {c.text}
                                    </span>
                                  </p>
                                ) : (
                                  <div className="prose prose-green max-w-none prose-p:my-1 prose-li:my-0 prose-headings:mb-1">
                                    <ReactMarkdown>{c.text}</ReactMarkdown>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <hr className="my-3 border-green-200" />
                        </div>
                      )}

                      {item.type === "text" && (
                        <div className="prose prose-green max-w-none">
                          {item.text}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-green-200 px-4 py-2 rounded-2xl text-green-600 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                🔍 Searching government schemes...
              </div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 border-t border-white/20 bg-green-100/50 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about PM Awas Yojana, farmer schemes, health benefits..."
            className="flex-1 border border-green-200 rounded-full px-4 py-2 text-green-800 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className={`px-5 py-2 rounded-full text-white font-semibold transition ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Searching..." : "Send"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default Talk2GovPage;