"use client"

import { useState, useRef, useEffect } from "react"
import { Plus,Send, Globe, Edit, Copy, CheckCheck, ThumbsUp, ThumbsDown, Paperclip, Sparkles, MessageCircle } from "lucide-react"
import { marked } from "marked"
import axios from "axios"

import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
const TOGETHER_AI_API_KEY = import.meta.env.VITE_TOGETHER_AI_API_KEY
const DEFAULT_MODEL = 'meta-llama/Llama-Vision-Free';
// const DEFAULT_MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';


async function generateText(prompt, model, options = {}) {
  try {
    if (!prompt || typeof prompt !== 'string') throw new Error('Valid prompt is required');
    const modelToUse = model || DEFAULT_MODEL;
    const requestOptions = {
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1024,
      stream: !!options.stream,
      ...options.additionalParams
    };
    const apiUrl = "https://api.together.xyz/v1/chat/completions";
    const response = await axios({
      method: 'POST',
      url: apiUrl,
      headers: {
        'Authorization': `Bearer ${TOGETHER_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        model: modelToUse,
        messages: [{ role: "user", content: prompt }],
        ...requestOptions
      },
      responseType: options.stream ? 'stream' : 'json',
      timeout: 30000,
    });
    if (options.stream) return response.data;
    return response.data.choices?.[0]?.message?.content || "No response generated";
  } catch (error) {
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.error?.message || error.message;
    if (statusCode === 429) throw new Error('Rate limit exceeded. Please check your network and try again later.');
    if (statusCode === 401 || statusCode === 403) throw new Error('API authentication error. Please check your API key.');
    if (statusCode >= 500) throw new Error('Together AI service is currently unavailable. Please try again later.');
    throw new Error(`AI processing error: ${errorMessage}`);
  }
}

const translateText = async (text, sourceLang, targetLang) => {
  const url = 'https://google-translator9.p.rapidapi.com/v2';
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': 'd9792031b0msh2f79f6fcf79c333p1790b2jsn12ebf9a28b1b',
      'x-rapidapi-host': 'google-translator9.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    })
  };
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

const VoiceAgent = () => {
  // Core state
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [inputText, setInputText] = useState("")
  const [isConnected, setIsConnected] = useState(true)
  const [hasGreeted, setHasGreeted] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [showConversation, setShowConversation] = useState(false)
  const [messages, setMessages] = useState([]) // {role: "user"|"bot", content: string}

  const [uploadedText, setUploadedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePromptMode, setFilePromptMode] = useState(""); // "summary" or "qna"
  const [userFileQuestion, setUserFileQuestion] = useState("");

  // Refs
  const textInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const speechSynthesisRef = useRef(null)

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
  ]

  // Initial greeting
  useEffect(() => {
    if (!hasGreeted && isConnected) {
      setTimeout(() => {
        const greeting =
          selectedLanguage === "en"
            ? "Hello! How are you doing today? I'm your kizachat AI assistant, ready to help you with anything you need."
            : "Muraho! Amakuru yawe? Ndi umufasha wa kizachat AI, niteguye kugufasha ibintu byose ukeneye."

        speakText(greeting)
        setHasGreeted(true)
      }, 1000)
    }
  }, [isConnected, hasGreeted, selectedLanguage])

  const speakText = async (text) => {
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported")
      return
    }

    window.speechSynthesis.cancel()
    setIsSpeaking(true)

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.volume = 0.8
      utterance.pitch = 1
      utterance.lang = selectedLanguage === "en" ? "en-US" : "rw-RW"

      utterance.onend = () => {
        setIsSpeaking(false)
        // Auto start listening after AI finishes speaking
        setTimeout(() => {
          startListening()
        }, 500)
      }

      utterance.onerror = (error) => {
        console.error("Speech synthesis error:", error)
        setIsSpeaking(false)
      }

      speechSynthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("Speech synthesis error:", error)
      setIsSpeaking(false)
    }
  }

  // Add message to conversation
  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content }])
  }

  // Update sendTextMessage and handleAIResponse to store messages
  const sendTextMessage = async () => {
    if (inputText.trim()) {
      const message = inputText.trim()
      addMessage("user", message)
      setInputText("")
      await handleAIResponse(message)
    }
  }

  const handleAIResponse = async (userMessage = "") => {
    try {
      setIsSpeaking(true);

      // Get AI response in English
      const aiResponseEn = await generateText(
        userMessage,
        DEFAULT_MODEL,
        { temperature: 0.7, max_tokens: 1024 }
      );

      let finalResponse = aiResponseEn;

      // Only translate if needed
      if (selectedLanguage === "fr") {
        finalResponse = await translateText(aiResponseEn, "en", "fr");
      } else if (selectedLanguage === "rw") {
        finalResponse = await translateText(aiResponseEn, "en", "rw");
      } else if (selectedLanguage !== "en") {
        // For any other language, translate to Kinyarwanda
        finalResponse = await translateText(aiResponseEn, "en", "rw");
      }

      // Add and speak immediately
      addMessage("bot", finalResponse);
      speakText(finalResponse);
    } catch (error) {
      console.error("Error handling AI response:", error);
      const errorMessage =
        selectedLanguage === "en"
          ? error.message || "I encountered an error, but I'm still here to help you!"
          : "Nahuye n'ikosa, ariko nkiri hano kugufasha!";
      addMessage("bot", errorMessage);
      speakText(errorMessage);
    }
  }

  // Speech recognition setup
  useEffect(() => {
    if (isListening && "webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = selectedLanguage === "en" ? "en-US" : "rw-RW"

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript
        if (event.results[event.results.length - 1].isFinal) {
          setIsListening(false)
          handleAIResponse(transcript)
        }
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
      recognitionRef.current = recognition

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop()
          recognitionRef.current = null
        }
      }
    }
  }, [isListening, selectedLanguage])

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      const errorMessage =
        selectedLanguage === "en"
          ? "Speech recognition not supported in this browser"
          : "Kwumva ijwi ntibikozwe muri iyi mushakisha"
      alert(errorMessage)
      return
    }
    setIsListening(true)
  }

  const stopListening = () => {
    setIsListening(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const interruptSpeaking = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setTimeout(() => {
        startListening()
      }, 300)
    }
  }

  const handleKeyPress = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendTextMessage();
  }
};


  // Message bubble component
  const MessageBubble = ({ msg }) => {
    const isUser = msg.role === "user"
    const content = isUser
      ? msg.content
      : <span dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />

    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full my-2 px-2 md:px-4`}>
        {!isUser ? (
          <div className="mr-2 md:mr-3 flex-shrink-0">
            <img
              src="../../png/logo-gorilla.png"
              alt="Avatar"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full"
            />
          </div>
        ) : (
          <div className="ml-2 md:ml-3 flex-shrink-0">
            <img
              src="../../png/user-avatar.png" // <-- Add a user avatar if you want
              alt="User"
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
            <div className={`markdown-content text-sm md:text-base ${isUser ? "text-white" : "text-gray-800"}`}>
              {content}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }
      setUploadedText(text);
    } else if (file.type.startsWith("text/")) {
      const reader = new FileReader();
      reader.onload = (event) => setUploadedText(event.target.result);
      reader.readAsText(file);
    } else {
      alert("Please upload a text or PDF file.");
      setUploadedText("");
      setFileName("");
    }
    setFilePromptMode(""); // Reset mode on new upload
    setUserFileQuestion("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 pb-24 md:pb-32">
      {/* Toggle Button */}
      {/* <div className="fixed top-4 left-4 z-20">
        <button
          onClick={() => setShowConversation((v) => !v)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          {showConversation ? "View Agent" : "View Conversation"}
        </button>
      </div> */}

      {/* Conversation View */}
      {showConversation ? (
        <div className="w-full max-w-2xl mx-auto mt-16 mb-32">
          <div className="flex flex-col">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">No conversation yet.</div>
            ) : (
              messages.map((msg, idx) => <MessageBubble key={idx} msg={msg} />)
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Language Selector */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
              >
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {languages.find((lang) => lang.code === selectedLanguage)?.flag}{" "}
                  {languages.find((lang) => lang.code === selectedLanguage)?.name}
                </span>
              </button>

              {showLanguageDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 min-w-[160px]">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code)
                        setShowLanguageDropdown(false)
                        setHasGreeted(false) // Reset greeting for new language
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedLanguage === lang.code ? "bg-blue-50 text-blue-700" : "text-gray-700"
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl mx-auto">
            {/* Central Circle */}
            <div className="relative mb-8 sm:mb-12">
              <div
                className={`relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full transition-all duration-500 cursor-pointer border-4 ${
                  isSpeaking
                    ? "bg-gradient-conic from-blue-400 via-teal-400 to-blue-600 border-white/50"
                    : isListening
                      ? "bg-gradient-conic from-green-400 via-blue-400 to-teal-500 animate-pulse border-white/50"
                      : "bg-gradient-conic from-gray-300 via-gray-400 to-gray-500 border-gray-400"
                }`}
                onClick={isSpeaking ? interruptSpeaking : isListening ? stopListening : startListening}
              >
                {/* Inner circle with radial pattern */}
                <div className="absolute inset-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center px-4">
                    {isSpeaking ? (
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg">
                        <span className="text-gray-800 font-medium text-sm sm:text-base">
                          {selectedLanguage === "en" ? "Talk to interrupt" : "Vuga ukandagize"}
                        </span>
                      </div>
                    ) : isListening ? (
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg">
                        <span className="text-gray-800 font-medium text-sm sm:text-base">
                          {selectedLanguage === "en" ? "Listening..." : "Ndumva..."}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg">
                        <span className="text-gray-800 font-medium text-sm sm:text-base">
                          {selectedLanguage === "en" ? "Tap to speak" : "Kanda uvuge"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Speaking waves animation */}
                {isSpeaking && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex space-x-1">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-white/60 rounded-full animate-bounce"
                          style={{
                            height: `${Math.random() * 20 + 10}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: "0.6s",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Pulsing rings for listening state only */}
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
                    <div className="absolute -inset-2 rounded-full border-2 border-white/20 animate-pulse"></div>
                  </>
                )}
              </div>
            </div>

            {/* Status Text */}
            {/* <div className="text-center mb-8 sm:mb-12 px-4">
          <p className="text-gray-600 text-sm sm:text-base">
            {selectedLanguage === "en"
              ? "In-development calls are 50% off."
              : "Amahamagara yo mu iterambere agabanuka 50%."}
          </p>
        </div> */}
          </div>

          {/* Fixed Bottom Input */}
          <div className="fixed bottom-0 left-0 right-0 z-10 p-3 md:p-4">
            <div className="max-w-md md:max-w-3xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendTextMessage()
                }}
                className="flex flex-col space-y-3 md:space-y-4 bg-white rounded-xl p-3 md:p-4 shadow-lg"
              >
                {/* Show file name and icon at top if file is uploaded */}
                {uploadedText && fileName && (
                  <div className="flex items-center gap-2 mb-2 px-1 py-1 bg-blue-50 rounded">
                    <Paperclip size={18} className="text-blue-700" />
                    <span className="text-xs text-blue-700 font-medium truncate">{fileName}</span>
                  </div>
                )}

                {/* Textarea for both summary and Q&A */}
                <textarea
                  ref={textInputRef}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none overflow-hidden text-sm md:text-base pb-2 pt-2"
                  placeholder={
                    uploadedText
                      ? "Type your question about the file, or leave blank to summarize..."
                      : selectedLanguage === "en"
                        ? "Ask whatever you want..."
                        : "Baza icyo ushaka..."
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={1}
                  maxLength={1000}
                  style={{ minHeight: "48px" }}
                />

                {/* Bottom row: upload left, action right */}
                <div className="flex items-center justify-between mt-1">
                  {/* File Upload Button - left */}
                  <label className="cursor-pointer flex items-center px-3 py-1 rounded-full transition text-xs md:text-sm bg-gray-100 text-gray-700 ml-2">
                    <Plus size={18} />
                    <span className="text-xs font-medium">Upload File</span>
                    <input
                      type="file"
                      accept=".txt,.md,.csv,.json,.log,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Action Buttons - right */}
                  {uploadedText ? (
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow hover:from-blue-600 hover:to-blue-800 transition-all"
                      onClick={async () => {
                        addMessage("user", `[File uploaded: ${fileName}]`);
                        let prompt = inputText.trim()
                          ? `Given the following file content:\n\n${uploadedText}\n\nAnswer this question: ${inputText.trim()}`
                          : `Summarize the following file content:\n\n${uploadedText}`;
                        addMessage("user", prompt);
                        await handleAIResponse(prompt);
                        setUploadedText("");
                        setFileName("");
                        setInputText("");
                      }}
                    >
                      {inputText.trim() ? (
                        <>
                          <MessageCircle size={16} /> Ask AI
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} /> Summarize
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white w-10 h-10 md:w-12 md:h-12 rounded-full hover:from-purple-700 hover:to-blue-600 transition shadow-md"
                      disabled={!inputText.trim()}
                      aria-label="Send"
                    >
                      <Send size={20} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <style jsx>{`
            .bg-gradient-conic {
              background: conic-gradient(var(--tw-gradient-stops));
            }
          `}</style>
        </>
      )}
    </div>
  )
}

export default VoiceAgent