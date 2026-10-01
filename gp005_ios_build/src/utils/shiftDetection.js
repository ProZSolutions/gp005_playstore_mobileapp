import apiClient     from '../api/apiClient';
import { getToken, saveShiftData } from '../api/storage/authStorage';  
import ENDPOINTS     from '../api/endpoints';

 
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const nowInMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

 
export const getShiftWindow = (shift) => {
  const start = timeToMinutes(shift.start_buffer_time ?? shift.start);
  const end   = timeToMinutes(shift.end_buffer_time   ?? shift.end);
  return { windowStart: start, windowEnd: end };
};

export const isWithinWindow = (nowMin, { windowStart, windowEnd }) => {
  if (windowEnd >= windowStart) {
    // normal shift (e.g. 09:30 → 18:00)
    return nowMin >= windowStart && nowMin <= windowEnd;
  }
  // overnight shift (e.g. 22:00 → 06:00)
  return nowMin >= windowStart || nowMin <= windowEnd;
};

export const distanceToShiftStart = (nowMin, shiftStartMin) => {
  const diff = Math.abs(nowMin - shiftStartMin);
  return Math.min(diff, 1440 - diff);
};

 
export const detectNearestShift = (shifts, nowMin = nowInMinutes()) => {
  if (!shifts?.length) return null;

 

  // 1. Try to find an active shift (now falls within its window)
  const activeShift = shifts.find((shift) => {
    const window = getShiftWindow(shift);
    const match  = isWithinWindow(nowMin, window);

   

    return match;
  });

  if (activeShift) {
     return activeShift;
  }

  // 2. Fallback — return the shift whose start is nearest to now
  const nearest = shifts.reduce((best, current) => {
    const bestDistance    = distanceToShiftStart(nowMin, timeToMinutes(best.start));
    const currentDistance = distanceToShiftStart(nowMin, timeToMinutes(current.start));
    return currentDistance < bestDistance ? current : best;
  });

   return nearest;
};

 
export const shiftIcon = (shift) => {
  if (!shift) return 'clock';

  const type = (shift.type ?? shift.shift_name ?? '').toLowerCase();

  if (type.includes('morning') || type.includes('day'))          return 'sun';
  if (type.includes('evening') || type.includes('aftn'))         return 'sunset';
  if (type.includes('night'))                                     return 'moon';
  return 'clock';
};

 
export const getDetectedShift = async () => {
  try {
    const token = await getToken();

    const response = await apiClient.get(
      ENDPOINTS.DROPDOWN.SHIFTLIST,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const shifts = response.data?.data ?? [];

    if (!shifts.length) {
       return null;
    }

    

    const detectedShift = detectNearestShift(shifts, nowInMinutes());

    if (detectedShift) {
      await saveShiftData(detectedShift); // ← was missing saveShiftData import before
     }

    return detectedShift;

  } catch (error) {
     return null;
  }
};