import apiRequest from '../apiRequest';
import ENDPOINTS from '../endpoints';
import { getLineIds, getSelectedShiftId, getShiftData, getUser, PAGE_SIZE } from '../storage/authStorage';
import { showAlert } from '../../utils/AlertService';
import { formatElapsedTime,calculateElapsedSeconds ,calculateElapsedMinutes} from '../../utils/elapsedTime';

const COLOR_HEX = {
  red: '#E53935', blue: '#1E88E5', black: '#212121', white: '#FAFAFA',
  green: '#43A047', yellow: '#FDD835', grey: '#9E9E9E', gray: '#9E9E9E',
  navy: '#1A237E', orange: '#FB8C00', pink: '#EC407A', purple: '#8E24AA',
  aqua: '#1A237E'
};
export const getColourHex = (name) => COLOR_HEX[(name || '').trim().toLowerCase()] || '#CCCCCC';


const SEVERITY_STYLES = {
  critical: { bg: '#D32F2F', text: '#FFFDE7', label: 'Critical' },
  major: { bg: '#F59E0B', text: '#FFFDE7', label: 'Major' },
  minor: { bg: '#F4C430', text: '#FFFDE7', label: 'Minor' },
};
const DEFAULT_SEVERITY_STYLE = { bg: '#EEEEEE', text: '#616161', label: '—' };
const getSeverityStyle = (name) => { 
  const key = (name || '').trim().toLowerCase();
  const found = SEVERITY_STYLES[key];
  return found ? found : { ...DEFAULT_SEVERITY_STYLE, label: name || '—' };
};
export function normalizeOrder(record = {}) {
  const raw = record ?? {};
  return {
    id: raw.id,
    uuid: raw.uuid,
    orderNo: raw.order_no,
    orderCode: raw.order_code,
    colour: raw.colour ?? raw.color,
    buyer: raw.buyer ?? raw.style?.buyer,
    styleId: raw.style_id ?? raw.style?.id,
    styleNo: raw.style?.style_no ?? raw.style_no,
    styleName: raw.style?.style_name ?? raw.style_name,
    orderQty: raw.order_qty,
    prodQty: raw.prod_qty,
    totalProd: raw.tot_prd_ord_qty,
    wip: raw.wip,
    rejQty: raw.rej_qty,
    createdOn: raw.created_at,
    sizesWithLimit: mapSizesWithLimit(raw.sizes_with_limit ?? []),
    _raw: raw,
  };
}

export function buildOrderAndStyleInfo(order, lineLabel) {
  const raw = order?._raw ?? order ?? {};

  const orderInfo = {
    id: order?.id ?? raw.id,
    lineLabel: lineLabel ?? '—',
    orderNo: order?.orderNo ?? raw.order_no ?? '—',
    colour: order?.colour ?? raw.colour ?? raw.color ?? '—',
    outputBalance: raw.wip ?? raw.tot_prd_ord_qty ?? order?.wip ?? '—',
    sizesWithLimit: order?.sizesWithLimit?.length
      ? order.sizesWithLimit
      : mapSizesWithLimit(raw.sizes_with_limit ?? []),
  };

  const styleInfo = {
    id: raw.style?.id ?? order?.styleId ?? null,
    buyer: order?.buyer ?? raw.buyer ?? raw.style?.buyer ?? '—',
    styleNo: order?.styleNo ?? raw.style_no ?? raw.style?.style_no ?? '—',
    styleName: order?.styleName ?? raw.style_name ?? raw.style?.style_name ?? '—',
  };

  return { orderInfo, styleInfo };
}
export const getSeverityDropdown = async () => {
  const shift_id = await resolveShiftId();
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DROPDOWN.SEVERITY,  
    body: { shift_id },
  });
  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load severities.');
    return [];
  }
  return unwrap(result);
};

export const formatCreatedOn = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};
export const formatAuditOn = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n) => String(n).padStart(2, '0');

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const formatAuditTime = formatCreatedOn;
export const minutesSince = (iso) => {
  if (!iso) return 0;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / 60000));
};

const safeJsonParse = (value, fallback) => {
  if (Array.isArray(value) || (value && typeof value === 'object')) return value;
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

// ── Turn the "sizes_with_limit" array that ships on every list-page order
// record into the {id, value} shape SelectListSheet expects for the Size
// dropdown on AQLOrderDetailsScreen. Exported so InputListScreen (or the
// details screen itself) can call it wherever the raw order record lives.
export const mapSizesWithLimit = (sizesWithLimit) => {
  if (!Array.isArray(sizesWithLimit)) return [];
  return sizesWithLimit.map((s) => ({
    id: s.id,
    value: s.size,
    inspectionQtyLimit: s.inspection_qty_limit ?? null,
    wip:s.wip ??null,
  }));
};

export async function fetchOrderSizes({
  lineId,
  shiftId,
  page = 1,
  pageSize = PAGE_SIZE,
  search = '',
  orderId,
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
      endpoint: ENDPOINTS.AQLAUDIT.LIST,
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
 export async function fetchAqlOrderById({ orderId, lineId, shiftId } = {}) {
  if (!orderId || !lineId) return { success: false, data: null };

  const resolvedShiftId = shiftId ?? (await resolveShiftId());

  const response = await fetchOrderSizes({
    lineId,
    shiftId: resolvedShiftId,
    page: 1,
    pageSize: 1,
    orderId,
  });

  if (!response?.success) return { success: false, data: null };

  const records = Array.isArray(response?.data?.records) ? response.data.records : [];
  const record = records.find((r) => String(r.id) === String(orderId)) ?? records[0] ?? null;

  return {
    success: true,
    data: record ? normalizeOrder(record) : null,
  };
}
 
export async function getInspectionLevelList(branchId) {
  let response;
  try {
    response = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.AQLAUDIT.INSPECTION,
      body: { branch_id: branchId },
    });
  } catch (e) {
    showAlert('error', 'Load Failed', e?.message ?? 'Could not load inspection levels.');
    return [];
  }

  if (!response?.success) {
    showAlert('error', 'Load Failed', response?.message ?? 'Could not load inspection levels.');
    return [];
  }

  const rows = unwrap(response); // [{ level: "General - I" }, ...]
  return rows.map((r) => ({ id: r.level, value: r.level }));
}

// AQL Level dropdown — used for Major, Minor AND Critical (same source list
// for all three, per /aqlaudit/aqldropdown). The endpoint returns a flat
// array of value strings (e.g. "0.07", "0.1", ... "6.5"), not {id,value}
// pairs, so we synthesize an id from the value itself (values are unique).
export async function getAQLLevelList(branchId) {
  let response;
  try {
    response = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.AQLAUDIT.AQLLEVEL, // -> /aqlaudit/aqldropdown
      body: { branch_id: branchId },
    });
  } catch (e) {
    showAlert('error', 'Load Failed', e?.message ?? 'Could not load AQL levels.');
    return [];
  }

  if (!response?.success) {
    showAlert('error', 'Load Failed', response?.message ?? 'Could not load AQL levels.');
    return [];
  }

  const values = unwrap(response); // e.g. ["0.07","0.1","0.15",...]
  return values.map((v) => ({ id: v, value: String(v) }));
}

const mapOrder = (item) => ({
  ...item,
  tlsCode: item.tls_no ?? item.device_name ?? '',
  orderrCode:item.order_no,
  tls_id: item.tls_id,
  tlsId: item.tlsId,
  colour: item.color ?? '',
  colourHex: getColourHex(item.color),
  buyer: item.buyer ?? '',
  style: item.style_name ?? '',
  styleNo: item.style_no ?? '',
  lineId: item.line_id,
  lineName: item.line_name,
  createdOn: formatCreatedOn(item.created_at),
  is_escalate: item.is_escalate,
  // keep the raw sizes array around so downstream screens can build the
  // Size dropdown without re-fetching
  sizesWithLimit: item.sizes_with_limit ?? [],
});

export const mapAuditItem = (item) => {
  const capList = safeJsonParse(item.cap, []);
  const qualityChecks = safeJsonParse(item.quality_check, []);
  const colourName = item.color_id ?? item.colour ?? item.color_name ?? '';
  const responseTimeNew = calculateElapsedSeconds(item.audit_at ?? item.scan_time);
  const minutes = Math.floor(responseTimeNew / 60);
  const seconds = responseTimeNew % 60;
  const minres = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const hours = Math.floor(responseTimeNew / 3600);
  const minutes1 = Math.floor((responseTimeNew % 3600) / 60);
  const seconds1 = responseTimeNew % 60;

  const timeStr = `${String(hours).padStart(2, '0')}:${String(
    minutes1
  ).padStart(2, '0')}:${String(seconds1).padStart(2, '0')}`;


  return {
    id: item.id,
    displayId: item.order_no ?? item.order_code,
    uuid: item.uuid,
    lineId: item.line_id,
    lineLabel: item.line_name ?? '',
    status: item.status ?? '',
    status_name: item.status_name ?? '',
    defectTitle: item.defect_name ?? '',
    defectCategory: item.category_name ?? '',
    defect: item.defect_name ?? '',
    defectQuantity: item.qty_id ?? '0',
    operation: item.operation_name ?? '',
    type: item.workcategory_name ?? '',
    colour: colourName,
    colourHex: getColourHex(colourName),
    elapsedTime: `${minutesSince(item.audit_at ?? item.created_at)} min`,
    elapsed: calculateElapsedSeconds(item.audit_at ?? item.created_at),
    elapsedTimeCap: minutesSince(item.audit_at ?? item.created_at),
    severity: getSeverityStyle(item.severity_name),
    tlsDeviceId: item.tls_id ?? '',
    machineNo:  item.machine_id ?? '',
    machineID:item.machine_no ??'',
    auditedBy: `${item.auditor_name} (${item.auditor_empcode})`,
    auditTime: formatAuditOn(item.audit_at),
    notes: item.comments ?? '',
    assignedTo: item.workcategory_name ?? '—',
    responseTime: item.response_time ?? '—',
    scan_time:item.scan_time,
    response_time_new : responseTimeNew,
    res_time_min:minres,
    res_hr_format:timeStr,
    qualityChecks,
    cap: capList,
    order: {
      buyer: item.buyer ?? '',
      tlsCode: item.order_code ?? '',
      colour: colourName,
      order_code: item.order_code ?? '',
      order_no:item.order_no??'',
      colourHex: getColourHex(colourName),
      style: item.style_name ?? '',
      styleNo: item.style_no ?? '',
      lineNo: item.line_name ?? '',
      name: item.workcategory_name ?? '',
      operation: item.operation_name ?? '',
      machineType: item.machine_type_name ?? '',
      slot: `${item.slot_start} - ${item.slot_end}`,
    },
    operator: {
      buyer: item.buyer ?? '',
      tlsCode: item.order_code ?? '',
      order_code: item.order_code ?? '',
      order_no: item.order_no ?? '',
      colour: colourName,
      colourHex: getColourHex(colourName),
      style: item.style_name ?? '',
      styleNo: item.style_no ?? '',
      lineNo: `${item.line_name}` ?? '',
      name: item.Empname ?? '',
      employeeId: item.EmpId ?? '-',
      operation: item.operation_name ?? '',
      slot: `${item.slot_start} - ${item.slot_end}`,
      machineType: item.machine_type_name ?? '',
      displayName: item.buyer ? `${item.buyer} (${item.style_no ?? ''})` : '',
      machineSummary: item.machine_type_name ? `${item.machine_type_name}  .  ${item.operation_name ?? ''}` : '',
      swashDet : item.order_no ? `${item.order_no}  .  ${item.operation_name ?? ''}` : '',
    },
    swatch: item.order_no ? `${item.order_no}  .  ${colourName ?? ''}` : '',
    raw: item,
  };
}; 

export const mapAuditItemQC = (item) => {
  const capList = safeJsonParse(item.cap, []);
  const selectedCapList = safeJsonParse(item.selected_cap, []);
  const qualityChecks = safeJsonParse(item.quality_check, []);
  const colourName = item.color_id ?? item.colour ?? item.color_name ?? '';

  // audittime_at is the single source of truth for every elapsed/response
  // calculation across the app — no more falling back to item.elapsed_time.
  const auditTimeAt = item.audittime_at ?? item.created_at;

  // Seconds elapsed since audittime_at, as of the moment this item was mapped.
  const elapsedBaseSeconds = Math.max(0, calculateElapsedSeconds(auditTimeAt));
  const elapsedCapturedAt = Date.now();

  const minutes = Math.floor(elapsedBaseSeconds / 60);
  const seconds = elapsedBaseSeconds % 60;
  const minres = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const hours = Math.floor(elapsedBaseSeconds / 3600);
  const minutes1 = Math.floor((elapsedBaseSeconds % 3600) / 60);
  const seconds1 = elapsedBaseSeconds % 60;
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes1).padStart(2, '0')}:${String(seconds1).padStart(2, '0')}`;

  return {
    id: item.id,
    displayId: item.order_no ?? item.order_code,
    uuid: item.uuid,
    lineId: item.line_id,
    lineLabel: item.line_name ?? '',
    status: item.status ?? '',
    status_name: (item.status === 2 || item.status === '2') ? 'NEW' : 'QC Failed',
    defectTitle: item.defect_name ?? '',
    defectCategory: item.category_name ?? '',
    defect: item.defect_name ?? '',
    defectQuantity: item.qty_id ?? '',
    operation: item.operation_name ?? '',
    type: item.workcategory_name ?? '',
    colour: colourName,
    colourHex: getColourHex(colourName),
    elapsedTime: `${minutesSince(auditTimeAt)} min`,
    elapsedTimeCap: minutesSince(auditTimeAt),
    elapsedTimeMin: minres,
    elapsedTimeHrs: timeStr,
    elapsedBaseSeconds,
    elapsedCapturedAt,
    auditTimeAt, // exposed so submit payloads reuse the exact same anchor
    severity: getSeverityStyle(item.severity_name),
    workcategory: item.workcategory_name,
    tlsDeviceId: item.tls_id ?? '',
    machineNo: item.machine_id ?? '',
    machineID: item.machine_no ?? '',
    auditedBy: item.auditor_name ?? '',
    auditDet: `${item.audit_emp_name} (${item.audit_emp_code})`,
    perDet: `${item.auditor_name} (${item.auditor_empcode})`,
    auditTime: formatAuditOn(item.audittime_at),
    work_audit_at: item.work_audit_at,
    performedby: item.auditor_name ?? '',
    performedon: formatAuditOn(item.performed_at),
    notes: item.notes ?? '',
    assignedTo: item.workcategory_name ?? '—',
    responseTime: item.response_time ?? '—',
    qualityChecks,
    cap: capList,
    capTaken: selectedCapList.map((c) => c.cap_name ?? c.short_name).filter(Boolean),
    capTakenRaw: selectedCapList,
    order: {
      order_id: item.order_id ?? '-',
      order_no: item.order_no ?? '-',
      buyer: item.buyer ?? '',
      order_code: item.order_code ?? '-',
      tlsCode: item.order_id ?? '',
      machineNo: item.machine_id ?? '',
      machineID: item.machine_no ?? '',
      colour: colourName,
      colourHex: getColourHex(colourName),
      style: item.style_name ?? '',
      styleNo: item.style_no ?? '',
      lineNo: item.line_name ?? '',
      name: item.workcategory_name ?? '',
      operation: item.operation_name ?? '',
      machineType: item.machine_type_name ?? '',
      slot: `${item.slot_start} - ${item.slot_end}`,
    },
    operator: {
      order_id: item.order_id ?? '-',
      order_no: item.order_no ?? '-',
      order_code: item.order_code ?? '-',
      buyer: item.buyer ?? '',
      tlsCode: item.order_code ?? '',
      colour: colourName,
      machineNo: item.machine_id ?? '',
      machineID: item.machine_no ?? '',
      colourHex: getColourHex(colourName),
      style: item.style_name ?? '',
      styleNo: item.style_no ?? '',
      lineNo: `${item.line_name}` ?? '',
      name: item.Empname ?? '',
      employeeId: item.EmpId ?? '-',
      operation: item.operation_name ?? '',
      slot: `${item.slot_start} - ${item.slot_end}`,
      machineType: item.machine_type_name ?? '',
      displayName: item.buyer ? `${item.buyer} (${item.style_no ?? ''})` : '',
      machineSummary: item.machine_type_name ? `${item.machine_type_name}  .  ${item.operation_name ?? ''}` : '',
    },
    swatch: item.order_no ? `${item.order_no}  .  ${colourName}` : '',
    raw: item,
  };
};
export const getLineMappingOrders = async (overrideLineIds, { search = '', page = 1 } = {}) => {
  const [selectedShiftId, shiftData, storedLineIds] = await Promise.all([
    getSelectedShiftId(),
    getShiftData(),
    getLineIds(),
  ]);

  const shiftId = selectedShiftId ?? shiftData?.shift_id ?? null;
  const lineIdsSource = (overrideLineIds && overrideLineIds.length ? overrideLineIds : storedLineIds) ?? [];
  const line_id = lineIdsSource.length ? lineIdsSource[0] : null;
  console.log("tls audit shift " + shiftId + " line id " + line_id + " page " + page + " search " + search);
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DROPDOWN.LINEMAPPING,
    body: { shift_id: shiftId, line_id, search: search || '', page, limit: PAGE_SIZE },
  });

  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load orders.');
    return { success: false, data: [], total: 0, page, hasMore: false };
  }
  const payload = result.data?.data ? result.data : { data: result.data };
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const total = payload.total ?? rows.length;
  const currentPage = payload.page ?? page;
  const hasMore = currentPage * PAGE_SIZE < total;

  return { success: true, data: rows.map(mapOrder), total, page: currentPage, hasMore };
};

export const filterOrders = (orders, query) => {
  const q = (query || '').trim().toLowerCase();
  if (!q) return orders;
  return orders.filter((o) =>
    [o.tlsCode, o.order_code, o.buyer, o.style, o.styleNo, o.colour]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );
};

export const checkDeviceMapping = async ({ tlsId, machineId }) => {
  const [selectedShiftId, shiftData] = await Promise.all([
    getSelectedShiftId(),
    getShiftData(),
  ]);
  const shiftId = selectedShiftId ?? shiftData?.shift_id ?? null;

  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DEVICEMAPPING.CHECK,
    body: { shift_id: shiftId, tls_id: tlsId, machine_id: machineId },
  });

  return result;
};

export const getQCAuditList = async ({ page = 1, lineId, search = '' } = {}) => {
  const shift_id = await resolveShiftId();

  const body = {
    page,
    per_page: PAGE_SIZE,
    search: search || '',
  };
  if (lineId && lineId !== 'all') body.line_id = lineId;
  console.log("getQCAuditList", " as " + JSON.stringify(body));

  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.AUDIT.QCAUDITLIST,
    body,
  });
  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load QC issues.');
    return { success: false, data: [], total: 0, page, hasMore: false };
  }

  const payload = result.data?.data ? result.data : { data: result.data };
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const total = payload.total ?? rows.length;
  const currentPage = payload.page ?? page;
  const mapped = rows.map(mapAuditItemQC);
  const hasMore = currentPage * PAGE_SIZE < total;

  return { success: true, data: mapped, total, page: currentPage, hasMore };
};

const resolveShiftId = async () => {
  const [selectedShiftId, shiftData] = await Promise.all([
    getSelectedShiftId(),
    getShiftData(),
  ]);
  return selectedShiftId ?? shiftData?.shift_id ?? null;
};

const unwrap = (result) => (Array.isArray(result.data) ? result.data : (result.data?.data ?? []));

export const getOperationDefects = async (operationId) => {
  const shift_id = await resolveShiftId();
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.AUDIT.OPERATION_DEFECTS,
    body: { shift_id, operation_id: operationId },
  });
  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load possible defects.');
    return [];
  }
  return unwrap(result);
};

export const getCategoryDropdown = async () => {
  const shift_id = await resolveShiftId();
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DROPDOWN.CATEGORY,
    body: { shift_id },
  });
  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load categories.');
    return [];
  }
  return unwrap(result);
};


// ── AQL Allowed Defects (/aqlaudit/aqlalloweddefects) ─────────────────
// FIX #1: `branch_id` is required by the endpoint (see Postman screenshot)
// but was never sent — the endpoint had no way to resolve the correct AQL
// table for the caller's branch, so Sample Size / Allowed Defects on
// AQLOrderDetailsScreen came back empty.
// FIX #2: `payload` was previously assigned without `const`/`let`, which
// silently created an implicit global — a real bug under strict mode /
// Hermes strict compilation, now scoped properly.
export const getAQLAllowedDefects = async (
  inspection_qty,
  level,
  major_aql_level,
  minor_aql_level,
  critical_aql_level,
  branch_id,
) => {
  const payload = {
    inspection_qty,
    level,
    major_aql_level,
    minor_aql_level,
    critical_aql_level,
    branch_id,
  };
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.AQLAUDIT.DEFECTSLIST,
    body: payload,
  });
  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load allowed defects.');
    return null;
  }
  return unwrapNew(result);
};
const unwrapNew = (result) => result?.data ?? {};

 
export const submitAqlAudit = async ({
  lineId,
  orderInfo,
  styleInfo,
  inspectionSetup,
  entries,
  submittedBy,
  is_escalate,
  notes
}) => {
  const shift_id = await resolveShiftId();

  const branch_id =
    submittedBy?.branch_id ??
    submittedBy?.branchId ??
    submittedBy?.branch?.id ??
    null;

  const team_id = submittedBy?.team_id ?? submittedBy?.teamId ?? null;
 
  const defects = (entries ?? []).map((e) => ({
    category_id: e.category_id,
    category_name: e.category_name,
    defect_id: e.defect_id,
    defect_name: e.defect_name,
    severity_id: e.severity_id,
    severity_name: e.severity_name,
    qty: e.qty,
  }));

  const payload = {
    line_id: lineId,
    order_id:orderInfo?.id,
    order_no: orderInfo?.orderNo ?? orderInfo?.order_no ?? '',
    style_id: styleInfo?.id ?? styleInfo?.style_id ?? null,
    branch_id,
    shift_id,
    team_id,
    inspection_level: inspectionSetup?.level?.value ?? null,
    aql_level_major: inspectionSetup?.aqlMajor?.value ?? null,
    aql_level_minor: inspectionSetup?.aqlMinor?.value ?? null,
    aql_level_critical: 0,
    size: inspectionSetup?.size?.value ?? null,
    inspection_qty: inspectionSetup?.qty ?? 0,
    sample_size: inspectionSetup?.sampleSize ?? 0,
    defect_count: String(defects.length),
    defects,
    is_escalate,
    notes
  };

  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.AQLAUDIT.CREATE,  
    body: payload,
  });

  if (!result?.success) {
    showAlert('error', 'Submit Failed', result?.message ?? 'Could not submit the AQL audit.');
  }
  return result;
};


const resolveDropdownContext = async () => {
  const [user, shift_id] = await Promise.all([getUser(), resolveShiftId()]);
  return {
    branch_id: user?.branch_id ?? null,
    team_id: user?.team_id ?? null,
    shift_id,
  };
};


export const getDefectList = async (categoryId,severityId) => {
  console.log("defect list cat id "+categoryId+" sev id "+severityId);

   const shift_id = await resolveShiftId();

   const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.AUDIT.MOBILEDEFECT,
    body: { shift_id, category_id: categoryId ,severity_id: severityId },
  });
  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load defects.');
    return [];
  }
  return unwrap(result);
};

export const getAuditList = async ({ page = 1, lineId, search = '', status = '', type = '' } = {}) => {
  const shift_id = await resolveShiftId();

  const body = {
    page,
    limit: PAGE_SIZE,
    search: search || '',
    status: status || '', 
    type: type || '',
    shift_id,
  };
  if (lineId && lineId !== 'all') body.line_id = lineId;
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.AUDIT.TLSAUDITLIST,
    body,
  });
  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load TLS issues.');
    return { success: false, data: [], total: 0, page, hasMore: false };
  }

  const payload = result.data?.data ? result.data : { data: result.data };
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const total = payload.total ?? rows.length;
  const currentPage = payload.page ?? page;
  const mapped = rows.map(mapAuditItem);
  const hasMore = currentPage * PAGE_SIZE < total;

  return { success: true, data: mapped, total, page: currentPage, hasMore };
};
export const getEscalationList = async ({ page = 1, lineId, search = '', status = '', type = '' ,from_date='',to_date=''} = {}) => {
 
  const body = {
    page,
    limit: PAGE_SIZE,
    search: search || '',
    status: status || '',
    type: type || '',
     from_date:from_date,
    to_date:to_date
  };
  if (lineId && lineId !== 'all') body.line_id = lineId;

  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.ESCALATION.LIST,
    body,
  });

  if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load escalations.');
    return { success: false, data: [], total: 0, page, hasMore: false };
  }

  const payload = result.data ?? {};
  const rows = Array.isArray(payload.records) ? payload.records : [];
  const pagination = payload.pagination ?? {};
  const total = pagination.total ?? rows.length;
  const currentPage = pagination.page ?? page;
  const limit = pagination.limit ?? PAGE_SIZE;
  const mapped = rows.map(mapAuditItem);
  const hasMore = currentPage * limit < total;

  return { success: true, data: mapped, total, page: currentPage, hasMore };
};

export const createAudit = async (payload) => {
  console.log("tls audit submit " + JSON.stringify(payload));
  const result = await apiRequest({ method: 'POST', endpoint: ENDPOINTS.AUDIT.CREATE, body: payload });
  console.log("tls response " + result.success);
  if (!result.success) {
    showAlert('error', 'Submit Failed', result.message ?? 'Could not submit the audit.');
  }
  return result;
};
export const escationRetrieve = async (payload) => {
  console.log("escalation audit submit " + JSON.stringify(payload));
  const result = await apiRequest({ method: 'POST', endpoint: ENDPOINTS.ESCALATION.CREATE, body: payload });
  console.log("tls response " + result.success);
  if (!result.success) {
    showAlert('error', 'Submit Failed', result.message ?? 'Could not submit the audit.');
  }
  return result;
};

export const retrieveEscalated = async (payload) => {
  console.log("retrieve escalated  audit submit " + JSON.stringify(payload));
  const result = await apiRequest({ method: 'POST', endpoint: ENDPOINTS.ESCALATION.CREATE, body: payload });
  console.log("tls response " + result.success);
  if (!result.success) {
    showAlert('error', 'Submit Failed', result.message ?? 'Could not submit the audit.');
  }
  return result;
};

export const createTLSISSue = async (payload) => {
  console.log("tls audit submit " + JSON.stringify(payload));
  const result = await apiRequest({ method: 'POST', endpoint: ENDPOINTS.AUDIT.TLSISSUECREATE, body: payload });
  console.log("tls response " + result.success);
  if (!result.success) {
    showAlert('error', 'Submit Failed', result.message ?? 'Could not submit the audit.');
  }
  return result;
};

export const createQCAudit = async (payload) => {
  console.log("tls QC audit submit " + JSON.stringify(payload));
  const result = await apiRequest({ method: 'POST', endpoint: ENDPOINTS.QCVERIFICATION.CREATE, body: payload });
  console.log("tls response " + result.success);
  if (!result.success) {
    showAlert('error', 'Submit Failed', result.message ?? 'Could not submit the audit.');
  }
  return result;
};