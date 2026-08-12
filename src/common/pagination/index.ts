import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'common/hooks';
import { IDataTableFilter } from 'global/types';
import * as actions from './paginationSlice';

/**
 * Hook to manage server-side pagination, sorting, and state across different data types.
 */
export const usePagination = (type: string, category?: string) => {
  const dispatch = useAppDispatch();

  // Create a unique key for the slice (e.g., 'sources' or 'jobs-ansible')
  const typeCategory = useMemo(() =>
      category ? `${type}-${category}` : type,
    [type, category]);

  const paginationState = useAppSelector(actions.selectPagination)[typeCategory] || {
    paginatedResponse: { data: [], total: 0, limit: 30, skip: 0 },
    pagination: { page: 1, limit: 30 },
    sort: [],
    pending: false
  };

  const { data, total, limit } = paginationState.paginatedResponse;
  const loading = paginationState.pending;
  const localStorageKey = `${typeCategory}_last_filter`;

  const fetchData = useCallback((payload?: Partial<IDataTableFilter>) => {
    const updatedPayload = {
      ...paginationState.pagination,
      sorts: paginationState.sort,
      ...payload,
    };

    localStorage.setItem(localStorageKey, JSON.stringify(updatedPayload));
    return dispatch(actions.getPaginatedData({ type: typeCategory, filter: updatedPayload }));
  }, [dispatch, typeCategory, paginationState.pagination, paginationState.sort, localStorageKey]);

  const handlePageChange = (page: number, recordsPerPage: number) => {
    dispatch(actions.setPagination({
      type: typeCategory,
      pagination: { page, limit: recordsPerPage }
    }));
  };

  const handleSortChange = (sortStatus: any) => {
    const statuses = Array.isArray(sortStatus) ? sortStatus : [sortStatus];
    const mapped = statuses.map((s) => ({
      column: String(s.columnAccessor),
      direction: String(s.direction)
    }));
    dispatch(actions.setSort({ type: typeCategory, sort: mapped }));
  };

  return {
    data,
    total,
    limit,
    loading,
    fetch: fetchData,
    handlePageChange,
    handleSortChange,
    pagination: paginationState.pagination,
    sort: paginationState.sort,
  };
};

export default usePagination;
