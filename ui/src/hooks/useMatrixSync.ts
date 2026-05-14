import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { listen } from '@tauri-apps/api/event';

export const useMatrixSync = () => {
  const { isLoggedIn, isSynced, setSynced } = useAppStore();
  const [syncState, setSyncState] = useState<string | null>(isLoggedIn ? 'SYNCING' : null);

  useEffect(() => {
    if (!isLoggedIn) {
      setSynced(false);
      return;
    }

    // Mock synced for now to allow UI to render
    setSynced(true);
    setSyncState('SYNCING');

    const unlisten = listen('matrix-event', (event) => {
      console.log('Matrix event from Rust:', event.payload);
      // TODO: Update store with new event
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [isLoggedIn, setSynced]);

  return { isSynced, syncState };
};
