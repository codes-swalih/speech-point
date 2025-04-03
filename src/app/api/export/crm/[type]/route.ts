import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const { title, transcription, keyPoints } = await request.json();
    const crmType = params.type.toLowerCase();
    
    // Validate CRM type
    if (!['salesforce', 'hubspot', 'zoho'].includes(crmType)) {
      return NextResponse.json(
        { error: `Unsupported CRM type: ${crmType}` },
        { status: 400 }
      );
    }
    
    // Simulate a processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, return a mock success response
    return NextResponse.json({ 
      success: true, 
      message: `Successfully exported to ${crmType} (demo mode)`,
      url: `https://example.com/${crmType}/record/demo-id`,
      demoMode: true
    });
  } catch (error) {
    console.error(`Error in CRM export:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to export to CRM', 
        message: error instanceof Error ? error.message : 'Unknown error',
        demoMode: true
      },
      { status: 500 }
    );
  }
}