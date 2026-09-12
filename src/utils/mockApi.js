const TLS_DEVICES = {
  'TLS-100045': {
    tlsId: 'TLS-100045',
    lineNo: 'Line A1',
    workstation: 'Fly Attach',
    workstationNo: 'WS 1',
    buyer: 'M&S',
    orderNo: '17239',
    styleNumber: 'YA5662',
    styleName: 'Polo T-Shirt',
    color: 'Red',
    auditDate: '16 Aug 2025',
    slot: '09:30',
  },
  'TLS-100046': {
    tlsId: 'TLS-100046',
    lineNo: 'Line A1',
    workstation: 'Side Seam',
    workstationNo: 'WS 2',
    buyer: 'M&S',
    orderNo: '17239',
    styleNumber: 'YA5662',
    styleName: 'Polo T-Shirt',
    color: 'Red',
    auditDate: '16 Aug 2025',
    slot: '09:45',
  },
  'TLS-100047': {
    tlsId: 'TLS-100047',
    lineNo: 'Line A1',
    workstation: 'Bottom Hand',
    workstationNo: 'WS 3',
    buyer: 'Next',
    orderNo: '17240',
    styleNumber: 'NX8821',
    styleName: 'Crew Neck Tee',
    color: 'Navy',
    auditDate: '16 Aug 2025',
    slot: '10:00',
  },
  'TLS-100048': {
    tlsId: 'TLS-100048',
    lineNo: 'Line A1',
    workstation: 'Waist Band',
    workstationNo: 'WS 4',
    buyer: 'Next',
    orderNo: '17240',
    styleNumber: 'NX8821',
    styleName: 'Crew Neck Tee',
    color: 'Navy',
    auditDate: '16 Aug 2025',
    slot: '10:15',
  },
};

// QR payload format: TLS-XXXXXX (case-insensitive, normalizes to upper).
const TLS_CODE_PATTERN = /^TLS-\d{6}$/i;

export function validateCode(rawCode) {
  if (!rawCode || typeof rawCode !== 'string') return false;
  return TLS_CODE_PATTERN.test(rawCode.trim());
}

export function normalizeCode(rawCode) {
  return rawCode.trim().toUpperCase();
}

 
export function fetchTLSDetails(rawCode) {
  return new Promise((resolve, reject) => {
    const code = normalizeCode(rawCode);

    /*if (!validateCode(code)) {
      const err = new Error('Invalid TLS code format');
      err.code = 'INVALID_FORMAT';
      reject(err);
      return;
    } */

    // Simulated network latency
    setTimeout(() => {
      const device = TLS_DEVICES['TLS-100047'];
      if (!device) {
        const err = new Error(`No device found for ${code}`);
        err.code = 'NOT_FOUND';
        reject(err);
        return;
      }
      resolve(device);
    }, 600);
  });
}