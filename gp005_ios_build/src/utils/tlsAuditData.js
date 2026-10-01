const COLOUR_POOL = [
  { name: 'Golden Yellow', hex: '#E8B400' },
  { name: 'Navy Blue', hex: '#1E3A5F' },
  { name: 'Charcoal Grey', hex: '#4B4B4B' },
  { name: 'Forest Green', hex: '#2F6B3A' },
  { name: 'Maroon', hex: '#7A1F2B' },
  { name: 'Sky Blue', hex: '#4FA8D8' },
];

const BUYER_POOL = ['ABC Corp', 'XYZ Corp', 'LMN Apparel', 'Global Threads', 'Urban Fit', 'Trendline Inc'];

const STYLE_POOL = [
  { name: 'Polo T-Shirt', no: 'ST-001' },
  { name: 'V-Neck Shirt', no: 'ST-018' },
  { name: 'Crew Neck Tee', no: 'ST-022' },
  { name: 'Henley Shirt', no: 'ST-031' },
  { name: 'Denim Jacket', no: 'ST-044' },
];

const DATE_POOL = ['30 May, 2026', '22 May, 2026', '20 May, 2026', '15 May, 2026', '10 May, 2026'];

function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Hand-authored so Line A1 matches the design reference exactly.
// Every other line falls back to the deterministic generator below.
const OVERRIDES_BY_LINE = {
  la1: [
    { tlsCode: 'TLS-100045', colour: 'Golden Yellow', colourHex: '#E8B400', buyer: 'ABC Corp', style: 'Polo T-Shirt', styleNo: 'ST-001', createdOn: '30 May, 2026' },
    { tlsCode: 'TLS-100033', colour: 'Navy Blue', colourHex: '#1E3A5F', buyer: 'XYZ Corp', style: 'V-Neck Shirt', styleNo: 'ST-018', createdOn: '22 May, 2026' },
    { tlsCode: 'TLS-100032', colour: 'Charcoal Grey', colourHex: '#4B4B4B', buyer: 'LMN Apparel', style: 'Crew Neck Tee', styleNo: 'ST-022', createdOn: '20 May, 2026' },
  ],
};

function buildOrdersForLine(lineId, lineName, count = 2) {
  if (OVERRIDES_BY_LINE[lineId]) {
    return OVERRIDES_BY_LINE[lineId].map((o) => ({
      id: `${lineId}_${o.tlsCode}`,
      lineId,
      lineName,
      ...o,
    }));
  }

  const seed = seedFromString(lineId);
  return Array.from({ length: count }).map((_, idx) => {
    const colour = COLOUR_POOL[(seed + idx) % COLOUR_POOL.length];
    const buyer = BUYER_POOL[(seed + idx * 2) % BUYER_POOL.length];
    const style = STYLE_POOL[(seed + idx * 3) % STYLE_POOL.length];
    const createdOn = DATE_POOL[(seed + idx) % DATE_POOL.length];
    const tlsCode = `TLS-${100000 + (seed % 900) + idx * 7}`;

    return {
      id: `${lineId}_${tlsCode}`,
      lineId,
      lineName,
      tlsCode,
      colour: colour.name,
      colourHex: colour.hex,
      buyer,
      style: style.name,
      styleNo: style.no,
      createdOn,
    };
  });
}
 
export const getOrdersByLines = (lines = []) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const orders = lines.flatMap((line) => buildOrdersForLine(line.id, line.name));
      resolve(orders);
    }, 600);
  });

export const filterOrdersByQuery = (orders = [], query = '') => {
  const q = query.trim().toLowerCase();
  if (!q) return orders;
  return orders.filter((o) =>
    [o.tlsCode, o.colour, o.buyer, o.style, o.styleNo, o.lineName]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q)),
  );
};