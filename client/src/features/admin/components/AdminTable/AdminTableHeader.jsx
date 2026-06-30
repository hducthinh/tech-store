import React from "react";
import SortIcon from "./SortIcon";

export default function AdminTableHeader({ columns, sortBy, sortOrder, onSort }) {
  return (
    <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
      <tr>
        {columns.map((col, idx) => (
          <th 
            key={col.key || idx} 
            className={`px-6 py-4 font-semibold uppercase text-xs ${col.sortable ? 'cursor-pointer group hover:bg-gray-100 transition-colors' : ''} ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
            onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
          >
            {col.label} {col.sortable && <SortIcon active={sortBy === col.key} direction={sortOrder} />}
          </th>
        ))}
      </tr>
    </thead>
  );
}
