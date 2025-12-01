export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'command';
  message: string;
}

export interface SystemStats {
  cpuLoad: number;
  memoryUsage: number;
  networkLatency: number;
  temperature: number;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface UserPermissions {
  canControlApps: boolean;
  canSendMessages: boolean;
  canExecuteSystemScans: boolean;
  canAccessFiles: boolean;
}

export interface CustomVoice {
  id: string;
  name: string;
  baseModel: string; // The underlying Gemini voice model used
  createdAt: string;
}

export interface UserProfile {
  id: string;
  googleId?: string;
  email?: string;
  dob?: string;
  photoUrl?: string;
  
  name: string;
  aiName: string;
  
  language: string;
  voiceName: string; // Current selected voice ID (standard or custom)
  isCustomVoice: boolean;
  
  customVoices: CustomVoice[]; // List of user's custom voices
  
  processingMode: 'cloud' | 'local';
  
  permissions: UserPermissions;
  themeColor: 'cyan' | 'purple' | 'green' | 'red' | 'amber';
}

export interface AuthUser {
  isAuthenticated: boolean;
  profileId: string | null;
}