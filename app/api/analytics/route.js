
// src/app/api/analytics/route.js - Analytics API endpoint
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { event, data } = await request.json();
    
    // Log analytics data (in production, send to your analytics service)
    console.log('Analytics Event:', { event, data, timestamp: new Date().toISOString() });
    
    // You could store this in a database or send to external analytics service
    // await storeAnalyticsEvent(event, data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}