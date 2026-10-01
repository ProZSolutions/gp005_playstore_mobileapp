import * as Keychain from 'react-native-keychain';

const SERVICE_PREFIX = 'app.defect.entryTime.';

const KEYCHAIN_OPTIONS = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const serviceFor = (entryKey) => `${SERVICE_PREFIX}${entryKey}`;

export const getDefectEntryTime = async (entryKey) => {
  try {
    if (!entryKey) return null;
    const result = await Keychain.getGenericPassword({ service: serviceFor(entryKey) });
    return result ? result.password : null;
  } catch (e) {
    console.warn('Failed to read defect entry time:', e.message);
    return null;
  }
};

export const setDefectEntryTime = async (entryKey, isoString) => {
  try {
    if (!entryKey) return { success: false, error: 'Missing entryKey' };
    await Keychain.setGenericPassword('entry_time', isoString, {
      ...KEYCHAIN_OPTIONS,
      service: serviceFor(entryKey),
    });
    return { success: true };
  } catch (e) {
    console.warn('Failed to persist defect entry time:', e.message);
    return { success: false, error: e.message };
  }
};

export const clearDefectEntryTime = async (entryKey) => {
  try {
    if (!entryKey) return { success: true };
    await Keychain.resetGenericPassword({ service: serviceFor(entryKey) });
    return { success: true };
  } catch (e) {
    console.warn('Failed to clear defect entry time:', e.message);
    return { success: false, error: e.message };
  }
};