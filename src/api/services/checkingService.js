import apiRequest from '../apiRequest';
import ENDPOINTS from '../../api/endpoints';
import { PAGE_SIZE, getSelectedShiftId, getShiftData } from '../storage/authStorage';
import { showAlert } from '../../utils/AlertService';

const COLOUR_HEX_MAP = {
  'light green': '#8BC34A',
  'dark green':  '#2E7D32',
  green:         '#4CAF50',
  red:           '#E53935',
  blue:          '#1E88E5',
  'light blue':  '#64B5F6',
  navy:          '#1A237E',
  black:         '#212121',
  white:         '#FAFAFA',
  grey:          '#9E9E9E',
  gray:          '#9E9E9E',
  yellow:        '#FDD835',
  orange:        '#FB8C00',
  pink:          '#EC407A',
  purple:        '#8E24AA',
  brown:         '#6D4C41',
  beige:         '#D7CCC8',
  maroon:        '#800000',
  cream:         '#FFF8E1',
};

const FALLBACK_PALETTE = ['#0A9E96', '#5C6BC0', '#EF6C00', '#00897B', '#8D6E63', '#3949AB'];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getColourHex(colourName) {
  if (!colourName) return '#BDBDBD';
  const key = String(colourName).trim().toLowerCase();
  if (COLOUR_HEX_MAP[key]) return COLOUR_HEX_MAP[key];
  return FALLBACK_PALETTE[hashString(key) % FALLBACK_PALETTE.length];
}

export function formatDisplayDate(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function normalizeOrder(record = {}) {
  return {
    id: record.id,
    uuid: record.uuid,
    tlsCode: record.order_code || record.order_no || String(record.id ?? ''),
    orderNo: record.order_no,
    orderCode: record.order_code,
    colour: record.colour,
    colourHex: getColourHex(record.colour),
    buyer: record.style?.buyer,
    style_id: record.style?.id,
    style: record.style?.style_name,
    styleNo: record.style?.style_no,
    styleId: record.style_id,
    orderQty: record.order_qty,
    prodQty: record.prod_qty,
    totalSize: record.total_size,
    totalProd: record.tot_prd_ord_qty,
    balQty: record.bal_qty,
    exFacDate: record.ex_fac_date,
    createdOn: formatDisplayDate(record.created_at ?? record.ex_fac_date),
    orderSizes: Array.isArray(record.orderSizes) ? record.orderSizes : [],
    sizeslimit: Array.isArray(record.sizes_with_limit) ? record.sizes_with_limit : [],
    sizes: Array.isArray(record.sizes) ? record.sizes : [],
    wip: record.wip,
    _raw: record,
  };
}

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

export async function getSettingList() {
  let response;
  try {
    response = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.CHECKING.SETTINGS,
    });
  } catch (e) {
    showAlert('error', 'Load Failed', e?.message ?? 'Could not load orders.');
  }

  if (!response?.success) {
    showAlert('error', 'Load Failed', response?.message ?? 'Could not load orders.');
  }

  return response;
}

export async function fetchOrderSizes({
  lineId,
  shiftId,
  page = 1,
  pageSize = PAGE_SIZE,
  search = '',
  orderId
}) {
  if (!lineId) {
    return { success: true, message: 'No line selected', data: [] };
  }

  const body = {
    shift_id: shiftId,
    line_id: lineId,
    page,
    page_size: pageSize,
  };
  if (search) body.search = search;
   if (orderId) body.order_id = orderId;
  let response;
  try {
    response = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.CHECKING.LIST,
      body,
    });
  } catch (e) {
    showAlert('error', 'Load Failed', e?.message ?? 'Could not load orders.');
  }

  if (!response?.success) {
    showAlert('error', 'Load Failed', response?.message ?? 'Could not load orders.');
  }

  return response;
}

// Fetch a single order by id — same record shape as one item in fetchOrderSizes' "records",
// just wrapped directly under "data" instead of "data.records[]".
// Used by SizeWiseResultScreen to refresh in place after a submit, without navigating
// back to the list.
export async function fetchOrderDetails({ orderId, lineId, shiftId } = {}) {
  if (!orderId || !lineId) {
    return { success: false, data: null };
  }

  const resolvedShiftId = shiftId ?? (await resolveShiftId());

  const response = await fetchOrderSizes({
    lineId,
    shiftId: resolvedShiftId,
    page: 1,
    pageSize: 1,
    orderId,
  });

  if (!response?.success) {
    return { success: false, data: null };
  }

  const records = Array.isArray(response?.data?.records) ? response.data.records : [];
  const record = records.find((r) => String(r.id) === String(orderId)) ?? records[0] ?? null;

  return {
    success: true,
    data: record ? normalizeOrder(record) : null,
  };
}

export async function createSize({
  orderId,
  orderNo,
  styleId,
  lineId,
  buyer,
  branchId,
  shiftId,
  teamId,
  size,
  qty,
  outputQty,
  wip,
}) {
  const body = {
    order_id: orderId,
    order_no: orderNo,
    style_id: styleId,
    line_id: lineId,
    buyer,
    branch_id: branchId,
    shift_id: shiftId,
    team_id: teamId,
    size,
    qty,
    output_qty: outputQty,
    wip,
  };

  let response;
  try {
    response = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.CHECKING.CREATE,
      body,
    });
  } catch (e) {
    showAlert('error', 'Submit Failed', e?.message ?? 'Could not submit the result.');
  }

  if (!response?.success) {
    showAlert('error', 'Submit Failed', response?.message ?? 'Could not submit the result.');
  }

  return response;
}

async function postInputTransaction(endpointPath, {
  type,
  orderId,
  color,
  styleId,
  shiftId,
  sizes,
  line_id
}) {
  const body = {
    type,
    order_id: orderId,
    color,
    style_id: styleId,
    line_id: line_id,
    shift_id: String(shiftId ?? ''),
    input: sizes,
  };
  let response;
  try {
    response = await apiRequest({
      method: 'POST',
      endpoint: endpointPath,
      body,
    });
  } catch (e) {
    showAlert('error', 'Load Failed', e?.message ?? 'Could not load orders.');
  }

  if (!response?.success) {
    showAlert('error', 'Load Failed', response?.message ?? 'Could not load orders.');
  }

  return response;
}

export async function createInputEntry(params) {
  return postInputTransaction(ENDPOINTS.INPUTMODULE.CREATE, { type: 'input', ...params });
}

export async function createInputReturn(params) {
  return postInputTransaction(ENDPOINTS.INPUTMODULE.CREATE, { type: 'return', ...params });
}