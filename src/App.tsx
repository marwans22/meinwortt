import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreatePetition from "./pages/CreatePetition";
import PetitionDetail from "./pages/PetitionDetail";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import Kontakt from "./pages/Kontakt";
import Hilfe from "./pages/Hilfe";
import NotFound from "./pages/NotFound";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import CreateGroup from "./pages/CreateGroup";
import SavedPetitions from "./pages/SavedPetitions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="animate-fade-in min-h-screen">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create" element={<CreatePetition />} />
            <Route path="/petition/:id" element={<PetitionDetail />} />
            <Route path="/profile/mein" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/ueber" element={<About />} />
            <Route path="/so-funktionierts" element={<HowItWorks />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/agb" element={<AGB />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/hilfe" element={<Hilfe />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/create" element={<CreateGroup />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/saved" element={<SavedPetitions />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
