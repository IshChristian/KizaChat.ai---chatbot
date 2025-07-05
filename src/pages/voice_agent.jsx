"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Globe } from "lucide-react"

const VoiceAgent = () => {
  // Core state
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [inputText, setInputText] = useState("")
  const [isConnected, setIsConnected] = useState(true)
  const [hasGreeted, setHasGreeted] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

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
            ? "Hello! How are you doing today? I'm your AI assistant, ready to help you with anything you need."
            : "Muraho! Amakuru yawe? Ndi umufasha wa AI, niteguye kugufasha ibintu byose ukeneye."

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

  const handleAIResponse = async (userMessage = "") => {
    try {
      setIsSpeaking(true)

      // Call RapidAPI ChatGPT endpoint
      const response = await fetch("https://chat-gpt-all-models.p.rapidapi.com/chat/completions", {
        method: "POST",
        headers: {
          "x-rapidapi-key": "d9792031b0msh2f79f6fcf79c333p1790b2jsn12ebf9a28b1b",
          "x-rapidapi-host": "chat-gpt-all-models.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                selectedLanguage === "en"
                  ? "You are a helpful AI assistant. Keep responses conversational and concise."
                  : "Uri umufasha wa AI ufite ubushobozi. Komeza ibisubizo mu buryo bwo kuganira kandi buke.",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const aiResponse =
          result.choices?.[0]?.message?.content ||
          (selectedLanguage === "en"
            ? "I didn't get a response. Please try again."
            : "Sinabonye igisubizo. Ongera ugerageze.")

        speakText(aiResponse)
      } else {
        const errorMessage =
          selectedLanguage === "en"
            ? "I'm having trouble generating a response right now."
            : "Mfite ikibazo cyo gutanga igisubizo ubu."
        speakText(errorMessage)
      }
    } catch (error) {
      console.error("Error handling AI response:", error)
      const errorMessage =
        selectedLanguage === "en"
          ? "I encountered an error, but I'm still here to help you!"
          : "Nahuye n'ikosa, ariko nkiri hano kugufasha!"
      speakText(errorMessage)
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

  const sendTextMessage = async () => {
    if (inputText.trim()) {
      const message = inputText.trim()
      setInputText("")
      await handleAIResponse(message)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendTextMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 pb-24 md:pb-32">
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
            <textarea
              ref={textInputRef}
              className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none overflow-hidden text-sm md:text-base"
              placeholder={selectedLanguage === "en" ? "Ask whatever you want..." : "Baza icyo ushaka..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              maxLength={1000}
              style={{ minHeight: "24px" }}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white w-10 h-10 md:w-12 md:h-12 rounded-full hover:from-purple-700 hover:to-blue-600 transition shadow-md"
                disabled={!inputText.trim()}
              >
                {!inputText.trim() ? (
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full animate-pulse"></div>
                ) : (
                  <Send size={16} className="md:w-5 md:h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-conic {
          background: conic-gradient(var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  )
}

export default VoiceAgent