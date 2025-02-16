"use client"

export default function RecentChats({ chats }) {
  return (
    <div className="w-full">
      <ul className="space-y-2">
        {chats.map((chat, index) => (
          <li key={index} className="truncate text-sm text-gray-600">
            {chat}
          </li>
        ))}
      </ul>
      <button className="mt-2 w-full text-xs text-gray-500">
        Load More
      </button>
    </div>
  )
}


