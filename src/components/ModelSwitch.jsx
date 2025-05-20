import React, { useState } from "react";

export default function ModelSwitch({ onSwitch }) {
  const [selectedModel, setSelectedModel] = useState("DeepSeek R1");

  const handleSwitch = (model) => {
    setSelectedModel(model);
    onSwitch(model);
  };

  return (
    <div className="flex justify-center items-center space-x-4 mb-6">
      <button
        onClick={() => handleSwitch("DeepSeek R1")}
        className={`px-4 py-2 rounded-lg ${
          selectedModel === "DeepSeek R1"
            ? "bg-purple-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        DeepSeek R1
      </button>
      <button
        onClick={() => handleSwitch("GPT-4o")}
        className={`px-4 py-2 rounded-lg ${
          selectedModel === "GPT-4o"
            ? "bg-purple-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        GPT-4o
      </button>
    </div>
  );
}