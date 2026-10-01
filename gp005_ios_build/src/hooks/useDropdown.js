// ─── hooks/useDropdown.js ─────────────────────────────────────────────────────
// Specialized hook for dropdown lists.
// Auto-fetches on mount and formats data for Picker / FlatList / Select.
//
// Usage:
//   const { options, loading } = useDropdown(fetchLineList, { zone_id: 9 });
//   // options → [{ label: 'Line a', value: '7b986a3b-...' }, ...]

import { useEffect, useState, useCallback } from 'react';

/**
 * @param {function} apiFn          Service function to call
 * @param {object}   filters        Body params passed to the API
 * @param {object}   mapOptions     How to map the raw item to { label, value }
 * @param {string}   [mapOptions.labelKey='name']
 * @param {string}   [mapOptions.valueKey='uuid']
 * @param {boolean}  [fetchOnMount=true]
 */
const useDropdown = (
  apiFn,
  filters      = {},
  mapOptions   = {},
  fetchOnMount = true,
) => {
  const { labelKey = 'name', valueKey = 'uuid' } = mapOptions;

  const [options, setOptions] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchOptions = useCallback(async (overrideFilters) => {
    setLoading(true);
    setError(null);

    const result = await apiFn(overrideFilters ?? filters);

    if (result.success) {
      const list = Array.isArray(result.data) ? result.data : [];
      setRawData(list);
      setOptions(
        list.map((item) => ({
          label: item[labelKey] ?? item.name ?? item.title ?? '',
          value: item[valueKey] ?? item.uuid ?? item.id,
          raw:   item,   // full item attached for reference
        }))
      );
    } else {
      setError(result.message);
    }

    setLoading(false);
  }, [apiFn, labelKey, valueKey]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fetchOnMount) fetchOptions();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return { options, rawData, loading, error, refetch: fetchOptions };
};

export default useDropdown;