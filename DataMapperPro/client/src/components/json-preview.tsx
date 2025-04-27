import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";
import { generateJsonOutput } from "@/lib/file-parser";
import { FieldMapping } from "@shared/schema";

interface JsonPreviewProps {
  mappings: FieldMapping[];
  sourceData: any;
  onBack: () => void;
  onSave: (jsonOutput: any) => void;
}

export default function JsonPreview({ 
  mappings, 
  sourceData, 
  onBack, 
  onSave 
}: JsonPreviewProps) {
  const { toast } = useToast();
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate JSON output based on the mappings
  const jsonOutput = generateJsonOutput(sourceData, mappings);
  const jsonString = JSON.stringify(jsonOutput, null, 2);
  const originalString = JSON.stringify(sourceData, null, 2);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        duration: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleSave = () => {
    onSave(jsonOutput);
  };
  
  // Function to create highlighted JSON
  const highlightJson = (json: string) => {
    return json
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/"([^"]+)"/g, '<span class="json-string">"$1"</span>')
      .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
      .replace(/\b(null)\b/g, '<span class="json-null">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="json-number">$1</span>');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Output Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between">
          <div>
            <Button 
              variant={!showOriginal ? "default" : "outline"} 
              size="sm" 
              className="mr-2"
              onClick={() => setShowOriginal(false)}
            >
              JSON
            </Button>
            <Button 
              variant={showOriginal ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowOriginal(true)}
            >
              Original
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </>
            )}
          </Button>
        </div>
        <div className="bg-neutral-800 text-white p-4 rounded-md overflow-x-auto">
          <pre 
            className="text-xs font-mono" 
            dangerouslySetInnerHTML={{ 
              __html: highlightJson(showOriginal ? originalString : jsonString) 
            }} 
          />
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline" 
            className="mr-3"
            onClick={onBack}
          >
            Back
          </Button>
          <Button 
            className="bg-success hover:bg-success/90"
            onClick={handleSave}
          >
            Save to Database
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
