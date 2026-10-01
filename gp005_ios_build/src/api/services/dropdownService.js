import apiRequest  from '../apiRequest';
import ENDPOINTS   from '../endpoints';

 
export const fetchLineList = (filters = {}) =>
  apiRequest({
    method:   'POST',
    endpoint: ENDPOINTS.DROPDOWN.LINE_LIST,
    body:     filters,
  });

 
export const fetchZoneList = (filters = {}) =>
  apiRequest({
    method:   'POST',
    endpoint: ENDPOINTS.DROPDOWN.ZONE_LIST,
    body:     filters,
  });

 
export const fetchFactoryList = (filters = {}) =>
  apiRequest({
    method:   'POST',
    endpoint: ENDPOINTS.DROPDOWN.FACTORY_LIST,
    body:     filters,
  });

 
export const fetchBranchList = (filters = {}) =>
  apiRequest({
    method:   'POST',
    endpoint: ENDPOINTS.DROPDOWN.BRANCH_LIST,
    body:     filters,
  });


  export const fetchShiftList = async () => {
  try {
    const result = await apiRequest({
      method:   'GET',
      endpoint: ENDPOINTS.DROPDOWN.SHIFTLIST,
    });
    //console.log("shift detection list","as "+JSON.stringify(result));
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