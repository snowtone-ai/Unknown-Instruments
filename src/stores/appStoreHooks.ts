import { useContext } from 'react';
import { AppStoreContext, type AppStore } from './appStoreModel';

export function useAppStore(): AppStore {
  const value = useContext(AppStoreContext);
  if (!value) throw new Error('useAppStore must be used inside AppStoreProvider.');
  return value;
}
