import { useEffect, useState } from 'react';
 
export function calculateElapsedSeconds(startTime) {
  if (!startTime) return 0;
  const startMs = new Date(startTime).getTime();
  if (Number.isNaN(startMs)) return 0;
  return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
}
 export function calculateElapsedMinutes(startTime) {
  if (!startTime) return 0;
  const startMs = new Date(startTime).getTime();
  if (Number.isNaN(startMs)) return 0;
  return Math.max(0, (Date.now() - startMs) / 1000 / 60);
}
/*export function formatElapsedTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
} */
export function formatElapsedTime(totalSeconds) {
 const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
} 
 
 
export function useElapsedTimer(startTime, tickMs = 1000) {
  const [seconds, setSeconds] = useState(() => calculateElapsedSeconds(startTime));

  useEffect(() => {
    if (!startTime) {
      setSeconds(0);
      return;
    }
    setSeconds(calculateElapsedSeconds(startTime));
    const id = setInterval(() => {
      setSeconds(calculateElapsedSeconds(startTime));
    }, tickMs);
    return () => clearInterval(id);
  }, [startTime, tickMs]);

  return { seconds, formatted: formatElapsedTime(seconds) };
}