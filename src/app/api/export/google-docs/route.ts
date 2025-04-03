import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, transcription, keyPoints } = await request.json();
    
    // Instead of using the Google API which requires credentials,
    // we'll create a mock implementation for demonstration
    
    // For demo purposes, we'll just return a success response
    // with a mock URL that would represent where the document would be
    
    // In a production environment, you would:
    // 1. Set up proper Google API credentials
    // 2. Use the google.docs API to create a real document
    
    // Simulate a processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({ 
      success: true, 
      message: "Document created successfully (demo mode)",
      url: "https://docs.google.com/document/d/demo-document-id/edit",
      demoMode: true
    });
  } catch (error) {
    console.error('Error in Google Docs export:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export to Google Docs', 
        message: error instanceof Error ? error.message : 'Unknown error',
        demoMode: true
      },
      { status: 500 }
    );
  }
}