import { ArrowRight, Filter, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "./ContentCard";
import type { ContentCard as ContentCardType } from "@/lib/data";
import { useState } from "react";
interface ContentSectionProps {
  title: string;
  description?: string;
  viewAllHref?: string;
  cards: ContentCardType[];
  columns?: 2 | 3 | 4 | 6;
  cardVariant?: "featured" | "standard" | "compact";
  showFilters?: boolean;
}
export function ContentSection({
  title,
  description,
  viewAllHref,
  cards,
  columns = 3,
  cardVariant = "standard",
  showFilters = false,
}: ContentSectionProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
 
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
    6: "md:grid-cols-3 lg:grid-cols-6",
  };
 
  return (
    <section className="py-12 md:py-16 animate-fade-in">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2
              className="heading-2"
              data-testid={`text-section-title-${title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {title}
            </h2>
            {description && (
              <p className="body text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
         
          {viewAllHref && (
            <Button
              variant="ghost"
              size="sm"
              className="group gap-1.5 text-muted-foreground hover:text-primary shrink-0"
              asChild
            >
              <a href={viewAllHref} data-testid={`link-view-all-${title.toLowerCase().replace(/\s+/g, "-")}`}>
                <span className="hidden sm:inline">View all</span>
                <span className="sm:hidden">All</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          )}
        </div>
       
        {/* Filters & View Options */}
        {showFilters && (
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
             
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recent" | "popular")}
                className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background hover:bg-secondary transition-colors"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
           
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
     
      {/* Content Grid */}
      <div className={`grid grid-cols-1 gap-6 ${viewMode === "grid" ? gridCols[columns] : ""}`}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ContentCard card={card} variant={cardVariant} />
          </div>
        ))}
      </div>
     
      {/* Load More */}
      {cards.length >= 6 && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
          >
            Load More
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}