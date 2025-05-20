import React from "react";
import SuggestionCard from "./suggested";

export default function SuggestionSlider({ suggestions, onSuggestionClick }) {
  return (
    <div className="overflow-x-auto flex space-x-4 py-4">
      {suggestions.map((suggestion, index) => (
        <SuggestionCard
          key={index}
          Icon={suggestion.icon}
          text={suggestion.text}
          onClick={() => onSuggestionClick(suggestion.text)}
        />
      ))}
    </div>
  );
}