const normalizeGroupName = (name = '') =>
  name
    .replace(/^mobile[\s\-_]?/i, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

export const buildPermissionGroupSet = (permissions = []) => {
  const set = new Set();
  permissions.forEach((group) => {
    if (group?.group_name) set.add(normalizeGroupName(group.group_name));
  });
  return set;
};

 export const canAccessModule = (permKey, permissionGroupSet, roleCode) => {
  if ((!permissionGroupSet || permissionGroupSet.size === 0) && Number(roleCode) === 100) {
    return true;
  }
  return permissionGroupSet.has(normalizeGroupName(permKey));
};