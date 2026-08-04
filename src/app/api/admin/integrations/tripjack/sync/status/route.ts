import { NextResponse } from 'next/server';
import { TripJackSyncManager } from '@/modules/integrations/tripjack/services/TripJackSyncManager';

const syncManager = new TripJackSyncManager();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await syncManager.getStatus();
    return NextResponse.json({ success: true, data: status });
  } catch (error: any) {
    console.error('[TripJack Admin API Status Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
