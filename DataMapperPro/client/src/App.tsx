import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Mappings from "@/pages/mappings";
import MappingEditor from "@/pages/mapping-editor";
import MappingHistory from "@/pages/mapping-history";
import Settings from "@/pages/settings";
import DataMapperLayout from "@/components/DataMapperLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/mappings" component={Mappings} />
      <Route path="/mappings/new" component={MappingEditor} />
      <Route path="/mappings/:id" component={MappingEditor} />
      <Route path="/history" component={MappingHistory} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <DataMapperLayout>
          <Router />
        </DataMapperLayout>
      </div>
    </TooltipProvider>
  );
}

export default App;
