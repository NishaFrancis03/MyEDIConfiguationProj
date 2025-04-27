import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus } from "lucide-react";
import { parseFile, SupportedFileTypes } from "@/lib/file-parser";
import { Field } from "@shared/schema";

interface UploadFileProps {
  onFileLoaded: (fields: Field[]) => void;
  onContinue: () => void;
}

export default function UploadFile({ onFileLoaded, onContinue }: UploadFileProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<SupportedFileTypes>("SAP");
  const [encoding, setEncoding] = useState("UTF-8");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFile(event.dataTransfer.files[0]);
    }
  };
  
  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFile(event.target.files[0]);
    }
  };
  
  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    
    try {
      setIsLoading(true);
      const fields = await parseFile(selectedFile, fileType);
      onFileLoaded(fields);
      
      toast({
        title: "File loaded successfully",
        description: `${selectedFile.name} has been parsed. ${fields.length} top-level fields found.`,
      });
    } catch (error) {
      toast({
        title: "Error parsing file",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleContinue = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a file before continuing",
        variant: "destructive",
      });
      return;
    }
    
    onContinue();
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Source File Import</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-center text-muted-foreground mb-4">
                Drag and drop your source file here, or click to browse
                <br/>
                <span className="text-xs">Supported formats: JSON, CSV, XML, Excel, SAP IDocs</span>
              </p>
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading}
              >
                Browse Files
              </Button>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                onChange={handleFileInput}
                accept=".json,.csv,.xml,.xls,.xlsx,.txt"
              />
            </div>
            
            {file && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
              </div>
            )}
          </div>
          
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">File Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-type">File Type</Label>
                  <Select 
                    value={fileType} 
                    onValueChange={(value) => setFileType(value as SupportedFileTypes)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAP">SAP IDoc</SelectItem>
                      <SelectItem value="CSV">CSV</SelectItem>
                      <SelectItem value="JSON">JSON</SelectItem>
                      <SelectItem value="XML">XML</SelectItem>
                      <SelectItem value="EXCEL">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="encoding">Text Encoding</Label>
                  <Select 
                    value={encoding} 
                    onValueChange={setEncoding}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select encoding" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTF-8">UTF-8</SelectItem>
                      <SelectItem value="UTF-16">UTF-16</SelectItem>
                      <SelectItem value="ASCII">ASCII</SelectItem>
                      <SelectItem value="ISO-8859-1">ISO-8859-1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="target-format">Target Format</Label>
                  <Select defaultValue="JSON" disabled>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select target format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JSON">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2">Mapping Configuration</Label>
              <div className="flex items-center justify-between bg-muted rounded-md p-3">
                <span className="text-sm">Create new mapping</span>
                <Plus className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button variant="outline" className="mr-3">
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={!file || isLoading}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
