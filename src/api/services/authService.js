import apiRequest from '../apiRequest';
import ENDPOINTS from '../endpoints';
import {
  saveAuthData,
  clearAuthData,
  getToken,
  getZoneIds,
  getLineIds,
  getCheckInData,
  saveCheckInData,
  saveLineIds,
  saveLineNames,
  saveCheckInUuid,
  saveShiftData
} from '../storage/authStorage';
import { Alert } from 'react-native';
import { showAlert } from '../../utils/AlertService';

export const loginUser = async (username, password, platform) => {
   const result = await apiRequest({
    method:   'POST',
    endpoint: ENDPOINTS.AUTH.LOGIN,
    body:     { username, password, platform },
  });
   if (result.success && result.data?.token) {
    const saved = await saveAuthData(result.data);
    if (!saved.success) {
      showAlert('error', 'Auth Failed', saved?.message ?? 'Failed to Login');
      console.warn('Auth data could not be persisted:', saved.error);
    }
  } else {
    showAlert('error', 'Auth Failed', result?.message ?? 'Failed to Login');
  }

  return result;
};

export const logoutUser = async () => {
  try {
    const token = await getToken();

    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.AUTH.LOGOUT,
      token,
    });

    if (!result.success) {
      console.warn('Server logout failed, clearing local session anyway:', result.message);
    }
  } catch (err) {
    console.warn('Logout API error, clearing local session anyway:', err);
  } finally {
    await clearAuthData();
  }

  return { success: true };
};

const hasValueArr = (v) => Array.isArray(v) && v.length > 0;

 /*export const submitCheckIn = async ({ force = false } = {}) => {
  if (!force) {
    const cached = await getCheckInData();
    if (cached) {
      return { success: true, data: cached, message: 'Already checked in', status: 0, errors: null, fromCache: true };
    }
  }

  const [zoneIds, lineIds] = await Promise.all([getZoneIds(), getLineIds()]);

  if (!hasValueArr(zoneIds) || !hasValueArr(lineIds)) {
    return { success: false, data: null, message: 'No saved zone/line selection found.', status: 0, errors: null };
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
      hasValueArr(line_id) && saveLineIds(line_id),
      hasValueArr(line_names) && saveLineNames(line_names),
      (shift_id || shift_names) && saveShiftData(shift_id, shift_names), // 👈 only if response includes it
      uuid && saveCheckInUuid(uuid),
    ].filter(Boolean));
  }

  return result;
}; */

 export const submitCheckIn = async ({ force = false } = {}) => {
  if (!force) {
    const cached = await getCheckInData();
    if (cached) {
      return { success: true, data: cached, message: 'Already checked in', status: 0, errors: null, fromCache: true };
    }
  }

  const [zoneIds, lineIds] = await Promise.all([getZoneIds(), getLineIds()]);

  if (!hasValueArr(zoneIds) || !hasValueArr(lineIds)) {
    return { success: false, data: null, message: 'No saved zone/line selection found.', status: 0, errors: null };
  }

  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.MOBILE.CHECKIN,
    body: { zone_id: zoneIds, line_id: lineIds },
  });

  if (result.data) {
    const { line_id, line_names, uuid } = result.data;

  console.log("checkin response "+JSON.stringify(result.data));
    const hasShiftInfo = result.data.shift_master_id || result.data.shift_alloc_id || result.data.shift_name;

    await Promise.all([
      result.success && saveCheckInData(result.data),
      hasValueArr(line_id) && saveLineIds(line_id),
      hasValueArr(line_names) && saveLineNames(line_names),
      hasShiftInfo && saveShiftData(result.data),
      uuid && saveCheckInUuid(uuid),
    ].filter(Boolean));
  }

  return result;
};