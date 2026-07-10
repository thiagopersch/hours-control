'use client';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useState } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-auto max-md:max-w-64 p-0"
        >
          <Sidebar variant="mobile" onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
