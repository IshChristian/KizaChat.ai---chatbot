"use client"; // Indicating this is a client-side component


function SidebarButton({ Icon, name, isExpanded }) {
  return (
    <button
      className="w-full justify-start text-gray-600 hover:bg-gray-200 transition-all duration-300 ease-in-out flex items-center" // flex for icon and text alignment
    >
      <Icon className="h-5 w-5" /> {/* Icon size */}
      {isExpanded && <span className="ml-2 text-sm">{name}</span>} {/* Show name when expanded */}
    </button>
  );
}

export default SidebarButton;
