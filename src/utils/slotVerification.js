import { getSlotDetails, saveSlotDetails, getShiftData, getSelectedShiftId, getSelectedLineId } from '../api/storage/authStorage';
import { verifySlot } from '../api/services/slotService';
import { showAlert } from './AlertService';
export async function verifyAndGetSlot({
  lineId,
  shiftId,
  navigation,
  listRouteName = 'OrderList',
  listRouteParams,
  silent = false,
  forceRefresh = false,
} = {}) {
  try {
    if (!forceRefresh) {
      const storedSlot = await getSlotDetails();
      if (storedSlot?.slot_name) {
        return { slot: storedSlot, source: 'cache' };
      }
    } 
    const resolvedLineId = lineId ?? (await getSelectedLineId()); 
    const resolvedShiftId =
      shiftId ??
      (await getSelectedShiftId()) ??
      (await getShiftData())?.shift_id;

    console.log(' Slot Verification ' + resolvedLineId + ' shift ' + resolvedShiftId);

    if (!resolvedLineId) {
      console.warn('verifyAndGetSlot: no lineId available (param or stored)');
      if (!silent) {
        showAlert('error', 'No Line Selected', 'Please select a line before continuing.');
        if (navigation && listRouteName) {
          navigation.navigate(listRouteName, listRouteParams);
        }
      }
      return { slot: null, source: 'none' };
    }

    const response = await verifySlot({ lineId: resolvedLineId, shiftId: resolvedShiftId });

    const found =
      response?.success &&
      response?.data?.count > 0 &&
      response?.data?.data?.length;

    if(!found){
      response.data.data[0] = {"id":1,"uuid":"aee4ab36-d7b2-439a-be51-9f8b2b0ba04f"
        ,"slot_name":"No Slot","start":"00:00","end":"00","line_id":1,"branch_id":"1"};
    }  

    if (found) {
      const slot = response.data.data[0];
      await saveSlotDetails(slot);
      return { slot, source: 'api' };
    }

    if (!silent) {
     /* showAlert('error', 'No Slot Available', 'No slot is currently available for this line/shift.');
      if (navigation && listRouteName) {
        navigation.navigate(listRouteName, listRouteParams);
      } */
    }

    return { slot: null, source: 'none' };
  } catch (error) {
    console.warn('verifyAndGetSlot failed:', error);

    if (!silent) {
     /* showAlert('error', 'Slot Verification Failed', error?.message ?? 'Something went wrong while checking the slot.');
      if (navigation && listRouteName) {
        navigation.navigate(listRouteName, listRouteParams);
      } */
    }

    return { slot: null, source: 'none' };
  }
}