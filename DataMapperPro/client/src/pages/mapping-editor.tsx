import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Check, UploadCloud, FolderSync, Eye, Save, ChevronRight } from "lucide-react";
import UploadFile from "@/components/upload-file";
import MappingInterface from "@/components/mapping-interface";
import JsonPreview from "@/components/json-preview";
import { Field, FieldMapping, MappingConfig } from "@shared/schema";

// Sample SAP data structure for demo purposes
const SAMPLE_SOURCE_DATA = {
  ORDERS05: {
    EDI_DC40: {
      TABNAM: "EDI_DC40",
      MANDT: "100",
      DOCNUM: "4500000123"
    },
    E1EDK01: {
      CURCY: "USD",
      HWAER: "EUR",
      WKURS: "1.12"
    },
    E1EDK14: {
      QUALF: "001",
      ORGID: "CUST001"
    }
  }
};

export default function MappingEditor() {
  const params = useParams();
  const isEdit = !!params.id;
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Workflow steps
  const [currentStep, setCurrentStep] = useState(isEdit ? 2 : 1);
  const [mappingName, setMappingName] = useState("");
  const [mappingDescription, setMappingDescription] = useState("");
  const [sourceFormat, setSourceFormat] = useState("SAP");
  const [sourceFields, setSourceFields] = useState<Field[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [outputJson, setOutputJson] = useState<any>(null);
  
  // Fetch existing mapping if in edit mode
  const { data: mappingData, isLoading } = useQuery({
    queryKey: ['/api/mappings', params.id],
    enabled: isEdit,
  });
  
  // Load existing mapping data
  useEffect(() => {
    if (mappingData) {
      setMappingName(mappingData.name);
      setMappingDescription(mappingData.description || "");
      setSourceFormat(mappingData.sourceFormat);
      
      if (mappingData.mappingConfig) {
        const config = mappingData.mappingConfig as MappingConfig;
        setSourceFields(config.sourceFields || []);
        setFieldMappings(config.fieldMappings || []);
      }
    }
  }, [mappingData]);
  
  // Create/Update mapping mutation
  const saveMutation = useMutation({
    mutationFn: async (mappingData: any) => {
      if (isEdit) {
        return apiRequest('PUT', `/api/mappings/${params.id}`, mappingData);
      } else {
        return apiRequest('POST', '/api/mappings', mappingData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mappings'] });
      toast({
        title: isEdit ? "Mapping updated" : "Mapping created",
        description: isEdit 
          ? "Your mapping configuration has been updated." 
          : "Your new mapping configuration has been saved.",
      });
      navigate('/mappings');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save mapping: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle file upload completion
  const handleFileLoaded = (fields: Field[]) => {
    setSourceFields(fields);
  };
  
  // Handle mapping configuration save
  const handleSaveMappingConfig = (mappings: FieldMapping[]) => {
    setFieldMappings(mappings);
  };
  
  // Handle JSON output save
  const handleSaveJson = (jsonOutput: any) => {
    setOutputJson(jsonOutput);
    
    // Prepare mapping data
    const mappingConfig: MappingConfig = {
      sourceFields,
      targetFields: [], // In a real app, you'd save the target schema too
      fieldMappings,
    };
    
    const mappingData = {
      name: mappingName || "Untitled Mapping",
      description: mappingDescription,
      sourceFormat,
      targetFormat: "JSON",
      mappingConfig,
    };
    
    // Save mapping to database
    saveMutation.mutate(mappingData);
  };
  
  // Render workflow steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UploadFile 
            onFileLoaded={handleFileLoaded}
            onContinue={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <MappingInterface 
            sourceFields={sourceFields.length > 0 ? sourceFields : demoSourceFields()}
            onSaveMappingConfig={handleSaveMappingConfig}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        );
      case 3:
        return (
          <JsonPreview 
            mappings={fieldMappings}
            sourceData={SAMPLE_SOURCE_DATA} // In a real app, use actual source data
            onBack={() => setCurrentStep(2)}
            onSave={handleSaveJson}
          />
        );
      default:
        return null;
    }
  };
  
  // Generate demo source fields for design purposes
  const demoSourceFields = (): Field[] => [
    {
      name: "ORDERS05",
      path: "ORDERS05",
      type: "object",
      children: [
        {
          name: "EDI_DC40",
          path: "ORDERS05.EDI_DC40",
          type: "object",
          children: [
            { name: "TABNAM", path: "ORDERS05.EDI_DC40.TABNAM", type: "string" },
            { name: "MANDT", path: "ORDERS05.EDI_DC40.MANDT", type: "string" },
            { name: "DOCNUM", path: "ORDERS05.EDI_DC40.DOCNUM", type: "string" }
          ]
        },
        {
          name: "E1EDK01",
          path: "ORDERS05.E1EDK01",
          type: "object",
          children: [
            { name: "CURCY", path: "ORDERS05.E1EDK01.CURCY", type: "string" },
            { name: "HWAER", path: "ORDERS05.E1EDK01.HWAER", type: "string" },
            { name: "WKURS", path: "ORDERS05.E1EDK01.WKURS", type: "string" }
          ]
        },
        {
          name: "E1EDK14",
          path: "ORDERS05.E1EDK14",
          type: "object",
          children: [
            { name: "QUALF", path: "ORDERS05.E1EDK14.QUALF", type: "string" },
            { name: "ORGID", path: "ORDERS05.E1EDK14.ORGID", type: "string" }
          ]
        }
      ]
    }
  ];
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading mapping...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Mapping Info Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Mapping" : "New Mapping Configuration"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="mapping-name">Mapping Name</Label>
              <Input 
                id="mapping-name" 
                placeholder="Enter a name for this mapping"
                value={mappingName}
                onChange={(e) => setMappingName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="source-format">Source Format</Label>
              <Input 
                id="source-format" 
                value={sourceFormat}
                onChange={(e) => setSourceFormat(e.target.value)}
                disabled={isEdit}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="mapping-description">Description (Optional)</Label>
              <Textarea 
                id="mapping-description" 
                placeholder="Add a description for this mapping configuration"
                value={mappingDescription}
                onChange={(e) => setMappingDescription(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Workflow Stepper */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h3 className="text-lg font-medium mb-4 md:mb-0">Configuration Steps</h3>
            <div className="flex items-center w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 ${currentStep >= 1 ? 'bg-primary' : 'bg-muted'} text-white rounded-full flex items-center justify-center`}>
                      {currentStep > 1 ? <Check className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
                    </div>
                    <span className="text-xs mt-1 font-medium">Upload</span>
                  </div>
                  <div className={`h-1 w-12 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                </div>
              </div>
              <div className="relative flex-1 md:flex-initial">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'} ${currentStep < 2 ? 'text-muted-foreground' : 'text-white'} rounded-full flex items-center justify-center`}>
                      {currentStep > 2 ? <Check className="h-5 w-5" /> : <FolderSync className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${currentStep < 2 ? 'text-muted-foreground' : ''}`}>Configure</span>
                  </div>
                  <div className={`h-1 w-12 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
                </div>
              </div>
              <div className="relative flex-1 md:flex-initial">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'} ${currentStep < 3 ? 'text-muted-foreground' : 'text-white'} rounded-full flex items-center justify-center`}>
                      {currentStep > 3 ? <Check className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs mt-1 ${currentStep < 3 ? 'text-muted-foreground' : ''}`}>Preview</span>
                  </div>
                  <div className={`h-1 w-12 ${currentStep >= 4 ? 'bg-primary' : 'bg-muted'}`}></div>
                </div>
              </div>
              <div className="relative flex-1 md:flex-initial">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 ${currentStep >= 4 ? 'bg-primary' : 'bg-muted'} ${currentStep < 4 ? 'text-muted-foreground' : 'text-white'} rounded-full flex items-center justify-center`}>
                      <Save className="h-5 w-5" />
                    </div>
                    <span className={`text-xs mt-1 ${currentStep < 4 ? 'text-muted-foreground' : ''}`}>Save</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Step Content */}
      {renderStepContent()}
    </div>
  );
}
