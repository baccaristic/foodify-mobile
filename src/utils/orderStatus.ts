export const formatOrderStatusLabel = (status: string | null | undefined) => {
  if (!status) {
    return 'Preparing your order';
  }

  return status
    .toString()
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};
