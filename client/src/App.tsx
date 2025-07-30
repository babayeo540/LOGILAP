import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Lapins from "@/pages/Lapins";
import Enclos from "@/pages/Enclos";
import Reproduction from "@/pages/Reproduction";
import Finances from "@/pages/Finances";
import Sante from "@/pages/Sante";
import Stocks from "@/pages/Stocks";
import Personnel from "@/pages/Personnel";
import Depenses from "@/pages/Depenses";
import Tresorerie from "@/pages/Tresorerie";
import Rapports from "@/pages/Rapports";
import Parametres from "@/pages/Parametres";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      {isLoading ? (
        <Route path="/" component={Landing} />
      ) : isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/lapins" component={Lapins} />
          <Route path="/enclos" component={Enclos} />
          <Route path="/reproduction" component={Reproduction} />
          <Route path="/finances" component={Finances} />
          <Route path="/sante" component={Sante} />
          <Route path="/stocks" component={Stocks} />
          <Route path="/personnel" component={Personnel} />
          <Route path="/depenses" component={Depenses} />
          <Route path="/tresorerie" component={Tresorerie} />
          <Route path="/rapports" component={Rapports} />
          <Route path="/parametres" component={Parametres} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
