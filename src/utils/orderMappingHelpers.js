const COLOUR_HEX = {
  red: '#DC2626',
  blue: '#2563EB',
  green: '#16A34A',
  black: '#111827',
  white: '#F9FAFB',
  yellow: '#EAB308',
  pink: '#EC4899',
  purple: '#7C3AED',
  orange: '#EA580C',
  grey: '#6B7280',
  gray: '#6B7280',
  navy: '#1E3A8A',
  beige: '#D8CAB8',
};

const colourToHex = (name) => COLOUR_HEX[String(name ?? '').trim().toLowerCase()] ?? '#9CA3AF';
export function mapOrderRecord(record) {
   return {
    id: record.id,
    uuid: record.uuid,
    tlsCode: record.order_code ?? record.order_no ?? '—',
    orderNo: record.order_no ?? '—',
    colour: record.colour ?? '—',
    colourHex: colourToHex(record.colour),
    styleId: record.style_id ?? record.style?.id ?? null,
    buyer: record.style.buyer ?? '—',
    style: record.style?.style_name ?? record.style_name ?? '—',
    styleNo: record.style?.style_no ?? '—',
    orderQty: record.order_qty ?? null,
    prodQty: record.prod_qty ?? null,
    totalSize: record.total_size ?? null,
    createdOn: record.created_at ?? record.createdOn ?? '',
    lineId: record.line_id ?? null,  
  };
}

export function filterOrdersByQuery(orders, query) {
  const q = query.trim().toLowerCase();
  if (!q) return orders;
  return orders.filter((o) =>
    [o.tlsCode, o.orderNo, o.colour, o.buyer, o.style, o.styleNo]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q)),
  );
}
export function mapOperationRecord(record) {
  return {
    id: record.id,
    uuid: record.uuid,
    orderId: record.order_id,
    operationId: record.operation_id,
    name: record.operation_name ?? '—',
    sequence: record.seq_no ?? record.operation_id,  
    machineId: record.machine_id,
    machineType: record.machine_type_name ?? '—',
    mappingCount: record.mapping_count ?? 0,
    status: record.status ?? 'Unmapped',
    mappings: Array.isArray(record.mappings) ? record.mappings : [],
  };
}
export function mapMappingToDevice(mapping) {
  return {
    id: mapping.tls_id ?? mapping.tls_code ?? mapping.id,
    tls_no:mapping.tls_no,
     uuid: mapping.uuid, 
     machineNo: mapping.machine_no ?? mapping.machine_id,
    machineType: mapping.machine_type_name ?? mapping.machine_type ?? 'No Name',
    dbId: mapping.id,
    raw: mapping,
  };
}