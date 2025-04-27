import { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ChevronLeft, 
  Menu, 
  HelpCircle, 
  Bell,
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type DataMapperLayoutProps = {
  children: ReactNode;
};

export default function DataMapperLayout({ children }: DataMapperLayoutProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  const getPageTitle = () => {
    switch (true) {
      case location === "/":
        return "Dashboard";
      case location === "/mappings":
        return "Mappings";
      case location.startsWith("/mappings/"):
        return location === "/mappings/new" ? "New Mapping" : "Edit Mapping";
      case location === "/history":
        return "Mapping History";
      case location === "/settings":
        return "Settings";
      default:
        return "Data Mapper";
    }
  };

  return (
    <>
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-primary text-white">
                  <Sidebar />
                </SheetContent>
              </Sheet>
              <h1 className="text-lg font-medium ml-3">Data Mapper</h1>
            </div>
            <div className="hidden md:block">
              <h2 className="text-xl font-medium">{getPageTitle()}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Button variant="ghost" className="flex items-center text-sm focus:outline-none">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>US</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 hidden md:block">User</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4">
          {children}
        </main>
      </div>
    </>
  );
}
