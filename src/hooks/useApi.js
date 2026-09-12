// ─── hooks/useApi.js ──────────────────────────────────────────────────────────
// Generic hook for any API call.
// Handles loading, error, data, and toast feedback automatically.
//
// Usage:
//   const { data, loading, error, execute } = useApi(fetchLineList);
//   useEffect(() => { execute({ zone_id: 1 }); }, []);

import { useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';   // optional — remove if not used

/**
 * @param {function} apiFn        A service function that returns an ApiResult
 * @param {object}   options
 * @param {boolean}  [options.showSuccessToast=false]  Show toast on success
 * @param {boolean}  [options.showErrorToast=true]     Show toast on error
 * @param {function} [options.onSuccess]               Callback(data, message)
 * @param {function} [options.onError]                 Callback(message, errors)
 */
const useApi = (apiFn, options = {}) => {
  const {
    showSuccessToast = false,
    showErrorToast   = true,
    onSuccess,
    onError,
  } = options;

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [status,  setStatus]  = useState(null);

  /**
   * execute(...args) — call with whatever args the service function expects
   * Returns the full ApiResult so callers can also react inline if needed.
   */
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    const result = await apiFn(...args);
    setStatus(result.status);

    if (result.success) {
      setData(result.data);

      if (showSuccessToast) {
        Toast.show({ type: 'success', text1: result.message });
      }
      onSuccess?.(result.data, result.message);
    } else {
      setError(result.message);

      if (showErrorToast) {
        Toast.show({ type: 'error', text1: result.message });
      }
      onError?.(result.message, result.errors);
    }

    setLoading(false);
    return result;   // ← still return full result for inline handling
  }, [apiFn, showSuccessToast, showErrorToast, onSuccess, onError]);

  /** Manual reset if you need to clear state between screens */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setStatus(null);
    setLoading(false);
  }, []);

  return { data, loading, error, status, execute, reset };
};

export default useApi;