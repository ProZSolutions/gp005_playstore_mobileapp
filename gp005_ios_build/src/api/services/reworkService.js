import apiRequest from '../apiRequest';
import ENDPOINTS from '../endpoints';
import { getUser, PAGE_SIZE } from '../storage/authStorage';
import { showAlert } from '../../utils/AlertService';
import { getColourHex, formatCreatedOn } from './tlsService';

const mapReworkOrder = (item) => ({
  id: item.id,
  uuid: item.uuid,

  tlsCode: item.order_no ?? item.order_code ?? '',
  order_code: item.order_no ?? '',
  orderCode: item.order_no ?? '',

  colour: item.colour ?? '',
  colourHex: getColourHex(item.colour),
  buyer: item.buyer ?? '',

  style: item.style?.style_name ?? '',
  styleNo: item.style?.style_no ?? '',
  styleId: item.style_id ?? item.style?.id ?? null,

  orderQty: item.order_qty ?? 0,
  prodQty: item.prod_qty ?? 0,
  totalSize: item.total_size ?? 0,

  sizes: item.sizes ?? [],
  orderSizes: item.sizes_with_limit ?? [],

  createdOn: formatCreatedOn(item.created_at),

  status: item?.status ?? '2',
  status_name:
    item?.status === 2 || item?.status === '2'
      ? 'New'
      : item?.status === 3 || item?.status === '3'
      ? 'Failed'
      : (item?.status_name ?? 'New'),

  raw: item,
});
export const mapOrderSizes = (orderSizes = []) =>
  (Array.isArray(orderSizes) ? orderSizes : [])
    .filter((s) => s?.size)
    .map((s) => ({
      id: String(s.size).toUpperCase(),
      label: String(s.size).toUpperCase(),
      sizeId: s.id,
    }));
 
const mapEmployee = (item) => ({
  id: item.id,
  name: item.full_name ?? `${item.first_name ?? ''} ${item.last_name ?? ''}`.trim(),
  code: item.code ?? '',
  role: item.code ?? '',
  raw: item,
}); 
const mapOperation = (item) => ({
  id: item.id,
  label: item.operation_name ?? '', 
  machineType: item.machine_type_name ?? 'No Type Name',
  machine_type_id:item.machine_type_id ??null,
  machine_id:item.machine_id??null,
  code: item.code ?? '',
  sam: item.sam ?? null,
  defects: item.defects ?? [],
  raw: item,
});
 
const SEVERITY_BADGE = {
  Critical: { bg: '#DC2626', text: '#FFFFFF' },
  Major: { bg: '#F59E0B', text: '#FFFFFF' },
  Minor: { bg: '#3B82F6', text: '#FFFFFF' },
};
 
export const formatAuditOn = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n) => String(n).padStart(2, '0');

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const mapReworkTrackerIssue = (item) => ({
  id: item.id,
  uuid: item.uuid,
  reworkId: item.rework_id,
  name:item.name,
   tlsCode:item?.order_no ?? item?.order_code,
  colour: item.colour ?? '',
  colourHex: getColourHex(item.colour),
  buyer: item.buyer ?? '',
  style: item.style_name ?? '',
  styleNo: item.style_no ?? '',
  qr_code:item.qr_code?? 'No QR',
  createdOn: formatAuditOn(item.created_at),
  formatDate:formatCreatedOn(item.created_at),
  wip:item.wip??'0',

   tls_id: item.tls_id ?? null, 
  tls_no: item.tls_no ?? null,
 extraLabel: item.category_name
    ? `${item.category_name}  `
    : (item.severity_name ?? null),
   displayId: item.order_no ?? item.order_code ?? String(item.id ?? ''),
  severity: {
    label: item.severity_name ?? '—',
    ...(SEVERITY_BADGE[item.severity_name] ?? { bg: '#9CA3AF', text: '#FFFFFF' }),
  },
  lineLabel: item.line_name ?? '—',
  swatchCode: item.order_code ?? '',
  swatchName: item.colour ?? '',
  styleNo2: item.style_no ?? '',
  defectCategory: item.category_name ?? '',
  defect: item.defect_name ?? '',
  quantity: Number(item.qty ?? 0),
  auditTime: formatCreatedOn(item.created_at),
  size: item.size ?? null,
  defectFound: Number(item.qty ?? 0),
  rejectionDefectCategory: item.category_name ?? '', 
  verdict: item.rework_status ?? null,
  escalation: item.is_escalate === '1' || item.is_escalate === 1,
  slotName: item.slot_name ?? '',
   status: item?.status ?? '2',
   assignee:`${item.assignemp_name} (${item.assignemp_code}) `,
   operator_name:item.operator_name,
   operator_code:item.operator_code,
   operator:`${item.operator_name} (${item.operator_code}) `,
  status_name:
    item?.status === 2 || item?.status === '2'
      ? 'New'
      : item?.status === 3 || item?.status === '3'
      ? 'Failed'
      : (item?.status_name ?? 'New'),
  raw: item,
});

const resolveBranchId = async (branchId) => {
  if (branchId) return branchId;
  try {
    const user = await getUser();
    return user?.branch_id ?? null;
  } catch (e) {
    console.warn('ReworkService: failed to resolve branch_id', e.message);
    return null;
  }
};

class ReworkService {

  async getOrders({ branchId, lineId, search = '', page = 1, limit = PAGE_SIZE } = {}) {
    const resolvedBranchId = await resolveBranchId(branchId);

    const body = {
      branch_id: resolvedBranchId,
      search: search || '',
      page,
      limit,
    };
    if (lineId && lineId !== 'all') body.line_id = lineId;

 
    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.REWORK.ORDER_DROPDOWN,
      body,
    });

    if (!result.success) {
      showAlert('error', 'Load Failed', result.message ?? 'Could not load rework orders.');
      return { success: false, data: [], total: 0, page, hasMore: false };
    }

    const payload = result.data ?? {};
    const rows = Array.isArray(payload.records)
      ? payload.records
      : Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(result.data)
          ? result.data
          : [];

    const total = payload.total ?? rows.length;
    const currentPage = payload.page ?? page;
    const hasMore = currentPage * limit < total;

    return {
      success: true,
      data: rows.map(mapReworkOrder),
      total,
      page: currentPage,
      hasMore,
    };
  }

 
  async getReworkList({
    branchId,
    teamId,
    lineId,
    shiftId,
    search = '',
    status = '',
    type = '',
    page = 1,
    limit = PAGE_SIZE,
  } = {}) {
    const resolvedBranchId = await resolveBranchId(branchId);

    const body = {
      page,
      limit,
      search: search || '',
      status,
      type,
      branch_id: resolvedBranchId,
      team_id: teamId,
      line_id: lineId,
      shift_id: shiftId,
    };

    console.log('reworktracker reworklist request', JSON.stringify(body));

    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.REWORKTRACKER.LIST,
      body,
    });

    if (!result.success) {
      showAlert('error', 'Load Failed', result.message ?? 'Could not load rework tracker list.');
      return { success: false, data: [], total: 0, page, hasMore: false };
    }
 
    const payload = result.data ?? {};
    const rows = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

    const total = payload.total ?? rows.length;
    const currentPage = payload.page ?? page;
    const hasMore = limit ? currentPage * limit < total : false;

    return {
      success: true,
      data: rows.map(mapReworkTrackerIssue),
      total,
      page: currentPage,
      hasMore,
    };
  }
 async checkTlsDevice({ qr_code, type } = {}) {
  if (!qr_code) {
    return {
      success: false,
      message: "Rework QR Code not present",
    };
  }

  if (!type) {
    return {
      success: false,
      message: "Type not present",
    };
  }

  const body = {
    qr_code,
    type,
  };

  const endpointurl =
    type === "rework"
      ? ENDPOINTS.REWORK.QRCODE
      : ENDPOINTS.REWORK.REJQRCODE;

  const result = await apiRequest({
    method: "POST",
    endpoint: endpointurl,
    body,
  });

  console.log("mapped result "+JSON.stringify(result));

  if (!result.success) {
    return {
      success: false,
      message: result.message ?? "Device validation failed.",
    };
  }

  const isMapped = result.data?.is_mapped ?? 0;

  if (Number(isMapped) === 1) {
    return {
      success: false,
      isMapped: true,
      message: "The QR code is already mapped.",
    };
  }

  return {
    success: true,
    isMapped: false,
  };
}
  async getWipBalance({ branchId, orderId, lineId } = {}) {
    const resolvedBranchId = await resolveBranchId(branchId);

    if (!orderId) {
      console.warn('ReworkService.getWipBalance: missing orderId');
      return { success: false, wipCount: 0, outputBalance: 0 };
    }

    const body = {
      branch_id: resolvedBranchId,
      order_id: orderId,
      line_id: lineId,
    };

    console.log('rework wipbal request', JSON.stringify(body));

    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.REWORK.WIPBAL,
      body,
    });

    if (!result.success) {
      showAlert('error', 'Load Failed', result.message ?? 'Could not load output balance.');
      return { success: false, wipCount: 0, outputBalance: 0 };
    }
 
    const records = result.data?.data?.records ?? result.data?.records ?? {};

    return {
      success: true,
      wipCount: records.wip_count ?? 0,
      outputBalance: records.output_balance ?? 0,
    };
  }



  async getAutoOperator({ tls_id, machine_id, lineId ,order_id} = {}) {
 
    if (!order_id) {
       return { success: false, machine_type_name:'', operation_name: '' };
    }

    const body = {
      tls_id:tls_id,
      machine_id:machine_id,
       order_id: order_id,
      line_id: lineId,
    };

 
    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.DROPDOWN.AUTOOPERATOR,
      body,
    });

    if (!result.success) {
       return { success: false, machine_type_name:'No Name', operation_name: 'No Name' };
    }
     const records = result?.data ??  {};
     return {
      success: true,
      machine_type_name: records.machine_type_name ?? 0,
      operation_name: records.operation_name ?? 0,
      operation_id:records.operation_list.operation_id ?? 0,
      machine_type_id:records.machineInfo.machine_type_id,
      operator_name:records.operator_name ??null,
            operator_id:records.operator_id??null,
            operator_code:records.operator_code ??null,
    };
  }

 
  async getEmployeeList({  shiftId } = {}) {
  
    const body = { 
      shift_id: shiftId,
    };

 
    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.DROPDOWN.EMPLOYEE_LIST,
      body,
    });

    if (!result.success) {
      showAlert('error', 'Load Failed', result.message ?? 'Could not load employee list.');
      return { success: false, data: [] };
    }

     const rows =
  Array.isArray(result.data)
    ? result.data
    : Array.isArray(result.data?.data)
    ? result.data.data
    : [];

    return {
      success: true,
      data: rows.map(mapEmployee),
    };
  } 
  async getOperationList({ shiftId, orderId,styleId } = {}) { 
    console.log(" operaton list in rej "+shiftId+" oder id "+orderId+" style "+styleId);
    const body = { 
      shift_id: shiftId,
      order_id:orderId,
      style_id:styleId
    };
 
    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.DROPDOWN.OPERATION_LIST,
      body,
    });

 
    if (!result.success) {
      showAlert('error', 'Load Failed', result.message ?? 'Could not load operation list.');
      return { success: false, data: [] };
    }

    const rows =
  Array.isArray(result.data)
    ? result.data
    : Array.isArray(result.data?.data)
    ? result.data.data
    : [];

    return {
      success: true,
      data: rows.map(mapOperation),
    };
  }
  
  
  async createRework(payload = {}) {
    const resolvedBranchId = await resolveBranchId(payload.branch_id);
    const body = { ...payload, branch_id: resolvedBranchId };

    console.log('rework create request', JSON.stringify(body));

    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.REWORK.CREATE,
      body,
    });


    console.log("response from reworj "+JSON.stringify(result));

    if (!result.success) {
      showAlert('error', 'Submit Failed', result.message ?? 'Could not submit rework.');
      return { success: false, message: result.message };
    }

    return { success: true, data: result.data };
  }

   async createReworkTracker(payload = {}) {
    const resolvedBranchId = await resolveBranchId(payload.branch_id);
    const body = { ...payload, branch_id: resolvedBranchId };

    console.log('rework create request', JSON.stringify(body));

    const result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.REWORKTRACKER.CREATE,
      body,
    });

    if (!result.success) {
      showAlert('error', 'Submit Failed', result.message ?? 'Could not submit rework.');
      return { success: false, message: result.message };
    }

    return { success: true, data: result.data };
  }
}

export default new ReworkService();