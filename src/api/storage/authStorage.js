import * as Keychain from 'react-native-keychain';

export const PAGE_SIZE = 30; 
const MAX_RECENT_DEFECTS = 15;

const SERVICES = {
  TOKEN:              'app.auth.token',
  USER:               'app.auth.user',
  PERMISSIONS:        'app.auth.permissions',
  SHIFT:              'app.auth.shift',
  SHIFT_SELECTED:     'app.checkin.shiftId',
  ZONE_IDS:           'app.checkin.zoneIds',
  LINE_IDS:           'app.checkin.lineIds',
  LINE_NAMES:         'app.checkin.lineNames',
  CHECKIN:            'app.checkin.details',
  CHECKIN_UUID:       'app.checkin.uuid',
  ZONE_NAMES:         'app.checkin.zoneNames',
  SHIFT_SLOT:         'app.checkin.slot',
  SELECTED_LINE_ID:   'app.checkin.selectedLineId',
  RECENT_DEFECTS:     'app.defect.recentDefects',
  RECENT_DEFECTS_SINGLE: 'app.defect.singlerecentDefects',
  DEFECT_ENTRIES:     'app.defect.entries',
  DEFECT_ENTRIES_SINGLE: 'app.defect.singleentries',
    SCAN_AUDIT_TIME:    'app.audit.scanTime',  
  BRANCH_ID:          'app.checkin.branchId',
  BRANCH_NAME:        'app.checkin.branchName',
  TEAM_ID:            'app.checkin.teamId',
  TEAM_NAME:          'app.checkin.teamName',
  WELCOME_FLAG:       'app.auth.welcomeFlag',
};

const KEYCHAIN_OPTIONS = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const setItem = async (service, value) => {
  await Keychain.setGenericPassword('session', value, {
    ...KEYCHAIN_OPTIONS,
    service,
  });
};

const getItem = async (service) => {
  const result = await Keychain.getGenericPassword({ service });
  return result ? result.password : null;
};

const removeItem = async (service) => {
  await Keychain.resetGenericPassword({ service });
};

export const saveAuthData = async (data) => {
  try {
    const user = {
      id:               data.id,
      name:             data.name,
      email:            data.email,
      role_id:          data.role_id,
      role_code:        data.role_code,
      access_flag:      data.access_flag,
      role_name:        data.role_name,
      employee_code:    data.employee_code,
      employee_name:    data.employee_name,
      mobile:           data.mobile,
      designation_name: data.designation_name,
      department_name:  data.department_name,
      department_id:    data.department_id,
      branch_id:        data.branch_id,
      team_id:          data.team_id,
      designation_id:   data.designation_id,
      login_time:       data.login_time,
    };

    await Promise.all([
      setItem(SERVICES.TOKEN, data.token),
      setItem(SERVICES.USER, JSON.stringify(user)),
      setItem(SERVICES.PERMISSIONS, JSON.stringify(data.permissions ?? [])),
    ]);

    return { success: true };
  } catch (e) {
    console.error('saveAuthData failed:', e);
    return { success: false, error: e.message };
  }
};

export const getToken = async () => {
  try {
    return await getItem(SERVICES.TOKEN);
  } catch {
    return null;
  }
};

export const getUser = async () => {
  try {
    const raw = await getItem(SERVICES.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
 
export const saveUser = async (user) => {
  try {
    await setItem(SERVICES.USER, JSON.stringify(user ?? null));
    return { success: true };
  } catch (e) {
    console.error('saveUser failed:', e);
    return { success: false, error: e.message };
  }
};

 
export const updateStoredUserBranch = async (branchId, branchName, teamId, teamName) => {
  try {
    const current = await getUser();
    const updated = {
      ...(current ?? {}),
      branch_id: branchId ?? null,
      ...(branchName !== undefined ? { branch_name: branchName } : {}),
      ...(teamId !== undefined ? { team_id: teamId } : {}),
      ...(teamName !== undefined ? { team_name: teamName } : {}),
    };
    await setItem(SERVICES.USER, JSON.stringify(updated));
    return { success: true, user: updated };
  } catch (e) {
    console.error('updateStoredUserBranch failed:', e);
    return { success: false, error: e.message };
  }
};

export const saveBranchId = async (branchId) => {
  try {
    if (branchId === null || branchId === undefined) {
      await removeItem(SERVICES.BRANCH_ID);
      return { success: true };
    }
    await setItem(SERVICES.BRANCH_ID, String(branchId));
    return { success: true };
  } catch (e) {
    console.error('saveBranchId failed:', e);
    return { success: false, error: e.message };
  }
};

export const getBranchId = async () => {
  try {
    return await getItem(SERVICES.BRANCH_ID);
  } catch {
    return null;
  }
};

export const saveBranchName = async (branchName) => {
  try {
    if (branchName === null || branchName === undefined) {
      await removeItem(SERVICES.BRANCH_NAME);
      return { success: true };
    }
    await setItem(SERVICES.BRANCH_NAME, String(branchName));
    return { success: true };
  } catch (e) {
    console.error('saveBranchName failed:', e);
    return { success: false, error: e.message };
  }
};

export const getBranchName = async () => {
  try {
    return await getItem(SERVICES.BRANCH_NAME);
  } catch {
    return null;
  }
};

export const saveTeamId = async (teamId) => {
  try {
    if (teamId === null || teamId === undefined) {
      await removeItem(SERVICES.TEAM_ID);
      return { success: true };
    }
    await setItem(SERVICES.TEAM_ID, String(teamId));
    return { success: true };
  } catch (e) {
    console.error('saveTeamId failed:', e);
    return { success: false, error: e.message };
  }
};

export const getTeamId = async () => {
  try {
    return await getItem(SERVICES.TEAM_ID);
  } catch {
    return null;
  }
};

export const saveTeamName = async (teamName) => {
  try {
    if (teamName === null || teamName === undefined) {
      await removeItem(SERVICES.TEAM_NAME);
      return { success: true };
    }
    await setItem(SERVICES.TEAM_NAME, String(teamName));
    return { success: true };
  } catch (e) {
    console.error('saveTeamName failed:', e);
    return { success: false, error: e.message };
  }
};

export const getTeamName = async () => {
  try {
    return await getItem(SERVICES.TEAM_NAME);
  } catch {
    return null;
  }
};

export const clearBranchTeamSelection = async () => {
  try {
    await Promise.all([
      removeItem(SERVICES.BRANCH_ID),
      removeItem(SERVICES.BRANCH_NAME),
      removeItem(SERVICES.TEAM_ID),
      removeItem(SERVICES.TEAM_NAME),
    ]);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const getPermissions = async () => {
  try {
    const raw = await getItem(SERVICES.PERMISSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getAuthSession = async () => {
  try {
    const [token, userRaw] = await Promise.all([
      getItem(SERVICES.TOKEN),
      getItem(SERVICES.USER),
    ]);
    return {
      token,
      user: userRaw ? JSON.parse(userRaw) : null,
      isLoggedIn: !!token,
    };
  } catch {
    return { token: null, user: null, isLoggedIn: false };
  }
};

export const hasPermission = async (permissionName) => {
  const permissions = await getPermissions();
  return permissions.some((group) =>
    group.permissions?.some((p) => p.name === permissionName),
  );
};

export const clearAuthData = async () => {
  try {
    await Promise.all([
      removeItem(SERVICES.TOKEN),
      removeItem(SERVICES.USER),
      removeItem(SERVICES.PERMISSIONS),
    ]);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const saveSelectedShiftId = async (shiftId) => {
  try {
    await setItem(SERVICES.SHIFT_SELECTED, String(shiftId));
    return { success: true };
  } catch (e) {
    console.error('saveSelectedShiftId failed:', e);
    return { success: false, error: e.message };
  }
};

export const clearSlotDetails = async () => {
  try {
    await removeItem(SERVICES.SHIFT_SLOT);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const saveSlotDetails = async (slot) => {
  try {
    await setItem(SERVICES.SHIFT_SLOT, JSON.stringify(slot));
    return { success: true };
  } catch (e) {
    console.error('saveSlotDetails failed:', e);
    return { success: false, error: e.message };
  }
};

export const getSlotDetails = async () => {
  try {
    const raw = await getItem(SERVICES.SHIFT_SLOT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getSelectedShiftId = async () => {
  try {
    const raw = await getItem(SERVICES.SHIFT_SELECTED);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
};

export const clearSelectedShiftId = async () => {
  try {
    await removeItem(SERVICES.SHIFT_SELECTED);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const saveShiftData = async (shiftData) => {
  console.log(" save shift details "+JSON.stringify(shiftData));
  try {
    const data = {
      shift_id:   shiftData?.shift_id ?? null,
      shift_name: shiftData?.shift_name ?? null,
      shift_type: shiftData?.shift_type ?? null,
      shift_time: shiftData?.shift_time ?? shiftData?.shift_timing ?? null,
    };
    await setItem(SERVICES.SHIFT, JSON.stringify(data));
    return { success: true };
  } catch (e) {
    console.error('saveShiftData failed:', e);
    return { success: false, error: e.message };
  }
};

export const getShiftData = async () => {
  try {
    const raw = await getItem(SERVICES.SHIFT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveLines = async (lines) => {
  try {
    const safe = (lines ?? []).map((l) => ({ id: l.id, name: l.name }));
    await Promise.all([
      setItem(SERVICES.LINE_IDS, JSON.stringify(safe.map((l) => l.id))),
      setItem(SERVICES.LINE_NAMES, JSON.stringify(safe.map((l) => l.name))),
    ]);
    return { success: true };
  } catch (e) {
    console.error('saveLines failed:', e);
    return { success: false, error: e.message };
  }
};
export const getLines = async () => {
  try {
    const [ids, names] = await Promise.all([getLineIds(), getLineNames()]);
    const idsArr = Array.isArray(ids) ? ids : [];
    const namesArr = Array.isArray(names) ? names : [];
    return idsArr.map((id, i) => ({ id, name: namesArr[i] ?? String(id) }));
  } catch (e) {
    console.warn('getLines failed:', e.message);
    return [];
  }
};
export const saveLineNames = async (lineNames) => {
  try {
    await setItem(SERVICES.LINE_NAMES, JSON.stringify(lineNames ?? []));
    return { success: true };
  } catch (e) {
    console.error('saveLineNames failed:', e);
    return { success: false, error: e.message };
  }
};

export const getLineNames = async () => {
  try {
    const raw = await getItem(SERVICES.LINE_NAMES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCheckInUuid = async (uuid) => {
  try {
    if (!uuid) return { success: true }; // nothing to save, not an error
    await setItem(SERVICES.CHECKIN_UUID, uuid);
    return { success: true };
  } catch (e) {
    console.error('saveCheckInUuid failed:', e);
    return { success: false, error: e.message };
  }
};

export const getCheckInUuid = async () => {
  try {
    return await getItem(SERVICES.CHECKIN_UUID);
  } catch {
    return null;
  }
};

export const clearCheckInUuid = async () => {
  try {
    await removeItem(SERVICES.CHECKIN_UUID);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const clearShiftData = async () => {
  try {
    await removeItem(SERVICES.SHIFT);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const saveZoneIds = async (zoneIds) => {
  try {
    await setItem(SERVICES.ZONE_IDS, JSON.stringify(zoneIds ?? []));
    return { success: true };
  } catch (e) {
    console.error('saveZoneIds failed:', e);
    return { success: false, error: e.message };
  }
};

export const getZoneIds = async () => {
  try {
    const raw = await getItem(SERVICES.ZONE_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLineIds = async (lineIds) => {
  try {
    await setItem(SERVICES.LINE_IDS, JSON.stringify(lineIds ?? []));
    return { success: true };
  } catch (e) {
    console.error('saveLineIds failed:', e);
    return { success: false, error: e.message };
  }
};

export const getLineIds = async () => {
  try {
    const raw = await getItem(SERVICES.LINE_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Persists the single "currently active" line the user has selected on a
// line-scoped screen (TLS Audit, TLS Issue Tracker, QC Verification, etc.).
// This lets any screen — including nested components like OrderDetailsSheet
// that don't receive the line as a navigation param — look up the active
// line without relying on prop drilling.
export const saveSelectedLineId = async (lineId) => {
  try {
    if (lineId === null || lineId === undefined) {
      await removeItem(SERVICES.SELECTED_LINE_ID);
      return { success: true };
    }
    await setItem(SERVICES.SELECTED_LINE_ID, String(lineId));
    return { success: true };
  } catch (e) {
    console.error('saveSelectedLineId failed:', e);
    return { success: false, error: e.message };
  }
};

export const getSelectedLineId = async () => {
  try {
    return await getItem(SERVICES.SELECTED_LINE_ID);
  } catch {
    return null;
  }
};

export const clearSelectedLineId = async () => {
  try {
    await removeItem(SERVICES.SELECTED_LINE_ID);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const clearZoneLineSelection = async () => {
  try {
    await Promise.all([
      removeItem(SERVICES.ZONE_IDS),
      removeItem(SERVICES.ZONE_NAMES),
      removeItem(SERVICES.LINE_IDS),
      removeItem(SERVICES.LINE_NAMES),
      removeItem(SERVICES.SHIFT_SELECTED),
      removeItem(SERVICES.SELECTED_LINE_ID),
    ]);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const saveCheckInData = async (checkin) => {
  try {
    await setItem(SERVICES.CHECKIN, JSON.stringify(checkin));
    return { success: true };
  } catch (e) {
    console.error('saveCheckInData failed:', e);
    return { success: false, error: e.message };
  }
};

export const getCheckInData = async () => {
  try {
    const raw = await getItem(SERVICES.CHECKIN);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearCheckInData = async () => {
  try {
    await removeItem(SERVICES.CHECKIN);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const saveZoneNames = async (zoneNames) => {
  try {
    await setItem(SERVICES.ZONE_NAMES, JSON.stringify(zoneNames ?? []));
    return { success: true };
  } catch (e) {
    console.error('saveZoneNames failed:', e);
    return { success: false, error: e.message };
  }
};

export const getZoneNames = async () => {
  try {
    const raw = await getItem(SERVICES.ZONE_NAMES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Defect entry persistence (DefectEntrySheet)
//
// Two independent things are stored here:
//   1. RECENT_DEFECTS — an MRU list of individual (defect, severity) picks,
//      used to populate the "Recent" tab so operators can quickly re-tap
//      defects they log often, regardless of which category they live in.
//   2. DEFECT_ENTRIES — the full entries map from the last time "Apply" was
//      pressed, used to pre-fill the sheet the next time it's opened so an
//      operator doesn't lose in-progress counts if they navigate away.
// ─────────────────────────────────────────────────────────────────────────

const recentDefectKey = (d) => `${d?.defect_id}::${d?.severity_id}`;

// Recent defects are stored per mode: multi-select (default) and
// single-select each get their own Keychain key so a "pick one defect"
// flow's recents never mix with a multi-select audit flow's recents.
const recentDefectsService = (tag) =>
  tag === 'single' ? SERVICES.RECENT_DEFECTS_SINGLE : SERVICES.RECENT_DEFECTS;

export const getRecentDefects = async (tag) => {
  try {
    const raw = await getItem(recentDefectsService(tag));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveRecentDefects = async (recentList, tag) => {
  try {
    await setItem(recentDefectsService(tag), JSON.stringify(recentList ?? []));
    return { success: true };
  } catch (e) {
    console.error('saveRecentDefects failed:', e);
    return { success: false, error: e.message };
  }
};

// Moves `defectEntry` to the front of the recent list (deduped by
// defect_id + severity_id) and persists the result. Returns the updated
// list so callers can sync local state without a second read.
export const addRecentDefect = async (defectEntry, tag) => {
  try {
    const current = await getRecentDefects(tag);
    const filtered = current.filter((d) => recentDefectKey(d) !== recentDefectKey(defectEntry));
    const next = [defectEntry, ...filtered].slice(0, MAX_RECENT_DEFECTS);
    await saveRecentDefects(next, tag);
    return next;
  } catch (e) {
    console.error('addRecentDefect failed:', e);
    return null;
  }
};

export const clearRecentDefects = async (tag) => {
  try {
    await removeItem(recentDefectsService(tag));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

// DEFECT_ENTRIES is keyed per mode for the same reason — multi-select and
// single-select each get their own dedicated Keychain key.
const defectEntriesService = (tag) =>
  tag === 'single' ? SERVICES.DEFECT_ENTRIES_SINGLE : SERVICES.DEFECT_ENTRIES;

export const getDefectEntries = async (tag) => {
  try {
    const raw = await getItem(defectEntriesService(tag));
    const entries = raw ? JSON.parse(raw) : {};
    return entries && typeof entries === 'object' ? entries : {};
  } catch {
    return {};
  }
};

export const saveDefectEntries = async (entries, tag) => {
  try {
    await setItem(defectEntriesService(tag), JSON.stringify(entries ?? {}));
    return { success: true };
  } catch (e) {
    console.error('saveDefectEntries failed:', e);
    return { success: false, error: e.message };
  }
};

export const clearDefectEntries = async (tag) => {
  try {
    await removeItem(defectEntriesService(tag));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Scan → Audit elapsed-time tracking
//
// When scan verification completes for an order (verifyAndGetSlot resolves
// successfully on the audit screen), the caller captures `Date.now()` and
// persists it here keyed by order id. Later, when the audit is submitted,
// the caller reads it back and computes:
//
//   elapsed_time_ms = auditSubmitTime - scanAuditTime
//
// Stored as a single JSON map { [orderId]: timestampMs } under one
// Keychain service so multiple in-flight orders (e.g. operator backs out
// and picks up a different order) don't clobber each other.
// ─────────────────────────────────────────────────────────────────────────

const readScanTimeMap = async () => {
  const raw = await getItem(SERVICES.SCAN_AUDIT_TIME);
  const map = raw ? JSON.parse(raw) : {};
  return map && typeof map === 'object' ? map : {};
};

export const saveScanAuditTime = async (orderId, timestamp = Date.now()) => {
  try {
    if (orderId === null || orderId === undefined || orderId === '') {
      return { success: false, error: 'orderId is required' };
    }
    const map = await readScanTimeMap();
    map[String(orderId)] = timestamp;
    await setItem(SERVICES.SCAN_AUDIT_TIME, JSON.stringify(map));
    return { success: true, timestamp };
  } catch (e) {
    console.error('saveScanAuditTime failed:', e);
    return { success: false, error: e.message };
  }
};

export const getScanAuditTime = async (orderId) => {
  try {
    if (orderId === null || orderId === undefined || orderId === '') return null;
    const map = await readScanTimeMap();
    return map[String(orderId)] ?? null;
  } catch {
    return null;
  }
};

// Pass an orderId to clear just that order's entry, or omit it to wipe the
// whole map (used by clearAllSession on logout).
export const clearScanAuditTime = async (orderId) => {
  try {
    if (orderId === null || orderId === undefined || orderId === '') {
      await removeItem(SERVICES.SCAN_AUDIT_TIME);
      return { success: true };
    }
    const map = await readScanTimeMap();
    delete map[String(orderId)];
    await setItem(SERVICES.SCAN_AUDIT_TIME, JSON.stringify(map));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
export const clearOnlyBraLine = async () =>{
  try{
    await Promise.all([
    clearZoneLineSelection(),
      clearBranchTeamSelection(),
       ]);
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
}

export const clearAllSession = async () => {
  try {
    await Promise.all([
      clearAuthData(),
      clearCheckInData(),
      clearShiftData(),
      clearZoneLineSelection(),
      clearBranchTeamSelection(),
      clearCheckInUuid(),
      clearSlotDetails(),
      clearRecentDefects(),
      clearRecentDefects('single'),
      clearDefectEntries(),
      clearDefectEntries('single'),
      clearScanAuditTime(),
      removeItem(SERVICES.WELCOME_FLAG),
    ]);
    return { success: true };
  } catch (e) {
    console.error('clearAllSession failed:', e);
    return { success: false, error: e.message };
  }
};
export const setShowWelcomeFlag = async () => {
  try {
    await setItem(SERVICES.WELCOME_FLAG, '1');
    return { success: true };
  } catch (e) {
    console.error('setShowWelcomeFlag failed:', e);
    return { success: false, error: e.message };
  }
};

export const consumeShowWelcomeFlag = async () => {
  try {
    const val = await getItem(SERVICES.WELCOME_FLAG);
    if (val === '1') {
      await removeItem(SERVICES.WELCOME_FLAG);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};