import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
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

// ... AuthModal component remains the same ...
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
          <Link 
            to={"/login"}
            className="block w-full text-center py-3 px-4 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Sign In
          </Link>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <Link 
            to={"/register"}
            className="block w-full text-center py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getRandomSuggestions = () => {
    const shuffled = [...allSuggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, isMobile ? 2 : 6);
  };

  useEffect(() => {
    setDisplayedSuggestions(getRandomSuggestions());
    const cookies = document.cookie.split("; ");
    const emailCookie = cookies.find((row) => row.startsWith("email="));
    if (emailCookie) {
      setEmail(decodeURIComponent(emailCookie.split("=")[1]));
    }
  }, [isMobile]);

  const handleSuggestionClick = (suggestionText) => {
    // Update the input value directly through the ref
    if (inputRef.current) {
      inputRef.current.value = suggestionText;
      // Also update the state to keep it in sync
      setQuestion(suggestionText);
      // Focus the input
      inputRef.current.focus();
    }
  };

  const handleRefreshSuggestions = () => {
    setIsRefreshing(true);
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
      const response = await axios.post("https://kizachat-server.onrender.com/api/chat/ask", requestBody, {
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
    <div className="flex min-h-screen bg-gradient-to-br lg:justify-center sm:items-center mt-10 w-full">
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="space-y-2 mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
            Hi there, <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">{email || "Guest"}</span>
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
            What <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-blue-500 bg-clip-text text-transparent">would you like to know?</span>
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">Click on any suggestion or type your own question to begin</p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-0' : 'opacity-100'}`}>
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

        <div className="flex justify-center mb-6">
          <button 
            onClick={handleRefreshSuggestions}
            disabled={isRefreshing}
            className="text-gray-600 border rounded-lg px-3 py-1.5 flex items-center hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCcw className={`h-3 w-3 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Prompts
          </button>
        </div>

        <form onSubmit={handleQuestionSubmit} className="relative w-full">
          <div className="relative">
            <input 
              ref={inputRef}
              type="text"
              placeholder="Ask whatever you want..." 
              className="w-full pl-3 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:outline-none text-sm sm:text-base bg-white"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-purple-600 hover:bg-purple-700 p-1.5 text-white transition-colors"
              disabled={!question.trim()}
            >
              <Send className="h-3 w-3" />
            </button>
          </div>
          <span className="absolute left-0 -bottom-6 text-xs text-gray-400">{question.length}/1000</span>
        </form>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    </div>
  );
}