import React from 'react'

export interface IconProps {
  name: string
  size?: number
  className?: string
}

export function Icon({ name, size = 18, className = '' }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  }

  switch (name) {
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
    case 'calendar':
      return <svg {...common}><rect x="3.5" y="4.5" width="17" height="16" rx="2.5" /><path d="M7.5 2.8v3.4M16.5 2.8v3.4M3.5 9h17" /></svg>
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.2 2" /></svg>
    case 'briefcase':
      return <svg {...common}><rect x="3.5" y="6.5" width="17" height="13" rx="2.5" /><path d="M8.5 6.5V5.2A1.7 1.7 0 0 1 10.2 3.5h3.6a1.7 1.7 0 0 1 1.7 1.7v1.3M3.5 11.5h17M10 14h4" /></svg>
    case 'edit':
      return <svg {...common}><path d="M4.5 19.5h4l10-10a2.1 2.1 0 0 0-3-3l-10 10v3Z" /><path d="m13.8 7.2 3 3" /></svg>
    case 'trash':
      return <svg {...common}><path d="M4.5 7h15M9 7V4.5h6V7M7 7l.7 12.2h8.6L17 7M10 10.5v5.5M14 10.5v5.5" /></svg>
    case 'chevron':
      return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>
    case 'chevron-down':
      return <svg {...common}><path d="m6 9 6 6 6-6" /></svg>
    case 'arrow':
      return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" /></svg>
    case 'arrow-left':
      return <svg {...common}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
    case 'logout':
      return <svg {...common}><path d="M14 8V5.5A1.5 1.5 0 0 0 12.5 4h-6A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20h6a1.5 1.5 0 0 0 1.5-1.5V16M10 12h9M16 8l4 4-4 4" /></svg>
    case 'close':
      return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>
    case 'check':
      return <svg {...common}><path d="m5 12 4.5 4.5L19 7" /></svg>
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7.5" /><path d="m20 20-3.5-3.5" /></svg>
    case 'filter':
      return <svg {...common}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
    case 'timeline':
      return <svg {...common}><path d="M12 3v18M5 8h14M8 16h11" /></svg>
    case 'kanban':
      return <svg {...common}><rect x="4" y="4" width="4.5" height="16" rx="1.5" /><rect x="11" y="4" width="4.5" height="11" rx="1.5" /><rect x="18" y="4" width="4.5" height="14" rx="1.5" /></svg>
    case 'table':
      return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M3 15h18M9 10v10" /></svg>
    case 'chart':
      return <svg {...common}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    case 'user':
      return <svg {...common}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    case 'download':
      return <svg {...common}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
    case 'upload':
      return <svg {...common}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
    case 'external-link':
      return <svg {...common}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" /></svg>
    case 'alert-circle':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    case 'copy':
      return <svg {...common}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
    case 'keyboard':
      return <svg {...common}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M6 12h.001M10 12h.001M14 12h.001M18 12h.001M7 16h10" /></svg>
    case 'refresh':
      return <svg {...common}><path d="M21.5 2v6h-6M2.5 22v-6h6M2 12a10 10 0 0 1 18-5.3L21.5 8M22 12a10 10 0 0 1-18 5.3L2.5 16" /></svg>
    default:
      return <svg {...common}><circle cx="12" cy="12" r="8" /></svg>
  }
}
