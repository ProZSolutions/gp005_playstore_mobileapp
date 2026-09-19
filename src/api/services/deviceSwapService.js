import apiRequest from '../apiRequest';
import ENDPOINTS  from '../endpoints';
import { showAlert } from '../../utils/AlertService';

// branch_id / team_id are added globally by apiRequest — don't pass them here.
// Like the other services, failures are alerted here and the result is returned as-is.

// Step 1a — scan the Qone device QR (contains the tls_code).
// data: { tls_id, tls_code, mac_id, machine_no, line_name, order_no, color,
//         buyer, style_no, style_name, machine_type_name, ... }
export const scanDevice = async (tlsCode) => {
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DEVICESWAP.SCAN_DEVICE,
    body: { tls_id: tlsCode },
  });
  if (!result.success) {
    showAlert('error', 'Device Not Found', result.message ?? 'Could not fetch details for this device.');
  }
  return result;
};

// Step 1b — scan the machine QR (contains the machine_no).
// data: { machine_id, machine_no, code, machine_type_name, brand, line_name, ... }
export const scanMachine = async (machineNo) => {
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DEVICESWAP.SCAN_MACHINE,
    body: { machine_no: machineNo },
  });
  if (!result.success) {
    showAlert('error', 'Machine Not Found', result.message ?? 'Could not fetch details for this machine.');
  }
  return result;
};

// Step 2 — confirm the swap from the review screen.
export const createDeviceSwap = async ({ tlsId, machineNo }) => {
  const result = await apiRequest({
    method: 'POST',
    endpoint: ENDPOINTS.DEVICESWAP.CREATE,
    body: { tls_id: tlsId, machine_no: machineNo },
  });
  if (!result.success) {
    showAlert('error', 'Swap Failed', result.message ?? 'Could not complete the swap. Please try again.');
  }
  return result;
};

export default { scanDevice, scanMachine, createDeviceSwap };