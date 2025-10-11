export interface PaginatedPayload<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems?: number;
}

interface ResolveOptions {
  initialPage?: number;
  pageSizeFallback?: number;
}

export const resolveNextPageParam = <T>(
  lastPage: PaginatedPayload<T>,
  allPages: PaginatedPayload<T>[],
  { initialPage = 0, pageSizeFallback = 0 }: ResolveOptions = {}
): number | undefined => {
  const totalItems =
    typeof lastPage.totalItems === 'number' && lastPage.totalItems > 0
      ? lastPage.totalItems
      : undefined;

  const accumulatedItemCount = allPages.reduce((total, page) => total + page.items.length, 0);

  if (totalItems && accumulatedItemCount >= totalItems) {
    return undefined;
  }

  const effectivePageSize = lastPage.pageSize || pageSizeFallback;

  if (effectivePageSize > 0 && lastPage.items.length < effectivePageSize) {
    return undefined;
  }

  const reportedPage = Number.isFinite(lastPage.page) ? lastPage.page : initialPage + allPages.length - 1;
  const expectedZeroIndexedPage = initialPage + allPages.length - 1;

  if (reportedPage === expectedZeroIndexedPage) {
    return reportedPage + 1;
  }

  if (Number.isFinite(reportedPage)) {
    return reportedPage;
  }

  return initialPage + allPages.length;
};
