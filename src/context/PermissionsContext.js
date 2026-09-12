import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getPermissions, getUser } from '../api/storage/authStorage';

export const ACTION = {
  CREATE:   'create',
  LIST:     'list',
  UPDATE:   'update',
  DELETE:   'delete',
  SHOW:     'show',
  CHECKIN:  'checkin',
  CHECKOUT: 'checkout',
  LISTES:'Escalationlist',
  RET:'Escalationretrive',

};

export const GROUP = {
  CHECKIN:          'MobileCheckin',
  TLSAUDIT:         'MobileTLSAudit',
  TLSISSUE:         'MobileTLSIssue',
  QCVERIFICATION:   'MobileQCVerification',
  REWORK:           'MobileRework',
  REWORKTRACKER:    'MobileReworkTracker',
  REJECTION:        'MobileRejection',
  REJECTIONTRACKER: 'MobileRejectionTracker',
  AQLAUDIT:         'MobileAQLAudit',
  LINEMAPPING:      'MobileLineMapping',
  CONTMAPPING:      'MobileContinuityMapping',
  INPUTMODULE:      'MobileInput',
  DEVICEMAPPING:    'MobileDeviceMapping',
  DEVICESWAPPING:   'MobileDeviceSwapping',
  AQLAUDIT:         'AqlAudit',
  CHECKING:         'Checking',
  ESCALATION:       'MobileEscalation',
  CONTINUITY:        'Continuitymapping'
};

const normalizeGroupName = (name = '') =>
  String(name)
    .replace(/^mobile[\s\-_]?/i, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

const FULL_ACCESS_ROLE_CODES = [100];

const PermissionsContext = createContext({
  permissionGroups: [],
  loading: true,
  fullAccess: false,
  can: () => false,
  canView: () => false,
  hasPermission: () => false,
  refreshPermissions: async () => {},
});

export function PermissionsProvider({ children }) {
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [roleCode, setRoleCode] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshPermissions = useCallback(async () => {
    try {
      const [groups, user] = await Promise.all([getPermissions(), getUser()]);
      setPermissionGroups(groups ?? []);
      setRoleCode(user?.role_code ?? null);
    } catch (e) {
      console.warn('Failed to load permissions from Keychain:', e.message);
      setPermissionGroups([]);
      setRoleCode(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  const fullAccess = useMemo(
    () =>
      (permissionGroups?.length ?? 0) === 0 &&
      FULL_ACCESS_ROLE_CODES.includes(Number(roleCode)),
    [permissionGroups, roleCode],
  );

  const findGroup = useCallback(
    (groupKey) => {
      const target = normalizeGroupName(groupKey);
      return permissionGroups.find(
        (g) => normalizeGroupName(g.group_name) === target,
      );
    },
    [permissionGroups],
  );

  const can = useCallback(
    (groupKey, action) => {
      if (fullAccess) return true;
      if (!groupKey || !action) return false;
      const group = findGroup(groupKey);
      if (!group) return false;
      const target = String(action).toLowerCase();
      return (
        group.permissions?.some(
          (p) =>
            p.display_name?.toLowerCase() === target ||
            p.name?.toLowerCase().endsWith(`.${target}`),
        ) ?? false
      );
    },
    [fullAccess, findGroup],
  );

  const canView = useCallback(
    (groupKey) => {
      if (fullAccess) return true;
      if (!groupKey) return false;
      return !!findGroup(groupKey);
    },
    [fullAccess, findGroup],
  );

  const hasPermission = useCallback(
    (permissionName) => {
      if (fullAccess) return true;
      return permissionGroups.some((group) =>
        group.permissions?.some((p) => p.name === permissionName),
      );
    },
    [fullAccess, permissionGroups],
  );

  const value = useMemo(
    () => ({
      permissionGroups,
      loading,
      fullAccess,
      can,
      canView,
      hasPermission,
      refreshPermissions,
    }),
    [permissionGroups, loading, fullAccess, can, canView, hasPermission, refreshPermissions],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}