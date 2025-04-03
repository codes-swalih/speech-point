"use client";

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { VoiceRecorder } from '@/components/audio-recorder';
import { FileUpload } from '@/components/file-upload';
import { TranscriptionView } from '@/components/transcription-view';
import { Progress } from '@/components/ui/progress';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { Mic, Upload, FileText, NotebookPen, FileSpreadsheet, Share2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useSession } from "next-auth/react";
import { saveTranscriptionHistory } from "@/lib/firebase";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [keyPoints, setKeyPoints] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState('auto');
  const { toast } = useToast();
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    processAudio(selectedFile);
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    const file = new File([blob], "recording.wav", { type: "audio/wav" });
    setFile(file);
    processAudio(file);
  };

  // Update the showToastNotification function to use the toast hook
  const showToastNotification = ({ title, description, variant }: { title: string, description: string, variant: 'default' | 'destructive' }) => {
    toast({
      title,
      description,
      variant
    });
  };

  // Function to save transcription to history
  const saveToHistory = async () => {
    // Make sure we're using the correct user ID property
    const userId = session?.user?.id;
    
    if (!userId) {
      console.log("No user ID available for saving history");
      return;
    }
    
    if (!transcription) {
      console.log("No transcription available for saving history");
      return;
    }
    
    if (!keyPoints) {
      console.log("No key points available for saving history");
      return;
    }
    
    try {
      console.log("Saving to history for user:", userId);
      console.log("Transcription length:", transcription.length);
      console.log("Key points available:", !!keyPoints);
      
      const historyId = await saveTranscriptionHistory({
        userId: userId,
        transcription: transcription,
        summary: keyPoints,
        language: detectedLanguage || "unknown",
        title: transcription.split(" ").slice(0, 7).join(" ") + "..."
      });
      
      console.log("Saved to history with ID:", historyId);
      
      toast({
        title: "Saved to history",
        description: "This transcription has been saved to your history.",
      });
    } catch (error) {
      console.error("Error saving to history:", error);
      toast({
        title: "Error saving to history",
        description: "There was a problem saving this transcription.",
        variant: "destructive",
      });
    }
  };

  const processAudio = async (audioFile: File) => {
    try {
      // Add file size check at the beginning
      if (audioFile.size > 8 * 1024 * 1024) {
        showToastNotification({
          title: 'File Too Large',
          description: 'Files larger than 8MB may cause connection issues. Please record a shorter audio clip (less than 5 minutes) for better results.',
          variant: 'destructive'
        });
      }
      
      setIsProcessing(true);
      setProgress(10);
      setTranscription('');
      setKeyPoints(null);
      
      // Create form data for the API
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('language', language);
      
      console.log("Sending audio file to transcribe API:", audioFile.name, audioFile.size);
      
      // Step 1: Transcribe the audio with retry logic
      setProgress(30);
      
      // Implement retry logic
      const maxRetries = 3;
      let retryCount = 0;
      let transcribeData : any;
      
      while (retryCount < maxRetries) {
        try {
          const transcribeResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          if (!transcribeResponse.ok) {
            const errorData = await transcribeResponse.json();
            throw new Error(`Transcription failed: ${errorData.error || transcribeResponse.statusText}`);
          }
          
          transcribeData  = await transcribeResponse.json();
          console.log("Transcription received:", transcribeData);
          
          if (!transcribeData.transcription) {
            throw new Error("No transcription returned from API");
          }
          
          // Store the detected language if available
          if (transcribeData.language_code) {
            setDetectedLanguage(transcribeData.language_code);
            // Update the language selector to match the detected language
            if (language === 'auto') {
              setLanguage(transcribeData.language_code);
            }
          }
          
          // If we get here, the request was successful
          break;
        } catch (error) {
          retryCount++;
          console.log(`Transcription attempt ${retryCount} failed:`, error);
          
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      setTranscription(transcribeData.transcription);
      setProgress(60);
      
      // Step 2: Summarize the transcription
      const summarizeResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcribeData.transcription }),
      });
      
      if (!summarizeResponse.ok) {
        throw new Error('Failed to summarize transcription');
      }
      
      // Inside your processAudio function, after setting keyPoints
      const summarizeData = await summarizeResponse.json();
      setKeyPoints(summarizeData);
      setProgress(100);
      
      // Show success toast
      showToastNotification({
        title: 'Processing Complete',
        description: 'Your audio has been successfully transcribed and summarized.',
        variant: 'default'
      });
      
      // Wait for state updates to be processed before saving to history
      setTimeout(async () => {
        // Save to history if user is logged in
        if (session?.user?.id) {
          console.log("User is logged in, saving to history");
          console.log("Current transcription length:", transcription.length);
          console.log("Current keyPoints:", keyPoints);
          
          // Use the data directly from the API responses instead of state
          const historyData = {
            userId: session.user.id,
            transcription: transcribeData.transcription,
            summary: summarizeData,
            language: detectedLanguage || "unknown",
            title: transcribeData.transcription.split(" ").slice(0, 7).join(" ") + "..."
          };
          
          try {
            const historyId = await saveTranscriptionHistory(historyData);
            console.log("Saved to history with ID:", historyId);
            
            toast({
              title: "Saved to history",
              description: "This transcription has been saved to your history.",
            });
          } catch (error) {
            console.error("Error saving to history:", error);
            toast({
              title: "Error saving to history",
              description: "There was a problem saving this transcription.",
              variant: "destructive",
            });
          }
        } else {
          console.log("User is not logged in, skipping history save");
        }
      }, 500); // Small delay to ensure state updates have been processed
      
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Show detailed error toast
      let errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Add more helpful information for common errors
      if (errorMessage.includes('ECONNRESET') || errorMessage.includes('Connection')) {
        errorMessage += ' This may be due to network issues or API configuration. Please check your internet connection and API key.';
      }
      
      showToastNotification({
        title: 'Processing Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    // Same implementation as before
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Transcription Document',
          transcription: transcription,
          keyPoints: keyPoints,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const data = await response.json();
      
      // Create a link element to download the PDF
      const link = document.createElement('a');
      link.href = data.pdf;
      link.download = 'transcription.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToastNotification({
        title: 'PDF Generated',
        description: 'Your PDF has been successfully generated and downloaded.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      
      showToastNotification({
        title: 'PDF Generation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadMarkdown = () => {
    // Same implementation as before
    try {
      // Create markdown content
      let markdownContent = `# Transcription Document\n\n`;
      markdownContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
      
      // Add key points if available
      if (keyPoints && keyPoints.points && keyPoints.points.length > 0) {
        markdownContent += `## Key Points\n\n`;
        keyPoints.points.forEach((point: any, index: number) => {
          markdownContent += `${index + 1}. **${point.point}**\n`;
          if (point.details) {
            markdownContent += `   ${point.details}\n`;
          }
          markdownContent += '\n';
        });
      }
      
      // Add full transcription
      markdownContent += `## Full Transcription\n\n${transcription}\n`;
      
      // Create a blob from the markdown content
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a link to download the blob
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transcription.md';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToastNotification({
        title: 'Markdown Generated',
        description: 'Your Markdown file has been successfully generated and downloaded.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error downloading Markdown:', error);
      showToastNotification({
        title: 'Download Failed',
        description: 'Failed to generate Markdown document.',
        variant: 'destructive'
      });
    }
  };

  // Add these new functions for integrations
  // Update the handleNotionExport function
  const handleNotionExport = async () => {
    try {
      showToastNotification({
        title: 'Exporting to Notion',
        description: 'Preparing your transcription for Notion...',
        variant: 'default'
      });
      
      const response = await fetch('/api/export/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: transcription.split(" ").slice(0, 7).join(" ") + "...",
          transcription: transcription,
          keyPoints: keyPoints,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export to Notion');
      }
      
      const data = await response.json();
      
      // Check if this is a demo response
      const demoMessage = data.demoMode ? ' (Demo Mode)' : '';
      
      showToastNotification({
        title: `Exported to Notion${demoMessage}`,
        description: data.message || `Your transcription has been exported to Notion. ${data.url ? 'Click to view.' : ''}`,
        variant: 'default'
      });
      
      // If there's a URL to the Notion page, open it
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error exporting to Notion:', error);
      showToastNotification({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export to Notion',
        variant: 'destructive'
      });
    }
  };
  
  // Update the handleGoogleDocsExport function similarly
  const handleGoogleDocsExport = async () => {
    try {
      showToastNotification({
        title: 'Exporting to Google Docs',
        description: 'Preparing your transcription for Google Docs...',
        variant: 'default'
      });
      
      const response = await fetch('/api/export/google-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: transcription.split(" ").slice(0, 7).join(" ") + "...",
          transcription: transcription,
          keyPoints: keyPoints,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export to Google Docs');
      }
      
      const data = await response.json();
      
      // Check if this is a demo response
      const demoMessage = data.demoMode ? ' (Demo Mode)' : '';
      
      showToastNotification({
        title: `Exported to Google Docs${demoMessage}`,
        description: data.message || `Your transcription has been exported to Google Docs. ${data.url ? 'Click to view.' : ''}`,
        variant: 'default'
      });
      
      // If there's a URL to the Google Doc, open it
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error exporting to Google Docs:', error);
      showToastNotification({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export to Google Docs',
        variant: 'destructive'
      });
    }
  };
  
  // Update the handleCRMExport function similarly
  const handleCRMExport = async (crmType: string) => {
    try {
      showToastNotification({
        title: `Exporting to ${crmType}`,
        description: `Preparing your transcription for ${crmType}...`,
        variant: 'default'
      });
      
      const response = await fetch(`/api/export/crm/${crmType.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: transcription.split(" ").slice(0, 7).join(" ") + "...",
          transcription: transcription,
          keyPoints: keyPoints,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to export to ${crmType}`);
      }
      
      const data = await response.json();
      
      // Check if this is a demo response
      const demoMessage = data.demoMode ? ' (Demo Mode)' : '';
      
      showToastNotification({
        title: `Exported to ${crmType}${demoMessage}`,
        description: data.message || `Your transcription has been exported to ${crmType}. ${data.url ? 'Click to view.' : ''}`,
        variant: 'default'
      });
      
      // If there's a URL to the CRM record, open it
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error(`Error exporting to ${crmType}:`, error);
      showToastNotification({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : `Failed to export to ${crmType}`,
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
                SpeechPoint App
              </h1>
              <p className="text-muted-foreground">
                Record or upload speech and convert it into professional documentation
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Tabs defaultValue="record" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="record" className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        Record
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="record" className="mt-6">
                      <VoiceRecorder onAudioComplete={handleRecordingComplete} />
                    </TabsContent>
                    
                    <TabsContent value="upload" className="mt-6">
                      <FileUpload onFileSelect={handleFileSelect} />
                    </TabsContent>
                  </Tabs>
                  
                </div>
                  <div className="w-full flex items-center">
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <SelectValue placeholder="Language" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="ml">Malayalam</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                        <SelectItem value="kn">Kannada</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="nl">Dutch</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing audio...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
                
                {file && !isProcessing && (
                  <div className="flex items-center p-3 bg-muted rounded-lg text-sm">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium mr-2">File:</span>
                    <span className="text-muted-foreground truncate">{file.name}</span>
                  </div>
                )}
              </div>
              
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <TranscriptionView 
                  transcription={transcription}
                  keyPoints={keyPoints}
                  isLoading={isProcessing}
                  onDownloadPDF={handleDownloadPDF}
                  onDownloadMarkdown={handleDownloadMarkdown}
                  // Add new props for integrations
                  onExportToNotion={handleNotionExport}
                  onExportToGoogleDocs={handleGoogleDocsExport}
                  onExportToCRM={handleCRMExport}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Add the Toaster component */}
      <Toaster />
    </>
  );
}