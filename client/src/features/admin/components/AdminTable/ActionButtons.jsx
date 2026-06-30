import React from "react";

export default function ActionButtons({ actions }) {
  return (
    <div className="flex items-center justify-end gap-2 text-gray-400">
      {actions.map((act, i) => (
        <button 
          key={i} 
          onClick={act.onClick} 
          className={`p-1.5 rounded transition-colors ${act.className || 'hover:bg-gray-100 hover:text-blue-600'}`}
          title={act.title}
        >
          {act.icon}
        </button>
      ))}
    </div>
  );
}
