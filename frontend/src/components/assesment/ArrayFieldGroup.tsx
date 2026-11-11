
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface ArrayFieldGroupProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
  addLabel: string;
  itemLabel: string;
  minItems?: number;
}

export function ArrayFieldGroup<T>({
  items,
  onAdd,
  onRemove,
  renderItem,
  addLabel,
  itemLabel,
  minItems = 1
}: ArrayFieldGroupProps<T>) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="entry-card animate-fade-in">
          <div className="entry-card-header">
            <h4 className="text-base font-medium font-heading text-foreground">
              {itemLabel} {index + 1}
            </h4>
            {items.length > minItems && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {renderItem(item, index)}
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        className="w-full border-dashed border-2 hover:border-accent hover:bg-accent/5"
      >
        <Plus className="h-4 w-4 mr-2" />
        {addLabel}
      </Button>
    </div>
  );
}
