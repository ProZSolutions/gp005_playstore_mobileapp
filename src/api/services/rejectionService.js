  import apiRequest from '../apiRequest';
  import ENDPOINTS from '../endpoints';
  import { getUser, PAGE_SIZE } from '../storage/authStorage';
  import { showAlert } from '../../utils/AlertService';
  import { getColourHex, formatCreatedOn ,formatAuditOn} from './tlsService';
export function normalizeOrder(record = {}) {
  return {
    id: record.id,
    uuid: record.uuid,
    tlsCode: record.order_code || record.order_no || String(record.id ?? ''),
    orderNo: record.order_no,
    orderCode: record.order_code,
    colour: record.colour,
    colourHex: getColourHex(record.colour),
    buyer: record.style.buyer,
    style_id:record.style.id,
    style: record.style.style_name,
    styleNo: record.style.style_no,
    styleId: record.style_id,
    orderQty: record.order_qty,
    prodQty: record.prod_qty,
    totalSize: record.total_size,
    totalProd:record.tot_prd_ord_qty,
    balQty: record.bal_qty,
    exFacDate: record.ex_fac_date,
    createdOn:formatDisplayDate(record.created_at ?? record.ex_fac_date),
    orderSizes: Array.isArray(record.orderSizes) ? record.orderSizes : [],
    sizeslimit:Array.isArray(record.sizes_with_limit) ?record.sizes_with_limit:[],
    sizes:Array.isArray(record.sizes) ?record.sizes:[],
    wip:record.wip,
    _raw: record,
  };
}
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
    status:item?.status ??'2',
    status_name:item?.status_name ?? 'New',
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
  
  export const mapRejectionTrackerIssue = (item) => ({
    id: item.id,
    uuid: item.uuid,
    rejectionId: item.rejection_id,
    tlsCode:  item?.order_no ?? item?.order_code,
    colour: item.colour ?? '',
    colourHex: getColourHex(item.colour),
    buyer: item.buyer ?? '',
    qr_code:item.qr_code ?? 'No QR',
    style: item.style_name ?? '',
    styleNo: item.style_no ?? '',
    createdOn: formatAuditOn(item.created_at),
    formatDate:formatCreatedOn(item.created_at),
    name:item.name,
    wip: item.wip ?? 0, 
    tls_id: item.tls_id ?? null,
    status: item?.status ?? '2',
    status_name:
      item?.status === 2 || item?.status === '2'
        ? 'New'
        : item?.status === 1 || item?.status === '1'
        ? 'Rejected'
        : (item?.status_name ?? 'New'),
  
    displayId: item.order_code ?? String(item.id ?? ''),
    severity: {
      label: item.severity_name ?? '—',
      ...(SEVERITY_BADGE[item.severity_name] ?? {
        bg: '#9CA3AF',
        text: '#FFFFFF',
      }),
    },
    operator_name:item.operator_name,
    operator_code:item.operator_code,
    operation_name:item.operation_name,
    machine_type_name:item.machine_type_name,
    lineLabel: item.line_name ?? '—',
    swatchCode: item.order_code ?? '',
    swatchName: item.colour ?? '',
    defectCategory: item.category_name ?? '',
    defect: item.defect_name ?? '',
    quantity: Number(item.qty ?? 0),
    auditTime: formatCreatedOn(item.created_at),
    size: item.size ?? null,

    extraLabel: item.category_name
      ? `${item.category_name}  `
      : (item.severity_name ?? null),

    action: item.rejection_status ?? null,
    notes: item.notes ?? '',
    escalation: item.is_escalate === '1' || item.is_escalate === 1,
    slotName: item.slot_name ?? '',

    raw: item,
  });

  const resolveBranchId = async (branchId) => {
    if (branchId) return branchId;
    try {
      const user = await getUser();
      return user?.branch_id ?? null;
    } catch (e) {
      console.warn('RejectionService: failed to resolve branch_id', e.message);
      return null;
    }
  };

  class ReworkService {


    async checkingListShow({orderId}={}){
      const body ={
        order_id:orderId
      }
       const result = await apiRequest({
        method: 'POST',
        endpoint: ENDPOINTS.CHECKING.SHOW,
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
        data: rows.map(normalizeOrder),
        total,
        page: currentPage,
        hasMore,
      };
    }



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
        endpoint: ENDPOINTS.REJECTION.ORDER_DROPDOWN,
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

    
    async getRejectionList({
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

  
      const result = await apiRequest({
        method: 'POST',
        endpoint: ENDPOINTS.REJECTIONTRACKER.LIST,
        body,
      });

      if (!result.success) {
        showAlert('error', 'Load Failed', result.message ?? 'Could not load rejection tracker list.');
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
        data: rows.map(mapRejectionTrackerIssue),
        total,
        page: currentPage,
        hasMore,
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
        endpoint: ENDPOINTS.REJECTION.WIPBAL,
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
    async getOperationList({ shiftId,orderId,styleId } = {}) { 

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
        endpoint: ENDPOINTS.REJECTION.CREATE,
        body,
      });

      if (!result.success) {
        showAlert('error', 'Submit Failed', result.message ?? 'Could not submit rework.');
        return { success: false, message: result.message };
      }
  
      return { success: true, data: result.data };
    }

  
    async createRejectionTracker(payload = {}) {
      const resolvedBranchId = await resolveBranchId(payload.branch_id);
      const body = { ...payload, branch_id: resolvedBranchId };

      console.log('rejectiontracker create request', JSON.stringify(body));

      const result = await apiRequest({
        method: 'POST',
        endpoint: ENDPOINTS.REJECTIONTRACKER.CREATE,
        body,
      });

      if (!result.success) {
        showAlert('error', 'Submit Failed', result.message ?? 'Could not submit rejection status.');
        return { success: false, message: result.message };
      }

      return { success: true, data: result.data };
    }
  }

  export default new ReworkService();