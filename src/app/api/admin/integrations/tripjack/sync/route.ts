import { NextResponse } from 'next/server';
import { TripJackSyncManager } from '@/modules/integrations/tripjack/services/TripJackSyncManager';

const syncManager = new TripJackSyncManager();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'START':
        const id = await syncManager.startSync();
        return NextResponse.json({ success: true, executionId: id });
      
      case 'PAUSE':
        await syncManager.pauseSync();
        return NextResponse.json({ success: true, message: 'Sync paused' });
      
      case 'RESUME':
        if (!body.executionId) {
          return NextResponse.json({ success: false, error: 'executionId is required to resume' }, { status: 400 });
        }
        await syncManager.resumeSync(body.executionId);
        return NextResponse.json({ success: true, message: 'Sync resumed' });

      case 'STOP':
        await syncManager.stopSync();
        return NextResponse.json({ success: true, message: 'Sync stopped and failed' });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[TripJack Admin API Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
