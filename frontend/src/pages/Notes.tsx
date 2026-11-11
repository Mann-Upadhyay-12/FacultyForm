import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Save,
  Folder,
  FileText,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const mockNotes = [
  {
    id: 1,
    folder: 'Wave-Particle Duality',
    notes: [
      { id: 11, title: 'Introduction to Waves', preview: 'Light behaves as both wave and particle...' },
      { id: 12, title: 'Double-Slit Experiment', preview: 'Famous experiment demonstrating...' },
    ]
  },
  {
    id: 2,
    folder: 'Schrödinger Equation',
    notes: [
      { id: 21, title: 'Wave Function', preview: 'The wave function describes quantum state...' },
      { id: 22, title: 'Time-dependent Form', preview: 'Evolution of quantum systems...' },
    ]
  },
];

const aiSuggestions = [
  { id: 1, type: 'summary', text: 'Wave-particle duality is a fundamental concept where light exhibits both wave and particle properties.' },
  { id: 2, type: 'formula', text: 'E = hν (Energy equals Planck constant times frequency)' },
  { id: 3, type: 'insight', text: 'Key connection: The observer effect shows measurement affects quantum states.' },
];

export default function Notes() {
  const { courseId } = useParams();
  const [, navigate] = useLocation();
  const [selectedNote, setSelectedNote] = useState<number | null>(11);
  const [noteContent, setNoteContent] = useState('# Introduction to Waves\n\nLight behaves as both wave and particle in different experimental contexts...');
  const [saved, setSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copySuggestion = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => navigate('/@me/content')}
                  className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Library
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => navigate(`/@me/content/${courseId}`)}
                  className="cursor-pointer hover:text-primary transition-colors"
                >
                  Quantum Physics
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-primary">Notes</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div
          className="mb-8"
        >
          <h1 className="heading-1 mb-2">
            Smart Notes
          </h1>
          <p className="body text-muted-foreground">Your AI-powered knowledge base</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Note Tree */}
          <div
            className="lg:col-span-3"
          >
            <Card className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary" />
                    Folders
                  </span>
                  <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Accordion type="single" collapsible defaultValue="item-1">
                  {mockNotes.map((folder) => (
                    <AccordionItem key={folder.id} value={`item-${folder.id}`}>
                      <AccordionTrigger className="hover:text-primary transition-colors">
                        <div
                          className="flex items-center gap-2"
                        >
                          <Folder className="w-4 h-4" />
                          {folder.folder}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 ml-4">
                          {folder.notes.map((note) => (
                            <div
                              key={note.id}
                              onClick={() => setSelectedNote(note.id)}
                              className={`p-2 rounded-lg cursor-pointer transition-all ${selectedNote === note.id
                                  ? 'bg-primary/20 border-l-2 border-primary'
                                  : 'hover:bg-muted'}`}
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="text-sm truncate">{note.title}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Center - Editor */}
          <div
            className="lg:col-span-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Input 
                    defaultValue="Introduction to Waves"
                    className="heading-2 border-0 focus-visible:ring-0 bg-transparent"
                  />
                  <Button 
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saved ? 'Saved!' : 'Save'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="min-h-[600px] font-mono text-base resize-none"
                    placeholder="Start writing your notes..."
                  />
                  
                  {/* Autosave indicator */}
                  <div
                    className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                    Auto-saving...
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - AI Suggestions */}
          <div
            className="lg:col-span-3"
          >
            <Card className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div>
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="group"
                  >
                    <Card className="border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all cursor-pointer relative overflow-hidden">
                      <div className="p-4 relative z-10">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge 
                            variant="secondary"
                          >
                            <Lightbulb className="w-3 h-3 mr-1" />
                            {suggestion.type}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copySuggestion(suggestion.id, suggestion.text)}
                            className="h-6 w-6 p-0 hover:bg-primary/10"
                          >
                            {copiedId === suggestion.id ? (
                              <Check className="w-3 h-3 text-primary" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm leading-relaxed">{suggestion.text}</p>
                      </div>
                    </Card>
                  </div>
                ))}

                {/* Generate More Button */}
                <div>
                  <Button 
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
