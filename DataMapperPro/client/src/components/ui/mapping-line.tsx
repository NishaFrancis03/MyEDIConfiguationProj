import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MappingLineProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isActive?: boolean;
  className?: string;
}

export function MappingLine({
  sourceX,
  sourceY,
  targetX,
  targetY,
  isActive = false,
  className
}: MappingLineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const calculatePath = () => {
    // Adjust for a nicer curved path with control points
    const dx = targetX - sourceX;
    const midX = sourceX + dx / 2;
    
    return `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;
  };
  
  return (
    <svg 
      ref={svgRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      <path
        d={calculatePath()}
        fill="none"
        className={cn(
          "mapping-line",
          isActive && "active",
          className
        )}
      />
    </svg>
  );
}
