
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;

  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const nowInMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};
export const formatDateTime = (
  isoString,
) => {
  if (!isoString)
    return '—';

  const date =
    new Date(
      isoString,
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      '0',
    );

  const month =
    String(
      date.getMonth() +
        1,
    ).padStart(
      2,
      '0',
    );

  const year =
    date.getFullYear();

  const hours =
    String(
      date.getHours(),
    ).padStart(
      2,
      '0',
    );

  const minutes =
    String(
      date.getMinutes(),
    ).padStart(
      2,
      '0',
    );

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};
export const getShiftWindow = (shift) => {
  const start    = timeToMinutes(shift.start);
  const end      = timeToMinutes(shift.end);
  const startBuf = timeToMinutes(shift.start_buffer_time ?? '00:00:00');
  const endBuf   = timeToMinutes(shift.end_buffer_time ?? '00:00:00');

  return {
    windowStart: start - startBuf,
    windowEnd: end + endBuf,
  };
};

export const isWithinWindow = (
  nowMin,
  { windowStart, windowEnd }
) => {
  if (windowEnd >= windowStart) {
    return nowMin >= windowStart && nowMin <= windowEnd;
  }

  return nowMin >= windowStart || nowMin <= windowEnd;
};

export const distanceToShiftStart = (
  nowMin,
  shiftStartMin
) => {
  const diff = Math.abs(nowMin - shiftStartMin);
  return Math.min(diff, 1440 - diff);
};

export const detectNearestShift = (shifts, nowMin) => {
  if (!shifts?.length) return null;

  const active = shifts.find((s) =>
    isWithinWindow(nowMin, getShiftWindow(s))
  );

  if (active) return active;

  return shifts.reduce((best, curr) => {
    const bd = distanceToShiftStart(
      nowMin,
      timeToMinutes(best.start)
    );

    const cd = distanceToShiftStart(
      nowMin,
      timeToMinutes(curr.start)
    );

    return cd < bd ? curr : best;
  });
};