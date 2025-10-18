import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatedPage } from "@/components/AnimatedPage";
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
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<AnimatedPage><Index /></AnimatedPage>} />
            <Route path="/auth" element={<AnimatedPage><Auth /></AnimatedPage>} />
            <Route path="/create" element={<AnimatedPage><CreatePetition /></AnimatedPage>} />
            <Route path="/petition/:id" element={<AnimatedPage><PetitionDetail /></AnimatedPage>} />
            <Route path="/profile/mein" element={<AnimatedPage><Profile /></AnimatedPage>} />
            <Route path="/profile/:id" element={<AnimatedPage><Profile /></AnimatedPage>} />
            <Route path="/admin" element={<AnimatedPage><Admin /></AnimatedPage>} />
            <Route path="/ueber" element={<AnimatedPage><About /></AnimatedPage>} />
            <Route path="/so-funktionierts" element={<AnimatedPage><HowItWorks /></AnimatedPage>} />
            <Route path="/impressum" element={<AnimatedPage><Impressum /></AnimatedPage>} />
            <Route path="/datenschutz" element={<AnimatedPage><Datenschutz /></AnimatedPage>} />
            <Route path="/agb" element={<AnimatedPage><AGB /></AnimatedPage>} />
            <Route path="/kontakt" element={<AnimatedPage><Kontakt /></AnimatedPage>} />
            <Route path="/hilfe" element={<AnimatedPage><Hilfe /></AnimatedPage>} />
            <Route path="/groups" element={<AnimatedPage><Groups /></AnimatedPage>} />
            <Route path="/groups/create" element={<AnimatedPage><CreateGroup /></AnimatedPage>} />
            <Route path="/groups/:id" element={<AnimatedPage><GroupDetail /></AnimatedPage>} />
            <Route path="/saved" element={<AnimatedPage><SavedPetitions /></AnimatedPage>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
