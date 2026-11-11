import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, Calendar } from "lucide-react";
import type { ContentCard as ContentCardType } from "@/lib/data";
import { Link } from "wouter";

interface ContentCardProps {
  card: ContentCardType;
  variant?: "featured" | "standard" | "compact";
}

export function ContentCard({ card, variant = "standard" }: ContentCardProps) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const progressValue = card.progress || 0;
  const progressPercent = `${progressValue}%`;

  return (
    <Link to={card.href} className="group block h-full" data-testid={`link-card-${card.id}`}>
      <Card className="h-full overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-xl hover:border-border transition-all duration-300 hover:-translate-y-1">
        {/* Image Container */}
        <div
          className={`relative overflow-hidden bg-muted ${
            isFeatured ? "aspect-video" : isCompact ? "aspect-square" : "aspect-[4/3]"
          }`}
        >
          <img
            src={card.image}
            alt={card.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Category Badge on Image */}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground border-0 shadow-md"
            >
              {card.category}
            </Badge>
          </div>
          {/* Quick Action Button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 rounded-full bg-background/90 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors shadow-md">
              <BookOpen className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className={`p-5 ${isCompact ? "pb-4" : "pb-5"}`}>
          <h3
            className="heading-3 group-hover:text-primary transition-colors line-clamp-2"
            data-testid={`text-card-title-${card.id}`}
          >
            {card.title}
          </h3>
          {/* Description (only for featured and standard) */}
          {!isCompact && card.description && (
            <p className="body mt-2 text-muted-foreground line-clamp-2">
              {card.description}
            </p>
          )}
          {/* Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {card.date && (
              <div className="flex items-center gap-1" data-testid={`text-date-${card.id}`}>
                <Calendar className="h-3.5 w-3.5" />
                <span>{card.date}</span>
              </div>
            )}
            {card.readTime && (
              <div className="flex items-center gap-1" data-testid={`text-readtime-${card.id}`}>
                <Clock className="h-3.5 w-3.5" />
                <span>{card.readTime}</span>
              </div>
            )}
          </div>
          {/* Progress Bar (optional, show only if progress is defined and !isCompact) */}
          {!isCompact && card.progress && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-primary">{progressPercent}</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: progressPercent }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}