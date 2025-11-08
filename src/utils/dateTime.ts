/**
 * Formats a Date object to YYYY-MM-DD format for API requests
 */
export const formatClientDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a Date object to HH:MM:SS format for API requests
 */
export const formatClientTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Gets the current date and time formatted for API requests
 */
export const getCurrentClientDateTime = (): { clientDate: string; clientTime: string } => {
  const now = new Date();
  return {
    clientDate: formatClientDate(now),
    clientTime: formatClientTime(now),
  };
};
