 import apiRequest    from '../apiRequest';
import ENDPOINTS     from '../endpoints';
import { saveAuthData, clearAuthData } from '..api/storage/authStorage';



export const lineList = async () => {
  try {
    const result = await apiRequest({
      method:   'GET',
      endpoint: ENDPOINTS.TLSLINE.LINES,
    });

    if (!result.success) {
      console.warn('lineList error:', result.error);
      return [];
    }

    return result.data?.data ?? [];

  } catch (e) {
    console.warn('lineList error:', e.message);
    return [];
  }
};
export const workStationList = async () => {
  try {
    const result = await apiRequest({
      method:   'GET',
      endpoint: ENDPOINTS.TLSLINE.WORKSTATION,
    });

    if (!result.success) {
      console.warn('lineList error:', result.error);
      return [];
    }

    return result.data?.data ?? [];

  } catch (e) {
    console.warn('lineList error:', e.message);
    return [];
  }
};
 
export const orderList = async (line_id) => {
  const result = await apiRequest({
    method:   'POST',
    endpoint: ENDPOINTS.TLSLINE.ORDERLIST,
    body:     { line_id},
  });

  if (result.success && result.data?.token) {
    const saved = await saveAuthData(result.data);
    if (!saved.success) { 
      console.warn('Auth data could not be persisted:', saved.error);
    }
  }

  return result;
};
export const colorList = async () => {
  const result = await apiRequest({
    method:   'GET',
    endpoint: ENDPOINTS.TLSLINE.COLORLIST
   });

  if (result.success && result.data?.token) {
    const saved = await saveAuthData(result.data);
    if (!saved.success) { 
      console.warn('Auth data could not be persisted:', saved.error);
    }
  }

  return result;
};
export const operationList = async (line_id,order_id,colour_id) => {
  const result = await apiRequest({
    method:   'GET',
    endpoint: ENDPOINTS.TLSLINE.OPERATIONLIST
   });

  if (result.success && result.data?.token) {
    const saved = await saveAuthData(result.data);
    if (!saved.success) { 
      console.warn('Auth data could not be persisted:', saved.error);
    }
  }

  return result;
};
export const lineMapping = async (payload) => {
  const result = await apiRequest({
    method:   'GET',
    endpoint: ENDPOINTS.TLSLINE.OPERATIONLIST,
    body: payload
   });

  if (result.success && result.data?.token) {
    const saved = await saveAuthData(result.data);
    if (!saved.success) { 
      console.warn('Auth data could not be persisted:', saved.error);
    }
  }

  return result;
};
 