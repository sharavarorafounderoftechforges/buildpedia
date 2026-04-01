import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import SiteHeader from "@/components/SiteHeader";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import BuilderPage from "./pages/BuilderPage";
import SearchPage from "./pages/SearchPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import CreatePage from "./pages/CreatePage";
import EditPage from "./pages/EditPage";
import ProfilePage from "./pages/ProfilePage";
import DonationPage from "./pages/DonationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SiteHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/edit/:slug" element={<EditPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/donation" element={<DonationPage />} />
            <Route path="/:slug" element={<BuilderPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
