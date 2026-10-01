 export const ZONES = [
  { id: 'zone_a', name: 'Zone A', lineCount: 3, workstationCount: 12 },
  { id: 'zone_b', name: 'Zone B', lineCount: 4, workstationCount: 26 },
  { id: 'zone_c', name: 'Zone C', lineCount: 2, workstationCount: 8  },
  { id: 'zone_d', name: 'Zone D', lineCount: 4, workstationCount: 38 },
];

export const LINES_BY_ZONE = {
  zone_a: [
    { id: 'la1', lineCode: 'Zone A', name: 'Line A1', product: '10 Machines' },
    { id: 'la2', lineCode: 'Zone A', name: 'Line A2', product: '4 Machines' },
    { id: 'la3', lineCode: 'Zone A', name: 'Line A3', product: '6 Machines' },
  ],
  zone_b: [
    { id: 'lb1', lineCode: 'Zone B', name: 'Line B1', product: "1 Machines" },
    { id: 'lb2', lineCode: 'Zone B', name: 'Line B2', product: '2 Machines' },
    { id: 'lb3', lineCode: 'Zone B', name: 'Line B3', product: '3 Machines' },
    { id: 'lb4', lineCode: 'Zone B', name: 'Line B4', product: '5 Machines' },
  ],
  zone_c: [
    { id: 'lc1', lineCode: 'Zone C', name: 'Line C1', product: '5 Machines' },
    { id: 'lc2', lineCode: 'Zone C', name: 'Line C2', product: '6 Machines' },
  ],
  zone_d: [
    { id: 'ld1', lineCode: 'Zone D', name: 'Line D1', product: '6 Machines' },
    { id: 'ld2', lineCode: 'Zone D', name: 'Line D2', product: '6 Machines' },
    { id: 'ld3', lineCode: 'Zone D', name: 'Line D3', product: '3 Machines' },
    { id: 'ld4', lineCode: 'Zone D', name: 'Line D4', product: '2 Machines' },
  ],
};
export function formatZoneLineLabel(zoneNames = [], lineNames = []) {
  if (zoneNames.length === 0) return 'No zone selected';
 
  const zonesPart = zoneNames.join(', ');
  if (lineNames.length === 0) return zonesPart;
 
  return `${zonesPart}: ${lineNames.join(', ')}`;
}

export const WORKSTATIONS_BY_LINE = {
  la1: [
    { id: 'ws_la1_1', name: 'Fly Attach',  tlsCode: 'TLS-100045', wsNumber: 'WS 1', lineId: 'la1', lineName: 'Line A1' },
    { id: 'ws_la1_2', name: 'Side Seam',   tlsCode: 'TLS-100046', wsNumber: 'WS 2', lineId: 'la1', lineName: 'Line A1' },
    { id: 'ws_la1_3', name: 'Bottom Hand', tlsCode: 'TLS-100047', wsNumber: 'WS 3', lineId: 'la1', lineName: 'Line A1' },
    { id: 'ws_la1_4', name: 'Waist Band',  tlsCode: 'TLS-100048', wsNumber: 'WS 4', lineId: 'la1', lineName: 'Line A1' },
  ],
  la2: [
    { id: 'ws_la2_1', name: 'Fly Attach',  tlsCode: 'TLS-100049', wsNumber: 'WS 1', lineId: 'la2', lineName: 'Line A2' },
    { id: 'ws_la2_2', name: 'Side Seam',   tlsCode: 'TLS-100050', wsNumber: 'WS 2', lineId: 'la2', lineName: 'Line A2' },
    { id: 'ws_la2_3', name: 'Inseam',      tlsCode: 'TLS-100051', wsNumber: 'WS 3', lineId: 'la2', lineName: 'Line A2' },
  ],
  la3: [
    { id: 'ws_la3_1', name: 'Waist Band',  tlsCode: 'TLS-100052', wsNumber: 'WS 1', lineId: 'la3', lineName: 'Line A3' },
    { id: 'ws_la3_2', name: 'Fly Attach',  tlsCode: 'TLS-100053', wsNumber: 'WS 2', lineId: 'la3', lineName: 'Line A3' },
    { id: 'ws_la3_3', name: 'Belt Loop',   tlsCode: 'TLS-100054', wsNumber: 'WS 3', lineId: 'la3', lineName: 'Line A3' },
    { id: 'ws_la3_4', name: 'Bottom Hand', tlsCode: 'TLS-100055', wsNumber: 'WS 4', lineId: 'la3', lineName: 'Line A3' },
    { id: 'ws_la3_5', name: 'Side Seam',   tlsCode: 'TLS-100056', wsNumber: 'WS 5', lineId: 'la3', lineName: 'Line A3' },
  ],
  lb1: [
    { id: 'ws_lb1_1', name: 'Fly Attach',  tlsCode: 'TLS-100057', wsNumber: 'WS 1', lineId: 'lb1', lineName: 'Line B1' },
    { id: 'ws_lb1_2', name: 'Waist Band',  tlsCode: 'TLS-100058', wsNumber: 'WS 2', lineId: 'lb1', lineName: 'Line B1' },
    { id: 'ws_lb1_3', name: 'Inseam',      tlsCode: 'TLS-100059', wsNumber: 'WS 3', lineId: 'lb1', lineName: 'Line B1' },
  ],
  lb2: [
    { id: 'ws_lb2_1', name: 'Side Seam',   tlsCode: 'TLS-100060', wsNumber: 'WS 1', lineId: 'lb2', lineName: 'Line B2' },
    { id: 'ws_lb2_2', name: 'Bottom Hand', tlsCode: 'TLS-100061', wsNumber: 'WS 2', lineId: 'lb2', lineName: 'Line B2' },
  ],
  lb3: [
    { id: 'ws_lb3_1', name: 'Waist Band',  tlsCode: 'TLS-100062', wsNumber: 'WS 1', lineId: 'lb3', lineName: 'Line B3' },
    { id: 'ws_lb3_2', name: 'Fly Attach',  tlsCode: 'TLS-100063', wsNumber: 'WS 2', lineId: 'lb3', lineName: 'Line B3' },
    { id: 'ws_lb3_3', name: 'Belt Loop',   tlsCode: 'TLS-100064', wsNumber: 'WS 3', lineId: 'lb3', lineName: 'Line B3' },
  ],
  lb4: [
    { id: 'ws_lb4_1', name: 'Inseam',      tlsCode: 'TLS-100065', wsNumber: 'WS 1', lineId: 'lb4', lineName: 'Line B4' },
    { id: 'ws_lb4_2', name: 'Side Seam',   tlsCode: 'TLS-100066', wsNumber: 'WS 2', lineId: 'lb4', lineName: 'Line B4' },
  ],
  lc1: [
    { id: 'ws_lc1_1', name: 'Fly Attach',  tlsCode: 'TLS-100067', wsNumber: 'WS 1', lineId: 'lc1', lineName: 'Line C1' },
    { id: 'ws_lc1_2', name: 'Bottom Hand', tlsCode: 'TLS-100068', wsNumber: 'WS 2', lineId: 'lc1', lineName: 'Line C1' },
  ],
  lc2: [
    { id: 'ws_lc2_1', name: 'Side Seam',   tlsCode: 'TLS-100069', wsNumber: 'WS 1', lineId: 'lc2', lineName: 'Line C2' },
    { id: 'ws_lc2_2', name: 'Waist Band',  tlsCode: 'TLS-100070', wsNumber: 'WS 2', lineId: 'lc2', lineName: 'Line C2' },
    { id: 'ws_lc2_3', name: 'Belt Loop',   tlsCode: 'TLS-100071', wsNumber: 'WS 3', lineId: 'lc2', lineName: 'Line C2' },
  ],
  ld1: [
    { id: 'ws_ld1_1', name: 'Fly Attach',  tlsCode: 'TLS-100072', wsNumber: 'WS 1', lineId: 'ld1', lineName: 'Line D1' },
    { id: 'ws_ld1_2', name: 'Inseam',      tlsCode: 'TLS-100073', wsNumber: 'WS 2', lineId: 'ld1', lineName: 'Line D1' },
  ],
  ld2: [
    { id: 'ws_ld2_1', name: 'Waist Band',  tlsCode: 'TLS-100074', wsNumber: 'WS 1', lineId: 'ld2', lineName: 'Line D2' },
    { id: 'ws_ld2_2', name: 'Side Seam',   tlsCode: 'TLS-100075', wsNumber: 'WS 2', lineId: 'ld2', lineName: 'Line D2' },
    { id: 'ws_ld2_3', name: 'Bottom Hand', tlsCode: 'TLS-100076', wsNumber: 'WS 3', lineId: 'ld2', lineName: 'Line D2' },
  ],
  ld3: [
    { id: 'ws_ld3_1', name: 'Belt Loop',   tlsCode: 'TLS-100077', wsNumber: 'WS 1', lineId: 'ld3', lineName: 'Line D3' },
    { id: 'ws_ld3_2', name: 'Fly Attach',  tlsCode: 'TLS-100078', wsNumber: 'WS 2', lineId: 'ld3', lineName: 'Line D3' },
  ],
  ld4: [
    { id: 'ws_ld4_1', name: 'Waist Band',  tlsCode: 'TLS-100079', wsNumber: 'WS 1', lineId: 'ld4', lineName: 'Line D4' },
    { id: 'ws_ld4_2', name: 'Side Seam',   tlsCode: 'TLS-100080', wsNumber: 'WS 2', lineId: 'ld4', lineName: 'Line D4' },
    { id: 'ws_ld4_3', name: 'Inseam',      tlsCode: 'TLS-100081', wsNumber: 'WS 3', lineId: 'ld4', lineName: 'Line D4' },
  ],
};

 export const getZones = () =>
  new Promise((resolve) => setTimeout(() => resolve(ZONES), 700));

 export const getLinesByZoneIds = (zoneIds = []) =>
  new Promise((resolve) =>
    setTimeout(() => {
      const lines = zoneIds.flatMap((zid) => LINES_BY_ZONE[zid] ?? []);
      resolve(lines);
    }, 700),
  );
 
export const getWorkstationsByLineIds = (lineIds = []) =>
  new Promise((resolve) =>
    setTimeout(() => {
      const ws = lineIds.flatMap((lid) => WORKSTATIONS_BY_LINE[lid] ?? []);
      resolve(ws);
    }, 700),
  );