import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getLines,
  getSelectedLineId,
  saveSelectedLineId,
} from '../api/storage/authStorage';

export const toArray = (v) => (Array.isArray(v) ? v : []);

export function sortLinePairs(ids, names) {
  const paired = toArray(ids).map((id, i) => ({ id, name: toArray(names)[i] ?? id }));

  paired.sort((a, b) => {
    const numA = Number(a.id);
    const numB = Number(b.id);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
    return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
  });

  return paired;
}

let lineOrderCache = { ids: null, names: null };

export function useLineSelection({
  routeLineIds = [],
  routeLineNames = [],
  initialActiveLineId = null,
  restoreSavedSelection = false,
  persistSelection = false,
} = {}) {
  const [lineIds, setLineIds] = useState(() => toArray(routeLineIds));
  const [lineNames, setLineNames] = useState(() => toArray(routeLineNames));
  const [activeLineId, setActiveLineId] = useState(initialActiveLineId);

  useEffect(() => {
    const routeIdsArr = toArray(routeLineIds);
    const routeNamesArr = toArray(routeLineNames);
    const routeIsComplete =
      routeIdsArr.length > 0 &&
      routeNamesArr.length > 0 &&
      routeIdsArr.length === routeNamesArr.length;

    // Render whatever the route gave us for THIS screen instance, but do
    // NOT treat it as the canonical "all lines" cache — it may be a
    // deliberately partial, screen-scoped list.
    if (routeIsComplete) {
      setLineIds(routeIdsArr);
      setLineNames(routeNamesArr);
      return;
    }

    // No usable route data — fall back to the canonical cache/storage,
    // which always represents the user's FULL line list.
    if (lineOrderCache.ids && lineOrderCache.names) {
      setLineIds(lineOrderCache.ids);
      setLineNames(lineOrderCache.names);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // Single bulk read — id and name come back already paired, so
        // there's no separate-array zip step that could misalign them.
        const storedPairs = await getLines(); // [{id, name}]
        if (cancelled) return;

        const idsArr = storedPairs.map((p) => p.id);
        const namesArr = storedPairs.map((p) => p.name);
        const storedIsComplete = idsArr.length > 0 && namesArr.length === idsArr.length;

        console.log("stored ID "+JSON.stringify(idsArr)+" storenames "+JSON.stringify(namesArr));

        if (storedIsComplete) {
          // Only storage-sourced data is allowed to populate the shared
          // cache — this is the one source that's guaranteed to be the
          // user's complete line list, not a per-screen subset.
          lineOrderCache = { ids: idsArr, names: namesArr };
          setLineIds(idsArr);
          setLineNames(namesArr);
        }
      } catch (e) {
        console.warn('useLineSelection: failed to load stored line data:', e.message);
      }
    })();
    return () => { cancelled = true; };
   }, [routeLineIds, routeLineNames]);

  const lines = useMemo(() => sortLinePairs(lineIds, lineNames), [lineIds, lineNames]);

  useEffect(() => {
    if (!restoreSavedSelection) return;
    if (activeLineId) return;
    if (lines.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const savedLineId = await getSelectedLineId();
        if (!cancelled && savedLineId && lines.some((l) => l.id === savedLineId)) {
          setActiveLineId(savedLineId);
        }
      } catch (e) {
        console.warn('useLineSelection: failed to restore selected line:', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [restoreSavedSelection, lines, activeLineId]);

  const handleLineChange = useCallback((id) => {
    setActiveLineId(id);
    if (persistSelection) {
      saveSelectedLineId(id);
    }
  }, [persistSelection]);

  return {
    lines,        // [{ id, name }] — sorted ascending, ready to render as chips
    lineIds,      // raw ids array (unsorted), for payloads that expect the original shape
    lineNames,    // raw names array (unsorted), parallel to lineIds
    activeLineId,
    setActiveLineId, // raw setter, for screens that need to set without persisting (e.g. autoScan)
    handleLineChange, // setter + optional persistence, for user-driven chip taps
  };
}