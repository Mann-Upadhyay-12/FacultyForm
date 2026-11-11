import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/layout/ChatInterface";

interface PDFViewerProps {
  pdfUrl: string | null;
}

const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pdfUrl) {
      setLoading(false);
      return;
    };

    const loadPDF = async () => {
      setLoading(true);
      setError("");

      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error("PDF.js library is not loaded.");
        }
        
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        const pdf = await loadingTask.promise;

        setLoading(false);

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const canvas = document.createElement('canvas');
            const scale = 1.5;
            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.className = 'shadow-md rounded-md bg-white';

            const context = canvas.getContext('2d')!;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            containerRef.current.appendChild(canvas);
          }
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/10">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-destructive/10 p-4">
        <div className="text-center">
          <p className="text-destructive-foreground font-semibold mb-2">Error loading PDF</p>
          <p className="text-sm text-destructive-foreground/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-muted/20 p-8 flex flex-col items-center space-y-4"
    />
  );
};


const PlaceholderContent = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full text-muted-foreground p-8 text-center">
    <p>The "{title}" tool will be available here. Upload a document and interact with it to generate content.</p>
  </div>
);


export default function FocusMode() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load PDF.js script
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);

    const currentPdfUrl = pdfUrl;

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (currentPdfUrl) {
        URL.revokeObjectURL(currentPdfUrl);
      }
    };
  }, [pdfUrl]);


  const handleFileUpload = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    const url = URL.createObjectURL(file);
    if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(url);
    setFileName(file.name);
  }, [pdfUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleChatMessage = async (message: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return `This is a placeholder response to: "${message}". The real implementation would analyze the document.`;
  };

  const clearDocument = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setFileName("");
  };

  const UploadZone = () => (
    <div
      className={`flex-1 flex items-center justify-center p-8 transition-colors h-full ${
        isDragging ? 'bg-primary/10' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="text-center max-w-md">
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors ${
          isDragging ? 'bg-primary/20' : 'bg-muted/10'
        }`}>
          <Upload className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Upload a PDF document</h3>
        <p className="text-muted-foreground mb-6">
          Drag and drop your PDF here, or click to browse
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="px-8"
        >
          Choose File
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
        {/* Left Pane: PDF Viewer */}
        <div className="flex-[6] border-r border-border overflow-hidden h-full flex flex-col">
          {pdfUrl ? (
            <>
                <div className="bg-card border-b border-border px-4 py-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate" title={fileName}>{fileName}</p>
                        <Button variant="ghost" size="icon" onClick={clearDocument} className="h-8 w-8">
                        <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <PDFViewer pdfUrl={pdfUrl} />
            </>
          ) : (
            <UploadZone />
          )}
        </div>

      {/* Right Pane: Tools */}
      <div className="flex-[4] flex flex-col overflow-hidden h-full bg-card">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          <TabsList className="flex-shrink-0 w-full justify-start px-4 pt-2 bg-card border-b rounded-none">
            <TabsTrigger value="chat">Summary</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="flashcards">Flash Cards</TabsTrigger>
            <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 overflow-y-auto m-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <ChatInterface onSendMessage={handleChatMessage} />
          </TabsContent>
          
          <TabsContent value="notes" className="flex-1 overflow-y-auto m-0 p-6 focus-visible:ring-0 focus-visible:ring-offset-0">
             <PlaceholderContent title="Notes" />
          </TabsContent>

          <TabsContent value="quiz" className="flex-1 overflow-y-auto m-0 p-6 focus-visible:ring-0 focus-visible:ring-offset-0">
            <PlaceholderContent title="Quiz" />
          </TabsContent>

          <TabsContent value="flashcards" className="flex-1 overflow-y-auto m-0 p-6 focus-visible:ring-0 focus-visible:ring-offset-0">
            <PlaceholderContent title="Flash Cards" />
          </TabsContent>
          
          <TabsContent value="mindmap" className="flex-1 overflow-y-auto m-0 p-6 focus-visible:ring-0 focus-visible:ring-offset-0">
            <PlaceholderContent title="Mind Map" />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
