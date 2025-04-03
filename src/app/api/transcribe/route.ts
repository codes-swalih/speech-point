import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const language = formData.get("language") as string || "auto";
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    // Get the API key from environment variables
    const apiKey = process.env.ASSEMBLY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AssemblyAI API key not configured" },
        { status: 500 }
      );
    }
    
    const headers = {
      authorization: apiKey,
      "content-type": "application/json",
    };
    
    // Step 1: Upload the audio file
    console.log("Uploading audio file...");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const uploadResponse = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      buffer,
      { headers }
    );
    
    const uploadUrl = uploadResponse.data.upload_url;
    
    // Step 2: Submit for transcription
    console.log(`Submitting for transcription...`);
    
    // Configure the transcription request based on language setting
    const transcriptionData = language === "auto" 
      ? {
          audio_url: uploadUrl,
          language_detection: true,
        }
      : {
          audio_url: uploadUrl,
          language_code: language,
        };
    
    const transcriptResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      transcriptionData,
      { headers }
    );
    
    const transcriptId = transcriptResponse.data.id;
    
    // Step 3: Poll for transcription completion
    console.log("Polling for transcription completion...");
    let transcriptionResult;
    
    while (true) {
      const pollingResponse = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        { headers }
      );
      
      transcriptionResult = pollingResponse.data;
      
      if (transcriptionResult.status === "completed") {
        console.log("Transcription completed");
        break;
      } else if (transcriptionResult.status === "error") {
        throw new Error(`Transcription failed: ${transcriptionResult.error}`);
      } else {
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Return the transcription and detected language
    return NextResponse.json({
      transcription: transcriptionResult.text,
      language_code: transcriptionResult.language_code
    });
    
  } catch (error) {
    console.error("Error in transcription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}