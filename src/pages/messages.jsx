"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import { Send, ThumbsUp, ThumbsDown, Copy, Edit, Check, ArrowDown, CheckCheck } from "lucide-react"
import DOMPurify from "dompurify"
import { marked } from "marked"
import axios from "axios"
// import Image from "next/image"

const markdownStyles = `
.markdown-content {
  line-height: 2;
  font-size: 1.125rem;
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
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.25rem 0;
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
    font-size: 1.25rem;
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
  return DOMPurify.sanitize(marked(content), {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "code", "pre", "ul", "ol", "li", "blockquote"],
    ALLOWED_ATTR: [],
  })
}

const ChatMessage = ({ message, isUser, onEdit, onSendMessage }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)
  const [isCopied, setIsCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const { id: chatID } = useParams()

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
    onEdit(message.id, editedContent)
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
    <div className={`flex ${isUser ? "justify-end" : "justify-start items-start"} my-4 ml-8`}>
      {!isUser && (
        <div className="mr-3">
          <img src="/png/logo-gorilla.png" alt="AI Assistant" width={40} height={40} className="rounded-full" />
        </div>
      )}
      <div className={`${isUser ? "max-w-2xl" : "w-full"}`}>
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
          <div className={`p-4 ${isUser ? "bg-gray-100" : "mb-8"} rounded-xl`}>
            <div
              className="markdown-content"
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
    const handleScroll = () => {
      if (!chatContainerRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom)
    }

    chatContainer?.addEventListener("scroll", handleScroll)
    return () => chatContainer?.removeEventListener("scroll", handleScroll)
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
    if (e && e.preventDefault) e.preventDefault(); // ✅ Prevent default if event exists
  
    if (!newContent || typeof newContent !== "string" || newContent.trim() === "" || isResponding) return; // ✅ Ensure newContent is valid
  
    try {
      await axios.put(`https://kizachat-server.onrender.com/api/chat/edit/${messageId}`, {
        content: newContent,
      });
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg))
      );
    } catch (error) {
      console.error("Error editing message:", error);
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

    // Add temporary typing message
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

      // Remove typing message
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
      // Remove typing message
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

    // Reset height before calculating new height
    e.target.style.height = "56px"
    const newHeight = Math.min(e.target.scrollHeight, 200)
    e.target.style.height = value.trim() ? `${newHeight}px` : "56px"
  }

  return (
    <div className="flex flex-col bg-white relative" role="main">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pb-24 custom-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {!isDataFetched && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <img src="/png/white-gorilla.png" alt="AI Assistant" width={80} height={80} className="rounded-full" />
            <p className="text-gray-600 text-xl font-medium">Welcome! Type a message to start chatting.</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isUser={message.isUser}
              onEdit={handleEditMessage}
              onSendMessage={handleSendMessage}
            />
          ))
        )}
        {isResponding && <TypingAnimation />}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
        {showScrollButton && <ScrollToBottomButton onClick={scrollToBottom} />}
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
  <input
    type="text"
    value={inputMessage}
    onChange={handleInputChange}
    placeholder="Type your message..."
    className="w-full pl-4 pr-24 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none"
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
    className={`absolute right-2 top-2 rounded-xl ${
      isResponding ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
    } p-3 text-white transition-colors focus:outline-none`}
    disabled={isResponding || !inputMessage.trim()}
    aria-label={isResponding ? "Sending message..." : "Send message"}
  >
    <Send className="h-5 w-5" />
  </button>
</form>
<span className="left-4 mt-4 text-xs text-gray-500" aria-label="Character count">
    {inputMessage.length}/1000
  </span>
      </div>
    </div>
  )
}

