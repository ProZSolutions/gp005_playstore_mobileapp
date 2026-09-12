import apiRequest from '../apiRequest';
import ENDPOINTS from '../endpoints';
import { getZoneIds, getBranchId ,getSelectedShiftId, getShiftData} from '../storage/authStorage';
import { showAlert } from '../../utils/AlertService';

// Sentinel "unselected" id used across every dropdown/sheet on this screen.
export const UNSELECTED_ID = 0;

export const isSelected = (item) => !!item && item.id !== UNSELECTED_ID;

export const getLineList = async () => {
  const zoneIds = await getZoneIds();
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.CONTINUITY.LINE_LIST,
    body: { zone_id: zoneIds },
  });
  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load lines.');
  }
  if (result.success && Array.isArray(result.data)) {
    result.data = result.data.map((line) => ({
      ...line,
      id: line.line_id,
      label: line.line_name,
    }));
  }
  return result;
};

export const getStyleList = async ({ lineId }) => {
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.CONTINUITY.STYLE_LIST,
    body: { line_id: lineId },
  });
  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load styles.');
  }
  if (result.success && Array.isArray(result.data)) {
    result.data = result.data.map((style) => ({
      ...style,
      id: style.id,
      label: `${style.buyer} | ${style.style_no} | ${style.style_name}`,
    }));
  }
  return result;
};

export async function resolveShiftId() {
  let shiftId = null;
  try {
    shiftId = await getSelectedShiftId();
  } catch (e) {
    showAlert('error', 'Shift Error', e?.message ?? 'Could not resolve selected shift.');
  }
  if (!shiftId) {
    try {
      const shiftData = await getShiftData();
      shiftId = shiftData?.shift_id ?? null;
    } catch (e) {
      showAlert('error', 'Shift Error', e?.message ?? 'Could not load shift data.');
    }
  }
  return shiftId;
}
// orderListByLineStyle -> { data: [{ order_id, order_no, colors: ["Violet"] }] }
export const getOrderDetails = async ({ lineId, styleId }) => {
  const branchId = await getBranchId();

  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.CONTINUITY.ORDER_DETAILS,
    body: { line_id: lineId, style_id: styleId, branch_id: branchId },
  });
  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load orders.');
  }
  if (result.success && Array.isArray(result.data)) {
    result.data = result.data.map((order) => ({
      ...order,
      id: order.order_id,
      label: order.order_no, 
      colorOptions: (order.colors ?? []).map((colorName) => ({
        id: colorName,
        label: colorName,
      })),
    }));
  }
  return result;
};
 
export const processFromOrder = async ({
  lineId,
  styleId,
  orderId,
  colorId,
  colorName,
}) => {
  const branchId = await getBranchId();
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.CONTINUITY.PROCESS,
    body: {
      line_id: lineId,
      style_id: styleId,
      branch_id: branchId,
      order_id: orderId,
      color_id: colorId,
      color_name: colorName,
    },
  });
  if (!result.success) {
    showAlert('error', 'Process Failed', result.message ?? 'Could not process this order.');
  }
  // Response is nested under data.records, with real color ids in
  // color_details — map both into the {id, label, colorOptions} shape
  // the screen and SelectOptionSheet expect.
  if (result.success && Array.isArray(result?.data?.records)) {
    result.data = result.data.records.map((order) => ({
      ...order,
      id: order.order_id ?? order.order_no,
      label: order.order_no,
      colorOptions: (order.color_details ?? []).map((c) => ({
        id: c.id,
        label: c.color,
      })),
    }));
  } else if (result.success) {
    result.data = [];
  }
  return result;
};

 export const saveContinuityMapping = async ({
  lineId,
  styleId,
  fromOrderNo,
  fromColor,
  toOrderNo,
  toColor,
}) => {

    const resolvedShiftId =await resolveShiftId();
    console.log("shift_id"+resolvedShiftId);
  
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.CONTINUITY.SAVE,
    body: {
      line_id: lineId,
      style_id: styleId,
      from_order_no: fromOrderNo,
      from_color: fromColor,
      to_order_no: toOrderNo,
      to_color: toColor,
      shift_id:resolvedShiftId
    },
  });
  if (!result.success) {
    showAlert('error', 'Save Failed', result.message ?? 'Could not save the mapping.');
  }
  return result;
};
 export default {
  getLineList,
  getStyleList,
  getOrderDetails,
  processFromOrder,
  saveContinuityMapping,
  isSelected,
  UNSELECTED_ID,
};