import { BookOpen, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  id: string;
  title: string;
  chapters: number;
  completedChapters: number;
  subject?: string;
  className?: string;
}

export function CourseCard({
  id,
  title,
  chapters,
  completedChapters,
  subject,
  className,
}: CourseCardProps) {
  const progress = chapters > 0 ? (completedChapters / chapters) * 100 : 0;

  return (
    <Link to={`/@me/content/${id}`}>
      <Card
        className={cn(
          "group p-6 bg-card border-border rounded-xl transition-all duration-200",
          "hover:shadow-md hover:scale-[1.02] cursor-pointer",
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="heading-3 text-card-foreground truncate">
              {title}
            </h3>
            {subject && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {subject}
              </Badge>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {completedChapters} of {chapters} chapters
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ProgressRing progress={progress} size={44} strokeWidth={3} />
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
