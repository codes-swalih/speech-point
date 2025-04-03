import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Copy, FileText } from 'lucide-react';

// Add imports for the dropdown menu and additional icons
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { NotebookPen, FileSpreadsheet, Share2 } from 'lucide-react';

// Update the component props to include the new export functions
interface TranscriptionViewProps {
  transcription: string;
  keyPoints: any;
  isLoading: boolean;
  onDownloadPDF: () => void;
  onDownloadMarkdown: () => void;
  onExportToNotion?: () => void;
  onExportToGoogleDocs?: () => void;
  onExportToCRM?: (crmType: string) => void;
}

export function TranscriptionView({ 
  transcription, 
  keyPoints, 
  isLoading, 
  onDownloadPDF, 
  onDownloadMarkdown,
  onExportToNotion,
  onExportToGoogleDocs,
  onExportToCRM
}: TranscriptionViewProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Processing your audio...</p>
      </div>
    );
  }

  if (!transcription) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Transcription Yet</h3>
        <p className="text-muted-foreground max-w-md">
          Record or upload an audio file to see the transcription and key points here.
        </p>
      </div>
    );
  }

  // Add this in the return statement where you have the download buttons
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Transcription Results</h2>
        
        {transcription && (
          <div className="flex gap-2">
            {/* Download dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Download Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={onDownloadPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownloadMarkdown}>
                  <FileText className="h-4 w-4 mr-2" />
                  Markdown File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                
                {onExportToNotion && (
                  <DropdownMenuItem onClick={onExportToNotion}>
                    <NotebookPen className="h-4 w-4 mr-2" />
                    Export to Notion
                  </DropdownMenuItem>
                )}
                
                {onExportToGoogleDocs && (
                  <DropdownMenuItem onClick={onExportToGoogleDocs}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export to Google Docs
                  </DropdownMenuItem>
                )}
                
                {onExportToCRM && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>CRM Tools</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onExportToCRM('Salesforce')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export to Salesforce
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExportToCRM('HubSpot')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export to HubSpot
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExportToCRM('Zoho')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export to Zoho CRM
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      <div className="space-y-8">
        {keyPoints && keyPoints.points && keyPoints.points.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Key Points</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1 text-xs"
                onClick={() => copyToClipboard(keyPoints.points.map((p: any, i: number) => 
                  `${i+1}. ${p.point}${p.details ? `\n   ${p.details}` : ''}`
                ).join('\n'))}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
            
            <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
              {keyPoints.points.map((point: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{point.point}</p>
                    {point.details && (
                      <p className="text-sm text-muted-foreground mt-1">{point.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Full Transcription</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-1 text-xs"
              onClick={() => copyToClipboard(transcription)}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg border">
            <p className="whitespace-pre-wrap">{transcription}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={onDownloadPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download as PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={onDownloadMarkdown}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download as Markdown
          </Button>
        </div>
      </div>
    </div>
  );
}