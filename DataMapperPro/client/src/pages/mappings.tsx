import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Mapping } from "@shared/schema";
import { PlusCircle, MoreVertical, Edit, Trash, ArrowUpDown, Search, ArrowLeftRight } from "lucide-react";

export default function Mappings() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: mappings, isLoading } = useQuery<Mapping[]>({
    queryKey: ['/api/mappings'],
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/mappings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mappings'] });
      toast({
        title: "Mapping deleted",
        description: "The mapping has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete mapping: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this mapping?")) {
      deleteMutation.mutate(id);
    }
  };
  
  // Filter mappings based on search term
  const filteredMappings = mappings?.filter(mapping => 
    mapping.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.sourceFormat.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Mappings</h1>
        <Link href="/mappings/new">
          <Button className="flex items-center w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Mapping
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Mapping Configurations</CardTitle>
          <CardDescription>
            Manage your saved data mapping configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search mappings..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : filteredMappings && filteredMappings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Source Format</TableHead>
                  <TableHead>Target Format</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-medium">{mapping.name}</TableCell>
                    <TableCell>{mapping.sourceFormat}</TableCell>
                    <TableCell>{mapping.targetFormat}</TableCell>
                    <TableCell>{formatDate(new Date(mapping.createdAt))}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/mappings/${mapping.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(mapping.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ArrowLeftRight className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No mappings found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search term" : "Create your first mapping configuration to get started"}
              </p>
              {!searchTerm && (
                <Link href="/mappings/new">
                  <Button className="mt-4">Create Mapping</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
