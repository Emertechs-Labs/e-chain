// ESM shim for use-sync-external-store/shim/with-selector using React 18 built-in useSyncExternalStore
import { useSyncExternalStore, useRef, useEffect, useMemo, useDebugValue } from 'react';

function is(x, y) {
  return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
}

const objectIs = typeof Object.is === 'function' ? Object.is : is;

export function useSyncExternalStoreWithSelector(
  subscribe,
  getSnapshot,
  getServerSnapshot,
  selector,
  isEqual
) {
  const instRef = useRef(null);
  if (instRef.current === null) {
    const inst = { hasValue: false, value: null };
    instRef.current = inst;
  }
  const inst = instRef.current;
  
  const getSnapshotWithSelector = useMemo(() => {
    function memoizedSelector(nextSnapshot) {
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;
        const nextSelection = selector(nextSnapshot);
        if (isEqual !== undefined && inst.hasValue) {
          const currentSelection = inst.value;
          if (isEqual(currentSelection, nextSelection)) {
            return (memoizedSelection = currentSelection);
          }
        }
        return (memoizedSelection = nextSelection);
      }
      const currentSelection = memoizedSelection;
      if (objectIs(memoizedSnapshot, nextSnapshot)) {
        return currentSelection;
      }
      const nextSelection = selector(nextSnapshot);
      if (isEqual !== undefined && isEqual(currentSelection, nextSelection)) {
        memoizedSnapshot = nextSnapshot;
        return currentSelection;
      }
      memoizedSnapshot = nextSnapshot;
      return (memoizedSelection = nextSelection);
    }
    
    let hasMemo = false;
    let memoizedSnapshot;
    let memoizedSelection;
    const maybeGetServerSnapshot = getServerSnapshot === undefined ? null : getServerSnapshot;
    
    return [
      function () {
        return memoizedSelector(getSnapshot());
      },
      maybeGetServerSnapshot === null
        ? undefined
        : function () {
            return memoizedSelector(maybeGetServerSnapshot());
          }
    ];
  }, [getSnapshot, getServerSnapshot, selector, isEqual]);
  
  const value = useSyncExternalStore(subscribe, getSnapshotWithSelector[0], getSnapshotWithSelector[1]);
  
  useEffect(() => {
    inst.hasValue = true;
    inst.value = value;
  }, [value]);
  
  useDebugValue(value);
  return value;
}