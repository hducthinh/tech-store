import React from "react";

export default function AdminTableBody({ columns, data }) {
  return (
    <tbody className="divide-y divide-gray-100">
      {data.map((row, rowIndex) => (
        <tr key={row._id || rowIndex} className="hover:bg-gray-50/50 transition-colors">
          {columns.map((col, colIndex) => (
            <td 
              key={col.key || colIndex} 
              className={`px-6 py-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
            >
              {col.render ? col.render(row) : row[col.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
