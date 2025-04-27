import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Check, X, FileJson, History } from "lucide-react";
import { MappingHistory } from "@shared/schema";

export default function MappingHistoryPage() {
  // In a real app, fetch history from API
  const { data: historyData, isLoading } = useQuery<MappingHistory[]>({
    queryKey: ['/api/mapping-history'],
    queryFn: async () => {
      // Mock data for demo
      return [
        {
          id: 1,
          mappingId: 1,
          sourceFileName: "orders_20230512.xml",
          targetFileName: "orders_20230512.json",
          processedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          success: true,
          errorMessage: null,
        },
        {
          id: 2,
          mappingId: 1,
          sourceFileName: "orders_20230511.xml",
          targetFileName: "orders_20230511.json",
          processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          success: true,
          errorMessage: null,
        },
        {
          id: 3,
          mappingId: 2,
          sourceFileName: "customers_20230510.csv",
          targetFileName: "customers_20230510.json",
          processedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          success: false,
          errorMessage: "Invalid source data format",
        }
      ];
    }
  });
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mapping History</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Processing History</CardTitle>
          <CardDescription>
            View all your data mapping conversion activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : historyData && historyData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source File</TableHead>
                  <TableHead>Target File</TableHead>
                  <TableHead>Processed At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.sourceFileName}</TableCell>
                    <TableCell>{entry.targetFileName}</TableCell>
                    <TableCell>{formatDateTime(entry.processedAt)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={entry.success ? "default" : "destructive"}
                        className="flex w-fit items-center gap-1"
                      >
                        {entry.success ? (
                          <>
                            <Check className="h-3 w-3" /> Success
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3" /> Failed
                          </>
                        )}
                      </Badge>
                      {!entry.success && entry.errorMessage && (
                        <p className="text-xs text-destructive mt-1">{entry.errorMessage}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No history found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your mapping conversion history will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
