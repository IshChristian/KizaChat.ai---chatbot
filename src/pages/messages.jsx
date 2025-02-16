import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  PaperclipIcon
} from "lucide-react";
import LoadingState from "../components/loading";
import io from "socket.io-client";
import DOMPurify from "dompurify";
import { marked } from 'marked';
import axios from "axios";

const markdownStyles = `
.markdown-content {
  line-height: 1.5;
}
.markdown-content p {
  margin-bottom: 0.5rem;
}
.markdown-content ul, .markdown-content ol {
  margin-left: 1.5rem;
  margin-bottom: 0.5rem;
}
.markdown-content code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 0.2rem;
}
.markdown-content pre {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 0.4rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}
.markdown-content blockquote {
  border-left: 4px solid rgba(0, 0, 0, 0.2);
  padding-left: 1rem;
  margin: 0.5rem 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #818cf8;
}
`;

const TypingAnimation = () => (
  <div className="flex space-x-2 p-4">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
  </div>
);

const formatMessage = (content) => {
  return DOMPurify.sanitize(marked(content), {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: []
  });
};

const ChatMessage = ({ message, isUser }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
      <div className="relative max-w-2xl">
        <div className={`p-4 rounded-2xl shadow-sm ${
          isUser ? "bg-purple-600 text-white" : "bg-white border border-gray-200"
        }`}>
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ 
              __html: formatMessage(message.content)
            }}
          />
          {!isUser && (
            <div className="flex justify-end space-x-2 mt-2 text-gray-400">
              <button 
                onClick={handleCopy}
                className="p-1 hover:text-gray-600 rounded"
              >
                <Copy size={16} />
              </button>
              <button className="p-1 hover:text-gray-600 rounded">
                <ThumbsUp size={16} />
              </button>
              <button className="p-1 hover:text-gray-600 rounded">
                <ThumbsDown size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { id: chatID } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = markdownStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    socket.current = io("https://kizachat-server.onrender.com/");
    socket.current.on("newMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });
    return () => socket.current.disconnect();
  }, []);

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const emailCookie = cookies.find((row) => row.startsWith("email="));
    if (emailCookie) {
      setEmail(emailCookie.split("=")[1]);
    }
  }, []);

  const fetchChatData = async () => {
    if (!chatID) {
      setIsLoading(false);
      setIsDataFetched(true);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`https://kizachat-server.onrender.com//api/chat/users/${chatID}`, {
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Failed to fetch chat data");

      const responseData = await response.json();
      
      if (responseData.success && Array.isArray(responseData.data)) {
        const formattedMessages = responseData.data.flatMap((doc) => {
          if (!doc.question || !doc.response) return [];
          return [
            { id: `user-${doc._id}`, content: doc.question, isUser: true },
            { id: `ai-${doc._id}`, content: doc.response, isUser: false },
          ];
        });
        setMessages(formattedMessages);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request timed out");
      } else {
        console.error("Error fetching chat data:", error);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      setIsDataFetched(true);
    }
  };

  useEffect(() => {
    fetchChatData();
  }, [chatID]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const adjustTextareaHeight = (element) => {
    element.style.height = 'inherit';
    const computed = window.getComputedStyle(element);
    const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                   + parseInt(computed.getPropertyValue('padding-top'), 10)
                   + element.scrollHeight
                   + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                   + parseInt(computed.getPropertyValue('border-bottom-width'), 10);
    
    const minHeight = 56;
    const maxHeight = 160;
    element.style.height = `${Math.min(Math.max(height, minHeight), maxHeight)}px`;
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "" || isResponding) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage = { 
      id: userMessageId, 
      content: inputMessage,
      isUser: true 
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsResponding(true);

    try {
      const response = await axios.post("https://kizachat-server.onrender.com//api/chat/ask", {
        chatID,
        user_email: email || "Guest",
        question: inputMessage,
      });

      if (!response.data) {
        throw new Error("No response data received from API");
      }

      const aiResponse = response.data.response || response.data.data?.response;
      if (!aiResponse) {
        throw new Error("Could not find response in API data");
      }

      const aiMessageId = `ai-${Date.now()}`;
      const aiMessage = { 
        id: aiMessageId, 
        content: aiResponse,
        isUser: false 
      };

      setMessages((prev) => [...prev, aiMessage]);
      await fetchChatData();

    } catch (error) {
      console.error("Error details:", error);
      
      const errorMessage = { 
        id: `error-${Date.now()}`, 
        content: "Failed to send message. Please try again.",
        isUser: false 
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {!isDataFetched && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-gray-500 text-lg">Welcome! Type a message to start chatting.</p>
        </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} isUser={message.isUser} />
          ))
        )}
        {isResponding && <TypingAnimation />}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto">
          <textarea
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Ask whatever you want..."
            className="w-full pl-4 pr-24 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:outline-none resize-none overflow-y-auto"
            style={{ minHeight: '10px', maxHeight: '120px' }}
            // rows="1"
            disabled={isResponding}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <div className="w-px h-6 bg-gray-200" />
            <span className="text-xs text-gray-400">
              {inputMessage.length}/1000
            </span>
            <button
              type="submit"
              className={`rounded-lg ${
                isResponding ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              } p-2 text-white`}
              disabled={isResponding}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}