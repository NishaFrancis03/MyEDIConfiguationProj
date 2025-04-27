import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldMapping } from "@shared/schema";
import { Code } from "lucide-react";

interface TransformationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping: FieldMapping | null;
  onSave: (mapping: FieldMapping) => void;
}

export function TransformationDialog({
  open,
  onOpenChange,
  mapping,
  onSave,
}: TransformationDialogProps) {
  const [transformationType, setTransformationType] = useState("direct");
  const [configScript, setConfigScript] = useState("");
  
  useEffect(() => {
    if (mapping) {
      setTransformationType(mapping.transformation.type);
      setConfigScript(mapping.transformation.config || "");
    }
  }, [mapping]);
  
  const handleSave = () => {
    if (!mapping) return;
    
    const updatedMapping: FieldMapping = {
      ...mapping,
      transformation: {
        type: transformationType as any,
        config: configScript || undefined
      }
    };
    
    onSave(updatedMapping);
  };
  
  const getDefaultScript = (type: string) => {
    switch (type) {
      case 'direct':
        return "// No transformation needed, direct copy\nreturn source;";
      case 'lookup':
        return "// Define lookup mappings\nconst lookupTable = {\n  'value1': 'mappedValue1',\n  'value2': 'mappedValue2'\n};\n\nreturn lookupTable[source] || source;";
      case 'stringManipulation':
        return "// String manipulation example\nif (typeof source === 'string') {\n  return source.toUpperCase();\n}\nreturn source;";
      case 'numberFormat':
        return "// Number formatting example\nconst num = Number(source);\nif (!isNaN(num)) {\n  return num.toFixed(2);\n}\nreturn source;";
      case 'dateFormat':
        return "// Date formatting example\ntry {\n  const date = new Date(source);\n  return date.toISOString();\n} catch (e) {\n  return source;\n}";
      case 'customScript':
        return "// Write custom transformation logic here\n// 'source' variable contains the source field value\n\n// Example: Convert to uppercase if string\nif (typeof source === 'string') {\n  return source.toUpperCase();\n}\n\nreturn source;";
      default:
        return "";
    }
  };
  
  const handleTypeChange = (type: string) => {
    setTransformationType(type);
    
    // If there's no existing config or the type changed, set a default script
    if (!configScript || (mapping?.transformation.type !== type)) {
      setConfigScript(getDefaultScript(type));
    }
  };
  
  if (!mapping) return null;
  
  const sourceFieldName = mapping.sourceField.split('.').pop() || '';
  const targetFieldName = mapping.targetField.split('.').pop() || '';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Field Transformation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2">Source Field</Label>
            <div className="flex items-center bg-muted px-3 py-2 rounded-md">
              <Code className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{sourceFieldName}</span>
              <span className="text-muted-foreground ml-2">{mapping.sourceField}</span>
            </div>
          </div>
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2">Target Field</Label>
            <div className="flex items-center bg-muted px-3 py-2 rounded-md">
              <Code className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{targetFieldName}</span>
              <span className="text-muted-foreground ml-2">{mapping.targetField}</span>
            </div>
          </div>
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2">Transformation Type</Label>
            <Select value={transformationType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select transformation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct Copy</SelectItem>
                <SelectItem value="lookup">Lookup</SelectItem>
                <SelectItem value="stringManipulation">String Manipulation</SelectItem>
                <SelectItem value="numberFormat">Number Format</SelectItem>
                <SelectItem value="dateFormat">Date Format</SelectItem>
                <SelectItem value="customScript">Custom Script</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2">Script/Configuration</Label>
            <Textarea 
              className="font-mono text-sm h-48"
              value={configScript}
              onChange={(e) => setConfigScript(e.target.value)}
              placeholder="Enter transformation script"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Transformation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
