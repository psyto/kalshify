'use client';

import { usePathname } from 'next/navigation';
import { LiveTicker } from './live-ticker';

export function LayoutTicker() {
  const pathname = usePathname();

  // Don't show ticker on intel page (has its own header)
  if (pathname === '/intel') {
    return null;
  }

  return <LiveTicker />;
}
