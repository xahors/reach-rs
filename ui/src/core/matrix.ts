import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../store/useAppStore';

export interface LoginResponse {
  user_id: string;
  device_id: string;
  access_token: string;
  homeserver: string;
}

class MatrixService {
  private isInitializing = false;
  private initPromise: Promise<any> | null = null;

  async login(homeserver: string, username: string, password: string): Promise<LoginResponse | null> {
    if (this.isInitializing) return null;
    this.isInitializing = true;
    
    try {
      const result = await invoke<LoginResponse>('login', { homeserver, username, password });

      localStorage.setItem('matrix_access_token', result.access_token);
      localStorage.setItem('matrix_user_id', result.user_id);
      localStorage.setItem('matrix_device_id', result.device_id);
      localStorage.setItem('matrix_homeserver', homeserver);

      await invoke('start_sync');

      return result;
    } catch (e) {
      console.error("Login failed:", e);
      throw e;
    } finally {
      this.isInitializing = false;
    }
  }

  async loginWithStoredToken(): Promise<boolean> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.isInitializing = true;

      try {
        const accessToken = localStorage.getItem('matrix_access_token');
        const userId = localStorage.getItem('matrix_user_id');
        const deviceId = localStorage.getItem('matrix_device_id');
        const homeserver = localStorage.getItem('matrix_homeserver');

        if (!accessToken || !userId || !deviceId || !homeserver) {
          return false;
        }

        await invoke('reconnect', { homeserver, userId, accessToken, deviceId });
        
        await invoke('start_sync');
        
        return true;
      } catch (e) {
        console.error("Token login failed:", e);
        return false;
      } finally {
        this.isInitializing = false;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  async logout() {
    try {
      await invoke('logout');
    } catch (e) {
      console.error("Logout failed:", e);
    }
    localStorage.removeItem('matrix_access_token');
    localStorage.removeItem('matrix_user_id');
    localStorage.removeItem('matrix_device_id');
    localStorage.removeItem('matrix_homeserver');
    localStorage.removeItem('reach-app-storage');
    window.location.reload();
  }

  // Native implementations (Phase 2/3)
  async createRoom(options: any) {
    console.warn("createRoom not yet implemented in Rust backend");
    return null;
  }

  async createSpace(name: string, topic?: string) {
    console.warn("createSpace not yet implemented in Rust backend");
    return null;
  }

  // Native E2EE Helpers
  getCrypto() {
    // Rust-sdk handles crypto internally. 
    // This stub provides enough of the interface to avoid crashes until components are refactored.
    return {
      getCrossSigningStatus: async () => ({}),
      setDeviceVerified: async () => {},
      loadCrossSigningKeysFromSecretStorage: async () => {},
      loadSessionBackupPrivateKeyFromSecretStorage: async () => {},
    };
  }

  async withRecoveryKey<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Native recovery key handling will be implemented in Rust
    return await fn();
  }

  async retryDecryption() {
    // In rust-sdk, decryption is automatic during sync.
    console.log("Native decryption retry triggered");
  }

  // Placeholder methods for parity during migration
  getClient(): any { return null; }
  stop(_isPermanent: boolean = false) {}
  reconnect() { return this.loginWithStoredToken(); }
  syncPresenceWithStore() {}
}

export const matrixService = new MatrixService();
