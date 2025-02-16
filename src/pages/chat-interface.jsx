import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Paperclip, 
  ImageIcon, 
  Send, 
  RefreshCcw, 
  Clock, 
  Settings, 
  Download, 
  FileText, 
  Brain, 
  Code, 
  Mail, 
  Book,
  PenTool,
  Calculator,
  X
} from "lucide-react";
import SuggestionCard from "../components/suggested";


// Auth Modal Component
const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-2xl font-semibold mb-6">Sign in to continue</h2>
        
        <div className="space-y-4">
          <a 
            href="/login"
            className="block w-full text-center py-3 px-4 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Sign In
          </a>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <a 
            href="/register"
            className="block w-full text-center py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
};

// List of all possible suggestions with their icons
const allSuggestions = [
  { icon: Clock, text: "Write a to-do list for a personal project or task" },
  { icon: Settings, text: "Generate an email to reply to a job offer" },
  { icon: Download, text: "Summarize this article or text for me in one paragraph" },
  { icon: Brain, text: "Explain quantum computing in simple terms" },
  { icon: Code, text: "Help me debug this JavaScript code" },
  { icon: Mail, text: "Draft a professional networking message" },
  { icon: Book, text: "Create a study plan for learning a new language" },
  { icon: PenTool, text: "Write a creative story about time travel" },
  { icon: Calculator, text: "Help me solve this math problem" },
  { icon: FileText, text: "Create a resume for a software developer position" },
  { icon: Brain, text: "Explain the basics of machine learning" },
  { icon: Settings, text: "Help me optimize my work productivity" }
];

const generateChatID = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let chatID = "";
  for (let i = 0; i < 25; i++) {
    chatID += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return chatID;
};

export default function ChatInterface() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [displayedSuggestions, setDisplayedSuggestions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize suggestions and get email from cookies
  useEffect(() => {
    setDisplayedSuggestions(getRandomSuggestions());
    const cookies = document.cookie.split("; ");
    const emailCookie = cookies.find((row) => row.startsWith("email="));
    if (emailCookie) {
      setEmail(decodeURIComponent(emailCookie.split("=")[1]));
    }
  }, []);

  // Get random suggestions
  const getRandomSuggestions = () => {
    const shuffled = [...allSuggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6); // Show 6 suggestions at a time
  };

  // Initialize suggestions and get email from cookies
  useEffect(() => {
    setDisplayedSuggestions(getRandomSuggestions());
    const cookies = document.cookie.split("; ");
    const emailCookie = cookies.find((row) => row.startsWith("email="));
    if (emailCookie) {
      setEmail(decodeURIComponent(emailCookie.split("=")[1]));
    }
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = (suggestionText) => {
    setQuestion(suggestionText);
  };

  // Handle refresh suggestions
  const handleRefreshSuggestions = () => {
    setIsRefreshing(true);
    // Animate out
    setTimeout(() => {
      setDisplayedSuggestions(getRandomSuggestions());
      setIsRefreshing(false);
    }, 300);
  };

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    if (!email) {
      setShowAuthModal(true);
      return;
    }

    const chatID = generateChatID();

    try {
      const requestBody = { user_email: email || "Guest", question, chatID };
      const response = await axios.post("http://localhost:8123/api/chat/ask", requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status >= 200 && response.status < 300) {
        navigate(`/chat/${chatID}`);
      } else {
        console.error("Error in response:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error submitting question:", error);
    }
  };

  return (
    <>
      <div className="flex-1 max-w-4xl mx-auto px-8 py-12">
        <div className="space-y-2 mb-8">
          <h1 className="text-4xl font-semibold">
            Hi there, <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">{email || "Guest"}</span>
          </h1>
          <h2 className="text-3xl font-semibold">
            What <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-blue-500 bg-clip-text text-transparent">would you like to know?</span>
          </h2>
          <p className="text-gray-600 text-sm">Click on any suggestion or type your own question to begin</p>
        </div>

        {/* Suggestion Cards Grid */}
        <div className={`grid grid-cols-2 gap-4 mb-8 transition-opacity duration-300 ${isRefreshing ? 'opacity-0' : 'opacity-100'}`}>
          {displayedSuggestions.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              Icon={suggestion.icon}
              text={suggestion.text}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="cursor-pointer hover:scale-102 transition-transform"
            />
          ))}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={handleRefreshSuggestions}
            disabled={isRefreshing}
            className="text-gray-600 border rounded-lg px-4 py-2 flex items-center hover:bg-gray-50 transition-colors"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Prompts
          </button>
        </div>

        {/* Input Area */}
        <form onSubmit={handleQuestionSubmit} className="relative">
          <input 
            type="text" 
            placeholder="Ask whatever you want..." 
            className="w-full pl-4 pr-24 py-6 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:outline-none" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <button type="button" className="text-gray-400 hover:text-gray-600 p-2 rounded-lg">
              <Paperclip className="h-5 w-5" />
            </button>
            <button type="button" className="text-gray-400 hover:text-gray-600 p-2 rounded-lg">
              <ImageIcon className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <span className="text-xs text-gray-400">{question.length}/1000</span>
            <button 
              type="submit" 
              className="rounded-lg bg-purple-600 hover:bg-purple-700 p-2 text-white transition-colors"
              disabled={!question.trim()}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
        {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      </div>
    </>
  );
}