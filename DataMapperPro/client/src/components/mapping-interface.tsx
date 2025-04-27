import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MappingField } from "@/components/ui/mapping-field";
import { MappingLine } from "@/components/ui/mapping-line";
import { useToast } from "@/hooks/use-toast";
import { Plus, Wand2, Search, Filter, Trash } from "lucide-react";
import { TransformationDialog } from "@/components/transformation-dialog";
import { Field, FieldMapping } from "@shared/schema";

interface MappingInterfaceProps {
  sourceFields: Field[];
  onSaveMappingConfig: (mappings: FieldMapping[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function MappingInterface({ 
  sourceFields, 
  onSaveMappingConfig, 
  onBack,
  onNext 
}: MappingInterfaceProps) {
  const { toast } = useToast();
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedField, setDraggedField] = useState<Field | null>(null);
  const [isTransformDialogOpen, setIsTransformDialogOpen] = useState(false);
  const [currentMapping, setCurrentMapping] = useState<FieldMapping | null>(null);
  
  // Build a sample JSON structure for the target
  const [targetFields, setTargetFields] = useState<Field[]>([
    {
      name: "order",
      path: "order",
      type: "object",
      children: [
        { name: "clientId", path: "order.clientId", type: "string" },
        { name: "orderId", path: "order.orderId", type: "string" },
        { name: "orderDate", path: "order.orderDate", type: "string" },
        {
          name: "financial",
          path: "order.financial",
          type: "object",
          children: [
            { name: "currency", path: "order.financial.currency", type: "string" },
            { name: "exchangeRate", path: "order.financial.exchangeRate", type: "number" },
            { name: "total", path: "order.financial.total", type: "number" }
          ]
        },
        {
          name: "partner",
          path: "order.partner",
          type: "object",
          children: [
            { name: "id", path: "order.partner.id", type: "string" },
            { name: "type", path: "order.partner.type", type: "string" }
          ]
        }
      ]
    }
  ]);
  
  // For mapping visualization
  const sourcePanelRef = useRef<HTMLDivElement>(null);
  const targetPanelRef = useRef<HTMLDivElement>(null);
  
  // Filter fields based on search term
  const filterFields = (fields: Field[], term: string): Field[] => {
    if (!term) return fields;
    
    return fields.filter(field => {
      const match = field.name.toLowerCase().includes(term.toLowerCase());
      if (match) return true;
      
      if (field.children && field.children.length > 0) {
        field.children = filterFields(field.children, term);
        return field.children.length > 0;
      }
      
      return false;
    });
  };
  
  const filteredSourceFields = searchTerm ? filterFields([...sourceFields], searchTerm) : sourceFields;
  const filteredTargetFields = searchTerm ? filterFields([...targetFields], searchTerm) : targetFields;
  
  // Check if a field is mapped
  const isFieldMapped = (fieldPath: string, isSource: boolean): boolean => {
    return mappings.some(mapping => 
      isSource ? mapping.sourceField === fieldPath : mapping.targetField === fieldPath
    );
  };
  
  // Handle field drag start
  const handleDragStart = (field: Field) => {
    setDraggedField(field);
  };
  
  // Handle drop on target field
  const handleDrop = (targetField: Field) => {
    if (!draggedField) return;
    
    // Check if the source field is already mapped
    const existingMapping = mappings.find(m => m.sourceField === draggedField.path);
    if (existingMapping) {
      toast({
        title: "Field already mapped",
        description: `${draggedField.name} is already mapped to ${existingMapping.targetField}`,
        variant: "destructive"
      });
      return;
    }
    
    // Create new mapping
    const newMapping: FieldMapping = {
      sourceField: draggedField.path,
      targetField: targetField.path,
      transformation: {
        type: 'direct'
      }
    };
    
    setMappings([...mappings, newMapping]);
    setDraggedField(null);
    
    toast({
      title: "Fields mapped",
      description: `${draggedField.name} was mapped to ${targetField.name}`
    });
  };
  
  // Delete a mapping
  const deleteMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };
  
  // Edit a mapping's transformation
  const editTransformation = (mapping: FieldMapping) => {
    setCurrentMapping(mapping);
    setIsTransformDialogOpen(true);
  };
  
  // Save transformation from dialog
  const saveTransformation = (mapping: FieldMapping) => {
    if (!currentMapping) return;
    
    setMappings(mappings.map(m => 
      m.sourceField === currentMapping.sourceField && m.targetField === currentMapping.targetField
        ? mapping
        : m
    ));
    
    setIsTransformDialogOpen(false);
    setCurrentMapping(null);
  };
  
  const handleContinue = () => {
    if (mappings.length === 0) {
      toast({
        title: "No mappings defined",
        description: "Please create at least one field mapping before continuing",
        variant: "destructive"
      });
      return;
    }
    
    onSaveMappingConfig(mappings);
    onNext();
  };
  
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Field Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mapping Controls */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="flex space-x-2 mb-2 sm:mb-0">
              <Button 
                size="sm" 
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Mapping
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
              >
                <Wand2 className="h-4 w-4 mr-1" /> Auto Map
              </Button>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search fields..." 
                  className="pl-8 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Mapping Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Source Panel */}
            <div className="lg:col-span-2 border border-border rounded-md" ref={sourcePanelRef}>
              <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
                <h4 className="font-medium">Source Structure ({sourceFields[0]?.name || "File"})</h4>
                <span className="material-icons text-muted-foreground text-sm">expand_more</span>
              </div>
              <div className="h-96 overflow-y-auto p-2">
                {filteredSourceFields.map((field, index) => (
                  <MappingField
                    key={`source-${field.path}-${index}`}
                    field={field}
                    isSource={true}
                    isMapped={isFieldMapped(field.path, true)}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            </div>
            
            {/* Mapping Center Panel */}
            <div className="lg:col-span-1 flex items-center justify-center">
              <div className="bg-muted h-96 w-full rounded-md flex flex-col items-center justify-center p-4">
                <div className="text-center mb-4">
                  <svg className="w-8 h-8 mx-auto text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="12" x2="17" y2="12"></line>
                    <line x1="7" y1="8" x2="10" y2="8"></line>
                    <line x1="7" y1="16" x2="14" y2="16"></line>
                    <line x1="14" y1="8" x2="17" y2="12"></line>
                    <line x1="17" y1="12" x2="14" y2="16"></line>
                  </svg>
                  <p className="text-sm text-muted-foreground mt-2">Drag fields from source to target to create mappings</p>
                </div>
                <div className={`bg-white rounded-md p-3 mb-2 w-full text-center border ${mappings.length > 0 ? 'border-primary' : 'border-border'}`}>
                  <p className="text-sm font-medium">{mappings.length} Fields Mapped</p>
                </div>
                <div className="space-y-2 w-full max-h-40 overflow-y-auto">
                  {mappings.map((mapping, index) => (
                    <div key={`mapping-${index}`} className="bg-white rounded-md p-2 text-xs border border-border flex items-center justify-between">
                      <div>
                        <span className="font-medium">{mapping.sourceField.split('.').pop()}</span>
                        <span className="mx-2">→</span>
                        <span>{mapping.targetField.split('.').pop()}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-muted-foreground hover:text-primary"
                          onClick={() => editTransformation(mapping)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteMapping(index)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Target Panel */}
            <div className="lg:col-span-2 border border-border rounded-md" ref={targetPanelRef}>
              <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
                <h4 className="font-medium">Target Structure (JSON)</h4>
                <span className="material-icons text-muted-foreground text-sm">expand_more</span>
              </div>
              <div className="h-96 overflow-y-auto p-2">
                {filteredTargetFields.map((field, index) => (
                  <MappingField
                    key={`target-${field.path}-${index}`}
                    field={field}
                    isSource={false}
                    isMapped={isFieldMapped(field.path, false)}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Transformation Rules */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Field Transformation Rules</h4>
            <div className="border border-border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Source Field</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Field</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Transformation</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {mappings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-sm text-muted-foreground">
                        No mappings defined yet. Drag fields from source to target to create mappings.
                      </td>
                    </tr>
                  ) : (
                    mappings.map((mapping, index) => (
                      <tr key={`rule-${index}`}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {mapping.sourceField}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                          {mapping.targetField}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 text-xs bg-muted rounded-full">
                            {mapping.transformation.type === 'direct' ? 'Direct Copy' : mapping.transformation.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-primary hover:text-primary-dark"
                            onClick={() => editTransformation(mapping)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive/90 ml-2"
                            onClick={() => deleteMapping(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              variant="outline" 
              className="mr-3"
              onClick={onBack}
            >
              Back
            </Button>
            <Button onClick={handleContinue}>
              Preview Mapping
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <TransformationDialog 
        open={isTransformDialogOpen} 
        onOpenChange={setIsTransformDialogOpen}
        mapping={currentMapping}
        onSave={saveTransformation}
      />
    </>
  );
}
