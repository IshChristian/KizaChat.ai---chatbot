import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Globe, Paperclip, RefreshCcw, List, Mail, FileText, Cpu, Send, X, Mic } from "lucide-react"; // <-- Add Mic

const suggestionPools = [
  [
    { text: "Write a to-do list for a personal project or task", icon: <List size={32} className="mb-2 text-blue-500" /> },
    { text: "Generate an email to reply to a job offer", icon: <Mail size={32} className="mb-2 text-green-500" /> },
    { text: "Summarise this article or text for me in one paragraph", icon: <FileText size={32} className="mb-2 text-purple-500" /> },
    { text: "How does AI work in a technical capacity", icon: <Cpu size={32} className="mb-2 text-red-500" /> },
  ],
  [
    { text: "Plan a weekend trip itinerary", icon: <List size={32} className="mb-2 text-yellow-500" /> },
    { text: "Write a professional resignation letter", icon: <Mail size={32} className="mb-2 text-teal-500" /> },
    { text: "Explain quantum computing in simple terms", icon: <FileText size={32} className="mb-2 text-indigo-500" /> },
    { text: "How to start a small business?", icon: <Cpu size={32} className="mb-2 text-pink-500" /> },
  ],
];

// Remove ModelSelectionModal and all its usages

export default function ChatInterface() {
  const navigate = useNavigate();
  const [name, setName] = useState("Guest");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [suggestions, setSuggestions] = useState(suggestionPools[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputAreaClass, setInputAreaClass] = useState("");
  const [hideSuggestions, setHideSuggestions] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [selectedButton, setSelectedButton] = useState("");
  const BASE_URL = import.meta.env.VITE_SERVER_API_URL

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const emailCookie = cookies.find((row) => row.startsWith("email="));
    const nameCookie = cookies.find((row) => row.startsWith("user_name="));

    if (emailCookie) setEmail(decodeURIComponent(emailCookie.split("=")[1]));
    if (nameCookie) setName(decodeURIComponent(nameCookie.split("=")[1]));
  }, []);

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setHideSuggestions(true);
    setHideHeader(true);
    setInputAreaClass("translate-y-full opacity-100 transition-all duration-700");

    setTimeout(async () => {
      const chatID = generateChatID();
      try {
        const response = await axios.post(`${BASE_URL}/chat/ask`, {
          user_email: email || "Guest",
          question,
          chatID,
        });

        if (response.status === 200) {
          navigate(`/chat/${chatID}`);
        }
      } catch (error) {
        console.error("Error submitting question:", error);
      }
    }, 700);
  };

  const handleRefreshPrompts = () => {
    const randomPool = Math.floor(Math.random() * suggestionPools.length);
    setSuggestions(suggestionPools[randomPool]);
  };

  return(
  <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-white to-gray-50 text-gray-800 px-6 py-10 md:px-16 md:py-12">
    {/* Header Section */}
    {!hideHeader && (
      <header className="text-center w-full max-w-xl mx-auto mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
          What can I help with?
        </h1>
      </header>
    )}

    {/* User Input Area */}
    <div className={`w-full max-w-xl bg-white rounded-xl p-3 md:p-4 shadow-lg ${inputAreaClass} mx-auto mb-2`}>
      <form onSubmit={handleQuestionSubmit} className="flex flex-col space-y-3">
        <textarea
          className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none scrollbar-hide text-sm"
          placeholder="Ask whatever you want..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={1}
          maxLength={1000}
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center mr-2">
            
            {/* Mic Icon */}
            <button
              type="button"
              onClick={() => navigate("/chat/kiza-agent")}
              className="flex items-center px-3 py-1 rounded-full transition text-xs md:text-sm bg-gray-100 text-gray-700 ml-2"
              title="Voice Agent"
            >
              <Mic size={18} className="mr-1" />
              Voice Agent
            </button>
          </div>

          <div className="flex space-x-2">
            {/* Send Button */}
            <button
              type="submit"
              className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white w-10 h-10 rounded-full hover:from-purple-700 hover:to-blue-600 transition shadow-md"
            >
              {isLoading ? (
                <div className="flex space-x-1">
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></span>
                  <span className="w-1 h-1 bg-white rounded-full animate-bounce delay-400"></span>
                </div>
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>

      {/* Prompt Suggestions */}
      {!hideSuggestions && (
        <div className="w-full max-w-2xl mt-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <List size={32} className="mr-2 text-purple-600" />
            Suggestions
          </h2>
          <div className="flex flex-wrap gap-4">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setQuestion(suggestion.text)}
                className="flex-1 flex flex-col items-center bg-white text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition shadow-sm border border-gray-100"
              >
                {suggestion.icon}
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleRefreshPrompts}
            className="flex items-center text-purple-600 mt-4 hover:underline"
          >
            <RefreshCcw size={20} className="mr-2" />
            Refresh Prompts
          </button>
        </div>
      )}
    </div>
  );
}

function generateChatID() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 25 }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
}