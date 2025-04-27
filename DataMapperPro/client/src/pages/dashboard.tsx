import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PlusCircle, ArrowLeftRight, Layers, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: mappings, isLoading } = useQuery({
    queryKey: ['/api/mappings'],
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/mappings/new">
          <Button className="flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Mapping
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mappings</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : mappings?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Created mapping configurations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Processing</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-24" /> : "2 days ago"}
            </div>
            <p className="text-xs text-muted-foreground">
              Last file processing activity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing History</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : 24}
            </div>
            <p className="text-xs text-muted-foreground">
              Total conversions performed
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent data mapping activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : mappings && mappings.length > 0 ? (
            <div className="space-y-4">
              {mappings.slice(0, 5).map((mapping: any) => (
                <div 
                  key={mapping.id} 
                  className="flex items-center justify-between p-4 border rounded-md"
                >
                  <div>
                    <h3 className="font-medium">{mapping.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {mapping.sourceFormat} to {mapping.targetFormat}
                    </p>
                  </div>
                  <Link href={`/mappings/${mapping.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent activity found</p>
              <Link href="/mappings/new">
                <Button className="mt-4">Create your first mapping</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
