import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ui/theme-provider";
import { Save, RefreshCw, Database, FileText } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [defaultSourceFormat, setDefaultSourceFormat] = useState("SAP");
  const [autoSaveMappings, setAutoSaveMappings] = useState(true);
  const [defaultEncoding, setDefaultEncoding] = useState("UTF-8");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const handleSaveSettings = () => {
    // In a real app, this would save to a backend API
    localStorage.setItem("defaultSourceFormat", defaultSourceFormat);
    localStorage.setItem("autoSaveMappings", String(autoSaveMappings));
    localStorage.setItem("defaultEncoding", defaultEncoding);
    localStorage.setItem("showAdvancedOptions", String(showAdvancedOptions));
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };
  
  const handleReset = () => {
    setDefaultSourceFormat("SAP");
    setAutoSaveMappings(true);
    setDefaultEncoding("UTF-8");
    setShowAdvancedOptions(false);
    
    // Clear local storage settings
    localStorage.removeItem("defaultSourceFormat");
    localStorage.removeItem("autoSaveMappings");
    localStorage.removeItem("defaultEncoding");
    localStorage.removeItem("showAdvancedOptions");
    
    toast({
      title: "Settings reset",
      description: "Your preferences have been reset to defaults",
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how Data Mapper looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="advanced-options">Show Advanced Options</Label>
                <p className="text-sm text-muted-foreground">
                  Display additional configuration options
                </p>
              </div>
              <Switch
                id="advanced-options"
                checked={showAdvancedOptions}
                onCheckedChange={setShowAdvancedOptions}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>File Handling</CardTitle>
            <CardDescription>
              Configure default file processing settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-format">Default Source Format</Label>
              <Select 
                value={defaultSourceFormat} 
                onValueChange={setDefaultSourceFormat}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
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
            
            <div className="space-y-2">
              <Label htmlFor="encoding">Default Text Encoding</Label>
              <Select 
                value={defaultEncoding} 
                onValueChange={setDefaultEncoding}
              >
                <SelectTrigger>
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
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto-save Mappings</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save mapping changes
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSaveMappings}
                onCheckedChange={setAutoSaveMappings}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Manage your data and configuration storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Database Storage</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Manage how mapping configurations are stored in the database
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Optimize Storage
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Data Export/Import</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Export your configurations or import from another system
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Import
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button 
          onClick={handleSaveSettings}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
