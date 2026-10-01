import apiRequest from '../apiRequest';
import ENDPOINTS  from '../endpoints';

const normalizeZone = (z) => ({
  id:        z.id,
  name:      z.zone_name,
  code:      z.zone_code,
  lineCount: z.line_count ?? z.lineCount ?? 0,
});

const normalizeLine = (l) => ({
  id:         l.line_id,
  uuid:       l.uuid,
  name:       l.line_name,
  zoneId:     l.zone_id,
  zoneName:   l.zone_name,
  branchId:   l.branch_id,
  branchName: l.branch_name, 
  lineCode:   l.line_code ?? '',
  device_count:    l.device_count ??'0',
});
 
const normalizeBranch = (b) => {
  const firstTeam = Array.isArray(b.teams) && b.teams.length > 0 ? b.teams[0] : null;
  return {
    id:          b.id,
    uuid:        b.uuid,
    name:        b.branch_name,
    code:        b.branch_code,
    team_id:     firstTeam?.id ?? '',
    team_name:   firstTeam?.team_name ?? '',
    address:     b.address,
    companyId:   b.company_id,
    companyName: b.company?.company_name ?? '',
    isActive:    b.is_active,
  };
};

 
export const getZones = async (branchId = '') => {
  const result = await apiRequest({
    method:   'POST',
    endpoint: ENDPOINTS.DROPDOWN.ZONE_LIST,
    body:     { branch_id: branchId },
  });

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch zones');
  }

  return (result.data ?? []).map(normalizeZone);
};
 
export const getLinesByZoneIds = async (
  zoneIds = [],
  { factoryId = '', branchId = '' } = {},
) => {
  const result = await apiRequest({
    method:   'POST',
    endpoint: ENDPOINTS.DROPDOWN.LINE_LIST,
    body: {
      zone_id:    zoneIds,
      factory_id: factoryId,
      branch_id:  branchId,
    },
  });

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch lines');
  }
   return (result.data ?? []).map(normalizeLine);
};

export const getBranches = async (
  { page = 1, search = '', status = 'all', branchId = 'all' } = {},
) => {
  const result = await apiRequest({
    method:   'POST',
    endpoint: ENDPOINTS.DROPDOWN.BRANCH_LIST,
    body: {
      page,
      search,
      status,
      branch_id: branchId,
    },
  });
  console.log("getting branch list "+JSON.stringify(result));
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch branches');
  }

  const branches = result?.data ?? [];
  return branches.map(normalizeBranch);
};

export default { getZones, getLinesByZoneIds, getBranches };