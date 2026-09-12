import apiRequest from '../apiRequest';
import ENDPOINTS from '../endpoints';
import { showAlert } from '../../utils/AlertService';

export const listOrderList = async ({ orderId = '', lineId = null, search = '', page = 1, perPage = 30 } = {}) => {
   const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.ORDERMAPPING.ORDERS,
    body: { order_id: orderId, line_id: lineId, search: search || '', page, per_page: perPage },
  });
 
  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load orders.');
  }

  return result;
};
export const listOperationList = async ({ orderId, styleId, lineId, shiftId ,page = 1,  perPage,status}) => {
     const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.ORDERMAPPING.OPERATIONS,
    body: {
      order_id: orderId,
      style_id: styleId,
      line_id: lineId,
      shift_id: shiftId,
      page,
      map_status: status === 'All' ? undefined : status?.toLowerCase(),
      per_page: perPage,
    },
  });

  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load operations.');
  }

  return result;
};