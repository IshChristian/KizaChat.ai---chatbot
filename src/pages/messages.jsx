import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Mic,Send, ThumbsUp, ThumbsDown, Copy, Edit, Check, ArrowDown, CheckCheck, Paperclip, Globe, X } from "lucide-react"
import DOMPurify from "dompurify"
import { marked } from "marked"
import axios from "axios"



const markdownStyles = `
.markdown-content {
  line-height: 2;
  font-size: 1rem;
}
.markdown-content p {
  margin-bottom: 1.25rem;
}
.markdown-content ul, .markdown-content ol {
  margin-left: 2rem;
  margin-bottom: 1.25rem;
}
.markdown-content code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
}
.markdown-content pre {
  background-color: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.25rem 0;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}
@media (max-width: 640px) {
  .markdown-content pre {
    padding: 0.75rem;
    font-size: 0.75rem;
  }
}
.copy-code-button {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  color: #e2e8f0;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}
.copy-code-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
.copy-code-button.copied {
  background-color: #10b981;
}
.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}
.markdown-content blockquote {
  border-left: 4px solid rgba(0, 0, 0, 0.2);
  padding-left: 1rem;
  margin: 1.25rem 0;
}
.focus-visible-ring:focus-visible {
  outline: 2px solid #818cf8 !important;
  outline-offset: 2px;
}
@media (min-width: 768px) {
  .markdown-content {
    font-size: 1.125rem;
  }
}
*:focus {
  outline: none !important;
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
.typing-dot {
  display: inline-block;
  animation: blink 1s infinite;
  margin-left: 2px;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`

const ScrollToBottomButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 -top-16 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 focus-visible-ring"
    aria-label="Scroll to bottom"
  >
    <ArrowDown size={24} className="text-gray-600" />
  </button>
)

const ModelSelectionModal = ({ isOpen, onClose, selectedModel, onSelectModel }) => {
  const models = [
    { id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free', name: 'DeepSeek R1' },
    { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', name: 'Llama 3.3 Turbo' },
    { id: 'meta-llama/Llama-Vision-Free', name: 'Llama Vision' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select AI Model</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-2">
          {models.map(model => (
            <button
              key={model.id}
              onClick={() => onSelectModel(model.id)}
              className={`w-full text-left p-3 rounded-lg transition ${selectedModel === model.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
            >
              {model.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const formatMessage = (content) => {
  const renderer = new marked.Renderer();
  
  renderer.code = (code, language) => {
    let codeText = '';
    let langToUse = language || 'text';
    
    if (code === null || code === undefined) {
      codeText = '';
    } else if (typeof code === 'object') {
      if (code.text) {
        codeText = code.text;
        if (code.lang) {
          langToUse = code.lang;
        }
      } else {
        try {
          codeText = JSON.stringify(code, null, 2);
        } catch (e) {
          codeText = '[Object]';
        }
      }
    } else {
      codeText = String(code);
    }
    
    let highlightedCode = codeText;
    
    if (langToUse === 'ruby') {
      const rubyKeywords = ['if', 'else', 'elsif', 'end', 'puts', 'gets', 'chomp', 'def', 'class', 'module', 'require', 'include', 'attr_accessor', 'attr_reader', 'attr_writer', 'while', 'until', 'for', 'do', 'break', 'next', 'return', 'true', 'false', 'nil', 'self', 'super'];
      const keywordPattern = new RegExp('\\b(' + rubyKeywords.join('|') + ')\\b', 'g');
      highlightedCode = highlightedCode.replace(keywordPattern, '<span style="color: #9333ea; font-weight: bold;">$1</span>');
      highlightedCode = highlightedCode.replace(/(["'])(.*?)\1/g, '<span style="color: #0A3069;">$1$2$1</span>');
    } else if (langToUse === 'javascript' || langToUse === 'js') {
      const jsKeywords = ['var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch', 'finally', 'new', 'delete', 'typeof', 'instanceof', 'void', 'this', 'super', 'class', 'extends', 'import', 'export', 'from', 'as', 'async', 'await', 'true', 'false', 'null', 'undefined'];
      const keywordPattern = new RegExp('\\b(' + jsKeywords.join('|') + ')\\b', 'g');
      highlightedCode = highlightedCode.replace(keywordPattern, '<span style="color: #9333ea; font-weight: bold;">$1</span>');
      highlightedCode = highlightedCode.replace(/(["'`])(.*?)\1/g, '<span style="color: #0A3069;">$1$2$1</span>');
    } else if (langToUse === 'python') {
      const pythonKeywords = ['and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'];
      const keywordPattern = new RegExp('\\b(' + pythonKeywords.join('|') + ')\\b', 'g');
      highlightedCode = highlightedCode.replace(keywordPattern, '<span style="color: #9333ea; font-weight: bold;">$1</span>');
      highlightedCode = highlightedCode.replace(/(["'])(.*?)\1/g, '<span style="color: #0A3069;">$1$2$1</span>');
    }
    
    const escapedCode = highlightedCode
      .replace(/&(?!(amp;|lt;|gt;|quot;|#039;))/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
      
    return `
      <pre style="max-width: 100%; overflow-x: auto;">
        <code class="language-${langToUse}">${escapedCode}</code>
        <button class="copy-code-button" data-code="${codeText.replace(/"/g, '&quot;')}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span class="hidden sm:inline">Copy</span>
        </button>
      </pre>
    `;
  };

  const markedOptions = {
    renderer,
    gfm: true,
    breaks: true,
    xhtml: false
  };

  return DOMPurify.sanitize(marked(content, markedOptions), {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "code", "pre", "ul", "ol", "li", "blockquote", "button", "svg", "rect", "path", "span"],
    ALLOWED_ATTR: ["class", "data-code", "width", "height", "viewBox", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "d", "x", "y", "rx", "ry", "style"],
  });
}

const ChatMessage = ({ message, isUser, onEdit, onSendMessage, isNewMessage }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)
  const [isCopied, setIsCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [displayedContent, setDisplayedContent] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messageRef = useRef(null)

  // Handle typing animation for AI messages
  useEffect(() => {
    if (!isUser && isNewMessage && message.content && !message.isEdited) {
      setDisplayedContent("")
      setIsTyping(true)
      
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < message.content.length) {
          setDisplayedContent(prev => prev + message.content.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
        }
      }, 20) // Speed of typing animation

      return () => clearInterval(typingInterval)
    } else {
      setDisplayedContent(message.content)
      setIsTyping(false)
    }
  }, [message.content, isUser, message.isEdited, isNewMessage])

  // Removed the old blinking dot animation effect that used showTypingDot

  useEffect(() => {
    if (messageRef.current) {
      const copyButtons = messageRef.current.querySelectorAll('.copy-code-button');
      copyButtons.forEach(button => {
        button.addEventListener('click', () => {
          const code = button.getAttribute('data-code');
          navigator.clipboard.writeText(code);
          
          button.classList.add('copied');
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
            Copied!
          `;
          
          setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy
            `;
          }, 2000);
        });
      });
      
      return () => {
        copyButtons.forEach(button => {
          button.removeEventListener('click', () => {});
        });
      };
    }
  }, [message.content]);

  const handleLike = () => {
    if (!isDisliked) {
      setIsLiked(!isLiked)
      setIsDisliked(false)
    }
  }

  const handleDislike = () => {
    if (!isLiked) {
      setIsDisliked(!isDisliked)
      setIsLiked(false)
    }
  }

  const handleSaveEdit = () => {
    if (editedContent.trim() === "") return
    onEdit(null, message.id, editedContent)
    setIsEditing(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full my-2 px-2 md:px-4`}>
      {!isUser && (
        <div className="mr-2 md:mr-3 flex-shrink-0">
          <img
            src="../../png/logo-gorilla.png"
            alt="Avatar"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full"
          />
        </div>
      )}
      
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%] md:max-w-[85%]`}>
        <div
          className={`p-3 md:p-4 rounded-2xl ${
            isUser
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm rounded-br-none"
              : "text-gray-800"
          }`}
        >
          {isEditing ? (
            <div className="relative">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 md:p-3 rounded-lg border-2 border-purple-600 focus:outline-none resize-none text-sm md:text-base"
                rows={4}
                aria-label="Edit message"
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-xs md:text-gray-600 md:px-3 md:py-1 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-xs md:text-base md:px-3 md:py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              ref={messageRef}
              className={`markdown-content text-sm md:text-base ${isUser ? "text-white" : "text-gray-800"}`}
              dangerouslySetInnerHTML={{ 
                __html: formatMessage(
                  displayedContent + 
                  (isTyping ? '<span class="typing-dot">●</span>' : '')
                ) 
              }}
            />
          )}
        </div>

        {/* Message actions */}
        {!isEditing && (
          <div className={`flex mt-1 space-x-1 md:space-x-2 ${isUser ? "justify-end" : "justify-start"}`}>
            {isUser ? (
              <>
                <button
                  onClick={handleCopy}
                  className="p-1 text-gray-500 hover:text-purple-600 rounded-full relative"
                  aria-label={isCopied ? "Copied" : "Copy"}
                >
                  {isCopied ? (
                    <>
                      <CheckCheck size={14} className="md:w-4 md:h-4 text-green-500" />
                      <span className="absolute -top-6 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Copied!
                      </span>
                    </>
                  ) : (
                    <Copy size={14} className="md:w-4 md:h-4" />
                  )}
                </button>
                <button
                  onClick={handleEdit}
                  className="p-1 text-gray-500 hover:text-purple-600 rounded-full"
                  aria-label="Edit"
                >
                  <Edit size={14} className="md:w-4 md:h-4" />
                </button>
              </>
            ) : (
              <div className="flex space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5 md:px-3 md:py-1 shadow-xs">
                <button
                  onClick={handleCopy}
                  className="p-1 text-gray-500 hover:text-gray-700 relative"
                  aria-label="Copy"
                >
                  {isCopied ? (
                    <>
                      <CheckCheck size={14} className="md:w-4 md:h-4 text-green-500" />
                      <span className="absolute -top-6 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Copied!
                      </span>
                    </>
                  ) : (
                    <Copy size={14} className="md:w-4 md:h-4" />
                  )}
                </button>
                <button
                  onClick={handleLike}
                  className={`p-1 ${isLiked ? "text-blue-500" : "text-gray-500 hover:text-gray-700"}`}
                  aria-label="Like"
                >
                  <ThumbsUp size={14} className="md:w-4 md:h-4" />
                </button>
                <button
                  onClick={handleDislike}
                  className={`p-1 ${isDisliked ? "text-red-500" : "text-gray-500 hover:text-gray-700"}`}
                  aria-label="Dislike"
                >
                  <ThumbsDown size={14} className="md:w-4 md:h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// File attachment component to display files
const FileAttachment = ({ file, onRemove }) => {
  const getFileIcon = (extension) => {
    // You can add more file type icons based on extension
    switch(extension.toLowerCase()) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      case 'txt': return '📃';
      default: return '📁';
    }
  }

  const extension = file.name.split('.').pop();
  
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-2 my-2">
      <span className="mr-2 text-xl">{getFileIcon(extension)}</span>
      <span className="flex-1 truncate">{file.name}</span>
      <span className="text-xs text-gray-500 mx-2">{extension.toUpperCase()}</span>
      <button 
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500"
      >
        <X size={16} />
      </button>
    </div>
  )
}


export default function ChatPage() {
    const navigate = useNavigate();
  
  const { id: chatID } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isDataFetched, setIsDataFetched] = useState(false)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState("")
  const [textareaRows, setTextareaRows] = useState(1)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileUploadState, setFileUploadState] = useState(null)
  const [model, setModel] = useState('meta-llama/Llama-3.3-70B-Instruct-Turbo-Free')
  const [isResponding, setIsResponding] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [selectedButton, setSelectedButton] = useState(null)
  const [showModelModal, setShowModelModal] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const textareaRef = useRef(null)
  const [email, setEmail] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [lastMessageId, setLastMessageId] = useState(null)
  const BASE_URL = import.meta.env.VITE_SERVER_API_URL


  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = markdownStyles
    document.head.appendChild(styleElement)
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  useEffect(() => {
    const cookies = document.cookie.split("; ")
    const emailCookie = cookies.find((row) => row.startsWith("email="))
    if (emailCookie) {
      setEmail(emailCookie.split("=")[1])
    }
  }, [])

  const handleScroll = () => {
    if (!chatContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollButton(!isNearBottom)
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll)
      return () => chatContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  const fetchChatData = useCallback(async () => {
    if (!chatID) {
      setIsLoading(false)
      setIsDataFetched(true)
      return
    }

    try {
      const response = await fetch(`${BASE_URL}/chat/users/${chatID}`)
      if (!response.ok) throw new Error("Failed to fetch chat data")

      const responseData = await response.json()

      if (responseData.success && Array.isArray(responseData.data)) {
        const formattedMessages = responseData.data.flatMap((doc) => {
          if (!doc.question || !doc.response) return []
          return [
            { id: `user-${doc._id}`, content: doc.question, isUser: true },
            { id: `ai-${doc._id}`, content: doc.response, isUser: false },
          ]
        })
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Error fetching chat data:", error)
    } finally {
      setIsLoading(false)
      setIsDataFetched(true)
    }
  }, [chatID])

  useEffect(() => {
    fetchChatData()
  }, [fetchChatData])

  const handleEditMessage = async (e, messageId, newContent) => {
    if (e && e.preventDefault) e.preventDefault(); 
  
    if (!newContent || typeof newContent !== "string" || newContent.trim() === "" || isResponding) return;
    
    const originalMessage = messages.find(msg => msg.id === messageId);
    if (!originalMessage) return;
    
    setMessages(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, content: newContent } : msg))
    );
    
    if (originalMessage.isUser) {
      setIsResponding(true);
      
      const tempTypingId = `typing-${Date.now()}`;
      setMessages(prev => {
        const userMsgIndex = prev.findIndex(msg => msg.id === messageId);
        const aiResponseIndex = userMsgIndex + 1;
        
        if (aiResponseIndex < prev.length && !prev[aiResponseIndex].isUser) {
          return [
            ...prev.slice(0, aiResponseIndex),
            {
              id: tempTypingId,
              content: "",
              isUser: false,
              isTyping: true,
            },
            ...prev.slice(aiResponseIndex + 1)
          ];
        } else {
          return [
            ...prev,
            {
              id: tempTypingId,
              content: "",
              isUser: false,
              isTyping: true,
            }
          ];
        }
      });
      
      try {
        const response = await axios.post(`${BASE_URL}/chat/ask`, {
          chatID,
          user_email: email || "Guest", // Ensure this is always included
          question: newContent,
          model: model
        });


        setMessages(prev => prev.filter(msg => msg.id !== tempTypingId));
        
        if (response.data?.response || response.data?.data?.response) {
          const aiResponse = response.data.response || response.data.data.response;
          const aiMessageId = `ai-${Date.now()}`;
          
          setMessages(prev => {
            const userMsgIndex = prev.findIndex(msg => msg.id === messageId);
            const aiResponseIndex = userMsgIndex + 1;
            
            if (aiResponseIndex < prev.length && !prev[aiResponseIndex].isUser) {
              return [
                ...prev.slice(0, aiResponseIndex),
                {
                  id: aiMessageId,
                  content: aiResponse,
                  isUser: false,
                },
                ...prev.slice(aiResponseIndex + 1)
              ];
            } else {
              return [
                ...prev,
                {
                  id: aiMessageId,
                  content: aiResponse,
                  isUser: false,
                }
              ];
            }
          });
          setLastMessageId(aiMessageId)
        }
      } catch (error) {
        console.error("Error getting new response:", error);
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== tempTypingId),
          {
            id: `error-${Date.now()}`,
            content: "Failed to get a new response. Please try again.",
            isUser: false,
          }
        ]);
      } finally {
        setIsResponding(false);
        setTimeout(scrollToBottom, 100);
      }
    } else {
      try {
        await axios.put(`${BASE_URL}/chat/edit/${messageId.replace('ai-', '')}`, {
          content: newContent,
        });
      } catch (error) {
        console.error("Error editing AI message:", error);
      }
    }
  };



   // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const adjustHeight = () => {
      textarea.style.height = 'auto'
      const newRows = Math.min(3, Math.max(1, Math.ceil(textarea.scrollHeight / 24)))
      setTextareaRows(newRows)
      textarea.style.height = `${Math.min(textarea.scrollHeight, 24 * 3)}px`
    }

    textarea.addEventListener('input', adjustHeight)
    return () => textarea.removeEventListener('input', adjustHeight)
  }, [])

  // Reset textarea height when question is cleared
  useEffect(() => {
    if (question === '' && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      setTextareaRows(1)
    }
  }, [question])

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setSelectedButton("attach")
    }
  }

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const handleQuestionSubmit = async (e) => {
    e.preventDefault()
    if ((question.trim() === "" && !selectedFile) || isResponding) return

    const userMessageId = `user-${Date.now()}`
    const newUserMessage = {
      id: userMessageId,
      content: question + (selectedFile ? `\n\nAttached file: ${selectedFile.name}` : ""),
      isUser: true,
    }

    setMessages((prev) => [...prev, newUserMessage])
    setQuestion("")
    setTextareaRows(1)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setIsResponding(true)

    // Show uploading state if there's a file
    if (selectedFile) {
      setFileUploadState('uploading')
      // Simulate file upload delay (in real app, this would be an actual upload)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setFileUploadState('parsing')
      await new Promise(resolve => setTimeout(resolve, 1500))
      setFileUploadState(null)
      setSelectedFile(null)
    }

    const tempTypingId = `ai-typing-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: tempTypingId,
        content: "", // Empty content that will be filled by typing effect
        isUser: false,
        isTyping: true,
      },
    ])

    // Replace the axios.post section in handleQuestionSubmit with this:
try {
  let requestData;
  let headers = {};
  
  if (selectedFile) {
    // Using FormData for file uploads
    const formData = new FormData();
    formData.append('chatID', chatID || '');
    formData.append('user_email', email || "Guest");
    formData.append('question', question);
    formData.append('model', model);
    formData.append('file', selectedFile);
    
    requestData = formData;
    headers = {
      'Content-Type': 'multipart/form-data'
    };
  } else {
    // Using JSON for regular requests
    requestData = {
      chatID: chatID || '',
      user_email: email || "Guest",
      question: question,
      model: model
    };
  }
  
  const response = await axios.post(
    `${BASE_URL}/chat/ask`, 
    requestData,
    { headers }
  );

  // const response = await axios.post(
  //   "${BASE_URL}/chat/ask", 
  //   requestData,
  //   { headers }
  // );
  
  if (response.data?.response || response.data?.data?.response) {
    const aiResponse = response.data.response || response.data.data.response;
    setMessages(prev => prev.map(msg => 
      msg.id === tempTypingId 
        ? { ...msg, content: aiResponse, isTyping: false, isEdited: false }
        : msg
    ));
    setLastMessageId(tempTypingId);
  }
} catch (error) {
  console.error("Error:", error);
  setMessages(prev => prev.map(msg => 
    msg.id === tempTypingId 
      ? { 
          ...msg, 
          content: "Failed to send message. Please try again.",
          isTyping: false,
          isEdited: true 
        }
      : msg
  ));
} finally {
      setIsResponding(false)
      setTimeout(scrollToBottom, 100)
    }
  }

  const handleModelSelect = (selectedModel) => {
    setModel(selectedModel)
    setShowModelModal(false)
  }

  const getModelDisplayName = () => {
    switch(model) {
      case 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free':
        return 'DeepSeek R1'
      case 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free':
        return 'Llama 3.3 Turbo'
      case 'meta-llama/Llama-Vision-Free':
        return 'Llama Vision'
      default:
        return 'Llama 3.3 Turbo'
    }
  }

 return (
  <div className="flex flex-col h-screen bg-white">
    {/* Chat area */}
    <div
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-2 pb-32 md:p-4 md:pb-36 custom-scrollbar"
      style={{ scrollBehavior: "smooth" }}
    >
      <div className="max-w-xl md:max-w-3xl mx-auto">
        {!isDataFetched && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 py-16 md:py-20">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
              <img
                src="../../png/logo-gorilla.png"
                alt="Avatar"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full"
              />
            </div>
            <p className="text-gray-600 text-base md:text-lg font-medium">How can I help you today?</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isUser={message.isUser}
                onEdit={handleEditMessage}
                isNewMessage={message.id === lastMessageId}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>

    {/* User Input Area - Fixed at bottom */}
    <div className="fixed bottom-0 left-0 right-0 z-10 p-3 md:p-4">
      <div className="max-w-xl md:max-w-3xl mx-auto">
        <form onSubmit={handleQuestionSubmit} className="flex flex-col space-y-3 md:space-y-4 bg-white rounded-xl p-3 md:p-4 shadow-lg">
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none overflow-hidden text-sm md:text-base"
            placeholder="Ask whatever you want..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={textareaRows}
            maxLength={1000}
            style={{ minHeight: '24px' }}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 md:space-x-4">
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

            <div className="flex justify-end space-x-2 md:space-x-4">
              

              {/* Send Button */}
              <button
                type="submit"
                className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white w-10 h-10 md:w-12 md:h-12 rounded-full hover:from-purple-700 hover:to-blue-600 transition shadow-md"
                disabled={isResponding}
              >
                {isResponding ? (
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full animate-pulse"></div>
                ) : (
                  <Send size={16} className="md:w-5 md:h-5" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    {/* Model Selection Modal */}
    <ModelSelectionModal
      isOpen={showModelModal}
      onClose={() => setShowModelModal(false)}
      selectedModel={model}
      onSelectModel={handleModelSelect}
    />

    {/* Scroll to bottom button */}
    {showScrollButton && (
      <div className="fixed right-4 md:right-8 bottom-24 md:bottom-28 z-20">
        <ScrollToBottomButton onClick={scrollToBottom} />
      </div>
    )}
  </div>
)
}
