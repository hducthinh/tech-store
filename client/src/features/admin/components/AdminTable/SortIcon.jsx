import React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export default function SortIcon({ active, direction }) {
  if (!active) return <ChevronsUpDown size={14} className="text-gray-400 ml-1 inline opacity-50 group-hover:opacity-100 transition-opacity" />;
  return direction === "asc" ? <ChevronUp size={14} className="text-blue-600 ml-1 inline" /> : <ChevronDown size={14} className="text-blue-600 ml-1 inline" />;
}
