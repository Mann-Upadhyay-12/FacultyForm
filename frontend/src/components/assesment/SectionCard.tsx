
import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  infoMessage?: string;
  className?: string;
}

export function SectionCard({
  title,
  description,
  children,
  defaultOpen = true,
  infoMessage,
  className = ''
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`form-section-card animate-fade-in ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
          >
            <div className="text-left">
              <h3 className="text-lg font-semibold font-heading text-foreground">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {isOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4">
          {infoMessage && (
            <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg mb-4">
              <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{infoMessage}</p>
            </div>
          )}
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
