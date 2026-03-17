/**
 * Icon Atom Component
 *
 * A wrapper component for Lucide icons with consistent sizing and styling.
 * Uses theme-aware CSS variables for stroke width and color.
 *
 * Supports two APIs:
 * - `icon` prop: Pass a LucideIcon component directly
 * - `name` prop: Pass a string icon name (resolved from iconMap)
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../lib/cn';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconAnimation = 'spin' | 'pulse' | 'none';

/**
 * Map of icon names to Lucide icon components.
 * Supports common icons used in patterns.
 */
const iconMap: Record<string, LucideIcon> = {
  // Navigation & Actions
  'chevron-right': LucideIcons.ChevronRight,
  'chevron-left': LucideIcons.ChevronLeft,
  'chevron-down': LucideIcons.ChevronDown,
  'chevron-up': LucideIcons.ChevronUp,
  'arrow-right': LucideIcons.ArrowRight,
  'arrow-left': LucideIcons.ArrowLeft,
  'arrow-up': LucideIcons.ArrowUp,
  'arrow-down': LucideIcons.ArrowDown,
  'x': LucideIcons.X,
  'close': LucideIcons.X,
  'menu': LucideIcons.Menu,
  'more-vertical': LucideIcons.MoreVertical,
  'more-horizontal': LucideIcons.MoreHorizontal,

  // Status & Feedback
  'check': LucideIcons.Check,
  'check-circle': LucideIcons.CheckCircle,
  'alert-circle': LucideIcons.AlertCircle,
  'alert-triangle': LucideIcons.AlertTriangle,
  'info': LucideIcons.Info,
  'help-circle': LucideIcons.HelpCircle,
  'loader': LucideIcons.Loader2,

  // CRUD Operations
  'plus': LucideIcons.Plus,
  'minus': LucideIcons.Minus,
  'edit': LucideIcons.Edit,
  'pencil': LucideIcons.Pencil,
  'trash': LucideIcons.Trash2,
  'trash-2': LucideIcons.Trash2,
  'save': LucideIcons.Save,
  'copy': LucideIcons.Copy,
  'clipboard': LucideIcons.Clipboard,

  // Files & Documents
  'file': LucideIcons.File,
  'file-text': LucideIcons.FileText,
  'folder': LucideIcons.Folder,
  'folder-open': LucideIcons.FolderOpen,
  'download': LucideIcons.Download,
  'upload': LucideIcons.Upload,
  'image': LucideIcons.Image,

  // Communication
  'mail': LucideIcons.Mail,
  'message-circle': LucideIcons.MessageCircle,
  'send': LucideIcons.Send,
  'phone': LucideIcons.Phone,

  // User & Profile
  'user': LucideIcons.User,
  'users': LucideIcons.Users,
  'user-plus': LucideIcons.UserPlus,
  'settings': LucideIcons.Settings,
  'log-out': LucideIcons.LogOut,
  'log-in': LucideIcons.LogIn,

  // Search & Filter
  'search': LucideIcons.Search,
  'filter': LucideIcons.Filter,
  'sort-asc': LucideIcons.ArrowUpNarrowWide,
  'sort-desc': LucideIcons.ArrowDownNarrowWide,

  // Layout & View
  'grid': LucideIcons.Grid,
  'list': LucideIcons.List,
  'layout': LucideIcons.Layout,
  'maximize': LucideIcons.Maximize,
  'minimize': LucideIcons.Minimize,
  'eye': LucideIcons.Eye,
  'eye-off': LucideIcons.EyeOff,

  // Media & Playback
  'play': LucideIcons.Play,
  'pause': LucideIcons.Pause,
  'stop': LucideIcons.Square,
  'volume': LucideIcons.Volume2,
  'volume-off': LucideIcons.VolumeX,

  // Time & Calendar
  'calendar': LucideIcons.Calendar,
  'clock': LucideIcons.Clock,

  // Misc
  'star': LucideIcons.Star,
  'heart': LucideIcons.Heart,
  'home': LucideIcons.Home,
  'link': LucideIcons.Link,
  'external-link': LucideIcons.ExternalLink,
  'refresh': LucideIcons.RefreshCw,
  'refresh-cw': LucideIcons.RefreshCw,
  'zap': LucideIcons.Zap,
  'bell': LucideIcons.Bell,
  'bookmark': LucideIcons.Bookmark,
  'share': LucideIcons.Share2,
  'lock': LucideIcons.Lock,
  'unlock': LucideIcons.Unlock,
  'globe': LucideIcons.Globe,
  'database': LucideIcons.Database,
  'code': LucideIcons.Code,
  'terminal': LucideIcons.Terminal,
};

/**
 * Resolve an icon name to a Lucide icon component.
 * Falls back to HelpCircle if not found.
 */
export function resolveIcon(name: string): LucideIcon {
  // Try exact match first
  if (iconMap[name]) {
    return iconMap[name];
  }

  // Try lowercase
  const lowerName = name.toLowerCase();
  if (iconMap[lowerName]) {
    return iconMap[lowerName];
  }

  // Try converting camelCase to kebab-case
  const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  if (iconMap[kebabName]) {
    return iconMap[kebabName];
  }

  // Fallback
  return LucideIcons.HelpCircle;
}

export interface IconProps {
  /** Lucide icon component (preferred for type-safe usage) */
  icon?: LucideIcon;
  /** Icon name as string (resolved from iconMap) */
  name?: string;
  /** Size of the icon */
  size?: IconSize;
  /** Color class (Tailwind color class) or 'inherit' for theme default */
  color?: string;
  /** Animation type */
  animation?: IconAnimation;
  /** Additional CSS classes */
  className?: string;
  /** Icon stroke width - uses theme default if not specified */
  strokeWidth?: number;
  /** Inline style */
  style?: React.CSSProperties;
}

const sizeClasses: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const animationClasses: Record<IconAnimation, string> = {
  none: '',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
};

export const Icon: React.FC<IconProps> = ({
  icon,
  name,
  size = 'md',
  color,
  animation = 'none',
  className,
  strokeWidth,
  style,
}) => {
  // Resolve icon: use provided icon component, or resolve from name
  const IconComponent = icon ?? (name ? resolveIcon(name) : LucideIcons.HelpCircle);

  // Use theme's icon stroke width if not explicitly set
  const effectiveStrokeWidth = strokeWidth ?? undefined;

  return (
    <IconComponent
      className={cn(
        sizeClasses[size],
        animationClasses[animation],
        // Use theme's icon color or provided color
        color ? color : 'text-[var(--icon-color,currentColor)]',
        className
      )}
      strokeWidth={effectiveStrokeWidth}
      style={{
        ...(effectiveStrokeWidth === undefined
          ? { strokeWidth: 'var(--icon-stroke-width, 2)' }
          : {}),
        ...style,
      }}
    />
  );
};

Icon.displayName = 'Icon';
