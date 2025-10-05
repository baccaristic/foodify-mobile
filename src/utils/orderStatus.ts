export const formatOrderStatusLabel = (status: string | null | undefined) => {
  if (!status) {
    return 'In progress';
  }

  return status
    .toString()
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

export const isOrderStatusActive = (status: string | null | undefined) => {
  if (!status) {
    return false;
  }

  const normalized = status.toString().toUpperCase();
  return ['DELIVERED', 'CANCELED', 'REJECTED'].indexOf(normalized) === -1;
};
