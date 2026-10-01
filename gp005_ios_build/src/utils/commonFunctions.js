export  function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
export const formatTime12Hour = (timeStr) => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${mStr} ${period}`;
};
export const formatDateTime12Hour = (dateStr) => {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes} ${period}`;
};