export interface QueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

// export interface PaginationInfo {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
//   hasNextPage: boolean;
//   hasPrevPage: boolean;
// }

export class QueryParamsHelper {
  static parseQueryParams(url: URL): QueryParams {
    const searchParams = url.searchParams;

    return {
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      order: (searchParams.get("order") as "asc" | "desc") || undefined,
    };
  }

  private static filterData(data: any[], searchTerm: string): any[] {
    if (!searchTerm) return data;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return data.filter((item) => {
      // Search through all string fields in the object
      const searchInObject = (obj: any): boolean => {
        for (const [key, value] of Object.entries(obj)) {
          if (
            typeof value === "string" &&
            value.toLowerCase().includes(lowerSearchTerm)
          ) {
            return true;
          }
          if (
            typeof value === "number" &&
            value.toString().includes(lowerSearchTerm)
          ) {
            return true;
          }
          if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
          ) {
            if (searchInObject(value)) return true;
          }
          if (Array.isArray(value)) {
            for (const arrayItem of value) {
              if (
                typeof arrayItem === "string" &&
                arrayItem.toLowerCase().includes(lowerSearchTerm)
              ) {
                return true;
              }
              if (typeof arrayItem === "object" && arrayItem !== null) {
                if (searchInObject(arrayItem)) return true;
              }
            }
          }
        }
        return false;
      };

      return searchInObject(item);
    });
  }

  private static sortData(
    data: any[],
    sortBy: string,
    order: "asc" | "desc" = "asc"
  ): any[] {
    if (!sortBy) return data;

    return [...data].sort((a, b) => {
      // Support nested field access using dot notation (e.g., "user.name")
      const getNestedValue = (obj: any, path: string): any => {
        return path.split(".").reduce((current, key) => current?.[key], obj);
      };

      const aValue = getNestedValue(a, sortBy);
      const bValue = getNestedValue(b, sortBy);

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === "asc" ? 1 : -1;
      if (bValue == null) return order === "asc" ? -1 : 1;

      // Handle different data types
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue
          .toLowerCase()
          .localeCompare(bValue.toLowerCase());
        return order === "asc" ? comparison : -comparison;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return order === "asc" ? comparison : -comparison;
      }

      // Default string comparison for other types
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      const comparison = aStr.localeCompare(bStr);
      return order === "asc" ? comparison : -comparison;
    });
  }

  private static paginateData(
    data: any[],
    page: number = 1,
    limit: number = 10
  ): {
    data: any[];
    // pagination: PaginationInfo
  } {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(10000, limit)); // Cap at 10000 items per page

    // const total = data.length;
    // const totalPages = Math.ceil(total / validLimit);
    const startIndex = (validPage - 1) * validLimit;
    const endIndex = startIndex + validLimit;

    const paginatedData = data.slice(startIndex, endIndex);

    // const pagination: PaginationInfo = {
    //   page: validPage,
    //   limit: validLimit,
    //   total,
    //   totalPages,
    //   hasNextPage: validPage < totalPages,
    //   hasPrevPage: validPage > 1,
    // };

    return {
      data: paginatedData,
      // pagination
    };
  }

  // Main function to process data based on queryParams
  static processData(
    data: any[],
    queryParams: QueryParams
  ): {
    data: any[];
    // pagination?: PaginationInfo
  } {
    let processedData = [...data];

    // Apply search filter
    if (queryParams.search) {
      processedData = this.filterData(processedData, queryParams.search);
    }

    // Apply sorting
    if (queryParams.sortBy) {
      processedData = this.sortData(
        processedData,
        queryParams.sortBy,
        queryParams.order
      );
    }

    // Apply pagination
    if (queryParams.page !== undefined || queryParams.limit !== undefined) {
      const result = this.paginateData(
        processedData,
        queryParams.page,
        queryParams.limit
      );
      return {
        data: result.data,
        // pagination: result.pagination
      };
    }

    return { data: processedData };
  }
}
