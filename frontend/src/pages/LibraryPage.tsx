import { useState } from "react";
import { useLocation } from "wouter";
import { FileText, Plus, Search, Grid, List, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/home/ContentCard";
import type { ContentCard as ContentCardType } from "@/lib/data";

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  pages: number;
  progress: number;
}

const mockDocuments: Document[] = [
  { id: "1", name: "Quantum Physics Chapter 3", uploadedAt: "2 hours ago", pages: 24, progress: 75 },
  { id: "2", name: "Organic Chemistry Notes", uploadedAt: "1 day ago", pages: 45, progress: 40 },
  { id: "3", name: "Machine Learning Basics", uploadedAt: "3 days ago", pages: 60, progress: 90 },
  { id: "4", name: "World History - WW2", uploadedAt: "1 week ago", pages: 32, progress: 100 },
  { id: "5", name: "Calculus Integration", uploadedAt: "2 weeks ago", pages: 18, progress: 60 },
];

// Convert documents to ContentCard format for grid view
const documentsAsCards: ContentCardType[] = mockDocuments.map((doc) => ({
  id: doc.id,
  title: doc.name,
  description: `${doc.pages} pages • Uploaded ${doc.uploadedAt}`,
  image: "/placeholder.svg",
  category: "Document",
  progress: doc.progress,
  href: `/@me/content/${doc.id}`, // Corrected property name and value
}));

export default function LibraryPage() {
  const [, navigate] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = mockDocuments.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCards = documentsAsCards.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-1">Library</h1>
            <p className="small text-muted-foreground">{mockDocuments.length} documents</p>
          </div>
          <Button onClick={() => navigate("/mode/focus")}>
            <Plus className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Pages</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Progress</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Uploaded</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => navigate(`/@me/content/${doc.id}`)} // Corrected navigation
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{doc.pages}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-foreground rounded-full"
                            style={{ width: `${doc.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{doc.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{doc.uploadedAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCards.map((card) => (
              <ContentCard key={card.id} card={card} />
            ))}
          </div>
        )}

        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
}