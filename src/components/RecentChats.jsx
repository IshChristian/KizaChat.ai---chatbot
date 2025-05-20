import React from "react";

export default function RecentChats({ chats }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Recent Chats</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chats.map((chat, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h4 className="font-medium text-gray-800">{chat.title}</h4>
            <p className="text-sm text-gray-600">{chat.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}