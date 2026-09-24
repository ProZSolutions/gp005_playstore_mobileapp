import apiRequest from '../apiRequest';
import ENDPOINTS from '../endpoints';
import { getUser, PAGE_SIZE } from '../storage/authStorage';
import { showAlert } from '../../utils/AlertService';
import { getColourHex } from './aqlAuditService';
 
const API_TYPE_MAP = {
  product_audit: 'tls_audit',
  process_audit: 'tls_audit',
  audit: 'tls_audit',
};
const toApiType = (type) => (type ? API_TYPE_MAP[type] ?? type : '');
 
export const mapReportItem = (item = {}, uiType = '') => {
  const recordType = item.record_type ?? uiType ?? '';
  const colour = item.colour ?? item.color_id ?? item.color ?? '';
  const stableId = item.uuid ?? item.id;

  return {
    id: stableId,
    key: `${recordType || 'record'}-${stableId}`,
    uuid: item.uuid,
    displayId: item.order_no ?? item.order_code ?? '-',
    lineLabel: item.line_name ?? '',
    colour,
    colourHex: getColourHex(colour),
    createdAt: item.created_at ?? item.audit_at ?? null,
    raw: {
      ...item,
      record_type: recordType,
      colour,
      buyer_name: item.buyer_name ?? item.buyer ?? '',
    },
  };
};
 
export const getReportList = async ({
  page = 1,
  pageSize = PAGE_SIZE,
  type = '',
  search = '',
  from_date = '',
  to_date = '',
} = {}) => {
  const failure = { success: false, data: [], total: 0, page, hasMore: false };

  let user = null;
  try {
    user = await getUser();
  } catch (e) {
   }

  const body = { page, limit: pageSize };
  const apiType = toApiType(type);
  if (apiType) body.type = apiType;
  if (user?.branch_id != null) body.branch_id = user.branch_id;
  if (user?.team_id != null) body.team_id = user.team_id;
  if (from_date) body.from_date = from_date;
  if (to_date) body.to_date = to_date;
  if (search) body.search = search;

  let result;
  try {
    result = await apiRequest({
      method: 'POST',
      endpoint: ENDPOINTS.REPORT.LIST,
      body,
    });
  } catch (e) {
    showAlert('error', 'Load Failed', e?.message ?? 'Could not load reports.');
    return failure;
  }

  if (!result?.success) {
    showAlert('error', 'Load Failed', result?.message ?? 'Could not load reports.');
    return failure;
  }

  const payload = result.data?.data ? result.data : { data: result.data };
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const total = Number(payload.total ?? rows.length);
  const currentPage = Number(payload.page ?? page);
  const limit = Number(payload.limit ?? pageSize); 
  const hasMore = rows.length > 0 && currentPage * limit < total;

  return {
    success: true,
    data: rows.map((row) => mapReportItem(row, type)),
    total,
    page: currentPage,
    hasMore,
  };
};

 
export const retrieveReport = async ({ uuid, type, qc_audit_id = null }) => {
  const endpoint = ENDPOINTS.REPORT?.RETRIEVE ?? ENDPOINTS.ESCALATION.CREATE;
  const payload = { uuid, type, qc_audit_id };

  const result = await apiRequest({ method: 'POST', endpoint, body: payload });

  if (!result?.success) {
    showAlert('error', 'Retrieve Failed', result?.message ?? 'Could not retrieve the report.');
  }
  return result;
};