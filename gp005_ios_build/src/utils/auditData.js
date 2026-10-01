export const QUALITY_CHECKS = [
  {
    id: 'spi',
    name: 'SPI Check',
    description: 'Verify stitches per inch against standard',
  },
  {
    id: 'tension',
    name: 'Tension Check',
    description: 'Check and maintain standard thread tension',
  },
  {
    id: 'trim',
    name: 'Trim Check',
    description: 'Trim attachment quality and placement',
  },
  
];

export const SPI_MIN = 0;
export const SPI_MAX = 24;

 export const POSSIBLE_DEFECTS = [
  { id: 'shape_off',     label: 'Shape off' },
  { id: 'over_stitch',   label: 'Over Stitch' },
  { id: 'spi_low',       label: 'SPI Low' },
  { id: 'open_seam',     label: 'Open Seam' },
  { id: 'puckering',     label: 'Puckering' },
  { id: 'skip_stitch',   label: 'Skip Stitch' },
  { id: 'broken_stitch', label: 'Broken Stitch' },
  { id: 'raw_edge',      label: 'Raw Edge' },
];

// ─── 7 Piece Types ────────────────────────────────────────────────────────────
export const PIECE_TYPES = [
  { id: 'piece_1', label: 'Piece 1' },
  { id: 'piece_2', label: 'Piece 2' },
  { id: 'piece_3', label: 'Piece 3' },
  { id: 'piece_4', label: 'Piece 4' },
  { id: 'piece_5', label: 'Piece 5' },
  { id: 'piece_6', label: 'Piece 6' },
  { id: 'piece_7', label: 'Piece 7' },
];

// ─── Defect Categories (4 defects each, with severity) ───────────────────────
// severity: 'minor' | 'major' | 'critical'
export const DEFECT_CATEGORIES = [
  {
    id: 'fabric',
    label: 'Fabric',
    defects: [
      { id: 'fab_shade',    label: 'Shade',          severity: 'minor'    },
      { id: 'fab_hole',     label: 'Holes',          severity: 'major'    },
      { id: 'fab_colorvar', label: 'Color Variation',severity: 'minor'    },
      { id: 'fab_openSeam', label: 'Open Seam',      severity: 'critical' },
    ],
  },
  {
    id: 'sewing',
    label: 'Sewing',
    defects: [
      { id: 'sew_skip',    label: 'Skip Stitch',    severity: 'major'    },
      { id: 'sew_pucker',  label: 'Puckering',      severity: 'minor'    },
      { id: 'sew_rawEdge', label: 'Raw Edge',       severity: 'major'    },
      { id: 'sew_broken',  label: 'Broken Thread',  severity: 'critical' },
    ],
  },
  {
    id: 'machine',
    label: 'Machine',
    defects: [
      { id: 'mac_tensHigh', label: 'High Tension',   severity: 'minor'    },
      { id: 'mac_tensLow',  label: 'Low Tension',    severity: 'major'    },
      { id: 'mac_needle',   label: 'Needle Break',   severity: 'critical' },
      { id: 'mac_feedDog',  label: 'Feed Dog Issue', severity: 'major'    },
    ],
  },
  {
    id: 'skill',
    label: 'Skill',
    defects: [
      { id: 'sk_shapeOff', label: 'Shape Off',       severity: 'major'    },
      { id: 'sk_overStitch',label: 'Over Stitch',    severity: 'minor'    },
      { id: 'sk_misalign', label: 'Misalignment',    severity: 'major'    },
      { id: 'sk_uneven',   label: 'Uneven Stitch',   severity: 'minor'    },
    ],
  },
  {
    id: 'method',
    label: 'Method',
    defects: [
      { id: 'mth_seam',   label: 'Wrong Seam Type',  severity: 'major'    },
      { id: 'mth_thread', label: 'Wrong Thread',     severity: 'minor'    },
      { id: 'mth_spi',    label: 'Wrong SPI',        severity: 'major'    },
      { id: 'mth_attach', label: 'Wrong Attachment', severity: 'critical' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sum up minor / major / critical counts from a flat { defectId: count } map.
 * Works across all categories and all pieces.
 */
export function computeTotals(defectCounts = {}) {
  let minor = 0, major = 0, critical = 0;
  DEFECT_CATEGORIES.forEach((cat) =>
    cat.defects.forEach((def) => {
      const n = defectCounts[def.id] ?? 0;
      if (def.severity === 'minor')    minor    += n;
      else if (def.severity === 'major')   major    += n;
      else if (def.severity === 'critical') critical += n;
    }),
  );
  return { minor, major, critical };
}

/**
 * Merge per-piece defect maps into one flat map then compute totals.
 * pieceDefects: { [pieceId]: { [defectId]: number } }
 */
export function computeGlobalTotals(pieceDefects = {}) {
  const merged = {};
  Object.values(pieceDefects).forEach((counts) =>
    Object.entries(counts).forEach(([id, val]) => {
      merged[id] = (merged[id] ?? 0) + val;
    }),
  );
  return computeTotals(merged);
}

 export function getAuditGrade(minor, major, critical) {
  if (critical > 0) return 'Red';
  if (major > 5)    return 'Yellow';
  return 'Green';
}

export const GRADE_COLORS = {
  Green:  '#16A34A',
  Yellow: '#D97706',
  Red:    '#DC2626',
  Blue:   '#46037d'
};

export const GRADE_BG = {
  Green:  '#00A63E26',
  Yellow: '#E1710026',
  Red:    '#E7000B26',
  Blue:   '#46037D26',
};

 
export const MACHINE_TYPE_FILTERS = ['All', 'Flatlock', 'SNLS', 'DNLS', 'Overlock'];
export const STATUS_FILTERS = ['All', 'Mapped', 'Unmapped'];
 
const OPERATION_TEMPLATE = [
  {
    key: 'collar_press',
    name: 'Collar Press',
    sequence: 21,
    machineType: 'Flatlock',
    requiredDevices: 3,
    devices: [],
  },
  {
    key: 'shoulder_attach',
    name: 'Shoulder Attach',
    sequence: 11,
    machineType: 'SNLS',
    requiredDevices: 3,
    devices: [
      { id: 'TLS-00010', machineNo: 'M-11' },
      { id: 'TLS-00011', machineNo: 'M-12' },
      { id: 'TLS-00012', machineNo: 'M-13' },
    ],
  },
  {
    key: 'collar_attach',
    name: 'Collar Attach',
    sequence: 10,
    machineType: 'Flatlock',
    requiredDevices: 6,
    devices: [
      { id: 'TLS-00023', machineNo: 'M-33' },
      { id: 'TLS-00028', machineNo: 'M-02' },
      { id: 'TLS-00032', machineNo: 'M-06' },
      { id: 'TLS-00033', machineNo: 'M-24' },
      { id: 'TLS-00041', machineNo: 'M-18' },
      { id: 'TLS-00047', machineNo: 'M-09' },
    ],
  },
  {
    key: 'side_seam',
    name: 'Side Seam',
    sequence: 30,
    machineType: 'Overlock',
    requiredDevices: 4,
    devices: [
      { id: 'TLS-00051', machineNo: 'M-15' },
    ],
  },
  {
    key: 'hem_fold',
    name: 'Hem Fold',
    sequence: 40,
    machineType: 'DNLS',
    requiredDevices: 2,
    devices: [
      { id: 'TLS-00060', machineNo: 'M-21' },
      { id: 'TLS-00061', machineNo: 'M-22' },
    ],
  },
];

export const STATUS_COLORS = {
  Mapped:   '#16A34A',
  Partial:  '#D97706',
  Unmapped: '#DC2626',
};

/** 0 devices → Unmapped, fewer than required → Partial, else → Mapped. */
export function getOperationStatus(op) {
  if (op?.status) return op.status;
  const count = op?.devices?.length ?? 0;
  if (count === 0) return 'Unmapped';
  if (count < (op?.requiredDevices ?? 1)) return 'Partial';
  return 'Mapped';
}
 
export function getOperationsByOrder(orderId) {
  if (!orderId) return [];
  return OPERATION_TEMPLATE.map((op) => ({
    ...op,
    id: `${orderId}_${op.key}`,
    orderId,
    devices: op.devices.map((d) => ({ ...d })), // clone so per-order edits don't leak
  }));
}

export function filterOperations(operations, { machineType = 'All', status = 'All', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return operations.filter((op) => {
    if (machineType !== 'All' && op.machineType !== machineType) return false;
    if (status !== 'All' && getOperationStatus(op) !== status) return false;
    if (q && !op.name.toLowerCase().includes(q)) return false;
    return true;
  });
} 
export function normalizeScannedDevice(raw) {
  console.log(" raw deetails "+JSON.stringify(raw));
  const code =
    typeof raw === 'string'
      ? raw.trim()
      : raw?.data ?? raw?.value ?? raw?.codeStringValue ?? '';

  return {
    id: code,           
    machineNo: code,     
  };
}
export const STATIC_INPUT_ORDER = {
  id: 'TLS-100045',
  displayId: 'TLS-100045',
  line: 'Line A1',
  wip: 'WIP - 800',
  swatchCode: 'E/26-27/17668',
  swatchColor: 'Red Swatch',
  buyer: 'M&S',
  styleNo: 'YA5662',
  garmentType: 'Polo T-Shirt',
  orderQuantity: 5000,
  productionQuantity: 5040,
  inputIssued: 1486,
  inputBalance: 3554,
};
export const STATIC_INPUT_SIZES = [
  { id: 'xs',  label: 'XS',  qty: 0, bal: 400, wip: 350 },
  { id: '2a',  label: '2A',  qty: 0, bal: 500, wip: 160 },
  { id: '3a',  label: '3A',  qty: 0, bal: 250, wip: 550 },
  { id: '2xl', label: '2XL', qty: 0, bal: 0,   wip: 580 },
  { id: 'lh',  label: 'LH',  qty: 0, bal: 550, wip: 670 },
  { id: 'xlh', label: 'XLH', qty: 0, bal: 0,   wip: 252 },
  { id: 'l',   label: 'L',   qty: 0, bal: 300, wip: 200 },
  { id: 'xl',  label: 'XL',  qty: 0, bal: 0,   wip: 0   },
]; 
export const STATIC_ORDERS = [
  {
    id: 'TLS-100045',
    tlsCode: 'TLS-100045',
    lineId: null,
    colour: 'Red Swatch',
    colourHex: '#DC2626',
    buyer: 'M&S',
    style: 'Polo T-Shirt',
    styleNo: 'YA5662',
    createdOn: '12 Jul 2026',
    operation_name: 'Collar Attach',
    machine_type_name: 'Flatlock',
  },
  {
    id: 'TLS-100046',
    tlsCode: 'TLS-100046',
    lineId: null,
    colour: 'Navy Blue',
    colourHex: '#1E3A8A',
    buyer: 'H&M',
    style: 'Crew Neck Tee',
    styleNo: 'HB4471',
    createdOn: '14 Jul 2026',
    operation_name: 'Shoulder Attach',
    machine_type_name: 'SNLS',
  },
  {
    id: 'TLS-100047',
    tlsCode: 'TLS-100047',
    lineId: null,
    colour: 'Charcoal Grey',
    colourHex: '#374151',
    buyer: 'Zara',
    style: 'Hooded Sweatshirt',
    styleNo: 'ZR9021',
    createdOn: '16 Jul 2026',
    operation_name: 'Side Seam',
    machine_type_name: 'Overlock',
  },
  {
    id: 'TLS-100048',
    tlsCode: 'TLS-100048',
    lineId: null,
    colour: 'Off White',
    colourHex: '#F5F5F0',
    buyer: 'Uniqlo',
    style: 'Basic Polo',
    styleNo: 'UQ3390',
    createdOn: '18 Jul 2026',
    operation_name: 'Hem Fold',
    machine_type_name: 'DNLS',
  },
  {
    id: 'TLS-100049',
    tlsCode: 'TLS-100049',
    lineId: null,
    colour: 'Forest Green',
    colourHex: '#166534',
    buyer: 'Gap',
    style: 'Cargo Shorts',
    styleNo: 'GP1187',
    createdOn: '20 Jul 2026',
    operation_name: 'Collar Press',
    machine_type_name: 'Flatlock',
  },
]; 
export function getOrdersForLine(lineId) {
  if (!lineId) return [];
  const matched = STATIC_ORDERS.filter((o) => o.lineId === lineId);
  return matched.length ? matched : STATIC_ORDERS;
}
 
export function filterOrders(orders = [], query = '') {
  const q = query.trim().toLowerCase();
  if (!q) return orders;
  return orders.filter((o) =>
    [o.tlsCode, o.colour, o.buyer, o.style, o.styleNo]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q)),
  );
}