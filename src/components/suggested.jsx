export default function SuggestionCard({ Icon, text }) {
    return (
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm">{text}</p>
        </div>
      </div>
    );
  }