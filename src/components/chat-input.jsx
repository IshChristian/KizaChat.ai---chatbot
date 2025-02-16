"use client"

import { Paperclip, ImageIcon, Send } from "lucide-react";

export default function ChatInput() {
  return (
    <div className="relative">
      <input 
        type="text" 
        placeholder="Ask whatever you want..." 
        className="w-full pl-4 pr-24 py-6 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:outline-none" 
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg">
          <Paperclip className="h-5 w-5" />
        </button>
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg">
          <ImageIcon className="h-5 w-5" />
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <span className="text-xs text-gray-400">0/1000</span>
        <button type="submit" className="rounded-lg bg-purple-600 hover:bg-purple-700 p-2 text-white">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
