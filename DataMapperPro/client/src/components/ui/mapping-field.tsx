import { useState, useRef, forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Field } from "@shared/schema";

interface MappingFieldProps extends HTMLAttributes<HTMLDivElement> {
  field: Field;
  isSource?: boolean;
  isMapped?: boolean;
  level?: number;
  onDragStart?: (field: Field) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (field: Field) => void;
}

const MappingField = forwardRef<HTMLDivElement, MappingFieldProps>(
  ({ 
    field, 
    isSource = false, 
    isMapped = false, 
    level = 0, 
    onDragStart, 
    onDragOver, 
    onDrop, 
    className, 
    ...props 
  }, ref) => {
    const [expanded, setExpanded] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    
    const hasChildren = field.children && field.children.length > 0;
    
    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData('application/json', JSON.stringify(field));
      if (onDragStart) {
        onDragStart(field);
      }
    };
    
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (onDragOver) {
        onDragOver(e);
      }
    };
    
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (onDrop) {
        onDrop(field);
      }
    };
    
    return (
      <div ref={ref} {...props}>
        <div 
          className={cn(
            "flex items-center text-sm py-1 px-2",
            hasChildren ? "cursor-pointer" : "mapping-field",
            isSource ? "source-field" : "target-field",
            isMapped && "mapped",
            className
          )}
          ref={itemRef}
          draggable={!hasChildren}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => hasChildren && setExpanded(!expanded)}
          style={{ paddingLeft: `${(level || 0) * 1.5 + 0.5}rem` }}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
            )
          ) : (
            <span className="w-5 mr-1"></span>
          )}
          
          <span className={hasChildren ? "font-medium" : ""}>
            {field.name}
          </span>
          {field.type && !hasChildren && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({field.type})
            </span>
          )}
        </div>
        
        {expanded && hasChildren && field.children && (
          <div className="pl-2">
            {field.children.map((child, index) => (
              <MappingField
                key={`${child.path}-${index}`}
                field={child}
                isSource={isSource}
                isMapped={isMapped}
                level={(level || 0) + 1}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

MappingField.displayName = "MappingField";

export { MappingField };
