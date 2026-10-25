import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Dynamically require sync script logic
    const { runSync } = require('@/../scripts/sync-gamedistribution/index.js');
    const report = await runSync();
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('API sync error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to sync GameDistribution catalog' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(process.cwd(), 'GD_SYNC_REPORT.json');
    if (fs.existsSync(reportPath)) {
      const data = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      return NextResponse.json(data);
    }
    return NextResponse.json({ message: 'No sync report found yet' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
