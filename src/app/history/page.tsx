"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserTranscriptionHistory } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Clock, ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
// Fix the toast import - it should be from the components directory
import { useToast } from "@/components/ui/use-toast";

// Import the necessary components at the top
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Add these imports at the top
import { Download, Share2, NotebookPen, FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // Add state for the dialog
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    async function fetchHistory() {
      if (session?.user) {
        try {
          setLoading(true);
          // Make sure we're using the correct user ID property
          const userId = session.user.id || session.user.email;
          console.log("Fetching history for user:", userId);
          
          try {
            const historyData = await getUserTranscriptionHistory(userId);
            console.log("History data received:", historyData);
            setHistory(historyData);
          } catch (error: any) {
            // Check if this is an index error
            if (error.message && error.message.includes("requires an index")) {
              console.error("Index error:", error.message);
              // Show a more user-friendly message
              setHistory([]);
              toast({
                title: "Database index being created",
                description: "Your history will be available soon. This is a one-time setup.",
                duration: 10000,
              });
            } else {
              throw error; // Re-throw if it's not an index error
            }
          }
        } catch (error) {
          console.error("Error fetching history:", error);
          toast({
            title: "Error loading history",
            description: "There was a problem loading your transcription history.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchHistory();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status]);

  // Generate a title from transcription if none exists
  const getTitle = (item: any) => {
    if (item.title) return item.title;
    
    const transcription = item.transcription || "";
    const words = transcription.split(" ");
    return words.length > 5 
      ? words.slice(0, 5).join(" ") + "..."
      : transcription.substring(0, 30) + (transcription.length > 30 ? "..." : "");
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen w-full justify-center flex-col">
        <Header />
        <div className="container ml-10 max-w-4xl py-8">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="icon" asChild className="mr-4">
              <Link href="/app">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Your Transcription History</h1>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-4 w-1/4" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Add this function to handle opening the dialog
  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  // Add these new functions for export functionality
  const handleDownloadPDF = async (item: any) => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: getTitle(item),
          transcription: item.transcription,
          keyPoints: item.summary,
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
      
      toast({
        title: 'PDF Generated',
        description: 'Your PDF has been successfully generated and downloaded.',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      
      toast({
        title: 'PDF Generation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadMarkdown = (item: any) => {
    try {
      // Create markdown content
      let markdownContent = `# ${getTitle(item)}\n\n`;
      markdownContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
      
      // Add key points if available
      if (item.summary && item.summary.points && item.summary.points.length > 0) {
        markdownContent += `## Key Points\n\n`;
        item.summary.points.forEach((point: any, index: number) => {
          markdownContent += `${index + 1}. **${point.point}**\n`;
          if (point.details) {
            markdownContent += `   ${point.details}\n`;
          }
          markdownContent += '\n';
        });
      }
      
      // Add full transcription
      markdownContent += `## Full Transcription\n\n${item.transcription}\n`;
      
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
      
      toast({
        title: 'Markdown Generated',
        description: 'Your Markdown file has been successfully generated and downloaded.',
      });
    } catch (error) {
      console.error('Error downloading Markdown:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to generate Markdown document.',
        variant: 'destructive',
      });
    }
  };

  const handleExportToNotion = async (item: any) => {
    try {
      toast({
        title: 'Exporting to Notion',
        description: 'Preparing your transcription for Notion...',
      });
      
      const response = await fetch('/api/export/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: getTitle(item),
          transcription: item.transcription,
          keyPoints: item.summary,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export to Notion');
      }
      
      const data = await response.json();
      
      // Check if this is a demo response
      const demoMessage = data.demoMode ? ' (Demo Mode)' : '';
      
      toast({
        title: `Exported to Notion${demoMessage}`,
        description: data.message || `Your transcription has been exported to Notion. ${data.url ? 'Click to view.' : ''}`,
      });
      
      // If there's a URL to the Notion page, open it
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error exporting to Notion:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export to Notion',
        variant: 'destructive',
      });
    }
  };

  const handleExportToGoogleDocs = async (item: any) => {
    try {
      toast({
        title: 'Exporting to Google Docs',
        description: 'Preparing your transcription for Google Docs...',
      });
      
      const response = await fetch('/api/export/google-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: getTitle(item),
          transcription: item.transcription,
          keyPoints: item.summary,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export to Google Docs');
      }
      
      const data = await response.json();
      
      // Check if this is a demo response
      const demoMessage = data.demoMode ? ' (Demo Mode)' : '';
      
      toast({
        title: `Exported to Google Docs${demoMessage}`,
        description: data.message || `Your transcription has been exported to Google Docs. ${data.url ? 'Click to view.' : ''}`,
      });
      
      // If there's a URL to the Google Doc, open it
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error exporting to Google Docs:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export to Google Docs',
        variant: 'destructive',
      });
    }
  };

  const handleExportToCRM = async (item: any, crmType: string) => {
    try {
      toast({
        title: `Exporting to ${crmType}`,
        description: `Preparing your transcription for ${crmType}...`,
      });
      
      const response = await fetch(`/api/export/crm/${crmType.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: getTitle(item),
          transcription: item.transcription,
          keyPoints: item.summary,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to export to ${crmType}`);
      }
      
      const data = await response.json();
      
      // Check if this is a demo response
      const demoMessage = data.demoMode ? ' (Demo Mode)' : '';
      
      toast({
        title: `Exported to ${crmType}${demoMessage}`,
        description: data.message || `Your transcription has been exported to ${crmType}. ${data.url ? 'Click to view.' : ''}`,
      });
      
      // If there's a URL to the CRM record, open it
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error(`Error exporting to ${crmType}:`, error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : `Failed to export to ${crmType}`,
        variant: 'destructive',
      });
    }
  };

  {!session ? (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">Please sign in</h3>
      <p className="text-muted-foreground mb-6">
        You need to be signed in to view your transcription history.
      </p>
      <Button asChild>
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    </div>
  ) : loading ? (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-1/4" />
          </CardFooter>
        </Card>
      ))}
    </div>
  ) : history.length > 0 ? (
    <div className="space-y-4">
      {history.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{getTitle(item)}</CardTitle>
            <CardDescription className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })}
              {item.language && (
                <span className="ml-4 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                  {item.language}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="line-clamp-3 text-sm text-muted-foreground mb-4">
              {item.transcription}
            </div>
            {item.summary?.points && item.summary.points.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Key Points:</h4>
                <ul className="text-sm space-y-1">
                  {item.summary.points.slice(0, 2).map((point: any, i: number) => (
                    <li key={i} className="flex items-start">
                      <FileText className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                      <span>{point.point}</span>
                    </li>
                  ))}
                  {item.summary.points.length > 2 && (
                    <li className="text-xs text-muted-foreground">
                      + {item.summary.points.length - 2} more points
                    </li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewDetails(item)}
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">No transcriptions yet</h3>
      <p className="text-muted-foreground mb-6">
        Your transcription history will appear here once you create some.
      </p>
      <Button asChild>
        <Link href="/app">Create a Transcription</Link>
      </Button>
    </div>
  )}
  {/* Update the Dialog component */}
  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    {selectedItem && (
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{getTitle(selectedItem)}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatDistanceToNow(selectedItem.createdAt.toDate(), { addSuffix: true })}
            {selectedItem.language && (
              <span className="ml-2 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                {selectedItem.language}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {/* Add export buttons at the top */}
        <div className="flex justify-end gap-2 mb-4">
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
              <DropdownMenuItem onClick={() => handleDownloadPDF(selectedItem)}>
                <FileText className="h-4 w-4 mr-2" />
                PDF Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadMarkdown(selectedItem)}>
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
              <DropdownMenuItem onClick={() => handleExportToNotion(selectedItem)}>
                <NotebookPen className="h-4 w-4 mr-2" />
                Export to Notion
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportToGoogleDocs(selectedItem)}>
                <FileText className="h-4 w-4 mr-2" />
                Export to Google Docs
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>CRM Tools</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExportToCRM(selectedItem, 'Salesforce')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Salesforce
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportToCRM(selectedItem, 'HubSpot')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to HubSpot
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportToCRM(selectedItem, 'Zoho')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Zoho CRM
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-6 py-4">
          {/* Key Points Section */}
          {selectedItem.summary?.points && selectedItem.summary.points.length > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg border">
              <h3 className="font-medium text-lg mb-3">Key Points</h3>
              <ul className="space-y-2">
                {selectedItem.summary.points.map((point: any, i: number) => (
                  <li key={i} className="flex items-start">
                    <FileText className="h-4 w-4 mr-2 mt-1 text-primary" />
                    <div>
                      <p className="font-medium">{point.point}</p>
                      {point.details && (
                        <p className="text-sm text-muted-foreground mt-1">{point.details}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Full Transcription Section */}
          <div>
            <h3 className="font-medium text-lg mb-3">Full Transcription</h3>
            <div className="bg-muted/30 p-4 rounded-lg border whitespace-pre-wrap">
              {selectedItem.transcription}
            </div>
          </div>
          
          {/* Additional Metadata if available */}
          {selectedItem.audioUrl && (
            <div>
              <h3 className="font-medium text-lg mb-3">Audio Recording</h3>
              <audio controls className="w-full">
                <source src={selectedItem.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => setDialogOpen(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    )}
  </Dialog>
// Fix the return statement structure
return (
  <div className="flex min-h-screen flex-col">
    <Header />
    <div className="container w-full py-8 px-20">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" asChild className="mr-4">
          <Link href="/app">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Your Transcription History</h1>
      </div>

      {!session ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Please sign in</h3>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view your transcription history.
          </p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{getTitle(item)}</CardTitle>
                <CardDescription className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })}
                  {item.language && (
                    <span className="ml-4 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                      {item.language}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="line-clamp-3 text-sm text-muted-foreground mb-4">
                  {item.transcription}
                </div>
                {item.summary?.points && item.summary.points.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Key Points:</h4>
                    <ul className="text-sm space-y-1">
                      {item.summary.points.slice(0, 2).map((point: any, i: number) => (
                        <li key={i} className="flex items-start">
                          <FileText className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                          <span>{point.point}</span>
                        </li>
                      ))}
                      {item.summary.points.length > 2 && (
                        <li className="text-xs text-muted-foreground">
                          + {item.summary.points.length - 2} more points
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(item)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No transcriptions yet</h3>
          <p className="text-muted-foreground mb-6">
            Your transcription history will appear here once you create some.
          </p>
          <Button asChild>
            <Link href="/app">Create a Transcription</Link>
          </Button>
        </div>
      )}
      
      {/* Update the Dialog component */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedItem && (
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{getTitle(selectedItem)}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(selectedItem.createdAt.toDate(), { addSuffix: true })}
                {selectedItem.language && (
                  <span className="ml-2 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                    {selectedItem.language}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {/* Add export buttons at the top */}
            <div className="flex justify-end gap-2 mb-4">
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
                  <DropdownMenuItem onClick={() => handleDownloadPDF(selectedItem)}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadMarkdown(selectedItem)}>
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
                  <DropdownMenuItem onClick={() => handleExportToNotion(selectedItem)}>
                    <NotebookPen className="h-4 w-4 mr-2" />
                    Export to Notion
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportToGoogleDocs(selectedItem)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export to Google Docs
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>CRM Tools</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleExportToCRM(selectedItem, 'Salesforce')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export to Salesforce
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportToCRM(selectedItem, 'HubSpot')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export to HubSpot
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportToCRM(selectedItem, 'Zoho')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export to Zoho CRM
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-6 py-4">
              {/* Key Points Section */}
              {selectedItem.summary?.points && selectedItem.summary.points.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <h3 className="font-medium text-lg mb-3">Key Points</h3>
                  <ul className="space-y-2">
                    {selectedItem.summary.points.map((point: any, i: number) => (
                      <li key={i} className="flex items-start">
                        <FileText className="h-4 w-4 mr-2 mt-1 text-primary" />
                        <div>
                          <p className="font-medium">{point.point}</p>
                          {point.details && (
                            <p className="text-sm text-muted-foreground mt-1">{point.details}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Full Transcription Section */}
              <div>
                <h3 className="font-medium text-lg mb-3">Full Transcription</h3>
                <div className="bg-muted/30 p-4 rounded-lg border whitespace-pre-wrap">
                  {selectedItem.transcription}
                </div>
              </div>
              
              {/* Additional Metadata if available */}
              {selectedItem.audioUrl && (
                <div>
                  <h3 className="font-medium text-lg mb-3">Audio Recording</h3>
                  <audio controls className="w-full">
                    <source src={selectedItem.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  </div>
);
}