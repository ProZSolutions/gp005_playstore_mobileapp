// api/services/slotService.js
import apiRequest from '../apiRequest';
import ENDPOINTS from '../endpoints';
import { getUser } from '../storage/authStorage';

export const verifySlot = async ({ lineId, shiftId }) => {
  try {
    const user = await getUser();
    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.DROPDOWN.SLOT_VERIFY,
      body: {
        branch_id: user?.branch_id,
        team_id: user?.team_id,
        line_id: lineId,
        shift_id: shiftId,
      },
    });
    return result;
  } catch (e) {
    console.warn('verifySlot failed:', e.message);
    return { success: false, data: null, message: e.message };
  }
};