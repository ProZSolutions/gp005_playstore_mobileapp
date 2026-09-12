import apiClient from './apiClient';
import { encrypt, decrypt } from '../utils/crypto';
import { ENCRYPTED } from '../config/encryptionConfig';
import { getUser, clearAllSession } from '../api/storage/authStorage';
import { resetToLogin } from '../navigation/NavigationService';
import { showAlert } from '../utils/AlertService';

const isEncryptedShape = (payload) =>
  payload &&
  typeof payload === 'object' &&
  Object.keys(payload).length === 1 &&
  typeof payload.data === 'string';
const hasValue = (v) => v !== undefined && v !== null && v !== '';

let isHandlingAuthFailure = false;

const handleAuthFailure = async (reason) => {
  console.warn('handleAuthFailure fired — clearing session. Reason:', reason);
  if (isHandlingAuthFailure) return;
  isHandlingAuthFailure = true;
  try {
    await clearAllSession();
  } catch (e) {
    console.warn('clearAllSession failed during auth failure handling:', e.message);
  } finally {
    resetToLogin();
    setTimeout(() => { isHandlingAuthFailure = false; }, 2000);
  }
};

const withBranchAndTeam = async (payload) => {
  try {
    const user = await getUser();
    return {
      ...(payload ?? {}),
      branch_id: hasValue(payload?.branch_id) ? payload.branch_id : (user?.branch_id ?? null),
      team_id:   hasValue(payload?.team_id)   ? payload.team_id   : (user?.team_id   ?? null),
    };
  } catch (e) {
    console.warn('Could not read branch_id/team_id from Keychain:', e.message);
    return payload ?? {};
  }
};

const apiRequest = async ({ method = 'GET', endpoint, body, params, headers = {} }) => {
  try {
    console.log(" come to try block");
    const isGet = method.toUpperCase() === 'GET';
    let requestParams = params;
    let requestBody = body;

    if (isGet) {
      const merged = await withBranchAndTeam(params);
      requestParams = merged;
      requestBody = merged;
    } else {
      requestBody = await withBranchAndTeam(body);
    }

    console.log(" request params "+JSON.stringify(requestBody)+" end point "+endpoint);

    let outgoingData = requestBody;
    if (ENCRYPTED && !isGet) {
      outgoingData = { data: encrypt(requestBody) };
    }

    const response = await apiClient.request({
      method,
      url: endpoint,
      data: outgoingData,
      params: requestParams,
      ...(Object.keys(headers).length ? { headers } : {}),
      transformRequest: [(data) => JSON.stringify(data)],
    });

    let responseData = response.data;

    
    if (ENCRYPTED && isEncryptedShape(responseData)) {
      responseData = decrypt(responseData.data);
    }

    const { status } = response;
    return {
      success: responseData?.success ?? true,
      data: responseData?.data ?? responseData,
      message: responseData?.message ?? 'Success',
      status,
      errors: null,
    };
  } catch (error) {
    
    let serverData = error.response?.data ?? {};     
    if (ENCRYPTED && isEncryptedShape(serverData)) {
      try {
        serverData = decrypt(serverData.data);
      } catch (decryptErr) {
        console.warn('Could not decrypt error response:', decryptErr.message);
      }
    }

    const status = error.response?.status ?? 0;
    const message = serverData?.message
      || serverData?.error
      || error.message
      || 'Something went wrong';
    const errors = serverData?.errors ?? null;
 
    const isTokenError = status === 401;

    if (isTokenError) {
            showAlert('error', 'Auth Failed', message ?? 'Invalid Token');
      handleAuthFailure(`status ${status} message "${message}" endpoint ${endpoint}`);
    }

    return {
      success: false,
      data: serverData?.data ?? null,
      message,
      status,
      errors,
    };
  }
};

export default apiRequest;