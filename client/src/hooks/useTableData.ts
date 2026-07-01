import { useSearch } from "./useSearch";
import { useSorting } from "./useSorting";
import { usePagination } from "./usePagination";

export function useTableData({
  data = [],
  searchFields = [],
  initialSortBy = "",
  initialSortOrder = "asc",
  itemsPerPage = 10
}) {
  const search = useSearch(data, searchFields);
  const sorting = useSorting(search.filteredData, initialSortBy, initialSortOrder);
  const pagination = usePagination(sorting.sortedData, itemsPerPage);

  return {
    ...search,
    ...sorting,
    ...pagination
  };
}
