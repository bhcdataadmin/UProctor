'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, FileUp, ShieldCheck } from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface ComplianceTask {
  id: string;
  upid: string;
  task_type: string;
  credential_type: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'SYNCED';
  due_date: string;
  admin_notes: string;
}

export default function ComplianceHub() {
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ASSIGNED' | 'SUBMITTED'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
    
    async function loadHubTasks() {
      try {
        const url = `${SUPABASE_URL}/rest/v1/credential_requests?select=*&order=due_date.asc`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Profile': 'uproctor' // Queries your secure schema directly
          }
        });
        if (!response.ok) throw new Error('Failed to load tasks from schema configuration');
        const data = await response.json();
        setTasks(data || []);
      } catch (err) {
        console.error('Error loading operational ledger tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHubTasks();
  }, []);

  const handleTaskSubmit = async (taskId: string, upid: string, credType: string) => {
    // Optimistic UI update to visually switch task state instantly
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'SUBMITTED' } : t));
    
    try {
      // 1. Send structural update straight to the individual ledger row
      await fetch(`${SUPABASE_URL}/rest/v1/credential_requests?id=eq.${taskId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Content-Profile': 'uproctor'
        },
        body: JSON.stringify({ status: 'SUBMITTED' })
      });

      // 2. Dispatch cross-app transaction payload into your public batch processor table
      await fetch(`${SUPABASE_URL}/rest/v1/batch_jobs`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          job_type: 'CREDENTIAL_SYNC',
          status: 'PENDING',
          payload: { 
            action: 'PROCESS_HUB_SUBMISSION', 
            task_id: taskId, 
            upid: upid, 
            credential_type: credType, 
            processed_at: new Date().toISOString() 
          }
        })
      });
      alert('Task submitted and queued in public.batch_jobs web matrix!');
    } catch (err) {
      console.error('Operational sync failed:', err);
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'ALL' ? true : t.status === filter);

  return (
    <div className="space-y-8 w-full">
      {/* Upper Metric Tracker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border p-5 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Clock className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{tasks.filter(t => t.status === 'ASSIGNED').length}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Assigned Directives</div>
          </div>
        </div>
        <div className="bg-white border p-5 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><FileUp className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{tasks.filter(t => t.status === 'SUBMITTED').length}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pending Sync</div>
          </div>
        </div>
        <div className="bg-white border p-5 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{tasks.filter(t => t.status === 'SYNCED').length}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Verified Compliant</div>
          </div>
        </div>
      </div>

      {/* Primary Workspace Ledger Card */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-500" /> Administrative Workspace Hub
          </h2>
          <div className="flex bg-slate-200/70 p-1 rounded-lg text-xs font-semibold">
            {(['ALL', 'ASSIGNED', 'SUBMITTED'] as const).map(type => (
              <button 
                key={type} 
                onClick={() => setFilter(type)} 
                className={`px-3 py-1.5 rounded-md transition-all ${filter === type ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading live database ledger records...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">No matching operational records found.</div>
        ) : (
          <div className="divide-y">
            {filteredTasks.map(task => (
              <div key={task.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 border rounded text-slate-700">{task.upid}</span>
                    <span className="text-sm font-bold text-slate-900">{task.credential_type}</span>
                  </div>
                  <p className="text-xs text-slate-600"><strong>Directive Notes:</strong> {task.admin_notes}</p>
                </div>
                <div>
                  {task.status === 'ASSIGNED' ? (
                    <button 
                      onClick={() => handleTaskSubmit(task.id, task.upid, task.credential_type)} 
                      className="px-3.5 py-2 bg-slate-950 text-white font-medium text-xs rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Complete Task
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 bg-slate-50 border px-3 py-2 rounded-lg font-medium">
                      Awaiting Batch Sync
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
