import apiRequest from '../apiRequest';
import ENDPOINTS from '../endpoints';
import { getLineIds, getSelectedShiftId, getShiftData, getUser, PAGE_SIZE } from '../storage/authStorage';
import { showAlert } from '../../utils/AlertService';
import { formatElapsedTime,calculateElapsedSeconds ,calculateElapsedMinutes} from '../../utils/elapsedTime';
 
 export const getElapsedTime = async ({ orderId, lineId, type = 'tls_issue',uuid }) => {

      const body = {  orderId,  lineId, type ,uuid };
      let response;
    try{
        response = await apiRequest({
            method: 'POST',
            endpoint: ENDPOINTS.AUDIT.GETELAPSEDTIME, // add this key in endpoints.js to match your backend route
            body 
        });
    }   catch (e) {
        showAlert('error', 'Load Failed', e?.message ?? 'Could not load orders.');
     }
  
 
  if (!response?.success) {
    showAlert('error', 'Load Failed', response?.message ?? 'Could not load orders.');
  }

  return response;
};