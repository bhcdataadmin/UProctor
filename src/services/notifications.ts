const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export interface ComplianceNotification {
  id: string;
  upid: string;
  title: string;
  message: string;
  pdf_url: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

/**
 * Fetches notifications directly over the web via URL endpoints
 */
export async function fetchOrumNotifications(): Promise<ComplianceNotification[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Missing configuration.");
  
  const url = `${SUPABASE_URL}/rest/v1/notifications?select=*&order=created_at.desc`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Accept': 'application/json',
      'Content-Profile': 'uproctor' // Explicitly references your uproctor schema
    }
  });
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return response.json();
}

/**
 * Handles "Acknowledge" button event by sending an update to the web URL
 */
export async function acknowledgeNotification(notificationId: string): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Missing configuration.");
  
  const url = `${SUPABASE_URL}/rest/v1/notifications?id=eq.${notificationId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Content-Profile': 'uproctor'
    },
    body: JSON.stringify({ acknowledged_at: new Date().toISOString() })
  });
  if (!response.ok) throw new Error(`Patch failed: ${response.status}`);
}
