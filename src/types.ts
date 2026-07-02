export interface DashboardItem {
  id: string; // unique item key
  name: string;
  url: string;
  icon: string; // Lucide icon identifier or FontAwesome string
  color?: string; // Custom color override for the icon
  hideUrl?: boolean; // Hide the URL text from display
  svgContent?: string; // Raw SVG markup for custom icon (overrides icon name when set)
}

export interface SectionConfig {
  id: string; // e.g. 'operations', 'finance', 'academics'
  title: string;
  color: string; // Accent color hex
  items: DashboardItem[];
}

export interface ProfileConfig {
  name: string;
  role: string;
  avatarInitials: string;
}

export interface ThemeColors {
  '--primary': string;
  '--bg': string;
  '--text': string;
  '--text-muted': string;
  '--accent': string;
  '--accent2': string;
  '--accent3': string;
  '--secondary': string;
  '--surface': string;
  '--glass-border': string;
}

export interface ThemeConfig {
  themeName: 'dark' | 'light' | 'sunset' | 'forest' | 'ocean';
  colors: ThemeColors;
  itemScale: number; // e.g. 100 for 100%
  backgroundImage: string | null;
}

export interface SyncConfig {
  sheetId: string;
  csvUrl: string;
  scriptUrl: string;
}

export interface DeviceSession {
  id: string;
  os: string;
  browser: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  isCurrent?: boolean;
}

export interface SharedState {
  sections: SectionConfig[];
  sectionOrder: string[];
  profile: ProfileConfig;
  theme: ThemeConfig;
  syncDoc: SyncConfig;
  version?: number;
}

// Types of WS messages
export type WSMessageType =
  | 'init'          // server sends initial state and client's ID
  | 'sync_update'   // broadcasted state update
  | 'device_list'   // notice about current connected devices
  | 'device_register' // client registers device properties
  | 'ping'          // keep-alive
  | 'pong';

export interface WSMessage {
  type: WSMessageType;
  clientId?: string;
  payload?: any;
}
