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
    buyer: record.buyer,
    style: record.style_name,
    styleNo: record.style_no,
    styleId: record.style_id,
    orderQty: record.order_qty,
    prodQty: record.prod_qty,
    totalInput: record.total_input,
    balQty: record.bal_qty,
    exFacDate: record.ex_fac_date,
    createdOn:formatDisplayDate(record.created_at ?? record.ex_fac_date),
    sizes: Array.isArray(record.sizes) ? record.sizes : [],
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

export async function fetchOrderSizes({
  lineId,
  shiftId,
  page = 1,
  pageSize = PAGE_SIZE,
  search = '',
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

  let response;
  try {
    response = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.INPUTMODULE.ORDER_SIZES,
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