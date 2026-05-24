import React from 'react';
import { Shield, Bell, FileCheck, LayoutDashboard } from 'lucide-react';

export default function UProctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 w-full overflow-hidden">
      {/* Structural Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-6 w-6 text-emerald-400" />
            <span className="font-bold text-lg tracking-wider">UProctor</span>
          </div>
          <nav className="space-y-1">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-slate-800 text-emerald-400">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard Hub
            </a>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-400">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </div>
              </div>
              <div className="pl-9">
                <a href="/notifications/orum" className="block px-4 py-2 text-xs text-slate-400 hover:text-slate-200">
                  Orum Compliance Mgr
                </a>
              </div>
            </div>
            <a href="/credentialing" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-200">
              <FileCheck className="h-4 w-4" />
              Credentialing Center
            </a>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          Live Workspace
        </div>
      </aside>

      {/* Main App Viewport */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-semibold text-slate-800">Compliance Operations</h1>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
