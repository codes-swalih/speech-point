import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, transcription, keyPoints } = await request.json();
    
    // Instead of using the Notion API which requires credentials,
    // we'll create a mock implementation for demonstration
    
    // For demo purposes, we'll just return a success response
    // with a mock URL that would represent where the Notion page would be
    
    // In a production environment, you would:
    // 1. Set up proper Notion API credentials
    // 2. Use the Notion client to create a real page
    
    // Simulate a processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({ 
      success: true, 
      message: "Notion page created successfully (demo mode)",
      url: "https://notion.so/Demo-Page-123456789",
      demoMode: true
    });
  } catch (error) {
    console.error('Error in Notion export:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export to Notion', 
        message: error instanceof Error ? error.message : 'Unknown error',
        demoMode: true
      },
      { status: 500 }
    );
  }
}