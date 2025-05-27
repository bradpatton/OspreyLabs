import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { QueryResult } from 'pg';

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

    // Check if required environment variables are set
    const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'configuration-error',
        error: `Missing environment variables: ${missingVars.join(', ')}`,
        config: {
          DB_HOST: process.env.DB_HOST || 'not-set',
          DB_PORT: process.env.DB_PORT || 'not-set',
          DB_NAME: process.env.DB_NAME || 'not-set',
          DB_USER: process.env.DB_USER || 'not-set',
          DB_PASSWORD: process.env.DB_PASSWORD ? '***set***' : 'not-set'
        }
      }, { status: 503 });
    }

    // Check database connectivity with timeout
    const result = await Promise.race([
      query<{ health_check: number; current_time: Date }>('SELECT 1 as health_check, NOW() as current_time'),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 5000)
      )
    ]) as QueryResult<{ health_check: number; current_time: Date }>;
    
    if (result && result.rows && result.rows.length > 0) {
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: process.env.npm_package_version || '1.0.0',
        database_time: result.rows[0].current_time,
        config: {
          DB_HOST: process.env.DB_HOST,
          DB_PORT: process.env.DB_PORT,
          DB_NAME: process.env.DB_NAME,
          DB_USER: process.env.DB_USER
        }
      });
    } else {
      throw new Error('Database query returned no results');
    }
  } catch (error) {
    console.error('Health check failed:', error);
    
    // Provide detailed error information for debugging
    const errorInfo = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        DB_HOST: process.env.DB_HOST || 'not-set',
        DB_PORT: process.env.DB_PORT || 'not-set',
        DB_NAME: process.env.DB_NAME || 'not-set',
        DB_USER: process.env.DB_USER || 'not-set',
        DB_PASSWORD: process.env.DB_PASSWORD ? '***set***' : 'not-set'
      }
    };

    // Add specific error details for common issues
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        errorInfo.error = `Cannot resolve hostname '${process.env.DB_HOST}'. Check if PostgreSQL container is running and accessible.`;
      } else if (error.message.includes('ECONNREFUSED')) {
        errorInfo.error = `Connection refused to ${process.env.DB_HOST}:${process.env.DB_PORT}. Check if PostgreSQL is running on the correct port.`;
      } else if (error.message.includes('authentication failed')) {
        errorInfo.error = `Authentication failed. Check DB_USER and DB_PASSWORD.`;
      } else if (error.message.includes('timeout')) {
        errorInfo.error = `Database connection timeout. PostgreSQL may be starting up or overloaded.`;
      }
    }
    
    return NextResponse.json(errorInfo, { status: 503 });
  }
} 