import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle2 } from 'lucide-react';

interface ContentCardProps {
  card: {
    id: string;
    title: string;
    description: string;
    progress: number;
    topics: number;
    image?: string;
  };
  variant?: 'default' | 'featured';
  className?: string;
}

export function ContentCard({ card, variant = 'default', className = '' }: ContentCardProps) {
  return (
    <div className={className}>
      <Card className={`overflow-hidden group cursor-pointer border-2 transition-colors ${
        variant === 'featured' ? 'border-primary/30 shadow-md' : 'border-transparent hover:border-primary/50'
      }`}>
        {/* Image section */}
        {card.image && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            {card.progress === 100 && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            )}
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="group-hover:text-primary transition-colors">
              {card.title}
            </CardTitle>
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border-primary/20"
            >
              <BookOpen className="w-3 h-3 mr-1" />
              {card.topics}
            </Badge>
          </div>
          <CardDescription className="mt-2">{card.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-bold text-primary">
                {card.progress}%
              </span>
            </div>
            <Progress 
              value={card.progress} 
              className="h-2 bg-muted"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
