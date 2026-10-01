export const STATUS = {
  NEW: '2' || 'NEW' || 'New' || 'new',
  QC_FAILED: '4' || 'QC FAILED' || 'QC_FAILED' || 'QC Failed' || 'QC_FAILED',
  REJECTED:'1' ||'Rejected'||'REJECTED'||'rejected',
  FAILED:'3' ||'FAILED'||'failed'||'Failed',
  SUCCESS:'success'
};

export const STATUS_STYLES = {
  [STATUS.NEW]: { bg: '#DCEEFB', text: '#1D6FB8', dot: '#1D6FB8',border:'#bfe2fb' },
  [STATUS.QC_FAILED]: { bg: '#D32F2F', text: '#FFFFFF', dot: '#FFFFFF',border:'#d70a0a' },
  [STATUS.FAILED]: { bg: '#D32F2F', text: '#FFFFFF', dot: '#FFFFFF',border:'#d70a0a' },
   [STATUS.SUCCESS]: { bg: '#075c26', text: '#FFFFFF', dot: '#FFFFFF', border: '#075423' },
  
};

export const STATUS_STYLES_REJ = {
  [STATUS.NEW]: { bg: '#DCEEFB', text: '#1D6FB8', dot: '#1D6FB8',border:'#bfe2fb' },
  [STATUS.REJECTED]: { bg: '#D32F2F', text: '#FFFFFF', dot: '#FFFFFF',border:'#d70a0a' },
  [STATUS.SUCCESS]: { bg: '#075c26', text: '#FFFFFF', dot: '#FFFFFF', border: '#075423' },};
 
export const SEVERITY = {
  RED_MAJOR: { label: 'Red (Major)', bg: '#DC2626', text: '#FFFFFF' },
  YELLOW_MINOR: { label: 'Yellow (Minor)', bg: '#D97706', text: '#FFFFFF' },
};

 export const LINE_FILTERS = [
  { id: 'all', name: 'All' },
  { id: 'la1', name: 'Line A1' },
  { id: 'la2', name: 'Line A2' },
  { id: 'la3', name: 'Line A3' },
  { id: 'lb1', name: 'Line B1' },
];

 export const CAP_OPTIONS = [
  { id: 'cap_thread_tension', label: 'Adjust thread tension' },
  { id: 'cap_needle', label: 'Replace the needle' },
  { id: 'cap_clean_oil', label: 'Clean the machine and check for oil leakage' },
  { id: 'cap_oil_level', label: 'Check oil level and refill if required' },
  { id: 'cap_fabric', label: 'Ensure proper fabric handling' },
  { id: 'cap_oil_seal', label: 'Replace oil seal / gasket' },
  { id: 'cap_bobbin', label: 'Replace bobbin case' },
  { id: 'cap_cleanliness', label: 'Improve workplace cleanliness' },
];

// Pull an array of CAP labels (by id) from CAP_OPTIONS — keeps capTaken
// entries in sync with the single source of truth instead of re-typing
// label strings by hand on every issue.
function capLabels(...ids) {
  return ids
    .map((id) => CAP_OPTIONS.find((c) => c.id === id)?.label)
    .filter(Boolean);
}

 const HANDCRAFTED = [
  {
    id: 'ORD-250433',
    lineId: 'la1',
    lineLabel: 'Line A1',
    status: STATUS.NEW,
    severity: SEVERITY.RED_MAJOR,
    defectTitle: 'Oil Stain',
    operation: 'Sleeve Attachment',
    type: 'Fly Attach',
    colour: 'Golden Yellow',
    colourHex: '#E8B400',
    elapsedTime: '00:15:27',
    swatch: 'E/26-27/17668 · Red Swatch',
    defectCategory: 'Machine',
    defect: 'Skip',
    defectQuantity: 2,
    tlsDeviceId: 'TLS - 430682',
    machineNo: 'M-45',
    auditedBy: 'Meena (504398)',
    auditTime: '13/07/2026, 14:32:06',
    notes: 'Needle problem',
    assignedTo: 'Mechanic',
    responseTime: '09:30',
     workcategory:'Mechanic',
    performedby:'Rakesh (676888)',
    performedon:'14/07/2026, 14:32:00',
    elapsedTimeCap: '09:45',
    capTaken: capLabels(
      'cap_thread_tension',
      'cap_needle',
      'cap_clean_oil',
      'cap_oil_level',
      'cap_fabric',
      'cap_oil_seal',
    ),
    operator: {
      displayName: 'Suresh Kumar (500445)',
      machineSummary: 'Flatlock · Fly Attach',
      name: 'Suresh Babu',
      employeeId: 'EMP-50034',
      lineNo: 'Line A1',
      slot: '09:00 AM - 10:30 AM',
      operation: 'Side Seam',
      machineType: 'Overlock',
    },
    order: {
      buyer: 'ABC Corp.',
      tlsCode: 'ORD-2026-0392',
      colour: 'Golden Yellow',
      colourHex: '#E8B400',
      style: 'Polo T-Shirt',
      styleNo: 'ST-001',
    },
  },
  {
    id: 'ORD-250429',
    lineId: 'la3',
    lineLabel: 'Line A3',
    status: STATUS.NEW,
    severity: SEVERITY.YELLOW_MINOR,
    defectTitle: 'Skipped Stitch',
    operation: 'Front Panel Join',
    type: 'Over Lock',
    colour: 'Golden Yellow',
    colourHex: '#E8B400',
    elapsedTime: '00:33:38',
    swatch: 'E/26-27/17672 · Yellow Swatch',
    defectCategory: 'Sewing',
    defect: 'Skip Stitch',
    defectQuantity: 1,
    tlsDeviceId: 'TLS - 430690',
    machineNo: 'M-12',
    auditedBy: 'Meena (504398)',
    auditTime: '13/07/2026, 14:58:10',
    notes: 'Thread tension inconsistent',
    assignedTo: 'Line Supervisor',
    responseTime: '05:10',
    elapsedTimeCap: '06:02',
     workcategory:'Mechanic',
    performedby:'Rakesh (676888)',
    performedon:'14/07/2026, 14:32:00',
    capTaken: capLabels('cap_thread_tension', 'cap_bobbin'),
    operator: {
      displayName: 'Suresh kumar (500512)',
      machineSummary: 'Flatlock · Front Panel Join',
      name: 'Kavitha Ramesh',
      employeeId: 'EMP-50112',
      lineNo: 'Line A3',
      slot: '10:30 AM - 12:00 PM',
      operation: 'Front Panel Join',
      machineType: 'Over Lock',
    },
    order: {
      buyer: 'XYZ Corp',
      tlsCode: 'ORD-2026-0401',
      colour: 'Golden Yellow',
      colourHex: '#E8B400',
      style: 'V-Neck Shirt',
      styleNo: 'ST-018',
    },
  },
  {
    id: 'ORD-250404',
    lineId: 'lb1',
    lineLabel: 'Line B1',
    status: STATUS.QC_FAILED,
    severity: SEVERITY.RED_MAJOR,
    defectTitle: 'Uneven thread tension',
    operation: 'Collar Attach',
    type: 'Flatlock',
    colour: 'Navy Blue',
    colourHex: '#1E3A5F',
    elapsedTime: '00:45:12',
    swatch: 'E/26-27/17680 · Navy Swatch',
    defectCategory: 'Machine',
    defect: 'Tension Low',
    defectQuantity: 3,
    tlsDeviceId: 'TLS - 430701',
    machineNo: 'M-24',
    auditedBy: 'Meena (504398)',
    auditTime: '13/07/2026, 15:10:44',
    notes: 'Machine tension dial slipping',
    assignedTo: 'Mechanic',
    responseTime: '11:20',
    elapsedTimeCap: '12:05',
     workcategory:'Mechanic',
    performedby:'Rakesh (676888)',
    performedon:'14/07/2026, 14:32:00',
    capTaken: capLabels('cap_oil_seal', 'cap_cleanliness', 'cap_thread_tension'),
    operator: {
      displayName: 'Arjun Das (500601)',
      machineSummary: 'Flatlock · Collar Attach',
      name: 'Arjun Das',
      employeeId: 'EMP-50201',
      lineNo: 'Line B1',
      slot: '09:00 AM - 10:30 AM',
      operation: 'Collar Attach',
      machineType: 'Flatlock',
    },
    order: {
      buyer: 'LMN Apparel',
      tlsCode: 'ORD-2026-0388',
      colour: 'Navy Blue',
      colourHex: '#1E3A5F',
      style: 'Denim Jacket',
      styleNo: 'ST-044',
    },
  },
];

 const DEFECT_POOL = ['Oil Stain', 'Skipped Stitch', 'Uneven thread tension', 'Broken Needle', 'Puckering', 'Raw Edge', 'Open Seam'];
const OP_POOL = [
  { operation: 'Sleeve Attachment', type: 'Fly Attach' },
  { operation: 'Front Panel Join', type: 'Over Lock' },
  { operation: 'Collar Attach', type: 'Flatlock' },
  { operation: 'Side Seam', type: 'Overlock' },
  { operation: 'Hem Fold', type: 'DNLS' },
];
const COLOUR_POOL = [
  { name: 'Golden Yellow', hex: '#E8B400' },
  { name: 'Navy Blue', hex: '#1E3A5F' },
  { name: 'Charcoal Grey', hex: '#4B4B4B' },
  { name: 'Forest Green', hex: '#2F6B3A' },
];

function seed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function buildFiller(lineId, lineLabel, index) {
  const key = `${lineId}-${index}`;
  const s = seed(key);
  const defectTitle = DEFECT_POOL[(s + index) % DEFECT_POOL.length];
  const op = OP_POOL[(s + index * 2) % OP_POOL.length];
  const colour = COLOUR_POOL[(s + index * 3) % COLOUR_POOL.length];
  const isQcFailed = (s + index) % 4 === 0;
  const orderNo = `ORD-2504${(20 + (s % 70) + index).toString().padStart(2, '0')}`;

  // Deterministically pick 2-4 CAP options per generated issue, based on
  // the same seed used for everything else here, so re-renders stay stable.
  const capCount = 2 + (s % 3); // 2, 3, or 4
  const capIds = [];
  for (let c = 0; c < capCount; c++) {
    const optIndex = (s + index * 5 + c * 3) % CAP_OPTIONS.length;
    const id = CAP_OPTIONS[optIndex].id;
    if (!capIds.includes(id)) capIds.push(id);
  }

  return {
    id: orderNo,
    lineId,
    lineLabel,
    status: isQcFailed ? STATUS.QC_FAILED : STATUS.NEW,
    severity: isQcFailed ? SEVERITY.RED_MAJOR : SEVERITY.YELLOW_MINOR,
    defectTitle,
    operation: op.operation,
    type: op.type,
    colour: colour.name,
    colourHex: colour.hex,
    elapsedTime: `00:${(10 + (s % 45)).toString().padStart(2, '0')}:${(10 + (index * 7) % 50).toString().padStart(2, '0')}`,
    swatch: `E/26-27/${17700 + s % 300} · ${colour.name} Swatch`,
    defectCategory: ['Machine', 'Sewing', 'Fabric', 'Skill'][s % 4],
    defect: defectTitle,
    defectQuantity: 1 + (s % 3),
    tlsDeviceId: `TLS - ${430000 + (s % 900)}`,
    machineNo: `M-${10 + (s % 40)}`,
    auditedBy: 'Meena (504398)',
    auditTime: '13/07/2026, 15:22:00',
    notes: 'Pending inspector review',
    assignedTo: isQcFailed ? 'Mechanic' : 'Line Supervisor',
    workcategory:'Mechanic',
    performedby:'Rakesh (676888)',
    performedon:'14/07/2026, 14:32:00',
    responseTime: '08:00',
    elapsedTimeCap: '08:40',
    capTaken: capLabels(...capIds),
    operator: {
      displayName: 'Operator (500' + (index + 700) + ')',
      machineSummary: `${op.type} · ${op.operation}`,
      name: 'Operator ' + (index + 1),
      employeeId: `EMP-5${1000 + s % 900}`,
      lineNo: lineLabel,
      slot: '09:00 AM - 10:30 AM',
      operation: op.operation,
      machineType: op.type,
       workcategory:'Mechanic',
    performedby:'Rakesh (676888)',
    performedon:'14/07/2026, 14:32:00',
    },
    order: {
      buyer: 'ABC Corp.',
      tlsCode: `ORD-2026-0${300 + s % 600}`,
      colour: colour.name,
      colourHex: colour.hex,
      style: 'Polo T-Shirt',
      styleNo: 'ST-001',
       workcategory:'Mechanic',
    performedby:'Rakesh (676888)',
    performedon:'14/07/2026, 14:32:00',
    },
  };
}

 const FILLER_PLAN = [
  { lineId: 'la1', lineLabel: 'Line A1', count: 3 },  
  { lineId: 'la2', lineLabel: 'Line A2', count: 3 },  
  { lineId: 'la3', lineLabel: 'Line A3', count: 2 },  
  { lineId: 'lb1', lineLabel: 'Line B1', count: 1 },  
];

const GENERATED = FILLER_PLAN.flatMap(({ lineId, lineLabel, count }) =>
  Array.from({ length: count }).map((_, i) => buildFiller(lineId, lineLabel, i)),
);

export const ISSUES = [...HANDCRAFTED, ...GENERATED];

 
export function lineAbbrev(lineLabel = '') {
  return `(L-${lineLabel.replace('Line ', '')})`;
}

export function countsByLine() {
  const counts = { all: ISSUES.length };
  LINE_FILTERS.forEach((l) => {
    if (l.id === 'all') return;
    counts[l.id] = ISSUES.filter((i) => i.lineId === l.id).length;
  });
  return counts;
}

export function getFilteredIssues(lineId = 'all', query = '') {
  const q = query.trim().toLowerCase();
  return ISSUES.filter((issue) => {
    if (lineId !== 'all' && issue.lineId !== lineId) return false;
    if (!q) return true;
    return [issue.id, issue.defectTitle, issue.operation, issue.type, issue.colour, issue.lineLabel]
      .filter(Boolean)
      .some((f) => f.toLowerCase().includes(q));
  });
}

export function getIssueById(id) {
  return ISSUES.find((i) => i.id === id) ?? null;
}