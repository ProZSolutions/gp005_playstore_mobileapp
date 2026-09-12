import AsyncStorage from '@react-native-async-storage/async-storage';
 import ENDPOINTS     from '../endpoints';
import apiRequest from '../apiClient';

import {
  getZoneIds,
  getLineIds,
  getCheckInData,
  saveCheckInData,
  saveShiftData,
  saveLineIds,
  saveLineNames,
  saveCheckInUuid,
} from '../storage/authStorage';

const KEYS = {
  ID: 'mobile_checkin_id',
  SHIFT_ID: 'mobile_shift_id',
};

export const saveCheckinData = async ({ id, shift_id }) => {
  await AsyncStorage.multiSet([
    [KEYS.ID, String(id)],
    [KEYS.SHIFT_ID, String(shift_id)],
  ]);
};

export const getCheckinData = async () => {
  const values = await AsyncStorage.multiGet([
    KEYS.ID,
    KEYS.SHIFT_ID,
  ]);

  return {
    id: values[0][1] ? Number(values[0][1]) : null,
    shift_id: values[1][1]
      ? Number(values[1][1])
      : null,
  };
};

export const clearCheckinData = async () => {
  await AsyncStorage.multiRemove([
    KEYS.ID,
    KEYS.SHIFT_ID,
  ]);
};

 export const submitCheckIn = async ({ force = false } = {}) => {
  if (!force) {
    const cached = await getCheckInData();
    if (cached) {
      return {
        success: true,
        data: cached,
        message: 'Already checked in',
        status: 0,
        errors: null,
        fromCache: true,
      };
    }
  }

  const [zoneIds, lineIds] = await Promise.all([getZoneIds(), getLineIds()]);

  if (zoneIds.length === 0 || lineIds.length === 0) {
    return {
      success: false,
      data: null,
      message: 'No saved zone/line selection found.',
      status: 0,
      errors: null,
    };
  }

  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.MOBILE.CHECKIN,
    body: { zone_id: zoneIds, line_id: lineIds },
  });

  if (result.success && result.data) {
    const { line_id, line_names, shift_id, shift_names, uuid } = result.data;

    await Promise.all([
      saveCheckInData(result.data),  
      saveShiftData(shift_id, shift_names),
      hasValueArr(line_id) && saveLineIds(line_id),
      hasValueArr(line_names) && saveLineNames(line_names),
      uuid && saveCheckInUuid(uuid),  
    ].filter(Boolean));
  }

  return result;
};

const hasValueArr = (v) => Array.isArray(v) && v.length > 0;