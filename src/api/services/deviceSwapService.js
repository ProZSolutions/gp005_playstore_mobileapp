import apiClient from '../apiClient';
import ENDPOINTS from '../endpoints';
export async function scanDevice(code) {
  try {
    const response = await apiClient.post(ENDPOINTS.DEVICESWAP.SCAN_DEVICE, {
      scan_code: code,
    });
    const body = response?.data ?? response;
    return {
      success: body?.status === 'success',
      message: body?.message,
      data: body?.data ?? null, // { id, raw: { tls_id, code, ... } }
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message ?? 'Something went wrong while reading the device QR code.',
      data: null,
    };
  }
}
 
export async function scanMachine(code) {
  try {
    const response = await apiClient.post(ENDPOINTS.DEVICESWAP.SCAN_MACHINE, {
      scan_code: code,
    });
    const body = response?.data ?? response;
    return {
      success: body?.status === 'success',
      message: body?.message,
      data: body?.data ?? null, // { id, machineNo, raw: { machine_type_name, ... } }
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message ?? 'Something went wrong while reading the machine QR code.',
      data: null,
    };
  }
} 
export async function getSwapReview({ deviceId, machineId }) {
  try {
    const response = await apiClient.post(ENDPOINTS.DEVICESWAP.REVIEW, {
      device_id: deviceId,
      machine_id: machineId,
    });
    const body = response?.data ?? response;
    return {
      success: body?.status === 'success',
      message: body?.message,
      data: body?.data ?? null, // { scan_one: {...}, scan_two: {...} }
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message ?? 'Something went wrong while loading the swap details.',
      data: null,
    };
  }
}

 export async function createDeviceSwap({ deviceId, machineId }) {
  try {
    const response = await apiClient.post(ENDPOINTS.DEVICESWAP.CREATE, {
      device_id: deviceId,
      machine_id: machineId,
    });
    const body = response?.data ?? response;
    return {
      success: body?.status === 'success',
      message: body?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message ?? 'Something went wrong while saving the swap.',
    };
  }
}

export default { scanDevice, scanMachine, getSwapReview, createDeviceSwap };