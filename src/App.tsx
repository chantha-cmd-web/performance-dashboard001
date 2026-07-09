import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  IdCard,
  User,
  CalendarCheck,
  Fingerprint,
  Compass,
  Database,
  Percent,
  Mail,
  Award,
  MessageSquare,
  Scale,
  BookOpen,
  FileText,
  Globe,
  UserMinus,
  MinusCircle,
  Eye,
  Sparkles,
  GitBranch,
  ClipboardList,
  Map,
  QrCode,
  HardDrive,
  FileSpreadsheet,
  Users,
  HelpCircle,
  Home,
  Calculator,
  Coins,
  FolderOpen,
  Cloud,
  Clock,
  List,
  DollarSign,
  File as FileIcon,
  Table,
  UserCheck,
  CreditCard,
  BarChart,
  GraduationCap,
  Presentation,
  Book,
  TrendingUp,
  Briefcase,
  Plus,
  Pencil,
  Moon,
  Sun,
  Search,
  Trash,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Check,
  X,
  Settings,
  RotateCcw,
  Download,
  Upload,
  Info,
  Laptop,
  Smartphone,
  Tablet as TabletIcon,
  Activity,
  CheckCircle,
  ExternalLink,
  Gift,
  Palette,
  EyeOff,
  CloudLightning,
  AlertCircle
} from 'lucide-react';

import {
  DashboardItem,
  SectionConfig,
  ProfileConfig,
  ThemeColors,
  ThemeConfig,
  SyncConfig,
  DeviceSession,
  SharedState,
  UserRole,
} from './types';

import { useAuth, LoginPage } from './auth';

import {
  DEFAULT_PROFILE,
  DEFAULT_THEME,
  DARK_COLORS,
  LIGHT_COLORS,
  DEFAULT_SYNC,
  DEFAULT_SECTIONS,
  DEFAULT_SECTION_ORDER
} from './initialData';

import { Icon } from './components/Icon';
import { SvgPicker } from './components/SvgPicker';
import { loadRemoteState, saveRemoteState, subscribeRemoteState } from './firebase';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? 'relative' : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function App() {
  // Shared Configuration State
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [profile, setProfile] = useState<ProfileConfig>(DEFAULT_PROFILE);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [isDayMode, setIsDayMode] = useState<boolean>(false);
  const [syncDoc, setSyncDoc] = useState<SyncConfig>(DEFAULT_SYNC);

  // Sync status
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [syncNotice, setSyncNotice] = useState<string>('');
  const [isNoticeError, setIsNoticeError] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Layout states
  const [activeSectionId, setActiveSectionId] = useState<string>('operations');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [localSearch, setLocalSearch] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);

  // Auth
  const { user: authUser, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('par_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  // Backup layout snapshot for Cancel edits flow
  const [layoutSnapshot, setLayoutSnapshot] = useState<SharedState | null>(null);

  // Clock state
  const [timeStr, setTimeStr] = useState<string>('00:00:00');
  const [dateStr, setDateStr] = useState<string>('Loading Date...');

  // Modals state
  const [activeFormModalOpen, setActiveFormModalOpen] = useState<boolean>(false);
  const [formIframeUrl, setFormIframeUrl] = useState<string>('https://docs.google.com/forms/d/e/1FAIpQLSfD_u9l-u-Vb7Fz5G_0X_0jH3F-0u_e_EXAMPLE/viewform?embedded=true');
  const [formUrlBarVisible, setFormUrlBarVisible] = useState<boolean>(false);
  const [formUrlInput, setFormUrlInput] = useState<string>('');

  // Settings Modal State
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // URL Editor State
  const [urlEditorOpen, setUrlEditorOpen] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemSection, setEditingItemSection] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState<string>('');
  const [editingItemUrl, setEditingItemUrl] = useState<string>('');
  const [editingItemHideUrl, setEditingItemHideUrl] = useState<boolean>(false);

  // SVG Picker state
  const [svgPickerOpen, setSvgPickerOpen] = useState<boolean>(false);
  const [svgPickerSectionId, setSvgPickerSectionId] = useState<string | null>(null);
  const [svgPickerItemId, setSvgPickerItemId] = useState<string | null>(null);

  // Add Item Overlay state
  const [addItemOpen, setAddItemOpen] = useState<boolean>(false);
  const [addItemSectionId, setAddItemSectionId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemUrl, setNewItemUrl] = useState<string>('');

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('par_sidebar_open', String(sidebarOpen));
  }, [sidebarOpen]);

  // Initialize Clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0')
      );
      setDateStr(d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync state dynamically with root HTML CSS variable definitions
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, color]) => {
      root.style.setProperty(key, color as string);
    });
    root.style.setProperty('--item-scale', String(theme.itemScale / 100));
  }, [theme]);

  // Load initial state: compare timestamps across Firestore + localStorage, use newest
  useEffect(() => {
    const init = async () => {
      setWsStatus('connecting');
      let bestState: SharedState | null = null;
      let bestTime = 0;
      try {
        const remote = await loadRemoteState();
        if (remote && remote.sections?.length) {
          bestState = remote;
          bestTime = remote.updatedAt ?? 0;
        }
      } catch {}
      const saved = localStorage.getItem('par_dashboard_state');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data?.sections?.length && (data.updatedAt ?? 0) > bestTime) {
            bestState = data;
            bestTime = data.updatedAt ?? 0;
          }
        } catch {}
      }
      if (bestState) {
        prevSnapshotRef.current = JSON.stringify(bestState);
        if (bestTime > 0) lastAppliedTimeRef.current = bestTime;
        applyDownloadedState(bestState);
        setWsStatus('connected');
        showSyncLog('Synchronized in real-time!', false);
        return;
      }
      setWsStatus('disconnected');
    };
    init();
  }, []);

  // Timestamp guard: only apply updates newer than the last applied one
  // Prevents stale cache data and out-of-order delivery from reverting local changes
  const lastAppliedTimeRef = useRef<number>(0);

  // Subscribe to real-time remote updates from other devices
  useEffect(() => {
    const unsub = subscribeRemoteState(
      (state) => {
        if (!state) return;
        const stateJson = JSON.stringify(state);
        // Self-revert guard: skip if this snapshot matches what we last saved
        if (stateJson === prevSnapshotRef.current) return;
        // Timestamp guard: skip stale cache data that is not newer than applied
        if (state.updatedAt != null) {
          if (state.updatedAt < lastAppliedTimeRef.current) return;
          lastAppliedTimeRef.current = state.updatedAt;
        } else if (lastAppliedTimeRef.current > 0) {
          // No timestamp on incoming data but we've already applied timestamped state
          // This is stale legacy cache — skip it
          return;
        }
        prevSnapshotRef.current = stateJson;
        applyDownloadedState(state);
        setWsStatus('connected');
      },
      () => {
        setWsStatus('disconnected');
      }
    );
    return unsub;
  }, []);

  // Polling fallback: periodically check Firestore for changes missed by onSnapshot
  const prevSnapshotRef = useRef<string>('');
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const remote = await loadRemoteState();
        if (!remote || !remote.sections) return;
        const remoteJson = JSON.stringify(remote);
        // Skip if data matches what we last saved
        if (remoteJson === prevSnapshotRef.current) return;
        // Timestamp guard: skip stale cache data
        if (remote.updatedAt != null) {
          if (remote.updatedAt < lastAppliedTimeRef.current) return;
          lastAppliedTimeRef.current = remote.updatedAt;
        } else if (lastAppliedTimeRef.current > 0) {
          return;
        }
        prevSnapshotRef.current = remoteJson;
        applyDownloadedState(remote);
        setWsStatus('connected');
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket connection for fast real-time sync across devices
  useEffect(() => {
    let mounted = true;
    let wasEverConnected = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let failTimer: ReturnType<typeof setTimeout>;

    const connectWs = () => {
      if (!mounted) return;
      setWsStatus('connecting');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      let ws: WebSocket;
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        return;
      }
      wsRef.current = ws;

      // If no connection within 5s, give up (static hosting like GitHub Pages)
      failTimer = setTimeout(() => {
        if (!wasEverConnected && ws.readyState !== WebSocket.OPEN) {
          ws.close();
          wsRef.current = null;
          setWsStatus('disconnected');
        }
      }, 5000);

      ws.onopen = () => {
        if (!mounted) { ws.close(); return; }
        clearTimeout(failTimer);
        wasEverConnected = true;
        setWsStatus('connected');
        const ua = navigator.userAgent;
        ws.send(JSON.stringify({
          type: 'device_register',
          payload: {
            os: ua.includes('Win') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : 'Unknown',
            browser: ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Unknown',
            deviceType: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop'
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case 'sync_update':
              if (msg.payload) {
                const stateJson = JSON.stringify(msg.payload);
                if (stateJson === prevSnapshotRef.current) break;
                if (msg.payload.updatedAt != null) {
                  if (msg.payload.updatedAt < lastAppliedTimeRef.current) break;
                  lastAppliedTimeRef.current = msg.payload.updatedAt;
                } else if (lastAppliedTimeRef.current > 0) {
                  break;
                }
                prevSnapshotRef.current = stateJson;
                applyDownloadedState(msg.payload);
              }
              break;
            case 'init':
              setWsStatus('connected');
              break;
          }
        } catch {}
      };

      ws.onclose = () => {
        wsRef.current = null;
        clearTimeout(failTimer);
        if (!mounted) return;
        setWsStatus('disconnected');
        // Only retry if we've previously connected (server exists)
        if (wasEverConnected) {
          reconnectTimer = setTimeout(connectWs, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWs();

    return () => {
      mounted = false;
      clearTimeout(failTimer);
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Helper status notice banner logger
  const showSyncLog = (message: string, isErr: boolean) => {
    setSyncNotice(message);
    setIsNoticeError(isErr);
    setTimeout(() => {
      setSyncNotice('');
    }, 6000);
  };

  // Safe apply payload state — fully replaces current state
  const applyDownloadedState = (state: any) => {
    if (!state) return;
    if (state.sections) setSections(state.sections);
    if (state.sectionOrder) setSectionOrder(state.sectionOrder);
    if (state.profile) setProfile(state.profile);
    if (state.theme) setTheme(state.theme);
    if (state.syncDoc) setSyncDoc(state.syncDoc);
  };

  // Pushes active React configuration state context to remote
  const pushStateUpdate = async (
    nextSections = sections,
    nextOrder = sectionOrder,
    nextProfile = profile,
    nextTheme = theme,
    nextSync = syncDoc
  ) => {
    const now = Date.now();
    // Track our own timestamp BEFORE the Firestore write,
    // so stale cache snapshots arriving during the write are rejected
    const prevTimestamp = lastAppliedTimeRef.current;
    lastAppliedTimeRef.current = now;

    const nextState: SharedState = {
      sections: nextSections,
      sectionOrder: nextOrder,
      profile: nextProfile,
      theme: nextTheme,
      syncDoc: nextSync,
      updatedAt: now,
    };

    const stateJson = JSON.stringify(nextState);
    const prevSnapshot = prevSnapshotRef.current;
    localStorage.setItem('par_dashboard_state', stateJson);
    const ok = await saveRemoteState(nextState);
    if (!ok) {
      console.warn('Firestore save failed — localStorage still works');
    } else {
      prevSnapshotRef.current = stateJson;
    }
    // Broadcast via WebSocket for fast real-time sync
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'sync_update',
        payload: nextState
      }));
    }
  };

  // Toggle Edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // Discard changes
      if (layoutSnapshot) {
        applyDownloadedState(layoutSnapshot);
      }
      setIsEditMode(false);
      setLayoutSnapshot(null);
    } else {
      // Take snapshot to allow Cancellations
      const currentSnapshot: SharedState = {
        sections,
        sectionOrder,
        profile,
        theme,
        syncDoc
      };
      setLayoutSnapshot(currentSnapshot);
      setIsEditMode(true);
    }
  };

  // Save the full edited layout
  const saveLayoutEdits = () => {
    setIsEditMode(false);
    setLayoutSnapshot(null);
    pushStateUpdate();
    showSyncLog("Active edits saved and synced successfully!", false);
  };

  // Discard Layout Edits
  const cancelLayoutEdits = () => {
    if (layoutSnapshot) {
      applyDownloadedState(layoutSnapshot);
    }
    setIsEditMode(false);
    setLayoutSnapshot(null);
    showSyncLog("Active edits discarded.", false);
  };

  // Edit Link Item settings handler
  const handleEditLinkRequest = (sectionId: string, item: DashboardItem) => {
    setEditingItemSection(sectionId);
    setEditingItemId(item.id);
    setEditingItemName(item.name);
    setEditingItemUrl(item.url);
    setEditingItemHideUrl(item.hideUrl || false);
    setUrlEditorOpen(true);
  };

  // Save edited Item settings
  const saveItemDetailEdit = () => {
    if (!editingItemSection || !editingItemId) return;
    const cleanUrl = editingItemUrl.trim() && !/^https?:\/\//i.test(editingItemUrl.trim())
      ? `https://${editingItemUrl.trim()}`
      : editingItemUrl.trim();

    const updatedSections = sections.map(sec => {
      if (sec.id === editingItemSection) {
        return {
          ...sec,
          items: sec.items.map(item => {
            if (item.id === editingItemId) {
              return { ...item, name: editingItemName, url: cleanUrl || '#', hideUrl: editingItemHideUrl };
            }
            return item;
          })
        };
      }
      return sec;
    });

    setSections(updatedSections);
    pushStateUpdate(updatedSections);
    setUrlEditorOpen(false);
    setEditingItemId(null);
    setEditingItemSection(null);
    showSyncLog("Changes synced to connected devices!", false);
  };

  // SVG icon picker handler
  const handleSvgSelect = (icon: string, svgContent?: string) => {
    if (!svgPickerSectionId || !svgPickerItemId) return;
    const updatedSections = sections.map(sec => {
      if (sec.id === svgPickerSectionId) {
        return {
          ...sec,
          items: sec.items.map(item => {
            if (item.id === svgPickerItemId) {
              return { ...item, icon: icon || item.icon, svgContent: svgContent || undefined };
            }
            return item;
          })
        };
      }
      return sec;
    });
    setSections(updatedSections);
    pushStateUpdate(updatedSections);
    setSvgPickerOpen(false);
    setSvgPickerSectionId(null);
    setSvgPickerItemId(null);
    showSyncLog('Icon updated and synced!', false);
  };

  // Custom icon color setter
  const handleItemColorChange = (sectionId: string, itemId: string, color: string) => {
    const updatedSections = sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          items: sec.items.map(item => {
            if (item.id === itemId) {
              return { ...item, color };
            }
            return item;
          })
        };
      }
      return sec;
    });
    setSections(updatedSections);
    pushStateUpdate(updatedSections);
  };

  // Add item helper trigger
  const triggerAddItemModal = (sectionId: string) => {
    setAddItemSectionId(sectionId);
    setNewItemName('');
    setNewItemUrl('');
    setAddItemOpen(true);
  };

  // Add Item logic
  const handleAddItem = () => {
    if (!addItemSectionId || !newItemName.trim()) return;
    const cleanUrl = newItemUrl.trim() && !/^https?:\/\//i.test(newItemUrl.trim())
      ? `https://${newItemUrl.trim()}`
      : newItemUrl.trim();

    const newItem: DashboardItem = {
      id: `item_${Date.now()}`,
      name: newItemName.trim(),
      url: cleanUrl || '#',
      icon: 'FileText', // default fallback icon
      color: '#06b6d4'
    };

    const updatedSections = sections.map(sec => {
      if (sec.id === addItemSectionId) {
        return {
          ...sec,
          items: [...sec.items, newItem]
        };
      }
      return sec;
    });

    setSections(updatedSections);
    pushStateUpdate(updatedSections);
    setAddItemOpen(false);
    setAddItemSectionId(null);
    showSyncLog(`Successfully added item "${newItemName}"!`, false);
  };

  // Delete dashboard item
  const handleDeleteItem = (sectionId: string, itemId: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
      const updatedSections = sections.map(sec => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.filter(item => item.id !== itemId)
          };
        }
        return sec;
      });
      setSections(updatedSections);
      pushStateUpdate(updatedSections);
      showSyncLog("Deleted, layout modifications updated.", false);
    }
  };

  // Section card title modifier
  const handleSectionTitleBlur = (sectionId: string, titleText: string) => {
    if (!titleText.trim()) return;
    const updatedSections = sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, title: titleText.trim() };
      }
      return sec;
    });
    setSections(updatedSections);
    pushStateUpdate(updatedSections);
  };

  // Section configuration card color setter
  const handleSectionColorChange = (sectionId: string, color: string) => {
    const updatedSections = sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, color };
      }
      return sec;
    });
    setSections(updatedSections);
    pushStateUpdate(updatedSections);
  };

  // DnD sensors for drag-to-reorder
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Drag end handler for item reorder
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Find which section these items belong to and their indices
    for (const sec of sections) {
      const itemIds = sec.items.map(i => i.id);
      const activeIdx = itemIds.indexOf(activeId);
      const overIdx = itemIds.indexOf(overId);
      if (activeIdx !== -1 && overIdx !== -1) {
        const items = [...sec.items];
        const [moved] = items.splice(activeIdx, 1);
        items.splice(overIdx, 0, moved);
        const updatedSections = sections.map(s =>
          s.id === sec.id ? { ...s, items } : s
        );
        setSections(updatedSections);
        pushStateUpdate(updatedSections);
        return;
      }
    }
  };

  // Item position array swapper (Up/Down)
  const handleItemSortOrder = (sectionId: string, itemIdx: number, direction: 'up' | 'down') => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const items = [...section.items];
    const targetIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    // Swap elements
    const temp = items[itemIdx];
    items[itemIdx] = items[targetIdx];
    items[targetIdx] = temp;

    const updatedSections = sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items };
      }
      return sec;
    });
    setSections(updatedSections);
    pushStateUpdate(updatedSections);
  };

  // Move Dashboard item from one catalog section to another
  const handleMoveToSection = (sectionId: string, itemId: string, targetSectionId: string) => {
    if (!targetSectionId) return;
    const sourceSection = sections.find(s => s.id === sectionId);
    const itemToMove = sourceSection?.items.find(i => i.id === itemId);

    if (!sourceSection || !itemToMove) return;

    const updatedSections = sections.map(sec => {
      // Remove from source list
      if (sec.id === sectionId) {
        return {
          ...sec,
          items: sec.items.filter(i => i.id !== itemId)
        };
      }
      // Add to target list
      if (sec.id === targetSectionId) {
        return {
          ...sec,
          items: [...sec.items, itemToMove]
        };
      }
      return sec;
    });

    setSections(updatedSections);
    pushStateUpdate(updatedSections);
    showSyncLog(`Moved to ${targetSectionId.toUpperCase()}!`, false);
  };

  // Reorder Sections Order
  const handleSectionOrderSwap = (idx: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= sectionOrder.length) return;

    const updatedOrder = [...sectionOrder];
    const temp = updatedOrder[idx];
    updatedOrder[idx] = updatedOrder[nextIdx];
    updatedOrder[nextIdx] = temp;

    setSectionOrder(updatedOrder);
    pushStateUpdate(sections, updatedOrder);
  };

  // Custom visual theme Hex color change trigger from Settings dialog panel
  const handleThemeColorSetting = (variable: keyof ThemeColors, value: string) => {
    const updatedTheme: ThemeConfig = {
      ...theme,
      colors: {
        ...theme.colors,
        [variable]: value
      }
    };
    setTheme(updatedTheme);
    pushStateUpdate(sections, sectionOrder, profile, updatedTheme);
  };

  // Reset colors back to system defaults
  const handleResetColors = () => {
    if (confirm("Reset dashboard variables and colors back to deep corporate theme?")) {
      const updatedTheme: ThemeConfig = {
        ...theme,
        colors: { ...DARK_COLORS }
      };
      setTheme(updatedTheme);
      pushStateUpdate(sections, sectionOrder, profile, updatedTheme);
      showSyncLog("Template color palettes rolled back.", false);
    }
  };

  // Toggle day/night mode
  const toggleDayMode = () => {
    const next = !isDayMode;
    setIsDayMode(next);
    const updatedTheme: ThemeConfig = {
      ...theme,
      colors: next ? { ...LIGHT_COLORS } : { ...DARK_COLORS }
    };
    setTheme(updatedTheme);
    pushStateUpdate(sections, sectionOrder, profile, updatedTheme);
  };

  // Background image file parser
  const handleBgImgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updatedTheme = { ...theme, backgroundImage: dataUrl };
      setTheme(updatedTheme);
      pushStateUpdate(sections, sectionOrder, profile, updatedTheme);
      showSyncLog("Custom background updated and synced!", false);
    };
    reader.readAsDataURL(file);
  };

  // Remove theme background image
  const removeBgImage = () => {
    const updatedTheme = { ...theme, backgroundImage: null };
    setTheme(updatedTheme);
    pushStateUpdate(sections, sectionOrder, profile, updatedTheme);
    showSyncLog("Background image removed.", false);
  };

  // Exports data of PAR system configurations
  const handleExportFullState = () => {
    const dataToExport = {
      version: 3,
      sections,
      sectionOrder,
      profile,
      theme,
      syncDoc
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const localUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = localUrl;
    link.download = `par-dashboard-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(localUrl);
    showSyncLog("Backup downloaded successfully!", false);
  };

  // Import JSON backup state configuration
  const handleImportJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData && Array.isArray(importedData.sections)) {
          applyDownloadedState(importedData);
          pushStateUpdate(
            importedData.sections,
            importedData.sectionOrder || sectionOrder,
            importedData.profile || profile,
            importedData.theme || theme,
            importedData.syncDoc || syncDoc
          );
          showSyncLog("Backup restored on all synced devices!", false);
        } else {
          showSyncLog("Invalid backup file layout structure.", true);
        }
      } catch (err) {
        showSyncLog("Error parsing JSON backup stream.", true);
      }
    };
    reader.readAsText(file);
  };

  // Simulate cloud PULL triggers from Settings
  const triggerOnlinePull = () => {
    if (!syncDoc.csvUrl) {
      showSyncLog("Please provide Google Sheet Published CSV URL first.", true);
      return;
    }
    showSyncLog("Pulling from Google Spreadsheet API...", false);
    // Request spreadsheet
    fetch(`${syncDoc.csvUrl}?t=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error("HTTP connection check failed");
        return res.text();
      })
      .then(bodyText => {
        // Parse CSV values / JSON embedded strings
        const parsedLayout = parsePublishedCsv(bodyText);
        if (parsedLayout) {
          applyDownloadedState(parsedLayout);
          pushStateUpdate(
            parsedLayout.sections,
            parsedLayout.sectionOrder || sectionOrder,
            parsedLayout.profile || profile,
            parsedLayout.theme || theme,
            parsedLayout.syncDoc || syncDoc
          );
          showSyncLog("State pulled from Google Sheets successfully!", false);
        } else {
          showSyncLog("Empty cell or mismatched columns in cell A1.", true);
        }
      })
      .catch(err => {
        showSyncLog(`Pull check failed: ${err.message}`, true);
      });
  };

  // Helper parsing Published spreadsheets
  const parsePublishedCsv = (raw: string) => {
    const lines = raw.split('\n');
    for (const rawLine of lines) {
      let cleanLine = rawLine.trim();
      if (cleanLine.startsWith('"') && cleanLine.endsWith('"')) {
        cleanLine = cleanLine.slice(1, -1);
      }
      cleanLine = cleanLine.replace(/""/g, '"');
      if (cleanLine.startsWith('{') && cleanLine.endsWith('}')) {
        try {
          return JSON.parse(cleanLine);
        } catch (e) {
          // ignore parsing error, try other cells
        }
      }
    }
    return null;
  };

  // Push updates to Google Script Web App
  const triggerOnlinePush = () => {
    if (!syncDoc.sheetId || !syncDoc.scriptUrl) {
      showSyncLog("Specify Google Sheet ID and deploy Script macro first.", true);
      return;
    }
    showSyncLog("Pushing layout updates to Google sheets...", false);

    const payload = JSON.stringify({
      sections,
      sectionOrder,
      profile,
      theme,
      syncDoc
    });

    const pushUrl = `${syncDoc.scriptUrl}?id=${encodeURIComponent(syncDoc.sheetId)}`;

    fetch(pushUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(payload)}`
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.text();
      })
      .then(() => {
        showSyncLog("Synced state uploaded to Google Sheets column cell A1!", false);
      })
      .catch(err => {
        showSyncLog(`Sheets push failed: Make sure macro has Anyone access (${err.message})`, true);
      });
  };

  // Helper values mapping
  const activeSection = sections.find(s => s.id === activeSectionId) || sections[0];

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const userRole: UserRole = authUser?.role || 'admin';
  const isSuperAdmin = userRole === 'super_admin';

  return (
    <div
      data-theme={isDayMode ? 'light' : 'dark'}
      className="relative min-h-screen text-slate-100 flex flex-col font-sans overflow-x-hidden"
      style={{
        backgroundColor: 'var(--bg)',
        backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background-color 0.4s ease'
      }}
    >
      {/* Dynamic Overlay if custom background is set */}
      {theme.backgroundImage && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', zIndex: 0 }}
        />
      )}

      {/* Synchronized status notification alert toast banner */}
      <AnimatePresence>
        {syncNotice && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full flex items-center gap-3 shadow-2xl backdrop-blur-md"
            style={{
              background: isNoticeError ? 'rgba(220, 38, 38, 0.95)' : 'rgba(15, 23, 42, 0.95)',
              border: isNoticeError ? '1px solid rgba(248, 113, 113, 0.4)' : '1px solid rgba(6, 182, 212, 0.3)',
              color: '#fff'
            }}
          >
            {isNoticeError ? (
              <AlertCircle size={18} className="text-red-400 shrink-0" />
            ) : (
              <CheckCircle size={18} className="text-emerald-400 shrink-0" />
            )}
            <span className="text-sm font-semibold tracking-wide">{syncNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REAL-TIME SYSTEM HEADER & NAVIGATION - Minimal */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/60 px-4 md:px-8 py-3 flex items-center justify-between shrink-0" style={{ zIndex: 40 }}>
        <div className="flex items-center gap-4">
          {/* Hamburger menu button for sidebar */}
          <button
            className="flex text-slate-300 h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-800/70 transition-colors cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
          >
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ${!sidebarOpen ? '' : 'translate-y-[3px] rotate-45'}`} />
              <span className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ${!sidebarOpen ? '' : 'opacity-0'}`} />
              <span className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ${!sidebarOpen ? '' : '-translate-y-[3px] -rotate-45'}`} />
            </div>
          </button>
        </div>

        {/* Sync status indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/60 text-xs text-slate-400 font-mono shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${wsStatus === 'connected' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${wsStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          <span className="font-semibold text-slate-300">
            {wsStatus === 'connected' ? 'Sync Active' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}
          </span>
          {wsStatus === 'connected' && (
            <span className="text-[10px] text-slate-500 border-l border-slate-800 pl-2">Cloud Sync</span>
          )}
        </div>

        {/* Real-time clocks */}
        <div className="hidden md:flex flex-col items-end shrink-0">
          <span className="text-white text-base font-bold font-mono tracking-wider">{timeStr}</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wide">{dateStr}</span>
        </div>

        {/* Multi Mode Controls */}
        <div className="flex items-center gap-2">
          {/* Universal searching bar */}
          <div className="hidden sm:flex items-center bg-slate-900/65 border border-slate-800/80 rounded-full py-1.5 px-3 focus-within:border-cyan-500 transition shadow-inner">
            <Search size={14} className="text-slate-500 mr-2" />
            <input
              type="text"
              className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-36 focus:w-44 transition-all duration-300"
              placeholder="Search reports..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            {globalSearch && (
              <X size={14} className="text-slate-400 hover:text-white cursor-pointer ml-1.5" onClick={() => setGlobalSearch('')} />
            )}
          </div>

          {/* Edit toggling triggers - only Super Admin */}
          {isSuperAdmin && !isEditMode ? (
            <button
              onClick={toggleEditMode}
              className="h-10 pl-3.5 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-md transition"
              title="Edit layout configuration, custom icons, coloring"
            >
              <Pencil size={14} className="text-cyan-400" />
              <span>Edit Links</span>
            </button>
          ) : isSuperAdmin && isEditMode ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={saveLayoutEdits}
                className="h-10 pl-3.5 pr-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer transition"
                title="Save changes and push to other devices"
              >
                <Check size={14} />
                <span>Save</span>
              </button>
              <button
                onClick={cancelLayoutEdits}
                className="h-10 pl-3.5 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-md transition"
                title="Cancel modification layout"
              >
                <RotateCcw size={14} />
                <span>Cancel</span>
              </button>
            </div>
          ) : null}

          {/* Day/Night mode toggle */}
          <button
            onClick={toggleDayMode}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-850 shadow-md cursor-pointer transition"
            title={isDayMode ? 'Switch to Dark Mode' : 'Switch to Day Mode'}
          >
            {isDayMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* System Settings trigger - Super Admin only */}
          {isSuperAdmin && (
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-850 shadow-md cursor-pointer transition"
              title="System Settings"
            >
              <Settings size={18} />
            </button>
          )}

          {/* Profile user widget */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="h-10 pl-2 pr-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-medium shadow-md transition cursor-pointer"
            >
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">
                {authUser?.avatarInitials || profile.avatarInitials}
              </div>
              <span className="hidden md:inline max-w-[80px] truncate">{authUser?.name || profile.name}</span>
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950/95 border border-slate-800/80 p-2 shadow-2xl backdrop-blur-xl z-40"
                  >
                    <div className="p-3 border-b border-slate-800/60 mb-2">
                      <p className="text-xs text-slate-400 font-semibold tracking-wide">AUTHENTICATED AS</p>
                      <p className="text-sm font-bold text-white truncate mt-0.5">{authUser?.name || profile.name}</p>
                      <p className="text-xs text-cyan-400 font-medium truncate mt-0.5">{authUser?.role === 'super_admin' ? 'Super Administrator' : authUser?.role === 'admin' ? 'Administrator' : profile.role}</p>
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setSettingsModalOpen(true);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 flex items-center gap-2.5 text-xs text-slate-300 hover:text-white transition"
                      >
                        <Settings size={14} className="text-slate-500" />
                        <span>Account Settings</span>
                      </button>
                    )}
                    <div className="border-t border-slate-800/60 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-rose-950/30 hover:text-rose-400 flex items-center gap-2.5 text-xs text-slate-400 transition"
                    >
                      <X size={14} />
                      <span>Logout Account</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 w-full flex flex-col md:flex-row gap-3 py-3 min-h-0 z-10">
        
        {/* ANIMATED SIDEBAR - Slide in/out with hamburger toggle */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Mobile overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              
              <motion.aside
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="fixed lg:relative top-0 lg:top-auto left-0 z-40 lg:z-auto h-full lg:h-auto w-80 flex-col gap-4 shrink-0"
              >
                <div className="relative border-y border-r border-slate-800/60 rounded-r-2xl flex flex-col backdrop-blur-xl shadow-2xl h-full overflow-hidden" style={{ backgroundColor: '#080830', width: '320px' }}>
                  {/* Decorative gradient blobs */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: '#06b6d4' }} />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: '#8b5cf6' }} />
                  
                  {/* PAR Branding header with Close button */}
                  <div className="relative z-10 p-5 pb-4 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/40">
                        <Activity className="text-white" size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xl text-white tracking-tight">PAR</span>
                          <span className="text-[10px] bg-cyan-900/60 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded-md font-mono font-bold">v3.0</span>
                        </div>
                        <p className="text-[11px] text-white/50 font-mono mt-0.5">{sections.reduce((a, s) => a + s.items.length, 0)} links · {sections.length} modules</p>
                      </div>
                      {/* Close button */}
                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="h-8 w-8 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
                        aria-label="Close sidebar"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Catalog Modules */}
                  <div className="px-5 pt-4 pb-1 relative z-10">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                      <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Modules</p>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-1 flex-grow overflow-y-auto px-3 pb-2 relative z-10">
                    {sectionOrder.map((secId, i) => {
                      const sec = sections.find(s => s.id === secId);
                      if (!sec) return null;
                      const isActive = activeSectionId === secId;

                      return (
                          <div
                            key={secId}
                            className={`group relative rounded-2xl flex items-center px-4 py-3 transition-all duration-200 cursor-pointer overflow-hidden font-bold ${
                              isActive
                                ? 'text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                            onClick={() => { setActiveSectionId(secId); setSidebarOpen(false); }}
                            style={isActive ? {
                              background: `linear-gradient(135deg, ${sec.color}20, ${sec.color}08)`,
                            } : {}}
                          >
                            {/* Active left bar */}
                            {isActive && (
                              <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ backgroundColor: sec.color, boxShadow: `0 0 8px ${sec.color}` }} />
                            )}
                            
                            {/* Section icon */}
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{
                              background: isActive ? `${sec.color}25` : 'rgba(255,255,255,0.06)',
                              color: isActive ? sec.color : 'rgba(255,255,255,0.5)'
                            }}>
                              <Icon name={secId === 'operations' ? 'Settings' : secId === 'finance' ? 'Coins' : 'GraduationCap'} size={18} />
                            </div>

                            <div className="ml-3.5 flex-grow min-w-0">
                              <p className="text-sm font-bold truncate leading-snug">{sec.title}</p>
                              <p className="text-[10px] text-white/40 font-mono mt-0.5">{sec.items.length} items</p>
                            </div>

                          {isEditMode && isSuperAdmin ? (
                            <div className="flex items-center gap-0.5 bg-slate-950/80 rounded-full border border-slate-800/60 p-0.5" onClick={e => e.stopPropagation()}>
                              <button onClick={() => handleSectionOrderSwap(i, 'up')} disabled={i === 0} className="h-6 w-6 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 disabled:opacity-30"><ChevronUp size={11} /></button>
                              <button onClick={() => handleSectionOrderSwap(i, 'down')} disabled={i === sectionOrder.length - 1} className="h-6 w-6 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 disabled:opacity-30"><ChevronDown size={11} /></button>
                            </div>
                          ) : (
                            <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors group-hover:translate-x-0.5 transition-transform" />
                          )}
                        </div>
                      );
                    })}
                  </nav>

                  {/* Status footer */}
                  <div className="relative z-10 mt-auto px-5 py-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] text-white/50 font-mono">Live</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                      <Cloud size={10} />
                      <span>{new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-grow min-w-0 flex flex-col">
          
          {/* Active section header with local and dynamic filtering */}
          <div className="flex flex-row items-center justify-between gap-2 mb-2 shrink-0">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"
              style={{ color: isDayMode ? '#0f172a' : '#f1f5f9' }}>
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: activeSection.color, boxShadow: `0 0 8px ${activeSection.color}` }} />
              {isEditMode ? (
                <input
                  type="text"
                  className="bg-transparent border-b border-dashed border-cyan-500 outline-none focus:border-solid"
                  style={{ color: isDayMode ? '#0f172a' : '#f1f5f9' }}
                  value={activeSection.title}
                  onChange={(e) => handleSectionTitleBlur(activeSection.id, e.target.value)}
                  placeholder="Rename category..."
                  title="Click to rename"
                />
              ) : (
                <span>{activeSection.title}</span>
              )}
            </h1>

            {/* Active section Search filtering bar */}
            <div className="flex items-center gap-1.5">
              <div
                className="flex items-center rounded-full py-1 px-3 focus-within:border-cyan-500 transition border"
                style={{
                  backgroundColor: isDayMode ? '#f1f5f9' : 'rgba(15,23,42,0.6)',
                  borderColor: isDayMode ? '#e2e8f0' : 'rgba(51,65,85,0.8)',
                }}
              >
                <Search size={12} className="text-slate-400 mr-1.5 shrink-0" />
                <input
                  type="text"
                  className="bg-transparent border-none outline-none text-xs w-28"
                  style={{ color: isDayMode ? '#0f172a' : '#f1f5f9' }}
                  placeholder="Filter"
                  value={localSearch[activeSection.id] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalSearch(prev => ({ ...prev, [activeSection.id]: val }));
                  }}
                />
                {localSearch[activeSection.id] && (
                  <X size={11} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer ml-1 transition" onClick={() => setLocalSearch(prev => ({ ...prev, [activeSection.id]: '' }))} />
                )}
              </div>

              {isSuperAdmin && isEditMode && (
                <button
                  type="button"
                  onClick={() => triggerAddItemModal(activeSection.id)}
                  className="shrink-0 h-7 px-3 rounded-full flex items-center gap-1 text-xs font-semibold border transition cursor-pointer"
                  style={{
                    backgroundColor: isDayMode ? '#ecfeff' : 'rgba(6,182,212,0.15)',
                    borderColor: isDayMode ? '#a5f3fc' : 'rgba(6,182,212,0.3)',
                    color: isDayMode ? '#0891b2' : '#22d3ee',
                  }}
                >
                  <Plus size={11} />
                  <span>Add</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid layout of dynamic items - fills remaining screen */}
          <div className="relative flex-1 min-h-0 overflow-y-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/60 bg-white/90 dark:bg-slate-950/40 backdrop-blur-xl shadow-sm p-5 transition-colors duration-300">
            {/* Subtle inner glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-[0.03] blur-3xl pointer-events-none" style={{ backgroundColor: activeSection.color }} />
            
            {isEditMode && (
              <div className="mb-3 bg-amber-50 dark:bg-yellow-950/40 border border-amber-200 dark:border-yellow-700/60 rounded-xl p-2.5 text-[11px] text-amber-700 dark:text-yellow-300 flex items-center gap-2">
                <Info size={12} className="text-amber-500 dark:text-yellow-400 shrink-0" />
                <span>Edit mode — drag, recolor, relink. Push when done.</span>
              </div>
            )}

            {/* Filter implementation logic */}
            {(() => {
              const activeFilter = (localSearch[activeSection.id] || '').toLowerCase().trim();
              const parsedGlobal = globalSearch.toLowerCase().trim();

              const filteredItems = activeSection.items.filter(item => {
                const labelMatch = item.name.toLowerCase().includes(activeFilter) || item.url.toLowerCase().includes(activeFilter);
                if (parsedGlobal) {
                  return labelMatch && (item.name.toLowerCase().includes(parsedGlobal) || item.url.toLowerCase().includes(parsedGlobal));
                }
                return labelMatch;
              });

              if (filteredItems.length === 0) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-100 dark:bg-slate-900/35 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                    <Search size={28} className="text-slate-400 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No matching links</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Try resetting filters or check another section.</p>
                  </div>
                );
              }

              const grid = (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={filteredItems.map(i => i.id)} strategy={rectSortingStrategy}>
                    <div className="grid gap-3 pr-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))' }}>
                      {filteredItems.map((item, itemIdx) => {
                        const accentColor = item.color || activeSection.color;
                        const cardBody = (
                          <div
                            className="relative group flex items-center gap-3.5 px-5 py-3.5 rounded-2xl transition-all duration-300 will-change-transform cursor-pointer"
                            style={{
                              background: isDayMode ? '#ffffff' : '#ffffff0a',
                              border: `1.5px solid ${isDayMode ? '#1e3a8a' : '#1e3a8a'}`, // dark blue border
                              boxShadow: isDayMode
                                ? '0 1px 3px rgba(30, 58, 138, 0.06), 0 0 0 1px rgba(30, 58, 138, 0.03) inset'
                                : '0 1px 3px rgba(0,0,0,0.15), 0 0 0 1px rgba(30, 58, 138, 0.15) inset',
                              backdropFilter: 'blur(4px)',
                            }}
                            onMouseEnter={(e) => {
                              if (isEditMode) return;
                              e.currentTarget.style.borderColor = '#1e40af';
                              e.currentTarget.style.boxShadow = isDayMode
                                ? '0 8px 30px rgba(30, 58, 138, 0.12), 0 0 0 1px rgba(30, 58, 138, 0.06) inset'
                                : '0 8px 30px rgba(30, 58, 138, 0.2), 0 0 0 1px rgba(30, 58, 138, 0.2) inset';
                              e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                            }}
                            onMouseLeave={(e) => {
                              if (isEditMode) return;
                              e.currentTarget.style.borderColor = '#1e3a8a';
                              e.currentTarget.style.boxShadow = isDayMode
                                ? '0 1px 3px rgba(30, 58, 138, 0.06), 0 0 0 1px rgba(30, 58, 138, 0.03) inset'
                                : '0 1px 3px rgba(0,0,0,0.15), 0 0 0 1px rgba(30, 58, 138, 0.15) inset';
                              e.currentTarget.style.transform = '';
                            }}
                          >
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3.5 flex-grow min-w-0 cursor-pointer"
                              onClick={(e) => {
                                if (isEditMode) e.preventDefault();
                              }}
                            >
                              <div
                                className="relative flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
                                style={{
                                  background: isDayMode ? '#ffffff' : '#ffffff12',
                                  border: `1.5px solid ${isDayMode ? '#1e3a8a' : '#1e3a8a'}`,
                                  boxShadow: isDayMode
                                    ? '0 2px 6px rgba(30, 58, 138, 0.08)'
                                    : '0 2px 6px rgba(0,0,0,0.15)',
                                }}
                              >
                                {item.svgContent ? (
                                  <span className="w-[18px] h-[18px] flex items-center justify-center" style={{ color: accentColor }} dangerouslySetInnerHTML={{ __html: item.svgContent }} />
                                ) : (
                                  <Icon name={item.icon || 'FileText'} size={18} style={{ color: accentColor }} />
                                )}
                              </div>

                              <span
                                className="text-sm font-semibold whitespace-nowrap leading-tight tracking-tight transition-colors duration-300"
                                style={{
                                  color: isDayMode ? '#1e293b' : '#e2e8f0',
                                }}
                              >
                                {item.name}
                              </span>
                            </a>

                            {!isEditMode ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate max-w-[200px] hidden md:block"
                                  style={{ color: isDayMode ? '#94a3b8' : '#475569' }}>
                                  {item.hideUrl ? '' : item.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                </span>
                                <ExternalLink size={13}
                                  className="transition-all shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5"
                                  style={{ color: isDayMode ? '#64748b' : '#64748b' }} />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => handleItemSortOrder(activeSection.id, itemIdx, 'up')} disabled={itemIdx === 0}
                                  className="h-7 w-7 rounded-xl flex items-center justify-center disabled:opacity-25 transition"
                                  style={{ color: isDayMode ? '#64748b' : '#64748b', backgroundColor: isDayMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}
                                  title="Up"><ChevronUp size={11} /></button>
                                <button onClick={() => handleItemSortOrder(activeSection.id, itemIdx, 'down')} disabled={itemIdx === activeSection.items.length - 1}
                                  className="h-7 w-7 rounded-xl flex items-center justify-center disabled:opacity-25 transition"
                                  style={{ color: isDayMode ? '#64748b' : '#64748b', backgroundColor: isDayMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}
                                  title="Down"><ChevronDown size={11} /></button>
                                <select className="py-1 px-2 rounded-xl outline-none max-w-[65px] cursor-pointer text-[10px] transition"
                                  style={{
                                    backgroundColor: isDayMode ? '#f1f5f9' : 'rgba(255,255,255,0.08)',
                                    border: `1px solid ${isDayMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                                    color: isDayMode ? '#334155' : '#e2e8f0',
                                  }}
                                  value={activeSection.id} onChange={(e) => handleMoveToSection(activeSection.id, item.id, e.target.value)} title="Move">
                                  <option value="">Move</option>{sections.map(s => (<option key={s.id} value={s.id}>{s.title}</option>))}</select>
                                <button onClick={() => { setSvgPickerSectionId(activeSection.id); setSvgPickerItemId(item.id); setSvgPickerOpen(true); }}
                                  className="h-7 w-7 rounded-xl flex items-center justify-center transition"
                                  style={{ color: isDayMode ? '#64748b' : '#64748b', backgroundColor: isDayMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}
                                  title="Icon"><Palette size={11} /></button>
                                <div className="relative h-5 w-5 rounded-lg overflow-hidden flex items-center justify-center"
                                  style={{ border: `1px solid ${isDayMode ? '#cbd5e1' : 'rgba(255,255,255,0.15)'}` }}>
                                  <input type="color" className="absolute inset-0 cursor-pointer h-8 w-8 border-none p-0 bg-transparent -translate-x-1 -translate-y-1" value={accentColor} onChange={(e) => handleItemColorChange(activeSection.id, item.id, e.target.value)} title="Color" />
                                </div>
                                <button onClick={() => handleEditLinkRequest(activeSection.id, item)}
                                  className="h-7 w-7 rounded-xl flex items-center justify-center transition"
                                  style={{ color: isDayMode ? '#0891b2' : '#22d3ee', backgroundColor: isDayMode ? '#ecfeff' : 'rgba(6,182,212,0.08)' }}
                                  title="Edit"><Pencil size={11} /></button>
                                <button onClick={() => handleDeleteItem(activeSection.id, item.id, item.name)}
                                  className="h-7 w-7 rounded-xl flex items-center justify-center transition"
                                  style={{ color: '#ef4444', backgroundColor: isDayMode ? '#fef2f2' : 'rgba(239,68,68,0.08)' }}
                                  title="Delete"><Trash size={11} /></button>
                              </div>
                            )}
                          </div>
                        );

                        if (isEditMode) {
                          return (
                            <div key={item.id} className="min-w-0">
                              <SortableItem id={item.id}>
                                {cardBody}
                              </SortableItem>
                            </div>
                          );
                        }
                        return <div key={item.id} className="min-w-0">{cardBody}</div>;
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              );
              return grid;
            })()}
          </div>
        </main>
      </div>

      {/* SYSTEM BOTTOM BAR */}
      <footer className="shrink-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/60 px-6 py-2.5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-cyan-900/30">
              <Activity size={12} className="text-white" />
            </div>
            <span className="text-xs font-bold text-white tracking-tight">PAR</span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono">&copy; 2026 PAR System</span>
          <span className="h-3 w-px bg-slate-700/60" />
          <span className="text-[10px] text-slate-500 font-mono">រក្សាសិទ្ធិគ្រប់យ៉ាង</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono font-medium">Connected</span>
          </div>
          <span className="h-3 w-px bg-slate-700/60" />
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <Cloud size={10} className="text-slate-600" />
            <span>Cloud Sync v3.0</span>
          </div>
        </div>
      </footer>

      {/* ACTIVE CONNECTIONS & DEVICES DRAWER MODAL BLOCK */}
      <AnimatePresence>
        {settingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurry Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setSettingsModalOpen(false)}
            />

            {/* Main Modal body */}
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 15 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 p-6 rounded-3xl text-sm text-slate-200 shadow-2xl"
              style={{ zIndex: 100 }}
            >
              {/* Close Button element */}
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2.5 mb-6 border-b border-slate-800 pb-3">
                <Settings size={20} className="text-cyan-400" />
                <h2 className="text-lg font-black text-white tracking-tight">System Settings & Sync Config</h2>
              </div>

              {/* SECTION 1: PROFILE MANAGEMENT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Display User Profile Name</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 outline-none focus:border-cyan-500 text-slate-100"
                    value={profile.name}
                    onChange={(e) => {
                      const nextName = e.target.value;
                      const initials = nextName.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'JD';
                      const updated = { ...profile, name: nextName, avatarInitials: initials };
                      setProfile(updated);
                      pushStateUpdate(sections, sectionOrder, updated);
                    }}
                    placeholder="Enter Profile Name..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Display Role / Designation</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 outline-none focus:border-cyan-500 text-slate-100"
                    value={profile.role}
                    onChange={(e) => {
                      const updated = { ...profile, role: e.target.value };
                      setProfile(updated);
                      pushStateUpdate(sections, sectionOrder, updated);
                    }}
                    placeholder="Enter administrative role title..."
                  />
                </div>
              </div>

              {/* SYNC STATUS */}
              <div className="mb-6 bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <CloudLightning size={14} className="text-cyan-400 shrink-0" />
                  <p className="text-xs text-white font-extrabold tracking-wider uppercase">Sync Status</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-850/80 text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${wsStatus === 'connected' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        <CloudLightning size={16} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-200">
                          {wsStatus === 'connected' ? 'Cloud Live Sync' : wsStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                        </p>
                        <p className="text-[9px] text-slate-500">
                          {wsStatus === 'connected' ? 'Changes sync across all devices in real-time' : 'Data saved locally, will sync when connected'}
                        </p>
                      </div>
                    </div>
                    <span className={`h-1.5 w-1.5 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
                  </div>
                </div>
              </div>

              {/* THEME MULTIPLIERS & VALUE COLOR PICKERS */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Palette size={14} className="text-cyan-400" />
                    <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">Visual Density Scale & Styling Accents</p>
                  </div>
                  <button onClick={handleResetColors} className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer">
                    <RotateCcw size={10} />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Zoom slider */}
                  <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl shadow-inner">
                    <div className="flex items-center justify-between mb-1.5 text-xs text-slate-300 font-bold">
                      <span>Overall Workspace Scale</span>
                      <span className="font-mono text-cyan-400 font-extrabold">{theme.itemScale}%</span>
                    </div>
                    <input
                      type="range"
                      min={70}
                      max={150}
                      step={5}
                      className="w-full accent-cyan-500 cursor-ew-resize h-1 bg-slate-800 rounded-lg outline-none"
                      value={theme.itemScale}
                      onChange={(e) => {
                        const nextScale = parseInt(e.target.value);
                        const nextTheme = { ...theme, itemScale: nextScale };
                        setTheme(nextTheme);
                        pushStateUpdate(sections, sectionOrder, profile, nextTheme);
                      }}
                    />
                    <p className="text-[10px] text-slate-500 font-mono mt-1 w-full leading-relaxed">Adjust layout scale dynamically across all browsers.</p>
                  </div>

                  {/* CUSTOM CHOOSE BACKGROUND */}
                  <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl shadow-inner flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-300 font-bold mb-1">Workspace Background Wallpaper</p>
                      <p className="text-[10px] text-slate-500 leading-snug font-mono">Upload an eye-safe JPEG/PNG or fallback to default canvas.</p>
                    </div>
                    <div className="flex gap-2.5 mt-3">
                      <label className="flex-1 py-1.5 px-3 border border-slate-800 rounded-full hover:bg-slate-900 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300">
                        <Upload size={12} className="text-slate-400" />
                        <span>Choose Image</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={handleBgImgFileChange}
                        />
                      </label>
                      {theme.backgroundImage && (
                        <button
                          onClick={removeBgImage}
                          className="px-3 border border-red-950 rounded-full bg-red-950/20 hover:bg-red-900/30 text-xs font-semibold text-red-400 transition"
                          title="Remove custom backdrop image"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customizable swatches grid */}
                <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl shadow-inner text-xs">
                  <span className="block text-xs font-bold text-slate-300 mb-2">CSS Layout Palettes Swatches</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Object.keys(theme.colors).map((colorVar) => {
                      const value = (theme.colors as any)[colorVar];
                      return (
                        <div key={colorVar} className="flex items-center gap-2 bg-slate-900 border border-slate-850 p-1.5 rounded-lg select-all shadow">
                          <input
                            type="color"
                            value={value.startsWith('rgba') ? '#0f172a' : value}
                            onChange={(e) => handleThemeColorSetting(colorVar as keyof ThemeColors, e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer border-none p-0 shrink-0"
                          />
                          <div className="min-w-0 flex-grow font-mono leading-none">
                            <p className="text-[9px] text-slate-500 truncate">{colorVar.replace('--', '')}</p>
                            <p className="text-[10px] text-slate-200 mt-0.5 uppercase truncate">{value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* INTEGRATIVE SHEET SYNCHRONIZATION FLOW */}
              <div className="mb-6 bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl shadow-inner">
                <div className="flex items-center gap-2 mb-2 border-b border-slate-850 pb-2">
                  <Cloud size={14} className="text-cyan-400" />
                  <span className="text-xs font-extrabold text-slate-300 uppercase">Google Sheet API Integrations</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">REAL ID SPREADSHEET</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 outline-none focus:border-cyan-500 font-mono"
                      value={syncDoc.sheetId}
                      onChange={(e) => {
                        const updated = { ...syncDoc, sheetId: e.target.value };
                        setSyncDoc(updated);
                        pushStateUpdate(sections, sectionOrder, profile, theme, updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">PUBLISHED SHEET CSV ENDPOINT</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 outline-none focus:border-cyan-500 font-mono"
                      value={syncDoc.csvUrl}
                      onChange={(e) => {
                        const updated = { ...syncDoc, csvUrl: e.target.value };
                        setSyncDoc(updated);
                        pushStateUpdate(sections, sectionOrder, profile, theme, updated);
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 font-mono mb-1">GOOGLE APPS SCRIPTS MACROS URL (POST TARGET)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 outline-none focus:border-cyan-500 font-mono text-cyan-300"
                      value={syncDoc.scriptUrl}
                      onChange={(e) => {
                        const updated = { ...syncDoc, scriptUrl: e.target.value };
                        setSyncDoc(updated);
                        pushStateUpdate(sections, sectionOrder, profile, theme, updated);
                      }}
                    />
                  </div>
                </div>

                {/* Simulated database action logs buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <button
                    onClick={triggerOnlinePull}
                    className="py-1.5 px-4 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-850 text-slate-300 font-semibold cursor-pointer text-xs flex items-center gap-1.5 transition"
                  >
                    <Download size={12} className="text-cyan-400" />
                    <span>Pull State</span>
                  </button>
                  <button
                    onClick={triggerOnlinePush}
                    className="py-1.5 px-4 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-full hover:bg-cyan-900/50 font-semibold cursor-pointer text-xs flex items-center gap-1.5 transition"
                  >
                    <Upload size={12} />
                    <span>Push State</span>
                  </button>
                  <button
                    onClick={handleExportFullState}
                    className="md:ml-auto py-1.5 px-4 bg-indigo-950/20 border border-indigo-900 hover:bg-indigo-900/30 text-indigo-400 rounded-full font-semibold cursor-pointer text-xs flex items-center gap-1.5 transition"
                  >
                    <RotateCcw size={12} />
                    <span>Download JSON Backup</span>
                  </button>
                </div>
              </div>

              {/* JSON FILE IMPORT CONTAINER */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl shadow-inner text-xs">
                <span className="block text-xs font-bold text-slate-300 mb-1">Restore State from JSON file Backup</span>
                <p className="text-[10px] text-slate-500 font-mono mb-2">Restores previously downloaded backup, applying layout structures dynamically to all other clients.</p>
                <input
                  type="file"
                  accept="application/json"
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] w-full"
                  onChange={handleImportJsonBackup}
                />
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* URL EDIT MODAL DIALOG DISPLAY */}
      <AnimatePresence>
        {urlEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => {
                setUrlEditorOpen(false);
                setEditingItemId(null);
                setEditingItemSection(null);
              }}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-850 p-6 rounded-2xl text-sm"
              style={{ zIndex: 100 }}
            >
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2.5">
                <Pencil size={18} className="text-cyan-400" />
                <h3 className="font-extrabold text-white text-base">Edit item options</h3>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1">Item Title Link Name</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-cyan-500 font-semibold"
                    value={editingItemName}
                    onChange={(e) => setEditingItemName(e.target.value)}
                    placeholder="E.g., Monthly Activity Report"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1">Google Sheet / Destination URL</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-cyan-500 font-mono text-xs"
                    value={editingItemUrl}
                    onChange={(e) => setEditingItemUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItemHideUrl(!editingItemHideUrl)}
                    className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                      editingItemHideUrl
                        ? 'bg-rose-950/30 border-rose-800/50 text-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {editingItemHideUrl ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{editingItemHideUrl ? 'URL Hidden' : 'Hide URL'}</span>
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {editingItemHideUrl ? 'Link URL will not be displayed' : 'URL is visible on card'}
                  </span>
                </div>

                <div className="flex gap-2.5 justify-end mt-4">
                  <button
                    onClick={() => {
                      setUrlEditorOpen(false);
                      setEditingItemId(null);
                      setEditingItemSection(null);
                    }}
                    className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-full text-xs font-semibold text-slate-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveItemDetailEdit}
                    className="px-5 py-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:opacity-90 rounded-full text-xs font-extrabold text-white transition shadow-lg shadow-cyan-900/20"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD ITEM SYSTEM DIALOG MODAL */}
      <AnimatePresence>
        {addItemOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => {
                setAddItemOpen(false);
                setAddItemSectionId(null);
              }}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-850 p-6 rounded-2xl text-sm"
              style={{ zIndex: 100 }}
            >
              <div className="flex items-center gap-2 mb-4 border-b border-slate-850 pb-2.5">
                <Plus size={18} className="text-cyan-400" />
                <h3 className="font-extrabold text-white text-base">Create new document element</h3>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1">Item Display Label</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-cyan-500 font-semibold"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="E.g., Monthly Activity Spreadsheet"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1">Link URL (optional)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-cyan-500 font-mono text-xs"
                    value={newItemUrl}
                    onChange={(e) => setNewItemUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/example"
                  />
                </div>

                <div className="flex gap-2.5 justify-end mt-4">
                  <button
                    onClick={() => {
                      setAddItemOpen(false);
                      setAddItemSectionId(null);
                    }}
                    className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-full text-xs font-semibold text-slate-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="px-5 py-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:opacity-90 rounded-full text-xs font-extrabold text-white transition shadow-lg shadow-cyan-900/20"
                  >
                    Add Document
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {svgPickerOpen && svgPickerSectionId && svgPickerItemId && (
          <SvgPicker
            currentIcon={sections.find(s => s.id === svgPickerSectionId)?.items.find(i => i.id === svgPickerItemId)?.icon || 'FileText'}
            currentSvgContent={sections.find(s => s.id === svgPickerSectionId)?.items.find(i => i.id === svgPickerItemId)?.svgContent}
            accentColor={sections.find(s => s.id === svgPickerSectionId)?.color || '#06b6d4'}
            onSelect={handleSvgSelect}
            onClose={() => { setSvgPickerOpen(false); setSvgPickerSectionId(null); setSvgPickerItemId(null); }}
          />
        )}
      </AnimatePresence>


    </div>
  );
}
