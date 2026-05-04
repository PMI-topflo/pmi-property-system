// =====================================================================
// app/admin/applications/page.tsx
//
// Admin applications dashboard. Server Component for the data fetch,
// Client Component for the interactive table.
// =====================================================================

import { createClient } from '@supabase/supabase-js';
import { ApplicationsTable } from './ApplicationsTable';

export const dynamic = 'force-dynamic';

async function getData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: applications, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[applications/page] fetch error', error);
  }

  return { applications: applications ?? [] };
}

export default async function ApplicationsPage() {
  const { applications } = await getData();

  return (
    <main className="min-h-screen bg-white p-6">
      <header className="mb-6 border-l-4 border-[#f26a1b] pl-4">
        <h1 className="text-3xl font-bold text-[#0d0d0d]">Applications</h1>
        <p className="text-gray-600 mt-1">
          Tenant and buyer applications submitted through the portal
        </p>
      </header>

      <ApplicationsTable applications={applications} />
    </main>
  );
}
