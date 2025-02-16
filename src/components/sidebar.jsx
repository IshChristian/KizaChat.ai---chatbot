import { X, Plus, Search, Download, Clock, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-4">
      <button className="rounded-lg p-2 hover:bg-gray-200">
        <X className="h-5 w-5" />
      </button>
      <button className="rounded-lg p-2 hover:bg-gray-200">
        <Plus className="h-5 w-5" />
      </button>
      <button className="rounded-lg p-2 hover:bg-gray-200">
        <Search className="h-5 w-5" />
      </button>
      <button className="rounded-lg p-2 hover:bg-gray-200">
        <Download className="h-5 w-5" />
      </button>
      <button className="rounded-lg p-2 hover:bg-gray-200">
        <Clock className="h-5 w-5" />
      </button>
      <div className="flex-grow" />
      <button className="rounded-lg p-2 hover:bg-gray-200">
        <Settings className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Sidebar;