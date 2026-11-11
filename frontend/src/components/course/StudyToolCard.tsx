import { LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StudyToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  count?: number;
  countLabel?: string;
  href: string;
  variant?: "default" | "primary" | "success";
  className?: string;
}

export function StudyToolCard({
  title,
  description,
  icon: Icon,
  count,
  countLabel,
  href,
  variant = "default",
  className,
}: StudyToolCardProps) {
  const iconBgClasses = {
    default: "bg-muted",
    primary: "bg-primary/10",
    success: "bg-success/10",
  };

  const iconClasses = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
  };

  return (
    <Card
      className={cn(
        "p-6 bg-card border-border rounded-xl transition-all duration-200",
        "hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-lg", iconBgClasses[variant])}>
          <Icon className={cn("w-6 h-6", iconClasses[variant])} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="heading-3 text-card-foreground">
              {title}
            </h3>
            {count !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {count} {countLabel}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <Button asChild variant="ghost" className="px-0 mt-2 text-primary">
            <Link to={href}>Open →</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
