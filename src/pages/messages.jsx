"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import { Send, ThumbsUp, ThumbsDown, Copy, Edit, Check, ArrowDown, CheckCheck, Code } from "lucide-react"
import DOMPurify from "dompurify"
import { marked } from "marked"
import axios from "axios"

const markdownStyles = `
.markdown-content {
  line-height: 2;
  font-size: 1rem; /* Adjusted font size */
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
  white-space: pre-wrap; /* Ensure code wraps on smaller screens */
  word-wrap: break-word; /* Ensure long lines break */
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

@media (max-width: 640px) {
  .copy-code-button {
    padding: 0.2rem 0.35rem;
    right: 0.35rem;
    bottom: 0.35rem;
  }
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
.copy-code-button {
  position: absolute;
  right: 1px;
  bottom: 1px;
  padding: 0.25rem 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  color: #e2e8f0;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1px;
  transition: all 0.2s;
}
.copy-code-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
.copy-code-button.copied {
  background-color: #10b981;
}

.focus-visible-ring:focus-visible {
  outline: 2px solid #818cf8 !important;
  outline-offset: 2px;
}

@media (min-width: 768px) {
  .markdown-content {
    font-size: 1.125rem; /* Adjusted font size */
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
`

const TypingAnimation = () => (
  <div className="flex items-center space-x-2 p-4" role="status" aria-label="AI is typing">
    <div className="w-2.5 h-2.5 bg-gray-600 rounded-full animate-bounce"></div>
    <div className="w-2.5 h-2.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
    <div className="w-2.5 h-2.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
  </div>
)

const ScrollToBottomButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 -top-16 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 focus-visible-ring"
    aria-label="Scroll to bottom"
  >
    <ArrowDown size={24} className="text-gray-600" />
  </button>
)

const formatMessage = (content) => {
  const renderer = new marked.Renderer();
  
  // Customize code block rendering to add copy button
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
      
      highlightedCode = highlightedCode.replace(keywordPattern, '<span style="color: #9333ea; font-weight: bold;">$1</span>'); /* Purple color */
      
      highlightedCode = highlightedCode.replace(/(["'])(.*?)\1/g, '<span style="color: #0A3069;">$1$2$1</span>');
    } else if (langToUse === 'javascript' || langToUse === 'js') {
      const jsKeywords = ['var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch', 'finally', 'new', 'delete', 'typeof', 'instanceof', 'void', 'this', 'super', 'class', 'extends', 'import', 'export', 'from', 'as', 'async', 'await', 'true', 'false', 'null', 'undefined'];
      
      const keywordPattern = new RegExp('\\b(' + jsKeywords.join('|') + ')\\b', 'g');
      highlightedCode = highlightedCode.replace(keywordPattern, '<span style="color: #9333ea; font-weight: bold;">$1</span>'); /* Purple color */
      
      highlightedCode = highlightedCode.replace(/(["'`])(.*?)\1/g, '<span style="color: #0A3069;">$1$2$1</span>');
    } else if (langToUse === 'python') {
      const pythonKeywords = ['and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'];
      
      const keywordPattern = new RegExp('\\b(' + pythonKeywords.join('|') + ')\\b', 'g');
      highlightedCode = highlightedCode.replace(keywordPattern, '<span style="color: #9333ea; font-weight: bold;">$1</span>'); /* Purple color */
      
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
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "code", "pre", "ul", "ol", "li", "blockquote", "button", "svg", "rect", "path"],
    ALLOWED_ATTR: ["class", "data-code", "width", "height", "viewBox", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "d", "x", "y", "rx", "ry"],
  });
}

const ChatMessage = ({ message, isUser, onEdit, onSendMessage }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)
  const [isCopied, setIsCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const { id: chatID } = useParams()
  const messageRef = useRef(null)

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
    <div className={`flex ${isUser ? "justify-end" : "justify-start items-start"} w-full my-4`}>
      {!isUser && (
        <div className="mr-3 flex-shrink-0 hidden lg:block">
          <img src="/png/logo-gorilla.png" alt="AI Assistant" width={30} height={30} className="rounded-full ml-1" /> {/* Adjusted size and added ml-1 */}
        </div>
      )}
      <div className={`${isUser ? "max-w-2xl" : "max-w-full md:max-w-3xl"} w-full overflow-hidden`}>
        {isEditing ? (
          <div className="relative">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-purple-600 focus:outline-none resize-none"
              rows={4}
              aria-label="Edit message"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSaveEdit()
                }
              }}
            />
            <button
              onClick={handleSaveEdit}
              className="absolute right-2 top-2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none"
              aria-label="Save edit"
            >
              <Check size={20} />
            </button>
          </div>
        ) : message.isTyping ? (
          <TypingAnimation />
        ) : (
          <div className={`p-2 ${isUser ? "bg-gray-100 mt-5" : "mb-8"} rounded-xl`}>
            <div
              ref={messageRef}
              className="markdown-content overflow-x-auto"
              dangerouslySetInnerHTML={{
                __html: formatMessage(message.content),
              }}
            />
            <div className="flex justify-start space-x-3 mt-3">
              <button
                onClick={handleCopy}
                className="p-2 text-gray-600 hover:text-purple-600 rounded-lg focus:outline-none transition-colors"
                aria-label={isCopied ? "Copied to clipboard" : "Copy message"}
              >
                {isCopied ? <CheckCheck size={18} className="text-green-600 fill-current" /> : <Copy size={18} />}
              </button>
              {isUser && (
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-600 hover:text-purple-600 rounded-lg focus:outline-none transition-colors"
                  aria-label="Edit message"
                >
                  <Edit size={18} />
                </button>
              )}
              {!isUser && (
                <>
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-lg focus:outline-none transition-colors ${
                      isLiked ? "bg-green-100 text-green-600" : "text-gray-600 hover:text-green-600"
                    }`}
                    aria-label="Like message"
                    aria-pressed={isLiked}
                  >
                    <ThumbsUp size={18} className={isLiked ? "fill-current" : ""} />
                  </button>
                  <button
                    onClick={handleDislike}
                    className={`p-2 rounded-lg focus:outline-none transition-colors ${
                      isDisliked ? "bg-red-100 text-red-600" : "text-gray-600 hover:text-red-600"
                    }`}
                    aria-label="Dislike message"
                    aria-pressed={isDisliked}
                  >
                    <ThumbsDown size={18} className={isDisliked ? "fill-current" : ""} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { id: chatID } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isDataFetched, setIsDataFetched] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isResponding, setIsResponding] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const [email, setEmail] = useState("")

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
      const response = await fetch(`https://kizachat-server.onrender.com/api/chat/users/${chatID}`)
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
        const response = await axios.post("https://kizachat-server.onrender.com/api/chat/ask", {
          chatID,
          user_email: email || "Guest",
          question: newContent,
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
        await axios.put(`https://kizachat-server.onrender.com/api/chat/edit/${messageId.replace('ai-', '')}`, {
          content: newContent,
        });
      } catch (error) {
        console.error("Error editing AI message:", error);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (inputMessage.trim() === "" || isResponding) return

    const userMessageId = `user-${Date.now()}`
    const newUserMessage = {
      id: userMessageId,
      content: inputMessage,
      isUser: true,
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInputMessage("")
    setIsResponding(true)

    const tempTypingId = `typing-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: tempTypingId,
        content: "",
        isUser: false,
        isTyping: true,
      },
    ])

    try {
      const response = await axios.post("https://kizachat-server.onrender.com/api/chat/ask", {
        chatID,
        user_email: email || "Guest",
        question: inputMessage,
      })

      setMessages((prev) => prev.filter((msg) => msg.id !== tempTypingId))

      if (response.data?.response || response.data?.data?.response) {
        const aiResponse = response.data.response || response.data.data.response
        const aiMessageId = `ai-${Date.now()}`
        setMessages((prev) => [
          ...prev,
          {
            id: aiMessageId,
            content: aiResponse,
            isUser: false,
          },
        ])
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => prev.filter((msg) => msg.id !== tempTypingId))
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: "Failed to send message. Please try again.",
          isUser: false,
        },
      ])
    } finally {
      setIsResponding(false)
      setTimeout(scrollToBottom, 100)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputMessage(value)

    e.target.style.height = "56px"
    const newHeight = Math.min(e.target.scrollHeight, 200)
    e.target.style.height = value.trim() ? `${newHeight}px` : "56px"
  }

  return (
    <div className="flex flex-col bg-white relative w-screen overflow-x-hidden" style={{ maxWidth: "100vw" }} role="main">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 custom-scrollbar w-full"
        style={{ scrollBehavior: "smooth", maxWidth: "100%" }}
      >
        {!isDataFetched && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <img src="/png/white-gorilla.png" alt="AI Assistant" width={60} height={60} className="rounded-full" /> {/* Adjusted size */}
            <p className="text-gray-600 text-lg font-medium">Welcome! Type a message to start chatting.</p> {/* Adjusted font size */}
          </div>
        ) : (
          <div className="mx-auto w-full max-w-6xl px-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isUser={message.isUser}
                onEdit={handleEditMessage}
                onSendMessage={handleSendMessage}
              />
            ))}
            {isResponding && <TypingAnimation />}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 w-full">
        {showScrollButton && <ScrollToBottomButton onClick={scrollToBottom} />}
        
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="w-full pl-4 pr-16 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none"
            disabled={isResponding}
            aria-label="Message input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
          />
          
          <button
            type="submit"
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl ${
              isResponding ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
            } p-3 text-white transition-colors focus:outline-none`}
            disabled={isResponding || !inputMessage.trim()}
            aria-label={isResponding ? "Sending message..." : "Send message"}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        <span className="absolute left-4 bottom-1 text-xs text-gray-500" aria-label="Character count">
          {inputMessage.length}/1000
        </span>
        <div className="text-center text-gray-500 text-xs mb-2 mt-2 sm:text-1xl">
          KizaChat can make mistakes. Please verify important information.
        </div>
      </div>
    </div>
  )
}