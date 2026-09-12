// ─── api/transformers/orderTransformer.js ────────────────────────────────────
// Pure data-transformation helpers for order API responses.
// No state, no API calls — just data in, clean data out.
// Import these into any screen that needs order/colour dropdowns.

const ORDER_COLORS = [
  '#4F8EF7', // blue
  '#E85D75', // rose
  '#43C59E', // teal
  '#F7A94F', // amber
  '#9B6BF2', // violet
  '#F75D5D', // red
  '#4FC9F7', // sky
  '#A8D548', // lime
];

const getOrderColor = (index) => ORDER_COLORS[index % ORDER_COLORS.length];

/**
 * Extracts the records array from any order API response shape.
 * Handles: { data: { records: [] } }  |  { data: [] }  |  []
 */
export const extractOrderRecords = (data) => {
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data))          return data;
  return [];
};

/**
 * Builds a colorMap: { [order_no]: hexColor }
 * Each unique order_no gets a stable color from the palette.
 */
export const buildOrderColorMap = (records) => {
  const colorMap = {};
  let colorIdx   = 0;
  records.forEach((r) => {
    if (colorMap[r.order_no] === undefined) {
      colorMap[r.order_no] = getOrderColor(colorIdx++);
    }
  });
  return colorMap;
};

/**
 * Converts raw records into Dropdown 2 items (one row per unique order_no).
 * Returns: [{ label, value, color, raw }]
 */
export const buildOrderDropdownItems = (records, colorMap) => {
  const seen   = new Set();
  const result = [];
  records.forEach((r) => {
    if (!seen.has(r.order_no)) {
      seen.add(r.order_no);
      result.push({
        label: `Order #${r.order_no}  (${r.order_code})`,
        value: r.order_no,
        color: colorMap[r.order_no],
        raw:   r,
      });
    }
  });
  return result;
};

/**
 * Converts records of the same order_no into Dropdown 3 colour items.
 * @param {array}  records   - full records array
 * @param {number} order_no  - selected order_no to filter by
 * @param {string} color     - the group color for this order_no
 * Returns: [{ label, value, color, raw }]
 */
export const buildColorDropdownItems = (records, order_no, color) =>
  records
    .filter((r) => r.order_no === order_no)
    .map((r) => ({
      label: r.colour,
      value: r.uuid,
      color,
      raw:   r,
    }));

/**
 * Master helper — call once after a successful order API response.
 * Returns everything the screen needs in one shot.
 *
 * @param {any} responseData   result.data from apiRequest
 * @returns {{
 *   records:     array,
 *   colorMap:    object,
 *   orderItems:  array,   ← ready for Dropdown 2
 * }}
 */
export const transformOrderResponse = (responseData) => {
  const records    = extractOrderRecords(responseData);
  const colorMap   = buildOrderColorMap(records);
  const orderItems = buildOrderDropdownItems(records, colorMap);
  return { records, colorMap, orderItems };
};