import React from "react";
import AdminTableHeader from "./AdminTableHeader";
import AdminTableBody from "./AdminTableBody";
import AdminPagination from "./AdminPagination";

export default function AdminTable({ 
  columns, data,
  sortBy, sortOrder, onSort, 
  currentPage, totalPages, onPageChange 
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <AdminTableHeader 
          columns={columns} 
          sortBy={sortBy} 
          sortOrder={sortOrder} 
          onSort={onSort} 
        />
        <AdminTableBody 
          columns={columns} 
          data={data} 
        />
      </table>
      {totalPages > 1 && (
        <AdminPagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  );
}
