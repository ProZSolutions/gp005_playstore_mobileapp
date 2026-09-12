import apiRequest from '../apiRequest';
import ENDPOINTS  from '../endpoints';
import { getZoneIds } from '../storage/authStorage';
import { showAlert } from '../../utils/AlertService';

export const createDeviceMapping = async ({ tlsId, machineId, shiftId }) => {
   const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DEVICEMAPPING.CREATE,
    body: { tls_id: tlsId, machine_id: machineId, shift_id: shiftId },
  });
  if (!result.success) {
    showAlert('error', 'Mapping Failed', result.message ?? 'Could not create the mapping.');
  }
  return result;
};


   
export const listDeviceMapping = async ({ tlsId, machineId, status, page, perPage }) => {
    const formattedDate = new Date().toISOString().split('T')[0];
    const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DEVICEMAPPING.LIST,
    body: { tls_id: tlsId, machine_id: machineId, status, page, per_page: perPage ,date:formattedDate},
  });
   if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load mapped devices.');
  }
  return result;
};
export const reworklistDeviceMapping = async ({ tlsId, machineId, status, page, perPage }) => {
const formattedDate = new Date().toISOString().split('T')[0];
    const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DEVICEMAPPING.REWORK_DEVICE_MAP,
    body: { tls_id: tlsId, machine_id: machineId, status, page, per_page: perPage ,date:formattedDate},
  });
   if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load mapped devices.');
  }
  return result;
};
export const rejectionlistDeviceMapping = async ({ tlsId, machineId, status, page, perPage }) => {
const formattedDate = new Date().toISOString().split('T')[0];
    const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DEVICEMAPPING.REJECTION_DEVICE_MAP,
    body: { tls_id: tlsId, machine_id: machineId, status, page, per_page: perPage ,date:formattedDate},
  });
   if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load mapped devices.');
  }
  return result;
};

export const listMachineList = async () => {
  const zoneIds = await getZoneIds();
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DROPDOWN.MACHINE_LIST,
    body: { zone_id: zoneIds },
  });
   if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load machine list.');
  }
  return result;
};
export const listDeviceList = async () => {
  const zoneIds = await getZoneIds();
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DROPDOWN.DEVICE_LIST,
    body: { zone_id: zoneIds },
  });
   if (!result.success) {
    showAlert('error', 'Load Failed', result.message ?? 'Could not load machine list.');
  }
  return result;
};