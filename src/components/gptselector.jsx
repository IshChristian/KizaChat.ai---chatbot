"use client"

import { useState } from "react"
import { X, Lock } from "lucide-react"

const gptOptions = [
  { name: "KizaChat-1", default: true, locked: false },
  { name: "KizaChat-2", default: false, locked: true },
  { name: "KizaChat-3", default: false, locked: true },
]

const GptSelectorModal = ({ onClose }) => {
  const [selectedGpt, setSelectedGpt] = useState("Gemini")

  const handleSelectGpt = (gptName) => {
    const gpt = gptOptions.find((g) => g.name === gptName)
    if (gpt && !gpt.locked) {
      setSelectedGpt(gptName)
    } else {
      // Show upgrade prompt
      alert("This GPT is locked. Please upgrade your plan to access it.")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Select GPT</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-4">
            {gptOptions.map((gpt) => (
              <button
                key={gpt.name}
                onClick={() => handleSelectGpt(gpt.name)}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  selectedGpt === gpt.name ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                } ${gpt.locked ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
              >
                <div className="flex justify-between items-center">
                  <span>{gpt.name}</span>
                  {gpt.default && <span className="text-xs text-gray-500">(Default)</span>}
                  {gpt.locked && <Lock className="h-5 w-5 text-gray-400" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GptSelectorModal

