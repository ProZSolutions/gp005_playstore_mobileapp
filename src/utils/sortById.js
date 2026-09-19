export const compareIds = (a, b) => {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
};

 export const sortIds = (ids) => (Array.isArray(ids) ? [...ids].sort(compareIds) : []);

 export const sortById = (items) =>
  Array.isArray(items) ? [...items].sort((a, b) => compareIds(a?.id, b?.id)) : [];
 
export const sortIdNamePairs = (ids, names) => {
  const pairs = (Array.isArray(ids) ? ids : []).map((id, i) => ({
    id,
    name: names?.[i] ?? String(id),
  }));
  pairs.sort((a, b) => compareIds(a.id, b.id));
  return { ids: pairs.map((p) => p.id), names: pairs.map((p) => p.name) };
};