import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// Force this route to be dynamic (not pre-rendered during build)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // During build time, skip database check
    if (process.env.NODE_ENV === 'production' && !process.env.DB_HOST) {
      return NextResponse.json({
        status: 'build-time',
        timestamp: new Date().toISOString(),
        database: 'not-available-during-build',
        version: process.env.npm_package_version || '1.0.0'
      });
    }

    // Check database connectivity
    const result = await query('SELECT 1 as health_check');
    
    if (result.rows.length > 0) {
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: process.env.npm_package_version || '1.0.0'
      });
    } else {
      throw new Error('Database query returned no results');
    }
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
} 